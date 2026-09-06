"use strict";
/* ------------------------------------------------------------------ */
/* STOCKS                                                             */
/* ------------------------------------------------------------------ */
/* Traced off ref_pic/Stocks/. Quotes and stats are the numbers on the
   screenshots; there is no quote feed behind them, so nothing ticks.
   The charts are a seeded random walk anchored to each symbol's real
   high and low, which is honest synthetic data rather than a straight
   line pretending to be a price. */

var ST_SYMS = [
    {
        s: '^IXIC', e: '', n: 'NASDAQ Composite', p: 26180.46, ch: 0.43,
        open: '26,198.83', high: '26,269.85', low: '26,049.30', vol: '6.319B',
        pe: '—', cap: '—', wh: '27,190.21', wl: '20,690.25',
        avg: '9.435B', yld: '—', lo: 20690.25, hi: 27190.21
    },
    {
        s: '^NYA', e: '', n: 'NYSE COMPOSITE (DJ)', p: 24728.67, ch: 0.73,
        open: '24,548.10', high: '24,771.92', low: '24,502.35', vol: '3.114B',
        pe: '—', cap: '—', wh: '25,004.88', wl: '19,882.41',
        avg: '3.902B', yld: '—', lo: 19882.41, hi: 25004.88
    },
    {
        s: '^DJI', e: '', n: 'Dow Jones Industrial Average', p: 53277.01, ch: 0.98,
        open: '52,760.44', high: '53,318.70', low: '52,701.19', vol: '412.6M',
        pe: '—', cap: '—', wh: '53,318.70', wl: '41,844.89',
        avg: '498.2M', yld: '—', lo: 41844.89, hi: 53318.70
    },
    {
        s: 'AAPL', e: 'NASDAQ', n: 'Apple Inc.', p: 309.35, ch: -0.63,
        open: '312.05', high: '312.38', low: '307.01', vol: '46.88M',
        pe: '35.48', cap: '4.515T', wh: '344.57', wl: '224.69',
        avg: '56.65M', yld: '0.35%', lo: 224.69, hi: 344.57
    },
    {
        s: 'SBUX', e: 'NASDAQ', n: 'Starbucks Corporation', p: 107.08, ch: 2.97,
        open: '104.02', high: '107.44', low: '103.88', vol: '11.20M',
        pe: '32.71', cap: '121.7B', wh: '117.46', wl: '75.50',
        avg: '9.842M', yld: '2.27%', lo: 75.50, hi: 117.46
    },
    {
        s: 'NKE', e: 'NYSE', n: 'NIKE, Inc.', p: 40.76, ch: 1.37,
        open: '40.21', high: '40.94', low: '40.05', vol: '14.63M',
        pe: '21.09', cap: '60.28B', wh: '58.13', wl: '38.02',
        avg: '12.41M', yld: '3.92%', lo: 38.02, hi: 58.13
    },
    {
        s: 'YHOO', e: 'Industry', n: '20318540', p: 33.26, ch: 0.12,
        open: '33.22', high: '33.41', low: '33.10', vol: '1.004M',
        pe: '—', cap: '—', wh: '38.75', wl: '28.44',
        avg: '1.221M', yld: '—', lo: 28.44, hi: 38.75
    }
];

/* the headlines that are legible on the screenshots, per symbol; anything
   without its own set falls back to the market-wide one */
var ST_NEWS = {
    '^IXIC': [
        ['Dow Jones Futures Fall With Market At Key Point; Nvidia, Tariffs, Warsh In Focus',
            'The m…', "Investor's Business Daily", '5:11 PM'],
        ['UBS revamps S&P 500 target for rest of 2026',
            'Stronger profits are changing the math for sto…', 'TheStreet', '3:23 PM'],
        ['Why Tempus AI Skyrocketed This Week',
            "Tempus AI's latest acquisition is looking like a…", 'Motley Fool', '6:35 AM']
    ],
    'AAPL': [
        ["'Its a new tool for creativity': Dr Dre on use of AI in creating music",
            'Washington DC [US], Au…', 'mint', '12:38 PM'],
        ["Nvidia's 15% Price Hike Reveals the Hidden Cost of the AI Boom",
            'The AI boom is quietly se…', '24/7 Wall St.', '9:43 AM'],
        ['Amid the faltering position of Tesla, the "favorite stock of Western scholars," the "M…',
            '', '매일경제', '8:01 AM']
    ],
    'SBUX': [
        ['Starbucks sold a lot of Unicorn drinks last weekend',
            'The coffee shop giant had its strong…', "Nation's Restaurant News",
            '8/21/26 at 2:08 PM'],
        ['Starbucks lays off 100+ employees who refused Nashville relocation',
            'Starbucks is layi…', 'The Tennessean', '8/21/26 at 12:34 PM'],
        ['Starbucks Is Up 25% This Year While Dutch Bros Lags. Is the Gap Justified?',
            'Starbucks is…', 'Motley Fool', '8/21/26 at 12:05 PM']
    ]
};

/* what the search can find -- a fixed table, since nothing here is online */
var ST_UNIVERSE = ST_SYMS.concat([
    { s: 'L', e: 'NYSE', n: 'Loews Corporation' },
    { s: 'BZ=F', e: 'NY Mercantile', n: 'Brent Crude Oil Last Day Financ' },
    { s: 'TDCL', e: 'NASDAQ', n: 'GraniteShares 2x Long TDC Daily ETF' },
    { s: 'LKR=X', e: 'CCY', n: 'USD/LKR' },
    { s: 'LBPUSD=X', e: 'CCY', n: 'LBP/USD' },
    { s: 'GOOG', e: 'NASDAQ', n: 'Alphabet Inc.' },
    { s: 'MSFT', e: 'NASDAQ', n: 'Microsoft Corporation' },
    { s: 'TSLA', e: 'NASDAQ', n: 'Tesla, Inc.' },
    { s: 'AMZN', e: 'NASDAQ', n: 'Amazon.com, Inc.' },
    { s: 'NVDA', e: 'NASDAQ', n: 'NVIDIA Corporation' },
    { s: 'DIS', e: 'NYSE', n: 'The Walt Disney Company' },
    { s: 'KO', e: 'NYSE', n: 'Coca-Cola Company' }
]);

var ST_RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y', '2Y'];
var stSel = 0, stPage = 0, stRange = '6M', stMode = 'pct';
var stLoading = false, stLoadTimer = null, stArmed = null;
var stQuery = '';

function stCur() { return ST_SYMS[stSel] || ST_SYMS[0]; }
function stNum(v, dec) {
    return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function stPillText(k) {
    if (stMode === 'cap') return k.cap === '—' ? '—' : k.cap;
    var sign = k.ch < 0 ? '−' : '+';
    if (stMode === 'price') return sign + stNum(Math.abs(k.p * k.ch / 100), 2);
    return sign + Math.abs(k.ch).toFixed(2) + '%';
}

/* ---- the quotes ------------------------------------------------------ */
function stRenderTickers() {
    $('sttickers').innerHTML = ST_SYMS.map(function (k, i) {
        return '<div class="st-row' + (i === stSel ? ' on' : '') + '" data-i="' + i + '">' +
            '<div class="st-sym">' + esc(k.s === '^IXIC' ? 'NASDAQ'
                : k.s === '^NYA' ? 'NYSE' : k.s === '^DJI' ? 'DOW J' : k.s) + '</div>' +
            '<div class="st-price">' + stNum(k.p, 2) + '</div>' +
            '<div class="st-pill' + (k.ch < 0 ? ' down' : '') + '">' + stPillText(k) + '</div>' +
            '</div>';
    }).join('');
}
$('sttickers').addEventListener('click', function (e) {
    if (e.target.closest('.st-pill')) {
        stMode = stMode === 'pct' ? 'price' : stMode === 'price' ? 'cap' : 'pct';
        stRenderTickers();
        return;
    }
    var row = e.target.closest('.st-row'); if (!row) return;
    stSel = +row.dataset.i;
    stRenderTickers();
    if (stPage > 0) stBusy(stRenderPanel); else stRenderPanel();
});

/* ---- stats ----------------------------------------------------------- */
function stRenderStats() {
    var k = stCur();
    var rows = [
        ['OPEN', k.open, 'MKT CAP', k.cap],
        ['HIGH', k.high, '52W HIGH', k.wh],
        ['LOW', k.low, '52W LOW', k.wl],
        ['VOL', k.vol, 'AVG VOL', k.avg],
        ['P/E', k.pe, 'YIELD', k.yld]
    ];
    var cells = '';
    rows.forEach(function (r) {
        cells += '<div class="st-cell"><div class="st-k">' + r[0] + '</div>' +
            '<div class="st-v">' + r[1] + '</div></div>' +
            '<div class="st-cell"><div class="st-k">' + r[2] + '</div>' +
            '<div class="st-v">' + r[3] + '</div></div>';
    });
    $('stStats').innerHTML = '<div class="st-name">' + esc(k.n) + '</div>' +
        '<div class="st-grid">' + cells + '</div>';
}

/* ---- the chart ------------------------------------------------------- */
/* one deterministic walk per symbol and range, so a chart looks the same
   every time you come back to it */
function stRand(seed) {
    var x = seed;
    return function () {
        x = (x * 1664525 + 1013904223) % 4294967296;
        return x / 4294967296;
    };
}
function stSeed(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = (h * 16777619) >>> 0;
    }
    return h;
}
function stSeries(k, range) {
    var n = { '1D': 78, '1W': 70, '1M': 66, '3M': 90, '6M': 130, '1Y': 160, '2Y': 200 }[range];
    var rnd = stRand(stSeed(k.s + range));
    /* how far back the window reaches, as a share of the 52-week band */
    var reach = { '1D': .02, '1W': .06, '1M': .13, '3M': .34, '6M': .62, '1Y': .95, '2Y': 1 }[range];
    var band = (k.hi - k.lo) * reach;
    var end = k.p, v = end - band * (rnd() * .5 + .1);
    var out = [v], drift = (end - v) / n;
    for (var i = 1; i < n; i++) {
        v += drift + (rnd() - .5) * band * .09;
        out.push(v);
    }
    out[out.length - 1] = end;
    var vols = [];
    for (var j = 0; j < n; j++) vols.push(.25 + rnd() * (rnd() < .06 ? 2.4 : .75));
    return { p: out, v: vols };
}
var ST_AXIS = {
    '1D': ['10', '11', '12', '1', '2', '3'],
    '1W': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    '1M': ['Aug 1', 'Aug 8', 'Aug 15', 'Aug 22'],
    '3M': ['June', 'July', 'August'],
    '6M': ['March', 'April', 'May', 'June', 'July'],
    '1Y': ['Oct', 'Jan', 'Apr', 'Jul'],
    '2Y': ['2025', '2026']
};

function stRenderChart() {
    $('stRanges').innerHTML = ST_RANGES.map(function (r) {
        return '<div class="st-range' + (r === stRange ? ' on' : '') + '" data-r="' + r + '">' +
            r + '</div>';
    }).join('');
    if (stLoading) {
        $('stPlot').innerHTML = '<div class="st-load"><span class="spin">' +
            new Array(13).join('<i></i>') + '</span><span>Retrieving Chart…</span></div>';
        return;
    }
    var k = stCur(), d = stSeries(k, stRange);
    var W = 320, H = 144, L = 10, R = 46, T = 6, VB = 20;
    var PH = H - VB - T - 14;                  /* room for the month labels */
    var lo = Math.min.apply(null, d.p), hi = Math.max.apply(null, d.p);
    if (hi - lo < 1e-6) hi = lo + 1;
    var pad = (hi - lo) * .12; lo -= pad; hi += pad;
    var x = function (i) { return L + (W - L - R) * (i / (d.p.length - 1)); };
    var y = function (v) { return T + PH * (1 - (v - lo) / (hi - lo)); };

    var line = '', area = '';
    d.p.forEach(function (v, i) {
        line += (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1);
    });
    area = line + 'L' + x(d.p.length - 1).toFixed(1) + ' ' + (T + PH) + 'L' + L + ' ' + (T + PH) + 'Z';

    var labels = ST_AXIS[stRange] || [], grid = '', axis = '';
    labels.forEach(function (t, i) {
        var gx = L + (W - L - R) * ((i + .5) / labels.length);
        var lx = L + (W - L - R) * (i / labels.length);
        grid += '<path d="M' + lx.toFixed(1) + ' ' + T + 'V' + (T + PH) + '" stroke="#3A3A3C" ' +
            'stroke-width="1"/>';
        axis += '<text x="' + gx.toFixed(1) + '" y="' + (T + PH + 13) + '" fill="#7C7C81" ' +
            'font-size="13" text-anchor="middle" font-family="var(--sf-text)">' + t + '</text>';
    });

    /* 1D draws the previous close as a dashed rule */
    var prev = '';
    if (stRange === '1D') {
        var pc = k.p / (1 + k.ch / 100);
        if (pc > lo && pc < hi) {
            prev = '<path d="M' + L + ' ' + y(pc).toFixed(1) + 'H' + (W - R) + '" stroke="#9A9A9F" ' +
                'stroke-width="1" stroke-dasharray="3 3"/>';
        }
    }

    var vmax = Math.max.apply(null, d.v), bars = '';
    d.v.forEach(function (v, i) {
        var bh = Math.max(1, (v / vmax) * (VB - 4));
        bars += '<rect x="' + (x(i) - 1).toFixed(1) + '" y="' + (H - bh).toFixed(1) +
            '" width="2" height="' + bh.toFixed(1) + '" fill="#5A5A5E"/>';
    });

    $('stPlot').innerHTML =
        '<svg viewBox="0 0 ' + W + ' ' + H + '">' +
        '<defs><linearGradient id="stFade" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".26"/>' +
        '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
        grid + prev +
        '<path d="' + area + '" fill="url(#stFade)"/>' +
        '<path d="' + line + '" fill="none" stroke="#fff" stroke-width="1.4" ' +
        'stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
        '<path d="M' + L + ' ' + (T + PH) + 'H' + (W - R) + '" stroke="#3A3A3C" stroke-width="1"/>' +
        axis + bars +
        '<text x="' + (W - 6) + '" y="' + (T + 13) + '" fill="#8A8A8F" font-size="15" ' +
        'text-anchor="end" font-family="var(--sf-text)">' + stNum(hi - pad, 0) + '</text>' +
        '<text x="' + (W - 6) + '" y="' + (T + PH - 3) + '" fill="#8A8A8F" font-size="15" ' +
        'text-anchor="end" font-family="var(--sf-text)">' + stNum(lo + pad, 0) + '</text>' +
        '</svg>';
}
$('stRanges').addEventListener('click', function (e) {
    var r = e.target.closest('.st-range'); if (!r) return;
    stRange = r.dataset.r;
    stBusy(stRenderChart);
});

/* both panels show a spinner for a beat, the way a fetch would */
function stBusy(after) {
    clearTimeout(stLoadTimer);
    stLoading = true;
    $('stapp').classList.add('busy');
    after();
    stLoadTimer = setTimeout(function () {
        stLoading = false;
        $('stapp').classList.remove('busy');
        after();
    }, 620);
}

/* ---- news ------------------------------------------------------------ */
function stRenderNews() {
    if (stLoading) {
        $('stNews').innerHTML = '<div class="st-load"><span class="spin">' +
            new Array(13).join('<i></i>') + '</span><span>Retrieving News…</span></div>';
        return;
    }
    var k = stCur(), list = ST_NEWS[k.s] || ST_NEWS['^IXIC'];
    $('stNews').innerHTML = list.map(function (n) {
        return '<div class="st-story"><div class="st-head">' + esc(n[0]) +
            (n[1] ? ' <em>' + esc(n[1]) + '</em>' : '') + '</div>' +
            '<div class="st-src">' + esc(n[2]) + ' - ' + esc(n[3]) + '</div></div>';
    }).join('');
}

/* ---- the panel ------------------------------------------------------- */
function stRenderPanel() {
    stRenderStats();
    stRenderChart();
    stRenderNews();
    $('stDots').innerHTML = '<i class="' + (stPage === 0 ? 'on' : '') + '"></i>' +
        '<i class="' + (stPage === 1 ? 'on' : '') + '"></i>' +
        '<i class="' + (stPage === 2 ? 'on' : '') + '"></i>';
    $('stTrack').style.transform = 'translateX(' + (-stPage * 33.3333) + '%)';
}
function stGoPage(p) {
    p = Math.max(0, Math.min(2, p));
    if (p === stPage) return;
    stPage = p;
    if (p === 1 || p === 2) stBusy(stRenderPanel); else stRenderPanel();
}
(function () {
    var x0 = 0, y0 = 0, live = false;
    $('stpanel').addEventListener('pointerdown', function (e) {
        if (e.target.closest('.st-info') || e.target.closest('.st-range')) return;
        live = true; x0 = e.clientX; y0 = e.clientY;
    });
    $('stpanel').addEventListener('pointermove', function (e) {
        if (!live) return;
        var dx = e.clientX - x0;
        if (Math.abs(e.clientY - y0) > Math.abs(dx)) { live = false; return; }
        if (Math.abs(dx) > 40) { live = false; stGoPage(stPage + (dx < 0 ? 1 : -1)); }
    });
    $('stpanel').addEventListener('pointerup', function () { live = false; });
    $('stpanel').addEventListener('pointercancel', function () { live = false; });
})();

/* ---- managing the list ----------------------------------------------- */
function stRenderEdit() {
    $('stEList').innerHTML = ST_SYMS.map(function (k, i) {
        return '<div class="st-erow" data-i="' + i + '">' +
            '<div class="st-edel">Delete</div>' +
            '<div class="st-eslide">' +
            '<div class="st-eminus"></div>' +
            '<div class="st-etext">' +
            '<div class="st-etop"><div class="st-esym">' + esc(k.s) + '</div>' +
            (k.e ? '<div class="st-eexch">' + esc(k.e) + '</div>' : '') + '</div>' +
            '<div class="st-ename">' + esc(k.n) + '</div></div>' +
            '<div class="st-grip"><i></i><i></i><i></i></div>' +
            '</div></div>';
    }).join('');
    var seg = $('stSeg').children;
    for (var i = 0; i < seg.length; i++) {
        seg[i].classList.toggle('on', seg[i].dataset.m === stMode);
    }
}
function stDisarm() { if (stArmed) { stArmed.classList.remove('armed'); stArmed = null; } }
function stArm(row) {
    if (stArmed === row) return stDisarm();
    stDisarm(); row.classList.add('armed'); stArmed = row;
}
function stRemove(i) {
    ST_SYMS.splice(i, 1);
    if (!ST_SYMS.length) ST_SYMS.push(ST_UNIVERSE[0]);
    if (stSel >= ST_SYMS.length) stSel = ST_SYMS.length - 1;
    stArmed = null;
    stRenderEdit(); stRenderTickers(); stRenderPanel();
}
$('stEList').addEventListener('click', function (e) {
    var row = e.target.closest('.st-erow'); if (!row) return;
    var i = +row.dataset.i;
    if (e.target.closest('.st-edel')) { stRemove(i); return; }
    if (e.target.closest('.st-eminus')) { stArm(row); return; }
    if (stArmed) stDisarm();
});
(function () {
    var x0 = 0, y0 = 0, live = false, row = null;
    $('stEList').addEventListener('pointerdown', function (e) {
        row = e.target.closest('.st-erow'); live = !!row; x0 = e.clientX; y0 = e.clientY;
    });
    $('stEList').addEventListener('pointermove', function (e) {
        if (!live || !row) return;
        var dx = e.clientX - x0;
        if (Math.abs(e.clientY - y0) > Math.abs(dx)) { live = false; return; }
        if (dx < -26 && stArmed !== row) { stArm(row); live = false; }
        else if (dx > 26 && stArmed === row) { stDisarm(); live = false; }
    });
    $('stEList').addEventListener('pointerup', function () { live = false; });
    $('stEList').addEventListener('pointercancel', function () { live = false; });
})();
$('stSeg').addEventListener('click', function (e) {
    var b = e.target.closest('.st-segbtn'); if (!b) return;
    stMode = b.dataset.m;
    stRenderEdit(); stRenderTickers();
});
$('stInfo').addEventListener('click', function () {
    stRenderEdit();
    $('st-edit').classList.add('up');
});
$('stDone').addEventListener('click', function () {
    stDisarm();
    $('st-edit').classList.remove('up');
});

/* ---- adding one ------------------------------------------------------ */
function stSyncSearch() {
    $('stSField').classList.toggle('has', !!stQuery);
    $('stSVal').innerHTML = stQuery
        ? esc(stQuery) + '<span class="caret"></span>'
        : '<span class="caret"></span>';
    var q = stQuery.trim().toLowerCase(), h = '';
    if (q) {
        var have = ST_SYMS.map(function (k) { return k.s; });
        var hits = ST_UNIVERSE.filter(function (k) {
            return have.indexOf(k.s) < 0 &&
                (k.s.toLowerCase().indexOf(q) === 0 || k.n.toLowerCase().indexOf(q) > -1);
        }).slice(0, 12);
        h = hits.map(function (k) {
            return '<div class="st-hit" data-s="' + esc(k.s) + '">' +
                '<div class="st-etop"><div class="st-esym">' + esc(k.s) + '</div>' +
                (k.e ? '<div class="st-eexch">' + esc(k.e) + '</div>' : '') + '</div>' +
                '<div class="st-ename">' + esc(k.n) + '</div></div>';
        }).join('') || '<div class="st-none">No results</div>';
    }
    $('stSRes').innerHTML = h;
}
$('stAdd').addEventListener('click', function () {
    stQuery = '';
    $('st-add').classList.add('up');
    openKB(kbS);
    stSyncSearch();
});
function stCloseAdd() { closeKB(kbS); $('st-add').classList.remove('up'); }
$('stSCancel').addEventListener('click', stCloseAdd);
$('stSClear').addEventListener('click', function (e) {
    e.stopPropagation(); stQuery = ''; stSyncSearch();
});
$('stSRes').addEventListener('click', function (e) {
    var hit = e.target.closest('.st-hit'); if (!hit) return;
    var sym = hit.dataset.s;
    var base = ST_UNIVERSE.filter(function (k) { return k.s === sym; })[0];
    if (!base) return;
    /* a symbol added from the table has no quote behind it, so give it one */
    var k = base.p !== undefined ? base : stSynth(base);
    ST_SYMS.push(k);
    stCloseAdd();
    stRenderEdit(); stRenderTickers();
});
function stSynth(base) {
    var rnd = stRand(stSeed(base.s));
    var p = Math.round((6 + rnd() * 340) * 100) / 100;
    var ch = Math.round((rnd() * 6 - 2.4) * 100) / 100;
    return {
        s: base.s, e: base.e, n: base.n, p: p, ch: ch,
        open: stNum(p * (1 - ch / 200), 2), high: stNum(p * 1.012, 2),
        low: stNum(p * .988, 2), vol: stNum(Math.round(rnd() * 40 + 2), 2) + 'M',
        pe: stNum(rnd() * 40 + 9, 2), cap: stNum(rnd() * 400 + 8, 2) + 'B',
        wh: stNum(p * 1.28, 2), wl: stNum(p * .68, 2),
        avg: stNum(Math.round(rnd() * 40 + 2), 2) + 'M', yld: (rnd() * 3).toFixed(2) + '%',
        lo: p * .68, hi: p * 1.28
    };
}

var kbS = buildKeyboard($('kbS'), {
    target: 'stsearch', nopred: true, nocap: true, retLabel: 'Search', retDim: false
});

/* ---- lifecycle ------------------------------------------------------- */
function stOpen() {
    stRenderTickers();
    stRenderPanel();
}
function stReset() {
    clearTimeout(stLoadTimer);
    stLoading = false;
    $('stapp').classList.remove('busy');
    stDisarm();
    stCloseAdd();
    $('st-edit').classList.remove('up');
    stPage = 0;
    stRange = '6M';
    $('sttickers').scrollTop = 0;
    stRenderTickers();
    stRenderPanel();
}
