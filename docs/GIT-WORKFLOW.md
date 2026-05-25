# Git workflow

The canonical branching, PR, and review flow for `enterpriseai.tools`. This is
the "full workflow" referenced from `CLAUDE.md`. It mirrors the steps automated
by `/build` and `/radar`, and it is the process the `pr-reviewer` subagent
checks against.

## Trunk-based model

- `main` is the only long-lived branch. **Never commit directly to `main`.**
- All work happens on a short-lived branch, opened off the latest `origin/main`,
  and lands back via a squash-merged PR.
- Production deploys are explicit (`workflow_dispatch` or tag) — never automatic
  on every push to `main`.

## Branch naming

| Kind of work | Branch pattern | Example |
|---|---|---|
| Code milestone | `milestone/<N>-<slug>` | `milestone/1-immediate-fixes` |
| Weekly data update | `content/YYYY-WW-radar` | `content/2026-21-radar` |
| Ad-hoc fix | `fix/<short-description>` | `fix/agents-stale-date` |

Branch off `main`, never off another feature branch:

```bash
git fetch origin main
git checkout -B <branch> origin/main
```

If a branch with the target name already exists, stop and ask before reusing it.

## The loop (every change, every time)

1. **Pick the work.** For code, the next incomplete milestone in
   `roadmap/README.md`; for data, the `/radar` flow. Don't invent scope —
   one milestone = one PR; open a follow-up for drive-by ideas.
2. **Read before you write.** Open every file you'll touch. For any `next/*`
   API, read `node_modules/next/dist/docs/` first (Next.js 16 has breaking
   changes vs. training data — see `AGENTS.md`). For data edits, read
   `data/SCHEMA.md` and `.claude/rules/data-json.md`.
3. **Make the change.** Touch only what the task requires. New `lib/` utilities
   need a colocated `*.test.ts`. Any schema-shape change updates `data/SCHEMA.md`
   in the **same commit**.
4. **Run the local gate.** Run `/ship-check` (see below). Do not push until it is
   green. If a check is red for reasons outside the task's scope and was already
   red on `main`, surface it and stop — never bypass.
5. **Commit.** Conventional-commit prefix (`feat:`, `fix:`, `chore:`,
   `content:`, `test:`, `docs:`, `refactor:`). The body explains **why**, not
   what — the diff already shows what. Stage files by name; never `git add -A`.
6. **Push.** `git push -u origin <branch>`. Retry up to 4 times with 2/4/8/16s
   backoff **on network errors only** — never on validation failures.
7. **Open the PR.** `npm run open-pr` (see below). Base is `main`. The script
   creates the PR, or updates it if one already exists for the branch.
8. **Review.** Spawn the `pr-reviewer` subagent. Cap the loop at **3 rounds**;
   if still red after 3, summarise the blocker for a human and stop. Never
   merge a PR whose CI is red.
9. **Update the roadmap.** Once the PR is open, mark the milestone in-review in
   `roadmap/README.md` (separate commit, same branch). It flips to done only
   when the PR merges. Note: under squash-merge the intermediate "in-review"
   commit is collapsed away — the milestone's *done* state is established by the
   merge itself, so flip `roadmap/README.md` to done in a follow-up on `main`'s
   next branch rather than relying on the squashed commit.

## The local gate — `/ship-check`

`/ship-check` runs every CI gate locally, in CI order, stopping on the first
failure. It mirrors
`.github/workflows/azure-static-web-apps-witty-grass-0a1a9d403.yml`:

```bash
npm run check-logo-provenance
npm run check-logo-audit-report
npm run lint
npx tsc --noEmit
npm run test:eu-ai-act
npm run build
npm run check-generated-artifacts
npm run check-seo-readiness
npm run check-tool-card-data
npm run check-deploy-readiness
```

If `npm run build` regenerates SEO artifacts under `app/` or `public/`, commit
those diffs before pushing — otherwise `check-generated-artifacts` fails on CI
even though it passed locally.

## Opening a PR — `npm run open-pr`

`scripts/open-pr.sh` creates or updates the PR for the current branch:

```bash
npm run open-pr -- --title "fix(updates): unify freshness stamp" --body-file /tmp/pr-body.md
```

- Defaults: base `main`; title from the latest commit subject; a
  Summary/Validation body if none is given.
- Refuses to run from the base branch or a detached HEAD.
- Idempotent: if an open PR already exists for the branch, it's updated (PATCH)
  rather than duplicated.
- Auth, in order: `GH_TOKEN`, `GITHUB_TOKEN`, or a PAT embedded in the `origin`
  remote URL.

In environments without a token on the CLI (e.g. Claude Code on the web), open
the PR via the GitHub MCP tools instead — but only when a PR was explicitly
requested.

## Review — the `pr-reviewer` subagent

`pr-reviewer` runs automatically after `/build` or `/radar` opens a PR. It
checks, every time:

1. **Static-export safety** — no `route.ts`, `middleware.ts`, server actions,
   `next/headers` / `next/cookies` / `force-dynamic`, or runtime third-party
   fetches; `next.config.ts` still exports statically.
2. **Schema compliance** — every changed `data/*.json` record has all required
   fields per `data/SCHEMA.md`; new fields update the schema in the same PR.
3. **Source + license accuracy** — verifiable `sourceUrl` (or `docsUrl` +
   `logoSourceUrl`); license labels match upstream reality (P0).
4. **Canonical naming** — renames preserve `formerNames` / `aliases`.
5. **Tests** — new `lib/` utilities have colocated tests; no `test.skip` /
   `it.only` / commented-out assertions.
6. **Conventions** — conventional-commit prefix, kebab-case files, no `any`,
   no needless new dependencies.
7. **CI parity** — `/ship-check` green locally.

It iterates up to 3 times; if still red, a human is paged.

## Hard rules

- Never push to `main` directly.
- Never merge a PR whose CI is red.
- Never skip hooks (`--no-verify`) or bypass a gate to make it pass.
- Never `git add -A` — stage files by name to avoid committing secrets or
  build artifacts.
- Anything destructive or irreversible (force-push, secret rotation, data
  deletion) → ask a human first.

## See also

- `CLAUDE.md` — architecture principles, CI-gate table, do-not list
- `.claude/commands/build.md` — milestone execution flow (`/build`)
- `.claude/commands/ship-check.md` — the local gate (`/ship-check`)
- `.claude/commands/radar.md` — weekly data update flow (`/radar`)
- `.claude/agents/pr-reviewer.md` — the review subagent
- `roadmap/README.md` — milestone catalogue
