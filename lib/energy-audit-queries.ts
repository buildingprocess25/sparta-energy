import {
  Prisma,
  type EnergyAuditCategory,
  type EnergyAuditStatus,
} from "@prisma/client"

import {
  activeStoreSql,
  isSangatBorosAudit,
  latestAuditPerStore,
  sangatBorosIdsSql,
} from "@/lib/audit-validation-queries"
import {
  AVAILABLE_ENERGY_AUDIT_CATEGORIES,
  toCategoryProgress,
  type CategoryStatusMap,
  type EnergyAuditCategoryProgress,
} from "@/lib/energy-audit-categories"
import {
  createAcUnit,
  createEmptyHvacAudit,
  sanitizeHvacAuditData,
  type ExhaustZoneKey,
  type HvacAuditData,
} from "@/lib/hvac-audit"
import {
  createEmptyLightingAudit,
  sanitizeLightingAuditData,
  type LightingAuditData,
  type LightingLamp,
  type LightingZoneKey,
} from "@/lib/lighting-audit"
import {
  exportDateRange,
  type EnergyAuditExportFilters,
} from "@/lib/energy-audit-export-filters"
import { prisma } from "@/lib/prisma"

export const ENERGY_AUDIT_PAGE_SIZE = 20

export type EnergyAuditListRow = {
  sourceAuditId: string
  storeCode: string
  storeName: string
  branch: string | null
  auditDate: string
  gapPercent: number | null
  isSangatBoros: boolean
  categories: EnergyAuditCategoryProgress[]
  completedCount: number
}

type RawListRow = {
  audit_id: string
  audit_date: Date
  store_code: string
  store_name: string
  branch: string | null
  gap_percent: unknown
  is_sangat_boros: boolean | null
  completed_count: number | null
  statuses: CategoryStatusMap | null
  total_count: bigint
}

const availableCategoryKeys = AVAILABLE_ENERGY_AUDIT_CATEGORIES.map(
  (category) => category.key as string
)

// Status of every category that has a form, per kalkulasi; joined LATERAL on latest l.
const categoryProgressSql = Prisma.sql`
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) FILTER (WHERE e.status = 'COMPLETED')::int AS completed_count,
      jsonb_object_agg(
        e.category::text,
        jsonb_build_object('status', e.status::text, 'summaryStatus', e.summary_status)
      ) AS statuses
    FROM energy_audits e
    WHERE e.source_audit_id = l.id
      AND e.category::text IN (${Prisma.join(availableCategoryKeys)})
  ) p ON true
`

const borosValidatedSql = Prisma.sql`l.is_boros = true AND l.validation_status = 'VALIDATED'`

// Candidates are stores whose latest kalkulasi is boros and already validated.
export async function getEnergyAuditCandidates({
  q,
  page,
}: {
  q: string
  page: number
}) {
  const conditions = [activeStoreSql, borosValidatedSql]
  if (q) {
    const pattern = `%${q}%`
    conditions.push(
      Prisma.sql`(s.name ILIKE ${pattern} OR s.code ILIKE ${pattern})`
    )
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
      (l.id IN (${sangatBorosIdsSql})) AS is_sangat_boros,
      p.completed_count,
      p.statuses,
      COUNT(*) OVER() AS total_count
    FROM latest l
    JOIN stores s ON s.id = l.store_id
    ${categoryProgressSql}
    WHERE ${Prisma.join(conditions, " AND ")}
    ORDER BY
      CASE WHEN COALESCE(p.completed_count, 0) >= ${availableCategoryKeys.length} THEN 1 ELSE 0 END,
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
        isSangatBoros: row.is_sangat_boros === true,
        categories: toCategoryProgress(row.statuses),
        completedCount: row.completed_count ?? 0,
      })
    ),
  }
}

// Stores that still have at least one available category left to finish.
export async function getEnergyAuditPendingCount() {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    ${latestAuditPerStore}
    SELECT COUNT(*) AS count
    FROM latest l
    JOIN stores s ON s.id = l.store_id
    ${categoryProgressSql}
    WHERE ${activeStoreSql}
      AND ${borosValidatedSql}
      AND COALESCE(p.completed_count, 0) < ${availableCategoryKeys.length}
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
      toiletAreaM2: true,
      corridorAreaM2: true,
      store: {
        select: {
          id: true,
          code: true,
          name: true,
          branch: true,
          address: true,
          latitude: true,
          longitude: true,
          salesAreaM2: true,
          parkingAreaM2: true,
          terraceAreaM2: true,
          warehouseAreaM2: true,
          toiletAreaM2: true,
          corridorAreaM2: true,
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

  if (
    !audit ||
    audit.status !== "COMPLETED" ||
    audit.validationStatus !== "VALIDATED"
  ) {
    return null
  }

  const isSangatBoros = await isSangatBorosAudit(audit.id)

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
      {
        status: EnergyAuditStatus
        summaryStatus: string | null
        updatedAt: string
      }
    >
  >

  return {
    sourceAuditId: audit.id,
    auditDate: audit.auditDate.toISOString(),
    isBoros: audit.isBoros === true,
    isSangatBoros,
    gapPercent: audit.gapPercent === null ? null : Number(audit.gapPercent),
    store: {
      id: audit.store.id,
      code: audit.store.code,
      name: audit.store.name,
      branch: audit.store.branch,
      address: audit.store.address,
      latitude: audit.store.latitude,
      longitude: audit.store.longitude,
    },
    areas: {
      sales: Number(audit.salesAreaM2 ?? audit.store.salesAreaM2),
      parkir: Number(audit.parkingAreaM2 ?? audit.store.parkingAreaM2),
      teras: Number(audit.terraceAreaM2 ?? audit.store.terraceAreaM2),
      gudang: Number(audit.warehouseAreaM2 ?? audit.store.warehouseAreaM2),
      toilet: Number(audit.toiletAreaM2 ?? audit.store.toiletAreaM2),
      selasar: Number(audit.corridorAreaM2 ?? audit.store.corridorAreaM2),
    },
    statusByCategory,
  }
}

export type EnergyAuditStore = NonNullable<
  Awaited<ReturnType<typeof getEnergyAuditStore>>
>

export type LampOption = {
  id: string
  name: string
  baseKw: number
  category: string
}

// Lighting types and brands from the equipment master, so auditors pick
// instead of typing; each brand carries its own power rating.
// Master equipment types and their brands, offered as picks in the audit forms.
async function getEquipmentOptions(
  deviceCategory: string
): Promise<LampOption[]> {
  const types = await prisma.equipmentType.findMany({
    where: { deviceCategory },
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
    getEquipmentOptions("Pencahayaan"),
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
    // Older stores keep gudang, toilet and selasar combined in gudang
    if (context.areas.toilet > 0 || context.areas.selasar > 0) {
      prefilledAreas.GUDANG = context.areas.gudang
      prefilledAreas.TOILET = context.areas.toilet
      prefilledAreas.SELASAR = context.areas.selasar
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
                (
                  item.customName ??
                  item.equipmentType?.name ??
                  "Lampu"
                ).replace(/\s*\[NOTE:.*?\]$/, ""),
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

export type LightingAuditForm = NonNullable<
  Awaited<ReturnType<typeof getLightingAuditForm>>
>

// Exhaust fans in the kalkulasi: the "(Chiller)" type sits in the machine room, the rest by area.
function exhaustZoneOf(item: {
  areaTarget: string
  equipmentType: { name: string } | null
}) {
  const name = item.equipmentType?.name ?? ""
  if (/chiller/i.test(name)) return "CHILLER"
  if (item.areaTarget === "WAREHOUSE") return "GUDANG"
  return null
}

export async function getHvacAuditForm(sourceAuditId: string) {
  const [context, saved, hvacItems, acOptions] = await Promise.all([
    getEnergyAuditStore(sourceAuditId),
    prisma.energyAudit.findUnique({
      where: {
        sourceAuditId_category: {
          sourceAuditId,
          category: "TATA_UDARA_VENTILASI",
        },
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
        OR: [
          { equipmentType: { deviceCategory: "Sistem HVAC" } },
          {
            equipmentType: {
              name: { contains: "Exhaust", mode: "insensitive" },
            },
          },
        ],
      },
      select: {
        qty: true,
        areaTarget: true,
        customName: true,
        brandName: true,
        baseKw: true,
        equipmentType: { select: { name: true, deviceCategory: true } },
      },
    }),
    getEquipmentOptions("Sistem HVAC"),
  ])

  if (!context) return null

  const acItems = hvacItems.filter(
    (item) => item.equipmentType?.deviceCategory === "Sistem HVAC"
  )
  const recordedAcUnits = acItems.reduce((sum, item) => sum + item.qty, 0)
  // One entry per physical unit, named like the master option so the picker shows it selected.
  const recordedAcUnitTypes = acItems.flatMap((item) =>
    Array.from({ length: item.qty }, () => ({
      type: [
        (item.customName ?? item.equipmentType?.name ?? "").replace(
          /\s*\[NOTE:.*?\]$/,
          ""
        ),
        item.brandName,
      ]
        .filter(Boolean)
        .join(" · "),
      ratedKw: Number(item.baseKw),
    }))
  )

  let data: HvacAuditData
  if (saved) {
    data = sanitizeHvacAuditData(saved.data)
  } else {
    // First open: prefill the AC count, areas and exhaust fans from the validated kalkulasi.
    const empty = createEmptyHvacAudit()
    const fansByZone: Partial<Record<ExhaustZoneKey, number>> = {}
    for (const item of hvacItems) {
      const zone = exhaustZoneOf(item)
      if (zone) fansByZone[zone] = (fansByZone[zone] ?? 0) + item.qty
    }
    const areaByZone: Partial<Record<ExhaustZoneKey, number>> = {
      GUDANG: context.areas.gudang,
      TOILET: context.areas.toilet,
    }
    data = {
      ...empty,
      latitude: context.store.latitude,
      longitude: context.store.longitude,
      salesAreaM2: context.areas.sales > 0 ? context.areas.sales : null,
      recordedAcUnits,
      installedAcUnits: recordedAcUnits > 0 ? recordedAcUnits : null,
      units: recordedAcUnitTypes.map((recorded, index) => ({
        ...createAcUnit(`ac-${index + 1}`, index),
        ...recorded,
      })),
      exhaust: empty.exhaust.map((zone) => ({
        ...zone,
        areaM2: areaByZone[zone.key] || null,
        fansInstalled: fansByZone[zone.key] ?? null,
      })),
    }
  }

  return {
    context,
    data,
    recordedAcUnits,
    acOptions,
    status: saved?.status ?? null,
    auditDate: (saved?.auditDate ?? new Date()).toISOString(),
    completedAt: saved?.completedAt?.toISOString() ?? null,
    updatedAt: saved?.updatedAt.toISOString() ?? null,
    auditor: saved ? (saved.auditor.fullName ?? saved.auditor.email) : null,
  }
}

export type HvacAuditForm = NonNullable<
  Awaited<ReturnType<typeof getHvacAuditForm>>
>

// Store, branch and date filters of the recap popup; the status filter is optional
// because the overview sheet shows drafts too.
function exportScopeWhere(
  filters: EnergyAuditExportFilters | undefined,
  { withStatus }: { withStatus: boolean }
): Prisma.EnergyAuditWhereInput {
  if (!filters) return {}
  const dates = exportDateRange(filters)
  return {
    ...(withStatus && filters.status === "completed"
      ? { status: "COMPLETED" }
      : {}),
    ...(dates ? { auditDate: dates } : {}),
    ...(filters.branches.length > 0 || filters.storeCodes.length > 0
      ? {
          store: {
            ...(filters.branches.length > 0
              ? { branch: { in: filters.branches } }
              : {}),
            ...(filters.storeCodes.length > 0
              ? { code: { in: filters.storeCodes } }
              : {}),
          },
        }
      : {}),
  }
}

export async function getEnergyAuditStatusRows(
  filters?: EnergyAuditExportFilters
) {
  const audits = await prisma.energyAudit.findMany({
    where: {
      ...exportScopeWhere(filters, { withStatus: false }),
      ...(filters ? { category: { in: filters.categories } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      sourceAuditId: true,
      category: true,
      status: true,
      store: { select: { id: true, code: true, name: true, branch: true } },
    },
  })

  // One row per store visit (kalkulasi); audits whose kalkulasi was deleted
  // are grouped by store instead.
  const rows = new Map<
    string,
    {
      store: { code: string; name: string; branch: string | null }
      statuses: Partial<Record<EnergyAuditCategory, EnergyAuditStatus>>
    }
  >()
  for (const audit of audits) {
    const key = audit.sourceAuditId ?? `store-${audit.store.id}`
    const row = rows.get(key) ?? { store: audit.store, statuses: {} }
    row.statuses[audit.category] ??= audit.status
    rows.set(key, row)
  }
  return Array.from(rows.values())
}

export async function getHvacAuditsForExport(
  sourceAuditId?: string,
  filters?: EnergyAuditExportFilters
) {
  const audits = await prisma.energyAudit.findMany({
    where: {
      category: "TATA_UDARA_VENTILASI",
      ...(sourceAuditId ? { sourceAuditId } : {}),
      ...exportScopeWhere(filters, { withStatus: true }),
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
    data: sanitizeHvacAuditData(audit.data),
  }))
}

export async function getLightingAuditsForExport(
  sourceAuditId?: string,
  filters?: EnergyAuditExportFilters
) {
  const audits = await prisma.energyAudit.findMany({
    where: {
      category: "TATA_CAHAYA",
      ...(sourceAuditId ? { sourceAuditId } : {}),
      ...exportScopeWhere(filters, { withStatus: true }),
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

// Branches and stores that have at least one inspection, for the recap popup filters.
export async function getEnergyAuditExportOptions() {
  const stores = await prisma.store.findMany({
    where: { energyAudits: { some: {} } },
    orderBy: [{ branch: "asc" }, { name: "asc" }],
    select: { code: true, name: true, branch: true },
  })
  const branches = Array.from(
    new Set(
      stores
        .map((store) => store.branch)
        .filter((branch): branch is string => Boolean(branch))
    )
  )
  return { branches, stores }
}

export type EnergyAuditExportOptions = Awaited<
  ReturnType<typeof getEnergyAuditExportOptions>
>
