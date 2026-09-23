"use strict";
/* Mission Control: every window on the desktop laid out side by side, the
   Spaces bar along the top, and dragging windows between desktops.

   Measured off the four 7.24 shots and ref_pic/mission control open.mp4
   (1280x800, 60fps, real time):

     * opening takes 15 frames (250ms) and closing 13 (220ms); tracking a
       window through both fits CSS ease-in-out almost exactly.  The menu
       bar and the desktop icons fade over the same stretch; the wallpaper
       is untouched.
     * the bar starts collapsed, 40px tall with the desktop names on it,
       and grows to 146px of thumbnails once the pointer reaches it.
     * every window shrinks by the same factor (0.52 with the bar collapsed,
       0.507 open), in rows that fill the space between the bar and the
       Dock: 18px in from the sides, 28px under the bar and 44px above the
       Dock, with at least 10px between windows (see mcCompute).
     * a hovered window gets a 4px #4592ee ring, 1px clear of its edge. */

var MC_OPEN_MS = 250, MC_CLOSE_MS = 220;
var MC_EASE = "cubic-bezier(.42, 0, .58, 1)";
var MC_BAR = 40, MC_BAR_OPEN = 146;
var MC_SIDE = 18, MC_TOP_GAP = 28, MC_BOTTOM_GAP = 44, MC_GAP = 10;
var MC_FILL = 0.76;         /* provisional size for untangling, as a share of the area */
var MC_THUMB_W = 144, MC_THUMB_H = 90, MC_THUMB_PITCH = 176, MC_THUMB_TOP = 28;

var mcOn = false, mcExpanded = false, mcCloseTimer = null, mcDrag = null;

function mcToggle() { mcOn ? mcClose() : mcOpen(); }

function mcWindows() {
    return wins.filter(function (w) {
        return w.space === curSpace && !w.minimized && !w.hidden && !w._genie;
    });
}

/* ------------------------------------------------------------------ */
/* OPEN / CLOSE                                                        */
/* ------------------------------------------------------------------ */
function mcOpen() {
    if (mcOn || !loggedIn) return;
    clearTimeout(mcCloseTimer);
    menuCloseAll();
    if (spotOn) spotClose();
    if (lpOn) lpClose();
    spaceSlideFinish();

    mcOn = true;
    mcExpanded = false;
    var root = $("mc");
    root.classList.remove("hidden", "expanded");
    mcRenderBar();
    void root.offsetWidth;
    root.classList.add("on");
    $("screen").classList.add("mc-fading", "mc-open");
    mcLayout(MC_OPEN_MS);
}

/* focus: a window that was clicked, which comes to the front on the way out */
function mcClose(focus) {
    if (!mcOn) return;
    mcOn = false;
    mcDrag = null;
    var root = $("mc");
    root.classList.remove("on", "dragging", "alt");
    $("screen").classList.remove("mc-open");
    $("mcHits").innerHTML = "";

    wins.forEach(function (w) {
        if (!w.node.style.transform) return;
        w.node.style.transition = "transform " + MC_CLOSE_MS + "ms " + MC_EASE;
        w.node.style.transform = "";
    });
    if (focus) winFocus(focus);

    clearTimeout(mcCloseTimer);
    mcCloseTimer = setTimeout(function () {
        root.classList.add("hidden");
        root.classList.remove("expanded");
        $("screen").classList.remove("mc-fading");
        wins.forEach(function (w) {
            w.node.style.transition = "";
            w.node.style.transformOrigin = "";
        });
    }, MC_CLOSE_MS + 20);
}

/* ------------------------------------------------------------------ */
/* LAYOUT                                                              */
/* ------------------------------------------------------------------ */
function mcArea() {
    var W = window.innerWidth, H = window.innerHeight;
    var dockH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--dock-h")) || 77;
    var side = sys.dockPosition;
    return {
        l: MC_SIDE + (side === "left" ? dockH : 0),
        r: W - MC_SIDE - (side === "right" ? dockH : 0),
        t: (mcExpanded ? MC_BAR_OPEN : MC_BAR) + MC_TOP_GAP,
        b: H - (side === "bottom" ? dockH : 0) - MC_BOTTOM_GAP
    };
}

/* How the windows are arranged, worked out against the reference shots
   (the collapsed layout comes out within 2px across, the open one at 0.501
   against a measured 0.507):

     1. each window starts where it is on the desktop, mapped into the free
        area at a provisional size, and overlapping pairs are pushed apart
        along the line between their centres -- so the arrangement is kept;
     2. that picture is cut into rows (windows whose heights overlap), and a
        few evenly split row counts are tried alongside it;
     3. for each, the largest scale is found at which every row fits across
        with 10px gaps and each window, dropped down its own columns, clears
        the ones above it -- and the arrangement allowing the biggest
        windows wins (the reference's own is limited by its top row);
     4. rows are justified edge to edge, the first row sits on the top of
        the area and the last on its bottom.

   The rows are always found in the collapsed bar's area, so opening the
   bar resizes the arrangement rather than reshuffling it. */
var MC_ROW_BIAS = 1.03;     /* how much the natural rows are preferred */

function mcCompute(list, area) {
    var items = list.map(function (w) {
        var n = w.node;
        return { w: w, x: n.offsetLeft, y: n.offsetTop + 22, ow: n.offsetWidth, oh: n.offsetHeight };
    });
    if (!items.length || area.r - area.l < 40 || area.b - area.t < 40) return [];

    var topo = { l: area.l, r: area.r, t: MC_BAR + MC_TOP_GAP, b: area.b };
    mcUntangle(items, topo);

    var cands = [{ rows: mcNaturalRows(items), bias: MC_ROW_BIAS }];
    var most = Math.min(items.length, Math.ceil(Math.sqrt(items.length)) + 1);
    for (var k = 1; k <= most; k++) cands.push({ rows: mcBalancedRows(items, k), bias: 1 });
    var best = null;
    cands.forEach(function (c) {
        var sc = mcFit(c.rows, topo) * c.bias;
        if (!best || sc > best.score) best = { rows: c.rows, score: sc };
    });

    var rows = best.rows;
    var s = mcFit(rows, area);
    mcPlaceRows(rows, area, s);

    if (rows.length === 1) {
        items.forEach(function (it) { it.Y = area.t + (area.b - area.t - it.H) / 2; });
    } else {
        var last = rows[rows.length - 1];
        last.forEach(function (it) { it.Y = area.b - it.H; });
        /* middle rows spread down as far as the last row lets them */
        var mids = [].concat.apply([], rows.slice(1, -1)), f = Infinity;
        mids.forEach(function (it) {
            var lim = area.b;
            last.forEach(function (q) { if (mcColumnsMeet(it, q)) lim = Math.min(lim, q.Y - MC_GAP); });
            var d = it.Y - area.t;
            if (d > 0.5) f = Math.min(f, (lim - it.H - area.t) / d);
        });
        f = f === Infinity ? 1 : Math.max(1, f);
        mids.forEach(function (it) { it.Y = area.t + (it.Y - area.t) * f; });
    }

    items.forEach(function (it) { it.s = s; it.sw = it.W; it.sh = it.H; });
    return items;
}

function mcColumnsMeet(a, b) {
    return a.X < b.X + b.W + MC_GAP && a.X + a.W + MC_GAP > b.X;
}

function mcUntangle(items, area) {
    var W = window.innerWidth, H = window.innerHeight;
    var dockH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--dock-h")) || 77;
    var vSpan = Math.max(1, H - 22 - (sys.dockPosition === "bottom" ? dockH : 0));
    var aw = area.r - area.l, ah = area.b - area.t, total = 0;
    items.forEach(function (it) { total += it.ow * it.oh; });
    var s = Math.min(1, Math.sqrt(MC_FILL * aw * ah / total));

    for (var attempt = 0; attempt < 30; attempt++) {
        items.forEach(function (it) {
            it.sw = it.ow * s;
            it.sh = it.oh * s;
            it.cx = area.l + (it.x + it.ow / 2) / W * aw;
            it.cy = area.t + (it.y + it.oh / 2 - 22) / vSpan * ah;
        });
        var clear = false;
        for (var iter = 0; iter < 600; iter++) {
            var moved = false;
            for (var i = 0; i < items.length; i++) {
                for (var j = i + 1; j < items.length; j++) {
                    var a = items[i], b = items[j];
                    var dx = b.cx - a.cx, dy = b.cy - a.cy;
                    var ox = (a.sw + b.sw) / 2 + MC_GAP - Math.abs(dx);
                    var oy = (a.sh + b.sh) / 2 + MC_GAP - Math.abs(dy);
                    if (ox <= 0 || oy <= 0) continue;
                    moved = true;
                    var nx = dx / aw, ny = dy / ah;
                    if (!nx && !ny) nx = j % 2 ? 1 : -1;
                    var len = Math.sqrt(nx * nx + ny * ny), m = Math.min(ox, oy) / 2;
                    nx /= len; ny /= len;
                    a.cx -= nx * m; b.cx += nx * m;
                    a.cy -= ny * m; b.cy += ny * m;
                }
            }
            items.forEach(function (it) {
                it.cx = clamp(it.cx, area.l + it.sw / 2, Math.max(area.l + it.sw / 2, area.r - it.sw / 2));
                it.cy = clamp(it.cy, area.t + it.sh / 2, Math.max(area.t + it.sh / 2, area.b - it.sh / 2));
            });
            if (!moved) { clear = true; break; }
        }
        if (clear) break;
        s *= 0.95;
    }
}

function mcNaturalRows(items) {
    var rows = [];
    items.slice().sort(function (a, b) { return (a.cy - a.sh / 2) - (b.cy - b.sh / 2); })
        .forEach(function (it) {
            var t = it.cy - it.sh / 2, b = it.cy + it.sh / 2;
            var row = rows.filter(function (r) { return t < r.b - 1 && b > r.t + 1; })[0];
            if (row) { row.items.push(it); row.t = Math.min(row.t, t); row.b = Math.max(row.b, b); }
            else rows.push({ items: [it], t: t, b: b });
        });
    return rows.sort(function (a, b) { return a.t - b.t; }).map(function (r) { return r.items; });
}

function mcBalancedRows(items, k) {
    var sorted = items.slice().sort(function (a, b) { return a.cy - b.cy; });
    var out = [], i = 0;
    for (var r = 0; r < k; r++) {
        var take = Math.round((sorted.length - i) / (k - r));
        if (take) out.push(sorted.slice(i, i + take));
        i += take;
    }
    return out;
}

/* lays the rows out at scale s; returns the lowest bottom edge */
function mcPlaceRows(rows, area, s) {
    var aw = area.r - area.l, placed = [], lowest = area.t;
    rows.forEach(function (r) {
        r.sort(function (a, b) { return a.cx - b.cx; });
        var n = r.length, sumW = 0;
        r.forEach(function (it) { sumW += it.ow * s; });
        if (n === 1) {
            /* a window alone on its row keeps its place across */
            var it0 = r[0];
            var tx = aw > it0.sw ? clamp((it0.cx - area.l - it0.sw / 2) / (aw - it0.sw), 0, 1) : 0.5;
            it0.X = area.l + (aw - it0.ow * s) * tx;
        } else {
            var g = rows.length === 1 ? clamp((aw - sumW) / (n - 1), MC_GAP, 60) : (aw - sumW) / (n - 1);
            var x = area.l + (aw - sumW - g * (n - 1)) / 2;
            r.forEach(function (it) { it.X = x; x += it.ow * s + g; });
        }
        r.forEach(function (it) {
            it.W = it.ow * s;
            it.H = it.oh * s;
            var y = area.t;
            placed.forEach(function (p) { if (mcColumnsMeet(it, p)) y = Math.max(y, p.Y + p.H + MC_GAP); });
            it.Y = y;
            lowest = Math.max(lowest, y + it.H);
        });
        placed = placed.concat(r);
    });
    return lowest;
}

/* the biggest scale (at most 1) at which the rows fit the area */
function mcFit(rows, area) {
    var aw = area.r - area.l, hi = 1, lo = 0.02;
    rows.forEach(function (r) {
        var sum = 0;
        r.forEach(function (it) { sum += it.ow; });
        hi = Math.min(hi, (aw - MC_GAP * (r.length - 1)) / sum);
    });
    if (mcPlaceRows(rows, area, hi) <= area.b + 0.5) return hi;
    for (var i = 0; i < 28; i++) {
        var m = (lo + hi) / 2;
        if (mcPlaceRows(rows, area, m) <= area.b + 0.5) lo = m; else hi = m;
    }
    return lo;
}

function mcLayout(ms) {
    if (!mcOn) return;
    var items = mcCompute(mcWindows(), mcArea());
    var hits = $("mcHits");
    hits.innerHTML = "";
    items.forEach(function (it) {
        var w = it.w;
        w._mc = it;
        if (!(mcDrag && mcDrag.moved && mcDrag.w === w)) {
            w.node.style.transformOrigin = "0 0";
            w.node.style.transition = ms ? "transform " + ms + "ms " + MC_EASE : "none";
            w.node.style.transform = "translate(" + (it.X - it.x).toFixed(2) + "px," +
                (it.Y - it.y).toFixed(2) + "px) scale(" + it.s.toFixed(4) + ")";
        }
        var h = el("div", "mc-hit");
        h.style.cssText = "left:" + it.X + "px;top:" + it.Y + "px;width:" + it.sw + "px;height:" +
            it.sh + "px;z-index:" + (w.z || 1);
        h._w = w;
        hits.appendChild(h);
    });
}

/* ------------------------------------------------------------------ */
/* THE SPACES BAR                                                      */
/* ------------------------------------------------------------------ */
function mcThumbShot(id) {
    var W = window.innerWidth, H = window.innerHeight;
    var box = el("div", "mc-shot");
    var inner = el("div", "mc-shot-inner");
    inner.style.cssText = "width:" + W + "px;height:" + H + "px;transform:scale(" +
        (MC_THUMB_W / W).toFixed(5) + ")";
    var layer = el("div", "mc-shot-wins");
    spaceWindows(id).forEach(function (w) {
        if (w.minimized || w.hidden) return;
        var c = w.node.cloneNode(true);
        c.removeAttribute("id");
        Array.prototype.forEach.call(c.querySelectorAll("[id]"), function (n) { n.removeAttribute("id"); });
        c.style.transform = "";
        c.style.transition = "";
        c.style.visibility = "";
        layer.appendChild(c);
    });
    inner.appendChild(layer);
    box.appendChild(inner);
    return box;
}

function mcRenderBar() {
    var W = window.innerWidth, n = spaces.length;
    var names = $("mcNames"), thumbs = $("mcThumbs");
    names.innerHTML = "";
    thumbs.innerHTML = "";
    $("mc").classList.toggle("multi", n > 1);

    spaces.forEach(function (sp, i) {
        var cx = W / 2 + (i - (n - 1) / 2) * MC_THUMB_PITCH;
        var cur = sp.id === curSpace;

        var nm = el("div", "mc-name" + (cur ? " cur" : ""), esc(spaceName(sp.id)));
        nm.style.left = cx + "px";
        nm._space = sp.id;
        names.appendChild(nm);

        var t = el("div", "mc-thumb" + (cur ? " cur" : ""));
        t.style.left = Math.round(cx - MC_THUMB_W / 2) + "px";
        t._space = sp.id;
        t.appendChild(mcThumbShot(sp.id));
        t.appendChild(el("div", "mc-tlabel", esc(spaceName(sp.id))));
        var x = el("div", "mc-x");
        x.innerHTML = '<svg viewBox="0 0 10 10"><path d="M2.5 2.5l5 5m0-5l-5 5"/></svg>';
        t.appendChild(x);
        thumbs.appendChild(t);
    });
}

function mcExpand() {
    if (!mcOn || mcExpanded) return;
    mcExpanded = true;
    $("mc").classList.add("expanded");
    mcRenderBar();
    mcLayout(MC_OPEN_MS);
}

function mcGoSpace(id) {
    if (id !== curSpace) {
        mcWindows().forEach(function (w) {
            w.node.style.transition = "none";
            w.node.style.transform = "";
        });
        spaceSwitch(id, { instant: true });
        mcLayout(0);
        void $("windows").offsetWidth;
    }
    mcClose();
}

function mcStepSpace(dir) {
    var i = spaceIndex(curSpace) + dir;
    if (i < 0 || i >= spaces.length) return;
    mcWindows().forEach(function (w) {
        w.node.style.transition = "none";
        w.node.style.transform = "";
    });
    spaceSwitch(spaces[i].id, { instant: true });
    mcRenderBar();
    mcLayout(MC_OPEN_MS);
}

function mcSpacesChanged() {
    mcRenderBar();
    mcLayout(MC_OPEN_MS);
}

/* ------------------------------------------------------------------ */
/* INPUT                                                               */
/* ------------------------------------------------------------------ */
function mcDropTarget(x, y) {
    var hit = document.elementFromPoint(x, y);
    if (!hit || !hit.closest) return null;
    var t = hit.closest(".mc-thumb, .mc-name");
    if (t) return { space: t._space, node: t };
    if (hit.closest("#mcAdd")) return { add: true, node: $("mcAdd") };
    return null;
}

function mcInit() {
    var root = $("mc");

    root.addEventListener("contextmenu", function (e) { e.preventDefault(); e.stopPropagation(); });

    root.addEventListener("mousedown", function (e) {
        if (e.button === 2) return;
        e.preventDefault();
        menuCloseAll();
        var hit = e.target.closest(".mc-hit");
        if (hit) {
            mcDrag = { w: hit._w, hit: hit, sx: e.clientX, sy: e.clientY, moved: false };
            return;
        }
        var x = e.target.closest(".mc-x");
        if (x) {
            spaceRemove(x.parentNode._space);
            mcSpacesChanged();
            return;
        }
        if (e.target.closest("#mcAdd")) {
            spaceAdd();
            mcSpacesChanged();
            return;
        }
        var t = e.target.closest(".mc-thumb, .mc-name");
        if (t) { mcDrag = { space: t._space, sx: e.clientX, sy: e.clientY }; return; }
        if (!e.target.closest("#mcBar")) mcDrag = { bg: true };
    });

    document.addEventListener("mousemove", function (e) {
        if (!mcOn) return;
        if (e.clientY < MC_BAR && !mcExpanded) mcExpand();
        var d = mcDrag;
        if (!d || !d.w) return;
        if (!d.moved) {
            if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) < 5) return;
            d.moved = true;
            root.classList.add("dragging");
            d.it = d.w._mc;
            d.w.node.style.transition = "none";
            d.w.node.style.zIndex = ++zTop;
            mcExpand();
        }
        var it = d.it;
        d.w.node.style.transform = "translate(" + (it.X - it.x + e.clientX - d.sx) + "px," +
            (it.Y - it.y + e.clientY - d.sy) + "px) scale(" + it.s + ")";
        var over = mcDropTarget(e.clientX, e.clientY);
        Array.prototype.forEach.call(root.querySelectorAll(".drop"), function (n) { n.classList.remove("drop"); });
        if (over) over.node.classList.add("drop");
    });

    document.addEventListener("mouseup", function (e) {
        var d = mcDrag;
        mcDrag = null;
        if (!mcOn || !d) return;
        Array.prototype.forEach.call(root.querySelectorAll(".drop"), function (n) { n.classList.remove("drop"); });
        root.classList.remove("dragging");

        if (d.w && !d.moved) {
            if (e.target.closest && e.target.closest(".mc-hit") === d.hit) mcClose(d.w);
            return;
        }
        if (d.w) {
            var over = mcDropTarget(e.clientX, e.clientY);
            if (over && over.add) winMoveToSpace(d.w, spaceAdd().id);
            else if (over && over.space !== curSpace) winMoveToSpace(d.w, over.space);
            mcSpacesChanged();
            return;
        }
        if (d.space != null) {
            var t = e.target.closest && e.target.closest(".mc-thumb, .mc-name");
            if (t && t._space === d.space && !e.target.closest(".mc-x")) mcGoSpace(d.space);
            return;
        }
        if (d.bg && root.contains(e.target) && !e.target.closest("#mcBar, .mc-hit")) mcClose();
    });

    root.addEventListener("mouseover", function (e) {
        var hit = e.target.closest(".mc-hit");
        Array.prototype.forEach.call(root.querySelectorAll(".mc-hit.on"), function (n) {
            if (n !== hit) n.classList.remove("on");
        });
        if (hit && !mcDrag) hit.classList.add("on");
    });
    root.addEventListener("mouseleave", function () {
        Array.prototype.forEach.call(root.querySelectorAll(".mc-hit.on"), function (n) { n.classList.remove("on"); });
    });

    /* registered ahead of the global shortcuts, so nothing reaches the
       windows while they are laid out */
    document.addEventListener("keydown", function (e) {
        if (!loggedIn) return;
        var toggle = e.key === "F3" || (e.ctrlKey && !e.metaKey && e.key === "ArrowUp");
        if (!mcOn) {
            if (toggle) { e.preventDefault(); e.stopImmediatePropagation(); if (lpOn) lpClose(); mcOpen(); }
            return;
        }
        e.stopImmediatePropagation();
        if (e.key === "Alt") { root.classList.add("alt"); return; }
        if (toggle || (e.key === "Escape" && !e.defaultPrevented)) { e.preventDefault(); mcClose(); }
    });
    document.addEventListener("keyup", function (e) {
        if (e.key === "Alt") root.classList.remove("alt");
    });
    window.addEventListener("blur", function () { root.classList.remove("alt"); });

    window.addEventListener("resize", function () {
        if (!mcOn) return;
        mcRenderBar();
        mcLayout(0);
    });
}
