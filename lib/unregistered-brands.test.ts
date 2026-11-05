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
    operationType: "STATIS",
    cycleSeconds: null,
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

// Saving to the master follows the type's characteristic (energy formula v2).
const statis = { operationType: "STATIS", calcMethod: "STANDARD", cycleSeconds: null }
const statisBrand = toMasterBrandData(
  { brandName: "  Gea  Prime ", areaTarget: "SALES", profile: { nameplateKw: 0.48 } },
  statis
)
assert.equal(statisBrand.name, "Gea Prime")
assert.equal(statisBrand.baseKw, 0.48)
assert.equal(statisBrand.nameplateKw, 0.48)

// DINAMIS needs running power and running time; H is computed, not typed.
const dinamis = { operationType: "DINAMIS", calcMethod: "STANDARD", cycleSeconds: null }
const fridge = toMasterBrandData(
  {
    brandName: "Gea",
    areaTarget: "SALES",
    profile: { nameplateKw: 0.9, runningPctOfNameplate: 95, standbyPctOfNameplate: 10, runningTimePct: 20 },
  },
  dinamis
)
assert.ok(Math.abs(fridge.baseKw - 0.243) < 1e-9)
assert.throws(
  () => toMasterBrandData({ brandName: "Gea", areaTarget: "SALES", profile: { nameplateKw: 0.9, runningKw: 0 } }, dinamis),
  UnregisteredBrandError
)

// Usage-based types still need their cycle time on the type.
assert.throws(
  () =>
    toMasterBrandData(
      { brandName: "Krups", areaTarget: "SALES", profile: { nameplateKw: 1.2, runningKw: 1.2, standbyKw: 0.05, runningTimePct: 20 } },
      { operationType: "DINAMIS", calcMethod: "TRANSACTION", cycleSeconds: null }
    ),
  UnregisteredBrandError
)

for (const bad of [
  { brandName: " ", areaTarget: "SALES" as const, profile: { nameplateKw: 1 } },
  { brandName: "X", areaTarget: "SALES" as const, profile: { nameplateKw: 0 } },
  { brandName: "X", areaTarget: "ROOF" as never, profile: { nameplateKw: 1 } },
]) {
  assert.throws(() => toMasterBrandData(bad, statis), UnregisteredBrandError)
}

console.log("unregistered-brands tests passed")
