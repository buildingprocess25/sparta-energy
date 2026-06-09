import { prisma } from "@/lib/prisma"

export type AdminReportType =
  | "store-data"
  | "audit-history"
  | "equipment"
  | "branch-summary"

export type AdminReportStatus = "hemat" | "boros"

export type AdminReportFilters = {
  year: string
  month: string
  branch: string
  storeType: string
  status: AdminReportStatus | "all"
}

type CountRow = {
  count: number | bigint
}

type OptionRow = {
  value: string
}

export type AdminReportColumn = {
  label: string
  type: "text" | "number" | "date" | "kw"
}

export type AdminReportCellValue = string | number | Date | null

export type AdminReportDataset = {
  filename: string
  sheetName: string
  columns: AdminReportColumn[]
  rows: AdminReportCellValue[][]
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
  "audit-history": "riwayat-audit",
  equipment: "equipment-audit",
  "branch-summary": "ringkasan-cabang",
}

const reportSheetNames: Record<AdminReportType, string> = {
  "store-data": "Data Toko",
  "audit-history": "Riwayat Audit",
  equipment: "Equipment",
  "branch-summary": "Ringkasan Cabang",
}

export function parseAdminReportType(
  value: string | null | undefined
): AdminReportType | null {
  if (
    value === "store-data" ||
    value === "audit-history" ||
    value === "equipment" ||
    value === "branch-summary"
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

function getDateRange(filters: AdminReportFilters) {
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
  filters: AdminReportFilters
  values: unknown[]
  auditAlias?: string
  storeAlias?: string
  includeStatus?: boolean
}) {
  const clauses = [
    `${auditAlias}.status = 'COMPLETED'`,
    `(${activeStoreWhereSql.replaceAll("s.", `${storeAlias}.`)})`,
  ]

  // TEMPORARY_HIDE_GAP_GT_30
  clauses.push(`(
    ${auditAlias}.total_estimated_kwh_per_month IS NULL 
    OR ${auditAlias}.total_estimated_kwh_per_month = 0 
    OR (${auditAlias}.avg_actual_pln_kwh_per_month - ${auditAlias}.total_estimated_kwh_per_month) / ${auditAlias}.total_estimated_kwh_per_month <= 0.3
  )`)

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

function getCommonWhereSql(filters: AdminReportFilters, values: unknown[]) {
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

function getFilenameDateStamp() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function getFilename(report: AdminReportType, filters: AdminReportFilters) {
  const parts = [reportLabels[report]]

  if (filters.year !== "all") parts.push(filters.year)
  if (filters.month !== "all") parts.push(filters.month)
  if (filters.branch !== "all") parts.push(filters.branch.toLowerCase())
  if (filters.storeType !== "all") parts.push(filters.storeType.toLowerCase())
  if (filters.status !== "all") parts.push(filters.status)
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

async function countStoreData(filters: AdminReportFilters) {
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

async function countAuditHistory(filters: AdminReportFilters) {
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

async function countEquipment(filters: AdminReportFilters) {
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

async function countBranchSummary(filters: AdminReportFilters) {
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

export async function getAdminReportCounts(filters: AdminReportFilters) {
  const [storeData, auditHistory, equipment, branchSummary] = await Promise.all(
    [
      countStoreData(filters),
      countAuditHistory(filters),
      countEquipment(filters),
      countBranchSummary(filters),
    ]
  )

  return {
    "store-data": storeData,
    "audit-history": auditHistory,
    equipment,
    "branch-summary": branchSummary,
  } satisfies Record<AdminReportType, number>
}

async function buildStoreDataDataset(
  filters: AdminReportFilters,
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
      { label: "Tanggal Audit", type: "date" },
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
  filters: AdminReportFilters,
  limit?: number
) {
  const values: unknown[] = []
  const whereSql = getCommonWhereSql(filters, values)
  const limitSql = getLimitSql(values, limit)
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
        rec.recommendations
      FROM audits a
      JOIN stores s ON s.id = a.store_id
      LEFT JOIN users u ON u.id = a.auditor_id
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
      { label: "Tanggal Audit", type: "date" },
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
    ]),
  } satisfies AdminReportDataset
}

async function buildEquipmentDataset(
  filters: AdminReportFilters,
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
      { label: "Tanggal Audit", type: "date" },
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
  filters: AdminReportFilters,
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
      { label: "Toko Diaudit", type: "number" },
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

export async function buildAdminReportDataset({
  report,
  filters,
  limit,
}: {
  report: AdminReportType
  filters: AdminReportFilters
  limit?: number
}) {
  const datasetByReport: Record<
    AdminReportType,
    () => Promise<AdminReportDataset>
  > = {
    "store-data": () => buildStoreDataDataset(filters, limit),
    "audit-history": () => buildAuditHistoryDataset(filters, limit),
    equipment: () => buildEquipmentDataset(filters, limit),
    "branch-summary": () => buildBranchSummaryDataset(filters, limit),
  }

  return datasetByReport[report]()
}
