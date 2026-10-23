import assert from "node:assert/strict"

import { calculateAudit } from "./audit-kalkulator"
import {
  calculateGapPercent,
  calculateItemDailyKwh,
  summarizeAuditItems,
} from "./audit-recalculate"

assert.equal(
  calculateItemDailyKwh({ qty: 5, operationalHours: 15, baseKw: 0.05 }),
  3.75
)

// TRANSACTION: 120 uses x 60s = 2h running, 12h standby at 5% of kW.
assert.equal(
  calculateItemDailyKwh({
    qty: 1,
    operationalHours: 14,
    baseKw: 1,
    calcMethod: "TRANSACTION",
    calcDuration: 60,
    usageCount: 120,
  }),
  2 + 0.05 * 12
)

assert.equal(
  calculateItemDailyKwh({
    qty: 2,
    operationalHours: 10,
    baseKw: 2,
    calcMethod: "BATCH",
    calcDuration: 3600,
    usageCount: 3,
    standbyKw: 0.5,
  }),
  (2 * 3 + 0.5 * 7) * 2
)

assert.equal(calculateGapPercent(25000, 3371), ((25000 - 3371) / 3371) * 100)
assert.equal(calculateGapPercent(1000, 0), null)
assert.equal(calculateGapPercent(900, 1000), -10)

const summary = summarizeAuditItems([10, 20.5], 1200)
assert.equal(summary.totalEstimatedKwhPerMonth, 915)
assert.equal(summary.gapPercent, ((1200 - 915) / 915) * 100)

// Stored items must add up to the same monthly estimate calculateAudit() produced.
const calc = calculateAudit(
  [
    {
      selected: true,
      name: "Lampu LED",
      areaName: "Sales Area",
      quantity: 4,
      kw: 0.02,
      startTimes: ["07:00"],
      endTimes: ["22:00"],
    },
    {
      selected: true,
      name: "AC Split",
      areaName: "Sales Area",
      quantity: 2,
      kw: 1.5,
      kws: [1.5, 1.2],
      startTimes: ["08:00", "10:00"],
      endTimes: ["22:00", "20:00"],
    },
  ] as unknown as Parameters<typeof calculateAudit>[0],
  [{ month: "Jan", kwh: 1500, std: 0 }] as unknown as Parameters<
    typeof calculateAudit
  >[1],
  {
    is24Hours: false,
    openTime: "07:00",
    closeTime: "22:00",
    areas: { sales: 100 },
    plnPowerVa: 5500,
  }
)
const stored = summarizeAuditItems(
  [
    calculateItemDailyKwh({ qty: 4, operationalHours: 15, baseKw: 0.02 }),
    calculateItemDailyKwh({ qty: 1, operationalHours: 14, baseKw: 1.5 }),
    calculateItemDailyKwh({ qty: 1, operationalHours: 10, baseKw: 1.2 }),
  ],
  calc.avgActualPlnKwhPerMonth
)
assert.ok(
  Math.abs(stored.totalEstimatedKwhPerMonth - calc.equipmentEstimateKwhPerMonth) <
    1e-9
)

console.log("audit-recalculate tests passed")
