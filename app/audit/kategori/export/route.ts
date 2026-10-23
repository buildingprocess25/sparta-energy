import { NextResponse } from "next/server"

import { getAuditValidator } from "@/lib/audit-validation-access"
import { getLightingAuditsForExport } from "@/lib/energy-audit-queries"
import { buildLightingRecapWorkbook } from "@/lib/lighting-audit-export"

export async function GET() {
  if (!(await getAuditValidator())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const audits = await getLightingAuditsForExport()
  const buffer = buildLightingRecapWorkbook(audits)
  const date = new Date().toISOString().slice(0, 10)

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="rekap-pemeriksaan-tata-cahaya-${date}.xlsx"`,
    },
  })
}
