"use strict";
/* Finder windows: toolbar, tabs, sidebar, and the four views.

   A window owns a list of tabs; a tab owns its location, its view mode, its
   selection and its history.  Everything the toolbar and the View menu do
   goes through the current tab, which is what lets two tabs in the same
   window sit in different folders in different views, as they do on the
   real thing. */

/* ------------------------------------------------------------------ */
/* SIDEBAR                                                             */
/* ------------------------------------------------------------------ */
var TAGS = [
    { n: "Red", c: "#fc5b57" }, { n: "Orange", c: "#f6a623" },
    { n: "Yellow", c: "#fcd12f" }, { n: "Green", c: "#63d34a" },
    { n: "Blue", c: "#4b9bf8" }, { n: "Purple", c: "#c56bf0" },
    { n: "Gray", c: "#b4b4b4" }, { n: "Home", c: "" }, { n: "Important", c: "" },
    { n: "Work", c: "" }
];

/* the three sidebar rows that are not folders */
var PLACES = {
    airdrop: { name: "AirDrop" },
    allmyfiles: { name: "All My Files" },
    icloud: { name: "iCloud Drive" }
};

/* The sidebar draws El Capitan's own template icons -- the Sidebar* set,
   which only exists up to 64px because that is as large as it is ever
   needed.  sideIconHTML masks them so they pick up the vibrancy. */
var SIDE_ICON = {
    airdrop: "SidebarAirDrop",
    allmyfiles: "SidebarAllMyFiles",
    icloud: "SidebariCloud",
    applications: "SidebarApplicationsFolder",
    desktop: "SidebarDesktopFolder",
    documents: "SidebarDocumentsFolder",
    downloads: "SidebarDownloadsFolder",
    movies: "SidebarMoviesFolder",
    music: "SidebarMusicFolder",
    pictures: "SidebarPicturesFolder",
    utilities: "SidebarUtilitiesFolder",
    folder: "SidebarGenericFolder",
    home: "SidebarHomeFolder",
    disk: "SidebarInternalDisk",
    external: "SidebarExternalDisk",
    network: "SidebarNetwork",
    smart: "SidebarSmartFolder",
    recents: "SidebarRecents",
    timemachine: "SidebarTimeMachine",
    file: "SidebarGenericFile"
};

/* the colour icons the Go menu and the title bar want instead */
var PLACE_ICON = {
    airdrop: "AirDrop",
    allmyfiles: "AllMyFiles",
    icloud: "iDiskGenericIcon"
};

function sidebarModel() {
    return [
        { g: "Favorites" },
        { l: "AirDrop", ico: "airdrop", place: "airdrop" },
        { l: "All My Files", ico: "allmyfiles", place: "allmyfiles" },
        { l: "iCloud Drive", ico: "icloud", place: "icloud" },
        { l: "Applications", ico: "applications", dir: fsFind("Applications") },
        { l: "Desktop", ico: "desktop", dir: DESKTOP },
        { l: "Documents", ico: "documents", dir: fsFind("Users/timmytoenails/Documents") },
        { l: "Downloads", ico: "downloads", dir: fsFind("Users/timmytoenails/Downloads") },
        { l: "CoreServices", ico: "folder", dir: CORESERVICES },
        { g: "Devices" },
        { l: "Macintosh HD", ico: "disk", dir: FS },
        { g: "Tags" }
    ].concat(TAGS.slice(0, 7).map(function (t) {
        return { l: t.n, tag: t };
    })).concat([{ l: "All Tags…", tag: { n: "All Tags…", c: "" }, allTags: true }]);
}

/* ------------------------------------------------------------------ */
/* TOOLBAR GLYPHS                                                      */
/* ------------------------------------------------------------------ */
var TB = {
    back: '<svg viewBox="0 0 15 15"><path d="M9.4 2.4 4.4 7.5l5 5.1" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    fwd: '<svg viewBox="0 0 15 15"><path d="M5.6 2.4l5 5.1-5 5.1" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    icons: '<svg viewBox="0 0 15 15"><rect x="2" y="2" width="4.4" height="4.4" rx=".8"/><rect x="8.6" y="2" width="4.4" height="4.4" rx=".8"/>' +
        '<rect x="2" y="8.6" width="4.4" height="4.4" rx=".8"/><rect x="8.6" y="8.6" width="4.4" height="4.4" rx=".8"/></svg>',
    list: '<svg viewBox="0 0 15 15"><rect x="2" y="3" width="11" height="1.7"/><rect x="2" y="6.6" width="11" height="1.7"/>' +
        '<rect x="2" y="10.2" width="11" height="1.7"/></svg>',
    cols: '<svg viewBox="0 0 15 15"><rect x="1.6" y="2.4" width="11.8" height="10.2" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
        '<path d="M5.6 2.4v10.2M9.4 2.4v10.2" stroke="currentColor" stroke-width="1.2"/></svg>',
    flow: '<svg viewBox="0 0 15 15"><rect x="1.4" y="3.4" width="2.4" height="8.2" rx=".6"/><rect x="4.8" y="2" width="5.4" height="11" rx=".8" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
        '<rect x="11.2" y="3.4" width="2.4" height="8.2" rx=".6"/></svg>',
    arrange: '<svg viewBox="0 0 15 15"><g><rect x="1.6" y="3" width="3" height="3" rx=".6"/><rect x="6" y="3" width="3" height="3" rx=".6"/>' +
        '<rect x="10.4" y="3" width="3" height="3" rx=".6"/><rect x="1.6" y="8" width="3" height="3" rx=".6"/>' +
        '<rect x="6" y="8" width="3" height="3" rx=".6"/><rect x="10.4" y="8" width="3" height="3" rx=".6"/></g></svg>',
    gear: '<svg viewBox="0 0 15 15"><path d="M7.5 1.6l1 1.6 1.9-.4.3 1.9 1.8.7-.9 1.7.9 1.7-1.8.7-.3 1.9-1.9-.4-1 1.6-1-1.6-1.9.4-.3-1.9-1.8-.7.9-1.7-.9-1.7 1.8-.7.3-1.9 1.9.4z"/>' +
        '<circle cx="7.5" cy="7.5" r="2.1" fill="#e9e7e9"/></svg>',
    share: '<svg viewBox="0 0 15 15"><path d="M7.5 1.4v8.2M4.6 4.2 7.5 1.3l2.9 2.9" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
        '<path d="M3 7.6v6h9v-6" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    tags: '<svg viewBox="0 0 15 15"><rect x="1.4" y="4.6" width="12.2" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
    search: '<svg viewBox="0 0 13 13"><circle cx="5.4" cy="5.4" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
        '<path d="M8.6 8.6 12 12" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 7 5"><path d="M0 .8h7L3.5 4.8z" fill="rgba(0,0,0,.55)"/></svg>'
};

/* ------------------------------------------------------------------ */
/* OPENING                                                             */
/* ------------------------------------------------------------------ */
function newTab(loc) {
    return {
        loc: loc || DESKTOP,          /* a node, or a {place} / {tag} marker */
        view: "icons",
        sel: [],
        back: [], fwd: [],
        query: ""
    };
}

function openFinder(loc) {
    running.finder = true;
    setActiveApp("finder");
    var w = winCreate({ app: "finder", title: locName(loc || DESKTOP), w: 770, h: 486, unified: true });
    w.tabs = [newTab(loc)];
    w.tab = 0;
    w.status = false;                  /* the reference has the status bar off */
    w.body.className = "win-body";
    w.body.style.cssText = "display:flex;flex-direction:column;padding:0;overflow:hidden";
    w.body.innerHTML =
        '<div class="fw-toolbar"></div>' +
        '<div class="fw-tabs hidden"></div>' +
        '<div class="fw-main"><div class="fw-side"></div><div class="fw-view"></div></div>' +
        '<div class="fw-status hidden"></div>';
    w.toolbarEl = w.body.querySelector(".fw-toolbar");
    w.tabsEl = w.body.querySelector(".fw-tabs");
    w.sideEl = w.body.querySelector(".fw-side");
    w.viewEl = w.body.querySelector(".fw-view");
    w.statusEl = w.body.querySelector(".fw-status");
    fwRenderAll(w);
    dockSync();
    return w;
}

function curTab(w) { return w && w.tabs ? w.tabs[w.tab] : null; }

function locName(loc) {
    if (!loc) return "Finder";
    if (loc.place) return PLACES[loc.place].name;
    if (loc.tag) return loc.tag.n;
    return loc.name;
}

function locChildren(t) {
    var loc = t.loc;
    if (loc.place === "allmyfiles") return allMyFiles();
    if (loc.place) return [];
    if (loc.tag) {
        return fsWalk(FS).filter(function (n) {
            return n.tags && n.tags.indexOf(loc.tag.n) >= 0;
        });
    }
    return loc.children || [];
}

/* ------------------------------------------------------------------ */
/* RENDER                                                              */
/* ------------------------------------------------------------------ */
function fwRenderAll(w) {
    fwRenderToolbar(w);
    fwRenderTabs(w);
    fwRenderSidebar(w);
    fwRenderView(w);
    winSetTitle(w, locName(curTab(w).loc), fwTitleIcon(w));
}

function fwTitleIcon(w) {
    var loc = curTab(w).loc;
    if (loc.tag) return '<span class="tag-dot" style="display:inline-block;width:11px;height:11px;' +
        'border-radius:50%;background:' + (loc.tag.c || "transparent") +
        ';box-shadow:inset 0 0 0 1px rgba(0,0,0,.25)"></span>';
    if (loc.place) return sysIcon(PLACE_ICON[loc.place] || "GenericFolderIcon", 16);
    return fileArtHTML(loc, 16);
}

function fwRenderToolbar(w) {
    var t = curTab(w);
    var seg = function (v, g, tip) {
        return '<div class="tb-btn' + (t.view === v ? " on" : "") + '" data-v="' + v +
            '" data-tip="' + esc(tip) + '">' + g + "</div>";
    };
    w.toolbarEl.innerHTML =
        '<div class="tb-group">' +
        '<div class="tb-btn back' + (t.back.length ? "" : " dim") + '" data-tip="Go back">' + TB.back + "</div>" +
        '<div class="tb-btn fwd' + (t.fwd.length ? "" : " dim") + '" data-tip="Go forward">' + TB.fwd + "</div></div>" +
        '<div class="tb-group">' +
        seg("icons", TB.icons, "Show items as icons, in a list, in columns, or with Cover Flow") +
        seg("list", TB.list, "Show items as icons, in a list, in columns, or with Cover Flow") +
        seg("cols", TB.cols, "Show items as icons, in a list, in columns, or with Cover Flow") +
        seg("flow", TB.flow, "Show items as icons, in a list, in columns, or with Cover Flow") +
        "</div>" +
        '<div class="tb-group"><div class="tb-btn arrange" data-tip="Arrange items by name, kind and more">' +
        TB.arrange + TB.chev + "</div></div>" +
        '<div class="tb-group"><div class="tb-btn action" data-tip="Perform tasks with the selected items">' +
        TB.gear + TB.chev + "</div></div>" +
        '<div class="tb-group"><div class="tb-btn share' + (t.sel.length ? "" : " dim") +
        '" data-tip="Share the selected items">' + TB.share + "</div></div>" +
        '<div class="tb-group"><div class="tb-btn tagbtn' + (t.sel.length ? "" : " dim") +
        '" data-tip="Edit the tags of the selected items">' + TB.tags + "</div></div>" +
        '<div class="tb-search">' + TB.search +
        '<input placeholder="Search" spellcheck="false" value="' + esc(t.query) + '">' +
        (t.query ? '<span class="clear">×</span>' : "") + "</div>";
    fwWireToolbar(w);
}

function fwWireToolbar(w) {
    var t = curTab(w);
    var q = function (s) { return w.toolbarEl.querySelector(s); };

    q(".back").addEventListener("click", function () { fwBack(w); });
    q(".fwd").addEventListener("click", function () { fwForward(w); });
    Array.prototype.forEach.call(w.toolbarEl.querySelectorAll("[data-v]"), function (b) {
        b.addEventListener("click", function () { fwSetView(w, b.dataset.v); });
    });
    q(".arrange").addEventListener("mousedown", function (e) {
        e.stopPropagation();
        fwPopup(w, this, arrangeMenu(w));
    });
    q(".action").addEventListener("mousedown", function (e) {
        e.stopPropagation();
        fwPopup(w, this, fwActionMenu(w));
    });
    q(".share").addEventListener("mousedown", function (e) {
        e.stopPropagation();
        if (!t.sel.length) return;
        fwPopup(w, this, shareMenu(w));
    });
    q(".tagbtn").addEventListener("mousedown", function (e) {
        e.stopPropagation();
        if (!t.sel.length) return;
        openTagPopover(w, this);
    });

    /* the toolbar's help tags */
    Array.prototype.forEach.call(w.toolbarEl.querySelectorAll("[data-tip]"), function (b) {
        var timer;
        b.addEventListener("mouseenter", function () {
            timer = setTimeout(function () { fwShowTip(w, b); }, 900);
        });
        b.addEventListener("mouseleave", function () {
            clearTimeout(timer);
            fwHideTip(w);
        });
        b.addEventListener("mousedown", function () { clearTimeout(timer); fwHideTip(w); });
    });

    var field = w.toolbarEl.querySelector(".tb-search");
    var input = field.querySelector("input");
    input.addEventListener("focus", function () { field.classList.add("focus"); });
    input.addEventListener("blur", function () { field.classList.remove("focus"); });
    input.addEventListener("keydown", function (e) {
        e.stopPropagation();
        if (e.key === "Escape") { input.value = ""; fwSearch(w, ""); }
    });
    input.addEventListener("input", function () { fwSearch(w, input.value); });
    var clear = field.querySelector(".clear");
    if (clear) clear.addEventListener("mousedown", function (e) {
        e.stopPropagation();
        fwSearch(w, "");
    });
}

function fwShowTip(w, b) {
    fwHideTip(w);
    var r = b.getBoundingClientRect(), host = w.node.getBoundingClientRect();
    var tip = el("div", "tb-tip", esc(b.dataset.tip));
    w.node.appendChild(tip);
    tip.style.left = Math.max(4, r.left - host.left) + "px";
    tip.style.top = (r.bottom - host.top + 4) + "px";
    w._tip = tip;
}

function fwHideTip(w) {
    if (w._tip) { w._tip.remove(); w._tip = null; }
}

function fwPopup(w, btn, def) {
    var r = btn.getBoundingClientRect();
    menuOpen(def, r.left - 20, r.bottom + 2, { cls: "context" });
    menuOpenId = "context";
}

/* ---------- tabs ---------- */
function fwRenderTabs(w) {
    var many = w.tabs.length > 1;
    w.tabsEl.classList.toggle("hidden", !many);
    if (!many) return;
    w.tabsEl.innerHTML = w.tabs.map(function (t, i) {
        return '<div class="fw-tab' + (i === w.tab ? " on" : "") + '" data-i="' + i + '">' +
            '<span class="x">×</span><span class="nm">' + esc(locName(t.loc)) + "</span></div>";
    }).join("") + '<div class="fw-tabadd">+</div>';
    Array.prototype.forEach.call(w.tabsEl.querySelectorAll(".fw-tab"), function (n) {
        n.addEventListener("mousedown", function (e) {
            if (e.target.classList.contains("x")) return;
            w.tab = +n.dataset.i;
            fwRenderAll(w);
        });
        n.querySelector(".x").addEventListener("mousedown", function (e) {
            e.stopPropagation();
            fwCloseTab(w, +n.dataset.i);
        });
    });
    w.tabsEl.querySelector(".fw-tabadd").addEventListener("mousedown", function (e) {
        e.stopPropagation();
        fwNewTab(w);
    });
}

function fwNewTab(w, loc) {
    w.tabs.push(newTab(loc || HOME));
    w.tab = w.tabs.length - 1;
    fwRenderAll(w);
}

function fwCloseTab(w, i) {
    if (w.tabs.length === 1) { winClose(w); return; }
    w.tabs.splice(i, 1);
    w.tab = clamp(w.tab, 0, w.tabs.length - 1);
    fwRenderAll(w);
}

/* ---------- sidebar ---------- */
function fwRenderSidebar(w) {
    var t = curTab(w);
    var model = sidebarModel();
    w.sideEl.innerHTML = model.map(function (s, i) {
        if (s.g) return '<div class="group">' + esc(s.g) + "</div>";
        var on = (s.dir && s.dir === t.loc) ||
            (s.place && t.loc.place === s.place) ||
            (s.tag && t.loc.tag && t.loc.tag.n === s.tag.n);
        var art = s.tag
            ? '<span class="tag" style="background:' + (s.tag.c || "transparent") + '"></span>'
            : sideIconHTML(SIDE_ICON[s.ico] || SIDE_ICON.folder, 16);
        return '<div class="item' + (on ? " on" : "") + '" data-i="' + i + '">' + art +
            '<span class="nm">' + esc(s.l) + "</span></div>";
    }).join("");
    Array.prototype.forEach.call(w.sideEl.querySelectorAll(".item"), function (n) {
        var s = model[+n.dataset.i];
        n.addEventListener("mousedown", function (e) {
            e.stopPropagation();
            winFocus(w);
            fwGo(w, s.dir ? s.dir : s.place ? { place: s.place } : { tag: s.tag });
        });
        n.addEventListener("contextmenu", function (e) {
            e.stopPropagation();
            contextMenu(e, [
                { l: "Open in New Tab", act: function () { fwNewTab(w, s.dir || (s.place ? { place: s.place } : { tag: s.tag })); } },
                { sep: 1 },
                { l: "Remove from Sidebar", d: 1 }
            ]);
        });
    });
}

/* ---------- the view ---------- */
function fwRenderView(w) {
    var t = curTab(w);
    fwHideTip(w);
    w.viewEl.innerHTML = "";

    if (t.loc === TRASH) fwTrashBar(w);
    if (t.query) { fwRenderSearch(w); return; }
    if (t.loc.place === "airdrop") { fwRenderAirDrop(w); return; }
    if (t.loc.place === "icloud") { fwRenderICloud(w); return; }

    var kids = fwSorted(w, locChildren(t));
    if (t.view === "cols") { fwRenderColumns(w, kids); }
    else if (t.view === "flow") { fwRenderFlow(w, kids); }
    else if (t.view === "list") { fwRenderList(w, kids); }
    else { fwRenderIcons(w, kids); }

    fwStatus(w, kids);
}

/* the strip the Trash window carries under its toolbar (12.01.41) */
function fwTrashBar(w) {
    var bar = el("div", "fw-trashbar");
    bar.innerHTML = "<span>Trash</span><span class=\"grow\"></span>" +
        '<span class="btn">Empty</span>';
    bar.querySelector(".btn").addEventListener("click", function () { emptyTrash(); });
    w.viewEl.appendChild(bar);
}

function fwSorted(w, kids) {
    var t = curTab(w);
    var key = t.sort || "name", dir = t.sortDir === "desc" ? -1 : 1;
    var cmp = {
        name: function (a, b) { return a.name.localeCompare(b.name); },
        modified: function (a, b) { return a.modified - b.modified; },
        created: function (a, b) { return a.created - b.created; },
        opened: function (a, b) { return a.opened - b.opened; },
        added: function (a, b) { return a.added - b.added; },
        size: function (a, b) { return (a.bytes || 0) - (b.bytes || 0); },
        kind: function (a, b) { return kindLabel(a).localeCompare(kindLabel(b)); },
        tags: function (a, b) { return (a.tags[0] || "").localeCompare(b.tags[0] || ""); }
    }[key] || function () { return 0; };
    return kids.slice().sort(function (a, b) { return cmp(a, b) * dir; });
}

function fwScroller(w, cls) {
    var s = el("div", "fw-scroll");
    var inner = el("div", cls);
    s.appendChild(inner);
    w.viewEl.appendChild(s);
    s.addEventListener("mousedown", function (e) {
        if (e.target === s || e.target === inner) { fwSelect(w, null); }
    });
    s.addEventListener("contextmenu", function (e) {
        if (e.target !== s && e.target !== inner) return;
        contextMenu(e, fwBackgroundMenu(w));
    });
    return inner;
}

/* ---------- icon view ---------- */
function fwRenderIcons(w, kids) {
    var t = curTab(w);
    var px = t.iconSize || 64;           /* View Options drives these two */
    var ts = t.textSize || 12;
    var cell = Math.max(80, Math.round(px * 2.09));
    var host = fwScroller(w, "fw-icons");
    host.style.gridTemplateColumns = "repeat(auto-fill, " + cell + "px)";
    kids.forEach(function (n) {
        var node = el("div", "fitem" + (t.sel.indexOf(n) >= 0 ? " sel" : ""));
        node.style.width = cell + "px";
        node.innerHTML = '<div class="art" style="width:' + px + "px;height:" + px + 'px">' +
            fileArtHTML(n, px) + "</div>" +
            '<div class="name" style="font-size:' + ts + "px;line-height:" + (ts + 4) +
            "px;max-width:" + (cell - 8) + 'px" title="' + esc(n.name) + '">' +
            esc(truncMid(n.name, Math.round(cell / 4.5))) + "</div>" +
            (t.itemInfo ? '<div class="info" style="font-size:' + (ts - 2) + 'px">' +
                esc(n.kind === "folder" ? (n.children.length + " items") : fmtSize(n)) + "</div>" : "");
        fwWireItem(w, node, n);
        host.appendChild(node);
    });
}

/* ---------- list view ---------- */
var LIST_COLS = [
    { k: "name", l: "Name", w: 250 },
    { k: "modified", l: "Date Modified", w: 180 },
    { k: "size", l: "Size", w: 80, num: true },
    { k: "kind", l: "Kind", w: 120 }
];

function fwRenderList(w, kids) {
    var t = curTab(w);
    var host = fwScroller(w, "fw-list");
    var head = el("div", "fw-head");
    head.innerHTML = LIST_COLS.map(function (c) {
        var on = (t.sort || "name") === c.k;
        return '<div class="col' + (c.num ? " num" : "") + (on ? " on" : "") +
            '" data-k="' + c.k + '" style="width:' + c.w + 'px;flex:' +
            (c.k === "name" ? "1 1 auto" : "0 0 auto") + '">' + esc(c.l) +
            (on ? '<span class="sort">' + (t.sortDir === "desc" ? "▼" : "▲") + "</span>" : "") + "</div>";
    }).join("");
    Array.prototype.forEach.call(head.querySelectorAll(".col"), function (c) {
        c.addEventListener("click", function () { fwSortBy(w, c.dataset.k); });
    });
    host.appendChild(head);

    kids.forEach(function (n) {
        var row = el("div", "frow" + (t.sel.indexOf(n) >= 0 ? " sel" : ""));
        row.innerHTML = LIST_COLS.map(function (c) {
            if (c.k === "name") {
                return '<div class="cell name" style="width:' + c.w + 'px;flex:1 1 auto">' +
                    '<span class="art">' + fileArtHTML(n, 16) + "</span>" +
                    '<span class="nm">' + esc(truncMid(n.name, 44)) + "</span></div>";
            }
            var v = c.k === "modified" ? fmtDate(n.modified)
                : c.k === "size" ? fmtSize(n) : kindLabel(n);
            return '<div class="cell' + (c.num ? " num" : "") + '" style="width:' + c.w +
                'px;flex:0 0 auto">' + esc(v) + "</div>";
        }).join("");
        fwWireItem(w, row, n);
        host.appendChild(row);
    });

    /* the stripes keep going after the last file */
    var filler = el("div", "fw-filler");
    for (var i = 0; i < 40; i++) filler.appendChild(el("div", kids.length % 2 === i % 2 ? "" : "odd"));
    filler.style.cssText = "counter-reset:none";
    Array.prototype.forEach.call(filler.children, function (d, i) {
        if ((kids.length + i) % 2) d.style.background = "#f4f5f7";
    });
    host.appendChild(filler);
}

/* ---------- column view ---------- */
function fwRenderColumns(w, kids) {
    var t = curTab(w);
    var wrap = el("div", "fw-cols");
    w.viewEl.appendChild(wrap);

    var col = el("div", "fw-col");
    kids.forEach(function (n) {
        var row = el("div", "crow" + (t.sel.indexOf(n) >= 0 ? " sel" : ""));
        row.innerHTML = '<span class="art">' + fileArtHTML(n, 16) + "</span>" +
            '<span class="nm">' + esc(truncMid(n.name, 26)) + "</span>" +
            (n.children ? '<span class="arrow">▶</span>' : "");
        fwWireItem(w, row, n);
        col.appendChild(row);
    });
    wrap.appendChild(col);

    /* the selected folder opens the next column; anything else previews */
    var sel = t.sel[0];
    if (sel && sel.children) {
        var sub = el("div", "fw-col");
        sel.children.forEach(function (n) {
            var row = el("div", "crow");
            row.innerHTML = '<span class="art">' + fileArtHTML(n, 16) + "</span>" +
                '<span class="nm">' + esc(truncMid(n.name, 26)) + "</span>" +
                (n.children ? '<span class="arrow">▶</span>' : "");
            row.addEventListener("dblclick", function () { fwGo(w, n.children ? n : n); });
            sub.appendChild(row);
        });
        wrap.appendChild(sub);
    } else if (sel) {
        wrap.appendChild(fwPreviewPane(sel));
    }
}

function fwPreviewPane(n) {
    var p = el("div", "fw-preview");
    p.innerHTML = '<div class="big">' + fileArtHTML(n, 128) + "</div>" +
        "<h4>" + esc(n.name) + "</h4>" +
        '<div class="kindline">' + esc(kindLabel(n)) +
        (n.kind === "folder" || n.kind === "volume" ? "" : " - " + fmtSize(n)) + "</div>" +
        "<table>" +
        '<tr><td class="k">Created</td><td class="v">' + esc(fmtDate(n.created)) + "</td></tr>" +
        '<tr><td class="k">Modified</td><td class="v">' + esc(fmtDate(n.modified)) + "</td></tr>" +
        '<tr><td class="k">Last opened</td><td class="v">' + esc(fmtDate(n.opened)) + "</td></tr>" +
        (n.kind === "shot" ? '<tr><td class="k">Dimensions</td><td class="v">1280 × 800</td></tr>' : "") +
        "</table><div class=\"addtags\">Add Tags…</div>";
    return p;
}

/* ---------- cover flow ---------- */
function fwRenderFlow(w, kids) {
    var t = curTab(w);
    var sel = t.sel[0] || kids[0];
    var i = Math.max(0, kids.indexOf(sel));
    var flow = el("div", "fw-flow");
    kids.slice(Math.max(0, i - 2), i + 3).forEach(function (n) {
        var c = el("div", "card" + (n === sel ? " on" : ""));
        c.innerHTML = fileArtHTML(n, 120);
        c.addEventListener("click", function () { fwSelect(w, n); });
        flow.appendChild(c);
    });
    w.viewEl.appendChild(flow);
    fwRenderList(w, kids);
}

/* ---------- search ---------- */
function fwRenderSearch(w) {
    var t = curTab(w);
    var scope = el("div", "fw-scope");
    scope.innerHTML = '<span>Search:</span><span class="chip on">This Mac</span>' +
        '<span class="chip">“' + esc(locName(t.loc)) + '”</span>' +
        '<span class="save"><span class="chip">Save</span></span>';
    w.viewEl.appendChild(scope);
    var q = t.query.toLowerCase();
    var hits = fsWalk(FS).filter(function (n) {
        return n.name.toLowerCase().indexOf(q) >= 0;
    }).slice(0, 200);
    if (t.view === "list" || t.view === "flow") fwRenderList(w, hits);
    else fwRenderIcons(w, hits);
    fwStatus(w, hits);
}

function fwSearch(w, q) {
    var t = curTab(w);
    var had = !!t.query;
    t.query = q;
    if (q && !had) {
        /* the reference opens the search in its own tab */
        w.tabs.push(newTab(t.loc));
        w.tabs[w.tabs.length - 1].query = q;
        w.tabs[w.tabs.length - 1].searching = true;
        t.query = "";
        w.tab = w.tabs.length - 1;
        fwRenderAll(w);
        var inp = w.toolbarEl.querySelector(".tb-search input");
        inp.focus();
        inp.setSelectionRange(q.length, q.length);
        return;
    }
    if (!q && t.searching) { fwCloseTab(w, w.tab); return; }
    t.sel = [];
    fwRenderView(w);
    winSetTitle(w, t.query ? "Searching “This Mac”" : locName(t.loc), fwTitleIcon(w));
    var f = w.toolbarEl.querySelector(".tb-search input");
    if (f && f.value !== q) f.value = q;
}

/* ---------- the places that are not folders ---------- */
function fwRenderAirDrop(w) {
    var v = el("div", "fw-empty");
    v.innerHTML = '<div class="airdrop-rings">' +
        '<i style="width:330px;height:330px;top:-70px"></i>' +
        '<i style="width:230px;height:230px;top:-20px"></i>' +
        '<i style="width:140px;height:140px;top:25px"></i>' +
        '<div style="position:relative;margin-top:35px">' + sysIcon("AirDrop", 64) +
        "</div></div>" +
        "<p>AirDrop lets you share instantly with people nearby.</p>" +
        '<p><a>Allow me to be discovered by: No One ▾</a>' +
        '<span style="display:inline-block;width:60px"></span>' +
        "<a>Don’t see who you’re looking for?</a></p>";
    w.viewEl.appendChild(v);
}

function fwRenderICloud(w) {
    var v = el("div", "fw-empty");
    v.innerHTML = sysIcon("iDiskGenericIcon", 128) +
        "<h3>iCloud Drive</h3>" +
        "<p>Turn on iCloud Drive to store your files in iCloud and access<br>" +
        "them anytime on all your devices.<br><a>Learn More…</a></p>" +
        '<span class="btn" style="margin-top:6px">Open iCloud Preferences…</span>';
    v.querySelector(".btn").addEventListener("click", function () { launch("system-preferences"); });
    w.viewEl.appendChild(v);
}

/* ------------------------------------------------------------------ */
/* ITEM BEHAVIOUR                                                      */
/* ------------------------------------------------------------------ */
function fwWireItem(w, node, n) {
    var t = curTab(w);
    node._node = n;
    node.addEventListener("mousedown", function (e) {
        e.stopPropagation();
        winFocus(w);
        if (e.button === 2) {
            if (t.sel.indexOf(n) < 0) t.sel = [n];
            fwRenderView(w);
            return;
        }
        if (e.shiftKey || e.metaKey || e.ctrlKey) {
            var i = t.sel.indexOf(n);
            if (i >= 0) t.sel.splice(i, 1); else t.sel.push(n);
        } else if (t.sel.indexOf(n) < 0) {
            t.sel = [n];
        }
        fwRenderView(w);
        fwRenderToolbar(w);
    });
    node.addEventListener("dblclick", function () {
        if (n.children) fwGo(w, n); else openNode(n);
    });
    node.addEventListener("contextmenu", function (e) {
        e.stopPropagation();
        if (t.sel.indexOf(n) < 0) { t.sel = [n]; fwRenderView(w); }
        contextMenu(e, fwItemMenu(w, n));
    });
}

function fwSelect(w, n) {
    var t = curTab(w);
    t.sel = n ? [n] : [];
    fwRenderView(w);
    fwRenderToolbar(w);
}

function fwStatus(w, kids) {
    var t = curTab(w);
    w.statusEl.classList.toggle("hidden", !w.status);
    if (!w.status) return;
    var free = "120.66 GB available";
    w.statusEl.textContent = (t.sel.length
        ? t.sel.length + " of " + kids.length + " selected"
        : kids.length + " item" + (kids.length === 1 ? "" : "s")) + ", " + free;
}

/* ------------------------------------------------------------------ */
/* NAVIGATION                                                          */
/* ------------------------------------------------------------------ */
function fwGo(w, loc) {
    var t = curTab(w);
    t.back.push(t.loc);
    t.fwd = [];
    t.loc = loc;
    t.sel = [];
    t.query = "";
    fwRenderAll(w);
}

function fwBack(w) {
    var t = curTab(w);
    if (!t.back.length) return;
    t.fwd.push(t.loc);
    t.loc = t.back.pop();
    t.sel = [];
    fwRenderAll(w);
}

function fwForward(w) {
    var t = curTab(w);
    if (!t.fwd.length) return;
    t.back.push(t.loc);
    t.loc = t.fwd.pop();
    t.sel = [];
    fwRenderAll(w);
}

function fwSetView(w, v) {
    if (!w) return;
    curTab(w).view = v;
    fwRenderToolbar(w);
    fwRenderView(w);
}

function fwSortBy(w, key) {
    var t = curTab(w);
    if (t.sort === key) t.sortDir = t.sortDir === "desc" ? "asc" : "desc";
    else { t.sort = key; t.sortDir = "asc"; }
    fwRenderView(w);
}

function fwArrangeBy(w, key) {
    curTab(w).arrange = key;
    if (key) fwSortBy(w, key === "kind" ? "kind" : key);
    fwRenderView(w);
}

function fwToggleSidebar(w) {
    if (!w) return;
    w.sidebar = w.sidebar === false;
    w.sideEl.classList.toggle("hidden", w.sidebar === false);
}

function fwToggleStatus(w) {
    if (!w) return;
    w.status = !w.status;
    fwRenderView(w);
}

function fwSelectAll(w) {
    var t = curTab(w);
    t.sel = fwSorted(w, locChildren(t));
    fwRenderView(w);
    fwRenderToolbar(w);
}

function fwNewFolder(w) {
    var t = curTab(w);
    if (!t.loc.children) return;
    var f = folder(uniqueName(t.loc, "untitled folder"), []);
    f.parent = t.loc;
    t.loc.children.push(f);
    t.sel = [f];
    fwRenderView(w);
    if (t.loc === DESKTOP) dtRender();
    fwBeginRename(w, f);
}

/* rename in place, in icon view, with the same editor the desktop uses */
function fwBeginRename(w, n) {
    var t = curTab(w);
    if (t.view !== "icons") { fwSetView(w, "icons"); }
    t.sel = [n];
    fwRenderView(w);
    var host = null;
    Array.prototype.forEach.call(w.viewEl.querySelectorAll(".fitem"), function (f) {
        if (f._node === n) host = f;
    });
    if (!host) return;
    beginRename(host, n, t.loc.children ? t.loc : null, function () {
        fwRenderView(w);
        dtRender();
    });
}

/* the Finder keeps its own idea of what is selected for the menu bar */
function fwSelection(w) { return w && w.tabs ? curTab(w).sel : []; }

/* ------------------------------------------------------------------ */
/* MENUS                                                               */
/* ------------------------------------------------------------------ */
function viewSubmenu(w) {
    var t = curTab(w);
    var row = function (l, v) {
        return { l: l, mark: t.view === v ? "✓" : "", act: function () { fwSetView(w, v); } };
    };
    return [row("as Icons", "icons"), row("as List", "list"),
        row("as Columns", "cols"), row("as Cover Flow", "flow")];
}

function arrangeMenu(w) {
    var t = curTab(w);
    var apps = t.loc === fsFind("Applications");
    var row = function (l, k) {
        return { l: l, mark: t.arrange === k ? "✓" : "", act: function () { fwArrangeBy(w, k); } };
    };
    return [
        row("Name", "name"),
        row(apps ? "Application Category" : "Kind", "kind"),
        row("Date Last Opened", "opened"),
        row("Date Added", "added"),
        row("Date Modified", "modified"),
        row("Size", "size"),
        row("Tags", "tags"),
        { sep: 1 },
        { l: "None", mark: t.arrange ? "" : "✓", act: function () { fwArrangeBy(w, null); } }
    ];
}

function fwActionMenu(w) {
    var t = curTab(w);
    var n = t.sel.length;
    var name = n === 1 ? t.sel[0].name : locName(t.loc);
    var short20 = name.length > 24 ? name.slice(0, 23) + "…" : name;
    return [
        { l: "New Folder", act: function () { fwNewFolder(w); } },
        { l: "Open in New Tab", act: function () { fwNewTab(w, n === 1 && t.sel[0].children ? t.sel[0] : t.loc); } },
        { sep: 1 },
        { l: n > 1 ? "Get Summary Info" : "Get Info", act: function () { getInfo(); } },
        { l: "Burn “" + short20 + "” to Disc…" },
        { l: "Quick Look “" + short20 + "”", act: function () { quickLook(n ? t.sel[0] : t.loc); } },
        { sep: 1 },
        { l: "Copy “" + short20 + "” as Pathname", act: function () { clipboard = [n ? t.sel[0] : t.loc]; } },
        { sep: 1 },
        { l: "Arrange By", sub: function () { return arrangeMenu(w); } },
        { l: "Show View Options", act: function () { openViewOptions(w); } }
    ];
}

function shareMenu(w) {
    var ico = function (id) {
        var a = appById(id);
        return a ? appIconHTML(a, 32) : "";
    };
    return [
        { l: "Mail", ico: ico("mail"), act: function () { launch("mail"); } },
        { l: "Messages", ico: ico("messages"), act: function () { launch("messages"); } },
        { l: "AirDrop", ico: sysIcon("AirDrop", 32), act: function () { fwGo(w, { place: "airdrop" }); } },
        { l: "Notes", ico: ico("notes"), act: function () { launch("notes"); } },
        { l: "More…", act: function () { launch("system-preferences"); } }
    ];
}

function fwBackgroundMenu(w) {
    return [
        { l: "New Folder", act: function () { fwNewFolder(w); } },
        { sep: 1 },
        { l: "Get Info", act: function () { getInfoNode(curTab(w).loc); } },
        { sep: 1 },
        { l: "View", sub: function () { return viewSubmenu(w); } },
        { l: "Arrange By", sub: function () { return arrangeMenu(w); } },
        { l: "Show View Options", act: function () { openViewOptions(w); } }
    ];
}

function fwItemMenu(w, n) {
    var t = curTab(w);
    var many = t.sel.length > 1;
    var short20 = n.name.length > 24 ? n.name.slice(0, 23) + "…" : n.name;
    if (t.loc === TRASH) return trashItemMenu(w, n, short20);
    return [
        { l: many ? "Open " + t.sel.length + " Items" : "Open", act: function () {
            if (n.children && !many) fwGo(w, n); else t.sel.slice().forEach(openNode);
        } },
        { l: "Open in New Tab", act: function () { fwNewTab(w, n.children ? n : t.loc); } },
        { l: "Open With", sub: [
            { l: n.kind === "shot" ? "Preview (default)" : "TextEdit (default)", act: function () { openNode(n); } },
            { sep: 1 }, { l: "Other…", d: 1 }
        ] },
        { sep: 1 },
        { l: "Move to Trash", act: trashSelection },
        { l: "Get Info", act: function () { getInfoNode(n); } },
        { l: "Rename", act: function () { fwBeginRename(w, n); } },
        { l: "Compress “" + short20 + "”" },
        { l: "Duplicate", act: duplicateSelection },
        { l: "Make Alias" },
        { l: "Quick Look “" + short20 + "”", act: function () { quickLook(n); } },
        { sep: 1 },
        { l: "Copy “" + short20 + "”", act: function () { clipboard = t.sel.slice(); } },
        { sep: 1 },
        { l: "Tags…", act: function () { openTagPopover(w, w.toolbarEl.querySelector(".tagbtn")); } }
    ];
}

/* What the Trash offers instead: Put Back, Delete Immediately, and no
   Move to Trash.  Traced from the 12.01.41 shot. */
function trashItemMenu(w, n, short20) {
    var t = curTab(w);
    return [
        { l: "Open in New Tab", act: function () { fwNewTab(w, n.children ? n : TRASH); } },
        { sep: 1 },
        { l: "Put Back", act: function () { putBack(w, t.sel.slice()); } },
        { sep: 1 },
        { l: "Delete Immediately…", act: function () { deleteImmediately(w, t.sel.slice()); } },
        { l: "Empty Trash", act: emptyTrash },
        { sep: 1 },
        { l: "Get Info", act: function () { getInfoNode(n); } },
        { l: "Rename", act: function () { fwBeginRename(w, n); } },
        { l: "Quick Look “" + short20 + "”", act: function () { quickLook(n); } },
        { sep: 1 },
        { l: "Copy “" + short20 + "”", act: function () { clipboard = t.sel.slice(); } },
        { sep: 1 },
        { l: "Clean Up Selection", act: function () { fwRenderView(w); } },
        { l: "Show View Options", act: function () { openViewOptions(w); } },
        { sep: 1 },
        { l: "Tags…", act: function () { openTagPopover(w, w.toolbarEl.querySelector(".tagbtn")); } },
        { tags: 1, on: t.sel.slice() },
        { sep: 1 },
        { l: "Folder Actions Setup…", d: !n.children },
        { l: "Reveal in Finder", act: function () { revealInFinder(n.putBack || DESKTOP, n); } },
        { l: "Open", act: function () { n.children ? fwGo(w, n) : openNode(n); } }
    ];
}

/* Put Back: the copy sound, then a new window on the folder it came from
   with the item selected -- which is what the real one does. */
function putBack(w, items) {
    if (!items.length) return;
    var home = null;
    items.forEach(function (n) {
        var to = n.putBack || DESKTOP;
        var i = TRASH.children.indexOf(n);
        if (i >= 0) TRASH.children.splice(i, 1);
        n.name = uniqueName(to, n.name);
        n.parent = to;
        if (to.children) to.children.push(n);
        home = to;
    });
    sfxCopy();
    dtRender();
    dockSync();
    wins.forEach(function (o) { if (o.app === "finder" && o.tabs) fwRenderView(o); });
    revealInFinder(home, items[0]);
}

/* open a fresh window on a folder with one item picked out */
function revealInFinder(dir, n) {
    var w = openFinder(dir === DESKTOP ? DESKTOP : dir);
    var t = curTab(w);
    t.sel = [n];
    fwRenderView(w);
    fwRenderToolbar(w);
    return w;
}

function deleteImmediately(w, items) {
    if (!items.length) return;
    var name = items.length === 1 ? items[0].name : items.length + " items";
    openAlert("Are you sure you want to delete “" + name + "”?",
        (items.length === 1 ? "This item" : "These items") +
        " will be deleted immediately. You can’t undo this action.",
        function () {
            items.forEach(function (n) {
                var i = TRASH.children.indexOf(n);
                if (i >= 0) TRASH.children.splice(i, 1);
            });
            curTab(w).sel = [];
            fwRenderView(w);
            dockSync();
        },
        { icon: "finder", ok: "Delete", cancelDefault: true });
}

/* the Finder's own icon in the Dock has a menu of its own */
function finderDockMenu() {
    return [
        { l: "New Finder Window", act: function () { openFinder(DESKTOP); } },
        { l: "New Smart Folder" },
        { l: "Find…", act: function () { spotOpen(); } },
        { sep: 1 },
        { l: "Go to Folder…", act: goToFolder },
        { l: "Connect to Server…", act: openConnectToServer },
        { sep: 1 },
        { l: "Show All Windows", act: bringAllToFront },
        { l: "Hide", d: !wins.some(function (w) { return w.app === "finder"; }),
          act: function () { hideApp("finder"); } }
    ];
}
