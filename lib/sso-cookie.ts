// Set SSO_COOKIE_DOMAIN=.sparta-alfamart.web.id in production so the portal can read
// sso_session. Empty keeps the host-only cookie used today, and localhost needs none.
export function getSsoCookieDomain() {
  return process.env.SSO_COOKIE_DOMAIN?.trim() || undefined
}

// The portal matches session.token as-is, so this takes the raw DB token, never the signed better-auth cookie value.
export function ssoSessionCookie(token: string, expiresAt: Date) {
  return {
    name: "sso_session",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
    domain: getSsoCookieDomain(),
  }
}

// Clears a cookie both host-only and on the shared domain, whichever was set.
export function clearCookieHeaders(name: string) {
  const expired = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  const domain = getSsoCookieDomain()
  return domain ? [expired, `${expired}; Domain=${domain}`] : [expired]
}

// better-auth adds the __Secure- prefix on https, so production and localhost use different names.
const BETTER_AUTH_SESSION_COOKIES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
]

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

// Every session token the browser holds, so sign-out can end all of them, not only the first match.
export function sessionTokensFromCookieHeader(cookieHeader: string) {
  const tokens = new Set<string>()
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=")
    if (separator < 0) continue
    const name = part.slice(0, separator).trim()
    const value = safeDecode(part.slice(separator + 1).trim())
    if (!value) continue
    if (name === "sso_session") tokens.add(value)
    // better-auth signs the cookie as "<token>.<signature>".
    if (BETTER_AUTH_SESSION_COOKIES.includes(name))
      tokens.add(value.split(".")[0])
  }
  return [...tokens]
}

// A __Secure- cookie is only overwritten by a Set-Cookie that also carries Secure.
export function clearBetterAuthCookieHeaders() {
  return BETTER_AUTH_SESSION_COOKIES.map(
    (name) =>
      `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT${name.startsWith("__Secure-") ? "; Secure" : ""}`
  )
}

export function clearSessionCookieHeaders() {
  return [
    ...clearCookieHeaders("sso_session"),
    ...clearBetterAuthCookieHeaders(),
  ]
}
