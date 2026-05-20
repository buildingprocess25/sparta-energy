import { prisma } from "@/lib/prisma"

export type EquipmentArea = "PARKING" | "TERRACE" | "SALES" | "WAREHOUSE"
export type AdminEquipmentSortKey =
  | "dailyKwh"
  | "qty"
  | "equipment"
  | "brand"
  | "area"
  | "store"
  | "branch"
  | "auditDate"
export type AdminEquipmentSortOrder = "asc" | "desc"

export type AdminEquipmentFilters = {
  q: string
  branch: string
  area: EquipmentArea | "all"
  equipment: string
  brand: string
  sort: AdminEquipmentSortKey
  order: AdminEquipmentSortOrder
}

export type AdminEquipmentRow = {
  id: string
  auditId: string
  auditDate: string
  equipmentName: string
  brandName: string
  area: EquipmentArea
  qty: number
  operationalHours: number
  baseKw: number
  estimatedDailyKwh: number
  store: {
    id: string
    code: string
    name: string
    branch: string | null
    type: string
  }
}

export type AdminEquipmentSummary = {
  totalItems: number
  totalQty: number
  totalDailyKwh: number
  auditedStores: number
  topArea: string
  topEquipment: string
  topBrand: string
}

export type AdminEquipmentBreakdownRow = {
  key: string
  label: string
  qty: number
  dailyKwh: number
}

type CountRow = {
  total_rows: number | bigint
}

type SummaryRow = {
  total_items: number | bigint | null
  total_qty: number | bigint | null
  total_daily_kwh: { toString(): string } | string | number | null
  audited_stores: number | bigint | null
}

type OptionRow = {
  value: string | null
}

type RawEquipmentRow = {
  id: string
  audit_id: string
  audit_date: Date | string
  equipment_name: string | null
  brand_name: string | null
  area: EquipmentArea
  qty: number
  operational_hours: { toString(): string } | string | number
  base_kw: { toString(): string } | string | number
  estimated_daily_kwh: { toString(): string } | string | number
  store_code: string
  store_id: string
  store_name: string
  branch: string | null
  store_type: string
}

type RawBreakdownRow = {
  key: string
  label: string
  qty: number | bigint | null
  daily_kwh: { toString(): string } | string | number | null
}

const activeStoreWhereSql =
  "s.branch IS NULL OR lower(s.branch) NOT IN ('demo', 'head office')"

const equipmentNameSql =
  "COALESCE(NULLIF(et.name, ''), NULLIF(ai.custom_name, ''), 'Equipment')"
const brandNameSql =
  "COALESCE(NULLIF(eb.name, ''), NULLIF(ai.brand_name, ''), 'Tanpa merek')"

export const adminEquipmentPageSize = 25
export const defaultAdminEquipmentSort: AdminEquipmentSortKey = "dailyKwh"
export const defaultAdminEquipmentOrder: AdminEquipmentSortOrder = "desc"

export function parseAdminEquipmentSort(
  value: string | null | undefined
): AdminEquipmentSortKey {
  if (
    value === "dailyKwh" ||
    value === "qty" ||
    value === "equipment" ||
    value === "brand" ||
    value === "area" ||
    value === "store" ||
    value === "branch" ||
    value === "auditDate"
  ) {
    return value
  }

  return defaultAdminEquipmentSort
}

export function parseAdminEquipmentOrder(
  value: string | null | undefined
): AdminEquipmentSortOrder {
  return value === "asc" || value === "desc"
    ? value
    : defaultAdminEquipmentOrder
}

function toNumber(value: SummaryRow["total_daily_kwh"]) {
  if (value === null || value === undefined) return 0
  return Number(value)
}

function getFilteredWhereSql({
  filters,
  values,
}: {
  filters: AdminEquipmentFilters
  values: unknown[]
}) {
  const clauses = [`a.status = 'COMPLETED'`, `(${activeStoreWhereSql})`]

  if (filters.q) {
    values.push(`%${filters.q.toLowerCase()}%`)
    const index = values.length
    clauses.push(`(
      lower(s.code) LIKE $${index}
      OR lower(s.name) LIKE $${index}
      OR lower(${equipmentNameSql}) LIKE $${index}
      OR lower(${brandNameSql}) LIKE $${index}
    )`)
  }

  if (filters.branch !== "all") {
    values.push(filters.branch)
    clauses.push(`s.branch = $${values.length}`)
  }

  if (filters.area !== "all") {
    values.push(filters.area)
    clauses.push(`ai.area_target::text = $${values.length}`)
  }

  if (filters.equipment !== "all") {
    values.push(filters.equipment)
    clauses.push(`${equipmentNameSql} = $${values.length}`)
  }

  if (filters.brand !== "all") {
    values.push(filters.brand)
    clauses.push(`${brandNameSql} = $${values.length}`)
  }

  return `WHERE ${clauses.join(" AND ")}`
}

function getBaseFromSql() {
  return `
    FROM audit_items ai
    JOIN audits a ON a.id = ai.audit_id
    JOIN stores s ON s.id = a.store_id
    LEFT JOIN equipment_types et ON et.id = ai.equipment_type_id
    LEFT JOIN equipment_brands eb ON eb.id = ai.equipment_brand_id
  `
}

function getOrderBySql(filters: AdminEquipmentFilters) {
  const direction = filters.order === "asc" ? "ASC" : "DESC"
  const nulls = filters.order === "asc" ? "NULLS FIRST" : "NULLS LAST"

  const sortSqlByKey: Record<AdminEquipmentSortKey, string> = {
    dailyKwh: `ai.estimated_daily_kwh ${direction} ${nulls}, a.audit_date DESC, s.code ASC`,
    qty: `ai.qty ${direction}, ai.estimated_daily_kwh DESC, s.code ASC`,
    equipment: `lower(${equipmentNameSql}) ${direction}, ai.estimated_daily_kwh DESC`,
    brand: `lower(${brandNameSql}) ${direction}, ai.estimated_daily_kwh DESC`,
    area: `ai.area_target::text ${direction}, ai.estimated_daily_kwh DESC`,
    store: `lower(s.code) ${direction}, lower(s.name) ${direction}`,
    branch: `lower(s.branch) ${direction} ${nulls}, lower(s.code) ASC`,
    auditDate: `a.audit_date ${direction}, ai.estimated_daily_kwh DESC`,
  }

  return `ORDER BY ${sortSqlByKey[filters.sort]}`
}

function serializeEquipmentRow(row: RawEquipmentRow): AdminEquipmentRow {
  return {
      id: row.id,
    auditId: row.audit_id,
    auditDate: new Date(row.audit_date).toISOString(),
    equipmentName: row.equipment_name ?? "Equipment",
    brandName: row.brand_name ?? "Tanpa merek",
    area: row.area,
    qty: row.qty,
    operationalHours: Number(row.operational_hours),
    baseKw: Number(row.base_kw),
    estimatedDailyKwh: Number(row.estimated_daily_kwh),
    store: {
      id: row.store_id,
      code: row.store_code,
      name: row.store_name,
      branch: row.branch,
      type: row.store_type,
    },
  }
}

function serializeBreakdownRow(row: RawBreakdownRow): AdminEquipmentBreakdownRow {
  return {
    key: row.key,
    label: row.label,
    qty: Number(row.qty ?? 0),
    dailyKwh: toNumber(row.daily_kwh),
  }
}

export async function getAdminEquipmentCount(filters: AdminEquipmentFilters) {
  const values: unknown[] = []
  const whereSql = getFilteredWhereSql({ filters, values })
  const rows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
      SELECT COUNT(*)::int AS total_rows
      ${getBaseFromSql()}
      ${whereSql}
    `,
    ...values
  )

  return Number(rows[0]?.total_rows ?? 0)
}

export async function getAdminEquipmentSummary(
  filters: AdminEquipmentFilters
): Promise<AdminEquipmentSummary> {
  const values: unknown[] = []
  const whereSql = getFilteredWhereSql({ filters, values })
  const rows = await prisma.$queryRawUnsafe<SummaryRow[]>(
    `
      SELECT
        COUNT(ai.id)::int AS total_items,
        COALESCE(SUM(ai.qty), 0)::int AS total_qty,
        COALESCE(SUM(ai.estimated_daily_kwh), 0) AS total_daily_kwh,
        COUNT(DISTINCT s.id)::int AS audited_stores
      ${getBaseFromSql()}
      ${whereSql}
    `,
    ...values
  )

  const row = rows[0]

  return {
    totalItems: Number(row?.total_items ?? 0),
    totalQty: Number(row?.total_qty ?? 0),
    totalDailyKwh: toNumber(row?.total_daily_kwh ?? null),
    auditedStores: Number(row?.audited_stores ?? 0),
    topArea: "-",
    topEquipment: "-",
    topBrand: "-",
  }
}

export async function getAdminEquipmentRows({
  filters,
  offset,
  limit = adminEquipmentPageSize,
}: {
  filters: AdminEquipmentFilters
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

  const rows = await prisma.$queryRawUnsafe<RawEquipmentRow[]>(
    `
      SELECT
        ai.id,
        ai.audit_id,
        a.audit_date,
        ${equipmentNameSql} AS equipment_name,
        ${brandNameSql} AS brand_name,
        ai.area_target::text AS area,
        ai.qty,
        ai.operational_hours,
        ai.base_kw,
        ai.estimated_daily_kwh,
        s.code AS store_code,
        s.id AS store_id,
        s.name AS store_name,
        s.branch,
        s.type AS store_type
      ${getBaseFromSql()}
      ${whereSql}
      ${orderBySql}
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `,
    ...values
  )

  return {
    rows: rows.slice(0, limit).map(serializeEquipmentRow),
    hasMore: rows.length > limit,
  }
}

export async function getAdminEquipmentBranches() {
  const rows = await prisma.$queryRawUnsafe<OptionRow[]>(`
    SELECT DISTINCT trim(s.branch) AS value
    FROM stores s
    WHERE s.branch IS NOT NULL
      AND trim(s.branch) <> ''
      AND ${activeStoreWhereSql}
    ORDER BY trim(s.branch) ASC
  `)

  return rows
    .map((row) => row.value?.trim())
    .filter((item): item is string => Boolean(item))
}

export async function getAdminEquipmentTypes() {
  const rows = await prisma.$queryRawUnsafe<OptionRow[]>(`
    SELECT DISTINCT ${equipmentNameSql} AS value
    ${getBaseFromSql()}
    WHERE a.status = 'COMPLETED'
      AND (${activeStoreWhereSql})
    ORDER BY ${equipmentNameSql} ASC
  `)

  return rows
    .map((row) => row.value?.trim())
    .filter((item): item is string => Boolean(item))
}

export async function getAdminEquipmentBrands() {
  const rows = await prisma.$queryRawUnsafe<OptionRow[]>(`
    SELECT DISTINCT ${brandNameSql} AS value
    ${getBaseFromSql()}
    WHERE a.status = 'COMPLETED'
      AND (${activeStoreWhereSql})
    ORDER BY ${brandNameSql} ASC
  `)

  return rows
    .map((row) => row.value?.trim())
    .filter((item): item is string => Boolean(item))
}

export async function getAdminEquipmentAreaBreakdown(
  filters: AdminEquipmentFilters,
  limit = 4
) {
  const values: unknown[] = []
  const whereSql = getFilteredWhereSql({ filters, values })
  values.push(limit)
  const limitIndex = values.length

  const rows = await prisma.$queryRawUnsafe<RawBreakdownRow[]>(
    `
      SELECT
        ai.area_target::text AS key,
        CASE ai.area_target::text
          WHEN 'SALES' THEN 'Sales'
          WHEN 'PARKING' THEN 'Parkir'
          WHEN 'TERRACE' THEN 'Teras'
          WHEN 'WAREHOUSE' THEN 'Gudang'
          ELSE ai.area_target::text
        END AS label,
        COALESCE(SUM(ai.qty), 0)::int AS qty,
        COALESCE(SUM(ai.estimated_daily_kwh), 0) AS daily_kwh
      ${getBaseFromSql()}
      ${whereSql}
      GROUP BY ai.area_target
      ORDER BY daily_kwh DESC
      LIMIT $${limitIndex}
    `,
    ...values
  )

  return rows.map(serializeBreakdownRow)
}

export async function getAdminEquipmentTypeBreakdown(
  filters: AdminEquipmentFilters,
  limit = 8
) {
  const values: unknown[] = []
  const whereSql = getFilteredWhereSql({ filters, values })
  values.push(limit)
  const limitIndex = values.length

  const rows = await prisma.$queryRawUnsafe<RawBreakdownRow[]>(
    `
      SELECT
        ${equipmentNameSql} AS key,
        ${equipmentNameSql} AS label,
        COALESCE(SUM(ai.qty), 0)::int AS qty,
        COALESCE(SUM(ai.estimated_daily_kwh), 0) AS daily_kwh
      ${getBaseFromSql()}
      ${whereSql}
      GROUP BY ${equipmentNameSql}
      ORDER BY daily_kwh DESC
      LIMIT $${limitIndex}
    `,
    ...values
  )

  return rows.map(serializeBreakdownRow)
}

export async function getAdminEquipmentBrandBreakdown(
  filters: AdminEquipmentFilters,
  limit = 8
) {
  const values: unknown[] = []
  const whereSql = getFilteredWhereSql({ filters, values })
  values.push(limit)
  const limitIndex = values.length

  const rows = await prisma.$queryRawUnsafe<RawBreakdownRow[]>(
    `
      SELECT
        ${brandNameSql} AS key,
        ${brandNameSql} AS label,
        COALESCE(SUM(ai.qty), 0)::int AS qty,
        COALESCE(SUM(ai.estimated_daily_kwh), 0) AS daily_kwh
      ${getBaseFromSql()}
      ${whereSql}
      GROUP BY ${brandNameSql}
      ORDER BY daily_kwh DESC
      LIMIT $${limitIndex}
    `,
    ...values
  )

  return rows.map(serializeBreakdownRow)
}
