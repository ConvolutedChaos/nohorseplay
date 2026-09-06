"use strict";
/* on-screen keyboard + dictation (shared by every app) */
/* ------------------------------------------------------------------ */
/* KEYBOARD                                                           */
/* ------------------------------------------------------------------ */
let LETTERS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
let NUMBERS = ['1234567890', '-/:;()$&@"', ".,?!'"];
let SYMBOLS = ['[]{}#%^*+=', '_\\|~<>\u20AC\u00A3\u00A5\u2022', ".,?!'"];

let SHIFT_OFF = '<svg width="20" height="19" viewBox="0 0 22 21"><path d="M11 1.6 20 10h-4.6v8.4H6.6V10H2z" fill="none" stroke="#000" stroke-width="1.7" stroke-linejoin="round"/></svg>';
let SHIFT_ON = '<svg width="20" height="19" viewBox="0 0 22 21"><path d="M11 1.6 20 10h-4.6v8.4H6.6V10H2z" fill="#000"/></svg>';
let SHIFT_CAP = '<svg width="20" height="21" viewBox="0 0 22 24"><path d="M11 1.6 20 10h-4.6v6.4H6.6V10H2z" fill="#000"/><rect x="6.6" y="18.6" width="8.8" height="3.4" fill="#000"/></svg>';
let BKSP = '<svg width="26" height="19" viewBox="0 0 28 20"><path d="M9 1h17a1.6 1.6 0 011.6 1.6v14.8A1.6 1.6 0 0126 19H9L1 10z" fill="#000"/><path d="M13.5 6.6 20 13.4M20 6.6l-6.5 6.8" stroke="#ADB3BC" stroke-width="1.7" stroke-linecap="round"/></svg>';
let GLOBE = '<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.4" fill="none" stroke="#000" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4.4" ry="10.4" fill="none" stroke="#000" stroke-width="1.5"/><path d="M1.9 8.4h20.2M1.9 15.6h20.2" stroke="#000" stroke-width="1.5"/></svg>';
let MICKEY = '<svg width="12" height="21" viewBox="0 0 14 24"><rect x="3.6" y="0.9" width="6.8" height="13.4" rx="3.4" fill="#000"/><path d="M1 11.4c0 3.3 2.7 6 6 6s6-2.7 6-6" fill="none" stroke="#000" stroke-width="1.7" stroke-linecap="round"/><path d="M7 17.4v5.2" stroke="#000" stroke-width="1.7" stroke-linecap="round"/></svg>';

let WORDS = ('the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is are was were been has had did going got really something someone sorry sure school tomorrow tonight today yeah yes okay thanks thank please maybe probably definitely awesome cute pretty crazy little never always still right left need feel tell ask call text send wait stop start stay let put keep help play game games phone ipod music video photo photos picture pictures morning night week weekend friday saturday sunday monday though through thing things thought three truck trucks').split(' ');

function buildKeyboard(el, opts) {
    let st = {
        layout: 'letters', shift: opts.nocap ? 'off' : 'on', el: el, pred: !opts.nopred,
        nocap: !!opts.nocap,
        target: opts.target, retLabel: opts.retLabel || 'return', retDim: !!opts.retDim,
        retGo: !!opts.retGo
    };
    el.innerHTML = (st.pred ? '<div class="pred"><div class="slot"></div><div class="slot"></div><div class="slot"></div></div>' : '') +
        '<div class="keys"></div>';
    st.keysEl = el.querySelector('.keys');
    st.predEl = el.querySelector('.pred');
    drawKeys(st);
    el.addEventListener('click', function (e) { handleKey(e, st); });
    return st;
}

function drawKeys(st) {
    let rows = st.layout === 'letters' ? LETTERS : (st.layout === 'numbers' ? NUMBERS : SYMBOLS);
    let up = st.layout === 'letters' && st.shift !== 'off';
    let sm = st.layout !== 'letters' ? ' small' : '';
    let h = '';

    h += '<div class="krow">' + rows[0].split('').map(function (c) {
        return '<div class="key' + sm + '" data-c="' + c + '">' + (up ? c.toUpperCase() : c) + '</div>';
    }).join('') + '</div>';

    h += '<div class="krow' + (st.layout === 'letters' ? ' mid' : '') + '">' + rows[1].split('').map(function (c) {
        return '<div class="key' + sm + '" data-c="' + c.replace(/"/g, '&quot;') + '">' + (up ? c.toUpperCase() : c) + '</div>';
    }).join('') + '</div>';

    let left, lbl;
    if (st.layout === 'letters') { left = 'shift'; lbl = st.shift === 'caps' ? SHIFT_CAP : (st.shift === 'on' ? SHIFT_ON : SHIFT_OFF); }
    else if (st.layout === 'numbers') { left = 'sym'; lbl = '#+='; }
    else { left = 'num'; lbl = '123'; }

    h += '<div class="krow">' +
        '<div class="key alt wide15' + (st.layout === 'letters' && st.shift !== 'off' ? ' lit' : '') + (left !== 'shift' ? ' k123' : '') + '" data-a="' + left + '">' + lbl + '</div>' +
        rows[2].split('').map(function (c) {
            return '<div class="key' + sm + '" data-c="' + c.replace(/'/g, '&#39;') + '">' + (up ? c.toUpperCase() : c) + '</div>';
        }).join('') +
        '<div class="key alt wide15" data-a="bksp">' + BKSP + '</div></div>';

    h += '<div class="krow">' +
        '<div class="key alt k123" data-a="' + (st.layout === 'letters' ? 'num' : 'abc') + '">' + (st.layout === 'letters' ? '123' : 'ABC') + '</div>' +
        '<div class="key alt kglobe" data-a="globe">' + GLOBE + '</div>' +
        '<div class="key alt kmic" data-a="mic">' + MICKEY + '</div>' +
        '<div class="key kspace" data-c=" ">space</div>' +
        '<div class="key alt kreturn' + (st.retDim ? ' off' : '') + (st.retGo ? ' go' : '') +
        '" data-a="ret">' + st.retLabel + '</div></div>';

    st.keysEl.innerHTML = h;
}

let buffer = '', toText = '';

function getText(st) {
    if (st.target === 'su') return suKBGet();
    if (st.target === 'ft') return ftFocus === 'pw' ? ftPw : ftId;
    if (st.target === 'label') return aaDraft.lbl;
    if (st.target === 'city') return cyQuery;
    if (st.target === 'album') return phAlbName;
    if (st.target === 'psearch') return phQuery;
    if (st.target === 'wxsearch') return wxQuery;
    if (st.target === 'note') return ntCur ? ntCur.body : '';
    if (st.target === 'ntfolder') return ntFName;
    if (st.target === 'ntsearch') return ntQuery;
    if (st.target === 'ntpw') return ntPwVal;
    if (st.target === 'rmadd') return rmAddText;
    if (st.target === 'rmsearch') return rmQuery;
    if (st.target === 'rmname') return rmNaming ? rmNaming.n : '';
    if (st.target === 'rmfield') return rmDraft ? (rmField === 'notes' ? rmDraft.notes : rmDraft.t) : '';
    if (st.target === 'stsearch') return stQuery;
    if (st.target === 'sesearch') return seQuery;
    if (st.target === 'sejoin') return seJFocus === 'name' ? seJName : seJPw;
    if (st.target === 'sefield') return seFieldGet();
    return st.target === 'to' ? toText : (st.target === 'search' ? query : buffer);
}
function setText(st, v) {
    if (st.target === 'su') { suKBSet(v); }
    else if (st.target === 'ft') { if (ftFocus === 'pw') ftPw = v; else ftId = v; syncFT(); }
    else if (st.target === 'label') { aaDraft.lbl = v; lbSync(); }
    else if (st.target === 'city') { cyQuery = v; cySync(); }
    else if (st.target === 'album') { phAlbName = v; phAlbSync(); }
    else if (st.target === 'psearch') { phQuery = v; phSearchSync(); }
    else if (st.target === 'wxsearch') { wxQuery = v; wxSyncSearch(); }
    else if (st.target === 'note') { if (ntCur) { ntCur.body = v; ntCur.d = new Date(); ntRenderNote(); } }
    else if (st.target === 'ntfolder') { ntFName = v; ntFSync(); }
    else if (st.target === 'ntsearch') { ntQuery = v; ntRenderList(); }
    else if (st.target === 'ntpw') { ntPwVal = v; ntPwSync(); }
    else if (st.target === 'rmadd') { rmAddText = v; rmRender(); }
    else if (st.target === 'rmsearch') { rmQuery = v; rmSyncSearch(); }
    else if (st.target === 'rmname') { if (rmNaming) { rmNaming.n = v; rmRender(); } }
    else if (st.target === 'stsearch') { stQuery = v; stSyncSearch(); }
    else if (st.target === 'sesearch') { seQuery = v; seSyncSearch(); seRenderRoot(); }
    else if (st.target === 'sejoin') {
        if (seJFocus === 'name') seJName = v; else seJPw = v;
        seRenderJoin();
    }
    else if (st.target === 'sefield') { seFieldSet(v); }
    else if (st.target === 'rmfield') {
        if (rmDraft) {
            if (rmField === 'notes') rmDraft.notes = v;
            else rmDraft.t = v; rmRenderDetail();
        }
    }
    else if (st.target === 'to') { toText = v; syncTo(); }
    else if (st.target === 'search') { query = v; syncSearch(); renderList(); }
    else { buffer = v; syncField(); }
    autoShift(st); updatePred(st);
}
function insert(ch, st) { setText(st, getText(st) + ch); }
function backspace(st) { setText(st, getText(st).slice(0, -1)); }

function autoShift(st) {
    if (st.layout !== 'letters' || st.shift === 'caps') return;
    /* email / password fields never auto-capitalise */
    if (st.nocap) { if (st.shift === 'on') { st.shift = 'off'; drawKeys(st); } return; }
    let t = getText(st);
    let want = (t.length === 0 || /(^|[.!?]\s|\n)$/.test(t)) ? 'on' : 'off';
    if (st.shift !== want) { st.shift = want; drawKeys(st); }
}

function handleKey(e, st) {
    let slot = e.target.closest('.slot');
    if (slot && st.pred && slot.dataset.w) { acceptPrediction(slot.dataset.w, st); return; }
    let k = e.target.closest('.key'); if (!k) return;
    let c = k.dataset.c, a = k.dataset.a;
    if (c !== undefined) {
        let ch = (st.layout === 'letters' && st.shift !== 'off') ? c.toUpperCase() : c;
        insert(ch, st);
        if (st.shift === 'on') { st.shift = 'off'; drawKeys(st); }
        return;
    }
    switch (a) {
        case 'shift': st.shift = st.shift === 'off' ? 'on' : (st.shift === 'on' ? 'caps' : 'off'); drawKeys(st); break;
        case 'num': st.layout = 'numbers'; drawKeys(st); break;
        case 'sym': st.layout = 'symbols'; drawKeys(st); break;
        case 'abc': st.layout = 'letters'; drawKeys(st); break;
        case 'bksp': backspace(st); break;
        case 'ret':
            if (st.target === 'su') suReturn();
            else if (st.target === 'search') { /* Search key */ }
            else if (st.target === 'ft') ftReturn();
            else if (st.target === 'label') lbDone();
            else if (st.target === 'city') cyBlur();
            else if (st.target === 'album') { if (phAlbName.trim()) $('phASave').click(); }
            else if (st.target === 'psearch') { closeKB(kb8); phSearchSync(); }
            else if (st.target === 'ntfolder') { if (ntFName.trim()) $('ntASave').click(); }
            else if (st.target === 'ntsearch') { closeKB(kbN3); ntSyncSearch(); }
            else if (st.target === 'ntpw') { $('ntPwOK').click(); }
            else if (st.target === 'rmadd') { rmCommitAdd(); }
            else if (st.target === 'rmsearch') { closeKB(kbR3); rmSyncSearch(); }
            else if (st.target === 'rmname') { rmFinishNaming(); }
            else if (st.target === 'stsearch') { closeKB(kbS); stSyncSearch(); }
            else if (st.target === 'sesearch') { closeKB(kbSE); }
            else if (st.target === 'sejoin') { seJoinGo(); }
            else if (st.target === 'sefield') { seBlurField(); }
            else if (st.target === 'rmfield') { if (rmField === 'notes') insert('\n', st); }
            else insert('\n', st);
            break;
        case 'mic':
            if (st === kb1) openDict();
            break;
        case 'globe': break;
    }
}

function updatePred(st) {
    if (!st.pred) return;
    let t = getText(st), m = t.match(/[A-Za-z']+$/), word = m ? m[0] : '', out;
    if (!word) {
        out = t.length === 0 ? ['I', 'The', 'I\u2019m'] : ['I', 'the', 'and'];
    } else {
        let lw = word.toLowerCase(), hits = [];
        for (let i = 0; i < WORDS.length && hits.length < 2; i++) {
            if (WORDS[i].indexOf(lw) === 0 && WORDS[i] !== lw) hits.push(WORDS[i]);
        }
        out = ['\u201C' + word + '\u201D'].concat(hits);
    }
    for (let j = 0; j < 3; j++) {
        let v = out[j] || '';
        st.predEl.children[j].textContent = v;
        st.predEl.children[j].dataset.w = v;
    }
}
function acceptPrediction(w, st) {
    let raw = w.replace(/[\u201C\u201D]/g, '');
    setText(st, getText(st).replace(/[A-Za-z']*$/, raw) + ' ');
}

function openKB(st) { st.el.classList.add('up'); autoShift(st); updatePred(st); }
function closeKB(st) { st.el.classList.remove('up'); }

let kb1 = buildKeyboard($('kb1'), { target: 'msg' });
let kb2 = buildKeyboard($('kb2'), { target: 'to', nopred: true });
let kb3 = buildKeyboard($('kb3'), { target: 'search', nopred: true, retLabel: 'Search', retDim: true });
let kb4 = buildKeyboard($('kb4'), { target: 'ft', nopred: true, nocap: true, retLabel: 'Next', retDim: true });
let kb5 = buildKeyboard($('kb5'), { target: 'label', retLabel: 'Done', retGo: true });
let kb6 = buildKeyboard($('kb6'), { target: 'city', nopred: true, nocap: true, retLabel: 'Search', retDim: true });

/* ------------------------------------------------------------------ */
/* DICTATION                                                          */
/* ------------------------------------------------------------------ */
let waveEl = $('wave'), waveTimer = null, BARS = 68;
(function () {
    let h = '';
    for (let i = 0; i < BARS; i++) h += '<i></i>';
    waveEl.innerHTML = h;
})();
function openDict() {
    closeKB(kb1);
    $('dictWrap').classList.add('up');
    let t = 0, bars = waveEl.children;
    waveTimer = setInterval(function () {
        t += 0.35;
        for (let i = 0; i < BARS; i++) {
            let d = Math.abs(i - BARS / 2) / (BARS / 2);
            let env = Math.max(0, 1 - d * 1.15);
            let a = Math.sin(i * 0.9 + t) * Math.sin(i * 0.31 - t * 1.7);
            let hgt = 2 + env * (10 + Math.abs(a) * 52) * (0.5 + Math.random() * 0.5);
            bars[i].style.height = hgt.toFixed(1) + 'px';
        }
    }, 55);
}
function closeDict() {
    $('dictWrap').classList.remove('up');
    if (waveTimer) { clearInterval(waveTimer); waveTimer = null; }
}
$('dictDone').addEventListener('click', function () { closeDict(); openKB(kb1); syncField(); });
