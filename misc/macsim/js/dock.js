"use strict";
/* the Dock: magnification, launching, running dots, and the Trash */

var dockEl, dockItems = [];

/* apps that are running but were never pinned to the Dock get a tile of
   their own, in the order they launched -- see dockRunningAdd/Remove */
var dockRunning = [];

function dockPinned(id) {
    return APPS.some(function (a) { return a.id === id; });
}

function dockRender() {
    dockEl = $("dock");
    dockEl.innerHTML = "";
    dockItems = [];

    APPS.forEach(function (a) { dockAdd(a); });
    dockRunning.forEach(function (id) {
        var a = appById(id);
        if (a) dockAdd(a);
    });

    dockEl.appendChild(el("div", "dock-sep"));

    /* a minimised window gets its own tile between the rule and the Trash,
       holding a thumbnail of itself -- which is where the genie flies to */
    wins.forEach(function (w) { if (w.minimized) dockAddMin(w); });

    dockAdd({ id: "trash", name: "Trash", ph: "🗑" }, true);
    dockFit();          /* a tile more or less can change what fits */
    dockSync();
}

function dockAddMin(w) {
    var n = el("div", "dock-item dock-min");
    n.id = "dockmin-" + w.id;
    n.innerHTML = '<div class="thumb"></div><div class="tip">' + esc(w.title || "Window") + "</div>";
    var thumb = n.querySelector(".thumb");

    /* the picture is the window itself, scaled down to the slot's width */
    var box = w.node.getBoundingClientRect();
    var ww = box.width || w.w, wh = box.height || w.h;
    var scale = DOCK_ICON / ww;
    thumb.style.height = Math.round(wh * scale) + "px";
    var shot = el("div", "shotwrap");
    shot.style.cssText = "width:" + ww + "px;height:" + wh + "px;transform:scale(" +
        scale.toFixed(4) + ");transform-origin:top left";
    shot.innerHTML = w.thumbHTML || "";
    var inner = shot.firstElementChild;
    if (inner) {
        inner.classList.remove("hidden", "inactive");
        inner.style.cssText = "position:absolute;left:0;top:0;width:" + ww + "px;height:" +
            wh + "px;box-shadow:none";
    }
    thumb.appendChild(shot);

    n._win = w;
    n.addEventListener("mouseenter", function () { n.classList.add("tipped"); });
    n.addEventListener("mouseleave", function () { n.classList.remove("tipped", "pressed"); });
    n.addEventListener("mousedown", function (e) {
        if (e.button === 2) return;
        e.preventDefault();
        menuCloseAll();
        n.classList.add("pressed");
    });
    n.addEventListener("mouseup", function (e) {
        if (e.button === 2 || !n.classList.contains("pressed")) return;
        n.classList.remove("pressed");
        if (lpOn) lpClose();
        winRestore(w);
    });
    /* the only thing a minimised window's menu offers */
    n.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dockMenu(n, [{
            l: "Open “" + (w.title || "Window") + "”",
            act: function () { winRestore(w); }
        }]);
    });

    dockEl.appendChild(n);
    dockItems.push(n);
    return n;
}

function dockAdd(app, isTrash) {
    var n = el("div", "dock-item");
    n.id = "dockitem-" + app.id;
    n.innerHTML = (isTrash ? trashIconHTML(DOCK_ICON) : appIconHTML(app, 128)) +
        '<div class="tip">' + esc(app.name) + "</div>";
    n._app = app;
    n._trash = !!isTrash;

    n.addEventListener("mouseenter", function () { n.classList.add("tipped"); });
    n.addEventListener("mouseleave", function () {
        n.classList.remove("tipped", "pressed");
    });

    /* The recording holds the icon dark for as long as the button is down
       and only launches -- and bounces -- on release, so the press and the
       launch are two separate events here as well. */
    n.addEventListener("mousedown", function (e) {
        if (e.button === 2) return;
        e.preventDefault();
        menuCloseAll();
        n.classList.add("pressed");
    });
    n.addEventListener("mouseup", function (e) {
        if (e.button === 2 || !n.classList.contains("pressed")) return;
        n.classList.remove("pressed");
        if (isTrash) { if (lpOn) lpClose(); if (mcOn) mcClose(); openFinderTrash(); return; }
        launch(app.id);
    });
    n.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dockMenu(n, isTrash ? dockTrashMenu() : dockItemMenu(app));
    });

    dockEl.appendChild(n);
    dockItems.push(n);
    return n;
}

/* ------------------------------------------------------------------ */
/* A RUNNING APP THAT ISN'T PINNED                                     */
/* ------------------------------------------------------------------ */
/* Traced from ref_pic/app open not in dock.mp4: launching an app with no
   Dock icon of its own grows one from nothing -- width, height and opacity
   all animating together, no overshoot -- in the running-apps slot right
   before the Trash divider, over about 10 frames at 60fps. It stays there,
   full size, for as long as the app is running; quitting plays the same
   transition in reverse before the tile is removed. */
var DOCK_RUN_MS = 180;

function dockRunningAdd(id) {
    if (!dockEl || dockRunning.indexOf(id) >= 0) return;
    var app = appById(id);
    if (!app) return;

    /* a quit's shrink hadn't finished before this relaunch -- drop it now */
    var stale = $("dockitem-" + id);
    if (stale) {
        clearTimeout(stale._leaveTimer);
        stale.remove();
        dockItems = dockItems.filter(function (x) { return x !== stale; });
    }

    dockRunning.push(id);
    var n = dockAdd(app);
    dockEl.insertBefore(n, dockEl.querySelector(".dock-sep"));
    dockFit();

    n.classList.add("dock-anim", "entering");
    void n.offsetWidth;                 /* commit the collapsed state first */
    requestAnimationFrame(function () {
        n.classList.remove("entering");
        setTimeout(function () { n.classList.remove("dock-anim"); }, DOCK_RUN_MS + 30);
    });
}

function dockRunningRemove(id) {
    var i = dockRunning.indexOf(id);
    if (i < 0) return;
    dockRunning.splice(i, 1);
    var n = $("dockitem-" + id);
    if (!n) return;
    dockItems = dockItems.filter(function (x) { return x !== n; });

    n.classList.add("dock-anim", "leaving");
    n._leaveTimer = setTimeout(function () {
        n.remove();
        dockFit();
    }, DOCK_RUN_MS + 30);
}

/* trash.png / trash-full.png ship with the icon library, so the Dock just
   swaps between them as the Trash fills and empties. */
function trashIconHTML(size) {
    var full = TRASH.children.length > 0;
    /* "fill" lets the Dock's magnification size it, the way the app icons
       are sized, rather than pinning it to the resting 61px */
    return sysIcon(full ? "trash-full" : "trash", size || DOCK_ICON, "fill");
}

/* ------------------------------------------------------------------ */
/* MAGNIFICATION                                                       */
/* ------------------------------------------------------------------ */
/* Measured: 61px art on a 65px pitch, which is the size the Dock keeps for
   as long as it fits.  Like the real one it never runs off the screen:
   when the window is too narrow for it (or minimised windows crowd it) the
   icons shrink until it fits, and while it magnifies, a Dock whose ends
   reach the edges shrinks as a whole instead of spilling over, then
   settles back when the pointer leaves. */
var DOCK_ICON_MAX = 61, DOCK_ICON_MIN = 16;
var DOCK_ICON = DOCK_ICON_MAX;
var DOCK_EDGE = 4;           /* the closest the Dock's ends come to the screen's */
var DOCK_CHROME = 38;        /* 3px padding and a 1px border each side, plus the 30px rule */
var DOCK_GUTTER = 4;         /* the 2px margin either side of every tile */
var MAG_PX = 113;            /* a magnified icon's full size: 61 x 1.85 */
var SPREAD_PITCHES = 95 / 65;

function dockAvail() {
    var span = sys.dockPosition === "bottom" ? window.innerWidth : window.innerHeight;
    return span - 2 * DOCK_EDGE;
}

/* the icon size the Dock rests at: as large as fits, never above 61 */
function dockFit() {
    if (!dockEl) return;
    var n = dockItems.length || 1;
    var icon = Math.floor((dockAvail() - DOCK_CHROME) / n - DOCK_GUTTER);
    icon = clamp(icon, DOCK_ICON_MIN, DOCK_ICON_MAX);
    if (icon === DOCK_ICON) return;
    DOCK_ICON = icon;
    var root = document.documentElement.style;
    root.setProperty("--dock-icon", icon + "px");
    root.setProperty("--dock-h", (icon + 16) + "px");
    dockReset();
}

function dockMagnify(e) {
    if (!sys.dockMagnify) return dockReset();
    var side = sys.dockPosition;
    var r = dockEl.getBoundingClientRect();
    var past = side === "bottom" ? e.clientY < r.top - 40
        : side === "left" ? e.clientX > r.right + 40
        : e.clientX < r.left - 40;
    if (past) return dockReset();

    var icon = DOCK_ICON, peak = Math.max(1, MAG_PX / icon) - 1;
    var spread = SPREAD_PITCHES * (icon + DOCK_GUTTER);
    var extra = dockItems.map(function (n) {
        var b = n.getBoundingClientRect();
        var d = side === "bottom" ? Math.abs(e.clientX - (b.left + b.width / 2))
            : Math.abs(e.clientY - (b.top + b.height / 2));
        return d > spread ? 0 : peak * Math.pow(Math.cos(d / spread * 1.5708), 2);
    });

    /* would the swollen Dock pass the edges?  then every tile, magnified or
       not, comes down by the same factor so its ends just meet them -- the
       whole Dock gets shorter for as long as the pointer is there */
    var sum = 0;
    extra.forEach(function (x) { sum += icon * (1 + x); });
    var room = dockAvail() - DOCK_CHROME - dockItems.length * DOCK_GUTTER;
    var q = sum > room ? room / sum : 1;

    dockItems.forEach(function (n, i) {
        var s = (1 + extra[i]) * q;
        n.style.width = (icon * s) + "px";
        n.style.height = (icon * s) + "px";
        if (n._win) dockScaleThumb(n, s);
    });
}

function dockReset() {
    dockItems.forEach(function (n) {
        n.style.width = "";
        n.style.height = "";
        if (n._win) dockScaleThumb(n, 1);
    });
}

/* the thumbnail grows with its tile, keeping the window's proportions */
function dockScaleThumb(n, s) {
    var w = n._win;
    var box = w.node.getBoundingClientRect();
    var ww = box.width || w.w, wh = box.height || w.h;
    var scale = DOCK_ICON * s / ww;
    var thumb = n.querySelector(".thumb");
    var shot = n.querySelector(".shotwrap");
    if (!thumb || !shot) return;
    thumb.style.height = Math.round(wh * scale) + "px";
    shot.style.transform = "scale(" + scale.toFixed(4) + ")";
}

/* ------------------------------------------------------------------ */
/* STATE                                                               */
/* ------------------------------------------------------------------ */
function dockSync() {
    dockItems.forEach(function (n) {
        if (n._win) return;            /* a minimised window's tile */
        var dot = n.querySelector(".dot");
        var on = !n._trash && appRunning(n._app.id);
        if (on && !dot) n.appendChild(el("div", "dot"));
        if (!on && dot) dot.remove();
        if (n._trash) {
            var img = n.querySelector("img, .ph");
            if (img) {
                var wrap = el("div");
                wrap.innerHTML = trashIconHTML(DOCK_ICON);
                img.replaceWith(wrap.firstElementChild);
            }
        }
    });
}

/* one 17px bounce over 690ms, the length the recording measures */
var BOUNCE_MS = 690;

function dockBounce(id) {
    var n = $("dockitem-" + id);
    if (!n) return;
    n.classList.remove("bouncing");
    void n.offsetWidth;                 /* restart the animation on a relaunch */
    n.classList.add("bouncing");
    clearTimeout(n._bounce);
    n._bounce = setTimeout(function () { n.classList.remove("bouncing"); }, BOUNCE_MS + 40);
}

/* ------------------------------------------------------------------ */
/* MENUS                                                               */
/* ------------------------------------------------------------------ */
function dockItemMenu(app) {
    if (app.id === "finder") return finderDockMenu();
    var open = wins.filter(function (w) { return w.app === app.id; });
    var m = [];
    if (open.length) {
        open.forEach(function (w) {
            m.push({ l: w.title || app.name, mark: w === frontWindow() ? "✓" : "", act: function () { winFocus(w); } });
        });
        m.push({ sep: 1 });
    }
    m.push({ l: "Options", sub: [
        { l: "Keep in Dock", mark: "✓" },
        { l: "Open at Login" },
        { sep: 1 },
        { l: "Show in Finder", act: function () { openFinder(fsFind("Applications")); } }
    ] });
    m.push({ sep: 1 });
    m.push({ l: "Show All Windows", d: !open.length, act: bringAllToFront });
    m.push({ l: appRunning(app.id) ? "Quit" : "Open", act: function () {
        appRunning(app.id) && app.id !== "finder" ? quitApp(app.id) : launch(app.id);
    } });
    return m;
}

function dockTrashMenu() {
    return [
        { l: "Open", act: openFinderTrash },
        { sep: 1 },
        { l: "Empty Trash", d: !TRASH.children.length, act: emptyTrash }
    ];
}

/* moving the Dock to a screen edge is a class on #screen -- dock.css keys
   its left/right layout off it, and boot.css/notification-center.css key
   their own per-edge transforms off it too */
function dockSetPosition(pos) {
    if (sys.dockPosition === pos) return;
    sys.dockPosition = pos;
    var screen = $("screen");
    if (screen) {
        screen.classList.toggle("dock-pos-left", pos === "left");
        screen.classList.toggle("dock-pos-right", pos === "right");
    }
    dockFit();
    dockReset();
}

function dockPositionMenu() {
    var row = function (l, pos) {
        return { l: l, mark: sys.dockPosition === pos ? "✓" : "", act: function () { dockSetPosition(pos); } };
    };
    return [row("Left", "left"), row("Bottom", "bottom"), row("Right", "right")];
}

function dockMinimizeMenu() {
    var row = function (l, fx) {
        return { l: l, mark: sys.dockMinimizeEffect === fx ? "✓" : "", act: function () { sys.dockMinimizeEffect = fx; } };
    };
    return [row("Genie Effect", "genie"), row("Scale Effect", "scale")];
}

function dockBackgroundMenu() {
    return [
        { l: "Turn Hiding " + (sys.dockHide ? "Off" : "On"), act: function () {
            sys.dockHide = !sys.dockHide;
            dockEl.classList.toggle("hidden-dock", sys.dockHide);
        } },
        { l: "Turn Magnification " + (sys.dockMagnify ? "Off" : "On"), act: function () {
            sys.dockMagnify = !sys.dockMagnify;
            dockReset();
        } },
        { sep: 1 },
        { l: "Position on Screen", sub: dockPositionMenu },
        { l: "Minimize Using", sub: dockMinimizeMenu },
        { sep: 1 },
        { l: "Dock Preferences…", act: function () { launch("system-preferences"); } }
    ];
}

function openFinderTrash() {
    running.finder = true;
    setActiveApp("finder");
    return openFinder(TRASH);
}

/* ------------------------------------------------------------------ */
/* DRAG TO TRASH                                                       */
/* ------------------------------------------------------------------ */
function dockHitTrash(e) {
    var t = $("dockitem-trash");
    if (!t) return false;
    var r = t.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
}

function dockDragOver(e) {
    var t = $("dockitem-trash");
    if (t) t.classList.toggle("drop-target", dockHitTrash(e));
}

function dockDropped(e) {
    var t = $("dockitem-trash");
    if (t) t.classList.remove("drop-target");
    return dockHitTrash(e);
}

function dockInit() {
    dockRender();
    document.addEventListener("mousemove", function (e) {
        if (!dockEl) return;
        var side = sys.dockPosition;
        var r = dockEl.getBoundingClientRect();
        if (sys.dockHide) {
            var near = side === "bottom" ? e.clientY > window.innerHeight - 6
                : side === "left" ? e.clientX < 6
                : e.clientX > window.innerWidth - 6;
            dockEl.classList.toggle("hidden-dock", !near);
        }
        var approaching = side === "bottom" ? e.clientY > r.top - 30
            : side === "left" ? e.clientX < r.right + 30
            : e.clientX > r.left - 30;
        if (approaching) dockMagnify(e); else dockReset();
    });
    dockEl.addEventListener("mouseleave", dockReset);
    window.addEventListener("resize", dockFit);
    dockEl.addEventListener("contextmenu", function (e) {
        if (e.target === dockEl || e.target.classList.contains("dock-sep")) {
            contextMenu(e, dockBackgroundMenu());
        }
    });
}
