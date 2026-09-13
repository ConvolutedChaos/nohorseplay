"use strict";
/* the menu bar: which app owns it, what each of its menus contains, and
   what the commands actually do */

var barTracking = false;     /* a menu is down, so hovering switches menus */
var activeApp = "finder";    /* the app whose menus the bar is showing */

/* keyboard glyphs, so the definitions below stay readable */
var K = {
    cmd: "⌘", opt: "⌥", shift: "⇧", ctrl: "⌃",
    del: "⌫", esc: "⎋", up: "↑", ret: "↩", space: "Space"
};

function kk() { return Array.prototype.join.call(arguments, ""); }

/* ------------------------------------------------------------------ */
/* APPLE MENU                                                          */
/* ------------------------------------------------------------------ */
function appleMenu() {
    return [
        { l: "About This Mac", act: function () { openAbout(); } },
        { sep: 1 },
        { l: "System Preferences…", act: function () { launch("system-preferences"); } },
        { l: "App Store…", act: function () { launch("app-store"); } },
        { sep: 1 },
        { l: "Recent Items", sub: recentItemsMenu },
        { sep: 1 },
        { l: "Force Quit…", k: kk(K.opt, K.cmd, K.esc), act: openForceQuit },
        { sep: 1 },
        { l: "Sleep", act: function () { powerDown("sleep"); } },
        { l: "Restart…", act: function () { confirmPower("restart"); } },
        { l: "Shut Down…", act: function () { confirmPower("shutdown"); } },
        { sep: 1 },
        { l: "Log Out " + sys.user + "…", k: kk(K.shift, K.cmd, "Q"), act: function () { confirmPower("logout"); } }
    ];
}

var recentApps = ["disk-utility", "grab", "installer", "itunes", "preview",
    "quicktime-player", "safari", "system-preferences"];
var recentDocs = ["LWScreenShot 2026-09-11 at 6.20.33 PM",
    "Screen Shot 2026-09-11 at 6.25.04 PM", "untitled.mp3"];

function recentItemsMenu() {
    var m = [{ l: "Applications", head: 1 }];
    recentApps.forEach(function (id) {
        var a = appById(id);
        var nm = a ? a.name : "Install OS X El Capitan";
        m.push({
            l: nm, ico: a ? appIconHTML(a, 32) : sysIcon("GenericApplicationIcon", 32),
            act: function () { a ? launch(id) : launch("installer"); }
        });
    });
    m.push({ l: "Documents", head: 1 });
    recentDocs.forEach(function (n) {
        m.push({ l: n, ico: sysIcon("GenericDocumentIcon", 32), act: function () { openDocument(n); } });
    });
    m.push({ l: "Servers", head: 1 });
    m.push({ sep: 1 });
    m.push({
        l: "Clear Menu", act: function () {
            recentApps = []; recentDocs = [];
        }
    });
    return m;
}

/* ------------------------------------------------------------------ */
/* FINDER                                                              */
/* ------------------------------------------------------------------ */
/* Most of the greyed-out rows in the reference shots are greyed because
   nothing was selected, so the definitions ask the desktop and the front
   window what is selected rather than hard-coding the disabled state. */
function selCount() {
    var w = frontWindow();
    if (w && w.app === "finder") return fwSelection(w).length;
    return dtSelection().length;
}

/* the selection as file nodes, wherever it lives */
function finderSelection() {
    var w = frontWindow();
    if (w && w.app === "finder") return fwSelection(w);
    return dtSelection().map(function (i) { return i.node; });
}

function selName() {
    var w = frontWindow();
    var s = (w && w.app === "finder") ? fwSelection(w) : dtSelection().map(function (i) { return i.node; });
    return s.length === 1 ? s[0].name : null;
}

function finderMenu() {
    return [
        { l: "About Finder", act: openAboutFinder },
        { sep: 1 },
        { l: "Preferences…", k: kk(K.cmd, ","), act: function () { openPlaceholder("finder", "Finder Preferences"); } },
        { sep: 1 },
        { l: "Empty Trash…", k: kk(K.shift, K.cmd, K.del), d: !TRASH.children.length, act: emptyTrash },
        { sep: 1 },
        {
            l: "Services", sub: [
                { l: "No Services Apply", d: 1 },
                { sep: 1 },
                { l: "Services Preferences…", ico: appIconHTML(appById("system-preferences"), 32), act: function () { launch("system-preferences"); } }
            ]
        },
        { sep: 1 },
        { l: "Hide Finder", k: kk(K.cmd, "H"), act: function () { hideApp("finder"); } },
        { l: "Hide Others", k: kk(K.opt, K.cmd, "H"), act: function () { hideOthers("finder"); } },
        { l: "Show All", d: !anyHidden(), act: showAllApps }
    ];
}

function finderFileMenu() {
    var n = selCount(), one = n === 1, nm = selName();
    return [
        { l: "New Finder Window", k: kk(K.cmd, "N"), act: function () { openFinder(DESKTOP); } },
        { l: "New Folder", k: kk(K.shift, K.cmd, "N"), act: newFolderHere },
        { l: "New Folder with Selection", k: kk(K.ctrl, K.cmd, "N"), d: !n },
        { l: "New Smart Folder" },
        { l: "New Burn Folder" },
        {
            l: "New Tab", k: kk(K.cmd, "T"), act: function () {
                var w = frontWindow();
                if (w && w.app === "finder") fwNewTab(w); else openFinder(HOME);
            }
        },
        {
            l: "Open in New Tab", k: kk(K.ctrl, K.cmd, "O"), d: !n, act: function () {
                var w = frontWindow();
                var sel = w && w.app === "finder" ? fwSelection(w)[0] : (dtSelection()[0] || {}).node;
                if (w && w.app === "finder") fwNewTab(w, sel && sel.children ? sel : curTab(w).loc);
                else if (sel && sel.children) openFinder(sel);
            }
        },
        { l: "Open With", d: !one, sub: [{ l: "Preview", act: openSelection }, { l: "Other…", d: 1 }] },
        { l: "Print", k: kk(K.cmd, "P"), d: !n },
        { l: "Close Window", k: kk(K.cmd, "W"), d: !frontWindow(), act: closeFrontWindow },
        { sep: 1 },
        { l: n > 1 ? "Get Summary Info" : "Get Info", k: n > 1 ? kk(K.ctrl, K.cmd, "I") : kk(K.cmd, "I"), act: getInfo },
        { l: "Rename", d: !one, act: renameSelection },
        { sep: 1 },
        { l: "Compress", d: !n },
        { sep: 1 },
        { l: "Duplicate", k: kk(K.cmd, "D"), d: !n, act: duplicateSelection },
        { l: "Make Alias", k: kk(K.cmd, "L"), d: !n },
        { l: "Quick Look" + (one ? ' “' + nm + '”' : ""), k: kk(K.cmd, "Y"), d: !n, act: quickLookToggle },
        { l: "Show Original", k: kk(K.cmd, "R"), d: 1 },
        { l: "Add to Sidebar", k: kk(K.ctrl, K.cmd, "T"), d: !n },
        { sep: 1 },
        { l: "Move to Trash", k: kk(K.cmd, K.del), d: !n, act: trashSelection },
        { l: "Eject", k: kk(K.ctrl, K.cmd, "E"), d: 1 },
        { l: "Burn “Desktop” to Disc…" },
        { sep: 1 },
        { l: "Find", k: kk(K.cmd, "F"), act: function () { spotOpen(); } },
        { sep: 1 },
        { l: "Tags…", d: !n },
        { tags: 1, on: finderSelection() }
    ];
}

function editMenu() {
    var n = selCount();
    return [
        { l: dtUndoLabel(), k: kk(K.cmd, "Z"), d: !dtCanUndo(), act: dtUndo },
        { l: "Redo", k: kk(K.shift, K.cmd, "Z"), d: 1 },
        { sep: 1 },
        { l: "Cut", k: kk(K.cmd, "X"), d: !n },
        { l: "Copy" + (n > 1 ? " " + n + " Items" : ""), k: kk(K.cmd, "C"), d: !n, act: copySelection },
        { l: "Paste", k: kk(K.cmd, "V"), d: !clipboard.length, act: pasteClipboard },
        { l: "Select All", k: kk(K.cmd, "A"), act: selectAll },
        { sep: 1 },
        { l: "Show Clipboard", act: showClipboard },
        { sep: 1 },
        { l: "Start Dictation…", k: "fn fn" },
        { l: "Emoji & Symbols", k: kk(K.ctrl, K.cmd, K.space), act: openEmojiPanel }
    ];
}

function viewMenu() {
    var w = frontWindow(), fw = w && w.app === "finder" ? w : null;
    var t = fw ? curTab(fw) : null;
    var tick = function (v) { return t && t.view === v ? "✓" : ""; };
    var setv = function (v) { return function () { fwSetView(fw, v); }; };
    return [
        { l: "as Icons", k: kk(K.cmd, "1"), d: !fw, mark: tick("icons"), act: setv("icons") },
        { l: "as List", k: kk(K.cmd, "2"), d: !fw, mark: tick("list"), act: setv("list") },
        { l: "as Columns", k: kk(K.cmd, "3"), d: !fw, mark: tick("cols"), act: setv("cols") },
        { l: "as Cover Flow", k: kk(K.cmd, "4"), d: !fw, mark: tick("flow"), act: setv("flow") },
        { sep: 1 },
        { l: "Clean Up", d: !!fw, act: function () { dtCleanUp(); } },
        {
            l: "Clean Up By", d: !!fw, sub: [
                { l: "Name", k: kk(K.opt, K.cmd, "1"), act: function () { dtCleanUp("name"); } },
                { l: "Kind", k: kk(K.opt, K.cmd, "2"), act: function () { dtCleanUp("kind"); } },
                { l: "Date Modified", k: kk(K.opt, K.cmd, "5"), act: function () { dtCleanUp("modified"); } },
                { l: "Date Created", act: function () { dtCleanUp("modified"); } },
                { l: "Size", k: kk(K.opt, K.cmd, "6"), act: function () { dtCleanUp("size"); } },
                { l: "Tags", k: kk(K.opt, K.cmd, "7"), act: function () { dtCleanUp("name"); } }
            ]
        },
        { l: "Sort By", sub: function () { return fw ? arrangeMenu(fw) : dtSortMenu(); } },
        { sep: 1 },
        {
            l: (fw && fw.tabs.length > 1 ? "Hide" : "Show") + " Tab Bar", k: kk(K.shift, K.cmd, "T"),
            d: !fw, act: function () {
                if (fw.tabs.length > 1) fwCloseTab(fw, fw.tabs.length - 1); else fwNewTab(fw);
            }
        },
        { l: "Hide Path Bar", k: kk(K.opt, K.cmd, "P"), d: !fw },
        {
            l: (fw && fw.status ? "Hide" : "Show") + " Status Bar", k: kk(K.cmd, "/"), d: !fw,
            act: function () { fwToggleStatus(fw); }
        },
        {
            l: (fw && fw.sidebar === false ? "Show" : "Hide") + " Sidebar", k: kk(K.opt, K.cmd, "S"),
            d: !fw, act: function () { fwToggleSidebar(fw); }
        },
        { l: "Hide Preview", k: kk(K.shift, K.cmd, "P"), d: 1 },
        { sep: 1 },
        { l: "Toolbar", k: kk(K.opt, K.cmd, "T"), d: 1 },
        { l: "Customize Toolbar…", d: !fw },
        { sep: 1 },
        { l: "Show View Options", k: kk(K.cmd, "J"), act: function () { openViewOptions(fw); } },
        { sep: 1 },
        { l: "Enter Full Screen", k: kk(K.ctrl, K.cmd, "F"), d: !fw, act: function () { winZoom(fw); } }
    ];
}

function goMenu() {
    var w = frontWindow(), fw = w && w.app === "finder" ? w : null;
    var go = function (l, k, path, ico) {
        return {
            l: l, k: k, ico: ico, act: function () {
                var n = typeof path === "string" ? fsFind(path) : path;
                if (fw) fwGo(fw, n); else openFinder(n);
            }
        };
    };
    return [
        { l: "Back", k: kk(K.cmd, "["), d: !fw || !curTab(fw).back.length, act: function () { fwBack(fw); } },
        { l: "Forward", k: kk(K.cmd, "]"), d: !fw || !curTab(fw).fwd.length, act: function () { fwForward(fw); } },
        {
            l: "Enclosing Folder in New Window", k: kk(K.ctrl, K.cmd, K.up), act: function () {
                openFinder(fw && curTab(fw).loc.parent ? curTab(fw).loc.parent : HOME);
            }
        },
        { sep: 1 },
        go("All My Files", kk(K.shift, K.cmd, "F"), { place: "allmyfiles" }, sysIcon("AllMyFiles", 32)),
        go("Documents", kk(K.shift, K.cmd, "O"), "Users/timmytoenails/Documents", sysIcon("DocumentsFolderIcon", 32)),
        go("Desktop", kk(K.shift, K.cmd, "D"), "Users/timmytoenails/Desktop", sysIcon("DesktopFolderIcon", 32)),
        go("Downloads", kk(K.opt, K.cmd, "L"), "Users/timmytoenails/Downloads", sysIcon("DownloadsFolder", 32)),
        go("Home", kk(K.shift, K.cmd, "H"), "Users/timmytoenails", sysIcon("HomeFolderIcon", 32)),
        go("Computer", kk(K.shift, K.cmd, "C"), "", sysIcon("com.apple.macbookpro-13-retina-display", 32)),
        go("AirDrop", kk(K.shift, K.cmd, "R"), { place: "airdrop" }, sysIcon("AirDrop", 32)),
        { l: "Network", k: kk(K.shift, K.cmd, "K"), ico: sysIcon("GenericNetworkIcon", 32), act: function () { openPlaceholder("finder", "Network"); } },
        go("iCloud Drive", kk(K.shift, K.cmd, "I"), { place: "icloud" }, sysIcon("iDiskGenericIcon", 32)),
        go("Applications", kk(K.shift, K.cmd, "A"), "Applications", sysIcon("ApplicationsFolderIcon", 32)),
        go("Utilities", kk(K.shift, K.cmd, "U"), "Library/CoreServices", sysIcon("UtilitiesFolder", 32)),
        { sep: 1 },
        {
            l: "Recent Folders", sub: [
                { l: "All My Files", act: function () { openFinder({ place: "allmyfiles" }); } },
                { l: "Desktop", act: function () { openFinder(DESKTOP); } },
                { l: "Downloads", act: function () { openFinder(fsFind("Users/timmytoenails/Downloads")); } },
                { l: "OS X Base System", act: function () { openFinder(FS); } },
                { sep: 1 },
                { l: "Clear Menu" }
            ]
        },
        { sep: 1 },
        { l: "Go to Folder…", k: kk(K.shift, K.cmd, "G"), act: goToFolder },
        { l: "Connect to Server…", k: kk(K.cmd, "K"), act: openConnectToServer }
    ];
}

function windowMenu() {
    var m = [
        { l: "Minimize", k: kk(K.cmd, "M"), d: !frontWindow(), act: function () { winMinimize(frontWindow()); } },
        { l: "Zoom", d: !frontWindow(), act: function () { winZoom(frontWindow()); } },
        { l: "Cycle Through Windows", k: kk(K.cmd, "`"), d: wins.length < 2, act: cycleWindows },
        { sep: 1 },
        { l: "Bring All to Front", d: !wins.length, act: bringAllToFront }
    ];
    var mine = wins.filter(function (w) { return w.app === activeApp; });
    if (mine.length) {
        m.push({ sep: 1 });
        mine.forEach(function (w) {
            m.push({
                l: w.title, mark: w === frontWindow() ? "✓" : (w.minimized ? "◆" : ""),
                act: function () { winFocus(w); }
            });
        });
    }
    return m;
}

/* ---------- Help, with the live search from the reference shots ---- */
var HELP_TOPICS = [
    "Use IP over FireWire to connect computers",
    "Use the Switch Control Panel",
    "If you can’t find the computer you want",
    "A network service is a group of settings",
    "Set up a connection to the Internet",
    "Use IP over Thunderbolt to connect"
];

function helpMenu() {
    return [{ field: 1, l: "Search", fieldId: "helpSearch", value: helpQuery }].concat(helpResults());
}

var helpQuery = "";

function helpResults() {
    if (!helpQuery.trim()) {
        return [
            { sep: 1 },
            { l: "Mac Help", act: openMacHelp },
            { sep: 1 },
            { l: "What’s New in OS X", act: function () { openPlaceholder("finder", "What’s New in OS X"); } },
            { l: "Get to Know Your Mac", act: function () { openPlaceholder("finder", "Get to Know Your Mac") } }
        ];
    }
    var q = helpQuery.toLowerCase();
    var hits = [];
    /* every command in the app's own menus is searchable, as it is on
       the real thing -- that is what the "Menu Items" section is */
    menuTitles().forEach(function (t) {
        if (t.id === "help") return;          /* or Help would search itself */
        var def = t.def();
        def.forEach(function (it) {
            if (it.l && !it.head && !it.sep && it.l.toLowerCase().indexOf(q) >= 0 && hits.length < 10) {
                hits.push({ l: it.l.replace(/…$/, ""), ico: sysIcon("GenericWindowIcon", 32), act: it.act });
            }
        });
    });
    var topics = HELP_TOPICS.filter(function (t) { return t.toLowerCase().indexOf(q) >= 0; });
    if (!hits.length && !topics.length) return [{ sep: 1 }, { l: "No Results Found", d: 1 }];

    var out = [{ sep: 1 }];
    if (hits.length) {
        out.push({ l: "Menu Items", head: 1, right: 1 });
        out = out.concat(hits);
    }
    if (topics.length) {
        out.push({ l: "Help Topics", head: 1, right: 1 });
        topics.slice(0, 7).forEach(function (t) {
            out.push({
                l: t.length > 28 ? t.slice(0, 27) + "…" : t, ico: sysIcon("HelpIcon", 32),
                act: openMacHelp
            });
        });
        out.push({ l: "Show All Help Topics", ico: sysIcon("HelpIcon", 32), act: openMacHelp });
    }
    return out;
}

/* ------------------------------------------------------------------ */
/* A NON-FINDER APP                                                    */
/* ------------------------------------------------------------------ */
function appMenu(app) {
    return [
        { l: "About " + app.name, act: function () { openAboutApp(app); } },
        { sep: 1 },
        { l: "Preferences…", k: kk(K.cmd, ","), act: function () { openPlaceholder(app.id, app.name + " Preferences"); } },
        { sep: 1 },
        { l: "Services", sub: [{ l: "No Services Apply", d: 1 }] },
        { sep: 1 },
        { l: "Hide " + app.name, k: kk(K.cmd, "H"), act: function () { hideApp(app.id); } },
        { l: "Hide Others", k: kk(K.opt, K.cmd, "H"), act: function () { hideOthers(app.id); } },
        { l: "Show All", d: !anyHidden(), act: showAllApps },
        { sep: 1 },
        { l: "Quit " + app.name, k: kk(K.cmd, "Q"), act: function () { quitApp(app.id); } }
    ];
}

function appFileMenu(app) {
    return [
        { l: "New", k: kk(K.cmd, "N"), act: function () { launch(app.id, true); } },
        { l: "Open…", k: kk(K.cmd, "O"), act: function () { openFinder(DESKTOP); } },
        { l: "Open Recent", sub: [{ l: "Clear Menu", d: 1 }] },
        { sep: 1 },
        { l: "Close", k: kk(K.cmd, "W"), d: !frontWindow(), act: closeFrontWindow },
        { l: "Save…", k: kk(K.cmd, "S"), d: 1 },
        { l: "Export as PDF…", d: 1 },
        { sep: 1 },
        { l: "Print…", k: kk(K.cmd, "P"), d: 1 }
    ];
}

/* ------------------------------------------------------------------ */
/* WHICH TITLES THE BAR SHOWS                                          */
/* ------------------------------------------------------------------ */
function menuTitles() {
    if (activeApp === "finder") {
        return [
            { id: "finder", name: "Finder", app: true, def: finderMenu },
            { id: "file", name: "File", def: finderFileMenu },
            { id: "edit", name: "Edit", def: editMenu },
            { id: "view", name: "View", def: viewMenu },
            { id: "go", name: "Go", def: goMenu },
            { id: "window", name: "Window", def: windowMenu },
            { id: "help", name: "Help", def: helpMenu }
        ];
    }
    var app = appById(activeApp) || APPS[0];
    return [
        { id: "app", name: app.name, app: true, def: function () { return appMenu(app); } },
        { id: "file", name: "File", def: function () { return appFileMenu(app); } },
        { id: "edit", name: "Edit", def: editMenu },
        { id: "window", name: "Window", def: windowMenu },
        { id: "help", name: "Help", def: helpMenu }
    ];
}

/* ------------------------------------------------------------------ */
/* RENDERING THE BAR                                                   */
/* ------------------------------------------------------------------ */
function barRender() {
    var left = $("mbLeft");
    left.innerHTML = "";
    var apple = el("div", "mb-item", ICON.apple);
    apple.id = "mbApple";
    wireBarItem(apple, "apple", appleMenu);
    left.appendChild(apple);

    menuTitles().forEach(function (t) {
        var n = el("div", "mb-item" + (t.app ? " app" : ""), esc(t.name));
        wireBarItem(n, t.id, t.def);
        left.appendChild(n);
    });
}

function wireBarItem(n, id, def) {
    n._menuId = id;
    n._menuDef = def;
    n.addEventListener("mousedown", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (menuOpenId === id) { menuCloseAll(); return; }
        barOpen(id, n);
        barTracking = true;
    });
    n.addEventListener("mouseenter", function () {
        if (barTracking && menuOpenId !== id) barOpen(id, n);
    });
}

function barOpen(id, n) {
    var def = typeof n._menuDef === "function" ? n._menuDef() : n._menuDef;
    var r = n.getBoundingClientRect();
    if (menuOwner) menuOwner.classList.remove("open");
    menuOpen(def, r.left, r.bottom, { pulldown: true, minWidth: id === "help" ? 348 : 0 });
    menuOpenId = id;
    menuOwner = n;
    n.classList.add("open");
    barTracking = true;
    if (id === "help") wireHelpSearch();
}

function wireHelpSearch() {
    var f = $("helpSearch");
    if (!f) return;
    f.focus();
    if (helpQuery) f.setSelectionRange(helpQuery.length, helpQuery.length);
    f.addEventListener("input", function () {
        helpQuery = f.value;
        var m = menuStack[0];
        if (!m) return;
        /* redraw everything under the field, leaving the field alone so
           the caret does not jump */
        while (m.children.length > 1) m.removeChild(m.lastElementChild);
        var rebuilt = menuBuild(helpResults(), "");
        while (rebuilt.firstElementChild) m.appendChild(rebuilt.firstElementChild);
    });
    f.addEventListener("keydown", function (e) { e.stopPropagation(); });
}

/* the bar stops tracking as soon as the button comes back up outside it */
document.addEventListener("mouseup", function (e) {
    if (!menuStack.length) barTracking = false;
});

/* ------------------------------------------------------------------ */
/* COMMANDS                                                            */
/* ------------------------------------------------------------------ */
var clipboard = [];

function copySelection() {
    clipboard = dtSelection().map(function (i) { return i.node; });
}

function pasteClipboard() {
    clipboard.forEach(function (n) {
        var copy = node(n.name + " copy", n.kind, { bytes: n.bytes, ext: n.ext });
        copy.parent = DESKTOP;
        DESKTOP.children.push(copy);
    });
    dtRender();
}

function showClipboard() {
    openPlaceholder("finder", "Clipboard",
        clipboard.length ? clipboard.map(function (n) { return n.name; }).join("\n") : "The clipboard is empty.");
}

function selectAll() {
    var w = frontWindow();
    if (w && w.app === "finder") fwSelectAll(w); else dtSelectAll();
}

function hideApp(id) {
    wins.forEach(function (w) { if (w.app === id) { w.hidden = true; w.node.classList.add("hidden"); } });
    dockSync();
}

function hideOthers(id) {
    wins.forEach(function (w) { if (w.app !== id) { w.hidden = true; w.node.classList.add("hidden"); } });
    dockSync();
}

function anyHidden() { return wins.some(function (w) { return w.hidden; }); }

function showAllApps() {
    wins.forEach(function (w) { w.hidden = false; w.node.classList.remove("hidden"); });
    dockSync();
}

function goToFolder() {
    openGoToFolder(function (v) {
        var n = fsFind(v.replace(/^\/+/, ""));
        if (n && n.children) openFinder(n);
        else openAlert("The folder can’t be found.", "“" + v + "” does not exist on this Mac.");
    });
}
