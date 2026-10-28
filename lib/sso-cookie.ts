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
