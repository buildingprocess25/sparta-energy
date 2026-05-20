import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Guest-only routes: accessible only when not logged in.
const guestOnlyRoutes = new Set(["/", "/login"])

// Prefix-match public routes
const publicPrefixes = [
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/assets",
  "/demo",
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow prefix-match public paths
  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // Resolve session once per request and branch by route intent.
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  const isLoggedIn = Boolean(session?.user)
  const isGuestOnlyRoute = guestOnlyRoutes.has(pathname)

  if (isGuestOnlyRoute && isLoggedIn) {
    const user = await prisma.user.findUnique({
      where: { id: session?.user.id },
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
