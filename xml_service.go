package main

import (
	"github.com/devtools/dev-tools/pkg/xmlutil"
)

// XmlFormat formats XML input with the specified indentation level.
func (a *App) XmlFormat(input string, indent int) (string, error) {
	if indent <= 0 {
		indent = 2
	}
	return xmlutil.Format(input, indent)
}

// XmlMinify compresses XML by removing all whitespace between elements.
func (a *App) XmlMinify(input string) (string, error) {
	return xmlutil.Minify(input)
}

// XmlValidate checks if the input is well-formed XML.
func (a *App) XmlValidate(input string) (string, error) {
	return xmlutil.Validate(input)
}
