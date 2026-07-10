package main

import "github.com/devtools/dev-tools/pkg/diffutil"

// TextDiffCompareText compares two text inputs and returns a line diff.
func (a *App) TextDiffCompareText(left string, right string) (string, error) {
	return diffutil.CompareText(left, right, "左侧文本", "右侧文本")
}

// TextDiffCompareFiles compares two text files and returns a line diff.
func (a *App) TextDiffCompareFiles(leftPath string, rightPath string) (string, error) {
	return diffutil.CompareFiles(leftPath, rightPath)
}
