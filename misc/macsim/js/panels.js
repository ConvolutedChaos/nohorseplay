"use strict";
/* The small windows the Finder puts up: Get Info, Quick Look, View Options,
   alerts, Go to Folder, Connect to Server, the Clipboard, Mac Help and the
   character picker.  All of them are traced from the 11.2x reference shots. */

/* ------------------------------------------------------------------ */
/* ALERTS                                                              */
/* ------------------------------------------------------------------ */
/* Both alert icons come straight out of the library: the caution triangle
   with the Finder peeking out behind it, and the Finder on its own. */
function cautionIcon() {
    return '<span class="alert-caution">' + sysIcon("Finder", 30, "peek") +
        sysIcon("AlertCautionIcon", 58, "tri") + "</span>";
}

function finderIcon64() { return sysIcon("Finder", 60); }

/* The alert sheet.  opts: { icon: "caution" | "finder", ok, cancelDefault }
   -- the Delete Immediately warning is the one that makes Cancel the
   default button, so which button is blue has to be a choice. */
function openAlert(title, msg, onOK, opts) {
    opts = typeof opts === "string" ? { ok: opts } : (opts || {});
    var h = msg && msg.length > 64 ? 156 : 148;
    var front = frontWindow();
    var x = (window.innerWidth - 420) / 2, y = 150;
    if (front && !front.chromeless) {
        /* it behaves like a sheet: centred on the window it belongs to */
        var b = front.node.getBoundingClientRect();
        x = b.left + (b.width - 420) / 2;
        y = Math.max(30, b.top - 22 + 30);
    }
    var w = winCreate({
        app: activeApp, title: "", w: 420, h: h,
        resizable: false, zoomable: false, minimizable: false, chromeless: true,
        x: x, y: y
    });
    var cancel = !!onOK;
    var okCls = "btn" + (opts.cancelDefault ? "" : " default");
    var caCls = "btn" + (opts.cancelDefault ? " default" : "");
    w.body.innerHTML =
        '<div class="alert">' +
        '<div class="ico">' + (opts.icon === "finder" ? finderIcon64() : cautionIcon()) + "</div>" +
        '<div class="msg"><div class="t">' + esc(title) + "</div>" +
        (msg ? '<div class="m">' + esc(msg) + "</div>" : "") +
        '<div class="btns">' +
        (cancel ? '<span class="' + caCls + '" id="alCancel">Cancel</span>' : "") +
        '<span class="' + okCls + '" id="alOK">' + esc(opts.ok || "OK") + "</span></div></div></div>";
    var ca = w.body.querySelector("#alCancel");
    if (ca) ca.addEventListener("click", function () { winClose(w); });
    w.body.querySelector("#alOK").addEventListener("click", function () {
        winClose(w);
        if (onOK) onOK();
    });
    return w;
}

/* the Finder's refusal when a name is already spoken for */
function openNameTakenAlert(name) {
    return openAlert("The name “" + name + "” is already taken. " +
        "Please choose a different name.", "", null, { icon: "caution" });
}

/* ------------------------------------------------------------------ */
/* GET INFO                                                            */
/* ------------------------------------------------------------------ */
var infoOpen = {};

function getInfoNode(n) {
    if (infoOpen[n.id] && wins.indexOf(infoOpen[n.id]) >= 0) {
        winFocus(infoOpen[n.id]);
        return infoOpen[n.id];
    }
    var w = winCreate({
        app: "finder", title: n.name, w: 275, h: 560,
        resizable: false, zoomable: false,
        x: 24, y: 12
    });
    infoOpen[n.id] = w;
    winSetTitle(w, truncMid(n.name, 24), fileArtHTML(n, 16));

    var where = fsWhere(n).map(function (p) { return esc(p); }).join(" ▸ ");
    var sect = function (id, label, body, open) {
        return '<div class="ginfo-sec' + (open ? " open" : "") + '" data-s="' + id + '">' +
            '<div class="hd"><span class="tri">▶</span>' + esc(label) + "</div>" +
            '<div class="bd">' + body + "</div></div>";
    };
    var rows = function (list) {
        return "<table>" + list.map(function (r) {
            return '<tr><td class="k">' + esc(r[0]) + "</td><td class=\"v\">" + r[1] + "</td></tr>";
        }).join("") + "</table>";
    };

    w.body.className = "win-body ginfo";
    w.body.innerHTML =
        '<div class="ginfo-head">' +
        '<div class="art">' + fileArtHTML(n, 32) + "</div>" +
        '<div class="nm"><b>' + esc(truncMid(n.name, 22)) + "</b>" +
        '<span class="sz">' + esc(fmtSize(n)) + "</span>" +
        '<div class="mod">Modified: ' + esc(fmtDate(n.modified)) + "</div></div></div>" +
        '<div class="ginfo-tags"><input placeholder="Add Tags…" spellcheck="false"></div>' +
        sect("general", "General:", rows([
            ["Kind:", esc(kindLabel(n))],
            ["Size:", esc(n.bytes ? n.bytes.toLocaleString() + " bytes (" + fmtSize(n) + " on disk)" : fmtSize(n))],
            ["Where:", where],
            ["Created:", esc(fmtDate(n.created))],
            ["Modified:", esc(fmtDate(n.modified))]
        ]) + '<label class="ck"><input type="checkbox"> Stationery pad</label>' +
             '<label class="ck"><input type="checkbox"> Locked</label>', true) +
        sect("more", "More Info:", rows(n.kind === "shot"
            ? [["Dimensions:", "1280 × 800"], ["Color space:", "RGB"], ["Last opened:", esc(fmtDate(n.opened))]]
            : [["Last opened:", esc(fmtDate(n.opened))]])) +
        sect("name", "Name & Extension:",
            '<input class="wide" value="' + esc(n.name) + '" spellcheck="false">' +
            '<label class="ck"><input type="checkbox"> Hide extension</label>') +
        sect("comments", "Comments:", '<textarea class="wide" rows="3"></textarea>') +
        sect("openwith", "Open with:",
            '<div class="popup">' + esc(n.kind === "shot" ? "Preview (default)" : "TextEdit (default)") + " ▾</div>") +
        sect("preview", "Preview:", '<div class="prev">' + fileArtHTML(n, 128) + "</div>", true) +
        sect("sharing", "Sharing & Permissions:",
            '<div class="perm">' + sysIcon("UserIcon", 16) +
            "<span>timmytoenails (Me)</span><b>Read &amp; Write</b></div>" +
            '<div class="perm">' + sysIcon("GroupIcon", 16) +
            "<span>staff</span><b>Read only</b></div>" +
            '<div class="perm">' + sysIcon("Everyone", 16) +
            "<span>everyone</span><b>Read only</b></div>");

    Array.prototype.forEach.call(w.body.querySelectorAll(".ginfo-sec .hd"), function (h) {
        h.addEventListener("click", function () { h.parentNode.classList.toggle("open"); });
    });
    Array.prototype.forEach.call(w.body.querySelectorAll("input, textarea"), function (i) {
        i.addEventListener("keydown", function (e) { e.stopPropagation(); });
    });
    var nameField = w.body.querySelector('.ginfo-sec[data-s="name"] input.wide');
    nameField.addEventListener("change", function () {
        if (nameField.value.trim()) {
            n.name = nameField.value.trim();
            winSetTitle(w, truncMid(n.name, 24), fileArtHTML(n, 16));
            dtRender();
            wins.forEach(function (o) { if (o.app === "finder" && o.tabs) fwRenderView(o); });
        }
    });
    return w;
}

/* ------------------------------------------------------------------ */
/* QUICK LOOK                                                          */
/* ------------------------------------------------------------------ */
function quickLook(n) {
    if (!n) return;
    if (window._ql) { winClose(window._ql); window._ql = null; }
    var isImg = n.kind === "shot";
    var w = winCreate({
        app: activeApp, title: "", w: isImg ? 760 : 600, h: isImg ? 540 : 350,
        resizable: false, zoomable: false, minimizable: false, chromeless: true,
        x: (window.innerWidth - (isImg ? 760 : 600)) / 2, y: 70
    });
    window._ql = w;
    w.body.className = "win-body ql";
    w.body.innerHTML =
        '<div class="ql-bar"><span class="x">✕</span><span class="full">⤢</span>' +
        '<span class="t">' + esc(n.name) + "</span>" +
        (isImg ? '<span class="open">Open with Preview</span>' : "") +
        '<span class="share">↑</span></div>' +
        '<div class="ql-body">' + (isImg
            ? '<img src="assets/img/wallpaper.jpg" alt="">'
            : '<div class="ql-info"><div class="art">' + fileArtHTML(n, 160) + "</div>" +
              '<div class="meta"><h3>' + esc(n.name) + "</h3>" +
              "<p>" + esc(fmtSize(n)) + (n.children ? ", " + n.children.length + " items" : "") + "</p>" +
              "<p>Last modified " + esc(fmtDate(n.modified)) + "</p></div></div>") +
        "</div>";
    w.body.querySelector(".x").addEventListener("click", function () { winClose(w); window._ql = null; });
    w.body.querySelector(".full").addEventListener("click", function () { winZoom(w); });
    var op = w.body.querySelector(".open");
    if (op) op.addEventListener("click", function () { winClose(w); window._ql = null; openNode(n); });
    return w;
}

/* ------------------------------------------------------------------ */
/* SHOW VIEW OPTIONS                                                   */
/* ------------------------------------------------------------------ */
function openViewOptions(fw) {
    if (!fw) return;
    var t = curTab(fw);
    var w = winCreate({
        app: "finder", title: locName(t.loc), w: 200, h: 546,
        resizable: false, zoomable: false, minimizable: false, utility: true,
        x: Math.min(window.innerWidth - 220, fw.node.offsetLeft + fw.node.offsetWidth - 60), y: 10
    });
    w.body.className = "win-body vopts";
    var sizes = [16, 32, 48, 64, 96, 128];
    w.body.innerHTML =
        '<label class="ck"><input type="checkbox" id="voAlways"> Always open in icon view</label>' +
        '<label class="ck sub"><input type="checkbox" id="voBrowse"> Browse in icon view</label>' +
        '<div class="row"><span>Arrange By:</span><select id="voArrange">' +
        ["None", "Name", "Kind", "Date Modified", "Size", "Tags"].map(function (o) {
            return "<option>" + o + "</option>";
        }).join("") + "</select></div>" +
        '<div class="row"><span>Sort By:</span><select id="voSort">' +
        ["Name", "Kind", "Date Modified", "Size", "Tags"].map(function (o) {
            return "<option>" + o + "</option>";
        }).join("") + "</select></div>" +
        '<div class="sec"><div class="lab">Icon size: <b id="voSizeLab">' +
        (t.iconSize || 64) + " × " + (t.iconSize || 64) + "</b></div>" +
        '<input type="range" id="voSize" min="0" max="5" value="' +
        Math.max(0, sizes.indexOf(t.iconSize || 64)) + '"></div>' +
        '<div class="sec"><div class="lab">Grid spacing:</div>' +
        '<input type="range" id="voGrid" min="0" max="4" value="2"></div>' +
        '<div class="row"><span>Text size:</span><select id="voText">' +
        [10, 11, 12, 13, 14, 16].map(function (o) {
            return '<option' + (o === (t.textSize || 12) ? " selected" : "") + ">" + o + "</option>";
        }).join("") + "</select></div>" +
        '<div class="sec"><div class="lab">Label position:</div>' +
        '<label class="rd"><input type="radio" name="lp" checked> Bottom</label>' +
        '<label class="rd"><input type="radio" name="lp"> Right</label></div>' +
        '<div class="sec"><label class="ck"><input type="checkbox" id="voInfo"> Show item info</label>' +
        '<label class="ck"><input type="checkbox" checked> Show icon preview</label></div>' +
        '<div class="sec"><div class="lab">Background:</div>' +
        '<label class="rd"><input type="radio" name="bg" checked> White</label>' +
        '<label class="rd"><input type="radio" name="bg"> Color</label>' +
        '<label class="rd"><input type="radio" name="bg"> Picture</label></div>' +
        '<div class="foot"><span class="btn">Use as Defaults</span></div>';

    var size = w.body.querySelector("#voSize");
    size.addEventListener("input", function () {
        t.iconSize = sizes[+size.value];
        w.body.querySelector("#voSizeLab").textContent = t.iconSize + " × " + t.iconSize;
        fwRenderView(fw);
    });
    w.body.querySelector("#voText").addEventListener("change", function () {
        t.textSize = +this.value;
        fwRenderView(fw);
    });
    w.body.querySelector("#voArrange").addEventListener("change", function () {
        var map = { None: null, Name: "name", Kind: "kind", "Date Modified": "modified", Size: "size", Tags: "tags" };
        fwArrangeBy(fw, map[this.value]);
    });
    w.body.querySelector("#voSort").addEventListener("change", function () {
        var map = { Name: "name", Kind: "kind", "Date Modified": "modified", Size: "size", Tags: "tags" };
        fwSortBy(fw, map[this.value]);
    });
    w.body.querySelector("#voInfo").addEventListener("change", function () {
        t.itemInfo = this.checked;
        fwRenderView(fw);
    });
    return w;
}

/* ------------------------------------------------------------------ */
/* TAGS POPOVER                                                        */
/* ------------------------------------------------------------------ */
function openTagPopover(fw, anchor) {
    var t = curTab(fw);
    if (!t.sel.length) return;
    menuCloseAll();
    var target = t.sel[0];
    var pop = el("div", "popover vibrant-light");
    pop.innerHTML =
        '<div class="pp-title">Assign tags to “' + esc(target.name) + '”</div>' +
        '<div class="pp-field">' + target.tags.map(function (n) {
            var c = TAGS.filter(function (x) { return x.n === n; })[0];
            return '<span class="token"><i style="background:' + ((c && c.c) || "#ccc") + '"></i>' + esc(n) + "</span>";
        }).join("") + '<input spellcheck="false"></div>' +
        '<div class="pp-list">' + TAGS.slice(0, 7).map(function (g) {
            return '<div class="pp-row" data-t="' + esc(g.n) + '">' +
                '<i style="background:' + g.c + '"></i>' + esc(g.n) + "</div>";
        }).join("") + '<div class="pp-row" data-t=""><i class="none"></i>Show All…</div></div>';
    menuLayer.appendChild(pop);
    menuLayer.classList.remove("idle");
    menuStack = [pop];
    menuOpenId = "context";
    var r = anchor.getBoundingClientRect();
    pop.style.left = Math.min(window.innerWidth - 220, r.left - 40) + "px";
    pop.style.top = (r.bottom + 8) + "px";
    pop.addEventListener("mousedown", function (e) { e.stopPropagation(); });
    Array.prototype.forEach.call(pop.querySelectorAll(".pp-row"), function (row) {
        row.addEventListener("click", function () {
            var name = row.dataset.t;
            if (!name) return;
            var i = target.tags.indexOf(name);
            if (i >= 0) target.tags.splice(i, 1); else target.tags.push(name);
            menuCloseAll();
            fwRenderView(fw);
            dtRender();
        });
    });
    var inp = pop.querySelector("input");
    inp.focus();
    inp.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Escape") menuCloseAll(); });
}

/* ------------------------------------------------------------------ */
/* DIALOGS                                                             */
/* ------------------------------------------------------------------ */
function openGoToFolder(onGo) {
    var w = winCreate({
        app: "finder", title: "Go to Folder", w: 430, h: 148,
        resizable: false, zoomable: false, minimizable: false, utility: true,
        x: (window.innerWidth - 430) / 2, y: 160
    });
    w.body.className = "win-body dialog";
    w.body.innerHTML =
        '<div class="lab">Go to the folder:</div>' +
        '<input class="wide" id="gtf" spellcheck="false" autocomplete="off">' +
        '<div class="btns"><span class="btn" id="gtfCancel">Cancel</span>' +
        '<span class="btn default dim" id="gtfGo">Go</span></div>';
    var inp = w.body.querySelector("#gtf"), go = w.body.querySelector("#gtfGo");
    inp.focus();
    inp.addEventListener("input", function () { go.classList.toggle("dim", !inp.value.trim()); });
    inp.addEventListener("keydown", function (e) {
        e.stopPropagation();
        if (e.key === "Enter" && inp.value.trim()) { var v = inp.value; winClose(w); onGo(v); }
        if (e.key === "Escape") winClose(w);
    });
    w.body.querySelector("#gtfCancel").addEventListener("click", function () { winClose(w); });
    go.addEventListener("click", function () {
        if (!inp.value.trim()) return;
        var v = inp.value; winClose(w); onGo(v);
    });
    return w;
}

function openConnectToServer() {
    var w = winCreate({
        app: "finder", title: "Connect to Server", w: 486, h: 232,
        resizable: false, zoomable: false, utility: true,
        x: (window.innerWidth - 486) / 2, y: 140
    });
    w.body.className = "win-body dialog cts";
    w.body.innerHTML =
        '<div class="lab">Server Address:</div>' +
        '<div class="line"><input class="wide" id="ctsAddr" spellcheck="false">' +
        '<span class="btn sq" id="ctsAdd">+</span>' +
        '<span class="btn sq" id="ctsRecent">🕐 ▾</span></div>' +
        '<div class="lab">Favorite Servers:</div>' +
        '<div class="listbox" id="ctsFav"></div>' +
        '<div class="btns"><span class="btn round" id="ctsHelp">?</span>' +
        '<span class="btn dim" id="ctsRemove">Remove</span>' +
        '<span class="grow"></span>' +
        '<span class="btn" id="ctsBrowse">Browse</span>' +
        '<span class="btn dim" id="ctsConnect">Connect</span></div>';
    var addr = w.body.querySelector("#ctsAddr"), conn = w.body.querySelector("#ctsConnect");
    addr.focus();
    addr.addEventListener("keydown", function (e) { e.stopPropagation(); });
    addr.addEventListener("input", function () { conn.classList.toggle("dim", !addr.value.trim()); });
    w.body.querySelector("#ctsRecent").addEventListener("mousedown", function (e) {
        e.stopPropagation();
        var r = this.getBoundingClientRect();
        menuOpen([{ l: "Recent Servers", d: 1 }, { sep: 1 }, { l: "Clear Recent Servers…", d: 1 }],
            r.left - 80, r.bottom + 2, { cls: "context" });
        menuOpenId = "context";
    });
    w.body.querySelector("#ctsAdd").addEventListener("click", function () {
        if (!addr.value.trim()) return;
        var row = el("div", "lb-row", esc(addr.value.trim()));
        w.body.querySelector("#ctsFav").appendChild(row);
        addr.value = "";
        conn.classList.add("dim");
    });
    w.body.querySelector("#ctsBrowse").addEventListener("click", function () {
        openFinder({ place: "airdrop" });
    });
    conn.addEventListener("click", function () {
        if (conn.classList.contains("dim")) return;
        var a = addr.value.trim();
        winClose(w);
        openAlert("There was a problem connecting to the server “" + a + "”.",
            "The server may not exist or it is unavailable at this time.");
    });
    return w;
}

/* ------------------------------------------------------------------ */
/* SMALL WINDOWS                                                       */
/* ------------------------------------------------------------------ */
function openAboutFinder() {
    var w = winCreate({
        app: "finder", title: "About Finder", w: 300, h: 322,
        resizable: false, zoomable: false, minimizable: false, utility: true,
        x: (window.innerWidth - 300) / 2, y: 118
    });
    w.body.className = "win-body about-app";
    w.body.innerHTML =
        '<div class="art">' + appIconHTML(appById("finder"), 256) + "</div>" +
        "<b>Finder</b>" +
        "<div>The Macintosh Desktop Experience</div>" +
        '<div class="ver">Finder version 10.11.4</div>' +
        '<div class="legal">TM and © 1983-2016 Apple Inc.<br>All Rights Reserved.</div>';
    return w;
}

function showClipboard() {
    var w = winCreate({
        app: "finder", title: "Clipboard", w: 490, h: 360,
        x: 400, y: 90
    });
    w.body.className = "win-body clipboard";
    w.body.innerHTML = '<div class="cb-body">' +
        esc(clipboard.map(function (n) { return n.name; }).join("\n")) + "</div>" +
        '<div class="cb-foot">Clipboard contents: ' +
        (clipboard.length ? "rich text (RTF)" : "empty") + "</div>";
    return w;
}

function openMacHelp() {
    var w = winCreate({
        app: "finder", title: "Mac Help", w: 390, h: 570, unified: true,
        x: window.innerWidth - 410, y: 60
    });
    w.body.className = "win-body machelp";
    w.body.style.cssText = "display:flex;flex-direction:column;padding:0";
    w.body.innerHTML =
        '<div class="mh-bar"><span class="nav">‹</span><span class="nav dim">›</span>' +
        '<span class="nav">▤</span><span class="nav">↑</span>' +
        '<span class="search"><input placeholder="Search" spellcheck="false"></span></div>' +
        '<div class="mh-body"><div class="card">' +
        '<div class="q">?</div><h3>The selected topic is currently unavailable.</h3>' +
        "<p>Some content is available only when your computer is connected to the Internet.</p>" +
        "</div></div>";
    w.body.querySelector("input").addEventListener("keydown", function (e) { e.stopPropagation(); });
    return w;
}

var EMOJI = ("😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 😘 😗 😙 😚 😋 😛 😝 😜 🤪 " +
    "🤨 🧐 🤓 😎 🤩 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 😤 😠 😡 🤬 😶 😐 😑 😯 😦 😧 " +
    "😮 😲 😵 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 🤥 😬 🙄 😴 🤤 😪 😵 🤐 🥴 🤢").split(" ");

function openEmojiPanel() {
    var w = winCreate({
        app: activeApp, title: "", w: 280, h: 350,
        resizable: false, zoomable: false, minimizable: false, chromeless: true,
        x: (window.innerWidth - 280) / 2, y: 190
    });
    w.body.className = "win-body emoji";
    w.body.innerHTML =
        '<div class="em-bar"><span class="x">✕</span><span class="grow"></span><span class="full">▦</span></div>' +
        '<div class="em-search"><input placeholder="🔍  Search" spellcheck="false"></div>' +
        '<div class="em-head">SMILEYS &amp; PEOPLE</div>' +
        '<div class="em-grid">' + EMOJI.map(function (e) {
            return "<span>" + e + "</span>";
        }).join("") + "</div>" +
        '<div class="em-foot">' + "🕐 😀 🐻 🍏 ⚽ 🚗 💡 🔣 🏳 »".split(" ").map(function (e) {
            return "<span>" + e + "</span>";
        }).join("") + "</div>";
    w.body.querySelector(".x").addEventListener("click", function () { winClose(w); });
    w.body.querySelector("input").addEventListener("keydown", function (e) { e.stopPropagation(); });
    return w;
}
