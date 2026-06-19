# **1. Blob Schema (Public Site Content Storage)**  
This is where the **post body** lives — JSON (block model) or Markdown.

## **1.1 Folder Structure**
```
/posts/{year}/{month}/{slug}.json
/posts/{year}/{month}/{slug}.md
/media/{guid}.{ext}
/drafts/{slug}.json
```

### Why this structure works
- Chronological partitioning keeps containers tidy  
- Easy to purge old content  
- Easy to generate archives by year/month  
- Works with CDN caching  
- Supports both JSON and MD

---

## **1.2 JSON Post Body Schema**
If using your block‑based editor:

```json
{
  "version": 1,
  "slug": "my-post-slug",
  "title": "My Post Title",
  "blocks": [
    {
      "type": "paragraph",
      "content": "Hello world"
    },
    {
      "type": "image",
      "src": "/media/abc123.jpg",
      "alt": "A photo"
    }
  ],
  "excerpt": "Short summary of the post",
  "featuredImage": "/media/abc123.jpg"
}
```

### Notes
- `version` allows future migrations  
- `blocks` is your full editor output  
- `excerpt` is duplicated here for convenience  
- `featuredImage` is optional but recommended  

---

## **1.3 Markdown Post Body Schema**
If using Markdown:

```
---
title: "My Post Title"
slug: "my-post-slug"
date: "2026-05-30"
tags: ["azure", "swa"]
categories: ["architecture"]
excerpt: "Short summary of the post"
featuredImage: "/media/abc123.jpg"
---

# Heading

Post content here...
```

### Notes
- Frontmatter mirrors table metadata  
- Markdown body is rendered client‑side or via API  

---

# **2. Azure Table Storage Schema (Metadata Index)**  
This is the **index** for your blog — the thing that powers:

- Archive pages  
- Tag pages  
- Category pages  
- Search  
- Recent posts  
- Pagination  

Blob storage holds the content.  
**Table storage holds the metadata.**

---

## **2.1 Table Name**
```
BlogPosts
```

---

## **2.2 Entity Schema**
Here is the exact entity you should store:

| Property | Type | Required | Description |
|---------|------|----------|-------------|
| **PartitionKey** | string | Yes | Usually `"blog"` or `"2026"` or `"azure"` depending on strategy |
| **RowKey** | string | Yes | The post slug |
| **title** | string | Yes | Post title |
| **slug** | string | Yes | Duplicate of RowKey for convenience |
| **date** | string (ISO 8601) | Yes | Publish date |
| **excerpt** | string | Optional | Short summary |
| **tags** | string | Optional | Comma‑separated list |
| **categories** | string | Optional | Comma‑separated list |
| **featuredImage** | string | Optional | Blob path |
| **blobPath** | string | Yes | Path to JSON/MD file |
| **author** | string | Optional | Editor name |
| **status** | string | Yes | `"published"`, `"draft"`, `"archived"` |
| **updatedAt** | string | Yes | ISO timestamp |
| **createdAt** | string | Yes | ISO timestamp |

### Example Entity
```json
{
  "PartitionKey": "2026",
  "RowKey": "my-post-slug",
  "title": "My Post Title",
  "slug": "my-post-slug",
  "date": "2026-05-30T10:00:00Z",
  "excerpt": "Short summary of the post",
  "tags": "azure,swa",
  "categories": "architecture",
  "featuredImage": "media/abc123.jpg",
  "blobPath": "posts/2026/05/my-post-slug.json",
  "author": "Paul",
  "status": "published",
  "createdAt": "2026-05-30T09:00:00Z",
  "updatedAt": "2026-05-30T10:00:00Z"
}
```

---

# **3. Partitioning Strategy (Critical for Scale)**  
You have three valid strategies. Pick one based on your needs.

---

## **Option A — Partition by Year (Recommended)**
```
PartitionKey = "2026"
RowKey = "{slug}"
```

### Pros
- Fast queries for archives  
- Even distribution  
- Easy to delete old content  

### Cons
- Tag/category queries require scanning multiple partitions  

---

## **Option B — Partition by Category**
```
PartitionKey = "architecture"
RowKey = "{slug}"
```

### Pros
- Category pages are extremely fast  
- Good for content‑heavy sites  

### Cons
- Posts with multiple categories require duplication or a join table  

---

## **Option C — Single Partition**
```
PartitionKey = "blog"
RowKey = "{slug}"
```

### Pros
- Simplest  
- Easiest to maintain  

### Cons
- Table scans for archives  
- Not ideal for >10k posts  

---

# **4. Cross‑References (Blob ↔ Table)**  
This is the glue that makes the system work.

### Table → Blob
`blobPath` tells the public site where to fetch the content.

### Blob → Table
Frontmatter or JSON includes:

- `slug`
- `title`
- `excerpt`
- `featuredImage`

This allows rebuilding metadata if needed.

---

# **5. Optional Enhancements**

---

## **5.1 Versioning**
Store versions in:

```
/posts/{slug}/v1.json
/posts/{slug}/v2.json
```

And add to table:

```
version: 2
```

---

## **5.2 Drafts**
Store drafts in a private container:

```
/drafts/{slug}.json
```

And table:

```
status: "draft"
```

---

## **5.3 Soft Deletes**
Instead of deleting:

```
status: "archived"
deletedAt: "2026-05-30T12:00:00Z"
```

---

# **6. Final Architecture Summary**

### **Blob Storage**
- Holds the post body (JSON or MD)  
- Holds media  
- Public read, private write  

### **Table Storage**
- Holds metadata  
- Powers all listing pages  
- Fast, cheap, scalable  

### **Public SWA**
- One dynamic page: `/blog/:slug`  
- Fetches blob + metadata  
- Renders HTML  

### **Private SWA**
- Full editor  
- Publishes to blob + table  

---

