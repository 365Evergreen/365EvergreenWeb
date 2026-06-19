<!--
Path: docs/dev/drawer-component-dev-spec.md
Purpose: Developer-facing specification for the reusable design-system drawer component.
-->

# SWA Design System — Drawer Component Dev Spec

Status: Draft

## Purpose

`design-system/drawer.js` provides a reusable right-hand drawer that slides over the page content. It is intended for secondary tasks such as:

1. contextual details
2. lightweight forms
3. filters
4. help panels
5. supplemental navigation

The drawer uses shared styling from `design-system/styles.css`, so it fits the existing site header and page shell without page-specific CSS.

## Source of truth

- Component script: `design-system/drawer.js`
- Component styles: `design-system/styles.css`
- Shared page shell: `design-system/templates/page.html`

## Runtime contract

The component is a custom element:

```html
<site-drawer id="contact-drawer" title="Contact us" width="420px">
  <p>Drawer body content.</p>

  <div data-drawer-footer>
    <button type="button" onclick="document.getElementById('contact-drawer').hide()">Close</button>
  </div>
</site-drawer>
```

Supported attributes:

| Attribute | Purpose | Default |
| --- | --- | --- |
| `title` | Drawer heading text | `Drawer` |
| `width` | CSS width for the panel | `420px` |
| `open` | Opens the drawer when present | closed |
| `close-on-backdrop` | Set to `"false"` to disable backdrop close | backdrop closes |

Available methods:

```js
const drawer = document.getElementById('contact-drawer');

drawer.show();
drawer.hide();
drawer.toggle();

SiteDrawer.open('#contact-drawer');
SiteDrawer.close('#contact-drawer');
SiteDrawer.toggle('#contact-drawer');
```

Runtime behavior:

- flies in from the right
- closes on Escape
- closes on backdrop click unless `close-on-backdrop="false"`
- returns focus to the previously focused element
- locks body scrolling while any drawer is open

## How to add the drawer to a page

The shared page template already injects:

- `/styles.css`
- `/site-header.js`

To use the drawer on a page, add **only** the drawer script to the page manifest and then add the drawer markup to the content file.

### 1. Add the drawer script to the page manifest

Example page manifest:

```json
{
  "output": "what-we-do/index.html",
  "title": "What we do - 365 Evergreen",
  "headerAttributes": {
    "data-nav": "true",
    "data-title": "What we do"
  },
  "bodyScripts": [
    "/drawer.js",
    "/scripts/what-we-do.js"
  ],
  "contentFile": "content/what-we-do.html"
}
```

`/drawer.js` is required because the page shell does **not** auto-load it the way it auto-loads `/site-header.js`.

### 2. Add trigger + drawer markup to the page content

Example content fragment:

```html
<section class="page-section">
  <h2>Need help choosing the right path?</h2>
  <p>Open the drawer for a quick guided summary.</p>
  <button type="button" class="primary" onclick="SiteDrawer.open('#what-we-do-drawer')">
    Open drawer
  </button>
</section>

<site-drawer id="what-we-do-drawer" title="Choose your next step" width="440px">
  <p>Use this area for supporting content, quick actions, or a lightweight form.</p>
  <ul>
    <li>Explore public guidance</li>
    <li>Review featured resources</li>
    <li>Sign in for private tools</li>
  </ul>

  <div data-drawer-footer>
    <button type="button" class="secondary" onclick="document.getElementById('what-we-do-drawer').hide()">
      Close
    </button>
  </div>
</site-drawer>
```

## Recommended page patterns

Use the drawer when:

- the interaction is secondary to the main page flow
- the user should stay on the current page
- the content is short enough to fit a narrow side panel

Do **not** use the drawer when:

- the content is primary page content
- the flow is long or multi-step
- the interaction needs full-page context, complex validation, or deep navigation

## Editor UI integration

The current editor does not yet have a native `drawer` block type, so the recommended implementation is to add one as a new block in `app-private/page-editor.js` and `app-private/editor/blocks.js`.

### Recommended block shape

Start with a flat block contract that matches the current editor model:

```json
{
  "id": "drawer-1",
  "type": "drawer",
  "title": "Choose your next step",
  "triggerText": "Open drawer",
  "triggerVariant": "primary",
  "width": "440px",
  "closeOnBackdrop": true,
  "bodyHtml": "<p>Use this area for supporting content.</p>",
  "footerHtml": "<button type=\"button\">Close</button>",
  "className": "",
  "align": "left"
}
```

This is intentionally similar to the existing flat block objects already used by the editor for `embed`, `button`, `card`, and `callout`.

### Recommended editor fields

Add the following controls to the block settings panel:

| Field | Control | Maps to |
| --- | --- | --- |
| Drawer title | text input | `title` |
| Trigger label | text input | `triggerText` |
| Trigger variant | select | `triggerVariant` |
| Width | select or text input | `width` |
| Close on backdrop | checkbox | `closeOnBackdrop` |
| Body content | rich text or trusted HTML textarea | `bodyHtml` |
| Footer content | trusted HTML textarea | `footerHtml` |
| Custom class name | text input | `className` |
| Alignment | select | `align` |

Suggested width options:

- `360px`
- `420px`
- `480px`
- `560px`
- custom value

### Recommended editor preview output

The block preview should render:

1. the trigger button in the canvas
2. a non-interactive drawer shell preview beside or below it
3. a summary of title, width, and whether footer content exists

That keeps the editor canvas readable without forcing the full interactive drawer behavior inside the authoring surface.

### Recommended save mapping

When the editor publishes a `drawer` block, it should output:

1. a trigger button
2. the `<site-drawer>` element
3. optional footer markup wrapped in `<div data-drawer-footer>`

Example render function:

```js
function renderDrawerBlock(block) {
  const drawerId = escapeHtml(block.id || `drawer-${Date.now()}`);
  const width = escapeHtml(block.width || '420px');
  const title = escapeHtml(block.title || 'Drawer');
  const triggerText = escapeHtml(block.triggerText || 'Open drawer');
  const closeOnBackdrop = block.closeOnBackdrop === false ? ' close-on-backdrop="false"' : '';
  const className = block.className ? ` ${escapeHtml(block.className)}` : '';
  const footer = block.footerHtml
    ? `<div data-drawer-footer>${block.footerHtml}</div>`
    : '';

  return [
    `<div class="pe-preview-block pe-preview-drawer${className}">`,
    `<button type="button" class="primary" onclick="SiteDrawer.open('#${drawerId}')">${triggerText}</button>`,
    `<site-drawer id="${drawerId}" title="${title}" width="${width}"${closeOnBackdrop}>`,
    block.bodyHtml || '',
    footer,
    '</site-drawer>',
    '</div>'
  ].join('');
}
```

## Editor registration notes

Recommended implementation points:

- add `drawer` to `window.EDITOR_BLOCK_ORDER` in `app-private/page-editor.js`
- add a `create` factory for `drawer` in `app-private/editor/blocks.js`
- add settings-panel UI in `app-private/page-editor.js`
- add preview rendering in the page editor preview renderer
- ensure generated pages include `/drawer.js` when at least one drawer block is present

## Asset-loading rule

Drawer pages should continue to use the shared page shell from `design-system/templates/page.html`. That means:

- keep the shared header and shared stylesheet loading in the page template
- load `/drawer.js` only on pages that need a drawer
- do not duplicate drawer CSS in page-specific stylesheets

## Accessibility notes

- always provide a meaningful `title`
- keep trigger text action-oriented
- do not hide critical actions exclusively inside the drawer
- prefer simple, vertical content layouts inside the panel
- if a form is placed in the drawer, make validation messages visible without requiring horizontal scrolling
