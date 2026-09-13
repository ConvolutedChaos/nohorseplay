"use strict";
/* the menu engine: one renderer for pull-downs, submenus, menu-extra
   popups and right-click menus, because on OS X they are the same object */

var menuLayer, menuStack = [], menuOpenId = null, menuOwner = null, menuDef = null;
var subTimer = null;

function menuInit() {
    menuLayer = $("menuLayer");
    menuLayer.addEventListener("mousedown", function (e) {
        if (e.target === menuLayer || e.target.id === "menuShield") menuCloseAll();
    });
}

/* ---------- building ---------- */
function menuRowHTML(it) {
    if (it.sep) return '<div class="sep"></div>';
    if (it.head) return '<div class="head' + (it.right ? " right" : "") + '">' + esc(it.l) + "</div>";
    if (it.tags) {
        return '<div class="tags">' + TAGS.slice(0, 7).map(function (t) {
            return '<i data-tag="' + esc(t.n) + '" style="background:' + t.c + '"></i>';
        }).join("") + "</div>";
    }
    if (it.field) {
        return '<div class="field"><label>' + esc(it.l) + '</label>' +
            '<input type="text" id="' + (it.fieldId || "") + '" value="' + esc(it.value || "") + '"></div>';
    }
    var cls = "row" + (it.d ? " disabled" : "");
    var h = '<div class="' + cls + '">';
    if (it.mark) h += '<span class="mark">' + it.mark + "</span>";
    if (it.ico) h += '<span class="ico">' + it.ico + "</span>";
    h += '<span class="label">' + esc(it.l) + "</span>";
    if (it.k) h += '<span class="key">' + it.k + "</span>";
    if (it.right) h += it.right;
    if (it.sub) h += '<span class="arrow"></span>';
    return h + "</div>";
}

function menuBuild(def, cls) {
    var m = el("div", "menu vibrant-light " + (cls || ""));
    def.forEach(function (it, i) {
        var wrap = el("div");
        wrap.innerHTML = menuRowHTML(it);
        var n = wrap.firstElementChild;
        n._it = it;
        if (n.classList.contains("row")) {
            n.addEventListener("mouseenter", function () { menuHover(m, n, it); });
            n.addEventListener("mouseup", function (e) {
                e.stopPropagation();
                if (it.d || it.sub) return;
                menuCloseAll();
                if (it.act) it.act();
            });
        } else if (n.classList.contains("field")) {
            n.addEventListener("mousedown", function (e) { e.stopPropagation(); });
        } else if (n.classList.contains("tags") && it.on) {
            /* the swatch row tags whatever the menu was opened on */
            Array.prototype.forEach.call(n.querySelectorAll("i"), function (dot) {
                dot.addEventListener("mouseup", function (e) {
                    e.stopPropagation();
                    var name = dot.dataset.tag;
                    it.on.forEach(function (node) {
                        var i = node.tags.indexOf(name);
                        if (i >= 0) node.tags.splice(i, 1); else node.tags.push(name);
                    });
                    menuCloseAll();
                    dtRender();
                    wins.forEach(function (o) { if (o.app === "finder" && o.tabs) fwRenderView(o); });
                });
            });
        }
        m.appendChild(n);
    });
    return m;
}

/* ---------- opening ---------- */
function menuPlace(m, x, y, flipAnchorW) {
    menuLayer.appendChild(m);
    var w = m.offsetWidth, h = m.offsetHeight;
    var vw = window.innerWidth, vh = window.innerHeight;
    if (x + w > vw - 4) x = flipAnchorW != null ? x - w - flipAnchorW : vw - w - 4;
    if (y + h > vh - 4) y = Math.max(4, vh - h - 4);
    m.style.left = Math.max(2, x) + "px";
    m.style.top = y + "px";
}

function menuOpen(def, x, y, opts) {
    opts = opts || {};
    menuCloseAll(true);
    menuDef = def;
    var m = menuBuild(def, (opts.pulldown ? "pulldown " : "") + (opts.cls || ""));
    if (opts.minWidth) m.style.minWidth = opts.minWidth + "px";
    menuPlace(m, x, y);
    menuStack = [m];
    menuLayer.classList.remove("idle");
    return m;
}

function menuOpenSub(parentMenu, row, def) {
    /* trim anything deeper than the menu this row lives in */
    var idx = menuStack.indexOf(parentMenu);
    while (menuStack.length > idx + 1) menuStack.pop().remove();
    var r = row.getBoundingClientRect();
    var m = menuBuild(def, "");
    m.classList.add("vibrant-light");
    menuPlace(m, r.right - 3, r.top - 5, r.width);
    menuStack.push(m);
    return m;
}

function menuHover(m, row, it) {
    /* one highlight per menu, and deeper menus die when the cursor moves */
    Array.prototype.forEach.call(m.querySelectorAll(".row.on"), function (r) {
        r.classList.remove("on");
    });
    if (!it.d) row.classList.add("on");
    clearTimeout(subTimer);
    var idx = menuStack.indexOf(m);
    if (!it.sub) {
        subTimer = setTimeout(function () {
            while (menuStack.length > idx + 1) menuStack.pop().remove();
        }, 180);
        return;
    }
    if (row._open) return;
    subTimer = setTimeout(function () {
        Array.prototype.forEach.call(m.querySelectorAll(".row"), function (r) { r._open = false; });
        row._open = true;
        menuOpenSub(m, row, typeof it.sub === "function" ? it.sub() : it.sub);
    }, 120);
}

function menuCloseAll(keepLayer) {
    clearTimeout(subTimer);
    while (menuStack.length) menuStack.pop().remove();
    menuDef = null;
    if (!keepLayer) {
        menuLayer.classList.add("idle");
        if (menuOwner) menuOwner.classList.remove("open");
        menuOwner = null;
        menuOpenId = null;
        barTracking = false;
    }
}

/* rebuild the open menu in place -- used when a popup toggles its own
   state, such as the battery's Show Percentage */
function menuRefresh() {
    if (!menuOpenId || !menuOwner || !menuStack.length) return;
    var id = menuOpenId, owner = menuOwner;
    menuCloseAll();
    if (typeof extraOpen === "function" && owner.classList.contains("extra")) extraOpen(id, owner);
    else if (typeof barOpen === "function") barOpen(id, owner);
}

/* ---------- context menus ---------- */
function contextMenu(e, def) {
    if (e.preventDefault) e.preventDefault();
    menuCloseAll();
    menuOpen(def, e.clientX, e.clientY, { cls: "context" });
    menuOpenId = "context";
}

/* a Dock menu sits above the icon with a pointer aimed at it */
function dockMenu(item, def) {
    menuCloseAll();
    var r = item.getBoundingClientRect();
    var m = menuBuild(def, "vibrant-light dock-menu");
    menuLayer.appendChild(m);
    var w = m.offsetWidth, h = m.offsetHeight;
    m.style.left = clamp(r.left + r.width / 2 - w / 2, 4, window.innerWidth - w - 4) + "px";
    m.style.top = (r.top - h - 12) + "px";
    var tip = el("div", "point");
    tip.style.left = (r.left + r.width / 2 - m.offsetLeft - 8) + "px";
    m.appendChild(tip);
    menuStack = [m];
    menuLayer.classList.remove("idle");
    menuOpenId = "context";
    return m;
}

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuStack.length) { menuCloseAll(); e.preventDefault(); }
});
