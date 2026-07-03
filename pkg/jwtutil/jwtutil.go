package jwtutil

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
)

// Decode decodes a JWT header and payload without verifying its signature.
func Decode(input string) (string, error) {
	token := strings.TrimSpace(input)
	if token == "" {
		return "", fmt.Errorf("input is empty")
	}

	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return "", fmt.Errorf("invalid JWT: expected 3 segments, got %d", len(parts))
	}

	header, err := decodeJSONSegment(parts[0])
	if err != nil {
		return "", fmt.Errorf("invalid header: %v", err)
	}
	payload, err := decodeJSONSegment(parts[1])
	if err != nil {
		return "", fmt.Errorf("invalid payload: %v", err)
	}

	signatureNote := "present"
	if parts[2] == "" {
		signatureNote = "empty"
	}

	return fmt.Sprintf("Header:\n%s\n\nPayload:\n%s\n\nSignature: %s (not verified)", header, payload, signatureNote), nil
}

func decodeJSONSegment(segment string) (string, error) {
	data, err := base64.RawURLEncoding.DecodeString(segment)
	if err != nil {
		return "", err
	}

	var value interface{}
	if err := json.Unmarshal(data, &value); err != nil {
		return "", err
	}

	formatted, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return "", err
	}
	return string(formatted), nil
}
