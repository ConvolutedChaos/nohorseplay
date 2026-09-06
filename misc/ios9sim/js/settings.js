"use strict";
/* ================================================================== */
/* SETTINGS                                                           */
/* ================================================================== */
/* Traced off ref_pic/Settings/. Only Wi-Fi is wired up, because that
   is the only screen there are photographs of; the root list carries
   the one row and nothing else pretends to work.

   The fourth wall runs the radio's world: AIR below is the list of
   access points that physically exist around the device, and it is
   owned by the bench panel outside the screen, not by the phone. The
   phone can only see what is in AIR and up, can only join what it has
   the right password for, and can only find a hidden network if you
   type its name exactly. That is what makes a wrong password fail and
   a made-up name come back "Could not find the network". */

var SEC_TYPES = ['None', 'WEP', 'WPA', 'WPA2', 'WPA Enterprise', 'WPA2 Enterprise'];
var SE_PW_MIN = 8;              /* shortest key a secured network accepts */

var airSeq = 0;
function mkAP(o) {
    return {
        id: ++airSeq,
        ssid: o.ssid,
        sec: o.sec || 'None',
        pw: o.pw || '',
        bars: o.bars === undefined ? 3 : o.bars,   /* 0..3, what the arcs show */
        hidden: !!o.hidden,                        /* off the scan list; joinable by name */
        up: o.up === undefined ? true : !!o.up     /* the router is actually powered */
    };
}
/* the networks in the reference photographs, so the app boots looking
   like the shots it was traced from */
/* The two named in ref_pic/setup/ plus the band the same router puts
   out, so Setup and Settings > Wi-Fi are looking at one list. */
var AIR = [
    mkAP({ ssid: 'Wifi', sec: 'WPA2', pw: '12345678', bars: 3 }),
];

var wifi = {
    on: true,
    ask: true,
    joined: null,          /* AP id */
    joining: null,         /* { id, ssid } while the join is in flight */
    known: {}              /* ssid -> config, everything this iPod remembers */
};

function seCfg(ssid) {
    if (!wifi.known[ssid]) {
        wifi.known[ssid] = {
            saved: false, pw: '',
            ip: { mode: 'DHCP', addr: '', mask: '', router: '', dns: '', search: '', cid: '' },
            proxy: { mode: 'Off', server: '', port: '', auth: false, user: '', pw: '', url: '' }
        };
    }
    return wifi.known[ssid];
}
function apById(id) {
    for (var i = 0; i < AIR.length; i++) if (AIR[i].id === id) return AIR[i];
    return null;
}
function apByName(n) {
    for (var i = 0; i < AIR.length; i++) if (AIR[i].ssid === n) return AIR[i];
    return null;
}
function joinedAP() { return wifi.joined ? apById(wifi.joined) : null; }

/* the address the router hands out; regenerated on every fresh join so
   the numbers on the detail page belong to this association */
function seLease(ap) {
    var n = 100 + (ap.id % 50);
    return {
        addr: '192.168.0.' + n, mask: '255.255.255.0',
        router: '192.168.0.1', dns: '192.168.0.1, 0.0.0.0'
    };
}

/* ---- svg bits ------------------------------------------------------- */
var SE_CHEV = '<svg class="se-chev" width="9" height="15" viewBox="0 0 9 15"><path d="M1 1l6.4 6.5L1 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var SE_CHECK = '<svg width="15" height="12" viewBox="0 0 15 12"><path d="M1.4 6.2 5.4 10.4 13.4 1.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/* a spanner, for the one row that is not part of the device */
var SE_DEV_ICON = '<svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true">' +
    '<path d="M13.1 1.2a5.6 5.6 0 00-5 8.1L1.6 15.8a1.8 1.8 0 002.6 2.6l6.5-6.5a5.6 5.6 0 007-7.3l-2.9 2.9-2.4-.6-.6-2.4z" ' +
    'fill="currentColor"/></svg>';
var SE_LOCK = '<svg width="8" height="11" viewBox="0 0 8 11" style="display:block"><path d="M2 4.6V3a2 2 0 014 0v1.6" fill="none" stroke="currentColor" stroke-width="1.1"/><rect x="0.4" y="4.4" width="7.2" height="6.2" rx="1" fill="currentColor"/></svg>';
var SE_INFO = '<svg width="22" height="22" viewBox="0 0 22 22" style="display:block"><circle cx="11" cy="11" r="10" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="11" cy="5.9" r="1.15" fill="currentColor"/><path d="M11 9.2v7.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
var SE_SPIN = (function () {
    var h = '';
    for (var i = 0; i < 12; i++) {
        h += '<i style="transform:rotate(' + (i * 30) + 'deg);opacity:' + (0.18 + i * 0.068).toFixed(3) + '"></i>';
    }
    return '<span class="se-spin">' + h + '</span>';
})();
function seBars(n) {
    return '<span class="se-bars b' + n + '">' +
        '<svg width="15" height="11" viewBox="0 0 16 12" style="display:block">' +
        '<path class="w1" d="M8 10.6 6.1 8.5a2.9 2.9 0 013.8 0z" fill="currentColor"/>' +
        '<path class="w2" d="M3.4 5.9a6.7 6.7 0 019.2 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path class="w3" d="M1 3.2a10.2 10.2 0 0114 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
        '</svg></span>';
}
function seSwitch(on, key) {
    return '<div class="sw' + (on ? ' on' : '') + '" data-sw="' + key + '"><i></i></div>';
}
function seCaret() { return '<span class="se-caret"></span>'; }

/* ---- the status bar glyph ------------------------------------------- */
/* iOS only shows the arcs while it is actually associated, and dims the
   outer ones when the signal is poor -- both are true here now. */
function seSyncGlyph() {
    var ap = joinedAP(), on = wifi.on && !!ap;
    var cls = 'sb-wifi' + (on ? ' on b' + Math.max(1, ap.bars) : '');
    var els = document.querySelectorAll('.sb-wifi');
    for (var i = 0; i < els.length; i++) els[i].setAttribute('class', cls);
}

/* ================= root ================= */
var seQuery = '', seSearching = false;

/* everything the search field can find. Only the rows that exist are
   listed -- adding a screen means adding its rows here. */
var SE_INDEX = [
    /* Airplane Mode is a switch on the root list itself, so its hit has
       nowhere to push to -- dismissing the search is the whole journey */
    { n: 'Airplane Mode', path: '', go: function () { }, icon: 'air' },
    { n: 'Wi-Fi', path: '', go: function () { seOpenWifi(); }, icon: 'wifi' },
    { n: 'Ask to Join Networks', path: 'Wi-Fi', go: function () { seOpenWifi(); } },
    { n: 'Other Network', path: 'Wi-Fi', go: function () { seOpenWifi(); } },
    { n: 'Bluetooth', path: '', go: function () { btOpen(); }, icon: 'bt' },
    { n: 'Developer', path: '', go: function () { devOpen(); }, icon: 'dev' },
    { n: 'Full Screen', path: 'Developer', go: function () { devOpen(); } },
    { n: 'Home Button', path: 'Developer', go: function () { devOpen(); } },
    { n: 'Side Buttons', path: 'Developer', go: function () { devOpen(); } },
    { n: 'Power', path: 'Developer', go: function () { devOpen(); } },
    { n: 'Battery Condition', path: 'Developer', go: function () { devOpen(); } },
    { n: 'Photo Library', path: 'Developer', go: function () { devOpen(); } },
    { n: 'Wi-Fi Networks', path: 'Developer', go: function () { devOpen(); } },
    { n: 'Bluetooth Devices', path: 'Developer', go: function () { devOpen(); } }
];

var SE_WIFI_ICON = '<svg width="19" height="14" viewBox="0 0 20 14"><path d="M10 12.9 7.5 10.2a3.6 3.6 0 015 0z" fill="currentColor"/><path d="M4.4 6.7a8.4 8.4 0 0111.2 0" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M1.3 3.3a13 13 0 0117.4 0" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
var SE_BT_ICON = '<svg width="11" height="16" viewBox="0 0 8 12"><path d="M1.4 3.6 6.6 8.4 4 11V1l2.6 2.6L1.4 8.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var SE_AIR_ICON = '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M22 15.2 13.6 10V3.8a1.6 1.6 0 10-3.2 0V10L2 15.2v2.2l8.4-2.6v4.4l-2.6 1.7v1.5l4.2-1.1 4.2 1.1v-1.5l-2.6-1.7v-4.4l8.4 2.6z" fill="currentColor"/></svg>';
var SE_ICONS = { wifi: SE_WIFI_ICON, bt: SE_BT_ICON, air: SE_AIR_ICON, dev: SE_DEV_ICON };

function seWifiValue() {
    if (!wifi.on) return 'Off';
    var ap = joinedAP();
    return ap ? ap.ssid : 'Not Connected';
}

function seRenderRoot() {
    if (seSearching && seQuery.trim()) { seRenderHits(); return; }
    $('seRootBody').innerHTML =
        '<div class="se-gap"></div>' +
        '<div class="se-grp">' +
        '<div class="se-cell">' +
        '<span class="se-icon air">' + SE_AIR_ICON + '</span>' +
        '<span class="se-name">Airplane Mode</span>' +
        seSwitch(airplane.on, 'air') +
        '</div>' +
        '<div class="se-cell tap" data-go="wifi">' +
        '<span class="se-icon wifi">' + SE_WIFI_ICON + '</span>' +
        '<span class="se-name">Wi-Fi</span>' +
        '<span class="se-val">' + esc(seWifiValue()) + '</span>' + SE_CHEV +
        '</div>' +
        '<div class="se-cell tap" data-go="bt">' +
        '<span class="se-icon bt">' + SE_BT_ICON + '</span>' +
        '<span class="se-name">Bluetooth</span>' +
        '<span class="se-val">' + (bt.on ? 'On' : 'Off') + '</span>' + SE_CHEV +
        '</div></div>' +
        /* everything outside the fiction, kept at the bottom where iOS
           keeps its own Developer menu */
        '<div class="se-gap"></div>' +
        '<div class="se-grp">' +
        '<div class="se-cell tap" data-go="dev">' +
        '<span class="se-icon dev">' + SE_DEV_ICON + '</span>' +
        '<span class="se-name">Developer</span>' + SE_CHEV +
        '</div></div>';
}

function seRenderHits() {
    var q = seQuery.trim().toLowerCase();
    var hits = SE_INDEX.filter(function (r) { return r.n.toLowerCase().indexOf(q) >= 0; });
    if (!hits.length) { $('seRootBody').innerHTML = ''; return; }
    $('seRootBody').innerHTML = '<div class="se-grp">' + hits.map(function (r, i) {
        return '<div class="se-cell se-hit tap" data-hit="' + i + '">' +
            (r.icon ? '<span class="se-icon ' + r.icon + '">' + SE_ICONS[r.icon] + '</span>' : '') +
            '<span class="se-hitwrap"><div>' + esc(r.n) + '</div>' +
            (r.path ? '<div class="se-hitpath">' + esc(r.path) + ' → ' + esc(r.n) + '</div>' : '') +
            '</span></div>';
    }).join('') + '</div>';
    seHits = hits;
}
var seHits = [];

$('seRootBody').addEventListener('click', function (e) {
    var hit = e.target.closest('[data-hit]');
    if (hit) { var r = seHits[+hit.dataset.hit]; seEndSearch(); if (r) r.go(); return; }
    if (e.target.closest('[data-sw]')) { seSetAirplane(!airplane.on); return; }
    var go = e.target.closest('[data-go]');
    if (!go) return;
    if (go.dataset.go === 'wifi') seOpenWifi();
    else if (go.dataset.go === 'bt') btOpen();
    else if (go.dataset.go === 'dev') devOpen();
});

/* ---- search ---- */
function seSyncSearch() {
    var w = $('seSearchWrap');
    w.classList.toggle('searching', seSearching);
    w.classList.toggle('hastext', !!seQuery);
    $('se-root').classList.toggle('searching', seSearching);
    /* the list only greys out while the field is focused and empty */
    $('se-root').classList.toggle('dimmed', seSearching && !seQuery.trim());
    $('seSearchText').innerHTML = seQuery
        ? '<span class="q">' + esc(seQuery) + '</span>'
        : (seSearching ? '<span class="q" style="color:#C7C7CC">Settings</span>' : 'Settings');
}
function seBeginSearch() {
    if (seSearching) return;
    seSearching = true; seQuery = '';
    kbSE.layout = 'letters'; drawKeys(kbSE);
    seSyncSearch(); seRenderRoot(); openKB(kbSE);
}
function seEndSearch() {
    if (!seSearching) return;
    seSearching = false; seQuery = '';
    closeKB(kbSE); seSyncSearch(); seRenderRoot();
    $('seRootBody').scrollTop = 0;
}
$('seSearchField').addEventListener('click', function (e) {
    if (e.target.closest('.se-sclear')) { seQuery = ''; seSyncSearch(); seRenderRoot(); return; }
    seBeginSearch();
});
$('seSearchCancel').addEventListener('click', seEndSearch);
$('seDimmer').addEventListener('click', seEndSearch);

/* ================= Wi-Fi ================= */
function seOpenWifi() {
    seRenderWifi();
    push($('se-root'), $('se-wifi'));
}
$('seWBack').addEventListener('click', function () {
    pop($('se-wifi'), $('se-root'));
    seRenderRoot();
});

/* the networks the scan can see: up, not hidden, not the one already
   joined (that one has moved to the top group) */
function seScan() {
    return AIR.filter(function (a) {
        return a.up && !a.hidden && a.id !== wifi.joined &&
            !(wifi.joining && a.id === wifi.joining.id);
    });
}

function seNetRow(ap, lead) {
    return '<div class="se-cell net tap" data-ap="' + ap.id + '">' +
        '<span class="se-gutter">' + (lead || '') + '</span>' +
        '<span class="se-name">' + esc(ap.ssid) + '</span>' +
        (ap.sec === 'None' ? '' : '<span class="se-lock">' + SE_LOCK + '</span>') +
        seBars(ap.bars) +
        '<span class="se-info" data-info="' + ap.id + '">' + SE_INFO + '</span>' +
        '</div>';
}

function seRenderWifi() {
    var h = '<div class="se-gap"></div><div class="se-grp">' +
        '<div class="se-cell swrow"><span class="se-name">Wi-Fi</span>' +
        seSwitch(wifi.on, 'wifi') + '</div>';

    /* the network being joined, or the one that is, rides in the same
       group as the switch */
    if (wifi.on && wifi.joining) {
        var j = apById(wifi.joining.id);
        if (j) h += seNetRow(j, SE_SPIN);
    } else if (wifi.on && wifi.joined) {
        var c = joinedAP();
        if (c) h += seNetRow(c, SE_CHECK);
    }
    h += '</div>';

    if (wifi.on) {
        h += '<div class="se-hdr"><span>CHOOSE A NETWORK…</span>' + SE_SPIN + '</div>' +
            '<div class="se-grp">' +
            seScan().map(function (a) { return seNetRow(a); }).join('') +
            '<div class="se-cell net tap" data-other="1"><span class="se-name">Other…</span></div>' +
            '</div>' +
            '<div class="se-gap"></div><div class="se-grp">' +
            '<div class="se-cell"><span class="se-name">Ask to Join Networks</span>' +
            seSwitch(wifi.ask, 'ask') + '</div></div>' +
            '<div class="se-ftr">Known networks will be joined automatically. If no known ' +
            'networks are available, you will have to manually select a network.</div>';
    }
    $('seWifiBody').innerHTML = h;
}

$('seWifiBody').addEventListener('click', function (e) {
    var sw = e.target.closest('[data-sw]');
    if (sw) {
        if (sw.dataset.sw === 'wifi') seSetRadio(!wifi.on);
        else { wifi.ask = !wifi.ask; seRenderWifi(); }
        return;
    }
    var info = e.target.closest('[data-info]');
    if (info) { seOpenNet(+info.dataset.info); return; }
    if (e.target.closest('[data-other]')) { seOpenOther(); return; }
    var row = e.target.closest('[data-ap]');
    if (row) {
        var id = +row.dataset.ap;
        if (id === wifi.joined || (wifi.joining && id === wifi.joining.id)) return;
        seTapJoin(apById(id));
    }
});

function seSetRadio(on) {
    wifi.on = on;
    if (!on) { seCancelJoin(); wifi.joined = null; }
    ccSyncTile('wifi', on);
    seAfterChange();
}

/* Control Center is a second switch onto the same radios, so every
   path that moves one has to carry its tile along */
function ccSyncTile(k, on) {
    for (var i = 0; i < TOGGLES.length; i++) {
        if (TOGGLES[i].k === k && TOGGLES[i].on !== on) {
            TOGGLES[i].on = on;
            var el = $('ccToggles').children[i];
            if (el) {
                el.classList.toggle('on', on);
                el.style.color = on ? '#000' : 'rgba(0,0,0,.72)';
            }
        }
    }
}

/* ================= Airplane Mode ================= */
/* One switch over both radios. iOS remembers what was up when the
   aeroplane went on and puts it back on the way down; turning a radio
   back on by hand mid-flight is allowed, and leaves the switch alone. */
var airplane = { on: false };
var airStash = null;

/* The carrier slot: an iPod has no carrier to name, so airplane mode
   takes the whole slot the way iOS does on Wi-Fi-only hardware. The
   glyph is traced pixel for pixel off ref_pic/airplane mode.PNG: a
   blunt-nosed fuselage lying on its side pointing right, wings swept
   back off it and the tailplane forked at the far left. 24x22 of
   viewBox is 12x11pt, which is what the shot measures.

   It flies: in from off the left edge when the switch goes up, out to
   the right and away when it comes down, and the carrier name only
   comes back once the aeroplane has left. One span per status bar,
   planted once at boot -- the left half of the bar is static markup. */
var SB_AIR = '<span class="sb-air"><svg width="12" height="11" viewBox="0 0 24 22" aria-hidden="true" style="display:block">' +
    '<g fill="currentColor">' +
    '<path d="M0 9h22.3a1.7 1.7 0 010 4H0z"/>' +
    '<path d="M5 0h1.6l9.2 10H8.6z"/>' +
    '<path d="M5 22h1.6l9.2-10H8.6z"/>' +
    '<path d="M0 5.2 4.4 10H0z"/>' +
    '<path d="M0 16.8 4.4 12H0z"/>' +
    '</g></svg></span>';

(function () {
    var els = document.querySelectorAll('.sb-left');
    for (var i = 0; i < els.length; i++) els[i].insertAdjacentHTML('afterbegin', SB_AIR);
})();

var seAirTimer = null;
var SE_AIR_FLIGHT = 430;    /* just past the transform's .42s */

function seAirBars() { return document.querySelectorAll('.sb-left'); }
function seAirSet(add, drop) {
    var els = seAirBars();
    for (var i = 0; i < els.length; i++) {
        if (drop) els[i].classList.remove.apply(els[i].classList, drop);
        if (add) els[i].classList.add.apply(els[i].classList, add);
    }
}

/* anim is for the switch being thrown; boot and app resets land the
   bar in its final state without taxiing anything across it */
function seSyncCarrier(anim) {
    clearTimeout(seAirTimer); seAirTimer = null;

    if (airplane.on) {
        seAirSet(['flying'], ['away']);
        if (!anim) { seAirSet(['aloft']); return; }
        /* one frame parked off the edge, so the transition has an
           elsewhere to come from -- display:none has no 'before' */
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { if (airplane.on) seAirSet(['aloft']); });
        });
        return;
    }

    if (!anim) { seAirSet(null, ['flying', 'aloft', 'away']); return; }
    seAirSet(['away'], ['aloft']);
    seAirTimer = setTimeout(function () {
        seAirTimer = null;
        if (!airplane.on) seAirSet(null, ['flying', 'aloft', 'away']);
    }, SE_AIR_FLIGHT);
}

function seSetAirplane(on) {
    airplane.on = on;
    if (on) {
        /* it puts back what it took, so the association goes into the
           stash with the radio -- otherwise the arcs and the rune never
           come back and the bar lands short of where it started */
        airStash = { wifi: wifi.on, bt: bt.on, joined: wifi.joined, conn: bt.connected };
        if (wifi.on) seSetRadio(false);
        if (bt.on) btSetRadio(false);
    } else if (airStash) {
        var was = airStash; airStash = null;
        if (was.wifi) {
            seSetRadio(true);
            /* only if that network is still out there and still up */
            var ap = was.joined ? apById(was.joined) : null;
            if (ap && ap.up) wifi.joined = ap.id;
        }
        if (was.bt) {
            btSetRadio(true);
            var d = was.conn ? bdByName(was.conn) : null;
            if (d && d.up) bt.connected = was.conn;
        }
    }
    ccSyncTile('air', on);
    seSyncCarrier(true);
    seAfterChange();
    btAfterChange();
}

/* Every path that can change the radio ends here. keepPanel is for
   changes made in the panel itself: repainting it under a field that
   is being typed or dragged in would rip the control out from under
   the pointer, so those callers repaint the device only. */
function seAfterChange(keepPanel) {
    seSyncGlyph();
    seRenderWifi();
    seRenderRoot();
    if (!keepPanel) seRenderFW();
    if ($('se-net').classList.contains('active') || $('se-net').classList.contains('behind')) seRenderNet();
}

/* ---- joining -------------------------------------------------------- */
var seJoinTimer = null;

function seCancelJoin() {
    clearTimeout(seJoinTimer); seJoinTimer = null; wifi.joining = null;
}

/* tapping a row in the list: an open network goes straight in, a known
   one reuses its saved password, anything else asks */
function seTapJoin(ap) {
    if (!ap) return;
    var cfg = seCfg(ap.ssid);
    if (ap.sec === 'None') return seAttempt(ap, '', null);
    if (cfg.saved && cfg.pw) return seAttempt(ap, cfg.pw, null);
    seOpenPassword(ap);
}

/* pw is what the device offers; ctx is the modal to report back into,
   or null when the attempt came straight off the list */
function seAttempt(ap, pw, ctx) {
    seCancelJoin();
    wifi.joined = null;
    wifi.joining = { id: ap.id, ssid: ap.ssid };
    if (ctx) { seJBusy(true); seJPrompt('Joining “' + ap.ssid + '”…'); }
    seAfterChange();
    seJoinTimer = setTimeout(function () {
        seJoinTimer = null;
        var fail = null;
        if (!ap.up) fail = 'Unable to join the network\n“' + ap.ssid + '”';
        else if (ap.sec !== 'None' && pw !== ap.pw) fail = 'Incorrect password for\n“' + ap.ssid + '”';
        wifi.joining = null;
        if (fail) {
            if (ctx) { seJBusy(false); seJPrompt('Failed to join “' + ap.ssid + '”'); }
            seAfterChange();
            seAlert(fail, '', [{ n: 'Dismiss' }]);
            return;
        }
        var cfg = seCfg(ap.ssid);
        cfg.saved = true; cfg.pw = pw;
        ap.lease = seLease(ap);
        wifi.joined = ap.id;
        if (ctx) seCloseJoin();
        seAfterChange();
    }, 1500);
}

/* ================= one network ================= */
var seNetId = null, seField = null;   /* seField: which text row has the caret */

function seOpenNet(id) {
    seNetId = id; seField = null;
    seRenderNet();
    push($('se-wifi'), $('se-net'));
}
$('seNBack').addEventListener('click', function () {
    seBlurField();
    pop($('se-net'), $('se-wifi'));
    seNetId = null;
});

var IP_MODES = ['DHCP', 'BootP', 'Static'];
var PROXY_MODES = ['Off', 'Manual', 'Auto'];

function seSeg(modes, cur, key) {
    return '<div class="se-seg"><div class="se-segs">' + modes.map(function (m) {
        return '<div class="' + (m === cur ? 'on' : '') + '" data-seg="' + key + '" data-v="' +
            m + '">' + m + '</div>';
    }).join('') + '</div></div>';
}

/* one editable text row: label left, value right, caret while focused */
function seFieldRow(key, label, val, ph) {
    var on = seField === key;
    return '<div class="se-cell tap" data-field="' + key + '">' +
        '<span class="se-name">' + label + '</span>' +
        (val ? '<span class="se-val ink">' + esc(val) + '</span>' : (ph ? '<span class="se-val">' + esc(ph) + '</span>' : '')) +
        (on ? seCaret() : '') + '</div>';
}

function seRenderNet() {
    var ap = apById(seNetId); if (!ap) return;
    var cfg = seCfg(ap.ssid), joined = wifi.joined === ap.id;
    $('seNTitle').textContent = ap.ssid;

    /* DHCP and BootP show what the router handed over; Static shows
       whatever has been typed in */
    var L = (joined && ap.lease) ? ap.lease : { addr: '', mask: '', router: '', dns: '' };
    var auto = cfg.ip.mode !== 'Static';
    var v = {
        addr: auto ? (cfg.ip.addr || L.addr) : cfg.ip.addr,
        mask: auto ? (cfg.ip.mask || L.mask) : cfg.ip.mask,
        router: auto ? (cfg.ip.router || L.router) : cfg.ip.router,
        dns: auto ? (cfg.ip.dns || L.dns) : cfg.ip.dns
    };

    var h = '<div class="se-gap"></div><div class="se-grp">';
    h += cfg.saved
        ? '<div class="se-cell blue tap" data-act="forget">Forget This Network</div>'
        : '<div class="se-cell blue tap" data-act="join">Join Network</div>';
    h += '</div>';

    h += '<div class="se-hdr"><span>IP ADDRESS</span></div><div class="se-grp">' +
        seSeg(IP_MODES, cfg.ip.mode, 'ip') +
        seFieldRow('addr', 'IP Address', v.addr) +
        seFieldRow('mask', 'Subnet Mask', v.mask) +
        seFieldRow('router', 'Router', v.router) +
        seFieldRow('dns', 'DNS', v.dns) +
        seFieldRow('search', 'Search Domains', cfg.ip.search) +
        (cfg.ip.mode === 'DHCP' ? seFieldRow('cid', 'Client ID', cfg.ip.cid) : '') +
        '</div>';

    if (cfg.ip.mode === 'DHCP' && joined) {
        h += '<div class="se-gap"></div><div class="se-grp">' +
            '<div class="se-cell blue tap" data-act="renew">Renew Lease</div></div>';
    }

    h += '<div class="se-hdr"><span>HTTP PROXY</span></div><div class="se-grp">' +
        seSeg(PROXY_MODES, cfg.proxy.mode, 'proxy');
    if (cfg.proxy.mode === 'Manual') {
        h += seFieldRow('server', 'Server', cfg.proxy.server) +
            seFieldRow('port', 'Port', cfg.proxy.port) +
            '<div class="se-cell"><span class="se-name">Authentication</span>' +
            seSwitch(cfg.proxy.auth, 'pauth') + '</div>';
        if (cfg.proxy.auth) {
            h += seFieldRow('puser', 'Username', cfg.proxy.user) +
                seFieldRow('ppw', 'Password', cfg.proxy.pw);
        }
    } else if (cfg.proxy.mode === 'Auto') {
        h += seFieldRow('url', 'URL', cfg.proxy.url);
    }
    h += '</div><div style="height:35px"></div>';
    $('seNetBody').innerHTML = h;
}

$('seNetBody').addEventListener('click', function (e) {
    var ap = apById(seNetId); if (!ap) return;
    var cfg = seCfg(ap.ssid);

    var seg = e.target.closest('[data-seg]');
    if (seg) {
        seBlurField();
        if (seg.dataset.seg === 'ip') cfg.ip.mode = seg.dataset.v;
        else cfg.proxy.mode = seg.dataset.v;
        seRenderNet(); return;
    }
    var sw = e.target.closest('[data-sw]');
    if (sw) { cfg.proxy.auth = !cfg.proxy.auth; seRenderNet(); return; }

    var f = e.target.closest('[data-field]');
    if (f) { seFocusField(f.dataset.field); return; }

    var act = e.target.closest('[data-act]');
    if (!act) return;
    seBlurField();
    if (act.dataset.act === 'renew') { $('seSheet').classList.add('up'); return; }
    if (act.dataset.act === 'join') { pop($('se-net'), $('se-wifi')); seNetId = null; seTapJoin(ap); return; }
    if (act.dataset.act === 'forget') {
        seAlert('Forget Wi-Fi Network\n“' + ap.ssid + '” ?',
            'Your iPod will no longer join this Wi-Fi network.',
            [{ n: 'Cancel' }, {
                n: 'Forget', fn: function () {
                    delete wifi.known[ap.ssid];
                    if (wifi.joined === ap.id) wifi.joined = null;
                    pop($('se-net'), $('se-wifi'));
                    seNetId = null;
                    seAfterChange();
                }
            }]);
    }
});

/* ---- the text rows on the detail page ---- */
var IP_FIELDS = { addr: 1, mask: 1, router: 1, dns: 1, port: 1 };
function seFocusField(key) {
    seField = key;
    kbSEN.layout = IP_FIELDS[key] ? 'numbers' : 'letters';
    kbSEN.shift = 'off';
    drawKeys(kbSEN);
    seRenderNet();
    openKB(kbSEN);
}
function seBlurField() {
    if (!seField) return;
    seField = null; closeKB(kbSEN); seRenderNet();
}

function seFieldGet() {
    var ap = apById(seNetId); if (!ap || !seField) return '';
    var cfg = seCfg(ap.ssid), k = seField;
    if (k === 'search' || k === 'cid') return cfg.ip[k];
    if (k === 'addr' || k === 'mask' || k === 'router' || k === 'dns') {
        if (cfg.ip[k]) return cfg.ip[k];
        var L = (wifi.joined === ap.id && ap.lease) ? ap.lease : null;
        return (cfg.ip.mode !== 'Static' && L) ? L[k] : '';
    }
    if (k === 'server' || k === 'port' || k === 'url') return cfg.proxy[k];
    if (k === 'puser') return cfg.proxy.user;
    if (k === 'ppw') return cfg.proxy.pw;
    return '';
}
function seFieldSet(val) {
    var ap = apById(seNetId); if (!ap || !seField) return;
    var cfg = seCfg(ap.ssid), k = seField;
    if (k === 'puser') cfg.proxy.user = val;
    else if (k === 'ppw') cfg.proxy.pw = val;
    else if (k === 'server' || k === 'port' || k === 'url') cfg.proxy[k] = val;
    else cfg.ip[k] = val;
    seRenderNet();
}

/* ---- Renew Lease --------------------------------------------------- */
$('seSheetCancel').addEventListener('click', function () { $('seSheet').classList.remove('up'); });
$('seRenewGo').addEventListener('click', function () {
    $('seSheet').classList.remove('up');
    var ap = apById(seNetId);
    if (ap && wifi.joined === ap.id) { ap.lease = seLease(ap); seRenderNet(); }
});

/* ================= Enter Password / Other Network ================= */
/* one sheet does both jobs: 'pw' asks a known SSID for its key, 'other'
   asks for the name as well, and hands the pair to the same attempt. */
var seJMode = null, seJAP = null, seJName = '', seJPw = '', seJSec = 'None', seJFocus = null;

function seJPrompt(t) { $('seJPrompt').textContent = t; }
function seJBusy(on) {
    $('seJCancel').classList.toggle('dim', on);
    $('se-join').classList.toggle('busy', on);
    if (on) { seJFocus = null; closeKB(kbSEJ); }
    seSyncJoinBtn();
}

function seOpenPassword(ap) {
    seJMode = 'pw'; seJAP = ap; seJPw = ''; seJFocus = 'pw';
    $('seJTitle').textContent = 'Enter Password';
    seJPrompt('Enter the password for “' + ap.ssid + '”');
    seRenderJoin();
    $('se-join').classList.add('active');
    seJKeyboard();
    openKB(kbSEJ);
}
function seOpenOther() {
    seJMode = 'other'; seJAP = null; seJName = ''; seJPw = ''; seJSec = 'None'; seJFocus = 'name';
    $('seJTitle').textContent = 'Other Network';
    seJPrompt('Enter network information');
    seRenderJoin();
    $('se-join').classList.add('active');
    seJKeyboard();
    openKB(kbSEJ);
}
function seCloseJoin() {
    seJBusy(false);
    closeKB(kbSEJ);
    $('se-join').classList.remove('active');
    $('se-sec').classList.remove('active');
    $('se-join').classList.remove('sebehind');
    seJMode = null; seJAP = null; seJFocus = null;
}
$('seJCancel').addEventListener('click', function () {
    seCancelJoin();
    seCloseJoin();
    seAfterChange();
});

function seJoinReady() {
    if (seJMode === 'other') {
        if (!seJName.trim()) return false;
        return seJSec === 'None' || seJPw.length >= SE_PW_MIN;
    }
    return seJPw.length >= SE_PW_MIN;
}
/* the Join key lights at both ends -- nav bar and the return key -- and
   only gets redrawn when it actually changes state */
var seJoinLit = null;
function seSyncJoinBtn() {
    var ok = seJoinReady() && !$('se-join').classList.contains('busy');
    $('seJJoin').classList.toggle('dim', !ok);
    if (ok === seJoinLit) return;
    seJoinLit = ok;
    kbSEJ.retDim = !ok; kbSEJ.retGo = ok;
    drawKeys(kbSEJ);
}

/* text, then the caret, then the placeholder the caret sits in front of
   while the field is still empty -- the way the shots show it */
function seEntry(val, focused, ph) {
    return '<span class="se-field">' + (val || '') +
        (focused ? seCaret() : '') +
        (!val && ph ? '<span class="se-ph">' + ph + '</span>' : '') + '</span>';
}

function seRenderJoin() {
    var h = '<div class="se-gap"></div>';
    if (seJMode === 'other') {
        h += '<div class="se-grp"><div class="se-cell tap" data-jf="name">' +
            '<span class="se-elabel">Name</span>' +
            seEntry(esc(seJName), seJFocus === 'name', 'Network Name') +
            '</div></div>';
        h += '<div class="se-gap"></div><div class="se-grp">' +
            '<div class="se-cell tap" data-jf="sec"><span class="se-name">Security</span>' +
            '<span class="se-val">' + seJSec + '</span>' + SE_CHEV + '</div>';
        if (seJSec !== 'None') {
            h += '<div class="se-cell tap" data-jf="pw"><span class="se-elabel">Password</span>' +
                seEntry(sePwDots(seJPw), seJFocus === 'pw', '') + '</div>';
        }
        h += '</div>';
    } else {
        h += '<div class="se-grp"><div class="se-cell tap" data-jf="pw">' +
            '<span class="se-elabel">Password</span>' +
            seEntry(sePwDots(seJPw), seJFocus === 'pw', '') + '</div></div>';
    }
    $('seJoinBody').innerHTML = h;
    seSyncJoinBtn();
}
function sePwDots(v) {
    return v ? '<span class="se-dots">' + new Array(v.length + 1).join('<i></i>') + '</span>' : '';
}

$('seJoinBody').addEventListener('click', function (e) {
    if ($('se-join').classList.contains('busy')) return;
    var f = e.target.closest('[data-jf]'); if (!f) return;
    var k = f.dataset.jf;
    if (k === 'sec') { seOpenSec(); return; }
    seJFocus = k;
    seJKeyboard();
    seRenderJoin(); openKB(kbSEJ);
});

/* a network name gets its first letter capitalised; a password never
   does -- same rule iOS uses on these two fields */
function seJKeyboard() {
    kbSEJ.layout = 'letters';
    kbSEJ.nocap = seJFocus !== 'name';
    kbSEJ.shift = seJFocus === 'name' ? 'on' : 'off';
    drawKeys(kbSEJ);
}

$('seJJoin').addEventListener('click', seJoinGo);

function seJoinGo() {
    if (!seJoinReady() || $('se-join').classList.contains('busy')) return;
    if (seJMode === 'pw') return seAttempt(seJAP, seJPw, 'modal');

    /* joining by name: the radio has to actually find something out
       there answering to it, with the security it was told to expect */
    var name = seJName.trim(), ap = apByName(name);
    seJBusy(true);
    seJPrompt('Joining “' + name + '”…');
    clearTimeout(seJoinTimer);
    seJoinTimer = setTimeout(function () {
        seJoinTimer = null;
        if (!ap || !ap.up) {
            seJBusy(false);
            seJPrompt('Failed to join “' + name + '”');
            seAlert('Could not find the network\n“' + name + '”', '', [{ n: 'Dismiss' }]);
            return;
        }
        if (ap.sec !== seJSec) {
            seJBusy(false);
            seJPrompt('Failed to join “' + name + '”');
            seAlert('Unable to join the network\n“' + name + '”', '', [{ n: 'Dismiss' }]);
            return;
        }
        seJBusy(false);
        seAttempt(ap, seJPw, 'modal');
    }, 1500);
}

/* ---- Security picker, pushed over the sheet ---- */
function seOpenSec() {
    closeKB(kbSEJ); seJFocus = null; seRenderJoin();
    seRenderSec();
    $('se-join').classList.add('sebehind');
    $('se-sec').classList.add('active');
}
function seCloseSec() {
    $('se-sec').classList.remove('active');
    $('se-join').classList.remove('sebehind');
}
$('seSBack').addEventListener('click', seCloseSec);

function seRenderSec() {
    $('seSecBody').innerHTML = '<div class="se-gap"></div><div class="se-grp">' +
        SEC_TYPES.map(function (s) {
            return '<div class="se-cell tap" data-sec="' + s + '"><span class="se-name">' + s + '</span>' +
                (s === seJSec ? '<span style="color:#007AFF">' + SE_CHECK + '</span>' : '') + '</div>';
        }).join('') + '</div>';
}
$('seSecBody').addEventListener('click', function (e) {
    var r = e.target.closest('[data-sec]'); if (!r) return;
    seJSec = r.dataset.sec;
    if (seJSec === 'None') seJPw = '';
    seRenderSec();
    seRenderJoin();
    setTimeout(seCloseSec, 120);
});

/* ================= Bluetooth ================= */
/* Traced off ref_pic/Settings/Bluetooth/. ETHER is to this radio what
   AIR is to the other one: the things that physically exist around the
   iPod, owned by the panel outside the screen. The device can only
   discover what is switched on AND in pairing mode out there, and can
   only reconnect to something it has already paired with -- which is
   what makes IMG_2719 happen when you reach for a speaker that is off.

   Everything is keyed by name rather than by an id, because MY DEVICES
   is the iPod's own memory and not a scan: pull a speaker out of the
   world in the panel and its row stays, it just stops answering. */

var ETHER = [];
function mkBD(o) {
    return {
        name: o.name,
        up: o.up === undefined ? true : !!o.up,       /* the thing is powered */
        disc: o.disc === undefined ? true : !!o.disc  /* in pairing mode, so a scan sees it */
    };
}
/* the devices in the reference photographs */
ETHER.push(mkBD({ name: 'BT-41' }), mkBD({ name: 'BT-SPEAKER' }), mkBD({ name: 'WH-CH510' }));

var BT_SELF = 'E-Dog’s iPod';   /* how the iPod advertises itself */
var BT_WAIT = 1500;                  /* the same beat the Wi-Fi join takes */

var bt = {
    on: false,
    connected: null,   /* device name */
    connecting: null,  /* device name, while the connection is in flight */
    paired: []         /* names this iPod remembers, in pairing order */
};

function bdByName(n) {
    for (var i = 0; i < ETHER.length; i++) if (ETHER[i].name === n) return ETHER[i];
    return null;
}
function bdKnown(n) { return bt.paired.indexOf(n) >= 0; }

/* ---- the screen ---- */
function btOpen() {
    btRenderPage();
    push($('se-root'), $('se-bt'));
}
$('seBBack').addEventListener('click', function () {
    pop($('se-bt'), $('se-root'));
    seRenderRoot();
});

/* a remembered device: name, what it is doing, then the info dot. One
   the scan has just found gets neither -- there is nothing to report
   and nothing to configure until it has actually been paired. */
function btMyRow(n) {
    return '<div class="se-cell tap" data-bd="' + escA(n) + '">' +
        '<span class="se-name">' + esc(n) + '</span>' +
        (bt.connecting === n ? SE_SPIN
            : '<span class="se-val">' + (bt.connected === n ? 'Connected' : 'Not Connected') + '</span>') +
        '<span class="se-info" data-bdinfo="' + escA(n) + '">' + SE_INFO + '</span>' +
        '</div>';
}
function btNewRow(n) {
    return '<div class="se-cell tap" data-bd="' + escA(n) + '">' +
        '<span class="se-name">' + esc(n) + '</span>' +
        (bt.connecting === n ? SE_SPIN : '') + '</div>';
}

function btRenderPage() {
    var h = '<div class="se-gap"></div><div class="se-grp">' +
        '<div class="se-cell"><span class="se-name">Bluetooth</span>' +
        seSwitch(bt.on, 'bt') + '</div></div>';

    if (!bt.on) {
        h += '<div class="se-ftr">Location accuracy and nearby services are ' +
            'improved when Bluetooth is turned on.</div>';
        $('seBtBody').innerHTML = h;
        return;
    }

    h += '<div class="se-ftr">Now discoverable as “' + esc(BT_SELF) + '”.</div>';

    if (bt.paired.length) {
        h += '<div class="se-hdr"><span>MY DEVICES</span></div><div class="se-grp">' +
            bt.paired.map(btMyRow).join('') + '</div>';
    }

    /* the scan never stops, so the header keeps its spinner whether or
       not anything out there is currently answering it */
    var found = ETHER.filter(function (d) { return !bdKnown(d.name) && d.up && d.disc; });
    h += '<div class="se-hdr"><span>DEVICES</span>' + SE_SPIN + '</div>';
    if (found.length) {
        h += '<div class="se-grp">' +
            found.map(function (d) { return btNewRow(d.name); }).join('') + '</div>';
    }
    $('seBtBody').innerHTML = h;
}

$('seBtBody').addEventListener('click', function (e) {
    if (e.target.closest('[data-sw]')) { btSetRadio(!bt.on); return; }
    var info = e.target.closest('[data-bdinfo]');
    if (info) { btOpenDev(info.dataset.bdinfo); return; }
    var row = e.target.closest('[data-bd]');
    if (!row) return;
    var n = row.dataset.bd;
    if (bt.connecting === n) return;
    /* tapping the one that is connected drops it, the way iOS does */
    if (bt.connected === n) { bt.connected = null; btAfterChange(); return; }
    btConnect(n);
});

function btSetRadio(on) {
    bt.on = on;
    if (!on) { btCancel(); bt.connected = null; }
    ccSyncTile('bt', on);
    btAfterChange();
}

/* the twin of seAfterChange. keepPanel is for edits made in the panel
   itself, so a field being typed in is not ripped out from underfoot. */
function btAfterChange(keepPanel) {
    battSync();                 /* the status-bar rune answers to the radio */
    btRenderPage();
    seRenderRoot();
    if (!keepPanel) btRenderFW();
    if ($('se-btdev').classList.contains('active') ||
        $('se-btdev').classList.contains('behind')) btRenderDev();
}

/* ---- connecting ---- */
var btTimer = null;
function btCancel() { clearTimeout(btTimer); btTimer = null; bt.connecting = null; }

function btConnect(n) {
    btCancel();
    bt.connected = null;        /* one at a time, so the old link drops first */
    bt.connecting = n;
    btAfterChange();
    btTimer = setTimeout(function () {
        btTimer = null;
        bt.connecting = null;
        var d = bdByName(n);
        /* gone from the world, or switched off in it -- one sentence
           covers both, and it is the sentence the photograph shows */
        if (!d || !d.up) {
            btAfterChange();
            seAlert('Connection Unsuccessful',
                'Make sure “' + n + '” is turned on and in range.', [{ n: 'OK' }]);
            return;
        }
        if (!bdKnown(n)) bt.paired.push(n);
        bt.connected = n;
        btAfterChange();
    }, BT_WAIT);
}

/* ================= one paired device ================= */
var btDevName = null;

function btOpenDev(n) {
    btDevName = n;
    btRenderDev();
    push($('se-bt'), $('se-btdev'));
}
$('seBDBack').addEventListener('click', function () {
    pop($('se-btdev'), $('se-bt'));
    btDevName = null;
});

function btRenderDev() {
    if (btDevName === null) return;
    $('seBDTitle').textContent = btDevName;
    $('seBDevBody').innerHTML = '<div class="se-gap"></div><div class="se-grp">' +
        '<div class="se-cell blue tap" data-act="forget">Forget This Device</div></div>';
}

$('seBDevBody').addEventListener('click', function (e) {
    if (!e.target.closest('[data-act="forget"]')) return;
    var n = btDevName;
    seAlert('Forget Device\n“' + n + '” ?',
        'Your iPod will no longer connect to this device.',
        [{ n: 'Cancel' }, {
            n: 'Forget', fn: function () {
                btForget(n);
                pop($('se-btdev'), $('se-bt'));
                btDevName = null;
                btAfterChange();
            }
        }]);
});

function btForget(n) {
    var i = bt.paired.indexOf(n);
    if (i >= 0) bt.paired.splice(i, 1);
    if (bt.connected === n) bt.connected = null;
    if (bt.connecting === n) btCancel();
}

/* ================= alert ================= */
var seAlertCb = null;
function seAlert(title, msg, btns) {
    $('seATitle').innerHTML = esc(title).replace(/\n/g, '<br>');
    $('seAMsg').innerHTML = msg ? esc(msg).replace(/\n/g, '<br>') : '';
    $('seAMsg').style.display = msg ? '' : 'none';
    $('seABtns').innerHTML = btns.map(function (b, i) {
        return '<div class="se-abtn" data-i="' + i + '">' + esc(b.n) + '</div>';
    }).join('');
    seAlertCb = btns;
    $('seAlert').classList.add('up');
}
$('seABtns').addEventListener('click', function (e) {
    var b = e.target.closest('.se-abtn'); if (!b || !seAlertCb) return;
    var spec = seAlertCb[+b.dataset.i];
    $('seAlert').classList.remove('up');
    seAlertCb = null;
    if (spec && spec.fn) spec.fn();
});

/* ================= keyboards ================= */
var kbSE = buildKeyboard($('kbSE'), { target: 'sesearch', nopred: true, nocap: true, retLabel: 'Search', retDim: true });
var kbSEJ = buildKeyboard($('kbSEJ'), { target: 'sejoin', nopred: true, nocap: true, retLabel: 'Join', retDim: true });
var kbSEN = buildKeyboard($('kbSEN'), { target: 'sefield', nopred: true, nocap: true, retLabel: 'return' });

/* ================= the fourth wall ================= */
/* The panel is the air. Everything the Wi-Fi screen can do depends on
   what is switched on out here, which is the whole point of it. */
/* esc() leaves quotes alone, and an SSID typed out here goes straight
   back into a value="" attribute */
function escA(s) { return esc(s).replace(/"/g, '&quot;'); }

function seRenderFW() {
    var live = AIR.filter(function (a) { return a.up; }).length;
    $('fwNetCount').textContent = live;
    var st = $('fwNetState');
    if (!wifi.on) { st.textContent = 'Radio off'; st.className = 'fw-state draining'; }
    else if (wifi.joining) { st.textContent = 'Joining'; st.className = 'fw-state draining'; }
    else if (wifi.joined) { st.textContent = 'Joined'; st.className = 'fw-state'; }
    else { st.textContent = 'Not joined'; st.className = 'fw-state draining'; }

    $('fwNets').innerHTML = AIR.map(function (a, i) {
        return '<div class="fw-net' + (wifi.joined === a.id ? ' joined' : '') + '" data-i="' + i + '">' +
            '<div class="fw-nrow">' +
            '<input type="text" data-k="ssid" value="' + escA(a.ssid) + '" spellcheck="false">' +
            '<button type="button" class="fw-nkill" data-k="kill" title="Remove">×</button>' +
            '</div>' +
            '<div class="fw-nrow">' +
            '<select data-k="sec">' + SEC_TYPES.map(function (s) {
                return '<option' + (s === a.sec ? ' selected' : '') + '>' + s + '</option>';
            }).join('') + '</select>' +
            '<input type="text" data-k="pw" value="' + escA(a.pw) + '" placeholder="password" ' +
            'spellcheck="false"' + (a.sec === 'None' ? ' disabled' : '') +
            (a.sec !== 'None' && a.pw.length < SE_PW_MIN
                ? ' class="short" title="Under ' + SE_PW_MIN + ' characters -- nothing can join this"'
                : '') + '>' +
            '</div>' +
            '<div class="fw-nrow">' +
            '<span class="fw-nlbl w">Signal</span>' +
            '<input type="range" min="0" max="3" step="1" data-k="bars" value="' + a.bars + '">' +
            '<span class="fw-nlbl">' + a.bars + '/3</span>' +
            '</div>' +
            '<div class="fw-nrow">' +
            '<label class="fw-chk"><input type="checkbox" data-k="up"' + (a.up ? ' checked' : '') + '>On air</label>' +
            '<label class="fw-chk"><input type="checkbox" data-k="hidden"' + (a.hidden ? ' checked' : '') + '>Hidden</label>' +
            '</div>' +
            '</div>';
    }).join('');
}

$('fwNets').addEventListener('input', function (e) {
    var box = e.target.closest('.fw-net'); if (!box) return;
    var a = AIR[+box.dataset.i], k = e.target.dataset.k;
    if (k === 'ssid') {
        var old = a.ssid, v = e.target.value;
        if (wifi.known[old]) { wifi.known[v] = wifi.known[old]; delete wifi.known[old]; }
        a.ssid = v;
    } else if (k === 'pw') {
        a.pw = e.target.value;       /* only read at join time */
        e.target.classList.toggle('short',
            a.sec !== 'None' && a.pw.length < SE_PW_MIN);
        return;
    } else if (k === 'bars') {
        a.bars = +e.target.value;
        var lbl = box.querySelectorAll('.fw-nlbl')[1];
        if (lbl) lbl.textContent = a.bars + '/3';
    } else return;
    seAfterChange(true);
});
$('fwNets').addEventListener('change', function (e) {
    var box = e.target.closest('.fw-net'); if (!box) return;
    var a = AIR[+box.dataset.i], k = e.target.dataset.k;
    if (k === 'sec') { a.sec = e.target.value; if (a.sec === 'None') a.pw = ''; }
    else if (k === 'up') a.up = e.target.checked;
    else if (k === 'hidden') a.hidden = e.target.checked;
    else return;
    /* an access point that goes dark or vanishes drops the association */
    if (wifi.joined === a.id && !a.up) wifi.joined = null;
    if (wifi.joining && wifi.joining.id === a.id && !a.up) seCancelJoin();
    seAfterChange();
});
$('fwNets').addEventListener('click', function (e) {
    if (!e.target.closest('[data-k="kill"]')) return;
    var box = e.target.closest('.fw-net');
    var a = AIR[+box.dataset.i];
    if (wifi.joined === a.id) wifi.joined = null;
    if (wifi.joining && wifi.joining.id === a.id) seCancelJoin();
    if (seNetId === a.id && $('se-net').classList.contains('active')) {
        pop($('se-net'), $('se-wifi')); seNetId = null;
    }
    AIR.splice(+box.dataset.i, 1);
    seAfterChange();
});
$('fwNetHead').addEventListener('click', function () {
    $('fwNetHead').classList.toggle('shut');
});

$('fwNetAdd').addEventListener('click', function () {
    AIR.push(mkAP({ ssid: 'Network ' + (AIR.length + 1), sec: 'WPA2', pw: 'password', bars: 2 }));
    seAfterChange();
});

/* ---- the same wall, the other radio -------------------------------- */
/* Two knobs per device, and between them they explain every screen the
   Bluetooth photographs show. "On air" is the thing being powered up:
   drop it and a paired device still lists, it just answers with
   Connection Unsuccessful. "Pairing mode" is what a scan can see, so
   it decides whether an unpaired device shows up under DEVICES. */

function btRenderFW() {
    $('fwBtCount').textContent = ETHER.filter(function (d) { return d.up; }).length;
    var st = $('fwBtState');
    if (!bt.on) { st.textContent = 'Radio off'; st.className = 'fw-state draining'; }
    else if (bt.connecting) { st.textContent = 'Connecting'; st.className = 'fw-state draining'; }
    else if (bt.connected) { st.textContent = 'Connected'; st.className = 'fw-state'; }
    else { st.textContent = 'Not connected'; st.className = 'fw-state draining'; }

    $('fwBts').innerHTML = ETHER.map(function (d, i) {
        return '<div class="fw-net' + (bt.connected === d.name ? ' joined' : '') +
            '" data-i="' + i + '">' +
            '<div class="fw-nrow">' +
            '<input type="text" data-k="name" value="' + escA(d.name) + '" spellcheck="false">' +
            '<button type="button" class="fw-nkill" data-k="kill" title="Remove">×</button>' +
            '</div>' +
            '<div class="fw-nrow">' +
            '<label class="fw-chk"><input type="checkbox" data-k="up"' +
            (d.up ? ' checked' : '') + '>On air</label>' +
            '<label class="fw-chk"><input type="checkbox" data-k="disc"' +
            (d.disc ? ' checked' : '') + '>Pairing mode</label>' +
            (bdKnown(d.name) ? '<span class="fw-nlbl">Paired</span>' : '') +
            '</div>' +
            '</div>';
    }).join('');
}

$('fwBts').addEventListener('input', function (e) {
    var box = e.target.closest('.fw-net'); if (!box) return;
    var d = ETHER[+box.dataset.i];
    if (e.target.dataset.k !== 'name') return;
    /* the iPod follows the rename, the way it does for an SSID */
    var old = d.name, v = e.target.value, ix = bt.paired.indexOf(old);
    if (ix >= 0) bt.paired[ix] = v;
    if (bt.connected === old) bt.connected = v;
    if (bt.connecting === old) bt.connecting = v;
    if (btDevName === old) btDevName = v;
    d.name = v;
    btAfterChange(true);
});

$('fwBts').addEventListener('change', function (e) {
    var box = e.target.closest('.fw-net'); if (!box) return;
    var d = ETHER[+box.dataset.i], k = e.target.dataset.k;
    if (k === 'up') d.up = e.target.checked;
    else if (k === 'disc') d.disc = e.target.checked;
    else return;
    /* a device that goes dark drops whatever it was holding */
    if (!d.up) {
        if (bt.connected === d.name) bt.connected = null;
        if (bt.connecting === d.name) btCancel();
    }
    btAfterChange();
});

$('fwBts').addEventListener('click', function (e) {
    if (!e.target.closest('[data-k="kill"]')) return;
    var box = e.target.closest('.fw-net');
    var d = ETHER[+box.dataset.i];
    if (bt.connected === d.name) bt.connected = null;
    if (bt.connecting === d.name) btCancel();
    /* the world loses it; the iPod's memory of it does not, so the row
       under MY DEVICES stays and simply stops connecting */
    ETHER.splice(+box.dataset.i, 1);
    btAfterChange();
});

$('fwBtHead').addEventListener('click', function () {
    $('fwBtHead').classList.toggle('shut');
});

$('fwBtAdd').addEventListener('click', function () {
    ETHER.push(mkBD({ name: 'Device ' + (ETHER.length + 1) }));
    btAfterChange();
});

/* ---- lifecycle ------------------------------------------------------ */
function seOpen() { seReset(); }
function seReset() {
    seCancelJoin();
    seEndSearch();
    seCloseJoin();
    $('seSheet').classList.remove('up');
    $('seAlert').classList.remove('up');
    seAlertCb = null;
    seBlurField();
    seNetId = null;
    btCancel();
    btDevName = null;
    ['se-wifi', 'se-net', 'se-bt', 'se-btdev', 'se-dev', 'se-devpick'].forEach(function (id) {
        $(id).classList.remove('active', 'behind');
    });
    $('se-root').classList.remove('behind');
    $('se-root').classList.add('active');
    $('seRootBody').scrollTop = 0;
    $('seWifiBody').scrollTop = 0;
    $('seBtBody').scrollTop = 0;
    $('seDevBody').scrollTop = 0;
    seAfterChange();
    btAfterChange();
}

/* boot the device onto the network the reference photographs end on */
(function () {
    var ap = apByName('GarysWifi-5G');
    if (ap) {
        var cfg = seCfg(ap.ssid);
        cfg.saved = true; cfg.pw = ap.pw;
        ap.lease = seLease(ap);
        wifi.joined = ap.id;
    }
    /* the Bluetooth shots open on three devices already remembered and
       the radio down -- IMG_2715, one tap away from IMG_2716 */
    bt.paired = ['BT-41', 'BT-SPEAKER', 'WH-CH510'];
    seRenderRoot(); seRenderWifi(); seRenderFW(); seSyncGlyph();
    btRenderPage(); btRenderFW(); seSyncCarrier(); battSync();
})();
