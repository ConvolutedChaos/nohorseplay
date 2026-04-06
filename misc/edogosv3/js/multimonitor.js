/* ============================================================
   E-Dog OS — Multi-Monitor Support  (js/multimonitor.js)
   Experimental feature.

   Opens a secondary browser popup acting as a second display.
   Drag any window to the RIGHT edge of Monitor 1 to send it to
   Monitor 2, or to the LEFT edge of Monitor 2 to return it.

   Hooks required in script.js:
     onDrag   → call window._mmOnDrag(e, winEl)
     stopDrag → call window._mmOnStopDrag()
     init()   → skip __bootAndLogin when ?edog_secondary=1

   Load AFTER startmenu.js in index.html.
============================================================ */

(function () {

    const IS_SECONDARY = new URLSearchParams(location.search).has('edog_secondary');
    const BC = new BroadcastChannel('edog_multimonitor');

    /* ── State ───────────────────────────────────────────────── */
    let _hasSecondary  = false;   // primary: is a secondary connected?
    let _pendingXfer   = null;    // { winEl } — set when drag hits an edge

    /* ── BroadcastChannel ────────────────────────────────────── */
    BC.onmessage = function (e) {
        const msg = e.data;
        if (IS_SECONDARY) {
            if (msg.type === 'spawn_window') _receiveWindow(msg);
        } else {
            if (msg.type === 'secondary_ready')   { _hasSecondary = true;  _syncBtn(); }
            if (msg.type === 'secondary_closing') { _hasSecondary = false; _syncBtn(); }
            if (msg.type === 'return_window')     _receiveWindow(msg);
        }
    };

    if (IS_SECONDARY) {
        window.addEventListener('load', () => {
            setTimeout(() => BC.postMessage({ type: 'secondary_ready' }), 400);
        });
        window.addEventListener('beforeunload', () => {
            BC.postMessage({ type: 'secondary_closing' });
        });
    }

    /* ── Public API ──────────────────────────────────────────── */
    window.spawnSecondaryMonitor = function () {
        if (_hasSecondary) {
            // Already open — nothing to do (can't focus cross-origin popups)
            return;
        }
        const base = location.href.replace(/[?#].*/, '');
        const popup = window.open(
            base + '?edog_secondary=1',
            'edog_monitor_2',
            'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
        );
        if (!popup) {
            alert('Popup was blocked.\nPlease allow popups for this site and try again.');
        }
    };

    window._mmIsSecondary  = IS_SECONDARY;
    window._mmHasSecondary = () => _hasSecondary;

    /* ── Drag hooks (called from script.js) ──────────────────── */
    window._mmOnDrag = function (e, winEl) {
        if (!IS_SECONDARY && !_hasSecondary) {
            _hideEdge();
            _pendingXfer = null;
            return;
        }

        const atRight = !IS_SECONDARY && (e.clientX >= window.innerWidth - 2);
        const atLeft  =  IS_SECONDARY && (e.clientX <= 2);

        if (atRight || atLeft) {
            _showEdge(atRight ? 'right' : 'left');
            _pendingXfer = { winEl };
        } else {
            _hideEdge();
            _pendingXfer = null;
        }
    };

    window._mmOnStopDrag = function () {
        _hideEdge();
        if (!_pendingXfer) return;
        const { winEl } = _pendingXfer;
        _pendingXfer = null;

        const winId = winEl.id;
        if (!winId || !windows[winId]) return;

        const payload = _serialize(winId);
        if (!payload) return;

        // Close locally first, then send
        closeWindow(winId);

        const msg = IS_SECONDARY
            ? { type: 'return_window', ...payload, targetX: 60, targetY: 60 }
            : { type: 'spawn_window',  ...payload, targetX: 60, targetY: 60 };
        BC.postMessage(msg);
    };

    /* ── Serialization ───────────────────────────────────────── */
    function _serialize(winId) {
        const entry = windows[winId];
        if (!entry) return null;
        const el    = entry.el;
        const state = entry.state;

        const base = {
            winType : state.type || 'fileExplorer',
            w       : el ? el.offsetWidth  : 700,
            h       : el ? el.offsetHeight : 500,
        };

        switch (base.winType) {
            case 'fileExplorer':
                return { ...base, currentFolderId: state.currentFolderId };
            case 'editor': case 'image': case 'video':
            case 'audio':  case 'zip':   case 'markdown': case 'bacon':
            case 'paint':  case 'writer':
                return { ...base, item: state.item };
            default:
                return { ...base };
        }
    }

    /* ── Deserialization ─────────────────────────────────────── */
    async function _receiveWindow(msg) {
        // Safety: wait until the OS globals are available (relevant on secondary)
        await _waitForOS();

        let winId = null;

        switch (msg.winType) {
            case 'fileExplorer':
                winId = spawnWindow(msg.currentFolderId || null);
                break;
            case 'editor': case 'image': case 'video':
            case 'audio':  case 'zip':   case 'markdown': case 'bacon':
                winId = spawnApp(msg.winType, msg.item || {});
                break;
            case 'paint':
                winId = spawnPaint(msg.item || null);
                break;
            case 'writer':
                winId = spawnWriter(msg.item || null);
                break;
            case 'settings':
                winId = spawnSettings();
                break;
            case 'terminal':
                winId = spawnTerminal();
                break;
            case 'about':
                winId = spawnAbout();
                break;
            default:
                winId = spawnWindow();
                break;
        }

        // Apply saved size + position
        if (winId && windows[winId]?.el) {
            const el = windows[winId].el;
            if (msg.w) el.style.width  = msg.w + 'px';
            if (msg.h) el.style.height = msg.h + 'px';
            el.style.left = (msg.targetX ?? 60) + 'px';
            el.style.top  = (msg.targetY ?? 60) + 'px';
        }
    }

    function _waitForOS() {
        return new Promise(resolve => {
            (function check() {
                if (typeof windows !== 'undefined' && typeof spawnWindow === 'function') {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            })();
        });
    }

    /* ── Edge indicator ──────────────────────────────────────── */
    let _edgeEl = null;

    function _showEdge(side) {
        if (!_edgeEl) {
            _edgeEl = document.createElement('div');
            _edgeEl.id = 'mm-edge-zone';
            document.body.appendChild(_edgeEl);
        }
        _edgeEl.className = 'mm-edge-zone mm-edge-' + side;
    }

    function _hideEdge() {
        if (_edgeEl) _edgeEl.className = 'mm-edge-zone';
    }

    /* ── Monitor 2 badge ─────────────────────────────────────── */
    if (IS_SECONDARY) {
        window.addEventListener('load', () => {
            const badge = document.createElement('div');
            badge.id = 'mm-monitor-badge';
            badge.textContent = 'Monitor 2';
            document.body.appendChild(badge);
        });
    }

    /* ── Settings section ────────────────────────────────────── */
    function _syncBtn() {
        const btn = document.getElementById('mm-spawn-btn');
        if (!btn) return;
        if (_hasSecondary) {
            btn.textContent = 'Monitor 2 Connected';
            btn.classList.add('mm-btn-connected');
        } else {
            btn.textContent = 'Spawn New Monitor';
            btn.classList.remove('mm-btn-connected');
        }
    }

    window._mmBuildSettingsSection = function (el) {
        el.innerHTML = '';

        const title = document.createElement('div');
        title.className = 'settings-section-title';
        title.innerHTML = 'Experimental <span class="settings-experimental-badge">Beta</span>';
        el.appendChild(title);

        const card = document.createElement('div');
        card.className = 'settings-experimental-card';
        card.innerHTML = `
            <h3>Multi-Monitor</h3>
            <p>
                Opens a second browser window acting as an additional display.
                Drag any window to the <strong style="color:#aaa">right edge</strong> of Monitor 1
                to send it to Monitor 2, or to the
                <strong style="color:#aaa">left edge</strong> of Monitor 2 to return it.<br><br>
                Both monitors share the same virtual filesystem.
                The popup must remain open while in use.
            </p>
        `;

        const btn = document.createElement('button');
        btn.id = 'mm-spawn-btn';
        btn.className = 'small-btn';
        btn.style.cssText = 'font-size:13px; padding:7px 16px;';
        if (_hasSecondary) {
            btn.textContent = 'Monitor 2 Connected';
            btn.classList.add('mm-btn-connected');
        } else {
            btn.textContent = 'Spawn New Monitor';
        }
        btn.onclick = () => spawnSecondaryMonitor();
        card.appendChild(btn);
        el.appendChild(card);
    };

    /* ── Styles ──────────────────────────────────────────────── */
    const _s = document.createElement('style');
    _s.textContent = `
        /* Edge transfer zone */
        #mm-edge-zone {
            position: fixed; top: 0; bottom: 0;
            width: 0; pointer-events: none;
            z-index: 99999; opacity: 0;
            transition: width .1s, opacity .1s;
        }
        #mm-edge-zone.mm-edge-right {
            right: 0; width: 10px; opacity: 1;
            background: linear-gradient(90deg, transparent, rgba(59,130,246,.55));
            box-shadow: inset -2px 0 10px rgba(59,130,246,.4);
        }
        #mm-edge-zone.mm-edge-left {
            left: 0; width: 10px; opacity: 1;
            background: linear-gradient(270deg, transparent, rgba(59,130,246,.55));
            box-shadow: inset 2px 0 10px rgba(59,130,246,.4);
        }

        /* Monitor 2 badge */
        #mm-monitor-badge {
            position: fixed; top: 8px; left: 50%;
            transform: translateX(-50%);
            background: rgba(12,12,12,.9);
            border: 1px solid #3b82f6;
            border-radius: 6px;
            padding: 4px 14px;
            font-size: 11px; color: #7dd3fc;
            font-family: var(--font-ui, system-ui);
            z-index: 9999; pointer-events: none;
            letter-spacing: .04em;
        }

        /* Experimental settings section */
        .settings-experimental-badge {
            display: inline-block;
            font-size: 9px; font-weight: 700;
            letter-spacing: .06em; text-transform: uppercase;
            background: #7c3aed; color: #ede9fe;
            border-radius: 4px; padding: 2px 6px;
            margin-left: 7px; vertical-align: middle;
        }
        .settings-experimental-card {
            background: #111;
            border: 1px solid #222;
            border-radius: 10px;
            padding: 18px 20px;
            margin-bottom: 14px;
        }
        .settings-experimental-card h3 {
            margin: 0 0 5px; font-size: 13px;
            font-weight: 600; color: #ddd;
        }
        .settings-experimental-card p {
            margin: 0 0 14px; font-size: 12px;
            color: #666; line-height: 1.6;
        }
        .mm-btn-connected {
            color: #4ade80 !important;
            border-color: #166534 !important;
            background: #052e16 !important;
            cursor: default !important;
        }
        :root.theme-aero2010 .settings-experimental-card {
            background: #fff; border-color: #c8d8e8;
        }
        :root.theme-aero2010 .settings-experimental-card h3 { color: #1a3050; }
        :root.theme-aero2010 .settings-experimental-card p  { color: #6a8aaa; }
    `;
    document.head.appendChild(_s);

})();
