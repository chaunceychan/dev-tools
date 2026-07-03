package base64util

import (
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

// EncodeText encodes a plain text string to Base64.
func EncodeText(input string) (string, error) {
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}
	encoded := base64.StdEncoding.EncodeToString([]byte(input))
	return encoded, nil
}

// DecodeText decodes a Base64 string back to plain text.
func DecodeText(input string) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	decoded, err := base64.StdEncoding.DecodeString(input)
	if err != nil {
		// Try URL-safe encoding (with padding) as fallback
		decoded, err2 := base64.URLEncoding.DecodeString(input)
		if err2 != nil {
			// Try URL-safe encoding (without padding) as last resort
			decoded, err3 := base64.URLEncoding.WithPadding(base64.NoPadding).DecodeString(input)
			if err3 != nil {
				return "", fmt.Errorf("invalid Base64 encoding: %v", err)
			}
			return string(decoded), nil
		}
		return string(decoded), nil
	}

	return string(decoded), nil
}

// EncodeFile reads a file and encodes its contents to Base64.
// The file size must not exceed the configured limit (default 10MB).
func EncodeFile(filePath string) (string, error) {
	if filePath == "" {
		return "", fmt.Errorf("file path is empty")
	}

	// Check file size limit
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return "", fmt.Errorf("cannot access file: %v", err)
	}

	maxSize := int64(10 * 1024 * 1024) // 10MB
	if fileInfo.Size() > maxSize {
		sizeMB := float64(fileInfo.Size()) / (1024 * 1024)
		return "", fmt.Errorf("File size exceeds 10MB limit (actual: %.1f MB)", sizeMB)
	}

	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %v", err)
	}

	encoded := base64.StdEncoding.EncodeToString(data)
	return encoded, nil
}

// DecodeFile decodes a Base64 string and saves the result to a file.
func DecodeFile(filePath string, outputPath string) (string, error) {
	if filePath == "" {
		return "", fmt.Errorf("source file path is empty")
	}
	if outputPath == "" {
		return "", fmt.Errorf("output file path is empty")
	}

	// Read the Base64 encoded file
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to read source file: %v", err)
	}

	// Decode Base64 content
	decoded, err := base64.StdEncoding.DecodeString(string(data))
	if err != nil {
		// Try URL-safe encoding (with padding) as fallback
		decodedFallback, err2 := base64.URLEncoding.DecodeString(string(data))
		if err2 != nil {
			// Try URL-safe encoding (without padding) as last resort
			decodedFallback, err3 := base64.URLEncoding.WithPadding(base64.NoPadding).DecodeString(string(data))
			if err3 != nil {
				return "", fmt.Errorf("invalid Base64 encoding in file: %v", err)
			}
			decoded = decodedFallback
		} else {
			decoded = decodedFallback
		}
	}

	// Ensure output directory exists
	outputDir := filepath.Dir(outputPath)
	if outputDir != "." && outputDir != "" {
		if err := os.MkdirAll(outputDir, 0755); err != nil {
			return "", fmt.Errorf("failed to create output directory: %v", err)
		}
	}

	// Write decoded data to output file
	if err := ioutil.WriteFile(outputPath, decoded, 0644); err != nil {
		return "", fmt.Errorf("failed to write output file: %v", err)
	}

	return fmt.Sprintf("Successfully decoded and saved to: %s", outputPath), nil
}
