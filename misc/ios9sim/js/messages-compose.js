"use strict";
/* Messages, continued: composer + New Message */
/* ------------------------------------------------------------------ */
/* COMPOSER                                                           */
/* ------------------------------------------------------------------ */
let msgField = $('msgField'), rightBtn = $('rightBtn');

function syncField() {
    let im = current && current.service === 'imessage';
    let kbUp = kb1.el.classList.contains('up') || $('dictWrap').classList.contains('up');
    if (buffer === '') {
        msgField.innerHTML = (kbUp ? '<span class="caret"></span>' : '') +
            '<span class="plc">' + (im ? 'iMessage' : 'Text Message') + '</span>';
        rightBtn.className = im ? 'micbtn' : 'send';
        rightBtn.innerHTML = im ? MICWHITE : 'Send';
    } else {
        msgField.innerHTML = esc(buffer).replace(/\n/g, ' ') + '<span class="caret"></span>';
        rightBtn.className = 'send ' + (im ? 'im' : 'sms');
        rightBtn.innerHTML = 'Send';
    }
}

msgField.addEventListener('click', function (e) {
    e.stopPropagation();
    closeDict(); openKB(kb1); syncField();
    setTimeout(function () { threadBody.scrollTop = threadBody.scrollHeight; }, 290);
});

rightBtn.addEventListener('click', function () {
    if (rightBtn.classList.contains('micbtn')) return;   // audio message: not implemented
    if (!buffer.trim() || sending) return;
    let im = current.service === 'imessage';
    current.msgs.forEach(function (m) { if (m.receipt === 'Delivered') delete m.receipt; });
    let msg = { d: 'out', text: buffer, sms: !im };
    current.msgs.push(msg);
    current.preview = buffer;
    current.date = $('clock').textContent;
    buffer = ''; syncField(); autoShift(kb1); updatePred(kb1);
    renderThread(); renderList();

    /* "Sending..." + green progress bar */
    sending = true;
    threadTitle.textContent = 'Sending\u2026';
    let bar = $('sendbar');
    bar.classList.add('go'); bar.style.width = '0';
    requestAnimationFrame(function () { bar.style.width = '88%'; });
    setTimeout(function () {
        bar.style.width = '100%';
        setTimeout(function () {
            bar.classList.remove('go'); bar.style.width = '0';
            threadTitle.textContent = current.title;
            msg.receipt = 'Delivered';
            sending = false;
            renderThread();
        }, 220);
    }, 900);
});

/* ------------------------------------------------------------------ */
/* NEW MESSAGE + CONTACT SUGGESTIONS                                  */
/* ------------------------------------------------------------------ */
let toVal = $('toVal'), sugList = $('sugList');

function syncTo() {
    toVal.innerHTML = esc(toText) + '<span class="caret"></span>';
    renderSugs();
}
function boldMatch(name, q) {
    if (!q) return esc(name);
    return name.toLowerCase().indexOf(q) === 0 ? '<b>' + esc(name) + '</b>' : esc(name);
}
function renderSugs() {
    let q = toText.trim().toLowerCase();
    if (!q) { sugList.innerHTML = '<div class="blank"></div>'; return; }
    let hits = CONTACTS.filter(function (c) {
        return c.first.toLowerCase().indexOf(q) === 0 || (c.last && c.last.toLowerCase().indexOf(q) === 0);
    });
    if (!hits.length) { sugList.innerHTML = '<div class="blank"></div>'; return; }
    sugList.innerHTML = hits.map(function (c) {
        let nm = boldMatch(c.first, q) + (c.last ? ' ' + boldMatch(c.last, q) : '');
        if (c.group) {
            return '<div class="sug grouprow"><div class="l1">' + nm + esc(c.group) + '</div><span class="iBtn">i</span></div>';
        }
        return '<div class="sug"><div class="l1">' + nm + '</div>' +
            '<div class="l2"><b>' + esc(c.label) + '</b>&nbsp;&nbsp;' + esc(c.value) + '</div></div>';
    }).join('');
}
composeBtn.addEventListener('click', function () {
    if (editing) return;
    toText = ''; kb2.layout = 'letters'; kb2.shift = 'on'; drawKeys(kb2);
    syncTo(); pNew.classList.add('active');
});
$('cancelNew').addEventListener('click', function () { pNew.classList.remove('active'); });
