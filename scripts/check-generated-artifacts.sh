#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

tracked=(public/sitemap.xml public/robots.txt public/updates.xml public/llms.txt public/llms-full.txt public/data/tools.json public/data/platforms.json public/data/updates.json)

git diff --quiet -- "${tracked[@]}" || {
  echo "FAIL generated SEO artifacts are out of sync with source data/scripts" >&2
  echo "Run: npm run build" >&2
  echo >&2
  git diff -- "${tracked[@]}" >&2 || true
  exit 1
}

echo "PASS generated SEO artifacts are in sync"
