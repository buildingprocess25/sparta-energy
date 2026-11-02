"use client"

import {
  formatValue,
  oneDecimal,
  wholeNumber,
} from "@/components/energy-audit/hvac-format"
import { AuditPhotos } from "@/components/energy-audit/audit-photos"
import { NumberField } from "@/components/energy-audit/number-field"
import { PhotoRow } from "@/components/energy-audit/photo-row"
import { SuggestionButton } from "@/components/energy-audit/suggestion-button"
import { ResultRow } from "@/components/energy-audit/result-row"
import { statusTone } from "@/components/energy-audit/status-tone"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
  MAKE_UP_AIR_OPTIONS,
  NO_MAKE_UP_AIR,
  VENTILATION_STATUS_LABEL,
  suggestExhaustRecommendation,
  summarizeExhaustZone,
  type HvacExhaustZone,
  type VentilationStatus,
} from "@/lib/hvac-audit"

export const ventilationTone: Record<VentilationStatus, string> = {
  MEMENUHI: statusTone.good,
  KURANG: statusTone.bad,
  BELUM_LENGKAP: statusTone.idle,
}

type HvacExhaustZoneCardProps = {
  zone: HvacExhaustZone
  sourceAuditId: string
  onChange: (next: (zone: HvacExhaustZone) => HvacExhaustZone) => void
}

export function HvacExhaustZoneCard({
  zone,
  sourceAuditId,
  onChange,
}: HvacExhaustZoneCardProps) {
  const summary = summarizeExhaustZone(zone)
  const suggestedRecommendation = suggestExhaustRecommendation(summary)
  const field = (key: keyof HvacExhaustZone) => `exhaust-${zone.key}-${key}`
  const set =
    <K extends keyof HvacExhaustZone>(key: K) =>
    (value: HvacExhaustZone[K]) =>
      onChange((current) => ({ ...current, [key]: value }))

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
      <Card className="lg:col-span-7">
        <CardHeader>
          <CardTitle className="text-sm">{summary.definition.label}</CardTitle>
          <CardDescription>
            Target pergantian udara {summary.definition.targetAch}× per jam.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <label
            htmlFor={field("present")}
            className="flex min-h-11 items-center gap-3 text-sm"
          >
            <Checkbox
              id={field("present")}
              checked={!zone.present}
              onCheckedChange={(checked) => set("present")(checked !== true)}
            />
            Toko tidak punya ruangan ini
          </label>

          {zone.present && (
            <>
              <fieldset className="grid grid-cols-2 gap-3">
                <legend className="col-span-2 mb-1 text-sm font-semibold">
                  Ruangan
                </legend>
                <Field className="col-span-2">
                  <FieldLabel htmlFor={field("roomName")} className="text-xs">
                    Nama ruangan atau titik
                  </FieldLabel>
                  <Input
                    id={field("roomName")}
                    value={zone.roomName}
                    onChange={(e) => set("roomName")(e.target.value)}
                    className="h-11"
                  />
                </Field>
                <NumberField
                  id={field("areaM2")}
                  label="Luas lantai (m²)"
                  value={zone.areaM2}
                  onChange={set("areaM2")}
                />
                <NumberField
                  id={field("heightM")}
                  label="Tinggi (m)"
                  value={zone.heightM}
                  onChange={(value) => set("heightM")(value ?? 0)}
                />
              </fieldset>

              {/* Long labels: one column on phones, two from md. */}
              <fieldset className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <legend className="mb-1 text-sm font-semibold md:col-span-2">
                  Exhaust fan
                </legend>
                <Field className="md:col-span-2">
                  <FieldLabel htmlFor={field("fanModel")} className="text-xs">
                    Tipe exhaust fan
                  </FieldLabel>
                  <Input
                    id={field("fanModel")}
                    value={zone.fanModel}
                    onChange={(e) => set("fanModel")(e.target.value)}
                    className="h-11"
                  />
                </Field>
                <NumberField
                  id={field("fanFlow")}
                  label="Aliran udara per kipas (m³/jam)"
                  value={zone.fanFlow}
                  step={1}
                  onChange={(value) => set("fanFlow")(value ?? 0)}
                />
                <NumberField
                  id={field("fanWatt")}
                  label="Daya per kipas (W)"
                  value={zone.fanWatt}
                  step={1}
                  onChange={(value) => set("fanWatt")(value ?? 0)}
                />
                <NumberField
                  id={field("fansInstalled")}
                  label="Exhaust fan terpasang (unit)"
                  value={zone.fansInstalled}
                  integer
                  onChange={set("fansInstalled")}
                />
                <NumberField
                  id={field("grilleSpeed")}
                  label="Kecepatan udara di kipas (m/s)"
                  value={zone.grilleSpeed}
                  onChange={set("grilleSpeed")}
                />
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 text-sm font-semibold">Kondisi</legend>
                <Field>
                  <FieldLabel htmlFor={field("makeUpAir")} className="text-xs">
                    Celah masuk udara
                  </FieldLabel>
                  <Select
                    value={zone.makeUpAir}
                    onValueChange={set("makeUpAir")}
                  >
                    <SelectTrigger
                      id={field("makeUpAir")}
                      className="w-full data-[size=default]:h-11"
                    >
                      <SelectValue placeholder="Pilih celah masuk udara" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAKE_UP_AIR_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel
                    htmlFor={field("bladeCondition")}
                    className="text-xs"
                  >
                    Kondisi baling-baling
                  </FieldLabel>
                  <Input
                    id={field("bladeCondition")}
                    value={zone.bladeCondition}
                    onChange={(e) => set("bladeCondition")(e.target.value)}
                    placeholder="Contoh: bilah berdebu"
                    className="h-11"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={field("noise")} className="text-xs">
                    Suara dan getaran
                  </FieldLabel>
                  <Input
                    id={field("noise")}
                    value={zone.noise}
                    onChange={(e) => set("noise")(e.target.value)}
                    placeholder="Contoh: sedikit dengung"
                    className="h-11"
                  />
                </Field>
                <Field>
                  <FieldLabel
                    htmlFor={field("recommendation")}
                    className="text-xs"
                  >
                    Tindak lanjut
                  </FieldLabel>
                  <Input
                    id={field("recommendation")}
                    value={zone.recommendation}
                    onChange={(e) => set("recommendation")(e.target.value)}
                    placeholder="Contoh: bersihkan bilah kipas"
                    className="h-11"
                  />
                  {suggestedRecommendation &&
                    zone.recommendation !== suggestedRecommendation && (
                      <SuggestionButton
                        text={suggestedRecommendation}
                        onUse={() =>
                          set("recommendation")(suggestedRecommendation)
                        }
                      />
                    )}
                </Field>
              </fieldset>

              <PhotoRow
                title="Foto exhaust fan"
                hint="Foto exhaust fan dan celah masuk udaranya."
              >
                <AuditPhotos
                  context={{
                    sourceAuditId,
                    zone: zone.key,
                    category: "tata-udara",
                  }}
                  pointLabel={zone.roomName}
                  pointCode="EXHAUST"
                  zoneLabel="Exhaust fan"
                  photos={zone.photos}
                  missing={
                    zone.fansInstalled !== null && zone.photos.length === 0
                  }
                  onChange={set("photos")}
                  perLabel="ruangan"
                />
              </PhotoRow>
            </>
          )}
        </CardContent>
      </Card>

      {zone.present && (
        <Card className="lg:sticky lg:top-20 lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-sm">Hasil ventilasi</CardTitle>
            <CardDescription>
              Dihitung otomatis saat angka diisi.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ResultRow
              label="Volume ruang"
              value={formatValue(summary.volume, "m³", oneDecimal)}
              hint="Luas × tinggi"
            />
            <ResultRow
              label="Aliran udara dibutuhkan"
              value={formatValue(summary.targetFlow, "m³/jam", wholeNumber)}
            />
            <ResultRow
              label="Exhaust fan dibutuhkan"
              value={formatValue(summary.fanTheoretical, "unit", oneDecimal)}
              hint={`Terpasang ${zone.fansInstalled ?? "-"} unit`}
            />
            <ResultRow
              label="Total daya exhaust fan"
              value={formatValue(summary.totalWatt, "W", wholeNumber)}
            />
            <ResultRow
              label="Pergantian udara sekarang"
              value={
                summary.actualAch === null
                  ? "-"
                  : `${oneDecimal.format(summary.actualAch)}× per jam`
              }
              hint={`Target ${summary.definition.targetAch}× per jam`}
              status={{
                label: VENTILATION_STATUS_LABEL[summary.status],
                className: ventilationTone[summary.status],
              }}
            />
            {zone.makeUpAir === NO_MAKE_UP_AIR && (
              <p className="rounded-xl bg-amber-100 p-3 text-xs text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
                Tanpa celah masuk udara, exhaust fan bekerja berat dan udara
                yang tersedot berkurang. Buat celah bawah pintu minimal 2 sampai
                3 cm atau pasang kisi-kisi pintu.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
