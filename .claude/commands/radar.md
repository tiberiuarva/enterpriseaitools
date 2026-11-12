---
description: Weekly Radar update — research source-backed changes, edit data JSON, open content PR.
argument-hint: "[optional ISO week, defaults to current week]"
---

# /radar — Weekly data update flow

This is the data-only flow. Use `/build` for code changes.

## 1. Set the scope

- Default week tag: `YYYY-WW` of the current Monday.
- If `$ARGUMENTS` is given, use that ISO week.
- Branch off main: `git checkout -B content/YYYY-WW-radar origin/main`.

## 1b. Identify stale records first (M11)

```
npm run check-data-freshness
```

Tools whose `governance.reviewedAt` is older than the documented freshness
threshold are listed in age order. Re-verify those first during research so the
weekly scan stays on top of records that have not been spot-checked recently.
Informational gate — does not block the run.

## 1c. EU AI Act freshness check (M7)

Check the legislative status of the Digital Omnibus on AI (and any other
pending AI Act amendment) against `data/eu-ai-act-obligations.json`:

- If the status moved (Official Journal publication, new dates, adoption),
  update `statusSummary`, the affected `deferral` blocks, and the timeline in
  `data/eu-ai-act.json` — every change source-backed per `data/SCHEMA.md`.
- Refresh `asOf` whenever the file is verified, moved or not. An `asOf` older
  than ~30 days means the "where the law stands" page is silently stale —
  treat that as a required task for this run.

## 2. Research

Spawn the `data-researcher` subagent with the explicit scope:

> Find source-backed changes since the last `data/updates.json` entry across:
> tracked tools (`data/tools.json`), platforms (`data/platforms.json`), and
> notable market events (acquisitions, deprecations, license changes, pricing
> changes, naming changes). Return a structured list with one `sourceUrl` per
> change.

Do **not** edit data based on memory or general knowledge. Every change needs
a fresh, verifiable source URL captured in the PR.

Record the exact source-audit cutoff timestamp in UTC before editing data.
Use the PR-body line `Audit cutoff: YYYY-MM-DDTHH:MMZ` (matching
`\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z`) so future catch-up scans can resume from a
deterministic, machine-readable boundary.

## 3. Apply the changes

- For each change, edit the relevant JSON file following `data/SCHEMA.md`.
- For tool/platform renames, update the canonical name and append the old name
  to `formerNames` (platforms) / `aliases` (tools).
- License changes (M5): after verifying against the upstream LICENSE, update
  `license` and (if applicable) `licenseWarning`, append a `licenseHistory`
  event (date, fromLicense, toLicense, direction, sourceUrl), and add a
  `license-change` entry to `data/updates.json` — all in the same PR. The
  snapshot diff flags license drift as high-impact; never publish the change
  without the upstream verification. The scheduled routine does not make these
  edits: it opens a "License correction" issue with the upstream evidence and
  leaves the change to a human (see §8).
- Append a new entry to `data/updates.json` for every newsworthy change with
  a valid `sourceUrl`.
- If `githubStars` or `version` was refreshed, update `lastRelease` too.
- For any record whose logo provenance changed, refresh `logoReviewedAt` and
  re-run `npm run check-logo-provenance`.

## 4. Regenerate artifacts

```
npm run build              # regenerates SEO artifacts as a side-effect
npm run check-generated-artifacts
```

If `check-generated-artifacts` is dirty, commit the regenerated files in a
separate commit titled `chore(ci): sync generated SEO artifacts for weekly scan`.

## 4b. Persist the weekly snapshot (M4 time-series)

```
npm run snapshot-weekly
```

This writes `data/snapshots/<YYYY-MM-DD>.json` — a compact drift fingerprint of
every tool and platform (license, version, status, governance dimensions).
Idempotent within a date (re-running today rewrites today's file byte-for-byte).
Additive across dates in normal SOP operation — no date argument means today's
date and one file per date. Passing an explicit date argument
(`node scripts/snapshot-current.mjs 2026-01-01`) overwrites that date's file,
so use the explicit form only when correcting a snapshot. Commit the new
snapshot alongside the data changes.

Then derive auto-detected change events (M7):

```
npm run diff-snapshots
```

This reads every `data/snapshots/*.json` file in order and writes
`data/snapshot-diffs.json` with one event per changed field per adjacent pair.
Commit the regenerated `data/snapshot-diffs.json` alongside the new snapshot.

## 5. Local gate

Run `/ship-check`. Push only if green.

## 6. PR

- Commit prefix: `content:` for data, `chore(updates):` for the week marker.
- PR title: `chore(updates): weekly scan YYYY-WW`.
- PR body must list every change with its `sourceUrl` and the exact UTC
  source-audit cutoff timestamp as `Audit cutoff: YYYY-MM-DDTHH:MMZ`.

## 7. Review loop

Spawn `pr-reviewer` (3-iteration cap for manual runs). License accuracy and `sourceUrl`
presence are P0 — block merge if either is missing on any record. The
scheduled routine runs the reviewer twice, overriding the agent's default
model: first on Opus, then on Fable (a second, independent Claude model). Each
run is capped at 5 passes; if either has not returned a clean approval by then,
the routine stops and reports to a human (see §8).

## 8. Merge (scheduled routine only)

The weekly Claude Code routine ("Weekly Radar update (enterpriseai.tools)",
Fridays 16:45 Europe/Bucharest, configured in claude.ai → Routines by the
repository owner) is pre-authorised by the owner to squash-merge its own
Radar PR, but only when all of these hold on the current head SHA:

- the gate passes when run from `origin/main`'s copy, never the head's (so a
  PR cannot weaken the check that judges it), after `git fetch origin main`,
  on the pushed head, with a clean working tree:

  ```bash
  git show origin/main:scripts/check-radar-automerge.mjs > "${TMPDIR:-/tmp}/radar-gate.mjs"
  node "${TMPDIR:-/tmp}/radar-gate.mjs" origin/main
  ```

  If the script is not on `origin/main`, do not merge. The gate fails when
  the diff touches any path other than `data/tools.json`,
  `data/platforms.json`, `data/updates.json`, `data/eu-ai-act.json`,
  `data/eu-ai-act-obligations.json`, `data/snapshot-diffs.json`,
  `data/logo-inventory.json` (vendor mirroring only), `data/snapshots/*.json`
  and the build-generated `public/` artifacts (feeds, sitemap, `robots.txt`,
  `llms.txt`, `llms-full.txt`, `eu-ai-act-deadlines.ics`, `public/data/`,
  `public/api/`). So `data/SCHEMA.md`, `data/comparison-slugs.json`, new
  data files and logo images wait for a human. It also fails when the diff
  adds or removes a tool or platform record; changes any `license`,
  `licenseWarning`, `licenseHistory`, `type`, `governance.licenseRisk`,
  `logoKind`, `logoUrl`, `logoSourceUrl` or `logoReviewedAt` value; or adds,
  edits or removes a `license-change` entry in `data/updates.json`;
- `pr-reviewer` on Opus, then on Fable, each returned
  `VERDICT: APPROVED (clean)` on this head. Clean means zero findings of any
  class, suggestions and nits included. Any commit pushed after an approval
  means both reviewers run again on the new head. Pass counts are cumulative
  per reviewer across re-runs; a new head does not reset the 5-pass cap;
- the `Build and Deploy Job` check run for this head SHA has completed with
  conclusion `success` (not pending, not missing);
- the PR is mergeable.

The squash-merge is pinned to the SHA the gate and both reviewers judged
(`expectedHeadSha` in the GitHub API, or `--match-head-commit <sha>` with
`gh pr merge`), so a later push cannot ride along unreviewed. Otherwise it
stops and reports to a human. Manual `/radar` runs never merge
on their own; a human merges them.

Merging to `main` also triggers the production deploy
(`.github/workflows/azure-static-web-apps-witty-grass-0a1a9d403.yml` runs on
every push to `main`), so a routine merge is an unattended production release.
After merging, the routine waits for that `main` run and then runs
`npm run smoke-test-live-site -- root https://www.enterpriseai.tools`. If either
fails, it reports to a human at once; the rollback is a PR that reverts the
squash commit.
