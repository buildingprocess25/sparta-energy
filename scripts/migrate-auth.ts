/**
 * Run migration to create BetterAuth tables in the database
 * pnpm tsx scripts/migrate-auth.ts
 */
import "dotenv/config"
import { Pool } from "pg"
import fs from "fs"
import path from "path"

const rawUrl = process.env.DATABASE_URL!
const cleanUrl = rawUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "")

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  const sql = fs.readFileSync(
    path.join(process.cwd(), "prisma/auth-schema.sql"),
    "utf-8"
  )

  console.log("🔄 Running BetterAuth schema migration...")
  await pool.query(sql)
  console.log("✅ Auth tables created successfully!")
  console.log("   - session")
  console.log("   - account")
  console.log("   - verification")
  console.log("   - users columns: email_verified, image")
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e.message)
    process.exit(1)
  })
  .finally(() => pool.end())
