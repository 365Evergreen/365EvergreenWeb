# **📘 User Stories for the List Block**

*The List Block supports ordered and unordered lists, nested lists, keyboard behaviors, formatting, and layout controls.*

---

# **1. Core List Block Behavior**

---

## **1.1 — Create a List Block**

**As a** content editor  
**I want** to insert a List block  
**So that** I can present information in a structured, scannable format

**Acceptance Criteria**

- Inserting a List block creates the first list item automatically.

- The cursor is placed inside the first item.

- JSON structure:
  
  ```json
  {
    "type": "list",
    "ordered": false,
    "items": [
      { "content": "" }
    ]
  }
  ```

- The block renders as `<ul>` or `<ol>` depending on the `ordered` property.

---

## **1.2 — Switch Between Ordered and Unordered Lists**

**As a** content editor  
**I want** to toggle between bulleted and numbered lists  
**So that** I can choose the appropriate list style

**Acceptance Criteria**

- Toolbar toggle switches between:
  - Unordered (•)
  - Ordered (1.)
- JSON updates `ordered: true/false`.
- Canvas re-renders instantly.
- Nested lists inherit the parent’s type unless overridden.

---

# **2. Editing List Items**

---

## **2.1 — Add New List Items**

**As a** content editor  
**I want** to press Enter to create a new list item  
**So that** I can build lists quickly

**Acceptance Criteria**

- Pressing Enter creates a new item below the current one.
- JSON appends a new `{ "content": "" }` object.
- Cursor moves to the new item.
- Pressing Enter on an empty item exits the list and creates a Paragraph block.

---

## **2.2 — Edit List Item Content**

**As a** content editor  
**I want** to type freely inside a list item  
**So that** I can write clear, descriptive list entries

**Acceptance Criteria**

- Inline formatting supported:
  - Bold
  - Italic
  - Link
  - Inline code
- Formatting stored in the item’s `content` as rich text JSON.
- Multi-line text wraps inside the same list item.

---

## **2.3 — Delete List Items**

**As a** content editor  
**I want** to delete a list item using Backspace  
**So that** I can remove items naturally

**Acceptance Criteria**

- Backspace at the start of an item merges it with the previous item.
- If the item is the first item and empty, the block transforms into a Paragraph block.
- JSON updates accordingly.

---

# **3. Nesting and Hierarchy**

---

## **3.1 — Create Nested Lists**

**As a** content editor  
**I want** to indent a list item  
**So that** I can create hierarchical lists

**Acceptance Criteria**

- Pressing Tab indents the current item.

- A new nested list is created if none exists.

- JSON structure becomes:
  
  ```json
  {
    "content": "Parent",
    "children": [
      { "content": "Child item" }
    ]
  }
  ```

- Canvas visually indents nested items.

---

## **3.2 — Outdent List Items**

**As a** content editor  
**I want** to outdent a list item  
**So that** I can adjust the hierarchy

**Acceptance Criteria**

- Pressing Shift+Tab moves the item up one level.
- If the item has children, they move with it.
- JSON updates parent-child relationships accordingly.

---

## **3.3 — Drag-and-Drop Reordering**

**As a** content editor  
**I want** to reorder list items using drag-and-drop  
**So that** I can restructure lists visually

**Acceptance Criteria**

- Dragging an item shows valid drop targets.
- Items can be moved within the same level or nested under another item.
- JSON updates item order and nesting.

---

# **4. Styling and Layout**

---

## **4.1 — Typography Controls**

**As a** content editor  
**I want** to adjust typography for the entire list  
**So that** the list matches the page’s design

**Acceptance Criteria**

- Controls:
  - Font size
  - Line height
  - Weight
  - Text color
- Styling stored in the block’s `style` object.
- Canvas updates instantly.

---

## **4.2 — Spacing Controls**

**As a** content editor  
**I want** to adjust spacing between list items  
**So that** I can control readability

**Acceptance Criteria**

- Controls:
  - Item gap
  - Indentation width
- JSON stores spacing in `style.spacing`.
- Canvas updates instantly.

---

## **4.3 — List Marker Style (Advanced)**

**As a** content editor  
**I want** to choose different bullet or number styles  
**So that** the list matches the design system

**Acceptance Criteria**

- Unordered options:
  - Disc
  - Circle
  - Square
- Ordered options:
  - 1., a., A., i., I.
- JSON stores: `markerStyle`.
- Canvas updates instantly.

---

# **5. Transformations**

---

## **5.1 — Transform List to Paragraphs**

**As a** content editor  
**I want** to convert a list into paragraphs  
**So that** I can restructure content easily

**Acceptance Criteria**

- Each list item becomes a Paragraph block.
- Nested lists become nested Groups of Paragraphs.
- Content preserved.

---

## **5.2 — Transform Paragraphs to List**

**As a** content editor  
**I want** to convert multiple paragraphs into a list  
**So that** I can quickly structure content

**Acceptance Criteria**

- Selected paragraphs become list items.
- JSON creates a new List block with items.
- Inline formatting preserved.

---

# **6. Accessibility & Semantics**

---

## **6.1 — Semantic HTML Output**

**As a** developer  
**I want** the list to render as semantic HTML  
**So that** screen readers and SEO tools interpret it correctly

**Acceptance Criteria**

- `<ul>` for unordered lists.
- `<ol>` for ordered lists.
- Nested lists render as nested `<ul>` or `<ol>`.
- ARIA attributes added for nested lists.

---

## **6.2 — Accessible Keyboard Navigation**

**As a** keyboard user  
**I want** to navigate list items using the keyboard  
**So that** I can edit without a mouse

**Acceptance Criteria**

- Arrow keys move between items.
- Tab/Shift+Tab indent/outdent.
- Enter creates new item.
- Backspace merges items.

---

# **7. JSON Schema Requirements**

---

## **7.1 — List Block Schema**

**As a** developer  
**I want** a predictable JSON schema  
**So that** the renderer and editor behave consistently

**Acceptance Criteria**

- Schema includes:
  
  ```json
  {
    "type": "list",
    "ordered": false,
    "markerStyle": "disc",
    "items": [
      {
        "content": "<rich text>",
        "children": []
      }
    ],
    "style": {
      "typography": {},
      "spacing": {}
    }
  }
  ```

- Schema supports unlimited nesting.

---
