#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"

BASE_PATH_MODE=${BASE_PATH_MODE:-auto}
PUBLIC_PREVIEW_URL=${PUBLIC_PREVIEW_URL:-https://n8n-65532.westeurope.cloudapp.azure.com/enterpriseai-tools/}
WORKFLOW_FILE=.github/workflows/azure-static-web-apps-blue-stone-07d50c303.yml
STATIC_CONFIG=staticwebapp.config.json

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

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "required command not found: $1"
}

require_cmd python3
require_cmd curl

require_file "$WORKFLOW_FILE"
require_file "$STATIC_CONFIG"
require_file package.json

require_contains "$WORKFLOW_FILE" 'npm ci' 'workflow installs dependencies with npm ci'
require_contains "$WORKFLOW_FILE" 'npm run lint' 'workflow runs lint'
require_contains "$WORKFLOW_FILE" 'npm run build' 'workflow runs build'
require_contains "$WORKFLOW_FILE" 'skip_app_build: true' 'workflow uploads prebuilt static export'
require_contains "$WORKFLOW_FILE" 'azure_static_web_apps_api_token' 'workflow expects Azure SWA token secret'
require_contains "$WORKFLOW_FILE" 'NEXT_PUBLIC_BASE_PATH' 'workflow forwards NEXT_PUBLIC_BASE_PATH repo variable'
require_contains "$STATIC_CONFIG" '"rewrite": "/index.html"' 'staticwebapp.config.json has SPA fallback rewrite'

python3 - <<'PY' "$BASE_PATH_MODE"
import json
import pathlib
import sys

mode = sys.argv[1]
pkg = json.loads(pathlib.Path('package.json').read_text())
scripts = pkg.get('scripts', {})
missing = [name for name in ('build', 'lint', 'publish-preview', 'open-pr', 'smoke-test-export', 'smoke-test-live-site') if name not in scripts]
if missing:
    raise SystemExit(f"FAIL package.json missing scripts: {', '.join(missing)}")
print('PASS package.json exposes build/lint/publish-preview/open-pr/smoke-test-export/smoke-test-live-site scripts')

config = json.loads(pathlib.Path('staticwebapp.config.json').read_text())
exclude = set(config.get('navigationFallback', {}).get('exclude', []))
needed = {'/logos/*', '/*.svg', '/*.png', '/*.ico', '/*.json'}
missing_exclude = sorted(needed - exclude)
if missing_exclude:
    raise SystemExit(f"FAIL staticwebapp.config.json missing navigationFallback excludes: {', '.join(missing_exclude)}")
print('PASS staticwebapp.config.json excludes static assets from SPA fallback')

readme = pathlib.Path('README.md').read_text()
if mode == 'subpath':
    if '/enterpriseai-tools' not in readme:
        raise SystemExit('FAIL README missing subpath deployment guidance')
    print('PASS README includes subpath deployment guidance')
elif mode == 'root':
    if 'do **not** set `NEXT_PUBLIC_BASE_PATH`' not in readme:
        raise SystemExit('FAIL README missing root-domain deployment guidance')
    print('PASS README includes root-domain deployment guidance')
else:
    print('PASS README checked in auto mode (root + subpath guidance handled separately)')
PY

if curl -fsSI "$PUBLIC_PREVIEW_URL" >/tmp/enterpriseai-preview-head.$$; then
  head -n 1 /tmp/enterpriseai-preview-head.$$ | sed 's/^/PASS public preview status: /'
  rm -f /tmp/enterpriseai-preview-head.$$
else
  rm -f /tmp/enterpriseai-preview-head.$$ || true
  fail "public preview is not reachable: $PUBLIC_PREVIEW_URL"
fi

cat <<'EOF'
WARN external checks still require GitHub/Azure access:
WARN - GitHub repo secret AZURE_STATIC_WEB_APPS_API_TOKEN exists
WARN - GitHub repo variable NEXT_PUBLIC_BASE_PATH is unset for root-domain deploys (or set to /enterpriseai-tools for subpath deploys)
WARN - Azure Static Web App is connected to this repository and branch
WARN - enterpriseai.tools DNS/CNAME/TXT records are configured in Azure for the custom domain
EOF
