import { Prisma, type EnergyAuditCategory, type EnergyAuditStatus } from "@prisma/client"

import {
  activeStoreSql,
  latestAuditPerStore,
} from "@/lib/audit-validation-queries"
import {
  createEmptyLightingAudit,
  sanitizeLightingAuditData,
  type LightingAuditData,
  type LightingLamp,
  type LightingZoneKey,
} from "@/lib/lighting-audit"
import { prisma } from "@/lib/prisma"

export const ENERGY_AUDIT_PAGE_SIZE = 20

export type EnergyAuditListRow = {
  sourceAuditId: string
  storeCode: string
  storeName: string
  branch: string | null
  auditDate: string
  gapPercent: number | null
  lightingStatus: EnergyAuditStatus | null
  lightingSummaryStatus: string | null
  lightingUpdatedAt: string | null
}

type RawListRow = {
  audit_id: string
  audit_date: Date
  store_code: string
  store_name: string
  branch: string | null
  gap_percent: unknown
  lighting_status: EnergyAuditStatus | null
  lighting_summary: string | null
  lighting_updated_at: Date | null
  total_count: bigint
}

// Candidates are stores whose latest kalkulasi is boros and already validated.
export async function getEnergyAuditCandidates({
  q,
  page,
}: {
  q: string
  page: number
}) {
  const conditions = [
    activeStoreSql,
    Prisma.sql`l.is_boros = true`,
    Prisma.sql`l.validation_status = 'VALIDATED'`,
  ]
  if (q) {
    const pattern = `%${q}%`
    conditions.push(Prisma.sql`(s.name ILIKE ${pattern} OR s.code ILIKE ${pattern})`)
  }
  const offset = (page - 1) * ENERGY_AUDIT_PAGE_SIZE

  const rows = await prisma.$queryRaw<RawListRow[]>`
    ${latestAuditPerStore}
    SELECT
      l.id AS audit_id,
      l.audit_date,
      s.code AS store_code,
      s.name AS store_name,
      s.branch,
      l.gap_percent,
      ea.status AS lighting_status,
      ea.summary_status AS lighting_summary,
      ea.updated_at AS lighting_updated_at,
      COUNT(*) OVER() AS total_count
    FROM latest l
    JOIN stores s ON s.id = l.store_id
    LEFT JOIN energy_audits ea
      ON ea.source_audit_id = l.id AND ea.category = 'TATA_CAHAYA'
    WHERE ${Prisma.join(conditions, " AND ")}
    ORDER BY
      CASE WHEN ea.status = 'COMPLETED' THEN 1 ELSE 0 END,
      l.gap_percent DESC NULLS LAST,
      s.name ASC
    LIMIT ${ENERGY_AUDIT_PAGE_SIZE} OFFSET ${offset}
  `

  return {
    total: rows.length > 0 ? Number(rows[0].total_count) : 0,
    rows: rows.map(
      (row): EnergyAuditListRow => ({
        sourceAuditId: row.audit_id,
        storeCode: row.store_code,
        storeName: row.store_name,
        branch: row.branch,
        auditDate: row.audit_date.toISOString(),
        gapPercent: row.gap_percent === null ? null : Number(row.gap_percent),
        lightingStatus: row.lighting_status,
        lightingSummaryStatus: row.lighting_summary,
        lightingUpdatedAt: row.lighting_updated_at?.toISOString() ?? null,
      })
    ),
  }
}

export async function getEnergyAuditPendingCount() {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    ${latestAuditPerStore}
    SELECT COUNT(*) AS count
    FROM latest l
    JOIN stores s ON s.id = l.store_id
    LEFT JOIN energy_audits ea
      ON ea.source_audit_id = l.id AND ea.category = 'TATA_CAHAYA'
    WHERE ${activeStoreSql}
      AND l.is_boros = true
      AND l.validation_status = 'VALIDATED'
      AND (ea.status IS NULL OR ea.status <> 'COMPLETED')
  `
  return Number(rows[0]?.count ?? 0)
}

const areaToZone: Record<string, LightingZoneKey> = {
  SALES: "SALES",
  PARKING: "PARKIRAN",
  TERRACE: "TERAS",
  WAREHOUSE: "GUDANG",
}

export async function getEnergyAuditStore(sourceAuditId: string) {
  const audit = await prisma.audit.findUnique({
    where: { id: sourceAuditId },
    select: {
      id: true,
      status: true,
      isBoros: true,
      validationStatus: true,
      auditDate: true,
      gapPercent: true,
      salesAreaM2: true,
      parkingAreaM2: true,
      terraceAreaM2: true,
      warehouseAreaM2: true,
      store: {
        select: {
          id: true,
          code: true,
          name: true,
          branch: true,
          address: true,
          salesAreaM2: true,
          parkingAreaM2: true,
          terraceAreaM2: true,
          warehouseAreaM2: true,
        },
      },
      energyAudits: {
        select: {
          category: true,
          status: true,
          summaryStatus: true,
          updatedAt: true,
        },
      },
    },
  })

  if (!audit || audit.status !== "COMPLETED" || audit.validationStatus !== "VALIDATED") {
    return null
  }

  const statusByCategory = Object.fromEntries(
    audit.energyAudits.map((entry) => [
      entry.category,
      {
        status: entry.status,
        summaryStatus: entry.summaryStatus,
        updatedAt: entry.updatedAt.toISOString(),
      },
    ])
  ) as Partial<
    Record<
      EnergyAuditCategory,
      { status: EnergyAuditStatus; summaryStatus: string | null; updatedAt: string }
    >
  >

  return {
    sourceAuditId: audit.id,
    auditDate: audit.auditDate.toISOString(),
    isBoros: audit.isBoros === true,
    gapPercent: audit.gapPercent === null ? null : Number(audit.gapPercent),
    store: {
      id: audit.store.id,
      code: audit.store.code,
      name: audit.store.name,
      branch: audit.store.branch,
      address: audit.store.address,
    },
    areas: {
      sales: Number(audit.salesAreaM2 ?? audit.store.salesAreaM2),
      parkir: Number(audit.parkingAreaM2 ?? audit.store.parkingAreaM2),
      teras: Number(audit.terraceAreaM2 ?? audit.store.terraceAreaM2),
      gudangGabungan: Number(audit.warehouseAreaM2 ?? audit.store.warehouseAreaM2),
    },
    statusByCategory,
  }
}

export type EnergyAuditStore = NonNullable<Awaited<ReturnType<typeof getEnergyAuditStore>>>

export type LampOption = {
  id: string
  name: string
  baseKw: number
  category: string
}

// Lighting types and brands from the equipment master, so auditors pick
// instead of typing; each brand carries its own power rating.
async function getLampOptions(): Promise<LampOption[]> {
  const types = await prisma.equipmentType.findMany({
    where: { deviceCategory: "Pencahayaan" },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      defaultKw: true,
      brands: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, baseKw: true },
      },
    },
  })

  return types.flatMap((type) => [
    {
      id: type.id,
      name: type.name,
      baseKw: Number(type.defaultKw),
      category: type.category,
    },
    ...type.brands.map((brand) => ({
      id: brand.id,
      name: `${type.name} · ${brand.name}`,
      baseKw: Number(brand.baseKw),
      category: type.category,
    })),
  ])
}

export async function getLightingAuditForm(sourceAuditId: string) {
  const [context, saved, lightingItems, lampOptions] = await Promise.all([
    getEnergyAuditStore(sourceAuditId),
    prisma.energyAudit.findUnique({
      where: {
        sourceAuditId_category: { sourceAuditId, category: "TATA_CAHAYA" },
      },
      select: {
        status: true,
        data: true,
        auditDate: true,
        completedAt: true,
        updatedAt: true,
        auditor: { select: { fullName: true, email: true } },
      },
    }),
    prisma.auditItem.findMany({
      where: {
        auditId: sourceAuditId,
        equipmentType: { deviceCategory: "Pencahayaan" },
      },
      select: {
        id: true,
        areaTarget: true,
        customName: true,
        brandName: true,
        qty: true,
        baseKw: true,
        equipmentType: { select: { name: true } },
      },
    }),
    getLampOptions(),
  ])

  if (!context) return null

  let data: LightingAuditData
  if (saved) {
    data = sanitizeLightingAuditData(saved.data)
  } else {
    // First open: prefill areas and lamps from the validated kalkulasi.
    const empty = createEmptyLightingAudit()
    const prefilledAreas: Partial<Record<LightingZoneKey, number>> = {
      SALES: context.areas.sales,
      PARKIRAN: context.areas.parkir,
      TERAS: context.areas.teras,
    }
    data = {
      ...empty,
      address: context.store.address ?? "",
      zones: empty.zones.map((zone) => ({
        ...zone,
        areaM2: prefilledAreas[zone.key] || null,
        lamps: lightingItems
          .filter((item) => areaToZone[item.areaTarget] === zone.key)
          .map(
            (item): LightingLamp => ({
              id: item.id,
              type: [
                (item.customName ?? item.equipmentType?.name ?? "Lampu").replace(
                  /\s*\[NOTE:.*?\]$/,
                  ""
                ),
                item.brandName,
              ]
                .filter(Boolean)
                .join(" · "),
              qty: item.qty,
              watt: Math.round(Number(item.baseKw) * 1000 * 100) / 100,
            })
          ),
      })),
    }
  }

  return {
    context,
    data,
    lampOptions,
    status: saved?.status ?? null,
    auditDate: (saved?.auditDate ?? new Date()).toISOString(),
    completedAt: saved?.completedAt?.toISOString() ?? null,
    updatedAt: saved?.updatedAt.toISOString() ?? null,
    auditor: saved ? (saved.auditor.fullName ?? saved.auditor.email) : null,
  }
}

export type LightingAuditForm = NonNullable<Awaited<ReturnType<typeof getLightingAuditForm>>>

export async function getLightingAuditsForExport(sourceAuditId?: string) {
  const audits = await prisma.energyAudit.findMany({
    where: {
      category: "TATA_CAHAYA",
      ...(sourceAuditId ? { sourceAuditId } : {}),
    },
    orderBy: [{ status: "desc" }, { auditDate: "desc" }],
    select: {
      status: true,
      auditDate: true,
      completedAt: true,
      data: true,
      auditor: { select: { fullName: true, email: true } },
      store: {
        select: { code: true, name: true, branch: true, address: true },
      },
    },
  })

  return audits.map((audit) => ({
    status: audit.status,
    auditDate: audit.auditDate,
    completedAt: audit.completedAt,
    auditor: audit.auditor.fullName ?? audit.auditor.email,
    store: audit.store,
    data: sanitizeLightingAuditData(audit.data),
  }))
}
