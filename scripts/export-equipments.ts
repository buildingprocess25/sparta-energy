/**
 * Export equipment audit history to CSV.
 * Run: npx tsx scripts/export-equipments.ts
 * Output: equipment-export.csv (di root project)
 */

import fs from "fs"
import path from "path"
import { Pool } from "pg"
import * as dotenv from "dotenv"
import { getPoolConfig } from "../lib/db-utils"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

const pool = new Pool(getPoolConfig())

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

async function main() {
  console.log("🔍 Querying equipment data...")

  const { rows } = await pool.query(`
    SELECT
      COALESCE(et.name, ai.custom_name, '') AS tipe_equipment,
      COALESCE(NULLIF(eb.name, ''), NULLIF(ai.brand_name, ''), '') AS merek,
      CASE ai.area_target::text
        WHEN 'SALES' THEN 'Sales Area'
        WHEN 'PARKING' THEN 'Parkir'
        WHEN 'TERRACE' THEN 'Teras'
        WHEN 'WAREHOUSE' THEN 'Gudang'
        ELSE ai.area_target::text
      END AS area,
      ai.qty AS jumlah,
      s.code AS kode_toko,
      s.name AS nama_toko,
      s.branch AS cabang
    FROM audit_items ai
    JOIN audits a ON a.id = ai.audit_id
    JOIN stores s ON s.id = a.store_id
    LEFT JOIN equipment_types et ON et.id = ai.equipment_type_id
    LEFT JOIN equipment_brands eb ON eb.id = ai.equipment_brand_id
    ORDER BY a.audit_date DESC, s.code ASC, area ASC, tipe_equipment ASC
  `)

  if (rows.length === 0) {
    console.log("⚠️  Tidak ada data equipment ditemukan.")
    return
  }

  console.log(`📦 Ditemukan ${rows.length} equipment.`)

  const header = [
    "Tipe Equipment",
    "Merek",
    "Area",
    "Jumlah",
    "Kode Toko",
    "Nama Toko",
    "Cabang",
  ].join(",")

  const dataRows = rows.map((r) =>
    [
      escapeCsv(r.tipe_equipment),
      escapeCsv(r.merek),
      escapeCsv(r.area),
      escapeCsv(r.jumlah),
      escapeCsv(r.kode_toko),
      escapeCsv(r.nama_toko),
      escapeCsv(r.cabang),
    ].join(",")
  )

  const csvContent = [header, ...dataRows].join("\n")
  const outputPath = path.join(process.cwd(), "equipment-export.csv")

  fs.writeFileSync(outputPath, "\uFEFF" + csvContent, "utf-8")

  console.log(`✅ Export selesai: ${outputPath}`)
  console.log(`   Total baris: ${rows.length}`)
}

main()
  .catch((e) => {
    console.error("❌ Export gagal:", e.message)
    process.exit(1)
  })
  .finally(() => pool.end())
