"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import { useState, useMemo, useEffect } from "react"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type ConsumptionTrendPoint = {
  month: string
  actualPln: number
  baseline: number
  std?: number
}

type EfficiencyBreakdownDatum = {
  status: "hemat" | "boros"
  label: string
  value: number
  fill: string
}

const consumptionChartConfig = {
  actualPln: {
    label: "Actual PLN",
    color: "var(--chart-2)",
  },
  baseline: {
    label: "Baseline (Estimasi)",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig

const efficiencyChartConfig = {
  hemat: {
    label: "Hemat",
    color: "var(--primary)",
  },
  boros: {
    label: "Boros",
    color: "var(--destructive)",
  },
} satisfies ChartConfig

const numberFormat = new Intl.NumberFormat("id-ID")

function formatK(value: unknown) {
  const numericValue = Number(value ?? 0)
  if (Math.abs(numericValue) >= 1000) {
    const compactValue = numericValue / 1000
    const fractionDigits = Math.abs(compactValue) >= 10 ? 0 : 1
    return `${compactValue.toFixed(fractionDigits).replace(/\.0$/, "")}k`
  }

  return String(Math.round(numericValue))
}

function formatTooltipValue(value: unknown, key: string) {
  return `${formatK(value)} kWh`
}

const PAGE_SIZE = 6

export function ConsumptionTrendChart({
  data,
  showBaseline = true,
}: {
  data: ConsumptionTrendPoint[]
  showBaseline?: boolean
}) {
  const [startIndex, setStartIndex] = useState(() =>
    Math.max(0, data.length - PAGE_SIZE)
  )

  useEffect(() => {
    setStartIndex(Math.max(0, data.length - PAGE_SIZE))
  }, [data.length])

  const clampedStartIndex = Math.min(
    Math.max(0, data.length - PAGE_SIZE),
    Math.max(0, startIndex)
  )

  const visibleData = useMemo(() => {
    if (data.length <= PAGE_SIZE) return data
    return data.slice(clampedStartIndex, clampedStartIndex + PAGE_SIZE)
  }, [data, clampedStartIndex])

  const canGoPrev = clampedStartIndex > 0
  const canGoNext = clampedStartIndex + PAGE_SIZE < data.length

  return (
    <div className="flex flex-col gap-2">
      {data.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
          <span className="font-medium">
            Periode: <strong className="text-foreground">{visibleData[0]?.month}</strong> s/d{" "}
            <strong className="text-foreground">
              {visibleData[visibleData.length - 1]?.month}
            </strong>{" "}
            <span className="text-[11px] font-normal text-muted-foreground/80">
              ({data.length} bulan data)
            </span>
          </span>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              disabled={!canGoPrev}
              onClick={() => setStartIndex((prev) => Math.max(0, prev - 1))}
            >
              <IconChevronLeft className="size-3.5" />
              <span>Sebelumnya</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              disabled={!canGoNext}
              onClick={() =>
                setStartIndex((prev) =>
                  Math.min(Math.max(0, data.length - PAGE_SIZE), prev + 1)
                )
              }
            >
              <span>Berikutnya</span>
              <IconChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      <ChartContainer
        config={consumptionChartConfig}
        className="aspect-auto h-72 w-full"
      >
        <AreaChart
          data={visibleData}
          margin={{ top: 12, right: 12, left: -12, bottom: 0 }}
        >
        <defs>
          <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-actualPln)"
              stopOpacity={0.22}
            />
            <stop
              offset="95%"
              stopColor="var(--color-actualPln)"
              stopOpacity={0.04}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11 }}
          tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => {
                const key = String(name)
                const label =
                  consumptionChartConfig[
                    key as keyof typeof consumptionChartConfig
                  ]?.label ?? key
                const indicatorColor = item.color ?? item.payload?.fill

                return (
                  <>
                    <div
                      className="size-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: indicatorColor }}
                    />
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-4 leading-none">
                      <span className="whitespace-nowrap text-muted-foreground">
                        {label}
                      </span>
                      <span className="font-mono font-medium whitespace-nowrap text-foreground tabular-nums">
                        {formatTooltipValue(value, key)}
                      </span>
                    </div>
                  </>
                )
              }}
            />
          }
        />
        <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
        {showBaseline ? (
          <Area
            dataKey="baseline"
            type="monotone"
            stroke="var(--color-baseline)"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            fill="transparent"
          />
        ) : null}
        <Area
          dataKey="actualPln"
          type="monotone"
          stroke="var(--color-actualPln)"
          strokeWidth={3}
          fill="url(#actualFill)"
        />
      </AreaChart>
      </ChartContainer>
    </div>
  )
}

export function EfficiencyBreakdownChart({
  auditedStores,
  hematStores,
  borosStores,
}: {
  auditedStores: number
  hematStores: number
  borosStores: number
}) {
  const rawData: EfficiencyBreakdownDatum[] = [
    {
      status: "hemat",
      label: "Hemat",
      value: hematStores,
      fill: "var(--color-hemat)",
    },
    {
      status: "boros",
      label: "Boros",
      value: borosStores,
      fill: "var(--color-boros)",
    },
  ]

  const data = rawData.filter((item) => item.value > 0)

  const hematPercent =
    auditedStores > 0 ? Math.round((hematStores / auditedStores) * 100) : 0
  const borosPercent =
    auditedStores > 0 ? Math.round((borosStores / auditedStores) * 100) : 0

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer
        config={efficiencyChartConfig}
        className="mx-auto aspect-square h-48"
      >
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent nameKey="label" hideLabel />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={58}
            outerRadius={82}
            strokeWidth={4}
          >
            {data.map((item) => (
              <Cell key={item.status} fill={item.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
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
                      y={(viewBox.cy ?? 0) - 8}
                      className="fill-muted-foreground text-[10px] font-medium"
                    >
                      Audited
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 14}
                      className="fill-foreground text-xl font-bold"
                    >
                      {numberFormat.format(auditedStores)}
                    </tspan>
                  </text>
                )
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm bg-primary" />
            <span>Hemat</span>
          </div>
          <span className="font-medium">
            {hematPercent}% ({numberFormat.format(hematStores)})
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm bg-destructive" />
            <span>Boros</span>
          </div>
          <span className="font-medium">
            {borosPercent}% ({numberFormat.format(borosStores)})
          </span>
        </div>
      </div>
    </div>
  )
}
