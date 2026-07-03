package main

import (
	"github.com/devtools/dev-tools/pkg/yamlutil"
)

// YamlFormat formats YAML input with the specified indentation level.
func (a *App) YamlFormat(input string, indent int) (string, error) {
	if indent <= 0 {
		indent = 2
	}
	return yamlutil.Format(input, indent)
}

// YamlValidate checks if the input is valid YAML.
func (a *App) YamlValidate(input string) (string, error) {
	return yamlutil.Validate(input)
}

// YamlToJSON converts YAML input to JSON format.
func (a *App) YamlToJSON(input string) (string, error) {
	return yamlutil.ToJSON(input)
}
