"use strict";
/* ------------------------------------------------------------------ */
/* WEATHER                                                            */
/* ------------------------------------------------------------------ */
/* Traced off ref_pic/Weather/. There is no forecast service behind
   this, so the numbers are generated: a seeded PRNG gives each city a
   stable day-by-day climate, and a real sunrise/sunset calculation
   drives the diurnal temperature curve, the day/night icons and the
   UV index. Feeding Kearney's latitude and longitude through it on
   the day of IMG_2510 reproduces that screenshot's 6:50 AM / 8:29 PM
   to the minute, which is the only part of this that can be checked. */

var WX_STICK = 78, WX_HERO = 228, WX_TODAYH = 28, WX_STRIP = 94;
var WX_TOP = WX_HERO + WX_TODAYH;              /* 256: strip's resting offset */
var WX_DAYS = 9, WX_DAYH = 28;
var WX_CONTENT = WX_TOP + WX_STRIP + WX_DAYS * WX_DAYH + 56 + 228;   /* 886 */
var WX_WINDOW = 568 - 20 - 37;                 /* 511 of visible scroller */
var WX_MAXS = WX_CONTENT - WX_WINDOW;          /* 375 of travel */
var WX_HEADRISE = 25;                          /* how far the title climbs */

/* name, time zone, latitude, longitude, mean temp, daily swing, wetness */
var WX_CITIES = [
    { n: 'Cupertino', tz: 'America/Los_Angeles', lat: 37.323, lon: -122.032, base: 66, amp: 20, wet: .12 }
];

var WX_UNIT = 'F';
var wxPage = 0, wxTimer = null;

/* ---- a small stable PRNG, so a city's forecast does not reshuffle
        every time the view is repainted ---------------------------- */
function wxHash(s) {
    var h = 2166136261, i;
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}
function wxRng(seed) {
    var a = seed >>> 0;
    return function () {
        a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ---- sun geometry ------------------------------------------------
   Declination + the equation of time, with the standard -0.833 deg
   refracted horizon. Everything is returned in the city's own clock
   hours, so the timezone offset (DST included) folds straight in. */
function wxSolar(city, p, offH) {
    var doy = Math.round((Date.UTC(p.y, p.mo - 1, p.d) - Date.UTC(p.y, 0, 1)) / 86400000) + 1;
    var decl = 0.409105 * Math.sin(2 * Math.PI * (doy - 81) / 365);
    var B = 2 * Math.PI * (doy - 81) / 364;
    var eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);   /* minutes */
    var latR = city.lat * Math.PI / 180;
    var noon = 12 - city.lon / 15 + offH - eot / 60;
    var cosH = (Math.sin(-0.01454) - Math.sin(latR) * Math.sin(decl)) /
        (Math.cos(latR) * Math.cos(decl));
    var H;
    if (cosH <= -1) H = 12;                    /* midnight sun */
    else if (cosH >= 1) H = 0;                 /* polar night */
    else H = Math.acos(cosH) * 180 / Math.PI / 15;
    return { rise: noon - H, set: noon + H, noon: noon, decl: decl, latR: latR };
}

/* how high the sun is, 0..1, at a given clock hour -- feeds the UV index */
function wxElev(sun, h) {
    var ha = (h - sun.noon) * 15 * Math.PI / 180;
    return Math.sin(sun.latR) * Math.sin(sun.decl) +
        Math.cos(sun.latR) * Math.cos(sun.decl) * Math.cos(ha);
}

/* ---- conditions --------------------------------------------------- */
var WX_LABEL = {
    sunny: 'Sunny', clear: 'Clear', partly: 'Partly Cloudy', partlyn: 'Partly Cloudy',
    cloudy: 'Cloudy', fog: 'Foggy', rain: 'Rain', tstorm: 'Thunderstorms'
};
/* the scene behind the city -- day and night read very differently */
function wxScene(cond, night) {
    if (night) return 'sc-night';
    if (cond === 'rain' || cond === 'tstorm') return 'sc-rain';
    if (cond === 'cloudy' || cond === 'fog') return 'sc-cloudy';
    if (cond === 'partly') return 'sc-partly';
    return (cond === 'sunny') ? 'sc-sun' : 'sc-clear';
}
/* the daytime condition seen after dark becomes its night twin */
function wxNightly(cond) {
    if (cond === 'sunny') return 'clear';
    if (cond === 'partly') return 'partlyn';
    return cond;
}

/* ---- icons -------------------------------------------------------
   Drawn to a 32 x 32 box so one string works at any size. */
function wxSun(cx, cy, r, rays) {
    var h = '', i;
    if (rays) {
        for (i = 0; i < 8; i++) {
            var a = i * Math.PI / 4, r1 = r * 1.42, r2 = r * 2.02;
            h += '<path d="M' + (cx + Math.cos(a) * r1).toFixed(1) + ' ' + (cy + Math.sin(a) * r1).toFixed(1) +
                'L' + (cx + Math.cos(a) * r2).toFixed(1) + ' ' + (cy + Math.sin(a) * r2).toFixed(1) +
                '" stroke="#FFCE1F" stroke-width="2.6" stroke-linecap="round"/>';
        }
    }
    return h + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#FFCE1F"/>';
}
var WX_MOON = '<path d="M24.4 20.4A9.5 9.5 0 1 1 12.1 8.1A9.5 9.5 0 0 0 24.4 20.4Z" fill="#EDF1F5"/>';
/* half a sun on the horizon, for the sunrise / sunset columns */
function wxHalfSun() {
    var h = '', i, cx = 16, cy = 24.6;
    for (i = 0; i <= 4; i++) {
        var a = Math.PI + i * Math.PI / 4;
        h += '<path d="M' + (cx + Math.cos(a) * 8.6).toFixed(1) + ' ' + (cy + Math.sin(a) * 8.6).toFixed(1) +
            'L' + (cx + Math.cos(a) * 11.6).toFixed(1) + ' ' + (cy + Math.sin(a) * 11.6).toFixed(1) +
            '" stroke="#FFCE1F" stroke-width="2.4" stroke-linecap="round"/>';
    }
    return h + '<path d="M9.6 24.6a6.4 6.4 0 0 1 12.8 0z" fill="#FFCE1F"/>' +
        '<path d="M3.5 26h25" stroke="#FFCE1F" stroke-width="2.2" stroke-linecap="round"/>';
}
function wxCloud(dx, dy, s, tone) {
    var f = tone || '#F1F4F7';
    return '<g fill="' + f + '" transform="translate(' + dx + ' ' + dy + ') scale(' + s + ')">' +
        '<circle cx="12" cy="18" r="6"/><circle cx="20.3" cy="16.6" r="7.2"/>' +
        '<circle cx="25.4" cy="21.4" r="4.6"/><rect x="8.4" y="19" width="17.6" height="6.9" rx="3.45"/></g>';
}
function wxSvg(inner, size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 32 32" aria-hidden="true">' + inner + '</svg>';
}
function wxIcon(cond, size) {
    var i;
    switch (cond) {
        case 'sunny': i = wxSun(16, 16, 6.1, true); break;
        case 'clear': i = WX_MOON; break;
        case 'partly': i = wxSun(11.5, 11, 5.4, true) + wxCloud(3, 5, .84); break;
        case 'partlyn': i = '<g transform="translate(-2 -3) scale(.82)">' + WX_MOON + '</g>' + wxCloud(3, 5, .84); break;
        case 'cloudy': i = wxCloud(0, 1, 1, '#E9EDF1'); break;
        case 'fog': i = wxCloud(0, -3, .94, '#E9EDF1') +
            '<path d="M8 24.5h16M9.5 27.6h13" stroke="#DCE2E8" stroke-width="1.7" stroke-linecap="round"/>'; break;
        case 'rain': i = wxCloud(0, -3, .94) +
            '<path d="M11 25l-1.6 4M16 25l-1.6 4M21 25l-1.6 4" stroke="#67BFEA" stroke-width="1.9" stroke-linecap="round"/>'; break;
        case 'tstorm': i = wxCloud(0, -3, .94) +
            '<path d="M17.4 23.4l-5 5.4h3.4l-1.2 3.6 5.2-5.6h-3.4z" fill="#FFCE1F"/>'; break;
        case 'sunset': i = wxHalfSun() +
            '<path d="M16 4.5v10M11.6 10.6 16 15l4.4-4.4" stroke="#fff" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; break;
        case 'sunrise': i = wxHalfSun() +
            '<path d="M16 15V5M11.6 9.4 16 5l4.4 4.4" stroke="#fff" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; break;
        default: i = wxCloud(0, 1, 1);
    }
    return wxSvg(i, size);
}

/* ---- the forecast ------------------------------------------------- */
function wxOffH(city, d) {
    return Math.round((partsMs(zoneParts(city.tz, d)) - d.getTime()) / 60000) / 60;
}

/* one day of weather for a city, keyed by its own local date */
var wxDayCache = {};
function wxDay(city, y, mo, dd) {
    var key = city.n + '|' + y + '-' + mo + '-' + dd;
    if (wxDayCache[key]) return wxDayCache[key];
    var r = wxRng(wxHash(key));
    var swing = (r() - .5) * 12;
    var hi = Math.round(city.base + city.amp * .48 + swing);
    var lo = Math.round(hi - city.amp * (.72 + r() * .5));
    var w = r();
    var cond;
    var wet = city.wet * .75;
    if (w < wet * .33) cond = 'tstorm';
    else if (w < wet) cond = 'rain';
    else if (w < wet + .12) cond = 'cloudy';
    else if (w < wet + .16) cond = 'fog';
    else if (w < wet + .55) cond = 'partly';
    else cond = 'sunny';
    var pop = cond === 'tstorm' ? 60 + Math.round(r() * 35)
        : cond === 'rain' ? 45 + Math.round(r() * 35)
            : cond === 'cloudy' ? 10 + Math.round(r() * 25)
                : Math.round(r() * 20);
    var o = {
        hi: hi, lo: lo, cond: cond, pop: Math.round(pop / 5) * 5,
        hum: Math.round(40 + r() * 45 + (cond === 'rain' || cond === 'tstorm' ? 15 : 0)),
        windDir: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(r() * 8)],
        windMph: 3 + Math.round(r() * 16),
        precip: cond === 'rain' || cond === 'tstorm' ? Math.round(r() * 90) / 100 : Math.round(r() * 30) / 100,
        pres: (29.55 + r() * .72).toFixed(2),
        vis: cond === 'fog' ? (0.5 + Math.round(r() * 30) / 10).toFixed(1)
            : cond === 'rain' || cond === 'tstorm' ? (4 + Math.round(r() * 50) / 10).toFixed(1) : '10.0'
    };
    if (o.hum > 99) o.hum = 99;
    wxDayCache[key] = o;
    return o;
}

/* the diurnal curve, as a fraction of the day's range. The nodes are
   pinned to sunrise and sunset rather than to the clock, so a long
   summer day warms and cools at the right times of its own. */
function wxWarmth(h, rise, set) {
    var peak = set - 4;
    var n = [[rise - 1, .03], [rise, 0], [rise + 2, .28], [rise + 4, .58], [rise + 6, .82],
    [peak, 1], [set - 1, .88], [set + .5, .62], [set + 2, .42], [set + 4, .33], [rise + 24, 0]];
    var i;
    if (h < n[0][0]) h += 24;
    for (i = 0; i < n.length - 1; i++) {
        if (h >= n[i][0] && h <= n[i + 1][0]) {
            var span = n[i + 1][0] - n[i][0];
            var t = span <= 0 ? 0 : (h - n[i][0]) / span;
            return n[i][1] + (n[i + 1][1] - n[i][1]) * t;
        }
    }
    return n[n.length - 1][1];
}
function wxTempAt(day, sun, h) {
    return day.lo + (day.hi - day.lo) * wxWarmth(h, sun.rise, sun.set);
}

/* everything one city page needs, computed fresh off the wall clock */
function wxState(city) {
    var now = new Date();
    var p = zoneParts(city.tz, now);
    var offH = wxOffH(city, now);
    var sun = wxSolar(city, p, offH);
    var h = p.h + p.mi / 60;
    var today = wxDay(city, p.y, p.mo, p.d);
    var night = h < sun.rise || h > sun.set;
    var temp = Math.round(wxTempAt(today, sun, h));
    return {
        city: city, p: p, offH: offH, sun: sun, hour: h, day: today,
        night: night, temp: temp,
        cond: night ? wxNightly(today.cond) : today.cond,
        scene: wxScene(today.cond, night)
    };
}

/* the nine days after today, walking the city's own calendar */
function wxForecast(st) {
    var out = [], p = st.p, i;
    for (i = 1; i <= WX_DAYS; i++) {
        var ms = Date.UTC(p.y, p.mo - 1, p.d + i);
        var d = new Date(ms);
        var y = d.getUTCFullYear(), mo = d.getUTCMonth() + 1, dd = d.getUTCDate();
        var day = wxDay(st.city, y, mo, dd);
        out.push({ dow: DAYS[d.getUTCDay()], day: day });
    }
    return out;
}

/* ---- units -------------------------------------------------------- */
function wxT(f) { return WX_UNIT === 'C' ? Math.round((f - 32) * 5 / 9) : Math.round(f); }

function wxHourLabel(h24) {
    var ap = h24 >= 12 ? 'PM' : 'AM', h = h24 % 12;
    if (h === 0) h = 12;
    return h + ap;
}
function wxClockLabel(hf) {
    var t = Math.round(hf * 60), h24 = Math.floor(t / 60) % 24, m = t % 60;
    var a = ampm(h24, m);
    return a.t + ' ' + a.ap;
}

/* ---- the hourly strip --------------------------------------------- */
function wxHoursHTML(st) {
    var sun = st.sun, day = st.day, cells = [], i, k;
    function wrap(hr) { return ((hr % 24) + 24) % 24; }
    function condAt(hr) {
        var m = wrap(hr);
        return (m < sun.rise || m > sun.set) ? wxNightly(day.cond) : day.cond;
    }

    /* every sunrise and sunset in the next day, in hours-from-now terms */
    var events = [];
    [['sunset', sun.set, 'Sunset'], ['sunrise', sun.rise, 'Sunrise']].forEach(function (e) {
        for (k = 0; k < 3; k++) {
            var t = e[1] + 24 * k;
            if (t > st.hour && t < st.hour + 25) events.push({ t: t, ic: e[0], lbl: e[2] });
        }
    });
    events.sort(function (a, b) { return a.t - b.t; });

    cells.push({ top: 'Now', ic: st.cond, bot: wxT(st.temp) + '°' });

    var ei = 0, start = Math.floor(st.hour) + 1;
    for (i = 0; i < 24; i++) {
        var hr = start + i;
        /* the event column lands between the hour before it and the
           hour after, the way IMG_2509 puts 8:29 PM between 8PM and 9PM */
        while (ei < events.length && events[ei].t <= hr) {
            cells.push({
                w: true, top: wxClockLabel(events[ei].t % 24),
                ic: events[ei].ic, bot: events[ei].lbl
            });
            ei++;
        }
        cells.push({
            top: wxHourLabel(wrap(hr)), ic: condAt(hr),
            bot: wxT(Math.round(wxTempAt(day, sun, wrap(hr)))) + '°'
        });
    }

    return cells.map(function (c) {
        return '<div class="wx-hr' + (c.w ? ' wide' : '') + '">' +
            '<div class="h">' + esc(c.top) + '</div>' + wxIcon(c.ic, 30) +
            '<div class="t">' + esc(c.bot) + '</div></div>';
    }).join('');
}

/* ---- one city page ------------------------------------------------ */
function wxDetailHTML(st) {
    var d = st.day, sun = st.sun;
    var feels = st.temp >= 80 ? st.temp + Math.max(0, Math.round((d.hum - 40) / 8))
        : st.temp <= 50 ? st.temp - Math.round(d.windMph * .35) : st.temp;
    var uv = Math.max(0, Math.round(11 * wxElev(sun, st.hour) *
        (d.cond === 'sunny' ? 1 : d.cond === 'partly' ? .8 : .45)));
    var rows = [
        ['Sunrise:', wxClockLabel(sun.rise), 0],
        ['Sunset:', wxClockLabel(sun.set), 0],
        ['Chance of Rain:', d.pop + '%', 1],
        ['Humidity:', d.hum + '%', 0],
        ['Wind:', d.windDir + ' ' + d.windMph + ' mph', 1],
        ['Feels Like:', wxT(feels) + '°', 0],
        ['Precipitation:', d.precip.toFixed(1) + ' in', 1],
        ['Pressure:', d.pres + ' in', 0],
        ['Visibility:', d.vis + ' mi', 1],
        ['UV Index:', String(uv), 0]
    ];
    return rows.map(function (r) {
        return '<div class="wx-drow' + (r[2] ? ' gap' : '') + '">' +
            '<div class="k">' + esc(r[0]) + '</div><div class="v">' + esc(r[1]) + '</div></div>';
    }).join('');
}

function wxSummaryHTML(st) {
    var past = st.hour > st.sun.set - 4;
    return 'Today: ' + WX_LABEL[st.cond] + ' currently. It’s ' + wxT(st.temp) + '°; the high today ' +
        (past ? 'was forecast as ' : 'will be ') + wxT(st.day.hi) + '°.';
}

function wxPageHTML(st) {
    var fc = wxForecast(st);
    var days = fc.map(function (f) {
        return '<div class="wx-day"><div class="dow">' + f.dow + '</div>' +
            '<div class="ic">' + wxIcon(f.day.cond, 26) + '</div>' +
            '<div class="hi">' + wxT(f.day.hi) + '</div>' +
            '<div class="lo">' + wxT(f.day.lo) + '</div></div>';
    }).join('');

    return '<div class="wx-scene ' + st.scene + '"></div>' +
        '<div class="wx-clip wx-ctop"><div class="wx-topin">' +
        '<div class="wx-hero"><div class="wx-temp"><span class="wx-degwrap">' +
        '<span class="n">' + wxT(st.temp) + '</span><span class="d">°</span></span></div></div>' +
        '<div class="wx-today"><div class="dow">' + DAYS[new Date(Date.UTC(st.p.y, st.p.mo - 1, st.p.d)).getUTCDay()] + '</div>' +
        '<div class="hi">' + wxT(st.day.hi) + '</div><div class="lo">' + wxT(st.day.lo) + '</div></div>' +
        '</div></div>' +
        '<div class="wx-strip"><div class="wx-hours">' + wxHoursHTML(st) + '</div></div>' +
        '<div class="wx-clip wx-cbot"><div class="wx-botin">' + days +
        '<div class="wx-summary">' + esc(wxSummaryHTML(st)) + '</div>' +
        '<div class="wx-details">' + wxDetailHTML(st) + '</div>' +
        '</div></div>' +
        '<div class="wx-head"><div class="wx-name">' + esc(st.city.n) + '</div>' +
        '<div class="wx-cond">' + WX_LABEL[st.cond] + '</div></div>' +
        '<div class="wx-scroll"><div style="height:' + WX_CONTENT + 'px"></div></div>';
}

/* ---- position the clipped windows for a given scroll offset -------- */
function wxLayout(pg) {
    var s = pg._sc, st = Math.max(0, Math.min(WX_MAXS, s.scrollTop));
    var stripTop = Math.max(WX_STICK, WX_TOP - st);
    pg._head.style.transform = 'translateY(' + (-Math.min(st, WX_HEADRISE)) + 'px)';
    pg._ctop.style.top = '20px';
    pg._ctop.style.height = stripTop + 'px';
    pg._topin.style.transform = 'translateY(' + (-st) + 'px)';
    pg._strip.style.top = (20 + stripTop) + 'px';
    pg._cbot.style.top = (20 + stripTop + WX_STRIP) + 'px';
    pg._cbot.style.height = Math.max(0, WX_WINDOW - stripTop - WX_STRIP) + 'px';
    pg._botin.style.transform = 'translateY(' + ((WX_TOP - st) - stripTop) + 'px)';
}

/* ---- build the deck ------------------------------------------------ */
var wxPagesEl = $('wxPages'), wxDotsEl = $('wxDots');

function wxRender() {
    var html = '';
    WX_CITIES.forEach(function (c) { html += '<div class="wx-page">' + wxPageHTML(wxState(c)) + '</div>'; });
    wxPagesEl.innerHTML = html;
    wxPagesEl.style.width = (320 * WX_CITIES.length) + 'px';

    Array.prototype.forEach.call(wxPagesEl.children, function (pg) {
        pg._sc = pg.querySelector('.wx-scroll');
        pg._head = pg.querySelector('.wx-head');
        pg._ctop = pg.querySelector('.wx-ctop');
        pg._topin = pg.querySelector('.wx-topin');
        pg._cbot = pg.querySelector('.wx-cbot');
        pg._botin = pg.querySelector('.wx-botin');
        pg._strip = pg.querySelector('.wx-strip');
        pg._sc.addEventListener('scroll', function () { wxLayout(pg); });
        pg._strip.addEventListener('wheel', function (e) {
            pg._sc.scrollTop += e.deltaY; e.preventDefault();
        }, { passive: false });
        wxLayout(pg);
    });

    var d = '';
    WX_CITIES.forEach(function (c, i) { d += '<i class="' + (i === wxPage ? 'on' : '') + '"></i>'; });
    wxDotsEl.innerHTML = d;
    wxSetPage(wxPage, true);
}

function wxSetPage(p, instant) {
    wxPage = Math.max(0, Math.min(WX_CITIES.length - 1, p));
    wxPagesEl.style.transition = instant ? 'none' : 'transform .32s cubic-bezier(.32,.72,0,1)';
    wxPagesEl.style.transform = 'translateX(' + (-320 * wxPage) + 'px)';
    var dots = wxDotsEl.children, i;
    for (i = 0; i < dots.length; i++) dots[i].className = i === wxPage ? 'on' : '';
}

/* ---- swipe between cities, drag or wheel to scroll one ------------- */
(function () {
    var x0 = null, y0 = 0, st0 = 0, axis = null, dx = 0, inStrip = false, sc = null;
    var deck = $('wxDeck');

    function pt(e) { return e.touches ? e.touches[0] : e; }
    function down(e) {
        if (openAppId !== 'weather') return;
        var q = pt(e);
        x0 = q.clientX; y0 = q.clientY; dx = 0; axis = null;
        inStrip = !!(e.target.closest && e.target.closest('.wx-strip'));
        sc = wxPagesEl.children[wxPage] ? wxPagesEl.children[wxPage]._sc : null;
        st0 = sc ? sc.scrollTop : 0;
        wxPagesEl.style.transition = 'none';
    }
    function move(e) {
        if (x0 === null) return;
        var q = pt(e), scale = parseFloat((stage.style.transform || '').replace(/[^0-9.]/g, '')) || 1;
        var ddx = (q.clientX - x0) / scale, ddy = (q.clientY - y0) / scale;
        if (!axis) {
            if (Math.abs(ddx) < 6 && Math.abs(ddy) < 6) return;
            axis = Math.abs(ddx) > Math.abs(ddy) ? 'x' : 'y';
        }
        if (axis === 'y') {
            /* the strip sits above the scroller, so drags that start on
               it have to be handed back to the page by hand */
            if (inStrip || !e.touches) {
                if (sc) sc.scrollTop = st0 - ddy;
                if (e.cancelable) e.preventDefault();
            }
            return;
        }
        if (inStrip) return;                    /* the strip scrolls itself */
        dx = ddx;
        if (e.cancelable) e.preventDefault();
        var off = -320 * wxPage + dx;
        if (off > 0 || off < -320 * (WX_CITIES.length - 1)) off = -320 * wxPage + dx * .32;
        wxPagesEl.style.transform = 'translateX(' + off + 'px)';
    }
    function up() {
        if (x0 === null) return;
        x0 = null;
        if (axis === 'x') wxSetPage(wxPage + (Math.abs(dx) > 55 ? (dx < 0 ? 1 : -1) : 0));
        axis = null;
    }
    deck.addEventListener('mousedown', down);
    deck.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('mousemove', move);
    deck.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', up);
    deck.addEventListener('touchend', up);
    deck.addEventListener('touchcancel', up);
})();

/* ---- every city at a glance ---------------------------------------- */
var wxListEl = $('wxListView'), wxRowsEl = $('wxRows');

function wxRenderList() {
    wxRowsEl.innerHTML = WX_CITIES.map(function (c, i) {
        var st = wxState(c);
        var t = ampm(st.p.h, st.p.mi);
        return '<div class="wx-lrow' + (i === 0 ? ' first' : '') + '" data-i="' + i + '">' +
            '<div class="wx-scene ' + st.scene + '"></div>' +
            '<div class="when">' + t.t + ' ' + t.ap + '</div>' +
            '<div class="nm">' + esc(c.n) + '</div>' +
            '<div class="temp">' + wxT(st.temp) + '<span class="d">°</span></div></div>';
    }).join('');
    var u = $('wxUnit').children;
    u[0].className = WX_UNIT === 'C' ? 'on' : '';
    u[2].className = WX_UNIT === 'F' ? 'on' : '';
}

function wxOpenList() { wxRenderList(); wxListEl.classList.add('on'); }
function wxCloseList() { wxListEl.classList.remove('on'); }

$('wxListBtn').addEventListener('click', wxOpenList);
wxRowsEl.addEventListener('click', function (e) {
    var r = e.target.closest('.wx-lrow'); if (!r) return;
    wxSetPage(+r.dataset.i, true);
    wxCloseList();
});
$('wxUnit').addEventListener('click', function (e) {
    var s = e.target.closest('span[data-u]'); if (!s) return;
    if (WX_UNIT === s.dataset.u) return;
    WX_UNIT = s.dataset.u;
    wxRenderList(); wxRender();
});

/* ---- add a city ----------------------------------------------------
   The zip rows are the ones IMG_2514 returns for 68874, kept verbatim
   so that query reproduces the screenshot. */
var WX_PLACES = [
    { zip: '68874', label: 'Sargent, NE, United States', n: 'Sargent', tz: 'America/Chicago', lat: 41.640, lon: -99.370, base: 73, amp: 19, wet: .22 },
    { zip: '68874', label: 'Al Kharkhir, Saudi Arabia', n: 'Al Kharkhir', tz: 'Asia/Riyadh', lat: 18.897, lon: 51.100, base: 92, amp: 24, wet: .03 },
    { zip: '68874', label: 'Villa Hidalgo, Oax., Mexico', n: 'Villa Hidalgo', tz: 'America/Mexico_City', lat: 17.183, lon: -95.900, base: 76, amp: 16, wet: .40 },
    { zip: '688747', label: 'Singapore', n: 'Singapore', tz: 'Asia/Singapore', lat: 1.352, lon: 103.820, base: 82, amp: 9, wet: .55 },
    { zip: '688740', label: 'Singapore', n: 'Singapore', tz: 'Asia/Singapore', lat: 1.352, lon: 103.820, base: 82, amp: 9, wet: .55 },
    { zip: '688742', label: 'Singapore', n: 'Singapore', tz: 'Asia/Singapore', lat: 1.352, lon: 103.820, base: 82, amp: 9, wet: .55 },
    { zip: '688749', label: 'Singapore', n: 'Singapore', tz: 'Asia/Singapore', lat: 1.352, lon: 103.820, base: 82, amp: 9, wet: .55 },
    { zip: '68845', label: 'Kearney, NE, United States', n: 'Kearney', tz: 'America/Chicago', lat: 40.699, lon: -99.082, base: 75, amp: 18, wet: .22 },
    { zip: '68005', label: 'Bellevue, NE, United States', n: 'Bellevue', tz: 'America/Chicago', lat: 41.154, lon: -95.915, base: 75, amp: 18, wet: .26 },
    { zip: '80517', label: 'Estes Park, CO, United States', n: 'Estes Park', tz: 'America/Denver', lat: 40.377, lon: -105.522, base: 60, amp: 20, wet: .52 },
    { zip: '95014', label: 'Cupertino, CA, United States', n: 'Cupertino', tz: 'America/Los_Angeles', lat: 37.323, lon: -122.032, base: 66, amp: 20, wet: .12 },
    { zip: '10001', label: 'New York, NY, United States', n: 'New York', tz: 'America/New_York', lat: 40.713, lon: -74.006, base: 72, amp: 14, wet: .32 },

    { label: 'London, United Kingdom', n: 'London', tz: 'Europe/London', lat: 51.507, lon: -0.128, base: 58, amp: 14, wet: .55 },
    { label: 'Paris, France', n: 'Paris', tz: 'Europe/Paris', lat: 48.857, lon: 2.352, base: 60, amp: 16, wet: .45 },
    { label: 'Berlin, Germany', n: 'Berlin', tz: 'Europe/Berlin', lat: 52.520, lon: 13.405, base: 56, amp: 17, wet: .45 },
    { label: 'Madrid, Spain', n: 'Madrid', tz: 'Europe/Madrid', lat: 40.417, lon: -3.704, base: 68, amp: 22, wet: .18 },
    { label: 'Rome, Italy', n: 'Rome', tz: 'Europe/Rome', lat: 41.903, lon: 12.496, base: 68, amp: 18, wet: .25 },
    { label: 'Moscow, Russia', n: 'Moscow', tz: 'Europe/Moscow', lat: 55.756, lon: 37.617, base: 46, amp: 18, wet: .42 },
    { label: 'Reykjavik, Iceland', n: 'Reykjavik', tz: 'Atlantic/Reykjavik', lat: 64.147, lon: -21.942, base: 42, amp: 10, wet: .60 },
    { label: 'Cairo, Egypt', n: 'Cairo', tz: 'Africa/Cairo', lat: 30.044, lon: 31.236, base: 82, amp: 22, wet: .04 },
    { label: 'Nairobi, Kenya', n: 'Nairobi', tz: 'Africa/Nairobi', lat: -1.292, lon: 36.822, base: 70, amp: 16, wet: .38 },
    { label: 'Cape Town, South Africa', n: 'Cape Town', tz: 'Africa/Johannesburg', lat: -33.925, lon: 18.424, base: 64, amp: 16, wet: .35 },
    { label: 'Dubai, United Arab Emirates', n: 'Dubai', tz: 'Asia/Dubai', lat: 25.205, lon: 55.271, base: 92, amp: 18, wet: .04 },
    { label: 'Mumbai, India', n: 'Mumbai', tz: 'Asia/Kolkata', lat: 19.076, lon: 72.878, base: 84, amp: 12, wet: .48 },
    { label: 'Bangkok, Thailand', n: 'Bangkok', tz: 'Asia/Bangkok', lat: 13.756, lon: 100.502, base: 88, amp: 13, wet: .50 },
    { label: 'Hong Kong', n: 'Hong Kong', tz: 'Asia/Hong_Kong', lat: 22.320, lon: 114.170, base: 78, amp: 12, wet: .45 },
    { label: 'Beijing, China', n: 'Beijing', tz: 'Asia/Shanghai', lat: 39.904, lon: 116.407, base: 60, amp: 20, wet: .30 },
    { label: 'Seoul, South Korea', n: 'Seoul', tz: 'Asia/Seoul', lat: 37.567, lon: 126.978, base: 60, amp: 18, wet: .38 },
    { label: 'Tokyo, Japan', n: 'Tokyo', tz: 'Asia/Tokyo', lat: 35.690, lon: 139.692, base: 78, amp: 11, wet: .40 },
    { label: 'Sydney, Australia', n: 'Sydney', tz: 'Australia/Sydney', lat: -33.868, lon: 151.209, base: 66, amp: 14, wet: .35 },
    { label: 'Auckland, New Zealand', n: 'Auckland', tz: 'Pacific/Auckland', lat: -36.848, lon: 174.763, base: 60, amp: 13, wet: .48 },
    { label: 'Honolulu, HI, United States', n: 'Honolulu', tz: 'Pacific/Honolulu', lat: 21.307, lon: -157.858, base: 80, amp: 10, wet: .30 },
    { label: 'Anchorage, AK, United States', n: 'Anchorage', tz: 'America/Anchorage', lat: 61.218, lon: -149.900, base: 42, amp: 16, wet: .45 },
    { label: 'Seattle, WA, United States', n: 'Seattle', tz: 'America/Los_Angeles', lat: 47.606, lon: -122.333, base: 58, amp: 16, wet: .55 },
    { label: 'San Francisco, CA, United States', n: 'San Francisco', tz: 'America/Los_Angeles', lat: 37.775, lon: -122.419, base: 60, amp: 12, wet: .22 },
    { label: 'Los Angeles, CA, United States', n: 'Los Angeles', tz: 'America/Los_Angeles', lat: 34.052, lon: -118.244, base: 72, amp: 18, wet: .10 },
    { label: 'Denver, CO, United States', n: 'Denver', tz: 'America/Denver', lat: 39.739, lon: -104.990, base: 64, amp: 24, wet: .28 },
    { label: 'Chicago, IL, United States', n: 'Chicago', tz: 'America/Chicago', lat: 41.878, lon: -87.630, base: 62, amp: 18, wet: .35 },
    { label: 'Omaha, NE, United States', n: 'Omaha', tz: 'America/Chicago', lat: 41.257, lon: -95.995, base: 68, amp: 19, wet: .30 },
    { label: 'Lincoln, NE, United States', n: 'Lincoln', tz: 'America/Chicago', lat: 40.813, lon: -96.703, base: 69, amp: 19, wet: .30 },
    { label: 'Dallas, TX, United States', n: 'Dallas', tz: 'America/Chicago', lat: 32.777, lon: -96.797, base: 78, amp: 18, wet: .25 },
    { label: 'Miami, FL, United States', n: 'Miami', tz: 'America/New_York', lat: 25.762, lon: -80.192, base: 82, amp: 12, wet: .48 },
    { label: 'Boston, MA, United States', n: 'Boston', tz: 'America/New_York', lat: 42.360, lon: -71.058, base: 62, amp: 16, wet: .35 },
    { label: 'Toronto, Canada', n: 'Toronto', tz: 'America/Toronto', lat: 43.653, lon: -79.383, base: 56, amp: 17, wet: .38 },
    { label: 'Vancouver, Canada', n: 'Vancouver', tz: 'America/Vancouver', lat: 49.283, lon: -123.121, base: 55, amp: 14, wet: .55 },
    { label: 'Mexico City, Mexico', n: 'Mexico City', tz: 'America/Mexico_City', lat: 19.433, lon: -99.133, base: 68, amp: 20, wet: .40 },
    { label: 'Guatemala City, Guatemala', n: 'Guatemala City', tz: 'America/Guatemala', lat: 14.635, lon: -90.507, base: 68, amp: 14, wet: .48 },
    { label: 'Bogotá, Colombia', n: 'Bogotá', tz: 'America/Bogota', lat: 4.711, lon: -74.072, base: 58, amp: 14, wet: .50 },
    { label: 'Lima, Peru', n: 'Lima', tz: 'America/Lima', lat: -12.046, lon: -77.043, base: 68, amp: 10, wet: .12 },
    { label: 'São Paulo, Brazil', n: 'São Paulo', tz: 'America/Sao_Paulo', lat: -23.551, lon: -46.633, base: 68, amp: 16, wet: .42 },
    { label: 'Buenos Aires, Argentina', n: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires', lat: -34.604, lon: -58.382, base: 64, amp: 16, wet: .35 }
];

var wxQuery = '', wxSearchEl = $('wxSearchView'), wxResEl = $('wxResults');

function wxMatches() {
    var q = wxQuery.trim();
    if (!q) return [];
    if (/^\d+$/.test(q)) {
        return WX_PLACES.filter(function (p) { return p.zip && p.zip.indexOf(q) === 0; })
            .map(function (p) { return { p: p, head: p.zip.slice(0, q.length), tail: p.zip.slice(q.length) + ' ' + p.label }; });
    }
    var lq = q.toLowerCase();
    return WX_PLACES.filter(function (p) { return p.n.toLowerCase().indexOf(lq) === 0; })
        .map(function (p) { return { p: p, head: p.label.slice(0, q.length), tail: p.label.slice(q.length) }; })
        .slice(0, 12);
}

function wxRenderResults() {
    var m = wxMatches();
    wxResEl._m = m;
    if (!wxQuery.trim()) { wxResEl.innerHTML = ''; return; }
    if (!m.length) { wxResEl.innerHTML = '<div class="wx-snone">No Results</div>'; return; }
    wxResEl.innerHTML = m.map(function (r, i) {
        return '<div class="wx-sres" data-i="' + i + '"><b>' + esc(r.head) + '</b>' + esc(r.tail) + '</div>';
    }).join('');
}

function wxSyncSearch() {
    var t = $('wxSText');
    t.innerHTML = (wxQuery ? '<span>' + esc(wxQuery) + '</span>' : '') + '<span class="caret"></span>';
    $('wxField').classList.toggle('filled', !!wxQuery);
    kb9.retDim = !wxQuery.trim();
    kb9.retGo = !!wxQuery.trim();
    drawKeys(kb9);
    wxRenderResults();
}

function wxOpenSearch() {
    wxQuery = '';
    wxSearchEl.classList.add('on');
    openKB(kb9);
    wxSyncSearch();
}
function wxCloseSearch() {
    closeKB(kb9);
    wxSearchEl.classList.remove('on');
}
function wxAddPlace(p) {
    WX_CITIES.push({ n: p.n, tz: p.tz, lat: p.lat, lon: p.lon, base: p.base, amp: p.amp, wet: p.wet });
    wxPage = WX_CITIES.length - 1;
    wxRender();
    wxCloseSearch();
    wxCloseList();
}

$('wxAdd').addEventListener('click', wxOpenSearch);
$('wxSCancel').addEventListener('click', wxCloseSearch);
$('wxField').addEventListener('click', function () { openKB(kb9); });
$('wxSClear').addEventListener('click', function (e) {
    e.stopPropagation(); wxQuery = ''; wxSyncSearch();
});
wxResEl.addEventListener('click', function (e) {
    var r = e.target.closest('.wx-sres'); if (!r || !wxResEl._m) return;
    var m = wxResEl._m[+r.dataset.i]; if (m) wxAddPlace(m.p);
});

var kb9 = buildKeyboard($('kb9'), {
    target: 'wxsearch', nopred: true, nocap: true, retLabel: 'Search', retDim: true
});

/* ---- lifecycle ------------------------------------------------------ */
function wxOpen() {
    wxRender();
    clearInterval(wxTimer);
    wxTimer = setInterval(function () {
        if (openAppId !== 'weather') return;
        if (wxListEl.classList.contains('on')) wxRenderList();
    }, 20000);
}
function wxReset() {
    clearInterval(wxTimer); wxTimer = null;
    wxCloseSearch();
    wxCloseList();
}
