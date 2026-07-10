package diffutil

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestCompareTextNoDifference(t *testing.T) {
	result, err := CompareText("alpha\nbeta", "alpha\nbeta", "left.txt", "right.txt")
	if err != nil {
		t.Fatalf("CompareText returned error: %v", err)
	}

	if !strings.Contains(result, "两段内容一致，没有差异。") {
		t.Fatalf("expected no-diff message, got %q", result)
	}
}

func TestCompareTextShowsChangedLines(t *testing.T) {
	result, err := CompareText("alpha\nbeta\ngamma", "alpha\nbravo\ngamma", "left", "right")
	if err != nil {
		t.Fatalf("CompareText returned error: %v", err)
	}

	assertContainsAll(t, result,
		"--- left",
		"+++ right",
		"@@ -1,3 +1,3 @@",
		"-beta",
		"+bravo",
	)
}

func TestCompareTextShowsInsertedAndDeletedLines(t *testing.T) {
	result, err := CompareText("alpha\nbeta", "alpha\nbeta\ngamma", "left", "right")
	if err != nil {
		t.Fatalf("CompareText returned error: %v", err)
	}

	assertContainsAll(t, result,
		"@@ -1,2 +1,3 @@",
		"+gamma",
	)
}

func TestCompareFiles(t *testing.T) {
	dir := t.TempDir()
	leftPath := filepath.Join(dir, "left.txt")
	rightPath := filepath.Join(dir, "right.txt")

	if err := os.WriteFile(leftPath, []byte("one\ntwo\nthree"), 0o644); err != nil {
		t.Fatalf("write left file: %v", err)
	}
	if err := os.WriteFile(rightPath, []byte("one\ntwo\nfour"), 0o644); err != nil {
		t.Fatalf("write right file: %v", err)
	}

	result, err := CompareFiles(leftPath, rightPath)
	if err != nil {
		t.Fatalf("CompareFiles returned error: %v", err)
	}

	assertContainsAll(t, result,
		"--- left.txt",
		"+++ right.txt",
		"-three",
		"+four",
	)
}

func assertContainsAll(t *testing.T, text string, parts ...string) {
	t.Helper()

	for _, part := range parts {
		if !strings.Contains(text, part) {
			t.Fatalf("expected %q to contain %q", text, part)
		}
	}
}
