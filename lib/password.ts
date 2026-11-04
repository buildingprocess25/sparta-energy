import { createHash } from "node:crypto"

import { constantTimeEqual, hashPassword, verifyPassword } from "better-auth/crypto"

// Hashes stored before 4 Nov 2026 are unsalted SHA-256 hex. They still sign in,
// and lib/auth.ts swaps them for scrypt on the first successful login.
const LEGACY_SHA256 = /^[0-9a-f]{64}$/

export function legacySha256(password: string) {
  return createHash("sha256").update(password).digest("hex")
}

export function isLegacyPasswordHash(hash: string | null | undefined) {
  return Boolean(hash && LEGACY_SHA256.test(hash))
}

// Salted scrypt, the better-auth default.
export function hashUserPassword(password: string) {
  return hashPassword(password)
}

export async function checkUserPassword(
  hash: string | null | undefined,
  password: string
): Promise<{ valid: boolean; needsUpgrade: boolean }> {
  if (!hash) return { valid: false, needsUpgrade: false }

  if (isLegacyPasswordHash(hash)) {
    const valid = constantTimeEqual(hash, legacySha256(password))
    return { valid, needsUpgrade: valid }
  }

  try {
    return { valid: await verifyPassword({ hash, password }), needsUpgrade: false }
  } catch {
    return { valid: false, needsUpgrade: false }
  }
}
