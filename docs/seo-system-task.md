# SEO System Task — enterpriseai.tools

Checked: 2026-04-19

## Goal
Treat SEO as an operating system for the site, not a one-off metadata pass.

## Scope
This workstream covers:
- crawlability and indexability
- canonical URLs and metadata standards
- sitemap and robots hygiene
- structured data
- internal linking
- search-console / webmaster verification
- production monitoring and measurement

## Current state
The site already has a solid base:
- route-level metadata
- canonical URLs
- Open Graph / Twitter cards
- crawlable static routes
- JSON-LD on category pages

The gaps are mostly operational and systemic:
- sitemap maintenance was manual
- no formal SEO runbook existed
- structured data coverage was incomplete
- internal linking can be stronger on key hub pages
- search-console readiness was not documented as part of launch

## Standards

### 1) Route inventory
Maintain a single canonical route inventory in code.
Use it to generate:
- `public/sitemap.xml`
- crawlable route checks
- any future SEO route audits

### 2) Metadata standards
Per page type:
- unique title
- unique meta description
- canonical URL
- social preview defaults unless a page has a better image

Avoid vague titles like `Home` or repeated descriptions across sections.

### 3) Structured data rules
Use only accurate, supportable schema.
Current approved types:
- `WebSite`
- `Organization`
- `CollectionPage`
- `BreadcrumbList`
- `ItemList`
- `SoftwareApplication`

Do not add speculative schema types just for SEO checklists.

### 4) Internal linking rules
Important hub pages should link intentionally to:
- major category pages
- updates feed
- about/contribution page when relevant
- related platform/category hubs

The updates page should help crawlers and users move into the main category hubs.

### 5) Search Console / webmaster readiness
After production domain is live and stable:
1. verify `https://enterpriseai.tools/` and/or `https://www.enterpriseai.tools/`
2. submit sitemap
3. verify robots fetch
4. inspect core hub URLs for indexability
5. monitor coverage, queries, impressions, CTR, and crawl issues

## Immediate implementation plan

### P1
- [x] Create SEO audit doc
- [x] Create SEO system task doc
- [x] Replace manual sitemap/robots maintenance with generated artifacts
- [x] Add root-level `WebSite` + `Organization` structured data
- [x] Add breadcrumb schema on major hub pages
- [x] Strengthen updates-page internal links into hub pages

### P2
- [x] Review metadata copy for every page type against actual search intent and encode the rules in `seo-route-inventory.json`
- [x] Add stronger related-links modules between category and platform hubs
- [x] Evaluate `CollectionPage` schema coverage across non-category hubs
- [x] Add production-domain SEO verification checklist to deployment docs
- [x] Validate metadata uniqueness/lengths and Atom feed discoverability in `npm run check-seo-readiness`

### P3
- [ ] Add live performance/Core Web Vitals checks to the launch workflow
- [ ] Track search-console metrics after production indexation starts
- [x] Expose a machine-readable updates feed (`/updates.xml`) as part of the discoverability system
- [ ] Expand content architecture beyond top-level hubs when there is source-backed material worth indexing

## Validation expectations
For SEO-related PRs, run at minimum:
- `npm run lint`
- `npm run build`
- confirm generated `public/sitemap.xml` and `public/robots.txt` reflect the route inventory
- confirm structured data renders without obvious JSON issues

## Non-goals
- keyword stuffing
- inaccurate schema
- doorway pages
- thin pages created only for search engines
