"use strict";
/* The genie effect, traced from ref_pic/app minimize.mp4.

   The recording exported at double speed, so its 367ms of deformation is
   733ms in real time -- which matches Apple's own 0.7s minimise.  Tracking
   the window's pixels frame by frame shows what happens in between:

     * the window's bottom edge goes first and its top edge does not move
       at all until roughly 60% of the way through, so the deformation
       travels up the window rather than squashing it evenly;
     * every row narrows as it falls, converging on the Dock slot;
     * the horizontal convergence lags the vertical fall, which is what
       bends the neck into the S the effect is named for;
     * nothing fades -- the window is at full opacity until it is gone.

   A browser cannot warp a live element along a curve, so the window is cut
   into horizontal bands, each a clone clipped to its own slice, and each
   band is placed, scaled and narrowed on its own.  Sixteen bands is enough
   that the joins are not visible at this speed. */

var GENIE_MS = 730;
var GENIE_BANDS = 16;
var GENIE_SPREAD = 1.0;     /* how far the deformation lags up the window */

function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* the slot a window minimises into: its own tile in the Dock */
function genieTarget(w) {
    var tile = $("dockmin-" + w.id);
    if (tile) {
        var r = tile.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top, w: r.width, h: r.height };
    }
    var d = dockEl ? dockEl.getBoundingClientRect() : { left: 0, width: window.innerWidth, top: window.innerHeight - 70 };
    return { x: d.left + d.width - 90, y: d.top + 6, w: DOCK_ICON, h: DOCK_ICON };
}

/* one band: a clone of the window clipped to the rows it owns */
function genieBand(w, i, bandH, rect) {
    var band = el("div", "genie-band");
    band.style.cssText = "position:absolute;left:" + rect.left + "px;top:" +
        (rect.top + i * bandH) + "px;width:" + rect.width + "px;height:" + bandH +
        "px;overflow:hidden;transform-origin:0 0;will-change:transform";
    var clone = w.node.cloneNode(true);
    clone.style.cssText = "position:absolute;left:0;top:" + (-i * bandH) + "px;width:" +
        rect.width + "px;height:" + rect.height + "px;margin:0;box-shadow:none";
    clone.classList.remove("inactive");
    band.appendChild(clone);
    return band;
}

/* Building the bands and positioning them are kept apart so the effect can
   be driven by a clock or seeked straight to one moment, which is how it
   gets compared against the recording frame by frame. */
function genieBuild(w) {
    var rect = w.node.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    var t = genieTarget(w);
    var n = GENIE_BANDS;
    var bandH = rect.height / n;

    var layer = el("div", "genie");
    layer.style.cssText = "position:fixed;inset:0;z-index:640;pointer-events:none";
    var bands = [];
    for (var i = 0; i < n; i++) {
        var b = genieBand(w, i, bandH, rect);
        bands.push(b);
        layer.appendChild(b);
    }
    document.body.appendChild(layer);
    w.node.style.visibility = "hidden";
    w._genie = layer;
    return {
        w: w, layer: layer, bands: bands, rect: rect, t: t,
        n: n, bandH: bandH, srcCx: rect.left + rect.width / 2
    };
}

/* Where a horizontal line at depth u (0 at the window's top, 1 at its
   foot) sits at progress q, and how wide it is there.  Every band asks this
   for its own top and bottom edge, so neighbouring bands share an edge
   exactly and the ribbon is continuous. */
function genieEdge(st, u, q) {
    var s = clamp(q * (1 + GENIE_SPREAD) - (1 - u) * GENIE_SPREAD, 0, 1);
    var e = easeInOut(s);
    return {
        y: (st.rect.top + u * st.rect.height) +
            (st.t.y + u * st.t.h - (st.rect.top + u * st.rect.height)) * e,
        cx: st.srcCx + (st.t.x - st.srcCx) * Math.pow(e, 1.35),
        w: st.rect.width + (st.t.w - st.rect.width) * e
    };
}

/* The projective transform that maps a band's own rectangle onto the
   trapezoid between its two edges.  A plain scale would make every band a
   rectangle and the neck would come out as a staircase; mapping the four
   corners instead lets each band taper, which is what makes the curve
   read as one smooth ribbon. */
function quadTransform(W, H, c) {
    var x0 = c[0][0], y0 = c[0][1], x1 = c[1][0], y1 = c[1][1];
    var x2 = c[2][0], y2 = c[2][1], x3 = c[3][0], y3 = c[3][1];
    var dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
    var dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    var a, b, cc, d, e, f, g, h;
    var den = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9 || Math.abs(den) < 1e-9) {
        a = x1 - x0; b = x3 - x0; cc = x0;
        d = y1 - y0; e = y3 - y0; f = y0;
        g = 0; h = 0;
    } else {
        g = (dx3 * dy2 - dy3 * dx2) / den;
        h = (dx1 * dy3 - dy1 * dx3) / den;
        a = x1 - x0 + g * x1;
        b = x3 - x0 + h * x3;
        cc = x0;
        d = y1 - y0 + g * y1;
        e = y3 - y0 + h * y3;
        f = y0;
        g = g; h = h;
    }
    /* fold the element's own size in, so the source is its rectangle */
    var m = [a / W, d / W, 0, g / W,
             b / H, e / H, 0, h / H,
             0, 0, 1, 0,
             cc, f, 0, 1];
    return "matrix3d(" + m.map(function (v) { return v.toFixed(6); }).join(",") + ")";
}

/* q is 0 for the window at rest and 1 for it fully swallowed */
function genieApply(st, q) {
    for (var i = 0; i < st.n; i++) {
        var top = genieEdge(st, i / st.n, q);
        var bot = genieEdge(st, (i + 1) / st.n, q);
        /* relative to the band's own top-left corner */
        var ox = st.rect.left, oy = st.rect.top + i * st.bandH;
        var quad = [
            [top.cx - top.w / 2 - ox, top.y - oy],
            [top.cx + top.w / 2 - ox, top.y - oy],
            [bot.cx + bot.w / 2 - ox, bot.y - oy],
            [bot.cx - bot.w / 2 - ox, bot.y - oy]
        ];
        st.bands[i].style.transform = quadTransform(st.rect.width, st.bandH, quad);
    }
}

function genieTeardown(st) {
    st.layer.remove();
    st.w._genie = null;
}

/* Runs the effect.  dir is 1 to minimise, -1 to come back out. */
function genie(w, dir, done) {
    if (w._genie) return;
    var st = genieBuild(w);
    if (!st) { if (done) done(); return; }

    var t0 = null;
    var frame = function (now) {
        if (t0 === null) t0 = now;
        var p = clamp((now - t0) / GENIE_MS, 0, 1);
        genieApply(st, dir > 0 ? p : 1 - p);
        if (p < 1) { w._genieRaf = requestAnimationFrame(frame); return; }
        genieTeardown(st);
        if (done) done();
    };
    genieApply(st, dir > 0 ? 0 : 1);
    w._genieRaf = requestAnimationFrame(frame);
}

/* hold the effect still at one moment, for comparing against the clip */
function genieFreeze(w, p) {
    if (w._genie) return null;
    var st = genieBuild(w);
    if (st) genieApply(st, clamp(p, 0, 1));
    return st;
}

/* ------------------------------------------------------------------ */
/* MINIMISE AND COME BACK                                              */
/* ------------------------------------------------------------------ */
function winMinimize(w) {
    if (!w || w.minimized || w._genie) return;
    if (w.zoomed) winZoom(w);          /* a zoomed window un-zooms first */
    w.minimized = true;
    w.thumbHTML = w.node.outerHTML;    /* the Dock tile's picture of it */
    dockRender();                      /* make room, so the target exists */
    genie(w, 1, function () {
        w.node.classList.add("hidden");
        w.node.style.visibility = "";
        var next = frontWindow();
        if (next) winFocus(next);
        dockSync();
    });
}

function winRestore(w) {
    if (!w || !w.minimized || w._genie) return;
    w.minimized = false;
    w.node.classList.remove("hidden");
    genie(w, -1, function () {
        w.node.style.visibility = "";
        dockRender();
        winFocus(w);
    });
}
