"use strict";
/* the Dock: magnification, launching, running dots, and the Trash */

var dockEl, dockItems = [];

function dockRender() {
    dockEl = $("dock");
    dockEl.innerHTML = "";
    dockItems = [];

    APPS.forEach(function (a) { dockAdd(a); });

    dockEl.appendChild(el("div", "dock-sep"));

    /* a minimised window gets its own tile between the rule and the Trash,
       holding a thumbnail of itself -- which is where the genie flies to */
    wins.forEach(function (w) { if (w.minimized) dockAddMin(w); });

    dockAdd({ id: "trash", name: "Trash", ph: "🗑" }, true);
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
        if (isTrash) { openFinderTrash(); return; }
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
var DOCK_ICON = 61;          /* measured: 61px art on a 65px pitch */
var MAG = 1.85, SPREAD = 95;

function dockMagnify(e) {
    if (!sys.dockMagnify) return dockReset();
    var r = dockEl.getBoundingClientRect();
    if (e.clientY < r.top - 40) return dockReset();
    dockItems.forEach(function (n) {
        var b = n.getBoundingClientRect();
        var d = Math.abs(e.clientX - (b.left + b.width / 2));
        var s = d > SPREAD ? 1 : 1 + (MAG - 1) * Math.pow(Math.cos(d / SPREAD * 1.5708), 2);
        n.style.width = (DOCK_ICON * s) + "px";
        n.style.height = (DOCK_ICON * s) + "px";
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

function dockBackgroundMenu() {
    return [
        { l: "Turn Magnification " + (sys.dockMagnify ? "Off" : "On"), act: function () {
            sys.dockMagnify = !sys.dockMagnify;
            dockReset();
        } },
        { l: "Turn Hiding " + (sys.dockHide ? "Off" : "On"), act: function () {
            sys.dockHide = !sys.dockHide;
            dockEl.classList.toggle("hidden-dock", sys.dockHide);
        } },
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
        var r = dockEl.getBoundingClientRect();
        if (sys.dockHide) {
            var near = e.clientY > window.innerHeight - 6;
            dockEl.classList.toggle("hidden-dock", !near);
        }
        if (e.clientY > r.top - 30) dockMagnify(e); else dockReset();
    });
    dockEl.addEventListener("mouseleave", dockReset);
    dockEl.addEventListener("contextmenu", function (e) {
        if (e.target === dockEl || e.target.classList.contains("dock-sep")) {
            contextMenu(e, dockBackgroundMenu());
        }
    });
}
