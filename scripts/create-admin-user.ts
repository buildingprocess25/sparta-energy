/**
 * Create or promote an admin user.
 *
 * Run:
 *   npx tsx scripts/create-admin-user.ts admin@sparta.id "password123" "Admin Sparta"
 *
 * Optional branch argument:
 *   npx tsx scripts/create-admin-user.ts admin@sparta.id "password123" "Admin Sparta" "JAKARTA"
 */

import crypto from "crypto"
import path from "path"
import { Pool } from "pg"
import * as dotenv from "dotenv"
import { getPoolConfig } from "../lib/db-utils"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

const pool = new Pool(getPoolConfig())

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex")
}

function printUsage() {
  console.log(`
Usage:
  npx tsx scripts/create-admin-user.ts <email> <password> <full_name> [branch]

Example:
  npx tsx scripts/create-admin-user.ts admin@sparta.id "sparta123" "Admin Sparta"
`)
}

async function main() {
  const [, , rawEmail, rawPassword, rawFullName, rawBranch] = process.argv

  const email = rawEmail?.trim().toLowerCase()
  const password = rawPassword?.trim()
  const fullName = rawFullName?.trim()
  const branch = rawBranch?.trim() || null

  if (!email || !password || !fullName) {
    printUsage()
    process.exit(1)
  }

  if (!email.includes("@") || !email.includes(".")) {
    throw new Error(`Invalid email: ${email}`)
  }

  if (password.length < 6) {
    throw new Error("Password minimal 6 karakter")
  }

  const passwordHash = sha256(password)
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const existing = await client.query<{ id: string }>(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    )

    let userId: string
    let mode: "created" | "updated"

    if (existing.rowCount && existing.rows[0]) {
      userId = existing.rows[0].id
      mode = "updated"

      await client.query(
        `UPDATE users
         SET password_hash = $1,
             role = 'ADMIN',
             full_name = $2,
             branch = $3,
             email_verified = TRUE,
             updated_at = NOW()
         WHERE id = $4`,
        [passwordHash, fullName, branch, userId]
      )
    } else {
      mode = "created"

      const created = await client.query<{ id: string }>(
        `INSERT INTO users (
           id,
           email,
           password_hash,
           role,
           full_name,
           branch,
           email_verified,
           created_at,
           updated_at
         )
         VALUES (
           gen_random_uuid(),
           $1,
           $2,
           'ADMIN',
           $3,
           $4,
           TRUE,
           NOW(),
           NOW()
         )
         RETURNING id`,
        [email, passwordHash, fullName, branch]
      )

      userId = created.rows[0].id
    }

    await client.query(
      `DELETE FROM account
       WHERE user_id = $1
         AND provider_id = 'credential'`,
      [userId]
    )

    await client.query(
      `INSERT INTO account (
         id,
         account_id,
         provider_id,
         user_id,
         password,
         created_at,
         updated_at
       )
       VALUES (
         gen_random_uuid(),
         $1,
         'credential',
         $2,
         $3,
         NOW(),
         NOW()
       )`,
      [email, userId, passwordHash]
    )

    await client.query("COMMIT")

    console.log(
      mode === "created"
        ? `✅ Admin user dibuat: ${email}`
        : `✅ User dipromosikan/diupdate menjadi admin: ${email}`
    )
    console.log(`   Nama   : ${fullName}`)
    console.log(`   Branch : ${branch ?? "ALL / tidak dibatasi branch"}`)
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

main()
  .catch((e) => {
    console.error("❌ Gagal membuat admin:", e.message)
    process.exit(1)
  })
  .finally(() => pool.end())
