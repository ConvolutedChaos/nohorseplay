"use strict";
/* full screen + the on-screen home button */
/* ------------------------------------------------------------------ */
/* DEVELOPER: FULL SCREEN + THE ON-SCREEN HOME BUTTON                 */
/* ------------------------------------------------------------------ */
/* Everything that is not part of the fiction lives at the bottom of
   Settings now. The bench supply moved there wholesale; these two are
   new, and they are what make the page usable as an installed web app:
   full screen drops the aluminium and hands the window to the display,
   and the on-screen button takes over from the moulded one it hides.

   These are settings about the page rather than about the device, so
   unlike the alarms and the photo library they outlive a reload. */

var devFull = false, devSide = true;
var devHome = { style: 'pill', pos: 'center', size: 'm', look: 'light' };

var DEV_STYLE = [{ v: 'pill', n: 'Bar' }, { v: 'circle', n: 'Button' }, { v: 'none', n: 'None' }];
var DEV_POS = [{ v: 'left', n: 'Left' }, { v: 'center', n: 'Center' }, { v: 'right', n: 'Right' }];
var DEV_SIZE = [{ v: 's', n: 'Small' }, { v: 'm', n: 'Medium' }, { v: 'l', n: 'Large' }];
var DEV_LOOK = [{ v: 'light', n: 'Light' }, { v: 'dark', n: 'Dark' }];

function devHas(list, v) {
    for (var i = 0; i < list.length; i++) if (list[i].v === v) return true;
    return false;
}
function devLabel(list, v) {
    for (var i = 0; i < list.length; i++) if (list[i].v === v) return list[i].n;
    return '';
}

/* ---- remembering ---------------------------------------------------- */
var DEV_KEY = 'ios935.developer';
function devSave() {
    try {
        localStorage.setItem(DEV_KEY, JSON.stringify({
            full: devFull, side: devSide, home: devHome
        }));
    } catch (e) { /* private mode: they just do not outlive the tab */ }
}
function devLoad() {
    var raw = null, o = null;
    try { raw = localStorage.getItem(DEV_KEY); } catch (e) { return false; }
    if (!raw) return false;
    try { o = JSON.parse(raw); } catch (e) { return false; }
    if (!o || typeof o !== 'object') return false;
    if (typeof o.full === 'boolean') devFull = o.full;
    if (typeof o.side === 'boolean') devSide = o.side;
    if (o.home && typeof o.home === 'object') {
        if (devHas(DEV_STYLE, o.home.style)) devHome.style = o.home.style;
        if (devHas(DEV_POS, o.home.pos)) devHome.pos = o.home.pos;
        if (devHas(DEV_SIZE, o.home.size)) devHome.size = o.home.size;
        if (devHas(DEV_LOOK, o.home.look)) devHome.look = o.home.look;
    }
    return true;
}

/* launched from the home screen rather than a browser tab: there is no
   address bar to sit under, so full screen is the only sensible start */
function devStandalone() {
    if (window.navigator.standalone === true) return true;
    if (!window.matchMedia) return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches;
}

/* ---- applying -------------------------------------------------------- */
function devApply() {
    document.body.classList.toggle('fs', devFull);
    document.body.classList.toggle('sidebtn', devSide);
    $('oshome').className = 'st-' + devHome.style + ' ps-' + devHome.pos +
        ' sz-' + devHome.size + ' ap-' + devHome.look;
    fit();
}

/* ---- the browser's own full screen ----------------------------------- */
/* Separate from the mode above: that one hides the iPod, this one hides
   the browser. iPhone Safari has neither method, so the row is only
   offered where it would actually do something. */
function devCanBrowserFull() {
    var d = document.documentElement;
    return !!(d.requestFullscreen || d.webkitRequestFullscreen);
}
function devBrowserFull() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
}
function devSetBrowserFull(on) {
    var d = document.documentElement;
    try {
        if (on) {
            var go = d.requestFullscreen || d.webkitRequestFullscreen;
            if (go) go.call(d);
        } else {
            var out = document.exitFullscreen || document.webkitExitFullscreen;
            if (out) out.call(document);
        }
    } catch (e) { /* refused, or not allowed from here */ }
}
/* Esc leaves it without asking us, so the switch reads the browser
   rather than a flag of our own */
document.addEventListener('fullscreenchange', function () { devRender(); });
document.addEventListener('webkitfullscreenchange', function () { devRender(); });

/* ---- the Developer page ---------------------------------------------- */
function devSwitchRow(name, key, on) {
    return '<div class="se-cell"><span class="se-name">' + esc(name) + '</span>' +
        seSwitch(on, 'dev-' + key) + '</div>';
}
function devPickRow(name, key, val) {
    return '<div class="se-cell tap" data-pick="' + key + '">' +
        '<span class="se-name">' + esc(name) + '</span>' +
        '<span class="se-val">' + esc(val) + '</span>' + SE_CHEV + '</div>';
}

function devRender() {
    var el = $('seDevTop');
    if (!el) return;
    el.innerHTML =
        '<div class="se-gap"></div>' +
        '<div class="se-grp">' +
        devSwitchRow('Full Screen', 'full', devFull) +
        (devCanBrowserFull() ? devSwitchRow('Fill the Browser Window', 'bfull', devBrowserFull()) : '') +
        '</div>' +
        '<div class="se-ftr">Full Screen puts the iPod’s body away and gives the ' +
        'whole window to the display. Installed to a home screen, it starts this way.</div>' +

        '<div class="se-hdr"><span>Setup</span></div>' +
        '<div class="se-grp">' +
        '<div class="se-cell tap" data-setup="1"><span class="se-name">Run Setup Assistant</span>' + SE_CHEV + '</div>' +
        '</div>' +
        '<div class="se-ftr">Restarts the iPod into the first-run Setup Assistant, the way it ' +
        'came out of the box. The passcode chosen in there becomes the one the lock screen wants.</div>' +

        '<div class="se-hdr"><span>Home Button</span></div>' +
        '<div class="se-grp">' +
        devPickRow('Style', 'style', devLabel(DEV_STYLE, devHome.style)) +
        devPickRow('Position', 'pos', devLabel(DEV_POS, devHome.pos)) +
        devPickRow('Size', 'size', devLabel(DEV_SIZE, devHome.size)) +
        devPickRow('Appearance', 'look', devLabel(DEV_LOOK, devHome.look)) +
        devSwitchRow('Side Buttons', 'side', devSide) +
        '</div>' +
        '<div class="se-ftr">While Full Screen is on, the on-screen button stands in for the ' +
        'real one: tap for home, hold for Siri, either one wakes the iPod. It sits over the ' +
        'bottom of the display, so a corner Button keeps out of an app’s way better than ' +
        'a Bar does. None hides it and leaves the bottom edge tappable, so there is no way to ' +
        'strand yourself. Side Buttons puts sleep and volume on the display’s edges.</div>';
}

$('seDevTop').addEventListener('click', function (e) {
    var sw = e.target.closest('[data-sw]');
    if (sw) {
        var k = sw.dataset.sw.slice(4);        /* past the "dev-" */
        if (k === 'full') { devFull = !devFull; devApply(); devSave(); devRender(); }
        else if (k === 'side') { devSide = !devSide; devApply(); devSave(); devRender(); }
        else if (k === 'bfull') devSetBrowserFull(!devBrowserFull());
        return;
    }
    if (e.target.closest('[data-setup]')) { suReset(); restart(); return; }
    var pick = e.target.closest('[data-pick]');
    if (pick) devOpenPick(pick.dataset.pick);
});

function devOpen() {
    devRender();
    $('seDevBody').scrollTop = 0;
    push($('se-root'), $('se-dev'));
}
$('seDevBack').addEventListener('click', function () {
    pop($('se-dev'), $('se-root'));
    seRenderRoot();
});

/* ---- one option list, shared by all four picker rows ------------------ */
var DEV_PICKS = {
    style: {
        t: 'Style', list: DEV_STYLE,
        get: function () { return devHome.style; }, set: function (v) { devHome.style = v; }
    },
    pos: {
        t: 'Position', list: DEV_POS,
        get: function () { return devHome.pos; }, set: function (v) { devHome.pos = v; }
    },
    size: {
        t: 'Size', list: DEV_SIZE,
        get: function () { return devHome.size; }, set: function (v) { devHome.size = v; }
    },
    look: {
        t: 'Appearance', list: DEV_LOOK,
        get: function () { return devHome.look; }, set: function (v) { devHome.look = v; }
    }
};
var devPickKey = null;

function devRenderPick() {
    var p = DEV_PICKS[devPickKey];
    if (!p) return;
    var cur = p.get();
    $('seDPBody').innerHTML = '<div class="se-gap"></div><div class="se-grp">' +
        p.list.map(function (o) {
            return '<div class="se-cell tap" data-v="' + o.v + '">' +
                '<span class="se-name">' + esc(o.n) + '</span>' +
                (o.v === cur ? '<span style="color:#007AFF">' + SE_CHECK + '</span>' : '') +
                '</div>';
        }).join('') + '</div>';
}
function devOpenPick(k) {
    if (!DEV_PICKS[k]) return;
    devPickKey = k;
    $('seDPTitle').textContent = DEV_PICKS[k].t;
    devRenderPick();
    $('seDPBody').scrollTop = 0;
    push($('se-dev'), $('se-devpick'));
}
$('seDPBack').addEventListener('click', function () {
    pop($('se-devpick'), $('se-dev'));
});
$('seDPBody').addEventListener('click', function (e) {
    var r = e.target.closest('[data-v]');
    if (!r || !DEV_PICKS[devPickKey]) return;
    DEV_PICKS[devPickKey].set(r.dataset.v);
    devApply(); devSave();
    devRenderPick(); devRender();
});

/* ---- boot ------------------------------------------------------------- */
if (!devLoad() && devStandalone()) devFull = true;
devApply();
devRender();
