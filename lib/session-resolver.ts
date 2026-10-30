import type { Prisma } from "@prisma/client"

import { readSsoSessionToken } from "@/lib/sso-cookie"

export type SessionWithUser = Prisma.SessionGetPayload<{
  include: { user: true }
}>
export type SessionFinder = (token: string) => Promise<SessionWithUser | null>

// Prisma loads on first use, as the getSession patch in lib/auth.ts did before.
const findSessionByToken: SessionFinder = async (token) => {
  const { prisma } = await import("@/lib/prisma")
  return prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })
}

// The one sso_session lookup used by getSession and the client get-session route.
export async function resolveSsoSession(
  cookieHeader: string,
  find: SessionFinder = findSessionByToken,
  now: Date = new Date()
) {
  const token = readSsoSessionToken(cookieHeader)
  if (!token) return null
  const session = await find(token)
  if (!session || session.expiresAt <= now) return null
  return { session, user: session.user }
}

export async function deleteSessionsByToken(tokens: string[]) {
  if (tokens.length === 0) return
  const { prisma } = await import("@/lib/prisma")
  await prisma.session.deleteMany({ where: { token: { in: tokens } } })
}
