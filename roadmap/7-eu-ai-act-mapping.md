# Milestone 7 — EU AI Act and compliance obligation mapping

**Status:** [x] done (shipped 2026-07-17 on `claude/project-milestones-kgn3pf` — pulled
forward by the 2026-07-17 audit to land before GPAI enforcement begins 2026-08-02)
**Horizon:** 2 — Decision-grade depth
**Pillars:** Own the unowned gaps (5); Decision-grade UX (4)
**Branch when built:** `milestone/7-eu-ai-act-mapping`

## Goal

Turn the existing per-tool EU AI Act risk-tier field into a genuine compliance aid: map
tools and deployer roles to the obligations and deadlines that actually apply, with a
regulatory-deadline calendar feed. Make the site the place a compliance officer starts.

## Why now

- **Enforcement is imminent and the rules are moving.** GPAI obligations have applied since
  2 Aug 2025; Commission enforcement powers over GPAI activate 2 Aug 2026 (fines up to
  €35M / 7% turnover). The Nov 2025 "Digital Omnibus" reached a provisional May 2026
  agreement delaying stand-alone high-risk obligations to **2 Dec 2027** (product-embedded
  to Aug 2028), with adoption/Official-Journal publication expected mid-2026. Until
  published, 2 Aug 2026 remains the legal high-risk date on paper. Deployer duties (AI
  literacy since Feb 2025) already bite. A buyer needs a current, sourced read of "what
  applies to me, when" — and the flux is itself the reason to track it here.
- **Regulation is now the top deployment barrier** (Deloitte) and the AI-governance
  platform market is real (Gartner: ~$492M in 2026, >$1B by 2030; ISO 42001 certifications
  emerging as a tool-card differentiator). We already carry SOC 2 / ISO 27001 / ISO 42001
  and EU AI Act fields — this milestone makes them actionable rather than informational.
- **No directory does this.** It is squarely in the unowned-gap column and fits our
  source-backed model: every obligation maps to an article and an official source.

## In scope

- **A maintained EU AI Act knowledge layer** in `data/` (building on the existing
  `eu-ai-act.json`): obligations by role (provider / deployer / GPAI), the applicable
  dates (with the omnibus changes tracked as they finalise), and an official `sourceUrl`
  per obligation. Schema-first; dated; updated when the Official Journal text lands.
- **Per-tool obligation view.** On each per-tool page, given its role/tier, show which
  obligations are implicated and link to the authoritative text — clearly framed as
  source-backed information, not legal advice.
- **A regulatory-deadline calendar feed (iCal/ICS).** An endoflife.date-style subscribable
  feed of EU AI Act (and related) deadlines, generated at build time — a cheap, distinctive
  artifact a compliance team can drop into their calendar.
- **A plain "where the law stands as of <date>" summary** that the weekly Radar keeps
  current, so the moving omnibus timeline is never silently stale.

## Out of scope

- Legal advice, or any claim of certifying compliance — we map to sources; the user
  decides. A prominent disclaimer states this.
- Jurisdictions beyond the EU AI Act in this milestone (US state laws, sectoral frameworks)
  — note as a future extension; do the EU AI Act well first.

## Acceptance

- The EU AI Act data layer is source-backed per obligation and reflects the current
  (omnibus-adjusted) timeline with dated entries.
- Per-tool pages show implicated obligations with links to official text and a clear
  not-legal-advice disclaimer.
- A valid ICS deadline feed is emitted at build and documented.
- The weekly Radar SOP includes an EU AI Act freshness check; `/ship-check` stays green.

## Depends on / feeds

Depends on the existing `eu-ai-act.json` and milestone 2 (feed infrastructure for ICS).
Feeds the guided evaluation flow (an EU AI Act role is already an intake question) and the
distribution milestone (deadline movements are newsworthy feed items).

## Outcome (shipped 2026-07-17)

- **Knowledge layer:** `data/eu-ai-act-obligations.json` — 11 article-mapped obligations
  by actor (provider / deployer / GPAI provider) and risk tier, each with an official
  `sourceUrl` (EUR-Lex / Commission / Parliament, all verified resolving), omnibus
  deferrals tracked as provisional `deferral` blocks. Documented in `data/SCHEMA.md`;
  parse-validated at module load by `lib/eu-ai-act-obligations.ts` (+ 7-test suite).
- **Tracker page:** `/eu-ai-act` with the dated "where the law stands" summary, the
  application timeline, per-actor obligation reference, FAQ JSON-LD, and a prominent
  not-legal-advice disclaimer.
- **Per-tool view:** every `/tools/<id>` page maps its `governance.euAiAct.role` to the
  implicated obligations with official-text links.
- **ICS feed:** `public/eu-ai-act-deadlines.ics` generated at build (deterministic,
  RFC 5545 folded, validated by `check-open-data`), linked from the page and footer.
- **Radar SOP:** step 1c added — omnibus/legislative status checked weekly; `asOf` older
  than ~30 days is treated as a required task.
