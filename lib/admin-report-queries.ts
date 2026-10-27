import { prisma } from "@/lib/prisma"
import { getAdminGapFilterEnabled } from "@/lib/admin-gap-filter"
import { getSangatBorosAuditIdsSql } from "@/lib/admin-sangat-boros"
import { ENERGY_AUDIT_CATEGORIES } from "@/lib/energy-audit-categories"
import {
  getIotStatusLookup,
  getStoreIot,
  type StoreIotInfo,
} from "@/lib/iot-status"
import { getAuditGapFilterWhereSql } from "@/lib/audit-gap-filter"
import {
  defaultMasterDataOrder,
  defaultMasterEquipmentSort,
  defaultMasterStoreSort,
  getMasterEquipmentCount,
  getMasterEquipmentRows,
  getMasterStoreBranchCounts,
  getMasterStoreCount,
  getMasterStoreRows,
  type MasterEquipmentFilters,
  type MasterStoreCompletenessFilter,
  type MasterStoreFilters,
  type MasterStoreHoursFilter,
} from "@/lib/admin-master-data-queries"
import { getMasterStoreCompleteness } from "@/lib/master-store-completeness"

export type AdminReportType =
  | "store-data"
  | "audit-history"
  | "equipment"
  | "branch-summary"
  | "master-stores"
  | "master-equipment"

// Master data has no period or hemat/boros status, so those filters are ignored.
const masterReports = new Set<AdminReportType>(["master-stores", "master-equipment"])
const masterExportLimit = 100_000

export type AdminReportStatus = "hemat" | "boros"

export type AdminReportFilters = {
  year: string
  month: string
  branch: string
  storeType: string
  status: AdminReportStatus | "all"
}

// gapFilter comes from the admin toggle cookie, never from the URL.
type ReportQueryFilters = AdminReportFilters & { gapFilter?: boolean }

type CountRow = {
  count: number | bigint
}

type OptionRow = {
  value: string
}

export type AdminReportColumn = {
  label: string
  type: "text" | "number" | "integer" | "date" | "kw"
}

export type AdminReportCellValue = string | number | Date | null

export type AdminReportDataset = {
  filename: string
  sheetName: string
  columns: AdminReportColumn[]
  rows: AdminReportCellValue[][]
  // Indexes into rows that are group titles (e.g. one per branch)
  groupRows?: number[]
}

// Master Toko has its own filters (mBranch, mType, ...) because the page filters
// only allow one branch and also carry period and status.
export type MasterStoreExportFilters = {
  branches: string[]
  types: string[]
  completeness: MasterStoreCompletenessFilter | "all"
  hours: MasterStoreHoursFilter | "all"
}

export const masterStoreExportParamKeys = [
  "mBranch",
  "mType",
  "mComplete",
  "mHours",
] as const

function splitList(value: string | null | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function parseMasterStoreExportFilters(
  get: (key: (typeof masterStoreExportParamKeys)[number]) => string | null | undefined
): MasterStoreExportFilters {
  const completeness = get("mComplete")
  const hours = get("mHours")
  return {
    branches: splitList(get("mBranch")),
    types: splitList(get("mType")),
    completeness:
      completeness === "complete" || completeness === "incomplete"
        ? completeness
        : "all",
    hours: hours === "24h" || hours === "non-24h" ? hours : "all",
  }
}

const emptyMasterStoreExportFilters: MasterStoreExportFilters = {
  branches: [],
  types: [],
  completeness: "all",
  hours: "all",
}

const activeStoreWhereSql =
  "s.branch IS NULL OR lower(s.branch) NOT IN ('demo', 'head office')"

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
]

const reportLabels: Record<AdminReportType, string> = {
  "store-data": "data-toko-bulanan",
  "audit-history": "riwayat-kalkulasi",
  equipment: "equipment-kalkulasi",
  "branch-summary": "ringkasan-cabang",
  "master-stores": "master-toko",
  "master-equipment": "master-equipment",
}

const reportSheetNames: Record<AdminReportType, string> = {
  "store-data": "Data Toko",
  "audit-history": "Riwayat Kalkulasi",
  equipment: "Equipment",
  "branch-summary": "Ringkasan Cabang",
  "master-stores": "Master Toko",
  "master-equipment": "Master Equipment",
}

export function parseAdminReportType(
  value: string | null | undefined
): AdminReportType | null {
  if (
    value === "store-data" ||
    value === "audit-history" ||
    value === "equipment" ||
    value === "branch-summary" ||
    value === "master-stores" ||
    value === "master-equipment"
  ) {
    return value
  }

  return null
}

export function parseAdminReportStatus(
  value: string | null | undefined
): AdminReportStatus | "all" {
  return value === "hemat" || value === "boros" ? value : "all"
}

export function getAdminReportFilter(value: string | null | undefined) {
  return value?.trim() || "all"
}

export function formatAdminReportCount(value: number | bigint) {
  return Number(value)
}

function getDefaultYear() {
  return String(new Date().getFullYear())
}

function getDateRange(filters: ReportQueryFilters) {
  const isDefaultYear = filters.year === "all"
  const year = isDefaultYear ? getDefaultYear() : filters.year
  const month = filters.month !== "all" ? Number(filters.month) : null
  const yearNumber = Number(year)

  if (!Number.isInteger(yearNumber)) return null

  if (month && month >= 1 && month <= 12) {
    return {
      start: new Date(Date.UTC(yearNumber, month - 1, 1)),
      end: new Date(Date.UTC(yearNumber, month, 1)),
    }
  }

  return {
    start: new Date(Date.UTC(yearNumber, 0, 1)),
    end: isDefaultYear ? new Date() : new Date(Date.UTC(yearNumber + 1, 0, 1)),
  }
}

function addCommonWhere({
  filters,
  values,
  auditAlias = "a",
  storeAlias = "s",
  includeStatus = true,
}: {
  filters: ReportQueryFilters
  values: unknown[]
  auditAlias?: string
  storeAlias?: string
  includeStatus?: boolean
}) {
  const clauses = [
    `${auditAlias}.status = 'COMPLETED'`,
    `(${activeStoreWhereSql.replaceAll("s.", `${storeAlias}.`)})`,
  ]

  const gapClause = getAuditGapFilterWhereSql(auditAlias, filters.gapFilter)
  if (gapClause) {
    clauses.push(gapClause)
  }

  const dateRange = getDateRange(filters)

  if (dateRange) {
    values.push(dateRange.start)
    clauses.push(`${auditAlias}.audit_date >= $${values.length}`)
    values.push(dateRange.end)
    clauses.push(`${auditAlias}.audit_date < $${values.length}`)
  }

  if (filters.branch !== "all") {
    const branches = filters.branch.split(",").map((b) => b.trim()).filter(Boolean)
    if (branches.length > 0) {
      const placeholders = branches.map((b) => {
        values.push(b)
        return `$${values.length}`
      })
      clauses.push(`${storeAlias}.branch IN (${placeholders.join(", ")})`)
    }
  }

  if (filters.storeType !== "all") {
    const types = filters.storeType.split(",").map((t) => t.trim()).filter(Boolean)
    if (types.length > 0) {
      const placeholders = types.map((t) => {
        values.push(t)
        return `$${values.length}`
      })
      clauses.push(`${storeAlias}.type IN (${placeholders.join(", ")})`)
    }
  }

  if (includeStatus && filters.status === "hemat") {
    clauses.push(`${auditAlias}.is_boros IS NOT TRUE`)
  } else if (includeStatus && filters.status === "boros") {
    clauses.push(`${auditAlias}.is_boros IS TRUE`)
  }

  return clauses
}

function getCommonWhereSql(filters: ReportQueryFilters, values: unknown[]) {
  return `WHERE ${addCommonWhere({ filters, values }).join(" AND ")}`
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

function toText(value: unknown) {
  if (value === null || value === undefined) return null
  return String(value)
}

function toRoundedNumber(value: unknown, digits = 0) {
  const numberValue = toNumber(value)
  if (numberValue === null) return null

  return Number(numberValue.toFixed(digits))
}

function toDate(value: Date | string | null) {
  if (!value) return null
  return new Date(value)
}

function formatMonth(monthIdx: unknown, billingMonth: unknown) {
  const index = Number(monthIdx)
  if (Number.isInteger(index) && index >= 0 && index <= 11) {
    return monthLabels[index]
  }

  return billingMonth ?? ""
}

function formatEnergyAudits(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return "Belum diperiksa"

  return value
    .map((item: { category: string; status: string }) => {
      const label =
        ENERGY_AUDIT_CATEGORIES.find((c) => c.key === item.category)?.label ??
        item.category
      return `${label}: ${item.status === "COMPLETED" ? "Selesai" : "Draf"}`
    })
    .join("; ")
}

function formatIotStatus(iot: StoreIotInfo | null) {
  if (!iot) return "Tidak tersedia"
  if (iot.status === "live") return iot.isRecording ? "Merekam" : "Live"
  if (iot.status === "historical") return "Pernah dipasang"
  return "Belum dipasang"
}

function getFilenameDateStamp() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function getFilename(report: AdminReportType, filters: ReportQueryFilters) {
  const parts = [reportLabels[report]]

  if (masterReports.has(report)) {
    parts.push(getFilenameDateStamp())
    return `${parts.join("-").replaceAll(/\s+/g, "-")}.xlsx`
  }

  if (filters.year !== "all") parts.push(filters.year)
  if (filters.month !== "all") parts.push(filters.month)
  if (filters.branch !== "all") parts.push(filters.branch.toLowerCase())
  if (filters.storeType !== "all") parts.push(filters.storeType.toLowerCase())
  if (filters.status !== "all") parts.push(filters.status)
  if (filters.gapFilter === false) parts.push("semua-gap")
  parts.push(getFilenameDateStamp())

  return `${parts.join("-").replaceAll(/\s+/g, "-")}.xlsx`
}

function getLimitSql(values: unknown[], limit?: number) {
  if (!limit || limit <= 0) return ""

  values.push(limit)
  return `LIMIT $${values.length}`
}

export async function getAdminReportFilterOptions() {
  const [branches, storeTypes, years] = await Promise.all([
    prisma.$queryRawUnsafe<OptionRow[]>(`
      SELECT DISTINCT s.branch AS value
      FROM stores s
      WHERE s.branch IS NOT NULL
        AND (${activeStoreWhereSql})
      ORDER BY s.branch ASC
    `),
    prisma.$queryRawUnsafe<OptionRow[]>(`
      SELECT DISTINCT s.type AS value
      FROM stores s
      WHERE s.type IS NOT NULL
        AND (${activeStoreWhereSql})
      ORDER BY s.type ASC
    `),
    prisma.$queryRawUnsafe<OptionRow[]>(`
      SELECT DISTINCT EXTRACT(YEAR FROM a.audit_date)::text AS value
      FROM audits a
      WHERE a.status = 'COMPLETED'
      ORDER BY value DESC
    `),
  ])

  return {
    branches: branches.map((row) => row.value),
    storeTypes: storeTypes.map((row) => row.value),
    years: years.map((row) => row.value),
  }
}

async function countStoreData(filters: ReportQueryFilters) {
  const values: unknown[] = []
  const whereSql = getCommonWhereSql(filters, values)
  const rows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
      SELECT COUNT(*)::int AS count
      FROM audit_pln_std_history h
      JOIN audits a ON a.id = h.audit_id
      JOIN stores s ON s.id = a.store_id
      ${whereSql}
    `,
    ...values
  )

  return formatAdminReportCount(rows[0]?.count ?? 0)
}

async function countAuditHistory(filters: ReportQueryFilters) {
  const values: unknown[] = []
  const whereSql = getCommonWhereSql(filters, values)
  const rows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
      SELECT COUNT(*)::int AS count
      FROM audits a
      JOIN stores s ON s.id = a.store_id
      ${whereSql}
    `,
    ...values
  )

  return formatAdminReportCount(rows[0]?.count ?? 0)
}

async function countEquipment(filters: ReportQueryFilters) {
  const values: unknown[] = []
  const whereSql = getCommonWhereSql(filters, values)
  const rows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
      SELECT COUNT(*)::int AS count
      FROM audit_items ai
      JOIN audits a ON a.id = ai.audit_id
      JOIN stores s ON s.id = a.store_id
      ${whereSql}
    `,
    ...values
  )

  return formatAdminReportCount(rows[0]?.count ?? 0)
}

async function countBranchSummary(filters: ReportQueryFilters) {
  const values: unknown[] = []
  const clauses = [`(${activeStoreWhereSql})`, "s.branch IS NOT NULL"]

  if (filters.branch !== "all") {
    values.push(filters.branch)
    clauses.push(`s.branch = $${values.length}`)
  }

  if (filters.storeType !== "all") {
    values.push(filters.storeType)
    clauses.push(`s.type = $${values.length}`)
  }

  const rows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
      SELECT COUNT(DISTINCT s.branch)::int AS count
      FROM stores s
      WHERE ${clauses.join(" AND ")}
    `,
    ...values
  )

  return formatAdminReportCount(rows[0]?.count ?? 0)
}

async function withAdminGapFilter(
  filters: AdminReportFilters
): Promise<ReportQueryFilters> {
  return { ...filters, gapFilter: await getAdminGapFilterEnabled() }
}

export async function getAdminReportCounts(
  rawFilters: AdminReportFilters,
  master: MasterStoreExportFilters = emptyMasterStoreExportFilters
) {
  const filters = await withAdminGapFilter(rawFilters)
  const [
    storeData,
    auditHistory,
    equipment,
    branchSummary,
    masterStores,
    masterEquipment,
  ] = await Promise.all([
    countStoreData(filters),
    countAuditHistory(filters),
    countEquipment(filters),
    countBranchSummary(filters),
    getMasterStoreCount(toMasterStoreFilters(master)),
    getMasterEquipmentCount(allMasterEquipmentFilters),
  ])

  return {
    "store-data": storeData,
    "audit-history": auditHistory,
    equipment,
    "branch-summary": branchSummary,
    "master-stores": masterStores,
    "master-equipment": masterEquipment,
  } satisfies Record<AdminReportType, number>
}

async function buildStoreDataDataset(
  filters: ReportQueryFilters,
  limit?: number
) {
  const values: unknown[] = []
  const whereSql = getCommonWhereSql(filters, values)
  const limitSql = getLimitSql(values, limit)
  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `
      SELECT
        s.code,
        s.name,
        s.branch,
        s.type,
        h.month_idx AS "monthIdx",
        h.billing_month AS "billingMonth",
        h.sales_transaction_per_day AS std,
        h.pln_usage_kwh AS pln,
        a.total_estimated_kwh_per_month AS baseline,
        a.audit_date AS "auditDate"
      FROM audit_pln_std_history h
      JOIN audits a ON a.id = h.audit_id
      JOIN stores s ON s.id = a.store_id
      ${whereSql}
      ORDER BY a.audit_date DESC, s.code ASC, h.month_idx ASC
      ${limitSql}
    `,
    ...values
  )

  return {
    filename: getFilename("store-data", filters),
    sheetName: reportSheetNames["store-data"],
    columns: [
      { label: "Kode Toko", type: "text" },
      { label: "Nama Toko", type: "text" },
      { label: "Cabang", type: "text" },
      { label: "Tipe Toko", type: "text" },
      { label: "Bulan", type: "text" },
      { label: "STD", type: "number" },
      { label: "PLN kWh", type: "number" },
      { label: "Baseline", type: "number" },
      { label: "Tanggal Kalkulasi", type: "date" },
    ],
    rows: rows.map((row) => [
      toText(row.code),
      toText(row.name),
      toText(row.branch),
      toText(row.type),
      toText(formatMonth(row.monthIdx, row.billingMonth)),
      toRoundedNumber(row.std),
      toRoundedNumber(row.pln),
      toRoundedNumber(row.baseline),
      toDate(row.auditDate as Date | string | null),
    ]),
  } satisfies AdminReportDataset
}

async function buildAuditHistoryDataset(
  filters: ReportQueryFilters,
  limit?: number
) {
  const values: unknown[] = []
  const whereSql = getCommonWhereSql(filters, values)
  const limitSql = getLimitSql(values, limit)
  const iotLookup = await getIotStatusLookup()
  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `
      SELECT
        a.audit_date AS "auditDate",
        s.code,
        s.name,
        s.branch,
        s.type,
        COALESCE(u.full_name, u.email) AS auditor,
        CASE WHEN a.is_boros IS TRUE THEN 'Boros' ELSE 'Hemat' END AS status,
        std.avg_std AS std,
        a.avg_actual_pln_kwh_per_month AS "actualPln",
        a.total_estimated_kwh_per_month AS baseline,
        (
          a.avg_actual_pln_kwh_per_month - a.total_estimated_kwh_per_month
        ) AS gap,
        CASE
          WHEN a.total_estimated_kwh_per_month IS NULL
            OR a.total_estimated_kwh_per_month = 0
          THEN NULL
          ELSE (
            (a.avg_actual_pln_kwh_per_month - a.total_estimated_kwh_per_month)
            / a.total_estimated_kwh_per_month * 100
          )
        END AS "gapPercent",
        rec.recommendations,
        a.validation_status::text AS "validationStatus",
        COALESCE(v.full_name, v.email) AS "validatedBy",
        a.validated_at AS "validatedAt",
        (a.id IN (${await getSangatBorosAuditIdsSql()})) AS "isSangatBoros",
        ea.energy_audits AS "energyAudits"
      FROM audits a
      JOIN stores s ON s.id = a.store_id
      LEFT JOIN users u ON u.id = a.auditor_id
      LEFT JOIN users v ON v.id = a.validated_by_id
      LEFT JOIN LATERAL (
        SELECT AVG(h.sales_transaction_per_day) AS avg_std
        FROM audit_pln_std_history h
        WHERE h.audit_id = a.id
      ) std ON TRUE
      LEFT JOIN LATERAL (
        SELECT STRING_AGG(CONCAT(ar.type, ': ', ar.title), '; ' ORDER BY ar.id) AS recommendations
        FROM audit_recommendations ar
        WHERE ar.audit_id = a.id
      ) rec ON TRUE
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object('category', e.category, 'status', e.status)) AS energy_audits
        FROM energy_audits e
        WHERE e.source_audit_id = a.id
      ) ea ON TRUE
      ${whereSql}
      ORDER BY a.audit_date DESC, s.code ASC
      ${limitSql}
    `,
    ...values
  )

  return {
    filename: getFilename("audit-history", filters),
    sheetName: reportSheetNames["audit-history"],
    columns: [
      { label: "Tanggal Kalkulasi", type: "date" },
      { label: "Kode Toko", type: "text" },
      { label: "Nama Toko", type: "text" },
      { label: "Cabang", type: "text" },
      { label: "Tipe Toko", type: "text" },
      { label: "Auditor", type: "text" },
      { label: "Status", type: "text" },
      { label: "STD", type: "number" },
      { label: "Actual PLN", type: "number" },
      { label: "Baseline", type: "number" },
      { label: "Gap kWh", type: "number" },
      { label: "Gap %", type: "number" },
      { label: "Rekomendasi", type: "text" },
      { label: "Sangat Boros", type: "text" },
      { label: "Status Validasi", type: "text" },
      { label: "Divalidasi Oleh", type: "text" },
      { label: "Tanggal Validasi", type: "date" },
      { label: "Pemeriksaan", type: "text" },
      { label: "Status IoT", type: "text" },
    ],
    rows: rows.map((row) => [
      toDate(row.auditDate as Date | string | null),
      toText(row.code),
      toText(row.name),
      toText(row.branch),
      toText(row.type),
      toText(row.auditor),
      toText(row.status),
      toRoundedNumber(row.std),
      toRoundedNumber(row.actualPln),
      toRoundedNumber(row.baseline),
      toRoundedNumber(row.gap),
      toRoundedNumber(row.gapPercent, 2),
      toText(row.recommendations),
      row.isSangatBoros ? "Ya" : "Tidak",
      row.validationStatus === "VALIDATED" ? "Sudah divalidasi" : "Menunggu validasi",
      toText(row.validatedBy),
      toDate(row.validatedAt as Date | string | null),
      formatEnergyAudits(row.energyAudits),
      formatIotStatus(getStoreIot(iotLookup, String(row.code ?? ""))),
    ]),
  } satisfies AdminReportDataset
}

async function buildEquipmentDataset(
  filters: ReportQueryFilters,
  limit?: number
) {
  const values: unknown[] = []
  const whereSql = getCommonWhereSql(filters, values)
  const limitSql = getLimitSql(values, limit)
  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `
      SELECT
        s.code,
        s.name,
        s.branch,
        s.type,
        a.audit_date AS "auditDate",
        ai.area_target AS area,
        COALESCE(et.name, ai.custom_name, '-') AS equipment,
        COALESCE(eb.name, NULLIF(ai.brand_name, ''), '-') AS brand,
        ai.qty,
        ai.operational_hours AS hours,
        ai.base_kw AS "baseKw",
        ai.estimated_daily_kwh AS "dailyKwh",
        ai.estimated_daily_kwh * 30 AS "monthlyKwh"
      FROM audit_items ai
      JOIN audits a ON a.id = ai.audit_id
      JOIN stores s ON s.id = a.store_id
      LEFT JOIN equipment_types et ON et.id = ai.equipment_type_id
      LEFT JOIN equipment_brands eb ON eb.id = ai.equipment_brand_id
      ${whereSql}
      ORDER BY a.audit_date DESC, s.code ASC, ai.area_target ASC, equipment ASC
      ${limitSql}
    `,
    ...values
  )

  return {
    filename: getFilename("equipment", filters),
    sheetName: reportSheetNames.equipment,
    columns: [
      { label: "Kode Toko", type: "text" },
      { label: "Nama Toko", type: "text" },
      { label: "Cabang", type: "text" },
      { label: "Tipe Toko", type: "text" },
      { label: "Tanggal Kalkulasi", type: "date" },
      { label: "Area", type: "text" },
      { label: "Equipment", type: "text" },
      { label: "Brand", type: "text" },
      { label: "Qty", type: "number" },
      { label: "Jam Operasional", type: "number" },
      { label: "Base kW", type: "kw" },
      { label: "Estimasi kWh/hari", type: "number" },
      { label: "Estimasi kWh/bulan", type: "number" },
    ],
    rows: rows.map((row) => [
      toText(row.code),
      toText(row.name),
      toText(row.branch),
      toText(row.type),
      toDate(row.auditDate as Date | string | null),
      toText(row.area),
      toText(row.equipment),
      toText(row.brand),
      toRoundedNumber(row.qty),
      toRoundedNumber(row.hours, 2),
      toNumber(row.baseKw),
      toRoundedNumber(row.dailyKwh, 2),
      toRoundedNumber(row.monthlyKwh, 2),
    ]),
  } satisfies AdminReportDataset
}

async function buildBranchSummaryDataset(
  filters: ReportQueryFilters,
  limit?: number
) {
  const values: unknown[] = []
  const latestAuditClauses = addCommonWhere({
    filters,
    values,
    auditAlias: "a",
    storeAlias: "s",
  })
  const storeClauses = [`(${activeStoreWhereSql})`, "s.branch IS NOT NULL"]

  if (filters.branch !== "all") {
    values.push(filters.branch)
    storeClauses.push(`s.branch = $${values.length}`)
  }

  if (filters.storeType !== "all") {
    values.push(filters.storeType)
    storeClauses.push(`s.type = $${values.length}`)
  }

  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `
      WITH filtered_stores AS (
        SELECT s.id, s.branch
        FROM stores s
        WHERE ${storeClauses.join(" AND ")}
      ),
      latest_audits AS (
        SELECT *
        FROM (
          SELECT
            a.id,
            a.store_id,
            a.is_boros,
            a.avg_actual_pln_kwh_per_month,
            a.total_estimated_kwh_per_month,
            ROW_NUMBER() OVER (
              PARTITION BY a.store_id
              ORDER BY a.audit_date DESC, a.created_at DESC
            ) AS rn
          FROM audits a
          JOIN stores s ON s.id = a.store_id
          WHERE ${latestAuditClauses.join(" AND ")}
        ) ranked
        WHERE ranked.rn = 1
      )
      SELECT
        fs.branch,
        COUNT(DISTINCT fs.id)::int AS "totalStores",
        COUNT(DISTINCT la.store_id)::int AS "auditedStores",
        COUNT(DISTINCT CASE WHEN la.is_boros IS NOT TRUE THEN la.store_id END)::int AS "hematStores",
        COUNT(DISTINCT CASE WHEN la.is_boros IS TRUE THEN la.store_id END)::int AS "borosStores",
        AVG(la.avg_actual_pln_kwh_per_month) AS "avgActual",
        AVG(la.total_estimated_kwh_per_month) AS "avgBaseline",
        AVG(la.avg_actual_pln_kwh_per_month - la.total_estimated_kwh_per_month) AS "avgGap"
      FROM filtered_stores fs
      LEFT JOIN latest_audits la ON la.store_id = fs.id
      GROUP BY fs.branch
      ORDER BY fs.branch ASC
      ${getLimitSql(values, limit)}
    `,
    ...values
  )

  return {
    filename: getFilename("branch-summary", filters),
    sheetName: reportSheetNames["branch-summary"],
    columns: [
      { label: "Cabang", type: "text" },
      { label: "Total Toko", type: "number" },
      { label: "Toko Dikalkulasi", type: "number" },
      { label: "Coverage %", type: "number" },
      { label: "Toko Hemat", type: "number" },
      { label: "Toko Boros", type: "number" },
      { label: "Boros Rate %", type: "number" },
      { label: "Avg PLN", type: "number" },
      { label: "Avg Baseline", type: "number" },
      { label: "Avg Gap", type: "number" },
    ],
    rows: rows.map((row) => {
      const totalStores = Number(row.totalStores ?? 0)
      const auditedStores = Number(row.auditedStores ?? 0)
      const borosStores = Number(row.borosStores ?? 0)
      const coverage = totalStores > 0 ? (auditedStores / totalStores) * 100 : 0
      const borosRate =
        auditedStores > 0 ? (borosStores / auditedStores) * 100 : 0

      return [
        toText(row.branch),
        totalStores,
        auditedStores,
        toRoundedNumber(coverage, 2),
        toRoundedNumber(row.hematStores),
        toRoundedNumber(row.borosStores),
        toRoundedNumber(borosRate, 2),
        toRoundedNumber(row.avgActual),
        toRoundedNumber(row.avgBaseline),
        toRoundedNumber(row.avgGap),
      ]
    }),
  } satisfies AdminReportDataset
}

// Sorted by branch so the export can group stores under one title row per branch.
function toMasterStoreFilters(master: MasterStoreExportFilters): MasterStoreFilters {
  return {
    q: "",
    branch: master.branches.join(",") || "all",
    type: master.types.join(",") || "all",
    hours: master.hours,
    completeness: master.completeness,
    sort: "branch",
    order: defaultMasterDataOrder,
  }
}

function getMasterStoresFilename(master: MasterStoreExportFilters) {
  const parts = [reportLabels["master-stores"]]
  if (master.branches.length > 0 && master.branches.length <= 3) {
    parts.push(...master.branches.map((branch) => branch.toLowerCase()))
  } else if (master.branches.length > 3) {
    parts.push(`${master.branches.length}-cabang`)
  }
  if (master.types.length > 0 && master.types.length <= 3) {
    parts.push(...master.types.map((type) => type.toLowerCase()))
  } else if (master.types.length > 3) {
    parts.push(`${master.types.length}-tipe`)
  }
  if (master.completeness === "complete") parts.push("lengkap")
  if (master.completeness === "incomplete") parts.push("belum-lengkap")
  if (master.hours === "24h") parts.push("24-jam")
  if (master.hours === "non-24h") parts.push("non-24-jam")
  parts.push(getFilenameDateStamp())

  return `${parts.join("-").replaceAll(/[\s/]+/g, "-")}.xlsx`
}

const allMasterEquipmentFilters: MasterEquipmentFilters = {
  q: "",
  deviceCategory: "all",
  category: "all",
  storeType: "all",
  area: "all",
  powerMode: "all",
  hasBrands: "all",
  sort: defaultMasterEquipmentSort,
  order: defaultMasterDataOrder,
}

async function buildMasterStoresDataset(
  master: MasterStoreExportFilters,
  limit?: number
) {
  const masterFilters = toMasterStoreFilters(master)
  const [{ rows }, branchCounts] = await Promise.all([
    getMasterStoreRows({
      filters: masterFilters,
      offset: 0,
      limit: limit ?? masterExportLimit,
    }),
    getMasterStoreBranchCounts(masterFilters),
  ])
  const countByBranch = new Map(
    branchCounts.map((item) => [item.branch ?? "Tanpa cabang", item.count])
  )

  const columnCount = 16
  const outputRows: AdminReportCellValue[][] = []
  const groupRows: number[] = []
  let currentBranch: string | null | undefined

  for (const row of rows) {
    const branch = row.branch?.trim() || null
    if (branch !== currentBranch) {
      currentBranch = branch
      const label = branch ?? "Tanpa cabang"
      const count = countByBranch.get(label) ?? 0
      groupRows.push(outputRows.length)
      const titleRow = Array<AdminReportCellValue>(columnCount).fill(null)
      titleRow[0] = `${label} · ${count.toLocaleString("id-ID")} toko`
      // Cabang keeps the name so an Excel filter on Cabang still shows this title
      titleRow[2] = branch
      outputRows.push(titleRow)
    }
    outputRows.push(toMasterStoreCells(row))
  }

  return {
    filename: getMasterStoresFilename(master),
    sheetName: reportSheetNames["master-stores"],
    columns: [
      { label: "Kode Toko", type: "text" },
      { label: "Nama Toko", type: "text" },
      { label: "Cabang", type: "text" },
      { label: "Tipe Toko", type: "text" },
      { label: "ID PLN", type: "text" },
      { label: "Daya PLN (VA)", type: "integer" },
      { label: "Jam Operasional", type: "text" },
      { label: "Total Area (m2)", type: "number" },
      { label: "Sales (m2)", type: "number" },
      { label: "Parkir (m2)", type: "number" },
      { label: "Teras (m2)", type: "number" },
      { label: "Gudang (m2)", type: "number" },
      { label: "Toilet (m2)", type: "number" },
      { label: "Selasar (m2)", type: "number" },
      { label: "Kelengkapan Data (%)", type: "integer" },
      { label: "Terakhir Diperbarui", type: "date" },
    ],
    rows: outputRows,
    groupRows,
  } satisfies AdminReportDataset
}

function toMasterStoreCells(
  row: Awaited<ReturnType<typeof getMasterStoreRows>>["rows"][number]
): AdminReportCellValue[] {
  return [
      row.code,
      row.name,
      toText(row.branch),
      toText(row.type || null),
      toText(row.plnCustomerId),
      row.plnPowerVa,
      row.is24Hours
        ? "24 jam"
        : row.openTime && row.closeTime
          ? `${row.openTime} - ${row.closeTime}`
          : null,
      toRoundedNumber(row.totalAreaM2, 2),
      toRoundedNumber(row.salesAreaM2, 2),
      toRoundedNumber(row.parkingAreaM2, 2),
      toRoundedNumber(row.terraceAreaM2, 2),
      toRoundedNumber(row.warehouseAreaM2, 2),
      toRoundedNumber(row.toiletAreaM2, 2),
      toRoundedNumber(row.corridorAreaM2, 2),
      getMasterStoreCompleteness(row),
      toDate(row.updatedAt),
    ]
}


async function buildMasterEquipmentDataset(
  filters: ReportQueryFilters,
  limit?: number
) {
  const { rows } = await getMasterEquipmentRows({
    filters: allMasterEquipmentFilters,
    offset: 0,
    limit: limit ?? masterExportLimit,
  })

  return {
    filename: getFilename("master-equipment", filters),
    sheetName: reportSheetNames["master-equipment"],
    columns: [
      { label: "Equipment", type: "text" },
      { label: "Brand", type: "text" },
      { label: "Kategori Jenis", type: "text" },
      { label: "Area Penempatan", type: "text" },
      { label: "Tipe Toko", type: "text" },
      { label: "Target Area Brand", type: "text" },
      { label: "Metode Kalkulasi", type: "text" },
      { label: "Durasi Kalkulasi", type: "integer" },
      { label: "Default kW", type: "kw" },
      { label: "Base kW", type: "kw" },
      { label: "Standby kW", type: "kw" },
      { label: "Running kW", type: "kw" },
      { label: "Foto Produk", type: "text" },
      { label: "Foto Nameplate", type: "text" },
      { label: "Dibuat", type: "date" },
    ],
    rows: rows.map((row) => [
      row.equipmentName,
      toText(row.brandName || null),
      toText(row.deviceCategory),
      toText(row.category),
      row.storeType ?? "Semua tipe",
      row.area,
      row.calcMethod,
      toNumber(row.calcDuration),
      toNumber(row.defaultKw),
      toNumber(row.baseKw),
      toNumber(row.standbyKw),
      toNumber(row.runningKw),
      row.productPhotoUrl,
      row.nameplatePhotoUrl,
      toDate(row.createdAt),
    ]),
  } satisfies AdminReportDataset
}

export async function buildAdminReportDataset({
  report,
  filters: rawFilters,
  master = emptyMasterStoreExportFilters,
  limit,
}: {
  report: AdminReportType
  filters: AdminReportFilters
  master?: MasterStoreExportFilters
  limit?: number
}) {
  const filters = await withAdminGapFilter(rawFilters)
  const datasetByReport: Record<
    AdminReportType,
    () => Promise<AdminReportDataset>
  > = {
    "store-data": () => buildStoreDataDataset(filters, limit),
    "audit-history": () => buildAuditHistoryDataset(filters, limit),
    equipment: () => buildEquipmentDataset(filters, limit),
    "branch-summary": () => buildBranchSummaryDataset(filters, limit),
    "master-stores": () => buildMasterStoresDataset(master, limit),
    "master-equipment": () => buildMasterEquipmentDataset(filters, limit),
  }

  return datasetByReport[report]()
}
