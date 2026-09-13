"use strict";
/* helpers, shared state, the icon set, and the clock tick */

function $(id) { return document.getElementById(id); }
function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
}
function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var DAYS3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var MONS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

/* ------------------------------------------------------------------ */
/* STATE                                                               */
/* ------------------------------------------------------------------ */
/* Everything a menu extra can toggle lives here so the popups can read
   their own checkmarks back out of it. */
var sys = {
    user: "Timmy Toenails",
    volume: 0.62,
    muted: false,
    bluetooth: true,
    wifi: true,
    network: "lord of the pings",
    battery: 52,
    charging: false,
    showPct: false,
    analogClock: false,
    reopenWindows: true,
    dockMagnify: true,
    dockHide: false
};

/* ------------------------------------------------------------------ */
/* ICONS                                                               */
/* ------------------------------------------------------------------ */
/* Time Machine, Bluetooth, volume and battery come from Apple's own menu
   extra artwork in assets/icons/menubar/ (see barGlyph below).  The rest
   are inline SVG traced off the reference shots, each viewBox the glyph's
   measured ink box: Wi-Fi 20x15, Spotlight 15x15, notifications 18x10. */
var ICON = {
    apple: '<svg viewBox="0 0 14 17"><path d="M11.2 9c0-1.7 1.4-2.5 1.4-2.6-.8-1.1-2-1.3-2.4-1.3-1-.1-2 .6-2.5.6s-1.3-.6-2.2-.6c-1.1 0-2.2.7-2.8 1.7C1.4 8.9 2.3 12 3.5 13.7c.6.8 1.3 1.8 2.2 1.7.9 0 1.2-.5 2.3-.5s1.4.5 2.3.5 1.5-.8 2.1-1.7c.7-.9.9-1.8 1-1.9-.1 0-1.9-.7-2.2-2.8zM9.6 3.9c.5-.6.8-1.4.7-2.2-.7 0-1.6.5-2.1 1.1-.4.5-.8 1.3-.7 2.1.8.1 1.6-.4 2.1-1z"/></svg>',

    /* three arcs on a common centre at the foot of the glyph, plus the dot */
    wifi: '<svg viewBox="0 0 20 15">' +
        '<g fill="none" stroke="currentColor" stroke-width="1.7">' +
        '<path d="M.9 5.4a13 13 0 0 1 18.2 0"/>' +
        '<path d="M4.2 9a8.3 8.3 0 0 1 11.6 0"/>' +
        '<path d="M7.3 12.3a3.8 3.8 0 0 1 5.4 0"/></g>' +
        '<circle cx="10" cy="14" r=".9"/></svg>',

    /* ring of 12px diameter with the handle running to the bottom right */
    search: '<svg viewBox="0 0 15 15">' +
        '<circle cx="5.9" cy="5.9" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
        '<path d="M9.7 9.7 14.1 14.1" fill="none" stroke="currentColor" stroke-width="2"/></svg>',

    /* a bulleted list: 2px squares at x0, bars from x4 */
    notify: '<svg viewBox="0 0 18 10"><path d="M0 0h2v2H0zm0 4h2v2H0zm0 4h2v2H0z"/>' +
        '<path d="M4 0h14v2H4zm0 4h11v2H4zm0 4h14v2H4z"/></svg>',

    lock: '<svg viewBox="0 0 8 11"><path d="M4 0a2.3 2.3 0 00-2.3 2.3V4H1v7h6V4h-.7V2.3A2.3 2.3 0 004 0zm0 1.1a1.2 1.2 0 011.2 1.2V4H2.8V2.3A1.2 1.2 0 014 1.1z"/></svg>',








    back: '<svg viewBox="0 0 14 13"><path d="M9.3 1.4L4 6.5l5.3 5.1" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    fwd: '<svg viewBox="0 0 14 13"><path d="M4.7 1.4L10 6.5l-5.3 5.1" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',

    viewIcons: '<svg viewBox="0 0 14 13"><rect x="1" y="1" width="4.5" height="4.5"/><rect x="8" y="1" width="4.5" height="4.5"/><rect x="1" y="7.5" width="4.5" height="4.5"/><rect x="8" y="7.5" width="4.5" height="4.5"/></svg>',
    viewList: '<svg viewBox="0 0 14 13"><rect x="1" y="1.5" width="12" height="1.6"/><rect x="1" y="5.7" width="12" height="1.6"/><rect x="1" y="9.9" width="12" height="1.6"/></svg>',
    viewCols: '<svg viewBox="0 0 14 13"><rect x="1" y="1" width="3.4" height="11"/><rect x="5.3" y="1" width="3.4" height="11"/><rect x="9.6" y="1" width="3.4" height="11"/></svg>',
    gear: '<svg viewBox="0 0 14 13"><circle cx="7" cy="6.5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="6.5" r="5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="1.6 1.6"/></svg>',
    share: '<svg viewBox="0 0 14 13"><path d="M7 1v7M4.4 3.4L7 .9l2.6 2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2.5 6.5v5h9v-5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    tags: '<svg viewBox="0 0 14 13"><path d="M1.5 1.5h5.2l5.8 5-5 5.2-6-5.8z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="4.3" cy="4.3" r="1"/></svg>',
    arrange: '<svg viewBox="0 0 14 13"><rect x="1" y="1.5" width="5" height="4"/><rect x="8" y="1.5" width="5" height="4"/><rect x="1" y="7.5" width="12" height="1.5"/><rect x="1" y="10.5" width="12" height="1.5"/></svg>'
};

/* the little signal-strength fan used by the Wi-Fi list */
function sigIcon(bars) {
    var s = '<svg class="sig" viewBox="0 0 15 11">';
    for (var i = 0; i < 3; i++) {
        var on = i < bars;
        var r = 3.4 + i * 3.4;
        s += '<path d="M7.5 ' + (10 - 0) + ' m-' + r + ' 0 a' + r + ' ' + r + ' 0 0 1 ' + (2 * r) + ' 0" ' +
            'fill="none" stroke-width="1.5" stroke="' + (on ? "currentColor" : "rgba(0,0,0,.22)") + '"/>';
    }
    s += '<circle cx="7.5" cy="9.6" r="1.1" fill="currentColor"/></svg>';
    return s;
}

/* ------------------------------------------------------------------ */
/* CLOCK                                                               */
/* ------------------------------------------------------------------ */
function clockText(d) {
    var h = d.getHours(), m = d.getMinutes();
    var ap = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    return DAYS3[d.getDay()] + " " + h + ":" + (m < 10 ? "0" : "") + m + " " + ap;
}

function longDate(d) {
    return DAYS[d.getDay()] + ", " + MONS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

function drawAnalog(cv, d) {
    var dpr = window.devicePixelRatio || 1, S = 17;
    cv.width = S * dpr; cv.height = S * dpr;
    var g = cv.getContext("2d");
    g.scale(dpr, dpr);
    g.translate(S / 2, S / 2);
    g.strokeStyle = "#000"; g.fillStyle = "#000";
    g.lineWidth = 1;
    g.beginPath(); g.arc(0, 0, 7.5, 0, 6.2832); g.stroke();
    var hand = function (frac, len, w) {
        var a = frac * 6.2832 - 1.5708;
        g.lineWidth = w;
        g.beginPath(); g.moveTo(0, 0);
        g.lineTo(Math.cos(a) * len, Math.sin(a) * len); g.stroke();
    };
    var mins = d.getMinutes();
    hand(((d.getHours() % 12) + mins / 60) / 12, 4, 1.4);
    hand(mins / 60, 6, 1);
}

function tick() {
    var d = new Date();
    var c = $("mbClock");
    if (sys.analogClock) {
        c.classList.add("analog");
        if (!c.firstElementChild || c.firstElementChild.tagName !== "CANVAS") {
            c.innerHTML = "";
            c.appendChild(document.createElement("canvas"));
        }
        drawAnalog(c.firstElementChild, d);
    } else {
        c.classList.remove("analog");
        c.textContent = clockText(d);
    }
    if (typeof ncRefreshDate === "function") ncRefreshDate(d);
}

setInterval(tick, 10000);

/* ------------------------------------------------------------------ */
/* BATTERY                                                             */
/* ------------------------------------------------------------------ */
/* Real hardware is asked first; a desktop with no battery falls back to
   the 52% the reference shots were taken at. */
/* Measured: a 20 x 12 body with a 1px stroke and 2px corners, a 1px gap,
   then a 2 x 5 nub.  The fill sits 2px inside the body. */
/* Apple's menu extra PDFs, converted to SVG.  Inkscape sized each page in
   px at 4/3 of its PDF points, and a point is one CSS px in the bar, so
   w/h here are the page sizes in points -- canvas padding included, which
   is what centres each glyph in its box the way the real bar does. */
function barGlyph(path, w, h) {
    return '<img class="bar-glyph" src="assets/icons/menubar/' + path + '.svg" alt="" ' +
        'style="width:' + w + "px;height:" + h + 'px">';
}

function volumeGlyph() {
    var v = sys.muted ? 0 : sys.volume;
    var n = v === 0 ? 1 : v <= 1 / 3 ? 2 : v <= 2 / 3 ? 3 : 4;
    return barGlyph("Volume/Volume" + n, 21, 16);
}

/* On power the whole glyph swaps out.  Otherwise it is the empty shell
   with the level drawn inside from Apple's three 2x8 cap slices -- left,
   a middle stretched to fit, and right -- clipped to the charge, in the
   16x8 well two points in from the shell's corner.  The slices turn red
   when the charge runs low. */
function batteryIcon() {
    if (sys.charging) {
        return sys.battery >= 100
            ? barGlyph("Displays/BatteryChargedAndPlugged", 23, 14)
            : barGlyph("Displays/BatteryCharging", 24, 14);
    }
    var w = clamp(sys.battery / 100 * 16, 0, 16);
    var cap = "Displays/BatteryLevelCap" + (sys.battery <= 10 ? "R" : "B");
    return '<span class="batt">' + barGlyph("Displays/BatteryEmpty", 23, 12) +
        '<span class="lvl" style="width:' + w.toFixed(2) + 'px">' +
        barGlyph(cap + "-L", 2, 8) +
        (w > 4 ? barGlyph(cap + "-M", 2, 8).replace('style="', 'style="transform:scaleX(' +
            ((w - 4) / 2).toFixed(3) + ");") : "") +
        barGlyph(cap + "-R", 2, 8) + "</span></span>";
}

function batteryRender() {
    var b = $("mbBattery");
    b.innerHTML = (sys.showPct ? '<span class="pct">' + Math.round(sys.battery) + "%</span>" : "") +
        batteryIcon();
    b.classList.toggle("pct-on", sys.showPct);
}

function batteryInit() {
    if (!navigator.getBattery) return;
    navigator.getBattery().then(function (bat) {
        var sync = function () {
            sys.battery = Math.round(bat.level * 100);
            sys.charging = bat.charging;
            batteryRender();
            if (menuOpenId === "battery") menuRefresh();
        };
        bat.addEventListener("levelchange", sync);
        bat.addEventListener("chargingchange", sync);
        sync();
    }).catch(function () { /* no battery: keep the reference value */ });
}

/* ------------------------------------------------------------------ */
/* SOUND                                                               */
/* ------------------------------------------------------------------ */
/* Put Back plays the Finder's copy sound.  No audio files ship with the
   sim, so it is synthesised: a short bright sweep with a little noise on
   top, which reads as the same kind of event. */
function sfxCopy() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var t0 = audioCtx.currentTime;
        var vol = sys.muted ? 0 : sys.volume * 0.07;

        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(520, t0);
        o.frequency.exponentialRampToValueAtTime(1450, t0 + 0.11);
        g.gain.setValueAtTime(vol, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t0); o.stop(t0 + 0.17);

        /* a whisper of noise so it lands like a swoosh rather than a beep */
        var n = audioCtx.createBufferSource();
        var buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.14, audioCtx.sampleRate);
        var d = buf.getChannelData(0);
        for (var i = 0; i < d.length; i++) {
            d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        }
        n.buffer = buf;
        var bp = audioCtx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(1200, t0);
        bp.frequency.exponentialRampToValueAtTime(3600, t0 + 0.12);
        var ng = audioCtx.createGain();
        ng.gain.setValueAtTime(vol * 0.5, t0);
        ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
        n.connect(bp); bp.connect(ng); ng.connect(audioCtx.destination);
        n.start(t0);
    } catch (e) { /* autoplay policy said no */ }
}
/* A short click so the volume slider and the Trash have something to say.
   Synthesised, because the sim ships no audio files. */
var audioCtx = null;
function blip(freq, ms, type) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = type || "sine";
        o.frequency.value = freq;
        var vol = sys.muted ? 0 : sys.volume * 0.09;
        g.gain.setValueAtTime(vol, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + ms / 1000);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(); o.stop(audioCtx.currentTime + ms / 1000);
    } catch (e) { /* autoplay policy said no; the sim does not care */ }
}

/* Finder truncates a long name in the middle, not at the end.  On the
   desktop and in icon view the tail keeps a non-breaking space so it stays
   on one line and the two-line clamp does not add an ellipsis of its own. */
function truncMid(name, max) {
    max = max || 28;
    if (name.length <= max) return name;
    var head = Math.round(max * 0.64), tail = max - head - 1;
    return name.slice(0, head) + "…" + name.slice(-tail).replace(/ /g, " ");
}
