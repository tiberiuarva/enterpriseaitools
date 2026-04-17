#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"

PUBLIC_PREVIEW_URL=${PUBLIC_PREVIEW_URL:-https://n8n-65532.westeurope.cloudapp.azure.com/enterpriseai-tools/}
WORKFLOW_FILE=.github/workflows/azure-static-web-apps-blue-stone-07d50c303.yml
NEXT_CONFIG=next.config.ts

pass() {
  printf 'PASS %s\n' "$1"
}

warn() {
  printf 'WARN %s\n' "$1"
}

fail() {
  printf 'FAIL %s\n' "$1"
  exit 1
}

require_file() {
  local path=$1
  [[ -f "$path" ]] || fail "missing required file: $path"
  pass "found $path"
}

require_contains() {
  local path=$1
  local needle=$2
  local label=$3
  grep -Fq "$needle" "$path" || fail "$label (expected '$needle' in $path)"
  pass "$label"
}

require_not_contains() {
  local path=$1
  local needle=$2
  local label=$3
  if grep -Fq "$needle" "$path"; then
    fail "$label (unexpected '$needle' in $path)"
  fi
  pass "$label"
}

command -v python3 >/dev/null 2>&1 || fail "required command not found: python3"
command -v curl >/dev/null 2>&1 || fail "required command not found: curl"

require_file README.md
require_file DEPLOYMENT.md
require_file CUSTOM_DOMAIN.md
require_file scripts/smoke-test-export.sh
require_file scripts/smoke-test-live-site.sh
require_file "$WORKFLOW_FILE"
require_file "$NEXT_CONFIG"

require_contains README.md 'do **not** set `NEXT_PUBLIC_BASE_PATH`' 'README documents root-domain deploy without NEXT_PUBLIC_BASE_PATH'
require_contains DEPLOYMENT.md 'Custom domain (`enterpriseai.tools`)' 'DEPLOYMENT.md includes custom domain section'
require_contains CUSTOM_DOMAIN.md 'npm run check-custom-domain-readiness' 'CUSTOM_DOMAIN.md documents the custom-domain readiness command'
require_contains CUSTOM_DOMAIN.md 'npm run smoke-test-export -- root' 'CUSTOM_DOMAIN.md documents the root export smoke test'
require_contains CUSTOM_DOMAIN.md 'npm run smoke-test-live-site -- root' 'CUSTOM_DOMAIN.md documents the root live-site smoke test'
require_contains "$WORKFLOW_FILE" 'azure_static_web_apps_api_token' 'workflow expects Azure SWA token secret'
require_contains "$WORKFLOW_FILE" 'NEXT_PUBLIC_BASE_PATH' 'workflow can forward NEXT_PUBLIC_BASE_PATH when explicitly set'
require_contains "$NEXT_CONFIG" 'process.env.NEXT_PUBLIC_BASE_PATH' 'next.config.ts reads NEXT_PUBLIC_BASE_PATH from the environment'

python3 - <<'PY'
from pathlib import Path
text = Path('CUSTOM_DOMAIN.md').read_text()
required = [
    'GitHub repo configuration',
    'Azure Static Web Apps configuration',
    'DNS changes',
    'Post-validation checks',
]
missing = [item for item in required if item not in text]
if missing:
    raise SystemExit(f"FAIL CUSTOM_DOMAIN.md missing sections: {', '.join(missing)}")
print('PASS CUSTOM_DOMAIN.md contains operator handoff sections')
PY

if curl -fsSI "$PUBLIC_PREVIEW_URL" >/tmp/enterpriseai-custom-domain-preview-head.$$; then
  head -n 1 /tmp/enterpriseai-custom-domain-preview-head.$$ | sed 's/^/PASS public preview status: /'
  rm -f /tmp/enterpriseai-custom-domain-preview-head.$$
else
  rm -f /tmp/enterpriseai-custom-domain-preview-head.$$ || true
  fail "public preview is not reachable: $PUBLIC_PREVIEW_URL"
fi

cat <<'EOF'
WARN external checks still require Azure/DNS operator access:
WARN - GitHub repo variable NEXT_PUBLIC_BASE_PATH must be unset for root-domain production
WARN - Azure Static Web App must accept enterpriseai.tools as a validated custom domain
WARN - DNS records must match the exact Azure-issued verification/mapping instructions
WARN - live root-domain smoke tests must be run after cutover
EOF
