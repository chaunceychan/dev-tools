package regexutil

import (
	"fmt"
	"regexp"
	"strings"
)

// Test returns all matches and capture groups for pattern against text.
func Test(pattern string, text string) (string, error) {
	pattern = strings.TrimSpace(pattern)
	if pattern == "" {
		return "", fmt.Errorf("pattern is empty")
	}
	if text == "" {
		return "", fmt.Errorf("text is empty")
	}

	re, err := regexp.Compile(pattern)
	if err != nil {
		return "", fmt.Errorf("invalid regex: %v", err)
	}

	matches := re.FindAllStringSubmatchIndex(text, -1)
	if len(matches) == 0 {
		return "No matches", nil
	}

	var builder strings.Builder
	builder.WriteString(fmt.Sprintf("Matches: %d", len(matches)))
	names := re.SubexpNames()
	for matchIndex, indexes := range matches {
		builder.WriteString(fmt.Sprintf("\n\nMatch %d: %q", matchIndex+1, text[indexes[0]:indexes[1]]))
		for group := 1; group < len(indexes)/2; group++ {
			start := indexes[group*2]
			end := indexes[group*2+1]
			name := names[group]
			label := fmt.Sprintf("Group %d", group)
			if name != "" {
				label = fmt.Sprintf("Group %d (%s)", group, name)
			}
			if start < 0 || end < 0 {
				builder.WriteString(fmt.Sprintf("\n  %s: <not matched>", label))
				continue
			}
			builder.WriteString(fmt.Sprintf("\n  %s: %q", label, text[start:end]))
		}
	}

	return builder.String(), nil
}

// Replace applies a regexp replacement to text.
func Replace(pattern string, replacement string, text string) (string, error) {
	pattern = strings.TrimSpace(pattern)
	if pattern == "" {
		return "", fmt.Errorf("pattern is empty")
	}
	if text == "" {
		return "", fmt.Errorf("text is empty")
	}

	re, err := regexp.Compile(pattern)
	if err != nil {
		return "", fmt.Errorf("invalid regex: %v", err)
	}
	return re.ReplaceAllString(text, replacement), nil
}
