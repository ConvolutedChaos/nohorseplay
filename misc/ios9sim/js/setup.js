"use strict";
/* ==================================================================== */
/* SETUP ASSISTANT                                                      */
/* ==================================================================== */
/* Traced off ref_pic/setup/ -- 34 photographs of a real iPad running
   9.3.5, taken with a phone because a device still in Setup has no way
   to screenshot itself.

   The reference is an iPad and this is a 320x568 iPod touch, so the
   wording, the running order and which words are blue all come off the
   photos, while the measurements are the ones the same screens use at
   4 inches. Copy says "iPod touch" throughout for the same reason the
   rest of this simulator does.

   Runs once. suDone() writes a flag to localStorage and every later
   boot goes straight to the lock screen; Settings > Developer has a row
   that clears the flag and restarts into it again. */

var SU_KEY = 'ios935.setup';

/* ---- what the lists hold ------------------------------------------ */
/* The thirteen in IMG_1281, in the order the photo has them, plus the
   rest of the languages iOS 9 shipped so the list scrolls like a list. */
var SU_LANGS = ['English', 'Español', 'Français', 'Deutsch', '简体中文',
    '繁體中文', '日本語', 'Nederlands', 'Italiano', '한국어',
    'Português', 'Dansk', 'Suomi', 'Norsk bokmål', 'Svenska', 'Русский',
    'Polski', 'Türkçe', 'Čeština', 'Magyar'];

/* IMG_1282 puts the current region alone at the top, then everything
   else under a header. The photo runs as far as Argentina. */
var SU_COUNTRIES = ['Afghanistan', 'Åland Islands', 'Albania', 'Algeria', 'American Samoa',
    'Andorra', 'Angola', 'Anguilla', 'Antigua & Barbuda', 'Argentina', 'Armenia', 'Aruba',
    'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
    'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Botswana',
    'Brazil', 'Bulgaria', 'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China', 'Colombia',
    'Costa Rica', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Ecuador', 'Egypt',
    'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hong Kong', 'Hungary', 'Iceland',
    'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kenya', 'Kuwait',
    'Latvia', 'Lithuania', 'Luxembourg', 'Malaysia', 'Malta', 'Mexico', 'Morocco',
    'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Peru',
    'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia',
    'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka',
    'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'Ukraine',
    'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Venezuela',
    'Vietnam'];

var SU_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

/* ---- glyphs -------------------------------------------------------- */
var SU_CHEV = '<svg class="chev" width="8" height="13" viewBox="0 0 9 15" aria-hidden="true">' +
    '<path d="M1 1l6.4 6.5L1 14" fill="none" stroke="#C7C7CC" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

var SU_LOCKICON = '<svg width="8" height="11" viewBox="0 0 8 11" aria-hidden="true">' +
    '<path d="M2 4.6V3a2 2 0 014 0v1.6" fill="none" stroke="currentColor" stroke-width="1.1"/>' +
    '<rect x="0.4" y="4.4" width="7.2" height="6.2" rx="1" fill="currentColor"/></svg>';

var SU_WIFIICON = '<svg width="15" height="11" viewBox="0 0 16 12" aria-hidden="true">' +
    '<path d="M8 10.6 6.1 8.5a2.9 2.9 0 013.8 0z" fill="currentColor"/>' +
    '<path d="M3.4 5.9a6.7 6.7 0 019.2 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
    '<path d="M1 3.2a10.2 10.2 0 0114 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

/* the blue arrowhead over Location Services */
var SU_ARROW = '<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">' +
    '<path d="M27 3 3 13.4l10 3.6 3.6 10z" fill="#007AFF"/></svg>';

/* the green circular arrow over Apps & Data */
var SU_RESTORE = '<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">' +
    '<rect width="30" height="30" rx="6.6" fill="#4CD371"/>' +
    '<path d="M21.5 15a6.5 6.5 0 11-2.4-5" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round"/>' +
    '<path d="M20.6 5.6v4.6h-4.6" fill="none" stroke="#fff" stroke-width="2.1" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* the blue bar chart over Diagnostics */
var SU_CHART = '<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">' +
    '<rect x="2" y="12" width="4.6" height="12" rx="1.4" fill="#007AFF"/>' +
    '<rect x="8.8" y="5" width="4.6" height="19" rx="1.4" fill="#007AFF"/>' +
    '<rect x="15.6" y="9" width="4.6" height="15" rx="1.4" fill="#007AFF"/>' +
    '<rect x="22.4" y="2" width="3.4" height="22" rx="1.4" fill="#5AC8FA"/></svg>';

/* the person-with-a-key over Forgot Password? */
var SU_FORGOT = '<svg width="34" height="30" viewBox="0 0 34 30" aria-hidden="true">' +
    '<circle cx="13" cy="9" r="5.6" fill="#007AFF"/>' +
    '<path d="M2.4 27c0-6 4.8-9.6 10.6-9.6S23.6 21 23.6 27z" fill="#007AFF"/>' +
    '<circle cx="25" cy="20" r="7.4" fill="#3AA0FF"/>' +
    '<circle cx="25" cy="17.6" r="2" fill="#fff"/>' +
    '<path d="M25 19.4v5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>';

/* The six service marks under the Apple ID fields, and the same set
   again in the two-column grid on the help page. Drawn rather than
   pulled from icons/, because at 25px they are only a colour and a
   silhouette. */
var SU_SVCS = [
    { k: 'icloud', bg: 'linear-gradient(#3EC4F5,#1E9BE0)', g: '<svg width="17" height="12" viewBox="0 0 20 14"><path d="M5.4 13.4a4.7 4.7 0 01-.5-9.3 5.6 5.6 0 0110.7 1 3.9 3.9 0 01-.6 8.3z" fill="#fff"/></svg>' },
    { k: 'appstore', bg: 'linear-gradient(#25B7F5,#0A7BE4)', g: '<svg width="16" height="16" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="none"/><path d="M9 3.2 5.2 13.4M9 3.2l3.8 10.2M6.1 10.8h5.8" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>' },
    { k: 'itunes', bg: 'linear-gradient(#F45CC0,#B14BE8)', g: '<svg width="14" height="15" viewBox="0 0 15 16"><path d="M12.6 1.2 5.4 3v8.1a2.5 2.5 0 101.5 2.3V5.6l4.2-1v5.1a2.5 2.5 0 101.5 2.3z" fill="#fff"/></svg>' },
    { k: 'messages', bg: 'linear-gradient(#5EE164,#1FBF37)', g: '<svg width="16" height="15" viewBox="0 0 18 17"><path d="M9 1.2c4.6 0 8 2.9 8 6.5S13.6 14.2 9 14.2a10 10 0 01-2.4-.3l-3.9 1.7 1.2-3A6.2 6.2 0 011 7.7C1 4.1 4.4 1.2 9 1.2z" fill="#fff"/></svg>' },
    { k: 'findmy', bg: 'linear-gradient(#5EE164,#1FBF37)', g: '<svg width="16" height="16" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7.6" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M13.4 4.6 7.4 7.4 4.6 13.4l6-2.8z" fill="#fff"/></svg>' },
    { k: 'wallet', bg: 'linear-gradient(#F7C64B,#E8922B)', g: '<svg width="16" height="12" viewBox="0 0 18 13"><rect x="0.8" y="0.8" width="16.4" height="11.4" rx="2" fill="#fff"/><rect x="0.8" y="4" width="16.4" height="2.2" fill="#C97C1A"/></svg>' }
];

/* "What is an Apple ID?" -- the grid in IMG_1301, read left to right */
var SU_FEATURES = [
    [0, 'Get all your content on all your devices automatically, with iCloud.'],
    [1, 'Find the best selection of apps in the App Store.'],
    [2, 'Shop for music, movies, TV shows, and more in the iTunes Store.'],
    [4, 'Access all your photos on all your devices with iCloud Photo Library.'],
    [3, 'Send unlimited text messages to other iOS users with iMessage.'],
    [5, 'Make video calls to iPhone, iPad, or Mac with FaceTime.']
];

/* ---- state --------------------------------------------------------- */
var su = {
    page: 'hello',
    hist: [],
    lang: 'English',
    country: 'United States',
    activated: false,
    code: '',            /* the four digits being typed */
    code1: '',           /* the first pass, while re-entering */
    confirm: false,
    field: null,         /* which text field the keyboard is pointed at */
    vals: {},            /* field id -> what has been typed into it */
    other: { name: '', sec: 'None' },
    bday: { m: 8, d: 5, y: 2026 },
    alertCb: null,
    joining: null
};

var suEl = $('setup'), suBody = $('suBody'), suNavEl = $('suNav');

/* ==================================================================== */
/* FRAME                                                                */
/* ==================================================================== */

/* Every page declares what the top row should look like. Back is on all
   of them but the first; a right-hand action only exists where the
   photos show one, and it greys out until its field has something in
   it -- "Next" is dimmed in IMG_1296 and IMG_1297. */
function suSetNav(back, next, on) {
    $('suBack').classList.toggle('show', !!back);
    var n = $('suNext');
    n.classList.toggle('show', !!next);
    n.classList.toggle('dim', !!next && !on);
    if (next) n.textContent = next;
}

/* dir: 1 = forward (slides in from the right), -1 = a Back */
function suShow(name, dir) {
    su.page = name;
    su.field = null;
    closeKB(kbSU);
    var p = SU_PAGES[name];
    var anim = dir === 0 ? '' : (dir < 0 ? 'in-left' : 'in-right');
    suEl.classList.toggle('black', name === 'itunes');
    suBody.innerHTML = '<div class="su-page ' + anim + ' ' + (p.cls || '') + '">' + p.html() + '</div>';
    suSetNav(p.back !== false && su.hist.length > 0, p.next, p.nextOn ? p.nextOn() : false);
    if (p.after) p.after();
}

function suGo(name) {
    su.hist.push(su.page);
    suShow(name, 1);
}

function suBackTo() {
    if (!su.hist.length) return;
    var name = su.hist.pop();
    suShow(name, -1);
}

$('suBack').addEventListener('click', suBackTo);
$('suNext').addEventListener('click', function () {
    var p = SU_PAGES[su.page];
    if (p && p.onNext) p.onNext();
});

/* ---- alerts -------------------------------------------------------- */
function suAlert(title, msg, btns) {
    $('suATitle').innerHTML = esc(title).replace(/\n/g, '<br>');
    $('suAMsg').innerHTML = msg ? esc(msg) : '';
    $('suAMsg').style.display = msg ? '' : 'none';
    $('suABtns').className = 'su-abtns' + (btns.length === 1 ? ' one' : '');
    $('suABtns').innerHTML = btns.map(function (b, i) {
        return '<div class="su-abtn" data-i="' + i + '">' + esc(b.n) + '</div>';
    }).join('');
    su.alertCb = btns;
    $('suAlert').classList.add('up');
}

$('suABtns').addEventListener('click', function (e) {
    var b = e.target.closest('.su-abtn');
    if (!b || !su.alertCb) return;
    var fn = su.alertCb[+b.dataset.i].f;
    $('suAlert').classList.remove('up');
    su.alertCb = null;
    if (fn) fn();
});

/* ---- text fields ---------------------------------------------------
   Setup has no real inputs; the on-screen keyboard writes into su.vals
   and the field redraws itself, which is how every other text field in
   this simulator works. */
function suFocus(id) {
    su.field = id;
    suSyncFields();
    openKB(kbSU);
}

function suBlur() {
    su.field = null;
    suSyncFields();
    closeKB(kbSU);
    if (kbSU.layout !== 'letters') { kbSU.layout = 'letters'; drawKeys(kbSU); }
}

function suGet(id) { return su.vals[id] || ''; }

function suSyncFields() {
    [].forEach.call(suBody.querySelectorAll('.su-field[data-f]'), function (f) {
        var id = f.dataset.f, v = suGet(id), on = su.field === id;
        f.classList.toggle('focus', on);
        var inp = f.querySelector('.inp');
        inp.classList.toggle('ph', !v && !on);
        inp.innerHTML = v ? esc(v) + '<i class="caret"></i>'
            : (on ? '<i class="caret"></i>' + '<span style="color:#C7C7CD">' + esc(f.dataset.ph || '') + '</span>'
                : esc(f.dataset.ph || ''));
    });
    /* the sheet's Name row lives outside #suBody */
    var on = $('suOtherName');
    if (on) {
        var v = su.other.name;
        on.classList.toggle('focus', su.field === 'other');
        var i = on.querySelector('.inp');
        i.classList.toggle('ph', !v);
        i.innerHTML = v ? esc(v) + '<i class="caret"></i>' : 'Network Name';
        $('suSheetJoin').classList.toggle('dim', !v.trim());
    }
    var p = SU_PAGES[su.page];
    if (p && p.next) suSetNav(true, p.next, p.nextOn ? p.nextOn() : false);
}

/* the keyboard calls this on return; each field decides what that means */
function suReturn() {
    if (su.field === 'other') { if (su.other.name.trim()) suSheetJoin(); return; }
    var p = SU_PAGES[su.page];
    if (p && p.onNext && (!p.nextOn || p.nextOn())) p.onNext();
    else suBlur();
}

/* ==================================================================== */
/* PAGES                                                                */
/* ==================================================================== */
/* Each entry is { html, after?, back?, next?, nextOn?, onNext? }. The
   click wiring is delegated off #suBody by data-a, so a page only has
   to name its actions. */

var SU_PAGES = {

    /* ---- Hello (IMG_1277) ---- */
    hello: {
        back: false,
        html: function () {
            return '<div class="su-hello"><b>Hello</b></div>' +
                '<div class="su-slide" data-a="begin">' +
                '<svg width="10" height="17" viewBox="0 0 10 17" aria-hidden="true">' +
                '<path d="M1.4 1.4 8 8.5l-6.6 7.1" fill="none" stroke="#8E8E93" stroke-width="1.6" ' +
                'stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                '<span>slide to set up</span></div>' +
                '<svg class="su-info" data-a="reg" viewBox="0 0 22 22" aria-hidden="true">' +
                '<circle cx="11" cy="11" r="10" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
                '<circle cx="11" cy="6" r="1.1" fill="currentColor"/>' +
                '<path d="M11 9.2v7.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
        }
    },

    /* ---- the regulatory page behind the ⓘ (IMG_1278 - IMG_1280) ---- */
    reg: {
        html: function () {
            return '<div class="su-reg">' +
                '<h4>Model A1416</h4>' +
                '<h4>U.S.</h4><div>FCC ID: BCGA1416</div>' +
                '<h4>Canada</h4><div>IC: 579C-A1416&nbsp;&nbsp;Meets ICES-003</div>' +
                '<h4>Europe</h4><div class="mark big">✖ C‘0682①</div>' +
                '<h4>Australia/New Zealand</h4><div class="mark">Ⓐ</div>' +
                '<h4>Japan</h4>' +
                '<div>D 011122003<br>R003WWA111318<br>R003WWA111319<br>R003WWA111320<br>R003WWA111321</div>' +
                '<div>5.0 GHz (W52, W53) Indoor Use Only</div>' +
                '<h4>Brazil</h4><div class="mark">◉ANATEL</div><div>0760-12-1993</div>' +
                '<h4>Costa Rica</h4><div class="mark">sutel</div><div>1302-2012</div>' +
                '<h4>Mexico</h4><div class="mark">NOM</div><div>RCPAPA112-0217</div>' +
                '<h4>Russia</h4><div class="mark big">EAC</div>' +
                '<h4>South Africa</h4>' +
                '<div>TA-2011/1932<br>TA-2011/1933<br>Approved</div>' +
                '<h4>South Korea</h4><div>KCC-CMM-APA-A1416</div>' +
                '<h4>Taiwan</h4><div>CCAI12LP0510T8</div>' +
                '<h4>Singapore</h4>' +
                '<div class="boxed">Complies with<br>IDA Standards<br>DB00063</div>' +
                '<h4>United Arab Emirates</h4>' +
                '<div class="boxed">TRA ID: 0016472/08<br>TA: ER0083369/12<br>TA: ER0083409/12</div>' +
                '<h4>Argentina</h4><div class="mark">CNC</div><div>C-10483</div>' +
                '<h4>Malaysia</h4><div class="mark">MCMC</div><div>CIDF15000067</div>' +
                '</div>';
        }
    },

    /* ---- Language (IMG_1281) ---- */
    language: {
        back: false,
        html: function () {
            return '<div class="su-table flush">' + SU_LANGS.map(function (l) {
                return '<div class="su-row" data-a="lang" data-v="' + esc(l) + '">' +
                    '<span class="grow">' + esc(l) + '</span>' + SU_CHEV + '</div>';
            }).join('') + '</div>';
        }
    },

    /* ---- Country (IMG_1282) ---- */
    country: {
        html: function () {
            return '<div class="su-title">Select Your Country or Region</div>' +
                '<div class="su-table">' +
                '<div class="su-row" data-a="country" data-v="' + esc(su.country) + '">' +
                '<span class="grow">' + esc(su.country) + '</span>' + SU_CHEV + '</div>' +
                '</div>' +
                '<div class="su-hdr">MORE COUNTRIES AND REGIONS</div>' +
                '<div class="su-table flush">' + SU_COUNTRIES.map(function (c) {
                    return '<div class="su-row" data-a="country" data-v="' + esc(c) + '">' +
                        '<span class="grow">' + esc(c) + '</span>' + SU_CHEV + '</div>';
                }).join('') + '</div>';
        }
    },

    /* ---- Choose a Wi-Fi Network (IMG_1283, IMG_1287) ---- */
    wifi: {
        html: function () {
            return '<div class="su-title">Choose a Wi-Fi Network</div>' +
                '<div class="su-table">' + AIR.map(function (ap) {
                    return '<div class="su-row" data-a="join" data-v="' + ap.id + '">' +
                        (su.joining === ap.id ? '<div class="su-spin"></div>' : '') +
                        '<span class="grow">' + esc(ap.ssid) + '</span>' +
                        '<span class="su-wifi-icons">' +
                        (ap.sec === 'None' ? '' : SU_LOCKICON) + SU_WIFIICON + '</span></div>';
                }).join('') + '</div>' +
                '<div class="su-link" data-a="other">Choose another network</div>' +
                '<div style="height:14px"></div>' +
                '<div class="su-table"><div class="su-row" data-a="itunes" ' +
                'style="color:#007AFF;height:38px">Connect to iTunes</div></div>' +
                '<div class="su-note" style="text-align:left;padding-left:16px">' +
                'Set up your iPod touch using iTunes if your Wi-Fi network is not available.</div>';
        }
    },

    /* ---- the black Connect to iTunes screen (IMG_1285, IMG_1295) ---- */
    itunes: {
        html: function () {
            return '<div class="su-itunes">' +
                '<b>Connect to iTunes</b>' +
                '<svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">' +
                '<circle cx="26" cy="26" r="25" fill="url(#suITg)"/>' +
                '<defs><linearGradient id="suITg" x1="0" y1="0" x2="0" y2="1">' +
                '<stop offset="0" stop-color="#F45CC0"/><stop offset="1" stop-color="#8E4BE8"/>' +
                '</linearGradient></defs>' +
                '<path d="M35 12 20 15.8v18.4a5 5 0 103 4.6V21l9-2.3v11.6a5 5 0 103 4.6z" fill="#fff"/></svg>' +
                '<svg width="26" height="150" viewBox="0 0 26 150" aria-hidden="true">' +
                '<path d="M13 150V44" stroke="#fff" stroke-width="2.4"/>' +
                '<rect x="3" y="26" width="20" height="15" rx="2.4" fill="#fff"/>' +
                '<path d="M13 26V6" stroke="#fff" stroke-width="2.4"/></svg>' +
                '</div>';
        }
    },

    /* ---- activating (IMG_1288) ----
       A spinner and a line of text, and after a beat it moves on by
       itself. This is where the clock arrives in the status bar. */
    activating: {
        back: false,
        html: function () {
            return '<div class="su-title" style="visibility:hidden">.</div>' +
                '<div style="padding-top:170px"><div class="su-spin big"></div></div>' +
                '<div class="su-sub" style="padding-top:14px">It may take a few minutes to activate your iPod touch.</div>';
        },
        after: function () {
            setTimeout(function () {
                if (su.page !== 'activating') return;
                su.activated = true;
                $('sustatus').classList.add('activated');
                su.hist = [];                 /* there is no going back past activation */
                suGo('location');
            }, 2600);
        }
    },

    /* ---- Location Services (IMG_1289, IMG_1290) ---- */
    location: {
        cls: 'bottom',
        html: function () {
            return '<div class="su-glyph">' + SU_ARROW + '</div>' +
                '<div class="su-title">Location Services</div>' +
                '<div class="su-sub">Location Services allows Maps and other apps and services ' +
                'like Find My iPod touch to gather and use data indicating your approximate location.</div>' +
                '<div class="su-link" data-a="noop">About Location Services</div>' +
                '<div class="su-spacer"></div>' +
                '<div class="su-choice" data-a="loc-on">Enable Location Services</div>' +
                '<div class="su-choice" data-a="loc-off">Disable Location Services</div>';
        }
    },

    /* ---- Create a Passcode (IMG_1291 - IMG_1293) ----
       Four places: filled for what has been typed, a short rule for
       what has not. The code chosen here becomes the one the lock
       screen wants, which is the whole point of setting it. */
    passcode: {
        html: function () {
            return '<div class="su-title">Create a Passcode</div>' +
                '<div class="su-sub">' + (su.confirm ? 'Re-enter your passcode.'
                    : 'A passcode protects your data and is used to unlock iPod touch.') + '</div>' +
                '<div class="su-dots" id="suDots"></div>' +
                '<div class="su-link" data-a="noop" style="padding-top:150px">Passcode Options</div>';
        },
        after: function () {
            suPaintDots();
            kbSU.layout = 'numbers';
            drawKeys(kbSU);
            openKB(kbSU);
        }
    },

    /* ---- Apps & Data (IMG_1294) ---- */
    appsdata: {
        html: function () {
            return '<div class="su-glyph">' + SU_RESTORE + '</div>' +
                '<div class="su-title">Apps &amp; Data</div>' +
                '<div class="su-table">' +
                '<div class="su-row" data-a="icloudsignin"><span class="grow">Restore from iCloud Backup</span>' + SU_CHEV + '</div>' +
                '<div class="su-row" data-a="icloudsignin"><span class="grow">Restore from iTunes Backup</span>' + SU_CHEV + '</div>' +
                '<div class="su-row" data-a="asnew"><span class="grow">Set Up as New iPod touch</span>' + SU_CHEV + '</div>' +
                '</div>' +
                '<div class="su-sub" style="font-weight:600;padding-top:16px">What does restoring do?</div>' +
                '<div class="su-sub" style="padding-top:3px">Your personal data and purchased content will ' +
                'appear on your device, automatically.</div>';
        }
    },

    /* ---- iCloud Sign In (IMG_1296) ---- */
    icloudsignin: {
        next: 'Next',
        nextOn: function () { return !!suGet('id1').trim(); },
        onNext: function () { suBlur(); suGo('terms'); },
        html: function () {
            return '<div class="su-title">iCloud Sign In</div>' +
                suFieldsHTML([['id1', 'Apple ID', 'example@icloud.com'], ['pw1', 'Password', 'Required']]) +
                '<div class="su-sub" style="padding-top:18px">Sign in with your iCloud Apple ID.</div>' +
                '<div class="su-link" data-a="forgot">Forgot Apple ID or Password?</div>';
        },
        after: function () { suSyncFields(); }
    },

    /* ---- Apple ID (IMG_1297, IMG_1299) ---- */
    appleid: {
        next: 'Next',
        nextOn: function () { return !!suGet('id1').trim(); },
        onNext: function () { suBlur(); suGo('terms'); },
        html: function () {
            return '<div class="su-title">Apple ID</div>' +
                '<div class="su-sub">Sign in with your Apple ID to use iCloud, iTunes, the App Store, and more.</div>' +
                suFieldsHTML([['id1', 'Apple ID', 'example@icloud.com'], ['pw1', 'Password', 'Required']]) +
                '<div class="su-link" data-a="idhelp">Don’t have an Apple ID or forgot it?</div>' +
                '<div class="su-apps">' + SU_SVCS.map(suSvcHTML).join('') + '</div>' +
                '<div class="su-sub" style="padding-top:10px">Your Apple ID is the account you use to access all Apple services.</div>' +
                '<div class="su-link" data-a="privacy">About Apple ID and Privacy</div>' +
                '<div class="su-link" data-a="diffids" style="padding-top:26px">Use different Apple IDs for iCloud &amp; iTunes?</div>';
        },
        after: function () { suSyncFields(); }
    },

    /* ---- About Apple ID and Privacy (IMG_1298) ----
       A sheet on the iPad; at this width it is its own page with Done
       where Back would be. */
    privacy: {
        next: 'Done',
        nextOn: function () { return true; },
        onNext: function () { suBackTo(); },
        back: false,
        html: function () {
            return '<div class="su-title" style="font-size:15px;font-weight:600;font-family:var(--sf-text)">' +
                'About Apple ID and Privacy</div>' +
                '<div class="su-terms" style="height:auto;max-height:none;border:0;background:transparent;margin-top:6px">' +
                '<p>Your Apple ID is the account you use to access all Apple services. When you sign in with ' +
                'your Apple ID, you will be signed in to iCloud, the App Store, Apple Music, iTunes, iBooks, ' +
                'iMessage, FaceTime, and Game Center on this device.</p>' +
                '<h5>iCloud</h5>' +
                '<p>When iCloud is enabled, your data such as iCloud email, contacts, calendars, reminders, ' +
                'bookmarks, notes, photos, videos, documents and data, device and account settings, and certain ' +
                'third party app data will be automatically sent to and stored by Apple. This allows you to later ' +
                'access this data or have it wirelessly pushed to your other iCloud-enabled devices or computers. ' +
                'Your device’s serial number and other hardware identifiers will also be sent to and used by ' +
                'Apple when you sign up for iCloud for service and support purposes.</p>' +
                '<h5>• Find My iPhone</h5>' +
                '<p>If iCloud is enabled, certain features of Find My iPhone (namely, send a message, play a ' +
                'sound, remotely lock and remotely wipe) are automatically turned on. If you enable Location ' +
                'Services and use any of the Find My iPhone, Find My Mac, Find My Friends or Share My Location ' +
                'features, your location information, as well as information about your device and your account ' +
                'will be sent to Apple so that Apple can show the location of your device on a map or share it ' +
                'with whom you choose. Once you have requested your device’s location, and the device has ' +
                'been located on a map, you can view the last location of your device after your initial request.</p>' +
                '</div>';
        }
    },

    /* ---- iCloud (IMG_1300) ---- */
    icloud: {
        next: 'Next',
        nextOn: function () { return !!suGet('id1').trim(); },
        onNext: function () { suBlur(); suGo('terms'); },
        html: function () {
            return '<div class="su-title">iCloud</div>' +
                suFieldsHTML([['id1', 'Apple ID', 'example@icloud.com'], ['pw1', 'Password', 'Required']]) +
                '<div class="su-sub" style="padding-top:18px">Enter the Apple ID you use for iCloud.</div>';
        },
        after: function () { suSyncFields(); }
    },

    /* ---- Apple ID help (IMG_1301, IMG_1304) ---- */
    idhelp: {
        html: function () {
            return '<div class="su-title">Apple ID</div>' +
                '<div class="su-table">' +
                '<div class="su-row" data-a="forgot"><span class="grow">Forgot Apple ID or Password</span>' + SU_CHEV + '</div>' +
                '<div class="su-row" data-a="birthday"><span class="grow">Create a Free Apple ID</span>' + SU_CHEV + '</div>' +
                '</div>' +
                '<div class="su-sub" style="font-weight:600;padding-top:18px">What is an Apple ID?</div>' +
                '<div class="su-sub" style="padding-top:4px">An Apple ID is the account you use to access ' +
                'everything Apple. You can sign in to all Apple services with a single Apple ID and password.</div>' +
                '<div class="su-grid">' + SU_FEATURES.map(function (f) {
                    return '<div class="su-cell">' + suSvcHTML(SU_SVCS[f[0]]) + '<span>' + esc(f[1]) + '</span></div>';
                }).join('') + '</div>' +
                '<div class="su-link" data-a="later" style="padding-top:24px">Set Up Later in Settings</div>';
        }
    },

    /* ---- Forgot Password? (IMG_1302) ---- */
    forgot: {
        next: 'Next',
        nextOn: function () { return !!suGet('fid').trim(); },
        onNext: function () { suBlur(); suBackTo(); },
        html: function () {
            return '<div class="su-glyph">' + SU_FORGOT + '</div>' +
                '<div class="su-title">Forgot Password?</div>' +
                '<div class="su-sub">Enter your Apple ID to continue.</div>' +
                suFieldsHTML([['fid', 'Apple ID', 'Required']]) +
                '<div class="su-note" style="text-align:left;padding:8px 16px 0">Your Apple ID is the email ' +
                'address or phone number you use to sign in to iCloud, the App Store, and other Apple services.</div>';
        },
        after: function () { suSyncFields(); }
    },

    /* ---- Birthday (IMG_1303) ---- */
    birthday: {
        next: 'Next',
        nextOn: function () { return true; },
        onNext: function () { suGo('terms'); },
        html: function () {
            return '<div class="su-title">Birthday</div>' +
                '<div class="su-sub">Your birthday is used to determine which services to set up on this iPod touch.</div>' +
                '<div class="su-table"><div class="su-row" style="cursor:default">' +
                '<span class="grow" style="font-weight:600">Birthday</span>' +
                '<span class="val" id="suBdayVal">' + suBdayText() + '</span></div></div>' +
                suPickerHTML();
        },
        after: function () { suPaintPicker(); }
    },

    /* ---- Terms and Conditions (IMG_1305) ---- */
    terms: {
        html: function () {
            return '<div class="su-title">Terms and Conditions</div>' +
                '<div class="su-link" data-a="sendmail">Send by Email</div>' +
                '<div class="su-terms">' +
                '<h5>IMPORTANT</h5>' +
                '<p>Please read the following terms before using your iOS device. By using your iOS device, ' +
                'you are agreeing to be bound by the iOS Terms and Conditions.</p>' +
                '<div class="tlink" data-a="noop"><span class="grow">A. iOS Terms and Conditions</span>' + SU_CHEV + '</div>' +
                '<p>PLEASE READ THESE AGREEMENT(S) (COLLECTIVELY “AGREEMENTS”) CAREFULLY BEFORE USING ' +
                'YOUR iOS DEVICE, DOWNLOADING THE SOFTWARE UPDATE ACCOMPANYING THESE AGREEMENTS, OR USING THE ' +
                'ASSOCIATED PRODUCTS AND SERVICES. BY USING YOUR iOS DEVICE OR DOWNLOADING A SOFTWARE UPDATE, ' +
                'AS APPLICABLE, YOU ARE AGREEING TO BE BOUND BY THE TERMS OF THESE AGREEMENTS.</p>' +
                '<p>IF YOU DO NOT AGREE TO THE TERMS OF THESE AGREEMENTS, DO NOT USE THE iOS DEVICE OR DOWNLOAD ' +
                'THE SOFTWARE UPDATE. IF YOU HAVE RECENTLY PURCHASED AN iOS DEVICE AND YOU DO NOT AGREE TO THE ' +
                'TERMS OF THE AGREEMENTS, YOU MAY RETURN THE iOS DEVICE WITHIN THE RETURN PERIOD TO THE APPLE ' +
                'STORE OR AUTHORIZED DISTRIBUTOR WHERE YOU OBTAINED IT FOR A REFUND, SUBJECT TO APPLE’S ' +
                'RETURN POLICY FOUND AT http://www.apple.com/legal/sales_policies/.</p>' +
                '</div>' +
                '<div class="su-agree"><div data-a="disagree">Disagree</div><span class="grow"></span>' +
                '<div data-a="agree">Agree</div></div>';
        }
    },

    /* ---- Send by Email (IMG_1306) ---- */
    sendmail: {
        next: 'Send',
        nextOn: function () { return !!suGet('mail').trim(); },
        onNext: function () { suBlur(); suBackTo(); },
        html: function () {
            return '<div class="su-title">Send by Email</div>' +
                suFieldsHTML([['mail', 'Email', 'name@example.com']]) +
                '<div class="su-note" style="text-align:left;padding:8px 16px 0">Enter the email address where ' +
                'you would like to receive the Terms and Conditions.</div>';
        },
        after: function () { suSyncFields(); }
    },

    /* ---- Siri (IMG_1307) ---- */
    siri: {
        html: function () {
            return '<div class="su-title" style="padding-top:20px">Siri</div>' +
                '<div class="su-sub">Siri helps you get things done just by asking. Send a message, ' +
                'dictate a note, even find a restaurant.</div>' +
                '<div class="su-sub" style="padding-top:11px">To use Siri, press and hold the Home button.</div>' +
                '<div class="su-choice" data-a="siri-on" style="padding:12px">Turn On Siri</div>' +
                '<div class="su-hero">' + suWaveHTML() + '</div>' +
                '<div class="su-choice" data-a="siri-off" style="padding:14px 22px 0">Turn On Siri Later</div>' +
                '<div class="su-note">Siri sends information like your voice input, contacts, and location ' +
                'to Apple to process your requests. About Siri</div>';
        }
    },

    /* ---- Diagnostics (IMG_1308) ---- */
    diagnostics: {
        cls: 'bottom',
        html: function () {
            return '<div class="su-glyph">' + SU_CHART + '</div>' +
                '<div class="su-title">Diagnostics</div>' +
                '<div class="su-sub">Help Apple improve its products and services by automatically sending ' +
                'diagnostic and usage data. Diagnostic data may include location. You can also help App ' +
                'Developers improve their apps by choosing to share your app activity and crash data with ' +
                'them through Apple.</div>' +
                '<div class="su-link" data-a="noop">About Diagnostics &amp; Privacy</div>' +
                '<div class="su-spacer"></div>' +
                '<div class="su-choice" data-a="diag">Send to Apple</div>' +
                '<div class="su-choice" data-a="diag">Don’t Send</div>';
        }
    },

    /* ---- Welcome (IMG_1309) ---- */
    welcome: {
        back: false,
        html: function () {
            return '<div class="su-hello"><b style="font-size:32px">Welcome to iPod touch</b></div>' +
                '<div class="su-choice" data-a="finish" ' +
                'style="position:absolute;left:0;right:0;bottom:64px">Get Started</div>';
        }
    }
};

/* ---- small builders ------------------------------------------------ */
function suFieldsHTML(rows) {
    return '<div class="su-fields">' + rows.map(function (r) {
        return '<div class="su-field" data-f="' + r[0] + '" data-ph="' + esc(r[2]) + '">' +
            '<label>' + esc(r[1]) + '</label><div class="inp ph">' + esc(r[2]) + '</div></div>';
    }).join('') + '</div>';
}

function suSvcHTML(s) {
    return '<span class="su-app" style="background:' + s.bg + '">' + s.g + '</span>';
}

/* the six-band ribbon on the Siri hero, drawn flat rather than animated */
function suWaveHTML() {
    var cols = ['#4EC7F3', '#B36CF0', '#F45CA0', '#F98A4B', '#57D07A', '#4EC7F3'], p = '';
    for (var i = 0; i < cols.length; i++) {
        p += '<path d="M0 11 Q 16 ' + (11 - 7 + i * 1.6) + ' 33 11 T 66 11 T 99 11 T 132 11" ' +
            'fill="none" stroke="' + cols[i] + '" stroke-width="1.2" opacity="' + (0.9 - i * 0.1).toFixed(2) + '"/>';
    }
    return '<svg class="wave" viewBox="0 0 132 22" preserveAspectRatio="none">' + p + '</svg>';
}

function suPaintDots() {
    var el = $('suDots');
    if (!el) return;
    var h = '';
    for (var i = 0; i < 4; i++) h += '<i class="' + (i < su.code.length ? '' : 'off') + '"></i>';
    el.innerHTML = h;
}

/* ---- birthday wheels ----------------------------------------------- */
function suBdayText() { return (su.bday.m + 1) + '/' + su.bday.d + '/' + String(su.bday.y).slice(2); }

function suDaysIn(m, y) { return new Date(y, m + 1, 0).getDate(); }

function suPickerHTML() {
    return '<div class="su-picker">' +
        '<div class="su-wheel mo"><ul></ul></div>' +
        '<div class="su-wheel dy"><ul></ul></div>' +
        '<div class="su-wheel yr"><ul></ul></div>' +
        '<div class="bandtop"></div><div class="bandbot"></div></div>';
}

/* The wheel is a plain list shifted so the chosen row lands on the band;
   rows either side of it fade, which is all the depth a flat picker
   needs at this size. */
function suPaintWheel(sel, items, idx) {
    var ul = suBody.querySelector('.su-wheel.' + sel + ' ul');
    if (!ul) return;
    ul.innerHTML = items.map(function (t, i) {
        var d = Math.abs(i - idx);
        return '<li data-w="' + sel + '" data-i="' + i + '" class="' +
            (d === 0 ? 'on' : (d === 1 ? 'near' : '')) + '">' + esc(String(t)) + '</li>';
    }).join('');
    ul.style.transform = 'translateY(' + (67.5 - idx * 27) + 'px)';
}

function suPaintPicker() {
    var b = su.bday, days = [], yrs = [], i;
    for (i = 1; i <= suDaysIn(b.m, b.y); i++) days.push(i);
    for (i = 1940; i <= 2026; i++) yrs.push(i);
    suPaintWheel('mo', SU_MONTHS, b.m);
    suPaintWheel('dy', days, b.d - 1);
    suPaintWheel('yr', yrs, yrs.indexOf(b.y));
    var v = $('suBdayVal');
    if (v) v.textContent = suBdayText();
}

/* ==================================================================== */
/* ACTIONS                                                              */
/* ==================================================================== */
suBody.addEventListener('click', function (e) {
    var li = e.target.closest('.su-wheel li');
    if (li) {
        var w = li.dataset.w, i = +li.dataset.i;
        if (w === 'mo') su.bday.m = i;
        else if (w === 'dy') su.bday.d = i + 1;
        else su.bday.y = 1940 + i;
        if (su.bday.d > suDaysIn(su.bday.m, su.bday.y)) su.bday.d = suDaysIn(su.bday.m, su.bday.y);
        suPaintPicker();
        return;
    }

    var f = e.target.closest('.su-field[data-f]');
    if (f) { suFocus(f.dataset.f); return; }

    var t = e.target.closest('[data-a]');
    if (!t) { if (su.field) suBlur(); return; }
    var a = t.dataset.a, v = t.dataset.v;

    if (a === 'noop') return;
    if (a === 'begin') return suGo('language');
    if (a === 'reg') return suGo('reg');

    if (a === 'lang') { su.lang = v; return suGo('country'); }
    if (a === 'country') { su.country = v; return suGo('wifi'); }

    if (a === 'join') return suJoin(+v);
    if (a === 'other') return suOpenSheet();
    if (a === 'itunes') {
        return suAlert('Continue without Wi-Fi?',
            'You need a network connection to set up App Store, iTunes Store, iCloud, and other services.',
            [{ n: 'Continue', f: function () { suGo('itunes'); } }, { n: 'Use Wi-Fi' }]);
    }

    if (a === 'loc-on') return suGo('passcode');
    if (a === 'loc-off') {
        return suAlert('Disable Location Services?',
            'Maps and other apps will be unable to use your approximate location. You can turn on ' +
            'Location Services in Settings.',
            [{ n: 'Cancel' }, { n: 'OK', f: function () { suGo('passcode'); } }]);
    }

    if (a === 'asnew') return suGo('appleid');
    if (a === 'icloudsignin') return suGo('icloudsignin');
    if (a === 'idhelp') return suGo('idhelp');
    if (a === 'privacy') return suGo('privacy');
    if (a === 'diffids') return suGo('icloud');
    if (a === 'forgot') return suGo('forgot');
    if (a === 'birthday') return suGo('birthday');

    if (a === 'later') {
        return suAlert('Are you sure you don’t want to use an Apple ID?',
            'You need an Apple ID to use the App Store, iTunes Store, iCloud, and other services. ' +
            'Creating one is free and easy.',
            [{ n: 'Use Apple ID' }, { n: 'Don’t Use', f: function () { su.hist = ['appsdata']; suGo('terms'); } }]);
    }

    if (a === 'sendmail') return suGo('sendmail');
    if (a === 'agree') { su.hist = []; return suGo('siri'); }
    if (a === 'disagree') {
        /* The photos stop at the Disagree / Agree bar, so this alert is
           the one piece of wording in here that is not off a photo --
           it is what iOS 9 shows, but treat it as reconstructed. */
        return suAlert('Terms and Conditions',
            'You must agree to the Terms and Conditions to continue.', [{ n: 'OK' }]);
    }

    if (a === 'siri-on' || a === 'siri-off') return suGo('diagnostics');
    if (a === 'diag') return suGo('welcome');
    if (a === 'finish') return suFinish();
});

/* ---- Wi-Fi --------------------------------------------------------- */
/* Joining is the real thing: it writes through to the same wifi state
   Settings reads, so the network picked here is the one already joined
   when Settings > Wi-Fi is opened later. */
function suJoin(id) {
    if (su.joining) return;
    var ap = AIR.filter(function (a) { return a.id === id; })[0];
    if (!ap) return;
    su.joining = id;
    suShow('wifi', 0);
    setTimeout(function () {
        su.joining = null;
        var cfg = seCfg(ap.ssid);
        cfg.saved = true;
        cfg.pw = ap.pw;
        ap.lease = seLease(ap);
        wifi.joined = ap.id;
        seAfterChange();
        $('sustatus').classList.add('online');
        su.hist = ['country'];
        suGo('activating');
    }, 1500);
}

function suOpenSheet() {
    su.other.name = '';
    su.field = 'other';
    suSyncFields();
    $('suSheet').classList.add('up');
    openKB(kbSU);
}

function suCloseSheet() {
    $('suSheet').classList.remove('up');
    su.field = null;
    closeKB(kbSU);
}

function suSheetJoin() {
    suCloseSheet();
    $('sustatus').classList.add('online');
    su.hist = ['country'];
    suGo('activating');
}

$('suSheetCancel').addEventListener('click', suCloseSheet);
$('suSheetJoin').addEventListener('click', suSheetJoin);
$('suOtherName').addEventListener('click', function () { su.field = 'other'; suSyncFields(); openKB(kbSU); });

/* ---- passcode ------------------------------------------------------
   Four digits, then either the "commonly used" warning or straight on
   to the re-entry. A mismatch drops back to the first pass, which is
   what iOS does rather than telling you off. */
var SU_WEAK = ['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666',
    '7777', '8888', '9999', '1212', '4321', '2580', '1004', '2000'];

/* The keyboard reads and writes whatever field is live through this
   pair, the same way it does for every other app. The passcode page is
   the odd one: it has no field, so the four digits are the text. */
function suKBGet() {
    if (su.page === 'passcode') return su.code;
    if (su.field === 'other') return su.other.name;
    return su.field ? suGet(su.field) : '';
}

var suCoding = false;
function suKBSet(v) {
    if (su.page === 'passcode') {
        su.code = v.replace(/D/g, '').slice(0, 4);
        suPaintDots();
        if (su.code.length === 4 && !suCoding) {
            suCoding = true;
            setTimeout(function () { suCoding = false; suCodeDone(); }, 170);
        }
        return;
    }
    if (su.field === 'other') { su.other.name = v; suSyncFields(); return; }
    if (su.field) { su.vals[su.field] = v; suSyncFields(); }
}

function suCodeDone() {
    if (!su.confirm) {
        if (SU_WEAK.indexOf(su.code) >= 0) {
            return suAlert('Are You Sure You Want to Use This Code?',
                'This code is commonly used and can be easily guessed.',
                [{ n: 'Change', f: function () { su.code = ''; suPaintDots(); } },
                { n: 'Use Code', f: suCodeConfirm }]);
        }
        return suCodeConfirm();
    }
    if (su.code === su.code1) {
        PASSCODE = su.code;          /* the lock screen now wants this one */
        su.confirm = false;
        return suGo('appsdata');
    }
    su.confirm = false;
    su.code = '';
    su.code1 = '';
    suShow('passcode', 0);
}

function suCodeConfirm() {
    su.code1 = su.code;
    su.code = '';
    su.confirm = true;
    suShow('passcode', 0);
}

/* ==================================================================== */
/* START / FINISH                                                       */
/* ==================================================================== */
function suPending() {
    try { return localStorage.getItem(SU_KEY) !== 'done'; }
    catch (e) { return true; }        /* private mode: run it, once, per load */
}

function suStart() {
    su.hist = [];
    su.page = 'hello';
    su.activated = false;
    su.code = '';
    su.code1 = '';
    su.confirm = false;
    su.vals = {};
    $('sustatus').classList.remove('activated', 'online');
    suEl.classList.remove('done');
    suEl.classList.add('on');
    suShow('hello', 1);
    battSync();
}

/* Get Started: fade the assistant out onto the home screen, the way the
   real one hands over. The lock screen is dressed underneath but not
   raised -- a device you have just set up is already unlocked. */
function suFinish() {
    try { localStorage.setItem(SU_KEY, 'done'); } catch (e) { }
    closeKB(kbSU);
    suEl.classList.add('done');
    setTimeout(function () {
        suEl.classList.remove('on', 'done');
        locked = false;
        lockEl.classList.remove('on');
    }, 520);
}

/* Settings > Developer uses this to run through it again */
function suReset() {
    try { localStorage.removeItem(SU_KEY); } catch (e) { }
}

var kbSU = buildKeyboard($('kbSU'), { target: 'su', nopred: true, nocap: true, retLabel: 'return' });
