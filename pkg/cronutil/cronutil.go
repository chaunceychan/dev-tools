package cronutil

import (
	"fmt"
	"strings"
	"time"

	"github.com/robfig/cron/v3"
)

// CronParseResult holds the result of parsing a cron expression.
type CronParseResult struct {
	Description string `json:"description"`
	IsValid     bool   `json:"isValid"`
}

// Parse analyzes a cron expression and returns its human-readable description.
// Supports both 5-field (standard) and 6-field (with seconds) formats.
func Parse(expression string) (CronParseResult, error) {
	expression = strings.TrimSpace(expression)
	if expression == "" {
		return CronParseResult{
			Description: "empty expression",
			IsValid:     false,
		}, fmt.Errorf("expression is empty")
	}

	// Determine if it's 5-field or 6-field
	is6Field := strings.Count(expression, " ") == 5
	description := describeCronExpression(expression, is6Field)

	// Try to validate by creating a parser
	parser := getParser(is6Field)
	_, err := parser.Parse(expression)
	if err != nil {
		return CronParseResult{
			Description: description + " (invalid syntax)",
			IsValid:     false,
		}, nil
	}

	return CronParseResult{
		Description: description,
		IsValid:     true,
	}, nil
}

// Validate checks if a cron expression is syntactically valid.
// Returns "Valid" if valid, or an error message describing the issue.
func Validate(expression string) (string, error) {
	expression = strings.TrimSpace(expression)
	if expression == "" {
		return "", fmt.Errorf("expression is empty")
	}

	is6Field := strings.Count(expression, " ") == 5
	parser := getParser(is6Field)

	_, err := parser.Parse(expression)
	if err != nil {
		return fmt.Sprintf("Invalid cron expression: %v", err), nil
	}

	return "Valid cron expression", nil
}

// NextN calculates the next N execution times for a cron expression.
// Returns a list of formatted time strings.
func NextN(expression string, count int) ([]string, error) {
	expression = strings.TrimSpace(expression)
	if expression == "" {
		return nil, fmt.Errorf("expression is empty")
	}
	if count <= 0 {
		count = 5
	}

	is6Field := strings.Count(expression, " ") == 5
	parser := getParser(is6Field)

	sched, err := parser.Parse(expression)
	if err != nil {
		return nil, fmt.Errorf("invalid cron expression: %v", err)
	}

	// Get next N times starting from now
	now := time.Now()
	results := make([]string, count)

	for i := 0; i < count; i++ {
		next := sched.Next(now)
		results[i] = next.Format("2006-01-02 15:04:05")
		now = next
	}

	return results, nil
}

// getParser returns the appropriate cron parser for the given format.
func getParser(is6Field bool) cron.Parser {
	if is6Field {
		return cron.NewParser(cron.Second | cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow)
	}
	return cron.NewParser(cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow)
}

// describeCronExpression generates a human-readable description of a cron expression.
func describeCronExpression(expression string, is6Field bool) string {
	fields := strings.Fields(expression)
	if is6Field && len(fields) != 6 {
		return "malformed 6-field expression"
	}
	if !is6Field && len(fields) != 5 {
		return "malformed 5-field expression"
	}

	var desc strings.Builder

	if is6Field {
		desc.WriteString(fmt.Sprintf("Every %s seconds, ", describeField(fields[0], "second")))
		desc.WriteString(fmt.Sprintf("%s minutes, ", describeField(fields[1], "minute")))
		desc.WriteString(fmt.Sprintf("%s hours, ", describeField(fields[2], "hour")))
		desc.WriteString(fmt.Sprintf("%s day of month, ", describeField(fields[3], "day")))
		desc.WriteString(fmt.Sprintf("%s month, ", describeField(fields[4], "month")))
		desc.WriteString(fmt.Sprintf("%s day of week", describeField(fields[5], "weekday")))
	} else {
		desc.WriteString(fmt.Sprintf("Every %s minutes, ", describeField(fields[0], "minute")))
		desc.WriteString(fmt.Sprintf("%s hours, ", describeField(fields[1], "hour")))
		desc.WriteString(fmt.Sprintf("%s day of month, ", describeField(fields[2], "day")))
		desc.WriteString(fmt.Sprintf("%s month, ", describeField(fields[3], "month")))
		desc.WriteString(fmt.Sprintf("%s day of week", describeField(fields[4], "weekday")))
	}

	return desc.String()
}

// describeField converts a cron field value to a human-readable description.
func describeField(field string, name string) string {
	switch field {
	case "*":
		return "any"
	case "?":
		return "any"
	default:
		if strings.HasPrefix(field, "*/") {
			return fmt.Sprintf("every %s", strings.TrimPrefix(field, "*/"))
		}
		if strings.Contains(field, ",") {
			return fmt.Sprintf("specific %s (%s)", name, field)
		}
		if strings.Contains(field, "-") {
			return fmt.Sprintf("%s range (%s)", name, field)
		}
		return fmt.Sprintf("%s %s", name, field)
	}
}
