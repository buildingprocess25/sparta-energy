import assert from "node:assert/strict"

import { matchMasterBrand, normalizeBrandName } from "./brand-match"

assert.equal(normalizeBrandName("  Panasonic  "), "panasonic")
assert.equal(normalizeBrandName("Gree   GWC-18 "), "gree gwc-18")
assert.equal(normalizeBrandName(null), "")
assert.equal(normalizeBrandName(undefined), "")

const brands = [
  { id: "b1", equipmentTypeId: "ac", name: "Panasonic" },
  { id: "b2", equipmentTypeId: "ac", name: "Gree GWC-18" },
  { id: "b3", equipmentTypeId: "freezer", name: "Panasonic" },
]

// Same brand in any case or spacing links to the master record of that type only.
assert.equal(matchMasterBrand(brands, "ac", " panasonic ")?.id, "b1")
assert.equal(matchMasterBrand(brands, "ac", "GREE  gwc-18")?.id, "b2")
assert.equal(matchMasterBrand(brands, "freezer", "PANASONIC")?.id, "b3")

// An unknown or empty name matches nothing, so submit leaves the master alone.
assert.equal(matchMasterBrand(brands, "ac", "Panasonc"), null)
assert.equal(matchMasterBrand(brands, "freezer", "Gree GWC-18"), null)
assert.equal(matchMasterBrand(brands, "ac", ""), null)
assert.equal(matchMasterBrand(brands, "ac", "   "), null)
assert.equal(matchMasterBrand(brands, "ac", undefined), null)

console.log("brand-match tests passed")
