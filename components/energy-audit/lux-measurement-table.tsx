"use client"

import type { CSSProperties } from "react"
import { IconPlus, IconTrash } from "@tabler/icons-react"

import {
  AuditPhotos,
  type AuditPhotoContext,
} from "@/components/energy-audit/audit-photos"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LUX_SUB_ZONES,
  getDimLuxLimit,
  getLuxLevel,
  type LightingLuxRow,
  type LightingZoneDefinition,
  type LuxLevel,
  type LuxSubZone,
} from "@/lib/lighting-audit"
import { cn } from "@/lib/utils"

const NO_SUB_ZONE = "none"

type LuxMeasurementTableProps = {
  zoneLabel: string
  rows: LightingLuxRow[]
  subZones: boolean
  definition: LightingZoneDefinition
  photoContext: AuditPhotoContext
  onChange: (rows: LightingLuxRow[]) => void
  createId: () => string
}

// Traffic-light colors: green meets the minimum, amber is just below it, red is dim.
// Border only, no ring, so a colored field keeps the same size as its neighbours.
const pointTone: Record<
  Exclude<LuxLevel, "BELUM_DIUKUR">,
  { input: string; hint: string }
> = {
  SESUAI: {
    input: "border-emerald-500 dark:border-emerald-500/60",
    hint: "text-emerald-700 dark:text-emerald-300",
  },
  HAMPIR: {
    input: "border-amber-500 dark:border-amber-500/60",
    hint: "text-amber-700 dark:text-amber-300",
  },
  REDUP: {
    input: "border-destructive dark:border-destructive/70",
    hint: "text-destructive",
  },
}

function pointHint(
  level: LuxLevel,
  lux: number,
  definition: LightingZoneDefinition
) {
  if (level === "REDUP") return `Di bawah ${getDimLuxLimit(definition)} lux`
  if (level === "HAMPIR") return `Sedikit di bawah ${definition.luxMin} lux`
  if (lux > definition.luxMax) return `Di atas ${definition.luxMax} lux`
  return "Sesuai standar"
}

// Controls share one centered row; the hint gets its own row under the lux field
// so it never pushes the controls off center. Empty rows are left out entirely.
function rowAreas(
  subZones: boolean,
  hasHint: boolean,
  hasNote: boolean
): CSSProperties {
  const phone = [
    "num del",
    subZones ? "sub lux" : "lux lux",
    ...(hasHint ? [subZones ? ". hint" : "hint hint"] : []),
    "photo photo",
    ...(hasNote ? ["note note"] : []),
  ]
  const wide = subZones
    ? ["num", "sub", "lux", "photo", "del"]
    : ["num", "lux", "photo", "del"]
  const desktop = [
    wide.join(" "),
    ...(hasHint
      ? [wide.map((area) => (area === "lux" ? "hint" : ".")).join(" ")]
      : []),
    ...(hasNote ? [wide.map(() => "note").join(" ")] : []),
  ]
  const toAreas = (rows: string[]) => rows.map((row) => `"${row}"`).join(" ")
  return {
    "--lux-areas": toAreas(phone),
    "--lux-areas-sm": toAreas(desktop),
  } as CSSProperties
}

function parseLux(value: string) {
  if (value.trim() === "") return null
  const number = Number(value.replace(",", "."))
  return Number.isFinite(number) && number >= 0 ? number : null
}

export function LuxMeasurementTable({
  zoneLabel,
  rows,
  subZones,
  definition,
  photoContext,
  onChange,
  createId,
}: LuxMeasurementTableProps) {
  const columns = subZones
    ? "sm:grid-cols-[2rem_7.5rem_minmax(0,1fr)_6.5rem_2.75rem]"
    : "sm:grid-cols-[2rem_minmax(0,1fr)_6.5rem_2.75rem]"

  function updateRow(id: string, patch: Partial<LightingLuxRow>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "hidden gap-2 px-3 text-xs font-medium text-muted-foreground sm:grid",
          columns
        )}
        aria-hidden="true"
      >
        <span>No</span>
        {subZones && <span>Sub zona</span>}
        <span>Terang (lux)</span>
        <span>Foto</span>
        <span />
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
          Belum ada baris. Tambah baris untuk mencatat hasil ukur.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {rows.map((row, index) => {
            const number = index + 1
            const pointName = `titik ${row.subZone ?? number}`
            const level = getLuxLevel(row.lux, definition)
            const tone = level === "BELUM_DIUKUR" ? null : pointTone[level]
            const isDim = level === "REDUP"
            // Older drafts may hold notes on normal points; keep them visible.
            const showNote = isDim || row.note.trim() !== ""

            return (
              <li
                key={row.id}
                className={cn(
                  "grid grid-cols-2 items-center gap-2 rounded-xl bg-muted/40 p-3 [grid-template-areas:var(--lux-areas)] sm:[grid-template-areas:var(--lux-areas-sm)]",
                  columns
                )}
                style={rowAreas(subZones, tone !== null, showNote)}
              >
                <span className="text-xs font-medium text-muted-foreground tabular-nums [grid-area:num] sm:text-sm">
                  <span className="sm:hidden">Titik </span>
                  {number}
                </span>

                {subZones && (
                  <Select
                    value={row.subZone ?? NO_SUB_ZONE}
                    onValueChange={(value) =>
                      updateRow(row.id, {
                        subZone:
                          value === NO_SUB_ZONE ? null : (value as LuxSubZone),
                      })
                    }
                  >
                    <SelectTrigger
                      className="w-full [grid-area:sub] data-[size=default]:h-11"
                      aria-label={`Sub zona titik ${number} ${zoneLabel}`}
                    >
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_SUB_ZONE}>Belum dipilih</SelectItem>
                      {LUX_SUB_ZONES.map((subZone) => (
                        <SelectItem key={subZone} value={subZone}>
                          {subZone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={row.lux ?? ""}
                  onChange={(e) =>
                    updateRow(row.id, { lux: parseLux(e.target.value) })
                  }
                  placeholder="Lux"
                  aria-label={`Tingkat terang titik ${number} ${zoneLabel}`}
                  aria-describedby={tone ? `lux-hint-${row.id}` : undefined}
                  className={cn(
                    "h-11 tabular-nums [grid-area:lux]",
                    tone?.input
                  )}
                />

                {tone && (
                  <span
                    id={`lux-hint-${row.id}`}
                    className={cn(
                      "-mt-1 px-3 text-xs font-medium [grid-area:hint]",
                      tone.hint
                    )}
                  >
                    {pointHint(level, row.lux ?? 0, definition)}
                  </span>
                )}

                <AuditPhotos
                  context={photoContext}
                  pointLabel={row.subZone ?? `titik ${number}`}
                  pointCode={row.subZone ?? `T${number}`}
                  zoneLabel={zoneLabel}
                  photos={row.photos}
                  onChange={(photos) => updateRow(row.id, { photos })}
                  className="w-full [grid-area:photo]"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-11 justify-self-end text-destructive [grid-area:del] hover:text-destructive"
                  aria-label={`Hapus titik ${number}`}
                  onClick={() =>
                    onChange(rows.filter((item) => item.id !== row.id))
                  }
                >
                  <IconTrash />
                </Button>

                {showNote && (
                  <Field className="[grid-area:note]">
                    <FieldLabel htmlFor={`lux-note-${row.id}`}>
                      {isDim
                        ? `Kenapa ${pointName} redup?`
                        : `Catatan ${pointName}`}
                    </FieldLabel>
                    <Input
                      id={`lux-note-${row.id}`}
                      value={row.note}
                      onChange={(e) =>
                        updateRow(row.id, { note: e.target.value })
                      }
                      placeholder="Contoh: lampu mati"
                      className="h-11"
                    />
                  </Field>
                )}
              </li>
            )
          })}
        </ol>
      )}

      <Button
        type="button"
        variant="outline"
        className="h-11"
        onClick={() =>
          onChange([
            ...rows,
            { id: createId(), subZone: null, lux: null, note: "", photos: [] },
          ])
        }
      >
        <IconPlus data-icon="inline-start" />
        Tambah Baris
      </Button>
    </div>
  )
}
