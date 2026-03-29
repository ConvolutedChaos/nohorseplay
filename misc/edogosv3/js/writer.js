/* ============================================================
   E-DOG WRITER — Word Processor for E-Dog OS
   Custom format: .edoc (JSON under the hood)
   ============================================================ */

/*  .edoc format spec:
    {
      "type": "edoc",
      "version": 1,
      "title": "Document Title",
      "author": "<username>",
      "content": "<html content>",
      "pageSettings": {
        "pageSize": "letter",
        "marginTop": 1,
        "marginBottom": 1,
        "marginLeft": 1.25,
        "marginRight": 1.25
      },
      "created": <timestamp>,
      "modified": <timestamp>
    }
*/

/* ---- inject Writer styles once ---- */
(function injectWriterStyles() {
    if (document.getElementById('writer-styles')) return;
    const s = document.createElement('style');
    s.id = 'writer-styles';
    s.textContent = `

/* ── Root layout ─────────────────────────────────────────── */
.writer-root {
    display: flex; flex-direction: column; height: 100%;
    background: #1e1e1e; color: #d4d4d4;
    font-family: 'Segoe UI', system-ui, sans-serif; font-size: 13px;
    user-select: none; overflow: hidden;
}

/* ── Menu bar ────────────────────────────────────────────── */
.wr-menubar {
    display: flex; align-items: center; gap: 0;
    background: #252526; border-bottom: 1px solid #1a1a1a;
    height: 28px; flex-shrink: 0; padding: 0 4px;
}
.wr-menu-item {
    padding: 4px 10px; font-size: 12px; color: #ccc;
    cursor: pointer; border-radius: 3px; position: relative;
    white-space: nowrap;
}
.wr-menu-item:hover { background: #3a3a3a; color: #fff; }

/* ── Dropdown menus ──────────────────────────────────────── */
.wr-dropdown {
    position: absolute; top: 100%; left: 0; z-index: 9999;
    background: #2d2d2d; border: 1px solid #404040;
    border-radius: 6px; min-width: 220px;
    box-shadow: 0 8px 32px rgba(0,0,0,.6);
    padding: 4px 0; display: none;
}
.wr-dropdown.open { display: block; }
.wr-dd-item {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 16px 6px 12px; font-size: 12px; color: #ccc;
    cursor: pointer; white-space: nowrap;
}
.wr-dd-item:hover { background: #094771; color: #fff; }
.wr-dd-item.disabled { color: #555; pointer-events: none; }
.wr-dd-item .dd-icon { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.wr-dd-item .dd-icon img { width: 16px; height: 16px; object-fit: contain; }
.wr-dd-item .dd-icon svg { width: 14px; height: 14px; }
.wr-dd-item .dd-shortcut { margin-left: auto; color: #666; font-size: 11px; }
.wr-dd-sep { height: 1px; background: #3a3a3a; margin: 4px 8px; }

/* ── Toolbar ─────────────────────────────────────────────── */
.wr-toolbar {
    display: flex; align-items: center; gap: 2px;
    background: #2a2a2a; border-bottom: 1px solid #1a1a1a;
    padding: 4px 8px; flex-shrink: 0; flex-wrap: wrap;
    min-height: 34px;
}
.wr-tb-group {
    display: flex; align-items: center; gap: 1px;
    padding: 0 3px;
}
.wr-tb-group + .wr-tb-group { border-left: 1px solid #3a3a3a; }
.wr-tb-btn {
    width: 28px; height: 26px; border: none; border-radius: 3px;
    background: transparent; color: #bbb; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; padding: 0; transition: background .1s;
}
.wr-tb-btn:hover { background: #3e3e3e; color: #fff; }
.wr-tb-btn.active { background: #094771; color: #fff; }
.wr-tb-btn svg { width: 15px; height: 15px; pointer-events: none; }
.wr-tb-btn img { width: 16px; height: 16px; object-fit: contain; pointer-events: none; }
.wr-tb-select {
    background: #333; color: #ccc; border: 1px solid #444;
    border-radius: 3px; padding: 2px 4px; font-size: 11px;
    height: 26px; cursor: pointer; outline: none;
}
.wr-tb-select:focus { border-color: #0078d4; }
.wr-tb-color-btn {
    width: 28px; height: 26px; border: none; border-radius: 3px;
    cursor: pointer; position: relative; background: transparent;
    display: flex; align-items: center; justify-content: center;
    padding: 0;
}
.wr-tb-color-btn:hover { background: #3e3e3e; }
.wr-tb-color-swatch {
    width: 14px; height: 3px; border-radius: 1px;
    position: absolute; bottom: 3px; left: 50%;
    transform: translateX(-50%);
}
.wr-tb-color-input {
    position: absolute; opacity: 0; width: 100%; height: 100%;
    top: 0; left: 0; cursor: pointer;
}

/* ── Ruler ───────────────────────────────────────────────── */
.wr-ruler {
    height: 22px; background: #262626; border-bottom: 1px solid #1a1a1a;
    flex-shrink: 0; display: flex; align-items: flex-end;
    overflow: hidden; padding-left: 0;
}
.wr-ruler-inner {
    display: flex; align-items: flex-end; height: 100%;
    margin: 0 auto; position: relative;
}
.wr-ruler-tick {
    position: absolute; bottom: 0; width: 1px; background: #555;
}
.wr-ruler-num {
    position: absolute; bottom: 6px; font-size: 9px; color: #666;
    transform: translateX(-50%); font-family: monospace;
}

/* ── Editor area ─────────────────────────────────────────── */
.wr-editor-area {
    flex: 1; overflow: auto; background: #3a3a3a;
    display: flex; justify-content: center; padding: 24px 16px;
}
.wr-page {
    width: 816px; min-height: 1056px;
    background: #fff; color: #1a1a1a;
    box-shadow: 0 2px 16px rgba(0,0,0,.4);
    padding: 96px 96px 96px 96px;
    outline: none; font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 16px; line-height: 1.6;
    word-wrap: break-word; overflow-wrap: break-word;
    user-select: text; cursor: text;
}
.wr-page:focus { outline: none; }
.wr-page p { margin: 0 0 8px 0; }
.wr-page h1 { font-size: 28px; margin: 16px 0 8px; }
.wr-page h2 { font-size: 22px; margin: 14px 0 6px; }
.wr-page h3 { font-size: 18px; margin: 12px 0 4px; }
.wr-page ul, .wr-page ol { padding-left: 24px; margin: 8px 0; }
.wr-page blockquote {
    border-left: 3px solid #0078d4; margin: 12px 0;
    padding: 8px 16px; background: #f0f6ff; color: #333;
}
.wr-page table { border-collapse: collapse; width: 100%; margin: 12px 0; }
.wr-page td, .wr-page th {
    border: 1px solid #bbb; padding: 6px 10px; text-align: left;
}
.wr-page th { background: #e8e8e8; font-weight: 600; }
.wr-page hr { border: none; border-top: 1px solid #ccc; margin: 16px 0; }
.wr-page img { max-width: 100%; height: auto; }
.wr-page a { color: #0078d4; }

/* ── Status bar ──────────────────────────────────────────── */
.wr-statusbar {
    display: flex; align-items: center; gap: 16px;
    background: #007acc; color: #fff; height: 22px;
    padding: 0 12px; font-size: 11px; flex-shrink: 0;
}
.wr-statusbar .wr-sb-sep { width: 1px; height: 14px; background: rgba(255,255,255,.3); }
.wr-statusbar .wr-zoom-controls { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.wr-statusbar .wr-zoom-btn {
    background: none; border: none; color: #fff; cursor: pointer;
    font-size: 13px; padding: 0 4px; opacity: .8;
}
.wr-statusbar .wr-zoom-btn:hover { opacity: 1; }

/* ── Find/Replace bar ────────────────────────────────────── */
.wr-find-bar {
    display: none; background: #2d2d2d; border-bottom: 1px solid #1a1a1a;
    padding: 6px 12px; gap: 6px; align-items: center; flex-shrink: 0;
}
.wr-find-bar.open { display: flex; }
.wr-find-bar input {
    background: #3c3c3c; border: 1px solid #555; color: #ddd;
    padding: 3px 8px; border-radius: 3px; font-size: 12px;
    outline: none; width: 180px;
}
.wr-find-bar input:focus { border-color: #0078d4; }
.wr-find-bar button {
    background: #3c3c3c; border: 1px solid #555; color: #ccc;
    padding: 3px 10px; border-radius: 3px; font-size: 11px;
    cursor: pointer;
}
.wr-find-bar button:hover { background: #4a4a4a; color: #fff; }
.wr-find-bar .fr-close {
    background: none; border: none; color: #888; font-size: 16px;
    cursor: pointer; padding: 0 4px; margin-left: auto;
}
.wr-find-bar .fr-close:hover { color: #fff; }

/* ── Print view ──────────────────────────────────────────── */
@media print {
    .wr-menubar, .wr-toolbar, .wr-ruler, .wr-statusbar, .wr-find-bar { display: none !important; }
    .wr-editor-area { background: #fff !important; padding: 0 !important; overflow: visible !important; }
    .wr-page { box-shadow: none !important; width: 100% !important; min-height: auto !important; }
}
`;
    document.head.appendChild(s);
})();


/* ── SVG icon bank ───────────────────────────────────────── */
const WR_SVG = {
    bold: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z"/></svg>`,
    italic: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4h6l-1 2h-1.5l-3 12H12l-1 2H5l1-2h1.5l3-12H9l1-2z"/></svg>`,
    underline: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3v7a6 6 0 0012 0V3h-2.5v7a3.5 3.5 0 01-7 0V3H6zM4 20h16v2H4v-2z"/></svg>`,
    strike: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 12h18v1.5H3V12zm5.5-3c0-1.66 1.49-3 3.33-3 1.13 0 2.17.5 2.77 1.29l-1.6 1.06c-.3-.4-.85-.65-1.17-.65-.65 0-1.08.36-1.08.8 0 .18.06.35.17.49H7.6A2.85 2.85 0 018.5 9zM15.5 15c0 1.66-1.49 3-3.33 3-1.45 0-2.55-.78-3.03-1.86l1.72-.95c.2.54.73.91 1.31.91.65 0 1.08-.36 1.08-.8a.74.74 0 00-.13-.42h1.6c.14.34.22.71.22 1.12H15.5z"/></svg>`,
    alignL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>`,
    alignC: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,
    alignR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>`,
    alignJ: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
    ul: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="5" cy="6" r="1.5" fill="currentColor"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="5" cy="18" r="1.5" fill="currentColor"/></svg>`,
    ol: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="4" y="8" font-size="7" fill="currentColor" stroke="none">1</text><text x="4" y="14" font-size="7" fill="currentColor" stroke="none">2</text><text x="4" y="20" font-size="7" fill="currentColor" stroke="none">3</text></svg>`,
    indent: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="4" x2="21" y2="4"/><line x1="11" y1="9" x2="21" y2="9"/><line x1="11" y1="14" x2="21" y2="14"/><line x1="3" y1="19" x2="21" y2="19"/><polyline points="3 8 7 11.5 3 15"/></svg>`,
    outdent: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="4" x2="21" y2="4"/><line x1="11" y1="9" x2="21" y2="9"/><line x1="11" y1="14" x2="21" y2="14"/><line x1="3" y1="19" x2="21" y2="19"/><polyline points="7 8 3 11.5 7 15"/></svg>`,
    undo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 105.64-11.36L1 10"/></svg>`,
    redo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-5.64-11.36L23 10"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
    image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    table: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
    hr: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
    quote: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z"/></svg>`,
    print: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
    save: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
    fontColor: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 2L5.5 16h2.25l1.12-3h6.25l1.12 3h2.25L13 2h-2zm-1.38 9L12 4.67 14.38 11H9.62z"/></svg>`,
    highlight: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 20h16v2H4v-2zm1-4l4.5-13h3l4.5 13h-2.5l-1-3.25h-5l-1 3.25H5zm4.12-5.5h3.76L11 5.25l-1.88 5.25z"/></svg>`,
    clearFmt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h7.5L7.5 19H4"/><line x1="16" y1="4" x2="7" y2="20"/><line x1="20" y1="8" x2="12" y2="16"/></svg>`,
    sub: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 7l5.5 8H5v2h14v-2h-5.5L19 7h-3L12 13.5 8 7H5zm12 10v1h3v1h-3v1h4v-3h-4z"/></svg>`,
    sup: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 19l5.5-8H5V9h14v2h-5.5L19 19h-3l-4-6.5L8 19H5zm12-14v1h3v1h-3v1h4V5h-4z"/></svg>`,
    wordCount: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>`,
};


/* ============================================================
   spawnWriter — main entry point
============================================================ */
function spawnWriter(item) {
    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 28;
    const left = Math.min(40 + offset, window.innerWidth - 920);
    const top = Math.min(40 + offset, window.innerHeight - 680);

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.style.left = left + 'px';
    win.style.top = top + 'px';
    win.style.width = '900px';
    win.style.height = '660px';

    win.addEventListener('mousedown', () => focusWindow(windowId));

    const titleName = item?.name || 'Untitled.edoc';

    win.innerHTML = `
        <div class="title-bar">
            <button class="window-close-button" title="Close">✕</button>
            <button class="window-minimize-button" title="Minimize">—</button>
            <span class="title-bar-text"><img class="app-icon-title-bar" src="icons/16/writer.png" onerror="this.onerror=null;this.replaceWith(document.createTextNode('📝'))"> ${titleName} — Writer</span>
        </div>
        <div class="app-body" style="height:calc(100% - var(--titlebar-height));overflow:hidden;display:flex;flex-direction:column;"></div>
    `;

    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'writer', item } };

    win.querySelector('.title-bar').addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e, win);
    });
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);

    // Taskbar button
    const tbBtn = document.createElement('button');
    tbBtn.className = 'win-btn';
    tbBtn.dataset.winid = windowId;
    tbBtn.innerHTML = `<img class="app-icon-title-bar" src="icons/16/writer.png" onerror="this.onerror=null;this.replaceWith(document.createTextNode('📝'))"> ${titleName}`;
    tbBtn.onclick = () => {
        if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
        else focusWindow(windowId);
    };
    tbBtn.oncontextmenu = (ev) => {
        ev.preventDefault();
        buildMenu(ev.clientX, ev.clientY, [{ label: "Close", icon: "close", action: () => closeWindow(windowId) }]);
    };
    document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));
    windows[windowId].taskbarBtn = tbBtn;

    const body = win.querySelector('.app-body');
    _buildWriterBody(body, item, windowId, win);

    focusWindow(windowId);
    return windowId;
}

/* ============================================================
   Build the Writer UI
============================================================ */
function _buildWriterBody(body, item, windowId, winEl) {
    body.innerHTML = '';

    const root = document.createElement('div');
    root.className = 'writer-root';
    body.appendChild(root);

    // ── State ────────────────────────────────────────────────
    const wrState = {
        filePath: null,
        fileNode: item || null,
        dirty: false,
        zoom: 100,
        showRuler: true,
        showStatusBar: true,
        fileName: item?.name || 'Untitled.edoc',
    };

    // ── Parse existing .edoc or plain text ───────────────────
    let initialHtml = '<p><br></p>';
    if (item && item.content) {
        let raw = '';
        if (item.content instanceof ArrayBuffer) raw = new TextDecoder().decode(item.content);
        else raw = String(item.content);

        if (item.name?.endsWith('.edoc')) {
            try {
                const doc = JSON.parse(raw);
                if (doc.type === 'edoc' && doc.content) {
                    initialHtml = doc.content;
                } else {
                    initialHtml = `<p>${_escHtml(raw)}</p>`;
                }
            } catch {
                initialHtml = `<p>${_escHtml(raw)}</p>`;
            }
        } else {
            // Plain text or other file — wrap in paragraphs
            initialHtml = raw.split('\n').map(line => `<p>${_escHtml(line) || '<br>'}</p>`).join('');
        }
    }

    // ── Menu bar ─────────────────────────────────────────────
    const menubar = _el('div', 'wr-menubar');
    root.appendChild(menubar);

    const menus = {
        'File': [
            { label: 'New', icon: 'newFile', shortcut: 'Ctrl+N', action: () => spawnWriter() },
            { label: 'Open…', icon: 'open', shortcut: 'Ctrl+O', action: () => _wrOpen(wrState, page, winEl) },
            { sep: true },
            { label: 'Save', icon: 'save', shortcut: 'Ctrl+S', action: () => _wrSave(wrState, page, winEl) },
            { label: 'Save As…', shortcut: 'Ctrl+Shift+S', action: () => _wrSaveAs(wrState, page, winEl) },
            { sep: true },
            { label: 'Export as HTML', action: () => _wrExportHTML(wrState, page) },
            { label: 'Export as Text', action: () => _wrExportText(wrState, page) },
            { sep: true },
            { label: 'Print', icon: 'print', shortcut: 'Ctrl+P', action: () => _wrPrint(page) },
            { sep: true },
            { label: 'Close', action: () => closeWindow(windowId) },
        ],
        'Edit': [
            { label: 'Undo', icon: 'undo', shortcut: 'Ctrl+Z', action: () => _exec('undo') },
            { label: 'Redo', icon: 'redo', shortcut: 'Ctrl+Y', action: () => _exec('redo') },
            { sep: true },
            { label: 'Cut', shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
            { label: 'Copy', shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
            { label: 'Paste', shortcut: 'Ctrl+V', action: () => document.execCommand('paste') },
            { sep: true },
            { label: 'Select All', shortcut: 'Ctrl+A', action: () => _exec('selectAll') },
            { sep: true },
            { label: 'Find & Replace', shortcut: 'Ctrl+H', action: () => findBar.classList.toggle('open') },
        ],
        'Format': [
            { label: 'Bold', icon: 'bold', shortcut: 'Ctrl+B', action: () => _exec('bold') },
            { label: 'Italic', icon: 'italic', shortcut: 'Ctrl+I', action: () => _exec('italic') },
            { label: 'Underline', icon: 'underline', shortcut: 'Ctrl+U', action: () => _exec('underline') },
            { label: 'Strikethrough', icon: 'strike', action: () => _exec('strikeThrough') },
            { sep: true },
            { label: 'Superscript', icon: 'sup', action: () => _exec('superscript') },
            { label: 'Subscript', icon: 'sub', action: () => _exec('subscript') },
            { sep: true },
            { label: 'Clear Formatting', icon: 'clearFmt', action: () => _exec('removeFormat') },
        ],
        'Insert': [
            { label: 'Horizontal Rule', icon: 'hr', action: () => _exec('insertHorizontalRule') },
            { label: 'Blockquote', icon: 'quote', action: () => _exec('formatBlock', 'blockquote') },
            { sep: true },
            { label: 'Link…', icon: 'link', action: () => _wrInsertLink(page) },
            { label: 'Image from URL…', icon: 'image', action: () => _wrInsertImage() },
            { sep: true },
            { label: 'Table (3×3)', icon: 'table', action: () => _wrInsertTable(page, 3, 3) },
            { label: 'Table (4×4)', icon: 'table', action: () => _wrInsertTable(page, 4, 4) },
            { sep: true },
            { label: 'Date/Time', action: () => _exec('insertText', new Date().toLocaleString()) },
        ],
        'View': [
            { label: 'Zoom In', shortcut: 'Ctrl++', action: () => { wrState.zoom = Math.min(200, wrState.zoom + 10); _applyWriterZoom(page, wrState, zoomLabel); } },
            { label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => { wrState.zoom = Math.max(50, wrState.zoom - 10); _applyWriterZoom(page, wrState, zoomLabel); } },
            { label: 'Reset Zoom', shortcut: 'Ctrl+0', action: () => { wrState.zoom = 100; _applyWriterZoom(page, wrState, zoomLabel); } },
            { sep: true },
            { label: 'Toggle Ruler', action: () => { wrState.showRuler = !wrState.showRuler; ruler.style.display = wrState.showRuler ? 'flex' : 'none'; } },
            { label: 'Toggle Status Bar', action: () => { wrState.showStatusBar = !wrState.showStatusBar; statusbar.style.display = wrState.showStatusBar ? 'flex' : 'none'; } },
            { sep: true },
            { label: 'Word Count', icon: 'wordCount', action: () => _wrShowWordCount(page) },
        ],
        'Help': [
            { label: 'About Writer', action: async () => await openCustomAppFromPath("/usr/share/writer/about-writer.app") },
            { label: 'Keyboard Shortcuts', action: () => _wrShowShortcuts() },
        ],
    };

    let openDropdown = null;

    for (const [menuName, items] of Object.entries(menus)) {
        const mi = _el('div', 'wr-menu-item');
        mi.textContent = menuName;
        const dd = _el('div', 'wr-dropdown');

        for (const entry of items) {
            if (entry.sep) {
                dd.appendChild(_el('div', 'wr-dd-sep'));
                continue;
            }
            const row = _el('div', 'wr-dd-item');

            const iconSpan = _el('span', 'dd-icon');
            if (entry.icon && WR_SVG[entry.icon]) {
                iconSpan.innerHTML = WR_SVG[entry.icon];
            } else if (entry.icon && CTX_ICONS[entry.icon]) {
                iconSpan.innerHTML = CTX_ICONS[entry.icon];
            }
            row.appendChild(iconSpan);

            const labelSpan = document.createElement('span');
            labelSpan.textContent = entry.label;
            row.appendChild(labelSpan);

            if (entry.shortcut) {
                const sc = _el('span', 'dd-shortcut');
                sc.textContent = entry.shortcut;
                row.appendChild(sc);
            }

            row.onmousedown = (e) => {
                e.stopPropagation();
                _closeWriterMenus(menubar);
                openDropdown = null;
                entry.action();
                page.focus();
            };
            dd.appendChild(row);
        }

        mi.appendChild(dd);
        mi.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dd.classList.contains('open');
            _closeWriterMenus(menubar);
            if (!isOpen) {
                dd.classList.add('open');
                openDropdown = dd;
            } else {
                openDropdown = null;
            }
        });
        mi.addEventListener('mouseenter', () => {
            if (openDropdown && openDropdown !== dd) {
                _closeWriterMenus(menubar);
                dd.classList.add('open');
                openDropdown = dd;
            }
        });
        menubar.appendChild(mi);
    }

    document.addEventListener('mousedown', (e) => {
        if (!menubar.contains(e.target)) {
            _closeWriterMenus(menubar);
            openDropdown = null;
        }
    });

    // ── Toolbar ──────────────────────────────────────────────
    const toolbar = _el('div', 'wr-toolbar');
    root.appendChild(toolbar);

    // Undo / Redo
    const grpHistory = _tbGroup(toolbar);
    _tbBtn(grpHistory, WR_SVG.undo, 'Undo', () => _exec('undo'));
    _tbBtn(grpHistory, WR_SVG.redo, 'Redo', () => _exec('redo'));

    // Font family & size
    const grpFont = _tbGroup(toolbar);
    const fontSelect = document.createElement('select');
    fontSelect.className = 'wr-tb-select';
    fontSelect.title = 'Font Family';
    ['Georgia', 'Times New Roman', 'Arial', 'Helvetica', 'Verdana', 'Courier New', 'Tahoma', 'Trebuchet MS', 'Garamond', 'Comic Sans MS'].forEach(f => {
        const opt = document.createElement('option');
        opt.value = f; opt.textContent = f; opt.style.fontFamily = f;
        fontSelect.appendChild(opt);
    });
    fontSelect.onchange = () => { _exec('fontName', fontSelect.value); page.focus(); };
    grpFont.appendChild(fontSelect);

    const sizeSelect = document.createElement('select');
    sizeSelect.className = 'wr-tb-select';
    sizeSelect.title = 'Font Size';
    sizeSelect.style.width = '52px';
    [1, 2, 3, 4, 5, 6, 7].forEach(s => {
        const labels = { 1: '8', 2: '10', 3: '12', 4: '14', 5: '18', 6: '24', 7: '36' };
        const opt = document.createElement('option');
        opt.value = s; opt.textContent = labels[s];
        if (s === 3) opt.selected = true;
        sizeSelect.appendChild(opt);
    });
    sizeSelect.onchange = () => { _exec('fontSize', sizeSelect.value); page.focus(); };
    grpFont.appendChild(sizeSelect);

    // Heading select
    const headingSelect = document.createElement('select');
    headingSelect.className = 'wr-tb-select';
    headingSelect.title = 'Paragraph Style';
    headingSelect.style.width = '90px';
    [['p', 'Normal'], ['h1', 'Heading 1'], ['h2', 'Heading 2'], ['h3', 'Heading 3'], ['pre', 'Code Block']].forEach(([v, l]) => {
        const opt = document.createElement('option');
        opt.value = v; opt.textContent = l;
        headingSelect.appendChild(opt);
    });
    headingSelect.onchange = () => { _exec('formatBlock', headingSelect.value); page.focus(); };
    grpFont.appendChild(headingSelect);

    // Bold / Italic / Underline / Strike
    const grpFmt = _tbGroup(toolbar);
    const btnBold = _tbBtn(grpFmt, WR_SVG.bold, 'Bold (Ctrl+B)', () => _exec('bold'));
    const btnItalic = _tbBtn(grpFmt, WR_SVG.italic, 'Italic (Ctrl+I)', () => _exec('italic'));
    const btnUnderline = _tbBtn(grpFmt, WR_SVG.underline, 'Underline (Ctrl+U)', () => _exec('underline'));
    _tbBtn(grpFmt, WR_SVG.strike, 'Strikethrough', () => _exec('strikeThrough'));
    _tbBtn(grpFmt, WR_SVG.sup, 'Superscript', () => _exec('superscript'));
    _tbBtn(grpFmt, WR_SVG.sub, 'Subscript', () => _exec('subscript'));

    // Colors
    const grpColor = _tbGroup(toolbar);
    _tbColorBtn(grpColor, WR_SVG.fontColor, 'Text Color', '#d4d4d4', (color) => _exec('foreColor', color));
    _tbColorBtn(grpColor, WR_SVG.highlight, 'Highlight', '#ffff00', (color) => _exec('hiliteColor', color));

    // Alignment
    const grpAlign = _tbGroup(toolbar);
    _tbBtn(grpAlign, WR_SVG.alignL, 'Align Left', () => _exec('justifyLeft'));
    _tbBtn(grpAlign, WR_SVG.alignC, 'Center', () => _exec('justifyCenter'));
    _tbBtn(grpAlign, WR_SVG.alignR, 'Align Right', () => _exec('justifyRight'));
    _tbBtn(grpAlign, WR_SVG.alignJ, 'Justify', () => _exec('justifyFull'));

    // Lists & indent
    const grpList = _tbGroup(toolbar);
    _tbBtn(grpList, WR_SVG.ul, 'Bullet List', () => _exec('insertUnorderedList'));
    _tbBtn(grpList, WR_SVG.ol, 'Numbered List', () => _exec('insertOrderedList'));
    _tbBtn(grpList, WR_SVG.indent, 'Indent', () => _exec('indent'));
    _tbBtn(grpList, WR_SVG.outdent, 'Outdent', () => _exec('outdent'));

    // Insert
    const grpInsert = _tbGroup(toolbar);
    _tbBtn(grpInsert, WR_SVG.link, 'Insert Link', () => _wrInsertLink(page));
    _tbBtn(grpInsert, WR_SVG.image, 'Insert Image', () => _wrInsertImage());
    _tbBtn(grpInsert, WR_SVG.table, 'Insert Table', () => _wrInsertTable(page, 3, 3));
    _tbBtn(grpInsert, WR_SVG.hr, 'Horizontal Rule', () => _exec('insertHorizontalRule'));
    _tbBtn(grpInsert, WR_SVG.quote, 'Blockquote', () => _exec('formatBlock', 'blockquote'));

    // Clear formatting
    const grpClear = _tbGroup(toolbar);
    _tbBtn(grpClear, WR_SVG.clearFmt, 'Clear Formatting', () => _exec('removeFormat'));

    // ── Find / Replace bar ───────────────────────────────────
    const findBar = _el('div', 'wr-find-bar');
    root.appendChild(findBar);

    const findInput = document.createElement('input');
    findInput.placeholder = 'Find…';
    const replInput = document.createElement('input');
    replInput.placeholder = 'Replace…';
    const findNextBtn = document.createElement('button');
    findNextBtn.textContent = 'Next';
    const findPrevBtn = document.createElement('button');
    findPrevBtn.textContent = 'Prev';
    const replBtn = document.createElement('button');
    replBtn.textContent = 'Replace';
    const replAllBtn = document.createElement('button');
    replAllBtn.textContent = 'All';
    const frClose = _el('span', 'fr-close');
    frClose.textContent = '✕';
    frClose.onclick = () => findBar.classList.remove('open');

    findBar.appendChild(findInput);
    findBar.appendChild(findNextBtn);
    findBar.appendChild(findPrevBtn);
    findBar.appendChild(replInput);
    findBar.appendChild(replBtn);
    findBar.appendChild(replAllBtn);
    findBar.appendChild(frClose);

    findNextBtn.onclick = () => {
        if (findInput.value) window.find(findInput.value, false, false, true);
    };
    findPrevBtn.onclick = () => {
        if (findInput.value) window.find(findInput.value, false, true, true);
    };
    replBtn.onclick = () => {
        const sel = window.getSelection();
        if (sel.toString() === findInput.value) {
            _exec('insertText', replInput.value);
        }
        window.find(findInput.value, false, false, true);
    };
    replAllBtn.onclick = () => {
        if (!findInput.value) return;
        const html = page.innerHTML;
        const escaped = findInput.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        page.innerHTML = html.replace(new RegExp(escaped, 'g'), replInput.value);
        _markDirty(wrState, winEl);
    };

    // ── Ruler ────────────────────────────────────────────────
    const ruler = _el('div', 'wr-ruler');
    root.appendChild(ruler);
    _buildRuler(ruler);

    // ── Editor area ──────────────────────────────────────────
    const editorArea = _el('div', 'wr-editor-area');
    root.appendChild(editorArea);

    const page = document.createElement('div');
    page.className = 'wr-page';
    page.contentEditable = 'true';
    page.spellcheck = true;
    page.innerHTML = initialHtml;
    editorArea.appendChild(page);

    // Track dirty state
    page.addEventListener('input', () => _markDirty(wrState, winEl));

    // Update toolbar state on selection change
    document.addEventListener('selectionchange', () => {
        if (!document.activeElement || !page.contains(document.activeElement) && document.activeElement !== page) return;
        btnBold.classList.toggle('active', document.queryCommandState('bold'));
        btnItalic.classList.toggle('active', document.queryCommandState('italic'));
        btnUnderline.classList.toggle('active', document.queryCommandState('underline'));
    });

    // ── Status bar ───────────────────────────────────────────
    const statusbar = _el('div', 'wr-statusbar');
    root.appendChild(statusbar);

    const wordCountSpan = document.createElement('span');
    wordCountSpan.textContent = 'Words: 0';
    statusbar.appendChild(wordCountSpan);

    statusbar.appendChild(_el('div', 'wr-sb-sep'));

    const charCountSpan = document.createElement('span');
    charCountSpan.textContent = 'Chars: 0';
    statusbar.appendChild(charCountSpan);

    statusbar.appendChild(_el('div', 'wr-sb-sep'));

    const lineCountSpan = document.createElement('span');
    lineCountSpan.textContent = 'Lines: 1';
    statusbar.appendChild(lineCountSpan);

    const zoomControls = _el('div', 'wr-zoom-controls');
    const zoomOutBtn = _el('button', 'wr-zoom-btn');
    zoomOutBtn.textContent = '−';
    zoomOutBtn.onclick = () => { wrState.zoom = Math.max(50, wrState.zoom - 10); _applyWriterZoom(page, wrState, zoomLabel); };
    const zoomLabel = document.createElement('span');
    zoomLabel.textContent = '100%';
    const zoomInBtn = _el('button', 'wr-zoom-btn');
    zoomInBtn.textContent = '+';
    zoomInBtn.onclick = () => { wrState.zoom = Math.min(200, wrState.zoom + 10); _applyWriterZoom(page, wrState, zoomLabel); };
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(zoomLabel);
    zoomControls.appendChild(zoomInBtn);
    statusbar.appendChild(zoomControls);

    // Update word / char counts periodically
    function updateCounts() {
        const text = page.innerText || '';
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const chars = text.length;
        const lines = (text.match(/\n/g) || []).length + 1;
        wordCountSpan.textContent = `Words: ${words}`;
        charCountSpan.textContent = `Chars: ${chars}`;
        lineCountSpan.textContent = `Lines: ${lines}`;
    }
    page.addEventListener('input', updateCounts);
    updateCounts();

    // ── Keyboard shortcuts ───────────────────────────────────
    winEl.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 's' || e.key === 'S') {
                e.preventDefault();
                if (e.shiftKey) _wrSaveAs(wrState, page, winEl);
                else _wrSave(wrState, page, winEl);
            } else if (e.key === 'n' || e.key === 'N') {
                e.preventDefault();
                spawnWriter();
            } else if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                findBar.classList.toggle('open');
                if (findBar.classList.contains('open')) findInput.focus();
            } else if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                _wrPrint(page);
            } else if (e.key === '=' || e.key === '+') {
                e.preventDefault();
                wrState.zoom = Math.min(200, wrState.zoom + 10);
                _applyWriterZoom(page, wrState, zoomLabel);
            } else if (e.key === '-') {
                e.preventDefault();
                wrState.zoom = Math.max(50, wrState.zoom - 10);
                _applyWriterZoom(page, wrState, zoomLabel);
            } else if (e.key === '0') {
                e.preventDefault();
                wrState.zoom = 100;
                _applyWriterZoom(page, wrState, zoomLabel);
            }
        }
    });

    page.focus();
}


/* ============================================================
   Writer helper functions
============================================================ */
function _el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
}

function _escHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function _exec(cmd, val) {
    document.execCommand(cmd, false, val || null);
}

function _tbGroup(toolbar) {
    const g = _el('div', 'wr-tb-group');
    toolbar.appendChild(g);
    return g;
}

function _tbBtn(parent, svgOrHtml, title, action) {
    const btn = _el('button', 'wr-tb-btn');
    btn.title = title;
    btn.innerHTML = svgOrHtml;
    btn.onmousedown = (e) => e.preventDefault(); // keep focus on page
    btn.onclick = () => action();
    parent.appendChild(btn);
    return btn;
}

function _tbColorBtn(parent, svgIcon, title, defaultColor, action) {
    const wrap = _el('div', 'wr-tb-color-btn');
    wrap.title = title;
    wrap.innerHTML = svgIcon;

    const swatch = _el('div', 'wr-tb-color-swatch');
    swatch.style.background = defaultColor;
    wrap.appendChild(swatch);

    const input = document.createElement('input');
    input.type = 'color';
    input.className = 'wr-tb-color-input';
    input.value = defaultColor;
    input.onmousedown = (e) => e.stopPropagation();
    input.oninput = () => {
        swatch.style.background = input.value;
        action(input.value);
    };
    wrap.appendChild(input);
    parent.appendChild(wrap);
    return wrap;
}

function _closeWriterMenus(menubar) {
    menubar.querySelectorAll('.wr-dropdown').forEach(d => d.classList.remove('open'));
}

function _buildRuler(ruler) {
    const inner = _el('div', 'wr-ruler-inner');
    inner.style.width = '816px';
    const DPI = 96;
    for (let i = 0; i <= 8; i++) {
        const x = i * DPI;
        const tick = _el('div', 'wr-ruler-tick');
        tick.style.left = x + 'px';
        tick.style.height = '10px';
        inner.appendChild(tick);

        const num = _el('div', 'wr-ruler-num');
        num.style.left = x + 'px';
        num.textContent = i;
        inner.appendChild(num);

        // Half-inch ticks
        if (i < 8) {
            const half = _el('div', 'wr-ruler-tick');
            half.style.left = (x + DPI / 2) + 'px';
            half.style.height = '6px';
            inner.appendChild(half);

            // Quarter ticks
            const q1 = _el('div', 'wr-ruler-tick');
            q1.style.left = (x + DPI / 4) + 'px';
            q1.style.height = '3px';
            inner.appendChild(q1);
            const q3 = _el('div', 'wr-ruler-tick');
            q3.style.left = (x + 3 * DPI / 4) + 'px';
            q3.style.height = '3px';
            inner.appendChild(q3);
        }
    }
    ruler.appendChild(inner);
}

function _applyWriterZoom(page, wrState, zoomLabel) {
    const pct = wrState.zoom / 100;
    page.style.transform = `scale(${pct})`;
    page.style.transformOrigin = 'top center';
    zoomLabel.textContent = wrState.zoom + '%';
}

function _markDirty(wrState, winEl) {
    if (!wrState.dirty) {
        wrState.dirty = true;
        const title = winEl.querySelector('.title-bar-text');
        if (title && !title.textContent.startsWith('● ')) {
            title.innerHTML = '● ' + title.innerHTML;
        }
    }
}

function _buildEdocJson(wrState, page) {
    return JSON.stringify({
        type: 'edoc',
        version: 1,
        title: wrState.fileName.replace(/\.edoc$/i, ''),
        author: getUsername(),
        content: page.innerHTML,
        pageSettings: {
            pageSize: 'letter',
            marginTop: 1,
            marginBottom: 1,
            marginLeft: 1.25,
            marginRight: 1.25,
        },
        created: wrState.fileNode?.createdAt || Date.now(),
        modified: Date.now(),
    }, null, 2);
}

async function _wrSave(wrState, page, winEl) {
    const json = _buildEdocJson(wrState, page);

    if (wrState.fileNode && wrState.fileNode.id) {
        // Update existing file
        wrState.fileNode.content = json;
        wrState.fileNode.updatedAt = Date.now();
        wrState.fileNode.size = new Blob([json]).size;
        await idbPut(wrState.fileNode);
    } else {
        // Create new file in Documents
        const username = getUsername();
        const path = `/home/${username}/Documents/${wrState.fileName}`;
        const node = await createFile(path, json);
        wrState.fileNode = node;
    }

    wrState.dirty = false;
    const title = winEl.querySelector('.title-bar-text');
    if (title) {
        title.innerHTML = title.innerHTML.replace(/^● /, '');
    }
    await renderAllWindows();
}

async function _wrSaveAs(wrState, page, winEl) {
    const name = prompt('Save as:', wrState.fileName);
    if (!name) return;
    wrState.fileName = name.endsWith('.edoc') ? name : name + '.edoc';
    wrState.fileNode = null; // Force creating a new file
    await _wrSave(wrState, page, winEl);

    // Update title bar
    const title = winEl.querySelector('.title-bar-text');
    if (title) {
        title.innerHTML = `<img class="app-icon-title-bar" src="icons/16/writer.png" onerror="this.onerror=null;this.replaceWith(document.createTextNode('📝'))"> ${wrState.fileName} — Writer`;
    }
}

async function _wrOpen(wrState, page, winEl) {
    // Use real file picker via hidden input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.edoc,.txt,.html,.htm,.md';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        let html = '';

        if (file.name.endsWith('.edoc')) {
            try {
                const doc = JSON.parse(text);
                html = doc.content || '<p><br></p>';
            } catch {
                html = `<p>${_escHtml(text)}</p>`;
            }
        } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
            html = text;
        } else {
            html = text.split('\n').map(l => `<p>${_escHtml(l) || '<br>'}</p>`).join('');
        }

        page.innerHTML = html;
        wrState.fileName = file.name.endsWith('.edoc') ? file.name : file.name.replace(/\.[^.]+$/, '.edoc');
        wrState.fileNode = null;
        wrState.dirty = false;

        const title = winEl.querySelector('.title-bar-text');
        if (title) {
            title.innerHTML = `<img class="app-icon-title-bar" src="icons/16/writer.png" onerror="this.onerror=null;this.replaceWith(document.createTextNode('📝'))"> ${wrState.fileName} — Writer`;
        }
    };
    input.click();
}

function _wrExportHTML(wrState, page) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${wrState.fileName}</title></head><body>${page.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = wrState.fileName.replace(/\.edoc$/i, '.html');
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
}

function _wrExportText(wrState, page) {
    const text = page.innerText || '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = wrState.fileName.replace(/\.edoc$/i, '.txt');
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
}

function _wrPrint(page) {
    const printWin = window.open('', '_blank');
    printWin.document.write(`<!DOCTYPE html><html><head><title>Print</title><style>
        body { font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.6; padding: 48px; color: #000; }
        h1 { font-size: 28px; } h2 { font-size: 22px; } h3 { font-size: 18px; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #999; padding: 6px 10px; }
        th { background: #eee; } blockquote { border-left: 3px solid #333; padding: 8px 16px; }
    </style></head><body>${page.innerHTML}</body></html>`);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); printWin.close(); }, 300);
}

function _wrInsertLink(page) {
    const url = prompt('Enter URL:', 'https://');
    if (!url) return;
    const sel = window.getSelection();
    if (sel.toString()) {
        _exec('createLink', url);
    } else {
        const text = prompt('Link text:', url);
        _exec('insertHTML', `<a href="${url}" target="_blank">${_escHtml(text || url)}</a>`);
    }
    page.focus();
}

function _wrInsertImage() {
    const url = prompt('Image URL:', 'https://');
    if (!url) return;
    _exec('insertHTML', `<img src="${url}" alt="image" style="max-width:100%">`);
}

function _wrInsertTable(page, rows, cols) {
    let html = '<table>';
    // Header row
    html += '<tr>';
    for (let c = 0; c < cols; c++) html += `<th>Header ${c + 1}</th>`;
    html += '</tr>';
    // Body rows
    for (let r = 1; r < rows; r++) {
        html += '<tr>';
        for (let c = 0; c < cols; c++) html += '<td>&nbsp;</td>';
        html += '</tr>';
    }
    html += '</table><p><br></p>';
    _exec('insertHTML', html);
    page.focus();
}

function _wrShowWordCount(page) {
    const text = page.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const lines = (text.match(/\n/g) || []).length + 1;
    const paragraphs = (page.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li')).length || 1;

    alert(
        `Word Count Statistics\n\n` +
        `Words: ${words.toLocaleString()}\n` +
        `Characters: ${chars.toLocaleString()}\n` +
        `Characters (no spaces): ${charsNoSpaces.toLocaleString()}\n` +
        `Lines: ${lines.toLocaleString()}\n` +
        `Paragraphs: ${paragraphs.toLocaleString()}\n` +
        `Reading time: ~${Math.max(1, Math.ceil(words / 200))} min`
    );
}

function _wrShowShortcuts() {
    alert(
        `Writer Keyboard Shortcuts\n\n` +
        `Ctrl+S        Save\n` +
        `Ctrl+Shift+S  Save As\n` +
        `Ctrl+N        New Document\n` +
        `Ctrl+P        Print\n` +
        `Ctrl+H        Find & Replace\n` +
        `Ctrl+B        Bold\n` +
        `Ctrl+I        Italic\n` +
        `Ctrl+U        Underline\n` +
        `Ctrl+Z        Undo\n` +
        `Ctrl+Y        Redo\n` +
        `Ctrl+A        Select All\n` +
        `Ctrl++        Zoom In\n` +
        `Ctrl+-        Zoom Out\n` +
        `Ctrl+0        Reset Zoom`
    );
}


/* ── Expose globally ──────────────────────────────────────── */
window.spawnWriter = spawnWriter;
