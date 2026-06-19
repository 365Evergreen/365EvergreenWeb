# **📘 User Stories for the Gallery Block**  
_A multi‑image block that supports uploading, selecting, arranging, styling, and rendering responsive image galleries._

---

# **1. Core Gallery Block Behavior**

---

## **1.1 — Insert a Gallery Block**
**As a** content editor  
**I want** to insert a Gallery block  
**So that** I can display multiple images in a structured layout  

**Acceptance Criteria**  
- Inserting the block displays an empty gallery placeholder with:  
  - **Upload** button  
  - **Media Library** button  
  - Drag‑and‑drop support  
- JSON structure is created immediately:  
  ```json
  {
    "type": "gallery",
    "images": [],
    "columns": 3,
    "crop": true,
    "linkTo": "none",
    "lightbox": false,
    "style": {}
  }
  ```  
- Canvas shows a dashed placeholder until images are added.

---

## **1.2 — Add Images to the Gallery**
**As a** content editor  
**I want** to add multiple images at once  
**So that** I can build a gallery quickly  

**Acceptance Criteria**  
- Supports:  
  - Multi‑file upload  
  - Multi‑select from media library  
  - Drag‑and‑drop of multiple files  
- Each selected image becomes an item in the gallery.  
- JSON stores each image as:  
  ```json
  { "id": "string", "src": "string", "alt": "", "caption": "" }
  ```  
- Canvas displays images in a grid immediately.

---

---

# **2. Managing Gallery Images**

---

## **2.1 — Reorder Images**
**As a** content editor  
**I want** to reorder images via drag‑and‑drop  
**So that** I can control the visual sequence  

**Acceptance Criteria**  
- Dragging an image shows valid drop targets.  
- Reordering updates the `images` array in JSON.  
- Canvas updates instantly.

---

## **2.2 — Replace an Image**
**As a** content editor  
**I want** to replace an image in the gallery  
**So that** I can update visuals without deleting the item  

**Acceptance Criteria**  
- Replace option appears on image toolbar.  
- Supports upload, library, or URL.  
- Replacing updates only that image’s JSON node.

---

## **2.3 — Remove an Image**
**As a** content editor  
**I want** to remove an image  
**So that** I can refine the gallery content  

**Acceptance Criteria**  
- Delete icon appears on image hover.  
- Removing updates the JSON array.  
- Canvas reflows remaining images.

---

## **2.4 — Edit Image Alt Text & Caption**
**As a** content editor  
**I want** to edit alt text and captions for each image  
**So that** the gallery is accessible and descriptive  

**Acceptance Criteria**  
- Alt text editable in Properties Panel.  
- Caption editable inline below each image.  
- JSON stores alt and caption per image.

---

---

# **3. Gallery Layout & Display Options**

---

## **3.1 — Set Number of Columns**
**As a** content editor  
**I want** to choose how many columns the gallery uses  
**So that** I can control the layout density  

**Acceptance Criteria**  
- Columns slider (1–8).  
- JSON stores: `"columns": number`.  
- Canvas updates instantly.  
- Responsive behavior:  
  - Fewer columns on smaller screens  
  - Breakpoints configurable in theme

---

## **3.2 — Enable or Disable Image Cropping**
**As a** content editor  
**I want** to toggle image cropping  
**So that** I can choose between uniform or natural image shapes  

**Acceptance Criteria**  
- Crop toggle in Properties Panel.  
- When enabled:  
  - Images are cropped to uniform squares or aspect ratio.  
- When disabled:  
  - Images display at natural aspect ratio.  
- JSON stores: `"crop": true | false`.

---

## **3.3 — Choose Link Behavior**
**As a** content editor  
**I want** to control what happens when a gallery image is clicked  
**So that** I can match the intended user experience  

**Acceptance Criteria**  
- Options:  
  - None  
  - Media file  
  - Attachment page  
- JSON stores: `"linkTo": "none" | "media" | "attachment"`.

---

## **3.4 — Enable Lightbox Mode**
**As a** content editor  
**I want** to enable a lightbox  
**So that** users can view larger versions of images  

**Acceptance Criteria**  
- Lightbox toggle in Properties Panel.  
- JSON stores: `"lightbox": true | false`.  
- Renderer wraps images in lightbox triggers.

---

---

# **4. Styling & Design Controls**

---

## **4.1 — Adjust Spacing Between Images**
**As a** content editor  
**I want** to control the gap between images  
**So that** I can fine‑tune the gallery’s visual density  

**Acceptance Criteria**  
- Gap slider (0–48px).  
- JSON stores: `style.spacing.gap`.  
- Canvas updates instantly.

---

## **4.2 — Add Rounded Corners or Borders**
**As a** content editor  
**I want** to style gallery images  
**So that** they match the site’s design system  

**Acceptance Criteria**  
- Controls:  
  - Border radius  
  - Border width  
  - Border color  
- JSON stores values in `style.border`.

---

## **4.3 — Full‑Width or Wide Alignment**
**As a** content editor  
**I want** to stretch the gallery across the page  
**So that** I can create immersive layouts  

**Acceptance Criteria**  
- Alignment options:  
  - Default  
  - Wide  
  - Full width  
- JSON stores alignment in `style.layout`.

---

---

# **5. Editing Experience**

---

## **5.1 — Select Individual Images**
**As a** content editor  
**I want** to select individual images inside the gallery  
**So that** I can edit them independently  

**Acceptance Criteria**  
- Clicking an image selects it.  
- Image toolbar appears with:  
  - Replace  
  - Remove  
  - Link  
  - Crop toggle  
- Properties Panel updates to show image‑specific settings.

---

## **5.2 — Select the Entire Gallery**
**As a** content editor  
**I want** to select the entire gallery  
**So that** I can edit global settings  

**Acceptance Criteria**  
- Clicking outside images selects the gallery wrapper.  
- Gallery toolbar appears with:  
  - Columns  
  - Crop  
  - Link behavior  
  - Lightbox  
- Properties Panel shows gallery‑level settings.

---

---

# **6. Transformations**

---

## **6.1 — Transform Gallery to Individual Images**
**As a** content editor  
**I want** to break the gallery into separate Image blocks  
**So that** I can manually arrange them  

**Acceptance Criteria**  
- Transform menu includes “Convert to Images”.  
- Each gallery image becomes its own Image block.  
- Captions and alt text preserved.

---

## **6.2 — Transform Images to Gallery**
**As a** content editor  
**I want** to convert multiple selected Image blocks into a Gallery  
**So that** I can quickly group them  

**Acceptance Criteria**  
- Selecting multiple Image blocks enables “Convert to Gallery”.  
- A new Gallery block is created with those images.  
- Original Image blocks are removed.

---

---

# **7. JSON Schema Requirements**

---

## **7.1 — Gallery Block Schema**
**As a** developer  
**I want** a predictable JSON schema  
**So that** the renderer and editor behave consistently  

**Acceptance Criteria**  
- Schema includes:  
  ```json
  {
    "type": "gallery",
    "images": [
      {
        "id": "string",
        "src": "string",
        "alt": "string",
        "caption": "string"
      }
    ],
    "columns": 3,
    "crop": true,
    "linkTo": "none",
    "lightbox": false,
    "style": {
      "spacing": { "gap": "string" },
      "border": {},
      "layout": {}
    }
  }
  ```  
- Supports unlimited images.

---

