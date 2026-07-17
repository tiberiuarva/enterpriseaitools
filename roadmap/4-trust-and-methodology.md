# Milestone 4 — Published methodology, inclusion criteria, and impartiality

**Status:** [~] in progress (2026-07-17 audit: zero dependencies, cheapest milestone,
everything later links back to it — run alongside milestone 7)
**Horizon:** 1 — Trust surface & infrastructure
**Pillars:** Trust through provenance (1)
**Branch when built:** `milestone/4-trust-and-methodology`

## Goal

Make the platform's impartiality legible. Our biggest structural advantage over every
incumbent is that nothing here can be bought — but a first-time visitor can't see that
unless we say it, plainly, with the rules written down. This milestone publishes the
trust apparatus: inclusion criteria, scoring/verdict methodology, the "no paid placement"
policy, and the human accountability behind the data.

## Why now

- **Pay-to-play is the most-cited criticism of every competitor** (TAAFT bid-ranked
  placement, Futurepedia/Toolify paid badges, G2's market-presence weighting and
  advertiser dynamics, Gartner's NetScout lawsuit and access economy). Stating our
  opposite policy turns their weakness into our positioning — and it must be on-page to
  count.
- **Published methodology + fixed cadence + archive = trust.** This is the through-line of
  the institutions professionals actually trust: ThoughtWorks Tech Radar ("we don't accept
  vendor requests to influence what we include"), DB-Engines (public formula for 14 years),
  CNCF Landscape (explicit "≥300 stars, fits a category" inclusion rule), OpenSSF Scorecard
  (every check reproducible). Opinion is fine — *unsourced* opinion is not.
- **Audit gaps:** `/about` is thin, there is no inclusion-criteria page, and the
  author/expertise byline (M5 of the shipped plan) can be strengthened into a standing
  accountability statement.

## In scope

- **Inclusion-criteria page.** Explicit, objective rules for what gets listed and what
  doesn't (e.g. category fit, enterprise relevance, a resolvable primary source for every
  required field), modelled on CNCF's published criteria. Removal criteria too.
- **Methodology page.** How freshness is determined, how license accuracy is verified
  (read the upstream LICENSE; non-OSI clauses get a `licenseWarning`), how the weekly Radar
  works, and — once milestones 6/8 land — how maturity verdicts and scores are computed.
  Versioned and dated.
- **Impartiality / "no paid placement" statement.** A short, prominent, permanent policy:
  no listing fees, no sponsored ranking, no vendor influence on placement; how we fund/run
  the project; how corrections are requested. Linked from the footer site-wide.
- **Accountability & corrections.** A named maintainer/byline and expertise signal, plus a
  documented, public correction path (issue template) for disputed facts — reinforcing
  that disputes are resolved by sources, not by spend.

## Out of scope

- Any actual scoring algorithm (that is milestone 8) — this milestone only commits to
  *publishing* methodology as those features ship.
- Monetization mechanics of any kind.

## Acceptance

- Live, linked-from-footer pages for inclusion criteria, methodology, and the impartiality
  policy, each dated and written in plain language.
- Every factual-claim surface continues to carry a source link; the correction path is
  documented and reachable.
- `/about` is upgraded from placeholder to a credible statement of who runs this and why it
  can be trusted.
- SEO/structured-data gates stay green (`check-seo-readiness`); new pages carry correct
  canonical/metadata via `lib/metadata.ts`.

## Depends on / feeds

Depends on nothing technical; can run in parallel with 2 and 3. Feeds 6 and 8 (their
verdict/score pages link back to this methodology) and 10 (contribution pipeline relies on
the published inclusion/correction rules).
