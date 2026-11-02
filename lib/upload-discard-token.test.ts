import assert from "node:assert/strict"

import { fileKeyFromUrl, signDiscardToken, verifyDiscardToken } from "./upload-discard-token"

assert.equal(fileKeyFromUrl("https://utfs.io/f/abc123"), "abc123")
assert.equal(fileKeyFromUrl("https://x1y2.ufs.sh/f/key-9?x=1"), "key-9")
assert.equal(fileKeyFromUrl("https://utfs.io/f/"), null)
assert.equal(fileKeyFromUrl("not a url"), null)

const token = signDiscardToken("abc123", "user-1", "secret")
assert.equal(verifyDiscardToken(token, "abc123", "user-1", "secret"), true)
assert.equal(verifyDiscardToken(token, "abc123", "user-2", "secret"), false)
assert.equal(verifyDiscardToken(token, "other", "user-1", "secret"), false)
assert.equal(verifyDiscardToken(token, "abc123", "user-1", "other-secret"), false)
assert.equal(verifyDiscardToken("", "abc123", "user-1", "secret"), false)
assert.equal(verifyDiscardToken("zz-not-hex", "abc123", "user-1", "secret"), false)

console.log("upload-discard-token tests passed")
