package regexutil

import (
	"strings"
	"testing"
)

func TestTest(t *testing.T) {
	result, err := Test(`(?P<word>\w+)=(\d+)`, "foo=123 bar=456")
	if err != nil {
		t.Fatalf("Test returned error: %v", err)
	}
	for _, part := range []string{"Matches: 2", "Group 1 (word): \"foo\"", "Group 2: \"123\""} {
		if !strings.Contains(result, part) {
			t.Fatalf("missing %q in result: %s", part, result)
		}
	}
}

func TestReplace(t *testing.T) {
	result, err := Replace(`\d+`, "#", "a1 b22")
	if err != nil {
		t.Fatalf("Replace returned error: %v", err)
	}
	if result != "a# b#" {
		t.Fatalf("unexpected replacement: %s", result)
	}
}
