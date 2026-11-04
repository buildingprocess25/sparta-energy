/**
 * Recompute the standard (baseline), gap, and Hemat/Boros of completed audits
 * from their audit_items. Older submits stored a total that used brand running kW.
 * Every run writes a CSV of old and new values to the project root, before any update.
 * Dry run:  npx tsx scripts/backfill-audit-baseline.ts
 * Apply:    npx tsx scripts/backfill-audit-baseline.ts --apply
 */

import fs from "fs"
import path from "path"
import { Pool } from "pg"
import * as dotenv from "dotenv"
import { getPoolConfig } from "../lib/db-utils"
import {
  backfillCsv,
  planBaselineBackfill,
  statusLabel,
  type BackfillAuditRow,
} from "../lib/audit-baseline-backfill"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

const APPLY = process.argv.includes("--apply")

const pool = new Pool(getPoolConfig())

type QueryRow = {
  id: string
  code: string
  name: string
  audit_date: Date
  validation_status: string
  stored_total: string | null
  stored_gap: string | null
  avg_actual: string | null
  is_boros: boolean | null
  item_daily_kwh: string
  item_count: string
  recommendation_types: string | null
}

function toNumberOrNull(value: string | null) {
  return value === null ? null : Number(value)
}

function formatKwh(value: number | null) {
  return (value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 2 })
}

function writeReport(csv: string) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const mode = APPLY ? "apply" : "dry-run"
  const file = path.join(process.cwd(), `backfill-audit-baseline-${mode}-${stamp}.csv`)
  fs.writeFileSync(file, csv, "utf8")
  return file
}

async function main() {
  const { rows } = await pool.query<QueryRow>(`
    SELECT
      a.id,
      s.code,
      s.name,
      a.audit_date,
      a.validation_status,
      a.total_estimated_kwh_per_month AS stored_total,
      a.gap_percent AS stored_gap,
      a.avg_actual_pln_kwh_per_month AS avg_actual,
      a.is_boros,
      COALESCE(SUM(i.estimated_daily_kwh), 0) AS item_daily_kwh,
      COUNT(i.id) AS item_count,
      (
        SELECT string_agg(DISTINCT r.type::text, ',')
        FROM audit_recommendations r
        WHERE r.audit_id = a.id
      ) AS recommendation_types
    FROM audits a
    JOIN stores s ON s.id = a.store_id
    LEFT JOIN audit_items i ON i.audit_id = a.id
    WHERE a.status = 'COMPLETED'
    GROUP BY a.id, s.code, s.name
    ORDER BY a.audit_date DESC
  `)

  const auditRows: BackfillAuditRow[] = rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    auditDate: new Date(row.audit_date),
    validationStatus: row.validation_status,
    storedTotal: toNumberOrNull(row.stored_total),
    storedGapPercent: toNumberOrNull(row.stored_gap),
    avgActual: toNumberOrNull(row.avg_actual),
    isBoros: row.is_boros,
    itemDailyKwh: Number(row.item_daily_kwh),
    itemCount: Number(row.item_count),
    recommendationTypes: row.recommendation_types,
  }))
  const changes = planBaselineBackfill(auditRows)
  const flips = changes.filter((change) => change.statusChanged)

  console.log(`Kalkulasi selesai diperiksa: ${auditRows.length}`)
  console.log(`Standar berbeda dari jumlah alat: ${changes.length}`)
  console.log(`Status Hemat/Boros berubah: ${flips.length}`)
  console.log("")

  for (const { row, newTotal, newIsBoros, statusChanged } of changes) {
    console.log(
      [
        `${row.code} ${row.name} (${row.auditDate.toISOString().slice(0, 10)}, ${row.validationStatus})`,
        `standar ${formatKwh(row.storedTotal)} -> ${formatKwh(newTotal)} kWh`,
        statusChanged
          ? `status ${statusLabel(row.isBoros) || "-"} -> ${statusLabel(newIsBoros)}, rekomendasi ${row.recommendationTypes ?? "-"}`
          : `status tetap ${statusLabel(newIsBoros)}`,
      ].join(" | ")
    )
  }

  const file = writeReport(backfillCsv(changes, APPLY ? "apply" : "dry-run"))
  console.log("")
  console.log(`Laporan: ${file}`)

  if (!APPLY) {
    console.log("Dry run. Belum ada data yang diubah. Jalankan dengan --apply untuk menyimpan.")
    return
  }

  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    for (const { row, newTotal, newGapPercent, newIsBoros } of changes) {
      await client.query(
        `UPDATE audits
         SET total_estimated_kwh_per_month = $1,
             gap_percent = $2,
             is_boros = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [newTotal, newGapPercent, newIsBoros, row.id]
      )
    }
    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Gagal menyimpan. Semua perubahan dibatalkan, data tetap seperti semula.")
    throw error
  } finally {
    client.release()
  }

  console.log(`${changes.length} kalkulasi diperbarui.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
