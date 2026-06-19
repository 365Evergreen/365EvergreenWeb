# **📘 User Stories for Media Blocks**

*Image, Gallery, Audio, Video, File, Media & Text, Cover*

These blocks handle media ingestion, rendering, metadata, and layout — essential for a modern static‑site editor.

---

# **1. Image Block**

*The most frequently used media block. Simple, powerful, and flexible.*

---

## **1.1 — Insert an Image**

**As a** content editor  
**I want** to insert an image from my device or media library  
**So that** I can visually enhance my content

**Acceptance Criteria**

- Clicking the Image block opens the media picker.
- Supports:
  - Upload from device
  - Select from media library
  - Paste image URL
- Upload progress is shown inline.
- JSON stores: `src`, `alt`, `width`, `height`, `caption`, `focalPoint`.

---

## **1.2 — Edit Image Properties**

**As a** content editor  
**I want** to adjust image size, alignment, and alt text  
**So that** the image fits the design and is accessible

**Acceptance Criteria**

- Controls:
  - Width (px, %, auto)
  - Alignment (left, center, right)
  - Border radius
  - Alt text
  - Caption toggle
- Canvas updates instantly.
- All values stored in the block’s `style` and `attributes`.

---

## **1.3 — Replace or Crop Image**

**As a** content editor  
**I want** to replace or crop an image  
**So that** I can refine visuals without re‑inserting the block

**Acceptance Criteria**

- Replace button opens media picker.
- Crop tool supports:
  - Aspect ratios
  - Freeform crop
  - Focal point selection
- Cropped version stored as a new asset.

---

---

# **2. Gallery Block**

*A responsive grid or masonry layout for multiple images.*

---

## **2.1 — Create a Gallery**

**As a** content editor  
**I want** to select multiple images at once  
**So that** I can create a visual gallery quickly

**Acceptance Criteria**

- Multi-select in media picker.
- Images appear in a grid by default.
- JSON stores an array of image objects.

---

## **2.2 — Reorder and Manage Images**

**As a** content editor  
**I want** to reorder, replace, or remove images  
**So that** I can curate the gallery layout

**Acceptance Criteria**

- Drag-and-drop reordering.
- Replace and delete actions per image.
- Add more images via “Add to gallery”.

---

## **2.3 — Customize Gallery Layout**

**As a** content editor  
**I want** to choose grid, masonry, or justified layout  
**So that** the gallery matches the page design

**Acceptance Criteria**

- Layout options: Grid, Masonry, Justified.
- Controls:
  - Columns (1–6)
  - Gap size
  - Crop toggle (fit vs fill)
  - Lightbox toggle
- Canvas updates instantly.

---

---

# **3. Audio Block**

*A simple audio player for embedding sound files.*

---

## **3.1 — Insert Audio**

**As a** content editor  
**I want** to upload or link an audio file  
**So that** visitors can listen to audio content

**Acceptance Criteria**

- Supports upload or URL.
- JSON stores: `src`, `title`, `artist`, `duration`.
- Canvas shows a native or custom audio player.

---

## **3.2 — Configure Audio Player**

**As a** content editor  
**I want** to control playback options  
**So that** the audio behaves as intended

**Acceptance Criteria**

- Controls:
  - Autoplay
  - Loop
  - Preload
  - Show/hide download button
- Values stored in block attributes.

---

---

# **4. Video Block**

*A responsive video player for uploaded or embedded videos.*

---

## **4.1 — Insert Video**

**As a** content editor  
**I want** to upload a video or embed one from a URL  
**So that** I can add rich media to my page

**Acceptance Criteria**

- Supports:
  - Upload
  - URL (MP4, WebM)
  - Embed (YouTube, Vimeo)
- JSON stores: `src`, `poster`, `autoplay`, `controls`.

---

## **4.2 — Configure Video Player**

**As a** content editor  
**I want** to adjust playback and display settings  
**So that** the video fits the page design

**Acceptance Criteria**

- Controls:
  - Autoplay
  - Loop
  - Muted
  - Controls on/off
  - Poster image
  - Aspect ratio
- Canvas updates instantly.

---

---

# **5. File Block**

*A download link for documents, PDFs, and other files.*

---

## **5.1 — Insert a File**

**As a** content editor  
**I want** to upload or link a file  
**So that** visitors can download it

**Acceptance Criteria**

- Supports upload or URL.
- JSON stores: `src`, `filename`, `filesize`, `description`.
- Canvas shows a styled download button.

---

## **5.2 — Customize File Display**

**As a** content editor  
**I want** to control how the file link appears  
**So that** it matches the page design

**Acceptance Criteria**

- Options:
  - Show/hide file size
  - Show/hide icon
  - Custom label
- Styling stored in `style`.

---

---

# **6. Media & Text Block**

*A split layout block combining media on one side and text on the other.*

---

## **6.1 — Create a Media & Text Layout**

**As a** content editor  
**I want** to place media beside text  
**So that** I can create visually balanced sections

**Acceptance Criteria**

- Two-column layout: media on left, text on right (or reversed).
- Media supports image or video.
- Text area supports any text block.
- JSON stores:
  - `media` object
  - `text` children array
  - `layout` (media-left or media-right)

---

## **6.2 — Adjust Layout and Alignment**

**As a** content editor  
**I want** to control alignment and spacing  
**So that** the section fits the page design

**Acceptance Criteria**

- Controls:
  - Media position (left/right)
  - Vertical alignment (top, center, bottom)
  - Gap size
  - Media width percentage
- Canvas updates instantly.

---

---

# **7. Cover Block**

*A hero-style block with a background image or video and overlayed content.*

---

## **7.1 — Create a Cover Section**

**As a** content editor  
**I want** to add a full-width hero section  
**So that** I can create a strong visual introduction

**Acceptance Criteria**

- Supports background:
  - Image
  - Video
  - Gradient
- Supports nested blocks (Heading, Paragraph, Button).
- JSON stores:
  - `background` object
  - `overlay`
  - `height`
  - `focalPoint`

---

## **7.2 — Customize Cover Appearance**

**As a** content editor  
**I want** to adjust overlay, height, and alignment  
**So that** the hero section matches the design

**Acceptance Criteria**

- Controls:
  - Overlay color + opacity
  - Height presets (50vh, 75vh, 100vh)
  - Content alignment (left/center/right + top/middle/bottom)
  - Parallax toggle
- Canvas updates instantly.

---

## **7.3 — Replace Background Media**

**As a** content editor  
**I want** to replace the background image or video  
**So that** I can update the hero without rebuilding the block

**Acceptance Criteria**

- Replace button opens media picker.
- Focal point control for images.
- Poster image for videos.

---


