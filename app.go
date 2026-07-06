package main

import (
	"context"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App is the main application struct that holds the Wails runtime context.
// All tool methods are bound to this struct and exposed to the frontend via Wails bindings.
type App struct {
	ctx context.Context
}

// NewApp creates a new App instance.
func NewApp() *App {
	return &App{}
}

// startup is called when the Wails application starts.
// It saves the runtime context and ensures the portable data directory exists.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Ensure portable data directory exists
	dataDir := a.GetDataDir()
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		runtime.LogErrorf(ctx, "Failed to create data directory: %s", err.Error())
	}

	runtime.LogInfof(ctx, "DevTools started. Data directory: %s", dataDir)
}

// shutdown is called when the Wails application is closing.
// Since this is a single-process model (no sidecar), cleanup is minimal.
func (a *App) shutdown() {
	runtime.LogInfof(a.ctx, "DevTools shutting down")
}

// ClipboardWrite writes the given text to the system clipboard via Wails runtime.
func (a *App) ClipboardWrite(text string) error {
	return runtime.ClipboardSetText(a.ctx, text)
}

// GetDataDir returns the portable data directory path.
// The data directory is located at {exe directory}/data/.
func (a *App) GetDataDir() string {
	exePath, err := os.Executable()
	if err != nil {
		// Fallback to current working directory
		return filepath.Join(".", "data")
	}
	return filepath.Join(filepath.Dir(exePath), "data")
}

// GetToolList returns the list of all available tools with their metadata.
func (a *App) GetToolList() []ToolMeta {
	return ToolList
}

// GetAppVersion returns the current application version string.
func (a *App) GetAppVersion() string {
	return "1.0.0"
}

// ToolList is the static tool metadata list used by GetToolList.
var ToolList = []ToolMeta{
	{
		ID:       "json",
		Name:     "JSON 格式化",
		Icon:     "{ }",
		Category: "core",
		Actions: []ActionDef{
			{Action: "format", Label: "格式化"},
			{Action: "minify", Label: "压缩"},
			{Action: "validate", Label: "验证"},
		},
	},
	{
		ID:       "base64",
		Name:     "Base64 编解码",
		Icon:     "B64",
		Category: "core",
		Actions: []ActionDef{
			{Action: "encodeText", Label: "文本编码"},
			{Action: "decodeText", Label: "文本解码"},
			{Action: "encodeFile", Label: "文件编码"},
			{Action: "decodeFile", Label: "文件解码"},
		},
	},
	{
		ID:       "timestamp",
		Name:     "时间戳转换",
		Icon:     "⏱",
		Category: "core",
		Actions: []ActionDef{
			{Action: "toDate", Label: "转日期"},
			{Action: "toTimestamp", Label: "转时间戳"},
			{Action: "timezone", Label: "多时区"},
		},
	},
	{
		ID:       "yaml",
		Name:     "YAML 格式化",
		Icon:     "Y",
		Category: "extended",
		Actions: []ActionDef{
			{Action: "format", Label: "格式化"},
			{Action: "validate", Label: "验证"},
			{Action: "toJSON", Label: "转JSON"},
		},
	},
	{
		ID:       "xml",
		Name:     "XML 格式化",
		Icon:     "< >",
		Category: "extended",
		Actions: []ActionDef{
			{Action: "format", Label: "格式化"},
			{Action: "minify", Label: "压缩"},
			{Action: "validate", Label: "验证"},
		},
	},
	{
		ID:       "random",
		Name:     "随机字符串",
		Icon:     "🎲",
		Category: "extended",
		Actions: []ActionDef{
			{Action: "generate", Label: "生成"},
		},
	},
	{
		ID:       "cron",
		Name:     "Cron 解析",
		Icon:     "⏰",
		Category: "extended",
		Actions: []ActionDef{
			{Action: "parse", Label: "解析"},
			{Action: "validate", Label: "验证"},
			{Action: "nextN", Label: "下次执行"},
		},
	},
	{
		ID:       "url",
		Name:     "URL 编解码",
		Icon:     "URL",
		Category: "extended",
		Actions: []ActionDef{
			{Action: "encode", Label: "编码"},
			{Action: "decode", Label: "解码"},
			{Action: "parseQuery", Label: "解析参数"},
		},
	},
	{
		ID:       "hash",
		Name:     "Hash 摘要",
		Icon:     "#",
		Category: "extended",
		Actions: []ActionDef{
			{Action: "generate", Label: "生成"},
			{Action: "generateAll", Label: "全部生成"},
		},
	},
	{
		ID:       "jwt",
		Name:     "JWT 解析",
		Icon:     "JWT",
		Category: "extended",
		Actions: []ActionDef{
			{Action: "decode", Label: "解析"},
		},
	},
	{
		ID:       "uuid",
		Name:     "UUID 工具",
		Icon:     "ID",
		Category: "extended",
		Actions: []ActionDef{
			{Action: "generate", Label: "生成"},
			{Action: "validate", Label: "验证"},
		},
	},
	{
		ID:       "regex",
		Name:     "正则测试",
		Icon:     ".*",
		Category: "extended",
		Actions: []ActionDef{
			{Action: "test", Label: "测试"},
			{Action: "replace", Label: "替换"},
		},
	},
	{
		ID:       "regex-validator",
		Name:     "常用校验",
		Icon:     "✓",
		Category: "extended",
		Actions: []ActionDef{
			{Action: "validatePattern", Label: "验证"},
		},
	},
}
