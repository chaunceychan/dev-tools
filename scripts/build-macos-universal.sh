#!/bin/bash
# macOS Universal Binary 构建脚本
# 输出: build/bin/DevTools.app (同时支持 Intel x86_64 和 Apple Silicon arm64)
set -e

echo "=== Step 1/3: 构建 amd64 和 arm64 ==="
wails build -platform "darwin/amd64,darwin/arm64" -ldflags "-s -w"

echo ""
echo "=== Step 2/3: 合并为 Universal Binary ==="
cd build/bin
lipo -create \
  dev-tools-amd64.app/Contents/MacOS/dev-tools \
  dev-tools-arm64.app/Contents/MacOS/dev-tools \
  -output dev-tools-universal

echo ""
echo "=== Step 3/3: 组装最终 .app ==="
rm -rf DevTools.app
cp -R dev-tools-amd64.app DevTools.app
cp dev-tools-universal DevTools.app/Contents/MacOS/dev-tools
rm -rf dev-tools-amd64.app dev-tools-arm64.app dev-tools-universal

echo ""
echo "=== 完成 ==="
lipo -info DevTools.app/Contents/MacOS/dev-tools
ls -lh DevTools.app/Contents/MacOS/dev-tools
