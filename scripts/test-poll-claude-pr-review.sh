#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POLL_SCRIPT="$SCRIPT_DIR/poll-claude-pr-review.sh"

out1="$($POLL_SCRIPT 44 1 1)"
echo "$out1" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s); if(!j.verdict) process.exit(1);})'

out2="$($POLL_SCRIPT 44 9b3dc54 1 1)"
echo "$out2" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s); if(!j.verdict) process.exit(1);})'

echo "poll helper smoke test passed"
