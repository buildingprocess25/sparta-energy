import { NextRequest, NextResponse } from "next/server"
import { resolveSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DEV_ROLE_COOKIE, getHomeUrl, resolveRole } from "@/lib/role-access"
import { deleteSessionsByToken } from "@/lib/session-resolver"
import {
  clearSessionCookieHeaders,
  readSsoSessionToken,
  sessionTokensFromCookieHeader,
  ssoSessionCookie,
} from "@/lib/sso-cookie"

// Guest-only routes: accessible only when not logged in.
const guestOnlyRoutes = new Set(["/", "/login"])

const publicPrefixes = [
  "/api/auth",
  "/api/dev-login",
  "/_next",
  "/favicon.ico",
  "/assets",
  "/ac-estimation",
  "/demo",
  "/manifest.json",
  "/sw.js",
  "/workbox-",
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Client useSession(): answer from sso_session only when better-auth has no session,
  // the same order the server uses, so browser and server see the same user.
  if (pathname === "/api/auth/get-session") {
    if (readSsoSessionToken(request.headers.get("cookie") || "")) {
      const resolved = await resolveSession(request.headers)
      if (resolved?.source === "sso") return NextResponse.json(resolved.data)
    }
  }
  // Intercept /api/auth/sign-out to clear the fallback sso_session cookie
  if (pathname === "/api/auth/sign-out") {
    const cookieHeader = request.headers.get("cookie") || ""
    // The browser can hold an sso_session and a better-auth cookie from different logins; end both.
    const sessionTokens = sessionTokensFromCookieHeader(cookieHeader)
    if (readSsoSessionToken(cookieHeader)) {
      try {
        await deleteSessionsByToken(sessionTokens)
      } catch (e) {
        console.error("[Proxy] Failed to delete sessions:", e)
      }

      // Short-circuit the response so we have 100% control over the Set-Cookie headers
      const response = NextResponse.json({ success: true })
      for (const header of clearSessionCookieHeaders()) {
        response.headers.append("Set-Cookie", header)
      }
      response.headers.append(
        "Set-Cookie",
        `${DEV_ROLE_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
      )
      return response
    } else {
      const response = NextResponse.next()
      response.cookies.set(DEV_ROLE_COOKIE, "", { path: "/", maxAge: 0 })
      return response
    }
  }

  // The cron route authenticates itself with CRON_SECRET.
  if (
    pathname === "/api/cron/sync-stores" ||
    pathname === "/api/auth/sso/callback" ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next()
  }

  // Resolve session once per request and branch by route intent.
  const cookieHeader = request.headers.get("cookie") || ""

  // better-auth first, then sso_session (lib/auth.ts resolveSession).
  const resolved = await resolveSession(request.headers)
  const userId = resolved?.data.user.id
  const isLoggedIn = Boolean(userId)

  const isGuestOnlyRoute = guestOnlyRoutes.has(pathname)

  if (isLoggedIn) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    const role = resolveRole(
      user?.role,
      request.cookies.get(DEV_ROLE_COOKIE)?.value
    )

    // GS only works in the monitoring portal, so every sparta page sends them there.
    const response =
      isGuestOnlyRoute || role === "GS"
        ? NextResponse.redirect(new URL(getHomeUrl(role), request.url))
        : NextResponse.next()
    // The portal only reads sso_session, so keep it on the session sparta resolved; otherwise
    // a stale cookie from an earlier login shows the portal a different user.
    const session = resolved?.data.session
    if (session && session.token !== readSsoSessionToken(cookieHeader)) {
      response.cookies.set(
        ssoSessionCookie(session.token, new Date(session.expiresAt))
      )
    }
    return response
  }

  if (!isGuestOnlyRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
