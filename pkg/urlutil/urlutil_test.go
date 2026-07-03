package urlutil

import (
	"strings"
	"testing"
)

func TestEncodeDecode(t *testing.T) {
	encoded, err := Encode("hello world+中文")
	if err != nil {
		t.Fatalf("Encode returned error: %v", err)
	}
	if encoded != "hello+world%2B%E4%B8%AD%E6%96%87" {
		t.Fatalf("unexpected encoded value: %s", encoded)
	}

	decoded, err := Decode(encoded)
	if err != nil {
		t.Fatalf("Decode returned error: %v", err)
	}
	if decoded != "hello world+中文" {
		t.Fatalf("unexpected decoded value: %s", decoded)
	}
}

func TestParseQuery(t *testing.T) {
	result, err := ParseQuery("https://example.com/path?b=2&a=hello+world")
	if err != nil {
		t.Fatalf("ParseQuery returned error: %v", err)
	}
	if !strings.Contains(result, "a = hello world") || !strings.Contains(result, "b = 2") {
		t.Fatalf("unexpected query parse result: %s", result)
	}
}
