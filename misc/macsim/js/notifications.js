"use strict";
/* Notification Center: the Today view, the Notifications list, and the
   banners that drop in from the top right */

var ncOpen = false, ncTab = "today";
var ncAlerts = [{ app: "itunes", title: "untitled", when: "7m ago" }];

var STOCKS = [
    { sym: "^IXIC", px: "0.00", up: true },
    { sym: "^NYA", px: "0.00", up: true },
    { sym: "^DJI", px: "0.00", up: true },
    { sym: "AAPL", px: "0.00", up: true },
    { sym: "SBUX", px: "0.00", up: false }
];

function ncToggle() {
    ncOpen = !ncOpen;
    $("nc").classList.toggle("open", ncOpen);
    $("screen").classList.toggle("nc-open", ncOpen);
    if (ncOpen) { menuCloseAll(); ncRender(); }
}

function ncInit() {
    Array.prototype.forEach.call($("ncTabs").children, function (t) {
        t.addEventListener("click", function () {
            ncTab = t.dataset.tab;
            ncRender();
        });
    });
    ncRender();
}

function ncRefreshDate(d) {
    var n = document.querySelector(".nc-date");
    if (n) n.innerHTML = ncDateHTML(d);
}

function ncDateHTML(d) {
    var day = d.getDate();
    var ord = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd"
        : day % 10 === 3 && day !== 13 ? "rd" : "th";
    return DAYS[d.getDay()] + ",<br>" + MONS[d.getMonth()] + " " + day + "<sup>" + ord + "</sup>";
}

function ncRender() {
    Array.prototype.forEach.call($("ncTabs").children, function (t) {
        t.classList.toggle("on", t.dataset.tab === ncTab);
    });
    var b = $("ncBody");
    if (ncTab === "notifications") {
        b.innerHTML = ncAlerts.length
            ? '<div class="nc-sec">Today</div>' + ncAlerts.map(function (a) {
                var app = appById(a.app);
                return '<div class="nc-alert"><span class="art">' +
                    (app ? appIconHTML(app, 32) : "?") + "</span>" +
                    '<span class="title">' + esc(a.title) + "</span>" +
                    '<span class="when">' + esc(a.when) + "</span></div>";
            }).join("")
            : '<div class="nc-empty">No Notifications</div>';
        return;
    }

    var d = new Date();
    b.innerHTML =
        '<div class="nc-date">' + ncDateHTML(d) + "</div>" +
        '<div class="nc-sec">Calendar</div>' +
        '<div class="nc-widget"><div class="nc-empty">No Events</div></div>' +
        '<div class="nc-sec">Stocks</div>' +
        '<div class="nc-widget">' + STOCKS.map(function (s) {
            return '<div class="nc-row"><span class="sym">' + esc(s.sym) + "</span>" +
                '<span class="px">' + esc(s.px) + "</span>" +
                '<span class="nc-pill' + (s.up ? "" : " down") + '"><span class="up">+</span>' +
                '<span class="dn">−</span></span></div>';
        }).join("") + '<div class="nc-more">Show More…</div></div>' +
        '<div class="nc-sec">Weather</div>' +
        '<div class="nc-add"><span class="plus">+</span><span>Add</span>' +
        '<span class="units">°C / <b>°F</b></span></div>' +
        '<div class="nc-sec">Tomorrow</div>' +
        '<div class="nc-note">You have no events scheduled for tomorrow.</div>';

    b.querySelector(".nc-more").addEventListener("click", function () {
        launch("safari");
    });
    b.querySelector(".nc-add").addEventListener("click", function () {
        ncBanner("Weather", "Add a city in System Preferences.");
    });
}

/* ---------- banners ---------- */
function ncBanner(title, text, app) {
    var n = el("div", "nc-banner");
    var a = appById(app || "system-preferences");
    n.innerHTML = '<div class="art">' + (a ? appIconHTML(a, 64) : "") + "</div>" +
        "<div><div class=\"t\">" + esc(title) + '</div><div class="m">' + esc(text) + "</div></div>";
    $("banners").appendChild(n);
    requestAnimationFrame(function () { n.classList.add("in"); });
    var go = setTimeout(close, 4200);
    function close() {
        clearTimeout(go);
        n.classList.remove("in");
        setTimeout(function () { n.remove(); }, 300);
    }
    n.addEventListener("click", function () {
        close();
        ncAlerts.unshift({ app: app || "system-preferences", title: title, when: "now" });
        if (ncOpen) ncRender();
    });
}
