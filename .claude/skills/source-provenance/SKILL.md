---
name: source-provenance
description: Use whenever adding or changing a fact in data/*.json. Enforces the "source-backed or not published" invariant — every claim must trace to a verifiable primary source.
---

# Source provenance

The project's credibility rests on every data point being source-backed. A
single unverified claim that ships is worse than not shipping the claim at all.

## Source hierarchy (primary first)

| Claim | Primary source |
|---|---|
| License | The `LICENSE` file in the upstream repo |
| Version / latest release | GitHub releases page or vendor release notes |
| GitHub stars | GitHub repo page or REST API |
| Pricing | Vendor's pricing page (not a comparison blog) |
| Cloud availability | Vendor's docs page (not a partner directory) |
| Rename / rebrand | Vendor's announcement page |
| Acquisition | Official press release or SEC filing |
| Compliance badge | Auditor report or vendor compliance page |
| EU AI Act timeline | The Act's official text or Commission guidance |

Secondary sources (blog roundups, analyst reports, podcasts) may **inform**
research but never appear as `sourceUrl`.

## Required fields

- `data/tools.json` records: `docsUrl` (required), `githubUrl` (when OSS),
  `logoSourceUrl` (when `logoKind != fallback`).
- `data/platforms.json` records: `docsUrl` (required), `logoSourceUrl` (when
  `logoKind != fallback`).
- `data/updates.json` entries: every entry **must** have a `sourceUrl`. No
  exceptions.

## Verifying

Before commit, run:

```bash
npm run check-tool-card-data
npm run check-logo-provenance
```

Before merging a Radar PR, the `/verify-sources` command spawns the
`source-verifier` subagent to fetch each URL and confirm it still resolves and
backs the claim.

## When a source disappears

- If the only available source 404s, **do not** silently keep the claim. Pick
  one:
  1. Find a replacement primary source (archive.org snapshot counts only if
     the snapshot is from the original publisher's domain).
  2. Remove the affected field or downgrade the record's `status` to
     `maintenance` / `archived`.
  3. Open an `AUDIT.md` entry explaining the gap.

## License is P0

The single most common (and most damaging) error is labelling source-available
code as "MIT". Always read the upstream `LICENSE` file before setting
`license`. If the file references "Commons Clause", "BSL", "SSPL", "Elastic
License", "BSD + restriction", or has any non-OSI-approved clause, the record
needs a `licenseWarning` explaining the restriction in plain language.
