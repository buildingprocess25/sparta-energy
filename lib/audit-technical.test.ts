import assert from "node:assert/strict"

import { readDraftTechnical, toAuditTechnical } from "./audit-technical"

const areas = { sales: 120, parkir: 40, teras: 15, gudang: 30, toilet: 4, selasar: 6 }

// Same columns submit wrote before the helper existed.
assert.deepEqual(
  toAuditTechnical({
    storeType: "Regular",
    is24Hours: false,
    openTime: "07:00",
    closeTime: "22:00",
    plnPowerVa: 16500,
    areas,
  }),
  {
    storeType: "Regular",
    plnPowerVa: 16500,
    salesAreaM2: 120,
    parkingAreaM2: 40,
    terraceAreaM2: 15,
    warehouseAreaM2: 30,
    toiletAreaM2: 4,
    corridorAreaM2: 6,
    is24Hours: false,
    openTime: "07:00",
    closeTime: "22:00",
  }
)

// A 24-hour store keeps no open/close time; an empty store type is stored as null.
const allDay = toAuditTechnical({
  storeType: "",
  is24Hours: true,
  openTime: "07:00",
  closeTime: "22:00",
  plnPowerVa: 8786,
  areas,
})
assert.equal(allDay.storeType, null)
assert.equal(allDay.openTime, null)
assert.equal(allDay.closeTime, null)

// Missing fields stay undefined so an update leaves the audit's value alone.
assert.deepEqual(
  Object.values(toAuditTechnical({})).filter((value) => value !== undefined),
  []
)

const store = {
  type: "Regular",
  plnPowerVa: 8786,
  salesAreaM2: "99",
  parkingAreaM2: "99",
  terraceAreaM2: "99",
  warehouseAreaM2: "99",
  toiletAreaM2: null,
  corridorAreaM2: null,
  is24Hours: true,
  openTime: null,
  closeTime: null,
}

// A draft with a snapshot reopens with what the auditor typed, not the store master.
const saved = readDraftTechnical(
  {
    storeType: "Medium",
    plnPowerVa: 11000,
    salesAreaM2: "135.5",
    parkingAreaM2: "20",
    terraceAreaM2: "10",
    warehouseAreaM2: "25",
    toiletAreaM2: "3",
    corridorAreaM2: "8",
    is24Hours: false,
    openTime: "06:00",
    closeTime: "23:00",
  },
  store
)
assert.deepEqual(saved, {
  storeType: "Medium",
  is24Hours: false,
  openTime: "06:00",
  closeTime: "23:00",
  plnPowerVa: 11000,
  areas: { sales: 135.5, parkir: 20, teras: 10, gudang: 25, toilet: 3, selasar: 8 },
})

// A draft saved before snapshots existed falls back to the store master.
const legacy = readDraftTechnical(
  {
    storeType: null,
    plnPowerVa: null,
    salesAreaM2: null,
    parkingAreaM2: null,
    terraceAreaM2: null,
    warehouseAreaM2: null,
    toiletAreaM2: null,
    corridorAreaM2: null,
    is24Hours: null,
    openTime: null,
    closeTime: null,
  },
  store
)
assert.deepEqual(legacy, {
  storeType: "Regular",
  is24Hours: true,
  openTime: "07:00",
  closeTime: "22:00",
  plnPowerVa: 8786,
  areas: { sales: 99, parkir: 99, teras: 99, gudang: 99, toilet: 0, selasar: 0 },
})

console.log("audit-technical tests passed")
