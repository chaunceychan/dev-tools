package main

import "github.com/devtools/dev-tools/pkg/symmetricutil"

// SymmetricEncrypt encrypts plaintext with the selected symmetric algorithm.
func (a *App) SymmetricEncrypt(input string, key string, algorithm string) (string, error) {
	return symmetricutil.Encrypt(input, key, algorithm)
}

// SymmetricDecrypt decrypts Base64-encoded symmetric ciphertext.
func (a *App) SymmetricDecrypt(input string, key string, algorithm string) (string, error) {
	return symmetricutil.Decrypt(input, key, algorithm)
}
