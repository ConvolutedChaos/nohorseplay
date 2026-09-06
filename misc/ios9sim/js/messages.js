"use strict";
/* data, page stack, SVG bits, conversation list, search, thread, details */
/* ------------------------------------------------------------------ */
/* DATA                                                               */
/* ------------------------------------------------------------------ */
let PHOTOS = {};   // pid -> dataURL

let convs = [
    {
        id: 'parker', name: 'Parker', title: 'Parker', date: '8/6/25',
        preview: 'hello', service: 'imessage', wide: true,
        people: [{ name: 'Parker', pid: 'av3' }],
        msgs: [
            { stamp: 'Wed, Aug 6, 12:14 PM' },
            { d: 'out', text: 'hi' },
            { d: 'in', text: 'hello' }
        ]
    }
];

/* Contacts for the New Message autocomplete.
   Janae's four entries come straight off the screenshot; the rest reuse
   numbers already visible in the thread list. */
let CONTACTS = [
    { first: 'Parker', last: '', label: 'mobile', value: '555-0123' }
];

/* ------------------------------------------------------------------ */
/* PAGE STACK                                                         */
/* ------------------------------------------------------------------ */
let pList = $('p-list'), pThread = $('p-thread'), pDetails = $('p-details'), pNew = $('p-new');

function push(from, to) { from.classList.remove('active'); from.classList.add('behind'); to.classList.add('active'); }
function pop(from, to) { from.classList.remove('active'); to.classList.remove('behind'); to.classList.add('active'); }

/* ------------------------------------------------------------------ */
/* SVG BITS                                                           */
/* ------------------------------------------------------------------ */
let CHEV = '<svg class="chev" width="9" height="15" viewBox="0 0 9 15"><path d="M1 1l6.4 6.5L1 14" fill="none" stroke="#C7C7CC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
let CHECK = '<svg width="13" height="11" viewBox="0 0 13 11"><path d="M1.2 5.6 4.7 9.3 11.6 1.6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
let QMARK = '<span class="qbox">?</span>';
let MICWHITE = '<svg width="11" height="17" viewBox="0 0 14 22"><rect x="4" y="1" width="6" height="12" rx="3" fill="#fff"/><path d="M1.6 10.4c0 3 2.4 5.4 5.4 5.4s5.4-2.4 5.4-5.4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M7 15.8v4.4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>';
let CAMICON = '<svg width="26" height="22" viewBox="0 0 28 24"><rect x="1" y="5" width="26" height="18" rx="3" fill="none" stroke="#9B9BA0" stroke-width="1.6"/><path d="M9 5 11 1.5h6L19 5" fill="none" stroke="#9B9BA0" stroke-width="1.6" stroke-linejoin="round"/><circle cx="14" cy="14" r="5" fill="none" stroke="#9B9BA0" stroke-width="1.6"/></svg>';

/* ------------------------------------------------------------------ */
/* CONVERSATION LIST                                                  */
/* ------------------------------------------------------------------ */
let listEl = $('convList'), editing = false, picked = {}, searching = false, query = '';

function visibleConvs() {
    if (!searching || !query) return convs;
    let q = query.toLowerCase();
    return convs.filter(function (c) {
        return c.name.toLowerCase().indexOf(q) > -1 || c.preview.toLowerCase().indexOf(q) > -1;
    });
}

function renderList() {
    let rows = visibleConvs();
    if (!rows.length) { listEl.innerHTML = '<div class="noresults">No Results</div>'; return; }
    listEl.innerHTML = rows.map(function (c) {
        return '<div class="row' + (picked[c.id] ? ' picked' : '') + '" data-id="' + c.id + '">' +
            '<div class="sel">' + (picked[c.id] ? CHECK : '') + '</div>' +
            '<div class="txt"><div class="name">' + esc(c.name) + '</div>' +
            '<div class="prev">' + esc(c.preview) + '</div></div>' +
            '<div class="meta">' + esc(c.date) + CHEV + '</div></div>';
    }).join('');
}
renderList();

listEl.addEventListener('click', function (e) {
    let row = e.target.closest('.row'); if (!row) return;
    if (editing) {
        picked[row.dataset.id] = !picked[row.dataset.id];
        renderList(); updateEditBar();
    } else {
        if (searching) exitSearch();
        openThread(row.dataset.id);
    }
});

let editBtn = $('editBtn'), composeBtn = $('composeBtn'), editBar = $('editBar'),
    searchWrap = $('searchWrap'), readBtn = $('readBtn'), delBtn = $('delBtn');

function setEditing(on) {
    editing = on; picked = {};
    listEl.classList.toggle('editing', on);
    editBar.style.display = on ? 'flex' : 'none';
    searchWrap.classList.toggle('disabled', on);
    editBtn.textContent = on ? 'Cancel' : 'Edit';
    composeBtn.style.visibility = on ? 'hidden' : 'visible';
    renderList(); updateEditBar();
}
function updateEditBar() {
    let any = Object.keys(picked).some(function (k) { return picked[k]; });
    readBtn.textContent = any ? 'Read' : 'Read All';
    readBtn.className = any ? 'dim' : '';
    delBtn.className = any ? '' : 'dim';
}
editBtn.addEventListener('click', function () { setEditing(!editing); });
delBtn.addEventListener('click', function () {
    if (delBtn.className === 'dim') return;
    convs = convs.filter(function (c) { return !picked[c.id]; });
    setEditing(false);
});

/* ------------------------------------------------------------------ */
/* SEARCH MODE                                                        */
/* ------------------------------------------------------------------ */
function enterSearch() {
    if (editing) return;
    searching = true; query = '';
    searchWrap.classList.add('searching');
    $('listNav').style.display = 'none';
    $('listWrap').classList.add('dim');
    syncSearch(); renderList();
    openKB(kb3);
}
function exitSearch() {
    searching = false; query = '';
    searchWrap.classList.remove('searching');
    $('listNav').style.display = 'flex';
    $('listWrap').classList.remove('dim');
    closeKB(kb3); syncSearch(); renderList();
}
function syncSearch() {
    let t = $('searchText');
    if (searching && query) {
        t.innerHTML = '<span class="q">' + esc(query) + '</span><span class="caret"></span>';
        $('listWrap').classList.remove('dim');
    } else if (searching) {
        t.innerHTML = '<span class="caret" style="height:17px"></span>Search';
        t.style.color = '#B9B9BE';
        $('listWrap').classList.add('dim');
    } else {
        t.textContent = 'Search'; t.style.color = '';
    }
    if (kb3) { kb3.retDim = !query; drawKeys(kb3); }
}
$('searchField').addEventListener('click', enterSearch);
$('searchCancel').addEventListener('click', exitSearch);

/* ------------------------------------------------------------------ */
/* THREAD                                                             */
/* ------------------------------------------------------------------ */
let threadBody = $('threadBody'), threadTitle = $('threadTitle'), current = null, sending = false;

function photoHTML(pid, cls) {
    if (PHOTOS[pid]) return '<img src="' + PHOTOS[pid] + '" alt="">';
    return '<div class="ph js-photo" data-pid="' + pid + '">' + CAMICON +
        '<span>tap to load<br>your own photo</span></div>';
}

function renderThread() {
    let html = '';
    current.msgs.forEach(function (m, i) {
        if (m.stamp) {
            let parts = m.stamp.split(/,\s(?=\d)/);
            let line;
            if (/^Today|^Yesterday/.test(m.stamp)) {
                let bits = m.stamp.split(' ');
                line = '<b>' + esc(bits.shift()) + '</b> ' + esc(bits.join(' '));
            } else {
                line = '<b>' + esc(parts[0]) + '</b>' + (parts[1] ? ', ' + esc(parts[1]) : '');
            }
            html += '<div class="stamp">' +
                (m.service ? '<span class="svc">' + esc(m.service) + '</span>' : '') +
                line + '</div>';
            return;
        }
        let smsCls = m.sms ? ' sms' : '';
        html += '<div class="grp ' + m.d + '">';
        if (m.who) html += '<div class="sender">' + esc(m.who) + '</div>';
        html += '<div class="line">';
        if (m.failed) html += '<div class="badge">!</div>';
        if (m.kind === 'photo') html += '<div class="bub media">' + photoHTML(m.pid) + '</div>';
        else if (m.kind === 'missing') html += '<div class="bub missing">' + QMARK + '</div>';
        else html += '<div class="bub' + smsCls + '">' + esc(m.text) + '</div>';
        html += '</div>';
        if (m.receipt) html += '<div class="receipt' + (m.failed ? ' fail' : '') + '">' + esc(m.receipt) + '</div>';
        html += '</div>';
    });
    html += '<div class="spacer"></div>';
    threadBody.innerHTML = html;
    threadBody.classList.toggle('wide', !!current.wide);
    threadBody.scrollTop = threadBody.scrollHeight;
}

function openThread(id) {
    current = convs.filter(function (c) { return c.id === id; })[0];
    threadTitle.textContent = current.title;
    buffer = ''; syncField();
    closeKB(kb1); closeDict();
    renderThread();
    push(pList, pThread);
    setTimeout(function () { threadBody.scrollTop = threadBody.scrollHeight; }, 40);
}
$('backBtn').addEventListener('click', function () { closeKB(kb1); closeDict(); pop(pThread, pList); });

/* photo picker */
let picker = $('photoPicker'), pendingPid = null;
document.addEventListener('click', function (e) {
    let ph = e.target.closest('.js-photo, .js-att, .js-avatar');
    if (ph) { pendingPid = ph.dataset.pid; picker.click(); }
});
threadBody.addEventListener('click', function (e) {
    if (!e.target.closest('.js-photo')) { closeKB(kb1); closeDict(); syncField(); }
});
picker.addEventListener('change', function () {
    let f = picker.files[0]; if (!f || !pendingPid) return;
    let r = new FileReader();
    r.onload = function () {
        PHOTOS[pendingPid] = r.result;
        if (current) renderThread();
        if (pDetails.classList.contains('active')) renderDetails();
        picker.value = '';
    };
    r.readAsDataURL(f);
});

/* ------------------------------------------------------------------ */
/* DETAILS                                                            */
/* ------------------------------------------------------------------ */
let dnd = {};

function renderDetails() {
    let c = current, h = '';
    h += '<div class="sect">';
    c.people.forEach(function (p) {
        let av = PHOTOS[p.pid]
            ? '<img class="avatar" src="' + PHOTOS[p.pid] + '" alt="">'
            : '<div class="avatar js-avatar" data-pid="' + p.pid + '">' + esc(p.name.charAt(0)) + '</div>';
        h += '<div class="cell person">' + av +
            '<span class="grow">' + esc(p.name) + '</span>' +
            '<span class="iBtn">i</span></div>';
    });
    h += '</div>';

    h += '<div class="hdr">LOCATION</div><div class="sect">' +
        '<div class="cell blue">Send My Current Location</div>' +
        '<div class="cell blue">Share My Location</div></div>';

    h += '<div class="hdr">&nbsp;</div><div class="sect">' +
        '<div class="cell"><span class="grow" style="font-weight:400">Do Not Disturb</span>' +
        '<span class="sw' + (dnd[c.id] ? ' on' : '') + '" id="dndSw"><i></i></span></div></div>' +
        '<div class="ftr">Mute notifications for this conversation.</div>';

    let pids = c.msgs.filter(function (m) { return m.kind === 'photo'; }).map(function (m) { return m.pid; });
    while (pids.length && pids.length < 6) pids = pids.concat(pids);
    pids = pids.slice(0, 6);
    if (pids.length) {
        h += '<div class="hdr">ATTACHMENTS</div><div class="attgrid">';
        pids.forEach(function (pid, i) {
            h += '<div class="att' + (i === 0 ? ' big' : '') + (PHOTOS[pid] ? '' : ' js-att') + '" data-pid="' + pid + '">' +
                (PHOTOS[pid] ? '<img src="' + PHOTOS[pid] + '" alt="">' : CAMICON) + '</div>';
        });
        h += '</div>';
    }
    h += '<div style="height:24px"></div>';
    $('detailsBody').innerHTML = h;

    let sw = $('dndSw');
    if (sw) sw.addEventListener('click', function () {
        dnd[c.id] = !dnd[c.id];
        sw.classList.toggle('on', !!dnd[c.id]);
    });
}
$('detailsBtn').addEventListener('click', function () {
    if (!current) return;
    closeKB(kb1); closeDict();
    $('detailsBackLbl').textContent = current.title;
    renderDetails();
    push(pThread, pDetails);
});
$('detailsBack').addEventListener('click', function () { pop(pDetails, pThread); });
