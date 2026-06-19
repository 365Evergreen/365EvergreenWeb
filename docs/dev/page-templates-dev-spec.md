<!--
Path: docs/dev/page-templates-dev-spec.md
Purpose: Developer-facing specification for shared page template scaffolds stored in design-system/page-templates.
-->

# SWA Page Editor — Page Templates Dev Spec

Status: Draft — aligned to `docs/stories/page-editor/page-templates.md`

## Purpose

This document defines the shared page template scaffolds used by the page editor when creating new pages. The template source-of-truth lives in:

- `design-system/page-templates/index.json`
- `design-system/page-templates/*.json`

These files are **editor scaffolds**, not rendered HTML pages. They provide:

- default page metadata
- shared rendering contract for the canonical design-system page shell
- initial block trees
- template IDs for workflow and publishing
- editor hints such as allowed block types

## Implemented templates

The following templates were added from the story requirements:

1. `landing-page`
2. `content-page`
3. `blog-archive-page`
4. `search-results-page`
5. `blog-post-page`
6. `left-column-page`

## File layout

```text
design-system/
  page-templates/
    index.json
    landing-page.json
    content-page.json
    blog-archive-page.json
    search-results-page.json
    blog-post-page.json
    left-column-page.json
```

## Template file contract

Each template file follows this shape:

```json
{
  "id": "landing-page",
  "label": "Landing Page",
  "description": "Human-readable summary shown in the editor picker.",
  "page": {
    "title": "Landing Page",
    "rendering": {
      "pageTemplate": "design-system/templates/page.html",
      "sharedStylesheet": "/styles.css",
      "sharedHeaderScript": "/site-header.js",
      "headerMountId": "site-header"
    },
    "headerAttributes": {
      "data-nav": "true",
      "data-search": "false",
      "data-title": "{{pageTitle}}"
    },
    "metadata": {
      "template": "landing-page",
      "layout": "full-width"
    }
  },
  "editor": {
    "allowedBlockTypes": ["hero", "heading", "paragraph", "button"]
  },
  "blocks": [
    {
      "id": "landing-hero",
      "type": "hero",
      "title": "Hero title"
    }
  ]
}
```

## Shared page shell contract

Every new template now declares that it renders inside the shared page shell from `design-system`:

- `page.rendering.pageTemplate` -> `design-system/templates/page.html`
- `page.rendering.sharedStylesheet` -> `/styles.css`
- `page.rendering.sharedHeaderScript` -> `/site-header.js`
- `page.headerAttributes` -> default attributes for the shared `<div id="site-header">`

This keeps the editor scaffolds aligned with the canonical HTML template, which already injects:

```html
<link rel="stylesheet" href="/styles.css" />
<div id="site-header"{{headerAttributes}}></div>
<script src="/site-header.js"></script>
```

The template JSON should describe this shared contract, but should **not** duplicate stylesheet or header script injection in the page content itself.

## Registry contract

`index.json` is the discovery file for the editor. It should stay small and only expose picker-level metadata:

```json
{
  "version": 1,
  "templates": [
    {
      "id": "landing-page",
      "label": "Landing Page",
      "description": "Conversion-focused marketing page.",
      "file": "landing-page.json"
    }
  ]
}
```

## How the editor should load templates

Recommended loading flow:

1. Load `design-system/page-templates/index.json`
2. Show the template list in the picker UI
3. Fetch the selected template file
4. Clone its `page` and `blocks` payload into editor state
5. Generate any missing runtime-only values

Example loader:

```js
async function loadTemplateRegistry() {
  const response = await fetch('/page-templates/index.json');
  if (!response.ok) {
    throw new Error('Could not load page template registry.');
  }

  return response.json();
}

async function loadTemplate(templateId) {
  const registry = await loadTemplateRegistry();
  const entry = (registry.templates || []).find((item) => item.id === templateId);

  if (!entry) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  const response = await fetch(`/page-templates/${entry.file}`);
  if (!response.ok) {
    throw new Error(`Could not load template file: ${entry.file}`);
  }

  return response.json();
}
```

## How to apply a template to editor state

The current editor state shape already separates page-level properties from the block tree. The template files should be mapped into that structure instead of being used directly as the final saved manifest.

Example:

```js
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function applyTemplateToEditorState(template) {
  const metadata = template.page && template.page.metadata ? clone(template.page.metadata) : {};
  const blocks = Array.isArray(template.blocks) ? clone(template.blocks) : [];

  return {
    page: {
      title: template.page && template.page.title ? template.page.title : '',
      path: '',
      pathEdited: false,
      status: 'Draft',
      published: false,
      metadata
    },
    rendering: template.page && template.page.rendering ? clone(template.page.rendering) : null,
    headerAttributes: template.page && template.page.headerAttributes ? clone(template.page.headerAttributes) : {},
    blocks,
    templateId: template.id
  };
}
```

## Saving and publishing

When the editor saves a page based on a template:

- `metadata.template` should remain the canonical template ID
- `page.rendering` should stay aligned to `design-system/templates/page.html`
- `headerAttributes` should flow into the generated page manifest so the shared site header can render correctly
- editor-specific state should **not** be written into the published page manifest
- published manifests should continue to use the existing page schema (`output`, `title`, `metadata`, `headerAttributes`, `contentFile`, scripts/styles)

Example save mapping:

```js
function buildManifestFromEditorState(state) {
  return {
    output: `${slugify(state.page.title)}.html`,
    title: `${state.page.title} — 365 Evergreen`,
    metadata: {
      ...state.page.metadata,
      pageTitle: state.page.title
    },
    headerAttributes: state.headerAttributes,
    contentFile: `content/${slugify(state.page.title)}.html`
  };
}
```

## Template-specific notes

### Landing Page

- uses `layout: "full-width"`
- starts with hero, feature grid, social proof, and final CTA blocks
- optimized for campaign and conversion scenarios

### Content Page

- uses `layout: "standard"`
- starts with a title, intro paragraph, and flexible body group
- intended for informational pages such as About, Services, and policies

### Blog Archive Page

- uses a dynamic `search-results` block configured with `dataSource: "blog-posts"`
- keeps archive-specific settings in metadata:
  - `postsPerPage`
  - `archiveLayout`
  - `showFeaturedImages`
  - `showExcerpts`
  - `defaultSort`

### Search Results Page

- uses the dynamic `search-results` block with `dataSource: "site-search"`
- metadata captures layout and visibility choices for result cards

### Blog Post Page

- includes metadata placeholders for:
  - `author`
  - `publishDate`
  - `tags`
  - `categories`
  - `featuredImage`
  - `seoTitle`
  - `metaDescription`
  - `socialImage`

### Left-Hand Column Page

- uses `layout: "two-column-left"`
- stores left-column behavior in metadata:
  - `leftColumnWidth`
  - `leftColumnSticky`
  - `collapseBreakpoint`

## Implementation notes for this repo

Recommended next-step integration points:

- expose the registry through the built app bundle by copying `design-system/page-templates`
- add a template picker to `app-private/page-editor.js`
- when a user chooses a template, initialize `state.page.metadata.template` from the template ID
- preserve the editor’s existing manifest/content generation flow

## Guardrails

- treat `design-system/page-templates` as the **source of truth**
- keep template files free of environment-specific URLs
- do not store rendered HTML in the template files; store block JSON only
- prefer reusable metadata keys across templates so the metadata store can query consistently
