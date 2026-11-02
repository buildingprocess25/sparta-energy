import { NextResponse } from "next/server"
import { getAuditValidator } from "@/lib/audit-validation-access"
import { getHvacAuditsForExport } from "@/lib/energy-audit-queries"
import { hvacStoreSheets } from "@/lib/hvac-audit-export"
import { buildWorkbook } from "@/lib/xlsx-sheet"

type Context = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Context) {
  if (!(await getAuditValidator())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const [audit] = await getHvacAuditsForExport(id)
  if (!audit) {
    return NextResponse.json(
      { error: "Pemeriksaan tata udara untuk toko ini belum disimpan." },
      { status: 404 }
    )
  }

  const buffer = buildWorkbook(hvacStoreSheets(audit))
  const date = audit.auditDate.toISOString().slice(0, 10)

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pemeriksaan-tata-udara-${audit.store.code}-${date}.xlsx"`,
    },
  })
}
