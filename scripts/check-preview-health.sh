#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PREVIEW_BASE_PATH="${PREVIEW_BASE_PATH:-/enterpriseai-tools}"
PREVIEW_HOST="${PREVIEW_HOST:-127.0.0.1}"
PREVIEW_PORT="${PREVIEW_PORT:-3005}"
PREVIEW_URL="${PREVIEW_URL:-https://n8n-65532.westeurope.cloudapp.azure.com${PREVIEW_BASE_PATH}/}"
AUTO_HEAL="${AUTO_HEAL_PREVIEW:-0}"

check_url() {
  local url="$1"
  local label="$2"
  local expected="${3:-200}"
  local code

  code=$(curl -L -s -o /dev/null -w '%{http_code}' "$url" || true)
  echo "$code $label $url"
  [[ "$code" == "$expected" ]]
}

local_ok=0
public_ok=0

if check_url "http://${PREVIEW_HOST}:${PREVIEW_PORT}${PREVIEW_BASE_PATH}/" "local-preview"; then
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

check_url "http://${PREVIEW_HOST}:${PREVIEW_PORT}${PREVIEW_BASE_PATH}/" "local-preview-after-republish"
check_url "$PREVIEW_URL" "public-preview-after-republish"

echo "Preview healed"
