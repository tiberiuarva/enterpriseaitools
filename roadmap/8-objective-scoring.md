# Milestone 8 — An objective, reproducible readiness score

**Status:** [ ] planned
**Horizon:** 2 — Decision-grade depth
**Pillars:** Trust through provenance (1); Decision-grade UX (4)
**Branch when built:** `milestone/8-objective-scoring`

## Goal

Give each tool a small, transparent, **reproducible** readiness score built only from
independently verifiable signals — the mechanical complement to the human radar verdict.
Every point must be checkable from a published rule, so the score can never be gamed or
bought.

## Why now

- **Vanity signals are discredited.** A CMU/arXiv study estimated ~4.5-6M fake GitHub
  stars; LMArena's "Leaderboard Illusion" and vote-rigging papers show review/Elo systems
  are gameable; DB-Engines and libraries.io openly warn their popularity proxies ≠
  adoption. Buyers (a16z's CIOs) now demand "rigorous evaluation frameworks" and benchmark
  data, not buzz.
- **The trusted model is a small, published, reproducible rubric.** OpenSSF Scorecard
  (18 reproducible checks → 0-10, runnable by anyone) and CHAOSS's deliberately tiny
  "Starter Project Health" set (time-to-first-response, change-closure ratio, bus factor,
  release frequency) show the way: few signals, each independently verifiable, formula
  public. Don't invent a 30-factor black box.
- **The inputs are free and source-backed.** OpenSSF Scorecard and deps.dev expose
  security-practice and package signals via free APIs at build time; we already verify
  licenses, docs URLs, release recency, and governance completeness.

## In scope

- **A 4-6 signal readiness rubric**, each signal independently verifiable, for example:
  OSI/license clarity (from the upstream LICENSE), release/maintenance recency, governance-
  posture completeness (the source-backed dimensions already tracked), documentation
  resolves, and — for open-source tools — an OpenSSF Scorecard value fetched at build time
  via the free API. Final weighting decided during the milestone and **published**.
- **Published, versioned scoring methodology** (linked from milestone 4), with each tool's
  score showing its per-signal breakdown so a reader can audit exactly why it scored as it
  did. Honest labelling: this is a *readiness/health* score, not a quality ranking — stated
  as plainly as DB-Engines states it measures popularity.
- **Deterministic computation** in `lib/` (unit-tested) feeding a build-time generated
  field, so the score is reproducible and `check-generated-artifacts` doesn't flap.
- **Score exposed in the open dataset** (milestone 2) and as a shields badge.

## Out of scope

- Any signal that isn't independently reproducible (no editorial fudge factor — that's what
  the radar verdict in milestone 6 is for; the two are clearly distinguished).
- Benchmarking model quality/latency ourselves (out of scope for a static directory; we can
  *link* to independent benchmarks like Artificial Analysis rather than reproduce them).
- Paid or vendor-supplied inputs of any kind.

## Acceptance

- Each tool shows a readiness score with a transparent per-signal breakdown; the formula is
  published and versioned.
- The computation is deterministic and unit-tested in `lib/`; re-runs produce identical
  output.
- Any external signal (e.g. Scorecard) is fetched at build time, with the token (if any)
  read from env and never inlined — and a missing input degrades gracefully rather than
  failing the build.
- Score is in the dataset/API and available as a badge; `/ship-check` stays green.

## Depends on / feeds

Depends on milestones 2 (dataset/badges), 4 (methodology page), and 5 (license signal).
Complements 6 (verdict). Feeds comparison (3) and the flagship report (11).
