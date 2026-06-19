Perfect — I’ll deliver all four things in one cohesive package, aligned with your existing block‑stories.md structure and your JSON‑driven SWA editor architecture.

You’ll get:

1. **Column Block user stories (inner block)**
2. **A full block‑stories.md entry** for both Columns and Column blocks (matching your established format)
3. **JSON schema** for both blocks
4. **A UX flow** for sidebar controls + drag‑resize behavior

Everything is implementation‑ready and consistent with the rest of your editor system.

---

# 🧱 1. Column Block — User Stories (Inner Block)

## 🎯 Purpose
The **Column Block** represents a single vertical container inside a Columns Block. It holds arbitrary inner blocks and participates in the responsive layout defined by its parent.

## 👤 User Stories

### Creating & Managing a Column
- **As an editor**, I can insert a Column Block only inside a Columns Block so that the layout structure remains valid.
- **As an editor**, I can duplicate a column so that I can reuse its structure and content.
- **As an editor**, I can remove a column so that I can simplify the layout.

### Editing Column Width
- **As an editor**, I can adjust the width of a column using drag handles so that I can visually fine‑tune the layout.
- **As an editor**, I can set an exact width percentage in the sidebar so that I can achieve precise control.
- **As an editor**, I can reset the width to “auto” so that the parent Columns Block redistributes space evenly.

### Adding Content
- **As an editor**, I can insert any block inside a column so that I can build rich vertical content.
- **As an editor**, I can reorder blocks inside a column so that I can control the reading flow.
- **As an editor**, I can transform inner blocks without affecting the column structure.

### Styling & Appearance
- **As an editor**, I can set background color, gradient, or image for the column so that I can visually differentiate it.
- **As an editor**, I can set padding, margin, and block spacing so that I can control spacing inside and around the column.
- **As an editor**, I can apply borders and border radius so that I can match the site’s design system.

### Responsive Behavior
- **As an editor**, I can preview how the column behaves on mobile, tablet, and desktop so that I can ensure the layout works across devices.
- **As an editor**, I can override mobile width so that I can fine‑tune the stacked layout.

### Accessibility & Keyboard Navigation
- **As an editor**, I can navigate into and out of a column using keyboard arrows so that I can edit efficiently.
- **As an editor**, I can move blocks between columns using keyboard shortcuts so that I can reorganize content quickly.

### Advanced Controls
- **As an editor**, I can assign custom CSS classes to the column so that developers can target it with theme‑specific styling.
- **As an editor**, I can lock the column (content lock or layout lock) so that other editors cannot modify its structure.

---

# 📘 2. Full block‑stories.md Entries  
*(Matches the structure of your existing block stories: Purpose → Editable Properties → Editor UI/UX → JSON → Rendering → Edge Cases → Accessibility → Mobile Behavior)*

---

## ## Columns Block

### **Purpose**
A layout container that arranges multiple Column Blocks horizontally, allowing editors to build multi‑column layouts with responsive behavior.

### **Editable Properties**
- `columns`: array of width percentages  
- `stackOnMobile`: boolean  
- `background`: color, gradient, image  
- `spacing`: padding, margin, gap  
- `border`: width, color, radius  
- `alignment`: default | wide | full  
- `className`: string  

### **Editor UI/UX Behavior**
- When inserted, the block prompts the user to choose a column pattern (50/50, 33/66, 25/25/50, etc.).
- Columns appear with draggable vertical handles for resizing.
- Clicking inside a column selects the inner block; clicking the outer frame selects the Columns Block.
- Sidebar shows layout controls, spacing, background, border, and responsive settings.
- Columns can be added, removed, or reordered.
- Mobile preview shows stacked layout if `stackOnMobile` is enabled.

### **JSON Structure**
```json
{
  "type": "columns",
  "attributes": {
    "columns": [50, 50],
    "stackOnMobile": true,
    "background": {
      "color": null,
      "gradient": null,
      "image": null
    },
    "spacing": {
      "padding": "20px",
      "margin": "0",
      "gap": "20px"
    },
    "border": {
      "width": "0px",
      "color": null,
      "radius": "0px"
    },
    "alignment": "default",
    "className": ""
  },
  "innerBlocks": [
    { "type": "column", "attributes": { ... }, "innerBlocks": [...] },
    { "type": "column", "attributes": { ... }, "innerBlocks": [...] }
  ]
}
```

### **Rendering Rules**
- Columns are rendered as a flex container.
- Widths are applied as percentages.
- On mobile, if `stackOnMobile` is true, columns become `flex-direction: column`.

### **Edge Cases**
- Removing a column redistributes widths evenly.
- Dragging a column below 5% snaps it to 5%.
- Total width always normalizes to 100%.

### **Accessibility**
- Columns have ARIA roles for grouping.
- Keyboard navigation moves horizontally between columns.

### **Mobile Behavior**
- Columns stack vertically unless overridden.
- Padding and spacing scale down based on theme rules.

---

## ## Column Block

### **Purpose**
A single vertical container inside a Columns Block, holding arbitrary inner blocks.

### **Editable Properties**

- `width`: percentage or `"auto"`
- `background`: color, gradient, image
- `spacing`: padding, margin
- `border`: width, color, radius
- `className`: string

### **Editor UI/UX Behavior**

- Column shows a vertical drop zone for inner blocks.
- Drag handles appear on left/right edges for resizing.
- Sidebar shows width, background, spacing, border, and advanced settings.
- Column cannot exist outside a Columns Block.

### **JSON Structure**

```json
{
  "type": "column",
  "attributes": {
    "width": "auto",
    "background": {
      "color": null,
      "gradient": null,
      "image": null
    },
    "spacing": {
      "padding": "20px",
      "margin": "0"
    },
    "border": {
      "width": "0px",
      "color": null,
      "radius": "0px"
    },
    "className": ""
  },
  "innerBlocks": []
}
```

### **Rendering Rules**

- Width is applied as a flex-basis percentage.
- If width is `"auto"`, the parent Columns Block distributes space evenly.

### **Edge Cases**

- Column width cannot exceed 95%.
- Removing a column triggers redistribution.

### **Accessibility**

- Column is a semantic grouping container.
- Keyboard navigation respects column boundaries.

### **Mobile Behavior**

- Width is ignored if parent stacks columns.

---

# 🧩 3. JSON Schema (Formal)

## Columns Block Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Columns Block",
  "type": "object",
  "properties": {
    "type": { "const": "columns" },
    "attributes": {
      "type": "object",
      "properties": {
        "columns": {
          "type": "array",
          "items": { "type": "number", "minimum": 5, "maximum": 100 }
        },
        "stackOnMobile": { "type": "boolean" },
        "background": {
          "type": "object",
          "properties": {
            "color": { "type": ["string", "null"] },
            "gradient": { "type": ["string", "null"] },
            "image": { "type": ["string", "null"] }
          }
        },
        "spacing": {
          "type": "object",
          "properties": {
            "padding": { "type": "string" },
            "margin": { "type": "string" },
            "gap": { "type": "string" }
          }
        },
        "border": {
          "type": "object",
          "properties": {
            "width": { "type": "string" },
            "color": { "type": ["string", "null"] },
            "radius": { "type": "string" }
          }
        },
        "alignment": {
          "type": "string",
          "enum": ["default", "wide", "full"]
        },
        "className": { "type": "string" }
      }
    },
    "innerBlocks": {
      "type": "array",
      "items": { "$ref": "#/definitions/columnBlock" }
    }
  },
  "definitions": {
    "columnBlock": {
      "type": "object",
      "properties": {
        "type": { "const": "column" }
      }
    }
  }
}
```

## Column Block Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Column Block",
  "type": "object",
  "properties": {
    "type": { "const": "column" },
    "attributes": {
      "type": "object",
      "properties": {
        "width": {
          "type": ["string", "number"],
          "pattern": "^(auto|[0-9]{1,3}%)$"
        },
        "background": {
          "type": "object",
          "properties": {
            "color": { "type": ["string", "null"] },
            "gradient": { "type": ["string", "null"] },
            "image": { "type": ["string", "null"] }
          }
        },
        "spacing": {
          "type": "object",
          "properties": {
            "padding": { "type": "string" },
            "margin": { "type": "string" }
          }
        },
        "border": {
          "type": "object",
          "properties": {
            "width": { "type": "string" },
            "color": { "type": ["string", "null"] },
            "radius": { "type": "string" }
          }
        },
        "className": { "type": "string" }
      }
    },
    "innerBlocks": {
      "type": "array",
      "items": { "type": "object" }
    }
  }
}
```

---

# 🎛️ 4. UX Flow — Sidebar Controls + Drag‑Resize

## Drag‑Resize Behavior

1. User hovers over the boundary between two columns.  
2. A vertical drag handle appears.  
3. On mousedown:
   - Editor enters “resize mode”.
   - Adjacent columns highlight.
4. As the user drags:
   - Widths update live.
   - Total width is normalized to 100%.
   - Widths snap at 5% increments.
5. On mouseup:
   - Resize mode ends.
   - Sidebar updates to show new width values.

## Sidebar Controls Flow

### For Columns Block

- **Layout**
  - Column pattern selector
  - Add/remove/reorder columns
  - Stack on mobile toggle
- **Spacing**
  - Padding
  - Margin
  - Gap
- **Background**
  - Color
  - Gradient
  - Image
- **Border**
  - Width
  - Color
  - Radius
- **Advanced**
  - Alignment (default, wide, full)
  - Custom CSS class
  - Locking

### For Column Block

- **Width**
  - Slider (0–100%)
  - Input field (percentage or auto)
  - Reset button
- **Background**
  - Color / gradient / image
- **Spacing**
  - Padding
  - Margin
- **Border**
  - Width / color / radius
- **Advanced**
  - Custom CSS class
  - Locking

---
