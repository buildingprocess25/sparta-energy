import { headers } from "next/headers"
import { NextResponse } from "next/server"

import {
  buildAdminReportDataset,
  getAdminReportCounts,
  getAdminReportFilter,
  parseAdminReportStatus,
  parseAdminReportType,
  type AdminReportCellValue,
  type AdminReportFilters,
} from "@/lib/admin-report-queries"
import { auth } from "@/lib/auth"
import { getEffectiveRole } from "@/lib/current-role"
import { prisma } from "@/lib/prisma"
import { can } from "@/lib/role-access"

const previewLimit = 100

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  return can(await getEffectiveRole(user?.role), "adminPanel")
}

function serializeCell(value: AdminReportCellValue) {
  if (value instanceof Date) return value.toISOString()
  return value
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const report = parseAdminReportType(url.searchParams.get("report"))

  if (!report) {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 })
  }

  const filters: AdminReportFilters = {
    year: getAdminReportFilter(url.searchParams.get("year")),
    month: getAdminReportFilter(url.searchParams.get("month")),
    branch: getAdminReportFilter(url.searchParams.get("branch")),
    storeType: getAdminReportFilter(url.searchParams.get("storeType")),
    status: parseAdminReportStatus(url.searchParams.get("status")),
  }

  const [dataset, counts] = await Promise.all([
    buildAdminReportDataset({ report, filters, limit: previewLimit }),
    getAdminReportCounts(filters),
  ])

  return NextResponse.json({
    columns: dataset.columns,
    rows: dataset.rows.map((row) => row.map(serializeCell)),
    previewRows: dataset.rows.length,
    totalRows: counts[report],
  })
}
