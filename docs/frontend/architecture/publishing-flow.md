# **✅ Validated Flow: Private SWA → Public SWA via Blob + Table Storage**

Here’s the flow you described, restated in system terms:

1. **Editor writes a blog post in the private SWA**  
2. **On publish:**  
   - The post is rendered to **JSON or Markdown**  
   - The rendered artifact is stored in the **public blob container**  
   - Metadata (title, slug, date, tags, excerpt, etc.) is stored in **Azure Table Storage**  
3. **The public site uses a *single dynamic page* to render any post**  
   - The page reads the slug from the URL  
   - Fetches the JSON/MD from blob storage  
   - Fetches metadata from Table Storage  
   - Renders the post as HTML client‑side (or via SWA API)

This is **exactly** how you avoid bloating the public site with hundreds of static pages while still keeping the public site blazing fast.

---

# **💡 Why this architecture is correct**

### **1. You avoid generating hundreds of static HTML files**
Static Web Apps are great, but you don’t want:

```
/blog/post-1/index.html
/blog/post-2/index.html
/blog/post-3/index.html
...
```

That becomes unmanageable, especially with editor‑driven content.

Your approach keeps the public site *thin*:

```
/blog/[slug]
```

And everything else is data.

---

### **2. Blob storage is perfect for post bodies**
Blob storage gives you:

- Cheap storage  
- Versioning (optional)  
- Public or private access  
- CDN acceleration  
- Easy overwrite on update  

Storing **JSON or Markdown** is ideal because:

- JSON → perfect for your block‑based editor  
- Markdown → perfect for long‑form writing  
- Both → renderable client‑side or via SWA API

---

### **3. Table Storage is perfect for metadata**
Azure Table Storage gives you:

- Fast lookups  
- Partitioning by category/date  
- Cheap storage  
- Easy querying for archives, tags, categories  

A typical entity:

```
PartitionKey: "blog"
RowKey: "my-post-slug"
title: "My Post"
date: "2026-05-30"
tags: "azure, swa"
excerpt: "A short summary..."
blobPath: "posts/my-post-slug.json"
```

This is exactly how you build:

- Blog archive  
- Tag pages  
- Category pages  
- Search  
- “Recent posts” widgets  

Without generating static pages.

---

### **4. The public site stays static, fast, and cacheable**
Your public SWA only needs:

- A single **blog post template page**  
- A single **blog archive page**  
- A single **tag page**  
- A single **category page**

Everything else is data‑driven.

This is how modern static‑first CMS systems work (Ghost, Contentful, Sanity, etc.).

---

# **🚀 Recommended Implementation Details**

Here’s how to make this bulletproof.

---

## **A. Blob structure**

```
/posts/{slug}.json
/media/{guid}.jpg
```

Or Markdown:

```
/posts/{slug}.md
```

---

## **B. Table Storage structure**

Partition by year or category:

```
PartitionKey: "2026"
RowKey: "my-post-slug"
```

Or:

```
PartitionKey: "blog"
RowKey: "my-post-slug"
```

Include:

- title  
- slug  
- date  
- author  
- tags  
- categories  
- excerpt  
- blobPath  
- featuredImage  

---

## **C. Public SWA routing**

Your `routes.json`:

```json
{
  "routes": [
    {
      "route": "/blog/:slug",
      "rewrite": "/blog/post-viewer.html"
    }
  ]
}
```

`post-viewer.html` loads:

- The slug from the URL  
- Fetches blob JSON/MD  
- Fetches metadata  
- Renders the post  

---

## **D. Rendering options**

### **Option 1 — Client-side rendering (simplest)**
Your JS fetches the blob and metadata and renders it.

Pros: simplest  
Cons: SEO depends on prerendering or SWA’s built‑in crawler

---

### **Option 2 — SWA API prerender**
Your SWA API (Azure Functions) returns fully rendered HTML.

Pros: best SEO  
Cons: slightly more complex

---

### **Option 3 — Hybrid**
- Archive pages rendered client-side  
- Individual posts prerendered via API  

This is the sweet spot.

---

# **⚠️ Things to watch out for**

### **1. SEO**
If SEO matters, you want prerendered HTML for each post.  
SWA’s built‑in crawler *may* pick up dynamic content, but it’s not guaranteed.

Solution:  
Use an SWA API route:

```
/api/render-post?slug=my-post
```

And return HTML.

---

### **2. Cache invalidation**
When a post updates, you may need to purge CDN cache for:

- `/blog/{slug}`  
- `/blog` (archive)  
- `/tag/{tag}`  
- `/category/{category}`  

Azure CDN rules can handle this.

---

### **3. Security**
Your public blob container must be:

- Public read  
- But only your private SWA can write  

Use:

- Private container for drafts  
- Public container for published posts  
- Managed identity for write access

---

# **🎯 Final Verdict**

**Yes — your flow is valid, scalable, and architecturally correct.**  
It’s exactly how a modern static‑first CMS should work.

You get:

- A clean, lightweight public site  
- A powerful private editor  
- A simple publishing pipeline  
- Zero page bloat  
- Fast CDN‑accelerated delivery  
- Easy metadata querying  
- SEO‑friendly rendering options  

This is the right direction.

---
