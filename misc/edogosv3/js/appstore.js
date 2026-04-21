/* ============================================================
   E-Dog OS — App Store
   appstore.js

   ZIP package format
   ──────────────────
   my-app.zip
   ├── manifest.json        (required)
   ├── my-app.app           (required — the .app JSON file)
   ├── icon.png             (optional — 32 × 32 icon)
   ├── icon16.png           (optional — 16 × 16 override; icon.png used if absent)
   └── assets/              (optional — any other files)
       └── …                → /usr/share/<id>/…

   manifest.json schema
   ─────────────────────
   {
     "id":          "my-app",          // unique slug, used for FS paths
     "name":        "My App",
     "version":     "1.0.0",
     "description": "Does cool stuff.",
     "author":      "Your Name",
     "category":    "accessories",     // startmenu category id
     "emoji":       "🔧"               // fallback when icon.png is absent
   }

   File placement after install
   ─────────────────────────────
   *.app        → /usr/bin/<filename>.app
   icon.png     → /usr/share/icons/32/<id>.png
                  /usr/share/icons/16/<id>.png  (also, unless icon16.png present)
   icon16.png   → /usr/share/icons/16/<id>.png
   assets/**    → /usr/share/<id>/**
============================================================ */

(function () {

    'use strict';

    /* ============================================================
       Catalog — add one entry per available app
    ============================================================ */
    const CATALOG = [
        {
            id: 'imgedit',
            name: 'ImgEdit',
            version: '1.0',
            description: 'Create, edit, and convert images',
            author: 'E-Dog',
            category: 'accessories',
            emoji: '🖼️',
            zip: './apps/imgedit.zip',
        },
    ];

    /* ============================================================
       Installed-apps tracking  (localStorage)
    ============================================================ */
    const STORAGE_KEY = 'edog_appstore_installed';

    function getInstalled() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
        catch { return {}; }
    }
    function _saveInstalled(map) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }
    function _markInstalled(id, meta) {
        const installed = getInstalled();
        installed[id] = meta;
        _saveInstalled(installed);
    }
    function _markUninstalled(id) {
        const installed = getInstalled();
        delete installed[id];
        _saveInstalled(installed);
    }

    /* ============================================================
       Filesystem helpers (no renderAllWindows spam)
    ============================================================ */

    /** MIME type from filename extension */
    function _guessMime(filename) {
        const ext = (filename.split('.').pop() || '').toLowerCase();
        return ({
            png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
            gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
            bmp: 'image/bmp', ico: 'image/x-icon',
            wav: 'audio/wav', mp3: 'audio/mpeg', ogg: 'audio/ogg', flac: 'audio/flac',
            mp4: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska',
            json: 'application/json', app: 'application/json',
            html: 'text/html', css: 'text/css', js: 'text/javascript', txt: 'text/plain',
        })[ext] || 'application/octet-stream';
    }

    /**
     * Ensure every directory in `path` exists, creating missing ones.
     * Returns the id of the deepest directory.
     * Does NOT call renderAllWindows.
     */
    async function _ensureDir(path) {
        const parts = path.split('/').filter(Boolean);
        let parentId = 'root';
        for (const part of parts) {
            const children = await idbGetAllByIndex('parentId', parentId);
            let dir = children.find(n => n.name === part && n.type === 'folder');
            if (!dir) {
                const id = crypto.randomUUID();
                dir = { id, name: part, type: 'folder', parentId, createdAt: Date.now(), updatedAt: Date.now() };
                await idbAdd(dir);
            }
            parentId = dir.id;
        }
        return parentId;
    }

    /**
     * Write (create or overwrite) a file at an absolute path.
     * Creates all parent directories automatically.
     * Does NOT call renderAllWindows.
     */
    async function _upsertFile(path, content, mime) {
        const parts = path.split('/').filter(Boolean);
        const filename = parts.pop();
        const parentId = await _ensureDir('/' + parts.join('/'));
        const detectedMime = mime || _guessMime(filename);
        const size = content instanceof ArrayBuffer ? content.byteLength : new Blob([content]).size;

        const siblings = await idbGetAllByIndex('parentId', parentId);
        const existing = siblings.find(n => n.name === filename && n.type === 'file');

        if (existing) {
            existing.content = content;
            existing.size = size;
            existing.mime = detectedMime;
            existing.updatedAt = Date.now();
            await idbPut(existing);
        } else {
            await idbAdd({
                id: crypto.randomUUID(),
                name: filename, type: 'file',
                parentId, content, size,
                mime: detectedMime,
                createdAt: Date.now(), updatedAt: Date.now(),
            });
        }
    }

    /* ============================================================
       Start-menu registration
    ============================================================ */
    function _registerInStartMenu(id, manifest) {
        if (typeof registerStartMenuApp !== 'function') return;
        registerStartMenuApp({
            name: manifest.name,
            icon: `/usr/share/icons/32/${id}.png`,
            iconFallback: `/usr/share/icons/16/${id}.png`,
            emoji: manifest.emoji || '📦',
            categories: ['all', manifest.category || 'accessories'],
            action: () => openCustomAppFromPath(`/usr/bin/${id}.app`),
        });
    }

    function _unregisterFromStartMenu(id, name) {
        if (!window._smAppRegistry) return;
        const idx = window._smAppRegistry.findIndex(a => a.name === name);
        if (idx !== -1) window._smAppRegistry.splice(idx, 1);
    }

    /* ============================================================
       Install
    ============================================================ */
    async function installApp(entry, onStatus) {
        onStatus?.(`Downloading ${entry.name}…`);

        // 1 — Fetch ZIP
        const resp = await fetch(entry.zip);
        if (!resp.ok) throw new Error(`HTTP ${resp.status} while fetching ${entry.zip}`);
        const zipBuf = await resp.arrayBuffer();

        onStatus?.('Reading package…');
        if (typeof JSZip === 'undefined') throw new Error('JSZip not loaded — add jszip.min.js before appstore.js');
        const zip = await JSZip.loadAsync(zipBuf);

        // 2 — Parse manifest
        const manifestFile = zip.file('manifest.json');
        if (!manifestFile) throw new Error('Package is missing manifest.json');
        const manifest = JSON.parse(await manifestFile.async('string'));
        const id = (manifest.id || entry.id || '').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
        if (!id) throw new Error('manifest.json must include an "id" field');

        // 3 — Find .app file (top-level preferred, then anywhere)
        const appEntries = Object.values(zip.files).filter(f => !f.dir && f.name.endsWith('.app'));
        if (!appEntries.length) throw new Error('Package contains no .app file');
        const appEntry = appEntries.find(f => !f.name.includes('/')) || appEntries[0];

        // 4 — Read and patch .app so customIcon points to the installed FS icon
        onStatus?.('Patching app config…');
        const appText = await appEntry.async('string');
        let patchedApp;
        const firstLine = appText.slice(0, appText.indexOf('\n')).trim();
        if (firstLine === '\\\\\\EDOGOSAPP 1.1' || firstLine === '!EDOGOSAPP 1.1') {
            // New delimited format — patch only the CONFIG block
            patchedApp = appText.replace(
                /(\\\\\\CONFIG\r?\n)([\s\S]*?)(\\\\\\ENDCONFIG)/,
                (_, open, configJson, close) => {
                    const cfg = JSON.parse(configJson);
                    cfg.customIcon = `/usr/share/icons/32/${id}.png`;
                    return open + JSON.stringify(cfg, null, 2) + '\n' + close;
                }
            );
        } else {
            // Legacy JSON format
            const appConfig = JSON.parse(appText);
            appConfig.customIcon = `/usr/share/icons/32/${id}.png`;
            patchedApp = JSON.stringify(appConfig);
        }

        // 5 — Write .app to /usr/bin/
        onStatus?.('Installing app…');
        await _upsertFile(`/usr/bin/${id}.app`, patchedApp, 'application/octet-stream');

        // 6 — Write icons
        const icon32Entry = zip.file('icon.png');
        const icon16Entry = zip.file('icon16.png');

        if (icon32Entry) {
            onStatus?.('Installing icons…');
            const iconBuf = await icon32Entry.async('arraybuffer');
            await _upsertFile(`/usr/share/icons/32/${id}.png`, iconBuf, 'image/png');
            // Use the same image for 16 unless icon16.png is present
            if (!icon16Entry) {
                await _upsertFile(`/usr/share/icons/16/${id}.png`, iconBuf, 'image/png');
            }
        }
        if (icon16Entry) {
            const iconBuf = await icon16Entry.async('arraybuffer');
            await _upsertFile(`/usr/share/icons/16/${id}.png`, iconBuf, 'image/png');
        }

        // 7 — Write assets/** → /usr/share/<id>/
        const assetEntries = Object.values(zip.files).filter(f =>
            !f.dir &&
            f.name !== 'manifest.json' &&
            !f.name.endsWith('.app') &&
            f.name !== 'icon.png' &&
            f.name !== 'icon16.png'
        );

        let done = 0;
        for (const asset of assetEntries) {
            const relativeName = asset.name.replace(/^assets\//, '');
            const destPath = `/usr/share/${id}/${relativeName}`;
            onStatus?.(`Installing ${relativeName}…`);
            const buf = await asset.async('arraybuffer');
            await _upsertFile(destPath, buf);
            done++;
        }

        // 8 — Invalidate icon cache so the new icons are picked up immediately
        if (typeof iconBlobCache !== 'undefined') {
            iconBlobCache.delete(`/usr/share/icons/32/${id}.png`);
            iconBlobCache.delete(`/usr/share/icons/16/${id}.png`);
        }

        // 9 — Register in start menu and persist
        const fullManifest = { ...manifest, id };
        _registerInStartMenu(id, fullManifest);
        _markInstalled(id, {
            id, name: manifest.name,
            version: manifest.version || '?',
            emoji: manifest.emoji || '📦',
            category: manifest.category || 'accessories',
            appPath: `/usr/bin/${id}.app`,
        });

        // 10 — Refresh open file explorer windows
        await renderAllWindows();

        onStatus?.('Done');
    }

    /* ============================================================
       Uninstall
    ============================================================ */
    async function uninstallApp(id) {
        const installed = getInstalled();
        const meta = installed[id];
        if (!meta) return;

        // Remove known files silently
        for (const path of [
            `/usr/bin/${id}.app`,
            `/usr/share/icons/32/${id}.png`,
            `/usr/share/icons/16/${id}.png`,
        ]) {
            const node = await _fsResolve(path);
            if (node) await idbDelete(node.id);
        }

        // Remove /usr/share/<id>/ tree
        const shareDir = await _fsResolve(`/usr/share/${id}`);
        if (shareDir && shareDir.type === 'folder') await recursiveDelete(shareDir.id);

        // Invalidate icon cache
        if (typeof iconBlobCache !== 'undefined') {
            iconBlobCache.delete(`/usr/share/icons/32/${id}.png`);
            iconBlobCache.delete(`/usr/share/icons/16/${id}.png`);
        }

        _unregisterFromStartMenu(id, meta.name);
        _markUninstalled(id);
        await renderAllWindows();
    }

    /* ============================================================
       App Store Window
    ============================================================ */
    function spawnAppStore() {
        // Inject styles once
        if (!document.getElementById('appstore-styles')) {
            const s = document.createElement('style');
            s.id = 'appstore-styles';
            s.textContent = `
.as-root { display:flex; flex-direction:column; height:100%; background:#1e1e1e; color:#d4d4d4; font-family:var(--font-ui,'Segoe UI',sans-serif); font-size:13px; overflow:hidden; }
.as-toolbar { display:flex; align-items:center; gap:10px; padding:8px 12px; background:#252526; border-bottom:1px solid #1a1a1a; flex-shrink:0; }
.as-toolbar-title { font-weight:700; font-size:15px; color:#fff; margin-right:6px; }
.as-search { flex:1; max-width:280px; background:#333; border:1px solid #555; border-radius:4px; padding:5px 10px; color:#d4d4d4; font-size:12px; outline:none; font-family:inherit; }
.as-search:focus { border-color:#3b82f6; }
.as-body { display:flex; flex:1; overflow:hidden; }
.as-sidebar { width:150px; flex-shrink:0; background:#252526; border-right:1px solid #1a1a1a; overflow-y:auto; padding:8px 0; }
.as-sidebar-btn { display:flex; align-items:center; gap:8px; width:100%; padding:7px 14px; border:none; background:none; color:#bbb; font-size:12px; font-family:inherit; cursor:pointer; text-align:left; border-radius:0; }
.as-sidebar-btn:hover { background:#2e2e2e; color:#fff; }
.as-sidebar-btn.active { background:#094771; color:#fff; }
.as-sidebar-sep { height:1px; background:#333; margin:6px 10px; }
.as-main { flex:1; overflow-y:auto; padding:16px; }
.as-section-label { font-size:11px; color:#666; text-transform:uppercase; letter-spacing:.06em; margin:0 0 10px; }
.as-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:12px; }
.as-card { background:#2a2a2a; border:1px solid #3a3a3a; border-radius:8px; padding:14px; display:flex; flex-direction:column; gap:8px; transition:border-color .15s, background .15s; }
.as-card:hover { border-color:#555; background:#2f2f2f; }
.as-card-header { display:flex; align-items:center; gap:10px; }
.as-card-icon { width:40px; height:40px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:28px; }
.as-card-icon img { width:40px; height:40px; object-fit:contain; }
.as-card-meta { min-width:0; }
.as-card-name { font-size:13px; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.as-card-ver  { font-size:11px; color:#666; margin-top:1px; }
.as-card-desc { font-size:11px; color:#999; line-height:1.5; flex:1; }
.as-card-author { font-size:10px; color:#555; }
.as-card-footer { display:flex; justify-content:flex-end; margin-top:2px; }
.as-install-btn { padding:5px 16px; border-radius:4px; border:1px solid #3b82f6; background:#1d4ed8; color:#fff; font-size:12px; cursor:pointer; font-family:inherit; }
.as-install-btn:hover { background:#2563eb; }
.as-install-btn:disabled { opacity:.5; cursor:default; }
.as-uninstall-btn { padding:5px 16px; border-radius:4px; border:1px solid #555; background:#3a3a3a; color:#f87171; font-size:12px; cursor:pointer; font-family:inherit; }
.as-uninstall-btn:hover { background:#4a4a4a; }
.as-uninstall-btn:disabled { opacity:.5; cursor:default; }
.as-installed-badge { font-size:10px; color:#4ade80; display:flex; align-items:center; gap:4px; }
.as-statusbar { display:flex; align-items:center; gap:16px; padding:5px 12px; background:#252526; border-top:1px solid #1a1a1a; font-size:11px; color:#666; flex-shrink:0; }
.as-empty { text-align:center; color:#555; padding:60px 20px; font-size:13px; }
.as-empty svg { display:block; margin:0 auto 12px; opacity:.3; }
.as-installing-bar { height:3px; background:#3b82f6; width:0%; transition:width .2s; border-radius:2px; margin-top:6px; }
`;
            document.head.appendChild(s);
        }

        const W = 860, H = 580;
        const windowId = 'win_' + (++winCount);
        const offset = (winCount - 1) * 28;
        const left = Math.min(60 + offset, window.innerWidth - W - 20);
        const top = Math.min(50 + offset, window.innerHeight - H - 60);

        const win = document.createElement('div');
        win.className = 'app-window';
        win.id = windowId;
        win.style.cssText = `left:${left}px;top:${top}px;width:${W}px;height:${H}px;`;
        win.addEventListener('mousedown', () => focusWindow(windowId));

        win.innerHTML = `
        <div class="title-bar">
            <button class="window-close-button" title="Close">✕</button>
            <button class="window-minimize-button" title="Minimize">—</button>
            <button class="window-maximize-button" title="Maximize">□</button>
            <span class="title-bar-text"><span id="as-tbicon-${windowId}"></span> App Store</span>
        </div>
        <div class="app-body" id="as-body-${windowId}"
             style="height:calc(100% - var(--titlebar-height));overflow:hidden;display:flex;flex-direction:column;"></div>
    `;

        document.getElementById('windowContainer').appendChild(win);
        windows[windowId] = { el: win, state: { type: 'appstore' }, taskbarBtn: null };

        // Load title bar icon
        loadIconImg('/usr/share/icons/32/appstore.png', './icons/32/appstore.png',
            'width:16px;height:16px;object-fit:contain;vertical-align:middle;')
            .then(img => {
                img.className = 'app-icon-title-bar';
                const wrap = document.getElementById(`as-tbicon-${windowId}`);
                if (wrap) wrap.appendChild(img);
            }).catch(() => {
                const wrap = document.getElementById(`as-tbicon-${windowId}`);
                if (wrap) wrap.textContent = '🏪';
            });

        win.querySelector('.title-bar').addEventListener('mousedown', e => {
            if (e.target.closest('button')) return;
            startDrag(e, win);
        });
        win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
        win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);
        win.querySelector('.window-maximize-button').onclick = () => maximizeWindow(windowId);

        // Taskbar button
        const tbBtn = document.createElement('button');
        tbBtn.className = 'win-btn';
        tbBtn.dataset.winid = windowId;
        tbBtn.textContent = '🏪 App Store';
        tbBtn.onclick = () => {
            if (win.style.display === 'none') { win.style.display = ''; focusWindow(windowId); }
            else focusWindow(windowId);
        };
        tbBtn.oncontextmenu = ev => {
            ev.preventDefault();
            buildMenu(ev.clientX, ev.clientY, [
                { label: 'Close', icon: 'close', action: () => closeWindow(windowId) }
            ]);
        };
        document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));
        windows[windowId].taskbarBtn = tbBtn;

        _buildAppStoreUI(windowId);
        focusWindow(windowId);
        return windowId;
    }

    function _buildAppStoreUI(windowId) {
        const body = document.getElementById(`as-body-${windowId}`);
        if (!body) return;

        // ── Root layout ─────────────────────────────────────────────
        const root = document.createElement('div');
        root.className = 'as-root';
        body.appendChild(root);

        // ── Toolbar ──────────────────────────────────────────────────
        const toolbar = document.createElement('div');
        toolbar.className = 'as-toolbar';
        const titleEl = document.createElement('span');
        titleEl.className = 'as-toolbar-title';
        titleEl.textContent = '🏪 App Store';
        toolbar.appendChild(titleEl);
        const search = document.createElement('input');
        search.className = 'as-search';
        search.type = 'text';
        search.placeholder = 'Search apps…';
        toolbar.appendChild(search);
        root.appendChild(toolbar);

        // ── Body ─────────────────────────────────────────────────────
        const bodyRow = document.createElement('div');
        bodyRow.className = 'as-body';
        root.appendChild(bodyRow);

        // ── Sidebar ──────────────────────────────────────────────────
        const sidebar = document.createElement('div');
        sidebar.className = 'as-sidebar';
        bodyRow.appendChild(sidebar);

        const categories = [
            { id: 'all', label: 'All Apps' },
            { id: 'installed', label: 'Installed' },
            { sep: true },
            { id: 'accessories', label: 'Accessories' },
            { id: 'graphics', label: 'Graphics' },
            { id: 'internet', label: 'Internet' },
            { id: 'office', label: 'Office' },
            { id: 'system', label: 'System' },
            { id: 'games', label: 'Games' },
        ];

        let activeCategory = 'all';
        const catBtns = [];

        for (const cat of categories) {
            if (cat.sep) {
                const sep = document.createElement('div');
                sep.className = 'as-sidebar-sep';
                sidebar.appendChild(sep);
                continue;
            }
            const btn = document.createElement('button');
            btn.className = 'as-sidebar-btn' + (cat.id === 'all' ? ' active' : '');
            btn.textContent = cat.label;
            btn.onclick = () => {
                activeCategory = cat.id;
                catBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                search.value = '';
                renderGrid();
            };
            sidebar.appendChild(btn);
            catBtns.push(btn);
        }

        // ── Main area ─────────────────────────────────────────────────
        const main = document.createElement('div');
        main.className = 'as-main';
        bodyRow.appendChild(main);

        // ── Status bar ───────────────────────────────────────────────
        const statusBar = document.createElement('div');
        statusBar.className = 'as-statusbar';
        const statusLeft = document.createElement('span');
        const statusRight = document.createElement('span');
        statusRight.style.marginLeft = 'auto';
        statusBar.appendChild(statusLeft);
        statusBar.appendChild(statusRight);
        root.appendChild(statusBar);

        // ── Render logic ─────────────────────────────────────────────
        function getFilteredApps(query) {
            const installed = getInstalled();
            const q = query.toLowerCase().trim();

            let apps = CATALOG;

            if (activeCategory === 'installed') {
                // Show installed apps (may not be in current CATALOG — pulled from storage)
                apps = Object.values(installed).map(meta => {
                    const catalogEntry = CATALOG.find(c => c.id === meta.id);
                    return catalogEntry || {
                        id: meta.id, name: meta.name,
                        version: meta.version, description: '(installed)',
                        author: '', category: meta.category || 'accessories',
                        emoji: meta.emoji || '📦',
                    };
                });
            } else if (activeCategory !== 'all') {
                apps = apps.filter(a => (a.category || 'accessories') === activeCategory);
            }

            if (q) apps = apps.filter(a => (a.name + ' ' + (a.description || '')).toLowerCase().includes(q));
            return apps;
        }

        function renderGrid(query = '') {
            main.innerHTML = '';
            const installed = getInstalled();
            const apps = getFilteredApps(query);

            const totalInstalled = Object.keys(installed).length;
            statusLeft.textContent = `${CATALOG.length} app${CATALOG.length !== 1 ? 's' : ''} available`;
            statusRight.textContent = `${totalInstalled} installed`;

            if (!apps.length) {
                const empty = document.createElement('div');
                empty.className = 'as-empty';
                empty.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                ${query ? 'No apps match your search.' : 'No apps in this category.'}
            `;
                main.appendChild(empty);
                return;
            }

            const sectionLabel = document.createElement('div');
            sectionLabel.className = 'as-section-label';
            sectionLabel.textContent = activeCategory === 'installed' ? 'Installed Apps'
                : activeCategory === 'all' ? 'All Apps'
                    : categories.find(c => c.id === activeCategory)?.label || activeCategory;
            main.appendChild(sectionLabel);

            const grid = document.createElement('div');
            grid.className = 'as-grid';
            main.appendChild(grid);

            for (const app of apps) {
                grid.appendChild(_makeCard(app, installed, renderGrid.bind(null, query)));
            }
        }

        search.oninput = () => {
            if (search.value.trim()) {
                catBtns.forEach(b => b.classList.remove('active'));
                activeCategory = 'all';
            } else {
                catBtns.forEach(b => b.classList.toggle('active', b.textContent === 'All Apps'));
                activeCategory = 'all';
            }
            renderGrid(search.value);
        };

        renderGrid();
    }

    function _makeCard(app, installedMap, onRefresh) {
        const isInstalled = app.id in installedMap;
        const card = document.createElement('div');
        card.className = 'as-card';

        // Header: icon + name/version
        const header = document.createElement('div');
        header.className = 'as-card-header';
        const iconWrap = document.createElement('div');
        iconWrap.className = 'as-card-icon';
        iconWrap.textContent = app.emoji || '📦'; // default until async load
        loadIconImg(
            `/usr/share/icons/32/${app.id}.png`,
            app.icon || `./apps/${app.id}.png`,
            'width:40px;height:40px;object-fit:contain;'
        ).then(img => {
            iconWrap.innerHTML = '';
            iconWrap.appendChild(img);
        }).catch(() => { /* keep emoji */ });

        const meta = document.createElement('div');
        meta.className = 'as-card-meta';
        const nameEl = document.createElement('div');
        nameEl.className = 'as-card-name';
        nameEl.textContent = app.name;
        const verEl = document.createElement('div');
        verEl.className = 'as-card-ver';
        verEl.textContent = `v${app.version || '?'}` + (app.author ? ` · ${app.author}` : '');
        meta.appendChild(nameEl);
        meta.appendChild(verEl);
        header.appendChild(iconWrap);
        header.appendChild(meta);
        card.appendChild(header);

        // Description
        if (app.description) {
            const desc = document.createElement('div');
            desc.className = 'as-card-desc';
            desc.textContent = app.description;
            card.appendChild(desc);
        }

        // Footer: installed badge + button
        const footer = document.createElement('div');
        footer.className = 'as-card-footer';
        footer.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';

        if (isInstalled) {
            const badge = document.createElement('div');
            badge.className = 'as-installed-badge';
            badge.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Installed`;
            footer.appendChild(badge);
        } else {
            footer.appendChild(document.createElement('span')); // spacer
        }

        const btn = document.createElement('button');
        const progBar = document.createElement('div');
        progBar.className = 'as-installing-bar';

        if (isInstalled) {
            btn.className = 'as-uninstall-btn';
            btn.textContent = 'Uninstall';
            btn.onclick = async () => {
                btn.disabled = true;
                btn.textContent = 'Removing…';
                try {
                    await uninstallApp(app.id);
                    onRefresh();
                } catch (err) {
                    spawnError(`Failed to uninstall ${app.name}: ${err.message}`);
                    btn.disabled = false;
                    btn.textContent = 'Uninstall';
                }
            };
        } else {
            btn.className = 'as-install-btn';
            btn.textContent = 'Install';
            btn.onclick = async () => {
                btn.disabled = true;
                btn.textContent = 'Installing…';
                progBar.style.width = '10%';
                try {
                    let lastPct = 10;
                    await installApp(app, (status) => {
                        // Animate progress bar loosely based on status messages
                        lastPct = Math.min(lastPct + 15, 90);
                        progBar.style.width = lastPct + '%';
                        btn.textContent = status || 'Installing…';
                    });
                    progBar.style.width = '100%';
                    setTimeout(() => onRefresh(), 200);
                } catch (err) {
                    spawnError(`Failed to install ${app.name}: ${err.message}`);
                    btn.disabled = false;
                    btn.textContent = 'Install';
                    progBar.style.width = '0%';
                }
            };
        }

        footer.appendChild(btn);
        card.appendChild(footer);
        card.appendChild(progBar);
        return card;
    }

    /* ============================================================
       Boot — re-register previously installed apps on page load
    ============================================================ */
    function _reRegisterInstalledApps() {
        const installed = getInstalled();
        for (const [id, meta] of Object.entries(installed)) {
            _registerInStartMenu(id, {
                id,
                name: meta.name,
                version: meta.version,
                emoji: meta.emoji || '📦',
                category: meta.category || 'accessories',
            });
        }
    }

    /* ============================================================
       Bootstrap
    ============================================================ */
    function _bootstrap() {
        // Register App Store itself in the start menu
        if (typeof registerStartMenuApp === 'function') {
            registerStartMenuApp({
                name: 'App Store',
                icon: '/usr/share/icons/32/appstore.png',
                iconFallback: './icons/32/appstore.png',
                emoji: '🏪',
                categories: ['all', 'system'],
                action: () => spawnAppStore(),
            });
        }

        // Restore previously installed apps into the start menu
        _reRegisterInstalledApps();
    }

    // Expose public API
    window.spawnAppStore = spawnAppStore;
    window.appStoreInstallApp = installApp;
    window.appStoreUninstallApp = uninstallApp;
    window.appStoreGetInstalled = getInstalled;
    window.appStoreCatalog = CATALOG;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _bootstrap);
    } else {
        setTimeout(_bootstrap, 0);
    }

})();
