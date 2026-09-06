"use strict";
/* ------------------------------------------------------------------ */
/* BOOT                                                               */
/* ------------------------------------------------------------------ */
/* The sheet is already black in the markup, so there is no flash of
   home screen before the script gets here. */
var bootEl = $('boot'), booting = true, bootTimers = [];

/* the restart reason under "Enter Passcode", until it is answered once */
function lkWhy(on) { lkPass.classList.toggle('why', on); }

function bootAt(ms, fn) { bootTimers.push(setTimeout(fn, ms)); }

/* dark: how long the screen stays plain black before the logo warms
   up. A cold start is already black, so it is only a beat; a restart
   holds it longer, the way the real one goes dark before coming back. */
function boot(dark) {
    bootTimers.forEach(clearTimeout);
    bootTimers = [];
    booting = true;
    bootEl.classList.remove('off');
    bootEl.classList.add('on');

    bootAt(dark, function () { bootEl.classList.add('lit'); });

    /* The lock screen is dressed underneath while the black is still up
       -- unless this iPod has never been set up, in which case the Setup
       Assistant comes up instead and hands over to the home screen on
       its own once Get Started is tapped. */
    bootAt(dark + 2700, function () {
        if (suPending()) {
            suStart();
        } else {
            lkLock();
            lkWhy(true);
        }
        bootEl.classList.add('off');
    });

    bootAt(dark + 3220, function () {
        bootEl.className = '';
        booting = false;
    });
}

/* Cut to black and come up again from nothing. Everything that was
   on screen is torn down under the cover of the boot sheet, so the
   lock screen that fades in is the only thing left standing. */
function restart() {
    if (booting) return;
    bootEl.className = 'on';           /* black, no fade, no logo yet */

    if (openAppId) {
        var id = openAppId, appEl = APPS[id];
        openAppId = null;
        appTeardown(id);
        appEl.style.transition = 'none';
        appEl.style.transform = 'none';
        appEl.style.opacity = '';
        appEl.classList.remove('on');
    }
    hsEl.style.transition = 'none';
    hsEl.style.transform = 'none';
    hsEl.style.opacity = '';

    $('ckAlert').classList.remove('up');
    ckAlertCb = null;
    siriClose();
    $('volHud').classList.remove('show');
    setNC(false);
    setCC(false);
    setPage(0);
    $('hsPages').style.transition = 'none';

    asleep = false;
    $('sleepmask').classList.remove('on');

    boot(700);
}

boot(200);
