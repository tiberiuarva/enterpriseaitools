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
grep -Fq 'azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_WITTY_GRASS_0A1A9D403 }}' "$WORKFLOW" || fail "deploy job must use AZURE_STATIC_WEB_APPS_API_TOKEN_WITTY_GRASS_0A1A9D403"
grep -q 'app_location: "out"' "$WORKFLOW" || fail "workflow must point app_location at prebuilt out directory"
grep -q 'output_location: ""' "$WORKFLOW" || fail "workflow must leave output_location empty when uploading prebuilt out"
grep -q 'skip_app_build: true' "$WORKFLOW" || fail "workflow must set skip_app_build: true when uploading prebuilt out"
pass "workflow matches root-domain static export contract"

[[ -x scripts/open-pr.sh ]] || fail "scripts/open-pr.sh missing or not executable"
[[ -x scripts/test-full-cycle.sh ]] || fail "scripts/test-full-cycle.sh missing or not executable"
[[ -x scripts/check-custom-domain-readiness.sh ]] || fail "scripts/check-custom-domain-readiness.sh missing or not executable"
[[ -x scripts/smoke-test-live-site.sh ]] || fail "scripts/smoke-test-live-site.sh missing or not executable"
pass "required repo scripts exist"

npm run check-logo-provenance >/dev/null
npm run check-logo-audit-report >/dev/null
pass "logo provenance and audit-report sync checks pass"

npm run check-color-literals >/dev/null
pass "color-literal check passes (palette is single-sourced in app/globals.css)"

npm run build >/dev/null
[[ -f out/index.html ]] || fail "missing export output after build"
# Azure reads staticwebapp.config.json from the root of the UPLOADED artifact
# (out/), not the repo root. Without this the routing, header and trailing-slash
# rules are silently ignored in production while looking correct in the repo.
# Keep this repo-root source path aligned with scripts/copy-swa-config.mjs.
[[ -f out/staticwebapp.config.json ]] || fail "out/staticwebapp.config.json missing — Azure would ignore staticwebapp.config.json entirely"
diff -q staticwebapp.config.json out/staticwebapp.config.json >/dev/null || fail "out/staticwebapp.config.json differs from the source config"
npm run check-generated-artifacts >/dev/null
pass "static export builds successfully and tracked generated artifacts stay in sync"
pass "Azure config is present in the upload artifact"

echo "External confirmation still required:"
echo "- GitHub Actions secret AZURE_STATIC_WEB_APPS_API_TOKEN_WITTY_GRASS_0A1A9D403 is configured"
echo "- Azure Static Web App is connected to this repo/branch"
echo "- workflow succeeds on main and produces a live deploy"
