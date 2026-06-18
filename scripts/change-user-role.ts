import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import "dotenv/config"

const rawUrl = process.env.DATABASE_URL!
const cleanUrl = rawUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "")

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function printUsage() {
  console.log(`
Usage:
  npx tsx scripts/change-user-role.ts <email> <USER|ADMIN>

Example:
  npx tsx scripts/change-user-role.ts yogi.prayitno@sat.co.id USER
`)
}

async function main() {
  const emailArg = process.argv[2]
  const roleArg = process.argv[3]

  if (!emailArg || !roleArg) {
    printUsage()
    process.exit(1)
  }

  const email = emailArg.trim().toLowerCase()
  const role = roleArg.trim().toUpperCase()

  if (role !== "USER" && role !== "ADMIN") {
    console.error(`Error: Invalid role "${role}". Role must be USER or ADMIN.`)
    printUsage()
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (!existing) {
    console.error(`Error: User with email "${email}" not found.`)
    process.exit(1)
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: role as "USER" | "ADMIN" },
  })

  console.log(`✅ Success: Updated user role for ${updated.email} to ${updated.role}`)
}

main()
  .catch((e) => {
    console.error("❌ Script failed:", e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
    pool.end()
  })
