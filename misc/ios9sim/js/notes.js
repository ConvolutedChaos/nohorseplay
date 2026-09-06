"use strict";
/* ------------------------------------------------------------------ */
/* NOTES                                                              */
/* ------------------------------------------------------------------ */
/* Traced off ref_pic/Notes/. The library holds the notes that are
   legible in the screenshots -- the real device has thirty, so every
   count on screen is computed from the data rather than written down,
   and filling the rest in makes the numbers right on their own.
   A note's body is one string; `fmt` and `chk` run alongside it, one
   entry per line, because the keyboard here only ever appends. */

var NT_TINT = '#D9A21A';

function ntMk(f, d, body, fmt, att) {
    var lines = body.split('\n');
    var o = {
        f: f, d: d, body: body, att: att || [],
        fmt: [], chk: []
    };
    for (var i = 0; i < lines.length; i++) {
        o.fmt.push(fmt && fmt[i] ? fmt[i] : 'body');
        o.chk.push(o.fmt[i] === 'check' ? false : null);
    }
    return o;
}

var NT_FOLDERS = [
    { id: 'notes', n: 'Notes', fixed: true }
];

var NT_NOTES = [
    ntMk('notes', new Date(2026, 6, 21), 'Hello')
];
/* the three tiles in the attachment browser's top strip */
NT_NOTES[0].att = [{ k: 'photo', n: 'IMG_0412' }];

var NT_TRASH = [];

/* ---- reading a note -------------------------------------------------- */
function ntLines(n) { return n.body.split('\n'); }
function ntTitle(n) {
    var L = ntLines(n);
    for (var i = 0; i < L.length; i++) if (L[i].trim()) return L[i];
    return 'New Note';
}
function ntPreview(n) {
    var L = ntLines(n), seen = false, rest = [];
    for (var i = 0; i < L.length; i++) {
        if (!L[i].trim()) continue;
        if (!seen) { seen = true; continue; }
        rest.push(L[i]);
    }
    if (rest.length) return rest.join(' ');
    if (n.att.length) {
        var w = { audio: 'audio recording', doc: 'document', video: 'video', photo: 'photo' }[n.att[0].k];
        return n.att.length + ' ' + w + (n.att.length > 1 ? 's' : '');
    }
    return 'No additional text';
}
var NT_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function ntDate(d) {
    var now = new Date(), day = 86400000;
    var a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var diff = Math.round((a - b) / day);
    if (diff === 0) {
        var h = d.getHours(), m = d.getMinutes();
        return ((h % 12) || 12) + ':' + ('0' + m).slice(-2) + ' ' + (h < 12 ? 'AM' : 'PM');
    }
    if (diff === 1) return 'Yesterday';
    if (diff > 1 && diff < 7) return NT_DAYS[d.getDay()];
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' + ('' + d.getFullYear()).slice(-2);
}
function ntIn(fid) {
    var out = NT_NOTES.filter(function (n) { return fid === 'all' || n.f === fid; });
    return out.sort(function (a, b) { return b.d - a.d; });
}

/* ---- folders --------------------------------------------------------- */
var ntFEditing = false;
var NT_CHEV = '<svg width="9" height="15" viewBox="0 0 9 15" aria-hidden="true">' +
    '<path d="M1.4 1.3 7.4 7.5l-6 6.2" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';
var NT_TICK = '<svg width="15" height="12" viewBox="0 0 15 12" aria-hidden="true">' +
    '<path d="M1.2 6.2 5.4 10.4 13.6 1.6" fill="none" stroke="#fff" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

function ntRenderFolders() {
    var h = '<div class="nt-fhdr">ON MY IPOD TOUCH</div>';
    var rows = [{ id: 'all', n: 'All On My iPod touch', c: NT_NOTES.length }];
    NT_FOLDERS.forEach(function (f) {
        rows.push({ id: f.id, n: f.n, c: ntIn(f.id).length, del: !f.fixed });
    });
    if (NT_TRASH.length) rows.push({ id: 'trash', n: 'Recently Deleted', c: NT_TRASH.length });

    rows.forEach(function (r, i) {
        h += '<div class="nt-frow' + (i === 0 ? ' first' : '') + '" data-f="' + r.id + '">' +
            (ntFEditing && r.del ? '<div class="nt-fminus" data-del="' + r.id + '"></div>' : '') +
            '<div class="nt-fname">' + esc(r.n) + '</div>' +
            '<div class="nt-fcount">' + r.c + '</div>' +
            '<div class="nt-chev">' + NT_CHEV + '</div></div>';
    });
    $('ntFolders').innerHTML = h;
}

$('ntFEdit').addEventListener('click', function () {
    ntFEditing = !ntFEditing;
    $('ntFEdit').textContent = ntFEditing ? 'Done' : 'Edit';
    ntRenderFolders();
});

$('ntFolders').addEventListener('click', function (e) {
    var d = e.target.closest('.nt-fminus');
    if (d) {
        var id = d.dataset.del;
        NT_NOTES = NT_NOTES.filter(function (n) { return n.f !== id; });
        NT_FOLDERS = NT_FOLDERS.filter(function (f) { return f.id !== id; });
        ntRenderFolders();
        return;
    }
    var row = e.target.closest('.nt-frow');
    if (!row || ntFEditing) return;
    ntOpenFolder(row.dataset.f);
});

/* ---- the note list --------------------------------------------------- */
var ntFolder = 'all', ntSel = [], ntSelecting = false, ntQuery = '', ntSearching = false;

function ntFolderName(id) {
    if (id === 'all') return 'On My iPod touch';
    if (id === 'trash') return 'Recently Deleted';
    var f = NT_FOLDERS.filter(function (x) { return x.id === id; })[0];
    return f ? f.n : 'Notes';
}
function ntRows() {
    var src = ntFolder === 'trash' ? NT_TRASH.slice().sort(function (a, b) { return b.d - a.d; })
        : ntIn(ntFolder);
    if (!ntQuery.trim()) return src;
    var q = ntQuery.toLowerCase();
    return src.filter(function (n) { return n.body.toLowerCase().indexOf(q) > -1; });
}

function ntOpenFolder(id) {
    ntFolder = id;
    ntSel = [];
    ntQuery = '';
    ntSetSelecting(false);
    ntSetSearching(false);
    $('ntLTitle').textContent = ntFolderName(id);
    $('nt-list').classList.toggle('trash', id === 'trash');
    ntRenderList();
    push($('nt-folders'), $('nt-list'));
}

function ntRenderList() {
    var rows = ntRows(), h = '';
    rows.forEach(function (n, i) {
        h += '<div class="nt-row' + (i === 0 ? ' first' : '') +
            (n.lock ? ' haslock' : '') +
            (ntSel.indexOf(n) > -1 ? ' on' : '') + '" data-k="' + i + '">' +
            '<div class="nt-ring">' + NT_TICK + '</div>' +
            '<div class="nt-rtitle">' + esc(ntTitle(n)) + '</div>' +
            '<div class="nt-rsub"><span class="nt-rdate">' + ntDate(n.d) + '</span>' +
            '<span class="nt-rprev">' + (n.lock ? (n.lock.open ? 'Unlocked' : 'Locked')
                : esc(ntPreview(n))) + '</span></div>' +
            (n.lock ? '<div class="nt-rlock">' + (n.lock.open ? NT_LOCK_OPEN : NT_LOCK_SHUT) +
                '</div>' : '') + '</div>';
    });
    $('ntRows').innerHTML = h;
    var c = rows.length;
    $('ntCount').textContent = c === 0 ? 'No Notes' : c + (c === 1 ? ' Note' : ' Notes');
    $('nt-list').classList.toggle('anyopen', NT_NOTES.some(function (n) {
        return n.lock && n.lock.open;
    }));
    ntSyncSelBar();
    ntSyncSearch();
}

function ntSyncSelBar() {
    var any = ntSel.length > 0;
    $('ntMoveBtn').textContent = any ? 'Move' : 'Move All';
    $('ntDelBtn').textContent = any ? 'Delete' : 'Delete All';
    $('ntMoveBtn').classList.toggle('dim', !ntRows().length);
    $('ntDelBtn').classList.toggle('dim', !ntRows().length);
}
function ntSetSelecting(on) {
    ntSelecting = on;
    if (!on) ntSel = [];
    $('nt-list').classList.toggle('selecting', on);
    $('ntLEdit').textContent = on ? 'Cancel' : 'Edit';
    $('ntLBack').style.visibility = on ? 'hidden' : '';
    ntRenderList();
}
$('ntLEdit').addEventListener('click', function () { ntSetSelecting(!ntSelecting); });
$('ntLBack').addEventListener('click', function () {
    ntRenderFolders();
    pop($('nt-list'), $('nt-folders'));
});

$('ntRows').addEventListener('click', function (e) {
    var row = e.target.closest('.nt-row'); if (!row) return;
    var n = ntRows()[+row.dataset.k]; if (!n) return;
    if (ntSelecting) {
        var i = ntSel.indexOf(n);
        if (i > -1) ntSel.splice(i, 1); else ntSel.push(n);
        ntRenderList();
        return;
    }
    ntOpenNote(n);
});

/* Move puts the picked notes somewhere else; from the trash that is
   what "restore" means */
$('ntMoveBtn').addEventListener('click', function () {
    var picked = ntSel.length ? ntSel.slice() : ntRows();
    if (!picked.length) return;
    ntSheet(NT_FOLDERS.map(function (f) {
        return {
            n: f.n, fn: function () {
                picked.forEach(function (n) {
                    var t = NT_TRASH.indexOf(n);
                    if (t > -1) { NT_TRASH.splice(t, 1); NT_NOTES.push(n); }
                    n.f = f.id;
                });
                ntAfterBulk();
            }
        };
    }));
});
$('ntDelBtn').addEventListener('click', function () {
    var picked = ntSel.length ? ntSel.slice() : ntRows();
    if (!picked.length) return;
    picked.forEach(function (n) {
        if (ntFolder === 'trash') {
            var t = NT_TRASH.indexOf(n); if (t > -1) NT_TRASH.splice(t, 1);
        } else ntDelete(n);
    });
    ntAfterBulk();
});
function ntAfterBulk() {
    ntSel = [];
    if (ntFolder === 'trash' && !NT_TRASH.length) {
        ntRenderFolders();
        pop($('nt-list'), $('nt-folders'));
        ntSetSelecting(false);
        return;
    }
    ntSetSelecting(false);
}
function ntDelete(n) {
    var i = NT_NOTES.indexOf(n);
    if (i > -1) { NT_NOTES.splice(i, 1); NT_TRASH.push(n); }
}

/* ---- search ---------------------------------------------------------- */
function ntSetSearching(on) {
    ntSearching = on;
    $('nt-list').classList.toggle('searching', on);
    if (on) openKB(kbN3); else { closeKB(kbN3); ntQuery = ''; }
    ntSyncSearch();
}
function ntSyncSearch() {
    $('ntSField').classList.toggle('empty', !ntQuery);
    $('ntSVal').innerHTML = esc(ntQuery) + (ntSearching ? '<span class="caret nt"></span>' : '');
}
$('ntSField').addEventListener('click', function () { if (!ntSearching) ntSetSearching(true); });
$('ntSCancel').addEventListener('click', function () { ntSetSearching(false); ntRenderList(); });

/* ---- the editor ------------------------------------------------------ */
var ntCur = null, ntEditingNote = false;

function ntReflow(n) {
    var L = ntLines(n).length;
    while (n.fmt.length < L) {
        var p = n.fmt[n.fmt.length - 1] || 'body';
        /* headings drop back to body on the next line; lists carry on */
        var nx = (p === 'title' || p === 'heading') ? 'body' : p;
        n.fmt.push(nx);
        n.chk.push(nx === 'check' ? false : null);
    }
    n.fmt.length = L; n.chk.length = L;
}

function ntRenderNote() {
    var n = ntCur; if (!n) return;
    ntReflow(n);
    var L = ntLines(n), h = '', num = 0;
    for (var i = 0; i < L.length; i++) {
        var f = n.fmt[i], mark = '';
        if (f === 'number') { num++; mark = '<div class="nt-lmark">' + num + '.</div>'; }
        else { num = 0; }
        if (f === 'bullet') mark = '<div class="nt-lmark">&bull;</div>';
        if (f === 'dash') mark = '<div class="nt-lmark">&ndash;</div>';
        if (f === 'check') mark = '<div class="nt-check' + (n.chk[i] ? ' on' : '') +
            '" data-chk="' + i + '">' + NT_TICK + '</div>';
        var head = (i === 0 && f === 'body') ? ' head' : '';
        var caret = (ntEditingNote && i === L.length - 1) ? '<span class="caret nt"></span>' : '';
        h += '<div class="nt-line f-' + f + head + '" data-i="' + i + '">' + mark +
            '<div class="nt-ltext">' + esc(L[i]) + caret + '</div></div>';
    }
    $('ntEditor').innerHTML = h;
}

function ntOpenNote(n) {
    ntCur = n;
    $('ntNBackLbl').textContent = ntFolderName(ntFolder);
    ntSetEditingNote(false);
    ntRenderNote();
    ntSyncLock();
    $('ntEditor').scrollTop = 0;
    push($('nt-list'), $('nt-note'));
}
function ntSetEditingNote(on) {
    ntEditingNote = on;
    $('nt-note').classList.toggle('editing', on);
    if (!on) $('nt-note').classList.remove('plusopen');
    if (on) openKB(kbN); else closeKB(kbN);
    ntRenderNote();
}
$('ntEditor').addEventListener('click', function (e) {
    var c = e.target.closest('.nt-check');
    if (c) { var i = +c.dataset.chk; ntCur.chk[i] = !ntCur.chk[i]; ntRenderNote(); return; }
    if (!ntEditingNote) ntSetEditingNote(true);
});
$('ntDone').addEventListener('click', function () { ntSetEditingNote(false); });
$('ntNBack').addEventListener('click', function () {
    ntSetEditingNote(false);
    ntRenderList();
    pop($('nt-note'), $('nt-list'));
});
/* ntOpenShare lives in share-sheets.js, which loads after this file, so it is
   called from inside a handler rather than passed by reference here. */
$('ntShare').addEventListener('click', function () { ntOpenShare(); });

$('ntTrash').addEventListener('click', function () {
    if (!ntCur) return;
    ntDelete(ntCur);
    ntCur = null;
    ntRenderList();
    pop($('nt-note'), $('nt-list'));
});
function ntCompose() {
    var fid = (ntFolder === 'all' || ntFolder === 'trash') ? 'notes' : ntFolder;
    var n = ntMk(fid, new Date(), '');
    NT_NOTES.push(n);
    ntRenderList();
    ntOpenNote(n);
    ntSetEditingNote(true);
}
$('ntCompose').addEventListener('click', ntCompose);
$('ntNCompose').addEventListener('click', function () {
    ntSetEditingNote(false);
    pop($('nt-note'), $('nt-list'));
    setTimeout(ntCompose, 340);
});

/* checklist button toggles the format of the line being written */
function ntToggleCheck() {
    if (!ntCur) return;
    var i = ntLines(ntCur).length - 1;
    ntReflow(ntCur);
    if (ntCur.fmt[i] === 'check') { ntCur.fmt[i] = 'body'; ntCur.chk[i] = null; }
    else { ntCur.fmt[i] = 'check'; ntCur.chk[i] = false; }
    ntRenderNote();
}
$('ntCheckBtn').addEventListener('click', function () {
    if (!ntEditingNote) ntSetEditingNote(true);
    ntToggleCheck();
});
$('ntPCheck').addEventListener('click', ntToggleCheck);

$('ntPlus').addEventListener('click', function () { $('nt-note').classList.add('plusopen'); });
$('ntPClose').addEventListener('click', function () { $('nt-note').classList.remove('plusopen'); });

/* ---- formatting ------------------------------------------------------ */
var NT_FMTS = [
    { k: 'title', n: 'Title', c: 's-title' },
    { k: 'heading', n: 'Heading', c: 's-heading' },
    { k: 'body', n: 'Body', c: 's-body' },
    { k: 'bullet', n: '&bull;&nbsp; Bulleted List', c: 's-list' },
    { k: 'dash', n: '&ndash;&nbsp; Dashed List', c: 's-list' },
    { k: 'number', n: '1.&nbsp; Numbered List', c: 's-list' }
];
var NT_BTICK = '<svg class="tick" width="17" height="13" viewBox="0 0 17 13" aria-hidden="true">' +
    '<path d="M1.4 6.8 6 11.4 15.4 1.6" fill="none" stroke="#000" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

function ntCurFmt() {
    if (!ntCur) return 'body';
    ntReflow(ntCur);
    return ntCur.fmt[ntLines(ntCur).length - 1] || 'body';
}
function ntRenderFmt() {
    var cur = ntCurFmt();
    $('ntFRows').innerHTML = NT_FMTS.map(function (f) {
        return '<div class="nt-frw ' + f.c + (f.k === cur ? ' on' : '') + '" data-k="' + f.k + '">' +
            f.n + NT_BTICK + '</div>';
    }).join('');
}
$('ntPFmt').addEventListener('click', function () {
    ntRenderFmt();
    $('ntFmt').classList.add('up');
});
$('ntFDone').addEventListener('click', function () { $('ntFmt').classList.remove('up'); });
$('ntFRows').addEventListener('click', function (e) {
    var r = e.target.closest('.nt-frw'); if (!r || !ntCur) return;
    var i = ntLines(ntCur).length - 1;
    ntReflow(ntCur);
    ntCur.fmt[i] = r.dataset.k;
    ntCur.chk[i] = r.dataset.k === 'check' ? false : null;
    ntRenderFmt();
    ntRenderNote();
});

/* ---- action sheet ---------------------------------------------------- */
var ntSheetCb = null;
function ntSheet(buttons) {
    $('ntSGroup').innerHTML = buttons.map(function (b, i) {
        return '<div class="nt-sbtn" data-i="' + i + '">' + esc(b.n) + '</div>';
    }).join('');
    ntSheetCb = buttons;
    $('ntSheet').classList.add('up');
}
$('ntSheet').addEventListener('click', function (e) {
    var b = e.target.closest('.nt-sbtn');
    if (!b) { if (e.target === $('ntSheet')) $('ntSheet').classList.remove('up'); return; }
    var spec = b.id === 'ntSCancelBtn' ? null : ntSheetCb && ntSheetCb[+b.dataset.i];
    $('ntSheet').classList.remove('up');
    if (spec && spec.fn) spec.fn();
});

/* the camera button offers the same two choices the real app does; the
   Camera app owns the hardware, so this hands off to it */
function ntCamera() {
    ntSheet([
        { n: 'Photo Library', fn: function () { appHandOff('photos'); } },
        { n: 'Take Photo or Video', fn: function () { appHandOff('camera'); } }
    ]);
}
$('ntCamBtn').addEventListener('click', ntCamera);
$('ntPCam').addEventListener('click', ntCamera);

/* ---- attachments ----------------------------------------------------- */
var NT_VIDBADGE = '<svg width="15" height="11" viewBox="0 0 15 11" aria-hidden="true">' +
    '<path d="M0 1.6A1.6 1.6 0 011.6 0h5.6a1.6 1.6 0 011.6 1.6v7.8A1.6 1.6 0 017.2 11H1.6A1.6 1.6 0 010 ' +
    '9.4zM10.4 4 15 1.2v8.6l-4.6-2.8z" fill="#fff"/></svg>';
var NT_DOCICON = '<svg width="30" height="38" viewBox="0 0 30 38" aria-hidden="true">' +
    '<rect x="4" y="6" width="22" height="26" rx="3" fill="#3EA9E8"/>' +
    '<rect x="12.5" y="12" width="5" height="14" rx="1" fill="#F5D33F"/></svg>';

function ntPicGlyph() {
    return '<svg width="34" height="30" viewBox="0 0 34 30" aria-hidden="true">' +
        '<rect x="1" y="1" width="32" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>' +
        '<circle cx="10" cy="10" r="3.2" fill="currentColor"/>' +
        '<path d="M2.4 25.6 12 15.4l6.6 6.6 5.4-4.6 7.6 8.2z" fill="currentColor"/></svg>';
}
function ntAttachments() {
    var all = [];
    NT_NOTES.concat(NT_TRASH).forEach(function (n) {
        n.att.forEach(function (a) { all.push(a); });
    });
    return all;
}
function ntRenderAttach() {
    var all = ntAttachments(), h = '';
    var pics = all.filter(function (a) { return a.k === 'photo' || a.k === 'video'; });
    var auds = all.filter(function (a) { return a.k === 'audio'; });
    var docs = all.filter(function (a) { return a.k === 'doc'; });

    function head(name) {
        return '<div class="nt-ahead"><div class="nt-aname">' + name +
            '</div><div class="nt-aall">Show All</div></div>';
    }
    if (pics.length) {
        h += '<div class="nt-asec">' + head('Photos and Videos') + '<div class="nt-astrip">' +
            pics.map(function (a) {
                return '<div class="nt-atile">' + ntPicGlyph() +
                    (a.k === 'video' ? '<div class="nt-abadge">' + NT_VIDBADGE +
                        '<span>' + a.x + '</span></div>' : '') + '</div>';
            }).join('') + '</div></div>';
    }
    if (auds.length) {
        h += '<div class="nt-asec">' + head('Audio') +
            auds.map(function (a) {
                return '<div class="nt-arow"><div class="nt-atext">' +
                    '<div class="nt-atitle">' + esc(a.n) + '</div>' +
                    '<div class="nt-asub">' + esc(a.s + ', ' + a.x) + '</div></div>' +
                    '<div class="nt-aplay"><svg width="20" height="24" viewBox="0 0 20 24">' +
                    '<path d="M2 1.5 19 12 2 22.5z" fill="currentColor"/></svg></div></div>';
            }).join('') + '</div>';
    }
    if (docs.length) {
        h += '<div class="nt-asec">' + head('Documents') +
            docs.map(function (a) {
                return '<div class="nt-arow"><div class="nt-atext">' +
                    '<div class="nt-atitle">' + esc(a.n) + '</div>' +
                    '<div class="nt-asub">' + esc(a.s) + '</div></div>' +
                    '<div class="nt-adoc">' + NT_DOCICON + '</div></div>';
            }).join('') + '</div>';
    }
    $('ntABody').innerHTML = h || '<div class="nt-fhdr">No Attachments</div>';
}
$('ntAttachBtn').addEventListener('click', function () {
    ntRenderAttach();
    $('nt-attach').classList.add('active');
});
$('ntADone').addEventListener('click', function () {
    $('nt-attach').classList.remove('active');
});

/* ---- New Folder ------------------------------------------------------ */
var ntFName = '';
function ntFSync() {
    var up = $('ntAlert').classList.contains('up');
    $('ntAField').classList.toggle('empty', !ntFName);
    $('ntAVal').innerHTML = esc(ntFName) + (up ? '<span class="caret nt"></span>' : '');
    $('ntASave').classList.toggle('dim', !ntFName.trim());
}
$('ntNewFolder').addEventListener('click', function () {
    ntFName = '';
    $('ntAlert').classList.add('up');
    openKB(kbN2);
    ntFSync();
});
function ntCloseAlert() { closeKB(kbN2); $('ntAlert').classList.remove('up'); }
$('ntACancel').addEventListener('click', ntCloseAlert);
$('ntASave').addEventListener('click', function () {
    var nm = ntFName.trim(); if (!nm) return;
    NT_FOLDERS.push({ id: 'f' + Date.now(), n: nm });
    ntCloseAlert();
    ntRenderFolders();
});

var kbN = buildKeyboard($('kbN'), { target: 'note' });
var kbN2 = buildKeyboard($('kbN2'), { target: 'ntfolder', nopred: true, retLabel: 'Save', retDim: true });
var kbN3 = buildKeyboard($('kbN3'), {
    target: 'ntsearch', nopred: true, nocap: true, retLabel: 'Search', retDim: true
});
var kbN4 = buildKeyboard($('kbN4'), {
    target: 'ntpw', nopred: true, nocap: true, retLabel: 'return', retDim: true
});

/* ---- lifecycle ------------------------------------------------------- */
function ntOpen() { ntRenderFolders(); }
function ntReset() {
    ntSetEditingNote(false);
    ntCloseAlert();
    ntPwClose();
    ntCloseShare();
    $('ntActs').classList.remove('up');
    NT_NOTES.forEach(function (n) { if (n.lock) n.lock.open = false; });
    $('ntFmt').classList.remove('up');
    $('ntSheet').classList.remove('up');
    $('nt-attach').classList.remove('active');
    ntSetSearching(false);
    ntSetSelecting(false);
    ['nt-list', 'nt-note'].forEach(function (id) { $(id).classList.remove('active', 'behind'); });
    $('nt-folders').classList.remove('behind');
    $('nt-folders').classList.add('active');
    if (ntFEditing) { ntFEditing = false; $('ntFEdit').textContent = 'Edit'; }
    $('ntFolders').scrollTop = 0;
}
