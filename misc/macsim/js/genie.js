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
        return { left: r.left, top: r.top, w: r.width, h: r.height };
    }
    var d = dockEl ? dockEl.getBoundingClientRect() :
        { left: 0, top: window.innerHeight - 70, width: window.innerWidth, height: 70 };
    return { left: d.left + d.width - 90, top: d.top + 6, w: DOCK_ICON, h: DOCK_ICON };
}

/* one band: a clone of the window clipped to the slice it owns. Bottom
   Dock bands are horizontal rows stacked down the window (as traced); a
   side Dock's are vertical columns stacked across it instead, since the
   window falls sideways into a Dock on the left or right. */
function genieBand(st, i) {
    var rect = st.rect, bandSize = st.bandSize;
    var band = el("div", "genie-band");
    var clone = st.w.node.cloneNode(true);
    if (st.axis === "y") {
        band.style.cssText = "position:absolute;left:" + rect.left + "px;top:" +
            (rect.top + i * bandSize) + "px;width:" + rect.width + "px;height:" + bandSize +
            "px;overflow:hidden;transform-origin:0 0;will-change:transform";
        clone.style.cssText = "position:absolute;left:0;top:" + (-i * bandSize) + "px;width:" +
            rect.width + "px;height:" + rect.height + "px;margin:0;box-shadow:none";
    } else {
        band.style.cssText = "position:absolute;left:" + (rect.left + i * bandSize) + "px;top:" +
            rect.top + "px;width:" + bandSize + "px;height:" + rect.height +
            "px;overflow:hidden;transform-origin:0 0;will-change:transform";
        clone.style.cssText = "position:absolute;left:" + (-i * bandSize) + "px;top:0;width:" +
            rect.width + "px;height:" + rect.height + "px;margin:0;box-shadow:none";
    }
    clone.classList.remove("inactive");
    band.appendChild(clone);
    return band;
}

/* Building the bands and positioning them are kept apart so the effect can
   be driven by a clock or seeked straight to one moment, which is how it
   gets compared against the recording frame by frame.

   axis is which screen axis the Dock sits across: "y" (bottom Dock, the
   traced case) bands the window into rows and falls it straight down;
   "x" (left/right Dock) bands it into columns and falls it sideways.
   invert flags the one case where the leading edge is the *smaller*
   coordinate (a left Dock, where the window's own left edge -- not its
   right -- is the one closest to the target and so the one that moves
   first); see genieEdge. */
function genieBuild(w) {
    var rect = w.node.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    var t = genieTarget(w);
    var axis = sys.dockPosition === "bottom" ? "y" : "x";
    var n = GENIE_BANDS;

    var st = { w: w, rect: rect, t: t, n: n, axis: axis };
    if (axis === "y") {
        st.bandSize = rect.height / n;
        st.srcMin = rect.top; st.srcMax = rect.top + rect.height;
        st.tgtMin = t.top; st.tgtMax = t.top + t.h;
        st.srcCross = rect.left + rect.width / 2; st.srcCrossExtent = rect.width;
        st.tgtCross = t.left + t.w / 2; st.tgtCrossExtent = t.w;
        st.invert = false;
    } else {
        st.bandSize = rect.width / n;
        st.srcMin = rect.left; st.srcMax = rect.left + rect.width;
        st.tgtMin = t.left; st.tgtMax = t.left + t.w;
        st.srcCross = rect.top + rect.height / 2; st.srcCrossExtent = rect.height;
        st.tgtCross = t.top + t.h / 2; st.tgtCrossExtent = t.h;
        st.invert = sys.dockPosition === "left";
    }

    var layer = el("div", "genie");
    layer.style.cssText = "position:fixed;inset:0;z-index:640;pointer-events:none";
    var bands = [];
    st.layer = layer; st.bands = bands;
    for (var i = 0; i < n; i++) {
        var b = genieBand(st, i);
        bands.push(b);
        layer.appendChild(b);
    }
    document.body.appendChild(layer);
    w.node.style.visibility = "hidden";
    w._genie = layer;
    return st;
}

/* Where a line at depth f (0 at the window's physically first edge, 1 at
   its last, always in ascending screen-coordinate order) sits at progress
   q, and how wide the ribbon is there.  Every band asks this for its own
   near and far edge, so neighbouring bands share an edge exactly and the
   ribbon is continuous.

   f only fixes *where* a band's geometry falls; the deformation *timing*
   is driven separately by lead, which is 1 at whichever edge is closest to
   the Dock (leads the fall) and 0 at the far edge (lags) -- for a bottom
   or right Dock that is the larger-coordinate edge, same as f itself, but
   for a left Dock the near edge is the *smaller* one, hence invert. */
function genieEdge(st, f, q) {
    var lead = st.invert ? 1 - f : f;
    var s = clamp(q * (1 + GENIE_SPREAD) - (1 - lead) * GENIE_SPREAD, 0, 1);
    var e = easeInOut(s);
    var srcP = st.srcMin + f * (st.srcMax - st.srcMin);
    var tgtP = st.tgtMin + f * (st.tgtMax - st.tgtMin);
    return {
        p: srcP + (tgtP - srcP) * e,
        c: st.srcCross + (st.tgtCross - st.srcCross) * Math.pow(e, 1.35),
        s: st.srcCrossExtent + (st.tgtCrossExtent - st.srcCrossExtent) * e
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
        var e1 = genieEdge(st, i / st.n, q);
        var e2 = genieEdge(st, (i + 1) / st.n, q);
        var quad;
        if (st.axis === "y") {
            /* relative to the band's own top-left corner */
            var ox = st.rect.left, oy = st.rect.top + i * st.bandSize;
            quad = [
                [e1.c - e1.s / 2 - ox, e1.p - oy],
                [e1.c + e1.s / 2 - ox, e1.p - oy],
                [e2.c + e2.s / 2 - ox, e2.p - oy],
                [e2.c - e2.s / 2 - ox, e2.p - oy]
            ];
            st.bands[i].style.transform = quadTransform(st.rect.width, st.bandSize, quad);
        } else {
            var ox2 = st.rect.left + i * st.bandSize, oy2 = st.rect.top;
            quad = [
                [e1.p - ox2, e1.c - e1.s / 2 - oy2],
                [e2.p - ox2, e2.c - e2.s / 2 - oy2],
                [e2.p - ox2, e2.c + e2.s / 2 - oy2],
                [e1.p - ox2, e1.c + e1.s / 2 - oy2]
            ];
            st.bands[i].style.transform = quadTransform(st.bandSize, st.rect.height, quad);
        }
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
/* SCALE EFFECT                                                        */
/* ------------------------------------------------------------------ */
/* The plainer alternative to the genie: no bands, the window's clone just
   scales and slides as one piece into its Dock slot.  There's no reference
   clip for this one -- only the genie was frame-traced -- so the timing
   borrows the genie's own 730ms and easing rather than guessing at new
   numbers of its own. */
function scaleEffect(w, dir, done) {
    if (w._genie) return;
    var rect = w.node.getBoundingClientRect();
    if (!rect.width || !rect.height) { if (done) done(); return; }
    var t = genieTarget(w);
    var sx = t.w / rect.width, sy = t.h / rect.height;
    var dx = t.left - rect.left, dy = t.top - rect.top;

    var clone = w.node.cloneNode(true);
    clone.classList.remove("inactive");
    clone.style.cssText = "position:fixed;left:" + rect.left + "px;top:" + rect.top +
        "px;width:" + rect.width + "px;height:" + rect.height +
        "px;margin:0;box-shadow:none;z-index:640;pointer-events:none;transform-origin:0 0;will-change:transform";
    document.body.appendChild(clone);
    w.node.style.visibility = "hidden";
    w._genie = clone;

    var setAt = function (q) {
        var e = easeInOut(q);
        clone.style.transform = "translate(" + (dx * e).toFixed(2) + "px," + (dy * e).toFixed(2) +
            "px) scale(" + (1 + (sx - 1) * e).toFixed(4) + "," + (1 + (sy - 1) * e).toFixed(4) + ")";
    };

    var t0 = null;
    var frame = function (now) {
        if (t0 === null) t0 = now;
        var p = clamp((now - t0) / GENIE_MS, 0, 1);
        setAt(dir > 0 ? p : 1 - p);
        if (p < 1) { w._genieRaf = requestAnimationFrame(frame); return; }
        clone.remove();
        w._genie = null;
        if (done) done();
    };
    setAt(dir > 0 ? 0 : 1);
    w._genieRaf = requestAnimationFrame(frame);
}

/* ------------------------------------------------------------------ */
/* MINIMISE AND COME BACK                                              */
/* ------------------------------------------------------------------ */
function dockMinimizeFn() { return sys.dockMinimizeEffect === "scale" ? scaleEffect : genie; }

function winMinimize(w) {
    if (!w || w.minimized || w._genie) return;
    if (w.zoomed) winZoom(w);          /* a zoomed window un-zooms first */
    w.minimized = true;
    w.thumbHTML = w.node.outerHTML;    /* the Dock tile's picture of it */
    dockRender();                      /* make room, so the target exists */
    dockMinimizeFn()(w, 1, function () {
        w.node.classList.add("hidden");
        w.node.style.visibility = "";
        var next = frontWindow();
        if (next) winFocus(next);
        dockSync();
    });
}

function winRestore(w) {
    if (!w || !w.minimized || w._genie) return;
    if (mcOn) mcClose();
    /* it comes back out onto the desktop that is showing */
    if (w.space !== curSpace) winMoveToSpace(w, curSpace);
    w.minimized = false;
    w.node.classList.remove("hidden");
    dockMinimizeFn()(w, -1, function () {
        w.node.style.visibility = "";
        dockRender();
        winFocus(w);
    });
}
