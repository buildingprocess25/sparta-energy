import assert from "node:assert/strict"

import { can, getHomeUrl, resolveRole } from "./role-access"

const env = process.env as Record<string, string | undefined>
const originalNodeEnv = env.NODE_ENV
const originalMonitoringUrl = env.ENERGY_MONITORING_URL

env.ENERGY_MONITORING_URL = "http://localhost:3001"
assert.equal(getHomeUrl("ADMIN"), "/admin-entry")
assert.equal(getHomeUrl("AUDITOR"), "/admin-entry")
assert.equal(getHomeUrl("AREA"), "/admin/dashboard")
assert.equal(getHomeUrl("USER"), "/dashboard")
assert.equal(getHomeUrl("GS"), "http://localhost:3001")
assert.equal(getHomeUrl(null), "/dashboard")

// dev_role only counts in development.
env.NODE_ENV = "development"
assert.equal(resolveRole("ADMIN", "GS"), "GS")
assert.equal(resolveRole("ADMIN", "BOGUS"), "ADMIN")
env.NODE_ENV = "production"
assert.equal(resolveRole("ADMIN", "GS"), "ADMIN")
assert.equal(resolveRole(null, "GS"), null)

// AREA mirrors ADMIN; AUDITOR validates and sees all branches but does not manage users.
assert.equal(can("AREA", "manageUsers"), true)
assert.equal(can("AUDITOR", "validateAudits"), true)
assert.equal(can("AUDITOR", "allBranches"), true)
assert.equal(can("AUDITOR", "manageUsers"), false)
assert.equal(can("GS", "fieldApp"), false)
assert.equal(can("USER", "adminPanel"), false)

env.NODE_ENV = originalNodeEnv
env.ENERGY_MONITORING_URL = originalMonitoringUrl

console.log("role-access tests passed")
