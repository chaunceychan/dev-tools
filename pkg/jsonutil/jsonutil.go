package jsonutil

import (
	"encoding/json"
	"fmt"
	"strings"
)

// Format beautifies JSON input with the specified indentation level.
// Returns the formatted JSON string or an error with line/column information.
func Format(input string, indent int) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	var obj interface{}
	if err := json.Unmarshal([]byte(input), &obj); err != nil {
		return "", fmt.Errorf("Line %d: %v", findErrorLine(input, err), err)
	}

	indentStr := strings.Repeat(" ", indent)
	result, err := json.MarshalIndent(obj, "", indentStr)
	if err != nil {
		return "", fmt.Errorf("format error: %v", err)
	}

	return string(result), nil
}

// Minify compresses JSON by removing all whitespace.
// Returns the minified JSON string or an error with line information.
func Minify(input string) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	var obj interface{}
	if err := json.Unmarshal([]byte(input), &obj); err != nil {
		return "", fmt.Errorf("Line %d: %v", findErrorLine(input, err), err)
	}

	result, err := json.Marshal(obj)
	if err != nil {
		return "", fmt.Errorf("minify error: %v", err)
	}

	return string(result), nil
}

// Validate checks if the input is valid JSON.
// Returns "Valid JSON" if valid, or a detailed error message with line/column info.
func Validate(input string) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	var obj interface{}
	if err := json.Unmarshal([]byte(input), &obj); err != nil {
		line := findErrorLine(input, err)
		return fmt.Sprintf("Invalid JSON: Line %d: %v", line, err), nil
	}

	return "Valid JSON", nil
}

// findErrorLine attempts to extract the line number from a JSON parse error.
// Falls back to 1 if the line cannot be determined.
func findErrorLine(input string, err error) int {
	// Go json errors often contain "after offset X" or "at line X"
	errStr := err.Error()

	// Try to find line number from error message
	// Pattern: "invalid character 'X' after object key:value pair at offset N"
	lines := strings.Split(input, "\n")
	offset := extractOffset(errStr)
	if offset >= 0 && offset < len(input) {
		line := 1
		pos := 0
		for pos < offset && line < len(lines)+1 {
			lineLen := len(lines[line-1]) + 1 // +1 for newline
			if pos + lineLen > offset {
				break
			}
			pos += lineLen
			line++
		}
		return line
	}

	// Fallback: search for "at line N" pattern
	for _, pattern := range []string{"at line ", "Line "} {
		idx := strings.Index(errStr, pattern)
		if idx >= 0 {
			after := errStr[idx+len(pattern):]
			lineNum := 0
			for _, ch := range after {
				if ch >= '0' && ch <= '9' {
					lineNum = lineNum*10 + int(ch-'0')
				} else {
					break
				}
			}
			if lineNum > 0 {
				return lineNum
			}
		}
	}

	return 1
}

// extractOffset tries to parse the byte offset from a json error message.
func extractOffset(errStr string) int {
	// Pattern: "after offset N" or "near offset N"
	for _, pattern := range []string{"after offset ", "near offset "} {
		idx := strings.Index(errStr, pattern)
		if idx >= 0 {
			after := errStr[idx+len(pattern):]
			offset := 0
			for _, ch := range after {
				if ch >= '0' && ch <= '9' {
					offset = offset*10 + int(ch-'0')
				} else {
					break
				}
			}
			if offset > 0 {
				return offset
			}
		}
	}
	return -1
}
