"use strict";
/* Control Center + Notification Center */
/* ------------------------------------------------------------------ */
/* CONTROL CENTER + NOTIFICATION CENTER                               */
/* ------------------------------------------------------------------ */
let screenEl = $('screen'), ccEl = $('cc'), ncEl = $('nc'), ccShade = $('ccShade');
let CC_H = 427, NC_H = 568;
let ccOpen = false, ncOpen = false;
let SPRING = 'transform .34s cubic-bezier(.32,.72,0,1)';

/* ---- toggles ---- */
let TOGGLES = [
    { k: 'air', n: 'Airplane Mode', on: false, svg: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M22 15.2 13.6 10V3.8a1.6 1.6 0 10-3.2 0V10L2 15.2v2.2l8.4-2.6v4.4l-2.6 1.7v1.5l4.2-1.1 4.2 1.1v-1.5l-2.6-1.7v-4.4l8.4 2.6z"/></svg>' },
    { k: 'wifi', n: 'Wi-Fi', on: true, svg: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 19.6 9.3 16.7a4 4 0 015.4 0z"/><path d="M5.6 11.6a9.4 9.4 0 0112.8 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M2.2 7.7a14.4 14.4 0 0119.6 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' },
    { k: 'bt', n: 'Bluetooth', on: false, svg: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M11 2v8.2L6.6 6.4 5.3 7.9l5.4 4.6-5.4 4.6 1.3 1.5L11 14.8V23l6.9-5.9-4.5-4.6 4.5-4.6zm2 4.4 1.9 1.6L13 9.7zm0 9.2 1.9 1.6L13 18.9z"/></svg>' },
    { k: 'dnd', n: 'Do Not Disturb', on: false, svg: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M21 15.2A9.4 9.4 0 018.9 3.1 9.4 9.4 0 1021 15.2z"/></svg>' },
    { k: 'rot', n: 'Portrait Orientation Lock', on: false, svg: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2.2a9.8 9.8 0 00-8.2 4.4V3.4H2v5.9h5.9V7.9H4.6A8.2 8.2 0 1112 20.2v1.6a9.8 9.8 0 000-19.6z"/><path d="M9.6 11.4v-1.2a2.4 2.4 0 014.8 0v1.2H16v5.4H8v-5.4zm1.6 0h1.6v-1.2a.8.8 0 00-1.6 0z"/></svg>' }
];
$('ccToggles').innerHTML = TOGGLES.map(function (t, i) {
    return '<div class="ccT' + (t.on ? ' on' : '') + '" data-i="' + i + '" style="color:' + (t.on ? '#000' : 'rgba(0,0,0,.72)') + '">' + t.svg + '</div>';
}).join('');
let ccHint = $('ccHint'), hintTimer = null;
let GRABBER = '<svg width="30" height="9" viewBox="0 0 34 10"><path d="M2 2.5 15.4 7.9a4 4 0 003.2 0L32 2.5" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function ccSay(txt) {
    ccHint.textContent = txt;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function () { ccHint.innerHTML = GRABBER; }, 1700);
}
$('ccToggles').addEventListener('click', function (e) {
    let el = e.target.closest('.ccT'); if (!el) return;
    let t = TOGGLES[+el.dataset.i];
    t.on = !t.on;
    el.classList.toggle('on', t.on);
    el.style.color = t.on ? '#000' : 'rgba(0,0,0,.72)';
    ccSay(t.n + ': ' + (t.on ? 'On' : 'Off'));
    /* this tile and the switch in Settings are the same radio */
    if (t.k === 'wifi') seSetRadio(t.on);
    else if (t.k === 'bt') btSetRadio(t.on);
    else if (t.k === 'air') seSetAirplane(t.on);
});

/* ---- shortcuts ---- */
let SHORTS = [
    { k: 'torch', svg: '<svg width="30" height="34" viewBox="0 0 30 34"><path d="M9 1h12v3.6l-2.6 3.4v3H11.6v-3L9 4.6z"/><rect x="12.4" y="12" width="5.2" height="14" rx="2.6"/><rect x="12.4" y="27.4" width="5.2" height="5.6" rx="1.4"/></svg>' },
    { k: 'timer', svg: '<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="18" r="14" fill="none" stroke="#141416" stroke-width="2.6"/><circle cx="17" cy="18" r="9.4"/><path d="M13.6 1.4h6.8v3h-6.8z"/></svg>' },
    { k: 'calc', svg: '<svg width="28" height="34" viewBox="0 0 28 34"><rect x="0" y="0" width="28" height="34" rx="2.6"/><rect x="3.4" y="3.4" width="21.2" height="6.4" rx="1" fill="#fff"/><g fill="#fff"><rect x="3.4" y="12.8" width="4.4" height="4.4" rx="1"/><rect x="11.8" y="12.8" width="4.4" height="4.4" rx="1"/><rect x="20.2" y="12.8" width="4.4" height="4.4" rx="1"/><rect x="3.4" y="19.6" width="4.4" height="4.4" rx="1"/><rect x="11.8" y="19.6" width="4.4" height="4.4" rx="1"/><rect x="20.2" y="19.6" width="4.4" height="4.4" rx="1"/><rect x="3.4" y="26.4" width="4.4" height="4.4" rx="1"/><rect x="11.8" y="26.4" width="4.4" height="4.4" rx="1"/><rect x="20.2" y="26.4" width="4.4" height="4.4" rx="1"/></g></svg>' },
    { k: 'cam', svg: '<svg width="34" height="28" viewBox="0 0 34 28"><path d="M11 1.6h12l2.2 3.6H31A3 3 0 0134 8.2v16.4a3 3 0 01-3 3H3a3 3 0 01-3-3V8.2a3 3 0 013-3h5.8z"/><circle cx="17" cy="16" r="6.6" fill="#fff"/></svg>' }
];
$('ccShort').innerHTML = SHORTS.map(function (x) {
    return '<div class="ccS" data-k="' + x.k + '">' + x.svg + '</div>';
}).join('');
$('ccShort').addEventListener('click', function (e) {
    let el = e.target.closest('.ccS'); if (!el) return;
    if (el.dataset.k === 'torch') el.classList.toggle('on');
});

/* ---- sliders ---- */
function paintSlider(el, p) {
    el.querySelector('.fil').style.width = (p * 100) + '%';
    el.querySelector('.knb').style.left = (p * 100) + '%';
}
function makeSlider(el, onChange) {
    function upd(clientX) {
        let r = el.getBoundingClientRect();
        onChange(Math.max(0, Math.min(1, (clientX - r.left) / r.width)));
    }
    el.addEventListener('pointerdown', function (e) {
        e.stopPropagation(); el.setPointerCapture(e.pointerId); upd(e.clientX);
    });
    el.addEventListener('pointermove', function (e) {
        if (el.hasPointerCapture(e.pointerId)) upd(e.clientX);
    });
}
let bright = 1.00;
function setBright(p) {
    bright = Math.max(0.06, p);
    paintSlider($('ccBright'), bright);
    $('brightmask').style.opacity = ((1 - bright) * 0.68).toFixed(3);
}
makeSlider($('ccBright'), setBright);
setBright(bright);

makeSlider($('ccVol'), function (p) {
    vol = Math.round(p * VOL_STEPS);
    paintSlider($('ccVol'), vol / VOL_STEPS);
    drawVol();
});
function syncCCVol() { paintSlider($('ccVol'), vol / VOL_STEPS); }

/* ---- notification center content ---- */
let ICO_CAL = '<svg viewBox="0 0 26 26"><rect width="26" height="26" fill="#fff"/><rect width="26" height="7" fill="#F04A3F"/><g fill="#c9c9cf"><rect x="3" y="10" width="20" height="1.2"/><rect x="3" y="14" width="20" height="1.2"/><rect x="3" y="18" width="20" height="1.2"/></g><g fill="#7a7a80"><rect x="4" y="11.6" width="2" height="2"/><rect x="9" y="11.6" width="2" height="2"/><rect x="14" y="11.6" width="2" height="2"/><rect x="4" y="15.6" width="2" height="2"/><rect x="9" y="15.6" width="2" height="2"/></g></svg>';
let ICO_REM = '<svg viewBox="0 0 26 26"><rect width="26" height="26" fill="#fff"/><circle cx="5" cy="7" r="1.9" fill="#F04A3F"/><circle cx="5" cy="12" r="1.9" fill="#2FA8E0"/><circle cx="5" cy="17" r="1.9" fill="#4CD964"/><circle cx="5" cy="22" r="1.9" fill="#B05CD6"/><g fill="#c9c9cf"><rect x="9" y="6.2" width="14" height="1.5"/><rect x="9" y="11.2" width="14" height="1.5"/><rect x="9" y="16.2" width="14" height="1.5"/><rect x="9" y="21.2" width="14" height="1.5"/></g></svg>';
let ICO_STK = '<svg viewBox="0 0 26 26"><rect width="26" height="26" fill="#17171a"/><path d="M1 17l4-6 4 3 4-9 4 7 4-4 4 5" fill="none" stroke="#fff" stroke-width="1.6"/><g stroke="#3a3a40" stroke-width=".8"><path d="M4 2v22M9 2v22M14 2v22M19 2v22"/></g></svg>';

let STOCKS = [
    ['NASDAQ', '16,609.91', -0.76], ['NYSE', '17,899.59', 0.26], ['DOW J', '38,164.57', 0.14],
    ['AAPL', '191.63', 0.18], ['SBUX', '79.61', 1.08], ['NKE', '93.29', -0.17], ['YHOO', '', null]
];
function ord(d) { return (d % 10 === 1 && d !== 11) ? 'st' : (d % 10 === 2 && d !== 12) ? 'nd' : (d % 10 === 3 && d !== 13) ? 'rd' : 'th'; }

function ncToday() {
    let d = new Date();
    let h = '<div class="nc-date">' + DAYS[d.getDay()] + ',<br>' + MONS[d.getMonth()] + ' ' +
        d.getDate() + '<sup>' + ord(d.getDate()) + '</sup></div>';

    h += '<div class="wg-head"><div class="wg-ico">' + ICO_CAL + '</div><div class="ttl">Calendar</div></div>' +
        '<div class="wg-body"><div class="cal-empty"><i style="top:40px"></i><i style="top:80px"></i><i style="top:120px"></i>' +
        '<span>No Events</span></div></div>';

    h += '<div class="wg-head"><div class="wg-ico">' + ICO_REM + '</div><div class="ttl">Reminders</div></div>' +
        '<div class="wg-body">' +
        '<div class="rem"><div class="cir"></div><div><div class="tx"><b>!!</b> Turn in my homework</div>' +
        '<div class="dt">11/23/23</div></div></div>' +
        '<div class="rem"><div class="cir"></div><div><div class="tx"><b>!!!</b> Charge my computer</div>' +
        '<div class="dt">12/30/23</div></div></div></div>';

    h += '<div class="wg-head"><div class="wg-ico">' + ICO_STK + '</div><div class="ttl">Stocks</div></div>' +
        '<div class="wg-body">' + STOCKS.map(function (r, i) {
            let pct = r[2] === null ? '' :
                '<div class="pct ' + (r[2] < 0 ? 'dn' : 'up') + '"><span>' + (r[2] < 0 ? '\u2212' : '+') + '</span>' +
                Math.abs(r[2]).toFixed(2) + '%</div>';
            return (i ? '<div class="hairline"></div>' : '') +
                '<div class="stk"><div class="sym">' + r[0] + '</div>' +
                '<div class="prc">' + r[1] + '</div>' + pct + '</div>';
        }).join('') + '<div class="hairline"></div></div>';

    h += '<div class="wg-head"><div class="ttl">Tomorrow</div></div>' +
        '<div class="wg-body"><div class="tmw">You have no events scheduled for tomorrow.</div></div>';

    h += '<div class="nc-edit">Edit</div>' +
        '<div class="nc-cred"><u>Weather</u> information provided by<br>The Weather Channel, LLC.<br>' +
        '<u>Stock</u> information provided by <span style="color:rgba(190,150,220,.75);font-weight:600">YAHOO!</span></div>';
    return h;
}
function ncNotif() { return '<div class="nc-none">No Notifications</div>'; }

let ncTab = 'today';
function drawNC() {
    $('ncScroll').innerHTML = ncTab === 'today' ? ncToday() : ncNotif();
    $('ncScroll').scrollTop = 0;
    let segs = $('ncSeg').children;
    for (let i = 0; i < segs.length; i++) segs[i].className = segs[i].dataset.t === ncTab ? 'on' : '';
}
$('ncSeg').addEventListener('click', function (e) {
    let d = e.target.closest('div[data-t]'); if (!d) return;
    ncTab = d.dataset.t; drawNC();
});
drawNC();

/* ---- open / close ---- */
let CC_DIM = 0.45;   /* how far the app behind Control Center gets dimmed */
function ccDim(p) {   /* p = 0 closed .. 1 fully open */
    ccShade.style.opacity = (p * CC_DIM).toFixed(3);
    ccP = p;
    refreshInk();
}
function setCC(open) {
    ccOpen = open;
    ccEl.style.transition = SPRING;
    ccEl.style.transform = 'translateY(' + (open ? 0 : CC_H) + 'px)';
    ccShade.style.transition = 'opacity .34s cubic-bezier(.32,.72,0,1)';
    ccShade.style.pointerEvents = open ? 'auto' : 'none';
    ccDim(open ? 1 : 0);
    if (open) syncCCVol();
}
function setNC(open) {
    ncOpen = open;
    ncEl.style.transition = SPRING;
    ncEl.style.transform = 'translateY(' + (open ? 0 : -NC_H) + 'px)';
    if (open) drawNC();
}
ccShade.addEventListener('click', function () { setCC(false); });

/* ---- edge drags ---- */
let EDGE = 16, THRESH = 9;
let drag = null, swallow = false;

function scaleNow() {
    let r = screenEl.getBoundingClientRect();
    return r.width / 320;
}
screenEl.addEventListener('pointerdown', function (e) {
    if (asleep) return;
    if (locked && e.target.closest('#lkCam')) return;   /* camera handle owns that corner */
    let r = screenEl.getBoundingClientRect(), sc = scaleNow();
    let y = (e.clientY - r.top) / sc;
    if (ccOpen) { drag = { t: 'cc', y0: e.clientY, from: 0, live: false }; return; }
    if (ncOpen) {
        if (y > NC_H - 34) drag = { t: 'nc', y0: e.clientY, from: 0, live: false };
        return;
    }
    if (y > 568 - EDGE) drag = { t: 'cc', y0: e.clientY, from: CC_H, live: false };
    else if (y < EDGE) drag = { t: 'nc', y0: e.clientY, from: -NC_H, live: false };
}, true);

window.addEventListener('pointermove', function (e) {
    if (!drag) return;
    let d = (e.clientY - drag.y0) / scaleNow();
    if (!drag.live) {
        let want = drag.t === 'cc' ? (drag.from ? d < -THRESH : d > THRESH)
            : (drag.from ? d > THRESH : d < -THRESH);
        if (want) {
            drag.live = true; swallow = true;
            (drag.t === 'cc' ? ccEl : ncEl).style.transition = 'none';
        } else if (Math.abs(d) > THRESH * 1.8) { drag = null; return; }
        else return;
    }
    e.preventDefault();
    if (drag.t === 'cc') {
        let yc = Math.max(0, Math.min(CC_H, drag.from + d));
        ccEl.style.transform = 'translateY(' + yc + 'px)';
        ccShade.style.transition = 'none';
        ccDim(1 - yc / CC_H);
    } else {
        ncEl.style.transform = 'translateY(' + Math.max(-NC_H, Math.min(0, drag.from + d)) + 'px)';
    }
}, { passive: false });

window.addEventListener('pointerup', function (e) {
    if (!drag) return;
    let d = (e.clientY - drag.y0) / scaleNow(), t = drag.t, live = drag.live, from = drag.from;
    drag = null;
    if (!live) return;
    setTimeout(function () { swallow = false; }, 0);
    if (t === 'cc') {
        /* 0 = open, CC_H = closed. Flick wins, else nearest half. */
        let y = Math.max(0, Math.min(CC_H, from + d));
        if (d < -55) setCC(true);
        else if (d > 55) setCC(false);
        else setCC(y < CC_H / 2);
    } else {
        /* 0 = open, -NC_H = closed */
        let y2 = Math.max(-NC_H, Math.min(0, from + d));
        if (d > 55) setNC(true);
        else if (d < -55) setNC(false);
        else setNC(y2 > -NC_H / 2);
    }
});

document.addEventListener('click', function (e) {
    if (swallow) { e.stopPropagation(); e.preventDefault(); swallow = false; }
}, true);
