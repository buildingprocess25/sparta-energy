import assert from "node:assert/strict"

import { compareAudit, compareItem, summarizeComparisons, type ComparisonItem } from "./formula-comparison"

const close = (actual: number, expected: number, label = "") =>
  assert.ok(Math.abs(actual - expected) < 1e-6, `${label} ${actual} != ${expected}`)

function item(overrides: Partial<ComparisonItem>): ComparisonItem {
  return {
    id: "i",
    name: "Alat",
    qty: 1,
    operationalHours: 24,
    baseKw: 1,
    estimatedDailyKwh: 24,
    usageCount: null,
    formulaVersion: null,
    storeHours: null,
    type: { operationType: "STATIS", calcMethod: "STANDARD", calcDuration: null },
    brand: null,
    ...overrides,
  }
}

// TF67 KYAI MAJA 2 rows (export 23 Oct 2026): [name, qty, hours, kW].
const TF67: [string, number, number, number][] = [
  ["Polesign", 1, 14, 0.35],
  ["Shop Sign TL LED", 7, 12, 0.084],
  ["Tenant", 2, 23 + 59 / 60, 0.2],
  ["Lampu area Teras TL", 6, 12, 0.0154],
  ["Pompa Air", 1, 1, 0.032],
  ["Air Conditioner", 4, 23 + 59 / 60, 1.55],
  ["Lampu area sales TL", 65, 23 + 59 / 60, 0.0154],
  ["Paket CCTV", 3, 23 + 59 / 60, 0.182],
]
const tf67Items = TF67.map(([name, qty, hours, kw], i) =>
  item({ id: `${i}`, name, qty, operationalHours: hours, baseKw: kw, estimatedDailyKwh: kw * qty * hours })
)
const audit = {
  id: "tf67",
  storeCode: "TF67",
  storeName: "KYAI MAJA 2",
  branch: "BALARAJA",
  auditDate: new Date("2026-10-23"),
  validationStatus: "PENDING",
  // Fixture holds only part of TF67, so actual PLN sits just under its standard.
  actualPlnKwhPerMonth: tf67Items.reduce((sum, row) => sum + row.estimatedDailyKwh, 0) * 30 * 0.97,
}

// Right after the migration every type is STATIS: the report must show no change.
const unchanged = compareAudit({ ...audit, items: tf67Items })
close(unchanged.diffKwh, 0, "STATIS diff")
assert.equal(unchanged.statusChanged, false)
assert.equal(unchanged.recalculatedItems, TF67.length)
assert.equal(unchanged.oldIsBoros, false)

// The AC turned DINAMIS with a master profile: running 1.55, standby 0.05, 75% / 25%.
const withDynamicAc = tf67Items.map((row) =>
  row.name === "Air Conditioner"
    ? {
        ...row,
        type: { operationType: "DINAMIS", calcMethod: "STANDARD", calcDuration: null },
        brand: { runningKw: 1.55, standbyKw: 0.05, runningTimePct: 75, standbyTimePct: 25 },
      }
    : row
)
const changed = compareAudit({ ...audit, items: withDynamicAc })
const acHours = 23 + 59 / 60
const acOld = 1.55 * 4 * acHours
const acNew = (1.55 * 0.75 + 0.05 * 0.25) * 4 * acHours
close(changed.diffKwh, (acNew - acOld) * 30, "AC diff")
assert.ok(changed.newStandard < changed.oldStandard)
assert.equal(changed.oldIsBoros, false)
// The same actual PLN against a lower standard turns this store Boros.
assert.equal(changed.newIsBoros, true)
assert.equal(changed.statusChanged, true)

// A DINAMIS row without a master brand keeps its old kWh and says why.
const noBrand = compareItem(
  item({ type: { operationType: "DINAMIS", calcMethod: "STANDARD", calcDuration: null }, brand: null })
)
assert.equal(noBrand.recalculated, false)
assert.match(noBrand.note ?? "", /Merek tidak terdaftar/)

// Custom equipment without a type keeps its old kWh.
assert.equal(compareItem(item({ type: null })).recalculated, false)

// Rows before v2 stored cups per machine; the report converts them to the store total.
const coffee = compareItem(
  item({
    qty: 2,
    operationalHours: 16,
    baseKw: 1.25,
    usageCount: 25,
    estimatedDailyKwh: (1.25 * (25 / 60) + 0.0625 * (16 - 25 / 60)) * 2,
    type: { operationType: "DINAMIS", calcMethod: "TRANSACTION", calcDuration: 60 },
    brand: { runningKw: 1.25, standbyKw: 0.05, runningTimePct: null, standbyTimePct: null },
  })
)
close(coffee.newDailyKwh, 1.25 * (50 / 60) + 0.05 * (32 - 50 / 60), "coffee")

// An incomplete dynamic profile is flagged instead of counted as recalculated.
const incomplete = compareItem(
  item({
    type: { operationType: "DINAMIS", calcMethod: "STANDARD", calcDuration: null },
    brand: { runningKw: 0, standbyKw: 0, runningTimePct: null, standbyTimePct: null },
  })
)
assert.equal(incomplete.recalculated, false)
assert.match(incomplete.note ?? "", /belum lengkap/)

assert.deepEqual(summarizeComparisons([unchanged, changed]).changedStatus, 1)
assert.deepEqual(summarizeComparisons([unchanged, changed]).hematToBoros, 1)

console.log("formula-comparison tests passed")
