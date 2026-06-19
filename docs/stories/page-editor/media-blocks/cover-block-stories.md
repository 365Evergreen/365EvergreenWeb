# Cover block

These stories match the structure you’ve been using for your other blocks:  
- Purpose  
- Editable properties  
- Editor UI/UX  
- Popovers  
- JSON schema  
- Rendering rules  
- Edge cases  
- Accessibility  
- Mobile behavior  

This is the complete, developer‑ready version.

---

# 🧱 **Cover Block — User Stories (SWA Editor Version)**

## 🎯 **Purpose**
The Cover Block allows the user to create a visually striking section with a **background image or video**, an optional **color overlay**, and **inner blocks** (text, buttons, etc.).  
It is used for hero sections, banners, and feature callouts.

---

# 📌 **1. Block Creation Stories**

### **1.1 Insert a Cover Block**
- As a user, I can insert a Cover Block from the block inserter.  
- When inserted, the block appears with a placeholder prompting me to **upload media**, **select from library**, or **choose a solid color**.

### **1.2 Replace Background**
- As a user, I can replace the background media at any time using the toolbar “Replace” action.

---

# 🎨 **2. Editable Properties**

### **2.1 Background Media**
- Image (JPG, PNG, WebP)
- Video (MP4)
- External URL (optional)
- Focal point (x/y)
- Background position (top, center, bottom)
- Background repeat (no-repeat, repeat)
- Background size (cover, contain)

### **2.2 Overlay**
- Overlay color (solid or gradient)
- Overlay opacity (0–100%)

### **2.3 Layout**
- Minimum height (px, %, vh)
- Content alignment (left, center, right; top, middle, bottom)
- Padding (top, right, bottom, left)
- Full-width or wide alignment

### **2.4 Inner Blocks**
- Paragraph  
- Heading  
- Buttons  
- Any block allowed in a group container  

### **2.5 Advanced**
- HTML anchor  
- Additional CSS classes  

---

# 🧭 **3. Editor UI/UX Behavior**

## **3.1 Placeholder State**
When the block is first inserted:
- A large dropzone appears.
- Buttons: **Upload**, **Media Library**, **Use Color Background**.
- If the user selects a color background, the block becomes a solid color section with no media.

## **3.2 Selected State**
When the block is selected:
- A floating toolbar appears above the block.
- The block shows a blue outline.
- Inner blocks become editable.

## **3.3 Toolbar Controls**
- **Replace Media**  
- **Focal Point Picker** (if image)  
- **Overlay Color**  
- **Alignment (wide/full)**  
- **Minimum Height**  
- **Content Positioning**  

## **3.4 Inspector Controls**
- Background media settings  
- Overlay color + opacity slider  
- Layout (height, padding, alignment)  
- Advanced (anchor, CSS classes)  

---

# 🎛 **4. Popover Controls (Block-Attached)**

Each popover is declared in `controls.js` and mounted by the editor runtime.

### **4.1 Focal Point Popover**
- Appears when user clicks “Focal Point” in toolbar.
- Shows a draggable crosshair over a thumbnail.
- Updates `focalPoint.x` and `focalPoint.y`.

### **4.2 Overlay Color Popover**
- Color picker with opacity slider.
- Updates `overlay.color` and `overlay.opacity`.

### **4.3 Minimum Height Popover**
- Numeric input + unit selector (px, %, vh).
- Updates `minHeight`.

### **4.4 Content Position Popover**
- 3×3 grid (top-left, center-center, bottom-right, etc.)
- Updates `contentPosition`.

---

# 🧱 **5. JSON Schema (SWA Static Format)**

```json
{
  "type": "cover",
  "attributes": {
    "background": {
      "type": "image",
      "src": "",
      "focalPoint": { "x": 0.5, "y": 0.5 },
      "position": "center center",
      "size": "cover",
      "repeat": "no-repeat"
    },
    "overlay": {
      "color": "rgba(0,0,0,0.5)",
      "opacity": 50
    },
    "layout": {
      "minHeight": "50vh",
      "padding": { "top": "40px", "bottom": "40px", "left": "20px", "right": "20px" },
      "contentPosition": "center center",
      "alignment": "full"
    },
    "innerBlocks": []
  }
}
```

---

# 🖥 **6. Rendering Rules (Static Output)**

### **6.1 Background Image**
Rendered as:

```html
<div class="cover-block" style="
  background-image: url('...');
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  min-height: 50vh;
">
```

### **6.2 Overlay**
Rendered as a pseudo-element or nested div:

```html
<div class="cover-overlay" style="background-color: rgba(0,0,0,0.5)"></div>
```

### **6.3 Inner Blocks**
Rendered inside a content wrapper:

```html
<div class="cover-content" style="justify-content:center; align-items:center;">
  <!-- inner blocks -->
</div>
```

---

# ⚠️ **7. Edge Cases**

### **7.1 Missing Media**
If media is removed:
- Block returns to placeholder state.
- Inner blocks remain but are visually hidden until a new background is chosen.

### **7.2 Video Autoplay Restrictions**
If video is used:
- Must be muted to autoplay.
- Fallback image is required for mobile.

### **7.3 Overlay Opacity 0**
Overlay div is not rendered.

---

# ♿ **8. Accessibility Requirements**

- Video backgrounds must be muted.  
- Provide a fallback image for video.  
- Ensure text contrast meets WCAG AA when overlay is applied.  
- Allow user to set `aria-label` or HTML anchor.

---

# 📱 **9. Mobile Behavior**

- Minimum height defaults to `50vh` on mobile.  
- Focal point is preserved.  
- Video backgrounds may be replaced with fallback image.  
- Padding collapses to mobile-friendly defaults if not explicitly set.

---

# 🏁 **Summary**

These stories give your SWA editor a **fully WordPress‑accurate Cover Block**, with:

- Per-block controls  
- Block-attached popovers  
- JSON-driven attributes  
- Clean rendering rules  
- Full UX parity with Gutenberg  

