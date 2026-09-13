"use strict";
/* the window manager: chrome, stacking, dragging, resizing, and the small
   panels (About, alerts, Force Quit) that ride on the same machinery */

var wins = [], zTop = 10, winSeq = 0, cascade = 0;

function winLayer() { return $("windows"); }

function frontWindow() {
    var best = null;
    wins.forEach(function (w) {
        if (w.minimized || w.hidden) return;
        if (!best || w.z > best.z) best = w;
    });
    return best;
}

function winCreate(o) {
    var w = {
        id: "w" + (++winSeq),
        app: o.app || "finder",
        title: o.title || "Untitled",
        kind: o.kind || "plain",
        x: o.x, y: o.y, w: o.w || 560, h: o.h || 380,
        minimized: false, hidden: false, zoomed: false,
        resizable: o.resizable !== false,
        min: o.minimizable !== false,
        sel: [], back: [], fwd: [], view: "icons", sidebar: true, status: true
    };
    if (w.x == null) {
        /* new windows step down and to the right, the way the Finder does */
        cascade = (cascade + 1) % 8;
        w.x = 90 + cascade * 24;
        w.y = 40 + cascade * 22;
    }

    var n = el("div", "win" + (o.unified ? " unified" : "") +
        (o.chromeless ? " chromeless" : "") + (o.utility ? " utility" : "") +
        (o.noZoom ? " no-zoom" : ""));
    n.style.cssText = "left:" + w.x + "px;top:" + w.y + "px;width:" + w.w + "px;height:" + w.h + "px";
    n.innerHTML =
        '<div class="titlebar"><div class="lights">' +
        '<i class="close"></i>' + (w.min ? '<i class="min"></i>' : '<i class="min" style="visibility:hidden"></i>') +
        (o.zoomable === false ? '<i class="zoom" style="visibility:hidden"></i>' : '<i class="zoom"></i>') +
        "</div><span class=\"t\">" + esc(w.title) + "</span></div>" +
        '<div class="win-body"></div>' +
        (w.resizable ? '<div class="resizer" data-cursor="resizenorthwestsoutheast"></div>' : "");

    if (o.chromeless) n.querySelector(".titlebar").classList.add("bare");

    w.node = n;
    w.body = n.querySelector(".win-body");
    w.titleEl = n.querySelector(".titlebar .t");

    n.addEventListener("mousedown", function () { winFocus(w); });
    n.querySelector(".close").addEventListener("mousedown", function (e) {
        e.stopPropagation(); winClose(w);
    });
    var mn = n.querySelector(".min");
    mn && mn.addEventListener("mousedown", function (e) { e.stopPropagation(); winMinimize(w); });
    var zm = n.querySelector(".zoom");
    zm && zm.addEventListener("mousedown", function (e) { e.stopPropagation(); winZoom(w); });

    winDrag(w, n.querySelector(".titlebar"));
    if (w.resizable) winResize(w, n.querySelector(".resizer"));

    winLayer().appendChild(n);
    wins.push(w);
    winFocus(w);
    dockSync();
    return w;
}

function winSetTitle(w, t, iconHTML) {
    w.title = t;
    w.titleEl.textContent = t;
    var ic = w.node.querySelector(".titlebar .ticon");
    if (iconHTML == null) { if (ic) ic.remove(); return; }
    if (!ic) {
        ic = el("span", "ticon");
        w.titleEl.parentNode.insertBefore(ic, w.titleEl);
    }
    ic.innerHTML = iconHTML;
}

function winFocus(w) {
    if (!w) return;
    if (w.minimized) { winRestore(w); return; }
    if (w.hidden) { w.hidden = false; w.node.classList.remove("hidden"); }
    w.z = ++zTop;
    w.node.style.zIndex = w.z;
    wins.forEach(function (o) { o.node.classList.toggle("inactive", o !== w); });
    if (activeApp !== w.app) setActiveApp(w.app);
    dtBlur(true);
    dockSync();
}

function winClose(w) {
    w.node.remove();
    wins = wins.filter(function (o) { return o !== w; });
    var next = frontWindow();
    if (next) winFocus(next);
    else if (!wins.length) setActiveApp(appRunning(w.app) ? w.app : "finder");
    dockSync();
}

function quickLookToggle() {
    if (window._ql) { winClose(window._ql); window._ql = null; return; }
    var s = dtSelection();
    if (s.length) { quickLook(s[0].node); return; }
    var w = frontWindow();
    if (w && w.app === "finder" && fwSelection(w).length) quickLook(fwSelection(w)[0]);
}

function closeFrontWindow() {
    var w = frontWindow();
    if (w) winClose(w);
}

/* winMinimize and winRestore live in genie.js, with the effect */

function winZoom(w) {
    if (!w) return;
    if (w.zoomed) {
        w.node.style.cssText = "left:" + w.pre.x + "px;top:" + w.pre.y + "px;width:" +
            w.pre.w + "px;height:" + w.pre.h + "px;z-index:" + w.z;
        w.zoomed = false;
        w.node.classList.remove("zoomed");
    } else {
        var b = w.node.getBoundingClientRect(), host = winLayer().getBoundingClientRect();
        w.pre = { x: b.left - host.left, y: b.top - host.top, w: b.width, h: b.height };
        w.node.style.cssText = "left:0;top:0;width:100%;height:100%;z-index:" + w.z;
        w.zoomed = true;
        w.node.classList.add("zoomed");
    }

}

function cycleWindows() {
    var live = wins.filter(function (w) { return !w.minimized && !w.hidden; });
    if (live.length < 2) return;
    live.sort(function (a, b) { return a.z - b.z; });
    winFocus(live[0]);
}

function bringAllToFront() {
    wins.filter(function (w) { return w.app === activeApp; })
        .forEach(function (w) { winFocus(w); });
}

function winDrag(w, handle) {
    handle.addEventListener("mousedown", function (e) {
        if (e.target.closest(".lights")) return;
        if (w.zoomed) return;
        var host = winLayer().getBoundingClientRect();
        var sx = e.clientX, sy = e.clientY;
        var ox = w.node.offsetLeft, oy = w.node.offsetTop;
        var move = function (ev) {
            /* a window can go off the sides but never above the menu bar */
            w.node.style.left = (ox + ev.clientX - sx) + "px";
            w.node.style.top = Math.max(0, oy + ev.clientY - sy) + "px";
        };
        var up = function () {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
        };
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
        e.preventDefault();
    });
}

function winResize(w, grip) {
    grip.addEventListener("mousedown", function (e) {
        e.stopPropagation();
        var sx = e.clientX, sy = e.clientY;
        var ow = w.node.offsetWidth, oh = w.node.offsetHeight;
        var move = function (ev) {
            w.node.style.width = Math.max(320, ow + ev.clientX - sx) + "px";
            w.node.style.height = Math.max(180, oh + ev.clientY - sy) + "px";
        };
        var up = function () {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
        };
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
        e.preventDefault();
    });
}

/* ------------------------------------------------------------------ */
/* APPS                                                                */
/* ------------------------------------------------------------------ */
var running = { finder: true };

function appRunning(id) { return !!running[id]; }

function setActiveApp(id) {
    if (activeApp === id) return;
    activeApp = id;
    barRender();
}

function launch(id, forceNew) {
    var app = appById(id);
    if (!app) return;
    if (app.kind === "none") { dockBounce(id); return; }

    running[id] = true;
    setActiveApp(id);

    if (!forceNew) {
        var open = wins.filter(function (w) { return w.app === id; });
        if (open.length) { winFocus(open[open.length - 1]); dockSync(); return; }
    }

    dockBounce(id);
    if (id === "finder") { openFinder(DESKTOP); return; }
    openPlaceholder(id, app.name, null, app);
    dockSync();
}

function quitApp(id) {
    wins.filter(function (w) { return w.app === id; }).forEach(winClose);
    if (id !== "finder") delete running[id];
    setActiveApp("finder");
    dockSync();
}

/* the stand-in window every app that is not the Finder gets */
function openPlaceholder(appId, title, text, app) {
    app = app || appById(appId) || { name: title, ph: title[0], id: appId };
    var w = winCreate({
        app: appId, title: title, w: app.w || 560, h: app.h || 400
    });
    w.body.innerHTML =
        '<div class="placeholder-app">' +
        '<div class="art">' + (appById(appId) ? appIconHTML(app, 256) : "") + "</div>" +
        "<h2>" + esc(title) + "</h2>" +
        "<p>" + esc(text || (app.name + " is not part of this simulation yet.")) + "</p>" +
        "</div>";
    var art = w.body.querySelector(".art");
    if (art && !art.firstElementChild) art.innerHTML = '<div class="big">' + esc(app.ph || "?") + "</div>";
    if (art) art.style.cssText = "width:96px;height:96px;display:flex;align-items:center;justify-content:center";
    return w;
}

/* ------------------------------------------------------------------ */
/* PANELS                                                              */
/* ------------------------------------------------------------------ */
function openAboutApp(app) {
    var w = winCreate({
        app: app.id, title: "", w: 380, h: 260, resizable: false, zoomable: false, minimizable: false
    });
    w.body.innerHTML = '<div class="about"><div style="padding:22px 0 10px">' +
        '<div style="width:96px;height:96px;margin:0 auto">' + appIconHTML(app, 256) + "</div></div>" +
        '<div style="font:400 20px var(--sf-display)">' + esc(app.name) + "</div>" +
        '<div class="ver">Version ' + esc(app.ver || "1.0") + "</div>" +
        '<div style="font-size:11px;color:rgba(0,0,0,.45)">© 2026 Apple Inc.</div></div>';
    return w;
}

function openPrompt(label, value, onOK) {
    var w = winCreate({
        app: activeApp, title: "", w: 420, h: 160,
        resizable: false, zoomable: false, minimizable: false,
        x: (window.innerWidth - 420) / 2, y: 120
    });
    w.body.innerHTML =
        '<div style="padding:18px 20px;font:13px var(--sf-text)">' +
        '<div style="margin-bottom:8px">' + esc(label) + "</div>" +
        '<input id="pmIn" style="width:100%;height:22px;font:13px var(--sf-text);' +
        'border:1px solid rgba(0,0,0,.25);border-radius:4px;padding:0 6px;outline:none">' +
        '<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end">' +
        '<span class="btn" id="pmCancel">Cancel</span>' +
        '<span class="btn default" id="pmGo">Go</span></div></div>';
    var inp = w.body.querySelector("#pmIn");
    inp.value = value || "";
    inp.focus();
    inp.select();
    inp.addEventListener("keydown", function (e) {
        e.stopPropagation();
        if (e.key === "Enter") { var v = inp.value; winClose(w); onOK(v); }
        if (e.key === "Escape") winClose(w);
    });
    w.body.querySelector("#pmCancel").addEventListener("click", function () { winClose(w); });
    w.body.querySelector("#pmGo").addEventListener("click", function () {
        var v = inp.value; winClose(w); onOK(v);
    });
    return w;
}

function openForceQuit() {
    var w = winCreate({
        app: activeApp, title: "Force Quit Applications", w: 340, h: 292,
        resizable: false, zoomable: false, minimizable: false,
        x: (window.innerWidth - 340) / 2, y: 110
    });
    var pick = null;
    var draw = function () {
        var ids = Object.keys(running);
        w.body.innerHTML = '<div class="fq-body">' +
            "<div>If an app doesn’t respond for a while, select its name and click Force Quit.</div>" +
            '<div class="fq-list">' + ids.map(function (id) {
                var a = appById(id) || { name: id };
                return '<div class="r' + (pick === id ? " sel" : "") + '" data-id="' + id + '">' +
                    '<span class="art">' +
                    (appById(id) ? appIconHTML(a, 32) : "") + "</span>" +
                    esc(a.name) + (id === "finder" ? " (Finder)" : "") + "</div>";
            }).join("") + "</div>" +
            '<div class="fq-foot"><span class="btn' + (pick ? " default" : "") + '" id="fqGo">' +
            (pick === "finder" ? "Relaunch" : "Force Quit") + "</span></div></div>";
        Array.prototype.forEach.call(w.body.querySelectorAll(".fq-list .r"), function (r) {
            r.addEventListener("click", function () { pick = r.dataset.id; draw(); });
        });
        w.body.querySelector("#fqGo").addEventListener("click", function () {
            if (!pick) return;
            if (pick === "finder") { dtRender(); dockSync(); }
            else quitApp(pick);
            winClose(w);
        });
    };
    draw();
    return w;
}

function openDocument(name) {
    var n = fsWalk(FS).filter(function (f) { return f.name === name; })[0];
    if (n) return openNode(n);
    return openPlaceholder("preview", name, "This document is a prop.");
}

/* what a double-click does, wherever it happens */
function openNode(n) {
    if (!n) return;
    if (n.kind === "folder" || n.kind === "disk") return openFinder(n);
    if (n.kind === "app") {
        if (n.app === "installer") return openPlaceholder("finder", "Install OS X El Capitan",
            "To continue installing, quit every other app. Or don’t — this one is a prop.");
        return launch(n.app);
    }
    if (n.kind === "volume") return openFinder(n);
    if (n.kind === "shot" || /\.(png|jpg|jpeg)$/i.test(n.name)) {
        running.preview = true;
        setActiveApp("preview");
        var w = winCreate({ app: "preview", title: n.name, w: 620, h: 440 });
        w.body.className = "win-body preview-body";
        w.body.innerHTML = '<img src="assets/img/wallpaper.jpg" alt="">';
        dockSync();
        return w;
    }
    /* anything else opens in TextEdit */
    running.textedit = true;
    setActiveApp("textedit");
    var t = winCreate({ app: "textedit", title: n.name, w: 520, h: 380 });
    t.body.innerHTML = '<textarea class="te-body" spellcheck="false"></textarea>';
    t.body.querySelector("textarea").value = docText(n);
    t.body.querySelector("textarea").addEventListener("keydown", function (e) { e.stopPropagation(); });
    dockSync();
    return t;
}

function docText(n) {
    if (/mp3$/.test(n.name)) return "ID3 — you opened an MP3 in a text editor. Bold.";
    if (/beemovie/.test(n.name)) return "According to all known laws of aviation, there is no way a bee should be able to fly.";
    return n.name + "\n\n" + "Nothing here yet.";
}

/* ------------------------------------------------------------------ */
/* POWER                                                               */
/* ------------------------------------------------------------------ */
/* The 11.01.05 / .17 / .20 shots: a 417 x 196 panel with a bare title
   bar, the 112px artwork drawn at 64, and a minute's countdown that goes
   ahead on its own when it runs out.  The checkbox is remembered between
   dialogs, as the real preference is. */
var POWER_TEXT = {
    restart: {
        icon: "Restart", ok: "Restart",
        title: "Are you sure you want to restart your computer now?",
        msg: "If you do nothing, the computer will restart automatically in "
    },
    shutdown: {
        icon: "ShutDown", ok: "Shut Down",
        title: "Are you sure you want to shut down your computer now?",
        msg: "If you do nothing, the computer will shut down automatically in "
    },
    logout: {
        icon: "LogOut", ok: "Log Out",
        title: "Are you sure you want to quit all applications and log out now?",
        msg: "If you do nothing, you will be logged out automatically in "
    }
};

var powerDialog = null;

function confirmPower(kind) {
    if (powerDialog) powerDialog.dismiss();
    var t = POWER_TEXT[kind];
    var w = winCreate({
        app: "finder", title: "", w: 417, h: 196,
        resizable: false, zoomable: false, minimizable: false,
        /* window y is measured below the menu bar; on screen it sits at 148 */
        x: Math.floor((window.innerWidth - 417) / 2),
        y: Math.round((window.innerHeight - 196) * 0.245) - 22
    });
    w.node.classList.add("power-alert");
    w.body.innerHTML =
        '<div class="pw">' +
        '<img class="pw-ico" src="assets/icons/112/' + t.icon + '.png" alt="">' +
        '<div class="pw-t">' + esc(t.title) + "</div>" +
        '<div class="pw-m"></div>' +
        '<label class="pw-cb"><span class="box' + (sys.reopenWindows ? " on" : "") + '"></span>' +
        "Reopen windows when logging back in</label>" +
        '<div class="pw-btns"><span class="btn" id="pwCancel">Cancel</span>' +
        '<span class="btn default" id="pwGo">' + esc(t.ok) + "</span></div></div>";

    var left = 60;
    var msg = w.body.querySelector(".pw-m");
    var paint = function () {
        msg.textContent = t.msg + left + (left === 1 ? " second." : " seconds.");
    };
    var timer = setInterval(function () {
        if (!document.body.contains(w.node)) { dismiss(); return; }
        left--;
        if (left <= 0) { go(); return; }
        paint();
    }, 1000);
    /* capture phase, so Return doesn't also start renaming a desktop icon */
    var keys = function (e) {
        if (!document.body.contains(w.node)) { dismiss(); return; }
        if (e.key === "Enter") { e.stopPropagation(); e.preventDefault(); go(); }
        else if (e.key === "Escape") { e.stopPropagation(); e.preventDefault(); dismiss(); }
    };
    document.addEventListener("keydown", keys, true);
    var dismiss = function () {
        clearInterval(timer);
        document.removeEventListener("keydown", keys, true);
        if (powerDialog === handle) powerDialog = null;
        if (document.body.contains(w.node)) winClose(w);
    };
    var go = function () { dismiss(); powerDown(kind); };
    var handle = { dismiss: dismiss };
    powerDialog = handle;
    paint();

    w.body.querySelector(".pw-cb").addEventListener("click", function () {
        sys.reopenWindows = !sys.reopenWindows;
        this.querySelector(".box").classList.toggle("on", sys.reopenWindows);
    });
    w.body.querySelector("#pwCancel").addEventListener("click", dismiss);
    w.body.querySelector("#pwGo").addEventListener("click", go);
    return w;
}

function powerDown(kind) {
    var v = $("veil");
    v.className = "";
    v.innerHTML = "";
    if (kind === "sleep") {
        v.innerHTML = '<div class="hint">Click anywhere to wake</div>';
        v.classList.add("on", "sleep");
        v.addEventListener("mousedown", function once() {
            v.classList.remove("on", "sleep");
            v.removeEventListener("mousedown", once);
        });
        return;
    }
    v.classList.add("on", "boot");
    v.innerHTML = '<div class="mark">' + ICON.apple + '</div><div class="spinner"></div>';
    if (kind === "restart") {
        setTimeout(function () { location.reload(); }, 2200);
    } else {
        setTimeout(function () {
            v.innerHTML = '<div class="hint">' +
                (kind === "shutdown" ? "Your Mac is off. Reload the page to power it on."
                    : "Logged out. Reload the page to log back in.") + "</div>";
        }, 1800);
    }
}
