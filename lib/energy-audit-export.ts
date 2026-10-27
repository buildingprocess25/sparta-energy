import * as XLSX from "xlsx"

import { ENERGY_AUDIT_CATEGORIES } from "@/lib/energy-audit-categories"
import type {
  getEnergyAuditStatusRows,
  getLightingAuditsForExport,
} from "@/lib/energy-audit-queries"
import {
  appendLightingRecapSheets,
  appendSheet,
  toBuffer,
  type Cell,
} from "@/lib/lighting-audit-export"

type StatusRow = Awaited<ReturnType<typeof getEnergyAuditStatusRows>>[number]
type LightingAudit = Awaited<ReturnType<typeof getLightingAuditsForExport>>[number]

const STATUS_LABEL = { DRAFT: "Draf", COMPLETED: "Selesai" } as const

// One workbook for every inspection category: an overview sheet, then the
// sheets of each category that already has a form.
export function buildEnergyAuditRecapWorkbook({
  statusRows,
  lightingAudits,
}: {
  statusRows: StatusRow[]
  lightingAudits: LightingAudit[]
}) {
  const workbook = XLSX.utils.book_new()

  appendSheet(workbook, "Status Kategori", [
    [
      "Kode Toko",
      "Nama Toko",
      "Cabang",
      ...ENERGY_AUDIT_CATEGORIES.map((category) => category.label),
      "Kategori Selesai",
    ],
    ...statusRows.map((row): Cell[] => [
      row.store.code,
      row.store.name,
      row.store.branch,
      ...ENERGY_AUDIT_CATEGORIES.map((category) => {
        const status = row.statuses[category.key]
        if (status) return STATUS_LABEL[status]
        return category.available ? "Belum diperiksa" : "Form belum tersedia"
      }),
      `${Object.values(row.statuses).filter((status) => status === "COMPLETED").length} dari ${ENERGY_AUDIT_CATEGORIES.length}`,
    ]),
  ])

  appendLightingRecapSheets(workbook, lightingAudits)

  return toBuffer(workbook)
}
