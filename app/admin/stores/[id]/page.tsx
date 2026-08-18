import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBolt,
  IconBuildingStore,
  IconChartBar,
  IconClipboardCheck,
  IconFileDescription,
  IconLeaf,
  IconRulerMeasure,
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
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAdminStoreDetail } from "@/lib/admin-store-detail"
import { cn } from "@/lib/utils"

type Props = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    equipmentSort?: string
    equipmentOrder?: string
  }>
}

type AdminStoreDetail = NonNullable<
  Awaited<ReturnType<typeof getAdminStoreDetail>>
>
type EquipmentRow = AdminStoreDetail["equipmentSummary"]["rows"][number]

type EquipmentSortKey =
  | "area"
  | "name"
  | "brand"
  | "qty"
  | "operationalHours"
  | "baseKw"
  | "dailyKwh"

type SortOrder = "asc" | "desc"

const equipmentSortLabels: Record<EquipmentSortKey, string> = {
  area: "Area",
  name: "Equipment",
  brand: "Merek",
  qty: "Qty",
  operationalHours: "Jam",
  baseKw: "kW",
  dailyKwh: "kWh/hari",
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

function formatGapPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "No baseline"
  return `${value > 0 ? "+" : ""}${formatDecimal(value, "%")}`
}

function StatusBadge({ status }: { status: "hemat" | "boros" }) {
  if (status === "boros") {
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
  storeId: string,
  column: EquipmentSortKey,
  currentSort: EquipmentSortKey,
  currentOrder: SortOrder
) {
  const params = new URLSearchParams()
  const nextOrder =
    currentSort === column && currentOrder === "asc" ? "desc" : "asc"

  params.set("equipmentSort", column)
  params.set("equipmentOrder", nextOrder)

  return `/admin/stores/${storeId}?${params.toString()}`
}

function SortableEquipmentHeader({
  storeId,
  column,
  currentSort,
  currentOrder,
  align = "left",
  children,
}: {
  storeId: string
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
        href={getEquipmentSortHref(storeId, column, currentSort, currentOrder)}
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

export default async function AdminStoreDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params
  const query = searchParams ? await searchParams : {}
  const detail = await getAdminStoreDetail(id)

  if (!detail) notFound()

  const { identity, latestAudit, equipmentSummary } = detail
  const equipmentSort = parseEquipmentSort(query.equipmentSort)
  const equipmentOrder = parseSortOrder(query.equipmentOrder)
  const equipmentRows = sortEquipmentRows(
    equipmentSummary.rows,
    equipmentSort,
    equipmentOrder
  )
  const trendData = detail.monthlyTrend.map((item) => ({
    month: formatShortMonthYear(item.month),
    actualPln: item.plnKwh,
    baseline: item.baseline,
    std: item.std,
  }))
  const maxDailyKwh = Math.max(
    1,
    ...equipmentSummary.rows.map((item) => item.dailyKwh)
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {identity.name}
            </h1>
            {latestAudit ? <StatusBadge status={latestAudit.status} /> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {identity.code} · {identity.branch ?? "Tanpa cabang"} ·{" "}
            {identity.type || "Tipe belum diisi"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/stores">
              <IconArrowLeft data-icon="inline-start" />
              Monitoring Toko
            </Link>
          </Button>
          {latestAudit ? (
            <Button asChild>
              <Link href={`/admin/audits/${latestAudit.id}`}>
                <IconClipboardCheck data-icon="inline-start" />
                Buka Audit Terakhir
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Actual PLN"
          value={
            latestAudit ? formatNumber(latestAudit.actualPln, " kWh") : "-"
          }
          description="Rata-rata PLN audit terakhir"
          icon={IconBolt}
          tone={latestAudit?.isBoros ? "danger" : "success"}
        />
        <AdminMetricCard
          label="Baseline"
          value={latestAudit ? formatNumber(latestAudit.baseline, " kWh") : "-"}
          description="Estimasi wajar dari equipment"
          icon={IconChartBar}
          tone="default"
        />
        <AdminMetricCard
          label="Gap"
          value={
            latestAudit
              ? `${latestAudit.gapKwh > 0 ? "+" : ""}${formatNumber(
                  latestAudit.gapKwh,
                  " kWh"
                )}`
              : "-"
          }
          description={
            latestAudit
              ? formatGapPercent(latestAudit.gapPercent)
              : "Belum ada audit"
          }
          icon={IconAlertTriangle}
          tone={latestAudit?.isBoros ? "danger" : "default"}
        />
        <AdminMetricCard
          label="kWh/m²"
          value={
            latestAudit
              ? formatDecimal(latestAudit.actualKwhPerM2, " kWh/m²")
              : "-"
          }
          description="Intensitas aktual per luas toko"
          icon={IconRulerMeasure}
          tone="info"
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Card size="sm" className="h-full gap-3">
          <CardHeader>
            <CardTitle className="text-sm">Identitas Toko</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] sm:grid-cols-3">
              {[
                ["Kode toko", identity.code],
                ["Nama toko", identity.name],
                ["Cabang", identity.branch ?? "-"],
                ["ID PLN", identity.plnCustomerId ?? "-"],
                ["Daya", formatNumber(identity.plnPowerVa, " VA")],
                [
                  "Jam",
                  identity.is24Hours
                    ? "24 jam"
                    : `${identity.openTime ?? "-"} - ${
                        identity.closeTime ?? "-"
                      }`,
                ],
                ["Tipe", identity.type || "-"],
                ["Total area", formatDecimal(identity.totalAreaM2, " m²")],
                ["Sales", formatDecimal(identity.salesAreaM2, " m²")],
                ["Parkir", formatDecimal(identity.parkingAreaM2, " m²")],
                ["Teras", formatDecimal(identity.terraceAreaM2, " m²")],
                ["Gudang", formatDecimal(identity.warehouseAreaM2, " m²")],
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
            <CardTitle className="text-sm">Informasi Audit Terakhir</CardTitle>
            {latestAudit ? (
              <CardAction>
                <StatusBadge status={latestAudit.status} />
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent>
            {latestAudit ? (
              <div className="grid grid-cols-2 gap-1.5 text-[11px] sm:grid-cols-3">
                {[
                  ["Tanggal audit", formatDate(latestAudit.auditDate)],
                  ["Auditor", latestAudit.auditorName],
                  ["Actual PLN", formatNumber(latestAudit.actualPln, " kWh")],
                  ["Baseline", formatNumber(latestAudit.baseline, " kWh")],
                  [
                    "Gap",
                    `${latestAudit.gapKwh > 0 ? "+" : ""}${formatNumber(
                      latestAudit.gapKwh,
                      " kWh"
                    )}`,
                  ],
                  ["Gap %", formatGapPercent(latestAudit.gapPercent)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-md bg-muted/35 px-2 py-1.5"
                  >
                    <p className="truncate text-muted-foreground">{label}</p>
                    <p className="truncate leading-tight font-medium">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Toko ini belum pernah diaudit.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Tren Pemakaian Listrik PLN</CardTitle>
            <CardDescription>
              Riwayat aktual pemakaian listrik PLN dari audit toko ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ConsumptionTrendChart data={trendData} showBaseline={false} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada data PLN bulanan.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rekomendasi Audit</CardTitle>
            <CardDescription>
              Rekomendasi dari audit terakhir toko ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {latestAudit?.recommendation ? (
              <div
                className={cn(
                  "rounded-lg border px-4 py-3",
                  getRecommendationClass(latestAudit.recommendation.type)
                )}
              >
                <Badge variant="secondary">
                  <IconFileDescription data-icon="inline-start" />
                  {getRecommendationLabel(latestAudit.recommendation.type)}
                </Badge>
                <p className="mt-3 text-sm font-medium">
                  {latestAudit.recommendation.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {latestAudit.recommendation.description}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada rekomendasi audit.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Konsumsi per Area</CardTitle>
            <CardDescription>Estimasi kWh equipment per area.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {equipmentSummary.areaBreakdown.length > 0 ? (
              equipmentSummary.areaBreakdown.map((item) => (
                <div key={item.area} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{item.area}</span>
                    <span className="text-muted-foreground">
                      {formatNumber(item.monthlyKwh, " kWh")} · {item.percent}%
                    </span>
                  </div>
                  <Progress value={item.percent} className="h-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada equipment pada audit terakhir.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Equipment</CardTitle>
            <CardDescription>
              Equipment dengan estimasi konsumsi terbesar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">kWh/bln</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipmentSummary.topEquipment.slice(0, 5).map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(item.monthlyKwh)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Equipment Audit Terakhir</CardTitle>
          <CardDescription>
            Detail equipment, area, merek, jam operasional, dan estimasi kWh.
          </CardDescription>
          <CardAction className="hidden items-end gap-4 text-right text-xs md:flex">
            <div>
              <p className="text-muted-foreground">Total equipment</p>
              <p className="font-semibold">
                {formatNumber(equipmentSummary.totalQty)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Estimasi bulanan</p>
              <p className="font-semibold">
                {formatNumber(equipmentSummary.totalMonthlyKwh, " kWh")}
              </p>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="overflow-auto px-0 pb-0">
          <Table className="min-w-[900px] text-xs [&_td]:px-4 [&_td]:py-2 [&_th]:px-4">
            <TableHeader>
              <TableRow>
                <SortableEquipmentHeader
                  storeId={identity.id}
                  column="area"
                  currentSort={equipmentSort}
                  currentOrder={equipmentOrder}
                >
                  Area
                </SortableEquipmentHeader>
                <SortableEquipmentHeader
                  storeId={identity.id}
                  column="name"
                  currentSort={equipmentSort}
                  currentOrder={equipmentOrder}
                >
                  Equipment
                </SortableEquipmentHeader>
                <SortableEquipmentHeader
                  storeId={identity.id}
                  column="brand"
                  currentSort={equipmentSort}
                  currentOrder={equipmentOrder}
                >
                  Merek
                </SortableEquipmentHeader>
                <SortableEquipmentHeader
                  storeId={identity.id}
                  column="qty"
                  currentSort={equipmentSort}
                  currentOrder={equipmentOrder}
                  align="right"
                >
                  Qty
                </SortableEquipmentHeader>
                <SortableEquipmentHeader
                  storeId={identity.id}
                  column="operationalHours"
                  currentSort={equipmentSort}
                  currentOrder={equipmentOrder}
                  align="right"
                >
                  Jam
                </SortableEquipmentHeader>
                <SortableEquipmentHeader
                  storeId={identity.id}
                  column="baseKw"
                  currentSort={equipmentSort}
                  currentOrder={equipmentOrder}
                  align="right"
                >
                  kW
                </SortableEquipmentHeader>
                <SortableEquipmentHeader
                  storeId={identity.id}
                  column="dailyKwh"
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
                    {formatDecimal(item.dailyKwh)}
                  </TableCell>
                  <TableCell>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(
                            100,
                            (item.dailyKwh / maxDailyKwh) * 100
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

      <Card>
        <CardHeader>
          <CardTitle>Timeline Audit Toko</CardTitle>
          <CardDescription>
            Perubahan status dan gap dari audit sebelumnya.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {detail.auditTimeline.length > 0 ? (
            detail.auditTimeline.map((audit) => (
              <Link
                key={audit.id}
                href={`/admin/audits/${audit.id}`}
                className="flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <IconTool className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {formatDate(audit.auditDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {audit.auditorName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <StatusBadge status={audit.status} />
                  <Badge
                    variant={
                      audit.gapPercent && audit.gapPercent > 0
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {formatGapPercent(audit.gapPercent)}
                  </Badge>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
              <IconBuildingStore className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Belum pernah diaudit</p>
              <p className="text-xs text-muted-foreground">
                Toko ini belum memiliki audit completed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
