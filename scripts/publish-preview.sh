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

echo "==> build preview export with NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH"
npm run build

if [[ -f "$PID_FILE" ]]; then
  OLD_PID=$(cat "$PID_FILE" || true)
  if [[ -n "${OLD_PID:-}" ]] && kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" 2>/dev/null || true
    sleep 1
  fi
fi

pkill -f "scripts/serve-preview.py --host $PREVIEW_HOST --port $PREVIEW_PORT --directory $ROOT_DIR/out --base-path $PREVIEW_BASE_PATH" 2>/dev/null || true

nohup python3 "$ROOT_DIR/scripts/serve-preview.py" --host "$PREVIEW_HOST" --port "$PREVIEW_PORT" --directory "$ROOT_DIR/out" --base-path "$PREVIEW_BASE_PATH" >"$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"
sleep 2

curl -fsSI "http://$PREVIEW_HOST:$PREVIEW_PORT${PREVIEW_BASE_PATH}/" | sed -n '1,10p'
curl -fsSI "$PREVIEW_URL" | sed -n '1,10p'

echo "preview pid: $NEW_PID"
echo "preview log: $LOG_FILE"
echo "preview url: $PREVIEW_URL"
