import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16
const KEY_LENGTH = 32

/**
 * Generate a random encryption key
 * @returns 32-byte Buffer suitable for AES-256
 */
export function generateKey(): Buffer {
    return crypto.randomBytes(KEY_LENGTH)
}

/**
 * Encrypt plaintext with a key
 * @param plaintext - String to encrypt
 * @param key - 32-byte encryption key
 * @returns Base64-encoded string: [IV + TAG + CIPHERTEXT]
 */
export function encrypt(plaintext: string, key: Buffer): string {
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH)

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    // Encrypt the data
    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
    ])

    // Get authentication tag
    const tag = cipher.getAuthTag()

    // Combine IV + tag + encrypted data
    const combined = Buffer.concat([
        iv,
        tag,
        encrypted
    ])

    // Return as Base64 string
    return combined.toString('base64')
}

/**
 * Decrypt ciphertext with a key
 * @param ciphertext - Base64-encoded encrypted string
 * @param key - 32-byte encryption key (same one as used to encrypt)
 * @returns Decrypted plaintext string
 * @throws Error if decryption fails (wrong key or tampered data)
 */

export function decrypt(ciphertext: string, key: Buffer): string {
    // Convert Base64 back to bytes
    const buffer = Buffer.from(ciphertext, 'base64')

    // Extract components
    const iv = buffer.subarray(0, IV_LENGTH)
    const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
    const encrypted = buffer.subarray(IV_LENGTH + TAG_LENGTH)

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

    // Set authentication tag
    decipher.setAuthTag(tag)

    try {
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ])

        return decrypted.toString('utf8')
    } catch (error) {
        throw new Error('Decryption failed: invalid key or corrupted data')
    }
}