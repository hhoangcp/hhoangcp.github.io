#!/bin/bash
# Build site với cơ chế render công thức (đọc env, có giá trị mặc định):
#   MATH_ENGINE=mathjax (mặc định) | katex
#   MATH_CLIENT=1 (client-side) | 0 (server-side)
#   Mặc định mỗi engine: mathjax -> client-side (tex-svg.js CDN, HTML nhỏ),
#   katex -> server-side (rehype-katex).
# Nếu dist KaTeX server-side vượt ngưỡng dung lượng thì tự build lại ở chế độ
# KaTeX client-side (auto-render CDN) — xem MATH_CLIENT trong astro.config.mjs.
set -e
# Ngưỡng chỉ nên kích hoạt khi GẦN giới hạn thật của GitHub Pages (1 GB soft limit):
# HTML KaTeX render sẵn gzip còn ~10%, 100–200 bài nữa cũng chỉ ~150–250 MB raw.
THRESHOLD_MB=300
ENGINE="${MATH_ENGINE:-mathjax}"
if [ -z "$MATH_CLIENT" ]; then
    if [ "$ENGINE" = "mathjax" ]; then MATH_CLIENT=1; else MATH_CLIENT=0; fi
fi
MODE="${ENGINE}-$([ "$MATH_CLIENT" = "1" ] && echo client || echo server)"

cd "$(dirname "$0")/.."

# Cache content-layer của Astro (node_modules/.astro) KHÔNG keyed theo processor
# (engine + client/server) — đổi chế độ mà giữ cache sẽ tái dùng HTML cũ.
# Đánh dấu chế độ vào cache và xoá khi khác.
CACHE_DIR="node_modules/.astro"
MARKER="$CACHE_DIR/.math-engine"
if [ ! -f "$MARKER" ] || [ "$(cat "$MARKER" 2>/dev/null)" != "$MODE" ]; then
    echo "=== Clearing content-layer cache (mode changed: $(cat "$MARKER" 2>/dev/null || 'none') -> $MODE) ==="
    rm -rf "$CACHE_DIR"
    mkdir -p "$CACHE_DIR"
    echo "$MODE" > "$MARKER"
fi

echo "=== Building with MATH_ENGINE=$ENGINE client=$MATH_CLIENT ==="
rm -rf dist .astro
MATH_ENGINE="$ENGINE" MATH_CLIENT="$MATH_CLIENT" \
    node --max-old-space-size=8192 node_modules/.bin/astro build 2>&1 | tail -1

SIZE_MB=$(du -sm dist | cut -f1)
echo "dist ($MODE): ${SIZE_MB} MB"

if [ "$SIZE_MB" -le "$THRESHOLD_MB" ]; then
    echo "OK: ${SIZE_MB}MB <= ${THRESHOLD_MB}MB"
    echo "Pages: $(find dist -name '*.html' | wc -l | tr -d ' ')"
    exit 0
fi

if [ "$ENGINE" != "katex" ] || [ "$MATH_CLIENT" = "1" ]; then
    echo "WARN: ${SIZE_MB}MB > ${THRESHOLD_MB}MB nhưng chế độ $MODE — giữ nguyên"
    echo "Pages: $(find dist -name '*.html' | wc -l | tr -d ' ')"
    exit 0
fi

echo "=== ${SIZE_MB}MB > ${THRESHOLD_MB}MB — rebuilding KaTeX client-side ==="
# Pipeline đổi (bỏ rehype-katex, math để text thô) nên phải xoá content cache
rm -rf dist .astro "$CACHE_DIR"
mkdir -p "$CACHE_DIR"
echo "katex-client" > "$MARKER"
MATH_ENGINE=katex MATH_CLIENT=1 node --max-old-space-size=4096 node_modules/.bin/astro build 2>&1 | tail -1

SIZE_MB=$(du -sm dist | cut -f1)
echo "Client-side dist: ${SIZE_MB} MB"
echo "Pages: $(find dist -name '*.html' | wc -l | tr -d ' ')"
