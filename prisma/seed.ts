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
  { name: "Shop Sign TL LED", category: "PARKIRAN", defaultKw: "0.084", storeType: null, brands: [] },
  { name: "Listplank TL LED", category: "PARKIRAN", defaultKw: "0.0154", storeType: null, brands: [] },
  { name: "Lampu Sorot LED 50 W", category: "PARKIRAN", defaultKw: "0.05", storeType: null, brands: [] },
  { name: "Polesign", category: "PARKIRAN", defaultKw: "0.35", storeType: null, brands: [] },

  // TERAS
  { name: "Lampu area Teras TL", category: "TERAS", defaultKw: "0.0154", storeType: null, brands: [] },
  { name: "Pompa Air", category: "TERAS", defaultKw: "0.032", storeType: null, brands: ["Shimizu PC-375 BIT"] },

  // SALES
  { name: "Paket Kasir", category: "SALES", defaultKw: "0.05", storeType: null, brands: [] },
  { name: "Air Conditioner", category: "SALES", defaultKw: "1.07125", storeType: null, brands: ["Daikin", "Panasonic", "Sharp"] },
  { name: "Lampu area sales TL", category: "SALES", defaultKw: "0.0154", storeType: null, brands: [] },
  { name: "Display Cooler (Chiller)", category: "SALES", defaultKw: "0.494", storeType: null, brands: [] },
  { name: "Freezer Chest Showcase", category: "SALES", defaultKw: "0.309", storeType: null, brands: ["Walls Hiron", "So Good"] },
  { name: "Freezer", category: "SALES", defaultKw: "0.133", storeType: null, brands: ["Campina", "GEA Benfarm", "Belfoods Sanwoo"] },
  { name: "Freezer Standing", category: "SALES", defaultKw: "0.348", storeType: null, brands: ["Aice"] },
  { name: "Mesin ATM", category: "SALES", defaultKw: "0.347", storeType: null, brands: [] },
  { name: "Exhaust Fan Ceiling 10 inch (Chiller)", category: "SALES", defaultKw: "0.026", storeType: null, brands: [] },

  // GUDANG, TOILET & SELASAR
  { name: "Exhaust Fan Ceiling 10 inch", category: "GUDANG", defaultKw: "0.026", storeType: null, brands: [] },
  { name: "Lampu Bohlam 9 Watt (Sensor)", category: "GUDANG", defaultKw: "0.009", storeType: null, brands: ["Hannochs"] },
  { name: "Bell Toko", category: "GUDANG", defaultKw: "0.0095", storeType: null, brands: [] },
  { name: "Lampu TL Waterproof", category: "GUDANG", defaultKw: "0.0154", storeType: null, brands: [] },
  { name: "Paket CCTV", category: "GUDANG", defaultKw: "0.182", storeType: null, brands: [] },

  // BEANSPOT
  { name: "Coffee Maker", category: "BEANSPOT", defaultKw: "0.058919803601", storeType: "Beanspot", brands: ["Delonghi"] },
  { name: "Oden Warmer", category: "BEANSPOT", defaultKw: "0.0059", storeType: "Beanspot", brands: [] },
  { name: "Cup Sealer", category: "BEANSPOT", defaultKw: "0.0546875", storeType: "Beanspot", brands: [] },
  { name: "Mesin Popcorn", category: "BEANSPOT", defaultKw: "0.003630555556", storeType: "Beanspot", brands: ["Sharp Jolly Time"] },
  { name: "Oven", category: "BEANSPOT", defaultKw: "0.1142857143", storeType: "Beanspot", brands: ["Eka"] },
  { name: "Mini Bar Chiller", category: "BEANSPOT", defaultKw: "0.009375", storeType: "Beanspot", brands: ["RS 06 DR"] },
  { name: "Led TV", category: "BEANSPOT", defaultKw: "0.04", storeType: "Beanspot", brands: [] },
  { name: "Chest Freezer Sosis", category: "BEANSPOT", defaultKw: "0.0338028169", storeType: "Beanspot", brands: [] },
  { name: "Water Boiler", category: "BEANSPOT", defaultKw: "0.1390625", storeType: "Beanspot", brands: ["Akebono"] },
  { name: "Display Cooler", category: "BEANSPOT", defaultKw: "0.1028169014", storeType: "Beanspot", brands: ["Expo"] },
  { name: "Chest Freezer 460 L", category: "BEANSPOT", defaultKw: "0.1183098592", storeType: "Beanspot", brands: ["RSA"] },
  { name: "Sliding Flat Glass Freezer", category: "BEANSPOT", defaultKw: "0.1377012771", storeType: "Beanspot", brands: [] },
]

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

async function main() {
  console.log("🌱 Starting seed...")

  // ── 1. Equipment Types & Brands ──────────────────────────────────────────
  console.log(
    `\n📦 Seeding ${equipmentData.length} equipment type records...`
  )
  await prisma.equipmentBrand.deleteMany()
  await prisma.equipmentType.deleteMany()

  let typeCount = 0
  let brandCount = 0

  for (const eq of equipmentData) {
    const type = await prisma.equipmentType.create({
      data: {
        name: eq.name,
        category: eq.category,
        defaultKw: eq.defaultKw,
        storeType: eq.storeType,
      },
    })
    typeCount++

    if (eq.brands && eq.brands.length > 0) {
      await prisma.equipmentBrand.createMany({
        data: eq.brands.map((brandName) => ({
          equipmentTypeId: type.id,
          name: brandName,
          baseKw: eq.defaultKw,
        })),
      })
      brandCount += eq.brands.length
    }
  }

  console.log(`   ✅ Created ${typeCount} equipment types`)
  console.log(`   ✅ Created ${brandCount} equipment brands`)

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

  // ── 4. Demo Stores ────────────────────────────────────────────────────────
  console.log("\n🏪 Seeding demo stores...")

  const demoStore1 = await prisma.store.upsert({
    where: { code: "DEM1" },
    update: { branch: "DEMO" },
    create: {
      code: "DEM1",
      name: "Alfamart Demo 1",
      branch: "DEMO",
      plnCustomerId: "0000000001",
      type: "",
      is24Hours: false,
      openTime: "07:00",
      closeTime: "22:00",
      plnPowerVa: 0,
      parkingAreaM2: 0,
      terraceAreaM2: 0,
      salesAreaM2: 0,
      warehouseAreaM2: 0,
    },
  })

  const demoStore2 = await prisma.store.upsert({
    where: { code: "DEMO2" },
    update: { branch: "DEMO" },
    create: {
      code: "DEM2",
      name: "Alfamart Demo 2",
      branch: "DEMO",
      plnCustomerId: "0000000002",
      type: "",
      is24Hours: false,
      openTime: "07:00",
      closeTime: "22:00",
      plnPowerVa: 33000,
      parkingAreaM2: 40,
      terraceAreaM2: 20,
      salesAreaM2: 150,
      warehouseAreaM2: 25,
    },
  })

  console.log(`   ✅ Demo Store 1: ${demoStore1.name} (${demoStore1.code})`)
  console.log(`   ✅ Demo Store 2: ${demoStore2.name} (${demoStore2.code})`)

  // ── 5. Demo User ──────────────────────────────────────────────────────────
  console.log("\n👤 Seeding demo user...")

  const DEMO_PASSWORD = "demo-sparta-2025"

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@sparta.app" },
    update: { branch: "DEMO" },
    create: {
      email: "demo@sparta.app",
      passwordHash: hashPassword(DEMO_PASSWORD),
      role: "USER",
      fullName: "Demo User",
      branch: "DEMO",
    },
  })

  await prisma.account.upsert({
    where: { id: `credential-${demoUser.id}` },
    update: { password: hashPassword(DEMO_PASSWORD) },
    create: {
      id: `credential-${demoUser.id}`,
      accountId: demoUser.id,
      providerId: "credential",
      userId: demoUser.id,
      password: hashPassword(DEMO_PASSWORD),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  console.log(`   ✅ Demo User: ${demoUser.fullName} (${demoUser.email})`)
  console.log(`   🏢 Branch: ${demoUser.branch}`)

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed complete!")
  console.log(`\n   Login credentials:`)
  console.log(`   Email    : auditor@sparta.id`)
  console.log(`   Password : sparta123`)
  console.log(`   Branch   : Head Office`)
  console.log(
    `   Stores   : ${store1.code} (Regular), ${store2.code} (Beanspot)`
  )
  console.log(`\n   Demo Login:`)
  console.log(`   Email    : demo@sparta.app`)
  console.log(`   Branch   : DEMO`)
  console.log(`   Stores   : ${demoStore1.code}, ${demoStore2.code}`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
