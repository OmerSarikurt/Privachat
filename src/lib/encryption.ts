import CryptoJS from 'crypto-js';

/**
 * A simple symmetric encryption wrapper for a chatting app demo.
 * In a production E2EE app, you would use public-key cryptography (RSA/ECDH).
 * Here we use the chatId as a derivation base to simulate per-conversation keys.
 */

const SECRET_SALT = 'glasschat_v26_secure_salt';

export function encryptMessage(text: string, chatId: string): string {
  try {
    const key = CryptoJS.SHA256(chatId + SECRET_SALT).toString();
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Fallback to plain text if encryption fails
  }
}

export function decryptMessage(cipherText: string, chatId: string): string {
  try {
    const key = CryptoJS.SHA256(chatId + SECRET_SALT).toString();
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) throw new Error('Decryption resulted in empty string');
    return originalText;
  } catch (error) {
    // If it's old plain text or encryption failed, return the original
    return cipherText;
  }
}
