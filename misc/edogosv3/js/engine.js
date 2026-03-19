/* ============================================================
   E-Dog OS — Game Engine  (js/engine.js)
   Add to index.html after paint.js:
   <script src="js/engine.js"></script>
   And add "E-Dog Engine" to the start menu tiles.
============================================================ */

; (function injectEngineStyles() {
    if (document.getElementById('edog-engine-styles')) return;
    const s = document.createElement('style');
    s.id = 'edog-engine-styles';
    s.textContent = `
    /* ====================== EDITOR SHELL ====================== */
    .ege-root {
        display: flex; flex-direction: column; height: 100%;
        background: #0e0e10; color: #c8c8d0;
        font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 12px; overflow: hidden; user-select: none;
    }

    /* ---- Menubar ---- */
    .ege-menubar {
        display: flex; align-items: center; gap: 1px;
        padding: 0 8px; height: 36px; background: #0a0a0c;
        border-bottom: 1px solid #1a1a20; flex-shrink: 0;
    }
    .ege-menu-btn {
        padding: 5px 11px; border-radius: 5px; border: none;
        background: transparent; color: #888; cursor: pointer;
        font-size: 11.5px; font-family: inherit;
        transition: background .1s, color .1s;
    }
    .ege-menu-btn:hover { background: #1a1a22; color: #e0e0e8; }
    .ege-menu-btn.accent { color: #4ade80; }
    .ege-menu-btn.accent:hover { background: #0a2a14; color: #6effa0; }
    .ege-menu-btn.danger { color: #f87171; }
    .ege-menu-btn.stop { color: #f87171; display: none; }
    .ege-menu-btn.stop.visible { display: block; }
    .ege-menu-sep { width: 1px; height: 18px; background: #1e1e28; margin: 0 4px; }
    .ege-title-badge {
        margin-left: auto; font-size: 10px; color: #333;
        letter-spacing: .12em; text-transform: uppercase;
    }

    /* ---- Main layout ---- */
    .ege-main { display: flex; flex: 1; overflow: hidden; }

    /* ---- Hierarchy (left panel) ---- */
    .ege-hierarchy {
        width: 188px; min-width: 188px; background: #0c0c0f;
        border-right: 1px solid #1a1a20; display: flex;
        flex-direction: column; overflow: hidden; flex-shrink: 0;
    }
    .ege-panel-header {
        padding: 6px 10px; font-size: 10px; font-weight: 700;
        letter-spacing: .1em; text-transform: uppercase; color: #3a3a50;
        background: #0a0a0d; border-bottom: 1px solid #141418;
        display: flex; align-items: center; justify-content: space-between;
    }
    .ege-panel-header-btn {
        width: 18px; height: 18px; border-radius: 3px; border: none;
        background: transparent; color: #3a3a50; cursor: pointer;
        font-size: 14px; line-height: 1; display: flex;
        align-items: center; justify-content: center; padding: 0;
        transition: background .1s, color .1s;
    }
    .ege-panel-header-btn:hover { background: #1a1a24; color: #88c; }
    .ege-hierarchy-list { flex: 1; overflow-y: auto; padding: 4px 0; }
    .ege-entity-row {
        display: flex; align-items: center; gap: 6px;
        padding: 5px 10px; cursor: pointer; border-radius: 4px;
        margin: 1px 4px; transition: background .1s;
        font-size: 11.5px;
    }
    .ege-entity-row:hover { background: #14141c; }
    .ege-entity-row.selected { background: #0d2a4a; color: #7dd3fc; }
    .ege-entity-dot {
        width: 6px; height: 6px; border-radius: 50%;
        flex-shrink: 0; background: #2a2a40;
    }
    .ege-entity-row.selected .ege-entity-dot { background: #3b82f6; }
    .ege-entity-row.inactive { opacity: .4; }
    .ege-entity-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ege-hierarchy-footer {
        padding: 6px 8px; border-top: 1px solid #141418;
        display: flex; gap: 4px;
    }
    .ege-small-btn {
        flex: 1; padding: 4px 0; border-radius: 4px; border: 1px solid #1e1e28;
        background: #111116; color: #666; cursor: pointer; font-family: inherit;
        font-size: 10.5px; text-align: center; transition: background .1s, color .1s, border-color .1s;
    }
    .ege-small-btn:hover { background: #1a1a24; color: #aaa; border-color: #2a2a38; }

    /* ---- Viewport (center) ---- */
    .ege-viewport-wrap {
        flex: 1; display: flex; flex-direction: column; overflow: hidden;
        background: #0e0e12;
    }
    .ege-viewport-toolbar {
        display: flex; align-items: center; gap: 4px; padding: 4px 8px;
        background: #0c0c10; border-bottom: 1px solid #1a1a20; flex-shrink: 0;
        font-size: 10.5px; color: #444;
    }
    .ege-viewport-canvas { flex: 1; display: block; cursor: crosshair; }

    /* ---- Inspector (right panel) ---- */
    .ege-inspector {
        width: 220px; min-width: 220px; background: #0c0c0f;
        border-left: 1px solid #1a1a20; display: flex;
        flex-direction: column; overflow: hidden; flex-shrink: 0;
    }
    .ege-inspector-body { flex: 1; overflow-y: auto; }
    .ege-comp-block { border-bottom: 1px solid #141418; }
    .ege-comp-header {
        display: flex; align-items: center; gap: 6px;
        padding: 6px 8px; cursor: pointer; background: #0e0e14;
        transition: background .1s;
    }
    .ege-comp-header:hover { background: #12121a; }
    .ege-comp-name {
        flex: 1; font-size: 10.5px; font-weight: 700;
        letter-spacing: .06em; text-transform: uppercase; color: #556;
    }
    .ege-comp-remove {
        width: 16px; height: 16px; border-radius: 3px; border: none;
        background: transparent; color: #3a3a50; cursor: pointer;
        font-size: 10px; padding: 0; display: flex;
        align-items: center; justify-content: center;
        transition: background .1s, color .1s;
    }
    .ege-comp-remove:hover { background: #3a1010; color: #f87171; }
    .ege-comp-body { padding: 6px 8px 10px; display: flex; flex-direction: column; gap: 5px; }
    .ege-field { display: flex; align-items: center; gap: 6px; }
    .ege-field-label { width: 72px; min-width: 72px; color: #445; font-size: 10.5px; text-align: right; }
    .ege-field input[type=number], .ege-field input[type=text], .ege-field select, .ege-field textarea {
        flex: 1; background: #0a0a0e; border: 1px solid #1e1e28; border-radius: 4px;
        color: #aac; padding: 3px 6px; font-size: 11px; font-family: inherit;
        outline: none; transition: border-color .1s;
    }
    .ege-field input:focus, .ege-field select:focus, .ege-field textarea:focus {
        border-color: #3b82f6;
    }
    .ege-field input[type=color] {
        flex: none; width: 32px; height: 22px; padding: 1px 2px;
        border-radius: 4px; border: 1px solid #1e1e28; background: #0a0a0e;
        cursor: pointer;
    }
    .ege-field input[type=checkbox] { cursor: pointer; }
    .ege-field-row2 { display: flex; gap: 4px; flex: 1; }
    .ege-field-row2 input { flex: 1; min-width: 0; }
    .ege-add-comp-btn {
        margin: 8px; padding: 6px; border-radius: 6px;
        border: 1px dashed #1e1e28; background: transparent;
        color: #3a3a50; cursor: pointer; font-family: inherit; font-size: 11px;
        transition: border-color .1s, color .1s, background .1s; text-align: center;
    }
    .ege-add-comp-btn:hover { border-color: #3b82f6; color: #60a5fa; background: #061020; }
    .ege-entity-name-input {
        width: 100%; background: #0a0a0e; border: 1px solid #1e1e28;
        border-radius: 5px; color: #e0e0f0; padding: 5px 8px;
        font-size: 13px; font-family: inherit; outline: none; box-sizing: border-box;
        margin: 8px; width: calc(100% - 16px); font-weight: 600;
    }
    .ege-entity-name-input:focus { border-color: #3b82f6; }

    /* ---- Bottom tabs (script editor + console) ---- */
    .ege-bottom {
        height: 200px; min-height: 200px; border-top: 1px solid #1a1a20;
        display: flex; flex-direction: column; background: #0a0a0d;
        flex-shrink: 0;
    }
    .ege-tab-bar {
        display: flex; border-bottom: 1px solid #141418; flex-shrink: 0;
    }
    .ege-tab {
        padding: 5px 16px; font-size: 10.5px; color: #445; cursor: pointer;
        border-bottom: 2px solid transparent; transition: color .1s;
        letter-spacing: .05em; text-transform: uppercase;
    }
    .ege-tab:hover { color: #778; }
    .ege-tab.active { color: #60a5fa; border-bottom-color: #3b82f6; }
    .ege-tab-content { flex: 1; overflow: hidden; display: none; }
    .ege-tab-content.active { display: flex; flex-direction: column; }
    .ege-script-editor {
        flex: 1; width: 100%; background: #080810; color: #c8d8f8;
        border: none; outline: none; padding: 10px 14px;
        font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 12px; line-height: 1.6; resize: none; box-sizing: border-box;
        tab-size: 4;
    }
    .ege-console { flex: 1; overflow-y: auto; padding: 6px 10px; }
    .ege-log-line {
        font-size: 11px; padding: 2px 0; border-bottom: 1px solid #111116;
        font-family: inherit; white-space: pre-wrap; word-break: break-all;
    }
    .ege-log-line.log   { color: #8a9bb8; }
    .ege-log-line.warn  { color: #fbbf24; }
    .ege-log-line.error { color: #f87171; }
    .ege-log-line.info  { color: #4ade80; }
    .ege-console-toolbar {
        display: flex; align-items: center; padding: 2px 6px;
        border-bottom: 1px solid #141418; gap: 6px; flex-shrink: 0;
    }

    /* ---- Viewport gizmos ---- */
    .ege-play-overlay {
        position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
        background: rgba(74,222,128,.12); border: 1px solid rgba(74,222,128,.3);
        color: #4ade80; font-size: 10px; padding: 2px 10px; border-radius: 10px;
        letter-spacing: .12em; text-transform: uppercase; pointer-events: none;
    }

    /* ---- Runner window ---- */
    .ege-runner-canvas {
        display: block; width: 100%; height: 100%;
        outline: none; background: #000;
    }

    /* ---- Context menu ---- */
    .ege-ctx {
        position: fixed; background: #0e0e14; border: 1px solid #252530;
        border-radius: 7px; padding: 4px; z-index: 999999;
        box-shadow: 0 8px 32px rgba(0,0,0,.8); min-width: 160px;
    }
    .ege-ctx-item {
        padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11.5px;
        color: #888; transition: background .1s, color .1s; font-family: inherit;
    }
    .ege-ctx-item:hover { background: #1a1a24; color: #e0e0e8; }
    .ege-ctx-item.danger { color: #f87171; }
    .ege-ctx-item.danger:hover { background: #2a1010; }
    .ege-ctx-sep { height: 1px; background: #1a1a24; margin: 3px 0; }

    /* scrollbars */
    .ege-hierarchy-list::-webkit-scrollbar,
    .ege-inspector-body::-webkit-scrollbar,
    .ege-console::-webkit-scrollbar { width: 4px; }
    .ege-hierarchy-list::-webkit-scrollbar-track,
    .ege-inspector-body::-webkit-scrollbar-track,
    .ege-console::-webkit-scrollbar-track { background: transparent; }
    .ege-hierarchy-list::-webkit-scrollbar-thumb,
    .ege-inspector-body::-webkit-scrollbar-thumb,
    .ege-console::-webkit-scrollbar-thumb { background: #1e1e2a; border-radius: 2px; }
    `;
    document.head.appendChild(s);
})();

/* ============================================================
   MATH
============================================================ */
const EMath = {
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    deg2rad: d => d * Math.PI / 180,
    dist: (ax, ay, bx, by) => Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2),
    randInt: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
    randFloat: (a, b) => Math.random() * (b - a) + a,
};

/* ============================================================
   INPUT SYSTEM
============================================================ */
class EInputSystem {
    constructor() {
        this._keys = new Set();
        this._justPressed = new Set();
        this._justReleased = new Set();
        this._mouse = { x: 0, y: 0 };
        this._mouseDown = new Set();
        this._mouseJust = new Set();
        this._attached = false;
    }
    attach(el) {
        if (this._attached) return;
        this._attached = true;
        el.addEventListener('keydown', e => { if (!this._keys.has(e.code)) this._justPressed.add(e.code); this._keys.add(e.code); e.preventDefault(); });
        el.addEventListener('keyup', e => { this._keys.delete(e.code); this._justReleased.add(e.code); });
        el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); this._mouse.x = e.clientX - r.left; this._mouse.y = e.clientY - r.top; });
        el.addEventListener('mousedown', e => { this._mouseDown.add(e.button); this._mouseJust.add(e.button); });
        el.addEventListener('mouseup', e => { this._mouseDown.delete(e.button); });
    }
    keyDown(code) { return this._keys.has(code); }
    keyJustPressed(code) { return this._justPressed.has(code); }
    keyJustReleased(code) { return this._justReleased.has(code); }
    mouseDown(btn = 0) { return this._mouseDown.has(btn); }
    mouseJustPressed(btn = 0) { return this._mouseJust.has(btn); }
    get mouse() { return { ...this._mouse }; }
    _endFrame() { this._justPressed.clear(); this._justReleased.clear(); this._mouseJust.clear(); }
}

/* ============================================================
   AUDIO
============================================================ */
class EAudioSystem {
    constructor() { this._ctx = null; this._bufs = new Map(); }
    _ctx_() { if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)(); return this._ctx; }
    async load(id, arrayBuffer) {
        const buf = await this._ctx_().decodeAudioData(arrayBuffer.slice(0));
        this._bufs.set(id, buf);
    }
    play(id, { volume = 1, loop = false } = {}) {
        const ctx = this._ctx_(), buf = this._bufs.get(id);
        if (!buf) return null;
        const src = ctx.createBufferSource(); src.buffer = buf; src.loop = loop;
        const gain = ctx.createGain(); gain.gain.value = volume;
        src.connect(gain); gain.connect(ctx.destination); src.start(0);
        return src;
    }
    stop(src) { try { src?.stop(); } catch (e) { } }
}

/* ============================================================
   COMPONENTS
============================================================ */
class EComponent {
    constructor(type) { this.type = type; this.entity = null; this.enabled = true; }
    serialize() { return {}; }
    deserialize(d) { if (d.enabled !== undefined) this.enabled = d.enabled; }
}

class TransformComp extends EComponent {
    constructor() { super('Transform'); this.x = 0; this.y = 0; this.rotation = 0; this.scaleX = 1; this.scaleY = 1; }
    serialize() { return { x: this.x, y: this.y, rotation: this.rotation, scaleX: this.scaleX, scaleY: this.scaleY }; }
    deserialize(d) { super.deserialize(d); Object.assign(this, { x: d.x ?? 0, y: d.y ?? 0, rotation: d.rotation ?? 0, scaleX: d.scaleX ?? 1, scaleY: d.scaleY ?? 1 }); }
}

class SpriteRendererComp extends EComponent {
    constructor() { super('SpriteRenderer'); this.shape = 'rect'; this.color = '#4ade80'; this.width = 32; this.height = 32; this.layer = 0; this.opacity = 1; this.strokeColor = ''; this.strokeWidth = 0; }
    serialize() { return { shape: this.shape, color: this.color, width: this.width, height: this.height, layer: this.layer, opacity: this.opacity, strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, enabled: this.enabled }; }
    deserialize(d) { super.deserialize(d); Object.assign(this, { shape: d.shape ?? 'rect', color: d.color ?? '#4ade80', width: d.width ?? 32, height: d.height ?? 32, layer: d.layer ?? 0, opacity: d.opacity ?? 1, strokeColor: d.strokeColor ?? '', strokeWidth: d.strokeWidth ?? 0 }); }
}

class TextRendererComp extends EComponent {
    constructor() { super('TextRenderer'); this.text = 'Hello!'; this.fontSize = 16; this.color = '#ffffff'; this.font = 'monospace'; this.align = 'center'; this.layer = 1; }
    serialize() { return { text: this.text, fontSize: this.fontSize, color: this.color, font: this.font, align: this.align, layer: this.layer, enabled: this.enabled }; }
    deserialize(d) { super.deserialize(d); Object.assign(this, { text: d.text ?? 'Hello!', fontSize: d.fontSize ?? 16, color: d.color ?? '#ffffff', font: d.font ?? 'monospace', align: d.align ?? 'center', layer: d.layer ?? 1 }); }
}

class Rigidbody2DComp extends EComponent {
    constructor() { super('Rigidbody2D'); this.mass = 1; this.useGravity = true; this.restitution = 0.1; this.drag = 0; this.isKinematic = false; this.velocityX = 0; this.velocityY = 0; this._grounded = false; }
    serialize() { return { mass: this.mass, useGravity: this.useGravity, restitution: this.restitution, drag: this.drag, isKinematic: this.isKinematic, enabled: this.enabled }; }
    deserialize(d) { super.deserialize(d); Object.assign(this, { mass: d.mass ?? 1, useGravity: d.useGravity ?? true, restitution: d.restitution ?? 0.1, drag: d.drag ?? 0, isKinematic: d.isKinematic ?? false }); this.velocityX = 0; this.velocityY = 0; }
    addForce(fx, fy) { this.velocityX += fx / this.mass; this.velocityY += fy / this.mass; }
    addImpulse(ix, iy) { this.velocityX += ix; this.velocityY += iy; }
}

class BoxCollider2DComp extends EComponent {
    constructor() { super('BoxCollider2D'); this.width = 32; this.height = 32; this.offsetX = 0; this.offsetY = 0; this.isTrigger = false; this._touching = new Set(); }
    serialize() { return { width: this.width, height: this.height, offsetX: this.offsetX, offsetY: this.offsetY, isTrigger: this.isTrigger, enabled: this.enabled }; }
    deserialize(d) { super.deserialize(d); Object.assign(this, { width: d.width ?? 32, height: d.height ?? 32, offsetX: d.offsetX ?? 0, offsetY: d.offsetY ?? 0, isTrigger: d.isTrigger ?? false }); this._touching = new Set(); }
    bounds(t) { return { l: t.x + this.offsetX - this.width / 2, r: t.x + this.offsetX + this.width / 2, top: t.y + this.offsetY - this.height / 2, bot: t.y + this.offsetY + this.height / 2 }; }
}

class CameraComp extends EComponent {
    constructor() { super('Camera'); this.zoom = 1; this.bgColor = '#1a1a2e'; this.isMain = true; }
    serialize() { return { zoom: this.zoom, bgColor: this.bgColor, isMain: this.isMain, enabled: this.enabled }; }
    deserialize(d) { super.deserialize(d); Object.assign(this, { zoom: d.zoom ?? 1, bgColor: d.bgColor ?? '#1a1a2e', isMain: d.isMain ?? true }); }
}

class ScriptComp extends EComponent {
    constructor() {
        super('Script');
        this.code = `// E-Dog Engine Script
// Available globals: Input, Scene, Audio, Debug, EMath, dt
// 'this' = entity proxy with .transform .rb .sprite .text
//          .getComponent(type) .name

function start() {
    // runs once on play
    Debug.log(this.name + " started!");
}

function update(dt) {
    // runs every frame
    // Example: simple WASD movement
    const speed = 150;
    if (Input.keyDown('ArrowLeft'))  this.transform.x -= speed * dt;
    if (Input.keyDown('ArrowRight')) this.transform.x += speed * dt;
    if (Input.keyDown('ArrowUp'))    this.transform.y -= speed * dt;
    if (Input.keyDown('ArrowDown'))  this.transform.y += speed * dt;
}

function onCollisionEnter(other) {
    // other = { name, id, entity }
    Debug.log(this.name + " hit " + other.name);
}

function onCollisionExit(other) { }
`;
        this._fn = null; this._started = false; this._err = null;
    }
    serialize() { return { code: this.code, enabled: this.enabled }; }
    deserialize(d) { super.deserialize(d); if (d.code) this.code = d.code; this._fn = null; this._started = false; }
}

/* ============================================================
   ENTITY
============================================================ */
const COMP_REGISTRY = {
    Transform: TransformComp, SpriteRenderer: SpriteRendererComp,
    TextRenderer: TextRendererComp, Rigidbody2D: Rigidbody2DComp,
    BoxCollider2D: BoxCollider2DComp, Camera: CameraComp, Script: ScriptComp,
};

class EEntity {
    constructor(id, name) { this.id = id; this.name = name; this.components = {}; this.active = true; this._dead = false; this._scene = null; }
    addComponent(type, data = null) {
        if (this.components[type]) return this.components[type];
        const Cls = COMP_REGISTRY[type]; if (!Cls) return null;
        const c = new Cls(); c.entity = this;
        if (data) c.deserialize(data);
        this.components[type] = c; return c;
    }
    getComponent(type) { return this.components[type] || null; }
    hasComponent(type) { return !!this.components[type]; }
    removeComponent(type) { if (type !== 'Transform') delete this.components[type]; }
    get transform() { return this.components.Transform; }
    serialize() {
        const comps = {};
        for (const [k, v] of Object.entries(this.components)) comps[k] = v.serialize();
        return { id: this.id, name: this.name, active: this.active, components: comps };
    }
    static deserialize(d) {
        const e = new EEntity(d.id || crypto.randomUUID(), d.name || 'Entity');
        e.active = d.active ?? true;
        if (!d.components?.Transform) e.addComponent('Transform');
        for (const [k, v] of Object.entries(d.components || {})) e.addComponent(k, v);
        return e;
    }
    clone() { return EEntity.deserialize(JSON.parse(JSON.stringify(this.serialize()))); }
}

/* ============================================================
   SCENE
============================================================ */
class EScene {
    constructor() { this.name = 'Scene 1'; this.bgColor = '#1a1a2e'; this.gravity = 980; this.entities = []; }
    createEntity(name = 'Entity') {
        const e = new EEntity(crypto.randomUUID(), name);
        e.addComponent('Transform'); e._scene = this; this.entities.push(e); return e;
    }
    findEntity(name) { return this.entities.find(e => e.name === name) || null; }
    removeEntity(id) { this.entities = this.entities.filter(e => e.id !== id); }
    instantiate(nameOrEntity, x = 0, y = 0) {
        const src = typeof nameOrEntity === 'string' ? this.findEntity(nameOrEntity) : nameOrEntity;
        if (!src) return null;
        const e = src.clone(); e.id = crypto.randomUUID(); e.name = src.name + '_clone';
        if (e.transform) { e.transform.x = x; e.transform.y = y; }
        e._scene = this; this.entities.push(e); return e;
    }
    serialize() { return { name: this.name, bgColor: this.bgColor, gravity: this.gravity, entities: this.entities.map(e => e.serialize()) }; }
    static deserialize(d) {
        const s = new EScene();
        s.name = d.name || 'Scene 1'; s.bgColor = d.bgColor || '#1a1a2e'; s.gravity = d.gravity ?? 980;
        s.entities = (d.entities || []).map(EEntity.deserialize);
        s.entities.forEach(e => e._scene = s); return s;
    }
}

/* ============================================================
   PHYSICS SYSTEM
============================================================ */
class EPhysics {
    step(entities, dt, gravity) {
        const collidables = entities.filter(e => e.active && e.hasComponent('BoxCollider2D') && e.transform);
        // Integrate
        for (const e of entities) {
            if (!e.active) continue;
            const rb = e.getComponent('Rigidbody2D'), t = e.transform;
            if (!rb || !t || rb.isKinematic || !rb.enabled) continue;
            if (rb.useGravity) rb.velocityY += gravity * dt;
            if (rb.drag > 0) { rb.velocityX *= Math.pow(1 - rb.drag, dt); }
            t.x += rb.velocityX * dt; t.y += rb.velocityY * dt;
            rb._grounded = false;
        }
        // Collisions (simple AABB sweep, 3 iterations for stability)
        for (let iter = 0; iter < 3; iter++) {
            for (let i = 0; i < collidables.length; i++) {
                for (let j = i + 1; j < collidables.length; j++) {
                    this._resolve(collidables[i], collidables[j]);
                }
            }
        }
    }
    _resolve(ea, eb) {
        const ca = ea.getComponent('BoxCollider2D'), cb = eb.getComponent('BoxCollider2D');
        if (!ca.enabled || !cb.enabled) return;
        const ba = ca.bounds(ea.transform), bb = cb.bounds(eb.transform);
        const ox = Math.min(ba.r, bb.r) - Math.max(ba.l, bb.l);
        const oy = Math.min(ba.bot, bb.bot) - Math.max(ba.top, bb.top);
        if (ox <= 0 || oy <= 0) {
            this._endContact(ea, eb, ca, cb); return;
        }
        const wasA = ca._touching.has(eb.id), wasB = cb._touching.has(ea.id);
        if (!wasA) { ca._touching.add(eb.id); this._fireEvent(ea, 'onCollisionEnter', eb); }
        if (!wasB) { cb._touching.add(ea.id); this._fireEvent(eb, 'onCollisionEnter', ea); }
        if (ca.isTrigger || cb.isTrigger) return;
        const ra = ea.getComponent('Rigidbody2D'), rb = eb.getComponent('Rigidbody2D');
        const aFixed = (!ra || ra.isKinematic), bFixed = (!rb || rb.isKinematic);
        if (aFixed && bFixed) return;
        if (ox < oy) {
            const dir = ea.transform.x < eb.transform.x ? -1 : 1;
            const share = aFixed ? 0 : bFixed ? 1 : 0.5;
            if (!aFixed) { ea.transform.x += dir * ox * share; if (ra) { ra.velocityX = ra.velocityX * -(ra.restitution); } }
            if (!bFixed) { eb.transform.x -= dir * ox * (1 - share); if (rb) { rb.velocityX = rb.velocityX * -(rb.restitution); } }
        } else {
            const dir = ea.transform.y < eb.transform.y ? -1 : 1;
            const share = aFixed ? 0 : bFixed ? 1 : 0.5;
            if (!aFixed) {
                ea.transform.y += dir * oy * share;
                if (ra) {
                    if (dir === -1 && ra.velocityY > 0) { ra.velocityY *= -(ra.restitution); ra._grounded = true; }
                    else if (dir === 1 && ra.velocityY < 0) ra.velocityY *= -(ra.restitution);
                }
            }
            if (!bFixed) {
                eb.transform.y -= dir * oy * (1 - share);
                if (rb) {
                    if (dir === 1 && rb.velocityY > 0) { rb.velocityY *= -(rb.restitution); rb._grounded = true; }
                    else if (dir === -1 && rb.velocityY < 0) rb.velocityY *= -(rb.restitution);
                }
            }
        }
    }
    _endContact(ea, eb, ca, cb) {
        if (ca._touching.has(eb.id)) { ca._touching.delete(eb.id); this._fireEvent(ea, 'onCollisionExit', eb); }
        if (cb._touching.has(ea.id)) { cb._touching.delete(ea.id); this._fireEvent(eb, 'onCollisionExit', ea); }
    }
    _fireEvent(entity, ev, other) {
        const sc = entity.getComponent('Script');
        if (sc && sc._fn && sc._fn[ev]) try { sc._fn[ev].call(sc._self, { name: other.name, id: other.id, entity: other }); } catch (e) { }
    }
}

/* ============================================================
   SCRIPT SYSTEM
============================================================ */
class EScriptSystem {
    constructor() { this.logs = []; }
    _makeDebug() {
        const L = this.logs;
        return {
            log: (...a) => L.push({ t: 'log', msg: a.map(String).join(' '), ts: Date.now() }),
            warn: (...a) => L.push({ t: 'warn', msg: a.map(String).join(' '), ts: Date.now() }),
            error: (...a) => L.push({ t: 'error', msg: a.map(String).join(' '), ts: Date.now() }),
            clear: () => L.length = 0,
        };
    }
    _proxy(entity) {
        return {
            get transform() { return entity.transform; },
            get rb() { return entity.getComponent('Rigidbody2D'); },
            get sprite() { return entity.getComponent('SpriteRenderer'); },
            get text() { return entity.getComponent('TextRenderer'); },
            get name() { return entity.name; },
            get id() { return entity.id; },
            getComponent: t => entity.getComponent(t),
            destroy: () => { entity._dead = true; },
        };
    }
    compile(entity, input, scene, audio) {
        const sc = entity.getComponent('Script'); if (!sc) return;
        const Debug = this._makeDebug();
        const proxy = this._proxy(entity);
        sc._self = proxy;
        try {
            const fn = new Function(
                'Input', 'Scene', 'Audio', 'Debug', 'EMath',
                `"use strict";\n${sc.code}\nreturn {start:typeof start!='undefined'?start:null,update:typeof update!='undefined'?update:null,onCollisionEnter:typeof onCollisionEnter!='undefined'?onCollisionEnter:null,onCollisionExit:typeof onCollisionExit!='undefined'?onCollisionExit:null};`
            );
            sc._fn = fn.call(proxy, input,
                { findEntity: n => scene.findEntity(n), instantiate: (n, x, y) => scene.instantiate(n, x, y), destroy: e => e._dead = true, get entities() { return scene.entities; } },
                audio, Debug, EMath);
            sc._err = null;
        } catch (e) {
            sc._err = e.message;
            this.logs.push({ t: 'error', msg: `[${entity.name}] Compile: ${e.message}`, ts: Date.now() });
        }
    }
    startAll(entities, input, scene, audio) {
        for (const e of entities) {
            if (!e.active) continue;
            const sc = e.getComponent('Script'); if (!sc || !sc.enabled) continue;
            if (!sc._fn) this.compile(e, input, scene, audio);
            if (sc._fn?.start && !sc._started) {
                try { sc._fn.start.call(sc._self); } catch (err) { this.logs.push({ t: 'error', msg: `[${e.name}] start(): ${err.message}`, ts: Date.now() }); }
                sc._started = true;
            }
        }
    }
    updateAll(entities, dt, input, scene, audio) {
        for (const e of entities) {
            if (!e.active || e._dead) continue;
            const sc = e.getComponent('Script'); if (!sc || !sc.enabled) continue;
            if (!sc._fn) this.compile(e, input, scene, audio);
            if (sc._fn?.update) try { sc._fn.update.call(sc._self, dt); } catch (err) { this.logs.push({ t: 'error', msg: `[${e.name}] update(): ${err.message}`, ts: Date.now() }); }
        }
    }
}

/* ============================================================
   RENDERER
============================================================ */
class ERenderer {
    constructor(canvas, ctx) { this.canvas = canvas; this.ctx = ctx; }
    render(entities, cam, editorGrid = false, selectedId = null) {
        const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
        // Background
        const camE = entities.find(e => e.hasComponent('Camera'));
        ctx.fillStyle = camE?.getComponent('Camera')?.bgColor || '#1a1a2e';
        ctx.fillRect(0, 0, W, H);
        // Editor grid
        if (editorGrid) this._drawGrid(ctx, W, H, cam);
        // Sort by layer
        const renderables = entities.filter(e => e.active && (e.hasComponent('SpriteRenderer') || e.hasComponent('TextRenderer')));
        renderables.sort((a, b) => (a.getComponent('SpriteRenderer')?.layer ?? 0) - (b.getComponent('SpriteRenderer')?.layer ?? 0));
        for (const e of renderables) {
            if (!e.transform) continue;
            ctx.save();
            this._applyCam(ctx, W, H, cam);
            const t = e.transform;
            ctx.translate(t.x, t.y);
            ctx.rotate(EMath.deg2rad(t.rotation));
            ctx.scale(t.scaleX, t.scaleY);
            const sr = e.getComponent('SpriteRenderer');
            if (sr?.enabled) {
                ctx.globalAlpha = sr.opacity;
                ctx.fillStyle = sr.color;
                if (sr.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, Math.min(sr.width, sr.height) / 2, 0, Math.PI * 2); ctx.fill(); }
                else if (sr.shape === 'triangle') { const hw = sr.width / 2, h2 = sr.height / 2; ctx.beginPath(); ctx.moveTo(0, -h2); ctx.lineTo(hw, h2); ctx.lineTo(-hw, h2); ctx.closePath(); ctx.fill(); }
                else ctx.fillRect(-sr.width / 2, -sr.height / 2, sr.width, sr.height);
                if (sr.strokeWidth > 0 && sr.strokeColor) { ctx.strokeStyle = sr.strokeColor; ctx.lineWidth = sr.strokeWidth; if (sr.shape === 'rect') ctx.strokeRect(-sr.width / 2, -sr.height / 2, sr.width, sr.height); else ctx.stroke(); }
                ctx.globalAlpha = 1;
            }
            const tr = e.getComponent('TextRenderer');
            if (tr?.enabled) { ctx.fillStyle = tr.color; ctx.font = `${tr.fontSize}px ${tr.font}`; ctx.textAlign = tr.align; ctx.textBaseline = 'middle'; ctx.fillText(tr.text, 0, 0); }
            ctx.restore();
            // Editor: selection highlight + label
            if (editorGrid) {
                const sr2 = e.getComponent('SpriteRenderer');
                const w = sr2?.width ?? 32, h2 = sr2?.height ?? 32;
                ctx.save();
                this._applyCam(ctx, W, H, cam);
                ctx.translate(t.x, t.y);
                if (e.id === selectedId) {
                    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2 / cam.zoom; ctx.setLineDash([4 / cam.zoom, 3 / cam.zoom]);
                    ctx.strokeRect(-w / 2 - 3 / cam.zoom, -h2 / 2 - 3 / cam.zoom, w + 6 / cam.zoom, h2 + 6 / cam.zoom);
                    ctx.setLineDash([]);
                } else {
                    ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1 / cam.zoom;
                    ctx.strokeRect(-w / 2, -h2 / 2, w, h2);
                }
                ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = `${10 / cam.zoom}px monospace`;
                ctx.textAlign = 'left'; ctx.textBaseline = 'top';
                ctx.fillText(e.name, -w / 2, h2 / 2 + 3 / cam.zoom);
                ctx.restore();
            }
        }
        // Collider gizmos in editor
        if (editorGrid) {
            for (const e of entities) {
                if (!e.active) continue;
                const bc = e.getComponent('BoxCollider2D'), t = e.transform;
                if (!bc || !t) continue;
                const b = bc.bounds(t);
                ctx.save(); this._applyCam(ctx, W, H, cam);
                ctx.strokeStyle = bc.isTrigger ? 'rgba(250,204,21,.5)' : 'rgba(74,222,128,.4)';
                ctx.lineWidth = 1 / cam.zoom; ctx.setLineDash([3 / cam.zoom, 3 / cam.zoom]);
                ctx.strokeRect(b.l, b.top, bc.width, bc.height);
                ctx.setLineDash([]); ctx.restore();
            }
        }
    }
    _applyCam(ctx, W, H, cam) {
        ctx.translate(W / 2 - cam.x * cam.zoom, H / 2 - cam.y * cam.zoom);
        ctx.scale(cam.zoom, cam.zoom);
    }
    _drawGrid(ctx, W, H, cam) {
        const step = 32 * cam.zoom;
        const offX = (W / 2 - cam.x * cam.zoom) % step;
        const offY = (H / 2 - cam.y * cam.zoom) % step;
        ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = offX; x < W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
        for (let y = offY; y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
        ctx.stroke();
        // Axes
        const ax = W / 2 - cam.x * cam.zoom, ay = H / 2 - cam.y * cam.zoom;
        ctx.strokeStyle = 'rgba(255,100,100,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(ax, H); ctx.stroke();
        ctx.strokeStyle = 'rgba(100,255,100,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, ay); ctx.lineTo(W, ay); ctx.stroke();
    }
    worldToScreen(wx, wy, W, H, cam) { return { x: W / 2 + (wx - cam.x) * cam.zoom, y: H / 2 + (wy - cam.y) * cam.zoom }; }
    screenToWorld(sx, sy, W, H, cam) { return { x: (sx - W / 2) / cam.zoom + cam.x, y: (sy - H / 2) / cam.zoom + cam.y }; }
}

/* ============================================================
   GAME RUNNER WINDOW
============================================================ */
function spawnGameRunner(sceneData, gameName) {
    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 24;
    const win = document.createElement('div');
    win.className = 'app-window'; win.id = windowId;
    win.style.cssText = `left:${Math.min(120 + offset, window.innerWidth - 660)}px;top:${Math.min(80 + offset, window.innerHeight - 520)}px;width:640px;height:500px;`;
    win.addEventListener('mousedown', () => focusWindow(windowId));
    win.innerHTML = `
        <div class="title-bar">
            <button class="window-close-button" title="Close">✕</button>
            <button class="window-minimize-button" title="Minimize">—</button>
            <span class="title-bar-text">▶ ${gameName || 'Game'}</span>
        </div>
        <div class="app-body" style="height:calc(100% - var(--titlebar-height));overflow:hidden;background:#000;"></div>`;
    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'gamerunner' } };
    win.querySelector('.title-bar').addEventListener('mousedown', e => { if (!e.target.closest('button')) startDrag(e, win); });
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);
    const tbBtn = document.createElement('button'); tbBtn.className = 'win-btn'; tbBtn.dataset.winid = windowId;
    tbBtn.textContent = `▶ ${gameName || 'Game'}`;
    tbBtn.onclick = () => { if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); } else focusWindow(windowId); };
    document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));
    windows[windowId].taskbarBtn = tbBtn;

    const body = win.querySelector('.app-body');
    const canvas = document.createElement('canvas'); canvas.className = 'ege-runner-canvas';
    canvas.width = 640; canvas.height = 458; canvas.setAttribute('tabindex', '0');
    body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const scene = EScene.deserialize(JSON.parse(JSON.stringify(sceneData)));
    const input = new EInputSystem(); input.attach(canvas);
    const audio = new EAudioSystem();
    const physics = new EPhysics();
    const renderer = new ERenderer(canvas, ctx);
    const scripts = new EScriptSystem();
    const camView = { x: 0, y: 0, zoom: 1 };

    // Pre-load audio assets from VFS (async)
    (async () => {
        for (const e of scene.entities) {
            // future: load audio assets here
        }
        scripts.startAll(scene.entities, input, scene, audio);
    })();

    let last = performance.now(), raf = null, running = true;
    function loop(now) {
        if (!running) return;
        const dt = Math.min((now - last) / 1000, .05); last = now;
        // Sync camera
        const camE = scene.entities.find(e => e.hasComponent('Camera') && e.getComponent('Camera').isMain);
        if (camE?.transform) { const cc = camE.getComponent('Camera'); camView.x = camE.transform.x; camView.y = camE.transform.y; camView.zoom = cc.zoom; }
        // Tick
        scripts.updateAll(scene.entities, dt, input, scene, audio);
        physics.step(scene.entities, dt, scene.gravity);
        scene.entities = scene.entities.filter(e => !e._dead);
        input._endFrame();
        renderer.render(scene.entities, camView, false, null);
        // Console overlay
        if (scripts.logs.length > 0) {
            const recent = scripts.logs.slice(-4);
            ctx.save(); ctx.font = '11px monospace';
            recent.forEach((l, i) => {
                const y = canvas.height - 8 - (recent.length - 1 - i) * 15;
                ctx.fillStyle = l.t === 'error' ? 'rgba(248,113,113,.9)' : l.t === 'warn' ? 'rgba(251,191,36,.9)' : 'rgba(200,200,220,.6)';
                ctx.fillText(l.msg.slice(0, 90), 8, y);
            });
            ctx.restore();
        }
        raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    canvas.focus();
    const obs = new MutationObserver(() => { if (!document.contains(win)) { running = false; cancelAnimationFrame(raf); obs.disconnect(); } });
    obs.observe(document.getElementById('windowContainer'), { childList: true, subtree: true });
    focusWindow(windowId);
    return windowId;
}

/* ============================================================
   GAME EDITOR
============================================================ */
function spawnGameEngine(fileItem) {
    const windowId = 'win_' + (++winCount);
    const offset = (winCount - 1) * 24;
    const win = document.createElement('div');
    win.className = 'app-window'; win.id = windowId;
    win.style.cssText = `left:${Math.min(40 + offset, window.innerWidth - 1100)}px;top:${Math.min(30 + offset, window.innerHeight - 720)}px;width:1080px;height:700px;`;
    win.addEventListener('mousedown', () => focusWindow(windowId));
    win.innerHTML = `
        <div class="title-bar">
            <button class="window-close-button" title="Close">✕</button>
            <button class="window-minimize-button" title="Minimize">—</button>
            <span class="title-bar-text">⚙ E-Dog Engine</span>
        </div>
        <div class="app-body" style="height:calc(100% - var(--titlebar-height));overflow:hidden;display:flex;flex-direction:column;"></div>`;
    document.getElementById('windowContainer').appendChild(win);
    windows[windowId] = { el: win, state: { type: 'engine' } };
    win.querySelector('.title-bar').addEventListener('mousedown', e => { if (!e.target.closest('button')) startDrag(e, win); });
    win.querySelector('.window-close-button').onclick = () => closeWindow(windowId);
    win.querySelector('.window-minimize-button').onclick = () => minimizeWindow(windowId);
    const tbBtn = document.createElement('button'); tbBtn.className = 'win-btn'; tbBtn.dataset.winid = windowId;
    tbBtn.innerHTML = '⚙ E-Dog Engine';
    tbBtn.onclick = () => { if (win.style.display === 'none') { win.style.display = 'block'; focusWindow(windowId); } else focusWindow(windowId); };
    document.getElementById('taskbar').insertBefore(tbBtn, document.getElementById('taskbar-tray'));
    windows[windowId].taskbarBtn = tbBtn;

    const body = win.querySelector('.app-body');
    // Load or create scene
    let scene = new EScene();
    if (fileItem?.content) {
        try {
            const text = fileItem.content instanceof ArrayBuffer ? new TextDecoder().decode(fileItem.content) : String(fileItem.content);
            scene = EScene.deserialize(JSON.parse(text));
        } catch (e) { console.error('Failed to load scene', e); }
    }
    // Add a default camera entity if none
    if (!scene.entities.find(e => e.hasComponent('Camera'))) {
        const cam = scene.createEntity('Main Camera'); cam.addComponent('Camera'); cam.addComponent('SpriteRenderer', { shape: 'circle', color: 'rgba(100,150,255,0.3)', width: 20, height: 20, layer: -1 });
    }

    let selectedId = scene.entities[0]?.id || null;
    let runnerWindowId = null;
    const consoleLogs = [];
    let activeBottomTab = 'script';
    const editorCam = { x: 0, y: 0, zoom: 1 };
    let isPanning = false, panStart = { x: 0, y: 0 }, camAtPan = { x: 0, y: 0 };
    let isDraggingEntity = false, dragOffset = { x: 0, y: 0 };

    /* ---- Build DOM ---- */
    const root = document.createElement('div'); root.className = 'ege-root'; body.appendChild(root);

    // Menubar
    const menubar = document.createElement('div'); menubar.className = 'ege-menubar'; root.appendChild(menubar);
    function mBtn(label, cls, handler) { const b = document.createElement('button'); b.className = 'ege-menu-btn ' + cls; b.textContent = label; b.onclick = handler; menubar.appendChild(b); return b; }
    function mSep() { const s = document.createElement('div'); s.className = 'ege-menu-sep'; menubar.appendChild(s); }

    mBtn('New Entity', '', () => { const e = scene.createEntity('Entity_' + (scene.entities.length + 1)); e.addComponent('SpriteRenderer'); selectedId = e.id; rebuildHierarchy(); rebuildInspector(); });
    mBtn('Add Camera', '', () => { const e = scene.createEntity('Camera'); e.addComponent('Camera'); e.addComponent('SpriteRenderer', { shape: 'circle', color: 'rgba(100,150,255,0.3)', width: 20, height: 20 }); selectedId = e.id; rebuildHierarchy(); rebuildInspector(); });
    mSep();
    const playBtn = mBtn('▶  Play', 'accent', () => { if (!runnerWindowId || !windows[runnerWindowId]) { runnerWindowId = spawnGameRunner(scene.serialize(), scene.name); stopBtn.classList.add('visible'); } });
    const stopBtn = mBtn('■  Stop', 'stop', () => { if (runnerWindowId && windows[runnerWindowId]) { closeWindow(runnerWindowId); runnerWindowId = null; } stopBtn.classList.remove('visible'); });
    mSep();
    mBtn('Save .egame', '', async () => {
        const json = JSON.stringify(scene.serialize(), null, 2);
        const ab = new TextEncoder().encode(json).buffer;
        const name = scene.name.replace(/[^a-zA-Z0-9_\- ]/g, '') + '.egame';
        const username = getUsername();
        const docPath = `/home/${username}/Documents`;
        // Navigate to docs and save
        const parts = docPath.split('/').filter(Boolean); let parentId = 'root';
        for (const p of parts) { const kids = await idbGetAllByIndex('parentId', parentId); const m = kids.find(n => n.name === p && n.type === 'folder'); if (m) parentId = m.id; }
        const existing = (await idbGetAllByIndex('parentId', parentId)).find(n => n.name === name && n.type === 'file');
        if (existing) { existing.content = ab; existing.size = ab.byteLength; existing.mime = 'application/json'; existing.updatedAt = Date.now(); await idbPut(existing); }
        else { await idbAdd({ id: crypto.randomUUID(), name, type: 'file', parentId, content: ab, size: ab.byteLength, mime: 'application/json', createdAt: Date.now(), updatedAt: Date.now() }); }
        await renderAllWindows();
        consoleLogs.push({ t: 'info', msg: `Saved "${name}" to Documents`, ts: Date.now() }); rebuildConsole();
    });
    mBtn('Clear Scene', 'danger', () => { if (confirm('Clear all entities?')) { scene.entities = []; selectedId = null; rebuildHierarchy(); rebuildInspector(); } });
    const badge = document.createElement('span'); badge.className = 'ege-title-badge'; badge.textContent = 'E-Dog Engine v1.0'; menubar.appendChild(badge);

    // Main area
    const main = document.createElement('div'); main.className = 'ege-main'; root.appendChild(main);

    // ---- Hierarchy panel ----
    const hierarchy = document.createElement('div'); hierarchy.className = 'ege-hierarchy'; main.appendChild(hierarchy);
    const hHeader = document.createElement('div'); hHeader.className = 'ege-panel-header'; hHeader.textContent = 'Hierarchy';
    const hAddBtn = document.createElement('button'); hAddBtn.className = 'ege-panel-header-btn'; hAddBtn.title = 'Add entity'; hAddBtn.textContent = '+';
    hAddBtn.onclick = () => { const e = scene.createEntity('Entity_' + (scene.entities.length + 1)); e.addComponent('SpriteRenderer'); selectedId = e.id; rebuildHierarchy(); rebuildInspector(); };
    hHeader.appendChild(hAddBtn); hierarchy.appendChild(hHeader);
    const hList = document.createElement('div'); hList.className = 'ege-hierarchy-list'; hierarchy.appendChild(hList);
    const hFooter = document.createElement('div'); hFooter.className = 'ege-hierarchy-footer';
    ['+ Sprite', '+ Physics', '+ Script'].forEach((label, i) => {
        const b = document.createElement('button'); b.className = 'ege-small-btn'; b.textContent = label;
        b.onclick = () => {
            const e = scene.createEntity(['Sprite', 'RigidBody', 'ScriptObj'][i]);
            e.addComponent('SpriteRenderer', { color: ['#f472b6', '#fb923c', '#a78bfa'][i] });
            if (i === 1) { e.addComponent('Rigidbody2D'); e.addComponent('BoxCollider2D', { width: 32, height: 32 }); }
            if (i === 2) { e.addComponent('Script'); }
            selectedId = e.id; rebuildHierarchy(); rebuildInspector();
        };
        hFooter.appendChild(b);
    });
    hierarchy.appendChild(hFooter);

    function rebuildHierarchy() {
        hList.innerHTML = '';
        for (const e of scene.entities) {
            const row = document.createElement('div');
            row.className = 'ege-entity-row' + (e.id === selectedId ? ' selected' : '') + (e.active ? '' : ' inactive');
            row.dataset.id = e.id;
            const dot = document.createElement('div'); dot.className = 'ege-entity-dot'; row.appendChild(dot);
            const name = document.createElement('span'); name.className = 'ege-entity-name'; name.textContent = e.name; row.appendChild(name);
            row.onclick = () => { selectedId = e.id; rebuildHierarchy(); rebuildInspector(); };
            row.ondblclick = () => {
                const input_ = document.createElement('input'); input_.type = 'text'; input_.value = e.name;
                input_.style.cssText = 'flex:1;background:#0a0a12;border:1px solid #3b82f6;border-radius:3px;color:#7dd3fc;padding:1px 4px;font:inherit;outline:none;';
                name.replaceWith(input_); input_.focus(); input_.select();
                input_.onblur = () => { e.name = input_.value.trim() || e.name; rebuildHierarchy(); rebuildInspector(); };
                input_.onkeydown = e_ => { if (e_.key === 'Enter') input_.blur(); e_.stopPropagation(); };
            };
            row.oncontextmenu = ev => { ev.preventDefault(); showEntityCtx(ev.clientX, ev.clientY, e); };
            hList.appendChild(row);
        }
    }

    function showEntityCtx(x, y, e) {
        document.querySelectorAll('.ege-ctx').forEach(m => m.remove());
        const menu = document.createElement('div'); menu.className = 'ege-ctx';
        menu.style.left = x + 'px'; menu.style.top = y + 'px';
        const items = [
            { l: 'Duplicate', fn: () => { const c = e.clone(); c.id = crypto.randomUUID(); c.name = e.name + '_copy'; if (c.transform) { c.transform.x += 20; c.transform.y += 20; } scene.entities.push(c); selectedId = c.id; rebuildHierarchy(); rebuildInspector(); } },
            { l: e.active ? 'Disable' : 'Enable', fn: () => { e.active = !e.active; rebuildHierarchy(); } },
            null,
            { l: 'Delete', danger: true, fn: () => { scene.removeEntity(e.id); if (selectedId === e.id) selectedId = null; rebuildHierarchy(); rebuildInspector(); } },
        ];
        items.forEach(item => {
            if (!item) { const sep = document.createElement('div'); sep.className = 'ege-ctx-sep'; menu.appendChild(sep); return; }
            const d = document.createElement('div'); d.className = 'ege-ctx-item' + (item.danger ? ' danger' : '');
            d.textContent = item.l; d.onmousedown = ev => { ev.stopPropagation(); menu.remove(); item.fn(); }; menu.appendChild(d);
        });
        document.body.appendChild(menu);
        requestAnimationFrame(() => { const r = menu.getBoundingClientRect(); if (r.right > window.innerWidth) menu.style.left = (window.innerWidth - r.width - 8) + 'px'; if (r.bottom > window.innerHeight - 44) menu.style.top = (window.innerHeight - 44 - r.height - 8) + 'px'; });
        setTimeout(() => window.addEventListener('mousedown', function h(ev) { if (!menu.contains(ev.target)) menu.remove(); window.removeEventListener('mousedown', h); }, { once: false }), 0);
    }

    // ---- Viewport ----
    const vpWrap = document.createElement('div'); vpWrap.className = 'ege-viewport-wrap'; vpWrap.style.position = 'relative'; main.appendChild(vpWrap);
    const vpToolbar = document.createElement('div'); vpToolbar.className = 'ege-viewport-toolbar'; vpWrap.appendChild(vpToolbar);
    vpToolbar.innerHTML = `<span style="color:#2a2a3a">Grid</span><span style="color:#333;margin-left:8px">Scroll=zoom · Mid/Ctrl+drag=pan · Click=select · Drag entity=move</span>`;
    const zoomLabel = document.createElement('span'); zoomLabel.style.cssText = 'margin-left:auto;color:#333;'; zoomLabel.textContent = '100%'; vpToolbar.appendChild(zoomLabel);

    const vpCanvas = document.createElement('canvas'); vpCanvas.className = 'ege-viewport-canvas';
    vpWrap.appendChild(vpCanvas);
    const vpCtx = vpCanvas.getContext('2d');
    const vpRenderer = new ERenderer(vpCanvas, vpCtx);

    function resizeVP() {
        const r = vpWrap.getBoundingClientRect();
        vpCanvas.width = r.width; vpCanvas.height = r.height - vpToolbar.offsetHeight;
        vpCanvas.style.width = r.width + 'px'; vpCanvas.style.height = (r.height - vpToolbar.offsetHeight) + 'px';
    }
    new ResizeObserver(resizeVP).observe(vpWrap);
    setTimeout(resizeVP, 50);

    // Viewport mouse
    vpCanvas.addEventListener('wheel', e => { e.preventDefault(); const factor = e.deltaY < 0 ? 1.12 : 0.88; editorCam.zoom = EMath.clamp(editorCam.zoom * factor, 0.1, 8); zoomLabel.textContent = Math.round(editorCam.zoom * 100) + '%'; });
    vpCanvas.addEventListener('mousedown', e => {
        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
            isPanning = true; panStart = { x: e.clientX, y: e.clientY }; camAtPan = { x: editorCam.x, y: editorCam.y };
            vpCanvas.style.cursor = 'grabbing'; e.preventDefault(); return;
        }
        if (e.button === 0) {
            const r = vpCanvas.getBoundingClientRect();
            const mx = e.clientX - r.left, my = e.clientY - r.top;
            const { x: wx, y: wy } = vpRenderer.screenToWorld(mx, my, vpCanvas.width, vpCanvas.height, editorCam);
            // Hit test
            let hit = null;
            for (let i = scene.entities.length - 1; i >= 0; i--) {
                const ent = scene.entities[i]; if (!ent.active || !ent.transform) continue;
                const sr = ent.getComponent('SpriteRenderer');
                const w = (sr?.width ?? 32) / 2, h = (sr?.height ?? 32) / 2;
                const t = ent.transform;
                if (wx >= t.x - w && wx <= t.x + w && wy >= t.y - h && wy <= t.y + h) { hit = ent; break; }
            }
            if (hit) {
                selectedId = hit.id; rebuildHierarchy(); rebuildInspector();
                isDraggingEntity = true; dragOffset = { x: wx - hit.transform.x, y: wy - hit.transform.y };
            } else {
                selectedId = null; rebuildHierarchy(); rebuildInspector();
            }
        }
    });
    window.addEventListener('mousemove', e => {
        if (isPanning) {
            editorCam.x = camAtPan.x - (e.clientX - panStart.x) / editorCam.zoom;
            editorCam.y = camAtPan.y - (e.clientY - panStart.y) / editorCam.zoom;
        }
        if (isDraggingEntity && selectedId) {
            const ent = scene.entities.find(e_ => e_.id === selectedId);
            if (ent?.transform) {
                const r = vpCanvas.getBoundingClientRect();
                const mx = e.clientX - r.left, my = e.clientY - r.top;
                const { x: wx, y: wy } = vpRenderer.screenToWorld(mx, my, vpCanvas.width, vpCanvas.height, editorCam);
                ent.transform.x = Math.round((wx - dragOffset.x) / 1) * 1;
                ent.transform.y = Math.round((wy - dragOffset.y) / 1) * 1;
                rebuildInspector();
            }
        }
    });
    window.addEventListener('mouseup', () => { isPanning = false; isDraggingEntity = false; vpCanvas.style.cursor = 'crosshair'; });

    // Editor loop
    let editorRaf = null;
    function editorLoop() {
        if (!document.contains(win)) return;
        vpRenderer.render(scene.entities, editorCam, true, selectedId);
        editorRaf = requestAnimationFrame(editorLoop);
    }
    editorRaf = requestAnimationFrame(editorLoop);
    const editorObs = new MutationObserver(() => { if (!document.contains(win)) { cancelAnimationFrame(editorRaf); editorObs.disconnect(); } });
    editorObs.observe(document.getElementById('windowContainer'), { childList: true, subtree: true });

    // ---- Inspector ----
    const inspector = document.createElement('div'); inspector.className = 'ege-inspector'; main.appendChild(inspector);
    const insHeader = document.createElement('div'); insHeader.className = 'ege-panel-header'; insHeader.textContent = 'Inspector'; inspector.appendChild(insHeader);
    const insBody = document.createElement('div'); insBody.className = 'ege-inspector-body'; inspector.appendChild(insBody);

    function field(label, inputEl) {
        const row = document.createElement('div'); row.className = 'ege-field';
        const lbl = document.createElement('span'); lbl.className = 'ege-field-label'; lbl.textContent = label;
        row.appendChild(lbl); row.appendChild(inputEl); return row;
    }
    function numInput(val, onChange, step = 1) {
        const inp = document.createElement('input'); inp.type = 'number'; inp.value = val; inp.step = step;
        inp.oninput = () => onChange(parseFloat(inp.value) || 0); return inp;
    }
    function textInput(val, onChange) {
        const inp = document.createElement('input'); inp.type = 'text'; inp.value = val;
        inp.oninput = () => onChange(inp.value); return inp;
    }
    function colorInput(val, onChange) {
        const inp = document.createElement('input'); inp.type = 'color'; inp.value = val;
        inp.oninput = () => onChange(inp.value); return inp;
    }
    function checkInput(val, onChange) {
        const inp = document.createElement('input'); inp.type = 'checkbox'; inp.checked = val;
        inp.onchange = () => onChange(inp.checked); return inp;
    }
    function selectInput(val, options, onChange) {
        const sel = document.createElement('select'); sel.value = val;
        options.forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; if (o === val) opt.selected = true; sel.appendChild(opt); });
        sel.onchange = () => onChange(sel.value); return sel;
    }

    function rebuildInspector() {
        insBody.innerHTML = '';
        const ent = selectedId ? scene.entities.find(e => e.id === selectedId) : null;
        if (!ent) { insBody.innerHTML = '<div style="padding:16px;color:#2a2a40;font-size:11px;text-align:center;">No entity selected</div>'; return; }

        // Name
        const nameInp = document.createElement('input'); nameInp.type = 'text'; nameInp.value = ent.name; nameInp.className = 'ege-entity-name-input';
        nameInp.oninput = () => { ent.name = nameInp.value; rebuildHierarchy(); };
        insBody.appendChild(nameInp);

        // Active toggle
        const activeRow = document.createElement('div'); activeRow.style.cssText = 'display:flex;align-items:center;gap:8px;padding:2px 8px 8px;';
        const activeChk = document.createElement('input'); activeChk.type = 'checkbox'; activeChk.checked = ent.active;
        activeChk.onchange = () => { ent.active = activeChk.checked; rebuildHierarchy(); };
        const activeLbl = document.createElement('span'); activeLbl.style.cssText = 'font-size:10.5px;color:#444;'; activeLbl.textContent = 'Active';
        activeRow.appendChild(activeChk); activeRow.appendChild(activeLbl); insBody.appendChild(activeRow);

        // Components
        const compOrder = ['Transform', 'SpriteRenderer', 'TextRenderer', 'Camera', 'Rigidbody2D', 'BoxCollider2D', 'Script'];
        for (const type of compOrder) {
            const comp = ent.getComponent(type); if (!comp) continue;
            buildCompBlock(insBody, ent, comp, type);
        }

        // Add component
        const addBtn = document.createElement('button'); addBtn.className = 'ege-add-comp-btn'; addBtn.textContent = '+ Add Component'; addBtn.onclick = () => showAddCompMenu(ent, addBtn);
        insBody.appendChild(addBtn);
    }

    function buildCompBlock(parent, ent, comp, type) {
        const block = document.createElement('div'); block.className = 'ege-comp-block';
        const header = document.createElement('div'); header.className = 'ege-comp-header';
        const name = document.createElement('span'); name.className = 'ege-comp-name'; name.textContent = type;
        const enableChk = document.createElement('input'); enableChk.type = 'checkbox'; enableChk.checked = comp.enabled; enableChk.title = 'Enable/disable';
        enableChk.onchange = () => comp.enabled = enableChk.checked;
        header.appendChild(enableChk); header.appendChild(name);
        if (type !== 'Transform') {
            const rm = document.createElement('button'); rm.className = 'ege-comp-remove'; rm.title = 'Remove'; rm.textContent = '✕';
            rm.onclick = e => { e.stopPropagation(); ent.removeComponent(type); rebuildInspector(); };
            header.appendChild(rm);
        }
        block.appendChild(header);
        const body = document.createElement('div'); body.className = 'ege-comp-body';

        switch (type) {
            case 'Transform': {
                const xInput = numInput(comp.x, v => comp.x = v, 0.5);
                const yInput = numInput(comp.y, v => comp.y = v, 0.5);
                const xyRow = document.createElement('div'); xyRow.className = 'ege-field';
                const lbl = document.createElement('span'); lbl.className = 'ege-field-label'; lbl.textContent = 'Position';
                const xy = document.createElement('div'); xy.className = 'ege-field-row2'; xy.appendChild(xInput); xy.appendChild(yInput);
                xyRow.appendChild(lbl); xyRow.appendChild(xy); body.appendChild(xyRow);
                body.appendChild(field('Rotation', numInput(comp.rotation, v => comp.rotation = v, 1)));
                const sxInput = numInput(comp.scaleX, v => comp.scaleX = v, 0.1);
                const syInput = numInput(comp.scaleY, v => comp.scaleY = v, 0.1);
                const sRow = document.createElement('div'); sRow.className = 'ege-field';
                const sLbl = document.createElement('span'); sLbl.className = 'ege-field-label'; sLbl.textContent = 'Scale';
                const sxy = document.createElement('div'); sxy.className = 'ege-field-row2'; sxy.appendChild(sxInput); sxy.appendChild(syInput);
                sRow.appendChild(sLbl); sRow.appendChild(sxy); body.appendChild(sRow);
                break;
            }
            case 'SpriteRenderer': {
                body.appendChild(field('Shape', selectInput(comp.shape, ['rect', 'circle', 'triangle'], v => comp.shape = v)));
                body.appendChild(field('Color', colorInput(comp.color, v => comp.color = v)));
                const wInput = numInput(comp.width, v => comp.width = v, 1);
                const hInput = numInput(comp.height, v => comp.height = v, 1);
                const whRow = document.createElement('div'); whRow.className = 'ege-field';
                const whLbl = document.createElement('span'); whLbl.className = 'ege-field-label'; whLbl.textContent = 'Size';
                const wh = document.createElement('div'); wh.className = 'ege-field-row2'; wh.appendChild(wInput); wh.appendChild(hInput);
                whRow.appendChild(whLbl); whRow.appendChild(wh); body.appendChild(whRow);
                body.appendChild(field('Opacity', numInput(comp.opacity, v => comp.opacity = EMath.clamp(v, 0, 1), 0.05)));
                body.appendChild(field('Layer', numInput(comp.layer, v => comp.layer = v, 1)));
                break;
            }
            case 'TextRenderer': {
                const ta = document.createElement('textarea'); ta.style.cssText = 'flex:1;min-height:46px;resize:vertical;'; ta.value = comp.text;
                ta.oninput = () => comp.text = ta.value;
                body.appendChild(field('Text', ta));
                body.appendChild(field('Font Size', numInput(comp.fontSize, v => comp.fontSize = v, 1)));
                body.appendChild(field('Color', colorInput(comp.color, v => comp.color = v)));
                body.appendChild(field('Align', selectInput(comp.align, ['left', 'center', 'right'], v => comp.align = v)));
                break;
            }
            case 'Rigidbody2D': {
                body.appendChild(field('Mass', numInput(comp.mass, v => comp.mass = Math.max(0.01, v), 0.1)));
                body.appendChild(field('Gravity', checkInput(comp.useGravity, v => comp.useGravity = v)));
                body.appendChild(field('Kinematic', checkInput(comp.isKinematic, v => comp.isKinematic = v)));
                body.appendChild(field('Bounce', numInput(comp.restitution, v => comp.restitution = EMath.clamp(v, 0, 1), 0.05)));
                body.appendChild(field('Drag', numInput(comp.drag, v => comp.drag = EMath.clamp(v, 0, 20), 0.1)));
                break;
            }
            case 'BoxCollider2D': {
                const wInput = numInput(comp.width, v => comp.width = v, 1);
                const hInput = numInput(comp.height, v => comp.height = v, 1);
                const whRow = document.createElement('div'); whRow.className = 'ege-field';
                const whLbl = document.createElement('span'); whLbl.className = 'ege-field-label'; whLbl.textContent = 'Size';
                const wh = document.createElement('div'); wh.className = 'ege-field-row2'; wh.appendChild(wInput); wh.appendChild(hInput);
                whRow.appendChild(whLbl); whRow.appendChild(wh); body.appendChild(whRow);
                body.appendChild(field('Trigger', checkInput(comp.isTrigger, v => comp.isTrigger = v)));
                const oxInput = numInput(comp.offsetX, v => comp.offsetX = v, 1);
                const oyInput = numInput(comp.offsetY, v => comp.offsetY = v, 1);
                const oRow = document.createElement('div'); oRow.className = 'ege-field';
                const oLbl = document.createElement('span'); oLbl.className = 'ege-field-label'; oLbl.textContent = 'Offset';
                const oxy = document.createElement('div'); oxy.className = 'ege-field-row2'; oxy.appendChild(oxInput); oxy.appendChild(oyInput);
                oRow.appendChild(oLbl); oRow.appendChild(oxy); body.appendChild(oRow);
                break;
            }
            case 'Camera': {
                body.appendChild(field('BG Color', colorInput(comp.bgColor, v => comp.bgColor = v)));
                body.appendChild(field('Zoom', numInput(comp.zoom, v => comp.zoom = Math.max(0.1, v), 0.1)));
                body.appendChild(field('Is Main', checkInput(comp.isMain, v => comp.isMain = v)));
                break;
            }
            case 'Script': {
                const editBtn = document.createElement('button'); editBtn.className = 'ege-small-btn';
                editBtn.style.cssText = 'width:100%;margin-top:4px;padding:5px;';
                editBtn.textContent = 'Edit Script ↓'; editBtn.onclick = () => { switchBottomTab('script'); syncScriptEditor(); };
                body.appendChild(editBtn);
                if (comp._err) { const err = document.createElement('div'); err.style.cssText = 'color:#f87171;font-size:10px;padding:4px 0;word-break:break-all;'; err.textContent = '⚠ ' + comp._err; body.appendChild(err); }
                break;
            }
        }
        block.appendChild(body);
        parent.appendChild(block);
    }

    function showAddCompMenu(ent, anchor) {
        const available = ['SpriteRenderer', 'TextRenderer', 'Rigidbody2D', 'BoxCollider2D', 'Camera', 'Script'].filter(t => !ent.hasComponent(t));
        if (!available.length) return;
        const r = anchor.getBoundingClientRect();
        document.querySelectorAll('.ege-ctx').forEach(m => m.remove());
        const menu = document.createElement('div'); menu.className = 'ege-ctx'; menu.style.left = r.left + 'px'; menu.style.top = r.top + 'px';
        available.forEach(t => {
            const item = document.createElement('div'); item.className = 'ege-ctx-item'; item.textContent = t;
            item.onmousedown = ev => { ev.stopPropagation(); menu.remove(); ent.addComponent(t); rebuildInspector(); };
            menu.appendChild(item);
        });
        document.body.appendChild(menu);
        requestAnimationFrame(() => { const rc = menu.getBoundingClientRect(); if (rc.right > window.innerWidth) menu.style.left = (window.innerWidth - rc.width - 8) + 'px'; if (rc.bottom > window.innerHeight - 44) menu.style.top = (r.top - rc.height - 4) + 'px'; });
        setTimeout(() => window.addEventListener('mousedown', function h(ev) { if (!menu.contains(ev.target)) menu.remove(); window.removeEventListener('mousedown', h); }, { once: false }), 0);
    }

    // ---- Bottom panel (script editor + console) ----
    const bottom = document.createElement('div'); bottom.className = 'ege-bottom'; root.appendChild(bottom);
    const tabBar = document.createElement('div'); tabBar.className = 'ege-tab-bar'; bottom.appendChild(tabBar);

    function mkTab(label, id) {
        const t = document.createElement('div'); t.className = 'ege-tab' + (activeBottomTab === id ? ' active' : '');
        t.textContent = label; t.dataset.tab = id; t.onclick = () => switchBottomTab(id); tabBar.appendChild(t); return t;
    }
    const scriptTab = mkTab('Script Editor', 'script');
    const consoleTab = mkTab('Console', 'console');

    // Script editor pane
    const scriptPane = document.createElement('div'); scriptPane.className = 'ege-tab-content' + (activeBottomTab === 'script' ? ' active' : '');
    const scriptEditorEl = document.createElement('textarea'); scriptEditorEl.className = 'ege-script-editor';
    scriptEditorEl.placeholder = '// Select an entity with a Script component to edit it';
    scriptEditorEl.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); const s = scriptEditorEl.selectionStart; scriptEditorEl.value = scriptEditorEl.value.substring(0, s) + '    ' + scriptEditorEl.value.substring(scriptEditorEl.selectionEnd); scriptEditorEl.selectionStart = scriptEditorEl.selectionEnd = s + 4; } e.stopPropagation(); });
    scriptEditorEl.oninput = () => {
        const ent = selectedId ? scene.entities.find(e => e.id === selectedId) : null;
        const sc = ent?.getComponent('Script'); if (sc) { sc.code = scriptEditorEl.value; sc._fn = null; sc._started = false; }
    };
    scriptPane.appendChild(scriptEditorEl);
    bottom.appendChild(scriptPane);

    // Console pane
    const consolePane = document.createElement('div'); consolePane.className = 'ege-tab-content' + (activeBottomTab === 'console' ? ' active' : '');
    const consoleTb = document.createElement('div'); consoleTb.className = 'ege-console-toolbar';
    const clrBtn = document.createElement('button'); clrBtn.className = 'ege-small-btn'; clrBtn.style.width = '60px'; clrBtn.textContent = 'Clear';
    clrBtn.onclick = () => { consoleLogs.length = 0; rebuildConsole(); };
    consoleTb.appendChild(clrBtn);
    const consoleEl = document.createElement('div'); consoleEl.className = 'ege-console';
    consolePane.appendChild(consoleTb); consolePane.appendChild(consoleEl); bottom.appendChild(consolePane);

    function switchBottomTab(id) {
        activeBottomTab = id;
        [scriptTab, consoleTab].forEach(t => t.classList.toggle('active', t.dataset.tab === id));
        [scriptPane, consolePane].forEach(p => p.classList.toggle('active', p.className.includes(id === 'script' ? 'ege-tab-content active' : 'ege-tab-content active')));
        scriptPane.classList.toggle('active', id === 'script');
        consolePane.classList.toggle('active', id === 'console');
        if (id === 'script') syncScriptEditor();
        if (id === 'console') rebuildConsole();
    }
    function syncScriptEditor() {
        const ent = selectedId ? scene.entities.find(e => e.id === selectedId) : null;
        const sc = ent?.getComponent('Script');
        scriptEditorEl.value = sc ? sc.code : '// Select an entity with a Script component';
    }
    function rebuildConsole() {
        consoleEl.innerHTML = '';
        consoleLogs.slice(-200).forEach(l => {
            const line = document.createElement('div'); line.className = 'ege-log-line ' + l.t;
            line.textContent = `[${new Date(l.ts).toLocaleTimeString()}] ${l.msg}`; consoleEl.appendChild(line);
        });
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    rebuildHierarchy(); rebuildInspector(); syncScriptEditor();
    focusWindow(windowId);

    // ---- Scene settings shortcut ----
    win.querySelector('.title-bar-text').ondblclick = () => {
        const n = prompt('Scene name:', scene.name); if (n) scene.name = n;
        const g = prompt('Gravity (px/s²):', scene.gravity); if (g && !isNaN(g)) scene.gravity = parseFloat(g);
        const bg = prompt('Background color:', scene.bgColor); if (bg) scene.bgColor = bg;
    };

    return windowId;
}

/* ============================================================
   OPEN .egame FILES VIA FILE EXPLORER
============================================================ */
// Patch openFile to handle .egame
const _origOpenFile = openFile;
window.openFile = function (item) {
    if (getExt(item.name) === 'egame') { spawnGameEngine(item); return; }
    _origOpenFile(item);
};

/* ============================================================
   GLOBAL EXPORTS
============================================================ */
window.spawnGameEngine = spawnGameEngine;
window.spawnGameRunner = spawnGameRunner;
window.EScene = EScene;
window.EEntity = EEntity;
window.EPhysics = EPhysics;