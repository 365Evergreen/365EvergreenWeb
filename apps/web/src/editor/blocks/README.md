# 📘 **Editor Blocks Architecture — README**

This document describes the architecture, folder structure, and conventions for building blocks in the SWA Editor.  
Each block is fully self-contained and ships its own schema, edit component, save renderer, controls, and popovers.

The first live implementation of this structure now exists for the text and media blocks:

- `paragraph`
- `heading`
- `code`
- `list`
- `image`
- `gallery`
- `video`
- `audio`
- `file`
- `media-text`

This mirrors the WordPress Gutenberg model while remaining lightweight and framework‑agnostic.

---

## 🧱 **Goals of This Architecture**

- **Encapsulation** — each block owns its UI, controls, and behavior  
- **Scalability** — adding new blocks requires no changes to global files  
- **Predictability** — editor simply renders what the block exposes  
- **Extensibility** — blocks can define custom popovers, toolbars, inspector panels  
- **Portability** — blocks can be moved between projects with zero coupling  

---

## 📂 **Repository Structure**

```
/editor
  /blocks
    /paragraph
      block.json
      index.js
      edit.js
      save.js
      controls.js
      popovers/
        link-popover.js
        color-popover.js
      styles.css

    /heading
      block.json
      index.js
      edit.js
      save.js
      controls.js
      popovers/
        typography-popover.js

    /image
      block.json
      index.js
      edit.js
      save.js
      controls.js
      popovers/
        focal-point-popover.js
        alt-text-popover.js

  /core
    block-registry.js
    renderer.js
    selection.js
    popover-manager.js

  /ui
    toolbar/
    inspector/
    popover/
    components/

  /schemas
  /state
  /utils
```

---

## 🧩 **Block Anatomy**

Each block lives in its own folder and contains:

### **1. `block.json` — Block Metadata & Attributes**

Defines the block’s identity and schema.

```json
{
  "name": "core/paragraph",
  "title": "Paragraph",
  "category": "text",
  "attributes": {
    "content": { "type": "string" },
    "align": { "type": "string" }
  }
}
```

---

### **2. `index.js` — Block Registration**

Exports the block definition consumed by the editor runtime.

```js
import schema from './block.json'
import Edit from './edit'
import Save from './save'
import controls from './controls'

export default {
  schema,
  Edit,
  Save,
  controls
}
```

---

### **3. `edit.js` — Editor Component**

Interactive editing experience.

```jsx
export default function ParagraphEdit({ attributes, setAttributes }) {
  return (
    <p
      contentEditable
      onInput={e => setAttributes({ content: e.target.innerText })}
    >
      {attributes.content}
    </p>
  )
}
```

---

### **4. `save.js` — Static Output Renderer**

Defines how the block is serialized into the published page.

```jsx
export default function ParagraphSave({ attributes }) {
  return <p>{attributes.content}</p>
}
```

---

### **5. `controls.js` — Toolbar, Inspector, and Popover Controls**

Blocks declare their own controls.  
The editor does not conditionally render anything — it simply mounts what the block exposes.

```js
import LinkPopover from './popovers/link-popover'
import ColorPopover from './popovers/color-popover'

export default {
  toolbar: [
    { type: 'bold' },
    { type: 'italic' },
    { type: 'link', popover: LinkPopover }
  ],
  inspector: [
    { type: 'color', popover: ColorPopover }
  ],
  popovers: [
    LinkPopover,
    ColorPopover
  ]
}
```

---

### **6. `popovers/` — Block-Specific Popover Components**

Each popover is a standalone UI component.

Example:

```jsx
export default function LinkPopover({ anchorRef, value, onChange }) {
  return (
    <Popover anchorRef={anchorRef}>
      <input
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </Popover>
  )
}
```

---

## 🧭 **Editor Runtime Responsibilities**

The editor is intentionally minimal.  
It does **not** contain block-specific logic.

### **`block-registry.js`**
Loads all blocks:

```js
import paragraph from '../blocks/paragraph'
import heading from '../blocks/heading'
import image from '../blocks/image'

export const BLOCKS = {
  paragraph,
  heading,
  image
}
```

### **`renderer.js`**
Renders the selected block’s edit component.

### **`popover-manager.js`**
Mounts all popovers declared by the block.

### **`toolbar/` & `inspector/`**
Render the block’s declared controls.

---

## 🧠 **Design Principles**

### ✔ Blocks declare their own controls  
No global mapping.  
No conditional rendering.

### ✔ Editor is a host, not a controller  
It simply renders what the block exposes.

### ✔ Popovers are composable primitives  
Blocks can define unlimited custom popovers.

### ✔ Adding a new block is trivial  
Create a folder → export block → done.

---

## 🚀 **Creating a New Block**

1. Create a folder under `/editor/blocks/my-block`
2. Add:
   - `block.json`
   - `index.js`
   - `edit.js`
   - `save.js`
   - `controls.js`
   - `popovers/` (optional)
3. Export the block in `index.js`
4. Add it to the registry (or use auto-discovery)

---

## 🏁 **Summary**

This architecture gives you:

- WordPress‑style block encapsulation  
- A clean, scalable SWA editor  
- Zero global conditionals  
- Unlimited extensibility  
- A predictable developer experience  

Your editor becomes a **block host**, not a block orchestrator — exactly the right model for long-term maintainability.

---
