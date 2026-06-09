/**
 * Migration script to add a "Default" brand for any EquipmentType
 * that currently has no brand records in the database.
 * 
 * Run: npx tsx scripts/add-default-brands.ts
 */
import "dotenv/config"
import { prisma } from "@/lib/prisma"
import { dbPool } from "@/lib/db-pool"

// Map EquipmentType category (string) to EquipmentBrand areaTarget (enum)
function mapCategoryToArea(category: string): "SALES" | "PARKING" | "TERRACE" | "WAREHOUSE" {
  switch (category) {
    case "PARKIRAN":
      return "PARKING"
    case "TERAS":
      return "TERRACE"
    case "GUDANG":
      return "WAREHOUSE"
    default:
      return "SALES"
  }
}

async function main() {
  console.log("🔍 Memeriksa tipe equipment yang tidak memiliki brand...")

  // Ambil semua tipe equipment beserta brand-nya
  const types = await prisma.equipmentType.findMany({
    include: {
      brands: true,
    },
  })

  const brandlessTypes = types.filter((t) => t.brands.length === 0)

  if (brandlessTypes.length === 0) {
    console.log("✅ Semua tipe equipment sudah memiliki minimal satu brand. Tidak ada perubahan yang diperlukan.")
    return
  }

  console.log(`📦 Menemukan ${brandlessTypes.length} tipe equipment tanpa brand. Menambahkan brand default...`)

  let count = 0
  for (const type of brandlessTypes) {
    const areaTarget = mapCategoryToArea(type.category)
    
    await prisma.equipmentBrand.create({
      data: {
        equipmentTypeId: type.id,
        name: "Default",
        baseKw: type.defaultKw,
        standbyKw: 0,
        runningKw: 0,
        areaTarget: areaTarget,
      },
    })
    console.log(`   ➕ Ditambahkan brand "Default" untuk tipe: "${type.name}" (${type.category})`)
    count++
  }

  console.log(`\n🎉 Migrasi selesai! Berhasil menambahkan ${count} brand "Default" ke database.`)
}

main()
  .catch((e) => {
    console.error("❌ Terjadi kesalahan saat migrasi:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await dbPool.end()
  })
