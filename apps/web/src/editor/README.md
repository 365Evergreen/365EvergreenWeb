# Page Editor — editor/ (dev + production)

This folder contains the editor modules and a small development harness used to build and iterate the page editor UI.

- Production page: [app-private/pages/content/page-editor.html](app-private/pages/content/page-editor.html)
  - This is the canonical, templated editor page shipped with the site.
  - Edit the production layout or assets only when you want changes to appear on the live site.

- Development harness: [app-private/editor/index.html](app-private/editor/index.html)
  - Lightweight page used for fast iteration on shared utilities plus the per-block modules loaded by `index.html`: `blocks.js`, `core.js`, `inserter.js`, `canvas.js`, `inspector.js`, `toolbar.js`.
  - Use this harness to develop and test interactive features (inserter, selection, drag/drop, inspector) without touching the production template.

Guidelines
- Prefer to implement and test new behavior in the dev harness first. Once stable, port only the necessary module imports and minimal initialization to the production page.
- Keep `window.EDITOR_BLOCK_DEFINITIONS` and `window.EditorCore` as the stable runtime contracts between modules and the production page.
- Avoid coupling the production template to development-only helpers (test UI, debug panels, or large mock datasets).

Running locally
- Open `app-private/editor/index.html` in a browser (or a local static server) to iterate quickly.
- When ready, update [app-private/pages/content/page-editor.html](app-private/pages/content/page-editor.html) to reference the same module files (or a bundled version) and verify integration.

Quick tips
- `core.js` provides a tiny event bus and `renderTree(blocks, container)` helper used by the canvas.
- `blocks.js` contains shared editor utilities; register block types from `app-private/editor/blocks/<type>/index.js`.
- `canvas.js` owns the in-memory block tree; it emits `change` events and responds to `insert`, `delete`, `move`, and `load` events.

If you'd like, I can:
- Continue implementing the inline "/" inserter and drag-and-drop insertion.
- Add serialization (save) UI and a publish preview.
- Wire a minimal test that verifies block round-trip serialization.
