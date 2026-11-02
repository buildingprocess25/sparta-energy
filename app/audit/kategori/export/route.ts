import { NextResponse } from "next/server"

import { getAuditValidator } from "@/lib/audit-validation-access"
import { buildEnergyAuditRecap } from "@/lib/energy-audit-export-data"
import {
  exportFileName,
  parseExportFilters,
} from "@/lib/energy-audit-export-filters"
import { buildWorkbook } from "@/lib/xlsx-sheet"

// Without query parameters this still exports every category, store and status.
export async function GET(request: Request) {
  if (!(await getAuditValidator())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const filters = parseExportFilters(new URL(request.url).searchParams)
  const { sheets } = await buildEnergyAuditRecap(filters)
  const today = new Date().toISOString().slice(0, 10)

  return new Response(new Uint8Array(buildWorkbook(sheets)), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${exportFileName(filters, today)}"`,
    },
  })
}
