"use strict";
/* Power-on to desktop.  The desktop is built underneath from the start
   (#screen carries .locked, so its bar, icons and Dock are held back) and
   #boot covers it through four stages:

     off    -- black, "Click anywhere to power on"
     chime  -- the screen lights grey, the chime, the Apple mark, the bar
     login  -- the blurred wallpaper and the password field
     (gone) -- #boot fades and the desktop arrives, Dock last

   A restart or log out from the Apple menu reloads the page and leaves a
   note in sessionStorage so it comes back up at the right stage. */

var BOOT_PASSWORD = "12345";
var BOOT_HINT = "Easy to guess";

/* the chime, if a file is dropped in; otherwise it is synthesised */
var BOOT_CHIME_SRC = "assets/audio/chime.mp3";

/* where the pointer turns up once the bar is done -- the top edge, a bit
   over a quarter across, as in the first login shot */
var BOOT_CURSOR_AT = { x: 0.2875, y: 2 };

/* the bar's pace: [seconds, fraction] -- a few stalls and spurts */
var BOOT_PROGRESS = [
    [0, 0], [0.5, 0.06], [1.3, 0.11], [1.8, 0.3], [2.6, 0.38], [3.3, 0.55],
    [3.9, 0.59], [4.7, 0.8], [5.3, 0.86], [6, 1]
];

var loggedIn = false;
var bootEl = null;
var bootOnDesktop = null;
var bootTries = 0;
var bootBusy = false;
var bootClockTimer = null;

var BOOT_SVG = {
    back: '<svg viewBox="0 0 12 12"><path d="M7.6 2 3.6 6l4 4"/></svg>',
    go: '<svg viewBox="0 0 12 12"><path d="M1.8 6h8M6.6 2.4 10.2 6l-3.6 3.6"/></svg>',
    sleep: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14.3"/><path d="M2.6 20.5h26.8"/></svg>',
    restart: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14.3"/><path d="M20 10.2 11 16l9 5.8z"/></svg>',
    shutdown: '<svg viewBox="0 0 32 32"><path d="M9.8 7.6a12.3 12.3 0 1 0 12.4 0"/><path d="M16 1v14"/></svg>'
};

/* Apple's twelve-spoke spinner, each spoke a step fainter */
function bootSpinnerSVG() {
    var s = '<svg viewBox="0 0 18 18">';
    for (var i = 0; i < 12; i++) {
        s += '<rect x="8.1" y="1" width="1.8" height="4.6" rx=".9" fill="#fff" ' +
            'opacity="' + (1 - i * 0.07).toFixed(2) + '" ' +
            'transform="rotate(' + (-i * 30) + ' 9 9)"/>';
    }
    return s + "</svg>";
}

function bootInit(onDesktop) {
    bootOnDesktop = onDesktop;
    bootEl = $("boot");
    bootEl.innerHTML =
        '<div class="b-stage b-off"><div class="hint">Click anywhere to power on</div></div>' +

        '<div class="b-stage b-chime">' +
        '<div class="b-apple">' + ICON.apple + "</div>" +
        '<div class="b-bar"><i></i></div></div>' +

        '<div class="b-stage b-login">' +
        '<div class="b-wall"></div>' +
        '<div class="b-extras fadeable"></div>' +
        '<div class="b-center">' +
        '<div class="b-avatar"><img src="' + sysIconSrc("UserIcon", 128) + '" alt=""></div>' +
        '<div class="b-name">' + esc(sys.user) + "</div>" +
        '<div class="b-row">' +
        '<div class="b-round b-back">' + BOOT_SVG.back + "</div>" +
        '<div class="b-field"><input type="password" placeholder="Enter Password" ' +
        'spellcheck="false" autocomplete="off"><div class="b-q">?</div></div>' +
        '<div class="b-round b-go">' + BOOT_SVG.go + "</div></div>" +
        '<div class="b-spinner">' + bootSpinnerSVG() + "</div>" +
        '<div class="b-hint"><div class="t">Password Hint</div><div class="m">' +
        esc(BOOT_HINT) + "</div></div></div>" +
        '<div class="b-power fadeable">' +
        '<div class="b-pbtn" data-act="sleep" style="left:-100px">' + BOOT_SVG.sleep + "<span>Sleep</span></div>" +
        '<div class="b-pbtn" data-act="restart" style="left:0">' + BOOT_SVG.restart + "<span>Restart</span></div>" +
        '<div class="b-pbtn" data-act="shutdown" style="left:100px">' + BOOT_SVG.shutdown + "<span>Shut Down</span></div>" +
        "</div></div>";

    bootWireLogin();
    cursorHide(true);

    var note = null;
    try {
        note = sessionStorage.getItem("macsim-boot");
        sessionStorage.removeItem("macsim-boot");
    } catch (e) { /* storage blocked: just start from off */ }

    if (note === "restart") setTimeout(bootPowerOn, 900);
    else if (note === "login") setTimeout(function () { bootShowLogin(); }, 400);
    else bootOff();
}

function bootStage(name) {
    return bootEl.querySelector(".b-" + name);
}

function bootOff() {
    bootStage("off").classList.add("on");
    bootEl.addEventListener("mousedown", function once(e) {
        if (!bootStage("off").classList.contains("on")) return;
        e.preventDefault();
        bootEl.removeEventListener("mousedown", once);
        bootPowerOn();
    });
}

/* ---------- boot screen ---------- */
function bootPowerOn() {
    bootStage("off").classList.remove("on");
    var chime = bootStage("chime");
    var apple = chime.querySelector(".b-apple");
    var bar = chime.querySelector(".b-bar");
    var fill = bar.querySelector("i");
    apple.classList.remove("show");
    bar.classList.remove("show");
    fill.style.width = "0";
    chime.classList.add("on");
    bootChime();

    setTimeout(function () { apple.classList.add("show"); }, 1100);
    setTimeout(function () {
        bar.classList.add("show");
        var last = BOOT_PROGRESS[BOOT_PROGRESS.length - 1][0];
        var t0 = performance.now();
        var step = function (now) {
            var t = (now - t0) / 1000;
            fill.style.width = (bootProgressAt(t) * 100).toFixed(2) + "%";
            if (t < last) { requestAnimationFrame(step); return; }
            setTimeout(function () {
                cursorPlace(window.innerWidth * BOOT_CURSOR_AT.x, BOOT_CURSOR_AT.y);
            }, 450);
            setTimeout(bootShowLogin, 1300);
        };
        requestAnimationFrame(step);
    }, 2500);
}

function bootProgressAt(t) {
    var p = BOOT_PROGRESS;
    for (var i = 1; i < p.length; i++) {
        if (t <= p[i][0]) {
            var k = (t - p[i - 1][0]) / (p[i][0] - p[i - 1][0]);
            return p[i - 1][1] + (p[i][1] - p[i - 1][1]) * k;
        }
    }
    return 1;
}

/* The real file if there is one; if it is missing, or the browser won't
   play it, the chord is built instead.  The AudioContext is made here,
   inside the click, so the fallback is still allowed to sound after the
   file has had its chance to fail. */
function bootChime() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (e) { /* no Web Audio */ }

    var fellBack = false;
    var fallback = function () {
        if (fellBack) return;
        fellBack = true;
        bootChimeSynth();
    };
    try {
        var a = new Audio(BOOT_CHIME_SRC);
        a.addEventListener("error", fallback);
        var p = a.play();
        if (p && p.catch) p.catch(fallback);
    } catch (e) { fallback(); }
}

/* An F-sharp major chord across three octaves: pairs of slightly detuned
   saws through a lowpass that opens on the strike and closes as it rings,
   with a generated tail of reverb under it. */
function bootChimeSynth() {
    try {
        var ctx = audioCtx;
        if (!ctx) return;
        var t0 = ctx.currentTime + 0.03;
        var LEN = 4.2;

        var master = ctx.createGain();
        master.gain.value = 0.2;
        master.connect(ctx.destination);

        var lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.Q.value = 0.5;
        lp.frequency.setValueAtTime(800, t0);
        lp.frequency.exponentialRampToValueAtTime(3000, t0 + 0.04);
        lp.frequency.exponentialRampToValueAtTime(650, t0 + LEN);
        lp.connect(master);

        var rate = ctx.sampleRate, n = Math.floor(rate * 2.6);
        var imp = ctx.createBuffer(2, n, rate);
        for (var c = 0; c < 2; c++) {
            var d = imp.getChannelData(c);
            for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
        }
        var rev = ctx.createConvolver();
        rev.buffer = imp;
        var wet = ctx.createGain();
        wet.gain.value = 0.3;
        lp.connect(rev);
        rev.connect(wet);
        wet.connect(master);

        [92.5, 138.59, 185, 233.08, 277.18, 369.99].forEach(function (f, idx) {
            var peak = 0.11 / (1 + idx * 0.2);
            [-6, 6].forEach(function (cents) {
                var o = ctx.createOscillator(), g = ctx.createGain();
                o.type = "sawtooth";
                o.frequency.value = f;
                o.detune.value = cents;
                g.gain.setValueAtTime(0.0001, t0);
                g.gain.exponentialRampToValueAtTime(peak, t0 + 0.03);
                g.gain.exponentialRampToValueAtTime(peak * 0.45, t0 + 0.7);
                g.gain.exponentialRampToValueAtTime(0.0001, t0 + LEN);
                o.connect(g);
                g.connect(lp);
                o.start(t0);
                o.stop(t0 + LEN + 0.1);
            });
        });
    } catch (e) { /* autoplay policy said no */ }
}

/* ---------- login ---------- */
function bootShowLogin() {
    var login = bootStage("login");
    var row = login.querySelector(".b-row");
    var input = row.querySelector("input");
    bootStage("off").classList.remove("on");
    login.classList.remove("signing");
    row.classList.remove("checking", "typed", "shake");
    login.querySelector(".b-spinner").classList.remove("on");
    login.querySelector(".b-hint").classList.remove("on");
    input.value = "";
    bootTries = 0;
    bootBusy = false;

    bootRenderExtras();
    if (!bootClockTimer) bootClockTimer = setInterval(bootRenderExtras, 10000);
    if (!cursorIsShown()) cursorPlace(window.innerWidth * BOOT_CURSOR_AT.x, BOOT_CURSOR_AT.y);

    login.classList.add("on");
    /* the boot screen stays lit under the fade, then goes */
    setTimeout(function () { bootStage("chime").classList.remove("on"); }, 950);
    input.focus();
}

function bootRenderExtras() {
    var x = bootStage("login").querySelector(".b-extras");
    x.innerHTML =
        '<span class="batt-wrap"><span>' + Math.round(sys.battery) + "%</span>" + batteryIcon() + "</span>" +
        (sys.wifi ? ICON.wifi : "") +
        "<span>" + clockText(new Date()).replace(/^\w+ /, "") + "</span>";
}

function bootWireLogin() {
    var login = bootStage("login");
    var row = login.querySelector(".b-row");
    var input = row.querySelector("input");
    var hint = login.querySelector(".b-hint");

    /* the field keeps the focus wherever the click lands, as it does on
       the real login window */
    bootEl.addEventListener("mousedown", function (e) {
        if (e.target !== input) e.preventDefault();
    });

    input.addEventListener("input", function () {
        row.classList.toggle("typed", input.value.length > 0);
        hint.classList.remove("on");
    });
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); bootSubmit(); }
        else if (e.key === "Escape") { e.preventDefault(); input.value = ""; row.classList.remove("typed"); }
    });

    login.querySelector(".b-go").addEventListener("click", bootSubmit);
    login.querySelector(".b-back").addEventListener("click", function () {
        input.value = "";
        row.classList.remove("typed");
        hint.classList.remove("on");
        input.focus();
    });
    login.querySelector(".b-q").addEventListener("click", function () {
        hint.classList.toggle("on");
        input.focus();
    });

    login.querySelectorAll(".b-pbtn").forEach(function (b) {
        b.addEventListener("click", function () {
            if (bootBusy) return;
            var act = b.dataset.act;
            if (act === "sleep") { powerDown("sleep"); return; }
            bootBusy = true;
            input.blur();
            login.classList.remove("on");
            cursorHide(true);
            if (act === "restart") setTimeout(bootPowerOn, 1500);
            else setTimeout(bootOff, 1200);
        });
    });
}

function bootSubmit() {
    if (bootBusy) return;
    var login = bootStage("login");
    var row = login.querySelector(".b-row");
    var input = row.querySelector("input");
    var spinner = login.querySelector(".b-spinner");
    login.querySelector(".b-hint").classList.remove("on");

    var right = input.value === BOOT_PASSWORD;
    bootBusy = true;
    row.classList.add("checking");
    spinner.classList.add("on");

    if (right) {
        login.classList.add("signing");
        cursorHide(true);
        setTimeout(bootArrive, 1700);
        return;
    }

    setTimeout(function () {
        spinner.classList.remove("on");
        row.classList.remove("checking", "shake");
        void row.offsetWidth;           /* let a second shake replay */
        row.classList.add("shake");
        input.focus();
        input.select();
        bootTries++;
        /* three misses and the hint offers itself */
        if (bootTries >= 3) login.querySelector(".b-hint").classList.add("on");
        bootBusy = false;
    }, 1000);
}

function bootArrive() {
    var screen = $("screen");
    loggedIn = true;
    clearInterval(bootClockTimer);
    bootClockTimer = null;
    bootStage("login").querySelector("input").blur();

    screen.classList.add("arriving");
    bootEl.classList.add("gone");
    screen.classList.remove("locked");

    setTimeout(function () { cursorHide(false); }, 500);
    setTimeout(function () {
        screen.classList.remove("arriving");
        bootEl.style.display = "none";
        if (bootOnDesktop) bootOnDesktop();
    }, 1600);
}
