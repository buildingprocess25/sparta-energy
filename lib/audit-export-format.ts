// Excel number formats for the single-audit export (app/admin/audits/[id]/export).

export const GAP_ROW_LABEL = "Selisih Beban Listrik / Gap (kWh)"

// Lamp power is 0.0154 kW, which three decimals would show as 0.015.
export const KW_FORMAT = "#,##0.0000"

const PERCENT_FORMAT = "+0.0%;-0.0%;0.0%"

// The gap row is found by its label, so adding or removing rows above it cannot
// move the percent format onto another value.
export function summaryValueFormat(rowLabel: unknown) {
  return rowLabel === GAP_ROW_LABEL ? PERCENT_FORMAT : "#,##0"
}

// A missing gap (no baseline) is shown as "-", not as a 0% gap.
export function gapPercentCell(gapPercent: number | null) {
  return gapPercent === null ? "-" : gapPercent / 100
}
