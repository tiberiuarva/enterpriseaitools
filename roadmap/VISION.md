# Vision — the go-to reference for enterprise AI tooling decisions

*Strategy note for the roadmap. Sets the North Star the numbered milestones serve.
Last reviewed 2026-06-13.*

## North Star

**Be the definitive, source-backed, no-pay-to-play reference that a regulated-enterprise
team trusts to decide which AI tools to adopt — and that AI answer engines cite when
asked.**

Think *endoflife.date × ThoughtWorks Technology Radar × CNCF Landscape*, but for the
enterprise AI stack (agents, orchestration, governance, assistants, the cloud AI
platforms, and the agent/MCP control planes now forming around them), and built to the
discipline of a regulated buyer: every claim has a verifiable source, license accuracy is
a release blocker, and nothing on the page can be bought.

## Why this is winnable now

The research behind this roadmap (competitor teardowns, enterprise-buyer surveys, and
2025-26 market signals) points at one gap no incumbent fills:

1. **Every volume player monetizes the listing itself.** There's An AI For That charges
   $347 + $99/mo for placement (position is literally bid-ranked), Futurepedia sells a
   $497 "verified" badge, Toolify $99, G2 $13k-95k/yr with market-presence weighting that
   structurally favors big vendors, Gartner's soft access economy. The single most-cited
   criticism across all of them is pay-to-play. A free, source-backed dataset with **no
   paid placement, ever** is genuinely differentiated — and the competitors' own conduct
   is our citable proof.
2. **Staleness is the universal second failure.** Gartner Magic Quadrants are annual;
   awesome-lists rot (~9-10% link-rot baseline); VC market maps are obsolete on publish;
   directory star counts go stale. A weekly, provenance-checked update cadence (Radar)
   plus lifecycle tracking targets this head-on.
3. **Nobody publishes provenance or audits licenses.** No competitor exposes a `sourceUrl`
   per claim or verifies that "open source" labels are accurate. After HashiCorp→BSL,
   Redis→SSPL (and its partial reversal that "didn't restore trust"), and Elastic's
   round-trip, enterprises now treat license rug-pulls as a procurement risk. License
   accuracy is already our P0 invariant — we should own the entire niche.
4. **Buyers professionalised, and they're burned by hype.** Procurement flipped to
   buy-over-build (Menlo: 76% of use cases bought), now demands SOC 2 / ISO 42001 /
   security checklists and weights deployment speed heavily; meanwhile Gartner calls
   ~40% of agentic projects dead by 2027 and flags "agent washing" (≈130 of thousands of
   agentic vendors real). Buyers need exactly the metadata we track — license, certs,
   data residency, EU AI Act fit, maturity, churn risk — not feature marketing.
5. **LLM answer engines are the new distribution channel.** G2 reported ~10× YoY growth in
   referral traffic from ChatGPT/Perplexity/Gemini/Copilot. Structured, citable,
   source-backed pages are what answer engines quote. Our AEO work (already begun) and an
   open dataset make us the substrate they cite.

## The five strategic pillars

Every milestone maps to one of these. If a proposed feature serves none of them, it does
not belong on this roadmap.

| # | Pillar | What it means | Anti-pattern we reject |
|---|---|---|---|
| 1 | **Trust through provenance** | Every fact sourced; methodology and inclusion criteria published; no paid placement | G2/Gartner pay-to-play; Futurepedia paid "verified" badge |
| 2 | **Freshness as a feature** | Weekly Radar, license-change history, lifecycle/EOL tracking, dated verification on every record | Annual Magic Quadrants; rotting awesome-lists |
| 3 | **Become infrastructure** | Open dataset + static JSON API + RSS + shields badges + llms.txt — things others embed and cite | Walled-garden, paywalled, PNG-snapshot market maps |
| 4 | **Decision-grade UX** | Comparison builder, maturity radar, guided evaluation, governance posture — answer "which should I pick" | Logo-soup landscapes; SEO-spam tool dumps |
| 5 | **Own the unowned gaps** | License-change alerts, EU AI Act obligation mapping, MCP/agent provenance, objective reproducible scoring | Vanity star counts; self-declared, unaudited metadata |

## Non-negotiable guardrails (these constrain every milestone)

- **No pay-to-play, no paid placement, no sponsored ranking — ever.** This is the moat.
- **No tracking, no analytics, no email capture, no cookies.** Distribution is RSS,
  badges, GitHub, and being citable — never a lead funnel. (Newsletter, if any, is
  RSS-first.)
- **Static export only.** API and feeds are build-time JSON/XML artifacts, not server
  routes. No backend ever enters the bundle.
- **Source-backed or not published.** Schema is law; license accuracy is P0.
- **Opinion is allowed, but it must be sourced and dated.** Maturity verdicts (Radar
  rings) carry an editorial rationale and a "no vendor influence" policy on the page.

## What "best in the market" looks like (end-state)

A professional — a platform architect, an AI lead, a compliance officer — arrives (often
sent by an LLM that cited us) and can, in one place:

- See every serious enterprise AI tool in a category, each with an audited license, a
  governance posture, a maturity verdict, and a dated "as of" stamp — with a source link
  on every claim.
- Compare any 2-3 tools side-by-side on the dimensions a regulated buyer actually filters
  on, and share that comparison by URL.
- Run a short guided flow and get an explainable shortlist with cautions.
- Subscribe (via RSS, no email) to "what changed" — including license changes,
  deprecations, new certifications, and EU AI Act deadline movements.
- Pull the whole dataset as open JSON, embed a live "license: BUSL-1.1 — verified
  2026-06" badge in their README, or let their own agent read `llms.txt`.
- Trust all of it because the methodology, inclusion criteria, and "nothing here was paid
  for" policy are published on the site.

## Success signals (measured without tracking users)

Because we run zero analytics, we judge progress by **observable, external** signals, not
on-site metrics:

- **Citation:** the site appears as a source in ChatGPT/Perplexity/Gemini answers to
  enterprise-AI-selection questions (manual spot-checks logged in `docs/`).
- **Embed/adoption:** inbound badge embeds and dataset/API consumers (GitHub backlinks,
  forks, dependents of the open dataset).
- **Coverage & freshness:** number of source-backed records, % of records verified within
  the freshness threshold, license-change events caught within one weekly cycle.
- **Authority:** external references from analysts, newsletters, and conference talks; the
  "State of Enterprise AI" report being linked.

## Horizons (see the catalogue in `README.md` for the live status table)

- **Horizon 1 — Trust surface & infrastructure** (Milestones 2-4): make the existing data
  embeddable, shareable, and demonstrably impartial. Highest leverage, lowest cost — these
  are mostly build-time artifacts and turn the site into infrastructure others cite.
- **Horizon 2 — Decision-grade depth** (Milestones 5-8): the features no competitor has —
  license-lifecycle tracking, an opinionated maturity radar, EU AI Act obligation mapping,
  and an objective reproducible score.
- **Horizon 3 — Coverage & reach** (Milestones 9-11): expand the dataset into the new
  agent/MCP control-plane categories, open a provenance-preserving contribution pipeline,
  and build durable distribution (Radar feed, periodic flagship report, badge ecosystem).
