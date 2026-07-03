package yamlutil

import (
	"encoding/json"
	"fmt"
	"strings"

	"gopkg.in/yaml.v3"
)

// Format beautifies YAML input with the specified indentation level.
func Format(input string, indent int) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	var data interface{}
	if err := yaml.Unmarshal([]byte(input), &data); err != nil {
		return "", fmt.Errorf("YAML parse error: %v", err)
	}

	if indent <= 0 {
		indent = 2
	}

	var buf strings.Builder
	enc := yaml.NewEncoder(&buf)
	enc.SetIndent(indent)
	if err := enc.Encode(data); err != nil {
		return "", fmt.Errorf("YAML format error: %v", err)
	}
	if err := enc.Close(); err != nil {
		return "", fmt.Errorf("YAML format error: %v", err)
	}

	return strings.TrimSpace(buf.String()), nil
}

// Validate checks if the input is valid YAML.
// Returns "Valid YAML" if valid, or a detailed error message.
func Validate(input string) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	var data interface{}
	if err := yaml.Unmarshal([]byte(input), &data); err != nil {
		return fmt.Sprintf("Invalid YAML: %v", err), nil
	}

	return "Valid YAML", nil
}

// ToJSON converts YAML input to JSON format with 2-space indentation.
func ToJSON(input string) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	var data interface{}
	if err := yaml.Unmarshal([]byte(input), &data); err != nil {
		return "", fmt.Errorf("YAML parse error: %v", err)
	}

	// Normalize YAML-specific map types to JSON-compatible types
	normalized := normalizeYAMLMap(data)

	result, err := json.MarshalIndent(normalized, "", "  ")
	if err != nil {
		return "", fmt.Errorf("JSON conversion error: %v", err)
	}

	return string(result), nil
}

// normalizeYAMLMap recursively converts map[interface{}]interface{} to map[string]interface{}.
// YAML v3 library can produce map[interface{}]interface{} which is not JSON-serializable.
func normalizeYAMLMap(data interface{}) interface{} {
	switch v := data.(type) {
	case map[interface{}]interface{}:
		result := make(map[string]interface{})
		for key, val := range v {
			result[fmt.Sprintf("%v", key)] = normalizeYAMLMap(val)
		}
		return result
	case []interface{}:
		for i, item := range v {
			v[i] = normalizeYAMLMap(item)
		}
		return v
	default:
		return v
	}
}
