---
name: schema-discipline
description: Use whenever editing data/*.json or considering a new field. Enforces that data/SCHEMA.md is the single source of truth — never widen the data shape silently.
---

# Schema discipline

The product is `data/tools.json` + `data/platforms.json` + `data/updates.json`
+ `data/eu-ai-act.json` + `data/logo-inventory.json`. The contract is
`data/SCHEMA.md`. Drift between the two is the largest class of bugs this
project can ship.

## Rules

1. **Read `data/SCHEMA.md` before editing any data file.** Even for a
   one-character fix — you'll catch a missed required field.
2. **Every required field must be present** on every record. Validators in
   `scripts/check-tool-card-data.mjs` and `scripts/check-logo-provenance.mjs`
   will reject the build otherwise.
3. **Never add a new field without updating `data/SCHEMA.md` in the same
   commit.** PR review blocks a new field landing in the data without a
   corresponding schema doc entry.
4. **Never widen a field's type** (e.g. string → string | string[]) without
   also widening the schema doc and any consumer in `lib/` / `components/`.
5. **Slugs are forever.** Once a tool/platform `id` is in production, it's
   referenced by external links and structured data. Renames go in `name` /
   `formerNames` / `aliases`; `id` does not change.
6. **License accuracy.** `license` reflects the actual upstream `LICENSE`
   file, not vendor marketing copy. Source-available licenses (BSL, SSPL,
   Commons Clause) require a `licenseWarning` explaining the restriction.
7. **Logos.** `logoKind: fallback` records must omit `logoUrl` and
   `logoSourceUrl`. Non-fallback records require both, plus a fresh
   `logoReviewedAt` date when the source is changed.

## Workflow when adding a tool

1. Pick an `id` (lowercase-kebab). Check it doesn't collide with any existing
   `id` in `data/tools.json` or `formerNames` in `data/platforms.json`.
2. Fill every required field from `data/SCHEMA.md` for `tools.json`.
3. Add or reuse a logo under `public/logos/` per the logo rules.
4. Run:

```bash
npm run check-tool-card-data
npm run check-logo-provenance
npm run check-logo-audit-report
npm run build
```

If any step fails, fix and re-run — never `--skip` your way past a validator.

## Workflow when changing the schema

1. Open `data/SCHEMA.md` first, draft the change.
2. Update `lib/types.ts` and any consumer in `lib/` and `components/`.
3. Migrate every existing record to the new shape (or write the migration
   into `scripts/` and run it).
4. Run the full `/ship-check` gate. Any record that fails validation is your
   migration miss.
