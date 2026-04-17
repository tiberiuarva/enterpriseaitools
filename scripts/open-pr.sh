#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/open-pr.sh [options]

Create or update a GitHub pull request for the current branch.

Options:
  --title TITLE         PR title (default: latest commit subject)
  --body BODY           PR body text
  --body-file PATH      Read PR body from file
  --base BRANCH         Base branch (default: main)
  --repo OWNER/REPO     Override repository slug
  --draft               Create PR as draft
  --dry-run             Print payload instead of calling GitHub
  -h, --help            Show this help

Auth sources, in order:
  1. GH_TOKEN
  2. GITHUB_TOKEN
  3. PAT embedded in git remote.origin.url
EOF
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "error: required command not found: $1" >&2
    exit 1
  }
}

json_escape() {
  python3 - <<'PY' "$1"
import json, sys
print(json.dumps(sys.argv[1]))
PY
}

read_file_json() {
  python3 - <<'PY' "$1"
import json, pathlib, sys
print(json.dumps(pathlib.Path(sys.argv[1]).read_text()))
PY
}

require_cmd git
require_cmd curl
require_cmd python3

TITLE=""
BODY=""
BODY_FILE=""
BASE_BRANCH="main"
REPO_SLUG=""
DRAFT=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --title)
      TITLE=${2:?missing value for --title}
      shift 2
      ;;
    --body)
      BODY=${2:?missing value for --body}
      shift 2
      ;;
    --body-file)
      BODY_FILE=${2:?missing value for --body-file}
      shift 2
      ;;
    --base)
      BASE_BRANCH=${2:?missing value for --base}
      shift 2
      ;;
    --repo)
      REPO_SLUG=${2:?missing value for --repo}
      shift 2
      ;;
    --draft)
      DRAFT=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

CURRENT_BRANCH=$(git branch --show-current)
if [[ -z "$CURRENT_BRANCH" ]]; then
  echo "error: not on a named branch" >&2
  exit 1
fi
if [[ "$CURRENT_BRANCH" == "$BASE_BRANCH" ]]; then
  echo "error: refusing to open a PR from base branch '$BASE_BRANCH'" >&2
  exit 1
fi

REMOTE_URL=$(git remote get-url origin)
TOKEN=${GH_TOKEN:-${GITHUB_TOKEN:-}}
if [[ -z "$TOKEN" && "$REMOTE_URL" =~ https://([^@/]+)@github.com/ ]]; then
  TOKEN=${BASH_REMATCH[1]}
fi
if [[ -z "$TOKEN" ]]; then
  echo "error: no GitHub token found (GH_TOKEN, GITHUB_TOKEN, or PAT-backed origin remote required)" >&2
  exit 1
fi

if [[ -z "$REPO_SLUG" ]]; then
  if [[ "$REMOTE_URL" =~ github.com[:/][^/]+/([^/.]+)(\.git)?$ ]]; then
    OWNER=$(basename "$(dirname "${REMOTE_URL%%.git}")")
    REPO=$(basename "${REMOTE_URL%%.git}")
    REPO_SLUG="$OWNER/$REPO"
  elif [[ "$REMOTE_URL" =~ github.com/([^/]+/[^/.]+)(\.git)?$ ]]; then
    REPO_SLUG=${BASH_REMATCH[1]}
  else
    echo "error: unable to infer repository slug from origin: $REMOTE_URL" >&2
    exit 1
  fi
fi

if [[ -n "$BODY_FILE" ]]; then
  if [[ ! -f "$BODY_FILE" ]]; then
    echo "error: body file not found: $BODY_FILE" >&2
    exit 1
  fi
  BODY=$(cat "$BODY_FILE")
fi
if [[ -z "$TITLE" ]]; then
  TITLE=$(git log -1 --pretty=%s)
fi
if [[ -z "$BODY" ]]; then
  BODY=$(cat <<EOF
## Summary
- $(git log --format=%s "origin/$BASE_BRANCH..HEAD" 2>/dev/null | head -n 5 | sed 's/^/- /' | sed '/^- - /!b;s/^- //')

## Validation
- [ ] npm run lint
- [ ] npm run build
EOF
)
fi

TITLE_JSON=$(json_escape "$TITLE")
BODY_JSON=$(json_escape "$BODY")
HEAD_JSON=$(json_escape "$CURRENT_BRANCH")
BASE_JSON=$(json_escape "$BASE_BRANCH")
DRAFT_JSON=$([[ "$DRAFT" == true ]] && echo true || echo false)
PAYLOAD=$(printf '{"title":%s,"head":%s,"base":%s,"body":%s,"draft":%s}' "$TITLE_JSON" "$HEAD_JSON" "$BASE_JSON" "$BODY_JSON" "$DRAFT_JSON")
API="https://api.github.com/repos/$REPO_SLUG/pulls"
AUTH_HEADER="Authorization: Bearer $TOKEN"
ACCEPT_HEADER="Accept: application/vnd.github+json"

EXISTING=$(curl -fsSL -H "$AUTH_HEADER" -H "$ACCEPT_HEADER" "$API?head=$(printf '%s' "$REPO_SLUG" | cut -d/ -f1):$CURRENT_BRANCH&state=open")
EXISTING_NUMBER=$(python3 - <<'PY' "$EXISTING"
import json, sys
items = json.loads(sys.argv[1])
print(items[0]['number'] if items else '')
PY
)

if [[ "$DRY_RUN" == true ]]; then
  echo "repo: $REPO_SLUG"
  echo "api: $API"
  echo "existing_pr: ${EXISTING_NUMBER:-none}"
  echo "$PAYLOAD"
  exit 0
fi

if [[ -n "$EXISTING_NUMBER" ]]; then
  RESULT=$(curl -fsSL -X PATCH -H "$AUTH_HEADER" -H "$ACCEPT_HEADER" "$API/$EXISTING_NUMBER" -d "$PAYLOAD")
  ACTION="updated"
else
  RESULT=$(curl -fsSL -X POST -H "$AUTH_HEADER" -H "$ACCEPT_HEADER" "$API" -d "$PAYLOAD")
  ACTION="created"
fi

python3 - <<'PY' "$RESULT" "$ACTION"
import json, sys
body = json.loads(sys.argv[1])
action = sys.argv[2]
print(f"{action} PR #{body['number']}: {body['html_url']}")
PY
