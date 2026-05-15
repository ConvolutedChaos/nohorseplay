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

/* ---- Build & run terminal boot (fallback) ---- */
function runBootSequenceTerminal(onComplete) {
    const overlay = document.createElement('div');
    overlay.id = 'bootOverlay';
    overlay.innerHTML = `
        <div class="boot-scanlines"></div>
        <div class="boot-terminal" id="bootTerminal"></div>
        <div class="boot-cursor" id="bootCursor"></div>
    `;
    document.body.appendChild(overlay);

    const terminal = overlay.querySelector('#bootTerminal');

    function addLine(line) {
        const el = document.createElement('div');
        el.className = 'boot-line';
        if (line.bold) el.style.fontWeight = '700';
        el.style.color = line.color || '#ccc';

        if (line.text === '') {
            el.innerHTML = '&nbsp;';
        } else if (line.text.startsWith('[  OK  ]') || line.text.includes('[  OK  ]')) {
            el.innerHTML = line.text
                .replace('[  OK  ]', '<span class="boot-ok">[  OK  ]</span>');
        } else {
            el.textContent = line.text;
        }

        terminal.appendChild(el);
        terminal.scrollTop = terminal.scrollHeight;

        el.style.opacity = '0';
        el.style.transform = 'translateX(-4px)';
        requestAnimationFrame(() => {
            el.style.transition = 'opacity 0.12s, transform 0.12s';
            el.style.opacity = '1';
            el.style.transform = 'translateX(0)';
        });
    }

    function scheduleLines() {
        BOOT_LINES.forEach(line => {
            setTimeout(() => addLine(line), line.delay);
        });

        const totalDuration = BOOT_LINES[BOOT_LINES.length - 1].delay + 600;
        setTimeout(() => {
            overlay.remove();
            onComplete();
        }, totalDuration);
    }

    scheduleLines();
}

/* ---- Build & run graphical boot (from /boot/grub/config.json) ---- */
async function runBootSequenceGraphical(config, onComplete) {
    const bootTime = ((config.bootTime ?? 3)) * 1000;

    const overlay = document.createElement('div');
    overlay.id = 'bootOverlay';
    overlay.classList.add('boot-graphical');
    document.body.appendChild(overlay);

    const scanlines = document.createElement('div');
    scanlines.className = 'boot-scanlines';
    overlay.appendChild(scanlines);

    // Inject user CSS into <head> so it takes effect globally; remove on teardown
    let injectedStyle = null;
    if (config.css) {
        injectedStyle = document.createElement('style');
        injectedStyle.id = 'grubBootCSS';
        injectedStyle.textContent = config.css;
        document.head.appendChild(injectedStyle);
    }

    // Logo
    if (config.icon) {
        try {
            const img = await imgFromFS(`/boot/grub/${config.icon}`);
            img.className = 'boot-logo';
            overlay.appendChild(img);
        } catch (_) { /* icon missing — skip */ }
    }

    // Progress indicator
    if (config.progressType === 'spinner') {
        if (config.spinnerImage) {
            try {
                const img = await imgFromFS(`/boot/grub/${config.spinnerImage}`);
                img.className = 'boot-spinner';
                overlay.appendChild(img);
            } catch (_) { /* spinner missing — skip */ }
        }
    } else {
        // default: "bar"
        const track = document.createElement('div');
        track.className = 'boot-progress-track';
        const fill = document.createElement('div');
        fill.className = 'boot-progress-bar';
        fill.style.width = '0%';
        track.appendChild(fill);
        overlay.appendChild(track);

        // Trigger the fill animation on the next two frames so the 0% state is painted first
        requestAnimationFrame(() => requestAnimationFrame(() => {
            fill.style.transition = `width ${bootTime}ms linear`;
            fill.style.width = '100%';
        }));
    }

    setTimeout(() => {
        overlay.remove();
        if (injectedStyle) injectedStyle.remove();
        onComplete();
    }, bootTime);
}

/* ---- Detect whether an existing install is missing /boot/ ---- */
function checkNeedsRecovery() {
    return new Promise((resolve) => {
        const req = indexedDB.open('VirtualFS_v2', 1);

        req.onupgradeneeded = (e) => {
            // DB was just created — fresh install, not a corrupted one
            e.target.transaction.abort();
            resolve(false);
        };

        req.onsuccess = () => {
            const db = req.result;
            try {
                const tx = db.transaction('nodes', 'readonly');
                const store = tx.objectStore('nodes');
                const countReq = store.count();
                countReq.onsuccess = () => {
                    if (countReq.result <= 5) {
                        // Essentially empty — first run, let setup.js handle it
                        db.close();
                        resolve(false);
                        return;
                    }
                    // Populated DB: check for /boot/ directory under root
                    const childReq = store.index('parentId').getAll('root');
                    childReq.onsuccess = () => {
                        db.close();
                        const hasBootDir = childReq.result.some(
                            n => n.name === 'boot' && n.type === 'folder'
                        );
                        resolve(!hasBootDir);
                    };
                    childReq.onerror = () => { db.close(); resolve(false); };
                };
                countReq.onerror = () => { db.close(); resolve(false); };
            } catch { db.close(); resolve(false); }
        };

        req.onerror = () => resolve(false);
    });
}

/* ---- Recovery screen ---- */
function showRecoveryScreen(missingItems) {
    const overlay = document.createElement('div');
    overlay.id = 'recoveryOverlay';
    document.body.appendChild(overlay);

    // ---- Detection / options view ----
    function renderDetect() {
        overlay.innerHTML = `
            <div class="recovery-header">
                <span>Recovery Utility</span>
                <span>Build Date: 05/13/2026</span>
            </div>
            <div class="recovery-body">
                <div style="margin-bottom:18px;">
                    <div class="recovery-section-title">Recovery</div>
                    <div class="recovery-divider">&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;</div>
                    <div style="color:#ffff55;margin-bottom:10px;line-height:1.7;">
                        WARNING: One or more files are missing or<br>
                        corrupted. Your system cannot boot normally.
                    </div>
                    <div style="margin-bottom:14px;">
                        <div style="color:#aaaaaa;margin-bottom:6px;">Detected missing components:</div>
                        ${missingItems.map(m =>
            `<div style="color:#ff8888;">[FAIL] ${m}</div>`
        ).join('')}
                    </div>
                    <div class="recovery-divider">&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;</div>
                </div>
                <div>
                    <div class="recovery-section-title">RECOVERY OPTIONS</div>
                    <div style="color:#aaaaaa;margin-bottom:10px;line-height:1.7;">
                        Press Enter or click the option below to restore your system.
                    </div>
                    <button id="recov-restore-btn" class="recovery-action-btn" tabindex="0">
                        &gt; REPAIR SYSTEM
                    </button>
                </div>
            </div>
            <div class="recovery-footer">
                Enter : Attempt System Repair
            </div>
        `;

        const btn = overlay.querySelector('#recov-restore-btn');
        btn.focus();
        btn.onclick = runRecovery;

        function onKey(e) {
            if (e.key === 'Enter') {
                document.removeEventListener('keydown', onKey);
                runRecovery();
            }
        }
        document.addEventListener('keydown', onKey);
    }

    // ---- Progress view ----
    function renderProgress() {
        overlay.innerHTML = `
            <div class="recovery-header">
                <span>Recovery Utility</span>
                <span>Build Date: 05/13/2026</span>
            </div>
            <div class="recovery-body">
                <div style="margin-bottom:16px;">
                    <div style="color:#ffff55;margin-bottom:16px;line-height:1.7;">
                        Do not turn off your computer.
                    </div>
                    <div id="recov-status" style="color:#ffffff;margin-bottom:8px;font-size:13px;">Preparing&hellip;</div>
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">
                        <div class="recovery-progress-outer">
                            <div id="recov-bar" class="recovery-progress-inner"></div>
                        </div>
                        <span id="recov-pct" style="color:#ffff55;font-size:13px;min-width:40px;">0%</span>
                    </div>
                </div>
                <div id="recov-log" class="recovery-log" style="display:none;"></div>
            </div>
            <div class="recovery-footer">
                Recovery in progress &mdash; please wait
            </div>
        `;
    }

    // ---- Complete view ----
    function renderComplete() {
        overlay.innerHTML = `
            <div class="recovery-header">
                <span>Recovery Utility</span>
                <span>Build Date: 05/13/2026</span>
            </div>
            <div class="recovery-body">
                <div style="margin-top:32px;">
                    <div class="recovery-section-title">RECOVERY SUCCESSFUL</div>
                    <button id="recov-reboot-btn" class="recovery-action-btn" tabindex="0">
                        &gt; REBOOT
                    </button>
                </div>
            </div>
            <div class="recovery-footer">
                Enter : Reboot
            </div>
        `;

        const btn = overlay.querySelector('#recov-reboot-btn');
        btn.focus();
        btn.onclick = doReboot;

        function onKey(e) {
            if (e.key === 'Enter') {
                document.removeEventListener('keydown', onKey);
                doReboot();
            }
        }
        document.addEventListener('keydown', onKey);
    }

    // ---- Recovery runner ----
    async function runRecovery() {
        renderProgress();

        const log = overlay.querySelector('#recov-log');
        const bar = overlay.querySelector('#recov-bar');
        const pctEl = overlay.querySelector('#recov-pct');
        const status = overlay.querySelector('#recov-status');

        function addLog(text, color) {
            if (!log) return;
            const line = document.createElement('div');
            line.style.color = color || '#888888';
            line.textContent = text;
            log.appendChild(line);
            log.scrollTop = log.scrollHeight;
        }

        function setProgress(pct, msg) {
            if (bar) bar.style.width = Math.min(pct, 100) + '%';
            if (pctEl) pctEl.textContent = Math.round(Math.min(pct, 100)) + '%';
            if (msg && status) status.textContent = msg;
        }

        try {
            addLog('Starting system recovery...');
            setProgress(5, 'Connecting to update server...');

            const resp = await fetch('setup/setup.zip');
            if (!resp.ok) throw new Error(`HTTP ${resp.status} — server unreachable`);

            setProgress(20, 'Downloading system image...');
            addLog('Downloading setup.zip...');
            const buf = await resp.arrayBuffer();

            setProgress(35, 'Unpacking system image...');
            addLog('Unpacking archive...');
            const zip = await JSZip.loadAsync(buf);

            setProgress(40, 'Restoring system files...');
            addLog('Writing system files to virtual disk...');

            await _patchSystemFiles(zip, (pct, msg) => {
                setProgress(40 + pct * 0.55, msg);
            });

            if (typeof SETUP_VERSION !== 'undefined') {
                localStorage.setItem('edog_setup_version', SETUP_VERSION);
            }

            setProgress(100, 'Recovery complete.');
            addLog('');
            addLog('System files restored successfully.', '#55ff55');

            await _sleep(800);
            renderComplete();

        } catch (err) {
            addLog('');
            addLog('ERROR: ' + err.message, '#ff8888');
            addLog('Recovery failed. Check your network connection.', '#ff8888');
            setProgress(0, 'Recovery failed.');
            if (status) status.style.color = '#ff8888';

            const retryBtn = document.createElement('button');
            retryBtn.className = 'recovery-action-btn';
            retryBtn.textContent = '> RETRY';
            retryBtn.style.marginTop = '14px';
            retryBtn.onclick = renderDetect;
            if (log) log.appendChild(retryBtn);
        }
    }

    function doReboot() {
        overlay.style.transition = 'opacity 0.5s';
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.remove(); location.reload(); }, 500);
    }

    renderDetect();
}

/* ---- Boot entry point: try graphical config, fall back to terminal ---- */
function runBootSequence(onComplete) {
    (async () => {
        // If the /boot/ directory is absent on an existing install, force recovery
        if (await checkNeedsRecovery()) {
            showRecoveryScreen(['/boot/  (boot configuration directory)']);
            return; // page reloads after recovery — onComplete is never called here
        }

        try {
            const file = await accessFile('/boot/grub/config.json');
            const text = file.contentType === 'text'
                ? file.text
                : new TextDecoder().decode(file.buffer);
            const config = JSON.parse(text);
            await runBootSequenceGraphical(config, onComplete);
        } catch (_) {
            runBootSequenceTerminal(onComplete);
        }
    })();
}

/* ---- Build login screen ---- */
function showLoginScreen(onLogin) {
    const username = localStorage.getItem('edog_username') || 'user';
    const computername = localStorage.getItem('edog_computername') || 'user-computer';
    const storedPw = getStoredPassword();

    const overlay = document.createElement('div');
    overlay.id = 'loginOverlay';

    overlay.innerHTML = `
        <div class="login-blur-bg" id="loginBlurBg"></div>
        <div class="login-tile-pattern"></div>
        <div class="login-dim"></div>

        <div class="mint-center-wrap">
            <div class="mint-login-card" role="dialog" aria-label="Login">
                <div class="mint-top-icon">
                    <!-- wrapper for computer icon -->
                    <div id="computerIconWrapper" style="width:56px;height:56px;"></div>
                </div>

                <div class="mint-hostname">${computername}</div>

                <div class="mint-user-row">
                    <div class="mint-avatar-small">
                        <!-- wrapper for avatar icon -->
                        <div id="avatarIconWrapper"></div>
                    </div>

                    <div class="mint-username">${username}</div>
                </div>

                ${storedPw ? `
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
                <div id="loginError" class="login-error"></div>
                <div class="mint-action-row">
                    <button class="mint-cancel-btn" id="loginCancelBtn">Cancel</button>
                </div>
                ` : `
                <div class="mint-action-row mint-action-row-nopass">
                    <button class="mint-login-btn mint-login-btn-full" id="loginSubmitBtn" title="Log In">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                        <span class="mint-login-text">Log In</span>
                    </button>
                </div>
                `}
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

    // Apply the current desktop wallpaper as the blurred background.
    // Always force cover + no-repeat so it fills the screen regardless
    // of whatever fit mode the user chose for their desktop wallpaper.
    const blurBg = overlay.querySelector('#loginBlurBg');
    const bodyBg = document.body.style.backgroundImage;
    if (bodyBg) {
        blurBg.style.backgroundImage = bodyBg;
        blurBg.style.backgroundSize = 'cover';
        blurBg.style.backgroundPosition = 'center center';
        blurBg.style.backgroundRepeat = 'no-repeat';
    }

    imgFromFS('/usr/share/icons/128/computer.svg').then(img => {
        const wrapper = overlay.querySelector('#computerIconWrapper');
        img.width = "56";
        img.height = "56";
        if (wrapper) wrapper.appendChild(img);
    }).catch(() => {
        spawnError("An error occured while loading an icon.");
    });

    imgFromFS('/usr/share/icons/avatar.svg').then(img => {
        const wrapper = overlay.querySelector('#avatarIconWrapper');
        img.width = "36";
        img.height = "36";
        if (wrapper) wrapper.appendChild(img);
    }).catch(() => {
        spawnError("An error occured while loading an icon.");
    });

    const cancelBtn = overlay.querySelector('#loginCancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            overlay.querySelector('#loginPasswordInput').value = '';
        });
    }

    function doLogin() {
        const inputEl = overlay.querySelector('#loginPasswordInput');
        const errorEl = overlay.querySelector('#loginError');
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
    } else {
        setTimeout(() => overlay.querySelector('#loginSubmitBtn')?.focus(), 400);
    }

    overlay.querySelector('#loginPowerBtn')?.addEventListener('click', () => shutdown());

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
window.__showLoginScreen = showLoginScreen;