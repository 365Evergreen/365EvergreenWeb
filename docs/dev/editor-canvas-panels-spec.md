## Editor Canvas Panels - Developer Spec

Purpose
-------
This document translates the user stories in `docs/stories/page-editor/editor-canvas-panels-story.md` into a concise developer spec for implementing the three editor panels (Block Selector / Inserter, Inspector / Properties, Document Overview). It defines APIs, data flows, UI behavior, accessibility, and acceptance tests.

Scope
-----
- Left panel: Block Selector & Patterns & Media picker (file: `app-private/editor/inserter.js`).
- Middle: Canvas (already implemented in `app-private/editor/canvas.js`, referenced for integration points).
- Right panel: Inspector / Properties (file: `app-private/editor/inspector.js`).
- Document Overview (can be an alternate tab in left or right panel or a separate collapsible panel).

Key Principles
--------------
- Immediate feedback: updates in the panels apply instantly to the canvas and underlying JSON model via `EditorCore`.
- Declarative schema-driven properties: blocks expose a schema that drives the Inspector UI (controls, validation, grouping).
- Keyboard-first: support `/` insertion, arrow navigation, Enter/Space activation, and Alt+1/3 to toggle panels.
- Accessible: panels use ARIA roles, focus management, and visible focus rings.

EditorCore Integration
----------------------
Expected `EditorCore` events / methods to use:
- `EditorCore.on('selection:changed', handler)` — update Inspector & Overview
- `EditorCore.on('model:changed', handler)` — refresh Overview & search recent blocks
- `EditorCore.getSelectedBlock()` — read selection
- `EditorCore.setBlockAttrs(id, attrs)` — apply property changes
- `EditorCore.insertBlockAt(position, block)` — insert a block (from inserter/pattern)
- `EditorCore.reorderBlocks(fromId, toPosition)` — for outline reordering

Example: listening and reacting to selection + model changes
```js
// update UI when selection changes
EditorCore.on('selection:changed', (selection)=>{
  const selected = EditorCore.getSelectedBlock();
  inspector.load(selected);
});

// persist a changed attribute
function updateColor(blockId, color){
  EditorCore.setBlockAttrs(blockId, { color });
}
```

Example: inserting a block programmatically
```js
const paragraph = window.EDITOR_BLOCK_DEFINITIONS.paragraph.create({ attrs:{ text: '<p>New paragraph</p>' } });
EditorCore.insertBlockAt({ parentId: currentParentId, index: caretIndex }, paragraph);
```

Left Panel (Block Selector)
---------------------------
Behavior
- Show grouped categories (Text, Media, Layout, Design, Custom).
- Search bar: live fuzzy search against block `name`, `description`, `tags`.
- Drag & drop: draggable items must set DataTransfer `text/block-type` and `application/json` (optional block JSON template).
- Clicking inserts at caret/selection via `EditorCore.insertBlockAt()`.

Implementation notes
- Reuse `window.EDITOR_BLOCK_DEFINITIONS` from `blocks.js` to produce items.
- Keep a MRU (most recently used) cache in memory (localStorage optional).
- Media tab should wire to existing upload flow (reuse `UploadImage` function if available) and set `block.attrs.media`.

Code: basic draggable item markup and DataTransfer payload
```html
<div class="block-item" draggable="true" data-type="paragraph" tabindex="0">
  <strong>Paragraph</strong>
  <div class="pe-small">Body copy with inline formatting.</div>
</div>
```

```js
// dragstart handler
function onDragStart(e){
  const type = e.target.dataset.type;
  const template = JSON.stringify(window.EDITOR_BLOCK_DEFINITIONS[type].defaultAttrs || {});
  e.dataTransfer.setData('text/block-type', type);
  e.dataTransfer.setData('application/json', template);
  e.dataTransfer.effectAllowed = 'copy';
}
```

Inspector (Right Panel)
-----------------------
Behavior
- Displays properties for the selected block grouped by schema sections.
- Live updates: controls write directly to `EditorCore.setBlockAttrs()` with debouncing for text inputs.
- Validation: show inline errors and prevent invalid values from being applied.

Implementation notes
- Block schema shape (example):
  {
    name: 'paragraph',
    attrs: { text: '', align: 'left' },
    schema: { sections: [ { title:'Typography', fields:[{ key:'fontSize', type:'select', options:['S','M','L'] }] } ] }
  }
- Render form controls dynamically based on `schema` (text, number, select, color, toggle, responsive inputs).
- Wire `inspector.js` to `EditorCore.on('selection:changed', ...)` to load current attrs.

Code: simple dynamic field renderer (concept)
```js
function renderField(field, value, onChange){
  switch(field.type){
    case 'text':
      const input = document.createElement('input');
      input.value = value || '';
      input.addEventListener('input', debounce(()=> onChange(input.value), 250));
      return input;

    case 'select':
      const sel = document.createElement('select');
      field.options.forEach(opt=> sel.appendChild(new Option(opt, opt)));
      sel.value = value;
      sel.addEventListener('change', ()=> onChange(sel.value));
      return sel;

    case 'color':
      const c = document.createElement('input');
      c.type = 'color'; c.value = value || '#000000';
      c.addEventListener('input', ()=> onChange(c.value));
      return c;

    // add other types (number, toggle, responsive inputs)
  }
}

function debounce(fn, wait=200){ let t; return (...args)=>{ clearTimeout(t); t = setTimeout(()=> fn(...args), wait); }; }
```

Example: applying changes to the EditorCore (debounced)
```js
function attachInspector(block){
  const form = document.getElementById('inspector-form');
  form.innerHTML = '';
  block.schema.sections.forEach(section => {
    section.fields.forEach(field => {
      const control = renderField(field, block.attrs[field.key], (v)=>{
        EditorCore.setBlockAttrs(block.id, { [field.key]: v });
      });
      form.appendChild(control);
    });
  });
}
```

Document Overview (Structure Panel)
-----------------------------------
Behavior
- Shows hierarchical tree of page blocks, supports expand/collapse, select-to-scroll, and drag-reorder.
- Deleting from outline removes subtree and triggers `EditorCore` updates.

Implementation notes
- Represent nodes as tree with minimal info: { id, type, title, children[] } derived from `EditorCore.getState()`.
- For moving nodes, compute and call `EditorCore.reorderBlocks()` with validated target position.

Code: minimal reorder helper (concept)
```js
// called after computing target parent/index from drag
function moveNode(nodeId, targetParentId, index){
  EditorCore.reorderBlocks(nodeId, { parentId: targetParentId, index });
}
```

Code: deriving tree for outline from EditorCore state
```js
function buildOutline(){
  const state = EditorCore.getState(); // assumed { blocks: [...] }
  // map state to minimal tree nodes
  return state.blocks.map(b=> ({ id:b.id, type:b.type, title: b.attrs.title || b.type, children: b.children || [] }));
}
```

Accessibility
-------------
- Panels must be reachable via keyboard. Use `role="region"` and `aria-label`.
- The tree in Document Overview should use `role="tree"` and `role="treeitem"` with `aria-expanded`.
- Provide visible focus styles; ensure draggable items have `tabindex="0"` and `aria-grabbed` when dragging.

Acceptance Criteria / Dev Tests
1. Insert block via click: clicking Paragraph inserts a new paragraph block at caret and canvas updates.
2. Insert block via drag: dragging Image shows drop previews and inserts on drop.
3. Inspector writeback: changing color in Inspector updates canvas immediately and `EditorCore` model reflects change.
4. Outline reorder: dragging an item in Document Overview reorders nodes and canvas re-renders in correct order.
5. Keyboard flows: `/` opens inline inserter; Alt+1/Alt+3 toggle panels.

6. Playwright: small acceptance-test skeleton
```js
// example: tests/editor/insert-and-inspect.spec.js
const { test, expect } = require('@playwright/test');
test('insert paragraph and edit text', async ({ page }) => {
  await page.goto('http://localhost:5500/app-private/editor/index.html');
  // click the paragraph inserter
  await page.click('.block-item[data-type="paragraph"]');
  // focus the first paragraph contenteditable and type
  await page.click('#pe-editor-canvas .block[data-type="paragraph"] .contenteditable');
  await page.fill('#pe-editor-canvas .block[data-type="paragraph"] .contenteditable', 'Hello from Playwright');

  const model = await page.evaluate(()=> window.EditorCore.getState());
  expect(model.blocks.some(b=> b.attrs && b.attrs.text && b.attrs.text.includes('Hello from Playwright'))).toBeTruthy();
});
```

Files to modify / implement
---------------------------
- `app-private/editor/inserter.js` — enhance search, MRU, and DnD data transfer payloads.
- `app-private/editor/inspector.js` — dynamic form rendering from schema, debounced writeback.
- `app-private/editor/canvas.js` — ensure insert API and drop preview hooks exist and call `EditorCore` methods.
- Add tests: a small Playwright or Puppeteer test in `scripts/` to validate core acceptance flows.

Open Questions / Next tasks
--------------------------
- Decide if Document Overview is a separate panel or a tab inside left/right panel (UX trade-offs).
- Define persistent storage format and API for patterns and MRU blocks.
- Add unit tests for schema-driven Inspector rendering.

Estimated effort
----------------
- Left Panel improvements: 1-2 days
- Inspector schema renderer: 2-3 days
- Document Overview tree + reorder: 2 days
- Tests + polish: 1-2 days

---
Saved: docs/dev/editor-canvas-panels-spec.md
