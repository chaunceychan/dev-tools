package xmlutil

import (
	"encoding/xml"
	"strings"
	"testing"
)

func TestFormat(t *testing.T) {
	tests := []struct {
		name         string
		input        string
		indent       int
		wantContains string
		wantErr      bool
	}{
		{
			name:         "simple_element",
			input:        `<root><child>text</child></root>`,
			indent:       2,
			wantContains: "<root>",
			wantErr:      false,
		},
		{
			name:         "nested_elements",
			input:        `<root><parent><child>value</child></parent></root>`,
			indent:       2,
			wantContains: "<parent>",
			wantErr:      false,
		},
		{
			name:         "element_with_attribute",
			input:        `<root attr="val"><child>text</child></root>`,
			indent:       2,
			wantContains: `attr="val"`,
			wantErr:      false,
		},
		{
			name:         "self_closing_element",
			input:        `<root><empty/></root>`,
			indent:       2,
			wantContains: "<empty",
			wantErr:      false,
		},
		{
			name:         "4_space_indent",
			input:        `<root><child>text</child></root>`,
			indent:       4,
			wantContains: "<root>",
			wantErr:      false,
		},
		{
			name:         "empty_input",
			input:        "",
			indent:       2,
			wantContains: "",
			wantErr:      true,
		},
		{
			name:         "invalid_xml",
			input:        `<root><unclosed>`,
			indent:       2,
			wantContains: "",
			wantErr:      true,
		},
		{
			name:         "xml_with_comment",
			input:        `<root><!-- comment --><child>text</child></root>`,
			indent:       2,
			wantContains: "<!-- comment -->",
			wantErr:      false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Format(tt.input, tt.indent)
			if (err != nil) != tt.wantErr {
				t.Errorf("Format() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && tt.wantContains != "" {
				if !containsStr(got, tt.wantContains) {
					t.Errorf("Format() = %q, want to contain %q", got, tt.wantContains)
				}
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
			name:    "formatted_xml",
			input:   "<root>\n  <child>text</child>\n</root>",
			want:    "<root><child>text</child></root>",
			wantErr: false,
		},
		{
			name:    "already_minified",
			input:   `<root><child>text</child></root>`,
			want:    "<root><child>text</child></root>",
			wantErr: false,
		},
		{
			name:    "with_attributes",
			input:   `<root attr="val">\n  <child>text</child>\n</root>`,
			wantErr: false,
		},
		{
			name:    "empty_input",
			input:   "",
			want:    "",
			wantErr: true,
		},
		{
			name:    "invalid_xml",
			input:   `<root><unclosed>`,
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
			if !tt.wantErr && tt.want != "" && got != tt.want {
				t.Errorf("Minify() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestFormatMinifyRoundTrip(t *testing.T) {
	input := `<root><parent><child1>text1</child1><child2>text2</child2></parent></root>`

	// Format then minify should return equivalent content
	formatted, err := Format(input, 2)
	if err != nil {
		t.Fatalf("Format() error = %v", err)
	}

	minified, err := Minify(formatted)
	if err != nil {
		t.Fatalf("Minify() error = %v", err)
	}

	// The minified result should match the original minified form
	originalMinified, err := Minify(input)
	if err != nil {
		t.Fatalf("Minify original() error = %v", err)
	}

	if minified != originalMinified {
		t.Errorf("Format/Minify round trip: got %q, want %q", minified, originalMinified)
	}
}

func TestFormatEscapesTextAndAttributes(t *testing.T) {
	input := `<root attr="Tom &amp; Jerry">A &amp; B</root>`

	formatted, err := Format(input, 2)
	if err != nil {
		t.Fatalf("Format() error = %v", err)
	}

	if strings.Contains(formatted, "A & B") {
		t.Fatalf("Format() emitted unescaped text: %q", formatted)
	}
	if strings.Contains(formatted, `attr="Tom & Jerry"`) {
		t.Fatalf("Format() emitted unescaped attribute: %q", formatted)
	}
	if err := xml.Unmarshal([]byte(formatted), new(interface{})); err != nil {
		t.Fatalf("Format() output is not valid XML: %v\n%s", err, formatted)
	}
}

func TestMinifyEscapesTextAndAttributes(t *testing.T) {
	input := `<root attr="Tom &amp; Jerry">A &amp; B</root>`

	minified, err := Minify(input)
	if err != nil {
		t.Fatalf("Minify() error = %v", err)
	}

	if strings.Contains(minified, "A & B") {
		t.Fatalf("Minify() emitted unescaped text: %q", minified)
	}
	if strings.Contains(minified, `attr="Tom & Jerry"`) {
		t.Fatalf("Minify() emitted unescaped attribute: %q", minified)
	}
	if err := xml.Unmarshal([]byte(minified), new(interface{})); err != nil {
		t.Fatalf("Minify() output is not valid XML: %v\n%s", err, minified)
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
			name:    "valid_simple",
			input:   `<root><child>text</child></root>`,
			want:    "Valid XML",
			wantErr: false,
		},
		{
			name:    "valid_with_attributes",
			input:   `<root attr="val"><child>text</child></root>`,
			want:    "Valid XML",
			wantErr: false,
		},
		{
			name:    "valid_self_closing",
			input:   `<root><empty/></root>`,
			want:    "Valid XML",
			wantErr: false,
		},
		{
			name:    "invalid_xml",
			input:   `<root><unclosed>`,
			want:    "Invalid XML:",
			wantErr: false, // Validate returns invalid result, not error
		},
		{
			name:    "empty_input",
			input:   "",
			want:    "",
			wantErr: true,
		},
		{
			name:    "malformed_tag",
			input:   `<root>text</root><extra>`,
			want:    "Invalid XML:",
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
				if tt.want == "Invalid XML:" {
					if got[:len("Invalid XML:")] != "Invalid XML:" {
						t.Errorf("Validate() = %q, want prefix %q", got, tt.want)
					}
				} else if got != tt.want {
					t.Errorf("Validate() = %q, want %q", got, tt.want)
				}
			}
		})
	}
}

func containsStr(s, sub string) bool {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
