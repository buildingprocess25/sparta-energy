/**
 * Prisma Seed Script
 * Run: pnpm prisma db seed
 */

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import * as crypto from "crypto"
import "dotenv/config"
import { getPoolConfig } from "../lib/db-utils"

const pool = new Pool(getPoolConfig())
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ─── Equipment Master Data ───────────────────────────────────────────────────
type BrandEntry = string | { name: string; runningKw: string; standbyKw: string }
const equipmentData: { name: string; category: string; deviceCategory: string; defaultKw: string; storeType: string | null; brands: BrandEntry[]; calcMethod: string; calcDuration: number | null }[] = [
  // PARKIRAN
  { name: "Shop Sign TL LED", category: "PARKIRAN", deviceCategory: "Pencahayaan", defaultKw: "0.084", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },
  { name: "Listplank TL LED", category: "PARKIRAN", deviceCategory: "Pencahayaan", defaultKw: "0.0154", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },
  { name: "Lampu Sorot LED 50 W", category: "PARKIRAN", deviceCategory: "Pencahayaan", defaultKw: "0.05", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },
  { name: "Polesign", category: "PARKIRAN", deviceCategory: "Pencahayaan", defaultKw: "0.35", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },

  // TERAS
  { name: "Lampu area Teras TL", category: "TERAS", deviceCategory: "Pencahayaan", defaultKw: "0.0154", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },
  { name: "Pompa Air", category: "TERAS", deviceCategory: "Lainnya", defaultKw: "0.032", storeType: null, brands: ["Shimizu PC-375 BIT"], calcMethod: "STANDARD", calcDuration: null },

  // SALES
  { name: "Paket Kasir", category: "SALES", deviceCategory: "Lainnya", defaultKw: "0.05", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },
  { name: "Air Conditioner", category: "SALES", deviceCategory: "Sistem HVAC", defaultKw: "1.07125", storeType: null, brands: ["Daikin", "Panasonic", "Sharp"], calcMethod: "STANDARD", calcDuration: null },
  { name: "Lampu area sales TL", category: "SALES", deviceCategory: "Pencahayaan", defaultKw: "0.0154", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },
  { name: "Display Cooler (Chiller)", category: "SALES", deviceCategory: "Sistem Pendingin Produk", defaultKw: "0.494", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },
  { name: "Freezer Chest Showcase", category: "SALES", deviceCategory: "Sistem Pendingin Produk", defaultKw: "0.309", storeType: null, brands: ["Walls Hiron", "So Good"], calcMethod: "STANDARD", calcDuration: null },
  { name: "Freezer", category: "SALES", deviceCategory: "Sistem Pendingin Produk", defaultKw: "0.133", storeType: null, brands: ["Campina", "GEA Benfarm", "Belfoods Sanwoo"], calcMethod: "STANDARD", calcDuration: null },
  { name: "Freezer Standing", category: "SALES", deviceCategory: "Sistem Pendingin Produk", defaultKw: "0.348", storeType: null, brands: ["Aice"], calcMethod: "STANDARD", calcDuration: null },
  { name: "Mesin ATM", category: "SALES", deviceCategory: "Lainnya", defaultKw: "0.347", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },
  { name: "Exhaust Fan Ceiling 10 inch (Chiller)", category: "SALES", deviceCategory: "Lainnya", defaultKw: "0.026", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },

  // GUDANG, TOILET & SELASAR
  { name: "Exhaust Fan Ceiling 10 inch", category: "GUDANG", deviceCategory: "Lainnya", defaultKw: "0.026", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },
  { name: "Lampu Bohlam 9 Watt (Sensor)", category: "GUDANG", deviceCategory: "Pencahayaan", defaultKw: "0.009", storeType: null, brands: ["Hannochs"], calcMethod: "STANDARD", calcDuration: null },
  { name: "Bell Toko", category: "GUDANG", deviceCategory: "Lainnya", defaultKw: "0.0095", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },
  { name: "Lampu TL Waterproof", category: "GUDANG", deviceCategory: "Pencahayaan", defaultKw: "0.0154", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },
  { name: "Paket CCTV", category: "GUDANG", deviceCategory: "Lainnya", defaultKw: "0.182", storeType: null, brands: [], calcMethod: "STANDARD", calcDuration: null },

  // BEANSPOT
  { 
    name: "Coffee Maker", 
    category: "BEANSPOT", 
    deviceCategory: "Lainnya", 
    defaultKw: "0.058919803601", 
    storeType: "Beanspot", 
    brands: [{ name: "Delonghi", runningKw: "1.25", standbyKw: "0.05" }], 
    calcMethod: "TRANSACTION", 
    calcDuration: 60 
  },
  { name: "Oden Warmer", category: "BEANSPOT", deviceCategory: "Lainnya", defaultKw: "0.0059", storeType: "Beanspot", brands: [], calcMethod: "STANDARD", calcDuration: null },
  { 
    name: "Cup Sealer", 
    category: "BEANSPOT", 
    deviceCategory: "Lainnya", 
    defaultKw: "0.0546875", 
    storeType: "Beanspot", 
    brands: [{ name: "Standard Sealer", runningKw: "0.35", standbyKw: "0.01" }], 
    calcMethod: "TRANSACTION", 
    calcDuration: 30 
  },
  { name: "Mesin Popcorn", category: "BEANSPOT", deviceCategory: "Lainnya", defaultKw: "0.003630555556", storeType: "Beanspot", brands: ["Sharp Jolly Time"], calcMethod: "STANDARD", calcDuration: null },
  { 
    name: "Oven", 
    category: "BEANSPOT", 
    deviceCategory: "Lainnya", 
    defaultKw: "0.1142857143", 
    storeType: "Beanspot", 
    brands: [{ name: "Eka", runningKw: "2.4", standbyKw: "0.1" }], 
    calcMethod: "BATCH", 
    calcDuration: 900 
  },
  { name: "Mini Bar Chiller", category: "BEANSPOT", deviceCategory: "Sistem Pendingin Produk", defaultKw: "0.009375", storeType: "Beanspot", brands: ["RS 06 DR"], calcMethod: "STANDARD", calcDuration: null },
  { name: "Led TV", category: "BEANSPOT", deviceCategory: "Lainnya", defaultKw: "0.04", storeType: "Beanspot", brands: [], calcMethod: "STANDARD", calcDuration: null },
  { name: "Chest Freezer Sosis", category: "BEANSPOT", deviceCategory: "Sistem Pendingin Produk", defaultKw: "0.0338028169", storeType: "Beanspot", brands: [], calcMethod: "STANDARD", calcDuration: null },
  { name: "Water Boiler", category: "BEANSPOT", deviceCategory: "Lainnya", defaultKw: "0.1390625", storeType: "Beanspot", brands: ["Akebono"], calcMethod: "STANDARD", calcDuration: null },
  { name: "Display Cooler", category: "BEANSPOT", deviceCategory: "Sistem Pendingin Produk", defaultKw: "0.1028169014", storeType: "Beanspot", brands: ["Expo"], calcMethod: "STANDARD", calcDuration: null },
  { name: "Chest Freezer 460 L", category: "BEANSPOT", deviceCategory: "Sistem Pendingin Produk", defaultKw: "0.1183098592", storeType: "Beanspot", brands: ["RSA"], calcMethod: "STANDARD", calcDuration: null },
  { name: "Sliding Flat Glass Freezer", category: "BEANSPOT", deviceCategory: "Sistem Pendingin Produk", defaultKw: "0.1377012771", storeType: "Beanspot", brands: [], calcMethod: "STANDARD", calcDuration: null },
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

  let typeCount = 0
  let brandCount = 0

  for (const eq of equipmentData) {
    const existingType = await prisma.equipmentType.findFirst({
      where: { name: eq.name },
    })

    let type
    if (existingType) {
      type = await prisma.equipmentType.update({
        where: { id: existingType.id },
        data: {
          category: eq.category,
          deviceCategory: eq.deviceCategory,
          defaultKw: eq.defaultKw,
          storeType: eq.storeType,
          calcMethod: eq.calcMethod,
          calcDuration: eq.calcDuration,
        },
      })
    } else {
      type = await prisma.equipmentType.create({
        data: {
          name: eq.name,
          category: eq.category,
          deviceCategory: eq.deviceCategory,
          defaultKw: eq.defaultKw,
          storeType: eq.storeType,
          calcMethod: eq.calcMethod,
          calcDuration: eq.calcDuration,
        },
      })
    }
    typeCount++

    if (eq.brands && eq.brands.length > 0) {
      for (const brand of eq.brands) {
        const isObj = typeof brand === "object" && brand !== null
        const bName = isObj ? brand.name : brand
        const running = isObj ? brand.runningKw : eq.defaultKw
        const standby = isObj ? brand.standbyKw : "0.0"

        const existingBrand = await prisma.equipmentBrand.findFirst({
          where: {
            equipmentTypeId: type.id,
            name: { equals: bName.trim(), mode: "insensitive" },
          },
        })

        if (existingBrand) {
          await prisma.equipmentBrand.update({
            where: { id: existingBrand.id },
            data: {
              baseKw: eq.defaultKw,
              runningKw: running,
              standbyKw: standby,
            },
          })
        } else {
          await prisma.equipmentBrand.create({
            data: {
              equipmentTypeId: type.id,
              name: bName,
              baseKw: eq.defaultKw,
              runningKw: running,
              standbyKw: standby,
            },
          })
          brandCount++
        }
      }
    }
  }

  console.log(`   ✅ Seeded ${typeCount} equipment types`)
  console.log(`   ✅ Seeded new/updated equipment brands`)

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
    where: { code: "DEM2" },
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
