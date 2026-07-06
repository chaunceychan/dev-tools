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

// CronGenerateInterval generates a cron expression for a fixed interval.
// unit: "second", "minute", "hour", "day", "week", "month"
func (a *App) CronGenerateInterval(interval int, unit string) (string, error) {
	return cronutil.GenerateInterval(interval, unit)
}

// CronGenerateFixedTime generates a cron expression for a specific time scenario.
// scenario: "daily", "weekday", "weekly", "monthly"
// hour: 0-23, min: 0-59, dayOrDow: context-dependent
func (a *App) CronGenerateFixedTime(scenario string, hour int, min int, dayOrDow int) (string, error) {
	return cronutil.GenerateFixedTime(scenario, hour, min, dayOrDow)
}
