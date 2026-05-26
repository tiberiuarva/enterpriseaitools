@AGENTS.md

# enterpriseai.tools — Claude Code system-of-record

## How to make progress (read this first)

`/build` is the entry point for code work. It finds the next incomplete milestone in
`roadmap/`, branches off `main` as `milestone/N-name`, executes the change end-to-end
(code + JSON data + tests + docs), runs the full local gate, opens a PR, and lets the
`pr-reviewer` subagent iterate (max 3 rounds) before a human is paged.

Weekly data-only updates go through `/radar` and the SOP in `AGENTS.md`. Both flows
end in `/ship-check` — the gate that mirrors CI exactly so nothing red ever reaches
GitHub Actions.

## Project layout

| Path | Purpose |
|---|---|
| `app/` | Next.js 16 App Router routes — every leaf is a static-export target |
| `components/` | Shared React components |
| `lib/` | Pure TS utilities + colocated `*.test.ts` files (node test runner) |
| `data/` | Canonical JSON dataset (`tools.json`, `platforms.json`, `updates.json`, `eu-ai-act.json`, `logo-inventory.json`) governed by `data/SCHEMA.md` — the product's source of truth |
| `scripts/` | Generators and validators invoked by npm scripts |
| `public/` | Static assets (logos, favicons, robots/sitemap inputs) |
| `docs/` | Architecture, ops, research, and audit notes |
| `roadmap/` | Staged build plan, one milestone per file |
| `directives/` | Operational SOPs (Radar weekly update flow, source-verification SOP) |
| `execution/` | Scripts that directives invoke (created on demand) |
| `.claude/skills/` | Procedural techniques, auto-loaded by skill name |
| `.claude/rules/` | Path-scoped conventions (data, routes, components) |
| `.claude/commands/` | Slash commands (`/build`, `/radar`, `/verify-sources`, `/ship-check`) |
| `.claude/agents/` | Specialised subagents (pr-reviewer, data-researcher, seo-auditor) |

Root docs already in the repo: `README.md`, `AGENTS.md`, `AUDIT.md`, `DEPLOYMENT.md`,
`CUSTOM_DOMAIN.md`, `CHANGELOG.md`.

## Tech stack

- Next.js 16 (App Router, static export) + React 19 + TypeScript 5 + Tailwind CSS 4
- Hosted on Azure Static Web Apps (root domain `www.enterpriseai.tools`); deploy
  workflow `.github/workflows/azure-static-web-apps-witty-grass-0a1a9d403.yml`
- No database — canonical data is versioned JSON under `data/`
- No auth, no payments, no analytics, no cookies, no runtime third-party fetches
- Build-time only third-party APIs: GitHub REST (stars / latest release), Lighthouse
  (performance gate), upstream vendor docs URLs (provenance checks)
- Testing: Node 22 built-in test runner (`node --experimental-strip-types --test`) for
  `lib/**`; custom Node validators in `scripts/`; Lighthouse for live perf budgets
- Node 22, npm

## Architecture principles (non-negotiable)

1. **Source-backed or not published.** Every record in `data/*.json` carries a
   verifiable `sourceUrl` (or, for tools/platforms, equivalent `docsUrl` +
   `logoSourceUrl`). Validators reject records that fail provenance checks.
2. **Static export only.** No server routes, no `route.ts` handlers, no middleware,
   no runtime secrets in the browser bundle. `npm run build` must produce a fully
   static `out/`.
3. **Schema is law.** `data/SCHEMA.md` defines field shape. Validators in `scripts/`
   enforce it. Never widen a field without updating the schema doc in the same PR.
4. **License accuracy is a P0 invariant.** Mislabelling source-available code as
   "MIT" is a release blocker, not a typo.
5. **Canonical naming with aliases.** Render the current canonical name (Foundry,
   Amazon Q, Gemini Enterprise) and preserve prior names in `formerNames` / aliases.
6. **Zero tracking.** No analytics, no third-party cookies, no runtime third-party
   fonts. The deploy budget is bytes + privacy, not engagement.
7. **No build-time secrets in the bundle.** Any token consumed by `scripts/` is read
   from env at build time and never inlined into output.

## Conventions

- Import alias `@/*` (configured in `tsconfig.json`)
- File names: kebab-case (`tool-card.tsx`); React components: PascalCase
- JSON keys: camelCase; tool/platform `id` slugs: lowercase-kebab
- Commits follow conventional commits: `feat:`, `fix:`, `chore:`, `content:` for
  data-only changes, `test:`, `docs:`, `refactor:`
- No subscription tiers (project is MIT, no paid plans)

## Git workflow (trunk-based)

- `main` is the only long-lived branch — never commit directly
- Code milestones: `milestone/N-name`; weekly data updates: `content/YYYY-WW-radar`;
  ad-hoc fixes: `fix/short-description`
- PR required; squash-merge
- Production deploys: explicit `workflow_dispatch` or tag — never automatic on every
  push to `main` once the gating is in place
- The `pr-reviewer` subagent reviews every PR before a human is pinged (max 3
  iterations; escalate if still red)
- Full workflow: `docs/GIT-WORKFLOW.md`

## CI gates (always run locally first)

Never push until **all** of the following are green locally. Burning CI minutes to
find a lint error is wasteful.

| Gate | Command |
|---|---|
| Lint | `npm run lint` |
| Typecheck | `npx tsc --noEmit` |
| Unit tests | `npm run test:eu-ai-act` (plus any new `node --test` suites under `lib/`) |
| Build | `npm run build` (runs `generate-seo-artifacts`, `next build`, `check-static-export-image-paths`) |
| SEO readiness | `npm run check-seo-readiness` |
| Tool card data | `npm run check-tool-card-data` |
| Logo provenance | `npm run check-logo-provenance` && `npm run check-logo-audit-report` |
| Generated artifacts | `npm run check-generated-artifacts` |
| Deploy readiness | `npm run check-deploy-readiness` |

`/ship-check` runs them in order and stops on the first failure.

Coverage thresholds (when added to a test runner): 70% lines/functions/statements,
65% branches on `lib/**`. The deploy job is gated on every check above passing plus
a successful Azure SWA upload.

## Token budget rules

- **Default model:** Sonnet 4.6 for all routine work (data edits, component tweaks,
  test fixes, deploy gates).
- **Opus 4.7 only for:** architecture decisions, schema migrations, complex SEO /
  structured-data debugging, weekly Radar narrative drafting.
- **Always delegate to subagents for:** multi-file codebase research, dataset-wide
  diffs, generating test fixtures, source-URL verification sweeps. Use `Explore` for
  read-only lookups; spawn purpose-built subagents (`pr-reviewer`, `data-researcher`,
  `seo-auditor`) when they exist.
- **Max thinking tokens:** 10000 routine, 16000 complex (configured via
  `MAX_THINKING_TOKENS` env in `.claude/settings.json`).

## Key commands

| Purpose | Command |
|---|---|
| Install | `npm ci` |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Lint | `npm run lint` |
| Typecheck | `npx tsc --noEmit` |
| Unit tests | `npm run test:eu-ai-act` |
| Validate tool cards | `npm run check-tool-card-data` |
| Validate logos | `npm run check-logo-provenance` |
| Sync logo audit | `npm run check-logo-audit-report` |
| Audit logo report | `npm run report-logo-audit` |
| Generated artifacts sync | `npm run check-generated-artifacts` |
| SEO readiness | `npm run check-seo-readiness` |
| Live performance | `npm run check-live-performance -- <url>` |
| Deploy gate | `npm run check-deploy-readiness` |
| Custom-domain gate | `npm run check-custom-domain-readiness` |
| Publish preview | `npm run publish-preview` |
| Preview health | `npm run check-preview-health` |
| Live smoke test | `npm run smoke-test-live-site -- root https://www.enterpriseai.tools` |
| Full cycle | `npm run test-full-cycle` |
| Open PR | `npm run open-pr` |

## Do NOT

- Hardcode secrets (GitHub PAT, Azure SWA token) anywhere in code or JSON
- Introduce server routes, middleware, `route.ts` handlers, or anything that breaks
  static export
- Use `any` — use `unknown` + type guards (or a parser at the boundary)
- Add `package.json` dependencies for things solvable with the standard lib or
  existing deps
- Add runtime analytics, fonts, or trackers fetched at page load
- Edit `data/*.json` without a verifiable source URL for every affected record
- Rename a tool without preserving its prior name in `aliases` / `formerNames`
- Skip tests for new `lib/` code, or use `test.skip` to bypass failures — fix the
  test or fix the code
- Set `NEXT_PUBLIC_BASE_PATH` for production builds
- Push to `main` directly, or merge a PR whose CI is red
- Assume Next.js APIs from training data — read `node_modules/next/dist/docs/` first
  (per `AGENTS.md`)
- Write comments that just restate the code — reserve comments for non-obvious WHY

## See also

- `AGENTS.md` — Next.js 16 caveat + Radar weekly update SOP
- `README.md` — public project description
- `data/SCHEMA.md` — canonical data contract
- `DEPLOYMENT.md` — Azure SWA deploy and verification
- `CUSTOM_DOMAIN.md` — custom domain wiring
- `AUDIT.md` — open-issue audit log
- `docs/GIT-WORKFLOW.md` — branching, PR, review flow
- `roadmap/README.md` — milestone catalogue
- `CHANGELOG.md` — shipped changes
- `.claude/skills/`, `.claude/rules/`, `.claude/commands/`, `.claude/agents/`
