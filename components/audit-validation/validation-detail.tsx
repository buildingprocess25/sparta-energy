"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconLeaf,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { deleteAuditItem, validateAudit } from "@/app/actions/audit-validation"
import {
  areaLabels,
  areaOrder,
  formatGap,
  formatHours,
  formatKwh,
  type AreaKey,
} from "@/components/audit-validation/format"
import { ItemFormDialog } from "@/components/audit-validation/item-form-dialog"
import { Header } from "@/components/header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type {
  ValidationAudit,
  ValidationAuditItem,
} from "@/lib/audit-validation-queries"
import type { EquipmentMasterItem } from "@/lib/get-equipment-for-area"
import { cn } from "@/lib/utils"

type ValidationDetailProps = {
  audit: ValidationAudit
  equipmentMaster: EquipmentMasterItem[]
}

type FormState = { area: AreaKey; item: ValidationAuditItem | null } | null

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" })

export function ValidationDetail({ audit, equipmentMaster }: ValidationDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeArea, setActiveArea] = useState<AreaKey>(
    areaOrder.find((area) => audit.items.some((i) => i.areaTarget === area)) ??
      "SALES"
  )
  const [form, setForm] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<ValidationAuditItem | null>(null)
  const [confirmValidate, setConfirmValidate] = useState(false)

  const isLocked = audit.isValidated
  const StatusIcon = audit.isBoros ? IconAlertTriangle : IconLeaf
  const differenceKwh = Math.abs(
    audit.actualKwhPerMonth - audit.baselineKwhPerMonth
  )
  const activeItems = audit.items.filter((item) => item.areaTarget === activeArea)
  const countByArea = (area: AreaKey) =>
    audit.items.filter((item) => item.areaTarget === area).length

  function handleDelete() {
    if (!deleting) return
    startTransition(async () => {
      const result = await deleteAuditItem(deleting.id)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setDeleting(null)
      router.refresh()
    })
  }

  function handleValidate() {
    startTransition(async () => {
      const result = await validateAudit(audit.id)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setConfirmValidate(false)
      router.push("/audit/validation")
    })
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md md:max-w-5xl lg:max-w-7xl flex-col bg-background px-4 md:px-6 lg:px-8 pb-36">
      <Header
        variant="dashboard-back"
        title="Validasi Audit"
        subtitle={`${audit.store.name} · ${audit.store.code}`}
        backHref="/audit/validation"
        backLabel="Kembali ke daftar validasi"
      />

      <main className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Card
            className={cn(
              "relative overflow-hidden border-0 bg-linear-to-br text-white shadow-lg",
              audit.isBoros
                ? "from-[#c54b45] to-[#b23f39] shadow-[#d85a53]/20"
                : "from-[#2c7a57] to-[#246648] shadow-[#2c7a57]/20"
            )}
          >
            <StatusIcon
              aria-hidden="true"
              className="absolute -top-4 -right-4 size-36 opacity-15"
            />
            <CardContent className="relative flex flex-col gap-4">
              <Badge className="w-fit rounded-full bg-black/15 text-white">
                {audit.store.name} · {audit.store.code}
              </Badge>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] uppercase">
                  Hasil audit anak toko
                </p>
                <h2 className="flex items-center gap-2 text-3xl font-black tracking-tight">
                  <StatusIcon aria-hidden="true" className="size-8" />
                  {audit.isBoros ? "TOKO BOROS" : "TOKO HEMAT"}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-white/25 pt-4 tabular-nums">
                <div>
                  <p className="text-xl font-black">{formatKwh(audit.actualKwhPerMonth)}</p>
                  <p className="text-[11px] font-semibold tracking-wider uppercase">
                    Aktual rata-rata
                  </p>
                </div>
                <div>
                  <p className="text-xl font-black">{formatKwh(audit.baselineKwhPerMonth)}</p>
                  <p className="text-[11px] font-semibold tracking-wider uppercase">
                    Baseline
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLocked && (
            <Alert>
              <IconCircleCheck />
              <AlertTitle>Sudah divalidasi</AlertTitle>
              <AlertDescription>
                {audit.validatedBy ?? "Admin"} memvalidasi audit ini
                {audit.validatedAt
                  ? ` pada ${dateFormat.format(new Date(audit.validatedAt))}`
                  : ""}
                . Data alat tidak bisa diubah lagi. Status toko dinilai ulang
                dari audit berikutnya.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Perbandingan kWh per bulan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 tabular-nums">
              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                <span className="text-sm">Baseline</span>
                <span className="font-bold">{formatKwh(audit.baselineKwhPerMonth)}</span>
              </div>
              <div
                className={cn(
                  "flex items-center justify-between rounded-xl p-3 text-white",
                  audit.isBoros ? "bg-[#c54b45]" : "bg-[#2c7a57]"
                )}
              >
                <span className="text-sm">Aktual rata-rata</span>
                <span className="font-bold">{formatKwh(audit.actualKwhPerMonth)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                <span className="text-sm">
                  {audit.actualKwhPerMonth > audit.baselineKwhPerMonth
                    ? "Kelebihan"
                    : "Penghematan"}
                </span>
                <span
                  className={cn(
                    "font-bold",
                    audit.isBoros
                      ? "text-[#b23f39] dark:text-[#e07a74]"
                      : "text-primary"
                  )}
                >
                  {formatKwh(differenceKwh)}
                  {audit.gapPercent !== null && (
                    <span className="ml-1 font-semibold">
                      ({formatGap(audit.gapPercent)})
                    </span>
                  )}
                </span>
              </div>
              <p className="px-1 text-xs text-muted-foreground">
                Diaudit oleh {audit.auditor} pada{" "}
                {dateFormat.format(new Date(audit.auditDate))}.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-sm">Daftar Peralatan</CardTitle>
            <CardAction>
              <Badge variant="secondary">{audit.items.length} item</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={1}
              value={activeArea}
              onValueChange={(value) => {
                if (value) setActiveArea(value as AreaKey)
              }}
              className="flex w-full flex-wrap"
              aria-label="Pilih area"
            >
              {areaOrder.map((area) => (
                <ToggleGroupItem
                  key={area}
                  value={area}
                  className="h-11 rounded-full px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"
                >
                  {areaLabels[area]} ({countByArea(area)})
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {activeItems.length === 0 ? (
              <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                Belum ada alat di area ini.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {activeItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 rounded-xl bg-muted/40 py-1.5 pr-1.5 pl-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground tabular-nums">
                        {item.qty} unit · {formatHours(item.operationalHours)} jam ·{" "}
                        {item.baseKw} kW
                        {item.brandName ? ` · ${item.brandName}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs font-semibold tabular-nums">
                      {item.estimatedDailyKwh.toFixed(1)}{" "}
                      <span className="font-normal text-muted-foreground">kWh/hari</span>
                    </p>
                    {!isLocked && (
                      <div className="flex shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-11"
                          aria-label={`Ubah ${item.name}`}
                          onClick={() => setForm({ area: activeArea, item })}
                        >
                          <IconPencil />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-11 text-destructive hover:text-destructive"
                          aria-label={`Hapus ${item.name}`}
                          onClick={() => setDeleting(item)}
                        >
                          <IconTrash />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {!isLocked && (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                onClick={() => setForm({ area: activeArea, item: null })}
              >
                <IconPlus data-icon="inline-start" />
                Tambah Alat di {areaLabels[activeArea]}
              </Button>
            )}
          </CardContent>
        </Card>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        {isLocked ? (
          <Button asChild variant="outline" className="h-11 w-full max-w-sm rounded-full">
            <Link href="/audit/validation">Kembali ke Daftar Toko</Link>
          </Button>
        ) : (
          <Button
            type="button"
            className="h-11 w-full max-w-sm rounded-full"
            onClick={() => setConfirmValidate(true)}
            disabled={isPending || audit.items.length === 0}
          >
            <IconCircleCheck data-icon="inline-start" />
            Validasi Data Toko
          </Button>
        )}
      </div>

      {form && (
        <ItemFormDialog
          key={form.item?.id ?? `new-${form.area}`}
          open
          onOpenChange={(open) => {
            if (!open) setForm(null)
          }}
          auditId={audit.id}
          area={form.area}
          item={form.item}
          equipmentMaster={equipmentMaster}
        />
      )}

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setDeleting(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus {deleting?.name}?</DialogTitle>
            <DialogDescription>
              Alat ini dihapus dari audit dan estimasi kWh toko dihitung ulang.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Hapus Alat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              Pastikan alat dan jumlahnya sudah sesuai kondisi di toko. Setelah
              divalidasi, data tidak bisa diubah lagi sampai ada audit
              berikutnya.
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
              {isPending ? "Memvalidasi..." : "Validasi Data Toko"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
