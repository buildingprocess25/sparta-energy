import {
  CATEGORY_RECAP_SHEETS,
  isExportableCategory,
  statusSheet,
  type CategoryExportAudits,
  type ExportableCategory,
} from "@/lib/energy-audit-export"
import type { EnergyAuditExportFilters } from "@/lib/energy-audit-export-filters"
import {
  getEnergyAuditStatusRows,
  getHvacAuditsForExport,
  getLightingAuditsForExport,
} from "@/lib/energy-audit-queries"
import type { SheetData } from "@/lib/xlsx-sheet"

// Data per exportable category; the type forces an entry for every key of CATEGORY_RECAP_SHEETS.
const CATEGORY_EXPORT_LOADERS: {
  [Key in ExportableCategory]: (
    filters: EnergyAuditExportFilters
  ) => Promise<CategoryExportAudits[Key]>
} = {
  TATA_CAHAYA: (filters) => getLightingAuditsForExport(undefined, filters),
  TATA_UDARA_VENTILASI: (filters) => getHvacAuditsForExport(undefined, filters),
}

async function loadCategory<Key extends ExportableCategory>(
  key: Key,
  filters: EnergyAuditExportFilters
) {
  const audits = await CATEGORY_EXPORT_LOADERS[key](filters)
  return {
    sheets: CATEGORY_RECAP_SHEETS[key](audits),
    storeCodes: audits.map((audit) => audit.store.code),
  }
}

// The same sheets feed the preview and the downloaded file, so both always match.
export async function buildEnergyAuditRecap(
  filters: EnergyAuditExportFilters
): Promise<{
  sheets: SheetData[]
  storeCount: number
}> {
  const exportable = filters.categories.filter(isExportableCategory)
  const [statusRows, ...categories] = await Promise.all([
    getEnergyAuditStatusRows(filters),
    ...exportable.map((key) => loadCategory(key, filters)),
  ])

  return {
    sheets: [
      statusSheet(statusRows, filters.categories),
      ...categories.flatMap((result) => result.sheets),
    ],
    storeCount: new Set(categories.flatMap((result) => result.storeCodes)).size,
  }
}
