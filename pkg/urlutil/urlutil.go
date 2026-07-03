package urlutil

import (
	"fmt"
	"net/url"
	"sort"
	"strings"
)

// Encode percent-encodes text so it can be safely used in a URL query value.
func Encode(input string) (string, error) {
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}
	return url.QueryEscape(input), nil
}

// Decode decodes percent-encoded URL text.
func Decode(input string) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	result, err := url.QueryUnescape(input)
	if err != nil {
		return "", fmt.Errorf("invalid URL encoding: %v", err)
	}
	return result, nil
}

// ParseQuery formats URL query parameters from either a full URL or a raw query string.
func ParseQuery(input string) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	rawQuery := input
	if parsed, err := url.Parse(input); err == nil && parsed.RawQuery != "" {
		rawQuery = parsed.RawQuery
	}
	rawQuery = strings.TrimPrefix(rawQuery, "?")

	values, err := url.ParseQuery(rawQuery)
	if err != nil {
		return "", fmt.Errorf("invalid query string: %v", err)
	}
	if len(values) == 0 {
		return "", fmt.Errorf("no query parameters found")
	}

	keys := make([]string, 0, len(values))
	for key := range values {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	var builder strings.Builder
	for i, key := range keys {
		for _, value := range values[key] {
			if builder.Len() > 0 {
				builder.WriteByte('\n')
			}
			builder.WriteString(fmt.Sprintf("%d. %s = %s", i+1, key, value))
		}
	}
	return builder.String(), nil
}
