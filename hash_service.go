package main

import "github.com/devtools/dev-tools/pkg/hashutil"

// HashGenerate computes one hash algorithm for text.
func (a *App) HashGenerate(input string, algorithm string) (string, error) {
	return hashutil.Generate(input, algorithm)
}

// HashGenerateAll computes common hashes for text.
func (a *App) HashGenerateAll(input string) (string, error) {
	return hashutil.GenerateAll(input)
}
