package base64util

import (
	"fmt"
	"os"
)

// CheckFileSize verifies that a file does not exceed the maximum allowed size.
// Returns nil if the file size is within the limit, or an error describing the violation.
func CheckFileSize(filePath string, maxSizeBytes int64) error {
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return fmt.Errorf("cannot access file: %v", err)
	}

	if fileInfo.Size() > maxSizeBytes {
		sizeMB := float64(fileInfo.Size()) / (1024 * 1024)
		limitMB := float64(maxSizeBytes) / (1024 * 1024)
		return fmt.Errorf("File size exceeds %.0fMB limit (actual: %.1f MB)", limitMB, sizeMB)
	}

	return nil
}

// MaxFileSize is the default maximum file size for Base64 file operations (10MB).
const MaxFileSize int64 = 10 * 1024 * 1024
