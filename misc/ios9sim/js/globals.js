"use strict";
/* Hoisted globals.

   Every name here was a top-level "var" inside the single IIFE this code used
   to live in, so all of them hoisted to the top of that one function and read
   as undefined from anywhere, whatever order the code ran in. Split across
   files, a "var" only hoists within its own file -- and a few of these really
   are read before the file that declares them has loaded: fit() reads devFull
   on the first line of core.js, and devFull is not assigned until developer.js.
   Declaring them here, first, puts that hoisting back.

   Names only. Each keeps its real initialiser in the file it belongs to, and a
   bare "var x;" for an already-declared name is a no-op, so nothing is lost.
*/

/* core.js */
var ALARM_STD, BATT_STD, BG_LUMA, BOLT_STD, CHARGE_RATE, CONDITIONS, DAYS, INK_FLIP, MONS,
    STD_BARS, almShown, batt, battShown, btShown, ccP, chgShown, ckAlarmOn, ckReady;

/* lockscreen.js */
var LK_COLX, LK_KEYS, LK_ROWY, PASSCODE, camDrag, lkBlur, lkCancel, lkCode, lkDots, lkDrag,
    lkFail, lkFails, lkMain, lkP, lkPass, lkStatus, lkSwallow, lockEl, locked;

/* boot.js */
var bootEl, bootTimers, booting;

/* homescreen.js */
var calDay, calDow, calShown, hHour, hMin, hSec, liveCal, liveClk;

/* clock.js */
var CKBACK, CKCHEV, CK_CITIES, CK_RED, CK_TABS, CLASSIC, DAY3, PK_HALF, PK_ROW, TAB_ICONS, TICK,
    TICKI, TONES, aaApW, aaDraft, aaHourW, aaId, aaMinW, alEdit, alFired, alListEl, alSnooze,
    alarmSeq, alarms, ckAlertCb, ckTab, cyHead, cyListEl, cyQuery, cySearching, sw, swBig,
    swGoBtn, swLapBtn, swLapEl, swLapsEl, tmBig, tmGoBtn, tmHoursW, tmMinsW, tmPauseBtn, tmRun,
    tmr, toneDraft, toneMode, wcCities, wcDrag, wcEdit, wcListEl, zoneFmt;

/* photos.js */
var LIB, PH_CHAIN, PH_DB, PH_DBV, PH_ICON, PH_LEVELS, PH_TAB_ICONS, PH_THUMB, PH_URL, kb7, kb8,
    phAlbEdit, phAlbName, phAlbTarget, phBusy, phDepth, phGridAlbum, phGridSet, phQuery,
    phSearchOn, phSel, phSheetCb, phTab, phView;

/* camera.js */
var CAM_FILTERS, CAM_ICON, CAM_MODES, cam, camChunks, camClockTimer, camEl, camGridTimer,
    camLapseFrames, camLapseTimer, camPoster, camRecorder, camVid;

/* weather.js */
var WX_CITIES, WX_CONTENT, WX_DAYH, WX_DAYS, WX_HEADRISE, WX_HERO, WX_LABEL, WX_MAXS, WX_MOON,
    WX_PLACES, WX_STICK, WX_STRIP, WX_TODAYH, WX_TOP, WX_UNIT, WX_WINDOW, kb9, wxDayCache,
    wxDotsEl, wxListEl, wxPage, wxPagesEl, wxQuery, wxResEl, wxRowsEl, wxSearchEl, wxTimer;

/* videos.js */
var VD_PAUSE, VD_PLAY, VD_TABICON, VD_VIDEOS, vdArmed, vdBareTimer, vdCur, vdEditing, vdLast,
    vdListEl, vdPlaying, vdRootEl, vdT, vdTick;

/* notes.js */
var NT_BTICK, NT_CHEV, NT_DAYS, NT_DOCICON, NT_FMTS, NT_FOLDERS, NT_NOTES, NT_TICK, NT_TINT,
    NT_TRASH, NT_VIDBADGE, kbN, kbN2, kbN3, kbN4, ntCur, ntEditingNote, ntFEditing, ntFName,
    ntFolder, ntQuery, ntSearching, ntSel, ntSelecting, ntSheetCb;

/* share-sheets.js */
var NT_LOCK_BIG, NT_LOCK_OPEN, NT_LOCK_SHUT, NT_PW, NT_SS_APPS, PH_SS_ACTS, PH_SS_APPS, SS,
    SS_AIR_OFF, SS_AIR_ON, ntActsWhich, ntPwMode, ntPwVal, phActsWhich, phSSItems, ssAir;

/* reminders.js */
var RM_ALARM, RM_CHEV, RM_COLORS, RM_DAYS, RM_LISTS, RM_MONS, RM_PLUS, RM_REPEATS, RM_TICK, kbR,
    kbR2, kbR3, kbR4, rmAddText, rmAdding, rmDraft, rmDraftList, rmDraftNew, rmEditing, rmField,
    rmNaming, rmOpen, rmPickKind, rmQuery, rmSearching, rmShowDone;

/* stocks.js */
var ST_AXIS, ST_NEWS, ST_RANGES, ST_SYMS, ST_UNIVERSE, kbS, stArmed, stLoadTimer, stLoading,
    stMode, stPage, stQuery, stRange, stSel;

/* app-store.js */
var AS_SEARCH, AS_STAR, AS_STAR_F, AS_STAR_SM, AS_TABS, AS_UPDATES, asBusyTimer, asTab;

/* itunes-store.js */
var IT_CHEV, IT_MORE, IT_TABS, itBusyTimer, itEditing, itSub, itTab;

/* settings.js */
var AIR, BT_SELF, BT_WAIT, ETHER, IP_FIELDS, IP_MODES, PROXY_MODES, SB_AIR, SEC_TYPES,
    SE_AIR_FLIGHT, SE_AIR_ICON, SE_BT_ICON, SE_CHECK, SE_CHEV, SE_DEV_ICON, SE_ICONS, SE_INDEX,
    SE_INFO, SE_LOCK, SE_PW_MIN, SE_SPIN, SE_WIFI_ICON, airSeq, airStash, airplane, bt, btDevName,
    btTimer, kbSE, kbSEJ, kbSEN, seAirTimer, seAlertCb, seField, seHits, seJAP, seJFocus, seJMode,
    seJName, seJPw, seJSec, seJoinLit, seJoinTimer, seNetId, seQuery, seSearching, wifi;

/* developer.js */
var DEV_KEY, DEV_LOOK, DEV_PICKS, DEV_POS, DEV_SIZE, DEV_STYLE, devFull, devHome, devPickKey,
    devSide;

/* setup.js */
var SU_ARROW, SU_CHART, SU_CHEV, SU_COUNTRIES, SU_FEATURES, SU_FORGOT, SU_KEY, SU_LANGS,
    SU_LOCKICON, SU_MONTHS, SU_PAGES, SU_RESTORE, SU_SVCS, SU_WEAK, SU_WIFIICON, kbSU, su, suBody,
    suCoding, suEl, suNavEl;

/* siri.js */
var SI_APPNAME, SI_APPWORDS, SI_BANDS, SI_DIGITS, SI_NUMWORD, SI_ONES, SI_TENS, SI_VOICES, SR,
    siAC, siAn, siAskEl, siBuf, siConv, siCtx, siFinal, siHeard, siHint, siHold, siLvl, siPhase,
    siRaf, siRec, siRecOn, siSpeakGuard, siSpeakSeq, siStartedAt, siState, siStream, siThinkT,
    siTurn, siTypeEl, siTypeMode, siVoices, siWaveEl, siriUp;
