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

## 2. Research

Spawn the `data-researcher` subagent with the explicit scope:

> Find source-backed changes since the last `data/updates.json` entry across:
> tracked tools (`data/tools.json`), platforms (`data/platforms.json`), and
> notable market events (acquisitions, deprecations, license changes, pricing
> changes, naming changes). Return a structured list with one `sourceUrl` per
> change.

Do **not** edit data based on memory or general knowledge. Every change needs
a fresh, verifiable source URL captured in the PR.

## 3. Apply the changes

- For each change, edit the relevant JSON file following `data/SCHEMA.md`.
- For tool/platform renames, update the canonical name and append the old name
  to `formerNames` (platforms) / `aliases` (tools).
- License changes: update both `license` and (if applicable) `licenseWarning`.
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
- PR body must list every change with its `sourceUrl`.

## 7. Review loop

Spawn `pr-reviewer` (3-iteration cap). License accuracy and `sourceUrl`
presence are P0 — block merge if either is missing on any record.
