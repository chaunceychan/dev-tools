package main

import "github.com/devtools/dev-tools/pkg/regexutil"

// RegexTest returns matches and capture groups.
func (a *App) RegexTest(pattern string, text string) (string, error) {
	return regexutil.Test(pattern, text)
}

// RegexReplace applies a regexp replacement to text.
func (a *App) RegexReplace(pattern string, replacement string, text string) (string, error) {
	return regexutil.Replace(pattern, replacement, text)
}
