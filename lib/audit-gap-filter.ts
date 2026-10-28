/**
 * Filter Ambang Batas Deviasi Gap Audit Energi
 *
 * Penjelasan:
 * - Mengatur batas toleransi selisih (gap persentase) antara pemakaian aktual PLN
 *   dengan estimasi baseline peralatan toko: (aktual - baseline) / baseline.
 * - Berfungsi menyaring data audit yang berada di luar rentang wajar (outlier ekstrem).
 *
 * Pengaturan:
 * - `enabled`: `true` untuk mengaktifkan batas toleransi gap, `false` untuk menampilkan semua data tanpa batasan.
 * - `maxGapThreshold`: batas deviasi maksimum, contoh `0.20` artinya gap dibatasi di rentang +- 20% (-0.20 s/d +0.20).
 */
export const AUDIT_GAP_FILTER = {
  enabled: true,
  maxGapThreshold: 0.20, // +- 20% (-20% s/d +20%)
}

// Admins switch the filter per browser; a missing cookie keeps the default above.
export const ADMIN_GAP_FILTER_COOKIE = "admin-gap-filter"

/**
 * Menghasilkan klausa SQL WHERE untuk memfilter audit berdasarkan ambang batas gap deviasi.
 * @param auditAlias Alias tabel audit dalam query SQL (default: "a")
 */
export function getAuditGapFilterWhereSql(
  auditAlias = "a",
  enabled = AUDIT_GAP_FILTER.enabled
): string | null {
  if (!enabled) return null
  const th = AUDIT_GAP_FILTER.maxGapThreshold

  return `(
    ${auditAlias}.total_estimated_kwh_per_month IS NOT NULL 
    AND ${auditAlias}.total_estimated_kwh_per_month > 0 
    AND (${auditAlias}.avg_actual_pln_kwh_per_month - ${auditAlias}.total_estimated_kwh_per_month) / ${auditAlias}.total_estimated_kwh_per_month >= -${th}
    AND (${auditAlias}.avg_actual_pln_kwh_per_month - ${auditAlias}.total_estimated_kwh_per_month) / ${auditAlias}.total_estimated_kwh_per_month <= ${th}
  )`
}

/**
 * Helper untuk memeriksa apakah nilai audit memenuhi ambang batas gap deviasi di level JavaScript.
 */
export function isAuditGapAllowed(
  actual: number | null,
  baseline: number | null,
  enabled = AUDIT_GAP_FILTER.enabled
): boolean {
  if (!enabled) return true

  const base = Number(baseline ?? 0)
  const act = Number(actual ?? 0)

  if (base <= 0) return false

  const gap = (act - base) / base
  return gap >= -AUDIT_GAP_FILTER.maxGapThreshold && gap <= AUDIT_GAP_FILTER.maxGapThreshold
}
