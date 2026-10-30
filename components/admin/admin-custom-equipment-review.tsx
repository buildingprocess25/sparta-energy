"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { AreaTarget } from "@prisma/client"
import { IconChecklist } from "@tabler/icons-react"
import { toast } from "sonner"

import {
  approveCustomEquipmentAction,
  rejectCustomEquipmentAction,
} from "@/app/actions/custom-equipment"
import { EquipmentThumbnail } from "@/components/audit/equipment-thumbnail"
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
import type { MasterEquipmentTypeOption } from "@/lib/admin-master-data-queries"
import type { PendingCustomEquipment } from "@/lib/custom-equipment-review"
import { DEVICE_CATEGORIES } from "@/lib/equipment-categories"

const AREA_LABELS: Record<AreaTarget, string> = {
  SALES: "Area Belanja",
  PARKING: "Parkiran",
  TERRACE: "Teras",
  WAREHOUSE: "Gudang, Toilet & Selasar",
}

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

type AdminCustomEquipmentReviewProps = {
  items: PendingCustomEquipment[]
  equipmentTypeOptions: MasterEquipmentTypeOption[]
}

export function AdminCustomEquipmentReview({
  items,
  equipmentTypeOptions,
}: AdminCustomEquipmentReviewProps) {
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
            ? `Validasi Equipment, ${count} equipment menunggu validasi`
            : "Validasi Equipment"
        }
      >
        <IconChecklist data-icon="inline-start" />
        Validasi Equipment
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
            <DialogTitle>Validasi Equipment</DialogTitle>
            <DialogDescription>
              Alat yang ditambahkan anak toko lewat Tambah Alat Kustom. Cek foto dan
              dayanya, lalu jadikan master atau tolak.
            </DialogDescription>
          </DialogHeader>

          {count === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada alat kustom yang menunggu validasi.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.id}>
                  <ReviewCard item={item} equipmentTypeOptions={equipmentTypeOptions} />
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function ReviewCard({
  item,
  equipmentTypeOptions,
}: {
  item: PendingCustomEquipment
  equipmentTypeOptions: MasterEquipmentTypeOption[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const sameNameType = equipmentTypeOptions.find(
    (type) => type.name.trim().toLowerCase() === item.name.trim().toLowerCase()
  )

  const [targetTypeId, setTargetTypeId] = useState(sameNameType?.id ?? "new")
  const [name, setName] = useState(item.name)
  const [deviceCategory, setDeviceCategory] = useState(item.deviceCategory)
  const [areaTarget, setAreaTarget] = useState<AreaTarget>(item.areaTarget)
  const [baseKw, setBaseKw] = useState(String(item.baseKw))
  const [brandName, setBrandName] = useState(item.brandName || "Umum")

  const isNewType = targetTypeId === "new"
  const ids = {
    target: `cer-target-${item.id}`,
    name: `cer-name-${item.id}`,
    category: `cer-category-${item.id}`,
    area: `cer-area-${item.id}`,
    kw: `cer-kw-${item.id}`,
    brand: `cer-brand-${item.id}`,
  }

  function handleResult(result: { success: boolean; message: string }) {
    if (!result.success) {
      toast.error(result.message)
      return
    }
    toast.success(result.message)
    router.refresh()
  }

  function approve() {
    startTransition(async () => {
      handleResult(
        await approveCustomEquipmentAction({
          id: item.id,
          equipmentTypeId: targetTypeId,
          name,
          deviceCategory,
          areaTarget,
          baseKw: Number(baseKw.replace(",", ".")),
          brandName,
        })
      )
    })
  }

  function reject() {
    startTransition(async () => {
      handleResult(await rejectCustomEquipmentAction(item.id))
    })
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex gap-3">
        <EquipmentThumbnail
          photoUrl={item.productPhotoUrl}
          alt={item.brandName ? `${item.name} (${item.brandName})` : item.name}
          deviceCategory={item.deviceCategory}
          size="lg"
          previewable
        />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold">
            {item.name}
            {item.brandName ? ` · ${item.brandName}` : ""}
          </p>
          <p className="text-muted-foreground">
            {item.deviceCategory} · {AREA_LABELS[item.areaTarget]} ·{" "}
            {Math.round(item.baseKw * 1000)} W
          </p>
          <p className="text-xs text-muted-foreground">
            {item.storeLabel} ({item.branch}) · {item.submittedBy} ·{" "}
            {dateFormat.format(new Date(item.createdAt))}
          </p>
          {item.notes && (
            <p className="text-xs text-muted-foreground">Catatan: {item.notes}</p>
          )}
          {item.sameNameCount > 0 && (
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {item.sameNameCount} usulan lain bernama sama sedang menunggu.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor={ids.target}>Simpan sebagai</Label>
          <Select value={targetTypeId} onValueChange={setTargetTypeId} disabled={isPending}>
            <SelectTrigger id={ids.target} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Tipe baru di master</SelectItem>
              {equipmentTypeOptions.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  Brand baru di tipe {type.name} ({type.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isNewType && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.name}>Nama equipment</Label>
              <Input
                id={ids.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.category}>Kategori jenis</Label>
              <Select value={deviceCategory} onValueChange={setDeviceCategory} disabled={isPending}>
                <SelectTrigger id={ids.category} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={ids.brand}>Brand</Label>
          <Input
            id={ids.brand}
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={ids.kw}>Base kW</Label>
          <Input
            id={ids.kw}
            inputMode="decimal"
            value={baseKw}
            onChange={(e) => setBaseKw(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
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
              {(Object.keys(AREA_LABELS) as AreaTarget[]).map((area) => (
                <SelectItem key={area} value={area}>
                  {AREA_LABELS[area]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-11 text-destructive hover:text-destructive"
          onClick={reject}
          disabled={isPending}
        >
          Tolak
        </Button>
        <Button type="button" className="h-11" onClick={approve} disabled={isPending}>
          Simpan ke master
        </Button>
      </div>
    </article>
  )
}
