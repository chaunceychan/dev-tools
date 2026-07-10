package config

// AppConfig holds application-wide configuration constants.
// These values are used by the App binding methods and pkg utilities.
type AppConfig struct {
	// FileSizeLimit is the maximum file size for Base64 file operations (10MB).
	FileSizeLimit int64

	// DefaultIndent is the default indentation level for format operations (2 spaces).
	DefaultIndent int

	// DefaultCronCount is the default number of next execution times to return (5).
	DefaultCronCount int

	// AppVersion is the current application version.
	AppVersion string

	// HistoryLimit is the maximum number of history records to keep (50).
	HistoryLimit int
}

// DefaultConfig returns the default application configuration.
func DefaultConfig() *AppConfig {
	return &AppConfig{
		FileSizeLimit:    10 * 1024 * 1024, // 10MB
		DefaultIndent:    2,
		DefaultCronCount: 5,
		AppVersion:       "1.1.0",
		HistoryLimit:     50,
	}
}

// Global is the global application configuration instance.
var Global = DefaultConfig()
