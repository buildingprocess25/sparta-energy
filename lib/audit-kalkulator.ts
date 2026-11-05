import { BOROS_TOLERANCE } from "@/lib/audit-recalculate"
import {
  FORMULA_VERSION,
  computeDailyKwh,
  isCalcMethod,
  isUsageMethod,
  resolveOperationType,
  type CalcMethod,
  type OperationType,
} from "@/lib/energy-formula"
import { type EquipmentState, type PlnRowState } from "@/store/use-audit-store"

export function getHoursBetween(start: string, end: string): number {
  // The time picker stops at 23:59, so 00:00-23:59 is the form's "24 jam".
  if (start === "00:00" && end === "23:59") return 24
  const [h1, m1] = start.split(":").map(Number)
  const [h2, m2] = end.split(":").map(Number)
  let totalH = h2 - h1
  let totalM = m2 - m1
  if (totalM < 0) {
    totalH -= 1
    totalM += 60
  }
  let diff = totalH + totalM / 60
  // Handle cross-day shifts
  if (diff < 0) diff += 24
  if (diff === 0 && start === end) diff = 24 // 24 hours assumed
  return diff
}

// Whole word only: a bare "ac" substring also matched "Rack on freezer" and "Track Light".
export function isAirConditioner(name: string | null | undefined) {
  if (!name) return false
  return /\bac\b/i.test(name) || /\bair\s*conditioner/i.test(name)
}

export type CalcMethodInfo = {
  calcMethod?: string | null
  calcDuration?: number | null
  operationType?: string | null
}

export type AuditItemRow = {
  equipment: EquipmentState
  // Index into the per-unit arrays (brand, kW, times) this row was built from.
  unitIndex: number
  isAC: boolean
  qty: number
  operationalHours: number
  baseKw: number
  calcMethod: string
  // Q or R as a store total (formula v2).
  usageCount: number | null
  estimatedDailyKwh: number
  // Profile snapshot stored with the row, so validation recomputes the same number.
  operationType: OperationType
  runningKw: number
  standbyKw: number
  runningTimePct: number | null
  standbyTimePct: number | null
  cycleSeconds: number | null
  storeHours: number | null
  formulaVersion: number
  overloaded: boolean
}

function unitRow(
  eq: EquipmentState,
  unitIndex: number,
  qty: number,
  hours: number,
  calcMethod: CalcMethod,
  operationType: OperationType,
  cycleSeconds: number | null,
  usageCount: number | null,
  storeHours: number | null
): AuditItemRow {
  const baseKw = eq.kws?.[unitIndex] ?? eq.kws?.[0] ?? eq.kw ?? 0
  const profile = {
    operationType,
    calcMethod,
    baseKw,
    runningKw: eq.runningKws?.[unitIndex] ?? eq.runningKws?.[0] ?? null,
    standbyKw: eq.standbyKws?.[unitIndex] ?? eq.standbyKws?.[0] ?? null,
    runningTimePct: eq.runningTimePcts?.[unitIndex] ?? eq.runningTimePcts?.[0] ?? null,
    standbyTimePct: eq.standbyTimePcts?.[unitIndex] ?? eq.standbyTimePcts?.[0] ?? null,
    cycleSeconds,
  }
  const result = computeDailyKwh(profile, { qty, hours, storeHours, usageCount })
  return {
    equipment: eq,
    unitIndex,
    isAC: isAirConditioner(eq.name),
    qty,
    operationalHours: hours,
    baseKw,
    calcMethod,
    usageCount,
    estimatedDailyKwh: result.dailyKwh,
    operationType,
    runningKw: result.runningKw,
    standbyKw: result.standbyKw,
    runningTimePct: result.runningPct ?? profile.runningTimePct,
    standbyTimePct: result.standbyPct ?? profile.standbyTimePct,
    cycleSeconds,
    storeHours,
    formulaVersion: FORMULA_VERSION,
    overloaded: result.overloaded,
  }
}

// The rows stored as audit_items, all through lib/energy-formula.ts. Totals are
// summed from these rows so the submitted standard always equals what
// validation recalculates from the items.
export function buildAuditItemRows(
  equipments: EquipmentState[],
  resolveMethod?: (eq: EquipmentState) => CalcMethodInfo | undefined,
  options: { storeHours?: number | null } = {}
): AuditItemRow[] {
  const storeHours = options.storeHours ?? null
  return equipments
    .filter((eq) => eq.selected)
    .flatMap((eq) => {
      const isAC = isAirConditioner(eq.name)
      const resolved = resolveMethod?.(eq)
      const rawMethod = resolved?.calcMethod ?? eq.calcMethod ?? "STANDARD"
      const calcMethod: CalcMethod = isCalcMethod(rawMethod) ? rawMethod : "STANDARD"
      const operationType = resolveOperationType(
        resolved?.operationType ?? eq.operationType,
        calcMethod
      )
      const duration = resolved?.calcDuration ?? eq.calcDuration ?? null

      // AC units each have their own hours and brand, so they get one row per unit.
      if (isAC && eq.quantity > 1) {
        return Array.from({ length: eq.quantity }, (_, i) =>
          unitRow(
            eq,
            i,
            1,
            getHoursBetween(eq.startTimes[i] || "08:00", eq.endTimes[i] || "22:00"),
            "STANDARD",
            operationType,
            null,
            null,
            storeHours
          )
        )
      }

      const usageBased = isUsageMethod(calcMethod)
      return [
        unitRow(
          eq,
          0,
          eq.quantity,
          getHoursBetween(eq.startTimes[0] || "08:00", eq.endTimes[0] || "22:00"),
          calcMethod,
          operationType,
          usageBased ? duration : null,
          usageBased ? (eq.usages?.[0] ?? 0) : null,
          storeHours
        ),
      ]
    })
}

export function calculateAudit(
  equipments: EquipmentState[],
  plnHistories: PlnRowState[],
  storeIdentity: {
    is24Hours: boolean
    openTime: string
    closeTime: string
    areas: Record<string, number>
    plnPowerVa: number
  },
  resolveMethod?: (eq: EquipmentState) => CalcMethodInfo | undefined
) {
  const { is24Hours, openTime, closeTime, areas } = storeIdentity
  const storeOpenHours = is24Hours ? 24 : getHoursBetween(openTime, closeTime)

  const itemRows = buildAuditItemRows(equipments, resolveMethod, {
    storeHours: storeOpenHours,
  })
  let equipmentEstimateKwhPerDay = 0

  const areaBreakdowns: Record<string, number> = {
    "Sales Area": 0,
    Teras: 0,
    "Parkir": 0,
    "Gudang": 0,
  }

  let trainingNeededCount = 0

  itemRows.forEach((row) => {
    equipmentEstimateKwhPerDay += row.estimatedDailyKwh

    // Check training logic: e.g. AC nyala >> store open hours
    if (
      row.isAC &&
      row.operationalHours >= storeOpenHours + 2 &&
      storeOpenHours < 24
    ) {
      trainingNeededCount += row.qty
    }

    const areaName = row.equipment.areaName?.toLowerCase() ?? ""
    if (areaName.includes("sales")) {
      areaBreakdowns["Sales Area"] += row.estimatedDailyKwh
    } else if (areaName.includes("teras")) {
      areaBreakdowns["Teras"] += row.estimatedDailyKwh
    } else if (areaName.includes("parkir")) {
      areaBreakdowns["Parkir"] += row.estimatedDailyKwh
    } else {
      areaBreakdowns["Gudang"] += row.estimatedDailyKwh
    }
  })

  const equipmentEstimateKwhPerMonth = equipmentEstimateKwhPerDay * 30

  // PLN Averages
  const validPlns = plnHistories.filter((p) => p.kwh > 0)
  const totalPlnKwhMonth = validPlns.reduce((acc, row) => acc + row.kwh, 0)
  const avgActualPlnKwhPerMonth = validPlns.length > 0 ? totalPlnKwhMonth / validPlns.length : 0

  const avgActualPlnKwhPerDay = avgActualPlnKwhPerMonth / 30

  // Determine Efficiency (Boros vs Hemat)
  const isBoros = avgActualPlnKwhPerMonth > equipmentEstimateKwhPerMonth * BOROS_TOLERANCE
  
  // Decide Action
  let recommendationType = "MAINTENANCE"
  if (isBoros) {
    if (trainingNeededCount > 0) {
      recommendationType = "TRAINING" // Ada potensi human error dari lupa mematikan AC!
    } else {
      recommendationType = "REPAIR" // Alat jalan sesuai jadwal, tapi listrik jebol = mesin usang / bocor arus.
    }
  }

  const totalAreaM2 = Object.values(areas).reduce((a, b) => a + b, 0) || 1
  const actualKwhPerM2 = avgActualPlnKwhPerMonth / totalAreaM2
  const estKwhPerM2 = equipmentEstimateKwhPerMonth / totalAreaM2

  return {
    equipmentEstimateKwhPerDay,
    equipmentEstimateKwhPerMonth,
    avgActualPlnKwhPerDay,
    avgActualPlnKwhPerMonth,
    isBoros,
    recommendationType,
    areaBreakdowns,
    actualKwhPerM2,
    estKwhPerM2,
    totalAreaM2,
    itemRows,
  }
}
