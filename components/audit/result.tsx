"use client"

import {
  IconEdit,
  IconFileDownload,
  IconLeaf,
  IconAlertTriangle,
} from "@tabler/icons-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

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

type UserRole = "user" | "admin"

const getMockUserRole = (): UserRole => "admin"
const mockUserRole = getMockUserRole()
const mockStore = {
  code: "ALF-0123",
  name: "Alfamart Cibubur Raya",
  reportMonth: "Desember",
}

const mockAuditResultByRole = {
  user: {
    standardKwhPerM2: 13.2,
    equipmentEstimateKwhPerM2: 11.9,
    totalMonthlyKwh: 2600,
    totalDailyKwh: 86.7,
  },
  admin: {
    standardKwhPerM2: 15.0,
    equipmentEstimateKwhPerM2: 11.8,
    totalMonthlyKwh: 4398,
    totalDailyKwh: 146.6,
  },
}

const mockMonthlyEfficiency = [
  { month: "JAN", actual: 12.1, standard: 13.0 },
  { month: "FEB", actual: 11.8, standard: 12.8 },
  { month: "MAR", actual: 13.6, standard: 13.2 },
  { month: "APR", actual: 12.5, standard: 13.1 },
  { month: "MEI", actual: 12.2, standard: 13.0 },
  { month: "JUN", actual: 13.4, standard: 13.1 },
  { month: "JUL", actual: 11.4, standard: 12.9 },
  { month: "AGU", actual: 11.1, standard: 12.8 },
  { month: "SEP", actual: 14.1, standard: 13.3 },
  { month: "OKT", actual: 12.0, standard: 13.0 },
  { month: "NOV", actual: 12.3, standard: 13.1 },
  { month: "DES", actual: 12.4, standard: 13.2 },
]

const ACTUAL_HEMAT_COLOR = "var(--chart-3)"
const STANDARD_COLOR = "var(--muted-foreground)"
const ACTUAL_BOROS_COLOR = "#d85a53"

const trendChartConfig = {
  actual: {
    label: "Actual",
    color: ACTUAL_HEMAT_COLOR,
  },
  standard: {
    label: "Standard",
    color: STANDARD_COLOR,
  },
} satisfies ChartConfig

const mockAreaBreakdown = [
  {
    area: "Sales Area",
    dailyKwh: 99.7,
    monthlyKwh: 2991,
    portion: 68,
    fill: "var(--color-salesArea)",
  },
  {
    area: "Teras",
    dailyKwh: 13.2,
    monthlyKwh: 396,
    portion: 9,
    fill: "var(--color-teras)",
  },
  {
    area: "Gudang",
    dailyKwh: 11.7,
    monthlyKwh: 351,
    portion: 8,
    fill: "var(--color-gudang)",
  },
  {
    area: "Lainnya",
    dailyKwh: 22.0,
    monthlyKwh: 660,
    portion: 15,
    fill: "var(--color-lainnya)",
  },
]

const areaChartConfig = {
  salesArea: {
    label: "Sales Area",
    color: "var(--chart-1)",
  },
  teras: {
    label: "Teras",
    color: "var(--chart-2)",
  },
  gudang: {
    label: "Gudang",
    color: "var(--chart-3)",
  },
  lainnya: {
    label: "Lainnya",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const numberFormat = new Intl.NumberFormat("id-ID")

export function AuditResult() {
  const visibleMonthlyEfficiency =
    mockUserRole === "user"
      ? [mockMonthlyEfficiency[mockMonthlyEfficiency.length - 1]]
      : mockMonthlyEfficiency

  const summary = mockAuditResultByRole[mockUserRole]
  const actualKwhPerM2 =
    visibleMonthlyEfficiency.reduce((total, row) => total + row.actual, 0) /
    visibleMonthlyEfficiency.length
  const savingsKwh = summary.standardKwhPerM2 - actualKwhPerM2
  const efficiencyRatio = (actualKwhPerM2 / summary.standardKwhPerM2) * 100
  const isSingleMonth = mockUserRole === "user"
  const totalAreaMonthlyKwh = mockAreaBreakdown.reduce(
    (total, item) => total + item.monthlyKwh,
    0
  )

  const isHemat = savingsKwh >= 0
  const statusLabel = isHemat ? "TOKO HEMAT" : "TOKO BOROS"
  const StatusIcon = isHemat ? IconLeaf : IconAlertTriangle

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-36">
      <Header
        variant="dashboard-back"
        title="Hasil Audit Energi"
        backHref="/audit/start?step=3"
        className="px-0"
      />

      <main className="space-y-4">
        <Card
          className={cn(
            "relative overflow-hidden border-0 text-white shadow-lg",
            isHemat
              ? "bg-linear-to-br from-primary to-primary/80 shadow-primary/20"
              : "bg-linear-to-br from-[#d85a53] to-[#c54b45] text-white shadow-[#d85a53]/20"
          )}
        >
          <StatusIcon className="absolute -top-4 -right-4 size-36 opacity-15" />

          <CardContent className="relative z-10 space-y-4 pt-6">
            <Badge className="rounded-full bg-white/20 text-white hover:bg-white/20">
              {mockStore.name} · {mockStore.code}
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
                  {isSingleMonth ? "AKTUAL BULAN INI" : "RATA-RATA AKTUAL"}
                </p>
                <p className="text-base font-bold">
                  {actualKwhPerM2.toFixed(1)} kWh/m²
                </p>
              </div>
              <div>
                <p className="text-[10px] text-white/80 uppercase">Efisiensi</p>
                <p className="text-base font-bold">
                  {efficiencyRatio.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-white/80 uppercase">
                  {isSingleMonth ? "STANDAR BULAN INI" : "RATA-RATA STANDAR"}
                </p>
                <p className="text-base font-bold opacity-85">
                  {summary.standardKwhPerM2.toFixed(1)} kWh/m²
                </p>
              </div>
              <div>
                <p className="text-[10px] text-white/80 uppercase">
                  {isHemat ? "Hemat" : "Berlebih"}
                </p>
                <p
                  className={cn(
                    "text-base font-bold",
                    isHemat ? "text-emerald-100" : "text-rose-100"
                  )}
                >
                  {Math.abs(savingsKwh).toFixed(1)} kWh/m²
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {isSingleMonth
                ? `Efisiensi Bulan ${mockStore.reportMonth}`
                : "Trend Efisiensi 12 Bulan"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ChartContainer
              config={trendChartConfig}
              className="min-h-60 w-full"
            >
              <BarChart
                accessibilityLayer
                data={visibleMonthlyEfficiency}
                barGap={4}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={8}
                  axisLine={false}
                />
                <YAxis hide domain={[8, 15]} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => {
                        const isActual = item.dataKey === "actual"
                        const isOverStandard =
                          Number(item.payload?.actual) >
                          Number(item.payload?.standard)

                        const indicatorColor = isActual
                          ? isOverStandard
                            ? ACTUAL_BOROS_COLOR
                            : "var(--color-actual)"
                          : "var(--color-standard)"

                        const displayLabel = isActual
                          ? isOverStandard
                            ? "Aktual (Boros)"
                            : "Aktual (Hemat)"
                          : "Standar"

                        return (
                          <div className="flex w-full items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="size-2 rounded-xs"
                                style={{ backgroundColor: indicatorColor }}
                              />
                              <span className="text-muted-foreground">
                                {displayLabel}
                              </span>
                            </div>
                            <span className="font-mono font-medium tabular-nums">
                              {typeof value === "number"
                                ? value.toLocaleString()
                                : String(value)}
                            </span>
                          </div>
                        )
                      }}
                    />
                  }
                />

                <Bar dataKey="actual" fill="var(--color-actual)" radius={4}>
                  {visibleMonthlyEfficiency.map((item) => (
                    <Cell
                      key={item.month}
                      fill={
                        item.actual > item.standard
                          ? ACTUAL_BOROS_COLOR
                          : "var(--color-actual)"
                      }
                    />
                  ))}
                </Bar>

                <Line
                  type="monotone"
                  dataKey="standard"
                  stroke="var(--color-standard)"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 4"
                />
              </BarChart>
            </ChartContainer>

            <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-xs"
                  style={{ backgroundColor: ACTUAL_HEMAT_COLOR }}
                />
                Aktual (Hemat)
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-xs"
                  style={{ backgroundColor: ACTUAL_BOROS_COLOR }}
                />
                Aktual (Boros)
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-xs"
                  style={{ backgroundColor: STANDARD_COLOR }}
                />
                Standar
              </span>
            </div>

            <p className="text-center text-[11px] text-muted-foreground">
              {isSingleMonth
                ? "Mode user: menampilkan evaluasi 1 bulan terakhir."
                : "Mode admin: menampilkan tren 12 bulan."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Perbandingan Penggunaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
              <span className="text-sm">Equipment Est.</span>
              <span className="font-bold">
                {summary.equipmentEstimateKwhPerM2.toFixed(1)} kWh/m²
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-primary p-3 text-primary-foreground">
              <span className="text-sm">PLN Actual</span>
              <span className="font-bold">
                {actualKwhPerM2.toFixed(1)} kWh/m²
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
              <span className="text-sm">Standar</span>
              <span className="font-bold">
                {summary.standardKwhPerM2.toFixed(1)} kWh/m²
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Breakdown by Area</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ChartContainer
              config={areaChartConfig}
              className="mx-auto aspect-square h-60 max-h-60 w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => (
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="size-2 rounded-full"
                              style={{
                                backgroundColor:
                                  item.payload?.fill ?? item.color,
                              }}
                            />
                            <span className="text-muted-foreground">
                              {String(name)}
                            </span>
                          </div>
                          <span className="font-mono font-medium tabular-nums">
                            {value}%
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={mockAreaBreakdown}
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
                      ) {
                        return null
                      }

                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy - 6}
                            className="fill-foreground text-lg font-bold"
                          >
                            {numberFormat.format(totalAreaMonthlyKwh)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy + 14}
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
              {mockAreaBreakdown.map((item) => (
                <div
                  key={item.area}
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

        <div className="grid grid-cols-3 gap-2">
          <Card className="py-3">
            <CardContent className="px-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">
                Total Bulanan
              </p>
              <p className="text-sm font-bold text-primary">
                {numberFormat.format(summary.totalMonthlyKwh)} kWh
              </p>
            </CardContent>
          </Card>
          <Card className="py-3">
            <CardContent className="px-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">
                Total Harian
              </p>
              <p className="text-sm font-bold text-primary">
                {summary.totalDailyKwh.toFixed(1)} kWh
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-700/20 py-3">
            <CardContent className="px-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">
                Rasio Luas
              </p>
              <p className="text-sm font-bold text-emerald-700">
                {actualKwhPerM2.toFixed(1)} kWh/m²
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 backdrop-blur">
        <div className="grid w-full max-w-sm grid-cols-2 gap-3">
          <Button variant="secondary" className="h-11 rounded-full">
            <IconEdit className="size-4" />
            Edit Data
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
