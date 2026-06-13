# Milestone 3 — Shareable discovery and a comparison builder

**Status:** [ ] planned
**Horizon:** 1 — Trust surface & infrastructure
**Pillars:** Decision-grade UX (4); Become infrastructure (3)
**Branch when built:** `milestone/3-discovery-and-comparison`

## Goal

Make discovery shareable and let a user compare *any* tools they choose, not just the
curated pairings. The comparison moment is where buying intent concentrates; today our
filters reset on navigation and comparisons exist only as pre-built static routes. This
milestone closes both gaps while staying fully static.

## Why now

- **The comparison moment is the high-intent moment.** G2's programmatically generated
  "X vs Y" pages are the backbone of its ~4.2M/mo organic traffic; AlternativeTo's whole
  model is "I want to replace X." We have the data discipline none of them have — we
  should make comparison a first-class, shareable surface.
- **Known product gaps from the audit:** filter state is ephemeral (a URL-param filter
  variant already exists in the code but is dead/unwired), and there is no UI to pick 2-3
  tools dynamically — only the 11 curated comparison routes.
- **Buyers filter on governance dimensions** (deployment model, license risk, data
  residency, certs). Those facets already exist (M2 of the shipped plan) — they just need
  to be bookmarkable and linkable so a shortlist can be shared into a procurement thread.

## In scope

- **Bookmarkable filters.** Wire the existing URL-param filter variant to the category
  routes so filter/sort state lives in the querystring and survives navigation and
  sharing. Keep it static-export safe (client reads `searchParams`; no server logic).
- **Dynamic comparison builder.** A client-side "compare these" flow: select 2-3 tools
  from any category and render the same governance-posture matrix the curated comparison
  pages use, with a shareable URL encoding the selection. Curated pairings remain as
  SEO-friendly static routes; the builder complements them.
- **"Replace X / alternatives to X"** entry points on per-tool pages, linking into the
  builder pre-seeded with that tool and its closest peers (peers derived in `lib/` so the
  logic is unit-tested).
- **Surface freshness consistently** on cards and comparison views (dated "verified"
  chip), reinforcing Pillar 2.

## Out of scope

- Server-side comparison generation or any persistence of user selections.
- Reviews, ratings, or user accounts (gameable, against the trust model).
- Net-new governance dimensions (that is the radar/scoring milestones, 6 and 8).

## Acceptance

- Filter and sort state is encoded in the URL on every category hub and restores on load;
  a shared link reproduces the exact filtered view.
- A user can select 2-3 arbitrary tools and get a side-by-side governance comparison at a
  shareable URL, fully static.
- Per-tool pages link to a pre-seeded comparison/alternatives view.
- The dead/duplicated filter components identified in the audit are removed or unified;
  `npx tsc --noEmit`, `npm run lint`, and `npm run build` stay green and the build still
  emits static `out/`.

## Depends on / feeds

Depends on the existing governance-posture data and curated comparison infrastructure.
Pairs naturally with the maturity radar (6) and scoring (8), which add new comparison
columns.
