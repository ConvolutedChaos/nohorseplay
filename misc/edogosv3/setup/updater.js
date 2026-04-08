
const SETUP_VERSION = 16;
window.__setupVersion = SETUP_VERSION;

// window.__updateComplete = (async function () {

//     // Only run updates for users who completed a real installation.
//     // Without this, clearing cookies triggers the updater during a
//     // live session, silently populating VirtualFS_v2 behind the scenes.
//     if (!localStorage.getItem('edog_setup_done')) return;

//     // Check if already up-to-date
//     const stored = localStorage.getItem('edog_setup_version');
//     if (stored !== null && Number(stored) === SETUP_VERSION) return;

//     // Wait for setup wizard (if running). If this was a fresh install,
//     // setup.js already populated the DB — skip the update.
//     const setupResult = await (window.__setupComplete ?? Promise.resolve({ freshInstall: false }));
//     if (setupResult && setupResult.freshInstall) return;

//     // Old or outdated install — run the update.
//     await _runUpdate();

// })();

window.__updateComplete = (async function () {

    // Check if already up-to-date
    const stored = localStorage.getItem('edog_setup_version');
    if (stored !== null && Number(stored) === SETUP_VERSION) return;

    // Wait for setup wizard (if running). If this was a fresh install,
    // setup.js already populated the DB — skip the update.
    const setupResult = await (window.__setupComplete ?? Promise.resolve({ freshInstall: false }));
    if (setupResult && setupResult.freshInstall) return;

    // Old or outdated install — run the update.
    await _runUpdate();

})();


/* ---- Update runner ---------------------------------------- */

async function _runUpdate() {
    const overlay = _buildUpdateOverlay();
    document.body.appendChild(overlay);

    function setProgress(pct, msg) {
        const bar = overlay.querySelector('#upd-bar');
        const pctEl = overlay.querySelector('#upd-pct');
        const status = overlay.querySelector('#upd-status');
        if (bar) bar.style.width = pct + '%';
        if (pctEl) pctEl.textContent = Math.round(pct) + '%';
        if (msg && status) status.textContent = msg;
    }

    try {
        setProgress(5, 'Fetching system package…');
        const resp = await fetch('setup/setup.zip');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        setProgress(20, 'Downloading…');
        const buf = await resp.arrayBuffer();
        setProgress(35, 'Unpacking…');
        const zip = await JSZip.loadAsync(buf);

        setProgress(40, 'Patching system files…');
        await _patchSystemFiles(zip, (pct, msg) =>
            setProgress(40 + pct * 0.55, msg)
        );

        localStorage.setItem('edog_setup_version', SETUP_VERSION);
        setProgress(100, 'Update complete.');
        await _sleep(600);

    } catch (err) {
        console.error('[Updater] Update failed:', err);
        const status = overlay.querySelector('#upd-status');
        if (status) status.textContent = 'Update failed — continuing anyway.';
        await _sleep(1500);
    }

    overlay.remove();
}


/* ---- Patch: write all non-home/ entries from ZIP into IDB -- */

async function _patchSystemFiles(zip, onProgress) {
    const { db } = await openSetupDB();       // defined in setup.js
    const username = localStorage.getItem('edog_username') || 'user';
    const PLACEHOLDER = 'edogos';

    function put(obj) {
        return new Promise((res, rej) => {
            const req = db.transaction('nodes', 'readwrite').objectStore('nodes').put(obj);
            req.onsuccess = () => res();
            req.onerror = (e) => rej(e.target.error);
        });
    }

    function getChildren(parentId) {
        return new Promise((res, rej) => {
            const req = db.transaction('nodes', 'readonly').objectStore('nodes')
                .index('parentId').getAll(parentId);
            req.onsuccess = (e) => res(e.target.result);
            req.onerror = (e) => rej(e.target.error);
        });
    }

    async function findChild(name, parentId) {
        const children = await getChildren(parentId);
        return children.find(n => n.name === name) || null;
    }

    // Prime the root-level path cache
    const pathToId = { '': 'root' };
    for (const n of await getChildren('root')) pathToId[n.name] = n.id;

    async function ensurePath(parts) {
        for (let i = 1; i <= parts.length; i++) {
            const cur = parts.slice(0, i).join('/');
            if (pathToId[cur] !== undefined) continue;
            const parent = parts.slice(0, i - 1).join('/');
            const parentId = pathToId[parent] ?? 'root';
            const name = parts[i - 1];
            const exists = await findChild(name, parentId);
            if (exists) { pathToId[cur] = exists.id; continue; }
            const id = crypto.randomUUID();
            await put({
                id, name, type: 'folder', parentId,
                createdAt: Date.now(), updatedAt: Date.now()
            });
            pathToId[cur] = id;
        }
    }

    const allEntries = Object.values(zip.files).sort((a, b) => {
        const aD = a.name.split('/').length + (a.dir ? 0 : 100);
        const bD = b.name.split('/').length + (b.dir ? 0 : 100);
        return aD - bD;
    });
    const total = allEntries.length;

    for (let i = 0; i < allEntries.length; i++) {
        const entry = allEntries[i];
        let rawPath = entry.name.replace(new RegExp(PLACEHOLDER, 'g'), username);
        if (rawPath.endsWith('/')) rawPath = rawPath.slice(0, -1);
        if (!rawPath) continue;

        // Never touch the user's home directory
        if (rawPath === 'home' || rawPath.startsWith('home/')) continue;

        const parts = rawPath.split('/');
        const entryName = parts[parts.length - 1];

        await ensurePath(parts.slice(0, -1));
        const parentPath = parts.slice(0, -1).join('/');
        const parentId = pathToId[parentPath] ?? 'root';

        if (entry.dir || entry.name.endsWith('/')) {
            const exists = await findChild(entryName, parentId);
            if (!exists) {
                const id = crypto.randomUUID();
                await put({
                    id, name: entryName, type: 'folder', parentId,
                    createdAt: Date.now(), updatedAt: Date.now()
                });
                pathToId[rawPath] = id;
            } else {
                pathToId[rawPath] = exists.id;
            }
        } else {
            // Reuse existing node ID so existing references stay intact
            const exists = await findChild(entryName, parentId);
            const id = exists?.id ?? crypto.randomUUID();
            const content = await entry.async('arraybuffer');
            await put({
                id, name: entryName, type: 'file', parentId,
                content, size: content.byteLength,
                mime: guessMime(entryName),      // defined in setup.js
                createdAt: exists?.createdAt ?? Date.now(),
                updatedAt: Date.now(),
            });
        }

        if (i % 5 === 0 && onProgress) {
            onProgress((i / total) * 100, `Updating… (${i + 1} / ${total})`);
        }
    }

    db.close();
}


/* ---- Overlay builder -------------------------------------- */

function _buildUpdateOverlay() {
    const el = document.createElement('div');
    el.style.cssText = `
        position: fixed; inset: 0; z-index: 999998;
        background: #0d0d0d;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        font-family: 'Segoe UI', system-ui, sans-serif;
        gap: 10px;
    `;
    el.innerHTML = `
        <div style="font-size:20px;font-weight:500;color:#fff;">Updating E-Dog OS…</div>
        <div id="upd-status" style="color:#888;font-size:13px;">Preparing…</div>
        <div style="width:280px;height:4px;background:#1e1e1e;border-radius:2px;overflow:hidden;margin-top:8px;">
            <div id="upd-bar" style="height:100%;width:0%;background:#60a5fa;border-radius:2px;transition:width .2s;"></div>
        </div>
        <div id="upd-pct" style="font-size:12px;color:#555;">0%</div>
    `;
    return el;
}


/* ---- Tiny helper ------------------------------------------ */

function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
