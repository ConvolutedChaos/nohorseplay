"use strict";
/* ------------------------------------------------------------------ */
/* APP STORE                                                          */
/* ------------------------------------------------------------------ */
/* Traced off ref_pic/AppStore/. The glyphs are drawn rather than
   masked, because there is no MobileStore artwork for this tab bar.
   Every path below is in CSS pixels measured off the 2x shots, so the
   viewBox is the glyph's real size and nothing has to be scaled.

   Updates is the punchline: it does not open a tab, it restarts the
   iPod. */

/* Two radii, not one: the outline star is drawn a shade smaller so its
   1.9px stroke lands on the same silhouette the filled one fills. Both
   were fitted against the screenshots rather than guessed. */
var AS_STAR = 'M13.75 1.51 L16.59 10.31 L25.83 10.29 L18.34 15.70 L21.21 24.48 ' +
    'L13.75 19.04 L6.29 24.48 L9.16 15.70 L1.67 10.29 L10.91 10.31 Z';
var AS_STAR_F = 'M13.75 0.88 L16.74 10.16 L26.49 10.14 L18.59 15.85 L21.63 25.12 ' +
    'L13.75 19.37 L5.87 25.12 L8.91 15.85 L1.01 10.14 L10.76 10.16 Z';
var AS_STAR_SM = 'M2.45 0.00 L3.00 1.69 L4.78 1.69 L3.34 2.74 L3.89 4.43 ' +
    'L2.45 3.39 L1.01 4.43 L1.56 2.74 L0.12 1.69 L1.90 1.69 Z';

/* the three star-and-bar rows inside Top Charts, at either colour */
function asRows(c) {
    var h = '';
    [3.85, 9.55, 15.25].forEach(function (y) {
        h += '<g transform="translate(4.6 ' + y + ')"><path d="' + AS_STAR_SM + '" fill="' + c + '"/></g>' +
            '<path d="M10.5 ' + (y + 2.45) + 'H20" stroke="' + c + '" stroke-width="2" stroke-linecap="round"/>';
    });
    return h;
}

/* the Safari-style needle: solid to the north-east, hollow to the
   south-west, both halves meeting at the waist */
function asNeedle(c) {
    return '<path d="M19.29 5.71 13.98 13.98 11.02 11.02 Z" fill="' + c + '"/>' +
        '<path d="M5.71 19.29 13.98 13.98 11.02 11.02 Z" fill="none" stroke="' + c +
        '" stroke-width="1.3" stroke-linejoin="round"/>';
}

var AS_SEARCH =
    '<svg width="24.5" height="24.5" viewBox="0 0 24.5 24.5" aria-hidden="true">' +
    '<circle cx="9.75" cy="9.75" r="8.55" fill="none" stroke="currentColor" stroke-width="2.3"/>' +
    '<path d="M16 16 23.2 23.2" stroke="currentColor" stroke-width="2.6" ' +
    'stroke-linecap="round"/></svg>';

/* a tray open at the top with an arrow dropping into it */
var AS_UPDATES =
    '<svg width="19" height="24" viewBox="0 0 19 24" aria-hidden="true" ' +
    'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round">' +
    '<path d="M6.5 5.5H1V23h17V5.5h-5.5"/>' +
    '<path d="M9.5 1v14.5"/>' +
    '<path d="M5.5 12 9.5 16 13.5 12"/></svg>';

var AS_TABS = [
    {
        k: 'featured', n: 'Featured',
        ic: '<svg width="27.5" height="26" viewBox="0 0 27.5 26" aria-hidden="true">' +
            '<path d="' + AS_STAR + '" fill="none" stroke="currentColor" stroke-width="1.9" ' +
            'stroke-linejoin="round"/></svg>',
        ics: '<svg width="27.5" height="26" viewBox="0 0 27.5 26" aria-hidden="true">' +
            '<path d="' + AS_STAR_F + '" fill="currentColor" stroke="currentColor" ' +
            'stroke-width="0.8" stroke-linejoin="round"/></svg>'
    },
    {
        k: 'charts', n: 'Top Charts', dy: 1,
        ic: '<svg width="23" height="23" viewBox="0 0 23 23" aria-hidden="true">' +
            '<rect x="1" y="1" width="21" height="21" rx="1" fill="none" ' +
            'stroke="currentColor" stroke-width="2"/>' + asRows('currentColor') + '</svg>',
        ics: '<svg width="23" height="23" viewBox="0 0 23 23" aria-hidden="true">' +
            '<rect x="1" y="1" width="21" height="21" rx="1" fill="currentColor" ' +
            'stroke="currentColor" stroke-width="2"/>' + asRows('#fff') + '</svg>'
    },
    {
        k: 'explore', n: 'Explore', dy: 1,
        ic: '<svg width="25" height="25" viewBox="0 0 25 25" aria-hidden="true">' +
            '<circle cx="12.5" cy="12.5" r="11.4" fill="none" stroke="currentColor" ' +
            'stroke-width="2.2"/>' + asNeedle('currentColor') + '</svg>',
        ics: '<svg width="25" height="25" viewBox="0 0 25 25" aria-hidden="true">' +
            '<circle cx="12.5" cy="12.5" r="12.5" fill="currentColor"/>' +
            asNeedle('#fff') + '</svg>'
    },
    { k: 'search', n: 'Search', ic: AS_SEARCH, ics: AS_SEARCH, dy: 0.5 },
    { k: 'updates', n: 'Updates', ic: AS_UPDATES, ics: AS_UPDATES, dy: -1 }
];

/* null = the launch state: the Cannot Connect sheet, no tab lit */
var asTab = null, asBusyTimer = null;

function asRenderTabs() {
    $('asTabs').innerHTML = AS_TABS.map(function (t) {
        var on = t.k === asTab;
        var dy = t.dy ? ' style="position:relative;top:' + t.dy + 'px"' : '';
        return '<div class="as-tab' + (on ? ' on' : '') + '" data-k="' + t.k + '">' +
            '<div class="as-glyph"' + dy + '>' + (on ? t.ics : t.ic) + '</div>' +
            '<span>' + t.n + '</span></div>';
    }).join('');
}

function asRenderBody() {
    if ($('asapp').classList.contains('busy')) { $('asBody').innerHTML = ''; return; }
    $('asBody').innerHTML = '<div class="as-fail">Cannot Connect to<br>App Store</div>';
}

/* every tab tries the store, waits, and comes up with the same sheet */
function asReach() {
    clearTimeout(asBusyTimer);
    $('asapp').classList.add('busy');
    asRenderBody();
    asBusyTimer = setTimeout(function () {
        $('asapp').classList.remove('busy');
        asRenderBody();
    }, 900);
}

$('asTabs').addEventListener('click', function (e) {
    var t = e.target.closest('.as-tab'); if (!t) return;
    /* the one tab that does something, and what it does is reboot */
    if (t.dataset.k === 'updates') { restart(); return; }
    if (t.dataset.k === asTab) return;
    asTab = t.dataset.k;
    asRenderTabs();
    asReach();
});

/* ---- lifecycle ------------------------------------------------------- */
function asOpen() {
    asTab = null;
    asRenderTabs();
    asReach();
}
function asReset() {
    clearTimeout(asBusyTimer);
    $('asapp').classList.remove('busy');
    asTab = null;
    $('asBody').scrollTop = 0;
    asRenderTabs();
    asRenderBody();
}
