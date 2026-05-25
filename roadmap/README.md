# Roadmap — milestone catalogue

Staged build plan, one milestone per file. `/build` selects the **first
incomplete** (`[ ]`) milestone below, branches off `main` as
`milestone/<N>-<slug>`, executes it end-to-end, and opens a PR. A milestone
flips to done only when its PR merges.

| Status | Milestone | File |
|---|---|---|
| [~] | 1 — Site-consistency immediate fixes | [`1-immediate-fixes.md`](./1-immediate-fixes.md) |

## Legend

- `[ ]` open — not yet started
- `[~]` in review — PR open, awaiting merge
- `[x]` done — PR merged
