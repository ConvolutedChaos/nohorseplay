/* ============================================================
   E-DOG OS — SETTINGS APP  (js/settings.js)
   Drop this file in js/ and add the script tag to index.html
============================================================ */

/* ---- Inject CSS ---- */
; (function injectSettingsStyles() {
    if (document.getElementById('settings-styles')) return;
    const s = document.createElement('style');
    s.id = 'settings-styles';
    s.textContent = `
    /* ---- Layout ---- */
    .settings-layout {
        display: flex;
        height: calc(100% - var(--titlebar-height) - 6px);
        background: #1a1a1a;
        overflow: hidden;
    }
    .settings-nav {
        width: 162px;
        min-width: 162px;
        background: #111;
        border-right: 1px solid #000;
        padding: 12px 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex-shrink: 0;
    }
    .settings-nav-item {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
        color: #999;
        font-size: 13px;
        font-family: var(--font-ui);
        transition: background .12s, color .12s;
        user-select: none;
    }
    .settings-nav-item:hover  { background: #1e1e1e; color: #ccc; }
    .settings-nav-item.active { background: #0c74df; color: #fff; }
    .snav-icon { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }

    /* ---- Content pane ---- */
    .settings-content {
        flex: 1;
        overflow-y: auto;
        padding: 22px 26px 26px;
        color: #ccc;
        font-family: var(--font-ui);
        font-size: 13px;
        background: #1a1a1a;
    }
    .settings-section-title {
        font-size: 19px;
        font-weight: 700;
        color: #eee;
        margin-bottom: 18px;
        padding-bottom: 10px;
        border-bottom: 1px solid #252525;
    }
    .settings-group-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: #555;
        margin-bottom: 10px;
    }

    /* ---- Theme cards ---- */
    .settings-theme-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .settings-theme-card {
        width: 116px;
        border-radius: 8px;
        border: 2px solid #252525;
        cursor: pointer;
        overflow: hidden;
        transition: border-color .15s, box-shadow .15s;
        position: relative;
        background: #111;
        flex-shrink: 0;
    }
    .settings-theme-card:hover  { border-color: #3a3a3a; }
    .settings-theme-card.selected {
        border-color: #3b82f6;
        box-shadow: 0 0 0 1px #3b82f6;
    }
    .stc-preview  { width: 116px; height: 74px; position: relative; overflow: hidden; }
    .stc-label    { padding: 6px 8px; font-size: 11px; font-weight: 600; color: #bbb; }
    .stc-check    {
        position: absolute; top: 5px; right: 5px;
        width: 16px; height: 16px; border-radius: 50%;
        background: #3b82f6; color: #fff; font-size: 9px;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: opacity .15s;
    }
    .settings-theme-card.selected .stc-check { opacity: 1; }

    /* ---- Wallpaper grid ---- */
    .settings-wp-grid    { display: flex; gap: 10px; flex-wrap: wrap; }
    .settings-wp-card {
        width: 94px;
        border-radius: 7px;
        border: 2px solid #252525;
        cursor: pointer;
        overflow: hidden;
        transition: border-color .15s, box-shadow .15s;
        position: relative;
        background: #111;
        flex-shrink: 0;
    }
    .settings-wp-card:hover  { border-color: #3a3a3a; }
    .settings-wp-card.selected {
        border-color: #3b82f6;
        box-shadow: 0 0 0 1px #3b82f6;
    }
    .settings-wp-preview {
        width: 94px; height: 58px;
        display: flex; align-items: center; justify-content: center;
        background: #1a1a1a;
        flex-shrink: 0;
    }
    .settings-wp-label {
        padding: 4px 6px;
        font-size: 10px;
        font-weight: 600;
        color: #999;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .settings-wp-check {
        position: absolute; top: 4px; right: 4px;
        width: 14px; height: 14px; border-radius: 50%;
        background: #3b82f6; color: #fff; font-size: 8px;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: opacity .15s;
    }
    .settings-wp-card.selected .settings-wp-check { opacity: 1; }
    .settings-wp-actions {
        margin-top: 10px;
        display: flex; gap: 8px; align-items: center;
    }

    /* ---- Fit buttons ---- */
    .settings-wp-fit-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .settings-fit-btn {
        padding: 5px 13px;
        border-radius: 5px;
        border: 1px solid #2a2a2a;
        background: #111;
        color: #777;
        cursor: pointer;
        font-size: 12px;
        font-family: var(--font-ui);
        transition: all .12s;
    }
    .settings-fit-btn:hover   { border-color: #3a3a3a; color: #ccc; }
    .settings-fit-btn.selected{ border-color: #3b82f6; color: #fff; background: #0c3a6a; }

    /* ---- System form ---- */
    .settings-form { display: flex; flex-direction: column; gap: 0; }
    .settings-form-row {
        display: flex; align-items: center; gap: 10px;
    }
    .settings-form-label {
        width: 130px; flex-shrink: 0; color: #777; font-size: 13px;
    }
    .settings-form-input {
        flex: 1;
        background: #0f0f0f;
        border: 1px solid #2e2e2e;
        border-radius: 6px;
        color: #e0e0e0;
        padding: 7px 10px;
        font-size: 13px;
        outline: none;
        font-family: monospace;
        transition: border-color .15s;
    }
    .settings-form-input:focus { border-color: #3b82f6; }
    .settings-form-select {
        background: #0f0f0f;
        border: 1px solid #2e2e2e;
        border-radius: 6px;
        color: #e0e0e0;
        padding: 7px 8px;
        font-size: 13px;
        outline: none;
        font-family: monospace;
        cursor: pointer;
        transition: border-color .15s;
    }
    .settings-form-select:focus { border-color: #3b82f6; }
    :root.theme-aero2010 .settings-form-select { background: #fff; border-color: #a8c0d8; color: #1a3050; }
    .settings-form-hint {
        font-size: 11px; color: #4a4a4a;
        margin-top: 6px; padding-left: 140px;
    }
    .settings-danger-row {
        display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    }
    .settings-devices-row {
        display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    }
    .settings-danger-btn {
        padding: 7px 14px;
        border-radius: 6px;
        border: 1px solid #5a1a1a;
        background: #2a0e0e;
        color: #f87171;
        cursor: pointer;
        font-size: 13px;
        font-family: var(--font-ui);
        transition: background .12s;
    }
    .settings-danger-btn:hover { background: #3a1515; }
    .settings-danger-hint { font-size: 11px; color: #4a4a4a; max-width: 260px; }

    /* ---- About ---- */
    .settings-about-card {
        display: flex; align-items: flex-start; gap: 18px;
        background: #111; border: 1px solid #222;
        border-radius: 10px; padding: 20px 22px;
    }
    .settings-about-logo   { font-size: 46px; line-height: 1; flex-shrink: 0; }
    .settings-about-name   { font-size: 15px; font-weight: 700; color: #eee; margin-bottom: 6px; }
    .settings-about-detail { font-size: 12px; color: #666; line-height: 1.5; }
    .settings-about-env    { margin-top: 8px; }
    .settings-about-row {
        display: flex; padding: 7px 0;
        border-bottom: 1px solid #1e1e1e;
        font-size: 12px; gap: 12px;
    }
    .settings-about-row:last-child { border-bottom: none; }
    .sar-key { width: 120px; flex-shrink: 0; color: #555; }
    .sar-val { color: #999; word-break: break-all; font-family: monospace; font-size: 11px; }

    /* ---- Aero 2010 overrides ---- */
    :root.theme-aero2010 .settings-layout  { background: #e8f0f8; }
    :root.theme-aero2010 .settings-nav     { background: linear-gradient(180deg,#dce8f4,#c8d8ec); border-right: 1px solid #aac0d8; }
    :root.theme-aero2010 .settings-nav-item { color: #2a4a6a; }
    :root.theme-aero2010 .settings-nav-item:hover  { background: rgba(255,255,255,.5); }
    :root.theme-aero2010 .settings-nav-item.active { background: linear-gradient(180deg,#5b9bd5,#2e6db0); color: #fff; }
    :root.theme-aero2010 .settings-content { background: linear-gradient(180deg,#f8fafe,#f0f4fc); color: #1a3050; }
    :root.theme-aero2010 .settings-section-title { color: #1a3a5c; border-bottom-color: #c8d8e8; }
    :root.theme-aero2010 .settings-group-label { color: #6a8aaa; }
    :root.theme-aero2010 .settings-form-input { background: #fff; border-color: #a8c0d8; color: #1a3050; }
    :root.theme-aero2010 .settings-about-card { background: #fff; border-color: #c8d8e8; }
    :root.theme-aero2010 .settings-about-name  { color: #1a3050; }
    :root.theme-aero2010 .settings-about-row   { border-bottom-color: #dce8f4; }
    :root.theme-aero2010 .sar-key { color: #6a8aaa; }
    :root.theme-aero2010 .sar-val { color: #4a6a8a; }
    `;
    document.head.appendChild(s);
})();

/* ============================================================
   Wallpaper management
============================================================ */
const WP_CHOICE_KEY = 'edog_wp_choice';  // 'theme' | 'none' | 'custom' | fs-path
const WP_CUSTOM_KEY = 'edog_wp_path';    // VFS path of user-uploaded wallpaper
const WP_FIT_KEY = 'edog_wp_fit';     // cover | contain | 100% 100% | auto

async function _applyWallpaperOverride() {
    const choice = localStorage.getItem(WP_CHOICE_KEY);
    if (!choice || choice === 'theme') return;  // let theme default handle it

    const fit = localStorage.getItem(WP_FIT_KEY) || 'cover';

    function _setWallpaper(cssUrl) {
        if (cssUrl === null) {
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = '#111';
        } else {
            document.body.style.backgroundImage = cssUrl;
            document.body.style.backgroundSize = fit;
            document.body.style.backgroundPosition = 'center center';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.height = '100vh';
            document.body.style.margin = '0';
        }
    }

    if (choice === 'none') { _setWallpaper(null); return; }
    if (choice === 'custom') {
        const path = localStorage.getItem(WP_CUSTOM_KEY);
        if (path) {
            try {
                const css = await imgFromFS(path, { background: true });
                if (css) _setWallpaper(css);
            } catch (e) { /* custom wallpaper missing from VFS — skip */ }
        }
        return;
    }
    // Preset path stored in VFS
    try {
        const css = await imgFromFS(choice, { background: true });
        if (css) _setWallpaper(css);
    } catch (e) { /* wallpaper file not in VFS yet — silently skip */ }
}

/* Patch applyTheme to run wallpaper override afterward */
; (function patchApplyTheme() {
    const _orig = window.applyTheme;
    if (!_orig) return;
    window.applyTheme = async function (theme) {
        await _orig(theme);
        await _applyWallpaperOverride();
    };
})();

/* Patch toggleThemePicker to open settings instead */
window.toggleThemePicker = function (ev) {
    if (ev) ev.stopPropagation();
    spawnSettings('appearance');
};

/* Patch startMenuAction to route 'about' → settings about tab */
; (function patchStartMenuAction() {
    const _orig = window.startMenuAction;
    window.startMenuAction = async function (action) {
        if (action === 'settings') {
            if (typeof closeStartMenu === 'function') closeStartMenu();
            spawnSettings('appearance');
        } else if (action === 'about') {
            if (typeof closeStartMenu === 'function') closeStartMenu();
            spawnSettings('about');
        } else {
            return _orig && _orig(action);
        }
    };
})();

/* Apply wallpaper override once on first load */
window.addEventListener('load', () => setTimeout(_applyWallpaperOverride, 600));

/* ============================================================
   Settings window factory
============================================================ */
function spawnSettings(initialSection = 'appearance') {
    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 28;
    const left = Math.min(100 + offset, window.innerWidth - 700);
    const top = Math.min(60 + offset, window.innerHeight - 530);

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.cssText = `left:${left}px;top:${top}px;width:680px;height:510px;`;
    win.addEventListener('mousedown', () => focusWindow(windowId));

    win.innerHTML = `
        <div class="title-bar" data-winid="${windowId}">
            <button class="window-close-button" title="Close">✕</button>
            <button class="window-minimize-button" title="Minimize">—</button>
            <button class="window-maximize-button" title="Maximize">□</button>
            <span class="title-bar-text"><img class="app-icon-title-bar" src="icons/16/settings.png"> Settings</span>
        </div>
        <div class="settings-layout">
            <nav class="settings-nav" id="settings-nav-${windowId}"></nav>
            <div class="settings-content" id="settings-content-${windowId}"></div>
        </div>
    `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'settings' } };

    win.querySelector('.title-bar').addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);
    win.querySelector('.window-maximize-button').onclick = () => maximizeWindow(windowId);

    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.innerHTML = '<img class="app-icon-title-bar" src="icons/16/settings.png"> Settings';
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [{ label: 'Close', icon: 'delete', action: () => closeWindow(windowId) }]);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));
    windows[windowId].taskbarBtn = tbBtn;

    _buildSettingsNav(windowId, initialSection);
    focusWindow(windowId);
    return windowId;
}

/* ---- Navigation sidebar ---- */
const _SETTINGS_SECTIONS = [
    { id: 'appearance', label: 'Appearance', icon: '<img style="margin-top: 5px;" src="icons/16/settings-backgrounds.png">' },
    { id: 'system', label: 'System', icon: '<img style="margin-top: 5px;" src="icons/16/settings.png">' },
    { id: 'experimental', label: 'Experimental', icon: '<img style="margin-top: 5px;" src="icons/16/terminal.png">' },
    { id: 'about', label: 'About', icon: '<img style="margin-top: 5px;" src="icons/16/settings-about.png">' },
];

function _buildSettingsNav(windowId, activeSection) {
    const nav = document.getElementById(`settings-nav-${windowId}`);
    const content = document.getElementById(`settings-content-${windowId}`);
    if (!nav || !content) return;

    _SETTINGS_SECTIONS.forEach(sec => {
        const item = document.createElement('div');
        item.className = 'settings-nav-item' + (sec.id === activeSection ? ' active' : '');
        item.innerHTML = `<span class="snav-icon">${sec.icon}</span><span>${sec.label}</span>`;
        item.onclick = () => {
            nav.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            _renderSettingsSection(sec.id, content);
        };
        nav.appendChild(item);
    });

    _renderSettingsSection(activeSection, content);
}

function _renderSettingsSection(id, el) {
    el.innerHTML = '';
    if (id === 'appearance') _buildAppearanceSection(el);
    else if (id === 'system') _buildSystemSection(el);
    else if (id === 'experimental') _buildExperimentalSection(el);
    else if (id === 'about') _buildAboutSection(el);
}

function _buildExperimentalSection(el) {
    if (typeof window._mmBuildSettingsSection === 'function') {
        window._mmBuildSettingsSection(el);
    } else {
        el.innerHTML = `
            <div class="settings-section-title">Experimental</div>
            <div style="color:#555; font-size:13px;">No experimental features are currently loaded.</div>
        `;
    }
}

/* ============================================================
   APPEARANCE section
============================================================ */
async function _buildAppearanceSection(el) {
    el.innerHTML = `
        <div class="settings-section-title">Appearance</div>
        <div class="settings-group-label">Theme</div>
        <div class="settings-theme-row" id="st-theme-row"></div>
        <div class="settings-group-label" style="margin-top:24px;">Wallpaper</div>
        <div class="settings-wp-grid"    id="st-wp-grid"></div>
        <div class="settings-wp-actions" id="st-wp-actions"></div>
        <div class="settings-group-label" style="margin-top:18px;">Wallpaper Fit</div>
        <div class="settings-wp-fit-row" id="st-wp-fit"></div>
    `;

    _buildThemeRow(el.querySelector('#st-theme-row'));
    await _buildWallpaperGrid(el.querySelector('#st-wp-grid'), el.querySelector('#st-wp-actions'));
    _buildFitRow(el.querySelector('#st-wp-fit'));
}

/* ---- Theme cards ---- */
function _buildThemeRow(el) {
    const currentT = localStorage.getItem('edog_theme') || 'dark';
    const themes = [
        { id: 'dark', label: 'Dark', html: _themePreviewHtml('dark') },
        { id: 'aero2010', label: 'Aero 2010', html: _themePreviewHtml('aero2010') },
    ];
    themes.forEach(t => {
        const card = document.createElement('div');
        card.className = 'settings-theme-card' + (currentT === t.id ? ' selected' : '');
        card.innerHTML = `
            <div class="stc-preview">${t.html}</div>
            <div class="stc-label">${t.label}</div>
            <div class="stc-check">✓</div>
        `;
        card.onclick = () => {
            el.querySelectorAll('.settings-theme-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            applyTheme(t.id);
        };
        el.appendChild(card);
    });
}

function _themePreviewHtml(id) {
    if (id === 'dark') return `
        <div style="width:100%;height:100%;background:#2b2b2b;position:relative;overflow:hidden;">
            <div style="height:10px;background:linear-gradient(#3a3a3a,#242424);display:flex;align-items:center;padding:0 3px;gap:2px;">
                <div style="width:5px;height:5px;border-radius:2px;background:#ff5f57;"></div>
                <div style="width:5px;height:5px;border-radius:2px;background:#ffbd2e;"></div>
            </div>
            <div style="height:7px;background:#1E1E1E;border-bottom:1px solid #000;"></div>
            <div style="display:flex;height:40px;">
                <div style="width:28%;background:#1E1E1E;border-right:1px solid #000;"></div>
                <div style="flex:1;background:#2D2D2D;"></div>
            </div>
            <div style="height:7px;background:#111;border-top:1px solid #333;position:absolute;bottom:0;left:0;right:0;"></div>
        </div>`;
    return `
        <div style="width:100%;height:100%;background:linear-gradient(135deg,#4a6e8a,#3a5a7a);position:relative;overflow:hidden;">
            <div style="height:12px;background:linear-gradient(#5b9bd5,#2e6db0);display:flex;align-items:center;padding:0 3px;gap:2px;">
                <div style="width:5px;height:5px;border-radius:50%;background:#ff6b6b;border:1px solid rgba(0,0,0,.3);"></div>
                <div style="width:5px;height:5px;border-radius:50%;background:#ffd060;border:1px solid rgba(0,0,0,.3);"></div>
            </div>
            <div style="height:8px;background:linear-gradient(#e8f0f8,#d0dce8);border-bottom:1px solid #aac0d8;"></div>
            <div style="display:flex;height:36px;">
                <div style="width:28%;background:linear-gradient(#dce8f4,#c8d8ec);border-right:1px solid rgba(120,160,200,.4);"></div>
                <div style="flex:1;background:linear-gradient(#f8fafe,#f0f4fc);"></div>
            </div>
            <div style="height:9px;background:linear-gradient(#3a6490,#1e3d6a);position:absolute;bottom:0;left:0;right:0;border-top:1px solid #1a3050;"></div>
        </div>`;
}

/* ---- Wallpaper grid ---- */
async function _buildWallpaperGrid(gridEl, actionsEl) {
    const currentChoice = localStorage.getItem(WP_CHOICE_KEY) || 'theme';

    const presets = [
        {
            id: 'theme',
            label: 'Theme Default',
            init: (p) => {
                p.style.background = 'linear-gradient(135deg,#1a1a1a,#2a2a2a)';
                p.innerHTML = '<span style="color:#444;font-size:11px;font-family:monospace;letter-spacing:.04em;">auto</span>';
            }
        },
        {
            id: '/usr/share/backgrounds/default-wallpaper.jpg',
            label: 'Dark Wallpaper',
            fsPath: '/usr/share/backgrounds/default-wallpaper.jpg',
        },
        {
            id: '/usr/share/backgrounds/wallpaper-2.jpg',
            label: 'Aero Wallpaper',
            fsPath: '/usr/share/backgrounds/wallpaper-2.jpg',
        },
        {
            id: 'none',
            label: 'Solid Black',
            init: (p) => {
                p.style.background = '#0a0a0a';
                p.innerHTML = '<span style="color:#333;font-size:22px;">∅</span>';
            }
        },
    ];

    for (const preset of presets) {
        const card = _makeWpCard(preset.id, preset.label, currentChoice === preset.id);
        const preview = card.querySelector('.settings-wp-preview');

        if (preset.init) {
            preset.init(preview);
        } else if (preset.fsPath) {
            // Load thumbnail asynchronously
            accessFile(preset.fsPath).then(file => {
                const data = file.contentType === 'binary' ? file.buffer : new TextEncoder().encode(file.text).buffer;
                const blob = new Blob([data], { type: file.mime || 'image/jpeg' });
                const url = URL.createObjectURL(blob);
                preview.style.cssText = `width:94px;height:58px;background-image:url("${url}");background-size:cover;background-position:center;`;
            }).catch(() => {
                preview.style.background = '#1a1a1a';
                preview.innerHTML = '<span style="color:#444;font-size:10px;">N/A</span>';
            });
        }

        card.onclick = () => {
            _deselectAllWpCards(gridEl);
            card.classList.add('selected');
            localStorage.setItem(WP_CHOICE_KEY, preset.id);
            applyTheme(localStorage.getItem('edog_theme') || 'dark');
        };
        gridEl.appendChild(card);
    }

    /* ---- Custom wallpaper card ---- */
    const customPath = localStorage.getItem(WP_CUSTOM_KEY);
    const customCard = _makeWpCard('custom', customPath ? 'Custom' : 'Upload…', currentChoice === 'custom');
    const customPreview = customCard.querySelector('.settings-wp-preview');
    const customLabel = customCard.querySelector('.settings-wp-label');

    if (customPath) {
        customPreview.style.background = '#141414';
        imgFromFS(customPath, { background: customPreview }).catch(() => {
            customPreview.style.background = '#1a1a1a';
            customPreview.innerHTML = '<span style="color:#444;font-size:10px;">N/A</span>';
        });
        customPreview.style.cssText = 'width:94px;height:58px;background-size:cover;background-position:center;';
    } else {
        customPreview.style.background = '#141414';
        customPreview.innerHTML = '<span style="color:#444;font-size:24px;line-height:1;">+</span>';
    }
    gridEl.appendChild(customCard);

    /* ---- File input ---- */
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    actionsEl.appendChild(fileInput);

    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = (file.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
        const username = (typeof getUsername === 'function') ? getUsername() : 'user';
        const vfsPath = `/home/${username}/.edogos/background.${ext}`;

        const ab = await file.arrayBuffer();

        // Write to VFS (overwrite if exists, create if not)
        let node;
        try {
            node = await accessFile(vfsPath);
        } catch {
            node = await createFile(vfsPath);
        }
        node.content = ab;
        node.size = ab.byteLength;
        node.mime = file.type;
        node.updatedAt = Date.now();
        await idbPut(node);

        localStorage.setItem(WP_CUSTOM_KEY, vfsPath);
        localStorage.setItem(WP_CHOICE_KEY, 'custom');

        const objUrl = URL.createObjectURL(new Blob([ab], { type: file.type }));
        customPreview.style.cssText = `width:94px;height:58px;background-image:url("${objUrl}");background-size:cover;background-position:center;`;
        customPreview.innerHTML = '';
        customLabel.textContent = 'Custom';
        _deselectAllWpCards(gridEl);
        customCard.classList.add('selected');
        _refreshClearBtn();
        applyTheme(localStorage.getItem('edog_theme') || 'dark');
    };

    customCard.onclick = () => {
        if (localStorage.getItem(WP_CUSTOM_KEY)) {
            _deselectAllWpCards(gridEl);
            customCard.classList.add('selected');
            localStorage.setItem(WP_CHOICE_KEY, 'custom');
            applyTheme(localStorage.getItem('edog_theme') || 'dark');
        } else {
            fileInput.value = '';
            fileInput.click();
        }
    };

    /* ---- Upload button ---- */
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'small-btn';
    uploadBtn.textContent = 'Upload Image';
    uploadBtn.onclick = () => { fileInput.value = ''; fileInput.click(); };
    actionsEl.appendChild(uploadBtn);

    let clearBtn = null;
    function _refreshClearBtn() {
        if (clearBtn) { clearBtn.remove(); clearBtn = null; }
        if (!localStorage.getItem(WP_CUSTOM_KEY)) return;
        clearBtn = document.createElement('button');
        clearBtn.className = 'small-btn';
        clearBtn.textContent = 'Remove Custom';
        clearBtn.style.marginLeft = '8px';
        clearBtn.onclick = async () => {
            const path = localStorage.getItem(WP_CUSTOM_KEY);
            if (path) {
                try {
                    const node = await accessFile(path);
                    await idbDelete(node.id);
                } catch { /* already gone */ }
            }
            localStorage.removeItem(WP_CUSTOM_KEY);
            if (localStorage.getItem(WP_CHOICE_KEY) === 'custom') {
                localStorage.setItem(WP_CHOICE_KEY, 'theme');
                customCard.classList.remove('selected');
                gridEl.querySelector('[data-wpid="theme"]')?.classList.add('selected');
                applyTheme(localStorage.getItem('edog_theme') || 'dark');
            }
            customPreview.style.cssText = '';
            customPreview.style.background = '#141414';
            customPreview.innerHTML = '<span style="color:#444;font-size:24px;line-height:1;">+</span>';
            customLabel.textContent = 'Upload…';
            _refreshClearBtn();
        };
        actionsEl.appendChild(clearBtn);
    }
    _refreshClearBtn();
}

function _makeWpCard(id, label, selected) {
    const card = document.createElement('div');
    card.className = 'settings-wp-card' + (selected ? ' selected' : '');
    card.dataset.wpid = id;
    card.innerHTML = `
        <div class="settings-wp-preview"></div>
        <div class="settings-wp-label">${label}</div>
        <div class="settings-wp-check">✓</div>
    `;
    return card;
}

function _deselectAllWpCards(gridEl) {
    gridEl.querySelectorAll('.settings-wp-card').forEach(c => c.classList.remove('selected'));
}

/* ---- Fit row ---- */
function _buildFitRow(el) {
    const fits = [
        { id: 'cover', label: 'Fill' },
        { id: 'contain', label: 'Fit' },
        { id: '100% 100%', label: 'Stretch' },
        { id: 'auto', label: 'Center' },
    ];
    const current = localStorage.getItem(WP_FIT_KEY) || 'cover';
    fits.forEach(f => {
        const btn = document.createElement('button');
        btn.className = 'settings-fit-btn' + (current === f.id ? ' selected' : '');
        btn.textContent = f.label;
        btn.onclick = () => {
            el.querySelectorAll('.settings-fit-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            localStorage.setItem(WP_FIT_KEY, f.id);
            applyTheme(localStorage.getItem('edog_theme') || 'dark');
        };
        el.appendChild(btn);
    });
}

/* ============================================================
   SYSTEM section
============================================================ */
function _buildSystemSection(el) {
    const username = (typeof getUsername === 'function' ? getUsername() : null) || localStorage.getItem('edog_username') || 'e-dog';
    const computername = (typeof getComputername === 'function' ? getComputername() : null) || localStorage.getItem('edog_computername') || 'edog-computer';

    el.innerHTML = `
        <div class="settings-section-title">System</div>
        <div class="settings-group-label">User Account</div>
        <div class="settings-form">
            <div class="settings-form-row">
                <label class="settings-form-label">Username</label>
                <input class="settings-form-input" id="sf-uname" value="${username}" autocomplete="off" spellcheck="false">
                <button class="small-btn" id="sf-uname-save">Apply</button>
            </div>
            <div class="settings-form-hint">Only lowercase letters, numbers, _ and - allowed. Reboot to fully apply.</div>
            <div class="settings-form-row" style="margin-top:16px;">
                <label class="settings-form-label">Computer Name</label>
                <input class="settings-form-input" id="sf-cname" value="${computername}" autocomplete="off" spellcheck="false">
                <button class="small-btn" id="sf-cname-save">Apply</button>
            </div>
        </div>
        <div class="settings-group-label" style="margin-top:26px;">File Explorer</div>
        <div class="settings-form-row" style="gap:10px;align-items:center;">
            <input type="checkbox" id="sf-show-hidden" style="width:16px;height:16px;cursor:pointer;accent-color:#0c74df;" ${localStorage.getItem('edog_show_hidden') === 'true' ? 'checked' : ''}>
            <label for="sf-show-hidden" style="cursor:pointer;user-select:none;">Show hidden files and folders (names starting with <code style="font-size:11px;background:#1a1a1a;padding:1px 4px;border-radius:3px;">.</code>)</label>
        </div>
        <div class="settings-group-label" style="margin-top:26px;">Danger Zone</div>
        <div class="settings-danger-row">
            <button class="settings-danger-btn" id="sf-wipe">Wipe All Files &amp; Folders</button>
            <span class="settings-danger-hint">Permanently deletes the virtual filesystem. This cannot be undone.</span>
        </div>
        <div class="settings-group-label" style="margin-top:26px;">Devices</div>
        <div class="settings-form-hint" style="margin-bottom:10px;">Insert a virtual USB drive into the system.</div>
        <div class="settings-form-row">
            <label class="settings-form-label">Name</label>
            <input class="settings-form-input" id="usb-name" value="USB" autocomplete="off" spellcheck="false">
        </div>
        <div class="settings-form-row" style="margin-top:8px;">
            <label class="settings-form-label">Size</label>
            <input class="settings-form-input" id="usb-size" type="number" min="1" value="8" style="width:80px;" autocomplete="off">
            <select class="settings-form-select" id="usb-unit">
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="GB" selected>GB</option>
                <option value="TB">TB</option>
            </select>
        </div>
        <div class="settings-form-row" style="margin-top:10px;gap:8px;">
            <button class="small-btn" id="sf-usb-insert">Insert USB</button>
            <button class="small-btn" id="sf-usb-eject">Eject USB</button>
        </div>
        <div class="settings-form-hint" id="sf-usb-status" style="margin-top:6px;min-height:1em;"></div>
    `;

    el.querySelector('#sf-show-hidden').onchange = (e) => {
        localStorage.setItem('edog_show_hidden', e.target.checked ? 'true' : 'false');
        if (typeof renderAllWindows === 'function') renderAllWindows();
    };

    el.querySelector('#sf-uname-save').onclick = () => {
        const val = el.querySelector('#sf-uname').value.trim();
        if (!val || !/^[a-z0-9_-]+$/.test(val)) {
            alert('Username must only contain lowercase letters, numbers, underscores, or hyphens.');
            return;
        }
        localStorage.setItem('edog_username', val);
        _flashSave(el.querySelector('#sf-uname-save'));
    };

    el.querySelector('#sf-cname-save').onclick = () => {
        const val = el.querySelector('#sf-cname').value.trim();
        if (!val) return;
        localStorage.setItem('edog_computername', val);
        _flashSave(el.querySelector('#sf-cname-save'));
    };

    const _usbStatus = (msg, color = '') => {
        const s = el.querySelector('#sf-usb-status');
        if (s) { s.textContent = msg; s.style.color = color; }
    };

    el.querySelector('#sf-usb-insert').onclick = async () => {
        const label = el.querySelector('#usb-name').value.trim();
        if (!label) { _usbStatus('Enter a USB name.', '#f87171'); return; }
        const sizeVal = parseFloat(el.querySelector('#usb-size').value);
        if (!sizeVal || sizeVal <= 0) { _usbStatus('Enter a valid size.', '#f87171'); return; }
        const unit = el.querySelector('#usb-unit').value;
        const multipliers = { KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
        const capacityBytes = Math.round(sizeVal * multipliers[unit]);
        if (typeof insertUSB !== 'function') { _usbStatus('insertUSB not available.', '#f87171'); return; }
        const entry = await insertUSB(label, [], capacityBytes);
        if (entry) {
            _usbStatus(`"${label}" inserted (${sizeVal} ${unit}).`, '#4ade80');
        }
    };

    el.querySelector('#sf-usb-eject').onclick = async () => {
        const label = el.querySelector('#usb-name').value.trim();
        if (!label) { _usbStatus('Enter the USB name to eject.', '#f87171'); return; }
        if (typeof removeUSB !== 'function') { _usbStatus('removeUSB not available.', '#f87171'); return; }
        await removeUSB(label);
        _usbStatus(`"${label}" ejected.`, '#4ade80');
    };

    el.querySelector('#sf-wipe').onclick = () => {
        if (!confirm('Permanently wipe ALL files and folders?\n\nThis cannot be undone.')) return;
        try {
            if (typeof dbPromise !== 'undefined' && dbPromise?.close) dbPromise.close();
        } catch (e) { }
        if (typeof _tmpFolderId !== 'undefined') _tmpFolderId = null;
        localStorage.removeItem('edog_mounts');
        const r = indexedDB.deleteDatabase('VirtualFS_v2');
        r.onsuccess = () => location.reload();
        r.onerror = () => alert('Failed to wipe storage.');
        r.onblocked = () => location.reload();
    };
}

function _flashSave(btn) {
    const orig = btn.textContent;
    btn.textContent = '✓ Saved';
    btn.style.color = '#4ade80';
    setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 2000);
}

/* ============================================================
   ABOUT section
============================================================ */
function _buildAboutSection(el) {
    const ver = (typeof VERSION !== 'undefined') ? VERSION : 'E-Dog OS';
    const ua = navigator.userAgent;
    const browser = ua.includes('Firefox') ? 'Firefox'
        : ua.includes('Edg/') ? 'Edge'
            : ua.includes('Chrome') ? 'Chrome'
                : ua.includes('Safari') ? 'Safari'
                    : 'Unknown';

    el.innerHTML = `
        <div class="settings-section-title">About</div>
        <div class="settings-about-card">
            <div class="settings-about-logo"><img style="width:64px;height:64px;" src="../../../img/cheeky_man.png"></div>
            <div>
                <div class="settings-about-name">${ver}</div>
                <div class="settings-about-detail">A virtual desktop environment running entirely in your browser.</div>
                <div class="settings-about-detail" style="margin-top:6px;">Powered by IndexedDB, Vanilla JS, and HTML5.</div>
            </div>
        </div>
        <div class="settings-group-label" style="margin-top:22px;">Environment</div>
        <div class="settings-about-env" id="sf-env-rows"></div>
    `;

    const env = el.querySelector('#sf-env-rows');

    const staticRows = [
        ['Browser', browser],
        ['Platform', navigator.platform || 'Unknown'],
        ['Filesystem', 'IndexedDB · VirtualFS_v2'],
        ['Storage API', navigator.storage ? 'StorageManager available' : 'Unavailable'],
    ];
    staticRows.forEach(([k, v]) => _addEnvRow(env, k, v));

    if (navigator.storage?.estimate) {
        navigator.storage.estimate().then(({ usage = 0, quota = 0 }) => {
            const pct = quota > 0 ? ((usage / quota) * 100).toFixed(1) : '0';
            const fn = typeof formatBytes === 'function' ? formatBytes : (b) => `${b} B`;
            _addEnvRow(env, 'Storage Used', `${fn(usage)} / ${fn(quota)} (${pct}%)`);
        });
    }
}

function _addEnvRow(container, key, value) {
    const row = document.createElement('div');
    row.className = 'settings-about-row';
    row.innerHTML = `<span class="sar-key">${key}</span><span class="sar-val">${value}</span>`;
    container.appendChild(row);
}

/* ---- Public API ---- */
window.spawnSettings = spawnSettings;