import assert from "node:assert/strict"

import { getAdminAuditDateWhere } from "./admin-audit-date-filter"

assert.equal(getAdminAuditDateWhere("all", "05"), null)

assert.deepEqual(getAdminAuditDateWhere("2026", "05"), {
  auditDate: {
    gte: new Date(2026, 4, 1, 0, 0, 0, 0),
    lt: new Date(2026, 5, 1, 0, 0, 0, 0),
  },
})

assert.equal(getAdminAuditDateWhere("all", "99"), null)

console.log("admin-audit date filter tests passed")
