#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PREVIEW_BASE_PATH="${PREVIEW_BASE_PATH:-/enterpriseai-tools}"
PREVIEW_PORT="${PREVIEW_PORT:-3005}"
PREVIEW_HOST="${PREVIEW_HOST:-127.0.0.1}"
PREVIEW_URL="${PREVIEW_URL:-https://n8n-65532.westeurope.cloudapp.azure.com${PREVIEW_BASE_PATH}/}"
LOG_FILE="${PREVIEW_LOG_FILE:-/tmp/enterpriseai-preview.log}"
PID_FILE="${PREVIEW_PID_FILE:-/tmp/enterpriseai-preview.pid}"

export NEXT_PUBLIC_BASE_PATH="$PREVIEW_BASE_PATH"

probe_url() {
  local url="$1"
  local label="$2"
  local attempts="${3:-15}"
  local sleep_seconds="${4:-1}"
  local last_output=""

  for ((attempt = 1; attempt <= attempts; attempt++)); do
    if last_output=$(curl -fsSI "$url" 2>&1); then
      printf '%s\n' "$last_output" | sed -n '1,10p'
      return 0
    fi

    if [[ "$attempt" -lt "$attempts" ]]; then
      sleep "$sleep_seconds"
    fi
  done

  echo "ERROR: $label did not become healthy after ${attempts} attempts: $url" >&2
  printf '%s\n' "$last_output" >&2
  return 1
}

stop_existing_preview() {
  if [[ -f "$PID_FILE" ]]; then
    OLD_PID=$(cat "$PID_FILE" || true)
    if [[ -n "${OLD_PID:-}" ]] && kill -0 "$OLD_PID" 2>/dev/null; then
      kill "$OLD_PID" 2>/dev/null || true

      for _ in {1..5}; do
        if ! kill -0 "$OLD_PID" 2>/dev/null; then
          break
        fi
        sleep 1
      done

      if kill -0 "$OLD_PID" 2>/dev/null; then
        kill -9 "$OLD_PID" 2>/dev/null || true
      fi
    fi
  fi

  pkill -f "scripts/serve-preview.py --host $PREVIEW_HOST --port $PREVIEW_PORT --directory $ROOT_DIR/out --base-path $PREVIEW_BASE_PATH" 2>/dev/null || true
}

echo "==> build preview export with NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH"
npm run build

stop_existing_preview

nohup python3 "$ROOT_DIR/scripts/serve-preview.py" --host "$PREVIEW_HOST" --port "$PREVIEW_PORT" --directory "$ROOT_DIR/out" --base-path "$PREVIEW_BASE_PATH" >"$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"

probe_url "http://$PREVIEW_HOST:$PREVIEW_PORT${PREVIEW_BASE_PATH}/" "local preview"
probe_url "$PREVIEW_URL" "public preview"

echo "preview pid: $NEW_PID"
echo "preview log: $LOG_FILE"
echo "preview url: $PREVIEW_URL"
