#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-root}"
shift || true

if [[ "$MODE" != "root" ]]; then
  echo "Only root-domain smoke testing is supported now. Use: npm run smoke-test-live-site -- root [BASE_URL]" >&2
  exit 1
fi

BASE_URL="${1:-https://www.enterpriseai.tools}"

check_html() {
  local url="$1"
  local body
  body=$(curl -fsSL "$url") || return 1
  grep -qi '<html' <<<"$body"
}

check_200() {
  local url="$1"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' "$url")
  [[ "$code" == "200" ]]
}

for path in / /platforms/ /agents/ /updates/; do
  url="${BASE_URL}${path}"
  check_200 "$url" || { echo "FAIL $url"; exit 1; }
  check_html "$url" || { echo "FAIL non-html $url"; exit 1; }
  echo "PASS $url"
done

for path in /robots.txt /sitemap.xml /social-preview.svg; do
  url="${BASE_URL}${path}"
  check_200 "$url" || { echo "FAIL $url"; exit 1; }
  echo "PASS $url"
done

echo "Live smoke test passed for ${BASE_URL}"
