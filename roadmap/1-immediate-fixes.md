# Milestone 1 — Site-consistency immediate fixes

**Status:** open
**Severity:** mixed (1 Critical · 1 High · 1 Medium · 1 Verify)
**Source:** `enterpriseai_immediate_fixes.pdf` (Artix Cloud review, reviewed live 2026-05-23)
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

- [ ] Every page (home and all four category pages) shows the same current
      freshness date.
- [ ] The recent-updates block on each category page reflects entries from the
      last 7 days, not April.
- [ ] The agent-tool count is identical on the homepage card and the Agents
      page, and matches `data/tools.json`.
- [ ] All four category counts are consistent across surfaces.
- [ ] No vendor card prints "No version listed"; the line is simply absent when
      there is no version.
- [ ] AutoGen and Guardrails AI licenses are either confirmed correct or have an
      open data-correction issue.
- [ ] All validation gates (`/ship-check`) pass on every PR.

## Execution notes

- Tasks 1–3 are code/data fixes; each is its own branch + PR when run via
  `/build` (one milestone may be split across PRs here since the fixes are
  independent and individually revertible).
- Task 4 is verification-only and produces either a "verified" note or a
  data-correction issue — never a direct license edit.
- Run all gates from `AGENTS.md` / `CLAUDE.md` before every PR. Never
  `git add -A`.
