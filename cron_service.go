package main

import (
	"github.com/devtools/dev-tools/pkg/cronutil"
)

// CronParse analyzes a cron expression and returns its description and validity.
func (a *App) CronParse(expression string) (CronParseResult, error) {
	result, err := cronutil.Parse(expression)
	if err != nil {
		return CronParseResult{
			Description: result.Description,
			IsValid:     result.IsValid,
		}, err
	}
	return CronParseResult{
		Description: result.Description,
		IsValid:     result.IsValid,
	}, nil
}

// CronValidate checks if a cron expression is syntactically valid.
func (a *App) CronValidate(expression string) (string, error) {
	return cronutil.Validate(expression)
}

// CronNextN calculates the next N execution times for a cron expression.
func (a *App) CronNextN(expression string, count int) ([]string, error) {
	if count <= 0 {
		count = 5
	}
	return cronutil.NextN(expression, count)
}
