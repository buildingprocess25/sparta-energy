import { betterAuth } from "better-auth"
import { createHash } from "crypto"
import { dbPool } from "@/lib/db-pool"

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

// ─── ROBUST SSO SESSION FALLBACK ───────────────────────────────────────────
// Monkey-patch getSession so that Server Actions and Server Components
// transparently resolve the session from the 'sso_session' cookie if the
// standard better-auth cookie fails or is missing.
const originalGetSession = auth.api.getSession;
// @ts-ignore
auth.api.getSession = async (options: any) => {
  const result = await originalGetSession(options);
  if (result?.user) return result;

  if (options?.headers) {
    let cookieStr = "";
    if (typeof options.headers.get === 'function') {
      cookieStr = options.headers.get("cookie") || "";
    } else if (typeof options.headers === 'object' && 'cookie' in options.headers) {
      cookieStr = String(options.headers.cookie);
    }

    const match = cookieStr.match(/sso_session=([^;]+)/);
    if (match) {
      const ssoToken = match[1];
      const { prisma } = await import("@/lib/prisma");
      const dbSession = await prisma.session.findUnique({
        where: { token: ssoToken },
        include: { user: true }
      });
      if (dbSession && dbSession.expiresAt > new Date()) {
        return {
          session: dbSession as any,
          user: dbSession.user as any
        };
      }
    }
  }
  return result;
}

const originalSignOut = auth.api.signOut;
// @ts-ignore
auth.api.signOut = async (options: any) => {
  if (options?.headers) {
    let cookieStr = "";
    if (typeof options.headers.get === 'function') {
      cookieStr = options.headers.get("cookie") || "";
    } else if (typeof options.headers === 'object' && 'cookie' in options.headers) {
      cookieStr = String(options.headers.cookie);
    }
    const match = cookieStr.match(/sso_session=([^;]+)/);
    if (match) {
      const ssoToken = match[1];
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.session.deleteMany({
          where: { token: ssoToken }
        });
        console.log("[Auth] Deleted SSO session from DB on signOut");
      } catch (e) {
        // ignore
      }
    }
  }
  return await originalSignOut(options);
}
