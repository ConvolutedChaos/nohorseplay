"use strict";
/* Drives #cursorLayer, the image that stands in for the OS pointer (see
   css/cursors.css, which sets `cursor: none` so the real one never shows).
   A plain CSS `cursor` can't animate, so every cursor -- animated or not --
   is just this one element with its src, size and frame swapped out.

   An element opts into a cursor with data-cursor="<name from CURSOR_DATA>";
   mousemove walks up from the event target for the nearest one and falls
   back to "main-pointer" when nothing claims it. */

var cursorEl = null;
var curCursorName = null;
var curFrame = 0;
var curTimer = null;
/* set while the Mac has no pointer on screen (off, booting, signing in);
   the image still follows the mouse, it just isn't drawn */
var cursorHidden = false;
/* how many things are currently hung; while any are, the beach ball wins
   over whatever the pointer is resting on */
var cursorBusyCount = 0;
var cursorLast = { x: 0, y: 0, target: null };

function cursorInit() {
    cursorEl = document.createElement("img");
    cursorEl.id = "cursorLayer";
    cursorEl.alt = "";
    document.body.appendChild(cursorEl);

    document.addEventListener("mousemove", function (e) {
        cursorEl.style.visibility = cursorHidden ? "hidden" : "visible";
        cursorLast = { x: e.clientX, y: e.clientY, target: e.target };
        setCursor(cursorBusyCount ? "spinner" : cursorFor(e.target));
        cursorMove(e.clientX, e.clientY);
    });
    document.documentElement.addEventListener("mouseleave", function () {
        cursorEl.style.visibility = "hidden";
    });
}

/* anything you can type into gets the I-beam without having to tag it */
var NON_TEXT_INPUTS = /^(checkbox|radio|range|button|submit|reset|color|file|image)$/;
function isTextField(el) {
    if (el.isContentEditable || el.tagName === "TEXTAREA") return true;
    return el.tagName === "INPUT" && !NON_TEXT_INPUTS.test(el.type);
}

function cursorFor(target) {
    if (!target || !target.closest) return "main-pointer";
    if (isTextField(target)) return "ibeam";
    var owner = target.closest("[data-cursor]");
    return owner ? owner.dataset.cursor : "main-pointer";
}

/* the spinning beach ball, on and off, without waiting for the mouse to
   move -- calls nest, so two hangs at once need two offs */
function cursorBusy(on) {
    cursorBusyCount = Math.max(0, cursorBusyCount + (on ? 1 : -1));
    setCursor(cursorBusyCount ? "spinner" : cursorFor(cursorLast.target));
    cursorMove(cursorLast.x, cursorLast.y);
}

function cursorHide(hide) {
    cursorHidden = hide;
    cursorEl.style.visibility = hide ? "hidden" : "visible";
}

function cursorIsShown() {
    return !cursorHidden;
}

/* Puts the arrow somewhere on its own and shows it.  The browser can't
   move the real pointer, so the next mousemove takes it back to wherever
   the mouse actually is. */
function cursorPlace(x, y) {
    setCursor("main-pointer");
    cursorMove(x, y);
    cursorHide(false);
}

function cursorMove(x, y) {
    var d = CURSOR_DATA[curCursorName];
    if (!d) return;
    /* placed at the *unscaled* hotspot offset -- transform-origin below
       sits on that same point, so scaling can't walk it away from the
       mouse no matter how big --cs gets */
    cursorEl.style.left = (x - d.hotx) + "px";
    cursorEl.style.top = (y - d.hoty) + "px";
}

function setCursor(name) {
    if (name === curCursorName) return;
    var d = CURSOR_DATA[name] || CURSOR_DATA["main-pointer"];
    curCursorName = CURSOR_DATA[name] ? name : "main-pointer";
    if (curTimer) { clearInterval(curTimer); curTimer = null; }
    curFrame = 0;

    cursorEl.src = d.src;
    cursorEl.style.width = d.w + "px";
    cursorEl.style.height = d.h + "px";
    cursorEl.style.transformOrigin = d.hotx + "px " + d.hoty + "px";
    cursorEl.style.setProperty("--cs", CURSOR_SCALE);
    cursorEl.style.filter = d.shadow
        ? "drop-shadow(" + d.shadow.dx + "px " + d.shadow.dy + "px " +
          d.shadow.blur + "px " + d.shadow.color + ")"
        : "none";
    cursorEl.classList.toggle("spin", !!d.spin);
    cursorEl.style.transform = d.spin ? "" :
        "scale(var(--cs))" + (d.zoom ? " scale(" + d.zoom + ")" : "") +
        (d.rotate ? " rotate(" + d.rotate + "deg)" : "");

    if (d.frames > 1) {
        cursorEl.classList.add("strip");
        cursorStripFrame(d, 0);
        curTimer = setInterval(function () {
            curFrame = (curFrame + 1) % d.frames;
            cursorStripFrame(d, curFrame);
        }, d.delay * 1000);
    } else {
        cursorEl.classList.remove("strip");
    }
}

function cursorStripFrame(d, i) {
    cursorEl.style.objectPosition = "0px " + (-i * d.h) + "px";
}
