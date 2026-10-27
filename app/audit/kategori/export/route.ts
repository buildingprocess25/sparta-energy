import { NextResponse } from "next/server"

import { getAuditValidator } from "@/lib/audit-validation-access"
import { buildEnergyAuditRecapWorkbook } from "@/lib/energy-audit-export"
import {
  getEnergyAuditStatusRows,
  getLightingAuditsForExport,
} from "@/lib/energy-audit-queries"

export async function GET() {
  if (!(await getAuditValidator())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [statusRows, lightingAudits] = await Promise.all([
    getEnergyAuditStatusRows(),
    getLightingAuditsForExport(),
  ])
  const buffer = buildEnergyAuditRecapWorkbook({ statusRows, lightingAudits })
  const date = new Date().toISOString().slice(0, 10)

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="rekap-pemeriksaan-energi-${date}.xlsx"`,
    },
  })
}
