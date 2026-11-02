"use client"

import { IconTrash } from "@tabler/icons-react"

import { BrandCombobox } from "@/components/audit/brand-combobox"
import { AuditPhotos } from "@/components/energy-audit/audit-photos"
import { PhotoRow, photoCode } from "@/components/energy-audit/photo-row"
import type { LampOption } from "@/lib/energy-audit-queries"
import {
  formatValue,
  oneDecimal,
  twoDecimals,
  wholeNumber,
} from "@/components/energy-audit/hvac-format"
import { NumberField } from "@/components/energy-audit/number-field"
import { SuggestionButton } from "@/components/energy-audit/suggestion-button"
import { ResultRow } from "@/components/energy-audit/result-row"
import { statusTone } from "@/components/energy-audit/status-tone"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  COP_STATUS_LABEL,
  COP_TARGET,
  DELTA_T_MAX,
  DELTA_T_MIN,
  DELTA_T_STATUS_LABEL,
  ROOM_TEMP_MAX,
  ROOM_TEMP_MIN,
  ROOM_TEMP_STATUS_LABEL,
  getSupplyTempRange,
  suggestUnitRecommendation,
  type AcUnitSummary,
  type CopStatus,
  type DeltaTStatus,
  type HvacAcUnit,
  type RoomTempStatus,
} from "@/lib/hvac-audit"

export const copTone: Record<CopStatus, string> = {
  SANGAT_EFISIEN: statusTone.good,
  NORMAL: statusTone.good,
  DEGRADASI: statusTone.warn,
  KRITIS: statusTone.bad,
  BELUM_LENGKAP: statusTone.idle,
}

const roomTone: Record<RoomTempStatus, string> = {
  SESUAI: statusTone.good,
  TERLALU_DINGIN: statusTone.warn,
  TERLALU_PANAS: statusTone.warn,
  BELUM_DIUKUR: statusTone.idle,
}

const deltaTone: Record<DeltaTStatus, string> = {
  NORMAL: statusTone.good,
  KURANG: statusTone.warn,
  TINGGI: statusTone.warn,
  BELUM_DIUKUR: statusTone.idle,
}

type HvacAcUnitCardProps = {
  summary: AcUnitSummary
  sourceAuditId: string
  // AC types and brands from the equipment master ("Sistem HVAC").
  typeOptions: LampOption[]
  onChange: (next: (unit: HvacAcUnit) => HvacAcUnit) => void
  onRemove: () => void
}

export function HvacAcUnitCard({
  summary,
  sourceAuditId,
  typeOptions,
  onChange,
  onRemove,
}: HvacAcUnitCardProps) {
  const { unit } = summary
  const supplyRange = getSupplyTempRange(unit.returnTemp)
  const suggestedRecommendation = suggestUnitRecommendation(summary.copStatus)
  const field = (key: keyof HvacAcUnit) => `ac-${unit.id}-${key}`
  const set =
    <K extends keyof HvacAcUnit>(key: K) =>
    (value: HvacAcUnit[K]) =>
      onChange((current) => ({ ...current, [key]: value }))

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
      <Card className="lg:col-span-7">
        <CardHeader>
          <CardTitle className="text-sm">{unit.label || "Unit AC"}</CardTitle>
          <CardDescription>
            Isi angka dari alat ukur listrik dan alat ukur suhu.
          </CardDescription>
          <CardAction>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 text-destructive hover:text-destructive"
              aria-label={`Hapus ${unit.label}`}
              onClick={onRemove}
            >
              <IconTrash />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <fieldset className="grid grid-cols-2 gap-3">
            <legend className="col-span-2 mb-1 text-sm font-semibold">
              Unit
            </legend>
            <Field>
              <FieldLabel htmlFor={field("label")} className="text-xs">
                ID unit
              </FieldLabel>
              <Input
                id={field("label")}
                value={unit.label}
                onChange={(e) => set("label")(e.target.value)}
                className="h-11"
              />
            </Field>
            <NumberField
              id={field("pk")}
              label="Kapasitas (PK)"
              value={unit.pk}
              step={0.5}
              onChange={set("pk")}
              description={
                summary.nominalBtu === null
                  ? undefined
                  : `${wholeNumber.format(summary.nominalBtu)} BTU/jam`
              }
            />
            <Field className="col-span-2">
              <FieldLabel htmlFor={field("type")} className="text-xs">
                Tipe unit
              </FieldLabel>
              <BrandCombobox
                id={field("type")}
                brands={typeOptions}
                value={unit.type}
                onChange={(value) => {
                  // Picking a master type also brings its nameplate power along.
                  const option = typeOptions.find(
                    (item) =>
                      item.name.toLowerCase() === value.trim().toLowerCase()
                  )
                  onChange((current) => ({
                    ...current,
                    type: value,
                    ratedKw: option ? option.baseKw : current.ratedKw,
                  }))
                }}
                placeholder="Pilih atau ketik tipe AC"
                searchPlaceholder="Cari tipe AC atau ketik baru"
                className="h-11 text-sm"
              />
            </Field>
          </fieldset>

          {/* Phones get two columns; three only from md, where the page widens past max-w-md. */}
          <fieldset className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <legend className="col-span-2 mb-1 text-sm font-semibold md:col-span-3">
              Listrik
            </legend>
            <p className="col-span-2 -mt-1 text-xs text-muted-foreground md:col-span-3">
              Angka dari clamp meter saat AC menyala, bukan dari label pabrik.
            </p>
            <NumberField
              id={field("volt")}
              label="Tegangan (V)"
              value={unit.volt}
              onChange={set("volt")}
            />
            <NumberField
              id={field("ampere")}
              label="Arus (A)"
              value={unit.ampere}
              step={0.01}
              onChange={set("ampere")}
            />
            <NumberField
              id={field("powerFactor")}
              label="Faktor daya (cos φ)"
              className="col-span-2 md:col-span-1"
              value={unit.powerFactor}
              step={0.01}
              onChange={set("powerFactor")}
            />
          </fieldset>

          <fieldset className="grid grid-cols-2 gap-3">
            <legend className="col-span-2 mb-1 text-sm font-semibold">
              Suhu
            </legend>
            <NumberField
              id={field("roomTemp")}
              label="Suhu ruang (°C)"
              value={unit.roomTemp}
              onChange={set("roomTemp")}
            />
            <NumberField
              id={field("humidity")}
              label="Kelembaban (%)"
              value={unit.humidity}
              onChange={set("humidity")}
            />
            <NumberField
              id={field("returnTemp")}
              label="Udara masuk AC (°C)"
              value={unit.returnTemp}
              onChange={set("returnTemp")}
            />
            <NumberField
              id={field("supplyTemp")}
              label="Udara keluar AC (°C)"
              value={unit.supplyTemp}
              onChange={set("supplyTemp")}
              description={
                unit.returnTemp === null
                  ? `Ideal ${oneDecimal.format(supplyRange.min)} sampai ${oneDecimal.format(supplyRange.max)}°C untuk ruang 24 sampai 26°C`
                  : `Ideal ${oneDecimal.format(supplyRange.min)} sampai ${oneDecimal.format(supplyRange.max)}°C (suhu udara masuk dikurangi ${DELTA_T_MIN} sampai ${DELTA_T_MAX}°C)`
              }
            />
          </fieldset>

          <fieldset className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <legend className="col-span-2 mb-1 text-sm font-semibold md:col-span-3">
              Aliran udara keluar
            </legend>
            <NumberField
              id={field("airSpeed")}
              label="Kecepatan (m/s)"
              value={unit.airSpeed}
              step={0.01}
              onChange={set("airSpeed")}
            />
            <NumberField
              id={field("grilleAreaM2")}
              label="Luas lubang (m²)"
              value={unit.grilleAreaM2}
              step={0.0001}
              onChange={set("grilleAreaM2")}
            />
            <NumberField
              id={field("shr")}
              label="Faktor beban (SHR)"
              className="col-span-2 md:col-span-1"
              value={unit.shr}
              step={0.01}
              description="Biarkan 0,72 kalau tidak ada data"
              onChange={(value) => set("shr")(value ?? 0)}
            />
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-sm font-semibold">Kondisi</legend>
            <Field>
              <FieldLabel
                htmlFor={field("filterCondition")}
                className="text-xs"
              >
                Kebersihan filter dan sirip pendingin
              </FieldLabel>
              <Input
                id={field("filterCondition")}
                value={unit.filterCondition}
                onChange={(e) => set("filterCondition")(e.target.value)}
                placeholder="Contoh: filter sedikit berdebu"
                className="h-11"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={field("drainCondition")} className="text-xs">
                Saluran air buangan dan suara
              </FieldLabel>
              <Input
                id={field("drainCondition")}
                value={unit.drainCondition}
                onChange={(e) => set("drainCondition")(e.target.value)}
                placeholder="Contoh: lancar, getaran wajar"
                className="h-11"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={field("recommendation")} className="text-xs">
                Tindak lanjut
              </FieldLabel>
              <Input
                id={field("recommendation")}
                value={unit.recommendation}
                onChange={(e) => set("recommendation")(e.target.value)}
                placeholder="Contoh: jadwalkan pembersihan filter"
                className="h-11"
              />
              {suggestedRecommendation &&
                unit.recommendation !== suggestedRecommendation && (
                  <SuggestionButton
                    text={suggestedRecommendation}
                    onUse={() => set("recommendation")(suggestedRecommendation)}
                  />
                )}
            </Field>
          </fieldset>

          <PhotoRow title="Foto unit" hint="Foto unit AC dan label pabriknya.">
            <AuditPhotos
              context={{ sourceAuditId, zone: "AC", category: "tata-udara" }}
              pointLabel={unit.label}
              pointCode={photoCode(unit.label, "AC")}
              zoneLabel="AC area sales"
              photos={unit.photos}
              missing={summary.powerKw !== null && unit.photos.length === 0}
              onChange={set("photos")}
              perLabel="unit"
            />
          </PhotoRow>
        </CardContent>
      </Card>

      <Card className="lg:sticky lg:top-20 lg:col-span-5">
        <CardHeader>
          <CardTitle className="text-sm">Hasil {unit.label}</CardTitle>
          <CardDescription>Dihitung otomatis saat angka diisi.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ResultRow
            label="Daya listrik terpakai"
            value={formatValue(summary.powerKw, "kW", twoDecimals)}
            hint={
              unit.ratedKw === null
                ? "Tegangan × arus × faktor daya"
                : `Label pabrik ${twoDecimals.format(unit.ratedKw)} kW`
            }
          />
          <ResultRow
            label="Suhu ruang"
            value={formatValue(unit.roomTemp, "°C", oneDecimal)}
            hint={`Standar ${ROOM_TEMP_MIN} sampai ${ROOM_TEMP_MAX}°C`}
            status={{
              label: ROOM_TEMP_STATUS_LABEL[summary.roomTempStatus],
              className: roomTone[summary.roomTempStatus],
            }}
          />
          <ResultRow
            label="Selisih suhu udara masuk dan keluar"
            value={formatValue(summary.deltaT, "°C", oneDecimal)}
            hint={`Normal ${DELTA_T_MIN} sampai ${DELTA_T_MAX}°C`}
            status={{
              label: DELTA_T_STATUS_LABEL[summary.deltaTStatus],
              className: deltaTone[summary.deltaTStatus],
            }}
          />
          <ResultRow
            label="Aliran udara"
            value={formatValue(summary.airflow, "m³/jam", wholeNumber)}
          />
          <ResultRow
            label="Daya dingin terukur"
            value={formatValue(summary.capacityKw, "kW", twoDecimals)}
            hint={
              summary.capacityBtu === null
                ? undefined
                : `${wholeNumber.format(summary.capacityBtu)} BTU/jam`
            }
          />
          <ResultRow
            label="Efisiensi AC (COP)"
            value={summary.cop === null ? "-" : twoDecimals.format(summary.cop)}
            hint={`Target minimal ${twoDecimals.format(COP_TARGET)}`}
            status={{
              label: COP_STATUS_LABEL[summary.copStatus],
              className: copTone[summary.copStatus],
            }}
          />
          {summary.overCapacity &&
            summary.capacityBtu !== null &&
            summary.nominalBtu !== null && (
              <p className="rounded-xl bg-amber-100 p-3 text-xs text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
                Daya dingin terukur {wholeNumber.format(summary.capacityBtu)}{" "}
                BTU/jam, lebih dari 10% di atas kapasitas di label pabrik (
                {wholeNumber.format(summary.nominalBtu)} BTU/jam). Ukur ulang
                kecepatan udara keluar atau luas lubang udaranya.
              </p>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
