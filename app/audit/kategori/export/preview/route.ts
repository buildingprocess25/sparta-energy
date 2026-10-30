import { NextResponse } from "next/server"

import { getAuditValidator } from "@/lib/audit-validation-access"
import { buildEnergyAuditRecap } from "@/lib/energy-audit-export-data"
import { parseExportFilters } from "@/lib/energy-audit-export-filters"
import { toSheetPreview } from "@/lib/xlsx-sheet"

const PREVIEW_ROWS = 20

export async function GET(request: Request) {
  if (!(await getAuditValidator())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const filters = parseExportFilters(new URL(request.url).searchParams)
  const { sheets, storeCount } = await buildEnergyAuditRecap(filters)

  return NextResponse.json({
    storeCount,
    sheets: sheets.map((sheet) => toSheetPreview(sheet, PREVIEW_ROWS)),
  })
}
