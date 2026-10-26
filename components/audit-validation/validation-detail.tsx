"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconCircleCheck, IconDeviceFloppy } from "@tabler/icons-react"
import { toast } from "sonner"

import {
  saveValidationDraft,
  validateAudit,
  type ValidationDraftInput,
} from "@/app/actions/audit-validation"
import { CorrectionHistory } from "@/components/audit-validation/correction-history"
import { EquipmentList } from "@/components/audit-validation/equipment-list"
import { toNumberOrZero } from "@/components/audit-validation/pln-history-editor"
import { StepActionBar } from "@/components/audit-validation/step-action-bar"
import {
  TechnicalForm,
  type TechnicalDraft,
} from "@/components/audit-validation/technical-form"
import { ValidationSummary } from "@/components/audit-validation/validation-summary"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getHoursBetween } from "@/lib/audit-kalkulator"
import {
  averagePlnKwh,
  calculateGapPercent,
  isBorosFor,
} from "@/lib/audit-recalculate"
import type { ValidationAudit } from "@/lib/audit-validation-queries"
import type { EquipmentMasterItem } from "@/lib/get-equipment-for-area"

type ValidationDetailProps = {
  audit: ValidationAudit
  equipmentMaster: EquipmentMasterItem[]
}

function toInput(value: number | null | undefined) {
  return value ? String(value) : ""
}

function draftFromAudit(audit: ValidationAudit): TechnicalDraft {
  const technical = audit.technical
  return {
    storeType: technical.storeType ?? "",
    address: audit.store.address,
    plnPowerVa: toInput(technical.plnPowerVa),
    areas: {
      sales: toInput(technical.areas.sales),
      parkir: toInput(technical.areas.parkir),
      teras: toInput(technical.areas.teras),
      gudang: toInput(technical.areas.gudang),
    },
    is24Hours: technical.is24Hours,
    openTime: technical.openTime ?? "07:00",
    closeTime: technical.closeTime ?? "22:00",
    plnHistory: audit.plnHistory.map((row) => ({
      id: row.id,
      billingMonth: row.billingMonth,
      plnUsageKwh: String(row.plnUsageKwh),
      salesTransactionPerDay: String(row.salesTransactionPerDay),
    })),
  }
}

function toDraftInput(draft: TechnicalDraft): ValidationDraftInput {
  return {
    technical: {
      storeType: draft.storeType,
      plnPowerVa: Number(draft.plnPowerVa),
      areas: {
        sales: Number(draft.areas.sales || 0),
        parkir: Number(draft.areas.parkir || 0),
        teras: Number(draft.areas.teras || 0),
        gudang: Number(draft.areas.gudang || 0),
      },
      is24Hours: draft.is24Hours,
      openTime: draft.is24Hours ? null : draft.openTime,
      closeTime: draft.is24Hours ? null : draft.closeTime,
    },
    address: draft.address,
    plnHistory: draft.plnHistory.map((row) => ({
      id: row.id,
      billingMonth: row.billingMonth,
      plnUsageKwh: toNumberOrZero(row.plnUsageKwh),
      salesTransactionPerDay: toNumberOrZero(row.salesTransactionPerDay),
    })),
  }
}

export function ValidationDetail({
  audit,
  equipmentMaster,
}: ValidationDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [draft, setDraft] = useState(() => draftFromAudit(audit))
  const [confirmValidate, setConfirmValidate] = useState(false)
  const isLocked = audit.isValidated

  // Props refresh after every save, so "saved" always means what the server holds.
  const saved = useMemo(() => toDraftInput(draftFromAudit(audit)), [audit])
  const current = toDraftInput(draft)
  const isDirty = JSON.stringify(current) !== JSON.stringify(saved)
  const hasUnsavedPln =
    JSON.stringify(current.plnHistory) !== JSON.stringify(saved.plnHistory)

  const actualKwhPerMonth =
    current.plnHistory.length > 0
      ? averagePlnKwh(current.plnHistory.map((row) => row.plnUsageKwh))
      : audit.actualKwhPerMonth
  const preview = {
    isBoros: isBorosFor(actualKwhPerMonth, audit.baselineKwhPerMonth),
    actualKwhPerMonth,
    baselineKwhPerMonth: audit.baselineKwhPerMonth,
    gapPercent: calculateGapPercent(
      actualKwhPerMonth,
      audit.baselineKwhPerMonth
    ),
  }

  const defaultHours =
    draft.is24Hours || !draft.openTime || !draft.closeTime
      ? 24
      : getHoursBetween(draft.openTime, draft.closeTime)

  // Warn before closing the tab with unsaved technical or PLN edits.
  useEffect(() => {
    if (!isDirty || isLocked) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty, isLocked])

  function handleSave() {
    startTransition(async () => {
      const result = await saveValidationDraft(audit.id, current)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.refresh()
    })
  }

  function handleValidate() {
    startTransition(async () => {
      const result = await validateAudit(audit.id, current)
      setConfirmValidate(false)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.push("/audit/validation")
    })
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background px-4 pb-36 md:max-w-5xl md:px-6 lg:max-w-7xl lg:px-8">
      <Header
        variant="dashboard-back"
        title="Validasi Kalkulasi"
        subtitle={`${audit.store.name} · ${audit.store.code}`}
        backHref="/audit/validation"
        backLabel="Kembali ke daftar validasi"
      />

      <main className="flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          Cek dan koreksi teknis toko, riwayat PLN, dan daftar peralatan, lalu
          validasi kalkulasi ini.
        </p>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:col-span-5">
            <ValidationSummary
              audit={audit}
              preview={preview}
              hasUnsavedPln={hasUnsavedPln}
            />
            {audit.corrections.length > 0 && (
              <CorrectionHistory corrections={audit.corrections} />
            )}
          </div>

          <div className="flex flex-col gap-4 lg:col-span-7">
            <TechnicalForm
              value={draft}
              onChange={setDraft}
              isLocked={isLocked}
              isLatest={audit.isLatest}
            />
            <EquipmentList
              audit={audit}
              equipmentMaster={equipmentMaster}
              storeType={draft.storeType || null}
              defaultHours={defaultHours}
            />
          </div>
        </div>
      </main>

      <StepActionBar>
        {isLocked ? (
          <Button asChild className="h-11 flex-1 rounded-full">
            <Link href="/audit/validation">Kembali ke Daftar Toko</Link>
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-full"
              onClick={handleSave}
              disabled={isPending || !isDirty}
            >
              <IconDeviceFloppy data-icon="inline-start" />
              {isPending ? "Menyimpan..." : "Simpan Draf"}
            </Button>
            <Button
              type="button"
              className="h-11 flex-1 rounded-full"
              onClick={() => setConfirmValidate(true)}
              disabled={isPending}
            >
              <IconCircleCheck data-icon="inline-start" />
              Validasi Kalkulasi
            </Button>
          </>
        )}
      </StepActionBar>

      <Dialog
        open={confirmValidate}
        onOpenChange={(open) => {
          if (!isPending) setConfirmValidate(open)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Validasi {audit.store.name}?</DialogTitle>
            <DialogDescription>
              Status akhir {preview.isBoros ? "Toko Boros" : "Toko Hemat"}
              {audit.original && audit.original.isBoros !== preview.isBoros
                ? ` (awalnya ${audit.original.isBoros ? "Toko Boros" : "Toko Hemat"})`
                : ""}
              .{" "}
              {isDirty
                ? "Perubahan teknis dan riwayat PLN ikut disimpan. "
                : ""}
              Setelah divalidasi, kalkulasi ini tidak bisa diubah lagi sampai
              ada kalkulasi berikutnya.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmValidate(false)}
              disabled={isPending}
            >
              Cek Lagi
            </Button>
            <Button type="button" onClick={handleValidate} disabled={isPending}>
              {isPending ? "Memvalidasi..." : "Validasi Kalkulasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
