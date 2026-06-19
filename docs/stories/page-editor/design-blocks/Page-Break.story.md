# Page Break Block

Story: A block that forces a page break in paginated output or print views. Use for long posts intended for print or paginated display.

Example:

```
<!-- Page Break inserted between sections -->
```

Acceptance Criteria:
- Inserts a printable page break in print styles (CSS page-break properties).
- In paginated views, content after the block begins on a new page.
- Editor displays a visible marker for the break.
- Does not affect single-page web views beyond print/pagination contexts.
- Accessible: marker includes helpful title/label for tooling.
