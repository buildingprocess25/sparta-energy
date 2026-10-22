"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { addAuditItem, updateAuditItem } from "@/app/actions/audit-validation"
import { BrandCombobox } from "@/components/audit/brand-combobox"
import { areaLabels, type AreaKey } from "@/components/audit-validation/format"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { calculateItemDailyKwh } from "@/lib/audit-recalculate"
import type { ValidationAuditItem } from "@/lib/audit-validation-queries"
import type { EquipmentMasterItem } from "@/lib/get-equipment-for-area"

const CUSTOM_TYPE = "custom"

type ItemFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  auditId: string
  area: AreaKey
  item: ValidationAuditItem | null
  equipmentMaster: EquipmentMasterItem[]
  presetType?: EquipmentMasterItem | null
  defaultHours?: number
}

function defaultUsage(calcMethod: string | undefined) {
  if (calcMethod === "TRANSACTION") return "50"
  if (calcMethod === "BATCH") return "6"
  return ""
}

type FormErrors = Partial<Record<"name" | "qty" | "hours" | "kw" | "usage", string>>

function toNumber(value: string) {
  return Number(value.replace(",", "."))
}

export function ItemFormDialog({
  open,
  onOpenChange,
  auditId,
  area,
  item,
  equipmentMaster,
  presetType = null,
  defaultHours,
}: ItemFormDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = item !== null

  const [typeId, setTypeId] = useState(
    item?.equipmentTypeId ?? presetType?.id ?? CUSTOM_TYPE
  )
  const [name, setName] = useState(item?.name ?? presetType?.name ?? "")
  const [brandName, setBrandName] = useState(item?.brandName ?? "")
  const [qty, setQty] = useState(String(item?.qty ?? 1))
  const [hours, setHours] = useState(
    String(item?.operationalHours ?? defaultHours ?? "")
  )
  const [kw, setKw] = useState(String(item?.baseKw ?? presetType?.defaultKw ?? ""))
  const [usage, setUsage] = useState(
    item?.usageCount != null
      ? String(item.usageCount)
      : defaultUsage(presetType?.calcMethod)
  )
  const [errors, setErrors] = useState<FormErrors>({})

  const typesByCategory = useMemo(() => {
    const groups = new Map<string, EquipmentMasterItem[]>()
    for (const type of equipmentMaster) {
      const list = groups.get(type.category) ?? []
      list.push(type)
      groups.set(type.category, list)
    }
    return Array.from(groups.entries())
  }, [equipmentMaster])

  const selectedType = equipmentMaster.find((type) => type.id === typeId)
  const calcMethod = isEdit ? item.calcMethod : selectedType?.calcMethod
  const calcDuration = isEdit ? item.calcDuration : selectedType?.calcDuration
  const isUsageBased = calcMethod === "TRANSACTION" || calcMethod === "BATCH"
  const brands = selectedType?.brands ?? []
  const selectedBrand = brands.find(
    (brand) => brand.name.toLowerCase() === brandName.trim().toLowerCase()
  )

  const previewKwh = calculateItemDailyKwh({
    qty: toNumber(qty) || 0,
    operationalHours: toNumber(hours) || 0,
    baseKw: toNumber(kw) || 0,
    calcMethod,
    calcDuration,
    usageCount: toNumber(usage) || 0,
    standbyKw: selectedBrand?.standbyKw,
  })

  function handleTypeChange(value: string) {
    setTypeId(value)
    setBrandName("")
    const type = equipmentMaster.find((t) => t.id === value)
    if (type) {
      setName(type.name)
      setKw(String(type.defaultKw))
    }
  }

  function handleBrandChange(value: string) {
    setBrandName(value)
    const brand = brands.find(
      (b) => b.name.toLowerCase() === value.trim().toLowerCase()
    )
    if (brand && brand.baseKw > 0) setKw(String(brand.baseKw))
  }

  function validate() {
    const next: FormErrors = {}
    const qtyValue = toNumber(qty)
    const hoursValue = toNumber(hours)
    const kwValue = toNumber(kw)
    if (!isEdit && !name.trim()) next.name = "Nama alat harus diisi."
    if (!Number.isInteger(qtyValue) || qtyValue < 1 || qtyValue > 999) {
      next.qty = "Isi angka bulat 1 sampai 999."
    }
    if (!(hoursValue > 0) || hoursValue > 24) {
      next.hours = "Isi jam di antara 0 dan 24."
    }
    if (!(kwValue > 0) || kwValue > 100) {
      next.kw = "Isi daya lebih dari 0 dan paling besar 100 kW."
    }
    if (isUsageBased) {
      const usageValue = toNumber(usage)
      if (!Number.isInteger(usageValue) || usageValue < 0) {
        next.usage = "Isi angka bulat 0 atau lebih."
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!validate()) return

    const fields = {
      qty: toNumber(qty),
      operationalHours: toNumber(hours),
      baseKw: toNumber(kw),
      brandName,
      usageCount: isUsageBased ? toNumber(usage) : null,
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateAuditItem({ itemId: item.id, ...fields })
        : await addAuditItem({
            auditId,
            areaTarget: area,
            equipmentTypeId: typeId === CUSTOM_TYPE ? null : typeId,
            customName: name,
            ...fields,
          })

      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>
              {isEdit
                ? `Ubah ${item.name}`
                : presetType
                  ? `Tambah ${presetType.name}`
                  : "Tambah Alat"}
            </DialogTitle>
            <DialogDescription>
              Area {areaLabels[area]}. Estimasi kWh toko dihitung ulang setelah
              disimpan.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            {!isEdit && !presetType && (
              <>
                <Field>
                  <FieldLabel htmlFor="item-type">Jenis alat</FieldLabel>
                  <Select value={typeId} onValueChange={handleTypeChange}>
                    <SelectTrigger id="item-type" className="w-full">
                      <SelectValue placeholder="Pilih jenis alat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CUSTOM_TYPE}>
                        Alat lain (isi manual)
                      </SelectItem>
                      {typesByCategory.map(([category, types]) => (
                        <SelectGroup key={category}>
                          <SelectLabel>{category}</SelectLabel>
                          {types.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field data-invalid={Boolean(errors.name)}>
                  <FieldLabel htmlFor="item-name">Nama alat</FieldLabel>
                  <Input
                    id="item-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Freezer Es Krim"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </Field>
              </>
            )}

            <Field>
              <FieldLabel>Merek</FieldLabel>
              <BrandCombobox
                brands={brands}
                value={brandName}
                onChange={handleBrandChange}
                placeholder="Pilih atau ketik merek"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={Boolean(errors.qty)}>
                <FieldLabel htmlFor="item-qty">Jumlah unit</FieldLabel>
                <Input
                  id="item-qty"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={999}
                  step={1}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  aria-invalid={Boolean(errors.qty)}
                />
                {errors.qty && <FieldError>{errors.qty}</FieldError>}
              </Field>

              <Field data-invalid={Boolean(errors.hours)}>
                <FieldLabel htmlFor="item-hours">Jam nyala per hari</FieldLabel>
                <Input
                  id="item-hours"
                  type="number"
                  inputMode="decimal"
                  min={0.5}
                  max={24}
                  step={0.5}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  aria-invalid={Boolean(errors.hours)}
                />
                {errors.hours && <FieldError>{errors.hours}</FieldError>}
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.kw)}>
              <FieldLabel htmlFor="item-kw">Daya per unit (kW)</FieldLabel>
              <Input
                id="item-kw"
                type="number"
                inputMode="decimal"
                min={0.001}
                step={0.001}
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                aria-invalid={Boolean(errors.kw)}
              />
              <FieldDescription>
                Terisi otomatis dari merek. Ubah kalau nameplate alat berbeda.
              </FieldDescription>
              {errors.kw && <FieldError>{errors.kw}</FieldError>}
            </Field>

            {isUsageBased && (
              <Field data-invalid={Boolean(errors.usage)}>
                <FieldLabel htmlFor="item-usage">Pemakaian per hari</FieldLabel>
                <Input
                  id="item-usage"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={usage}
                  onChange={(e) => setUsage(e.target.value)}
                  aria-invalid={Boolean(errors.usage)}
                />
                <FieldDescription>
                  Berapa kali alat dipakai dalam sehari.
                </FieldDescription>
                {errors.usage && <FieldError>{errors.usage}</FieldError>}
              </Field>
            )}

            <p className="rounded-xl bg-muted/50 px-3 py-2.5 text-sm tabular-nums">
              Perkiraan{" "}
              <span className="font-semibold">{previewKwh.toFixed(1)} kWh</span>{" "}
              per hari
            </p>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Tambah ke Audit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
