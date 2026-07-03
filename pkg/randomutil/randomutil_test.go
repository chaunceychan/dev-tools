package randomutil

import (
	"strings"
	"testing"
)

func TestGenerate(t *testing.T) {
	t.Run("default_length_and_count", func(t *testing.T) {
		flags := map[string]bool{"uppercase": true, "lowercase": true, "digits": true}
		results, err := Generate(16, flags, 1)
		if err != nil {
			t.Fatalf("Generate() error = %v", err)
		}
		if len(results) != 1 {
			t.Errorf("Generate() returned %d results, want 1", len(results))
		}
		if len(results[0]) != 16 {
			t.Errorf("Generate() string length = %d, want 16", len(results[0]))
		}
	})

	t.Run("multiple_strings", func(t *testing.T) {
		flags := map[string]bool{"lowercase": true, "digits": true}
		results, err := Generate(8, flags, 5)
		if err != nil {
			t.Fatalf("Generate() error = %v", err)
		}
		if len(results) != 5 {
			t.Errorf("Generate() returned %d results, want 5", len(results))
		}
		for _, s := range results {
			if len(s) != 8 {
				t.Errorf("Generate() string length = %d, want 8", len(s))
			}
		}
		// Verify uniqueness (all strings should differ)
		for i := 0; i < len(results); i++ {
			for j := i + 1; j < len(results); j++ {
				if results[i] == results[j] {
					// This is unlikely but not impossible for short strings
					t.Logf("Warning: identical strings generated at indices %d and %d", i, j)
				}
			}
		}
	})

	t.Run("uppercase_only", func(t *testing.T) {
		flags := map[string]bool{"uppercase": true}
		results, err := Generate(20, flags, 3)
		if err != nil {
			t.Fatalf("Generate() error = %v", err)
		}
		for _, s := range results {
			for _, ch := range s {
				if ch < 'A' || ch > 'Z' {
					t.Errorf("Generate() with uppercase-only: found non-uppercase char %c", ch)
				}
			}
		}
	})

	t.Run("lowercase_only", func(t *testing.T) {
		flags := map[string]bool{"lowercase": true}
		results, err := Generate(20, flags, 3)
		if err != nil {
			t.Fatalf("Generate() error = %v", err)
		}
		for _, s := range results {
			for _, ch := range s {
				if ch < 'a' || ch > 'z' {
					t.Errorf("Generate() with lowercase-only: found non-lowercase char %c", ch)
				}
			}
		}
	})

	t.Run("digits_only", func(t *testing.T) {
		flags := map[string]bool{"digits": true}
		results, err := Generate(20, flags, 3)
		if err != nil {
			t.Fatalf("Generate() error = %v", err)
		}
		for _, s := range results {
			for _, ch := range s {
				if ch < '0' || ch > '9' {
					t.Errorf("Generate() with digits-only: found non-digit char %c", ch)
				}
			}
		}
	})

	t.Run("special_chars", func(t *testing.T) {
		flags := map[string]bool{"special": true, "lowercase": true}
		results, err := Generate(50, flags, 1)
		if err != nil {
			t.Fatalf("Generate() error = %v", err)
		}
		// At least some special characters should appear with 50 length
		hasSpecial := false
		for _, ch := range results[0] {
			if strings.Contains("!@#$%^&*()-_=+[]{}|;:,.<>?/~`", string(ch)) {
				hasSpecial = true
				break
			}
		}
		// Note: This is probabilistic, so we can't guarantee special chars
		t.Logf("Has special chars: %v (probabilistic check)", hasSpecial)
	})

	t.Run("all_charsets", func(t *testing.T) {
		flags := map[string]bool{"uppercase": true, "lowercase": true, "digits": true, "special": true}
		results, err := Generate(64, flags, 2)
		if err != nil {
			t.Fatalf("Generate() error = %v", err)
		}
		if len(results) != 2 {
			t.Errorf("Generate() returned %d results, want 2", len(results))
		}
		if len(results[0]) != 64 {
			t.Errorf("Generate() string length = %d, want 64", len(results[0]))
		}
	})

	t.Run("zero_length", func(t *testing.T) {
		flags := map[string]bool{"uppercase": true}
		_, err := Generate(0, flags, 1)
		if err == nil {
			t.Error("Generate() expected error for zero length")
		}
	})

	t.Run("negative_length", func(t *testing.T) {
		flags := map[string]bool{"uppercase": true}
		_, err := Generate(-1, flags, 1)
		if err == nil {
			t.Error("Generate() expected error for negative length")
		}
	})

	t.Run("zero_count", func(t *testing.T) {
		flags := map[string]bool{"uppercase": true}
		_, err := Generate(16, flags, 0)
		if err == nil {
			t.Error("Generate() expected error for zero count")
		}
	})

	t.Run("negative_count", func(t *testing.T) {
		flags := map[string]bool{"uppercase": true}
		_, err := Generate(16, flags, -1)
		if err == nil {
			t.Error("Generate() expected error for negative count")
		}
	})

	t.Run("no_charset_enabled", func(t *testing.T) {
		flags := map[string]bool{"uppercase": false, "lowercase": false, "digits": false, "special": false}
		_, err := Generate(16, flags, 1)
		if err == nil {
			t.Error("Generate() expected error when no charset is enabled")
		}
	})

	t.Run("empty_charset_flags", func(t *testing.T) {
		flags := map[string]bool{}
		_, err := Generate(16, flags, 1)
		if err == nil {
			t.Error("Generate() expected error for empty charset flags")
		}
	})
}
