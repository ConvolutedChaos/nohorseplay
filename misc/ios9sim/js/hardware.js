"use strict";
/* volume / power / home buttons */
/* ------------------------------------------------------------------ */
/* HARDWARE BUTTONS                                                   */
/* ------------------------------------------------------------------ */
let VOL_STEPS = 16, vol = 12, volTimer = null, asleep = false;

(function () {
    let h = '';
    for (let i = 0; i < VOL_STEPS; i++) h += '<i></i>';
    $('volBar').innerHTML = h;
})();

function drawVol() {
    let bars = $('volBar').children;
    for (let i = 0; i < VOL_STEPS; i++) bars[i].className = i < vol ? 'on' : '';
}
function showVolHud() {
    drawVol();
    $('volHud').classList.add('show');
    clearTimeout(volTimer);
    volTimer = setTimeout(function () { $('volHud').classList.remove('show'); }, 1600);
}
function bumpVol(d) {
    if (asleep) return;
    vol = Math.max(0, Math.min(VOL_STEPS, vol + d));
    showVolHud();
}

function setSleep(on) {
    if (booting) return;
    if (!on && batt.dead) return;      /* a flat battery will not wake up */
    asleep = on;
    $('sleepmask').classList.toggle('on', on);
    if (on) siriClose();      /* a sleeping device is not listening */
    if (on) {
        $('volHud').classList.remove('show');
        lkLock();              /* sleeping locks it, so waking lands on the lock screen */
    }
    /* a sleeping device has no business holding the webcam open */
    if (openAppId === 'camera') { if (on) camReset(); else camOpen(); }
}

function goHome() {
    if (booting) return;
    if (asleep) { setSleep(false); return; }
    if (siriUp) { siriClose(); return; }
    if (ccOpen) { setCC(false); return; }
    if (ncOpen) { setNC(false); return; }
    if (locked) { if (lkP > .5) lkGo(0); return; }
    if (openAppId) { closeApp(); return; }
    if (page !== 0) setPage(0);
}

function wireBtn(el, fn) {
    let down = function (e) { e.preventDefault(); el.classList.add('pressed'); fn(); };
    let up = function () { el.classList.remove('pressed'); };
    el.addEventListener('mousedown', down);
    el.addEventListener('touchstart', down, { passive: false });
    el.addEventListener('mouseup', up);
    el.addEventListener('mouseleave', up);
    el.addEventListener('touchend', up);
}
wireBtn($('btnVolUp'), function () { bumpVol(1); });
wireBtn($('btnVolDn'), function () { bumpVol(-1); });
wireBtn($('btnPower'), function () { setSleep(!asleep); });

/* Home is the one button with two jobs: a tap goes home, a press and
   hold brings Siri up and keeps the microphone open until you let go.
   So unlike the others it has to act on the release, not the press.
   Both the moulded one on the bezel and the on-screen stand-in full
   screen leaves behind are wired through here, so they behave alike. */
function wireHomeButton(el) {
    var pressing = false, tookHold = false, t = null;
    function down(e) {
        e.preventDefault();
        if (pressing) return;
        pressing = true; tookHold = false;
        el.classList.add('pressed');
        clearTimeout(t);
        t = setTimeout(function () { if (pressing && siriInvoke()) tookHold = true; }, 520);
    }
    function up() {
        if (!pressing) return;
        pressing = false;
        clearTimeout(t);
        el.classList.remove('pressed');
        if (tookHold) { siriRelease(); return; }
        goHome();
    }
    el.addEventListener('mousedown', down);
    el.addEventListener('touchstart', down, { passive: false });
    el.addEventListener('mouseup', up);
    el.addEventListener('mouseleave', up);
    el.addEventListener('touchend', up);
    el.addEventListener('touchcancel', up);
}
wireHomeButton($('home'));
wireHomeButton($('oshome'));

drawVol();
syncField();
