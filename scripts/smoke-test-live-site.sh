#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"

MODE=${1:-${DEPLOY_MODE:-subpath}}
SITE_URL=${SITE_URL:-}
CANONICAL_SITE_URL=${CANONICAL_SITE_URL:-https://enterpriseai.tools}
PREVIEW_BASE_PATH=${PREVIEW_BASE_PATH:-/enterpriseai-tools}
LOGO_PATH=${LOGO_PATH:-/logos/microsoft-foundry.svg}
SOCIAL_PREVIEW_PATH=${SOCIAL_PREVIEW_PATH:-/social-preview.png}

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

trim_trailing_slash() {
  local value=$1
  value=${value%/}
  printf '%s' "$value"
}

require_cmd curl
require_cmd python3

case "$MODE" in
  root)
    EXPECTED_BASE_PATH=""
    if [[ -z "$SITE_URL" ]]; then
      SITE_URL="$CANONICAL_SITE_URL"
    fi
    ;;
  subpath)
    EXPECTED_BASE_PATH="$PREVIEW_BASE_PATH"
    if [[ -z "$SITE_URL" ]]; then
      SITE_URL="https://n8n-65532.westeurope.cloudapp.azure.com$PREVIEW_BASE_PATH"
    fi
    ;;
  *)
    fail "unsupported mode '$MODE' (expected: root or subpath)"
    ;;
esac

SITE_URL=$(trim_trailing_slash "$SITE_URL")
CANONICAL_SITE_URL=$(trim_trailing_slash "$CANONICAL_SITE_URL")

python3 - <<'PY' "$MODE" "$SITE_URL" "$CANONICAL_SITE_URL" "$EXPECTED_BASE_PATH" "$LOGO_PATH" "$SOCIAL_PREVIEW_PATH"
import sys
import urllib.request
from html.parser import HTMLParser

mode, site_url, canonical_site_url, expected_base_path, logo_path, social_preview_path = sys.argv[1:7]

class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonical = None
        self.links = []
        self.images = []

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        if tag == 'link':
            href = attr.get('href')
            if href:
                self.links.append(href)
            if attr.get('rel') == 'canonical':
                self.canonical = href
        elif tag in ('img', 'script'):
            src = attr.get('src')
            if src:
                self.images.append(src)

routes = ['/', '/platforms/', '/agents/', '/updates/']
asset_paths = [logo_path, social_preview_path, '/robots.txt', '/sitemap.xml']

seen_html = {}

for route in routes:
    url = site_url + route
    req = urllib.request.Request(url, headers={'User-Agent': 'enterpriseai-smoke-test/1.0'})
    with urllib.request.urlopen(req, timeout=30) as response:
        status = getattr(response, 'status', response.getcode())
        if status != 200:
            raise SystemExit(f'FAIL {url} returned HTTP {status}')
        content_type = response.headers.get('Content-Type', '')
        if 'text/html' not in content_type:
            raise SystemExit(f'FAIL {url} did not return HTML (got {content_type})')
        seen_html[route] = response.read().decode('utf-8', errors='ignore')
    print(f'PASS {url} returned HTTP 200 HTML')

for path in asset_paths:
    url = site_url + path
    req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'enterpriseai-smoke-test/1.0'})
    with urllib.request.urlopen(req, timeout=30) as response:
        status = getattr(response, 'status', response.getcode())
        if status != 200:
            raise SystemExit(f'FAIL asset {url} returned HTTP {status}')
    print(f'PASS asset {url} returned HTTP 200')

platforms_html = seen_html['/platforms/']
parser = HeadParser()
parser.feed(platforms_html)
expected_canonical = canonical_site_url + '/platforms/'
if parser.canonical != expected_canonical:
    raise SystemExit(f'FAIL canonical mismatch for /platforms/ (expected {expected_canonical}, got {parser.canonical})')
print(f'PASS canonical URL for /platforms/ is {expected_canonical}')

combined = '\n'.join(seen_html.values())
if mode == 'root':
    forbidden = ['/enterpriseai-tools/', '"/enterpriseai-tools', "'/enterpriseai-tools"]
    found = [needle for needle in forbidden if needle in combined]
    if found:
        raise SystemExit('FAIL root deployment still leaks preview subpath references: ' + ', '.join(found))
    print('PASS root deployment does not leak preview subpath references')
else:
    required = [
        f'{expected_base_path}/_next/',
        f'{expected_base_path}/logos/',
    ]
    missing = [needle for needle in required if needle not in combined]
    if missing:
        raise SystemExit('FAIL subpath deployment missing expected prefixed asset references: ' + ', '.join(missing))
    print(f'PASS subpath deployment includes expected {expected_base_path} asset references')
PY

pass "live site smoke test completed for $MODE mode at $SITE_URL"
