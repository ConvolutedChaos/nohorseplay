"use strict";
/* ------------------------------------------------------------------ */
/* VIDEOS                                                             */
/* ------------------------------------------------------------------ */
/* Traced off ref_pic/Videos/. The library holds the titles that are
   legible in the screenshots; there are no video files behind them, so
   the player runs a real clock over the artwork rather than footage.
   Drop a file in videos/ and point a row's `art` at it and the poster
   frames light up. */

var VD_VIDEOS = [
    { t: 'Example Video', d: 'February 9, 2024', len: 24, size: '2.4 MB', dim: '1280 &times; 720' }];
/* the library sorts by title, case-blind, the way iOS does */
VD_VIDEOS.sort(function (a, b) { return a.t.toLowerCase() < b.t.toLowerCase() ? -1 : 1; });

/* a display with a music note on it -- outline for missing artwork,
   filled for the tab bar */
function vdGlyph(w) {
    var s = w / 46;
    return '<svg width="' + w + '" height="' + (38 * s).toFixed(1) + '" viewBox="0 0 46 38" aria-hidden="true">' +
        '<rect x="1" y="1" width="44" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>' +
        '<path d="M16 36h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M20 23.4V10.2l9-2v13.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
        '<circle cx="17.6" cy="23.4" r="2.6" fill="currentColor"/>' +
        '<circle cx="26.6" cy="21.4" r="2.6" fill="currentColor"/></svg>';
}
var VD_TABICON = '<svg width="30" height="26" viewBox="0 0 30 26" aria-hidden="true">' +
    '<rect x="0" y="0" width="30" height="20" rx="2.6" fill="currentColor"/>' +
    '<path d="M11 24.2h8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M13.4 14.4V6.1l5.6-1.3v8.3" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<circle cx="12.2" cy="14.7" r="1.9" fill="#fff"/>' +
    '<circle cx="17.8" cy="13.4" r="1.9" fill="#fff"/></svg>';
var VD_PLAY = '<svg width="28" height="32" viewBox="0 0 28 32" aria-hidden="true">' +
    '<path d="M2 1.5 26.5 16 2 30.5z" fill="currentColor"/></svg>';
var VD_PAUSE = '<svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true">' +
    '<path d="M1 1h8v28H1zM17 1h8v28h-8z" fill="currentColor"/></svg>';

$('vdTab1').innerHTML = $('vdTab2').innerHTML = VD_TABICON + '<span>Music Videos</span>';

function vdFmt(s) {
    s = Math.max(0, Math.round(s));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
}
function vdLenLabel(s) {
    return s < 60 ? s + ' sec' : Math.round(s / 60) + ' min';
}
function vdArt(cls, v, glyphW) {
    return '<div class="' + cls + (v.art ? ' art' : '') + '"' +
        (v.art ? ' style="background-image:url(' + v.art + ')"' : '') + '>' +
        vdGlyph(glyphW) + '</div>';
}

/* ---- the library ---------------------------------------------------- */
var vdListEl = $('vdList'), vdRootEl = $('vd-root'), vdEditing = false, vdArmed = null;

function vdRenderList() {
    var h = '';
    for (var i = 0; i < VD_VIDEOS.length; i++) {
        var v = VD_VIDEOS[i];
        h += '<div class="vd-row" data-i="' + i + '">' +
            '<div class="vd-del">Delete</div>' +
            '<div class="vd-slide">' +
            '<div class="vd-minus"></div>' +
            vdArt('vd-thumb', v, 46) +
            '<div class="vd-title">' + v.t + '</div>' +
            '</div></div>';
    }
    vdListEl.innerHTML = h;
}

function vdDisarm() {
    if (vdArmed) { vdArmed.classList.remove('armed'); vdArmed = null; }
}
function vdArm(row) {
    if (vdArmed === row) return vdDisarm();
    vdDisarm();
    row.classList.add('armed');
    vdArmed = row;
}
function vdSetEditing(on) {
    vdEditing = on;
    vdDisarm();
    vdRootEl.classList.toggle('editing', on);
    $('vdEdit').textContent = on ? 'Done' : 'Edit';
}

vdListEl.addEventListener('click', function (e) {
    var row = e.target.closest('.vd-row'); if (!row) return;
    var i = +row.dataset.i;
    if (e.target.closest('.vd-del')) {
        VD_VIDEOS.splice(i, 1);
        vdArmed = null;
        vdRenderList();
        return;
    }
    if (e.target.closest('.vd-minus')) { vdArm(row); return; }
    if (vdArmed) { vdDisarm(); return; }
    if (vdEditing) return;
    vdOpenDetail(i);
});

/* swipe left on a row reveals the same Delete button */
(function () {
    var x0 = 0, y0 = 0, live = false, row = null;
    vdListEl.addEventListener('pointerdown', function (e) {
        row = e.target.closest('.vd-row');
        x0 = e.clientX; y0 = e.clientY; live = !!row;
    });
    vdListEl.addEventListener('pointermove', function (e) {
        if (!live || !row) return;
        var dx = e.clientX - x0, dy = e.clientY - y0;
        if (Math.abs(dy) > Math.abs(dx)) { live = false; return; }
        if (dx < -26 && vdArmed !== row) { vdArm(row); live = false; }
        else if (dx > 26 && vdArmed === row) { vdDisarm(); live = false; }
    });
    vdListEl.addEventListener('pointerup', function () { live = false; });
    vdListEl.addEventListener('pointercancel', function () { live = false; });
})();

$('vdEdit').addEventListener('click', function () { vdSetEditing(!vdEditing); });

/* the Store button hands off to the iTunes Store, which is not built
   yet -- the moment it lands in APPS this starts working */
$('vdStore').addEventListener('click', function () { appHandOff('itunes'); });
function appHandOff(id) {
    if (!APPS[id]) return;
    var icon = iconFor(id);
    closeApp();
    setTimeout(function () { openApp(icon, id); }, DUR);
}

/* ---- one video ------------------------------------------------------ */
var vdCur = 0;

function vdOpenDetail(i) {
    vdCur = i;
    var v = VD_VIDEOS[i];
    $('vdDetail').innerHTML =
        vdArt('vd-hero', v, 92) +
        '<div class="vd-dtitle">' + v.t + '</div>' +
        '<div class="vd-ddate">' + v.d + '</div>' +
        '<div class="vd-dplay" id="vdDPlay">' + VD_PLAY + '</div>' +
        '<div class="vd-meta">' +
        '<div><div class="vd-mk">Length</div><div class="vd-mv">' + vdLenLabel(v.len) + '</div></div>' +
        '<div><div class="vd-mk">Size</div><div class="vd-mv">' + v.size + '</div></div>' +
        '<div><div class="vd-mk">Dimensions</div><div class="vd-mv">' + v.dim + '</div></div>' +
        '<div><div class="vd-mk">Codecs</div><div class="vd-mv">AAC, H.264</div></div>' +
        '</div>';
    $('vdDetail').scrollTop = 0;
    $('vdDPlay').addEventListener('click', function () { vdPlayerOpen(vdCur); });
    push($('vd-root'), $('vd-detail'));
}
$('vdBack').addEventListener('click', function () { pop($('vd-detail'), $('vd-root')); });

/* ---- the player ----------------------------------------------------- */
var vdT = 0, vdPlaying = false, vdTick = null, vdLast = 0, vdBareTimer = null;

function vdPlayerOpen(i) {
    vdCur = i;
    var v = VD_VIDEOS[i];
    var sc = $('vdScreen');
    sc.className = 'vd-screen' + (v.art ? ' art' : '');
    sc.style.backgroundImage = v.art ? 'url(' + v.art + ')' : '';
    sc.innerHTML = vdGlyph(92);
    vdT = 0;
    $('vdPlayer').classList.add('on');
    $('vdPlayer').classList.remove('bare');
    vdDraw();
    vdSetPlaying(true);
}
function vdPlayerClose() {
    vdSetPlaying(false);
    $('vdPlayer').classList.remove('on');
    clearTimeout(vdBareTimer);
}
$('vdDone').addEventListener('click', vdPlayerClose);

function vdSetPlaying(on) {
    vdPlaying = on;
    $('vdPlay').innerHTML = on ? VD_PAUSE : VD_PLAY;
    clearInterval(vdTick);
    clearTimeout(vdBareTimer);
    if (on) {
        vdLast = Date.now();
        vdTick = setInterval(vdStep, 100);
        vdBareTimer = setTimeout(function () { $('vdPlayer').classList.add('bare'); }, 3200);
    } else {
        $('vdPlayer').classList.remove('bare');
    }
}
function vdStep() {
    var now = Date.now();
    vdT += (now - vdLast) / 1000;
    vdLast = now;
    var len = VD_VIDEOS[vdCur].len;
    if (vdT >= len) {                       /* iOS drops back to the detail page */
        vdT = len; vdDraw();
        vdPlayerClose();
        return;
    }
    vdDraw();
}
function vdDraw() {
    var len = VD_VIDEOS[vdCur].len, f = len ? vdT / len : 0;
    $('vdElapsed').textContent = vdFmt(vdT);
    $('vdRemain').textContent = '-' + vdFmt(len - vdT);
    $('vdScrub').lastElementChild.style.left = (f * 100).toFixed(2) + '%';
    $('vdVol').lastElementChild.style.left = (vol / VOL_STEPS * 100).toFixed(2) + '%';
}

$('vdPlay').addEventListener('click', function () { vdSetPlaying(!vdPlaying); });
$('vdPrev').addEventListener('click', function () {
    if (vdT > 3 || vdCur === 0) { vdT = 0; vdDraw(); vdSetPlaying(vdPlaying); return; }
    vdPlayerOpen(vdCur - 1);
});
$('vdNext').addEventListener('click', function () {
    if (vdCur >= VD_VIDEOS.length - 1) { vdPlayerClose(); return; }
    vdPlayerOpen(vdCur + 1);
});

/* tap the picture to get the chrome out of the way */
$('vdScreen').addEventListener('click', function () {
    var p = $('vdPlayer');
    p.classList.toggle('bare');
    clearTimeout(vdBareTimer);
    if (!p.classList.contains('bare') && vdPlaying) {
        vdBareTimer = setTimeout(function () { p.classList.add('bare'); }, 3200);
    }
});

/* The stage is turned a quarter turn, so a slider that looks horizontal
   runs top-to-bottom in page coordinates -- local +x maps to screen +y. */
function vdSliderFrac(el, e) {
    var r = el.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
}
function vdDragSlider(el, onMove) {
    var live = false;
    el.addEventListener('pointerdown', function (e) {
        live = true; el.setPointerCapture(e.pointerId); onMove(vdSliderFrac(el, e));
    });
    el.addEventListener('pointermove', function (e) { if (live) onMove(vdSliderFrac(el, e)); });
    el.addEventListener('pointerup', function (e) { live = false; el.releasePointerCapture(e.pointerId); });
    el.addEventListener('pointercancel', function () { live = false; });
}
vdDragSlider($('vdScrub'), function (f) {
    vdT = f * VD_VIDEOS[vdCur].len;
    vdLast = Date.now();
    vdDraw();
    clearTimeout(vdBareTimer);
});
vdDragSlider($('vdVol'), function (f) {
    vol = Math.round(f * VOL_STEPS);
    drawVol();
    vdDraw();
});

/* ---- lifecycle ------------------------------------------------------ */
function vdOpen() {
    vdRenderList();
    vdDraw();
}
function vdReset() {
    vdPlayerClose();
    vdSetEditing(false);
    $('vd-detail').classList.remove('active');
    $('vd-root').classList.remove('behind');
    $('vd-root').classList.add('active');
    vdListEl.scrollTop = 0;
}
