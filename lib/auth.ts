import { betterAuth } from "better-auth"
import { createHash } from "crypto"
import { dbPool } from "@/lib/db-pool"
import {
  deleteSessionsByToken,
  resolveSsoSession,
} from "@/lib/session-resolver"
import { cookieHeaderFrom, readSsoSessionToken } from "@/lib/sso-cookie"

export const auth = betterAuth({
  database: dbPool,
  secret: process.env.BETTER_AUTH_SECRET,

  // Map onto our existing "users" table columns
  user: {
    modelName: "users",
    fields: {
      name: "full_name",
      createdAt: "created_at",
      updatedAt: "updated_at",
      emailVerified: "email_verified",
      image: "image",
    },
  },

  session: {
    modelName: "session",
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
    },
    expiresIn: 8 * 60 * 60, // 8 hours in seconds (default for regular users)
    updateAge: 60 * 60, // refresh cookie after 1 hour of activity
    // cookieCache disabled: SSO manually inserts sessions to DB, cache would bypass DB lookup
  },

  account: {
    modelName: "account",
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        return createHash("sha256").update(password).digest("hex")
      },
      verify: async ({ hash, password }) => {
        return hash === createHash("sha256").update(password).digest("hex")
      },
    },
  },

  trustedOrigins: [
    "http://localhost:*",
    "https://sparta-energy.vercel.app",
    "https://runtgenographically-preposterous-shanel.ngrok-free.dev",
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user

// Server Actions and Server Components fall back to the sso_session cookie when the
// better-auth cookie is missing or stale (SSO logins only set sso_session).
const originalGetSession = auth.api.getSession
type GetSessionResult = Awaited<ReturnType<typeof originalGetSession>>

auth.api.getSession = (async (
  options: Parameters<typeof originalGetSession>[0]
) => {
  const result = await originalGetSession(options)
  if (result?.user) return result
  const sso = await resolveSsoSession(cookieHeaderFrom(options?.headers))
  return (sso as GetSessionResult) ?? result
}) as typeof originalGetSession

// Where the session came from matters to the proxy: an sso_session-only login needs
// the client get-session route answered from the database.
export async function resolveSession(headers: Headers) {
  const result = await originalGetSession({ headers })
  if (result?.user) return { data: result, source: "better-auth" as const }
  const sso = await resolveSsoSession(headers.get("cookie") ?? "")
  return sso ? { data: sso, source: "sso" as const } : null
}

const originalSignOut = auth.api.signOut

// The API types signOut as read-only; the property itself is writable, as the old patch relied on.
Object.assign(auth.api, {
  signOut: (async (options: Parameters<typeof originalSignOut>[0]) => {
    const ssoToken = readSsoSessionToken(cookieHeaderFrom(options?.headers))
    if (ssoToken) {
      try {
        await deleteSessionsByToken([ssoToken])
      } catch {
        // better-auth still ends its own session below.
      }
    }
    return originalSignOut(options)
  }) as typeof originalSignOut,
})
