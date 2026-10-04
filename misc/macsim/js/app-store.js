"use strict";
/* The App Store, off the 9.23 reference shots: a unified 22+32 toolbar
   (back/forward always dim -- there is nowhere to go -- Featured, Top
   Charts, Categories, Purchases and Updates, then a search field) over
   the "Cannot Connect to the App Store" empty state every tab shows,
   because the sim has no network. Store > Sign In... and Check for
   Unfinished Downloads... both raise the sign-in sheet; Create Account...
   does nothing and Sign In always fails -- the real app's behaviour
   offline, not a bug. */

var AS_TABS = [
    { id: "featured", l: "Featured", ico: "star" },
    { id: "top-charts", l: "Top Charts", ico: "topCharts" },
    { id: "categories", l: "Categories", ico: "categories" },
    { id: "purchases", l: "Purchases", ico: "purchases" },
    { id: "updates", l: "Updates", ico: "updates" }
];

var AS_ICON = {
    back: ICON.back,
    fwd: ICON.fwd,
    search: '<svg viewBox="0 0 13 13"><circle cx="5.4" cy="5.4" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
        '<path d="M8.6 8.6 12 12" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    star: '<svg viewBox="0 0 16 16"><path d="M8 .6l2.13 4.53 4.98.62-3.63 3.5.94 4.92L8 11.9l-4.42 2.27.94-4.92-3.63-3.5 4.98-.62z"/></svg>',
    topCharts: '<svg viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.3"/>' +
        '<rect x="4" y="4.3" width="8" height="1.4" rx=".5"/><rect x="4" y="7.3" width="8" height="1.4" rx=".5"/>' +
        '<rect x="4" y="10.3" width="8" height="1.4" rx=".5"/></svg>',
    categories: '<svg viewBox="0 0 16 16"><rect x="5.4" y="1.4" width="9.2" height="9.2" rx="1.6" opacity=".55"/>' +
        '<rect x="3.2" y="3.6" width="9.2" height="9.2" rx="1.6" opacity=".78"/>' +
        '<rect x="1" y="5.8" width="9.2" height="9.2" rx="1.6"/></svg>',
    purchases: '<svg viewBox="0 0 16 16"><path d="M14.4 8.4 8.4 14.4a1 1 0 0 1-1.4 0L1.6 9a1 1 0 0 1 0-1.4L7.6 1.6a1 1 0 0 1 .7-.3H13a1.4 1.4 0 0 1 1.4 1.4v4.7a1 1 0 0 1-.3.7z"/>' +
        '<circle cx="10.4" cy="4.6" r="1.15" fill="#e9e7e9"/></svg>',
    updates: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
        '<path d="M8 4.6v6M5.2 8.2 8 11l2.8-2.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

/* the "Cannot Connect" watermark -- the real glyph, not a trace of it */
var AS_GLYPH_SRC = "assets/icons/others/Appstore-Logo-Background.png";

function asWindow() { return wins.filter(function (w) { return w.app === "app-store" && !w.appStoreSignIn; })[0]; }

function openAppStore() {
    var open = asWindow();
    if (open) { winFocus(open); return open; }
    var app = appById("app-store");
    var w = winCreate({
        app: "app-store", title: "", w: app.w || 720, h: app.h || 460, unified: true
    });
    w.asTab = "featured";
    w.body.className = "win-body as-body";
    w.body.style.cssText = "display:flex;flex-direction:column;padding:0;overflow:hidden";
    w.body.innerHTML = '<div class="as-toolbar"></div><div class="as-content"></div>';
    w.toolbarEl = w.body.querySelector(".as-toolbar");
    w.contentEl = w.body.querySelector(".as-content");
    asRenderToolbar(w);
    asRenderContent(w);
    return w;
}

function asRenderToolbar(w) {
    w.toolbarEl.innerHTML =
        '<div class="tb-group">' +
        '<div class="tb-btn dim" data-tip="Show the previous page">' + AS_ICON.back + "</div>" +
        '<div class="tb-btn dim" data-tip="Show the next page">' + AS_ICON.fwd + "</div></div>" +
        '<div class="as-nav">' + AS_TABS.map(function (t) {
            return '<div class="as-nbtn' + (w.asTab === t.id ? " on" : "") + '" data-t="' + t.id + '">' +
                AS_ICON[t.ico] + "<span>" + esc(t.l) + "</span></div>";
        }).join("") + "</div>" +
        '<div class="tb-search as-search">' + AS_ICON.search +
        '<input placeholder="Search" spellcheck="false"></div>';

    Array.prototype.forEach.call(w.toolbarEl.querySelectorAll(".as-nbtn"), function (b) {
        b.addEventListener("click", function () {
            if (w.asTab === b.dataset.t) return;
            w.asTab = b.dataset.t;
            asRenderToolbar(w);
            asRenderContent(w);
        });
    });
    var field = w.toolbarEl.querySelector(".as-search");
    var input = field.querySelector("input");
    input.addEventListener("keydown", function (e) { e.stopPropagation(); });
    input.addEventListener("focus", function () { field.classList.add("focus"); });
    input.addEventListener("blur", function () { field.classList.remove("focus"); });
}

function asRenderContent(w) {
    w.contentEl.innerHTML =
        '<div class="as-empty">' +
        '<div class="as-glyph"><img src="' + AS_GLYPH_SRC + '" alt=""></div>' +
        '<div class="as-empty-t">Cannot Connect to the App Store</div></div>';
}

function asReload() {
    var w = asWindow();
    if (!w) return;
    w.asTab = "featured";
    asRenderToolbar(w);
    asRenderContent(w);
}

function asFocusSearch() {
    var w = asWindow();
    var f = w && w.toolbarEl.querySelector(".as-search input");
    if (f) f.focus();
}

/* ------------------------------------------------------------------ */
/* SIGN IN -- the 9.23 shots: Sign In... and Check for Unfinished       */
/* Downloads... both raise this sheet; Sign In always fails.           */
/* ------------------------------------------------------------------ */
function openAppStoreSignIn() {
    var open = wins.filter(function (w) { return w.appStoreSignIn; })[0];
    if (open) { winFocus(open); return open; }
    var w = winCreate({
        app: "app-store", title: "", w: 486, h: 136,
        resizable: false, zoomable: false, minimizable: false, chromeless: true,
        x: (window.innerWidth - 486) / 2, y: 150
    });
    w.appStoreSignIn = true;
    w.body.innerHTML =
        '<div class="as-signin">' +
        '<div class="top"><div class="ico">' + appIconHTML(appById("app-store"), 64) + "</div>" +
        '<div class="msg"><div class="t">Sign in to download from the App Store.</div>' +
        '<div class="m">If you have an Apple ID, sign in with it here. If you have used the ' +
        "iTunes Store or iCloud, for example, you have an Apple ID. If you don’t have an " +
        "Apple ID, click Create Apple ID.</div></div></div>" +
        '<div class="btns">' +
        '<span class="btn" id="asSignInCancel">Cancel</span>' +
        '<span class="grow"></span>' +
        '<span class="btn" id="asSignInCreate">Create Apple ID</span>' +
        '<span class="btn default" id="asSignInGo">Sign In</span>' +
        "</div></div>";
    w.body.querySelector("#asSignInCancel").addEventListener("click", function () { winClose(w); });
    w.body.querySelector("#asSignInCreate").addEventListener("click", function () { winClose(w); });
    w.body.querySelector("#asSignInGo").addEventListener("click", function () {
        winClose(w);
        openAlert("An unexpected error occurred while signing in.", "Failure", null,
            { icon: appIconHTML(appById("app-store"), 64), ok: "OK" });
    });
    return w;
}
