import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { dbPool } from "@/lib/db-pool"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaPg(dbPool)
  
  // Auto-migration: ensure notes column exists in audit_items table
  dbPool
    .query("ALTER TABLE audit_items ADD COLUMN IF NOT EXISTS notes TEXT;")
    .catch((err) => {
      console.warn("[DB Auto-Migration] Note: audit_items notes column check:", err?.message)
    })

  // Auto-migration: ensure created_by_id column exists in equipment_types and equipment_brands
  dbPool
    .query("ALTER TABLE equipment_types ADD COLUMN IF NOT EXISTS created_by_id UUID;")
    .catch((err) => {
      console.warn("[DB Auto-Migration] equipment_types created_by_id check:", err?.message)
    })

  dbPool
    .query("ALTER TABLE equipment_brands ADD COLUMN IF NOT EXISTS created_by_id UUID;")
    .catch((err) => {
      console.warn("[DB Auto-Migration] equipment_brands created_by_id check:", err?.message)
    })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    transactionOptions: {
      maxWait: 15000,
      timeout: 15000,
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
