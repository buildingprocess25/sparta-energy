import assert from "node:assert/strict"

import {
  AVAILABLE_ENERGY_AUDIT_CATEGORIES,
  ENERGY_AUDIT_CATEGORIES,
  toCategoryProgress,
} from "./energy-audit-categories"

// Only categories with a form count; the rest stay out of lists, counts and exports.
assert.deepEqual(
  AVAILABLE_ENERGY_AUDIT_CATEGORIES.map((category) => category.key),
  ENERGY_AUDIT_CATEGORIES.filter((category) => category.available).map(
    (category) => category.key
  )
)
assert.ok(
  AVAILABLE_ENERGY_AUDIT_CATEGORIES.some(
    (category) => category.key === "TATA_UDARA_VENTILASI"
  )
)

const progress = toCategoryProgress({
  TATA_CAHAYA: { status: "COMPLETED", summaryStatus: "SESUAI" },
  TATA_UDARA_VENTILASI: { status: "DRAFT", summaryStatus: "AC_LEBIH:1" },
  REFRIGERASI: { status: "COMPLETED", summaryStatus: null },
})
assert.equal(progress.length, AVAILABLE_ENERGY_AUDIT_CATEGORIES.length)
assert.ok(!progress.some((category) => category.key === "REFRIGERASI"))
assert.deepEqual(
  progress.find((category) => category.key === "TATA_UDARA_VENTILASI"),
  {
    key: "TATA_UDARA_VENTILASI",
    label: "Sistem Tata Udara & Ventilasi",
    status: "DRAFT",
    summaryStatus: "AC_LEBIH:1",
  }
)

// A store with no inspection yet: every available category shows as not started.
assert.ok(
  toCategoryProgress(null).every((category) => category.status === null)
)

console.log("energy-audit-categories tests passed")
