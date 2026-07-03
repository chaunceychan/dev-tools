package jwtutil

import (
	"strings"
	"testing"
)

func TestDecode(t *testing.T) {
	token := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWxpY2UifQ.signature"
	result, err := Decode(token)
	if err != nil {
		t.Fatalf("Decode returned error: %v", err)
	}
	for _, part := range []string{`"alg": "HS256"`, `"sub": "123"`, "not verified"} {
		if !strings.Contains(result, part) {
			t.Fatalf("missing %q in result: %s", part, result)
		}
	}
}

func TestDecodeInvalidSegmentCount(t *testing.T) {
	if _, err := Decode("a.b"); err == nil {
		t.Fatal("expected invalid JWT error")
	}
}
