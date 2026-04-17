#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
OUT_DIR=${OUT_DIR:-$ROOT/out}
PREVIEW_ROOT=${PREVIEW_ROOT:-$ROOT/.preview}
RELEASES_DIR="$PREVIEW_ROOT/releases"
CURRENT_LINK="$PREVIEW_ROOT/current"
STAMP=${STAMP:-$(date -u +%Y%m%dT%H%M%SZ)}
RELEASE_DIR="$RELEASES_DIR/$STAMP"
KEEP_RELEASES=${KEEP_RELEASES:-5}

if [[ ! -d "$OUT_DIR" ]]; then
  echo "error: export directory not found: $OUT_DIR" >&2
  exit 1
fi

mkdir -p "$RELEASES_DIR"
rm -rf "$RELEASE_DIR.tmp"
mkdir -p "$RELEASE_DIR.tmp"
cp -a "$OUT_DIR"/. "$RELEASE_DIR.tmp/"
mv "$RELEASE_DIR.tmp" "$RELEASE_DIR"

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK.tmp"
mv -Tf "$CURRENT_LINK.tmp" "$CURRENT_LINK"

echo "published preview release: $RELEASE_DIR"
echo "current preview link: $CURRENT_LINK -> $(readlink -f "$CURRENT_LINK")"

python3 - <<'PY' "$RELEASES_DIR" "$KEEP_RELEASES"
from pathlib import Path
import shutil
import sys
releases_dir = Path(sys.argv[1])
keep = int(sys.argv[2])
releases = sorted([p for p in releases_dir.iterdir() if p.is_dir()])
for old in releases[:-keep]:
    shutil.rmtree(old)
    print(f"pruned old preview release: {old}")
PY
