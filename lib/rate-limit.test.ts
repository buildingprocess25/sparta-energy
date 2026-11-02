import assert from "node:assert/strict"

import {
  createLockout,
  createRateLimiter,
  getClientIp,
  retryAfterSeconds,
} from "./rate-limit"

const limiter = createRateLimiter({ limit: 3, windowMs: 1000 })
assert.equal(limiter.consume("a", 0).allowed, true)
assert.equal(limiter.consume("a", 10).allowed, true)
assert.equal(limiter.consume("a", 20).allowed, true)
const over = limiter.consume("a", 30)
assert.equal(over.allowed, false)
assert.equal(over.exceeded, true)
assert.equal(over.retryAfterMs, 970)
assert.equal(limiter.consume("a", 40).exceeded, false)
assert.equal(limiter.consume("b", 40).allowed, true)
assert.equal(limiter.consume("a", 1000).allowed, true)

const lockout = createLockout({ maxFailures: 3, windowMs: 1000, lockMs: 120 })
assert.equal(lockout.recordFailure("x", 0), false)
assert.equal(lockout.recordFailure("x", 10), false)
assert.equal(lockout.lockedForMs("x", 10), 0)
assert.equal(lockout.recordFailure("x", 20), true)
assert.equal(lockout.lockedForMs("x", 20), 120)
assert.equal(lockout.lockedForMs("x", 140), 0)
// The count restarts after a lock, so one more failure does not lock again.
assert.equal(lockout.recordFailure("x", 150), false)

lockout.recordFailure("y", 0)
lockout.recordFailure("y", 1)
lockout.clear("y")
assert.equal(lockout.recordFailure("y", 2), false)

// Failures spread beyond the window never lock.
assert.equal(lockout.recordFailure("z", 0), false)
assert.equal(lockout.recordFailure("z", 600), false)
assert.equal(lockout.recordFailure("z", 1200), false)
assert.equal(lockout.lockedForMs("z", 1200), 0)

assert.equal(
  getClientIp(
    new Headers({ "x-real-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" })
  ),
  "1.1.1.1"
)
assert.equal(
  getClientIp(new Headers({ "x-forwarded-for": "2.2.2.2, 10.0.0.1" })),
  "2.2.2.2"
)
assert.equal(getClientIp(new Headers()), "unknown")

assert.equal(retryAfterSeconds(1), 1)
assert.equal(retryAfterSeconds(1500), 2)
assert.equal(retryAfterSeconds(-5), 1)

console.log("rate-limit tests passed")
