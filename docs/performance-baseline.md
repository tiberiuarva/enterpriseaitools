# Performance baseline

Captured for M12 to anchor future per-route JS-size and image-handling reviews.
Re-run `npm run build` and update the numbers below whenever a milestone
materially changes the bundle or page count.

## Build harness

- Next.js 16.2.4 (App Router, Turbopack)
- React 19.2.4
- `output: "export"` (fully static export to `out/`)
- `images.unoptimized: true` (required by static export)
- No third-party fonts and no client-side third-party fetches. The only
  third-party script is the consent-gated GA4 tag, which loads nothing until a
  visitor opts in — so the default page weight is unchanged

## Snapshot — captured during M12 work

| Metric | Value | Notes |
|---|---:|---|
| Static routes generated | 70 | `/`, 8 hub routes (`/platforms`, `/agents`, `/orchestration`, `/governance`, `/assistants`, `/updates`, `/evaluate`, `/about`), 48 `/tools/<id>` pages, the `/tools/compare` index + 8 `/tools/compare/<slug>` comparison pages, `_not-found`, `icon.svg`. |
| Total `out/` size | 24 MB | Includes HTML, JS chunks, logos, generated SEO artifacts. |
| `out/_next/static/` size | 1.2 MB | All shared and per-route JS, CSS, fonts assets. |
| Total HTML bytes | ~7.4 MB | Across all 69 HTML files. |
| Largest single JS chunk | 222 KB (uncompressed) | One vendor chunk; the next two sit at 133 KB and 110 KB. Remaining chunks are under 60 KB each. |
| Largest HTML route | `/evaluate/` at 228 KB | Carries the full guided-flow client component inlined. |
| Mid-tier HTML routes | `/agents/`, `/orchestration/`, `/updates/` at 180–220 KB | Filter bar + tool grid + JSON-LD. |
| Smallest tool-page HTML | `/tools/<id>/` between 30–60 KB | Driven by a single tool record with no large client component. |

## M13 — vendor stack overviews (2026-11-26)

`/stacks/anthropic/` is now the largest HTML route: 1.70 MB uncompressed and
180 KB gzipped (after the visual redesign: isometric stack, model map, channel
tree, timeline river). For comparison, `/stacks/microsoft/` is 250 KB and `/` is 307 KB.

**Why it is large.** The page renders the full source-backed catalog
server-side so that every offering is crawlable and deep-linkable:

- 168 offerings, 34 models, 70 timeline events and their citations.
- The React flight payload repeats that tree.

**What keeps it fast.**

- Families, the full event history and the source list start collapsed in
  `<details>`.
- Diagrams are server-rendered SVG and CSS (no chart library); hover, the
  audience lens and the counting stats use `:has()`, radios and `@property`,
  so they add no JavaScript. Motion is transform/opacity only and stops under
  `prefers-reduced-motion`.
- Catalog cards use short `.vo-entry*` classes from `globals.css` instead of
  long utility strings repeated 168 times.
- Filters are thin client islands that toggle `hidden` on server-rendered
  nodes, so entry data never ships as props.
- First-load JS grows only by those islands.

Lighthouse, run locally against `out/` served with gzip:

| Route | Mobile | Desktop | Mobile LCP |
|---|---:|---:|---:|
| `/stacks/anthropic/` | 0.96 | 1.00 | 2.62 s |
| `/stacks/microsoft/` | 0.98 | 1.00 | 2.46 s |
| `/` | 0.98 | 1.00 | 2.37 s |

The same day, production scored `/` at 0.99 / 1.00 and `/stacks/microsoft/` at
0.98 / 1.00, so the local numbers track production.

If a second vendor overview pushes past the mobile 0.8 budget, split the
ecosystem families onto `/stacks/<vendor>/<family>/` sub-routes rather than
trimming sourced content.

## Targets

- **Per-route JS:** new milestones must not grow any route's first-load JS by
  more than 20 KB uncompressed without a recorded reason in this file.
- **No runtime fonts:** all fonts are bundled or system-fallback only.
- **No third-party runtime fetches:** all third-party data is fetched at build
  time via `scripts/` and inlined into `data/*.json`.
- **Images:** every logo and platform mark uses an explicit `width` / `height`
  in JSX and `loading="lazy"` outside the first viewport. `images.unoptimized`
  is set because the static export host (Azure SWA) does not run the Next.js
  image optimizer.

## Known follow-ups

- Lighthouse runs against the deployed site are exercised via
  `npm run check-live-performance -- <url>` and
  `npm run smoke-test-live-site -- root https://www.enterpriseai.tools` — record
  the LCP and CLS numbers under `docs/research/` on a quarterly cadence rather
  than on every PR.
- The `evaluate` and `assistants` routes carry the bulk of the client-side JS;
  any further size growth should be coordinated against this baseline.
