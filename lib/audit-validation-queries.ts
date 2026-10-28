import { Prisma } from "@prisma/client"

import { getAuditGapFilterWhereSql } from "@/lib/audit-gap-filter"
import type { ValidationListFilters } from "@/lib/audit-validation-filters"
import { prisma } from "@/lib/prisma"

export const VALIDATION_PAGE_SIZE = 20

export type ValidationListRow = {
  rank: number
  auditId: string
  auditDate: string
  storeCode: string
  storeName: string
  branch: string | null
  isBoros: boolean
  isSangatBoros: boolean
  isValidated: boolean
  actualKwhPerMonth: number
  baselineKwhPerMonth: number
  gapPercent: number | null
}

type RawValidationRow = {
  rank: bigint
  audit_id: string
  audit_date: Date
  store_code: string
  store_name: string
  branch: string | null
  is_boros: boolean | null
  is_sangat_boros: boolean | null
  validation_status: string
  actual_kwh: unknown
  baseline_kwh: unknown
  gap_percent: unknown
  total_count: bigint
}

// Each store is represented by its latest completed audit, so a validated
// store only needs checking again once a newer audit comes in.
export const latestAuditPerStore = Prisma.sql`
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
export const activeStoreSql =
  process.env.NODE_ENV === "production"
    ? Prisma.sql`(s.branch IS NULL OR lower(s.branch) NOT IN ('demo', 'head office'))`
    : Prisma.sql`(s.branch IS NULL OR lower(s.branch) <> 'head office')`

// "Sangat boros" comes from the v_toko_sangat_boros view, the same source the
// smart-energy-monitoring portal reads, so both apps flag the same stores.
export const sangatBorosIdsSql = Prisma.sql`SELECT audit_id FROM v_toko_sangat_boros`

export async function isSangatBorosAudit(auditId: string) {
  const rows = await prisma.$queryRaw<{ flag: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM v_toko_sangat_boros WHERE audit_id = ${auditId}::uuid
    ) AS flag
  `
  return rows[0]?.flag === true
}

export async function getValidationAudits(filters: ValidationListFilters) {
  const conditions = [activeStoreSql]
  const limit = VALIDATION_PAGE_SIZE
  const offset = (filters.page - 1) * VALIDATION_PAGE_SIZE

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
  if (filters.gap !== "all") {
    const insideGap = Prisma.raw(
      getAuditGapFilterWhereSql("l", true) ?? "false"
    )
    conditions.push(
      filters.gap === "inside"
        ? insideGap
        : Prisma.sql`NOT COALESCE(${insideGap}, false)`
    )
  }
  if (filters.q) {
    const pattern = `%${filters.q}%`
    conditions.push(
      Prisma.sql`(s.name ILIKE ${pattern} OR s.code ILIKE ${pattern})`
    )
  }

  // Rank over every active store before filtering, so #1 stays the most boros store in any filter.
  const rows = await prisma.$queryRaw<RawValidationRow[]>`
    ${latestAuditPerStore},
    ranked AS (
      SELECT
        l.id,
        ROW_NUMBER() OVER (ORDER BY l.gap_percent DESC NULLS LAST, s.name ASC) AS rank
      FROM latest l
      JOIN stores s ON s.id = l.store_id
      WHERE ${activeStoreSql}
    )
    SELECT
      r.rank,
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
      (l.id IN (${sangatBorosIdsSql})) AS is_sangat_boros,
      COUNT(*) OVER() AS total_count
    FROM latest l
    JOIN stores s ON s.id = l.store_id
    JOIN ranked r ON r.id = l.id
    WHERE ${Prisma.join(conditions, " AND ")}
    ORDER BY r.rank
    LIMIT ${limit} OFFSET ${offset}
  `

  return {
    total: rows.length > 0 ? Number(rows[0].total_count) : 0,
    rows: rows.map(
      (row): ValidationListRow => ({
        rank: Number(row.rank),
        auditId: row.audit_id,
        auditDate: row.audit_date.toISOString(),
        storeCode: row.store_code,
        storeName: row.store_name,
        branch: row.branch,
        isBoros: row.is_boros === true,
        isSangatBoros: row.is_sangat_boros === true,
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
      storeId: true,
      status: true,
      isBoros: true,
      auditDate: true,
      totalEstimatedKwhPerMonth: true,
      avgActualPlnKwhPerMonth: true,
      gapPercent: true,
      validationStatus: true,
      validatedAt: true,
      storeType: true,
      plnPowerVa: true,
      salesAreaM2: true,
      parkingAreaM2: true,
      terraceAreaM2: true,
      warehouseAreaM2: true,
      toiletAreaM2: true,
      corridorAreaM2: true,
      is24Hours: true,
      openTime: true,
      closeTime: true,
      originalIsBoros: true,
      originalTotalEstimatedKwhPerMonth: true,
      originalAvgActualPlnKwhPerMonth: true,
      validatedBy: { select: { fullName: true, email: true } },
      auditor: { select: { fullName: true, email: true } },
      plnHistory: {
        orderBy: { monthIdx: "asc" },
        select: {
          id: true,
          billingMonth: true,
          plnUsageKwh: true,
          salesTransactionPerDay: true,
        },
      },
      corrections: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          type: true,
          summary: true,
          createdAt: true,
          validator: { select: { fullName: true, email: true } },
        },
      },
      store: {
        select: {
          code: true,
          name: true,
          branch: true,
          address: true,
          type: true,
          plnPowerVa: true,
          salesAreaM2: true,
          parkingAreaM2: true,
          terraceAreaM2: true,
          warehouseAreaM2: true,
          toiletAreaM2: true,
          corridorAreaM2: true,
          is24Hours: true,
          openTime: true,
          closeTime: true,
        },
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

  const [latest, previous, isSangatBoros] = await Promise.all([
    prisma.audit.findFirst({
      where: { storeId: audit.storeId, status: "COMPLETED" },
      orderBy: { auditDate: "desc" },
      select: { id: true },
    }),
    prisma.audit.findFirst({
      where: {
        storeId: audit.storeId,
        status: "COMPLETED",
        auditDate: { lt: audit.auditDate },
      },
      orderBy: { auditDate: "desc" },
      select: {
        auditDate: true,
        items: {
          select: {
            areaTarget: true,
            customName: true,
            equipmentTypeId: true,
            qty: true,
          },
        },
      },
    }),
    isSangatBorosAudit(audit.id),
  ])

  return {
    id: audit.id,
    isLatest: latest?.id === audit.id,
    isSangatBoros,
    previousAudit: previous
      ? {
          auditDate: previous.auditDate.toISOString(),
          items: previous.items.map((item) => ({
            areaTarget: item.areaTarget,
            name: (item.customName ?? "").replace(/\s*\[NOTE:.*?\]$/, ""),
            equipmentTypeId: item.equipmentTypeId,
            qty: item.qty,
          })),
        }
      : null,
    isBoros: audit.isBoros === true,
    auditDate: audit.auditDate.toISOString(),
    actualKwhPerMonth: Number(audit.avgActualPlnKwhPerMonth ?? 0),
    baselineKwhPerMonth: Number(audit.totalEstimatedKwhPerMonth ?? 0),
    gapPercent: audit.gapPercent === null ? null : Number(audit.gapPercent),
    isValidated: audit.validationStatus === "VALIDATED",
    validatedAt: audit.validatedAt?.toISOString() ?? null,
    validatedBy:
      audit.validatedBy?.fullName ?? audit.validatedBy?.email ?? null,
    auditor: audit.auditor.fullName ?? audit.auditor.email,
    // Null until a validator changes something; then it holds the store's own result.
    original:
      audit.originalTotalEstimatedKwhPerMonth === null
        ? null
        : {
            isBoros: audit.originalIsBoros === true,
            baselineKwhPerMonth: Number(
              audit.originalTotalEstimatedKwhPerMonth
            ),
            actualKwhPerMonth: Number(
              audit.originalAvgActualPlnKwhPerMonth ?? 0
            ),
          },
    corrections: audit.corrections.map((correction) => ({
      id: correction.id,
      type: correction.type,
      summary: correction.summary,
      createdAt: correction.createdAt.toISOString(),
      validator:
        correction.validator?.fullName ?? correction.validator?.email ?? null,
    })),
    plnHistory: audit.plnHistory.map((row) => ({
      id: row.id,
      billingMonth: row.billingMonth,
      plnUsageKwh: Number(row.plnUsageKwh),
      salesTransactionPerDay: Number(row.salesTransactionPerDay),
    })),
    store: {
      code: audit.store.code,
      name: audit.store.name,
      branch: audit.store.branch,
      address: audit.store.address ?? "",
    },
    // Audits saved before the technical columns existed fall back to the store row.
    technical: {
      storeType: audit.storeType ?? (audit.store.type || null),
      plnPowerVa: audit.plnPowerVa ?? audit.store.plnPowerVa,
      areas: {
        sales: Number(audit.salesAreaM2 ?? audit.store.salesAreaM2),
        parkir: Number(audit.parkingAreaM2 ?? audit.store.parkingAreaM2),
        teras: Number(audit.terraceAreaM2 ?? audit.store.terraceAreaM2),
        gudang: Number(audit.warehouseAreaM2 ?? audit.store.warehouseAreaM2),
        toilet: Number(audit.toiletAreaM2 ?? audit.store.toiletAreaM2),
        selasar: Number(audit.corridorAreaM2 ?? audit.store.corridorAreaM2),
      },
      is24Hours: audit.is24Hours ?? audit.store.is24Hours,
      openTime: audit.openTime ?? audit.store.openTime,
      closeTime: audit.closeTime ?? audit.store.closeTime,
    },
    items: audit.items.map((item) => ({
      id: item.id,
      areaTarget: item.areaTarget,
      name: (
        item.customName ??
        item.equipmentType?.name ??
        "Alat tanpa nama"
      ).replace(/\s*\[NOTE:.*?\]$/, ""),
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
export type ValidationTechnical = ValidationAudit["technical"]
export type ValidationPlnRow = ValidationAudit["plnHistory"][number]
export type ValidationCorrection = ValidationAudit["corrections"][number]
