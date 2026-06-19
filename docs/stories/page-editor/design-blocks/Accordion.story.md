# Accordion Block

Story: A vertical list of collapsible panels that reveal content when toggled. Use for FAQs, details sections, or any content that benefits from progressive disclosure.

Example:

```
<!-- Accordion with two panels -->
<!-- Panel 1: open by default -->
<!-- Panel 2: closed by default -->
```

Acceptance Criteria:
- Panels can be expanded and collapsed individually.
- Only the toggled panel changes state; other panels remain as-is.
- Keyboard accessible: Enter/Space toggles focused panel; Arrow keys move between headers.
- Correct ARIA attributes are present (aria-expanded, aria-controls, role="button"/"region").
- Visual focus indicator is visible when a header is focused.
