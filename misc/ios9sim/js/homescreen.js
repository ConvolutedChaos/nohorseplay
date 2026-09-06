"use strict";
/* ------------------------------------------------------------------ */
/* HOME SCREEN                                                        */
/* ------------------------------------------------------------------ */

/* iOS squircle: superellipse |x|^5 + |y|^5 = 1, as an objectBoundingBox clip */
(function () {
    let N = 180, n = 5, pts = [];
    for (let i = 0; i <= N; i++) {
        let t = i / N * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
        let sx = c < 0 ? -1 : 1, sy = s < 0 ? -1 : 1;
        let x = sx * Math.pow(Math.abs(c), 2 / n), y = sy * Math.pow(Math.abs(s), 2 / n);
        pts.push((x * 0.5 + 0.5).toFixed(4) + ',' + (y * 0.5 + 0.5).toFixed(4));
    }
    $('squirclePath').setAttribute('d', 'M' + pts.join('L') + 'Z');
})();

let MSGICON = '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="45" rx="37" ry="27.5" fill="#fff"/><path d="M33 61C32 71.5 25.5 79.5 15.2 84.2c-1.5.7-.9 2.7.8 2.4C31.5 84 42 76.5 46.5 68.5Z" fill="#fff"/></svg>';

/* img = file in icons/ ; leave it off and the tile falls back to the grey placeholder */
let PAGE1 = [
    { n: 'FaceTime', img: 'facetime.png', app: 'facetime' },
    { n: 'Calendar', img: 'calendar.png', live: 'cal' },
    { n: 'Photos', img: 'photos.png', app: 'photos' },
    { n: 'Camera', img: 'camera.png', app: 'camera' },
    { n: 'Weather', img: 'weather.png', app: 'weather' },
    { n: 'Clock', img: 'clock.png', app: 'clock', live: 'clock' },
    { n: 'Maps', img: 'maps.png' },
    { n: 'Videos', img: 'videos.png', app: 'videos' },
    { n: 'Wallet', img: 'wallet.png' },
    { n: 'Notes', img: 'notes.png', app: 'notes' },
    { n: 'Reminders', img: 'reminders.png', app: 'reminders' },
    { n: 'Stocks', img: 'stocks.png', app: 'stocks' },
    { n: 'iTunes Store', img: 'itunes-store.png', app: 'itunes' },
    { n: 'App Store', img: 'app-store.png', app: 'appstore' },
    { n: 'iBooks', img: 'ibooks.png' },
    { n: 'News', img: 'news.png' },
    { n: 'Health', img: 'health.png' },
    { n: 'Settings', img: 'settings.png', app: 'settings' }
];
/* page 2 is a guess -- I have no screenshot of it */
let PAGE2 = [

];
let DOCK = [
    { n: 'Messages', app: 'messages', img: 'messages.png' },
    { n: 'Safari', img: 'safari.png' },
    { n: 'Mail', img: 'mail.png' },
    { n: 'Music', img: 'music.png' }
];

function folderHTML(count) {
    let h = '';
    for (let i = 0; i < 9; i++) h += '<u class="' + (i < count ? 'f' : '') + '"></u>';
    return h;
}
/* the two icons that are alive: blank artwork underneath, moving parts
   drawn on top of it and repainted by liveIcons() every second */
let CAL_FACE = '<div class="cal-dow"><span></span></div><div class="cal-day"></div>';
let CLK_FACE = '<svg class="clk-hands" viewBox="0 0 100 100">' +
    '<line class="h-sec" x1="50" y1="55.8" x2="50" y2="12.1"></line>' +
    '<line class="h-hour" x1="50" y1="50" x2="50" y2="24.6"></line>' +
    '<line class="h-min" x1="50" y1="50" x2="50" y2="11.4"></line>' +
    '<circle class="h-cap" cx="50" cy="50" r="2.1"></circle></svg>';
let LIVE_FACE = { cal: CAL_FACE, clock: CLK_FACE };

function iconHTML(a) {
    let cls = 'tile' + (a.img ? ' art' : (a.app === 'messages' ? ' messages' : '')) + (a.folder ? ' folder' : '')
        + (a.live ? ' live-' + a.live : '');
    let inner = a.img ? '<img src="icons/' + a.img + '" alt="" draggable="false">'
        : (a.app === 'messages' ? MSGICON : (a.folder ? folderHTML(a.folder) : ''));
    if (a.live) inner += LIVE_FACE[a.live];
    return '<div class="icon" data-app="' + (a.app || '') + '">' +
        '<div class="' + cls + '">' + inner + '</div>' +
        (a.badge ? '<div class="badge">' + a.badge + '</div>' : '') +
        '<div class="lbl">' + esc(a.n) + '</div></div>';
}
$('hsGrid1').innerHTML = PAGE1.map(iconHTML).join('');
$('hsGrid2').innerHTML = PAGE2.map(iconHTML).join('');
$('hsDock').innerHTML = DOCK.map(iconHTML).join('');
$('hsDots').innerHTML = '<i class="on"></i><i></i>';

/* ---- the two icons that tell the time ------------------------------
   The calendar shows today's weekday and date; the clock's three hands
   ride on the blank face in icons/clock.png. Both are repainted on the
   second boundary, so the second hand lands with the system clock and
   the date flips at midnight without a reload. */
var liveCal = document.querySelector('#hsGrid1 .live-cal'),
    liveClk = document.querySelector('#hsGrid1 .live-clock'),
    calDow = liveCal && liveCal.querySelector('.cal-dow span'),
    calDay = liveCal && liveCal.querySelector('.cal-day'),
    hSec = liveClk && liveClk.querySelector('.h-sec'),
    hMin = liveClk && liveClk.querySelector('.h-min'),
    hHour = liveClk && liveClk.querySelector('.h-hour'),
    calShown = '';

function paintCal(d) {
    if (!calDow) return;
    var key = d.getDay() + '/' + d.getDate();
    if (key === calShown) return;
    calShown = key;
    calDow.textContent = DAYS[d.getDay()];
    calDay.textContent = d.getDate();
    /* a long name (Wednesday) is squeezed to fit rather than clipped */
    var room = liveCal.clientWidth - 5, w = calDow.offsetWidth;
    calDow.style.transform = w > room ? 'scaleX(' + (room / w).toFixed(3) + ')' : '';
}

function spin(el, deg) {
    el.setAttribute('transform', 'rotate(' + deg.toFixed(2) + ' 50 50)');
}
function paintClock(d) {
    if (!hSec) return;
    var s = d.getSeconds(), m = d.getMinutes(), h = d.getHours() % 12;
    spin(hSec, s * 6);
    spin(hMin, m * 6 + s * 0.1);
    spin(hHour, h * 30 + m * 0.5);
}

(function liveIcons() {
    var d = new Date();
    paintCal(d); paintClock(d);
    setTimeout(liveIcons, 1000 - (d.getTime() % 1000) + 4);
})();

/* the first paint can measure the weekday in the fallback font, so
   re-fit it once SF UI Display is actually in */
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { calShown = ''; paintCal(new Date()); });
}

/* ---- paging ---- */
let page = 0, PAGES = 2;
function setPage(p) {
    page = Math.max(0, Math.min(PAGES - 1, p));
    $('hsPages').style.transition = 'transform .32s cubic-bezier(.32,.72,0,1)';
    $('hsPages').style.transform = 'translateX(' + (-320 * page) + 'px)';
    let d = $('hsDots').children;
    for (let i = 0; i < d.length; i++) d[i].className = i === page ? 'on' : '';
}
(function () {
    let x0 = null, dx = 0, moved = false, pages = $('hsPages');
    function down(e) {
        if (openAppId || asleep) return;
        x0 = (e.touches ? e.touches[0].clientX : e.clientX); dx = 0; moved = false;
        pages.style.transition = 'none';
    }
    function move(e) {
        if (x0 === null) return;
        let x = (e.touches ? e.touches[0].clientX : e.clientX);
        dx = (x - x0) / (parseFloat(stage.style.transform.replace(/[^0-9.]/g, '')) || 1);
        if (Math.abs(dx) > 8) moved = true;
        if (moved && e.cancelable) e.preventDefault();
        let off = -320 * page + dx;
        if (off > 0 || off < -320 * (PAGES - 1)) off = -320 * page + dx * 0.32;
        pages.style.transform = 'translateX(' + off + 'px)';
    }
    function up() {
        if (x0 === null) return;
        x0 = null;
        if (moved && Math.abs(dx) > 55) setPage(page + (dx < 0 ? 1 : -1));
        else setPage(page);
        setTimeout(function () { moved = false; }, 0);
    }
    pages.addEventListener('mousedown', down);
    pages.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('mousemove', move);
    pages.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', up);
    pages.addEventListener('touchend', up);
    $('hsDots').addEventListener('click', function (e) {
        let i = Array.prototype.indexOf.call($('hsDots').children, e.target);
        if (i > -1) setPage(i);
    });
    $('homescreen').addEventListener('click', function (e) {
        if (moved) return;
        let ic = e.target.closest('.icon'); if (!ic) return;
        if (ic.dataset.app) openApp(ic, ic.dataset.app);
    });
})();

/* ---- open / close with the zoom-into-icon transition ---- */
let openAppId = null, hsEl = $('homescreen');
let APPS = { messages: $('app'), facetime: $('ftapp'), clock: $('ckapp'), photos: $('phapp'), camera: $('camapp'), weather: $('wxapp'), videos: $('vdapp'), notes: $('ntapp'), reminders: $('rmapp'), stocks: $('stapp'), itunes: $('itapp'), appstore: $('asapp'), settings: $('seapp') };
let EASE = 'cubic-bezier(.32,.06,.16,1)', DUR = 400;

function originOf(iconEl) {
    if (!iconEl) return '50% 50%';           /* app not on the home screen */
    let t = iconEl.querySelector('.tile').getBoundingClientRect();
    let s = $('screen').getBoundingClientRect();
    let cx = (t.left + t.width / 2 - s.left) / s.width * 100;
    let cy = (t.top + t.height / 2 - s.top) / s.height * 100;
    return cx.toFixed(2) + '% ' + cy.toFixed(2) + '%';
}
function iconFor(appId) {
    return document.querySelector('#homescreen .icon[data-app="' + appId + '"]');
}

function openApp(iconEl, id) {
    let appEl = APPS[id];
    if (openAppId || !appEl) return;
    if (id === 'camera') camOpen();
    if (id === 'weather') wxOpen();
    if (id === 'videos') vdOpen();
    if (id === 'notes') ntOpen();
    if (id === 'reminders') rmAppOpen();
    if (id === 'stocks') stOpen();
    if (id === 'itunes') itOpen();
    if (id === 'appstore') asOpen();
    if (id === 'settings') seOpen();
    let o = originOf(iconEl);
    openAppId = id;
    appEl.style.transition = 'none';
    appEl.style.transformOrigin = o;
    appEl.style.transform = 'scale(.055)';
    appEl.classList.add('on');
    appEl.style.opacity = '0';
    hsEl.style.transition = 'none';
    hsEl.style.transformOrigin = o;
    hsEl.style.transform = 'scale(1)';
    hsEl.style.opacity = '1';
    appEl.offsetHeight;                      /* reflow */
    appEl.style.transition = 'transform ' + DUR + 'ms ' + EASE + ',opacity ' + (DUR * 0.55) + 'ms ease-out';
    hsEl.style.transition = 'transform ' + DUR + 'ms ' + EASE + ',opacity ' + (DUR * 0.7) + 'ms ease-out';
    appEl.style.transform = 'scale(1)';
    appEl.style.opacity = '1';
    hsEl.style.transform = 'scale(1.32)';
    hsEl.style.opacity = '0';
}

/* an app's own teardown, split out so a restart can run it without
   the zoom-out that closeApp draws */
function appTeardown(id) {
    if (id === 'facetime') { ftBlur(); $('ftAlert').classList.remove('up'); ftAlertCb = null; }
    if (id === 'clock') ckReset();
    if (id === 'photos') phReset();
    if (id === 'camera') camReset();
    if (id === 'weather') wxReset();
    if (id === 'videos') vdReset();
    if (id === 'notes') ntReset();
    if (id === 'reminders') rmAppReset();
    if (id === 'stocks') stReset();
    if (id === 'itunes') itReset();
    if (id === 'appstore') asReset();
    if (id === 'settings') seReset();
}

function closeApp() {
    if (!openAppId) return;
    let id = openAppId, appEl = APPS[id];
    openAppId = null;
    appTeardown(id);
    let o = originOf(iconFor(id));
    appEl.style.transformOrigin = o;
    hsEl.style.transformOrigin = o;
    appEl.style.transition = 'transform ' + DUR + 'ms ' + EASE + ',opacity ' + (DUR * 0.8) + 'ms ease-in';
    hsEl.style.transition = 'transform ' + DUR + 'ms ' + EASE + ',opacity ' + (DUR * 0.6) + 'ms ease-out';
    appEl.style.transform = 'scale(.055)';
    appEl.style.opacity = '0';
    hsEl.style.transform = 'scale(1)';
    hsEl.style.opacity = '1';
    setTimeout(function () { if (openAppId !== id) appEl.classList.remove('on'); }, DUR);
}
