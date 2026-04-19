#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"

BASE_BRANCH=${BASE_BRANCH:-main}
PUBLIC_PREVIEW_URL=${PUBLIC_PREVIEW_URL:-https://n8n-65532.westeurope.cloudapp.azure.com/enterpriseai-tools/}
PR_TITLE=${PR_TITLE:-"chore: verify enterpriseai.tools automation cycle"}
PR_BODY_FILE=${PR_BODY_FILE:-.tmp/full-cycle-pr-body.md}
SUMMARY_FILE=${SUMMARY_FILE:-.tmp/full-cycle-summary.md}
DRY_RUN=${DRY_RUN:-1}

mkdir -p .tmp

CURRENT_BRANCH=$(git branch --show-current)
if [[ -z "$CURRENT_BRANCH" ]]; then
  echo "error: not on a named branch" >&2
  exit 1
fi
if [[ "$CURRENT_BRANCH" == "$BASE_BRANCH" ]]; then
  echo "error: switch to a feature branch before running the full-cycle test" >&2
  exit 1
fi

CHANGES=$(git diff --stat --cached HEAD 2>/dev/null || true)
WORKTREE=$(git diff --stat 2>/dev/null || true)
COMMITS=$(git log --oneline "origin/$BASE_BRANCH..HEAD" 2>/dev/null || git log --oneline -n 10)

cat > "$SUMMARY_FILE" <<EOF
# Full-cycle verification summary

## Branch
- head: $CURRENT_BRANCH
- base: $BASE_BRANCH

## Commits ahead of base
\`\`\`
$COMMITS
\`\`\`

## Working tree diff
\`\`\`
${WORKTREE:-clean}
\`\`\`

## Staged diff
\`\`\`
${CHANGES:-clean}
\`\`\`
EOF

cat > "$PR_BODY_FILE" <<EOF
## Summary
- verify lint/build/preview health
- verify PR creation path via repo-local helper
- keep automation path reviewable and scriptable

## Validation
- [x] npm run check-logo-provenance
- [x] npm run lint
- [x] npm run build
- [x] public preview returns HTTP 200
- [x] PR helper dry-run returns valid payload

## Notes
- This script runs in dry-run mode by default and does not create or merge a PR.
EOF

echo "==> npm run check-logo-provenance"
npm run check-logo-provenance

echo "==> npm run lint"
npm run lint

echo "==> npm run build"
npm run build

echo "==> publish stable preview"
npm run publish-preview

echo "==> preview health"
curl -fsSI "$PUBLIC_PREVIEW_URL" | sed -n '1,10p'

echo "==> PR dry run"
if [[ "$DRY_RUN" == "1" ]]; then
  bash scripts/open-pr.sh --title "$PR_TITLE" --body-file "$PR_BODY_FILE" --dry-run
else
  bash scripts/open-pr.sh --title "$PR_TITLE" --body-file "$PR_BODY_FILE"
fi

echo "==> done"
echo "summary: $SUMMARY_FILE"
