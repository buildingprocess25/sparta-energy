import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const excludedBranchNames = [
  "DEMO",
  "Demo",
  "demo",
  "HEAD OFFICE",
  "Head Office",
  "head office",
]

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  return user?.role === "ADMIN"
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [branches, storeTypes, years] = await Promise.all([
    prisma.store.findMany({
      where: {
        branch: {
          not: null,
          notIn: excludedBranchNames,
        },
      },
      distinct: ["branch"],
      orderBy: { branch: "asc" },
      select: { branch: true },
    }),
    prisma.store.findMany({
      where: {
        type: { not: "" },
        branch: {
          notIn: excludedBranchNames,
        },
      },
      distinct: ["type"],
      orderBy: { type: "asc" },
      select: { type: true },
    }),
    prisma.$queryRaw<Array<{ year: number }>>`
      SELECT DISTINCT EXTRACT(YEAR FROM audit_date)::int AS year
      FROM audits
      WHERE status = 'COMPLETED'
      ORDER BY year DESC
    `,
  ])

  return NextResponse.json({
    branches: branches
      .map((item) => item.branch?.trim())
      .filter((item): item is string => Boolean(item)),
    storeTypes: storeTypes
      .map((item) => item.type?.trim())
      .filter((item): item is string => Boolean(item)),
    years: years.map((item) => String(item.year)),
  })
}
