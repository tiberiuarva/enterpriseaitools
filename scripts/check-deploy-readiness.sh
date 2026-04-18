#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

fail() {
  echo "FAIL $1" >&2
  exit 1
}

pass() {
  echo "PASS $1"
}

WORKFLOW=".github/workflows/azure-static-web-apps-witty-grass-0a1a9d403.yml"
[[ -f "$WORKFLOW" ]] || fail "workflow file missing: $WORKFLOW"
grep -q 'azure_static_web_apps_api_token: .*AZURE_STATIC_WEB_APPS_API_TOKEN' "$WORKFLOW" || fail "workflow must use AZURE_STATIC_WEB_APPS_API_TOKEN"
grep -q 'output_location: "out"' "$WORKFLOW" || fail "workflow must upload prebuilt out directory"
grep -q 'skip_app_build: true' "$WORKFLOW" || fail "workflow must set skip_app_build: true when uploading prebuilt out"
pass "workflow matches root-domain static export contract"

[[ -x scripts/open-pr.sh ]] || fail "scripts/open-pr.sh missing or not executable"
[[ -x scripts/test-full-cycle.sh ]] || fail "scripts/test-full-cycle.sh missing or not executable"
[[ -x scripts/check-custom-domain-readiness.sh ]] || fail "scripts/check-custom-domain-readiness.sh missing or not executable"
[[ -x scripts/smoke-test-live-site.sh ]] || fail "scripts/smoke-test-live-site.sh missing or not executable"
pass "required repo scripts exist"

npm run build >/dev/null
[[ -f out/index.html ]] || fail "missing export output after build"
pass "static export builds successfully"

echo "External confirmation still required:"
echo "- GitHub Actions secret AZURE_STATIC_WEB_APPS_API_TOKEN is configured"
echo "- Azure Static Web App is connected to this repo/branch"
echo "- workflow succeeds on main and produces a live deploy"
