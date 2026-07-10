package jsonutil

import (
	"strings"
	"testing"

	"gopkg.in/yaml.v3"
)

func TestFormat(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		indent  int
		want    string
		wantErr bool
	}{
		{
			name:    "simple_object",
			input:   `{"key":"value"}`,
			indent:  2,
			want:    "{\n  \"key\": \"value\"\n}",
			wantErr: false,
		},
		{
			name:    "nested_object",
			input:   `{"outer":{"inner":1}}`,
			indent:  2,
			want:    "{\n  \"outer\": {\n    \"inner\": 1\n  }\n}",
			wantErr: false,
		},
		{
			name:    "array",
			input:   `[1,2,3]`,
			indent:  2,
			want:    "[\n  1,\n  2,\n  3\n]",
			wantErr: false,
		},
		{
			name:    "4_space_indent",
			input:   `{"a":"b"}`,
			indent:  4,
			want:    "{\n    \"a\": \"b\"\n}",
			wantErr: false,
		},
		{
			name:    "empty_input",
			input:   "",
			indent:  2,
			want:    "",
			wantErr: true,
		},
		{
			name:    "whitespace_only",
			input:   "   \t\n  ",
			indent:  2,
			want:    "",
			wantErr: true,
		},
		{
			name:    "invalid_json",
			input:   `{invalid}`,
			indent:  2,
			want:    "",
			wantErr: true,
		},
		{
			name:    "invalid_json_missing_bracket",
			input:   `{"key": "value"`,
			indent:  2,
			want:    "",
			wantErr: true,
		},
		{
			name:    "already_formatted",
			input:   "{\n  \"key\": \"value\"\n}",
			indent:  2,
			want:    "{\n  \"key\": \"value\"\n}",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Format(tt.input, tt.indent)
			if (err != nil) != tt.wantErr {
				t.Errorf("Format() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("Format() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestMinify(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		{
			name:    "formatted_object",
			input:   "{\n  \"key\": \"value\",\n  \"num\": 42\n}",
			want:    `{"key":"value","num":42}`,
			wantErr: false,
		},
		{
			name:    "already_minified",
			input:   `{"key":"value"}`,
			want:    `{"key":"value"}`,
			wantErr: false,
		},
		{
			name:    "array",
			input:   "[\n  1,\n  2,\n  3\n]",
			want:    `[1,2,3]`,
			wantErr: false,
		},
		{
			name:    "empty_input",
			input:   "",
			want:    "",
			wantErr: true,
		},
		{
			name:    "invalid_json",
			input:   `{broken}`,
			want:    "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Minify(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("Minify() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("Minify() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestValidate(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		{
			name:    "valid_object",
			input:   `{"key":"value"}`,
			want:    "Valid JSON",
			wantErr: false,
		},
		{
			name:    "valid_array",
			input:   `[1,2,3]`,
			want:    "Valid JSON",
			wantErr: false,
		},
		{
			name:    "valid_nested",
			input:   `{"a":{"b":1},"c":[2]}`,
			want:    "Valid JSON",
			wantErr: false,
		},
		{
			name:    "valid_number",
			input:   `42`,
			want:    "Valid JSON",
			wantErr: false,
		},
		{
			name:    "valid_string",
			input:   `"hello"`,
			want:    "Valid JSON",
			wantErr: false,
		},
		{
			name:    "invalid_json",
			input:   `{broken}`,
			want:    "Invalid JSON:",
			wantErr: false, // Validate returns invalid result, not an error
		},
		{
			name:    "empty_input",
			input:   "",
			want:    "",
			wantErr: true, // Empty input returns an error
		},
		{
			name:    "missing_bracket",
			input:   `{"key":"value"`,
			want:    "Invalid JSON:",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Validate(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if tt.want == "Invalid JSON:" {
					// Just check that it starts with "Invalid JSON:"
					if got[:len("Invalid JSON:")] != "Invalid JSON:" {
						t.Errorf("Validate() = %q, want prefix %q", got, tt.want)
					}
				} else if got != tt.want {
					t.Errorf("Validate() = %q, want %q", got, tt.want)
				}
			}
		})
	}
}

func TestToYAML(t *testing.T) {
	tests := []struct {
		name         string
		input        string
		indent       int
		wantContains []string
		wantErr      bool
	}{
		{
			name:         "simple_object",
			input:        `{"key":"value"}`,
			indent:       2,
			wantContains: []string{"key: value"},
			wantErr:      false,
		},
		{
			name:         "nested_object",
			input:        `{"parent":{"child":1}}`,
			indent:       4,
			wantContains: []string{"parent:", "    child: 1"},
			wantErr:      false,
		},
		{
			name:         "array_value",
			input:        `{"items":["a","b"]}`,
			indent:       2,
			wantContains: []string{"items:", "  - a", "  - b"},
			wantErr:      false,
		},
		{
			name:    "empty_input",
			input:   "",
			indent:  2,
			wantErr: true,
		},
		{
			name:    "invalid_json",
			input:   `{broken}`,
			indent:  2,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ToYAML(tt.input, tt.indent)
			if (err != nil) != tt.wantErr {
				t.Errorf("ToYAML() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if tt.wantErr {
				return
			}

			for _, want := range tt.wantContains {
				if !strings.Contains(got, want) {
					t.Errorf("ToYAML() = %q, want to contain %q", got, want)
				}
			}

			var parsed interface{}
			if err := yaml.Unmarshal([]byte(got), &parsed); err != nil {
				t.Errorf("ToYAML() output is not valid YAML: %v", err)
			}
		})
	}
}
