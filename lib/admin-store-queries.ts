import { prisma } from "@/lib/prisma"

export type StoreStatus = "hemat" | "boros" | "not-audited"
export type AdminStoreSortKey =
  | "store"
  | "branch"
  | "type"
  | "status"
  | "auditDate"
  | "std"
  | "actualPln"
  | "baseline"
  | "gap"
export type SortOrder = "asc" | "desc"

export type AdminStoreRow = {
  id: string
  code: string
  name: string
  branch: string | null
  type: string
  latest_audit_id: string | null
  latest_audit_date: string | null
  is_boros: boolean | null
  actual_pln: number | null
  baseline: number | null
  std: number | null
}

export type StoreStats = {
  total_stores: number | bigint
  audited_stores: number | bigint
  hemat_stores: number | bigint
  boros_stores: number | bigint
}

export type AdminStoreFilters = {
  q: string
  branch: string
  status: StoreStatus | "all"
  type: string
  sort: AdminStoreSortKey
  order: SortOrder
}

type CountRow = {
  total_rows: number | bigint
}

type BranchRow = {
  branch: string
}

type StoreTypeRow = {
  type: string
}

type RawAdminStoreRow = Omit<
  AdminStoreRow,
  "latest_audit_date" | "actual_pln" | "baseline" | "std"
> & {
  latest_audit_date: Date | string | null
  actual_pln: { toString(): string } | string | number | null
  baseline: { toString(): string } | string | number | null
  std: { toString(): string } | string | number | null
}

const activeStoreWhereSql =
  "s.branch IS NULL OR lower(s.branch) NOT IN ('demo', 'head office')"

export const adminStoresPageSize = 20

export const defaultAdminStoreSort: AdminStoreSortKey = "auditDate"
export const defaultAdminStoreOrder: SortOrder = "desc"

export function parseAdminStoreSort(value: string | null | undefined) {
  if (
    value === "store" ||
    value === "branch" ||
    value === "type" ||
    value === "status" ||
    value === "auditDate" ||
    value === "std" ||
    value === "actualPln" ||
    value === "baseline" ||
    value === "gap"
  ) {
    return value
  }

  return defaultAdminStoreSort
}

export function parseSortOrder(value: string | null | undefined): SortOrder {
  return value === "asc" || value === "desc" ? value : defaultAdminStoreOrder
}

function toNullableNumber(value: RawAdminStoreRow["actual_pln"]) {
  if (value === null) return null
  return Number(value)
}

function serializeStoreRow(row: RawAdminStoreRow): AdminStoreRow {
  return {
    ...row,
    latest_audit_date: row.latest_audit_date
      ? new Date(row.latest_audit_date).toISOString()
      : null,
    actual_pln: toNullableNumber(row.actual_pln),
    baseline: toNullableNumber(row.baseline),
    std: toNullableNumber(row.std),
  }
}

function latestAuditCte() {
  return `
    WITH latest_audits AS (
      SELECT *
      FROM (
        SELECT
          a.id,
          a.store_id,
          a.audit_date,
          a.is_boros,
          a.total_estimated_kwh_per_month,
          a.avg_actual_pln_kwh_per_month,
          (
            SELECT AVG(h.sales_transaction_per_day)
            FROM audit_pln_std_history h
            WHERE h.audit_id = a.id
          ) AS std,
          ROW_NUMBER() OVER (
            PARTITION BY a.store_id
            ORDER BY a.audit_date DESC, a.created_at DESC
          ) AS rn
        FROM audits a
        WHERE a.status = 'COMPLETED'
          -- TEMPORARY_HIDE_GAP_GT_30
          AND (
            a.total_estimated_kwh_per_month IS NULL 
            OR a.total_estimated_kwh_per_month = 0 
            OR (a.avg_actual_pln_kwh_per_month - a.total_estimated_kwh_per_month) / a.total_estimated_kwh_per_month <= 0.3
          )
      ) ranked
      WHERE ranked.rn = 1
    )
  `
}

function getFilteredWhereSql({
  filters,
  values,
}: {
  filters: AdminStoreFilters
  values: unknown[]
}) {
  const clauses = [`(${activeStoreWhereSql})`]

  if (filters.q) {
    values.push(`%${filters.q.toLowerCase()}%`)
    const index = values.length
    clauses.push(
      `(lower(s.code) LIKE $${index} OR lower(s.name) LIKE $${index})`
    )
  }

  if (filters.branch !== "all") {
    const branches = filters.branch.split(",").map((b) => b.trim()).filter(Boolean)
    if (branches.length > 0) {
      const placeholders = branches.map((b) => {
        values.push(b)
        return `$${values.length}`
      })
      clauses.push(`s.branch IN (${placeholders.join(", ")})`)
    }
  }

  if (filters.type !== "all") {
    const types = filters.type.split(",").map((t) => t.trim()).filter(Boolean)
    if (types.length > 0) {
      const placeholders = types.map((t) => {
        values.push(t)
        return `$${values.length}`
      })
      clauses.push(`s.type IN (${placeholders.join(", ")})`)
    }
  }

  if (filters.status === "hemat") {
    clauses.push("la.id IS NOT NULL AND la.is_boros IS NOT TRUE")
  } else if (filters.status === "boros") {
    clauses.push("la.is_boros IS TRUE")
  } else if (filters.status === "not-audited") {
    clauses.push("la.id IS NULL")
  }

  return `WHERE ${clauses.join(" AND ")}`
}

function getOrderBySql(filters: AdminStoreFilters) {
  const direction = filters.order === "asc" ? "ASC" : "DESC"
  const nulls = filters.order === "asc" ? "NULLS FIRST" : "NULLS LAST"
  const auditedFirstSql = "CASE WHEN la.id IS NULL THEN 1 ELSE 0 END ASC"
  const statusSql = `
    CASE
      WHEN la.id IS NULL THEN 2
      WHEN la.is_boros IS TRUE THEN 1
      ELSE 0
    END ${direction}
  `

  const sortSqlByKey: Record<AdminStoreSortKey, string> = {
    store: `lower(s.code) ${direction}, lower(s.name) ${direction}`,
    branch: `lower(s.branch) ${direction} ${nulls}, lower(s.code) ASC`,
    type: `lower(s.type) ${direction}, lower(s.code) ASC`,
    status: `${statusSql}, la.audit_date DESC NULLS LAST`,
    auditDate: `la.audit_date ${direction} ${nulls}, s.code ASC`,
    std: `la.std ${direction} ${nulls}, s.code ASC`,
    actualPln: `la.avg_actual_pln_kwh_per_month ${direction} ${nulls}, s.code ASC`,
    baseline: `la.total_estimated_kwh_per_month ${direction} ${nulls}, s.code ASC`,
    gap: `
      CASE
        WHEN la.total_estimated_kwh_per_month IS NULL
          OR la.total_estimated_kwh_per_month = 0
        THEN NULL
        ELSE (
          (la.avg_actual_pln_kwh_per_month - la.total_estimated_kwh_per_month)
          / la.total_estimated_kwh_per_month
        )
      END ${direction} ${nulls},
      s.code ASC
    `,
  }

  if (filters.sort === "status") {
    return `ORDER BY ${sortSqlByKey.status}, s.code ASC`
  }

  if (filters.sort === "auditDate") {
    return `ORDER BY ${auditedFirstSql}, ${sortSqlByKey.auditDate}`
  }

  return `ORDER BY ${auditedFirstSql}, ${sortSqlByKey[filters.sort]}, la.audit_date DESC NULLS LAST`
}

export async function getAdminStoreStats() {
  const rows = await prisma.$queryRawUnsafe<StoreStats[]>(`
    ${latestAuditCte()}
    SELECT
      COUNT(*)::int AS total_stores,
      COUNT(la.id)::int AS audited_stores,
      COUNT(*) FILTER (WHERE la.id IS NOT NULL AND la.is_boros IS NOT TRUE)::int AS hemat_stores,
      COUNT(*) FILTER (WHERE la.is_boros IS TRUE)::int AS boros_stores
    FROM stores s
    LEFT JOIN latest_audits la ON la.store_id = s.id
    WHERE ${activeStoreWhereSql}
  `)

  return rows[0]
}

export async function getAdminStoreBranches() {
  const rows = await prisma.$queryRawUnsafe<BranchRow[]>(`
    SELECT DISTINCT trim(branch) AS branch
    FROM stores s
    WHERE branch IS NOT NULL
      AND trim(branch) <> ''
      AND ${activeStoreWhereSql}
    ORDER BY trim(branch) ASC
  `)

  return rows.map((row) => row.branch)
}

export async function getAdminStoreTypes() {
  const rows = await prisma.$queryRawUnsafe<StoreTypeRow[]>(`
    SELECT DISTINCT trim(type) AS type
    FROM stores s
    WHERE type IS NOT NULL
      AND trim(type) <> ''
      AND ${activeStoreWhereSql}
    ORDER BY trim(type) ASC
  `)

  return rows.map((row) => row.type)
}

export async function getAdminStoreCount(filters: AdminStoreFilters) {
  const values: unknown[] = []
  const whereSql = getFilteredWhereSql({ filters, values })
  const rows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
      ${latestAuditCte()}
      SELECT COUNT(*)::int AS total_rows
      FROM stores s
      LEFT JOIN latest_audits la ON la.store_id = s.id
      ${whereSql}
    `,
    ...values
  )

  return Number(rows[0]?.total_rows ?? 0)
}

export async function getAdminStoreRows({
  filters,
  offset,
  limit = adminStoresPageSize,
}: {
  filters: AdminStoreFilters
  offset: number
  limit?: number
}) {
  const values: unknown[] = []
  const whereSql = getFilteredWhereSql({ filters, values })
  const orderBySql = getOrderBySql(filters)

  values.push(limit + 1)
  const limitIndex = values.length
  values.push(offset)
  const offsetIndex = values.length

  const rows = await prisma.$queryRawUnsafe<RawAdminStoreRow[]>(
    `
      ${latestAuditCte()}
      SELECT
        s.id,
        s.code,
        s.name,
        s.branch,
        s.type,
        la.id AS latest_audit_id,
        la.audit_date AS latest_audit_date,
        la.is_boros,
        la.avg_actual_pln_kwh_per_month AS actual_pln,
        la.total_estimated_kwh_per_month AS baseline,
        la.std
      FROM stores s
      LEFT JOIN latest_audits la ON la.store_id = s.id
      ${whereSql}
      ${orderBySql}
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `,
    ...values
  )

  return {
    rows: rows.slice(0, limit).map(serializeStoreRow),
    hasMore: rows.length > limit,
  }
}
