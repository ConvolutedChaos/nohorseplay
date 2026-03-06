/* ============================================================
   E-Dog OS — Boot Sequence & Login Screen
   Include AFTER setup.js, BEFORE script.js
============================================================ */

/* ---- Password helpers ---- */
function getStoredPassword() {
    return localStorage.getItem('edog_password') || '';
}

function setStoredPassword(pw) {
    localStorage.setItem('edog_password', pw);
}

function hasPassword() {
    return !!localStorage.getItem('edog_password');
}

/* ---- Boot sequence messages ---- */
const BOOT_LINES = [
    { text: 'Starting E-Dog OS...', delay: 0, color: '#fff', bold: true },
    { text: '', delay: 1512, color: '#fff', bold: true }
    /*
    { text: 'E-Dog System BIOS v2.4.1 (c) E-Dog Corp', delay: 0, color: '#fff', bold: true },
    { text: 'CPU: E-Dog x86_64 @ 3.2GHz [4 Cores]', delay: 80, color: '#ccc' },
    { text: 'Memory Test: 16384MB OK', delay: 160, color: '#4ade80' },
    { text: 'Detecting storage devices...', delay: 260, color: '#ccc' },
    { text: '  SATA0: VirtualFS_v2 [IndexedDB] 10.0 GB', delay: 380, color: '#7dd3fc' },
    { text: 'Boot device: VirtualFS_v2', delay: 470, color: '#ccc' },
    { text: '', delay: 540, color: '#ccc' },
    { text: 'Loading E-Dog OS kernel...', delay: 600, color: '#fff' },
    { text: '[    0.000] Booting Linux 6.1.0-edog #1 SMP PREEMPT_DYNAMIC', delay: 720, color: '#4ade80' },
    { text: '[    0.001] Command line: BOOT_IMAGE=/boot/vmlinuz-6.1.0-edog root=/dev/idb0', delay: 800, color: '#4ade80' },
    { text: '[    0.012] ACPI: IRQ0 used by override', delay: 880, color: '#4ade80' },
    { text: '[    0.048] PCI: Using configuration type 1 for base access', delay: 940, color: '#4ade80' },
    { text: '[    0.124] NET: Registered PF_INET6 protocol family', delay: 1010, color: '#4ade80' },
    { text: '[    0.203] VirtualFS: Mounting IndexedDB filesystem...', delay: 1090, color: '#4ade80' },
    { text: '[    0.287] VirtualFS: Mount OK', delay: 1160, color: '#4ade80' },
    { text: '', delay: 1220, color: '#ccc' },
    { text: 'Starting system services...', delay: 1280, color: '#fff' },
    { text: '  [  OK  ] Started systemd-journald.service', delay: 1360, color: '#4ade80' },
    { text: '  [  OK  ] Started systemd-udevd.service', delay: 1430, color: '#4ade80' },
    { text: '  [  OK  ] Reached target Network', delay: 1500, color: '#4ade80' },
    { text: '  [  OK  ] Started edog-display-manager.service', delay: 1580, color: '#4ade80' },
    { text: '  [  OK  ] Reached target Graphical Interface', delay: 1660, color: '#4ade80' },
    { text: '', delay: 1730, color: '#ccc' },
    { text: 'E-Dog OS 3.0 — starting display server...', delay: 1800, color: '#fff', bold: true },
     */
];

/* ---- Build & run boot screen ---- */
function runBootSequence(onComplete) {
    const overlay = document.createElement('div');
    overlay.id = 'bootOverlay';
    overlay.innerHTML = `
        <div class="boot-scanlines"></div>
        <div class="boot-terminal" id="bootTerminal"></div>
        <div class="boot-cursor" id="bootCursor"></div>
    `;
    document.body.appendChild(overlay);

    const terminal = overlay.querySelector('#bootTerminal');
    let lineIdx = 0;

    function addLine(line) {
        const el = document.createElement('div');
        el.className = 'boot-line';
        if (line.bold) el.style.fontWeight = '700';
        el.style.color = line.color || '#ccc';

        if (line.text === '') {
            el.innerHTML = '&nbsp;';
        } else if (line.text.startsWith('[  OK  ]') || line.text.includes('[  OK  ]')) {
            // Color the OK green, rest normal
            el.innerHTML = line.text
                .replace('[  OK  ]', '<span class="boot-ok">[  OK  ]</span>');
        } else {
            el.textContent = line.text;
        }

        terminal.appendChild(el);
        terminal.scrollTop = terminal.scrollHeight;

        // Animate in
        el.style.opacity = '0';
        el.style.transform = 'translateX(-4px)';
        requestAnimationFrame(() => {
            el.style.transition = 'opacity 0.12s, transform 0.12s';
            el.style.opacity = '1';
            el.style.transform = 'translateX(0)';
        });
    }

    function scheduleLines() {
        const base = performance.now();
        BOOT_LINES.forEach(line => {
            setTimeout(() => addLine(line), line.delay);
        });

        const totalDuration = BOOT_LINES[BOOT_LINES.length - 1].delay + 600;
        setTimeout(() => {
            // // Fade out boot overlay
            // overlay.style.transition = 'opacity 0.5s ease';
            // overlay.style.opacity = '0';
            // setTimeout(() => {
            overlay.remove();
            onComplete();
            // }, 500);
        }, totalDuration);
    }

    scheduleLines();
}

/* ---- Build login screen ---- */
function showLoginScreen(onLogin) {
    const username = localStorage.getItem('edog_username') || 'user';
    const computername = localStorage.getItem('edog_computername') || 'user-computer';
    const storedPw = getStoredPassword();

    const overlay = document.createElement('div');
    overlay.id = 'loginOverlay';

    // Replace the previous overlay.innerHTML block inside showLoginScreen(...) with this:
    overlay.innerHTML = `
        <div class="login-bg-noise"></div>
        <div class="login-bg-gradient"></div>

        <div class="mint-wallpaper-overlay"></div>

        <div class="mint-center-wrap">
            <div class="mint-login-card" role="dialog" aria-label="Login">
                <div class="mint-top-icon">
                    <!-- computer icon -->
                    <img src="icons/128/computer.svg" alt="Computer Icon" width="56" height="56">
                </div>

                <div class="mint-hostname">${computername}</div>

                <div class="mint-user-row">
                    <div class="mint-avatar-small">
                        <img src="icons/avatar.svg" alt="Avatar Icon">
                    </div>

                    <div class="mint-username">${username}</div>
                </div>

                <label class="mint-pass-label">Password:</label>
                <div class="mint-pass-wrap">
                    <input class="mint-password-input" id="loginPasswordInput" type="password" placeholder="" autocomplete="current-password">
                    <button class="mint-login-btn" id="loginSubmitBtn" title="Log In">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                        <span class="mint-login-text">Log In</span>
                    </button>
                </div>

                <div class="mint-action-row">
                    <button class="mint-cancel-btn" id="loginCancelBtn">Cancel</button>
                </div>
            </div>
        </div>

        <!-- bottom status bar (language, keyboard, sessions, clock, power) -->
        <div class="mint-bottom-bar">
            <div class="mint-bottom-left">
                <!--
                <div class="mint-bottom-item">English (United States)</div>
                <div class="mint-bottom-item">Keyboard: USA</div>
                <div class="mint-bottom-item">Sessions: GNOME</div>
                -->
            </div>
            <div class="mint-bottom-right">
                <div class="mint-bottom-item" id="mintClockSmall"></div>
                <button class="mint-power-btn-bottom" id="loginPowerBtn" title="Shut Down"></button>
            </div>
        </div>

        <div class="login-session-label">${VERSION}</div>
    `;

    document.body.appendChild(overlay);

    const cancelBtn = overlay.querySelector('#loginCancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const pwInput = document.getElementById('loginPasswordInput');
            if (pwInput) pwInput.value = '';
        });
    }

    // Clock update
    function updateClock() {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const clockEl = document.getElementById('loginClock');
        const dateEl = document.getElementById('loginDate');
        if (clockEl) clockEl.textContent = `${h}:${m}`;
        if (dateEl) dateEl.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
    }
    updateClock();
    const clockTimer = setInterval(updateClock, 1000);

    function doLogin() {
        const inputEl = document.getElementById('loginPasswordInput');
        const errorEl = document.getElementById('loginError');
        const enteredPw = inputEl ? inputEl.value : '';

        if (storedPw && enteredPw !== storedPw) {
            if (errorEl) {
                errorEl.textContent = 'Incorrect password';
                errorEl.classList.add('visible');
            }
            if (inputEl) {
                inputEl.value = '';
                inputEl.classList.add('shake');
                setTimeout(() => inputEl.classList.remove('shake'), 500);
                inputEl.focus();
            }
            return;
        }

        clearInterval(clockTimer);
        overlay.style.transition = 'opacity 0.6s ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            onLogin();
        }, 600);
    }

    const submitBtn = overlay.querySelector('#loginSubmitBtn');
    if (submitBtn) submitBtn.onclick = doLogin;

    const pwInput = overlay.querySelector('#loginPasswordInput');
    if (pwInput) {
        pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
        setTimeout(() => pwInput.focus(), 400);
    }

    overlay.querySelector('#loginPowerBtn')?.addEventListener('click', () => {
        clearInterval(clockTimer);
        shutdown();
    });

    overlay.querySelector('#loginRebootBtn')?.addEventListener('click', () => {
        clearInterval(clockTimer);
        reboot();
    });

    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add('login-visible');
    });
}

// small bottom clock
function updateSmallClock() {
    const el = document.getElementById('mintClockSmall');
    if (!el) return;
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    el.textContent = `${hh}:${mm}`;
}
updateSmallClock();
setInterval(updateSmallClock, 1000);

/* ---- Integrate with OS boot ---- */
window.__bootAndLogin = function (onReady) {
    runBootSequence(() => {
        // Check if setup is pending — let setup handle itself
        window.__setupComplete.then(result => {
            if (result && result.freshInstall) {
                // Setup handled everything, onReady called by setup
                return;
            }
            // Show login screen
            showLoginScreen(onReady);
        });
    });
};

/* ---- Export password helpers for setup.js ---- */
window.__setStoredPassword = setStoredPassword;
window.__getStoredPassword = getStoredPassword;