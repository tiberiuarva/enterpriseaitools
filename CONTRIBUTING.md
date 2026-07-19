# Contributing to enterpriseai.tools

Contributions are welcome — and every one of them goes through the same gate:
**source-backed or not published.** Facts can be corrected by anyone with
evidence; placement is not for sale. The full policies live on the site:
[inclusion criteria](https://www.enterpriseai.tools/inclusion-criteria/),
[methodology](https://www.enterpriseai.tools/methodology/), and
[editorial independence](https://www.enterpriseai.tools/impartiality/).

## Ways to contribute

| I want to… | Do this |
|---|---|
| Propose a new tool | Open a **Propose a tool** issue, or a PR editing `data/tools.json` per `data/SCHEMA.md` |
| Correct a factual error | Open a **Data correction** issue with the primary source |
| Dispute a license label | Open a **License correction** issue — license fields are never edited directly |
| Fix code, copy, or docs | Open a PR following `docs/GIT-WORKFLOW.md` |

## The rules that every contribution must pass

1. **A primary source per field.** Every asserted fact (license, certification,
   deployment model, star count, release) needs a resolvable primary-source
   URL: official docs, the canonical repository, a vendor announcement.
   Secondary summaries don't qualify.
2. **Schema is law.** `data/SCHEMA.md` defines every field. Records that fail
   `npm run check-tool-card-data`, `npm run check-governance-data`, or
   `npm run check-logo-provenance` are rejected by CI before any human review.
3. **License labels are read from the upstream LICENSE file** — not from the
   README, the website, or a package registry. Any non-OSI clause needs a
   plain-language `licenseWarning`. Never edit an existing `license` field in a
   PR: open a **License correction** issue instead so the change is verified
   and logged (and, when confirmed, recorded in `licenseHistory` plus a
   `license-change` update entry).
4. **Slugs are forever.** Never rename an `id`. Product renames update `name`
   and preserve the old name in `aliases` / `formerNames`.
5. **No paid placement.** Proposing your own product is fine and disclosed
   affiliation is welcome — but inclusion is decided only by the
   [inclusion criteria](https://www.enterpriseai.tools/inclusion-criteria/),
   and no fee, sponsorship, or relationship influences listing, wording, or
   position. Contributions that read as marketing copy will be asked to
   re-state facts neutrally.

## Vendors correcting their own record

If you represent a listed vendor, open a **Data correction** issue from an
account whose affiliation is verifiable (an org-member GitHub account, or an
email/domain trail referenced in the issue). Verified-affiliation corrections
are prioritised — but they follow the same evidence rules as everyone else's,
and editorial fields (any future verdict or score) remain ours alone.

## What happens to your contribution

1. CI runs the full validator suite on every PR (schema, provenance, license
   flags, generated artifacts). Red CI is an automatic stop.
2. A maintainer reviews sources — spot-checking that each URL resolves and
   actually backs the claim.
3. Merged changes appear in the dataset, the open-data API (`/api/v1/`), and
   the site on the next deploy, attributed in the public git history.

## Local development

```bash
npm ci
npm run dev            # local dev server
npm run build          # full static export + artifact regeneration
```

Before pushing, run the gate suite in `.claude/commands/ship-check.md` (or at
minimum: lint, `npx tsc --noEmit`, the `check-*` validators touching your
change, and `npm run build`).
