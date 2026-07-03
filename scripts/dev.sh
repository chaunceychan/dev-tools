#!/bin/bash
# Start Wails development server for DevTools
# This will:
# 1. Compile Go backend
# 2. Start Vite frontend dev server
# 3. Auto-generate Wails JS bindings (wailsjs/go/)
# 4. Open the application window with hot-reload

set -e

echo "=== Starting DevTools development server ==="
echo ""

# Ensure frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd frontend
  npm install
  cd ..
  echo ""
fi

# Start Wails dev mode
# This automatically:
# - Compiles Go code with hot-reload on Go file changes
# - Starts Vite dev server on the configured port
# - Generates JS bindings in frontend/wailsjs/
# - Opens the application window
# - Supports hot-reload for both Go and frontend changes
echo "Launching wails dev..."
echo "  - Go backend: hot-reload on file changes"
echo "  - Frontend: Vite dev server with HMR"
echo "  - Bindings: auto-regenerated on Go method changes"
echo ""

wails dev

echo ""
echo "=== Dev server stopped ==="
