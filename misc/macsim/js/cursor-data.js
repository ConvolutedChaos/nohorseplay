"use strict";
/* Every cursor in assets/cursors/, measured straight off the .plist metadata
   that shipped with each cursor.pdf (hotx/hoty, frame count, delay, and the
   shadow CoreGraphics draws under it) -- see ref_pic's convert_cursors.py.
   w/h are one frame's own size, in the same points the SVG's viewBox uses,
   so drawing a cursor at CURSOR_SCALE 1 reproduces its real size on a Mac.
   Apple draws no shadow at all under cross, ibeamvertical and
   screenshotselection, so those three simply have no `shadow` key. */
var CURSOR_DATA = {
    "busybutclickable": { src: "assets/cursors/busybutclickable.svg", w: 37.3333, h: 53.3333, hotx: 5, hoty: 5, frames: 15, delay: 0.033, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "cell": { src: "assets/cursors/cell.svg", w: 24, h: 24, hotx: 9, hoty: 9, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "closedhand": { src: "assets/cursors/closedhand.svg", w: 42.6667, h: 42.6667, hotx: 16, hoty: 16, shadow: { dx: 0, dy: 1, blur: 0.8, color: "rgba(0,0,0,0.5)" } },
    "contextualmenu": { src: "assets/cursors/contextualmenu.svg", w: 37.3333, h: 53.3333, hotx: 5, hoty: 5, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "copy": { src: "assets/cursors/copy.svg", w: 37.3333, h: 53.3333, hotx: 5, hoty: 5, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "countingdownhand": { src: "assets/cursors/countingdownhand.svg", w: 32, h: 32, hotx: 12, hoty: 12, frames: 6, delay: 0.5, shadow: { dx: 0, dy: 1, blur: 0.8, color: "rgba(0,0,0,0.5)" } },
    "countingupandownhand": { src: "assets/cursors/countingupandownhand.svg", w: 32, h: 32, hotx: 12, hoty: 12, frames: 10, delay: 0.5, shadow: { dx: 0, dy: 1, blur: 0.8, color: "rgba(0,0,0,0.5)" } },
    "countinguphand": { src: "assets/cursors/countinguphand.svg", w: 32, h: 32, hotx: 12, hoty: 12, frames: 6, delay: 0.5, shadow: { dx: 0, dy: 1, blur: 0.8, color: "rgba(0,0,0,0.5)" } },
    "cross": { src: "assets/cursors/cross.svg", w: 32, h: 32, hotx: 11, hoty: 11 },
    "help": { src: "assets/cursors/help.svg", w: 24, h: 24, hotx: 9, hoty: 9, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "ibeamvertical": { src: "assets/cursors/ibeamvertical.svg", w: 42.6667, h: 42.6667, hotx: 7, hoty: 4 },
    "makealias": { src: "assets/cursors/makealias.svg", w: 21.3333, h: 28, hotx: 11, hoty: 3, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "move": { src: "assets/cursors/move.svg", w: 24, h: 24, hotx: 9, hoty: 9, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "notallowed": { src: "assets/cursors/notallowed.svg", w: 37.3333, h: 53.3333, hotx: 5, hoty: 5, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "openhand": { src: "assets/cursors/openhand.svg", w: 42.6667, h: 42.6667, hotx: 16, hoty: 16, shadow: { dx: 0, dy: 1, blur: 0.8, color: "rgba(0,0,0,0.5)" } },
    "pointinghand": { src: "assets/cursors/pointinghand.svg", w: 42.6667, h: 42.6667, hotx: 13, hoty: 8, shadow: { dx: 0, dy: 1, blur: 0.8, color: "rgba(0,0,0,0.5)" } },
    "poof": { src: "assets/cursors/poof.svg", w: 37.3333, h: 53.3333, hotx: 5, hoty: 5, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizedown": { src: "assets/cursors/resizedown.svg", w: 32, h: 32, hotx: 12, hoty: 12, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizeeast": { src: "assets/cursors/resizeeast.svg", w: 24, h: 24, hotx: 9, hoty: 9, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizeeastwest": { src: "assets/cursors/resizeeastwest.svg", w: 24, h: 24, hotx: 9, hoty: 9, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizeleft": { src: "assets/cursors/resizeleft.svg", w: 32, h: 32, hotx: 12, hoty: 12, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizeleftright": { src: "assets/cursors/resizeleftright.svg", w: 32, h: 32, hotx: 12, hoty: 12, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizenorth": { src: "assets/cursors/resizenorth.svg", w: 24, h: 24, hotx: 9, hoty: 9, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizenortheast": { src: "assets/cursors/resizenortheast.svg", w: 24, h: 24, hotx: 10, hoty: 8, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizenortheastsouthwest": { src: "assets/cursors/resizenortheastsouthwest.svg", w: 24, h: 24, hotx: 9, hoty: 9, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizenorthsouth": { src: "assets/cursors/resizenorthsouth.svg", w: 24, h: 24, hotx: 9, hoty: 9, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizenorthwest": { src: "assets/cursors/resizenorthwest.svg", w: 24, h: 24, hotx: 8, hoty: 8, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizenorthwestsoutheast": { src: "assets/cursors/resizenorthwestsoutheast.svg", w: 24, h: 24, hotx: 9, hoty: 9, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizeright": { src: "assets/cursors/resizeright.svg", w: 32, h: 32, hotx: 12, hoty: 12, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizesouth": { src: "assets/cursors/resizesouth.svg", w: 24, h: 24, hotx: 9, hoty: 9, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizesoutheast": { src: "assets/cursors/resizesoutheast.svg", w: 24, h: 24, hotx: 10, hoty: 9, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizesouthwest": { src: "assets/cursors/resizesouthwest.svg", w: 24, h: 24, hotx: 8, hoty: 9, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizeup": { src: "assets/cursors/resizeup.svg", w: 32, h: 32, hotx: 12, hoty: 12, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizeupdown": { src: "assets/cursors/resizeupdown.svg", w: 32, h: 32, hotx: 12, hoty: 12, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "resizewest": { src: "assets/cursors/resizewest.svg", w: 24, h: 24, hotx: 9, hoty: 9, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "screenshotselection": { src: "assets/cursors/screenshotselection.svg", w: 42.6667, h: 42.6667, hotx: 15, hoty: 15 },
    "screenshotwindow": { src: "assets/cursors/screenshotwindow.svg", w: 37.3333, h: 33.3333, hotx: 14, hoty: 11, shadow: { dx: 0, dy: 1, blur: 2, color: "rgba(0,0,0,0.65)" } },
    "zoomin": { src: "assets/cursors/zoomin.svg", w: 26.6667, h: 26.6667, hotx: 8, hoty: 7, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },
    "zoomout": { src: "assets/cursors/zoomout.svg", w: 26.6667, h: 26.6667, hotx: 8, hoty: 7, shadow: { dx: 0, dy: 1, blur: 1.8, color: "rgba(0,0,0,0.65)" } },

    /* the two Apple never exposes as an NSCursor, so there is no PDF/plist
       for either -- main-pointer.png is a tight crop with the tip already
       at its top-left pixel, and spinner.png is cropped to a centred disc.
       Both were shot much larger than the vector set's own point sizes, so
       they carry their own scale down to roughly the same family of sizes
       (an arrow well under cross's 24px, a wait disc a shade over its 32px). */
    "main-pointer": { src: "assets/cursors/main-pointer.png", png: true, rawW: 200, rawH: 318, scale: 0.058, w: 11.6, h: 18.44, hotx: 0, hoty: 0, shadow: { dx: 0, dy: 1, blur: 1.2, color: "rgba(0,0,0,0.5)" } },
    "spinner": { src: "assets/cursors/spinner.png", png: true, rawW: 160, rawH: 160, scale: 0.2, w: 32, h: 32, hotx: 16, hoty: 16, spin: true, shadow: { dx: 0, dy: 1, blur: 1.2, color: "rgba(0,0,0,0.5)" } }
};

/* bumped later by an accessibility "larger cursor" setting; every cursor
   scales from its own hotspot so the hot pixel never drifts under the
   pointer while it grows */
var CURSOR_SCALE = 1;
