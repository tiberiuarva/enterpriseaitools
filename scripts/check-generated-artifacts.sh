#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

tracked=(public/sitemap.xml public/robots.txt public/updates.xml public/updates-agents.xml public/updates-orchestration.xml public/updates-governance.xml public/updates-assistants.xml public/updates-platforms.xml public/updates-licenses.xml public/eu-ai-act-deadlines.ics public/llms.txt public/llms-full.txt public/data/tools.json public/data/platforms.json public/data/updates.json public/api)

git diff --quiet -- "${tracked[@]}" || {
  echo "FAIL generated SEO artifacts are out of sync with source data/scripts" >&2
  echo "Run: npm run build" >&2
  echo >&2
  git diff -- "${tracked[@]}" >&2 || true
  exit 1
}

# git diff misses brand-new files (e.g. a freshly added api/v1 record) — catch
# untracked artifacts too so nothing generated is left uncommitted.
untracked="$(git status --porcelain --untracked-files=all -- "${tracked[@]}" | grep '^??' || true)"
if [ -n "$untracked" ]; then
  echo "FAIL generated artifacts contain uncommitted new files" >&2
  echo "$untracked" >&2
  echo "Run: git add public/ && commit the regenerated artifacts" >&2
  exit 1
fi

echo "PASS generated SEO artifacts are in sync"
