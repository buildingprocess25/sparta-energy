/**
 * Prisma Seed Script
 * Run: pnpm prisma db seed
 */

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import * as crypto from "crypto"
import "dotenv/config"

const rawUrl = process.env.DATABASE_URL!
const cleanUrl = rawUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "")

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ─── Equipment Master Data ───────────────────────────────────────────────────
const equipmentData = [
  // PARKIRAN
  {
    name: "Shop Sign TL LED",
    category: "PARKIRAN",
    defaultKw: "0.084",
    storeType: null,
  },
  {
    name: "Listplank TL LED",
    category: "PARKIRAN",
    defaultKw: "0.0154",
    storeType: null,
  },
  {
    name: "Lampu Sorot LED 50 W",
    category: "PARKIRAN",
    defaultKw: "0.05",
    storeType: null,
  },
  {
    name: "Polesign",
    category: "PARKIRAN",
    defaultKw: "0.35",
    storeType: null,
  },

  // TERAS
  {
    name: "Lampu area Teras TL",
    category: "TERAS",
    defaultKw: "0.0154",
    storeType: null,
  },
  {
    name: "Pompa Air PC-375 BIT",
    category: "TERAS",
    defaultKw: "0.032",
    storeType: null,
  },

  // SALES
  {
    name: "Paket Kasir",
    category: "SALES",
    defaultKw: "0.05",
    storeType: null,
  },
  {
    name: "Air Conditioner",
    category: "SALES",
    defaultKw: "1.07125",
    storeType: null,
  },
  {
    name: "Lampu area sales TL",
    category: "SALES",
    defaultKw: "0.0154",
    storeType: null,
  },
  {
    name: "Display Cooler (Chiller)",
    category: "SALES",
    defaultKw: "0.494",
    storeType: null,
  },
  {
    name: "Freezer Walls Hiron Chest Showcase",
    category: "SALES",
    defaultKw: "0.309",
    storeType: null,
  },
  {
    name: "Freezer Campina",
    category: "SALES",
    defaultKw: "0.133",
    storeType: null,
  },
  {
    name: "Freezer So Good Chest Showcase",
    category: "SALES",
    defaultKw: "0.175",
    storeType: null,
  },
  {
    name: "Freezer GEA Benfarm",
    category: "SALES",
    defaultKw: "1.23",
    storeType: null,
  },
  {
    name: "Freezer Aice Standing",
    category: "SALES",
    defaultKw: "0.348",
    storeType: null,
  },
  {
    name: "Freezer Belfoods Sanwoo",
    category: "SALES",
    defaultKw: "0.207",
    storeType: null,
  },
  { name: "Mesin ATM", category: "SALES", defaultKw: "0.347", storeType: null },
  {
    name: "Exhaust Fan Ceiling 10 inch (Chiller)",
    category: "SALES",
    defaultKw: "0.026",
    storeType: null,
  },

  // GUDANG, TOILET & SELASAR
  {
    name: "Exhaust Fan Ceiling 10 inch",
    category: "GUDANG",
    defaultKw: "0.026",
    storeType: null,
  },
  {
    name: "Lampu Bohlam Hannochs 9 Watt (Sensor)",
    category: "GUDANG",
    defaultKw: "0.009",
    storeType: null,
  },
  {
    name: "Bell Toko",
    category: "GUDANG",
    defaultKw: "0.0095",
    storeType: null,
  },
  {
    name: "Lampu TL Waterproof",
    category: "GUDANG",
    defaultKw: "0.0154",
    storeType: null,
  },
  {
    name: "Paket CCTV",
    category: "GUDANG",
    defaultKw: "0.182",
    storeType: null,
  },

  // BEANSPOT
  {
    name: "Coffee Maker Delonghi",
    category: "BEANSPOT",
    defaultKw: "0.058919803601",
    storeType: "Beanspot",
  },
  {
    name: "Oden Warmer",
    category: "BEANSPOT",
    defaultKw: "0.0059",
    storeType: "Beanspot",
  },
  {
    name: "Cup Sealer",
    category: "BEANSPOT",
    defaultKw: "0.0546875",
    storeType: "Beanspot",
  },
  {
    name: "Sharp Jolly Time",
    category: "BEANSPOT",
    defaultKw: "0.003630555556",
    storeType: "Beanspot",
  },
  {
    name: "Oven Eka",
    category: "BEANSPOT",
    defaultKw: "0.1142857143",
    storeType: "Beanspot",
  },
  {
    name: "Mini Bar Chiller RS 06 DR",
    category: "BEANSPOT",
    defaultKw: "0.009375",
    storeType: "Beanspot",
  },
  {
    name: "Led TV",
    category: "BEANSPOT",
    defaultKw: "0.04",
    storeType: "Beanspot",
  },
  {
    name: "Chest Freezer Sosis",
    category: "BEANSPOT",
    defaultKw: "0.0338028169",
    storeType: "Beanspot",
  },
  {
    name: "Water Boiler Akebono",
    category: "BEANSPOT",
    defaultKw: "0.1390625",
    storeType: "Beanspot",
  },
  {
    name: "Display Cooler Expo",
    category: "BEANSPOT",
    defaultKw: "0.1028169014",
    storeType: "Beanspot",
  },
  {
    name: "Chest Freezer RSA 460 L",
    category: "BEANSPOT",
    defaultKw: "0.1183098592",
    storeType: "Beanspot",
  },
  {
    name: "Sliding Flat Glass Freezer",
    category: "BEANSPOT",
    defaultKw: "0.1377012771",
    storeType: "Beanspot",
  },
]

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

async function main() {
  console.log("🌱 Starting seed...")

  // ── 1. Equipment Master ──────────────────────────────────────────────────
  console.log(
    `\n📦 Seeding ${equipmentData.length} equipment master records...`
  )
  await prisma.equipmentMaster.deleteMany()
  const created = await prisma.equipmentMaster.createMany({
    data: equipmentData.map((eq) => ({
      name: eq.name,
      category: eq.category,
      defaultKw: eq.defaultKw,
      storeType: eq.storeType,
    })),
    skipDuplicates: true,
  })
  console.log(`   ✅ Created ${created.count} equipment records`)

  // ── 2. Stores ────────────────────────────────────────────────────────────
  console.log("\n🏪 Seeding stores...")

  const store1 = await prisma.store.upsert({
    where: { code: "AHO3" },
    update: { branch: "Head Office" },
    create: {
      code: "AHO3",
      name: "Head Office 03",
      branch: "Head Office",
      plnCustomerId: "123456789003",
      type: "",
      is24Hours: true,
      plnPowerVa: 0,
      parkingAreaM2: 0,
      terraceAreaM2: 0,
      salesAreaM2: 0,
      warehouseAreaM2: 0,
    },
  })

  const store2 = await prisma.store.upsert({
    where: { code: "AHO4" },
    update: { branch: "Head Office" },
    create: {
      code: "AHO4",
      name: "Head Office 04",
      branch: "Head Office",
      plnCustomerId: "123456789004",
      type: "",
      is24Hours: false,
      plnPowerVa: 0,
      parkingAreaM2: 0,
      terraceAreaM2: 0,
      salesAreaM2: 0,
      warehouseAreaM2: 0,
    },
  })

  const store3 = await prisma.store.upsert({
    where: { code: "AHO5" },
    update: { branch: "Head Office" },
    create: {
      code: "AHO5",
      name: "Head Office 05",
      branch: "Head Office",
      plnCustomerId: "123456789005",
      type: "",
      is24Hours: false,
      plnPowerVa: 0,
      parkingAreaM2: 0,
      terraceAreaM2: 0,
      salesAreaM2: 0,
      warehouseAreaM2: 0,
    },
  })

  const store4 = await prisma.store.upsert({
    where: { code: "AHO6" },
    update: { branch: "Head Office" },
    create: {
      code: "AHO6",
      name: "Head Office 06",
      branch: "Head Office",
      plnCustomerId: "123456789006",
      type: "",
      is24Hours: false,
      plnPowerVa: 0,
      parkingAreaM2: 0,
      terraceAreaM2: 0,
      salesAreaM2: 0,
      warehouseAreaM2: 0,
    },
  })

  console.log(`   ✅ Store 1: ${store1.name} (${store1.code})`)
  console.log(`   ✅ Store 2: ${store2.name} (${store2.code})`)
  console.log(`   ✅ Store 3: ${store3.name} (${store3.code})`)
  console.log(`   ✅ Store 4: ${store4.name} (${store4.code})`)

  // ── 3. User ──────────────────────────────────────────────────────────────
  console.log("\n👤 Seeding user...")

  const user = await prisma.user.upsert({
    where: { email: "auditor@sparta.id" },
    update: { branch: "Head Office" },
    create: {
      email: "auditor@sparta.id",
      passwordHash: hashPassword("sparta123"),
      role: "USER",
      fullName: "Auditor SPARTA",
      branch: "Head Office",
    },
  })

  // Better Auth stores credentials in the "account" table (not user.passwordHash)
  await prisma.account.upsert({
    where: {
      id: `credential-${user.id}`,
    },
    update: {
      password: hashPassword("sparta123"),
    },
    create: {
      id: `credential-${user.id}`,
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: hashPassword("sparta123"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  console.log(`   ✅ User: ${user.fullName} (${user.email})`)
  console.log(`   🏢 Branch: ${user.branch}`)
  console.log(`   🔑 Password: sparta123`)

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed complete!")
  console.log(`\n   Login credentials:`)
  console.log(`   Email    : auditor@sparta.id`)
  console.log(`   Password : sparta123`)
  console.log(`   Branch   : Head Office`)
  console.log(
    `   Stores   : ${store1.code} (Regular), ${store2.code} (Beanspot)`
  )
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
