import {
  IconAlertTriangle,
  IconCircleCheck,
  IconFlame,
  IconInfoCircle,
  IconLeaf,
} from "@tabler/icons-react"

import { formatGap, formatKwh } from "@/components/audit-validation/format"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ValidationAudit } from "@/lib/audit-validation-queries"
import { cn } from "@/lib/utils"

export type ValidationPreview = {
  isBoros: boolean
  actualKwhPerMonth: number
  baselineKwhPerMonth: number
  gapPercent: number | null
}

type ValidationSummaryProps = {
  audit: ValidationAudit
  preview: ValidationPreview
  hasUnsavedPln: boolean
}

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" })

function statusLabel(isBoros: boolean) {
  return isBoros ? "Toko Boros" : "Toko Hemat"
}

function Comparison({
  label,
  value,
  original,
  className,
}: {
  label: string
  value: number
  original: number | null
  className?: string
}) {
  const changed =
    original !== null && Math.round(original) !== Math.round(value)
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl bg-muted/50 p-3",
        className
      )}
    >
      <span className="text-sm">{label}</span>
      <span className="text-right">
        <span className="block font-bold">{formatKwh(value)}</span>
        {changed && (
          <span className="block text-xs opacity-80">
            awal {formatKwh(original)}
          </span>
        )}
      </span>
    </div>
  )
}

export function ValidationSummary({
  audit,
  preview,
  hasUnsavedPln,
}: ValidationSummaryProps) {
  const StatusIcon = preview.isBoros ? IconAlertTriangle : IconLeaf
  const original = audit.original
  const isCorrected = original !== null || hasUnsavedPln
  const differenceKwh = Math.abs(
    preview.actualKwhPerMonth - preview.baselineKwhPerMonth
  )
  const statusChanged =
    original !== null && original.isBoros !== preview.isBoros

  return (
    <div className="flex flex-col gap-4">
      <Card
        className={cn(
          "relative overflow-hidden border-0 bg-linear-to-br text-white shadow-lg",
          preview.isBoros
            ? "from-[#c54b45] to-[#b23f39] shadow-[#d85a53]/20"
            : "from-[#2c7a57] to-[#246648] shadow-[#2c7a57]/20"
        )}
      >
        <StatusIcon
          aria-hidden="true"
          className="absolute -top-4 -right-4 size-36 opacity-15"
        />
        <CardContent className="relative flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="w-fit rounded-full bg-black/15 text-white">
              {audit.store.name} · {audit.store.code}
            </Badge>
            {audit.isBoros && audit.isSangatBoros && (
              <Badge className="w-fit rounded-full bg-black/30 text-white">
                <IconFlame data-icon="inline-start" aria-hidden="true" />
                Sangat Boros · 12 teratas
              </Badge>
            )}
            {statusChanged && (
              <Badge className="w-fit rounded-full bg-black/30 text-white">
                Awal: {statusLabel(original.isBoros)}
              </Badge>
            )}
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase">
              {isCorrected
                ? "Setelah koreksi validasi"
                : "Hasil identifikasi anak toko"}
            </p>
            <h2 className="flex items-center gap-2 text-3xl font-black tracking-tight">
              <StatusIcon aria-hidden="true" className="size-8" />
              {preview.isBoros ? "TOKO BOROS" : "TOKO HEMAT"}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-white/25 pt-4 tabular-nums">
            <div>
              <p className="text-xl font-black">
                {formatKwh(preview.actualKwhPerMonth)}
              </p>
              <p className="text-[11px] font-semibold tracking-wider uppercase">
                Aktual PLN
              </p>
            </div>
            <div>
              <p className="text-xl font-black">
                {formatKwh(preview.baselineKwhPerMonth)}
              </p>
              <p className="text-[11px] font-semibold tracking-wider uppercase">
                Standar Konsumsi Energi
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {audit.isValidated && (
        <Alert>
          <IconCircleCheck className="text-primary" />
          <AlertTitle>Sudah divalidasi</AlertTitle>
          <AlertDescription>
            {audit.validatedBy ?? "Admin"} memvalidasi kalkulasi ini
            {audit.validatedAt
              ? ` pada ${dateFormat.format(new Date(audit.validatedAt))}`
              : ""}
            . Data tidak bisa diubah lagi. Status toko dinilai ulang dari
            kalkulasi berikutnya.
          </AlertDescription>
        </Alert>
      )}

      {statusChanged && (
        <Alert>
          <IconInfoCircle />
          <AlertTitle>
            Status berubah dari {statusLabel(original.isBoros)} ke{" "}
            {statusLabel(preview.isBoros)}
          </AlertTitle>
          <AlertDescription>
            Rekomendasi dibuat dari data sebelum koreksi, jadi bisa tidak sesuai
            dengan status baru.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Perbandingan kWh per bulan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 tabular-nums">
          <Comparison
            label="Standar Konsumsi Energi"
            value={preview.baselineKwhPerMonth}
            original={original?.baselineKwhPerMonth ?? null}
          />
          <Comparison
            label="Aktual PLN"
            value={preview.actualKwhPerMonth}
            original={original?.actualKwhPerMonth ?? null}
            className={cn(
              "text-white",
              preview.isBoros ? "bg-[#c54b45]" : "bg-[#2c7a57]"
            )}
          />
          <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
            <span className="text-sm">
              {preview.actualKwhPerMonth > preview.baselineKwhPerMonth
                ? "Kelebihan"
                : "Penghematan"}
            </span>
            <span
              className={cn(
                "font-bold",
                preview.isBoros
                  ? "text-[#b23f39] dark:text-[#e07a74]"
                  : "text-primary"
              )}
            >
              {formatKwh(differenceKwh)}
              {preview.gapPercent !== null && (
                <span className="ml-1 font-semibold">
                  ({formatGap(preview.gapPercent)})
                </span>
              )}
            </span>
          </div>
          {hasUnsavedPln && (
            <p className="px-1 text-xs font-medium text-amber-700 dark:text-amber-400">
              Aktual PLN memakai riwayat PLN yang belum disimpan.
            </p>
          )}
          <p className="px-1 text-xs text-muted-foreground">
            Diinput oleh {audit.auditor} pada{" "}
            {dateFormat.format(new Date(audit.auditDate))}.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
