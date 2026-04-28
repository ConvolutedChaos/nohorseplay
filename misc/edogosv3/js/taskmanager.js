/* ============================================================
   Task Manager — E-Dog OS
   Attach: <script src="js/taskmanager.js"></script>
   after the other JS includes in index.html.
============================================================ */

(function () {
    'use strict';

    // ── Constants ──────────────────────────────────────────────

    const TICK_MS      = 1000;   // update interval (ms)
    const HISTORY_LEN  = 60;     // sparkline sample count
    const RAM_TOTAL_MB = 512;    // simulated total RAM

    // Simulated background system processes (non-closable)
    const SYS_PROCS = [
        { id: 'p_idle',    name: 'System Idle Process', baseCPU: [35, 65], baseMem: [0.4,  1.2] },
        { id: 'p_kernel',  name: 'E-Dog Kernel',        baseCPU: [0.4, 1.8], baseMem: [18, 23] },
        { id: 'p_shell',   name: 'Desktop Shell',       baseCPU: [0.3, 1.2], baseMem: [22, 28] },
        { id: 'p_vfs',     name: 'Virtual File System', baseCPU: [0.2, 1.0], baseMem: [28, 36] },
        { id: 'p_session', name: 'Session Manager',     baseCPU: [0.1, 0.4], baseMem: [ 6,  9] },
        { id: 'p_audio',   name: 'Audio Service',       baseCPU: [0.1, 0.3], baseMem: [ 4,  7] },
        { id: 'p_net',     name: 'Network Monitor',     baseCPU: [0.2, 0.7], baseMem: [ 4,  6] },
    ];

    // ── Module state ───────────────────────────────────────────

    const _cpuHistory    = new Array(HISTORY_LEN).fill(0);
    const _memHistory    = new Array(HISTORY_LEN).fill(0);
    const _diskRdHistory = new Array(HISTORY_LEN).fill(0);
    const _diskWrHistory = new Array(HISTORY_LEN).fill(0);

    let _currentCPU = 0;
    let _currentMem = 0;   // MB
    let _diskRdRate = 0;   // bytes/s this tick
    let _diskWrRate = 0;
    let _diskRdTotal = 0;  // cumulative bytes
    let _diskWrTotal = 0;

    let _ioWriteAccum = 0;   // bytes accumulated since last tick (write)
    let _ioReadAccum  = 0;   // bytes accumulated since last tick (read)
    let _idbPatched   = false;
    const _origIdb    = {};

    const _procValues = {}; // { id -> { cpu, mem } }

    let _tickTimer  = null;
    let _tmWindowId = null;
    let _activeTab  = 'performance';
    let _sortCol    = 'cpu';
    let _sortAsc    = false;
    let _filterText = '';
    let _uptimeStart = Date.now();

    // ── Stable seeded random (so each process has consistent base values) ──

    function _seed(str) {
        let h = 0x9e3779b9;
        for (let i = 0; i < str.length; i++) {
            h = (Math.imul(h ^ str.charCodeAt(i), 0x517cc1b7)) >>> 0;
        }
        return h;
    }

    function _seededFloat(str, lo, hi) {
        return lo + ((_seed(str) >>> 0) / 4294967296) * (hi - lo);
    }

    // Per-app-type CPU and memory ranges.
    // cpuRange [lo, hi] in %, memRange [lo, hi] in MB.
    const APP_PROFILES = {
        gamerunner:   { cpuRange: [18, 45], memRange: [120, 280] },
        engine:       { cpuRange: [15, 40], memRange: [100, 240] },
        paint:        { cpuRange: [ 4, 14], memRange: [ 60, 140] },
        ide:          { cpuRange: [ 3, 10], memRange: [ 55, 120] },
        fileExplorer: { cpuRange: [ 1,  5], memRange: [ 20,  50] },
        terminal:     { cpuRange: [ 1,  4], memRange: [ 18,  40] },
        writer:       { cpuRange: [ 0.5, 3], memRange: [ 20,  45] },
        appstore:     { cpuRange: [ 1,  4], memRange: [ 25,  55] },
        settings:     { cpuRange: [ 0.3, 2], memRange: [ 15,  30] },
        installer:    { cpuRange: [ 0.5, 2], memRange: [ 12,  25] },
        dialog:       { cpuRange: [ 0.1, 0.5], memRange: [  6,  12] },
        progress:     { cpuRange: [ 0.1, 0.4], memRange: [  5,  10] },
        taskmanager:  { cpuRange: [ 0.5, 1.2], memRange: [  8,  14] },
        _default:     { cpuRange: [ 0.8,  7],  memRange: [ 15,  60] },
    };

    function _getAppProfile(windowId) {
        const type = windows[windowId]?.state?.type || '_default';
        return APP_PROFILES[type] || APP_PROFILES._default;
    }

    // Per-window stable base CPU (%) and memory (MB), scaled by app type
    function _winBaseCPU(id) {
        const { cpuRange: [lo, hi] } = _getAppProfile(id);
        return _seededFloat(id + '_cpu', lo, hi);
    }
    function _winBaseMem(id) {
        const { memRange: [lo, hi] } = _getAppProfile(id);
        return _seededFloat(id + '_mem', lo, hi);
    }

    // ── Get a human-readable name for a window ─────────────────

    function _getWinName(windowId) {
        const win = windows[windowId];
        if (!win) return windowId;
        const titleEl = win.el.querySelector('.title-bar-text');
        if (titleEl) {
            const clone = titleEl.cloneNode(true);
            clone.querySelectorAll('img').forEach(img => img.remove());
            const text = clone.textContent.trim();
            if (text) return text;
        }
        if (win.taskbarBtn) {
            const clone = win.taskbarBtn.cloneNode(true);
            clone.querySelectorAll('img').forEach(img => img.remove());
            const text = clone.textContent.trim();
            if (text) return text;
        }
        return 'Window';
    }

    // ── Tick: compute one frame of metrics ────────────────────

    function _tick() {
        // Snapshot real IDB byte counts accumulated by the monkey-patched wrappers
        _diskWrRate   = _ioWriteAccum;
        _diskRdRate   = _ioReadAccum;
        _ioWriteAccum = 0;
        _ioReadAccum  = 0;
        if (_diskWrRate > 0) _diskWrTotal += _diskWrRate;
        if (_diskRdRate > 0) _diskRdTotal += _diskRdRate;

        // User windows
        let userCPU = 0, userMem = 0;
        for (const id of Object.keys(windows)) {
            const isTM = (id === _tmWindowId);
            const cpu  = isTM ? 0.8 : Math.max(0, _winBaseCPU(id) + (Math.random() - 0.5) * 1.5);
            const mem  = isTM ? 6   : Math.max(4, _winBaseMem(id) + (Math.random() - 0.5) * 2);
            _procValues[id] = { cpu, mem };
            userCPU += cpu;
            userMem += mem;
        }

        // System processes
        let sysMem = 0;
        for (const p of SYS_PROCS) {
            const [cLo, cHi] = p.baseCPU;
            const [mLo, mHi] = p.baseMem;
            const cpu = Math.max(0, _seededFloat(p.id + '_cb', cLo, cHi) + (Math.random() - 0.5) * 0.3);
            const mem = Math.max(0, _seededFloat(p.id + '_mb', mLo, mHi) + (Math.random() - 0.5) * 0.4);
            _procValues[p.id] = { cpu, mem };
            // System Idle CPU is inverse of total load; don't add it to userCPU
            sysMem += mem;
        }

        // Compute total CPU (excluding System Idle which fills the gap)
        let totalCPU = Math.min(99, userCPU + _seededFloat('syscpu', 1.5, 4) + (Math.random() - 0.5));
        // Back-fill System Idle
        _procValues['p_idle'] = { ..._procValues['p_idle'], cpu: Math.max(0, 100 - totalCPU - 2) };

        // Total memory
        let totalMem = userMem + sysMem;
        if (window.performance?.memory) {
            const heapMB = performance.memory.usedJSHeapSize / 1048576;
            totalMem = Math.max(heapMB + 60, totalMem); // heap + simulated system overhead
        }
        totalMem = Math.min(RAM_TOTAL_MB * 0.93, totalMem);

        _currentCPU = totalCPU;
        _currentMem = totalMem;

        _cpuHistory.push(totalCPU);
        _memHistory.push((totalMem / RAM_TOTAL_MB) * 100);
        _diskRdHistory.push(_diskRdRate);
        _diskWrHistory.push(_diskWrRate);
        if (_cpuHistory.length    > HISTORY_LEN) _cpuHistory.shift();
        if (_memHistory.length    > HISTORY_LEN) _memHistory.shift();
        if (_diskRdHistory.length > HISTORY_LEN) _diskRdHistory.shift();
        if (_diskWrHistory.length > HISTORY_LEN) _diskWrHistory.shift();
    }

    // ── Formatting ─────────────────────────────────────────────

    function _fmtBytes(b) {
        if (b === 0)     return '0 B/s';
        if (b < 1024)    return b.toFixed(0) + ' B/s';
        if (b < 1048576) return (b / 1024).toFixed(1) + ' KB/s';
        return (b / 1048576).toFixed(2) + ' MB/s';
    }

    function _fmtBytesTotal(b) {
        if (b < 1024)    return b.toFixed(0) + ' B';
        if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
        return (b / 1048576).toFixed(2) + ' MB';
    }

    function _fmtUptime() {
        const s   = Math.floor((Date.now() - _uptimeStart) / 1000);
        const h   = Math.floor(s / 3600);
        const m   = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return [h, m, sec].map(n => String(n).padStart(2, '0')).join(':');
    }

    function _escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // ── Canvas sparkline ───────────────────────────────────────

    function _drawSparkline(canvas, data, lineColor, fillColor, maxVal) {
        if (!canvas) return;
        const ctx  = canvas.getContext('2d');
        const W    = canvas.width;
        const H    = canvas.height;
        const max  = maxVal || Math.max(...data, 1);
        const step = W / Math.max(data.length - 1, 1);

        ctx.clearRect(0, 0, W, H);

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = Math.round(H - (i / 4) * (H - 2));
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        if (data.length < 2) return;

        // Fill area
        ctx.beginPath();
        ctx.moveTo(0, H);
        data.forEach((v, i) => {
            ctx.lineTo(i * step, H - (v / max) * (H - 2));
        });
        ctx.lineTo((data.length - 1) * step, H);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();

        // Line
        ctx.beginPath();
        data.forEach((v, i) => {
            const x = i * step;
            const y = H - (v / max) * (H - 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        ctx.stroke();
    }

    function _drawDiskSparklines(windowId) {
        const canvas = document.getElementById(`tm-disk-canvas-${windowId}`);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const max = Math.max(..._diskRdHistory, ..._diskWrHistory, 1024);

        ctx.clearRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 3; i++) {
            const y = Math.round(H - (i / 3) * (H - 2));
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        const drawSeries = (data, lineColor, fillColor) => {
            if (data.length < 2) return;
            const step = W / Math.max(data.length - 1, 1);
            ctx.beginPath();
            ctx.moveTo(0, H);
            data.forEach((v, i) => ctx.lineTo(i * step, H - (v / max) * (H - 2)));
            ctx.lineTo((data.length - 1) * step, H);
            ctx.closePath();
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.beginPath();
            data.forEach((v, i) => {
                const x = i * step, y = H - (v / max) * (H - 2);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            });
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1.5;
            ctx.lineJoin = 'round';
            ctx.stroke();
        };

        drawSeries(_diskRdHistory, '#f59e0b', 'rgba(245,158,11,0.12)');
        drawSeries(_diskWrHistory, '#ef4444', 'rgba(239,68,68,0.12)');
    }

    // ── Performance tab ────────────────────────────────────────

    function _renderPerformanceTab(container, windowId) {
        const cpuPct = _currentCPU.toFixed(1);
        const memMB  = _currentMem.toFixed(0);
        const memPct = (_currentMem / RAM_TOTAL_MB * 100).toFixed(1);
        const procCount = Object.keys(windows).length + SYS_PROCS.length;

        container.innerHTML = `
            <div class="tm-perf-grid">

                <div class="tm-perf-card">
                    <div class="tm-perf-card-header">
                        <span class="tm-perf-label">CPU</span>
                        <span class="tm-perf-value" id="tm-cpu-val-${windowId}">${cpuPct}%</span>
                    </div>
                    <canvas class="tm-sparkline" id="tm-cpu-canvas-${windowId}" width="300" height="80"></canvas>
                    <div class="tm-bar-track">
                        <div class="tm-bar-fill tm-bar-cpu" id="tm-cpu-bar-${windowId}" style="width:${cpuPct}%"></div>
                    </div>
                    <div class="tm-perf-meta">${procCount} processes running</div>
                </div>

                <div class="tm-perf-card">
                    <div class="tm-perf-card-header">
                        <span class="tm-perf-label">Memory</span>
                        <span class="tm-perf-value" id="tm-mem-val-${windowId}">${memMB} MB</span>
                    </div>
                    <canvas class="tm-sparkline" id="tm-mem-canvas-${windowId}" width="300" height="80"></canvas>
                    <div class="tm-bar-track">
                        <div class="tm-bar-fill tm-bar-mem" id="tm-mem-bar-${windowId}" style="width:${memPct}%"></div>
                    </div>
                    <div class="tm-perf-meta">${memMB} MB / ${RAM_TOTAL_MB} MB used (${memPct}%)</div>
                </div>

                <div class="tm-perf-card tm-perf-card-wide">
                    <div class="tm-perf-card-header">
                        <span class="tm-perf-label">Disk I/O</span>
                        <span class="tm-perf-disk-legend">
                            <span class="tm-legend-dot tm-legend-rd"></span> Read &nbsp;
                            <span class="tm-legend-dot tm-legend-wr"></span> Write
                        </span>
                    </div>
                    <canvas class="tm-sparkline tm-sparkline-wide" id="tm-disk-canvas-${windowId}" width="620" height="60"></canvas>
                    <div class="tm-disk-row">
                        <div class="tm-disk-stat">
                            <span class="tm-disk-label">Read</span>
                            <span class="tm-disk-val tm-disk-rd" id="tm-disk-rd-${windowId}">${_fmtBytes(_diskRdRate)}</span>
                        </div>
                        <div class="tm-disk-stat">
                            <span class="tm-disk-label">Write</span>
                            <span class="tm-disk-val tm-disk-wr" id="tm-disk-wr-${windowId}">${_fmtBytes(_diskWrRate)}</span>
                        </div>
                        <div class="tm-disk-stat">
                            <span class="tm-disk-label">Total Read</span>
                            <span class="tm-disk-val" id="tm-disk-rdtot-${windowId}">${_fmtBytesTotal(_diskRdTotal)}</span>
                        </div>
                        <div class="tm-disk-stat">
                            <span class="tm-disk-label">Total Write</span>
                            <span class="tm-disk-val" id="tm-disk-wrtot-${windowId}">${_fmtBytesTotal(_diskWrTotal)}</span>
                        </div>
                        <div class="tm-disk-stat" style="margin-left:auto">
                            <span class="tm-disk-label">Uptime</span>
                            <span class="tm-disk-val" id="tm-uptime-${windowId}">${_fmtUptime()}</span>
                        </div>
                    </div>
                </div>

            </div>
        `;

        requestAnimationFrame(() => {
            _drawSparkline(
                document.getElementById(`tm-cpu-canvas-${windowId}`),
                _cpuHistory, '#3b82f6', 'rgba(59,130,246,0.18)', 100
            );
            _drawSparkline(
                document.getElementById(`tm-mem-canvas-${windowId}`),
                _memHistory, '#10b981', 'rgba(16,185,129,0.18)', 100
            );
            _drawDiskSparklines(windowId);
        });
    }

    function _updatePerformanceUI(windowId) {
        const cpuPct = _currentCPU.toFixed(1);
        const memMB  = _currentMem.toFixed(0);
        const memPct = (_currentMem / RAM_TOTAL_MB * 100).toFixed(1);

        const q = id => document.getElementById(id);
        const set = (id, v) => { const el = q(id); if (el) el.textContent = v; };
        const setW = (id, v) => { const el = q(id); if (el) el.style.width = v; };

        set (`tm-cpu-val-${windowId}`,    `${cpuPct}%`);
        setW(`tm-cpu-bar-${windowId}`,    `${cpuPct}%`);
        set (`tm-mem-val-${windowId}`,    `${memMB} MB`);
        setW(`tm-mem-bar-${windowId}`,    `${memPct}%`);
        set (`tm-disk-rd-${windowId}`,    _fmtBytes(_diskRdRate));
        set (`tm-disk-wr-${windowId}`,    _fmtBytes(_diskWrRate));
        set (`tm-disk-rdtot-${windowId}`, _fmtBytesTotal(_diskRdTotal));
        set (`tm-disk-wrtot-${windowId}`, _fmtBytesTotal(_diskWrTotal));
        set (`tm-uptime-${windowId}`,     _fmtUptime());

        _drawSparkline(
            q(`tm-cpu-canvas-${windowId}`),
            _cpuHistory, '#3b82f6', 'rgba(59,130,246,0.18)', 100
        );
        _drawSparkline(
            q(`tm-mem-canvas-${windowId}`),
            _memHistory, '#10b981', 'rgba(16,185,129,0.18)', 100
        );
        _drawDiskSparklines(windowId);
    }

    // ── Processes tab ──────────────────────────────────────────

    function _buildProcessList() {
        const procs = [];

        for (const id of Object.keys(windows)) {
            const v = _procValues[id] || { cpu: 0, mem: 0 };
            procs.push({ id, name: _getWinName(id), cpu: v.cpu, mem: v.mem, type: 'user' });
        }

        for (const p of SYS_PROCS) {
            const v = _procValues[p.id] || { cpu: 0, mem: 0 };
            procs.push({ id: p.id, name: p.name, cpu: v.cpu, mem: v.mem, type: 'system' });
        }

        return procs;
    }

    function _renderProcessesTab(container, windowId) {
        container.innerHTML = `
            <div class="tm-proc-toolbar">
                <input class="tm-proc-search" id="tm-proc-search-${windowId}"
                    placeholder="Filter processes..." value="${_escHtml(_filterText)}">
                <span class="tm-proc-count" id="tm-proc-count-${windowId}"></span>
            </div>
            <div class="tm-table-wrap">
                <table class="tm-table">
                    <thead>
                        <tr>
                            <th class="tm-th tm-th-name tm-sortable" data-col="name">
                                Name<span class="tm-sort-arrow" data-arrow="name"></span>
                            </th>
                            <th class="tm-th tm-sortable" data-col="cpu" style="width:110px">
                                CPU<span class="tm-sort-arrow" data-arrow="cpu"></span>
                            </th>
                            <th class="tm-th tm-sortable" data-col="mem" style="width:120px">
                                Memory<span class="tm-sort-arrow" data-arrow="mem"></span>
                            </th>
                            <th class="tm-th" style="width:70px">Status</th>
                            <th class="tm-th" style="width:90px">Action</th>
                        </tr>
                    </thead>
                    <tbody id="tm-proc-body-${windowId}"></tbody>
                </table>
            </div>
        `;

        // Sort clicks
        container.querySelectorAll('.tm-sortable').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.col;
                _sortAsc = (_sortCol === col) ? !_sortAsc : (col === 'name');
                _sortCol = col;
                _refreshProcRows(windowId);
                _updateSortArrows(container);
            });
        });

        // Filter input
        container.querySelector(`#tm-proc-search-${windowId}`)
            .addEventListener('input', e => {
                _filterText = e.target.value;
                _refreshProcRows(windowId);
            });

        _updateSortArrows(container);
        _refreshProcRows(windowId);
    }

    function _updateSortArrows(container) {
        container.querySelectorAll('[data-arrow]').forEach(el => {
            el.textContent = (el.dataset.arrow === _sortCol) ? (_sortAsc ? ' ▲' : ' ▼') : '';
        });
    }

    function _refreshProcRows(windowId) {
        const tbody = document.getElementById(`tm-proc-body-${windowId}`);
        if (!tbody) return;

        let procs = _buildProcessList();
        const f = _filterText.toLowerCase();
        if (f) procs = procs.filter(p => p.name.toLowerCase().includes(f));

        procs.sort((a, b) => {
            let av = a[_sortCol], bv = b[_sortCol];
            if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
            return _sortAsc ? (av < bv ? -1 : av > bv ? 1 : 0)
                            : (av > bv ? -1 : av < bv ? 1 : 0);
        });

        tbody.innerHTML = '';

        for (const p of procs) {
            const tr = document.createElement('tr');
            tr.className = 'tm-row' + (p.type === 'system' ? ' tm-row-sys' : '');

            const cpuW   = Math.min(100, p.cpu).toFixed(0);
            const memPct = Math.min(100, (p.mem / RAM_TOTAL_MB) * 100).toFixed(0);
            const isEndable = p.type === 'user' && p.id !== _tmWindowId;

            tr.innerHTML = `
                <td class="tm-td tm-td-name">
                    <span class="tm-proc-dot ${p.type === 'system' ? 'tm-proc-dot-sys' : 'tm-proc-dot-usr'}"></span>
                    ${_escHtml(p.name)}
                </td>
                <td class="tm-td tm-td-num">
                    <div class="tm-mini-bar">
                        <div class="tm-mini-fill tm-mini-cpu" style="width:${cpuW}%"></div>
                    </div>
                    <span class="tm-stat-num">${p.cpu.toFixed(1)}%</span>
                </td>
                <td class="tm-td tm-td-num">
                    <div class="tm-mini-bar">
                        <div class="tm-mini-fill tm-mini-mem" style="width:${memPct}%"></div>
                    </div>
                    <span class="tm-stat-num">${p.mem.toFixed(0)} MB</span>
                </td>
                <td class="tm-td"><span class="tm-status-run">Running</span></td>
                <td class="tm-td">
                    ${isEndable
                        ? `<button class="tm-end-btn" data-kill="${p.id}">End Task</button>`
                        : `<span class="tm-protected">${p.type === 'system' ? 'Protected' : 'Active'}</span>`
                    }
                </td>
            `;

            if (isEndable) {
                tr.querySelector('.tm-end-btn').addEventListener('click', () => {
                    _confirmEndTask(p.id, p.name, windowId);
                });
            }

            tbody.appendChild(tr);
        }

        const countEl = document.getElementById(`tm-proc-count-${windowId}`);
        if (countEl) countEl.textContent = `${procs.length} process${procs.length !== 1 ? 'es' : ''}`;
    }

    function _confirmEndTask(targetId, targetName, callerWindowId) {
        const doEnd = () => {
            if (typeof closeWindow === 'function') closeWindow(targetId);
            delete _procValues[targetId];
            _refreshProcRows(callerWindowId);
        };

        if (typeof spawnError === 'function') {
            spawnError(
                `End task for "${targetName}"?\n\nAny unsaved work in this application will be lost.`,
                'question',
                [
                    { label: 'End Task', style: 'danger', onClick: doEnd },
                    { label: 'Cancel' },
                ]
            );
        } else {
            doEnd();
        }
    }

    // ── Update loop ────────────────────────────────────────────

    function _doUpdate(windowId) {
        if (!windows[windowId]) { _stopTick(); return; }

        _tick();

        if (_activeTab === 'performance') {
            _updatePerformanceUI(windowId);
        } else {
            _refreshProcRows(windowId);
        }
    }

    // ── IDB byte-counting patch ────────────────────────────────

    function _estimateObjSize(obj) {
        if (!obj) return 0;
        if (obj instanceof ArrayBuffer) return obj.byteLength;
        if (ArrayBuffer.isView(obj)) return obj.byteLength;
        if (obj.content instanceof ArrayBuffer) return obj.content.byteLength;
        if (ArrayBuffer.isView(obj.content)) return obj.content.byteLength;
        if (typeof obj.size === 'number' && obj.size > 0) return obj.size;
        try { return JSON.stringify(obj).length * 2; } catch (_) { return 64; }
    }

    function _estimateArrSize(arr) {
        if (!arr || !Array.isArray(arr)) return 0;
        return arr.reduce((s, o) => s + _estimateObjSize(o), 0);
    }

    function _patchIdb() {
        if (_idbPatched) return;
        if (typeof idbPut !== 'function') return;
        _idbPatched = true;

        _origIdb.put          = window.idbPut;
        _origIdb.add          = window.idbAdd;
        _origIdb.get          = window.idbGet;
        _origIdb.getAll       = window.idbGetAll;
        _origIdb.getAllByIndex = window.idbGetAllByIndex;

        window.idbPut = function (obj) {
            _ioWriteAccum += _estimateObjSize(obj);
            return _origIdb.put(obj);
        };
        window.idbAdd = function (obj) {
            _ioWriteAccum += _estimateObjSize(obj);
            return _origIdb.add(obj);
        };
        window.idbGet = function (key) {
            return _origIdb.get(key).then(function (result) {
                _ioReadAccum += _estimateObjSize(result);
                return result;
            });
        };
        window.idbGetAll = function () {
            return _origIdb.getAll().then(function (results) {
                _ioReadAccum += _estimateArrSize(results);
                return results;
            });
        };
        window.idbGetAllByIndex = function (indexName, value) {
            return _origIdb.getAllByIndex(indexName, value).then(function (results) {
                _ioReadAccum += _estimateArrSize(results);
                return results;
            });
        };
    }

    function _unpatchIdb() {
        if (!_idbPatched) return;
        _idbPatched = false;
        if (_origIdb.put)          window.idbPut            = _origIdb.put;
        if (_origIdb.add)          window.idbAdd            = _origIdb.add;
        if (_origIdb.get)          window.idbGet            = _origIdb.get;
        if (_origIdb.getAll)       window.idbGetAll         = _origIdb.getAll;
        if (_origIdb.getAllByIndex) window.idbGetAllByIndex  = _origIdb.getAllByIndex;
    }

    function _startTick(windowId) {
        _stopTick();
        _patchIdb();
        _tickTimer = setInterval(() => _doUpdate(windowId), TICK_MS);
    }

    function _stopTick() {
        if (_tickTimer !== null) { clearInterval(_tickTimer); _tickTimer = null; }
        _unpatchIdb();
    }

    // ── Styles ─────────────────────────────────────────────────

    function _injectStyles() {
        if (document.getElementById('tm-styles')) return;
        const s = document.createElement('style');
        s.id = 'tm-styles';
        s.textContent = `
/* ── Task Manager shell ── */
.tm-root {
    display: flex;
    flex-direction: column;
    height: calc(100% - var(--titlebar-height, 25px));
    background: var(--sidebar-bg, #1e1e1e);
    font-family: var(--font-ui, system-ui);
    font-size: var(--font-size-ui, 13px);
    color: var(--sidebar-item-color, #ddd);
    overflow: hidden;
    user-select: none;
}

/* ── Tabs ── */
.tm-tabs {
    display: flex;
    align-items: flex-end;
    background: var(--toolbar-bg, #1e1e1e);
    border-bottom: 1px solid var(--toolbar-border, #333);
    padding: 0 8px;
    flex-shrink: 0;
}
.tm-tab {
    padding: 7px 18px 6px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--sidebar-section-color, #888);
    cursor: pointer;
    font-size: var(--font-size-ui, 13px);
    font-family: inherit;
    transition: color 0.15s, border-color 0.15s;
    margin-bottom: -1px;
    outline: none;
}
.tm-tab:hover  { color: var(--titlebar-color, #eee); }
.tm-tab.active { color: var(--titlebar-color, #fff); border-bottom-color: #3b82f6; }

.tm-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

/* ── Performance tab layout ── */
.tm-perf-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 14px;
    overflow-y: auto;
    height: 100%;
    box-sizing: border-box;
    align-content: start;
}
.tm-perf-card {
    background: var(--panel-bg, #252525);
    border: 1px solid var(--toolbar-border, #333);
    border-radius: 6px;
    padding: 12px 14px;
}
.tm-perf-card-wide { grid-column: 1 / -1; }

.tm-perf-card-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 10px;
}
.tm-perf-label {
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--sidebar-section-color, #888);
}
.tm-perf-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--titlebar-color, #eee);
    font-variant-numeric: tabular-nums;
}
.tm-perf-disk-legend {
    font-size: 11px;
    color: var(--sidebar-section-color, #888);
    display: flex;
    align-items: center;
    gap: 6px;
}
.tm-legend-dot {
    display: inline-block;
    width: 10px; height: 3px;
    border-radius: 2px;
}
.tm-legend-rd { background: #f59e0b; }
.tm-legend-wr { background: #ef4444; }

.tm-sparkline {
    display: block;
    width: 100% !important;
    border-radius: 4px;
    background: var(--toolbar-address-bg, #111);
    border: 1px solid var(--toolbar-border, #2a2a2a);
    margin-bottom: 8px;
}
.tm-sparkline-wide { height: 60px !important; }

.tm-bar-track {
    height: 5px;
    background: var(--toolbar-address-bg, #111);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 6px;
}
.tm-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
}
.tm-bar-cpu { background: #3b82f6; }
.tm-bar-mem { background: #10b981; }

.tm-perf-meta {
    font-size: 11px;
    color: var(--sidebar-section-color, #666);
}

.tm-disk-row {
    display: flex;
    gap: 28px;
    margin-top: 8px;
    flex-wrap: wrap;
    align-items: flex-start;
}
.tm-disk-stat { display: flex; flex-direction: column; gap: 2px; }
.tm-disk-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--sidebar-section-color, #666);
}
.tm-disk-val {
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--titlebar-color, #eee);
}
.tm-disk-rd { color: #f59e0b; }
.tm-disk-wr { color: #ef4444; }

/* ── Processes tab ── */
.tm-proc-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 12px;
    background: var(--toolbar-bg, #1e1e1e);
    border-bottom: 1px solid var(--toolbar-border, #333);
    flex-shrink: 0;
}
.tm-proc-search {
    flex: 1;
    background: var(--toolbar-address-bg, #111);
    border: 1px solid var(--toolbar-border, #333);
    border-radius: 4px;
    color: var(--toolbar-address-color, #eee);
    padding: 4px 9px;
    font-size: 12px;
    font-family: inherit;
    outline: none;
}
.tm-proc-search:focus { border-color: #3b82f6; }
.tm-proc-count {
    font-size: 11px;
    color: var(--sidebar-section-color, #666);
    white-space: nowrap;
    min-width: 80px;
    text-align: right;
}

.tm-table-wrap {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
}
.tm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
}
.tm-th {
    position: sticky;
    top: 0;
    background: var(--toolbar-bg, #1e1e1e);
    padding: 7px 10px;
    text-align: left;
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--sidebar-section-color, #888);
    border-bottom: 1px solid var(--toolbar-border, #333);
    z-index: 1;
}
.tm-sortable { cursor: pointer; }
.tm-sortable:hover { color: var(--titlebar-color, #eee); }
.tm-th-name { width: 40%; }

.tm-row { border-bottom: 1px solid rgba(255,255,255,0.04); }
.tm-row:hover { background: var(--sidebar-item-hover, rgba(255,255,255,0.06)); }
.tm-row-sys { opacity: 0.7; }

.tm-td {
    padding: 5px 10px;
    vertical-align: middle;
    color: var(--sidebar-item-color, #ccc);
}
.tm-td-name {
    display: flex;
    align-items: center;
    gap: 7px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 200px;
}
.tm-td-num { min-width: 80px; }

.tm-proc-dot {
    display: inline-block;
    width: 6px; height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}
.tm-proc-dot-usr { background: #3b82f6; }
.tm-proc-dot-sys { background: var(--sidebar-section-color, #555); }

.tm-mini-bar {
    height: 3px;
    background: rgba(255,255,255,0.08);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 2px;
}
.tm-mini-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
}
.tm-mini-cpu { background: #3b82f6; }
.tm-mini-mem { background: #10b981; }

.tm-stat-num {
    font-size: 11px;
    color: var(--sidebar-item-color, #aaa);
    font-variant-numeric: tabular-nums;
}
.tm-status-run {
    font-size: 11px;
    color: #4ade80;
}
.tm-end-btn {
    background: rgba(127,29,29,0.6);
    border: 1px solid rgba(239,68,68,0.5);
    color: #fca5a5;
    border-radius: 4px;
    padding: 3px 9px;
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    white-space: nowrap;
}
.tm-end-btn:hover {
    background: rgba(153,27,27,0.8);
    border-color: #ef4444;
}
.tm-protected {
    font-size: 11px;
    color: var(--sidebar-section-color, #555);
}
        `;
        document.head.appendChild(s);
    }

    // ── spawnTaskManager ───────────────────────────────────────

    function spawnTaskManager() {
        // Raise existing window instead of opening a second one
        if (_tmWindowId && windows[_tmWindowId]) {
            if (windows[_tmWindowId].el.style.display === 'none') {
                windows[_tmWindowId].el.style.display = 'block';
            }
            focusWindow(_tmWindowId);
            return _tmWindowId;
        }

        _injectStyles();
        _uptimeStart = Date.now();

        const windowId = 'win_' + (++winCount);
        const offset   = (winCount - 1) * 28;
        const { w: _tmW, h: _tmH } = _clampWinSize(750, 500);
        const left     = Math.min(120 + offset, window.innerWidth  - _tmW);
        const top      = Math.min( 60 + offset, window.innerHeight - _tmH);

        const win = document.createElement('div');
        win.className = 'app-window';
        win.id = windowId;
        win.style.cssText = `left:${left}px;top:${top}px;width:${_tmW}px;height:${_tmH}px;`;
        win.addEventListener('mousedown', () => focusWindow(windowId));

        win.innerHTML = `
            <div class="title-bar" data-winid="${windowId}">
                <button class="window-close-button"   title="Close">✕</button>
                <button class="window-minimize-button" title="Minimize">—</button>
                <button class="window-maximize-button" title="Maximize">□</button>
                <span class="title-bar-text">Task Manager</span>
            </div>
            <div class="tm-root" id="tm-root-${windowId}">
                <div class="tm-tabs" id="tm-tabs-${windowId}">
                    <button class="tm-tab active" data-tab="performance">Performance</button>
                    <button class="tm-tab"        data-tab="processes">Processes</button>
                </div>
                <div class="tm-body" id="tm-body-${windowId}"></div>
            </div>
        `;

        document.getElementById('windowContainer').appendChild(win);
        _tmWindowId = windowId;
        windows[windowId] = { el: win, state: { type: 'taskmanager' } };

        // Drag
        win.querySelector('.title-bar').addEventListener('mousedown', e => {
            if (e.target.closest('button')) return;
            startDrag(e, win);
        });

        // Window control buttons
        win.querySelector('.window-close-button').onclick = () => {
            _stopTick();
            _tmWindowId = null;
            closeWindow(windowId);
        };
        win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);
        win.querySelector('.window-maximize-button').onclick = () => maximizeWindow(windowId);

        // Taskbar button
        const tbBtn = document.createElement('button');
        tbBtn.className = 'win-btn';
        tbBtn.dataset.winid = windowId;
        tbBtn.textContent = 'Task Manager';
        tbBtn.onclick = () => {
            if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); }
            else focusWindow(windowId);
        };
        tbBtn.oncontextmenu = ev => {
            ev.preventDefault();
            buildMenu(ev.clientX, ev.clientY, [
                { label: 'Close', icon: 'delete', action: () => {
                    _stopTick(); _tmWindowId = null; closeWindow(windowId);
                }}
            ]);
        };
        document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));
        windows[windowId].taskbarBtn = tbBtn;

        // Tab switching
        const tabsEl = win.querySelector(`#tm-tabs-${windowId}`);
        const bodyEl = win.querySelector(`#tm-body-${windowId}`);

        tabsEl.querySelectorAll('.tm-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tabsEl.querySelectorAll('.tm-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                _activeTab = tab.dataset.tab;
                if (_activeTab === 'performance') {
                    _renderPerformanceTab(bodyEl, windowId);
                } else {
                    _renderProcessesTab(bodyEl, windowId);
                }
            });
        });

        // Initial render
        _tick();
        _renderPerformanceTab(bodyEl, windowId);
        _startTick(windowId);
        focusWindow(windowId);

        return windowId;
    }

    // ── Expose globally ────────────────────────────────────────

    window.spawnTaskManager = spawnTaskManager;

    // Register in the start menu (startmenu.js exposes registerStartMenuApp)
    if (typeof window.registerStartMenuApp === 'function') {
        window.registerStartMenuApp({
            name: 'Task Manager',
            icon: '/usr/share/icons/32/settings.png',
            emoji: '📊',
            categories: ['all', 'system'],
            action: () => spawnTaskManager(),
        });
    } else {
        // Start menu may not have loaded yet — wait for it
        window.addEventListener('load', () => {
            if (typeof window.registerStartMenuApp === 'function') {
                window.registerStartMenuApp({
                    name: 'Task Manager',
                    icon: '/usr/share/icons/32/settings.png',
                    emoji: '📊',
                    categories: ['all', 'system'],
                    action: () => spawnTaskManager(),
                });
            }
        });
    }

})();
