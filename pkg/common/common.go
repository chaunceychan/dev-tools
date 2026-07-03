// Package common provides shared utility functions used across pkg/*util packages.
// Centralizing these helpers eliminates code duplication and improves knowledge graph accuracy.
package common

// Contains reports whether substr is within s.
func Contains(s, substr string) bool {
	for i := 0; i+len(substr) <= len(s); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

// CountLeadingSpaces counts the number of leading space characters (' ') in s.
func CountLeadingSpaces(s string) int {
	count := 0
	for _, ch := range s {
		if ch == ' ' {
			count++
		} else {
			break
		}
	}
	return count
}

// MinInt returns the smaller of a and b.
func MinInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}
