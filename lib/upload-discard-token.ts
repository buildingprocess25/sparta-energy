import { createHmac, timingSafeEqual } from "node:crypto"

// Proves a discard request comes from the user who uploaded the file, so a
// signed-in user cannot delete someone else's photo by sending its URL.
export function fileKeyFromUrl(url: string) {
  try {
    const { pathname } = new URL(url)
    const key = pathname.slice(pathname.lastIndexOf("/") + 1)
    return key || null
  } catch {
    return null
  }
}

export function signDiscardToken(fileKey: string, userId: string, secret: string) {
  return createHmac("sha256", secret).update(`${fileKey}:${userId}`).digest("hex")
}

export function verifyDiscardToken(
  token: string,
  fileKey: string,
  userId: string,
  secret: string
) {
  const expected = Buffer.from(signDiscardToken(fileKey, userId, secret), "hex")
  const given = Buffer.from(token, "hex")
  return given.length === expected.length && timingSafeEqual(given, expected)
}
