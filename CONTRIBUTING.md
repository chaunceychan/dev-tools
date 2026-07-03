# Contributing

Thanks for your interest in improving DevTools.

## Development Setup

Requirements:

- Go 1.24+
- Node.js 18+
- Wails CLI: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

Install dependencies:

```bash
go mod download
cd frontend && npm install && cd ..
```

Run the desktop app in development mode:

```bash
wails dev
```

## Checks

Before opening a pull request, run:

```bash
go test ./pkg/...
cd frontend && npm run build
```

## Pull Requests

- Keep changes focused and easy to review.
- Add or update tests when changing utility behavior.
- Update documentation when commands, requirements, or user-visible behavior change.
