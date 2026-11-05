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
import { AREA_LABELS, AREA_TARGET_OPTIONS } from "@/lib/area-labels"
import type { PendingCustomEquipment } from "@/lib/custom-equipment-review"
import { DEVICE_CATEGORIES } from "@/lib/equipment-categories"
import { EnergyProfileFields } from "@/components/admin/energy-profile-fields"
import {
  CALC_METHOD_LABELS,
  CALC_METHODS,
  OPERATION_TYPE_LABELS,
  OPERATION_TYPES,
  isUsageMethod,
  resolveOperationType,
  type CalcMethod,
  type OperationType,
} from "@/lib/energy-formula"
import {
  parseDecimal,
  profileDraftFromBrand,
  profileIssueMessage,
  resolveProfileDraft,
} from "@/lib/energy-profile-draft"

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
  const [brandName, setBrandName] = useState(item.brandName || "Umum")
  const [newOperationType, setNewOperationType] = useState<OperationType>(item.operationType)
  const [newCalcMethod, setNewCalcMethod] = useState<CalcMethod>(
    (CALC_METHODS as readonly string[]).includes(item.calcMethod) ? (item.calcMethod as CalcMethod) : "STANDARD"
  )
  // Seconds per transaction, minutes per batch, as in the master form.
  const [newCycle, setNewCycle] = useState(
    item.cycleSeconds ? String(item.calcMethod === "BATCH" ? item.cycleSeconds / 60 : item.cycleSeconds) : ""
  )
  // The field form's power is the nameplate.
  const [profileDraft, setProfileDraft] = useState(() =>
    profileDraftFromBrand({
      nameplateKw: item.baseKw,
      baseKw: item.baseKw,
      runningKw: 0,
      standbyKw: 0,
      runningPctOfNameplate: null,
      standbyPctOfNameplate: null,
      runningTimePct: null,
    })
  )

  const isNewType = targetTypeId === "new"
  const targetType = equipmentTypeOptions.find((type) => type.id === targetTypeId)
  const operationType: OperationType = isNewType
    ? newOperationType
    : resolveOperationType(targetType?.operationType, targetType?.calcMethod)
  const calcMethod = isNewType
    ? newOperationType === "STATIS"
      ? "STANDARD"
      : newCalcMethod
    : (targetType?.calcMethod ?? "STANDARD")
  const newCycleValue = parseDecimal(newCycle)
  const cycleSeconds = isNewType
    ? isUsageMethod(calcMethod) && Number.isFinite(newCycleValue)
      ? calcMethod === "BATCH"
        ? newCycleValue * 60
        : newCycleValue
      : null
    : (targetType?.calcDuration ?? null)
  const ids = {
    target: `cer-target-${item.id}`,
    name: `cer-name-${item.id}`,
    category: `cer-category-${item.id}`,
    area: `cer-area-${item.id}`,
    operation: `cer-operation-${item.id}`,
    method: `cer-method-${item.id}`,
    cycle: `cer-cycle-${item.id}`,
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
    const { values, issues } = resolveProfileDraft(profileDraft, operationType, calcMethod, cycleSeconds)
    if (issues.length > 0) {
      toast.error(profileIssueMessage(issues))
      return
    }
    startTransition(async () => {
      handleResult(
        await approveCustomEquipmentAction({
          id: item.id,
          equipmentTypeId: targetTypeId,
          name,
          deviceCategory,
          areaTarget,
          brandName,
          operationType,
          calcMethod,
          cycleSeconds,
          profile: values,
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
            {Math.round(item.baseKw * 1000)} W · {OPERATION_TYPE_LABELS[item.operationType]}{" "}
            {CALC_METHOD_LABELS[item.calcMethod as CalcMethod] ?? item.calcMethod}
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
          <Label htmlFor={ids.brand}>Merek</Label>
          <Input
            id={ids.brand}
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            disabled={isPending}
          />
        </div>
        {isNewType && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.operation}>Karakteristik</Label>
              <Select
                value={newOperationType}
                onValueChange={(value) => setNewOperationType(value as OperationType)}
                disabled={isPending}
              >
                <SelectTrigger id={ids.operation} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATION_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {OPERATION_TYPE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.method}>Metode kalkulasi</Label>
              <Select
                value={calcMethod}
                onValueChange={(value) => setNewCalcMethod(value as CalcMethod)}
                disabled={isPending || newOperationType === "STATIS"}
              >
                <SelectTrigger id={ids.method} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CALC_METHODS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {CALC_METHOD_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isUsageMethod(calcMethod) && (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor={ids.cycle}>
                  {calcMethod === "TRANSACTION" ? "Waktu per transaksi (detik)" : "Waktu per batch (menit)"}
                </Label>
                <Input
                  id={ids.cycle}
                  inputMode="decimal"
                  value={newCycle}
                  onChange={(e) => setNewCycle(e.target.value)}
                  disabled={isPending}
                />
              </div>
            )}
          </>
        )}

        <div className="sm:col-span-2">
          <EnergyProfileFields
            idPrefix={`cer-profile-${item.id}`}
            draft={profileDraft}
            onChange={setProfileDraft}
            operationType={operationType}
            calcMethod={calcMethod}
            cycleSeconds={cycleSeconds}
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
              {AREA_TARGET_OPTIONS.map((area) => (
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
