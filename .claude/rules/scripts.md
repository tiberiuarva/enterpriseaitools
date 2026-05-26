# Rules for `scripts/**`

Applies to: Node generators and validators invoked by npm scripts.

## Hard rules

1. **Secrets from env only.** Any token (GitHub PAT, Azure SWA token) is read
   from `process.env` at run time and **never** inlined into output, committed,
   or echoed to logs.
2. **No secrets in generated artifacts.** Output written under `app/`, `public/`,
   or `out/` must be free of any build-time token.
3. **Fail loud, exit non-zero.** Validators that find a problem print a clear
   message and `process.exit(1)` so CI and `/ship-check` stop on first failure.
4. **No `any`.** Parse and validate external input (API responses, JSON files)
   at the boundary; use `unknown` + guards.
5. **Deterministic output.** Generators produce stable, sorted output so
   `check-generated-artifacts` does not flap between runs.

## Conventions

- File names: kebab-case, `.mjs` for ES-module Node scripts.
- Wire each script into `package.json` under a descriptive `check-*` /
  `generate-*` / `report-*` name.
- Read the canonical dataset from `data/*.json`; validate against
  `data/SCHEMA.md` rather than trusting shape.

## After any change under `scripts/`

```bash
node scripts/<script>.mjs   # the script you touched
npm run lint
```

If the script regenerates artifacts, run the matching `check-*` gate and commit
the regenerated files in the same PR. Commit prefix is `feat:` / `fix:` /
`refactor:` / `chore:`.
