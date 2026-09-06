"use strict";
/* ------------------------------------------------------------------ */
/* REMINDERS                                                          */
/* ------------------------------------------------------------------ */
/* Traced off ref_pic/Reminders/. Lists are cards stacked under a dark
   strip; opening one slides it to the top and lets the rest peek along
   the bottom. Scheduled is not a real list -- it is a view over every
   dated reminder, which is why it has no colour of its own. */

var RM_COLORS = ['#C77BE0', '#5BD028', '#1CADE4', '#EFBE1B', '#A08464', '#FF2D6F', '#F5901E'];

function rmMk(t, o) {
    o = o || {};
    return {
        t: t, done: !!o.done, pri: o.pri || 0,
        due: o.due || null, notes: o.notes || ''
    };
}

var RM_LISTS = [
    { id: 'l1', n: 'Reminders', c: '#1CADE4', items: [] },
    { id: 'l2', n: 'Reminders', c: '#F5901E', items: [] }
];
RM_LISTS[0].items = [
    rmMk('Turn in my homework', { pri: 3, due: new Date(2023, 10, 23, 10, 15) }),
    rmMk('Charge my computer', { pri: 3, due: new Date(2023, 11, 30, 20, 0) })
];

var rmOpen = null;        /* the open card's list id, or 'sched', or null */
var rmShowDone = false, rmEditing = false;
var rmAdding = false, rmAddText = '';
var rmQuery = '', rmSearching = false;
var rmNaming = null;      /* the list being named, while Create List is up */

var RM_CHEV = '<svg width="9" height="15" viewBox="0 0 9 15" aria-hidden="true">' +
    '<path d="M1.4 1.3 7.4 7.5l-6 6.2" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';
var RM_PLUS = '<svg width="21" height="21" viewBox="0 0 21 21" aria-hidden="true">' +
    '<path d="M10.5 1v19M1 10.5h19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
var RM_TICK = '<svg width="16" height="13" viewBox="0 0 16 13" aria-hidden="true">' +
    '<path d="M1.4 6.6 5.8 11 14.6 1.8" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';
var RM_ALARM = '<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">' +
    '<circle cx="15" cy="17" r="10.4" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
    '<path d="M15 11v6.4h4.6" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M4.6 2.6 8.4 6M25.4 2.6 21.6 6" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round"/>' +
    '<path d="M3.2 8.4A7 7 0 018.6 2M26.8 8.4A7 7 0 0021.4 2" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round"/></svg>';

/* ---- reading the model ---------------------------------------------- */
function rmListById(id) {
    for (var i = 0; i < RM_LISTS.length; i++) if (RM_LISTS[i].id === id) return RM_LISTS[i];
    return null;
}
function rmListOf(item) {
    for (var i = 0; i < RM_LISTS.length; i++)
        if (RM_LISTS[i].items.indexOf(item) > -1) return RM_LISTS[i];
    return null;
}
function rmOpenCount(l) {
    return l.items.filter(function (r) { return !r.done; }).length;
}
function rmLate(r) { return r.due && !r.done && r.due < new Date(); }
function rmOverdue(l) { return l.items.filter(rmLate).length; }

/* every dated, unfinished reminder, oldest first */
function rmScheduled() {
    var out = [];
    RM_LISTS.forEach(function (l) {
        l.items.forEach(function (r) { if (r.due && (rmShowDone || !r.done)) out.push(r); });
    });
    return out.sort(function (a, b) { return a.due - b.due; });
}
function rmDueToday() { return rmScheduled().filter(rmLate).length; }

var RM_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var RM_MONS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
function rmMD(d) {
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' + ('' + d.getFullYear()).slice(-2);
}
function rmHM(d) {
    var h = d.getHours(), m = d.getMinutes();
    return ((h % 12) || 12) + ':' + ('0' + m).slice(-2) + ' ' + (h < 12 ? 'AM' : 'PM');
}
function rmDueLabel(r, withTime) {
    return rmMD(r.due) + (withTime ? ', ' + rmHM(r.due) : '');
}
function rmDayTitle(d) {
    return RM_DAYS[d.getDay()] + ', ' + RM_MONS[d.getMonth()] + ' ' + d.getDate() +
        ', ' + d.getFullYear();
}
function rmBang(r, c) {
    return r.pri ? '<span class="rm-bang" style="color:' + c + '">' +
        new Array(r.pri + 1).join('!') + '</span>' : '';
}

/* whichever keyboard is up, the cards give back exactly its height */
function rmKbPx() {
    if (kbR3 && kbR3.el.classList.contains('up')) return 216;
    if ((kbR && kbR.el.classList.contains('up')) ||
        (kbR4 && kbR4.el.classList.contains('up'))) return 252;
    return 0;
}
function rmOpenH() { return Math.min(500, 548 - rmKbPx()); }
function rmSyncKb() {
    $('rmapp').style.setProperty('--rm-kb', rmKbPx() + 'px');
    $('rmapp').style.setProperty('--rm-openh', rmOpenH() + 'px');
}

/* the strip is dark but an open card is paper, so the ink has to follow */
function rmInk() {
    BG_LUMA.rm = (rmOpen || $('rm-detail').classList.contains('up')) ? 0.95 : 0.08;
    refreshInk();
}

/* ---- the stack ------------------------------------------------------- */
function rmRowHTML(r, c, opts) {
    opts = opts || {};
    var late = rmLate(r);
    return '<div class="rm-row' + (r.done ? ' done' : '') + '" data-r="' + opts.k + '">' +
        '<div class="rm-ring" style="color:' + c + (opts.tintRing ? ';border-color:' + c : '') + '">' +
        '<i></i></div>' +
        '<div class="rm-rtext">' + rmBang(r, c) + (opts.hit ? opts.hit : esc(r.t)) +
        (r.due ? '<div class="rm-rdue' + (late ? ' late' : '') + '">' +
            rmDueLabel(r, !opts.dateOnly) + '</div>' : '') +
        (opts.listName ? '<div class="rm-rlist">' + esc(opts.listName) + '</div>' : '') +
        '</div></div>';
}
function rmAddHTML() {
    return '<div class="rm-add" data-add="1"><div class="rm-addplus">' + RM_PLUS + '</div>' +
        (rmAdding ? '<div class="rm-addtext">' + esc(rmAddText) +
            '<span class="caret rm"></span></div>' : '') + '</div>';
}

function rmCardBody(l) {
    if (rmNaming && l && l.id === rmNaming.id) {
        return '<div class="rm-cinner"><div class="rm-dots">' + RM_COLORS.map(function (c, i) {
            return '<div class="rm-dot' + (c === rmNaming.c ? ' on' : '') +
                '" style="color:' + c + '" data-c="' + i + '"></div>';
        }).join('') + '</div></div>';
    }
    if (!l) {                                  /* Scheduled groups by day */
        var rows = rmScheduled(), h = '<div class="rm-cinner">', cur = null;
        rows.forEach(function (r, i) {
            var d = new Date(r.due); d.setHours(0, 0, 0, 0);
            /* anything already past sits in one bucket labelled Today */
            var key = rmLate(r) ? 'late' : d.getTime();
            if (cur !== key) {
                if (cur !== null) h += rmAddHTML();
                cur = key;
                h += '<div class="rm-day">' +
                    (key === 'late' ? 'Today' : rmDayTitle(d)) + '</div>';
            }
            var late = rmLate(r), c = (rmListOf(r) || {}).c || '#9A9A9F';
            h += '<div class="rm-row' + (r.done ? ' done' : '') + '" data-s="' + i + '">' +
                '<div class="rm-ring" style="color:' + c + '"><i></i></div>' +
                '<div class="rm-rtext">' + rmBang(r, c) + esc(r.t) +
                '<div class="rm-rdue' + (late ? ' late' : '') + '">' +
                (late ? rmMD(r.due) : rmHM(r.due)) + '</div></div></div>';
        });
        h += rmAddHTML();
        return h + '</div>';
    }
    var items = l.items.filter(function (r) { return rmShowDone || !r.done; });
    var body = '<div class="rm-cinner">';
    items.forEach(function (r) {
        body += rmRowHTML(r, l.c, { k: l.items.indexOf(r) });
    });
    body += rmAddHTML();
    body += '<div class="rm-showdone" data-done="1">' +
        (rmShowDone ? 'Hide Completed' : 'Show Completed') + '</div>';
    return body + '</div>';
}

function rmCardHTML(l, i, open) {
    var sched = !l;
    var name = sched ? 'Scheduled' : l.n;
    var col = sched ? '#9A9A9F' : l.c;
    var count = sched ? '' : rmOpenCount(l);
    var over = sched ? rmScheduled().filter(rmLate).length : rmOverdue(l);
    var naming = rmNaming && l && l.id === rmNaming.id;
    return '<div class="rm-card' + (open ? ' up' : '') + '" data-i="' + i + '">' +
        '<div class="rm-chead">' +
        '<div class="rm-cname' + (naming ? ' edit' : '') + '" style="color:' +
        (naming ? rmNaming.c : col) + '">' +
        (naming ? esc(rmNaming.n) + '<span class="caret rm"></span>' : esc(name)) + '</div>' +
        (sched ? '<div class="rm-csub">' + rmDueToday() + ' item' +
            (rmDueToday() === 1 ? '' : 's') + ' due today</div>' : '') +
        (sched ? '<div class="rm-clock">' + RM_ALARM + '</div>'
            : '<div class="rm-ccount" style="color:' + (naming ? '#A8A7A2' : col) + '">' +
            (naming ? RM_PLUS : count) + '</div>') +
        (over ? '<div class="rm-cover">' + over + ' overdue</div>' : '') +
        (naming ? '<div class="rm-cedit" id="rmNameDone">Done</div>'
            : '<div class="rm-cedit">' + (rmEditing ? 'Done' : 'Edit') + '</div>') +
        '</div>' +
        '<div class="rm-cbody">' + (open ? rmCardBody(l) : '') + '</div></div>';
}

function rmRender() {
    var cards = [null].concat(RM_LISTS);      /* Scheduled rides on top */
    var openIdx = rmOpen === null ? -1
        : (rmOpen === 'sched' ? 0 : cards.indexOf(rmListById(rmOpen)));
    var h = '';
    cards.forEach(function (l, i) { h += rmCardHTML(l, i, i === openIdx); });
    $('rmstack').innerHTML = h;
    $('rmstack').classList.toggle('open', openIdx > -1);
    rmSyncKb();

    var els = $('rmstack').children, PEEK = 15;
    var openH = rmOpenH(), seen = 0;
    for (var i = 0; i < els.length; i++) {
        var y;
        if (openIdx < 0) y = 50 + i * 76;       /* hanging off the dark strip */
        else if (i === openIdx) y = 0;
        else y = openH + 20 + (seen++) * PEEK;  /* the rest peek along the bottom */
        els[i].style.transform = 'translateY(' + y + 'px)';
        els[i].style.zIndex = i === openIdx ? 40 : i;
        if (i === openIdx && !rmNaming) rmFillRules(els[i]);
    }
    rmInk();
}

function rmFillRules(card) {
    var body = card.querySelector('.rm-cbody'), inner = card.querySelector('.rm-cinner');
    if (!body || !inner) return;
    var tail = inner.querySelector('.rm-showdone');
    if (tail) tail.parentNode.removeChild(tail);
    var gap = (rmOpenH() - 76) - inner.offsetHeight - (tail ? 46 : 0);
    var n = Math.max(0, Math.floor(gap / 38));
    for (var i = 0; i < n; i++) {
        var f = document.createElement('div');
        f.className = 'rm-fill';
        inner.appendChild(f);
    }
    if (tail) inner.appendChild(tail);
}

$('rmstack').addEventListener('click', function (e) {
    var card = e.target.closest('.rm-card'); if (!card) return;
    var i = +card.dataset.i, cards = [null].concat(RM_LISTS), l = cards[i];
    var isOpen = card.classList.contains('up');

    if (e.target.closest('#rmNameDone')) { rmFinishNaming(); return; }
    if (e.target.closest('.rm-dot')) {
        rmNaming.c = RM_COLORS[+e.target.closest('.rm-dot').dataset.c];
        rmRender();
        return;
    }
    if (!isOpen) {                            /* tapping any other card opens it */
        rmCloseAdd();
        rmOpen = l ? l.id : 'sched';
        rmRender();
        return;
    }
    if (e.target.closest('.rm-cedit')) { rmEditing = !rmEditing; rmRender(); return; }
    if (e.target.closest('.rm-showdone')) { rmShowDone = !rmShowDone; rmRender(); return; }
    if (e.target.closest('.rm-add')) { rmStartAdd(); return; }

    var ring = e.target.closest('.rm-ring'), row = e.target.closest('.rm-row');
    if (row) {
        var item = row.dataset.s !== undefined
            ? rmScheduled()[+row.dataset.s] : l.items[+row.dataset.r];
        if (!item) return;
        if (ring) { item.done = !item.done; rmRender(); return; }
        rmOpenDetail(item, rmListOf(item));
    }
});

/* swiping the open card down drops it back into the stack */
(function () {
    var y0 = 0, x0 = 0, live = false;
    $('rmstack').addEventListener('pointerdown', function (e) {
        live = !!rmOpen; y0 = e.clientY; x0 = e.clientX;
    });
    $('rmstack').addEventListener('pointermove', function (e) {
        if (!live) return;
        var dy = e.clientY - y0;
        if (Math.abs(e.clientX - x0) > Math.abs(dy)) { live = false; return; }
        if (dy > 46) {
            live = false;
            rmCloseAdd();
            rmOpen = null; rmEditing = false;
            rmRender();
        }
    });
    $('rmstack').addEventListener('pointerup', function () { live = false; });
    $('rmstack').addEventListener('pointercancel', function () { live = false; });
})();

/* ---- adding inline --------------------------------------------------- */
function rmStartAdd() {
    rmAdding = true; rmAddText = '';
    openKB(kbR);
    rmRender();
}
function rmCommitAdd() {
    var t = rmAddText.trim();
    if (t) {
        var l = rmOpen === 'sched' ? RM_LISTS[0] : rmListById(rmOpen);
        if (l) l.items.push(rmMk(t));
    }
    rmAddText = '';
    rmRender();
}
function rmCloseAdd() {
    if (!rmAdding) return;
    rmCommitAdd();
    rmAdding = false;
    closeKB(kbR);
    rmRender();
}

/* ---- search ---------------------------------------------------------- */
function rmSetSearching(on) {
    rmSearching = on;
    $('rmapp').classList.toggle('searching', on);
    if (on) { rmCloseAdd(); openKB(kbR3); }
    else { closeKB(kbR3); rmQuery = ''; }
    rmSyncSearch();
}
function rmSyncSearch() {
    $('rmSField').classList.toggle('empty', !rmQuery);
    $('rmSVal').innerHTML = esc(rmQuery) + (rmSearching ? '<span class="caret rm"></span>' : '');
    rmRenderResults();
}
function rmRenderResults() {
    if (!rmSearching) return;
    var q = rmQuery.trim().toLowerCase(), h = '';
    if (q) {
        RM_LISTS.forEach(function (l) {
            l.items.forEach(function (r) {
                var i = r.t.toLowerCase().indexOf(q);
                if (i < 0) return;
                var hit = esc(r.t.slice(0, i)) + '<span class="rm-hit">' +
                    esc(r.t.slice(i, i + q.length)) + '</span>' + esc(r.t.slice(i + q.length));
                h += rmRowHTML(r, l.c, {
                    k: l.items.indexOf(r), hit: hit, listName: l.n,
                    dateOnly: true, tintRing: true
                });
            });
        });
    }
    $('rmResults').innerHTML = h;
}
$('rmSField').addEventListener('click', function () { if (!rmSearching) rmSetSearching(true); });
$('rmSCancel').addEventListener('click', function () { rmSetSearching(false); });
$('rmSClear').addEventListener('click', function (e) {
    e.stopPropagation(); rmQuery = ''; rmSyncSearch();
});
$('rmResults').addEventListener('click', function (e) {
    var row = e.target.closest('.rm-row'); if (!row) return;
    var ring = e.target.closest('.rm-ring');
    var all = [];
    RM_LISTS.forEach(function (l) {
        l.items.forEach(function (r) {
            if (r.t.toLowerCase().indexOf(rmQuery.trim().toLowerCase()) > -1) all.push(r);
        });
    });
    var idx = Array.prototype.indexOf.call($('rmResults').children, row);
    var item = all[idx]; if (!item) return;
    if (ring) { item.done = !item.done; rmRenderResults(); return; }
    rmOpenDetail(item, rmListOf(item));
});

/* ---- Create new... --------------------------------------------------- */
$('rmPlus').addEventListener('click', function () { $('rmSheet').classList.add('up'); });
$('rmSheetCancel').addEventListener('click', function () { $('rmSheet').classList.remove('up'); });
$('rmSheet').addEventListener('click', function (e) {
    if (e.target === $('rmSheet')) $('rmSheet').classList.remove('up');
});
$('rmNewRem').addEventListener('click', function () {
    $('rmSheet').classList.remove('up');
    var l = (rmOpen && rmOpen !== 'sched' && rmListById(rmOpen)) || RM_LISTS[0];
    rmOpenDetail(rmMk(''), l, true);
});
$('rmNewList').addEventListener('click', function () {
    $('rmSheet').classList.remove('up');
    var l = { id: 'l' + Date.now(), n: '', c: RM_COLORS[1], items: [] };
    RM_LISTS.unshift(l);                      /* new lists land nearest the top card */
    rmNaming = l;
    rmOpen = l.id;
    openKB(kbR4);
    rmRender();
});
function rmFinishNaming() {
    if (!rmNaming) return;
    var l = rmNaming;
    if (!l.n.trim()) {
        RM_LISTS = RM_LISTS.filter(function (x) { return x !== l; });
        rmOpen = null;
    }
    rmNaming = null;
    closeKB(kbR4);
    rmRender();
    if (rmOpen) rmStartAdd();
}

/* ---- Create Reminder ------------------------------------------------- */
var rmDraft = null, rmDraftList = null, rmDraftNew = false, rmField = 'title';
var RM_REPEATS = ['Never', 'Every Day', 'Every Week', 'Every 2 Weeks', 'Every Month', 'Every Year'];

function rmOpenDetail(item, list, isNew) {
    rmDraft = {
        t: item.t, pri: item.pri, notes: item.notes,
        due: item.due ? new Date(item.due) : null,
        rep: item.rep || 'Never', src: item
    };
    rmDraftList = list || RM_LISTS[0];
    rmDraftNew = !!isNew;
    rmField = null;
    $('rmDTitle').textContent = isNew ? 'Create Reminder' : 'Details';
    rmRenderDetail();
    $('rm-detail').classList.add('up');
    rmInk();
}
function rmDefaultDue() {
    var d = new Date();
    d.setHours(22, 0, 0, 0);
    return d;
}
function rmRenderDetail() {
    var d = rmDraft, on = !!d.due;
    var h = '<div class="rm-gap"></div><div class="rm-group">' +
        '<div class="rm-frow"><div class="rm-ffield' + (d.t ? '' : ' empty') + '" data-f="title">' +
        esc(d.t) + (rmField === 'title' ? '<span class="caret"></span>' : '') + '</div></div></div>' +
        '<div class="rm-gap"></div><div class="rm-group">' +
        '<div class="rm-frow"><div class="rm-flabel">Remind me on a day</div>' +
        '<div class="rm-sw' + (on ? ' on' : '') + '" data-f="day"></div></div>';
    if (on) {
        h += '<div class="rm-frow"><div class="rm-flabel">Alarm</div>' +
            '<div class="rm-fval">' + RM_DAYS[d.due.getDay()].slice(0, 3) + ', ' +
            rmMD(d.due) + ', ' + rmHM(d.due) + '</div></div>' +
            '<div class="rm-frow pick" data-f="rep"><div class="rm-flabel">Repeat</div>' +
            '<div class="rm-fval">' + d.rep + '</div><div class="rm-fchev">' + RM_CHEV + '</div></div>';
    }
    h += '</div><div class="rm-gap"></div><div class="rm-group">' +
        '<div class="rm-frow"><div class="rm-flabel">Priority</div><div class="rm-seg">' +
        ['None', '!', '!!', '!!!'].map(function (s, i) {
            return '<div class="rm-segbtn' + (d.pri === i ? ' on' : '') + '" data-p="' + i + '">' +
                s + '</div>';
        }).join('') + '</div></div>' +
        '<div class="rm-frow pick" data-f="list"><div class="rm-flabel">List</div>' +
        '<div class="rm-fval">' + esc(rmDraftList.n) + '</div>' +
        '<div class="rm-fchev">' + RM_CHEV + '</div></div>' +
        '<div class="rm-frow tall"><div class="rm-fnotes rm-ffield' + (d.notes ? '' : ' empty') +
        '" data-f="notes">' + esc(d.notes) +
        (rmField === 'notes' ? '<span class="caret"></span>' : '') + '</div></div>' +
        '</div><div class="rm-gap"></div>';
    $('rmDBody').innerHTML = h;
}
$('rmDBody').addEventListener('click', function (e) {
    var seg = e.target.closest('.rm-segbtn');
    if (seg) { rmDraft.pri = +seg.dataset.p; rmRenderDetail(); return; }
    var sw = e.target.closest('.rm-sw');
    if (sw) { rmDraft.due = rmDraft.due ? null : rmDefaultDue(); rmRenderDetail(); return; }
    var f = e.target.closest('[data-f]'); if (!f) return;
    if (f.dataset.f === 'title' || f.dataset.f === 'notes') {
        rmField = f.dataset.f; openKB(kbR2); rmRenderDetail(); return;
    }
    if (f.dataset.f === 'list') rmOpenPick('list');
    if (f.dataset.f === 'rep') rmOpenPick('rep');
});
$('rmDCancel').addEventListener('click', function () {
    closeKB(kbR2); $('rm-detail').classList.remove('up'); rmDraft = null; rmInk();
});
$('rmDDone').addEventListener('click', function () {
    var d = rmDraft, s = d.src;
    s.t = d.t.trim() || 'Reminder';
    s.pri = d.pri; s.notes = d.notes; s.due = d.due; s.rep = d.rep;
    var was = rmListOf(s);
    if (was && was !== rmDraftList) was.items.splice(was.items.indexOf(s), 1);
    if (rmDraftList.items.indexOf(s) < 0) rmDraftList.items.push(s);
    closeKB(kbR2);
    $('rm-detail').classList.remove('up');
    rmDraft = null;
    rmRender();
    if (rmSearching) rmRenderResults();
});

/* ---- the shared picker ----------------------------------------------- */
var rmPickKind = 'list';
function rmOpenPick(kind) {
    rmPickKind = kind;
    $('rmPTitle').textContent = kind === 'list' ? 'List' : 'Repeat';
    var h = '<div class="rm-gap"></div><div class="rm-group">';
    if (kind === 'list') {
        RM_LISTS.forEach(function (l, i) {
            h += '<div class="rm-frow pick' + (l === rmDraftList ? ' on' : '') + '" data-k="' + i + '">' +
                '<div class="rm-swatch" style="color:' + l.c + '"></div>' +
                '<div class="rm-flabel">' + esc(l.n) + '</div>' +
                '<div class="rm-ptick">' + RM_TICK + '</div></div>';
        });
    } else {
        RM_REPEATS.forEach(function (r, i) {
            h += '<div class="rm-frow pick' + (r === rmDraft.rep ? ' on' : '') + '" data-k="' + i + '">' +
                '<div class="rm-flabel">' + r + '</div>' +
                '<div class="rm-ptick">' + RM_TICK + '</div></div>';
        });
    }
    $('rmPBody').innerHTML = h + '</div>';
    closeKB(kbR2);
    $('rm-pick').classList.add('up');
}
$('rmPBack').addEventListener('click', function () {
    $('rm-pick').classList.remove('up'); rmRenderDetail();
});
$('rmPBody').addEventListener('click', function (e) {
    var row = e.target.closest('.rm-frow'); if (!row) return;
    var k = +row.dataset.k;
    if (rmPickKind === 'list') rmDraftList = RM_LISTS[k];
    else rmDraft.rep = RM_REPEATS[k];
    $('rm-pick').classList.remove('up');
    rmRenderDetail();
});

var kbR = buildKeyboard($('kbR'), { target: 'rmadd', retLabel: 'return' });
var kbR2 = buildKeyboard($('kbR2'), { target: 'rmfield', retLabel: 'return' });
var kbR3 = buildKeyboard($('kbR3'), {
    target: 'rmsearch', nopred: true, nocap: true, retLabel: 'Search', retDim: false
});
var kbR4 = buildKeyboard($('kbR4'), { target: 'rmname', retLabel: 'Done', retGo: true });

/* ---- lifecycle ------------------------------------------------------- */
function rmAppOpen() { rmRender(); }
function rmAppReset() {
    rmCloseAdd();
    rmNaming = null;
    rmSetSearching(false);
    rmOpen = null;
    rmEditing = false;
    rmShowDone = false;
    $('rmSheet').classList.remove('up');
    $('rm-detail').classList.remove('up');
    $('rm-pick').classList.remove('up');
    closeKB(kbR2); closeKB(kbR4);
    rmDraft = null;
    rmRender();
}
