package randomutil

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"strings"
)

// Character set definitions for random string generation.
var charsets = map[string]string{
	"uppercase": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	"lowercase": "abcdefghijklmnopqrstuvwxyz",
	"digits":    "0123456789",
	"special":   "!@#$%^&*()-_=+[]{}|;:,.<>?/~`",
}

// Generate produces random strings based on the specified parameters.
// charsetFlags specifies which character sets to include (uppercase, lowercase, digits, special).
// count specifies how many strings to generate.
// length specifies the length of each string.
func Generate(length int, charsetFlags map[string]bool, count int) ([]string, error) {
	if length <= 0 {
		return nil, fmt.Errorf("length must be positive")
	}
	if count <= 0 {
		return nil, fmt.Errorf("count must be positive")
	}

	// Build the character pool from enabled charset flags
	var pool string
	for flag, enabled := range charsetFlags {
		if enabled {
			if chars, ok := charsets[flag]; ok {
				pool += chars
			}
		}
	}

	if pool == "" {
		return nil, fmt.Errorf("at least one character set must be enabled")
	}

	// Generate random strings
	results := make([]string, count)
	poolLen := big.NewInt(int64(len(pool)))

	for i := 0; i < count; i++ {
		var sb strings.Builder
		for j := 0; j < length; j++ {
			idx, err := rand.Int(rand.Reader, poolLen)
			if err != nil {
				return nil, fmt.Errorf("random generation error: %v", err)
			}
			sb.WriteByte(pool[idx.Int64()])
		}
		results[i] = sb.String()
	}

	return results, nil
}
