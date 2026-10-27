import assert from "node:assert/strict"

import { buildStoreDetailViewModel } from "./admin-store-detail"

const detail = buildStoreDetailViewModel({
  store: {
    id: "store-1",
    code: "A001",
    name: "Alfamart Test",
    branch: "Jakarta",
    plnCustomerId: "12345",
    type: "Regular",
    is24Hours: false,
    openTime: "07:00",
    closeTime: "22:00",
    plnPowerVa: 22000,
    salesAreaM2: 80,
    parkingAreaM2: 20,
    terraceAreaM2: 10,
    warehouseAreaM2: 10,
    toiletAreaM2: 2,
    corridorAreaM2: 3,
  },
  audits: [
    {
      id: "audit-1",
      auditDate: new Date("2026-05-01T00:00:00.000Z"),
      isBoros: true,
      totalEstimatedKwhPerMonth: 1000,
      avgActualPlnKwhPerMonth: 1250,
      auditor: {
        fullName: "Auditor A",
        email: "auditor@example.com",
      },
      recommendations: [
        {
          type: "REPAIR",
          title: "Cek AC",
          description: "Konsumsi aktual melewati baseline.",
        },
      ],
      items: [
        {
          areaTarget: "SALES",
          customName: "AC Split",
          brandName: "Daikin",
          qty: 2,
          operationalHours: 12,
          baseKw: 1,
          estimatedDailyKwh: 24,
          equipmentType: { name: "AC" },
          equipmentBrand: { name: "Daikin" },
        },
        {
          areaTarget: "TERRACE",
          customName: "Lampu Teras",
          brandName: "",
          qty: 4,
          operationalHours: 10,
          baseKw: 0.02,
          estimatedDailyKwh: 0.8,
          equipmentType: { name: "Lampu" },
          equipmentBrand: null,
        },
      ],
      plnHistory: [
        {
          monthIdx: 1,
          billingMonth: "Maret 2026",
          plnUsageKwh: 1200,
          salesTransactionPerDay: 300,
        },
        {
          monthIdx: 2,
          billingMonth: "April 2026",
          plnUsageKwh: 1300,
          salesTransactionPerDay: 330,
        },
      ],
    },
  ],
})

assert.equal(detail.latestAudit?.id, "audit-1")
assert.equal(detail.identity.totalAreaM2, 125)
assert.equal(detail.latestAudit?.gapKwh, 250)
assert.equal(detail.latestAudit?.gapPercent, 25)
assert.equal(detail.latestAudit?.actualKwhPerM2, 10)
assert.equal(detail.latestAudit?.baselineKwhPerM2, 8)
assert.equal(detail.dataCompleteness.percent, 100)
assert.equal(detail.equipmentSummary.totalQty, 6)
assert.equal(detail.equipmentSummary.totalDailyKwh, 24.8)
assert.deepEqual(detail.equipmentSummary.areaBreakdown[0], {
  area: "Sales Area",
  dailyKwh: 24,
  monthlyKwh: 720,
  percent: 97,
})
assert.deepEqual(detail.equipmentSummary.topEquipment[0], {
  name: "AC",
  qty: 2,
  dailyKwh: 24,
  monthlyKwh: 720,
})
assert.deepEqual(detail.monthlyTrend, [
  {
    month: "Maret 2026",
    plnKwh: 1200,
    std: 300,
    baseline: 1000,
  },
  {
    month: "April 2026",
    plnKwh: 1300,
    std: 330,
    baseline: 1000,
  },
])

console.log("admin-store-detail view model tests passed")
