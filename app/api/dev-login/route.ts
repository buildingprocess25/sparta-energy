import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import type { Role } from "@prisma/client"

import { DEV_ROLE_COOKIE, getHomeUrl, isRole } from "@/lib/role-access"

const SESSION_MAX_AGE = 7 * 24 * 60 * 60

// Body { "role": "ADMIN" | "AUDITOR" | "GS" | "AREA" | "USER" }; missing body means ADMIN.
async function readSimulatedRole(request: Request): Promise<Role | null> {
  try {
    const body = (await request.json()) as { role?: unknown }
    return isRole(body.role) ? body.role : null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  // Dual-guard: strictly prohibit execution outside local development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Dev login hanya diizinkan pada environment development lokal." },
      { status: 403 }
    )
  }

  try {
    const simulatedRole = await readSimulatedRole(request)
    const targetEmail = process.env.DEV_ADMIN_EMAIL || "admin@energy.sparta"

    // 1. Find the target user or fallback to first available ADMIN
    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
    })

    if (!user) {
      // Fallback to first available ADMIN if specific email not found
      user = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      })
    }

    if (!user) {
      // If still not found, fallback to any user
      user = await prisma.user.findFirst()
    }

    if (!user) {
      return NextResponse.json(
        { error: "Tidak ada akun user di database untuk login." },
        { status: 404 }
      )
    }

    // 2. Generate unique session token
    const sessionToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)

    // 3. Create session row in DB
    await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        token: sessionToken,
        userId: user.id,
        expiresAt,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1",
        userAgent: request.headers.get("user-agent") || "Local Dev Bypass",
      },
    })

    console.log(`[Dev-Login] Sesi lokal berhasil dibuat untuk user: ${user.email} (${user.role})`)

    // ADMIN means "no simulation", so the stored role of the dev account applies.
    const devRole = simulatedRole && simulatedRole !== "ADMIN" ? simulatedRole : null
    const role = devRole ?? user.role
    const response = NextResponse.json({
      success: true,
      email: user.email,
      role,
      redirectTo: getHomeUrl(role),
    })

    // 4. Set session cookies for both SSO fallback and better-auth
    const isProduction = (process.env.NODE_ENV as string) === "production"

    response.cookies.set("sso_session", sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    response.cookies.set("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    if (devRole) {
      response.cookies.set(DEV_ROLE_COOKIE, devRole, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      })
    } else {
      response.cookies.set(DEV_ROLE_COOKIE, "", { path: "/", maxAge: 0 })
    }

    return response
  } catch (error) {
    console.error("[Dev-Login] Error:", error)
    return NextResponse.json(
      { error: "Gagal membuat sesi dev login." },
      { status: 500 }
    )
  }
}
