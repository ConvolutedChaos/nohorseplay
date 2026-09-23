"use strict";
/* boot order and the global keyboard shortcuts */

function keyInit() {
    document.addEventListener("keydown", function (e) {
        if (!loggedIn) return;          /* the login window owns the keyboard */
        var mod = e.metaKey || e.ctrlKey;
        var k = e.key.toLowerCase();

        if (e.key === "Escape") {
            if (spotOn) { spotClose(); return; }
            if (ncOpen) { ncToggle(); return; }
            menuCloseAll();
            return;
        }
        if (!mod) {
            if (e.key === " " || e.code === "Space") {
                if (document.activeElement === document.body) {
                    quickLookToggle();
                    e.preventDefault();
                }
                return;
            }
            if (e.key === "Enter") {
                var s = dtSelection();
                if (s.length === 1 && document.activeElement === document.body) {
                    dtBeginRename(s[0]);
                    e.preventDefault();
                }
            }
            return;
        }

        if (k === " " || e.code === "Space") { spotToggle(); e.preventDefault(); return; }
        if (k === "n") { openFinder(DESKTOP); e.preventDefault(); return; }
        if (k === "w") { closeFrontWindow(); e.preventDefault(); return; }
        if (k === "m") { winMinimize(frontWindow()); e.preventDefault(); return; }
        if (k === "a") { selectAll(); e.preventDefault(); return; }
        if (k === "q" && activeApp !== "finder") { quitApp(activeApp); e.preventDefault(); return; }
        if (k === "i") { getInfo(); e.preventDefault(); return; }
        if (k === "y") { quickLookToggle(); e.preventDefault(); return; }
        if (k === "t") { var fw = frontWindow(); if (fw && fw.app === "finder") { fwNewTab(fw); e.preventDefault(); } return; }
        if (k === "f") { spotOpen(); e.preventDefault(); return; }
        if (k === "c") { copySelection(); e.preventDefault(); return; }
        if (k === "v") { pasteClipboard(); e.preventDefault(); return; }
        if (k === "d") { duplicateSelection(); e.preventDefault(); return; }
        if (k === "z") { dtUndo(); e.preventDefault(); return; }
        if (e.key === "Backspace") { trashSelection(); e.preventDefault(); return; }
        if (k === ",") { launch("system-preferences"); e.preventDefault(); return; }
    });
}

function boot() {
    cursorInit();
    menuInit();
    barRender();
    extrasRender();
    dtBuild();
    dtInit();
    dockInit();
    spotInit();
    ncInit();
    /* before keyInit, so these hear the keyboard first */
    spacesInit();
    lpInit();
    mcInit();
    keyInit();
    batteryInit();
    tick();

    /* the desktop is built now but held behind the power-on sequence; it
       starts with the Finder frontmost and nothing selected, exactly as it
       is in the reference shots */
    bootInit(function () {
        setTimeout(function () {
            console.log("hi from devtools")
        }, 900);
    });
}

document.addEventListener("DOMContentLoaded", boot);
