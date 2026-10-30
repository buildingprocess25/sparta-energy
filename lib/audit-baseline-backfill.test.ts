import assert from "node:assert/strict"

import {
  backfillCsv,
  planBaselineBackfill,
  type BackfillAuditRow,
} from "./audit-baseline-backfill"

function auditRow(overrides: Partial<BackfillAuditRow>): BackfillAuditRow {
  return {
    id: "a1",
    code: "W441",
    name: "PAGAR MERBAU",
    auditDate: new Date("2026-09-18T03:00:00Z"),
    validationStatus: "PENDING",
    storedTotal: 1000,
    storedGapPercent: 0,
    avgActual: 1000,
    isBoros: false,
    itemDailyKwh: 1000 / 30,
    itemCount: 3,
    recommendationTypes: "MAINTENANCE",
    ...overrides,
  }
}

// W441 as submitted: standard 5.243 kWh, items add up to 6.562 kWh, PLN 5.956 kWh.
const w441 = auditRow({
  storedTotal: 5243,
  storedGapPercent: ((5956 - 5243) / 5243) * 100,
  avgActual: 5956,
  isBoros: true,
  itemDailyKwh: 6562.0644 / 30,
  recommendationTypes: "REPAIR",
})
const [w441Change] = planBaselineBackfill([w441])
assert.ok(Math.abs(w441Change.newTotal - 6562.0644) < 1e-9)
assert.equal(w441Change.newIsBoros, false)
assert.equal(w441Change.statusChanged, true)
assert.ok(Math.abs(w441Change.newGapPercent! - ((5956 - 6562.0644) / 6562.0644) * 100) < 1e-9)

// Already correct, rounding-only, and item-less audits are left alone.
assert.equal(planBaselineBackfill([auditRow({})]).length, 0)
assert.equal(
  planBaselineBackfill([auditRow({ itemDailyKwh: (1000 + 0.005) / 30 })]).length,
  0
)
assert.equal(planBaselineBackfill([auditRow({ itemCount: 0, itemDailyKwh: 0 })]).length, 0)

// Same status after the fix: changed total, statusChanged false.
const sameStatus = planBaselineBackfill([
  auditRow({ storedTotal: 900, avgActual: 2000, isBoros: true }),
])
assert.equal(sameStatus.length, 1)
assert.equal(sameStatus[0].statusChanged, false)

// Missing PLN average counts as 0 kWh, so the audit becomes Hemat.
const noPln = planBaselineBackfill([auditRow({ storedTotal: 900, avgActual: null, isBoros: true })])
assert.equal(noPln[0].newIsBoros, false)
assert.equal(noPln[0].newGapPercent, -100)

const csv = backfillCsv(
  [...planBaselineBackfill([w441]), ...planBaselineBackfill([auditRow({ name: 'TOKO "A", B', storedTotal: 900 })])],
  "dry-run"
)
const lines = csv.trimEnd().split("\n")
assert.equal(lines.length, 3)
assert.equal(
  lines[1],
  "a1,W441,PAGAR MERBAU,2026-09-18,PENDING,5243,6562.06,13.6,-9.24,5956,Boros,Hemat,ya,REPAIR,dry-run"
)
assert.ok(lines[2].includes('"TOKO ""A"", B"'))

console.log("audit-baseline-backfill tests passed")
