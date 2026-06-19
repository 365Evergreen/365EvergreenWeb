# Design Blocks — Developer Spec

This dev spec documents implementation details and examples for: Group, Row, Stack, Columns, Column, Separator, Spacer.

Goals
- Meet the user stories and acceptance criteria in `design-blocks.md`.
- Provide code snippets for block registration, create/render semantics, and JSON storage shape.
- Include a simple automated test harness to validate the runtime block definitions.

Block JSON contract
- Every block definition stored in `window.EDITOR_BLOCK_DEFINITIONS` should include:
  - `label`: human readable name
  - `category`: block category
  - `description`
  - `create(attrs)`: factory returning { id, type, attrs }
  - `render(block)`: DOM element (optional for container-only blocks)

1) Group
- Purpose: container with `children` array and layout controls.
- Storage shape example:

{
  id: null,
  type: 'group',
  attrs: {
    title: 'Section heading',
    layout: 'stack',
    children: [ /* child blocks JSON here */ ],
    padding: '2rem 1.5rem',
    className: '',
    align: 'wide'
  }
}

- Create snippet (blocks.js style):

create: (attrs)=> ({
  id: null,
  type: 'group',
  attrs: Object.assign({ title: 'Section heading', layout: 'stack', children: [], padding: '2rem 1.5rem', className: '', align: 'wide' }, attrs||{})
})

- Acceptance tests:
  - `create().attrs.children` is an array.
  - Group render should iterate children and render each child block inside container.

2) Columns + Column
- Purpose: `columns` block auto-creates `Column` children and stores widths.
- Storage shape example:
{
  id: null,
  type: 'columns',
  attrs: {
    columns: 2,
    gap: '24px',
    children: [ { type:'column', attrs:{ width:'1fr', children: [...] } }, {...} ]
  }
}

- Create snippet (blocks.js style):

create: (attrs)=> {
  const cfg = Object.assign({ columns: 2, gap: '24px' }, attrs||{});
  const cols = parseInt(cfg.columns,10) || 2;
  const children = Array.from({length:cols}).map(()=> window.EDITOR_BLOCK_DEFINITIONS.column.create({ width: '1fr' }));
  return { id:null, type:'columns', attrs: Object.assign({ columns: cols, gap: cfg.gap, children }, {}) };
}

- Column create snippet:
create: (attrs)=> ({ id:null, type:'column', attrs: Object.assign({ width: '1fr', children: [] }, attrs||{}) })

- Acceptance tests:
  - `columns.create().attrs.children.length === columns`
  - Each child is `type==='column'` and has an `attrs.children` array.

3) Row
- Purpose: horizontal container with responsive behavior.
- Create example:
create: () => ({ id:null, type:'row', attrs: { justify: 'space-between', gap: '16px', wrap: true, children: [] } })

- Acceptance: children array exists; gap and responsive flags stored.

4) Stack
- Purpose: vertical stack container.
- Create example:
create: () => ({ id:null, type:'stack', attrs: { gap: '16px', children: [] } })

- Acceptance: children array exists.

5) Separator
- Purpose: single-line divider
- Create example:
create: () => ({ id:null, type:'separator', attrs: { style: 'solid', thickness: '2px', width: 'full', align: 'center' } })

- Acceptance: attrs has `style`, `thickness`, `width`.

6) Spacer
- Purpose: adjustable vertical space
- Create example:
create: () => ({ id:null, type:'spacer', attrs: { height: '48px', preset: 'medium' } })

- Acceptance: attrs.height exists and supports px/rem/token values.

Testing
- A small Node script `tests/test-blocks.js` is provided to load `app-private/editor/blocks.js` inside a VM with `window` object and validate the contracts.

Run tests locally:

```bash
node tests/test-blocks.js
```

If all checks pass the script exits `0` and prints `PASS`.

Notes
- The runtime creates Column children by calling `window.EDITOR_BLOCK_DEFINITIONS.column.create()` to ensure consistent defaults.
- Prefer storing minimal data in `block-registry.json` and resolve icons at runtime via `design-system/icon-registry.json` (already implemented in `index.html`).
