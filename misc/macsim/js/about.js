"use strict";
/* About This Mac.

   Measured off the 12.59 reference shots: a 586 x 355 window whose 37px
   title bar carries a six-segment tab control, and six panes behind it.
   The numbers are this Mac's, as the sim reports them -- a 13-inch
   MacBook Pro running 10.11.6. */

var MAC = {
    model: "MacBook Pro",
    osName: "El Capitan",
    osVersion: "10.11.6",
    processor: "2.5 GHz Intel Core i5",
    memory: "4 GB 1600 MHz DDR3",
    startup: "Macintosh HD",
    graphics: "Intel HD Graphics 4000 1536 MB",
    serial: "C1MHVBV7DTY3",
    display: { name: "Built-in Display", size: "13.3-inch (1280 x 800)" },
    slots: ["2 GB", "2 GB"],
    slotNote: "Your Mac contains 2 memory slots, each of which accepts " +
        "a 1600 MHz DDR3 memory module.",
    discFormats: "CD-R, CD-RW, DVD-R, DVD+R, DVD-RW, DVD+RW, DVD-R DL, DVD+R DL"
};

var ABOUT_TABS = ["Overview", "Displays", "Storage", "Memory", "Support", "Service"];

function openAbout(tab) {
    var open = wins.filter(function (w) { return w.aboutMac; })[0];
    if (open) {
        winFocus(open);
        if (tab) aboutShow(open, tab);
        return open;
    }
    var w = winCreate({
        app: "finder", title: "", w: 586, h: 355,
        resizable: false, noZoom: true,
        x: (window.innerWidth - 586) / 2, y: 104
    });
    w.aboutMac = true;
    w.node.classList.add("about-mac");
    /* the tab control lives in the title bar */
    w.titleEl.innerHTML = '<span class="about-tabs">' + ABOUT_TABS.map(function (t) {
        return '<span class="seg" data-t="' + t + '">' + t + "</span>";
    }).join("") + "</span>";
    Array.prototype.forEach.call(w.titleEl.querySelectorAll(".seg"), function (s) {
        s.addEventListener("mousedown", function (e) {
            e.stopPropagation();
            aboutShow(w, s.dataset.t);
        });
    });
    w.body.className = "win-body about-body";
    aboutShow(w, tab || "Overview");
    return w;
}

function aboutShow(w, tab) {
    Array.prototype.forEach.call(w.titleEl.querySelectorAll(".seg"), function (s) {
        s.classList.toggle("on", s.dataset.t === tab);
    });
    w.aboutTab = tab;
    w.body.innerHTML = {
        Overview: aboutOverview, Displays: aboutDisplays, Storage: aboutStorage,
        Memory: aboutMemory, Support: aboutSupport, Service: aboutService
    }[tab]();
    aboutWire(w);
}

function aboutWire(w) {
    var click = function (sel, fn) {
        var n = w.body.querySelector(sel);
        if (n) n.addEventListener("click", fn);
    };
    click("#abSys", function () {
        openPlaceholder("finder", "System Information",
            MAC.model + " · " + MAC.processor + " · " + MAC.memory);
    });
    click("#abUpd", function () { launch("app-store"); });
    click("#abDisp", function () { launch("system-preferences"); });
    Array.prototype.forEach.call(w.body.querySelectorAll(".link"), function (a) {
        a.addEventListener("click", function () {
            if (a.textContent.indexOf("Mac Help") >= 0) openMacHelp();
            else launch("safari");
        });
    });
}

/* ---------- Overview ---------- */
function aboutOverview() {
    var row = function (k, v) {
        return '<tr><td class="k">' + esc(k) + '</td><td class="v">' + esc(v) + "</td></tr>";
    };
    return '<div class="ab-overview">' +
        '<div class="logo">' + sysIcon("SystemLogo", 140) + "</div>" +
        '<div class="info">' +
        '<h1>OS X <b>' + esc(MAC.osName) + "</b></h1>" +
        '<div class="ver">Version ' + esc(MAC.osVersion) + "</div>" +
        "<table>" +
        '<tr><td class="k"></td><td class="v model">' + esc(MAC.model) + "</td></tr>" +
        row("Processor", MAC.processor) +
        row("Memory", MAC.memory) +
        row("Startup Disk", MAC.startup) +
        row("Graphics", MAC.graphics) +
        row("Serial Number", MAC.serial) +
        "</table>" +
        '<div class="btns"><span class="btn" id="abSys">System Report…</span>' +
        '<span class="btn" id="abUpd">Software Update…</span></div></div>' +
        '<div class="legal">™ and © 1983-2016 Apple Inc. All Rights Reserved. ' +
        '<span class="link">License Agreement</span></div></div>';
}

/* ---------- Displays ---------- */
function aboutDisplays() {
    return '<div class="ab-centre">' +
        sysIcon("com.apple.macbookpro-13-retina-display", 128) +
        "<h2>" + esc(MAC.display.name) + "</h2>" +
        "<p>" + esc(MAC.display.size) + "</p>" +
        "<p>" + esc(MAC.graphics) + "</p>" +
        '<div class="foot"><span class="btn" id="abDisp">Displays Preferences…</span></div></div>';
}

/* ---------- Storage ---------- */
/* the bar is split the way the reference splits it, and the volumes are the
   ones the sim has mounted */
var STORAGE_KINDS = [
    { l: "Other", c: "#f5c73c", gb: 8.15 },
    { l: "Apps", c: "#4fc3f7", gb: 4.74 },
    { l: "Photos", c: "#ec4a7e", gb: 0.893 },
    { l: "Audio", c: "#f5a623", gb: 0.0625 },
    { l: "Movies", c: "#26a65b", gb: 0.0489 },
    { l: "Backups", c: "#9b6ef3", gb: 0.0018 }
];

function aboutVolumeRow(n, capacityGB, art, caption, kinds) {
    var used = kinds.reduce(function (a, k) { return a + k.gb; }, 0);
    var free = capacityGB - used;
    return '<div class="ab-vol">' +
        '<div class="art">' + art + '<div class="cap">' + esc(caption) + "</div></div>" +
        '<div class="bars"><div class="head"><b>' + esc(n) + "</b>" +
        "<span>" + free.toFixed(2) + " GB free of " + capacityGB.toFixed(2) + " GB</span></div>" +
        '<div class="bar">' + kinds.map(function (k) {
            return '<i style="width:' + (k.gb / capacityGB * 100).toFixed(3) +
                "%;background:" + k.c + '"></i>';
        }).join("") + "</div>" +
        '<div class="legend">' + kinds.map(function (k) {
            return '<span><em style="background:' + k.c + '"></em>' + esc(k.l) +
                "<b>" + fmtGB(k.gb) + "</b></span>";
        }).join("") + "</div></div></div>";
}

function fmtGB(gb) {
    if (gb >= 1) return gb.toFixed(2).replace(/0$/, "") + " GB";
    var mb = gb * 1000;
    return (mb >= 10 ? Math.round(mb) : mb.toFixed(1)) + " MB";
}

function aboutStorage() {
    return '<div class="ab-storage">' +
        aboutVolumeRow("Macintosh HD", 238.83, volumeArt(FS, 76),
            "240 GB Solid State SATA Drive", STORAGE_KINDS) +
        '<div class="ab-vol"><div class="art">' + sysIcon("CDAudioVolumeIcon", 76) +
        '<div class="cap">SuperDrive</div></div>' +
        '<div class="bars"><div class="head"><b>Disc formats that can be written:</b></div>' +
        "<p>" + esc(MAC.discFormats) + "</p></div></div></div>";
}

/* ---------- Memory ---------- */
function aboutMemory() {
    return '<div class="ab-memory">' +
        '<div class="top"><div class="chip"><b>' + esc(MAC.memory.split(" ")[0] + " " +
        MAC.memory.split(" ")[1]) + "</b><span>Installed</span></div>" +
        "<div class=\"note\"><p>" + esc(MAC.slotNote) + "</p>" +
        "<p>All memory slots are currently in use.</p></div></div>" +
        '<div class="slots">' + MAC.slots.map(function (s) {
            return "<div>" + esc(s) + "</div>";
        }).join("") + "</div>" +
        '<div class="foot"><span class="link">◉ Memory Upgrade Instructions</span></div></div>';
}

/* ---------- Support ---------- */
function aboutSupport() {
    var links = function (list) {
        return list.map(function (l) {
            return '<div class="link">◉ ' + esc(l) + "</div>";
        }).join("");
    };
    return '<div class="ab-support">' +
        '<div class="grp"><div class="lab">OS X Resources</div>' +
        '<div class="art apple">' + ICON.apple + "</div>" +
        '<div class="links">' + links(["Mac Help", "User Manual", "OS X Support"]) + "</div></div>" +
        '<div class="rule"></div>' +
        '<div class="grp"><div class="lab">Mac Resources</div>' +
        '<div class="art">' + sysIcon("com.apple.macbookpro-13-retina-display", 72) + "</div>" +
        '<div class="links">' +
        links(["Specifications", "Hardware Support", "Important Information…"]) +
        "</div></div></div>";
}

/* ---------- Service ---------- */
function aboutService() {
    return '<div class="ab-service">' +
        '<div class="grp"><div class="art">' + sysIcon("UtilitiesFolder", 64) + "</div>" +
        "<div class=\"body\">" +
        "<p>Every Mac comes with a one-year limited warranty and up to 90 days of " +
        "complimentary telephone technical support.</p>" +
        "<p>If you have purchased an AppleCare Protection Plan, your coverage is " +
        "extended to three years from your computer’s original purchase date.</p>" +
        "<p>Even if your coverage has expired, you may still be able to pay for any " +
        "repairs you need through an Apple-authorized technician.</p>" +
        '<div class="link">◉ Check my service and support coverage status</div>' +
        '<div class="link">◉ Show my service and repair options</div>' +
        "</div></div>" +
        '<div class="rule"></div>' +
        '<div class="grp"><div class="art">' + sysIcon("AppleCareBox", 74) + "</div>" +
        "<div class=\"body\">" +
        "<p>At any time within your initial one-year warranty period, you can extend " +
        "your service coverage up to three years from your computer’s original " +
        "purchase date with the AppleCare Protection Plan.</p>" +
        '<div class="link">◉ Tell me more about the AppleCare Protection Plan</div>' +
        "</div></div></div>";
}
