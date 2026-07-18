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

Milestone numbers are stable (they name files and branches); the **Order** column is the
execution sequence, revised by the 2026-07-17 roadmap audit (rationale below).

| Order | Status | Milestone | Horizon | File |
|---|---|---|---|---|
| 1 | [x] | 1 — Site-consistency immediate fixes | 0 — Foundation | [`1-immediate-fixes.md`](./1-immediate-fixes.md) |
| 2 | [~] | 7 — EU AI Act and compliance obligation mapping | 2 — Decision-grade depth | [`7-eu-ai-act-mapping.md`](./7-eu-ai-act-mapping.md) |
| 3 | [~] | 4 — Published methodology, inclusion criteria, impartiality | 1 — Trust surface & infrastructure | [`4-trust-and-methodology.md`](./4-trust-and-methodology.md) |
| 4 | [~] | 2 — Open data, feeds, and embeddable badges | 1 — Trust surface & infrastructure | [`2-open-data-and-feeds.md`](./2-open-data-and-feeds.md) |
| 5 | [~] | 5 — License lifecycle tracking and change alerts | 2 — Decision-grade depth | [`5-license-lifecycle-tracking.md`](./5-license-lifecycle-tracking.md) |
| 6 | [~] | 10 — Provenance-preserving contribution pipeline | 3 — Coverage & reach | [`10-community-contribution.md`](./10-community-contribution.md) |
| 7 | [ ] | 6 — The Enterprise AI Radar (maturity verdicts) | 2 — Decision-grade depth | [`6-enterprise-ai-radar.md`](./6-enterprise-ai-radar.md) |
| 8 | [ ] | 8 — An objective, reproducible readiness score | 2 — Decision-grade depth | [`8-objective-scoring.md`](./8-objective-scoring.md) |
| 9 | [ ] | 3 — Shareable discovery and a comparison builder | 1 — Trust surface & infrastructure | [`3-discovery-and-comparison.md`](./3-discovery-and-comparison.md) |
| 10 | [ ] | 9 — Category expansion: agent control planes & MCP provenance | 3 — Coverage & reach | [`9-category-expansion.md`](./9-category-expansion.md) |
| 11 | [ ] | 11 — Distribution, authority, and the flagship report | 3 — Coverage & reach | [`11-distribution-and-authority.md`](./11-distribution-and-authority.md) |

## Why this order (audit, 2026-07-17)

- **Milestone 7 jumps the queue.** Commission enforcement powers over GPAI activate
  **2026-08-02**, and the Digital Omnibus timeline is in active flux. Compliance officers
  will be searching for "what applies to me, when" in exactly this window; no directory
  answers it. Shipping the obligation map, the "where the law stands" summary, and the
  ICS deadline calendar *before* that date is the highest-leverage news moment on the
  roadmap and may not recur.
- **Milestone 4 runs immediately after (in practice, in parallel).** It has zero technical
  dependencies, is the cheapest milestone in the catalogue, and every later feature links
  back to its methodology/impartiality pages.
- **Milestone 10 moves ahead of 9.** endoflife.date scaled to ~459 products *because*
  500+ contributors could submit CI-validated PRs — contribution capacity precedes
  coverage expansion, not the other way round. A single maintainer expanding into MCP
  provenance while keeping 48 governance postures fresh does not scale.
- **Milestone 3 moves later.** The comparison builder is valuable but lower-leverage than
  the trust surface and the differentiated data layers (5-8) it will eventually display.

## Standing operational priority (above every unstarted milestone)

**Automate the weekly Radar cadence.** The 2026-07-17 audit found one snapshot ever taken
(`data/snapshots/2026-06-07.json`), zero derived diff events, and all 48 governance
`reviewedAt` stamps batch-dated 2026-05-26 (~7 weeks stale). "Freshness as a feature" is
the pillar most at risk, and it is failing operationally, not in code.

*Status: shipped (in review with this branch).* `.github/workflows/weekly-radar.yml` runs
`snapshot-weekly` + `diff-snapshots` + `check-data-freshness` every Monday and opens the
content PR automatically; the 2026-07-17 snapshot restarted the time series. Remaining
manual half: the editorial `/radar` review inside that PR, and rotating the stale
governance `reviewedAt` stamps — still a required weekly task.

## Daily value = daily presence, not daily visits

Reference infrastructure is not a daily-visit product; it wins by being embedded in other
people's daily surfaces. The roadmap's daily-value mechanisms, in order of cadence:
the change feed as a subscribable digest (milestone 11 — once snapshots are automated, a
*daily* mechanical diff digest in the Changelog Nightly model is cheap and is the only
honest daily-cadence artifact this platform can sustain), shields badges in vendor READMEs
(2), the ICS deadline calendar in a compliance officer's calendar client (7), the JSON
dataset consumed by procurement tooling and agents (2), and answer-engine citation (11).
Measure feed subscribers, external embeds, and citations — never DAU.

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
