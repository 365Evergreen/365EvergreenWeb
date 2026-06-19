---

# **📘 User Stories for Page Templates**

*Landing Page, Content Page, Blog Archive Page, Search Results Page, Blog Post, Left‑Hand Column Page*

These templates define the **structural scaffolding** your SWA editor uses when creating new pages. Each template sets expectations for layout, block defaults, metadata, and editorial workflow.

---

# **1. Landing Page Template**

*A high‑impact, visually driven template for marketing, campaigns, and product launches.*

---

## **1.1 — Create a Landing Page**

**As a** content editor  
**I want** to start from a landing page template  
**So that** I can build a visually rich, conversion‑focused page quickly

**Acceptance Criteria**

- Template loads with:
  - A full‑width Cover block
  - A hero heading + subheading
  - A call‑to‑action section
  - A features section (Grid or Columns)
  - A testimonial or social proof section
  - A final CTA section
- All sections are editable and removable.
- Template metadata sets:
  - `layout: "full-width"`
  - `hideSidebar: true`
  - `showBreadcrumbs: false`
- JSON scaffold is created automatically.

---

## **1.2 — Control Hero Section**

**As a** content editor  
**I want** to customize the hero section  
**So that** the landing page reflects the campaign’s visual identity

**Acceptance Criteria**

- Hero supports image, video, or gradient background.
- Supports overlay color + opacity.
- Supports alignment controls (left/center/right).
- Supports nested blocks (Heading, Paragraph, Button).

---

## **1.3 — Conversion‑Focused Layout**

**As a** content editor  
**I want** pre‑built CTA sections  
**So that** I can drive user action without designing from scratch

**Acceptance Criteria**

- CTA section includes:
  - Heading
  - Subheading
  - Button(s)
- CTA styling matches theme defaults.
- CTA is reusable and can be duplicated.

---

---

# **2. Content Page Template**

*A general‑purpose template for static content such as “About”, “Services”, “Policies”, etc.*

---

## **2.1 — Create a Content Page**

**As a** content editor  
**I want** a clean, flexible template  
**So that** I can build structured informational pages

**Acceptance Criteria**

- Template loads with:
  - Page title block
  - Intro paragraph
  - Flexible content area (empty Group block)
- Metadata defaults:
  - `layout: "standard"`
  - `showSidebar: false`
  - `showBreadcrumbs: true`
- Supports any block type in the content area.

---

## **2.2 — Maintain Consistent Typography**

**As a** content editor  
**I want** headings and paragraphs to follow theme typography  
**So that** content pages remain consistent across the site

**Acceptance Criteria**

- Heading levels follow theme scale.
- Paragraphs follow theme body text.
- Editors can override styles but defaults are enforced initially.

---

---

# **3. Blog Archive Page Template**

*A dynamic listing of blog posts with filtering, pagination, and metadata.*

---

## **3.1 — Display Blog Posts Automatically**

**As a** site visitor  
**I want** to browse all blog posts  
**So that** I can find content that interests me

**Acceptance Criteria**

- Template automatically queries blog post JSON files.
- Displays posts in a grid or list layout.
- Each post card shows:
  - Featured image
  - Title
  - Excerpt
  - Publish date
  - Tags/categories
- Pagination or infinite scroll is supported.

---

## **3.2 — Filter and Sort Posts**

**As a** site visitor  
**I want** to filter posts by category or tag  
**So that** I can narrow down content

**Acceptance Criteria**

- Filter controls appear above the archive.
- Sorting options: newest, oldest, alphabetical.
- URL parameters update dynamically.

---

## **3.3 — Editor Customization**

**As a** content editor  
**I want** to customize the archive layout  
**So that** it matches the site’s design

**Acceptance Criteria**

- Editor can choose:
  - Grid or list layout
  - Number of posts per page
  - Whether to show featured images
  - Whether to show excerpts
- Settings stored in template metadata.

---

---

# **4. Search Results Page Template**

*A dynamic template that displays results from site-wide search.*

---

## **4.1 — Display Search Results**

**As a** site visitor  
**I want** to see relevant results for my query  
**So that** I can find the content I need

**Acceptance Criteria**

- Template reads query from URL (`?q=`).
- Displays results with:
  - Title
  - Excerpt with highlighted terms
  - Content type (page, blog post, file)
  - Link to the item
- Shows “No results found” message when appropriate.

---

## **4.2 — Editor Customization**

**As a** content editor  
**I want** to customize how results appear  
**So that** the page matches the site’s design

**Acceptance Criteria**

- Editor can configure:
  - Result card layout
  - Whether to show excerpts
  - Whether to show content type labels
  - Number of results per page

---

---

# **5. Blog Post Template**

*A content‑rich template for individual blog posts.*

---

## **5.1 — Create a Blog Post**

**As a** content editor  
**I want** a structured blog post template  
**So that** I can write articles efficiently

**Acceptance Criteria**

- Template loads with:
  - Title block
  - Author + date metadata
  - Featured image block
  - Content area (empty Group)
- Metadata fields:
  - `author`
  - `publishDate`
  - `tags`
  - `categories`
  - `featuredImage`

---

## **5.2 — Rich Content Support**

**As a** content editor  
**I want** to insert text, media, and design blocks  
**So that** I can create engaging articles

**Acceptance Criteria**

- Supports all text blocks (Paragraph, Heading, List, Quote).
- Supports media blocks (Image, Gallery, Video).
- Supports design blocks (Group, Columns, Separator).
- Supports reusable blocks for callouts or CTAs.

---

## **5.3 — SEO and Social Metadata**

**As a** content editor  
**I want** to set SEO and social metadata  
**So that** posts perform well in search and social previews

**Acceptance Criteria**

- Fields:
  - SEO title
  - Meta description
  - Social image
- Stored in template metadata.

---

---

# **6. Left‑Hand Column Page Template**

*A two‑column layout with navigation or contextual content on the left.*

---

## **6.1 — Create a Left‑Hand Column Page**

**As a** content editor  
**I want** a template with a persistent left column  
**So that** I can create pages with navigation or contextual content

**Acceptance Criteria**

- Template loads with:
  - Left column (Column block)
  - Main content area (Column block)
- Left column supports:
  - Navigation menu
  - Table of contents
  - Custom blocks
- Metadata:
  - `layout: "two-column-left"`
  - `leftColumnWidth: 25%` (editable)

---

## **6.2 — Customize Left Column Content**

**As a** content editor  
**I want** to add blocks to the left column  
**So that** I can provide context or navigation

**Acceptance Criteria**

- Supports any block type.
- Supports sticky positioning toggle.
- Supports background color and padding.

---

## **6.3 — Responsive Behavior**

**As a** site visitor  
**I want** the layout to adapt on mobile  
**So that** content remains readable

**Acceptance Criteria**

- Left column collapses into an accordion or moves above main content.
- Breakpoint configurable in template metadata.

--
