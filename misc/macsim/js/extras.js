"use strict";
/* the menu extras on the right of the bar, and the popups they drop */

var WIFI = [
    { n: "ALLO SmartTown Wi-Fi", bars: 1 },
    { n: "lord of the pings", bars: 3 },
    { n: "pretty fly for a wifi", bars: 3 },
    { n: "pretty fly for a wifi_5GHz", bars: 3 },
    { n: "PUhlir", bars: 2 },
    { n: "RODGERS", bars: 2 },
    { n: "Rodgers Deco", bars: 3 },
    { n: "SpectrumSetup-D1", bars: 2 },
    { n: "TP-LINK_54E4-2.4GHZ", bars: 3 }
];

function extrasRender() {
    var right = $("mbRight");
    right.innerHTML = "";

    /* id -> element id, because the stylesheet addresses a few of these
       by name (the clock and the battery draw their own contents) */
    var DOMID = {
        timemachine: "mbTimeMachine", bluetooth: "mbBluetooth", wifi: "mbWifi",
        volume: "mbVolume", battery: "mbBattery", clock: "mbClock",
        spotlight: "mbSpotlight", notify: "mbNotify"
    };

    var add = function (id, html, cls) {
        var n = el("div", "extra " + (cls || ""), html);
        n.id = DOMID[id];
        n.addEventListener("mousedown", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (menuOpenId === id) { menuCloseAll(); return; }
            extraOpen(id, n);
        });
        n.addEventListener("mouseenter", function () {
            if (barTracking && menuOpenId !== id) extraOpen(id, n);
        });
        right.appendChild(n);
        return n;
    };

    add("timemachine", barGlyph("TimeMachine/TMIdle", 19, 17));
    add("bluetooth", barGlyph(sys.bluetooth ? "Bluetooth/Bluetooth_Idle" : "Bluetooth/Bluetooth_Off", 11, 17));
    add("wifi", sys.wifi ? ICON.wifi : '<span style="opacity:.35">' + ICON.wifi + "</span>");
    add("volume", volumeGlyph());
    add("battery", "", "wide");
    add("clock", "");
    add("spotlight", ICON.search);
    add("notify", ICON.notify);

    batteryRender();
    tick();
}

function extraOpen(id, n) {
    var r = n.getBoundingClientRect();
    if (menuOwner) menuOwner.classList.remove("open");

    if (id === "spotlight") { spotToggle(); return; }
    if (id === "notify") { ncToggle(); return; }
    if (id === "volume") { volPopupOpen(n, r); return; }

    var def = extraDef(id);
    menuOpen(def, r.left - 6, r.bottom, { pulldown: true, cls: "extra-menu" });
    menuOpenId = id;
    menuOwner = n;
    n.classList.add("open");
    barTracking = true;
}

function extraDef(id) {
    if (id === "timemachine") {
        return [
            { l: "Time Machine Not Configured", d: 1 },
            { sep: 1 },
            { l: "Browse Other Backup Disks…", act: function () { openPlaceholder("finder", "Time Machine"); } },
            { sep: 1 },
            { l: "Open Time Machine Preferences…", act: function () { launch("system-preferences"); } }
        ];
    }
    if (id === "bluetooth") {
        return [
            { l: "Bluetooth: " + (sys.bluetooth ? "On" : "Off"), d: 1 },
            {
                l: "Turn Bluetooth " + (sys.bluetooth ? "Off" : "On"), act: function () {
                    sys.bluetooth = !sys.bluetooth;
                    extrasRender();
                }
            },
            { sep: 1 },
            { l: "Send File to Device…", d: !sys.bluetooth },
            { l: "Browse Files on Device…", d: !sys.bluetooth },
            { sep: 1 },
            { l: "Open Bluetooth Preferences…", act: function () { launch("system-preferences"); } }
        ];
    }
    if (id === "wifi") {
        var m = [
            { l: sys.wifi ? "Wi-Fi: Looking for Networks…" : "Wi-Fi: Off", d: 1 },
            {
                l: "Turn Wi-Fi " + (sys.wifi ? "Off" : "On"), act: function () {
                    sys.wifi = !sys.wifi;
                    extrasRender();
                }
            }
        ];
        if (sys.wifi) {
            m.push({ sep: 1 });
            WIFI.forEach(function (w) {
                m.push({
                    l: w.n,
                    mark: sys.network === w.n ? "✓" : "",
                    right: '<span class="lock">' + ICON.lock + "</span>" + sigIcon(w.bars),
                    act: function () { sys.network = w.n; }
                });
            });
        }
        m.push({ sep: 1 });
        m.push({ l: "Join Other Network…", d: !sys.wifi });
        m.push({ l: "Create Network…", d: !sys.wifi });
        m.push({ l: "Open Network Preferences…", act: function () { launch("system-preferences"); } });
        return m;
    }
    if (id === "battery") {
        var hrs = Math.floor(sys.battery / 21), mins = Math.round(sys.battery / 21 % 1 * 60);
        return [
            {
                l: sys.charging ? "Battery Is Charging" :
                    hrs + ":" + (mins < 10 ? "0" : "") + mins + " Remaining", d: 1
            },
            { l: "Power Source: " + (sys.charging ? "Power Adapter" : "Battery"), d: 1 },
            { sep: 1 },
            { l: "No Apps Using Significant Energy", d: 1 },
            { sep: 1 },
            {
                l: "Show Percentage", mark: sys.showPct ? "✓" : "", act: function () {
                    sys.showPct = !sys.showPct;
                    batteryRender();
                }
            },
            { l: "Open Energy Saver Preferences…", act: function () { launch("system-preferences"); } }
        ];
    }
    if (id === "clock") {
        var d = new Date();
        return [
            { l: longDate(d) + (sys.analogClock ? " at " + clockText(d).replace(/^\w+ /, "") : ""), d: 1 },
            { sep: 1 },
            {
                l: "View as Analog", mark: sys.analogClock ? "✓" : "", act: function () {
                    sys.analogClock = true; tick();
                }
            },
            {
                l: "View as Digital", mark: sys.analogClock ? "" : "✓", act: function () {
                    sys.analogClock = false; tick();
                }
            },
            { sep: 1 },
            { l: "Open Date & Time Preferences…", act: function () { launch("system-preferences"); } }
        ];
    }
    return [];
}

/* ------------------------------------------------------------------ */
/* VOLUME                                                              */
/* ------------------------------------------------------------------ */
function volPopupOpen(n, r) {
    menuCloseAll(true);
    var p = el("div", "vibrant-light");
    p.id = "volPopup";
    p.innerHTML = '<div id="volTrack"><div id="volFill"></div><div id="volKnob"></div></div>';
    menuLayer.appendChild(p);
    p.style.left = (r.left + r.width / 2 - 12) + "px";
    p.style.top = r.bottom + "px";
    menuStack = [p];
    menuLayer.classList.remove("idle");
    menuOpenId = "volume";
    menuOwner = n;
    n.classList.add("open");

    var track = $("volTrack");
    var paint = function () {
        var h = track.offsetHeight;
        $("volFill").style.height = (sys.volume * h) + "px";
        $("volKnob").style.bottom = (sys.volume * h) + "px";
        n.innerHTML = volumeGlyph();
    };
    var setFrom = function (e) {
        var tr = track.getBoundingClientRect();
        sys.volume = clamp(1 - (e.clientY - tr.top) / tr.height, 0, 1);
        sys.muted = sys.volume === 0;
        paint();
    };
    p.addEventListener("mousedown", function (e) {
        e.stopPropagation();
        setFrom(e);
        var move = function (ev) { setFrom(ev); };
        var up = function () {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
            blip(660, 90, "triangle");
        };
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
    });
    paint();
}
