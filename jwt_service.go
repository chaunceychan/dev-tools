package main

import "github.com/devtools/dev-tools/pkg/jwtutil"

// JwtDecode decodes a JWT without verifying its signature.
func (a *App) JwtDecode(input string) (string, error) {
	return jwtutil.Decode(input)
}
