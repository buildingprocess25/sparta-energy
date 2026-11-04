import assert from "node:assert/strict"

import { buildAuditItemRows, calculateAudit } from "./audit-kalkulator"
import type { EquipmentState } from "@/store/use-audit-store"

// Rows from "Validasi Kalkulator Energy" (export of stored audit_items):
// [area, equipment, qty, hours, base kW, exported kWh/month]
type ExportRow = [string, string, number, number, number, number]

const AREA_NAMES: Record<string, string> = {
  PARKING: "Parkir",
  TERRACE: "Teras",
  SALES: "Sales Area",
  WAREHOUSE: "Gudang, Toilet & Selasar",
}

// W441 PAGAR MERBAU, 18 Sep 2026. Manual check (hours 23.98): 6562.0644 kWh.
const W441: ExportRow[] = [
  ["PARKING", "Lampu TL Waterproof", 2, 13, 0.0154, 12.01],
  ["PARKING", "Listplank TL LED", 8, 4, 0.0154, 14.78],
  ["PARKING", "Polesign", 16, 4, 0.35, 672.0],
  ["PARKING", "Shop Sign TL LED", 8, 4, 0.084, 80.64],
  ["TERRACE", "Lampu area Teras TL", 18, 4, 0.0154, 33.26],
  ["SALES", "Air Conditioner", 1, 16, 1.07125, 514.2],
  ["SALES", "Air Conditioner", 1, 10, 1.07125, 321.38],
  ["SALES", "Air Conditioner", 1, 16, 1.07125, 514.2],
  ["SALES", "Air Conditioner", 1, 16, 1.07125, 514.2],
  ["SALES", "Air Conditioner", 1, 16, 1.07125, 514.2],
  ["SALES", "Display Cooler (Chiller)", 5, 23.98, 0.494, 1777.16],
  ["SALES", "Exhaust Fan Ceiling 10 inch (Chiller)", 3, 23.98, 0.026, 56.12],
  ["SALES", "Freezer", 2, 23.98, 0.133, 191.39],
  ["SALES", "Freezer Chest Showcase", 1, 23.98, 0.309, 222.33],
  ["SALES", "Freezer Standing", 1, 23.98, 0.348, 250.39],
  ["SALES", "Lampu area sales TL", 56, 16, 0.0154, 413.95],
  ["SALES", "Mesin ATM", 1, 23.98, 0.347, 249.67],
  ["SALES", "Paket Kasir", 1, 16, 0.05, 24.0],
  ["WAREHOUSE", "Bell Toko", 1, 16, 0.0095, 4.56],
  ["WAREHOUSE", "Exhaust Fan Ceiling 10 inch", 1, 23.98, 0.026, 18.71],
  ["WAREHOUSE", "Lampu Bohlam 9 Watt (Sensor)", 5, 23.98, 0.009, 32.38],
  ["WAREHOUSE", "Paket CCTV", 1, 23.98, 0.182, 130.95],
]

// TF67 KYAI MAJA 2, 23 Oct 2026. Manual check (hours 23.98): 10682.1558 kWh.
const TF67: ExportRow[] = [
  ["PARKING", "Polesign", 1, 14, 0.35, 147.0],
  ["PARKING", "Shop Sign TL LED", 7, 12, 0.084, 211.68],
  ["PARKING", "Tenant", 2, 23.98, 0.2, 287.8],
  ["TERRACE", "Lampu area Teras TL", 6, 12, 0.0154, 33.26],
  ["TERRACE", "Pompa Air", 1, 1, 0.032, 0.96],
  ["SALES", "Air Conditioner", 1, 23.98, 1.55, 1115.23],
  ["SALES", "Air Conditioner", 1, 23.98, 1.55, 1115.23],
  ["SALES", "Air Conditioner", 1, 23.98, 1.55, 1115.23],
  ["SALES", "Air Conditioner", 1, 23.98, 1.55, 1115.23],
  ["SALES", "Chest Showcase", 1, 23.98, 0.246, 177.0],
  ["SALES", "Freezer Chest Showcase", 3, 23.98, 0.309, 666.98],
  ["SALES", "Lampu area sales TL", 65, 23.98, 0.0154, 720.22],
  ["SALES", "Mesin ATM", 1, 23.98, 0.347, 249.67],
  ["SALES", "Mesin ATM", 1, 23.98, 0.347, 249.67],
  ["SALES", "Paket Kasir", 1, 23.98, 0.05, 35.98],
  ["SALES", "Rack on freezer", 1, 23.98, 0.65, 467.68],
  ["SALES", "Upright Glass Door Cooler", 5, 23.98, 0.55, 1978.63],
  ["SALES", "Upright Glass Door Cooler", 1, 23.98, 0.71, 510.85],
  ["WAREHOUSE", "Bell Toko", 1, 14, 0.0095, 3.99],
  ["WAREHOUSE", "Exhaust Fan Ceiling 10 inch", 3, 23.98, 0.026, 56.12],
  ["WAREHOUSE", "Lampu Bohlam 9 Watt (Sensor)", 5, 23.98, 0.009, 32.38],
  ["WAREHOUSE", "Paket CCTV", 3, 23.98, 0.182, 392.85],
]

// The form stores 00:00-23:59 for "24 jam", which the export shows as 23.98 h.
function endTimeFor(hours: number) {
  if (hours === 23.98) return "23:59"
  const minutes = Math.round(hours * 60)
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
}

// Exports were stored with 00:00-23:59 as 23.983 h; the form now stores 24 h for those rows.
function expectedMonthly(row: ExportRow) {
  return row[3] === 23.98 ? (row[5] * 24) / (23 + 59 / 60) : row[5]
}

// Rebuilds the form state. Every item gets a brand running kW that differs from
// its base kW, which is what pushed the old submit total away from the items.
function toEquipments(rows: ExportRow[]): EquipmentState[] {
  const equipments: EquipmentState[] = []
  const acByArea = new Map<string, EquipmentState>()

  rows.forEach(([area, name, qty, hours, kw], index) => {
    const areaName = AREA_NAMES[area]
    if (name === "Air Conditioner") {
      const ac = acByArea.get(areaName)
      if (ac) {
        ac.quantity += 1
        ac.kws!.push(kw)
        ac.runningKws!.push(kw * 0.6)
        ac.startTimes.push("00:00")
        ac.endTimes.push(endTimeFor(hours))
        return
      }
    }

    const eq: EquipmentState = {
      id: `${index}`,
      areaName,
      name,
      kw,
      kws: [kw],
      runningKws: [kw * 0.6],
      standbyKws: [kw * 0.03],
      quantity: qty,
      startTimes: ["00:00"],
      endTimes: [endTimeFor(hours)],
      selected: true,
      isConfigured: true,
      calcMethod: "STANDARD",
    }
    if (name === "Air Conditioner") acByArea.set(areaName, eq)
    equipments.push(eq)
  })
  return equipments
}

const store = {
  is24Hours: false,
  openTime: "07:00",
  closeTime: "23:00",
  areas: { sales: 108.16 },
  plnPowerVa: 23000,
}

function replay(label: string, rows: ExportRow[], manualTotal: number, avgPln: number) {
  const equipments = toEquipments(rows)
  const calc = calculateAudit(equipments, [{ month: "Jan", kwh: avgPln, std: 0 }], store)
  const rowsMonthly = buildAuditItemRows(equipments).map((row) => row.estimatedDailyKwh * 30)
  const exported = rows.map(expectedMonthly)
  const exportedTotal = exported.reduce((sum, kwh) => sum + kwh, 0)
  const rowsTotal = rowsMonthly.reduce((sum, kwh) => sum + kwh, 0)

  // Submitted standard equals the stored rows exactly.
  assert.ok(Math.abs(calc.equipmentEstimateKwhPerMonth - rowsTotal) < 1e-9, label)

  // Stored rows match the export row by row (export rounds to 2 decimals).
  assert.equal(rowsMonthly.length, rows.length, label)
  rows.forEach((row, i) => {
    assert.ok(Math.abs(rowsMonthly[i] - exported[i]) <= 0.006, `${label} row ${i} ${row[1]}`)
  })
  assert.ok(Math.abs(calc.equipmentEstimateKwhPerMonth - exportedTotal) < 0.01 * rows.length, label)

  // Manual sheet uses 23.98 h where the form now counts 24 h, so it sits a little lower.
  const drift = (calc.equipmentEstimateKwhPerMonth - manualTotal) / manualTotal
  assert.ok(drift >= 0 && drift < 0.001, `${label} drift ${drift}`)

  console.log(
    `${label}: standar ${calc.equipmentEstimateKwhPerMonth.toFixed(2)} kWh, export ${exportedTotal.toFixed(2)}, manual ${manualTotal}, ${calc.isBoros ? "Boros" : "Hemat"}`
  )
  return calc
}

// W441 PLN average 5.956 kWh: Hemat against the corrected standard (screenshot left side).
const w441 = replay("W441", W441, 6562.0644, 5956)
assert.equal(w441.isBoros, false)
// 6562 when stored with 23.98 h; 24 h rows add about 2.4 kWh.
assert.equal(Math.round(w441.equipmentEstimateKwhPerMonth), 6565)

replay("TF67", TF67, 10682.1558, 10000)

console.log("audit-kalkulator replay tests passed")
