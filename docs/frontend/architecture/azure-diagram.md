# **📘 Azure Architecture Diagram (Text‑Based Representation)**  
_“Private SWA Editor → Shared Storage → Public SWA Blog”_

Below is the full system diagram expressed in a clear, hierarchical, Azure‑style layout.

---

# **1. High‑Level Diagram (Conceptual)**

```
+-------------------+          +---------------------------+          +----------------------+
|   Private SWA     |  Write   |   Azure Storage Account   |  Read    |     Public SWA       |
| (Editor + Admin)  +--------->|  - Blob Storage           +--------->| (Public Blog Website) |
|                   |          |  - Table Storage          |          |                      |
+-------------------+          +---------------------------+          +----------------------+
                                      ^
                                      |
                                      | Optional (for SEO, SSR)
                                      |
                              +------------------+
                              |  SWA API (Func)  |
                              |  - Render Post   |
                              |  - Archive API   |
                              +------------------+
```

---

# **2. Detailed Azure Architecture Diagram (Full Components)**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Private SWA (Editor)                            │
│                                                                              │
│  - React/JS block editor                                                     │
│  - Command bar, templates, media manager                                     │
│  - Authenticated via Entra ID                                                │
│                                                                              │
│  Publishes via:                                                              │
│    POST /api/publishPost                                                     │
│    PUT  /api/updatePost                                                      │
│                                                                              │
└───────────────┬──────────────────────────────────────────────────────────────┘
                │ Managed Identity (Write)
                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Azure Functions (Editor API)                         │
│                                                                              │
│  Responsibilities:                                                           │
│   - Validate post payload                                                    │
│   - Generate slug                                                            │
│   - Write JSON/MD to Blob Storage                                            │
│   - Upsert metadata into Table Storage                                       │
│   - Generate excerpt if missing                                              │
│   - Trigger CDN purge (optional)                                             │
│                                                                              │
└───────────────┬──────────────────────────────────────────────────────────────┘
                │ Writes blobs + table rows
                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Azure Storage Account                                │
│                                                                              │
│  Blob Containers:                                                            │
│   /content-public                                                            │
│      /posts/{year}/{month}/{slug}.json                                       │
│      /media/{guid}.{ext}                                                     │
│                                                                              │
│   /content-private                                                           │
│      /drafts/{slug}.json                                                     │
│                                                                              │
│  Table Storage:                                                              │
│   BlogPosts                                                                  │
│     PartitionKey: "2026" or "blog"                                           │
│     RowKey: slug                                                             │
│     title, excerpt, tags, categories, featuredImage, blobPath, date, status  │
│                                                                              │
└───────────────┬──────────────────────────────────────────────────────────────┘
                │ Public Read (Blob) / Query (Table)
                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                             Public SWA (Blog)                                │
│                                                                              │
│  Routes:                                                                     │
│   /blog                                                                      │
│   /blog/page/:page                                                           │
│   /blog/tag/:tag                                                             │
│   /blog/category/:category                                                   │
│   /blog/:slug                                                                │
│                                                                              │
│  Client-side logic:                                                          │
│   - Fetch metadata from Table Storage (direct or via API)                    │
│   - Fetch post body from Blob Storage                                        │
│   - Render JSON/MD → HTML                                                    │
│                                                                              │
│  Optional: Use SWA API for SEO-friendly prerendering                         │
│                                                                              │
└───────────────┬──────────────────────────────────────────────────────────────┘
                │ Optional SSR / SEO
                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Azure Functions (Public API)                         │
│                                                                              │
│  /api/post?slug=x                                                            │
│     - Fetch metadata + blob                                                  │
│     - Return rendered HTML                                                   │
│                                                                              │
│  /api/archive?page=n                                                         │
│     - Query BlogPosts table                                                  │
│     - Return paginated list                                                  │
│                                                                              │
│  /api/tag?tag=x                                                              │
│  /api/category?category=x                                                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# **3. Archive / Tag / Category Logic (Integrated Into Diagram)**

### **Archive (`/blog` or `/blog/page/:n`)**
- Public SWA calls:
  - **Option A:** Direct Table Storage query  
  - **Option B:** `/api/archive?page=n`
- Sort by `date DESC`
- Paginate
- Render cards

### **Tag (`/blog/tag/:tag`)**
- Public SWA calls:
  - **Option A:** Table scan + filter `tags contains tag`
  - **Option B:** `/api/tag?tag=x`
- Render list

### **Category (`/blog/category/:category`)**
- Same as tags

### **Single Post (`/blog/:slug`)**
- Public SWA calls:
  - **Option A:** Table lookup → blob fetch → render client-side  
  - **Option B:** `/api/post?slug=x` → returns HTML  
- Render post template

---

# **4. Optional Enhancements (Diagram Add‑Ons)**

### **A. CDN Layer**
```
Public SWA → Azure CDN → Blob Storage
```
- Faster global delivery  
- Automatic caching of post bodies  

### **B. Search Index**
```
Azure Cognitive Search
  - Index built from BlogPosts table
  - Powers full-text search
```

### **C. Versioning**
```
/posts/{slug}/v1.json
/posts/{slug}/v2.json
```

---

# **5. Summary (One‑Sentence Architecture Statement)**

**A private SWA writes post bodies to Blob Storage and metadata to Table Storage; the public SWA reads both to render a dynamic blog using a single post template, with optional Azure Functions providing SEO‑friendly prerendering and archive APIs.**

---
