#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

pass() { echo "PASS $1"; }
fail() { echo "FAIL $1" >&2; exit 1; }

[[ -f CUSTOM_DOMAIN.md ]] || fail "CUSTOM_DOMAIN.md missing"
grep -q 'www.enterpriseai.tools' CUSTOM_DOMAIN.md || fail "custom domain doc must reference www.enterpriseai.tools"
! grep -q 'NEXT_PUBLIC_BASE_PATH=/enterpriseai-tools' CUSTOM_DOMAIN.md || fail "custom domain doc should not reference /enterpriseai-tools subpath deployment"
pass "custom domain docs aligned to root-domain target"

echo "External confirmation still required:"
echo "- Azure Static Web App accepts www.enterpriseai.tools as custom domain"
echo "- DNS records point correctly to Azure"
echo "- live smoke tests pass on https://www.enterpriseai.tools/ after cutover"
