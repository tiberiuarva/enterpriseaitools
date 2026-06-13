# Roadmap — milestone catalogue

Staged build plan, one milestone per file. `/build` selects the **first
incomplete** (`[ ]`) milestone below, branches off `main` as
`milestone/<N>-<slug>`, executes it end-to-end, and opens a PR. A milestone
flips to done only when its PR merges.

**Direction & end goal:** see [`VISION.md`](./VISION.md) — the North Star, the five
strategic pillars, and the non-negotiable guardrails every milestone serves. In one line:
*be the definitive, source-backed, no-pay-to-play reference for enterprise AI tooling
decisions — the one professionals trust and AI answer engines cite.*

The completed foundation (M0-M12: accuracy, information architecture, governance-posture
comparison, the guided evaluation flow, the change feed, and SEO/AEO groundwork) is
recorded in the root [`MILESTONES.md`](../MILESTONES.md). The milestones below build the
next three horizons on top of that base.

## Catalogue

| Status | Milestone | Horizon | File |
|---|---|---|---|
| [~] | 1 — Site-consistency immediate fixes | 0 — Foundation | [`1-immediate-fixes.md`](./1-immediate-fixes.md) |
| [ ] | 2 — Open data, feeds, and embeddable badges | 1 — Trust surface & infrastructure | [`2-open-data-and-feeds.md`](./2-open-data-and-feeds.md) |
| [ ] | 3 — Shareable discovery and a comparison builder | 1 — Trust surface & infrastructure | [`3-discovery-and-comparison.md`](./3-discovery-and-comparison.md) |
| [ ] | 4 — Published methodology, inclusion criteria, impartiality | 1 — Trust surface & infrastructure | [`4-trust-and-methodology.md`](./4-trust-and-methodology.md) |
| [ ] | 5 — License lifecycle tracking and change alerts | 2 — Decision-grade depth | [`5-license-lifecycle-tracking.md`](./5-license-lifecycle-tracking.md) |
| [ ] | 6 — The Enterprise AI Radar (maturity verdicts) | 2 — Decision-grade depth | [`6-enterprise-ai-radar.md`](./6-enterprise-ai-radar.md) |
| [ ] | 7 — EU AI Act and compliance obligation mapping | 2 — Decision-grade depth | [`7-eu-ai-act-mapping.md`](./7-eu-ai-act-mapping.md) |
| [ ] | 8 — An objective, reproducible readiness score | 2 — Decision-grade depth | [`8-objective-scoring.md`](./8-objective-scoring.md) |
| [ ] | 9 — Category expansion: agent control planes & MCP provenance | 3 — Coverage & reach | [`9-category-expansion.md`](./9-category-expansion.md) |
| [ ] | 10 — Provenance-preserving contribution pipeline | 3 — Coverage & reach | [`10-community-contribution.md`](./10-community-contribution.md) |
| [ ] | 11 — Distribution, authority, and the flagship report | 3 — Coverage & reach | [`11-distribution-and-authority.md`](./11-distribution-and-authority.md) |

## Horizons at a glance

- **Horizon 1 — Trust surface & infrastructure (2-4).** Make the data we already have
  embeddable, shareable, and demonstrably impartial. Highest leverage, lowest cost:
  mostly build-time artifacts that turn the site into infrastructure others cite.
- **Horizon 2 — Decision-grade depth (5-8).** The features no competitor has —
  license-lifecycle tracking, an opinionated maturity radar, EU AI Act obligation mapping,
  and an objective reproducible score. This is where "directory" becomes "decision tool."
- **Horizon 3 — Coverage & reach (9-11).** Expand into the new agent/MCP control-plane
  categories, open a provenance-preserving contribution pipeline, and build durable,
  zero-tracking distribution.

Sequencing is a recommendation, not a constraint: within a horizon, milestones are largely
independent and several can run in parallel. Horizon 1 should land first because later
milestones consume its dataset/API and methodology surfaces.

## Legend

- `[ ]` open — not yet started
- `[~]` in review — PR open, awaiting merge
- `[x]` done — PR merged
