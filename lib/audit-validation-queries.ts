import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export const TOP_BOROS_LIMIT = 12
export const VALIDATION_PAGE_SIZE = 20

export type ValidationView = "all" | "top"
export type ValidationResultFilter = "all" | "boros" | "hemat"
export type ValidationStatusFilter = "all" | "pending" | "validated"

export type ValidationListFilters = {
  view: ValidationView
  result: ValidationResultFilter
  status: ValidationStatusFilter
  q: string
  page: number
}

export type ValidationListRow = {
  auditId: string
  auditDate: string
  storeCode: string
  storeName: string
  branch: string | null
  isBoros: boolean
  isValidated: boolean
  actualKwhPerMonth: number
  baselineKwhPerMonth: number
  gapPercent: number | null
}

type RawValidationRow = {
  audit_id: string
  audit_date: Date
  store_code: string
  store_name: string
  branch: string | null
  is_boros: boolean | null
  validation_status: string
  actual_kwh: unknown
  baseline_kwh: unknown
  gap_percent: unknown
  total_count: bigint
}

type SearchParamValue = string | string[] | undefined

function firstValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value
}

export function parseValidationFilters(
  params: Record<string, SearchParamValue>
): ValidationListFilters {
  const view = firstValue(params.view)
  const result = firstValue(params.result)
  const status = firstValue(params.status)
  const page = Number(firstValue(params.page))

  return {
    view: view === "top" ? "top" : "all",
    result: result === "boros" || result === "hemat" ? result : "all",
    status: status === "pending" || status === "validated" ? status : "all",
    q: (firstValue(params.q) ?? "").trim().slice(0, 100),
    page: Number.isInteger(page) && page > 1 ? page : 1,
  }
}

// Each store is represented by its latest completed audit, so a validated
// store only needs checking again once a newer audit comes in.
const latestAuditPerStore = Prisma.sql`
  WITH latest AS (
    SELECT DISTINCT ON (a.store_id)
      a.id, a.store_id, a.audit_date, a.is_boros, a.validation_status,
      a.gap_percent, a.avg_actual_pln_kwh_per_month, a.total_estimated_kwh_per_month
    FROM audits a
    WHERE a.status = 'COMPLETED'
    ORDER BY a.store_id, a.audit_date DESC
  )
`

// DEMO stores stay visible in development so the flow can be tested on them.
const activeStoreSql =
  process.env.NODE_ENV === "production"
    ? Prisma.sql`(s.branch IS NULL OR lower(s.branch) NOT IN ('demo', 'head office'))`
    : Prisma.sql`(s.branch IS NULL OR lower(s.branch) <> 'head office')`

export async function getValidationAudits(filters: ValidationListFilters) {
  const conditions = [activeStoreSql]
  let limit = VALIDATION_PAGE_SIZE
  let offset = (filters.page - 1) * VALIDATION_PAGE_SIZE

  if (filters.view === "top") {
    conditions.push(
      Prisma.sql`l.is_boros = true`,
      Prisma.sql`l.validation_status = 'PENDING'`,
      Prisma.sql`l.gap_percent IS NOT NULL`
    )
    limit = TOP_BOROS_LIMIT
    offset = 0
  } else {
    if (filters.result === "boros") conditions.push(Prisma.sql`l.is_boros = true`)
    if (filters.result === "hemat") {
      conditions.push(Prisma.sql`l.is_boros IS DISTINCT FROM true`)
    }
    if (filters.status === "pending") {
      conditions.push(Prisma.sql`l.validation_status = 'PENDING'`)
    }
    if (filters.status === "validated") {
      conditions.push(Prisma.sql`l.validation_status = 'VALIDATED'`)
    }
    if (filters.q) {
      const pattern = `%${filters.q}%`
      conditions.push(
        Prisma.sql`(s.name ILIKE ${pattern} OR s.code ILIKE ${pattern})`
      )
    }
  }

  const rows = await prisma.$queryRaw<RawValidationRow[]>`
    ${latestAuditPerStore}
    SELECT
      l.id AS audit_id,
      l.audit_date,
      s.code AS store_code,
      s.name AS store_name,
      s.branch,
      l.is_boros,
      l.validation_status::text AS validation_status,
      l.avg_actual_pln_kwh_per_month AS actual_kwh,
      l.total_estimated_kwh_per_month AS baseline_kwh,
      l.gap_percent,
      COUNT(*) OVER() AS total_count
    FROM latest l
    JOIN stores s ON s.id = l.store_id
    WHERE ${Prisma.join(conditions, " AND ")}
    ORDER BY l.gap_percent DESC NULLS LAST, s.name ASC
    LIMIT ${limit} OFFSET ${offset}
  `

  return {
    total: rows.length > 0 ? Number(rows[0].total_count) : 0,
    rows: rows.map(
      (row): ValidationListRow => ({
        auditId: row.audit_id,
        auditDate: row.audit_date.toISOString(),
        storeCode: row.store_code,
        storeName: row.store_name,
        branch: row.branch,
        isBoros: row.is_boros === true,
        isValidated: row.validation_status === "VALIDATED",
        actualKwhPerMonth: Number(row.actual_kwh ?? 0),
        baselineKwhPerMonth: Number(row.baseline_kwh ?? 0),
        gapPercent: row.gap_percent === null ? null : Number(row.gap_percent),
      })
    ),
  }
}

export async function getPendingValidationCount() {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    ${latestAuditPerStore}
    SELECT COUNT(*) AS count
    FROM latest l
    JOIN stores s ON s.id = l.store_id
    WHERE ${activeStoreSql} AND l.validation_status = 'PENDING'
  `
  return Number(rows[0]?.count ?? 0)
}

export async function getValidationAudit(id: string) {
  const audit = await prisma.audit.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      isBoros: true,
      auditDate: true,
      totalEstimatedKwhPerMonth: true,
      avgActualPlnKwhPerMonth: true,
      gapPercent: true,
      validationStatus: true,
      validatedAt: true,
      validatedBy: { select: { fullName: true, email: true } },
      auditor: { select: { fullName: true, email: true } },
      store: {
        select: { code: true, name: true, branch: true, type: true },
      },
      items: {
        orderBy: [{ areaTarget: "asc" }, { customName: "asc" }],
        select: {
          id: true,
          areaTarget: true,
          customName: true,
          brandName: true,
          qty: true,
          operationalHours: true,
          baseKw: true,
          estimatedDailyKwh: true,
          usageCount: true,
          notes: true,
          equipmentTypeId: true,
          equipmentType: {
            select: { name: true, calcMethod: true, calcDuration: true },
          },
        },
      },
    },
  })

  if (!audit || audit.status !== "COMPLETED") return null

  return {
    id: audit.id,
    isBoros: audit.isBoros === true,
    auditDate: audit.auditDate.toISOString(),
    actualKwhPerMonth: Number(audit.avgActualPlnKwhPerMonth ?? 0),
    baselineKwhPerMonth: Number(audit.totalEstimatedKwhPerMonth ?? 0),
    gapPercent:
      audit.gapPercent === null ? null : Number(audit.gapPercent),
    isValidated: audit.validationStatus === "VALIDATED",
    validatedAt: audit.validatedAt?.toISOString() ?? null,
    validatedBy:
      audit.validatedBy?.fullName ?? audit.validatedBy?.email ?? null,
    auditor: audit.auditor.fullName ?? audit.auditor.email,
    store: audit.store,
    items: audit.items.map((item) => ({
      id: item.id,
      areaTarget: item.areaTarget,
      name: (item.customName ?? item.equipmentType?.name ?? "Alat tanpa nama")
        .replace(/\s*\[NOTE:.*?\]$/, ""),
      brandName: item.brandName,
      qty: item.qty,
      operationalHours: Number(item.operationalHours),
      baseKw: Number(item.baseKw),
      estimatedDailyKwh: Number(item.estimatedDailyKwh),
      usageCount: item.usageCount,
      notes: item.notes,
      equipmentTypeId: item.equipmentTypeId,
      calcMethod: item.equipmentType?.calcMethod ?? "STANDARD",
      calcDuration: item.equipmentType?.calcDuration ?? null,
    })),
  }
}

export type ValidationAudit = NonNullable<
  Awaited<ReturnType<typeof getValidationAudit>>
>
export type ValidationAuditItem = ValidationAudit["items"][number]
