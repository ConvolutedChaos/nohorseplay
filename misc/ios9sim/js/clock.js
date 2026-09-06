"use strict";
/* ================================================================== */
/* CLOCK                                                              */
/* ================================================================== */
/* Geometry throughout is traced off ref_pic/Clock (2x shots):
     nav 44, tab bar 49, list rows 85, picker 215 with 35 pt rows. */

var CK_RED = '#FF3B30';

var TICK = '<svg class="tick" width="15" height="12" viewBox="0 0 15 12" aria-hidden="true">' +
    '<path d="M1.3 6.3 5.3 10.4 13.7 1.5" fill="none" stroke="' + CK_RED +
    '" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/* same glyph, but without the .tick hook the tone rows use to park it
   in the left gutter -- here it just sits inline at the row's end */
var TICKI = TICK.replace(' class="tick"', '');
var CKCHEV = '<svg class="chev" width="9" height="15" viewBox="0 0 9 15"><path d="M1 1l6.4 6.5L1 14" ' +
    'fill="none" stroke="#C7C7CC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var CKBACK = function (lbl) {
    return '<div class="btn back"><svg width="12" height="20" viewBox="0 0 12 20">' +
        '<path d="M10.5 1 1.6 10l8.9 9" fill="none" stroke="' + CK_RED + '" stroke-width="2.4" ' +
        'stroke-linecap="round" stroke-linejoin="round"/></svg><span>' + esc(lbl) + '</span></div>';
};

/* ---- tab bar glyphs: grey outline off, red (mostly solid) on ---- */
var TAB_ICONS = {
    world: function (on) {
        return '<svg width="25" height="25" viewBox="0 0 26 26"><g fill="none" stroke="currentColor" ' +
            'stroke-width="' + (on ? 1.7 : 1.4) + '"><circle cx="13" cy="13" r="11.6"/>' +
            '<ellipse cx="13" cy="13" rx="5.3" ry="11.6"/>' +
            '<path d="M2.3 8.2h21.4M1.4 13h23.2M2.3 17.8h21.4"/></g></svg>';
    },
    alarm: function (on) {
        if (!on) return '<svg width="25" height="25" viewBox="0 0 28 28"><g fill="none" ' +
            'stroke="currentColor" stroke-width="1.7" stroke-linecap="round">' +
            '<circle cx="14" cy="16.6" r="8.9"/><path d="M14 11.4v5.2h3.4"/>' +
            '<circle cx="5.6" cy="7" r="3.4"/><circle cx="22.4" cy="7" r="3.4"/>' +
            '<path d="M8 24.6 6.2 26.8M20 24.6l1.8 2.2"/></g></svg>';
        return '<svg width="25" height="25" viewBox="0 0 28 28"><g fill="currentColor">' +
            '<circle cx="5.6" cy="7" r="4.2"/><circle cx="22.4" cy="7" r="4.2"/>' +
            '<path d="M8.4 23.8 6 27.2l-2-1.4 2.4-3.4zM19.6 23.8 22 27.2l2-1.4-2.4-3.4z"/>' +
            '<circle cx="14" cy="16.6" r="9.6"/></g>' +
            '<path d="M14 11.4v5.2h3.4" fill="none" stroke="#fff" stroke-width="1.7" ' +
            'stroke-linecap="round" stroke-linejoin="round"/></svg>';
    },
    sw: function (on) {
        if (!on) return '<svg width="25" height="25" viewBox="0 0 28 28"><g fill="none" ' +
            'stroke="currentColor" stroke-width="1.7" stroke-linecap="round">' +
            '<circle cx="14" cy="16.4" r="9.6"/><path d="M14 16.4V9.6"/>' +
            '<path d="M11.6 2.4h4.8"/><path d="M14 2.6v3.4"/></g></svg>';
        return '<svg width="25" height="25" viewBox="0 0 28 28"><g fill="currentColor">' +
            '<rect x="11.4" y="1.4" width="5.2" height="3.2" rx="1"/>' +
            '<circle cx="23.2" cy="7.4" r="2.1"/><circle cx="14" cy="16.4" r="10.2"/></g>' +
            '<path d="M14 16.4V8.8M11.4 4.4h5.2" fill="none" stroke="#fff" stroke-width="1.8" ' +
            'stroke-linecap="round"/></svg>';
    },
    timer: function (on) {
        if (!on) return '<svg width="25" height="25" viewBox="0 0 28 28"><g fill="none" ' +
            'stroke="currentColor" stroke-width="1.7" stroke-linecap="round">' +
            '<circle cx="14" cy="16.4" r="9.6"/><path d="M14 16.4 8.6 11"/>' +
            '<path d="M7.4 4.6 5 7"/></g></svg>';
        return '<svg width="25" height="25" viewBox="0 0 28 28"><g fill="currentColor">' +
            '<circle cx="14" cy="16.4" r="10.2"/>' +
            '<path d="M5.4 3.6 8.8 7 6.6 9.2 3.2 5.8z"/></g>' +
            '<path d="M14 16.4 8.4 10.8" fill="none" stroke="#fff" stroke-width="1.9" ' +
            'stroke-linecap="round"/></svg>';
    }
};

var CK_TABS = [
    { k: 'world', n: 'World Clock', pane: 'pane-world' },
    { k: 'alarm', n: 'Alarm', pane: 'pane-alarm' },
    { k: 'sw', n: 'Stopwatch', pane: 'pane-sw' },
    { k: 'timer', n: 'Timer', pane: 'pane-timer' }
];

/* ---- cities: IANA zones, so Intl does every DST decision for us ---- */
var CK_CITIES = [
    ['Accra', 'Ghana', 'Africa/Accra'], ['Acton', 'U.S.A.', 'America/Los_Angeles'],
    ['Adak', 'U.S.A.', 'America/Adak'], ['Adamstown', 'Pitcairn', 'Pacific/Pitcairn'],
    ['Addis Ababa', 'Ethiopia', 'Africa/Addis_Ababa'], ['Adelaide', 'Australia', 'Australia/Adelaide'],
    ['Aden', 'Yemen', 'Asia/Aden'], ['Albuquerque', 'U.S.A.', 'America/Denver'],
    ['Alexandria', 'Egypt', 'Africa/Cairo'], ['Algiers', 'Algeria', 'Africa/Algiers'],
    ['Alofi', 'Niue', 'Pacific/Niue'], ['Amman', 'Jordan', 'Asia/Amman'],
    ['Amsterdam', 'Netherlands', 'Europe/Amsterdam'], ['Anchorage', 'U.S.A.', 'America/Anchorage'],
    ['Andorra la Vella', 'Andorra', 'Europe/Andorra'], ['Ankara', 'Turkey', 'Europe/Istanbul'],
    ['Antananarivo', 'Madagascar', 'Indian/Antananarivo'], ['Apia', 'Samoa', 'Pacific/Apia'],
    ['Ashgabat', 'Turkmenistan', 'Asia/Ashgabat'], ['Asmara', 'Eritrea', 'Africa/Asmara'],
    ['Astana', 'Kazakhstan', 'Asia/Almaty'], ['Asunción', 'Paraguay', 'America/Asuncion'],
    ['Athens', 'Greece', 'Europe/Athens'], ['Atlanta', 'U.S.A.', 'America/New_York'],
    ['Auckland', 'New Zealand', 'Pacific/Auckland'], ['Austin', 'U.S.A.', 'America/Chicago'],
    ['Baghdad', 'Iraq', 'Asia/Baghdad'], ['Baku', 'Azerbaijan', 'Asia/Baku'],
    ['Bangkok', 'Thailand', 'Asia/Bangkok'], ['Barcelona', 'Spain', 'Europe/Madrid'],
    ['Beijing', 'China', 'Asia/Shanghai'], ['Beirut', 'Lebanon', 'Asia/Beirut'],
    ['Belgrade', 'Serbia', 'Europe/Belgrade'], ['Berlin', 'Germany', 'Europe/Berlin'],
    ['Bermuda', 'Bermuda', 'Atlantic/Bermuda'], ['Bogotá', 'Colombia', 'America/Bogota'],
    ['Boston', 'U.S.A.', 'America/New_York'], ['Brasília', 'Brazil', 'America/Sao_Paulo'],
    ['Bratislava', 'Slovakia', 'Europe/Bratislava'], ['Brisbane', 'Australia', 'Australia/Brisbane'],
    ['Brussels', 'Belgium', 'Europe/Brussels'], ['Bucharest', 'Romania', 'Europe/Bucharest'],
    ['Budapest', 'Hungary', 'Europe/Budapest'],
    ['Buenos Aires', 'Argentina', 'America/Argentina/Buenos_Aires'],
    ['Cairo', 'Egypt', 'Africa/Cairo'], ['Calgary', 'Canada', 'America/Edmonton'],
    ['Canberra', 'Australia', 'Australia/Sydney'], ['Cape Town', 'South Africa', 'Africa/Johannesburg'],
    ['Caracas', 'Venezuela', 'America/Caracas'], ['Casablanca', 'Morocco', 'Africa/Casablanca'],
    ['Chicago', 'U.S.A.', 'America/Chicago'], ['Colombo', 'Sri Lanka', 'Asia/Colombo'],
    ['Copenhagen', 'Denmark', 'Europe/Copenhagen'], ['Cupertino', 'U.S.A.', 'America/Los_Angeles'],
    ['Dakar', 'Senegal', 'Africa/Dakar'], ['Dallas', 'U.S.A.', 'America/Chicago'],
    ['Damascus', 'Syria', 'Asia/Damascus'], ['Dar es Salaam', 'Tanzania', 'Africa/Dar_es_Salaam'],
    ['Delhi', 'India', 'Asia/Kolkata'], ['Denver', 'U.S.A.', 'America/Denver'],
    ['Detroit', 'U.S.A.', 'America/Detroit'], ['Dhaka', 'Bangladesh', 'Asia/Dhaka'],
    ['Doha', 'Qatar', 'Asia/Qatar'], ['Dubai', 'U.A.E.', 'Asia/Dubai'],
    ['Dublin', 'Ireland', 'Europe/Dublin'], ['Edinburgh', 'U.K.', 'Europe/London'],
    ['Edmonton', 'Canada', 'America/Edmonton'], ['Frankfurt', 'Germany', 'Europe/Berlin'],
    ['Georgetown', 'Guyana', 'America/Guyana'], ['Guatemala City', 'Guatemala', 'America/Guatemala'],
    ['Halifax', 'Canada', 'America/Halifax'], ['Hanoi', 'Vietnam', 'Asia/Ho_Chi_Minh'],
    ['Havana', 'Cuba', 'America/Havana'], ['Helsinki', 'Finland', 'Europe/Helsinki'],
    ['Honolulu', 'U.S.A.', 'Pacific/Honolulu'], ['Hong Kong', 'China', 'Asia/Hong_Kong'],
    ['Houston', 'U.S.A.', 'America/Chicago'], ['Islamabad', 'Pakistan', 'Asia/Karachi'],
    ['Istanbul', 'Turkey', 'Europe/Istanbul'], ['Jakarta', 'Indonesia', 'Asia/Jakarta'],
    ['Jerusalem', 'Israel', 'Asia/Jerusalem'],
    ['Johannesburg', 'South Africa', 'Africa/Johannesburg'],
    ['Kabul', 'Afghanistan', 'Asia/Kabul'], ['Kampala', 'Uganda', 'Africa/Kampala'],
    ['Kathmandu', 'Nepal', 'Asia/Kathmandu'], ['Khartoum', 'Sudan', 'Africa/Khartoum'],
    ['Kiev', 'Ukraine', 'Europe/Kiev'], ['Kingston', 'Jamaica', 'America/Jamaica'],
    ['Kinshasa', 'Congo', 'Africa/Kinshasa'], ['Kolkata', 'India', 'Asia/Kolkata'],
    ['Kuala Lumpur', 'Malaysia', 'Asia/Kuala_Lumpur'], ['Kuwait City', 'Kuwait', 'Asia/Kuwait'],
    ['La Paz', 'Bolivia', 'America/La_Paz'], ['Lagos', 'Nigeria', 'Africa/Lagos'],
    ['Las Vegas', 'U.S.A.', 'America/Los_Angeles'], ['Lima', 'Peru', 'America/Lima'],
    ['Lisbon', 'Portugal', 'Europe/Lisbon'], ['London', 'U.K.', 'Europe/London'],
    ['Los Angeles', 'U.S.A.', 'America/Los_Angeles'],
    ['Luxembourg', 'Luxembourg', 'Europe/Luxembourg'], ['Madrid', 'Spain', 'Europe/Madrid'],
    ['Managua', 'Nicaragua', 'America/Managua'], ['Manila', 'Philippines', 'Asia/Manila'],
    ['Melbourne', 'Australia', 'Australia/Melbourne'],
    ['Mexico City', 'Mexico', 'America/Mexico_City'], ['Miami', 'U.S.A.', 'America/New_York'],
    ['Minneapolis', 'U.S.A.', 'America/Chicago'], ['Minsk', 'Belarus', 'Europe/Minsk'],
    ['Monaco', 'Monaco', 'Europe/Monaco'], ['Monrovia', 'Liberia', 'Africa/Monrovia'],
    ['Montevideo', 'Uruguay', 'America/Montevideo'], ['Montréal', 'Canada', 'America/Toronto'],
    ['Moscow', 'Russia', 'Europe/Moscow'], ['Mumbai', 'India', 'Asia/Kolkata'],
    ['Nairobi', 'Kenya', 'Africa/Nairobi'], ['Nassau', 'Bahamas', 'America/Nassau'],
    ['New Orleans', 'U.S.A.', 'America/Chicago'], ['New York', 'U.S.A.', 'America/New_York'],
    ['Nicosia', 'Cyprus', 'Asia/Nicosia'], ['Nuuk', 'Greenland', 'America/Godthab'],
    ['Oslo', 'Norway', 'Europe/Oslo'], ['Ottawa', 'Canada', 'America/Toronto'],
    ['Panama City', 'Panama', 'America/Panama'],
    ['Papeete', 'French Polynesia', 'Pacific/Tahiti'], ['Paris', 'France', 'Europe/Paris'],
    ['Perth', 'Australia', 'Australia/Perth'], ['Philadelphia', 'U.S.A.', 'America/New_York'],
    ['Phoenix', 'U.S.A.', 'America/Phoenix'], ['Port-au-Prince', 'Haiti', 'America/Port-au-Prince'],
    ['Prague', 'Czech Republic', 'Europe/Prague'], ['Quito', 'Ecuador', 'America/Guayaquil'],
    ['Reykjavík', 'Iceland', 'Atlantic/Reykjavik'], ['Riga', 'Latvia', 'Europe/Riga'],
    ['Rio de Janeiro', 'Brazil', 'America/Sao_Paulo'], ['Riyadh', 'Saudi Arabia', 'Asia/Riyadh'],
    ['Rome', 'Italy', 'Europe/Rome'], ['San Francisco', 'U.S.A.', 'America/Los_Angeles'],
    ['San Juan', 'Puerto Rico', 'America/Puerto_Rico'], ['Santiago', 'Chile', 'America/Santiago'],
    ['Santo Domingo', 'Dominican Republic', 'America/Santo_Domingo'],
    ['São Paulo', 'Brazil', 'America/Sao_Paulo'], ['Seattle', 'U.S.A.', 'America/Los_Angeles'],
    ['Seoul', 'South Korea', 'Asia/Seoul'], ['Shanghai', 'China', 'Asia/Shanghai'],
    ['Singapore', 'Singapore', 'Asia/Singapore'], ['Sofia', 'Bulgaria', 'Europe/Sofia'],
    ['St. John’s', 'Canada', 'America/St_Johns'], ['Stockholm', 'Sweden', 'Europe/Stockholm'],
    ['Suva', 'Fiji', 'Pacific/Fiji'], ['Sydney', 'Australia', 'Australia/Sydney'],
    ['Taipei', 'Taiwan', 'Asia/Taipei'], ['Tallinn', 'Estonia', 'Europe/Tallinn'],
    ['Tashkent', 'Uzbekistan', 'Asia/Tashkent'], ['Tbilisi', 'Georgia', 'Asia/Tbilisi'],
    ['Tehran', 'Iran', 'Asia/Tehran'], ['Tokyo', 'Japan', 'Asia/Tokyo'],
    ['Toronto', 'Canada', 'America/Toronto'], ['Tripoli', 'Libya', 'Africa/Tripoli'],
    ['Tunis', 'Tunisia', 'Africa/Tunis'], ['Ulaanbaatar', 'Mongolia', 'Asia/Ulaanbaatar'],
    ['Vancouver', 'Canada', 'America/Vancouver'], ['Vienna', 'Austria', 'Europe/Vienna'],
    ['Vilnius', 'Lithuania', 'Europe/Vilnius'], ['Warsaw', 'Poland', 'Europe/Warsaw'],
    ['Washington, D.C.', 'U.S.A.', 'America/New_York'],
    ['Wellington', 'New Zealand', 'Pacific/Auckland'], ['Yangon', 'Myanmar', 'Asia/Yangon'],
    ['Zagreb', 'Croatia', 'Europe/Zagreb'], ['Zürich', 'Switzerland', 'Europe/Zurich']
];
CK_CITIES.sort(function (a, b) { return a[0].localeCompare(b[0]); });

/* ---- time-zone maths ------------------------------------------- */
var zoneFmt = {};
function zoneParts(tz, d) {
    var f = zoneFmt[tz];
    if (f === undefined) {
        try {
            f = new Intl.DateTimeFormat('en-US', {
                timeZone: tz, hour12: false, year: 'numeric', month: '2-digit',
                day: '2-digit', hour: '2-digit', minute: '2-digit'
            });
        } catch (err) { f = null; }         /* unknown zone -> fall back to UTC */
        zoneFmt[tz] = f;
    }
    if (!f) {
        return {
            y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(),
            h: d.getUTCHours(), mi: d.getUTCMinutes()
        };
    }
    var parts = f.formatToParts(d), p = {};
    for (var i = 0; i < parts.length; i++) p[parts[i].type] = parts[i].value;
    return { y: +p.year, mo: +p.month, d: +p.day, h: (+p.hour) % 24, mi: +p.minute };
}
function partsMs(p) { return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi); }
function localParts(d) {
    return {
        y: d.getFullYear(), mo: d.getMonth() + 1, d: d.getDate(),
        h: d.getHours(), mi: d.getMinutes()
    };
}

function ampm(h24, m) {
    var ap = h24 >= 12 ? 'PM' : 'AM', h = h24 % 12;
    if (h === 0) h = 12;
    return { t: h + ':' + (m < 10 ? '0' : '') + m, ap: ap };
}

function offsetText(mins) {
    if (!mins) return '';
    var a = Math.abs(mins), h = Math.floor(a / 60), m = a % 60;
    var num = m ? (h + ':' + (m < 10 ? '0' : '') + m) : String(h);
    var unit = (!m && h === 1) ? 'hour' : 'hours';
    return num + ' ' + unit + (mins > 0 ? ' ahead' : ' behind');
}

/* ---- world clock ------------------------------------------------ */
function cityIndex(name) {
    for (var i = 0; i < CK_CITIES.length; i++) if (CK_CITIES[i][0] === name) return i;
    return -1;
}
var wcCities = ['Cupertino']
    .map(cityIndex).filter(function (i) { return i > -1; });
var wcEdit = false, wcListEl = $('wcList');

function renderWorld() {
    var now = new Date(), lp = localParts(now), lms = partsMs(lp);
    var today = Date.UTC(lp.y, lp.mo - 1, lp.d);
    wcListEl.innerHTML = wcCities.map(function (ci, row) {
        var c = CK_CITIES[ci], p = zoneParts(c[2], now);
        var mins = Math.round((partsMs(p) - lms) / 60000);
        var dayDiff = Math.round((Date.UTC(p.y, p.mo - 1, p.d) - today) / 86400000);
        var when = dayDiff < 0 ? 'Yesterday' : (dayDiff > 0 ? 'Tomorrow' : 'Today');
        var off = offsetText(mins), t = ampm(p.h, p.mi);
        return '<div class="wc-row" data-row="' + row + '">' +
            '<div class="ck-minus"></div>' +
            '<div class="wc-main"><div class="wc-name">' + esc(c[0]) + '</div>' +
            '<div class="wc-time">' + t.t + '<i>' + t.ap + '</i></div></div>' +
            '<div class="wc-sub"><b>' + when + (off ? ',' : '') + '</b>' +
            (off ? ' ' + off : '') + '</div>' +
            '<div class="ck-grip"><i></i><i></i><i></i></div></div>';
    }).join('');
}

wcListEl.addEventListener('click', function (e) {
    var row = e.target.closest('.wc-row'); if (!row) return;
    if (wcEdit && e.target.closest('.ck-minus')) {
        wcCities.splice(+row.dataset.row, 1);
        renderWorld();
    }
});

/* grip drag: shuffle the neighbours out of the way, commit on release */
var wcDrag = null;
wcListEl.addEventListener('pointerdown', function (e) {
    if (!wcEdit || !e.target.closest('.ck-grip')) return;
    var row = e.target.closest('.wc-row');
    var rows = [].slice.call(wcListEl.children);
    wcDrag = { rows: rows, from: rows.indexOf(row), to: rows.indexOf(row), y0: e.clientY, el: row };
    row.classList.add('drag');
    if (e.cancelable) e.preventDefault();
});
window.addEventListener('pointermove', function (e) {
    if (!wcDrag) return;
    var dy = (e.clientY - wcDrag.y0) / scaleNow();
    var to = Math.max(0, Math.min(wcDrag.rows.length - 1, wcDrag.from + Math.round(dy / 85)));
    wcDrag.to = to;
    wcDrag.el.style.transform = 'translateY(' + dy + 'px)';
    for (var i = 0; i < wcDrag.rows.length; i++) {
        if (i === wcDrag.from) continue;
        var sh = 0;
        if (wcDrag.from < to && i > wcDrag.from && i <= to) sh = -85;
        if (wcDrag.from > to && i >= to && i < wcDrag.from) sh = 85;
        wcDrag.rows[i].style.transform = sh ? 'translateY(' + sh + 'px)' : '';
    }
});
window.addEventListener('pointerup', function () {
    if (!wcDrag) return;
    var d = wcDrag; wcDrag = null;
    if (d.to !== d.from) {
        var moved = wcCities.splice(d.from, 1)[0];
        wcCities.splice(d.to, 0, moved);
    }
    renderWorld();
});

/* ---- choose a city ---------------------------------------------- */
var cyQuery = '', cySearching = false;
var cyListEl = $('cyList'), cyHead = $('cyHead');

function cyKey(c) {
    var ch = c[0].charAt(0).toUpperCase();
    ch = ch.normalize ? ch.normalize('NFD').charAt(0) : ch;
    return /[A-Z]/.test(ch) ? ch : '#';
}
function cyMatches() {
    var q = cyQuery.trim().toLowerCase();
    if (!q) return CK_CITIES;
    return CK_CITIES.filter(function (c) {
        return (c[0] + ', ' + c[1]).toLowerCase().indexOf(q) > -1;
    });
}
function renderCity() {
    var rows = cyMatches();
    if (!rows.length) { cyListEl.innerHTML = '<div class="cy-none">No Results</div>'; return; }
    var h = '', last = '';
    rows.forEach(function (c) {
        var k = cyKey(c);
        if (k !== last) { last = k; h += '<div class="cy-sec" data-k="' + k + '">' + k + '</div>'; }
        h += '<div class="cy-row" data-n="' + esc(c[0]) + '">' + esc(c[0] + ', ' + c[1]) + '</div>';
    });
    cyListEl.innerHTML = h;
}
function cySync() {
    var t = $('cyText');
    if (cyQuery) t.innerHTML = '<span class="q">' + esc(cyQuery) + '</span><span class="caret"></span>';
    else if (cySearching) t.innerHTML = '<span class="caret" style="height:17px"></span>';
    else t.innerHTML = '';
    kb6.retDim = !cyQuery; drawKeys(kb6);
    renderCity();
}
function cyFocus() {
    cySearching = true; cyHead.classList.add('searching');
    openKB(kb6); cySync();
}
function cyBlur() { closeKB(kb6); }
function cyCancelSearch() {
    cySearching = false; cyQuery = '';
    cyHead.classList.remove('searching');
    closeKB(kb6); cySync();
}
function cyOpen() {
    cyCancelSearch();
    cyListEl.scrollTop = 0;
    $('ck-city').classList.add('active');
}
function cyClose() { cyCancelSearch(); $('ck-city').classList.remove('active'); }

$('cyField').addEventListener('click', cyFocus);
$('cyCancel').addEventListener('click', cyClose);
cyListEl.addEventListener('click', function (e) {
    var r = e.target.closest('.cy-row'); if (!r) return;
    var i = cityIndex(r.dataset.n);
    if (i > -1) { wcCities.push(i); renderWorld(); }
    cyClose();
});

$('cyIndex').innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('')
    .map(function (k) { return '<span data-k="' + k + '">' + k + '</span>'; }).join('');
function cyJump(el) {
    var k = el && el.dataset && el.dataset.k; if (!k) return;
    var secs = cyListEl.querySelectorAll('.cy-sec'), best = null;
    for (var i = 0; i < secs.length; i++) {
        if (secs[i].dataset.k >= k) { best = secs[i]; break; }
        best = secs[i];
    }
    if (best) cyListEl.scrollTop = best.offsetTop;
}
(function () {
    var live = false, idx = $('cyIndex');
    function at(e) {
        return document.elementFromPoint(e.clientX, e.clientY);
    }
    idx.addEventListener('pointerdown', function (e) {
        live = true; idx.setPointerCapture(e.pointerId); cyJump(e.target);
        if (e.cancelable) e.preventDefault();
    });
    idx.addEventListener('pointermove', function (e) { if (live) cyJump(at(e)); });
    idx.addEventListener('pointerup', function () { live = false; });
})();

/* ---- alarms ------------------------------------------------------ */
var DAY3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var alarmSeq = 6;
var alarms = [
    { id: 1, min: 120, lbl: 'Alarm', on: true, rep: [], snd: 'Radar', sn: true },
];
var alEdit = false, alListEl = $('alList');

function repeatText(rep) {
    if (!rep.length) return 'Never';
    if (rep.length === 7) return 'Every day';
    var s = rep.slice().sort();
    if (s.join() === '1,2,3,4,5') return 'Weekdays';
    if (s.join() === '0,6') return 'Weekends';
    if (s.length === 1) return 'Every ' + DAYS[s[0]];
    return s.map(function (d) { return DAY3[d]; }).join(' ');
}
function renderAlarms() {
    var on = false;
    alarms.sort(function (a, b) { return a.min - b.min || a.id - b.id; });
    alListEl.innerHTML = alarms.map(function (a) {
        if (a.on) on = true;
        var t = ampm(Math.floor(a.min / 60), a.min % 60);
        return '<div class="al-row' + (a.on ? ' on' : '') + '" data-id="' + a.id + '">' +
            '<div class="ck-minus"></div>' +
            '<div class="al-main"><div class="al-time">' + t.t + '<i>' + t.ap + '</i></div></div>' +
            '<div class="al-lbl">' + esc(a.lbl) + '</div>' +
            '<span class="sw al-sw' + (a.on ? ' on' : '') + '"><i></i></span>' +
            '<span class="al-chev">' + CKCHEV + '</span></div>';
    }).join('') || '<div class="al-empty">No Alarms</div>';
    if (on !== ckAlarmOn) { ckAlarmOn = on; battSync(); }
}

alListEl.addEventListener('click', function (e) {
    var row = e.target.closest('.al-row'); if (!row) return;
    var id = +row.dataset.id;
    var a = alarms.filter(function (x) { return x.id === id; })[0];
    if (!a) return;
    if (alEdit) {
        if (e.target.closest('.ck-minus')) {
            alarms = alarms.filter(function (x) { return x.id !== id; });
            renderAlarms();
        } else openAlarmSheet(a);
        return;
    }
    if (e.target.closest('.al-sw')) { a.on = !a.on; renderAlarms(); }
});

/* ---- add / edit alarm sheet -------------------------------------- */
var aaDraft = { lbl: 'Alarm', rep: [], snd: 'Radar', sn: true }, aaId = null;
var aaHourW, aaMinW, aaApW;

function renderAA() {
    var h = '<div class="sect">' +
        '<div class="cell" data-r="repeat"><span class="grow">Repeat</span>' +
        '<span class="rval">' + esc(repeatText(aaDraft.rep)) + '</span>' + CKCHEV + '</div>' +
        '<div class="cell" data-r="label"><span class="grow">Label</span>' +
        '<span class="rval">' + esc(aaDraft.lbl || 'Alarm') + '</span>' + CKCHEV + '</div>' +
        '<div class="cell" data-r="sound"><span class="grow">Sound</span>' +
        '<span class="rval">' + esc(aaDraft.snd) + '</span>' + CKCHEV + '</div>' +
        '<div class="cell"><span class="grow">Snooze</span>' +
        '<span class="sw' + (aaDraft.sn ? ' on' : '') + '" data-r="snooze"><i></i></span></div></div>';
    if (aaId !== null) {
        h += '<div class="hdr">&nbsp;</div><div class="sect">' +
            '<div class="cell center" data-r="del">Delete Alarm</div></div>';
    }
    h += '<div style="height:24px"></div>';
    $('aaRest').innerHTML = h;
}

function openAlarmSheet(a) {
    aaId = a ? a.id : null;
    $('aaTitle').textContent = a ? 'Edit Alarm' : 'Add Alarm';
    var mins;
    if (a) {
        aaDraft = { lbl: a.lbl, rep: a.rep.slice(), snd: a.snd, sn: a.sn };
        mins = a.min;
    } else {
        var d = new Date();
        aaDraft = { lbl: 'Alarm', rep: [], snd: 'Radar', sn: true };
        mins = d.getHours() * 60 + d.getMinutes();
    }
    var h24 = Math.floor(mins / 60), m = mins % 60, h12 = h24 % 12;
    wheelSet(aaHourW, h12 === 0 ? 11 : h12 - 1);
    wheelSet(aaMinW, m);
    wheelSet(aaApW, h24 >= 12 ? 1 : 0);
    renderAA();
    $('aaRest').scrollTop = 0;
    $('ck-alarm').classList.add('active');
}
function aaMinutes() {
    var h = aaHourW.i + 1;                 /* wheel shows 1..12 */
    if (h === 12) h = 0;
    return (h + (aaApW.i ? 12 : 0)) * 60 + aaMinW.i;
}
function closeAlarmSheet() {
    $('ck-alarm').classList.remove('active');
    $('ck-alarm').classList.remove('behind');
}
$('aaCancel').addEventListener('click', closeAlarmSheet);
$('aaSave').addEventListener('click', function () {
    var min = aaMinutes();
    if (aaId === null) {
        alarms.push({
            id: alarmSeq++, min: min, lbl: aaDraft.lbl || 'Alarm', on: true,
            rep: aaDraft.rep.slice(), snd: aaDraft.snd, sn: aaDraft.sn
        });
    } else {
        alarms.forEach(function (a) {
            if (a.id !== aaId) return;
            a.min = min; a.lbl = aaDraft.lbl || 'Alarm'; a.rep = aaDraft.rep.slice();
            a.snd = aaDraft.snd; a.sn = aaDraft.sn; a.on = true;
        });
    }
    renderAlarms();
    closeAlarmSheet();
});
$('aaRest').addEventListener('click', function (e) {
    var t = e.target.closest('[data-r]'); if (!t) return;
    switch (t.dataset.r) {
        case 'snooze': aaDraft.sn = !aaDraft.sn; renderAA(); break;
        case 'repeat': renderRepeat(); push($('ck-alarm'), $('ck-repeat')); break;
        case 'label': push($('ck-alarm'), $('ck-label')); openKB(kb5); lbSync(); break;
        case 'sound': openTone('alarm'); break;
        case 'del':
            alarms = alarms.filter(function (a) { return a.id !== aaId; });
            renderAlarms(); closeAlarmSheet();
            break;
    }
});

/* ---- repeat ------------------------------------------------------ */
function renderRepeat() {
    var h = '<div style="height:36px"></div><div class="sect">';
    for (var d = 0; d < 7; d++) {
        h += '<div class="cell" data-d="' + d + '"><span class="plain">Every ' + DAYS[d] + '</span>' +
            (aaDraft.rep.indexOf(d) > -1 ? TICKI : '') + '</div>';
    }
    $('rpBody').innerHTML = h + '</div>';
}
$('rpBody').addEventListener('click', function (e) {
    var c = e.target.closest('[data-d]'); if (!c) return;
    var d = +c.dataset.d, at = aaDraft.rep.indexOf(d);
    if (at > -1) aaDraft.rep.splice(at, 1); else aaDraft.rep.push(d);
    renderRepeat();
});
$('rpBack').addEventListener('click', function () {
    renderAA(); pop($('ck-repeat'), $('ck-alarm'));
});

/* ---- label ------------------------------------------------------- */
function lbSync() {
    var kbUp = kb5.el.classList.contains('up');
    $('lbVal').innerHTML = esc(aaDraft.lbl) + (kbUp ? '<span class="caret"></span>' : '');
    $('lbClear').style.visibility = aaDraft.lbl ? 'visible' : 'hidden';
}
function lbDone() { closeKB(kb5); lbSync(); }
$('lbCell').addEventListener('click', function (e) {
    if (e.target.closest('#lbClear')) { aaDraft.lbl = ''; lbSync(); autoShift(kb5); updatePred(kb5); return; }
    openKB(kb5); lbSync();
});
$('lbBack').addEventListener('click', function () {
    closeKB(kb5);
    if (!aaDraft.lbl.trim()) aaDraft.lbl = 'Alarm';
    renderAA(); pop($('ck-label'), $('ck-alarm'));
});

/* ---- tones ------------------------------------------------------- */
var TONES = ['Radar (Default)', 'Apex', 'Beacon', 'Bulletin', 'By The Seaside', 'Chimes', 'Circuit',
    'Constellation', 'Cosmic', 'Crystals', 'Hillside', 'Illuminate', 'Night Owl', 'Opening',
    'Playtime', 'Presto', 'Radiate', 'Reflection', 'Ripples', 'Sencha', 'Signal', 'Silk',
    'Slow Rise', 'Stargaze', 'Summit', 'Twinkle', 'Uplift', 'Waves'];
var CLASSIC = ['Alarm', 'Ascending', 'Bark', 'Bell Tower', 'Blues', 'Boing', 'Crickets', 'Digital',
    'Doorbell', 'Duck', 'Harp', 'Marimba', 'Motorcycle', 'Old Car Horn', 'Old Phone', 'Piano Riff',
    'Pinball', 'Robot', 'Sci-Fi', 'Sonar', 'Strum', 'Timba', 'Time Passing', 'Trill', 'Xylophone'];
function toneName(t) { return t.replace(' (Default)', ''); }

var toneMode = 'alarm', toneDraft = 'Radar';

function renderToneNav() {
    $('toneNav').innerHTML = toneMode === 'timer'
        ? '<div class="btn" id="tnCancel">Cancel</div><div class="title">When Timer Ends</div>' +
        '<div class="btn right" id="tnSet">Set</div>'
        : CKBACK('Back') + '<div class="title">Sound</div>';
}
function renderToneBody() {
    var h = '<div style="height:36px"></div>' +
        '<div class="sect"><div class="cell tone"><span class="plain">Buy More Tones</span></div></div>' +
        '<div class="hdr">RINGTONES</div><div class="sect">';
    h += TONES.map(function (t) {
        var n = toneName(t);
        return '<div class="cell tone' + (toneDraft === n ? ' sel' : '') + '" data-t="' + esc(n) + '">' +
            TICK + '<span class="plain">' + esc(t) + '</span></div>';
    }).join('');
    h += '<div class="cell tone" data-classic="1"><span class="plain">Classic</span>' +
        (CLASSIC.indexOf(toneDraft) > -1 ? TICKI : '') + CKCHEV + '</div></div>';
    var last = toneMode === 'timer' ? 'Stop Playing' : 'None';
    h += '<div class="hdr">&nbsp;</div><div class="sect"><div class="cell tone' +
        (toneDraft === last ? ' sel' : '') + '" data-t="' + last + '">' + TICK +
        '<span class="plain">' + last + '</span></div></div><div style="height:24px"></div>';
    var body = $('toneBody');
    body.innerHTML = h;
    var sel = body.querySelector('.cell.tone.sel');
    if (sel) {
        body.scrollTop = Math.max(0, body.scrollTop +
            sel.getBoundingClientRect().top - body.getBoundingClientRect().top - 190);
    }
}
function openTone(mode) {
    toneMode = mode;
    toneDraft = mode === 'timer' ? tmr.tone : aaDraft.snd;
    renderToneNav(); renderToneBody();
    var p = $('ck-tone');
    /* the timer presents this sheet, the alarm pushes it -- flip the
       off-screen resting transform without animating the swap */
    var wantModal = (mode === 'timer');
    if (p.classList.contains('modal') !== wantModal) {
        p.style.transition = 'none';
        p.classList.toggle('modal', wantModal);
        p.offsetHeight;
        p.style.transition = '';
    }
    if (wantModal) p.classList.add('active');
    else push($('ck-alarm'), p);
}
function closeTone(commit) {
    var p = $('ck-tone');
    if (toneMode === 'timer') {
        if (commit) { tmr.tone = toneDraft; $('tmTone').textContent = toneDraft; }
        p.classList.remove('active');
    } else {
        aaDraft.snd = toneDraft; renderAA();
        pop(p, $('ck-alarm'));
    }
}
$('toneNav').addEventListener('click', function (e) {
    if (e.target.closest('#tnCancel')) return closeTone(false);
    if (e.target.closest('#tnSet')) return closeTone(true);
    if (e.target.closest('.back')) return closeTone(true);
});
$('toneBody').addEventListener('click', function (e) {
    var c = e.target.closest('.cell'); if (!c) return;
    if (c.dataset.classic) { renderClassic(); push($('ck-tone'), $('ck-classic')); return; }
    if (!c.dataset.t) return;
    toneDraft = c.dataset.t;
    renderToneBody();
    if (toneMode === 'alarm') { aaDraft.snd = toneDraft; }
});

function renderClassic() {
    $('clsNav').innerHTML = CKBACK(toneMode === 'timer' ? 'When Timer Ends' : 'Sound') +
        '<div class="title inline">Classic</div>';
    $('clsBody').innerHTML = '<div style="height:36px"></div><div class="sect">' +
        CLASSIC.map(function (t) {
            return '<div class="cell tone' + (toneDraft === t ? ' sel' : '') + '" data-t="' + esc(t) + '">' +
                TICK + '<span class="plain">' + esc(t) + '</span></div>';
        }).join('') + '</div><div style="height:24px"></div>';
}
$('clsNav').addEventListener('click', function (e) {
    if (!e.target.closest('.back')) return;
    renderToneBody(); pop($('ck-classic'), $('ck-tone'));
});
$('clsBody').addEventListener('click', function (e) {
    var c = e.target.closest('.cell[data-t]'); if (!c) return;
    toneDraft = c.dataset.t;
    if (toneMode === 'alarm') aaDraft.snd = toneDraft;
    renderClassic();
});

/* ---- wheel picker ------------------------------------------------ */
/* 215 pt tall, 35 pt rows: 90 pt of padding keeps row i at scrollTop
   35*i, so the index is just a division. */
var PK_ROW = 35, PK_HALF = 107.5;

/* A looping column is just the item list stamped out enough times to
   swallow any fling; once the scroll settles we snap it back to the
   middle copy, which is invisible because the value is identical. */
function makeWheel(el, items, loop) {
    var n = items.length;
    var reps = loop ? Math.max(5, Math.ceil(360 / n)) : 1;
    var st = {
        el: el, n: n, reps: reps, loop: !!loop, home: loop ? ((reps / 2) | 0) * n : 0,
        i: 0, cb: null, t: null, lo: 0, hi: -1
    };
    var one = items.map(function (v) { return '<div class="pk-i">' + esc(v) + '</div>'; }).join('');
    var all = '';
    for (var r = 0; r < reps; r++) all += one;
    el.innerHTML = '<div class="pk-pad"></div>' + all + '<div class="pk-pad"></div>';
    st.rows = el.querySelectorAll('.pk-i');
    el.addEventListener('scroll', function () {
        wheelPaint(st);
        clearTimeout(st.t);
        st.t = setTimeout(function () { wheelSettle(st); }, 110);
    });
    el.addEventListener('click', function (e) {
        var r = e.target.closest('.pk-i');
        if (r) {
            var raw = [].indexOf.call(st.rows, r);
            wheelScroll(st, raw, true);
            wheelValue(st, raw % st.n);
        }
    });
    wheelSet(st, 0);
    return st;
}
function wheelValue(st, i) {
    if (i === st.i) return;
    st.i = i;
    if (st.cb) st.cb(i);
}
function wheelSettle(st) {
    var raw = Math.max(0, Math.min(st.rows.length - 1, Math.round(st.el.scrollTop / PK_ROW)));
    var i = raw % st.n;
    if (st.loop && (raw < st.n || raw >= (st.reps - 1) * st.n)) {
        st.el.scrollTop = (st.home + i) * PK_ROW;      /* re-centre silently */
        wheelPaint(st);
    }
    wheelValue(st, i);
}
function wheelPaint(st) {
    var c = st.el.scrollTop + PK_HALF;
    var mid = Math.round(st.el.scrollTop / PK_ROW);
    var lo = Math.max(0, mid - 5), hi = Math.min(st.rows.length - 1, mid + 5);
    for (var j = st.lo; j <= st.hi; j++) {
        if (j < lo || j > hi) st.rows[j].style.opacity = '0';
    }
    for (var i = lo; i <= hi; i++) {
        var d = (90 + i * PK_ROW + PK_ROW / 2 - c) / PK_HALF, a = Math.abs(d), r = st.rows[i];
        if (a > 1.3) { r.style.opacity = '0'; continue; }
        r.style.opacity = Math.max(0, 1 - a * 0.66).toFixed(3);
        r.style.transform = 'scale(' + (1 - a * 0.07).toFixed(3) + ',' + (1 - a * 0.46).toFixed(3) + ')';
    }
    st.lo = lo; st.hi = hi;
}
function wheelScroll(st, raw, smooth) {
    if (smooth && st.el.scrollTo) st.el.scrollTo({ top: raw * PK_ROW, behavior: 'smooth' });
    else st.el.scrollTop = raw * PK_ROW;
    wheelPaint(st);
}
function wheelSet(st, i) {
    i = Math.max(0, Math.min(st.n - 1, i));
    st.i = i;
    wheelScroll(st, st.home + i, false);
}
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function seq(a, b, f) {
    var out = [];
    for (var i = a; i <= b; i++) out.push(f ? f(i) : String(i));
    return out;
}

/* hours and minutes wrap the way iOS's date wheels do; AM/PM does not */
aaHourW = makeWheel($('aaHour'), seq(1, 12), true);
aaMinW = makeWheel($('aaMin'), seq(0, 59, pad2), true);
aaApW = makeWheel($('aaAp'), ['AM', 'PM']);

/* ---- stopwatch --------------------------------------------------- */
var sw = { run: false, base: 0, t0: 0, laps: [], lapBase: 0 };
var swBig = $('swBig'), swLapEl = $('swLap'), swLapsEl = $('swLaps');
var swLapBtn = $('swLapBtn'), swGoBtn = $('swGoBtn');

function swMs() { return sw.run ? sw.base + (performance.now() - sw.t0) : sw.base; }
function fmtSW(ms) {
    var t = Math.max(0, ms);
    var cs = Math.floor(t / 10) % 100, s = Math.floor(t / 1000) % 60;
    var m = Math.floor(t / 60000) % 60, h = Math.floor(t / 3600000);
    return (h ? h + ':' : '') + pad2(m) + ':' + pad2(s) + '.' + pad2(cs);
}
function swPaint() {
    var t = swMs();
    swBig.textContent = fmtSW(t);
    swLapEl.textContent = fmtSW(t - sw.lapBase);
}
function swButtons() {
    swGoBtn.textContent = sw.run ? 'Stop' : 'Start';
    swGoBtn.className = 'ck-btn right ' + (sw.run ? 'red' : 'green');
    /* iOS: Lap while it runs, Reset once it is stopped with time on the
       face, and a dead "Lap" when it has never been started */
    swLapBtn.textContent = (!sw.run && sw.base) ? 'Reset' : 'Lap';
    swLapBtn.className = 'ck-btn left' + (sw.run || sw.base ? '' : ' off');
}
function swLoop() {
    if (!sw.run) return;
    swPaint();
    requestAnimationFrame(swLoop);
}
function renderLaps() {
    var n = Math.max(6, sw.laps.length), h = '';
    for (var i = 0; i < n; i++) {
        var k = sw.laps.length - 1 - i;
        h += '<div class="sw-lrow">' + (k >= 0
            ? '<div class="sw-lname">Lap ' + (k + 1) + '</div><div class="sw-ltime">' +
            fmtSW(sw.laps[k]) + '</div>'
            : '') + '</div>';
    }
    swLapsEl.innerHTML = h;
}
swGoBtn.addEventListener('click', function () {
    if (sw.run) { sw.base = swMs(); sw.run = false; }
    else { sw.t0 = performance.now(); sw.run = true; requestAnimationFrame(swLoop); }
    swButtons(); swPaint();
});
swLapBtn.addEventListener('click', function () {
    if (sw.run) {
        var t = swMs();
        sw.laps.push(t - sw.lapBase);
        sw.lapBase = t;
    } else {
        sw.base = 0; sw.lapBase = 0; sw.laps = [];
    }
    renderLaps(); swButtons(); swPaint();
});

/* ---- timer -------------------------------------------------------- */
var tmr = { h: 0, m: 1, state: 'idle', endAt: 0, left: 0, tone: 'Radar' };
var tmHoursW, tmMinsW;
var tmBig = $('tmBig'), tmRun = $('tmRun');
var tmPauseBtn = $('tmPauseBtn'), tmGoBtn = $('tmGoBtn');

function fmtTimer(ms) {
    var t = Math.max(0, Math.ceil(ms / 1000));
    var s = t % 60, m = Math.floor(t / 60) % 60, h = Math.floor(t / 3600);
    return h ? (h + ':' + pad2(m) + ':' + pad2(s)) : (pad2(m) + ':' + pad2(s));
}
function tmLeft() {
    return tmr.state === 'run' ? Math.max(0, tmr.endAt - Date.now()) : tmr.left;
}
function tmPaint() {
    var idle = tmr.state === 'idle';
    tmRun.classList.toggle('on', !idle);
    if (!idle) tmBig.textContent = fmtTimer(tmLeft());
    tmGoBtn.textContent = idle ? 'Start' : 'Cancel';
    tmGoBtn.className = 'ck-btn right ' + (idle ? 'green' : 'red') +
        (idle && !tmr.h && !tmr.m ? ' off' : '');
    tmPauseBtn.textContent = tmr.state === 'pause' ? 'Resume' : 'Pause';
    tmPauseBtn.className = 'ck-btn left' + (idle ? ' off' : '');
}
function tmStart() {
    var ms = (tmr.h * 3600 + tmr.m * 60) * 1000;
    if (!ms) return;
    tmr.state = 'run'; tmr.endAt = Date.now() + ms; tmr.left = ms;
    tmPaint();
}
function tmCancel() { tmr.state = 'idle'; tmr.left = 0; tmPaint(); }
tmGoBtn.addEventListener('click', function () {
    if (tmr.state === 'idle') tmStart(); else tmCancel();
});
tmPauseBtn.addEventListener('click', function () {
    if (tmr.state === 'run') { tmr.left = tmLeft(); tmr.state = 'pause'; }
    else if (tmr.state === 'pause') { tmr.endAt = Date.now() + tmr.left; tmr.state = 'run'; }
    tmPaint();
});
$('tmWhen').addEventListener('click', function () { openTone('timer'); });

/* the countdown picker loops its minutes but stops dead at 0 hours */
tmHoursW = makeWheel($('tmHours'), seq(0, 23));
tmMinsW = makeWheel($('tmMins'), seq(0, 59), true);
tmHoursW.cb = function (i) { tmr.h = i; tmPaint(); };
tmMinsW.cb = function (i) { tmr.m = i; tmPaint(); };

setInterval(function () {
    if (tmr.state !== 'run') return;
    tmBig.textContent = fmtTimer(tmLeft());
    if (tmLeft() <= 0) {
        tmCancel();
        ckAlert('Timer Done', '', [{ n: 'OK', bold: true }]);
    }
}, 120);

/* ---- alerts -------------------------------------------------------- */
var ckAlertCb = null;
function ckAlert(title, msg, btns) {
    $('ckATitle').textContent = title;
    $('ckAMsg').textContent = msg || '';
    $('ckAMsg').style.display = msg ? '' : 'none';
    $('ckABtns').innerHTML = btns.map(function (b, i) {
        return '<div class="ck-abtn' + (b.bold ? ' bold' : '') + '" data-i="' + i + '">' + esc(b.n) + '</div>';
    }).join('');
    ckAlertCb = btns;
    $('ckAlert').classList.add('up');
}
$('ckABtns').addEventListener('click', function (e) {
    var b = e.target.closest('.ck-abtn'); if (!b || !ckAlertCb) return;
    var spec = ckAlertCb[+b.dataset.i];
    $('ckAlert').classList.remove('up');
    ckAlertCb = null;
    if (spec && spec.fn) spec.fn();
});

/* ---- alarms going off ---------------------------------------------- */
/* one shot per alarm per minute; repeats stay armed, one-offs switch
   themselves off the way iOS does */
var alFired = {}, alSnooze = {};
function ckCheckAlarms() {
    var d = new Date(), nowMin = d.getHours() * 60 + d.getMinutes();
    var stamp = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + '-' + nowMin;
    var now = Date.now();

    Object.keys(alSnooze).forEach(function (id) {
        if (alSnooze[id] > now) return;
        delete alSnooze[id];
        var a = alarms.filter(function (x) { return x.id === +id; })[0];
        if (a) ringAlarm(a);
    });

    alarms.forEach(function (a) {
        if (!a.on || a.min !== nowMin) return;
        if (a.rep.length && a.rep.indexOf(d.getDay()) < 0) return;
        var key = a.id + '@' + stamp;
        if (alFired[key]) return;
        alFired[key] = 1;
        if (!a.rep.length) { a.on = false; renderAlarms(); }
        ringAlarm(a);
    });
}
function ringAlarm(a) {
    var t = ampm(Math.floor(a.min / 60), a.min % 60);
    var btns = [];
    if (a.sn) btns.push({
        n: 'Snooze', fn: function () { alSnooze[a.id] = Date.now() + 9 * 60000; }
    });
    btns.push({ n: 'OK', bold: true });
    ckAlert(a.lbl || 'Alarm', t.t + ' ' + t.ap, btns);
}

/* ---- tabs + nav ------------------------------------------------------ */
var ckTab = 'world';
function paintTabs() {
    $('ckTabs').innerHTML = CK_TABS.map(function (t) {
        var on = t.k === ckTab;
        return '<div class="ck-tab' + (on ? ' on' : '') + '" data-k="' + t.k + '">' +
            TAB_ICONS[t.k](on) + '<span>' + t.n + '</span></div>';
    }).join('');
}
function setTab(k) {
    ckTab = k;
    if (k !== 'world' && wcEdit) setWcEdit(false);
    if (k !== 'alarm' && alEdit) setAlEdit(false);
    CK_TABS.forEach(function (t) { $(t.pane).classList.toggle('on', t.k === k); });
    paintTabs();
    var t = CK_TABS.filter(function (x) { return x.k === k; })[0];
    $('ckTitle').textContent = t.n;
    var listy = (k === 'world' || k === 'alarm');
    $('ckEdit').style.visibility = listy ? 'visible' : 'hidden';
    $('ckAdd').style.visibility = listy ? 'visible' : 'hidden';
    if (k === 'world') renderWorld();
    /* the panes are display:none when hidden, so the wheels can only be
       scrolled into place once the timer is actually on screen */
    if (k === 'timer') { wheelSet(tmHoursW, tmr.h); wheelSet(tmMinsW, tmr.m); tmPaint(); }
    if (k === 'sw') { swPaint(); swButtons(); }
}
$('ckTabs').addEventListener('click', function (e) {
    var t = e.target.closest('.ck-tab'); if (t) setTab(t.dataset.k);
});

function setWcEdit(on) {
    wcEdit = on;
    wcListEl.classList.toggle('editing', on);
    $('ckEdit').textContent = on ? 'Done' : 'Edit';
}
function setAlEdit(on) {
    alEdit = on;
    alListEl.classList.toggle('editing', on);
    $('ckEdit').textContent = on ? 'Done' : 'Edit';
}
$('ckEdit').addEventListener('click', function () {
    if (ckTab === 'world') setWcEdit(!wcEdit);
    else if (ckTab === 'alarm') setAlEdit(!alEdit);
});
$('ckAdd').addEventListener('click', function () {
    if (ckTab === 'world') cyOpen();
    else if (ckTab === 'alarm') openAlarmSheet(null);
});

/* pressing Home leaves the app on its tab but drops every sheet */
function ckReset() {
    closeKB(kb5); closeKB(kb6);
    cyCancelSearch();
    ['ck-city', 'ck-alarm', 'ck-repeat', 'ck-label', 'ck-tone', 'ck-classic'].forEach(function (id) {
        $(id).classList.remove('active', 'behind');
    });
    setWcEdit(false); setAlEdit(false);
}

function ckTick() {
    if (ckTab === 'world') renderWorld();
    ckCheckAlarms();
}

renderWorld(); renderAlarms(); renderCity(); renderLaps();
swPaint(); swButtons(); tmPaint(); setTab('world');
ckReady = true;
