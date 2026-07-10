#!/bin/bash
# Build portable Windows executable for DevTools
# Output: build/bin/dev-tools.exe + data directory packaged as zip

set -e

echo "=== Building DevTools portable version ==="
echo ""

# Step 1: Build frontend
echo "[1/3] Installing frontend dependencies..."
cd frontend
npm install
echo ""

echo "[2/3] Building frontend..."
npm run build
cd ..
echo ""

# Step 3: Build Wails application
echo "[3/3] Building Wails application..."
# -webview2 embed: embeds WebView2 bootstrapper (~150KB) for machines without WebView2
# -ldflags "-s -w": strip debug info and symbol table for smaller binary
# -ldflags "-H windowsgui": hide console window on Windows (only effective on Windows builds)
wails build \
  -platform windows/amd64 \
  -webview2 embed \
  -ldflags "-s -w -H windowsgui"

echo ""
echo "=== Build completed ==="
echo "Output: build/bin/dev-tools.exe"
echo ""

# Create portable distribution package
DIST_DIR="dist/dev-tools-portable"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# Copy the built executable
if [ -f "build/bin/dev-tools.exe" ]; then
  cp build/bin/dev-tools.exe "$DIST_DIR/"
  echo "Copied: dev-tools.exe"
fi

# Create empty data directory for portable use
mkdir -p "$DIST_DIR/data"

# Create a simple README for the portable package
cat > "$DIST_DIR/README.txt" << 'EOF'
DevTools - 开发常用小工具集 v1.1.0

使用方法：
1. 解压此 zip 文件到任意目录
2. 双击 dev-tools.exe 运行
3. 数据文件保存在 exe 同目录下的 data/ 目录

包含工具：
- JSON 格式化（格式化/压缩/验证）
- Base64 编解码（文本/文件模式）
- 时间戳转换（双向转换+多时区）
- YAML 格式化（格式化/验证/转JSON）
- XML 格式化（格式化/压缩/验证）
- 随机字符串生成
- Cron 表达式解析
- URL 编解码（编码/解码/Query参数解析）
- Hash 摘要（MD5/SHA1/SHA256/SHA512）
- JWT 解析
- UUID 工具（生成/验证）
- 正则测试（匹配/替换）

注意：
- Windows 10/11 已自带 WebView2 runtime
- 如果系统缺少 WebView2，首次运行会自动引导安装
- 无需安装，无需注册表，解压即用
EOF

# Package as zip
echo "=== Creating portable zip package ==="
rm -f dist/dev-tools-portable-v1.1.0.zip
cd dist
zip -r dev-tools-portable-v1.1.0.zip dev-tools-portable/
cd ..

echo ""
echo "=== All done! ==="
echo "Portable package: dist/dev-tools-portable-v1.1.0.zip"
