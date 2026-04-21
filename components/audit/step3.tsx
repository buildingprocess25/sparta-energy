"use client"

import * as React from "react"
import { IconBolt, IconArrowRight, IconInfoCircle } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useAuditStore, type PlnRowState } from "@/store/use-audit-store"
import { submitAudit } from "@/app/actions/submit-audit"

import { Header } from "@/components/header"
import { AuditStepIndicator } from "@/components/audit/step-indicator"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// 6 blank month rows — user fills these in from their PLN bill
const blankMonthRows = [
  { month: "Bulan 1", kwh: "0", std: "0" },
  { month: "Bulan 2", kwh: "0", std: "0" },
  { month: "Bulan 3", kwh: "0", std: "0" },
  { month: "Bulan 4", kwh: "0", std: "0" },
  { month: "Bulan 5", kwh: "0", std: "0" },
  { month: "Bulan 6", kwh: "0", std: "0" },
]

const monthColumnWidthClass = "w-32"
const valueColumnWidthClass = "w-24"
const stdColumnWidthClass = "w-24"

export function AuditStep3() {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const zustandPln = useAuditStore((state) => state.plnHistory)
  const setPlnHistory = useAuditStore((state) => state.setPlnHistory)

  const [rows, setRows] = React.useState<PlnRowState[]>(() => {
    if (zustandPln.length > 0) return zustandPln
    return blankMonthRows.map((r) => ({
      month: r.month,
      kwh: Number(r.kwh) || 0,
      std: Number(r.std) || 0,
    }))
  })

  function updateRow(idx: number, field: "kwh" | "std", val: string) {
    setRows((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: Number(val) || 0 }
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
    const result = await submitAudit({
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

    // Clear session storage so next session starts fresh
    useAuditStore.setState({ storeCode: "", equipments: [], plnHistory: [], savedAreas: [] })
    router.push(`/audit/${result.auditId}`)
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-36">
      <Header
        variant="dashboard-back"
        title="Kembali"
        backHref="/audit/start?step=2"
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
                Masukkan riwayat konsumsi listrik dan nilai rata-rata jumlah
                transaksi harian (STD) 6 bulan berturut-turut.
              </p>

              <Alert className="border-blue-600/50 bg-blue-50 dark:border-blue-400/70 dark:bg-blue-950/40">
                <IconInfoCircle />
                <AlertDescription>
                  Data kWh dan STD dapat dilihat di laporan bulanan/buku kas
                  toko. Pastikan diisi guna menentukan deviasi tagihan aktual.
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
                        Bulan
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
                          "text-center text-[7px] font-bold tracking-wider whitespace-normal text-muted-foreground uppercase",
                          stdColumnWidthClass
                        )}
                      >
                        Sales Transaction per Day
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow key={row.month}>
                        <TableCell className="truncate text-xs font-medium text-foreground">
                          {row.month}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0"
                            value={row.kwh || ""}
                            onChange={(e) =>
                              updateRow(idx, "kwh", e.target.value)
                            }
                            className="h-8 w-full rounded-none border-0 border-b bg-transparent px-0 text-center text-xs ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0"
                            value={row.std || ""}
                            onChange={(e) =>
                              updateRow(idx, "std", e.target.value)
                            }
                            className="h-8 w-full rounded-none border-0 border-b bg-transparent px-0 text-center text-xs ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
            disabled={isPending}
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
