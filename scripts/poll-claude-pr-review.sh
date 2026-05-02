#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "usage: $0 <pr-number> [head-sha-or-timeout-seconds] [timeout-seconds] [interval-seconds]" >&2
}

if [[ $# -lt 1 ]]; then
  usage
  exit 2
fi

PR_NUMBER="$1"
ARG2="${2:-}"
ARG3="${3:-}"
ARG4="${4:-}"
REPO="tiberiuarva/enterpriseaitools"
DEFAULT_TOKEN_FILE="/home/n8nadmin/.openclaw/credentials/github-radar"
TOKEN_FILE="${POLL_CLAUDE_TOKEN_FILE:-$DEFAULT_TOKEN_FILE}"

if [[ ! "$PR_NUMBER" =~ ^[0-9]+$ ]]; then
  echo "pr-number must be numeric: $PR_NUMBER" >&2
  exit 2
fi

HEAD_SHA=""
TIMEOUT_SECONDS="900"
INTERVAL_SECONDS="30"

if [[ -n "$ARG2" ]]; then
  if [[ "$ARG2" =~ ^[0-9]+$ ]]; then
    TIMEOUT_SECONDS="$ARG2"
    [[ -n "$ARG3" ]] && INTERVAL_SECONDS="$ARG3"
  else
    HEAD_SHA="$ARG2"
    [[ -n "$ARG3" ]] && TIMEOUT_SECONDS="$ARG3"
    [[ -n "$ARG4" ]] && INTERVAL_SECONDS="$ARG4"
  fi
fi

if [[ ! "$TIMEOUT_SECONDS" =~ ^[0-9]+$ ]]; then
  echo "timeout-seconds must be numeric: $TIMEOUT_SECONDS" >&2
  exit 2
fi

if [[ ! "$INTERVAL_SECONDS" =~ ^[0-9]+$ ]]; then
  echo "interval-seconds must be numeric: $INTERVAL_SECONDS" >&2
  exit 2
fi

if [[ -n "${GH_TOKEN:-}" ]]; then
  export GH_TOKEN
elif [[ -f "$TOKEN_FILE" ]]; then
  GH_TOKEN="$(cat "$TOKEN_FILE")"
  export GH_TOKEN
else
  echo "missing GitHub token: set GH_TOKEN or provide $TOKEN_FILE" >&2
  exit 1
fi

export HEAD_SHA_FILTER="$HEAD_SHA"

fetch_comments() {
  if [[ -n "${POLL_CLAUDE_COMMENTS_FILE:-}" ]]; then
    cat "$POLL_CLAUDE_COMMENTS_FILE"
  else
    curl -fsSL \
      -H "Authorization: Bearer $GH_TOKEN" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$REPO/issues/$PR_NUMBER/comments?per_page=100"
  fi
}

extract_latest() {
  JSON_INPUT="$1" node -e '
const comments = JSON.parse(process.env.JSON_INPUT || "[]");
const headSha = (process.env.HEAD_SHA_FILTER || "").toLowerCase();
const hits = comments
  .filter(c => {
    const body = c.body || "";
    if (!/claude code/i.test(body)) return false;
    return !headSha || body.toLowerCase().includes(headSha);
  })
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
if (hits.length) {
  const c = hits[0];
  const body = (c.body || "").replace(/\r/g, "");
  const verdict = /NOT GREEN|NEEDS WORK|BLOCKER/i.test(body)
    ? "NOT_GREEN"
    : /\bGREEN\b/i.test(body)
      ? "GREEN"
      : "COMMENT";
  process.stdout.write(JSON.stringify({id:c.id, verdict, created_at:c.created_at, url:c.html_url}));
}
'
}

end_ts=$(( $(date +%s) + TIMEOUT_SECONDS ))
initial_id=""

if json="$(fetch_comments 2>/dev/null)"; then
  initial_latest="$(extract_latest "$json")"
  if [[ -n "$initial_latest" ]]; then
    initial_id="$(printf '%s' "$initial_latest" | node -e 'const fs=require("fs"); const obj=JSON.parse(fs.readFileSync(0,"utf8")); process.stdout.write(String(obj.id));')"
    if [[ -n "${POLL_CLAUDE_COMMENTS_FILE:-}" ]]; then
      printf '%s\n' "$initial_latest"
      exit 0
    fi
  fi
fi

while [[ $(date +%s) -lt $end_ts ]]; do
  if ! json="$(fetch_comments 2>/dev/null)"; then
    sleep "$INTERVAL_SECONDS"
    continue
  fi

  latest="$(extract_latest "$json")"

  if [[ -n "$latest" ]]; then
    id="$(printf '%s' "$latest" | node -e 'const fs=require("fs"); const obj=JSON.parse(fs.readFileSync(0,"utf8")); process.stdout.write(String(obj.id));')"
    if [[ -z "$initial_id" || "$id" != "$initial_id" ]]; then
      printf '%s\n' "$latest"
      exit 0
    fi
  fi

  sleep "$INTERVAL_SECONDS"
done

echo '{"status":"timeout"}'
