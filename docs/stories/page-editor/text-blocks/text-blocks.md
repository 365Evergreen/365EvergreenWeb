Here you go, Paul — **deep, developer‑ready user stories** for the core **Text Blocks** in your SWA block editor. These follow the same narrative and structural depth as the previous stories, and they map cleanly to your JSON‑driven block schema and FSE‑style UX.

No filler — just the stories.

---

# **📘 User Stories for Text Blocks (Paragraph, Heading, List, Code, Table)**

*These stories define how each block behaves inside the SWA Page Editor Canvas, mirroring WordPress FSE but adapted for your static architecture.*

---

# **1. Paragraph Block**

*The foundational text block. The default block. The one users interact with the most.*

---

## **1.1 — Create and Edit Paragraph Text**

**As a** content editor  
**I want** to type freely into a paragraph block  
**So that** I can write narrative content without friction

**Acceptance Criteria**

- Clicking an empty paragraph places the cursor and activates typing mode.
- Pressing Enter creates a new paragraph block below.
- Pressing Backspace at the start of a paragraph merges it with the previous block.
- Inline formatting toolbar appears on text selection (bold, italic, link, inline code).
- The block supports multi-line text with automatic wrapping.
- Text updates are written to the block’s `content` field in JSON.
- The block auto-expands vertically as content grows.
- Pasting plain text preserves paragraphs; pasting rich text strips unsupported formatting.

---

## **1.2 — Style Paragraph Text**

**As a** content editor  
**I want** to adjust typography and color  
**So that** my text matches the design of the page

**Acceptance Criteria**

- Typography controls: size presets, custom size, weight, line-height.
- Color controls: text color, background color, theme palette support.
- Reset options restore theme defaults.
- All styling is stored in the block’s `style` object.
- Canvas updates immediately as values change.

---

## **1.3 — Transform Paragraph to Other Text Blocks**

**As a** content editor  
**I want** to convert a paragraph into a heading, list, or quote  
**So that** I can restructure content without retyping

**Acceptance Criteria**

- Transform menu appears in the floating toolbar.
- Supported transforms: Heading, List, Quote, Code.
- Content is preserved during transformation.
- JSON node type updates while retaining shared properties.

---

---

# **2. Heading Block**

*The structural anchor of the page. Defines hierarchy and improves scannability.*

---

## **2.1 — Insert and Edit Headings**

**As a** content editor  
**I want** to insert headings of different levels  
**So that** I can structure my content semantically

**Acceptance Criteria**

- Heading levels H1–H6 are selectable from the toolbar and properties panel.
- Default level is H2 (configurable in theme).
- Changing the level updates the block’s `level` property in JSON.
- Typing behaves like a paragraph but without multi-paragraph support.
- Pressing Enter creates a new paragraph block below.

---

## **2.2 — Style Headings**

**As a** content editor  
**I want** to adjust typography and color  
**So that** headings visually match the design system

**Acceptance Criteria**

- Supports theme typography presets for each level.
- Supports custom overrides (size, weight, line-height).
- Supports text and background color.
- Styling is stored in the block’s `style` object.
- Canvas updates instantly.

---

## **2.3 — Transform Headings**

**As a** content editor  
**I want** to convert a heading into a paragraph or another heading level  
**So that** I can adjust hierarchy without rewriting content

**Acceptance Criteria**

- Transform menu supports: Paragraph, Heading (H1–H6).
- Content is preserved.
- JSON node type and level update accordingly.

---

---

# **3. List Block**

*The structured text block for ordered and unordered lists.*

---

## **3.1 — Create and Edit Lists**

**As a** content editor  
**I want** to create bulleted or numbered lists  
**So that** I can present information in a structured format

**Acceptance Criteria**

- List type toggle: unordered (•) or ordered (1.).
- Pressing Enter creates a new list item.
- Pressing Enter on an empty item exits the list and creates a paragraph block.
- Pressing Tab indents the current item (creates nested list).
- Pressing Shift+Tab outdents the current item.
- List items are stored as an array in JSON.
- Nested lists are represented as nested arrays.

---

## **3.2 — Style Lists**

**As a** content editor  
**I want** to style list text  
**So that** lists match the page’s typography

**Acceptance Criteria**

- Typography controls apply to all items in the list.
- Color controls apply to text and bullets/numbers.
- Spacing controls adjust item spacing and indentation.
- All styling is stored in the block’s `style` object.

---

## **3.3 — Transform Lists**

**As a** content editor  
**I want** to convert a list into paragraphs or vice versa  
**So that** I can restructure content easily

**Acceptance Criteria**

- Transform menu supports: Paragraph, Quote, Code.
- Each list item becomes a separate paragraph when transforming to paragraphs.
- Content is preserved.

---

---

# **4. Code Block**

*A monospaced block for displaying code snippets, technical content, or preformatted text.*

---

## **4.1 — Insert and Edit Code Blocks**

**As a** developer or technical writer  
**I want** to insert a code block  
**So that** I can display code snippets with preserved formatting

**Acceptance Criteria**

- Code block uses a monospaced font by default.
- Supports multi-line content with preserved whitespace.
- No inline formatting (bold, italic, links) is allowed.
- Pasting code preserves indentation and line breaks.
- Content is stored as raw text in the block’s `content` field.

---

## **4.2 — Style Code Blocks**

**As a** developer  
**I want** to adjust background color and padding  
**So that** code blocks are visually distinct

**Acceptance Criteria**

- Supports background color (theme palette + custom).
- Supports padding controls.
- Supports optional border or outline.
- All styling is stored in the block’s `style` object.

---

## **4.3 — Syntax Highlighting (Optional Feature)**

**As a** developer  
**I want** syntax highlighting  
**So that** code is easier to read

**Acceptance Criteria**

- Language selector (e.g., JS, HTML, CSS, Python).
- Highlighting applied in the canvas preview.
- Language stored in the block’s `language` property.
- Highlighting does not affect the saved HTML output unless enabled in theme.

---

---

# **5. Table Block**

*A structured block for tabular data, with row/column controls and cell-level editing.*

---

## **5.1 — Create and Edit Tables**

**As a** content editor  
**I want** to create tables with rows and columns  
**So that** I can present structured data clearly

**Acceptance Criteria**

- Insert table dialog asks for initial rows and columns.
- Cells are editable directly in the canvas.
- Pressing Tab moves to the next cell; Shift+Tab moves backward.
- Pressing Enter creates a new paragraph inside the cell (not a new row).
- Table structure is stored as a 2D array in JSON.

---

## **5.2 — Modify Table Structure**

**As a** content editor  
**I want** to add or remove rows and columns  
**So that** I can adjust the table as needed

**Acceptance Criteria**

- Toolbar controls:
  - Add row above/below
  - Add column left/right
  - Delete row
  - Delete column
- JSON updates reflect structural changes.
- Canvas re-renders without losing cell content.

---

## **5.3 — Style Tables**

**As a** content editor  
**I want** to style table cells and borders  
**So that** the table matches the design system

**Acceptance Criteria**

- Supports:
  - Header row toggle
  - Striped rows toggle
  - Cell padding
  - Border width/color
  - Background color per row or cell
- Styling stored in the block’s `style` object.
- Canvas updates instantly.

---

## **5.4 — Responsive Behavior**

**As a** content editor  
**I want** tables to behave predictably on small screens  
**So that** content remains readable

**Acceptance Criteria**

- Responsive mode options:
  - Scroll horizontally
  - Stack rows
  - Collapse into key-value pairs
- Selected mode stored in JSON.
- Canvas preview updates accordingly.

---

# 
