// Static import specifiers must be plain string literals — no template literals allowed.
// @codemirror/state and @lezer/highlight are bare specifiers resolved by the importmap
// in index.html (the two true singletons). Every other package uses a full esm.sh URL
// with ?bundle&external=... so those two are NOT re-bundled inside each package.

import { EditorState, Compartment } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import {
    EditorView, keymap, lineNumbers, highlightActiveLineGutter,
    highlightActiveLine, drawSelection, dropCursor,
    rectangularSelection, crosshairCursor,
} from 'https://esm.sh/@codemirror/view@6.28.1?bundle&external=@codemirror/state,@lezer/highlight';
import {
    defaultKeymap, history, historyKeymap, indentWithTab,
} from 'https://esm.sh/@codemirror/commands@6.6.0?bundle&external=@codemirror/state,@lezer/highlight';
import {
    HighlightStyle, bracketMatching, indentOnInput, syntaxHighlighting, foldGutter,
} from 'https://esm.sh/@codemirror/language@6.10.2?bundle&external=@codemirror/state,@lezer/highlight';
import {
    autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap,
} from 'https://esm.sh/@codemirror/autocomplete@6.18.1?bundle&external=@codemirror/state,@lezer/highlight';
import {
    searchKeymap, highlightSelectionMatches,
} from 'https://esm.sh/@codemirror/search@6.5.6?bundle&external=@codemirror/state,@lezer/highlight';
import { html }
    from 'https://esm.sh/@codemirror/lang-html@6.4.9?bundle&external=@codemirror/state,@lezer/highlight';

// ── SYNTAX HIGHLIGHT STYLES ───────────────────────────────────────────────────
// HighlightStyle writes to a detached CSSStyleSheet → var(--x) resolves to nothing.
// Use concrete hex values; swap via Compartment on theme toggle.

function makeHighlight(p) {
    return syntaxHighlighting(HighlightStyle.define([
        { tag: tags.tagName, color: p.tag, fontWeight: '600' },
        { tag: tags.attributeName, color: p.attr },
        { tag: tags.attributeValue, color: p.str },
        { tag: [tags.string, tags.special(tags.string)], color: p.str },
        { tag: tags.comment, color: p.cmt, fontStyle: 'italic' },
        { tag: [tags.keyword, tags.meta], color: p.kw },
        { tag: tags.number, color: p.num },
        { tag: tags.operator, color: p.tag },
        { tag: tags.angleBracket, color: p.angle },
        { tag: tags.processingInstruction, color: p.kw, fontStyle: 'italic' },
        { tag: tags.name, color: p.text },
        { tag: tags.propertyName, color: p.attr },
        { tag: tags.typeName, color: p.tag },
        { tag: tags.className, color: p.num },
        { tag: tags.definition(tags.name), color: p.attr },
        { tag: tags.unit, color: p.num },
        { tag: tags.color, color: p.str },
        { tag: tags.url, color: p.str, textDecoration: 'underline' },
        { tag: tags.link, color: p.attr, textDecoration: 'underline' },
        { tag: tags.heading, color: p.tag, fontWeight: 'bold' },
        { tag: tags.emphasis, fontStyle: 'italic' },
        { tag: tags.strong, fontWeight: 'bold' },
    ]));
}

const highlightDark = makeHighlight({ tag: '#e07b3a', attr: '#82aaff', str: '#c3e88d', cmt: '#546e7a', kw: '#c792ea', num: '#f78c6c', angle: '#8b909e', text: '#d4d8e2' });
const highlightLight = makeHighlight({ tag: '#c0480a', attr: '#1a6fb5', str: '#3a7d0a', cmt: '#6a8a4a', kw: '#6a1f8a', num: '#b06000', angle: '#6b6460', text: '#1c1a16' });

// ── EDITOR CHROME THEMES ──────────────────────────────────────────────────────
const darkTheme = EditorView.theme({
    '&': { background: '#0e0f11 !important', color: '#d4d8e2' },
    '.cm-content': { caretColor: '#f0c040' },
    '.cm-gutters': { background: '#1a1d24 !important', borderRight: '1px solid #2a2d35', color: '#454b60' },
    '.cm-activeLineGutter': { background: 'rgba(255,255,255,.05)' },
    '.cm-activeLine': { background: 'rgba(255,255,255,.03)' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { background: '#2a3a55 !important' },
    '&.cm-focused .cm-cursor': { borderLeftColor: '#f0c040' },
    '.cm-matchingBracket': { background: 'rgba(240,192,64,.18)', outline: '1px solid #f0c040' },
    '.cm-tooltip': { background: '#1e2025', border: '1px solid #2a2d35' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { background: '#f0c040', color: '#0e0f11' },
}, { dark: true });

const lightTheme = EditorView.theme({
    '&': { background: '#ffffff !important', color: '#1c1a16' },
    '.cm-content': { caretColor: '#c0480a' },
    '.cm-gutters': { background: '#f0ede6 !important', borderRight: '1px solid #d4cfc4', color: '#bbb5aa' },
    '.cm-activeLineGutter': { background: 'rgba(0,0,0,.05)' },
    '.cm-activeLine': { background: 'rgba(0,0,0,.025)' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { background: '#ffe0b0 !important' },
    '&.cm-focused .cm-cursor': { borderLeftColor: '#c0480a' },
    '.cm-matchingBracket': { background: 'rgba(192,72,10,.12)', outline: '1px solid #c0480a' },
    '.cm-tooltip': { background: '#ffffff', border: '1px solid #d4cfc4' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { background: '#c0480a', color: '#fff' },
}, { dark: false });

// ── COMPARTMENTS ──────────────────────────────────────────────────────────────
const themeCompartment = new Compartment();
const wrapCompartment = new Compartment();

// ── VOID ELEMENTS ─────────────────────────────────────────────────────────────
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr', '!DOCTYPE', '!doctype']);

// ── TAG AUTO-CLOSE ────────────────────────────────────────────────────────────
const tagAutoClose = EditorView.inputHandler.of((view, from, to, text) => {
    if (text !== '>') return false;
    const doc = view.state.doc.toString();
    let i = from - 1;
    while (i >= 0 && doc[i] !== '<') i--;
    if (i < 0) return false;
    const tagContent = doc.slice(i + 1, from);
    if (tagContent.startsWith('/')) return false;
    if (tagContent.startsWith('!')) {
        view.dispatch({ changes: { from, to, insert: '>' } });
        return true;
    }
    const tagName = tagContent.trim().split(/[\s\n]/)[0].toLowerCase();
    if (!tagName) return false;
    if (VOID.has(tagName)) {
        view.dispatch({ changes: { from, to, insert: '>' } });
        return true;
    }
    view.dispatch({
        changes: { from, to, insert: `></${tagName}>` },
        selection: { anchor: from + 1 },
    });
    return true;
});

// ── STARTER ───────────────────────────────────────────────────────────────────
const STARTER = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
    </style>
</head>
<body>
    <h1>This is a heading</h1>
    <p>This is a paragraph</p>
    <button onclick="this.textContent='Clicked!'">Click me</button>
</body>
</html>`;

// ── BUILD EXTENSIONS ──────────────────────────────────────────────────────────
function buildExtensions(dark) {
    return [
        lineNumbers(), highlightActiveLineGutter(), foldGutter(),
        history(), drawSelection(), dropCursor(),
        indentOnInput(), bracketMatching(), closeBrackets(),
        autocompletion(), rectangularSelection(), crosshairCursor(),
        highlightActiveLine(), highlightSelectionMatches(),
        keymap.of([
            ...closeBracketsKeymap, ...defaultKeymap,
            ...historyKeymap, ...completionKeymap,
            ...searchKeymap, indentWithTab,
        ]),
        html(),
        themeCompartment.of(dark ? [darkTheme, highlightDark] : [lightTheme, highlightLight]),
        wrapCompartment.of([]),
        tagAutoClose,
        EditorView.updateListener.of(onEditorUpdate),
    ];
}

const view = new EditorView({
    state: EditorState.create({ doc: STARTER, extensions: buildExtensions(true) }),
    parent: document.getElementById('cm-wrap'),
});

// ── PREVIEW ───────────────────────────────────────────────────────────────────
let autoRunTimer = null;
const frame = document.getElementById('preview-frame');

function runPreview() {
    const code = view.state.doc.toString();
    const blob = new Blob([code], { type: 'text/html' });
    const old = frame.src;
    if (old?.startsWith('blob:')) URL.revokeObjectURL(old);
    frame.src = URL.createObjectURL(blob);
    flashStatus();
    document.getElementById('char-count').textContent = code.length.toLocaleString() + ' chars';
}

function flashStatus() {
    const dot = document.getElementById('status-dot');
    const msg = document.getElementById('status-msg');
    dot.style.background = '#4caf82';
    msg.textContent = 'Preview updated';
    clearTimeout(flashStatus._t);
    flashStatus._t = setTimeout(() => { msg.textContent = 'Ready'; dot.style.background = ''; }, 1500);
}

function onEditorUpdate(update) {
    if (update.selectionSet) {
        const pos = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos);
        document.getElementById('cursor-pos').textContent = `Ln ${line.number}, Col ${pos - line.from + 1}`;
    }
    if (update.docChanged) {
        document.getElementById('char-count').textContent = update.state.doc.length.toLocaleString() + ' chars';
        if (document.getElementById('auto-run').checked) {
            clearTimeout(autoRunTimer);
            autoRunTimer = setTimeout(runPreview, 500);
        }
    }
}

// ── RESIZER ───────────────────────────────────────────────────────────────────
const divider = document.getElementById('divider');
const editorPane = document.getElementById('editor-pane');
const mainEl = document.getElementById('main');
const COLLAPSE_TH = 120;
let isCollapsed = false, savedWidth = '50%', dragging = false;

divider.addEventListener('mousedown', e => {
    if (e.target.closest('#collapse-btn')) return;
    dragging = true;
    divider.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
});
document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const rect = mainEl.getBoundingClientRect();
    let w = e.clientX - rect.left;
    if (w < COLLAPSE_TH && !isCollapsed) { collapseEditor(); return; }
    if (isCollapsed && w > COLLAPSE_TH) expandEditor(w);
    if (!isCollapsed) {
        w = Math.max(80, Math.min(w, rect.width - 100));
        editorPane.style.width = w + 'px';
        savedWidth = w + 'px';
    }
});
document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    divider.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
});

function collapseEditor() {
    isCollapsed = true;
    editorPane.classList.add('collapsed');
    document.getElementById('collapse-icon').innerHTML = '<polygon points="2,1 7,5 2,9"/>';
}
function expandEditor(w) {
    isCollapsed = false;
    editorPane.classList.remove('collapsed');
    editorPane.style.width = (w || parseInt(savedWidth) || 500) + 'px';
    document.getElementById('collapse-icon').innerHTML = '<polygon points="6,1 1,5 6,9"/>';
}
document.getElementById('collapse-btn').addEventListener('click', () => {
    if (isCollapsed) expandEditor(parseInt(savedWidth) || 500);
    else collapseEditor();
});

// ── THEME ─────────────────────────────────────────────────────────────────────
let darkMode = true;
document.getElementById('theme-btn').addEventListener('click', () => {
    darkMode = !darkMode;
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    document.getElementById('theme-btn').textContent = darkMode ? '🌙' : '☀️';
    view.dispatch({ effects: themeCompartment.reconfigure(darkMode ? [darkTheme, highlightDark] : [lightTheme, highlightLight]) });
});

// ── WRAP ──────────────────────────────────────────────────────────────────────
let wrapOn = false;
document.getElementById('wrap-btn').addEventListener('click', () => {
    wrapOn = !wrapOn;
    view.dispatch({ effects: wrapCompartment.reconfigure(wrapOn ? EditorView.lineWrapping : []) });
    document.getElementById('wrap-btn').textContent = wrapOn ? 'No Wrap' : 'Wrap Lines';
});

// ── TOOLBAR ───────────────────────────────────────────────────────────────────
document.getElementById('run-btn').addEventListener('click', runPreview);
document.getElementById('clear-btn').addEventListener('click', () => {
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: '' } });
    frame.src = 'about:blank';
});
document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(view.state.doc.toString()).then(() => {
        const btn = document.getElementById('copy-btn');
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy HTML'; }, 1600);
    });
});

runPreview();