"use strict";
/* ------------------------------------------------------------------ */
/* LOCK SCREEN                                                        */
/* ------------------------------------------------------------------ */
var PASSCODE = '1234';          /* <- the four digits that unlock it */

var lockEl = $('lock'), lkMain = $('lkMain'), lkPass = $('lkPass'), lkBlur = $('lkBlur'),
    lkStatus = $('lkStatus'), lkDots = $('lkDots'), lkFail = $('lkFail'), lkCancel = $('lkCancel');
var locked = false, lkP = 0, lkCode = '', lkFails = 0;

var LK_KEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'],
['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['0', '']];
var LK_COLX = [65, 160, 255], LK_ROWY = [200, 288, 376, 464];
$('lkKeys').innerHTML = LK_KEYS.map(function (k, i) {
    var col = i === 9 ? 1 : i % 3, row = i === 9 ? 3 : (i / 3) | 0;
    return '<div class="lk-key" data-d="' + k[0] + '" style="left:' + (LK_COLX[col] - 37.5) +
        'px;top:' + (LK_ROWY[row] - 37.5) + 'px"><b>' + k[0] + '</b><i>' + k[1] + '</i></div>';
}).join('');
lkDots.innerHTML = [105, 141.5, 178, 214.5].map(function (x) {
    return '<i style="left:' + (x - 6) + 'px"></i>';
}).join('');

/* ---- the two-page slider: 0 = lock screen, 1 = passcode ---- */
function lkPaint(p) {
    lkP = p;
    lkMain.style.transform = 'translateX(' + (p * 320) + 'px)';
    lkPass.style.transform = 'translateX(' + (-320 + p * 320) + 'px)';
    lkBlur.style.opacity = p;
    refreshInk();          /* status ink rides the slide, black -> white */
}
function lkAnim(on) {
    var t = on ? 'transform .32s cubic-bezier(.32,.72,0,1)' : 'none';
    var o = on ? 'opacity .32s cubic-bezier(.32,.72,0,1)' : 'none';
    lkMain.style.transition = t; lkPass.style.transition = t;
    lkBlur.style.transition = o;
    /* while dragging, the ink is set per-frame, so kill its own transition */
    lkStatus.classList.toggle('nofade', !on);
}
function lkGo(p) { lkAnim(true); lkPaint(p); if (!p) lkClear(); }

/* ---- passcode ---- */
function lkDrawDots() {
    var d = lkDots.children;
    for (var i = 0; i < 4; i++) d[i].className = i < lkCode.length ? 'f' : '';
    lkCancel.textContent = lkCode.length ? 'Delete' : 'Cancel';
}
function lkClear() { lkCode = ''; lkDrawDots(); }
function lkBack() { if (lkCode.length) { lkCode = lkCode.slice(0, -1); lkDrawDots(); } }

function lkPress(d) {
    if (lkCode.length >= 4) return;
    lkCode += d;
    lkDrawDots();
    if (lkCode.length === 4) setTimeout(lkCheck, 140);
}
function lkCheck() {
    if (lkCode === PASSCODE) { lkUnlock(); return; }
    lkFails++;
    lkFail.textContent = lkFails + ' Failed Passcode Attempt' + (lkFails > 1 ? 's' : '');
    lkFail.classList.add('on');
    lkDots.classList.remove('bad');
    void lkDots.offsetWidth;                 /* restart the shake */
    lkDots.classList.add('bad');
    setTimeout(lkClear, 420);
}

/* idempotent: sleeping again also settles a half-lifted camera peek
   and drops the passcode pad back off-screen */
function lkLock() {
    locked = true;
    lockEl.style.transition = 'none';
    lockEl.style.transform = 'none';
    lockEl.style.opacity = '';
    lkAnim(false); lkPaint(0); lkClear();
    lkFails = 0; lkFail.classList.remove('on');
    lockEl.classList.add('on');
    lkTick();
}
function lkUnlock() {
    locked = false;
    lockEl.style.transition = 'opacity .34s ease-out, transform .34s ease-out';
    lockEl.style.transform = 'scale(1.06)';
    lockEl.style.opacity = '0';
    setTimeout(function () {
        if (locked) return;
        lockEl.classList.remove('on');
        lockEl.style.transition = 'none';
        lockEl.style.transform = 'none';
        lockEl.style.opacity = '';
        lkAnim(false); lkPaint(0); lkClear();
        lkFails = 0; lkFail.classList.remove('on');
        lkWhy(false);        /* asked and answered; it is a restart-only line */
    }, 360);
}

function lkTick() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    h = h % 12; if (h === 0) h = 12;
    $('lkClock').textContent = h + ':' + (m < 10 ? '0' : '') + m;
    $('lkDate').textContent = DAYS[d.getDay()] + ', ' + MONS[d.getMonth()] + ' ' + d.getDate();
}

$('lkKeys').addEventListener('click', function (e) {
    var k = e.target.closest('.lk-key');
    if (k && !lkSwallow) lkPress(k.dataset.d);
});
lkCancel.addEventListener('click', function () {
    if (lkSwallow) return;
    if (lkCode.length) lkBack(); else lkGo(0);
});

/* ---- swipe right: drag the passcode pad in from the left ---- */
var lkDrag = null, lkSwallow = false;

lockEl.addEventListener('pointerdown', function (e) {
    if (!locked || asleep) return;
    if (e.target.closest('#lkCam, .lk-key, .lk-cancel')) return;
    var r = screenEl.getBoundingClientRect(), y = (e.clientY - r.top) / scaleNow();
    if (y < 16 || y > 552) return;         /* leave the NC / CC edges alone */
    lkDrag = { x0: e.clientX, y0: e.clientY, from: lkP, live: false };
});
window.addEventListener('pointermove', function (e) {
    if (!lkDrag) return;
    var sc = scaleNow();
    var dx = (e.clientX - lkDrag.x0) / sc, dy = (e.clientY - lkDrag.y0) / sc;
    if (!lkDrag.live) {
        if (Math.abs(dx) < 9) { if (Math.abs(dy) > 12) lkDrag = null; return; }
        if (Math.abs(dy) > Math.abs(dx)) { lkDrag = null; return; }
        lkDrag.live = true; lkSwallow = true; lkAnim(false);
    }
    if (e.cancelable) e.preventDefault();
    lkPaint(Math.max(0, Math.min(1, lkDrag.from + dx / 320)));
}, { passive: false });
window.addEventListener('pointerup', function (e) {
    if (!lkDrag) return;
    var live = lkDrag.live, dx = (e.clientX - lkDrag.x0) / scaleNow();
    lkDrag = null;
    if (!live) return;
    setTimeout(function () { lkSwallow = false; }, 0);
    if (dx > 55) lkGo(1);
    else if (dx < -55) lkGo(0);
    else lkGo(lkP > .5 ? 1 : 0);
});

/* ---- camera handle: lifts the lock screen, then springs back ---- */
var camDrag = null;
function camLift(px) { lockEl.style.transform = px ? 'translateY(' + (-px) + 'px)' : 'none'; }
function camSpring() { lockEl.style.transition = 'transform .44s cubic-bezier(.22,.9,.3,1.15)'; camLift(0); }

$('lkCam').addEventListener('pointerdown', function (e) {
    if (!locked || lkP > 0) return;
    camDrag = { y0: e.clientY, live: false };
});
window.addEventListener('pointermove', function (e) {
    if (!camDrag) return;
    var dy = (e.clientY - camDrag.y0) / scaleNow();
    if (!camDrag.live) {
        if (dy > -8) return;
        camDrag.live = true; lkSwallow = true;
        lockEl.style.transition = 'none';
    }
    if (e.cancelable) e.preventDefault();
    camLift(Math.min(150, Math.max(0, -dy) * 0.55));
}, { passive: false });
window.addEventListener('pointerup', function () {
    if (!camDrag) return;
    var live = camDrag.live;
    camDrag = null;
    if (live) { setTimeout(function () { lkSwallow = false; }, 0); camSpring(); return; }
    /* a tap just bounces it, the way iOS does when there is nowhere to go */
    lockEl.style.transition = 'transform .16s ease-out';
    camLift(30);
    setTimeout(camSpring, 170);
});
