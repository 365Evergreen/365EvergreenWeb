# **📘 User Stories for the Cover Block**  
_A hero‑style block that supports background images or video, overlay colors, inner blocks, alignment, and responsive behavior._

---

# **1. Core Cover Block Behavior**

---

## **1.1 — Insert a Cover Block**
**As a** content editor  
**I want** to insert a Cover block  
**So that** I can create a visually impactful hero section  

**Acceptance Criteria**  
- Inserting the block displays an empty cover placeholder with:  
  - **Upload**  
  - **Media Library**  
  - **Use Featured Image**  
  - Drag‑and‑drop support  
- JSON structure is created immediately:  
  ```json
  {
    "type": "cover",
    "background": {
      "type": null,
      "src": null,
      "alt": "",
      "focalPoint": null
    },
    "overlay": {
      "color": null,
      "opacity": 0.5
    },
    "minHeight": "50vh",
    "contentPosition": "center center",
    "children": []
  }
  ```  
- Canvas shows a dashed placeholder until media is added.

---

## **1.2 — Add Background Media**
**As a** content editor  
**I want** to add an image or video as the background  
**So that** I can create a visually rich hero section  

**Acceptance Criteria**  
- Supports:  
  - Upload  
  - Media Library  
  - Use Featured Image  
  - Insert from URL  
- Supports both **image** and **video** backgrounds.  
- JSON stores:  
  - `background.type: "image" | "video"`  
  - `background.src`  
  - `background.alt` (for images)

---

---

# **2. Editing Background Media**

---

## **2.1 — Replace Background Media**
**As a** content editor  
**I want** to replace the background media  
**So that** I can update visuals without rebuilding the block  

**Acceptance Criteria**  
- Replace button opens the same media options.  
- Replacing updates only the background object.  
- Inner content remains unchanged.

---

## **2.2 — Focal Point Picker (Images Only)**
**As a** content editor  
**I want** to set a focal point  
**So that** the important part of the image stays visible  

**Acceptance Criteria**  
- Focal point UI appears as a draggable dot overlay.  
- JSON stores:  
  ```json
  "focalPoint": { "x": 0.5, "y": 0.5 }
  ```  
- Renderer uses CSS `object-position`.

---

## **2.3 — Video Background Behavior**
**As a** content editor  
**I want** video backgrounds to behave smoothly  
**So that** the hero section feels dynamic  

**Acceptance Criteria**  
- Video autoplays muted and loops.  
- Poster image optional.  
- JSON stores:  
  - `background.poster`  
  - `background.autoplay`  
  - `background.loop`

---

---

# **3. Overlay Controls**

---

## **3.1 — Set Overlay Color**
**As a** content editor  
**I want** to apply an overlay color  
**So that** text remains readable over the background  

**Acceptance Criteria**  
- Color palette appears below media options.  
- Supports theme colors + custom colors.  
- JSON stores:  
  ```json
  "overlay": { "color": "#000000", "opacity": 0.5 }
  ```

---

## **3.2 — Adjust Overlay Opacity**
**As a** content editor  
**I want** to adjust overlay opacity  
**So that** I can fine‑tune contrast  

**Acceptance Criteria**  
- Opacity slider (0–100%).  
- Canvas updates instantly.  
- JSON stores opacity as a decimal (0–1).

---

---

# **4. Inner Content Editing**

---

## **4.1 — Add Blocks Inside the Cover**
**As a** content editor  
**I want** to add blocks inside the Cover  
**So that** I can create headings, buttons, or other hero content  

**Acceptance Criteria**  
- Inner blocks behave like a normal canvas.  
- Supports all block types.  
- JSON stores inner blocks in `children`.  
- Canvas shows a content area overlay for editing.

---

## **4.2 — Position Inner Content**
**As a** content editor  
**I want** to position inner content  
**So that** the layout matches the design  

**Acceptance Criteria**  
- Position options:  
  - Top left  
  - Top center  
  - Top right  
  - Center left  
  - Center  
  - Center right  
  - Bottom left  
  - Bottom center  
  - Bottom right  
- JSON stores: `"contentPosition": "center center"`.

---

---

# **5. Layout & Sizing**

---

## **5.1 — Set Minimum Height**
**As a** content editor  
**I want** to control the height of the Cover block  
**So that** it fits the design requirements  

**Acceptance Criteria**  
- Height options:  
  - Auto  
  - 50vh  
  - 75vh  
  - 100vh  
  - Custom px/vh  
- JSON stores: `"minHeight": "75vh"`.

---

## **5.2 — Full‑Width and Wide Alignment**
**As a** content editor  
**I want** the Cover block to span the full width  
**So that** I can create immersive hero sections  

**Acceptance Criteria**  
- Alignment options:  
  - Default  
  - Wide  
  - Full width  
- JSON stores alignment in `style.layout`.

---

---

# **6. Advanced Behavior**

---

## **6.1 — Fixed Background (Parallax)**
**As a** content editor  
**I want** to enable a fixed background  
**So that** I can create a parallax effect  

**Acceptance Criteria**  
- Toggle in Properties Panel.  
- JSON stores: `"background.fixed": true`.  
- Renderer uses `background-attachment: fixed`.

---

## **6.2 — Dim Background**
**As a** content editor  
**I want** to dim the background  
**So that** text is more readable  

**Acceptance Criteria**  
- Dimmer slider adjusts overlay opacity.  
- JSON updates overlay opacity.

---

---

# **7. Transformations**

---

## **7.1 — Transform Cover to Group**
**As a** content editor  
**I want** to convert a Cover block into a Group  
**So that** I can remove the background but keep the content  

**Acceptance Criteria**  
- Transform menu includes “Group”.  
- Background is removed.  
- Inner blocks remain intact.

---

## **7.2 — Transform Image to Cover**
**As a** content editor  
**I want** to convert an Image block into a Cover block  
**So that** I can turn it into a hero section  

**Acceptance Criteria**  
- Image becomes the background.  
- Caption becomes inner content (Paragraph block).  
- JSON updates accordingly.

---

---

# **8. JSON Schema Requirements**

---

## **8.1 — Cover Block Schema**
**As a** developer  
**I want** a predictable JSON schema  
**So that** the renderer and editor behave consistently  

**Acceptance Criteria**  
- Schema includes:  
  ```json
  {
    "type": "cover",
    "background": {
      "type": "image",
      "src": "string",
      "alt": "string",
      "poster": "string",
      "focalPoint": { "x": 0.5, "y": 0.5 },
      "fixed": false
    },
    "overlay": {
      "color": "string",
      "opacity": 0.5
    },
    "minHeight": "50vh",
    "contentPosition": "center center",
    "children": [],
    "style": {
      "layout": {},
      "spacing": {}
    }
  }
  ```

---
