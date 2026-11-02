import assert from "node:assert/strict"

import {
  clearBetterAuthCookieHeaders,
  clearCookieHeaders,
  clearSessionCookieHeaders,
  cookieHeaderFrom,
  readSsoSessionToken,
  sessionTokensFromCookieHeader,
  ssoSessionCookie,
} from "./sso-cookie"

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

// A GS login left behind on the production cookie name plus a newer admin sso_session.
assert.deepEqual(
  sessionTokensFromCookieHeader(
    "theme=dark; __Secure-better-auth.session_token=gsToken.c2lnbg%3D%3D; sso_session=adminToken; sso_session=adminToken"
  ),
  ["gsToken", "adminToken"]
)
assert.deepEqual(
  sessionTokensFromCookieHeader("better-auth.session_token=localToken.sig"),
  ["localToken"]
)
assert.deepEqual(sessionTokensFromCookieHeader("sso_session=; theme=dark"), [])
assert.deepEqual(sessionTokensFromCookieHeader("sso_session=bad%E0"), [
  "bad%E0",
])

// The browser ignores a __Secure- Set-Cookie without Secure, which is why sign-out never cleared it.
assert.deepEqual(clearBetterAuthCookieHeaders(), [
  "better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  "__Secure-better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure",
])
assert.equal(clearSessionCookieHeaders().length, 3)

env.NODE_ENV = originalNodeEnv
env.SSO_COOKIE_DOMAIN = originalDomain

// One reader for sso_session everywhere: exact name, decoded value, first cookie wins.
assert.equal(
  readSsoSessionToken("theme=dark; sso_session=abc; sso_session=def"),
  "abc"
)
assert.equal(readSsoSessionToken("xsso_session=nope; theme=dark"), null)
assert.equal(readSsoSessionToken("sso_session="), null)
assert.equal(readSsoSessionToken("sso_session=a%2Bb"), "a+b")

assert.equal(
  cookieHeaderFrom(new Headers({ cookie: "sso_session=abc" })),
  "sso_session=abc"
)
assert.equal(cookieHeaderFrom({ cookie: "sso_session=abc" }), "sso_session=abc")
assert.equal(cookieHeaderFrom(undefined), "")
assert.equal(cookieHeaderFrom({ cookie: 42 }), "")

console.log("sso-cookie tests passed")
