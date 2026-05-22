/**
 * Export store audit metrics to CSV.
 * Run: npx tsx scripts/export-store-data.ts
 * Output: store-data-export.csv (di root project)
 */

import fs from "fs"
import path from "path"
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

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatDecimal(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const num = Number(value)
  return Number.isFinite(num) ? num.toFixed(2) : ""
}

async function main() {
  console.log("🔍 Querying store data...")

  const { rows } = await pool.query(`
    SELECT
      s.code AS kode_toko,
      s.name AS nama_toko,
      s.branch AS cabang,
      s.type AS tipe_toko,
      aph.billing_month AS bulan,
      aph.sales_transaction_per_day AS std,
      aph.pln_usage_kwh AS pln_kwh,
      a.total_estimated_kwh_per_month AS baseline,
      a.audit_date AS tanggal_audit
    FROM audits a
    JOIN stores s ON s.id = a.store_id
    LEFT JOIN audit_pln_std_history aph ON aph.audit_id = a.id
    WHERE
      COALESCE(aph.sales_transaction_per_day, 0) <> 0
      OR COALESCE(aph.pln_usage_kwh, 0) <> 0
      OR COALESCE(a.total_estimated_kwh_per_month, 0) <> 0
    ORDER BY a.audit_date DESC, s.code ASC, aph.month_idx ASC
  `)

  if (rows.length === 0) {
    console.log("⚠️  Tidak ada data toko ditemukan.")
    return
  }

  console.log(`📦 Ditemukan ${rows.length} baris data toko.`)

  const header = [
    "Kode Toko",
    "Nama Toko",
    "Cabang",
    "Tipe Toko",
    "Bulan",
    "STD",
    "PLN kWh",
    "Baseline",
  ].join(",")

  const dataRows = rows.map((r) =>
    [
      escapeCsv(r.kode_toko),
      escapeCsv(r.nama_toko),
      escapeCsv(r.cabang),
      escapeCsv(r.tipe_toko),
      escapeCsv(r.bulan),
      escapeCsv(formatDecimal(r.std)),
      escapeCsv(formatDecimal(r.pln_kwh)),
      escapeCsv(formatDecimal(r.baseline)),
    ].join(",")
  )

  const csvContent = [header, ...dataRows].join("\n")
  const outputPath = path.join(process.cwd(), "store-data-export.csv")

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
