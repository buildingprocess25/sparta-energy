import assert from "node:assert/strict"

import { resolveSsoSession, type SessionWithUser } from "./session-resolver"

const now = new Date("2026-10-28T08:00:00Z")
const session = (token: string, expiresAt: string) =>
  ({
    id: `s-${token}`,
    token,
    userId: "u1",
    expiresAt: new Date(expiresAt),
    user: { id: "u1", email: "gs@contoh.id", role: "GS" },
  }) as unknown as SessionWithUser

const sessions = new Map([
  ["live", session("live", "2026-10-28T12:00:00Z")],
  ["expired", session("expired", "2026-10-28T07:59:59Z")],
])
const lookups: string[] = []
const find = async (token: string) => {
  lookups.push(token)
  return sessions.get(token) ?? null
}

// A live sso_session resolves to the same shape the old getSession patch returned.
const live = await resolveSsoSession("theme=dark; sso_session=live", find, now)
assert.equal(live?.session.token, "live")
assert.equal(live?.user.id, "u1")

// Expired, unknown or missing cookies resolve to nothing; no cookie means no lookup at all.
assert.equal(await resolveSsoSession("sso_session=expired", find, now), null)
assert.equal(await resolveSsoSession("sso_session=unknown", find, now), null)
lookups.length = 0
assert.equal(
  await resolveSsoSession("better-auth.session_token=x.y", find, now),
  null
)
assert.deepEqual(lookups, [])

console.log("session-resolver tests passed")
