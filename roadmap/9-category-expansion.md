# Milestone 9 — Category expansion: agent control planes and MCP provenance

**Status:** [ ] planned
**Horizon:** 3 — Coverage & reach
**Pillars:** Own the unowned gaps (5); Freshness as a feature (2)
**Branch when built:** `milestone/9-category-expansion`

## Goal

Grow coverage into the categories that are forming right now — the agent/MCP control
planes the hyperscalers are racing to own, and the MCP server ecosystem with its acute
provenance problem — while holding the source-backed quality bar. Breadth, but never at the
cost of the trust model.

## Why now

- **A new platform battleground emerged in the last 12 months.** "Agent control plane" is a
  real category: Microsoft Agent 365 (Ignite, Nov 2025), OpenAI Frontier (Feb 2026), AWS
  Bedrock AgentCore (GA, re:Invent 2025), Google Gemini Enterprise (Oct 2025, absorbing
  Agentspace), Salesforce Agentforce 360. Our current taxonomy predates this; the dataset
  should reflect where enterprise spend is going.
- **MCP is now governed infrastructure** (donated to the Linux Foundation's Agentic AI
  Foundation, Dec 2025) — and its directories have a documented provenance crisis: Smithery
  exposed 3,000+ servers/keys (June 2025), ~92% of its hosted servers were unverified,
  typosquatting and tool-poisoning are named attack classes, and the public registries
  "make no attempt to evaluate quality or security." Our source-backed, provenance-first
  model is exactly the missing layer — verifiable publisher identity is the differentiator
  the official MCP registry pioneered (GitHub OIDC / DNS verification).
- **Vendor churn validates tracking.** Amazon Q → Quick Suite, Agentspace → Gemini
  Enterprise, the AutoGen + Semantic Kernel → Microsoft Agent Framework merge: our
  canonical-naming + `formerNames`/`aliases` discipline is a feature competitors lack.

## In scope

- **Add the agent-control-plane category** (and any adjacent gaps the research surfaced,
  e.g. evaluation/observability), schema-first, with every record source-backed and
  canonical-named (prior names preserved per the data rules). Update hub routing and
  structured data accordingly.
- **An MCP-server/provenance lens** (scoped deliberately): rather than mirror 17k servers,
  track a curated, source-verified set keyed on *verifiable publisher identity* and
  security posture — the PulseMCP "hand-reviewed, omit low-quality" model, not the mcp.so
  "quantity, no curation" model. Capture the official-registry namespace-verification signal
  where it exists.
- **Refresh canonical names and `formerNames`/`aliases`** across the dataset for the
  2025-26 rebrands, so external links and search keep working.
- **Keep curation quality measurable** via the milestone-8 readiness signals and the
  milestone-4 inclusion criteria — expansion must pass the same gates.

## Out of scope

- Hosting or proxying MCP servers (Smithery's cost-wall cautionary tale; also breaks static
  export). We describe and verify; we don't run.
- Auto-ingesting any registry wholesale without per-record source verification — quantity is
  not the goal; trusted coverage is.

## Acceptance

- The new category(ies) are live, every record source-backed and validated, with correct
  hubs, metadata, and structured data.
- The MCP/provenance lens lists a curated set with publisher-identity and security-posture
  signals, each source-verified.
- Canonical names and aliases reflect the latest rebrands; no broken external references.
- Dataset counts stay consistent across surfaces (the M0 invariant); `/ship-check` green.

## Depends on / feeds

Depends on the inclusion criteria (4) and readiness signals (8) being in place so growth
stays disciplined. Feeds the dataset/API (2) and distribution (11). Coordinate any hub-route
changes with redirects per the app-routes rules.
