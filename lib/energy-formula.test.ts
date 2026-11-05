import assert from "node:assert/strict"

import {
  computeBaseKw,
  computeDailyKwh,
  computeTimeShare,
  kwFromNameplatePct,
  resolveOperationType,
  toKw,
  usageOverloadMessage,
  validateProfile,
  type EnergyProfile,
} from "./energy-formula"

const close = (actual: number, expected: number, label?: string) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${label ?? ""} ${actual} != ${expected}`)

// Revision sheet, row 1: I = 8, J = 1, K = 20%, L = 80% gives H = 2.4.
close(computeBaseKw(8, 1, 20, 80), 2.4)

// Revision sheet, rows 2 and 3: a 900 W nameplate at 95% / 10% / 20% / 80%.
const nameplateKw = toKw(900, "W")
close(nameplateKw, 0.9)
const runningKw = kwFromNameplatePct(nameplateKw, 95)
const standbyKw = kwFromNameplatePct(nameplateKw, 10)
close(runningKw, 0.855)
close(standbyKw, 0.09)
close(computeBaseKw(runningKw, standbyKw, 20, 80), 0.243)

// With the master K/L and 10 hours on: 2,430 Wh, against 9,000 Wh for nameplate × hours.
const fridge: EnergyProfile = {
  operationType: "DINAMIS",
  calcMethod: "STANDARD",
  baseKw: nameplateKw,
  runningKw,
  standbyKw,
  runningTimePct: 20,
  standbyTimePct: 80,
}
close(computeDailyKwh(fridge, { qty: 1, hours: 10 }).dailyKwh, 2.43)
close(computeDailyKwh({ ...fridge, operationType: "STATIS" }, { qty: 1, hours: 10 }).dailyKwh, 9)

// Revision sheet, Chiller 900 W: the master 20% / 80% wins over the store hours.
// 24 h on in a 24 h store is 243 W × 24 h = 5.832 kWh, not 855 W × 24 h.
const chillerDay = computeDailyKwh(fridge, { qty: 1, hours: 24, storeHours: 24 })
close(chillerDay.baseKw, 0.243)
close(chillerDay.runningPct!, 20)
close(chillerDay.dailyKwh, 5.832)

// TRANSAKSI with the same profile: 50 × 60 s in 16 h is 855 W × 0.83 h + 90 W × 15.17 h.
close(
  computeDailyKwh({ ...fridge, calcMethod: "TRANSACTION", cycleSeconds: 60 }, { qty: 1, hours: 16, usageCount: 50, storeHours: 24 }).dailyKwh,
  0.855 * (50 / 60) + 0.09 * (16 - 50 / 60)
)

// STATIS keeps today's H × O × P exactly.
close(
  computeDailyKwh({ operationType: "STATIS", calcMethod: "STANDARD", baseKw: 1.07125 }, { qty: 4, hours: 24 }).dailyKwh,
  1.07125 * 4 * 24
)

// DINAMIS STANDAR with store hours: AC running 12 h in a 24 h store, K = 50%.
const ac: EnergyProfile = {
  operationType: "DINAMIS",
  calcMethod: "STANDARD",
  baseKw: 1.07,
  runningKw: 1.07,
  standbyKw: 0.05,
}
const acDay = computeDailyKwh(ac, { qty: 1, hours: 12, storeHours: 24 })
close(acDay.runningPct!, 50)
close(acDay.baseKw, 0.56)
close(acDay.dailyKwh, 1.07 * 12 + 0.05 * 12)
assert.deepEqual(computeTimeShare(30, 24), { runningPct: 100, standbyPct: 0, windowHours: 30 })

// TRANSAKSI: Delonghi, 50 cups of 60 s in 16 h is 1.80 kWh, same as the formula before v2.
const coffee: EnergyProfile = {
  operationType: "DINAMIS",
  calcMethod: "TRANSACTION",
  baseKw: 0.0589,
  runningKw: 1.25,
  standbyKw: 0.05,
  cycleSeconds: 60,
}
const oneMachine = computeDailyKwh(coffee, { qty: 1, hours: 16, usageCount: 50 })
close(oneMachine.dailyKwh, 1.25 * (50 / 60) + 0.05 * (16 - 50 / 60))
close(oneMachine.workHours!, 50 / 60)

// Two machines, 50 cups for the whole store: the cups are not counted twice.
close(
  computeDailyKwh(coffee, { qty: 2, hours: 16, usageCount: 50 }).dailyKwh,
  1.25 * (50 / 60) + 0.05 * (32 - 50 / 60)
)

// BATCH: an oven at 15 minutes per batch, 6 batches, 14 h on.
const oven: EnergyProfile = {
  operationType: "DINAMIS",
  calcMethod: "BATCH",
  baseKw: 2.5,
  runningKw: 2.4,
  standbyKw: 0.1,
  cycleSeconds: 15 * 60,
}
close(computeDailyKwh(oven, { qty: 1, hours: 14, usageCount: 6 }).dailyKwh, 2.4 * 1.5 + 0.1 * 12.5)

// Bug 1: a usage-based brand with running and standby 0 falls back to base kW, never 0 kWh.
const blank = computeDailyKwh(
  { operationType: "DINAMIS", calcMethod: "TRANSACTION", baseKw: 1, runningKw: 0, standbyKw: 0, cycleSeconds: 60 },
  { qty: 1, hours: 16, usageCount: 60 }
)
assert.equal(blank.usedFallback, true)
close(blank.dailyKwh, 1 * 1 + 0.05 * 15)

// Work hours above the hours on: flagged, standby clamped, message for the form.
const overload = computeDailyKwh(oven, { qty: 1, hours: 1, usageCount: 6 })
assert.equal(overload.overloaded, true)
close(overload.dailyKwh, 2.4 * 1.5)
assert.match(usageOverloadMessage(oven, { qty: 1, hours: 1, usageCount: 6 }) ?? "", /melebihi jam nyala/)
assert.equal(usageOverloadMessage(oven, { qty: 1, hours: 14, usageCount: 6 }), null)

// Rows before v2 have no operation type.
assert.equal(resolveOperationType(null, "BATCH"), "DINAMIS")
assert.equal(resolveOperationType(undefined, "STANDARD"), "STATIS")
assert.equal(resolveOperationType("DINAMIS", "STANDARD"), "DINAMIS")

// Master data rules follow the V/X table.
assert.deepEqual(
  validateProfile({ operationType: "STATIS", calcMethod: "STANDARD", nameplateKw: 0.35 }),
  []
)
assert.deepEqual(
  validateProfile({
    operationType: "DINAMIS",
    calcMethod: "STANDARD",
    nameplateKw: 0.9,
    runningKw: 0.855,
    standbyKw: 0.09,
    runningTimePct: 20,
    standbyTimePct: 80,
  }),
  []
)
const issues = (input: Parameters<typeof validateProfile>[0]) =>
  validateProfile(input).map((issue) => issue.field)
assert.deepEqual(issues({ operationType: "STATIS", calcMethod: "BATCH", nameplateKw: 1, cycleSeconds: 60 }), ["calcMethod"])
assert.deepEqual(issues({ operationType: "DINAMIS", calcMethod: "STANDARD", nameplateKw: 1, runningKw: 0, standbyKw: 0, runningTimePct: 30, standbyTimePct: 60 }), ["runningKw", "runningTimePct"])
assert.deepEqual(issues({ operationType: "DINAMIS", calcMethod: "TRANSACTION", nameplateKw: 1, runningKw: 1, standbyKw: 0.1, runningTimePct: 20, standbyTimePct: 80 }), ["cycleSeconds"])
assert.deepEqual(issues({ operationType: "X", calcMethod: "STANDARD" }), ["operationType"])

console.log("energy-formula tests passed")
