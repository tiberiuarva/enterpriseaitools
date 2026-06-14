# Milestone 6 — The Enterprise AI Radar (maturity verdicts)

**Status:** [ ] planned
**Horizon:** 2 — Decision-grade depth
**Pillars:** Decision-grade UX (4); Trust through provenance (1)
**Branch when built:** `milestone/6-enterprise-ai-radar`

## Goal

Add an opinionated, source-backed maturity verdict to every tool — a ThoughtWorks-style
radar adapted for the regulated enterprise — so the site answers not just "what exists"
but "what is actually ready to adopt." This is the layer that separates a directory from a
decision tool, and it directly counters "agent washing."

## Why now

- **Buyers can't tell substance from marketing.** Gartner: ~40% of agentic projects
  canceled by 2027, and only ~130 of thousands of agentic vendors are "real." A neutral,
  experience-gated verdict is precisely the missing signal.
- **The Tech Radar model is the trusted template.** Four rings — Adopt / Trial / Assess /
  Hold — with a willingness to say "Hold (don't start anything new with this)," published
  on a fixed cadence, with a stated "no vendor influence" policy and a forced-freshness
  rule (a blip drops off unless it moves). Professionals already trust this format; the
  open "Build Your Own Radar" renderer proves it works from JSON.
- **We already have the substrate.** Source-backed governance posture, license risk,
  release recency, and a weekly change feed give us defensible inputs for a verdict — unlike
  vote- or traffic-based rankings, which the research shows are gameable (LMArena
  "Leaderboard Illusion," ~6M fake GitHub stars).

## In scope

- **A maturity verdict per tool** (Adopt / Trial / Assess / Hold) stored in `data` as a
  source-backed, dated field with an `editorialRationale` and the evidence it rests on.
  Schema-first: define it in `data/SCHEMA.md`; every verdict carries a rationale and a
  review date.
- **Explicit, published ring criteria** (what evidence moves a tool to Trial vs Adopt vs
  Hold), linked to the methodology page from milestone 4. The bar for the higher rings
  emphasises production-readiness and stability, not hype.
- **A radar visualization** rendered at build time from the JSON — rings × the existing hub
  categories (agents / orchestration / governance / assistants) as quadrants. Static,
  accessible, no client data fetch.
- **Forced freshness.** A verdict older than the freshness threshold is visibly flagged for
  re-review; the weekly Radar SOP includes verdict review.
- **The "no vendor influence" statement on the radar page itself** (per the Tech Radar
  trust formula).

## Out of scope

- Crowd voting, user reviews, or any community-sourced ranking (gameable; against the
  trust model).
- A numeric score — that is the separate, mechanical rubric in milestone 8. The radar is a
  human, editorial verdict; the score is reproducible and automated. They are complementary
  and clearly distinguished.

## Acceptance

- Every listed tool has a ring verdict with a dated, source-backed rationale, or is
  explicitly marked "not yet assessed."
- Ring criteria and the impartiality note are published and linked from methodology.
- A static, accessible radar view renders from the dataset and is filterable by category.
- Verdicts past the freshness threshold are flagged; `/ship-check` stays green.

## Depends on / feeds

Depends on the governance-posture data, license tracking (5), and methodology page (4).
Feeds the comparison surfaces (3) and the flagship report (11), and the verdict becomes a
column in the open dataset (2).
