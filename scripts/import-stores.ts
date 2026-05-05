/**
 * Import stores from store.csv into the database.
 * Run: npx tsx scripts/import-stores.ts
 *
 * - Uses createMany (skipDuplicates) — fast bulk insert.
 * - Skips duplicate codes (first occurrence wins).
 * - Required fields with no CSV equivalent get sensible defaults.
 */

import fs from "fs"
import path from "path"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
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

const adapter = new PrismaPg(pool)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const csvPath = path.join(process.cwd(), "store.csv")
  const raw = fs.readFileSync(csvPath, "utf-8")

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  // Skip header
  const rows = lines.slice(1)

  // Deduplicate by code — first occurrence wins
  const seen = new Set<string>()
  const unique: {
    code: string
    branch: string | null
    name: string
    plnCustomerId: string | null
  }[] = []

  for (const line of rows) {
    const parts = line.split(";")
    if (parts.length < 3) continue

    const [code, branch, name, plnCustomerId] = parts.map((p) => p.trim())
    if (!code || !name) continue
    if (seen.has(code)) continue

    seen.add(code)
    unique.push({
      code,
      branch: branch || null,
      name,
      plnCustomerId: plnCustomerId || null,
    })
  }

  console.log(`📦 Total unique store codes: ${unique.length}`)

  // Fix any previously imported stores that got wrong type value
  const fixed = await prisma.store.updateMany({
    where: { type: "ALFAMART" },
    data: { type: "" },
  })
  if (fixed.count > 0) {
    console.log(`🔧 Fixed ${fixed.count} stores with wrong type "ALFAMART" → ""`)
  }

  // Bulk insert — skipDuplicates so existing codes are left untouched
  const result = await prisma.store.createMany({
    data: unique.map((s) => ({
      code: s.code,
      name: s.name,
      branch: s.branch,
      plnCustomerId: s.plnCustomerId,
      type: "",           // will be filled on first audit
      is24Hours: false,
      openTime: "08:00",
      closeTime: "22:00",
      plnPowerVa: 0,
      salesAreaM2: 0,
      parkingAreaM2: 0,
      terraceAreaM2: 0,
      warehouseAreaM2: 0,
    })),
    skipDuplicates: true,
  })

  console.log(`✅ Inserted ${result.count} new stores (duplicates skipped).`)
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect().then(() => pool.end()))
