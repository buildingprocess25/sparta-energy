"use client"

import {
  IconLeaf,
  IconAlertTriangle,
  IconEdit,
  IconFileDownload,
} from "@tabler/icons-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
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
  baseWatt: number | string
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
  const savingsKwh = estKwhPerM2 - actualKwhPerM2

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

  const totalDailyKwh =
    Object.values(areaMap).reduce((a, b) => a + b, 0) || 1

  const pieData = Object.entries(areaMap)
    .filter(([, v]) => v > 0)
    .map(([key, dailyKwh]) => ({
      area: areaChartConfig[key as keyof typeof areaChartConfig]?.label ?? key,
      areaKey: key,
      dailyKwh,
      monthlyKwh: Math.round(dailyKwh * 30),
      portion: Math.round((dailyKwh / totalDailyKwh) * 100),
      fill: areaChartConfig[key as keyof typeof areaChartConfig]?.color ?? "var(--chart-5)",
    }))

  // PLN trend chart
  const trendData = audit.plnHistory.map((row) => ({
    month: row.billingMonth.slice(0, 3).toUpperCase(),
    actual: Number(row.plnUsageKwh) / totalAreaM2,
    standard: estKwhPerM2,
  }))

  const recommendation = audit.recommendations[0]

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-36">
      <Header
        variant="dashboard-back"
        title="Hasil Audit Energi"
        backHref="/dashboard"
        className="px-0"
      />

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
              <div>
                <p className="text-[10px] text-white/80 uppercase">
                  Aktual Rata-rata
                </p>
                <p className="text-base font-bold">
                  {actualKwhPerM2.toFixed(1)} kWh/m²
                </p>
              </div>
              <div>
                <p className="text-[10px] text-white/80 uppercase">
                  Estimasi Peralatan
                </p>
                <p className="text-base font-bold opacity-85">
                  {estKwhPerM2.toFixed(1)} kWh/m²
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Trend Chart ── */}
        {trendData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Tren Efisiensi (Actual vs Estimasi)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendChartConfig} className="h-44 w-full">
                <BarChart data={trendData} barGap={4}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="actual" fill="var(--chart-3)" radius={4}>
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
                  <Bar
                    dataKey="standard"
                    fill="var(--muted-foreground)"
                    radius={4}
                    opacity={0.5}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* ── Breakdown Comparison ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Perbandingan kWh/m²</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
              <span className="text-sm">Equipment Est.</span>
              <span className="font-bold">{estKwhPerM2.toFixed(1)} kWh/m²</span>
            </div>
            <div
              className={cn(
                "flex items-center justify-between rounded-xl p-3 text-primary-foreground",
                isBoros ? "bg-[#d85a53]" : "bg-primary"
              )}
            >
              <span className="text-sm">Aktual Rata-rata</span>
              <span className="font-bold">{actualKwhPerM2.toFixed(1)} kWh/m²</span>
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
                {Math.abs(savingsKwh).toFixed(1)} kWh/m²
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
              <ChartContainer config={areaChartConfig} className="mx-auto h-52">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={pieData}
                    dataKey="portion"
                    nameKey="area"
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
                              {numberFormat.format(Math.round(totalDailyKwh * 30))}
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
                    className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <div>
                        <p className="text-sm font-medium">{item.area}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.dailyKwh.toFixed(1)} kWh/hari
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
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

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="py-3">
            <CardContent className="px-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">
                Aktual Bulanan
              </p>
              <p className="text-sm font-bold text-primary">
                {numberFormat.format(Math.round(avgActual))} kWh
              </p>
            </CardContent>
          </Card>
          <Card className="py-3">
            <CardContent className="px-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">
                Est. Eq Bulanan
              </p>
              <p className="text-sm font-bold text-primary">
                {numberFormat.format(Math.round(totalEst))} kWh
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-700/20 py-3">
            <CardContent className="px-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">
                Aksi Lanjut
              </p>
              <p
                className={cn(
                  "mt-1 text-xs font-bold leading-tight",
                  recommendation?.type === "TRAINING"
                    ? "text-amber-600"
                    : recommendation?.type === "REPAIR"
                      ? "text-rose-600"
                      : "text-emerald-700"
                )}
              >
                {recommendation?.type === "TRAINING"
                  ? "SOP Training"
                  : recommendation?.type === "REPAIR"
                    ? "Equipment Repair"
                    : "Maintain Good"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Recommendation ── */}
        {recommendation && (
          <Card
            className={cn(
              "border-l-4",
              recommendation.type === "TRAINING"
                ? "border-l-amber-500"
                : recommendation.type === "REPAIR"
                  ? "border-l-rose-500"
                  : "border-l-emerald-500"
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{recommendation.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {recommendation.description}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* ── Bottom Action Bar ── */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 backdrop-blur">
        <div className="grid w-full max-w-sm grid-cols-2 gap-3">
          <Button variant="secondary" className="h-11 rounded-full" asChild>
            <Link href="/dashboard">
              <IconEdit className="size-4" />
              Kembali
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
