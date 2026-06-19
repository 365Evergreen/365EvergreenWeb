# 1. Core mental model

- **Blob** = post body (JSON/MD)  
- **Table** = index (metadata)  
- **Public SWA** = thin shell that:
  - Lists posts (archive/tag/category)
  - Renders a single post via slug

Everything below is just different ways of querying the same `BlogPosts` table and wiring it into a few routes.

---

## 2. Archive / tag / category page logic

I’ll assume this table shape (from earlier):

```text
Table: BlogPosts

PartitionKey   string
RowKey         string  // slug
title          string
slug           string
date           string  // ISO
excerpt        string
tags           string  // "azure,swa"
categories     string  // "architecture,patterns"
featuredImage  string
blobPath       string
status         string  // "published"
```

You can adapt partitioning as needed.

---

### 2.1 Archive page (`/blog` and `/blog/page/:n`)

**Goal:** list posts in reverse chronological order, paginated.

**Query strategy (simple, good enough up to ~10k posts):**

- `PartitionKey = "blog"` (or `"2026"` if you partition by year)
- `status = "published"`
- Order by `date` descending (client or API)
- Apply pagination (skip/take or continuation token)

**Flow:**

1. Public SWA route:

   ```json
   {
     "route": "/blog",
     "rewrite": "/blog/archive.html"
   },
   {
     "route": "/blog/page/:page",
     "rewrite": "/blog/archive.html"
   }
   ```

2. `archive.html` JS (or SWA API) does:

   - Read `page` from URL (default 1)
   - Query `BlogPosts` for `status = "published"`
   - Sort by `date` desc
   - Take `pageSize` (e.g. 10)
   - Render list: title, date, excerpt, link `/blog/{slug}`

**Optional optimization:**

- Use an SWA API (`/api/archive?page=1`) to:
  - Query Table Storage
  - Return `{ items, totalCount }`
  - Keep keys/connection strings off the client

---

### 2.2 Tag page (`/blog/tag/:tag`)

**Goal:** list posts that contain a given tag.

**Tag storage:** `tags = "azure,swa,static-web-apps"`

**Query strategy (simple):**

- `PartitionKey = "blog"`
- `status = "published"`
- Filter client/API side: `tags` contains `tag` (case‑insensitive)

**Flow:**

1. Route:

   ```json
   {
     "route": "/blog/tag/:tag",
     "rewrite": "/blog/tag.html"
   }
   ```

2. `tag.html` JS/API:

   - Read `tag` from URL
   - Query `BlogPosts` for `status = "published"`
   - Filter where `tags` contains `tag`
   - Sort by `date` desc
   - Render list

**If you want this to scale harder:**

- Add a **TagIndex** table:

  ```text
  Table: BlogTags

  PartitionKey = tag
  RowKey       = slug
  ```

- Then tag page query is:

  - `PartitionKey = "{tag}"` → get slugs
  - Batch fetch posts by slug from `BlogPosts` (or embed metadata directly in `BlogTags`)

---

### 2.3 Category page (`/blog/category/:category`)

Same pattern as tags.

**Category storage:** `categories = "architecture,patterns"`

**Simple strategy:**

- `PartitionKey = "blog"`
- Filter where `categories` contains `category`

**Optimized strategy:**

- `PartitionKey = "{category}"` in a `BlogCategories` table, same shape as `BlogTags`.

**Route:**

```json
{
  "route": "/blog/category/:category",
  "rewrite": "/blog/category.html"
}
```

**Page logic:**

- Read `category` from URL
- Query + filter + sort
- Render list

---

### 2.4 Single post page (`/blog/:slug`)

**Goal:** render one post using blob + table.

**Flow:**

1. Route:

   ```json
   {
     "route": "/blog/:slug",
     "rewrite": "/blog/post.html"
   }
   ```

2. `post.html` JS/API:

   - Read `slug` from URL
   - Query `BlogPosts` for `RowKey = slug`
   - Get `blobPath`
   - Fetch blob (`posts/2026/05/slug.json` or `.md`)
   - Render:
     - Title, date, tags, categories, featured image (from table)
     - Body (from blob → JSON→HTML or MD→HTML)

---

## 3. Full architecture diagram (described in words)

Imagine this as a left‑to‑right flow.

---

### 3.1 Left side: Private SWA (Editor)

**Components:**

- **Private SWA** (Editor UI)
  - Block editor
  - Command bar
  - Template picker
- **Azure Functions (Editor API)**
  - `POST /api/publishPost`
  - `PUT /api/updatePost`
  - `GET /api/listDrafts`

**Publish flow:**

1. Editor hits **Publish**.
2. Editor calls `POST /api/publishPost` with:
   - Post JSON (blocks) or MD
   - Metadata (title, slug, tags, categories, excerpt, featuredImage, date)
3. Function:
   - Writes blob → `posts/{year}/{month}/{slug}.json` (or `.md`)
   - Upserts entity in `BlogPosts` table
   - Optionally updates `BlogTags` / `BlogCategories` tables
4. Returns success + URL (`/blog/{slug}`).

---

### 3.2 Middle: Shared data layer

**Azure Storage Account:**

- **Blob containers:**
  - `content-public`
    - `/posts/{year}/{month}/{slug}.json`
    - `/media/{guid}.{ext}`
  - `content-private`
    - `/drafts/{slug}.json`

- **Table Storage:**
  - `BlogPosts`
  - (Optional) `BlogTags`
  - (Optional) `BlogCategories`

This storage account is:

- **Writeable** by the private SWA (via Functions + managed identity)
- **Readable** by the public SWA (directly or via API)

---

### 3.3 Right side: Public SWA (Site)

**Components:**

- **Public SWA** (Static front‑end)
  - Routes:
    - `/blog`
    - `/blog/page/:page`
    - `/blog/tag/:tag`
    - `/blog/category/:category`
    - `/blog/:slug`
- **Azure Functions (Public API, optional but recommended)**
  - `GET /api/archive?page=n`
  - `GET /api/tag?tag=x&page=n`
  - `GET /api/category?category=x&page=n`
  - `GET /api/post?slug=x`

**Runtime flow:**

- Archive page:
  - Calls `/api/archive?page=1`
  - API queries `BlogPosts`, returns list
  - Front‑end renders cards

- Tag page:
  - Calls `/api/tag?tag=azure`
  - API queries `BlogPosts` (or `BlogTags`), returns list

- Category page:
  - Same pattern

- Single post:
  - Calls `/api/post?slug=my-post`
  - API:
    - Looks up `BlogPosts` entity
    - Fetches blob
    - Returns `{ metadata, body }` or pre‑rendered HTML

You can also skip the API and hit Table/Blob directly from the client if you’re okay with exposing read keys or using public containers.

---

## 4. How this all feels in practice

- Editors live entirely in the **private SWA** world.  
- The **public SWA** never needs to be redeployed for new posts.  
- All dynamic behavior is just **data lookups**:
  - Table for lists
  - Blob for bodies
- You can scale to thousands of posts without touching the public app.

---
