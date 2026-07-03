package main

import (
	"github.com/devtools/dev-tools/pkg/timeutil"
)

// TimestampToDate converts a Unix timestamp to a formatted date string in a timezone.
// unit can be "s" (seconds), "ms" (milliseconds), or "auto" (auto-detect).
func (a *App) TimestampToDate(timestamp int64, unit string, timezone string) (string, error) {
	return timeutil.TimestampToDateInTimezone(timestamp, unit, timezone)
}

// DateToTimestamp converts a date string to a Unix timestamp (seconds).
// timezone specifies the timezone for parsing (e.g., "UTC", "Asia/Shanghai").
func (a *App) DateToTimestamp(dateStr string, timezone string) (int64, error) {
	return timeutil.DateToTimestamp(dateStr, timezone)
}

// MultiTimezone returns date-time representations across multiple timezones.
func (a *App) MultiTimezone(timestamp int64, unit string) ([]TimezoneResult, error) {
	results, err := timeutil.MultiTimezone(timestamp, unit)
	if err != nil {
		return nil, err
	}

	// Convert pkg timeutil.TimezoneResult to main.TimezoneResult
	output := make([]TimezoneResult, len(results))
	for i, r := range results {
		output[i] = TimezoneResult{
			Zone:    r.Zone,
			DateStr: r.DateStr,
			Offset:  r.Offset,
		}
	}

	return output, nil
}
