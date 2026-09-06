"use strict";
/* host keyboard -> device input */
/* ------------------------------------------------------------------ */
/* PHYSICAL KEYBOARD                                                  */
/* ------------------------------------------------------------------ */
document.addEventListener('keydown', function (e) {
    if (asleep || booting) return;
    /* Siri owns the keyboard while it is up -- its own field stops the
       event before it gets here, so anything reaching this is for it */
    if (siriUp) { if (e.key === 'Escape') siriClose(); return; }
    if (locked) {
        if (lkP < .5) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lkGo(1); } return; }
        if (/^[0-9]$/.test(e.key)) { e.preventDefault(); lkPress(e.key); }
        else if (e.key === 'Backspace') { e.preventDefault(); lkBack(); }
        else if (e.key === 'Escape') lkGo(0);
        return;
    }
    let st = (openAppId === 'facetime') ? (kb4.el.classList.contains('up') ? kb4 : null)
        : (openAppId === 'clock') ? (kb5.el.classList.contains('up') ? kb5
            : (kb6.el.classList.contains('up') ? kb6 : null))
            : (openAppId === 'weather') ? (kb9.el.classList.contains('up') ? kb9 : null)
                : (openAppId === 'photos') ? (kb7.el.classList.contains('up') ? kb7
                    : (kb8.el.classList.contains('up') ? kb8 : null))
                    : (pNew.classList.contains('active') ? kb2
                        : (searching ? kb3
                            : (kb1.el.classList.contains('up') ? kb1 : null)));
    if (!st) return;
    if (e.key === 'Backspace') { e.preventDefault(); backspace(st); }
    else if (e.key === 'Enter') {
        e.preventDefault();
        if (st === kb4) ftReturn();
        else if (st === kb5) lbDone();
        else if (st === kb6) cyBlur();
        else if (st === kb7) { if (phAlbName.trim()) $('phASave').click(); }
        else if (st === kb8) { closeKB(kb8); phSearchSync(); }
        else if (st === kb9) { if (wxResEl._m && wxResEl._m.length) wxAddPlace(wxResEl._m[0].p); }
        else if (st === kb1 && buffer.trim()) rightBtn.click();
    }
    else if (e.key === 'Escape') {
        if (st === kb4) ftBlur();
        else if (st === kb5) lbDone();
        else if (st === kb6) cyCancelSearch();
        else if (st === kb7) phCloseAlbumAlert();
        else if (st === kb8) phCloseSearch();
        else if (st === kb9) wxCloseSearch();
        else if (searching) exitSearch();
        else { closeKB(kb1); closeDict(); syncField(); }
    }
    else if (e.key.length === 1) { e.preventDefault(); setText(st, getText(st) + e.key); }
});
