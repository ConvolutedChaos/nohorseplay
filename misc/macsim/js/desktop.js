"use strict";
/* the desktop: icon layout, selection, dragging, the rubber band, and the
   file commands the menus call into */

var dtItems = [], dtSort = null, dtSnap = false, dtUndoStack = [];
/* measured off the reference desktop: 122 x 112 cells, the right-hand
   column centred 65px from the screen edge, the top row's art at y 31 */
var CELL_W = 122, CELL_H = 112, CELL_RIGHT = 4, CELL_TOP = 9;

function dtEl() { return $("desktop"); }

/* icons fill the right-hand edge first, top to bottom, then step left --
   the same order the reference desktop fills up in */
function dtSlot(i) {
    var h = dtEl().clientHeight || 778;
    var rows = Math.max(1, Math.floor((h - CELL_TOP) / CELL_H));
    var col = Math.floor(i / rows), row = i % rows;
    return {
        x: (dtEl().clientWidth || 1280) - CELL_RIGHT - (col + 1) * CELL_W,
        y: CELL_TOP + row * CELL_H
    };
}

/* the desktop shows the mounted volumes after the files it contains */
function dtNodes() { return DESKTOP.children.concat([FS]); }

function dtBuild() {
    dtItems = dtNodes().map(function (n, i) {
        var p = dtSlot(i);
        return { node: n, x: p.x, y: p.y, sel: false };
    });
    dtRender();
}

function dtRender() {
    /* keep the position of anything already on screen, place the rest */
    var known = {};
    dtItems.forEach(function (it) { known[it.node.id] = it; });
    dtItems = dtNodes().map(function (n, i) {
        if (known[n.id]) return known[n.id];
        var p = dtSlot(i);
        return { node: n, x: p.x, y: p.y, sel: false };
    });

    var d = dtEl();
    Array.prototype.forEach.call(d.querySelectorAll(".dicon"), function (n) { n.remove(); });

    dtItems.forEach(function (it) {
        var n = el("div", "dicon" + (it.sel ? " sel" : ""));
        n.style.left = it.x + "px";
        n.style.top = it.y + "px";
        n.innerHTML = '<div class="art">' + fileArtHTML(it.node, 64) + "</div>" +
            '<div class="name" title="' + esc(it.node.name) + '">' +
            esc(truncMid(it.node.name)) + "</div>";
        it.el = n;
        n.addEventListener("mousedown", function (e) { dtItemDown(e, it); });
        n.addEventListener("dblclick", function () { openNode(it.node); });
        n.addEventListener("contextmenu", function (e) {
            e.stopPropagation();
            if (!it.sel) { dtSelectOnly(it); }
            contextMenu(e, dtItemMenu(it));
        });
        d.appendChild(n);
    });
}

function dtSelection() { return dtItems.filter(function (i) { return i.sel; }); }

function dtSelectOnly(it) {
    dtItems.forEach(function (o) { o.sel = o === it; });
    dtPaint();
}

function dtSelectAll() {
    dtItems.forEach(function (o) { o.sel = true; });
    dtPaint();
}

function dtClearSelection() {
    dtItems.forEach(function (o) { o.sel = false; });
    dtPaint();
}

function dtPaint() {
    dtItems.forEach(function (it) {
        if (it.el) it.el.classList.toggle("sel", it.sel);
    });
}

/* the desktop's selection greys out while a window is frontmost */
function dtBlur(on) {
    var d = dtEl();
    if (d) d.classList.toggle("blur", !!on);
}

/* ---------- dragging ---------- */
function dtItemDown(e, it) {
    e.stopPropagation();
    menuCloseAll();
    dtBlur(false);
    wins.forEach(function (w) { w.node.classList.add("inactive"); });
    if (e.button === 2) return;
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
        it.sel = !it.sel;
        dtPaint();
        return;
    }
    if (!it.sel) dtSelectOnly(it);

    var moving = dtSelection();
    var sx = e.clientX, sy = e.clientY, moved = false;
    var start = moving.map(function (m) { return { it: m, x: m.x, y: m.y }; });

    var move = function (ev) {
        var dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved && Math.abs(dx) + Math.abs(dy) < 3) return;
        moved = true;
        start.forEach(function (s) {
            s.it.x = s.x + dx;
            s.it.y = Math.max(0, s.y + dy);
            s.it.el.style.left = s.it.x + "px";
            s.it.el.style.top = s.it.y + "px";
            s.it.el.classList.add("dragging");
            s.it.placed = true;
        });
        dockDragOver(ev);
    };
    var up = function (ev) {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
        moving.forEach(function (m) { m.el.classList.remove("dragging"); });
        if (!moved) return;
        if (dockDropped(ev)) { trashSelection(); return; }
        if (dtSnap) {
            moving.forEach(function (m) {
                m.x = Math.round((m.x - CELL_RIGHT) / CELL_W) * CELL_W + CELL_RIGHT;
                m.y = Math.round((m.y - CELL_TOP) / CELL_H) * CELL_H + CELL_TOP;
                m.el.style.left = m.x + "px";
                m.el.style.top = m.y + "px";
            });
        }
        dtUndoStack.push({ kind: "move", from: start.map(function (s) { return { it: s.it, x: s.x, y: s.y }; }) });
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
}

/* ---------- rubber band ---------- */
function dtInit() {
    var d = dtEl();
    d.addEventListener("mousedown", function (e) {
        if (e.target !== d) return;
        menuCloseAll();
        if (!e.shiftKey) dtClearSelection();
        setActiveApp("finder");
        dtBlur(false);
        wins.forEach(function (w) { w.node.classList.add("inactive"); });

        var band = el("div");
        band.id = "marquee";
        d.appendChild(band);
        var host = d.getBoundingClientRect();
        var sx = e.clientX - host.left, sy = e.clientY - host.top;
        var base = dtItems.map(function (i) { return i.sel; });

        var move = function (ev) {
            var x = ev.clientX - host.left, y = ev.clientY - host.top;
            var l = Math.min(sx, x), t = Math.min(sy, y);
            var w = Math.abs(x - sx), h = Math.abs(y - sy);
            band.style.cssText = "left:" + l + "px;top:" + t + "px;width:" + w + "px;height:" + h + "px";
            dtItems.forEach(function (it, i) {
                var hit = !(it.x > l + w || it.x + CELL_W < l || it.y > t + h || it.y + 90 < t);
                it.sel = ev.shiftKey ? (base[i] || hit) : hit;
            });
            dtPaint();
        };
        var up = function () {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
            band.remove();
        };
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
    });

    d.addEventListener("contextmenu", function (e) {
        if (e.target !== d) return;
        contextMenu(e, dtBackgroundMenu());
    });

    window.addEventListener("resize", function () {
        /* icons that still sit in their slot follow the right-hand edge */
        dtItems.forEach(function (it, i) {
            if (it.placed) return;
            var p = dtSlot(i);
            it.x = p.x; it.y = p.y;
            if (it.el) { it.el.style.left = it.x + "px"; it.el.style.top = it.y + "px"; }
        });
    });
}

/* ---------- menus ---------- */
function dtSortMenu(withKeys) {
    var row = function (l, k, key) {
        return {
            l: l, k: withKeys === false ? "" : k,
            mark: dtSort === key ? "✓" : "", act: function () { dtSortBy(key); }
        };
    };
    return [
        row("None", kk(K.ctrl, K.opt, K.cmd, "0"), null),
        { sep: 1 },
        { l: "Snap to Grid", mark: dtSnap ? "✓" : "", act: function () { dtSnap = !dtSnap; } },
        { sep: 1 },
        row("Name", kk(K.ctrl, K.opt, K.cmd, "1"), "name"),
        row("Kind", kk(K.ctrl, K.opt, K.cmd, "2"), "kind"),
        row("Date Last Opened", kk(K.ctrl, K.opt, K.cmd, "3"), "opened"),
        row("Date Added", kk(K.ctrl, K.opt, K.cmd, "4"), "added"),
        row("Date Modified", kk(K.ctrl, K.opt, K.cmd, "5"), "modified"),
        row("Date Created", "", "created"),
        row("Size", kk(K.ctrl, K.opt, K.cmd, "6"), "size"),
        row("Tags", kk(K.ctrl, K.opt, K.cmd, "7"), "tags")
    ];
}

/* The order the 11.59.37 shot lists, and Paste is simply absent when the
   clipboard is empty rather than greyed. */
function dtBackgroundMenu() {
    var m = [
        { l: "New Folder", act: newFolderHere },
        { sep: 1 },
        { l: "Get Info", act: function () { getInfoNode(DESKTOP); } },
        { sep: 1 }
    ];
    if (clipboard.length) {
        m.push({ l: "Paste Item" + (clipboard.length > 1 ? "s" : ""), act: pasteClipboard });
        m.push({ sep: 1 });
    }
    m.push({ l: "Change Desktop Background…", act: function () { launch("system-preferences"); } });
    m.push({ l: "Clean Up", act: function () { dtCleanUp(); } });
    m.push({ l: "Clean Up By", sub: dtCleanUpMenu });
    m.push({ l: "Sort By", sub: function () { return dtSortMenu(false); } });
    m.push({ l: "Show View Options", act: function () { openPlaceholder("finder", "View Options"); } });
    return m;
}

/* Clean Up By carries no shortcuts in a context menu */
function dtCleanUpMenu() {
    var row = function (l, k) { return { l: l, act: function () { dtCleanUp(k); } }; };
    return [row("Name", "name"), row("Kind", "kind"), row("Date Modified", "modified"),
        row("Date Created", "created"), row("Size", "size"), row("Tags", "tags")];
}

function dtItemMenu(it) {
    var n = dtSelection().length;
    return [
        { l: n > 1 ? "Open " + n + " Items" : "Open", act: openSelection },
        { l: "Open With", sub: [{ l: "Preview", act: openSelection }, { l: "Other…", d: 1 }] },
        { sep: 1 },
        { l: "Move to Trash", act: trashSelection },
        { l: "Get Info", act: getInfo },
        { l: "Rename", d: n !== 1, act: renameSelection },
        { l: "Compress " + (n > 1 ? n + " Items" : "“" + short(it.node.name) + "”") },
        { l: "Duplicate", act: duplicateSelection },
        { l: "Make Alias" },
        { l: "Quick Look “" + short(it.node.name) + "”", act: openSelection },
        { sep: 1 },
        { l: "Copy " + (n > 1 ? n + " Items" : "“" + short(it.node.name) + "”"), act: copySelection },
        { sep: 1 },
        { l: "Tags…" }
    ];
}

function short(s) { return s.length > 22 ? s.slice(0, 21) + "…" : s; }

/* ---------- commands ---------- */
function openSelection() {
    dtSelection().forEach(function (it) { openNode(it.node); });
    var w = frontWindow();
    if (!dtSelection().length && w && w.app === "finder") fwSelection(w).slice().forEach(openNode);
}

function newFolderHere() {
    var w = frontWindow();
    if (w && w.app === "finder" && curTab(w).loc !== DESKTOP) { fwNewFolder(w); return; }
    var f = folder(uniqueName(DESKTOP, "untitled folder"), []);
    f.parent = DESKTOP;
    DESKTOP.children.push(f);
    dtRender();
    var it = dtItems.filter(function (i) { return i.node === f; })[0];
    dtSelectOnly(it);
    dtBeginRename(it);
}

function renameSelection() {
    var w = frontWindow();
    if (w && w.app === "finder" && fwSelection(w).length === 1) {
        fwBeginRename(w, fwSelection(w)[0]);
        return;
    }
    var s = dtSelection();
    if (s.length === 1) dtBeginRename(s[0]);
}

/* One editor for both the desktop and a Finder window: a white box with
   the focus ring that shows the whole name, wrapping as far as it needs
   (12.00.03 and 12.00.22).  Committing onto a taken name is refused. */
function beginRename(host, node, dir, done) {
    var label = host.querySelector(".name");
    if (!label) return;
    var box = el("div", "rename-box");
    box.contentEditable = "true";
    box.spellcheck = false;
    box.textContent = node.name;
    label.replaceWith(box);
    box.focus();
    document.getSelection().selectAllChildren(box);

    var closed = false;
    var finish = function (save) {
        if (closed) return;
        var v = (box.textContent || "").replace(/\s+/g, " ").trim();
        if (save && v && v !== node.name && dir && nameTaken(dir, v, node)) {
            openNameTakenAlert(v);
            box.focus();
            document.getSelection().selectAllChildren(box);
            return;
        }
        closed = true;
        if (save && v) node.name = v;
        done();
    };
    box.addEventListener("keydown", function (e) {
        e.stopPropagation();
        if (e.key === "Enter") { e.preventDefault(); finish(true); }
        if (e.key === "Escape") { e.preventDefault(); finish(false); }
    });
    box.addEventListener("blur", function () { finish(true); });
    box.addEventListener("mousedown", function (e) { e.stopPropagation(); });
    return box;
}

function dtBeginRename(it) {
    beginRename(it.el, it.node, DESKTOP, function () {
        dtRender();
        wins.forEach(function (w) { if (w.app === "finder" && w.tabs) fwRenderView(w); });
    });
}

function duplicateSelection() {
    var s = dtSelection();
    if (!s.length) {
        var w = frontWindow();
        if (w && w.app === "finder") {
            var dir = curTab(w).loc;
            fwSelection(w).forEach(function (n) {
                var c = node(n.name + " copy", n.kind, { bytes: n.bytes, ext: n.ext });
                c.parent = dir;
                if (dir.children) dir.children.push(c);
            });
            fwRenderView(w);
        }
        return;
    }
    s.forEach(function (it) {
        var c = node(it.node.name + " copy", it.node.kind, { bytes: it.node.bytes, ext: it.node.ext });
        c.parent = DESKTOP;
        DESKTOP.children.push(c);
    });
    dtRender();
}

function trashSelection() {
    var gone = [];
    dtSelection().forEach(function (it) {
        if (it.node.kind === "volume") return;
        var i = DESKTOP.children.indexOf(it.node);
        if (i >= 0) { DESKTOP.children.splice(i, 1); gone.push({ n: it.node, from: DESKTOP }); }
    });
    var w = frontWindow();
    if (w && w.app === "finder" && fwSelection(w).length) {
        var dir = curTab(w).loc;
        fwSelection(w).forEach(function (n) {
            var from = n.parent || dir;
            var i = from.children ? from.children.indexOf(n) : -1;
            if (i >= 0) { from.children.splice(i, 1); gone.push({ n: n, from: from }); }
        });
        curTab(w).sel = [];
        fwRenderView(w);
    }
    if (!gone.length) return;
    gone.forEach(function (g) {
        g.n.putBack = g.from;          /* where Put Back will return it to */
        g.n.parent = TRASH;
        TRASH.children.push(g.n);
    });
    dtUndoStack.push({ kind: "trash", gone: gone });
    dtRender();
    dockSync();
    blip(880, 140, "square");
}

function emptyTrash() {
    var n = TRASH.children.length;
    if (!n) return;
    openAlert("Are you sure you want to permanently erase the items in the Trash?",
        "You can’t undo this action.",
        function () {
            TRASH.children = [];
            dockSync();
            wins.forEach(function (w) { if (w.app === "finder" && w.tabs) fwRenderView(w); });
            blip(320, 260, "sawtooth");
        }, { ok: "Empty Trash" });
}

function getInfo() {
    var s = dtSelection();
    if (s.length) { s.forEach(function (it) { getInfoNode(it.node); }); return; }
    var w = frontWindow();
    if (w && w.app === "finder") fwSelection(w).forEach(getInfoNode);
}

/* ---------- tidying ---------- */
function dtCleanUp(by) {
    if (by) dtSortKey(by);
    dtItems.forEach(function (it, i) {
        var p = dtSlot(i);
        it.x = p.x; it.y = p.y; it.placed = false;
        if (it.el) { it.el.style.left = it.x + "px"; it.el.style.top = it.y + "px"; }
    });
}

function dtSortKey(by) {
    var cmp = {
        name: function (a, b) { return a.name.localeCompare(b.name); },
        kind: function (a, b) { return kindLabel(a).localeCompare(kindLabel(b)); },
        size: function (a, b) { return (b.bytes || 0) - (a.bytes || 0); },
        modified: function (a, b) { return b.modified - a.modified; }
    }[by];
    if (!cmp) return;
    DESKTOP.children.sort(cmp);
    dtItems.sort(function (a, b) { return cmp(a.node, b.node); });
}

function dtSortBy(key) {
    dtSort = key;
    if (!key) return;
    dtSortKey(key === "opened" || key === "added" || key === "created" ? "modified"
        : key === "tags" ? "name" : key);
    dtCleanUp();
    dtRender();
}

/* ---------- undo ---------- */
function dtCanUndo() { return dtUndoStack.length > 0; }

function dtUndoLabel() {
    var u = dtUndoStack[dtUndoStack.length - 1];
    if (!u) return "Undo";
    if (u.kind === "move") return "Undo Move of " + u.from.length + " Item" + (u.from.length === 1 ? "" : "s");
    return "Undo Move of " + u.gone.length + " Item" + (u.gone.length === 1 ? "" : "s");
}

function dtUndo() {
    var u = dtUndoStack.pop();
    if (!u) return;
    if (u.kind === "move") {
        u.from.forEach(function (s) {
            s.it.x = s.x; s.it.y = s.y;
            if (s.it.el) { s.it.el.style.left = s.x + "px"; s.it.el.style.top = s.y + "px"; }
        });
    } else {
        u.gone.forEach(function (g) {
            g.from.children.push(g.n);
            var i = TRASH.children.indexOf(g.n);
            if (i >= 0) TRASH.children.splice(i, 1);
        });
        dtRender();
        wins.forEach(function (w) { if (w.app === "finder" && w.tabs) fwRenderView(w); });
        dockSync();
    }
}
