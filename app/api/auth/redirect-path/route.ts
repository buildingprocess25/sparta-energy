import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { getEffectiveRole } from "@/lib/current-role"
import { prisma } from "@/lib/prisma"
import { getHomeUrl } from "@/lib/role-access"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return NextResponse.json({ redirectTo: "/login" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  return NextResponse.json({
    redirectTo: getHomeUrl(await getEffectiveRole(user?.role)),
  })
}
