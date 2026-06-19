# Gallery Block — Developer Spec

This document describes the current `gallery` block implementation in the Page Editor and the integration points needed to extend or test it.

## Goals

- Insert an empty gallery block with immediate JSON scaffolding.
- Support multi-image upload, media-library selection, URL insertion, and drag-and-drop.
- Allow gallery-level editing for columns, crop, link behavior, lightbox, spacing, borders, and width.
- Allow image-level editing for alt text, caption, replace, remove, and reorder actions.
- Support transforms:
  - `gallery` -> multiple `image` blocks
  - multiple selected `image` blocks -> `gallery`

## Block contract

The gallery block is defined in `app-private/editor/blocks.js`.

```js
const gallery = window.EDITOR_BLOCK_DEFINITIONS.gallery.create({
  images: [
    { src: '/images/one.jpg', alt: 'One', caption: 'First image' },
    { src: '/images/two.jpg', alt: 'Two', caption: 'Second image' }
  ],
  columns: 3,
  crop: true,
  linkTo: 'none',
  lightbox: false,
  style: {
    spacing: { gap: '12px' },
    border: { radius: '12px', width: '1px', color: '#d1d5db' },
    layout: 'wide'
  }
});
```

Normalized JSON shape:

```json
{
  "type": "gallery",
  "attrs": {
    "images": [
      {
        "id": "img_1710000000000_abcd1234",
        "src": "/images/one.jpg",
        "alt": "One",
        "caption": "First image"
      }
    ],
    "columns": 3,
    "crop": true,
    "linkTo": "none",
    "lightbox": false,
    "style": {
      "spacing": { "gap": "12px" },
      "border": { "radius": "", "width": "", "color": "#d1d5db" },
      "layout": "default"
    },
    "className": ""
  }
}
```

## Editor behavior

### Insert and populate

`gallery.create()` always creates the full schema immediately, even when `images` is empty.

The empty renderer outputs a dashed placeholder with:

- `Upload`
- `Media Library`
- `Insert URL`
- drag-and-drop support for multiple files

Helpers exposed on `window.EditorGalleryUtils`:

```js
const imagesFromLibrary = window.EditorGalleryUtils.promptForGalleryLibraryImages({ multiple: true });
const imagesFromUrls = window.EditorGalleryUtils.promptForGalleryUrlImages({ multiple: true });
const uploadedImages = await window.EditorGalleryUtils.pickGalleryUploadImages({ multiple: true });
```

Each helper returns normalized image objects:

```js
[
  { id: 'img_...', src: '/images/example.jpg', alt: 'example', caption: '' }
]
```

### Canvas rendering

The renderer outputs:

- `.pe-gallery-grid` with responsive columns
- `.pe-gallery-item` figures with drag handles
- `.pe-gallery-remove` hover action
- `.pe-gallery-caption[contenteditable]` for inline caption editing

Selection is split into two modes:

1. **Gallery selected**: wrapper click selects the block and exposes gallery-level toolbar / inspector settings.
2. **Gallery image selected**: clicking an item selects that image and exposes image-specific toolbar / inspector settings.

### Toolbar behavior

Visibility is controlled by `app-private/editor/toolbar-registry.json`.

- `gallery:block`
  - add images
  - columns
  - crop toggle
  - link behavior
  - lightbox toggle
  - width layout
  - convert to images
- `gallery:image`
  - replace image
  - remove image
  - link behavior
  - crop toggle

### Inspector behavior

`app-private/editor/inspector.js` renders:

- **Gallery settings**
  - columns slider
  - gap slider
  - crop checkbox
  - link behavior
  - lightbox toggle
  - layout width
  - border radius / width / color
- **Selected image**
  - source
  - alt text
  - caption

## Transform behavior

Convert a gallery into standalone image blocks:

```js
window.EditorCore.emit('transform', { id: galleryBlockId, type: 'image' });
```

Convert multiple selected image blocks into a gallery:

```js
window.EditorCore.selectBlockById(firstImageId);
window.EditorCore.selectBlockById(secondImageId, { append: true });
window.EditorCore.emit('transform', { id: secondImageId, type: 'gallery' });
```

The gallery transform preserves `src`, `alt`, and `caption`.

## Responsive behavior

The rendered grid uses the configured column count on larger screens and reduces density at smaller breakpoints.

Runtime defaults:

```js
window.EDITOR_GALLERY_THEME = {
  breakpoints: {
    tablet: 1024,
    mobile: 680
  },
  responsiveColumns: {
    tablet: 2,
    mobile: 1
  }
};
```

If `window.EDITOR_GALLERY_THEME` is not defined, the editor uses the defaults above.

## Key files

- `app-private/editor/blocks.js`
- `app-private/editor/canvas.js`
- `app-private/editor/toolbar.js`
- `app-private/editor/toolbar-registry.json`
- `app-private/editor/inspector.js`
- `app-private/editor/index.css`
- `app-private/block-registry.json`
