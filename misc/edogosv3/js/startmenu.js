/* ============================================================
   START MENU — Unity-style Dash Controller
   
   This replaces the static start menu HTML with a dynamic
   two-column layout: categories on the left, apps on the right.
   
   Add <script src="js/startmenu.js"></script> AFTER script.js
   in index.html.
============================================================ */

(function () {

    /* ── App registry ────────────────────────────────────── */
    // Each app has: name, icon (img path), emoji fallback,
    // action (function), and category tags.
    const APP_REGISTRY = [
        {
            name: 'File Explorer',
            icon: '/usr/share/icons/32/folder.png',
            emoji: '🗂',
            categories: ['all', 'system'],
            action: () => startMenuAction('newWindow'),
        },
        {
            name: 'Bacon Explorer',
            icon: '/usr/share/icons/32/browser.png',
            emoji: '🌐',
            categories: ['all', 'internet'],
            action: () => startMenuAction('openBacon'),
        },
        {
            name: 'Terminal',
            icon: '/usr/share/icons/32/terminal.png',
            emoji: '⌨',
            categories: ['all', 'system'],
            action: () => startMenuAction('openTerminal'),
        },
        {
            name: 'Settings',
            icon: '/usr/share/icons/32/settings.png',
            emoji: '⚙',
            categories: ['all', 'preferences'],
            action: () => spawnSettings(),
        },
        {
            name: 'Paint',
            icon: '/usr/share/icons/32/paint.png',
            emoji: '🎨',
            categories: ['all', 'graphics'],
            action: () => spawnPaint(),
        },
        {
            name: 'Writer',
            icon: '/usr/share/icons/32/text-editor.png',
            emoji: '📝',
            categories: ['all', 'office'],
            action: () => spawnWriter(),
        },
        {
            name: 'Text Editor',
            icon: '/usr/share/icons/32/text-editor.png',
            emoji: '📄',
            categories: ['all', 'accessories'],
            action: () => spawnApp('editor', { name: 'Untitled', type: 'file', content: '' }),
        },
        {
            name: 'About',
            icon: '/usr/share/icons/32/settings-about.png',
            emoji: 'ℹ',
            categories: ['all', 'system'],
            action: () => spawnAbout(),
        },
        {
            name: 'Changelog',
            icon: '/usr/share/icons/32/settings-about.png',
            emoji: 'ℹ',
            categories: ['all', 'system'],
            action: () => openCustomAppFromPath("/usr/share/changelog.app"),
        },
        // {
        //     name: 'Calculator',
        //     icon: '/usr/share/icons/32/calculator.png',
        //     emoji: '🧮',
        //     categories: ['all', 'accessories'],
        //     action: () => openCustomAppFromPath("/bin/calculator.app"),
        // },
    ];

    /* ── Category definitions ────────────────────────────── */
    const CATEGORIES = [
        { id: 'all', label: 'All Apps', icon: '/usr/share/icons/categories/16/applications-other.png', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>` },
        { id: 'accessories', label: 'Accessories', icon: '/usr/share/icons/categories/16/applications-accessories.png', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>` },
        { id: 'graphics', label: 'Graphics', icon: '/usr/share/icons/categories/16/applications-graphics.png', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>` },
        { id: 'internet', label: 'Internet', icon: '/usr/share/icons/categories/16/applications-internet.png', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>` },
        { id: 'office', label: 'Office', icon: '/usr/share/icons/categories/16/applications-office.png', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>` },
        { id: 'system', label: 'System', icon: '/usr/share/icons/categories/16/applications-system.png', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>` },
        { id: 'preferences', label: 'Preferences', icon: '/usr/share/icons/16/settings.png', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>` },
        { sep: true },
        { id: 'places', label: 'Places', icon: '/usr/share/icons/16/folder.svg', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>` },
    ];

    /* ── Places list ─────────────────────────────────────── */
    function getPlaces() {
        const u = getUsername();
        return [
            { name: 'Home', path: `/home/${u}`, slug: 'home', color: '#5ba4ff' },
            { name: 'Desktop', path: `/home/${u}/Desktop`, slug: 'desktop', color: '#7dd3fc' },
            { name: 'Documents', path: `/home/${u}/Documents`, slug: 'documents', color: '#93c5fd' },
            { name: 'Downloads', path: `/home/${u}/Downloads`, slug: 'downloads', color: '#6ee7b7' },
            { name: 'Pictures', path: `/home/${u}/Pictures`, slug: 'pictures', color: '#f9a8d4' },
            { name: 'Music', path: `/home/${u}/Music`, slug: 'music', color: '#c4b5fd' },
            { name: 'Videos', path: `/home/${u}/Videos`, slug: 'videos', color: '#fcd34d' },
            { name: 'File System', path: '/', slug: 'root', color: '#94a3b8' },
            { name: 'Recycle Bin', path: '/tmp', slug: 'trash', color: '#f87171' },
        ];
    }

    /* ── Build the start menu DOM ────────────────────────── */
    function buildStartMenu() {
        const menu = document.getElementById('startMenu');
        if (!menu) return;

        // Clear old content
        menu.innerHTML = '';

        // -- Search --
        const searchWrap = document.createElement('div');
        searchWrap.className = 'sm-search';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'startSearch';
        searchInput.placeholder = 'Search applications…';
        searchInput.autocomplete = 'off';
        searchInput.spellcheck = false;
        searchWrap.appendChild(searchInput);
        menu.appendChild(searchWrap);

        // -- Body (categories + apps) --
        const body = document.createElement('div');
        body.className = 'sm-body';
        menu.appendChild(body);

        // Category sidebar
        const catSidebar = document.createElement('div');
        catSidebar.className = 'sm-categories';
        body.appendChild(catSidebar);

        let activeCategory = 'all';

        for (const cat of CATEGORIES) {
            if (cat.sep) {
                const sep = document.createElement('div');
                sep.className = 'sm-cat-sep';
                catSidebar.appendChild(sep);
                continue;
            }

            const btn = document.createElement('button');
            btn.className = 'sm-cat-btn' + (cat.id === 'all' ? ' active' : '');
            btn.dataset.category = cat.id;

            const iconSpan = document.createElement('span');
            iconSpan.className = 'sm-cat-icon';
            iconSpan.dataset.catIcon = cat.icon;
            iconSpan.dataset.catSvg = cat.svg;

            // Append the img from imgFromFS
            imgFromFS(cat.icon).then(img => {
                iconSpan.appendChild(img);
            }).catch(() => {
                // fallback: use SVG if loading fails
                iconSpan.innerHTML = cat.svg;
            });

            btn.appendChild(iconSpan);

            const label = document.createElement('span');
            label.textContent = cat.label;
            btn.appendChild(label);

            btn.onclick = () => {
                activeCategory = cat.id;
                catSidebar.querySelectorAll('.sm-cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                searchInput.value = '';
                renderApps();
            };

            catSidebar.appendChild(btn);
        }

        // Apps area (right side)
        const appsArea = document.createElement('div');
        appsArea.className = 'sm-apps-area';
        appsArea.id = 'smAppsArea';
        body.appendChild(appsArea);

        // No results message
        const noResults = document.createElement('div');
        noResults.className = 'sm-no-results';
        noResults.id = 'smNoResults';
        noResults.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span>No applications found</span>
        `;
        appsArea.appendChild(noResults);

        // -- Footer --
        const footer = document.createElement('div');
        footer.className = 'sm-footer';

        const versionSpan = document.createElement('span');
        versionSpan.className = 'sm-version';
        versionSpan.textContent = typeof VERSION !== 'undefined' ? VERSION : 'E-Dog OS';
        footer.appendChild(versionSpan);

        const rebootBtn = document.createElement('button');
        rebootBtn.className = 'sm-btn-danger';
        rebootBtn.textContent = 'Reboot';
        rebootBtn.onclick = () => { closeStartMenu(); startMenuAction('reboot'); };
        footer.appendChild(rebootBtn);

        const shutdownBtn = document.createElement('button');
        shutdownBtn.className = 'sm-btn-danger';
        shutdownBtn.textContent = 'Shut Down';
        shutdownBtn.onclick = () => { closeStartMenu(); startMenuAction('shutdown'); };
        footer.appendChild(shutdownBtn);

        menu.appendChild(footer);

        // -- Render apps --
        function renderApps(query = '') {
            const area = document.getElementById('smAppsArea');
            const noRes = document.getElementById('smNoResults');
            // Remove everything except noResults
            Array.from(area.children).forEach(c => { if (c !== noRes) c.remove(); });

            const q = query.toLowerCase().trim();
            const isPlaces = activeCategory === 'places' && !q;

            if (isPlaces) {
                // Show places list
                const places = getPlaces();
                const header = document.createElement('div');
                header.className = 'sm-section-header';
                header.textContent = 'Places';
                area.insertBefore(header, noRes);

                let count = 0;
                for (const place of places) {
                    const item = document.createElement('div');
                    item.className = 'sm-place-item';

                    const iconSpan = document.createElement('span');
                    iconSpan.className = 'sm-place-icon';

                    // Load the icon async
                    imgFromFS(`/usr/share/icons/16/folder-${place.slug}.svg`).then(img => {
                        iconSpan.appendChild(img);
                    }).catch(() => {
                        // fallback SVG if the file doesn't exist
                        iconSpan.innerHTML = SVG_ICONS[place.slug] || SVG_ICONS.folder;
                        iconSpan.style.color = place.color;
                    });

                    item.appendChild(iconSpan);

                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = place.name;
                    item.appendChild(nameSpan);

                    item.onclick = () => {
                        closeStartMenu();
                        spawnWindow(null, place.path);
                    };

                    area.insertBefore(item, noRes);
                    count++;
                }
                noRes.classList.toggle('visible', count === 0);
                return;
            }

            // Filter apps
            let filtered = APP_REGISTRY;
            if (q) {
                filtered = filtered.filter(app => app.name.toLowerCase().includes(q));
            } else if (activeCategory !== 'all') {
                filtered = filtered.filter(app => app.categories.includes(activeCategory));
            }

            if (filtered.length === 0) {
                noRes.classList.add('visible');
                return;
            }
            noRes.classList.remove('visible');

            // Group by category if showing all with no search
            if (activeCategory === 'all' && !q) {
                // Just show a flat grid
                const grid = document.createElement('div');
                grid.className = 'sm-app-grid';
                for (const app of filtered) {
                    grid.appendChild(makeAppTile(app));
                }
                area.insertBefore(grid, noRes);
            } else {
                const grid = document.createElement('div');
                grid.className = 'sm-app-grid';
                for (const app of filtered) {
                    grid.appendChild(makeAppTile(app));
                }
                area.insertBefore(grid, noRes);
            }
        }

        function makeAppTile(app) {
            const tile = document.createElement('div');
            tile.className = 'sm-app-tile';
            tile.dataset.appName = app.name;

            const iconWrap = document.createElement('div');
            iconWrap.className = 'sm-app-icon';
            tile.appendChild(iconWrap);

            // Load the icon asynchronously, append when ready
            imgFromFS(app.icon)
                .then(img => iconWrap.appendChild(img))
                .catch(() => {
                    if (app.iconFallback) {
                        imgFromFS(app.iconFallback)
                            .then(img => iconWrap.appendChild(img))
                            .catch(() => {
                                const emoji = document.createElement('span');
                                emoji.className = 'sm-emoji-icon';
                                emoji.textContent = app.emoji || '📦';
                                iconWrap.appendChild(emoji);
                            });
                    } else {
                        const emoji = document.createElement('span');
                        emoji.className = 'sm-emoji-icon';
                        emoji.textContent = app.emoji || '📦';
                        iconWrap.appendChild(emoji);
                    }
                });

            const name = document.createElement('span');
            name.className = 'sm-app-name';
            name.textContent = app.name;
            tile.appendChild(name);

            tile.onclick = () => {
                closeStartMenu();
                app.action();
            };

            return tile;
        }

        // -- Search handling --
        searchInput.oninput = () => {
            const q = searchInput.value;
            if (q.trim()) {
                // When searching, deselect category visually
                catSidebar.querySelectorAll('.sm-cat-btn').forEach(b => b.classList.remove('active'));
            } else {
                // Restore active category
                catSidebar.querySelectorAll('.sm-cat-btn').forEach(b =>
                    b.classList.toggle('active', b.dataset.category === activeCategory));
            }
            renderApps(q);
        };

        // Initial render
        renderApps();

        // Retry loading category icons that only have an SVG fallback
        function reloadCategoryIcons() {
            catSidebar.querySelectorAll('.sm-cat-icon').forEach(iconSpan => {
                if (iconSpan.querySelector('img')) return; // already loaded
                const iconPath = iconSpan.dataset.catIcon;
                if (!iconPath) return;
                imgFromFS(iconPath).then(img => {
                    iconSpan.innerHTML = '';
                    iconSpan.appendChild(img);
                }).catch(() => { /* keep SVG fallback */ });
            });
        }

        // Focus search on open
        const observer = new MutationObserver(() => {
            if (menu.classList.contains('open')) {
                reloadCategoryIcons();
                searchInput.value = '';
                renderApps();
                setTimeout(() => searchInput.focus(), 50);
            }
        });
        observer.observe(menu, { attributes: true, attributeFilter: ['class'] });
    }

    // -- Expose a way to register apps from other scripts --
    window._smAppRegistry = APP_REGISTRY;

    /**
     * Register a new app in the start menu.
     * Call from any script after startmenu.js loads.
     * 
     * @example
     * registerStartMenuApp({
     *   name: 'Calculator',
     *   icon: 'icons/16/calc.png',
     *   emoji: '🧮',
     *   categories: ['all', 'accessories'],
     *   action: () => openCustomAppFromPath('/usr/bin/calc.app'),
     * });
     */
    window.registerStartMenuApp = function (appDef) {
        APP_REGISTRY.push(appDef);
    };

    // Build on DOMContentLoaded or immediately if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildStartMenu);
    } else {
        // Defer slightly so script.js globals are available
        setTimeout(buildStartMenu, 0);
    }

    // Override filterStartApps to work with new search
    window.filterStartApps = function (query) {
        const input = document.getElementById('startSearch');
        if (input) {
            input.value = query;
            input.dispatchEvent(new Event('input'));
        }
    };

})();
