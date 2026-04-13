/* ============================================================
   E-Dog OS — Custom Cursor  (js/cursor.js)

   Loads cursor images from IndexedDB at:
     /usr/share/icons/cursors/<name>

   Cursor map (CSS cursor value → file + hotspot):
     default / auto  → left_ptr.png
     text            → text_select.png
     pointer         → hand2.png
     grab / grabbing → grabbing.png   (also during window drag)
     wait / progress → load.gif

   Hidden automatically during:
     • Boot sequence  (#bootOverlay)
     • Login screen   (#loginOverlay)
     • BSOD           (#bsodOverlay)

   Works on both primary and secondary monitor windows.
============================================================ */

(function () {
    const cursorEl = document.getElementById('main-cursor');
    if (!cursorEl) return;

    cursorEl.style.pointerEvents = 'none';
    cursorEl.style.userSelect    = 'none';

    /* ── cursor definitions ───────────────────────────────────────
       file     – filename inside /usr/share/icons/cursors/
       ox / oy  – pixel offset so the visual hotspot sits at clientX/Y
                  (negative = move the image left / up)              */
    const CURSORS = {
        default:  { file: 'left_ptr.png',    ox: -6,  oy: -2.5 },
        text:     { file: 'text_select.png', ox: -10, oy: -11  },
        pointer:  { file: 'hand2.png',       ox: -8,  oy: -4   },
        grabbing: { file: 'grabbing.png',    ox: -12, oy: -12  },
        loading:  { file: 'load.gif',        ox: -12, oy: -12  },
    };

    /* ── state ────────────────────────────────────────────────── */
    let _current  = 'default';   // key into CURSORS
    let _inside   = false;
    let _blobUrls = {};          // key → object URL (or null if load failed)
    let _loaded   = new Set();   // keys that have been attempted

    /* ── inject cursor:none style ─────────────────────────────── */
    const _styleEl = document.createElement('style');
    _styleEl.textContent = `
        body.edog-cursor-active,
        body.edog-cursor-active * {
            cursor: none !important;
        }
    `;
    document.head.appendChild(_styleEl);

    /* ── visibility / refresh ─────────────────────────────────── */
    function _overlayActive() {
        return !!(
            document.getElementById('bootOverlay')  ||
            document.getElementById('loginOverlay') ||
            document.getElementById('bsodOverlay')
        );
    }

    function _refresh() {
        const hasCursor = !!_blobUrls[_current];
        const show = hasCursor && _inside && !_overlayActive();
        cursorEl.style.display = show ? 'block' : 'none';
        document.body.classList.toggle('edog-cursor-active', show);
    }

    function _applyCursor(key) {
        if (!(key in CURSORS)) key = 'default';
        if (_current === key) return;
        _current = key;

        const url = _blobUrls[key];
        if (url) {
            cursorEl.src = url;
        } else if (!_loaded.has(key)) {
            _loadCursor(key);   // lazy-load on first use
        }
        _refresh();
    }

    /* ── cursor type detection ────────────────────────────────── */
    // Map CSS cursor property values → our cursor keys
    const CSS_CURSOR_MAP = {
        'text':          'text',
        'vertical-text': 'text',
        'pointer':       'pointer',
        'grab':          'grabbing',
        'grabbing':      'grabbing',
        'wait':          'loading',
        'progress':      'loading',
    };

    function _detectCursor(target) {
        // Window drag in progress → grabbing
        if (typeof dragState !== 'undefined' && dragState) return 'grabbing';

        if (!target || target === document.documentElement) return 'default';

        const css = getComputedStyle(target).cursor;

        // Editable fields always get text cursor regardless of CSS
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            return 'text';
        }

        return CSS_CURSOR_MAP[css] || 'default';
    }

    /* ── mouse tracking ───────────────────────────────────────── */
    document.addEventListener('mousemove', function (e) {
        _inside = true;
        const key = _detectCursor(e.target);
        _applyCursor(key);

        const def = CURSORS[_current] || CURSORS.default;
        cursorEl.style.left = (e.clientX + def.ox) + 'px';
        cursorEl.style.top  = (e.clientY + def.oy) + 'px';
        _refresh();
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
        _inside = false;
        _refresh();
    });

    document.addEventListener('mouseenter', function () {
        _inside = true;
        _refresh();
    });

    /* ── watch for overlay creation / removal ─────────────────── */
    new MutationObserver(_refresh).observe(document.body, {
        childList: true,
        subtree:   false,
    });

    /* ── load a cursor image from IndexedDB ───────────────────── */
    async function _loadCursor(key) {
        _loaded.add(key);
        const def = CURSORS[key];
        if (!def) return;

        const path = '/usr/share/icons/cursors/' + def.file;
        try {
            const file = await accessFile(path);
            const data = file.contentType === 'binary' ? file.buffer : file.text;
            const ext  = def.file.split('.').pop().toLowerCase();
            const mime = file.mime || (ext === 'gif' ? 'image/gif' : 'image/png');
            const blob = new Blob([data], { type: mime });
            _blobUrls[key] = URL.createObjectURL(blob);
        } catch {
            console.log(`[cursor] Not found: ${path}`);
            _blobUrls[key] = null;
            return;
        }

        // If this is the currently wanted cursor, apply it now
        if (_current === key) {
            cursorEl.src = _blobUrls[key];
            _refresh();
        }
    }

    /* ── boot: load all cursors once the DB is ready ─────────── */
    async function _init() {
        await _waitFor(() =>
            typeof dbPromise  !== 'undefined' && !!dbPromise &&
            typeof accessFile === 'function'
        );

        // Load default first so something shows up quickly
        await _loadCursor('default');

        // Load the rest in parallel
        const rest = Object.keys(CURSORS).filter(k => k !== 'default');
        rest.forEach(k => _loadCursor(k));
    }

    function _waitFor(condition) {
        return new Promise(resolve => {
            (function poll() {
                if (condition()) resolve();
                else setTimeout(poll, 100);
            })();
        });
    }

    _init();
})();
