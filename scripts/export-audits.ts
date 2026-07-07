/**
 * Export audit data to CSV.
 * Run: npx tsx scripts/export-audits.ts
 * Output: audit-export.csv (di root project)
 */

import fs from "fs"
import path from "path"
import { Pool } from "pg"
import * as dotenv from "dotenv"
import { getPoolConfig } from "../lib/db-utils"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

const pool = new Pool(getPoolConfig())

function escapeCsv(value: string | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  // Wrap in quotes if contains comma, newline, or quote
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

async function main() {
  console.log("🔍 Querying audit data...")

  const { rows } = await pool.query(`
    SELECT
      s.code                          AS kode_toko,
      s.name                          AS nama_toko,
      s.branch                        AS cabang,
      u.full_name                     AS diaudit_oleh,
      a.audit_date                    AS tanggal,
      a.status                        AS status,
      a.is_boros                      AS boros,
      a.total_estimated_kwh_per_month AS total_baseline_kwh,
      a.avg_actual_pln_kwh_per_month  AS rata_rata_kwh_pln,
      s.is_24_hours                   AS _24jam,
      ai.type                         AS audit_rekomendasi,
      ai.title                        AS audit_rekomendasi_title,
      ai.description                  AS audit_rekomendasi_desc
    FROM audits a
    JOIN stores s ON s.id = a.store_id
    JOIN users u  ON u.id = a.auditor_id
    JOIN audit_recommendations ai ON ai.audit_id = a.id
    ORDER BY a.audit_date DESC
  `)

  if (rows.length === 0) {
    console.log("⚠️  Tidak ada data audit ditemukan.")
    return
  }

  console.log(`📦 Ditemukan ${rows.length} audit.`)

  const header = [
    "Kode Toko",
    "Nama Toko",
    "Cabang",
    "Diaudit Oleh",
    "Tanggal",
    "Status",
    "Boros",
    "Total Baseline (kWh/bulan)",
    "Rata-rata kWh PLN/bulan",
    "24Jam",
    "Audit Rekomendasi",
    "Judul Rekomendasi",
    "Deskripsi Rekomendasi",
  ].join(",")

  const dataRows = rows.map((r) => {
    const boros =
      r.boros === null ? "Belum diketahui" : r.boros ? "Ya" : "Tidak"

    return [
      escapeCsv(r.kode_toko),
      escapeCsv(r.nama_toko),
      escapeCsv(r.cabang),
      escapeCsv(r.diaudit_oleh),
      escapeCsv(formatDate(r.tanggal)),
      escapeCsv(r.status),
      escapeCsv(boros),
      escapeCsv(
        r.total_baseline_kwh ? Number(r.total_baseline_kwh).toFixed(2) : ""
      ),
      escapeCsv(
        r.rata_rata_kwh_pln ? Number(r.rata_rata_kwh_pln).toFixed(2) : ""
      ),
      escapeCsv(r._24jam ? "Ya" : "Tidak"),
      escapeCsv(r.audit_rekomendasi || ""),
      escapeCsv(r.audit_rekomendasi_title || ""),
      escapeCsv(r.audit_rekomendasi_desc || ""),
    ].join(",")
  })

  const csvContent = [header, ...dataRows].join("\n")
  const outputPath = path.join(process.cwd(), "audit-export.csv")

  fs.writeFileSync(outputPath, "\uFEFF" + csvContent, "utf-8") // BOM for Excel compatibility

  console.log(`✅ Export selesai: ${outputPath}`)
  console.log(`   Total baris: ${rows.length}`)
}

main()
  .catch((e) => {
    console.error("❌ Export gagal:", e.message)
    process.exit(1)
  })
  .finally(() => pool.end())
