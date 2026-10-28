import assert from "node:assert/strict"

import { clearCookieHeaders, ssoSessionCookie } from "./sso-cookie"

const env = process.env as Record<string, string | undefined>
const originalNodeEnv = env.NODE_ENV
const originalDomain = env.SSO_COOKIE_DOMAIN
const expiresAt = new Date("2026-10-29T08:00:00Z")

env.NODE_ENV = "production"
env.SSO_COOKIE_DOMAIN = ".sparta-alfamart.web.id"
assert.deepEqual(ssoSessionCookie("raw-token", expiresAt), {
  name: "sso_session",
  value: "raw-token",
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  expires: expiresAt,
  domain: ".sparta-alfamart.web.id",
})
assert.equal(clearCookieHeaders("sso_session").length, 2)

// Without SSO_COOKIE_DOMAIN the cookie stays host-only, as on localhost.
env.NODE_ENV = "development"
env.SSO_COOKIE_DOMAIN = ""
const local = ssoSessionCookie("raw-token", expiresAt)
assert.equal(local.domain, undefined)
assert.equal(local.secure, false)
assert.equal(clearCookieHeaders("sso_session").length, 1)

env.NODE_ENV = originalNodeEnv
env.SSO_COOKIE_DOMAIN = originalDomain

console.log("sso-cookie tests passed")
