**Per-block Toolbar Architecture**

Summary:
- Move from a centralized toolbar registry and dynamic rendering to attaching a lightweight toolbar to each block instance at render time.
- Use the existing `toolbar-controls.csv` (and `toolbar-controls.json`) as the single source of truth for control metadata and visibility mapping.

Goals:
- Make the toolbar easier to reason about and test by colocating toolbar DOM with each block's DOM.
- Keep the control metadata data-driven (CSV/JSON) so editors can update controls without changing code.
- Reduce runtime complexity of looking up variable names across global scope.

Rationale:
- Centralized registries force a global "control factory" and brittle name-resolution logic. By attaching a toolbar to each block we:
  - simplify lifecycle (create/destroy with block)
  - localize event handlers and state sync
  - make it obvious which controls apply to which block context

Design Overview:

- Data: `docs/stories/page-editor/toolbar-controls.csv` (exported also as `app-private/editor/toolbar-controls.json`) contains rows:
  - `control,variable,type,label,contexts`
  - `contexts` is a semicolon-separated list of block contexts (e.g. `paragraph;heading;image`).

- ToolbarFactory (new module)
  - responsibility: read `window.EDITOR_TOOLBAR_CONTROLS` (or fetch CSV/JSON during bootstrap), expose a stable API:
    - `ToolbarFactory.getControlsForContext(contextKey)` → returns an ordered list of control descriptors for that context
    - `ToolbarFactory.createToolbar(hostElement, contextKey, blockApi)` → mounts DOM for controls into `hostElement` and wires events to `blockApi` (a small adapter to `EditorCore` for the block)

- Block rendering changes
  - Each block's `render` function will create a small toolbar container at the top (or overlay) of the block DOM, e.g. `<div class="pe-block-toolbar" aria-hidden="true"></div>`.
  - After block DOM is created, call `ToolbarFactory.createToolbar(toolbarHost, contextKey, blockApi)`.
  - `contextKey` is a block-specific string, e.g. `paragraph`, `gallery:block`, `gallery:image`. Use the block type and any sub-context to pick controls.

- Control wiring
  - Each control descriptor in the CSV includes a `variable` (logical name) and `type` (button/select/toggle/menu/color/etc.). `ToolbarFactory` maps types to element builders ( `createButton`, `createSelect`, `createColorInput`, `createMenu` ).
  - Each element is given a data attribute containing the control id (e.g. `data-control="move-up"`) and an event handler that calls `blockApi` methods such as `moveUp()`, `setAttr()`, `toggleListMode()`.
  - `blockApi` is a tiny object provided by the block's renderer with the minimum operations the toolbar needs. Example:

  ```js
  const blockApi = {
    id: block.id,
    getAttrs: () => EditorCore.getBlock(block.id).attrs,
    setAttrs: (patch) => EditorCore.setBlockAttrs(block.id, patch),
    moveUp: () => EditorCore.moveBlockUp(block.id),
    moveDown: () => EditorCore.moveBlockDown(block.id),
    openTransformPicker: () => EditorCore.openTransformPicker(block.id)
  };
  ```

- State & accessibility
  - Toolbars must reflect block state (e.g., selection, active inline style). The `blockApi` should provide a `subscribe` callback (or use `EditorCore.on`) so the toolbar can update control states.
  - Toolbars should be keyboard-accessible (tab order, ARIA roles). When block is not selected, toolbars can be visually hidden or collapsed but still present in the DOM to keep a11y tree stable.

Migration steps (recommended):
1. Add `ToolbarFactory` module under `app-private/editor/toolbar-factory.js` that exposes `createToolbar` and `getControlsForContext`.
2. Ensure `app-private/editor/index.html` bootstraps `window.EDITOR_TOOLBAR_CONTROLS` by loading `toolbar-controls.json` synchronously (same as `toolbar-registry.json`).
3. Update block renderers (start with `paragraph`, `heading`, `image`) to create a `.pe-block-toolbar` host and call `ToolbarFactory.createToolbar(...)`.
4. Convert existing global `toolbar.js` control builders (createButton/createSelect helpers) into small reusable functions in `toolbar-factory.js`.
5. Remove the large centralized `controlRegistry` and adjust any remaining code paths that referenced it to use `ToolbarFactory.getControlsForContext`.
6. Run manual acceptance: select block types and verify the toolbar shows only controls defined by `toolbar-controls.csv` for that context.

Acceptance Criteria / Tests:
- For a `paragraph` block, controls listed in `toolbar-controls.csv` contexts containing `paragraph` should appear in the block's toolbar.
- Controls should call the same EditorCore APIs with the same effect as prior centralized controls.
- Keyboard navigation works and controls are labelled using the CSV `label` field.
- When a block is destroyed, its toolbar DOM and subscriptions are cleaned up.

Files to change (initial pass):
- `app-private/editor/toolbar.js` — split: keep global behaviors (floating command bar) but move block-specific builders into `toolbar-factory.js`.
- `app-private/editor/toolbar-factory.js` — new.
- `app-private/editor/blocks.js` — update `render` functions for target blocks to create toolbar host and call factory.
- `app-private/editor/index.html` — ensure `toolbar-controls.json` is available as `window.EDITOR_TOOLBAR_CONTROLS`.
- `docs/stories/page-editor/toolbar-controls.csv` — source of truth (already present).

Rollout plan:
1. Implement `toolbar-factory` and wire into a small set of blocks (paragraph, heading, image).
2. Smoke test the editor and run through acceptance criteria.
3. Migrate remaining blocks in batches.
4. Remove legacy centralized registry and unused code once the UI is stable.

Notes and trade-offs:
- Attaching a toolbar per block increases DOM nodes but improves locality and simplifies event handling. Use `will-change`/`contain` CSS where needed to avoid layout thrash for large documents.
- Keeping the CSV/JSON mapping preserves the goal of data-driven control visibility; the `ToolbarFactory` acts as the small runtime that interprets that mapping.

Questions for reviewers:
- Should styles for block toolbars be centralized in `design-system/block-toolbar.css` or colocated with block styles? (recommended: centralized stylesheet)
- Do you want the per-block toolbar to always be present in the DOM (but visually hidden) to simplify a11y and testing, or be created/destroyed on selection? (recommended: present, but collapsed)

---
Document created by the editor-team automation. Update this file with implementation notes and links to PRs when ready.
