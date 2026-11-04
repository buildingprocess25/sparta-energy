import assert from "node:assert/strict"

import {
  buildAuditItemRows,
  calculateAudit,
  getHoursBetween,
  isAirConditioner,
} from "./audit-kalkulator"
import { summarizeAuditItems } from "./audit-recalculate"
import type { EquipmentState } from "@/store/use-audit-store"

const store = {
  is24Hours: false,
  openTime: "07:00",
  closeTime: "23:00",
  areas: { sales: 100 },
  plnPowerVa: 23000,
}

function equipment(overrides: Partial<EquipmentState>): EquipmentState {
  return {
    id: overrides.name ?? "eq",
    areaName: "Sales Area",
    name: "Lampu",
    kw: 0,
    quantity: 1,
    startTimes: ["07:00"],
    endTimes: ["23:00"],
    selected: true,
    isConfigured: true,
    ...overrides,
  }
}

function monthlyFromRows(equipments: EquipmentState[]) {
  return summarizeAuditItems(
    buildAuditItemRows(equipments).map((row) => row.estimatedDailyKwh),
    0
  ).totalEstimatedKwhPerMonth
}

// A brand running kW must not leak into a STANDARD item (the W441 bug).
const chiller = equipment({
  name: "Display Cooler (Chiller)",
  quantity: 5,
  kw: 0.494,
  kws: [0.494],
  runningKws: [0.3],
  standbyKws: [0.015],
  startTimes: ["00:00"],
  endTimes: ["23:59"],
})
const chillerCalc = calculateAudit([chiller], [], store)
assert.ok(
  Math.abs(chillerCalc.equipmentEstimateKwhPerMonth - 0.494 * 5 * 24 * 30) < 1e-9
)

// 00:00-23:59 is "24 jam"; every other range keeps its exact length.
assert.equal(getHoursBetween("00:00", "23:59"), 24)
assert.equal(getHoursBetween("00:00", "00:00"), 24)
assert.equal(getHoursBetween("00:00", "24:00"), 24)
assert.equal(getHoursBetween("08:00", "08:00"), 24)
assert.equal(getHoursBetween("08:00", "22:00"), 14)
assert.equal(getHoursBetween("22:00", "06:00"), 8)
assert.equal(getHoursBetween("17:30", "07:00"), 13.5)
assert.ok(Math.abs(getHoursBetween("10:00", "09:59") - (23 + 59 / 60)) < 1e-9)

// Non-AC with qty > 1 and a single brand kW: every unit uses that kW, not the type default.
const freezer = equipment({
  name: "Freezer",
  quantity: 3,
  kw: 0.133,
  kws: [0.207],
  runningKws: [0.207, 0.1],
})
assert.equal(
  calculateAudit([freezer], [], store).equipmentEstimateKwhPerMonth,
  0.207 * 3 * 16 * 30
)

// Usage-based items keep running/standby kW.
const coffee = equipment({
  name: "Coffee Maker",
  quantity: 1,
  kw: 1,
  kws: [1],
  runningKws: [2],
  standbyKws: [0.1],
  usages: [60],
  calcMethod: "TRANSACTION",
  calcDuration: 60,
})
assert.equal(
  calculateAudit([coffee], [], store).equipmentEstimateKwhPerMonth,
  (2 * 1 + 0.1 * 15) * 30
)

// The master calcMethod wins over the one held in the form.
const masterStandard = calculateAudit([coffee], [], store, () => ({
  calcMethod: "STANDARD",
}))
assert.equal(masterStandard.equipmentEstimateKwhPerMonth, 1 * 16 * 30)
assert.equal(masterStandard.itemRows[0].usageCount, null)

// AC units become one row each, with their own hours and kW.
const ac = equipment({
  name: "Air Conditioner",
  quantity: 2,
  kw: 1.07125,
  kws: [1.07125, 1.55],
  runningKws: [9, 9],
  startTimes: ["07:00", "07:00"],
  endTimes: ["23:00", "17:00"],
})
const acRows = buildAuditItemRows([ac])
assert.equal(acRows.length, 2)
assert.deepEqual(
  acRows.map((row) => [row.qty, row.unitIndex, row.baseKw, row.operationalHours]),
  [
    [1, 0, 1.07125, 16],
    [1, 1, 1.55, 10],
  ]
)

// The submitted total always equals the sum of the stored rows.
const mixed = [chiller, freezer, coffee, ac, equipment({ selected: false, kw: 5 })]
assert.ok(
  Math.abs(
    calculateAudit(mixed, [], store).equipmentEstimateKwhPerMonth -
      monthlyFromRows(mixed)
  ) < 1e-9
)

// AC on 2+ hours past store hours still flags TRAINING.
const lateAc = equipment({
  name: "Air Conditioner",
  kw: 1,
  kws: [1],
  startTimes: ["05:00"],
  endTimes: ["23:59"],
})
assert.equal(
  calculateAudit([lateAc], [{ month: "Jan", kwh: 99999, std: 0 }], store)
    .recommendationType,
  "TRAINING"
)

// AC is matched as a whole word, so names that merely contain "ac" stay regular equipment.
for (const name of ["Air Conditioner", "AC", "AC Split 2 PK", "Unit AC", "AC-Standing", "air  conditioner"]) {
  assert.equal(isAirConditioner(name), true, name)
}
for (const name of [
  "Rack on freezer",
  "Lampu Sorot (Track Light)",
  "Vacuum Cleaner",
  "Ice Pack",
  "Mesin Packaging",
  "Snack Display",
  "",
  null,
  undefined,
]) {
  assert.equal(isAirConditioner(name), false, String(name))
}

// A non-AC "rack" with qty 3 stays one row and keeps its master calcMethod.
const rack = equipment({
  name: "Rack on freezer",
  quantity: 3,
  kw: 0.65,
  kws: [0.65],
  startTimes: ["05:00"],
  endTimes: ["23:59"],
})
const rackRows = buildAuditItemRows([rack])
assert.equal(rackRows.length, 1)
assert.equal(rackRows[0].qty, 3)
assert.equal(rackRows[0].isAC, false)

const packer = equipment({
  name: "Mesin Packaging",
  quantity: 2,
  kw: 1,
  kws: [1],
  runningKws: [2],
  standbyKws: [0.1],
  usages: [60],
  calcMethod: "TRANSACTION",
  calcDuration: 60,
})
const packerRows = buildAuditItemRows([packer])
assert.equal(packerRows.length, 1)
assert.equal(packerRows[0].calcMethod, "TRANSACTION")
assert.equal(packerRows[0].estimatedDailyKwh, (2 * 1 + 0.1 * 15) * 2)

// Running past store hours only flags TRAINING for a real AC.
assert.equal(
  calculateAudit([rack], [{ month: "Jan", kwh: 99999, std: 0 }], store)
    .recommendationType,
  "REPAIR"
)

console.log("audit-kalkulator tests passed")
