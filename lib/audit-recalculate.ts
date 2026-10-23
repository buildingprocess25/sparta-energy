export const DAYS_PER_MONTH = 30
const DEFAULT_STANDBY_RATIO = 0.05

export type ItemKwhInput = {
  qty: number
  operationalHours: number
  baseKw: number
  calcMethod?: string | null
  calcDuration?: number | null
  usageCount?: number | null
  standbyKw?: number | null
}

// Mirrors the per-unit formula in calculateAudit() so edited items match submitted ones.
export function calculateItemDailyKwh(item: ItemKwhInput): number {
  const qty = Math.max(0, item.qty)
  const hours = Math.max(0, item.operationalHours)
  const kw = Math.max(0, item.baseKw)
  const method = item.calcMethod ?? "STANDARD"

  if (method === "TRANSACTION" || method === "BATCH") {
    const usage = Math.max(0, item.usageCount ?? 0)
    const duration = Math.max(0, item.calcDuration ?? 0)
    const hrsRunning = Math.min((usage * duration) / 3600, hours)
    const hrsStandby = Math.max(0, hours - hrsRunning)
    const standbyKw =
      item.standbyKw && item.standbyKw > 0
        ? item.standbyKw
        : kw * DEFAULT_STANDBY_RATIO
    return (kw * hrsRunning + standbyKw * hrsStandby) * qty
  }

  return kw * qty * hours
}

export function calculateGapPercent(
  actualKwhPerMonth: number,
  estimatedKwhPerMonth: number
): number | null {
  if (!(estimatedKwhPerMonth > 0)) return null
  return ((actualKwhPerMonth - estimatedKwhPerMonth) / estimatedKwhPerMonth) * 100
}

export function summarizeAuditItems(
  itemDailyKwh: number[],
  avgActualPlnKwhPerMonth: number
) {
  const totalDailyKwh = itemDailyKwh.reduce((sum, kwh) => sum + kwh, 0)
  const totalEstimatedKwhPerMonth = totalDailyKwh * DAYS_PER_MONTH

  return {
    totalEstimatedKwhPerMonth,
    gapPercent: calculateGapPercent(
      avgActualPlnKwhPerMonth,
      totalEstimatedKwhPerMonth
    ),
  }
}
