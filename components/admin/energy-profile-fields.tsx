"use client"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { computeDailyKwh, fromKw, isUsageMethod, type PowerUnit } from "@/lib/energy-formula"
import {
  parseDecimal,
  resolveProfileDraft,
  type EnergyProfileDraft,
  type PowerInputMode,
} from "@/lib/energy-profile-draft"

const PREVIEW_HOURS = 10

function formatPower(kw: number) {
  if (!Number.isFinite(kw)) return "-"
  return kw >= 1
    ? `${(Math.round(kw * 1000) / 1000).toLocaleString("id-ID")} kW`
    : `${(Math.round(fromKw(kw, "W") * 10) / 10).toLocaleString("id-ID")} W`
}

function formatKwh(kwh: number) {
  return `${(Math.round(kwh * 100) / 100).toLocaleString("id-ID")} kWh`
}

function formatPct(pct: number) {
  return `${(Math.round(pct * 10) / 10).toLocaleString("id-ID")}%`
}

type EnergyProfileFieldsProps = {
  idPrefix: string
  draft: EnergyProfileDraft
  onChange: (draft: EnergyProfileDraft) => void
  operationType: string
  calcMethod: string
  cycleSeconds: number | null
  disabled?: boolean
}

// Brand power profile from the revision sheet: nameplate for every brand, and
// running/standby power plus running time for DINAMIS. H is shown, never typed.
export function EnergyProfileFields({
  idPrefix,
  draft,
  onChange,
  operationType,
  calcMethod,
  cycleSeconds,
  disabled,
}: EnergyProfileFieldsProps) {
  const dynamic = operationType === "DINAMIS"
  const { values, issues } = resolveProfileDraft(draft, operationType, calcMethod, cycleSeconds)
  const hasNameplate = Number.isFinite(parseDecimal(draft.nameplate))
  const set = (patch: Partial<EnergyProfileDraft>) => onChange({ ...draft, ...patch })
  const ids = {
    nameplate: `${idPrefix}-nameplate`,
    running: `${idPrefix}-running`,
    standby: `${idPrefix}-standby`,
    runningTime: `${idPrefix}-running-time`,
    standbyTime: `${idPrefix}-standby-time`,
  }

  const preview =
    issues.length === 0 && !isUsageMethod(calcMethod)
      ? computeDailyKwh(
          {
            operationType: dynamic ? "DINAMIS" : "STATIS",
            calcMethod: "STANDARD",
            baseKw: values.baseKw,
            runningKw: values.runningKw,
            standbyKw: values.standbyKw,
            runningTimePct: values.runningTimePct,
            standbyTimePct: values.standbyTimePct,
          },
          { qty: 1, hours: PREVIEW_HOURS }
        ).dailyKwh
      : null

  return (
    <FieldGroup className="gap-4">
      <Field>
        <FieldLabel htmlFor={ids.nameplate}>Daya nameplate *</FieldLabel>
        <div className="flex gap-2">
          <Input
            id={ids.nameplate}
            inputMode="decimal"
            placeholder={draft.nameplateUnit === "W" ? "Contoh: 900" : "Contoh: 0,9"}
            value={draft.nameplate}
            onChange={(e) => set({ nameplate: e.target.value })}
            disabled={disabled}
          />
          <UnitSelect
            label="Satuan daya nameplate"
            value={draft.nameplateUnit}
            onChange={(unit) => set({ nameplateUnit: unit as PowerUnit })}
            options={[
              { value: "W", label: "W" },
              { value: "kW", label: "kW" },
            ]}
            disabled={disabled}
          />
        </div>
        <FieldDescription>Angka daya di stiker nameplate alat.</FieldDescription>
      </Field>

      {dynamic && (
        <>
          <PowerField
            id={ids.running}
            label="Daya running *"
            mode={draft.runningMode}
            unit={draft.runningUnit}
            value={draft.running}
            resolvedKw={values.runningKw}
            showResolved={hasNameplate}
            disabled={disabled}
            onChange={(patch) =>
              set({
                runningMode: patch.mode ?? draft.runningMode,
                runningUnit: patch.unit ?? draft.runningUnit,
                running: patch.value ?? draft.running,
              })
            }
          />
          <PowerField
            id={ids.standby}
            label="Daya standby *"
            mode={draft.standbyMode}
            unit={draft.standbyUnit}
            value={draft.standby}
            resolvedKw={values.standbyKw}
            showResolved={hasNameplate}
            disabled={disabled}
            onChange={(patch) =>
              set({
                standbyMode: patch.mode ?? draft.standbyMode,
                standbyUnit: patch.unit ?? draft.standbyUnit,
                standby: patch.value ?? draft.standby,
              })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor={ids.runningTime}>Waktu running (%) *</FieldLabel>
              <Input
                id={ids.runningTime}
                inputMode="decimal"
                placeholder="Contoh: 20"
                value={draft.runningTimePct}
                onChange={(e) => set({ runningTimePct: e.target.value })}
                disabled={disabled}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={ids.standbyTime}>Waktu standby (%)</FieldLabel>
              <Input
                id={ids.standbyTime}
                readOnly
                tabIndex={-1}
                aria-describedby={`${ids.standbyTime}-hint`}
                value={
                  Number.isFinite(values.standbyTimePct ?? Number.NaN)
                    ? formatPct(values.standbyTimePct!)
                    : ""
                }
                placeholder="Otomatis"
              />
              <FieldDescription id={`${ids.standbyTime}-hint`}>Sisa dari 100%.</FieldDescription>
            </Field>
          </div>
        </>
      )}

      <div aria-live="polite" className="flex flex-col gap-1 rounded-xl bg-muted px-4 py-3 text-sm">
        {issues.length > 0 ? (
          <p className="text-foreground/90">{issues[0].message}</p>
        ) : (
          <>
            <p className="font-medium">Daya base (H): {formatPower(values.baseKw)}</p>
            {dynamic && (
              <p className="text-foreground/90">
                {formatPower(values.runningKw)} × {formatPct(values.runningTimePct!)} +{" "}
                {formatPower(values.standbyKw)} × {formatPct(values.standbyTimePct!)}
              </p>
            )}
            <p className="text-foreground/90">
              {preview !== null
                ? `Nyala ${PREVIEW_HOURS} jam: ${formatKwh(preview)} per hari, dibanding nameplate × jam ${formatKwh(values.nameplateKw * PREVIEW_HOURS)}.`
                : `kWh harian dihitung dari jumlah ${calcMethod === "TRANSACTION" ? "transaksi" : "batch"} yang diisi di form toko.`}
            </p>
          </>
        )}
      </div>
    </FieldGroup>
  )
}

function UnitSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label={label} className="w-32 shrink-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function PowerField({
  id,
  label,
  mode,
  unit,
  value,
  resolvedKw,
  showResolved,
  disabled,
  onChange,
}: {
  id: string
  label: string
  mode: PowerInputMode
  unit: PowerUnit
  value: string
  resolvedKw: number
  showResolved: boolean
  disabled?: boolean
  onChange: (patch: { mode?: PowerInputMode; unit?: PowerUnit; value?: string }) => void
}) {
  const hintId = `${id}-hint`
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex gap-2">
        <Input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange({ value: e.target.value })}
          disabled={disabled}
          aria-describedby={hintId}
        />
        <UnitSelect
          label={`Satuan ${label.replace(" *", "").toLowerCase()}`}
          value={mode === "pct" ? "pct" : unit}
          onChange={(next) =>
            onChange(next === "pct" ? { mode: "pct" } : { mode: "power", unit: next as PowerUnit })
          }
          options={[
            { value: "pct", label: "% nameplate" },
            { value: "W", label: "W" },
            { value: "kW", label: "kW" },
          ]}
          disabled={disabled}
        />
      </div>
      <FieldDescription id={hintId}>
        {mode === "pct" && showResolved && Number.isFinite(resolvedKw)
          ? `Setara ${formatPower(resolvedKw)}.`
          : mode === "pct"
            ? "Persen dari daya nameplate."
            : `Daya dalam ${unit}.`}
      </FieldDescription>
    </Field>
  )
}
