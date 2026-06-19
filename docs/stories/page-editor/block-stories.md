# Core Blocks — Purpose, Editable Properties, and UI/UX Behavior

## 1. Paragraph Block
**Purpose —**  
The default text block used for body copy. It is the foundational block for writing content and appears automatically when typing in an empty area.   [WordPress.org](https://wordpress.org/documentation/article/paragraph-block/)

**Editable Properties —**  
- Text content  
- Inline formatting: **bold**, *italic*, strikethrough  
- Inline links  
- Inline images  
- Text alignment (left, center, right)  
- Highlighting (theme‑dependent)  
- Transform to other block types (Heading, List, Quote, Code, etc.)   [WordPress.org](https://wordpress.org/documentation/article/paragraph-block/)

**UI/UX Behavior —**  
- Appears automatically when pressing Enter  
- Toolbar appears on focus with formatting controls  
- Drag handle + up/down arrows for reordering  
- Keyboard shortcuts for formatting and converting to headings (Alt+Shift+1–6)   [WordPress.org](https://wordpress.org/documentation/article/paragraph-block/)

**Static-site implication:**  
Implement as a `<p>` element with a floating toolbar for formatting, plus transform options.

---

## 2. Heading Block
**Purpose —**  
Creates semantic headings (H1–H6) to structure content and improve readability and SEO. (General block editor documentation describes headings as core text blocks.)   [WordPress.org](https://wordpress.org/documentation/article/wordpress-block-editor/)

**Editable Properties —**  
- Heading level (H1–H6)  
- Text content  
- Alignment  
- Optional inline formatting (bold, italic, link)

**UI/UX Behavior —**  
- Toolbar allows switching heading levels  
- Transformable to/from Paragraph  
- Appears in the Document Outline panel for structure overview (List View)   [WordPress.org](https://wordpress.org/documentation/article/wordpress-block-editor/)

**Static-site implication:**  
Implement as `<h1>`–`<h6>` with a level selector in the toolbar.

---

## 3. Image Block
**Purpose —**  
Displays a single image with optional caption and alignment controls. (Image is one of the standard media blocks referenced in the block editor documentation.)   [WordPress.org](https://wordpress.org/documentation/article/wordpress-block-editor/)

**Editable Properties —**  
- Image source (upload or URL)  
- Alt text  
- Caption  
- Width/height  
- Alignment (left, center, right, wide, full — theme dependent)  
- Link target (none, media file, custom URL)

**UI/UX Behavior —**  
- Clicking opens a toolbar with alignment and link controls  
- Resizable via drag handles  
- Caption field appears inline below the image  
- Drag‑and‑drop replacement

**Static-site implication:**  
Implement as `<figure><img><figcaption>` with resize handles and alignment classes.

---

## 4. Video Block
**Purpose —**  
Embeds a self‑hosted video file with playback controls. (Video is listed among the media‑rich blocks in the editor documentation.)   [WordPress.org](https://wordpress.org/documentation/article/wordpress-block-editor/)

**Editable Properties —**  
- Video source (upload or URL)  
- Poster image  
- Autoplay, loop, mute  
- Controls toggle  
- Caption

**UI/UX Behavior —**  
- Inline preview of the video  
- Toolbar for alignment  
- Settings panel for playback options  
- Caption field similar to Image block

**Static-site implication:**  
Implement using `<video>` with configurable attributes and a caption wrapper.

---

## 5. Code Block
**Purpose —**  
Displays preformatted code snippets without executing them. (Code is listed as a transform target and standard block type.)   [WordPress.org](https://wordpress.org/documentation/article/paragraph-block/)

**Editable Properties —**  
- Raw code text  
- Optional language (for syntax highlighting — theme/plugin dependent)

**UI/UX Behavior —**  
- Uses a monospaced font  
- No inline formatting  
- Toolbar includes transform options (e.g., to Paragraph or Preformatted)

**Static-site implication:**  
Implement as `<pre><code>` with optional syntax highlighting.

---

## 6. Embed Block
**Purpose —**  
Embeds external content (YouTube, Vimeo, Twitter/X, etc.) via oEmbed or iframe. (Embeds are part of the core block set described in the block editor documentation.)   [WordPress.org](https://wordpress.org/documentation/article/wordpress-block-editor/)

**Editable Properties —**  
- Embed URL  
- Alignment  
- Optional caption (for some embed types)

**UI/UX Behavior —**  
- Auto‑detects provider and renders preview  
- Shows error if provider is unsupported  
- Toolbar for alignment  
- Some providers have specialized sub‑blocks (e.g., YouTube block)

**Static-site implication:**  
Implement as an iframe wrapper with provider‑specific templates.

---

## 7. Separator Block
**Purpose —**  
Adds a horizontal divider to visually separate sections of content. (Separator is a standard layout block referenced in block editor documentation.)   [WordPress.org](https://wordpress.org/documentation/article/wordpress-block-editor/)

**Editable Properties —**  
- Style (wide line, dots, short line — theme dependent)  
- Alignment (sometimes)

**UI/UX Behavior —**  
- Renders a simple horizontal rule  
- Minimal toolbar (style selector)

**Static-site implication:**  
Implement as `<hr>` with style variants.

---

## 8. Group / Section Block
**Purpose —**  
Groups multiple blocks into a container for layout, styling, and structural organization. (Grouping and layout control are core editor concepts.)   [WordPress Developer Resources](https://developer.wordpress.org/block-editor/)

**Editable Properties —**  
- Background color  
- Text color  
- Padding/margins  
- Layout (stack, row — depending on theme)  
- HTML element type (div, section, article, etc.)

**UI/UX Behavior —**  
- Provides a bounding box around nested blocks  
- Drag‑and‑drop reordering of entire groups  
- Block toolbar includes layout controls  
- Used heavily for page‑level structure

**Static-site implication:**  
Implement as a `<div>` or `<section>` with nested blocks and configurable layout classes.

---

# Design Blocks — Purpose, Editable Properties, and UI/UX Behavior

## 9. Spacer Block
**Purpose —**  
Adds vertical whitespace between blocks to control layout rhythm and breathing room.

**Editable Properties —**  
- Height (px, rem, or theme scale)  
- Responsive height  
- Preset sizes (small, medium, large)

**UI/UX Behavior —**  
- Drag handle to resize  
- Numeric input for precise height  
- Subtle outline on hover

**Static-site implication:**  
Implement as `<div class="spacer">` with height controlled via CSS variables.

---

## 10. Divider (Design Variant) Block
**Purpose —**  
A decorative version of the Separator block for stylistic section breaks.

**Editable Properties —**  
- Style (solid, dashed, gradient, ornament)  
- Thickness  
- Width (full, wide, custom)  
- Alignment

**UI/UX Behavior —**  
- Inline style selector  
- Live preview  
- Theme‑preset snapping

**Static-site implication:**  
Implement as `<hr>` with classes or a styled `<div>` for advanced variants.

---

## 11. Card Block
**Purpose —**  
Creates a visually distinct container with background, border, and shadow options.

**Editable Properties —**  
- Background color  
- Border radius  
- Shadow depth  
- Padding  
- Optional media slot  
- Optional button slot

**UI/UX Behavior —**  
- Drag‑and‑drop nested blocks  
- Hover outline  
- Preset styles (Elevated, Outlined, Soft)

**Static-site implication:**  
Implement as `<div class="card">` with nested blocks and CSS variables.

---

## 12. Hero / Banner Block
**Purpose —**  
Creates a large, visually dominant header section for landing pages or marketing content.

**Editable Properties —**  
- Background image or color  
- Overlay color + opacity  
- Height presets  
- Alignment  
- Optional CTA button  
- Optional eyebrow text

**UI/UX Behavior —**  
- Background image picker  
- Focal point drag control  
- Live overlay preview  
- Responsive height preview

**Static-site implication:**  
Implement as `<section class="hero">` with background CSS and nested blocks.

---

## 13. Icon Block
**Purpose —**  
Adds a standalone icon or symbol for visual emphasis.

**Editable Properties —**  
- Icon selection (library or custom SVG)  
- Size  
- Color  
- Optional accessibility label

**UI/UX Behavior —**  
- Icon picker modal  
- Drag‑resize  
- Auto‑inserted label if provided

**Static-site implication:**  
Implement as inline SVG or `<img>` with theme sizing classes.

---

## 14. Callout / Notice Block
**Purpose —**  
Highlights important information such as tips, warnings, or notes.

**Editable Properties —**  
- Variant (info, success, warning, error)  
- Icon toggle  
- Background + border colors  
- Title + body text

**UI/UX Behavior —**  
- Variant switcher  
- Theme color presets  
- Optional collapsible behavior

**Static-site implication:**  
Implement as `<aside class="callout callout--info">` with nested blocks.

---

## 15. Background Block
**Purpose —**  
Wraps content in a stylized background (color, gradient, pattern, or image).

**Editable Properties —**  
- Background type  
- Overlay  
- Padding  
- Border radius  
- Focal point (for images)

**UI/UX Behavior —**  
- Gradient editor  
- Background focal point control  
- Auto‑contrast text suggestions

**Static-site implication:**  
Implement as a wrapper `<div>` with background classes and overlay layers.

## 16. Search Results Grid Block
Purpose —  
Displays a dynamic, filterable grid of search results pulled from a configured data source (e.g., SharePoint, Dataverse, or a static index). Ideal for surfacing documents, pages, samples, or items with thumbnails, metadata, and contributors. The block’s properties define the result types, determining how each item is rendered.

Editable Properties —

Data source (Search index, API endpoint, list/library, static JSON)

Result type configuration

Template (card, compact, media‑heavy, list)

Fields to display (title, description, modified date, contributors, tags, thumbnail)

Field mappings (e.g., ModifiedBy → contributors)

Thumbnail source (preview image, icon, fallback)

Query settings

Search term binding

Filters (type, date, tags, author)

Sort order (relevance, modified date, alphabetical)

Paging (page size, infinite scroll, load more)

Layout settings

Columns (auto, 2–6)

Card spacing

Responsive breakpoints

Interaction settings

Click behavior (open in new tab, modal preview, navigate)

Hover effects

Optional “Modified on” metadata

Optional contributor avatars

UI/UX Behavior —

Results update instantly when filters or search terms change

Grid auto‑adjusts based on viewport width

Cards show thumbnail, title, metadata, and contributors similar to the examples in your screenshots

Hover reveals subtle elevation or border highlight

“Load more” or infinite scroll for large result sets

Result types determine how each card is rendered, allowing multiple visual templates

Supports keyboard navigation and accessible focus states

Static-site implication:  
Implement as a <div class="search-results-grid"> with a client‑side search engine or API integration.
Result types should be defined as JSON templates that map fields to UI elements.
Use CSS grid for layout, with responsive column definitions and card components for each result.

---

# Summary Table for Developers

| Block | Purpose | Key Editable Properties | UX Notes |
|-------|---------|-------------------------|----------|
| Paragraph | Body text | Formatting, alignment, links | Auto‑created on Enter; inline toolbar |
| Heading | Structured titles | Level H1–H6, alignment | Appears in Outline; level switcher |
| Image | Single image | Src, alt, caption, alignment, size | Resizable; inline caption |
| Video | Self‑hosted video | Src, poster, autoplay/loop/mute | Inline preview; caption |
| Code | Preformatted code | Raw code text | Monospace; no inline formatting |
| Embed | External media | URL, alignment | Auto‑preview; provider detection |
| Separator | Visual divider | Style | Minimal UI |
| Group/Section | Layout container | Background, spacing, layout | Drag entire group; structural |
| Spacer | Vertical whitespace | Height, presets | Drag‑resize; subtle outline |
| Divider (Design) | Decorative divider | Style, width, thickness | Style picker; live preview |
| Card | Highlighted container | Background, radius, shadow, padding | Nested blocks; presets |
| Hero/Banner | Visual header | Background, overlay, alignment, height | Focal point control |
| Icon | Visual symbol | Icon, size, color | Icon picker; accessibility label |
| Callout/Notice | Highlighted message | Variant, colors, icon, title | Variant switcher |
| Background | Stylized wrapper | Background type, overlay, padding | Gradient editor |

---

| Block | Category | Purpose | Key Editable Properties | UX Notes |
| --- | --- | --- | --- | --- |
| **Button** | Interactive | CTA link | Text, URL, colors, style, radius | Inline toolbar, URL picker |
| **Columns** | Layout | Multi‑column layout | Column count, widths, gaps | Drag‑resize, responsive stacking |
| **Grid** | Layout | Uniform grid | Column count, min/max width, gaps | Visual grid overlay |
| **Row** | Layout | Horizontal layout | Alignment, gap, wrap | Flexbox‑style behavior |
| **Accordion** | Interactive | Collapsible content | Title, body, icons, open state | Expand/collapse animation |
| **Spacer** | Design | Vertical whitespace | Height, presets | Drag‑resize |
| **Divider (Design)** | Design | Decorative divider | Style, width, thickness | Live preview |
| **Card** | Design | Highlighted container | Background, radius, shadow, padding | Presets; nested blocks |
| **Hero/Banner** | Design | Visual header | Background, overlay, alignment, height | Focal point control |
| **Icon** | Design | Symbolic element | Icon, size, color | Icon picker |
| **Callout/Notice** | Design | Highlighted message | Variant, colors, icon | Variant switcher |
| **Background** | Design | Stylized wrapper | Background type, overlay, padding | Gradient editor |

