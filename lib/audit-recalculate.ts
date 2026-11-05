import {
  FORMULA_VERSION,
  computeDailyKwh,
  isCalcMethod,
  resolveOperationType,
} from "@/lib/energy-formula"

export const DAYS_PER_MONTH = 30
// Boros when actual PLN exceeds the standard by more than 5%.
export const BOROS_TOLERANCE = 1.05
const DEFAULT_STANDBY_RATIO = 0.05

export type ItemKwhInput = {
  qty: number
  operationalHours: number
  baseKw: number
  calcMethod?: string | null
  calcDuration?: number | null
  usageCount?: number | null
  standbyKw?: number | null
  // Formula v2 snapshot (audit_items); absent on rows saved before v2.
  formulaVersion?: number | null
  operationType?: string | null
  runningKw?: number | null
  runningTimePct?: number | null
  standbyTimePct?: number | null
  storeHours?: number | null
}

// v2 rows go through lib/energy-formula.ts with their snapshot, the same call as
// submit; rows saved before v2 keep the formula they were stored with.
export function calculateItemDailyKwh(item: ItemKwhInput): number {
  if (item.formulaVersion === FORMULA_VERSION) {
    const calcMethod = isCalcMethod(item.calcMethod) ? item.calcMethod : "STANDARD"
    return computeDailyKwh(
      {
        operationType: resolveOperationType(item.operationType, calcMethod),
        calcMethod,
        baseKw: item.baseKw,
        runningKw: item.runningKw,
        standbyKw: item.standbyKw,
        runningTimePct: item.runningTimePct,
        standbyTimePct: item.standbyTimePct,
        cycleSeconds: item.calcDuration,
      },
      {
        qty: item.qty,
        hours: item.operationalHours,
        storeHours: item.storeHours,
        usageCount: item.usageCount,
      }
    ).dailyKwh
  }
  return calculateLegacyItemDailyKwh(item)
}

function calculateLegacyItemDailyKwh(item: ItemKwhInput): number {
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

// Months with 0 kWh are left out, same as calculateAudit().
export function averagePlnKwh(monthlyKwh: number[]) {
  const valid = monthlyKwh.filter((kwh) => kwh > 0)
  if (valid.length === 0) return 0
  return valid.reduce((sum, kwh) => sum + kwh, 0) / valid.length
}

export function isBorosFor(
  actualKwhPerMonth: number,
  estimatedKwhPerMonth: number
) {
  return actualKwhPerMonth > estimatedKwhPerMonth * BOROS_TOLERANCE
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
    isBoros: isBorosFor(avgActualPlnKwhPerMonth, totalEstimatedKwhPerMonth),
  }
}
