/* ============================================================
   IndexedDB helpers
============================================================ */
const VERSION = "E-Dog OS 3.0.4";
const DB_NAME = 'VirtualFS_v2';
const STORE = 'nodes';
let dbPromise;

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
    return new Promise((res, rej) => {
        const req = dbPromise.transaction(STORE, 'readonly').objectStore(STORE).get(key);
        req.onsuccess = e => res(e.target.result);
        req.onerror = e => rej(e.target.error);
    });
}
function idbGetAll() {
    return new Promise((res, rej) => {
        const req = dbPromise.transaction(STORE, 'readonly').objectStore(STORE).getAll();
        req.onsuccess = e => res(e.target.result);
        req.onerror = e => rej(e.target.error);
    });
}
function idbGetAllByIndex(indexName, value) {
    return new Promise((res, rej) => {
        const store = dbPromise.transaction(STORE, 'readonly').objectStore(STORE);
        const idx = store.index(indexName);
        const r = idx.getAll(value);
        r.onsuccess = e => res(e.target.result);
        r.onerror = e => rej(e.target.error);
    });
}
function idbAdd(obj) {
    return new Promise((res, rej) => {
        const req = dbPromise.transaction(STORE, 'readwrite').objectStore(STORE).add(obj);
        req.onsuccess = () => res();
        req.onerror = e => rej(e.target.error);
    });
}
function idbPut(obj) {
    return new Promise((res, rej) => {
        const req = dbPromise.transaction(STORE, 'readwrite').objectStore(STORE).put(obj);
        req.onsuccess = () => res();
        req.onerror = e => rej(e.target.error);
    });
}
function idbDelete(key) {
    return new Promise((res, rej) => {
        const req = dbPromise.transaction(STORE, 'readwrite').objectStore(STORE).delete(key);
        req.onsuccess = () => res();
        req.onerror = e => rej(e.target.error);
    });
}

/* ============================================================
   System helpers
============================================================ */

function reboot() {
    location.reload();
}

function shutdown() {
    document.body.innerHTML = `<h1 style="text-align:center;">It is now safe to close the tab.</h1>`;
    document.body.style.backgroundColor = "#000000";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
        'mp4': ['video-x-generic.svg', 'video-x-generic.png'],
        'avi': ['video-x-generic.svg', 'video-x-generic.png'],
        'mov': ['video-x-generic.svg', 'video-x-generic.png'],
        'mkv': ['video-x-generic.svg', 'video-x-generic.png'],
        'exe': ['application-x-ms-dos-executable.svg', 'application-x-ms-dos-executable.png'],
        'html': ['html-x-generic.svg', 'html-x-generic.png'],
        'htm': ['html-x-generic.svg', 'html-x-generic.png'],
        'css': ['css-x-generic.svg', 'css-x-generic.png'],
        'js': ['application-javascript.svg', 'application-javascript.svg'],
        'json': ['script-x-generic.svg', 'script-x-generic.png'],
        'xml': ['text-x-generic.svg', 'text-x-generic.png'],
        'log': ['text-x-generic.svg', 'text-x-generic.png']
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

function getSpecialFolderIcon(name) {
    const meta = getFolderIconMap()[name];
    if (!meta) return null;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:var(--img-size);height:var(--img-size);display:flex;align-items:center;justify-content:center;';

    const img = document.createElement('img');
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
    img.src = `./icons/128/folder-${meta.slug}.svg`;
    img.onerror = () => {
        img.remove();
        const fb = document.createElement('div');
        fb.style.cssText = `width:70%;height:70%;display:flex;align-items:center;justify-content:center;color:${meta.color};`;
        const svgData = SVG_ICONS[meta.slug] || SVG_ICONS.folder;
        fb.innerHTML = svgData;
        const svgEl = fb.querySelector('svg');
        if (svgEl) { svgEl.style.width = '100%'; svgEl.style.height = '100%'; }
        wrapper.appendChild(fb);
    };
    wrapper.appendChild(img);
    return wrapper;
}

function getSidebarItemHTML(slug, label, color) {
    return `<img class="sidebar-icon" src="./icons/16/folder-${slug}.svg"
                        data-fallback-svg="${slug}" data-fallback-color="${color || '#94a3b8'}"
                        width="16" height="16" style="flex-shrink:0;">
                    <span>${label}</span>`;
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
   Window creation
============================================================ */
let winCount = 0;

function spawnWindow(initialFolderId = null) {
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
    };
    windows[windowId] = { el: null, state };

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.left = left + 'px';
    win.style.top = top + 'px';

    win.addEventListener('mousedown', () => focusWindow(windowId));

    win.innerHTML = `
            <div class="title-bar" data-winid="${windowId}">
                <button class="window-close-button" title="Close">✕</button>
                <button class="window-minimize-button" title="Minimize">—</button>
                <span class="title-bar-text">File Explorer</span>
            </div>

            <div class="toolbar">
                <button class="btn-back" title="Back">⬅</button>
                <button class="btn-forward" title="Forward">➡</button>
                <button class="btn-up" title="Up">⬆</button>
                <div class="address">/ </div>
                <button class="small-btn btn-new-folder">+ Folder</button>
                <button class="small-btn btn-new-file">+ File</button>
                <button class="small-btn btn-upload">Upload</button>
                <input type="file" class="file-input" style="display:none" multiple>
            </div>

            <div class="content">
                <div class="sidebar">
                    <div class="sidebar-section">Places</div>
                    <ul class="favorites-list">
                        <li data-path="${homePath}" data-name="${username}">${getSidebarItemHTML('home', 'Home', '#5ba4ff')}</li>
                        <li data-path="${homePath}/Desktop" data-name="Desktop">${getSidebarItemHTML('desktop', 'Desktop', '#7dd3fc')}</li>
                        <li data-path="${homePath}/Documents" data-name="Documents">${getSidebarItemHTML('documents', 'Documents', '#93c5fd')}</li>
                        <li data-path="${homePath}/Downloads" data-name="Downloads">${getSidebarItemHTML('downloads', 'Downloads', '#6ee7b7')}</li>
                        <li data-path="${homePath}/Pictures" data-name="Pictures">${getSidebarItemHTML('pictures', 'Pictures', '#f9a8d4')}</li>
                        <li data-path="${homePath}/Music" data-name="Music">${getSidebarItemHTML('music', 'Music', '#c4b5fd')}</li>
                        <li data-path="${homePath}/Videos" data-name="Videos">${getSidebarItemHTML('videos', 'Videos', '#fcd34d')}</li>
                    </ul>
                    <div class="sidebar-section">System</div>
                    <ul class="favorites-list">
                        <li data-path="/" data-name="root">${getSidebarItemHTML('root', 'File System', '#94a3b8')}</li>
                        <li data-path="/home" data-name="home">${getSidebarItemHTML('users', 'Users', '#86efac')}</li>
                        <li data-path="/tmp" data-name="tmp">${getSidebarItemHTML('trash', 'Recycle Bin', '#f87171')}</li>
                    </ul>
                </div>
                <div class="main-panel"></div>
            </div>

            <div class="bottom-toolbar">
                <input type="range" min="60" max="160" value="100" class="zoom-slider">
                <span class="file-count">0 items</span>, <span class="free-space">Free space: …</span>
            </div>
            `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId].el = win;

    const titleBar = win.querySelector('.title-bar');
    titleBar.addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });

    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);

    win.querySelector('.btn-back').onclick = () => goBack(windowId);
    win.querySelector('.btn-forward').onclick = () => goForward(windowId);
    win.querySelector('.btn-up').onclick = () => goUp(windowId);
    win.querySelector('.btn-new-folder').onclick = () => createFolder(windowId);
    win.querySelector('.btn-new-file').onclick = () => createFile(windowId);

    const uploadBtn = win.querySelector('.btn-upload');
    const fileInput = win.querySelector('.file-input');
    uploadBtn.onclick = () => { fileInput.value = ''; fileInput.click(); };
    fileInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
            const content = await file.arrayBuffer();
            await idbAdd({
                id: crypto.randomUUID(),
                name: file.name, type: 'file',
                parentId: state.currentFolderId,
                content, size: file.size, mime: file.type,
                createdAt: Date.now(), updatedAt: Date.now()
            });
        }
        await renderWindow(windowId);
    };

    const zoomSlider = win.querySelector('.zoom-slider');
    zoomSlider.oninput = () => updateZoom(zoomSlider.value);

    win.querySelectorAll('.favorites-list li').forEach(li => {
        li.onclick = () => navigateToPath(windowId, li.dataset.path);
    });
    wireUpSidebarIcons(win.querySelector('.sidebar'));

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.textContent = '🗂 File Explorer ' + winCount;
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
    taskbar.insertBefore(tbBtn, taskbar.querySelector('#date-time'));



    windows[windowId].taskbarBtn = tbBtn;

    if (initialFolderId) {
        navigate(windowId, initialFolderId);
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
    };
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
}

function onDrag(e) {
    if (!dragState) return;
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
}

function stopDrag() {
    dragState = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
}

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
    const cnode = await idbGet(state.currentFolderId);
    if (cnode && cnode.parentId) {
        await navigate(windowId, cnode.parentId);
    } else {
        await navigate(windowId, 'root');
    }
}

/* ============================================================
   Rendering (per-window)
============================================================ */
async function renderWindow(windowId) {
    const winObj = windows[windowId];
    if (!winObj) return;
    const { el, state } = winObj;

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
    el.querySelector('.title-bar-text').textContent = 'File Explorer — ' + pathStr;

    state.selectedItemId = null;

    const list = await idbGetAllByIndex('parentId', state.currentFolderId);
    const mainPanel = el.querySelector('.main-panel');
    mainPanel.innerHTML = '';
    list.sort((a, b) => (a.type === b.type) ? a.name.localeCompare(b.name) : (a.type === 'folder' ? -1 : 1));

    for (const item of list) {
        const tile = document.createElement('div');
        tile.className = 'item';
        tile.dataset.id = item.id;
        tile.title = item.name;

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'height:calc(var(--img-size));display:flex;align-items:center;justify-content:center;';

        if (item.type === 'folder') {
            const specialSVG = getSpecialFolderIcon(item.name);
            if (specialSVG) {
                wrapper.appendChild(specialSVG);
            } else {
                const img = document.createElement('img');
                img.className = 'icon-img';
                const fallback = document.createElement('div');
                fallback.className = 'iconFallback';
                fallback.textContent = '📁';
                const candidates = getIconCandidates(item);
                img.onerror = () => {
                    if (candidates.length) img.src = './icons/128/' + candidates.shift();
                    else { img.remove(); fallback.style.display = 'block'; }
                };
                if (candidates.length) img.src = './icons/128/' + candidates.shift();
                else fallback.style.display = 'block';
                wrapper.appendChild(img);
                wrapper.appendChild(fallback);
            }
        } else {
            const img = document.createElement('img');
            img.className = 'icon-img';
            const fallback = document.createElement('div');
            fallback.className = 'iconFallback';
            fallback.textContent = '📄';
            const candidates = getIconCandidates(item);
            img.onerror = () => {
                if (candidates.length) img.src = './icons/128/' + candidates.shift();
                else { img.remove(); fallback.style.display = 'block'; }
            };
            if (candidates.length) img.src = './icons/128/' + candidates.shift();
            else fallback.style.display = 'block';
            wrapper.appendChild(img);
            wrapper.appendChild(fallback);
        }
        tile.appendChild(wrapper);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        nameDiv.textContent = item.name;
        tile.appendChild(nameDiv);

        tile.onmousedown = (ev) => {
            if (ev.button === 0) {
                mainPanel.querySelectorAll('.item').forEach(e => e.classList.remove('selected'));
                tile.classList.add('selected');
                state.selectedItemId = item.id;
                mainPanel.focus({ preventScroll: true });
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
        mainPanel.appendChild(tile);
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
        }
    };

    mainPanel.setAttribute('tabindex', '-1');
    mainPanel.addEventListener('keydown', (ev) => {
        if (ev.key === 'F2' && state.selectedItemId) {
            ev.preventDefault();
            renameItem(state.selectedItemId, windowId);
        }
    });

    updateStorageInfo(el, list.length, state.currentFolderId);
    renderDesktop();
}

async function updateStorageInfo(winEl, listLength, currentFolderId) {
    winEl.querySelector('.file-count').textContent = listLength + ' items';
    if (!navigator.storage?.estimate) {
        winEl.querySelector('.free-space').textContent = 'Free space: unknown';
        return;
    }
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    const free = Math.max(0, quota - usage);
    winEl.querySelector('.free-space').textContent = 'Free space: ' + formatBytes(free);
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

async function createFolder(windowId) {
    const state = windows[windowId]?.state;
    if (!state) return;
    await createItemInline('folder', state.currentFolderId, windowId);
}

async function createFile(windowId) {
    const state = windows[windowId]?.state;
    if (!state) return;
    await createItemInline('file', state.currentFolderId, windowId);
}

async function renderAllWindows() {
    for (const id of Object.keys(windows)) {
        await renderWindow(id);
    }
}

/* ============================================================
   App window factory
============================================================ */
const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'ico']);
const VIDEO_EXTS = new Set(['mp4', 'webm', 'ogg', 'ogv', 'mov', 'avi', 'mkv']);
const HTML_EXTS = new Set(['html', 'htm']);
const ZIP_EXTS = new Set(['zip', 'jar', 'war', 'apk', 'epub', 'cbz']);
function getExt(name) { return (name.split('.').pop() || '').toLowerCase(); }

function spawnApp(type, item) {
    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 30;
    const left = Math.min(60 + offset, window.innerWidth - 720);
    const top = Math.min(60 + offset, window.innerHeight - 540);

    const appMeta = {
        editor: { title: `Text Editor — ${item.name || "blank"}`, icon: '📝', w: 700, h: 520 },
        image: { title: `Image Viewer — ${item.name || "blank"}`, icon: '🖼️', w: 700, h: 520 },
        video: { title: `Video Player — ${item.name || "blank"}`, icon: '🎬', w: 760, h: 520 },
        zip: { title: `Archive — ${item.name || "blank"}`, icon: '🗜️', w: 760, h: 540 },
        bacon: { title: `Bacon Browser`, icon: '<img class="app-icon-title-bar" src="icons/16/browser.png">', w: 900, h: 620 }
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
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.textContent = `${appMeta.icon} ${type === 'bacon' ? 'Bacon Browser' : item.name}`;
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.querySelector('#taskbar #date-time'));

    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [{ label: "Close", icon: "close", action: () => closeWindow(windowId) }]);
    };
    windows[windowId].taskbarBtn = tbBtn;

    const body = win.querySelector('.app-body');
    if (type === 'editor') _buildEditorBody(body, item, windowId);
    if (type === 'image') _buildImageBody(body, item);
    if (type === 'video') _buildVideoBody(body, item, windowId);
    if (type === 'zip') _buildZipBody(body, item);
    if (type === 'bacon') _buildBaconBody(body, item, windowId, win);

    focusWindow(windowId);
    return windowId;
}

function _buildEditorBody(body, item, windowId) {
    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;gap:6px;padding:6px 8px;background:#1a1a1a;border-bottom:1px solid #000;flex-shrink:0;';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'small-btn';
    saveBtn.textContent = '💾 Save';
    const statusSpan = document.createElement('span');
    statusSpan.style.cssText = 'color:#888;font-size:12px;align-self:center;margin-left:6px;';
    statusSpan.textContent = item.name;
    toolbar.appendChild(saveBtn);
    toolbar.appendChild(statusSpan);
    body.appendChild(toolbar);

    const ta = document.createElement('textarea');
    ta.style.cssText = 'flex:1;width:100%;box-sizing:border-box;background:#1e1e1e;color:#d4d4d4;border:none;outline:none;padding:12px;font-family:monospace;font-size:13px;line-height:1.5;resize:none;';
    let text = '';
    if (item.content) {
        if (item.content instanceof ArrayBuffer) text = new TextDecoder().decode(item.content);
        else text = String(item.content);
    }
    ta.value = text;
    body.appendChild(ta);

    saveBtn.onclick = async () => {
        item.content = ta.value;
        item.updatedAt = Date.now();
        await idbPut(item);
        await renderAllWindows();
        statusSpan.textContent = '✓ Saved';
        setTimeout(() => statusSpan.textContent = item.name, 2000);
    };
}

function _buildImageBody(body, item) {
    body.style.background = '#0a0a0a';
    body.style.alignItems = 'center';
    body.style.justifyContent = 'center';
    body.style.overflow = 'auto';

    const img = document.createElement('img');
    img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;';

    if (item.content) {
        const mimeType = item.mime || ('image/' + getExt(item.name));
        const blob = new Blob([item.content], { type: mimeType });
        const src = URL.createObjectURL(blob);
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
    body.appendChild(img);
}

function _buildVideoBody(body, item, windowId) {
    body.style.background = '#000';
    body.style.alignItems = 'center';
    body.style.justifyContent = 'center';

    const video = document.createElement('video');
    video.controls = true;
    video.style.cssText = 'max-width:100%;max-height:100%;display:block;';
    video.autoplay = true;

    if (item.content) {
        const mimeType = item.mime || ('video/' + getExt(item.name));
        const blob = new Blob([item.content], { type: mimeType });
        const src = URL.createObjectURL(blob);
        video.src = src;
        video._blobUrl = src;
        const observer = new MutationObserver(() => {
            if (!document.contains(body)) {
                video.pause();
                URL.revokeObjectURL(src);
                observer.disconnect();
            }
        });
        observer.observe(document.getElementById('windowContainer'), { childList: true, subtree: true });
    }
    body.appendChild(video);
    video.play().catch(() => { });
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
            ">
                <img src="icons/dialog-error.svg" style="width: 64px; height: 64px;">
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

/* ============================================================
   BACON EXPLORER — Full Implementation
============================================================ */

// Global browser state (persisted in memory, sessionStorage for bookmarks/history)
const baconState = {
    bookmarks: JSON.parse(sessionStorage.getItem('bacon_bookmarks') || '[]'),
    history: JSON.parse(sessionStorage.getItem('bacon_history') || '[]'),
};

function saveBaconState() {
    try {
        sessionStorage.setItem('bacon_bookmarks', JSON.stringify(baconState.bookmarks.slice(0, 200)));
        sessionStorage.setItem('bacon_history', JSON.stringify(baconState.history.slice(0, 500)));
    } catch (e) { }
}

function resolveUrl(input) {
    input = input.trim();
    if (!input) return 'about:blank';
    if (input === 'bacon:new' || input === 'bacon://newtab' || input === 'about:blank') return input;
    if (/^https?:\/\//i.test(input)) return input;
    if (!input.includes(' ') && (input.includes('.') || input.startsWith('localhost'))) {
        return 'https://' + input;
    }
    return 'https://duckduckgo.com/?q=' + encodeURIComponent(input);
}

function getFaviconUrl(url) {
    try {
        const u = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
    } catch { return null; }
}

function getDisplayUrl(url) {
    try {
        const u = new URL(url);
        return u.hostname + (u.pathname !== '/' ? u.pathname : '');
    } catch { return url; }
}

function isSecure(url) {
    return url.startsWith('https://');
}

function _buildBaconBody(body, item, windowId, winEl) {
    body.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#121212;';

    const browser = {
        tabs: [],
        activeTabId: null,
        showFindBar: false,
        showBookmarkBar: true,
        zoom: 100,
    };

    // ---- TAB BAR ----
    const tabBar = document.createElement('div');
    tabBar.className = 'bacon-tabbar';

    const newTabBtn = document.createElement('button');
    newTabBtn.className = 'bacon-new-tab-btn';
    newTabBtn.title = 'New Tab';
    newTabBtn.innerHTML = '+';
    newTabBtn.onclick = () => openTab(browser, 'bacon:new', 'New Tab');
    tabBar.appendChild(newTabBtn);
    body.appendChild(tabBar);

    // ---- NAV BAR ----
    const navBar = document.createElement('div');
    navBar.className = 'bacon-navbar';

    const backBtn = makeBrowserBtn(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`, 'Back', () => activeIframe()?.contentWindow.history.back());
    const fwdBtn = makeBrowserBtn(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`, 'Forward', () => activeIframe()?.contentWindow.history.forward());
    const reloadBtn = makeBrowserBtn(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`, 'Reload', () => reloadActiveTab());
    const homeBtn = makeBrowserBtn(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`, 'Home', () => navigateActiveTab('bacon:new'));

    backBtn.style.marginRight = '2px';
    fwdBtn.style.marginRight = '2px';
    reloadBtn.style.marginRight = '4px';

    navBar.appendChild(backBtn);
    navBar.appendChild(fwdBtn);
    navBar.appendChild(reloadBtn);
    navBar.appendChild(homeBtn);

    const addrWrap = document.createElement('div');
    addrWrap.className = 'bacon-address-wrap';
    addrWrap.style.margin = '0 6px';

    const lockIcon = document.createElement('div');
    lockIcon.className = 'bacon-address-icon';
    lockIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`;

    const addrInput = document.createElement('input');
    addrInput.type = 'text';
    addrInput.className = 'bacon-address';
    addrInput.placeholder = 'Search or enter address…';
    addrInput.spellcheck = false;
    addrInput.autocomplete = 'off';

    const goBtn = document.createElement('button');
    goBtn.className = 'bacon-address-go';
    goBtn.title = 'Go';
    goBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;

    addrWrap.appendChild(lockIcon);
    addrWrap.appendChild(addrInput);
    addrWrap.appendChild(goBtn);

    const autocomplete = document.createElement('div');
    autocomplete.className = 'bacon-autocomplete';
    autocomplete.style.display = 'none';
    addrWrap.appendChild(autocomplete);

    let acIndex = -1;

    function showAutocomplete(val) {
        if (!val.trim()) { autocomplete.style.display = 'none'; return; }
        const items = buildAutocompleteSuggestions(val);
        if (!items.length) { autocomplete.style.display = 'none'; return; }
        autocomplete.innerHTML = '';
        acIndex = -1;
        items.forEach((item, i) => {
            const row = document.createElement('div');
            row.className = 'bacon-autocomplete-item';
            row.innerHTML = `<span class="ac-icon">${item.icon}</span><span class="ac-main">${item.label}</span><span class="ac-sub">${item.sub || ''}</span>`;
            row.onmousedown = (e) => {
                e.preventDefault();
                autocomplete.style.display = 'none';
                navigateActiveTab(resolveUrl(item.value));
                addrInput.blur();
            };
            autocomplete.appendChild(row);
        });
        autocomplete.style.display = 'block';
    }

    function buildAutocompleteSuggestions(val) {
        const q = val.toLowerCase();
        const results = [];
        const globeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg>`;
        const histIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
        const bookIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

        baconState.bookmarks.filter(b => b.title?.toLowerCase().includes(q) || b.url?.toLowerCase().includes(q))
            .slice(0, 3).forEach(b => results.push({ icon: bookIcon, label: b.title || b.url, sub: getDisplayUrl(b.url), value: b.url }));

        const seen = new Set();
        baconState.history.filter(h => h.url?.toLowerCase().includes(q) || h.title?.toLowerCase().includes(q))
            .slice(0, 5).forEach(h => {
                if (!seen.has(h.url)) {
                    seen.add(h.url);
                    results.push({ icon: histIcon, label: h.title || h.url, sub: getDisplayUrl(h.url), value: h.url });
                }
            });

        results.push({ icon: globeIcon, label: `Search DuckDuckGo for "${val}"`, sub: '', value: val });

        return results.slice(0, 8);
    }

    addrInput.addEventListener('focus', () => {
        addrInput.select();
        showAutocomplete(addrInput.value);
    });

    addrInput.addEventListener('input', () => showAutocomplete(addrInput.value));

    addrInput.addEventListener('keydown', (e) => {
        const items = autocomplete.querySelectorAll('.bacon-autocomplete-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            acIndex = Math.min(acIndex + 1, items.length - 1);
            items.forEach((it, i) => it.classList.toggle('selected', i === acIndex));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            acIndex = Math.max(acIndex - 1, -1);
            items.forEach((it, i) => it.classList.toggle('selected', i === acIndex));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            autocomplete.style.display = 'none';
            if (acIndex >= 0 && items[acIndex]) {
                items[acIndex].dispatchEvent(new MouseEvent('mousedown'));
            } else {
                navigateActiveTab(resolveUrl(addrInput.value));
            }
        } else if (e.key === 'Escape') {
            autocomplete.style.display = 'none';
            addrInput.blur();
        }
    });

    addrInput.addEventListener('blur', () => {
        setTimeout(() => { autocomplete.style.display = 'none'; }, 150);
    });

    goBtn.onclick = () => {
        autocomplete.style.display = 'none';
        navigateActiveTab(resolveUrl(addrInput.value));
    };

    navBar.appendChild(addrWrap);

    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.className = 'bacon-bookmark-btn';
    bookmarkBtn.title = 'Bookmark this page';
    bookmarkBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    bookmarkBtn.onclick = () => toggleBookmark(browser, addrInput.value, bookmarkBtn, bookmarkBar);

    const menuBtn = document.createElement('button');
    menuBtn.className = 'bacon-menu-btn';
    menuBtn.title = 'Browser Menu';
    menuBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`;
    menuBtn.onclick = (e) => showBrowserMenu(e, browser, addrInput, bookmarkBar, winEl, body);

    navBar.appendChild(bookmarkBtn);
    navBar.appendChild(menuBtn);
    body.appendChild(navBar);

    // ---- BOOKMARK BAR ----
    const bookmarkBar = document.createElement('div');
    bookmarkBar.className = 'bacon-bookmarkbar';
    body.appendChild(bookmarkBar);

    // ---- CONTENT ----
    const contentArea = document.createElement('div');
    contentArea.className = 'bacon-content';
    body.appendChild(contentArea);

    const zoomBadge = document.createElement('div');
    zoomBadge.className = 'bacon-zoom-badge';
    zoomBadge.textContent = '100%';
    contentArea.appendChild(zoomBadge);

    // ---- FIND BAR ----
    const findBar = document.createElement('div');
    findBar.className = 'bacon-findbar';
    findBar.style.display = 'none';
    const findInput = document.createElement('input');
    findInput.placeholder = 'Find in page…';
    const findPrev = document.createElement('button');
    findPrev.textContent = '▲';
    findPrev.title = 'Previous';
    const findNext = document.createElement('button');
    findNext.textContent = '▼';
    findNext.title = 'Next';
    const findCount = document.createElement('span');
    findCount.className = 'find-count';
    const findClose = document.createElement('button');
    findClose.className = 'find-close';
    findClose.textContent = '✕';
    findClose.onclick = () => { findBar.style.display = 'none'; browser.showFindBar = false; };
    findBar.appendChild(findInput);
    findBar.appendChild(findPrev);
    findBar.appendChild(findNext);
    findBar.appendChild(findCount);
    findBar.appendChild(findClose);
    body.appendChild(findBar);

    // ---- STATUS BAR ----
    const statusBar = document.createElement('div');
    statusBar.className = 'bacon-statusbar';
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'status-indicator';
    const statusUrl = document.createElement('div');
    statusUrl.className = 'status-url';
    statusUrl.textContent = 'Ready';
    statusBar.appendChild(statusIndicator);
    statusBar.appendChild(statusUrl);
    body.appendChild(statusBar);

    // ---- HELPER FUNCTIONS ----
    function activeTab() {
        return browser.tabs.find(t => t.id === browser.activeTabId);
    }

    function activeIframe() {
        const tab = activeTab();
        return tab ? tab.iframe : null;
    }

    function openTab(browser, url, title = 'New Tab') {
        const tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).slice(2);

        const tabEl = document.createElement('div');
        tabEl.className = 'bacon-tab';
        tabEl.dataset.tabid = tabId;

        const favicon = document.createElement('div');
        favicon.className = 'tab-loading';

        const tabTitle = document.createElement('span');
        tabTitle.className = 'tab-title';
        tabTitle.textContent = title;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'tab-close';
        closeBtn.title = 'Close Tab';
        closeBtn.textContent = '✕';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeTab(browser, tabId);
        };

        tabEl.appendChild(favicon);
        tabEl.appendChild(tabTitle);
        tabEl.appendChild(closeBtn);
        tabEl.onclick = () => switchTab(browser, tabId);

        tabBar.insertBefore(tabEl, newTabBtn);

        const iframe = document.createElement('iframe');
        iframe.className = 'bacon-iframe';
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals');
        iframe.style.display = 'none';
        contentArea.appendChild(iframe);

        const tab = { id: tabId, url: '', title, tabEl, titleEl: tabTitle, favicon, iframe };
        browser.tabs.push(tab);

        switchTab(browser, tabId);
        navigateTab(tab, url, addrInput, lockIcon, bookmarkBtn, bookmarkBar, statusBar, statusIndicator, statusUrl, browser, winEl, zoomBadge);
    }

    function closeTab(browser, tabId) {
        const idx = browser.tabs.findIndex(t => t.id === tabId);
        if (idx === -1) return;
        const tab = browser.tabs[idx];
        tab.tabEl.remove();
        tab.iframe.remove();
        browser.tabs.splice(idx, 1);

        if (browser.tabs.length === 0) {
            openTab(browser, 'bacon:new', 'New Tab');
        } else {
            const newActive = browser.tabs[Math.min(idx, browser.tabs.length - 1)];
            switchTab(browser, newActive.id);
        }
    }

    function switchTab(browser, tabId) {
        browser.activeTabId = tabId;
        browser.tabs.forEach(t => {
            t.tabEl.classList.toggle('active', t.id === tabId);
            t.iframe.style.display = t.id === tabId ? 'block' : 'none';
        });
        const tab = browser.tabs.find(t => t.id === tabId);
        if (tab) {
            addrInput.value = tab.url === 'bacon:new' ? '' : (tab.url || '');
            updateLockIcon(lockIcon, tab.url);
            updateBookmarkStar(bookmarkBtn, tab.url);
            winEl.querySelector('.title-bar-text').innerHTML = `<img class="app-icon-title-bar" src="icons/16/browser.png"> ${tab.title || 'Bacon Browser'}`;
        }
    }

    function navigateActiveTab(url) {
        const tab = activeTab();
        if (!tab) return;
        navigateTab(tab, url, addrInput, lockIcon, bookmarkBtn, bookmarkBar, statusBar, statusIndicator, statusUrl, browser, winEl, zoomBadge);
    }

    function reloadActiveTab() {
        const tab = activeTab();
        if (!tab) return;
        const url = tab.url;
        navigateTab(tab, url, addrInput, lockIcon, bookmarkBtn, bookmarkBar, statusBar, statusIndicator, statusUrl, browser, winEl, zoomBadge);
    }

    backBtn.onclick = () => activeIframe()?.contentWindow.history.back();
    fwdBtn.onclick = () => activeIframe()?.contentWindow.history.forward();
    reloadBtn.onclick = () => reloadActiveTab();
    homeBtn.onclick = () => navigateActiveTab('bacon:new');

    winEl.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                browser.showFindBar = !browser.showFindBar;
                findBar.style.display = browser.showFindBar ? 'flex' : 'none';
                if (browser.showFindBar) findInput.focus();
            } else if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                openTab(browser, 'bacon:new', 'New Tab');
            } else if (e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                if (browser.activeTabId) closeTab(browser, browser.activeTabId);
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                reloadActiveTab();
            } else if (e.key === 'l' || e.key === 'L') {
                e.preventDefault();
                addrInput.focus();
                addrInput.select();
            } else if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                browser.zoom = Math.min(browser.zoom + 10, 200);
                applyZoom(browser, contentArea, zoomBadge);
            } else if (e.key === '-') {
                e.preventDefault();
                browser.zoom = Math.max(browser.zoom - 10, 30);
                applyZoom(browser, contentArea, zoomBadge);
            } else if (e.key === '0') {
                e.preventDefault();
                browser.zoom = 100;
                applyZoom(browser, contentArea, zoomBadge);
            }
        }
    });

    let initialUrl = 'bacon:new';
    if (item && item.content) {
        initialUrl = 'file:' + item.name;
        openTab(browser, initialUrl, item.name);
        const tab = browser.tabs[0];
        let html = '';
        if (item.content instanceof ArrayBuffer) html = new TextDecoder().decode(item.content);
        else html = String(item.content);
        tab.iframe.srcdoc = html;
        tab.url = 'file:' + item.name;
        addrInput.value = tab.url;
        tab.titleEl.textContent = item.name;
        tab.favicon.className = 'tab-favicon';
        tab.favicon.innerHTML = '📄';
        tab.iframe.style.display = 'block';
    } else {
        openTab(browser, 'bacon:new', 'New Tab');
    }

    renderBookmarkBar(bookmarkBar, browser, addrInput, lockIcon, bookmarkBtn, statusBar, statusIndicator, statusUrl, winEl, zoomBadge);
}

function makeBrowserBtn(svg, title, onClick) {
    const btn = document.createElement('button');
    btn.className = 'bacon-nav-btn';
    btn.title = title;
    btn.innerHTML = svg;
    btn.onclick = onClick;
    return btn;
}

function navigateTab(tab, url, addrInput, lockIcon, bookmarkBtn, bookmarkBar, statusBar, statusIndicator, statusUrl, browser, winEl, zoomBadge) {
    tab.url = url;

    tab.favicon.className = 'tab-loading';
    tab.favicon.innerHTML = '';

    if (url === 'bacon:new') {
        tab.iframe.style.display = 'none';
        renderNewTabPage(tab, addrInput, lockIcon, bookmarkBtn, browser, winEl, statusBar, statusIndicator, statusUrl, zoomBadge, bookmarkBar);
        addrInput.value = '';
        updateLockIcon(lockIcon, '');
        updateBookmarkStar(bookmarkBtn, '');
        statusUrl.textContent = 'New Tab';
        statusIndicator.className = 'status-indicator';
        tab.favicon.className = 'tab-favicon';
        tab.favicon.textContent = '🏠';
        tab.titleEl.textContent = 'New Tab';
        tab.title = 'New Tab';
        winEl.querySelector('.title-bar-text').innerHTML = '<img class="app-icon-title-bar" src="icons/16/browser.png"> New Tab — Bacon Browser';
        return;
    }

    const existing = tab.iframe.parentElement?.querySelector('.bacon-newtab');
    if (existing) existing.remove();

    tab.iframe.style.display = 'block';
    addrInput.value = url;
    updateLockIcon(lockIcon, url);
    updateBookmarkStar(bookmarkBtn, url);
    statusUrl.textContent = 'Loading ' + url + '…';
    statusIndicator.className = 'status-indicator loading';

    tab.iframe.onload = () => {
        let title = url;
        try { title = tab.iframe.contentDocument?.title || url; } catch (e) { }
        tab.title = title || url;
        tab.titleEl.textContent = tab.title;
        tab.favicon.className = 'tab-favicon';
        const fav = getFaviconUrl(url);
        if (fav) {
            const img = document.createElement('img');
            img.src = fav;
            img.className = 'tab-favicon';
            img.onerror = () => {
                tab.favicon.innerHTML = '🌐';
                tab.favicon.className = 'tab-favicon';
            };
            tab.favicon.innerHTML = '';
            tab.favicon.appendChild(img);
        } else {
            tab.favicon.textContent = '📄';
        }

        statusUrl.textContent = url;
        statusIndicator.className = 'status-indicator';

        if (browser.activeTabId === tab.id) {
            winEl.querySelector('.title-bar-text').innerHTML = `<img class="app-icon-title-bar" src="icons/16/browser.png"> ${tab.title}`;
            addrInput.value = url;
            updateLockIcon(lockIcon, url);
            updateBookmarkStar(bookmarkBtn, url);
        }

        if (url !== 'bacon:new' && !url.startsWith('about:')) {
            baconState.history.unshift({ url, title: tab.title, time: Date.now() });
            if (baconState.history.length > 500) baconState.history.pop();
            saveBaconState();
        }
    };

    tab.iframe.onerror = () => {
        tab.favicon.className = 'tab-favicon';
        tab.favicon.textContent = '⚠️';
        statusUrl.textContent = 'Error loading ' + url;
        statusIndicator.className = 'status-indicator';
    };

    tab.iframe.src = url;
}

function renderNewTabPage(tab, addrInput, lockIcon, bookmarkBtn, browser, winEl, statusBar, statusIndicator, statusUrl, zoomBadge, bookmarkBar) {
    const old = tab.iframe.parentElement?.querySelector('.bacon-newtab');
    if (old) old.remove();

    const page = document.createElement('div');
    page.className = 'bacon-newtab';

    const hero = document.createElement('div');
    hero.className = 'bacon-newtab-hero';
    hero.innerHTML = `
                <div class="bacon-newtab-logo">🥓</div>
                <div class="bacon-newtab-title">Bacon Browser</div>
                <div class="bacon-newtab-sub">Your E-Dog OS browser</div>
            `;
    page.appendChild(hero);

    const searchBox = document.createElement('div');
    searchBox.className = 'bacon-newtab-search';
    searchBox.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            `;
    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Search the web or enter a URL…';
    const searchGoBtn = document.createElement('button');
    searchGoBtn.textContent = 'Go';

    searchBox.appendChild(searchInput);
    searchBox.appendChild(searchGoBtn);
    page.appendChild(searchBox);

    const doSearch = () => {
        const val = searchInput.value.trim();
        if (val) {
            const resolved = resolveUrl(val);
            navigateTab(tab, resolved, addrInput, lockIcon, bookmarkBtn, bookmarkBar, statusBar, statusIndicator, statusUrl, browser, winEl, zoomBadge);
            page.remove();
            tab.iframe.style.display = 'block';
        }
    };
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
    searchGoBtn.onclick = doSearch;

    const speedDials = [
        { label: 'Wikipedia', url: 'https://en.wikipedia.org', emoji: '📚' },
        { label: 'GitHub', url: 'https://github.com', emoji: '🐙' },
        { label: 'YouTube', url: 'https://youtube.com', emoji: '▶️' },
        { label: 'Reddit', url: 'https://reddit.com', emoji: '🤖' },
        { label: 'DuckDuckGo', url: 'https://duckduckgo.com', emoji: '🦆' },
        { label: 'Hacker News', url: 'https://news.ycombinator.com', emoji: '🗞️' },
        { label: 'MDN Web', url: 'https://developer.mozilla.org', emoji: '🔧' },
        { label: 'Claude.ai', url: 'https://claude.ai', emoji: '🤖' },
    ];

    const grid = document.createElement('div');
    grid.className = 'bacon-newtab-grid';
    speedDials.forEach(sd => {
        const tile = document.createElement('div');
        tile.className = 'bacon-speed-dial';
        tile.innerHTML = `
                    <div class="bacon-speed-dial-icon">${sd.emoji}</div>
                    <div class="bacon-speed-dial-label">${sd.label}</div>
                `;
        tile.onclick = () => {
            navigateTab(tab, sd.url, addrInput, lockIcon, bookmarkBtn, bookmarkBar, statusBar, statusIndicator, statusUrl, browser, winEl, zoomBadge);
            page.remove();
            tab.iframe.style.display = 'block';
        };
        grid.appendChild(tile);
    });
    page.appendChild(grid);

    if (baconState.bookmarks.length > 0) {
        const bmSection = document.createElement('div');
        bmSection.className = 'bacon-newtab-bookmarks';
        bmSection.innerHTML = '<h3>Bookmarks</h3>';
        const bmList = document.createElement('div');
        bmList.className = 'bacon-newtab-bmark-list';
        baconState.bookmarks.slice(0, 8).forEach(bm => {
            const row = document.createElement('div');
            row.className = 'bacon-newtab-bmark-row';
            const fav = getFaviconUrl(bm.url);
            row.innerHTML = `
                        ${fav ? `<img src="${fav}" onerror="this.style.display='none'">` : ''}
                        <span class="ntbmark-title">${bm.title || bm.url}</span>
                        <span class="ntbmark-url">${getDisplayUrl(bm.url)}</span>
                    `;
            row.onclick = () => {
                navigateTab(tab, bm.url, addrInput, lockIcon, bookmarkBtn, bookmarkBar, statusBar, statusIndicator, statusUrl, browser, winEl, zoomBadge);
                page.remove();
                tab.iframe.style.display = 'block';
            };
            bmList.appendChild(row);
        });
        bmSection.appendChild(bmList);
        page.appendChild(bmSection);
    }

    if (baconState.history.length > 0) {
        const histSection = document.createElement('div');
        histSection.className = 'bacon-newtab-bookmarks';
        histSection.style.marginBottom = '32px';
        histSection.innerHTML = '<h3>Recent History</h3>';
        const histList = document.createElement('div');
        histList.className = 'bacon-newtab-bmark-list';
        const seen = new Set();
        baconState.history.filter(h => { if (seen.has(h.url)) return false; seen.add(h.url); return true; })
            .slice(0, 6).forEach(h => {
                const row = document.createElement('div');
                row.className = 'bacon-newtab-bmark-row';
                const fav = getFaviconUrl(h.url);
                row.innerHTML = `
                        ${fav ? `<img src="${fav}" onerror="this.style.display='none'">` : ''}
                        <span class="ntbmark-title">${h.title || h.url}</span>
                        <span class="ntbmark-url">${getDisplayUrl(h.url)}</span>
                    `;
                row.onclick = () => {
                    navigateTab(tab, h.url, addrInput, lockIcon, bookmarkBtn, bookmarkBar, statusBar, statusIndicator, statusUrl, browser, winEl, zoomBadge);
                    page.remove();
                    tab.iframe.style.display = 'block';
                };
                histList.appendChild(row);
            });
        histSection.appendChild(histList);
        page.appendChild(histSection);
    }

    tab.iframe.parentElement.appendChild(page);
    setTimeout(() => searchInput.focus(), 100);
}

function updateLockIcon(lockIcon, url) {
    if (!url || url.startsWith('bacon:')) {
        lockIcon.className = 'bacon-address-icon';
        lockIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg>`;
    } else if (isSecure(url)) {
        lockIcon.className = 'bacon-address-icon secure';
        lockIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`;
    } else {
        lockIcon.className = 'bacon-address-icon insecure';
        lockIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 018-4.58M17 11V9"/><line x1="1" y1="1" x2="23" y2="23" stroke-width="2"/></svg>`;
    }
}

function updateBookmarkStar(bookmarkBtn, url) {
    const isBookmarked = baconState.bookmarks.some(b => b.url === url);
    bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
    bookmarkBtn.title = isBookmarked ? 'Remove Bookmark' : 'Bookmark this page';
    if (isBookmarked) {
        bookmarkBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else {
        bookmarkBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
}

function toggleBookmark(browser, url, bookmarkBtn, bookmarkBar) {
    if (!url || url === 'bacon:new') return;
    const idx = baconState.bookmarks.findIndex(b => b.url === url);
    if (idx >= 0) {
        baconState.bookmarks.splice(idx, 1);
    } else {
        const tab = browser.tabs.find(t => t.id === browser.activeTabId);
        baconState.bookmarks.push({ url, title: tab?.title || url, time: Date.now() });
    }
    saveBaconState();
    updateBookmarkStar(bookmarkBtn, url);
    renderBookmarkBar(bookmarkBar, browser, null, null, bookmarkBtn, null, null, null, null, null, null);
}

function renderBookmarkBar(bookmarkBar, browser, addrInput, lockIcon, bookmarkBtn, statusBar, statusIndicator, statusUrl, winEl, zoomBadge) {
    bookmarkBar.innerHTML = '';
    baconState.bookmarks.slice(0, 15).forEach(bm => {
        const btn = document.createElement('div');
        btn.className = 'bacon-bmark';
        const fav = getFaviconUrl(bm.url);
        btn.innerHTML = `
                    ${fav ? `<img src="${fav}" onerror="this.style.display='none'">` : ''}
                    <span class="bmark-label">${bm.title || getDisplayUrl(bm.url)}</span>
                `;
        btn.onclick = () => {
            const tab = browser.tabs.find(t => t.id === browser.activeTabId);
            if (tab && addrInput && statusBar) {
                navigateTab(tab, bm.url, addrInput, lockIcon, bookmarkBtn, bookmarkBar, statusBar, statusIndicator, statusUrl, browser, winEl, zoomBadge);
            }
        };
        btn.oncontextmenu = (e) => {
            e.preventDefault();
            showBrowserDropdown(e.clientX, e.clientY, [
                {
                    label: 'Remove Bookmark', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>`, danger: true, action: () => {
                        const idx = baconState.bookmarks.findIndex(b => b.url === bm.url);
                        if (idx >= 0) baconState.bookmarks.splice(idx, 1);
                        saveBaconState();
                        updateBookmarkStar(bookmarkBtn, browser.tabs.find(t => t.id === browser.activeTabId)?.url || '');
                        renderBookmarkBar(bookmarkBar, browser, addrInput, lockIcon, bookmarkBtn, statusBar, statusIndicator, statusUrl, winEl, zoomBadge);
                    }
                },
                {
                    label: 'Open in New Tab', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>`, action: () => {
                        openTabHelper(browser, bm.url, bm.title, addrInput, lockIcon, bookmarkBtn, bookmarkBar, statusBar, statusIndicator, statusUrl, winEl, zoomBadge);
                    }
                },
            ]);
        };
        bookmarkBar.appendChild(btn);
    });
}

function applyZoom(browser, contentArea, zoomBadge) {
    const pct = browser.zoom / 100;
    const iframes = contentArea.querySelectorAll('.bacon-iframe');
    iframes.forEach(iframe => {
        iframe.style.transform = `scale(${pct})`;
        iframe.style.transformOrigin = 'top left';
        iframe.style.width = (100 / pct) + '%';
        iframe.style.height = (100 / pct) + '%';
    });
    zoomBadge.textContent = browser.zoom + '%';
    zoomBadge.classList.add('visible');
    clearTimeout(zoomBadge._timer);
    zoomBadge._timer = setTimeout(() => zoomBadge.classList.remove('visible'), 1500);
}

function showBrowserMenu(e, browser, addrInput, bookmarkBar, winEl, body) {
    const url = browser.tabs.find(t => t.id === browser.activeTabId)?.url || '';
    const menuItems = [
        { label: 'New Tab', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`, action: () => openTabHelper(browser, 'bacon:new', 'New Tab', addrInput, null, null, bookmarkBar, null, null, null, winEl, null) },
        null,
        { label: 'Bookmarks', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`, action: () => showBookmarksPanel(browser, body) },
        { label: 'History', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`, action: () => showHistoryPanel(browser, body) },
        null,
        {
            label: 'Find in Page (Ctrl+F)', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`, action: () => {
                const findBar = body.querySelector('.bacon-findbar');
                if (findBar) { findBar.style.display = 'flex'; findBar.querySelector('input')?.focus(); }
            }
        },
        {
            label: 'Zoom In (Ctrl++)', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`, action: () => {
                browser.zoom = Math.min(browser.zoom + 10, 200);
                applyZoom(browser, body.querySelector('.bacon-content'), body.querySelector('.bacon-zoom-badge'));
            }
        },
        {
            label: 'Zoom Out (Ctrl+-)', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`, action: () => {
                browser.zoom = Math.max(browser.zoom - 10, 30);
                applyZoom(browser, body.querySelector('.bacon-content'), body.querySelector('.bacon-zoom-badge'));
            }
        },
        {
            label: `Reset Zoom (${browser.zoom}%)`, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`, action: () => {
                browser.zoom = 100;
                applyZoom(browser, body.querySelector('.bacon-content'), body.querySelector('.bacon-zoom-badge'));
            }
        },
        null,
        {
            label: 'View Page Source', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`, action: () => {
                const tab = browser.tabs.find(t => t.id === browser.activeTabId);
                if (!tab) return;
                try {
                    const src = tab.iframe.contentDocument?.documentElement?.outerHTML || '';
                    const item = { name: 'page-source.html', type: 'file', content: src };
                    spawnApp('editor', item);
                } catch (e) { alert('Cannot access page source (cross-origin restriction).'); }
            }
        },
        null,
        {
            label: 'Clear History', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>`, danger: true, action: () => {
                if (confirm('Clear all browsing history?')) { baconState.history = []; saveBaconState(); }
            }
        },
    ];
    showBrowserDropdown(e.clientX, e.clientY, menuItems);
}

function openTabHelper(browser, url, title, addrInput, lockIcon, bookmarkBtn, bookmarkBar, statusBar, statusIndicator, statusUrl, winEl, zoomBadge) {
    if (!browser._refs) return;
    const r = browser._refs;
    browser._openTab(url, title);
}

function showBrowserDropdown(x, y, items) {
    document.querySelectorAll('.bacon-dropdown').forEach(d => d.remove());
    window.removeEventListener('mousedown', closeBrowserDropdown);

    const menu = document.createElement('div');
    menu.className = 'bacon-dropdown';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    items.forEach(item => {
        if (!item) {
            const sep = document.createElement('hr');
            sep.className = 'bacon-dropdown-sep';
            menu.appendChild(sep);
            return;
        }
        const row = document.createElement('div');
        row.className = 'bacon-dropdown-item' + (item.danger ? ' danger' : '');
        row.innerHTML = `${item.icon || ''}<span>${item.label}</span>`;
        row.onmousedown = (e) => {
            e.stopPropagation();
            menu.remove();
            window.removeEventListener('mousedown', closeBrowserDropdown);
            item.action();
        };
        menu.appendChild(row);
    });

    document.body.appendChild(menu);

    requestAnimationFrame(() => {
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 8) + 'px';
        if (rect.bottom > window.innerHeight - 44) menu.style.top = (window.innerHeight - 44 - rect.height - 4) + 'px';
    });

    setTimeout(() => window.addEventListener('mousedown', closeBrowserDropdown), 0);
}

function closeBrowserDropdown(e) {
    const menus = document.querySelectorAll('.bacon-dropdown');
    menus.forEach(m => { if (!m.contains(e.target)) m.remove(); });
    window.removeEventListener('mousedown', closeBrowserDropdown);
}

function showBookmarksPanel(browser, body) {
    showSidePanel('Bookmarks', body, (panel) => {
        if (baconState.bookmarks.length === 0) {
            panel.innerHTML = '<div style="color:#555;font-size:12px;padding:16px;">No bookmarks yet. Click ★ to add one.</div>';
            return;
        }
        baconState.bookmarks.forEach((bm, i) => {
            const row = document.createElement('div');
            row.className = 'bacon-history-item';
            const fav = getFaviconUrl(bm.url);
            row.innerHTML = `
                        ${fav ? `<img src="${fav}" width="14" height="14" onerror="this.style.display='none'" style="flex-shrink:0;">` : '🌐'}
                        <span class="hist-title">${bm.title || bm.url}</span>
                        <span class="hist-url">${getDisplayUrl(bm.url)}</span>
                    `;
            row.onclick = () => {
                const tab = browser.tabs.find(t => t.id === browser.activeTabId);
            };
            row.oncontextmenu = (e) => {
                e.preventDefault();
                showBrowserDropdown(e.clientX, e.clientY, [
                    {
                        label: 'Remove', danger: true, icon: '', action: () => {
                            baconState.bookmarks.splice(i, 1);
                            saveBaconState();
                            panel.innerHTML = '';
                            showBookmarksPanel(browser, body);
                        }
                    }
                ]);
            };
            panel.appendChild(row);
        });
    });
}

function showHistoryPanel(browser, body) {
    showSidePanel('History', body, (panel) => {
        if (baconState.history.length === 0) {
            panel.innerHTML = '<div style="color:#555;font-size:12px;padding:16px;">No history yet.</div>';
            return;
        }
        baconState.history.slice(0, 100).forEach(h => {
            const row = document.createElement('div');
            row.className = 'bacon-history-item';
            const fav = getFaviconUrl(h.url);
            const time = h.time ? new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            row.innerHTML = `
                        <span class="hist-time">${time}</span>
                        ${fav ? `<img src="${fav}" width="12" height="12" onerror="this.style.display='none'" style="flex-shrink:0;">` : ''}
                        <span class="hist-title">${h.title || h.url}</span>
                        <span class="hist-url">${getDisplayUrl(h.url)}</span>
                    `;
            panel.appendChild(row);
        });
    });
}

function showSidePanel(title, body, fill) {
    body.querySelectorAll('.bacon-side-panel').forEach(p => p.remove());

    const panel = document.createElement('div');
    panel.className = 'bacon-side-panel';
    panel.style.cssText = `
                position:absolute; top:0; right:0; bottom:0; width:300px;
                background:#1a1a1a; border-left:1px solid #000;
                display:flex; flex-direction:column; z-index:999;
                box-shadow:-4px 0 16px rgba(0,0,0,0.5);
            `;

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#141414;border-bottom:1px solid #000;flex-shrink:0;';
    header.innerHTML = `<span style="font-size:13px;font-weight:600;color:#ccc;">${title}</span>`;
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'background:transparent;border:none;color:#666;cursor:pointer;font-size:16px;padding:0;';
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => panel.remove();
    header.appendChild(closeBtn);

    const content = document.createElement('div');
    content.style.cssText = 'flex:1;overflow-y:auto;';

    panel.appendChild(header);
    panel.appendChild(content);

    const contentArea = body.querySelector('.bacon-content');
    if (contentArea) {
        contentArea.style.position = 'relative';
        contentArea.appendChild(panel);
    }

    fill(content);
}

/* ---- openFile dispatcher ---- */
function openFile(item) {
    const ext = getExt(item.name);
    if (IMAGE_EXTS.has(ext) || item.mime?.startsWith('image/')) {
        spawnApp('image', item);
    } else if (VIDEO_EXTS.has(ext) || item.mime?.startsWith('video/')) {
        spawnApp('video', item);
    } else if (ZIP_EXTS.has(ext) || item.mime === 'application/zip') {
        spawnApp('zip', item);
    } else if (HTML_EXTS.has(ext)) {
        spawnApp('bacon', item);
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

const CTX_ICONS = {
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
};

function buildMenu(x, y, entries) {
    if (menuEl) menuEl.remove();
    menuEl = document.createElement('div');
    menuEl.className = 'ctx-menu';
    menuEl.style.left = x + 'px';
    menuEl.style.top = y + 'px';

    for (const entry of entries) {
        if (!entry) {
            const sep = document.createElement('hr');
            sep.className = 'ctx-sep';
            menuEl.appendChild(sep);
            continue;
        }
        const { label, icon, danger, action } = entry;
        const row = document.createElement('div');
        row.className = 'ctx-row' + (danger ? ' danger' : '');
        if (icon && CTX_ICONS[icon]) row.innerHTML = CTX_ICONS[icon];
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

function showContextMenu(x, y, item, windowId) {
    buildMenu(x, y, [
        item.type === 'folder'
            ? { label: 'Open', icon: 'open', action: () => navigate(windowId, item.id) }
            : { label: 'Open', icon: 'open', action: () => openFile(item) },
        null,
        { label: 'Rename', icon: 'rename', action: () => renameItem(item.id, windowId) },
        { label: 'Delete', icon: 'delete', danger: true, action: () => deleteItem(item.id, windowId) },
        item.type === 'file'
            ? { label: 'Download', icon: 'download', action: () => downloadItem(item.id) }
            : null,
        null,
        { label: 'Properties', icon: 'properties', action: () => spawnPropertiesWindow(item) },
    ].filter(e => e !== null || true));
}

function showFolderBgContextMenu(x, y, windowId) {
    const state = windows[windowId]?.state;
    const isAtRoot = state?.currentFolderId === 'root';
    const entries = [
        { label: 'New Folder', icon: 'newFolder', action: () => createFolder(windowId) },
        { label: 'New File', icon: 'newFile', action: () => createFile(windowId) },
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

function showDesktopContextMenu(x, y, item) {
    buildMenu(x, y, [
        item.type === 'folder'
            ? { label: 'Open', icon: 'open', action: () => spawnWindow(item.id) }
            : { label: 'Open', icon: 'open', action: () => openFile(item) },
        null,
        { label: 'Rename', icon: 'rename', action: () => renameItem(item.id, null) },
        { label: 'Delete', icon: 'delete', danger: true, action: () => deleteItem(item.id, null) },
        item.type === 'file'
            ? { label: 'Download', icon: 'download', action: () => downloadItem(item.id) }
            : null,
        null,
        { label: 'Properties', icon: 'properties', action: () => spawnPropertiesWindow(item) },
    ]);
}

function showDesktopBlankContextMenu(x, y) {
    buildMenu(x, y, [
        { label: 'New File Explorer', icon: 'newWindow', action: () => spawnWindow() },
        { label: 'Open Bacon Browser', icon: 'open', action: () => spawnBaconBrowser() },
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
        { label: 'Drive Properties', icon: 'drive', action: () => spawnDriveProperties() },
    ]);
}

function spawnBaconBrowser(url) {
    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 30;
    const left = Math.min(60 + offset, window.innerWidth - 920);
    const top = Math.min(60 + offset, window.innerHeight - 660);

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.left = left + 'px';
    win.style.top = top + 'px';
    win.style.width = '920px';
    win.style.height = '640px';

    win.addEventListener('mousedown', () => focusWindow(windowId));

    win.innerHTML = `
                <div class="title-bar">
                    <button class="window-close-button" title="Close">✕</button>
                    <button class="window-minimize-button" title="Minimize">—</button>
                    <span class="title-bar-text"><img class="app-icon-title-bar" src="icons/16/browser.png"> Bacon Browser</span>
                </div>
                <div class="app-body" style="height:calc(100% - 42px);overflow:hidden;display:flex;flex-direction:column;"></div>
            `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'bacon', item: {} } };

    win.querySelector('.title-bar').addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.innerHTML = `<img class="app-icon-title-bar" src="icons/16/browser.png"> Bacon Browser`;
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.querySelector('#taskbar #date-time'));

    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [{ label: "Close", icon: "close", action: () => closeWindow(windowId) }]);
    };
    windows[windowId].taskbarBtn = tbBtn;

    const body = win.querySelector('.app-body');
    _buildBaconBody(body, url ? { name: url, content: null } : {}, windowId, win);

    focusWindow(windowId);
    return windowId;
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
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.innerHTML = '<img class="app-icon-title-bar" src="icons/16/terminal.png"> Terminal';
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.querySelector('#taskbar #date-time'));
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
                    ['format', 'Format disk'],
                    ['createfile <file>', 'Create empty file'],
                    ['echo <text>', 'Print text'],
                    ['clear', 'Clear terminal output'],
                    ['history', 'Show command history'],
                    ['whoami', 'Print current user'],
                    ['date', 'Print current date/time'],
                    ['uname [-a]', 'Print system info'],
                    ['error [error]', 'Throw an error'],
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
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.textContent = `⚙ ${title}`;
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.querySelector('#taskbar #date-time'));

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
        const contentsEl = table.querySelector('.pv:last-child');
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

async function renameItem(id, windowId) {
    if (menuEl) { menuEl.remove(); menuEl = null; }

    const tile = document.querySelector(`.item[data-id="${id}"]`);
    if (!tile) {
        const node = await idbGet(id);
        const n = prompt('Rename', node.name);
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
    if (!confirm(`Delete "${node.name}"?`)) return;
    if (node.type === 'folder') await recursiveDelete(node.id);
    else await idbDelete(node.id);
    await renderAllWindows();
}

async function recursiveDelete(folderId) {
    const children = await idbGetAllByIndex('parentId', folderId);
    for (const c of children) {
        if (c.type === 'folder') await recursiveDelete(c.id);
        else await idbDelete(c.id);
    }
    await idbDelete(folderId);
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
async function renderDesktop() {
    const username = getUsername();
    let desktopNode = null;
    const rootChildren = await idbGetAllByIndex('parentId', 'root');
    const homeDir = rootChildren.find(n => n.name === 'home' && n.type === 'folder');
    if (homeDir) {
        const homeChildren = await idbGetAllByIndex('parentId', homeDir.id);
        const userDir = homeChildren.find(n => n.name === username && n.type === 'folder');
        if (userDir) {
            const userChildren = await idbGetAllByIndex('parentId', userDir.id);
            desktopNode = userChildren.find(n => n.name === 'Desktop' && n.type === 'folder');
        }
    }
    if (!desktopNode) return;

    const items = await idbGetAllByIndex('parentId', desktopNode.id);
    const desktopEl = document.getElementById('virtualDesktop');
    desktopEl.innerHTML = '';

    for (const item of items) {
        const tile = document.createElement('div');
        tile.className = 'item';
        tile.dataset.id = item.id;
        tile.title = item.name;

        if (item.type === 'folder') {
            const specialSVG = getSpecialFolderIcon(item.name);
            if (specialSVG) {
                tile.appendChild(specialSVG);
            } else {
                const img = document.createElement('img');
                img.className = 'icon-img';
                const fallback = document.createElement('div');
                fallback.className = 'iconFallback';
                fallback.textContent = '📁';
                const candidates = getIconCandidates(item);
                img.onerror = () => {
                    if (candidates.length) img.src = './icons/128/' + candidates.shift();
                    else { img.remove(); fallback.style.display = 'block'; }
                };
                if (candidates.length) img.src = './icons/128/' + candidates.shift();
                else fallback.style.display = 'block';
                tile.appendChild(img);
                tile.appendChild(fallback);
            }
        } else {
            const img = document.createElement('img');
            img.className = 'icon-img';
            const fallback = document.createElement('div');
            fallback.className = 'iconFallback';
            fallback.textContent = '📄';
            const candidates = getIconCandidates(item);
            img.onerror = () => {
                if (candidates.length) img.src = './icons/128/' + candidates.shift();
                else { img.remove(); fallback.style.display = 'block'; }
            };
            if (candidates.length) img.src = './icons/128/' + candidates.shift();
            else fallback.style.display = 'block';
            tile.appendChild(img);
            tile.appendChild(fallback);
        }
        const nameDiv = document.createElement('div');
        nameDiv.textContent = item.name;
        tile.appendChild(nameDiv);

        tile.onmousedown = (ev) => {
            if (ev.button !== 0) return;
            desktopEl.querySelectorAll('.item').forEach(el => el.classList.remove('selected'));
            tile.classList.add('selected');
        };

        tile.ondblclick = async () => {
            if (item.type === 'folder') {
                spawnWindow(item.id);
            } else {
                openFile(item);
            }
        };

        tile.oncontextmenu = (ev) => {
            ev.preventDefault();
            desktopEl.querySelectorAll('.item').forEach(el => el.classList.remove('selected'));
            tile.classList.add('selected');
            showDesktopContextMenu(ev.clientX, ev.clientY, item);
        };

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
        }
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
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.innerHTML = '<img class="app-icon-title-bar" src="icons/16/info.png"> About';
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.querySelector('#taskbar #date-time'));

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

function spawnError(error) {
    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 28;
    const left = Math.min(80 + offset, window.innerWidth - 380);
    const top = Math.min(80 + offset, window.innerHeight - 240);

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.left = left + 'px';
    win.style.top = top + 'px';
    win.style.width = '380px';
    win.style.height = '240px';

    win.addEventListener('mousedown', () => focusWindow(windowId));

    win.innerHTML = `
                <div class="title-bar">
                    <button class="window-close-button" title="Close">✕</button>
                    <span class="title-bar-text"><img class="app-icon-title-bar" src="icons/16/dialog-error.png"> ${error.length > 30 ? error.slice(0, 30).trimEnd() + '...' : error}</span>
                </div>
                <div class="app-body" style="height: calc(100% - var(--titlebar-height));overflow:hidden;display:flex;flex-direction:column;"></div>
            `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'about' } };

    win.querySelector('.title-bar').addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.innerHTML = '<img class="app-icon-title-bar" src="icons/16/dialog-error.png"> Error';
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.querySelector('#taskbar #date-time'));

    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [{ label: "Close", icon: "close", action: () => closeWindow(windowId) }]);
    };
    windows[windowId].taskbarBtn = tbBtn;

    const body = win.querySelector('.app-body');

    _buildErrorBody(body, error);

    focusWindow(windowId);

    return windowId;
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
    } else if (action === 'openBacon') {
        spawnBaconBrowser();
    } else if (action === 'openTerminal') {
        spawnTerminal();
    } else if (action === 'newFile') {
        const userDirId = await getUserDirId();
        if (!userDirId) return;
        const wid = spawnWindow();
        setTimeout(async () => {
            await navigateToPath(wid, homePath);
            await createItemInline('file', userDirId, wid);
        }, 80);
    } else if (action === 'newFolder') {
        const userDirId = await getUserDirId();
        if (!userDirId) return;
        const wid = spawnWindow();
        setTimeout(async () => {
            await navigateToPath(wid, homePath);
            await createItemInline('folder', userDirId, wid);
        }, 80);
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
    }
}

async function startOpenFolder(path) {
    closeStartMenu();
    const wid = spawnWindow();
    setTimeout(() => navigateToPath(wid, path), 80);
}

/* ============================================================
   Boot
============================================================ */
(async function init() {
    dbPromise = await openDB();
    applyTheme(currentTheme);

    async function bootIntoOS() {
        const setupResult = await (window.__setupComplete ?? Promise.resolve({ freshInstall: false }));
        if (setupResult && setupResult.freshInstall) {
            // Fresh install already completed via setup — just open home
            // const username = setupResult.username || getUsername();
            // const wid = spawnWindow();
            // setTimeout(() => navigateToPath(wid, `/home/${username}`), 80);
            renderDesktop()
        } else {
            await ensureDefaultFolders();
            // const wid = spawnWindow();
            // setTimeout(() => {
            //     navigateToPath(wid, `/home/${getUsername()}`);
            // }, 80);
            renderDesktop()
        }
    }

    // Check if the boot/login system is loaded
    if (typeof window.__bootAndLogin === 'function') {
        window.__bootAndLogin(() => bootIntoOS());
    } else {
        // Fallback: no boot/login (boot.js not loaded)
        await bootIntoOS();
    }
})();

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
const THEMES = ['dark', 'aero2010'];
let currentTheme = localStorage.getItem('edog_theme') || 'dark';
const bgUrl = "wallpapers/default-wallpaper.jpg";
const bg2Url = "wallpapers/wallpaper-2.jpg";

function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('edog_theme', theme);

    document.documentElement.classList.remove(...THEMES.map(t => 'theme-' + t));

    if (theme !== 'dark') {
        document.documentElement.classList.add('theme-' + theme);
    }

    if (theme == 'dark') {
        document.body.style.backgroundImage = `url('${bgUrl}')`;
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundPosition = "center center";
        document.body.style.backgroundSize = "cover"; // fills screen, keeps aspect ratio
        document.body.style.height = "100vh"; // make sure body fills viewport
        document.body.style.margin = "0"; // remove default margin
    } else {
        document.body.style.backgroundImage = `url('${bg2Url}')`;
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundPosition = "center center";
        document.body.style.backgroundSize = "cover"; // fills screen, keeps aspect ratio
        document.body.style.height = "100vh"; // make sure body fills viewport
        document.body.style.margin = "0"; // remove default margin
    }

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

    document.getElementById("date-time").textContent = formatted;
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
window.spawnBaconBrowser = spawnBaconBrowser;
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

// Catch synchronous errors
window.onerror = function (message, source, lineno, colno, error) {
    console.error("Global Error:", message, source, lineno, colno, error);
    spawnError(message);
};

// Catch async errors (Promises)
window.onunhandledrejection = function (event) {
    console.error("Unhandled Promise Rejection:", event.reason);
    spawnError(event.reason);
};

// Apply saved theme immediately on load
applyTheme(currentTheme);