"use client"

import {
  IconLeaf,
  IconAlertTriangle,
  IconFileDownload,
  IconInfoCircle,
  IconCheck,
  IconTool,
  IconBook,
  IconBulb,
  IconArrowLeft,
  IconSparkles,
} from "@tabler/icons-react"
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Label, Pie, PieChart } from "recharts"
import Link from "next/link"

import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

// ─── Types (from Prisma include) ──────────────────────────────────────────────
type AuditStore = {
  code: string
  name: string
  salesAreaM2: number | string
  parkingAreaM2: number | string
  terraceAreaM2: number | string
  warehouseAreaM2: number | string
}

type AuditItemDB = {
  areaTarget: "SALES" | "PARKING" | "TERRACE" | "WAREHOUSE"
  customName: string | null
  qty: number
  operationalHours: number | string
  baseKw: number | string
  estimatedDailyKwh: number | string
}

type PlnHistoryDB = {
  monthIdx: number
  billingMonth: string
  plnUsageKwh: number | string
  salesTransactionPerDay: number | string
}

type RecommendationDB = {
  type: "TRAINING" | "REPAIR" | "MAINTENANCE"
  title: string
  description: string
}

type AuditDB = {
  id: string
  isBoros: boolean | null
  totalEstimatedKwhPerMonth: number | string | null
  avgActualPlnKwhPerMonth: number | string | null
  auditDate: Date
  store: AuditStore
  items: AuditItemDB[]
  plnHistory: PlnHistoryDB[]
  recommendations: RecommendationDB[]
}

// ─── Charts ───────────────────────────────────────────────────────────────────
const areaChartConfig = {
  SALES: { label: "Sales Area", color: "var(--chart-1)" },
  TERRACE: { label: "Teras", color: "var(--chart-2)" },
  PARKING: { label: "Parkir", color: "var(--chart-4)" },
  WAREHOUSE: { label: "Gudang & Lainnya", color: "var(--chart-3)" },
} satisfies ChartConfig

const trendChartConfig = {
  actual: { label: "Actual", color: "var(--chart-3)" },
  standard: { label: "Estimasi Eq", color: "var(--muted-foreground)" },
} satisfies ChartConfig

const numberFormat = new Intl.NumberFormat("id-ID")

// ─── Component ────────────────────────────────────────────────────────────────
export function AuditResultDB({ audit }: { audit: AuditDB }) {
  const isBoros = audit.isBoros ?? false
  const statusLabel = isBoros ? "TOKO BOROS" : "TOKO HEMAT"
  const StatusIcon = isBoros ? IconAlertTriangle : IconLeaf

  const totalEst = Number(audit.totalEstimatedKwhPerMonth ?? 0)
  const avgActual = Number(audit.avgActualPlnKwhPerMonth ?? 0)

  const totalAreaM2 =
    Number(audit.store.salesAreaM2) +
      Number(audit.store.parkingAreaM2) +
      Number(audit.store.terraceAreaM2) +
      Number(audit.store.warehouseAreaM2) || 1

  const estKwhPerM2 = totalEst / totalAreaM2
  const actualKwhPerM2 = avgActual / totalAreaM2
  // savingsKwh untuk Breakdown per Area (kWh/m²)
  const savingsKwhPerM2 = estKwhPerM2 - actualKwhPerM2
  // selisih raw kWh untuk Perbandingan
  const savingsRawKwh = totalEst - avgActual

  // Area breakdown from audit items
  const areaMap: Record<string, number> = {
    SALES: 0,
    PARKING: 0,
    TERRACE: 0,
    WAREHOUSE: 0,
  }
  audit.items.forEach((item) => {
    areaMap[item.areaTarget] =
      (areaMap[item.areaTarget] ?? 0) + Number(item.estimatedDailyKwh)
  })

  const totalDailyKwh = Object.values(areaMap).reduce((a, b) => a + b, 0) || 1

  const pieData = Object.entries(areaMap)
    .filter(([, v]) => v > 0)
    .map(([key, dailyKwh]) => ({
      area: areaChartConfig[key as keyof typeof areaChartConfig]?.label ?? key,
      areaKey: key,
      dailyKwh,
      monthlyKwh: Math.round(dailyKwh * 30),
      portion: Math.round((dailyKwh / totalDailyKwh) * 100),
      fill:
        areaChartConfig[key as keyof typeof areaChartConfig]?.color ??
        "var(--chart-5)",
    }))

  // PLN trend chart — raw kWh (bukan per m²)
  const trendData = audit.plnHistory.map((row) => ({
    month: row.billingMonth.slice(0, 3).toUpperCase(),
    actual: Number(row.plnUsageKwh),
    standard: totalEst,
  }))

  const recommendation = audit.recommendations[0]

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-36">
      <Header variant="title-only" title="Hasil Audit Energi" />

      <main className="space-y-4">
        {/* ── Status Card ── */}
        <Card
          className={cn(
            "relative overflow-hidden border-0 text-white shadow-lg",
            isBoros
              ? "bg-linear-to-br from-[#d85a53] to-[#c54b45] shadow-[#d85a53]/20"
              : "bg-linear-to-br from-primary to-primary/80 shadow-primary/20"
          )}
        >
          <StatusIcon className="absolute -top-4 -right-4 size-36 opacity-15" />
          <CardContent className="relative z-10 space-y-4 pt-6">
            <Badge className="rounded-full bg-white/20 text-white hover:bg-white/20">
              {audit.store.name} · {audit.store.code}
            </Badge>
            <div>
              <p className="text-[10px] tracking-[0.18em] text-white/80 uppercase">
                Hasil Audit:
              </p>
              <div className="flex items-center gap-2">
                <StatusIcon className="size-8" />
                <h2 className="text-3xl font-black tracking-tight">
                  {statusLabel}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-white/20 pt-4">
              {/* Aktual */}
              <div className="space-y-0.5">
                <p className="text-xl font-black tracking-tight">
                  {numberFormat.format(Math.round(avgActual))}
                  <span className="ml-1 text-xs font-medium opacity-70">
                    kWh
                  </span>
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-[10px] font-semibold tracking-wider text-white/80 uppercase">
                    Aktual Rata-rata
                  </p>
                  <div className="group relative">
                    <IconInfoCircle className="size-3 cursor-help text-white/60" />
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-xl bg-black/85 px-3 py-2.5 text-[11px] leading-relaxed tracking-normal text-white normal-case opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      Rata-rata tagihan listrik PLN per bulan selama 6 bulan
                      terakhir yang sudah diisi.
                    </div>
                  </div>
                </div>
              </div>
              {/* Baseline */}
              <div className="space-y-0.5">
                <p className="text-xl font-black tracking-tight opacity-85">
                  {numberFormat.format(Math.round(totalEst))}
                  <span className="ml-1 text-xs font-medium opacity-70">
                    kWh
                  </span>
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-[10px] font-semibold tracking-wider text-white/80 uppercase">
                    Baseline
                  </p>
                  <div className="group relative">
                    <IconInfoCircle className="size-3 cursor-help text-white/60" />
                    <div className="pointer-events-none absolute right-0 bottom-full z-50 mb-2 w-52 rounded-xl bg-black/85 px-3 py-2.5 text-[11px] leading-relaxed tracking-normal text-white normal-case opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      Perkiraan penggunaan listrik wajar berdasarkan semua
                      peralatan yang terdata di audit ini. Angka ini menjadi
                      patokan apakah toko boros atau hemat.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Trend Chart ── */}
        {trendData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Tren Efisiensi (Aktual vs Baseline)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendChartConfig} className="h-48 w-full">
                <ComposedChart
                  data={trendData}
                  margin={{ top: 10, right: 12, left: 4, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                    padding={{ left: 12, right: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                          <p className="mb-1 font-semibold">{label}</p>
                          {payload.map((p) => (
                            <p
                              key={String(p.dataKey)}
                              style={{ color: p.color }}
                            >
                              {p.name}: {Number(p.value).toFixed(0)} kWh
                            </p>
                          ))}
                        </div>
                      )
                    }}
                  />
                  {/* Baseline — dashed reference line */}
                  <ReferenceLine
                    y={totalEst}
                    stroke="var(--muted-foreground)"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    label={{
                      value: "Baseline",
                      position: "insideTopRight",
                      fontSize: 9,
                      fill: "var(--muted-foreground)",
                    }}
                  />
                  {/* Actual — bar colored red if over baseline */}
                  <Bar
                    dataKey="actual"
                    name="Aktual"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  >
                    {trendData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.actual > entry.standard
                            ? "#d85a53"
                            : "var(--chart-3)"
                        }
                      />
                    ))}
                  </Bar>
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* ── Breakdown Comparison ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Perbandingan kWh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
              <span className="text-sm">Baseline</span>
              <span className="font-bold">
                {numberFormat.format(Math.round(totalEst))} kWh
              </span>
            </div>
            <div
              className={cn(
                "flex items-center justify-between rounded-xl p-3 text-primary-foreground",
                isBoros ? "bg-[#d85a53]" : "bg-primary"
              )}
            >
              <span className="text-sm">Aktual Rata-rata</span>
              <span className="font-bold">
                {numberFormat.format(Math.round(avgActual))} kWh
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
              <span className="text-sm">
                {isBoros ? "Kelebihan" : "Penghematan"}
              </span>
              <span
                className={cn(
                  "font-bold",
                  isBoros ? "text-[#d85a53]" : "text-emerald-600"
                )}
              >
                {numberFormat.format(Math.round(Math.abs(savingsRawKwh)))} kWh
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Pie Chart Area Breakdown ── */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Breakdown per Area</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={areaChartConfig}
                className="mx-auto h-52 w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={pieData}
                    dataKey="portion"
                    nameKey="area"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={90}
                    strokeWidth={4}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (
                          !viewBox ||
                          !("cx" in viewBox) ||
                          !("cy" in viewBox)
                        )
                          return null
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) - 6}
                              className="fill-foreground text-lg font-bold"
                            >
                              {numberFormat.format(
                                Math.round(totalDailyKwh * 30)
                              )}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) + 14}
                              className="fill-muted-foreground text-[10px]"
                            >
                              kWh / bulan
                            </tspan>
                          </text>
                        )
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              <div className="space-y-2">
                {pieData.map((item) => (
                  <div
                    key={item.areaKey}
                    className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.area}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.dailyKwh.toFixed(1)} kWh/hari
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold">
                        {numberFormat.format(item.monthlyKwh)} kWh
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        {item.portion}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Recommendation ── */}
        {recommendation && (
          <div className="space-y-3">
            <div className="ml-1 flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Rekomendasi Tindakan
              </h3>
              <div className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <IconSparkles className="size-3" />
                <span>AI Generated</span>
              </div>
            </div>
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl border p-5 shadow-sm",
                recommendation.type === "TRAINING"
                  ? "border-amber-200 bg-linear-to-b from-amber-50 to-white dark:border-amber-900/50 dark:from-amber-950/20 dark:to-background"
                  : recommendation.type === "REPAIR"
                    ? "border-rose-200 bg-linear-to-b from-rose-50 to-white dark:border-rose-900/50 dark:from-rose-950/20 dark:to-background"
                    : "border-emerald-200 bg-linear-to-b from-emerald-50 to-white dark:border-emerald-900/50 dark:from-emerald-950/20 dark:to-background"
              )}
            >
              {/* Decorative background icon */}
              <div
                className={cn(
                  "absolute -top-4 -right-4 opacity-10",
                  recommendation.type === "TRAINING"
                    ? "text-amber-500"
                    : recommendation.type === "REPAIR"
                      ? "text-rose-500"
                      : "text-emerald-500"
                )}
              >
                {recommendation.type === "TRAINING" ? (
                  <IconBook className="size-32" />
                ) : recommendation.type === "REPAIR" ? (
                  <IconTool className="size-32" />
                ) : (
                  <IconCheck className="size-32" />
                )}
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm",
                      recommendation.type === "TRAINING"
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                        : recommendation.type === "REPAIR"
                          ? "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400"
                          : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                    )}
                  >
                    {recommendation.type === "TRAINING" ? (
                      <IconBook className="size-5" />
                    ) : recommendation.type === "REPAIR" ? (
                      <IconTool className="size-5" />
                    ) : (
                      <IconCheck className="size-5" />
                    )}
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mb-1 border-0 px-2 py-0 text-[9px] font-bold tracking-wider uppercase",
                        recommendation.type === "TRAINING"
                          ? "bg-amber-200/50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                          : recommendation.type === "REPAIR"
                            ? "bg-rose-200/50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                            : "bg-emerald-200/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                      )}
                    >
                      {recommendation.type === "TRAINING"
                        ? "SOP Training"
                        : recommendation.type === "REPAIR"
                          ? "Equipment Repair"
                          : "Maintain Good"}
                    </Badge>
                    <h4 className="leading-tight font-bold text-foreground/90">
                      {recommendation.title}
                    </h4>
                  </div>
                </div>

                <div className="rounded-xl bg-white/60 p-3.5 text-sm leading-relaxed text-muted-foreground backdrop-blur-sm dark:bg-black/20">
                  <div className="flex gap-2">
                    <IconBulb className="mt-0.5 size-4 shrink-0 text-foreground/40" />
                    <p>{recommendation.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom Action Bar ── */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 backdrop-blur">
        <div className="grid w-full max-w-sm grid-cols-2 gap-3">
          <Button variant="secondary" className="h-11 rounded-full" asChild>
            <Link href="/dashboard">
              <IconArrowLeft className="size-4" />
              Dashboard
            </Link>
          </Button>
          <Button className="h-11 rounded-full">
            <IconFileDownload className="size-4" />
            Simpan Laporan
          </Button>
        </div>
      </div>
    </div>
  )
}
