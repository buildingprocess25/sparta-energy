/**
 * Update user password hash in both users and account tables.
 * Optionally update user branch.
 * Run: npx tsx scripts/update-user-password.ts "user@domain.com" "NEW_PASSWORD" "BRANCH[,BRANCH]"
 */

import path from "path"
import crypto from "crypto"
import { Pool } from "pg"
import * as dotenv from "dotenv"
import { getPoolConfig } from "../lib/db-utils"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

const pool = new Pool(getPoolConfig())

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex")
}

function normalizeBranches(raw: string) {
  return raw
    .split("&")
    .map((b) => b.trim())
    .filter(Boolean)
    .join(",")
}

const emailArg = process.argv[2]
const passwordArg = process.argv[3]
const branchArg = process.argv[4]

if (!emailArg || !passwordArg) {
  console.error(
    'Usage: npx tsx scripts/update-user-password.ts "user@domain.com" "NEW_PASSWORD" "BRANCH[,BRANCH]"'
  )
  process.exit(1)
}

const email = emailArg.trim().toLowerCase()
const password = passwordArg.trim()
const branchRaw = branchArg?.trim()

if (!email || !email.includes("@") || !email.includes(".")) {
  console.error("Invalid email")
  process.exit(1)
}

if (!password) {
  console.error("Password cannot be empty")
  process.exit(1)
}

if (branchArg !== undefined && !branchRaw) {
  console.error("Branch cannot be empty if provided")
  process.exit(1)
}

async function main() {
  const passwordHash = sha256(password)

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const branchStored = branchRaw ? normalizeBranches(branchRaw) : null
    const userResult = branchStored
      ? await client.query(
          `UPDATE users
           SET password_hash = $1, branch = $2, updated_at = NOW()
           WHERE email = $3
           RETURNING id`,
          [passwordHash, branchStored, email]
        )
      : await client.query(
          `UPDATE users
           SET password_hash = $1, updated_at = NOW()
           WHERE email = $2
           RETURNING id`,
          [passwordHash, email]
        )

    if (userResult.rowCount === 0) {
      await client.query("ROLLBACK")
      console.error(`User not found: ${email}`)
      process.exit(1)
    }

    await client.query(
      `UPDATE account
       SET password = $1, updated_at = NOW()
       WHERE account_id = $2 AND provider_id = 'credential'`,
      [passwordHash, email]
    )

    await client.query("COMMIT")
    const msg = branchStored
      ? `Updated password + branch for ${email}`
      : `Updated password for ${email}`
    console.log(msg)
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Failed to update password:", err)
    process.exit(1)
  } finally {
    client.release()
  }
}

main()
  .catch((e) => {
    console.error("Script failed:", e)
    process.exit(1)
  })
  .finally(() => pool.end())
