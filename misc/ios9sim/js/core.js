"use strict";
/* helpers, scale + clock tick, battery, adaptive status-bar ink, fourth wall */
"use strict";

let $ = function (id) { return document.getElementById(id); };
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* ------------------------------------------------------------------ */
/* SCALE + CLOCK                                                      */
/* ------------------------------------------------------------------ */
let stage = $('stage');
/* Windowed, the whole 376x791 body has to fit with room to breathe.
   Full screen there is no body to draw, so the 320x568 display goes
   edge to edge instead -- contained, never cropped, because a phone
   is taller than 9:16 and cropping would eat the status bar. */
function fit() {
    let s = devFull
        ? Math.min(window.innerWidth / 320, window.innerHeight / 568)
        : Math.min((window.innerWidth - 20) / 376, (window.innerHeight - 30) / 791);
    stage.style.transform = 'scale(' + s + ')';
}
window.addEventListener('resize', fit);
/* the visual viewport moves on its own when a phone's browser chrome
   slides away, and that never fires a resize */
if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
fit();      /* run again by devApply() once the saved mode is known */

var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var MONS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

function tick() {
    let d = new Date(), h = d.getHours(), m = d.getMinutes();
    let ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    let txt = h + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
    $('clock').textContent = txt; $('hsClock').textContent = txt;
    $('ncClock').textContent = txt; $('ftClock').textContent = txt;
    $('ckClock').textContent = txt; $('phClock').textContent = txt;
    $('wxClock').textContent = txt;
    $('vdClock').textContent = txt; $('vdpClock').textContent = txt;
    $('ntClock').textContent = txt;
    $('rmClock').textContent = txt;
    $('stClock').textContent = txt;
    $('itClock').textContent = txt;
    $('asClock').textContent = txt;
    $('seClock').textContent = txt;
    $('siClock').textContent = txt;
    $('suClock').textContent = txt;
    lkTick();
    if (ckReady) ckTick();
}
setInterval(tick, 5000);
/* the first tick() is fired from start.js, once every file has loaded: it
   calls lkTick(), which lives in lockscreen.js and does not exist yet here. */

/* ------------------------------------------------------------------ */
/* BATTERY                                                            */
/* ------------------------------------------------------------------ */
/* drain is %/second while unplugged -- a worse cell empties faster */
var CONDITIONS = [
    { n: 'Excellent — 100%', drain: 0.10 },
    { n: 'Good — 91%', drain: 0.30 },
    { n: 'Fair — 78%', drain: 0.90 },
    { n: 'Poor — 62%', drain: 2.50 },
    { n: 'Needs Service — 31%', drain: 8 },
    { n: 'Broken — 4%', drain: 25 },
    { n: 'Just gone — 0%', drain: 1e9 }
];
var CHARGE_RATE = 1;                     /* %/second on the charger */
var batt = { level: 100, charging: true, cond: CONDITIONS[0], dead: false };

/* set by the Clock app further down; declared here because the status
   bars and the 5-second tick both read them before it has run */
var ckReady = false, ckAlarmOn = false;

/* One geometry for every status bar, traced pixel-for-pixel off the lock
   screen photograph (ref_pic/IMG_2446.PNG, 2x). In points:
     frame  27.0 x 11.0, solid 0.5 stroke, corners ~1.2
     fill   inset 1.0 all round -> 25.0 x 9.0 at full charge
     nub    1.5 x 5.0, starting 0.5 past the frame, vertically centred
     bolt   6.0 x 10.0, sitting 3.0 after the nub  (see .sb-right gap) */
var BATT_STD = {
    w: 29, h: 11, vb: '0 0 29 11',
    body: { x: .25, y: .25, w: 26.5, h: 10.5, rx: 1.2, sw: .5, so: 1 },
    fill: { x: 1, y: 1, w: 25, h: 9, rx: .6 },
    nub: '<rect x="27.5" y="3" width="1.5" height="5" rx=".7" fill="currentColor"/>'
};
var BOLT_STD = '<svg width="6" height="10" viewBox="0 0 6.6 11" aria-hidden="true"><path d="M4.2 0 0 6h2.6L2.2 11 6.6 4.7H4z" fill="currentColor"/></svg>';

function battSVG(s, pct, charging) {
    var f = s.fill;
    var fw = Math.max(0, Math.min(100, pct)) / 100 * f.w;
    /* iOS: red when low, green on the charger, otherwise the bar's own ink */
    var col = pct <= 20 ? '#FF3B30' : (charging ? '#4CD964' : 'currentColor');
    return '<svg width="' + s.w + '" height="' + s.h + '" viewBox="' + s.vb + '" aria-hidden="true">' +
        '<rect x="' + s.body.x + '" y="' + s.body.y + '" width="' + s.body.w + '" height="' + s.body.h +
        '" rx="' + s.body.rx + '" fill="none" stroke="currentColor" stroke-width="' + s.body.sw +
        '" stroke-opacity="' + s.body.so + '"/>' +
        (fw > 0.35 ? '<rect x="' + f.x + '" y="' + f.y + '" width="' + fw.toFixed(2) +
            '" height="' + f.h + '" rx="' + Math.min(f.rx, fw / 2).toFixed(2) +
            '" fill="' + col + '"/>' : '') +
        s.nub + '</svg>';
}

/* the little clock face iOS parks left of the battery while an alarm
   is armed -- 12 pt wide, traced off ref_pic/Clock/Alarm/IMG_2493 */
var ALARM_STD = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" style="margin-right:1px">' +
    '<circle cx="6" cy="6.7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.1"/>' +
    '<path d="M6 4.3v2.5h1.8" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M2.2 1 3.7 2.4M9.8 1 8.3 2.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

/* iOS parks the Bluetooth rune left of the battery whenever the radio
   is up, and only inks it solid once something is actually connected --
   on but unconnected it sits dimmed, the way ref_pic/Settings/Bluetooth
   /IMG_2716 shows it. Read before `bt` exists at boot, so it guards. */
function btStdGlyph() {
    if (!bt || !bt.on) return '';
    return '<svg width="7" height="11" viewBox="0 0 8 12" aria-hidden="true"' +
        ' style="margin-right:1px" opacity="' + (bt.connected ? '1' : '.42') + '">' +
        '<path d="M1.4 3.6 6.6 8.4 4 11V1l2.6 2.6L1.4 8.4" fill="none" stroke="currentColor"' +
        ' stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

var STD_BARS = ['hsBatt', 'appBatt', 'ncBatt', 'ftBatt', 'lkBatt', 'ckBatt', 'phBatt', 'wxBatt', 'vdBatt', 'vdpBatt', 'ntBatt', 'rmBatt', 'stBatt', 'itBatt', 'asBatt', 'seBatt', 'siBatt', 'suBatt'];
function renderBatteries() {
    var std = (ckAlarmOn ? ALARM_STD : '') + btStdGlyph() +
        battSVG(BATT_STD, batt.level, batt.charging) + (batt.charging ? BOLT_STD : '');
    for (var i = 0; i < STD_BARS.length; i++) $(STD_BARS[i]).innerHTML = std;
}

/* ------------------------------------------------------------------ */
/* ADAPTIVE STATUS BAR INK                                            */
/* ------------------------------------------------------------------ */
/* How light the thing sitting behind each status bar is, 0=black 1=white.
   Update these if a wallpaper changes and the ink will follow. */
var BG_LUMA = {
    home: 0.12,      /* wallpaper is nearly black across the top */
    app: 0.97,      /* #F7F7F7 nav bar */
    ck: 0.97,      /* Clock's nav bar, same grey */
    ft: 0.02,      /* FaceTime is black */
    vd: 0.97,      /* Videos' nav bar, same grey */
    nt: 0.95,      /* Notes is paper all the way up */
    rm: 0.08,      /* Reminders hangs its cards off a dark strip */
    st: 0.03,      /* Stocks is black top to bottom */
    it: 0.97,      /* the store flips dark for Movies and TV Shows */
    as: 0.98,      /* #F9F9F9 chrome, and it never inverts */
    se: 0.97,      /* #F7F7F7 nav bar */
    su: 0.97,      /* Setup is the same near-white top to bottom */
    nc: 0.16,      /* blurred + darkened wallpaper */
    lockMain: 0.87,      /* #FFEC6D */
    lockPass: 0.31       /* #595317 */
};
var INK_FLIP = 0.45;    /* backdrops darker than this get light ink */
var ccP = 0;            /* how far Control Center is open, 0..1 */

/* t: 0 = dark ink, 1 = light ink. darkA is the dark end's alpha. */
function inkCss(t, darkA) {
    var v = Math.round(255 * t);
    return 'rgba(' + v + ',' + v + ',' + v + ',' + (darkA + (1 - darkA) * t).toFixed(3) + ')';
}
function inkT(luma) { return luma > INK_FLIP ? 0 : 1; }

function refreshInk() {
    var dim = ccP ? 1 - CC_DIM * ccP : 1;      /* CC darkens whatever is under it */
    $('hsStatus').style.color = inkCss(inkT(BG_LUMA.home * dim), 1);
    $('statusbar').style.color = inkCss(inkT(BG_LUMA.app * dim), 1);
    $('ckstatus').style.color = inkCss(inkT(BG_LUMA.ck * dim), 1);
    $('ftstatus').style.color = inkCss(inkT(BG_LUMA.ft * dim), 1);
    $('vdstatus').style.color = inkCss(inkT(BG_LUMA.vd * dim), 1);
    $('ntstatus').style.color = inkCss(inkT(BG_LUMA.nt * dim), 1);
    $('rmstatus').style.color = inkCss(inkT(BG_LUMA.rm * dim), 1);
    $('ststatus').style.color = inkCss(inkT(BG_LUMA.st * dim), 1);
    $('itstatus').style.color = inkCss(inkT(BG_LUMA.it * dim), 1);
    $('asstatus').style.color = inkCss(inkT(BG_LUMA.as * dim), 1);
    $('sestatus').style.color = inkCss(inkT(BG_LUMA.se * dim), 1);
    $('sustatus').style.color = inkCss(inkT(BG_LUMA.su * dim), 1);
    $('ncStatus').style.color = inkCss(inkT(BG_LUMA.nc), 1);
    /* the lock bar rides the passcode slide continuously instead of flipping */
    $('lkStatus').style.color = inkCss(lkP || 0, 0.7);
}

/* ------------------------------------------------------------------ */
/* FOURTH WALL: the charger lives outside the device                  */
/* ------------------------------------------------------------------ */
function paintFW() {
    var lvl = Math.round(batt.level), st = $('fwState');
    $('fwPct').textContent = lvl + '%';
    var bar = $('fwBar');
    bar.style.width = Math.max(0, batt.level).toFixed(1) + '%';
    bar.className = (!batt.charging && lvl <= 20) ? 'low' : '';
    if (batt.dead) { st.textContent = 'Dead'; st.className = 'fw-state low'; }
    else if (batt.charging) { st.textContent = 'Charging'; st.className = 'fw-state'; }
    else if (lvl <= 20) { st.textContent = 'Low'; st.className = 'fw-state low'; }
    else { st.textContent = 'On battery'; st.className = 'fw-state draining'; }
    $('fwPlug').textContent = batt.charging ? 'Unplug' : 'Plug In';
    $('fwPlug').classList.toggle('unplugged', !batt.charging);
}

var battShown = -1, chgShown = null, almShown = null, btShown = null;
function battSync() {
    var l = Math.round(batt.level);
    var btk = (bt && bt.on) ? (bt.connected ? 2 : 1) : 0;
    if (l !== battShown || batt.charging !== chgShown || ckAlarmOn !== almShown || btk !== btShown) {
        battShown = l; chgShown = batt.charging; almShown = ckAlarmOn; btShown = btk;
        renderBatteries();
    }
    paintFW();
}

(function () {
    var sel = $('fwCond');
    sel.innerHTML = CONDITIONS.map(function (c, i) {
        return '<option value="' + i + '">' + esc(c.n) + '</option>';
    }).join('');
    sel.selectedIndex = 0;
    sel.addEventListener('change', function () { batt.cond = CONDITIONS[+sel.value]; });
    $('fwPlug').addEventListener('click', function () {
        batt.charging = !batt.charging;
        battSync();
    });

    var last = Date.now();
    setInterval(function () {
        var now = Date.now(), dt = Math.min(1, (now - last) / 1000);
        last = now;
        if (batt.charging) batt.level = Math.min(100, batt.level + CHARGE_RATE * dt);
        else batt.level = Math.max(0, batt.level - batt.cond.drain * dt);

        if (batt.level <= 0 && !batt.charging) {
            if (!batt.dead) { batt.dead = true; setSleep(true); }   /* it powers off */
        } else if (batt.dead && batt.level >= 1) {
            batt.dead = false;
        }
        battSync();
    }, 200);
})();

/* the panel folds away with the Developer page it now lives on, so
   there is nothing left here to collapse */

renderBatteries(); paintFW(); refreshInk();
