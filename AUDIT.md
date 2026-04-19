# enterpriseai.tools — Site Audit Report
**Date:** 2026-04-16  
**Auditor:** Claude Sonnet 4.6  
**Scope:** Full Phase 1 audit — build guide compliance, data integrity, UX/a11y, performance, code quality, SEO, deployment.

---

## Summary

| Severity | Count |
|---|---|
| Critical | 4 |
| High | 10 |
| Medium | 9 |
| Low | 8 |
| **Total** | **31** |

The site is well-structured for a v1. The data model is sound, comparison tables are populated for all categories, filtering is present, and the dark/light toggle works without hydration flash. The main blockers to a clean production launch are: a missing Azure Static Web Apps routing config (will cause 404s on deep links), a broken OG image format (SVG not rendered by social platforms), web fonts not actually loading, and a CI pipeline wired to the wrong branch.

---

## CRITICAL — Blocks Launch

### C-1: Missing `staticwebapp.config.json`
**File:** not present  
**Effort:** Small (< 1 hour)

Azure Static Web Apps serving a Next.js `output: "export"` does not automatically handle client-side routing fallbacks. Without a `staticwebapp.config.json`, any URL that is not `/index.html` will return a 404 if a user navigates directly (e.g. bookmarks `/agents/`, pastes a URL, or refreshes). Azure Static Web Apps requires explicit navigation fallback rules.

**Impact when fixed:** All pages become directly accessible via URL; deep links, bookmarks, and refreshes work correctly.

**Fix:** Add `staticwebapp.config.json` at the repo root:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/logos/*", "/*.svg", "/*.ico", "/*.json"]
  },
  "globalHeaders": {
    "Cache-Control": "public, max-age=0, must-revalidate"
  }
}
```

---

### C-2: Social preview OG image is SVG (not rendered by social platforms)
**File:** `app/layout.tsx:65–72`, `lib/metadata.ts:37–42`, `public/social-preview.svg`  
**Effort:** Small (< 1 hour)

The Open Graph and Twitter Card image is `/social-preview.svg`. Twitter, LinkedIn, Slack, and most social crawlers do not render SVG OG images — they require JPEG or PNG. The current config produces broken or absent previews when anyone shares a link.

**Impact when fixed:** All social link previews show the intended image.

**Fix:** Export `social-preview.svg` as a 1200×630 PNG (`public/social-preview.png`) and update `lib/metadata.ts` and `app/layout.tsx` to reference `/social-preview.png`. The SVG source can be retained for reference.

---

### C-3: Web fonts were not loaded at audit time (resolved)
**File:** `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`  
**Effort:** Small (< 1 hour)

At audit time, the CSS referenced `Inter` and `JetBrains Mono` without loading either font. That issue was later addressed: `Inter` is now loaded via `next/font/google`, and the non-critical `JetBrains Mono` webfont was intentionally removed from the runtime path to reduce homepage preload weight. Monospace styling now uses a system fallback stack instead.

**Current state:** Resolved. Keep `Inter` loaded through `next/font/google`; keep monospace UI/code styles on the explicit system mono stack unless a future change can prove a custom mono font does not hurt live performance.

---

### C-4: GitHub Actions CI targets `main` but project's base branch is `radar/review-ready-site-pass`
**File:** `.github/workflows/azure-static-web-apps.yml:5–8`  
**Effort:** Small (< 1 hour)

The workflow triggers on push to `main` and PRs against `main`. The project's live main branch is `radar/review-ready-site-pass`. Pushes to that branch do not trigger the deploy pipeline; the site is only manually deployable via `workflow_dispatch`.

**Impact when fixed:** Merges to the main branch automatically deploy to Azure Static Web Apps.

**Fix:** Update `branches` in the workflow from `main` to `radar/review-ready-site-pass` (or rename the branch to `main`). Also, the `close_pull_request` job should target the same branch.

---

## HIGH — Significantly Hurts UX or Credibility

### H-1: `lastRelease` field missing for all 41 tools — sort by "last updated" is broken
**File:** `data/tools.json` (all entries), `components/tool-card.tsx:83`, `lib/category-filters.ts:31`  
**Effort:** Large (> 4 hours to populate, small to add fallback UI)

Not a single tool entry has a `lastRelease` field populated. The sort option "Last updated (recent first)" silently falls back to unchanged order (all values are `""` so `localeCompare` is stable). The tool card renders `Released {tool.lastRelease}` which is never shown. Data is incomplete.

**Impact when fixed:** Sort by last updated becomes meaningful; tool cards show verified release recency.

**Fix (two parts):**  
1. Populate `lastRelease` (ISO date) for all tools from their GitHub releases. Prioritise the 41 currently tracked. Use `version` already present as a guide.  
2. Immediately: add a `"No release date"` fallback label in `ToolCard` where `tool.lastRelease` would render, so the empty state is explicit rather than silent.

---

### H-2: Assistants page uses anchor-scroll navigation, not interactive tabs
**File:** `components/assistants-page.tsx:39–51`, `app/assistants/page.tsx:3`  
**Effort:** Medium (1–4 hours)

The build guide specifies "Subcategory tabs on Assistants page (Coding | Productivity | Build Your Own)". The current `AssistantsPage` component (the one actually wired to the route) renders all three subcategories stacked vertically with anchor-link scroll navigation (`<a href="#coding">`). There are no interactive tabs; the comparison tables and tool cards for all three subcategories load simultaneously. This produces a very long page that doesn't match the specified tab UX.

An interactive tab implementation exists in `components/assistants-page-client.tsx` but is **dead code** (no page route imports it — see H-3).

**Impact when fixed:** Assistants page shows one subcategory at a time with vendor comparison table inline, matching the build guide spec.

**Fix:** Wire `AssistantsPageClient` into `app/assistants/page.tsx` instead of `AssistantsPage`. Ensure tab state resets gracefully on mount and verify keyboard navigation (see UX section).

---

### H-3: Three dead components exist alongside the live equivalents
**Files:**
- `components/assistants-page-client.tsx` — unused (interactive tab version of assistants page)  
- `components/category-page-client.tsx` — unused (client-state filtering version of category page)  
- `components/theme-toggle.tsx` — unused (the `Header` manages the toggle via inline script)  

**Effort:** Small (< 1 hour to delete)

These files represent earlier approaches that were superseded. Their presence creates confusion about which path is authoritative, risks accidental re-introduction, and inflates the component surface. `theme-toggle.tsx` in particular exports a React state-based toggle that would flash on hydration if used — the current inline-script approach in `Header` is deliberately chosen to avoid that flash.

**Impact when fixed:** Codebase accurately represents implemented functionality; no risk of reverting to hydration-flash or wrong architecture.

**Fix:** Delete all three files. Run a grep to confirm nothing imports them before deletion.

---

### H-4: `CategoryFilterBar` (URL-param filter) is dead code — filtered views are not bookmarkable
**File:** `components/category-filter-bar.tsx`  
**Effort:** Medium (1–4 hours to wire) or Small (< 1 hour to delete if not proceeding)

A URL query-parameter-based filter bar exists (`CategoryFilterBar`) that would make filtered views shareable and bookmarkable (e.g. `/agents?type=opensource&sort=stars`). The `lib/category-filters.ts` even includes `parseCategoryFilterState` for server-side parsing. However, this component is never used; all filtering is done with `useState` in `FilteredCategorySections`, which resets on every page load.

**Impact when fixed:** Filtered views become linkable and shareable; the URL reflects the current view state.

**Fix:** Either (a) use `CategoryFilterBar` in category pages with `searchParams` passed down from the server page component (the existing `parseCategoryFilterState` already handles this), or (b) delete the dead component. Option (a) is the better long-term path.

---

### H-5: Missing `robots.txt`
**File:** not present  
**Effort:** Small (< 1 hour)

No `robots.txt` exists. Crawlers will index everything by default, but the absence signals an incomplete deployment. In Next.js static exports, the file should be placed at `public/robots.txt` or generated via `app/robots.ts`.

**Impact when fixed:** Proper crawler directives; signals a complete, production-ready deployment.

**Fix:** Add `public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://enterpriseai.tools/sitemap.xml
```

---

### H-6: Missing `sitemap.xml`
**File:** not present  
**Effort:** Small (< 1 hour)

No sitemap is generated. With 8 static routes, a hand-authored `public/sitemap.xml` or a `app/sitemap.ts` would materially improve SEO indexing speed and completeness.

**Impact when fixed:** Search engines discover and index all pages faster.

**Fix:** Add `app/sitemap.ts` using Next.js metadata API to generate a sitemap for all 8 known routes (`/`, `/platforms`, `/agents`, `/orchestration`, `/governance`, `/assistants`, `/updates`, `/about`).

---

### H-7: No JSON-LD structured data for tools
**File:** not present  
**Effort:** Medium (1–4 hours)

The build guide specifies `SoftwareApplication` JSON-LD for each tool. No structured data exists anywhere in the site. At a minimum, category pages could include `ItemList` + `SoftwareApplication` JSON-LD, which improves visibility in AI-powered search results and rich snippets.

**Impact when fixed:** Potential rich snippets in Google, Bing, and AI-powered search results; improved discoverability.

**Fix:** Add a `JsonLd` utility component that emits a `<script type="application/ld+json">` block. Use `SoftwareApplication` type per schema.org for individual tool entries.

---

### H-8: `github-copilot` incorrectly tagged `clouds: ["azure"]`
**File:** `data/tools.json:854`  
**Effort:** Small (< 1 hour)

GitHub Copilot is an IDE plugin that works in VS Code, JetBrains, Vim, and others, across any cloud or local environment. Tagging it as `clouds: ["azure"]` causes it to disappear from results when filtering by AWS or GCP cloud, and renders the Azure badge on the card — both incorrect. It is a vendor/Microsoft product but not cloud-specific.

**Impact when fixed:** GitHub Copilot correctly appears in all cloud filter views; no misleading Azure badge.

**Fix:** Remove `clouds` from the `github-copilot` entry. The card will correctly show only the `vendor` badge.

---

### H-9: "Current build focus" warning on homepage exposes in-progress status
**File:** `app/page.tsx:120–122`  
**Effort:** Small (< 1 hour)

A `WarningBox` with `variant="info"` on the homepage reads: *"The new Platforms layer is now wired into navigation, homepage context, and category entry points. Full dataset expansion remains in progress."* This is an internal status note left from development. Site visitors see it as an "under construction" signal, which undercuts credibility.

**Impact when fixed:** Homepage presents as a complete, production-quality resource rather than a work-in-progress.

**Fix:** Remove or replace with a genuine user-facing note (e.g. contribution CTA or data freshness note).

---

### H-10: No `app/not-found.tsx` — 404 pages use Next.js default
**File:** not present  
**Effort:** Small (< 1 hour)

The app has no custom 404 page. Next.js will use its default error UI, which breaks the site's visual style and navigation. Combined with the missing `staticwebapp.config.json` (C-1), users who hit a non-existent route see no on-brand fallback.

**Impact when fixed:** 404 errors present on-brand with working navigation, reducing user drop-off.

**Fix:** Add `app/not-found.tsx` that renders inside `HomeShell` with a friendly "Page not found" message and links back to the homepage.

---

## MEDIUM — Noticeable but Not Blocking

### M-1: `/about` page is thin — missing methodology and contribution details
**File:** `app/about/page.tsx`  
**Effort:** Medium (1–4 hours)

The build guide specifies an `/about` page covering "Project background, contribution rules, and sourcing standards." The current page has three bullet points under "Project goals" and a single sentence under "Contribute." It is missing: tool inclusion criteria, data sourcing process, update frequency, how to report errors, how to propose new tools, and license/attribution details.

**Impact when fixed:** Establishes trust and surfaces contribution path for community use.

---

### M-2: Updates page description exposes implementation path
**File:** `app/updates/page.tsx:19`  

The page subtitle reads: *"Changelog-style feed sourced from `\`/data/updates.json\``."* This is an internal implementation detail irrelevant to end users.

**Fix:** Replace with: *"Changelog-style feed of releases, acquisitions, and notable changes in enterprise AI tooling."*

---

### M-3: Updates page has no category filter
**File:** `app/updates/page.tsx`  
**Effort:** Medium (1–4 hours)

With 15 update entries currently and expected growth, the updates feed has no way to filter by category (agents, orchestration, governance, assistants, platforms) or by tool. All entries are shown as a flat list in reverse chronological order.

**Impact when fixed:** Users monitoring a specific category can filter to just those updates.

---

### M-4: `docsUrl` for `lakera-guard` and `arthur-genai-engine` point to homepage
**File:** `data/tools.json:803, 827`  

Both tools have `docsUrl` set to their homepage URL (`https://lakera.ai/`, `https://www.arthur.ai/`), which also matches their `websiteUrl`. The "Docs" link on the tool card goes to the marketing homepage, not documentation.

**Fix:** Locate and verify actual documentation URLs for both tools, or remove `docsUrl` and leave `websiteUrl` so the card shows a "Website" link instead.

---

### M-5: `amazon-q-apps.websiteUrl` is a docs URL
**File:** `data/tools.json:1116`  

`amazon-q-apps.websiteUrl` is `https://docs.aws.amazon.com/amazonq/latest/qbusiness-ug/` — a documentation URL, identical to `docsUrl`. There is no distinct product marketing page for Q Apps (it's a feature within Q Business), but the `websiteUrl` should either be the Q Business product page or removed.

---

### M-6: Archived tool `rebuff` not visually distinguished from active tools
**File:** `data/tools.json:779–788`, `components/tool-card.tsx`  

`rebuff` has `status: "archived"` with a note that it was archived in May 2025, but the tool card renders identically to active tools. Visitors cannot immediately see that it is archived. The `statusNote` appears only in the "Important notes" section, not on the card itself.

**Impact when fixed:** Users evaluating tools are clearly warned that archived tools should not be adopted.

**Fix:** Add a visual archived/maintenance badge to `ToolCard` when `tool.status !== "active"`. A muted red or grey "Archived" / "Maintenance" badge next to the type badge is sufficient.

---

### M-7: Category pages filter bar does not persist state across navigation
**File:** `components/filtered-category-sections.tsx`, `lib/category-filters.ts`  
**Effort:** Medium (1–4 hours — relates to H-4)

Filter state (type, cloud, license, sort) is held in `useState` and resets every time the user navigates away and returns. Users who set "Open Source" + sort by stars cannot bookmark or share that view.

This is the flip side of H-4. Until `CategoryFilterBar` (URL params) is wired in, filters are ephemeral.

---

### M-8: Missing `.env.example` file
**File:** not present  
**Effort:** Small (< 1 hour)

`lib/metadata.ts` requires `NEXT_PUBLIC_SITE_URL` and `next.config.ts` requires `NEXT_PUBLIC_BASE_PATH`. Neither is documented anywhere outside the source code. Contributors or CI operators have no reference for what environment variables are needed.

**Fix:** Add `.env.example` with commented entries for both variables.

---

### M-9: Apple touch icon uses SVG — not well supported on iOS
**File:** `app/layout.tsx:80–82`  

`icons.apple` is set to `[{ url: "/icon.svg" }]`. iOS Safari does not support SVG apple-touch-icons; it requires PNG at 180×180 px. On iOS, the saved-to-home-screen icon will be blank or a generic default.

**Fix:** Export `icon.svg` as `public/apple-touch-icon.png` at 180×180 px and reference it in the metadata.

---

## LOW — Polish

### L-1: `serve_enterpriseai.py` in project root
**File:** `serve_enterpriseai.py`  

A Python development server script lives at the project root. It should be `.gitignore`d or moved to a `scripts/` folder to avoid confusion with project configuration files.

---

### L-2: Default Next.js placeholder SVGs in `/public/`
**Files:** `public/file.svg`, `public/globe.svg`, `public/window.svg`, `public/next.svg`, `public/vercel.svg`  

These are Next.js project scaffold leftovers with no use in this project. They add noise and could confuse anyone auditing assets.

**Fix:** Delete all five files.

---

### L-3: `data-theme="dark"` hardcoded in Header SSR output
**File:** `components/header.tsx:88`  

The theme toggle `<button>` is rendered with `data-theme="dark"` in SSR. The inline `themeScript` immediately corrects this on load, but for users with a stored "light" preference, the icon briefly shows the wrong state (Sun when Moon should show). The flash is subtle but visible on slow connections.

**Impact:** Minor visual glitch; only noticeable on slow page loads or CPU-throttled devices.

---

### L-4: `contain-intrinsic-size` values are hardcoded guesses
**File:** `components/category-page.tsx:59, 84, 95, 108`, `components/tool-card.tsx:35`  

`content-visibility: auto` is a good optimisation, but the paired `contain-intrinsic-size` values (e.g. `960px`, `1200px`, `360px`) are hardcoded estimates. If actual rendered heights differ significantly, this can cause layout shift or scroll position jumps when sections enter the viewport.

**Impact:** May cause minor layout shift or incorrect scroll position on long category pages.

---

### L-5: No pagination or virtual scroll for category tool grids
**File:** `components/filtered-category-sections.tsx`, `components/category-page.tsx`  

All tools in a category are rendered as cards simultaneously. At current data volume (9–12 per category) this is fine. At 30+ tools per category this will produce noticeable performance degradation. `content-visibility: auto` mitigates rendering cost but not DOM size.

**Impact:** Low risk now; worth addressing before dataset expansion.

---

### L-6: `PlatformCategoryBar` shows only `assistantsBuildYourOwn` label for Assistants
**File:** `components/platform-category-bar.tsx:4–9`  

For the Assistants page, `getLabel()` always returns `platform.categoryMapping.assistantsBuildYourOwn.label`. This means the "Runs on:" bar shows e.g. "Microsoft Foundry (Copilot Studio)" only, ignoring the Coding and Productivity assistant mappings. The bar is non-representative of the full Assistants coverage.

**Fix:** Show all three assistant mappings for each platform when `category === "assistants"`, or show a generic label like "See all assistants."

---

### L-7: Source links missing from Recent updates sections on category pages
**File:** `components/category-page.tsx:111–116`, `components/filtered-category-sections.tsx:77–84`  

The Recent updates sections on category pages show date, tool name, and summary — but unlike the Updates page, they omit the `sourceUrl` link. Users seeing a significant update on an agent category page have no way to click through to the source.

**Fix:** Add a "Source" link in the update items on category pages, identical to the Updates page treatment.

---

### L-8: `assistants-page.tsx` missing vendor comparison tables per subcategory
**File:** `components/assistants-page.tsx:68–76`  

The current SSR assistants page (the one actually wired to the route) renders tool cards per subcategory but never renders `VendorComparisonTable`. The comparison data exists in `lib/assistants-comparisons.ts`. This is a related consequence of H-2 — the client version had the tables, the server version doesn't.

This would be resolved automatically if H-2 is fixed (switching to `AssistantsPageClient`).

---

## Section 2: Data Integrity

### Schema Compliance
All 41 tools comply with required fields (`id`, `name`, `category`, `type`, `description`, `strengths`, `license`, `docsUrl`, `status`). No required fields are missing.

**Optional field gaps (non-blocking but worth noting):**

| Field | Gap |
|---|---|
| `lastRelease` | Missing for all 41 tools — see H-1 |
| `version` | Missing for `lakera-guard` (no public versioning), `arthur-genai-engine` (proprietary) — acceptable |
| `clouds` | `github-copilot` has incorrect value — see H-8 |
| `websiteUrl` | `amazon-q-apps.websiteUrl` is a docs URL — see M-5 |

### URL Integrity
The following URLs should be verified before launch:

| Tool | Field | Issue |
|---|---|---|
| `lakera-guard` | `docsUrl` | Points to homepage, not docs — see M-4 |
| `arthur-genai-engine` | `docsUrl` | Points to homepage, not docs — see M-4 |
| `amazon-q-apps` | `websiteUrl` | Is a docs URL, not a product site — see M-5 |
| `google-agent-builder-adk` | `docsUrl` | `docs.cloud.google.com/agent-builder/overview` — verify this is the current canonical URL |
| `nemo-guardrails` | `githubUrl` | `github.com/NVIDIA-NeMo/Guardrails` — repo moved from `NVIDIA/NeMo-Guardrails`; verify redirect still works |

### Data Fabrication / Unverified Data
No obviously fabricated data found. GitHub star counts, versions, and pricing figures are plausible and internally consistent.

One caution: the comparison table row for `google-agent-builder-adk` in `lib/category-comparisons.ts:43` reads `"ADK open-sourced + Gemini 3.1 platform push"` — confirm this is an accurate characterisation and that Gemini 3.1 naming is current.

### Missing Tools
Cross-referencing the 41 tracked tools against the build guide's specified scope, no obvious tools are absent. The guide's named tools are all present.

### Updates Integrity
All 15 update entries have `sourceUrl`, `date`, `toolId`, `toolName`, `category`, `type`, and `summary`. Entries are ordered newest-first per schema rules. No filler entries detected — all summaries describe specific verifiable events.

One note: the `langflow` update (2026-04-07) refers to "the DataStax-to-IBM deal" but the acquisition update entry (2025-02-25) describes the IBM/DataStax acquisition. These are consistent. The April 2026 entry describes a release, not the deal — the parenthetical reference is slightly confusing but not wrong.

---

## Section 3: UX and Accessibility

### Keyboard Navigation
- **Skip link:** Implemented correctly (`app/layout.tsx:103`). Skip link is visually hidden until focused and targets `#main-content`.
- **Focus states:** `globals.css:67–70` applies a visible `3px solid var(--color-primary)` outline on all interactive elements via `:focus-visible`. This is solid.
- **Mobile menu:** Uses `<details>/<summary>` pattern. This lacks `role="menu"` / `role="menuitem"` semantics. Not ideal but functional.
- **Assistants tabs:** Current SSR page has anchor links, not buttons with `role="tab"`. No `role="tablist"` / `role="tabpanel"` pattern. If H-2 is fixed via `AssistantsPageClient`, the client version uses buttons with `onClick` — better, but still needs `role="tab"`, `aria-selected`, and `role="tabpanel"` for full WCAG 2.1 compliance.
- **Filter bar:** Properly uses `fieldset`/`legend` for the type and cloud filter groups. License and sort use `<select>` with associated `<label>`. This is well-implemented.

### WCAG AA Contrast
- Dark mode: `--color-text-secondary` (`#cbd5e1`) on `--color-bg-card` (`#1e293b`) — contrast ratio ≈ 7.4:1. Passes AA.
- Dark mode: `--color-text-secondary` (`#cbd5e1`) on `--color-bg-surface` (`#111827`) — contrast ratio ≈ 9.1:1. Passes AA.
- Light mode: `--color-text-secondary` (`#64748b`) on `--color-bg-card` (`#ffffff`) — contrast ratio ≈ 4.6:1. Passes AA for normal text.
- Overall: colour palette appears WCAG AA compliant in both modes for readable text. No obvious failures.

### Screen Reader
- `LogoBadge` has `alt` text (`${name} logo`) on images. Fallback avatar has `aria-label`.
- `VendorComparisonTable` has a `<caption className="sr-only">` — good.
- `PlatformCategoryBar` is wrapped in `<nav aria-label="Platform coverage">`.
- `Header` nav has `aria-label="Primary"` and `aria-current="page"` on active items.

### Mobile Responsiveness
The grid layouts (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`) respond correctly. The header collapses to a `<details>` hamburger at `md` breakpoint. No obvious breakage at standard mobile sizes.

---

## Section 4: Performance

### Bundle Size
Next.js `output: "export"` produces fully static HTML — no server-side JavaScript bundle served to the browser for page navigation. The only client JavaScript is for React hydration of client components (`FilterBar`, `ThemeToggle` via inline script, `AssistantsPageClient`). This is good.

### Image Optimization
All logos are SVG — appropriate for logo assets. SVGs are served directly from `/public/logos/`. `LogoBadge` uses `loading="lazy" decoding="async"` on all logo `<img>` tags — correct.

### Font Loading
See C-3. Fonts are not loaded. This is also a performance concern: until fixed, browsers will use system fonts (avoiding FOIT/FOUT), but when fixed, `next/font` should use `display: swap` to avoid layout shift.

### Static Generation
`next.config.ts:5` — `output: "export"` is set correctly for static export to Azure. `trailingSlash: true` is required for Azure Static Web Apps and is set.

### `content-visibility: auto`
Applied to several sections with `contain-intrinsic-size`. This is a good perf optimization for long pages. See L-4 for the risk of hardcoded intrinsic sizes.

---

## Section 5: Code Quality

### TypeScript Strictness
`tsconfig.json:7` — `"strict": true` is enabled. Good.

### Dead Code
Three unused components exist (see H-3, H-4). No other dead code identified at a surface audit level.

### Duplicate Logic
The "Recent updates" rendering pattern appears in:
- `components/category-page.tsx:107–121`
- `components/filtered-category-sections.tsx:75–88`
- `components/assistants-page.tsx:113–126`
- `components/assistants-page-client.tsx:128–141` (dead)
- `components/category-page-client.tsx:136–149` (dead)

This is a candidate for extraction into a shared `RecentUpdates` component.

### Component Naming Consistency
`AssistantsPage` (server) and `AssistantsPageClient` (unused client) have confusing names since `AssistantsPage` is not a server component — it's a regular function component in `components/assistants-page.tsx` that is importable in the server-rendered page. The naming is fine functionally but the dead `Client` version adds ambiguity.

### Hardcoded GitHub Repo URL
`lib/site.ts:20` — `githubRepoUrl` is hardcoded to `'https://github.com/tiberiuarva/enterpriseaitools'`. If the repo is transferred to an org, this will break. Not urgent but worth noting.

---

## Section 6: SEO and Social

| Check | Status |
|---|---|
| `<title>` tags with template | ✅ Present in `app/layout.tsx:35–38` |
| Meta description | ✅ Present per page via `buildMetadata` |
| Open Graph type/siteName/locale | ✅ Present |
| Twitter Card type | ✅ `summary_large_image` |
| OG image | ❌ SVG format — will not render on social platforms (C-2) |
| Canonical URLs | ✅ Per-page canonical set via `buildMetadata` |
| Favicon (SVG) | ✅ `icon.svg` — modern browsers support SVG favicons |
| Apple touch icon | ⚠️ SVG not supported on iOS (M-9) |
| `robots.txt` | ❌ Missing (H-5) |
| `sitemap.xml` | ❌ Missing (H-6) |
| JSON-LD structured data | ❌ Missing (H-7) |
| `metadataBase` | ✅ Set from `NEXT_PUBLIC_SITE_URL` with fallback |

---

## Section 7: Deployment Readiness

| Check | Status |
|---|---|
| `output: "export"` configured | ✅ `next.config.ts:5` |
| `trailingSlash: true` | ✅ Required for Azure Static Web Apps |
| `basePath` from env var | ✅ Configurable via `NEXT_PUBLIC_BASE_PATH` |
| GitHub Actions workflow | ✅ `.github/workflows/azure-static-web-apps.yml` |
| CI branches target correct branch | ❌ Targets `main` not `radar/review-ready-site-pass` (C-4) |
| `staticwebapp.config.json` | ❌ Missing — deep links will 404 on Azure (C-1) |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` secret | ⚠️ Required in GitHub repository secrets; not verifiable from source |
| `.env.example` | ❌ Missing (M-8) |
| Custom domain readiness | ⚠️ `metadataBase` defaults to `https://enterpriseai.tools` — will need `NEXT_PUBLIC_SITE_URL` set in deployment |
| `serve_enterpriseai.py` in root | ⚠️ Development artifact — should not be in production deploy (L-1) |

---

## Appendix: File Reference Index

| Finding | Files Affected |
|---|---|
| C-1 | `staticwebapp.config.json` (new), `next.config.ts` |
| C-2 | `app/layout.tsx`, `lib/metadata.ts`, `public/social-preview.svg` |
| C-3 | `app/globals.css`, `tailwind.config.ts`, `app/layout.tsx` |
| C-4 | `.github/workflows/azure-static-web-apps.yml` |
| H-1 | `data/tools.json` (all 41 tools), `components/tool-card.tsx` |
| H-2 | `components/assistants-page.tsx`, `app/assistants/page.tsx` |
| H-3 | `components/assistants-page-client.tsx`, `components/category-page-client.tsx`, `components/theme-toggle.tsx` |
| H-4 | `components/category-filter-bar.tsx`, `lib/category-filters.ts` |
| H-5 | `public/robots.txt` (new) |
| H-6 | `app/sitemap.ts` (new) |
| H-7 | New `JsonLd` component + category/tool pages |
| H-8 | `data/tools.json:854` |
| H-9 | `app/page.tsx:120–122` |
| H-10 | `app/not-found.tsx` (new) |
| M-1 | `app/about/page.tsx` |
| M-2 | `app/updates/page.tsx:19` |
| M-3 | `app/updates/page.tsx` |
| M-4 | `data/tools.json:803, 827` |
| M-5 | `data/tools.json:1116` |
| M-6 | `components/tool-card.tsx` |
| M-7 | `components/filtered-category-sections.tsx`, `lib/category-filters.ts` |
| M-8 | `.env.example` (new) |
| M-9 | `app/layout.tsx:80–82` |
| L-1 | `serve_enterpriseai.py` |
| L-2 | `public/file.svg`, `public/globe.svg`, `public/window.svg`, `public/next.svg`, `public/vercel.svg` |
| L-3 | `components/header.tsx:88` |
| L-4 | `components/category-page.tsx:59,84,95,108`, `components/tool-card.tsx:35` |
| L-5 | `components/filtered-category-sections.tsx` |
| L-6 | `components/platform-category-bar.tsx:4–9` |
| L-7 | `components/category-page.tsx:107–116`, `components/filtered-category-sections.tsx:77–84` |
| L-8 | `components/assistants-page.tsx:68–76` |
