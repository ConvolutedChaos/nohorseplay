"use strict";
/* ================================================================== */
/* CAMERA                                                             */
/* ------------------------------------------------------------------ */
/* The preview is the user's real webcam; captures are drawn through a
   canvas (crop, mirror, filter) and land in the same IndexedDB store
   the Photos app reads, so a shot taken here shows up in the Camera
   Roll straight away.  The device has no flash, so "flash" is exactly
   what the brief asked for: the whole screen goes white.             */

var CAM_ICON = {
    bolt: function (on) {
        return '<svg width="22" height="25" viewBox="0 0 22 26" aria-hidden="true">' +
            '<path d="M12.6 1 4 14.4h5.2L8.4 25 17 11.2h-5.2z" fill="' + (on ? '#FFCC00' : '#fff') + '"/>' +
            (on ? '' : '<path d="M2.6 2.2 19.4 23.8" stroke="#000" stroke-width="4.4" ' +
                'stroke-linecap="round"/><path d="M2.6 2.2 19.4 23.8" stroke="#fff" ' +
                'stroke-width="1.8" stroke-linecap="round"/>') + '</svg>';
    },
    hdr: function (on) {
        return '<svg width="22" height="14" viewBox="0 0 34 20" aria-hidden="true">' +
            '<text x="17" y="15.5" text-anchor="middle" font-family="' +
            '-apple-system,Helvetica,Arial" font-size="15" font-weight="600" fill="' +
            (on ? '#FFCC00' : '#fff') + '">HDR</text>' +
            (on ? '' : '<path d="M3 18 31 2" stroke="#000" stroke-width="4.2" ' +
                'stroke-linecap="round"/><path d="M3 18 31 2" stroke="#fff" ' +
                'stroke-width="1.7" stroke-linecap="round"/>') + '</svg>';
    },
    timer: function (on) {
        var c = on ? '#FFCC00' : '#fff';
        return '<svg width="24" height="24" viewBox="0 0 26 26" aria-hidden="true">' +
            '<path d="M13 2.6a10.4 10.4 0 1 0 7.4 3.1" fill="none" stroke="' + c +
            '" stroke-width="1.8" stroke-linecap="round"/>' +
            '<path d="M17.4 1.6 21.2 5.4 17.4 9" fill="none" stroke="' + c +
            '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M13 13 13 7.6" stroke="' + c + '" stroke-width="1.8" ' +
            'stroke-linecap="round"/></svg>';
    },
    swap: '<svg width="24" height="21" viewBox="0 0 28 24" aria-hidden="true">' +
        '<rect x="1" y="2.6" width="26" height="19.4" rx="3.4" fill="none" ' +
        'stroke="#fff" stroke-width="1.8"/>' +
        '<path d="M9.6 12.4a4.4 4.4 0 0 1 7.5-3.1" fill="none" stroke="#fff" ' +
        'stroke-width="1.7" stroke-linecap="round"/>' +
        '<path d="M18.4 12.4a4.4 4.4 0 0 1-7.5 3.1" fill="none" stroke="#fff" ' +
        'stroke-width="1.7" stroke-linecap="round"/>' +
        '<path d="M14.6 6.6h2.8v2.8M13.4 18.2h-2.8v-2.8" fill="none" stroke="#fff" ' +
        'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

/* Core Image's names, approximated with the filters a canvas has */
var CAM_FILTERS = [
    { k: 'mono', n: 'Mono', f: 'grayscale(1) contrast(1.06)' },
    { k: 'tonal', n: 'Tonal', f: 'grayscale(1) contrast(.82) brightness(1.06)' },
    { k: 'noir', n: 'Noir', f: 'grayscale(1) contrast(1.4) brightness(.94)' },
    { k: 'fade', n: 'Fade', f: 'saturate(.7) contrast(.82) brightness(1.12) sepia(.14)' },
    { k: 'none', n: 'None', f: '' },
    { k: 'chrome', n: 'Chrome', f: 'saturate(1.4) contrast(1.14) brightness(1.02)' },
    { k: 'process', n: 'Process', f: 'saturate(1.2) contrast(1.06) hue-rotate(12deg) sepia(.12)' },
    { k: 'transfer', n: 'Transfer', f: 'sepia(.4) saturate(1.5) contrast(1.04) brightness(1.04)' },
    { k: 'instant', n: 'Instant', f: 'sepia(.3) saturate(.9) contrast(.88) brightness(1.14) hue-rotate(-8deg)' }
];

var CAM_MODES = [
    { k: 'lapse', n: 'TIME-LAPSE' },
    { k: 'video', n: 'VIDEO' },
    { k: 'photo', n: 'PHOTO' },
    { k: 'square', n: 'SQUARE' },
    { k: 'pano', n: 'PANO' }
];

var cam = {
    mode: 'photo', flash: 'off', hdr: false, timer: 0, front: false,
    filter: 'none', filters: false, rec: false, t0: 0, busy: false,
    stream: null, devices: [], devIx: 0, picker: null
};
var camEl = $('camapp'), camVid = $('camVideo');

/* ---- the live stream ------------------------------------------------ */
function camStop() {
    if (cam.stream) {
        cam.stream.getTracks().forEach(function (t) { t.stop(); });
        cam.stream = null;
    }
    camVid.srcObject = null;
}

function camStart() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        camFail('This browser will not hand over a camera.');
        return;
    }
    camStop();
    var want = { width: { ideal: 1280 }, height: { ideal: 960 } };
    if (cam.devices.length > 1 && cam.devices[cam.devIx]) want.deviceId = { exact: cam.devices[cam.devIx].deviceId };
    else want.facingMode = cam.front ? 'user' : 'environment';
    navigator.mediaDevices.getUserMedia({ video: want, audio: false }).then(function (s) {
        cam.stream = s;
        camVid.srcObject = s;
        camEl.classList.remove('nocam');
        /* labels only arrive once permission is granted, so enumerate late */
        if (!cam.devices.length && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then(function (ds) {
                cam.devices = ds.filter(function (d) { return d.kind === 'videoinput'; });
            });
        }
        camPaint();
    }, function (err) {
        camFail(err && err.name === 'NotAllowedError'
            ? 'Allow camera access to use the Camera.'
            : 'No camera was found on this device.');
    });
}
function camFail(msg) {
    camStop();
    $('camMsgSub').textContent = msg;
    camEl.classList.add('nocam');
}
$('camRetry').addEventListener('click', camStart);

/* ---- chrome --------------------------------------------------------- */
function camPaint() {
    CAM_MODES.forEach(function (m) { camEl.classList.toggle('m-' + m.k, m.k === cam.mode); });
    camEl.classList.toggle('front', cam.front);
    camEl.classList.toggle('rec', cam.rec);
    camEl.classList.toggle('filters', cam.filters);

    $('camFlashBtn').innerHTML = CAM_ICON.bolt(cam.flash !== 'off');
    $('camPillFlash').innerHTML = CAM_ICON.bolt(cam.flash !== 'off');
    $('camHdrBtn').innerHTML = CAM_ICON.hdr(cam.hdr);
    $('camTimerBtn').innerHTML = CAM_ICON.timer(!!cam.timer) +
        (cam.timer ? '<em>' + cam.timer + 's</em>' : '');
    $('camSwapBtn').innerHTML = CAM_ICON.swap;
    $('camPillSwap').innerHTML = CAM_ICON.swap;

    var chips = [];
    if (cam.flash === 'on') chips.push({ svg: 1 });
    else if (cam.flash === 'auto') chips.push({ svg: 1, t: 'Auto' });
    if (cam.hdr) chips.push({ t: 'HDR' });
    var badge = $('camBadge');
    badge.classList.toggle('up', chips.length > 0 && !cam.filters && cam.mode !== 'video' && cam.mode !== 'lapse');
    badge.innerHTML = chips.map(function (c) {
        return '<b>' +
            (c.svg ? '<svg width="9" height="14" viewBox="0 0 12 18"><path d="M7 0 1 8h3.4L3.6 18 10 7.4H6.4z" fill="#000"/></svg>' : '') +
            (c.t ? '<span>' + c.t + '</span>' : '') + '</b>';
    }).join('');

    camPaintModes();
    camPaintThumb();
}

function camPaintModes() {
    var row = $('camModeRow');
    var sel = 0;
    CAM_MODES.forEach(function (m, i) { if (m.k === cam.mode) sel = i; });
    row.innerHTML = CAM_MODES.map(function (m, i) {
        return '<div class="cam-mode' + (i === sel ? ' on' : '') +
            (Math.abs(i - sel) > 1 ? ' far' : '') + '" data-k="' + m.k + '">' + m.n + '</div>';
    }).join('');
    /* slide the wheel so the chosen mode sits under the shutter */
    var on = row.querySelector('.cam-mode.on');
    if (on) row.style.transform = 'translateX(' + (-(on.offsetLeft + on.offsetWidth / 2)) + 'px)';
}

function camPaintThumb() {
    var live = (typeof LIB !== 'undefined' && LIB.photos) ? LIB.photos.filter(function (p) {
        return !p.deleted;
    }) : [];
    var last = live[live.length - 1];
    $('camThumb').innerHTML = last ? '<img src="' + phThumbURL(last) + '" alt="">' : '';
}

/* ---- drawing a frame ------------------------------------------------ */
function camFilterCSS() {
    var f = CAM_FILTERS.filter(function (x) { return x.k === cam.filter; })[0];
    var s = f ? f.f : '';
    /* HDR here is a gentle shadow lift, not a real bracket */
    if (cam.hdr) s += ' contrast(.93) saturate(1.06) brightness(1.04)';
    return s.trim();
}

/* centre-crop the camera frame to the aspect the mode wants */
function camGrab(aspect, maxW, filter) {
    var vw = camVid.videoWidth, vh = camVid.videoHeight;
    if (!vw || !vh) return null;
    var sw = vw, sh = Math.round(vw / aspect);
    if (sh > vh) { sh = vh; sw = Math.round(vh * aspect); }
    var sx = (vw - sw) / 2, sy = (vh - sh) / 2;
    var w = Math.min(maxW, sw), h = Math.round(w / aspect);
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    if (filter !== undefined) g.filter = filter || 'none';
    else { var f = camFilterCSS(); if (f) g.filter = f; }
    if (cam.front) { g.translate(w, 0); g.scale(-1, 1); }
    g.drawImage(camVid, sx, sy, sw, sh, 0, 0, w, h);
    return c;
}

function camAspect() {
    if (cam.mode === 'square') return 1;
    if (cam.mode === 'video' || cam.mode === 'lapse') return 16 / 9;
    if (cam.mode === 'pano') return 3 / 4;
    return 4 / 3;
}

/* ---- writing into the library --------------------------------------- */
function camSave(blob, w, h, kind, dur, cb) {
    if (!PH_DB) { if (cb) cb(); return; }
    var rec = {
        name: (kind === 'video' ? 'VID' : 'IMG') + '_' + Date.now() +
            (kind === 'video' ? '.webm' : '.jpg'),
        type: blob.type, blob: blob, w: w, h: h, fav: 0, deleted: 0,
        taken: Date.now(), added: Date.now(), dur: dur || 0,
        kind: kind || (cam.front ? 'selfie' : 'photo'), exif: false
    };
    var src = kind === 'video' ? camPoster : null;
    var mk = src ? Promise.resolve(src) : createImageBitmap(blob).then(function (bm) {
        return phMakeThumb(bm, w, h).then(function (t) { bm.close && bm.close(); return t; });
    });
    mk.then(function (thumb) {
        rec.thumb = thumb;
        var tx = phTx(['photos'], 'readwrite');
        tx.objectStore('photos').add(rec);
        tx.oncomplete = function () {
            phLoad(function () {
                phRepaint(); phToBottom(); phFw(); camPaintThumb();
                if (cb) cb();
            });
        };
        tx.onerror = function () { if (cb) cb(); };
    }, function () { if (cb) cb(); });
}
var camPoster = null;

/* ---- the shutter ----------------------------------------------------- */
function camFlashScreen() {
    var el = $('camWhite');
    el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
}
function camBlink() {
    var el = $('camBlink');
    el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
}

function camWantsFlash() {
    if (cam.flash === 'on') return true;
    if (cam.flash !== 'auto') return false;
    /* Auto: sample the frame and fire when the scene is dark */
    var c = camGrab(1, 32, 'none');
    if (!c) return false;
    var d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, sum = 0;
    for (var i = 0; i < d.length; i += 4) sum += (d[i] + d[i + 1] + d[i + 2]) / 3;
    return (sum / (d.length / 4)) < 70;
}

function camShoot() {
    if (cam.busy || camEl.classList.contains('nocam')) return;
    cam.busy = true;
    var fire = camWantsFlash();
    if (fire) camFlashScreen();
    camBlink();
    /* let the white actually land on the frame before grabbing it */
    setTimeout(function () {
        var c = camGrab(camAspect(), 1600);
        if (!c) { cam.busy = false; return; }
        c.toBlob(function (b) {
            if (!b) { cam.busy = false; return; }
            camSave(b, c.width, c.height, cam.front ? 'selfie' : 'photo', 0,
                function () { cam.busy = false; });
        }, 'image/jpeg', 0.92);
    }, fire ? 90 : 40);
}

/* the self-timer counts down over the frame, then fires */
function camCountdown(n, done) {
    var el = $('camCount');
    el.classList.add('up');
    (function tickDown() {
        el.textContent = n;
        if (n <= 0) { el.classList.remove('up'); done(); return; }
        n--;
        setTimeout(tickDown, 1000);
    })();
}

function camPress() {
    if (cam.mode === 'video' || cam.mode === 'lapse') { camToggleRec(); return; }
    if (cam.mode === 'pano') { camPano(); return; }
    if (cam.timer) {
        if (cam.busy) return;
        cam.busy = true;
        camCountdown(cam.timer, function () { cam.busy = false; camShoot(); });
        return;
    }
    camShoot();
}

/* ---- filters -------------------------------------------------------- */
var camGridTimer = null;
function camBuildGrid() {
    $('camGrid').innerHTML = CAM_FILTERS.map(function (f) {
        return '<div class="cam-ftile' + (f.k === cam.filter ? ' on' : '') + '" data-k="' + f.k + '">' +
            '<canvas width="120" height="160"></canvas><span>' + f.n + '</span></div>';
    }).join('');
}
function camDrawGrid() {
    var tiles = $('camGrid').children;
    for (var i = 0; i < tiles.length; i++) {
        var cv = tiles[i].querySelector('canvas'), g = cv.getContext('2d');
        var src = camGrab(cv.width / cv.height, 240, CAM_FILTERS[i].f);
        g.clearRect(0, 0, cv.width, cv.height);
        if (src) g.drawImage(src, 0, 0, cv.width, cv.height);
    }
}
function camSetFilters(on) {
    cam.filters = on;
    camEl.classList.toggle('filters', on);
    if (on) {
        camBuildGrid(); camDrawGrid();
        camGridTimer = setInterval(camDrawGrid, 260);
    } else {
        clearInterval(camGridTimer); camGridTimer = null;
    }
    camPaint();
}
$('camGrid').addEventListener('click', function (e) {
    var t = e.target.closest('.cam-ftile'); if (!t) return;
    cam.filter = t.dataset.k;
    camSetFilters(false);
    camVid.style.filter = camFilterCSS();
});

/* ---- flash / timer option rows -------------------------------------- */
function camOpenPicker(which) {
    if (cam.picker === which) { camClosePicker(); return; }
    cam.picker = which;
    var opts = which === 'flash'
        ? [['off', 'Off'], ['on', 'On'], ['auto', 'Auto']]
        : [['0', 'Off'], ['3', '3s'], ['10', '10s']];
    var cur = which === 'flash' ? cam.flash : String(cam.timer);
    $('camPicker').innerHTML = opts.map(function (o) {
        return '<span class="cam-opt' + (o[0] === cur ? ' on' : '') + '" data-v="' + o[0] + '">' +
            o[1] + '</span>';
    }).join('');
    $('camPicker').classList.add('up');
}
function camClosePicker() {
    cam.picker = null;
    $('camPicker').classList.remove('up');
}
$('camPicker').addEventListener('click', function (e) {
    var o = e.target.closest('.cam-opt'); if (!o) return;
    if (cam.picker === 'flash') cam.flash = o.dataset.v;
    else cam.timer = +o.dataset.v;
    camClosePicker();
    camPaint();
});

/* ---- video + time-lapse ---------------------------------------------- */
var camRecorder = null, camChunks = [], camClockTimer = null;
var camLapseFrames = [], camLapseTimer = null;

function camFmtClock(ms) {
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = s % 60;
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(h) + ':' + p(m) + ':' + p(ss);
}
function camRunClock() {
    $('camClock').textContent = camFmtClock(Date.now() - cam.t0);
}

function camMime() {
    var want = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
    for (var i = 0; i < want.length; i++) {
        if (window.MediaRecorder && MediaRecorder.isTypeSupported(want[i])) return want[i];
    }
    return '';
}

function camToggleRec() {
    if (cam.rec) { camStopRec(); return; }
    if (camEl.classList.contains('nocam') || cam.busy) return;
    if (!window.MediaRecorder) { camFail('This browser cannot record video.'); return; }
    cam.rec = true; cam.t0 = Date.now();
    camEl.classList.add('rec');
    $('camClock').textContent = '00:00:00';
    camClockTimer = setInterval(camRunClock, 250);

    if (cam.mode === 'lapse') {
        /* hold on to one frame every 400 ms and speed them up later */
        camLapseFrames = [];
        camLapseTimer = setInterval(function () {
            if (camLapseFrames.length >= 240) return;
            var c = camGrab(16 / 9, 640);
            if (c) camLapseFrames.push(c);
        }, 400);
        return;
    }

    camChunks = [];
    var opts = {}; var mt = camMime(); if (mt) opts.mimeType = mt;
    try { camRecorder = new MediaRecorder(cam.stream, opts); }
    catch (err) { cam.rec = false; camEl.classList.remove('rec'); return; }
    camRecorder.ondataavailable = function (e) { if (e.data && e.data.size) camChunks.push(e.data); };
    camRecorder.onstop = function () {
        var blob = new Blob(camChunks, { type: camChunks.length ? camChunks[0].type : 'video/webm' });
        var dur = Math.max(1, Math.round((Date.now() - cam.t0) / 1000));
        camFinishVideo(blob, dur);
    };
    camRecorder.start(500);
}

function camStopRec() {
    if (!cam.rec) return;
    cam.rec = false;
    camEl.classList.remove('rec');
    clearInterval(camClockTimer); camClockTimer = null;
    $('camClock').textContent = '00:00:00';

    if (cam.mode === 'lapse') {
        clearInterval(camLapseTimer); camLapseTimer = null;
        camRenderLapse();
        return;
    }
    if (camRecorder && camRecorder.state !== 'inactive') camRecorder.stop();
    camRecorder = null;
}

/* a poster frame, so the video reads properly in the Photos grid */
function camMakePoster(src, w, h, cb) {
    phMakeThumb(src, w, h).then(cb);
}

function camFinishVideo(blob, dur) {
    cam.busy = true;
    var c = camGrab(16 / 9, 640);
    camMakePoster(c || document.createElement('canvas'), c ? c.width : 16, c ? c.height : 9,
        function (thumb) {
            camPoster = thumb;
            camSave(blob, 1280, 720, 'video', dur, function () {
                camPoster = null; cam.busy = false;
            });
        });
}

/* replay the held frames into a canvas at 30 fps and record that */
function camRenderLapse() {
    var frames = camLapseFrames; camLapseFrames = [];
    if (frames.length < 2 || !window.MediaRecorder) return;
    cam.busy = true;
    var w = frames[0].width, h = frames[0].height;
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    var g = cv.getContext('2d');
    var stream = cv.captureStream(30), chunks = [];
    var opts = {}; var mt = camMime(); if (mt) opts.mimeType = mt;
    var rec;
    try { rec = new MediaRecorder(stream, opts); }
    catch (err) { cam.busy = false; return; }
    rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = function () {
        var blob = new Blob(chunks, { type: chunks.length ? chunks[0].type : 'video/webm' });
        camPoster = null;
        phMakeThumb(frames[frames.length - 1], w, h).then(function (t) {
            camPoster = t;
            camSave(blob, w, h, 'video', Math.max(1, Math.round(frames.length / 30)), function () {
                camPoster = null; cam.busy = false;
            });
        });
    };
    g.drawImage(frames[0], 0, 0);
    rec.start();
    var i = 0;
    var step = setInterval(function () {
        if (i >= frames.length) {
            clearInterval(step);
            setTimeout(function () { if (rec.state !== 'inactive') rec.stop(); }, 120);
            return;
        }
        g.drawImage(frames[i++], 0, 0);
    }, 33);
}

/* ---- panorama --------------------------------------------------------
   No reference shot for this one, so it keeps to the shape iOS uses: a
   guide line with a travelling arrow, and a sweep that stitches the
   centre column of successive frames into one wide picture. */
function camPano() {
    if (cam.rec || cam.busy) return;
    cam.rec = true;
    camEl.classList.add('rec');
    var W = 1600, H = 600, x = 0, STRIP = 12;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var g = cv.getContext('2d');
    var arrow = document.querySelector('.pano-arrow');
    var stop = function () {
        clearInterval(t);
        cam.rec = false;
        camEl.classList.remove('rec');
        arrow.style.transform = '';
        $('camShutter').removeEventListener('click', stop);
        cv.toBlob(function (b) {
            if (b) camSave(b, x || W, H, cam.front ? 'selfie' : 'photo', 0,
                function () { cam.busy = false; });
            else cam.busy = false;
        }, 'image/jpeg', 0.9);
    };
    cam.busy = true;
    var t = setInterval(function () {
        var src = camGrab(3 / 4, 300);
        if (src) {
            var sx = Math.round(src.width / 2 - STRIP / 2);
            g.drawImage(src, sx, 0, STRIP, src.height, x, 0, STRIP, H);
        }
        x += STRIP;
        arrow.style.transform = 'translateX(' + (x / W * 260) + 'px)';
        if (x >= W) stop();
    }, 45);
    $('camShutter').addEventListener('click', stop);
}

/* ---- input ------------------------------------------------------------ */
$('camTop').addEventListener('click', function (e) {
    var b = e.target.closest('.cam-tbtn'); if (!b) return;
    camAct(b.dataset.act);
});
$('camPill').addEventListener('click', function (e) {
    var b = e.target.closest('.cam-pbtn'); if (!b) return;
    camAct(b.dataset.act);
});
function camAct(a) {
    if (a === 'flash') camOpenPicker('flash');
    else if (a === 'timer') camOpenPicker('timer');
    else if (a === 'hdr') { cam.hdr = !cam.hdr; camClosePicker(); camPaint(); }
    else if (a === 'swap') {
        camClosePicker();
        cam.front = !cam.front;
        if (cam.devices.length > 1) cam.devIx = (cam.devIx + 1) % cam.devices.length;
        camStart();
        camPaint();
    }
}
$('camShutter').addEventListener('click', function () { camClosePicker(); camPress(); });
$('camFilterBtn').addEventListener('click', function () {
    camClosePicker();
    camSetFilters(!cam.filters);
});
$('camThumb').addEventListener('click', function () {
    var live = LIB.photos.filter(function (p) { return !p.deleted; });
    if (!live.length) return;
    camGoPhotos(live, live.length - 1);
});

/* the thumbnail hands off to Photos, the way the real one opens a viewer */
function camGoPhotos(list, i) {
    closeApp();
    setTimeout(function () {
        openApp(document.querySelector('#homescreen .icon[data-app="photos"]'), 'photos');
        phOpenViewer(list, i);
    }, 260);
}

function camSetMode(k) {
    if (cam.rec) return;
    cam.mode = k;
    camClosePicker();
    if (cam.filters) camSetFilters(false);
    camPaint();
}
$('camModeRow').addEventListener('click', function (e) {
    var m = e.target.closest('.cam-mode'); if (m) camSetMode(m.dataset.k);
});

/* swipe the wheel, and tap the frame to focus */
(function () {
    var x0 = null, moved = false;
    function down(e) { x0 = (e.touches ? e.touches[0].clientX : e.clientX); moved = false; }
    function move(e) {
        if (x0 === null || cam.rec) return;
        var x = (e.touches ? e.touches[0].clientX : e.clientX);
        if (Math.abs(x - x0) > 34) {
            moved = true;
            var i = 0;
            CAM_MODES.forEach(function (m, n) { if (m.k === cam.mode) i = n; });
            i = Math.max(0, Math.min(CAM_MODES.length - 1, i + (x < x0 ? 1 : -1)));
            camSetMode(CAM_MODES[i].k);
            x0 = null;
        }
    }
    function up() { x0 = null; setTimeout(function () { moved = false; }, 0); }
    ['camBottom', 'camStage'].forEach(function (id) {
        var el = $(id);
        el.addEventListener('mousedown', down);
        el.addEventListener('touchstart', down, { passive: true });
        el.addEventListener('touchmove', move, { passive: true });
        el.addEventListener('touchend', up);
    });
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);

    $('camBox').addEventListener('click', function (e) {
        if (moved || cam.filters || camEl.classList.contains('nocam')) return;
        if (cam.picker) { camClosePicker(); return; }
        var r = $('camBox').getBoundingClientRect();
        var s = r.width / 320;
        var f = $('camFocus');
        f.style.left = ((e.clientX - r.left) / s) + 'px';
        f.style.top = ((e.clientY - r.top) / s) + 'px';
        f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
    });
})();

/* ---- app plumbing ----------------------------------------------------- */
function camOpen() {
    cam.filters = false;
    camClosePicker();
    camVid.style.filter = camFilterCSS();
    camPaint();
    camStart();
}
function camReset() {
    if (cam.rec) camStopRec();
    if (cam.filters) camSetFilters(false);
    camClosePicker();
    clearInterval(camGridTimer); camGridTimer = null;
    clearInterval(camClockTimer); camClockTimer = null;
    clearInterval(camLapseTimer); camLapseTimer = null;
    $('camCount').classList.remove('up');
    camStop();
}

camPaint();
