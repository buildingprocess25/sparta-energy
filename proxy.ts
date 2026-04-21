import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// Exact-match public routes
const publicExact = new Set(["/", "/login"])

// Prefix-match public routes
const publicPrefixes = ["/api/auth", "/_next", "/favicon.ico"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow exact-match public paths
  if (publicExact.has(pathname)) {
    return NextResponse.next()
  }

  // Allow prefix-match public paths
  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // Check session
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
