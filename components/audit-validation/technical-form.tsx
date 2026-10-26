"use client"

import {
  PlnHistoryEditor,
  type PlnDraftRow,
} from "@/components/audit-validation/pln-history-editor"
import { TimeRangeCards } from "@/components/audit/time-range-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { STORE_TYPES } from "@/lib/store-types"

export type AreaField = "sales" | "parkir" | "teras" | "gudang"

export type TechnicalDraft = {
  storeType: string
  address: string
  plnPowerVa: string
  areas: Record<AreaField, string>
  is24Hours: boolean
  openTime: string
  closeTime: string
  plnHistory: PlnDraftRow[]
}

type TechnicalFormProps = {
  value: TechnicalDraft
  onChange: (next: TechnicalDraft) => void
  isLocked: boolean
  isLatest: boolean
}

const areaFields: { key: AreaField; label: string }[] = [
  { key: "sales", label: "Sales Area" },
  { key: "parkir", label: "Parkiran" },
  { key: "teras", label: "Teras" },
  { key: "gudang", label: "Gudang, Toilet & Selasar" },
]

function UnitInput({
  id,
  unit,
  ...props
}: React.ComponentProps<typeof Input> & { unit: string }) {
  return (
    <div className="relative">
      <Input id={id} className="pr-14 text-sm font-semibold" {...props} />
      <span className="pointer-events-none absolute inset-y-0 right-3 my-auto h-fit rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
        {unit}
      </span>
    </div>
  )
}

export function TechnicalForm({
  value,
  onChange,
  isLocked,
  isLatest,
}: TechnicalFormProps) {
  const set = (patch: Partial<TechnicalDraft>) =>
    onChange({ ...value, ...patch })
  const copyNote = isLatest
    ? "Tipe, daya, luas, dan jam disalin ke data toko setelah divalidasi."
    : "Ini bukan kalkulasi terbaru toko ini, jadi tipe, daya, luas, dan jam tidak disalin ke data toko."

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Teknis Toko</CardTitle>
        <CardDescription>{copyNote}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="gap-6">
          <Field>
            <FieldLabel>Tipe toko</FieldLabel>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={1}
              value={value.storeType}
              onValueChange={(next) => {
                if (next) set({ storeType: next })
              }}
              disabled={isLocked}
              className="flex w-full flex-wrap"
              aria-label="Tipe toko"
            >
              {STORE_TYPES.map((option) => (
                <ToggleGroupItem
                  key={option}
                  value={option}
                  className="h-11 rounded-full px-4 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"
                >
                  {option}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {!value.storeType && (
              <FieldDescription>
                Tipe toko belum diisi. Pilih tipe yang sesuai.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="tech-address">Alamat toko</FieldLabel>
            <Textarea
              id="tech-address"
              value={value.address}
              onChange={(e) => set({ address: e.target.value })}
              disabled={isLocked}
              placeholder="Contoh: Jl. Sudirman No. 88, Pekanbaru"
              maxLength={300}
              rows={2}
            />
            <FieldDescription>
              Langsung disimpan ke data toko saat draf disimpan.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="tech-pln">Daya PLN</FieldLabel>
            <UnitInput
              id="tech-pln"
              unit="VA"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={value.plnPowerVa}
              onChange={(e) => set({ plnPowerVa: e.target.value })}
              disabled={isLocked}
            />
          </Field>

          <section
            className="flex flex-col gap-3"
            aria-labelledby="tech-area-heading"
          >
            <h3 id="tech-area-heading" className="text-sm font-semibold">
              Rincian luas area
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {areaFields.map(({ key, label }) => (
                <Field key={key}>
                  <FieldLabel htmlFor={`tech-${key}`} className="text-xs">
                    {label}
                  </FieldLabel>
                  <UnitInput
                    id={`tech-${key}`}
                    unit="m²"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.01}
                    value={value.areas[key]}
                    onChange={(e) =>
                      set({ areas: { ...value.areas, [key]: e.target.value } })
                    }
                    disabled={isLocked}
                  />
                </Field>
              ))}
            </div>
          </section>

          <section
            className="flex flex-col gap-3"
            aria-labelledby="tech-hours-heading"
          >
            <h3 id="tech-hours-heading" className="text-sm font-semibold">
              Jam operasional
            </h3>
            <Field orientation="horizontal" className="justify-between">
              <FieldLabel htmlFor="tech-24">Toko beroperasi 24 jam</FieldLabel>
              <Switch
                id="tech-24"
                checked={value.is24Hours}
                onCheckedChange={(checked) => set({ is24Hours: checked })}
                disabled={isLocked}
              />
            </Field>
            {value.is24Hours ? null : isLocked ? (
              <p className="text-sm font-semibold text-primary tabular-nums">
                {value.openTime} sampai {value.closeTime}
              </p>
            ) : (
              <TimeRangeCards
                startLabel="Jam Buka"
                endLabel="Jam Tutup"
                startValue={value.openTime}
                endValue={value.closeTime}
                onStartChange={(openTime) => set({ openTime })}
                onEndChange={(closeTime) => set({ closeTime })}
              />
            )}
            <FieldDescription>
              Mengubah jam operasional tidak menghitung ulang standar konsumsi
              energi.
            </FieldDescription>
          </section>

          <section
            className="flex flex-col gap-3"
            aria-labelledby="tech-pln-heading"
          >
            <h3 id="tech-pln-heading" className="text-sm font-semibold">
              Riwayat konsumsi listrik PLN
            </h3>
            <PlnHistoryEditor
              rows={value.plnHistory}
              onChange={(plnHistory) => set({ plnHistory })}
              disabled={isLocked}
            />
          </section>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
