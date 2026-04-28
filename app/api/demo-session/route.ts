import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const DEMO_EMAIL = "demo@sparta.app"
const DEMO_PASSWORD = "demo-sparta-2025"
const DEMO_SESSION_HOURS = 1

export async function POST() {
  try {
    // Use better-auth's sign-in to issue a real session cookie for the demo user
    const response = await auth.api.signInEmail({
      body: {
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        callbackURL: "/dashboard",
      },
      asResponse: true,
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Demo user belum tersedia. Jalankan seed terlebih dahulu." },
        { status: 503 }
      )
    }

    // Shorten session TTL to 1 hour for demo accounts
    // Extract session token from Set-Cookie header
    const setCookieHeader = response.headers.get("set-cookie") ?? ""
    const tokenMatch = setCookieHeader.match(/better-auth\.session_token=([^;]+)/)
    if (tokenMatch?.[1]) {
      const rawToken = decodeURIComponent(tokenMatch[1])
      await prisma.session.updateMany({
        where: { token: rawToken },
        data: {
          expiresAt: new Date(Date.now() + DEMO_SESSION_HOURS * 60 * 60 * 1000),
        },
      })
    }

    // Forward all Set-Cookie headers from better-auth to the client, then redirect
    const redirect = NextResponse.redirect(
      new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    )

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        redirect.headers.append("Set-Cookie", value)
      }
    })

    return redirect
  } catch {
    return NextResponse.json({ error: "Gagal memulai sesi demo." }, { status: 500 })
  }
}
