/* ============================================================
   E-Dog OS App IDE
   ide.js — Write, preview, and compile .app files

   Add to index.html AFTER startmenu.js:
     <script src="js/ide.js"></script>
============================================================ */

(function () {

    /* ── Per-window state ──────────────────────────────────── */
    const ideStates = {};

    /* ── Spawn IDE window ──────────────────────────────────── */
    /**
     * Open the App IDE.
     * @param {string|object} [existingContent]  JSON string or parsed object of a .app file to load
     * @param {string}        [filePath]         Virtual FS path the file came from
     */
    function spawnIDE(existingContent, filePath) {
        const W = 1060, H = 700;
        const windowId = 'win_' + (++winCount);
        const offset   = (winCount - 1) * 22;
        const left     = Math.max(20, Math.min(50 + offset, window.innerWidth  - W - 20));
        const top      = Math.max(20, Math.min(40 + offset, window.innerHeight - H - 60));

        const win = document.createElement('div');
        win.className  = 'app-window';
        win.id         = windowId;
        win.style.cssText = `left:${left}px;top:${top}px;width:${W}px;height:${H}px;`;
        win.addEventListener('mousedown', () => focusWindow(windowId));

        win.innerHTML = `
            <div class="title-bar" id="ide-titlebar-${windowId}">
                <button class="window-close-button"    title="Close">✕</button>
                <button class="window-minimize-button" title="Minimize">—</button>
                <button class="window-maximize-button" title="Maximize">□</button>
                <span class="title-bar-text" id="ide-titlelabel-${windowId}">
                    <img class="app-icon-title-bar" src="icons/16/text-editor.png"> IDE – New App
                </span>
            </div>
            <div class="app-body" id="ide-body-${windowId}"
                 style="height:calc(100% - var(--titlebar-height));overflow:hidden;display:flex;flex-direction:column;"></div>
        `;

        document.getElementById('windowContainer').appendChild(win);

        /* init state */
        ideStates[windowId] = {
            appConfig: { name: 'New App', width: 800, height: 600, icon: '📦', customIcon: '' },
            html: _IDE_DEFAULT_HTML,
            filePath: filePath || null,
            dirty: false,
            previewVisible: true,
            fontSize: 13,
        };

        if (existingContent) {
            _loadIntoState(windowId, existingContent, filePath || null);
        }

        /* wire title bar */
        win.querySelector('.title-bar').addEventListener('mousedown', e => {
            if (e.target.closest('button')) return;
            startDrag(e, win);
        });
        win.querySelector('.window-close-button')   .onclick = () => _ideClose(windowId);
        win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);
        win.querySelector('.window-maximize-button').onclick = () => maximizeWindow(windowId);

        windows[windowId] = { el: win, state: { type: 'ide' }, taskbarBtn: null };

        /* taskbar button */
        const tbBtn = document.createElement('button');
        tbBtn.className         = 'win-btn';
        tbBtn.dataset.winid     = windowId;
        tbBtn.innerHTML         = '<img class="app-icon-title-bar" src="icons/16/text-editor.png"> IDE';
        tbBtn.onclick = () => {
            if (win.style.display === 'none') { win.style.display = ''; focusWindow(windowId); }
            else focusWindow(windowId);
        };
        tbBtn.oncontextmenu = ev => {
            ev.preventDefault();
            buildMenu(ev.clientX, ev.clientY, [
                { label: 'Close', icon: 'close', action: () => _ideClose(windowId) }
            ]);
        };
        document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));
        windows[windowId].taskbarBtn = tbBtn;

        /* build UI */
        _buildUI(windowId);
        focusWindow(windowId);
        _ideUpdateTitle(windowId);
        return windowId;
    }

    /* ── Load content into state ──────────────────────────── */
    function _loadIntoState(windowId, content, path) {
        const st = ideStates[windowId];
        try {
            const parsed = (typeof content === 'string') ? JSON.parse(content) : content;
            st.appConfig = {
                name:       parsed.name       || 'App',
                width:      parsed.width      || 800,
                height:     parsed.height     || 600,
                icon:       parsed.icon       || '📦',
                customIcon: parsed.customIcon || '',
            };
            st.html     = parsed.html || '';
            st.filePath = path || null;
            st.dirty    = false;
        } catch (e) {
            /* leave defaults */
        }
    }

    /* ── Build the IDE DOM ────────────────────────────────── */
    function _buildUI(windowId) {
        const body = document.getElementById(`ide-body-${windowId}`);
        const st   = ideStates[windowId];

        body.innerHTML = `
            <div class="ide-wrap" id="ide-wrap-${windowId}">

                <!-- Menu Bar -->
                <div class="ide-menubar" id="ide-mb-${windowId}">
                    <div class="ide-mb-item" data-menu="file">File</div>
                    <div class="ide-mb-item" data-menu="edit">Edit</div>
                    <div class="ide-mb-item" data-menu="view">View</div>
                    <div class="ide-mb-item" data-menu="app">App</div>
                    <div class="ide-mb-item" data-menu="help">Help</div>
                </div>

                <!-- Toolbar -->
                <div class="ide-toolbar" id="ide-tb-${windowId}">
                    <button class="ide-tb-btn" title="New (Ctrl+N)"    onclick="ideNew('${windowId}')">
                        ${SVG.new} New
                    </button>
                    <button class="ide-tb-btn" title="Open (Ctrl+O)"   onclick="ideOpenDialog('${windowId}')">
                        ${SVG.open} Open
                    </button>
                    <button class="ide-tb-btn" title="Save (Ctrl+S)"   onclick="ideSave('${windowId}')">
                        ${SVG.save} Save
                    </button>
                    <div class="ide-tb-sep"></div>
                    <button class="ide-tb-btn ide-tb-run" title="Run in OS" onclick="ideRun('${windowId}')">
                        ${SVG.run} Run
                    </button>
                    <button class="ide-tb-btn" title="Toggle Preview"  onclick="ideTogglePreview('${windowId}')">
                        ${SVG.preview} Preview
                    </button>
                    <div class="ide-tb-sep"></div>
                    <button class="ide-tb-btn" title="App Config"      onclick="ideAppConfig('${windowId}')">
                        ${SVG.config} Config
                    </button>
                    <button class="ide-tb-btn" title="Compile / Export (.app)" onclick="ideCompile('${windowId}')">
                        ${SVG.compile} Compile
                    </button>
                </div>

                <!-- Find Bar (hidden) -->
                <div class="ide-findbar" id="ide-findbar-${windowId}" style="display:none">
                    <span class="ide-find-label">Find:</span>
                    <input  class="ide-find-input" id="ide-findinput-${windowId}" type="text"
                            placeholder="Search…" autocomplete="off" spellcheck="false"
                            onkeydown="ideFindKey(event,'${windowId}')">
                    <button class="ide-find-btn" onclick="ideFindNext('${windowId}')">Next ▼</button>
                    <button class="ide-find-btn" onclick="ideFindPrev('${windowId}')">Prev ▲</button>
                    <span class="ide-find-count" id="ide-findcount-${windowId}"></span>
                    <button class="ide-find-close" onclick="ideFindClose('${windowId}')">✕</button>
                </div>

                <!-- Main split area -->
                <div class="ide-main" id="ide-main-${windowId}">

                    <!-- Editor pane -->
                    <div class="ide-epane" id="ide-epane-${windowId}">
                        <div class="ide-pane-hdr">
                            <span class="ide-pane-title">${SVG.html_file} index.html</span>
                            <span class="ide-lang-tag">HTML</span>
                        </div>
                        <div class="ide-editor-wrap" id="ide-ewrap-${windowId}">
                            <div class="ide-linenums" id="ide-linenums-${windowId}"></div>
                            <textarea class="ide-code" id="ide-code-${windowId}"
                                      spellcheck="false" autocomplete="off"
                                      autocorrect="off" autocapitalize="off"></textarea>
                        </div>
                    </div>

                    <!-- Drag resizer -->
                    <div class="ide-resizer" id="ide-resizer-${windowId}" title="Drag to resize"></div>

                    <!-- Preview pane -->
                    <div class="ide-ppane" id="ide-ppane-${windowId}">
                        <div class="ide-pane-hdr">
                            <span class="ide-pane-title">${SVG.preview_icon} Preview</span>
                            <button class="ide-refresh-btn" title="Refresh preview"
                                    onclick="ideRefreshPreview('${windowId}')">↻</button>
                        </div>
                        <div class="ide-preview-wrap">
                            <iframe class="ide-preview-frame" id="ide-preview-${windowId}"
                                    sandbox="allow-scripts allow-same-origin"></iframe>
                        </div>
                    </div>

                </div><!-- /ide-main -->

                <!-- Status bar -->
                <div class="ide-statusbar">
                    <span class="ide-sb-app"  id="ide-sb-app-${windowId}"></span>
                    <span class="ide-sb-sep">│</span>
                    <span class="ide-sb-pos"  id="ide-sb-pos-${windowId}">Ln 1, Col 1</span>
                    <span class="ide-sb-sep">│</span>
                    <span class="ide-sb-size" id="ide-sb-size-${windowId}"></span>
                    <span style="flex:1"></span>
                    <span class="ide-sb-dirty" id="ide-sb-dirty-${windowId}"></span>
                </div>

            </div>
        `;

        /* populate textarea */
        const ta = document.getElementById(`ide-code-${windowId}`);
        ta.value = st.html;
        ta.style.fontSize = st.fontSize + 'px';

        /* wire textarea */
        ta.addEventListener('input',   ()  => _onCodeChange(windowId));
        ta.addEventListener('keydown', (e) => _onCodeKeyDown(e, windowId));
        ta.addEventListener('scroll',  ()  => _syncLineNums(windowId));
        ta.addEventListener('click',   ()  => _updatePos(windowId));
        ta.addEventListener('keyup',   ()  => _updatePos(windowId));

        /* wire menu bar */
        document.getElementById(`ide-mb-${windowId}`)
            .querySelectorAll('.ide-mb-item')
            .forEach(item => item.addEventListener('click', e => {
                e.stopPropagation();
                _showMenu(windowId, item.dataset.menu, item);
            }));

        /* wire pane resizer */
        _initResizer(windowId);

        /* initial render */
        _updateLineNums(windowId);
        _updateStatusBar(windowId);
        ideRefreshPreview(windowId);
    }

    /* ================================================================
       EDITOR — line numbers, key handling, cursor
    ================================================================ */

    function _updateLineNums(windowId) {
        const ta    = document.getElementById(`ide-code-${windowId}`);
        const lnDiv = document.getElementById(`ide-linenums-${windowId}`);
        if (!ta || !lnDiv) return;
        const count = ta.value.split('\n').length;
        let html = '';
        for (let i = 1; i <= count; i++) html += `<div>${i}</div>`;
        lnDiv.innerHTML = html;
        /* keep line heights in sync */
        lnDiv.style.fontSize = ta.style.fontSize || '13px';
    }

    function _syncLineNums(windowId) {
        const ta    = document.getElementById(`ide-code-${windowId}`);
        const lnDiv = document.getElementById(`ide-linenums-${windowId}`);
        if (ta && lnDiv) lnDiv.scrollTop = ta.scrollTop;
    }

    function _onCodeChange(windowId) {
        const ta = document.getElementById(`ide-code-${windowId}`);
        const st = ideStates[windowId];
        st.html  = ta.value;
        st.dirty = true;
        _updateLineNums(windowId);
        _updateStatusBar(windowId);
        _ideUpdateTitle(windowId);
        /* debounced preview refresh */
        clearTimeout(st._previewTimer);
        st._previewTimer = setTimeout(() => ideRefreshPreview(windowId), 700);
    }

    function _onCodeKeyDown(e, windowId) {
        const ta  = e.target;
        const st  = ideStates[windowId];

        /* Tab → 4 spaces */
        if (e.key === 'Tab') {
            e.preventDefault();
            const s = ta.selectionStart, en = ta.selectionEnd;
            ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en);
            ta.selectionStart = ta.selectionEnd = s + 4;
            _onCodeChange(windowId);
            return;
        }

        /* Enter → auto-indent (+ extra indent after opening tags) */
        if (e.key === 'Enter') {
            e.preventDefault();
            const s    = ta.selectionStart;
            const val  = ta.value;
            const lsPos = val.lastIndexOf('\n', s - 1) + 1;
            const line  = val.slice(lsPos, s);
            const indent = line.match(/^(\s*)/)[1];
            const extra  = />\s*$/.test(line.trimEnd()) && !/>\//.test(line.trimEnd()) ? '    ' : '';
            const ins    = '\n' + indent + extra;
            ta.value     = val.slice(0, s) + ins + val.slice(ta.selectionEnd);
            ta.selectionStart = ta.selectionEnd = s + ins.length;
            _onCodeChange(windowId);
            return;
        }

        /* Ctrl / Cmd shortcuts */
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 's': e.preventDefault(); ideSave(windowId); break;
                case 'n': e.preventDefault(); ideNew(windowId); break;
                case 'o': e.preventDefault(); ideOpenDialog(windowId); break;
                case 'f': e.preventDefault(); ideFindOpen(windowId); break;
                case '+': case '=': e.preventDefault(); _changeFontSize(windowId, 1); break;
                case '-': e.preventDefault(); _changeFontSize(windowId, -1); break;
            }
        }
    }

    function _updatePos(windowId) {
        const ta  = document.getElementById(`ide-code-${windowId}`);
        const pos = document.getElementById(`ide-sb-pos-${windowId}`);
        if (!ta || !pos) return;
        const before = ta.value.slice(0, ta.selectionStart).split('\n');
        pos.textContent = `Ln ${before.length}, Col ${before[before.length - 1].length + 1}`;
    }

    function _updateStatusBar(windowId) {
        const st    = ideStates[windowId];
        const sbApp = document.getElementById(`ide-sb-app-${windowId}`);
        const sbSz  = document.getElementById(`ide-sb-size-${windowId}`);
        const sbDrt = document.getElementById(`ide-sb-dirty-${windowId}`);
        if (!st) return;
        if (sbApp) sbApp.textContent = `${st.appConfig.icon}  ${st.appConfig.name}  (${st.appConfig.width}×${st.appConfig.height})`;
        if (sbSz) {
            const b = new TextEncoder().encode(st.html).length;
            sbSz.textContent = b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`;
        }
        if (sbDrt) {
            sbDrt.textContent    = st.dirty ? '●' : '';
            sbDrt.style.color    = '#fbbf24';
        }
    }

    function _ideUpdateTitle(windowId) {
        const st     = ideStates[windowId];
        const label  = document.getElementById(`ide-titlelabel-${windowId}`);
        const tbBtn  = windows[windowId]?.taskbarBtn;
        const fname  = st.filePath ? st.filePath.split('/').pop() : 'New App';
        const dirty  = st.dirty ? ' ●' : '';
        const title  = `IDE – ${fname}${dirty}`;
        if (label) label.innerHTML = `<img class="app-icon-title-bar" src="icons/16/text-editor.png"> ${title}`;
        if (tbBtn) tbBtn.innerHTML = `<img class="app-icon-title-bar" src="icons/16/text-editor.png"> IDE`;
    }

    /* ================================================================
       PREVIEW
    ================================================================ */

    function ideRefreshPreview(windowId) {
        const st    = ideStates[windowId];
        const frame = document.getElementById(`ide-preview-${windowId}`);
        if (!frame || !st || !st.previewVisible) return;

        const blob = new Blob([`<!DOCTYPE html><html><head>
<meta charset="utf-8">
<style>*{box-sizing:border-box}body{margin:0;padding:0}</style>
</head><body>${st.html}</body></html>`], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        frame.src = url;
        setTimeout(() => URL.revokeObjectURL(url), 8000);
    }

    function ideTogglePreview(windowId) {
        const st     = ideStates[windowId];
        const ppane  = document.getElementById(`ide-ppane-${windowId}`);
        const rsz    = document.getElementById(`ide-resizer-${windowId}`);
        st.previewVisible = !st.previewVisible;
        if (ppane) ppane.style.display = st.previewVisible ? '' : 'none';
        if (rsz)   rsz.style.display   = st.previewVisible ? '' : 'none';
        if (st.previewVisible) ideRefreshPreview(windowId);
    }

    /* ================================================================
       FIND BAR
    ================================================================ */

    function ideFindOpen(windowId) {
        const fb  = document.getElementById(`ide-findbar-${windowId}`);
        const inp = document.getElementById(`ide-findinput-${windowId}`);
        if (!fb) return;
        fb.style.display = 'flex';
        if (inp) { inp.focus(); inp.select(); }
    }

    function ideFindClose(windowId) {
        const fb = document.getElementById(`ide-findbar-${windowId}`);
        if (fb) fb.style.display = 'none';
        document.getElementById(`ide-code-${windowId}`)?.focus();
    }

    function ideFindKey(e, windowId) {
        if (e.key === 'Enter')  { e.shiftKey ? ideFindPrev(windowId) : ideFindNext(windowId); e.preventDefault(); }
        if (e.key === 'Escape') ideFindClose(windowId);
    }

    function ideFindNext(windowId) {
        const ta   = document.getElementById(`ide-code-${windowId}`);
        const inp  = document.getElementById(`ide-findinput-${windowId}`);
        const cnt  = document.getElementById(`ide-findcount-${windowId}`);
        if (!ta || !inp) return;
        const term = inp.value;
        if (!term) return;
        const val  = ta.value.toLowerCase();
        const t    = term.toLowerCase();
        const from = ta.selectionEnd;
        let idx    = val.indexOf(t, from);
        if (idx === -1) idx = val.indexOf(t, 0);
        if (idx !== -1) {
            ta.focus();
            ta.selectionStart = idx;
            ta.selectionEnd   = idx + term.length;
        }
        _updateFindCount(windowId, term);
    }

    function ideFindPrev(windowId) {
        const ta   = document.getElementById(`ide-code-${windowId}`);
        const inp  = document.getElementById(`ide-findinput-${windowId}`);
        if (!ta || !inp) return;
        const term = inp.value;
        if (!term) return;
        const val  = ta.value.toLowerCase();
        const t    = term.toLowerCase();
        const from = ta.selectionStart - 1;
        let idx    = val.lastIndexOf(t, from);
        if (idx === -1) idx = val.lastIndexOf(t);
        if (idx !== -1) {
            ta.focus();
            ta.selectionStart = idx;
            ta.selectionEnd   = idx + term.length;
        }
        _updateFindCount(windowId, term);
    }

    function _updateFindCount(windowId, term) {
        const ta  = document.getElementById(`ide-code-${windowId}`);
        const cnt = document.getElementById(`ide-findcount-${windowId}`);
        if (!ta || !cnt || !term) return;
        const matches = (ta.value.toLowerCase().match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
        cnt.textContent = matches === 0 ? 'No matches' : `${matches} match${matches !== 1 ? 'es' : ''}`;
    }

    /* ================================================================
       PANE RESIZER
    ================================================================ */

    function _initResizer(windowId) {
        const rsz    = document.getElementById(`ide-resizer-${windowId}`);
        const epane  = document.getElementById(`ide-epane-${windowId}`);
        const main   = document.getElementById(`ide-main-${windowId}`);
        if (!rsz || !epane || !main) return;

        let dragging = false;

        rsz.addEventListener('mousedown', e => {
            e.preventDefault();
            dragging = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            const onMove = ev => {
                if (!dragging) return;
                const rect  = main.getBoundingClientRect();
                const x     = ev.clientX - rect.left;
                const total = rect.width - 5; /* resizer width */
                const w     = Math.max(200, Math.min(total - 160, x));
                epane.style.flex  = 'none';
                epane.style.width = w + 'px';
            };
            const onUp = () => {
                dragging = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    /* ================================================================
       MENU BAR
    ================================================================ */

    const MENUS = {
        file: [
            { label: 'New App',             shortcut: 'Ctrl+N',       fn: w => ideNew(w) },
            { label: 'Open .app\u2026',     shortcut: 'Ctrl+O',       fn: w => ideOpenDialog(w) },
            null,
            { label: 'Save',                shortcut: 'Ctrl+S',       fn: w => ideSave(w) },
            { label: 'Save As\u2026',       shortcut: 'Ctrl+Shift+S', fn: w => ideSaveAs(w) },
            null,
            { label: 'Compile & Export\u2026',                        fn: w => ideCompile(w) },
            null,
            { label: 'Close',                                         fn: w => _ideClose(w) },
        ],
        edit: [
            { label: 'Undo',  shortcut: 'Ctrl+Z', fn: w => { _focusCode(w); document.execCommand('undo'); } },
            { label: 'Redo',  shortcut: 'Ctrl+Y', fn: w => { _focusCode(w); document.execCommand('redo'); } },
            null,
            { label: 'Cut',   shortcut: 'Ctrl+X', fn: w => { _focusCode(w); document.execCommand('cut'); } },
            { label: 'Copy',  shortcut: 'Ctrl+C', fn: w => { _focusCode(w); document.execCommand('copy'); } },
            { label: 'Paste', shortcut: 'Ctrl+V', fn: w => { _focusCode(w); document.execCommand('paste'); } },
            null,
            { label: 'Find\u2026', shortcut: 'Ctrl+F', fn: w => ideFindOpen(w) },
            null,
            { label: 'App Config\u2026', fn: w => ideAppConfig(w) },
        ],
        view: [
            { label: 'Toggle Preview',             fn: w => ideTogglePreview(w) },
            null,
            { label: 'Increase Font Size',         fn: w => _changeFontSize(w,  1) },
            { label: 'Decrease Font Size',         fn: w => _changeFontSize(w, -1) },
            { label: 'Reset Font Size',            fn: w => _changeFontSize(w,  0) },
            null,
            { label: 'Refresh Preview',            fn: w => ideRefreshPreview(w) },
        ],
        app: [
            { label: 'Run in OS',         fn: w => ideRun(w) },
            null,
            { label: 'App Config\u2026',  fn: w => ideAppConfig(w) },
            null,
            { label: 'App Info',          fn: w => _ideAppInfo(w) },
        ],
        help: [
            { label: 'About IDE',                  fn: w => _ideAbout(w) },
            null,
            { label: '.app Format Reference',      fn: w => _ideFormatRef(w) },
        ],
    };

    function _showMenu(windowId, key, anchor) {
        /* close any open IDE dropdowns */
        document.querySelectorAll('.ide-dropdown').forEach(d => d.remove());

        const items = MENUS[key];
        if (!items) return;

        const rect     = anchor.getBoundingClientRect();
        const dropdown = document.createElement('div');
        dropdown.className = 'ide-dropdown';
        dropdown.style.cssText = `left:${rect.left}px;top:${rect.bottom + 1}px;`;

        items.forEach(item => {
            if (item === null) {
                const sep = document.createElement('div');
                sep.className = 'ide-dd-sep';
                dropdown.appendChild(sep);
                return;
            }
            const row = document.createElement('div');
            row.className = 'ide-dd-item';
            row.innerHTML = `
                <span class="ide-dd-label">${_esc(item.label)}</span>
                ${item.shortcut ? `<span class="ide-dd-sc">${_esc(item.shortcut)}</span>` : ''}
            `;
            row.addEventListener('click', e => {
                e.stopPropagation();
                dropdown.remove();
                item.fn(windowId);
            });
            dropdown.appendChild(row);
        });

        document.body.appendChild(dropdown);

        /* close on outside click */
        setTimeout(() => {
            const close = () => { dropdown.remove(); document.removeEventListener('click', close); };
            document.addEventListener('click', close);
        }, 0);
    }

    /* ================================================================
       FILE OPERATIONS
    ================================================================ */

    function ideNew(windowId) {
        const st = ideStates[windowId];
        if (st.dirty) {
            spawnError('Discard unsaved changes?', 'warning', [
                { label: 'Discard', onClick: () => _doNew(windowId) },
                { label: 'Cancel',  close: true },
            ]);
        } else {
            _doNew(windowId);
        }
    }

    function _doNew(windowId) {
        const st = ideStates[windowId];
        st.appConfig = { name: 'New App', width: 800, height: 600, icon: '📦', customIcon: '' };
        st.html      = _IDE_DEFAULT_HTML;
        st.filePath  = null;
        st.dirty     = false;
        const ta = document.getElementById(`ide-code-${windowId}`);
        if (ta) ta.value = st.html;
        _updateLineNums(windowId);
        _updateStatusBar(windowId);
        _ideUpdateTitle(windowId);
        ideRefreshPreview(windowId);
    }

    /* ── Open dialog ──────────────────────────────────────── */
    function ideOpenDialog(windowId) {
        _showFilePicker(windowId, 'open', '/home/' + getUsername() + '/');
    }

    /* ── Save ─────────────────────────────────────────────── */
    async function ideSave(windowId) {
        const st = ideStates[windowId];
        if (st.filePath) {
            await _saveToPath(windowId, st.filePath);
        } else {
            ideSaveAs(windowId);
        }
    }

    function ideSaveAs(windowId) {
        _showFilePicker(windowId, 'save', '/home/' + getUsername() + '/');
    }

    async function _saveToPath(windowId, path) {
        const st      = ideStates[windowId];
        const content = _buildAppJSON(st);
        try {
            turnOnDriveLight();
            const node = await _fsResolve(path);
            if (node) {
                node.content   = content;
                node.size      = content.length;
                node.updatedAt = Date.now();
                await idbPut(node);
                await renderAllWindows();
            } else {
                await createFile(path, content);
                /* createFile calls renderAllWindows internally */
            }
            st.filePath = path;
            st.dirty    = false;
            _updateStatusBar(windowId);
            _ideUpdateTitle(windowId);
        } catch (e) {
            spawnError('Save failed: ' + e.message, 'error');
        } finally {
            turnOffDriveLight();
        }
    }

    /* ── Compile / export ─────────────────────────────────── */
    function ideCompile(windowId) {
        _showFilePicker(windowId, 'save', '/home/' + getUsername() + '/');
    }

    /* ── Run in OS ────────────────────────────────────────── */
    function ideRun(windowId) {
        const st = ideStates[windowId];
        spawnCustomApp({ content: _buildAppJSON(st), name: st.appConfig.name + '.app' });
    }

    /* ── Build .app JSON ──────────────────────────────────── */
    function _buildAppJSON(st) {
        const obj = {
            name:   st.appConfig.name,
            icon:   st.appConfig.icon,
            width:  st.appConfig.width,
            height: st.appConfig.height,
            html:   st.html,
        };
        if (st.appConfig.customIcon) obj.customIcon = st.appConfig.customIcon;
        return JSON.stringify(obj, null, 2);
    }

    /* ================================================================
       APP CONFIG DIALOG
    ================================================================ */

    function ideAppConfig(windowId) {
        document.getElementById('ide-cfg-overlay')?.remove();
        const st = ideStates[windowId];

        const overlay = document.createElement('div');
        overlay.id    = 'ide-cfg-overlay';
        overlay.className = 'ide-overlay';
        overlay.innerHTML = `
            <div class="ide-dlg ide-cfg-dlg">
                <div class="ide-dlg-title">App Config</div>
                <div class="ide-dlg-body">
                    <div class="ide-cfg-grid">
                        <label>App Name</label>
                        <input id="idecfg-name"       class="ide-input" type="text"   value="${_esc(st.appConfig.name)}"       placeholder="My App">
                        <label>Width (px)</label>
                        <input id="idecfg-width"      class="ide-input" type="number" value="${st.appConfig.width}"  min="200" max="2560">
                        <label>Height (px)</label>
                        <input id="idecfg-height"     class="ide-input" type="number" value="${st.appConfig.height}" min="150" max="1440">
                        <label>Icon Emoji</label>
                        <input id="idecfg-icon"       class="ide-input" type="text"   value="${_esc(st.appConfig.icon)}"       placeholder="📦" maxlength="4">
                        <label>Custom Icon Slug</label>
                        <input id="idecfg-customicon" class="ide-input" type="text"   value="${_esc(st.appConfig.customIcon)}" placeholder="folder">
                    </div>
                    <div class="ide-cfg-hint">Custom Icon Slug uses <code>icons/16/[slug].png</code> — overrides the emoji.</div>
                    <div class="ide-cfg-preview" id="ide-cfg-preview">
                        <div class="ide-cpw-bar">
                            <span id="idecfg-pv-icon">${_esc(st.appConfig.icon)}</span>
                            <span id="idecfg-pv-name">${_esc(st.appConfig.name)}</span>
                        </div>
                        <div class="ide-cpw-body">
                            <span class="ide-cpw-dim" id="idecfg-pv-dim">${st.appConfig.width}×${st.appConfig.height}</span>
                        </div>
                    </div>
                </div>
                <div class="ide-dlg-footer">
                    <button class="ide-btn ide-btn-primary" onclick="ideAppConfigApply('${windowId}')">Apply</button>
                    <button class="ide-btn" onclick="document.getElementById('ide-cfg-overlay').remove()">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        /* live preview */
        ['idecfg-name','idecfg-icon','idecfg-width','idecfg-height'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => {
                const n = document.getElementById('idecfg-name')?.value || 'App';
                const i = document.getElementById('idecfg-icon')?.value || '📦';
                const w = document.getElementById('idecfg-width')?.value  || 800;
                const h = document.getElementById('idecfg-height')?.value || 600;
                const pvn = document.getElementById('idecfg-pv-name');
                const pvi = document.getElementById('idecfg-pv-icon');
                const pvd = document.getElementById('idecfg-pv-dim');
                if (pvn) pvn.textContent = n;
                if (pvi) pvi.textContent = i;
                if (pvd) pvd.textContent = `${w}×${h}`;
            });
        });

        document.getElementById('idecfg-name')?.focus();
        document.getElementById('idecfg-name')?.select();
    }

    function ideAppConfigApply(windowId) {
        const st = ideStates[windowId];
        st.appConfig.name       = document.getElementById('idecfg-name')?.value.trim()       || 'App';
        st.appConfig.width      = parseInt(document.getElementById('idecfg-width')?.value)    || 800;
        st.appConfig.height     = parseInt(document.getElementById('idecfg-height')?.value)   || 600;
        st.appConfig.icon       = document.getElementById('idecfg-icon')?.value               || '📦';
        st.appConfig.customIcon = document.getElementById('idecfg-customicon')?.value.trim()  || '';
        st.dirty = true;
        _updateStatusBar(windowId);
        _ideUpdateTitle(windowId);
        document.getElementById('ide-cfg-overlay')?.remove();
    }

    /* ================================================================
       MISC DIALOGS
    ================================================================ */

    function _ideAppInfo(windowId) {
        const st    = ideStates[windowId];
        const bytes = new TextEncoder().encode(st.html).length;
        const size  = bytes < 1024 ? `${bytes} bytes` : `${(bytes / 1024).toFixed(1)} KB`;
        spawnError(
            `App: ${st.appConfig.icon} ${st.appConfig.name}\nSize: ${st.appConfig.width}x${st.appConfig.height}\nHTML: ${size}\nSaved: ${st.filePath || 'Not saved'}`,
            'info'
        );
    }

    function _ideAbout(windowId) {
        spawnError('E-Dog OS App IDE\nVersion 1.0\n\nWrite, preview, and compile .app files.\nOnly HTML is needed — CSS and JS work too.', 'info');
    }

    function _ideFormatRef(windowId) {
        spawnError(
            '.app File Format\n\n{\n  "name": "My App",\n  "icon": "\uD83D\uDCE6",\n  "customIcon": "folder",\n  "width": 800,\n  "height": 600,\n  "html": "<p>App HTML here</p>"\n}\n\nThe html field can include <style> and <script> tags.',
            'info'
        );
    }

    /* ================================================================
       FONT SIZE
    ================================================================ */

    function _changeFontSize(windowId, delta) {
        const st    = ideStates[windowId];
        const ta    = document.getElementById(`ide-code-${windowId}`);
        const lnDiv = document.getElementById(`ide-linenums-${windowId}`);
        if (!ta) return;
        st.fontSize = delta === 0 ? 13 : Math.max(9, Math.min(28, st.fontSize + delta));
        ta.style.fontSize    = st.fontSize + 'px';
        if (lnDiv) lnDiv.style.fontSize = st.fontSize + 'px';
        _updateLineNums(windowId);
    }

    /* ================================================================
       FILE PICKER MODAL
    ================================================================ */

    function _showFilePicker(windowId, mode, startPath) {
        document.getElementById('ide-picker-overlay')?.remove();

        const overlay = document.createElement('div');
        overlay.id    = 'ide-picker-overlay';
        overlay.className = 'ide-overlay';

        const st = ideStates[windowId];
        const defaultName = mode === 'save'
            ? st.appConfig.name.replace(/\s+/g, '_').toLowerCase() + '.app'
            : '';

        overlay.innerHTML = `
            <div class="ide-dlg ide-picker-dlg">
                <div class="ide-dlg-title">${mode === 'open' ? 'Open .app File' : 'Save As'}</div>
                <div class="ide-picker-path-bar" id="ide-pkr-pathbar"></div>
                <div class="ide-picker-list" id="ide-pkr-list"></div>
                <div class="ide-dlg-footer ide-picker-footer">
                    <input class="ide-input ide-picker-name" id="ide-pkr-name" type="text"
                           placeholder="${mode === 'open' ? 'select a .app file…' : 'filename.app'}"
                           value="${defaultName}" autocomplete="off" spellcheck="false">
                    <button class="ide-btn ide-btn-primary" onclick="idePickerConfirm('${windowId}','${mode}')">
                        ${mode === 'open' ? 'Open' : 'Save'}
                    </button>
                    <button class="ide-btn" onclick="document.getElementById('ide-picker-overlay').remove()">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        /* store current path on overlay */
        overlay._currentPath = startPath;
        _renderPickerList(windowId, startPath, mode);
    }

    async function _renderPickerList(windowId, path, mode) {
        const list    = document.getElementById('ide-pkr-list');
        const pathbar = document.getElementById('ide-pkr-pathbar');
        if (!list) return;

        /* update path bar */
        if (pathbar) {
            pathbar.textContent = '';
            const parts   = path.replace(/^\//, '').split('/').filter(Boolean);
            const rootBtn = document.createElement('button');
            rootBtn.className   = 'ide-pkr-crumb';
            rootBtn.textContent = '/';
            rootBtn.onclick     = () => {
                document.getElementById('ide-picker-overlay')._currentPath = '/';
                _renderPickerList(windowId, '/', mode);
            };
            pathbar.appendChild(rootBtn);
            let accum = '/';
            parts.forEach(p => {
                const sep = document.createElement('span');
                sep.textContent = '›';
                sep.className   = 'ide-pkr-sep';
                pathbar.appendChild(sep);
                accum += p + '/';
                const btn = document.createElement('button');
                btn.className   = 'ide-pkr-crumb';
                btn.textContent = p;
                const capPath   = accum;
                btn.onclick     = () => {
                    document.getElementById('ide-picker-overlay')._currentPath = capPath;
                    _renderPickerList(windowId, capPath, mode);
                };
                pathbar.appendChild(btn);
            });
        }

        list.innerHTML = '<div class="ide-pkr-msg">Loading…</div>';

        try {
            const node = await _fsResolve(path);
            if (!node || node.type !== 'folder') {
                list.innerHTML = '<div class="ide-pkr-msg">Folder not found.</div>';
                return;
            }

            const children = await idbGetAllByIndex('parentId', node.id);
            children.sort((a, b) => {
                if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                return a.name.localeCompare(b.name);
            });

            list.innerHTML = '';

            /* Up row (if not root) */
            if (path !== '/') {
                const parts  = path.replace(/\/$/, '').split('/').filter(Boolean);
                const parent = parts.slice(0, -1).join('/') || '/';
                const up = document.createElement('div');
                up.className = 'ide-pkr-item ide-pkr-folder';
                up.innerHTML = '📁 <span>..</span>';
                const upPath = parent === '' ? '/' : '/' + parent + '/';
                up.onclick   = () => {
                    document.getElementById('ide-picker-overlay')._currentPath = upPath;
                    _renderPickerList(windowId, upPath, mode);
                };
                list.appendChild(up);
            }

            let any = false;
            children.forEach(child => {
                /* In open mode show only folders + .app files; in save show all */
                if (mode === 'open' && child.type === 'file' && !child.name.endsWith('.app')) return;

                const row = document.createElement('div');
                const isApp = child.type === 'file' && child.name.endsWith('.app');
                row.className = child.type === 'folder'
                    ? 'ide-pkr-item ide-pkr-folder'
                    : `ide-pkr-item ide-pkr-file${isApp ? ' ide-pkr-app' : ''}`;

                const icon = child.type === 'folder' ? '📁' : (isApp ? '📦' : '📄');
                row.innerHTML = `${icon} <span>${_esc(child.name)}</span>`;

                if (child.type === 'folder') {
                    const childPath = path.endsWith('/') ? path + child.name + '/' : path + '/' + child.name + '/';
                    row.onclick = () => {
                        document.getElementById('ide-picker-overlay')._currentPath = childPath;
                        _renderPickerList(windowId, childPath, mode);
                    };
                } else {
                    row.onclick = () => {
                        document.querySelectorAll('#ide-pkr-list .ide-pkr-item').forEach(r => r.classList.remove('selected'));
                        row.classList.add('selected');
                        const nameInput = document.getElementById('ide-pkr-name');
                        if (nameInput) nameInput.value = child.name;
                    };
                    if (mode === 'open') {
                        row.ondblclick = () => idePickerConfirm(windowId, mode);
                    }
                }
                list.appendChild(row);
                any = true;
            });

            /* make sure folders count as "any" too */
            if (!any && children.filter(c => c.type === 'folder').length === 0) {
                const msg = document.createElement('div');
                msg.className   = 'ide-pkr-msg';
                msg.textContent = mode === 'open' ? 'No .app files here.' : 'Empty folder.';
                list.appendChild(msg);
            }
        } catch (e) {
            list.innerHTML = `<div class="ide-pkr-msg">Error: ${_esc(e.message)}</div>`;
        }
    }

    async function idePickerConfirm(windowId, mode) {
        const overlay   = document.getElementById('ide-picker-overlay');
        const nameInput = document.getElementById('ide-pkr-name');
        if (!overlay || !nameInput) return;

        let name = nameInput.value.trim();
        if (!name) { spawnError('Enter a filename.', 'warning'); return; }
        if (!name.endsWith('.app')) name += '.app';

        const dir  = overlay._currentPath || '/';
        const path = dir.endsWith('/') ? dir + name : dir + '/' + name;

        overlay.remove();

        if (mode === 'open') {
            try {
                const file   = await accessFile(path);
                const parsed = JSON.parse(file.text);
                const st     = ideStates[windowId];
                _loadIntoState(windowId, parsed, path);
                const ta = document.getElementById(`ide-code-${windowId}`);
                if (ta) ta.value = st.html;
                _updateLineNums(windowId);
                _updateStatusBar(windowId);
                _ideUpdateTitle(windowId);
                ideRefreshPreview(windowId);
            } catch (e) {
                spawnError('Could not open file: ' + e.message, 'error');
            }
        } else {
            await _saveToPath(windowId, path);
        }
    }

    /* ================================================================
       CLOSE HANDLER
    ================================================================ */

    function _ideClose(windowId) {
        const st = ideStates[windowId];
        if (st && st.dirty) {
            spawnError('You have unsaved changes. Close anyway?', 'warning', [
                {
                    label: 'Close without saving',
                    onClick: () => { delete ideStates[windowId]; closeWindow(windowId); },
                },
                { label: 'Cancel', close: true },
            ]);
        } else {
            delete ideStates[windowId];
            closeWindow(windowId);
        }
    }

    /* ================================================================
       UTILITIES
    ================================================================ */

    function _focusCode(windowId) {
        document.getElementById(`ide-code-${windowId}`)?.focus();
    }

    function _esc(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* ================================================================
       INLINE SVG ICONS
    ================================================================ */

    const SVG = {
        new:         `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2h7l3 3v9H3V2zm7 0v3h3"/><path d="M6 8h4M6 11h4" stroke-width="1.2"/></svg>`,
        open:        `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 4h4l2 2h8v8H1z"/></svg>`,
        save:        `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="12" height="12" rx="1"/><rect x="5" y="2" width="6" height="4"/><rect x="4" y="9" width="8" height="5"/></svg>`,
        run:         `<svg viewBox="0 0 16 16" fill="currentColor"><polygon points="4,2 13,8 4,14"/></svg>`,
        preview:     `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="14" height="10" rx="1"/><circle cx="8" cy="8" r="2"/></svg>`,
        config:      `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 10.2a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4zm5.4-1.35.05.05 1.1.64-.8 1.38-1.23-.71a4.5 4.5 0 01-.85.5l-.17 1.4H9.5l-.18-1.4a4.5 4.5 0 01-.85-.5l-1.23.71-.8-1.38 1.1-.64a4.3 4.3 0 010-1.7l-1.1-.64.8-1.38 1.23.71c.26-.19.54-.35.85-.5L9.5 3.9h1.55l.18 1.4c.31.15.59.31.85.5l1.23-.71.8 1.38-1.1.64a4.3 4.3 0 010 1.7z"/></svg>`,
        compile:     `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6L2 8l2 2M12 6l2 2-2 2M9 4l-2 8"/></svg>`,
        html_file:   `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" style="width:12px;height:12px"><path d="M3 2h7l3 3v9H3V2zm7 0v3h3"/></svg>`,
        preview_icon:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" style="width:12px;height:12px"><rect x="1" y="2" width="14" height="11" rx="1"/><path d="M1 6h14"/></svg>`,
    };

    /* ================================================================
       DEFAULT HTML TEMPLATE
    ================================================================ */

    const _IDE_DEFAULT_HTML = `<!-- App HTML goes here -->
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', sans-serif;
    background: #1e1e2e;
    color: #cdd6f4;
    margin: 0;
    padding: 20px;
  }
  h1 { color: #89b4fa; margin: 0 0 12px; }
  p  { margin: 0 0 10px; color: #bac2de; }
</style>

<h1>Hello from my app!</h1>
<p>Edit this HTML to build your E-Dog OS app.</p>
<p>CSS and JavaScript are fully supported.</p>`;

    /* ================================================================
       CSS — injected once
    ================================================================ */

    (function _injectCSS() {
        if (document.getElementById('ide-global-styles')) return;
        const s = document.createElement('style');
        s.id = 'ide-global-styles';
        s.textContent = `
/* ── IDE root ─────────────────────────────────────────── */
.ide-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: #1e1e1e;
    color: #d4d4d4;
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 13px;
    user-select: none;
}

/* ── Menu bar ──────────────────────────────────────────── */
.ide-menubar {
    display: flex;
    background: #2d2d2d;
    border-bottom: 1px solid #111;
    flex-shrink: 0;
    height: 26px;
}
.ide-mb-item {
    display: flex;
    align-items: center;
    padding: 0 11px;
    font-size: 12px;
    color: #ccc;
    cursor: pointer;
    white-space: nowrap;
    transition: background .1s;
}
.ide-mb-item:hover { background: #3a3d3e; }

/* ── Toolbar ───────────────────────────────────────────── */
.ide-toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 3px 6px;
    background: #252526;
    border-bottom: 1px solid #111;
    flex-shrink: 0;
}
.ide-tb-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: transparent;
    border: 1px solid transparent;
    color: #ccc;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    transition: background .1s, border-color .1s;
    white-space: nowrap;
}
.ide-tb-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
.ide-tb-btn:hover { background: #3a3d3e; border-color: #555; }
.ide-tb-btn:active { background: #505357; }
.ide-tb-run { color: #4ec9b0; }
.ide-tb-run:hover { background: #163530 !important; border-color: #4ec9b0 !important; }
.ide-tb-sep { width: 1px; height: 20px; background: #444; margin: 0 3px; flex-shrink: 0; }

/* ── Find bar ──────────────────────────────────────────── */
.ide-findbar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: #2d2d2d;
    border-bottom: 1px solid #111;
    flex-shrink: 0;
}
.ide-find-label { font-size: 12px; color: #888; flex-shrink: 0; }
.ide-find-input {
    width: 200px;
    background: #1e1e1e;
    border: 1px solid #555;
    color: #d4d4d4;
    padding: 3px 7px;
    border-radius: 3px;
    font-size: 12px;
    outline: none;
}
.ide-find-input:focus { border-color: #007acc; }
.ide-find-btn {
    padding: 2px 9px;
    background: #3a3d3e;
    border: 1px solid #555;
    color: #ccc;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
}
.ide-find-btn:hover { background: #4a4d4e; }
.ide-find-count { font-size: 11px; color: #888; flex-shrink: 0; }
.ide-find-close {
    margin-left: auto;
    background: transparent;
    border: none;
    color: #777;
    cursor: pointer;
    font-size: 14px;
    padding: 0 4px;
    line-height: 1;
}
.ide-find-close:hover { color: #f87171; }

/* ── Main split area ───────────────────────────────────── */
.ide-main {
    flex: 1;
    display: flex;
    overflow: hidden;
    min-height: 0;
}

/* ── Pane header ───────────────────────────────────────── */
.ide-pane-hdr {
    display: flex;
    align-items: center;
    background: #252526;
    border-bottom: 1px solid #111;
    padding: 0 10px;
    height: 28px;
    flex-shrink: 0;
    gap: 6px;
}
.ide-pane-title {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #bbb;
}
.ide-lang-tag {
    margin-left: auto;
    background: #007acc;
    color: #fff;
    font-size: 10px;
    padding: 1px 7px;
    border-radius: 10px;
}
.ide-refresh-btn {
    margin-left: auto;
    background: transparent;
    border: none;
    color: #777;
    cursor: pointer;
    font-size: 16px;
    padding: 0 4px;
    line-height: 1;
    border-radius: 3px;
}
.ide-refresh-btn:hover { background: #3a3d3e; color: #4ec9b0; }

/* ── Editor pane ───────────────────────────────────────── */
.ide-epane {
    flex: 3;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.ide-editor-wrap {
    flex: 1;
    display: flex;
    overflow: hidden;
    min-height: 0;
    background: #1e1e1e;
}
.ide-linenums {
    flex-shrink: 0;
    width: 46px;
    background: #1e1e1e;
    border-right: 1px solid #2d2d2d;
    padding: 8px 0;
    overflow: hidden;
    text-align: right;
    font-family: Consolas, 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
    color: #555;
    user-select: none;
    box-sizing: border-box;
}
.ide-linenums div {
    padding-right: 8px;
    min-height: 19.5px; /* font-size * line-height */
}
.ide-code {
    flex: 1;
    background: #1e1e1e;
    color: #d4d4d4;
    border: none;
    outline: none;
    resize: none;
    padding: 8px 14px;
    font-family: Consolas, 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
    tab-size: 4;
    white-space: pre;
    overflow: auto;
    user-select: text;
    caret-color: #aeafad;
    box-sizing: border-box;
}
.ide-code::selection { background: #264f78; }

/* ── Resizer ───────────────────────────────────────────── */
.ide-resizer {
    width: 5px;
    background: #111;
    cursor: col-resize;
    flex-shrink: 0;
    transition: background .12s;
}
.ide-resizer:hover { background: #007acc; }

/* ── Preview pane ──────────────────────────────────────── */
.ide-ppane {
    flex: 2;
    min-width: 180px;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #111;
    overflow: hidden;
}
.ide-preview-wrap {
    flex: 1;
    overflow: hidden;
    background: #fff;
}
.ide-preview-frame {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
}

/* ── Status bar ────────────────────────────────────────── */
.ide-statusbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    height: 22px;
    background: #007acc;
    color: #fff;
    font-size: 11px;
    flex-shrink: 0;
}
.ide-sb-sep  { opacity: .5; }
.ide-sb-app  { font-weight: 600; letter-spacing: .2px; }
.ide-sb-dirty { color: #ffd700; font-size: 14px; line-height: 1; }

/* ── Dropdown menu ─────────────────────────────────────── */
.ide-dropdown {
    position: fixed;
    z-index: 99999;
    background: #252526;
    border: 1px solid #454545;
    border-radius: 3px;
    box-shadow: 0 4px 18px rgba(0,0,0,.55);
    min-width: 200px;
    padding: 3px 0;
}
.ide-dd-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 18px;
    cursor: pointer;
    font-size: 12px;
    color: #d4d4d4;
    gap: 24px;
}
.ide-dd-item:hover { background: #094771; }
.ide-dd-sc { color: #777; font-size: 11px; white-space: nowrap; }
.ide-dd-sep { height: 1px; background: #333; margin: 3px 0; }

/* ── Overlay / dialog ──────────────────────────────────── */
.ide-overlay {
    position: fixed;
    inset: 0;
    z-index: 99998;
    background: rgba(0,0,0,.55);
    display: flex;
    align-items: center;
    justify-content: center;
}
.ide-dlg {
    background: #252526;
    border: 1px solid #454545;
    border-radius: 6px;
    box-shadow: 0 10px 40px rgba(0,0,0,.65);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 380px;
    max-width: 540px;
}
.ide-dlg-title {
    padding: 12px 18px;
    background: #1e1e1e;
    border-bottom: 1px solid #333;
    font-size: 14px;
    font-weight: 600;
    color: #e0e0e0;
    flex-shrink: 0;
}
.ide-dlg-body {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow-y: auto;
    max-height: 70vh;
}
.ide-dlg-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: #1e1e1e;
    border-top: 1px solid #333;
    justify-content: flex-end;
    flex-shrink: 0;
}
.ide-input {
    flex: 1;
    min-width: 0;
    background: #1e1e1e;
    border: 1px solid #555;
    color: #d4d4d4;
    padding: 5px 9px;
    border-radius: 3px;
    font-size: 12px;
    outline: none;
}
.ide-input:focus { border-color: #007acc; }
.ide-btn {
    padding: 5px 16px;
    background: #3a3d3e;
    border: 1px solid #555;
    color: #ccc;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    white-space: nowrap;
}
.ide-btn:hover { background: #4a4d4e; }
.ide-btn-primary { background: #0e639c; border-color: #007acc; color: #fff; }
.ide-btn-primary:hover { background: #1177bb; }

/* ── App Config dialog ─────────────────────────────────── */
.ide-cfg-dlg  { min-width: 440px; }
.ide-cfg-grid {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 9px;
    align-items: center;
}
.ide-cfg-grid label { font-size: 12px; color: #999; }
.ide-cfg-hint { font-size: 11px; color: #666; }
.ide-cfg-hint code { background: #1a1a1a; border-radius: 2px; padding: 1px 4px; }
.ide-cfg-preview { margin-top: 4px; }
.ide-cpw-bar {
    background: #3c3c3c;
    border: 1px solid #555;
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    padding: 4px 10px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.ide-cpw-body {
    border: 1px solid #555;
    border-radius: 0 0 4px 4px;
    height: 60px;
    background: #1e1e1e;
    display: flex;
    align-items: center;
    justify-content: center;
}
.ide-cpw-dim { font-size: 11px; color: #444; }

/* ── File Picker dialog ────────────────────────────────── */
.ide-picker-dlg { min-width: 460px; max-width: 460px; }
.ide-picker-path-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px;
    padding: 5px 10px;
    background: #1a1a1a;
    border-bottom: 1px solid #333;
    min-height: 28px;
    flex-shrink: 0;
}
.ide-pkr-crumb {
    background: transparent;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 12px;
    font-family: monospace;
    padding: 1px 4px;
    border-radius: 2px;
}
.ide-pkr-crumb:hover { background: #2a2d2e; color: #ccc; }
.ide-pkr-sep { color: #444; font-size: 11px; }
.ide-picker-list {
    height: 260px;
    overflow-y: auto;
    background: #1e1e1e;
    border-bottom: 1px solid #333;
}
.ide-pkr-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 14px;
    cursor: pointer;
    font-size: 12px;
    color: #d4d4d4;
}
.ide-pkr-item:hover { background: #2a2d2e; }
.ide-pkr-item.selected { background: #094771; }
.ide-pkr-folder { color: #e0b870; }
.ide-pkr-app    { color: #4ec9b0; }
.ide-pkr-msg    { padding: 12px; text-align: center; color: #555; font-size: 12px; }
.ide-picker-footer { gap: 8px; }
.ide-picker-name { flex: 1; font-family: monospace; }
        `;
        document.head.appendChild(s);
    })();

    /* ================================================================
       START MENU REGISTRATION
    ================================================================ */

    /* Register after startmenu.js has run (it uses setTimeout 0 too) */
    setTimeout(() => {
        if (typeof registerStartMenuApp === 'function') {
            registerStartMenuApp({
                name: 'App IDE',
                icon: '/usr/share/icons/32/text-editor.png',
                emoji: '💻',
                categories: ['all', 'system'],
                action: () => spawnIDE(),
            });
        }
    }, 50);

    /* ================================================================
       GLOBAL EXPORTS
    ================================================================ */

    window.spawnIDE             = spawnIDE;
    window.ideNew               = ideNew;
    window.ideOpenDialog        = ideOpenDialog;
    window.idePickerConfirm     = idePickerConfirm;
    window.idePickerNavigate    = (wid, path, mode) => _renderPickerList(wid, path, mode);
    window.ideSave              = ideSave;
    window.ideSaveAs            = ideSaveAs;
    window.ideCompile           = ideCompile;
    window.ideRun               = ideRun;
    window.ideAppConfig         = ideAppConfig;
    window.ideAppConfigApply    = ideAppConfigApply;
    window.ideTogglePreview     = ideTogglePreview;
    window.ideRefreshPreview    = ideRefreshPreview;
    window.ideFindOpen          = ideFindOpen;
    window.ideFindClose         = ideFindClose;
    window.ideFindNext          = ideFindNext;
    window.ideFindPrev          = ideFindPrev;
    window.ideFindKey           = ideFindKey;

})();
