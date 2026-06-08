# Project milestones

Roadmap for turning enterpriseai.tools into a navigable, source-backed tool that is genuinely useful to a regulated-enterprise AI architect. No conversion, signup, or monetization mechanics in any milestone.

Legend: [x] done · [ ] planned

## M0 — Foundation accuracy  [x] done
Unified freshness dates across pages, consistent tool counts, hidden empty version field, license verification.

## M1 — Information architecture  [x] done
Per-tool detail pages as the home for depth; category and landscape pages slimmed to a short intro plus a scannable, filterable comparison grid that links into the per-tool pages.

## M2 — Governance-posture comparison  [x] done
Goal: complete the vendor comparison on the dimensions a regulated buyer actually filters on.
Dimensions: data residency, deployment model (SaaS / on-prem / sovereign), audit logging, SOC 2 / ISO 27001 / ISO 42001, EU AI Act risk-tier fit, license type and risk.
In scope:
- Add these fields to the data schema (data/tools.json and data/SCHEMA.md), each value source-backed per the data rules.
- Render them as filters and columns in the existing category grid.
- Render the full posture writeup on each existing per-tool page.
- Populate for all tools; every value source-backed and URL-verified (HTTP 200); never auto-edit a license field.
Acceptance:
- Every tracked tool has each governance dimension populated, or explicitly marked unknown / not applicable with a reason.
- The category grid is filterable on these dimensions.
- Every value is source-backed; any license discrepancy opens a dedicated data-correction issue rather than a silent edit.
Depends on: M1 (done). Feeds: M3.

## M3 — Guided "help me evaluate" tool  [x] done
Goal: a short guided flow that returns a relevant shortlist and a readable posture sheet. A tool, not a table. No gate, no signup, no data capture.
In scope:
- Intake of roughly 8-12 questions: category / use case, sector, data sensitivity, deployment constraint, jurisdiction, EU AI Act role, open-source-risk tolerance.
- Logic that filters and ranks tools using the M2 governance fields.
- Output: a ranked shortlist plus a per-tool posture summary, each result linking to its per-tool page, in a clean readable form.
- Fully static-export compatible; client-side logic only; no backend.
Out of scope: any email capture, account, or lead mechanic.
Acceptance:
- A user can complete the flow and get a relevant, explainable shortlist.
- Results link to per-tool pages.
- Works as a static export with no backend and no data capture.
Depends on: M2.

## M4 — What changed and why it matters  [x] done
Goal: surface the longitudinal signal the weekly agent already collects: license changes, breaking releases, deprecations, new certifications. The reason to return weekly.
In scope:
- Persist historical snapshots from the weekly scan as time-series via `scripts/snapshot-current.mjs` (`npm run snapshot-weekly`) writing `data/snapshots/<YYYY-MM-DD>.json` — additive across dates, never overwrites a prior date. The `/radar` SOP runs it at the end of every weekly scan.
- A site-wide "what changed" feed (`/updates`, filterable by category and impact via the existing `updates.json` feed and high-impact filter).
- A per-tool change-history section on each per-tool page sourced from `updates.json` filtered by `toolId`.
- Clear flagging of high-impact governance and license changes (warning border + "High impact" badge on per-tool change history).
Acceptance:
- Weekly scan output is persisted as a per-date snapshot file under `data/snapshots/`, so the time dimension is no longer discarded.
- A site-wide change feed exists at `/updates` and a per-tool history renders on every `/tools/<id>` page.
- License, deprecation, and certification changes are clearly flagged.
Depends on: the weekly scan persisting history — now satisfied by the snapshot pipeline.

## M5 — Accuracy and findability  [x] done
Goal: make every page a trustworthy, current, citable reference for humans and AI assistants. Pure reference quality, no funnel.
In scope:
- A source link on every factual claim.
- A visible "as of" date on every per-tool page and its data.
- A named author byline and expertise signal.
- Structured data (Article / FAQ / Dataset schema), an llms.txt, a clean per-claim structure, and a direct one-line answer at the top of each page.
Acceptance:
- Every per-tool page has source links, an "as of" date, and a byline.
- Schema and llms.txt are present and valid.
- A spot-check of claims each traces to a verifiable source.
Depends on: M1 (done). Partly parallelizable.

## M6 — Page text-density pass and layout polish  [x] done
Goal: now that per-tool pages hold the depth, cut everything from the hub pages that duplicates them and fix layout regressions noticed in review.
In scope:
- Trim verbose intro prose on every hub (platforms, agents, orchestration, governance, assistants) to a one-line direct answer.
- Audit every other page (home, about, updates, evaluate) and remove text that is not strictly necessary now that per-tool pages exist.
- Fix the about-page top section where one of the boxes was not aligned with the others.
Acceptance:
- Category and platforms pages render a short, scannable header (one focused sentence) plus the comparison surface — no multi-paragraph editorial intros.
- About page top-row panels sit on a shared baseline.
- No regressions to existing gates.
Depends on: M2 (per-tool pages must exist so depth is not lost).

## M7 — Snapshot-derived change events  [ ]
Goal: derive change events automatically by diffing successive snapshots so routine drift (license, deployment model, cert added/removed, status transitions) surfaces without a manual `updates.json` entry.
In scope:
- `scripts/diff-snapshots.mjs` reads the two most recent `data/snapshots/*.json` files and emits a per-tool change list with before/after.
- A site-wide auto-detected events feed on `/updates`, distinguishable from manually-curated entries.
- Per-tool change history section also renders the auto-detected entries with explicit before/after.
- Flag high-severity diffs (license-risk increase, cert removal, status → deprecated/archived).
Acceptance:
- After a `/radar` run that adds a new snapshot, the change feed shows the derived events without any manual editing.
- Diffs render with a clear "Auto-detected from snapshot diff" label and a link to the two snapshot files.
Depends on: M4 (snapshot pipeline — done).

## M8 — FAQ structured data on hub pages  [ ]
Goal: extend `FAQPage` JSON-LD beyond `/evaluate` to the homepage and each category hub so AI assistants and search engines can pick up the direct-answer pairs.
In scope:
- Add 3–5 question/answer pairs per hub (home, platforms, agents, orchestration, governance, assistants).
- Use the existing `buildFaqPageJsonLd` helper; emit alongside CollectionPage + BreadcrumbList where present.
- Keep answer text consistent with the trimmed hub intros (no marketing copy creep).
Acceptance:
- Each hub page emits valid FAQPage structured data, validated by `check-seo-readiness`.
- Adding a hub FAQ does not duplicate the visible page text.
Depends on: M5 (FAQ JSON-LD shape — done).

## M9 — Tool comparison page  [ ]
Goal: a static side-by-side comparison surface so a reader can pick 2–3 tools and read them column-by-column on every governance dimension.
In scope:
- Static route under `/tools/compare/<a>-vs-<b>/` (or similar) with `generateStaticParams` enumerating curated pairings, OR a client-rendered chooser inside an existing route that emits a static page per high-value combination.
- Columns: identity, license, version, status, governance posture (per-dimension), change history, links to each tool's full page.
- No backend; no per-query SSR.
Acceptance:
- A user can land on a comparison URL and see two or three tracked tools side-by-side without bouncing between pages.
- The route is fully statically exported and listed in the sitemap.
Depends on: M2 (governance posture — done).

## M10 — Mobile polish and accessibility audit  [ ]
Goal: complete a full pass for mobile-specific layout regressions and keyboard / screen-reader accessibility on every page.
In scope:
- Audit each route in mobile widths (≤ 480px) and tablet widths; fix wrapping, overflow, and tap-target issues.
- Verify keyboard navigation across the filter bar, evaluate flow, per-tool change history, and search.
- Add or correct ARIA labelling where implicit semantics are insufficient.
- Verify WCAG AA color contrast on light and dark themes.
- Optional: add a `check-accessibility` script in CI that runs `axe-core` against the static export.
Acceptance:
- No horizontal scroll on any tracked route at 360px width.
- Every interactive control is keyboard-operable with visible focus.
- Representative pages score ≥ 95 on Lighthouse accessibility.
Depends on: M3 (evaluate flow — done) and M6 (page slimming — done).

## M11 — Data freshness rotation  [ ]
Goal: surface per-tool data freshness prominently and feed stale records into the next `/radar` run.
In scope:
- Visible "verified `<date>`" chip on per-tool pages; stale-flag styling when `governance.reviewedAt` is older than a configurable threshold.
- `scripts/check-data-freshness.mjs` lists tools whose verification is overdue, wired into the `/radar` prep step.
- Optional: per-field staleness (license, version, stars verified separately).
Acceptance:
- Stale tools are visible on the page AND surface in `/radar` preparation output.
- Freshness threshold is documented in `data/SCHEMA.md`.
Depends on: M2 (governance review dates — done), M4 (snapshot pipeline — done).

## M12 — Performance and build polish  [ ]
Goal: tighten bundle size, image handling, and font loading for the static export.
In scope:
- Audit `next build` output for per-route JS size and identify trim opportunities.
- Optimize logo and platform-mark image delivery for the static-export setup (`images.unoptimized: true` is already set; ensure proper width/height and `loading` hints are present at the markup level).
- Verify no third-party runtime fonts are pulled at page load.
- Document baseline numbers in `docs/`.
Acceptance:
- Per-route JS does not grow vs. the documented baseline without a recorded reason.
- LCP and CLS targets met on a representative page test (homepage + a per-tool page).
Depends on: none.

## Dependencies at a glance
- M1 is done, so M2 can start now.
- M2 feeds M3.
- M4's persistence step and parts of M5 can run alongside M2.

Each milestone's tasks are worked as individual findings / PRs (one PR per task), tracked under the matching GitHub Milestone.
