import type { MasterStoreRow } from "@/lib/admin-master-data-queries"

// Percentage of master store fields filled in, shown in Master Toko and its export.
export function getMasterStoreCompleteness(row: MasterStoreRow) {
  const checks = [
    Boolean(row.code),
    Boolean(row.name),
    Boolean(row.branch),
    Boolean(row.type),
    Boolean(row.plnCustomerId),
    row.plnPowerVa > 0,
    row.salesAreaM2 > 0,
    row.parkingAreaM2 >= 0,
    row.terraceAreaM2 >= 0,
    row.warehouseAreaM2 > 0,
    row.is24Hours || Boolean(row.openTime && row.closeTime),
  ]

  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

// The same checks as SQL (stores alias s), for filtering complete or incomplete stores.
// Keep both in step when a check changes.
export const masterStoreCompleteSql = `(
  coalesce(s.code, '') <> ''
  AND coalesce(s.name, '') <> ''
  AND coalesce(s.branch, '') <> ''
  AND coalesce(s.type, '') <> ''
  AND coalesce(s.pln_customer_id, '') <> ''
  AND s.pln_power_va > 0
  AND s.sales_area_m2 > 0
  AND s.parking_area_m2 >= 0
  AND s.terrace_area_m2 >= 0
  AND s.warehouse_area_m2 > 0
  AND (
    s.is_24_hours IS TRUE
    OR (coalesce(s.open_time, '') <> '' AND coalesce(s.close_time, '') <> '')
  )
)`
