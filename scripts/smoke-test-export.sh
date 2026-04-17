#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"

MODE=${1:-${BASE_PATH_MODE:-root}}
PREVIEW_BASE_PATH=${PREVIEW_BASE_PATH:-/enterpriseai-tools}
SITE_URL=${SITE_URL:-https://enterpriseai.tools}
OUTPUT_DIR=${OUTPUT_DIR:-out}

pass() {
  printf 'PASS %s\n' "$1"
}

fail() {
  printf 'FAIL %s\n' "$1"
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "required command not found: $1"
}

require_file() {
  local path=$1
  [[ -f "$path" ]] || fail "missing required file: $path"
  pass "found $path"
}

case "$MODE" in
  root)
    EXPECTED_BASE_PATH=""
    ;;
  subpath)
    EXPECTED_BASE_PATH="$PREVIEW_BASE_PATH"
    ;;
  *)
    fail "unsupported mode '$MODE' (expected: root or subpath)"
    ;;
esac

require_cmd python3
require_cmd npm
require_file package.json

wait_for_next_build_slot() {
  local lock_path=.next/lock
  local waited=0
  while pgrep -f '/repo/node_modules/.bin/next build' >/dev/null 2>&1; do
    if (( waited == 0 )); then
      printf 'INFO waiting for existing next build to finish\n'
    fi
    sleep 2
    waited=$((waited + 2))
    if (( waited >= 120 )); then
      fail 'timed out waiting for existing next build to finish'
    fi
  done

  if [[ -f "$lock_path" ]]; then
    rm -f "$lock_path"
    pass 'cleared stale .next/lock before build'
  fi
}

wait_for_next_build_slot
rm -rf "$OUTPUT_DIR"
if [[ "$MODE" == "subpath" ]]; then
  NEXT_PUBLIC_BASE_PATH="$EXPECTED_BASE_PATH" npm run build >/tmp/enterpriseai-build-$MODE.log 2>&1 || {
    cat /tmp/enterpriseai-build-$MODE.log
    fail "build failed in $MODE mode"
  }
else
  env -u NEXT_PUBLIC_BASE_PATH npm run build >/tmp/enterpriseai-build-$MODE.log 2>&1 || {
    cat /tmp/enterpriseai-build-$MODE.log
    fail "build failed in $MODE mode"
  }
fi
pass "build succeeded in $MODE mode"

python3 - <<'PY' "$MODE" "$EXPECTED_BASE_PATH" "$SITE_URL" "$OUTPUT_DIR"
from pathlib import Path
import sys

mode, expected_base_path, site_url, output_dir = sys.argv[1:5]
site_url = site_url.rstrip('/')
out = Path(output_dir)

required_files = [
    out / 'index.html',
    out / 'platforms' / 'index.html',
    out / 'agents' / 'index.html',
    out / 'updates' / 'index.html',
]
for path in required_files:
    if not path.is_file():
        raise SystemExit(f'FAIL missing exported file: {path}')
print(f'PASS expected routes exported in {mode} mode')

home = (out / 'index.html').read_text()
platforms = (out / 'platforms' / 'index.html').read_text()
updates = (out / 'updates' / 'index.html').read_text()
combined = '\n'.join([home, platforms, updates])

expected_canonical = f'{site_url}/platforms/'
if expected_canonical not in platforms:
    raise SystemExit(f'FAIL canonical URL mismatch in platforms export (expected {expected_canonical})')
print(f'PASS canonical URLs point at {site_url} in {mode} mode')

if mode == 'root':
    forbidden = ['/enterpriseai-tools/', '"/enterpriseai-tools', "'/enterpriseai-tools"]
    found = [needle for needle in forbidden if needle in combined]
    if found:
        raise SystemExit('FAIL root export still contains preview subpath references: ' + ', '.join(found))
    print('PASS root export does not contain preview subpath references')
else:
    required = [
        f'{expected_base_path}/logos/',
        f'{expected_base_path}/updates',
        f'{expected_base_path}/platforms',
    ]
    missing = [needle for needle in required if needle not in combined]
    if missing:
        raise SystemExit('FAIL subpath export missing expected prefixed URLs: ' + ', '.join(missing))
    print(f'PASS subpath export contains expected {expected_base_path} URL prefixes')
PY

rm -f /tmp/enterpriseai-build-$MODE.log
pass "smoke test completed for $MODE mode"