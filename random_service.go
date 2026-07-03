package main

import (
	"github.com/devtools/dev-tools/pkg/randomutil"
)

// RandomGenerate generates random strings based on the provided parameters.
func (a *App) RandomGenerate(params RandomParams) ([]string, error) {
	return randomutil.Generate(params.Length, params.CharsetFlags, params.Count)
}
