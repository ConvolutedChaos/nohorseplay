"use strict";
/* Spotlight: search field, grouped results, preview pane */

var spotRows = [], spotIdx = 0, spotOn = false;

var BOOKMARKS = ["Failed to open page", "TripAdvisor", "Yelp", "The Weather Channel",
    "LinkedIn", "Twitter", "Facebook", "Wikipedia", "Apple", "Hacker News"];

function spotToggle() { spotOn ? spotClose() : spotOpen(); }

function spotOpen() {
    menuCloseAll();
    $("spotlight").classList.remove("hidden");
    spotOn = true;
    var i = $("spotInput");
    i.value = "";
    i.focus();
    spotSearch("");
}

function spotClose() {
    $("spotlight").classList.add("hidden");
    spotOn = false;
}

function spotInit() {
    var i = $("spotInput");
    i.addEventListener("input", function () { spotSearch(i.value); });
    i.addEventListener("keydown", function (e) {
        e.stopPropagation();
        if (e.key === "Escape") { spotClose(); return; }
        if (e.key === "ArrowDown") { spotMove(1); e.preventDefault(); }
        if (e.key === "ArrowUp") { spotMove(-1); e.preventDefault(); }
        if (e.key === "Enter") { spotRun(); e.preventDefault(); }
    });
    $("spotlight").addEventListener("mousedown", function (e) { e.stopPropagation(); });
}

/* ---------- searching ---------- */
function spotSearch(q) {
    q = q.trim();
    var list = $("spotList"), prev = $("spotPreview");
    spotRows = [];
    if (!q) {
        $("spotResults").classList.add("hidden");
        $("spotHitIcon").innerHTML = "";
        return;
    }
    $("spotResults").classList.remove("hidden");
    var ql = q.toLowerCase();
    var groups = [];

    var apps = ALL_APPS.filter(function (a) { return a.name.toLowerCase().indexOf(ql) >= 0; });
    var prefs = ["iCloud", "General", "Displays", "Keyboard", "Sound", "Network", "Dock"]
        .filter(function (p) { return p.toLowerCase().indexOf(ql) >= 0 || ql.length > 2 && "system preferences".indexOf(ql) >= 0; });
    var files = fsWalk(FS).filter(function (n) {
        return n.kind !== "app" && n.name.toLowerCase().indexOf(ql) >= 0;
    }).slice(0, 8);
    var marks = BOOKMARKS.filter(function (b) { return b.toLowerCase().indexOf(ql) >= 0; }).slice(0, 8);

    /* a bare sum answers itself, the way the calculator row does */
    var sum = null;
    if (/^[-+*/(). 0-9]+$/.test(q) && /[-+*/]/.test(q)) {
        try { sum = Function('"use strict";return (' + q + ")")(); } catch (e) { sum = null; }
    }

    var top = apps[0] ? { kind: "app", app: apps[0] }
        : sum != null ? { kind: "calc", q: q, v: sum }
            : files[0] ? { kind: "file", node: files[0] }
                : marks[0] ? { kind: "mark", name: marks[0] } : null;

    if (top) groups.push({ head: "Top Hit", rows: [top] });
    if (sum != null) groups.push({ head: "Calculator", rows: [{ kind: "calc", q: q, v: sum }] });
    if (apps.length) {
        groups.push({
            head: "Applications", rows: apps.slice(0, 6).map(function (a) {
                return { kind: "app", app: a };
            })
        });
    }
    if (prefs.length) {
        groups.push({
            head: "System Preferences", rows: prefs.slice(0, 4).map(function (p) {
                return { kind: "pref", name: p };
            })
        });
    }
    if (files.length) {
        groups.push({
            head: "Documents", rows: files.map(function (n) {
                return { kind: "file", node: n };
            })
        });
    }
    if (ql.length > 3) groups.push({ head: "Definition", rows: [{ kind: "def", name: q }] });
    if (marks.length) {
        groups.push({
            head: "Bookmarks & History", rows: marks.map(function (b) {
                return { kind: "mark", name: b };
            })
        });
    }

    list.innerHTML = "";
    if (!groups.length) {
        list.innerHTML = '<div id="spotEmpty">No Results Found</div>';
        prev.innerHTML = "";
        $("spotHitIcon").innerHTML = "";
        return;
    }

    groups.forEach(function (g) {
        list.appendChild(el("div", "head", esc(g.head)));
        g.rows.forEach(function (r) {
            var n = el("div", "row");
            n.innerHTML = '<span class="art">' + spotArt(r) + "</span>" +
                '<span class="nm">' + esc(spotName(r)) + "</span>";
            var idx = spotRows.length;
            n._i = idx;
            spotRows.push({ r: r, el: n });
            n.addEventListener("mouseenter", function () { spotSelect(idx); });
            n.addEventListener("mousedown", function (e) { e.stopPropagation(); spotSelect(idx); spotRun(); });
            list.appendChild(n);
        });
    });
    spotSelect(0);
}

function spotName(r) {
    return r.kind === "app" ? r.app.name
        : r.kind === "file" ? r.node.name
            : r.kind === "calc" ? r.q + " = " + r.v
                : r.kind === "def" ? r.name.slice(0, 4)
                    : r.name;
}

function spotArt(r) {
    if (r.kind === "app") return appIconHTML(r.app, 32);
    if (r.kind === "file") return fileArtHTML(r.node, 16);
    if (r.kind === "pref") return appIconHTML(appById("system-preferences"), 32);
    if (r.kind === "def") return appIconHTML(appById("dictionary"), 32);
    if (r.kind === "calc") return appIconHTML(appById("calculator"), 32);
    return sysIcon("GenericURLIcon", 32);
}

function spotSelect(i) {
    if (!spotRows.length) return;
    spotIdx = clamp(i, 0, spotRows.length - 1);
    spotRows.forEach(function (row, n) { row.el.classList.toggle("on", n === spotIdx); });
    var sel = spotRows[spotIdx];
    sel.el.scrollIntoView({ block: "nearest" });
    spotPreview(sel.r);
}

function spotMove(d) { spotSelect(spotIdx + d); }

function spotPreview(r) {
    var p = $("spotPreview"), hit = $("spotHitIcon");
    hit.innerHTML = r.kind === "app" ? appIconHTML(r.app, 64) : "";
    if (r.kind === "app") {
        p.innerHTML = '<div class="art">' + appIconHTML(r.app, 256) + "</div>" +
            "<h3>" + esc(r.app.name) + "</h3>" +
            '<div class="sub">Version: ' + esc(r.app.ver || "1.0") + "</div>" +
            "<table>" +
            '<tr><td class="k">Kind</td><td class="v">Application</td></tr>' +
            '<tr><td class="k">Size</td><td class="v">' + (30 + r.app.name.length * 2) + ".3 MB</td></tr>" +
            '<tr><td class="k">Created</td><td class="v">6/22/15</td></tr>' +
            '<tr><td class="k">Modified</td><td class="v">6/22/15</td></tr>' +
            '<tr><td class="k">Last opened</td><td class="v">9/11/26</td></tr>' +
            "</table>";
        return;
    }
    if (r.kind === "file") {
        var n = r.node;
        p.innerHTML = '<div class="art">' + fileArtHTML(n, 128) + "</div>" +
            "<h3>" + esc(n.name) + "</h3>" +
            '<div class="sub">' + kindLabel(n) + "</div>" +
            "<table>" +
            '<tr><td class="k">Size</td><td class="v">' + esc(fmtSize(n)) + "</td></tr>" +
            '<tr><td class="k">Where</td><td class="v">' + esc("/" + fsPath(n.parent || FS)) + "</td></tr>" +
            '<tr><td class="k">Modified</td><td class="v">' + esc(fmtDate(n.modified)) + "</td></tr>" +
            "</table>";
        return;
    }
    if (r.kind === "calc") {
        p.innerHTML = '<div style="margin:auto;text-align:center">' +
            '<div style="font:100 24px var(--sf-display);color:rgba(0,0,0,.45)">' + esc(r.q) + "</div>" +
            '<div style="font:100 54px var(--sf-display);margin-top:6px">' + esc(String(r.v)) + "</div></div>";
        return;
    }
    if (r.kind === "def") {
        p.innerHTML = '<div style="text-align:left;align-self:stretch">' +
            '<h3 style="text-align:left">' + esc(r.name) + "</h3>" +
            '<div class="sub" style="text-align:left;margin-top:8px">' +
            "No dictionary is installed in this simulation, but the row is here " +
            "because Spotlight always offers one.</div></div>";
        return;
    }
    p.innerHTML = '<div class="art">' + spotArt(r) + "</div><h3>" + esc(r.name) + "</h3>" +
        '<div class="sub">Bookmark</div>';
}

function spotRun() {
    var sel = spotRows[spotIdx];
    if (!sel) return;
    var r = sel.r;
    spotClose();
    if (r.kind === "app") launch(r.app.id);
    else if (r.kind === "file") openNode(r.node);
    else if (r.kind === "pref") launch("system-preferences");
    else if (r.kind === "mark") launch("safari");
    else if (r.kind === "calc") launch("calculator");
    else openPlaceholder("dictionary", "Dictionary", "No dictionary installed.");
}
