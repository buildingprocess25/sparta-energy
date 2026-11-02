"use client"

import {
  LUX_AREAS,
  averageLux,
  getLuxLevel,
  type getZoneLampLayout,
  type LightingLuxRow,
  type LightingZoneDefinition,
  type LuxLevel,
  type LuxSubZone,
} from "@/lib/lighting-audit"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const numberFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
})

const decimalFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
})

// Label chip inside each box: solid so it stays readable over the lamp lines.
const labelTone: Record<LuxLevel, string> = {
  SESUAI:
    "border-emerald-400 bg-emerald-100 text-emerald-900 dark:border-emerald-500/50 dark:bg-emerald-950 dark:text-emerald-200",
  HAMPIR:
    "border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-500/50 dark:bg-amber-950 dark:text-amber-200",
  REDUP:
    "border-red-400 bg-red-100 text-red-900 dark:border-red-500/50 dark:bg-red-950 dark:text-red-200",
  BELUM_DIUKUR: "border-dashed border-border bg-card text-muted-foreground",
}

// Box fill: a light tint so the lamps inside the box stay visible.
const boxTone: Record<LuxLevel, string> = {
  SESUAI: "bg-emerald-500/10",
  HAMPIR: "bg-amber-500/15",
  REDUP: "bg-red-500/15",
  BELUM_DIUKUR: "",
}

type LampLayout = NonNullable<ReturnType<typeof getZoneLampLayout>>

type LuxPlanProps = {
  rows: LightingLuxRow[]
  definition: LightingZoneDefinition
  layout: LampLayout | null
  listedLampCount: number
  onSelectPoint: (subZone: LuxSubZone) => void
}

const PLAN_MAX_HEIGHT_REM = 24
const NO_SIZE_ASPECT = 4 / 3

const subZonesOf = (areaKey: string) =>
  [1, 2, 3].map((position) => `${areaKey}${position}` as LuxSubZone)

// Keeps a very narrow or very wide store readable on a phone; the plan is a sketch.
function planAspect(layout: LampLayout | null) {
  if (!layout) return NO_SIZE_ASPECT
  return Math.min(1.8, Math.max(0.6, layout.widthM / layout.lengthM))
}

// Vertical spot for each row's labels, as a share of the plan height. With lamps,
// the label sits in the lamp gap closest to the box middle so it never covers a lamp.
function labelRowsTop(layout: LampLayout | null) {
  return LUX_AREAS.map((_, index) => {
    const middle = (index + 0.5) / 3
    if (!layout) return middle
    const lampYs = [...new Set(layout.positions.map((lamp) => lamp.y))].sort(
      (a, b) => a - b
    )
    const edges = [0, ...lampYs, layout.lengthM]
    const top = index / 3
    const bottom = (index + 1) / 3
    const gaps = edges
      .slice(1)
      .map((y, i) => (edges[i] + y) / 2 / layout.lengthM)
      // Keep clear of the box edges so a label is never clipped by the plan border.
      .filter((gap) => gap > top + 0.06 && gap < bottom - 0.06)
    return (
      gaps.sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle))[0] ??
      middle
    )
  })
}

export function LuxPlan({
  rows,
  definition,
  layout,
  listedLampCount,
  onSelectPoint,
}: LuxPlanProps) {
  function pointAverage(subZone: LuxSubZone) {
    return averageLux(
      rows
        .filter((row) => row.subZone === subZone && row.lux !== null)
        .map((row) => row.lux as number)
    )
  }

  const aspect = planAspect(layout)
  const labelTops = labelRowsTop(layout)
  const boxes = LUX_AREAS.flatMap((area, rowIndex) =>
    subZonesOf(area.key).map((subZone, column) => {
      const avg = pointAverage(subZone)
      return {
        subZone,
        rowIndex,
        column,
        avg,
        level: getLuxLevel(avg, definition),
      }
    })
  )

  // An estimated side is marked with ± and "perkiraan" wherever it is shown.
  const sideText = (meters: number) =>
    layout?.estimated
      ? `±${decimalFormat.format(meters)} m (perkiraan)`
      : `${decimalFormat.format(meters)} m`

  return (
    <div className="flex flex-col gap-3">
      <figure className="flex flex-col gap-1.5">
        {layout?.estimated && (
          <Badge variant="outline" className="self-center">
            Denah perkiraan
          </Badge>
        )}
        <figcaption className="text-center text-xs font-medium text-muted-foreground">
          Pintu masuk
          {layout && ` · lebar ${sideText(layout.widthM)}`}
        </figcaption>

        {/* Width follows the height cap, so a square or deep store never needs scrolling. */}
        <div
          className="relative mx-auto overflow-hidden rounded-lg border-2 border-foreground/30 bg-muted/30"
          style={{
            aspectRatio: aspect,
            width: `min(100%, ${aspect * PLAN_MAX_HEIGHT_REM}rem)`,
          }}
        >
          {/* One tappable box per sub zona; the whole box is the touch target. */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
            {boxes.map(({ subZone, rowIndex, column, avg, level }) => (
              <button
                key={subZone}
                type="button"
                onClick={() => onSelectPoint(subZone)}
                aria-label={`Area ${subZone}${avg === null ? ", belum diukur" : `, ${numberFormat.format(avg)} lux`}. Isi lux titik ini.`}
                className={cn(
                  "border-dashed border-foreground/20 transition-colors outline-none hover:bg-foreground/5 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset active:bg-foreground/10",
                  column < 2 && "border-r",
                  rowIndex < 2 && "border-b",
                  boxTone[level]
                )}
              />
            ))}
          </div>

          {layout && (
            // Recommended lamps from the lamp calculator, in meters, stretched to the plan.
            <svg
              className="pointer-events-none absolute inset-0 size-full"
              viewBox={`0 0 ${layout.widthM} ${layout.lengthM}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {layout.positions.map((lamp, index) => (
                <line
                  key={index}
                  x1={lamp.x - layout.lampLengthM / 2 + 0.08}
                  x2={lamp.x + layout.lampLengthM / 2 - 0.08}
                  y1={lamp.y}
                  y2={lamp.y}
                  className={
                    layout.estimated
                      ? "stroke-foreground/25"
                      : "stroke-foreground/45"
                  }
                  strokeWidth={3}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          )}

          {/* Labels never take the tap; the box underneath does. */}
          {boxes.map(({ subZone, rowIndex, column, avg, level }) => (
            <span
              key={subZone}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap tabular-nums",
                labelTone[level]
              )}
              style={{
                left: `${((column + 0.5) / 3) * 100}%`,
                top: `${labelTops[rowIndex] * 100}%`,
              }}
            >
              {subZone}
              {avg !== null && (
                <span className="font-normal">{numberFormat.format(avg)}</span>
              )}
            </span>
          ))}
        </div>

        <p className="text-center text-xs font-medium text-muted-foreground">
          Bagian belakang
          {layout && ` · panjang ${sideText(layout.lengthM)}`}
        </p>
      </figure>

      <p className="text-xs text-muted-foreground">
        Ketuk kotak untuk mengisi lux titiknya. A depan, B tengah, C belakang.
        {layout?.estimated &&
          ` Lebar dan panjang belum diisi, jadi denah ini perkiraan dari luas lantai ${numberFormat.format(layout.widthM * layout.lengthM)} m² dengan anggapan toko berbentuk persegi. Posisi lampu hanya gambaran. Isi lebar dan panjang di atas supaya denah sesuai toko.`}
        {layout
          ? ` Garis abu-abu adalah lampu rekomendasi: ${layout.rows} baris × ${layout.perRow} lampu (${numberFormat.format(layout.total)} lampu ${decimalFormat.format(layout.watt)} W), jarak antarbaris ${decimalFormat.format(layout.rowSpacingM)} m.`
          : " Isi luas lantai, atau lebar dan panjang, supaya posisi lampu ikut muncul."}
        {layout &&
          listedLampCount > 0 &&
          ` Daftar lampu mencatat ${numberFormat.format(listedLampCount)} lampu.`}
      </p>

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer py-1 font-medium text-foreground">
          Cara baca denah
        </summary>
        <ul className="flex list-disc flex-col gap-1.5 pt-1 pl-4">
          <li>
            A sisi paling dekat pintu masuk atau jalan, C sisi paling jauh.
          </li>
          <li>
            Angka 1 sampai 3 hanya penanda posisi kiri, tengah, kanan, supaya
            titik yang sama mudah diukur lagi. Angka ini tidak dipakai dalam
            hitungan.
          </li>
          <li>
            Rata-rata zona diambil dari rata-rata Depan, Tengah, dan Belakang.
            Titik merah berarti redup. Isi alasannya di catatan titik itu.
          </li>
          <li>
            Posisi lampu adalah rekomendasi dari lebar dan panjang, bukan hasil
            survei. Bentuk denah tidak persis sesuai skala.
          </li>
        </ul>
      </details>
    </div>
  )
}
