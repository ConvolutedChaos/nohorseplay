/* ============================================================
   IndexedDB helpers
============================================================ */
const VERSION = "E-Dog OS 3.1.9";
const DB_NAME = 'VirtualFS_v2';
const STORE = 'nodes';

const mountedCDs = [];

let dbPromise;

let driveLight = document.getElementById("driveLight");
let useDriveLight = localStorage.getItem('edog_drive_light') === 'true';

let _driveSoundTimer = null;

let _pendingOps = 0;          // count of in-flight IDB transactions
let _shuttingDown = false;    // true once shutdown/reboot begins
let _idleResolvers = [];      // callbacks waiting for _pendingOps === 0

let page = document.body;

let shouldIconsBeLight = true;

function openDB() {
    return new Promise((resolve, reject) => {
        const r = indexedDB.open(DB_NAME, 1);
        r.onupgradeneeded = e => {
            const db = e.target.result;
            const store = db.createObjectStore(STORE, { keyPath: 'id' });
            store.createIndex('parentId', 'parentId', { unique: false });
            store.add({ id: 'root', name: 'root', type: 'folder', parentId: null, createdAt: Date.now(), updatedAt: Date.now() });
        };
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
    });
}
function idbGet(key) {
    _opStart();
    return new Promise((res, rej) => {
        const req = dbPromise.transaction(STORE, 'readonly').objectStore(STORE).get(key);
        req.onsuccess = e => { _opEnd(); res(e.target.result); };
        req.onerror = e => { _opEnd(); rej(e.target.error); };
    });
}
function idbGetAll() {
    _opStart();
    return new Promise((res, rej) => {
        const req = dbPromise.transaction(STORE, 'readonly').objectStore(STORE).getAll();
        req.onsuccess = e => { _opEnd(); res(e.target.result); };
        req.onerror = e => { _opEnd(); rej(e.target.error); };
    });
}
function idbGetAllByIndex(indexName, value) {
    _opStart();
    return new Promise((res, rej) => {
        const store = dbPromise.transaction(STORE, 'readonly').objectStore(STORE);
        const idx = store.index(indexName);
        const r = idx.getAll(value);
        r.onsuccess = e => { _opEnd(); res(e.target.result); };
        r.onerror = e => { _opEnd(); rej(e.target.error); };
    });
}
function idbAdd(obj) {
    _opStart();
    return new Promise((res, rej) => {
        const req = dbPromise.transaction(STORE, 'readwrite').objectStore(STORE).add(obj);
        req.onsuccess = () => { _opEnd(); res(); };
        req.onerror = e => { _opEnd(); rej(e.target.error); };
    });
}
function idbPut(obj) {
    _opStart();
    return new Promise((res, rej) => {
        const req = dbPromise.transaction(STORE, 'readwrite').objectStore(STORE).put(obj);
        req.onsuccess = () => { _opEnd(); res(); };
        req.onerror = e => { _opEnd(); rej(e.target.error); };
    });
}
function idbDelete(key) {
    _opStart();
    return new Promise((res, rej) => {
        const req = dbPromise.transaction(STORE, 'readwrite').objectStore(STORE).delete(key);
        req.onsuccess = () => { _opEnd(); res(); };
        req.onerror = e => { _opEnd(); rej(e.target.error); };
    });
}

/* ============================================================
   System helpers
============================================================ */

/* ---- Shared shutdown/reboot overlay builder ---- */
function _buildShutdownOverlay(headingText) {
    const theme = localStorage.getItem('edog_theme') || 'dark';
    const isAero = theme === 'aero2010';

    const overlay = document.createElement('div');
    overlay.id = 'shutdown-overlay';
    overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 999999;
        background: ${isAero
            ? 'linear-gradient(135deg, #1a3a5c 0%, #0d1f33 60%, #0a1628 100%)'
            : '#0a0a0a'};
        color: #ccc;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        font-family: 'Segoe UI', system-ui, sans-serif;
        gap: 0;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
        display: flex; flex-direction: column;
        align-items: center; gap: 18px;
        ${isAero ? `
            background: linear-gradient(180deg,
                rgba(255,255,255,0.12) 0%,
                rgba(255,255,255,0.04) 100%);
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 10px;
            padding: 48px 56px;
            box-shadow:
                0 0 40px rgba(100,180,255,0.08),
                inset 0 1px 0 rgba(255,255,255,0.15);
            backdrop-filter: blur(12px);
        ` : `
            padding: 48px 56px;
        `}
    `;

    /* Spinner */
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 36px; height: 36px;
        border: 3px solid ${isAero ? 'rgba(120,180,255,0.2)' : 'rgba(255,255,255,0.1)'};
        border-top-color: ${isAero ? '#5ba3e6' : '#888'};
        border-radius: 50%;
        animation: _sdSpin 0.9s linear infinite;
    `;

    /* Heading */
    const heading = document.createElement('div');
    heading.textContent = headingText;
    heading.style.cssText = `
        font-size: 20px; font-weight: 500;
        color: ${isAero ? '#d4e8ff' : '#e0e0e0'};
        letter-spacing: 0.2px;
    `;

    /* Status message */
    const status = document.createElement('div');
    status.id = 'shutdown-status';
    status.textContent = 'Please wait while the system writes unsaved data to the disk.';
    status.style.cssText = `
        font-size: 12px;
        color: ${isAero ? 'rgba(180,210,255,0.6)' : '#666'};
        max-width: 320px; text-align: center;
        line-height: 1.5;
    `;

    /* Progress track */
    const track = document.createElement('div');
    track.style.cssText = `
        width: 280px; height: ${isAero ? '18px' : '4px'};
        background: ${isAero
            ? 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.2))'
            : 'rgba(255,255,255,0.08)'};
        border-radius: ${isAero ? '3px' : '2px'};
        overflow: hidden; margin-top: 4px;
        ${isAero ? `
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.4);
        ` : ''}
    `;

    const fill = document.createElement('div');
    fill.id = 'shutdown-progress';
    fill.style.cssText = `
        width: 0%; height: 100%;
        border-radius: inherit;
        transition: width 0.3s ease;
        ${isAero ? `
            background: linear-gradient(
                180deg,
                #6cbf5a 0%,
                #3a9a2c 40%,
                #2e8b22 60%,
                #3a9a2c 100%
            );
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.35),
                0 0 6px rgba(100,200,80,0.3);
        ` : `
            background: #888;
        `}
    `;

    track.appendChild(fill);

    card.appendChild(spinner);
    card.appendChild(heading);
    card.appendChild(status);
    card.appendChild(track);
    overlay.appendChild(card);

    /* Inject keyframes once */
    if (!document.getElementById('_sdSpinStyle')) {
        const style = document.createElement('style');
        style.id = '_sdSpinStyle';
        style.textContent = `@keyframes _sdSpin { to { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
    }

    document.body.appendChild(overlay);
    return { overlay, fill, status };
}

function _setProgress(fill, pct) {
    fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
}

async function shutdown() {
    if (_shuttingDown) return;
    _shuttingDown = true;

    const { overlay, fill, status } = _buildShutdownOverlay('Shutting down…');

    _setProgress(fill, 10);
    await new Promise(r => setTimeout(r, 400));

    // Wait for pending IDB ops
    if (_pendingOps > 0) {
        _setProgress(fill, 25);
        await waitForIdle(8000);
    }

    _setProgress(fill, 50);
    await new Promise(r => setTimeout(r, 300));

    // Close DB
    _setProgress(fill, 70);
    try {
        if (dbPromise) {
            dbPromise.close();
            dbPromise = null;
        }
    } catch (e) {
        console.warn('shutdown: DB close error:', e);
    }

    _setProgress(fill, 90);
    await new Promise(r => setTimeout(r, 400));

    _setProgress(fill, 100);
    await new Promise(r => setTimeout(r, 500));

    // Final "safe to close" screen
    const theme = localStorage.getItem('edog_theme') || 'dark';
    const isAero = theme === 'aero2010';

    document.body.innerHTML = '';
    document.body.style.cssText = `
        background: ${isAero
            ? 'linear-gradient(135deg, #1a3a5c 0%, #0d1f33 60%, #0a1628 100%)'
            : '#0a0a0a'};
        margin: 0; display: flex;
        align-items: center; justify-content: center;
        height: 100vh;
        font-family: 'Segoe UI', system-ui, sans-serif;
    `;
    document.body.innerHTML = `
        <div style="text-align:center;">
            <div style="font-size:20px; color:${isAero ? '#d4e8ff' : '#ccc'}; margin-bottom:8px;">
                It is now safe to close the tab.
            </div>
            <div style="font-size:12px; color:${isAero ? 'rgba(180,210,255,0.5)' : '#555'};">
                All data has been saved.
            </div>
        </div>
    `;
}

async function reboot() {
    if (_shuttingDown) return;
    _shuttingDown = true;

    const { overlay, fill, status } = _buildShutdownOverlay('Restarting…');

    _setProgress(fill, 10);
    await new Promise(r => setTimeout(r, 400));

    if (_pendingOps > 0) {
        _setProgress(fill, 25);
        await waitForIdle(8000);
    }

    _setProgress(fill, 50);
    await new Promise(r => setTimeout(r, 300));

    // Close DB
    _setProgress(fill, 70);
    try {
        if (dbPromise) {
            dbPromise.close();
            dbPromise = null;
        }
    } catch (e) {
        console.warn('reboot: DB close error:', e);
    }

    _setProgress(fill, 90);
    await new Promise(r => setTimeout(r, 400));

    _setProgress(fill, 100);
    await new Promise(r => setTimeout(r, 400));

    location.reload();
}

function showBSOD(errorCode, errorName) {
    errorCode = errorCode || '0x0000000A';
    errorName = errorName || 'IRQL_NOT_LESS_OR_EQUAL';

    const existing = document.getElementById('bsodOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.style.userSelect = "none";
    overlay.style.cursor = "none";
    overlay.id = 'bsodOverlay';

    const addr = '0x' + Math.floor(Math.random() * 0xFFFFFFFF)
        .toString(16).toUpperCase().padStart(8, '0');

    const p1 = '0x' + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(8, '0');
    const p2 = '0x' + Math.floor(Math.random() * 0xFF).toString(16).toUpperCase().padStart(8, '0');

    overlay.innerHTML = `
    <div class="bsod-inner">
      <div class="bsod-header"> E-Dog OS </div>
      <div class="bsod-body">
    A fatal exception ${errorCode} has occurred at ${addr} in
    DISK072512. The current application will be
    terminated.
    
      *  Press any key to terminate the current application.
      *  Press CTRL+ALT+DEL to restart your computer. You will
         lose any unsaved information in all applications.
    
    *** STOP: ${errorCode} (${p1}, ${p2}, 0x00000000, 0x00000000)
        ${errorName}

    Beginning dump of memory...
    Memory dump complete.

    Press any key to continue <span class="bsod-cursor"></span></div>
    </div>
    `;

    document.body.appendChild(overlay);

    function onKey() {
        document.removeEventListener('keydown', onKey);
        overlay.remove();
        page.style.background = "#000000";
        page.innerHTML = "";
        location.reload();
    }
    document.addEventListener('keydown', onKey);
}

function _opStart() {
    _pendingOps++;
    turnOnDriveLight();
}

function _opEnd() {
    turnOffDriveLight();
    _pendingOps = Math.max(0, _pendingOps - 1);
    if (_pendingOps === 0) {
        // Wake up anything waiting for idle
        for (const resolve of _idleResolvers) resolve();
        _idleResolvers = [];
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForIdle(timeoutMs = 5000) {
    if (_pendingOps === 0) return Promise.resolve();
    return new Promise(resolve => {
        _idleResolvers.push(resolve);
        setTimeout(resolve, timeoutMs); // safety net
    });
}

function turnOnDriveLight() {
    driveLight.style.backgroundColor = "#00ff00"
}

function turnOffDriveLight() {
    driveLight.style.backgroundColor = "#000000"
}

function showHiddenFiles() {
    return localStorage.getItem('edog_show_hidden') === 'true';
}

/* ============================================================
   External Media
============================================================ */

const _mountTable = [];
let _deviceCounter = { cdrom: 0, usb: 0, loop: 0 };
const _MOUNTS_KEY = 'edog_mounts';

function _saveMountsToStorage() {
    localStorage.setItem(_MOUNTS_KEY, JSON.stringify(_mountTable.map(m => ({
        device: m.device,
        mountPoint: m.mountPoint,
        label: m.label,
        fsType: m.fsType,
        readOnly: m.readOnly,
        source: m.source,
        icon: m.icon,
        mountedAt: m.mountedAt,
        capacity: m.capacity ?? null,
    }))));
}

async function _restoreMountsFromStorage() {
    let saved;
    try { saved = JSON.parse(localStorage.getItem(_MOUNTS_KEY) || '[]'); }
    catch { return; }
    for (const m of saved) {
        if (isMounted(m.mountPoint)) continue;
        // Skip if the mount point folder no longer exists (e.g. after a wipe)
        const node = await _fsResolve(m.mountPoint);
        if (!node) continue;
        // Bump device counter so future allocations don't collide
        const match = m.device.match(/^\/dev\/([a-z]+)(\d+)$/);
        if (match) {
            const [, type, num] = match;
            if ((_deviceCounter[type] ?? 0) <= parseInt(num))
                _deviceCounter[type] = parseInt(num) + 1;
        }
        _mountTable.push({ ...m });
    }
    if (_mountTable.length) {
        await _writeMtab();
        await _refreshAllMediaSidebars();
    }
}

/* ── helpers ─────────────────────────────────────────────── */

function _allocDevice(type) {
    const n = _deviceCounter[type] || 0;
    _deviceCounter[type] = n + 1;
    return `/dev/${type}${n}`;
}

function _sanitizeLabel(name) {
    // Strip extension, replace unsafe chars
    return name.replace(/\.(iso|zip|img)$/i, '')
        .replace(/[^a-zA-Z0-9_\-. ]/g, '_')
        .trim() || 'untitled';
}

function getMountTable() {
    return [..._mountTable];
}

function findMount(mountPoint) {
    return _mountTable.find(m => m.mountPoint === mountPoint) || null;
}

function findMountByDevice(device) {
    return _mountTable.find(m => m.device === device) || null;
}

function isMounted(mountPoint) {
    return _mountTable.some(m => m.mountPoint === mountPoint);
}

async function mount(opts = {}) {
    const label = opts.label || 'untitled';
    const fsType = opts.fsType || 'virtual';
    const icon = opts.icon || 'cd';
    const readOnly = opts.readOnly ?? (fsType === 'iso9660');
    const devType = opts.devType || 'cdrom';
    const source = opts.source || null;
    const files = opts.files || [];
    const capacity = opts.capacity ?? null;

    // Validate capacity against available storage
    if (capacity != null && navigator.storage?.estimate) {
        const { usage = 0, quota = 0 } = await navigator.storage.estimate();
        const free = Math.max(0, quota - usage);
        if (capacity > free) {
            spawnError(`Cannot mount "${label}": requested capacity ${formatBytes(capacity)} exceeds available space ${formatBytes(free)}.`);
            return null;
        }
    }

    const mountPoint = `/media/${label}`;

    // Already mounted?
    if (isMounted(mountPoint)) {
        console.warn(`mount: ${mountPoint} is already mounted`);
        return findMount(mountPoint);
    }

    // Only one disc (CD/DVD/ISO/ZIP image) in the drive at a time
    if (icon === 'cd' && _mountTable.some(m => m.icon === 'cd')) {
        spawnError('A disc is already in the drive. Eject it before inserting another.', 'info');
        return null;
    }

    const device = _allocDevice(devType);

    // Create the mount point and tag it with its icon type
    const mountNode = await createFolder(mountPoint);
    if (mountNode) {
        mountNode.mountIcon = icon;
        await idbPut(mountNode);
    }

    // Populate files
    for (const f of files) {
        const fullPath = `${mountPoint}/${f.path}`.replace(/\/+/g, '/');

        if (f.isDir) {
            await createFolder(fullPath);
        } else {
            // Ensure parent dirs exist, then create file
            const parts = f.path.split('/').filter(Boolean);
            if (parts.length > 1) {
                const parentPath = `${mountPoint}/${parts.slice(0, -1).join('/')}`;
                await createFolder(parentPath);
            }
            await createFile(fullPath, f.content || '');
        }
    }

    // Register in mount table
    const entry = {
        device,
        mountPoint,
        label,
        fsType,
        readOnly,
        mountedAt: Date.now(),
        source,
        icon,
        capacity,
    };
    _mountTable.push(entry);
    _saveMountsToStorage();

    // Write /etc/mtab so apps can read it
    await _writeMtab();

    // Notify all open file explorers
    await _refreshAllMediaSidebars();

    console.log(`mount: ${device} → ${mountPoint} (${fsType})`);
    return entry;
}

async function unmount(mountPointOrDevice) {
    let entry = findMount(mountPointOrDevice)
        || findMountByDevice(mountPointOrDevice);

    if (!entry) {
        console.warn(`unmount: ${mountPointOrDevice} is not mounted`);
        return false;
    }

    // Check if any windows are browsing inside this mount
    for (const windowId of Object.keys(windows)) {
        const win = windows[windowId];
        if (win?.currentPath?.startsWith(entry.mountPoint)) {
            // Navigate them out first
            await navigateToPath(windowId, '/media');
        }
    }

    // Recursively delete the mount point contents
    const node = await _fsResolve(entry.mountPoint);
    if (node) await recursiveDelete(node.id);

    // Remove from table
    const idx = _mountTable.indexOf(entry);
    if (idx !== -1) _mountTable.splice(idx, 1);
    _saveMountsToStorage();

    await _writeMtab();
    await _refreshAllMediaSidebars();
    await renderAllWindows();

    console.log(`unmount: ${entry.device} (${entry.mountPoint})`);
    return true;
}

async function eject(mountPointOrDevice) {
    const entry = findMount(mountPointOrDevice)
        || findMountByDevice(mountPointOrDevice);
    if (!entry) return false;

    await unmount(entry.mountPoint);

    // "Open the tray" — visual feedback
    if (typeof spawnNotification === 'function') {
        spawnNotification(`${entry.label} has been ejected.`, 'media');
    }

    return true;
}

async function _writeMtab() {
    const lines = _mountTable.map(m =>
        `${m.device} ${m.mountPoint} ${m.fsType} ${m.readOnly ? 'ro' : 'rw'} 0 0`
    );
    // Root filesystem is always there
    lines.unshift('virtualfs / virtualfs rw 0 0');

    const content = lines.join('\n') + '\n';
    await createFolder('/etc');

    const existing = await _fsResolve('/etc/mtab');
    if (existing) {
        existing.content = content;
        existing.size = new Blob([content]).size;
        existing.updatedAt = Date.now();
        await idbPut(existing);
    } else {
        await createFile('/etc/mtab', content);
    }
}

async function _refreshAllMediaSidebars() {
    for (const windowId of Object.keys(windows)) {
        const win = windows[windowId];
        if (win?.rebuildMediaSidebar) await win.rebuildMediaSidebar();
    }
}

async function mountZip(zipPath, label) {
    const file = await accessFile(zipPath);
    const data = file.contentType === 'binary' ? file.buffer : file.text;

    const zip = await JSZip.loadAsync(data);
    const files = [];

    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) {
            files.push({ path: relativePath, isDir: true });
        } else {
            // Detect binary vs text
            let content;
            const ext = relativePath.split('.').pop().toLowerCase();
            const binaryExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'svg',
                'mp3', 'wav', 'ogg', 'mp4', 'webm',
                'pdf', 'woff', 'woff2', 'ttf', 'otf'];

            if (binaryExts.includes(ext)) {
                content = await zipEntry.async('arraybuffer');
            } else {
                content = await zipEntry.async('string');
            }

            files.push({ path: relativePath, content });
        }
    }

    const volumeLabel = label || _sanitizeLabel(file.name);

    return mount({
        label: volumeLabel,
        fsType: 'zip',
        icon: 'cd',
        readOnly: true,
        devType: 'loop',
        source: zipPath,
        files,
    });
}

async function mountISO(isoPath, label) {
    const file = await accessFile(isoPath);
    const data = file.contentType === 'binary' ? file.buffer : file.text;

    let files = [];

    try {
        // Attempt to parse as zip (many virtual ISOs are zip-based)
        const zip = await JSZip.loadAsync(data);
        for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
            if (zipEntry.dir) {
                files.push({ path: relativePath, isDir: true });
            } else {
                const ext = relativePath.split('.').pop().toLowerCase();
                const binaryExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'mp3', 'wav', 'pdf'];
                const content = binaryExts.includes(ext)
                    ? await zipEntry.async('arraybuffer')
                    : await zipEntry.async('string');
                files.push({ path: relativePath, content });
            }
        }
    } catch {
        // Can't parse — mount as empty volume with the raw image inside
        files.push({ path: file.name, content: data });
    }

    const volumeLabel = label || _sanitizeLabel(file.name);

    return mount({
        label: volumeLabel,
        fsType: 'iso9660',
        icon: 'cd',
        readOnly: true,
        devType: 'cdrom',
        source: isoPath,
        files,
    });
}

async function insertCD(cdName, files = [], capacity = null) {
    return mount({
        label: cdName,
        fsType: 'iso9660',
        icon: 'cd',
        readOnly: true,
        devType: 'cdrom',
        capacity,
        files,
    });
}

async function removeCD(cdName) {
    return eject(`/media/${cdName}`);
}

async function insertUSB(label, files = [], capacity = null) {
    return mount({
        label,
        fsType: 'vfat',
        icon: 'usb',
        readOnly: false,
        devType: 'usb',
        capacity,
        files,
    });
}

async function removeUSB(label) {
    return eject(`/media/${label}`);
}

async function mountImageFile(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();

    if (ext === 'zip') {
        return mountZip(filePath);
    } else if (ext === 'iso') {
        return mountISO(filePath);
    } else {
        spawnError(`Cannot mount: unsupported image format ".${ext}"`);
    }
}

const mountCommands = {
    mount: (args) => {
        if (args.length === 0) {
            // No args = show mount table (like real `mount`)
            if (_mountTable.length === 0) return 'Nothing is mounted.\n';
            return _mountTable.map(m =>
                `${m.device} on ${m.mountPoint} type ${m.fsType} (${m.readOnly ? 'ro' : 'rw'})`
            ).join('\n') + '\n';
        }
        return 'Usage: mount (no args to list)\n       Use the file manager to mount images.\n';
    },

    umount: async (args) => {
        if (args.length === 0) return 'Usage: umount <mount_point>\n';
        const target = args[0];
        const ok = await unmount(target);
        return ok ? `Unmounted ${target}\n` : `umount: ${target}: not mounted\n`;
    },

    eject: async (args) => {
        if (args.length === 0) return 'Usage: eject <mount_point|device>\n';
        const ok = await eject(args[0]);
        return ok ? '' : `eject: ${args[0]}: not found\n`;
    },

    lsblk: () => {
        let out = 'NAME         SIZE        TYPE   MOUNTPOINT\n';
        out += 'virtualfs    10G         disk   /\n';
        for (const m of _mountTable) {
            const dev = m.device.replace('/dev/', '');
            const size = m.capacity != null ? formatBytes(m.capacity) : '---';
            out += `${dev.padEnd(13)}${size.padEnd(12)}${m.icon.padEnd(7)}${m.mountPoint}\n`;
        }
        return out;
    },

    df: () => {
        let out = 'Filesystem      Type       Size        Mounted on\n';
        out += 'virtualfs       virtualfs  ---         /\n';
        for (const m of _mountTable) {
            const size = m.capacity != null ? formatBytes(m.capacity) : '---';
            out += `${m.device.padEnd(16)}${m.fsType.padEnd(11)}${size.padEnd(12)}${m.mountPoint}\n`;
        }
        return out;
    },
};

/* ============================================================
   Username helper
============================================================ */

function getUsername() {
    return localStorage.getItem('edog_username') || 'e-dog';
}

function getComputername() {
    return localStorage.getItem('edog_computername') || 'edog-computer';
}

/* ============================================================
   Window manager state
============================================================ */

let zCounter = 20;
let focusedWindowId = null;
const windows = {};

/* ============================================================
   Clipboard (cut/copy/paste for files)
============================================================ */

let fsClipboard = { mode: null, ids: [] }; // mode: 'copy' | 'cut'

function _copyItems(ids) {
    // Remove cut styling from previous cut
    document.querySelectorAll('.item.cut-pending').forEach(el => el.classList.remove('cut-pending'));
    fsClipboard = { mode: 'copy', ids: [...ids] };
}

function _cutItems(ids) {
    document.querySelectorAll('.item.cut-pending').forEach(el => el.classList.remove('cut-pending'));
    fsClipboard = { mode: 'cut', ids: [...ids] };
    // Dim cut items
    ids.forEach(id => {
        document.querySelectorAll(`.item[data-id="${id}"]`).forEach(el => el.classList.add('cut-pending'));
    });
}

async function _deepCopyChildren(srcId, dstId, ctx) {
    const children = await idbGetAllByIndex('parentId', srcId);
    for (const child of children) {
        if (ctx?.prog?.cancelled) return;
        while (ctx?.prog?.paused) await new Promise(r => setTimeout(r, 80));
        const newChild = { ...child, id: crypto.randomUUID(), parentId: dstId, createdAt: Date.now(), updatedAt: Date.now() };
        await idbAdd(newChild);
        if (ctx) { ctx.done++; ctx.prog.update(ctx.done, ctx.total, child.name); }
        if (child.type === 'folder') await _deepCopyChildren(child.id, newChild.id, ctx);
    }
}

async function _pasteItems(targetFolderId) {
    if (!fsClipboard.mode || !fsClipboard.ids.length) return;
    const siblings = await idbGetAllByIndex('parentId', targetFolderId);
    const siblingNames = new Set(siblings.map(n => n.name));

    function uniqueName(name) {
        if (!siblingNames.has(name)) { siblingNames.add(name); return name; }
        const dot = name.lastIndexOf('.');
        const base = dot > 0 ? name.slice(0, dot) : name;
        const ext = dot > 0 ? name.slice(dot) : '';
        let n = 2, candidate;
        do { candidate = `${base} (${n++})${ext}`; } while (siblingNames.has(candidate));
        siblingNames.add(candidate);
        return candidate;
    }

    const isCopy = fsClipboard.mode === 'copy';

    // Pre-count total items so the progress bar can show a percentage.
    let total = fsClipboard.ids.length;
    if (isCopy) {
        for (const id of fsClipboard.ids) {
            const node = await idbGet(id);
            if (node?.type === 'folder') total += await _countFolderItems(node.id);
        }
    }

    const prog = total > 1 ? showFsProgress(isCopy ? 'Copying Files' : 'Moving Files') : null;
    const ctx = (prog && isCopy) ? { done: 0, total, prog } : null;
    let moveDone = 0;

    for (const id of fsClipboard.ids) {
        const node = await idbGet(id);
        if (!node) continue;
        if (fsClipboard.mode === 'cut') {
            if (node.parentId === targetFolderId) continue;
            if (node.type === 'folder' && await _isDescendant(node.id, targetFolderId)) continue;
            node.name = uniqueName(node.name);
            node.parentId = targetFolderId;
            node.updatedAt = Date.now();
            await idbPut(node);
            moveDone++;
            if (prog) prog.update(moveDone, total, node.name);
        } else {
            const newNode = { ...node, id: crypto.randomUUID(), name: uniqueName(node.name), parentId: targetFolderId, createdAt: Date.now(), updatedAt: Date.now() };
            await idbAdd(newNode);
            if (ctx) { ctx.done++; prog.update(ctx.done, ctx.total, node.name); }
            if (node.type === 'folder') await _deepCopyChildren(node.id, newNode.id, ctx);
        }
    }

    if (fsClipboard.mode === 'cut') {
        document.querySelectorAll('.item.cut-pending').forEach(el => el.classList.remove('cut-pending'));
        fsClipboard = { mode: null, ids: [] };
    }
    if (prog) prog.close();
    await renderAllWindows();
}

async function _moveItems(ids, targetFolderId) {
    const prog = ids.length > 1 ? showFsProgress('Moving Files') : null;
    let done = 0;
    for (const id of ids) {
        const node = await idbGet(id);
        if (!node || node.parentId === targetFolderId) continue;
        if (node.type === 'folder' && await _isDescendant(node.id, targetFolderId)) continue;
        node.parentId = targetFolderId;
        node.updatedAt = Date.now();
        await idbPut(node);
        done++;
        if (prog) prog.update(done, ids.length, node.name);
    }
    if (prog) prog.close();
    await renderAllWindows();
}

async function _isDescendant(ancestorId, nodeId) {
    // Returns true if nodeId is inside ancestorId (i.e. ancestor is parent-of-parent-of... nodeId)
    let current = nodeId;
    while (current) {
        if (current === ancestorId) return true;
        const node = await idbGet(current);
        if (!node) return false;
        current = node.parentId;
    }
    return false;
}

async function _deleteItems(ids) {
    const tmpId = await _getTmpId();
    const nodes = (await Promise.all(ids.map(id => idbGet(id)))).filter(Boolean);
    if (nodes.some(n => n.parentId === tmpId)) {
        // Already in trash — permanently delete
        spawnWarning(`Permanently delete ${nodes.length} item(s)?\n\nThis cannot be undone.`, [
            {
                label: 'Delete',
                style: 'danger',
                onClick: async () => {
                    let total = nodes.length;
                    for (const n of nodes) {
                        if (n.type === 'folder') total += await _countFolderItems(n.id);
                    }
                    const prog = total > 1 ? showFsProgress('Deleting Files') : null;
                    const ctx = prog ? { done: 0, total, prog } : null;
                    for (const n of nodes) {
                        if (n.type === 'folder') await recursiveDelete(n.id, ctx);
                        else await idbDelete(n.id);
                        if (ctx) { ctx.done++; prog.update(ctx.done, ctx.total, n.name); }
                    }
                    if (prog) prog.close();
                    await renderAllWindows();
                }
            },
            { label: 'Cancel' }
        ]);
    } else {
        // Move to Recycle Bin
        const prog = nodes.length > 2 ? showFsProgress('Moving to Recycle Bin') : null;
        let done = 0;
        for (const n of nodes) {
            await _trashNode(n, tmpId);
            done++;
            if (prog) prog.update(done, nodes.length, n.name);
        }
        if (prog) prog.close();
        await renderAllWindows();
    }
}

/* ============================================================
   Recycle Bin
============================================================ */

let _tmpFolderId = null;

async function _getTmpId() {
    if (_tmpFolderId) return _tmpFolderId;
    const rootChildren = await idbGetAllByIndex('parentId', 'root');
    const tmp = rootChildren.find(n => n.name === 'tmp' && n.type === 'folder');
    _tmpFolderId = tmp?.id ?? null;
    return _tmpFolderId;
}

async function _trashNode(node, tmpId) {
    node.trashedFrom = node.parentId;
    node.trashedAt = Date.now();
    node.parentId = tmpId;
    node.updatedAt = Date.now();
    await idbPut(node);
}

async function restoreItem(id) {
    const node = await idbGet(id);
    if (!node) return;
    const destId = node.trashedFrom
        ? ((await idbGet(node.trashedFrom)) ? node.trashedFrom : 'root')
        : 'root';
    node.parentId = destId;
    delete node.trashedFrom;
    delete node.trashedAt;
    node.updatedAt = Date.now();
    await idbPut(node);
    await renderAllWindows();
}

async function _restoreItems(ids) {
    for (const id of ids) {
        const node = await idbGet(id);
        if (!node) continue;
        const destId = node.trashedFrom
            ? ((await idbGet(node.trashedFrom)) ? node.trashedFrom : 'root')
            : 'root';
        node.parentId = destId;
        delete node.trashedFrom;
        delete node.trashedAt;
        node.updatedAt = Date.now();
        await idbPut(node);
    }
    await renderAllWindows();
}

async function emptyTrash() {
    const tmpId = await _getTmpId();
    if (!tmpId) return;
    const children = await idbGetAllByIndex('parentId', tmpId);
    if (!children.length) {
        spawnError('The Recycle Bin is already empty.', 'info');
        return;
    }
    spawnError(
        `Permanently delete all ${children.length} item(s) in the Recycle Bin? This cannot be undone.`,
        'warning',
        [
            {
                label: 'Empty Recycle Bin', style: 'danger',
                onClick: async () => {
                    let total = children.length;
                    for (const c of children) {
                        if (c.type === 'folder') total += await _countFolderItems(c.id);
                    }
                    const prog = total > 1 ? showFsProgress('Emptying Recycle Bin') : null;
                    const ctx = prog ? { done: 0, total, prog } : null;
                    for (const c of children) {
                        if (c.type === 'folder') await recursiveDelete(c.id, ctx);
                        else await idbDelete(c.id);
                        if (ctx) { ctx.done++; prog.update(ctx.done, ctx.total, c.name); }
                    }
                    if (prog) prog.close();
                    await renderAllWindows();
                }
            },
            { label: 'Cancel' },
        ]
    );
}

/* ============================================================
   File-operation progress dialog
============================================================ */

/**
 * Show a Windows 10/11-style progress dialog for filesystem operations.
 * Delayed by DELAY_MS so instant ops never flash.
 * Returns { update(done, total, fileName), close(), paused, cancelled }.
 */
function showFsProgress(title) {
    const DELAY_MS = 200;   // ms before showing (avoids flash on fast ops)
    const MIN_SHOW_MS = 500;   // minimum visible time once shown
    const GRAPH_PTS = 80;    // data points kept in the speed graph
    const SAMPLE_MS = 250;   // how often to push a new graph sample (ms)
    const EWA_A = 0.18;  // exponential smoothing factor for speed

    let windowId = null, el = null, canvas = null, ctx2d = null;
    let closed = false, shownAt = null, rafId = null;
    let _paused = false, _cancelled = false;

    // Speed tracking state
    let lastDone = 0, lastTime = Date.now();
    let smoothSpeed = 0;                         // EWA-smoothed speed (items/s)
    let graphData = new Array(GRAPH_PTS).fill(0);
    let peakSpeed = 1;                         // for Y-axis scale
    let lastSampleTs = 0;

    /* ── helpers ── */
    function _accent() {
        return getComputedStyle(document.documentElement)
            .getPropertyValue('--sidebar-item-active').trim() || '#3b82f6';
    }

    function _fmtSpeed(v) {
        if (v < 0.5) return '';
        if (v >= 1000) return (v / 1000).toFixed(1) + 'k items/s';
        return Math.round(v) + ' items/s';
    }

    function _fmtTime(sec) {
        if (!isFinite(sec) || sec <= 0) return '';
        if (sec < 4) return 'A few seconds remaining';
        if (sec < 90) return 'About ' + (Math.round(sec / 5) * 5) + ' seconds remaining';
        const m = Math.round(sec / 60);
        return 'About ' + m + ' minute' + (m !== 1 ? 's' : '') + ' remaining';
    }

    /* ── canvas graph ── */
    function _drawGraph() {
        if (!canvas || !ctx2d) return;
        const W = canvas.width, H = canvas.height;
        ctx2d.clearRect(0, 0, W, H);

        const accent = _accent();
        const n = graphData.length;
        const stepX = W / Math.max(n - 1, 1);
        const maxV = Math.max(peakSpeed, 1);

        function yOf(i) {
            return H - Math.max((graphData[i] / maxV) * (H - 8), 0) - 2;
        }

        // Build top-line path (area fill)
        ctx2d.beginPath();
        ctx2d.moveTo(0, yOf(0));
        for (let i = 1; i < n; i++) ctx2d.lineTo(i * stepX, yOf(i));
        ctx2d.lineTo((n - 1) * stepX, H);
        ctx2d.lineTo(0, H);
        ctx2d.closePath();
        ctx2d.globalAlpha = 0.22;
        ctx2d.fillStyle = accent;
        ctx2d.fill();
        ctx2d.globalAlpha = 1;

        // Stroke the top line
        ctx2d.beginPath();
        ctx2d.moveTo(0, yOf(0));
        for (let i = 1; i < n; i++) ctx2d.lineTo(i * stepX, yOf(i));
        ctx2d.strokeStyle = accent;
        ctx2d.lineWidth = 1.5;
        ctx2d.stroke();

        // Dot at the latest (right-most) point
        const lx = (n - 1) * stepX, ly = yOf(n - 1);
        ctx2d.beginPath();
        ctx2d.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx2d.fillStyle = accent;
        ctx2d.globalAlpha = 0.9;
        ctx2d.fill();
        ctx2d.globalAlpha = 1;
    }

    function _startRaf() {
        function frame(ts) {
            if (closed) return;
            rafId = requestAnimationFrame(frame);
            if (!_paused && ts - lastSampleTs >= SAMPLE_MS) {
                lastSampleTs = ts;
                graphData.push(smoothSpeed);
                graphData.shift();
                // Slowly decay peak so the graph re-scales when speed drops
                peakSpeed = Math.max(Math.max(...graphData), peakSpeed * 0.997);
            }
            _drawGraph();
        }
        rafId = requestAnimationFrame(frame);
    }

    /* ── window creation (delayed) ── */
    const timer = setTimeout(() => {
        if (closed) return;
        windowId = 'win_' + (++winCount);
        el = document.createElement('div');
        el.className = 'app-window focused';
        el.id = windowId;
        const w = 460;
        const left = Math.max(0, Math.round((window.innerWidth - w) / 2));
        const top = Math.max(0, Math.round((window.innerHeight - 280) / 2));
        el.style.cssText = `left:${left}px;top:${top}px;width:${w}px;height:auto;z-index:${++zCounter};`;
        el.innerHTML = `
            <div class="title-bar">
                <span class="title-bar-text">${_escHtml(title)}</span>
            </div>
            <div class="fs-progress-body">
                <div class="fs-progress-accent-bar"></div>
                <div class="fs-progress-header">
                    <span class="fs-progress-op-title">${_escHtml(title)}</span>
                    <div class="fs-progress-controls">
                        <button class="fs-progress-btn fsp-pause">Pause</button>
                        <button class="fs-progress-btn fsp-cancel">Cancel</button>
                    </div>
                </div>
                <div class="fs-progress-pct-row">
                    <span class="fs-progress-pct">0%</span>
                    <span class="fs-progress-pct-sub">complete</span>
                </div>
                <div class="fs-progress-bar-wrap">
                    <div class="fs-progress-fill indeterminate"></div>
                </div>
                <div class="fs-progress-graph-section">
                    <canvas class="fs-progress-canvas" height="80"></canvas>
                    <span class="fs-progress-speed-lbl"></span>
                </div>
                <div class="fs-progress-details">
                    <div class="fs-progress-filename">Preparing\u2026</div>
                    <div class="fs-progress-meta-row">
                        <span class="fs-progress-count"></span>
                        <span class="fs-progress-time"></span>
                    </div>
                </div>
            </div>`;

        document.getElementById('windowContainer').appendChild(el);
        windows[windowId] = { el, state: { type: 'progress' } };
        shownAt = Date.now();

        canvas = el.querySelector('.fs-progress-canvas');
        ctx2d = canvas.getContext('2d');
        canvas.width = w - 36; // match CSS margin: 18px each side

        el.querySelector('.fsp-pause').onclick = () => {
            _paused = !_paused;
            el.querySelector('.fsp-pause').textContent = _paused ? 'Resume' : 'Pause';
            el.querySelector('.fs-progress-op-title').textContent =
                (_paused ? 'Paused \u2014 ' : '') + title;
        };
        el.querySelector('.fsp-cancel').onclick = () => {
            _cancelled = true;
            obj.close();
        };

        // Draggable via title bar (skip button clicks)
        el.querySelector('.title-bar').addEventListener('mousedown', e => {
            if (e.target.closest('button')) return;
            startDrag(e, el);
        });
        // Bring to front on any click
        el.addEventListener('mousedown', () => focusWindow(windowId));

        // Taskbar button
        const tbBtn = document.createElement('button');
        tbBtn.className = 'win-btn active';
        tbBtn.dataset.winid = windowId;
        tbBtn.textContent = title;
        tbBtn.onclick = () => focusWindow(windowId);
        tbBtn.oncontextmenu = ev => {
            ev.preventDefault();
            buildMenu(ev.clientX, ev.clientY, [
                { label: 'Cancel', icon: 'close', action: () => { _cancelled = true; obj.close(); } },
            ]);
        };
        document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));
        windows[windowId].taskbarBtn = tbBtn;

        focusWindow(windowId);
        _startRaf();
    }, DELAY_MS);

    /* ── public API ── */
    const obj = {
        get paused() { return _paused; },
        get cancelled() { return _cancelled; },

        update(done, total, fileName) {
            if (closed || !el) return;

            // Compute EWA-smoothed speed
            const now = Date.now();
            const dt = (now - lastTime) / 1000;
            if (dt >= 0.05) {
                const delta = Math.max(0, done - lastDone);
                const inst = delta / dt;
                smoothSpeed = smoothSpeed < 0.001 ? inst
                    : smoothSpeed * (1 - EWA_A) + inst * EWA_A;
                lastDone = done;
                lastTime = now;
            }

            const pct = total > 0 ? Math.min(100, Math.round(done / total * 100)) : 0;
            const rem = Math.max(0, total - done);
            const eta = smoothSpeed > 0.5 ? rem / smoothSpeed : Infinity;

            const fill = el.querySelector('.fs-progress-fill');
            const pctEl = el.querySelector('.fs-progress-pct');
            const countEl = el.querySelector('.fs-progress-count');
            const fnEl = el.querySelector('.fs-progress-filename');
            const timeEl = el.querySelector('.fs-progress-time');
            const spdEl = el.querySelector('.fs-progress-speed-lbl');

            if (total > 0) {
                fill.classList.remove('indeterminate');
                fill.style.width = pct + '%';
                pctEl.textContent = pct + '%';
            }
            countEl.textContent = rem > 0
                ? rem.toLocaleString() + ' item' + (rem !== 1 ? 's' : '') + ' remaining'
                : '';
            timeEl.textContent = _fmtTime(eta);
            spdEl.textContent = _fmtSpeed(smoothSpeed);
            if (fileName) fnEl.textContent = fileName;
        },

        close() {
            closed = true;
            clearTimeout(timer);
            if (rafId) cancelAnimationFrame(rafId);
            if (!el) return;
            const elapsed = Date.now() - (shownAt || Date.now());
            const delay = Math.max(0, MIN_SHOW_MS - elapsed);
            setTimeout(() => closeWindow(windowId), delay);
        }
    };
    return obj;
}

/** Count total nodes inside a folder tree (excluding the root folder itself). */
async function _countFolderItems(folderId) {
    const children = await idbGetAllByIndex('parentId', folderId);
    let count = children.length;
    for (const c of children) {
        if (c.type === 'folder') count += await _countFolderItems(c.id);
    }
    return count;
}

function focusWindow(windowId) {
    if (focusedWindowId === windowId) return;
    document.querySelectorAll('.app-window').forEach(w => w.classList.remove('focused'));
    focusedWindowId = windowId;
    const win = windows[windowId];
    if (!win) return;
    win.el.classList.add('focused');
    win.el.style.zIndex = ++zCounter;
    document.querySelectorAll('#taskbar .win-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.winid === windowId);
    });
}

/* ============================================================
   Icon mapping
============================================================ */
const iconMap = {
    folder: ['folder.svg', 'folder.png'],
    defaultFile: ['text-x-generic.svg', 'text-x-generic.png'],
    extensions: {
        'png': ['image-x-generic.svg', 'image-x-generic.png'],
        'jpg': ['image-x-generic.svg', 'image-x-generic.png'],
        'jpeg': ['image-x-generic.svg', 'image-x-generic.png'],
        'gif': ['image-x-generic.svg', 'image-x-generic.png'],
        'bmp': ['image-x-generic.svg', 'image-x-generic.png'],
        'tiff': ['image-x-generic.svg', 'image-x-generic.png'],
        'ico': ['image-x-generic.svg', 'image-x-generic.png'],
        'webp': ['image-x-generic.svg', 'image-x-generic.png'],
        'txt': ['text-x-generic.svg', 'text-x-generic.png'],
        'md': ['text-x-generic.svg', 'text-x-generic.png'],
        'pdf': ['application-pdf.svg', 'application-pdf.png'],
        'zip': ['archive-x-generic.svg', 'archive-x-generic.png'],
        'rar': ['archive-x-generic.svg', 'archive-x-generic.png'],
        '7z': ['archive-x-generic.svg', 'archive-x-generic.png'],
        'tar': ['archive-x-generic.svg', 'archive-x-generic.png'],
        'gz': ['archive-x-generic.svg', 'archive-x-generic.png'],
        'mp3': ['audio-x-generic.svg', 'audio-x-generic.png'],
        'wav': ['audio-x-generic.svg', 'audio-x-generic.png'],
        'ogg': ['audio-x-generic.svg', 'audio-x-generic.png'],
        'flac': ['audio-x-generic.svg', 'audio-x-generic.png'],
        'aiff': ['audio-x-generic.svg', 'audio-x-generic.png'],
        'ac3': ['audio-x-generic.svg', 'audio-x-generic.png'],
        'mp4': ['video-x-generic.svg', 'video-x-generic.png'],
        'avi': ['video-x-generic.svg', 'video-x-generic.png'],
        'mov': ['video-x-generic.svg', 'video-x-generic.png'],
        'mkv': ['video-x-generic.svg', 'video-x-generic.png'],
        'webm': ['video-x-generic.svg', 'video-x-generic.png'],
        '3gp': ['video-x-generic.svg', 'video-x-generic.png'],
        'ogv': ['video-x-generic.svg', 'video-x-generic.png'],
        'exe': ['application-x-ms-dos-executable.svg', 'application-x-ms-dos-executable.png'],
        'msi': ['application-x-ms-dos-executable.svg', 'application-x-ms-dos-executable.png'],
        'html': ['html-x-generic.svg', 'html-x-generic.png'],
        'htm': ['html-x-generic.svg', 'html-x-generic.png'],
        'mhtml': ['html-x-generic.svg', 'html-x-generic.png'],
        'css': ['css-x-generic.svg', 'css-x-generic.png'],
        'js': ['application-javascript.svg', 'application-javascript.svg'],
        'json': ['script-x-generic.svg', 'script-x-generic.png'],
        'xml': ['text-x-generic.svg', 'text-x-generic.png'],
        'log': ['text-x-generic.svg', 'text-x-generic.png'],
        'svg': ['image-x-generic.svg', 'image-x-generic.png'],
        'avif': ['image-x-generic.svg', 'image-x-generic.png'],
        'app': ['application-x-executable.svg', 'application-x-executable.svg'],
        'edoc': ['text-richtext.svg', 'text-richtext.png'],
        'md': ['text-richtext.svg', 'text-richtext.png'],
        'readme': ['text-readme.svg', 'text-readme.png']
    }
};

function getIconCandidates(item) {
    if (item.type === 'folder') return Array.from(iconMap.folder);
    const ext = (item.name.split('.').pop() || '').toLowerCase();
    return Array.from(iconMap.extensions[ext] || iconMap.defaultFile);
}

const SVG_ICONS = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`,
    desktop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
    documents: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
    downloads: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    pictures: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    videos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
    templates: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
    public: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>`,
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
    root: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8h2M7 11h2M11 8h6M11 11h6"/></svg>`,
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
    cd: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>`,
    usb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="10" rx="2"/><line x1="9" y1="6" x2="9" y2="10"/><line x1="12" y1="6" x2="12" y2="10"/><line x1="15" y1="6" x2="15" y2="10"/><path d="M12 13v5"/><path d="M9 18h6"/></svg>`,
    eject: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 5 4 15 20 15"/><rect x="4" y="18" width="16" height="2" rx="1"/></svg>`
};

// FOLDER_ICON_MAP uses getUsername() so the user's home folder gets the correct icon
// regardless of what name they chose during setup.
function getFolderIconMap() {
    return {
        [getUsername()]: { slug: 'home', color: '#5ba4ff' },
        'Desktop': { slug: 'desktop', color: '#7dd3fc' },
        'Documents': { slug: 'documents', color: '#93c5fd' },
        'Downloads': { slug: 'downloads', color: '#6ee7b7' },
        'Pictures': { slug: 'pictures', color: '#f9a8d4' },
        'Music': { slug: 'music', color: '#c4b5fd' },
        'Videos': { slug: 'videos', color: '#fcd34d' },
        'Templates': { slug: 'templates', color: '#94a3b8' },
        'Public': { slug: 'public', color: '#67e8f9' },
        'home': { slug: 'users', color: '#86efac' },
        'tmp': { slug: 'trash', color: '#f87171' },
    };
}

async function getSpecialFolderIcon(name, slugOverride = null) {
    const meta = slugOverride
        ? { slug: slugOverride, color: slugOverride === 'usb' ? '#7dd3fc' : '#e2c97e' }
        : getFolderIconMap()[name];
    if (!meta) return null;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:var(--img-size);height:var(--img-size);display:flex;align-items:center;justify-content:center;';

    const slug = meta.slug;
    const img = await loadIconImg(
        `/usr/share/icons/128/folder-${slug}.svg`,
        `./icons/128/folder-${slug}.svg`
    );

    img.onerror = () => {
        img.remove();
        const fb = document.createElement('div');
        fb.style.cssText = `width:70%;height:70%;display:flex;align-items:center;justify-content:center;color:${meta.color};`;
        fb.innerHTML = SVG_ICONS[slug] || SVG_ICONS.folder;
        const svgEl = fb.querySelector('svg');
        if (svgEl) { svgEl.style.width = '100%'; svgEl.style.height = '100%'; }
        wrapper.appendChild(fb);
    };

    wrapper.appendChild(img);
    return wrapper;
}

async function buildSidebarItem(slug, label, color) {
    const li = document.createElement('li');
    const img = await loadIconImg(
        `/usr/share/icons/16/folder-${slug}.svg`,
        `./icons/16/folder-${slug}.svg`,
        'width:16px;height:16px;object-fit:contain;flex-shrink:0;'
    );
    img.onerror = () => {
        img.remove();
        const span = document.createElement('span');
        span.style.cssText = `color:${color};display:flex;align-items:center;flex-shrink:0;width:16px;height:16px;`;
        span.innerHTML = SVG_ICONS[slug] || SVG_ICONS.folder;
        const svgEl = span.querySelector('svg');
        if (svgEl) { svgEl.style.width = '16px'; svgEl.style.height = '16px'; }
        li.insertBefore(span, li.firstChild);
    };
    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    li.appendChild(img);
    li.appendChild(labelSpan);
    return li;
}

function wireUpSidebarIcons(containerEl) {
    containerEl.querySelectorAll('img.sidebar-icon').forEach(img => {
        img.onerror = () => {
            const slug = img.dataset.fallbackSvg;
            const color = img.dataset.fallbackColor;
            const span = document.createElement('span');
            span.style.cssText = `color:${color};display:flex;align-items:center;flex-shrink:0;width:16px;height:16px;`;
            span.innerHTML = SVG_ICONS[slug] || SVG_ICONS.folder;
            const svgEl = span.querySelector('svg');
            if (svgEl) { svgEl.style.width = '16px'; svgEl.style.height = '16px'; }
            img.replaceWith(span);
        };
    });
}

/* ============================================================
   File preview thumbnails (images, GIFs, videos)
============================================================ */
function _getPreviewType(item) {
    if (item.type !== 'file') return null;
    const ext = (item.name.split('.').pop() || '').toLowerCase();
    if (IMAGE_EXTS.has(ext) || item.mime?.startsWith('image/')) return ext === 'gif' ? 'gif' : 'image';
    if (VIDEO_EXTS.has(ext) || item.mime?.startsWith('video/')) return 'video';
    return null;
}

async function _buildFilePreview(item) {
    const previewType = _getPreviewType(item);
    if (!previewType) return null;

    const raw = item.content;
    if (raw === null || raw === undefined) return null;

    const ext = (item.name.split('.').pop() || '').toLowerCase();
    let mime = item.mime || '';
    if (!mime) {
        if (previewType === 'video') mime = ext === 'mov' ? 'video/quicktime' : `video/${ext}`;
        else if (ext === 'svg') mime = 'image/svg+xml';
        else mime = `image/${ext}`;
    }

    const blobData = typeof raw === 'string' ? new TextEncoder().encode(raw) : raw;
    const blob = new Blob([blobData], { type: mime });
    const url = URL.createObjectURL(blob);

    try {
        if (previewType === 'image') {
            return await new Promise((resolve, reject) => {
                const img = document.createElement('img');
                img.className = 'preview-thumb';
                img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
                img.onerror = () => { URL.revokeObjectURL(url); reject(); };
                img.src = url;
            });
        }

        if (previewType === 'gif') {
            // Draw first frame to canvas so the GIF doesn't animate
            return await new Promise((resolve, reject) => {
                const img = document.createElement('img');
                img.onload = () => {
                    try {
                        const size = parseInt(getComputedStyle(document.documentElement)
                            .getPropertyValue('--img-size')) || 64;
                        const w = img.naturalWidth || img.width || 1;
                        const h = img.naturalHeight || img.height || 1;
                        const scale = Math.min(size / w, size / h, 1);
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.round(w * scale);
                        canvas.height = Math.round(h * scale);
                        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                        canvas.className = 'preview-thumb';
                        URL.revokeObjectURL(url);
                        resolve(canvas);
                    } catch (e) { URL.revokeObjectURL(url); reject(e); }
                };
                img.onerror = () => { URL.revokeObjectURL(url); reject(); };
                img.src = url;
            });
        }

        if (previewType === 'video') {
            // Seek to first decoded frame and draw to canvas.
            // preload='auto' is required so the browser buffers enough data to
            // actually decode a frame — 'metadata' only loads duration/dimensions
            // and leaves the canvas blank on most browsers.
            return await new Promise((resolve, reject) => {
                const video = document.createElement('video');
                video.muted = true;
                video.preload = 'auto';
                let settled = false;

                function cleanup() { video.src = ''; URL.revokeObjectURL(url); }
                function fail() { if (settled) return; settled = true; cleanup(); reject(); }

                video.onseeked = () => {
                    if (settled) return;
                    settled = true;
                    try {
                        const size = parseInt(getComputedStyle(document.documentElement)
                            .getPropertyValue('--img-size')) || 64;
                        const w = video.videoWidth || 1;
                        const h = video.videoHeight || 1;
                        const scale = Math.min(size / w, size / h, 1);
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.round(w * scale);
                        canvas.height = Math.round(h * scale);
                        // drawImage must happen before cleanup clears the src
                        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                        canvas.className = 'preview-thumb';
                        cleanup();
                        resolve(canvas);
                    } catch (e) { cleanup(); reject(e); }
                };
                // onloadeddata fires when the first frame is available to decode;
                // onloadedmetadata is too early — frame data isn't buffered yet.
                video.onloadeddata = () => { video.currentTime = 0.001; };
                video.onerror = fail;
                setTimeout(fail, 8000);
                video.src = url;
            });
        }
    } catch {
        URL.revokeObjectURL(url);
        return null;
    }
    return null;
}

async function buildFileIconWrapper(item) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'height:calc(var(--img-size));display:flex;align-items:center;justify-content:center;';

    if (item.type === 'folder') {
        if (item.mountIcon) {
            const special = await getSpecialFolderIcon(null, item.mountIcon);
            if (special) { wrapper.appendChild(special); return wrapper; }
        }
        const special = await getSpecialFolderIcon(item.name);
        if (special) { wrapper.appendChild(special); return wrapper; }
    }

    const candidates = getIconCandidates(item);

    for (const candidate of candidates) {
        const fsPath = `/usr/share/icons/128/${candidate}`;
        const webPath = `./icons/128/${candidate}`;
        try {
            // loadIconImg checks iconBlobCache first — only hits FS once per unique icon
            const img = await loadIconImg(fsPath, webPath);
            img.className = 'icon-img';
            wrapper.appendChild(img);
            break;
        } catch { }
    }

    if (!wrapper.children.length) {
        // All candidates failed — emoji fallback
        const fallback = document.createElement('div');
        fallback.className = 'iconFallback';
        fallback.textContent = item.type === 'folder' ? '📁' : '📄';
        wrapper.appendChild(fallback);
    }

    // Async preview: replaces icon once thumbnail is ready
    if (_getPreviewType(item)) {
        _buildFilePreview(item).then(previewEl => {
            if (!previewEl) return;
            wrapper.innerHTML = '';
            wrapper.appendChild(previewEl);
        }).catch(() => { });
    }

    return wrapper;
}

/* ============================================================
   Window creation
============================================================ */

let winCount = 0;

function spawnWindow(initialFolderId = null, initialPath = null) {
    const windowId = 'win_' + (++winCount);
    const username = getUsername();
    const homePath = `/home/${username}`;

    const offset = (winCount - 1) * 30;
    const left = Math.min(40 + offset, window.innerWidth - 820);
    const top = Math.min(40 + offset, window.innerHeight - 640);

    const state = {
        currentFolderId: initialFolderId || 'root',
        historyStack: [],
        historyPos: -1,
        selectedItemId: null,
        selectedIds: new Set(),
        anchorId: null,
    };
    windows[windowId] = { el: null, state };

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.left = left + 'px';
    win.style.top = top + 'px';

    win.addEventListener('mousedown', () => focusWindow(windowId));

    // v3.1.6:
    // Removed:
    // <button class="small-btn btn-new-folder">+ Folder</button>
    // and
    // <button class="small-btn btn-new-file">+ File</button>
    win.innerHTML = `
        <div class="title-bar" data-winid="${windowId}">
            <button class="window-close-button" title="Close">✕</button>
            <button class="window-minimize-button" title="Minimize">—</button>
            <button class="window-maximize-button" title="Maximize">□</button>
            <span id="fe-titleicon-${windowId}"></span><span class="title-bar-text">File Explorer</span>
        </div>

        <div class="toolbar">
            <button class="btn-back" title="Back">⬅</button>
            <button class="btn-forward" title="Forward">➡</button>
            <button class="btn-up" title="Up">⬆</button>
            <div class="address">/ </div>
            <button class="small-btn btn-upload">Upload Files</button>
            <button class="small-btn btn-upload-folder">Upload Folder</button>
            <input type="file" class="file-input" style="display:none" multiple>
            <input type="file" class="file-input-folder" style="display:none">
        </div>

        <div class="content">
            <div class="sidebar">
                <div class="sidebar-section">Places</div>
                <ul class="favorites-list" id="sb-places-${windowId}"></ul>
                <div class="sidebar-section">System</div>
                <ul class="favorites-list" id="sb-system-${windowId}"></ul>
                <div class="sidebar-section" id="sb-media-header-${windowId}">Media</div>
                <ul class="favorites-list" id="sb-media-${windowId}"></ul>
            </div>
            <div class="main-panel"></div>
        </div>

        <div class="bottom-toolbar">
            <input type="range" min="60" max="160" value="100" class="zoom-slider">
            <span class="file-count">0 items</span>, <span class="free-space">Free space: …</span>
        </div>
    `;

    document.getElementById('windowContainer').appendChild(win);

    // Build sidebar asynchronously
    const placesList = win.querySelector(`#sb-places-${windowId}`);
    const systemList = win.querySelector(`#sb-system-${windowId}`);

    const places = [
        { slug: 'home', label: 'Home', color: '#5ba4ff', path: homePath, name: username },
        { slug: 'desktop', label: 'Desktop', color: '#7dd3fc', path: `${homePath}/Desktop`, name: 'Desktop' },
        { slug: 'documents', label: 'Documents', color: '#93c5fd', path: `${homePath}/Documents`, name: 'Documents' },
        { slug: 'downloads', label: 'Downloads', color: '#6ee7b7', path: `${homePath}/Downloads`, name: 'Downloads' },
        { slug: 'pictures', label: 'Pictures', color: '#f9a8d4', path: `${homePath}/Pictures`, name: 'Pictures' },
        { slug: 'music', label: 'Music', color: '#c4b5fd', path: `${homePath}/Music`, name: 'Music' },
        { slug: 'videos', label: 'Videos', color: '#fcd34d', path: `${homePath}/Videos`, name: 'Videos' },
    ];
    const system = [
        { slug: 'root', label: 'File System', color: '#94a3b8', path: '/', name: 'root' },
        { slug: 'users', label: 'Users', color: '#86efac', path: '/home', name: 'home' },
        { slug: 'trash', label: 'Recycle Bin', color: '#f87171', virtId: 'virt:trash' },
    ];

    async function buildSidebarList(listEl, items) {
        for (const p of items) {
            const li = await buildSidebarItem(p.slug, p.label, p.color);
            if (p.virtId) {
                li.onclick = () => navigate(windowId, p.virtId);
            } else {
                li.dataset.path = p.path;
                li.dataset.name = p.name;
                li.onclick = () => navigateToPath(windowId, p.path);
            }

            // Right-click context menu
            li.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const menuItems = [
                    {
                        label: 'Open',
                        icon: 'open',
                        action: () => {
                            if (p.virtId) navigate(windowId, p.virtId);
                            else navigateToPath(windowId, p.path);
                        }
                    },
                    {
                        label: 'Open in New Window',
                        icon: 'newWindow',
                        action: () => {
                            if (p.virtId) spawnWindow(p.virtId);
                            else spawnWindow(null, p.path);
                        }
                    },
                ];
                if (p.virtId === 'virt:trash') {
                    menuItems.push(null);
                    menuItems.push({ label: 'Empty Recycle Bin', icon: 'delete', danger: true, action: () => emptyTrash() });
                }
                buildMenu(e.clientX, e.clientY, menuItems);
            });

            // Drag-and-drop: accept files/folders dragged onto sidebar items
            li.addEventListener('dragover', (e) => {
                if (!e.dataTransfer.types.includes('application/edogos-items')) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                li.classList.add('drag-over');
            });
            li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
            li.addEventListener('drop', async (e) => {
                e.preventDefault();
                li.classList.remove('drag-over');
                const raw = e.dataTransfer.getData('application/edogos-items');
                if (!raw) return;
                const ids = JSON.parse(raw);
                let targetId;
                if (p.virtId === 'virt:trash') {
                    targetId = await _getTmpId();
                } else {
                    const parts = p.path.split('/').filter(Boolean);
                    let currentId = 'root';
                    for (const part of parts) {
                        const children = await idbGetAllByIndex('parentId', currentId);
                        const match = children.find(n => n.name === part && n.type === 'folder');
                        if (!match) return;
                        currentId = match.id;
                    }
                    targetId = currentId;
                }
                await _moveItems(ids, targetId);
            });

            listEl.appendChild(li);
        }
    }

    buildSidebarList(placesList, places);
    buildSidebarList(systemList, system);
    const mediaList = win.querySelector(`#sb-media-${windowId}`);
    const mediaHeader = win.querySelector(`#sb-media-header-${windowId}`);

    async function rebuildMediaSidebar() {
        mediaList.innerHTML = '';
        const mounts = getMountTable();

        if (mounts.length === 0) {
            mediaHeader.style.display = 'none';
        } else {
            mediaHeader.style.display = '';
            for (const m of mounts) {
                const li = await buildSidebarItem(m.icon, m.label,
                    m.icon === 'usb' ? '#7dd3fc' : '#e2c97e'
                );
                li.dataset.path = m.mountPoint;
                li.dataset.device = m.device;
                li.dataset.fstype = m.fsType;
                li.style.position = 'relative';

                // Eject button
                const ejectBtn = document.createElement('button');
                ejectBtn.className = 'sidebar-eject-btn';
                ejectBtn.title = `Eject ${m.label}`;
                ejectBtn.innerHTML = SVG_ICONS.eject;
                ejectBtn.onclick = (e) => {
                    e.stopPropagation();
                    eject(m.mountPoint);
                };
                li.appendChild(ejectBtn);

                li.onclick = () => navigateToPath(windowId, m.mountPoint);

                // Right-click to eject
                li.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    buildMenu(e.clientX, e.clientY, [
                        {
                            label: `Eject ${m.label}`,
                            icon: 'eject',
                            action: () => eject(m.mountPoint),
                        },
                        {
                            label: 'Properties',
                            icon: 'properties',
                            action: () => spawnMountPropertiesWindow(m),
                        },
                    ]);
                });

                mediaList.appendChild(li);
            }
        }
    }

    // Store the rebuild function on the window object for later use by insertCD/removeCD
    windows[windowId].rebuildMediaSidebar = rebuildMediaSidebar;
    rebuildMediaSidebar();

    windows[windowId].el = win;

    const titleBar = win.querySelector('.title-bar');
    titleBar.addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });
    addResizeHandles(win);

    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);
    win.querySelector('.window-maximize-button').onclick = () => maximizeWindow(windowId);

    win.querySelector('.btn-back').onclick = () => goBack(windowId);
    win.querySelector('.btn-forward').onclick = () => goForward(windowId);
    win.querySelector('.btn-up').onclick = () => goUp(windowId);
    // win.querySelector('.btn-new-folder').onclick = () => _winNewFolder(windowId);
    // win.querySelector('.btn-new-file').onclick = () => _winNewFile(windowId);

    const uploadBtn = win.querySelector('.btn-upload');
    const fileInput = win.querySelector('.file-input');
    uploadBtn.onclick = () => { fileInput.value = ''; fileInput.click(); };
    fileInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        const prog = files.length > 1 ? showFsProgress('Uploading Files') : null;
        let done = 0;
        for (const file of files) {
            const content = await file.arrayBuffer();
            await idbAdd({
                id: crypto.randomUUID(),
                name: file.name, type: 'file',
                parentId: state.currentFolderId,
                content, size: file.size, mime: file.type,
                createdAt: Date.now(), updatedAt: Date.now()
            });
            done++;
            if (prog) prog.update(done, files.length, file.name);
        }
        if (prog) prog.close();
        await renderWindow(windowId);
    };

    const uploadFolderBtn = win.querySelector('.btn-upload-folder');
    const folderInput = win.querySelector('.file-input-folder');
    folderInput.webkitdirectory = true;

    uploadFolderBtn.onclick = () => { folderInput.value = ''; folderInput.click(); };

    folderInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        uploadFolderBtn.textContent = 'Uploading…';
        uploadFolderBtn.disabled = true;

        const prog = showFsProgress('Uploading Folder');
        let done = 0;

        try {
            const folderCache = {};

            for (const file of files) {
                const parts = file.webkitRelativePath.split('/');

                let parentId = state.currentFolderId;
                for (let i = 0; i < parts.length - 1; i++) {
                    const pathKey = parts.slice(0, i + 1).join('/');

                    if (folderCache[pathKey] !== undefined) {
                        parentId = folderCache[pathKey];
                    } else {
                        const siblings = await idbGetAllByIndex('parentId', parentId);
                        const existing = siblings.find(
                            n => n.name === parts[i] && n.type === 'folder'
                        );

                        if (existing) {
                            folderCache[pathKey] = existing.id;
                            parentId = existing.id;
                        } else {
                            const id = crypto.randomUUID();
                            await idbAdd({
                                id,
                                name: parts[i],
                                type: 'folder',
                                parentId,
                                createdAt: Date.now(),
                                updatedAt: Date.now(),
                            });
                            folderCache[pathKey] = id;
                            parentId = id;
                        }
                    }
                }

                const content = await file.arrayBuffer();
                await idbAdd({
                    id: crypto.randomUUID(),
                    name: parts[parts.length - 1],
                    type: 'file',
                    parentId,
                    content,
                    size: file.size,
                    mime: file.type || '',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                });
                done++;
                prog.update(done, files.length, parts[parts.length - 1]);
            }

            await renderAllWindows();
        } finally {
            prog.close();
            uploadFolderBtn.textContent = 'Upload Folder';
            uploadFolderBtn.disabled = false;
        }
    };

    const zoomSlider = win.querySelector('.zoom-slider');
    zoomSlider.oninput = () => updateZoom(zoomSlider.value);

    wireUpSidebarIcons(win.querySelector('.sidebar'));

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.innerHTML = `<span id="fe-tbicon-${windowId}"></span> File Explorer`;
    tbBtn.onclick = () => {
        if (win.style.display === 'none') {
            win.style.display = 'block';
            focusWindow(windowId);
        } else {
            focusWindow(windowId);
        }
    };
    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [{ label: "Close", icon: "close", action: () => closeWindow(windowId) }]);
    };
    const taskbar = document.getElementById('taskbar');
    taskbar.insertBefore(tbBtn, taskbar.querySelector('#taskbar-tray'));

    windows[windowId].taskbarBtn = tbBtn;

    const _feIconCss = 'width:16px;height:16px;object-fit:contain;';
    loadIconImg('/usr/share/icons/16/folder.svg', './icons/16/folder.svg', _feIconCss).then(img => {
        img.className = 'app-icon-title-bar';
        win.querySelector(`#fe-titleicon-${windowId}`)?.appendChild(img);
    });
    loadIconImg('/usr/share/icons/16/folder.svg', './icons/16/folder.svg', _feIconCss).then(img => {
        img.className = 'app-icon-title-bar';
        tbBtn.querySelector(`#fe-tbicon-${windowId}`)?.appendChild(img);
    });

    if (initialFolderId) {
        navigate(windowId, initialFolderId);
    } else if (initialPath) {
        navigateToPath(windowId, initialPath);
    } else {
        navigateToPath(windowId, homePath);
    }
    focusWindow(windowId);

    return windowId;
}

function closeWindow(windowId) {
    const win = windows[windowId];
    if (!win) return;
    win.el.remove();
    if (win.taskbarBtn) win.taskbarBtn.remove();
    delete windows[windowId];
    if (focusedWindowId === windowId) {
        focusedWindowId = null;
        const ids = Object.keys(windows);
        if (ids.length) focusWindow(ids[ids.length - 1]);
    }
}

function minimizeWindow(windowId) {
    const win = windows[windowId];
    if (!win) return;
    win.el.style.display = 'none';
    if (win.taskbarBtn) win.taskbarBtn.classList.remove('active');
    if (focusedWindowId === windowId) {
        focusedWindowId = null;
        const ids = Object.keys(windows).filter(id => windows[id].el.style.display !== 'none');
        if (ids.length) focusWindow(ids[ids.length - 1]);
    }
}

function maximizeWindow(windowId) {
    const win = windows[windowId];
    if (!win) return;
    const el = win.el;
    const taskbarEl = document.getElementById('taskbar');
    const TASKBAR_HEIGHT = taskbarEl ? taskbarEl.offsetHeight : 44;
    const btn = el.querySelector('.window-maximize-button');
    if (el.classList.contains('maximized')) {
        el.classList.remove('maximized');
        if (win.restoreRect) {
            el.style.left = win.restoreRect.left;
            el.style.top = win.restoreRect.top;
            el.style.width = win.restoreRect.width;
            el.style.height = win.restoreRect.height;
        }
        if (btn) { btn.textContent = '□'; btn.title = 'Maximize'; }
    } else {
        win.restoreRect = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
        el.classList.add('maximized');
        el.style.left = '0px';
        el.style.top = '0px';
        el.style.width = window.innerWidth + 'px';
        el.style.height = (window.innerHeight - TASKBAR_HEIGHT) + 'px';
        if (btn) { btn.textContent = '❐'; btn.title = 'Restore Down'; }
    }
}

/* ============================================================
   Drag system
============================================================ */

let dragState = null;

function startDrag(e, winEl) {
    const rect = winEl.getBoundingClientRect();
    dragState = {
        el: winEl,
        startX: e.clientX,
        startY: e.clientY,
        origLeft: rect.left,
        origTop: rect.top,
        wasMaximized: winEl.classList.contains('maximized'),
    };
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
}

function onDrag(e) {
    if (!dragState) return;
    // Defer unmaximize until actual movement so a single click never restores the window
    if (dragState.wasMaximized) {
        dragState.wasMaximized = false;
        const winEl = dragState.el;
        maximizeWindow(winEl.id);
        winEl.style.left = Math.max(0, e.clientX - winEl.offsetWidth / 2) + 'px';
        winEl.style.top = '0px';
        const rect = winEl.getBoundingClientRect();
        dragState.startX = e.clientX;
        dragState.startY = e.clientY;
        dragState.origLeft = rect.left;
        dragState.origTop = rect.top;
        return;
    }
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const el = dragState.el;
    const TASKBAR_HEIGHT = 44;
    const maxLeft = window.innerWidth - el.offsetWidth;
    const maxTop = window.innerHeight - el.offsetHeight - TASKBAR_HEIGHT;
    const newLeft = Math.max(0, Math.min(dragState.origLeft + dx, maxLeft));
    const newTop = Math.max(0, Math.min(dragState.origTop + dy, maxTop));
    el.style.left = newLeft + 'px';
    el.style.top = newTop + 'px';
    if (window._mmOnDrag) window._mmOnDrag(e, el);
}

function stopDrag() {
    dragState = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    if (window._mmOnStopDrag) window._mmOnStopDrag();
}

/* ============================================================
   Resize system
============================================================ */

let resizeState = null;

function addResizeHandles(winEl) {
    ['rh-n', 'rh-s', 'rh-e', 'rh-w', 'rh-ne', 'rh-nw', 'rh-se', 'rh-sw'].forEach(dir => {
        const h = document.createElement('div');
        h.className = `resize-handle ${dir}`;
        h.addEventListener('mousedown', e => {
            e.preventDefault();
            e.stopPropagation();
            focusWindow(winEl.id);
            startWindowResize(e, winEl, dir);
        });
        winEl.appendChild(h);
    });
}

function startWindowResize(e, winEl, dir) {
    const rect = winEl.getBoundingClientRect();
    resizeState = {
        el: winEl,
        dir,
        startX: e.clientX,
        startY: e.clientY,
        origLeft: rect.left,
        origTop: rect.top,
        origWidth: rect.width,
        origHeight: rect.height,
    };
    document.addEventListener('mousemove', onWindowResize);
    document.addEventListener('mouseup', stopWindowResize);
}

function onWindowResize(e) {
    if (!resizeState) return;
    const { el, dir, startX, startY, origLeft, origTop, origWidth, origHeight } = resizeState;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const MIN_W = 320, MIN_H = 180;
    const TASKBAR_HEIGHT = 44;

    let newLeft = origLeft, newTop = origTop, newWidth = origWidth, newHeight = origHeight;

    if (dir.includes('e')) newWidth = Math.max(MIN_W, origWidth + dx);
    if (dir.includes('s')) newHeight = Math.max(MIN_H, origHeight + dy);
    if (dir.includes('w')) {
        const w = Math.max(MIN_W, origWidth - dx);
        newLeft = origLeft + origWidth - w;
        newWidth = w;
    }
    if (dir.includes('n')) {
        const h = Math.max(MIN_H, origHeight - dy);
        newTop = origTop + origHeight - h;
        newHeight = h;
    }

    newLeft = Math.max(0, newLeft);
    newTop = Math.max(0, newTop);
    if (newLeft + newWidth > window.innerWidth) newWidth = window.innerWidth - newLeft;
    if (newTop + newHeight > window.innerHeight - TASKBAR_HEIGHT) newHeight = window.innerHeight - TASKBAR_HEIGHT - newTop;

    el.style.left = newLeft + 'px';
    el.style.top = newTop + 'px';
    el.style.width = newWidth + 'px';
    el.style.height = newHeight + 'px';
}

function stopWindowResize() {
    resizeState = null;
    document.removeEventListener('mousemove', onWindowResize);
    document.removeEventListener('mouseup', stopWindowResize);
}

document.addEventListener('dblclick', e => {
    const titleBar = e.target.closest('.title-bar');
    if (!titleBar || e.target.closest('button')) return;
    const win = titleBar.closest('.app-window');
    if (win) maximizeWindow(win.id);
});

/* ============================================================
   Navigation (per-window)
============================================================ */

async function navigate(windowId, folderId, addHistory = true) {
    const win = windows[windowId];
    if (!win) return;
    const state = win.state;
    state.currentFolderId = folderId;
    if (addHistory) {
        state.historyStack = state.historyStack.slice(0, state.historyPos + 1);
        state.historyStack.push(folderId);
        state.historyPos++;
    }
    await renderWindow(windowId);
}

async function navigateToFolderByName(windowId, name) {
    const allRoot = await idbGetAllByIndex('parentId', 'root');
    const node = allRoot.find(n => n.name === name && n.type === 'folder');
    const folderId = node ? node.id : 'root';
    await navigate(windowId, folderId);
}

async function navigateToPath(windowId, path) {
    const parts = path.split('/').filter(Boolean);
    let currentId = 'root';
    for (const part of parts) {
        const children = await idbGetAllByIndex('parentId', currentId);
        const match = children.find(n => n.name === part && n.type === 'folder');
        if (!match) break;
        currentId = match.id;
    }
    const win = windows[windowId]?.el;
    if (win) {
        win.querySelectorAll('.favorites-list li').forEach(li =>
            li.classList.toggle('active', li.dataset.path === path));
    }
    await navigate(windowId, currentId);
}

async function goBack(windowId) {
    const state = windows[windowId]?.state;
    if (!state || state.historyPos <= 0) return;
    state.historyPos--;
    await navigate(windowId, state.historyStack[state.historyPos], false);
}

async function goForward(windowId) {
    const state = windows[windowId]?.state;
    if (!state || state.historyPos >= state.historyStack.length - 1) return;
    state.historyPos++;
    await navigate(windowId, state.historyStack[state.historyPos], false);
}

async function goUp(windowId) {
    const state = windows[windowId]?.state;
    if (!state) return;
    if (state.currentFolderId.startsWith('virt:')) {
        await navigate(windowId, 'root');
        return;
    }
    const cnode = await idbGet(state.currentFolderId);
    if (cnode && cnode.parentId) {
        await navigate(windowId, cnode.parentId);
    } else {
        await navigate(windowId, 'root');
    }
}

/* ============================================================
   Virtual Folders — system views with no real FS node
   IDs use the "virt:" prefix so they can never clash with
   IndexedDB UUIDs and can never be reached via navigateToPath.
============================================================ */

const VIRTUAL_FOLDERS = {
    'virt:computer': {
        id: 'virt:computer',
        label: 'Computer',
        render: async (mainPanel, windowId, state) => {
            const CD_DRIVE_MODEL = 'HL-DT-ST DVD+-RW N725E';
            const cdMount = getMountTable().find(m => m.icon === 'cd') || null;

            const drives = [
                {
                    label: 'File System',
                    slug: 'root',
                    color: '#94a3b8',
                    title: 'File System',
                    empty: false,
                    action: () => navigate(windowId, 'root'),
                },
                // USB drives (dynamic, excludes disc mounts)
                ...getMountTable()
                    .filter(m => m.icon === 'usb')
                    .map(m => ({
                        label: m.label,
                        slug: 'usb',
                        color: '#7dd3fc',
                        title: m.label,
                        empty: false,
                        action: () => navigateToPath(windowId, m.mountPoint),
                    })),
                // Physical CD/DVD drive — always present, state reflects mounted disc
                {
                    label: cdMount ? cdMount.label : 'DVD RW Drive',
                    slug: 'cd',
                    color: cdMount ? '#e2c97e' : '#666',
                    title: cdMount
                        ? `${CD_DRIVE_MODEL} — ${cdMount.label}`
                        : CD_DRIVE_MODEL,
                    empty: !cdMount,
                    action: cdMount
                        ? () => navigateToPath(windowId, cdMount.mountPoint)
                        : () => spawnError('No disc in drive.', 'info'),
                },
            ];

            for (const drive of drives) {
                const tile = document.createElement('div');
                tile.className = 'item';
                tile.title = drive.title;
                if (drive.empty) tile.style.opacity = '0.55';

                const iconWrapper = document.createElement('div');
                iconWrapper.style.cssText = 'height:var(--img-size);display:flex;align-items:center;justify-content:center;';
                loadIconImg(
                    `/usr/share/icons/128/folder-${drive.slug}.svg`,
                    `./icons/128/folder-${drive.slug}.svg`,
                ).then(img => {
                    img.className = 'icon-img';
                    iconWrapper.appendChild(img);
                }).catch(() => {
                    const fb = document.createElement('div');
                    fb.style.cssText = `color:${drive.color};font-size:40px;display:flex;align-items:center;`;
                    fb.textContent = drive.slug === 'usb' ? '🖴' : drive.slug === 'cd' ? '💿' : '🖥';
                    iconWrapper.appendChild(fb);
                });
                tile.appendChild(iconWrapper);

                const nameDiv = document.createElement('div');
                nameDiv.className = 'name';
                nameDiv.textContent = drive.label;
                tile.appendChild(nameDiv);

                tile.onmousedown = (ev) => {
                    if (ev.button !== 0) return;
                    mainPanel.querySelectorAll('.item').forEach(e => e.classList.remove('selected'));
                    state.selectedIds.clear();
                    state.selectedItemId = null;
                    state.anchorId = null;
                    tile.classList.add('selected');
                };
                tile.ondblclick = drive.action;
                tile.oncontextmenu = (ev) => {
                    ev.preventDefault();
                    const menuItems = [{ label: 'Open', icon: 'open', action: drive.action }];
                    if (!drive.empty) {
                        menuItems.push({ label: `Eject ${drive.label}`, icon: 'eject', action: () => eject(cdMount.mountPoint) });
                    }
                    buildMenu(ev.clientX, ev.clientY, menuItems);
                };

                mainPanel.appendChild(tile);
            }
        },
    },

    'virt:trash': {
        id: 'virt:trash',
        label: 'Recycle Bin',
        render: async (mainPanel, windowId, state) => {
            const tmpId = await _getTmpId();
            if (!tmpId) return;

            const items = await idbGetAllByIndex('parentId', tmpId);
            items.sort((a, b) => (b.trashedAt || 0) - (a.trashedAt || 0));

            if (items.length === 0) {
                const empty = document.createElement('div');
                empty.style.cssText = 'padding:32px;color:#888;text-align:center;width:100%;';
                empty.textContent = 'Recycle Bin is empty.';
                mainPanel.appendChild(empty);
                return;
            }

            for (const item of items) {
                const tile = document.createElement('div');
                tile.className = 'item';
                tile.dataset.id = item.id;
                tile.title = item.name;

                const iconPlaceholder = document.createElement('div');
                iconPlaceholder.style.cssText = 'height:var(--img-size);display:flex;align-items:center;justify-content:center;color:#444;font-size:28px;';
                iconPlaceholder.textContent = item.type === 'folder' ? '📁' : '📄';
                tile.appendChild(iconPlaceholder);

                const nameDiv = document.createElement('div');
                nameDiv.className = 'name';
                nameDiv.textContent = item.name;
                tile.appendChild(nameDiv);

                tile.onmousedown = (ev) => {
                    if (ev.button !== 0) return;
                    if (ev.ctrlKey) {
                        if (state.selectedIds.has(item.id)) {
                            state.selectedIds.delete(item.id);
                            tile.classList.remove('selected');
                        } else {
                            state.selectedIds.add(item.id);
                            tile.classList.add('selected');
                            state.selectedItemId = item.id;
                            state.anchorId = item.id;
                        }
                    } else {
                        mainPanel.querySelectorAll('.item').forEach(e => e.classList.remove('selected'));
                        state.selectedIds.clear();
                        tile.classList.add('selected');
                        state.selectedIds.add(item.id);
                        state.selectedItemId = item.id;
                        state.anchorId = item.id;
                    }
                    mainPanel.focus({ preventScroll: true });
                };
                tile.oncontextmenu = (ev) => {
                    ev.preventDefault();
                    showContextMenu(ev.clientX, ev.clientY, item, windowId);
                };

                mainPanel.appendChild(tile);

                buildFileIconWrapper(item).then(iconWrapper => {
                    if (iconPlaceholder.isConnected) iconPlaceholder.replaceWith(iconWrapper);
                }).catch(() => { });
            }
        },
    },
};

/* ============================================================
   Rendering (per-window)
============================================================ */

async function renderWindow(windowId) {
    const winObj = windows[windowId];
    if (!winObj) return;
    const { el, state } = winObj;

    // Only file explorer windows have .address — skip everything else
    if (!el.querySelector('.address')) return;

    // Virtual folders: custom views with no real FS node
    if (state.currentFolderId.startsWith('virt:')) {
        const vf = VIRTUAL_FOLDERS[state.currentFolderId];
        if (!vf) return;

        el.querySelector('.address').textContent = vf.label;
        const titleBarText = el.querySelector('.title-bar-text');
        if (titleBarText) titleBarText.textContent = 'File Explorer — ' + vf.label;

        state.selectedItemId = null;
        state.selectedIds = new Set();
        state.anchorId = null;

        const mainPanel = el.querySelector('.main-panel');
        mainPanel.onscroll = null;
        mainPanel.innerHTML = '';

        await vf.render(mainPanel, windowId, state);

        mainPanel.oncontextmenu = (ev) => {
            if (ev.target === mainPanel) {
                ev.preventDefault();
                showFolderBgContextMenu(ev.clientX, ev.clientY, windowId);
            }
        };
        mainPanel.onmousedown = (ev) => {
            if (ev.target === mainPanel) {
                mainPanel.querySelectorAll('.item').forEach(e => e.classList.remove('selected'));
                state.selectedItemId = null;
                state.selectedIds.clear();
                state.anchorId = null;
            }
        };
        mainPanel.setAttribute('tabindex', '-1');

        el.querySelector('.file-count').textContent = mainPanel.querySelectorAll('.item').length + ' items';
        el.querySelector('.free-space').textContent = '';
        renderDesktop();
        return;
    }

    const path = [];
    let walker = state.currentFolderId;
    while (walker) {
        const node = await idbGet(walker);
        if (!node) break;
        path.unshift(node.name);
        walker = node.parentId;
    }
    const pathStr = '/' + path.join('/');
    el.querySelector('.address').textContent = pathStr;
    const titleBarText = el.querySelector('.title-bar-text');
    if (titleBarText) titleBarText.textContent = 'File Explorer — ' + pathStr;

    state.selectedItemId = null;
    state.selectedIds = new Set();
    state.anchorId = null;

    let list = await idbGetAllByIndex('parentId', state.currentFolderId);
    const mainPanel = el.querySelector('.main-panel');
    mainPanel.onscroll = null;
    mainPanel.innerHTML = '';
    list.sort((a, b) => {
        const groupOf = item => {
            const isFolder = item.type === 'folder';
            const isHidden = item.name.startsWith('.');
            if (isFolder && !isHidden) return 0;
            if (isFolder && isHidden) return 1;
            if (!isFolder && !isHidden) return 2;
            return 3;
        };
        const ga = groupOf(a), gb = groupOf(b);
        if (ga !== gb) return ga - gb;
        return a.name.localeCompare(b.name);
    });
    if (!showHiddenFiles()) list = list.filter(item => !item.name.startsWith('.'));

    const VIRTUAL_THRESHOLD = 200; // use virtual scrolling above this count

    if (list.length > VIRTUAL_THRESHOLD) {
        renderVirtualGrid(mainPanel, list, windowId, state);
    } else {
        for (const item of list) {
            const tile = document.createElement('div');
            tile.className = 'item';
            tile.dataset.id = item.id;
            tile.title = item.name;
            if (fsClipboard.mode === 'cut' && fsClipboard.ids.includes(item.id)) tile.classList.add('cut-pending');

            const iconPlaceholder = document.createElement('div');
            iconPlaceholder.style.cssText = 'height:calc(var(--img-size));display:flex;align-items:center;justify-content:center;color:#444;font-size:28px;';
            iconPlaceholder.textContent = item.type === 'folder' ? '📁' : '📄';
            tile.appendChild(iconPlaceholder);

            const nameDiv = document.createElement('div');
            nameDiv.className = 'name';
            nameDiv.textContent = item.name;
            tile.appendChild(nameDiv);

            tile.onmousedown = (ev) => {
                if (ev.button !== 0) return;
                if (ev.ctrlKey) {
                    if (state.selectedIds.has(item.id)) {
                        state.selectedIds.delete(item.id);
                        tile.classList.remove('selected');
                    } else {
                        state.selectedIds.add(item.id);
                        tile.classList.add('selected');
                        state.selectedItemId = item.id;
                        state.anchorId = item.id;
                    }
                } else if (ev.shiftKey && state.anchorId) {
                    const allTiles = [...mainPanel.querySelectorAll('.item')];
                    const anchorIdx = allTiles.findIndex(t => t.dataset.id === state.anchorId);
                    const thisIdx = allTiles.findIndex(t => t.dataset.id === item.id);
                    const [start, end] = anchorIdx <= thisIdx ? [anchorIdx, thisIdx] : [thisIdx, anchorIdx];
                    allTiles.forEach(t => t.classList.remove('selected'));
                    state.selectedIds.clear();
                    for (let i = start; i <= end; i++) {
                        allTiles[i].classList.add('selected');
                        state.selectedIds.add(allTiles[i].dataset.id);
                    }
                    state.selectedItemId = item.id;
                } else {
                    mainPanel.querySelectorAll('.item').forEach(e => e.classList.remove('selected'));
                    state.selectedIds.clear();
                    tile.classList.add('selected');
                    state.selectedIds.add(item.id);
                    state.selectedItemId = item.id;
                    state.anchorId = item.id;
                }
                mainPanel.focus({ preventScroll: true });
            };
            tile.ondblclick = async () => {
                if (item.type === 'folder') await navigate(windowId, item.id);
                else openFile(item);
            };
            tile.oncontextmenu = (ev) => {
                ev.preventDefault();
                showContextMenu(ev.clientX, ev.clientY, item, windowId);
            };

            // Drag source
            tile.draggable = true;
            tile.ondragstart = (ev) => {
                if (!state.selectedIds.has(item.id)) {
                    mainPanel.querySelectorAll('.item').forEach(e => e.classList.remove('selected'));
                    state.selectedIds.clear();
                    state.selectedIds.add(item.id);
                    state.selectedItemId = item.id;
                    state.anchorId = item.id;
                    tile.classList.add('selected');
                }
                ev.dataTransfer.setData('application/edogos-items', JSON.stringify([...state.selectedIds]));
                ev.dataTransfer.effectAllowed = 'move';
                requestAnimationFrame(() => {
                    state.selectedIds.forEach(id => {
                        document.querySelectorAll(`.item[data-id="${id}"]`).forEach(el => el.classList.add('drag-source'));
                    });
                });
            };
            tile.ondragend = () => {
                document.querySelectorAll('.item.drag-source').forEach(e => e.classList.remove('drag-source'));
                document.querySelectorAll('.item.drag-over').forEach(e => e.classList.remove('drag-over'));
            };

            // Folder drop target
            if (item.type === 'folder') {
                tile.ondragover = (ev) => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move'; tile.classList.add('drag-over'); };
                tile.ondragleave = () => tile.classList.remove('drag-over');
                tile.ondrop = async (ev) => {
                    ev.preventDefault();
                    tile.classList.remove('drag-over');
                    const raw = ev.dataTransfer.getData('application/edogos-items');
                    if (raw) await _moveItems(JSON.parse(raw), item.id);
                };
            }

            mainPanel.appendChild(tile);

            buildFileIconWrapper(item).then(iconWrapper => {
                if (iconPlaceholder.isConnected) iconPlaceholder.replaceWith(iconWrapper);
            }).catch(() => { });
        }
    }

    mainPanel.oncontextmenu = (ev) => {
        if (ev.target === mainPanel) {
            ev.preventDefault();
            showFolderBgContextMenu(ev.clientX, ev.clientY, windowId);
        }
    };

    mainPanel.onmousedown = (ev) => {
        if (ev.target === mainPanel) {
            mainPanel.querySelectorAll('.item').forEach(e => e.classList.remove('selected'));
            state.selectedItemId = null;
            state.selectedIds.clear();
            state.anchorId = null;
        }
    };

    // Panel as drop target (drop into current folder)
    mainPanel.ondragover = (ev) => { if (ev.target === mainPanel) { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move'; } };
    mainPanel.ondrop = async (ev) => {
        if (ev.target !== mainPanel) return;
        ev.preventDefault();
        const raw = ev.dataTransfer.getData('application/edogos-items');
        if (raw) await _moveItems(JSON.parse(raw), state.currentFolderId);
    };

    mainPanel.setAttribute('tabindex', '-1');
    mainPanel.addEventListener('keydown', (ev) => {
        if (ev.key === 'F2' && state.selectedItemId) {
            ev.preventDefault();
            renameItem(state.selectedItemId, windowId);
        }
        if (ev.key === 'Delete' && state.selectedIds.size > 0) {
            ev.preventDefault();
            if (state.selectedIds.size === 1) deleteItem([...state.selectedIds][0], windowId);
            else _deleteItems([...state.selectedIds]);
        }
        if (ev.ctrlKey && ev.key === 'a') {
            ev.preventDefault();
            mainPanel.querySelectorAll('.item').forEach(t => { t.classList.add('selected'); state.selectedIds.add(t.dataset.id); });
        }
        if (ev.ctrlKey && ev.key === 'c') { ev.preventDefault(); if (state.selectedIds.size > 0) _copyItems([...state.selectedIds]); }
        if (ev.ctrlKey && ev.key === 'x') { ev.preventDefault(); if (state.selectedIds.size > 0) _cutItems([...state.selectedIds]); }
        if (ev.ctrlKey && ev.key === 'v') { ev.preventDefault(); _pasteItems(state.currentFolderId); }
    });

    updateStorageInfo(el, list.length, state.currentFolderId);
    renderDesktop();
}

function renderVirtualGrid(mainPanel, list, windowId, state) {
    const TILE_SIZE = 110; // approximate px width+height of each tile
    const GAP = 8;

    mainPanel.style.position = 'relative';
    mainPanel.innerHTML = '';

    let cols = Math.max(1, Math.floor(mainPanel.clientWidth / (TILE_SIZE + GAP)));
    let rows = Math.ceil(list.length / cols);
    let totalHeight = rows * (TILE_SIZE + GAP);

    // Spacer to give the panel its full scroll height
    const spacer = document.createElement('div');
    spacer.style.height = totalHeight + 'px';
    spacer.style.width = '1px';
    spacer.style.position = 'absolute';
    mainPanel.appendChild(spacer);

    const rendered = new Map(); // index -> tile element

    function getVisibleRange() {
        const scrollTop = mainPanel.scrollTop;
        const viewHeight = mainPanel.clientHeight;
        const firstRow = Math.max(0, Math.floor(scrollTop / (TILE_SIZE + GAP)) - 1);
        const lastRow = Math.min(rows - 1, Math.ceil((scrollTop + viewHeight) / (TILE_SIZE + GAP)) + 1);
        return { first: firstRow * cols, last: Math.min(list.length - 1, (lastRow + 1) * cols - 1) };
    }

    function renderVisible() {
        const { first, last } = getVisibleRange();

        // Remove tiles that scrolled out of view
        for (const [i, tile] of rendered) {
            if (i < first || i > last) {
                tile.remove();
                rendered.delete(i);
            }
        }

        // Add tiles now in view
        for (let i = first; i <= last; i++) {
            if (rendered.has(i)) continue;
            const item = list[i];
            const col = i % cols;
            const row = Math.floor(i / cols);

            const tile = document.createElement('div');
            tile.className = 'item';
            tile.dataset.id = item.id;
            tile.title = item.name;
            tile.style.position = 'absolute';
            tile.style.left = (col * (TILE_SIZE + GAP)) + 'px';
            tile.style.top = (row * (TILE_SIZE + GAP)) + 'px';
            tile.style.width = TILE_SIZE + 'px';

            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'height:calc(var(--img-size));display:flex;align-items:center;justify-content:center;color:#444;font-size:28px;';
            placeholder.textContent = item.type === 'folder' ? '📁' : '📄';
            tile.appendChild(placeholder);

            const nameDiv = document.createElement('div');
            nameDiv.className = 'name';
            nameDiv.textContent = item.name;
            tile.appendChild(nameDiv);

            if (fsClipboard.mode === 'cut' && fsClipboard.ids.includes(item.id)) tile.classList.add('cut-pending');

            tile.onmousedown = (ev) => {
                if (ev.button !== 0) return;
                if (ev.ctrlKey) {
                    if (state.selectedIds.has(item.id)) {
                        state.selectedIds.delete(item.id);
                        tile.classList.remove('selected');
                    } else {
                        state.selectedIds.add(item.id);
                        tile.classList.add('selected');
                        state.selectedItemId = item.id;
                        state.anchorId = item.id;
                    }
                } else if (ev.shiftKey && state.anchorId) {
                    const allTiles = [...mainPanel.querySelectorAll('.item')];
                    const anchorIdx = allTiles.findIndex(t => t.dataset.id === state.anchorId);
                    const thisIdx = allTiles.findIndex(t => t.dataset.id === item.id);
                    const [start, end] = anchorIdx <= thisIdx ? [anchorIdx, thisIdx] : [thisIdx, anchorIdx];
                    allTiles.forEach(t => t.classList.remove('selected'));
                    state.selectedIds.clear();
                    for (let j = start; j <= end; j++) {
                        allTiles[j].classList.add('selected');
                        state.selectedIds.add(allTiles[j].dataset.id);
                    }
                    state.selectedItemId = item.id;
                } else {
                    mainPanel.querySelectorAll('.item').forEach(e => e.classList.remove('selected'));
                    state.selectedIds.clear();
                    tile.classList.add('selected');
                    state.selectedIds.add(item.id);
                    state.selectedItemId = item.id;
                    state.anchorId = item.id;
                }
            };
            tile.ondblclick = async () => {
                if (item.type === 'folder') await navigate(windowId, item.id);
                else openFile(item);
            };
            tile.oncontextmenu = (ev) => {
                ev.preventDefault();
                showContextMenu(ev.clientX, ev.clientY, item, windowId);
            };

            tile.draggable = true;
            tile.ondragstart = (ev) => {
                if (!state.selectedIds.has(item.id)) {
                    mainPanel.querySelectorAll('.item').forEach(e => e.classList.remove('selected'));
                    state.selectedIds.clear();
                    state.selectedIds.add(item.id);
                    state.selectedItemId = item.id;
                    state.anchorId = item.id;
                    tile.classList.add('selected');
                }
                ev.dataTransfer.setData('application/edogos-items', JSON.stringify([...state.selectedIds]));
                ev.dataTransfer.effectAllowed = 'move';
                requestAnimationFrame(() => {
                    state.selectedIds.forEach(id => {
                        document.querySelectorAll(`.item[data-id="${id}"]`).forEach(el => el.classList.add('drag-source'));
                    });
                });
            };
            tile.ondragend = () => {
                document.querySelectorAll('.item.drag-source').forEach(e => e.classList.remove('drag-source'));
                document.querySelectorAll('.item.drag-over').forEach(e => e.classList.remove('drag-over'));
            };

            if (item.type === 'folder') {
                tile.ondragover = (ev) => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move'; tile.classList.add('drag-over'); };
                tile.ondragleave = () => tile.classList.remove('drag-over');
                tile.ondrop = async (ev) => {
                    ev.preventDefault();
                    tile.classList.remove('drag-over');
                    const raw = ev.dataTransfer.getData('application/edogos-items');
                    if (raw) await _moveItems(JSON.parse(raw), item.id);
                };
            }

            mainPanel.appendChild(tile);
            rendered.set(i, tile);

            buildFileIconWrapper(item).then(iconWrapper => {
                if (rendered.has(i)) placeholder.replaceWith(iconWrapper);
            });
        }
    }

    mainPanel.onscroll = renderVisible;
    renderVisible();
}

async function _findMountForFolder(folderId) {
    let id = folderId;
    for (let depth = 0; depth < 16; depth++) {
        if (!id || id === 'root') return null;
        const node = await idbGet(id);
        if (!node) return null;
        if (node.mountIcon) {
            return _mountTable.find(m => m.mountPoint === `/media/${node.name}`) ?? null;
        }
        id = node.parentId;
    }
    return null;
}

async function updateStorageInfo(winEl, listLength, currentFolderId) {
    winEl.querySelector('.file-count').textContent = listLength + ' items';
    const freeEl = winEl.querySelector('.free-space');

    const mount = await _findMountForFolder(currentFolderId);
    if (mount) {
        if (mount.readOnly) {
            freeEl.textContent = 'Free space: 0 bytes';
        } else if (mount.capacity != null) {
            const mountNode = await _fsResolve(mount.mountPoint);
            if (mountNode) {
                const stats = await getFolderStats(mountNode.id);
                const free = Math.max(0, mount.capacity - stats.size);
                freeEl.textContent = 'Free space: ' + formatBytes(free);
            } else {
                freeEl.textContent = 'Free space: ' + formatBytes(mount.capacity);
            }
        } else {
            // Read-write drive with no declared capacity — fall through to system space
            if (navigator.storage?.estimate) {
                const { usage = 0, quota = 0 } = await navigator.storage.estimate();
                freeEl.textContent = 'Free space: ' + formatBytes(Math.max(0, quota - usage));
            } else {
                freeEl.textContent = 'Free space: unknown';
            }
        }
        return;
    }

    // Not inside a mount — show system free space
    if (!navigator.storage?.estimate) {
        freeEl.textContent = 'Free space: unknown';
        return;
    }
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    freeEl.textContent = 'Free space: ' + formatBytes(Math.max(0, quota - usage));
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 bytes';
    const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

async function createItemInline(type, parentId, windowId) {
    const defaultName = type === 'folder' ? 'New Folder' : 'New File';
    const id = crypto.randomUUID();
    const node = {
        id, name: defaultName, type, parentId,
        ...(type === 'file' ? { content: '' } : {}),
        createdAt: Date.now(), updatedAt: Date.now()
    };
    await idbAdd(node);
    await renderAllWindows();

    const tile = document.querySelector(`.item[data-id="${id}"]`);
    if (!tile) return;
    tile.scrollIntoView({ block: 'nearest' });

    const mainPanel = tile.closest('.main-panel');
    if (mainPanel) {
        mainPanel.querySelectorAll('.item').forEach(e => e.classList.remove('selected'));
        tile.classList.add('selected');
    }

    startInlineRename(tile, node, windowId, true);
}

async function _winNewFolder(windowId) {
    turnOnDriveLight();
    try {
        const state = windows[windowId]?.state;
        if (!state) return;
        await createItemInline('folder', state.currentFolderId, windowId);
    } finally {
        turnOffDriveLight();
    }
}

async function _winNewFile(windowId) {
    turnOnDriveLight();
    try {
        const state = windows[windowId]?.state;
        if (!state) return;
        await createItemInline('file', state.currentFolderId, windowId);
    } finally {
        turnOffDriveLight();
    }
}

async function renderAllWindows() {
    for (const id of Object.keys(windows)) {
        await renderWindow(id);
    }
    await renderDesktop();
}

/* ============================================================
   App window factory
============================================================ */

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'ico', 'avif']);
const VIDEO_EXTS = new Set(['mp4', 'webm', 'ogg', 'ogv', 'mov', 'avi', 'mkv']);
const AUDIO_EXTS = new Set(['mp3', 'wav', 'ogg']);
const HTML_EXTS = new Set(['html', 'htm', 'mhtml']);
const ZIP_EXTS = new Set(['zip', 'jar', 'war', 'apk', 'epub', 'cbz']);
const GAMES = new Set(['BasketballSimulator', 'ESU10', 'HighwayCam', 'OnEdge', 'PhysicsFun', 'PhysicsFunV2', 'PoliceSimulator', 'TornadoSimulator', 'WebCars', 'WebCarsV2', 'WebCarsV3', 'StoreSimulator']);
const WRITER_EXTS = new Set(['edoc']);

function getExt(name) {
    return (name.split('.').pop() || '').toLowerCase();
}

function spawnApp(type, item) {
    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 30;
    const left = Math.min(60 + offset, window.innerWidth - 720);
    const top = Math.min(60 + offset, window.innerHeight - 540);

    const appMeta = {
        editor: { title: `Text Editor — ${item.name || "blank"}`, icon: '<img class="app-icon-title-bar" src="icons/16/text-editor.png">', w: 700, h: 520 },
        image: { title: `Image Viewer — ${item.name || "blank"}`, icon: '<img class="app-icon-title-bar" src="icons/16/media-player.png">', w: 700, h: 520 },
        video: { title: `Video Player — ${item.name || "blank"}`, icon: '<img class="app-icon-title-bar" src="icons/16/media-player.png">', w: 760, h: 520 },
        audio: { title: `Audio Player — ${item.name || "blank"}`, icon: '<img class="app-icon-title-bar" src="icons/16/media-player.png">', w: 400, h: 300 },
        zip: { title: `Archive — ${item.name || "blank"}`, icon: '🗜️', w: 760, h: 540 },
        markdown: { title: `${item.name || "blank"}`, icon: '<img class="app-icon-title-bar" src="icons/16/text-editor.png">', w: 750, h: 560 }
    }[type];

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.left = left + 'px';
    win.style.top = top + 'px';
    win.style.width = appMeta.w + 'px';
    win.style.height = appMeta.h + 'px';

    win.addEventListener('mousedown', () => focusWindow(windowId));

    win.innerHTML = `
                <div class="title-bar">
                    <button class="window-close-button" title="Close">✕</button>
                    <button class="window-minimize-button" title="Minimize">—</button>
            <button class="window-maximize-button" title="Maximize">□</button>
                    <span class="title-bar-text">${appMeta.icon} ${appMeta.title}</span>
                </div>
                <div class="app-body" style="height: calc(100% - var(--titlebar-height));overflow:hidden;display:flex;flex-direction:column;"></div>
            `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type, item } };

    win.querySelector('.title-bar').addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });
    addResizeHandles(win);
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);
    win.querySelector('.window-maximize-button').onclick = () => maximizeWindow(windowId);

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.innerHTML = `${appMeta.icon} ${item.name}`;
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));

    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [{ label: "Close", icon: "close", action: () => closeWindow(windowId) }]);
    };
    windows[windowId].taskbarBtn = tbBtn;

    const body = win.querySelector('.app-body');
    if (type === 'editor') _buildEditorBody(body, item, windowId);
    if (type === 'image') _buildImageBody(body, item);
    if (type === 'audio') _buildAudioBody(body, item, windowId);
    if (type === 'video') _buildVideoBody(body, item, windowId);
    if (type === 'zip') _buildZipBody(body, item);
    if (type === 'markdown') _buildMarkdownBody(body, item, windowId);

    focusWindow(windowId);
    return windowId;
}

function _buildEditorBody(body, item, windowId) {
    // Inject styles once
    if (!document.getElementById('editor-app-styles')) {
        const s = document.createElement('style');
        s.id = 'editor-app-styles';
        s.textContent = `
.ed-root { display:flex; flex-direction:column; height:100%; background:#1e1e1e; color:#d4d4d4; font-family:'Segoe UI',system-ui,sans-serif; font-size:13px; overflow:hidden; }
.ed-menubar { display:flex; align-items:center; gap:0; background:#252526; border-bottom:1px solid #1a1a1a; height:28px; flex-shrink:0; padding:0 4px; }
.ed-menu-item { padding:4px 10px; font-size:12px; color:#ccc; cursor:pointer; border-radius:3px; position:relative; white-space:nowrap; user-select:none; }
.ed-menu-item:hover, .ed-menu-item.open { background:#3a3a3a; color:#fff; }
.ed-dropdown { position:absolute; top:100%; left:0; z-index:9999; background:#2d2d2d; border:1px solid #404040; border-radius:6px; min-width:200px; box-shadow:0 8px 32px rgba(0,0,0,.6); padding:4px 0; display:none; }
.ed-dropdown.open { display:block; }
.ed-dd-item { display:flex; align-items:center; padding:6px 16px 6px 12px; font-size:12px; color:#ccc; cursor:pointer; white-space:nowrap; }
.ed-dd-item:hover { background:#094771; color:#fff; }
.ed-dd-item.disabled { color:#555; pointer-events:none; }
.ed-dd-shortcut { margin-left:auto; padding-left:24px; color:#666; font-size:11px; }
.ed-dd-sep { height:1px; background:#3a3a3a; margin:4px 8px; }
.ed-textarea { flex:1; width:100%; box-sizing:border-box; background:#1e1e1e; color:#d4d4d4; border:none; outline:none; padding:12px; font-family:monospace; font-size:13px; line-height:1.5; resize:none; }
.ed-find-bar { display:none; align-items:center; gap:6px; padding:4px 8px; background:#252526; border-top:1px solid #1a1a1a; flex-shrink:0; }
.ed-find-bar.open { display:flex; }
.ed-find-input { background:#333; color:#d4d4d4; border:1px solid #555; border-radius:3px; padding:3px 7px; font-size:12px; outline:none; width:180px; font-family:inherit; }
.ed-find-input:focus { border-color:#007acc; }
.ed-find-count { color:#888; font-size:11px; min-width:64px; }
.ed-statusbar { display:flex; align-items:center; padding:0 10px; background:#007acc; color:#fff; font-size:11px; flex-shrink:0; height:22px; gap:16px; }
.ed-statusbar-right { margin-left:auto; }
`;
        document.head.appendChild(s);
    }

    const root = document.createElement('div');
    root.className = 'ed-root';
    body.appendChild(root);

    const winEl = document.getElementById(windowId);
    let isDirty = false;

    function setDirty(d) {
        isDirty = d;
        const tb = winEl?.querySelector('.title-bar-text');
        if (tb) tb.innerHTML = `<img class="app-icon-title-bar" src="icons/16/text-editor.png"> ${d ? '● ' : ''}Text Editor — ${item.name || 'Untitled'}`;
    }

    // ── Menubar ──────────────────────────────────────────────
    const menubar = document.createElement('div');
    menubar.className = 'ed-menubar';
    root.appendChild(menubar);

    let openDropdown = null;
    function closeMenus() {
        menubar.querySelectorAll('.ed-dropdown').forEach(d => d.classList.remove('open'));
        menubar.querySelectorAll('.ed-menu-item').forEach(m => m.classList.remove('open'));
        openDropdown = null;
    }

    function makeMenu(label, entries) {
        const mi = document.createElement('div');
        mi.className = 'ed-menu-item';
        mi.textContent = label;
        const dd = document.createElement('div');
        dd.className = 'ed-dropdown';
        for (const entry of entries) {
            if (entry.sep) { const sep = document.createElement('div'); sep.className = 'ed-dd-sep'; dd.appendChild(sep); continue; }
            const row = document.createElement('div');
            row.className = 'ed-dd-item' + (entry.disabled ? ' disabled' : '');
            const lbl = document.createElement('span'); lbl.textContent = entry.label; row.appendChild(lbl);
            if (entry.shortcut) { const sc = document.createElement('span'); sc.className = 'ed-dd-shortcut'; sc.textContent = entry.shortcut; row.appendChild(sc); }
            row.onmousedown = (e) => { e.stopPropagation(); closeMenus(); if (!entry.disabled) entry.action(); };
            dd.appendChild(row);
        }
        mi.appendChild(dd);
        mi.addEventListener('click', (e) => { e.stopPropagation(); const isOpen = dd.classList.contains('open'); closeMenus(); if (!isOpen) { dd.classList.add('open'); mi.classList.add('open'); openDropdown = dd; } });
        mi.addEventListener('mouseenter', () => { if (openDropdown && openDropdown !== dd) { closeMenus(); dd.classList.add('open'); mi.classList.add('open'); openDropdown = dd; } });
        menubar.appendChild(mi);
    }

    const outsideClose = (e) => { if (!menubar.contains(e.target)) closeMenus(); if (!document.contains(menubar)) document.removeEventListener('mousedown', outsideClose); };
    document.addEventListener('mousedown', outsideClose);

    // ── Textarea ─────────────────────────────────────────────
    const ta = document.createElement('textarea');
    ta.className = 'ed-textarea';
    let text = '';
    if (item.content) {
        if (item.content instanceof ArrayBuffer) text = new TextDecoder().decode(item.content);
        else text = String(item.content);
    }
    ta.value = text;

    // ── Find bar ─────────────────────────────────────────────
    const findBar = document.createElement('div');
    findBar.className = 'ed-find-bar';
    const findInput = document.createElement('input');
    findInput.className = 'ed-find-input';
    findInput.placeholder = 'Find…';
    findInput.type = 'text';
    const findCount = document.createElement('span');
    findCount.className = 'ed-find-count';
    const findPrev = document.createElement('button');
    findPrev.className = 'small-btn'; findPrev.textContent = '↑'; findPrev.title = 'Previous';
    const findNext = document.createElement('button');
    findNext.className = 'small-btn'; findNext.textContent = '↓'; findNext.title = 'Next';
    const findClose = document.createElement('button');
    findClose.className = 'small-btn'; findClose.textContent = '✕';
    findBar.append(findInput, findCount, findPrev, findNext, findClose);

    let findMatches = [], findIdx = -1;
    function doFind() {
        const q = findInput.value;
        findMatches = [];
        if (!q) { findCount.textContent = ''; return; }
        const val = ta.value, qLow = q.toLowerCase();
        let i = 0;
        while ((i = val.toLowerCase().indexOf(qLow, i)) !== -1) { findMatches.push(i); i += qLow.length; }
        if (!findMatches.length) { findCount.textContent = 'No results'; findIdx = -1; return; }
        findIdx = 0; selectFindMatch();
    }
    function selectFindMatch() {
        if (!findMatches.length) return;
        findIdx = ((findIdx % findMatches.length) + findMatches.length) % findMatches.length;
        const pos = findMatches[findIdx];
        ta.focus(); ta.setSelectionRange(pos, pos + findInput.value.length);
        findCount.textContent = `${findIdx + 1} / ${findMatches.length}`;
    }
    findInput.addEventListener('input', doFind);
    findInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { findIdx += e.shiftKey ? -1 : 1; selectFindMatch(); e.preventDefault(); } if (e.key === 'Escape') { findBar.classList.remove('open'); ta.focus(); } });
    findPrev.onclick = () => { findIdx--; selectFindMatch(); };
    findNext.onclick = () => { findIdx++; selectFindMatch(); };
    findClose.onclick = () => { findBar.classList.remove('open'); ta.focus(); };

    function toggleFind() {
        if (findBar.classList.contains('open')) { findBar.classList.remove('open'); ta.focus(); }
        else { findBar.classList.add('open'); findInput.value = ''; findCount.textContent = ''; requestAnimationFrame(() => findInput.focus()); }
    }

    // ── Status bar ───────────────────────────────────────────
    const statusbar = document.createElement('div');
    statusbar.className = 'ed-statusbar';
    const statusPos = document.createElement('span');
    const statusChars = document.createElement('span');
    statusChars.className = 'ed-statusbar-right';
    statusbar.append(statusPos, statusChars);

    function updateStatus() {
        const val = ta.value, sel = ta.selectionStart;
        const lines = val.substring(0, sel).split('\n');
        statusPos.textContent = `Ln ${lines.length}, Col ${lines[lines.length - 1].length + 1}`;
        statusChars.textContent = `${val.length} chars`;
    }

    // ── Actions ───────────────────────────────────────────────
    async function doSave() {
        if (!item.id) { doDownload(); return; }
        item.content = ta.value;
        item.updatedAt = Date.now();
        await idbPut(item);
        setDirty(false);
    }
    function doDownload() {
        const blob = new Blob([ta.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = item.name || 'untitled.txt'; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // ── Menus ─────────────────────────────────────────────────
    makeMenu('File', [
        { label: 'New', shortcut: 'Ctrl+N', action: () => spawnApp('editor', {}) },
        { sep: true },
        { label: item.id ? 'Save' : 'Save (no file)', shortcut: 'Ctrl+S', disabled: !item.id, action: doSave },
        { label: 'Download', action: doDownload },
        { sep: true },
        { label: 'Close', action: () => closeWindow(windowId) },
    ]);
    makeMenu('Edit', [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => { ta.focus(); document.execCommand('undo'); } },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: () => { ta.focus(); document.execCommand('redo'); } },
        { sep: true },
        { label: 'Cut', shortcut: 'Ctrl+X', action: () => { ta.focus(); document.execCommand('cut'); } },
        { label: 'Copy', shortcut: 'Ctrl+C', action: () => { ta.focus(); document.execCommand('copy'); } },
        { label: 'Paste', shortcut: 'Ctrl+V', action: () => { ta.focus(); document.execCommand('paste'); } },
        { sep: true },
        { label: 'Select All', shortcut: 'Ctrl+A', action: () => { ta.focus(); ta.select(); } },
        { sep: true },
        { label: 'Find…', shortcut: 'Ctrl+F', action: toggleFind },
    ]);

    // ── Assemble ──────────────────────────────────────────────
    root.append(ta, findBar, statusbar);

    ta.addEventListener('input', () => { if (!isDirty) setDirty(true); updateStatus(); });
    ta.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); doSave(); }
        if (e.ctrlKey && e.key === 'f') { e.preventDefault(); toggleFind(); }
        if (e.ctrlKey && e.key === 'n') { e.preventDefault(); spawnApp('editor', {}); }
    });
    ta.addEventListener('click', updateStatus);
    ta.addEventListener('keyup', updateStatus);

    updateStatus();
    setDirty(false);
    ta.focus();
}

function _buildImageBody(body, item) {
    body.style.cssText = 'background:#0a0a0a;display:flex;flex-direction:column;height:100%;overflow:hidden;';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 8px;background:#141414;border-bottom:1px solid #000;flex-shrink:0;';

    const filenameSpan = document.createElement('span');
    filenameSpan.style.cssText = 'color:#888;font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    filenameSpan.textContent = item.name || '';
    toolbar.appendChild(filenameSpan);

    const exifBtn = document.createElement('button');
    exifBtn.className = 'small-btn';
    exifBtn.textContent = 'ℹ EXIF';
    toolbar.appendChild(exifBtn);
    body.appendChild(toolbar);

    // Content row
    const contentRow = document.createElement('div');
    contentRow.style.cssText = 'flex:1;display:flex;overflow:hidden;';
    body.appendChild(contentRow);

    // Image area
    const imgArea = document.createElement('div');
    imgArea.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;';
    contentRow.appendChild(imgArea);

    const img = document.createElement('img');
    img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;';

    let imgBlob = null;

    if (item.content) {
        const mimeType = item.mime || ('image/' + getExt(item.name));
        imgBlob = new Blob([item.content], { type: mimeType });
        const src = URL.createObjectURL(imgBlob);
        img.src = src;
        img._blobUrl = src;
        const observer = new MutationObserver(() => {
            if (!document.contains(body)) {
                URL.revokeObjectURL(src);
                observer.disconnect();
            }
        });
        observer.observe(document.getElementById('windowContainer'), { childList: true, subtree: true });
    }
    imgArea.appendChild(img);

    // EXIF panel (hidden by default)
    const exifPanel = document.createElement('div');
    exifPanel.style.cssText = 'width:240px;min-width:240px;background:#111;border-left:1px solid #1a1a1a;overflow-y:auto;display:none;flex-direction:column;';
    contentRow.appendChild(exifPanel);

    let exifLoaded = false;
    let panelOpen = false;

    exifBtn.onclick = async () => {
        panelOpen = !panelOpen;
        exifPanel.style.display = panelOpen ? 'flex' : 'none';
        exifBtn.style.borderColor = panelOpen ? '#3b82f6' : '';
        exifBtn.style.color = panelOpen ? '#60a5fa' : '';

        if (panelOpen && !exifLoaded) {
            exifLoaded = true;
            exifPanel.innerHTML = '<div style="padding:16px;color:#555;font-size:12px;text-align:center;">Parsing EXIF…</div>';
            await _renderExifPanel(exifPanel, imgBlob, item);
        }
    };
}

function _buildVideoBody(body, item, windowId) {
    // ── Inject styles once ──────────────────────────────────────────
    if (!document.getElementById('vp-styles')) {
        const s = document.createElement('style');
        s.id = 'vp-styles';
        s.textContent = `
        .vp-root {
            position:relative; width:100%; height:100%;
            background:#000; display:flex; flex-direction:column;
            overflow:hidden; font-family:'Segoe UI',system-ui,sans-serif;
            user-select:none;
        }
        .vp-video-wrap {
            flex:1; display:flex; align-items:center; justify-content:center;
            position:relative; overflow:hidden; cursor:none;
            background: #000;
        }
        .vp-video-wrap.cursor-visible { cursor:default; }
        .vp-video {
            max-width:100%; max-height:100%; display:block;
            object-fit:contain;
        }

        /* ── big center play/pause flash ── */
        .vp-flash {
            position:absolute; top:50%; left:50%;
            transform:translate(-50%,-50%) scale(0.5);
            width:72px; height:72px; border-radius:50%;
            background:rgba(0,0,0,.55); backdrop-filter:blur(8px);
            display:flex; align-items:center; justify-content:center;
            color:#fff; font-size:28px;
            opacity:0; pointer-events:none;
            transition: opacity .12s, transform .12s;
        }
        .vp-flash.show {
            opacity:1; transform:translate(-50%,-50%) scale(1);
            animation: vp-flash-anim .5s ease forwards;
        }
        @keyframes vp-flash-anim {
            0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
            60%  { opacity:.9; transform:translate(-50%,-50%) scale(1.15); }
            100% { opacity:0; transform:translate(-50%,-50%) scale(1.05); }
        }

        /* ── buffering spinner ── */
        .vp-spinner {
            position:absolute; top:50%; left:50%;
            transform:translate(-50%,-50%);
            width:44px; height:44px;
            border:3px solid rgba(255,255,255,.12);
            border-top-color:rgba(255,255,255,.8);
            border-radius:50%;
            animation:vp-spin .7s linear infinite;
            display:none; pointer-events:none;
        }
        .vp-spinner.active { display:block; }
        @keyframes vp-spin { to { transform:translate(-50%,-50%) rotate(360deg); } }

        /* ── top bar (filename) ── */
        .vp-topbar {
            position:absolute; top:0; left:0; right:0;
            padding:10px 16px 28px;
            background:linear-gradient(to bottom,rgba(0,0,0,.75) 0%,transparent 100%);
            color:rgba(255,255,255,.85); font-size:13px; font-weight:500;
            pointer-events:none; opacity:0;
            transition:opacity .25s;
            white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .vp-topbar.visible { opacity:1; }

        /* ── controls overlay ── */
        .vp-controls {
            position:absolute; bottom:0; left:0; right:0;
            padding:20px 14px 10px;
            background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.3) 70%,transparent 100%);
            opacity:0; transition:opacity .25s;
        }
        .vp-controls.visible { opacity:1; }

        /* ── seekbar row ── */
        .vp-seek-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
        .vp-time { font-size:12px; color:rgba(255,255,255,.8); white-space:nowrap; font-variant-numeric:tabular-nums; }
        .vp-seek-wrap {
            flex:1; height:18px; display:flex; align-items:center;
            position:relative; cursor:pointer;
        }
        .vp-seek-track {
            width:100%; height:4px; border-radius:2px;
            background:rgba(255,255,255,.18); position:relative; overflow:visible;
            transition:height .12s;
        }
        .vp-seek-wrap:hover .vp-seek-track { height:6px; }
        .vp-seek-buffered {
            position:absolute; top:0; left:0; height:100%;
            background:rgba(255,255,255,.28); border-radius:2px;
        }
        .vp-seek-fill {
            position:absolute; top:0; left:0; height:100%;
            background:linear-gradient(90deg,#3b82f6,#60a5fa);
            border-radius:2px; transition:width .08s linear;
        }
        .vp-seek-thumb {
            position:absolute; top:50%; width:14px; height:14px;
            background:#fff; border-radius:50%; box-shadow:0 1px 4px rgba(0,0,0,.5);
            transform:translate(-50%,-50%) scale(0);
            transition:transform .12s;
            pointer-events:none;
        }
        .vp-seek-wrap:hover .vp-seek-thumb { transform:translate(-50%,-50%) scale(1); }

        /* seek tooltip */
        .vp-seek-tooltip {
            position:absolute; bottom:24px;
            background:rgba(0,0,0,.8); color:#fff; font-size:11px;
            padding:3px 7px; border-radius:4px; pointer-events:none;
            white-space:nowrap; transform:translateX(-50%); display:none;
        }
        .vp-seek-wrap:hover .vp-seek-tooltip { display:block; }

        /* ── bottom button row ── */
        .vp-btn-row {
            display:flex; align-items:center; gap:2px;
        }
        .vp-btn {
            width:34px; height:34px; border-radius:6px; border:none;
            background:transparent; color:rgba(255,255,255,.82); cursor:pointer;
            display:flex; align-items:center; justify-content:center;
            font-size:14px; transition:background .1s, color .1s; flex-shrink:0;
            padding:0;
        }
        .vp-btn:hover { background:rgba(255,255,255,.12); color:#fff; }
        .vp-btn.active { color:#60a5fa; }
        .vp-btn svg { width:16px; height:16px; pointer-events:none; }
        .vp-btn-lg { width:40px; height:40px; font-size:17px; }

        .vp-spacer { flex:1; }

        /* volume */
        .vp-vol-wrap {
            display:flex; align-items:center; gap:5px; flex-shrink:0;
        }
        .vp-vol-slider-wrap {
            width:0; overflow:hidden; transition:width .2s;
        }
        .vp-vol-wrap:hover .vp-vol-slider-wrap { width:72px; }
        .vp-vol-slider {
            width:72px; appearance:none; height:4px; border-radius:2px;
            background:rgba(255,255,255,.25); outline:none; cursor:pointer;
        }
        .vp-vol-slider::-webkit-slider-thumb {
            appearance:none; width:12px; height:12px; border-radius:50%;
            background:#fff; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,.4);
        }

        /* speed picker */
        .vp-speed-wrap { position:relative; }
        .vp-speed-btn {
            font-size:11px !important; font-weight:700; letter-spacing:-.3px;
            width:auto !important; padding:0 8px !important;
        }
        .vp-speed-menu {
            position:absolute; bottom:42px; right:0;
            background:rgba(18,18,18,.97); border:1px solid rgba(255,255,255,.1);
            border-radius:8px; overflow:hidden; display:none;
            box-shadow:0 8px 32px rgba(0,0,0,.8); min-width:90px;
            backdrop-filter:blur(12px);
        }
        .vp-speed-menu.open { display:block; }
        .vp-speed-item {
            padding:7px 16px; font-size:12px; color:rgba(255,255,255,.7);
            cursor:pointer; transition:background .1s; text-align:center;
        }
        .vp-speed-item:hover { background:rgba(255,255,255,.08); color:#fff; }
        .vp-speed-item.active { color:#60a5fa; font-weight:600; }

        /* chapters */
        .vp-chapter-pip {
            position:absolute; top:0; height:100%; width:2px;
            background:rgba(255,255,255,.4); pointer-events:none; border-radius:1px;
        }

        /* error state */
        .vp-error {
            position:absolute; inset:0; display:flex; flex-direction:column;
            align-items:center; justify-content:center; gap:10px;
            color:rgba(255,255,255,.5); font-size:14px;
        }
        .vp-error svg { width:48px; height:48px; opacity:.3; }

        /* keyboard hint */
        .vp-kbd-hint {
            position:absolute; top:50%; left:50%;
            transform:translate(-50%,-50%);
            background:rgba(0,0,0,.6); color:rgba(255,255,255,.8);
            padding:8px 16px; border-radius:8px; font-size:13px;
            pointer-events:none; opacity:0; white-space:nowrap;
            transition:opacity .15s;
        }
        .vp-kbd-hint.show {
            animation: vp-hint-anim .9s ease forwards;
        }
        @keyframes vp-hint-anim {
            0%  { opacity:1; }
            60% { opacity:1; }
            100%{ opacity:0; }
        }

        /* skip indicator */
        .vp-skip-indicator {
            position:absolute; top:50%; font-size:13px;
            background:rgba(0,0,0,.55); color:#fff; padding:6px 14px;
            border-radius:20px; backdrop-filter:blur(6px);
            pointer-events:none; opacity:0; transform:translateY(-50%);
        }
        .vp-skip-indicator.left  { left:14%; }
        .vp-skip-indicator.right { right:14%; }
        .vp-skip-indicator.show  { animation:vp-hint-anim .8s ease forwards; }

        /* pip badge */
        .vp-pip-overlay {
            position:absolute; inset:0; display:none;
            align-items:center; justify-content:center;
            background:rgba(0,0,0,.7); color:rgba(255,255,255,.5);
            font-size:13px; gap:8px; flex-direction:column;
        }
        .vp-pip-overlay.active { display:flex; }
        .vp-pip-overlay svg { width:48px; height:48px; opacity:.4; }
        `;
        document.head.appendChild(s);
    }

    // ── Resize window to be more cinematic ─────────────────────────
    const winEl = document.getElementById(windowId);
    if (winEl) { winEl.style.width = '860px'; winEl.style.height = '560px'; }

    body.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;background:#000;';

    // ── Root layout ─────────────────────────────────────────────────
    const root = document.createElement('div');
    root.className = 'vp-root';
    body.appendChild(root);

    // ── Video element ────────────────────────────────────────────────
    const videoWrap = document.createElement('div');
    videoWrap.className = 'vp-video-wrap';
    root.appendChild(videoWrap);

    const video = document.createElement('video');
    video.className = 'vp-video';
    video.preload = 'metadata';
    videoWrap.appendChild(video);

    // ── Overlay elements ─────────────────────────────────────────────
    const flashEl = document.createElement('div');
    flashEl.className = 'vp-flash';
    videoWrap.appendChild(flashEl);

    const spinner = document.createElement('div');
    spinner.className = 'vp-spinner';
    videoWrap.appendChild(spinner);

    const topBar = document.createElement('div');
    topBar.className = 'vp-topbar';
    topBar.textContent = item.name || 'Video';
    videoWrap.appendChild(topBar);

    const kbdHint = document.createElement('div');
    kbdHint.className = 'vp-kbd-hint';
    videoWrap.appendChild(kbdHint);

    const skipLeft = document.createElement('div');
    skipLeft.className = 'vp-skip-indicator left';
    videoWrap.appendChild(skipLeft);

    const skipRight = document.createElement('div');
    skipRight.className = 'vp-skip-indicator right';
    videoWrap.appendChild(skipRight);

    const pipOverlay = document.createElement('div');
    pipOverlay.className = 'vp-pip-overlay';
    pipOverlay.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="15" rx="2"/><rect x="12" y="13" width="8" height="7" rx="1" fill="currentColor" opacity=".4"/></svg><span>Playing in Picture-in-Picture</span>`;
    videoWrap.appendChild(pipOverlay);

    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'vp-error';
    errorOverlay.style.display = 'none';
    errorOverlay.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".5" fill="currentColor"/></svg><span>Could not play this file</span>`;
    videoWrap.appendChild(errorOverlay);

    // ── Controls overlay ─────────────────────────────────────────────
    const controls = document.createElement('div');
    controls.className = 'vp-controls';
    videoWrap.appendChild(controls);

    // Seek row
    const seekRow = document.createElement('div');
    seekRow.className = 'vp-seek-row';

    const timeCurrent = document.createElement('span');
    timeCurrent.className = 'vp-time';
    timeCurrent.textContent = '0:00';

    const seekWrap = document.createElement('div');
    seekWrap.className = 'vp-seek-wrap';

    const seekTrack = document.createElement('div');
    seekTrack.className = 'vp-seek-track';

    const seekBuffered = document.createElement('div');
    seekBuffered.className = 'vp-seek-buffered';
    seekBuffered.style.width = '0%';

    const seekFill = document.createElement('div');
    seekFill.className = 'vp-seek-fill';
    seekFill.style.width = '0%';

    const seekThumb = document.createElement('div');
    seekThumb.className = 'vp-seek-thumb';
    seekThumb.style.left = '0%';

    const seekTooltip = document.createElement('div');
    seekTooltip.className = 'vp-seek-tooltip';
    seekTooltip.textContent = '0:00';

    seekTrack.appendChild(seekBuffered);
    seekTrack.appendChild(seekFill);
    seekTrack.appendChild(seekThumb);
    seekWrap.appendChild(seekTrack);
    seekWrap.appendChild(seekTooltip);

    const timeDuration = document.createElement('span');
    timeDuration.className = 'vp-time';
    timeDuration.textContent = '0:00';

    seekRow.appendChild(timeCurrent);
    seekRow.appendChild(seekWrap);
    seekRow.appendChild(timeDuration);
    controls.appendChild(seekRow);

    // Button row
    const btnRow = document.createElement('div');
    btnRow.className = 'vp-btn-row';
    controls.appendChild(btnRow);

    function mkBtn(svgOrText, title, cls = '') {
        const b = document.createElement('button');
        b.className = 'vp-btn ' + cls;
        b.title = title;
        b.innerHTML = svgOrText;
        btnRow.appendChild(b);
        return b;
    }

    const SVG = {
        play: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>`,
        pause: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
        back10: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5V1L7 6l5 5V7a7 7 0 11-7 7h0"/><text x="7" y="19" font-size="5.5" fill="currentColor" stroke="none" font-family="sans-serif" font-weight="700">10</text></svg>`,
        fwd10: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5V1l5 5-5 5V7a7 7 0 107 7h0"/><text x="7" y="19" font-size="5.5" fill="currentColor" stroke="none" font-family="sans-serif" font-weight="700">10</text></svg>`,
        prev: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4"/><rect x="5" y="4" width="3" height="16"/></svg>`,
        next: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20"/><rect x="16" y="4" width="3" height="16"/></svg>`,
        volHigh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"/><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/></svg>`,
        volLow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>`,
        volMute: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
        loop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>`,
        pip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="20" height="15" rx="2"/><rect x="12" y="13" width="8" height="7" rx="1"/></svg>`,
        fs: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
        fsExit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>`,
    };

    const playBtn = mkBtn(SVG.play, 'Play/Pause (Space)', 'vp-btn-lg');
    mkBtn(SVG.back10, 'Back 10s (←)');
    mkBtn(SVG.fwd10, 'Forward 10s (→)');

    btnRow.appendChild(Object.assign(document.createElement('div'), { className: 'vp-spacer' }));

    // Volume
    const volWrap = document.createElement('div');
    volWrap.className = 'vp-vol-wrap';
    const volBtn = document.createElement('button');
    volBtn.className = 'vp-btn';
    volBtn.title = 'Mute (M)';
    volBtn.innerHTML = SVG.volHigh;
    const volSliderWrap = document.createElement('div');
    volSliderWrap.className = 'vp-vol-slider-wrap';
    const volSlider = document.createElement('input');
    volSlider.type = 'range'; volSlider.min = 0; volSlider.max = 1;
    volSlider.step = 0.02; volSlider.value = 1;
    volSlider.className = 'vp-vol-slider';
    volSliderWrap.appendChild(volSlider);
    volWrap.appendChild(volBtn);
    volWrap.appendChild(volSliderWrap);
    btnRow.appendChild(volWrap);

    // Speed picker
    const speedWrap = document.createElement('div');
    speedWrap.className = 'vp-speed-wrap';
    const speedBtn = document.createElement('button');
    speedBtn.className = 'vp-btn vp-speed-btn';
    speedBtn.title = 'Playback speed';
    speedBtn.textContent = '1×';
    const speedMenu = document.createElement('div');
    speedMenu.className = 'vp-speed-menu';
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4];
    speeds.forEach(sp => {
        const it = document.createElement('div');
        it.className = 'vp-speed-item' + (sp === 1 ? ' active' : '');
        it.textContent = sp + '×';
        it.dataset.speed = sp;
        it.onclick = (e) => {
            e.stopPropagation();
            video.playbackRate = sp;
            speedBtn.textContent = sp + '×';
            speedBtn.classList.toggle('active', sp !== 1);
            speedMenu.querySelectorAll('.vp-speed-item').forEach(i =>
                i.classList.toggle('active', parseFloat(i.dataset.speed) === sp));
            speedMenu.classList.remove('open');
        };
        speedMenu.appendChild(it);
    });
    speedBtn.onclick = (e) => { e.stopPropagation(); speedMenu.classList.toggle('open'); };
    speedWrap.appendChild(speedBtn);
    speedWrap.appendChild(speedMenu);
    btnRow.appendChild(speedWrap);

    // Loop
    const loopBtn = document.createElement('button');
    loopBtn.className = 'vp-btn';
    loopBtn.title = 'Loop (L)';
    loopBtn.innerHTML = SVG.loop;
    btnRow.appendChild(loopBtn);

    // PiP
    const pipBtn = document.createElement('button');
    pipBtn.className = 'vp-btn';
    pipBtn.title = 'Picture-in-Picture (P)';
    pipBtn.innerHTML = SVG.pip;
    btnRow.appendChild(pipBtn);

    // Fullscreen
    const fsBtn = document.createElement('button');
    fsBtn.className = 'vp-btn';
    fsBtn.title = 'Fullscreen (F)';
    fsBtn.innerHTML = SVG.fs;
    btnRow.appendChild(fsBtn);

    // ── Load source ───────────────────────────────────────────────────
    let blobUrl = null;
    if (item.content) {
        const mimeType = item.mime || ('video/' + getExt(item.name));
        const blob = new Blob([item.content], { type: mimeType });
        blobUrl = URL.createObjectURL(blob);
        video.src = blobUrl;
    }

    // ── Cleanup on window close ───────────────────────────────────────
    const cleanupObserver = new MutationObserver(() => {
        if (!document.contains(root)) {
            video.pause();
            if (blobUrl) URL.revokeObjectURL(blobUrl);
            cleanupObserver.disconnect();
        }
    });
    cleanupObserver.observe(document.getElementById('windowContainer'), { childList: true, subtree: true });

    // ── Helper functions ──────────────────────────────────────────────
    function fmtTime(s) {
        if (!isFinite(s)) return '0:00';
        s = Math.floor(s);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        return `${m}:${String(sec).padStart(2, '0')}`;
    }

    function flash(icon) {
        flashEl.innerHTML = icon;
        flashEl.classList.remove('show');
        void flashEl.offsetWidth;
        flashEl.classList.add('show');
    }

    function showHint(text) {
        kbdHint.textContent = text;
        kbdHint.classList.remove('show');
        void kbdHint.offsetWidth;
        kbdHint.classList.add('show');
    }

    function showSkip(dir, secs) {
        const el = dir === 'left' ? skipLeft : skipRight;
        el.textContent = (dir === 'left' ? '◀◀ ' : '▶▶ ') + secs + 's';
        el.classList.remove('show');
        void el.offsetWidth;
        el.classList.add('show');
    }

    function updateVolIcon() {
        if (video.muted || video.volume === 0) volBtn.innerHTML = SVG.volMute;
        else if (video.volume < 0.5) volBtn.innerHTML = SVG.volLow;
        else volBtn.innerHTML = SVG.volHigh;
    }

    function updatePlayBtn() {
        playBtn.innerHTML = video.paused ? SVG.play : SVG.pause;
    }

    function updateSeek() {
        if (!video.duration) return;
        const pct = (video.currentTime / video.duration) * 100;
        seekFill.style.width = pct + '%';
        seekThumb.style.left = pct + '%';
        timeCurrent.textContent = fmtTime(video.currentTime);
        // Buffered
        if (video.buffered.length > 0) {
            const bEnd = video.buffered.end(video.buffered.length - 1);
            seekBuffered.style.width = ((bEnd / video.duration) * 100) + '%';
        }
    }

    // ── Auto-hide controls ────────────────────────────────────────────
    let hideTimer = null;
    function showControls() {
        controls.classList.add('visible');
        topBar.classList.add('visible');
        videoWrap.classList.add('cursor-visible');
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            if (!video.paused) {
                controls.classList.remove('visible');
                topBar.classList.remove('visible');
                videoWrap.classList.remove('cursor-visible');
            }
        }, 2800);
    }

    videoWrap.addEventListener('mousemove', showControls);
    videoWrap.addEventListener('mouseenter', showControls);
    controls.addEventListener('mouseenter', () => {
        clearTimeout(hideTimer);
        controls.classList.add('visible');
        topBar.classList.add('visible');
        videoWrap.classList.add('cursor-visible');
    });

    // ── Video events ─────────────────────────────────────────────────
    video.addEventListener('play', () => { updatePlayBtn(); spinner.classList.remove('active'); showControls(); });
    video.addEventListener('pause', () => { updatePlayBtn(); showControls(); });
    video.addEventListener('ended', () => { updatePlayBtn(); showControls(); });
    video.addEventListener('waiting', () => spinner.classList.add('active'));
    video.addEventListener('canplay', () => spinner.classList.remove('active'));
    video.addEventListener('timeupdate', updateSeek);
    video.addEventListener('durationchange', () => {
        timeDuration.textContent = fmtTime(video.duration);
    });
    video.addEventListener('volumechange', () => {
        updateVolIcon();
        volSlider.value = video.muted ? 0 : video.volume;
    });
    video.addEventListener('error', () => {
        errorOverlay.style.display = 'flex';
        spinner.classList.remove('active');
    });
    video.addEventListener('enterpictureinpicture', () => {
        pipOverlay.classList.add('active');
        pipBtn.classList.add('active');
    });
    video.addEventListener('leavepictureinpicture', () => {
        pipOverlay.classList.remove('active');
        pipBtn.classList.remove('active');
    });

    // ── Click to play/pause ───────────────────────────────────────────
    let clickTimer = null;
    videoWrap.addEventListener('click', (e) => {
        if (e.target === controls || controls.contains(e.target)) return;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            if (video.paused) { video.play(); flash(SVG.play); }
            else { video.pause(); flash(SVG.pause); }
        }, 200);
    });

    // Double-click to fullscreen
    videoWrap.addEventListener('dblclick', (e) => {
        if (e.target === controls || controls.contains(e.target)) return;
        clearTimeout(clickTimer);
        toggleFullscreen();
    });

    // ── Seek bar interaction ──────────────────────────────────────────
    let isSeeking = false;
    function seekTo(e) {
        const rect = seekWrap.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        video.currentTime = pct * video.duration;
        updateSeek();
    }
    seekWrap.addEventListener('mousedown', (e) => { isSeeking = true; seekTo(e); });
    window.addEventListener('mousemove', (e) => { if (isSeeking) seekTo(e); });
    window.addEventListener('mouseup', () => { isSeeking = false; });

    seekWrap.addEventListener('mousemove', (e) => {
        if (!video.duration) return;
        const rect = seekWrap.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        seekTooltip.textContent = fmtTime(pct * video.duration);
        seekTooltip.style.left = ((e.clientX - rect.left)) + 'px';
    });

    // ── Button actions ────────────────────────────────────────────────
    playBtn.onclick = () => {
        if (video.paused) { video.play(); flash(SVG.play); }
        else { video.pause(); flash(SVG.pause); }
    };

    btnRow.querySelectorAll('.vp-btn')[1].onclick = () => {
        video.currentTime = Math.max(0, video.currentTime - 10);
        showSkip('left', 10);
    };
    btnRow.querySelectorAll('.vp-btn')[2].onclick = () => {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        showSkip('right', 10);
    };

    volBtn.onclick = () => {
        video.muted = !video.muted;
        updateVolIcon();
    };
    volSlider.oninput = () => {
        video.volume = parseFloat(volSlider.value);
        video.muted = video.volume === 0;
        updateVolIcon();
    };

    loopBtn.onclick = () => {
        video.loop = !video.loop;
        loopBtn.classList.toggle('active', video.loop);
        showHint(video.loop ? 'Loop on' : 'Loop off');
    };

    pipBtn.onclick = async () => {
        if (!document.pictureInPictureEnabled) { showHint('PiP not supported'); return; }
        try {
            if (document.pictureInPictureElement) await document.exitPictureInPicture();
            else await video.requestPictureInPicture();
        } catch (e) { showHint('PiP unavailable'); }
    };

    function toggleFullscreen() {
        const target = root;
        if (!document.fullscreenElement) {
            target.requestFullscreen?.().catch(() => { });
            fsBtn.innerHTML = SVG.fsExit;
        } else {
            document.exitFullscreen?.();
            fsBtn.innerHTML = SVG.fs;
        }
    }
    fsBtn.onclick = toggleFullscreen;
    document.addEventListener('fullscreenchange', () => {
        fsBtn.innerHTML = document.fullscreenElement ? SVG.fsExit : SVG.fs;
    });

    // ── Scroll to seek / volume ───────────────────────────────────────
    videoWrap.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.shiftKey) {
            // Shift+scroll = volume
            const delta = e.deltaY < 0 ? 0.05 : -0.05;
            video.volume = Math.max(0, Math.min(1, video.volume + delta));
            video.muted = false;
            volSlider.value = video.volume;
            updateVolIcon();
            showHint(`Vol ${Math.round(video.volume * 100)}%`);
        } else {
            // Scroll = seek ±5s
            const delta = e.deltaY < 0 ? 5 : -5;
            video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + delta));
            showSkip(delta > 0 ? 'right' : 'left', Math.abs(delta));
        }
    }, { passive: false });

    // ── Keyboard shortcuts ────────────────────────────────────────────
    const winContainer = document.getElementById(windowId);
    if (winContainer) {
        winContainer.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            switch (e.code) {
                case 'Space': case 'KeyK':
                    e.preventDefault();
                    if (video.paused) { video.play(); flash(SVG.play); }
                    else { video.pause(); flash(SVG.pause); }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - (e.shiftKey ? 30 : 10));
                    showSkip('left', e.shiftKey ? 30 : 10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    video.currentTime = Math.min(video.duration, video.currentTime + (e.shiftKey ? 30 : 10));
                    showSkip('right', e.shiftKey ? 30 : 10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    video.volume = Math.min(1, video.volume + 0.1);
                    video.muted = false;
                    volSlider.value = video.volume;
                    updateVolIcon();
                    showHint(`Vol ${Math.round(video.volume * 100)}%`);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    video.volume = Math.max(0, video.volume - 0.1);
                    volSlider.value = video.volume;
                    updateVolIcon();
                    showHint(`Vol ${Math.round(video.volume * 100)}%`);
                    break;
                case 'KeyM':
                    video.muted = !video.muted;
                    updateVolIcon();
                    showHint(video.muted ? 'Muted' : 'Unmuted');
                    break;
                case 'KeyL':
                    video.loop = !video.loop;
                    loopBtn.classList.toggle('active', video.loop);
                    showHint(video.loop ? 'Loop on' : 'Loop off');
                    break;
                case 'KeyF':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'KeyP':
                    e.preventDefault();
                    pipBtn.onclick();
                    break;
                case 'Comma':
                    if (video.paused) { video.currentTime -= 1 / 30; showHint('⏮ 1 frame'); }
                    break;
                case 'Period':
                    if (video.paused) { video.currentTime += 1 / 30; showHint('⏭ 1 frame'); }
                    break;
                case 'Home':
                    e.preventDefault();
                    video.currentTime = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    video.currentTime = video.duration;
                    break;
                case 'Digit0': case 'Numpad0':
                    video.currentTime = 0; break;
                case 'Digit1': case 'Numpad1':
                    video.currentTime = video.duration * 0.1; break;
                case 'Digit2': case 'Numpad2':
                    video.currentTime = video.duration * 0.2; break;
                case 'Digit3': case 'Numpad3':
                    video.currentTime = video.duration * 0.3; break;
                case 'Digit4': case 'Numpad4':
                    video.currentTime = video.duration * 0.4; break;
                case 'Digit5': case 'Numpad5':
                    video.currentTime = video.duration * 0.5; break;
                case 'Digit6': case 'Numpad6':
                    video.currentTime = video.duration * 0.6; break;
                case 'Digit7': case 'Numpad7':
                    video.currentTime = video.duration * 0.7; break;
                case 'Digit8': case 'Numpad8':
                    video.currentTime = video.duration * 0.8; break;
                case 'Digit9': case 'Numpad9':
                    video.currentTime = video.duration * 0.9; break;
            }
        });
    }

    // Close speed menu on outside click
    document.addEventListener('click', () => speedMenu.classList.remove('open'));

    // ── Autoplay ──────────────────────────────────────────────────────
    video.autoplay = true;
    video.play().catch(() => { });
    showControls();
}

function _buildAudioBody(body, item, windowId) {
    body.style.background = '#000';
    body.style.alignItems = 'center';
    body.style.justifyContent = 'center';

    const audio = document.createElement('audio');
    audio.controls = true;
    audio.style.cssText = 'max-width:100%;max-height:100%;display:block;';
    audio.autoplay = true;

    if (item.content) {
        const mimeType = item.mime || ('audio/' + getExt(item.name));
        const blob = new Blob([item.content], { type: mimeType });
        const src = URL.createObjectURL(blob);
        audio.src = src;
        audio._blobUrl = src;
        const observer = new MutationObserver(() => {
            if (!document.contains(body)) {
                audio.pause();
                URL.revokeObjectURL(src);
                observer.disconnect();
            }
        });
        observer.observe(document.getElementById('windowContainer'), { childList: true, subtree: true });
    }
    body.appendChild(audio);
    audio.play().catch(() => { });
}

function _buildAboutBody(body) {
    body.style.textAlign = 'center';
    body.style.backgroundColor = "#222222";

    body.innerHTML = `
    <h1>${VERSION}</h1>
    `
}

function _buildErrorBody(body, error) {
    body.style.display = "flex";
    body.style.alignItems = "center";
    body.style.padding = "40px";
    body.style.paddingTop = "0px";
    body.style.backgroundColor = "#2e2e2e";

    body.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            gap: 24px;
            background: #3a3a3a;
            padding: 32px 40px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
            max-width: 600px;
            height: 100%;
            width: 100%;
        ">
            <div style="
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 64px;
                height: 64px;
            " id="iconWrapper_725">

            </div>

            <div style="
                color: #ffffff;
                font-size: 18px;
                line-height: 1.5;
            ">
                ${error}
            </div>
        </div>
    `;

    imgFromFS('/usr/share/icons/dialog-error.svg').then(img => {
        const wrapper = body.querySelector('#iconWrapper_725');
        img.width = "64";
        img.height = "64";
        if (wrapper) wrapper.appendChild(img);
    })
}

function _buildGameBody(body, gameName) {
    let frame = document.createElement("iframe");
    frame.src = `/games/${gameName}/`
    frame.frameBorder = "0";
    frame.style.width = "100%";
    frame.style.height = "100%";
    body.appendChild(frame);
}

/**
 * Load a custom-app icon into a target element.
 * customIcon can be:
 *   - a full virtual FS path  (/usr/share/icons/32/foo.png)  — loaded via loadIconImg
 *   - a legacy short name     (box, calculator, …)           — loaded from even_more_icons/
 *   - falsy                                                  — emoji fallback rendered
 */

function _loadCustomAppIcon(customIcon, emojiIcon, targetEl) {
    if (!targetEl) return;
    if (!customIcon) {
        targetEl.textContent = emojiIcon || '📦';
        return;
    }
    const isPath = customIcon.startsWith('/');
    const fsPath = isPath ? customIcon : `/usr/share/icons/32/${customIcon}.png`;
    const webPath = isPath ? '' : `../../../icons/even_more_icons/${customIcon}.png`;
    loadIconImg(fsPath, webPath, 'width:16px;height:16px;object-fit:contain;vertical-align:middle;')
        .then(img => {
            img.className = 'app-icon-title-bar';
            targetEl.innerHTML = '';
            targetEl.appendChild(img);
        })
        .catch(() => { targetEl.textContent = emojiIcon || '📦'; });
}

function _parseAppFile(raw) {
    const firstLine = raw.slice(0, raw.indexOf('\n')).trim();
    if (firstLine === '\\\\\\EDOGOSAPP 1.1' || firstLine === '!EDOGOSAPP 1.1') {
        // New delimited format
        const configMatch = raw.match(/\\\\\\CONFIG\r?\n([\s\S]*?)\\\\\\ENDCONFIG/);
        const contentMatch = raw.match(/\\\\\\CODESTART\r?\n([\s\S]*?)\\\\\\CODEEND/);
        if (!configMatch || !contentMatch) throw new Error('Malformed .app file: missing CONFIG or CODESTART block');
        const config = JSON.parse(configMatch[1]);
        config._html = contentMatch[1];
        return config;
    }
    // Legacy JSON format
    return JSON.parse(raw);
}

function spawnCustomApp(item) {
    let config;
    try {
        const text = item.content instanceof ArrayBuffer
            ? new TextDecoder().decode(item.content)
            : String(item.content || '');
        config = _parseAppFile(text);
    } catch (e) {
        spawnError('.app parse error: ' + e.message);
        return;
    }

    const {
        name = item.name.replace(/\.app$/i, ''),
        customIcon = '',
        icon = '📦',
        width = 800,
        height = 600,
    } = config;
    const html = config._html ?? config.html ?? '<p style="color:white;font-family:sans-serif;padding:20px">No HTML provided.</p>';

    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 30;
    const left = Math.min(60 + offset, window.innerWidth - width - 20);
    const top = Math.min(60 + offset, window.innerHeight - height - 60);

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.left = left + 'px';
    win.style.top = top + 'px';
    win.style.width = width + 'px';
    win.style.height = height + 'px';
    win.addEventListener('mousedown', () => focusWindow(windowId));

    // Icon placeholder — filled async so it works for both FS paths and legacy names
    win.innerHTML = `
    <div class="title-bar">
        <button class="window-close-button" title="Close">✕</button>
        <button class="window-minimize-button" title="Minimize">—</button>
        <button class="window-maximize-button" title="Maximize">□</button>
        <span class="title-bar-text"><span class="ca-tb-icon-${windowId}"></span> ${_escHtml(name)}</span>
    </div>
    <div class="app-body" style="height:calc(100% - var(--titlebar-height));overflow:hidden;"></div>
    `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'customapp', item } };

    _loadCustomAppIcon(customIcon, icon, win.querySelector(`.ca-tb-icon-${windowId}`));

    win.querySelector('.title-bar').addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });
    addResizeHandles(win);
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);
    win.querySelector('.window-maximize-button').onclick = () => maximizeWindow(windowId);

    // Render content in a sandboxed iframe
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals');

    const fsSDK = `
        <script>
        window.fs = (() => {
            let _id = 0;
            const _pending = new Map();

            window.addEventListener('message', (e) => {
                if (e.data?.channel !== 'edogfs' || e.data.id == null) return;
                const cb = _pending.get(e.data.id);
                if (cb) { _pending.delete(e.data.id); cb(e.data); }
            });

            function _call(action, args) {
                return new Promise((resolve, reject) => {
                    const id = ++_id;
                    _pending.set(id, (msg) => {
                        if (msg.error) reject(new Error(msg.error));
                        else resolve(msg.result);
                    });
                    window.parent.postMessage(
                        { channel: 'edogfs', id, action, args }, '*'
                    );
                });
            }

            return {
                username: '${getUsername()}',
                home:     '/home/${getUsername()}',
                readFile:  (path)       => _call('readFile',  { path }),
                writeFile: (path, text) => _call('writeFile', { path, text }),
                listDir:   (path)       => _call('listDir',   { path }),
                mkdir:     (path)       => _call('mkdir',      { path }),
                delete:    (path)       => _call('delete',     { path }),
                exists:    (path)       => _call('exists',     { path }),
            };
        })();

        window.os = (() => {
            let _id = 0;
            const _pending = new Map();

            window.addEventListener('message', (e) => {
                if (e.data?.channel !== 'edogos' || e.data.id == null) return;
                const cb = _pending.get(e.data.id);
                if (cb) { _pending.delete(e.data.id); cb(e.data); }
            });

            function _call(action, args = {}) {
                return new Promise((resolve, reject) => {
                    const id = ++_id;
                    _pending.set(id, (msg) => {
                        if (msg.error) reject(new Error(msg.error));
                        else resolve(msg.result);
                    });
                    window.parent.postMessage(
                        { channel: 'edogos', id, action, args }, '*'
                    );
                });
            }

            return {
                // Spawn a Blue Screen of Death. Both args are optional.
                spawnBSOD:    (errorCode, errorName) => _call('spawnBSOD',    { errorCode, errorName }),
                // Spawn an error dialog (type: 'error' | 'warning' | 'info')
                spawnError:   (text, type)           => _call('spawnError',   { text, type }),
                // Reboot or shut down the OS
                reboot:       ()                     => _call('reboot',       {}),
                shutdown:     ()                     => _call('shutdown',      {}),
                // Get the current OS version string
                getVersion:   ()                     => _call('getVersion',   {}),
            };
        })();
        <\/script>
    `;

    iframe.srcdoc = fsSDK + html;
    win.querySelector('.app-body').appendChild(iframe);

    // Taskbar button
    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    const tbIconSpan = document.createElement('span');
    tbBtn.appendChild(tbIconSpan);
    tbBtn.appendChild(document.createTextNode(' ' + name));
    _loadCustomAppIcon(customIcon, icon, tbIconSpan);

    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [{ label: 'Close', icon: 'close', action: () => closeWindow(windowId) }]);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));
    windows[windowId].taskbarBtn = tbBtn;

    focusWindow(windowId);
    return windowId;
}

// Image Viewer

async function _loadExifr() {
    if (window.exifr) return true;
    return new Promise(resolve => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/exifr/dist/full.umd.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.head.appendChild(s);
    });
}

async function _renderExifPanel(panel, blob, item) {
    const ok = await _loadExifr();
    if (!ok) {
        panel.innerHTML = '<div style="padding:16px;color:#f87171;font-size:12px;">Could not load EXIF library.</div>';
        return;
    }

    let data;
    try {
        data = await window.exifr.parse(blob, {
            tiff: true, exif: true, gps: true,
            interop: false, thumbnail: false,
        });
    } catch (e) {
        panel.innerHTML = `<div style="padding:16px;color:#f87171;font-size:12px;">Parse error: ${e.message}</div>`;
        return;
    }

    panel.innerHTML = '';

    // Always show file info
    _exifSection(panel, 'File', [
        ['Name', item.name],
        ['Type', item.mime || getExt(item.name).toUpperCase() || 'Image'],
        ['Size', formatBytes(item.size || item.content?.byteLength || 0)],
    ].filter(([, v]) => v));

    if (!data) {
        const msg = document.createElement('div');
        msg.style.cssText = 'padding:12px 14px;color:#555;font-size:11px;';
        msg.textContent = 'No EXIF metadata found.';
        panel.appendChild(msg);
        return;
    }

    // Camera
    const cameraRows = [
        ['Make', data.Make],
        ['Model', data.Model],
        ['Lens', data.LensModel],
        ['Software', data.Software],
    ].filter(([, v]) => v);
    if (cameraRows.length) _exifSection(panel, 'Camera', cameraRows);

    // Exposure
    const fmtExp = v => v ? (v < 1 ? `1/${Math.round(1 / v)}s` : `${v}s`) : null;
    const fmtAp = v => v ? `f/${v}` : null;
    const fmtFoc = v => v ? `${v}mm` : null;
    const fmtBias = v => v != null ? `${v > 0 ? '+' : ''}${v} EV` : null;

    const exposureRows = [
        ['Exposure', fmtExp(data.ExposureTime)],
        ['Aperture', fmtAp(data.FNumber)],
        ['ISO', data.ISO ?? data.ISOSpeedRatings],
        ['Focal Length', fmtFoc(data.FocalLength)],
        ['Exposure Bias', fmtBias(data.ExposureBiasValue)],
        ['Flash', _exifFmtFlash(data.Flash)],
        ['White Balance', _exifFmtWB(data.WhiteBalance)],
        ['Exposure Mode', _exifFmtExpMode(data.ExposureMode)],
        ['Metering', _exifFmtMetering(data.MeteringMode)],
    ].filter(([, v]) => v != null && v !== '');
    if (exposureRows.length) _exifSection(panel, 'Exposure', exposureRows);

    // Dates
    const dateRows = [
        ['Taken', _exifFmtDate(data.DateTimeOriginal)],
        ['Modified', _exifFmtDate(data.DateTime)],
        ['Digitized', _exifFmtDate(data.DateTimeDigitized)],
    ].filter(([, v]) => v);
    if (dateRows.length) _exifSection(panel, 'Date & Time', dateRows);

    // Image details
    const dimW = data.ImageWidth ?? data.ExifImageWidth;
    const dimH = data.ImageHeight ?? data.ExifImageHeight;
    const imageRows = [
        ['Width', dimW ? `${dimW}px` : null],
        ['Height', dimH ? `${dimH}px` : null],
        ['Orientation', _exifFmtOrientation(data.Orientation)],
        ['Color Space', data.ColorSpace === 1 ? 'sRGB' : data.ColorSpace ? String(data.ColorSpace) : null],
        ['Artist', data.Artist],
        ['Copyright', data.Copyright],
    ].filter(([, v]) => v);
    if (imageRows.length) _exifSection(panel, 'Image', imageRows);

    // GPS
    if (data.latitude != null && data.longitude != null) {
        const lat = data.latitude.toFixed(6);
        const lon = data.longitude.toFixed(6);
        _exifSection(panel, 'Location', [
            ['Latitude', lat],
            ['Longitude', lon],
            ['Altitude', data.GPSAltitude != null ? `${data.GPSAltitude.toFixed(1)}m` : null],
        ].filter(([, v]) => v));

        const mapLink = document.createElement('a');
        mapLink.href = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
        mapLink.target = '_blank';
        mapLink.style.cssText = 'display:block;margin:8px 12px 12px;padding:6px 10px;background:#0c74df;color:#fff;border-radius:5px;text-align:center;font-size:12px;text-decoration:none;';
        mapLink.textContent = '🗺 View on Map';
        panel.appendChild(mapLink);
    }
}

function _exifSection(panel, title, rows) {
    const section = document.createElement('div');
    section.style.cssText = 'border-bottom:1px solid #1a1a1a;padding-bottom:6px;';

    const header = document.createElement('div');
    header.style.cssText = 'padding:10px 12px 4px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#555;';
    header.textContent = title;
    section.appendChild(header);

    for (const [key, val] of rows) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;padding:3px 12px;gap:8px;';

        const k = document.createElement('span');
        k.style.cssText = 'width:90px;flex-shrink:0;color:#666;font-size:11px;line-height:1.5;';
        k.textContent = key;

        const v = document.createElement('span');
        v.style.cssText = 'flex:1;color:#bbb;font-size:11px;line-height:1.5;word-break:break-word;font-family:monospace;';
        v.textContent = String(val);

        row.appendChild(k);
        row.appendChild(v);
        section.appendChild(row);
    }

    panel.appendChild(section);
}

function _exifFmtDate(val) {
    if (!val) return null;
    if (val instanceof Date) return val.toLocaleString();
    if (typeof val === 'string') {
        const d = new Date(val.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3'));
        return isNaN(d) ? val : d.toLocaleString();
    }
    return null;
}

function _exifFmtFlash(val) {
    if (val == null) return null;
    return (val & 1) ? 'Fired' : 'Did not fire';
}

function _exifFmtWB(val) {
    if (val == null) return null;
    return val === 0 ? 'Auto' : 'Manual';
}

function _exifFmtExpMode(val) {
    if (val == null) return null;
    return ['Auto', 'Manual', 'Auto bracket'][val] ?? String(val);
}

function _exifFmtMetering(val) {
    if (val == null) return null;
    return [null, 'Average', 'Center-weighted', 'Spot', 'Multi-spot', 'Multi-segment', 'Partial'][val] ?? String(val);
}

function _exifFmtOrientation(val) {
    if (val == null) return null;
    const m = {
        1: 'Normal', 2: 'Flipped H', 3: 'Rotated 180°', 4: 'Flipped V',
        5: '90° CW + Flip', 6: '90° CW', 7: '90° CCW + Flip', 8: '90° CCW'
    };
    return m[val] ?? String(val);
}

/* ---- ZIP Viewer ---- */

const ZIP_SVG = {
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
    file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>`,
};

async function _buildZipBody(body, item) {
    body.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#2D2D2D;';

    const loader = document.createElement('div');
    loader.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;color:#888;font-size:13px;gap:10px;';
    loader.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:18px;height:18px;animation:spin 1s linear infinite;"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Loading archive…`;
    body.appendChild(loader);

    if (!document.getElementById('zip-spin-style')) {
        const s = document.createElement('style');
        s.id = 'zip-spin-style';
        s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(s);
    }

    let zip;
    try {
        if (!item.content) throw new Error('No content');
        const data = item.content instanceof ArrayBuffer ? item.content : new TextEncoder().encode(item.content).buffer;
        zip = await JSZip.loadAsync(data);
    } catch (err) {
        loader.innerHTML = `<span style="color:#f87171;">Failed to read archive: ${err.message}</span>`;
        return;
    }

    loader.remove();

    const allFiles = Object.values(zip.files);

    let currentPath = '';
    let sortCol = 'name';
    let sortAsc = true;

    const toolbar = document.createElement('div');
    toolbar.className = 'zip-toolbar';

    const upBtn = document.createElement('button');
    upBtn.innerHTML = ZIP_SVG.up;
    upBtn.title = 'Up one level';
    upBtn.style.padding = '4px 7px';
    upBtn.disabled = true;

    const pathEl = document.createElement('div');
    pathEl.className = 'zip-path';
    pathEl.textContent = '/';

    const extractAllBtn = document.createElement('button');
    extractAllBtn.textContent = 'Extract All';

    toolbar.appendChild(upBtn);
    toolbar.appendChild(pathEl);
    toolbar.appendChild(extractAllBtn);
    body.appendChild(toolbar);

    const listEl = document.createElement('div');
    listEl.className = 'zip-list';
    body.appendChild(listEl);

    const statusBar = document.createElement('div');
    statusBar.className = 'zip-statusbar';
    body.appendChild(statusBar);

    function entriesInDir(dirPath) {
        const prefix = dirPath === '' ? '' : dirPath + '/';
        const seen = new Set();
        const results = [];

        for (const f of allFiles) {
            if (!f.name.startsWith(prefix)) continue;
            const rest = f.name.slice(prefix.length);
            if (rest === '') continue;

            const slash = rest.indexOf('/');
            if (slash === -1) {
                if (!seen.has(rest)) { seen.add(rest); results.push(f); }
            } else {
                const dirName = rest.slice(0, slash);
                const syntheticKey = prefix + dirName + '/';
                if (!seen.has(syntheticKey)) {
                    seen.add(syntheticKey);
                    const explicit = allFiles.find(x => x.name === syntheticKey);
                    results.push(explicit || { name: syntheticKey, dir: true, _date: null, _size: 0 });
                }
            }
        }
        return results;
    }

    function entryDisplayName(entry) {
        const n = entry.name.endsWith('/') ? entry.name.slice(0, -1) : entry.name;
        return n.split('/').pop();
    }

    function entryIsDir(entry) {
        return entry.dir === true || entry.name.endsWith('/');
    }

    function sortEntries(entries) {
        return [...entries].sort((a, b) => {
            const aDir = entryIsDir(a), bDir = entryIsDir(b);
            if (aDir !== bDir) return aDir ? -1 : 1;

            let av, bv;
            if (sortCol === 'name') {
                av = entryDisplayName(a).toLowerCase();
                bv = entryDisplayName(b).toLowerCase();
            } else if (sortCol === 'size') {
                av = a._cachedSize ?? 0;
                bv = b._cachedSize ?? 0;
            } else if (sortCol === 'date') {
                av = a.date ? new Date(a.date).getTime() : 0;
                bv = b.date ? new Date(b.date).getTime() : 0;
            }
            const cmp = av < bv ? -1 : av > bv ? 1 : 0;
            return sortAsc ? cmp : -cmp;
        });
    }

    async function renderDir(dirPath) {
        currentPath = dirPath;
        pathEl.textContent = '/' + dirPath;
        upBtn.disabled = dirPath === '';

        const entries = entriesInDir(dirPath);
        const sorted = sortEntries(entries);

        const sizeCacheJobs = sorted.filter(e => !entryIsDir(e) && e._cachedSize === undefined).map(async e => {
            try {
                const buf = await e.async('arraybuffer');
                e._cachedSize = buf.byteLength;
            } catch { e._cachedSize = 0; }
        });
        await Promise.all(sizeCacheJobs);

        const re_sorted = sortEntries(entries);

        listEl.innerHTML = '';

        const table = document.createElement('table');

        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        const cols = [
            { key: 'name', label: 'Name', w: '55%' },
            { key: 'size', label: 'Size', w: '15%' },
            { key: 'date', label: 'Modified', w: '30%' },
        ];
        for (const col of cols) {
            const th = document.createElement('th');
            th.textContent = col.label;
            th.style.width = col.w;
            if (sortCol === col.key) th.className = sortAsc ? 'sorted-asc' : 'sorted-desc';
            th.onclick = () => {
                if (sortCol === col.key) sortAsc = !sortAsc;
                else { sortCol = col.key; sortAsc = true; }
                renderDir(currentPath);
            };
            headRow.appendChild(th);
        }
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        for (const entry of re_sorted) {
            const isDir = entryIsDir(entry);
            const name = entryDisplayName(entry);
            const tr = document.createElement('tr');

            const nameTd = document.createElement('td');
            const iconSpan = document.createElement('span');
            iconSpan.className = 'zi';
            iconSpan.style.color = isDir ? '#93c5fd' : '#888';
            iconSpan.innerHTML = isDir ? ZIP_SVG.folder : ZIP_SVG.file;
            nameTd.appendChild(iconSpan);
            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;
            if (isDir) nameSpan.style.color = '#93c5fd';
            nameTd.appendChild(nameSpan);
            tr.appendChild(nameTd);

            const sizeTd = document.createElement('td');
            sizeTd.style.color = '#888';
            sizeTd.style.textAlign = 'right';
            sizeTd.textContent = isDir ? '—' : formatBytes(entry._cachedSize ?? 0);
            tr.appendChild(sizeTd);

            const dateTd = document.createElement('td');
            dateTd.style.color = '#888';
            dateTd.textContent = entry.date ? new Date(entry.date).toLocaleString() : '—';
            tr.appendChild(dateTd);

            tr.onclick = () => {
                tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                tr.classList.add('selected');
            };
            tr.ondblclick = () => {
                if (isDir) {
                    const newPath = entry.name.endsWith('/') ? entry.name.slice(0, -1) : entry.name;
                    renderDir(newPath);
                } else {
                    extractEntry(entry);
                }
            };

            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        listEl.appendChild(table);

        const fileCount = re_sorted.filter(e => !entryIsDir(e)).length;
        const dirCount = re_sorted.filter(e => entryIsDir(e)).length;
        const totalBytes = re_sorted.filter(e => !entryIsDir(e)).reduce((s, e) => s + (e._cachedSize ?? 0), 0);
        statusBar.innerHTML = `<span>${fileCount} file${fileCount !== 1 ? 's' : ''}${dirCount ? ', ' + dirCount + ' folder' + (dirCount !== 1 ? 's' : '') : ''}</span><span>${formatBytes(totalBytes)} visible</span><span style="margin-left:auto;color:#555">Double-click to extract</span>`;
    }

    async function extractEntry(entry) {
        try {
            const buf = await entry.async('arraybuffer');
            const name = entryDisplayName(entry);
            const blob = new Blob([buf]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = name;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 2000);
        } catch (err) {
            alert('Failed to extract: ' + err.message);
        }
    }

    upBtn.onclick = () => {
        if (currentPath === '') return;
        const parts = currentPath.split('/');
        parts.pop();
        renderDir(parts.join('/'));
    };

    extractAllBtn.onclick = async () => {
        extractAllBtn.disabled = true;
        extractAllBtn.textContent = 'Extracting…';
        try {
            for (const f of allFiles) {
                if (!f.dir && !f.name.endsWith('/')) {
                    const buf = await f.async('arraybuffer');
                    const name = f.name.split('/').pop();
                    const blob = new Blob([buf]);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = name;
                    document.body.appendChild(a); a.click(); a.remove();
                    URL.revokeObjectURL(url);
                    await new Promise(r => setTimeout(r, 30));
                }
            }
        } finally {
            extractAllBtn.disabled = false;
            extractAllBtn.textContent = 'Extract All';
        }
    };

    await renderDir('');
}

/* ---- openFile dispatcher ---- */
function openFile(item) {
    const ext = getExt(item.name);
    if (IMAGE_EXTS.has(ext) || item.mime?.startsWith('image/')) {
        spawnApp('image', item);
    } else if (VIDEO_EXTS.has(ext) || item.mime?.startsWith('video/')) {
        spawnApp('video', item);
    } else if (AUDIO_EXTS.has(ext) || item.mime?.startsWith('audio/')) {
        spawnApp('audio', item);
        //} else if (ZIP_EXTS.has(ext) || item.mime === 'application/zip') {
        //    spawnApp('zip', item);
    } else if (ext === 'zip' || ext === 'iso') {
        // Build absolute path from the node's parent chain
        (async () => {
            const parts = [item.name];
            let walkId = item.parentId;
            while (walkId && walkId !== 'root') {
                const parent = await idbGet(walkId);
                if (!parent) break;
                parts.unshift(parent.name);
                walkId = parent.parentId;
            }
            const fullPath = '/' + parts.join('/');
            await mountImageFile(fullPath);
        })();
        return;
    } else if (ext === 'app') {
        spawnCustomApp(item);
    } else if (ext === 'edoc') {
        spawnWriter(item);
    } else if (MD_EXTS.has(ext)) {
        spawnApp('markdown', item);
    } else {
        spawnApp('editor', item);
    }
}

function openEditor(item) { spawnApp('editor', item); }
function closeEditor() { }
function closeEditorIfBackdrop() { }
async function saveFile() { }
function closeImageViewer() { }
function closeVideoPlayer() { }

/* ============================================================
   Context menu helpers
============================================================ */

let menuEl = null;

const OLD_CTX_ICONS = {
    open: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2z"/></svg>`,
    rename: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    delete: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    properties: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
    newFolder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
    newFile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
    goUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>`,
    goBack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
    newWindow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>`,
    drive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
    cut: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="20" r="2"/><circle cx="6" cy="4" r="2"/><line x1="6" y1="6" x2="6" y2="18"/><line x1="21" y1="4" x2="6" y2="18"/><line x1="21" y1="20" x2="6" y2="6"/></svg>`,
    paste: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`,
    eject: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 5 4 15 20 15"/><rect x="4" y="18" width="16" height="2" rx="1"/></svg>`,
    restore: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
    paintBrush: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"> <path d="M2 22s4-2 6-4l12-12a2 2 0 0 0-2-2L6 16c-2 2-4 6-4 6z"/> </svg>`,
};

const CTX_ICONS = {
    open: "document-open.png",
    rename: "edit-clear.png",
    delete: "exit.png",
    download: "bottom.png",
    properties: "gtk-properties.png",
    newFolder: "folder_new.png",
    newFile: "file_new.png",
    goUp: "go-up.png",
    goBack: "go-previous.png",
    newWindow: "window_new.png",
    drive: "gtk-properties.png",
    copy: "edit-copy.png",
    cut: "edit-cut.png",
    paste: "edit-paste.png",
    eject: "media-eject.png",
    restore: "edit-undo.png",
    paintBrush: "gtk-edit.png"
};

function getIconPath(name) {
    const theme = shouldIconsBeLight ? "light" : "dark";
    return `/usr/share/icons/actions/${theme}/${name}`;
}


async function buildMenu(x, y, entries) {
    if (menuEl) menuEl.remove();
    menuEl = document.createElement('div');
    menuEl.className = 'ctx-menu';
    menuEl.style.left = x + 'px';
    menuEl.style.top = y + 'px';

    // Collapse adjacent/leading/trailing separators
    const filtered = [];
    for (const e of entries) {
        if (!e) {
            if (filtered.length && filtered[filtered.length - 1]) filtered.push(null);
        } else {
            filtered.push(e);
        }
    }
    if (filtered.length && !filtered[filtered.length - 1]) filtered.pop();

    for (const entry of filtered) {
        if (!entry) {
            const sep = document.createElement('hr');
            sep.className = 'ctx-sep';
            menuEl.appendChild(sep);
            continue;
        }
        const { label, icon, danger, action } = entry;
        const row = document.createElement('div');
        row.className = 'ctx-row' + (danger ? ' danger' : '');
        if (icon && CTX_ICONS[icon]) {
            const img = await imgFromFS(getIconPath(CTX_ICONS[icon]));
            row.appendChild(img);
        }
        const span = document.createElement('span');
        span.textContent = label;
        row.appendChild(span);
        row.onmousedown = (e) => { e.stopPropagation(); closeMenu(); action(); };
        menuEl.appendChild(row);
    }

    document.body.appendChild(menuEl);
    requestAnimationFrame(() => clampMenuToScreen(menuEl));
    setTimeout(() => window.addEventListener('mousedown', closeMenuOnOutsideClick), 0);
}

async function showContextMenu(x, y, item, windowId) {
    const state = windows[windowId]?.state;
    // If right-clicked item isn't in the current selection, make it the only selection
    if (state && !state.selectedIds.has(item.id)) {
        document.querySelectorAll(`#${windowId} .item`).forEach(e => e.classList.remove('selected'));
        state.selectedIds = new Set([item.id]);
        state.selectedItemId = item.id;
        document.querySelector(`#${windowId} .item[data-id="${item.id}"]`)?.classList.add('selected');
    }
    const ids = state ? [...state.selectedIds] : [item.id];
    const multi = ids.length > 1;

    const tmpId = await _getTmpId();
    const inTrash = item.parentId === tmpId;

    if (inTrash) {
        buildMenu(x, y, [
            {
                label: multi ? `Restore ${ids.length} items` : 'Restore', icon: 'restore',
                action: () => multi ? _restoreItems(ids) : restoreItem(item.id)
            },
            null,
            {
                label: multi ? `Delete ${ids.length} items permanently` : 'Delete Permanently',
                icon: 'delete', danger: true,
                action: () => multi ? _deleteItems(ids) : deleteItem(item.id, windowId)
            },
        ]);
    } else {
        buildMenu(x, y, [
            !multi ? (item.type === 'folder'
                ? { label: 'Open', icon: 'open', action: () => navigate(windowId, item.id) }
                : { label: 'Open', icon: 'open', action: () => openFile(item) }) : null,
            !multi && item.type === 'file'
                ? { label: 'Open With…', icon: 'open', action: () => showOpenWithMenu(x, y, item) }
                : null,
            null,
            { label: multi ? `Copy ${ids.length} items` : 'Copy', icon: 'copy', action: () => _copyItems(ids) },
            { label: multi ? `Cut ${ids.length} items` : 'Cut', icon: 'cut', action: () => _cutItems(ids) },
            null,
            !multi ? { label: 'Rename', icon: 'rename', action: () => renameItem(item.id, windowId) } : null,
            {
                label: multi ? `Delete ${ids.length} items` : 'Delete', icon: 'delete', danger: true,
                action: () => multi ? _deleteItems(ids) : deleteItem(item.id, windowId)
            },
            !multi && item.type === 'file'
                ? { label: 'Download', icon: 'download', action: () => downloadItem(item.id) }
                : null,
            null,
            !multi ? { label: 'Properties', icon: 'properties', action: () => spawnPropertiesWindow(item) } : null,
        ]);
    }
}

function showOpenWithMenu(x, y, item) {
    const ext = getExt(item.name);
    const isImage = IMAGE_EXTS.has(ext) || item.mime?.startsWith('image/');
    const isAudio = AUDIO_EXTS.has(ext) || item.mime?.startsWith('audio/');
    const isVideo = VIDEO_EXTS.has(ext) || item.mime?.startsWith('video/');
    const isZip = ZIP_EXTS.has(ext) || item.mime === 'application/zip';
    const isWriterDoc = WRITER_EXTS.has(ext);
    const isMarkdown = MD_EXTS.has(ext);

    const entries = [
        { label: 'Text Editor', icon: 'open', action: () => spawnApp('editor', item) },
    ];

    if (isImage) {
        entries.push({ label: 'Image Viewer', icon: 'open', action: () => spawnApp('image', item) });
        entries.push({ label: 'Paint', icon: 'open', action: () => spawnPaint(item) });
    }
    if (isAudio) {
        entries.push({ label: 'Audio Player', icon: 'open', action: () => spawnApp('audio', item) });
    }
    if (isVideo) {
        entries.push({ label: 'Video Player', icon: 'open', action: () => spawnApp('video', item) });
    }
    if (isZip) {
        entries.push({ label: 'Archive Viewer', icon: 'open', action: () => spawnApp('zip', item) });
    }
    if (isWriterDoc) {
        entries.push({ label: 'Writer', icon: 'open', action: () => spawnWriter(item) });
    }
    if (isMarkdown) {
        entries.push({ label: 'Markdown Viewer', icon: 'open', action: () => spawnApp('markdown', item) });
    }

    buildMenu(x, y, entries);
}

async function showFolderBgContextMenu(x, y, windowId) {
    const state = windows[windowId]?.state;
    const isAtRoot = state?.currentFolderId === 'root';
    const hasPaste = fsClipboard.mode && fsClipboard.ids.length > 0;

    const tmpId = await _getTmpId();
    const inTrash = state?.currentFolderId === tmpId || state?.currentFolderId === 'virt:trash';

    if (inTrash) {
        buildMenu(x, y, [
            { label: 'Empty Recycle Bin', icon: 'delete', danger: true, action: () => emptyTrash() },
            null,
            {
                label: 'Restore All', icon: 'restore', action: async () => {
                    const children = await idbGetAllByIndex('parentId', tmpId);
                    if (children.length) await _restoreItems(children.map(c => c.id));
                }
            },
        ]);
        return;
    }

    const entries = [
        { label: 'New Folder', icon: 'newFolder', action: () => _winNewFolder(windowId) },
        { label: 'New File', icon: 'newFile', action: () => _winNewFile(windowId) },
        null,
        hasPaste ? { label: `Paste${fsClipboard.ids.length > 1 ? ` (${fsClipboard.ids.length})` : ''}`, icon: 'paste', action: () => _pasteItems(state.currentFolderId) } : null,
        null,
        { label: 'Go Up', icon: 'goUp', action: () => goUp(windowId) },
        { label: 'Go Back', icon: 'goBack', action: () => goBack(windowId) },
    ];
    if (isAtRoot) {
        entries.push(null);
        entries.push({ label: 'Drive Properties', icon: 'drive', action: () => spawnDriveProperties() });
    }
    buildMenu(x, y, entries);
}

function showDesktopContextMenu(x, y, item, deskState) {
    const ids = deskState ? [...deskState.selectedIds] : [item.id];
    const multi = ids.length > 1;

    buildMenu(x, y, [
        !multi ? (item.type === 'folder'
            ? { label: 'Open', icon: 'open', action: () => spawnWindow(item.id) }
            : { label: 'Open', icon: 'open', action: () => openFile(item) }) : null,
        !multi && item.type === 'file'
            ? { label: 'Open With…', icon: 'open', action: () => showOpenWithMenu(x, y, item) }
            : null,
        null,
        { label: multi ? `Copy ${ids.length} items` : 'Copy', icon: 'copy', action: () => _copyItems(ids) },
        { label: multi ? `Cut ${ids.length} items` : 'Cut', icon: 'cut', action: () => _cutItems(ids) },
        null,
        !multi ? { label: 'Rename', icon: 'rename', action: () => renameItem(item.id, null) } : null,
        {
            label: multi ? `Delete ${ids.length} items` : 'Delete', icon: 'delete', danger: true,
            action: () => multi ? _deleteItems(ids) : deleteItem(item.id, null)
        },
        !multi && item.type === 'file'
            ? { label: 'Download', icon: 'download', action: () => downloadItem(item.id) }
            : null,
        null,
        !multi ? { label: 'Properties', icon: 'properties', action: () => spawnPropertiesWindow(item) } : null,
    ]);
}

function showDesktopBlankContextMenu(x, y) {
    const hasPaste = fsClipboard.mode && fsClipboard.ids.length > 0;
    buildMenu(x, y, [
        {
            label: 'New Folder', icon: 'newFolder', action: async () => {
                const desktopNode = await getDesktopNode();
                if (!desktopNode) return;
                await createItemInline('folder', desktopNode.id, null);
            }
        },
        {
            label: 'New File', icon: 'newFile', action: async () => {
                const desktopNode = await getDesktopNode();
                if (!desktopNode) return;
                await createItemInline('file', desktopNode.id, null);
            }
        },
        null,
        hasPaste ? {
            label: `Paste${fsClipboard.ids.length > 1 ? ` (${fsClipboard.ids.length})` : ''}`, icon: 'paste',
            action: async () => { const dn = await getDesktopNode(); if (dn) await _pasteItems(dn.id); }
        } : null,
        null,
        { label: 'Change Wallpaper', icon: 'paintBrush', action: () => spawnSettings() },
    ]);
}


/* ============================================================
   TERMINAL
============================================================ */

function spawnTerminal(startPath) {
    const username = getUsername();
    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 28;
    const left = Math.min(80 + offset, window.innerWidth - 740);
    const top = Math.min(80 + offset, window.innerHeight - 520);

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.left = left + 'px';
    win.style.top = top + 'px';
    win.style.width = '720px';
    win.style.height = '480px';

    win.addEventListener('mousedown', () => focusWindow(windowId));

    win.innerHTML = `
                <div class="title-bar">
                    <button class="window-close-button" title="Close">✕</button>
                    <button class="window-minimize-button" title="Minimize">—</button>
            <button class="window-maximize-button" title="Maximize">□</button>
                    <span class="title-bar-text"><img class="app-icon-title-bar" src="icons/16/terminal.png"> Terminal</span>
                </div>
                <div class="app-body" style="height:calc(100% - 42px);overflow:hidden;display:flex;flex-direction:column;"></div>
            `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'terminal' } };

    win.querySelector('.title-bar').addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });
    addResizeHandles(win);
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);
    win.querySelector('.window-maximize-button').onclick = () => maximizeWindow(windowId);

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.innerHTML = '<img class="app-icon-title-bar" src="icons/16/terminal.png"> Terminal';
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));
    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [{ label: "Close", icon: "close", action: () => closeWindow(windowId) }]);
    };
    windows[windowId].taskbarBtn = tbBtn;

    const body = win.querySelector('.app-body');
    _buildTerminalBody(body, windowId, win, startPath || `/home/${username}`);

    focusWindow(windowId);
    return windowId;
}

async function _buildTerminalBody(body, windowId, winEl, startPath) {
    body.innerHTML = '';

    const username = getUsername();

    const termState = {
        cwdId: 'root',
        cwdPath: '/',
        history: [],
        histIdx: -1,
        tabCount: 1,
    };

    async function resolvePath(pathStr, fromId) {
        if (!pathStr) return { id: fromId, path: termState.cwdPath };

        let parts, baseId, basePath;

        if (pathStr.startsWith('/')) {
            parts = pathStr.split('/').filter(Boolean);
            baseId = 'root';
            basePath = '';
        } else {
            parts = pathStr.split('/').filter(Boolean);
            baseId = fromId;
            basePath = termState.cwdPath === '/' ? '' : termState.cwdPath;
        }

        let curId = baseId;
        let curPath = basePath;

        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                if (curId === 'root') continue;
                const node = await idbGet(curId);
                if (!node || !node.parentId) { curId = 'root'; curPath = ''; continue; }
                curId = node.parentId;
                curPath = curPath.substring(0, curPath.lastIndexOf('/')) || '';
                continue;
            }
            const children = await idbGetAllByIndex('parentId', curId);
            const match = children.find(n => n.name === part && n.type === 'folder');
            if (!match) return null;
            curId = match.id;
            curPath = curPath + '/' + part;
        }
        if (curPath === '') curPath = '';
        return { id: curId, path: '/' + curPath.replace(/^\//, '') };
    }

    async function resolveParentAndName(pathStr) {
        const parts = pathStr.split('/').filter(Boolean);
        if (parts.length === 0) return null;
        const name = parts.pop();
        if (parts.length === 0) {
            return { parentId: termState.cwdId, parentPath: termState.cwdPath, name };
        }
        const parentPathStr = (pathStr.startsWith('/') ? '/' : '') + parts.join('/');
        const resolved = await resolvePath(parentPathStr, termState.cwdId);
        if (!resolved) return null;
        return { parentId: resolved.id, parentPath: resolved.path, name };
    }

    async function idToPath(id) {
        const parts = [];
        let walker = id;
        while (walker && walker !== 'root') {
            const node = await idbGet(walker);
            if (!node) break;
            parts.unshift(node.name);
            walker = node.parentId;
        }
        return '/' + parts.join('/');
    }

    // Navigate to start path
    {
        const parts = startPath.split('/').filter(Boolean);
        let curId = 'root';
        for (const part of parts) {
            const children = await idbGetAllByIndex('parentId', curId);
            const match = children.find(n => n.name === part && n.type === 'folder');
            if (!match) break;
            curId = match.id;
        }
        termState.cwdId = curId;
        termState.cwdPath = await idToPath(curId);
    }

    const homePath = `/home/${username}`;

    body.innerHTML = `
                <div class="term-window">
                    <div class="term-menubar">
                        <button class="term-menubar-btn" id="tm-file-${windowId}">File</button>
                        <div class="term-menubar-sep"></div>
                        <button class="term-menubar-btn" id="tm-edit-${windowId}">Edit</button>
                        <button class="term-menubar-btn" id="tm-view-${windowId}">View</button>
                        <span class="term-title-info" id="tm-info-${windowId}">${username}@${getComputername()}</span>
                    </div>
                    <div class="term-tabs" id="term-tabs-${windowId}">
                        <div class="term-tab active" id="term-tab-1-${windowId}">
                            <span>bash</span>
                            <button class="term-tab-close" title="Close tab">×</button>
                        </div>
                        <button class="term-new-tab-btn" id="term-newtab-${windowId}" title="New tab">+</button>
                    </div>
                    <div class="term-body" id="term-body-${windowId}">
                        <div class="term-pane" id="term-pane-${windowId}">
                            <div class="term-output" id="term-output-${windowId}"></div>
                            <div class="term-input-row" id="term-inputrow-${windowId}">
                                <span class="term-input-prompt" id="term-prompt-${windowId}"></span>
                                <input class="term-input" id="term-input-${windowId}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
                            </div>
                        </div>
                    </div>
                    <div class="term-statusbar">
                        <span class="tsb-indicator"></span>
                        <span class="tsb-cwd" id="tsb-cwd-${windowId}"></span>
                        <span class="tsb-label">bash</span>
                    </div>
                </div>
            `;

    const outputEl = body.querySelector(`#term-output-${windowId}`);
    const inputEl = body.querySelector(`#term-input-${windowId}`);
    const promptEl = body.querySelector(`#term-prompt-${windowId}`);
    const statusCwd = body.querySelector(`#tsb-cwd-${windowId}`);

    function updatePrompt() {
        const dispPath = termState.cwdPath || '/';
        const tilde = dispPath.startsWith(homePath) ? '~' + dispPath.slice(homePath.length) : dispPath;
        promptEl.innerHTML =
            `<span class="term-prompt-user">${username}</span>` +
            `<span class="term-prompt-at">@</span>` +
            `<span class="term-prompt-host">${getComputername()}</span>` +
            `<span class="term-prompt-colon">:</span>` +
            `<span class="term-prompt-path">${tilde || '/'}</span>` +
            `<span class="term-prompt-dollar"> $&nbsp;</span>`;
        statusCwd.textContent = dispPath || '/';
    }

    function print(text, cls = 'output-text') {
        const el = document.createElement('span');
        el.className = `term-line ${cls}`;
        el.textContent = text;
        outputEl.appendChild(el);
        outputEl.appendChild(document.createElement('br'));
    }

    function printPromptEcho(text) {
        const dispPath = termState.cwdPath || '/';
        const tilde = dispPath.startsWith(homePath) ? '~' + dispPath.slice(homePath.length) : dispPath;
        const line = document.createElement('div');
        line.className = 'term-prompt-line';
        line.innerHTML =
            `<span class="term-prompt-user">${username}</span>` +
            `<span class="term-prompt-at">@</span>` +
            `<span class="term-prompt-host">${getComputername()}</span>` +
            `<span class="term-prompt-colon">:</span>` +
            `<span class="term-prompt-path">${tilde || '/'}</span>` +
            `<span class="term-prompt-dollar"> $&nbsp;</span>` +
            `<span class="term-prompt-text">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
        outputEl.appendChild(line);
    }

    function scrollBottom() {
        outputEl.scrollTop = outputEl.scrollHeight;
    }

    print(`Type 'help' for available commands.`, 'output-dim');
    print(``, 'output-dim');
    updatePrompt();

    async function runCommand(raw) {
        const trimmed = raw.trim();
        if (!trimmed) { scrollBottom(); return; }

        if (termState.history[0] !== trimmed) termState.history.unshift(trimmed);
        if (termState.history.length > 200) termState.history.pop();
        termState.histIdx = -1;

        printPromptEcho(trimmed);

        const matchArgs = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const [cmd, ...args] = matchArgs.map(a => a.replace(/^"|"$/g, '')); // remove quotes

        switch (cmd.toLowerCase()) {
            case 'pwd':
                print(termState.cwdPath || '/');
                break;

            case 'ls':
            case 'dir': {
                let targetId = termState.cwdId;
                if (args[0]) {
                    const r = await resolvePath(args[0], termState.cwdId);
                    if (!r) { print(`ls: cannot access '${args[0]}': No such file or directory`, 'output-error'); break; }
                    targetId = r.id;
                }
                const children = await idbGetAllByIndex('parentId', targetId);
                children.sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : (a.type === 'folder' ? -1 : 1));
                if (children.length === 0) {
                    print('(empty)', 'output-dim');
                } else {
                    const names = children.map(n => n.type === 'folder' ? n.name + '/' : n.name);
                    const maxLen = Math.max(...names.map(n => n.length));
                    const colW = Math.min(maxLen + 2, 24);
                    const cols = Math.max(1, Math.floor(52 / colW));
                    let lineItems = [];
                    for (const child of children) {
                        const display = child.type === 'folder' ? child.name + '/' : child.name;
                        lineItems.push({ display, isFolder: child.type === 'folder' });
                    }
                    for (let i = 0; i < lineItems.length; i += cols) {
                        const rowItems = lineItems.slice(i, i + cols);
                        const lineEl = document.createElement('div');
                        lineEl.style.display = 'flex';
                        lineEl.style.gap = '0';
                        rowItems.forEach(item => {
                            const span = document.createElement('span');
                            span.textContent = item.display.padEnd(colW);
                            span.style.fontFamily = 'inherit';
                            span.style.whiteSpace = 'pre';
                            span.style.color = item.isFolder ? '#60a5fa' : '#d0d0d0';
                            lineEl.appendChild(span);
                        });
                        outputEl.appendChild(lineEl);
                    }
                }
                break;
            }

            case 'cd': {
                const target = args[0];
                if (!target || target === '~') {
                    const resolved = await resolvePath(homePath, 'root');
                    if (resolved) {
                        termState.cwdId = resolved.id;
                        termState.cwdPath = resolved.path;
                        updatePrompt();
                    }
                    break;
                }
                const resolved = await resolvePath(target, termState.cwdId);
                if (!resolved) {
                    print(`cd: ${target}: No such file or directory`, 'output-error');
                    break;
                }
                termState.cwdId = resolved.id;
                termState.cwdPath = resolved.path;
                updatePrompt();
                winEl.querySelector('.title-bar-text').textContent = `⌨ Terminal — ${resolved.path || '/'}`;
                break;
            }

            case 'mkdir': {
                if (args.length === 0) { print('mkdir: missing operand', 'output-error'); break; }
                const mkdirP = args[0] === '-p' || args[0] === '--parents';
                const targets = mkdirP ? args.slice(1) : args;
                if (targets.length === 0) { print('mkdir: missing operand', 'output-error'); break; }

                for (const target of targets) {
                    if (mkdirP) {
                        const parts = target.replace(/^\//, '').split('/').filter(Boolean);
                        let curId = target.startsWith('/') ? 'root' : termState.cwdId;
                        let curPath = target.startsWith('/') ? '' : termState.cwdPath;
                        for (const part of parts) {
                            const children = await idbGetAllByIndex('parentId', curId);
                            const existing = children.find(n => n.name === part && n.type === 'folder');
                            if (existing) {
                                curId = existing.id;
                                curPath = curPath + '/' + part;
                            } else {
                                const newId = crypto.randomUUID();
                                await idbAdd({ id: newId, name: part, type: 'folder', parentId: curId, createdAt: Date.now(), updatedAt: Date.now() });
                                curId = newId;
                                curPath = curPath + '/' + part;
                            }
                        }
                    } else {
                        const resolved = await resolveParentAndName(target);
                        if (!resolved) { print(`mkdir: cannot create directory '${target}': No such file or directory`, 'output-error'); continue; }
                        const { parentId, name } = resolved;
                        const siblings = await idbGetAllByIndex('parentId', parentId);
                        if (siblings.find(n => n.name === name)) {
                            print(`mkdir: cannot create directory '${name}': File exists`, 'output-error');
                            continue;
                        }
                        const newId = crypto.randomUUID();
                        await idbAdd({ id: newId, name, type: 'folder', parentId, createdAt: Date.now(), updatedAt: Date.now() });
                        print(`Created directory '${name}'`, 'output-success');
                    }
                }
                if (mkdirP && targets.length > 0) print(`Created directory tree`, 'output-success');
                break;
            }

            case 'rmdir': {
                if (args.length === 0) { print('rmdir: missing operand', 'output-error'); break; }
                for (const target of args) {
                    const resolved = await resolvePath(target, termState.cwdId);
                    if (!resolved) { print(`rmdir: failed to remove '${target}': No such file or directory`, 'output-error'); continue; }
                    const children = await idbGetAllByIndex('parentId', resolved.id);
                    if (children.length > 0) { print(`rmdir: failed to remove '${target}': Directory not empty`, 'output-error'); continue; }
                    if (resolved.id === termState.cwdId) { print(`rmdir: failed to remove '${target}': Device or resource busy`, 'output-error'); continue; }
                    const tx = (await dbPromise).transaction('nodes', 'readwrite');
                    tx.objectStore('nodes').delete(resolved.id);
                    await new Promise(res => { tx.oncomplete = res; tx.onerror = res; });
                    print(`Removed '${target}'`, 'output-success');
                }
                break;
            }

            case 'rm': {
                if (args.length === 0) { print('rm: missing operand\nUsage: rm [-rf] <path...>', 'output-error'); break; }
                let rmRecursive = false, rmForce = false;
                const rmTargets = [];
                for (const arg of args) {
                    if (arg.startsWith('-')) {
                        const flags = arg.replace(/-/g, '');
                        if (flags.includes('r') || flags.includes('R')) rmRecursive = true;
                        if (flags.includes('f')) rmForce = true;
                    } else {
                        rmTargets.push(arg);
                    }
                }
                if (rmTargets.length === 0) { print('rm: missing operand', 'output-error'); break; }
                let anyDeleted = false;
                for (const target of rmTargets) {
                    const resolved = await resolvePath(target, termState.cwdId);
                    if (!resolved) {
                        if (!rmForce) print(`rm: cannot remove '${target}': No such file or directory`, 'output-error');
                        continue;
                    }
                    if (resolved.id === 'root') {
                        spawnWarning(
                            `rm: remove the root directory '/'? This will wipe the entire filesystem.`,
                            [
                                {
                                    label: 'Delete',
                                    style: 'danger',
                                    onClick: async () => {
                                        await recursiveDelete('root');
                                        await renderAllWindows();
                                    }
                                },
                                { label: 'Cancel' }
                            ]
                        );
                        continue;
                    }
                    if (resolved.id === termState.cwdId) { print(`rm: cannot remove '${target}': Device or resource busy`, 'output-error'); continue; }
                    const node = await idbGet(resolved.id);
                    if (!node) {
                        if (!rmForce) print(`rm: cannot remove '${target}': No such file or directory`, 'output-error');
                        continue;
                    }
                    if (node.type === 'folder') {
                        if (!rmRecursive) { print(`rm: cannot remove '${target}': Is a directory (use -r)`, 'output-error'); continue; }
                        await recursiveDelete(node.id);
                    } else {
                        await idbDelete(node.id);
                    }
                    anyDeleted = true;
                }
                if (anyDeleted) await renderAllWindows();
                break;
            }

            case 'format': {
                if (dbPromise) { dbPromise.close(); dbPromise = null; }
                const req = indexedDB.deleteDatabase(DB_NAME);
                print('Formatting disk...');
                req.onsuccess = () => reboot();
                req.onerror = () => { print('Failed to format disk.'); };
                req.onblocked = () => { reboot(); };
                break;
            }

            case 'createfile': {
                if (args.length === 0) { print('createfile: missing file operand', 'output-error'); break; }
                for (const target of args) {
                    const resolved = await resolveParentAndName(target);
                    if (!resolved) { print(`createfile: cannot create '${target}': No such file or directory`, 'output-error'); continue; }
                    const { parentId, name } = resolved;
                    const siblings = await idbGetAllByIndex('parentId', parentId);
                    if (siblings.find(n => n.name === name)) {
                        break;
                    }
                    const newId = crypto.randomUUID();
                    await idbAdd({ id: newId, name, type: 'file', content: '', parentId, createdAt: Date.now(), updatedAt: Date.now() });
                    print(`Created file '${name}'`, 'output-success');
                }
                break;
            }

            case 'persist':
                navigator.storage.persist();
                break;

            case 'echo':
                print(args.join(' '));
                break;

            case 'clear':
            case 'cls':
                outputEl.innerHTML = '';
                break;

            case 'whoami':
                print(username);
                break;

            case 'hostname':
                print(getComputername());
                break;

            case 'uname':
                print(args.includes('-a')
                    ? `${VERSION} ${getComputername()}`
                    : `E-Dog OS`);
                break;

            case 'date':
                print(new Date().toString());
                break;

            case 'history': {
                termState.history.slice().reverse().forEach((cmd, i) => {
                    print(`  ${String(i + 1).padStart(3)}  ${cmd}`, 'output-dim');
                });
                break;
            }

            case 'help':
                print('Available commands:', 'output-info');
                [
                    ['pwd', 'Print working directory'],
                    ['ls [path]', 'List directory contents'],
                    ['cd [path]', 'Change directory  (supports .., ~, absolute paths)'],
                    ['mkdir [-p] <dir>', 'Create directory  (-p creates parent dirs)'],
                    ['rmdir <dir>', 'Remove empty directory'],
                    ['rm [-rf] <path...>', 'Remove files or directories  (-r recursive, -f ignore errors)'],
                    ['format', 'Format disk'],
                    ['createfile <file>', 'Create empty file'],
                    ['persist', 'Will ask the browser to not delete the OS randomly. It does do that.'],
                    ['echo <text>', 'Print text'],
                    ['clear', 'Clear terminal output'],
                    ['history', 'Show command history'],
                    ['whoami', 'Print current user'],
                    ['date', 'Print current date/time'],
                    ['uname [-a]', 'Print system info'],
                    ['error [error]', 'Throw an error'],
                    ['stresstest [--size <MB>]', 'Benchmark drive write/read speed  (default 1 MB)'],
                    ['help', 'Show this help'],
                ].forEach(([c, d]) => {
                    const lineEl = document.createElement('div');
                    lineEl.style.display = 'flex';
                    lineEl.style.gap = '8px';
                    const cmdSpan = document.createElement('span');
                    cmdSpan.style.color = '#4ade80';
                    cmdSpan.style.minWidth = '160px';
                    cmdSpan.style.fontFamily = 'inherit';
                    cmdSpan.style.fontSize = '13px';
                    cmdSpan.textContent = '  ' + c;
                    const descSpan = document.createElement('span');
                    descSpan.style.color = '#888';
                    descSpan.style.fontFamily = 'inherit';
                    descSpan.style.fontSize = '13px';
                    descSpan.textContent = d;
                    lineEl.appendChild(cmdSpan);
                    lineEl.appendChild(descSpan);
                    outputEl.appendChild(lineEl);
                });
                break;

            case 'error': {
                if (args.length === 0) {
                    print('error: missing error text', 'output-error');
                    break;
                }
                const message = args.join(' ');
                spawnError(message); // Or throw new Error(message) if you want to throw
                break;
            }

            case 'stresstest': {
                const ST_CHUNK = 65536; // 64 KB per block (max for crypto.getRandomValues)
                let stMB = 1;
                for (let i = 0; i < args.length; i++) {
                    if ((args[i] === '--size' || args[i] === '-s') && args[i + 1]) {
                        stMB = parseFloat(args[i + 1]);
                    }
                }
                if (isNaN(stMB) || stMB <= 0) { print('stresstest: invalid --size value', 'output-error'); break; }
                if (stMB > 256) { print('stresstest: --size capped at 256 MB', 'output-error'); break; }

                const stTotal = Math.round(stMB * 1024 * 1024);
                const stCount = Math.max(1, Math.ceil(stTotal / ST_CHUNK));
                const stActual = stCount * ST_CHUNK;
                const stMBActual = (stActual / 1024 / 1024).toFixed(2);

                print(`Stress test — ${stMBActual} MB  ·  ${stCount} × 64 KB blocks`, 'output-info');
                turnOnDriveLight();

                const stIds = Array.from({ length: stCount }, (_, i) => `__stresstest_${i}`);

                // Write phase
                print('Writing…', 'output-dim');
                scrollBottom();
                const stBuf = new Uint8Array(ST_CHUNK);
                let stWriteMs;
                try {
                    const t0 = performance.now();
                    for (let i = 0; i < stCount; i++) {
                        crypto.getRandomValues(stBuf);
                        await idbPut({
                            id: stIds[i], type: 'file', name: stIds[i],
                            parentId: '__stresstest_parent__',
                            content: stBuf.buffer.slice(0), size: ST_CHUNK,
                            createdAt: Date.now(), updatedAt: Date.now()
                        });
                    }
                    stWriteMs = performance.now() - t0;
                } catch (e) {
                    turnOffDriveLight();
                    print(`stresstest: write failed — ${e.message}`, 'output-error');
                    break;
                }
                const stWriteMBps = (stActual / 1024 / 1024) / (stWriteMs / 1000);
                print(`Write  ${stWriteMBps.toFixed(2)} MB/s  (${stWriteMs.toFixed(0)} ms)`, 'output-success');
                scrollBottom();

                // Read phase
                print('Reading…', 'output-dim');
                scrollBottom();
                let stReadMs;
                try {
                    const t1 = performance.now();
                    for (const id of stIds) {
                        await idbGet(id);
                    }
                    stReadMs = performance.now() - t1;
                } catch (e) {
                    turnOffDriveLight();
                    print(`stresstest: read failed — ${e.message}`, 'output-error');
                    break;
                }
                const stReadMBps = (stActual / 1024 / 1024) / (stReadMs / 1000);
                print(`Read   ${stReadMBps.toFixed(2)} MB/s  (${stReadMs.toFixed(0)} ms)`, 'output-success');
                scrollBottom();

                // Cleanup
                print('Cleaning up…', 'output-dim');
                scrollBottom();
                for (const id of stIds) await idbDelete(id);
                turnOffDriveLight();

                print(`Done — total ${((stWriteMs + stReadMs) / 1000).toFixed(2)} s`, 'output-info');
                break;
            }

            default:
                print(`${cmd}: command not found — type 'help' for commands`, 'output-error');
                break;
        }

        scrollBottom();
    }

    inputEl.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const val = inputEl.value;
            inputEl.value = '';
            await runCommand(val);
            updatePrompt();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (termState.histIdx < termState.history.length - 1) {
                termState.histIdx++;
                inputEl.value = termState.history[termState.histIdx] || '';
                setTimeout(() => inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length), 0);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (termState.histIdx > 0) {
                termState.histIdx--;
                inputEl.value = termState.history[termState.histIdx] || '';
            } else {
                termState.histIdx = -1;
                inputEl.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const val = inputEl.value;
            const parts = val.split(/\s+/);
            if (parts.length >= 2) {
                const partial = parts[parts.length - 1];
                const slashIdx = partial.lastIndexOf('/');
                const dirPart = slashIdx >= 0 ? partial.slice(0, slashIdx + 1) : '';
                const namePart = slashIdx >= 0 ? partial.slice(slashIdx + 1) : partial;
                let parentId = termState.cwdId;
                if (dirPart) {
                    const r = await resolvePath(dirPart, termState.cwdId);
                    if (r) parentId = r.id;
                }
                const children = await idbGetAllByIndex('parentId', parentId);
                const matches = children.filter(n => n.name.startsWith(namePart));
                if (matches.length === 1) {
                    parts[parts.length - 1] = dirPart + matches[0].name + (matches[0].type === 'folder' ? '/' : '');
                    inputEl.value = parts.join(' ');
                } else if (matches.length > 1) {
                    print('', 'output-dim');
                    matches.forEach(m => print(m.name + (m.type === 'folder' ? '/' : ''), 'output-dim'));
                    scrollBottom();
                }
            }
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            outputEl.innerHTML = '';
        } else if (e.key === 'c' && e.ctrlKey) {
            e.preventDefault();
            print('^C', 'output-dim');
            inputEl.value = '';
        }
    });

    body.addEventListener('click', () => inputEl.focus());
    inputEl.focus();

    body.querySelector(`#term-newtab-${windowId}`).onclick = () => {
        print('(Multi-tab support coming soon — open a new Terminal window instead)', 'output-warn');
        scrollBottom();
    };

    updatePrompt();
}

async function getFolderStats(folderId) {
    let count = 0, size = 0;
    const children = await idbGetAllByIndex('parentId', folderId);
    for (const c of children) {
        if (c.type === 'folder') {
            const sub = await getFolderStats(c.id);
            count += sub.count + 1;
            size += sub.size;
        } else {
            count++;
            size += c.size || (c.content ? (typeof c.content === 'string' ? new Blob([c.content]).size : c.content.byteLength) : 0);
        }
    }
    return { count, size };
}

async function spawnPropertiesWindow(item) {
    return _spawnPropsWindow(item);
}

async function spawnDriveProperties() {
    return _spawnDriveWindow();
}

function _makePropsShell(title, w, h) {
    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 28;
    const left = Math.min(120 + offset, window.innerWidth - w - 20);
    const top = Math.min(100 + offset, window.innerHeight - h - 60);

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.cssText = `left:${left}px;top:${top}px;width:${w}px;height:${h}px;`;
    win.addEventListener('mousedown', () => focusWindow(windowId));

    win.innerHTML = `
                <div class="title-bar">
                    <button class="window-close-button" title="Close">✕</button>
                    <button class="window-minimize-button" title="Minimize">—</button>
            <button class="window-maximize-button" title="Maximize">□</button>
                    <span class="title-bar-text">Properties — ${title}</span>
                </div>
                <div class="props-body" style="height:calc(100% - 42px);"></div>
            `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'props' } };

    win.querySelector('.title-bar').addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });
    addResizeHandles(win);
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);
    win.querySelector('.window-maximize-button').onclick = () => maximizeWindow(windowId);

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.textContent = `⚙ ${title}`;
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));

    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [{ label: "Close", icon: "close", action: () => closeWindow(windowId) }]);
    };
    windows[windowId].taskbarBtn = tbBtn;

    focusWindow(windowId);
    return { windowId, body: win.querySelector('.props-body') };
}

function _propsRow(key, value) {
    return `<div class="props-row"><span class="pk">${key}</span><span class="pv">${value}</span></div>`;
}

async function _spawnPropsWindow(item) {
    const { windowId, body } = _makePropsShell(item.name, 380, 420);

    const iconRow = document.createElement('div');
    iconRow.className = 'props-icon-row';

    const iconEl = document.createElement('div');
    iconEl.className = 'props-big-icon';
    if (item.type === 'folder') {
        const meta = getFolderIconMap()[item.name];
        if (meta) {
            const img = document.createElement('img');
            img.src = `./icons/128/folder-${meta.slug}.svg`;
            img.onerror = () => {
                img.remove();
                const fb = document.createElement('span');
                fb.style.cssText = `color:${meta.color};display:flex;`;
                fb.innerHTML = SVG_ICONS[meta.slug] || SVG_ICONS.folder;
                iconEl.appendChild(fb);
            };
            iconEl.appendChild(img);
        } else {
            iconEl.style.color = '#94a3b8';
            iconEl.innerHTML = SVG_ICONS.folder;
        }
    } else {
        iconEl.style.color = '#94a3b8';
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
    }

    const nameBlock = document.createElement('div');
    nameBlock.innerHTML = `<div class="props-name">${item.name}</div><div class="props-kind">${item.type === 'folder' ? 'Folder' : (item.mime || 'File')}</div>`;

    iconRow.appendChild(iconEl);
    iconRow.appendChild(nameBlock);
    body.appendChild(iconRow);

    const table = document.createElement('div');
    table.className = 'props-table';

    const fmt = (ts) => ts ? new Date(ts).toLocaleString() : '—';

    if (item.type === 'folder') {
        table.innerHTML = _propsRow('Name', item.name) + _propsRow('Type', 'Folder') + _propsRow('Created', fmt(item.createdAt)) + _propsRow('Modified', fmt(item.updatedAt)) + _propsRow('Contents', '<span style="color:#888">Calculating…</span>');
        body.appendChild(table);
        const stats = await getFolderStats(item.id);
        const pvEls = table.querySelectorAll('.pv');
        const contentsEl = pvEls[pvEls.length - 1];
        if (contentsEl) contentsEl.innerHTML = `${stats.count} item${stats.count !== 1 ? 's' : ''}, ${formatBytes(stats.size)}`;
    } else {
        const size = item.size || (item.content ? (typeof item.content === 'string' ? new Blob([item.content]).size : item.content.byteLength) : 0);
        table.innerHTML =
            _propsRow('Name', item.name) +
            _propsRow('Type', item.mime || 'Unknown') +
            _propsRow('Size', formatBytes(size) + (size ? ` (${size.toLocaleString()} bytes)` : '')) +
            _propsRow('Created', fmt(item.createdAt)) +
            _propsRow('Modified', fmt(item.updatedAt)) +
            _propsRow('ID', `<span style="color:#555;font-size:11px;font-family:monospace">${item.id}</span>`);
        body.appendChild(table);
    }

    return windowId;
}

async function _spawnDriveWindow(item) {
    const { windowId, body } = _makePropsShell('Virtual Drive', 380, 400);

    const iconRow = document.createElement('div');
    iconRow.className = 'props-icon-row';
    const iconEl = document.createElement('div');
    iconEl.className = 'props-big-icon';
    iconEl.style.color = '#0c74df';
    iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`;
    const nameBlock = document.createElement('div');
    nameBlock.innerHTML = `<div class="props-name">Virtual Drive</div><div class="props-kind">Browser Virtual Filesystem</div>`;
    iconRow.appendChild(iconEl);
    iconRow.appendChild(nameBlock);
    body.appendChild(iconRow);

    const table = document.createElement('div');
    table.className = 'props-table';
    table.innerHTML =
        _propsRow('File System', 'IndexedDB (VirtualFS_v2)') +
        _propsRow('Storage', '<span style="color:#888">Calculating…</span>') +
        _propsRow('Used', '<span style="color:#888">Calculating…</span>') +
        _propsRow('Free', '<span style="color:#888">Calculating…</span>') +
        `<div class="props-row"><span class="pk">Usage</span><span class="pv"><div class="props-meter"><div class="props-meter-fill" id="drive-meter" style="width:0%"></div></div></span></div>` +
        _propsRow('Mount Point', '/') +
        _propsRow('DB Name', DB_NAME);
    body.appendChild(table);

    if (navigator.storage?.estimate) {
        const { usage = 0, quota = 0 } = await navigator.storage.estimate();
        const free = Math.max(0, quota - usage);
        const pct = quota > 0 ? Math.round((usage / quota) * 100) : 0;
        const pvs = table.querySelectorAll('.pv');
        pvs[1].textContent = formatBytes(quota);
        pvs[2].textContent = `${formatBytes(usage)} (${pct}%)`;
        pvs[3].textContent = formatBytes(free);
        const meter = document.getElementById('drive-meter');
        if (meter) meter.style.width = pct + '%';
    } else {
        table.querySelectorAll('.pv').forEach((el, i) => {
            if (i >= 1 && i <= 3) el.textContent = 'Unavailable';
        });
    }

    return windowId;
}

async function spawnMountPropertiesWindow(entry) {
    const isUSB = entry.icon === 'usb';
    const { windowId, body } = _makePropsShell(entry.label, 380, 460);

    const iconRow = document.createElement('div');
    iconRow.className = 'props-icon-row';
    const iconEl = document.createElement('div');
    iconEl.className = 'props-big-icon';
    iconEl.style.color = isUSB ? '#7dd3fc' : '#e2c97e';
    iconEl.innerHTML = isUSB ? SVG_ICONS.usb : SVG_ICONS.cd;

    const nameBlock = document.createElement('div');
    nameBlock.innerHTML = `<div class="props-name">${entry.label}</div><div class="props-kind">${entry.fsType.toUpperCase()} Volume</div>`;
    iconRow.appendChild(iconEl);
    iconRow.appendChild(nameBlock);
    body.appendChild(iconRow);

    const fmt = ts => ts ? new Date(ts).toLocaleString() : '—';
    const hasCap = entry.capacity != null;
    const capacityStr = hasCap ? formatBytes(entry.capacity) : '—';

    const table = document.createElement('div');
    table.className = 'props-table';
    table.innerHTML =
        _propsRow('Volume', entry.label) +
        _propsRow('Device', entry.device) +
        _propsRow('Mount Point', entry.mountPoint) +
        _propsRow('File System', entry.fsType) +
        _propsRow('Access', entry.readOnly ? 'Read-only' : 'Read / Write') +
        _propsRow('Capacity', capacityStr) +
        _propsRow('Used', '<span style="color:#888">Calculating…</span>') +
        (hasCap ? `<div class="props-row"><span class="pk">Usage</span><span class="pv"><div class="props-meter"><div class="props-meter-fill" id="mnt-meter-${windowId}" style="width:0%"></div></div></span></div>` : '') +
        _propsRow('Mounted', fmt(entry.mountedAt));
    body.appendChild(table);

    const mountNode = await _fsResolve(entry.mountPoint);
    if (mountNode) {
        const stats = await getFolderStats(mountNode.id);
        const usedEl = Array.from(table.querySelectorAll('.props-row'))
            .find(r => r.querySelector('.pk')?.textContent === 'Used')
            ?.querySelector('.pv');
        if (usedEl) usedEl.textContent = formatBytes(stats.size);
        if (hasCap) {
            const meter = document.getElementById(`mnt-meter-${windowId}`);
            if (meter) {
                const pct = Math.min(100, Math.round((stats.size / entry.capacity) * 100));
                meter.style.width = pct + '%';
                if (pct > 90) meter.style.background = '#ef4444';
                else if (pct > 70) meter.style.background = '#f59e0b';
            }
        }
    } else {
        const usedEl = Array.from(table.querySelectorAll('.props-row'))
            .find(r => r.querySelector('.pk')?.textContent === 'Used')
            ?.querySelector('.pv');
        if (usedEl) usedEl.textContent = '—';
    }

    return windowId;
}

async function renameItem(id, windowId) {
    if (menuEl) { menuEl.remove(); menuEl = null; }

    const tile = document.querySelector(`.item[data-id="${id}"]`);
    if (!tile) {
        const node = await idbGet(id);
        const n = await spawnPrompt('Rename:', node.name, { title: 'Rename' });
        if (n && n !== node.name) { node.name = n; node.updatedAt = Date.now(); await idbPut(node); await renderAllWindows(); }
        return;
    }

    const node = await idbGet(id);
    startInlineRename(tile, node, windowId, false);
}

function startInlineRename(tile, node, windowId, deleteOnCancel) {
    const nameDiv = tile.querySelector('.name');
    if (!nameDiv) return;

    const originalName = node.name;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'rename-input';
    input.value = originalName;
    nameDiv.replaceWith(input);

    const dotIdx = originalName.lastIndexOf('.');
    input.focus();
    if (node.type === 'file' && dotIdx > 0) {
        input.setSelectionRange(0, dotIdx);
    } else {
        input.select();
    }

    const origDblclick = tile.ondblclick;
    tile.ondblclick = e => e.stopPropagation();

    async function commit() {
        const newName = input.value.trim();
        input.removeEventListener('blur', onBlur);
        if (newName && newName !== originalName) {
            node.name = newName;
            node.updatedAt = Date.now();
            await idbPut(node);
            await renderAllWindows();
        } else if (!newName && deleteOnCancel) {
            await idbDelete(node.id);
            await renderAllWindows();
        } else {
            const restored = document.createElement('div');
            restored.className = 'name';
            restored.textContent = originalName;
            input.replaceWith(restored);
            tile.ondblclick = origDblclick;
        }
    }

    async function cancel() {
        input.removeEventListener('blur', onBlur);
        if (deleteOnCancel) {
            await idbDelete(node.id);
            await renderAllWindows();
        } else {
            const restored = document.createElement('div');
            restored.className = 'name';
            restored.textContent = originalName;
            input.replaceWith(restored);
            tile.ondblclick = origDblclick;
        }
    }

    function onBlur() { commit(); }

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); input.removeEventListener('blur', onBlur); commit(); }
        if (e.key === 'Escape') { e.preventDefault(); input.removeEventListener('blur', onBlur); cancel(); }
        e.stopPropagation();
    });
    input.addEventListener('blur', onBlur);
    input.addEventListener('mousedown', e => e.stopPropagation());
}

async function deleteItem(id, windowId) {
    if (menuEl) { menuEl.remove(); menuEl = null; }
    const node = await idbGet(id);
    if (!node) return;
    const tmpId = await _getTmpId();
    if (node.parentId === tmpId) {
        // Already in Recycle Bin — permanently delete
        spawnWarning(`Permanently delete "${node.name}"?\n\nThis cannot be undone.`, [
            {
                label: 'Delete',
                style: 'danger',
                onClick: async () => {
                    if (node.type === 'folder') {
                        const total = 1 + await _countFolderItems(node.id);
                        const prog = total > 5 ? showFsProgress(`Deleting "${node.name}"`) : null;
                        const ctx = prog ? { done: 0, total, prog } : null;
                        await recursiveDelete(node.id, ctx);
                        if (prog) prog.close();
                    } else {
                        await idbDelete(node.id);
                    }
                    await renderAllWindows();
                }
            },
            { label: 'Cancel' }
        ]);
    } else {
        // Move to Recycle Bin (no confirmation needed)
        await _trashNode(node, tmpId);
        await renderAllWindows();
    }
}

async function recursiveDelete(folderId, ctx) {
    const children = await idbGetAllByIndex('parentId', folderId);
    for (const c of children) {
        if (ctx?.prog?.cancelled) return;
        while (ctx?.prog?.paused) await new Promise(r => setTimeout(r, 80));
        if (c.type === 'folder') await recursiveDelete(c.id, ctx);
        else await idbDelete(c.id);
        if (ctx) { ctx.done++; ctx.prog.update(ctx.done, ctx.total, c.name); }
    }
    if (!ctx?.prog?.cancelled) await idbDelete(folderId);
}

async function downloadItem(id) {
    if (menuEl) { menuEl.remove(); menuEl = null; }
    const node = await idbGet(id);
    if (node.type === 'file') {
        const blob = new Blob([node.content || ''], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = node.name;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
    } else {
        alert('Download of folders not supported.');
    }
}

/* ============================================================
   Markdown Viewer
============================================================ */

const MD_EXTS = new Set(['md', 'markdown', 'mdown', 'mkd']);

function parseMarkdown(src) {
    // Normalize line endings
    src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Fenced code blocks — collect them first so nothing else touches them
    const codeBlocks = [];
    src = src.replace(/^```(\w*)\n([\s\S]*?)^```/gm, (_, lang, code) => {
        const i = codeBlocks.length;
        codeBlocks.push(
            `<pre class="md-codeblock"><code class="lang-${lang || 'text'}">${_escHtml(code.replace(/\n$/, ''))}</code></pre>`
        );
        return `\x00CB${i}\x00`;
    });

    // Inline code (protect from further processing)
    const inlineCode = [];
    src = src.replace(/`([^`\n]+)`/g, (_, code) => {
        const i = inlineCode.length;
        inlineCode.push(`<code class="md-inline-code">${_escHtml(code)}</code>`);
        return `\x00IC${i}\x00`;
    });

    // Blockquotes
    src = src.replace(/^(>+ ?.+(?:\n>+ ?.+)*)/gm, (block) => {
        const inner = block.replace(/^>+ ?/gm, '');
        return `<blockquote class="md-blockquote">${inner}</blockquote>`;
    });

    // Headings
    src = src.replace(/^#{6}\s+(.+)$/gm, '<h6 class="md-h6">$1</h6>');
    src = src.replace(/^#{5}\s+(.+)$/gm, '<h5 class="md-h5">$1</h5>');
    src = src.replace(/^#{4}\s+(.+)$/gm, '<h4 class="md-h4">$1</h4>');
    src = src.replace(/^#{3}\s+(.+)$/gm, '<h3 class="md-h3">$1</h3>');
    src = src.replace(/^#{2}\s+(.+)$/gm, '<h2 class="md-h2">$1</h2>');
    src = src.replace(/^#{1}\s+(.+)$/gm, '<h1 class="md-h1">$1</h1>');

    // Horizontal rules
    src = src.replace(/^[-*_]{3,}\s*$/gm, '<hr class="md-hr">');

    // Images (before links so ![...](...) isn't caught by link regex)
    src = src.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
        if (/^javascript:/i.test(url) || /^data:/i.test(url)) return '';
        return `<img class="md-img" src="${url}" alt="${alt}">`;
    });

    // Links
    src = src.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
        const safe = /^javascript:/i.test(url) || /^data:/i.test(url) ? '#' : url;
        return `<a class="md-link" href="${safe}" target="_blank">${text}</a>`;
    });

    // Bold + italic
    src = src.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    src = src.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    src = src.replace(/\*(.+?)\*/g, '<em>$1</em>');
    src = src.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    src = src.replace(/__(.+?)__/g, '<strong>$1</strong>');
    src = src.replace(/_(.+?)_/g, '<em>$1</em>');
    src = src.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Unordered lists
    src = src.replace(/^(?:[*\-+] .+\n?)+/gm, (block) => {
        const items = block.trim().split('\n').map(line =>
            `<li>${line.replace(/^[*\-+] /, '')}</li>`
        ).join('');
        return `<ul class="md-list">${items}</ul>`;
    });

    // Ordered lists
    src = src.replace(/^(?:\d+\. .+\n?)+/gm, (block) => {
        const items = block.trim().split('\n').map(line =>
            `<li>${line.replace(/^\d+\. /, '')}</li>`
        ).join('');
        return `<ol class="md-list">${items}</ol>`;
    });

    // Paragraphs — wrap remaining loose text lines
    src = src.split('\n\n').map(block => {
        block = block.trim();
        if (!block) return '';
        if (/^<(h[1-6]|ul|ol|pre|blockquote|hr|div|table|img)/.test(block)) return block;
        if (block.startsWith('\x00CB')) return block;
        return `<p class="md-p">${block.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    // Restore code blocks and inline code
    src = src.replace(/\x00CB(\d+)\x00/g, (_, i) => codeBlocks[i]);
    src = src.replace(/\x00IC(\d+)\x00/g, (_, i) => inlineCode[i]);

    return src;
}

function _escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _buildMarkdownBody(body, item, windowId) {
    body.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;background:#1a1a1a;';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;background:#141414;border-bottom:1px solid #000;flex-shrink:0;';

    const filenameSpan = document.createElement('span');
    filenameSpan.style.cssText = 'color:#888;font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    filenameSpan.textContent = item.name || '';

    const editBtn = document.createElement('button');
    editBtn.className = 'small-btn';
    editBtn.textContent = '✏ Edit Source';
    editBtn.onclick = () => spawnApp('editor', item);

    toolbar.appendChild(filenameSpan);
    toolbar.appendChild(editBtn);
    body.appendChild(toolbar);

    // Content area
    const content = document.createElement('div');
    content.className = 'md-viewer';
    body.appendChild(content);

    // Parse and render
    let text = '';
    if (item.content) {
        if (item.content instanceof ArrayBuffer) text = new TextDecoder().decode(item.content);
        else text = String(item.content);
    }

    content.innerHTML = parseMarkdown(text);
}

/* ============================================================
   Zoom (global, affects CSS vars)
============================================================ */

function updateZoom(v) {
    const pct = v / 100;
    document.documentElement.style.setProperty('--item-size', Math.round(100 * pct) + 'px');
    document.documentElement.style.setProperty('--img-size', Math.round(64 * pct) + 'px');
}

/* ============================================================
   Desktop renderer
============================================================ */

// System desktop icons — always shown, before user files
const SYSTEM_DESKTOP_ICONS = [
    {
        id: 'system-computer',
        label: () => 'Computer',
        iconPath: '/usr/share/icons/128/computer.svg',
        iconWebPath: 'icons/16/computer.svg',
        action: () => spawnWindow('virt:computer'),
    },
    {
        id: 'system-home',
        label: () => getUsername() + '\'s Home',
        iconPath: '/usr/share/icons/128/folder-home.svg',
        iconWebPath: '',
        action: () => spawnWindow(null, `/home/${getUsername()}`),
    },
    {
        id: 'system-trash',
        label: () => 'Recycle Bin',
        iconPathFn: async () => {
            const tmpId = await _getTmpId();
            if (tmpId) {
                const items = await idbGetAllByIndex('parentId', tmpId);
                return items.length > 0
                    ? { fsPath: '/usr/share/icons/16/trash-full.svg', webPath: 'icons/16/trash-full.svg' }
                    : { fsPath: '/usr/share/icons/16/trash.svg',      webPath: 'icons/16/trash.svg' };
            }
            return { fsPath: '/usr/share/icons/16/trash.svg', webPath: 'icons/16/trash.svg' };
        },
        action: () => spawnWindow('virt:trash'),
        contextMenu: () => [
            { label: 'Open', icon: 'open', action: () => spawnWindow('virt:trash') },
            null,
            { label: 'Empty Recycle Bin', icon: 'delete', danger: true, action: () => emptyTrash() },
        ],
    },
];

function _getDesktopIconVisibility() {
    try { return JSON.parse(localStorage.getItem('edog_desktop_icons') || '{}'); } catch { return {}; }
}
function _isDesktopIconVisible(id) {
    return _getDesktopIconVisibility()[id] !== false;
}
function _setDesktopIconVisibility(id, visible) {
    const v = _getDesktopIconVisibility();
    v[id] = visible;
    localStorage.setItem('edog_desktop_icons', JSON.stringify(v));
}

async function _buildSystemIconTile(sys, desktopEl, deskState) {
    const tile = document.createElement('div');
    tile.className = 'item system-desktop-icon';
    tile.dataset.sysId = sys.id;
    tile.title = sys.label();

    const iconWrapper = document.createElement('div');
    iconWrapper.style.cssText = 'height:var(--img-size);display:flex;align-items:center;justify-content:center;';
    let img;
    if (sys.iconPathFn) {
        const { fsPath, webPath } = await sys.iconPathFn();
        img = await loadIconImg(fsPath, webPath);
    } else {
        img = await loadIconImg(sys.iconPath, sys.iconWebPath || '');
    }
    img.className = 'icon-img';
    iconWrapper.appendChild(img);
    tile.appendChild(iconWrapper);

    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = sys.label();
    tile.appendChild(nameDiv);

    tile.onmousedown = (ev) => {
        if (ev.button !== 0) return;
        desktopEl.querySelectorAll('.item').forEach(el => el.classList.remove('selected'));
        deskState.selectedIds.clear();
        deskState.anchorId = null;
        tile.classList.add('selected');
    };

    tile.ondblclick = sys.action;

    tile.oncontextmenu = (ev) => {
        ev.preventDefault();
        desktopEl.querySelectorAll('.item').forEach(el => el.classList.remove('selected'));
        deskState.selectedIds.clear();
        tile.classList.add('selected');
        const items = sys.contextMenu ? sys.contextMenu() : [{ label: 'Open', icon: 'open', action: sys.action }];
        buildMenu(ev.clientX, ev.clientY, items);
    };

    return tile;
}

let _renderDesktopGen = 0;

async function renderDesktop() {
    const gen = ++_renderDesktopGen;
    const username = getUsername();
    let desktopNode = null;
    const rootChildren = await idbGetAllByIndex('parentId', 'root');
    if (gen !== _renderDesktopGen) return;
    const homeDir = rootChildren.find(n => n.name === 'home' && n.type === 'folder');
    if (homeDir) {
        const homeChildren = await idbGetAllByIndex('parentId', homeDir.id);
        if (gen !== _renderDesktopGen) return;
        const userDir = homeChildren.find(n => n.name === username && n.type === 'folder');
        if (userDir) {
            const userChildren = await idbGetAllByIndex('parentId', userDir.id);
            if (gen !== _renderDesktopGen) return;
            desktopNode = userChildren.find(n => n.name === 'Desktop' && n.type === 'folder');
        }
    }
    if (!desktopNode) return;

    const items = await idbGetAllByIndex('parentId', desktopNode.id);
    if (gen !== _renderDesktopGen) return;
    const desktopEl = document.getElementById('virtualDesktop');
    desktopEl.innerHTML = '';

    // Desktop multi-select state
    const deskState = { selectedIds: new Set(), anchorId: null };

    // Render pinned system icons first (respect per-icon visibility)
    for (const sys of SYSTEM_DESKTOP_ICONS) {
        if (!_isDesktopIconVisible(sys.id)) continue;
        const tile = await _buildSystemIconTile(sys, desktopEl, deskState);
        if (gen !== _renderDesktopGen) return;
        desktopEl.appendChild(tile);
    }

    for (const item of items) {
        const tile = document.createElement('div');
        tile.className = 'item';
        tile.dataset.id = item.id;
        tile.title = item.name;
        if (fsClipboard.mode === 'cut' && fsClipboard.ids.includes(item.id)) tile.classList.add('cut-pending');

        const iconWrapper = await buildFileIconWrapper(item);
        if (gen !== _renderDesktopGen) return;
        tile.appendChild(iconWrapper);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        nameDiv.textContent = item.name;
        tile.appendChild(nameDiv);

        tile.onmousedown = (ev) => {
            if (ev.button !== 0) return;
            if (ev.ctrlKey) {
                if (deskState.selectedIds.has(item.id)) {
                    deskState.selectedIds.delete(item.id);
                    tile.classList.remove('selected');
                } else {
                    deskState.selectedIds.add(item.id);
                    tile.classList.add('selected');
                    deskState.anchorId = item.id;
                }
            } else if (ev.shiftKey && deskState.anchorId) {
                const allTiles = [...desktopEl.querySelectorAll('.item')];
                const anchorIdx = allTiles.findIndex(t => t.dataset.id === deskState.anchorId);
                const thisIdx = allTiles.findIndex(t => t.dataset.id === item.id);
                const [start, end] = anchorIdx <= thisIdx ? [anchorIdx, thisIdx] : [thisIdx, anchorIdx];
                allTiles.forEach(t => t.classList.remove('selected'));
                deskState.selectedIds.clear();
                for (let i = start; i <= end; i++) {
                    allTiles[i].classList.add('selected');
                    deskState.selectedIds.add(allTiles[i].dataset.id);
                }
            } else {
                desktopEl.querySelectorAll('.item').forEach(el => el.classList.remove('selected'));
                deskState.selectedIds.clear();
                tile.classList.add('selected');
                deskState.selectedIds.add(item.id);
                deskState.anchorId = item.id;
            }
        };

        tile.ondblclick = async () => {
            if (item.type === 'folder') spawnWindow(item.id);
            else openFile(item);
        };

        tile.oncontextmenu = (ev) => {
            ev.preventDefault();
            if (!deskState.selectedIds.has(item.id)) {
                desktopEl.querySelectorAll('.item').forEach(el => el.classList.remove('selected'));
                deskState.selectedIds.clear();
                tile.classList.add('selected');
                deskState.selectedIds.add(item.id);
                deskState.anchorId = item.id;
            }
            showDesktopContextMenu(ev.clientX, ev.clientY, item, deskState);
        };

        // Drag source
        tile.draggable = true;
        tile.ondragstart = (ev) => {
            if (!deskState.selectedIds.has(item.id)) {
                desktopEl.querySelectorAll('.item').forEach(el => el.classList.remove('selected'));
                deskState.selectedIds.clear();
                deskState.selectedIds.add(item.id);
                deskState.anchorId = item.id;
                tile.classList.add('selected');
            }
            ev.dataTransfer.setData('application/edogos-items', JSON.stringify([...deskState.selectedIds]));
            ev.dataTransfer.effectAllowed = 'move';
            requestAnimationFrame(() => {
                deskState.selectedIds.forEach(id => {
                    document.querySelectorAll(`.item[data-id="${id}"]`).forEach(el => el.classList.add('drag-source'));
                });
            });
        };
        tile.ondragend = () => {
            document.querySelectorAll('.item.drag-source').forEach(e => e.classList.remove('drag-source'));
            document.querySelectorAll('.item.drag-over').forEach(e => e.classList.remove('drag-over'));
        };

        if (item.type === 'folder') {
            tile.ondragover = (ev) => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move'; tile.classList.add('drag-over'); };
            tile.ondragleave = () => tile.classList.remove('drag-over');
            tile.ondrop = async (ev) => {
                ev.preventDefault();
                tile.classList.remove('drag-over');
                const raw = ev.dataTransfer.getData('application/edogos-items');
                if (raw) await _moveItems(JSON.parse(raw), item.id);
            };
        }

        desktopEl.appendChild(tile);
    }

    desktopEl.oncontextmenu = (ev) => {
        if (ev.target === desktopEl) {
            ev.preventDefault();
            showDesktopBlankContextMenu(ev.clientX, ev.clientY);
        }
    };

    desktopEl.onmousedown = (ev) => {
        if (ev.target === desktopEl) {
            desktopEl.querySelectorAll('.item').forEach(el => el.classList.remove('selected'));
            deskState.selectedIds.clear();
            deskState.anchorId = null;
        }
    };

    // Desktop as drop target (drop onto desktop = move to Desktop folder)
    desktopEl.ondragover = (ev) => { if (ev.target === desktopEl) { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move'; } };
    desktopEl.ondrop = async (ev) => {
        if (ev.target !== desktopEl) return;
        ev.preventDefault();
        const raw = ev.dataTransfer.getData('application/edogos-items');
        if (raw) await _moveItems(JSON.parse(raw), desktopNode.id);
    };
}

async function getDesktopNode() {
    const username = getUsername();
    const rootChildren = await idbGetAllByIndex('parentId', 'root');
    const homeDir = rootChildren.find(n => n.name === 'home' && n.type === 'folder');
    if (!homeDir) return null;
    const homeChildren = await idbGetAllByIndex('parentId', homeDir.id);
    const userDir = homeChildren.find(n => n.name === username && n.type === 'folder');
    if (!userDir) return null;
    const userChildren = await idbGetAllByIndex('parentId', userDir.id);
    return userChildren.find(n => n.name === 'Desktop' && n.type === 'folder') || null;
}

function clampMenuToScreen(el) {
    const rect = el.getBoundingClientRect();
    if (rect.right > window.innerWidth) el.style.left = (window.innerWidth - rect.width - 8) + 'px';
    if (rect.bottom > window.innerHeight - 44) el.style.top = (window.innerHeight - 44 - rect.height - 4) + 'px';
}

function closeMenu() {
    if (menuEl) { menuEl.remove(); menuEl = null; }
    window.removeEventListener('mousedown', closeMenuOnOutsideClick);
}

function closeMenuOnOutsideClick(e) {
    if (menuEl && !menuEl.contains(e.target)) closeMenu();
}

/* ============================================================
   Other apps
============================================================ */

function spawnAbout() {
    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 28;
    const left = Math.min(80 + offset, window.innerWidth - 240);
    const top = Math.min(80 + offset, window.innerHeight - 320);

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.left = left + 'px';
    win.style.top = top + 'px';
    win.style.width = '240px';
    win.style.height = '320px';

    win.addEventListener('mousedown', () => focusWindow(windowId));

    win.innerHTML = `
                <div class="title-bar">
                    <button class="window-close-button" title="Close">✕</button>
                    <button class="window-minimize-button" title="Minimize">—</button>
            <button class="window-maximize-button" title="Maximize">□</button>
                    <span class="title-bar-text"><img class="app-icon-title-bar" src="icons/16/info.png"> About</span>
                </div>
                <div class="app-body" style="height: calc(100% - var(--titlebar-height));overflow:hidden;display:flex;flex-direction:column;"></div>
            `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'about' } };

    win.querySelector('.title-bar').addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });
    addResizeHandles(win);
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);
    win.querySelector('.window-maximize-button').onclick = () => maximizeWindow(windowId);

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.innerHTML = '<img class="app-icon-title-bar" src="icons/16/info.png"> About';
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));

    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [{ label: "Close", icon: "close", action: () => closeWindow(windowId) }]);
    };
    windows[windowId].taskbarBtn = tbBtn;

    const body = win.querySelector('.app-body');

    _buildAboutBody(body);

    focusWindow(windowId);

    return windowId;
}

function spawnGame(gameName) {
    if (!GAMES.has(gameName)) {
        spawnError("Invalid game");
        return;
    }
    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 28;
    const left = Math.min(80 + offset, window.innerWidth - 800);
    const top = Math.min(80 + offset, window.innerHeight - 600);

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.left = left + 'px';
    win.style.top = top + 'px';
    win.style.width = '800px';
    win.style.height = '600px';

    win.addEventListener('mousedown', () => focusWindow(windowId));

    win.innerHTML = `
        <div class="title-bar">
            <button class="window-close-button" title="Close">✕</button>
            <button class="window-minimize-button" title="Minimize">—</button>
            <button class="window-maximize-button" title="Maximize">□</button>
            <span class="title-bar-text"><img class="app-icon-title-bar" src="icons/16/applications-games.png"> ${gameName}</span>
        </div>
        <div class="app-body" style="height: calc(100% - var(--titlebar-height));overflow:hidden;display:flex;flex-direction:column;"></div>
    `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'about' } };

    win.querySelector('.title-bar').addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });
    addResizeHandles(win);
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);
    win.querySelector('.window-maximize-button').onclick = () => maximizeWindow(windowId);

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.innerHTML = `<img class="app-icon-title-bar" src="icons/16/applications-games.png"> ${gameName}`;
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));

    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [{ label: "Close", icon: "close", action: () => closeWindow(windowId) }]);
    };
    windows[windowId].taskbarBtn = tbBtn;

    const body = win.querySelector('.app-body');

    _buildGameBody(body, gameName);

    focusWindow(windowId);

    return windowId;
}

/* ============================================================
   System Dialog (Error / Warning / Info)
============================================================ */

const DIALOG_TYPES = {
    error: { iconPath: '/usr/share/icons/16/dialog-error.png', iconPath128: '/usr/share/icons/dialog-error.svg', label: 'Error', titleColor: '#f87171' },
    warning: { iconPath: '/usr/share/icons/16/dialog-warning.png', iconPath128: '/usr/share/icons/dialog-warning.svg', label: 'Warning', titleColor: '#fbbf24' },
    info: { iconPath: '/usr/share/icons/16/dialog-info.png', iconPath128: '/usr/share/icons/dialog-info.svg', label: 'Info', titleColor: '#60a5fa' },
};

/**
 * Spawn a system dialog window.
 *
 * @param {string}  text        - The message to display
 * @param {string}  [type]      - 'error' | 'warning' | 'info'  (default: 'error')
 * @param {Array}   [buttons]   - Array of button objects: { label, onClick?, close? }
 *                                 close defaults to true (closes the dialog after clicking).
 *                                 If omitted, a single "OK" button is shown.
 * @returns {string} windowId
 *
 * @example
 *   // Simple error (works exactly like the old spawnError)
 *   spawnError('Something went wrong!');
 *
 *   // Warning with default OK
 *   spawnError('Disk space is low.', 'warning');
 *
 *   // Info with custom buttons
 *   spawnError('Save changes before closing?', 'info', [
 *       { label: 'Save',    onClick: () => saveDocument() },
 *       { label: 'Discard', onClick: () => discardChanges(), style: 'danger' },
 *       { label: 'Cancel' },
 *   ]);
 */
function spawnError(text, type = 'error', buttons = null) {
    const dialogType = DIALOG_TYPES[type] || DIALOG_TYPES.error;

    if (!buttons || buttons.length === 0) {
        buttons = [{ label: 'OK' }];
    }

    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 28;
    const left = Math.min(80 + offset, window.innerWidth - 420);
    const top = Math.min(80 + offset, window.innerHeight - 240);

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.left = left + 'px';
    win.style.top = top + 'px';
    win.style.width = '420px';
    win.style.height = '220px';

    win.addEventListener('mousedown', () => focusWindow(windowId));

    const shortTitle = text.length > 30 ? text.slice(0, 30).trimEnd() + '…' : text;

    win.innerHTML = `
        <div class="title-bar">
            <button class="window-close-button" title="Close">✕</button>
            <span class="title-bar-text"><span id="titleicon-${windowId}"></span> ${dialogType.label}</span>
        </div>
        <div class="app-body" style="height: calc(100% - var(--titlebar-height));overflow:hidden;display:flex;flex-direction:column;"></div>
    `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'dialog' } };

    // Title bar icon
    imgFromFS(dialogType.iconPath).then(img => {
        const wrapper = win.querySelector(`#titleicon-${windowId}`);
        img.className = 'app-icon-title-bar';
        if (wrapper) wrapper.appendChild(img);
    });

    win.querySelector('.title-bar').addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });
    addResizeHandles(win);
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);

    // Taskbar button
    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.innerHTML = `<span id="tbicon-${windowId}"></span> ${dialogType.label}`;
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [{ label: 'Close', icon: 'close', action: () => closeWindow(windowId) }]);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));
    windows[windowId].taskbarBtn = tbBtn;

    imgFromFS(dialogType.iconPath).then(img => {
        const wrapper = tbBtn.querySelector(`#tbicon-${windowId}`);
        img.className = 'app-icon-title-bar';
        if (wrapper) wrapper.appendChild(img);
    });

    // Build body
    const body = win.querySelector('.app-body');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.backgroundColor = '#2e2e2e';

    // Content row (icon + text)
    const contentRow = document.createElement('div');
    contentRow.style.cssText = `
        display: flex; align-items: center; gap: 20px;
        padding: 24px 28px; flex: 1;
        background: #3a3a3a;
    `;

    const iconWrapper = document.createElement('div');
    iconWrapper.style.cssText = 'flex-shrink:0; width:48px; height:48px; display:flex; align-items:center; justify-content:center;';

    imgFromFS(dialogType.iconPath128).then(img => {
        img.width = '48';
        img.height = '48';
        iconWrapper.appendChild(img);
    });

    const textEl = document.createElement('div');
    textEl.style.cssText = 'color:#fff; font-size:14px; line-height:1.5; word-break:break-word;';
    textEl.textContent = text;

    contentRow.appendChild(iconWrapper);
    contentRow.appendChild(textEl);
    body.appendChild(contentRow);

    // Button row
    const btnRow = document.createElement('div');
    btnRow.style.cssText = `
        display: flex; justify-content: flex-end; gap: 8px;
        padding: 10px 16px;
        background: #2e2e2e;
        border-top: 1px solid #222;
    `;

    for (const btnDef of buttons) {
        const btn = document.createElement('button');
        btn.className = 'small-btn';
        btn.textContent = btnDef.label;
        btn.style.cssText = 'padding:6px 20px; cursor:pointer; font-size:13px; min-width:80px;';

        if (btnDef.style === 'danger') {
            btn.style.color = '#f87171';
        } else if (btnDef.style === 'primary') {
            btn.style.background = '#3b82f6';
            btn.style.color = '#fff';
            btn.style.borderColor = '#2563eb';
        }

        btn.onclick = () => {
            if (btnDef.onClick) btnDef.onClick(windowId);
            if (btnDef.close !== false) closeWindow(windowId);
        };

        btnRow.appendChild(btn);
    }

    body.appendChild(btnRow);
    focusWindow(windowId);

    return windowId;
}

function spawnWarning(text, buttons) {
    return spawnError(text, 'warning', buttons);
}

function spawnInfo(text, buttons) {
    return spawnError(text, 'info', buttons);
}

/**
 * Spawn a prompt dialog — like the browser's prompt(), but as a window.
 * Returns a Promise that resolves with the entered text, or null if cancelled.
 *
 * @param {string}  message          - The question / label to display
 * @param {string}  [defaultValue]   - Pre-filled text in the input (default: '')
 * @param {object}  [opts]           - Optional overrides
 * @param {string}  [opts.title]     - Window title (default: 'Prompt')
 * @param {string}  [opts.okLabel]   - OK button label (default: 'OK')
 * @param {string}  [opts.cancelLabel] - Cancel button label (default: 'Cancel')
 * @param {string}  [opts.placeholder] - Input placeholder text
 * @returns {Promise<string|null>}
 *
 * @example
 *   const name = await spawnPrompt('What is your name?');
 *   if (name !== null) console.log('Hello, ' + name);
 *
 *   const value = await spawnPrompt('Enter a filename:', 'untitled.txt', {
 *       title: 'New File',
 *       placeholder: 'filename.ext',
 *   });
 */
function spawnPrompt(message, defaultValue = '', opts = {}) {
    const {
        title = 'Prompt',
        okLabel = 'OK',
        cancelLabel = 'Cancel',
        placeholder = '',
    } = opts;

    return new Promise((resolve) => {
        const windowId = 'win_' + (++winCount);
        const offset = (winCount - 1) * 28;
        const left = Math.min(80 + offset, window.innerWidth - 440);
        const top = Math.min(80 + offset, window.innerHeight - 220);

        let resolved = false;

        function finish(value) {
            if (resolved) return;
            resolved = true;
            closeWindow(windowId);
            resolve(value);
        }

        const win = document.createElement('div');
        win.className = 'app-window';
        win.id = windowId;
        win.style.left = left + 'px';
        win.style.top = top + 'px';
        win.style.width = '440px';
        win.style.height = '210px';

        win.addEventListener('mousedown', () => focusWindow(windowId));

        win.innerHTML = `
            <div class="title-bar">
                <button class="window-close-button" title="Close">✕</button>
                <span class="title-bar-text"><span id="titleicon-${windowId}"></span> ${title}</span>
            </div>
            <div class="app-body" style="height:calc(100% - var(--titlebar-height));overflow:hidden;display:flex;flex-direction:column;"></div>
        `;

        document.getElementById('windowContainer').appendChild(win);
        windows[windowId] = { el: win, state: { type: 'prompt' } };

        // Title bar icon
        imgFromFS('/usr/share/icons/16/dialog-question.svg').then(img => {
            const wrapper = win.querySelector(`#titleicon-${windowId}`);
            img.className = 'app-icon-title-bar';
            if (wrapper) wrapper.appendChild(img);
        }).catch(() => { });

        win.querySelector('.title-bar').addEventListener('mousedown', e => {
            if (e.target.closest('button')) return;
            startDrag(e, win);
        });
        addResizeHandles(win);
        win.querySelector('.window-close-button').onclick = () => finish(null);

        // Taskbar button
        const tbBtn = document.createElement('button');
        tbBtn.className = 'win-btn';
        tbBtn.dataset.winid = windowId;
        tbBtn.innerHTML = `<span id="tbicon-${windowId}"></span> ${title}`;
        tbBtn.onclick = () => {
            if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
            else focusWindow(windowId);
        };
        tbBtn.oncontextmenu = (ev) => {
            ev.preventDefault();
            buildMenu(ev.clientX, ev.clientY, [{ label: 'Close', icon: 'close', action: () => finish(null) }]);
        };
        document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));
        windows[windowId].taskbarBtn = tbBtn;

        imgFromFS('/usr/share/icons/16/dialog-question.svg').then(img => {
            const wrapper = tbBtn.querySelector(`#tbicon-${windowId}`);
            img.className = 'app-icon-title-bar';
            if (wrapper) wrapper.appendChild(img);
        }).catch(() => { });

        // Body
        const body = win.querySelector('.app-body');
        body.style.cssText = 'display:flex; flex-direction:column; background:#2e2e2e;';

        // Content area (icon + message + input)
        const contentRow = document.createElement('div');
        contentRow.style.cssText = `
            display:flex; align-items:flex-start; gap:16px;
            padding:20px 24px 12px; flex:1; background:#3a3a3a;
        `;

        const iconWrapper = document.createElement('div');
        iconWrapper.style.cssText = 'flex-shrink:0; width:40px; height:40px; display:flex; align-items:center; justify-content:center; margin-top:2px;';

        imgFromFS('/usr/share/icons/dialog-question.svg').then(img => {
            img.width = '40';
            img.height = '40';
            iconWrapper.appendChild(img);
        }).catch(() => {
            iconWrapper.textContent = '❓';
            iconWrapper.style.fontSize = '28px';
        });

        const rightCol = document.createElement('div');
        rightCol.style.cssText = 'flex:1; display:flex; flex-direction:column; gap:10px;';

        const msgEl = document.createElement('div');
        msgEl.style.cssText = 'color:#e0e0e0; font-size:14px; line-height:1.4;';
        msgEl.textContent = message;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = defaultValue;
        input.placeholder = placeholder;
        input.style.cssText = `
            width:100%; box-sizing:border-box;
            background:#1e1e1e; color:#d4d4d4;
            border:1px solid #555; border-radius:4px;
            padding:7px 10px; font-size:13px;
            font-family:inherit; outline:none;
        `;
        input.addEventListener('focus', () => { input.style.borderColor = '#3b82f6'; });
        input.addEventListener('blur', () => { input.style.borderColor = '#555'; });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); finish(input.value); }
            if (e.key === 'Escape') { e.preventDefault(); finish(null); }
        });

        rightCol.appendChild(msgEl);
        rightCol.appendChild(input);
        contentRow.appendChild(iconWrapper);
        contentRow.appendChild(rightCol);
        body.appendChild(contentRow);

        // Button row
        const btnRow = document.createElement('div');
        btnRow.style.cssText = `
            display:flex; justify-content:flex-end; gap:8px;
            padding:10px 16px; background:#2e2e2e; border-top:1px solid #222;
        `;

        const okBtn = document.createElement('button');
        okBtn.className = 'small-btn';
        okBtn.textContent = okLabel;
        okBtn.style.cssText = 'padding:6px 20px; cursor:pointer; font-size:13px; min-width:80px; background:#3b82f6; color:#fff; border-color:#2563eb;';
        okBtn.onclick = () => finish(input.value);

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'small-btn';
        cancelBtn.textContent = cancelLabel;
        cancelBtn.style.cssText = 'padding:6px 20px; cursor:pointer; font-size:13px; min-width:80px;';
        cancelBtn.onclick = () => finish(null);

        btnRow.appendChild(cancelBtn);
        btnRow.appendChild(okBtn);
        body.appendChild(btnRow);

        focusWindow(windowId);

        // Auto-focus and select the input
        setTimeout(() => {
            input.focus();
            input.select();
        }, 50);
    });
}

/* ============================================================
   Start menu
============================================================ */
let startMenuIconsInited = false;

function initStartMenuIcons() {
    if (startMenuIconsInited) return;
    startMenuIconsInited = true;
    const places = [
        { id: 'smicon-home', slug: 'home', color: '#5ba4ff' },
        { id: 'smicon-desktop', slug: 'desktop', color: '#7dd3fc' },
        { id: 'smicon-documents', slug: 'documents', color: '#93c5fd' },
        { id: 'smicon-downloads', slug: 'downloads', color: '#6ee7b7' },
        { id: 'smicon-pictures', slug: 'pictures', color: '#f9a8d4' },
        { id: 'smicon-music', slug: 'music', color: '#c4b5fd' },
        { id: 'smicon-videos', slug: 'videos', color: '#fcd34d' },
        { id: 'smicon-root', slug: 'root', color: '#94a3b8' },
        { id: 'smicon-trash', slug: 'trash', color: '#f87171' }
    ];
    for (const { id, slug, color } of places) {
        const span = document.getElementById(id);
        if (!span) continue;
        const img = document.createElement('img');
        img.src = `./icons/16/folder-${slug}.svg`;
        img.width = 16; img.height = 16;
        img.style.objectFit = 'contain';
        img.onerror = () => {
            img.remove();
            const fb = document.createElement('span');
            fb.style.cssText = `color:${color};display:flex;align-items:center;width:16px;height:16px;`;
            fb.innerHTML = SVG_ICONS[slug] || SVG_ICONS.folder;
            const svgEl = fb.querySelector('svg');
            if (svgEl) { svgEl.style.width = '16px'; svgEl.style.height = '16px'; }
            span.appendChild(fb);
        };
        span.appendChild(img);
    }
}

function toggleStartMenu(ev) {
    ev.stopPropagation();
    const menu = document.getElementById('startMenu');
    const isOpen = menu.classList.toggle('open');
    if (isOpen) {
        initStartMenuIcons();
        document.getElementById('startSearch').value = '';
        filterStartApps('');
        setTimeout(() => window.addEventListener('mousedown', closeStartOnOutside), 0);
    }
}

function closeStartMenu() {
    document.getElementById('startMenu').classList.remove('open');
    window.removeEventListener('mousedown', closeStartOnOutside);
}

function closeStartOnOutside(e) {
    const menu = document.getElementById('startMenu');
    const btn = document.getElementById('startBtn');
    if (!menu.contains(e.target) && e.target !== btn) closeStartMenu();
}

function filterStartApps(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('#startAppList .start-app-tile').forEach(tile => {
        tile.style.display = q && !tile.textContent.toLowerCase().includes(q) ? 'none' : '';
    });
    document.querySelectorAll('#startPlaceList .start-place-btn').forEach(btn => {
        btn.style.display = q && !btn.textContent.toLowerCase().includes(q) ? 'none' : '';
    });
}

async function getUserDirId() {
    const username = getUsername();
    const rootChildren = await idbGetAllByIndex('parentId', 'root');
    const homeDir = rootChildren.find(n => n.name === 'home' && n.type === 'folder');
    if (!homeDir) return null;
    const homeChildren = await idbGetAllByIndex('parentId', homeDir.id);
    return homeChildren.find(n => n.name === username && n.type === 'folder')?.id || null;
}

async function startMenuAction(action) {
    closeStartMenu();
    const username = getUsername();
    const homePath = `/home/${username}`;

    if (action === 'newWindow') {
        spawnWindow();
    } else if (action === 'openTerminal') {
        spawnTerminal();
    } else if (action === 'newFile') {
        const userDirId = await getUserDirId();
        if (!userDirId) return;
        const wid = spawnWindow(null, homePath);
        await navigateToPath(wid, homePath);
        await createItemInline('file', userDirId, wid);
    } else if (action === 'newFolder') {
        const userDirId = await getUserDirId();
        if (!userDirId) return;
        const wid = spawnWindow(null, homePath);
        await navigateToPath(wid, homePath);
        await createItemInline('folder', userDirId, wid);
    } else if (action === 'settings') {
        alert('Settings — coming soon!');
    } else if (action === 'about') {
        spawnAbout();
    } else if (action === 'clearStorage') {
        if (confirm('This will wipe all files and folders. Are you sure?')) {
            if (dbPromise) { dbPromise.close(); dbPromise = null; }
            const req = indexedDB.deleteDatabase(DB_NAME);
            req.onsuccess = () => location.reload();
            req.onerror = () => { alert('Failed to wipe storage.'); };
            req.onblocked = () => { location.reload(); };
        }
    } else if (action === 'reboot') {
        reboot();
    } else if (action === 'shutdown') {
        shutdown();
    } else if (action === 'bsod') {
        showBSOD();
    }
}

function startOpenFolder(path) {
    closeStartMenu();
    spawnWindow(null, path);
}

/* ============================================================
   Custom App Bridge
============================================================ */

function _normalizeFSPath(path) {
    const home = '/home/' + getUsername();
    if (path === '~') return home;
    if (path.startsWith('~/')) return home + path.slice(1);
    return path;
}

window.addEventListener('message', async (e) => {
    // Only handle messages from our own iframes
    if (!e.data || e.data.channel !== 'edogfs') return;

    const { id, action, args } = e.data;
    const source = e.source; // the iframe's window
    let result, error;

    // Normalize path once, up front
    if (args.path) args.path = _normalizeFSPath(args.path);

    try {
        switch (action) {
            case 'readFile': {
                const file = await accessFile(args.path);
                result = {
                    text: file.contentType === 'text' ? file.text : null,
                    base64: file.contentType === 'binary'
                        ? _arrayBufferToBase64(file.buffer) : null,
                    name: file.name, mime: file.mime, size: file.size
                };
                break;
            }
            case 'writeFile': {
                const content = args.base64
                    ? _base64ToArrayBuffer(args.base64)
                    : (args.text ?? '');
                const node = await _fsResolve(args.path);
                if (node && node.type === 'file') {
                    node.content = content;
                    node.size = typeof content === 'string'
                        ? new Blob([content]).size : content.byteLength;
                    node.updatedAt = Date.now();
                    await idbPut(node);
                    await renderAllWindows();
                    result = { ok: true, id: node.id };
                } else {
                    const created = await createFile(args.path, content);
                    result = { ok: true, id: created.id };
                }
                break;
            }
            case 'listDir': {
                const dir = await _fsResolve(args.path);
                if (!dir || dir.type !== 'folder')
                    throw new Error('Not a directory: ' + args.path);
                const children = await idbGetAllByIndex('parentId', dir.id);
                result = children.map(c => ({
                    name: c.name, type: c.type,
                    size: c.size || 0, mime: c.mime || '',
                }));
                break;
            }
            case 'mkdir': {
                const folder = await createFolder(args.path);
                result = { ok: true, id: folder.id };
                break;
            }
            case 'delete': {
                const node = await _fsResolve(args.path);
                if (!node) throw new Error('Not found: ' + args.path);
                if (node.type === 'folder') await recursiveDelete(node.id);
                else await idbDelete(node.id);
                await renderAllWindows();
                result = { ok: true };
                break;
            }
            case 'exists': {
                const node = await _fsResolve(args.path);
                result = { exists: !!node, type: node?.type || null };
                break;
            }
            default:
                throw new Error('Unknown FS action: ' + action);
        }
    } catch (err) {
        error = err.message;
    }

    source.postMessage({ channel: 'edogfs', id, result, error }, '*');
});

window.addEventListener('message', (e) => {
    if (!e.data || e.data.channel !== 'edogos') return;

    const { id, action, args } = e.data;
    const source = e.source;
    let result, error;

    try {
        switch (action) {
            case 'spawnBSOD':
                showBSOD(args.errorCode || undefined, args.errorName || undefined);
                result = { ok: true };
                break;
            case 'spawnError':
                spawnError(args.text ?? '', args.type || 'error');
                result = { ok: true };
                break;
            case 'reboot':
                reboot();
                result = { ok: true };
                break;
            case 'shutdown':
                shutdown();
                result = { ok: true };
                break;
            case 'getVersion':
                result = { version: VERSION };
                break;
            default:
                throw new Error('Unknown OS action: ' + action);
        }
    } catch (err) {
        error = err.message;
    }

    source.postMessage({ channel: 'edogos', id, result, error }, '*');
});

function _arrayBufferToBase64(buf) {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function _base64ToArrayBuffer(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}

/* ============================================================
   Taskbar
============================================================ */

const taskbarTray = document.getElementById("taskbar-tray");
const dateTime = document.getElementById("date-time");

async function initWiFiIcon() {
    // let's remove this, it's bad
    //
    // if (navigator.onLine) {
    //     document.getElementById("wifi-icon").remove();
    //     let newIcon = await imgFromFS("/usr/share/icons/tray/network-100.png");
    //     newIcon.title = "Internet Access";
    //     dateTime.parentNode.insertBefore(newIcon, dateTime);
    // } else {
    //     document.getElementById("wifi-icon").remove();
    //     let newIcon = await imgFromFS("/usr/share/icons/tray/network-offline.png");
    //     newIcon.title = "Network Disconnected";
    //     dateTime.parentNode.insertBefore(newIcon, dateTime);
    // }
    document.getElementById("wifi-icon").remove();
    let newIcon = await imgFromFS("/usr/share/icons/tray/network-100.png");
    newIcon.title = "Internet Access";
    newIcon.style.cssText = 'width:18px;height:18px;object-fit:contain;opacity:0.85;';
    dateTime.parentNode.insertBefore(newIcon, dateTime);
}

/* ============================================================
   Boot
============================================================ */
async function init() {
    dbPromise = await openDB();
    applyTheme(currentTheme);

    async function bootIntoOS() {
        const setupResult = await (window.__setupComplete ?? Promise.resolve({ freshInstall: false }));

        // Run system update check for returning users (no-op on fresh installs)
        await (window.__updateComplete ?? Promise.resolve());

        document.getElementById('virtualDesktop').style.visibility = 'visible';
        document.getElementById('taskbar').style.visibility = 'visible';

        if (setupResult && setupResult.freshInstall) {
            // Fresh install already completed via setup — just open home
            // const username = setupResult.username || getUsername();
            // const wid = spawnWindow();
            // setTimeout(() => navigateToPath(wid, `/home/${username}`), 80);
            renderDesktop();
            initWiFiIcon();
        } else {
            await ensureDefaultFolders();
            await _restoreMountsFromStorage();
            // const wid = spawnWindow();
            // setTimeout(() => {
            //     navigateToPath(wid, `/home/${getUsername()}`);
            // }, 80);
            renderDesktop()
            initWiFiIcon();
        }
    }

    // Check if the boot/login system is loaded
    if (new URLSearchParams(location.search).has('edog_secondary')) {
        // Secondary monitor — skip boot/login, go straight to desktop
        await bootIntoOS();
    } else if (typeof window.__bootAndLogin === 'function') {
        window.__bootAndLogin(() => bootIntoOS());
    } else {
        // Fallback: no boot/login (boot.js not loaded)
        await bootIntoOS();
    }
}

init();

async function ensureDefaultFolders() {
    const all = await idbGetAll();
    const byParent = {};
    for (const n of all) {
        if (!byParent[n.parentId]) byParent[n.parentId] = [];
        byParent[n.parentId].push(n);
    }

    async function ensureFolder(name, parentId) {
        const existing = (byParent[parentId] || []).find(n => n.name === name && n.type === 'folder');
        if (existing) return existing.id;
        const id = crypto.randomUUID();
        const node = { id, name, type: 'folder', parentId, createdAt: Date.now(), updatedAt: Date.now() };
        await idbAdd(node);
        if (!byParent[parentId]) byParent[parentId] = [];
        byParent[parentId].push(node);
        byParent[id] = [];
        return id;
    }

    const rootDirs = ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'lost+found', 'media', 'mnt', 'opt', 'proc', 'root', 'sbin', 'sys', 'tmp', 'usr', 'var'];
    for (const name of rootDirs) {
        await ensureFolder(name, 'root');
    }

    const homeIdReal = (await idbGetAllByIndex('parentId', 'root')).find(n => n.name === 'home')?.id;
    const savedUser = getUsername();
    const userDirId = await ensureFolder(savedUser, homeIdReal);

    const userDirs = ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Videos', 'Templates', 'Public'];
    for (const name of userDirs) {
        await ensureFolder(name, userDirId);
    }
}



/* ============================================================
   THEME SYSTEM
============================================================ */

/* -- Custom-color theme helpers -- */
function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function generateCustomVars(hex) {
    const [h, s] = hexToHsl(hex);
    const sm = Math.min(s * 0.5, 50);
    const sl = Math.min(s * 0.3, 30);
    const hs = (S, L) => `hsl(${h},${S}%,${L}%)`;
    const al = 50, as_ = Math.max(s, 60);
    const accent = `hsl(${h},${as_}%,${al}%)`;
    return {
        '--desktop-bg': hs(sl, 8),
        '--desktop-text': hs(50, 88),
        '--window-bg': hs(sl, 10),
        '--window-border': hs(sm, 20),
        '--window-shadow': '0 8px 30px rgba(0,0,0,0.7)',
        '--window-shadow-focus': '0 12px 40px rgba(0,0,0,0.9)',
        '--window-radius': '6px',
        '--titlebar-bg': `linear-gradient(180deg,${hs(sm, 18)},${hs(sm, 11)})`,
        '--titlebar-bg-unfocused': `linear-gradient(180deg,${hs(sm, 22)},${hs(sm, 18)})`,
        '--titlebar-color': hs(50, 90),
        '--titlebar-height': '25px',
        '--btn-close-bg': '#c0392b',
        '--btn-minimize-bg': '#c09000',
        '--btn-maximize-bg': '#3a9a3a',
        '--btn-unfocused-bg': hs(sl, 20),
        '--btn-radius': '4px',
        '--btn-size': '28px',
        '--toolbar-bg': hs(sm, 12),
        '--toolbar-bg-unfocused': hs(sm, 14),
        '--toolbar-border': hs(sl, 6),
        '--toolbar-btn-bg': hs(sm, 18),
        '--toolbar-btn-border': hs(sm, 25),
        '--toolbar-btn-color': hs(40, 85),
        '--toolbar-btn-radius': '6px',
        '--toolbar-address-bg': hs(sl, 5),
        '--toolbar-address-color': hs(40, 85),
        '--toolbar-address-radius': '6px',
        '--sidebar-bg': hs(sm, 9),
        '--sidebar-bg-unfocused': hs(sm, 11),
        '--sidebar-item-color': hs(35, 72),
        '--sidebar-item-hover': hs(sm, 15),
        '--sidebar-item-active': accent,
        '--sidebar-item-active-unfocused': hs(sm, 25),
        '--sidebar-section-color': hs(sm, 30),
        '--panel-bg': hs(sl, 13),
        '--bottombar-bg': hs(sm, 9),
        '--bottombar-border': hs(sl, 6),
        '--taskbar-bg': hs(sl, 5),
        '--taskbar-border': hs(sl, 8),
        '--taskbar-btn-bg': hs(sm, 11),
        '--taskbar-btn-border': hs(sm, 18),
        '--taskbar-btn-color': hs(40, 85),
        '--taskbar-btn-active': accent,
        '--taskbar-newwin-bg': 'hsl(120,40%,10%)',
        '--taskbar-newwin-border': 'hsl(120,40%,18%)',
        '--start-header-bg': `linear-gradient(180deg,${hs(sm, 18)},${hs(sm, 11)})`,
        '--start-bg': hs(sm, 9),
        '--start-footer-bg': hs(sl, 5),
        '--start-section-color': hs(sm, 30),
        '--start-item-color': hs(35, 72),
        '--start-item-hover': hs(sm, 15),
        '--start-search-bg': hs(sl, 5),
        '--start-search-border': hs(sm, 20),
        '--start-footer-btn-bg': hs(sm, 11),
        '--start-footer-btn-border': hs(sm, 18),
        '--start-footer-btn-color': hs(35, 65),
        '--ctx-bg': hs(sm, 9),
        '--ctx-border': hs(sl, 6),
        '--ctx-item-color': hs(35, 72),
        '--ctx-item-hover': hs(sm, 15),
        '--ctx-sep': hs(sm, 18),
        '--font-ui': 'system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial',
        '--font-size-ui': '13px',
    };
}

const CUSTOM_THEME_VARS = [
    '--desktop-bg', '--desktop-text', '--window-bg', '--window-border',
    '--window-shadow', '--window-shadow-focus', '--window-radius',
    '--titlebar-bg', '--titlebar-bg-unfocused', '--titlebar-color', '--titlebar-height',
    '--btn-close-bg', '--btn-minimize-bg', '--btn-maximize-bg', '--btn-unfocused-bg',
    '--btn-radius', '--btn-size',
    '--toolbar-bg', '--toolbar-bg-unfocused', '--toolbar-border',
    '--toolbar-btn-bg', '--toolbar-btn-border', '--toolbar-btn-color', '--toolbar-btn-radius',
    '--toolbar-address-bg', '--toolbar-address-color', '--toolbar-address-radius',
    '--sidebar-bg', '--sidebar-bg-unfocused', '--sidebar-item-color', '--sidebar-item-hover',
    '--sidebar-item-active', '--sidebar-item-active-unfocused', '--sidebar-section-color',
    '--panel-bg', '--bottombar-bg', '--bottombar-border',
    '--taskbar-bg', '--taskbar-border', '--taskbar-btn-bg', '--taskbar-btn-border',
    '--taskbar-btn-color', '--taskbar-btn-active', '--taskbar-newwin-bg', '--taskbar-newwin-border',
    '--start-header-bg', '--start-bg', '--start-footer-bg', '--start-section-color',
    '--start-item-color', '--start-item-hover', '--start-search-bg', '--start-search-border',
    '--start-footer-btn-bg', '--start-footer-btn-border', '--start-footer-btn-color',
    '--ctx-bg', '--ctx-border', '--ctx-item-color', '--ctx-item-hover', '--ctx-sep',
    '--font-ui', '--font-size-ui',
];

function _clearCustomColorVars() {
    CUSTOM_THEME_VARS.forEach(v => document.documentElement.style.removeProperty(v));
}

const THEME_REGISTRY = [
    {
        id: 'dark',
        label: 'Dark',
        wallpaper: '/usr/share/backgrounds/default-wallpaper.jpg',
        lightIcons: true,
        preview: {
            desktop: '#2b2b2b',
            titlebar: 'linear-gradient(#3a3a3a,#242424)',
            toolbar: '#1E1E1E',
            sidebar: '#1E1E1E',
            panel: '#2D2D2D',
            taskbar: '#111',
            btnClose: '#ff5f57',
            btnMin: '#ffbd2e',
            btnRadius: '2px',
        },
    },
    {
        id: 'light',
        label: 'Light',
        wallpaper: '/usr/share/backgrounds/default-wallpaper.jpg',
        lightIcons: false,
        preview: {
            desktop: '#f5f5f5',
            titlebar: 'linear-gradient(#ffffff, #e9e9e9)',
            toolbar: '#ffffff',
            sidebar: '#f7f7f7',
            panel: '#ffffff',
            taskbar: '#eaeaea',

            btnClose: '#ff5f57',
            btnMin: '#ffbd2e',
            btnRadius: '4px',
        },
    },
    {
        id: 'aero2010',
        label: 'Aero 2010',
        wallpaper: '/usr/share/backgrounds/wallpaper-2.jpg',
        lightIcons: false,
        preview: {
            desktop: 'linear-gradient(135deg,#4a6e8a,#3a5a7a)',
            titlebar: 'linear-gradient(#5b9bd5,#2e6db0)',
            toolbar: 'linear-gradient(#e8f0f8,#d0dce8)',
            sidebar: 'linear-gradient(#dce8f4,#c8d8ec)',
            panel: 'linear-gradient(#f8fafe,#f0f4fc)',
            taskbar: 'linear-gradient(#3a6490,#1e3d6a)',
            btnClose: '#ff6b6b',
            btnMin: '#ffd060',
            btnRadius: '50%',
        },
    },
    {
        id: 'aeroglass',
        label: 'Aero Glass',
        wallpaper: '/usr/share/backgrounds/wallpaper-2.jpg',
        lightIcons: false,
        preview: {
            desktop: 'linear-gradient(180deg,#2c6fad,#1a5090)',
            titlebar: 'linear-gradient(180deg,rgba(255,255,255,0.6),rgba(120,185,255,0.25))',
            toolbar: 'rgba(210,232,255,0.82)',
            sidebar: 'rgba(195,222,255,0.72)',
            panel: 'rgba(245,251,255,0.95)',
            taskbar: 'rgba(5,12,28,0.88)',
            btnClose: '#e81123',
            btnMin: 'linear-gradient(180deg,#f0f6ff,#c8ddf0)',
            btnRadius: '3px',
        },
    },
    {
        id: 'nord',
        label: 'Nord',
        wallpaper: '/usr/share/backgrounds/wallpaper-3.jpg',
        lightIcons: true,
        preview: {
            desktop: '#2e3440',
            titlebar: 'linear-gradient(#4c566a,#3b4252)',
            toolbar: '#3b4252',
            sidebar: '#3b4252',
            panel: '#434c5e',
            taskbar: '#2e3440',
            btnClose: '#bf616a',
            btnMin: '#ebcb8b',
            btnRadius: '50%',
        },
    },
    {
        id: 'midnight',
        label: 'Midnight',
        wallpaper: '/usr/share/backgrounds/wallpaper-4.jpg',
        lightIcons: true,
        preview: {
            desktop: '#000',
            titlebar: 'linear-gradient(#1a1a1a,#0d0d0d)',
            toolbar: '#0d0d0d',
            sidebar: '#080808',
            panel: '#111',
            taskbar: '#000',
            btnClose: '#cc3333',
            btnMin: '#cc9900',
            btnRadius: '3px',
        },
    },
    {
        id: 'sunrise',
        label: 'Sunrise',
        wallpaper: '/usr/share/backgrounds/wallpaper-5.jpg',
        lightIcons: true,
        preview: {
            desktop: '#1c1008',
            titlebar: 'linear-gradient(#3a2010,#2a1a08)',
            toolbar: '#2a1e10',
            sidebar: '#221810',
            panel: '#2a2018',
            taskbar: '#160e04',
            btnClose: '#e05030',
            btnMin: '#e0a030',
            btnRadius: '3px',
        },
    },
    {
        id: 'nature',
        label: 'Nature',
        wallpaper: '/usr/share/backgrounds/wallpaper-6.jpg',
        lightIcons: true,
        preview: {
            desktop: '#0d1f0d',
            titlebar: 'linear-gradient(#1a3a1a,#0f2a0f)',
            toolbar: '#162a16',
            sidebar: '#122212',
            panel: '#1a2e1a',
            taskbar: '#091509',
            btnClose: '#c0392b',
            btnMin: '#c09000',
            btnRadius: '4px',
        },
    },
    {
        id: 'custom',
        label: 'Custom',
        wallpaper: null,
        lightIcons: true,
        preview: null, // generated dynamically from edog_custom_color
    },
];
const THEMES = THEME_REGISTRY.map(t => t.id);

let currentTheme = localStorage.getItem('edog_theme') || 'dark';

async function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('edog_theme', theme);

    document.documentElement.classList.remove(...THEMES.map(t => 'theme-' + t));
    _clearCustomColorVars();

    if (theme !== 'dark') {
        document.documentElement.classList.add('theme-' + theme);
    }

    if (theme === 'custom') {
        const hex = localStorage.getItem('edog_custom_color') || '#6366f1';
        const vars = generateCustomVars(hex);
        for (const [prop, val] of Object.entries(vars)) {
            document.documentElement.style.setProperty(prop, val);
        }
    }

    const themeEntry = THEME_REGISTRY.find(t => t.id === theme);
    const wallpaperPath = themeEntry?.wallpaper ?? null;

    shouldIconsBeLight = themeEntry.lightIcons;

    if (wallpaperPath && dbPromise) {
        const cssValue = await imgFromFS(wallpaperPath, { background: true }).catch(() => null);
        if (cssValue) document.body.style.backgroundImage = cssValue;
    } else if (!wallpaperPath) {
        document.body.style.backgroundImage = 'none';
    }
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center center";
    document.body.style.backgroundSize = "cover";
    document.body.style.height = "100vh";
    document.body.style.margin = "0";

    THEMES.forEach(t => {
        const card = document.getElementById('themecard-' + t);
        if (card) card.classList.toggle('selected', t === theme);
    });

    setTimeout(() => {
        const picker = document.getElementById('themePicker');
        if (picker) picker.classList.remove('open');
    }, 300);
}

function toggleThemePicker(ev) {
    ev.stopPropagation();
    const picker = document.getElementById('themePicker');
    const isOpen = picker.classList.toggle('open');
    if (isOpen) {
        setTimeout(() => window.addEventListener('mousedown', closeThemePickerOutside), 0);
    } else {
        window.removeEventListener('mousedown', closeThemePickerOutside);
    }
}

function closeThemePickerOutside(e) {
    const picker = document.getElementById('themePicker');
    const btn = document.querySelector('.theme-picker-btn');
    if (picker && !picker.contains(e.target) && e.target !== btn) {
        picker.classList.remove('open');
        window.removeEventListener('mousedown', closeThemePickerOutside);
    }
}

function updateDateTime() {
    const now = new Date();

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12

    const formatted = `${dayName} ${monthName} ${date}, ${hours}:${minutes} ${ampm}`;

    dateTime.textContent = formatted;
}

updateDateTime();
setInterval(updateDateTime, 1000);

/* expose for inline handlers */
window.saveFile = saveFile;
window.closeEditor = closeEditor;
window.closeEditorIfBackdrop = closeEditorIfBackdrop;
window.closeImageViewer = closeImageViewer;
window.closeVideoPlayer = closeVideoPlayer;
window.spawnWindow = spawnWindow;

window.spawnTerminal = spawnTerminal;
window.renameItem = renameItem;
window.deleteItem = deleteItem;
window.downloadItem = downloadItem;
window.toggleStartMenu = toggleStartMenu;
window.filterStartApps = filterStartApps;
window.startMenuAction = startMenuAction;
window.startOpenFolder = startOpenFolder;
window.applyTheme = applyTheme;
window.toggleThemePicker = toggleThemePicker;
window.reboot = reboot;
window.shutdown = shutdown;
window.waitForIdle = waitForIdle;
window.restoreItem = restoreItem;
window.emptyTrash = emptyTrash;
window.SYSTEM_DESKTOP_ICONS = SYSTEM_DESKTOP_ICONS;
window._setDesktopIconVisibility = _setDesktopIconVisibility;
window._isDesktopIconVisible = _isDesktopIconVisible;
window.showBSOD = showBSOD;

if (useDriveLight) {
    driveLight.style.display = "block";
} else {
    driveLight.style.display = "none";
}

// error handling
window.onerror = function (message, source, lineno, colno, error) {
    console.error("Global Error:", message, source, lineno, colno, error);
    if (!_shuttingDown) spawnError(message);
};

window.onunhandledrejection = function (event) {
    console.error("Unhandled Promise Rejection:", event.reason);
    if (!_shuttingDown) spawnError(event.reason);
};

// window.addEventListener("offline", async (e) => {
//     document.getElementById("wifi-icon").remove();
//     let newIcon = await imgFromFS("/usr/share/icons/tray/network-offline.png");
//     newIcon.title = "Network Disconnected";
//     dateTime.parentNode.insertBefore(newIcon, dateTime);
// });

// window.addEventListener("online", async (e) => {
//     document.getElementById("wifi-icon").remove();
//     let newIcon = await imgFromFS("/usr/share/icons/tray/network-100.png");
//     newIcon.title = "Internet Access";
//     dateTime.parentNode.insertBefore(newIcon, dateTime);
// });
