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

export type EquipmentArea = "PARKING" | "TERRACE" | "SALES" | "WAREHOUSE"
export type MasterEquipmentPowerModeFilter =
  | "has-standby"
  | "has-running"
  | "missing-mode"
export type MasterEquipmentSortKey =
  | "equipment"
  | "brand"
  | "category"
  | "storeType"
  | "area"
  | "baseKw"
  | "standbyKw"
  | "runningKw"
  | "createdAt"

export type MasterEquipmentFilters = {
  q: string
  deviceCategory: string
  category: string
  storeType: string
  area: EquipmentArea | "all"
  powerMode: MasterEquipmentPowerModeFilter | "all"
  hasBrands: "with-brands" | "without-brands" | "all"
  sort: MasterEquipmentSortKey
  order: SortOrder
}

export type MasterEquipmentRow = {
  id: string
  equipmentTypeId: string
  equipmentName: string
  brandName: string
  category: string
  deviceCategory: string
  area: EquipmentArea
  defaultKw: number
  baseKw: number
  standbyKw: number
  runningKw: number
  storeType: string | null
  productPhotoUrl: string | null
  nameplatePhotoUrl: string | null
  createdAt: string
}

export type MasterEquipmentTypeOption = {
  id: string
  name: string
  category: string
  deviceCategory: string
  storeType: string | null
  defaultKw: number
}

export type MasterDataSummary = {
  totalStores: number
  branches: number
  regularStores: number
  beanspotStores: number
  otherStores: number
  auditedStores: number
  draftAuditedStores: number
  notAuditedStores: number
  auditPercent: number
  totalPlnPowerVa: number
  stores24h: number
  storesNon24h: number
  avgStoreArea: number
  totalEquipmentTypes: number
  beanspotEquipmentTypes: number
  totalBrands: number
  categories: number
  avgDefaultKw: number
  topCategories: { name: string; count: number }[]
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
  "defaultKw" | "baseKw" | "standbyKw" | "runningKw" | "createdAt"
> & {
  defaultKw: { toString(): string } | string | number
  baseKw: { toString(): string } | string | number
  standbyKw: { toString(): string } | string | number
  runningKw: { toString(): string } | string | number
  createdAt: Date | string
}

const activeStoreWhereSql =
  "(s.branch IS NULL OR lower(s.branch) NOT IN ('demo', 'head office'))"

export const masterStoresPageSize = 25
export const masterEquipmentPageSize = 25
export const defaultMasterStoreSort: MasterStoreSortKey = "store"
export const defaultMasterEquipmentSort: MasterEquipmentSortKey = "equipment"
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
    value === "equipment" ||
    value === "brand" ||
    value === "category" ||
    value === "storeType" ||
    value === "area" ||
    value === "baseKw" ||
    value === "standbyKw" ||
    value === "runningKw" ||
    value === "createdAt"
  ) {
    return value
  }

  return defaultMasterEquipmentSort
}

export function parseMasterEquipmentPowerMode(
  value: string | null | undefined
): MasterEquipmentPowerModeFilter | "all" {
  if (
    value === "has-standby" ||
    value === "has-running" ||
    value === "missing-mode"
  ) {
    return value
  }
  return "all"
}

export function parseMasterEquipmentArea(
  value: string | null | undefined
): EquipmentArea | "all" {
  if (
    value === "PARKING" ||
    value === "TERRACE" ||
    value === "SALES" ||
    value === "WAREHOUSE"
  ) {
    return value
  }

  return "all"
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) return 0
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
    baseKw: toNumber(row.baseKw),
    standbyKw: toNumber(row.standbyKw),
    runningKw: toNumber(row.runningKw),
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
      OR lower(coalesce(et.device_category, '')) LIKE $${index}
      OR lower(coalesce(et.store_type, '')) LIKE $${index}
      OR lower(eb.name) LIKE $${index}
    )`)
  }

  if (filters.deviceCategory && filters.deviceCategory !== "all") {
    const deviceCategories = filters.deviceCategory.split(",").map((c) => c.trim()).filter(Boolean)
    if (deviceCategories.length > 0) {
      const placeholders = deviceCategories.map((c) => {
        values.push(c)
        return `$${values.length}`
      })
      clauses.push(`et.device_category IN (${placeholders.join(", ")})`)
    }
  }

  if (filters.category !== "all") {
    const categories = filters.category.split(",").map((c) => c.trim()).filter(Boolean)
    if (categories.length > 0) {
      const placeholders = categories.map((c) => {
        values.push(c)
        return `$${values.length}`
      })
      clauses.push(`et.category IN (${placeholders.join(", ")})`)
    }
  }

  if (filters.storeType !== "all") {
    const storeTypes = filters.storeType.split(",").map((t) => t.trim()).filter(Boolean)
    if (storeTypes.length > 0) {
      const placeholders = storeTypes.map((t) => {
        values.push(t)
        return `$${values.length}`
      })
      clauses.push(`et.store_type IN (${placeholders.join(", ")})`)
    }
  }

  if (filters.area !== "all") {
    values.push(filters.area)
    clauses.push(`eb.area_target::text = $${values.length}`)
  }

  if (filters.powerMode === "has-standby") {
    clauses.push("eb.standby_kw > 0")
  } else if (filters.powerMode === "has-running") {
    clauses.push("eb.running_kw > 0")
  } else if (filters.powerMode === "missing-mode") {
    clauses.push("eb.standby_kw = 0 AND eb.running_kw = 0")
  }

  if (filters.hasBrands === "with-brands") {
    clauses.push("EXISTS (SELECT 1 FROM equipment_brands eb2 WHERE eb2.equipment_type_id = et.id)")
  } else if (filters.hasBrands === "without-brands") {
    clauses.push("NOT EXISTS (SELECT 1 FROM equipment_brands eb2 WHERE eb2.equipment_type_id = et.id)")
  }

  return clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""
}

function getEquipmentOrderBySql(filters: MasterEquipmentFilters) {
  const direction = filters.order === "desc" ? "DESC" : "ASC"
  const nulls = filters.order === "desc" ? "NULLS LAST" : "NULLS FIRST"

  const sortSqlByKey: Record<MasterEquipmentSortKey, string> = {
    equipment: `lower(et.name) ${direction}, lower(eb.name) ASC`,
    brand: `lower(eb.name) ${direction}, lower(et.name) ASC`,
    category: `lower(et.category) ${direction}, lower(et.name) ASC, lower(eb.name) ASC`,
    storeType: `lower(et.store_type) ${direction} ${nulls}, lower(et.name) ASC, lower(eb.name) ASC`,
    area: `eb.area_target::text ${direction}, lower(et.name) ASC, lower(eb.name) ASC`,
    baseKw: `eb.base_kw ${direction}, lower(et.name) ASC`,
    standbyKw: `eb.standby_kw ${direction}, lower(et.name) ASC`,
    runningKw: `eb.running_kw ${direction}, lower(et.name) ASC`,
    createdAt: `eb.created_at ${direction}, lower(et.name) ASC`,
  }

  return `ORDER BY ${sortSqlByKey[filters.sort]}`
}

function getEquipmentFromSql() {
  return `
    FROM equipment_types et
    INNER JOIN equipment_brands eb ON eb.equipment_type_id = et.id
  `
}

export async function getMasterDataSummary(): Promise<MasterDataSummary> {
  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT
      (SELECT COUNT(*)::int FROM stores s WHERE ${activeStoreWhereSql}) AS total_stores,
      (
        SELECT COUNT(DISTINCT s.branch)::int
        FROM stores s
        WHERE s.branch IS NOT NULL AND ${activeStoreWhereSql}
      ) AS branches,
      (
        SELECT COUNT(*)::int
        FROM stores s
        WHERE lower(trim(coalesce(s.type, ''))) IN ('beanspot', 'basic', 'medium', 'advance') AND ${activeStoreWhereSql}
      ) AS beanspot_stores,
      (
        SELECT COUNT(*)::int
        FROM stores s
        WHERE (s.type IS NULL OR lower(trim(coalesce(s.type, ''))) IN ('', 'regular', 'reguler')) AND ${activeStoreWhereSql}
      ) AS regular_stores,
      (
        SELECT COUNT(*)::int
        FROM stores s
        WHERE s.type IS NOT NULL AND lower(trim(s.type)) NOT IN ('', 'regular', 'reguler', 'beanspot', 'basic', 'medium', 'advance') AND ${activeStoreWhereSql}
      ) AS other_stores,
      (
        SELECT COUNT(DISTINCT a.store_id)::int
        FROM audits a
        INNER JOIN stores s ON s.id = a.store_id
        WHERE a.status = 'COMPLETED' AND (${activeStoreWhereSql})
      ) AS audited_stores,
      (
        SELECT COUNT(DISTINCT a.store_id)::int
        FROM audits a
        INNER JOIN stores s ON s.id = a.store_id
        WHERE a.status = 'DRAFT' 
          AND a.store_id NOT IN (
            SELECT store_id FROM audits WHERE status = 'COMPLETED'
          )
          AND (${activeStoreWhereSql})
      ) AS draft_audited_stores,
      (
        SELECT COALESCE(SUM(s.pln_power_va), 0)::int
        FROM stores s
        WHERE ${activeStoreWhereSql}
      ) AS total_pln_power_va,
      (
        SELECT COUNT(*)::int
        FROM stores s
        WHERE s.is_24_hours IS TRUE AND ${activeStoreWhereSql}
      ) AS stores_24h,
      (
        SELECT COUNT(*)::int
        FROM stores s
        WHERE s.is_24_hours IS NOT TRUE AND ${activeStoreWhereSql}
      ) AS stores_non_24h,
      (
        SELECT COALESCE(AVG(s.parking_area_m2 + s.terrace_area_m2 + s.sales_area_m2 + s.warehouse_area_m2), 0)
        FROM stores s
        WHERE ${activeStoreWhereSql}
      ) AS avg_store_area,
      (SELECT COUNT(*)::int FROM equipment_types) AS total_equipment_types,
      (
        SELECT COUNT(*)::int
        FROM equipment_types et
        WHERE lower(trim(et.store_type)) = 'beanspot'
      ) AS beanspot_equipment_types,
      (SELECT COUNT(*)::int FROM equipment_brands) AS total_brands,
      (
        SELECT COUNT(DISTINCT et.device_category)::int
        FROM equipment_types et
        WHERE et.device_category IS NOT NULL
      ) AS categories,
      (SELECT COALESCE(AVG(et.default_kw), 0) FROM equipment_types et) AS avg_default_kw
  `)

  const row = rows[0]

  const topCategories = await prisma.$queryRawUnsafe<{ name: string; count: number }[]>(`
    SELECT 
      et.device_category AS name,
      COUNT(eb.id)::int AS count
    FROM equipment_types et
    INNER JOIN equipment_brands eb ON eb.equipment_type_id = et.id
    WHERE et.device_category IS NOT NULL AND trim(et.device_category) <> ''
    GROUP BY et.device_category
    ORDER BY count DESC, name ASC
  `)

  const totalStores = Number(row?.total_stores ?? 0)
  const auditedStores = Number(row?.audited_stores ?? 0)
  const draftAuditedStores = Number(row?.draft_audited_stores ?? 0)
  const notAuditedStores = Math.max(0, totalStores - auditedStores - draftAuditedStores)
  const auditPercent = totalStores > 0 ? Math.round((auditedStores / totalStores) * 100) : 0

  return {
    totalStores,
    branches: Number(row?.branches ?? 0),
    regularStores: Number(row?.regular_stores ?? 0),
    beanspotStores: Number(row?.beanspot_stores ?? 0),
    otherStores: Number(row?.other_stores ?? 0),
    auditedStores,
    draftAuditedStores,
    notAuditedStores,
    auditPercent,
    totalPlnPowerVa: Number(row?.total_pln_power_va ?? 0),
    stores24h: Number(row?.stores_24h ?? 0),
    storesNon24h: Number(row?.stores_non_24h ?? 0),
    avgStoreArea: toNumber(row?.avg_store_area),
    totalEquipmentTypes: Number(row?.total_equipment_types ?? 0),
    beanspotEquipmentTypes: Number(row?.beanspot_equipment_types ?? 0),
    totalBrands: Number(row?.total_brands ?? 0),
    categories: Number(row?.categories ?? 0),
    avgDefaultKw: toNumber(row?.avg_default_kw),
    topCategories: topCategories.map(c => ({
      name: c.name || "Lainnya",
      count: Number(c.count ?? 0)
    }))
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

export async function getMasterEquipmentTypeOptions(): Promise<
  MasterEquipmentTypeOption[]
> {
  const rows = await prisma.equipmentType.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      deviceCategory: true,
      storeType: true,
      defaultKw: true,
    },
  })

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    deviceCategory: row.deviceCategory,
    storeType: row.storeType,
    defaultKw: Number(row.defaultKw),
  }))
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
        eb.id,
        et.id AS "equipmentTypeId",
        et.name AS "equipmentName",
        eb.name AS "brandName",
        et.category,
        et.device_category AS "deviceCategory",
        eb.area_target::text AS area,
        et.default_kw AS "defaultKw",
        eb.base_kw AS "baseKw",
        eb.standby_kw AS "standbyKw",
        eb.running_kw AS "runningKw",
        et.store_type AS "storeType",
        eb.product_photo_url AS "productPhotoUrl",
        eb.nameplate_photo_url AS "nameplatePhotoUrl",
        eb.created_at AS "createdAt"
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

export async function getMasterEquipmentDeviceCategories() {
  const rows = await prisma.$queryRawUnsafe<OptionRow[]>(`
    SELECT DISTINCT trim(et.device_category) AS value
    FROM equipment_types et
    WHERE et.device_category IS NOT NULL
      AND trim(et.device_category) <> ''
    ORDER BY trim(et.device_category) ASC
  `)

  return rows
    .map((row) => row.value?.trim())
    .filter((item): item is string => Boolean(item))
}
