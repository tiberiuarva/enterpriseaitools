---
description: Spot-check that sourceUrl / docsUrl / logoSourceUrl values in data/*.json still resolve and back the claimed fact.
argument-hint: "[optional file path or tool id slug]"
---

# /verify-sources — Source provenance sweep

Use this before merging a Radar PR, or ad-hoc when an audit needs to confirm
that the on-record sources still resolve and still support the claim.

## Scope

- If `$ARGUMENTS` is a JSON file path, verify only records in that file.
- If `$ARGUMENTS` is a tool/platform `id`, verify only that record.
- Otherwise, verify every record changed since `origin/main` (use
  `git diff origin/main -- data/`).

## Method

Spawn the `source-verifier` subagent with the scoped record list. It returns
one of three statuses per URL:

- `OK` — URL resolves, content still supports the claim.
- `MOVED` — URL redirects to a canonical replacement; suggest the new URL.
- `BROKEN` — 4xx/5xx or content no longer backs the claim; flag for fix.

## Report

Produce a markdown table: `recordId | field | status | currentUrl | suggestedUrl | note`.

If any row is `BROKEN`, the calling PR cannot merge. Either repair the source,
remove the claim, or downgrade the record's `status` to `maintenance`/`archived`
in a follow-up commit.

Never auto-rewrite `sourceUrl` values — surface suggestions, let a human (or
the calling agent) decide.
