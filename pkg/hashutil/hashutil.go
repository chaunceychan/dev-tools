package hashutil

import (
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"hash"
	"strings"
)

// Generate computes the requested hash for a text input.
func Generate(input string, algorithm string) (string, error) {
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	h, name, err := newHash(algorithm)
	if err != nil {
		return "", err
	}

	h.Write([]byte(input))
	return fmt.Sprintf("%s: %s", name, hex.EncodeToString(h.Sum(nil))), nil
}

// GenerateAll computes common hashes for a text input.
func GenerateAll(input string) (string, error) {
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	algorithms := []string{"md5", "sha1", "sha256", "sha512"}
	lines := make([]string, 0, len(algorithms))
	for _, algorithm := range algorithms {
		result, err := Generate(input, algorithm)
		if err != nil {
			return "", err
		}
		lines = append(lines, result)
	}
	return strings.Join(lines, "\n"), nil
}

func newHash(algorithm string) (hash.Hash, string, error) {
	switch strings.ToLower(strings.TrimSpace(algorithm)) {
	case "md5":
		return md5.New(), "MD5", nil
	case "sha1", "sha-1":
		return sha1.New(), "SHA1", nil
	case "sha256", "sha-256":
		return sha256.New(), "SHA256", nil
	case "sha512", "sha-512":
		return sha512.New(), "SHA512", nil
	default:
		return nil, "", fmt.Errorf("unsupported hash algorithm: %s", algorithm)
	}
}
