---
description: Execute the next incomplete roadmap milestone end-to-end (branch → code → test → PR).
argument-hint: "[optional milestone number or slug]"
---

# /build — Milestone execution flow

You are running the canonical build loop for this repo. Follow it exactly.

## 1. Pick the milestone

- If `$ARGUMENTS` is provided, locate the matching milestone in `roadmap/` (by
  leading number or slug).
- Otherwise, read `roadmap/README.md` and select the **first incomplete**
  milestone (look for the unchecked `[ ]` entry).
- If nothing is open, stop and tell the user — do not invent work.

State which milestone you picked in one sentence before doing anything else.

## 2. Branch off main

```
git fetch origin main
git checkout -B milestone/<N>-<slug> origin/main
```

Never branch off another feature branch. Never reuse an existing branch — if one
exists with the same name, ask the user before continuing.

## 3. Read before you write

- Open the milestone file end-to-end (do not skim).
- Open every file the milestone touches.
- For any Next.js API you'll use, **read `node_modules/next/dist/docs/` first**
  (per `AGENTS.md` — Next.js 16 has breaking changes vs. training data).
- For data edits, read `data/SCHEMA.md` and the `.claude/rules/data-json.md` rule.
- Spawn `Explore` for multi-file research instead of reading speculatively.

## 4. Execute

- One milestone = one PR. Resist scope creep — open a follow-up milestone for
  drive-by ideas.
- Touch only the files the milestone requires.
- For data-only changes, prefer the `/radar` flow instead.
- If the milestone needs new utilities under `lib/`, write a colocated `*.test.ts`
  using the Node test runner.
- Update `data/SCHEMA.md` in the **same commit** as any schema-shape change.

## 5. Local gate (mandatory before push)

Run `/ship-check`. Do not push if any step fails — fix and re-run. If a check is
genuinely outside the milestone's scope and was already red on `main`, surface it
to the user and stop; do not silently bypass.

## 6. Commit + PR

- Conventional commit (`feat:`, `fix:`, `chore:`, `content:`, `test:`, `docs:`,
  `refactor:`).
- Body explains **why**, not what — the diff already shows what.
- Push with `git push -u origin <branch>` (retry up to 4 times with 2/4/8/16s
  backoff on network errors only — never on validation errors).
- Open the PR with `npm run open-pr` if it accepts your args; otherwise create
  via GitHub MCP only if the user explicitly asked for a PR.

## 7. Review loop

After the PR exists, spawn the `pr-reviewer` subagent. Cap the review loop at
**3 iterations**. If it's still red after 3 rounds, summarise the blocker for
the user and stop — do not keep guessing.

## 8. Update the roadmap

Once the PR is open, mark the milestone as in-review in `roadmap/README.md` in a
separate commit on the same branch. The milestone flips to done only when the
PR merges.

## Stop conditions

- No open milestone → stop.
- Local gate fails for reasons outside scope → stop, report.
- Review loop hits 3 iterations → stop, summarise.
- Anything destructive or irreversible required (e.g. force-push, secret
  rotation, data deletion) → ask the user first.
