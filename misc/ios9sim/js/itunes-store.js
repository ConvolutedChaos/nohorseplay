"use strict";
/* ------------------------------------------------------------------ */
/* iTUNES STORE                                                       */
/* ------------------------------------------------------------------ */
/* Traced off ref_pic/iTunesStore/. There is no storefront left to talk
   to, so every section reaches for one, fails, and shows you what the
   real app shows: nothing. Only More has anything to draw, because its
   list is local. */

var IT_TABS = [
    {
        k: 'music', n: 'Music', dark: false,
        ic: '<i style="--m:url(icons/MobileStore/UITabBarMusic.png);--ms:url(icons/MobileStore/UITabBarMusicSelected.png);width:19px;height:24px"></i>'
    },
    {
        k: 'movies', n: 'Movies', dark: true,
        ic: '<i style="--m:url(icons/MobileStore/UITabBarMovies.png);--ms:url(icons/MobileStore/UITabBarMoviesSelected.png);width:25px;height:21px"></i>'
    },
    {
        k: 'tv', n: 'TV Shows', dark: true,
        ic: '<i style="--m:url(icons/MobileStore/UITabBarTVShows.png);--ms:url(icons/MobileStore/UITabBarTVShowsSelected.png);width:29px;height:20px"></i>'
    },
    {
        k: 'search', n: 'Search', dark: false,
        ic: '<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">' +
            '<circle cx="11" cy="11" r="8.6" fill="none" stroke="currentColor" stroke-width="2.2"/>' +
            '<path d="M17.4 17.4 24.4 24.4" stroke="currentColor" stroke-width="2.6" ' +
            'stroke-linecap="round"/></svg>'
    },
    {
        k: 'more', n: 'More', dark: false,
        ic: '<svg width="30" height="26" viewBox="0 0 30 26" aria-hidden="true">' +
            '<circle cx="6" cy="13" r="3.1" fill="currentColor"/>' +
            '<circle cx="15" cy="13" r="3.1" fill="currentColor"/>' +
            '<circle cx="24" cy="13" r="3.1" fill="currentColor"/></svg>'
    }
];

var IT_MORE = [
    {
        n: 'Tones',
        ic: '<i style="--m:url(icons/MobileStore/UITabBarTones.png);--ms:url(icons/MobileStore/UITabBarTonesSelected.png);width:22px;height:25px"></i>'
    },
    {
        n: 'Genius',
        ic: '<i style="--m:url(icons/MobileStore/UITabBarGenius.png);--ms:url(icons/MobileStore/UITabBarGeniusSelected.png);width:25px;height:25px"></i>'
    },
    {
        n: 'Purchased',
        ic: '<i style="--m:url(icons/MobileStore/UITabBarPurchased.png);--ms:url(icons/MobileStore/UITabBarPurchasedSelected.png);width:25px;height:25px"></i>'
    },
    {
        n: 'Downloads',
        ic: '<i style="--m:url(icons/MobileStore/UITabBarDownloads.png);--ms:url(icons/MobileStore/UITabBarDownloadsSelected.png);width:19px;height:24px"></i>'
    }
];

var IT_CHEV = '<svg width="9" height="15" viewBox="0 0 9 15" aria-hidden="true">' +
    '<path d="M1.4 1.3 7.4 7.5l-6 6.2" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* null = the launch state, which is the Cannot Connect sheet with no
   tab lit at all */
var itTab = null, itSub = null, itBusyTimer = null, itEditing = false;

function itDark() {
    var t = IT_TABS.filter(function (x) { return x.k === itTab; })[0];
    return !!(t && t.dark) && !itSub;
}

function itRenderTabs() {
    $('itTabs').innerHTML = IT_TABS.map(function (t) {
        return '<div class="it-tab' + (t.k === itTab ? ' on' : '') + '" data-k="' + t.k + '">' +
            t.ic + '<span>' + t.n + '</span></div>';
    }).join('');
}

function itRenderBody() {
    var app = $('itapp');
    app.classList.toggle('dark', itDark());
    app.classList.toggle('more', itTab === 'more' && !itSub);
    app.classList.toggle('sub', !!itSub);
    $('itTitle').textContent = itSub ? itSub : (itTab === 'more' ? 'More' : '');

    if ($('itapp').classList.contains('busy')) { $('itBody').innerHTML = ''; itInk(); return; }

    if (itTab === 'more' && !itSub) {
        var h = IT_MORE.map(function (r) {
            return '<div class="it-row" data-n="' + esc(r.n) + '">' +
                '<div class="it-icon">' + r.ic + '</div>' +
                '<div class="it-label">' + esc(r.n) + '</div>' +
                '<div class="it-chev">' + IT_CHEV + '</div></div>';
        }).join('');
        /* the blank ruled rows that run to the foot of the list */
        for (var i = 0; i < 6; i++) h += '<div class="it-rule"></div>';
        $('itBody').innerHTML = h;
    } else if (itTab === null || itSub) {
        $('itBody').innerHTML = '<div class="it-fail">Cannot Connect to<br>iTunes Store</div>';
    } else {
        /* Music, Movies, TV Shows and Search each come back with nothing */
        $('itBody').innerHTML = '';
    }
    itInk();
}

/* the status bar rides whichever chrome is showing */
function itInk() {
    BG_LUMA.it = itDark() ? 0.10 : 0.97;
    refreshInk();
}

function itGo(k) {
    itSub = null;
    itEditing = false;
    $('itEdit').textContent = 'Edit';
    itTab = k;
    itRenderTabs();
    /* More is local, so it never has to reach for anything */
    if (k === 'more') { itRenderBody(); return; }
    itReach();
}

/* every section tries the store, waits, and comes up empty */
function itReach() {
    clearTimeout(itBusyTimer);
    $('itapp').classList.add('busy');
    itRenderBody();
    itBusyTimer = setTimeout(function () {
        $('itapp').classList.remove('busy');
        itRenderBody();
    }, 900);
}

$('itTabs').addEventListener('click', function (e) {
    var t = e.target.closest('.it-tab'); if (!t) return;
    if (t.dataset.k === itTab && !itSub) return;
    itGo(t.dataset.k);
});
$('itBody').addEventListener('click', function (e) {
    var r = e.target.closest('.it-row'); if (!r) return;
    itSub = r.dataset.n;
    itReach();
});
$('itBack').addEventListener('click', function () {
    itSub = null;
    itRenderBody();
});
$('itEdit').addEventListener('click', function () {
    itEditing = !itEditing;
    $('itEdit').textContent = itEditing ? 'Done' : 'Edit';
});

/* ---- lifecycle ------------------------------------------------------- */
function itOpen() {
    itTab = null; itSub = null;
    itRenderTabs();
    itReach();
}
function itReset() {
    clearTimeout(itBusyTimer);
    $('itapp').classList.remove('busy');
    itTab = null; itSub = null; itEditing = false;
    $('itEdit').textContent = 'Edit';
    $('itBody').scrollTop = 0;
    itRenderTabs();
    itRenderBody();
}
