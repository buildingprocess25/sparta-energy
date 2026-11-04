import assert from "node:assert/strict"

import {
  checkUserPassword,
  hashUserPassword,
  isLegacyPasswordHash,
  legacySha256,
} from "./password"

async function main() {
  // New hashes are salted scrypt: same password, different hash, and both verify.
  const first = await hashUserPassword("sparta123")
  const second = await hashUserPassword("sparta123")
  assert.notEqual(first, second)
  assert.equal(isLegacyPasswordHash(first), false)
  assert.deepEqual(await checkUserPassword(first, "sparta123"), { valid: true, needsUpgrade: false })
  assert.deepEqual(await checkUserPassword(second, "sparta123"), { valid: true, needsUpgrade: false })
  assert.deepEqual(await checkUserPassword(first, "sparta124"), { valid: false, needsUpgrade: false })

  // Hashes stored before the change still sign in and are flagged for upgrade.
  const legacy = legacySha256("sparta123")
  // Same output as the old createHash("sha256") code, so stored hashes keep matching.
  assert.equal(legacy, "35eddaf8b3fd2626641962588d26169f5ecaf1357ec2d81284080c426132086b")
  assert.equal(isLegacyPasswordHash(legacy), true)
  assert.deepEqual(await checkUserPassword(legacy, "sparta123"), { valid: true, needsUpgrade: true })
  assert.deepEqual(await checkUserPassword(legacy, "wrong"), { valid: false, needsUpgrade: false })

  // Missing or broken hashes fail closed instead of throwing.
  for (const hash of [null, undefined, "", "not-a-hash", "abc:def"]) {
    assert.deepEqual(await checkUserPassword(hash, "sparta123"), { valid: false, needsUpgrade: false }, String(hash))
  }

  console.log("password tests passed")
}

main()
