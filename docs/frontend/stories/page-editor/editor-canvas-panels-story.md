Absolutely, Paul — here is the **expanded, deeper, more detailed version** of your user stories for each panel. I’ve kept your structure, tone, and intent, but enriched every story with more nuance, more UX detail, more engineering clarity, and more narrative context so these can drop straight into your PRD or backlog.

No prelude — just the response.

---

# **📘 User Stories for Each Panel in the SWA Page Editor Canvas (Expanded Edition)**

*Designed to mirror the UX philosophy of WordPress FSE while aligning with your SWA static‑first architecture.*

---

# **1. Block Selector Panel (Left Panel)**

*The creative gateway. The place where editors discover what’s possible.*

---

## **1.1 — Browse and Insert Blocks**

**As a** content editor  
**I want** to browse all available blocks in a structured, predictable panel  
**So that** I can quickly find and insert the right building blocks for my page

**Acceptance Criteria**

- Blocks are grouped into intuitive categories (Text, Media, Layout, Design, Custom), each with a clear label and icon.
- Each block displays:
  - A recognizable icon
  - A human-friendly name
  - A short, one-line description
- Clicking a block inserts it at the current cursor position in the canvas.
- Dragging a block reveals contextual drop zones that visually indicate valid insertion points.
- Dropping a block updates the JSON block tree and re-renders the canvas without flicker.
- The `/` inline command opens a lightweight block search overlay directly in the canvas.
- The panel remembers the last category the user viewed during the session.

---

## **1.2 — Search for Blocks**

**As a** content editor  
**I want** to search for blocks by name, keyword, or tag  
**So that** I can avoid scrolling and stay in flow

**Acceptance Criteria**

- Search results update in real time as the user types.
- Search matches:
  - Block names
  - Descriptions
  - Tags defined in the block schema
- Arrow keys navigate results; Enter inserts the highlighted block.
- Escape closes the search and restores the previous panel state.
- Search is fuzzy-tolerant (e.g., “img” returns “Image”).
- Recently used blocks appear as a quick-access section.

---

## **1.3 — Insert Patterns (Reusable Layouts)**

**As a** content editor  
**I want** to insert predefined block patterns  
**So that** I can build pages faster using curated, reusable layouts

**Acceptance Criteria**

- Patterns appear in a dedicated tab with thumbnail previews.
- Each pattern displays a name and short description.
- Clicking a pattern inserts its entire block subtree into the canvas.
- Pattern insertion is atomic — either the full pattern inserts or nothing does.
- Pattern JSON merges cleanly with the existing page JSON.
- Patterns respect theme defaults (colors, spacing, typography).

---

## **1.4 — Insert Media Blocks**

**As a** content editor  
**I want** to insert media blocks (image, video, gallery, file)  
**So that** I can enrich my page with visual and downloadable content

**Acceptance Criteria**

- Media blocks appear in a dedicated tab with clear icons.
- Clicking a media block triggers the media picker (local upload or library).
- Selected media populates the block’s properties immediately.
- Media metadata (alt text, dimensions, file type) is stored in the block JSON.
- The canvas displays a placeholder while media loads.
- Failed uploads show actionable error messages.

---

---

# **2. Properties Panel (Right Panel)**

*The precision instrument. The place where editors refine, tune, and perfect blocks.*

---

## **2.1 — View Block Properties**

**As a** content editor  
**I want** the properties panel to update when I select a block  
**So that** I can configure the block I’m actively working on

**Acceptance Criteria**

- Selecting a block loads its schema-defined properties instantly.
- Properties are grouped into logical sections (Typography, Color, Layout, Dimensions, Advanced).
- Each control maps directly to a JSON field in the block’s node.
- Changes apply immediately to the canvas with no delay.
- Only properties defined in the block schema appear — no hidden or “mystery” fields.
- The panel visually indicates unsaved changes.

---

## **2.2 — Edit Typography**

**As a** content editor  
**I want** to adjust typography settings  
**So that** I can create clear hierarchy and visual rhythm

**Acceptance Criteria**

- Supports size presets (S, M, L, XL, XXL) aligned with theme tokens.
- Supports custom values (px, rem) with validation.
- Supports weight, line-height, letter-spacing, and text-transform.
- Live preview updates the canvas as values change.
- Reset button restores theme defaults.
- Values persist in the block JSON.

---

## **2.3 — Edit Colors**

**As a** content editor  
**I want** to set text and background colors  
**So that** I can match brand guidelines or theme styles

**Acceptance Criteria**

- Color pickers support:
  - Theme palette
  - Custom color input
  - Recently used colors
- Accessibility contrast warnings appear when needed.
- Reset option restores theme defaults.
- Colors serialize into the block JSON as hex or theme token references.
- Transparent backgrounds are supported where applicable.

---

## **2.4 — Edit Dimensions**

**As a** content editor  
**I want** to adjust padding, margin, and spacing  
**So that** I can fine-tune layout and alignment

**Acceptance Criteria**

- Supports linked/unlinked values for padding and margin.
- Supports responsive overrides (mobile/tablet/desktop).
- Canvas updates spacing visually in real time.
- Values persist in JSON using consistent units.
- Invalid values trigger inline validation messages.

---

## **2.5 — Advanced Block Settings**

**As a** developer  
**I want** to set custom CSS classes, IDs, and data attributes  
**So that** I can target blocks with custom styling or scripts

**Acceptance Criteria**

- Advanced section is collapsible and hidden by default.
- Supports:
  - Custom class names
  - Unique IDs
  - Arbitrary data-* attributes
- Duplicate IDs trigger validation errors.
- All values serialize into the block JSON.
- The canvas reflects class-based styling immediately.

---

---

# **3. Document Overview Panel (Structure Panel / List View)**

*The structural map. The bird’s-eye view of the entire page.*

---

## **3.1 — View Page Structure**

**As a** content editor  
**I want** to see a hierarchical outline of all blocks  
**So that** I can understand and navigate the page structure

**Acceptance Criteria**

- Displays the full block tree in nested, collapsible form.
- Each item shows block icon + name.
- Selecting an item highlights the block in the canvas.
- Canvas scrolls smoothly to the selected block.
- The selected block is highlighted in both the canvas and the list.
- The outline updates instantly when blocks are added, removed, or moved.

---

## **3.2 — Reorder Blocks**

**As a** content editor  
**I want** to reorder blocks using drag-and-drop  
**So that** I can restructure the page efficiently

**Acceptance Criteria**

- Dragging a block shows valid drop targets with visual cues.
- Dropping updates the JSON tree and re-renders the canvas.
- Nested blocks maintain valid parent-child relationships.
- Invalid moves (e.g., placing a non-layout block inside a layout-only container) are prevented.
- Reordering updates the Document Overview and canvas simultaneously.

---

## **3.3 — Collapse and Expand Sections**

**As a** content editor  
**I want** to collapse or expand block groups  
**So that** I can manage long or complex pages

**Acceptance Criteria**

- Blocks with children show a collapsible arrow.
- Collapse state persists during the editing session.
- Collapsing does not affect the canvas.
- Deeply nested structures remain navigable.

---

## **3.4 — Select Blocks from the Outline**

**As a** content editor  
**I want** to select blocks from the outline  
**So that** I can quickly jump to deeply nested blocks

**Acceptance Criteria**

- Clicking an item selects the corresponding block.
- Canvas scrolls to the block with smooth animation.
- Properties panel updates to reflect the selected block.
- Selection state is synchronized across all three panels.

---

## **3.5 — Delete Blocks from the Outline**

**As a** content editor  
**I want** to delete blocks directly from the structure panel  
**So that** I can quickly remove unwanted sections without hunting for them in the canvas

**Acceptance Criteria**

- Delete action appears on hover or via context menu.
- Confirmation modal prevents accidental deletion.
- Deleting a block removes its entire subtree.
- JSON tree updates immediately.
- Canvas and outline re-render to reflect the change.

---

If you want, I can now produce:

- **Developer acceptance tests (Gherkin)**
- **Non‑negotiable UX rules for all panels**
- **Block schema examples for each property type**
- **A full PRD section combining these stories into a cohesive spec**

Just tell me where you want to go next.
