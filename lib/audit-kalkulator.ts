import { BOROS_TOLERANCE } from "@/lib/audit-recalculate"
import { type EquipmentState, type PlnRowState } from "@/store/use-audit-store"

export function getHoursBetween(start: string, end: string): number {
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
  usageCount: number | null
  estimatedDailyKwh: number
}

function isUsageBased(method: string) {
  return method === "TRANSACTION" || method === "BATCH"
}

// The rows stored as audit_items. Totals are summed from these rows so the
// submitted standard always equals what validation recalculates from the items.
export function buildAuditItemRows(
  equipments: EquipmentState[],
  resolveMethod?: (eq: EquipmentState) => CalcMethodInfo | undefined
): AuditItemRow[] {
  return equipments
    .filter((eq) => eq.selected)
    .flatMap((eq) => {
      const isAC = isAirConditioner(eq.name)
      const resolved = resolveMethod?.(eq)
      const method = resolved?.calcMethod ?? eq.calcMethod ?? "STANDARD"
      const duration = resolved?.calcDuration ?? eq.calcDuration ?? 0

      // AC units each have their own hours and brand, so they get one row per unit.
      if (isAC && eq.quantity > 1) {
        return Array.from({ length: eq.quantity }, (_, i) => {
          const hours = getHoursBetween(
            eq.startTimes[i] || "08:00",
            eq.endTimes[i] || "22:00"
          )
          const baseKw = eq.kws?.[i] ?? eq.kw ?? 0
          return {
            equipment: eq,
            unitIndex: i,
            isAC,
            qty: 1,
            operationalHours: hours,
            baseKw,
            calcMethod: "STANDARD",
            usageCount: null,
            estimatedDailyKwh: baseKw * hours,
          }
        })
      }

      const hours = getHoursBetween(
        eq.startTimes[0] || "08:00",
        eq.endTimes[0] || "22:00"
      )
      const baseKw = eq.kws?.[0] ?? eq.kw ?? 0
      const usageVal = eq.usages?.[0] ?? 0

      // Running/standby kW only apply to usage-based items; STANDARD uses base kW.
      let estimatedDailyKwh = baseKw * eq.quantity * hours
      if (isUsageBased(method)) {
        const hrsRunning = Math.min((usageVal * duration) / 3600, hours)
        const hrsStandby = Math.max(0, hours - hrsRunning)
        const runningKw = eq.runningKws?.[0] ?? baseKw
        const standbyKw = eq.standbyKws?.[0] ?? runningKw * 0.05
        estimatedDailyKwh =
          (runningKw * hrsRunning + standbyKw * hrsStandby) * eq.quantity
      }

      return [
        {
          equipment: eq,
          unitIndex: 0,
          isAC,
          qty: eq.quantity,
          operationalHours: hours,
          baseKw,
          calcMethod: method,
          usageCount: isUsageBased(method) ? usageVal : null,
          estimatedDailyKwh,
        },
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

  const itemRows = buildAuditItemRows(equipments, resolveMethod)
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
