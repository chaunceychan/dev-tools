package main

import (
	"path/filepath"

	"github.com/devtools/dev-tools/pkg/base64util"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Base64EncodeText encodes a plain text string to Base64.
func (a *App) Base64EncodeText(input string) (string, error) {
	return base64util.EncodeText(input)
}

// Base64DecodeText decodes a Base64 string back to plain text.
func (a *App) Base64DecodeText(input string) (string, error) {
	return base64util.DecodeText(input)
}

// Base64EncodeFile reads a file and encodes its contents to Base64.
func (a *App) Base64EncodeFile(filePath string) (string, error) {
	return base64util.EncodeFile(filePath)
}

// Base64DecodeFile decodes a Base64 string and saves the result to a file.
func (a *App) Base64DecodeFile(filePath string, outputPath string) (string, error) {
	return base64util.DecodeFile(filePath, outputPath)
}

// SelectInputFile opens a native file picker and returns the selected file path.
func (a *App) SelectInputFile() (string, error) {
	return runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "选择文件",
	})
}

// SelectOutputFile opens a native save dialog and returns the selected output path.
func (a *App) SelectOutputFile(defaultFilename string) (string, error) {
	if defaultFilename == "" {
		defaultFilename = "decoded.bin"
	}
	return runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "保存解码文件",
		DefaultFilename: filepath.Base(defaultFilename),
	})
}
