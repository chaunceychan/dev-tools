package uuidutil

import (
	"fmt"
	"strings"

	"github.com/google/uuid"
)

// Generate creates count UUID v4 values.
func Generate(count int, uppercase bool, noHyphen bool) ([]string, error) {
	if count <= 0 {
		count = 1
	}
	if count > 100 {
		return nil, fmt.Errorf("count must not exceed 100")
	}

	results := make([]string, 0, count)
	for i := 0; i < count; i++ {
		value := uuid.NewString()
		if noHyphen {
			value = strings.ReplaceAll(value, "-", "")
		}
		if uppercase {
			value = strings.ToUpper(value)
		}
		results = append(results, value)
	}
	return results, nil
}

// Validate checks whether the input is a valid UUID.
func Validate(input string) (string, error) {
	value := strings.TrimSpace(input)
	if value == "" {
		return "", fmt.Errorf("input is empty")
	}

	parsed, err := uuid.Parse(value)
	if err != nil {
		return "Invalid UUID", nil
	}
	return fmt.Sprintf("Valid UUID\nCanonical: %s\nNo hyphen: %s\nUppercase: %s",
		parsed.String(),
		strings.ReplaceAll(parsed.String(), "-", ""),
		strings.ToUpper(parsed.String()),
	), nil
}
