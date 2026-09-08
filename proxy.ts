import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Guest-only routes: accessible only when not logged in.
const guestOnlyRoutes = new Set(["/", "/login"])

const publicPrefixes = [
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/assets",
  "/ac-estimation",
  "/demo",
  "/manifest.json",
  "/sw.js",
  "/workbox-"
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Intercept /api/auth/get-session for client-side useSession() fallback
  if (pathname === "/api/auth/get-session") {
    const cookieHeader = request.headers.get("cookie") || ""
    const hasSsoCookie = cookieHeader.includes("sso_session=")
    if (hasSsoCookie) {
      const ssoMatch = cookieHeader.match(/sso_session=([^;]+)/)
      if (ssoMatch) {
        const ssoToken = ssoMatch[1]
        const dbSession = await prisma.session.findUnique({
          where: { token: ssoToken },
          include: { user: true }
        })
        if (dbSession && dbSession.expiresAt > new Date()) {
          console.log("[Proxy] Intercepted get-session and returning sso_session from DB")
          return NextResponse.json({
            session: dbSession,
            user: dbSession.user
          })
        }
      }
    }
  }
  // Intercept /api/auth/sign-out to clear the fallback sso_session cookie
  if (pathname === "/api/auth/sign-out") {
    console.log("[Proxy] Hit /api/auth/sign-out")
    const cookieHeader = request.headers.get("cookie") || ""
    const ssoMatch = cookieHeader.match(/sso_session=([^;]+)/)
    if (ssoMatch) {
      const ssoToken = ssoMatch[1]
      try {
        await prisma.session.deleteMany({
          where: { token: ssoToken }
        })
        console.log("[Proxy] Deleted SSO session from DB on sign-out")
      } catch (e) {
        console.error("[Proxy] Failed to delete SSO session:", e)
      }

      // Short-circuit the response so we have 100% control over the Set-Cookie headers
      const response = NextResponse.json({ success: true })
      response.headers.append("Set-Cookie", "sso_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT")
      response.headers.append("Set-Cookie", "better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT")
      return response
    } else {
      console.log("[Proxy] No sso_session cookie found during sign-out")
      return NextResponse.next()
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
  const hasSessionCookie = cookieHeader.includes("better-auth.session_token")
  console.log(`[Proxy] ${pathname} - hasCookie:${hasSessionCookie}`)

  const hasSsoCookie = cookieHeader.includes("sso_session=")

  let betterAuthSession = await auth.api.getSession({
    headers: request.headers,
  })

  let userId = betterAuthSession?.user?.id

  // If better-auth fails but we have sso_session, look it up in DB
  if (!userId && hasSsoCookie) {
    const ssoMatch = cookieHeader.match(/sso_session=([^;]+)/)
    if (ssoMatch) {
      const ssoToken = ssoMatch[1]
      const dbSession = await prisma.session.findUnique({
        where: { token: ssoToken },
        select: { userId: true, expiresAt: true }
      })
      if (dbSession && dbSession.expiresAt > new Date()) {
        userId = dbSession.userId
      }
    }
  }

  const isLoggedIn = Boolean(userId)
  console.log(`[Proxy] ${pathname} - isLoggedIn:${isLoggedIn}, secret:${process.env.BETTER_AUTH_SECRET ? 'present' : 'MISSING'}`)

  const isGuestOnlyRoute = guestOnlyRoutes.has(pathname)

  if (isGuestOnlyRoute && isLoggedIn) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    const dashboardUrl = new URL(
      user?.role === "ADMIN" ? "/admin-entry" : "/dashboard",
      request.url
    )
    return NextResponse.redirect(dashboardUrl)
  }

  if (!isGuestOnlyRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
