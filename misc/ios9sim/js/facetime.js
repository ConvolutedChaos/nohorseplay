"use strict";
/* ------------------------------------------------------------------ */
/* FACETIME  (sign-in / activation screen only)                       */
/* ------------------------------------------------------------------ */
let ftId = '', ftPw = '', ftFocus = null, ftAlertCb = null;
let ftGo = $('ftSignIn'), ftGoLbl = $('ftGoLbl'), ftScroll = $('ftScroll');

function syncFT() {
    let kbUp = kb4.el.classList.contains('up');
    let car = '<span class="caret"></span>';
    let idCar = (kbUp && ftFocus === 'id') ? car : '';
    let pwCar = (kbUp && ftFocus === 'pw') ? car : '';

    $('ftIdVal').innerHTML = ftId === ''
        ? idCar + '<span class="plc">example@icloud.com</span>'
        : esc(ftId) + idCar;
    $('ftPwVal').innerHTML = ftPw === ''
        ? pwCar + '<span class="plc">required</span>'
        : new Array(ftPw.length + 1).join(String.fromCharCode(0x2022)) + pwCar;

    let ready = ftId.trim() !== '' && ftPw !== '';
    if (!ftGo.classList.contains('busy')) ftGo.classList.toggle('off', !ready);

    kb4.retLabel = ftFocus === 'pw' ? 'Go' : 'Next';
    kb4.retDim = ftFocus === 'pw' ? !ready : !ftId.trim();
    drawKeys(kb4);
}

/* lift the form clear of the keyboard; the browser clamps if it can't scroll */
function ftReveal() { if (kb4.el.classList.contains('up')) ftScroll.scrollTop = 100; }
kb4.el.addEventListener('transitionend', ftReveal);

function ftFocusField(f) {
    ftFocus = f;
    openKB(kb4);
    syncFT();
    ftReveal();
    setTimeout(ftReveal, 320);
}
function ftBlur() { closeKB(kb4); ftFocus = null; syncFT(); }

/* an Apple ID is an e-mail address or a phone number */
function ftValidId(v) {
    v = v.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || /^\+?[\d][\d\s()\-.]{6,}$/.test(v);
}

function ftAlert(title, msg, cb) {
    $('ftATitle').textContent = title;
    $('ftAMsg').textContent = msg;
    ftAlertCb = cb || null;
    $('ftAlert').classList.add('up');
}
$('ftAOk').addEventListener('click', function () {
    $('ftAlert').classList.remove('up');
    let f = ftAlertCb; ftAlertCb = null;
    if (f) f();
});

function ftSignIn() {
    if (ftGo.classList.contains('busy') || ftGo.classList.contains('off')) return;
    ftBlur();
    ftGo.classList.add('busy');
    ftGoLbl.textContent = 'Signing In' + String.fromCharCode(0x2026);
    setTimeout(function () {
        ftGo.classList.remove('busy');
        ftGoLbl.textContent = 'Sign In';
        syncFT();
        let retry = function () { ftPw = ''; ftFocusField('pw'); };
        if (!ftValidId(ftId)) {
            ftAlert('Verification Failed', 'This Apple ID is not valid.', retry);
        } else if (ftPw.length < 8) {
            ftAlert('Verification Failed', 'Your Apple ID or password was incorrect.', retry);
        } else {
            ftAlert('Verification Failed',
                'There was an error connecting to the server. Check your network connection and try again.',
                retry);
        }
    }, 1900);
}

function ftReturn() {
    if (ftFocus === 'id') { if (ftId.trim()) ftFocusField('pw'); }
    else ftSignIn();
}

let OFFLINE = ['Cannot Open Page',
    'Safari cannot open the page because iPod touch is not connected to the Internet.'];

ftScroll.addEventListener('click', function (e) {
    let row = e.target.closest('.ft-row');
    if (row) { ftFocusField(row.dataset.f); return; }
    if (e.target.closest('.ft-go')) return;
    let link = e.target.closest('.ft-link');
    if (link) { ftBlur(); ftAlert(OFFLINE[0], OFFLINE[1]); return; }
    ftBlur();
});
ftGo.addEventListener('click', ftSignIn);
syncFT();
