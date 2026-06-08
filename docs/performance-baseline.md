# Performance baseline

Captured for M12 to anchor future per-route JS-size and image-handling reviews.
Re-run `npm run build` and update the numbers below whenever a milestone
materially changes the bundle or page count.

## Build harness

- Next.js 16.2.4 (App Router, Turbopack)
- React 19.2.4
- `output: "export"` (fully static export to `out/`)
- `images.unoptimized: true` (required by static export)
- No runtime analytics, no third-party fonts, no client-side third-party fetches

## Snapshot — captured during M12 work

| Metric | Value | Notes |
|---|---:|---|
| Static routes generated | 61 | `/`, 8 hub routes (`/platforms`, `/agents`, `/orchestration`, `/governance`, `/assistants`, `/updates`, `/evaluate`, `/about`), 48 `/tools/<id>` pages, `_not-found`, `icon.svg`. |
| Total `out/` size | 24 MB | Includes HTML, JS chunks, logos, generated SEO artifacts. |
| `out/_next/static/` size | 1.2 MB | All shared and per-route JS, CSS, fonts assets. |
| Total HTML bytes | ~7.4 MB | Across all 60 HTML files. |
| Largest single JS chunk | 222 KB (uncompressed) | One vendor chunk; the next two sit at 133 KB and 110 KB. Remaining chunks are under 60 KB each. |
| Largest HTML route | `/evaluate/` at 228 KB | Carries the full guided-flow client component inlined. |
| Mid-tier HTML routes | `/agents/`, `/orchestration/`, `/updates/` at 180–220 KB | Filter bar + tool grid + JSON-LD. |
| Smallest tool-page HTML | `/tools/<id>/` between 30–60 KB | Driven by a single tool record with no large client component. |

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
