/* ============================================================
   E-Dog OS — First-Run Setup Wizard
   Include this BEFORE script.js in index.html.
   Exposes: window.__setupComplete (Promise<{username}>)
============================================================ */

/* ============================================================
   Shared DB opener for setup.js — always creates the schema.
   Returns { db, brandNew } where brandNew=true means the
   object store was just created (genuinely first run).
============================================================ */
function openSetupDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('VirtualFS_v2', 1);
        let brandNew = false;

        req.onupgradeneeded = (e) => {
            brandNew = true;
            const db = e.target.result;
            if (!db.objectStoreNames.contains('nodes')) {
                const store = db.createObjectStore('nodes', { keyPath: 'id' });
                store.createIndex('parentId', 'parentId', { unique: false });
                // Seed the root node inside the upgrade transaction
                store.add({
                    id: 'root', name: 'root', type: 'folder',
                    parentId: null,
                    createdAt: Date.now(), updatedAt: Date.now(),
                });
            }
        };

        req.onsuccess = () => resolve({ db: req.result, brandNew });
        req.onerror = () => reject(req.error);
    });
}


window.__setupComplete = (async function () {

    /* ---- Check if DB already has content (returning user) ---- */
    async function isFirstRun() {
        const { db, brandNew } = await openSetupDB();

        // Schema was just created — definitely first run, store is empty.
        if (brandNew) {
            db.close();
            return true;
        }

        // Existing DB — count root's children.
        return new Promise((resolve) => {
            const tx = db.transaction('nodes', 'readonly');
            const idx = tx.objectStore('nodes').index('parentId');
            const count = idx.count('root');
            count.onsuccess = () => { db.close(); resolve(count.result === 0); };
            count.onerror = () => { db.close(); resolve(false); };
        });
    }

    if (!(await isFirstRun())) {
        return { username: null, freshInstall: false };
    }

    /* ---- Run the wizard, return username when done ---- */
    return new Promise((resolve) => {
        buildSetupUI(resolve);
    });
})();


/* ============================================================
   UI Builder — 4 steps: Welcome, Username, Password, Installing
============================================================ */
function buildSetupUI(onComplete) {
    let progressBarFill = null;
    let statusText = null;

    /* Overlay */
    const overlay = document.createElement('div');
    overlay.id = 'setupOverlay';
    document.body.appendChild(overlay);

    /* Card */
    const card = document.createElement('div');
    card.className = 'setup-card';
    overlay.appendChild(card);

    /* Dot indicators — 4 steps */
    const dots = document.createElement('div');
    dots.className = 'setup-dots';
    for (let i = 0; i < 4; i++) {
        const d = document.createElement('span');
        d.className = 'setup-dot' + (i === 0 ? ' active' : '');
        dots.appendChild(d);
    }
    card.appendChild(dots);

    /* Step container */
    const stepsWrap = document.createElement('div');
    stepsWrap.className = 'setup-steps-wrap';
    card.appendChild(stepsWrap);

    const steps = [
        buildStepWelcome,
        buildStepUsername,
        buildStepPassword,
        buildStepInstalling,
    ];
    const stepEls = steps.map((fn, i) => {
        const el = fn();
        el.classList.toggle('setup-step--hidden', i !== 0);
        stepsWrap.appendChild(el);
        return el;
    });

    let username = 'user';
    let computername = 'user-computer';
    let password = '';

    function setDot(n) {
        dots.querySelectorAll('.setup-dot').forEach((d, i) =>
            d.classList.toggle('active', i === n)
        );
    }

    function goTo(n) {
        stepEls.forEach((el, i) => {
            el.classList.toggle('setup-step--hidden', i !== n);
            el.classList.toggle('setup-step--active', i === n);
        });
        setDot(n);
    }

    /* ---- Step 0: Welcome ---- */
    function buildStepWelcome() {
        const el = makeStep();
        el.innerHTML = `
            <div class="setup-logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <path d="M8 21h8M12 17v4"/>
                    <path d="M7 8h2M7 11h2M11 8h6M11 11h6"/>
                </svg>
            </div>
            <h1 class="setup-title">Welcome to E-Dog OS</h1>
            <p class="setup-sub">Click "Start" to install E-Dog OS.</p>
            <button class="setup-btn setup-btn--primary" id="setup-start-btn">Start</button>
        `;
        el.querySelector('#setup-start-btn').onclick = () => goTo(1);
        return el;
    }

    /* ---- Step 1: Username ---- */
    function buildStepUsername() {
        const el = makeStep();
        el.innerHTML = `
            <h2 class="setup-title">Choose your username</h2>
            <p class="setup-sub">The username may contain letters, numbers, hyphens and underscores only.<br>Your computer's name is what it will be referred to on the network.</p>
            <div class="setup-field">
                <label class="setup-label" for="setup-username-input">Username</label>
                <div class="setup-input-wrap">
                    <span class="setup-input-prefix">/home/</span>
                    <input class="setup-input" id="setup-username-input"
                        type="text" maxlength="32" placeholder="yourname"
                        autocomplete="off" spellcheck="false" autocapitalize="off">
                </div>
                <span class="setup-field-hint" id="setup-username-hint">3–32 characters</span>
            </div>
            <div class="setup-field">
                <label class="setup-label" for="setup-computername-input">Computer Name</label>
                <div class="setup-input-wrap">
                    <input class="setup-input" id="setup-computername-input"
                        type="text" maxlength="32" placeholder="Example: edog-computer"
                        autocomplete="off" spellcheck="false" autocapitalize="off">
                </div>
            </div>
            <div class="setup-row">
                <button class="setup-btn setup-btn--ghost" id="setup-back-btn">Back</button>
                <button class="setup-btn setup-btn--primary" id="setup-next-btn" disabled>Continue →</button>
            </div>
        `;

        const input = el.querySelector('#setup-username-input');
        const computernameInput = el.querySelector('#setup-computername-input');
        const nextBtn = el.querySelector('#setup-next-btn');
        const hint = el.querySelector('#setup-username-hint');

        function validate(val) {
            if (!val) return { ok: false, msg: '3–32 characters' };
            if (!/^[a-z0-9_-]+$/.test(val)) return { ok: false, msg: 'Lowercase letters, numbers, - and _ only' };
            if (val.length < 3) return { ok: false, msg: `${3 - val.length} more character${3 - val.length !== 1 ? 's' : ''} needed` };
            return { ok: true, msg: `✓ Looks good` };
        }

        input.addEventListener('input', () => {
            computernameInput.value = `${input.value}-computer`
            const pos = input.selectionStart;
            input.value = input.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
            input.setSelectionRange(pos, pos);

            const { ok, msg } = validate(input.value);
            hint.textContent = msg;
            hint.style.color = ok ? '#4ade80' : '#888';
            nextBtn.disabled = !ok;
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !nextBtn.disabled) nextBtn.click();
        });

        el.querySelector('#setup-back-btn').onclick = () => goTo(0);

        nextBtn.onclick = () => {
            const { ok } = validate(input.value);
            if (!ok) return;
            username = input.value;
            computername = computernameInput.value;
            goTo(2);
        };

        new MutationObserver(() => {
            if (!el.classList.contains('setup-step--hidden')) {
                setTimeout(() => input.focus(), 50);
            }
        }).observe(el, { attributes: true, attributeFilter: ['class'] });

        return el;
    }

    /* ---- Step 2: Password ---- */
    function buildStepPassword() {
        const el = makeStep();
        el.innerHTML = `
            <h2 class="setup-title">Set a password</h2>
            <p class="setup-sub">Secure your account with a login password.<br>You can leave it blank to skip.</p>

            <div class="setup-field">
                <label class="setup-label" for="setup-pw-input">Password</label>
                <div class="setup-input-wrap" id="setup-pw-wrap">
                    <input class="setup-input" id="setup-pw-input"
                        type="password" placeholder="Enter password"
                        autocomplete="new-password" spellcheck="false">
                    <button class="setup-pw-toggle" id="setup-pw-toggle1" title="Show/hide" tabindex="-1">👁</button>
                </div>
                <div class="setup-pw-strength" id="setup-pw-strength" style="display:none">
                    <div class="setup-pw-bar" id="setup-pw-bar1"></div>
                    <div class="setup-pw-bar" id="setup-pw-bar2"></div>
                    <div class="setup-pw-bar" id="setup-pw-bar3"></div>
                    <div class="setup-pw-bar" id="setup-pw-bar4"></div>
                </div>
                <div class="setup-pw-label" id="setup-pw-label"></div>
            </div>

            <div class="setup-field" id="setup-confirm-field" style="display:none">
                <label class="setup-label" for="setup-pw-confirm">Confirm Password</label>
                <div class="setup-input-wrap">
                    <input class="setup-input" id="setup-pw-confirm"
                        type="password" placeholder="Repeat password"
                        autocomplete="new-password" spellcheck="false">
                    <button class="setup-pw-toggle" id="setup-pw-toggle2" title="Show/hide" tabindex="-1">👁</button>
                </div>
                <span class="setup-field-hint" id="setup-pw-match-hint"></span>
            </div>

            <div class="setup-row">
                <button class="setup-btn setup-btn--ghost" id="setup-pw-back-btn">Back</button>
                <button class="setup-btn setup-btn--ghost" id="setup-skip-btn">Skip →</button>
                <button class="setup-btn setup-btn--primary" id="setup-pw-next-btn" disabled>Continue →</button>
            </div>
        `;

        const pwInput = el.querySelector('#setup-pw-input');
        const confirmInput = el.querySelector('#setup-pw-confirm');
        const strengthEl = el.querySelector('#setup-pw-strength');
        const confirmField = el.querySelector('#setup-confirm-field');
        const pwLabel = el.querySelector('#setup-pw-label');
        const matchHint = el.querySelector('#setup-pw-match-hint');
        const nextBtn = el.querySelector('#setup-pw-next-btn');
        const skipBtn = el.querySelector('#setup-skip-btn');

        // Toggle visibility
        el.querySelector('#setup-pw-toggle1').onclick = () => {
            pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
        };
        el.querySelector('#setup-pw-toggle2').onclick = () => {
            confirmInput.type = confirmInput.type === 'password' ? 'text' : 'password';
        };

        function getStrength(pw) {
            if (!pw) return { score: 0, label: '' };
            let score = 0;
            if (pw.length >= 6) score++;
            if (pw.length >= 10) score++;
            if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) score++;
            if (/[^a-zA-Z0-9]/.test(pw)) score++;
            const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
            const colors = ['', '#ef4444', '#f59e0b', '#60a5fa', '#4ade80'];
            return { score, label: labels[score], color: colors[score] };
        }

        function updateStrength() {
            const pw = pwInput.value;
            if (!pw) {
                strengthEl.style.display = 'none';
                pwLabel.textContent = '';
                confirmField.style.display = 'none';
                nextBtn.disabled = true;
                return;
            }

            strengthEl.style.display = 'flex';
            confirmField.style.display = 'block';

            const { score, label, color } = getStrength(pw);
            const bars = ['setup-pw-bar1', 'setup-pw-bar2', 'setup-pw-bar3', 'setup-pw-bar4']
                .map(id => el.querySelector('#' + id));

            bars.forEach((bar, i) => {
                bar.className = 'setup-pw-bar';
                if (i < score) {
                    if (score === 1) bar.classList.add('weak');
                    else if (score <= 2) bar.classList.add('medium');
                    else bar.classList.add('strong');
                }
            });

            pwLabel.textContent = label;
            pwLabel.style.color = color;

            checkMatch();
        }

        function checkMatch() {
            const pw = pwInput.value;
            const conf = confirmInput.value;

            if (!conf) {
                matchHint.textContent = '';
                nextBtn.disabled = true;
                return;
            }

            if (pw === conf) {
                matchHint.textContent = '✓ Passwords match';
                matchHint.style.color = '#4ade80';
                nextBtn.disabled = false;
            } else {
                matchHint.textContent = 'Passwords do not match';
                matchHint.style.color = '#f87171';
                nextBtn.disabled = true;
            }
        }

        pwInput.addEventListener('input', updateStrength);
        confirmInput.addEventListener('input', checkMatch);

        confirmInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !nextBtn.disabled) nextBtn.click();
        });

        el.querySelector('#setup-pw-back-btn').onclick = () => goTo(1);

        skipBtn.onclick = () => {
            password = '';
            goTo(3);
            setTimeout(() => startInstall(username, password, computername), 120);
        };

        nextBtn.onclick = () => {
            if (pwInput.value !== confirmInput.value) return;
            password = pwInput.value;
            goTo(3);
            setTimeout(() => startInstall(username, password, computername), 120);
        };

        new MutationObserver(() => {
            if (!el.classList.contains('setup-step--hidden')) {
                setTimeout(() => pwInput.focus(), 50);
            }
        }).observe(el, { attributes: true, attributeFilter: ['class'] });

        return el;
    }

    /* ---- Step 3: Installing ---- */
    function buildStepInstalling() {
        const el = makeStep();
        el.innerHTML = `
            <div class="setup-spinner-wrap">
                <div class="setup-spinner"></div>
            </div>
            <h2 class="setup-title" id="setup-install-title">Setting up your system…</h2>
            <p class="setup-sub" id="setup-install-status">Downloading system files…</p>
            <div class="setup-progress">
                <div class="setup-progress-fill" id="setup-progress-fill"></div>
            </div>
            <p class="setup-progress-label" id="setup-progress-label">0%</p>
        `;
        progressBarFill = el.querySelector('#setup-progress-fill');
        statusText = el.querySelector('#setup-install-status');
        return el;
    }

    function setProgress(pct, msg) {
        if (progressBarFill) progressBarFill.style.width = pct + '%';
        const label = document.getElementById('setup-progress-label');
        if (label) label.textContent = Math.round(pct) + '%';
        if (msg && statusText) statusText.textContent = msg;
    }

    /* ---- Install logic ---- */
    async function startInstall(uname, pw, computername) {
        try {
            setProgress(5, 'Fetching system package…');
            await sleep(200);

            let zip;
            try {
                const resp = await fetch('setup/setup.zip');
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                setProgress(20, 'Downloading…');
                const buf = await resp.arrayBuffer();
                setProgress(40, 'Unpacking archive…');
                await sleep(100);
                zip = await JSZip.loadAsync(buf);
            } catch (fetchErr) {
                console.warn('[Setup] Could not fetch setup.zip, using built-in defaults:', fetchErr.message);
                setProgress(40, 'Using built-in defaults…');
                await sleep(300);
                await fallbackInstall(uname);
                await finishInstall(uname, pw, computername);
                return;
            }

            setProgress(50, 'Creating filesystem…');
            await sleep(100);
            await extractZipToIDB(zip, uname, (pct, msg) => setProgress(50 + pct * 0.45, msg));
            await finishInstall(uname, pw, computername);

        } catch (err) {
            console.error('[Setup] Install failed:', err);
            statusText.textContent = 'Something went wrong. Falling back to defaults…';
            await sleep(600);
            await fallbackInstall(uname);
            await finishInstall(uname, pw, computername);
        }
    }

    async function finishInstall(uname, pw, computername) {
        localStorage.setItem('edog_username', uname);
        localStorage.setItem('edog_computername', computername);
        if (pw) {
            localStorage.setItem('edog_password', pw);
        } else {
            localStorage.removeItem('edog_password');
        }
        setProgress(100, 'Almost there…');
        await sleep(300);

        const titleEl = document.getElementById('setup-install-title');
        if (titleEl) titleEl.textContent = 'All done!';
        if (statusText) {
            statusText.textContent = `The installation has completed.`;
        }

        const spinWrap = document.querySelector('.setup-spinner-wrap');
        if (spinWrap) {
            spinWrap.innerHTML = `<div class="setup-check">✓</div>`;
        }

        const launchBtn = document.createElement('button');
        launchBtn.className = 'setup-btn setup-btn--primary';
        launchBtn.style.marginTop = '28px';
        launchBtn.textContent = `Launch E-Dog OS`;
        launchBtn.onclick = () => {
            onComplete({ username: uname, freshInstall: true });
            reboot();
        };
        stepEls[3].appendChild(launchBtn);
    }


    /* ---- Helpers ---- */
    function makeStep() {
        const el = document.createElement('div');
        el.className = 'setup-step';
        return el;
    }
}


/* ============================================================
   ZIP → IndexedDB extractor
   Replaces the placeholder username "edogos" in all paths.
============================================================ */
async function extractZipToIDB(zip, username, onProgress) {
    const PLACEHOLDER = 'edogos';

    const { db } = await openSetupDB();

    function idbPutLocal(obj) {
        return new Promise((res, rej) => {
            const req = db.transaction('nodes', 'readwrite').objectStore('nodes').put(obj);
            req.onsuccess = () => res();
            req.onerror = (e) => rej(e.target.error);
        });
    }
    function idbGetByIndex(parentId) {
        return new Promise((res, rej) => {
            const req = db.transaction('nodes', 'readonly').objectStore('nodes')
                .index('parentId').getAll(parentId);
            req.onsuccess = (e) => res(e.target.result);
            req.onerror = (e) => rej(e.target.error);
        });
    }

    const pathToId = { '': 'root' };

    const existing = await idbGetByIndex('root');
    for (const n of existing) {
        pathToId[n.name] = n.id;
    }

    const allEntries = Object.values(zip.files);
    allEntries.sort((a, b) => {
        const aD = a.name.split('/').length + (a.dir ? 0 : 100);
        const bD = b.name.split('/').length + (b.dir ? 0 : 100);
        return aD - bD;
    });

    const total = allEntries.length;

    for (let i = 0; i < allEntries.length; i++) {
        const entry = allEntries[i];

        let rawPath = entry.name.replace(new RegExp(PLACEHOLDER, 'g'), username);

        if (rawPath.endsWith('/')) rawPath = rawPath.slice(0, -1);
        if (!rawPath) continue;

        const parts = rawPath.split('/');
        const entryName = parts[parts.length - 1];
        const parentRawPath = parts.slice(0, -1).join('/');
        const parentId = pathToId[parentRawPath] ?? 'root';

        const id = crypto.randomUUID();
        const now = Date.now();

        if (entry.dir || entry.name.endsWith('/')) {
            await idbPutLocal({
                id, name: entryName, type: 'folder',
                parentId, createdAt: now, updatedAt: now,
            });
            pathToId[rawPath] = id;
        } else {
            const content = await entry.async('arraybuffer');
            await idbPutLocal({
                id, name: entryName, type: 'file',
                parentId, content,
                size: content.byteLength,
                mime: guessMime(entryName),
                createdAt: now, updatedAt: now,
            });
        }

        if (i % 5 === 0 && onProgress) {
            onProgress((i / total) * 100,
                `Installing… (${i + 1} / ${total})`);
        }
    }

    db.close();
}


/* ============================================================
   Fallback: create default folders without the ZIP
============================================================ */
async function fallbackInstall(username) {
    const { db } = await openSetupDB();

    function put(obj) {
        return new Promise((res, rej) => {
            const req = db.transaction('nodes', 'readwrite').objectStore('nodes').put(obj);
            req.onsuccess = () => res();
            req.onerror = (e) => rej(e.target.error);
        });
    }
    function getChildren(parentId) {
        return new Promise((res, rej) => {
            const req = db.transaction('nodes', 'readonly').objectStore('nodes')
                .index('parentId').getAll(parentId);
            req.onsuccess = (e) => res(e.target.result);
            req.onerror = (e) => rej(e.target.error);
        });
    }

    async function ensureFolder(name, parentId, cache) {
        const existing = (await getChildren(parentId)).find(n => n.name === name && n.type === 'folder');
        if (existing) { if (cache) cache[name] = existing.id; return existing.id; }
        const id = crypto.randomUUID();
        await put({ id, name, type: 'folder', parentId, createdAt: Date.now(), updatedAt: Date.now() });
        if (cache) cache[name] = id;
        return id;
    }

    const rootDirs = ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'lost+found',
        'media', 'mnt', 'opt', 'proc', 'root', 'sbin', 'sys', 'tmp', 'usr', 'var'];
    for (const d of rootDirs) await ensureFolder(d, 'root');

    const homeId = (await getChildren('root')).find(n => n.name === 'home')?.id;
    const userId = await ensureFolder(username, homeId);
    const userDirs = ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Videos', 'Templates', 'Public'];
    for (const d of userDirs) await ensureFolder(d, userId);

    db.close();
}


/* ============================================================
   Tiny helpers
============================================================ */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function guessMime(name) {
    const ext = (name.split('.').pop() || '').toLowerCase();
    const map = {
        html: 'text/html', htm: 'text/html', txt: 'text/plain', md: 'text/plain',
        js: 'text/javascript', css: 'text/css', json: 'application/json',
        png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
        gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
        mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg',
        pdf: 'application/pdf', zip: 'application/zip',
    };
    return map[ext] || 'application/octet-stream';
}