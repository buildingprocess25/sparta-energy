// Set SSO_COOKIE_DOMAIN=.sparta-alfamart.web.id in production so the portal can read
// sso_session. Empty keeps the host-only cookie used today, and localhost needs none.
export function getSsoCookieDomain() {
  return process.env.SSO_COOKIE_DOMAIN?.trim() || undefined
}

// Clears a cookie both host-only and on the shared domain, whichever was set.
export function clearCookieHeaders(name: string) {
  const expired = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  const domain = getSsoCookieDomain()
  return domain ? [expired, `${expired}; Domain=${domain}`] : [expired]
}
