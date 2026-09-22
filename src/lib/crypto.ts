/**
 * Secure password hashing using Web Crypto API SHA-256 with project salt.
 * Ensures passwords are never stored or transmitted in plain text.
 */
const SALT = 'eosis_secure_salt_2026';

export async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function verifyPassword(password: string, expectedHash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === expectedHash;
}
