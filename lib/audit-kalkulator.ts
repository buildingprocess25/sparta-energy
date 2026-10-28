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

export function calculateAudit(
  equipments: EquipmentState[],
  plnHistories: PlnRowState[],
  storeIdentity: {
    is24Hours: boolean
    openTime: string
    closeTime: string
    areas: Record<string, number>
    plnPowerVa: number
  }
) {
  const { is24Hours, openTime, closeTime, areas } = storeIdentity
  const storeOpenHours = is24Hours ? 24 : getHoursBetween(openTime, closeTime)

  let equipmentEstimateKwhPerDay = 0

  const areaBreakdowns: Record<string, number> = {
    "Sales Area": 0,
    Teras: 0,
    "Parkir": 0,
    "Gudang": 0,
  }

  let trainingNeededCount = 0

  equipments.forEach((eq) => {
    if (!eq.selected) return
    let eqKwhPerDay = 0
    const isAC = eq.name.toLowerCase().includes("ac") || eq.name.toLowerCase().includes("air conditioner")
    
    const method = eq.calcMethod || "STANDARD"
    const duration = eq.calcDuration || 0

    for (let i = 0; i < eq.quantity; i++) {
      const start = isAC ? (eq.startTimes[i] || "08:00") : (eq.startTimes[0] || "08:00")
      const end = isAC ? (eq.endTimes[i] || "22:00") : (eq.endTimes[0] || "22:00")
      const hrs = getHoursBetween(start, end)

      const kwRunning = eq.runningKws?.[i] ?? eq.kws?.[i] ?? eq.kw ?? 0
      const kwStandby = eq.standbyKws?.[i] ?? (kwRunning * 0.05)
      const usageVal = eq.usages?.[i] ?? 0

      if (method === "TRANSACTION" || method === "BATCH") {
        const hrsRunning = Math.min((usageVal * duration) / 3600, hrs)
        const hrsStandby = Math.max(0, hrs - hrsRunning)
        eqKwhPerDay += (kwRunning * hrsRunning) + (kwStandby * hrsStandby)
      } else {
        eqKwhPerDay += kwRunning * hrs
      }

      // Check training logic: e.g. AC nyala >> store open hours
      if (isAC && hrs >= storeOpenHours + 2 && storeOpenHours < 24) {
        trainingNeededCount++
      }
    }

    equipmentEstimateKwhPerDay += eqKwhPerDay

    // Map to specific categories for the charts
    if (eq.areaName?.toLowerCase().includes("sales")) {
      areaBreakdowns["Sales Area"] += eqKwhPerDay
    } else if (eq.areaName?.toLowerCase().includes("teras")) {
      areaBreakdowns["Teras"] += eqKwhPerDay
    } else if (eq.areaName?.toLowerCase().includes("parkir")) {
      areaBreakdowns["Parkir"] += eqKwhPerDay
    } else {
      areaBreakdowns["Gudang"] += eqKwhPerDay
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
  }
}
