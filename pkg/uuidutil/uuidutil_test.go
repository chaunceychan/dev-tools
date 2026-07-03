package uuidutil

import (
	"strings"
	"testing"
)

func TestGenerate(t *testing.T) {
	results, err := Generate(3, true, true)
	if err != nil {
		t.Fatalf("Generate returned error: %v", err)
	}
	if len(results) != 3 {
		t.Fatalf("expected 3 UUIDs, got %d", len(results))
	}
	for _, result := range results {
		if strings.Contains(result, "-") {
			t.Fatalf("expected UUID without hyphen: %s", result)
		}
		if result != strings.ToUpper(result) {
			t.Fatalf("expected uppercase UUID: %s", result)
		}
	}
}

func TestValidate(t *testing.T) {
	result, err := Validate("550e8400-e29b-41d4-a716-446655440000")
	if err != nil {
		t.Fatalf("Validate returned error: %v", err)
	}
	if !strings.Contains(result, "Valid UUID") {
		t.Fatalf("unexpected validation result: %s", result)
	}
}
