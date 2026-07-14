package symmetricutil

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/des"
	"crypto/hmac"
	crand "crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/binary"
	"fmt"
	"io"
	"strings"
)

const (
	AlgorithmAES  = "aes"
	AlgorithmSM4  = "sm4"
	Algorithm3DES = "3des"

	blockSizeSM4 = 16
	keySizeAES   = 32
	keySizeSM4   = 16
	keySize3DES  = 24
	macSize      = sha256.Size
)

// Encrypt encrypts plaintext with the selected symmetric algorithm.
// The returned string is standard Base64 of IV || ciphertext || HMAC-SHA256.
func Encrypt(input, key, algorithm string) (string, error) {
	block, normalizedAlgorithm, err := newBlockCipher(key, algorithm)
	if err != nil {
		return "", err
	}

	iv := make([]byte, block.BlockSize())
	if _, err := io.ReadFull(crand.Reader, iv); err != nil {
		return "", fmt.Errorf("failed to generate IV: %w", err)
	}

	padded := pkcs7Pad([]byte(input), block.BlockSize())
	ciphertext := make([]byte, len(padded))
	cipher.NewCBCEncrypter(block, iv).CryptBlocks(ciphertext, padded)

	payload := make([]byte, 0, len(iv)+len(ciphertext)+macSize)
	payload = append(payload, iv...)
	payload = append(payload, ciphertext...)
	payload = append(payload, authenticationTag(key, normalizedAlgorithm, payload)...)
	return base64.StdEncoding.EncodeToString(payload), nil
}

// Decrypt decrypts a Base64 encoded IV || ciphertext || HMAC-SHA256 payload.
func Decrypt(input, key, algorithm string) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	block, normalizedAlgorithm, err := newBlockCipher(key, algorithm)
	if err != nil {
		return "", err
	}

	payload, err := decodeFlexibleBase64(input)
	if err != nil {
		return "", err
	}

	blockSize := block.BlockSize()
	if len(payload) < blockSize+blockSize+macSize {
		return "", fmt.Errorf("ciphertext is too short")
	}

	tagStart := len(payload) - macSize
	ciphertextEnd := tagStart
	if !hmac.Equal(payload[tagStart:], authenticationTag(key, normalizedAlgorithm, payload[:tagStart])) {
		return "", fmt.Errorf("ciphertext integrity check failed")
	}
	if (ciphertextEnd-blockSize)%blockSize != 0 {
		return "", fmt.Errorf("invalid ciphertext length")
	}

	iv := payload[:blockSize]
	ciphertext := payload[blockSize:ciphertextEnd]
	plaintext := make([]byte, len(ciphertext))
	cipher.NewCBCDecrypter(block, iv).CryptBlocks(plaintext, ciphertext)

	unpadded, err := pkcs7Unpad(plaintext, blockSize)
	if err != nil {
		return "", err
	}

	return string(unpadded), nil
}

func newBlockCipher(key, algorithm string) (cipher.Block, string, error) {
	if key == "" {
		return nil, "", fmt.Errorf("key is empty")
	}

	material := deriveKeyMaterial(key)
	normalizedAlgorithm := normalizeAlgorithm(algorithm)

	switch normalizedAlgorithm {
	case AlgorithmAES:
		block, err := aes.NewCipher(material[:keySizeAES])
		return block, normalizedAlgorithm, err
	case AlgorithmSM4:
		block, err := newSM4Cipher(material[:keySizeSM4])
		return block, normalizedAlgorithm, err
	case Algorithm3DES:
		block, err := des.NewTripleDESCipher(material[:keySize3DES])
		return block, normalizedAlgorithm, err
	default:
		return nil, "", fmt.Errorf("unsupported algorithm: %s", algorithm)
	}
}

func normalizeAlgorithm(algorithm string) string {
	return strings.ToLower(strings.TrimSpace(algorithm))
}

func deriveKeyMaterial(key string) []byte {
	sum := sha256.Sum256([]byte(key))
	return sum[:]
}

func authenticationTag(key, algorithm string, payload []byte) []byte {
	macKey := sha256.Sum256([]byte("dev-tools:symmetric:mac:" + key))
	mac := hmac.New(sha256.New, macKey[:])
	mac.Write([]byte(algorithm))
	mac.Write([]byte{0})
	mac.Write(payload)
	return mac.Sum(nil)
}

func decodeFlexibleBase64(input string) ([]byte, error) {
	if decoded, err := base64.StdEncoding.DecodeString(input); err == nil {
		return decoded, nil
	}
	if decoded, err := base64.URLEncoding.DecodeString(input); err == nil {
		return decoded, nil
	}
	if decoded, err := base64.RawStdEncoding.DecodeString(input); err == nil {
		return decoded, nil
	}
	if decoded, err := base64.RawURLEncoding.DecodeString(input); err == nil {
		return decoded, nil
	}
	return nil, fmt.Errorf("invalid Base64 encoding")
}

func pkcs7Pad(data []byte, blockSize int) []byte {
	padLen := blockSize - len(data)%blockSize
	padded := make([]byte, len(data)+padLen)
	copy(padded, data)
	for i := len(data); i < len(padded); i++ {
		padded[i] = byte(padLen)
	}
	return padded
}

func pkcs7Unpad(data []byte, blockSize int) ([]byte, error) {
	if len(data) == 0 || len(data)%blockSize != 0 {
		return nil, fmt.Errorf("invalid padded data")
	}

	padLen := int(data[len(data)-1])
	if padLen == 0 || padLen > blockSize || padLen > len(data) {
		return nil, fmt.Errorf("invalid padding")
	}

	for _, v := range data[len(data)-padLen:] {
		if int(v) != padLen {
			return nil, fmt.Errorf("invalid padding")
		}
	}

	return data[:len(data)-padLen], nil
}

type sm4Cipher struct {
	enc [32]uint32
	dec [32]uint32
}

func newSM4Cipher(key []byte) (cipher.Block, error) {
	if len(key) != keySizeSM4 {
		return nil, fmt.Errorf("SM4 key must be 16 bytes")
	}

	c := &sm4Cipher{}
	if err := c.expandKey(key); err != nil {
		return nil, err
	}
	return c, nil
}

func (c *sm4Cipher) BlockSize() int { return blockSizeSM4 }

func (c *sm4Cipher) Encrypt(dst, src []byte) {
	var x [36]uint32
	for i := 0; i < 4; i++ {
		x[i] = binary.BigEndian.Uint32(src[i*4 : (i+1)*4])
	}
	for i := 0; i < 32; i++ {
		x[i+4] = x[i] ^ sm4L1(sm4Tau(x[i+1]^x[i+2]^x[i+3]^c.enc[i]))
	}

	binary.BigEndian.PutUint32(dst[0:4], x[35])
	binary.BigEndian.PutUint32(dst[4:8], x[34])
	binary.BigEndian.PutUint32(dst[8:12], x[33])
	binary.BigEndian.PutUint32(dst[12:16], x[32])
}

func (c *sm4Cipher) Decrypt(dst, src []byte) {
	var x [36]uint32
	for i := 0; i < 4; i++ {
		x[i] = binary.BigEndian.Uint32(src[i*4 : (i+1)*4])
	}
	for i := 0; i < 32; i++ {
		x[i+4] = x[i] ^ sm4L1(sm4Tau(x[i+1]^x[i+2]^x[i+3]^c.dec[i]))
	}

	binary.BigEndian.PutUint32(dst[0:4], x[35])
	binary.BigEndian.PutUint32(dst[4:8], x[34])
	binary.BigEndian.PutUint32(dst[8:12], x[33])
	binary.BigEndian.PutUint32(dst[12:16], x[32])
}

func (c *sm4Cipher) expandKey(key []byte) error {
	var mk [4]uint32
	for i := 0; i < 4; i++ {
		mk[i] = binary.BigEndian.Uint32(key[i*4 : (i+1)*4])
	}

	var k [36]uint32
	for i := 0; i < 4; i++ {
		k[i] = mk[i] ^ sm4FK[i]
	}

	for i := 0; i < 32; i++ {
		k[i+4] = k[i] ^ sm4L2(sm4Tau(k[i+1]^k[i+2]^k[i+3]^sm4CK[i]))
		c.enc[i] = k[i+4]
	}

	for i := 0; i < 32; i++ {
		c.dec[i] = k[35-i]
	}

	return nil
}

func sm4Tau(a uint32) uint32 {
	return uint32(sm4SBox[a>>24])<<24 |
		uint32(sm4SBox[(a>>16)&0xff])<<16 |
		uint32(sm4SBox[(a>>8)&0xff])<<8 |
		uint32(sm4SBox[a&0xff])
}

func sm4L1(b uint32) uint32 {
	return b ^ bitsRotateLeft32(b, 2) ^ bitsRotateLeft32(b, 10) ^ bitsRotateLeft32(b, 18) ^ bitsRotateLeft32(b, 24)
}

func sm4L2(b uint32) uint32 {
	return b ^ bitsRotateLeft32(b, 13) ^ bitsRotateLeft32(b, 23)
}

func bitsRotateLeft32(x uint32, n uint) uint32 {
	return (x << n) | (x >> (32 - n))
}

var sm4FK = [4]uint32{
	0xa3b1bac6,
	0x56aa3350,
	0x677d9197,
	0xb27022dc,
}

var sm4CK = [32]uint32{
	0x00070e15, 0x1c232a31, 0x383f464d, 0x545b6269,
	0x70777e85, 0x8c939aa1, 0xa8afb6bd, 0xc4cbd2d9,
	0xe0e7eef5, 0xfc030a11, 0x181f262d, 0x343b4249,
	0x50575e65, 0x6c737a81, 0x888f969d, 0xa4abb2b9,
	0xc0c7ced5, 0xdce3eaf1, 0xf8ff060d, 0x141b2229,
	0x30373e45, 0x4c535a61, 0x686f767d, 0x848b9299,
	0xa0a7aeb5, 0xbcc3cad1, 0xd8dfe6ed, 0xf4fb0209,
	0x10171e25, 0x2c333a41, 0x484f565d, 0x646b7279,
}

var sm4SBox = [256]byte{
	0xd6, 0x90, 0xe9, 0xfe, 0xcc, 0xe1, 0x3d, 0xb7, 0x16, 0xb6, 0x14, 0xc2, 0x28, 0xfb, 0x2c, 0x05,
	0x2b, 0x67, 0x9a, 0x76, 0x2a, 0xbe, 0x04, 0xc3, 0xaa, 0x44, 0x13, 0x26, 0x49, 0x86, 0x06, 0x99,
	0x9c, 0x42, 0x50, 0xf4, 0x91, 0xef, 0x98, 0x7a, 0x33, 0x54, 0x0b, 0x43, 0xed, 0xcf, 0xac, 0x62,
	0xe4, 0xb3, 0x1c, 0xa9, 0xc9, 0x08, 0xe8, 0x95, 0x80, 0xdf, 0x94, 0xfa, 0x75, 0x8f, 0x3f, 0xa6,
	0x47, 0x07, 0xa7, 0xfc, 0xf3, 0x73, 0x17, 0xba, 0x83, 0x59, 0x3c, 0x19, 0xe6, 0x85, 0x4f, 0xa8,
	0x68, 0x6b, 0x81, 0xb2, 0x71, 0x64, 0xda, 0x8b, 0xf8, 0xeb, 0x0f, 0x4b, 0x70, 0x56, 0x9d, 0x35,
	0x1e, 0x24, 0x0e, 0x5e, 0x63, 0x58, 0xd1, 0xa2, 0x25, 0x22, 0x7c, 0x3b, 0x01, 0x21, 0x78, 0x87,
	0xd4, 0x00, 0x46, 0x57, 0x9f, 0xd3, 0x27, 0x52, 0x4c, 0x36, 0x02, 0xe7, 0xa0, 0xc4, 0xc8, 0x9e,
	0xea, 0xbf, 0x8a, 0xd2, 0x40, 0xc7, 0x38, 0xb5, 0xa3, 0xf7, 0xf2, 0xce, 0xf9, 0x61, 0x15, 0xa1,
	0xe0, 0xae, 0x5d, 0xa4, 0x9b, 0x34, 0x1a, 0x55, 0xad, 0x93, 0x32, 0x30, 0xf5, 0x8c, 0xb1, 0xe3,
	0x1d, 0xf6, 0xe2, 0x2e, 0x82, 0x66, 0xca, 0x60, 0xc0, 0x29, 0x23, 0xab, 0x0d, 0x53, 0x4e, 0x6f,
	0xd5, 0xdb, 0x37, 0x45, 0xde, 0xfd, 0x8e, 0x2f, 0x03, 0xff, 0x6a, 0x72, 0x6d, 0x6c, 0x5b, 0x51,
	0x8d, 0x1b, 0xaf, 0x92, 0xbb, 0xdd, 0xbc, 0x7f, 0x11, 0xd9, 0x5c, 0x41, 0x1f, 0x10, 0x5a, 0xd8,
	0x0a, 0xc1, 0x31, 0x88, 0xa5, 0xcd, 0x7b, 0xbd, 0x2d, 0x74, 0xd0, 0x12, 0xb8, 0xe5, 0xb4, 0xb0,
	0x89, 0x69, 0x97, 0x4a, 0x0c, 0x96, 0x77, 0x7e, 0x65, 0xb9, 0xf1, 0x09, 0xc5, 0x6e, 0xc6, 0x84,
	0x18, 0xf0, 0x7d, 0xec, 0x3a, 0xdc, 0x4d, 0x20, 0x79, 0xee, 0x5f, 0x3e, 0xd7, 0xcb, 0x39, 0x48,
}
