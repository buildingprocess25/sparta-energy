import { headers } from "next/headers"
import { NextResponse } from "next/server"

import {
  adminAuditsPageSize,
  getAdminAuditRows,
  parseAdminAuditOrder,
  parseAdminAuditSort,
  type AdminAuditFilters,
  type AdminAuditRecommendation,
  type AdminAuditStatus,
} from "@/lib/admin-audit-queries"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function getFilter(searchParams: URLSearchParams, key: string) {
  return searchParams.get(key)?.trim() || "all"
}

function parseStatus(value: string | null): AdminAuditStatus | "all" {
  return value === "hemat" || value === "boros" ? value : "all"
}

function parseRecommendation(
  value: string | null
): AdminAuditRecommendation | "all" {
  if (value === "TRAINING" || value === "REPAIR" || value === "MAINTENANCE") {
    return value
  }

  return "all"
}

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  return user?.role === "ADMIN"
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0) || 0)
  const filters: AdminAuditFilters = {
    q: url.searchParams.get("q")?.trim() ?? "",
    branch: getFilter(url.searchParams, "branch"),
    auditor: getFilter(url.searchParams, "auditor"),
    year: getFilter(url.searchParams, "year"),
    month: getFilter(url.searchParams, "month"),
    status: parseStatus(url.searchParams.get("status")),
    recommendation: parseRecommendation(url.searchParams.get("recommendation")),
    sort: parseAdminAuditSort(url.searchParams.get("sort")),
    order: parseAdminAuditOrder(url.searchParams.get("order")),
  }

  const result = await getAdminAuditRows({
    filters,
    offset,
    limit: adminAuditsPageSize,
  })

  return NextResponse.json(result)
}
