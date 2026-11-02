"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconArrowRight,
  IconCalculator,
  IconChevronLeft,
  IconCircleCheck,
  IconDeviceFloppy,
  IconDownload,
  IconMapPin,
  IconPlus,
} from "@tabler/icons-react"
import { toast } from "sonner"

import {
  calculateHvacAcStandard,
  saveHvacAudit,
} from "@/app/actions/energy-audit"
import { StepActionBar } from "@/components/audit-validation/step-action-bar"
import { AuditStepIndicator } from "@/components/audit/step-indicator"
import { AcCountFlag } from "@/components/energy-audit/ac-count-flag"
import { DraftRestoreAlert } from "@/components/energy-audit/draft-restore-alert"
import {
  HvacAcUnitCard,
  copTone,
} from "@/components/energy-audit/hvac-ac-unit-card"
import {
  HvacExhaustZoneCard,
  ventilationTone,
} from "@/components/energy-audit/hvac-exhaust-zone-card"
import {
  oneDecimal,
  twoDecimals,
  wholeNumber,
} from "@/components/energy-audit/hvac-format"
import { NumberField } from "@/components/energy-audit/number-field"
import { useDraftBackup } from "@/components/energy-audit/use-draft-backup"
import { Header } from "@/components/header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { HvacAuditForm as HvacAuditFormData } from "@/lib/energy-audit-queries"
import {
  COP_STATUS_LABEL,
  EXHAUST_ZONES,
  HVAC_ECO_SUGGESTIONS,
  HVAC_MEASURING_TOOLS,
  HVAC_STANDARD_NOTE,
  VENTILATION_STATUS_LABEL,
  createAcUnit,
  getHvacCompletionIssues,
  sanitizeHvacAuditData,
  suggestEco,
  summarizeHvacAudit,
  type ExhaustZoneKey,
  type HvacAcUnit,
  type HvacAuditData,
  type HvacExhaustZone,
} from "@/lib/hvac-audit"
import { cn } from "@/lib/utils"

const MapPicker = dynamic(
  () => import("@/components/ac-estimation/map-picker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border bg-muted/30 text-xs text-muted-foreground">
        Memuat peta...
      </div>
    ),
  }
)

type Step = 1 | 2 | 3 | 4

const stepLabels: Record<Step, { label: string; description: string }> = {
  1: {
    label: "Step 1: Verifikasi AC",
    description:
      "Cocokkan jumlah AC terpasang dengan jumlah AC ideal dari kalkulator AC.",
  },
  2: {
    label: "Step 2: Performa AC",
    description:
      "Ukur listrik, suhu, dan aliran udara setiap AC di area sales.",
  },
  3: {
    label: "Step 3: Exhaust Fan",
    description:
      "Cek kecukupan exhaust fan di ruang mesin chiller, gudang, dan toilet.",
  },
  4: {
    label: "Step 4: Ringkasan",
    description: "Cek hasil seluruh pemeriksaan, lalu selesaikan.",
  },
}

// Used only to center the map when the store has no pin yet.
const MAP_FALLBACK_CENTER: [number, number] = [-6.2, 106.816666]

const areaFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 })
const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" })

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `ac-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// A new card copies what units in one store usually share; measurements stay empty.
function createUnitLike(units: HvacAcUnit[], index: number): HvacAcUnit {
  const previous = units[units.length - 1]
  const unit = createAcUnit(newId(), index)
  return previous
    ? {
        ...unit,
        type: previous.type,
        pk: previous.pk,
        ratedKw: previous.ratedKw,
        grilleAreaM2: previous.grilleAreaM2,
        shr: previous.shr,
      }
    : unit
}

function roundCoord(value: number) {
  return Math.round(value * 1e6) / 1e6
}

function formatCoord(latitude: number | null, longitude: number | null) {
  return latitude === null || longitude === null
    ? ""
    : `${latitude}, ${longitude}`
}

function parseCoord(text: string): [number, number] | null {
  const parts = text.split(",").map((part) => Number(part.trim()))
  if (parts.length !== 2 || parts.some((part) => !Number.isFinite(part)))
    return null
  const [latitude, longitude] = parts
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
  return [roundCoord(latitude), roundCoord(longitude)]
}

type HvacAuditFormProps = {
  form: HvacAuditFormData
  currentAuditor: string
}

export function HvacAuditForm({ form, currentAuditor }: HvacAuditFormProps) {
  const router = useRouter()
  const [isSaving, startSaving] = useTransition()
  const [isCalculating, startCalculating] = useTransition()
  const [data, setData] = useState<HvacAuditData>(form.data)
  const [step, setStep] = useState<Step>(1)
  const [coordText, setCoordText] = useState(
    formatCoord(form.data.latitude, form.data.longitude)
  )
  const [activeUnitId, setActiveUnitId] = useState(
    form.data.units[0]?.id ?? null
  )
  const [activeZone, setActiveZone] = useState<ExhaustZoneKey>("CHILLER")
  const [isDirty, setIsDirty] = useState(false)
  const [issues, setIssues] = useState<string[]>([])

  const summary = useMemo(() => summarizeHvacAudit(data), [data])
  const suggestedEco = useMemo(() => suggestEco(data), [data])
  const ecoPrefilled = useRef(form.data.eco.length > 0)
  const activeUnit =
    summary.units.find((unit) => unit.unit.id === activeUnitId) ??
    summary.units[0]
  const activeExhaust = data.exhaust.find((zone) => zone.key === activeZone)!
  const basePath = `/audit/kategori/${form.context.sourceAuditId}`
  const isCompleted = form.status === "COMPLETED"
  const hasCoord = data.latitude !== null && data.longitude !== null
  const standard = data.acStandard

  const { backup, clearBackup, dismissBackup } = useDraftBackup(
    `hvac-audit:${form.context.sourceAuditId}`,
    data,
    isDirty,
    form.updatedAt
  )

  function restoreBackup() {
    if (!backup) return
    const restored = sanitizeHvacAuditData(backup.data)
    setData(restored)
    setCoordText(formatCoord(restored.latitude, restored.longitude))
    setActiveUnitId(restored.units[0]?.id ?? null)
    setIsDirty(true)
    dismissBackup()
    toast.success("Isian dipulihkan. Simpan draf supaya tersimpan di server.")
  }

  function update(next: (current: HvacAuditData) => HvacAuditData) {
    setData(next)
    setIsDirty(true)
  }

  function updateUnit(id: string, next: (unit: HvacAcUnit) => HvacAcUnit) {
    update((current) => {
      const before = current.units.find((unit) => unit.id === id)
      if (!before) return current
      const changed = next(before)
      // Units of the same type share the grille size, so the first measurement fills the rest.
      const shareGrille =
        changed.grilleAreaM2 !== null &&
        changed.grilleAreaM2 !== before.grilleAreaM2
      return {
        ...current,
        units: current.units.map((unit) => {
          if (unit.id === id) return changed
          if (
            shareGrille &&
            unit.grilleAreaM2 === null &&
            unit.type === changed.type
          ) {
            return { ...unit, grilleAreaM2: changed.grilleAreaM2 }
          }
          return unit
        }),
      }
    })
  }

  function updateZone(
    key: ExhaustZoneKey,
    next: (zone: HvacExhaustZone) => HvacExhaustZone
  ) {
    update((current) => ({
      ...current,
      exhaust: current.exhaust.map((zone) =>
        zone.key === key ? next(zone) : zone
      ),
    }))
  }

  function setPosition([latitude, longitude]: [number, number]) {
    const lat = roundCoord(latitude)
    const lng = roundCoord(longitude)
    setCoordText(formatCoord(lat, lng))
    update((current) => ({ ...current, latitude: lat, longitude: lng }))
  }

  function setInstalled(value: number | null) {
    update((current) => {
      // New unit cards appear for added AC; extra cards stay until removed by hand.
      const missing = Math.max(0, (value ?? 0) - current.units.length)
      const added = Array.from({ length: missing }, (_, index) =>
        createUnitLike(current.units, current.units.length + index)
      )
      return {
        ...current,
        installedAcUnits: value,
        units: [...current.units, ...added],
      }
    })
  }

  function addUnit() {
    const unit = createUnitLike(data.units, data.units.length)
    update((current) => ({ ...current, units: [...current.units, unit] }))
    setActiveUnitId(unit.id)
  }

  function removeUnit(id: string) {
    const remaining = data.units.filter((unit) => unit.id !== id)
    update((current) => ({ ...current, units: remaining }))
    setActiveUnitId(remaining[0]?.id ?? null)
  }

  function calculateStandard() {
    if (
      data.salesAreaM2 === null ||
      data.latitude === null ||
      data.longitude === null
    )
      return
    const { salesAreaM2, latitude, longitude } = data
    startCalculating(async () => {
      const result = await calculateHvacAcStandard(
        form.context.sourceAuditId,
        salesAreaM2,
        latitude,
        longitude
      )
      if (!result.success) {
        toast.error(result.message)
        return
      }
      update((current) => ({ ...current, acStandard: result.standard }))
      toast.success(`Jumlah AC ideal: ${result.standard.units} unit AC.`)
    })
  }

  function goToStep(target: Step) {
    // First visit to the summary ticks the efficiency items the measurements point to.
    if (target === 4 && !ecoPrefilled.current && data.eco.length === 0) {
      ecoPrefilled.current = true
      if (suggestedEco.length > 0) {
        update((current) => ({ ...current, eco: suggestedEco }))
      }
    }
    setStep(target)
    window.scrollTo({ top: 0 })
  }

  function save(complete: boolean) {
    startSaving(async () => {
      const result = await saveHvacAudit(
        form.context.sourceAuditId,
        data,
        complete
      )
      setIssues(result.issues ?? [])
      if (!result.success) {
        toast.error(result.message)
        if (result.issues?.length) goToStep(4)
        return
      }
      toast.success(result.message)
      setIsDirty(false)
      clearBackup()
      if (complete) {
        router.push(basePath)
      } else {
        router.refresh()
      }
    })
  }

  const completionIssues = getHvacCompletionIssues(data)
  const visibleIssues = issues.length > 0 ? issues : completionIssues
  const recordedDiffers =
    form.recordedAcUnits > 0 &&
    data.installedAcUnits !== null &&
    data.installedAcUnits !== form.recordedAcUnits

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background px-4 pb-36 md:max-w-5xl md:px-6 lg:max-w-6xl lg:px-8">
      <Header
        variant="dashboard-back"
        title="Pemeriksaan Tata Udara & Ventilasi"
        subtitle={`${form.context.store.name} · ${form.context.store.code}`}
        backHref={basePath}
        backLabel="Kembali ke kategori pemeriksaan"
      />

      <main className="flex flex-col gap-5">
        <section className="flex flex-col gap-1.5">
          <AuditStepIndicator
            currentStep={step}
            totalSteps={4}
            label={stepLabels[step].label}
          />
          <p className="text-sm text-muted-foreground">
            {stepLabels[step].description}
          </p>
        </section>

        {backup && (
          <DraftRestoreAlert
            savedAt={backup.savedAt}
            onRestore={restoreBackup}
            onDiscard={clearBackup}
          />
        )}

        {isCompleted && (
          <Alert>
            <IconCircleCheck className="text-primary" />
            <AlertTitle>Pemeriksaan sudah selesai</AlertTitle>
            <AlertDescription>
              Diselesaikan
              {form.completedAt
                ? ` pada ${dateFormat.format(new Date(form.completedAt))}`
                : ""}
              {form.auditor ? ` oleh ${form.auditor}` : ""}. Perubahan masih
              bisa disimpan kalau ada koreksi.
            </AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
            <Card className="lg:col-span-7">
              <CardHeader>
                <CardTitle className="text-sm">
                  Lokasi dan jumlah AC ideal
                </CardTitle>
                <CardDescription>
                  Dihitung dengan kalkulator AC dari luas area sales dan suhu
                  terpanas di lokasi toko.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-5">
                  <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                    <div>
                      <dt className="text-xs text-muted-foreground">Toko</dt>
                      <dd className="font-semibold">
                        {form.context.store.name} · {form.context.store.code}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Tanggal pemeriksaan
                      </dt>
                      <dd className="font-semibold">
                        {dateFormat.format(new Date(form.auditDate))}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Pemeriksa
                      </dt>
                      <dd className="font-semibold">{currentAuditor}</dd>
                    </div>
                  </dl>

                  {!hasCoord && (
                    <Alert>
                      <IconMapPin />
                      <AlertTitle>Titik lokasi toko belum ada</AlertTitle>
                      <AlertDescription>
                        Ketuk lokasi toko di peta, pakai lokasi kamu sekarang,
                        atau ketik titik lokasinya. Jumlah AC ideal baru bisa
                        dihitung setelah itu.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Field>
                    <FieldLabel htmlFor="hvac-coord">
                      Titik lokasi toko (lintang, bujur)
                    </FieldLabel>
                    <Input
                      id="hvac-coord"
                      value={coordText}
                      onChange={(e) => {
                        setCoordText(e.target.value)
                        const parsed = parseCoord(e.target.value)
                        if (parsed) {
                          update((current) => ({
                            ...current,
                            latitude: parsed[0],
                            longitude: parsed[1],
                          }))
                        }
                      }}
                      placeholder="Contoh: -6.1702, 106.6403"
                      className="h-11"
                    />
                    <FieldDescription>
                      Tersimpan juga ke data toko.
                    </FieldDescription>
                  </Field>

                  <MapPicker
                    position={
                      hasCoord
                        ? [data.latitude as number, data.longitude as number]
                        : MAP_FALLBACK_CENTER
                    }
                    onChange={setPosition}
                  />

                  <NumberField
                    id="hvac-sales-area"
                    label="Luas area sales (m²)"
                    value={data.salesAreaM2}
                    onChange={(value) =>
                      update((current) => ({ ...current, salesAreaM2: value }))
                    }
                    description={`Dari kalkulasi: ${areaFormat.format(form.context.areas.sales)} m²`}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={calculateStandard}
                    disabled={
                      isCalculating ||
                      !hasCoord ||
                      !(data.salesAreaM2 && data.salesAreaM2 > 0)
                    }
                  >
                    <IconCalculator data-icon="inline-start" />
                    {isCalculating
                      ? "Mengambil suhu lokasi..."
                      : standard
                        ? "Hitung ulang jumlah AC ideal"
                        : "Hitung jumlah AC ideal"}
                  </Button>
                </FieldGroup>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Jumlah AC</CardTitle>
                  <CardDescription>
                    Hitung unit AC dalam ruangan di area sales.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1 rounded-xl bg-muted/50 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span>Jumlah AC ideal</span>
                      <span className="font-bold tabular-nums">
                        {standard ? `${standard.units} unit` : "-"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {standard
                        ? `${areaFormat.format(standard.salesAreaM2)} m² · suhu terpanas ${oneDecimal.format(standard.maxTemp)}°C · kebutuhan ${standard.clusterBtu} BTU/m² · rumus ${standard.version}`
                        : "Belum dihitung."}
                    </span>
                    {summary.standardStale && (
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        Titik lokasi atau luas berubah setelah dihitung. Hitung
                        ulang jumlah AC ideal.
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 p-3 text-sm">
                    <span>Tercatat di kalkulasi</span>
                    <span className="font-bold tabular-nums">
                      {form.recordedAcUnits} unit
                    </span>
                  </div>
                  <NumberField
                    id="hvac-installed"
                    label="AC terpasang di lapangan (unit)"
                    value={data.installedAcUnits}
                    integer
                    onChange={setInstalled}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <AcCountFlag
                      status={summary.acCount.status}
                      difference={summary.acCount.difference}
                    />
                  </div>
                  {recordedDiffers && (
                    <p className="rounded-xl bg-amber-100 p-3 text-xs text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
                      Kalkulasi mencatat {form.recordedAcUnits} unit, di
                      lapangan {data.installedAcUnits} unit. Estimasi kWh
                      kalkulasi masih memakai {form.recordedAcUnits} unit.
                    </p>
                  )}
                  {summary.hasNonStandardPk && (
                    <p className="text-xs text-muted-foreground">
                      Ada unit selain 2 PK. Jumlah AC ideal dihitung dengan
                      anggapan semua unit 2 PK (18.000 BTU/jam).
                    </p>
                  )}
                  <Field>
                    <FieldLabel htmlFor="hvac-count-note">
                      Catatan jumlah AC
                    </FieldLabel>
                    <Textarea
                      id="hvac-count-note"
                      value={data.acCountNote}
                      onChange={(e) =>
                        update((current) => ({
                          ...current,
                          acCountNote: e.target.value,
                        }))
                      }
                      placeholder="Contoh: 1 unit mati sejak bulan lalu"
                      rows={2}
                    />
                  </Field>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Alat ukur</CardTitle>
                  <CardDescription>{HVAC_STANDARD_NOTE}</CardDescription>
                </CardHeader>
                <CardContent>
                  <fieldset className="flex flex-col">
                    <legend className="sr-only">Alat ukur yang dipakai</legend>
                    {HVAC_MEASURING_TOOLS.map((tool) => {
                      const id = `hvac-tool-${tool}`
                      return (
                        <label
                          key={tool}
                          htmlFor={id}
                          className="flex min-h-11 items-center gap-3 text-sm"
                        >
                          <Checkbox
                            id={id}
                            checked={data.measuringTools.includes(tool)}
                            onCheckedChange={(checked) =>
                              update((current) => ({
                                ...current,
                                measuringTools:
                                  checked === true
                                    ? [...current.measuringTools, tool]
                                    : current.measuringTools.filter(
                                        (item) => item !== tool
                                      ),
                              }))
                            }
                          />
                          {tool}
                        </label>
                      )
                    })}
                  </fieldset>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            {/* The add button sits with the unit chips so a new unit never needs a scroll down. */}
            <div className="flex flex-wrap items-center gap-1">
              {summary.units.length > 0 && (
                <ToggleGroup
                  type="single"
                  variant="outline"
                  spacing={1}
                  value={activeUnit?.unit.id ?? ""}
                  onValueChange={(value) => {
                    if (value) setActiveUnitId(value)
                  }}
                  className="flex flex-wrap"
                  aria-label="Pilih unit AC"
                >
                  {summary.units.map((unit) => (
                    <ToggleGroupItem
                      key={unit.unit.id}
                      value={unit.unit.id}
                      className="h-11 rounded-full px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"
                    >
                      {unit.unit.label}
                      {unit.cop !== null && unit.unit.roomTemp !== null && (
                        <IconCircleCheck
                          aria-label="lengkap"
                          className="size-3.5"
                        />
                      )}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full px-3 text-xs"
                onClick={addUnit}
              >
                <IconPlus data-icon="inline-start" />
                Tambah unit
              </Button>
            </div>

            {activeUnit ? (
              <HvacAcUnitCard
                key={activeUnit.unit.id}
                summary={activeUnit}
                sourceAuditId={form.context.sourceAuditId}
                typeOptions={form.acOptions}
                onChange={(next) => updateUnit(activeUnit.unit.id, next)}
                onRemove={() => removeUnit(activeUnit.unit.id)}
              />
            ) : (
              <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                Belum ada unit AC. Isi jumlah AC terpasang di Step 1, atau tekan
                Tambah unit di atas.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={1}
              value={activeZone}
              onValueChange={(value) => {
                if (value) setActiveZone(value as ExhaustZoneKey)
              }}
              className="flex w-full flex-wrap"
              aria-label="Pilih ruangan"
            >
              {EXHAUST_ZONES.map((zone) => {
                const zoneSummary = summary.exhaust.find(
                  (item) => item.zone.key === zone.key
                )
                return (
                  <ToggleGroupItem
                    key={zone.key}
                    value={zone.key}
                    className="h-11 rounded-full px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"
                  >
                    {zone.label}
                    {(!zoneSummary ||
                      zoneSummary.status !== "BELUM_LENGKAP") && (
                      <IconCircleCheck
                        aria-label="lengkap"
                        className="size-3.5"
                      />
                    )}
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>

            <HvacExhaustZoneCard
              key={activeZone}
              zone={activeExhaust}
              sourceAuditId={form.context.sourceAuditId}
              onChange={(next) => updateZone(activeZone, next)}
            />
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <section
              aria-label="Ringkasan pemeriksaan"
              className="grid grid-cols-2 gap-3 lg:grid-cols-4"
            >
              <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
                <span className="text-xs text-muted-foreground">
                  Verifikasi jumlah AC
                </span>
                <AcCountFlag
                  status={summary.acCount.status}
                  difference={summary.acCount.difference}
                  className="w-fit whitespace-normal"
                />
                <span className="text-xs text-muted-foreground tabular-nums">
                  Terpasang {data.installedAcUnits ?? "-"} · ideal{" "}
                  {standard?.units ?? "-"}
                </span>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
                <span className="text-xs text-muted-foreground">
                  Efisiensi AC rata-rata (COP)
                </span>
                <span className="text-xl font-black tabular-nums">
                  {summary.averageCop === null
                    ? "-"
                    : twoDecimals.format(summary.averageCop)}
                </span>
                <Badge
                  variant="outline"
                  className={cn("w-fit", copTone[summary.averageCopStatus])}
                >
                  {COP_STATUS_LABEL[summary.averageCopStatus]}
                </Badge>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
                <span className="text-xs text-muted-foreground">
                  Total daya AC
                </span>
                <span className="text-xl font-black tabular-nums">
                  {twoDecimals.format(summary.totalPowerKw)} kW
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  Daya dingin {twoDecimals.format(summary.totalCapacityKw)} kW
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
                <span className="text-xs text-muted-foreground">
                  Ventilasi exhaust
                </span>
                <span className="text-xl font-black tabular-nums">
                  {summary.exhaust.length - summary.exhaustShortCount} dari{" "}
                  {summary.exhaust.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  ruangan memenuhi
                </span>
              </div>
            </section>

            {visibleIssues.length > 0 && (
              <Alert>
                <AlertTitle>Belum bisa diselesaikan</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    {visibleIssues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performa per unit AC</CardTitle>
                <CardDescription>
                  Klik ID unit untuk mengubah hasil ukurnya.
                </CardDescription>
                <CardAction>
                  {form.status && !isDirty ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-11"
                    >
                      <a href={`${basePath}/tata-udara/export`} download>
                        <IconDownload data-icon="inline-start" />
                        Unduh Excel
                      </a>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Simpan dulu untuk mengunduh Excel.
                    </span>
                  )}
                </CardAction>
              </CardHeader>
              <CardContent>
                {summary.units.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada unit AC di Step 2.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="py-2 pr-3 font-medium">Unit</th>
                          <th className="py-2 pr-3 text-right font-medium">
                            Daya
                          </th>
                          <th className="py-2 pr-3 text-right font-medium">
                            Suhu ruang
                          </th>
                          <th className="py-2 pr-3 text-right font-medium">
                            Selisih suhu
                          </th>
                          <th className="py-2 pr-3 text-right font-medium">
                            Daya dingin
                          </th>
                          <th className="py-2 pr-3 text-right font-medium">
                            Efisiensi (COP)
                          </th>
                          <th className="py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="tabular-nums">
                        {summary.units.map((unit) => (
                          <tr
                            key={unit.unit.id}
                            className="border-b last:border-0"
                          >
                            <td className="py-2.5 pr-3">
                              <button
                                type="button"
                                className="min-h-11 text-left font-medium underline-offset-4 hover:underline focus-visible:underline"
                                onClick={() => {
                                  setActiveUnitId(unit.unit.id)
                                  goToStep(2)
                                }}
                              >
                                {unit.unit.label}
                              </button>
                            </td>
                            <td className="py-2.5 pr-3 text-right">
                              {unit.powerKw === null
                                ? "-"
                                : `${twoDecimals.format(unit.powerKw)} kW`}
                            </td>
                            <td className="py-2.5 pr-3 text-right">
                              {unit.unit.roomTemp === null
                                ? "-"
                                : `${oneDecimal.format(unit.unit.roomTemp)}°C`}
                            </td>
                            <td className="py-2.5 pr-3 text-right">
                              {unit.deltaT === null
                                ? "-"
                                : `${oneDecimal.format(unit.deltaT)}°C`}
                            </td>
                            <td className="py-2.5 pr-3 text-right">
                              {unit.capacityBtu === null
                                ? "-"
                                : `${wholeNumber.format(unit.capacityBtu)} BTU/jam`}
                            </td>
                            <td className="py-2.5 pr-3 text-right">
                              {unit.cop === null
                                ? "-"
                                : twoDecimals.format(unit.cop)}
                            </td>
                            <td className="py-2.5">
                              <Badge
                                variant="outline"
                                className={copTone[unit.copStatus]}
                              >
                                {COP_STATUS_LABEL[unit.copStatus]}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="tabular-nums">
                        <tr className="border-t font-semibold">
                          <td className="py-2.5 pr-3">Total & rata-rata</td>
                          <td className="py-2.5 pr-3 text-right">
                            {twoDecimals.format(summary.totalPowerKw)} kW
                          </td>
                          <td className="py-2.5 pr-3 text-right">
                            {summary.averageRoomTemp === null
                              ? "-"
                              : `${oneDecimal.format(summary.averageRoomTemp)}°C`}
                          </td>
                          <td className="py-2.5 pr-3 text-right">
                            {summary.averageDeltaT === null
                              ? "-"
                              : `${oneDecimal.format(summary.averageDeltaT)}°C`}
                          </td>
                          <td className="py-2.5 pr-3 text-right">
                            {wholeNumber.format(summary.totalCapacityBtu)}{" "}
                            BTU/jam
                          </td>
                          <td className="py-2.5 pr-3 text-right">
                            {summary.averageCop === null
                              ? "-"
                              : twoDecimals.format(summary.averageCop)}
                          </td>
                          <td className="py-2.5">
                            <Badge
                              variant="outline"
                              className={copTone[summary.averageCopStatus]}
                            >
                              {COP_STATUS_LABEL[summary.averageCopStatus]}
                            </Badge>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Ventilasi exhaust per ruangan
                </CardTitle>
                <CardDescription>
                  Klik nama ruangan untuk mengubah datanya.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary.exhaust.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Semua ruangan ditandai tidak ada di toko ini.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="py-2 pr-3 font-medium">Ruangan</th>
                          <th className="py-2 pr-3 text-right font-medium">
                            Volume
                          </th>
                          <th className="py-2 pr-3 text-right font-medium">
                            Exhaust fan (terpasang / butuh)
                          </th>
                          <th className="py-2 pr-3 text-right font-medium">
                            Pergantian udara
                          </th>
                          <th className="py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="tabular-nums">
                        {summary.exhaust.map((zone) => (
                          <tr
                            key={zone.zone.key}
                            className="border-b last:border-0"
                          >
                            <td className="py-2.5 pr-3">
                              <button
                                type="button"
                                className="min-h-11 text-left font-medium underline-offset-4 hover:underline focus-visible:underline"
                                onClick={() => {
                                  setActiveZone(zone.zone.key)
                                  goToStep(3)
                                }}
                              >
                                {zone.zone.roomName}
                              </button>
                            </td>
                            <td className="py-2.5 pr-3 text-right">
                              {zone.volume === null
                                ? "-"
                                : `${oneDecimal.format(zone.volume)} m³`}
                            </td>
                            <td className="py-2.5 pr-3 text-right">
                              {zone.zone.fansInstalled ?? "-"} /{" "}
                              {zone.fanTheoretical === null
                                ? "-"
                                : oneDecimal.format(zone.fanTheoretical)}
                            </td>
                            <td className="py-2.5 pr-3 text-right">
                              {zone.actualAch === null
                                ? "-"
                                : `${oneDecimal.format(zone.actualAch)}× / ${zone.definition.targetAch}×`}
                            </td>
                            <td className="py-2.5">
                              <Badge
                                variant="outline"
                                className={ventilationTone[zone.status]}
                              >
                                {VENTILATION_STATUS_LABEL[zone.status]}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="tabular-nums">
                        <tr className="border-t font-semibold">
                          <td className="py-2.5 pr-3">Total</td>
                          <td className="py-2.5 pr-3 text-right">
                            {oneDecimal.format(summary.exhaustTotals.volume)} m³
                          </td>
                          <td className="py-2.5 pr-3 text-right">
                            {summary.exhaustTotals.fansInstalled} /{" "}
                            {oneDecimal.format(
                              summary.exhaustTotals.fanTheoretical
                            )}
                          </td>
                          <td className="py-2.5 pr-3 text-right">
                            {summary.exhaustTotals.actualAch === null
                              ? "-"
                              : `${oneDecimal.format(summary.exhaustTotals.actualAch)}×`}
                          </td>
                          <td className="py-2.5">
                            {Math.round(
                              ((summary.exhaust.length -
                                summary.exhaustShortCount) /
                                summary.exhaust.length) *
                                100
                            )}
                            % memenuhi
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Peluang efisiensi energi
                </CardTitle>
                <CardDescription>
                  Pilih yang berlaku untuk toko ini.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <fieldset className="flex flex-col">
                  <legend className="sr-only">Peluang efisiensi energi</legend>
                  {HVAC_ECO_SUGGESTIONS.map((suggestion) => {
                    const id = `hvac-eco-${suggestion}`
                    return (
                      <label
                        key={suggestion}
                        htmlFor={id}
                        className="flex min-h-11 items-center gap-3 text-sm"
                      >
                        <Checkbox
                          id={id}
                          checked={data.eco.includes(suggestion)}
                          onCheckedChange={(checked) =>
                            update((current) => ({
                              ...current,
                              eco:
                                checked === true
                                  ? [...current.eco, suggestion]
                                  : current.eco.filter(
                                      (item) => item !== suggestion
                                    ),
                            }))
                          }
                        />
                        <span>
                          {suggestion}
                          {suggestedEco.includes(suggestion) && (
                            <span className="block text-xs text-muted-foreground">
                              Sesuai hasil ukur
                            </span>
                          )}
                        </span>
                      </label>
                    )
                  })}
                </fieldset>
                <Textarea
                  value={data.ecoNote}
                  onChange={(e) =>
                    update((current) => ({
                      ...current,
                      ecoNote: e.target.value,
                    }))
                  }
                  placeholder="Saran lain untuk toko ini"
                  aria-label="Saran lain untuk toko ini"
                  rows={2}
                />
                <Field>
                  <FieldLabel htmlFor="hvac-notes">Catatan umum</FieldLabel>
                  <Textarea
                    id="hvac-notes"
                    value={data.notes}
                    onChange={(e) =>
                      update((current) => ({
                        ...current,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Kondisi umum tata udara toko saat pemeriksaan"
                    rows={3}
                  />
                </Field>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <StepActionBar>
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full"
            aria-label="Kembali ke langkah sebelumnya"
            onClick={() => goToStep((step - 1) as Step)}
          >
            <IconChevronLeft />
          </Button>
        ) : (
          <Button asChild variant="outline" className="h-11 rounded-full">
            <Link href={basePath} aria-label="Kembali ke kategori audit">
              <IconChevronLeft />
            </Link>
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className="h-11 flex-1 rounded-full"
          onClick={() => save(false)}
          disabled={isSaving}
        >
          <IconDeviceFloppy data-icon="inline-start" />
          {isSaving ? "Menyimpan..." : "Simpan Draf"}
        </Button>
        {step < 4 ? (
          <Button
            type="button"
            className="h-11 flex-1 rounded-full"
            onClick={() => goToStep((step + 1) as Step)}
          >
            Lanjut
            <IconArrowRight data-icon="inline-end" />
          </Button>
        ) : (
          <Button
            type="button"
            className="h-11 flex-1 rounded-full"
            onClick={() => save(true)}
            disabled={isSaving}
          >
            <IconCircleCheck data-icon="inline-start" />
            Selesaikan
          </Button>
        )}
      </StepActionBar>
    </div>
  )
}
