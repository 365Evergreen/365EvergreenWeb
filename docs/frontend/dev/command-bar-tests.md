# Command Bar — Tests & QA Checklist

Manual tests

- [ ] Verify the command bar is visible at the top of the editor (`app-private/editor/index.html`).
- [ ] Left zone: click Back — confirm navigation prompt appears.
- [ ] Left zone: Toggle blocks panel (button and Shift+Alt+B) — panel opens/closes and state persists on reload.
- [ ] Center: click Preview — editor enters preview-mode; editing is disabled and canvas shrinks for device previews.
- [ ] Center: device buttons (Desktop/Tablet/Mobile) change canvas width and persist across reload.
- [ ] Center: Undo/Redo buttons revert and reapply changes to the editor model (insert, edit, reorder).
- [ ] Right: Save (Ctrl+S) calls `/api/savePage` (dev stub) and shows visual saving state.
- [ ] Right: Publish calls `/api/publishPage` (dev stub).
- [ ] Right: More menu actions display confirmation or perform stubs.
- [ ] Accessibility: all buttons have aria labels and keyboard focusable.

Automated smoke tests (suggested)

- Simple unit: call `EditorCore.setState()` and assert `state:changed` triggers history push and that `undo()` restores previous state.
- Shortcut tests: simulate keyboard events for Ctrl+S and Shift+Alt+B and assert corresponding handlers called (spy/stub fetch for save).

QA notes

- Replace dev stub endpoints with real serverless functions before shipping.
- Remove sync XHR icon merge used in development and replace with async + re-render.
- Consider extracting toolbar wiring into a small module for unit testing.
