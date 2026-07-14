package symmetricutil

import (
	"bytes"
	"encoding/base64"
	"testing"
)

func TestEncryptDecryptRoundTrip(t *testing.T) {
	cases := []struct {
		name      string
		algorithm string
	}{
		{name: "aes", algorithm: AlgorithmAES},
		{name: "sm4", algorithm: AlgorithmSM4},
		{name: "3des", algorithm: Algorithm3DES},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			encrypted, err := Encrypt("hello world", "correct horse battery staple", tc.algorithm)
			if err != nil {
				t.Fatalf("Encrypt returned error: %v", err)
			}

			if _, err := base64.StdEncoding.DecodeString(encrypted); err != nil {
				t.Fatalf("Encrypt did not return valid Base64: %v", err)
			}

			decrypted, err := Decrypt(encrypted, "correct horse battery staple", tc.algorithm)
			if err != nil {
				t.Fatalf("Decrypt returned error: %v", err)
			}
			if decrypted != "hello world" {
				t.Fatalf("unexpected decrypted value: %q", decrypted)
			}
		})
	}
}

func TestEncryptDecryptPreservesTextAndKey(t *testing.T) {
	input := "  保留首尾空白\n"
	key := "  key with spaces  "

	encrypted, err := Encrypt(input, key, AlgorithmAES)
	if err != nil {
		t.Fatalf("Encrypt returned error: %v", err)
	}

	decrypted, err := Decrypt(encrypted, key, AlgorithmAES)
	if err != nil {
		t.Fatalf("Decrypt returned error: %v", err)
	}
	if decrypted != input {
		t.Fatalf("unexpected decrypted value: %q", decrypted)
	}
	if bytes.Equal(deriveKeyMaterial(key), deriveKeyMaterial("key with spaces")) {
		t.Fatal("key derivation must preserve leading and trailing whitespace")
	}
}

func TestEncryptDecryptEmptyText(t *testing.T) {
	encrypted, err := Encrypt("", "key", AlgorithmAES)
	if err != nil {
		t.Fatalf("Encrypt returned error: %v", err)
	}

	decrypted, err := Decrypt(encrypted, "key", AlgorithmAES)
	if err != nil {
		t.Fatalf("Decrypt returned error: %v", err)
	}
	if decrypted != "" {
		t.Fatalf("unexpected decrypted value: %q", decrypted)
	}
}

func TestDecryptRejectsTamperedCiphertext(t *testing.T) {
	encrypted, err := Encrypt("hello world", "key", AlgorithmAES)
	if err != nil {
		t.Fatalf("Encrypt returned error: %v", err)
	}
	payload, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		t.Fatalf("DecodeString returned error: %v", err)
	}
	payload[len(payload)-macSize-1] ^= 1

	if _, err := Decrypt(base64.StdEncoding.EncodeToString(payload), "key", AlgorithmAES); err == nil {
		t.Fatal("expected error for tampered ciphertext")
	}
}

func TestDecryptRejectsWrongAlgorithm(t *testing.T) {
	encrypted, err := Encrypt("hello world", "key", AlgorithmAES)
	if err != nil {
		t.Fatalf("Encrypt returned error: %v", err)
	}

	if _, err := Decrypt(encrypted, "key", AlgorithmSM4); err == nil {
		t.Fatal("expected error for an algorithm mismatch")
	}
}

func TestDecryptAcceptsUnpaddedBase64(t *testing.T) {
	encrypted, err := Encrypt("hello world", "key", AlgorithmAES)
	if err != nil {
		t.Fatalf("Encrypt returned error: %v", err)
	}
	payload, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		t.Fatalf("DecodeString returned error: %v", err)
	}

	for _, encoded := range []string{
		base64.RawStdEncoding.EncodeToString(payload),
		base64.RawURLEncoding.EncodeToString(payload),
	} {
		decrypted, err := Decrypt(encoded, "key", AlgorithmAES)
		if err != nil {
			t.Fatalf("Decrypt returned error: %v", err)
		}
		if decrypted != "hello world" {
			t.Fatalf("unexpected decrypted value: %q", decrypted)
		}
	}
}

func TestSM4KnownVector(t *testing.T) {
	cipher, err := newSM4Cipher(mustDecodeHex(t, "0123456789abcdeffedcba9876543210"))
	if err != nil {
		t.Fatalf("newSM4Cipher returned error: %v", err)
	}

	src := mustDecodeHex(t, "0123456789abcdeffedcba9876543210")
	dst := make([]byte, 16)
	cipher.Encrypt(dst, src)

	want := mustDecodeHex(t, "681edf34d206965e86b3e94f536e4246")
	if !bytes.Equal(dst, want) {
		t.Fatalf("unexpected SM4 ciphertext:\nwant %x\ngot  %x", want, dst)
	}
}

func TestErrors(t *testing.T) {
	if _, err := Encrypt("hello", "", AlgorithmAES); err == nil {
		t.Fatal("expected error for empty key")
	}
	if _, err := Decrypt("not-base64", "key", AlgorithmAES); err == nil {
		t.Fatal("expected error for invalid Base64")
	}
	if _, err := Encrypt("hello", "key", "unknown"); err == nil {
		t.Fatal("expected error for unsupported algorithm")
	}
}

func mustDecodeHex(t *testing.T, hex string) []byte {
	t.Helper()

	out := make([]byte, len(hex)/2)
	for i := 0; i < len(out); i++ {
		out[i] = hexByte(t, hex[i*2])<<4 | hexByte(t, hex[i*2+1])
	}
	return out
}

func hexByte(t *testing.T, b byte) byte {
	t.Helper()

	switch {
	case b >= '0' && b <= '9':
		return b - '0'
	case b >= 'a' && b <= 'f':
		return b - 'a' + 10
	case b >= 'A' && b <= 'F':
		return b - 'A' + 10
	default:
		t.Fatalf("invalid hex character: %q", b)
		return 0
	}
}
