# Milestone 2 — Open data, feeds, and embeddable badges

**Status:** [~] in progress (third in the revised execution order; partially de-risked —
the dataset mirror under `public/data/`, the Atom feed, and `llms.txt` already exist)
**Horizon:** 1 — Trust surface & infrastructure
**Pillars:** Become infrastructure (3); Freshness as a feature (2)
**Branch when built:** `milestone/2-open-data-and-feeds`

## Goal

Turn the canonical `data/*.json` into a public good that other tools, READMEs, and AI
agents embed and cite. The dataset is already the product's source of truth; this
milestone exposes it as stable, documented, machine-readable surface area — the single
highest-leverage, lowest-cost move on the roadmap because it is all build-time artifacts
and needs no backend.

## Why now

- **Open dataset = moat.** endoflife.date, OSV.dev, and deps.dev became infrastructure
  others build on purely by emitting versioned JSON + a schema during their static build.
  endoflife.date's "API" is literally static JSON written to `_site/api/` by Jekyll — the
  exact pattern available to a static-export Next.js site.
- **LLM answer engines cite structured, source-backed pages** (G2 saw ~10× YoY LLM
  referral growth). A clean dataset + `llms.txt` makes us the substrate they quote.
- **shields.io endpoint badges** cost nothing: expose a tiny JSON document in the Shields
  endpoint schema and any vendor can embed a live "license: BUSL-1.1 — verified 2026-06"
  badge in their README. Every embed is a backlink plus recurring impressions — our zero-
  tracking-compatible distribution channel.
- **RSS/Atom is table stakes** for a technical audience and needs no subscriber tracking,
  matching our zero-analytics guardrail.

## In scope

- **Static JSON API as build artifacts.** Emit versioned, documented endpoints under
  `out/api/v1/` from `data/*.json` at build time: full collections (`tools.json`,
  `platforms.json`, `updates.json`), per-record files (`tools/<id>.json`), and a dataset
  index/manifest with a schema version. Deterministic, sorted output (per `scripts` rules).
- **RSS/Atom feeds.** A site-wide `updates.xml` (already partially emitted per the SEO
  tooling) plus per-category feeds, generated from `data/updates.json`. Add
  `<link rel="alternate" type="application/rss+xml">` discovery tags on the relevant pages.
- **shields.io endpoint badges.** Per-tool endpoint JSON (`out/api/v1/badge/<id>.json`)
  in the Shields endpoint schema (`schemaVersion`, `label`, `message`, `color`,
  `cacheSeconds`), e.g. license, status, "verified <date>". Document the embed snippet.
- **Dataset documentation page** (`/data` or a docs page): how to consume the JSON, the
  schema link, the licence of the data itself (e.g. CC-BY so reuse is attributed), the
  stability/versioning policy, and the "no paid placement" note.
- **Confirm/extend `llms.txt`** so it points agents at the dataset endpoints and key hub
  pages (build on the AEO work already merged).

## Out of scope

- Any server route, dynamic API, rate limiting, or auth (would break static export).
- Email capture or a tracked newsletter (RSS only).
- A formal deprecation policy for v1 endpoints — note it as a future need once consumers
  exist; ship v1 cleanly first.

## Acceptance

- `npm run build` emits stable, sorted JSON endpoints under `out/api/v1/` and valid
  RSS/Atom feeds; a new validator (`scripts/check-*`) confirms they are well-formed and
  match the dataset, and is wired into `/ship-check`.
- Every endpoint and feed is reproducible run-to-run (`check-generated-artifacts` does not
  flap).
- A documented shields endpoint badge renders for at least the license and status fields.
- A dataset/consumption doc page is live and linked from the footer and `/about`.
- No secrets in any generated artifact; static export still clean.

## Depends on / feeds

Depends on the existing dataset and SEO-artifact pipeline. Feeds every later milestone
(the API is how the radar, license history, and scores get consumed externally) and the
distribution milestone (11).
