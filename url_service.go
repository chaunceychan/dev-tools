package main

import "github.com/devtools/dev-tools/pkg/urlutil"

// UrlEncode percent-encodes text for URL usage.
func (a *App) UrlEncode(input string) (string, error) {
	return urlutil.Encode(input)
}

// UrlDecode decodes percent-encoded URL text.
func (a *App) UrlDecode(input string) (string, error) {
	return urlutil.Decode(input)
}

// UrlParseQuery formats query parameters from a full URL or query string.
func (a *App) UrlParseQuery(input string) (string, error) {
	return urlutil.ParseQuery(input)
}
