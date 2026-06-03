import { prisma } from "@/lib/prisma"

export type MasterDataTab = "stores" | "equipment"
export type SortOrder = "asc" | "desc"

export type MasterStoreHoursFilter = "24h" | "non-24h"
export type MasterStoreSortKey =
  | "store"
  | "branch"
  | "type"
  | "plnPower"
  | "totalArea"
  | "updatedAt"

export type MasterStoreFilters = {
  q: string
  branch: string
  type: string
  hours: MasterStoreHoursFilter | "all"
  sort: MasterStoreSortKey
  order: SortOrder
}

export type MasterStoreRow = {
  id: string
  code: string
  name: string
  branch: string | null
  plnCustomerId: string | null
  type: string
  is24Hours: boolean
  openTime: string | null
  closeTime: string | null
  plnPowerVa: number
  parkingAreaM2: number
  terraceAreaM2: number
  salesAreaM2: number
  warehouseAreaM2: number
  totalAreaM2: number
  updatedAt: string
}

export type MasterEquipmentHasBrandsFilter = "with-brands" | "without-brands"
export type MasterEquipmentSortKey =
  | "name"
  | "category"
  | "storeType"
  | "defaultKw"
  | "brandCount"
  | "createdAt"

export type MasterEquipmentFilters = {
  q: string
  category: string
  storeType: string
  hasBrands: MasterEquipmentHasBrandsFilter | "all"
  sort: MasterEquipmentSortKey
  order: SortOrder
}

export type MasterEquipmentRow = {
  id: string
  name: string
  category: string
  defaultKw: number
  storeType: string | null
  brandCount: number
  minBrandKw: number | null
  maxBrandKw: number | null
  topBrands: string[]
  createdAt: string
}

export type MasterDataSummary = {
  totalStores: number
  branches: number
  storeTypes: number
  totalPlnPowerVa: number
  totalEquipmentTypes: number
  totalBrands: number
  categories: number
  avgDefaultKw: number
}

type CountRow = {
  total_rows: number | bigint
}

type OptionRow = {
  value: string | null
}

type SummaryRow = {
  total_stores: number | bigint | null
  branches: number | bigint | null
  store_types: number | bigint | null
  total_pln_power_va: number | bigint | null
  total_equipment_types: number | bigint | null
  total_brands: number | bigint | null
  categories: number | bigint | null
  avg_default_kw: { toString(): string } | string | number | null
}

type RawMasterStoreRow = Omit<
  MasterStoreRow,
  | "parkingAreaM2"
  | "terraceAreaM2"
  | "salesAreaM2"
  | "warehouseAreaM2"
  | "totalAreaM2"
  | "updatedAt"
> & {
  parkingAreaM2: { toString(): string } | string | number
  terraceAreaM2: { toString(): string } | string | number
  salesAreaM2: { toString(): string } | string | number
  warehouseAreaM2: { toString(): string } | string | number
  totalAreaM2: { toString(): string } | string | number
  updatedAt: Date | string
}

type RawMasterEquipmentRow = Omit<
  MasterEquipmentRow,
  "defaultKw" | "minBrandKw" | "maxBrandKw" | "topBrands" | "createdAt"
> & {
  defaultKw: { toString(): string } | string | number
  minBrandKw: { toString(): string } | string | number | null
  maxBrandKw: { toString(): string } | string | number | null
  topBrands: string[] | null
  createdAt: Date | string
}

const activeStoreWhereSql =
  "s.branch IS NULL OR lower(s.branch) NOT IN ('demo', 'head office')"

export const masterStoresPageSize = 25
export const masterEquipmentPageSize = 25
export const defaultMasterStoreSort: MasterStoreSortKey = "store"
export const defaultMasterEquipmentSort: MasterEquipmentSortKey = "name"
export const defaultMasterDataOrder: SortOrder = "asc"

export function parseMasterDataTab(
  value: string | null | undefined
): MasterDataTab {
  return value === "equipment" ? "equipment" : "stores"
}

export function parseSortOrder(value: string | null | undefined): SortOrder {
  return value === "desc" ? "desc" : defaultMasterDataOrder
}

export function parseMasterStoreSort(
  value: string | null | undefined
): MasterStoreSortKey {
  if (
    value === "store" ||
    value === "branch" ||
    value === "type" ||
    value === "plnPower" ||
    value === "totalArea" ||
    value === "updatedAt"
  ) {
    return value
  }

  return defaultMasterStoreSort
}

export function parseMasterStoreHours(
  value: string | null | undefined
): MasterStoreHoursFilter | "all" {
  return value === "24h" || value === "non-24h" ? value : "all"
}

export function parseMasterEquipmentSort(
  value: string | null | undefined
): MasterEquipmentSortKey {
  if (
    value === "name" ||
    value === "category" ||
    value === "storeType" ||
    value === "defaultKw" ||
    value === "brandCount" ||
    value === "createdAt"
  ) {
    return value
  }

  return defaultMasterEquipmentSort
}

export function parseMasterEquipmentHasBrands(
  value: string | null | undefined
): MasterEquipmentHasBrandsFilter | "all" {
  if (value === "with-brands" || value === "without-brands") return value
  return "all"
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) return 0
  return Number(value)
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined) return null
  return Number(value)
}

function serializeStoreRow(row: RawMasterStoreRow): MasterStoreRow {
  return {
    ...row,
    parkingAreaM2: toNumber(row.parkingAreaM2),
    terraceAreaM2: toNumber(row.terraceAreaM2),
    salesAreaM2: toNumber(row.salesAreaM2),
    warehouseAreaM2: toNumber(row.warehouseAreaM2),
    totalAreaM2: toNumber(row.totalAreaM2),
    updatedAt: new Date(row.updatedAt).toISOString(),
  }
}

function serializeEquipmentRow(row: RawMasterEquipmentRow): MasterEquipmentRow {
  return {
    ...row,
    defaultKw: toNumber(row.defaultKw),
    minBrandKw: toNullableNumber(row.minBrandKw),
    maxBrandKw: toNullableNumber(row.maxBrandKw),
    topBrands: row.topBrands ?? [],
    createdAt: new Date(row.createdAt).toISOString(),
  }
}

function getStoreWhereSql(filters: MasterStoreFilters, values: unknown[]) {
  const clauses = [`(${activeStoreWhereSql})`]

  if (filters.q) {
    values.push(`%${filters.q.toLowerCase()}%`)
    const index = values.length
    clauses.push(`(
      lower(s.code) LIKE $${index}
      OR lower(s.name) LIKE $${index}
      OR lower(coalesce(s.pln_customer_id, '')) LIKE $${index}
    )`)
  }

  if (filters.branch !== "all") {
    values.push(filters.branch)
    clauses.push(`s.branch = $${values.length}`)
  }

  if (filters.type !== "all") {
    values.push(filters.type)
    clauses.push(`s.type = $${values.length}`)
  }

  if (filters.hours === "24h") {
    clauses.push("s.is_24_hours IS TRUE")
  } else if (filters.hours === "non-24h") {
    clauses.push("s.is_24_hours IS NOT TRUE")
  }

  return `WHERE ${clauses.join(" AND ")}`
}

function getStoreOrderBySql(filters: MasterStoreFilters) {
  const direction = filters.order === "desc" ? "DESC" : "ASC"
  const nulls = filters.order === "desc" ? "NULLS LAST" : "NULLS FIRST"
  const totalAreaSql =
    "(s.parking_area_m2 + s.terrace_area_m2 + s.sales_area_m2 + s.warehouse_area_m2)"

  const sortSqlByKey: Record<MasterStoreSortKey, string> = {
    store: `lower(s.code) ${direction}, lower(s.name) ${direction}`,
    branch: `lower(s.branch) ${direction} ${nulls}, lower(s.code) ASC`,
    type: `lower(s.type) ${direction}, lower(s.code) ASC`,
    plnPower: `s.pln_power_va ${direction}, lower(s.code) ASC`,
    totalArea: `${totalAreaSql} ${direction}, lower(s.code) ASC`,
    updatedAt: `s.updated_at ${direction}, lower(s.code) ASC`,
  }

  return `ORDER BY ${sortSqlByKey[filters.sort]}`
}

function getEquipmentWhereSql(
  filters: MasterEquipmentFilters,
  values: unknown[]
) {
  const clauses: string[] = []

  if (filters.q) {
    values.push(`%${filters.q.toLowerCase()}%`)
    const index = values.length
    clauses.push(`(
      lower(et.name) LIKE $${index}
      OR lower(et.category) LIKE $${index}
      OR lower(coalesce(et.store_type, '')) LIKE $${index}
      OR EXISTS (
        SELECT 1
        FROM equipment_brands eb_search
        WHERE eb_search.equipment_type_id = et.id
          AND lower(eb_search.name) LIKE $${index}
      )
    )`)
  }

  if (filters.category !== "all") {
    values.push(filters.category)
    clauses.push(`et.category = $${values.length}`)
  }

  if (filters.storeType !== "all") {
    values.push(filters.storeType)
    clauses.push(`et.store_type = $${values.length}`)
  }

  if (filters.hasBrands === "with-brands") {
    clauses.push("brand_summary.brand_count > 0")
  } else if (filters.hasBrands === "without-brands") {
    clauses.push("coalesce(brand_summary.brand_count, 0) = 0")
  }

  return clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""
}

function getEquipmentOrderBySql(filters: MasterEquipmentFilters) {
  const direction = filters.order === "desc" ? "DESC" : "ASC"
  const nulls = filters.order === "desc" ? "NULLS LAST" : "NULLS FIRST"

  const sortSqlByKey: Record<MasterEquipmentSortKey, string> = {
    name: `lower(et.name) ${direction}`,
    category: `lower(et.category) ${direction}, lower(et.name) ASC`,
    storeType: `lower(et.store_type) ${direction} ${nulls}, lower(et.name) ASC`,
    defaultKw: `et.default_kw ${direction}, lower(et.name) ASC`,
    brandCount: `brand_summary.brand_count ${direction}, lower(et.name) ASC`,
    createdAt: `et.created_at ${direction}, lower(et.name) ASC`,
  }

  return `ORDER BY ${sortSqlByKey[filters.sort]}`
}

function getEquipmentFromSql() {
  return `
    FROM equipment_types et
    LEFT JOIN LATERAL (
      SELECT
        COUNT(eb.id)::int AS brand_count,
        MIN(eb.base_kw) AS min_brand_kw,
        MAX(eb.base_kw) AS max_brand_kw,
        ARRAY_AGG(eb.name ORDER BY eb.name ASC) FILTER (WHERE eb.name IS NOT NULL) AS top_brands
      FROM equipment_brands eb
      WHERE eb.equipment_type_id = et.id
    ) brand_summary ON true
  `
}

export async function getMasterDataSummary(): Promise<MasterDataSummary> {
  const rows = await prisma.$queryRawUnsafe<SummaryRow[]>(`
    SELECT
      (SELECT COUNT(*)::int FROM stores s WHERE ${activeStoreWhereSql}) AS total_stores,
      (
        SELECT COUNT(DISTINCT s.branch)::int
        FROM stores s
        WHERE s.branch IS NOT NULL AND ${activeStoreWhereSql}
      ) AS branches,
      (
        SELECT COUNT(DISTINCT s.type)::int
        FROM stores s
        WHERE s.type IS NOT NULL AND ${activeStoreWhereSql}
      ) AS store_types,
      (
        SELECT COALESCE(SUM(s.pln_power_va), 0)::int
        FROM stores s
        WHERE ${activeStoreWhereSql}
      ) AS total_pln_power_va,
      (SELECT COUNT(*)::int FROM equipment_types) AS total_equipment_types,
      (SELECT COUNT(*)::int FROM equipment_brands) AS total_brands,
      (
        SELECT COUNT(DISTINCT et.category)::int
        FROM equipment_types et
        WHERE et.category IS NOT NULL
      ) AS categories,
      (SELECT COALESCE(AVG(et.default_kw), 0) FROM equipment_types et) AS avg_default_kw
  `)

  const row = rows[0]

  return {
    totalStores: Number(row?.total_stores ?? 0),
    branches: Number(row?.branches ?? 0),
    storeTypes: Number(row?.store_types ?? 0),
    totalPlnPowerVa: Number(row?.total_pln_power_va ?? 0),
    totalEquipmentTypes: Number(row?.total_equipment_types ?? 0),
    totalBrands: Number(row?.total_brands ?? 0),
    categories: Number(row?.categories ?? 0),
    avgDefaultKw: toNumber(row?.avg_default_kw),
  }
}

export async function getMasterStoreBranches() {
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

export async function getMasterStoreTypes() {
  const rows = await prisma.$queryRawUnsafe<OptionRow[]>(`
    SELECT DISTINCT trim(s.type) AS value
    FROM stores s
    WHERE s.type IS NOT NULL
      AND trim(s.type) <> ''
      AND ${activeStoreWhereSql}
    ORDER BY trim(s.type) ASC
  `)

  return rows
    .map((row) => row.value?.trim())
    .filter((item): item is string => Boolean(item))
}

export async function getMasterStoreCount(filters: MasterStoreFilters) {
  const values: unknown[] = []
  const whereSql = getStoreWhereSql(filters, values)
  const rows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
      SELECT COUNT(*)::int AS total_rows
      FROM stores s
      ${whereSql}
    `,
    ...values
  )

  return Number(rows[0]?.total_rows ?? 0)
}

export async function getMasterStoreRows({
  filters,
  offset,
  limit = masterStoresPageSize,
}: {
  filters: MasterStoreFilters
  offset: number
  limit?: number
}) {
  const values: unknown[] = []
  const whereSql = getStoreWhereSql(filters, values)
  const orderBySql = getStoreOrderBySql(filters)

  values.push(limit + 1)
  const limitIndex = values.length
  values.push(offset)
  const offsetIndex = values.length

  const rows = await prisma.$queryRawUnsafe<RawMasterStoreRow[]>(
    `
      SELECT
        s.id,
        s.code,
        s.name,
        s.branch,
        s.pln_customer_id AS "plnCustomerId",
        s.type,
        s.is_24_hours AS "is24Hours",
        s.open_time AS "openTime",
        s.close_time AS "closeTime",
        s.pln_power_va AS "plnPowerVa",
        s.parking_area_m2 AS "parkingAreaM2",
        s.terrace_area_m2 AS "terraceAreaM2",
        s.sales_area_m2 AS "salesAreaM2",
        s.warehouse_area_m2 AS "warehouseAreaM2",
        (
          s.parking_area_m2 + s.terrace_area_m2 + s.sales_area_m2 + s.warehouse_area_m2
        ) AS "totalAreaM2",
        s.updated_at AS "updatedAt"
      FROM stores s
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

export async function getMasterEquipmentCategories() {
  const rows = await prisma.$queryRawUnsafe<OptionRow[]>(`
    SELECT DISTINCT trim(et.category) AS value
    FROM equipment_types et
    WHERE et.category IS NOT NULL
      AND trim(et.category) <> ''
    ORDER BY trim(et.category) ASC
  `)

  return rows
    .map((row) => row.value?.trim())
    .filter((item): item is string => Boolean(item))
}

export async function getMasterEquipmentStoreTypes() {
  const rows = await prisma.$queryRawUnsafe<OptionRow[]>(`
    SELECT DISTINCT trim(et.store_type) AS value
    FROM equipment_types et
    WHERE et.store_type IS NOT NULL
      AND trim(et.store_type) <> ''
    ORDER BY trim(et.store_type) ASC
  `)

  return rows
    .map((row) => row.value?.trim())
    .filter((item): item is string => Boolean(item))
}

export async function getMasterEquipmentCount(filters: MasterEquipmentFilters) {
  const values: unknown[] = []
  const whereSql = getEquipmentWhereSql(filters, values)
  const rows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
      SELECT COUNT(*)::int AS total_rows
      ${getEquipmentFromSql()}
      ${whereSql}
    `,
    ...values
  )

  return Number(rows[0]?.total_rows ?? 0)
}

export async function getMasterEquipmentRows({
  filters,
  offset,
  limit = masterEquipmentPageSize,
}: {
  filters: MasterEquipmentFilters
  offset: number
  limit?: number
}) {
  const values: unknown[] = []
  const whereSql = getEquipmentWhereSql(filters, values)
  const orderBySql = getEquipmentOrderBySql(filters)

  values.push(limit + 1)
  const limitIndex = values.length
  values.push(offset)
  const offsetIndex = values.length

  const rows = await prisma.$queryRawUnsafe<RawMasterEquipmentRow[]>(
    `
      SELECT
        et.id,
        et.name,
        et.category,
        et.default_kw AS "defaultKw",
        et.store_type AS "storeType",
        COALESCE(brand_summary.brand_count, 0)::int AS "brandCount",
        brand_summary.min_brand_kw AS "minBrandKw",
        brand_summary.max_brand_kw AS "maxBrandKw",
        COALESCE(brand_summary.top_brands[1:4], ARRAY[]::text[]) AS "topBrands",
        et.created_at AS "createdAt"
      ${getEquipmentFromSql()}
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
