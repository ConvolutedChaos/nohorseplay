"use strict";
/* boot order and the global keyboard shortcuts */

function keyInit() {
    document.addEventListener("keydown", function (e) {
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
    keyInit();
    batteryInit();
    tick();

    /* the desktop starts with the Finder frontmost and nothing selected,
       exactly as it is in the reference shots */
    setTimeout(function () {
        ncBanner("Welcome", "Double-click an icon, or press ⌘Space for Spotlight.", "finder");
    }, 900);
}

document.addEventListener("DOMContentLoaded", boot);
