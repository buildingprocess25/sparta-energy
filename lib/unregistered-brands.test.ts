import assert from "node:assert/strict"

import {
  groupUnregisteredBrands,
  toMasterBrandData,
  UnregisteredBrandError,
  type FieldBrandRow,
} from "./unregistered-brands"

function row(overrides: Partial<FieldBrandRow>): FieldBrandRow {
  return {
    equipmentTypeId: "ac",
    typeName: "Air Conditioner",
    calcMethod: "STANDARD",
    brandName: "Panasonc",
    baseKw: 1.07,
    areaTarget: "SALES",
    auditId: "a1",
    storeId: "s1",
    storeCode: "TF67",
    auditDate: new Date("2026-10-12T00:00:00Z"),
    ...overrides,
  }
}

const rows: FieldBrandRow[] = [
  row({}),
  row({ brandName: " panasonc ", auditId: "a2", storeId: "s2", storeCode: "TG17", baseKw: 1.1, auditDate: new Date("2026-10-20T00:00:00Z") }),
  row({ auditId: "a2", storeId: "s2", storeCode: "TG17" }),
  row({ brandName: "Gea", equipmentTypeId: "fz", typeName: "Freezer Chest Showcase", baseKw: 0.48 }),
  row({ brandName: "Daikin" }),
  row({ brandName: "Sharp" }),
  row({ brandName: "   " }),
]

const masterBrands = [{ id: "b1", equipmentTypeId: "ac", name: "DAIKIN" }]
const dismissed = [{ equipmentTypeId: "ac", brandName: "sharp" }]

const groups = groupUnregisteredBrands(rows, masterBrands, dismissed)

// Master names and dismissed names are hidden; blank names never show.
assert.deepEqual(
  groups.map((group) => group.brandName),
  ["Panasonc", "Gea"]
)

// Spellings that differ only in case or spaces form one group.
const panasonc = groups[0]
assert.equal(panasonc.storeCount, 2)
assert.equal(panasonc.auditCount, 2)
assert.equal(panasonc.kwMin, 1.07)
assert.equal(panasonc.kwMax, 1.1)
assert.equal(panasonc.kwTypical, 1.07)
assert.deepEqual(panasonc.sampleStores, ["TF67", "TG17"])
assert.equal(panasonc.firstSeen, "2026-10-12T00:00:00.000Z")
assert.equal(panasonc.lastSeen, "2026-10-20T00:00:00.000Z")

// The same name on another type is a separate brand.
assert.equal(groups[1].equipmentTypeId, "fz")

// STANDARD types copy base kW into running kW, with 5% standby.
assert.deepEqual(
  toMasterBrandData({ brandName: "  Gea  Prime ", baseKw: 0.48, areaTarget: "SALES" }, "STANDARD"),
  { name: "Gea Prime", baseKw: 0.48, runningKw: 0.48, standbyKw: 0.48 * 0.05, areaTarget: "SALES" }
)

// Usage-based types must carry a running kW above 0.
assert.throws(
  () => toMasterBrandData({ brandName: "Krups", baseKw: 1.2, runningKw: 0, areaTarget: "SALES" }, "TRANSACTION"),
  UnregisteredBrandError
)
assert.deepEqual(
  toMasterBrandData(
    { brandName: "Krups", baseKw: 1.2, runningKw: 1.5, standbyKw: 0.05, areaTarget: "SALES" },
    "BATCH"
  ),
  { name: "Krups", baseKw: 1.2, runningKw: 1.5, standbyKw: 0.05, areaTarget: "SALES" }
)

for (const bad of [
  { brandName: " ", baseKw: 1, areaTarget: "SALES" as const },
  { brandName: "X", baseKw: 0, areaTarget: "SALES" as const },
  { brandName: "X", baseKw: Number.NaN, areaTarget: "SALES" as const },
  { brandName: "X", baseKw: 1, areaTarget: "ROOF" as never },
]) {
  assert.throws(() => toMasterBrandData(bad, "STANDARD"), UnregisteredBrandError)
}

console.log("unregistered-brands tests passed")
