# Milestone 10 — Provenance-preserving contribution pipeline

**Status:** [ ] planned
**Horizon:** 3 — Coverage & reach
**Pillars:** Trust through provenance (1); Freshness as a feature (2)
**Branch when built:** `milestone/10-community-contribution`

## Goal

Let the community help the dataset scale and stay fresh — without ever compromising the
source-backed quality bar or letting placement be bought. Scaling coverage can't depend on
a single maintainer forever; the answer is structured, reviewed, PR-based contribution, not
open self-listing.

## Why now

- **The proven open model is PR-based, source-validated contribution.** endoflife.date
  scaled to ~459 products and 500+ contributors with every product a structured file
  validated in CI and every change a reviewed PR. CNCF requires an `ADOPTERS.md` for
  graduation — the closest thing OSS has to verified reference customers, and an ingestible
  deployment signal stronger than stars.
- **Self-listing is how the competition rots.** Toolify auto-classifies scraped sites with
  an LLM; TAAFT/Futurepedia take a fee to list; awesome-lists drown maintainers in a triage
  firehose. Our differentiator is the opposite: contributions are *proposals* that must pass
  the same provenance and license gates as anything we author.
- **Verifiable identity is now an established pattern.** The official MCP registry proves
  publisher namespace via GitHub OIDC / DNS — a model we can borrow so a vendor can correct
  their own record's facts without being able to buy placement.

## In scope

- **A structured submission/correction flow** via GitHub: issue/PR templates that require a
  primary `sourceUrl` for every field, the license read from the upstream LICENSE, and
  conformance to `data/SCHEMA.md`. Tie it to the inclusion criteria and correction path from
  milestone 4.
- **CI validation of contributions** so a PR that fails provenance, schema, or license
  checks is rejected automatically before human review — the existing validators
  (`check-tool-card-data`, `check-logo-provenance`, source verification) become the
  contribution gate, surfaced clearly to outside contributors.
- **A contributor guide** (`CONTRIBUTING`-level docs): how to propose a tool, what evidence
  is required, what won't be accepted, and the explicit "no paid placement, vendors may
  correct facts but not buy position" rule.
- **Optional vendor self-correction with verified identity** (borrowing the MCP-registry
  GitHub/DNS verification idea) so authoritative corrections are easy and auditable, while
  ranking/verdict/score remain ours alone.
- **Optional ADOPTERS-style deployment signal**: ingest/link public `ADOPTERS.md`-type
  evidence as a source-backed "known users" signal where it exists.

## Out of scope

- Open, unreviewed self-listing or any paid/expedited submission (the entire trust model).
- Letting contributors set their own maturity verdict (6) or score (8) — those stay
  editorial/mechanical and independent.
- A web submission form with a backend (breaks static export); contribution is via GitHub.

## Acceptance

- Documented submission and correction flows exist, each requiring source-backed evidence.
- CI automatically validates contributions against schema, provenance, and license gates
  and blocks non-conforming PRs.
- At least the maintainer-reviewed path is proven end-to-end on a real contribution.
- The "no paid placement" rule is restated in the contributor docs; `/ship-check` green.

## Depends on / feeds

Depends on milestone 4 (inclusion criteria, correction path) and the existing validator
suite. Accelerates milestone 9 (coverage) and keeps the whole dataset fresh for every other
milestone.
