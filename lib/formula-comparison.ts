import {
  DAYS_PER_MONTH,
  calculateGapPercent,
  isBorosFor,
} from "@/lib/audit-recalculate"
import {
  computeDailyKwh,
  isCalcMethod,
  resolveOperationType,
  type CalcMethod,
} from "@/lib/energy-formula"

// Comparison report (option B): what each store's standard would be under
// energy formula v2, read-only. Nothing here writes to an audit.

export type ComparisonItem = {
  id: string
  name: string
  qty: number
  operationalHours: number
  baseKw: number
  estimatedDailyKwh: number
  usageCount: number | null
  // Null on rows saved before v2, when usageCount was per unit.
  formulaVersion: number | null
  storeHours: number | null
  type: { operationType: string; calcMethod: string; calcDuration: number | null } | null
  brand: {
    runningKw: number
    standbyKw: number
    runningTimePct: number | null
    standbyTimePct: number | null
  } | null
}

export type ComparisonAudit = {
  id: string
  storeCode: string
  storeName: string
  branch: string | null
  auditDate: Date
  validationStatus: string
  actualPlnKwhPerMonth: number
  items: ComparisonItem[]
}

export type ItemComparison = {
  id: string
  name: string
  operationType: string
  calcMethod: string
  oldDailyKwh: number
  newDailyKwh: number
  recalculated: boolean
  note: string | null
}

export type AuditComparison = {
  auditId: string
  storeCode: string
  storeName: string
  branch: string | null
  auditDate: Date
  validationStatus: string
  actualPlnKwhPerMonth: number
  oldStandard: number
  newStandard: number
  diffKwh: number
  diffPercent: number | null
  oldGapPercent: number | null
  newGapPercent: number | null
  oldIsBoros: boolean
  newIsBoros: boolean
  statusChanged: boolean
  recalculatedItems: number
  keptItems: number
  items: ItemComparison[]
}

export function compareItem(item: ComparisonItem): ItemComparison {
  const kept = (note: string, operationType = "-", calcMethod = "-"): ItemComparison => ({
    id: item.id,
    name: item.name,
    operationType,
    calcMethod,
    oldDailyKwh: item.estimatedDailyKwh,
    newDailyKwh: item.estimatedDailyKwh,
    recalculated: false,
    note,
  })

  if (!item.type) return kept("Alat kustom atau tanpa tipe master, kWh lama dipakai")

  const operationType = resolveOperationType(item.type.operationType, item.type.calcMethod)
  const calcMethod: CalcMethod = isCalcMethod(item.type.calcMethod) ? item.type.calcMethod : "STANDARD"

  // STATIS keeps the same formula; the stored kW is the one the store used.
  if (operationType === "STATIS") {
    const result = computeDailyKwh(
      { operationType, calcMethod: "STANDARD", baseKw: item.baseKw },
      { qty: item.qty, hours: item.operationalHours }
    )
    return {
      id: item.id,
      name: item.name,
      operationType,
      calcMethod,
      oldDailyKwh: item.estimatedDailyKwh,
      newDailyKwh: result.dailyKwh,
      recalculated: true,
      note: null,
    }
  }

  if (!item.brand) return kept("Merek tidak terdaftar di master, profil dinamis tidak tersedia", operationType, calcMethod)

  // Rows before v2 stored Q per unit; v2 counts the store total.
  const usageCount =
    item.usageCount === null
      ? null
      : item.formulaVersion === null
        ? item.usageCount * Math.max(1, item.qty)
        : item.usageCount

  const result = computeDailyKwh(
    {
      operationType,
      calcMethod,
      baseKw: item.baseKw,
      runningKw: item.brand.runningKw,
      standbyKw: item.brand.standbyKw,
      runningTimePct: item.brand.runningTimePct,
      standbyTimePct: item.brand.standbyTimePct,
      cycleSeconds: item.type.calcDuration,
    },
    {
      qty: item.qty,
      hours: item.operationalHours,
      storeHours: item.formulaVersion === null ? null : item.storeHours,
      usageCount,
    }
  )

  return {
    id: item.id,
    name: item.name,
    operationType,
    calcMethod,
    oldDailyKwh: item.estimatedDailyKwh,
    newDailyKwh: result.dailyKwh,
    recalculated: !result.usedFallback,
    note: result.usedFallback
      ? "Profil dinamis di master belum lengkap, daya base dipakai"
      : result.overloaded
        ? "Waktu kerja melebihi jam nyala, standby dihitung 0"
        : null,
  }
}

// Standards are summed from the stored rows, so the old figure is what the
// validation page shows; audits before 30 Oct 2026 can differ a few kWh from
// the total stored back then.
export function compareAudit(audit: ComparisonAudit): AuditComparison {
  const items = audit.items.map(compareItem)
  const oldStandard = items.reduce((sum, item) => sum + item.oldDailyKwh, 0) * DAYS_PER_MONTH
  const newStandard = items.reduce((sum, item) => sum + item.newDailyKwh, 0) * DAYS_PER_MONTH
  const oldIsBoros = isBorosFor(audit.actualPlnKwhPerMonth, oldStandard)
  const newIsBoros = isBorosFor(audit.actualPlnKwhPerMonth, newStandard)

  return {
    auditId: audit.id,
    storeCode: audit.storeCode,
    storeName: audit.storeName,
    branch: audit.branch,
    auditDate: audit.auditDate,
    validationStatus: audit.validationStatus,
    actualPlnKwhPerMonth: audit.actualPlnKwhPerMonth,
    oldStandard,
    newStandard,
    diffKwh: newStandard - oldStandard,
    diffPercent: oldStandard > 0 ? ((newStandard - oldStandard) / oldStandard) * 100 : null,
    oldGapPercent: calculateGapPercent(audit.actualPlnKwhPerMonth, oldStandard),
    newGapPercent: calculateGapPercent(audit.actualPlnKwhPerMonth, newStandard),
    oldIsBoros,
    newIsBoros,
    statusChanged: oldIsBoros !== newIsBoros,
    recalculatedItems: items.filter((item) => item.recalculated).length,
    keptItems: items.filter((item) => !item.recalculated).length,
    items,
  }
}

export function summarizeComparisons(rows: AuditComparison[]) {
  return {
    stores: rows.length,
    changedStatus: rows.filter((row) => row.statusChanged).length,
    hematToBoros: rows.filter((row) => !row.oldIsBoros && row.newIsBoros).length,
    borosToHemat: rows.filter((row) => row.oldIsBoros && !row.newIsBoros).length,
    averageDiffPercent:
      rows.length === 0
        ? null
        : rows.reduce((sum, row) => sum + (row.diffPercent ?? 0), 0) / rows.length,
  }
}
