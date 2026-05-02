#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POLL_SCRIPT="$SCRIPT_DIR/poll-claude-pr-review.sh"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

export GH_TOKEN="test-token"

cat > "$TMP_DIR/not-green.json" <<'JSON'
[
  {
    "id": 101,
    "created_at": "2026-05-02T09:04:20Z",
    "html_url": "https://example.test/pr/45#comment-101",
    "body": "## Claude Code Review — PR #45 @ `c9c1aa6`\n\n### Verdict: NOT GREEN — one functional bug plus a few correctness issues worth addressing before merge.\n"
  }
]
JSON

cat > "$TMP_DIR/green.json" <<'JSON'
[
  {
    "id": 202,
    "created_at": "2026-05-02T09:10:00Z",
    "html_url": "https://example.test/pr/46#comment-202",
    "body": "## Claude Code Review — PR #46 @ `abcdef1`\n\n### Verdict: GREEN\n\nLooks good.\n"
  }
]
JSON

out1="$(POLL_CLAUDE_COMMENTS_FILE="$TMP_DIR/not-green.json" "$POLL_SCRIPT" 45 c9c1aa6 1 1)"
echo "$out1" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s); if(j.verdict!=="NOT_GREEN") process.exit(1);})'

out2="$(POLL_CLAUDE_COMMENTS_FILE="$TMP_DIR/green.json" "$POLL_SCRIPT" 46 abcdef1 1 1)"
echo "$out2" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s); if(j.verdict!=="GREEN") process.exit(1);})'

echo "poll helper smoke test passed"
