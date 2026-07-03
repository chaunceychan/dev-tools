package main

import (
	"strings"

	"github.com/devtools/dev-tools/pkg/uuidutil"
)

// UuidGenerate creates UUID v4 values.
func (a *App) UuidGenerate(count int, uppercase bool, noHyphen bool) (string, error) {
	results, err := uuidutil.Generate(count, uppercase, noHyphen)
	if err != nil {
		return "", err
	}
	return strings.Join(results, "\n"), nil
}

// UuidValidate checks whether input is a valid UUID.
func (a *App) UuidValidate(input string) (string, error) {
	return uuidutil.Validate(input)
}
