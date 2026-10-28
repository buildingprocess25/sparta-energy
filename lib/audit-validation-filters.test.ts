import assert from "node:assert/strict"

import { parseValidationFilters } from "./audit-validation-filters"

assert.deepEqual(parseValidationFilters({}), {
  result: "all",
  status: "pending",
  gap: "all",
  q: "",
  page: 1,
})

// Old links with status=all keep showing every store; unknown values fall back to the queue.
assert.equal(parseValidationFilters({ status: "all" }).status, "all")
assert.equal(
  parseValidationFilters({ status: "validated" }).status,
  "validated"
)
assert.equal(parseValidationFilters({ status: "bogus" }).status, "pending")

assert.equal(parseValidationFilters({ gap: "inside" }).gap, "inside")
assert.equal(parseValidationFilters({ gap: "outside" }).gap, "outside")
assert.equal(parseValidationFilters({ gap: "20" }).gap, "all")

assert.equal(parseValidationFilters({ view: "top" }).status, "pending")
assert.equal(parseValidationFilters({ page: "3" }).page, 3)
assert.equal(parseValidationFilters({ page: "-1" }).page, 1)

console.log("audit-validation-filters tests passed")
