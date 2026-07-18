# Milestone 11 — Distribution, authority, and the flagship report

**Status:** [ ] planned
**Horizon:** 3 — Coverage & reach
**Pillars:** Become infrastructure (3); Trust through provenance (1)
**Branch when built:** `milestone/11-distribution-and-authority`

## Goal

Make the platform the *cited* reference, not just a good one — through channels that
respect the zero-tracking guardrail: a weekly Radar feed, a periodic flagship "State of
Enterprise AI" report, embeddable badges in the wild, and being answer-engine-citable by
construction. This is the milestone that converts a strong dataset into market authority.

## Why now

- **Authority compounds from fixed cadence + archive.** ThoughtWorks Tech Radar (16 years),
  DB-Engines (14 years), and endoflife.date earned trust through consistency and a public
  archive, not marketing spend. We already run a weekly Radar SOP — packaging it as a
  durable, archived, subscribable artifact is the move.
- **A mechanical digest needs no editorial overhead.** Changelog Nightly proves a valuable
  feed can be generated entirely from structured data. Our weekly `data/*.json` diff *is*
  the digest — "what changed in enterprise AI tooling this week," delivered RSS-first (no
  email capture, no tracking), with each item source-linked.
- **LLM answer engines are now a primary discovery channel** (~10× YoY referral growth for
  G2). Source-backed, structured pages plus the open dataset and `llms.txt` make us the
  substrate they cite — this milestone hardens that on purpose (AEO), building on work
  already merged.
- **Badges are zero-cost distribution.** Every shields endpoint badge (from milestone 2)
  embedded in a vendor README is a backlink and a recurring impression — promotion that
  costs us nothing and tracks no one.

## In scope

- **The weekly Radar as a first-class subscribable feed** (RSS/Atom from milestone 2),
  archived on-site, generated from the weekly diff — the "reason to return" packaged for
  distribution. No email list required; if a newsletter ever exists it is RSS-mirrored and
  untracked. *2026-07-17 audit note:* once the snapshot cadence is automated (see the
  standing operational priority in `README.md`), upgrade this to a **daily** mechanical
  diff digest in the Changelog Nightly model — generated entirely from data at zero
  editorial cost, it is the only honest daily-cadence artifact this platform can sustain
  and the closest thing to a daily-habit product the guardrails allow.
- **A periodic flagship "State of Enterprise AI (tooling)" report** — a twice-yearly,
  source-backed synthesis (the heavyweight complement to the always-on data, exactly the
  Tech Radar two-cadence model): notable license changes, deprecations, new entrants,
  governance/EU-AI-Act movement, and radar-verdict shifts. Built from our own dataset, fully
  cited.
- **AEO hardening**: ensure structured data, the dataset, `llms.txt`, and a direct one-line
  answer at the top of each page maximise citability; spot-check that answer engines surface
  the site and log results in `docs/`.
- **Badge adoption push**: document and promote the embeddable badges so vendors and OSS
  READMEs carry live, sourced status from our data.

## Out of scope

- Paid acquisition, ads, sponsorships, or any tracked email/lead funnel (guardrail).
- SEO-gaming tactics (planted threads, doorway pages) — the research shows these poison
  trust; we win on substance and provenance.

## Acceptance

- The weekly Radar is published as an archived, subscribable feed generated from the
  dataset diff, each item source-linked.
- At least one flagship "State of Enterprise AI" report is published, fully source-backed,
  built from our own data.
- AEO checks pass and citation spot-checks are logged; embeddable badges are documented and
  in use on at least a few external repos.
- Everything respects zero-tracking and static-export constraints; `/ship-check` green.

## Depends on / feeds

Depends on milestones 2 (feeds/badges/API), 5-8 (the differentiated data worth citing), and
the weekly Radar SOP. This is the capstone — it projects every prior milestone outward and
serves the North Star directly.
