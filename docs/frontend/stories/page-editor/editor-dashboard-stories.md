

---

# **📘 User Stories for the Editor Dashboard (WordPress‑Style)**

*This dashboard is the landing experience for editors after signing in. It provides system status, quick actions, recent activity, and content insights.*

The dashboard is composed of **modular panels**, each with its own user stories and acceptance criteria.

Panels included:

1. **Welcome Panel**
2. **Site Health Panel**
3. **At a Glance Panel**
4. **Activity Panel**
5. **Quick Draft Panel**
6. **Recent Content Panel**
7. **Search & Command Panel**
8. **Editor Tips Panel**
9. **Customizable Layout**

---

# **1. Welcome Panel**

## **1.1 — Display a Welcome Message**

**As a** content editor  
**I want** a friendly welcome panel  
**So that** I understand the main actions I can take

**Acceptance Criteria**

- Shows site name and a welcome message.
- Provides quick links:
  - Create new page
  - Create new post
  - Edit existing content
  - View site
- Panel can be dismissed or collapsed.
- Does not modify content or JSON.

---

# **2. Site Health Panel**

## **2.1 — Display Site Health Summary**

**As a** site administrator  
**I want** to see a summary of site health  
**So that** I can identify issues that may affect performance or content integrity

**Acceptance Criteria**

- Shows overall health status: Good, Recommended Improvements, Critical Issues.
- Displays a short description of each issue.
- Links to a full Site Health page.
- Automatically refreshes daily or on demand.
- Does not require plugins or external services.

---

# **3. At a Glance Panel**

## **3.1 — Show Content Counts**

**As a** content editor  
**I want** to see a quick summary of my site’s content  
**So that** I understand the current state of the site

**Acceptance Criteria**

- Displays counts for:
  - Published pages
  - Published posts
  - Drafts
  - Comments (approved, pending)
- Shows current theme name.
- Shows SWA version or editor version.
- Clicking a count opens the corresponding content list.

---

# **4. Activity Panel**

## **4.1 — Show Recently Published Content**

**As a** content editor  
**I want** to see what was recently published  
**So that** I can track new content at a glance

**Acceptance Criteria**

- Shows list of recently published pages and posts.
- Each item displays:
  - Title
  - Publish date
  - Author
- Clicking an item opens it in the editor.

---

## **4.2 — Show Recent Comments**

**As a** content editor  
**I want** to see recent comments  
**So that** I can moderate and respond quickly

**Acceptance Criteria**

- Shows recent comments with:
  - Commenter name
  - Excerpt
  - Linked post
- Provides moderation actions: Approve, Reply, Trash.
- Shows counts for All, Pending, Approved, Spam, Trash.

---

# **5. Quick Draft Panel**

## **5.1 — Create a Quick Draft**

**As a** content editor  
**I want** a simple way to jot down ideas  
**So that** I can capture content quickly

**Acceptance Criteria**

- Fields: Title, Content.
- “Save Draft” creates a new draft post or page.
- Draft appears immediately in Recent Content panel.
- Does not require selecting a template until opened in the editor.

---

# **6. Recent Content Panel**

## **6.1 — Display Recently Edited Content**

**As a** content editor  
**I want** to see recently edited pages and posts  
**So that** I can quickly resume work

**Acceptance Criteria**

- Shows last 5–10 edited items.
- Displays:
  - Title
  - Last modified date
  - Author
- Clicking opens the item in the editor.

---

# **7. Search & Command Panel**

## **7.1 — Global Search**

**As a** content editor  
**I want** to search for pages, posts, and media  
**So that** I can find content quickly

**Acceptance Criteria**

- Search bar at top of dashboard.
- Searches:
  - Page titles
  - Post titles
  - Media filenames
  - Tags/categories
- Results appear in a dropdown with icons.

---

## **7.2 — Command Palette (Optional)**

**As a** power user  
**I want** a command palette  
**So that** I can perform actions quickly using the keyboard

**Acceptance Criteria**

- Opens with `Ctrl+K` or `/`.
- Supports commands:
  - Create new page
  - Create new post
  - Open editor
  - Open settings
- Extensible for future commands.

---

# **8. Editor Tips Panel**

## **8.1 — Display Helpful Tips**

**As a** new editor  
**I want** to see helpful tips  
**So that** I can learn how to use the editor effectively

**Acceptance Criteria**

- Shows rotating tips about blocks, templates, and editing.
- Tips can be dismissed.
- Panel can be hidden permanently.

---

# **9. Dashboard Layout & Customization**

## **9.1 — Rearrange Panels**

**As a** content editor  
**I want** to rearrange dashboard panels  
**So that** I can customize my workspace

**Acceptance Criteria**

- Panels are draggable.
- Layout persists per user.
- Panels can be collapsed.

---

## **9.2 — Hide or Show Panels**

**As a** content editor  
**I want** to hide or show dashboard panels  
**So that** I can simplify my workspace

**Acceptance Criteria**

- Each panel has a visibility toggle.
- Hidden panels can be restored via “Screen Options”.
- Visibility settings persist per user.

---

# **10. Dashboard Performance & Behavior**

## **10.1 — Fast Loading**

**As a** user  
**I want** the dashboard to load instantly  
**So that** I can start working without delay

**Acceptance Criteria**

- Loads within 1 second on modern devices.
- Uses cached data where possible.
- Panels load asynchronously.

---

## **10.2 — Mobile-Friendly Layout**

**As a** mobile user  
**I want** the dashboard to adapt to smaller screens  
**So that** I can manage content on the go

**Acceptance Criteria**

- Panels stack vertically.
- Search and quick actions remain accessible.
- Touch-friendly interactions.

---
