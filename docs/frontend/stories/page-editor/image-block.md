# **📘 User Stories for the Image Block**  
_The Image Block handles media ingestion, metadata, layout, accessibility, and responsive behavior._

---

# **1. Core Image Block Behavior**

---

## **1.1 — Insert an Image Block**
**As a** content editor  
**I want** to insert an Image block  
**So that** I can add visual content to my page  

**Acceptance Criteria**  
- Inserting the block displays an empty image placeholder with three options:  
  - **Upload**  
  - **Media Library**  
  - **Insert from URL**  
- Drag‑and‑drop is supported directly onto the placeholder.  
- JSON structure is created immediately:  
  ```json
  {
    "type": "image",
    "src": null,
    "alt": "",
    "caption": "",
    "width": null,
    "height": null,
    "focalPoint": null,
    "style": {}
  }
  ```  
- Canvas shows a dashed placeholder until an image is selected.

---

## **1.2 — Upload an Image**
**As a** content editor  
**I want** to upload an image from my device  
**So that** I can add new media to my site  

**Acceptance Criteria**  
- Clicking **Upload** opens the file picker.  
- Supported formats: JPG, PNG, WebP, GIF (configurable).  
- Upload progress is shown inline.  
- On success:  
  - `src` is populated with the uploaded asset URL.  
  - Dimensions are auto‑detected.  
- On failure:  
  - Error message appears with retry option.

---

## **1.3 — Select from Media Library**
**As a** content editor  
**I want** to choose an existing image  
**So that** I can reuse media efficiently  

**Acceptance Criteria**  
- Clicking **Media Library** opens the media browser.  
- Selecting an image populates:  
  - `src`  
  - `alt` (if previously set)  
  - `width` / `height`  
- Canvas updates instantly.

---

## **1.4 — Insert from URL**
**As a** content editor  
**I want** to insert an image via URL  
**So that** I can embed external images  

**Acceptance Criteria**  
- Clicking **Insert from URL** opens a URL input.  
- URL is validated before insertion.  
- JSON stores the URL in `src`.  
- If the URL fails to load, a warning appears.

---

---

# **2. Editing Image Properties**

---

## **2.1 — Replace Image**
**As a** content editor  
**I want** to replace the current image  
**So that** I can update visuals without deleting the block  

**Acceptance Criteria**  
- Replace button opens the same three options: Upload, Library, URL.  
- Replacing updates `src` and dimensions.  
- Caption and alt text remain unchanged unless overwritten.

---

## **2.2 — Edit Alt Text**
**As a** content editor  
**I want** to set alt text  
**So that** the image is accessible and SEO‑friendly  

**Acceptance Criteria**  
- Alt text field appears in the Properties Panel.  
- JSON stores `alt`.  
- If alt text is empty, accessibility warning appears.

---

## **2.3 — Add or Edit Caption**
**As a** content editor  
**I want** to add a caption below the image  
**So that** I can provide context or attribution  

**Acceptance Criteria**  
- Caption is editable inline below the image.  
- JSON stores `caption`.  
- Caption supports inline formatting (bold, italic, link).

---

## **2.4 — Adjust Image Size**
**As a** content editor  
**I want** to resize the image  
**So that** it fits the layout  

**Acceptance Criteria**  
- Controls:  
  - Width (px, %, auto)  
  - Height (auto or locked aspect ratio)  
- Drag handles allow visual resizing.  
- JSON stores `width` and `height`.  
- Canvas updates instantly.

---

## **2.5 — Set Alignment**
**As a** content editor  
**I want** to align the image  
**So that** it fits the flow of the content  

**Acceptance Criteria**  
- Alignment options:  
  - Left  
  - Center  
  - Right  
  - Wide  
  - Full width  
- JSON stores alignment in `style.layout`.  
- Canvas updates instantly.

---

---

# **3. Advanced Image Controls**

---

## **3.1 — Focal Point Picker**
**As a** content editor  
**I want** to set a focal point  
**So that** the important part of the image stays visible in responsive crops  

**Acceptance Criteria**  
- Focal point UI appears as a draggable dot overlay.  
- JSON stores:  
  ```json
  "focalPoint": { "x": 0.5, "y": 0.5 }
  ```  
- Renderer uses focal point for object‑position CSS.

---

## **3.2 — Border & Radius Controls**
**As a** content editor  
**I want** to add borders or rounded corners  
**So that** the image matches the design system  

**Acceptance Criteria**  
- Controls:  
  - Border width  
  - Border color  
  - Border style  
  - Border radius  
- JSON stores values in `style.border`.

---

## **3.3 — Add Link to Image**
**As a** content editor  
**I want** to make the image clickable  
**So that** it can link to another page or media file  

**Acceptance Criteria**  
- Link icon opens link settings.  
- Options:  
  - URL  
  - Open in new tab  
  - Link to media file  
- JSON stores link object.

---

---

# **4. Responsive Behavior**

---

## **4.1 — Responsive Scaling**
**As a** content editor  
**I want** the image to scale responsively  
**So that** it looks good on all devices  

**Acceptance Criteria**  
- Width set to % scales fluidly.  
- Full‑width mode uses container width.  
- Focal point respected on mobile.

---

## **4.2 — Lazy Loading**
**As a** site visitor  
**I want** images to load efficiently  
**So that** the page loads quickly  

**Acceptance Criteria**  
- Renderer adds `loading="lazy"` by default.  
- Can be disabled in advanced settings.

---

---

# **5. Transformations**

---

## **5.1 — Transform Image to Cover Block**
**As a** content editor  
**I want** to convert an image into a Cover block  
**So that** I can turn it into a hero section  

**Acceptance Criteria**  
- Transform menu includes “Cover”.  
- Image becomes the background of a new Cover block.  
- Caption becomes inner content if applicable.

---

## **5.2 — Transform Image to Media & Text**
**As a** content editor  
**I want** to convert an image into a Media & Text block  
**So that** I can pair it with text easily  

**Acceptance Criteria**  
- Image becomes the media side.  
- A new text column is created automatically.

---

---

# **6. Accessibility & Semantics**

---

## **6.1 — Semantic HTML Output**
**As a** developer  
**I want** the image to render as semantic HTML  
**So that** it is accessible and SEO‑friendly  

**Acceptance Criteria**  
- Renders as `<figure>` when caption exists.  
- Renders as `<img>` when no caption exists.  
- Includes:  
  - `alt`  
  - `width`  
  - `height`  
  - `loading="lazy"`  
  - `decoding="async"`

---

## **6.2 — Accessibility Warnings**
**As a** content editor  
**I want** warnings when accessibility issues exist  
**So that** I can fix them before publishing  

**Acceptance Criteria**  
- Warn when:  
  - Alt text is empty  
  - Image is stretched beyond natural resolution  
  - Link lacks descriptive text  
- Warnings appear in the Properties Panel.

---

---

# **7. JSON Schema Requirements**

---

## **7.1 — Image Block Schema**
**As a** developer  
**I want** a predictable JSON schema  
**So that** the renderer and editor behave consistently  

**Acceptance Criteria**  
- Schema includes:  
  ```json
  {
    "type": "image",
    "src": "string",
    "alt": "string",
    "caption": "string",
    "width": "string | number",
    "height": "string | number",
    "focalPoint": { "x": number, "y": number },
    "link": { "url": "string", "newTab": boolean },
    "style": {
      "border": {},
      "layout": {},
      "spacing": {}
    }
  }
  ```  
- Schema supports future extensibility.

---

