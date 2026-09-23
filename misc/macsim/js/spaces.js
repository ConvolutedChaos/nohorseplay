"use strict";
/* Spaces: several desktops, each with its own windows, and the slide
   between them (Ctrl+Left / Ctrl+Right, or a click in Mission Control).

   Every desktop is a .space layer inside #windows and a window lives in its
   desktop's layer, so switching is just showing another layer.  The slide
   paints the wallpaper and the desktop icons behind both layers for the
   length of the move, so the whole screen appears to travel while the menu
   bar and the Dock stay put. */

var spaces = [{ id: 1 }], curSpace = 1, spaceSeq = 1;
var SPACE_SLIDE_MS = 420;       /* no recording of this one yet */
var spaceSlide = null;

function spaceIndex(id) {
    for (var i = 0; i < spaces.length; i++) if (spaces[i].id === id) return i;
    return -1;
}

/* one desktop reads "Desktop"; two or more are numbered in order */
function spaceName(id) {
    return spaces.length === 1 ? "Desktop" : "Desktop " + (spaceIndex(id) + 1);
}

function spaceLayer(id) {
    var host = $("windows");
    var n = host.querySelector('.space[data-space="' + id + '"]');
    if (!n) {
        n = el("div", "space");
        n.dataset.space = id;
        n.classList.toggle("current", id === curSpace);
        host.appendChild(n);
    }
    return n;
}

function spaceWindows(id) {
    return wins.filter(function (w) { return w.space === id; });
}

function winMoveToSpace(w, id) {
    if (w.space === id) return;
    w.space = id;
    w.node.style.transform = "";
    w.node.style.transition = "";
    spaceLayer(id).appendChild(w.node);
}

function spaceAdd() {
    var sp = { id: ++spaceSeq };
    spaces.push(sp);
    spaceLayer(sp.id);
    return sp;
}

/* a removed desktop's windows go to the desktop before it (the one after,
   for the first), and so does the screen if it was showing */
function spaceRemove(id) {
    if (spaces.length < 2) return;
    var i = spaceIndex(id);
    if (i < 0) return;
    var to = spaces[i === 0 ? 1 : i - 1].id;
    spaceWindows(id).forEach(function (w) { winMoveToSpace(w, to); });
    if (curSpace === id) spaceSwitch(to, { instant: true });
    spaces.splice(i, 1);
    var layer = spaceLayer(id);
    layer.remove();
}

function spaceFocusFront() {
    var front = frontWindow();
    if (front) winFocus(front);
    else {
        wins.forEach(function (w) { w.node.classList.add("inactive"); });
        setActiveApp("finder");
    }
}

function spaceSwitch(id, opts) {
    opts = opts || {};
    if (spaceIndex(id) < 0) return;
    spaceSlideFinish();
    if (id === curSpace) return;
    var from = curSpace;
    var dir = spaceIndex(id) > spaceIndex(from) ? 1 : -1;
    curSpace = id;
    menuCloseAll();

    if (opts.instant) {
        spaceLayer(from).classList.remove("current");
        spaceLayer(id).classList.add("current");
        if (!opts.keepFocus) spaceFocusFront();
        return;
    }
    spaceAnimate(spaceLayer(from), spaceLayer(id), dir);
    if (!opts.keepFocus) spaceFocusFront();
}

/* the screen's own picture: wallpaper up under the bar, and the icons */
function spaceBackdrop() {
    var back = el("div", "space-back");
    var icons = $("desktop").cloneNode(true);
    icons.removeAttribute("id");
    icons.className = "space-icons";
    Array.prototype.forEach.call(icons.querySelectorAll("[id]"), function (n) { n.removeAttribute("id"); });
    back.appendChild(icons);
    return back;
}

function spaceAnimate(fromL, toL, dir) {
    var W = window.innerWidth;
    fromL.insertBefore(spaceBackdrop(), fromL.firstChild);
    toL.insertBefore(spaceBackdrop(), toL.firstChild);
    fromL.classList.add("sliding");
    toL.classList.add("sliding", "current");
    fromL.classList.remove("current");
    $("screen").classList.add("sp-sliding");

    var ease = "cubic-bezier(.3, .1, .2, 1)";
    var a = fromL.animate([{ transform: "translateX(0)" }, { transform: "translateX(" + (-dir * W) + "px)" }],
        { duration: SPACE_SLIDE_MS, easing: ease });
    var b = toL.animate([{ transform: "translateX(" + (dir * W) + "px)" }, { transform: "translateX(0)" }],
        { duration: SPACE_SLIDE_MS, easing: ease });
    spaceSlide = { a: a, b: b, layers: [fromL, toL] };
    b.onfinish = spaceSlideFinish;
}

function spaceSlideFinish() {
    var s = spaceSlide;
    if (!s) return;
    spaceSlide = null;
    s.a.cancel();
    s.b.cancel();
    s.layers.forEach(function (l) {
        l.classList.remove("sliding");
        var back = l.querySelector(":scope > .space-back");
        if (back) back.remove();
    });
    $("screen").classList.remove("sp-sliding");
}

/* past the last desktop the screen gives a little and springs back */
function spaceBump(dir) {
    spaceSlideFinish();
    var l = spaceLayer(curSpace);
    l.insertBefore(spaceBackdrop(), l.firstChild);
    l.classList.add("sliding");
    $("screen").classList.add("sp-sliding");
    var a = l.animate([
        { transform: "translateX(0)" },
        { transform: "translateX(" + (-dir * 60) + "px)", offset: 0.4 },
        { transform: "translateX(0)" }
    ], { duration: 360, easing: "ease-out" });
    spaceSlide = { a: a, b: a, layers: [l] };
    a.onfinish = spaceSlideFinish;
}

function spaceStep(dir) {
    var i = spaceIndex(curSpace) + dir;
    if (i < 0 || i >= spaces.length) { spaceBump(dir); return; }
    spaceSwitch(spaces[i].id);
}

function spacesInit() {
    spaceLayer(curSpace).classList.add("current");
    document.addEventListener("keydown", function (e) {
        if (!loggedIn || !e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        var t = e.target;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        var dir = e.key === "ArrowRight" ? 1 : -1;
        if (typeof mcOn !== "undefined" && mcOn) { mcStepSpace(dir); return; }
        if (lpOn) lpClose();
        spaceStep(dir);
    });
}
