import { headers } from "next/headers"
import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

import {
  buildAdminReportDataset,
  getAdminReportFilter,
  parseAdminReportStatus,
  parseAdminReportType,
  parseMasterStoreExportFilters,
  type AdminReportColumn,
  type AdminReportDataset,
  type AdminReportFilters,
} from "@/lib/admin-report-queries"
import { auth } from "@/lib/auth"
import { getEffectiveRole } from "@/lib/current-role"
import { prisma } from "@/lib/prisma"
import { can } from "@/lib/role-access"

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  return can(await getEffectiveRole(user?.role), "adminPanel")
}

function getColumnWidths(dataset: AdminReportDataset) {
  const groupRows = new Set(dataset.groupRows)
  const dataRows = dataset.rows.filter((_, index) => !groupRows.has(index))
  return dataset.columns.map((column, index) => {
    const rowWidths = dataRows.slice(0, 200).map((row) => {
      const value = row[index]

      if (value instanceof Date) return 12
      return value === null ? 0 : String(value).length
    })

    return {
      wch: Math.min(Math.max(column.label.length, ...rowWidths, 10) + 2, 42),
    }
  })
}

function applyColumnFormats(
  worksheet: XLSX.WorkSheet,
  columns: AdminReportColumn[],
  rowCount: number
) {
  columns.forEach((column, columnIndex) => {
    for (let rowIndex = 1; rowIndex <= rowCount; rowIndex += 1) {
      const cellAddress = XLSX.utils.encode_cell({
        r: rowIndex,
        c: columnIndex,
      })
      const cell = worksheet[cellAddress]
      if (!cell) continue

      if (column.type === "date") cell.z = "dd mmm yyyy"
      if (column.type === "number") cell.z = "#,##0.00"
      if (column.type === "integer") cell.z = "#,##0"
      if (column.type === "kw") cell.z = "0.####################"
    }
  })
}

function buildWorkbookBuffer(dataset: AdminReportDataset) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(
    [dataset.columns.map((column) => column.label), ...dataset.rows],
    { cellDates: true }
  )

  worksheet["!cols"] = getColumnWidths(dataset)
  // Filter dropdowns are on when the file opens
  worksheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: dataset.rows.length, c: dataset.columns.length - 1 },
    }),
  }
  applyColumnFormats(worksheet, dataset.columns, dataset.rows.length)

  XLSX.utils.book_append_sheet(workbook, worksheet, dataset.sheetName)

  return XLSX.write(workbook, {
    bookType: "xlsx",
    cellDates: true,
    type: "buffer",
  }) as Buffer
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

  const master = parseMasterStoreExportFilters((key) =>
    url.searchParams.get(key)
  )
  const dataset = await buildAdminReportDataset({ report, filters, master })
  const buffer = buildWorkbookBuffer(dataset)

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${dataset.filename}"`,
    },
  })
}
