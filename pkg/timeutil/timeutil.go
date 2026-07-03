package timeutil

import (
	"fmt"
	"strings"
	"time"
)

// TimestampToDate converts a Unix timestamp to a formatted date string.
// unit can be "s" (seconds), "ms" (milliseconds), or "auto" (auto-detect).
func TimestampToDate(ts int64, unit string) (string, error) {
	t := timestampToTime(ts, unit)

	return t.Format("2006-01-02 15:04:05"), nil
}

// TimestampToDateInTimezone converts a Unix timestamp to a formatted date string in the requested timezone.
func TimestampToDateInTimezone(ts int64, unit string, tz string) (string, error) {
	loc, err := loadLocationOrUTC(tz)
	if err != nil {
		return "", err
	}

	return timestampToTime(ts, unit).In(loc).Format("2006-01-02 15:04:05"), nil
}

// DateToTimestamp converts a date string to a Unix timestamp (seconds).
// timezone specifies the timezone for parsing (e.g., "UTC", "Asia/Shanghai").
func DateToTimestamp(dateStr string, tz string) (int64, error) {
	if dateStr == "" {
		return 0, fmt.Errorf("date string is empty")
	}

	// Load the timezone
	loc, _ := loadLocationOrUTC(tz)

	// Try multiple date formats
	formats := []string{
		"2006-01-02 15:04:05",
		"2006-01-02T15:04:05",
		"2006-01-02 15:04",
		"2006-01-02T15:04",
		"2006-01-02",
		time.RFC3339,
		time.RFC3339Nano,
	}

	for _, format := range formats {
		t, err := time.ParseInLocation(format, dateStr, loc)
		if err == nil {
			return t.Unix(), nil
		}
	}

	return 0, fmt.Errorf("cannot parse date string: %q (tried multiple formats)", dateStr)
}

// MultiTimezone returns date-time representations across multiple timezones for a given timestamp.
// unit can be "s" (seconds), "ms" (milliseconds), or "auto" (auto-detect).
func MultiTimezone(ts int64, unit string) ([]TimezoneResult, error) {
	t := timestampToTime(ts, unit)

	// Define timezones to display
	zones := []string{
		"UTC",
		"Asia/Shanghai",
		"Asia/Tokyo",
		"America/New_York",
		"America/Los_Angeles",
		"Europe/London",
		"Europe/Berlin",
		"Australia/Sydney",
	}

	results := make([]TimezoneResult, 0, len(zones))

	for _, zoneName := range zones {
		loc, err := time.LoadLocation(zoneName)
		if err != nil {
			continue
		}

		localTime := t.In(loc)
		// Calculate actual offset
		_, offsetSec := localTime.Zone()
		var offsetStr string
		if offsetSec >= 0 {
			offsetHours := offsetSec / 3600
			offsetMins := (offsetSec % 3600) / 60
			offsetStr = fmt.Sprintf("+%02d:%02d", offsetHours, offsetMins)
		} else {
			offsetHours := -offsetSec / 3600
			offsetMins := (-offsetSec % 3600) / 60
			offsetStr = fmt.Sprintf("-%02d:%02d", offsetHours, offsetMins)
		}

		results = append(results, TimezoneResult{
			Zone:    zoneName,
			DateStr: localTime.Format("2006-01-02 15:04:05"),
			Offset:  offsetStr,
		})
	}

	return results, nil
}

// TimezoneResult is defined here to avoid circular import of main package models.
// The main package TimezoneResult and this struct have identical fields.
type TimezoneResult struct {
	Zone    string `json:"zone"`
	DateStr string `json:"dateStr"`
	Offset  string `json:"offset"`
}

func timestampToTime(ts int64, unit string) time.Time {
	switch strings.ToLower(unit) {
	case "s", "sec", "seconds":
		return time.Unix(ts, 0)
	case "ms", "milli", "milliseconds":
		return time.Unix(ts/1000, (ts%1000)*1000000)
	default:
		if ts > 1e12 {
			return time.Unix(ts/1000, (ts%1000)*1000000)
		}
		return time.Unix(ts, 0)
	}
}

func loadLocationOrUTC(tz string) (*time.Location, error) {
	if strings.TrimSpace(tz) == "" {
		return time.UTC, nil
	}
	loc, err := time.LoadLocation(tz)
	if err != nil {
		return time.UTC, nil
	}
	return loc, nil
}
