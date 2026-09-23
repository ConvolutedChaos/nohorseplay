"use strict";
/* Launchpad: the full-screen app grid, its search field, and the Other folder */

/* Page one in the reference's order, minus the four third-party apps the
   sim does not ship.  Launchpad and the Finder never appear in it. */
var LP_LAYOUT = [
    "safari", "mail", "contacts", "calendar", "reminders", "notes", "maps",
    "messages", "facetime", "photo-booth", "photos", "game-center", "itunes", "ibooks",
    "app-store", "preview", "dictionary", "calculator",
    /* order transcribed from ref_pic/launchpad_folder_open.mp4 -- 7 columns,
       27 apps over 4 rows, the last row six wide */
    { folder: "Other", apps: [
        "quicktime-player", "textedit", "grapher", "dvd-player", "backup", "font-book", "chess",
        "stickies", "image-capture", "voiceover-utility", "airport-utility", "migration-assistant",
        "terminal", "activity-monitor",
        "console", "keychain-access", "system-information", "automator", "script-editor",
        "boot-camp-assistant", "digital-color-meter",
        "colorsync-utility", "grab", "bluetooth-file-exchange", "audio-midi-setup", "x11", "disk-utility"
    ] },
    "mission-control", "dashboard", "system-preferences"
];

/* Measured off the 1280x800 shots: 7 columns on a 157px pitch centred on
   the screen, rows 117px apart with the first icon centred at y 112, 64px
   art, and a 94 x 107 selection box whose top sits 47px above the icon's
   centre.  Pitches scale with the screen; the icons do not. */
var LP_COLS = 7, LP_FOLDER_COLS = 7;
var LP_PITCH_X = 157, LP_PITCH_Y = 117, LP_ROW0 = 112;
var LP_BOX_W = 94, LP_BOX_H = 107, LP_BOX_UP = 47;
var LP_OPEN_MS = 200, LP_CLOSE_MS = 220;   /* 12 and 13 frames of the recording */

var lpOn = false, lpFolder = null, lpShown = [], lpSel = -1, lpCols = LP_COLS, lpHideTimer = null;

function lpItem(entry) {
    if (typeof entry !== "string") {
        return { folder: entry.folder, apps: entry.apps.map(appById).filter(Boolean) };
    }
    return { app: appById(entry) };
}

function lpItems() {
    return LP_LAYOUT.map(lpItem).filter(function (it) { return it.folder || it.app; });
}

/* Launchpad matches the start of a word, and a capital inside a name
   starts a word too: "t" finds FaceTime, iTunes and TextEdit but not
   Contacts.  Results keep their order on the page, folders opened out. */
function lpMatches(name, q) {
    var lower = name.toLowerCase();
    for (var i = 0; i < name.length; i++) {
        var prev = name.charAt(i - 1), ch = name.charAt(i);
        var start = i === 0 || /[\s\-.]/.test(prev) || (/[a-z]/.test(prev) && /[A-Z]/.test(ch));
        if (start && lower.substr(i, q.length) === q) return true;
    }
    return false;
}

function lpSearchResults(q) {
    var out = [];
    lpItems().forEach(function (it) {
        (it.folder ? it.apps : [it.app]).forEach(function (a) {
            if (lpMatches(a.name, q)) out.push({ app: a });
        });
    });
    return out;
}

/* ------------------------------------------------------------------ */
/* OPEN / CLOSE                                                        */
/* ------------------------------------------------------------------ */
function lpToggle() { lpOn ? lpClose() : lpOpen(); }

function lpOpen() {
    if (lpOn) return;
    menuCloseAll();
    if (spotOn) spotClose();
    lpOn = true;
    clearTimeout(lpHideTimer);

    var root = $("launchpad"), input = $("lpInput");
    input.value = "";
    input.blur();
    $("lpSearch").classList.remove("typed");
    lpFolderClose(true);
    lpRender();

    root.classList.remove("hidden");
    void root.offsetWidth;              /* start the transition from the closed state */
    root.classList.add("on");
    $("screen").classList.add("lp-fading", "lp-open");
}

function lpClose() {
    if (!lpOn) return;
    lpOn = false;
    var root = $("launchpad");
    $("lpInput").blur();
    root.classList.remove("on");
    $("screen").classList.remove("lp-open");
    clearTimeout(lpHideTimer);
    lpHideTimer = setTimeout(function () {
        root.classList.add("hidden");
        $("screen").classList.remove("lp-fading");
        lpFolderClose(true);
    }, LP_CLOSE_MS + 20);
}

/* ------------------------------------------------------------------ */
/* LAYOUT                                                              */
/* ------------------------------------------------------------------ */
function lpMetrics() {
    var W = window.innerWidth, H = window.innerHeight;
    var s = clamp(H / 800, 0.85, 1.5);
    return {
        W: W, H: H,
        px: Math.max(104, W * LP_PITCH_X / 1280),
        py: LP_PITCH_Y * s,
        row0: LP_ROW0 * s
    };
}

function lpCell(it, cx, cy, i) {
    var n = el("div", "lp-cell");
    n.style.left = Math.round(cx - LP_BOX_W / 2) + "px";
    n.style.top = Math.round(cy - LP_BOX_UP) + "px";
    n._i = i;
    var art;
    if (it.folder) {
        art = '<div class="lp-ftile">' + it.apps.slice(0, 9).map(function (a) {
            return '<span class="mini">' + appIconHTML(a, 32) + "</span>";
        }).join("") + "</div>";
    } else {
        art = appIconHTML(it.app, 128);
    }
    n.innerHTML = '<div class="lp-icon">' + art + "</div>" +
        '<div class="lp-label">' + esc(it.folder || it.app.name) + "</div>";
    return n;
}

/* the page: the full grid, or the search results -- which close up and
   centre themselves while there are fewer than a row of them */
function lpRender() {
    var page = $("lpPage"), m = lpMetrics();
    var q = $("lpInput").value.replace(/^\s+/, "").toLowerCase();
    var searching = q.length > 0;
    var items = searching ? lpSearchResults(q) : lpItems();

    page.innerHTML = "";
    lpShown = items;
    lpCols = LP_COLS;
    var cols = Math.min(items.length, LP_COLS) || 1;
    /* the reference's middle column sits on x 639, a pixel left of centre */
    var x0 = m.W / 2 - 1 - (cols - 1) / 2 * m.px;

    items.forEach(function (it, i) {
        var cx = x0 + (i % LP_COLS) * m.px;
        var cy = m.row0 + Math.floor(i / LP_COLS) * m.py;
        var n = lpCell(it, cx, cy, i);
        it.node = n;
        page.appendChild(n);
    });

    lpSelect(searching && items.length ? 0 : -1);
}

function lpSelect(i) {
    var list = lpFolder ? lpFolder.shown : lpShown;
    lpSel = list.length ? clamp(i, -1, list.length - 1) : -1;
    list.forEach(function (it, n) { it.node.classList.toggle("sel", n === lpSel); });
}

function lpMove(dx, dy) {
    var list = lpFolder ? lpFolder.shown : lpShown;
    if (!list.length) return;
    var cols = lpFolder ? LP_FOLDER_COLS : lpCols;
    if (lpSel < 0) { lpSelect(0); return; }
    var next = lpSel + dx + dy * cols;
    if (next < 0 || next >= list.length) {
        if (dy) return;                 /* up off the top row stays put */
        next = clamp(next, 0, list.length - 1);
    }
    lpSelect(next);
}

function lpActivate(it) {
    if (!it) return;
    if (it.folder) { lpFolderOpen(it); return; }
    var id = it.app.id;
    lpClose();
    launch(id);
}

/* ------------------------------------------------------------------ */
/* THE OTHER FOLDER                                                    */
/* ------------------------------------------------------------------ */
/* Opening a folder blurs the page away and lays its apps out in a panel
   under the folder's name.  A click anywhere off the panel shuts it. */
function lpFolderOpen(it) {
    var wrap = $("lpFolder"), panel = $("lpFolderPanel"), m = lpMetrics();
    var apps = it.apps.map(function (a) { return { app: a }; });
    var cols = Math.min(apps.length, LP_FOLDER_COLS);
    var rows = Math.ceil(apps.length / LP_FOLDER_COLS);

    var pw = cols * m.px, ph = (rows - 1) * m.py + LP_BOX_H + 40;
    var pl = Math.round((m.W - pw) / 2);
    var dockH = sys.dockPosition === "bottom" ? parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue("--dock-h")) : 0;
    var pt = Math.round(Math.max(110, (m.H - dockH - ph) / 2));

    panel.style.cssText = "left:" + pl + "px;top:" + pt + "px;width:" + pw + "px;height:" + ph + "px";
    panel.innerHTML = "";
    apps.forEach(function (a, i) {
        var cx = m.px / 2 + (i % LP_FOLDER_COLS) * m.px;
        var cy = 20 + LP_BOX_UP + Math.floor(i / LP_FOLDER_COLS) * m.py;
        var n = lpCell(a, cx, cy, i);
        a.node = n;
        panel.appendChild(n);
    });
    $("lpFolderTitle").textContent = it.folder;
    $("lpFolderTitle").style.top = (pt - 52) + "px";

    /* the panel grows out of the folder's own tile */
    var tile = it.node.querySelector(".lp-icon").getBoundingClientRect();
    panel.style.transformOrigin = (tile.left + tile.width / 2 - pl) + "px " +
        (tile.top + tile.height / 2 - pt) + "px";

    lpFolder = { item: it, shown: apps };
    lpSel = -1;
    $("lpInput").blur();
    wrap.classList.remove("hidden");
    void wrap.offsetWidth;
    $("launchpad").classList.add("folder-open");
}

function lpFolderClose(instant) {
    if (!lpFolder && !instant) return;
    lpFolder = null;
    $("launchpad").classList.remove("folder-open");
    var wrap = $("lpFolder");
    if (instant) { wrap.classList.add("hidden"); return; }
    setTimeout(function () { if (!lpFolder) wrap.classList.add("hidden"); }, 240);
    lpSelect(-1);
}

/* ------------------------------------------------------------------ */
/* INPUT                                                               */
/* ------------------------------------------------------------------ */
function lpInit() {
    var root = $("launchpad"), input = $("lpInput"), field = $("lpSearch");

    input.addEventListener("input", function () {
        field.classList.toggle("typed", input.value.length > 0);
        if (lpFolder) lpFolderClose();
        lpRender();
    });

    input.addEventListener("keydown", function (e) {
        /* ⌘Space still reaches the global handler, for Spotlight */
        if ((e.metaKey || e.ctrlKey) && (e.key === " " || e.code === "Space")) return;
        e.stopPropagation();
        lpKey(e);
    });

    $("lpClear").addEventListener("mousedown", function (e) {
        e.preventDefault();
        e.stopPropagation();
        input.value = "";
        field.classList.remove("typed");
        input.focus();
        lpRender();
    });

    /* A press on an icon darkens it and a release on the same icon opens
       it.  A click that starts and ends on the background closes the
       folder if one is open, otherwise Launchpad itself. */
    var downCell = null, downBg = false;
    root.addEventListener("mousedown", function (e) {
        if (e.button === 2) return;
        downCell = e.target.closest(".lp-cell");
        downBg = !downCell && !e.target.closest("#lpSearch, #lpFolderPanel");
        if (downCell) {
            e.preventDefault();
            downCell.classList.add("pressed");
        } else if (downBg) {
            e.preventDefault();
        }
    });
    document.addEventListener("mouseup", function (e) {
        var cell = downCell, bg = downBg;
        downCell = null;
        downBg = false;
        if (cell) cell.classList.remove("pressed");
        if (!lpOn) return;
        var up = e.target.closest ? e.target.closest(".lp-cell") : null;
        if (cell && up === cell) {
            var list = lpFolder && cell.parentNode.id === "lpFolderPanel" ? lpFolder.shown : lpShown;
            lpActivate(list[cell._i]);
            return;
        }
        if (bg && root.contains(e.target) && !e.target.closest(".lp-cell, #lpSearch, #lpFolderPanel")) {
            lpFolder ? lpFolderClose() : lpClose();
        }
    });
    root.addEventListener("contextmenu", function (e) { e.preventDefault(); e.stopPropagation(); });

    /* registered ahead of the global shortcuts, so while Launchpad is up it
       gets the keyboard first and nothing reaches the windows behind it */
    document.addEventListener("keydown", function (e) {
        if (!lpOn || !loggedIn) return;
        if ((e.metaKey || e.ctrlKey) && (e.key === " " || e.code === "Space")) return;
        if (e.target && e.target.tagName === "INPUT" && e.target !== input) return;
        e.stopImmediatePropagation();

        var printable = e.key.length === 1 && e.key !== " " && !e.metaKey && !e.ctrlKey && !e.altKey;
        if (printable || (e.key === "Backspace" && input.value)) {
            /* typing anywhere goes to the search field; focusing it here
               lets this very keystroke land in it */
            if (lpFolder) lpFolderClose();
            input.focus();
            return;
        }
        lpKey(e);
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "F4" && loggedIn) { lpToggle(); e.preventDefault(); }
    });

    window.addEventListener("resize", function () {
        if (!lpOn) return;
        if (lpFolder) lpFolderClose(true);
        lpRender();
    });
}

function lpKey(e) {
    var input = $("lpInput");
    var list = lpFolder ? lpFolder.shown : lpShown;
    switch (e.key) {
        case "Escape":
            if (e.defaultPrevented) return;     /* it closed a menu instead */
            e.preventDefault();
            if (lpFolder) lpFolderClose();
            else if (input.value) {
                input.value = "";
                $("lpSearch").classList.remove("typed");
                lpRender();
            } else lpClose();
            return;
        case "Enter":
            e.preventDefault();
            lpActivate(list[lpSel]);
            return;
        case "ArrowLeft": e.preventDefault(); lpMove(-1, 0); return;
        case "ArrowRight": e.preventDefault(); lpMove(1, 0); return;
        case "ArrowUp": e.preventDefault(); lpMove(0, -1); return;
        case "ArrowDown": e.preventDefault(); lpMove(0, 1); return;
    }
}
