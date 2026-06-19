# **📘 User Stories: Editor Canvas Command Bar (WordPress‑Accurate Version)**  
_Aligned with the official WordPress Block Editor experience._

The command bar is divided into three functional zones, matching WordPress:

1. **Left Zone — Navigation, Inserter, Page Title**  
2. **Center Zone — Block Toolbar (contextual)**  
3. **Right Zone — Editor Tools, Save/Publish, Settings, More Options**

---

# **1. Left Zone: Navigation, Inserter, Page Title**

---

## **1.1 — Return to Dashboard / Pages List**
**As a** content editor  
**I want** a back button to exit the editor  
**So that** I can return to the dashboard or pages list  

**Acceptance Criteria**  
- Back arrow appears at the far left (WordPress: “W” icon or site icon).  
- Clicking opens a confirmation modal if there are unsaved changes.  
- Navigates to the Pages or Posts list.  
- Does not modify the page content.

---

## **1.2 — Global Inserter (Block Picker)**
**As a** content editor  
**I want** a global inserter button  
**So that** I can browse and insert blocks anywhere in the document  

**Acceptance Criteria**  
- Inserter button (“+”) appears next to the back button.  
- Clicking opens the **Block Inserter Sidebar** on the left.  
- Inserter includes:  
  - Blocks  
  - Patterns  
  - Reusable blocks  
- Inserter remains open until manually closed.  
- Inserter state persists while editing.  
- Keyboard shortcut: **Ctrl+Alt+Shift+M** toggles the inserter (WordPress behavior).  
- Inline inserter (“+” between blocks) still works independently.

---

## **1.3 — Display Current Page Title**
**As a** content editor  
**I want** to see the page title in the command bar  
**So that** I always know what I’m editing  

**Acceptance Criteria**  
- Title appears next to the inserter.  
- Clicking the title scrolls to the Title block.  
- Title updates live as the user types.  
- Matches WordPress behavior exactly.

---

---

# **2. Center Zone: Block Toolbar (Contextual)**  
_This is the toolbar that changes depending on the selected block._

---

## **2.1 — Show Contextual Block Toolbar**
**As a** content editor  
**I want** the toolbar to show controls for the currently selected block  
**So that** I can edit block‑specific settings quickly  

**Acceptance Criteria**  
- Toolbar appears directly above the selected block (default WordPress behavior).  
- Toolbar includes:  
  - Block transform options  
  - Alignment  
  - Formatting  
  - Block‑specific actions  
- Toolbar updates instantly when selection changes.  
- Toolbar disappears when no block is selected.

---

## **2.2 — Top Toolbar Mode**
**As a** content editor  
**I want** to pin the block toolbar to the top  
**So that** the toolbar doesn’t overlap content  

**Acceptance Criteria**  
- Enabled via “Top Toolbar” in More Tools & Options.  
- When enabled:  
  - Block toolbar moves into the command bar.  
  - Toolbar no longer appears inline.  
- State persists per user.

---

---

# **3. Right Zone: Editor Tools, Save/Publish, Settings, More Options**

---

## **3.1 — Save Draft / Autosave**
**As a** content editor  
**I want** to save my work  
**So that** I don’t lose progress  

**Acceptance Criteria**  
- Button shows:  
  - **Save Draft** (new content)  
  - **Autosaving…** (during autosave)  
  - **Saved** (when up to date)  
- Autosave runs periodically (WordPress behavior).  
- Save does not publish the content.

---

## **3.2 — Preview**
**As a** content editor  
**I want** to preview my content  
**So that** I can see how it will look on the front end  

**Acceptance Criteria**  
- Preview button opens a dropdown with:  
  - Desktop  
  - Tablet  
  - Mobile  
- Preview opens in a new tab (WordPress behavior).  
- Does not modify content.

---

## **3.3 — Publish / Update**
**As a** content editor  
**I want** to publish or update the page  
**So that** my changes go live  

**Acceptance Criteria**  
- Button label changes based on state:  
  - **Publish** (new)  
  - **Update** (existing)  
- Clicking opens the WordPress pre‑publish panel with:  
  - Visibility  
  - URL  
  - Summary of changes  
- Publishing saves and updates the front‑end HTML.

---

## **3.4 — Settings Sidebar Toggle**
**As a** content editor  
**I want** to open the settings sidebar  
**So that** I can edit document and block settings  

**Acceptance Criteria**  
- Gear icon toggles the right sidebar.  
- Sidebar includes:  
  - **Document settings** (template, featured image, slug, categories, tags)  
  - **Block settings** (properties of selected block)  
- Sidebar state persists per session.

---

## **3.5 — More Tools & Options (⋮)**
**As a** content editor  
**I want** access to advanced editor tools  
**So that** I can customize my editing environment  

**Acceptance Criteria**  
- Menu includes:  
  - Top Toolbar  
  - Spotlight Mode  
  - Fullscreen Mode  
  - Manage Reusable Blocks  
  - Keyboard Shortcuts  
  - Copy All Content  
  - Editor Preferences  
- Matches WordPress behavior exactly.

---

---

# **4. Editor Modes & Interaction**

---

## **4.1 — Fullscreen Mode**
**As a** content editor  
**I want** to hide the WordPress admin UI  
**So that** I can focus on writing  

**Acceptance Criteria**  
- Enabled via More Tools & Options.  
- Hides admin sidebar and top bar.  
- State persists per user.

---

## **4.2 — Spotlight Mode**
**As a** content editor  
**I want** to focus on one block at a time  
**So that** I can reduce visual noise  

**Acceptance Criteria**  
- Non‑selected blocks fade visually.  
- Selected block remains fully visible.  
- Matches WordPress behavior.

---

## **4.3 — Keyboard Shortcuts**
**As a** power user  
**I want** keyboard shortcuts  
**So that** I can work faster  

**Acceptance Criteria**  
- WordPress shortcuts supported:  
  - Save: Ctrl+S  
  - Undo: Ctrl+Z  
  - Redo: Ctrl+Shift+Z  
  - Inserter: Ctrl+Alt+Shift+M  
  - Toggle Sidebar: Ctrl+Shift+,  
  - Open Command Palette: Ctrl+K  
- Shortcut reference available in More Tools & Options.

---

---

# **5. Extensibility**

---

## **5.1 — Plugin Injection Points**
**As a** developer  
**I want** extension points in the command bar  
**So that** plugins can add buttons or menus  

**Acceptance Criteria**  
- WordPress‑style extension slots:  
  - Inserter extensions  
  - Toolbar extensions  
  - Sidebar panels  
  - More Tools & Options extensions  
- Plugins cannot override core actions.  
- Matches WordPress extensibility model.

---

