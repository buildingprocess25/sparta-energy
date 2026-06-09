import Link from "next/link"
import {
  IconArrowRight,
  IconAlertTriangle,
  IconBuildingStore,
  IconLeaf,
  IconTrendingUp,
} from "@tabler/icons-react"
import type { Prisma } from "@prisma/client"

import { ConsumptionTrendChart } from "@/components/admin/admin-dashboard-charts"
import { AdminMetricCard } from "@/components/admin/admin-metric-card"
import { Badge } from "@/components/ui/badge"
import {
  Card,
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
  year?: string
  month?: string
  branch?: string
  type?: string
}>

const numberFormat = new Intl.NumberFormat("id-ID")
const compactNumberFormat = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
})
const tableLinkClass =
  "text-primary underline underline-offset-2 decoration-chart-2 transition-colors hover:decoration-primary"

type CompletedAuditRow = {
  id: string
  storeId: string
  auditDate: Date
  isBoros: boolean | null
  totalEstimatedKwhPerMonth: unknown
  avgActualPlnKwhPerMonth: unknown
  store: {
    code: string
    name: string
    branch: string | null
    type: string
    is24Hours: boolean
    openTime: string | null
    closeTime: string | null
  }
  plnHistory: Array<{
    billingMonth: string
    monthIdx: number
    plnUsageKwh: unknown
    salesTransactionPerDay: unknown
  }>
}

const excludedBranchNames = [
  "DEMO",
  "Demo",
  "demo",
  "HEAD OFFICE",
  "Head Office",
  "head office",
]

const storeBranchFilter = {
  OR: [
    { branch: null },
    {
      branch: { notIn: excludedBranchNames },
    },
  ],
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

function getAuditDateFilter(params: Awaited<SearchParams>) {
  const now = new Date()
  const parsedYear = Number(params.year)
  const year = Number.isInteger(parsedYear) ? parsedYear : now.getFullYear()
  const month = params.month ? parseMonthValue(`${year}-${params.month}`) : null

  if (month) {
    return {
      gte: getStartOfMonth(month.year, month.monthIndex),
      lt: getStartOfNextMonth(month.year, month.monthIndex),
    }
  }

  if (params.year) {
    return {
      gte: new Date(year, 0, 1, 0, 0, 0, 0),
      lt: new Date(year + 1, 0, 1, 0, 0, 0, 0),
    }
  }

  return {
    gte: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),
    lte: now,
  }
}

function getStoreFilter(params: Awaited<SearchParams>): Prisma.StoreWhereInput {
  const branch = params.branch?.trim()
  const type = params.type?.trim()
  const conditions: Prisma.StoreWhereInput[] = [storeBranchFilter]

  if (branch && branch !== "all") {
    const branches = branch.split(",").map((b) => b.trim()).filter(Boolean)
    if (branches.length > 0) {
      conditions.push({ branch: { in: branches } })
    }
  }

  if (type && type !== "all") {
    const types = type.split(",").map((t) => t.trim()).filter(Boolean)
    if (types.length > 0) {
      conditions.push({ type: { in: types } })
    }
  }

  return { AND: conditions }
}

function formatNumber(value: number) {
  return numberFormat.format(Math.round(value))
}

function formatCompact(value: number) {
  return compactNumberFormat.format(Math.round(value))
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function calculateGapPercent(actual: unknown, baseline: unknown) {
  const actualValue = Number(actual ?? 0)
  const baselineValue = Number(baseline ?? 0)
  if (baselineValue <= 0) return 0
  return Math.round(((actualValue - baselineValue) / baselineValue) * 1000) / 10
}

const monthNumberByLabel: Record<string, number> = {
  januari: 1,
  jan: 1,
  february: 2,
  februari: 2,
  feb: 2,
  march: 3,
  maret: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  mei: 5,
  june: 6,
  juni: 6,
  jun: 6,
  july: 7,
  juli: 7,
  jul: 7,
  august: 8,
  agustus: 8,
  agu: 8,
  aug: 8,
  september: 9,
  sep: 9,
  october: 10,
  oktober: 10,
  okt: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  desember: 12,
  des: 12,
  dec: 12,
}

const trendMonthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "2-digit",
})

function normalizeTrendMonth(
  label: string,
  fallbackYear: number,
  fallbackMonth: number
) {
  const normalized = label.trim().toLowerCase()
  const monthToken = normalized.match(/[a-zA-Z]+/)?.[0] ?? ""
  const parsedMonth = monthNumberByLabel[monthToken] ?? fallbackMonth
  const yearToken = normalized.match(/\b(\d{2}|\d{4})\b/)?.[1]
  const parsedYear = yearToken
    ? yearToken.length === 2
      ? 2000 + Number(yearToken)
      : Number(yearToken)
    : fallbackYear

  const sortValue = parsedYear * 100 + parsedMonth
  const key = `${parsedYear}-${String(parsedMonth).padStart(2, "0")}`
  const displayLabel = trendMonthFormatter.format(
    new Date(parsedYear, parsedMonth - 1, 1)
  )

  return { key, label: displayLabel, sortValue }
}

function getLatestAuditByStore(audits: CompletedAuditRow[]) {
  const latestByStore = new Map<string, CompletedAuditRow>()

  for (const audit of audits) {
    if (!latestByStore.has(audit.storeId)) {
      latestByStore.set(audit.storeId, audit)
    }
  }

  return Array.from(latestByStore.values())
}

function getConsumptionTrend(audits: CompletedAuditRow[]) {
  const grouped = new Map<
    string,
    {
      month: string
      sortValue: number
      actualTotal: number
      baselineTotal: number
      stdTotal: number
      count: number
    }
  >()

  for (const audit of audits) {
    const baseline = Number(audit.totalEstimatedKwhPerMonth ?? 0)
    const auditYear = audit.auditDate.getFullYear()

    for (const row of audit.plnHistory) {
      const fallbackMonth = Math.min(Math.max(row.monthIdx, 1), 12)
      const month = normalizeTrendMonth(
        row.billingMonth,
        auditYear,
        fallbackMonth
      )
      const current = grouped.get(month.key) ?? {
        month: month.label,
        sortValue: month.sortValue,
        actualTotal: 0,
        baselineTotal: 0,
        stdTotal: 0,
        count: 0,
      }

      current.actualTotal += Number(row.plnUsageKwh ?? 0)
      current.baselineTotal += baseline
      current.stdTotal += Number(row.salesTransactionPerDay ?? 0)
      current.count += 1
      grouped.set(month.key, current)
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => a.sortValue - b.sortValue)
    .slice(-6)
    .map((item) => ({
      month: item.month,
      actualPln: item.count > 0 ? Math.round(item.actualTotal / item.count) : 0,
      baseline:
        item.count > 0 ? Math.round(item.baselineTotal / item.count) : 0,
      std: item.count > 0 ? Math.round(item.stdTotal / item.count) : 0,
    }))
}

function formatOperatingHours(
  is24Hours: boolean,
  openTime: string | null,
  closeTime: string | null
) {
  if (is24Hours) return "24 jam"
  if (openTime && closeTime) return `${openTime} - ${closeTime}`
  return "-"
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const storeFilter = getStoreFilter(params)
  const auditDateFilter = getAuditDateFilter(params)
  const auditWhere: Prisma.AuditWhereInput = {
    status: "COMPLETED",
    store: storeFilter,
    auditDate: auditDateFilter,
  }

  const [totalStores, completedAuditsRaw] = await Promise.all([
    prisma.store.count({
      where: storeFilter,
    }),
    prisma.audit.findMany({
      where: auditWhere,
      orderBy: { auditDate: "desc" },
      select: {
        id: true,
        storeId: true,
        auditDate: true,
        isBoros: true,
        totalEstimatedKwhPerMonth: true,
        avgActualPlnKwhPerMonth: true,
        store: {
          select: {
            code: true,
            name: true,
            branch: true,
            type: true,
            is24Hours: true,
            openTime: true,
            closeTime: true,
          },
        },
        plnHistory: {
          orderBy: { monthIdx: "asc" },
          select: {
            billingMonth: true,
            monthIdx: true,
            plnUsageKwh: true,
            salesTransactionPerDay: true,
          },
        },
      },
    }),
  ])

  // TEMPORARY_HIDE_GAP_GT_30
  const completedAudits = completedAuditsRaw.filter((audit) => {
    const baseline = Number(audit.totalEstimatedKwhPerMonth ?? 0)
    const actual = Number(audit.avgActualPlnKwhPerMonth ?? 0)
    
    // Hide if baseline/estimasi is NULL or <= 0
    if (baseline <= 0) return false
    
    // Gap check: must be between -35% and +35%
    const gapPercent = ((actual - baseline) / baseline) * 100
    if (gapPercent < -35 || gapPercent > 35) return false

    // STD check: average salesTransactionPerDay must be between 100 and 600
    const stdHistory = audit.plnHistory
      .map((h) => Number(h.salesTransactionPerDay))
      .filter((val) => !isNaN(val) && val !== null)
    
    // Hide if no STD history data is found
    if (stdHistory.length === 0) return false
    
    const avgStd = stdHistory.reduce((acc, val) => acc + val, 0) / stdHistory.length
    if (avgStd < 100 || avgStd > 600) return false

    return true
  })

  const latestAudits = getLatestAuditByStore(completedAudits)
  const auditedStores = latestAudits.length
  const hematStores = latestAudits.filter((audit) => !audit.isBoros).length
  const borosStores = latestAudits.filter((audit) => audit.isBoros).length
  const hematPercent =
    auditedStores > 0
      ? Math.round((hematStores / auditedStores) * 1000) / 10
      : 0
  const borosPercent =
    auditedStores > 0
      ? Math.round((borosStores / auditedStores) * 1000) / 10
      : 0
  const coverage =
    totalStores > 0 ? Math.round((auditedStores / totalStores) * 1000) / 10 : 0

  const avgActual =
    auditedStores > 0
      ? latestAudits.reduce(
          (total, audit) => total + Number(audit.avgActualPlnKwhPerMonth ?? 0),
          0
        ) / auditedStores
      : 0

  const avgBaseline =
    auditedStores > 0
      ? latestAudits.reduce(
          (total, audit) =>
            total + Number(audit.totalEstimatedKwhPerMonth ?? 0),
          0
        ) / auditedStores
      : 0

  const consumptionGap = calculateGapPercent(avgActual, avgBaseline)
  const consumptionTrend = getConsumptionTrend(latestAudits)

  const topWastefulStores = latestAudits
    .filter((audit) => audit.isBoros)
    .map((audit) => ({
      id: audit.id,
      code: audit.store.code,
      name: audit.store.name,
      branch: audit.store.branch ?? "-",
      type: audit.store.type,
      operationalHours: formatOperatingHours(
        audit.store.is24Hours,
        audit.store.openTime,
        audit.store.closeTime
      ),
      baseline: Number(audit.totalEstimatedKwhPerMonth ?? 0),
      actual: Number(audit.avgActualPlnKwhPerMonth ?? 0),
      gapPercent: calculateGapPercent(
        audit.avgActualPlnKwhPerMonth,
        audit.totalEstimatedKwhPerMonth
      ),
    }))
    .sort((a, b) => b.gapPercent - a.gapPercent)
    .slice(0, 10)

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Total Audited Stores"
          value={numberFormat.format(auditedStores)}
          icon={IconBuildingStore}
          tone="info"
          valueClassName="text-3xl"
          rows={[
            { label: "Total Stores", value: formatNumber(totalStores) },
            { label: "Coverage", value: `${coverage.toFixed(1)}%` },
          ]}
        >
          <Link
            href="/admin/branches"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
          >
            Lihat performa cabang
            <IconArrowRight className="size-3.5" />
          </Link>
        </AdminMetricCard>

        <AdminMetricCard
          label="Status Efisiensi"
          value={`${formatPercent(hematPercent)} Hemat`}
          icon={IconLeaf}
          tone={borosPercent > hematPercent ? "danger" : "success"}
          className="justify-between xl:col-span-2"
        >
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <IconLeaf className="size-3.5 text-primary" />
                  Hemat
                </div>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <span className="text-2xl font-semibold">
                    {numberFormat.format(hematStores)}
                  </span>
                  <span className="pb-0.5 text-xs font-semibold text-primary">
                    {formatPercent(hematPercent)}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <IconAlertTriangle className="size-3.5 text-destructive" />
                  Boros
                </div>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <span className="text-2xl font-semibold">
                    {numberFormat.format(borosStores)}
                  </span>
                  <span className="pb-0.5 text-xs font-semibold text-destructive">
                    {formatPercent(borosPercent)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
              {auditedStores > 0 ? (
                <>
                  <div
                    className="bg-primary"
                    style={{ width: `${hematPercent}%` }}
                  />
                  <div
                    className="bg-destructive"
                    style={{ width: `${borosPercent}%` }}
                  />
                </>
              ) : (
                <div className="w-full bg-muted-foreground/20" />
              )}
            </div>
          </div>
        </AdminMetricCard>

        <AdminMetricCard
          label="Consumption Overview"
          value={`Gap ${consumptionGap > 0 ? "+" : ""}${consumptionGap.toFixed(
            1
          )}%`}
          icon={IconTrendingUp}
          tone={consumptionGap > 0 ? "danger" : "success"}
          rows={[
            { label: "Avg PLN kWh", value: formatCompact(avgActual) },
            { label: "Avg Baseline", value: formatCompact(avgBaseline) },
          ]}
        />
      </section>

      <section>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Tren PLN, Baseline & STD</CardTitle>
            <CardDescription>
              Rata-rata dari audit terakhir tiap toko.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConsumptionTrendChart data={consumptionTrend} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Top 10 Wasteful Stores</CardTitle>
            <CardDescription>
              Toko boros dengan gap aktual PLN terbesar terhadap baseline.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[1040px] text-xs [&_td]:px-2 [&_td]:py-2 [&_th]:h-9 [&_th]:px-2">
                <TableHeader className="bg-background shadow-[0_1px_0_var(--border)]">
                  <TableRow>
                    <TableHead className="pl-6">Code</TableHead>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Jam Operasional</TableHead>
                    <TableHead className="text-right">Baseline</TableHead>
                    <TableHead className="text-right">Actual PLN</TableHead>
                    <TableHead className="text-right">Gap %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topWastefulStores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="pl-6 font-medium">
                        <Link
                          href={`/admin/audits/${store.id}`}
                          className={tableLinkClass}
                        >
                          {store.code}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-72 truncate">{store.name}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {store.branch}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {store.type}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {store.operationalHours}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(store.baseline)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(store.actual)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">
                          +{store.gapPercent.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
