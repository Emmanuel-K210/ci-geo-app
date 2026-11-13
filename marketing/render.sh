#!/usr/bin/env bash
# Renders the posters to PNG with headless Chrome.
#   1. npm run build            (the app shown inside the phones)
#   2. npx vite preview --port 4173
#   3. bash marketing/render.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
SITE="$ROOT/dist/_posters"
OUT="$ROOT/marketing/png"
PROFILE="${TMPDIR:-/tmp}/ci-geo-posters"

node "$ROOT/marketing/make-posters.mjs" >/dev/null
mkdir -p "$SITE/fonts" "$OUT"
cp "$ROOT"/marketing/posters/*.html "$ROOT"/marketing/posters/*.css "$ROOT"/marketing/posters/*.js "$SITE/"
node "$ROOT/marketing/make-map.mjs" "$SITE/carte.svg"
for font in space-grotesk/files/space-grotesk-latin-600-normal \
  space-grotesk/files/space-grotesk-latin-700-normal \
  ibm-plex-sans/files/ibm-plex-sans-latin-400-normal \
  ibm-plex-sans/files/ibm-plex-sans-latin-600-normal \
  ibm-plex-mono/files/ibm-plex-mono-latin-500-normal; do
  cp "$ROOT/node_modules/@fontsource/$font.woff2" "$SITE/fonts/"
done

for page in "$ROOT"/marketing/posters/*.html; do
  name="$(basename "$page" .html)"
  size="${name##*-}"
  width="${size%x*}"
  height="${size#*x}"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --user-data-dir="$PROFILE-$name" \
    --window-size="$width,$height" \
    --virtual-time-budget=30000 \
    --screenshot="$OUT/$name.png" \
    "http://localhost:4173/_posters/$name.html" 2>/dev/null
  echo "$OUT/$name.png"
done
