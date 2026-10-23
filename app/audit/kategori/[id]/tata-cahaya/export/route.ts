import { NextResponse } from "next/server"

import { getAuditValidator } from "@/lib/audit-validation-access"
import { getLightingAuditsForExport } from "@/lib/energy-audit-queries"
import { buildLightingAuditWorkbook } from "@/lib/lighting-audit-export"

type Context = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Context) {
  if (!(await getAuditValidator())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const [audit] = await getLightingAuditsForExport(id)
  if (!audit) {
    return NextResponse.json(
      { error: "Pemeriksaan tata cahaya untuk toko ini belum disimpan." },
      { status: 404 }
    )
  }

  const date = audit.auditDate.toISOString().slice(0, 10)
  const buffer = buildLightingAuditWorkbook(audit)

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pemeriksaan-tata-cahaya-${audit.store.code}-${date}.xlsx"`,
    },
  })
}
