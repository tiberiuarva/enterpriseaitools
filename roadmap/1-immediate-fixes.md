# Milestone 1 — Site-consistency immediate fixes

**Status:** in review (PR #109)
**Severity:** mixed (1 Critical · 1 High · 1 Medium · 1 Verify)
**Source:** Priority-fix review, conducted live against the homepage and Agents
category page on 2026-05-23 (confidential working document, not committed to the
repo). The findings are reproduced in full below so this milestone stays
self-contained.
**Branch when built:** `milestone/1-immediate-fixes`

## Why this comes first

The site's core promise is accuracy: *"Every data point links to an official
source. Updated weekly."* The issues below all undercut that promise in ways a
regulated-enterprise reader notices within the first minute. They must land
before any new feature work — a stale date or a self-contradicting number
quietly discredits the license column and everything else.

Cleared during review (not in scope): the Google Agent Builder docs link
resolves correctly (redirects to Google's renamed "Gemini Enterprise Agent
Platform" overview).

The next tier (vendor comparison tables, compliance-posture filtering) sits on
top of this and is explicitly out of scope here.

## Tasks

### Task 1 — CRITICAL: unify freshness stamp and recent updates across pages

- **Visible symptom:** Homepage shows `Updated 2026-05-23` and footer `Data
  accurate as of 2026-05-23`. The Agents page footer shows `Data accurate as of
  2026-04-15` and its "Recent updates" list stops at `2026-04-14`. The other
  category pages (orchestration, governance, assistants) share this pattern.
- **Why it matters:** The whole pitch is "updated weekly." A category page five
  weeks behind the homepage tells a careful reader the weekly claim is not true
  site-wide.
- **Likely root cause:** The weekly agent updates the homepage feed and shared
  data, but the per-category "data accurate as of" stamp and per-category
  "recent updates" block are sourced from something not regenerated on every
  build (a stale per-category field or a hardcoded date).
- **Where to look:** The category page component (Agents / Orchestration /
  Governance / Assistants), the "data accurate as of" render, the "recent
  updates" selection logic, and how those derive from `data/updates.json` and
  the build timestamp.
- **Fix:** Make every page derive its freshness stamp and recent-updates list
  from the same single source as the homepage — the latest `data/updates.json`
  entries filtered by category, computed at build time. No page carries its own
  hardcoded or independently-stored date.
- **PR title:** `fix(updates): unify freshness stamp and recent updates across pages`

### Task 2 — HIGH: single source of truth for category tool counts

- **Visible symptom:** Homepage category card for AI Agent Frameworks shows
  `13`. The Agents page header shows `12 tools in current dataset` (3 vendor + 9
  non-vendor). Two public surfaces, two numbers.
- **Why it matters:** A tracker whose own counts disagree invites doubt about
  every other figure on the page, including stars and licenses.
- **Likely root cause:** Homepage count and category-page count are computed
  from different logic or different build moments — probably the same underlying
  cause as Task 1 (pages not deriving from one source).
- **Where to look:** The homepage category-card count vs the category-page
  "tools in current dataset" count. Confirm both read the same filter over
  `data/tools.json`.
- **Fix:** Both numbers come from one shared helper that counts tools in a
  category from `data/tools.json` with identical filter logic. Verify the true
  count by reading the data file, then make both surfaces use the shared count.
  Check all four categories for the same mismatch.
- **PR title:** `fix(data): single source of truth for category tool counts`

### Task 3 — MEDIUM: hide empty version field instead of placeholder

- **Visible symptom:** On the Agents page, the three vendor cloud cards (AWS
  Bedrock Agents, Google Agent Builder + ADK, Microsoft Foundry Agent Service)
  each print `No version listed`.
- **Why it matters:** Managed cloud services carry no package version, so the
  line is noise. A placeholder reads as unfinished rather than a deliberate "not
  applicable."
- **Where to look:** The tool card component, the version field render. The
  `check-tool-card-data` guard may also need a tweak so an empty version is
  valid for vendor-type tools.
- **Fix:** When the version field is empty, hide the line entirely rather than
  rendering "No version listed." Do not invent a version. Keep
  `check-tool-card-data` passing (adjust the guard for vendor-type tools if
  needed).
- **PR title:** `fix(tool-card): hide empty version field instead of placeholder`

### Task 4 — VERIFY: confirm AutoGen (and Guardrails AI) license labels

- **Visible symptom:** The Agents page shows `AutoGen — MIT`. An earlier
  weekly-scan review flagged that AutoGen's repository LICENSE may not be plain
  MIT.
- **Why it matters:** License accuracy is the single most important field for a
  regulated-enterprise reader. A wrong license is worse than a missing one.
- **Note:** This is a verification task, not a confirmed error. Do **not**
  auto-edit the license field either way; per the data rules, license
  corrections go through a dedicated issue.
- **Fix:** Read the actual repository LICENSE for AutoGen (and Guardrails AI)
  and compare to the value in `data/tools.json`. If they match, record verified.
  If they differ, open a GitHub issue titled `License correction: <tool>` with
  labels `data-correction` and `needs-review`, stating the repo license, the
  tracked value, and the source URL — do not silently change the field.

## Acceptance criteria

- [x] Every page (home and all four category pages) shows the same current
      freshness date — all render the shared `lastUpdated` via `Footer`.
- [ ] The recent-updates block on each category page reflects entries from the
      last 7 days, not April — **partially met**: code already derives from
      `data/updates.json` by category, but `governance` (latest 2026-03-12) and
      `assistants` (latest 2026-03-25) have no recent entries. Closing this is a
      source-backed `/radar` data task, not code (see Outcome).
- [x] The agent-tool count is identical on the homepage card and the Agents
      page, and matches `data/tools.json` — both now use `filterToolsByCategory`.
- [x] All four category counts are consistent across surfaces.
- [x] No vendor card prints "No version listed"; the line is simply absent when
      there is no version — already true in `components/tool-card.tsx`.
- [x] AutoGen and Guardrails AI licenses are either confirmed correct or have an
      open data-correction issue — AutoGen verified correct; Guardrails AI
      mismatch filed as issue #110.
- [x] All validation gates (`/ship-check`) pass locally.

## Outcome (2026-05-25)

Verified against the current codebase before changing anything; most symptoms
the review captured on 2026-05-23 were already resolved by intervening commits.

- **Task 1 (freshness stamp):** Already unified — `Footer` renders one shared
  `lastUpdated` on every page. Refactored the date computation into a tested
  `latestIsoDate` helper to guard the invariant. The "recent updates" lists for
  `governance`/`assistants` show old dates only because those categories have no
  recent source-backed entries in `data/updates.json`; that is a data gap to
  close via `/radar` with verifiable sources, not a code defect.
- **Task 2 (counts):** Homepage and category pages already filtered identically;
  the homepage now routes through the shared `filterToolsByCategory` helper so
  the two surfaces cannot drift. Added `lib/dataset-metrics.test.ts`.
- **Task 3 (version field):** Already correct — `tool-card.tsx` conditionally
  renders the version and never prints "No version listed"; the validator does
  not require a version. No change needed.
- **Task 4 (licenses):** AutoGen tracked `MIT` is accurate (root `LICENSE` is
  CC-BY-4.0 for docs, `LICENSE-CODE` is MIT). Guardrails AI tracked `MIT` is
  wrong — upstream is Apache-2.0 — filed as data-correction issue #110 (no field
  edit, per the rules).

## Execution notes

- Tasks 1–3 are code/data fixes; each is its own branch + PR when run via
  `/build` (one milestone may be split across PRs here since the fixes are
  independent and individually revertible).
- Task 4 is verification-only and produces either a "verified" note or a
  data-correction issue — never a direct license edit.
- Run all gates from `AGENTS.md` / `CLAUDE.md` before every PR. Never
  `git add -A`.
