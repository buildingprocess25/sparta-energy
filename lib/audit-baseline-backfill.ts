import { summarizeAuditItems } from "./audit-recalculate"

// Differences below this are rounding from the Decimal columns, not the bug.
export const MIN_DIFF_KWH = 0.01

export type BackfillAuditRow = {
  id: string
  code: string
  name: string
  auditDate: Date
  validationStatus: string
  storedTotal: number | null
  storedGapPercent: number | null
  avgActual: number | null
  isBoros: boolean | null
  itemDailyKwh: number
  itemCount: number
  recommendationTypes: string | null
}

export type BackfillChange = {
  row: BackfillAuditRow
  newTotal: number
  newGapPercent: number | null
  newIsBoros: boolean
  statusChanged: boolean
}

export function planBaselineBackfill(rows: BackfillAuditRow[]): BackfillChange[] {
  return rows
    .filter((row) => row.itemCount > 0)
    .map((row) => {
      const summary = summarizeAuditItems([row.itemDailyKwh], row.avgActual ?? 0)
      return {
        row,
        newTotal: summary.totalEstimatedKwhPerMonth,
        newGapPercent: summary.gapPercent,
        newIsBoros: summary.isBoros,
        statusChanged: row.isBoros !== summary.isBoros,
      }
    })
    .filter(
      (change) =>
        Math.abs(change.newTotal - (change.row.storedTotal ?? 0)) >= MIN_DIFF_KWH
    )
}

export function statusLabel(isBoros: boolean | null) {
  if (isBoros === null) return ""
  return isBoros ? "Boros" : "Hemat"
}

function csvCell(value: string | number | null) {
  if (value === null) return ""
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function round(value: number | null, digits = 2) {
  return value === null ? null : Number(value.toFixed(digits))
}

export function backfillCsv(changes: BackfillChange[], mode: "dry-run" | "apply") {
  const header = [
    "audit_id",
    "kode_toko",
    "nama_toko",
    "tanggal_kalkulasi",
    "status_validasi",
    "standar_lama_kwh",
    "standar_baru_kwh",
    "gap_lama_persen",
    "gap_baru_persen",
    "aktual_pln_kwh",
    "status_lama",
    "status_baru",
    "status_berubah",
    "rekomendasi_tersimpan",
    "mode",
  ]
  const lines = changes.map(({ row, newTotal, newGapPercent, newIsBoros, statusChanged }) =>
    [
      row.id,
      row.code,
      row.name,
      row.auditDate.toISOString().slice(0, 10),
      row.validationStatus,
      round(row.storedTotal),
      round(newTotal),
      round(row.storedGapPercent),
      round(newGapPercent),
      round(row.avgActual),
      statusLabel(row.isBoros),
      statusLabel(newIsBoros),
      statusChanged ? "ya" : "tidak",
      row.recommendationTypes,
      mode,
    ]
      .map(csvCell)
      .join(",")
  )
  return [header.join(","), ...lines].join("\n") + "\n"
}
