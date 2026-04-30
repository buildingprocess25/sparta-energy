/**
 * Import users from users.csv into the database.
 * Run: npx tsx scripts/import-users.ts
 *
 * Rules:
 * - Role: USER
 * - branch stored as comma-separated if multi-branch ("BANJARMASIN & PALANGKARAYA" → "BANJARMASIN,PALANGKARAYA")
 * - password = first branch name (already KAPITAL), hashed SHA-256
 * - Safe to re-run (ON CONFLICT DO NOTHING on email)
 */

import fs from "fs"
import path from "path"
import crypto from "crypto"
import { Pool } from "pg"
import * as dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

const rawUrl = process.env.DATABASE_URL
if (!rawUrl) throw new Error("DATABASE_URL is not set")

const pool = new Pool({
  connectionString: rawUrl.replace("?sslmode=require", ""),
  ssl: { rejectUnauthorized: false },
})

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex")
}

/** "BANJARMASIN & PALANGKARAYA" → ["BANJARMASIN", "PALANGKARAYA"] */
function parseBranches(cabang: string): string[] {
  return cabang
    .split("&")
    .map((b) => b.trim())
    .filter(Boolean)
}

async function main() {
  const csvPath = path.join(process.cwd(), "users.csv")
  const raw = fs.readFileSync(csvPath, "utf-8")

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  // Skip header
  const rows = lines.slice(1)

  let inserted = 0
  let skipped = 0

  for (const line of rows) {
    const parts = line.split(";")
    if (parts.length < 3) {
      console.warn(`⚠️  Skipping malformed row: ${line}`)
      skipped++
      continue
    }

    const email = parts[0].trim().toLowerCase()
    const name = parts[1].trim()
    const cabangRaw = parts[2].trim()

    // Basic email validation
    if (!email.includes("@") || !email.includes(".")) {
      console.warn(`⚠️  Skipping invalid email: ${email}`)
      skipped++
      continue
    }

    if (!cabangRaw) {
      console.warn(`⚠️  Skipping user with no branch: ${email}`)
      skipped++
      continue
    }

    const branches = parseBranches(cabangRaw)
    // Store comma-separated for multi-branch support (Opsi A)
    const branchStored = branches.join(",")
    // Password = first branch name, already in KAPITAL
    const password = branches[0]
    const passwordHash = sha256(password)

    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Insert user — skip if email already exists
      const userResult = await client.query(
        `INSERT INTO users (id, email, password_hash, role, full_name, branch, email_verified, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, 'USER', $3, $4, TRUE, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [email, passwordHash, name, branchStored]
      )

      if (userResult.rowCount === 0) {
        // Already exists — skip account insert too
        await client.query("COMMIT")
        console.log(`↩️  Skipped (exists): ${email}`)
        skipped++
        continue
      }

      const userId = userResult.rows[0].id

      // Insert better-auth credential account record
      await client.query(
        `INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, 'credential', $2, $3, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [email, userId, passwordHash]
      )

      await client.query("COMMIT")
      console.log(`✅ Inserted: ${email} | ${name} | ${branchStored} | pwd: ${password}`)
      inserted++
    } catch (err) {
      await client.query("ROLLBACK")
      console.error(`❌ Error on ${email}:`, err)
      skipped++
    } finally {
      client.release()
    }
  }

  console.log(`\n📊 Done: ${inserted} inserted, ${skipped} skipped.`)
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e)
    process.exit(1)
  })
  .finally(() => pool.end())
