import { betterAuth } from "better-auth"
import { Pool } from "pg"
import { createHash } from "crypto"

// Strip sslmode from URL — set ssl directly to accept Aiven self-signed cert
const rawUrl = process.env.DATABASE_URL!
const cleanUrl = rawUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "")

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
})

export const auth = betterAuth({
  database: pool,

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

  // Map session table
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
    "http://localhost:3000",
    "https://sparta-energy.vercel.app",
    "https://runtgenographically-preposterous-shanel.ngrok-free.dev",
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
