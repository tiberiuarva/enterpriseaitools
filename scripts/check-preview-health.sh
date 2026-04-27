#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PREVIEW_BASE_PATH="${PREVIEW_BASE_PATH:-/enterpriseai-tools}"
PREVIEW_HOST="${PREVIEW_HOST:-127.0.0.1}"
PREVIEW_PORT="${PREVIEW_PORT:-3005}"
PREVIEW_URL="${PREVIEW_URL:-https://n8n-65532.westeurope.cloudapp.azure.com${PREVIEW_BASE_PATH}/}"
AUTO_HEAL="${AUTO_HEAL_PREVIEW:-0}"
CURL_CONNECT_TIMEOUT="${CURL_CONNECT_TIMEOUT:-5}"
CURL_MAX_TIME="${CURL_MAX_TIME:-15}"
POST_REPUBLISH_ATTEMPTS="${POST_REPUBLISH_ATTEMPTS:-5}"
POST_REPUBLISH_SLEEP_SECONDS="${POST_REPUBLISH_SLEEP_SECONDS:-3}"

check_url() {
  local url="$1"
  local label="$2"
  local expected="${3:-200}"
  local code

  code=$(curl -L -s -o /dev/null -w '%{http_code}' \
    --connect-timeout "$CURL_CONNECT_TIMEOUT" \
    --max-time "$CURL_MAX_TIME" \
    "$url" || true)
  echo "$code $label $url"
  [[ "$code" == "$expected" ]]
}

wait_for_preview() {
  local local_url="$1"
  local public_url="$2"
  local attempt

  for ((attempt = 1; attempt <= POST_REPUBLISH_ATTEMPTS; attempt++)); do
    local local_ok=0
    local public_ok=0

    if check_url "$local_url" "local-preview-after-republish"; then
      local_ok=1
    fi

    if check_url "$public_url" "public-preview-after-republish"; then
      public_ok=1
    fi

    if [[ "$local_ok" -eq 1 && "$public_ok" -eq 1 ]]; then
      echo "Preview healed"
      return 0
    fi

    if [[ "$attempt" -lt "$POST_REPUBLISH_ATTEMPTS" ]]; then
      echo "Preview still settling after republish; retrying (${attempt}/${POST_REPUBLISH_ATTEMPTS})..."
      sleep "$POST_REPUBLISH_SLEEP_SECONDS"
    fi
  done

  echo "Preview heal failed"
  return 1
}

local_ok=0
public_ok=0
local_url="http://${PREVIEW_HOST}:${PREVIEW_PORT}${PREVIEW_BASE_PATH}/"

if check_url "$local_url" "local-preview"; then
  local_ok=1
fi

if check_url "$PREVIEW_URL" "public-preview"; then
  public_ok=1
fi

if [[ "$local_ok" -eq 1 && "$public_ok" -eq 1 ]]; then
  echo "Preview healthy"
  exit 0
fi

if [[ "$AUTO_HEAL" != "1" ]]; then
  echo "Preview unhealthy"
  exit 1
fi

echo "Preview unhealthy; republishing..."
bash "$ROOT_DIR/scripts/publish-preview.sh"

wait_for_preview "$local_url" "$PREVIEW_URL"
