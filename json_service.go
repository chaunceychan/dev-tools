package main

import (
	"github.com/devtools/dev-tools/pkg/jsonutil"
)

// JsonFormat formats JSON input with the specified indentation level.
func (a *App) JsonFormat(input string, indent int) (string, error) {
	if indent <= 0 {
		indent = 2
	}
	return jsonutil.Format(input, indent)
}

// JsonMinify compresses JSON by removing all whitespace.
func (a *App) JsonMinify(input string) (string, error) {
	return jsonutil.Minify(input)
}

// JsonValidate checks if the input is valid JSON.
func (a *App) JsonValidate(input string) (string, error) {
	return jsonutil.Validate(input)
}
