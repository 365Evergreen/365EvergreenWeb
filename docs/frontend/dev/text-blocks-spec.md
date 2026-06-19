# Text Blocks — Developer Spec

This document describes the current text block implementations for the Page Editor: `paragraph`, `heading`, `code`, and `list`.

**Goals**
- Editable, contenteditable-driven rendering in the canvas.
- Model synchronization via `window.EditorCore` helpers.
- Keyboard behaviors: Enter splits paragraph/heading, Backspace at start merges, Enter in list creates item.
- Floating block toolbar for transforms, inline formatting, alignment, typography, colors, and block actions.
- Inspector support for grouped block settings and typography controls.
- Accessibility: contenteditable elements expose appropriate roles and are keyboard reachable.
- Keep this slice aligned to the existing block registry only. `table` remains a follow-on block, not part of the current canvas implementation.

## Block definitions (example)

Blocks are registered in `app-private/editor/blocks.js`. A block definition includes `label`, `category`, `description`, `create(attrs)` and optionally `render(block)`.

Current field contract:

- `paragraph.attrs.text`
- `heading.attrs.text`
- `heading.attrs.level`
- `list.attrs.items[]`
- `list.attrs.ordered`
- `list.attrs.markerStyle`
- `code.attrs.code`
- `code.attrs.language`
- `paragraph.attrs.style`
- `heading.attrs.style`
- `list.attrs.style.typography`
- `list.attrs.style.spacing`
- `code.attrs.style`

`attrs.style` currently supports:

- `fontSize`
- `fontWeight`
- `lineHeight`
- `textColor`
- `backgroundColor`

List items now use the nested object form:

```json
{
  "content": "<rich text html>",
  "children": []
}
```

Example `paragraph` definition (simplified):

```js
paragraph: {
  label: 'Paragraph',
  category: 'Text',
  description: 'Body copy',
  create: (attrs) => ({ id: null, type: 'paragraph', attrs: Object.assign({ text: '', align: 'left' }, attrs||{}) }),
  render: (block) => {
    const d = document.createElement('div');
    d.className = 'pe-block-paragraph pe-richtext';
    d.setAttribute('contenteditable', 'true');
    d.innerHTML = block.attrs && block.attrs.text ? block.attrs.text : '';
    return d;
  }
}
```

## Canvas integration

The canvas uses `EditorCore.renderTree(blocks, container)` to render blocks. After rendering, `canvas.js` adds handlers to each rendered block element:

- Click selects the block (`EditorCore.selectBlockById(id)`).
- If the block root or one of its descendants is `contenteditable`, `input` events are debounced and written back through `EditorCore.setBlockAttrs(...)`.
- `paragraph` and `heading` write back to `attrs.text`.
- `code` writes back to `attrs.code`.
- `keydown` on `paragraph`/`heading` handles:
  - `Enter` -> split into a new `paragraph` block below
  - `Backspace` at offset `0` -> merge into the previous compatible text block
- Rich-text paste for `paragraph`, `heading`, and `list` is sanitized before writeback.
- `EditorCore.emit('transform', { id, type })` converts between `paragraph`, `heading`, `list`, and `code` while preserving content as far as possible.
- Selection state is mirrored between the canvas DOM and `EditorCore`.

Key snippet (from `canvas.js`):

```js
editable.addEventListener('input', () => {
  scheduleWriteback(`${block.id}:text`, () => {
    const field = block.type === 'code' ? 'code' : 'text';
    const value = block.type === 'paragraph' ? editable.innerHTML : editable.textContent || '';
    EditorCore.setBlockAttrs(block.id, { [field]: value });
  });
});

editable.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter' && !ev.shiftKey && (block.type === 'paragraph' || block.type === 'heading')) {
    ev.preventDefault();
    splitTextBlock(block.id, editable);
  }
  if (ev.key === 'Backspace' && getCaretCharacterOffsetWithin(editable) === 0) {
    mergeTextBlockWithPrevious(block.id);
  }
});
```

## Floating toolbar and inspector behavior

The floating toolbar is implemented in `app-private/editor/toolbar.js` and follows the selected text block.
Its context-to-control visibility is configured in `app-private/editor/toolbar-registry.json`, which is loaded into `window.EDITOR_TOOLBAR_REGISTRY` during editor bootstrap.

Current toolbar groups:

- paragraph/heading/code block selection:
  - block transform (`paragraph`, `heading`, `list`, `code`)
  - move up / move down
  - alignment
  - inline formatting: bold, italic, link, inline code
  - typography: font size, font weight, line height
  - colors: text color, background color, reset styles
  - heading-only level selector
  - delete block
- code block selection:
  - move up / move down
  - language selector (`HTML`, `JSON`, `CSS`, `YAML`)
- list block selection:
  - move up / move down
  - ordered/unordered toggle
- focused list item selection:
  - inline formatting: bold, italic, link, inline code
  - typography: font size, font weight, line height
  - colors: text color, background color, reset styles

The inspector in `app-private/editor/inspector.js` mirrors these controls in grouped sections:

- **Block settings** for alignment, heading level, list ordering, and code language
- **Typography** for shared text styles
- **Attributes** for remaining block attributes

Inline formatting is applied by wrapping the active DOM selection and then syncing the updated HTML back into block attributes.

## List block behavior

- `list` block stores items as nested objects in `attrs.items` and uses `attrs.ordered = true|false` plus `attrs.markerStyle` for marker output.
- Rendered as semantic `<ul>` / `<ol>` trees with nested `<li>` children and a `div[contenteditable]` editor for each item.
- Each editable item carries a stable `data-item-path` such as `0`, `1`, or `0.2` so nested operations can restore focus after re-render.
- Input events update only the targeted nested item inside `attrs.items`.
- `Enter` in a non-empty item inserts a new sibling item below.
- `Enter` in an empty item exits the list into a new paragraph block placed after the list.
- `Backspace` at the start of an item merges it with the previous visible item.
- `Backspace` on an empty first item transforms the whole block into a paragraph.
- `Tab` indents the current item under its previous sibling.
- `Shift+Tab` outdents the current item one level.
- Up/down arrow keys at the text boundaries move focus between visible items.
- Drag-and-drop is enabled on list items and updates the nested item order.
- Selecting the list block itself exposes only block-level list actions in the floating toolbar.
- Focusing a list item switches the floating toolbar into item-formatting mode.
- The toolbar can toggle between ordered and unordered list output by updating `attrs.ordered`.
- Marker style is stored in `attrs.markerStyle`.
- List spacing is stored in `attrs.style.spacing.itemGap` and `attrs.style.spacing.indentWidth`.

## Code block behavior

- Rendered as a contenteditable `<pre>` containing `<code>`, with preserved whitespace and spellcheck disabled.
- Input writes back to `attrs.code` via `EditorCore.setBlockAttrs`.
- Optional `language` attribute stored in `attrs.language`.
- The language control is a fixed dropdown with `HTML`, `JSON`, `CSS`, and `YAML`.

## Accessibility notes

- `contenteditable` elements should have an accessible name, e.g. `aria-label="Paragraph"` or `aria-label="Heading level 2"`.
- Paragraph, heading, list items, and code blocks expose `role="textbox"`; paragraph and code also expose `aria-multiline="true"`.
- Ensure tab order includes toolbar and inspector.

## Example: defining a new text block

```js
// blocks.js
window.EDITOR_BLOCK_DEFINITIONS['pullquote'] = {
  label: 'Pullquote',
  category: 'Text',
  description: 'Highlighted quote with attribution',
  create: (attrs) => ({ id: null, type: 'pullquote', attrs: Object.assign({ text: '', cite: '' }, attrs||{}) }),
  render: (block) => {
    const wrap = document.createElement('blockquote');
    wrap.setAttribute('contenteditable', 'true');
    wrap.innerHTML = block.attrs.text || '';
    return wrap;
  }
};
```

## Events and hooks

- `EditorCore.on('state:changed', callback)` — reacts to full state updates.
- `EditorCore.on('select', block)` — block selected.
- `EditorCore.emit('insert', { type, attrs, afterBlockId })` — insert block.
- `EditorCore.emit('insertPattern', { pattern })` — atomic pattern insertion.
- `EditorCore.emit('transform', { id, type })` — convert an existing text block to another supported text block type.

## Current scope notes

- Implemented in this slice:
  - paragraph edit and split
  - heading edit and split
  - paragraph/heading merge on Backspace at start
  - list item insert and list exit to paragraph
  - nested list indent/outdent and drag reorder
  - code multiline writeback
  - floating contextual toolbar
  - block transforms between paragraph, heading, list, and code
  - text style controls shared by toolbar and inspector
- Deferred from this slice:
  - table block support

## Testing tips

- Use the dev harness `app-private/editor/index.html` and `python -m http.server` to serve the files locally.
- Verify that typing in a paragraph updates the JSON model (`EditorCore.getState().blocks`).
- Verify toolbar-driven transforms and typography updates by watching `EditorCore.getState().blocks`.
- Test Enter splitting, Backspace merge, list item insertion, nested indent/outdent, marker/spacing controls, and ordered/unordered toggle.
