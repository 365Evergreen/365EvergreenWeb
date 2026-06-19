# 365 Evergreen Website Implementation Plan

## Objectives

- Launch a **mobile-first, fully responsive** marketing website for 365 Evergreen.
- Host a blog with content in Azure Blob Storage and metadata in Azure Table Storage.
- Integrate an anonymous-access chatbot using either Copilot Studio or Azure AI Foundry.
- Optimize for SEO, Core Web Vitals, and discoverability.

## 1. Target Architecture (Week 1)

1. **Frontend:** React app hosted on Azure Static Web Apps (SWA).
2. **Backend/API:** Azure Functions (SWA integrated API) for blog APIs, sitemap/feed, and bot integration endpoints.
3. **Content storage:** Azure Blob Storage for blog post bodies/assets (Markdown preferred, optional pre-rendered HTML).
4. **Metadata storage:** Azure Table Storage for post metadata and publishing state.
5. **Bot integration:** Copilot Studio or Foundry, embedded in frontend with backend guardrails.

### Decision gates

- **Bot platform**
  - Copilot Studio: faster time-to-market.
  - Foundry: more flexibility and extensibility.
- **Content format**
  - Recommend Markdown (`.md`) as canonical authoring source.

## 2. Content & Data Model (Week 1)

### Blob container layout

- `posts/{yyyy}/{mm}/{slug}/post.md`
- `posts/{yyyy}/{mm}/{slug}/post.html` (optional pre-render)
- `assets/{slug}/...`

### Table schema (`BlogPosts`)

- `PartitionKey`: `blog` (or `yyyyMM` if scaling by period is needed).
- `RowKey`: `slug`.
- Suggested columns:
  - `title`, `excerpt`, `author`
  - `publishedAt`, `updatedAt`
  - `tags`, `category`
  - `status` (`draft` | `published`)
  - `canonicalUrl`, `metaTitle`, `metaDescription`, `ogImage`
  - `contentPath`, `contentType`, `readingTime`, `isIndexed`

### Publishing flow

- Content lands in Blob.
- Metadata is inserted/updated in Table through a publish pipeline or Function endpoint.

## 3. Frontend Delivery (Weeks 2–3)

1. Build marketing pages (Home, Features, CTA/Pricing, About, Contact).
2. Build blog pages:
   - `/blog` list with pagination/filter/tag views.
   - `/blog/{slug}` post detail.
3. Embed chatbot on selected routes (launcher + dedicated chat experience).
4. Implement reusable SEO components (meta tags, canonical, structured data hooks).

## 4. Mobile-First & Responsive Implementation (Weeks 2–3)

1. Start from narrow viewport breakpoints first (mobile baseline).
2. Use responsive layout primitives (fluid grids, flexible containers, responsive typography scale).
3. Define breakpoints as design tokens and apply consistently.
4. Ensure touch-first usability:
   - tap targets sized for mobile
   - sticky nav/CTA behaviour that avoids viewport overlap
   - keyboard and screen-reader accessibility preserved across breakpoints
5. Optimize media delivery:
   - responsive images (`srcset`/sizes)
   - lazy loading below the fold
6. Validate across representative devices and orientations.

### Responsive acceptance criteria

- No horizontal scrolling on common mobile widths.
- Navigation, blog cards, and chatbot UI remain usable on small screens.
- Blog typography/readability remains accessible on mobile.
- Layout remains stable (no major CLS issues) across breakpoints.

## 5. API & Functions (Weeks 2–3)

Implement Azure Functions for:

1. `GET /api/posts` (Table-backed listing, filters, pagination).
2. `GET /api/posts/{slug}` (metadata + Blob content retrieval).
3. `GET /api/sitemap.xml` (marketing + blog URLs).
4. `GET /api/rss.xml` (recommended).
5. `POST /api/bot/token` (if required for Foundry/Web Chat pattern).
6. `POST /api/content/publish` (optional internal publishing endpoint).

## 6. SEO Strategy (Weeks 3–4)

1. Ensure crawlable content for marketing and blog pages (SSR/prerender strategy as required).
2. Dynamic metadata per page:
   - title, description, canonical
   - Open Graph + Twitter cards
3. Structured data:
   - `Organization`, `WebSite`, `BreadcrumbList`, `BlogPosting`
4. Search controls:
   - `robots.txt`
   - dynamic `sitemap.xml`
5. Internal linking model:
   - topic clusters/pillar pages
   - related posts
6. Performance targets aligned to Core Web Vitals (LCP, CLS, INP).

## 7. Anonymous Bot Access & Safety (Week 4)

1. Public, anonymous bot entry points on site.
2. Backend guardrails:
   - rate limiting
   - origin restrictions
   - abuse controls
3. Safety and monitoring:
   - content safety policy
   - telemetry for failures, user flow drop-off, and cost tracking

## 8. DevOps, Environments, and Operations (Week 4)

1. Environments: `dev`, `test`, `prod`.
2. CI/CD (GitHub Actions):
   - build/test/lint
   - deploy SWA + Functions
3. IaC (Bicep or Terraform) for SWA, Storage, Function configuration, monitoring.
4. App settings/secrets management with secure configuration practices.
5. Monitoring and alerting via Application Insights.

## 9. Launch & Content Operations (Week 5)

1. Seed launch content:
   - key marketing pages
   - 10–20 blog posts
2. Register and validate indexing with search webmaster tools.
3. Editorial workflow:
   - draft -> review -> publish
   - automatic sitemap/feed refresh on publish
4. Ongoing cadence:
   - weekly content updates
   - monthly SEO refresh and bot quality review

## MVP Scope (Recommended First Release)

1. React marketing site + responsive blog list/detail pages.
2. Blob + Table backed content architecture.
3. Core APIs: posts list/detail + sitemap.
4. Anonymous bot embedded on target pages.
5. Baseline SEO + mobile-first/responsive compliance.
