# Public Pages Configuration

This document describes how the public-facing page configuration is structured in `app-public`.
It covers the page manifest schema, site header attributes, included styles/scripts, and the dynamic page routing model.

## Location

Public page definitions live in:

- `app-public/pages/*.json`
- content fragments in `app-public/pages/content/*.html`

The public runtime shell is:

- `app-public/page.html`
- `app-public/page-runtime.js`

## Purpose

Each JSON manifest defines one public page and the metadata needed to render it using the shared page shell.
The page template is responsible for:

- page title and metadata
- site header configuration
- layout/template selection
- content fragment injection
- script and stylesheet loading

## Page manifest structure

A public page manifest typically includes the following top-level fields:

```json
{
  "output": "what-we-do.html",
  "title": "What we do - 365 Evergreen",
  "includeAuthScripts": true,
  "metadata": {
    "pageTitle": "What we do",
    "description": "Overview of the services, content, and support areas delivered through 365 Evergreen.",
    "category": "public",
    "template": "/design-system/content-page",
    "layout": "standard",
    "showSidebar": false,
    "showBreadcrumbs": true,
    "contentType": "page"
  },
  "headerAttributes": {
    "data-auth": "false",
    "data-app": "public",
    "data-nav": "true",
    "data-search": "false",
    "data-title": "What we do",
    "data-tenant": "Public frontdoor"
  },
  "contentFile": "what-we-do.html"
}
```

### `output`

- Defines the intended page output file name when pages are rendered statically.
- Examples: `what-we-do.html`, `index.html`, `video.html`.

### `title`

- The browser title used in the rendered HTML `<title>`.
- This is the human-visible page title shown in tabs.

### `includeAuthScripts`

- When `true`, the shared auth scripts are injected:
  - `/msal-browser.min.js`
  - `/auth-config.js`
  - `/auth.js`
- This is useful for pages that require sign-in status or public auth flows.

### `metadata`

This object holds page-level metadata and template hints.
Common properties include:

- `pageTitle` — display title used in page metadata and rendered page headers
- `description` — page description for SEO and preview cards
- `category` — site category, e.g. `public`
- `template` — page template identifier or path, e.g. `content-page` or `/design-system/content-page`
- `layout` — layout hint like `standard`, `left-column`, `full-width`
- `showSidebar` / `showBreadcrumbs` — template-specific render flags
- `contentType` — semantic page type, e.g. `page`, `article`, `tool`

These metadata values are available to the shared rendering flow and can be used by the page shell or client-side runtime.

### `headerAttributes`

This object configures the shared site header mounting point:

- It is applied to `<div id="site-header">`.
- Common header attributes:
  - `data-auth`
  - `data-app`
  - `data-nav`
  - `data-search`
  - `data-title`
  - `data-tenant`
  - `data-signup`
  - `data-signup-path`
  - `data-home-href`
  - `data-icon-path`

Example:

```json
"headerAttributes": {
  "data-auth": "false",
  "data-app": "public",
  "data-nav": "true",
  "data-search": "false",
  "data-title": "What we do",
  "data-tenant": "Public frontdoor"
}
```

### `contentFile`

- Points to the HTML fragment containing the page body.
- Most fragments are stored under `app-public/pages/content/`.
- Example: `what-we-do.html`

The runtime loader fetches this fragment and inserts it into the main content host.

### `extraStylesheets`

- Optional array of stylesheet URLs to include on the page.
- Example:

```json
"extraStylesheets": ["/styles.css", "/page-editor.css"]
```

### `headScripts`

- Optional array of script URLs to load in the page `<head>`.
- Useful for page-specific runtime dependencies.

### `bodyScripts`

- Optional array of script URLs to load after the page content is inserted.
- Example for client-side widgets or page-specific behavior.

### `inlineScriptFiles`

- Optional array of local script file paths under `app-public/pages/`.
- The runtime fetches the file contents and appends them as inline `<script>` blocks.

### `footerNote`

- Optional string to override the default footer text.

## Shared shell and site header

Public pages render inside a shared page shell.
The current shell is defined by:

- `design-system/templates/page.html`
- `app-public/page.html`
- `app-public/page-runtime.js`

### Shared page shell responsibilities

The shell provides:

- shared CSS: `/styles.css`
- site header mount point: `<div id="site-header"></div>`
- shared header script: `/site-header.js`
- shared auth scripts when enabled
- content insertion point: `<main id="page-content"></main>`
- footer note area

### Site header configuration

The header is rendered by `/site-header.js` and configured by `headerAttributes`.
Any attribute under `headerAttributes` is written to the header container so the same header component can render different page contexts.

For example, a public page may disable search and auth state in the header:

```json
"headerAttributes": {
  "data-auth": "false",
  "data-nav": "true",
  "data-search": "false",
  "data-title": "Public content",
  "data-tenant": "Public frontdoor"
}
```

## Styles

- `/styles.css` is the global site stylesheet and is always loaded by the shared page shell.
- Page manifests may use `extraStylesheets` to add additional CSS files for page-specific styling.
- The `metadata.template` and `metadata.layout` fields are page-level hints; the actual layout may be implemented by the shared shell and CSS.

## Dynamic page route

The public app also supports a slug-based page route:

- `/page.html?slug=<page-slug>`

This route is rendered by:

- `app-public/page.html`
- `app-public/page-runtime.js`

### How it works

1. `page-runtime.js` reads `slug` from the query string.
2. It loads the matching manifest from `app-public/pages/<slug>.json`.
3. It applies `title`, `headerAttributes`, and any script/style settings.
4. It fetches `contentFile` and inserts the HTML into the content host.

### Recommended usage

For navigation links and published content, prefer a route like:

```json
"href": "/page.html?slug=what-we-do"
```

This allows the site to reuse the same shell for multiple pages rather than shipping a separate HTML file for each page.

## Static page generation

A separate static page build flow also exists for `app-public`:

- `scripts/build-pages.js`
- `scripts/build-app.js`

These scripts read JSON manifests from `app-public/pages/*.json`, render them with the shared design-system template, and write HTML files to the output folder.

The build pipeline supports the same manifest fields, so pages can be published either as static outputs or served dynamically via `page.html?slug=...`.

## Example manifest

```json
{
  "output": "what-we-do.html",
  "title": "What we do - 365 Evergreen",
  "includeAuthScripts": true,
  "metadata": {
    "pageTitle": "What we do",
    "description": "Overview of the services, content, and support areas delivered through 365 Evergreen.",
    "category": "public",
    "template": "/design-system/content-page",
    "layout": "standard",
    "showSidebar": false,
    "showBreadcrumbs": true,
    "contentType": "page"
  },
  "headerAttributes": {
    "data-auth": "false",
    "data-app": "public",
    "data-nav": "true",
    "data-search": "false",
    "data-title": "What we do",
    "data-tenant": "Public frontdoor"
  },
  "contentFile": "what-we-do.html"
}
```

## Notes

- `contentFile` paths are normally relative to `app-public/pages/`.
- `headerAttributes` should be used to control header appearance and behaviour without duplicating header markup inside the content fragment.
- Use `extraStylesheets`, `headScripts`, `bodyScripts`, and `inlineScriptFiles` only when the page needs custom assets beyond the shared shell.
- `metadata` is the main place to describe the page template, presentation flags, and semantic type.
