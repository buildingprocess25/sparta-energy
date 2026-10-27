"use client"

import { IconPlus, IconTrash } from "@tabler/icons-react"

import {
  LuxRowPhotos,
  type LuxPhotoContext,
} from "@/components/energy-audit/lux-row-photos"
import { Button } from "@/components/ui/button"
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
  getLuxArea,
  type LightingLuxRow,
  type LuxArea,
  type LuxSubZone,
} from "@/lib/lighting-audit"
import { cn } from "@/lib/utils"

const NO_SUB_ZONE = "none"

type LuxMeasurementTableProps = {
  zoneLabel: string
  rows: LightingLuxRow[]
  subZones: boolean
  noteNeededAreas: LuxArea[]
  photoContext: LuxPhotoContext
  onChange: (rows: LightingLuxRow[]) => void
  createId: () => string
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
  noteNeededAreas,
  photoContext,
  onChange,
  createId,
}: LuxMeasurementTableProps) {
  const columns = subZones
    ? "sm:grid-cols-[2rem_7.5rem_7rem_minmax(0,1fr)_6.5rem_2.75rem]"
    : "sm:grid-cols-[2rem_7rem_minmax(0,1fr)_6.5rem_2.75rem]"

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
        <span>Lux</span>
        <span>Catatan</span>
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
            const area = getLuxArea(row.subZone)
            const needsNote =
              area !== null &&
              noteNeededAreas.includes(area) &&
              row.note.trim() === ""
            const number = index + 1

            return (
              <li
                key={row.id}
                className={cn(
                  "grid grid-cols-2 items-center gap-2 rounded-xl bg-muted/40 p-3",
                  columns
                )}
              >
                <span className="col-span-2 text-xs font-medium text-muted-foreground tabular-nums sm:col-span-1 sm:text-sm">
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
                      className="h-11 w-full"
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
                  aria-label={`Lux titik ${number} ${zoneLabel}`}
                  className={cn(
                    "h-11 tabular-nums",
                    !subZones && "col-span-2 sm:col-span-1"
                  )}
                />

                <Input
                  value={row.note}
                  onChange={(e) => updateRow(row.id, { note: e.target.value })}
                  placeholder={
                    needsNote
                      ? "Wajib: kenapa area ini berbeda?"
                      : "Contoh: tidak ada rak, lampu mati"
                  }
                  aria-label={`Catatan titik ${number} ${zoneLabel}`}
                  aria-invalid={needsNote || undefined}
                  className="col-span-2 h-11 sm:col-span-1"
                />

                <LuxRowPhotos
                  context={photoContext}
                  pointLabel={row.subZone ?? `titik ${number}`}
                  pointCode={row.subZone ?? `T${number}`}
                  zoneLabel={zoneLabel}
                  photos={row.photos}
                  missing={row.lux !== null && row.photos.length === 0}
                  onChange={(photos) => updateRow(row.id, { photos })}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-11 justify-self-end text-destructive hover:text-destructive"
                  aria-label={`Hapus titik ${number}`}
                  onClick={() =>
                    onChange(rows.filter((item) => item.id !== row.id))
                  }
                >
                  <IconTrash />
                </Button>
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
