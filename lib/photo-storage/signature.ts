import { createHmac, timingSafeEqual } from "node:crypto"

function secret() {
  const value = process.env.BETTER_AUTH_SECRET
  if (!value) throw new Error("BETTER_AUTH_SECRET is not set")
  return value
}

export function signPhotoRef(storage: string, ref: string) {
  return createHmac("sha256", secret())
    .update(`photo:${storage}:${ref}`)
    .digest("base64url")
}

export function isValidPhotoSig(storage: string, ref: string, sig: string) {
  const expected = Buffer.from(signPhotoRef(storage, ref))
  const actual = Buffer.from(sig)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
