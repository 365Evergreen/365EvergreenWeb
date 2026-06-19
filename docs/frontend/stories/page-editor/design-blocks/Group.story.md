# Group Block

Story: A container that groups multiple blocks together to apply shared settings (background, padding, layout). Useful for creating sections.

Example:

```
<!-- Group with background and inner text blocks -->
```

Acceptance Criteria:
- Group applies background, padding, and layout settings to all inner blocks.
- Inner blocks remain editable individually.
- Group supports layout presets (full-width, constrained).
- Settings persist and are serializable in block markup.
- Accessibility: background contrast remains sufficient for contained text.
