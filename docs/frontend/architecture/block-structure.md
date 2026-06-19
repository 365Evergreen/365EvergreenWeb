# 🧱 **Top‑Level Repo Structure**
```
/editor
  /blocks
  /core
  /ui
  /schemas
  /state
  /utils
  index.js
```

---

# 📦 **Blocks Folder (the heart of the system)**  
Each block lives in its own folder, with its own schema, edit component, save renderer, and controls.

```
/editor/blocks
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

  /cover
    block.json
    index.js
    edit.js
    save.js
    controls.js
    popovers/
      overlay-color-popover.js
      media-picker-popover.js
```

---

# 🧩 **What Each File Does**

### **block.json**  
Defines the block’s metadata and attributes.

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

### **index.js**  
Registers the block with your editor runtime.

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

### **edit.js**  
The interactive editor component.

```jsx
export default function ParagraphEdit({ attributes, setAttributes }) {
  return (
    <p contentEditable onInput={e => setAttributes({ content: e.target.innerText })}>
      {attributes.content}
    </p>
  )
}
```

---

### **controls.js**  
This is where your block declares its toolbar, inspector, and popover controls.

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

This is the key:  
**Controls are declared per block, not globally.**

---

### **popovers/**  
Each popover is a standalone component.

```
/popovers
  link-popover.js
  color-popover.js
```

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

# 🧭 **Editor-Level Structure (the host)**

```
/editor/core
  block-registry.js
  renderer.js
  selection.js
  popover-manager.js

/editor/ui
  toolbar/
  inspector/
  popover/
  components/

```

### **block-registry.js**
Loads all blocks dynamically.

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

---

### **popover-manager.js**
Mounts popovers for the selected block.

```js
export function renderPopovers(selectedBlock) {
  selectedBlock.controls.popovers.forEach(PopoverComponent => {
    mountPopover(<PopoverComponent />)
  })
}
```

No conditionals.  
No global mapping.  
Just: **block declares → editor renders**.

---

# 🧠 Why This Structure Works

### ✔ Blocks are fully self-contained  
Drop a block folder into another project and it works.

### ✔ No global conditional rendering  
The editor simply renders what the block exposes.

### ✔ Scales to 50+ blocks  
No central file grows out of control.

### ✔ Mirrors WordPress mental model  
Your devs will instantly understand it.

### ✔ Supports advanced blocks  
Cover, Gallery, Drawer, Search Grid — all can ship their own popovers.

---

# 🏁 Final Recommendation  
Use this repo structure.  
It is the cleanest, most modular, most WordPress‑aligned architecture for your SWA editor.

