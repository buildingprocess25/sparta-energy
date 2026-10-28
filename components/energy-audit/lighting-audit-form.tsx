"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconArrowRight,
  IconChevronLeft,
  IconCircleCheck,
  IconDeviceFloppy,
  IconDownload,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { saveLightingAudit } from "@/app/actions/energy-audit"
import { StepActionBar } from "@/components/audit-validation/step-action-bar"
import { BrandCombobox } from "@/components/audit/brand-combobox"
import { LuxMeasurementTable } from "@/components/energy-audit/lux-measurement-table"
import { LuxSubZoneGuide } from "@/components/energy-audit/lux-sub-zone-guide"
import { AuditStepIndicator } from "@/components/audit/step-indicator"
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
import type { LightingAuditForm as LightingAuditFormData } from "@/lib/energy-audit-queries"
import {
  LIGHTING_STANDARD_NOTE,
  LPD_MAX,
  LPD_MIN,
  LPD_STATUS_LABEL,
  LUX_STATUS_LABEL,
  MEASURING_TOOLS,
  formatLuxStandard,
  getCompletionIssues,
  getZoneDefinition,
  summarizeLightingAudit,
  type LightingAuditData,
  type LightingZoneInput,
  type LightingZoneKey,
  type LpdStatus,
  type LuxStatus,
} from "@/lib/lighting-audit"
import { cn } from "@/lib/utils"

type Step = 1 | 2 | 3

type LightingAuditFormProps = {
  form: LightingAuditFormData
  currentAuditor: string
}

const stepLabels: Record<Step, { label: string; description: string }> = {
  1: {
    label: "Step 1: Info Pemeriksaan",
    description: "Lengkapi alamat toko dan alat ukur yang dipakai di lapangan.",
  },
  2: {
    label: "Step 2: Data per Zona",
    description: "Isi luas, daftar lampu, dan hasil ukur lux di setiap zona.",
  },
  3: {
    label: "Step 3: Ringkasan",
    description: "Cek hasil seluruh zona, lalu selesaikan pemeriksaan.",
  },
}

const numberFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 })
const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" })

const tone = {
  good: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  warn: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  bad: "border-transparent bg-[#c54b45] text-white",
  idle: "text-muted-foreground",
}

const lpdTone: Record<LpdStatus, string> = {
  SESUAI: tone.good,
  DI_ATAS: tone.bad,
  DI_BAWAH: tone.warn,
  BELUM_LENGKAP: tone.idle,
}

const luxTone: Record<LuxStatus, string> = {
  MEMENUHI: tone.good,
  KURANG: tone.warn,
  TERLALU_TERANG: tone.warn,
  BELUM_DIUKUR: tone.idle,
}

// Master equipment categories that belong to each lighting zone.
const zoneCategory: Record<LightingZoneKey, string> = {
  SALES: "SALES",
  PARKIRAN: "PARKIRAN",
  TERAS: "TERAS",
  GUDANG: "GUDANG",
  SELASAR: "GUDANG",
  TOILET: "GUDANG",
}

function StatusBadge({ label, className }: { label: string; className: string }) {
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}

function parseNumber(value: string) {
  if (value.trim() === "") return null
  const number = Number(value.replace(",", "."))
  return Number.isFinite(number) && number >= 0 ? number : null
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `lamp-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function LightingAuditForm({ form, currentAuditor }: LightingAuditFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [data, setData] = useState<LightingAuditData>(form.data)
  const [step, setStep] = useState<Step>(1)
  const [activeZone, setActiveZone] = useState<LightingZoneKey>("SALES")
  const [isDirty, setIsDirty] = useState(false)
  const [issues, setIssues] = useState<string[]>([])

  const summary = useMemo(() => summarizeLightingAudit(data), [data])
  const zoneSummary = summary.zones.find((zone) => zone.key === activeZone)!
  const zoneDefinition = getZoneDefinition(activeZone)
  const lampOptions = useMemo(() => {
    const category = zoneCategory[activeZone]
    return [...form.lampOptions].sort(
      (a, b) => Number(b.category === category) - Number(a.category === category)
    )
  }, [form.lampOptions, activeZone])
  const basePath = `/audit/kategori/${form.context.sourceAuditId}`
  const isCompleted = form.status === "COMPLETED"

  // Warn before closing the tab with unsaved field data.
  useEffect(() => {
    if (!isDirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  function update(next: (current: LightingAuditData) => LightingAuditData) {
    setData(next)
    setIsDirty(true)
  }

  function updateZone(
    key: LightingZoneKey,
    next: (zone: LightingZoneInput) => LightingZoneInput
  ) {
    update((current) => ({
      ...current,
      zones: current.zones.map((zone) => (zone.key === key ? next(zone) : zone)),
    }))
  }

  function goToStep(target: Step) {
    setStep(target)
    window.scrollTo({ top: 0 })
  }

  function save(complete: boolean) {
    startTransition(async () => {
      const result = await saveLightingAudit(form.context.sourceAuditId, data, complete)
      setIssues(result.issues ?? [])
      if (!result.success) {
        toast.error(result.message)
        if (result.issues?.length) goToStep(3)
        return
      }
      toast.success(result.message)
      setIsDirty(false)
      if (complete) {
        router.push(basePath)
      } else {
        router.refresh()
      }
    })
  }

  const completionIssues = getCompletionIssues(data)
  const visibleIssues = issues.length > 0 ? issues : completionIssues
  const { gudang, toilet, selasar } = form.context.areas
  const warehouseHint =
    (activeZone === "GUDANG" || activeZone === "SELASAR" || activeZone === "TOILET") &&
    gudang > 0 &&
    toilet === 0 &&
    selasar === 0
      ? `Data toko masih mencatat gudang, toilet & selasar sebagai satu luas: ${numberFormat.format(gudang)} m². Ukur luas zona ini terpisah.`
      : null

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md md:max-w-5xl lg:max-w-6xl flex-col bg-background px-4 md:px-6 lg:px-8 pb-36">
      <Header
        variant="dashboard-back"
        title="Pemeriksaan Tata Cahaya"
        subtitle={`${form.context.store.name} · ${form.context.store.code}`}
        backHref={basePath}
        backLabel="Kembali ke kategori pemeriksaan"
      />

      <main className="flex flex-col gap-5">
        <section className="flex flex-col gap-1.5">
          <AuditStepIndicator currentStep={step} label={stepLabels[step].label} />
          <p className="text-sm text-muted-foreground">{stepLabels[step].description}</p>
        </section>

        {isCompleted && (
          <Alert>
            <IconCircleCheck className="text-primary" />
            <AlertTitle>Pemeriksaan sudah selesai</AlertTitle>
            <AlertDescription>
              Diselesaikan
              {form.completedAt ? ` pada ${dateFormat.format(new Date(form.completedAt))}` : ""}
              {form.auditor ? ` oleh ${form.auditor}` : ""}. Perubahan masih bisa
              disimpan kalau ada koreksi.
            </AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Info Pemeriksaan</CardTitle>
              <CardDescription>{LIGHTING_STANDARD_NOTE}</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-5">
                <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Toko</dt>
                    <dd className="font-semibold">
                      {form.context.store.name} · {form.context.store.code}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Tanggal pemeriksaan</dt>
                    <dd className="font-semibold">{dateFormat.format(new Date(form.auditDate))}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Pemeriksa</dt>
                    <dd className="font-semibold">{currentAuditor}</dd>
                  </div>
                </dl>

                <Field>
                  <FieldLabel htmlFor="audit-address">Alamat toko</FieldLabel>
                  <Textarea
                    id="audit-address"
                    value={data.address}
                    onChange={(e) => update((current) => ({ ...current, address: e.target.value }))}
                    placeholder="Contoh: Jl. Sudirman No. 88, Pekanbaru"
                    rows={2}
                  />
                  <FieldDescription>Tersimpan juga ke data toko.</FieldDescription>
                </Field>

                <fieldset className="flex flex-col gap-3">
                  <legend className="mb-1 text-sm font-medium">Alat ukur yang dipakai</legend>
                  {MEASURING_TOOLS.map((tool) => {
                    const id = `tool-${tool}`
                    return (
                      <label key={tool} htmlFor={id} className="flex min-h-11 items-center gap-3 text-sm">
                        <Checkbox
                          id={id}
                          checked={data.measuringTools.includes(tool)}
                          onCheckedChange={(checked) =>
                            update((current) => ({
                              ...current,
                              measuringTools:
                                checked === true
                                  ? [...current.measuringTools, tool]
                                  : current.measuringTools.filter((item) => item !== tool),
                            }))
                          }
                        />
                        {tool}
                      </label>
                    )
                  })}
                </fieldset>

                <Field>
                  <FieldLabel htmlFor="audit-notes">Catatan umum</FieldLabel>
                  <Textarea
                    id="audit-notes"
                    value={data.notes}
                    onChange={(e) => update((current) => ({ ...current, notes: e.target.value }))}
                    placeholder="Kondisi umum pencahayaan toko saat pemeriksaan"
                    rows={3}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={1}
              value={activeZone}
              onValueChange={(value) => {
                if (value) setActiveZone(value as LightingZoneKey)
              }}
              className="flex w-full flex-wrap"
              aria-label="Pilih zona"
            >
              {summary.zones.map((zone) => (
                <ToggleGroupItem
                  key={zone.key}
                  value={zone.key}
                  className="h-11 rounded-full px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"
                >
                  {zone.definition.tabLabel}
                  {zone.lpdStatus !== "BELUM_LENGKAP" && zone.luxStatus !== "BELUM_DIUKUR" && (
                    <IconCircleCheck aria-label="lengkap" className="size-3.5" />
                  )}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
              <Card className="lg:col-span-7">
                <CardHeader>
                  <CardTitle className="text-sm">{zoneDefinition.label}</CardTitle>
                  <CardDescription>
                    Standar terang: {formatLuxStandard(zoneDefinition)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <Field>
                    <FieldLabel htmlFor="zone-area">Luas zona (m²)</FieldLabel>
                    <Input
                      id="zone-area"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={0.1}
                      value={zoneSummary.areaM2 ?? ""}
                      onChange={(e) =>
                        updateZone(activeZone, (zone) => ({
                          ...zone,
                          areaM2: parseNumber(e.target.value),
                        }))
                      }
                      className="h-11"
                    />
                    {warehouseHint && <FieldDescription>{warehouseHint}</FieldDescription>}
                  </Field>

                  <section className="flex flex-col gap-3" aria-labelledby="lamp-heading">
                    <h3 id="lamp-heading" className="text-sm font-semibold">
                      Daftar lampu
                    </h3>
                    {zoneSummary.lamps.length === 0 ? (
                      <p className="rounded-xl border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
                        Belum ada lampu di zona ini.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-3">
                        {zoneSummary.lamps.map((lamp, index) => (
                          <li
                            key={lamp.id}
                            className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3 sm:grid-cols-[1fr_6rem_7rem_auto] sm:items-end"
                          >
                            <Field className="col-span-2 sm:col-span-1">
                              <FieldLabel htmlFor={`lamp-type-${lamp.id}`} className="text-xs">
                                Tipe lampu
                              </FieldLabel>
                              <BrandCombobox
                                id={`lamp-type-${lamp.id}`}
                                brands={lampOptions}
                                value={lamp.type}
                                onChange={(value) => {
                                  const option = lampOptions.find(
                                    (item) => item.name.toLowerCase() === value.trim().toLowerCase()
                                  )
                                  updateZone(activeZone, (zone) => ({
                                    ...zone,
                                    lamps: zone.lamps.map((item) =>
                                      item.id === lamp.id
                                        ? {
                                            ...item,
                                            type: value,
                                            watt: option
                                              ? Math.round(option.baseKw * 1000 * 100) / 100
                                              : item.watt,
                                          }
                                        : item
                                    ),
                                  }))
                                }}
                                placeholder="Pilih atau ketik tipe lampu"
                                searchPlaceholder="Cari tipe lampu atau ketik baru"
                                className="h-11 text-sm"
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor={`lamp-qty-${lamp.id}`} className="text-xs">
                                Jumlah
                              </FieldLabel>
                              <Input
                                id={`lamp-qty-${lamp.id}`}
                                type="number"
                                inputMode="numeric"
                                min={0}
                                step={1}
                                value={lamp.qty}
                                onChange={(e) =>
                                  updateZone(activeZone, (zone) => ({
                                    ...zone,
                                    lamps: zone.lamps.map((item) =>
                                      item.id === lamp.id
                                        ? { ...item, qty: Math.round(parseNumber(e.target.value) ?? 0) }
                                        : item
                                    ),
                                  }))
                                }
                                className="h-11"
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor={`lamp-watt-${lamp.id}`} className="text-xs">
                                Watt per lampu
                              </FieldLabel>
                              <Input
                                id={`lamp-watt-${lamp.id}`}
                                type="number"
                                inputMode="decimal"
                                min={0}
                                step={0.1}
                                value={lamp.watt}
                                onChange={(e) =>
                                  updateZone(activeZone, (zone) => ({
                                    ...zone,
                                    lamps: zone.lamps.map((item) =>
                                      item.id === lamp.id
                                        ? { ...item, watt: parseNumber(e.target.value) ?? 0 }
                                        : item
                                    ),
                                  }))
                                }
                                className="h-11"
                              />
                            </Field>
                            <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1">
                              <span className="text-xs text-muted-foreground tabular-nums sm:hidden">
                                {numberFormat.format(lamp.qty * lamp.watt)} W
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-11 text-destructive hover:text-destructive"
                                aria-label={`Hapus lampu ${index + 1}`}
                                onClick={() =>
                                  updateZone(activeZone, (zone) => ({
                                    ...zone,
                                    lamps: zone.lamps.filter((item) => item.id !== lamp.id),
                                  }))
                                }
                              >
                                <IconTrash />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11"
                      onClick={() =>
                        updateZone(activeZone, (zone) => ({
                          ...zone,
                          lamps: [...zone.lamps, { id: newId(), type: "", qty: 1, watt: 0 }],
                        }))
                      }
                    >
                      <IconPlus data-icon="inline-start" />
                      Tambah Lampu
                    </Button>
                  </section>

                  <section className="flex flex-col gap-3" aria-labelledby="lux-heading">
                    <h3 id="lux-heading" className="text-sm font-semibold">
                      Titik ukur lux
                    </h3>
                    <LuxMeasurementTable
                      zoneLabel={zoneDefinition.label}
                      rows={zoneSummary.luxRows}
                      subZones={zoneDefinition.subZones}
                      noteNeededAreas={zoneSummary.lux.areasMissingNote.map((area) => area.key)}
                      photoContext={{
                        sourceAuditId: form.context.sourceAuditId,
                        zone: activeZone,
                      }}
                      onChange={(luxRows) =>
                        updateZone(activeZone, (zone) => ({ ...zone, luxRows }))
                      }
                      createId={newId}
                    />
                  </section>

                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 text-sm font-semibold">Peluang efisiensi</legend>
                    {zoneDefinition.ecoSuggestions.map((suggestion) => {
                      const id = `eco-${activeZone}-${suggestion}`
                      return (
                        <label key={suggestion} htmlFor={id} className="flex min-h-11 items-center gap-3 text-sm">
                          <Checkbox
                            id={id}
                            checked={zoneSummary.eco.includes(suggestion)}
                            onCheckedChange={(checked) =>
                              updateZone(activeZone, (zone) => ({
                                ...zone,
                                eco:
                                  checked === true
                                    ? [...zone.eco, suggestion]
                                    : zone.eco.filter((item) => item !== suggestion),
                              }))
                            }
                          />
                          {suggestion}
                        </label>
                      )
                    })}
                    <Textarea
                      value={zoneSummary.ecoNote}
                      onChange={(e) =>
                        updateZone(activeZone, (zone) => ({ ...zone, ecoNote: e.target.value }))
                      }
                      placeholder="Saran lain untuk zona ini"
                      aria-label="Saran lain untuk zona ini"
                      rows={2}
                    />
                  </fieldset>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Hasil zona ini</CardTitle>
                  <CardDescription>Dihitung otomatis saat angka diisi.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 tabular-nums">
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 text-sm">
                    <span>Jumlah lampu</span>
                    <span className="font-bold">{numberFormat.format(zoneSummary.lampCount)} unit</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 text-sm">
                    <span>Total daya lampu</span>
                    <span className="font-bold">{numberFormat.format(zoneSummary.totalWatt)} W</span>
                  </div>
                  <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Kepadatan daya lampu (LPD)</span>
                      <span className="font-bold">
                        {zoneSummary.lpd === null ? "-" : `${numberFormat.format(zoneSummary.lpd)} W/m²`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Standar {LPD_MIN} sampai {LPD_MAX} W/m²
                      </span>
                      <StatusBadge
                        label={LPD_STATUS_LABEL[zoneSummary.lpdStatus]}
                        className={lpdTone[zoneSummary.lpdStatus]}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Rata-rata lux</span>
                      <span className="font-bold">
                        {zoneSummary.avgLux === null ? "-" : `${numberFormat.format(zoneSummary.avgLux)} lux`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatLuxStandard(zoneDefinition)}
                      </span>
                      <StatusBadge
                        label={LUX_STATUS_LABEL[zoneSummary.luxStatus]}
                        className={luxTone[zoneSummary.luxStatus]}
                      />
                    </div>
                    {zoneDefinition.subZones && (
                      <ul className="flex flex-col gap-1.5 border-t pt-2">
                        {zoneSummary.lux.areas.map((area) => (
                          <li key={area.key} className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-muted-foreground">
                              {area.key} · {area.label}
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="font-semibold">
                                {area.avgLux === null ? "-" : `${numberFormat.format(Math.round(area.avgLux))} lux`}
                              </span>
                              <StatusBadge
                                label={LUX_STATUS_LABEL[area.luxStatus]}
                                className={luxTone[area.luxStatus]}
                              />
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {zoneSummary.lux.unevenAreas.map((area) => (
                    <p
                      key={area.key}
                      className="rounded-xl bg-amber-100 p-3 text-xs text-amber-900 dark:bg-amber-500/15 dark:text-amber-200"
                    >
                      Area {area.label} {LUX_STATUS_LABEL[area.luxStatus].toLowerCase()} (
                      {numberFormat.format(Math.round(area.avgLux ?? 0))} lux), sedangkan rata-rata zona{" "}
                      {LUX_STATUS_LABEL[zoneSummary.luxStatus].toLowerCase()}. Isi catatan alasannya di
                      baris area ini.
                    </p>
                  ))}
                </CardContent>
              </Card>
              {zoneDefinition.subZones && (
                <LuxSubZoneGuide rows={zoneSummary.luxRows} definition={zoneDefinition} />
              )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <section aria-label="Ringkasan gedung" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Total luas area", value: `${numberFormat.format(summary.totalArea)} m²` },
                { label: "Total daya lampu", value: `${numberFormat.format(summary.totalWatt / 1000)} kW` },
                {
                  label: "LPD rata-rata gedung",
                  value: summary.buildingLpd === null ? "-" : `${numberFormat.format(summary.buildingLpd)} W/m²`,
                },
              ].map((metric) => (
                <div key={metric.label} className="flex flex-col gap-1 rounded-xl border bg-card p-4">
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                  <span className="text-xl font-black tabular-nums">{metric.value}</span>
                </div>
              ))}
              <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
                <span className="text-xs text-muted-foreground">Status kepatuhan LPD</span>
                <StatusBadge
                  label={LPD_STATUS_LABEL[summary.buildingStatus]}
                  className={cn("w-fit whitespace-normal", lpdTone[summary.buildingStatus])}
                />
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
                <CardTitle className="text-sm">Rekapitulasi per zona</CardTitle>
                <CardAction>
                  {form.status && !isDirty ? (
                    <Button asChild variant="outline" size="sm" className="h-11">
                      <a href={`${basePath}/tata-cahaya/export`} download>
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
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="py-2 pr-3 font-medium">Zona</th>
                        <th className="py-2 pr-3 text-right font-medium">Luas</th>
                        <th className="py-2 pr-3 text-right font-medium">Lampu</th>
                        <th className="py-2 pr-3 text-right font-medium">Daya</th>
                        <th className="py-2 pr-3 text-right font-medium">LPD</th>
                        <th className="py-2 pr-3 font-medium">Status LPD</th>
                        <th className="py-2 pr-3 text-right font-medium">Lux</th>
                        <th className="py-2 font-medium">Status lux</th>
                      </tr>
                    </thead>
                    <tbody className="tabular-nums">
                      {summary.zones.map((zone) => (
                        <tr key={zone.key} className="border-b last:border-0">
                          <td className="py-2.5 pr-3">
                            <button
                              type="button"
                              className="text-left font-medium underline-offset-4 hover:underline focus-visible:underline"
                              onClick={() => {
                                setActiveZone(zone.key)
                                goToStep(2)
                              }}
                            >
                              {zone.definition.label}
                            </button>
                          </td>
                          <td className="py-2.5 pr-3 text-right">
                            {zone.areaM2 === null ? "-" : `${numberFormat.format(zone.areaM2)} m²`}
                          </td>
                          <td className="py-2.5 pr-3 text-right">{numberFormat.format(zone.lampCount)}</td>
                          <td className="py-2.5 pr-3 text-right">{numberFormat.format(zone.totalWatt)} W</td>
                          <td className="py-2.5 pr-3 text-right">
                            {zone.lpd === null ? "-" : numberFormat.format(zone.lpd)}
                          </td>
                          <td className="py-2.5 pr-3">
                            <StatusBadge
                              label={LPD_STATUS_LABEL[zone.lpdStatus]}
                              className={lpdTone[zone.lpdStatus]}
                            />
                          </td>
                          <td className="py-2.5 pr-3 text-right">
                            {zone.avgLux === null ? "-" : numberFormat.format(zone.avgLux)}
                          </td>
                          <td className="py-2.5">
                            <StatusBadge
                              label={LUX_STATUS_LABEL[zone.luxStatus]}
                              className={luxTone[zone.luxStatus]}
                            />
                            {zone.lux.unevenAreas.length > 0 && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Tidak merata:{" "}
                                {zone.lux.unevenAreas
                                  .map((area) => `${area.label} ${LUX_STATUS_LABEL[area.luxStatus].toLowerCase()}`)
                                  .join(", ")}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Peluang efisiensi energi</CardTitle>
                <CardDescription>
                  Diisi pemeriksa di Step 2 untuk setiap zona. Klik nama zona untuk
                  menambah atau mengubah saran.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-3 text-sm">
                  {summary.zones.map((zone) => {
                    const items = [...zone.eco, ...(zone.ecoNote ? [zone.ecoNote] : [])]
                    return (
                      <li key={zone.key}>
                        <button
                          type="button"
                          className="min-h-11 text-left font-medium underline-offset-4 hover:underline focus-visible:underline"
                          onClick={() => {
                            setActiveZone(zone.key)
                            goToStep(2)
                          }}
                        >
                          {zone.definition.label}
                        </button>
                        <p className="text-muted-foreground">
                          {items.length > 0
                            ? items.join(" · ")
                            : "Belum dipilih. Pilih saran di bagian Peluang efisiensi zona ini."}
                        </p>
                      </li>
                    )
                  })}
                </ul>
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
          disabled={isPending}
        >
          <IconDeviceFloppy data-icon="inline-start" />
          {isPending ? "Menyimpan..." : "Simpan Draf"}
        </Button>
        {step < 3 ? (
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
            disabled={isPending}
          >
            <IconCircleCheck data-icon="inline-start" />
            Selesaikan
          </Button>
        )}
      </StepActionBar>
    </div>
  )
}
