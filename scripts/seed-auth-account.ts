/**
 * Create BetterAuth account record for existing seeded user
 * pnpm tsx scripts/seed-auth-account.ts
 */
import "dotenv/config"
import { Pool } from "pg"
import crypto from "crypto"

const rawUrl = process.env.DATABASE_URL!
const cleanUrl = rawUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "")

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
})

function sha256(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex")
}

async function main() {
  // Find the seeded user
  const { rows: users } = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    ["auditor@sparta.id"]
  )

  if (users.length === 0) {
    console.error("❌ User not found. Run pnpm prisma db seed first.")
    process.exit(1)
  }

  const userId = users[0].id
  const passwordHash = sha256("sparta123")

  // Upsert account record for email-password provider
  await pool.query(
    `INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
     VALUES ($1, $2, 'credential', $3, $4, NOW(), NOW())
     ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password`,
    [crypto.randomUUID(), "auditor@sparta.id", userId, passwordHash]
  )

  // Mark email as verified (we trust seeded accounts)
  await pool.query(
    `UPDATE users SET email_verified = TRUE WHERE id = $1`,
    [userId]
  )

  console.log("✅ Auth account seeded for auditor@sparta.id")
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e.message)
    process.exit(1)
  })
  .finally(() => pool.end())
