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

for path in /robots.txt /sitemap.xml /social-preview.png; do
  url="${BASE_URL}${path}"
  check_200 "$url" || { echo "FAIL $url"; exit 1; }
  echo "PASS $url"
done

# staticwebapp.config.json only takes effect if it reached the upload artifact.
# A non-slash page route must 301 to its canonical trailing-slash form; if it
# returns 200 instead, the config is not deployed and every rule in it is inert.
check_redirect() {
  local url="$1"
  local expected_suffix="$2"
  local code location
  IFS=$'\t' read -r code location < <(
    curl -s -o /dev/null -w $'%{http_code}\t%{redirect_url}' "$url"
  )
  [[ "$code" == "301" && "$location" == *"$expected_suffix" ]]
}

for path in /platforms /agents; do
  url="${BASE_URL}${path}"
  check_redirect "$url" "${path}/" || {
    echo "FAIL $url did not 301 to ${path}/ — staticwebapp.config.json is not being applied"
    exit 1
  }
  echo "PASS $url -> ${path}/"
done

# The same config must NOT rewrite non-HTML assets; that is why trailingSlash is
# "auto" rather than "always". Guard it, because breaking the feeds or the open
# data API would be invisible until a consumer complained.
for path in /updates.xml /api/v1/index.json /llms.txt; do
  url="${BASE_URL}${path}"
  code=$(curl -s -o /dev/null -w '%{http_code}' "$url")
  [[ "$code" == "200" ]] || { echo "FAIL $url returned $code, expected a direct 200"; exit 1; }
  echo "PASS $url (not redirected)"
done

echo "Live smoke test passed for ${BASE_URL}"
