import assert from "node:assert/strict"

import { getFallbackRecommendation } from "./recommendation-fallback"

for (const type of ["TRAINING", "REPAIR", "MAINTENANCE"] as const) {
  const rec = getFallbackRecommendation(type)
  assert.equal(rec.type, type)
  assert.ok(rec.title.length > 0, type)
  assert.ok(rec.description.length > 0, type)
}

assert.equal(getFallbackRecommendation("TRAINING").title, "Pelatihan SOP Operasional")
assert.equal(getFallbackRecommendation("REPAIR").title, "Perbaikan & Pengecekan Peralatan")

// An unknown type never reaches the database as an invalid enum value.
assert.deepEqual(getFallbackRecommendation("UNKNOWN"), getFallbackRecommendation("MAINTENANCE"))

console.log("recommendation-fallback tests passed")
