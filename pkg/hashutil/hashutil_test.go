package hashutil

import (
	"strings"
	"testing"
)

func TestGenerate(t *testing.T) {
	result, err := Generate("hello", "sha256")
	if err != nil {
		t.Fatalf("Generate returned error: %v", err)
	}
	want := "SHA256: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
	if result != want {
		t.Fatalf("unexpected hash:\nwant %s\ngot  %s", want, result)
	}
}

func TestGenerateAll(t *testing.T) {
	result, err := GenerateAll("hello")
	if err != nil {
		t.Fatalf("GenerateAll returned error: %v", err)
	}
	for _, name := range []string{"MD5:", "SHA1:", "SHA256:", "SHA512:"} {
		if !strings.Contains(result, name) {
			t.Fatalf("missing %s in result: %s", name, result)
		}
	}
}
