/* ============================================================
   E-Dog OS — BIOS Setup Utility  (js/bios.js)
   IMPORTANT: Load AFTER boot.js but BEFORE script.js
   in index.html.
============================================================ */
let hdSpace;
const BIOS_KEY = 'edog_bios_settings';

async function findHdSpace() {
    if (!navigator.storage?.estimate) {
        hdSpace = '50';
        return;
    }
    const { quota = 0 } = await navigator.storage.estimate();
    hdSpace = formatTheBytes(quota, false);
}

function formatTheBytes(bytes, useExtension) {
    if (bytes === 0) return '0 bytes';
    const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    if (useExtension) {
        return (bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    } else {
        return (bytes / Math.pow(1024, i));
    }
}

findHdSpace();

(function injectStyles() {
    if (document.getElementById('bios-styles')) return;
    const s = document.createElement('style');
    s.id = 'bios-styles';
    s.textContent = `
        @font-face {
            font-family: 'VGA';
            src: url('biosfont.woff2') format('woff2'),
                 url('biosfont.woff')  format('woff');
            font-weight: normal;
            font-style:  normal;
            font-display: block;
        }

        /* ── POST Screen ─────────────────────────────────── */
        #postScreen {
            position: fixed;
            inset: 0;
            background: #000;
            color: #aaaaaa;
            font-family: 'VGA', 'Courier New', monospace;
            font-size: 16px;
            line-height: 1.45;
            padding: 14px 22px;
            z-index: 6000000;
            box-sizing: border-box;
            overflow: hidden;
            white-space: pre;
        }
        #postScreen .pw  { color: #ffffff; }
        #postScreen .pg  { color: #55ff55; }
        #postScreen .py  { color: #ffff55; }
        #postScreen .pc  { color: #55ffff; }
        #postScreen .pr  { color: #ff5555; }

        .post-bottom {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            color: #ffffff;
            font-family: 'VGA', 'Courier New', monospace;
            font-size: 16px;
            padding: 3px 0;
            text-align: center;
        }
        // .post-enter-msg {
        //     animation: bios-cursor-blink 1s step-end infinite;
        // }
        // @keyframes bios-cursor-blink { 0%,100%{opacity:1;} 50%{opacity:0;} }

        /* ── BIOS Screen ─────────────────────────────────── */
        #biosScreen {
            position: fixed;
            inset: 0;
            background: #aaaaaa;
            font-family: 'VGA', 'Courier New', monospace;
            font-size: 16px;
            line-height: 1.3;
            z-index: 6000001;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            outline: none;
        }

        /* header */
        .bios-header {
            background: #0000aa;
            color: #ffffff;
            text-align: center;
            padding: 4px 0 3px;
            font-size: 17px;
            letter-spacing: 3px;
            flex-shrink: 0;
            border-bottom: 2px solid #000055;
        }

        /* tab bar */
        .bios-tabbar {
            display: flex;
            background: #0000aa;
            padding: 4px 6px 0;
            gap: 1px;
            flex-shrink: 0;
        }
        .bios-tab {
            padding: 3px 18px 4px;
            font-family: 'VGA', 'Courier New', monospace;
            font-size: 15px;
            color: #aaaaaa;
            cursor: pointer;
            user-select: none;
            border: 1px solid transparent;
            border-bottom: none;
            white-space: nowrap;
        }
        .bios-tab:hover:not(.bios-tab-active) { color: #ffffff; }
        .bios-tab.bios-tab-active {
            background: #aaaaaa;
            color: #000000;
            border-color: #888888;
            border-bottom-color: #aaaaaa;
            margin-bottom: -1px;
            padding-bottom: 5px;
        }

        /* body */
        .bios-body {
            flex: 1;
            display: flex;
            overflow: hidden;
            border-top: 1px solid #888888;
        }

        /* left panel */
        .bios-left {
            flex: 1;
            padding: 6px 10px;
            overflow-y: auto;
            overflow-x: hidden;
        }
        .bios-left::-webkit-scrollbar { width: 14px; }
        .bios-left::-webkit-scrollbar-track { background: #888888; }
        .bios-left::-webkit-scrollbar-thumb {
            background: #0000aa;
            border: 2px solid #888888;
        }
        .bios-left::-webkit-scrollbar-button {
            background: #0000aa;
            height: 14px;
            color: #ffffff;
        }

        /* right panel */
        .bios-right {
            width: 300px;
            min-width: 300px;
            flex-shrink: 0;
            background: #0000aa;
            color: #aaaaaa;
            padding: 8px 12px 6px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            border-left: 2px solid #000055;
            overflow: hidden;
        }

        .bios-help-box {
            border: 1px solid #aaaaaa;
            padding: 6px 8px;
            min-height: 80px;
        }
        .bios-help-title {
            color: #ffffff;
            text-align: center;
            border-bottom: 1px solid #aaaaaa;
            padding-bottom: 3px;
            margin-bottom: 5px;
            font-size: 14px;
        }
        .bios-help-body {
            color: #aaaaaa;
            font-size: 13px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-break: break-word;
        }

        .bios-nav-box {
            border: 1px solid #aaaaaa;
            padding: 6px 8px;
            margin-top: auto;
        }
        .bios-nav-title {
            color: #ffffff;
            text-align: center;
            border-bottom: 1px solid #aaaaaa;
            padding-bottom: 3px;
            margin-bottom: 5px;
            font-size: 14px;
        }
        .bios-nav-row {
            display: flex;
            gap: 0;
            font-size: 13px;
            line-height: 1.65;
            color: #aaaaaa;
        }
        .bios-nav-key {
            color: #ffffff;
            min-width: 52px;
        }

        /* items */
        .bios-section-hdr {
            background: #555555;
            color: #ffffff;
            padding: 1px 6px;
            margin: 5px 0 2px;
            font-size: 14px;
        }
        .bios-sep { height: 7px; }
        .bios-item {
            display: flex;
            align-items: baseline;
            padding: 1px 6px;
            cursor: default;
            min-height: 21px;
            white-space: nowrap;
        }
        .bios-item-info   { color: #555555; }
        .bios-item-select { color: #00aaaa; cursor: pointer; }
        .bios-item-action { color: #00aaaa; cursor: pointer; }
        .bios-item-focused {
            background: #0000aa !important;
            color: #ffffff    !important;
        }
        .bios-item-focused .bios-val { color: #ffffff !important; }

        .bios-lbl {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .bios-val {
            min-width: 190px;
            color: #00aaaa;
            padding-left: 6px;
            text-align: left;
        }
        .bios-item-info   .bios-val { color: #555555; }

        /* footer */
        .bios-footer {
            background: #0000aa;
            color: #aaaaaa;
            font-size: 13px;
            padding: 3px 10px;
            display: flex;
            gap: 0 18px;
            flex-wrap: nowrap;
            flex-shrink: 0;
            border-top: 2px solid #000055;
            overflow: hidden;
        }
        .bios-fkey { color: #ffffff; }

        /* popup */
        .bios-popup-bg {
            position: fixed;
            inset: 0;
            z-index: 6000010;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .bios-popup {
            background: #aaaaaa;
            border: 2px solid #000000;
            min-width: 230px;
            box-shadow: 6px 6px 0 #333;
            font-family: 'VGA', 'Courier New', monospace;
            font-size: 16px;
            overflow: hidden;
        }
        .bios-popup-hdr {
            background: #0000aa;
            color: #ffffff;
            text-align: center;
            padding: 3px 10px;
            font-size: 15px;
        }
        .bios-popup-opt {
            padding: 2px 20px;
            color: #000000;
            cursor: pointer;
            white-space: nowrap;
        }
        .bios-popup-opt:hover { background: #888888; }
        .bios-popup-opt.bios-popup-focused {
            background: #0000aa;
            color: #ffffff;
        }
        .bios-popup-ftr {
            background: #555555;
            color: #ffffff;
            text-align: center;
            padding: 2px 10px;
            font-size: 13px;
        }
    `;
    document.head.appendChild(s);
})();



const DEFAULTS = {
    virtualization: 'Enabled',
    hyperthreading: 'Enabled',
    executeDisable: 'Enabled',
    c1eSupport: 'Enabled',
    hwPrefetcher: 'Enabled',
    adjCachePrefetch: 'Enabled',
    maxCpuid: 'Disabled',
    cpuTmFunction: 'Enabled',
    sataController: 'Enabled',
    sataMode: 'AHCI',
    usbController: 'Enabled',
    usb20Controller: 'Enabled',
    legacyUsb: 'Enabled',
    boot1st: 'VirtualFS_v2',
    boot2nd: 'Disabled',
    boot3rd: 'Disabled',
    quickBoot: 'Enabled',
    fullScreenLogo: 'Disabled',
    waitF1Error: 'Enabled',
    delMessage: 'Enabled',
    pwdCheck: 'Setup',
};

function loadBiosSettings() {
    try {
        const raw = localStorage.getItem(BIOS_KEY);
        return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch { return { ...DEFAULTS }; }
}

function saveBiosSettings(s) {
    try { localStorage.setItem(BIOS_KEY, JSON.stringify(s)); } catch { }
}

function showPost(onDone) {
    let triggered = false;

    const screen = document.createElement('div');
    screen.id = 'postScreen';
    document.body.appendChild(screen);

    /* POST content lines */
    const POST_LINES = [
        // { t: 'E-Dog System BIOS v2.4.1  (C)Copyright 1985-2009, E-Dog Corp.', cls: 'pw', d: 0 },
        // { t: '', cls: '', d: 80 },
        // { t: 'BIOS Date: 01/15/09  09:44:23  Ver: 08.00.15', cls: '', d: 100 },
        // { t: '', cls: '', d: 180 },
        // { t: 'CPU: E-Dog VirtualCPU x86_64 @ 3.20GHz', cls: '', d: 200 },
        // { t: 'CPU Microcode Update: Revision 0x1a', cls: '', d: 280 },
        // { t: '', cls: '', d: 340 },
        // { t: 'Testing Memory...', cls: '', d: 360 },
        // { t: '', cls: '', d: 700 },
        // { t: 'Auto-Detecting Pri Master  ... VirtualFS_v2  10.0 GB', cls: 'pg', d: 720 },
        // { t: 'Auto-Detecting Pri Slave   ... None', cls: '', d: 800 },
        // { t: 'Auto-Detecting Sec Master  ... None', cls: '', d: 860 },
        // { t: 'Auto-Detecting Sec Slave   ... None', cls: '', d: 920 },
        // { t: '', cls: '', d: 980 },
        // { t: 'USB Controller       : Enabled', cls: '', d: 1000 },
        // { t: 'USB 2.0 Controller   : Enabled', cls: '', d: 1040 },
        // { t: 'Legacy USB Support   : Enabled', cls: '', d: 1080 },
        // { t: '', cls: '', d: 1120 },
        // { t: 'PCI device listing ...', cls: '', d: 1140 },
        // { t: '  Bus 00, Dev 00, Func 00: Host Bridge              8086/2A40', cls: 'pc', d: 1200 },
        // { t: '  Bus 00, Dev 1F, Func 02: SATA Controller (AHCI)   8086/2929', cls: 'pc', d: 1240 },
        // { t: '  Bus 00, Dev 1D, Func 07: USB2 EHCI Controller     8086/293C', cls: 'pc', d: 1280 },
    ];

    const lineEls = {};

    POST_LINES.forEach(({ t, cls, d }) => {
        setTimeout(() => {
            const el = document.createElement('div');
            el.textContent = t;
            if (cls) el.className = cls;
            screen.appendChild(el);
        }, d);
    });

    /* Memory test counter */
    let memVal = 0;
    const MEM_TARGET = 8192;
    const memEl = document.createElement('div');
    screen.appendChild(memEl);

    // Insert mem line timing
    setTimeout(() => {
        screen.appendChild(memEl);
    }, 360);

    const memTick = setInterval(() => {
        memVal = Math.min(memVal + 512, MEM_TARGET);
        if (memVal < MEM_TARGET) {
            //memEl.innerHTML = `Testing Memory... <span class="py">${memVal}MB</span>`;
        } else {
            //memEl.innerHTML = `Testing Memory... <span class="py">${MEM_TARGET}MB</span>  <span class="pg">OK</span>`;
            clearInterval(memTick);
        }
    }, 30);

    /* Bottom bar */
    const bot = document.createElement('div');
    bot.className = 'post-bottom';
    bot.innerHTML = `<span class="post-enter-msg">Press  DEL  or  BACKSPACE  to enter SETUP</span>`;
    screen.appendChild(bot);

    /* Key listener */
    function onKey(e) {
        if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'F2') {
            e.preventDefault();
            go(true);
        }
    }
    document.addEventListener('keydown', onKey);

    /* Auto-proceed after 2 s */
    const autoTimer = setTimeout(() => go(false), 2000);

    function go(enterBios) {
        if (triggered) return;
        triggered = true;
        clearInterval(memTick);
        clearTimeout(autoTimer);
        document.removeEventListener('keydown', onKey);
        screen.remove();
        if (enterBios) showBios(onDone);
        else onDone();
    }
}

function showBios(onDone) {
    const settings = loadBiosSettings();
    const snapSettings = JSON.stringify(settings);  // for discard

    const EN_DIS = ['Enabled', 'Disabled'];
    const DIS_EN = ['Disabled', 'Enabled'];

    let activeTab = 0;
    let selIdx = 0;   // index within current tab's selectables[]
    let popupOpen = false;
    let keyHandler = null;

    /* ── build chrome ─────────────────────────────────────── */
    const screen = document.createElement('div');
    screen.id = 'biosScreen';
    screen.tabIndex = -1;
    document.body.appendChild(screen);

    /* header */
    const hdr = el('div', 'bios-header', 'BIOS  SETUP  UTILITY');
    screen.appendChild(hdr);

    /* tab bar */
    const TABS = ['Main', 'Advanced', 'Boot', 'Security', 'Exit'];
    const tabBar = el('div', 'bios-tabbar');
    const tabEls = TABS.map((name, i) => {
        const t = el('div', 'bios-tab' + (i === 0 ? ' bios-tab-active' : ''), name);
        t.onclick = () => gotoTab(i);
        tabBar.appendChild(t);
        return t;
    });
    screen.appendChild(tabBar);

    /* body */
    const body = el('div', 'bios-body');
    screen.appendChild(body);

    const leftPanel = el('div', 'bios-left');
    const rightPanel = el('div', 'bios-right');
    body.appendChild(leftPanel);
    body.appendChild(rightPanel);

    /* right: help box */
    const helpBox = el('div', 'bios-help-box');
    const helpTitle = el('div', 'bios-help-title', 'Item Specific Help');
    const helpBody = el('div', 'bios-help-body', '');
    helpBox.appendChild(helpTitle);
    helpBox.appendChild(helpBody);
    rightPanel.appendChild(helpBox);

    /* right: nav hints */
    const navBox = el('div', 'bios-nav-box');
    const navTitle = el('div', 'bios-nav-title', 'Keys');
    navBox.appendChild(navTitle);
    [
        ['→ ←', 'Select Screen'],
        ['↑ ↓', 'Select Item'],
        ['Enter', 'Change Option'],
        ['F9', 'Setup Defaults'],
        ['F10', 'Save and Exit'],
        ['ESC', 'Exit'],
    ].forEach(([k, v]) => {
        const row = el('div', 'bios-nav-row');
        row.innerHTML = `<span class="bios-nav-key">${k}</span><span>${v}</span>`;
        navBox.appendChild(row);
    });
    rightPanel.appendChild(navBox);

    /* footer */
    const footer = el('div', 'bios-footer');
    footer.innerHTML = [
        ['→←', 'Screen'], ['↑↓', 'Item'], ['Enter', 'Change'],
        ['F9', 'Defaults'], ['F10', 'Save+Exit'], ['ESC', 'Exit'],
    ].map(([k, v]) => `<span><span class="bios-fkey">${k}</span> ${v}</span>`).join('');
    screen.appendChild(footer);

    /* ── tab data definitions ─────────────────────────────── */
    function tabData(i) {
        switch (i) {
            case 0: return mainTab();
            case 1: return advancedTab();
            case 2: return bootTab();
            case 3: return securityTab();
            case 4: return exitTab();
        }
    }

    function mainTab() {
        const d = new Date();
        const pad2 = n => String(n).padStart(2, '0');
        const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return [
            S('System Overview'),
            I('BIOS Version', '1.0.0'),
            I('Build Date', '03/16/2026'),
            I('EC Firmware Rev', '0x0E'),
            _(),
            S('Processor'),
            I('Manufacturer', 'Intel'),
            I('Brand String', 'Intel Xeon E5620'),
            I('Frequency', '2.60GHz'),
            I('BCLK Speed', '133MHz'),
            I('Cache L1', '256 KB'),
            I('Cache L2', '1024 KB'),
            I('Cache L3', '8192 KB'),
            I('CPUID', 'E5620'),
            _(),
            S('System Memory'),
            I('Total Installed', '32768 MB'),
            I('Slot A', '8192 MB DDR3-1333'),
            I('Slot B', '8192 MB DDR3-1333'),
            I('Slot C', '8192 MB DDR3-1333'),
            I('Slot D', '8192 MB DDR3-1333'),
            _(),
            S('System Settings'),
            T('System Time', 'systemTime',
                `[${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}]`,
                'Set the System Time.'),
            T('System Date', 'systemDate',
                `[${DAYS[d.getDay()]} ${MONS[d.getMonth()]}/${pad2(d.getDate())}/${d.getFullYear()}]`,
                'Set the System Date.'),
            O('Language', 'language', settings.language ?? 'English',
                'Select display language.', ['English', 'Francais', 'Deutsch', 'Espanol']),
        ];
    }

    function advancedTab() {
        return [
            S('CPU Configuration'),
            I('CPU Ratio Status', 'Unlocked (Min:09, Max:22)'),
            I('CPU Ratio Actual', '22'),
            O('Intel(R) Virtualization Tech', 'virtualization', settings.virtualization,
                'When enabled, a VMM can utilize additional hardware capabilities provided by Vanderpool Technology.', EN_DIS),
            O('Hyper-Threading Technology', 'hyperthreading', settings.hyperthreading,
                'Enables Hyper-Threading on supported Intel processors. Each physical core appears as two logical cores.', EN_DIS),
            O('Execute-Disable Bit Capability', 'executeDisable', settings.executeDisable,
                'When disabled, forces the XD feature flag to always return 0.', EN_DIS),
            O('C1E Support', 'c1eSupport', settings.c1eSupport,
                'Enable Enhanced Halt State. CPU runs at lowest power when idle.', EN_DIS),
            O('Hardware Prefetcher', 'hwPrefetcher', settings.hwPrefetcher,
                'Enable the hardware prefetcher to fetch data into the L2 cache.', EN_DIS),
            O('Adjacent Cache Line Prefetch', 'adjCachePrefetch', settings.adjCachePrefetch,
                'Fetches adjacent cache line data, reducing memory access latency.', EN_DIS),
            O('Max CPUID Value Limit', 'maxCpuid', settings.maxCpuid,
                'Limit CPUID maximum value. Enable for legacy OS compatibility.', DIS_EN),
            O('CPU TM Function', 'cpuTmFunction', settings.cpuTmFunction,
                'Enable CPU Thermal Monitor function (TM1/TM2) to throttle overheating CPUs.', EN_DIS),
            _(),
            S('SATA Configuration'),
            O('SATA Controller', 'sataController', settings.sataController,
                'Enable or disable the on-board SATA controller.', EN_DIS),
            O('SATA Mode Selection', 'sataMode', settings.sataMode,
                'IDE: legacy compatibility mode.\nAHCI: native SATA with NCQ and hot-plug.\nRAID: SATA RAID arrays.', ['AHCI', 'IDE', 'RAID']),
            _(),
            S('USB Configuration'),
            O('USB Controller', 'usbController', settings.usbController,
                'Enable or disable the USB 1.1/2.0 controller.', EN_DIS),
            O('USB 2.0 (EHCI) Controller', 'usb20Controller', settings.usb20Controller,
                'Enable or disable the USB 2.0 Enhanced Host Controller.', EN_DIS),
            O('Legacy USB Support', 'legacyUsb', settings.legacyUsb,
                'Enables USB keyboard/mouse in DOS and pre-OS environments.', ['Enabled', 'Disabled', 'Auto']),
        ];
    }

    function bootTab() {
        const BOOT_DEVICES = [`${hdSpace}GB HARDDISK`, 'Disabled'];
        return [
            S('Boot Device Priority'),
            O('1st Boot Device', 'boot1st', settings.boot1st,
                'Select the device to boot from first.', BOOT_DEVICES),
            O('2nd Boot Device', 'boot2nd', settings.boot2nd,
                'Select the device to boot from second.', BOOT_DEVICES),
            O('3rd Boot Device', 'boot3rd', settings.boot3rd,
                'Select the device to boot from third.', BOOT_DEVICES),
            _(),
            S('Boot Settings Configuration'),
            O('Quick Boot', 'quickBoot', settings.quickBoot,
                'Skips certain POST tests to speed up boot time.', EN_DIS),
            O('Full Screen Logo', 'fullScreenLogo', settings.fullScreenLogo,
                'Show or hide the full-screen boot logo during POST.', ['Disabled', 'Enabled']),
            O('Wait For F1 If Error', 'waitF1Error', settings.waitF1Error,
                'System waits for F1 key when a POST error is detected.', EN_DIS),
            O('Hit DEL Message Display', 'delMessage', settings.delMessage,
                'Show or hide the "Press DEL to enter SETUP" message.', EN_DIS),
        ];
    }

    function securityTab() {
        const hasSup = !!localStorage.getItem('edog_supervisor_pw');
        const hasUsr = !!localStorage.getItem('edog_user_pw');
        return [
            S('Password Status'),
            I('Supervisor Password', hasSup ? 'Installed' : 'Not Installed'),
            I('User Password', hasUsr ? 'Installed' : 'Not Installed'),
            _(),
            S('Change Passwords'),
            A('Change Supervisor Password', 'changeSuperPw',
                'Set, change, or clear the Supervisor password.\nSupervisor has full BIOS access.'),
            A('Change User Password', 'changeUserPw',
                'Set, change, or clear the User password.\nUser has limited BIOS access.'),
            _(),
            S('Password Options'),
            O('Password Check', 'pwdCheck', settings.pwdCheck,
                'Setup: prompts password only when entering BIOS.\nAlways: prompts password at every boot.', ['Setup', 'Always']),
        ];
    }

    function exitTab() {
        return [
            S('Exit Options'),
            A('Exit & Save Changes', 'exitSave',
                'Exit BIOS Setup and save all changes to CMOS.'),
            A('Exit & Discard Changes', 'exitDiscard',
                'Exit BIOS Setup without saving. All changes will be lost.'),
            _(),
            A('Discard Changes', 'discardOnly',
                'Restore all settings to the values they had when you entered BIOS Setup.'),
            A('Load Setup Defaults', 'loadDefaults',
                'Load the factory default values for all BIOS settings.'),
        ];
    }

    /* ── item builder helpers ─────────────────────────────── */
    function S(label) { return { type: 'section', label }; }
    function I(label, value) { return { type: 'info', label, value }; }
    function _() { return { type: 'sep' }; }
    function T(label, key, value, help) { return { type: 'text', label, key, value, help }; }
    function O(label, key, value, help, options) {
        return { type: 'opt', label, key, value, help, options };
    }
    function A(label, key, help) { return { type: 'action', label, key, help }; }

    /* ── render ───────────────────────────────────────────── */
    let items = [];   // flat list of rendered items
    let selectables = [];  // indices into items[] that are focusable

    function renderTab(tabIdx) {
        leftPanel.innerHTML = '';
        items = tabData(tabIdx);
        selectables = [];

        items.forEach((item, idx) => {
            let domEl;
            if (item.type === 'section') {
                domEl = el('div', 'bios-section-hdr', item.label);
            } else if (item.type === 'sep') {
                domEl = el('div', 'bios-sep');
            } else if (item.type === 'info') {
                domEl = el('div', 'bios-item bios-item-info');
                domEl.innerHTML = `<span class="bios-lbl">${item.label}</span>`
                    + `<span class="bios-val">${item.value}</span>`;
            } else if (item.type === 'opt' || item.type === 'text') {
                selectables.push(idx);
                domEl = el('div', 'bios-item bios-item-select');
                domEl.dataset.idx = String(idx);
                const valStr = item.type === 'opt' ? `[${settings[item.key] ?? item.value}]` : item.value;
                domEl.innerHTML = `<span class="bios-lbl">${item.label}</span>`
                    + `<span class="bios-val">${valStr}</span>`;
                domEl.onclick = () => clickItem(idx);
            } else if (item.type === 'action') {
                selectables.push(idx);
                domEl = el('div', 'bios-item bios-item-action');
                domEl.dataset.idx = String(idx);
                domEl.innerHTML = `<span class="bios-lbl">${item.label}</span>`;
                domEl.onclick = () => clickItem(idx);
            }
            if (domEl) leftPanel.appendChild(domEl);
        });

        /* clamp selection */
        if (selIdx >= selectables.length) selIdx = 0;
        updateFocus();
    }

    function updateFocus() {
        leftPanel.querySelectorAll('.bios-item').forEach(e => e.classList.remove('bios-item-focused'));
        if (!selectables.length) { helpBody.textContent = ''; return; }
        const idx = selectables[selIdx];
        const item = items[idx];
        const domEl = leftPanel.querySelector(`[data-idx="${idx}"]`);
        if (domEl) { domEl.classList.add('bios-item-focused'); domEl.scrollIntoView({ block: 'nearest' }); }
        helpBody.textContent = item?.help ?? '';
    }

    function clickItem(itemIdx) {
        const si = selectables.indexOf(itemIdx);
        if (si < 0) return;
        selIdx = si;
        updateFocus();
        activateItem();
    }

    function activateItem() {
        if (popupOpen) return;
        const idx = selectables[selIdx];
        const item = items[idx];
        if (!item) return;

        if (item.type === 'action') {
            doAction(item.key);
        } else if (item.type === 'opt' && item.options) {
            openPopup(item, idx);
        } else if (item.type === 'text') {
            /* time/date — just show a brief note; real editing is complex */
            helpBody.textContent = (item.help ?? '') + '\n\n[Editing not supported in this version]';
        }
    }

    function doAction(key) {
        switch (key) {
            case 'exitSave':
                saveBiosSettings(settings);
                exitBios();
                break;
            case 'exitDiscard':
                exitBios();
                break;
            case 'discardOnly':
                Object.assign(settings, JSON.parse(snapSettings));
                renderTab(activeTab);
                break;
            case 'loadDefaults':
                Object.assign(settings, { ...DEFAULTS });
                renderTab(activeTab);
                helpBody.textContent = 'Setup defaults loaded.';
                break;
            case 'changeSuperPw':
            case 'changeUserPw': {
                const isSup = key === 'changeSuperPw';
                const lsKey = isSup ? 'edog_supervisor_pw' : 'edog_user_pw';
                const pw = prompt(`New ${isSup ? 'Supervisor' : 'User'} Password (blank to remove):`);
                if (pw === null) return;
                if (pw === '') localStorage.removeItem(lsKey);
                else localStorage.setItem(lsKey, pw);
                renderTab(activeTab);
                break;
            }
        }
    }

    /* ── popup ────────────────────────────────────────────── */
    function openPopup(item, itemIdx) {
        popupOpen = true;

        const curVal = settings[item.key] ?? item.value;
        let popSel = item.options.indexOf(curVal);
        if (popSel < 0) popSel = 0;

        const bg = el('div', 'bios-popup-bg');
        const box = el('div', 'bios-popup');
        box.appendChild(el('div', 'bios-popup-hdr', item.label));

        const optEls = item.options.map((opt, i) => {
            const o = el('div', 'bios-popup-opt' + (i === popSel ? ' bios-popup-focused' : ''), opt);
            o.onclick = () => { popSel = i; commit(); };
            box.appendChild(o);
            return o;
        });

        box.appendChild(el('div', 'bios-popup-ftr', '↑↓ Select    Enter Confirm    ESC Cancel'));
        bg.appendChild(box);
        screen.appendChild(bg);

        function refreshPop() {
            optEls.forEach((o, i) => o.classList.toggle('bios-popup-focused', i === popSel));
        }
        function commit() {
            settings[item.key] = item.options[popSel];
            bg.remove();
            popupOpen = false;
            document.removeEventListener('keydown', popKey, true);
            renderTab(activeTab);
        }
        function popKey(e) {
            e.preventDefault(); e.stopPropagation();
            if (e.key === 'ArrowDown') { popSel = (popSel + 1) % item.options.length; refreshPop(); }
            else if (e.key === 'ArrowUp') { popSel = (popSel - 1 + item.options.length) % item.options.length; refreshPop(); }
            else if (e.key === 'Enter') commit();
            else if (e.key === 'Escape') {
                bg.remove(); popupOpen = false;
                document.removeEventListener('keydown', popKey, true);
            }
        }
        document.addEventListener('keydown', popKey, true);
    }

    /* ── tab switch ───────────────────────────────────────── */
    function gotoTab(i) {
        activeTab = i;
        selIdx = 0;
        tabEls.forEach((t, j) => t.classList.toggle('bios-tab-active', j === i));
        renderTab(i);
    }

    /* ── exit ─────────────────────────────────────────────── */
    function exitBios() {
        document.removeEventListener('keydown', keyHandler);
        screen.style.transition = 'opacity .2s';
        screen.style.opacity = '0';
        setTimeout(() => { screen.remove(); onDone(); }, 200);
    }

    /* ── keyboard ─────────────────────────────────────────── */
    keyHandler = function (e) {
        if (popupOpen) return;
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                gotoTab((activeTab - 1 + TABS.length) % TABS.length);
                break;
            case 'ArrowRight':
                e.preventDefault();
                gotoTab((activeTab + 1) % TABS.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (selectables.length) {
                    selIdx = (selIdx - 1 + selectables.length) % selectables.length;
                    updateFocus();
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (selectables.length) {
                    selIdx = (selIdx + 1) % selectables.length;
                    updateFocus();
                }
                break;
            case 'Enter':
                e.preventDefault();
                activateItem();
                break;
            case 'F10':
                e.preventDefault();
                saveBiosSettings(settings);
                exitBios();
                break;
            case 'F9':
                e.preventDefault();
                Object.assign(settings, { ...DEFAULTS });
                renderTab(activeTab);
                helpBody.textContent = 'Setup defaults loaded.';
                break;
            case 'Escape':
                e.preventDefault();
                gotoTab(4);   // jump to Exit tab
                break;
        }
    };
    document.addEventListener('keydown', keyHandler);

    /* ── kick off ─────────────────────────────────────────── */
    gotoTab(0);
    screen.focus();
}

function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
}

/* ============================================================
   INTEGRATION — wrap window.__bootAndLogin
   This file must be loaded AFTER boot.js and BEFORE script.js.
============================================================ */
const _origBoot = window.__bootAndLogin;
window.__bootAndLogin = function (onReady) {
    showPost(function () {
        if (typeof _origBoot === 'function') _origBoot(onReady);
        else onReady();
    });
};