/* ============================================================
   E-Dog OS — Paint App  (js/paint.js)
   Add <script src="js/paint.js"></script> to index.html
   after settings.js
============================================================ */

; (function injectPaintStyles() {
    if (document.getElementById('paint-styles')) return;
    const s = document.createElement('style');
    s.id = 'paint-styles';
    s.textContent = `
    /* ---- Paint layout ---- */
    .paint-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        user-select: none;
        background: #1a1a1a;
    }

    /* ---- Menubar ---- */
    .paint-menubar {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 3px 8px;
        background: #141414;
        border-bottom: 1px solid #000;
        flex-shrink: 0;
    }
    .paint-menu-btn {
        padding: 3px 10px;
        border-radius: 4px;
        border: none;
        background: transparent;
        color: #888;
        cursor: pointer;
        font-size: 12px;
        font-family: var(--font-ui);
        transition: background .1s, color .1s;
    }
    .paint-menu-btn:hover { background: #252525; color: #ccc; }
    .paint-menu-btn.danger { color: #f87171; }
    .paint-menu-btn.danger:hover { background: #3a1a1a; }

    /* ---- Toolbar ---- */
    .paint-toolbar {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 4px 8px;
        background: #1a1a1a;
        border-bottom: 1px solid #000;
        flex-shrink: 0;
        flex-wrap: wrap;
        min-height: 42px;
    }
    .paint-tool-sep {
        width: 1px;
        height: 26px;
        background: #2a2a2a;
        margin: 0 4px;
        flex-shrink: 0;
    }
    .paint-tool-btn {
        width: 32px;
        height: 32px;
        border-radius: 5px;
        border: 1px solid transparent;
        background: transparent;
        color: #aaa;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: background .1s, border-color .1s, color .1s;
        padding: 0;
        flex-shrink: 0;
        line-height: 1;
    }
    .paint-tool-btn:hover { background: #252525; border-color: #333; color: #fff; }
    .paint-tool-btn.active {
        background: #0d2a4a;
        border-color: #3b82f6;
        color: #60a5fa;
    }
    .paint-tool-btn svg { width: 16px; height: 16px; pointer-events: none; }

    /* ---- Shape fill toggle ---- */
    .paint-fill-toggle { display: flex; gap: 2px; flex-shrink: 0; }
    .paint-fill-btn {
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #2a2a2a;
        background: transparent;
        color: #666;
        font-size: 13px;
        cursor: pointer;
        font-family: var(--font-ui);
        transition: all .1s;
        line-height: 1;
    }
    .paint-fill-btn:hover { border-color: #3a3a3a; color: #aaa; }
    .paint-fill-btn.active { background: #0d2a4a; border-color: #3b82f6; color: #60a5fa; }

    /* ---- Size slider ---- */
    .paint-size-area {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
        padding: 0 4px;
    }
    .paint-size-label { font-size: 11px; color: #555; white-space: nowrap; }
    .paint-size-slider { width: 72px; }
    .paint-size-dot-wrap {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    /* ---- Color area ---- */
    .paint-color-area {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 4px;
        flex-shrink: 0;
    }
    .paint-swatch-stack {
        position: relative;
        width: 38px;
        height: 30px;
        flex-shrink: 0;
    }
    .paint-swatch-bg {
        position: absolute;
        bottom: 0; right: 0;
        width: 22px; height: 22px;
        border: 2px solid #3a3a3a;
        border-radius: 3px;
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,.5);
    }
    .paint-swatch-fg {
        position: absolute;
        top: 0; left: 0;
        width: 22px; height: 22px;
        border: 2px solid #777;
        border-radius: 3px;
        cursor: pointer;
        box-shadow: 0 0 0 1px #000, 0 1px 4px rgba(0,0,0,.6);
    }
    .paint-swatch-swap {
        position: absolute;
        bottom: 1px; right: 1px;
        width: 11px; height: 11px;
        border-radius: 2px;
        border: 1px solid #444;
        background: #222;
        color: #888;
        font-size: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }
    .paint-swatch-swap:hover { color: #ccc; }

    .paint-palette {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        max-width: 204px;
    }
    .paint-palette-swatch {
        width: 16px;
        height: 16px;
        border-radius: 2px;
        cursor: pointer;
        border: 1px solid rgba(0,0,0,.25);
        flex-shrink: 0;
        transition: transform .1s, outline .1s;
    }
    .paint-palette-swatch:hover { transform: scale(1.25); z-index: 1; position: relative; }
    .paint-palette-swatch.active-fg { outline: 2px solid #3b82f6; outline-offset: 1px; }

    /* ---- Canvas area ---- */
    .paint-canvas-wrap {
        flex: 1;
        overflow: auto;
        background: #101010;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 20px;
        box-sizing: border-box;
    }
    .paint-canvas {
        display: block;
        box-shadow: 0 4px 28px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.06);
        /* checkerboard background (shows through transparent pixels) */
        background-color: #fff;
        background-image:
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%);
        background-size: 12px 12px;
        background-position: 0 0, 0 6px, 6px -6px, -6px 0;
        image-rendering: pixelated;
    }

    /* ---- Status bar ---- */
    .paint-statusbar {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 3px 12px;
        background: #141414;
        border-top: 1px solid #000;
        font-size: 11px;
        color: #555;
        flex-shrink: 0;
        font-family: monospace;
    }
    .paint-statusbar span:not(:last-child)::after {
        content: '';
        display: inline-block;
        width: 1px;
        height: 10px;
        background: #2a2a2a;
        margin-left: 16px;
        vertical-align: middle;
    }

    /* ============================================================
       SAVE DIALOG
    ============================================================ */
    .save-dialog-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.65);
        z-index: 500000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(3px);
        animation: sd-fadein .15s ease both;
    }
    @keyframes sd-fadein { from { opacity: 0; } to { opacity: 1; } }

    .save-dialog {
        width: 680px;
        height: 460px;
        background: #1a1a1a;
        border: 1px solid #2e2e2e;
        border-radius: 10px;
        box-shadow: 0 24px 80px rgba(0,0,0,.9), 0 1px 0 rgba(255,255,255,.04) inset;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: sd-slidein .18s ease both;
    }
    @keyframes sd-slidein {
        from { transform: scale(.95) translateY(-10px); opacity: 0; }
        to   { transform: scale(1) translateY(0); opacity: 1; }
    }

    .save-dialog-titlebar {
        display: flex;
        align-items: center;
        padding: 11px 14px;
        background: #141414;
        border-bottom: 1px solid #000;
        flex-shrink: 0;
        gap: 10px;
    }
    .save-dialog-title {
        font-size: 13px;
        font-weight: 600;
        color: #ddd;
        flex: 1;
    }
    .save-dialog-close {
        width: 22px; height: 22px;
        border-radius: 4px;
        border: none;
        background: transparent;
        color: #555;
        cursor: pointer;
        font-size: 13px;
        display: flex; align-items: center; justify-content: center;
        transition: background .1s;
    }
    .save-dialog-close:hover { background: #f87171; color: #fff; }

    .save-dialog-nav {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 6px 10px;
        background: #161616;
        border-bottom: 1px solid #000;
        flex-shrink: 0;
    }
    .save-dialog-nav-btn {
        width: 26px; height: 26px;
        border-radius: 5px;
        border: 1px solid #2e2e2e;
        background: #222;
        color: #888;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background .1s;
        flex-shrink: 0;
    }
    .save-dialog-nav-btn:hover:not(:disabled) { background: #333; color: #fff; }
    .save-dialog-nav-btn:disabled { opacity: .35; cursor: default; }
    .save-dialog-nav-btn svg { width: 12px; height: 12px; }
    .save-dialog-address {
        flex: 1;
        background: #0d0d0d;
        border: 1px solid #2a2a2a;
        border-radius: 5px;
        color: #888;
        padding: 4px 10px;
        font-size: 12px;
        font-family: monospace;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .save-dialog-body {
        flex: 1;
        display: flex;
        overflow: hidden;
    }

    /* Sidebar */
    .save-dialog-sidebar {
        width: 155px;
        min-width: 155px;
        background: #111;
        border-right: 1px solid #000;
        overflow-y: auto;
        flex-shrink: 0;
        padding: 6px 0;
    }
    .save-dialog-sb-section {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: .07em;
        text-transform: uppercase;
        color: #3a3a3a;
        padding: 8px 10px 3px;
        pointer-events: none;
    }
    .save-dialog-sb-item {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 5px 10px;
        cursor: pointer;
        color: #777;
        font-size: 12px;
        transition: background .1s, color .1s;
    }
    .save-dialog-sb-item:hover { background: #1a1a1a; color: #ccc; }
    .save-dialog-sb-item.active { background: #0c74df; color: #fff; }
    .save-dialog-sb-item img {
        width: 14px; height: 14px;
        object-fit: contain;
        flex-shrink: 0;
        opacity: .8;
    }
    .save-dialog-sb-item.active img { opacity: 1; }

    /* Main file panel */
    .save-dialog-main {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-content: flex-start;
        background: #161616;
    }
    .save-dialog-tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 6px 4px;
        border-radius: 6px;
        cursor: pointer;
        width: 72px;
        text-align: center;
        border: 1px solid transparent;
        transition: background .1s;
    }
    .save-dialog-tile:hover { background: #222; }
    .save-dialog-tile.selected { background: #0d2a4a; border-color: #2563eb; }
    .save-dialog-tile-icon {
        width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        font-size: 24px;
        line-height: 1;
        flex-shrink: 0;
    }
    .save-dialog-tile-icon img { width: 32px; height: 32px; object-fit: contain; }
    .save-dialog-tile-name {
        font-size: 11px;
        color: #999;
        word-break: break-all;
        max-width: 68px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.3;
    }
    .save-dialog-tile.selected .save-dialog-tile-name { color: #ddd; }
    .save-dialog-tile.is-file { opacity: .6; pointer-events: none; }
    .save-dialog-tile.is-file.selectable { opacity: 1; pointer-events: auto; }

    /* Footer */
    .save-dialog-footer {
        padding: 10px 14px 12px;
        background: #141414;
        border-top: 1px solid #000;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .save-dialog-name-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .save-dialog-name-lbl {
        font-size: 12px;
        color: #666;
        flex-shrink: 0;
        width: 72px;
    }
    .save-dialog-name-input {
        flex: 1;
        background: #0d0d0d;
        border: 1px solid #2e2e2e;
        border-radius: 6px;
        color: #e0e0e0;
        padding: 6px 10px;
        font-size: 13px;
        outline: none;
        font-family: var(--font-ui);
        transition: border-color .15s;
    }
    .save-dialog-name-input:focus { border-color: #3b82f6; }
    .save-dialog-btn-row {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }
    .save-dialog-btn {
        padding: 7px 18px;
        border-radius: 6px;
        font-size: 13px;
        font-family: var(--font-ui);
        cursor: pointer;
        border: 1px solid #2e2e2e;
        background: #252525;
        color: #bbb;
        transition: background .1s, color .1s;
    }
    .save-dialog-btn:hover { background: #333; color: #fff; }
    .save-dialog-btn.primary {
        background: #0c74df;
        border-color: #0a5fb8;
        color: #fff;
        font-weight: 600;
    }
    .save-dialog-btn.primary:hover { background: #1a84ef; }

    /* Aero 2010 overrides */
    :root.theme-aero2010 .paint-toolbar  { background: linear-gradient(180deg,#e8f0f8,#d8e8f4); border-bottom-color: #aac0d8; }
    :root.theme-aero2010 .paint-menubar  { background: linear-gradient(180deg,#dce8f4,#c8d8ec); border-bottom-color: #aac0d8; }
    :root.theme-aero2010 .paint-menu-btn { color: #2a4a6a; }
    :root.theme-aero2010 .paint-menu-btn:hover { background: rgba(255,255,255,.6); }
    :root.theme-aero2010 .paint-statusbar { background: linear-gradient(180deg,#dce8f4,#c8d8ec); border-top-color: #aac0d8; color: #5a7a9a; }
    :root.theme-aero2010 .paint-canvas-wrap { background: #b0c8dc; }
    :root.theme-aero2010 .save-dialog { background: linear-gradient(180deg,#f4f8fc,#eaf0fc); border-color: #8ab0cc; }
    :root.theme-aero2010 .save-dialog-titlebar { background: linear-gradient(180deg,#dce8f4,#c8d8ec); border-bottom-color: #aac0d8; }
    :root.theme-aero2010 .save-dialog-title { color: #1a3050; }
    :root.theme-aero2010 .save-dialog-nav { background: linear-gradient(180deg,#e4eef8,#d4e4f0); border-bottom-color: #aac0d8; }
    :root.theme-aero2010 .save-dialog-address { background: #fff; border-color: #a8c0d8; color: #2a4a6a; }
    :root.theme-aero2010 .save-dialog-sidebar { background: linear-gradient(180deg,#dce8f4,#c8d8ec); border-right-color: #aac0d8; }
    :root.theme-aero2010 .save-dialog-sb-item { color: #2a4a6a; }
    :root.theme-aero2010 .save-dialog-sb-item:hover { background: rgba(255,255,255,.5); }
    :root.theme-aero2010 .save-dialog-sb-item.active { background: linear-gradient(180deg,#5b9bd5,#2e6db0); }
    :root.theme-aero2010 .save-dialog-main { background: linear-gradient(180deg,#f8fafe,#f0f4fc); }
    :root.theme-aero2010 .save-dialog-footer { background: linear-gradient(180deg,#dce8f4,#c8d8ec); border-top-color: #aac0d8; }
    :root.theme-aero2010 .save-dialog-name-input { background: #fff; border-color: #a8c0d8; color: #1a3050; }
    :root.theme-aero2010 .save-dialog-tile-name { color: #2a4a6a; }
    :root.theme-aero2010 .save-dialog-tile:hover { background: rgba(180,210,240,.5); }
    `;
    document.head.appendChild(s);
})();

/* ============================================================
   spawnPaint — create the paint window
============================================================ */
function spawnPaint(fileItem) {
    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 28;
    const left = Math.min(80 + offset, window.innerWidth - 920);
    const top = Math.min(60 + offset, window.innerHeight - 620);

    const titleText = fileItem?.name ? `Paint — ${fileItem.name}` : 'Paint';

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.cssText = `left:${left}px;top:${top}px;width:920px;height:620px;`;
    win.addEventListener('mousedown', () => focusWindow(windowId));

    win.innerHTML = `
        <div class="title-bar">
            <button class="window-close-button" title="Close">✕</button>
            <button class="window-minimize-button" title="Minimize">—</button>
            <button class="window-maximize-button" title="Maximize">□</button>
            <span class="title-bar-text">
                <img class="app-icon-title-bar" src="icons/16/paint.png"
                     onerror="this.style.display='none'"> ${titleText}
            </span>
        </div>
        <div class="app-body" style="height:calc(100% - var(--titlebar-height));overflow:hidden;display:flex;flex-direction:column;"></div>
    `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'paint', item: fileItem || {} } };

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
    tbBtn.textContent = '🎨 Paint';
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [
            { label: 'Close', icon: 'delete', action: () => closeWindow(windowId) }
        ]);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));
    windows[windowId].taskbarBtn = tbBtn;

    _buildPaintBody(win.querySelector('.app-body'), fileItem, windowId, win);
    focusWindow(windowId);
    return windowId;
}

/* ============================================================
   _buildPaintBody — full paint UI
============================================================ */
function _buildPaintBody(body, fileItem, windowId, winEl) {

    /* ---------- state ---------- */
    const ps = {
        tool: 'pencil',
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        brushSize: 4,
        shapeFill: false,
        drawing: false,
        drawButton: 0,
        lastX: 0, lastY: 0,
        startX: 0, startY: 0,
        snapshot: null,
    };

    const PALETTE = [
        '#000000', '#404040', '#808080', '#c0c0c0', '#ffffff', '#804000', '#ff0000', '#ff8040',
        '#ffff00', '#80ff00', '#008000', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff',
        '#ff00ff', '#ff0080', '#804040', '#ff8080', '#ffe0a0', '#ffffc0', '#c0ffc0', '#c0ffff',
        '#c0c0ff', '#ffc0ff', '#ffb347', '#ffd700', '#7cfc00', '#40e0d0', '#1e90ff', '#da70d6',
    ];

    const TOOLS = [
        { id: 'pencil', icon: '✏️', title: 'Pencil (P)' },
        { id: 'eraser', icon: '⬜', title: 'Eraser (E)' },
        { id: 'fill', icon: '🪣', title: 'Fill Bucket (F)' },
        { id: 'eyedropper', icon: '💉', title: 'Eyedropper (I)' },
        null,
        { id: 'line', icon: '╱', title: 'Line (L)' },
        { id: 'rect', icon: '▭', title: 'Rectangle (R)' },
        { id: 'ellipse', icon: '⬭', title: 'Ellipse (O)' },
    ];

    /* ---------- layout ---------- */
    body.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';

    /* menubar */
    const menubar = document.createElement('div');
    menubar.className = 'paint-menubar';
    body.appendChild(menubar);

    function menuBtn(label, cls, handler) {
        const b = document.createElement('button');
        b.className = 'paint-menu-btn' + (cls ? ' ' + cls : '');
        b.textContent = label;
        b.onclick = handler;
        menubar.appendChild(b);
        return b;
    }

    /* toolbar */
    const toolbar = document.createElement('div');
    toolbar.className = 'paint-toolbar';
    body.appendChild(toolbar);

    /* canvas area */
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'paint-canvas-wrap';
    body.appendChild(canvasWrap);

    const canvas = document.createElement('canvas');
    canvas.className = 'paint-canvas';
    canvas.width = 800;
    canvas.height = 500;
    canvasWrap.appendChild(canvas);

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* status bar */
    const statusbar = document.createElement('div');
    statusbar.className = 'paint-statusbar';
    const statusPos = document.createElement('span');
    const statusSize = document.createElement('span');
    const statusTool = document.createElement('span');
    statusPos.textContent = 'X: 0  Y: 0';
    statusSize.textContent = `${canvas.width} × ${canvas.height} px`;
    statusTool.textContent = 'Pencil';
    statusbar.appendChild(statusPos);
    statusbar.appendChild(statusSize);
    statusbar.appendChild(statusTool);
    body.appendChild(statusbar);

    /* -------- load existing image if provided -------- */
    if (fileItem?.content) {
        const blob = new Blob([fileItem.content], { type: fileItem.mime || 'image/png' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            statusSize.textContent = `${canvas.width} × ${canvas.height} px`;
        };
        img.src = url;
    }

    /* -------- toolbar: tools -------- */
    let activeToolBtn = null;

    function setTool(id) {
        ps.tool = id;
        toolbar.querySelectorAll('.paint-tool-btn').forEach(b => b.classList.remove('active'));
        const b = toolbar.querySelector(`[data-tool="${id}"]`);
        if (b) { b.classList.add('active'); activeToolBtn = b; }
        statusTool.textContent = TOOLS.find(t => t?.id === id)?.title.split(' ')[0] || id;
        canvas.style.cursor = id === 'eyedropper' ? 'crosshair'
            : id === 'fill' ? 'cell'
                : 'crosshair';
    }

    for (const t of TOOLS) {
        if (!t) {
            const sep = document.createElement('div');
            sep.className = 'paint-tool-sep';
            toolbar.appendChild(sep);
            continue;
        }
        const btn = document.createElement('button');
        btn.className = 'paint-tool-btn';
        btn.title = t.title;
        btn.textContent = t.icon;
        btn.dataset.tool = t.id;
        btn.onclick = () => setTool(t.id);
        toolbar.appendChild(btn);
    }
    setTool('pencil');

    /* shape fill toggle */
    const sep1 = document.createElement('div'); sep1.className = 'paint-tool-sep';
    toolbar.appendChild(sep1);
    const fillToggle = document.createElement('div');
    fillToggle.className = 'paint-fill-toggle';
    const outlineBtn = document.createElement('button');
    outlineBtn.className = 'paint-fill-btn active';
    outlineBtn.title = 'Outline';
    outlineBtn.textContent = '□';
    const solidBtn = document.createElement('button');
    solidBtn.className = 'paint-fill-btn';
    solidBtn.title = 'Solid fill';
    solidBtn.textContent = '■';
    outlineBtn.onclick = () => { ps.shapeFill = false; outlineBtn.classList.add('active'); solidBtn.classList.remove('active'); };
    solidBtn.onclick = () => { ps.shapeFill = true; solidBtn.classList.add('active'); outlineBtn.classList.remove('active'); };
    fillToggle.appendChild(outlineBtn);
    fillToggle.appendChild(solidBtn);
    toolbar.appendChild(fillToggle);

    /* size */
    const sep2 = document.createElement('div'); sep2.className = 'paint-tool-sep';
    toolbar.appendChild(sep2);
    const sizeArea = document.createElement('div');
    sizeArea.className = 'paint-size-area';
    const sizeLabel = document.createElement('span');
    sizeLabel.className = 'paint-size-label';
    sizeLabel.textContent = 'Size:';
    const sizeSlider = document.createElement('input');
    sizeSlider.type = 'range';
    sizeSlider.min = 1;
    sizeSlider.max = 80;
    sizeSlider.value = ps.brushSize;
    sizeSlider.className = 'paint-size-slider';
    const sizeDotWrap = document.createElement('div');
    sizeDotWrap.className = 'paint-size-dot-wrap';
    const sizeDot = document.createElement('div');
    sizeDot.style.cssText = `width:${ps.brushSize}px;height:${ps.brushSize}px;border-radius:50%;background:#aaa;max-width:24px;max-height:24px;`;
    sizeDotWrap.appendChild(sizeDot);
    sizeSlider.oninput = () => {
        ps.brushSize = parseInt(sizeSlider.value);
        const d = Math.min(ps.brushSize, 24);
        sizeDot.style.width = d + 'px';
        sizeDot.style.height = d + 'px';
    };
    sizeArea.appendChild(sizeLabel);
    sizeArea.appendChild(sizeSlider);
    sizeArea.appendChild(sizeDotWrap);
    toolbar.appendChild(sizeArea);

    /* colors */
    const sep3 = document.createElement('div'); sep3.className = 'paint-tool-sep';
    toolbar.appendChild(sep3);

    const colorArea = document.createElement('div');
    colorArea.className = 'paint-color-area';

    /* fg/bg swatches */
    const swatchStack = document.createElement('div');
    swatchStack.className = 'paint-swatch-stack';

    const bgSwatch = document.createElement('div');
    bgSwatch.className = 'paint-swatch-bg';
    bgSwatch.title = 'Secondary color (right-click to use)';
    bgSwatch.style.background = ps.secondaryColor;

    const fgSwatch = document.createElement('div');
    fgSwatch.className = 'paint-swatch-fg';
    fgSwatch.title = 'Primary color (left-click to use)';
    fgSwatch.style.background = ps.primaryColor;

    const swapBtn = document.createElement('div');
    swapBtn.className = 'paint-swatch-swap';
    swapBtn.title = 'Swap colors';
    swapBtn.textContent = '⇄';
    swapBtn.onclick = () => {
        [ps.primaryColor, ps.secondaryColor] = [ps.secondaryColor, ps.primaryColor];
        fgSwatch.style.background = ps.primaryColor;
        bgSwatch.style.background = ps.secondaryColor;
        fgPicker.value = ps.primaryColor;
        bgPicker.value = ps.secondaryColor;
        updatePaletteHighlight();
    };

    /* hidden color inputs */
    const fgPicker = document.createElement('input');
    fgPicker.type = 'color'; fgPicker.style.display = 'none';
    fgPicker.value = ps.primaryColor;
    fgPicker.oninput = () => {
        ps.primaryColor = fgPicker.value;
        fgSwatch.style.background = ps.primaryColor;
        updatePaletteHighlight();
    };

    const bgPicker = document.createElement('input');
    bgPicker.type = 'color'; bgPicker.style.display = 'none';
    bgPicker.value = ps.secondaryColor;
    bgPicker.oninput = () => {
        ps.secondaryColor = bgPicker.value;
        bgSwatch.style.background = ps.secondaryColor;
    };

    fgSwatch.onclick = () => fgPicker.click();
    bgSwatch.onclick = () => bgPicker.click();

    swatchStack.appendChild(bgSwatch);
    swatchStack.appendChild(fgSwatch);
    swatchStack.appendChild(swapBtn);
    swatchStack.appendChild(fgPicker);
    swatchStack.appendChild(bgPicker);
    colorArea.appendChild(swatchStack);

    /* palette */
    const palette = document.createElement('div');
    palette.className = 'paint-palette';
    for (const color of PALETTE) {
        const sw = document.createElement('div');
        sw.className = 'paint-palette-swatch';
        sw.style.background = color;
        sw.title = color;
        sw.dataset.color = color;
        sw.addEventListener('click', () => {
            ps.primaryColor = color;
            fgSwatch.style.background = color;
            fgPicker.value = color;
            updatePaletteHighlight();
        });
        sw.addEventListener('contextmenu', e => {
            e.preventDefault();
            ps.secondaryColor = color;
            bgSwatch.style.background = color;
            bgPicker.value = color;
        });
        palette.appendChild(sw);
    }

    function updatePaletteHighlight() {
        palette.querySelectorAll('.paint-palette-swatch').forEach(sw => {
            sw.classList.toggle('active-fg', sw.dataset.color === ps.primaryColor);
        });
    }
    updatePaletteHighlight();

    colorArea.appendChild(palette);
    toolbar.appendChild(colorArea);

    /* ============================================================
       DRAWING HELPERS
    ============================================================ */
    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: Math.round((e.clientX - rect.left) * scaleX),
            y: Math.round((e.clientY - rect.top) * scaleY),
        };
    }

    function prepCtx(color) {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = ps.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    function floodFill(sx, sy, fillColor) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        const W = canvas.width, H = canvas.height;

        const idx = (x, y) => (y * W + x) * 4;
        const ti = idx(sx, sy);
        const tR = d[ti], tG = d[ti + 1], tB = d[ti + 2], tA = d[ti + 3];

        /* resolve fill color to RGBA */
        const tmp = Object.assign(document.createElement('canvas'), { width: 1, height: 1 });
        const tc = tmp.getContext('2d');
        tc.fillStyle = fillColor;
        tc.fillRect(0, 0, 1, 1);
        const fd = tc.getImageData(0, 0, 1, 1).data;
        const fR = fd[0], fG = fd[1], fB = fd[2], fA = fd[3];

        if (tR === fR && tG === fG && tB === fB && tA === fA) return;

        const match = i => d[i] === tR && d[i + 1] === tG && d[i + 2] === tB && d[i + 3] === tA;
        const paint = i => { d[i] = fR; d[i + 1] = fG; d[i + 2] = fB; d[i + 3] = fA; };
        const vis = new Uint8Array(W * H);

        const stack = [[sx, sy]];
        vis[sy * W + sx] = 1;

        while (stack.length) {
            const [x, y] = stack.pop();
            const i = idx(x, y);
            if (!match(i)) continue;
            paint(i);
            if (x > 0 && !vis[y * W + (x - 1)]) { vis[y * W + (x - 1)] = 1; stack.push([x - 1, y]); }
            if (x < W - 1 && !vis[y * W + (x + 1)]) { vis[y * W + (x + 1)] = 1; stack.push([x + 1, y]); }
            if (y > 0 && !vis[(y - 1) * W + x]) { vis[(y - 1) * W + x] = 1; stack.push([x, y - 1]); }
            if (y < H - 1 && !vis[(y + 1) * W + x]) { vis[(y + 1) * W + x] = 1; stack.push([x, y + 1]); }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    function renderShapePreview(x, y, color) {
        if (!ps.snapshot) return;
        ctx.putImageData(ps.snapshot, 0, 0);
        prepCtx(color);
        ctx.globalCompositeOperation = 'source-over';

        if (ps.tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(ps.startX, ps.startY);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (ps.tool === 'rect') {
            const w = x - ps.startX, h = y - ps.startY;
            if (ps.shapeFill) ctx.fillRect(ps.startX, ps.startY, w, h);
            ctx.strokeRect(ps.startX, ps.startY, w, h);
        } else if (ps.tool === 'ellipse') {
            const cx = (ps.startX + x) / 2;
            const cy = (ps.startY + y) / 2;
            const rx = Math.abs(x - ps.startX) / 2;
            const ry = Math.abs(y - ps.startY) / 2;
            ctx.beginPath();
            ctx.ellipse(cx, cy, Math.max(rx, 0.5), Math.max(ry, 0.5), 0, 0, Math.PI * 2);
            if (ps.shapeFill) ctx.fill();
            ctx.stroke();
        }
    }

    /* ============================================================
       CANVAS EVENT HANDLERS
    ============================================================ */
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    canvas.addEventListener('mousedown', e => {
        if (e.button !== 0 && e.button !== 2) return;
        e.preventDefault();
        const { x, y } = getPos(e);
        ps.drawing = true;
        ps.drawButton = e.button;
        ps.lastX = x; ps.lastY = y;
        ps.startX = x; ps.startY = y;
        const color = e.button === 2 ? ps.secondaryColor : ps.primaryColor;

        if (ps.tool === 'pencil') {
            prepCtx(color);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 0.01, y + 0.01);
            ctx.stroke();
        } else if (ps.tool === 'eraser') {
            ctx.fillStyle = ps.secondaryColor;
            const h = ps.brushSize;
            ctx.fillRect(x - h / 2, y - h / 2, h, h);
        } else if (ps.tool === 'fill') {
            floodFill(x, y, color);
            ps.drawing = false;
        } else if (ps.tool === 'eyedropper') {
            const pix = ctx.getImageData(x, y, 1, 1).data;
            const hex = '#' + [pix[0], pix[1], pix[2]].map(v => v.toString(16).padStart(2, '0')).join('');
            if (e.button === 2) {
                ps.secondaryColor = hex;
                bgSwatch.style.background = hex;
                bgPicker.value = hex;
            } else {
                ps.primaryColor = hex;
                fgSwatch.style.background = hex;
                fgPicker.value = hex;
                updatePaletteHighlight();
            }
            ps.drawing = false;
        } else if (['line', 'rect', 'ellipse'].includes(ps.tool)) {
            ps.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
    });

    canvas.addEventListener('mousemove', e => {
        const { x, y } = getPos(e);
        statusPos.textContent = `X: ${x}  Y: ${y}`;
        if (!ps.drawing) return;

        const color = ps.drawButton === 2 ? ps.secondaryColor : ps.primaryColor;

        if (ps.tool === 'pencil') {
            prepCtx(color);
            ctx.beginPath();
            ctx.moveTo(ps.lastX, ps.lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            ps.lastX = x; ps.lastY = y;
        } else if (ps.tool === 'eraser') {
            ctx.fillStyle = ps.secondaryColor;
            const h = ps.brushSize;
            ctx.fillRect(x - h / 2, y - h / 2, h, h);
            ps.lastX = x; ps.lastY = y;
        } else if (['line', 'rect', 'ellipse'].includes(ps.tool)) {
            renderShapePreview(x, y, color);
        }
    });

    function stopDrawing(e) {
        if (!ps.drawing) return;
        if (['line', 'rect', 'ellipse'].includes(ps.tool)) {
            const { x, y } = getPos(e);
            const color = ps.drawButton === 2 ? ps.secondaryColor : ps.primaryColor;
            renderShapePreview(x, y, color);
            ps.snapshot = null;
        }
        ps.drawing = false;
    }
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', e => {
        if (['line', 'rect', 'ellipse'].includes(ps.tool)) stopDrawing(e);
        else ps.drawing = false;
    });

    /* ============================================================
       KEYBOARD SHORTCUTS
    ============================================================ */
    body.setAttribute('tabindex', '-1');
    body.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT') return;
        const map = { p: 'pencil', e: 'eraser', f: 'fill', i: 'eyedropper', l: 'line', r: 'rect', o: 'ellipse' };
        if (map[e.key.toLowerCase()]) setTool(map[e.key.toLowerCase()]);
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            /* basic undo: if we have a snapshot from before last shape, restore it */
            /* Full undo history is a future enhancement */
        }
    });

    /* ============================================================
       MENU ACTIONS
    ============================================================ */

    /* Import from computer */
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = 'image/*';
    importInput.style.display = 'none';
    body.appendChild(importInput);

    menuBtn('Import Image', null, () => importInput.click());

    importInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            statusSize.textContent = `${canvas.width} × ${canvas.height} px`;
            const titleEl = winEl?.querySelector('.title-bar-text');
            if (titleEl) titleEl.innerHTML =
                `<img class="app-icon-title-bar" src="icons/16/paint.png" onerror="this.style.display='none'"> Paint — ${file.name}`;
        };
        img.src = url;
    };

    /* Save As */
    menuBtn('Save As…', null, () => {
        const base = fileItem?.name?.replace(/\.[^.]+$/, '') || 'untitled';
        spawnSaveDialog({
            defaultName: base + '.png',
            onSave: async ({ parentId, filename }) => {
                canvas.toBlob(async blob => {
                    const ab = await blob.arrayBuffer();
                    const siblings = await idbGetAllByIndex('parentId', parentId);
                    const existing = siblings.find(n => n.name === filename && n.type === 'file');
                    if (existing) {
                        existing.content = ab;
                        existing.size = ab.byteLength;
                        existing.mime = 'image/png';
                        existing.updatedAt = Date.now();
                        await idbPut(existing);
                    } else {
                        await idbAdd({
                            id: crypto.randomUUID(),
                            name: filename, type: 'file',
                            parentId,
                            content: ab, size: ab.byteLength,
                            mime: 'image/png',
                            createdAt: Date.now(), updatedAt: Date.now(),
                        });
                    }
                    await renderAllWindows();
                    const titleEl = winEl?.querySelector('.title-bar-text');
                    if (titleEl) titleEl.innerHTML =
                        `<img class="app-icon-title-bar" src="icons/16/paint.png" onerror="this.style.display='none'"> Paint — ${filename}`;
                }, 'image/png');
            },
        });
    });

    /* Resize canvas */
    menuBtn('Resize Canvas…', null, () => {
        const w = parseInt(prompt('New width (px):', canvas.width));
        const h = parseInt(prompt('New height (px):', canvas.height));
        if (!w || !h || w < 1 || h < 1 || w > 8000 || h > 8000) return;
        const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = w;
        canvas.height = h;
        ctx.fillStyle = ps.secondaryColor || '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.putImageData(snap, 0, 0);
        statusSize.textContent = `${w} × ${h} px`;
    });

    /* Clear */
    menuBtn('Clear', 'danger', () => {
        if (!confirm('Clear the canvas? This cannot be undone.')) return;
        ctx.fillStyle = ps.secondaryColor || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
}

/* ============================================================
   spawnSaveDialog — file-explorer-style Save As dialog
============================================================ */
async function spawnSaveDialog({ defaultName = 'untitled.png', onSave, onCancel } = {}) {
    const username = getUsername();
    const homePath = `/home/${username}`;

    /* state */
    let currentFolderId = 'root';
    const histStack = [];
    let histPos = -1;

    /* ---------- build DOM ---------- */
    const overlay = document.createElement('div');
    overlay.className = 'save-dialog-overlay';
    document.body.appendChild(overlay);

    const dialog = document.createElement('div');
    dialog.className = 'save-dialog';
    overlay.appendChild(dialog);

    /* title bar */
    const titlebar = document.createElement('div');
    titlebar.className = 'save-dialog-titlebar';
    titlebar.innerHTML = `<span class="save-dialog-title">💾 Save As</span>`;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'save-dialog-close';
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => dismiss(false);
    titlebar.appendChild(closeBtn);
    dialog.appendChild(titlebar);

    /* nav bar */
    const navBar = document.createElement('div');
    navBar.className = 'save-dialog-nav';

    const backBtn = _sdNavBtn(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`, 'Back');
    const fwdBtn = _sdNavBtn(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`, 'Forward');
    const upBtn = _sdNavBtn(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>`, 'Up');
    backBtn.disabled = fwdBtn.disabled = upBtn.disabled = true;

    const addrBar = document.createElement('div');
    addrBar.className = 'save-dialog-address';
    addrBar.textContent = '/';

    navBar.appendChild(backBtn);
    navBar.appendChild(fwdBtn);
    navBar.appendChild(upBtn);
    navBar.appendChild(addrBar);
    dialog.appendChild(navBar);

    /* body */
    const dialogBody = document.createElement('div');
    dialogBody.className = 'save-dialog-body';

    const sidebar = document.createElement('div');
    sidebar.className = 'save-dialog-sidebar';

    const mainPanel = document.createElement('div');
    mainPanel.className = 'save-dialog-main';

    dialogBody.appendChild(sidebar);
    dialogBody.appendChild(mainPanel);
    dialog.appendChild(dialogBody);

    /* footer */
    const footer = document.createElement('div');
    footer.className = 'save-dialog-footer';
    footer.innerHTML = `
        <div class="save-dialog-name-row">
            <span class="save-dialog-name-lbl">Filename:</span>
            <input class="save-dialog-name-input" id="sd-name-input" value="${defaultName}" spellcheck="false" autocomplete="off">
        </div>
        <div class="save-dialog-btn-row">
            <button class="save-dialog-btn"         id="sd-cancel-btn">Cancel</button>
            <button class="save-dialog-btn primary"  id="sd-save-btn">Save</button>
        </div>
    `;
    dialog.appendChild(footer);

    const filenameInput = footer.querySelector('#sd-name-input');
    footer.querySelector('#sd-cancel-btn').onclick = () => dismiss(false);
    footer.querySelector('#sd-save-btn').onclick = doSave;
    filenameInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSave(); });

    /* close on overlay click */
    overlay.addEventListener('mousedown', e => { if (e.target === overlay) dismiss(false); });

    /* ---------- sidebar ---------- */
    const sbPlaces = [
        { label: 'Home', slug: 'home', path: homePath },
        { label: 'Desktop', slug: 'desktop', path: `${homePath}/Desktop` },
        { label: 'Documents', slug: 'documents', path: `${homePath}/Documents` },
        { label: 'Pictures', slug: 'pictures', path: `${homePath}/Pictures` },
        { label: 'Downloads', slug: 'downloads', path: `${homePath}/Downloads` },
    ];
    const sbSystem = [
        { label: 'File System', slug: 'root', path: '/' },
        { label: 'Recycle Bin', slug: 'trash', path: '/tmp' },
    ];

    function _sbSection(title) {
        const s = document.createElement('div');
        s.className = 'save-dialog-sb-section';
        s.textContent = title;
        sidebar.appendChild(s);
    }
    function _sbItem(p) {
        const li = document.createElement('div');
        li.className = 'save-dialog-sb-item';
        li.dataset.path = p.path;
        const img = document.createElement('img');
        img.src = `./icons/16/folder-${p.slug}.svg`;
        img.onerror = () => img.style.display = 'none';
        const lbl = document.createElement('span');
        lbl.textContent = p.label;
        li.appendChild(img);
        li.appendChild(lbl);
        li.onclick = () => navigateToPath(p.path);
        sidebar.appendChild(li);
    }
    _sbSection('Places');
    sbPlaces.forEach(_sbItem);
    _sbSection('System');
    sbSystem.forEach(_sbItem);

    function updateSidebarActive(pathStr) {
        sidebar.querySelectorAll('.save-dialog-sb-item').forEach(li =>
            li.classList.toggle('active', li.dataset.path === pathStr)
        );
    }

    /* ---------- navigation ---------- */
    async function navigate(folderId, addToHistory = true) {
        currentFolderId = folderId;
        if (addToHistory) {
            histStack.splice(histPos + 1);
            histStack.push(folderId);
            histPos = histStack.length - 1;
        }
        backBtn.disabled = histPos <= 0;
        fwdBtn.disabled = histPos >= histStack.length - 1;

        /* path string */
        const parts = [];
        let walker = folderId;
        while (walker) {
            const node = await idbGet(walker);
            if (!node) break;
            if (node.id !== 'root') parts.unshift(node.name);
            walker = node.parentId;
        }
        const pathStr = '/' + parts.join('/');
        addrBar.textContent = pathStr || '/';
        updateSidebarActive(pathStr || '/');
        upBtn.disabled = (folderId === 'root');

        /* render files */
        const children = await idbGetAllByIndex('parentId', folderId);
        children.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
        mainPanel.innerHTML = '';

        for (const child of children) {
            const tile = document.createElement('div');
            tile.className = 'save-dialog-tile' +
                (child.type === 'file' ? ' is-file selectable' : '');
            tile.dataset.id = child.id;

            const iconEl = document.createElement('div');
            iconEl.className = 'save-dialog-tile-icon';
            iconEl.textContent = child.type === 'folder' ? '📁' : '📄';

            const nameEl = document.createElement('div');
            nameEl.className = 'save-dialog-tile-name';
            nameEl.textContent = child.name;
            nameEl.title = child.name;

            tile.appendChild(iconEl);
            tile.appendChild(nameEl);

            if (child.type === 'folder') {
                tile.onclick = () => navigate(child.id);
                tile.ondblclick = () => navigate(child.id);
            } else {
                tile.onclick = () => {
                    mainPanel.querySelectorAll('.save-dialog-tile').forEach(t => t.classList.remove('selected'));
                    tile.classList.add('selected');
                    filenameInput.value = child.name;
                };
            }

            mainPanel.appendChild(tile);

            /* async icon upgrade */
            buildFileIconWrapper(child).then(wrapper => {
                if (!iconEl.isConnected) return;
                const img = wrapper.querySelector('img');
                if (img) {
                    img.style.cssText = 'width:32px;height:32px;object-fit:contain;';
                    iconEl.textContent = '';
                    iconEl.appendChild(img);
                }
            }).catch(() => { });
        }
    }

    async function navigateToPath(pathStr) {
        const parts = pathStr.split('/').filter(Boolean);
        let curId = 'root';
        for (const part of parts) {
            const kids = await idbGetAllByIndex('parentId', curId);
            const match = kids.find(n => n.name === part && n.type === 'folder');
            if (!match) break;
            curId = match.id;
        }
        await navigate(curId);
    }

    backBtn.onclick = async () => {
        if (histPos <= 0) return;
        histPos--;
        await navigate(histStack[histPos], false);
    };
    fwdBtn.onclick = async () => {
        if (histPos >= histStack.length - 1) return;
        histPos++;
        await navigate(histStack[histPos], false);
    };
    upBtn.onclick = async () => {
        if (currentFolderId === 'root') return;
        const node = await idbGet(currentFolderId);
        await navigate(node?.parentId || 'root');
    };

    /* ---------- actions ---------- */
    function doSave() {
        let name = filenameInput.value.trim();
        if (!name) { filenameInput.focus(); return; }
        if (!name.includes('.')) name += '.png';
        dismiss(true, { parentId: currentFolderId, filename: name });
    }

    function dismiss(saved, payload) {
        overlay.style.animation = 'sd-fadein .12s ease reverse forwards';
        setTimeout(() => {
            overlay.remove();
            if (saved && payload) onSave?.(payload);
            else onCancel?.();
        }, 110);
    }

    /* ---------- initial navigation ---------- */
    await navigateToPath(homePath);
    setTimeout(() => { filenameInput.focus(); filenameInput.select(); }, 80);
}

/* helper: nav button for save dialog */
function _sdNavBtn(svgStr, title) {
    const btn = document.createElement('button');
    btn.className = 'save-dialog-nav-btn';
    btn.title = title;
    btn.innerHTML = svgStr;
    return btn;
}

/* ============================================================
   Expose globally
============================================================ */
window.spawnPaint = spawnPaint;
window.spawnSaveDialog = spawnSaveDialog;