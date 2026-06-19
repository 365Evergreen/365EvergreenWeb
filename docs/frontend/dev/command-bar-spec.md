# Command Bar — Developer Specification

Purpose
- Implement the Editor Canvas command bar as described in docs/stories/page-editor/command-bar-stories.md.
- Deliver a reusable, accessible header with left/center/right zones and hooks for Save/Publish, Preview, device preview, undo/redo, and plugins.

Files to modify
- `app-private/editor/index.html` — add command bar markup and slots.
- `app-private/editor/index.css` — styles for command bar (new rules or import from design-system).
- `app-private/editor/toolbar.js` — wiring and event handlers for command bar actions.
- `app-private/editor/core.js` (or `toolbar.js`) — implement undo/redo, save/publish hooks.

High-level requirements mapping
- Left zone: back button, site title, block picker toggle (Shift+Alt+B). Persist panel state.
- Center zone: Edit/Preview toggle, Undo/Redo, Device preview buttons (Desktop/Tablet/Mobile).
- Right zone: Save (Ctrl+S), Publish, Page Settings (gear), More menu (copy/export/etc.).
- Accessibility: keyboard focusable, aria labels, role=toolbar.

UI Markup (insert into `index.html` near top of `<main>`)

```html
<header id="editor-command-bar" class="editor-command-bar" role="toolbar" aria-label="Editor command bar">
  <div class="cb-left">
    <button id="cb-back" class="cb-btn" title="Back to pages">←</button>
    <div id="cb-title" class="cb-title">Editor Harness Dev</div>
    <button id="cb-toggle-blocks" class="cb-btn" title="Toggle blocks panel" aria-pressed="false">+</button>
  </div>
  <div class="cb-center">
    <button id="cb-mode-edit" class="cb-btn active">Edit</button>
    <button id="cb-mode-preview" class="cb-btn">Preview</button>
    <button id="cb-undo" class="cb-btn" title="Undo">↶</button>
    <button id="cb-redo" class="cb-btn" title="Redo">↷</button>
    <div class="cb-device">
      <button data-device="desktop" class="cb-btn cb-device-btn active">Desktop</button>
      <button data-device="tablet" class="cb-btn cb-device-btn">Tablet</button>
      <button data-device="mobile" class="cb-btn cb-device-btn">Mobile</button>
    </div>
  </div>
  <div class="cb-right">
    <button id="cb-save" class="cb-btn">Save</button>
    <button id="cb-publish" class="cb-btn primary">Publish</button>
    <button id="cb-page-settings" class="cb-btn" title="Page settings">⚙</button>
    <div class="cb-more">
      <button id="cb-more" class="cb-btn">⋮</button>
      <div id="cb-more-menu" class="cb-menu" hidden>
        <button data-action="export">Export</button>
        <button data-action="duplicate">Duplicate</button>
        <button data-action="delete">Delete</button>
      </div>
    </div>
  </div>
</header>
```

JavaScript wiring (examples for `toolbar.js`)

- Toggle blocks panel and persist state

```js
document.getElementById('cb-toggle-blocks').addEventListener('click', ()=>{
  const root = document.documentElement;
  const collapsed = root.classList.toggle('collapsed-left');
  document.getElementById('cb-toggle-blocks').setAttribute('aria-pressed', collapsed ? 'true' : 'false');
  localStorage.setItem('editor.leftCollapsed', collapsed ? '1' : '0');
});

// Keyboard shortcut: Shift+Alt+B
window.addEventListener('keydown', (e)=>{
  if (e.shiftKey && e.altKey && !e.ctrlKey && e.key === 'B'){
    document.getElementById('cb-toggle-blocks').click();
    e.preventDefault();
  }
});
```

- Preview toggle and render

```js
function enterPreview(){
  document.documentElement.classList.add('preview-mode');
  // render static output snapshot from current JSON
  // renderStaticPreview() to be implemented in core
}
function exitPreview(){
  document.documentElement.classList.remove('preview-mode');
}
document.getElementById('cb-mode-preview').addEventListener('click', ()=>{ enterPreview(); });
document.getElementById('cb-mode-edit').addEventListener('click', ()=>{ exitPreview(); });
```

- Save and publish (placeholders)

```js
async function saveDraft(){
  const pageJson = window.EditorCore && EditorCore.getPageJson && EditorCore.getPageJson();
  // POST/PUT to save endpoint (SWA function or local filesystem helper)
  await fetch('/api/savePage',{method:'POST', body: JSON.stringify(pageJson), headers:{'Content-Type':'application/json'}});
  // update UI state
}

async function publishPage(){
  // call saveDraft then publish process
  await saveDraft();
  await fetch('/api/publishPage',{method:'POST', body: JSON.stringify({ path: pageJson.path })});
}

document.getElementById('cb-save').addEventListener('click', saveDraft);
document.getElementById('cb-publish').addEventListener('click', publishPage);

// Ctrl+S keyboard shortcut
window.addEventListener('keydown', (e)=>{
  if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase() === 's'){
    e.preventDefault(); saveDraft();
  }
});
```

- Undo/Redo skeleton (in `core.js`)

```js
const history = { stack: [], index: -1 };
function pushHistory(state){ history.stack = history.stack.slice(0, history.index+1); history.stack.push(JSON.stringify(state)); history.index++; }
function undo(){ if(history.index<=0) return; history.index--; const s = JSON.parse(history.stack[history.index]); EditorCore.loadState(s); }
function redo(){ if(history.index >= history.stack.length-1) return; history.index++; const s = JSON.parse(history.stack[history.index]); EditorCore.loadState(s); }
```

- Device preview CSS (in `index.css`)

```css
.editor-shell.preview-mode .pe-editor-canvas { pointer-events: none; }
.editor-shell[data-device="tablet"] .pe-editor-canvas { max-width: 768px; }
.editor-shell[data-device="mobile"] .pe-editor-canvas { max-width: 375px; }
```

Accessibility notes
- All toolbar buttons should have `aria-label` and `aria-pressed` when toggle.
- Use `role="toolbar"` and logical focus order.
- Ensure color contrast for primary buttons.

Testing / QA
- Manual: verify keyboard shortcuts (Ctrl+S, Shift+Alt+B, Shift+P), toggles, and persistence across reloads.
- Visual: ensure header is sticky and doesn't overlap block toolbars.
- Unit: add tests for `saveDraft()` and undo/redo helpers where possible.

Delivery checklist
- [ ] Add markup to `index.html` and ensure layout works with existing panels.
- [ ] Implement CSS rules in `index.css`.
- [ ] Add wiring to `toolbar.js` and `core.js`.
- [ ] Add API endpoints or local handlers for save/publish.
- [ ] Add tests and update docs.

Notes
- The spec assumes `EditorCore` provides `getPageJson()` and `loadState()` helpers. If not present, implement small adapters in `core.js`.
- Prefer non-blocking async merges for icons; the experimental sync XHR used earlier is acceptable for dev but replace with async + re-render in production.
