// PLN history rows store the month as "Januari 2026", the label the audit wizard writes.
export const BILLING_MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const

export function parseBillingMonth(label: string) {
  const [name = "", yearText = ""] = label.trim().split(/\s+/)
  const monthIndex = BILLING_MONTH_NAMES.indexOf(
    name as (typeof BILLING_MONTH_NAMES)[number]
  )
  const year = Number(yearText)
  if (monthIndex < 0 || !Number.isInteger(year) || year < 2000 || year > 2100) {
    return null
  }
  return { monthIndex, year }
}

export function formatBillingMonth(monthIndex: number, year: number) {
  return `${BILLING_MONTH_NAMES[monthIndex]} ${year}`
}
