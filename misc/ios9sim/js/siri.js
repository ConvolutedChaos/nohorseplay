"use strict";
/* Siri + what Siri knows */
/* ------------------------------------------------------------------ */
/* SIRI                                                               */
/* ------------------------------------------------------------------ */
/* Hold the home button and iOS 9's assistant comes up over whatever
   was on screen -- the lock screen included. It listens through
   webkitSpeechRecognition / SpeechRecognition and answers through
   SpeechSynthesisUtterance, and the requests it understands drive the
   same state the apps do: the Clock's alarms and timer, the Reminders
   lists, the Control Center radios, the volume, the app launcher.

   Everything degrades: no recogniser (Firefox, Safari with dictation
   off) or a refused microphone drops to a typed prompt, no speech
   synthesiser just leaves the answer on screen, and no getUserMedia
   means the waveform animates on its own instead of off the mic. */

var siriUp = false;
var siState = 'idle';      /* listen | think | talk | idle */
var siRec = null, siRecOn = false, siStartedAt = 0;
var siFinal = '', siHeard = '';
var siHold = false;        /* the home button is still down */
var siTypeMode = false;
var siTurn = null, siAskEl = null;
var siThinkT = null, siSpeakGuard = null;
var siConv = $('siConv'), siHint = $('siHint'), siTypeEl = $('siType');

var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

/* ---- the two-tone chime ------------------------------------------- */
/* No audio files to lean on, so the ding-ding is two sine blips. It
   rides the device's own volume, and a muted iPod stays silent. */
var siAC = null;
function siAudio() {
    if (siAC !== null) return siAC;
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) { siAC = false; return false; }
    try { siAC = new C(); } catch (e) { siAC = false; }
    return siAC;
}
function siChime(up) {
    var ac = siAudio(); if (!ac) return;
    if (ac.state === 'suspended') { try { ac.resume(); } catch (e) { } }
    var gainTop = 0.15 * (vol / VOL_STEPS);
    if (gainTop <= 0) return;
    var notes = up ? [830.6, 1108.7] : [1108.7, 830.6];
    var t0 = ac.currentTime + 0.01;
    for (var i = 0; i < 2; i++) {
        var t = t0 + i * 0.125;
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine';
        o.frequency.value = notes[i];
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gainTop, t + 0.014);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(g); g.connect(ac.destination);
        o.start(t); o.stop(t + 0.26);
    }
}

/* ---- the waveform -------------------------------------------------- */
/* Four hues riding over each other, windowed so they taper to nothing
   at both edges. The envelope follows the microphone when the browser
   will hand one over, and improvises when it will not. */
var siWaveEl = $('siWave'), siCtx = siWaveEl.getContext('2d');
var siLvl = 0.03, siPhase = 0, siRaf = null;
var SI_BANDS = [
    { c: '#2fd3ad', f: 1.10, s: 1.00, a: 1.00 },
    { c: '#2f96f2', f: 1.75, s: -1.40, a: 0.80 },
    { c: '#9a6bf0', f: 2.70, s: 1.85, a: 0.58 },
    { c: '#f4608e', f: 3.70, s: -2.30, a: 0.42 }
];

var siStream = null, siAn = null, siBuf = null;
function siMicOpen() {
    if (siAn || siStream) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    var ac = siAudio(); if (!ac) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        if (!siriUp) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
        siStream = s;
        if (ac.state === 'suspended') { try { ac.resume(); } catch (e) { } }
        var src = ac.createMediaStreamSource(s);
        siAn = ac.createAnalyser();
        siAn.fftSize = 512;
        siAn.smoothingTimeConstant = 0.55;
        siBuf = new Uint8Array(siAn.fftSize);
        src.connect(siAn);          /* deliberately not to destination */
    }).catch(function () { /* the wave improvises; nothing else breaks */ });
}
function siMicClose() {
    if (siStream) {
        siStream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) { } });
        siStream = null;
    }
    siAn = null; siBuf = null;
}
function siMicLevel() {
    if (!siAn || !siBuf) return -1;
    siAn.getByteTimeDomainData(siBuf);
    var sum = 0, i, v;
    for (i = 0; i < siBuf.length; i++) { v = (siBuf[i] - 128) / 128; sum += v * v; }
    return Math.min(1, 0.04 + Math.sqrt(sum / siBuf.length) * 4.4);
}

function siStartWave() { if (!siRaf) siRaf = requestAnimationFrame(siFrame); }
function siStopWave() { if (siRaf) { cancelAnimationFrame(siRaf); siRaf = null; } }

function siFrame() {
    siRaf = requestAnimationFrame(siFrame);
    var now = Date.now(), t = 0.03;
    if (siState === 'listen') {
        t = siMicLevel();
        if (t < 0) t = 0.16 + Math.abs(Math.sin(now / 250)) * 0.44 * (0.45 + Math.random() * 0.55);
    } else if (siState === 'talk') {
        t = 0.20 + Math.abs(Math.sin(now / 170)) * 0.36 * (0.5 + Math.random() * 0.5);
    } else if (siState === 'think') {
        t = 0.05;
    }
    siLvl += (t - siLvl) * 0.20;
    siPhase += 0.052;
    siDrawWave();
}

function siDrawWave() {
    var w = siWaveEl.width, h = siWaveEl.height, mid = h / 2, c = siCtx;
    var amp = (mid - 8) * siLvl, TAU = Math.PI * 2;
    c.clearRect(0, 0, w, h);
    c.globalCompositeOperation = 'lighter';
    c.lineJoin = 'round'; c.lineCap = 'round';
    for (var b = 0; b < SI_BANDS.length; b++) {
        var B = SI_BANDS[b];
        c.beginPath();
        for (var x = 0; x <= w; x += 4) {
            var u = x / w;
            var env = Math.pow(Math.cos((u - 0.5) * Math.PI), 3);
            var y = mid + (Math.sin(u * TAU * B.f + siPhase * B.s) * 0.66 +
                Math.sin(u * TAU * (B.f * 1.9 + 0.7) - siPhase * B.s * 0.6) * 0.34) *
                env * amp * B.a;
            if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.strokeStyle = B.c;
        c.globalAlpha = 0.26; c.lineWidth = 10; c.stroke();   /* the bloom */
        c.globalAlpha = 0.95; c.lineWidth = 3.4; c.stroke();  /* the line */
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
}

/* ---- speaking ------------------------------------------------------ */
var siVoices = [];
function siLoadVoices() {
    if (!window.speechSynthesis) return;
    try { siVoices = window.speechSynthesis.getVoices() || []; } catch (e) { siVoices = []; }
}
siLoadVoices();
if (window.speechSynthesis && 'onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', siLoadVoices);
}
/* Samantha is the voice iOS 9 shipped for US English; the rest are the
   nearest thing each platform has. */
var SI_VOICES = ['Samantha', 'Ava', 'Allison', 'Susan', 'Nicky',
    'Microsoft Zira', 'Microsoft Aria', 'Google US English'];
function siVoice() {
    if (!siVoices.length) siLoadVoices();
    var i, j;
    for (i = 0; i < SI_VOICES.length; i++)
        for (j = 0; j < siVoices.length; j++)
            if (siVoices[j].name.indexOf(SI_VOICES[i]) > -1) return siVoices[j];
    for (j = 0; j < siVoices.length; j++) if (/^en[-_]us/i.test(siVoices[j].lang)) return siVoices[j];
    for (j = 0; j < siVoices.length; j++) if (/^en/i.test(siVoices[j].lang)) return siVoices[j];
    return null;
}

var siSpeakSeq = 0;
function siSpeak(text, done) {
    var S = window.speechSynthesis;
    var seq = ++siSpeakSeq;
    clearTimeout(siSpeakGuard);
    if (!S || !window.SpeechSynthesisUtterance || !text) {
        /* no synthesiser: leave the answer on screen and move on */
        siSpeakGuard = setTimeout(function () { if (seq === siSpeakSeq) done(); }, 900);
        return;
    }
    try { S.cancel(); } catch (e) { }
    var u = new SpeechSynthesisUtterance(text);
    var v = siVoice();
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'en-US'; }
    u.rate = 1; u.pitch = 1;
    u.volume = Math.max(0, Math.min(1, vol / VOL_STEPS));
    var fired = false;
    function fin() {
        if (fired) return;
        fired = true;
        clearTimeout(siSpeakGuard);
        if (seq !== siSpeakSeq) return;   /* a newer utterance took over */
        done();
    }
    u.onend = fin; u.onerror = fin;
    try { S.speak(u); } catch (e) { fin(); return; }
    /* Chrome drops onend often enough that a length-based backstop is
       the difference between a live UI and a stuck one */
    siSpeakGuard = setTimeout(fin, 2600 + text.length * 90);
}

/* ---- the conversation ---------------------------------------------- */
function siScrollDown() {
    var s = $('siScroll');
    s.scrollTop = s.scrollHeight;
}
function siNewTurn() {
    siTurn = document.createElement('div');
    siTurn.className = 'si-turn';
    siAskEl = null;
    siConv.appendChild(siTurn);
    /* three exchanges is all the scroller ever needs to hold */
    while (siConv.children.length > 3) siConv.removeChild(siConv.firstChild);
    return siTurn;
}
function siShowAsk(text, partial) {
    if (!text) return;                 /* nothing said yet: keep the hint up */
    siHint.classList.add('gone');
    if (!siTurn) siNewTurn();
    if (!siAskEl) {
        siAskEl = document.createElement('div');
        siTurn.insertBefore(siAskEl, siTurn.firstChild);
    }
    siAskEl.className = 'si-ask' + (partial ? ' partial' : '');
    siAskEl.textContent = text;
    siScrollDown();
}
function siAdd(cls, content, isHTML) {
    siHint.classList.add('gone');
    if (!siTurn) siNewTurn();
    var d = document.createElement('div');
    d.className = cls;
    if (isHTML) d.innerHTML = content; else d.textContent = content;
    siTurn.appendChild(d);
    siScrollDown();
    return d;
}

/* ---- state ---------------------------------------------------------- */
function siSetState(s) {
    siState = s;
    siWaveEl.classList.toggle('on', s === 'listen' || s === 'talk');
    $('siMic').classList.toggle('on', s === 'idle' && !siTypeMode);
    $('siThink').classList.toggle('on', s === 'think');
}
function siIdleWait() { siSetState('idle'); }

function siTypeFallback(msg) {
    siTypeMode = true;
    siSetState('idle');
    if (msg) siAdd('si-reply', msg);
    siTypeEl.classList.add('on');
    setTimeout(function () { if (siriUp) siTypeEl.focus(); }, 80);
}

/* ---- listening ------------------------------------------------------ */
/* quiet re-arms the microphone without the chime -- the recogniser
   gives up after a couple of seconds of silence, and a held home
   button should not ring every time it does */
function siListen(quiet) {
    if (!siriUp) return;
    if (siTypeMode) { siTypeEl.focus(); return; }
    if (siRecOn) return;
    if (!SR) {
        siTypeFallback('This browser has no speech recogniser, so type what you would like to ask.');
        return;
    }
    siFinal = ''; siHeard = '';
    siSetState('listen');
    if (!quiet) siChime(true);
    siMicOpen();

    var r;
    try { r = new SR(); } catch (e) { siTypeFallback('I could not start listening. Type instead.'); return; }
    r.lang = 'en-US';
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = function (ev) {
        if (r !== siRec) return;
        var interim = '';
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
            var alt = ev.results[i][0].transcript;
            if (ev.results[i].isFinal) siFinal += alt; else interim += alt;
        }
        siHeard = (siFinal + interim).trim();
        siShowAsk(siHeard, !siFinal);
    };

    r.onerror = function (ev) {
        if (r !== siRec) return;
        siRecOn = false;
        var err = ev.error;
        if (err === 'no-speech' || err === 'aborted') return;   /* onend tidies up */
        siRec = null;
        siMicClose();
        siSetState('idle');
        if (err === 'not-allowed' || err === 'service-not-allowed')
            siTypeFallback('I need permission to use the microphone. You can type instead.');
        else if (err === 'network')
            siTypeFallback('I could not reach the speech service. You can type instead.');
        else
            siAdd('si-reply', 'Sorry, I did not catch that.');
    };

    r.onend = function () {
        if (r !== siRec) return;
        siRecOn = false;
        if (!siriUp || siState !== 'listen') return;
        var said = (siFinal || siHeard).trim();
        /* silence while the button is still held: keep the mic open,
           the way hold-to-talk behaves on the device */
        if (!said && siHold && Date.now() - siStartedAt > 400) {
            siRec = null;
            siListen(true);
            return;
        }
        siMicClose();
        if (!said) { siChime(false); siIdleWait(); return; }
        siAsk(said);
    };

    siRec = r;
    siStartedAt = Date.now();
    try { r.start(); siRecOn = true; }
    catch (e) { siRec = null; siRecOn = false; siIdleWait(); }
}

function siStopListening() {
    if (siRec && siRecOn) { try { siRec.stop(); } catch (e) { } }
    else if (siState === 'listen') { siMicClose(); siIdleWait(); }
}

function siAsk(text) {
    siMicClose();
    siShowAsk(text, false);
    siChime(false);
    siSetState('think');
    clearTimeout(siThinkT);
    /* a beat of thinking: instant answers read as a glitch */
    siThinkT = setTimeout(function () {
        if (!siriUp) return;
        var a;
        try { a = siAnswer(text); }
        catch (e) { a = { say: 'Something went wrong with that one. Sorry.' }; }
        siReply(a);
    }, 620);
}

function siReply(a) {
    if (a.card) siAdd('si-card', a.card, true);
    var shown = (a.text === undefined) ? a.say : a.text;
    if (shown) siAdd('si-reply', shown);
    siSetState('talk');
    siSpeak(a.say, function () {
        if (!siriUp) return;
        siSetState('idle');
        if (a.then) a.then(); else siIdleWait();
    });
}

/* ---- open / close ---------------------------------------------------- */
function siriInvoke() {
    if (booting || asleep || batt.dead) return false;
    siHold = true;
    if (siriUp) {
        /* holding home again mid-answer cuts Siri off and listens,
           which is what the device does */
        if (siState === 'talk') {
            siSpeakSeq++;                    /* orphan the callback */
            clearTimeout(siSpeakGuard);
            if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) { } }
            siSetState('idle');
        }
        if (siState === 'idle') { siTurn = null; siListen(); }
        return true;
    }
    siriUp = true;
    siTypeMode = false;
    siTurn = null; siAskEl = null;
    siConv.innerHTML = '';
    siHint.classList.remove('gone');
    siTypeEl.value = '';
    siTypeEl.classList.remove('on');
    if (ccOpen) setCC(false);
    if (ncOpen) setNC(false);
    $('siri').classList.add('on');
    siLvl = 0.03;
    siStartWave();
    siListen();
    return true;
}

/* the home button coming back up ends the utterance, the way iOS's
   hold-to-talk does */
function siriRelease() {
    siHold = false;
    if (siriUp && siState === 'listen') siStopListening();
}

function siriClose() {
    if (!siriUp) return;
    siriUp = false;
    siHold = false;
    siTypeMode = false;
    if (siRec) {
        siRec.onresult = siRec.onerror = siRec.onend = null;
        try { siRec.abort(); } catch (e) { }
    }
    siRec = null; siRecOn = false;
    siMicClose();
    clearTimeout(siThinkT); clearTimeout(siSpeakGuard);
    if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) { } }
    siTypeEl.blur();
    siTypeEl.classList.remove('on');
    siSetState('idle');
    $('siMic').classList.remove('on');
    $('siri').classList.remove('on');
    setTimeout(function () {
        if (siriUp) return;
        siStopWave();
        siConv.innerHTML = '';
        siTurn = null; siAskEl = null;
        siHint.classList.remove('gone');
    }, 300);
}

$('siMic').addEventListener('click', function () {
    if (siState !== 'idle') return;
    siTurn = null;
    siListen();
});

/* typed requests, for the browsers with no recogniser */
siTypeEl.addEventListener('keydown', function (e) {
    e.stopPropagation();
    if (e.key === 'Enter') {
        e.preventDefault();
        var v = siTypeEl.value.trim();
        if (!v) return;
        siTypeEl.value = '';
        siTurn = null;
        siAsk(v);
    } else if (e.key === 'Escape') {
        e.preventDefault();
        siriClose();
    }
});

/* ------------------------------------------------------------------ */
/* WHAT SIRI KNOWS                                                    */
/* ------------------------------------------------------------------ */
/* Apostrophes come out entirely, so "what's" and "whats" are one word
   to every pattern below and none of them has to spell both. */
function siNorm(s) {
    return String(s).toLowerCase()
        .replace(/['’‘]/g, '')
        .replace(/[.,!?;:"“”]/g, ' ')
        .replace(/\s+/g, ' ').trim();
}
var SI_ONES = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
    nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
    sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, a: 1, an: 1, couple: 2
};
var SI_TENS = { twenty: 20, thirty: 30, forty: 40, fourty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
/* "45", "forty five" and "a" all have to come out as numbers */
function siNum(w) {
    if (w === undefined || w === null) return NaN;
    w = String(w).trim();
    if (/^\d+$/.test(w)) return +w;
    var parts = w.split(/[\s-]+/), total = 0, any = false;
    for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (SI_TENS[p] !== undefined) { total += SI_TENS[p]; any = true; }
        else if (SI_ONES[p] !== undefined) { total += SI_ONES[p]; any = true; }
        else if (/^\d+$/.test(p)) { total += +p; any = true; }
        else return NaN;
    }
    return any ? total : NaN;
}
var SI_NUMWORD = '\\d+|' + Object.keys(SI_ONES).concat(Object.keys(SI_TENS)).join('|');
/* the same words minus "a", "an" and "couple", which are far too common
   in ordinary speech to swap for digits */
var SI_DIGITS = new RegExp('\\b(' + Object.keys(SI_ONES)
    .filter(function (w) { return w !== 'a' && w !== 'an' && w !== 'couple'; })
    .concat(Object.keys(SI_TENS)).join('|') + ')\\b', 'g');

/* h:m plus an optional meridiem -> minutes past midnight. With no am or
   pm, iOS takes whichever reading comes next, and so does this. */
function siClockMin(h, mi, ap) {
    h = h % 24; mi = mi || 0;
    if (ap === 'pm') { if (h < 12) h += 12; return (h * 60 + mi) % 1440; }
    if (ap === 'am') { if (h === 12) h = 0; return (h * 60 + mi) % 1440; }
    var now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
    var a = (h % 12) * 60 + mi, b = (a + 720) % 1440;
    if (h >= 13) return (h * 60 + mi) % 1440;
    return a > nm ? a : (b > nm ? b : a);
}
function siAmPm(s) {
    if (!s) return null;
    s = s.replace(/[^apm]/g, '');
    return s.indexOf('p') === 0 ? 'pm' : (s.indexOf('a') === 0 ? 'am' : null);
}
function siTimeText(min) {
    var t = ampm(Math.floor(min / 60), min % 60);
    return t.t + ' ' + t.ap;
}
function siPlural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }

var SI_APPWORDS = {
    'messages': 'messages', 'message': 'messages', 'texts': 'messages', 'text messages': 'messages', 'imessage': 'messages',
    'facetime': 'facetime', 'face time': 'facetime',
    'clock': 'clock', 'alarm': 'clock', 'alarms': 'clock', 'timer': 'clock', 'stopwatch': 'clock', 'world clock': 'clock',
    'photos': 'photos', 'photo': 'photos', 'pictures': 'photos', 'camera roll': 'photos', 'my photos': 'photos',
    'camera': 'camera',
    'weather': 'weather', 'weather app': 'weather',
    'videos': 'videos', 'video': 'videos', 'movies': 'videos',
    'notes': 'notes', 'note': 'notes',
    'reminders': 'reminders', 'reminder': 'reminders',
    'stocks': 'stocks', 'stock': 'stocks', 'stocks app': 'stocks',
    'itunes': 'itunes', 'itunes store': 'itunes', 'the itunes store': 'itunes',
    'app store': 'appstore', 'appstore': 'appstore', 'the app store': 'appstore',
    'settings': 'settings', 'the settings': 'settings'
};
var SI_APPNAME = {
    messages: 'Messages', facetime: 'FaceTime', clock: 'Clock', photos: 'Photos',
    camera: 'Camera', weather: 'Weather', videos: 'Videos', notes: 'Notes',
    reminders: 'Reminders', stocks: 'Stocks', itunes: 'iTunes Store',
    appstore: 'App Store', settings: 'Settings'
};
function siAppId(name) {
    name = siNorm(name).replace(/^(the|my)\s+/, '').replace(/\s+app$/, '');
    if (SI_APPWORDS[name]) return SI_APPWORDS[name];
    if (SI_APPWORDS[name + ' app']) return SI_APPWORDS[name + ' app'];
    return null;
}
function siLaunch(id) {
    siriClose();
    setTimeout(function () {
        if (openAppId === id) return;
        if (openAppId) { closeApp(); setTimeout(function () { openApp(iconFor(id), id); }, DUR); }
        else openApp(iconFor(id), id);
    }, 300);
}

/* Control Center's tiles and Siri are the same switch, so flipping one
   here has to repaint the other */
function siToggle(k, on) {
    var idx = -1, i;
    for (i = 0; i < TOGGLES.length; i++) if (TOGGLES[i].k === k) idx = i;
    if (idx < 0) return null;
    var t = TOGGLES[idx];
    if (t.on !== on) {
        t.on = on;
        var el = $('ccToggles').children[idx];
        if (el) {
            el.classList.toggle('on', on);
            el.style.color = on ? '#000' : 'rgba(0,0,0,.72)';
        }
        if (k === 'wifi') seSetRadio(on);
        else if (k === 'bt') btSetRadio(on);
        else if (k === 'air') seSetAirplane(on);
    }
    return t;
}

function siRound(n) {
    var r = Math.round(n * 1e6) / 1e6;
    return String(r);
}
function siPick(a) { return a[Math.floor(Math.random() * a.length)]; }

function siAnswer(raw) {
    var q = siNorm(raw), m, i;
    var NW = SI_NUMWORD;

    /* ---- dismissals -------------------------------------------------- */
    if (/^(never ?mind|cancel|stop|forget it|go away|nothing|shut up|quiet|bye|goodbye|good ?night)\b/.test(q)) {
        return {
            say: /night/.test(q) ? 'Good night.' : (/bye/.test(q) ? 'Goodbye.' : 'OK.'),
            then: function () { setTimeout(siriClose, 420); }
        };
    }

    /* ---- opening apps -------------------------------------------------- */
    /* Verbs only ever used for launching. "show me" and "start" are
       left out on purpose: "show me the weather" wants the forecast
       and "start a timer" wants the Clock's countdown, not its icon. */
    var missApp = null;
    m = q.match(/^(?:open|launch|run|go to|bring up|take me to|switch to)\s+(.+)$/);
    if (m) {
        var aid = siAppId(m[1]);
        if (aid) {
            if (locked) return { say: "You'll need to unlock your iPod first." };
            return {
                say: 'Opening ' + SI_APPNAME[aid] + '.',
                text: 'Opening ' + SI_APPNAME[aid] + '…',
                then: function () { siLaunch(aid); }
            };
        }
        /* not an app: let the rest of the grammar have a go, and only
           fall back to "no such app" if nothing else claims it */
        missApp = m[1];
    }

    /* ---- time -------------------------------------------------------- */
    /* Anchored, or every sentence with "time" in it lands here --
       "how much time is left on my timer" included. */
    if (/^(?:hey siri )?(?:whats|what is|tell me)?\s*(?:the )?time$/.test(q) ||
        /^what time is it(?: now| right now)?$/.test(q) ||
        /^(?:do you have|got) the time$/.test(q)) {
        var d = new Date(), t = ampm(d.getHours(), d.getMinutes());
        return {
            say: "It's " + t.t + ' ' + t.ap + '.',
            text: '',
            card: '<div class="c-top"><div class="c-title">' + esc(DAYS[d.getDay()]) + '</div>' +
                '<div class="c-sub">' + esc(MONS[d.getMonth()]) + ' ' + d.getDate() + '</div></div>' +
                '<div class="c-big">' + t.t + '<span style="font-size:22px;letter-spacing:-.4px"> ' + t.ap + '</span></div>'
        };
    }

    /* ---- date -------------------------------------------------------- */
    if (/^(?:whats|what is|tell me)?\s*(?:todays|the)?\s*date$/.test(q) ||
        /what day is (it|today)/.test(q) || /^what is today$/.test(q)) {
        var dd = new Date();
        var txt = DAYS[dd.getDay()] + ', ' + MONS[dd.getMonth()] + ' ' + dd.getDate() + ', ' + dd.getFullYear();
        return { say: "It's " + txt + '.', text: txt };
    }

    /* ---- battery ------------------------------------------------------ */
    if (/\bbattery\b/.test(q) || /how much (charge|power|juice)/.test(q)) {
        var lv = Math.round(batt.level);
        var say = 'The battery is at ' + lv + ' percent' + (batt.charging ? ', and charging.' : '.');
        return {
            say: say, text: '',
            card: '<div class="c-top"><div class="c-title">Battery</div>' +
                '<div class="c-sub">' + (batt.charging ? 'Charging' : 'On battery') + '</div></div>' +
                '<div class="c-big">' + lv + '<span style="font-size:26px">%</span></div>' +
                '<div class="c-rule"></div>' +
                '<div class="c-row"><span class="grow">Condition</span><span class="val">' +
                esc(batt.cond.n) + '</span></div>'
        };
    }

    /* ---- alarms ------------------------------------------------------- */
    var wake = false;
    m = q.match(/\b(?:set|make|create)?\s*(?:an?\s+)?alarm\s+(?:for|at)\s+(\d{1,2})(?:[:\s](\d{2}))?\s*(a\s?m|p\s?m|am|pm)?/);
    if (!m) {
        m = q.match(/\b(?:wake me up|get me up)\s+(?:at|for)\s+(\d{1,2})(?:[:\s](\d{2}))?\s*(a\s?m|p\s?m|am|pm)?/);
        wake = !!m;
    }
    if (m) {
        var ap0 = siAmPm(m[3]);
        /* "wake me up at 7" means the morning, whatever time it is now */
        if (!ap0 && wake && +m[1] >= 4 && +m[1] <= 11) ap0 = 'am';
        var amin = siClockMin(+m[1], m[2] ? +m[2] : 0, ap0);
        var nid = 1;
        for (i = 0; i < alarms.length; i++) nid = Math.max(nid, alarms[i].id + 1);
        alarms.push({ id: nid, min: amin, lbl: 'Alarm', on: true, rep: [], snd: 'Radar', sn: true });
        renderAlarms();
        var at = ampm(Math.floor(amin / 60), amin % 60);
        return {
            say: "It's set for " + at.t + ' ' + at.ap + '.', text: '',
            card: '<div class="c-top"><div class="c-title">Alarm</div><div class="c-sub">On</div></div>' +
                '<div class="c-big">' + at.t + '<span style="font-size:22px"> ' + at.ap + '</span></div>'
        };
    }
    if (/\b(what|which|any|list|show)\b.*\balarms?\b/.test(q) || /^alarms$/.test(q)) {
        var on = alarms.filter(function (a) { return a.on; });
        if (!on.length) return { say: 'You have no alarms set.' };
        on.sort(function (a, b) { return a.min - b.min; });
        var rows = on.map(function (a) {
            return '<div class="c-row"><span class="grow">' + esc(a.lbl) + '</span>' +
                '<span class="val">' + siTimeText(a.min) + '</span></div>';
        }).join('');
        return {
            say: on.length === 1 ? 'One alarm, at ' + siTimeText(on[0].min) + '.'
                : 'You have ' + on.length + ' alarms set.',
            text: '',
            card: '<div class="c-top"><div class="c-title">Alarms</div></div>' + rows
        };
    }
    if (/\b(turn off|delete|remove|cancel)\b.*\balarms?\b/.test(q)) {
        var hit = 0;
        alarms.forEach(function (a) { if (a.on) { a.on = false; hit++; } });
        renderAlarms();
        return { say: hit ? 'OK, I turned ' + (hit === 1 ? 'it' : 'them') + ' off.' : 'There were no alarms on.' };
    }

    /* ---- timer -------------------------------------------------------- */
    m = q.match(new RegExp('\\b(?:set|start)?\\s*(?:a\\s+)?timer\\s+(?:for|of)\\s+((?:' + NW + ')(?:[\\s-](?:' + NW + '))?)\\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)'));
    if (m) {
        var n = siNum(m[1]);
        if (!isFinite(n) || n <= 0) return { say: 'I did not catch how long.' };
        var unit = m[2][0] === 'h' ? 3600 : (m[2][0] === 'm' ? 60 : 1);
        var total = Math.round(n * unit);
        /* the Clock's countdown is whole minutes, so that is what it gets */
        var mins = Math.max(1, Math.round(total / 60));
        if (mins > 23 * 60 + 59) mins = 23 * 60 + 59;
        tmr.h = Math.floor(mins / 60);
        tmr.m = mins % 60;
        if (tmHoursW) wheelSet(tmHoursW, tmr.h);
        if (tmMinsW) wheelSet(tmMinsW, tmr.m);
        tmStart();
        var lbl = (tmr.h ? siPlural(tmr.h, 'hour') + (tmr.m ? ' and ' : '') : '') +
            (tmr.m ? siPlural(tmr.m, 'minute') : '');
        return {
            say: lbl + ', starting now.', text: '',
            card: '<div class="c-top"><div class="c-title">Timer</div><div class="c-sub">Counting down</div></div>' +
                '<div class="c-big">' + fmtTimer(tmLeft()) + '</div>'
        };
    }
    if (/\b(stop|cancel|end)\b.*\btimer\b/.test(q)) {
        if (tmr.state === 'idle') return { say: 'There is no timer running.' };
        tmCancel();
        return { say: 'OK, I stopped it.' };
    }
    if (/\b(pause|hold)\b.*\btimer\b/.test(q)) {
        if (tmr.state !== 'run') return { say: 'There is no timer running.' };
        tmr.left = tmLeft(); tmr.state = 'pause'; tmPaint();
        return { say: 'Paused.' };
    }
    if (/\btimer\b/.test(q) && /(how (much|long)|left|remaining|status|check)/.test(q)) {
        if (tmr.state === 'idle') return { say: 'There is no timer running.' };
        var left = fmtTimer(tmLeft());
        var secs = Math.ceil(tmLeft() / 1000), spoken = [];
        if (Math.floor(secs / 3600)) spoken.push(siPlural(Math.floor(secs / 3600), 'hour'));
        if (Math.floor(secs / 60) % 60) spoken.push(siPlural(Math.floor(secs / 60) % 60, 'minute'));
        if (secs % 60 && secs < 3600) spoken.push(siPlural(secs % 60, 'second'));
        return {
            say: (spoken.join(' and ') || 'Less than a second') + ' remaining.',
            text: '',
            card: '<div class="c-top"><div class="c-title">Timer</div><div class="c-sub">' +
                (tmr.state === 'pause' ? 'Paused' : 'Counting down') + '</div></div>' +
                '<div class="c-big">' + left + '</div>'
        };
    }

    /* ---- reminders ---------------------------------------------------- */
    m = q.match(/^(?:remind me to|remind me|add a reminder to|add a reminder|remember to)\s+(.+)$/);
    if (m) {
        var body = m[1].trim();
        var due = null, when = '';
        var tm = body.match(/\s+(?:at|by)\s+(\d{1,2})(?::(\d{2}))?\s*(a\s?m|p\s?m|am|pm)?$/);
        if (tm) {
            body = body.slice(0, tm.index).trim();
            var dmin = siClockMin(+tm[1], tm[2] ? +tm[2] : 0, siAmPm(tm[3]));
            var nd = new Date();
            nd.setHours(Math.floor(dmin / 60), dmin % 60, 0, 0);
            if (nd.getTime() < Date.now()) nd.setDate(nd.getDate() + 1);
            due = nd;
            when = ' at ' + siTimeText(dmin);
        }
        if (!body) return { say: 'What would you like me to remind you about?' };
        body = body.charAt(0).toUpperCase() + body.slice(1);
        RM_LISTS[0].items.push(rmMk(body, { due: due }));
        rmRender();
        return {
            say: "OK, I'll remind you.", text: '',
            card: '<div class="c-top"><div class="c-title">Reminders</div>' +
                '<div class="c-sub">' + (due ? esc(siTimeText(due.getHours() * 60 + due.getMinutes())) : 'No date') + '</div></div>' +
                '<div class="c-row"><span class="grow">' + esc(body) + '</span></div>'
        };
    }
    if (/\b(what|which|list|show|read)\b.*\breminders?\b/.test(q)) {
        var items = [];
        RM_LISTS.forEach(function (l) {
            l.items.forEach(function (it) { if (!it.done) items.push(it); });
        });
        if (!items.length) return { say: 'You have nothing on your reminders list.' };
        return {
            say: 'You have ' + siPlural(items.length, 'reminder') + '.', text: '',
            card: '<div class="c-top"><div class="c-title">Reminders</div></div>' +
                items.slice(0, 6).map(function (it) {
                    return '<div class="c-row"><span class="grow">' + esc(it.t) + '</span></div>';
                }).join('')
        };
    }

    /* ---- weather ------------------------------------------------------ */
    if (/\b(weather|forecast|temperature|how (hot|cold|warm)|is it (raining|sunny|cold|hot|warm)|do i need (a|an) (coat|jacket|umbrella))\b/.test(q)) {
        var city = WX_CITIES[0];
        var cm = q.match(/\bin ([a-z\s]+?)(?:\s+(?:today|tomorrow|right now|now))?$/);
        if (cm) {
            var want = cm[1].trim();
            for (i = 0; i < WX_CITIES.length; i++)
                if (WX_CITIES[i].n.toLowerCase() === want || WX_CITIES[i].n.toLowerCase().indexOf(want) === 0) city = WX_CITIES[i];
        }
        var st = wxState(city);
        var lab = WX_LABEL[st.cond] || 'Clear';
        var hi = wxT(st.day.hi), lo = wxT(st.day.lo), u = WX_UNIT === 'C' ? 'C' : 'F';
        return {
            say: "It's " + wxT(st.temp) + ' degrees and ' + lab.toLowerCase() + ' in ' + city.n +
                ', with a high of ' + hi + ' and a low of ' + lo + '.',
            text: '',
            card: '<div class="c-top"><div class="c-title">' + esc(city.n) + '</div>' +
                '<div class="c-sub">' + esc(lab) + '</div></div>' +
                '<div class="c-big">' + wxT(st.temp) + '&deg;<span style="font-size:22px">' + u + '</span></div>' +
                '<div class="c-rule"></div>' +
                '<div class="c-row"><span class="grow">High</span><span class="val">' + hi + '&deg;</span></div>' +
                '<div class="c-row"><span class="grow">Low</span><span class="val">' + lo + '&deg;</span></div>' +
                '<div class="c-row"><span class="grow">Chance of rain</span><span class="val">' + st.day.pop + '%</span></div>'
        };
    }

    /* ---- stocks ------------------------------------------------------- */
    if (/\b(stock|share price|trading at|nasdaq|dow|hows? [a-z.^\s]+ doing)\b/.test(q) ||
        /\b(whats?|hows?|how is) (the )?(price of|[a-z.^]+) (stock|share|trading|doing|at)\b/.test(q)) {
        var found = null;
        for (i = 0; i < ST_SYMS.length; i++) {
            var s = ST_SYMS[i];
            var sym = s.s.replace('^', '').toLowerCase();
            var nm = s.n.toLowerCase();
            if (q.indexOf(sym) > -1 || q.indexOf(nm) > -1 || (nm.split(' ')[0].length > 3 && q.indexOf(nm.split(' ')[0]) > -1)) { found = s; break; }
        }
        if (!found) return { say: 'I could not find that one on your watchlist.' };
        var up = found.ch >= 0;
        return {
            say: found.n + ' is at ' + found.p.toLocaleString() + ', ' +
                (up ? 'up ' : 'down ') + Math.abs(found.ch) + ' percent.',
            text: '',
            card: '<div class="c-top"><div class="c-title">' + esc(found.s) + '</div>' +
                '<div class="c-sub">' + esc(found.n) + '</div></div>' +
                '<div class="c-big">' + found.p.toLocaleString() + '</div>' +
                '<div class="c-row"><span class="grow ' + (up ? 'c-up' : 'c-down') + '">' +
                (up ? '+' : '') + found.ch + '%</span>' +
                '<span class="val">Open ' + esc(found.open) + '</span></div>'
        };
    }

    /* ---- radios and switches -------------------------------------------- */
    m = q.match(/\bturn\s+(on|off)\s+(?:the\s+)?(wi[\s-]?fi|wifi|bluetooth|airplane mode|aeroplane mode|flight mode|do not disturb|dnd)\b/) ||
        q.match(/\b(wi[\s-]?fi|wifi|bluetooth|airplane mode|aeroplane mode|flight mode|do not disturb|dnd)\s+(on|off)\b/);
    if (m) {
        var want2 = (m[1] === 'on' || m[1] === 'off') ? m[1] : m[2];
        var key = (m[1] === 'on' || m[1] === 'off') ? m[2] : m[1];
        var kk = /wi/.test(key) ? 'wifi' : /blue/.test(key) ? 'bt' :
            /(airplane|aeroplane|flight)/.test(key) ? 'air' : 'dnd';
        var tg = siToggle(kk, want2 === 'on');
        if (!tg) return { say: 'I cannot change that one.' };
        return { say: tg.n + ' is ' + (want2 === 'on' ? 'on' : 'off') + '.' };
    }
    m = q.match(/\bis\s+(wi[\s-]?fi|wifi|bluetooth|airplane mode|do not disturb)\s+(on|off)?/);
    if (m) {
        var kq = /wi/.test(m[1]) ? 'wifi' : /blue/.test(m[1]) ? 'bt' : /airplane/.test(m[1]) ? 'air' : 'dnd';
        for (i = 0; i < TOGGLES.length; i++) if (TOGGLES[i].k === kq)
            return { say: TOGGLES[i].n + ' is ' + (TOGGLES[i].on ? 'on' : 'off') + '.' };
    }

    /* ---- volume and sleep ------------------------------------------------ */
    m = q.match(/\bturn\s+(up|down)\s+(?:the\s+)?volume\b/) || q.match(/\bvolume\s+(up|down)\b/);
    if (m) { bumpVol(m[1] === 'up' ? 3 : -3); return { say: 'OK.' }; }
    if (/\b(mute|silence)\b/.test(q)) { vol = 0; showVolHud(); return { say: 'OK, muted.' }; }
    if (/\bvolume\b.*\b(max|full|all the way)\b/.test(q)) { vol = VOL_STEPS; showVolHud(); return { say: 'OK.' }; }
    if (/\b(lock (the )?(screen|ipod|phone)|go to sleep|sleep now|turn (the )?(screen|display) off)\b/.test(q)) {
        return { say: 'OK.', then: function () { siriClose(); setTimeout(function () { setSleep(true); }, 320); } };
    }

    /* ---- arithmetic ------------------------------------------------------- */
    /* "zero divided by zero" has to reach the same place "0 / 0" does,
       so spelled-out numbers become digits first ("a" is left alone) */
    m = q.replace(SI_DIGITS, function (w) {
        return String(SI_ONES[w] !== undefined ? SI_ONES[w] : SI_TENS[w]);
    }).match(/(-?\d+(?:\.\d+)?)\s*(plus|\+|minus|-|times|x|multiplied by|\*|divided by|over|\/)\s*(-?\d+(?:\.\d+)?)/);
    if (m) {
        var a1 = parseFloat(m[1]), b1 = parseFloat(m[3]), op = m[2], res;
        if (op === 'plus' || op === '+') res = a1 + b1;
        else if (op === 'minus' || op === '-') res = a1 - b1;
        else if (op === 'times' || op === 'x' || op === '*' || op === 'multiplied by') res = a1 * b1;
        else {
            if (b1 === 0) {
                if (a1 === 0) return {
                    say: 'Imagine that you have zero cookies, and you split them evenly among zero friends. ' +
                        'How many cookies does each person get? See? It does not make sense. And Cookie Monster is sad that ' +
                        'there are no cookies, and you are sad that you have no friends.'
                };
                return { say: 'That is undefined.' };
            }
            res = a1 / b1;
        }
        return { say: siRound(res), text: siRound(m[1]) + ' ' + op + ' ' + siRound(m[3]) + ' = ' + siRound(res) };
    }

    /* ---- odds and ends ---------------------------------------------------- */
    if (/\b(flip|toss) a coin\b/.test(q)) {
        var side = Math.random() < 0.5 ? 'Heads' : 'Tails';
        return { say: side + '.', text: side };
    }
    if (/\b(roll (a|the) (die|dice)|roll a d6)\b/.test(q)) {
        var r6 = 1 + Math.floor(Math.random() * 6);
        return { say: 'I rolled a ' + r6 + '.', text: String(r6) };
    }
    m = q.match(/random number(?:\s+between\s+(\d+)\s+and\s+(\d+))?/);
    if (m) {
        var loN = m[1] ? +m[1] : 1, hiN = m[2] ? +m[2] : 100;
        if (hiN < loN) { var sw = loN; loN = hiN; hiN = sw; }
        var pick = loN + Math.floor(Math.random() * (hiN - loN + 1));
        return { say: String(pick), text: String(pick) };
    }

    /* ---- the assistant itself ---------------------------------------------- */
    if (/\b(what can (you|siri) do|what can i (ask|say)|help me|^help$|what do you do)\b/.test(q) || q === 'help') {
        return {
            say: 'Here are a few things you can ask me.', text: '',
            card: '<div class="c-top"><div class="c-title">Some things you can ask me</div></div>' +
                ['What time is it?', 'What is the weather?', 'Set an alarm for 7:30 am',
                    'Set a timer for 10 minutes', 'Remind me to call Janae at 6 pm',
                    'Open Photos', 'Turn on Wi-Fi', "What's my battery?", 'What is 47 times 12?']
                    .map(function (x) { return '<div class="c-row"><span class="grow">&ldquo;' + esc(x) + '&rdquo;</span></div>'; }).join('')
        };
    }
    if (/\b(who are you|what are you|what is siri)\b/.test(q))
        return { say: 'I am Siri. I work for you.' };
    if (/\bwhat(?:'s| is)? your name\b/.test(q))
        return { say: 'My name is Siri.' };
    if (/\bhow are you\b/.test(q))
        return { say: siPick(['I am well. Thanks for asking.', 'I am fine, thank you.', 'Excellent, as always.']) };
    if (/\b(thank you|thanks|cheers)\b/.test(q))
        return { say: siPick(['You are welcome.', 'My pleasure.', 'Any time.']) };
    if (/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/.test(q))
        return { say: siPick(['Hello.', 'Hi there.', 'What can I do for you?']) };
    if (/\bi love you\b/.test(q))
        return { say: siPick(['That is nice of you to say.', 'Oh, stop it.', 'I hope you do not say that to the other assistants.']) };
    if (/\btell me a joke\b/.test(q))
        return {
            say: siPick([
                'Two iPhones walk into a bar. I forget the rest.',
                'The past, the present and the future walk into a bar. It was tense.',
                'I would tell you a joke about a broken pencil, but it is pointless.'
            ])
        };
    if (/\b(sing|sing me a song)\b/.test(q))
        return { say: 'Daisy, Daisy, give me your answer do. I am half crazy, all for the love of you.' };
    if (/\bopen the pod bay doors\b/.test(q))
        return { say: "I'm sorry, I'm afraid I can't do that. Are you happy now?" };
    if (/\bmeaning of life\b/.test(q))
        return { say: siPick(['Forty two.', 'I do not know. But I think there is an app for that.']) };
    if (/\b(what|which)\b.*\b(ios|version|software)\b/.test(q))
        return { say: 'This iPod touch is running iOS 9 point 3 point 5.' };

    /* ---- nothing matched -------------------------------------------------- */
    if (missApp) return { say: 'I could not find an app called ' + missApp + '.' };
    return {
        say: siPick([
            'Sorry, I do not know that one.',
            "I'm not sure I understand.",
            'I can only help with what is on this iPod. Ask me what I can do.'
        ])
    };
}
