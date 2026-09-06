"use strict";
/* ------------------------------------------------------------------ */
/* SHARE SHEETS                                                       */
/* ------------------------------------------------------------------ */
/* Traced off ref_pic/ShareSheets/. Photos shows the sheet as a full
   page with the selection strip on top; Notes floats the same three
   sections as a card. Both feed the same Activities editor, so the
   glyphs and the row builders live here once. */

var SS = {
    airdrop: '<svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">' +
        '<path d="M23 41.5a4.2 4.2 0 004.2-4.2c0-2.4-4.2-8-4.2-8s-4.2 5.6-4.2 8a4.2 4.2 0 004.2 4.2z" ' +
        'fill="currentColor"/>' +
        '<path d="M15.6 27.4a9.6 9.6 0 0114.8 0M10.6 20.4a16.2 16.2 0 0124.8 0M5.6 13.4a22.8 22.8 0 0134.8 0" ' +
        'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    more: '<svg width="34" height="10" viewBox="0 0 34 10" aria-hidden="true">' +
        '<circle cx="5" cy="5" r="4.2" fill="#6E6E73"/><circle cx="17" cy="5" r="4.2" fill="#6E6E73"/>' +
        '<circle cx="29" cy="5" r="4.2" fill="#6E6E73"/></svg>',
    mail: '<svg width="42" height="42" viewBox="0 0 42 42" aria-hidden="true">' +
        '<path d="M4 12.5 21 24l17-11.5V30a1.6 1.6 0 01-1.6 1.6H5.6A1.6 1.6 0 014 30z" fill="#fff"/>' +
        '<path d="M4.6 10.4h32.8L21 21.6z" fill="#fff"/></svg>',
    notes: '<svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">' +
        '<rect width="60" height="60" fill="#FEFEFC"/><rect width="60" height="15" fill="#FBCB3B"/>' +
        '<rect y="14" width="60" height="1.6" fill="#E0B02F"/>' +
        '<g stroke="#E7E5DD" stroke-width="1.1">' +
        '<path d="M0 23h60M0 30h60M0 37h60M0 44h60M0 51h60"/></g></svg>',
    fb: '<svg width="42" height="42" viewBox="0 0 42 42" aria-hidden="true">' +
        '<path d="M25.6 42V25.7h5.5l.8-6.4h-6.3v-4.1c0-1.8.5-3.1 3.2-3.1h3.4V6.4a46 46 0 00-5-.3c-4.9 ' +
        '0-8.2 3-8.2 8.5v4.7h-5.5v6.4H19V42z" fill="#fff"/></svg>',
    tw: '<svg width="42" height="42" viewBox="0 0 42 42" aria-hidden="true">' +
        '<path d="M37 11.6a12.9 12.9 0 01-3.7 1 6.5 6.5 0 002.9-3.6 13 13 0 01-4.1 1.6 6.5 6.5 0 ' +
        '00-11 5.9A18.4 18.4 0 016.7 9.7a6.5 6.5 0 002 8.7 6.4 6.4 0 01-2.9-.8 6.5 6.5 0 005.2 6.4 ' +
        '6.5 0 01-2.9.1 6.5 6.5 0 006 4.5A13 13 0 015 31.3a18.3 18.3 0 0028.2-16.4 13.2 13.2 0 ' +
        '003.8-4z" fill="#fff"/></svg>',
    flickr: '<svg width="46" height="24" viewBox="0 0 46 24" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="10.4" fill="#0063DC"/><circle cx="34" cy="12" r="10.4" fill="#FF0084"/></svg>',
    ibooks: '<svg width="40" height="34" viewBox="0 0 40 34" aria-hidden="true">' +
        '<path d="M20 6.4C16.6 3.4 12.4 2 7.4 2A1.4 1.4 0 006 3.4v24a1.4 1.4 0 001.4 1.4c5 0 9.2 1.4 ' +
        '12.6 4.4V6.4z" fill="#fff"/>' +
        '<path d="M20 6.4C23.4 3.4 27.6 2 32.6 2A1.4 1.4 0 0134 3.4v24a1.4 1.4 0 01-1.4 1.4c-5 ' +
        '0-9.2 1.4-12.6 4.4V6.4z" fill="#fff" opacity=".82"/></svg>',
    copy: '<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">' +
        '<path d="M2 2h16v5h-11v18H2z" fill="#6E6E73"/>' +
        '<path d="M11 9h13.5L32 16.5V32H11z" fill="#6E6E73"/>' +
        '<path d="M24.5 9v7.5H32" fill="none" stroke="#F7F7F7" stroke-width="1.6"/></svg>',
    print: '<svg width="36" height="32" viewBox="0 0 36 32" aria-hidden="true">' +
        '<path d="M9 2h18v7H9z" fill="#6E6E73"/>' +
        '<rect x="1" y="9" width="34" height="13" rx="2" fill="#6E6E73"/>' +
        '<path d="M9 18h18v13H9z" fill="#F7F7F7" stroke="#6E6E73" stroke-width="2"/></svg>',
    lock: '<svg width="30" height="34" viewBox="0 0 30 34" aria-hidden="true">' +
        '<path d="M8 14V9.5a7 7 0 0114 0V14" fill="none" stroke="#6E6E73" stroke-width="3"/>' +
        '<rect x="2" y="14" width="26" height="19" rx="2.6" fill="#6E6E73"/></svg>',
    dup: '<svg width="34" height="30" viewBox="0 0 34 30" aria-hidden="true">' +
        '<rect x="12" y="1" width="21" height="17" rx="2" fill="#6E6E73"/>' +
        '<rect x="1" y="8" width="21" height="17" rx="2" fill="#6E6E73" stroke="#F7F7F7" stroke-width="2"/>' +
        '<path d="M11.5 13v7M8 16.5h7" stroke="#F7F7F7" stroke-width="2" stroke-linecap="round"/></svg>',
    slideshow: '<svg width="30" height="32" viewBox="0 0 30 32" aria-hidden="true">' +
        '<path d="M3 2 28 16 3 30z" fill="#6E6E73"/></svg>',
    hide: '<svg width="34" height="30" viewBox="0 0 34 30" aria-hidden="true">' +
        '<rect x="3" y="4" width="28" height="22" rx="2.4" fill="none" stroke="#6E6E73" stroke-width="2.4"/>' +
        '<path d="M2 28 32 2" stroke="#6E6E73" stroke-width="2.4" stroke-linecap="round"/></svg>',
    contact: '<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">' +
        '<circle cx="17" cy="17" r="16" fill="#6E6E73"/>' +
        '<circle cx="17" cy="13" r="5.4" fill="#F7F7F7"/>' +
        '<path d="M6.6 29a11.4 11.4 0 0120.8 0" fill="#F7F7F7"/></svg>',
    wallpaper: '<svg width="24" height="36" viewBox="0 0 24 36" aria-hidden="true">' +
        '<rect x="1" y="1" width="22" height="34" rx="3.4" fill="none" stroke="#6E6E73" stroke-width="2"/>' +
        '<circle cx="12" cy="30.5" r="2" fill="#6E6E73"/>' +
        '<path d="M8 4.4h8" stroke="#6E6E73" stroke-width="1.6" stroke-linecap="round"/></svg>',
    grip: '<div class="ss-grip"><i></i><i></i><i></i></div>',
    tick: '<svg width="15" height="12" viewBox="0 0 15 12" aria-hidden="true">' +
        '<path d="M1.2 6.2 5.4 10.4 13.6 1.6" fill="none" stroke="#fff" stroke-width="2.2" ' +
        'stroke-linecap="round" stroke-linejoin="round"/></svg>',
    vid: '<svg width="15" height="11" viewBox="0 0 15 11" aria-hidden="true">' +
        '<path d="M0 1.6A1.6 1.6 0 011.6 0h5.6a1.6 1.6 0 011.6 1.6v7.8A1.6 1.6 0 017.2 11H1.6A1.6 ' +
        '1.6 0 010 9.4zM10.4 4 15 1.2v8.6l-4.6-2.8z" fill="#fff"/></svg>'
};

var SS_AIR_OFF = '<b>AirDrop</b>. Tap to turn on Wi-Fi and Bluetooth to share with AirDrop.';
var SS_AIR_ON = '<b>AirDrop</b>. Share instantly with people nearby. If they turn on AirDrop from ' +
    'Control Center on iOS or from Finder on the Mac, you&rsquo;ll see their names here. Just tap to share.';
var ssAir = false;

function ssRenderAir(el) {
    el.className = 'ss-air' + (ssAir ? ' on' : '');
    el.innerHTML = '<div class="ss-airtile">' + SS.airdrop + '</div>' +
        '<div class="ss-airtext">' + (ssAir ? SS_AIR_ON : SS_AIR_OFF) + '</div>';
}
function ssRenderRow(el, items) {
    el.innerHTML = items.map(function (it, i) {
        return '<div class="ss-item" data-i="' + i + '">' +
            '<div class="ss-tile ' + (it.cls || '') + '">' + (it.ic || '') + '</div>' +
            '<div class="ss-label">' + it.n + '</div></div>';
    }).join('');
}
function ssRenderActs(el, items, withIcons) {
    el.innerHTML = items.map(function (it, i) {
        return '<div class="ss-actrow" data-i="' + i + '">' +
            (withIcons ? '<div class="ss-tile ' + (it.cls || '') + '">' + (it.ic || '') + '</div>' : '') +
            '<div class="ss-actname">' + it.n + '</div>' +
            (it.sw === undefined ? '' : '<div class="ss-sw' + (it.sw ? ' on' : '') + '"></div>') +
            SS.grip + '</div>';
    }).join('');
}

/* ================= PHOTOS ================= */
var PH_SS_APPS = [
    { n: 'Mail', ic: SS.mail, cls: 'mail' },
    { n: 'Add to Notes', ic: SS.notes, cls: 'notes' },
    { n: 'Facebook', ic: SS.fb, cls: 'fb', sw: true },
    { n: 'Twitter', ic: SS.tw, cls: 'tw', sw: true },
    { n: 'Flickr', ic: SS.flickr, cls: 'flickr', sw: true },
    { n: 'Save PDF to iBooks', ic: SS.ibooks, cls: 'ibooks' }
];
PH_SS_APPS[1].sw = true;
var PH_SS_ACTS = [
    { n: 'Duplicate', ic: SS.dup },
    { n: 'Slideshow', ic: SS.slideshow },
    { n: 'Hide', ic: SS.hide },
    { n: 'Copy', ic: SS.copy },
    { n: 'Print', ic: SS.print },
    { n: 'Assign to Contact', ic: SS.contact },
    { n: 'Use as Wallpaper', ic: SS.wallpaper }
];
var phSSItems = [], phActsWhich = 'acts';

function phMore() { return { n: 'More', ic: SS.more }; }

function phRenderShare() {
    $('phSSTitle').textContent = phNoun(phSSItems) + ' Selected';
    /* the strip shows the whole roll with the shared ones ticked */
    var roll = phLive().slice().sort(function (a, b) { return b.taken - a.taken; });
    $('phSSStrip').innerHTML = roll.map(function (p) {
        var on = phSSItems.indexOf(p) > -1;
        return '<div class="ss-shot' + (on ? ' on' : '') + '" data-id="' + p.id + '"' +
            ' style="background-image:url(' + phThumbURL(p) + ')">' +
            '<div class="ss-ring">' + SS.tick + '</div>' +
            (p.kind === 'video' ? '<div class="ss-dur">' + SS.vid + '<span>' + phDur(p.dur) +
                '</span></div>' : '') +
            '</div>';
    }).join('');
    ssRenderAir($('phSSAir'));
    ssRenderRow($('phSSApps'), PH_SS_APPS.filter(function (a) { return a.sw !== false; }).concat([phMore()]));
    ssRenderRow($('phSSActs'), PH_SS_ACTS.concat([phMore()]));
}

function phShareSheet(items) {
    if (!items || !items.length) return;
    phSSItems = items.slice();
    phRenderShare();
    $('ph-share').classList.add('active');
}
$('phSSCancel').addEventListener('click', function () { $('ph-share').classList.remove('active'); });

$('phSSAir').addEventListener('click', function () { ssAir = !ssAir; ssRenderAir($('phSSAir')); });
$('phSSStrip').addEventListener('click', function (e) {
    var s = e.target.closest('.ss-shot'); if (!s) return;
    var p = phById(+s.dataset.id); if (!p) return;
    var i = phSSItems.indexOf(p);
    if (i > -1) { if (phSSItems.length === 1) return; phSSItems.splice(i, 1); }
    else phSSItems.push(p);
    phRenderShare();
});

$('phSSApps').addEventListener('click', function (e) {
    var it = e.target.closest('.ss-item'); if (!it) return;
    var list = PH_SS_APPS.filter(function (a) { return a.sw !== false; });
    var pick = list.concat([phMore()])[+it.dataset.i];
    if (pick.n === 'More') { phActsWhich = 'apps'; phOpenActs(); return; }
    if (pick.n === 'Add to Notes') { phAddToNotes(phSSItems); return; }
    $('ph-share').classList.remove('active');
});
$('phSSActs').addEventListener('click', function (e) {
    var it = e.target.closest('.ss-item'); if (!it) return;
    var pick = PH_SS_ACTS.concat([phMore()])[+it.dataset.i];
    if (pick.n === 'More') { phActsWhich = 'acts'; phOpenActs(); return; }
    if (pick.n === 'Duplicate') { phDuplicate(phSSItems); return; }
    $('ph-share').classList.remove('active');
});

function phOpenActs() {
    if (phActsWhich === 'apps') ssRenderActs($('phActsBody'), PH_SS_APPS, true);
    else ssRenderActs($('phActsBody'), PH_SS_ACTS, false);
    $('ph-acts').classList.add('active');
}
$('phActsDone').addEventListener('click', function () { $('ph-acts').classList.remove('active'); });
$('phActsBody').addEventListener('click', function (e) {
    var sw = e.target.closest('.ss-sw'); if (!sw) return;
    var row = sw.closest('.ss-actrow');
    PH_SS_APPS[+row.dataset.i].sw = !PH_SS_APPS[+row.dataset.i].sw;
    sw.classList.toggle('on');
});

/* two of the activities are cheap enough to actually do */
function phDuplicate(items) {
    $('ph-share').classList.remove('active');
    if (!PH_DB) return;
    var tx = phTx(['photos'], 'readwrite'), st = tx.objectStore('photos');
    items.forEach(function (p) {
        var c = {};
        for (var k in p) if (k !== 'id') c[k] = p[k];
        c.added = Date.now();
        st.add(c);
    });
    tx.oncomplete = function () { phLoad(function () { phEndSelect(); phRepaint(); }); };
}
function phAddToNotes(items) {
    $('ph-share').classList.remove('active');
    var n = ntMk('notes', new Date(), '', null, items.map(function (p) {
        return {
            k: p.kind === 'video' ? 'video' : 'photo', n: p.name || ('IMG_' + p.id),
            x: p.kind === 'video' ? phDur(p.dur) : ''
        };
    }));
    NT_NOTES.push(n);
    phEndSelect();
    phRepaint();
}

/* ================= NOTES ================= */
var NT_SS_APPS = [
    { n: 'Mail', ic: SS.mail, cls: 'mail' }
];
function ntSSActs() {
    var locked = ntCur && ntCur.lock;
    return [
        { n: 'Copy', ic: SS.copy },
        { n: 'Print', ic: SS.print },
        { n: locked ? 'Remove Lock' : 'Lock Note', ic: SS.lock }
    ];
}
function ntRenderShare() {
    ssRenderAir($('ntSSAir'));
    ssRenderRow($('ntSSApps'), NT_SS_APPS.concat([{ n: 'More', ic: SS.more }]));
    ssRenderRow($('ntSSActs'), ntSSActs().concat([{ n: 'More', ic: SS.more }]));
}
function ntOpenShare() {
    if (!ntCur) return;
    ntRenderShare();
    $('ntSS').classList.add('up');
}
function ntCloseShare() { $('ntSS').classList.remove('up'); }
$('ntSSCancel').addEventListener('click', ntCloseShare);
$('ntSS').addEventListener('click', function (e) { if (e.target === $('ntSS')) ntCloseShare(); });
$('ntSSAir').addEventListener('click', function () { ssAir = !ssAir; ssRenderAir($('ntSSAir')); });

$('ntSSApps').addEventListener('click', function (e) {
    var it = e.target.closest('.ss-item'); if (!it) return;
    var pick = NT_SS_APPS.concat([{ n: 'More' }])[+it.dataset.i];
    if (pick.n === 'More') { ntOpenActs('apps'); return; }
    ntCloseShare();
});
$('ntSSActs').addEventListener('click', function (e) {
    var it = e.target.closest('.ss-item'); if (!it) return;
    var acts = ntSSActs();
    var pick = acts.concat([{ n: 'More' }])[+it.dataset.i];
    if (pick.n === 'More') { ntOpenActs('acts'); return; }
    if (pick.n === 'Lock Note') { ntCloseShare(); ntAskPw('lock'); return; }
    if (pick.n === 'Remove Lock') { ntCloseShare(); ntRemoveLock(); return; }
    ntCloseShare();
});

var ntActsWhich = 'acts';
function ntOpenActs(which) {
    ntActsWhich = which;
    if (which === 'apps') ssRenderActs($('ntActsBody'), NT_SS_APPS, true);
    else ssRenderActs($('ntActsBody'), ntSSActs(), false);
    $('ntActs').classList.add('up');
}
$('ntActsDone').addEventListener('click', function () { $('ntActs').classList.remove('up'); });
$('ntActsBody').addEventListener('click', function (e) {
    var sw = e.target.closest('.ss-sw'); if (!sw || ntActsWhich !== 'apps') return;
    var row = sw.closest('.ss-actrow');
    NT_SS_APPS[+row.dataset.i].sw = !NT_SS_APPS[+row.dataset.i].sw;
    sw.classList.toggle('on');
});

/* ---- locking --------------------------------------------------------- */
/* One password for the app, set the first time a note is locked -- which
   is what the alert's wording assumes. `open` is per-session: locking a
   note leaves it readable until you hit Lock Now or leave Notes. */
var NT_PW = null, ntPwMode = 'lock', ntPwVal = '';

var NT_LOCK_SHUT = '<svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true">' +
    '<path d="M6.5 12V8a6.5 6.5 0 0113 0v4" fill="none" stroke="currentColor" stroke-width="2.4"/>' +
    '<rect x="1.4" y="12" width="23.2" height="17" rx="2.6" fill="none" stroke="currentColor" ' +
    'stroke-width="2.4"/></svg>';
var NT_LOCK_OPEN = '<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">' +
    '<path d="M10.5 12V8a6.5 6.5 0 0113 0v1.6" fill="none" stroke="currentColor" stroke-width="2.4"/>' +
    '<rect x="1.4" y="12" width="23.2" height="17" rx="2.6" fill="none" stroke="currentColor" ' +
    'stroke-width="2.4"/></svg>';
var NT_LOCK_BIG = '<svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">' +
    '<path d="M27 44V30a23 23 0 0146 0v14" fill="none" stroke="currentColor" stroke-width="13"/>' +
    '<rect x="19" y="44" width="62" height="46" rx="6" fill="currentColor"/></svg>';

$('ntLockView').addEventListener('click', function () { ntAskPw('view'); });
$('ntLockBtn').addEventListener('click', function () {
    if (!ntCur || !ntCur.lock) return;
    if (ntCur.lock.open) { ntCur.lock.open = false; ntSyncLock(); }
    else ntAskPw('view');
});
$('ntLockNow').addEventListener('click', function () {
    NT_NOTES.forEach(function (n) { if (n.lock) n.lock.open = false; });
    ntRenderList();
});

function ntAskPw(mode) {
    ntPwMode = mode; ntPwVal = '';
    $('ntPwTitle').textContent = mode === 'lock' ? 'Lock Note' : 'View Note';
    $('ntPwMsg').textContent = mode === 'lock'
        ? 'Enter your password to lock this note.'
        : 'Enter your password to view this note.';
    $('ntPwAlert').classList.add('up');
    openKB(kbN4);
    ntPwSync();
}
function ntPwSync() {
    var up = $('ntPwAlert').classList.contains('up');
    $('ntPwField').classList.toggle('empty', !ntPwVal);
    $('ntPwVal').innerHTML = new Array(ntPwVal.length + 1).join('&bull;') +
        (up ? '<span class="caret nt"></span>' : '');
}
function ntPwClose() { closeKB(kbN4); $('ntPwAlert').classList.remove('up'); }
$('ntPwCancel').addEventListener('click', ntPwClose);
$('ntPwOK').addEventListener('click', function () {
    if (!ntPwVal) return;
    if (ntPwMode === 'lock') {
        if (NT_PW === null) NT_PW = ntPwVal;      /* first lock sets the password */
        if (ntPwVal !== NT_PW) return ntPwShake();
        ntCur.lock = { open: true };
    } else {
        if (ntPwVal !== NT_PW) return ntPwShake();
        ntCur.lock.open = true;
    }
    ntPwClose();
    ntSyncLock();
    ntRenderList();
});
function ntPwShake() {
    ntPwVal = ''; ntPwSync();
    var a = $('ntPwAlert').firstElementChild;
    a.style.transition = 'none'; a.style.transform = 'translateX(-10px)';
    setTimeout(function () {
        a.style.transition = 'transform .3s cubic-bezier(.36,.07,.19,.97)';
        a.style.transform = '';
    }, 20);
}
function ntRemoveLock() {
    if (!ntCur) return;
    ntCur.lock = null;
    ntSyncLock();
    ntRenderList();
}

/* the note screen reads its whole state off the note's lock */
function ntSyncLock() {
    var n = ntCur, has = !!(n && n.lock), shut = has && !n.lock.open;
    $('nt-note').classList.toggle('haslock', has);
    $('nt-note').classList.toggle('locked', shut);
    $('ntLockBtn').innerHTML = has ? (shut ? NT_LOCK_SHUT : NT_LOCK_OPEN) : '';
    if (shut) ntSetEditingNote(false);
}
$('ntLocked').firstElementChild.innerHTML = NT_LOCK_BIG;
