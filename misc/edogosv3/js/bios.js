/* ============================================================
   bios.js — Updated BIOS with install media detection
   Replace your existing bios.js with this
============================================================ */

const BIOS_VERSION = 'BIOS 1.1';
const INSTALLED_DB = 'VirtualFS_v2';
const LIVE_DB = 'VirtualFS_LIVE';

/* ---- Check if OS is installed ---- */
function checkInstalled() {
    return new Promise((resolve) => {
        const req = indexedDB.open(INSTALLED_DB, 1);
        let existed = true;

        req.onupgradeneeded = (e) => {
            // DB didn't exist or had no store — means no install
            existed = false;
            // Don't create anything — just close and delete
            e.target.transaction.abort();
        };

        req.onsuccess = async () => {
            const db = req.result;
            if (!existed) {
                db.close();
                indexedDB.deleteDatabase(INSTALLED_DB);
                resolve(false);
                return;
            }

            // DB exists — check if it has more than just the root node
            try {
                const tx = db.transaction('nodes', 'readonly');
                const store = tx.objectStore('nodes');
                const countReq = store.count();
                countReq.onsuccess = () => {
                    db.close();
                    // A fresh/empty DB has just 1 node (root).
                    // An installed OS has many more (folders, icons, etc.)
                    resolve(countReq.result > 5);
                };
                countReq.onerror = () => {
                    db.close();
                    resolve(false);
                };
            } catch {
                db.close();
                resolve(false);
            }
        };

        req.onerror = () => resolve(false);
    });
}

/* ---- BIOS POST screen ---- */
function showBiosPost(onComplete) {
    const overlay = document.createElement('div');
    overlay.id = 'biosOverlay';
    overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 999999;
        background: #000; color: #aaa;
        font-family: 'Courier New', monospace;
        font-size: 13px; padding: 24px;
        display: flex; flex-direction: column;
    `;

    const lines = document.createElement('div');
    lines.style.cssText = 'flex:1;overflow:hidden;';
    overlay.appendChild(lines);

    document.body.appendChild(overlay);

    function addLine(text, color = '#aaa', bold = false) {
        const el = document.createElement('div');
        el.style.color = color;
        if (bold) el.style.fontWeight = '700';
        el.textContent = text;
        lines.appendChild(el);
    }

    addLine(BIOS_VERSION, '#fff', true);

    setTimeout(() => onComplete(overlay, addLine), 1200);
}

/* ---- "No OS" screen — insert boot media ---- */
function showNoBootDevice(overlay, addLine) {
    addLine('');
    addLine('No bootable device found.', '#f87171', true);
    addLine('');
    addLine('Insert boot media or restart.', '#888');
    addLine('');

    const prompt = document.createElement('div');
    prompt.style.cssText = `
        position: absolute; bottom: 60px; left: 50%;
        transform: translateX(-50%);
        display: flex; flex-direction: column;
        align-items: center; gap: 16px;
    `;
    prompt.innerHTML = `
        <div style="
            border: 1px solid #333; border-radius: 8px;
            padding: 20px 32px; background: #0a0a0a;
            display: flex; flex-direction: column;
            align-items: center; gap: 12px;
        ">
            <!--
            <div style="color:#888;font-size:12px;font-family:'Courier New',monospace;">
                No operating system found on disk.
            </div>
            -->
            <button id="insertLiveCdBtn" style="
                background: #1a3a5c; color: #7dd3fc;
                border: 1px solid #2a5a8c; border-radius: 4px;
                padding: 10px 28px; font-size: 13px;
                font-family: 'Segoe UI', system-ui, sans-serif;
                cursor: pointer; transition: background 0.15s;
            ">
                Insert E-Dog OS Installation CD
            </button>
            <!--
            <div style="color:#555;font-size:11px;font-family:'Courier New',monospace;">
                Press to insert installation media
            </div>
            -->
        </div>
    `;
    overlay.appendChild(prompt);

    document.getElementById('insertLiveCdBtn').onclick = () => {
        prompt.remove();
        addLine('Booting from CDROM...', '#fff', true);
        addLine('');

        setTimeout(() => {
            overlay.style.transition = 'opacity 0.5s';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                bootLiveSession();
            }, 500);
        }, 800);
    };
}

/* ---- Live session boot ---- */
async function bootLiveSession() {
    // Delete any leftover live DB
    await new Promise(r => {
        const req = indexedDB.deleteDatabase(LIVE_DB);
        req.onsuccess = r;
        req.onerror = r;
        req.onblocked = r;
    });

    // Tell the main script to use the live database
    window.__isLiveSession = true;
    window.__liveDbName = LIVE_DB;

    // Override the DB_NAME before the main script opens it
    // We do this by setting a global that script.js checks
    window.__bootMode = 'live';

    // Now initialize the OS with the live DB
    await initLiveOS();
}

async function initLiveOS() {
    // Open the temporary live database
    const liveDb = await new Promise((resolve, reject) => {
        const r = indexedDB.open(LIVE_DB, 1);
        r.onupgradeneeded = e => {
            const db = e.target.result;
            const store = db.createObjectStore('nodes', { keyPath: 'id' });
            store.createIndex('parentId', 'parentId', { unique: false });
            store.add({
                id: 'root', name: 'root', type: 'folder',
                parentId: null, createdAt: Date.now(), updatedAt: Date.now()
            });
        };
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
    });

    // Swap the global dbPromise to the live DB
    if (typeof dbPromise !== 'undefined' && dbPromise) {
        try { dbPromise.close(); } catch { }
    }
    dbPromise = liveDb;

    // Set up default folder structure for the live session
    await ensureDefaultFolders();

    // Populate the live environment with system files
    // (icons, wallpapers, etc. from the web server)
    await populateLiveMedia();

    // Create the "Install E-Dog OS" shortcut on the desktop
    await createInstallerShortcut();

    // Show a "Live Session" indicator
    showLiveBanner();
    applyTheme('dark');

    // Signal that the OS is ready
    if (window.__onOsReady) {
        window.__onOsReady();
        window.__onOsReady = null;
    }

    // Boot into desktop
    renderDesktop();
    initWiFiIcon();
}

async function populateLiveMedia() {
    // Copy essential system files into the live FS
    // Icons, wallpapers, etc. are fetched from the web server
    // and written into the live IndexedDB

    const essentialFiles = [
        // Add paths to your icon files, wallpapers, etc.
        // These get fetched from the web server and stored in the live FS
        { webPath: 'icons/128/folder.svg', fsPath: '/usr/share/icons/128/folder.svg' },
        { webPath: 'icons/128/folder-home.svg', fsPath: '/usr/share/icons/128/folder-home.svg' },
        { webPath: 'icons/128/folder-desktop.svg', fsPath: '/usr/share/icons/128/folder-desktop.svg' },
        { webPath: 'icons/128/folder-documents.svg', fsPath: '/usr/share/icons/128/folder-documents.svg' },
        { webPath: 'icons/128/folder-downloads.svg', fsPath: '/usr/share/icons/128/folder-downloads.svg' },
        { webPath: 'icons/128/folder-pictures.svg', fsPath: '/usr/share/icons/128/folder-pictures.svg' },
        { webPath: 'icons/128/folder-music.svg', fsPath: '/usr/share/icons/128/folder-music.svg' },
        { webPath: 'icons/128/folder-videos.svg', fsPath: '/usr/share/icons/128/folder-videos.svg' },
        { webPath: 'icons/128/computer.svg', fsPath: '/usr/share/icons/128/computer.svg' },
        { webPath: 'icons/avatar.svg', fsPath: '/usr/share/icons/avatar.svg' },
        { webPath: 'icons/16/dialog-error.png', fsPath: '/usr/share/icons/16/dialog-error.png' },
        { webPath: 'icons/dialog-error.svg', fsPath: '/usr/share/icons/dialog-error.svg' },
        { webPath: 'icons/tray/network-100.png', fsPath: '/usr/share/icons/tray/network-100.png' },
        { webPath: 'icons/tray/network-offline.png', fsPath: '/usr/share/icons/tray/network-offline.png' },
        // Wallpapers
        { webPath: 'backgrounds/default-wallpaper.jpg', fsPath: '/usr/share/backgrounds/default-wallpaper.jpg' },
        { webPath: 'backgrounds/wallpaper-2.jpg', fsPath: '/usr/share/backgrounds/wallpaper-2.jpg' },
    ];

    // Batch fetch with error tolerance
    await Promise.allSettled(essentialFiles.map(async ({ webPath, fsPath }) => {
        try {
            const resp = await fetch(webPath);
            if (!resp.ok) return;
            const buf = await resp.arrayBuffer();
            await createFile(fsPath, buf);
        } catch {
            // Non-critical — icons will fallback to SVG inline
        }
    }));
}

async function createInstallerShortcut() {
    const username = getUsername();
    const desktopPath = `/home/${username}/Desktop`;

    // Create the installer .app file
    const installerConfig = JSON.stringify({
        name: 'Install E-Dog OS',
        customIcon: 'install', // or use a system icon
        icon: '💿',
        width: 640,
        height: 520,
        html: '<!-- placeholder - installer spawns its own window -->'
    });

    // Instead of a .app, we'll create a special marker file
    // that openFile() recognizes
    await createFile(`${desktopPath}/Install E-Dog OS.installer`, installerConfig);

    // Also add a README
    await createFile(`${desktopPath}/README.txt`,
        'Welcome to E-Dog OS Live!\n\n' +
        'You are running a live session. Nothing you do here will be saved.\n\n' +
        'To install E-Dog OS to your hard drive, double-click\n' +
        '"Install E-Dog OS" on the desktop.\n\n' +
        'You can explore the system, try out applications, and\n' +
        'test everything before installing.'
    );
}

function showLiveBanner() {
    const banner = document.createElement('div');
    banner.id = 'live-session-banner';
    banner.style.cssText = `
        position: fixed; top: 0; left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #92400e, #b45309);
        color: #fef3c7; padding: 4px 20px;
        font-size: 11px; font-weight: 600;
        font-family: 'Segoe UI', system-ui, sans-serif;
        border-radius: 0 0 8px 8px;
        z-index: 99999; cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: opacity 0.3s;
        letter-spacing: 0.3px;
    `;
    banner.textContent = 'Install E-Dog OS';
    banner.title = 'Click to install E-Dog OS';
    banner.onclick = () => spawnInstaller();
    document.body.appendChild(banner);
}

/* ---- Live session shutdown (wipes temp DB) ---- */
async function liveShutdown() {
    try {
        if (dbPromise) { dbPromise.close(); dbPromise = null; }
    } catch { }

    await new Promise(r => {
        const req = indexedDB.deleteDatabase(LIVE_DB);
        req.onsuccess = r;
        req.onerror = r;
        req.onblocked = r;
    });
}

/* ---- Installer ---- */
function spawnInstaller() {
    const windowId = 'win_' + (++winCount);
    const left = Math.round((window.innerWidth - 600) / 2);
    const top = Math.round((window.innerHeight - 500) / 2);

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.cssText = `left:${left}px;top:${top}px;width:600px;height:500px;`;
    win.addEventListener('mousedown', () => focusWindow(windowId));

    win.innerHTML = `
        <div class="title-bar">
            <button class="window-close-button" title="Close">✕</button>
            <span class="title-bar-text">💿 Install E-Dog OS</span>
        </div>
        <div class="app-body" id="installer-body-${windowId}"
             style="height:calc(100% - var(--titlebar-height));
                    overflow:hidden;display:flex;flex-direction:column;">
        </div>
    `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'installer' } };

    win.querySelector('.title-bar').addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.textContent = '💿 Install E-Dog OS';
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; }
        focusWindow(windowId);
    };
    document.getElementById('taskbar').insertBefore(
        tbBtn, document.getElementById('taskbar-tray')
    );
    windows[windowId].taskbarBtn = tbBtn;
    focusWindow(windowId);

    const body = win.querySelector(`#installer-body-${windowId}`);
    runInstallerWizard(body, windowId);
}

async function runInstallerWizard(body, windowId) {
    let step = 0;
    let config = {
        username: 'user',
        computername: 'edog-pc',
        password: '',
        theme: 'dark',
    };

    function render() {
        body.innerHTML = '';

        const container = document.createElement('div');
        container.style.cssText = `
            flex:1; display:flex; flex-direction:column;
            font-family:'Segoe UI',system-ui,sans-serif;
            background:#1a1a1a; color:#ddd;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding:20px 28px 16px; border-bottom:1px solid #333;
            display:flex; align-items:center; gap:14px;
        `;
        header.innerHTML = `
            <div style="font-size:28px;">💿</div>
            <div>
                <div style="font-size:16px;font-weight:600;color:#fff;">
                    Install E-Dog OS
                </div>
                <div style="font-size:12px;color:#888;">
                    Step ${step + 1} of 4
                </div>
            </div>
        `;
        container.appendChild(header);

        // Step progress
        const progress = document.createElement('div');
        progress.style.cssText = `
            display:flex; gap:0; padding:0 28px; background:#141414;
            border-bottom:1px solid #333;
        `;
        const steps = ['Welcome', 'User Setup', 'Options', 'Install'];
        steps.forEach((s, i) => {
            const stepEl = document.createElement('div');
            stepEl.style.cssText = `
                flex:1; padding:8px 0; text-align:center;
                font-size:11px; font-weight:600; letter-spacing:0.3px;
                border-bottom:2px solid ${i === step ? '#3b82f6' : 'transparent'};
                color:${i === step ? '#60a5fa' : i < step ? '#4ade80' : '#555'};
                transition: all 0.2s;
            `;
            stepEl.textContent = (i < step ? '✓ ' : '') + s;
            progress.appendChild(stepEl);
        });
        container.appendChild(progress);

        // Content area
        const content = document.createElement('div');
        content.style.cssText = 'flex:1;padding:24px 28px;overflow-y:auto;';
        container.appendChild(content);

        // Footer with nav buttons
        const footer = document.createElement('div');
        footer.style.cssText = `
            padding:14px 28px; border-top:1px solid #333;
            display:flex; justify-content:space-between;
            background:#141414;
        `;
        container.appendChild(footer);

        // Render current step
        if (step === 0) renderWelcome(content, footer);
        else if (step === 1) renderUserSetup(content, footer);
        else if (step === 2) renderOptions(content, footer);
        else if (step === 3) renderInstall(content, footer);

        body.appendChild(container);
    }

    function makeBtn(text, primary, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = `
            padding:8px 24px; border-radius:5px; font-size:13px;
            cursor:pointer; font-weight:500; border:1px solid;
            font-family:'Segoe UI',system-ui,sans-serif;
            ${primary
                ? 'background:#2563eb;color:#fff;border-color:#3b82f6;'
                : 'background:#2a2a2a;color:#ccc;border-color:#444;'}
        `;
        btn.onmouseover = () => btn.style.opacity = '0.85';
        btn.onmouseout = () => btn.style.opacity = '1';
        btn.onclick = onClick;
        return btn;
    }

    function renderWelcome(content, footer) {
        content.innerHTML = `
            <div style="text-align:center;padding:20px 0;">
                <div style="font-size:22px;font-weight:600;color:#fff;margin-bottom:8px;">
                    Welcome to E-Dog OS
                </div>
                <div style="color:#888;font-size:13px;line-height:1.6;max-width:400px;margin:0 auto;">
                    This wizard will install E-Dog OS on your virtual hard drive.
                    <br><br>
                    Your current live session will not be affected until
                    installation is complete and you reboot.
                    <br><br>
                    <span style="color:#666;font-size:12px;">
                        Estimated install time: ~10 seconds
                    </span>
                </div>
            </div>
        `;
        footer.innerHTML = '';
        footer.appendChild(makeBtn('Cancel', false, () => closeWindow(windowId)));
        footer.appendChild(makeBtn('Begin Installation →', true, () => { step = 1; render(); }));
    }

    function renderUserSetup(content, footer) {
        content.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:18px;">
                <div style="font-size:15px;font-weight:600;color:#fff;">
                    Create Your Account
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    <label style="font-size:12px;color:#888;">Username</label>
                    <input id="inst-username" type="text" value="${config.username}"
                        style="background:#111;border:1px solid #333;border-radius:4px;
                               padding:8px 12px;color:#fff;font-size:13px;outline:none;"
                        placeholder="e.g. user">
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    <label style="font-size:12px;color:#888;">Computer Name</label>
                    <input id="inst-hostname" type="text" value="${config.computername}"
                        style="background:#111;border:1px solid #333;border-radius:4px;
                               padding:8px 12px;color:#fff;font-size:13px;outline:none;"
                        placeholder="e.g. my-pc">
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    <label style="font-size:12px;color:#888;">Password (optional)</label>
                    <input id="inst-password" type="password" value="${config.password}"
                        style="background:#111;border:1px solid #333;border-radius:4px;
                               padding:8px 12px;color:#fff;font-size:13px;outline:none;"
                        placeholder="Leave blank for no password">
                </div>
            </div>
        `;

        footer.innerHTML = '';
        footer.appendChild(makeBtn('← Back', false, () => { step = 0; render(); }));
        footer.appendChild(makeBtn('Next →', true, () => {
            config.username = document.getElementById('inst-username').value.trim() || 'user';
            config.computername = document.getElementById('inst-hostname').value.trim() || 'edog-pc';
            config.password = document.getElementById('inst-password').value;
            step = 2;
            render();
        }));
    }

    function renderOptions(content, footer) {
        content.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:18px;">
                <div style="font-size:15px;font-weight:600;color:#fff;">
                    Choose Your Theme
                </div>
                <div style="display:flex;gap:16px;">
                    <div class="inst-theme-card" data-theme="dark" style="
                        flex:1;padding:16px;border-radius:8px;cursor:pointer;
                        border:2px solid ${config.theme === 'dark' ? '#3b82f6' : '#333'};
                        background:#0a0a0a;text-align:center;transition:border 0.15s;
                    ">
                        <div style="font-size:28px;margin-bottom:8px;">🌙</div>
                        <div style="font-size:13px;font-weight:600;color:#fff;">Dark</div>
                        <div style="font-size:11px;color:#888;">Sleek dark interface</div>
                    </div>
                    <div class="inst-theme-card" data-theme="aero2010" style="
                        flex:1;padding:16px;border-radius:8px;cursor:pointer;
                        border:2px solid ${config.theme === 'aero2010' ? '#3b82f6' : '#333'};
                        background:#0a0a0a;text-align:center;transition:border 0.15s;
                    ">
                        <div style="font-size:28px;margin-bottom:8px;">✨</div>
                        <div style="font-size:13px;font-weight:600;color:#fff;">Aero 2010</div>
                        <div style="font-size:11px;color:#888;">Glossy glass effects</div>
                    </div>
                </div>
                <div style="margin-top:12px;padding:16px;background:#111;border-radius:8px;
                            border:1px solid #222;">
                    <div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:8px;">
                        Installation Summary
                    </div>
                    <div style="font-size:12px;color:#888;line-height:1.8;">
                        User: <span style="color:#ccc;">${config.username}</span><br>
                        Computer: <span style="color:#ccc;">${config.computername}</span><br>
                        Password: <span style="color:#ccc;">${config.password ? '••••••' : 'None'}</span><br>
                        Target: <span style="color:#ccc;">VirtualFS (IndexedDB) — 10 GB</span>
                    </div>
                </div>
            </div>
        `;

        content.querySelectorAll('.inst-theme-card').forEach(card => {
            card.onclick = () => {
                config.theme = card.dataset.theme;
                content.querySelectorAll('.inst-theme-card').forEach(c =>
                    c.style.borderColor = c.dataset.theme === config.theme ? '#3b82f6' : '#333'
                );
            };
        });

        footer.innerHTML = '';
        footer.appendChild(makeBtn('← Back', false, () => { step = 1; render(); }));
        footer.appendChild(makeBtn('Install Now', true, () => { step = 3; render(); }));
    }

    async function renderInstall(content, footer) {
        footer.innerHTML = '';
        const cancelBtn = makeBtn('Cancel', false, () => closeWindow(windowId));
        cancelBtn.id = 'inst-cancel';
        footer.appendChild(cancelBtn);

        content.innerHTML = `
            <div style="text-align:center;padding:10px 0;">
                <div id="inst-spinner" style="
                    width:40px;height:40px;margin:0 auto 16px;
                    border:3px solid rgba(255,255,255,0.1);
                    border-top-color:#3b82f6;border-radius:50%;
                    animation:_sdSpin 0.8s linear infinite;
                "></div>
                <div id="inst-heading" style="font-size:16px;font-weight:600;color:#fff;margin-bottom:6px;">
                    Installing E-Dog OS...
                </div>
                <div id="inst-status" style="font-size:12px;color:#888;margin-bottom:20px;">
                    Preparing disk...
                </div>
                <div style="width:100%;max-width:400px;margin:0 auto;height:6px;
                            background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">
                    <div id="inst-progress" style="
                        width:0%;height:100%;background:#3b82f6;
                        border-radius:3px;transition:width 0.3s ease;
                    "></div>
                </div>
                <div id="inst-detail" style="font-size:11px;color:#555;margin-top:8px;"></div>
            </div>
            <div id="inst-log" style="
                margin-top:20px; background:#0a0a0a;
                border:1px solid #222; border-radius:6px;
                padding:10px 12px; font-family:'Courier New',monospace;
                font-size:11px; color:#4ade80;
                max-height:150px; overflow-y:auto;
            "></div>
        `;

        const progress = document.getElementById('inst-progress');
        const status = document.getElementById('inst-status');
        const detail = document.getElementById('inst-detail');
        const log = document.getElementById('inst-log');
        const heading = document.getElementById('inst-heading');
        const spinner = document.getElementById('inst-spinner');

        function setProgress(pct) { progress.style.width = pct + '%'; }
        function setStatus(text) { status.textContent = text; }
        function setDetail(text) { detail.textContent = text; }
        function addLog(text) {
            const line = document.createElement('div');
            line.textContent = text;
            log.appendChild(line);
            log.scrollTop = log.scrollHeight;
        }

        // install
        try {
            setStatus('Fetching system package...');
            setProgress(5);
            addLog('Downloading setup.zip...');

            let zip;
            try {
                const resp = await fetch('setup/setup.zip');
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                setProgress(20);
                const buf = await resp.arrayBuffer();
                setProgress(30);
                addLog('Unpacking archive...');
                zip = await JSZip.loadAsync(buf);
            } catch (fetchErr) {
                addLog('setup.zip not available: ' + fetchErr.message);
                addLog('Using fallback install...');
                zip = null;
            }

            setStatus('Creating filesystem...');
            setProgress(35);
            addLog(`Creating VirtualFS_v2 for user "${config.username}"...`);

            if (zip) {
                // Use setup.js's extractor — handles icons, wallpapers, etc.
                await extractZipToIDB(zip, config.username, (pct, msg) => {
                    setProgress(35 + pct * 0.5);
                    setDetail(msg);
                    addLog(msg);
                });
            } else {
                await fallbackInstall(config.username);
            }

            setProgress(88);
            addLog('Filesystem populated.');

            // Save user config to localStorage
            setStatus('Configuring system...');
            addLog(`Setting username: ${config.username}`);
            addLog(`Setting hostname: ${config.computername}`);
            addLog(`Setting theme: ${config.theme}`);

            localStorage.setItem('edog_username', config.username);
            localStorage.setItem('edog_computername', config.computername);
            localStorage.setItem('edog_theme', config.theme);
            if (config.password) {
                localStorage.setItem('edog_password', config.password);
            } else {
                localStorage.removeItem('edog_password');
            }
            localStorage.setItem('edog_setup_done', 'true');
            if (window.__setupVersion !== undefined) {
                localStorage.setItem('edog_setup_version', window.__setupVersion);
            }

            setProgress(95);
            await new Promise(r => setTimeout(r, 300));

            setProgress(100);
            addLog('Installation complete!');
            await new Promise(r => setTimeout(r, 400));

            // Show success
            spinner.style.display = 'none';
            heading.textContent = 'Installation Complete!';
            heading.style.color = '#4ade80';
            status.textContent = 'E-Dog OS has been installed to your hard drive.';
            detail.textContent = '';

            const cancelEl = document.getElementById('inst-cancel');
            if (cancelEl) cancelEl.style.display = 'none';

            const rebootBtn = makeBtn('Reboot Now', true, async () => {
                await liveShutdown();
                location.reload();
            });
            footer.appendChild(rebootBtn);

            addLog('');
            addLog('Ready to reboot. Remove installation media and restart.');
        } catch (err) {
            spinner.style.display = 'none';
            heading.textContent = 'Installation Failed';
            heading.style.color = '#f87171';
            status.textContent = err.message;
            addLog('ERROR: ' + err.message);

            footer.appendChild(makeBtn('Close', false, () => closeWindow(windowId)));
        }
    }

    render();
}

/* ---- Wire into the boot sequence ---- */
window.__bootAndLogin = async function (onReady) {
    const isInstalled = await checkInstalled();

    if (!isInstalled) {
        // No OS installed — show BIOS, prompt for live CD
        showBiosPost((overlay, addLine) => {
            showNoBootDevice(overlay, addLine);
        });
        // onReady will be called after installation + reboot
        // In live mode, we call it ourselves after initLiveOS
        window.__onOsReady = onReady;
    } else {
        // OS is installed — normal boot
        runBootSequence(() => {
            window.__setupComplete.then(result => {
                if (result && result.freshInstall) return;
                showLoginScreen(onReady);
            });
        });
    }
};