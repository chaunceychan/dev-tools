package base64util

import (
	"os"
	"path/filepath"
	"testing"
)

func TestEncodeText(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		{
			name:   "simple_text",
			input:  "Hello, World!",
			want:   "SGVsbG8sIFdvcmxkIQ==",
			wantErr: false,
		},
		{
			name:   "utf8_text",
			input:  "你好世界",
			want:   "5L2g5aW95LiW55WM",
			wantErr: false,
		},
		{
			name:   "empty_string_with_content",
			input:  "a",
			want:   "YQ==",
			wantErr: false,
		},
		{
			name:    "empty_input",
			input:   "",
			want:    "",
			wantErr: true,
		},
		{
			name:   "special_characters",
			input:  "!@#$%^&*()",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := EncodeText(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("EncodeText() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && tt.want != "" && got != tt.want {
				t.Errorf("EncodeText() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestDecodeText(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		{
			name:   "simple_decode",
			input:  "SGVsbG8sIFdvcmxkIQ==",
			want:   "Hello, World!",
			wantErr: false,
		},
		{
			name:   "utf8_decode",
			input:  "5L2g5aW95LiW55WM",
			want:   "你好世界",
			wantErr: false,
		},
		{
			name:    "empty_input",
			input:   "",
			want:    "",
			wantErr: true,
		},
		{
			name:    "invalid_base64",
			input:   "!!!invalid!!!",
			want:    "",
			wantErr: true,
		},
		{
			name:   "url_safe_base64",
			input:  "SGVsbG8sIFdvcmxkIQ", // URL-safe without padding
			wantErr: false, // Should fall back to URL-safe decoding
		},
		{
			name:   "whitespace_trimmed",
			input:  "  SGVsbG8sIFdvcmxkIQ==  ",
			want:   "Hello, World!",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := DecodeText(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("DecodeText() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && tt.want != "" && got != tt.want {
				t.Errorf("DecodeText() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestEncodeDecodeRoundTrip(t *testing.T) {
	inputs := []string{
		"Hello, World!",
		"你好世界",
		"The quick brown fox jumps over the lazy dog",
		"!@#$%^&*()_+-=[]{}|;':\",./<>?",
	}

	for _, original := range inputs {
		t.Run(original, func(t *testing.T) {
			encoded, err := EncodeText(original)
			if err != nil {
				t.Fatalf("EncodeText() error = %v", err)
			}

			decoded, err := DecodeText(encoded)
			if err != nil {
				t.Fatalf("DecodeText() error = %v", err)
			}

			if decoded != original {
				t.Errorf("Round trip failed: got %q, want %q", decoded, original)
			}
		})
	}
}

func TestEncodeFile(t *testing.T) {
	// Create a temp file for testing
	tmpDir := t.TempDir()
	testFile := filepath.Join(tmpDir, "test.txt")
	content := "Hello, File Content!"

	if err := os.WriteFile(testFile, []byte(content), 0644); err != nil {
		t.Fatalf("Failed to create test file: %v", err)
	}

	// Test successful encoding
	t.Run("valid_file", func(t *testing.T) {
		got, err := EncodeFile(testFile)
		if err != nil {
			t.Fatalf("EncodeFile() error = %v", err)
		}
		// Verify by decoding
		decoded, err := DecodeText(got)
		if err != nil {
			t.Fatalf("DecodeText() error = %v", err)
		}
		if decoded != content {
			t.Errorf("Encode/decode round trip: got %q, want %q", decoded, content)
		}
	})

	// Test empty path
	t.Run("empty_path", func(t *testing.T) {
		_, err := EncodeFile("")
		if err == nil {
			t.Error("EncodeFile() expected error for empty path")
		}
	})

	// Test file not found
	t.Run("file_not_found", func(t *testing.T) {
		_, err := EncodeFile(filepath.Join(tmpDir, "nonexistent.txt"))
		if err == nil {
			t.Error("EncodeFile() expected error for nonexistent file")
		}
	})
}

func TestDecodeFile(t *testing.T) {
	tmpDir := t.TempDir()

	// Create a base64-encoded source file
	srcFile := filepath.Join(tmpDir, "encoded.txt")
	encodedContent := "SGVsbG8sIERlY29kZWQgRmlsZSE=" // "Hello, Decoded File!"

	if err := os.WriteFile(srcFile, []byte(encodedContent), 0644); err != nil {
		t.Fatalf("Failed to create source file: %v", err)
	}

	outFile := filepath.Join(tmpDir, "decoded.txt")

	t.Run("valid_decode", func(t *testing.T) {
		got, err := DecodeFile(srcFile, outFile)
		if err != nil {
			t.Fatalf("DecodeFile() error = %v", err)
		}

		// Check the message
		if got[:len("Successfully decoded")] != "Successfully decoded" {
			t.Errorf("DecodeFile() = %q, want prefix 'Successfully decoded'", got)
		}

		// Verify output file content
		data, err := os.ReadFile(outFile)
		if err != nil {
			t.Fatalf("Failed to read output file: %v", err)
		}
		want := "Hello, Decoded File!"
		if string(data) != want {
			t.Errorf("Output file content = %q, want %q", string(data), want)
		}
	})

	t.Run("empty_source_path", func(t *testing.T) {
		_, err := DecodeFile("", outFile)
		if err == nil {
			t.Error("DecodeFile() expected error for empty source path")
		}
	})

	t.Run("empty_output_path", func(t *testing.T) {
		_, err := DecodeFile(srcFile, "")
		if err == nil {
			t.Error("DecodeFile() expected error for empty output path")
		}
	})
}

func TestCheckFileSize(t *testing.T) {
	tmpDir := t.TempDir()

	// Create a small test file
	smallFile := filepath.Join(tmpDir, "small.txt")
	if err := os.WriteFile(smallFile, []byte("small"), 0644); err != nil {
		t.Fatalf("Failed to create test file: %v", err)
	}

	t.Run("small_file_within_limit", func(t *testing.T) {
		err := CheckFileSize(smallFile, 10*1024*1024)
		if err != nil {
			t.Errorf("CheckFileSize() unexpected error = %v", err)
		}
	})

	t.Run("limit_zero_exceeds", func(t *testing.T) {
		err := CheckFileSize(smallFile, 0)
		if err == nil {
			t.Error("CheckFileSize() expected error for exceeding limit")
		}
	})

	t.Run("file_not_found", func(t *testing.T) {
		err := CheckFileSize(filepath.Join(tmpDir, "nonexistent.txt"), 10*1024*1024)
		if err == nil {
			t.Error("CheckFileSize() expected error for nonexistent file")
		}
	})
}
