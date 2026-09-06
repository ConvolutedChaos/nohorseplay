"use strict";
/* ================================================================== */
/* PHOTOS                                                             */
/* ------------------------------------------------------------------ */
/* The library lives in IndexedDB: full-size Blobs plus a small JPEG
   thumbnail per item, so the grids can paint hundreds of cells
   without decoding originals.  Everything the UI reads comes off an
   in-memory mirror (LIB) that is refreshed from the store, and every
   mutation writes through to the store first.                        */

var PH_DB = null, PH_DBV = 1;
var LIB = { photos: [], albums: [], recents: [] };
var PH_URL = {};                      /* id -> object URL, per size   */

function phIDB(cb) {
    var rq = indexedDB.open('ios9-photos', PH_DBV);
    rq.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains('photos')) {
            var st = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
            st.createIndex('taken', 'taken');
        }
        if (!db.objectStoreNames.contains('albums'))
            db.createObjectStore('albums', { keyPath: 'id', autoIncrement: true });
        if (!db.objectStoreNames.contains('meta'))
            db.createObjectStore('meta', { keyPath: 'k' });
    };
    rq.onsuccess = function () { PH_DB = rq.result; cb(null); };
    rq.onerror = function () { cb(rq.error); };
}

function phTx(stores, mode) { return PH_DB.transaction(stores, mode); }

function phAll(store, cb) {
    var out = [], rq = phTx([store], 'readonly').objectStore(store).openCursor();
    rq.onsuccess = function () {
        var c = rq.result;
        if (!c) { cb(out); return; }
        out.push(c.value); c.continue();
    };
    rq.onerror = function () { cb(out); };
}

/* pull the whole library into memory; blobs stay lazy until drawn */
function phLoad(cb) {
    phAll('photos', function (ps) {
        phAll('albums', function (as) {
            /* oldest first: every grid in Photos reads top-to-bottom in time */
            LIB.photos = ps.sort(function (a, b) { return a.taken - b.taken; });
            LIB.albums = as.sort(function (a, b) { return a.ord - b.ord; });
            var rq = phTx(['meta'], 'readonly').objectStore('meta').get('recents');
            rq.onsuccess = function () { LIB.recents = (rq.result && rq.result.v) || []; cb && cb(); };
            rq.onerror = function () { cb && cb(); };
        });
    });
}

function phPut(store, rec, cb) {
    var tx = phTx([store], 'readwrite'), rq = tx.objectStore(store).put(rec);
    rq.onsuccess = function () { if (cb) cb(rq.result); };
}
function phDel(store, id, cb) {
    var tx = phTx([store], 'readwrite');
    tx.objectStore(store).delete(id);
    tx.oncomplete = function () { if (cb) cb(); };
}
function phSaveRecents() { phPut('meta', { k: 'recents', v: LIB.recents }); }

function phThumbURL(p) {
    var k = 't' + p.id;
    if (!PH_URL[k]) PH_URL[k] = URL.createObjectURL(p.thumb || p.blob);
    return PH_URL[k];
}
function phFullURL(p) {
    var k = 'f' + p.id;
    if (!PH_URL[k]) PH_URL[k] = URL.createObjectURL(p.blob);
    return PH_URL[k];
}
function phForget(id) {
    ['t' + id, 'f' + id].forEach(function (k) {
        if (PH_URL[k]) { URL.revokeObjectURL(PH_URL[k]); delete PH_URL[k]; }
    });
}

/* ---- EXIF: just enough of it for the date, and to spot a selfie ----
   Moments / Collections / Years are only as good as the capture date,
   and the file's mtime is often the day it was copied, not shot. */
function phExif(buf) {
    var v = new DataView(buf), out = {};
    if (v.byteLength < 12 || v.getUint16(0) !== 0xFFD8) return out;   /* not a JPEG */
    var off = 2;
    while (off + 4 < v.byteLength) {
        if (v.getUint8(off) !== 0xFF) break;
        var mk = v.getUint8(off + 1), len = v.getUint16(off + 2);
        if (mk === 0xE1 && v.getUint32(off + 4) === 0x45786966) { off += 10; break; }
        if (mk === 0xDA) return out;
        off += 2 + len;
    }
    if (off + 8 > v.byteLength) return out;
    var tiff = off, le = v.getUint16(tiff) === 0x4949;
    var g16 = function (o) { return v.getUint16(o, le); };
    var g32 = function (o) { return v.getUint32(o, le); };
    if (g16(tiff + 2) !== 0x002A) return out;

    function str(o, n) {
        var s = '';
        for (var i = 0; i < n && v.getUint8(o + i); i++) s += String.fromCharCode(v.getUint8(o + i));
        return s;
    }
    function walk(dir) {
        if (dir + 2 > v.byteLength) return;
        var n = g16(dir);
        for (var i = 0; i < n; i++) {
            var e = dir + 2 + i * 12;
            if (e + 12 > v.byteLength) return;
            var tag = g16(e), type = g16(e + 2), cnt = g32(e + 4);
            var size = ({ 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 })[type] || 1;
            var val = cnt * size <= 4 ? e + 8 : tiff + g32(e + 8);
            if (tag === 0x0112) out.orient = g16(val);
            else if (tag === 0x9003 || tag === 0x0132) out.date = out.date || str(val, 19);
            else if (tag === 0x0110) out.model = str(val, Math.min(cnt, 60));
            else if (tag === 0xA434) out.lens = str(val, Math.min(cnt, 60));
            else if (tag === 0x8769) walk(tiff + g32(val));
        }
    }
    walk(tiff + g32(tiff + 4));
    return out;
}

/* "2024:07:23 15:55:04" -> ms, read as local time the way iOS does */
function phExifDate(s) {
    var m = /^(\d{4}):(\d\d):(\d\d) (\d\d):(\d\d):(\d\d)/.exec(s || '');
    if (!m) return 0;
    return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime();
}

var PH_THUMB = 320;
function phMakeThumb(src, w, h) {
    var s = Math.min(1, PH_THUMB / Math.max(w, h));
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * s));
    c.height = Math.max(1, Math.round(h * s));
    c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    return new Promise(function (res) {
        c.toBlob(function (b) { res(b); }, 'image/jpeg', 0.74);
    });
}

/* one file -> one record, or null if the browser cannot decode it */
function phRead(file) {
    var isVid = /^video\//.test(file.type);
    var base = {
        name: file.name, type: file.type, blob: file, fav: 0, deleted: 0,
        taken: file.lastModified || Date.now(), added: Date.now(), dur: 0
    };
    if (isVid) {
        return new Promise(function (res) {
            var url = URL.createObjectURL(file), vid = document.createElement('video');
            var done = function (rec) { URL.revokeObjectURL(url); res(rec); };
            vid.preload = 'metadata'; vid.muted = true; vid.playsInline = true;
            vid.onerror = function () { done(null); };
            vid.onloadedmetadata = function () {
                base.w = vid.videoWidth; base.h = vid.videoHeight;
                base.dur = Math.round(vid.duration) || 0;
                base.kind = 'video';
                vid.onseeked = function () {
                    phMakeThumb(vid, base.w, base.h).then(function (t) {
                        base.thumb = t; done(base);
                    });
                };
                try { vid.currentTime = Math.min(0.2, (vid.duration || 1) / 2); }
                catch (err) { done(base); }
            };
            vid.src = url;
        });
    }
    return file.arrayBuffer().then(function (buf) {
        var ex = phExif(buf.slice(0, Math.min(buf.byteLength, 262144)));
        var d = phExifDate(ex.date);
        if (d) base.taken = d;
        base.exif = !!ex.date;
        return createImageBitmap(file, { imageOrientation: 'from-image' }).then(function (bm) {
            base.w = bm.width; base.h = bm.height;
            /* a PNG with no camera metadata, shaped like the screen, is a
               screen grab; a front-facing lens makes it a selfie */
            var ratio = base.w / base.h;
            if (/front/i.test(ex.lens || '')) base.kind = 'selfie';
            else if (!ex.date && /png/i.test(file.type) && ratio > 0.42 && ratio < 0.72) base.kind = 'screenshot';
            else base.kind = 'photo';
            return phMakeThumb(bm, base.w, base.h).then(function (t) {
                base.thumb = t; bm.close && bm.close();
                return base;
            });
        });
    }).catch(function () { return null; });
}

var phBusy = false;
function phImport(files, done) {
    if (!files || !files.length || phBusy) { if (done) done(0); return; }
    phBusy = true;
    var list = Array.prototype.slice.call(files), i = 0, ok = 0;
    phFwState('Reading…');
    (function next() {
        if (i >= list.length) {
            phBusy = false;
            phLoad(function () { phRepaint(); phToBottom(); phFw(); if (done) done(ok); });
            return;
        }
        var f = list[i++];
        phFwState('Reading ' + i + '/' + list.length);
        phRead(f).then(function (rec) {
            if (!rec) { next(); return; }
            var tx = phTx(['photos'], 'readwrite');
            tx.objectStore('photos').add(rec);
            tx.oncomplete = function () { ok++; next(); };
            tx.onerror = function () { next(); };
        }, function () { next(); });
    })();
}

/* ---- the bench panel outside the device owns the import ---- */
function phFwState(t) { $('fwPhState').textContent = t; }
function phFw() {
    var live = LIB.photos.filter(function (p) { return !p.deleted; }).length;
    $('fwPhCount').textContent = live;
    phFwState(live ? (live === 1 ? 'Item' : 'Items') : 'Empty');
}
$('fwPhAdd').addEventListener('click', function () { $('phPicker').click(); });
$('phPicker').addEventListener('change', function () {
    phImport($('phPicker').files, function () { $('phPicker').value = ''; });
});
$('fwPhWipe').addEventListener('click', function () {
    if (phBusy) return;
    var tx = phTx(['photos', 'albums', 'meta'], 'readwrite');
    tx.objectStore('photos').clear();
    tx.objectStore('albums').clear();
    tx.objectStore('meta').clear();
    tx.oncomplete = function () {
        Object.keys(PH_URL).forEach(function (k) { URL.revokeObjectURL(PH_URL[k]); });
        PH_URL = {};
        phLoad(function () { phRepaint(); phFw(); });
    };
});

/* dropping files on the device is the same import */
(function () {
    var scr = $('screen');
    scr.addEventListener('dragover', function (e) { e.preventDefault(); });
    scr.addEventListener('drop', function (e) {
        e.preventDefault();
        if (e.dataTransfer && e.dataTransfer.files.length) phImport(e.dataTransfer.files);
    });
})();

/* ---- artwork ------------------------------------------------------- */
var PH_ICON = {
    mag: '<svg width="21" height="21" viewBox="0 0 22 22"><circle cx="9.2" cy="9.2" r="7.3" fill="none" ' +
        'stroke="currentColor" stroke-width="2"/><path d="M14.6 14.6 20.4 20.4" stroke="currentColor" ' +
        'stroke-width="2.4" stroke-linecap="round"/></svg>',
    back: '<svg width="12" height="20" viewBox="0 0 12 20"><path d="M10.5 1 1.6 10l8.9 9" fill="none" ' +
        'stroke="#007AFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chev: '<svg width="9" height="15" viewBox="0 0 9 15"><path d="M1 1l6.4 6.5L1 14" fill="none" ' +
        'stroke="#C7C7CC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tick: '<svg width="13" height="11" viewBox="0 0 14 12"><path d="M1.4 6.2 5 9.8 12.6 2" fill="none" ' +
        'stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cam: '<svg width="15" height="10" viewBox="0 0 16 11"><path d="M1.6 0h6.6a1.6 1.6 0 011.6 1.6v7.8A1.6 ' +
        '1.6 0 018.2 11H1.6A1.6 1.6 0 010 9.4V1.6A1.6 1.6 0 011.6 0z" fill="currentColor"/>' +
        '<path d="M11 4.2 15.4.9v9.2L11 6.8z" fill="currentColor"/></svg>',
    heart: '<svg width="17" height="15" viewBox="0 0 18 16"><path d="M9 15.4C3.4 11.3.4 8.2.4 5.1.4 2.6 ' +
        '2.3.8 4.7.8c1.7 0 3.3 1 4.3 2.4C10 1.8 11.6.8 13.3.8c2.4 0 4.3 1.8 4.3 4.3 0 3.1-3 6.2-8.6 ' +
        '10.3z" fill="currentColor"/></svg>',
    selfie: '<svg width="16" height="13" viewBox="0 0 17 14"><rect x=".8" y="2.4" width="15.4" ' +
        'height="10.8" rx="1.8" fill="currentColor"/><path d="M5 2.4 5.9.6h5.2l.9 1.8z" ' +
        'fill="currentColor"/><path d="M11.4 7.8a2.9 2.9 0 11-1.1-2.3" fill="none" stroke="#fff" ' +
        'stroke-width="1.3"/><path d="M10.6 3.9v1.9h-1.9" fill="none" stroke="#fff" stroke-width="1.3" ' +
        'stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trashbig: '<svg width="34" height="40" viewBox="0 0 34 40"><g fill="none" stroke="currentColor" ' +
        'stroke-width="1.6"><path d="M4.6 9.6h24.8l-2.2 27.6a2 2 0 01-2 1.8H8.8a2 2 0 01-2-1.8z"/>' +
        '<path d="M1 6.4h32M12 6.4V2.4h10v4"/><path d="M12.6 15v18M21.4 15v18M17 15v18"/></g></svg>',
    stackbig: '<svg width="46" height="36" viewBox="0 0 46 36"><g fill="none" stroke="currentColor" ' +
        'stroke-width="1.6"><rect x="1" y="8.6" width="27" height="26.4" rx="2"/>' +
        '<path d="M32 30.6h11a2 2 0 002-2V5a2 2 0 00-2-2H15a2 2 0 00-2 2v1.6"/></g></svg>',
    grip: '<svg width="20" height="12" viewBox="0 0 20 12"><g stroke="currentColor" stroke-width="1.6" ' +
        'stroke-linecap="round"><path d="M1 1.6h18M1 6h18M1 10.4h18"/></g></svg>',
    share: '<svg width="20" height="26" viewBox="0 0 20 26"><path d="M10 1.6v14.6" fill="none" ' +
        'stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M5.4 6 10 1.4 14.6 6" ' +
        'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" ' +
        'stroke-linejoin="round"/><path d="M4.8 9.4H2.4a1.6 1.6 0 00-1.6 1.6v12.2a1.6 1.6 0 001.6 ' +
        '1.6h15.2a1.6 1.6 0 001.6-1.6V11a1.6 1.6 0 00-1.6-1.6h-2.4" fill="none" stroke="currentColor" ' +
        'stroke-width="1.9" stroke-linecap="round"/></svg>',
    heartbar: '<svg width="25" height="22" viewBox="0 0 26 23"><path d="M13 22.4C4.9 16.5.6 12 .6 7.4.6 ' +
        '3.8 3.3 1.2 6.8 1.2c2.5 0 4.8 1.4 6.2 3.5 1.4-2.1 3.7-3.5 6.2-3.5 3.5 0 6.2 2.6 6.2 6.2 0 ' +
        '4.6-4.3 9.1-12.4 15z" fill="currentColor"/></svg>',
    heartbaro: '<svg width="25" height="22" viewBox="0 0 26 23"><path d="M13 21.4C5.4 15.8 1.6 11.6 1.6 ' +
        '7.4c0-3 2.3-5.2 5.2-5.2 2.2 0 4.2 1.3 5.4 3.2l.8 1.3.8-1.3c1.2-1.9 3.2-3.2 5.4-3.2 2.9 0 5.2 ' +
        '2.2 5.2 5.2 0 4.2-3.8 8.4-11.4 14z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    trash: '<svg width="19" height="24" viewBox="0 0 20 25"><g fill="none" stroke="currentColor" ' +
        'stroke-width="1.7"><path d="M2.6 5.6h14.8l-1.3 17.4a1.6 1.6 0 01-1.6 1.5H5.5a1.6 1.6 0 ' +
        '01-1.6-1.5z"/><path d="M.8 3.6h18.4M7 3.6V1.4h6v2.2"/><path d="M7.4 9.4v11M12.6 9.4v11"/>' +
        '</g></svg>'
};

var PH_TAB_ICONS = {
    photos: function (on) {
        if (on) return '<svg width="28" height="19" viewBox="0 0 28 19"><rect x="7.6" y="1" width="19.4" ' +
            'height="14.2" rx="1.6" fill="currentColor"/><rect x="1" y="4.4" width="19.4" height="14.2" ' +
            'rx="1.6" fill="currentColor" stroke="#F7F7F7" stroke-width="1.4"/></svg>';
        return '<svg width="28" height="19" viewBox="0 0 28 19"><g fill="none" stroke="currentColor" ' +
            'stroke-width="1.5"><rect x="7.6" y="1.2" width="19" height="13.8" rx="1.8"/>' +
            '<rect x="1.2" y="4.6" width="19" height="13.8" rx="1.8" fill="#F7F7F7"/></g></svg>';
    },
    shared: function (on) {
        if (on) return '<svg width="30" height="19" viewBox="0 0 30 19"><path d="M8.4 18.2a6.7 6.7 0 ' +
            '01-.5-13.4A7.6 7.6 0 0122.3 6a5.6 5.6 0 01-.7 12.2z" fill="currentColor"/></svg>';
        return '<svg width="30" height="19" viewBox="0 0 30 19"><path d="M8.4 18.2a6.7 6.7 0 ' +
            '01-.5-13.4A7.6 7.6 0 0122.3 6a5.6 5.6 0 01-.7 12.2z" fill="none" stroke="currentColor" ' +
            'stroke-width="1.6"/></svg>';
    },
    albums: function (on) {
        if (on) return '<svg width="26" height="20" viewBox="0 0 26 20"><g fill="currentColor">' +
            '<rect x="5.4" y="0" width="15.2" height="2.2" rx="1.1"/>' +
            '<rect x="3" y="3.4" width="20" height="2.2" rx="1.1"/>' +
            '<rect x="0.6" y="7" width="24.8" height="12.6" rx="1.8"/></g></svg>';
        return '<svg width="26" height="20" viewBox="0 0 26 20"><g fill="currentColor">' +
            '<rect x="5.4" y="0" width="15.2" height="2" rx="1"/>' +
            '<rect x="3" y="3.4" width="20" height="2" rx="1"/></g>' +
            '<rect x="1.4" y="7.8" width="23.2" height="11.4" rx="1.6" fill="none" ' +
            'stroke="currentColor" stroke-width="1.6"/></svg>';
    }
};

/* ---- dates --------------------------------------------------------- */
function phDayKey(ms) { var d = new Date(ms); return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate(); }
function phMidnight(ms) { var d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); }
function phDaysApart(a, b) { return Math.round((phMidnight(a) - phMidnight(b)) / 86400000); }

function phDayName(ms) {
    var diff = phDaysApart(Date.now(), ms), d = new Date(ms);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff > 1 && diff < 7) return DAYS[d.getDay()];
    var y = d.getFullYear() === new Date().getFullYear() ? '' : ', ' + d.getFullYear();
    return MONS[d.getMonth()] + ' ' + d.getDate() + y;
}
function phShortDay(ms) {
    var diff = phDaysApart(Date.now(), ms), d = new Date(ms);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff > 1 && diff < 7) return DAYS[d.getDay()];
    return MONS[d.getMonth()] + ' ' + d.getDate();
}
function phTimeStr(ms) {
    var d = new Date(ms), h = d.getHours(), m = d.getMinutes(), ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
}

/* ---- the three groupings the Photos tab drills through -------------- */
function phLive() { return LIB.photos.filter(function (p) { return !p.deleted; }); }

function phMoments() {
    var out = [], cur = null;
    phLive().forEach(function (p) {
        var k = phDayKey(p.taken);
        if (!cur || cur.k !== k) { cur = { k: k, t: p.taken, items: [] }; out.push(cur); }
        cur.items.push(p);
    });
    return out;
}

/* a collection is a run of moments no more than four days apart */
function phCollections() {
    var out = [], cur = null;
    phMoments().forEach(function (m) {
        if (cur && phDaysApart(m.t, cur.to) <= 4) {
            cur.items = cur.items.concat(m.items);
            cur.to = m.t;
        } else {
            cur = { from: m.t, to: m.t, items: m.items.slice() };
            out.push(cur);
        }
    });
    return out;
}

function phCollLabel(c) {
    var a = new Date(c.from), b = new Date(c.to), yr = new Date().getFullYear();
    var sameDay = phDayKey(c.from) === phDayKey(c.to);
    var endName = phDaysApart(Date.now(), c.to) < 7 ? phShortDay(c.to) : null;
    var tail = b.getFullYear() === yr ? '' : ', ' + b.getFullYear();
    if (sameDay) return (endName || MONS[b.getMonth()] + ' ' + b.getDate()) + (endName ? '' : tail);
    var recent = phDaysApart(Date.now(), c.from) < 7;
    var start = recent ? phShortDay(c.from) : MONS[a.getMonth()] + ' ' + a.getDate();
    var end = a.getMonth() === b.getMonth() ? String(b.getDate()) : MONS[b.getMonth()] + ' ' + b.getDate();
    if (endName) return start + ' - ' + endName;
    return start + ' - ' + end + tail;
}

/* years merge upward until a band has enough photos to fill a row */
function phYears() {
    var by = [], cur = null;
    phLive().forEach(function (p) {
        var y = new Date(p.taken).getFullYear();
        if (!cur || cur.y !== y) { cur = { y: y, items: [] }; by.push(cur); }
        cur.items.push(p);
    });
    /* a year with enough photos to fill a strip stands on its own; the
       sparse ones huddle together under a range, as in the reference */
    var out = [], band = null, ROW = 24;
    by.forEach(function (g) {
        if (band && band.items.length < ROW && g.items.length < ROW) {
            band.items = band.items.concat(g.items);
            band.hi = g.y;
        } else {
            band = { hi: g.y, lo: g.y, items: g.items.slice() };
            out.push(band);
        }
    });
    return out.map(function (b) {
        b.label = b.lo === b.hi ? String(b.hi) : b.lo + ' - ' + b.hi;
        return b;
    });
}

function phCountLine(items) {
    var v = 0, p = 0;
    items.forEach(function (x) { if (x.kind === 'video') v++; else p++; });
    var bits = [];
    if (p) bits.push(p + (p === 1 ? ' Photo' : ' Photos'));
    if (v) bits.push(v + (v === 1 ? ' Video' : ' Videos'));
    return bits.join(', ') || 'No Photos or Videos';
}

function phDur(s) {
    s = Math.max(0, Math.round(s || 0));
    var m = Math.floor(s / 60);
    return m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
}

/* ---- albums -------------------------------------------------------- */
function phAlbumList() {
    var live = phLive(), out = [];
    function smart(k, n, items, badge, opt) {
        out.push({ k: k, n: n, items: items, badge: badge, always: !!(opt && opt.always), blank: opt && opt.blank });
    }
    smart('roll', 'Camera Roll', live, null, { always: true });
    smart('fav', 'Favorites', live.filter(function (p) { return p.fav; }), 'heart');
    smart('selfie', 'Selfies', live.filter(function (p) { return p.kind === 'selfie'; }), 'selfie');
    smart('video', 'Videos', live.filter(function (p) { return p.kind === 'video'; }), 'cam');
    smart('shot', 'Screenshots', live.filter(function (p) { return p.kind === 'screenshot'; }), null);
    smart('del', 'Recently Deleted',
        LIB.photos.filter(function (p) { return p.deleted; }), null, { blank: 'trashbig' });
    out = out.filter(function (a) { return a.always || a.items.length; });
    LIB.albums.forEach(function (a) {
        out.push({
            k: 'u' + a.id, id: a.id, n: a.name, user: true, blank: 'stackbig',
            items: a.ids.map(phById).filter(function (p) { return p && !p.deleted; })
        });
    });
    return out;
}
function phById(id) {
    for (var i = 0; i < LIB.photos.length; i++) if (LIB.photos[i].id === id) return LIB.photos[i];
    return null;
}
function phAlbumByKey(k) {
    var all = phAlbumList();
    for (var i = 0; i < all.length; i++) if (all[i].k === k) return all[i];
    return null;
}

/* ---- level stack ---------------------------------------------------
   Each tab keeps its own chain of levels; the tab bar never moves, so
   the levels slide underneath it exactly like a pushed view. */
var PH_LEVELS = ['years', 'coll', 'moments', 'shared', 'albums', 'grid'];
var PH_CHAIN = { photos: ['years', 'coll', 'moments'], shared: ['shared'], albums: ['albums', 'grid'] };
var phTab = 'photos', phDepth = { photos: 2, shared: 0, albums: 0 };
var phGridAlbum = null;      /* album key the grid level is showing     */
var phGridSet = null;        /* or an ad-hoc list, from search          */
var phSel = null;            /* {ctx:'grid'|'moments', ids:{}}          */

function phPaintLevels(anim) {
    var chain = PH_CHAIN[phTab], depth = phDepth[phTab];
    PH_LEVELS.forEach(function (id) {
        var el = $('lv-' + id), i = chain.indexOf(id);
        var live = i > -1 && i <= depth;
        if (!anim) el.classList.add('nomove');
        el.classList.toggle('live', live);
        el.classList.toggle('active', live && i === depth);
        el.classList.toggle('behind', live && i < depth);
    });
    if (!anim) {
        void $('phLevels').offsetHeight;
        PH_LEVELS.forEach(function (id) { $('lv-' + id).classList.remove('nomove'); });
    }
}
function phPush() { phDepth[phTab]++; phPaintLevels(true); }
function phPop() { if (phDepth[phTab] > 0) { phDepth[phTab]--; phPaintLevels(true); } }

function phSetTab(k) {
    if (phSel) phEndSelect();
    phTab = k;
    phPaintLevels(false);
    phPaintTabs();
    phRepaint();
    phToBottom();
}
function phPaintTabs() {
    $('phTabs').innerHTML = [['photos', 'Photos'], ['shared', 'Shared'], ['albums', 'Albums']]
        .map(function (t) {
            var on = t[0] === phTab;
            return '<div class="ph-tab' + (on ? ' on' : '') + '" data-k="' + t[0] + '">' +
                PH_TAB_ICONS[t[0]](on) + '<span>' + t[1] + '</span></div>';
        }).join('');
}
$('phTabs').addEventListener('click', function (e) {
    var t = e.target.closest('.ph-tab'); if (t) phSetTab(t.dataset.k);
});

/* ---- nav bars ------------------------------------------------------ */
function phNavBtn(act, label, cls) {
    return '<div class="btn' + (cls ? ' ' + cls : '') + '" data-act="' + act + '">' + label + '</div>';
}
function phBackBtn(label) {
    return '<div class="btn back" data-act="pop">' + PH_ICON.back + '<span>' + esc(label) + '</span></div>';
}
function phMag() {
    return '<div class="btn ph-mag" data-act="search">' + PH_ICON.mag + '</div>';
}
/* two trailing buttons need one flex box between them: two separate
   margin-left:auto items would split the slack and land mid-bar */
function phRight() {
    return '<div class="ph-navright">' +
        Array.prototype.join.call(arguments, '') + '</div>';
}
function phTitle(t) { return '<div class="title">' + esc(t) + '</div>'; }

function phSelTitle() {
    return phSelCount() === 0 ? 'Select Items' : phNoun(phSelected()) + ' Selected';
}
function phSelCount() { return phSel ? Object.keys(phSel.ids).length : 0; }

function phPaintNav() {
    $('yearsNav').innerHTML = phTitle('Years') + phRight(phMag());
    $('collNav').innerHTML = phBackBtn('Years') + phTitle('Collections') + phRight(phMag());

    if (phSel && phSel.ctx === 'moments') {
        $('momNav').innerHTML = phTitle(phSelTitle()) + phRight(phNavBtn('cancelsel', 'Cancel'));
    } else {
        $('momNav').innerHTML = phBackBtn('Collections') + phTitle('Moments') +
            phRight(phMag(), phNavBtn('select', 'Select', phLive().length ? '' : 'dim'));
    }

    $('shNav').innerHTML = phTitle('iCloud');

    $('albNav').innerHTML =
        '<div class="btn ck-plus" data-act="newalbum"><svg width="26" height="26" viewBox="0 0 26 26">' +
        '<path d="M13 3.2v19.6M3.2 13h19.6" stroke="currentColor" stroke-width="2.2" ' +
        'stroke-linecap="round"/></svg></div>' +
        phTitle('Albums') +
        phRight((phAlbEdit ? '' : phMag()), phNavBtn('albedit', phAlbEdit ? 'Done' : 'Edit'));

    var alb = phGridSet || phAlbumByKey(phGridAlbum);
    if (phSel && phSel.ctx === 'grid') {
        $('gridNav').innerHTML = phTitle(phSelTitle()) + phRight(phNavBtn('cancelsel', 'Cancel'));
    } else {
        $('gridNav').innerHTML = phBackBtn(phGridSet ? 'Search' : 'Albums') +
            phTitle(alb ? alb.n : '') +
            phRight(phNavBtn('select', 'Select', alb && alb.items.length ? '' : 'dim'));
    }

    $('addToNav').innerHTML = phNavBtn('addtocancel', 'Cancel') + phTitle('Add to Album');
    $('vwNav').innerHTML = '<div class="btn back" data-act="vwback">' + PH_ICON.back + '</div>' +
        '<div class="vw-title" id="vwTitle"></div>' + phRight(phNavBtn('vwedit', 'Edit'));
}

/* ---- cells --------------------------------------------------------- */
function phCell(p, opts) {
    var sel = phSel && phSel.ids[p.id];
    var days = opts && opts.days
        ? '<div class="ph-vid"><span class="dur">' + phDaysLeft(p) + '</span></div>' : '';
    return '<div class="ph-cell' + (sel ? ' sel' : '') + '" data-id="' + p.id + '">' +
        '<img src="' + phThumbURL(p) + '" alt="" draggable="false">' +
        (p.kind === 'video' ? '<div class="ph-vid">' + PH_ICON.cam +
            '<span class="dur">' + phDur(p.dur) + '</span></div>' : days) +
        '<div class="ph-tick">' + PH_ICON.tick + '</div></div>';
}
function phDaysLeft(p) {
    var d = 30 - phDaysApart(Date.now(), p.deleted);
    return Math.max(0, d) + (Math.max(0, d) === 1 ? ' day' : ' days');
}
function phGridHTML(items, cls, opts) {
    return '<div class="ph-grid' + (cls ? ' ' + cls : '') + '">' +
        items.map(function (p) { return phCell(p, opts); }).join('') + '</div>';
}

/* ---- the six bodies ------------------------------------------------ */
function phRenderMoments() {
    var ms = phMoments();
    if (!ms.length) { $('momBody').innerHTML = phNoPhotos(); return; }
    var h = '', all = [];
    ms.forEach(function (m) {
        all = all.concat(m.items);
        h += '<div class="ph-head"><span class="h-title">' + esc(phDayName(m.t)) + '</span>' +
            '<span class="h-act" data-act="share-moment" data-k="' + m.k + '">Share</span></div>' +
            phGridHTML(m.items);
    });
    h += '<div class="ph-foot">' + esc(phCountLine(all)) + '</div>';
    $('momBody').innerHTML = h;
}
function phRenderColl() {
    var cs = phCollections();
    if (!cs.length) { $('collBody').innerHTML = phNoPhotos(); return; }
    $('collBody').innerHTML = cs.map(function (c) {
        return '<div class="ph-head coll"><span class="h-title">' + esc(phCollLabel(c)) + '</span></div>' +
            phGridHTML(c.items, 'coll');
    }).join('') + '<div class="ph-pad"></div>';
}
function phRenderYears() {
    var ys = phYears();
    if (!ys.length) { $('yearsBody').innerHTML = phNoPhotos(); return; }
    $('yearsBody').innerHTML = ys.map(function (b) {
        return '<div class="ph-head years"><span class="h-title">' + esc(b.label) + '</span></div>' +
            phGridHTML(b.items, 'years');
    }).join('') + '<div class="ph-pad"></div>';
}
function phNoPhotos() {
    return '<div class="ph-foot" style="padding-top:64px">No Photos or Videos</div>';
}

var phAlbEdit = false;
function phAlbumRow(a) {
    /* Recently Deleted always shows the bin, never one of its photos */
    var n = a.items.length, cover = a.blank === 'trashbig' ? null : a.items[n - 1], sheets = '';
    [2, 3].forEach(function (i) {
        var q = cover ? a.items[n - i] : null;
        sheets += '<div class="pa-sheet' + (i === 3 ? ' far' : '') + '">' +
            (q ? '<img src="' + phThumbURL(q) + '" alt="">' : '') + '</div>';
    });
    var badge = a.badge ? '<span class="kind">' + PH_ICON[a.badge] + '</span>' : '';
    var art = cover
        ? '<div class="pa-cover"><img src="' + phThumbURL(cover) + '" alt="">' + badge + '</div>'
        : '<div class="pa-cover blank">' + (PH_ICON[a.blank] || PH_ICON.stackbig) + '</div>';
    return '<div class="pa-row' + (a.user ? '' : ' fixed') + '" data-k="' + a.k + '">' +
        '<div class="pa-minus" data-act="delalbum"><i></i></div>' +
        '<div class="pa-stack">' + sheets + art + '</div>' +
        '<div class="pa-text"><div class="pa-name">' + esc(a.n) + '</div>' +
        '<div class="pa-count">' + a.items.length + '</div></div>' +
        '<div class="pa-chev">' + PH_ICON.chev + '</div>' +
        '<div class="pa-grip">' + PH_ICON.grip + '</div></div>';
}
function phRenderAlbums() {
    var el = $('albBody');
    el.classList.toggle('editing', phAlbEdit);
    el.innerHTML = phAlbumList().map(phAlbumRow).join('');
}
function phRenderGrid() {
    var a = phGridSet || phAlbumByKey(phGridAlbum);
    $('gridBody').innerHTML = a && a.items.length
        ? phGridHTML(a.items, '', { days: phGridAlbum === 'del' })
        : phNoPhotos();
}
function phRenderAddTo() {
    var h = '<div class="pa-row" data-k="new"><div class="pa-stack">' +
        '<div class="pa-cover blank">' + PH_ICON.stackbig + '</div></div>' +
        '<div class="pa-text"><div class="pa-name">New Album</div>' +
        '<div class="pa-count">&nbsp;</div></div><div class="pa-chev">' + PH_ICON.chev + '</div></div>';
    h += LIB.albums.map(function (a) {
        return phAlbumRow({
            k: 'u' + a.id, n: a.name, user: true, blank: 'stackbig',
            items: a.ids.map(phById).filter(function (p) { return p && !p.deleted; })
        });
    }).join('');
    $('addToBody').innerHTML = h;
}

/* iOS parks these views at the newest end */
function phToBottom() {
    ['momBody', 'collBody', 'yearsBody', 'gridBody'].forEach(function (id) {
        var el = $(id); el.scrollTop = el.scrollHeight;
    });
}

function phRepaint() {
    phPaintNav();
    phRenderMoments();
    phRenderColl();
    phRenderYears();
    phRenderAlbums();
    phRenderGrid();
    $('ph-root').classList.toggle('selecting', !!phSel);
    if (phSel) phPaintToolbar();
}

/* ---- select mode --------------------------------------------------- */
function phBeginSelect(ctx) { phSel = { ctx: ctx, ids: {} }; phRepaint(); }
function phEndSelect() { phSel = null; phRepaint(); }
function phSelected() {
    return Object.keys(phSel.ids).map(function (k) { return phById(+k); })
        .filter(Boolean);
}
function phPaintToolbar() {
    var n = phSelCount(), off = n ? '' : ' off';
    var recycle = phSel.ctx === 'grid' && phGridAlbum === 'del';
    $('phToolbar').innerHTML = recycle
        ? '<div class="ph-tbtn' + off + '" data-act="recover">Recover</div>' +
        '<div class="ph-tbtn grow"></div>' +
        '<div class="ph-tbtn' + off + '" data-act="purge">Delete</div>'
        : '<div class="ph-tbtn' + off + '" data-act="share">' + PH_ICON.share + '</div>' +
        '<div class="ph-tbtn grow' + off + '" data-act="addto">Add To</div>' +
        '<div class="ph-tbtn' + off + '" data-act="trash">' + PH_ICON.trash + '</div>';
}
$('phToolbar').addEventListener('click', function (e) {
    var b = e.target.closest('.ph-tbtn'); if (!b || !b.dataset.act) return;
    phAction(b.dataset.act);
});

/* ---- viewer -------------------------------------------------------- */
var phView = { list: [], i: 0 };
function phOpenViewer(list, i) {
    phView.list = list; phView.i = i;
    phPaintViewer();
    push($('ph-root'), $('ph-viewer'));
}
function phCloseViewer() {
    pop($('ph-viewer'), $('ph-root'));
    $('vwStage').innerHTML = '';
}
function phCurrent() { return phView.list[phView.i] || null; }
function phPaintViewer() {
    var p = phCurrent();
    if (!p) { phCloseViewer(); return; }
    $('vwTitle').innerHTML = '<b>' + esc(phShortDay(p.taken)) + '</b><span>' +
        esc(phTimeStr(p.taken)) + '</span>';
    $('vwStage').innerHTML = p.kind === 'video'
        ? '<video src="' + phFullURL(p) + '" controls playsinline></video>'
        : '<img src="' + phFullURL(p) + '" alt="" draggable="false">';
    $('vwBar').innerHTML = '<div class="b" data-act="vwshare">' + PH_ICON.share + '</div>' +
        '<div class="b mid" data-act="vwfav">' +
        (p.fav ? PH_ICON.heartbar : PH_ICON.heartbaro) + '</div>' +
        '<div class="b" data-act="vwtrash">' + PH_ICON.trash + '</div>';
}
$('vwBar').addEventListener('click', function (e) {
    var b = e.target.closest('.b'); if (b) phAction(b.dataset.act);
});
$('vwNav').addEventListener('click', function (e) {
    var b = e.target.closest('.btn'); if (b) phAction(b.dataset.act);
});
/* swipe through the roll */
(function () {
    var x0 = null, moved = false, st = $('vwStage');
    function down(e) { x0 = (e.touches ? e.touches[0].clientX : e.clientX); moved = false; }
    function move(e) {
        if (x0 === null) return;
        var x = (e.touches ? e.touches[0].clientX : e.clientX);
        if (Math.abs(x - x0) > 40) {
            moved = true;
            var dir = x < x0 ? 1 : -1, n = phView.i + dir;
            if (n >= 0 && n < phView.list.length) { phView.i = n; phPaintViewer(); }
            x0 = null;
        }
    }
    function up() { x0 = null; }
    st.addEventListener('mousedown', down);
    st.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('mousemove', move);
    st.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('mouseup', up);
    st.addEventListener('touchend', up);
})();

/* ---- alerts + action sheets ---------------------------------------- */
var phSheetCb = null;
function phSheet(msg, buttons) {
    $('phSGroup').innerHTML = (msg ? '<div class="ph-smsg">' + esc(msg) + '</div>' : '') +
        buttons.map(function (b, i) {
            return '<div class="ph-sbtn' + (b.red ? ' red' : '') + '" data-i="' + i + '">' +
                esc(b.n) + '</div>';
        }).join('');
    phSheetCb = buttons;
    $('phSheet').classList.add('up');
}
function phCloseSheet() { $('phSheet').classList.remove('up'); phSheetCb = null; }
$('phSheet').addEventListener('click', function (e) {
    var b = e.target.closest('.ph-sbtn');
    if (!b) { if (e.target === $('phSheet')) phCloseSheet(); return; }
    if (b.id === 'phSCancelBtn') { phCloseSheet(); return; }
    var spec = phSheetCb && phSheetCb[+b.dataset.i];
    phCloseSheet();
    if (spec && spec.fn) spec.fn();
});

/* New Album keeps its own little text field and keyboard */
var phAlbName = '', phAlbTarget = null;
function phAlbSync() {
    var e = $('phAVal'), on = $('phAlert').classList.contains('up');
    $('phAField').classList.toggle('empty', !phAlbName);
    e.innerHTML = phAlbName ? esc(phAlbName) + (on ? '<span class="caret"></span>' : '')
        : (on ? '<span class="caret"></span>Title' : 'Title');
    $('phASave').classList.toggle('dim', !phAlbName.trim());
}
function phNewAlbum(target) {
    phAlbName = ''; phAlbTarget = target || null;
    phAlbSync();
    $('phAlert').classList.add('up');
    openKB(kb7);
    phAlbSync();
}
function phCloseAlbumAlert() {
    closeKB(kb7);
    $('phAlert').classList.remove('up');
}
$('phACancel').addEventListener('click', phCloseAlbumAlert);
$('phASave').addEventListener('click', function () {
    var name = phAlbName.trim();
    if (!name) return;
    var rec = { name: name, ord: Date.now(), ids: [] };
    var tx = phTx(['albums'], 'readwrite'), rq = tx.objectStore('albums').add(rec);
    rq.onsuccess = function () {
        var id = rq.result;
        phCloseAlbumAlert();
        phLoad(function () {
            if (phAlbTarget === 'addto') { phAddToAlbum(id); }
            else phRepaint();
        });
    };
});

/* ---- Add To -------------------------------------------------------- */
function phAddToAlbum(albumId) {
    var a = null;
    LIB.albums.forEach(function (x) { if (x.id === albumId) a = x; });
    if (!a) return;
    phSelected().forEach(function (p) { if (a.ids.indexOf(p.id) < 0) a.ids.push(p.id); });
    phPut('albums', a, function () {
        $('ph-addto').classList.remove('active');
        phEndSelect();
        phLoad(function () { phRepaint(); });
    });
}
$('addToNav').addEventListener('click', function (e) {
    var b = e.target.closest('.btn');
    if (b && b.dataset.act === 'addtocancel') $('ph-addto').classList.remove('active');
});
$('addToBody').addEventListener('click', function (e) {
    var r = e.target.closest('.pa-row'); if (!r) return;
    if (r.dataset.k === 'new') { phNewAlbum('addto'); return; }
    phAddToAlbum(+r.dataset.k.slice(1));
});

/* ---- search -------------------------------------------------------- */
var phQuery = '', phSearchOn = false;
function phSearchSync() {
    var t = $('phSText');
    if (phQuery) t.innerHTML = '<span class="q">' + esc(phQuery) + '</span><span class="caret"></span>';
    else t.innerHTML = '<span class="caret"></span>Search Photos';
    phRenderSearch();
}
function phSuggestions() {
    var out = [], live = phLive();
    if (!live.length) return out;
    var fav = live.filter(function (p) { return p.fav; });
    if (fav.length) out.push({ n: 'Favorites', cover: fav[0], key: 'fav' });
    var seen = {}, months = [];
    live.slice().reverse().forEach(function (p) {
        var d = new Date(p.taken), k = d.getFullYear() + '-' + d.getMonth();
        if (!seen[k]) { seen[k] = 1; months.push({ n: MONS[d.getMonth()] + ' ' + d.getFullYear(), cover: p, key: 'm' + k }); }
    });
    return out.concat(months.slice(0, 6));
}
function phSearchHits(q) {
    q = q.trim().toLowerCase();
    return phSuggestions().concat(LIB.albums.map(function (a) {
        var items = a.ids.map(phById).filter(function (p) { return p && !p.deleted; });
        return { n: a.name, cover: items[0], key: 'u' + a.id };
    })).filter(function (s) { return !q || s.n.toLowerCase().indexOf(q) > -1; });
}
function phRenderSearch() {
    var rows = phSearchHits(phQuery), h = '';
    h += rows.map(function (s) {
        return '<div class="ph-srowitem" data-key="' + s.key + '" data-n="' + esc(s.n) + '">' +
            '<div class="ph-sthumb">' + (s.cover ? '<img src="' + phThumbURL(s.cover) + '" alt="">' : '') +
            '</div><div class="ph-slabel">' + esc(s.n) + '</div></div>';
    }).join('');
    if (!phQuery && LIB.recents.length) {
        h += '<div class="ph-shdr">Recent Searches</div>' +
            LIB.recents.map(function (r) {
                return '<div class="ph-srowitem plain" data-q="' + esc(r) + '">' +
                    '<div class="ph-slabel">' + esc(r) + '</div></div>';
            }).join('');
    }
    if (!rows.length && phQuery) h += '<div class="ph-foot" style="padding-top:40px">No Results</div>';
    $('phSBody').innerHTML = h;
}
function phOpenSearch() {
    phSearchOn = true; phQuery = '';
    $('ph-search').classList.add('up');
    openKB(kb8);
    phSearchSync();
}
function phCloseSearch() {
    phSearchOn = false;
    closeKB(kb8);
    $('ph-search').classList.remove('up');
}
$('phSCancel').addEventListener('click', phCloseSearch);
$('phSBody').addEventListener('click', function (e) {
    var r = e.target.closest('.ph-srowitem'); if (!r) return;
    if (r.dataset.q !== undefined) { phQuery = r.dataset.q; phSearchSync(); return; }
    var name = r.dataset.n;
    if (LIB.recents.indexOf(name) < 0) LIB.recents.unshift(name);
    LIB.recents = LIB.recents.slice(0, 4);
    phSaveRecents();
    phShowSet(name, phSetFor(r.dataset.key));
    phCloseSearch();
});
function phSetFor(key) {
    var live = phLive();
    if (key === 'fav') return live.filter(function (p) { return p.fav; });
    if (key.charAt(0) === 'u') {
        var id = +key.slice(1), a = null;
        LIB.albums.forEach(function (x) { if (x.id === id) a = x; });
        return a ? a.ids.map(phById).filter(function (p) { return p && !p.deleted; }) : [];
    }
    var m = /^m(\d+)-(\d+)$/.exec(key);
    if (m) return live.filter(function (p) {
        var d = new Date(p.taken);
        return d.getFullYear() === +m[1] && d.getMonth() === +m[2];
    });
    return live;
}
/* search results borrow the album grid level */
function phShowSet(name, items) {
    phGridSet = { n: name, items: items };
    phGridAlbum = null;
    phTab = 'albums';
    phDepth.albums = 1;
    phPaintTabs();
    phPaintLevels(false);
    phRepaint();
}

/* ---- mutations ----------------------------------------------------- */
function phWriteAll(recs, cb) {
    var tx = phTx(['photos'], 'readwrite'), st = tx.objectStore('photos');
    recs.forEach(function (r) { st.put(r); });
    tx.oncomplete = function () { phLoad(function () { phFw(); if (cb) cb(); }); };
}
function phStripFromAlbums(ids, cb) {
    var touched = LIB.albums.filter(function (a) {
        return a.ids.some(function (id) { return ids.indexOf(id) > -1; });
    });
    if (!touched.length) { cb(); return; }
    var tx = phTx(['albums'], 'readwrite'), st = tx.objectStore('albums');
    touched.forEach(function (a) {
        a.ids = a.ids.filter(function (id) { return ids.indexOf(id) < 0; });
        st.put(a);
    });
    tx.oncomplete = cb;
}
function phInAlbum(items) {
    return items.some(function (p) {
        return LIB.albums.some(function (a) { return a.ids.indexOf(p.id) > -1; });
    });
}
function phNoun(items) {
    var v = items.filter(function (p) { return p.kind === 'video'; }).length;
    if (v === 0) return items.length + (items.length === 1 ? ' Photo' : ' Photos');
    if (v === items.length) return items.length + (items.length === 1 ? ' Video' : ' Videos');
    return items.length + ' Items';
}
function phDeleteItems(items, after) {
    var now = Date.now(), ids = items.map(function (p) { return p.id; });
    items.forEach(function (p) { p.deleted = now; });
    phStripFromAlbums(ids, function () {
        phWriteAll(items, function () { phRepaint(); if (after) after(); });
    });
}
function phConfirmDelete(items, after) {
    phSheet(phInAlbum(items) ? 'These photos will also be deleted from an album.' : '',
        [{ n: 'Delete ' + phNoun(items), red: true, fn: function () { phDeleteItems(items, after); } }]);
}
function phPurge(items, after) {
    var tx = phTx(['photos'], 'readwrite'), st = tx.objectStore('photos');
    items.forEach(function (p) { st.delete(p.id); phForget(p.id); });
    tx.oncomplete = function () {
        phLoad(function () { phFw(); phRepaint(); if (after) after(); });
    };
}
function phRecover(items, after) {
    items.forEach(function (p) { p.deleted = 0; });
    phWriteAll(items, function () { phRepaint(); if (after) after(); });
}

/* Recently Deleted really does empty itself after 30 days */
function phSweep() {
    var dead = LIB.photos.filter(function (p) {
        return p.deleted && phDaysApart(Date.now(), p.deleted) >= 30;
    });
    if (dead.length) phPurge(dead);
}

/* Edit is one honest tool rather than a fake screen: a real rotate that
   re-encodes the stored blob and its thumbnail. */
function phRotate(p, cb) {
    var url = phFullURL(p), img = new Image();
    img.onload = function () {
        var c = document.createElement('canvas');
        c.width = img.naturalHeight; c.height = img.naturalWidth;
        var g = c.getContext('2d');
        g.translate(c.width / 2, c.height / 2);
        g.rotate(-Math.PI / 2);
        g.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        c.toBlob(function (b) {
            if (!b) { cb && cb(); return; }
            p.blob = b; p.w = c.width; p.h = c.height; p.type = 'image/jpeg';
            phMakeThumb(c, c.width, c.height).then(function (t) {
                p.thumb = t;
                phForget(p.id);
                phWriteAll([p], function () {
                    var fresh = phById(p.id);
                    phView.list = phView.list.map(function (q) { return q.id === p.id ? fresh : q; });
                    phPaintViewer(); phRepaint(); cb && cb();
                });
            });
        }, 'image/jpeg', 0.92);
    };
    img.onerror = function () { cb && cb(); };
    img.src = url;
}

function phShareOut(items) { phShareSheet(items); }

/* ---- one dispatcher for every button in the app --------------------- */
function phAction(act, el) {
    switch (act) {
        case 'pop': phPop(); break;
        case 'search': phOpenSearch(); break;
        case 'select':
            phBeginSelect(phTab === 'albums' ? 'grid' : 'moments'); break;
        case 'cancelsel': phEndSelect(); break;
        case 'newalbum': phNewAlbum(); break;
        case 'albedit':
            phAlbEdit = !phAlbEdit;
            phRepaint();
            break;
        case 'delalbum': {
            var row = el && el.closest('.pa-row'); if (!row) break;
            var id = +row.dataset.k.slice(1), name = '';
            LIB.albums.forEach(function (a) { if (a.id === id) name = a.name; });
            phSheet('Deleting this album will not delete the photos in it.',
                [{
                    n: 'Delete Album', red: true, fn: function () {
                        phDel('albums', id, function () { phLoad(function () { phRepaint(); }); });
                    }
                }]);
            break;
        }
        case 'share': phShareOut(phSelected()); break;
        case 'addto':
            phRenderAddTo();
            $('ph-addto').classList.add('active');
            break;
        case 'trash': phConfirmDelete(phSelected(), phEndSelect); break;
        case 'recover': phRecover(phSelected(), phEndSelect); break;
        case 'purge': {
            var items = phSelected();
            phSheet('', [{
                n: 'Delete ' + phNoun(items), red: true,
                fn: function () { phPurge(items, phEndSelect); }
            }]);
            break;
        }
        case 'share-moment': {
            var k = el && +el.dataset.k;
            var m = phMoments().filter(function (x) { return x.k === k; })[0];
            if (m) phShareOut(m.items);
            break;
        }
        case 'vwback': phCloseViewer(); break;
        case 'vwshare': phShareOut([phCurrent()]); break;
        case 'vwfav': {
            var p = phCurrent(); if (!p) break;
            p.fav = p.fav ? 0 : 1;
            phWriteAll([p], function () {
                var fresh = phById(p.id);
                phView.list = phView.list.map(function (q) { return q.id === p.id ? fresh : q; });
                phPaintViewer(); phRepaint();
            });
            break;
        }
        case 'vwtrash': {
            var cur = phCurrent(); if (!cur) break;
            phConfirmDelete([cur], function () {
                phView.list = phView.list.filter(function (q) { return q.id !== cur.id; });
                if (phView.i >= phView.list.length) phView.i = phView.list.length - 1;
                if (!phView.list.length) phCloseViewer(); else phPaintViewer();
            });
            break;
        }
        case 'vwedit': {
            var e = phCurrent(); if (!e || e.kind === 'video') break;
            phSheet('', [{ n: 'Rotate', fn: function () { phRotate(e); } }]);
            break;
        }
    }
}

/* every tap inside the levels funnels through here */
$('phLevels').addEventListener('click', function (e) {
    var act = e.target.closest('[data-act]');
    if (act) { phAction(act.dataset.act, act); return; }

    var row = e.target.closest('.pa-row');
    if (row) {
        if (phAlbEdit && !row.classList.contains('fixed')) return;
        if (phAlbEdit) return;
        phGridSet = null;
        phGridAlbum = row.dataset.k;
        phRenderGrid(); phPaintNav();
        $('gridBody').scrollTop = $('gridBody').scrollHeight;
        phPush();
        return;
    }

    var cell = e.target.closest('.ph-cell');
    if (cell) {
        var id = +cell.dataset.id;
        if (phSel) {
            if (phSel.ids[id]) delete phSel.ids[id]; else phSel.ids[id] = 1;
            cell.classList.toggle('sel');
            phPaintNav(); phPaintToolbar();
            return;
        }
        var lvl = e.target.closest('.ph-level').id;
        var set;
        if (lvl === 'lv-grid') { var a = phGridSet || phAlbumByKey(phGridAlbum); set = a ? a.items : []; }
        else if (lvl === 'lv-moments') set = phLive();
        else if (lvl === 'lv-coll') set = phLive();
        else set = phLive();
        var i = 0;
        set.forEach(function (p, n) { if (p.id === id) i = n; });
        if (lvl === 'lv-years' || lvl === 'lv-coll') {
            /* the small grids drill down a level instead of opening */
            phDepth.photos = lvl === 'lv-years' ? 1 : 2;
            phPaintLevels(true);
            return;
        }
        phOpenViewer(set, i);
    }
});

/* ---- app plumbing --------------------------------------------------- */
function phReset() {
    phCloseSearch();
    phCloseSheet();
    phCloseAlbumAlert();
    $('ph-addto').classList.remove('active');
    if ($('ph-viewer').classList.contains('active')) phCloseViewer();
    if (phSel) phEndSelect();
    phAlbEdit = false;
    phRepaint();
}

var kb7 = buildKeyboard($('kb7'), { target: 'album' });
var kb8 = buildKeyboard($('kb8'), { target: 'psearch', nopred: true, retLabel: 'Search', retDim: true });

phPaintTabs();
phPaintLevels(false);
phPaintNav();
phIDB(function (err) {
    if (err) { phFwState('Unavailable'); return; }
    phLoad(function () { phSweep(); phFw(); phRepaint(); phToBottom(); });
});
