import Link from "next/link"
import type { ReactNode } from "react"
import {
  IconAlertTriangle,
  IconBuildingStore,
  IconLeaf,
  IconProgressCheck,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { prisma } from "@/lib/prisma"

type SearchParams = Promise<{
  period?: string
  months?: string
  branch?: string
  sort?: string
  order?: string
}>

type BranchSortKey =
  | "branch"
  | "totalStores"
  | "auditedStores"
  | "notAuditedStores"
  | "hematStores"
  | "borosStores"
  | "borosRate"
  | "avgGap"
  | "coverage"

type SortOrder = "asc" | "desc"

type BranchAuditSummaryRow = {
  branch: string
  totalStores: number
  auditedStores: number
  notAuditedStores: number
  coverage: number
  hematStores: number
  borosStores: number
  borosRate: number
  avgActual: number
  avgBaseline: number
  avgGap: number
}

type BranchDominantRow = {
  branch: string
  area: string
  areaKwh: number
  equipment: string
  equipmentKwh: number
}

type RawBranchAuditSummaryRow = Omit<
  BranchAuditSummaryRow,
  "coverage" | "borosRate" | "avgGap"
>

type RawBranchDominantRow = BranchDominantRow

const numberFormat = new Intl.NumberFormat("id-ID")

const areaLabels: Record<string, string> = {
  PARKING: "Parkir",
  TERRACE: "Teras",
  SALES: "Sales",
  WAREHOUSE: "Gudang",
}

function getStartOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1, 0, 0, 0, 0)
}

function getStartOfNextMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 1, 0, 0, 0, 0)
}

function parseMonthValue(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  if (!Number.isInteger(year) || month < 1 || month > 12) return null

  return { year, monthIndex: month - 1 }
}

function formatNumber(value: number) {
  return numberFormat.format(Math.round(value))
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatKwh(value: number) {
  return `${formatNumber(value)} kWh`
}

function getAreaLabel(value: string) {
  return areaLabels[value] ?? value
}

function getRate(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : 0
}

function calculateGapPercent(actual: number, baseline: number) {
  if (baseline <= 0) return 0
  return Math.round(((actual - baseline) / baseline) * 1000) / 10
}

function parseBranchSort(value: string | undefined): BranchSortKey {
  const validSorts = new Set<BranchSortKey>([
    "branch",
    "totalStores",
    "auditedStores",
    "notAuditedStores",
    "hematStores",
    "borosStores",
    "borosRate",
    "avgGap",
    "coverage",
  ])

  return validSorts.has(value as BranchSortKey)
    ? (value as BranchSortKey)
    : "branch"
}

function parseSortOrder(value: string | undefined): SortOrder {
  return value === "desc" ? "desc" : "asc"
}

function getNextSortOrder({
  currentSort,
  currentOrder,
  column,
}: {
  currentSort: BranchSortKey
  currentOrder: SortOrder
  column: BranchSortKey
}) {
  if (currentSort !== column) return column === "branch" ? "asc" : "desc"
  return currentOrder === "asc" ? "desc" : "asc"
}

function sortBranchRows(
  rows: BranchAuditSummaryRow[],
  sort: BranchSortKey,
  order: SortOrder
) {
  return [...rows].sort((a, b) => {
    const modifier = order === "asc" ? 1 : -1

    if (sort === "branch") {
      return a.branch.localeCompare(b.branch, "id-ID") * modifier
    }

    return (a[sort] - b[sort]) * modifier
  })
}

function getSortHref(
  params: Awaited<SearchParams>,
  column: BranchSortKey,
  currentSort: BranchSortKey,
  currentOrder: SortOrder
) {
  const nextParams = new URLSearchParams()

  if (params.period) nextParams.set("period", params.period)
  if (params.months) nextParams.set("months", params.months)
  if (params.branch) nextParams.set("branch", params.branch)

  nextParams.set("sort", column)
  nextParams.set(
    "order",
    getNextSortOrder({ currentSort, currentOrder, column })
  )

  return `/admin/branches?${nextParams.toString()}`
}

function buildBranchesQueryParts(params: Awaited<SearchParams>) {
  const values: unknown[] = []
  const storeConditions = [
    "(s.branch IS NULL OR lower(s.branch) NOT IN ('demo', 'head office'))",
  ]
  const branch = params.branch?.trim()

  if (branch && branch !== "all") {
    values.push(branch)
    storeConditions.push(`s.branch = $${values.length}`)
  }

  const now = new Date()
  const period = params.period ?? "ytd"
  let auditDateWhere = ""

  if (period === "month") {
    values.push(getStartOfMonth(now.getFullYear(), now.getMonth()))
    const startIndex = values.length
    values.push(getStartOfNextMonth(now.getFullYear(), now.getMonth()))
    auditDateWhere = `a.audit_date >= $${startIndex} AND a.audit_date < $${values.length}`
  } else if (period === "custom") {
    const monthRanges = (params.months ?? "")
      .split(",")
      .map((item) => parseMonthValue(item.trim()))
      .filter((item): item is { year: number; monthIndex: number } =>
        Boolean(item)
      )

    if (monthRanges.length > 0) {
      const clauses = monthRanges.map((item) => {
        values.push(getStartOfMonth(item.year, item.monthIndex))
        const startIndex = values.length
        values.push(getStartOfNextMonth(item.year, item.monthIndex))
        return `(a.audit_date >= $${startIndex} AND a.audit_date < $${values.length})`
      })

      auditDateWhere = `(${clauses.join(" OR ")})`
    }
  }

  if (!auditDateWhere) {
    values.push(new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0))
    const startIndex = values.length
    values.push(now)
    auditDateWhere = `a.audit_date >= $${startIndex} AND a.audit_date <= $${values.length}`
  }

  return {
    storeWhere: storeConditions.join(" AND "),
    auditDateWhere,
    values,
  }
}

function getStoreScopeSql(storeWhere: string) {
  return `
    store_scope AS (
      SELECT
        s.id,
        coalesce(s.branch, 'Tanpa Cabang') AS branch
      FROM stores s
      WHERE ${storeWhere}
    )
  `
}

function getLatestAuditSql(auditDateWhere: string) {
  return `
    latest_audits AS (
      SELECT DISTINCT ON (a.store_id)
        a.id,
        a.store_id,
        a.is_boros,
        coalesce(a.total_estimated_kwh_per_month, 0)::float8 AS baseline,
        coalesce(a.avg_actual_pln_kwh_per_month, 0)::float8 AS actual,
        ss.branch,
        s.code,
        s.name
      FROM audits a
      INNER JOIN store_scope ss ON ss.id = a.store_id
      INNER JOIN stores s ON s.id = a.store_id
      WHERE a.status = 'COMPLETED'
        AND ${auditDateWhere}
      ORDER BY a.store_id, a.audit_date DESC, a.created_at DESC
    )
  `
}

function serializeBranchSummaryRow(
  row: RawBranchAuditSummaryRow
): BranchAuditSummaryRow {
  const totalStores = Number(row.totalStores)
  const auditedStores = Number(row.auditedStores)
  const hematStores = Number(row.hematStores)
  const borosStores = Number(row.borosStores)
  const avgActual = Number(row.avgActual ?? 0)
  const avgBaseline = Number(row.avgBaseline ?? 0)

  return {
    branch: row.branch,
    totalStores,
    auditedStores,
    notAuditedStores: Math.max(totalStores - auditedStores, 0),
    coverage: getRate(auditedStores, totalStores),
    hematStores,
    borosStores,
    borosRate: getRate(borosStores, auditedStores),
    avgActual,
    avgBaseline,
    avgGap: calculateGapPercent(avgActual, avgBaseline),
  }
}

function getBestBranch(rows: BranchAuditSummaryRow[]) {
  return [...rows]
    .filter((row) => row.auditedStores > 0)
    .sort((a, b) => a.borosRate - b.borosRate || b.coverage - a.coverage)[0]
}

function getWorstBranch(rows: BranchAuditSummaryRow[]) {
  return [...rows]
    .filter((row) => row.auditedStores > 0)
    .sort((a, b) => b.borosRate - a.borosRate || b.avgGap - a.avgGap)[0]
}

function getLowestCoverageBranch(rows: BranchAuditSummaryRow[]) {
  return [...rows]
    .filter((row) => row.totalStores > 0)
    .sort((a, b) => a.coverage - b.coverage || b.totalStores - a.totalStores)[0]
}

async function getBranchSummaryRows(params: Awaited<SearchParams>) {
  const { storeWhere, auditDateWhere, values } = buildBranchesQueryParts(params)
  const rows = await prisma.$queryRawUnsafe<RawBranchAuditSummaryRow[]>(
    `
      WITH
        ${getStoreScopeSql(storeWhere)},
        ${getLatestAuditSql(auditDateWhere)}
      SELECT
        ss.branch,
        count(ss.id)::int AS "totalStores",
        count(la.store_id)::int AS "auditedStores",
        greatest(count(ss.id) - count(la.store_id), 0)::int AS "notAuditedStores",
        coalesce(sum(CASE WHEN la.is_boros IS FALSE THEN 1 ELSE 0 END), 0)::int AS "hematStores",
        coalesce(sum(CASE WHEN la.is_boros IS TRUE THEN 1 ELSE 0 END), 0)::int AS "borosStores",
        coalesce(avg(la.actual), 0)::float8 AS "avgActual",
        coalesce(avg(la.baseline), 0)::float8 AS "avgBaseline"
      FROM store_scope ss
      LEFT JOIN latest_audits la ON la.store_id = ss.id
      GROUP BY ss.branch
      ORDER BY lower(ss.branch) ASC
    `,
    ...values
  )

  return rows.map(serializeBranchSummaryRow)
}

async function getBranchDominantRows(params: Awaited<SearchParams>) {
  const { storeWhere, auditDateWhere, values } = buildBranchesQueryParts(params)
  const rows = await prisma.$queryRawUnsafe<RawBranchDominantRow[]>(
    `
      WITH
        ${getStoreScopeSql(storeWhere)},
        ${getLatestAuditSql(auditDateWhere)},
        branch_items AS (
          SELECT
            la.branch,
            ai.area_target::text AS area,
            coalesce(et.name, nullif(ai.custom_name, ''), 'Lainnya') AS equipment,
            coalesce(ai.estimated_daily_kwh, 0)::float8 AS daily_kwh
          FROM latest_audits la
          INNER JOIN audit_items ai ON ai.audit_id = la.id
          LEFT JOIN equipment_types et ON et.id = ai.equipment_type_id
        ),
        area_rank AS (
          SELECT
            branch,
            area,
            sum(daily_kwh)::float8 AS "areaKwh",
            row_number() OVER (
              PARTITION BY branch
              ORDER BY sum(daily_kwh) DESC
            ) AS rank
          FROM branch_items
          GROUP BY branch, area
        ),
        equipment_rank AS (
          SELECT
            branch,
            equipment,
            sum(daily_kwh)::float8 AS "equipmentKwh",
            row_number() OVER (
              PARTITION BY branch
              ORDER BY sum(daily_kwh) DESC
            ) AS rank
          FROM branch_items
          GROUP BY branch, equipment
        )
      SELECT
        coalesce(ar.branch, er.branch) AS branch,
        coalesce(ar.area, '-') AS area,
        coalesce(ar."areaKwh", 0)::float8 AS "areaKwh",
        coalesce(er.equipment, '-') AS equipment,
        coalesce(er."equipmentKwh", 0)::float8 AS "equipmentKwh"
      FROM area_rank ar
      FULL JOIN equipment_rank er ON er.branch = ar.branch AND er.rank = 1
      WHERE coalesce(ar.rank, 1) = 1
      ORDER BY coalesce(ar."areaKwh", 0) DESC
      LIMIT 10
    `,
    ...values
  )

  return rows.map((row) => ({
    branch: row.branch,
    area: getAreaLabel(row.area),
    areaKwh: Number(row.areaKwh ?? 0),
    equipment: row.equipment,
    equipmentKwh: Number(row.equipmentKwh ?? 0),
  }))
}

function BentoMetric({
  label,
  value,
  icon: Icon,
  tone = "default",
  rows,
  className,
}: {
  label: string
  value: string
  icon: typeof IconProgressCheck
  tone?: "default" | "primary" | "destructive"
  rows: Array<{ label: string; value: string }>
  className?: string
}) {
  return (
    <Card size="sm" className={className}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-xl">{value}</CardTitle>
        <CardAction>
          <Icon
            className={
              tone === "primary"
                ? "size-5 text-primary"
                : tone === "destructive"
                  ? "size-5 text-destructive"
                  : "size-5 text-muted-foreground"
            }
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 text-xs">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3"
            >
              <span className="truncate text-muted-foreground">
                {row.label}
              </span>
              <span className="shrink-0 font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SortableHeader({
  children,
  column,
  currentSort,
  currentOrder,
  params,
  align = "left",
  className,
}: {
  children: ReactNode
  column: BranchSortKey
  currentSort: BranchSortKey
  currentOrder: SortOrder
  params: Awaited<SearchParams>
  align?: "left" | "right"
  className?: string
}) {
  const isActive = currentSort === column
  const Icon = currentOrder === "asc" ? IconSortAscending : IconSortDescending

  return (
    <Link
      href={getSortHref(params, column, currentSort, currentOrder)}
      className={[
        "inline-flex w-full items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground",
        align === "right" ? "justify-end" : "justify-start",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{children}</span>
      {isActive && <Icon className="size-3.5" />}
    </Link>
  )
}

export default async function AdminBranchesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const sort = parseBranchSort(params.sort)
  const order = parseSortOrder(params.order)
  const rows = sortBranchRows(await getBranchSummaryRows(params), sort, order)
  const dominantRows = await getBranchDominantRows(params)
  const totalStores = rows.reduce((total, row) => total + row.totalStores, 0)
  const auditedStores = rows.reduce(
    (total, row) => total + row.auditedStores,
    0
  )
  const borosStores = rows.reduce((total, row) => total + row.borosStores, 0)
  const coverage = getRate(auditedStores, totalStores)
  const bestBranch = getBestBranch(rows)
  const worstBranch = getWorstBranch(rows)
  const lowCoverageBranch = getLowestCoverageBranch(rows)

  return (
    <div className="-mt-4 flex min-h-[calc(100svh-var(--header-height)-1rem)] flex-col md:-mt-6 md:min-h-[calc(100svh-var(--header-height))]">
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="-mx-4 flex min-h-0 flex-1 flex-col border-y md:-mx-6">
          <div className="grid auto-rows-fr gap-3 px-4 py-4 md:grid-cols-2 md:px-6 xl:grid-cols-4">
            <Card size="sm">
              <CardHeader>
                <CardDescription>Performa Cabang</CardDescription>
                <CardTitle className="text-xl">
                  {formatPercent(coverage)}
                </CardTitle>
                <CardAction>
                  <IconProgressCheck className="size-5 text-muted-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="rounded-full bg-primary"
                    style={{ width: `${coverage}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Cabang</p>
                    <p className="mt-0.5 font-medium">
                      {formatNumber(rows.length)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Toko</p>
                    <p className="mt-0.5 font-medium">
                      {formatNumber(totalStores)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Boros</p>
                    <p className="mt-0.5 font-medium">
                      {formatNumber(borosStores)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <BentoMetric
              label="Cabang Paling Efisien"
              value={bestBranch?.branch ?? "-"}
              icon={IconLeaf}
              tone="primary"
              rows={[
                {
                  label: "Boros Rate",
                  value: bestBranch ? formatPercent(bestBranch.borosRate) : "-",
                },
                {
                  label: "Coverage",
                  value: bestBranch ? formatPercent(bestBranch.coverage) : "-",
                },
              ]}
            />

            <BentoMetric
              label="Cabang Paling Boros"
              value={worstBranch?.branch ?? "-"}
              icon={IconAlertTriangle}
              tone="destructive"
              rows={[
                {
                  label: "Boros Rate",
                  value: worstBranch
                    ? formatPercent(worstBranch.borosRate)
                    : "-",
                },
                {
                  label: "Avg Gap",
                  value: worstBranch
                    ? `${worstBranch.avgGap > 0 ? "+" : ""}${formatPercent(
                        worstBranch.avgGap
                      )}`
                    : "-",
                },
              ]}
            />

            <BentoMetric
              label="Coverage Terendah"
              value={lowCoverageBranch?.branch ?? "-"}
              icon={IconBuildingStore}
              rows={[
                {
                  label: "Coverage",
                  value: lowCoverageBranch
                    ? formatPercent(lowCoverageBranch.coverage)
                    : "-",
                },
                {
                  label: "Belum Audit",
                  value: lowCoverageBranch
                    ? formatNumber(lowCoverageBranch.notAuditedStores)
                    : "-",
                },
              ]}
            />
          </div>

          <div className="px-4 pb-4 md:px-6">
            <Card size="sm">
              <CardHeader>
                <CardTitle>Ringkasan Audit per Cabang</CardTitle>
                <CardDescription>
                  Coverage audit dan status hemat/boros berdasarkan audit
                  terakhir tiap toko dalam periode aktif.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[980px] text-xs [&_td]:px-2 [&_td]:py-2 [&_th]:h-9 [&_th]:px-2">
                    <TableHeader className="bg-background shadow-[0_1px_0_var(--border)]">
                      <TableRow>
                        <TableHead className="pl-6">
                          <SortableHeader
                            column="branch"
                            currentSort={sort}
                            currentOrder={order}
                            params={params}
                          >
                            Cabang
                          </SortableHeader>
                        </TableHead>
                        <TableHead className="text-right">
                          <SortableHeader
                            column="totalStores"
                            currentSort={sort}
                            currentOrder={order}
                            params={params}
                            align="right"
                          >
                            Total Toko
                          </SortableHeader>
                        </TableHead>
                        <TableHead className="text-right">
                          <SortableHeader
                            column="auditedStores"
                            currentSort={sort}
                            currentOrder={order}
                            params={params}
                            align="right"
                          >
                            Sudah Audit
                          </SortableHeader>
                        </TableHead>
                        <TableHead className="text-right">
                          <SortableHeader
                            column="notAuditedStores"
                            currentSort={sort}
                            currentOrder={order}
                            params={params}
                            align="right"
                          >
                            Belum Audit
                          </SortableHeader>
                        </TableHead>
                        <TableHead className="text-right">
                          <SortableHeader
                            column="hematStores"
                            currentSort={sort}
                            currentOrder={order}
                            params={params}
                            align="right"
                          >
                            Hemat
                          </SortableHeader>
                        </TableHead>
                        <TableHead className="text-right">
                          <SortableHeader
                            column="borosStores"
                            currentSort={sort}
                            currentOrder={order}
                            params={params}
                            align="right"
                          >
                            Boros
                          </SortableHeader>
                        </TableHead>
                        <TableHead className="text-right">
                          <SortableHeader
                            column="borosRate"
                            currentSort={sort}
                            currentOrder={order}
                            params={params}
                            align="right"
                          >
                            Boros Rate
                          </SortableHeader>
                        </TableHead>
                        <TableHead className="text-right">
                          <SortableHeader
                            column="avgGap"
                            currentSort={sort}
                            currentOrder={order}
                            params={params}
                            align="right"
                          >
                            Avg Gap
                          </SortableHeader>
                        </TableHead>
                        <TableHead>
                          <SortableHeader
                            column="coverage"
                            currentSort={sort}
                            currentOrder={order}
                            params={params}
                          >
                            Coverage
                          </SortableHeader>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.branch}>
                          <TableCell className="pl-6 font-medium">
                            {row.branch}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(row.totalStores)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(row.auditedStores)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatNumber(row.notAuditedStores)}
                          </TableCell>
                          <TableCell className="text-right text-primary">
                            {formatNumber(row.hematStores)}
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            {formatNumber(row.borosStores)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                row.borosRate >= 50
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {formatPercent(row.borosRate)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                row.avgGap > 0 ? "destructive" : "default"
                              }
                            >
                              {row.avgGap > 0 ? "+" : ""}
                              {formatPercent(row.avgGap)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex min-w-32 items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${row.coverage}%` }}
                                />
                              </div>
                              <span className="w-12 text-right text-xs font-medium tabular-nums">
                                {formatPercent(row.coverage)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="px-4 pb-4 md:px-6">
            <Card size="sm">
              <CardHeader>
                <CardTitle>Dominan Area & Equipment</CardTitle>
                <CardDescription>
                  Kontributor kWh harian terbesar dari audit terakhir tiap toko.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[560px] text-xs [&_td]:px-2 [&_td]:py-2 [&_th]:h-9 [&_th]:px-2">
                    <TableHeader className="bg-background shadow-[0_1px_0_var(--border)]">
                      <TableRow>
                        <TableHead className="pl-6">Cabang</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Equipment</TableHead>
                        <TableHead className="text-right">kWh/Hari</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dominantRows.map((row) => (
                        <TableRow key={row.branch}>
                          <TableCell className="pl-6 font-medium">
                            {row.branch}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{row.area}</p>
                              <p className="text-muted-foreground">
                                {formatKwh(row.areaKwh)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="max-w-40 truncate">{row.equipment}</p>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatKwh(row.equipmentKwh)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
