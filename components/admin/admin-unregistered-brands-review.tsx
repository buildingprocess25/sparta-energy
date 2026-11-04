"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { AreaTarget } from "@prisma/client"
import { IconTag } from "@tabler/icons-react"
import { toast } from "sonner"

import {
  addFieldBrandToMasterAction,
  dismissFieldBrandAction,
} from "@/app/actions/unregistered-brands"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AREA_LABELS, AREA_TARGET_OPTIONS } from "@/lib/area-labels"
import { normalizeBrandName } from "@/lib/brand-match"
import { isUsageBasedMethod, type UnregisteredBrand } from "@/lib/unregistered-brands"

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

function formatWatt(kw: number) {
  return `${Math.round(kw * 1000).toLocaleString("id-ID")} W`
}

function parseKw(value: string) {
  return Number(value.replace(",", "."))
}

type AdminUnregisteredBrandsReviewProps = {
  items: UnregisteredBrand[]
}

export function AdminUnregisteredBrandsReview({ items }: AdminUnregisteredBrandsReviewProps) {
  const [open, setOpen] = useState(false)
  const count = items.length

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative w-full lg:w-auto"
        aria-label={
          count > 0
            ? `Merek dari Lapangan, ${count} merek belum ada di master`
            : "Merek dari Lapangan"
        }
      >
        <IconTag data-icon="inline-start" />
        Merek dari Lapangan
        {count > 0 && (
          <span
            aria-hidden="true"
            className="flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] leading-5 font-semibold text-white tabular-nums"
          >
            {count}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Merek dari Lapangan</DialogTitle>
            <DialogDescription>
              Merek yang diketik anak toko tapi belum ada di master. Cek ejaan dan dayanya,
              lalu simpan ke master atau abaikan. Data kalkulasi tidak ikut berubah.
            </DialogDescription>
          </DialogHeader>

          {count === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Semua merek yang diketik anak toko sudah ada di master. Merek baru muncul di
              sini setelah kalkulasinya dikirim.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.key}>
                  <FieldBrandCard item={item} />
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function FieldBrandCard({ item }: { item: UnregisteredBrand }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmingDismiss, setConfirmingDismiss] = useState(false)
  const usageBased = isUsageBasedMethod(item.calcMethod)

  const [brandName, setBrandName] = useState(item.brandName)
  const [baseKw, setBaseKw] = useState(String(item.kwTypical))
  const [runningKw, setRunningKw] = useState(String(item.kwTypical))
  const [standbyKw, setStandbyKw] = useState(String(Math.round(item.kwTypical * 50) / 1000))
  const [areaTarget, setAreaTarget] = useState<AreaTarget>(item.areaTarget)

  const spellingChanged =
    normalizeBrandName(brandName) !== "" &&
    normalizeBrandName(brandName) !== normalizeBrandName(item.brandName)
  const ids = {
    name: `fb-name-${item.key}`,
    kw: `fb-kw-${item.key}`,
    running: `fb-running-${item.key}`,
    standby: `fb-standby-${item.key}`,
    area: `fb-area-${item.key}`,
  }

  function handleResult(result: { success: boolean; message: string }) {
    if (!result.success) {
      toast.error(result.message)
      return
    }
    toast.success(result.message)
    router.refresh()
  }

  function save() {
    startTransition(async () => {
      handleResult(
        await addFieldBrandToMasterAction({
          equipmentTypeId: item.equipmentTypeId,
          fieldBrandName: item.brandName,
          brandName,
          baseKw: parseKw(baseKw),
          runningKw: usageBased ? parseKw(runningKw) : null,
          standbyKw: usageBased ? parseKw(standbyKw) : null,
          areaTarget,
        })
      )
    })
  }

  function dismiss() {
    startTransition(async () => {
      handleResult(
        await dismissFieldBrandAction({
          equipmentTypeId: item.equipmentTypeId,
          fieldBrandName: item.brandName,
        })
      )
      setConfirmingDismiss(false)
    })
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="min-w-0 text-sm">
        <p className="font-semibold break-words">
          {item.brandName} · {item.typeName}
        </p>
        <p className="text-muted-foreground">
          {AREA_LABELS[item.areaTarget]} · {formatWatt(item.kwTypical)}
        </p>
        <p className="text-xs text-muted-foreground">
          {item.storeCount} toko, {item.auditCount} kalkulasi · {item.sampleStores.join(", ")}
          {item.storeCount > item.sampleStores.length ? ", dan lainnya" : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          Pertama {dateFormat.format(new Date(item.firstSeen))}, terakhir{" "}
          {dateFormat.format(new Date(item.lastSeen))}
        </p>
        {item.kwMin !== item.kwMax && (
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Daya yang diisi berbeda antar toko: {formatWatt(item.kwMin)} sampai{" "}
            {formatWatt(item.kwMax)}. Cek nameplate sebelum menyimpan.
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor={ids.name}>Nama merek</Label>
          <Input
            id={ids.name}
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            disabled={isPending}
            aria-describedby={spellingChanged ? `${ids.name}-hint` : undefined}
          />
          {spellingChanged && (
            <p id={`${ids.name}-hint`} className="text-xs text-muted-foreground">
              Ejaan dari lapangan ({item.brandName}) ikut disembunyikan dari daftar ini.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={ids.kw}>Daya dasar (kW)</Label>
          <Input
            id={ids.kw}
            inputMode="decimal"
            value={baseKw}
            onChange={(e) => setBaseKw(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={ids.area}>Area penempatan</Label>
          <Select
            value={areaTarget}
            onValueChange={(value) => setAreaTarget(value as AreaTarget)}
            disabled={isPending}
          >
            <SelectTrigger id={ids.area} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AREA_TARGET_OPTIONS.map((area) => (
                <SelectItem key={area} value={area}>
                  {AREA_LABELS[area]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {usageBased && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.running}>Daya saat bekerja (kW)</Label>
              <Input
                id={ids.running}
                inputMode="decimal"
                value={runningKw}
                onChange={(e) => setRunningKw(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.standby}>Daya siaga (kW)</Label>
              <Input
                id={ids.standby}
                inputMode="decimal"
                value={standbyKw}
                onChange={(e) => setStandbyKw(e.target.value)}
                disabled={isPending}
              />
            </div>
          </>
        )}
      </div>

      {confirmingDismiss ? (
        <div
          role="group"
          aria-label={`Konfirmasi abaikan ${item.brandName}`}
          className="flex flex-col gap-3 rounded-lg bg-muted p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            Sembunyikan {item.brandName} dari daftar? Merek ini tidak muncul lagi walau
            diketik ulang di lapangan.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => setConfirmingDismiss(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 text-destructive hover:text-destructive"
              onClick={dismiss}
              disabled={isPending}
            >
              Ya, abaikan
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => setConfirmingDismiss(true)}
            disabled={isPending}
          >
            Abaikan
          </Button>
          <Button type="button" className="h-11" onClick={save} disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan ke master"}
          </Button>
        </div>
      )}
    </article>
  )
}
