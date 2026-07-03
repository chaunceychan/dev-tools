package timeutil

import (
	"testing"
	"time"
)

func TestTimestampToDate(t *testing.T) {
	tests := []struct {
		name    string
		ts      int64
		unit    string
		want    string
		wantErr bool
	}{
		{
			name:    "seconds_unit",
			ts:      1700000000,
			unit:    "s",
			want:    time.Unix(1700000000, 0).Format("2006-01-02 15:04:05"),
			wantErr: false,
		},
		{
			name:    "milliseconds_unit",
			ts:      1700000000000,
			unit:    "ms",
			want:    time.Unix(1700000000, 0).Format("2006-01-02 15:04:05"),
			wantErr: false,
		},
		{
			name:    "auto_detect_seconds",
			ts:      1700000000, // < 1e12, auto-detect as seconds
			unit:    "auto",
			want:    time.Unix(1700000000, 0).Format("2006-01-02 15:04:05"),
			wantErr: false,
		},
		{
			name:    "auto_detect_milliseconds",
			ts:      1700000000000, // > 1e12, auto-detect as milliseconds
			unit:    "auto",
			want:    time.Unix(1700000000, 0).Format("2006-01-02 15:04:05"),
			wantErr: false,
		},
		{
			name:    "sec_alias",
			ts:      1700000000,
			unit:    "sec",
			want:    time.Unix(1700000000, 0).Format("2006-01-02 15:04:05"),
			wantErr: false,
		},
		{
			name:    "seconds_alias",
			ts:      1700000000,
			unit:    "seconds",
			want:    time.Unix(1700000000, 0).Format("2006-01-02 15:04:05"),
			wantErr: false,
		},
		{
			name:    "milli_alias",
			ts:      1700000000000,
			unit:    "milli",
			want:    time.Unix(1700000000, 0).Format("2006-01-02 15:04:05"),
			wantErr: false,
		},
		{
			name:    "milliseconds_alias",
			ts:      1700000000000,
			unit:    "milliseconds",
			want:    time.Unix(1700000000, 0).Format("2006-01-02 15:04:05"),
			wantErr: false,
		},
		{
			name:    "zero_timestamp",
			ts:      0,
			unit:    "s",
			want:    time.Unix(0, 0).Format("2006-01-02 15:04:05"),
			wantErr: false,
		},
		{
			name:    "ms_with_remainder",
			ts:      1700000000123,
			unit:    "ms",
			want:    time.Unix(1700000000, 123000000).Format("2006-01-02 15:04:05"),
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := TimestampToDate(tt.ts, tt.unit)
			if (err != nil) != tt.wantErr {
				t.Errorf("TimestampToDate() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("TimestampToDate() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestTimestampToDateInTimezone(t *testing.T) {
	tests := []struct {
		name string
		ts   int64
		unit string
		tz   string
		want string
	}{
		{
			name: "utc",
			ts:   1700000000,
			unit: "s",
			tz:   "UTC",
			want: "2023-11-14 22:13:20",
		},
		{
			name: "shanghai",
			ts:   1700000000,
			unit: "s",
			tz:   "Asia/Shanghai",
			want: "2023-11-15 06:13:20",
		},
		{
			name: "milliseconds",
			ts:   1700000000000,
			unit: "ms",
			tz:   "UTC",
			want: "2023-11-14 22:13:20",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := TimestampToDateInTimezone(tt.ts, tt.unit, tt.tz)
			if err != nil {
				t.Fatalf("TimestampToDateInTimezone() error = %v", err)
			}
			if got != tt.want {
				t.Errorf("TimestampToDateInTimezone() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestDateToTimestamp(t *testing.T) {
	tests := []struct {
		name    string
		dateStr string
		tz      string
		want    int64
		wantErr bool
	}{
		{
			name:    "utc_standard_format",
			dateStr: "2023-11-14 22:13:20",
			tz:      "UTC",
			want:    1700000000,
			wantErr: false,
		},
		{
			name:    "shanghai_timezone",
			dateStr: "2023-11-15 06:13:20", // UTC+8, so 1700000000 - 8*3600 = same instant
			tz:      "Asia/Shanghai",
			want:    1700000000,
			wantErr: false,
		},
		{
			name:    "iso_format",
			dateStr: "2023-11-14T22:13:20",
			tz:      "UTC",
			want:    1700000000,
			wantErr: false,
		},
		{
			name:    "date_only",
			dateStr: "2023-01-01",
			tz:      "UTC",
			wantErr: false,
		},
		{
			name:    "rfc3339",
			dateStr: "2023-11-14T22:13:20Z",
			tz:      "UTC",
			want:    1700000000,
			wantErr: false,
		},
		{
			name:    "empty_date",
			dateStr: "",
			tz:      "UTC",
			want:    0,
			wantErr: true,
		},
		{
			name:    "invalid_date",
			dateStr: "not-a-date",
			tz:      "UTC",
			want:    0,
			wantErr: true,
		},
		{
			name:    "invalid_timezone_fallback_utc",
			dateStr: "2023-01-01 00:00:00",
			tz:      "Invalid/Timezone",
			wantErr: false, // Falls back to UTC
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := DateToTimestamp(tt.dateStr, tt.tz)
			if (err != nil) != tt.wantErr {
				t.Errorf("DateToTimestamp() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && tt.want != 0 && got != tt.want {
				t.Errorf("DateToTimestamp() = %d, want %d", got, tt.want)
			}
		})
	}
}

func TestMultiTimezone(t *testing.T) {
	ts := int64(1700000000)

	t.Run("seconds_unit", func(t *testing.T) {
		results, err := MultiTimezone(ts, "s")
		if err != nil {
			t.Fatalf("MultiTimezone() error = %v", err)
		}

		if len(results) != 8 {
			t.Errorf("MultiTimezone() returned %d results, want 8", len(results))
		}

		// Verify UTC result
		utcResult := findZoneResult(results, "UTC")
		if utcResult == nil {
			t.Fatal("UTC result not found")
		}
		expectedUTC := time.Unix(1700000000, 0).UTC().Format("2006-01-02 15:04:05")
		if utcResult.DateStr != expectedUTC {
			t.Errorf("UTC DateStr = %q, want %q", utcResult.DateStr, expectedUTC)
		}
		if utcResult.Offset != "+00:00" {
			t.Errorf("UTC Offset = %q, want +00:00", utcResult.Offset)
		}
	})

	t.Run("milliseconds_unit", func(t *testing.T) {
		results, err := MultiTimezone(ts*1000, "ms")
		if err != nil {
			t.Fatalf("MultiTimezone() error = %v", err)
		}
		if len(results) != 8 {
			t.Errorf("MultiTimezone() returned %d results, want 8", len(results))
		}

		// Verify UTC result is the same
		utcResult := findZoneResult(results, "UTC")
		if utcResult == nil {
			t.Fatal("UTC result not found")
		}
		expectedUTC := time.Unix(1700000000, 0).UTC().Format("2006-01-02 15:04:05")
		if utcResult.DateStr != expectedUTC {
			t.Errorf("UTC DateStr = %q, want %q", utcResult.DateStr, expectedUTC)
		}
	})

	t.Run("auto_detect_seconds", func(t *testing.T) {
		results, err := MultiTimezone(1700000000, "auto")
		if err != nil {
			t.Fatalf("MultiTimezone() error = %v", err)
		}
		utcResult := findZoneResult(results, "UTC")
		if utcResult == nil {
			t.Fatal("UTC result not found")
		}
		expectedUTC := time.Unix(1700000000, 0).UTC().Format("2006-01-02 15:04:05")
		if utcResult.DateStr != expectedUTC {
			t.Errorf("UTC DateStr = %q, want %q", utcResult.DateStr, expectedUTC)
		}
	})
}

func findZoneResult(results []TimezoneResult, zone string) *TimezoneResult {
	for _, r := range results {
		if r.Zone == zone {
			return &r
		}
	}
	return nil
}
