import type { Prisma, RecommendationType } from "@prisma/client"

import { getAdminAuditDateWhere } from "@/lib/admin-audit-date-filter"
import { prisma } from "@/lib/prisma"

export type AdminAuditStatus = "hemat" | "boros"
export type AdminAuditRecommendation = RecommendationType
export type AdminAuditSortKey =
  | "auditDate"
  | "store"
  | "branch"
  | "auditor"
  | "status"
  | "std"
  | "actualPln"
  | "baseline"
  | "gap"
export type AdminAuditSortOrder = "asc" | "desc"

export type AdminAuditFilters = {
  q: string
  branch: string
  auditor: string
  year: string
  month: string
  status: AdminAuditStatus | "all"
  recommendation: AdminAuditRecommendation | "all"
  sort: AdminAuditSortKey
  order: AdminAuditSortOrder
}

export type AdminAuditRow = {
  id: string
  auditDate: string
  isBoros: boolean | null
  actualPln: number | null
  baseline: number | null
  std: number | null
  store: {
    code: string
    name: string
    branch: string | null
    type: string
  }
  auditor: {
    id: string
    fullName: string | null
    email: string
  }
  recommendations: Array<{
    type: RecommendationType
    title: string
  }>
}

export type AdminAuditAuditorOption = {
  id: string
  label: string
}

type RawBranchOption = {
  branch: string | null
}

type RawAuditorOption = {
  id: string
  fullName: string | null
  email: string
}

type RawYearOption = {
  year: string
}

type RawAdminAuditRow = {
  id: string
  auditDate: Date
  isBoros: boolean | null
  actualPln: { toString(): string } | string | number | null
  baseline: { toString(): string } | string | number | null
  std: { toString(): string } | string | number | null
  store: AdminAuditRow["store"]
  auditor: AdminAuditRow["auditor"]
  recommendations: AdminAuditRow["recommendations"]
}

const excludedBranchNames = [
  "DEMO",
  "Demo",
  "demo",
  "HEAD OFFICE",
  "Head Office",
  "head office",
]

export const adminAuditsPageSize = 20
export const defaultAdminAuditSort: AdminAuditSortKey = "auditDate"
export const defaultAdminAuditOrder: AdminAuditSortOrder = "desc"

const activeStoreFilter: Prisma.StoreWhereInput = {
  OR: [{ branch: null }, { branch: { notIn: excludedBranchNames } }],
}

const activeStoreWhereSql =
  "s.branch IS NULL OR lower(s.branch) NOT IN ('demo', 'head office')"

export function parseAdminAuditSort(
  value: string | null | undefined
): AdminAuditSortKey {
  if (
    value === "auditDate" ||
    value === "store" ||
    value === "branch" ||
    value === "auditor" ||
    value === "status" ||
    value === "std" ||
    value === "actualPln" ||
    value === "baseline" ||
    value === "gap"
  ) {
    return value
  }

  return defaultAdminAuditSort
}

export function parseAdminAuditOrder(
  value: string | null | undefined
): AdminAuditSortOrder {
  return value === "asc" || value === "desc" ? value : defaultAdminAuditOrder
}

function addAuditWhereAnd(
  where: Prisma.AuditWhereInput,
  condition: Prisma.AuditWhereInput
) {
  const current = where.AND
  const currentItems = Array.isArray(current)
    ? current
    : current
      ? [current]
      : []

  where.AND = [...currentItems, condition]
}

function getAdminAuditWhere(
  filters: AdminAuditFilters
): Prisma.AuditWhereInput {
  const where: Prisma.AuditWhereInput = {
    status: "COMPLETED",
    store: activeStoreFilter,
  }

  if (filters.q) {
    where.store = {
      AND: [
        activeStoreFilter,
        {
          OR: [
            { code: { contains: filters.q, mode: "insensitive" } },
            { name: { contains: filters.q, mode: "insensitive" } },
          ],
        },
      ],
    }
  }

  if (filters.branch !== "all") {
    where.store = {
      AND: [where.store as Prisma.StoreWhereInput, { branch: filters.branch }],
    }
  }

  if (filters.auditor !== "all") {
    where.auditorId = filters.auditor
  }

  if (filters.status !== "all") {
    where.isBoros = filters.status === "boros"
  }

  if (filters.recommendation !== "all") {
    where.recommendations = {
      some: {
        type: filters.recommendation,
      },
    }
  }

  const dateWhere = getAdminAuditDateWhere(filters.year, filters.month)

  if (dateWhere?.auditDate) {
    where.auditDate = dateWhere.auditDate
  } else if (dateWhere) {
    addAuditWhereAnd(where, dateWhere)
  }

  return where
}

function toNullableNumber(value: RawAdminAuditRow["actualPln"]) {
  if (value === null) return null
  return Number(value)
}

function serializeAudit(row: RawAdminAuditRow) {
  return {
    id: row.id,
    auditDate: row.auditDate.toISOString(),
    isBoros: row.isBoros,
    actualPln: toNullableNumber(row.actualPln),
    baseline: toNullableNumber(row.baseline),
    std: toNullableNumber(row.std),
    store: row.store,
    auditor: row.auditor,
    recommendations: row.recommendations.map((item) => ({
      type: item.type,
      title: item.title,
    })),
  } satisfies AdminAuditRow
}

function getDateRange(filters: AdminAuditFilters) {
  if (filters.year === "all") return null
  const year = Number(filters.year)
  if (!Number.isInteger(year)) return null

  if (filters.month !== "all") {
    const month = Number(filters.month)
    if (!Number.isInteger(month) || month < 1 || month > 12) return null
    return {
      start: new Date(year, month - 1, 1, 0, 0, 0, 0),
      end: new Date(year, month, 1, 0, 0, 0, 0),
    }
  }

  return {
    start: new Date(year, 0, 1, 0, 0, 0, 0),
    end: new Date(year + 1, 0, 1, 0, 0, 0, 0),
  }
}

function getAuditRowsWhereSql(filters: AdminAuditFilters, values: unknown[]) {
  const clauses = ["a.status = 'COMPLETED'", `(${activeStoreWhereSql})`]

  // TEMPORARY_HIDE_GAP_GT_30
  clauses.push(`(
    a.total_estimated_kwh_per_month IS NULL 
    OR a.total_estimated_kwh_per_month = 0 
    OR (a.avg_actual_pln_kwh_per_month - a.total_estimated_kwh_per_month) / a.total_estimated_kwh_per_month <= 0.3
  )`)

  if (filters.q) {
    values.push(`%${filters.q.toLowerCase()}%`)
    clauses.push(
      `(lower(s.code) LIKE $${values.length} OR lower(s.name) LIKE $${values.length})`
    )
  }

  if (filters.branch !== "all") {
    values.push(filters.branch)
    clauses.push(`s.branch = $${values.length}`)
  }

  if (filters.auditor !== "all") {
    values.push(filters.auditor)
    clauses.push(`a.auditor_id = $${values.length}::uuid`)
  }

  if (filters.status !== "all") {
    clauses.push(
      filters.status === "boros"
        ? "a.is_boros IS TRUE"
        : "a.is_boros IS NOT TRUE"
    )
  }

  if (filters.recommendation !== "all") {
    values.push(filters.recommendation)
    clauses.push(`EXISTS (
      SELECT 1
      FROM audit_recommendations ar_filter
      WHERE ar_filter.audit_id = a.id
        AND ar_filter.type = $${values.length}
    )`)
  }

  const dateRange = getDateRange(filters)
  if (dateRange) {
    values.push(dateRange.start)
    const startIndex = values.length
    values.push(dateRange.end)
    clauses.push(
      `a.audit_date >= $${startIndex} AND a.audit_date < $${values.length}`
    )
  }

  return `WHERE ${clauses.join(" AND ")}`
}

function getAuditRowsOrderBySql(filters: AdminAuditFilters) {
  const direction = filters.order === "asc" ? "ASC" : "DESC"
  const nulls = filters.order === "asc" ? "NULLS FIRST" : "NULLS LAST"
  const statusSql = `
    CASE
      WHEN a.is_boros IS TRUE THEN 1
      ELSE 0
    END ${direction}
  `

  const sortSqlByKey: Record<AdminAuditSortKey, string> = {
    auditDate: `a.audit_date ${direction}, a.created_at ${direction}`,
    store: `lower(s.code) ${direction}, lower(s.name) ${direction}`,
    branch: `lower(s.branch) ${direction} ${nulls}, lower(s.code) ASC`,
    auditor: `lower(coalesce(u.full_name, u.email)) ${direction}, lower(u.email) ${direction}`,
    status: `${statusSql}, a.audit_date DESC`,
    std: `std.avg_std ${direction} ${nulls}, a.audit_date DESC`,
    actualPln: `a.avg_actual_pln_kwh_per_month ${direction} ${nulls}, a.audit_date DESC`,
    baseline: `a.total_estimated_kwh_per_month ${direction} ${nulls}, a.audit_date DESC`,
    gap: `
      CASE
        WHEN a.total_estimated_kwh_per_month IS NULL
          OR a.total_estimated_kwh_per_month = 0
        THEN NULL
        ELSE (
          (a.avg_actual_pln_kwh_per_month - a.total_estimated_kwh_per_month)
          / a.total_estimated_kwh_per_month
        )
      END ${direction} ${nulls},
      a.audit_date DESC
    `,
  }

  return `ORDER BY ${sortSqlByKey[filters.sort]}, a.id ASC`
}

async function getAdminAuditRowsRaw({
  filters,
  offset,
  limit,
}: {
  filters: AdminAuditFilters
  offset: number
  limit: number
}) {
  const values: unknown[] = []
  const whereSql = getAuditRowsWhereSql(filters, values)
  const orderBySql = getAuditRowsOrderBySql(filters)

  values.push(limit)
  const limitIndex = values.length
  values.push(offset)
  const offsetIndex = values.length

  return prisma.$queryRawUnsafe<RawAdminAuditRow[]>(
    `
      SELECT
        a.id,
        a.audit_date AS "auditDate",
        a.is_boros AS "isBoros",
        a.avg_actual_pln_kwh_per_month AS "actualPln",
        a.total_estimated_kwh_per_month AS baseline,
        std.avg_std AS std,
        json_build_object(
          'code', s.code,
          'name', s.name,
          'branch', s.branch,
          'type', s.type
        ) AS store,
        json_build_object(
          'id', u.id,
          'fullName', u.full_name,
          'email', u.email
        ) AS auditor,
        COALESCE(recs.recommendations, '[]'::json) AS recommendations
      FROM audits a
      INNER JOIN stores s ON s.id = a.store_id
      INNER JOIN users u ON u.id = a.auditor_id
      LEFT JOIN LATERAL (
        SELECT AVG(h.sales_transaction_per_day) AS avg_std
        FROM audit_pln_std_history h
        WHERE h.audit_id = a.id
      ) std ON true
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object('type', ar.type, 'title', ar.title)
          ORDER BY ar.id ASC
        ) AS recommendations
        FROM audit_recommendations ar
        WHERE ar.audit_id = a.id
      ) recs ON true
      ${whereSql}
      ${orderBySql}
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `,
    ...values
  )
}

export async function getAdminAuditRows({
  filters,
  offset,
  limit = adminAuditsPageSize,
}: {
  filters: AdminAuditFilters
  offset: number
  limit?: number
}) {
  const rows = await getAdminAuditRowsRaw({
    filters,
    offset,
    limit: limit + 1,
  })

  return {
    rows: rows.slice(0, limit).map(serializeAudit),
    hasMore: rows.length > limit,
  }
}

export async function getAdminAuditCount(filters: AdminAuditFilters) {
  // TEMPORARY_HIDE_GAP_GT_30
  // Menggunakan queryRawUnsafe agar sinkron dengan getAdminAuditRowsRaw yang difilter gap > 30%
  const values: unknown[] = []
  const whereSql = getAuditRowsWhereSql(filters, values)
  const result = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`
    SELECT COUNT(*)::bigint AS count
    FROM audits a
    INNER JOIN stores s ON s.id = a.store_id
    INNER JOIN users u ON u.id = a.auditor_id
    ${whereSql}
  `, ...values)
  return Number(result[0]?.count ?? 0)
}

export async function getAdminAuditBranches() {
  const rows = await prisma.$queryRawUnsafe<RawBranchOption[]>(`
    SELECT DISTINCT trim(s.branch) AS branch
    FROM stores s
    WHERE s.branch IS NOT NULL
      AND trim(s.branch) <> ''
      AND ${activeStoreWhereSql}
    ORDER BY trim(s.branch) ASC
  `)

  return rows
    .map((row) => row.branch?.trim())
    .filter((item): item is string => Boolean(item))
}

export async function getAdminAuditAuditors() {
  const rows = await prisma.$queryRawUnsafe<RawAuditorOption[]>(`
    SELECT
      u.id,
      u.full_name AS "fullName",
      u.email
    FROM users u
    INNER JOIN audits a ON a.auditor_id = u.id
    INNER JOIN stores s ON s.id = a.store_id
    WHERE a.status = 'COMPLETED'
      AND (${activeStoreWhereSql})
    GROUP BY u.id, u.full_name, u.email
    ORDER BY lower(coalesce(u.full_name, u.email)) ASC, u.email ASC
  `)

  return rows.map((row) => ({
    id: row.id,
    label: row.fullName ? `${row.fullName} (${row.email})` : row.email,
  }))
}

export async function getAdminAuditYears() {
  const rows = await prisma.$queryRawUnsafe<RawYearOption[]>(`
    SELECT DISTINCT extract(year from a.audit_date)::int::text AS year
    FROM audits a
    INNER JOIN stores s ON s.id = a.store_id
    WHERE a.status = 'COMPLETED'
      AND (${activeStoreWhereSql})
    ORDER BY year DESC
  `)

  return rows.map((row) => row.year)
}
