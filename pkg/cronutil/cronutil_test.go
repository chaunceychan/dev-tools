package cronutil

import (
	"strings"
	"testing"
	"time"
)

func TestParse(t *testing.T) {
	tests := []struct {
		name       string
		expression string
		wantValid  bool
		wantErr    bool
		wantDescContains string
	}{
		{
			name:       "every_minute_5field",
			expression: "* * * * *",
			wantValid:  true,
			wantErr:    false,
			wantDescContains: "any",
		},
		{
			name:       "specific_minute_5field",
			expression: "30 * * * *",
			wantValid:  true,
			wantErr:    false,
			wantDescContains: "minute",
		},
		{
			name:       "every_5_minutes",
			expression: "*/5 * * * *",
			wantValid:  true,
			wantErr:    false,
			wantDescContains: "5",
		},
		{
			name:       "range_expression",
			expression: "0 9 * * 1-5",
			wantValid:  true,
			wantErr:    false,
			wantDescContains: "range",
		},
		{
			name:       "6field_with_seconds",
			expression: "0 */2 * * * *",
			wantValid:  true,
			wantErr:    false,
			wantDescContains: "second",
		},
		{
			name:       "empty_expression",
			expression: "",
			wantValid:  false,
			wantErr:    true,
			wantDescContains: "empty",
		},
		{
			name:       "invalid_syntax",
			expression: "invalid",
			wantValid:  false,
			wantErr:    false, // Parse returns result with isValid=false, not error
			wantDescContains: "invalid",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := Parse(tt.expression)
			if (err != nil) != tt.wantErr {
				t.Errorf("Parse() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if result.IsValid != tt.wantValid {
				t.Errorf("Parse() IsValid = %v, want %v", result.IsValid, tt.wantValid)
			}
			if tt.wantDescContains != "" && !strings.Contains(result.Description, tt.wantDescContains) {
				t.Errorf("Parse() Description = %q, want to contain %q", result.Description, tt.wantDescContains)
			}
		})
	}
}

func TestValidate(t *testing.T) {
	tests := []struct {
		name       string
		expression string
		want       string
		wantErr    bool
	}{
		{
			name:       "valid_5field",
			expression: "* * * * *",
			want:       "Valid cron expression",
			wantErr:    false,
		},
		{
			name:       "valid_6field",
			expression: "0 * * * * *",
			want:       "Valid cron expression",
			wantErr:    false,
		},
		{
			name:       "invalid_expression",
			expression: "invalid",
			want:       "Invalid cron expression:",
			wantErr:    false, // Validate returns result, not error
		},
		{
			name:       "empty_expression",
			expression: "",
			want:       "",
			wantErr:    true,
		},
		{
			name:       "valid_every_5min",
			expression: "*/5 * * * *",
			want:       "Valid cron expression",
			wantErr:    false,
		},
		{
			name:       "valid_range",
			expression: "0 9 * * 1-5",
			want:       "Valid cron expression",
			wantErr:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Validate(tt.expression)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if tt.want == "Invalid cron expression:" {
					if got[:len("Invalid cron expression:")] != "Invalid cron expression:" {
						t.Errorf("Validate() = %q, want prefix %q", got, tt.want)
					}
				} else if got != tt.want {
					t.Errorf("Validate() = %q, want %q", got, tt.want)
				}
			}
		})
	}
}

func TestNextN(t *testing.T) {
	t.Run("every_minute_5field", func(t *testing.T) {
		results, err := NextN("* * * * *", 3)
		if err != nil {
			t.Fatalf("NextN() error = %v", err)
		}
		if len(results) != 3 {
			t.Errorf("NextN() returned %d results, want 3", len(results))
		}

		// Verify results are in the future and sequential
		now := time.Now()
		for _, r := range results {
			parsed, err := time.Parse("2006-01-02 15:04:05", r)
			if err != nil {
				t.Errorf("NextN() result %q is not a valid datetime", r)
			}
			if parsed.Before(now) {
				t.Errorf("NextN() result %q is in the past", r)
			}
		}
	})

	t.Run("specific_cron", func(t *testing.T) {
		results, err := NextN("0 */2 * * *", 5)
		if err != nil {
			t.Fatalf("NextN() error = %v", err)
		}
		if len(results) != 5 {
			t.Errorf("NextN() returned %d results, want 5", len(results))
		}
	})

	t.Run("6field_with_seconds", func(t *testing.T) {
		results, err := NextN("0 * * * * *", 3)
		if err != nil {
			t.Fatalf("NextN() error = %v", err)
		}
		if len(results) != 3 {
			t.Errorf("NextN() returned %d results, want 3", len(results))
		}
	})

	t.Run("empty_expression", func(t *testing.T) {
		_, err := NextN("", 3)
		if err == nil {
			t.Error("NextN() expected error for empty expression")
		}
	})

	t.Run("invalid_expression", func(t *testing.T) {
		_, err := NextN("invalid", 3)
		if err == nil {
			t.Error("NextN() expected error for invalid expression")
		}
	})

	t.Run("default_count", func(t *testing.T) {
		results, err := NextN("* * * * *", 0)
		if err != nil {
			t.Fatalf("NextN() error = %v", err)
		}
		// count <= 0 should default to 5
		if len(results) != 5 {
			t.Errorf("NextN() with count=0 returned %d results, want 5 (default)", len(results))
		}
	})
}

func TestGenerateInterval(t *testing.T) {
	tests := []struct {
		name     string
		interval int
		unit     string
		want     string
		wantErr  bool
	}{
		{"every_30_seconds", 30, "second", "*/30 * * * * *", false},
		{"every_5_minutes", 5, "minute", "*/5 * * * *", false},
		{"every_2_hours", 2, "hour", "0 */2 * * *", false},
		{"every_3_days", 3, "day", "0 0 */3 * *", false},
		{"every_week", 1, "week", "0 0 * * */1", false},
		{"every_2_months", 2, "month", "0 0 1 */2 *", false},
		{"zero_interval", 0, "minute", "", true},
		{"too_large_interval", 366, "minute", "", true},
		{"unknown_unit", 5, "year", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := GenerateInterval(tt.interval, tt.unit)
			if (err != nil) != tt.wantErr {
				t.Errorf("GenerateInterval() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && got != tt.want {
				t.Errorf("GenerateInterval() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestGenerateFixedTime(t *testing.T) {
	tests := []struct {
		name     string
		scenario string
		hour     int
		min      int
		dayOrDow int
		want     string
		wantErr  bool
	}{
		{"daily_1am", "daily", 1, 0, 0, "0 1 * * *", false},
		{"daily_930am", "daily", 9, 30, 0, "30 9 * * *", false},
		{"weekday_9am", "weekday", 9, 0, 0, "0 9 * * 1-5", false},
		{"weekly_monday_8am", "weekly", 8, 0, 1, "0 8 * * 1", false},
		{"weekly_sunday_8am", "weekly", 8, 0, 7, "0 8 * * 0", false},
		{"monthly_1st", "monthly", 0, 0, 1, "0 0 1 * *", false},
		{"monthly_15th", "monthly", 12, 30, 15, "30 12 15 * *", false},
		{"bad_hour", "daily", 24, 0, 0, "", true},
		{"bad_minute", "daily", 0, 60, 0, "", true},
		{"bad_weekly_dow", "weekly", 8, 0, 8, "", true},
		{"bad_monthly_day", "monthly", 0, 0, 32, "", true},
		{"unknown_scenario", "yearly", 0, 0, 1, "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := GenerateFixedTime(tt.scenario, tt.hour, tt.min, tt.dayOrDow)
			if (err != nil) != tt.wantErr {
				t.Errorf("GenerateFixedTime() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && got != tt.want {
				t.Errorf("GenerateFixedTime() = %q, want %q", got, tt.want)
			}
		})
	}
}
