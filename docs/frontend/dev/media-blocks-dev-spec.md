# Media Blocks — Developer Spec

This document documents the Media-related editor blocks and example usage for developers integrating or testing them.

## Blocks

- `image`
- `gallery`
- `video`
- `audio`
- `file`
- `media-text`

---

## `image`
Create:

```js
const img = window.EDITOR_BLOCK_DEFINITIONS.image.create({ src: '/images/photo.jpg', alt: 'Alt text', caption: 'Photo caption' });
// resulting block shape: { id: null, type: 'image', attrs: { src, alt, caption, ... } }
```

Render expectations: renderer returns a container with an `<img>`; editor will update `attrs.src` when user picks an asset.

---

## `gallery`
Create:

```js
const g = window.EDITOR_BLOCK_DEFINITIONS.gallery.create({
  images: [
    { src: '/a.jpg', alt: 'A', caption: 'First image' },
    { src: '/b.jpg', alt: 'B', caption: 'Second image' }
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

Render expectations: responsive grid container with an empty dashed placeholder until images are added; `attrs.images` is an array of normalized image objects with `id`, `src`, `alt`, and `caption`. Re-ordering, image selection, inline caption editing, and gallery/image transforms are handled by canvas logic. See `docs/dev/gallery-block-dev-spec.md` for the full contract.

---

## `video`
Create:

```js
const v = window.EDITOR_BLOCK_DEFINITIONS.video.create({ src: '/videos/clip.mp4', poster: '/images/poster.jpg', controls: true });
```

Render: renderer provides a `<video>` or embed depending on `attrs`.

---

## `audio`
Create:

```js
const a = window.EDITOR_BLOCK_DEFINITIONS.audio.create({ src: '/audio/track.mp3', title: 'Episode 1' });
```

Render: `<audio controls>` element populated from `attrs.src`.

---

## `file`
Create:

```js
const f = window.EDITOR_BLOCK_DEFINITIONS.file.create({ src: '/files/guide.pdf', filename: 'guide.pdf' });
```

Render: anchor link with `download` attribute. `attrs.filename` used for link text.

---

## `media-text`
Create:

```js
const mt = window.EDITOR_BLOCK_DEFINITIONS['media-text'].create({ media: { type: 'image', src: '/images/side.jpg' }, text: [{ type: 'paragraph', attrs: { text: 'Supporting text' } }], layout: 'media-left' });
```

Render: two-column wrapper with media on one side, text on the other. Sub-block `text` may be rendered by `EditorCore.renderTree` if integrated.

---

## Notes for Integrators

- All blocks expose `create(attrs)` factories — use these to generate a consistent block object before inserting via `EditorCore.emit('insert', { type, attrs })`.
- Persisted attributes live under `block.attrs`.
- Media picker integration should update `attrs.src`, `attrs.width/height` and call `EditorCore.setBlockAttrs(id, patch)` to persist changes.
- Patterns and MRU behavior are handled by the inserter — ensure `window.EDITOR_BLOCK_DEFINITIONS` is available before the inserter script runs.

---

File: docs/dev/media-blocks-dev-spec.md
