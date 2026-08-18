import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBolt,
  IconBuildingStore,
  IconChartBar,
  IconFileDescription,
  IconLeaf,
  IconSortAscending,
  IconSortDescending,
  IconTool,
} from "@tabler/icons-react"

import { ConsumptionTrendChart } from "@/components/admin/admin-dashboard-charts"
import { AdminMetricCard } from "@/components/admin/admin-metric-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { getAdminAuditDetail } from "@/lib/admin-audit-detail"
import { cn } from "@/lib/utils"

type Props = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    equipmentSort?: string
    equipmentOrder?: string
  }>
}

type AdminAuditDetail = NonNullable<
  Awaited<ReturnType<typeof getAdminAuditDetail>>
>
type EquipmentRow = AdminAuditDetail["items"][number]

type EquipmentSortKey =
  | "area"
  | "name"
  | "brand"
  | "qty"
  | "operationalHours"
  | "baseKw"
  | "estimatedDailyKwh"

type SortOrder = "asc" | "desc"

const equipmentSortLabels: Record<EquipmentSortKey, string> = {
  area: "Area",
  name: "Equipment",
  brand: "Merek",
  qty: "Qty",
  operationalHours: "Jam",
  baseKw: "kW",
  estimatedDailyKwh: "kWh/hari",
}

const equipmentSortKeys = new Set<EquipmentSortKey>(
  Object.keys(equipmentSortLabels) as EquipmentSortKey[]
)

const numberFormat = new Intl.NumberFormat("id-ID")
const shortMonthLabels: Record<string, string> = {
  januari: "Jan",
  februari: "Feb",
  maret: "Mar",
  april: "Apr",
  mei: "Mei",
  juni: "Jun",
  juli: "Jul",
  agustus: "Agu",
  september: "Sep",
  oktober: "Okt",
  november: "Nov",
  desember: "Des",
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function formatShortMonthYear(value: string) {
  const parts = value.trim().split(/\s+/)
  const month = shortMonthLabels[parts[0]?.toLowerCase() ?? ""]
  const year = parts.find((part) => /^\d{4}$/.test(part))

  if (!month || !year) return value

  return `${month} ${year.slice(-2)}`
}

function formatNumber(value: number, suffix = "") {
  return `${numberFormat.format(Math.round(value))}${suffix}`
}

function formatDecimal(value: number, suffix = "") {
  return `${numberFormat.format(Math.round(value * 10) / 10)}${suffix}`
}

function formatGapPercent(value: number | null) {
  if (value === null) return "No baseline"
  return `${value > 0 ? "+" : ""}${formatDecimal(value, "%")}`
}

function StatusBadge({ isBoros }: { isBoros: boolean | null }) {
  if (isBoros) {
    return (
      <Badge variant="destructive">
        <IconAlertTriangle data-icon="inline-start" />
        Boros
      </Badge>
    )
  }

  return (
    <Badge>
      <IconLeaf data-icon="inline-start" />
      Hemat
    </Badge>
  )
}

function getRecommendationLabel(type: string) {
  if (type === "TRAINING") return "Training"
  if (type === "REPAIR") return "Repair"
  if (type === "MAINTENANCE") return "Maintenance"
  return type
}

function getRecommendationClass(type: string) {
  if (type === "REPAIR") return "border-destructive/25 bg-destructive/5"
  if (type === "TRAINING") {
    return "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20"
  }
  return "border-primary/25 bg-primary/5"
}

function parseEquipmentSort(value: string | undefined): EquipmentSortKey {
  return value && equipmentSortKeys.has(value as EquipmentSortKey)
    ? (value as EquipmentSortKey)
    : "area"
}

function parseSortOrder(value: string | undefined): SortOrder {
  return value === "desc" ? "desc" : "asc"
}

function compareEquipmentRows(
  a: EquipmentRow,
  b: EquipmentRow,
  sort: EquipmentSortKey
) {
  const first = a[sort]
  const second = b[sort]

  if (typeof first === "number" && typeof second === "number") {
    return first - second
  }

  return String(first ?? "").localeCompare(String(second ?? ""), "id", {
    numeric: true,
    sensitivity: "base",
  })
}

function sortEquipmentRows(
  rows: EquipmentRow[],
  sort: EquipmentSortKey,
  order: SortOrder
) {
  return [...rows].sort((a, b) => {
    const result = compareEquipmentRows(a, b, sort)
    return order === "asc" ? result : -result
  })
}

function getEquipmentSortHref(
  auditId: string,
  column: EquipmentSortKey,
  currentSort: EquipmentSortKey,
  currentOrder: SortOrder
) {
  const params = new URLSearchParams()
  const nextOrder =
    currentSort === column && currentOrder === "asc" ? "desc" : "asc"

  params.set("equipmentSort", column)
  params.set("equipmentOrder", nextOrder)

  return `/admin/audits/${auditId}?${params.toString()}`
}

function SortableEquipmentHeader({
  auditId,
  column,
  currentSort,
  currentOrder,
  align = "left",
  children,
}: {
  auditId: string
  column: EquipmentSortKey
  currentSort: EquipmentSortKey
  currentOrder: SortOrder
  align?: "left" | "right"
  children: ReactNode
}) {
  const active = currentSort === column
  const Icon = currentOrder === "desc" ? IconSortDescending : IconSortAscending

  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <Link
        href={getEquipmentSortHref(auditId, column, currentSort, currentOrder)}
        className={cn(
          "inline-flex items-center gap-1.5 text-foreground underline-offset-4 hover:underline",
          align === "right" && "justify-end"
        )}
      >
        {children}
        <Icon
          className={cn(
            "size-3.5",
            active ? "text-foreground" : "text-muted-foreground/50"
          )}
        />
      </Link>
    </TableHead>
  )
}

export default async function AdminAuditDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params
  const query = searchParams ? await searchParams : {}
  const audit = await getAdminAuditDetail(id)

  if (!audit) notFound()

  const equipmentSort = parseEquipmentSort(query.equipmentSort)
  const equipmentOrder = parseSortOrder(query.equipmentOrder)
  const equipmentRows = sortEquipmentRows(
    audit.items,
    equipmentSort,
    equipmentOrder
  )
  const trendData = audit.plnHistory.map((row) => ({
    month: formatShortMonthYear(row.billingMonth),
    actualPln: row.plnUsageKwh,
    baseline: audit.baseline,
    std: row.salesTransactionPerDay,
  }))
  const maxDailyKwh = Math.max(
    1,
    ...audit.items.map((item) => item.estimatedDailyKwh)
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Audit {audit.store.code}
            </h1>
            <StatusBadge isBoros={audit.isBoros} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {audit.store.name} · {audit.store.branch ?? "Tanpa cabang"} ·{" "}
            {formatDate(audit.auditDate)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/audits">
              <IconArrowLeft data-icon="inline-start" />
              Riwayat Audit
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/stores/${audit.store.id}`}>
              <IconBuildingStore data-icon="inline-start" />
              Buka Detail Toko
            </Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Actual PLN"
          value={formatNumber(audit.actualPln, " kWh")}
          description="Rata-rata PLN dari audit ini"
          icon={IconBolt}
          tone={audit.isBoros ? "danger" : "success"}
        />
        <AdminMetricCard
          label="Baseline"
          value={formatNumber(audit.baseline, " kWh")}
          description="Estimasi wajar dari equipment"
          icon={IconChartBar}
          tone="default"
        />
        <AdminMetricCard
          label="Gap"
          value={`${audit.gapKwh > 0 ? "+" : ""}${formatNumber(
            audit.gapKwh,
            " kWh"
          )}`}
          description={formatGapPercent(audit.gapPercent)}
          icon={IconAlertTriangle}
          tone={audit.isBoros ? "danger" : "default"}
        />
        <AdminMetricCard
          label="Total Equipment"
          value={formatNumber(audit.totalQty)}
          description={`${formatNumber(audit.totalMonthlyKwh, " kWh/bln")} estimasi`}
          icon={IconTool}
          tone="info"
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Card size="sm" className="h-full gap-3">
          <CardHeader>
            <CardTitle className="text-sm">Informasi Toko</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] sm:grid-cols-3">
              {[
                ["Kode toko", audit.store.code],
                ["Nama toko", audit.store.name],
                ["Cabang", audit.store.branch ?? "-"],
                ["ID PLN", audit.store.plnCustomerId ?? "-"],
                ["Daya", formatNumber(audit.store.plnPowerVa, " VA")],
                [
                  "Jam",
                  audit.store.is24Hours
                    ? "24 jam"
                    : `${audit.store.openTime ?? "-"} - ${
                        audit.store.closeTime ?? "-"
                      }`,
                ],
                ["Tipe", audit.store.type],
                ["Total area", formatDecimal(audit.store.totalAreaM2, " m²")],
                ["Sales", formatDecimal(audit.store.salesAreaM2, " m²")],
                ["Parkir", formatDecimal(audit.store.parkingAreaM2, " m²")],
                ["Teras", formatDecimal(audit.store.terraceAreaM2, " m²")],
                ["Gudang", formatDecimal(audit.store.warehouseAreaM2, " m²")],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-0 rounded-md bg-muted/35 px-2 py-1.5"
                >
                  <p className="truncate text-muted-foreground">{label}</p>
                  <p className="truncate leading-tight font-medium">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card size="sm" className="h-full gap-3">
          <CardHeader>
            <CardTitle className="text-sm">Informasi Audit</CardTitle>
            <CardAction>
              <StatusBadge isBoros={audit.isBoros} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] sm:grid-cols-3">
              {[
                ["Tanggal audit", formatDate(audit.auditDate)],
                ["Auditor", audit.auditor.name],
                ["Email auditor", audit.auditor.email],
                ["Actual PLN", formatNumber(audit.actualPln, " kWh")],
                ["Baseline", formatNumber(audit.baseline, " kWh")],
                [
                  "Gap",
                  `${audit.gapKwh > 0 ? "+" : ""}${formatNumber(
                    audit.gapKwh,
                    " kWh"
                  )}`,
                ],
                ["Gap %", formatGapPercent(audit.gapPercent)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-0 rounded-md bg-muted/35 px-2 py-1.5"
                >
                  <p className="truncate text-muted-foreground">{label}</p>
                  <p className="truncate leading-tight font-medium">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Tren Pemakaian PLN &amp; Baseline</CardTitle>
            <CardDescription>
              Perbandingan aktual pemakaian PLN dan baseline estimasi beban pada audit ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ConsumptionTrendChart data={trendData} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Audit ini belum memiliki histori PLN.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rekomendasi Audit</CardTitle>
            <CardDescription>
              Rekomendasi tindakan yang dihasilkan dari audit ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {audit.recommendations.length > 0 ? (
              audit.recommendations.map((item) => (
                <div
                  key={`${item.type}-${item.title}`}
                  className={cn(
                    "rounded-lg border px-4 py-3",
                    getRecommendationClass(item.type)
                  )}
                >
                  <Badge variant="secondary">
                    <IconFileDescription data-icon="inline-start" />
                    {getRecommendationLabel(item.type)}
                  </Badge>
                  <p className="mt-3 text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Audit ini belum memiliki rekomendasi.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Equipment Audit</CardTitle>
          <CardDescription>
            Detail equipment, area, merek, jam operasional, dan estimasi kWh.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto px-0 pb-0">
          <Table className="min-w-[900px] text-xs [&_td]:px-4 [&_td]:py-2 [&_th]:px-4">
            <TableHeader>
              <TableRow>
                <SortableEquipmentHeader
                  auditId={audit.id}
                  column="area"
                  currentSort={equipmentSort}
                  currentOrder={equipmentOrder}
                >
                  Area
                </SortableEquipmentHeader>
                <SortableEquipmentHeader
                  auditId={audit.id}
                  column="name"
                  currentSort={equipmentSort}
                  currentOrder={equipmentOrder}
                >
                  Equipment
                </SortableEquipmentHeader>
                <SortableEquipmentHeader
                  auditId={audit.id}
                  column="brand"
                  currentSort={equipmentSort}
                  currentOrder={equipmentOrder}
                >
                  Merek
                </SortableEquipmentHeader>
                <SortableEquipmentHeader
                  auditId={audit.id}
                  column="qty"
                  currentSort={equipmentSort}
                  currentOrder={equipmentOrder}
                  align="right"
                >
                  Qty
                </SortableEquipmentHeader>
                <SortableEquipmentHeader
                  auditId={audit.id}
                  column="operationalHours"
                  currentSort={equipmentSort}
                  currentOrder={equipmentOrder}
                  align="right"
                >
                  Jam
                </SortableEquipmentHeader>
                <SortableEquipmentHeader
                  auditId={audit.id}
                  column="baseKw"
                  currentSort={equipmentSort}
                  currentOrder={equipmentOrder}
                  align="right"
                >
                  kW
                </SortableEquipmentHeader>
                <SortableEquipmentHeader
                  auditId={audit.id}
                  column="estimatedDailyKwh"
                  currentSort={equipmentSort}
                  currentOrder={equipmentOrder}
                  align="right"
                >
                  kWh/hari
                </SortableEquipmentHeader>
                <TableHead className="w-40">Kontribusi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipmentRows.map((item, index) => (
                <TableRow key={`${item.area}-${item.name}-${index}`}>
                  <TableCell>{item.area}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.brand}
                  </TableCell>
                  <TableCell className="text-right">{item.qty}</TableCell>
                  <TableCell className="text-right">
                    {formatDecimal(item.operationalHours)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDecimal(item.baseKw)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDecimal(item.estimatedDailyKwh)}
                  </TableCell>
                  <TableCell>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(
                            100,
                            (item.estimatedDailyKwh / maxDailyKwh) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
