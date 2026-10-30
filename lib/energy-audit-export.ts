import type { EnergyAuditCategory } from "@prisma/client"

import { ENERGY_AUDIT_CATEGORIES } from "@/lib/energy-audit-categories"
import type {
  getEnergyAuditStatusRows,
  getHvacAuditsForExport,
  getLightingAuditsForExport,
} from "@/lib/energy-audit-queries"
import { hvacRecapSheets } from "@/lib/hvac-audit-export"
import { lightingRecapSheets } from "@/lib/lighting-audit-export"
import type { Cell, SheetData } from "@/lib/xlsx-sheet"

type StatusRow = Awaited<ReturnType<typeof getEnergyAuditStatusRows>>[number]

export type CategoryExportAudits = {
  TATA_CAHAYA: Awaited<ReturnType<typeof getLightingAuditsForExport>>
  TATA_UDARA_VENTILASI: Awaited<ReturnType<typeof getHvacAuditsForExport>>
}
export type ExportableCategory = keyof CategoryExportAudits

const STATUS_LABEL = { DRAFT: "Draf", COMPLETED: "Selesai" } as const

// Recap sheets per category. Opening a category means adding it here and to
// CATEGORY_EXPORT_LOADERS; a test fails while an available category is missing.
export const CATEGORY_RECAP_SHEETS: {
  [Key in ExportableCategory]: (
    audits: CategoryExportAudits[Key]
  ) => SheetData[]
} = {
  TATA_CAHAYA: lightingRecapSheets,
  TATA_UDARA_VENTILASI: hvacRecapSheets,
}

export function isExportableCategory(
  key: EnergyAuditCategory
): key is ExportableCategory {
  return key in CATEGORY_RECAP_SHEETS
}

// Overview of the chosen categories: one row per store visit (kalkulasi).
export function statusSheet(
  rows: StatusRow[],
  categories: EnergyAuditCategory[]
): SheetData {
  const chosen = ENERGY_AUDIT_CATEGORIES.filter((category) =>
    categories.includes(category.key)
  )
  return {
    name: "Status Kategori",
    rows: [
      [
        "Kode Toko",
        "Nama Toko",
        "Cabang",
        ...chosen.map((category) => category.label),
        "Kategori Selesai",
      ],
      ...rows.map((row): Cell[] => [
        row.store.code,
        row.store.name,
        row.store.branch,
        ...chosen.map((category) => {
          const status = row.statuses[category.key]
          return status ? STATUS_LABEL[status] : "Belum diperiksa"
        }),
        `${chosen.filter((category) => row.statuses[category.key] === "COMPLETED").length} dari ${chosen.length}`,
      ]),
    ],
  }
}
