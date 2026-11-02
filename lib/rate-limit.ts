// In-memory counters for one app instance: production runs a single container on the VPS,
// so a restart resets the counts and that is acceptable.

const MAX_KEYS = 10_000

type WindowEntry = { count: number; resetAt: number }

// Expired keys go first; past MAX_KEYS the oldest insertions go too, so a flood of new IPs
// cannot grow memory without bound.
function prune<T extends { resetAt: number }>(
  map: Map<string, T>,
  now: number
) {
  if (map.size < MAX_KEYS) return
  for (const [key, entry] of map) {
    if (entry.resetAt <= now) map.delete(key)
  }
  for (const key of map.keys()) {
    if (map.size < MAX_KEYS) break
    map.delete(key)
  }
}

function countInWindow(
  map: Map<string, WindowEntry>,
  key: string,
  windowMs: number,
  now: number
) {
  const entry = map.get(key)
  if (entry && entry.resetAt > now) {
    entry.count += 1
    return entry
  }
  prune(map, now)
  const fresh = { count: 1, resetAt: now + windowMs }
  map.set(key, fresh)
  return fresh
}

export function createRateLimiter(options: {
  limit: number
  windowMs: number
}) {
  const windows = new Map<string, WindowEntry>()
  return {
    // exceeded is true only on the first request over the limit, so a caller can count one
    // violation per window instead of one per rejected request.
    consume(key: string, now = Date.now()) {
      const entry = countInWindow(windows, key, options.windowMs, now)
      return {
        allowed: entry.count <= options.limit,
        exceeded: entry.count === options.limit + 1,
        retryAfterMs: entry.resetAt - now,
      }
    },
  }
}

// After maxFailures inside windowMs the key is locked for lockMs, then starts from zero.
export function createLockout(options: {
  maxFailures: number
  windowMs: number
  lockMs: number
}) {
  const failures = new Map<string, WindowEntry>()
  const locks = new Map<string, { resetAt: number }>()
  return {
    lockedForMs(key: string, now = Date.now()) {
      const lock = locks.get(key)
      if (!lock) return 0
      if (lock.resetAt <= now) {
        locks.delete(key)
        return 0
      }
      return lock.resetAt - now
    },
    recordFailure(key: string, now = Date.now()) {
      const entry = countInWindow(failures, key, options.windowMs, now)
      if (entry.count < options.maxFailures) return false
      failures.delete(key)
      prune(locks, now)
      locks.set(key, { resetAt: now + options.lockMs })
      return true
    },
    clear(key: string) {
      failures.delete(key)
      locks.delete(key)
    },
  }
}

// Traefik overwrites X-Real-Ip with the connecting address and drops forwarded headers from
// untrusted clients. This holds only while the app port is reachable through Traefik alone.
export function getClientIp(headers: Headers) {
  const realIp = headers.get("x-real-ip")?.trim()
  if (realIp) return realIp
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || "unknown"
}

export function retryAfterSeconds(ms: number) {
  return Math.max(1, Math.ceil(ms / 1000))
}
