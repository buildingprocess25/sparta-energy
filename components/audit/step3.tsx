"use client"

import * as React from "react"
import { IconBolt, IconArrowRight, IconInfoCircle } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import {
  useAuditStore,
  type DemoAuditResult,
  type PlnRowState,
} from "@/store/use-audit-store"
import { submitAudit } from "@/app/actions/submit-audit"
import { calculateAudit, getHoursBetween } from "@/lib/audit-kalkulator"
import { getDemoAiRecommendation } from "@/app/actions/get-demo-ai-recommendation"

import { Header } from "@/components/header"
import { AuditStepIndicator } from "@/components/audit/step-indicator"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

const SHORT_MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Ags",
  "Sep",
  "Okt",
  "Nov",
  "Des",
]

const currentYear = new Date().getFullYear()

type AuditStep3Props = {
  basePath?: string
  mode?: "live" | "demo"
}

type AreaTarget = "SALES" | "PARKING" | "TERRACE" | "WAREHOUSE"
type RecommendationType = "TRAINING" | "REPAIR" | "MAINTENANCE"

const RECOMMENDATION_COPY: Record<
  RecommendationType,
  { title: string; description: string }
> = {
  TRAINING: {
    title: "Pelatihan SOP Operasional",
    description:
      "Ditemukan indikasi alat beroperasi melebihi jam buka toko. Rekomendasi: lakukan training SOP kepada karyawan untuk memastikan alat dimatikan sesuai jadwal toko.",
  },
  REPAIR: {
    title: "Perbaikan & Pengecekan Peralatan",
    description:
      "Konsumsi listrik aktual melebihi estimasi peralatan meskipun jam operasional wajar. Rekomendasi: lakukan pengecekan fisik peralatan (kompresor, kabel) untuk indikasi bocor arus.",
  },
  MAINTENANCE: {
    title: "Pertahankan Efisiensi",
    description:
      "Konsumsi listrik toko berada dalam ambang batas normal. Lanjutkan kebiasaan operasional yang baik dan lakukan pengecekan rutin.",
  },
}

function toAreaTarget(areaName: string): AreaTarget {
  const name = areaName.toLowerCase()
  if (name.includes("parkir")) return "PARKING"
  if (name.includes("teras")) return "TERRACE"
  if (name.includes("sales")) return "SALES"
  return "WAREHOUSE"
}

function buildDemoAuditResult(
  auditState: ReturnType<typeof useAuditStore.getState>,
  rows: PlnRowState[]
): DemoAuditResult {
  const calc = calculateAudit(auditState.equipments, rows, {
    is24Hours: auditState.is24Hours,
    openTime: auditState.openTime,
    closeTime: auditState.closeTime,
    areas: {
      sales: auditState.areas.sales,
      parkir: auditState.areas.parkir,
      teras: auditState.areas.teras,
      gudang: auditState.areas.gudang,
    },
    plnPowerVa: auditState.plnPowerVa,
  })

  const items = auditState.equipments
    .filter((eq) => eq.selected)
    .flatMap((eq) => {
      const isAC =
        eq.name.toLowerCase().includes("ac") ||
        eq.name.toLowerCase().includes("air conditioner")

      if (isAC && eq.quantity > 1) {
        return Array.from({ length: eq.quantity }, (_, i) => {
          const start = eq.startTimes[i] || "08:00"
          const end = eq.endTimes[i] || "22:00"
          const hours = getHoursBetween(start, end)
          return {
            areaTarget: toAreaTarget(eq.areaName),
            customName: eq.name,
            qty: 1,
            operationalHours: hours,
            baseKw: eq.kw,
            estimatedDailyKwh: eq.kw * hours,
          }
        })
      }

      const start = eq.startTimes[0] || "08:00"
      const end = eq.endTimes[0] || "22:00"
      const hours = getHoursBetween(start, end)
      return [
        {
          areaTarget: toAreaTarget(eq.areaName),
          customName: eq.name,
          qty: eq.quantity,
          operationalHours: hours,
          baseKw: eq.kw,
          estimatedDailyKwh: eq.kw * eq.quantity * hours,
        },
      ]
    })

  const recommendationType = calc.recommendationType as RecommendationType
  // We remove the default RECOMMENDATION_COPY lookup from here because we will pass the ai recommendation directly.

  return {
    id: "demo",
    isBoros: calc.isBoros,
    totalEstimatedKwhPerMonth: calc.equipmentEstimateKwhPerMonth,
    avgActualPlnKwhPerMonth: calc.avgActualPlnKwhPerMonth,
    auditDate: new Date().toISOString(),
    store: {
      code: auditState.storeCode || "DEMO-STORE",
      name: auditState.storeName || auditState.storeCode || "Toko Demo",
      salesAreaM2: auditState.areas.sales,
      parkingAreaM2: auditState.areas.parkir,
      terraceAreaM2: auditState.areas.teras,
      warehouseAreaM2: auditState.areas.gudang,
    },
    items,
    plnHistory: rows.map((row, idx) => ({
      monthIdx: idx + 1,
      billingMonth: row.month,
      plnUsageKwh: row.kwh,
      salesTransactionPerDay: row.std,
    })),
    recommendations: [], // We'll set this outside
  }
}

// column widths — total must fit ≤ 352px (max-w-sm minus px-4 padding)
const monthColumnWidthClass = "w-[168px]" // month select ~112 + year ~56
const valueColumnWidthClass = "w-[88px]"
const stdColumnWidthClass = "w-[88px]"

function makeBlankRows(): PlnRowState[] {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 6 + i, 1)
    return {
      month: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      kwh: 0,
      std: 0,
    }
  })
}

// Parse "Januari 2025" → { monthIdx: 0, year: 2025 }
function parseMonthLabel(label: string): { monthIdx: number; year: number } {
  const parts = label.split(" ")
  const monthIdx = MONTH_NAMES.indexOf(parts[0] ?? "")
  const year = parseInt(parts[1] ?? String(currentYear), 10)
  return {
    monthIdx: monthIdx >= 0 ? monthIdx : 0,
    year: isNaN(year) ? currentYear : year,
  }
}

// ─── MonthYearCell ─────────────────────────────────────────────────────────────

function MonthYearCell({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const { monthIdx, year } = parseMonthLabel(value)

  function handleMonthChange(val: string) {
    onChange(`${MONTH_NAMES[Number(val)]} ${year}`)
  }

  function handleYearChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    // Allow typing — only commit if it's a valid 4-digit year
    const y = parseInt(raw, 10)
    if (raw.length === 4 && !isNaN(y) && y > 1900 && y < 2100) {
      onChange(`${MONTH_NAMES[monthIdx]} ${y}`)
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      <Select value={String(monthIdx)} onValueChange={handleMonthChange}>
        <SelectTrigger className="h-7 min-w-0 flex-1 rounded-none border-0 border-b px-1 text-[11px] shadow-none focus:ring-0">
          {/* Show short name in trigger to save space */}
          <span className="truncate">{SHORT_MONTH[monthIdx]}</span>
        </SelectTrigger>
        <SelectContent>
          {MONTH_NAMES.map((name, idx) => (
            <SelectItem key={name} value={String(idx)} className="text-xs">
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        defaultValue={year}
        key={value}
        onChange={handleYearChange}
        min={2000}
        max={2099}
        maxLength={4}
        className="h-7 w-14 [appearance:textfield] rounded-none border-0 border-b px-0 text-center text-[11px] shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  )
}

// ─── AuditStep3 ───────────────────────────────────────────────────────────────

export function AuditStep3({
  basePath = "/audit/start",
  mode = "live",
}: AuditStep3Props) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const zustandPln = useAuditStore((state) => state.plnHistory)
  const setPlnHistory = useAuditStore((state) => state.setPlnHistory)

  const [rows, setRows] = React.useState<PlnRowState[]>(() => {
    if (zustandPln.length > 0) return zustandPln
    return makeBlankRows()
  })

  function updateRow(
    idx: number,
    field: "kwh" | "std" | "month",
    val: string | number
  ) {
    setRows((prev) => {
      const next = [...prev]
      if (field === "month") {
        next[idx] = { ...next[idx], month: val as string }
      } else {
        next[idx] = { ...next[idx], [field]: Number(val) || 0 }
      }
      return next
    })
  }

  React.useEffect(() => {
    setPlnHistory(rows)
  }, [rows, setPlnHistory])

  const auditState = useAuditStore()

  async function handleSubmit() {
    setSubmitError(null)
    setIsPending(true)

    if (mode === "demo") {
      const calc = calculateAudit(auditState.equipments, rows, {
        is24Hours: auditState.is24Hours,
        openTime: auditState.openTime,
        closeTime: auditState.closeTime,
        areas: {
          sales: auditState.areas.sales,
          parkir: auditState.areas.parkir,
          teras: auditState.areas.teras,
          gudang: auditState.areas.gudang,
        },
        plnPowerVa: auditState.plnPowerVa,
      })

      const auditSummary = `
Toko: ${auditState.storeName || auditState.storeCode || "Toko Demo"}
Jam Buka: ${auditState.openTime} - ${auditState.closeTime} (${auditState.is24Hours ? "24 Jam" : "Non-24 Jam"})
Daya PLN: ${auditState.plnPowerVa} VA
Status Efisiensi: ${calc.isBoros ? "BOROS (Pemakaian aktual > estimasi wajar)" : "HEMAT (Pemakaian wajar)"}
Estimasi Kebutuhan Alat: ${calc.equipmentEstimateKwhPerMonth.toFixed(0)} kWh/bulan
Aktual Rata-rata PLN: ${calc.avgActualPlnKwhPerMonth.toFixed(0)} kWh/bulan
Tipe Rekomendasi (Hard-coded fallback calc): ${calc.recommendationType}
Daftar Peralatan (Format: Qty x Nama = Est Kwh/hari):
${auditState.equipments.map((eq) => `- ${eq.quantity}x ${eq.name} = ${(eq.kw * eq.quantity * getHoursBetween(eq.startTimes[0] || "08:00", eq.endTimes[0] || "22:00")).toFixed(1)} kWh/hari`).join("\n")}
`
      const aiResult = await getDemoAiRecommendation(
        auditSummary,
        calc.recommendationType as RecommendationType
      )

      const demoAuditResult = buildDemoAuditResult(auditState, rows)
      if (aiResult.data) {
        demoAuditResult.recommendations = [aiResult.data]
      }

      useAuditStore.setState({ demoAuditResult })
      setIsPending(false)
      router.push("/demo/result")
      return
    }

    const result = await submitAudit({
      storeCode: auditState.storeCode,
      storeType: auditState.storeType,
      is24Hours: auditState.is24Hours,
      openTime: auditState.openTime,
      closeTime: auditState.closeTime,
      plnPowerVa: auditState.plnPowerVa,
      areas: auditState.areas,
      equipments: auditState.equipments,
      plnHistory: rows,
    })
    setIsPending(false)
    if ("error" in result) {
      setSubmitError(result.error ?? "Terjadi kesalahan.")
      return
    }

    // Demo user via normal login: server returns demoAuditResult instead of auditId
    if ("demoAuditResult" in result && result.demoAuditResult) {
      useAuditStore.setState({ demoAuditResult: result.demoAuditResult })
      router.push("/demo/result")
      return
    }

    // Clear session storage so next session starts fresh
    useAuditStore.setState({
      storeCode: "",
      storeName: "",
      equipments: [],
      plnHistory: [],
      savedAreas: [],
      demoAuditResult: null,
    })
    router.push(`/audit/${result.auditId}`)
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-36">
      <Header
        variant="dashboard-back"
        title="Kembali"
        backHref={`${basePath}?step=2`}
        className="px-0"
      />

      <main className="flex flex-col">
        <section className="mb-6">
          <AuditStepIndicator
            currentStep={3}
            label="Step 3: Data Operasional"
          />
        </section>

        <div>
          <div className="overflow-hidden">
            <div className="flex flex-col gap-6 pb-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Masukkan riwayat konsumsi listrik 6 bulan berturut-turut.
              </p>

              <Alert className="border-blue-600/50 bg-blue-50 dark:border-blue-400/70 dark:bg-blue-950/40">
                <IconInfoCircle />
                <AlertDescription>
                  Data kWh Pascabayar tersedia di aplikasi PLN Mobile, sedangkan
                  data Prabayar dapat dilihat pada rekapitulasi toko atau
                  pembayaran bulanan.
                </AlertDescription>
              </Alert>

              <section className="rounded-lg border bg-card">
                <Table className="min-w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className={cn(
                          "text-[10px] font-bold tracking-wider text-muted-foreground uppercase",
                          monthColumnWidthClass
                        )}
                      >
                        Bulan &amp; Tahun
                      </TableHead>
                      <TableHead
                        className={cn(
                          "text-center text-[10px] font-bold tracking-wider whitespace-normal text-muted-foreground uppercase",
                          valueColumnWidthClass
                        )}
                      >
                        Konsumsi (kWh)
                      </TableHead>
                      <TableHead
                        className={cn(
                          "text-center text-[10px] font-bold tracking-wider whitespace-normal text-muted-foreground uppercase",
                          stdColumnWidthClass
                        )}
                      >
                        Trans/Hari (STD)
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="px-1 py-0.5">
                          <MonthYearCell
                            value={row.month}
                            onChange={(val) => updateRow(idx, "month", val)}
                          />
                        </TableCell>
                        <TableCell className="px-1 py-0.5">
                          <Input
                            type="number"
                            placeholder="0"
                            value={row.kwh || ""}
                            onChange={(e) =>
                              updateRow(idx, "kwh", e.target.value)
                            }
                            className="h-7 w-full rounded-none border-0 border-b bg-transparent px-0 text-center text-[11px] ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </TableCell>
                        <TableCell className="px-1 py-0.5">
                          <Input
                            type="number"
                            placeholder="0"
                            value={row.std || ""}
                            onChange={(e) =>
                              updateRow(idx, "std", e.target.value)
                            }
                            className="h-7 w-full rounded-none border-0 border-b bg-transparent px-0 text-center text-[11px] ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 backdrop-blur">
        <div className="w-full max-w-sm space-y-2">
          {submitError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {submitError}
            </p>
          )}
          <Button
            className="h-11 w-full rounded-full"
            onClick={handleSubmit}
            disabled={isPending || rows.some((r) => !r.kwh || r.kwh <= 0)}
          >
            <IconBolt className="size-4" />
            {isPending ? "Menghitung..." : "Kalkulasi Sekarang"}
            {!isPending && <IconArrowRight data-icon="inline-end" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
