import assert from "node:assert/strict"

import { calculateAcUnits, getClusterBtu } from "./ac-calculator"

assert.equal(getClusterBtu(26.9), 450)
assert.equal(getClusterBtu(27), 600)
assert.equal(getClusterBtu(35), 600)
assert.equal(getClusterBtu(35.1), 751)

// Mirrors the AC calculator page. The doc's 130 m² table lists 4 units below 27°C,
// which only holds for a flat 600 target; the 450 cluster gives 3 (415 vs 554 BTU/m²).
assert.equal(calculateAcUnits(130, 25).units, 3)
assert.equal(calculateAcUnits(130, 26.5).units, 3)
assert.equal(calculateAcUnits(130, 30).units, 4)
assert.equal(calculateAcUnits(130, 36).units, 5)

assert.deepEqual(calculateAcUnits(130, 30), {
  clusterBtu: 600,
  totalBtu: 78000,
  units: 4,
})

// A tiny sales area still gets one unit.
assert.equal(calculateAcUnits(5, 30).units, 1)

console.log("ac-calculator tests passed")
