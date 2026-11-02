import {
  createLockout,
  createRateLimiter,
  getClientIp,
  retryAfterSeconds,
} from "@/lib/rate-limit"

const MINUTE = 60_000

// Limits are per IP. Auditors on mobile data or one store WiFi share an IP, so they stay
// well above what a full office generates; sign-in failures are limited per email in lib/auth.ts.
const limiters = {
  auth: createRateLimiter({ limit: 60, windowMs: MINUTE }),
  upload: createRateLimiter({ limit: 60, windowMs: MINUTE }),
  tiles: createRateLimiter({ limit: 1200, windowMs: MINUTE }),
  api: createRateLimiter({ limit: 300, windowMs: MINUTE }),
  page: createRateLimiter({ limit: 600, windowMs: MINUTE }),
}

// Three windows over the limit within 10 minutes block the IP for 2 minutes.
const ipBlocks = createLockout({
  maxFailures: 3,
  windowMs: 10 * MINUTE,
  lockMs: 2 * MINUTE,
})

const unlimitedPrefixes = [
  "/_next/static",
  "/assets",
  "/favicon.ico",
  "/manifest.json",
  "/sw.js",
  "/workbox-",
]

// Comma-separated, e.g. the smart-energy-monitoring server and office IPs.
const allowlist = new Set(
  (process.env.RATE_LIMIT_ALLOWLIST ?? "")
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean)
)

function limiterFor(pathname: string, method: string) {
  if (
    pathname.startsWith("/api/auth/sign-in") ||
    pathname === "/api/auth/sso/callback"
  )
    return limiters.auth
  if (
    method === "POST" &&
    (pathname.startsWith("/api/uploadthing") ||
      pathname === "/api/energy-audit/photos")
  )
    return limiters.upload
  if (pathname.startsWith("/api/map-tiles")) return limiters.tiles
  if (pathname.startsWith("/api/")) return limiters.api
  return limiters.page
}

function tooManyRequests(pathname: string, retryAfterMs: number) {
  const seconds = retryAfterSeconds(retryAfterMs)
  const message = `Terlalu banyak permintaan. Coba lagi dalam ${seconds} detik.`
  const headers = { "Retry-After": String(seconds) }
  return pathname.startsWith("/api/")
    ? Response.json({ error: message, message }, { status: 429, headers })
    : new Response(message, {
        status: 429,
        headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" },
      })
}

// Runs before any session or database work, so rejected traffic never reaches PostgreSQL.
export function guardRequestRate(request: Request) {
  const { pathname } = new URL(request.url)
  if (unlimitedPrefixes.some((prefix) => pathname.startsWith(prefix)))
    return null

  const ip = getClientIp(request.headers)
  if (allowlist.has(ip)) return null

  const blockedMs = ipBlocks.lockedForMs(ip)
  if (blockedMs > 0) return tooManyRequests(pathname, blockedMs)

  const result = limiterFor(pathname, request.method).consume(ip)
  if (result.allowed) return null
  if (result.exceeded && ipBlocks.recordFailure(ip)) {
    console.warn(`[RequestGuard] IP ${ip} diblokir 2 menit`)
    return tooManyRequests(pathname, ipBlocks.lockedForMs(ip))
  }
  return tooManyRequests(pathname, result.retryAfterMs)
}
