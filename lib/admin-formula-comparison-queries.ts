import { compareAudit, type AuditComparison } from "@/lib/formula-comparison"
import { prisma } from "@/lib/prisma"

const EXCLUDED_BRANCHES = ["demo", "head office"]

// Latest completed audit per store, compared with the current equipment master.
export async function getFormulaComparisons(filters: { branch?: string | null } = {}) {
  const audits = await prisma.audit.findMany({
    where: {
      status: "COMPLETED",
      ...(filters.branch ? { store: { branch: filters.branch } } : {}),
    },
    orderBy: [{ auditDate: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      storeId: true,
      auditDate: true,
      validationStatus: true,
      avgActualPlnKwhPerMonth: true,
      store: { select: { code: true, name: true, branch: true } },
      items: {
        select: {
          id: true,
          customName: true,
          qty: true,
          operationalHours: true,
          baseKw: true,
          estimatedDailyKwh: true,
          usageCount: true,
          formulaVersion: true,
          storeHours: true,
          equipmentType: { select: { name: true, operationType: true, calcMethod: true, calcDuration: true } },
          equipmentBrand: {
            select: { runningKw: true, standbyKw: true, runningTimePct: true, standbyTimePct: true },
          },
        },
      },
    },
  })

  const seenStores = new Set<string>()
  const comparisons: AuditComparison[] = []
  for (const audit of audits) {
    if (seenStores.has(audit.storeId)) continue
    seenStores.add(audit.storeId)
    if (EXCLUDED_BRANCHES.includes((audit.store.branch ?? "").trim().toLowerCase())) continue

    comparisons.push(
      compareAudit({
        id: audit.id,
        storeCode: audit.store.code,
        storeName: audit.store.name,
        branch: audit.store.branch,
        auditDate: audit.auditDate,
        validationStatus: audit.validationStatus,
        actualPlnKwhPerMonth: Number(audit.avgActualPlnKwhPerMonth ?? 0),
        items: audit.items.map((item) => ({
          id: item.id,
          name: item.customName ?? item.equipmentType?.name ?? "Alat",
          qty: item.qty,
          operationalHours: Number(item.operationalHours),
          baseKw: Number(item.baseKw),
          estimatedDailyKwh: Number(item.estimatedDailyKwh),
          usageCount: item.usageCount,
          formulaVersion: item.formulaVersion,
          storeHours: item.storeHours === null ? null : Number(item.storeHours),
          type: item.equipmentType
            ? {
                operationType: item.equipmentType.operationType,
                calcMethod: item.equipmentType.calcMethod,
                calcDuration: item.equipmentType.calcDuration,
              }
            : null,
          brand: item.equipmentBrand
            ? {
                runningKw: Number(item.equipmentBrand.runningKw),
                standbyKw: Number(item.equipmentBrand.standbyKw),
                runningTimePct:
                  item.equipmentBrand.runningTimePct === null ? null : Number(item.equipmentBrand.runningTimePct),
                standbyTimePct:
                  item.equipmentBrand.standbyTimePct === null ? null : Number(item.equipmentBrand.standbyTimePct),
              }
            : null,
        })),
      })
    )
  }

  return comparisons.sort(
    (a, b) =>
      Number(b.statusChanged) - Number(a.statusChanged) ||
      (a.branch ?? "").localeCompare(b.branch ?? "") ||
      a.storeCode.localeCompare(b.storeCode)
  )
}
