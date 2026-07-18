# Milestone 5 — License lifecycle tracking and change alerts

**Status:** [~] in progress
**Horizon:** 2 — Decision-grade depth
**Pillars:** Own the unowned gaps (5); Freshness as a feature (2)
**Branch when built:** `milestone/5-license-lifecycle-tracking`

## Goal

Own the niche no one else does: a systematic, source-backed history of license changes
for enterprise AI tooling, with an alert feed. License accuracy is already our P0
invariant — this turns a point-in-time field into a tracked timeline and a reason to
return.

## Why now

- **Confirmed open niche.** Two independent research sweeps found *no* dedicated,
  maintained public tracker of license changes for the AI stack. The relicensing pattern
  is now a named, recurring event (MongoDB SSPL 2018 → Elastic 2021 → HashiCorp BUSL 2023
  → Redis RSALv2/SSPL 2024), and reversals happen too (Elastic back to AGPL 2024; Redis
  added AGPLv3 in 2025) — a tracker must catch both directions.
- **It is a live procurement fear.** Practitioners say relicensing "lost my trust for
  good" and note vendors "have not built legal safeguards to prevent another change."
  License rug-pull risk now gates enterprise adoption decisions.
- **License labels are time-dependent.** BUSL versions auto-convert to an open license
  after a change date (typically four years), so an accurate label needs the *date*, not
  just the SPDX id — exactly the kind of nuance a buyer can't get anywhere else.
- **It's pure JSON + a static feed.** No infrastructure; fits our constraints perfectly.

## In scope

- **Schema extension (schema-first).** Add a `licenseHistory` array per tool/platform
  (each entry: `date`, `fromLicense`, `toLicense`, `direction` open↔restrictive,
  `sourceUrl`, optional `notes`), plus, where relevant, a BUSL change/convert date. Update
  `data/SCHEMA.md` in the same change; store licenses as SPDX expressions where possible
  for interoperability, keeping the existing plain-language `licenseWarning`.
- **Backfill the known events** for currently-listed tools, every entry source-backed and
  URL-verified per the data rules (no silent license edits — corrections still go through
  the data-correction issue flow).
- **A license-change feed.** A filtered view of `/updates` (and a dedicated RSS feed from
  milestone 2's feed infrastructure) showing only license transitions, with the high-impact
  flagging the change pipeline already supports.
- **Per-tool license timeline** rendered on the per-tool page, with the warning prominent
  when a label is source-available/non-OSI.
- **Detection support in the weekly Radar.** Extend the snapshot/diff pipeline so a changed
  license between snapshots is surfaced for the weekly review to verify and record.

## Out of scope

- Automated license classification without human verification (accuracy is P0; a human
  confirms against the upstream LICENSE before anything publishes).
- Scanning a *user's* dependencies (that's FOSSA/Snyk's job) — we track the public tools we
  list, not private codebases.

## Acceptance

- `data/SCHEMA.md` defines `licenseHistory`; validators enforce its shape and that every
  entry has a resolvable `sourceUrl`.
- The known relicensing events for listed tools are backfilled and source-verified.
- A license-change RSS feed and a per-tool license timeline are live.
- The weekly snapshot diff flags license changes for review; `/ship-check` stays green.

## Depends on / feeds

Depends on milestone 2 (feed infrastructure) and the existing snapshot/diff pipeline.
Feeds the objective score (8), where license risk is a weighted signal, and distribution
(11), where "license changes this week" is a flagship feed.
