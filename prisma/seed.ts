/**
 * Prisma Seed Script
 * Run: pnpm prisma db seed
 *
 * Seeds:
 *  - EquipmentMaster (from master.xlsx)
 *  - 1 User (role: USER)
 *  - 1 Store (ALF-0123 Alfamart Cibubur Raya)
 *  - UserStoreAccess linking the two
 */

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import * as crypto from "crypto"
import "dotenv/config"

// Strip sslmode from URL — we set ssl directly on Pool to avoid cert verification issues
const rawUrl = process.env.DATABASE_URL!
const cleanUrl = rawUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "")

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ─── Equipment Master Data (from master.xlsx) ───────────────────────────────
// area name → must match AreaTarget enum: PARKING, TERRACE, SALES, WAREHOUSE
// Beanspot items get category "BEANSPOT" and no areaTarget constraint (optional)

const equipmentData = [
  // PARKIRAN
  { name: "Shop Sign TL LED", category: "PARKIRAN", defaultWatt: 0.084, storeType: null },
  { name: "Listplank TL LED", category: "PARKIRAN", defaultWatt: 0.0154, storeType: null },
  { name: "Lampu Sorot LED 50 W", category: "PARKIRAN", defaultWatt: 0.05, storeType: null },
  { name: "Polesign", category: "PARKIRAN", defaultWatt: 0.35, storeType: null },

  // TERAS
  { name: "Lampu area Teras TL", category: "TERAS", defaultWatt: 0.0154, storeType: null },
  { name: "Pompa Air PC-375 BIT", category: "TERAS", defaultWatt: 0.032, storeType: null },

  // SALES
  { name: "Paket Kasir", category: "SALES", defaultWatt: 0.05, storeType: null },
  { name: "Air Conditioner", category: "SALES", defaultWatt: 1.07125, storeType: null },
  { name: "Lampu area sales TL", category: "SALES", defaultWatt: 0.0154, storeType: null },
  { name: "Display Cooler (Chiller)", category: "SALES", defaultWatt: 0.494, storeType: null },
  { name: "Freezer Walls Hiron Chest Showcase", category: "SALES", defaultWatt: 0.309, storeType: null },
  { name: "Freezer Campina", category: "SALES", defaultWatt: 0.133, storeType: null },
  { name: "Freezer So Good Chest Showcase", category: "SALES", defaultWatt: 0.175, storeType: null },
  { name: "Freezer GEA Benfarm", category: "SALES", defaultWatt: 1.23, storeType: null },
  { name: "Freezer Aice Standing", category: "SALES", defaultWatt: 0.348, storeType: null },
  { name: "Freezer Belfoods Sanwoo", category: "SALES", defaultWatt: 0.207, storeType: null },
  { name: "ATM Mandiri", category: "SALES", defaultWatt: 0.347, storeType: null },
  { name: "Exhaust Fan Ceiling 10 inch (Chiller)", category: "SALES", defaultWatt: 0.026, storeType: null },

  // GUDANG, TOILET & SELASAR
  { name: "Exhaust Fan Ceiling 10 inch", category: "GUDANG", defaultWatt: 0.026, storeType: null },
  { name: "Lampu Bohlam Hannochs 9 Watt (Sensor)", category: "GUDANG", defaultWatt: 0.009, storeType: null },
  { name: "Bell Toko", category: "GUDANG", defaultWatt: 0.0095, storeType: null },
  { name: "Lampu TL Waterproof", category: "GUDANG", defaultWatt: 0.0154, storeType: null },
  { name: "Paket CCTV", category: "GUDANG", defaultWatt: 0.182, storeType: null },

  // BEANSPOT (store_type = Beanspot)
  { name: "Coffee Maker Delonghi", category: "BEANSPOT", defaultWatt: 0.0589, storeType: "Beanspot" },
  { name: "Oden Warmer", category: "BEANSPOT", defaultWatt: 0.0059, storeType: "Beanspot" },
  { name: "Cup Sealer", category: "BEANSPOT", defaultWatt: 0.0547, storeType: "Beanspot" },
  { name: "Sharp Jolly Time", category: "BEANSPOT", defaultWatt: 0.0036, storeType: "Beanspot" },
  { name: "Oven Eka", category: "BEANSPOT", defaultWatt: 0.1143, storeType: "Beanspot" },
  { name: "Mini Bar Chiller RS 06 DR", category: "BEANSPOT", defaultWatt: 0.0094, storeType: "Beanspot" },
  { name: "Led TV", category: "BEANSPOT", defaultWatt: 0.04, storeType: "Beanspot" },
  { name: "Chest Freezer Sosis", category: "BEANSPOT", defaultWatt: 0.0338, storeType: "Beanspot" },
  { name: "Water Boiler Akebono", category: "BEANSPOT", defaultWatt: 0.1391, storeType: "Beanspot" },
  { name: "Display Cooler Expo", category: "BEANSPOT", defaultWatt: 0.1028, storeType: "Beanspot" },
  { name: "Chest Freezer RSA 460 L", category: "BEANSPOT", defaultWatt: 0.1183, storeType: "Beanspot" },
  { name: "Sliding Flat Glass Freezer", category: "BEANSPOT", defaultWatt: 0.1377, storeType: "Beanspot" }
]

function hashPassword(password: string): string {
  // Simple SHA-256 for dev seed — replace with bcrypt/argon2 when BetterAuth is wired up
  return crypto.createHash("sha256").update(password).digest("hex")
}

async function main() {
  console.log("🌱 Starting seed...")

  // ── 1. Equipment Master ─────────────────────────────────────────────────
  console.log(
    `\n📦 Seeding ${equipmentData.length} equipment master records...`
  )

  await prisma.equipmentMaster.deleteMany() // clean slate

  const created = await prisma.equipmentMaster.createMany({
    data: equipmentData.map((eq) => ({
      name: eq.name,
      category: eq.category,
      defaultWatt: eq.defaultWatt,
      storeType: eq.storeType,
    })),
    skipDuplicates: true,
  })

  console.log(`   ✅ Created ${created.count} equipment records`)

  // ── 2. Seed Store ────────────────────────────────────────────────────────
  console.log("\n🏪 Seeding store...")

  const store = await prisma.store.upsert({
    where: { code: "ALF-0123" },
    update: {
      branch: "Jakarta Timur",
      plnCustomerId: "123456789012",
    },
    create: {
      code: "ALF-0123",
      name: "Alfamart Cibubur Raya",
      branch: "Jakarta Timur",
      plnCustomerId: "123456789012",
      type: "Regular",
      is24Hours: false,
      openTime: "07:00",
      closeTime: "22:00",
      plnPowerVa: 33000,
      parkingAreaM2: 30,
      terraceAreaM2: 20,
      salesAreaM2: 200,
      warehouseAreaM2: 50,
    },
  })

  console.log(`   ✅ Store: ${store.name} (${store.code})`)

  // ── 3. Seed User ─────────────────────────────────────────────────────────
  console.log("\n👤 Seeding user...")

  const user = await prisma.user.upsert({
    where: { email: "auditor@sparta.id" },
    update: {},
    create: {
      email: "auditor@sparta.id",
      passwordHash: hashPassword("sparta123"),
      role: "USER",
      fullName: "Auditor SPARTA",
    },
  })

  console.log(`   ✅ User: ${user.fullName} (${user.email})`)
  console.log(`   🔑 Password: sparta123`)

  // ── 4. UserStoreAccess ───────────────────────────────────────────────────
  console.log("\n🔗 Linking user to store...")

  const existing = await prisma.userStoreAccess.findFirst({
    where: { userId: user.id, storeId: store.id },
  })

  if (!existing) {
    await prisma.userStoreAccess.create({
      data: { userId: user.id, storeId: store.id },
    })
    console.log(`   ✅ Access granted: ${user.email} → ${store.code}`)
  } else {
    console.log(`   ℹ️  Access already exists, skipping...`)
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed complete!")
  console.log(`\n   Login credentials:`)
  console.log(`   Email    : auditor@sparta.id`)
  console.log(`   Password : sparta123`)
  console.log(`   Store    : ${store.code} — ${store.name}`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
