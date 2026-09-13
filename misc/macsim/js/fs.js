"use strict";
/* the app roster and the pretend file system both Finder and Spotlight read */

/* ------------------------------------------------------------------ */
/* APPS                                                                */
/* ------------------------------------------------------------------ */
/* id        -- the app's handle everywhere else in the sim
   icon      -- basename under assets/icons/<size>/, when it differs from
                the id (Apple named a few of these after the artwork)
   ph        -- the letter drawn if that PNG is ever missing
   kind:none -- Launchpad and Mission Control, which own no window        */
var APPS = [
    { id: "finder", name: "Finder", icon: "Finder", ph: "F", kind: "finder", w: 760, h: 480 },
    { id: "launchpad", name: "Launchpad", ph: "L", kind: "none" },
    { id: "mission-control", name: "Mission Control", ph: "M", kind: "none" },
    { id: "app-store", name: "App Store", ph: "A", ver: "2.1", w: 720, h: 460 },
    { id: "mail", name: "Mail", ph: "M", ver: "9.3", w: 720, h: 460 },
    { id: "safari", name: "Safari", icon: "compass", ph: "S", ver: "9.1.2", w: 800, h: 500 },
    { id: "facetime", name: "FaceTime", ph: "FT", ver: "3.0", w: 480, h: 380 },
    { id: "contacts", name: "Contacts", ph: "C", ver: "9.0", w: 640, h: 420 },
    { id: "calendar", name: "Calendar", ph: "C", ver: "8.0", w: 720, h: 460 },
    { id: "itunes", name: "iTunes", ph: "iT", ver: "12.4", w: 760, h: 480 },
    { id: "ibooks", name: "iBooks", ph: "iB", ver: "1.5", w: 700, h: 460 },
    { id: "photo-booth", name: "Photo Booth", ph: "PB", ver: "8.0", w: 560, h: 420 },
    { id: "system-preferences", name: "System Preferences", ph: "SP", ver: "14.0", w: 668, h: 460 },
    { id: "maps", name: "Maps", ph: "M", ver: "2.0", w: 720, h: 460 },
    { id: "photos", name: "Photos", ph: "P", ver: "1.5", w: 760, h: 480 }
];

/* apps that are installed but not in the Dock -- Spotlight still finds them */
var EXTRA_APPS = [
    { id: "preview", name: "Preview", ph: "Pv", ver: "8.1", w: 620, h: 460 },
    { id: "textedit", name: "TextEdit", icon: "text-edit", ph: "TE", ver: "1.11", w: 560, h: 420 },
    { id: "quicktime-player", name: "QuickTime Player", ph: "QT", ver: "10.4", w: 600, h: 400 },
    { id: "calculator", name: "Calculator", ph: "=", ver: "10.11", w: 260, h: 340 },
    { id: "messages", name: "Messages", ph: "Ms", ver: "9.3", w: 700, h: 460 },
    { id: "notes", name: "Notes", ph: "N", ver: "4.2", w: 660, h: 440 },
    { id: "reminders", name: "Reminders", ph: "R", ver: "3.0", w: 520, h: 440 },
    { id: "stickies", name: "Stickies", ph: "St", ver: "10.1", w: 320, h: 260 },
    { id: "dictionary", name: "Dictionary", ph: "Aa", ver: "2.2", w: 620, h: 440 },
    { id: "font-book", name: "Font Book", ph: "F", ver: "7.0", w: 680, h: 460 },
    { id: "image-capture", name: "Image Capture", ph: "IC", ver: "6.7", w: 640, h: 440 },
    { id: "game-center", name: "Game Center", ph: "GC", ver: "3.0", w: 700, h: 460 },
    { id: "dashboard", name: "Dashboard", ph: "D", ver: "1.8", w: 640, h: 440 },
    { id: "automator", name: "Automator", ph: "Au", ver: "2.6", w: 720, h: 470 },
    { id: "dvd-player", name: "DVD Player", ph: "DVD", ver: "5.8", w: 560, h: 420 },
    { id: "backup", name: "Time Machine", icon: "backup", ph: "TM", ver: "1.3", w: 700, h: 460 },
    /* no artwork shipped for these four, so they keep a lettered tile */
    { id: "disk-utility", name: "Disk Utility", ph: "DU", ver: "15.0", w: 660, h: 440 },
    { id: "terminal", name: "Terminal", ph: ">_", ver: "2.6", w: 600, h: 400 },
    { id: "activity-monitor", name: "Activity Monitor", ph: "AM", ver: "10.11", w: 700, h: 440 },
    { id: "grab", name: "Grab", ph: "G", ver: "1.9", w: 520, h: 380 }
];

var ALL_APPS = APPS.filter(function (a) { return a.kind !== "none"; }).concat(EXTRA_APPS);

function appById(id) {
    for (var i = 0; i < APPS.length; i++) if (APPS[i].id === id) return APPS[i];
    for (var j = 0; j < EXTRA_APPS.length; j++) if (EXTRA_APPS[j].id === id) return EXTRA_APPS[j];
    return null;
}

/* The icons were extracted from the .icns files at every resolution Apple
   stored, so each call asks for the cut nearest the size it will be drawn
   at -- 128 in the Dock, 32 in a menu row, 256 in a Get Info panel.  An app
   with no artwork falls back to a lettered tile instead of a broken image. */
var ICON_SIZES = [16, 32, 64, 128, 256, 512, 1024];

function appIconSrc(app, size) {
    return "assets/icons/" + size + "/" + (app.icon || app.id) + ".png";
}

function appIconHTML(app, size, cls) {
    size = size || 128;
    var ph = '<div class="ph"><span>' + esc(app.ph || app.name[0]) + "</span></div>";
    return '<img class="' + (cls || "") + '" src="' + appIconSrc(app, size) + '" alt="' +
        esc(app.name) + '" onerror="iconFallback(this)" ' +
        'data-ph="' + esc(ph).replace(/"/g, "&quot;") + '">';
}

/* ------------------------------------------------------------------ */
/* THE SYSTEM ICON LIBRARY                                             */
/* ------------------------------------------------------------------ */
/* assets/icons/<size>/ holds El Capitan's own icons, extracted from the
   system .icns files.  The set is not uniform -- the sidebar templates stop
   at 64, some icons only exist small, and the Trash is even named
   differently at different sizes -- so icon-manifest.js records what
   actually ships and the loader picks the nearest cut at or above the size
   it is drawing at. */
var SYS_SIZES = [16, 32, 64, 128, 256, 512, 1024];

/* the Trash is TrashIcon / FullTrashIcon at most sizes but trash /
   trash-full at 128 and 256, so it is looked up by logical name */
var ICON_ALIAS = {
    trash: ["TrashIcon", "trash"],
    "trash-full": ["FullTrashIcon", "trash-full"]
};

function iconSizes(name) {
    return (typeof ICON_AVAIL !== "undefined" && ICON_AVAIL[name]) || SYS_SIZES;
}

function sysIconSrc(name, px) {
    var names = ICON_ALIAS[name] || [name];
    var best = null;
    names.forEach(function (n) {
        iconSizes(n).forEach(function (s) {
            if (s >= px && (!best || s < best.s)) best = { s: s, n: n };
        });
    });
    if (!best) {
        /* nothing big enough: take the largest cut there is */
        names.forEach(function (n) {
            iconSizes(n).forEach(function (s) {
                if (!best || s > best.s) best = { s: s, n: n };
            });
        });
    }
    return "assets/icons/" + best.s + "/" + best.n + ".png";
}

/* drawn at exactly px, from the nearest cut at or above it */
function sysIcon(name, px, cls) {
    return '<img class="sysicon ' + (cls || "") + '" src="' + sysIconSrc(name, px) +
        '" alt="" style="width:' + px + "px;height:" + px + 'px" onerror="iconFallback(this)" data-ph="">';
}

/* The sidebar's icons are black templates with an alpha channel, and the
   real Finder draws them at about half strength so the vibrancy behind
   shows through.  Since the artwork is already black, plain opacity does
   that -- no tinting, and nothing that depends on CSS masks. */
function sideIconHTML(name, px, cls) {
    px = px || 16;
    return '<img class="sideicon ' + (cls || "") + '" src="' + sysIconSrc(name, px) +
        '" alt="" style="width:' + px + "px;height:" + px + 'px" onerror="iconFallback(this)" data-ph="">';
}

/* An icon that fails can already have been pulled out of the document --
   the Dock rebuilds the Trash, menus are thrown away and redrawn -- so the
   tile only goes in if there is still somewhere to put it. */
function iconFallback(img) {
    if (img.parentNode) img.insertAdjacentHTML("afterend", img.dataset.ph);
    img.remove();
}

/* ------------------------------------------------------------------ */
/* FILE SYSTEM                                                         */
/* ------------------------------------------------------------------ */
/* kind: volume | folder | app | shot | doc
   ext decides the artwork and the Kind column, the way it does in the
   reference shots -- PNG image, ZIP archive, HTML document and so on. */
var uidN = 0;
function uid() { return "n" + (++uidN); }

var NOW = new Date();

function node(name, kind, extra) {
    var n = {
        id: uid(), name: name, kind: kind, children: null,
        bytes: 0, tags: [],
        modified: NOW, created: NOW, opened: NOW, added: NOW
    };
    if (extra) for (var k in extra) n[k] = extra[k];
    if (!n.ext) n.ext = (name.match(/\.([a-z0-9]+)$/i) || ["", ""])[1].toLowerCase();
    return n;
}

function folder(name, kids, extra) {
    var n = node(name, "folder", extra);
    n.children = kids || [];
    n.children.forEach(function (c) { c.parent = n; });
    return n;
}

/* a date, minutes back from now -- the reference desktop is all "Today" */
function ago(min) { return new Date(NOW.getTime() - min * 60000); }
function on(y, m, d, h, mi) { return new Date(y, m - 1, d, h || 12, mi || 0); }

/* ---------- formatting, as the Finder writes it ---------- */
function fmtSize(n) {
    if (n.kind === "folder" || n.kind === "volume") return "--";
    var b = n.bytes;
    if (!b) return "Zero bytes";
    if (b < 1000) return b + " bytes";
    if (b < 1000000) return Math.round(b / 1000) + " KB";
    if (b < 1000000000) {
        var mb = b / 1000000;
        return (mb < 10 ? mb.toFixed(1) : Math.round(mb)) + " MB";
    }
    return (b / 1000000000).toFixed(2) + " GB";
}

function fmtTime(d) {
    var h = d.getHours(), m = d.getMinutes();
    var ap = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    return h + ":" + (m < 10 ? "0" : "") + m + " " + ap;
}

var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(d) {
    if (!d) return "--";
    var t = new Date();
    if (d.toDateString() === t.toDateString()) return "Today, " + fmtTime(d);
    t.setDate(t.getDate() - 1);
    if (d.toDateString() === t.toDateString()) return "Yesterday, " + fmtTime(d);
    return MON3[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + ", " + fmtTime(d);
}

var KINDS = {
    png: "PNG image", jpg: "JPEG image", jpeg: "JPEG image",
    zip: "ZIP archive", mkv: "Matroska video", mp4: "MPEG-4 movie",
    html: "HTML document", pdf: "Portable Document Format (PDF)",
    rtf: "Rich Text Format (RTF) document", txt: "Plain text document",
    mp3: "MP3 audio file"
};

function kindLabel(n) {
    if (n.kind === "volume") return "Volume";
    if (n.kind === "folder") return "Folder";
    if (n.kind === "app") return "Application";
    if (n.kind === "shot") return "PNG image";
    return KINDS[n.ext] || "Document";
}

/* ---------- the disk ---------- */
/* the screenshots this desktop has collected */
var SHOT_TIMES = ["11.20.36"];

function shots() {
    return SHOT_TIMES.map(function (t, i) {
        var p = t.split(".");
        return node("Screen Shot 2026-09-11 at " + t + " PM", "shot", {
            bytes: 1400000 + i * 41000,
            modified: on(2026, 9, 11, +p[0], +p[1]),
            created: on(2026, 9, 11, +p[0], +p[1]),
            opened: on(2026, 9, 11, +p[0], +p[1])
        });
    });
}

var FS = folder("Macintosh HD", [
    folder("Applications", ALL_APPS.map(function (a) {
        return node(a.name, "app", {
            app: a.id, bytes: (3 + a.name.length) * 1100000,
            modified: on(2015, 8, 2, 12, 5), created: on(2015, 8, 2, 12, 5)
        });
    }), { glyph: "applications" }),
    folder("Users", [
        folder("timmytoenails", [
            folder("Desktop", shots().concat([
                node("Menu Extras.zip", "doc", {
                    bytes: 4600000, modified: ago(70), created: ago(70)
                })
            ]), { glyph: "desktop" }),
            folder("Documents", [
                node("About Stacks", "doc", {
                    bytes: 10900000, ext: "pdf",
                    modified: on(2022, 3, 28, 13, 23), created: on(2022, 3, 28, 13, 23)
                }),
                node("EaglercraftX_1.8_u53_Offline_Signed.html", "doc", {
                    bytes: 18000000, modified: on(2025, 7, 6, 13, 19), created: on(2025, 7, 6, 13, 19)
                }),
                folder("HTMLNotes", [
                    node("index.html", "doc", { bytes: 4200, modified: on(2025, 7, 6, 14, 2) })
                ])
            ], { glyph: "documents" }),
            folder("Downloads", [
                node("About Downloads", "doc", {
                    bytes: 8600000, ext: "pdf",
                    modified: on(2022, 3, 28, 13, 23), created: on(2022, 3, 28, 13, 23),
                    tags: ["Orange"]
                })
            ], { glyph: "downloads" }),
            folder("Movies", [
                node("2026-09-11 21-53-03.mkv", "doc", {
                    bytes: 412000000, modified: ago(95), created: ago(95)
                })
            ], { glyph: "movies" }),
            folder("Music", [], { glyph: "music" }),
            folder("Pictures", [
                node("wallpaper.jpg", "shot", {
                    bytes: 6400000, modified: on(2015, 6, 22, 9, 0), created: on(2015, 6, 22, 9, 0)
                })
            ], { glyph: "pictures" }),
            folder("Public", [], { glyph: "public" })
        ], { glyph: "home", home: true })
    ], { glyph: "users" }),
    folder("Library", [
        folder("CoreServices", [
            node("AddPrinter", "app", { app: "addprinter", bytes: 2400000 }),
            node("AddressBookUrlForwarder", "doc", { bytes: 900000 }),
            node("AirPlayUIAgent", "doc", { bytes: 1200000 }),
            node("AirPort Base Station Agent", "doc", { bytes: 3400000 }),
            node("AOS.bundle", "doc", { bytes: 5100000 }),
            node("AOSMigrateAgent", "doc", { bytes: 700000 }),
            node("AppDownloadLauncher", "app", { app: "app-store", bytes: 1800000 }),
            node("appleeventsd", "doc", { bytes: 300000 }),
            node("AppleFileServer", "doc", { bytes: 2200000 }),
            node("AppleGraphicsWarning", "doc", { bytes: 1100000 }),
            node("AppleIDAuthAgent", "doc", { bytes: 800000 }),
            node("AppleScript Utility", "app", { app: "automator", bytes: 1500000 }),
            node("Automator Launcher", "app", { app: "automator", bytes: 2100000 }),
            folder("Encodings", []),
            node("Expansion Slot Utility", "doc", { bytes: 1900000 })
        ])
    ], { glyph: "library" }),
    folder("System", [], { glyph: "system" })
], { kind: "volume", bytes: 121000000000 });

FS.kind = "volume";

/* every path is resolved from the disk down, so the sidebar, the Go menu
   and Spotlight all agree on what a folder is */
function fsFind(path) {
    var parts = path.split("/").filter(Boolean), n = FS;
    for (var i = 0; i < parts.length; i++) {
        if (!n.children) return null;
        var hit = null;
        for (var j = 0; j < n.children.length; j++) {
            if (n.children[j].name === parts[i]) { hit = n.children[j]; break; }
        }
        if (!hit) return null;
        n = hit;
    }
    return n;
}

var HOME = fsFind("Users/timmytoenails");
var DESKTOP = fsFind("Users/timmytoenails/Desktop");
var CORESERVICES = fsFind("Library/CoreServices");
var TRASH = folder("Trash", [], { glyph: "trash" });

function fsPath(n) {
    var parts = [];
    while (n && n !== FS) { parts.unshift(n.name); n = n.parent; }
    return parts.join("/");
}

/* the breadcrumb Get Info prints: Macintosh HD > Users > timmytoenails */
function fsWhere(n) {
    var parts = [], p = n.parent;
    while (p) { parts.unshift(p.name); p = p.parent; }
    if (!parts.length || parts[0] !== FS.name) parts.unshift(FS.name);
    return parts;
}

/* ---------- names ---------- */
/* The Finder never lets two things in a folder share a name: a second new
   folder becomes "untitled folder 2", and renaming onto a name that is
   taken is refused with an alert. */
function nameTaken(dir, name, except) {
    return (dir.children || []).some(function (c) {
        return c !== except && c.name.toLowerCase() === name.toLowerCase();
    });
}

function uniqueName(dir, base) {
    if (!nameTaken(dir, base)) return base;
    for (var i = 2; i < 999; i++) {
        if (!nameTaken(dir, base + " " + i)) return base + " " + i;
    }
    return base;
}

/* a flat walk, for Spotlight and All My Files */
function fsWalk(n, out) {
    out = out || [];
    (n.children || []).forEach(function (c) {
        out.push(c);
        if (c.children) fsWalk(c, out);
    });
    return out;
}

/* All My Files: every document in the home folder, newest first */
function allMyFiles() {
    return fsWalk(HOME).filter(function (n) {
        return n.kind === "shot" || n.kind === "doc";
    }).sort(function (a, b) { return b.modified - a.modified; });
}

/* ------------------------------------------------------------------ */
/* ARTWORK                                                             */
/* ------------------------------------------------------------------ */
/* Every stock folder has its own icon in the library, so the glyph a node
   carries is just a lookup now. */
var FOLDER_ICON = {
    desktop: "DesktopFolderIcon",
    documents: "DocumentsFolderIcon",
    downloads: "DownloadsFolder",
    movies: "MovieFolderIcon",
    music: "MusicFolderIcon",
    pictures: "PicturesFolderIcon",
    public: "PublicFolderIcon",
    home: "HomeFolderIcon",
    applications: "ApplicationsFolderIcon",
    library: "LibraryFolderIcon",
    system: "SystemFolderIcon",
    users: "UsersFolderIcon",
    utilities: "UtilitiesFolder",
    smart: "SmartFolderIcon",
    burn: "BurnableFolderIcon",
    trash: "trash",
    open: "OpenFolderIcon"
};

/* the old hand-drawn glyphs, kept only as the fallback shapes */
var FOLDER_GLYPH = {
    desktop: '<path d="M15 20h18v11H15zm2 2v7h14v-7z"/><path d="M22 31h4v3h-4z"/><path d="M18 34h12v1.6H18z"/>',
    documents: '<path d="M18 18h9l5 5v15H18zm9 1.6V23h3.4z"/>',
    downloads: '<path d="M24 17v12M19.5 24.5 24 29l4.5-4.5" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M17 32h14v2.2H17z"/>',
    movies: '<path d="M16 18h16v16H16zm2 2v2h2v-2zm10 0v2h2v-2zm-10 5v2h2v-2zm10 0v2h2v-2zm-10 5v2h2v-2zm10 0v2h2v-2zm-6-10h4v12h-4z"/>',
    music: '<path d="M29 16v12.2a3.2 3.2 0 1 1-2-2.9V20l-7 1.6v9.6a3.2 3.2 0 1 1-2-2.9V19z"/>',
    pictures: '<path d="M17 21h4l1.4-2h5.2l1.4 2h4v13H17zm7.5 2.4a4.1 4.1 0 1 0 0 8.2 4.1 4.1 0 0 0 0-8.2z"/>',
    public: '<circle cx="24" cy="21" r="3.4"/><path d="M17.5 33c0-4 3-6.4 6.5-6.4s6.5 2.4 6.5 6.4z"/>',
    home: ""
};

function folderArt(n, px) {
    var name = (n && n.glyph && FOLDER_ICON[n.glyph]) || "GenericFolderIcon";
    return sysIcon(name, px);
}

/* kept for browsers that cannot load the library at all */
function folderArtDrawn(n, px) {
    if (n && n.glyph === "home") return homeArt(px);
    var glyph = n && n.glyph && FOLDER_GLYPH[n.glyph] ? FOLDER_GLYPH[n.glyph] : "";
    return '<svg viewBox="0 0 48 42" style="width:' + px + 'px;height:' + (px * 42 / 48) + 'px">' +
        '<path d="M1 5.5A2.5 2.5 0 0 1 3.5 3h13.2l4 4.4h24.8A2.5 2.5 0 0 1 48 10v28.5a2.5 2.5 0 0 1-2.5 2.5h-43A2.5 2.5 0 0 1 0 38.5V5.5z" fill="#63a9dd"/>' +
        '<path d="M0 12.5A2.5 2.5 0 0 1 2.5 10h43a2.5 2.5 0 0 1 2.5 2.5v26A2.5 2.5 0 0 1 45.5 41h-43A2.5 2.5 0 0 1 0 38.5z" fill="#8ec8ef"/>' +
        '<g fill="#fff" opacity=".92">' + glyph + "</g></svg>";
}

function homeArt(px) {
    return '<svg viewBox="0 0 48 42" style="width:' + px + 'px;height:' + (px * 42 / 48) + 'px">' +
        '<path d="M4 20 24 4l20 16v2h-5v18H9V22H4z" fill="#f0efec" stroke="#c9c5bd"/>' +
        '<path d="M24 3 2 21l2.4 2.6L24 8l19.6 15.6L46 21z" fill="#b8853c"/>' +
        '<rect x="20" y="26" width="8" height="14" fill="#e79b2f"/>' +
        '<rect x="19" y="14" width="10" height="8" fill="#fff" stroke="#c9c5bd"/></svg>';
}

function volumeArt(n, px) {
    return sysIcon(n && n.external ? "Drive-External" : "Drive-Internal", px);
}

/* The library carries art for a few document types; anything it has no
   icon for (a PDF, a movie) keeps the drawn sheet with its badge, which
   is at least specific about what the file is. */
var DOC_ICON = {
    txt: "ClippingText", rtf: "ClippingText", md: "ClippingText",
    mp3: "ClippingSound", aiff: "ClippingSound", wav: "ClippingSound",
    png: "ClippingPicture", jpg: "ClippingPicture", jpeg: "ClippingPicture",
    html: "GenericURLIcon", url: "GenericURLIcon",
    ttf: "GenericFontIcon", otf: "GenericFontIcon",
    vcf: "VCard", kext: "KEXT", bundle: "ExecutableBinaryIcon",
    zip: "bah-zip", gz: "bah-gz", bz: "bah-bz", bz2: "bah-bz2",
    bzip2: "bah-bzip2", tar: "bah-tar", tgz: "bah-tgz", tbz: "bah-tbz",
    tbz2: "bah-tbz2", txz: "bah-txz", xz: "bah-xz", z: "bah-z",
    cpio: "bah-cpio", cpgz: "bah-cpgz", pax: "bah-pax", uu: "bah-uu",
    hqx: "bah-hqx", xip: "bah-xip", as: "bah-as", bin: "bah-bin"
};

function docArt(n, px) {
    var ext = ((n && n.ext) || "").toLowerCase();
    if (DOC_ICON[ext]) return sysIcon(DOC_ICON[ext], px);
    if (!ext) return sysIcon("GenericDocumentIcon", px);
    return docArtDrawn(n, px);
}

/* a document the library has no art for: the folded sheet with its type
   lettered across the foot */
function docArtDrawn(n, px) {
    var ext = ((n && n.ext) || "").toUpperCase();
    var badge;
    if (ext === "HTML") {
        badge = '<circle cx="24" cy="24" r="9" fill="#4b8ffa"/>' +
            '<path d="M15 24h18M24 15c2.6 3.4 2.6 14.6 0 18-2.6-3.4-2.6-14.6 0-18z" ' +
            'fill="none" stroke="#fff" stroke-width="1.3"/>';
    } else if (ext === "PDF") {
        badge = '<g fill="#c3c8cd"><rect x="12" y="20" width="24" height="2.4"/>' +
            '<rect x="12" y="26" width="24" height="2.4"/><rect x="12" y="32" width="16" height="2.4"/></g>';
    } else if (ext === "MKV" || ext === "MP4") {
        badge = '<path d="M24 12 34 34H14z" fill="#e88f2a"/><path d="M17 28h14l1.8 6H15.2z" fill="#f5a94b"/>';
    } else if (ext === "MP3") {
        badge = '<path d="M31 14v14.5a3.4 3.4 0 1 1-2.2-3.2V18l-8 1.8v11.4a3.4 3.4 0 1 1-2.2-3.2V17.4z" fill="#8d9298"/>';
    } else {
        badge = '<g fill="#cdd2d7"><rect x="12" y="20" width="24" height="2"/>' +
            '<rect x="12" y="25" width="24" height="2"/><rect x="12" y="30" width="18" height="2"/></g>';
    }
    var label = ext && ext.length <= 4 && ext !== "PDF"
        ? '<rect x="8" y="40" width="32" height="9" rx="1.5" fill="#eef0f2"/>' +
          '<text x="24" y="47" text-anchor="middle" font-family="Helvetica,Arial" ' +
          'font-size="7" font-weight="bold" fill="#8b9198">' + ext + "</text>"
        : "";
    return '<svg viewBox="0 0 48 60" style="width:' + (px * 48 / 60) + 'px;height:' + px + 'px">' +
        '<path d="M4 2h27l13 13v43H4z" fill="#fff" stroke="#b9bfc5"/>' +
        '<path d="M31 2l13 13H31z" fill="#e2e6ea" stroke="#b9bfc5"/>' +
        badge + label + "</svg>";
}

/* A screenshot previews itself.  The frame is the measured one: at the
   64px icon size it is 58 x 38 with a 3px white border, and every other
   size keeps those proportions. */
function shotArt(px) {
    var w = Math.round(px * 0.906), h = Math.round(px * 0.594);
    var b = px >= 40 ? 3 : 1;
    return '<div class="shot" style="width:' + w + 'px;height:' + h + 'px;border-width:' + b + 'px"></div>';
}

/* the artwork a file gets in Finder, on the desktop and in Spotlight */
function fileArtHTML(n, px) {
    px = px || 32;
    if (n.kind === "shot") return shotArt(px);
    if (n.kind === "volume") return volumeArt(n, px);
    if (n.kind === "folder") return folderArt(n, px);
    if (n.kind === "app") {
        var a = appById(n.app);
        if (a) return appIconHTML(a, px <= 16 ? 16 : px <= 32 ? 32 : px <= 64 ? 128 : 256);
        return sysIcon("GenericApplicationIcon", px);
    }
    return docArt(n, px);
}
