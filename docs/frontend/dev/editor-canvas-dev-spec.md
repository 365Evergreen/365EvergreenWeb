<!-- Editor Canvas Dev Spec
Path: docs/dev/editor-canvas-dev-spec.md
Purpose: Developer-facing specification and implementation steps for the Editor Canvas and Panels stories.
-->

*** Begin Replacement
# SWA Page Editor — Dev Spec (Canvas & Panels)

Status: Draft — update this file as code and contracts evolve.

Purpose
-------
This document turns the stories into a developer-facing spec covering all TODO items, with prioritized dev steps and code snippets you can copy into the workspace. Keep the `manage_todo_list` in sync when an item moves state.

Relevant paths
--------------
- Dev harness: [app-private/editor/index.html](app-private/editor/index.html)
- Editor modules: [app-private/editor/*](app-private/editor)
- Production template: [app-private/pages/content/page-editor.html](app-private/pages/content/page-editor.html)
- Block registry: [app-private/editor/blocks.js](app-private/editor/blocks.js)

Overview of deliverables
------------------------
This file documents implementation steps and code snippets for each TODO item:

- EditorCore API (event bus, state)
- Block schema & patterns
- Inline `/` inserter (command palette)
- Block library panel (search + drag)
- Drag/drop insertion preview
- Canvas interactions (select, split, move, delete)
- Keyboard shortcuts & accessibility
- Floating toolbar (actions + transforms)
- Inspector editors & writeback
- Document Overview (list view)
- Serialization & publish flow
- Production integration & publish script
- Dev harness verification
- Tests (unit + integration)

1. Finalize `EditorCore` API (done)
----------------------------------
Goal: provide a stable global contract for modules.

Key surface (already implemented in `app-private/editor/core.js`):

- `EditorCore.on(event, handler)`
- `EditorCore.off(event, handler)`
- `EditorCore.emit(event, payload)`
- `EditorCore.getState()` — deep-cloned state `{ blocks, selectedId }`
- `EditorCore.setState(partial)` — merge partial into state, emits `state:changed`
- `EditorCore.getBlocks()/setBlocks(blocks)`
- `EditorCore.selectBlockById(id)` — emits `select`
- `EditorCore.getSelectedBlock()`
- `EditorCore.createId(prefix)` — helper id generator
- `EditorCore.renderTree(blocks, container, customRenderer)` — renderer with optional custom renderer callback

Dev steps + notes
- Keep `emit('select', block)` semantics consistent — pass the full block node.
- When changing event names, update `docs/dev` and the TODO list.

2. Complete block schema & patterns
----------------------------------
Goal: centralize block metadata and factories.

Schema shape (recommended):

```js
// Minimal block def example
window.EDITOR_BLOCK_DEFINITIONS = {
  paragraph: {
    name: 'Paragraph',
    icon: 'p',
    category: 'text',
    supports: { inlineFormatting: true },
    create(attrs){ return { id: EditorCore.createId('b'), type:'paragraph', attrs: Object.assign({ text:'' }, attrs||{}) }; },
    render(block){ const d = document.createElement('div'); d.innerText = block.attrs.text || ''; return d; }
  }
};
window.EDITOR_BLOCK_ORDER = ['paragraph','heading','image','grid'];
```

Dev steps
- Add `render()` factory for each block that returns a DOM node used by `renderTree` if `customRenderer` delegates to block renderers.
- Add `patterns` collection (prebuilt nested block arrays) for quicker insertions.

3. Implement inline `/` inserter
--------------------------------
Goal: fast inline command palette triggered by `/` in empty placeholders.

UX contract
- Pressing `/` when caret is in an empty block opens a small search/auto-complete.
- Selecting a block inserts it after the current block and focuses appropriate editable field.

Code snippet (insert handler):

```js
// called when user chooses a block-type from inline palette
function insertBlockAt(blockType, afterBlockId){
  const block = window.EDITOR_BLOCK_DEFINITIONS[blockType].create();
  EditorCore.emit('insert', { block, afterBlockId });
}

// wiring: listen in Canvas
EditorCore.on('insert', ({block, afterBlockId})=>{
  const blocks = EditorCore.getBlocks();
  const idx = blocks.findIndex(b=>b.id===afterBlockId);
  blocks.splice(idx<0?blocks.length:idx+1, 0, block);
  EditorCore.setBlocks(blocks);
});
```

Dev steps
- Implement a lightweight popover component that queries `window.EDITOR_BLOCK_DEFINITIONS` and supports keyboard nav.

4. Block library panel (search + drag)
-------------------------------------
Goal: left panel with searchable blocks and drag handles.

Key behaviors
- Typing filters by `name`, `category`, or `description`.
- Dragging an item over canvas shows drop zones.

Snippet: simple search filter

```js
const blocks = Object.entries(window.EDITOR_BLOCK_DEFINITIONS);
function renderLibrary(q=''){
  const list = document.getElementById('pe-block-groups'); list.innerHTML='';
  blocks.filter(([k,v])=> v.name.toLowerCase().includes(q.toLowerCase())).forEach(([key,def])=>{
    const el = document.createElement('div'); el.textContent = def.name;
    el.draggable = true; el.dataset.blockType = key;
    el.addEventListener('dragstart', (e)=> e.dataTransfer.setData('text/block-type', key));
    list.appendChild(el);
  });
}
```

Dev steps
- Add dragstart payload `block-type` and implement `dragover`/`drop` on canvas to compute insertion index and emit `insert`.

5. Drag/drop insertion previews
-------------------------------
Goal: while dragging show a visual preview and valid drop zones.

Implementation notes
- On `dragover` compute nearest block index using `elementFromPoint` or `getBoundingClientRect()` on block elements.
- Show a thin insertion line at computed location; on `drop`, call `EDITOR_BLOCK_DEFINITIONS[type].create()` and insert.

Snippet (drop handler):

```js
canvasEl.addEventListener('drop', (e)=>{
  e.preventDefault();
  const type = e.dataTransfer.getData('text/block-type');
  const block = window.EDITOR_BLOCK_DEFINITIONS[type].create();
  const afterId = computeAfterIdFromPointer(e.clientY);
  EditorCore.emit('insert', { block, afterBlockId: afterId });
});
```

6. Canvas interactions (select, split, move, delete)
--------------------------------------------------
Goal: implement the UX described in the story (selectable blocks, split by Enter, move up/down, delete).

Events to support
- `insert`, `delete`, `move`, `update`, `select`, `load`, `clear`

Split example (for text blocks):

```js
function splitTextBlock(blockId, cursorOffset){
  const blocks = EditorCore.getBlocks();
  const i = blocks.findIndex(b=>b.id===blockId);
  const current = blocks[i];
  const text = current.attrs.text || '';
  const before = text.slice(0, cursorOffset); const after = text.slice(cursorOffset);
  current.attrs.text = before;
  const newBlock = window.EDITOR_BLOCK_DEFINITIONS['paragraph'].create({ text: after });
  blocks.splice(i+1,0,newBlock);
  EditorCore.setBlocks(blocks);
}
```

Movement (up/down):

```js
function moveBlock(id, direction){
  const blocks = EditorCore.getBlocks();
  const i = blocks.findIndex(b=>b.id===id); if (i<0) return;
  const j = direction==='up' ? i-1 : i+1; if (j<0||j>=blocks.length) return;
  const [m] = blocks.splice(i,1); blocks.splice(j,0,m); EditorCore.setBlocks(blocks);
}
```

7. Keyboard shortcuts & accessibility
-------------------------------------
Recommended shortcuts
- `/` (inline inserter), `Enter` (split in text), `Delete` (remove selected), `Ctrl/Cmd+ArrowUp/Down` (move), `Ctrl+S` (save)

Accessibility
- All interactive elements must be focusable (`tabindex=0`), provide `aria-label` and `role` where appropriate.

8. Floating toolbar full features
---------------------------------
Toolbar responsibilities
- Inline inline formatting (bold/italic/link)
- Transform menu (change block type preserving attrs)

Emit actions

```js
toolbarButton.addEventListener('click', ()=> EditorCore.emit('toolbar:action', { action:'bold', blockId: id }));
EditorCore.on('toolbar:action', ({action, blockId}) => { /* apply transform/update block */ });
```

9. Inspector property editors & writeback
----------------------------------------
Inspector should render property widgets driven by block `supports` metadata and write back to block JSON.

Save example

```js
function saveInspector(updatedAttrs){
  const blk = EditorCore.getSelectedBlock(); if(!blk) return;
  blk.attrs = Object.assign({}, blk.attrs, updatedAttrs);
  const blocks = EditorCore.getBlocks().map(b=> b.id===blk.id ? blk : b);
  EditorCore.setBlocks(blocks);
}
```

10. Document Overview (List View)
--------------------------------
The list view shows a tree and supports selecting and drag-reordering. Use the same `move` APIs as canvas.

11. Serialization & save/publish flow
------------------------------------
Goals
- Provide deterministic JSON and a publish path that writes to your SWA `$web` content or calls a save API.

Dev publish example (simple API POST):

```js
async function publish(slug){
  const payload = { title: document.getElementById('pe-canvas-title').value, blocks: EditorCore.getBlocks() };
  await fetch('/api/save-page', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({slug, payload}) });
}
```

12. Update production page integration
-------------------------------------
Keep `app-private/pages/content/page-editor.html` a thin wrapper that loads `app-private/editor/*.js` from production paths and leaves runtime contracts intact.

13. Dev harness verification & fixes
-----------------------------------
Steps to verify locally

```bash
# from repo root
python -m http.server 5500
# open http://127.0.0.1:5500/app-private/editor/index.html
```

Checklist
- Confirm `/styles.css` fallback loads
- Confirm `site-header.js` loads via fallback
- Confirm editor modules load and `EditorCore` is present on `window`

14. Unit tests: serializer & core
--------------------------------
Suggested tests
- `core.test.js` — events, getState/setState, selection
- `serializer.test.js` — blocks -> DOM -> JSON roundtrip

Example with Node + JSDOM + Jest

```bash
npm install --save-dev jest jsdom
npm test -- core.test.js
```

15. Integration tests: harness workflows
--------------------------------------
Use Playwright to script insert, drag/drop, delete, save flows.

16. Docs: README + developer guide (this file)
---------------------------------------------
Add a README in `app-private/editor/README.md` with run steps and links back to this spec.

17. Update publish script & CI
------------------------------
Ensure `scripts/publish-cloud.ps1` ignores `api/` and editor dev harness files and only publishes the production page and assets.

18. Manual QA & user testing
---------------------------
Create a short checklist for manual flows: new page, insert grid+cards, change colors, reorder, save/publish, view on site.

19. Final monolith removal/refactor
---------------------------------
Once feature parity is validated, remove or archive `app-private/page-editor.js` monolith and point production page to modular assets.

Appendix: quick copyable snippets
--------------------------------
- `createId` helper (already in `EditorCore`)
- `insert` wiring (canvas)
- `moveBlock` helper
- `publish` stub

Keep this document current — when you change APIs or filenames, update this file and the `manage_todo_list` accordingly.

*** End Replacement
