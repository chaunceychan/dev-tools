package main

// RandomParams defines the parameters for random string generation.
type RandomParams struct {
	Length       int               `json:"length"`        // String length, default 16
	CharsetFlags map[string]bool   `json:"charsetFlags"`  // Charset switches: uppercase, lowercase, digits, special
	Count        int               `json:"count"`         // Number of strings to generate, default 1
}

// TimezoneResult represents a single entry in the multi-timezone comparison table.
type TimezoneResult struct {
	Zone    string `json:"zone"`     // Timezone name, e.g. "UTC", "Asia/Shanghai"
	DateStr string `json:"dateStr"`  // Date-time string in that timezone
	Offset  string `json:"offset"`   // UTC offset, e.g. "+08:00"
}

// CronParseResult holds the result of parsing a cron expression.
type CronParseResult struct {
	Description string `json:"description"` // Human-readable description of the expression
	IsValid     bool   `json:"isValid"`     // Whether the expression is syntactically valid
}

// ToolMeta describes the metadata for a single tool in the tool list.
type ToolMeta struct {
	ID       string      `json:"id"`       // Tool identifier: "json", "base64", "timestamp", etc.
	Name     string      `json:"name"`     // Display name: "JSON 格式化", etc.
	Icon     string      `json:"icon"`     // Icon identifier (emoji or text)
	Category string      `json:"category"` // "core" | "extended"
	Actions  []ActionDef `json:"actions"`  // Available actions for this tool
}

// ActionDef describes a single action available within a tool.
type ActionDef struct {
	Action string `json:"action"` // Action identifier: "format", "minify", "validate", etc.
	Label  string `json:"label"`  // Action display name: "格式化", "压缩", "验证"
}
