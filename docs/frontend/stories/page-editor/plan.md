## Plan: Page Editor Story & Docs

TL;DR - Create a clear implementation plan to align the existing page-editor stories (UX/acceptance) with the code in `app-private/page-editor.*`, split the editor into modular components, and add verification so the stories map to testable behavior. Reuse existing block schema, styles, and persistence patterns.

**Steps**
1. Discovery (done): inventory docs and code referencing page-editor and extract canonical artifacts (stories, BLOCK_DEFINITIONS, CSS tokens). *status: complete*
2. Alignment: confirm scope and priorities with the product/author (decide which stories to implement first: Inserter/Canvas/Inspector, Templates, or Media). *depends on user feedback*
3. Design: produce a module split and file-level plan:
   - Define `editor/core` (state manager + serializer)
   - Define `editor/ui/inserter`, `editor/ui/canvas`, `editor/ui/inspector` (small APIs: `select`, `insert`, `update`, `serialize`)
   - Extract `BLOCK_DEFINITIONS` to `editor/blocks.json` or `editor/blocks.js`
   - Keep styles in `design-system/styles.css` and create a small `page-editor.css` that composes tokens
   - Add a small `editor/index.html` sample harness (copy of `app-private/page-editor.html`) for local dev and visual testing
4. Implementation (stepwise, verifiable):
   1. Extract `BLOCK_DEFINITIONS` into `app-private/editor/blocks.js` and import from `page-editor.js` (*blocks extraction - non-breaking change*)
   2. Create `app-private/editor/core.js` exposing state manager, undo/redo, and `save()` API (*depends on step 4.1*)
   3. Split UI into `app-private/editor/inserter.js`, `.../canvas.js`, `.../inspector.js` and wire through `core.js` (*parallel with step 4.2 after export API stable*)
   4. Add minimal unit tests or JSON round-trip tests for serializer in `tests/editor/serializer.test.js` (node-based using `jest` or a simple harness) (*depends on step 4.2*)
   5. Update `app-private/page-generator.html` to re-use new modules (smoke test) (*depends on 4.3*)
   6. Update docs: add a short Implementation Notes section in [docs/stories/page-editor/page-editor-stories.md](docs/stories/page-editor/page-editor-stories.md) explaining the module split and how to run the harness
5. Verification:
   - Automated: serializer round-trip tests (serialize -> deserialize -> equals original), block factory unit tests for a sample of blocks
   - Manual: run the editor harness, test insert/update/delete, undo/redo, save/publish flow, and ensure visual parity with `app-private/page-editor.html`
   - Acceptance: map each story in [docs/stories/page-editor/page-editor-stories.md](docs/stories/page-editor/page-editor-stories.md) to at least one test or manual checklist item

**Relevant files**
- [docs/stories/page-editor/page-editor-stories.md](docs/stories/page-editor/page-editor-stories.md) — acceptance criteria and UX stories
- [docs/stories/page-editor/editor-canvas-story.md](docs/stories/page-editor/editor-canvas-story.md)
- [app-private/page-editor.html](app-private/page-editor.html) — current harness
- [app-private/page-editor.js](app-private/page-editor.js) — current monolithic editor JS
- [app-private/page-generator.html](app-private/page-generator.html) — reuses editor assets
- [design-system/styles.css](design-system/styles.css) — shared editor styles

**Verification**
1. Add a small JS-based test harness that can run in Node (or headless Chrome) to exercise serializer and block factory
2. Run manual checklist: inserter shows categories, inserting a text block sets placeholder, inspector updates block content, save persists JSON to API endpoint
3. Visual diff: compare current `app-private/page-editor.html` vs new harness for layout regressions

**Decisions / Assumptions**
- Keep existing DOM/CSS class names to minimize visual regressions
- Prefer a JS module split (ESM) under `app-private/editor/` rather than full framework rewrite
- Block schema remains canonical and is the single source of truth

**Further Considerations / Questions**
1. Priority: which stories do you want implemented first? (Inserter/Canvas/Inspector / Templates / Media)
2. Testing: do you prefer `jest`/`vitest` or a lightweight harness for serializer tests? Recommendation: `vitest` for speed.
3. Deployment: should the refactor be merged behind a feature flag or replace the existing `page-editor.html` immediately? Recommendation: feature-flagged rollout.


-- End of plan
