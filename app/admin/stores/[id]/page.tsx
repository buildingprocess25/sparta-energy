import Link from "next/link"
import { notFound } from "next/navigation"
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBook,
  IconBolt,
  IconBuildingStore,
  IconChartBar,
  IconCheck,
  IconClipboardList,
  IconLeaf,
  IconRulerMeasure,
  IconSparkles,
  IconTool,
} from "@tabler/icons-react"

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
}

const numberFormat = new Intl.NumberFormat("id-ID")

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function formatNumber(value: number, suffix = "") {
  return `${numberFormat.format(Math.round(value))}${suffix}`
}

function formatDecimal(value: number, suffix = "") {
  return `${numberFormat.format(value)}${suffix}`
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

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: string
  description: string
  icon: typeof IconBolt
  tone?: "default" | "danger" | "success"
}) {
  return (
    <Card
      size="sm"
      className={cn(
        tone === "danger" && "ring-destructive/30",
        tone === "success" && "ring-primary/30"
      )}
    >
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
        <CardAction>
          <Icon className="size-5 text-muted-foreground" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function getRecommendationStyle(type: "TRAINING" | "REPAIR" | "MAINTENANCE") {
  if (type === "TRAINING") {
    return {
      label: "SOP Training",
      icon: IconBook,
      className:
        "border-amber-200 bg-linear-to-br from-amber-50 via-card to-card ring-amber-300/40 dark:border-amber-900/60 dark:from-amber-950/35",
      iconClassName:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      badgeClassName:
        "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    }
  }

  if (type === "REPAIR") {
    return {
      label: "Equipment Repair",
      icon: IconTool,
      className:
        "border-destructive/30 bg-linear-to-br from-destructive/12 via-card to-card ring-destructive/25",
      iconClassName: "bg-destructive/10 text-destructive",
      badgeClassName: "bg-destructive/10 text-destructive",
    }
  }

  return {
    label: "Maintain Good",
    icon: IconCheck,
    className:
      "border-primary/25 bg-linear-to-br from-primary/12 via-card to-card ring-primary/25",
    iconClassName: "bg-primary/10 text-primary",
    badgeClassName: "bg-primary/10 text-primary",
  }
}

export default async function AdminStoreDetailPage({ params }: Props) {
  const { id } = await params
  const detail = await getAdminStoreDetail(id)

  if (!detail) notFound()

  const { identity, latestAudit, dataCompleteness, equipmentSummary } = detail
  const maxTrendValue = Math.max(
    1,
    ...detail.monthlyTrend.map((item) => Math.max(item.plnKwh, item.baseline))
  )
  const topArea = equipmentSummary.areaBreakdown[0]
  const topEquipment = equipmentSummary.topEquipment[0]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div>
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
        </div>

        {latestAudit ? (
          <Button asChild>
            <Link href={`/audit/${latestAudit.id}`}>
              <IconClipboardList data-icon="inline-start" />
              Buka Audit Terakhir
            </Link>
          </Button>
        ) : null}
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Actual PLN"
          value={
            latestAudit ? formatNumber(latestAudit.actualPln, " kWh") : "-"
          }
          description="Rata-rata PLN audit terakhir"
          icon={IconBolt}
          tone={latestAudit?.isBoros ? "danger" : "success"}
        />
        <MetricCard
          label="Baseline"
          value={latestAudit ? formatNumber(latestAudit.baseline, " kWh") : "-"}
          description="Estimasi wajar dari equipment"
          icon={IconChartBar}
        />
        <MetricCard
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
            latestAudit?.gapPercent !== null && latestAudit
              ? `${latestAudit.gapPercent > 0 ? "+" : ""}${formatDecimal(
                  latestAudit.gapPercent,
                  "%"
                )} terhadap baseline`
              : "Belum ada audit"
          }
          icon={IconAlertTriangle}
          tone={latestAudit?.isBoros ? "danger" : "default"}
        />
        <MetricCard
          label="kWh/m²"
          value={
            latestAudit
              ? formatDecimal(latestAudit.actualKwhPerM2, " kWh/m²")
              : "-"
          }
          description="Intensitas aktual per luas toko"
          icon={IconRulerMeasure}
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">Identitas Toko</CardTitle>
            <CardDescription className="text-xs">
              Data master ringkas untuk audit dan analitik.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
              {[
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
                ["Total area", formatDecimal(identity.totalAreaM2, " m²")],
                ["Sales", formatDecimal(identity.salesAreaM2, " m²")],
                ["Parkir", formatDecimal(identity.parkingAreaM2, " m²")],
                ["Teras", formatDecimal(identity.terraceAreaM2, " m²")],
                ["Gudang", formatDecimal(identity.warehouseAreaM2, " m²")],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 border-b border-border/50 py-1.5 last:border-b sm:block sm:last:border-b"
                >
                  <p className="text-muted-foreground">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">Data Completeness</CardTitle>
            <CardAction>
              <Badge
                variant={
                  dataCompleteness.percent === 100 ? "default" : "secondary"
                }
              >
                {dataCompleteness.percent}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Progress value={dataCompleteness.percent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {dataCompleteness.completed}/{dataCompleteness.total} field utama
              lengkap.
            </p>
            {dataCompleteness.missingFields.length > 0 ? (
              <p className="line-clamp-2 text-xs text-amber-700 dark:text-amber-300">
                Kurang: {dataCompleteness.missingFields.join(", ")}
              </p>
            ) : (
              <p className="text-xs text-primary">Data utama sudah lengkap.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Tren Bulanan PLN vs Baseline</CardTitle>
            <CardDescription>
              Riwayat PLN dan STD pada audit terakhir toko ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {detail.monthlyTrend.length > 0 ? (
              detail.monthlyTrend.map((item) => (
                <div key={item.month} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium">{item.month}</span>
                    <span className="text-muted-foreground">
                      PLN {formatNumber(item.plnKwh)} · STD{" "}
                      {formatNumber(item.std)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          item.plnKwh > item.baseline
                            ? "bg-destructive"
                            : "bg-primary"
                        )}
                        style={{
                          width: `${Math.min(
                            100,
                            (item.plnKwh / maxTrendValue) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="h-1 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-muted-foreground"
                        style={{
                          width: `${Math.min(
                            100,
                            (item.baseline / maxTrendValue) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada data PLN bulanan.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Equipment</CardTitle>
            <CardDescription>
              Kontributor konsumsi dari audit terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">Total unit</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatNumber(equipmentSummary.totalQty)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">Estimasi</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatNumber(equipmentSummary.totalMonthlyKwh, " kWh")}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Area dominan</span>
                <span className="font-medium">{topArea?.area ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Equipment dominan</span>
                <span className="font-medium">{topEquipment?.name ?? "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {latestAudit?.recommendation
        ? (() => {
            const style = getRecommendationStyle(
              latestAudit.recommendation.type
            )
            const RecommendationIcon = style.icon

            return (
              <Card
                className={cn(
                  "relative overflow-hidden ring-1",
                  style.className
                )}
              >
                <IconSparkles className="absolute -top-6 -right-6 size-32 text-foreground/5" />
                <CardHeader className="relative">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-xl",
                        style.iconClassName
                      )}
                    >
                      <RecommendationIcon className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge className={style.badgeClassName}>
                          <IconSparkles data-icon="inline-start" />
                          {style.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Diaudit oleh {latestAudit.auditorName}
                        </span>
                      </div>
                      <CardTitle className="text-xl">
                        {latestAudit.recommendation.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Rekomendasi prioritas dari audit terakhir toko ini.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="rounded-xl border bg-background/70 px-4 py-3 shadow-sm backdrop-blur">
                    <p className="text-sm leading-relaxed text-foreground/85">
                      {latestAudit.recommendation.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })()
        : null}

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
        </CardHeader>
        <CardContent className="overflow-auto px-0 pb-0">
          <Table className="min-w-[760px] text-xs [&_td]:px-4 [&_td]:py-2 [&_th]:px-4">
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Merek</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Jam</TableHead>
                <TableHead className="text-right">kW</TableHead>
                <TableHead className="text-right">kWh/hari</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipmentSummary.rows.map((item, index) => (
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
                href={`/audit/${audit.id}`}
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
                    {audit.gapPercent !== null
                      ? `${audit.gapPercent > 0 ? "+" : ""}${formatDecimal(
                          audit.gapPercent,
                          "%"
                        )}`
                      : "No baseline"}
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
