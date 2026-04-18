# SEO Readiness Audit — enterpriseai.tools

Checked: 2026-04-18

## Scope
Initial technical/content SEO audit based on the current repo and static export structure.

## What is already good

### Crawlability / indexability
- `public/robots.txt` exists and allows crawling.
- `public/sitemap.xml` exists and includes the core routes.
- Static export generates crawlable HTML routes:
  - `/`
  - `/platforms/`
  - `/agents/`
  - `/orchestration/`
  - `/governance/`
  - `/assistants/`
  - `/updates/`
  - `/about/`

### Metadata foundations
- route-level metadata exists for homepage and category/about pages via `buildMetadata()`.
- canonical URLs are generated centrally in `lib/metadata.ts`.
- Open Graph and Twitter metadata are present.
- `metadataBase` is configured from `NEXT_PUBLIC_SITE_URL` fallbacking to `https://enterpriseai.tools`.

### Structured data
- JSON-LD support exists.
- Category/listing pages emit `ItemList` + `SoftwareApplication` data.

### Basic discoverability support
- Titles and descriptions are already more specific than a generic scaffold site.
- Site has category pages and internal navigation that support search discovery better than a single-page landing site.

## Current gaps / weaknesses

### 1) Sitemap is static and thin
Current sitemap is hand-maintained and only includes 8 top-level routes.

Risks:
- can drift from actual routes
- does not capture future expansion automatically
- does not express freshness from data sources beyond fixed `changefreq`

Recommendation:
- generate sitemap from route/data source at build time
- keep canonical route inventory in code, not hand-maintained XML

### 2) No explicit SEO operating checklist in repo
There is no dedicated SEO runbook/checklist defining:
- crawl/index rules
- title/description standards
- internal linking expectations
- schema rules
- launch/verification checklist (Search Console, Bing Webmaster, indexing checks)

Recommendation:
- create `docs/seo-system-task.md` or equivalent implementation plan

### 3) Discoverability is structurally limited by content depth
The current site has strong category pages, but long-term Google discoverability will need more than metadata.

Likely missing growth assets:
- durable comparison pages for individual tools/vendors/use cases
- richer editorial/analysis pages
- stronger update archive discoverability
- more contextual internal links between pages and tool records

Recommendation:
- define a content model for indexable pages beyond the current category set

### 4) Search Console readiness not yet represented in repo workflow
No explicit tracking yet for:
- Google Search Console verification
- sitemap submission
- indexing monitoring
- query/click measurement
- broken-page / coverage issue review

Recommendation:
- add this to deploy/ops checklist once production domain is stable

### 5) Internal linking strategy is still basic
Navigation exists, but SEO-grade internal linking should be more intentional.

Missing/weak areas to review:
- cross-links between platform/category pages
- contextual links from updates to relevant category pages
- stronger “related pages” modules
- hub/spoke linking patterns for major enterprise AI topics

### 6) Structured data could be expanded
Current JSON-LD is good groundwork, but there may be room for:
- `WebSite`
- `Organization`
- `BreadcrumbList`
- potentially more precise modeling for comparison/hub pages

Need caution:
- do not add schema just for checkbox SEO; keep it accurate and supportable

### 7) No explicit measurement/performance SEO workstream yet
Technical SEO should include:
- Core Web Vitals review
- page weight/image discipline
- render blocking review
- monitoring of live page speed on production domain

This likely overlaps with prior performance work, but it should be tied into discoverability goals.

## Priority recommendations

### P1 — immediate
1. Create a dedicated SEO workstream/spec in repo
2. Replace static sitemap maintenance with generated sitemap logic
3. Define metadata/title/description standards per page type
4. Define Search Console readiness + verification checklist

### P2 — near-term
5. Audit and strengthen internal linking
6. Expand schema carefully where justified
7. Define indexable content expansion strategy (comparison/hub pages, durable updates structure)

### P3 — ongoing
8. Monitor Core Web Vitals and crawl/index coverage after production domain stabilizes
9. Track queries, impressions, pages indexed, CTR, and content gaps

## Practical conclusion
The site is **not starting from zero**. It already has solid metadata, canonicals, sitemap/robots, and JSON-LD foundations.

But it is **not yet a fully SEO-operated site**.

The next phase should treat SEO as a system:
- technical foundation
- content architecture
- internal linking
- search-console/measurement loop
- disciplined iteration

## Suggested next implementation artifact
- `docs/seo-system-task.md`

This should become the source document for actual SEO work items and implementation sequencing.
