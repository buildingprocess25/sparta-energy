import type { Role } from "@prisma/client"

import { resolveSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const TTL_MS = 60_000
const MAX_ENTRIES = 5_000

type ProxySession = {
  userId: string
  role: Role | null
  token: string
  expiresAt: Date
} | null

const cache = new Map<string, { value: ProxySession; resetAt: number }>()

function keyFor(tokens: string[]) {
  return [...tokens].sort().join(" ")
}

// The proxy only needs who is signed in and their role. Caching that for a minute keeps
// page navigation from querying the session and user tables on every request; a role
// change or a sign-out in the monitoring portal reaches the proxy within TTL_MS.
export async function getProxySession(
  tokens: string[],
  headers: Headers
): Promise<ProxySession> {
  if (tokens.length === 0) return null
  const key = keyFor(tokens)
  const now = Date.now()
  const cached = cache.get(key)
  if (cached && cached.resetAt > now) return cached.value

  const resolved = await resolveSession(headers)
  let value: ProxySession = null
  if (resolved) {
    const user = await prisma.user.findUnique({
      where: { id: resolved.data.user.id },
      select: { role: true },
    })
    const expiresAt = new Date(resolved.data.session.expiresAt)
    value = {
      userId: resolved.data.user.id,
      role: user?.role ?? null,
      token: resolved.data.session.token,
      expiresAt,
    }
  }

  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!)
  const resetAt = Math.min(
    now + TTL_MS,
    value ? value.expiresAt.getTime() : Infinity
  )
  cache.set(key, { value, resetAt })
  return value
}

export function forgetProxySession(tokens: string[]) {
  if (tokens.length > 0) cache.delete(keyFor(tokens))
}
