# Rules for `data/*.json`

Applies to: `data/tools.json`, `data/platforms.json`, `data/updates.json`,
`data/eu-ai-act.json`, `data/logo-inventory.json`.

Always pair with the `schema-discipline` and `source-provenance` skills.

## Hard rules

1. **`data/SCHEMA.md` is the contract.** Read it before editing. Update it in
   the same commit as any field-shape change.
2. **Every required field present on every record.** Validators in
   `scripts/check-tool-card-data.mjs` reject missing fields.
3. **Every record carries provenance.** Tools/platforms need `docsUrl` (and
   `logoSourceUrl` when `logoKind != fallback`); every `updates.json` entry
   needs a `sourceUrl`.
4. **Slugs are forever.** `id` is referenced externally — never rename. Use
   `name`, `formerNames` (platforms) or `aliases` (tools) for renames.
5. **License accuracy is P0.** Read the upstream `LICENSE` file. Any
   non-OSI-approved clause (Commons Clause, BSL, SSPL, Elastic License,
   "source-available") requires `licenseWarning` in plain language.
6. **Logos.** `logoKind: fallback` → omit both `logoUrl` and `logoSourceUrl`.
   Otherwise both required, plus a fresh `logoReviewedAt` ISO date when the
   image or source changes.
7. **Dates are ISO `YYYY-MM-DD`.** Never locale-formatted.
8. **Numbers are numbers.** `githubStars: 19002`, not `"19,002"` or `"19k"`.
9. **No comments in JSON.** The schema doc explains the field; the data file
   is data.

## Common mistakes to flag

- New tool added without running `npm run check-tool-card-data` → likely
  missing required fields.
- Star count updated without re-checking the live GitHub repo → likely stale.
- Tool renamed without populating `aliases` → broken external link.
- "MIT" label on a source-available repo → release-blocking license claim.
- `logoUrl` set but `logoSourceUrl` missing → provenance gap.

## Workflow after any data edit

```bash
npm run check-tool-card-data
npm run check-logo-provenance
npm run check-logo-audit-report
npm run build
npm run check-generated-artifacts
npm run check-seo-readiness
```

Commit prefix is `content:` for data-only changes.
