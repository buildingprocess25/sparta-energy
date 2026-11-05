"use client"

import { useEffect, useState } from "react"
import { IconLoader2, IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import { toast } from "sonner"
import { cn, slugify } from "@/lib/utils"
import { uploadFiles } from "@/lib/uploadthing"
import { compressImage } from "@/lib/image-compression"
import { DEVICE_CATEGORIES, isDeviceCategory } from "@/lib/equipment-categories"
import {
  CALC_METHOD_LABELS,
  OPERATION_TYPE_LABELS,
  resolveOperationType,
  type CalcMethod,
  type OperationType,
} from "@/lib/energy-formula"
import {
  emptyProfileDraft,
  profileDraftFromBrand,
  profileIssueMessage,
  resolveProfileDraft,
} from "@/lib/energy-profile-draft"
import { EnergyProfileFields } from "@/components/admin/energy-profile-fields"

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
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  MasterEquipmentRow,
  MasterEquipmentTypeOption,
} from "@/lib/admin-master-data-queries"

type AdminMasterEquipmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment?: MasterEquipmentRow | null // If null/undefined, we are in Create mode
  equipmentTypeOptions: MasterEquipmentTypeOption[]
  categories: string[]
  storeTypes: string[]
  onSuccess?: () => void
}

export function AdminMasterEquipmentDialog({
  open,
  onOpenChange,
  equipment,
  equipmentTypeOptions,
  categories,
  storeTypes,
  onSuccess,
}: AdminMasterEquipmentDialogProps) {
  const [equipmentTypeId, setEquipmentTypeId] = useState("")
  const [productPhotoUrl, setProductPhotoUrl] = useState("")
  const [nameplatePhotoUrl, setNameplatePhotoUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingNameplate, setIsUploadingNameplate] = useState(false)

  const handleProductPhotoRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setProductPhotoUrl("")
  }

  const handleNameplatePhotoRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setNameplatePhotoUrl("")
  }

  const onProductFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const compressed = await compressImage(file)
      const brandSlug = slugify(brandName || equipmentName || "equipment")
      const renamedFile = new File(
        [compressed],
        `${brandSlug}-product-${Date.now()}.webp`,
        { type: "image/webp" }
      )
      const res = await uploadFiles("brandImage", {
        files: [renamedFile]
      })
      if (res?.[0]) {
        setProductPhotoUrl(res[0].url)
        toast.success("Foto produk berhasil diunggah")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah foto produk")
    } finally {
      setIsUploading(false)
    }
  }

  const onNameplateFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingNameplate(true)
    try {
      const compressed = await compressImage(file)
      const brandSlug = slugify(brandName || equipmentName || "equipment")
      const renamedFile = new File(
        [compressed],
        `${brandSlug}-nameplate-${Date.now()}.webp`,
        { type: "image/webp" }
      )
      const res = await uploadFiles("nameplateImage", {
        files: [renamedFile]
      })
      if (res?.[0]) {
        setNameplatePhotoUrl(res[0].url)
        toast.success("Foto name plate berhasil diunggah")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah foto name plate")
    } finally {
      setIsUploadingNameplate(false)
    }
  }
  const [equipmentName, setEquipmentName] = useState("")
  const [category, setCategory] = useState("")
  const [deviceCategory, setDeviceCategory] = useState("")
  const [storeType, setStoreType] = useState("all") // "all" maps to null in DB
  const [calcMethod, setCalcMethod] = useState<CalcMethod>("STANDARD")
  const [calcDuration, setCalcDuration] = useState<number | "">("")
  const [operationType, setOperationType] = useState<OperationType>("STATIS")

  const [brandName, setBrandName] = useState("")
  const [area, setArea] = useState<"SALES" | "PARKING" | "TERRACE" | "WAREHOUSE">("SALES")
  const [profileDraft, setProfileDraft] = useState(emptyProfileDraft)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Statis equipment only has the standard formula (revision sheet V/X table).
  const changeOperationType = (value: OperationType) => {
    setOperationType(value)
    if (value === "STATIS") setCalcMethod("STANDARD")
  }

  const cycleSeconds =
    calcMethod === "STANDARD" || calcDuration === ""
      ? null
      : calcMethod === "BATCH"
        ? Number(calcDuration) * 60
        : Number(calcDuration)

  const isCreateMode = !equipment
  const isNewTypeSelected = equipmentTypeId === "new"

  const getAreaFromCategory = (cat: string) => {
    switch (cat) {
      case "SALES":
      case "BEANSPOT":
        return "SALES"
      case "PARKIRAN":
        return "PARKING"
      case "TERAS":
        return "TERRACE"
      case "GUDANG":
        return "WAREHOUSE"
      default:
        return "SALES"
    }
  }

  // Reset/populate fields on open/change
  useEffect(() => {
    if (!open) return

    if (equipment) {
      // Edit mode: Populate everything from the existing row
      setEquipmentTypeId(equipment.equipmentTypeId)
      setEquipmentName(equipment.equipmentName)
      setCategory(equipment.category)

      // Categories outside the fixed list come up empty so the admin picks one.
      setDeviceCategory(isDeviceCategory(equipment.deviceCategory) ? equipment.deviceCategory : "")

      setStoreType(equipment.storeType || "all")
      setCalcMethod((equipment.calcMethod || "STANDARD") as CalcMethod)
      setCalcDuration(
        equipment.calcMethod === "BATCH" && equipment.calcDuration
          ? equipment.calcDuration / 60
          : equipment.calcDuration ?? ""
      )
      setOperationType(resolveOperationType(equipment.operationType, equipment.calcMethod))

      setBrandName(equipment.brandName)
      setArea(equipment.area)
      setProfileDraft(profileDraftFromBrand(equipment))
      setProductPhotoUrl(equipment.productPhotoUrl || "")
      setNameplatePhotoUrl(equipment.nameplatePhotoUrl || "")
    } else {
      // Create mode: Empty fields
      setEquipmentTypeId("")
      setEquipmentName("")
      setCategory("")
      setDeviceCategory("")
      setStoreType("all")
      setCalcMethod("STANDARD")
      setCalcDuration("")
      setOperationType("STATIS")

      setBrandName("")
      setArea("SALES")
      setProfileDraft(emptyProfileDraft())
      setProductPhotoUrl("")
      setNameplatePhotoUrl("")
    }
  }, [open, equipment])

  // Watch for device category selection to filter/reset types
  const handleDeviceCategoryChange = (val: string) => {
    setDeviceCategory(val)
    // Reset type fields
    setEquipmentTypeId("")
    setEquipmentName("")
    setCategory("")
    setStoreType("all")
  }

  // Watch for equipment type selection in Create mode
  // to auto-fill (but keep read-only/hidden if selecting existing)
  const handleTypeChange = (val: string) => {
    setEquipmentTypeId(val)
    if (val !== "new" && val !== "") {
      const selectedType = equipmentTypeOptions.find((t) => t.id === val)
      if (selectedType) {
        setEquipmentName(selectedType.name)
        setCategory(selectedType.category)

        setDeviceCategory(
          isDeviceCategory(selectedType.deviceCategory) ? selectedType.deviceCategory : ""
        )

        setStoreType(selectedType.storeType || "all")
        setCalcMethod((selectedType.calcMethod || "STANDARD") as CalcMethod)
        setCalcDuration(
          selectedType.calcMethod === "BATCH" && selectedType.calcDuration
            ? selectedType.calcDuration / 60
            : selectedType.calcDuration ?? ""
        )
        setOperationType(resolveOperationType(selectedType.operationType, selectedType.calcMethod))
        // Auto-select brand area target based on category
        setArea(getAreaFromCategory(selectedType.category))
      }
    } else {
      setEquipmentName("")
      setCategory("")
      setStoreType("all")
      setCalcMethod("STANDARD")
      setCalcDuration("")
      setOperationType("STATIS")
    }
  }

  const handleCategoryChange = (val: string) => {
    setCategory(val)
    setArea(getAreaFromCategory(val))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const cleanBrandName = brandName.trim()
    if (!cleanBrandName) {
      toast.error("Nama merek wajib diisi")
      return
    }

    if (isCreateMode && !equipmentTypeId) {
      toast.error("Silakan pilih Tipe Equipment")
      return
    }

    const profile = resolveProfileDraft(profileDraft, operationType, calcMethod, cycleSeconds)
    if (profile.issues.length > 0) {
      toast.error(profileIssueMessage(profile.issues))
      return
    }

    // Validate type fields if we are creating a new type or updating (which updates type too)
    const needsTypeValidation = isNewTypeSelected || !isCreateMode
    const cleanEquipmentName = equipmentName.trim()
    const cleanCategory = category.trim()
    const cleanDeviceCategory = deviceCategory.trim()

    if (needsTypeValidation) {
      if (!cleanEquipmentName) {
        toast.error("Nama equipment wajib diisi")
        return
      }
      if (!cleanCategory) {
        toast.error("Area penempatan wajib diisi")
        return
      }
      if (!cleanDeviceCategory) {
        toast.error("Kategori jenis wajib diisi")
        return
      }
    }

    setIsSubmitting(true)

    try {
      const payload: Record<string, unknown> = {
        equipmentTypeId,
        brandName: cleanBrandName,
        area,
        ...profile.values,
        productPhotoUrl: productPhotoUrl || null,
        nameplatePhotoUrl: nameplatePhotoUrl || null,
      }

      if (needsTypeValidation) {
        payload.equipmentName = cleanEquipmentName
        payload.category = cleanCategory
        payload.deviceCategory = cleanDeviceCategory
        payload.storeType = storeType === "all" ? null : storeType
        payload.defaultKw = profile.values.baseKw // Opsi A: defaultKw disamakan dengan baseKw
        payload.calcMethod = calcMethod
        payload.operationType = operationType
        payload.calcDuration = cycleSeconds
      }

      const url = isCreateMode
        ? "/admin/master-data/equipment"
        : `/admin/master-data/equipment/${equipment.id}`
      const method = isCreateMode ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan data equipment")
      }

      toast.success(
        isCreateMode
          ? "Berhasil menambahkan merek equipment baru"
          : "Berhasil memperbarui data equipment"
      )
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan sistem"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter type options by selected deviceCategory
  const filteredTypeOptions = equipmentTypeOptions.filter(
    (t) => t.deviceCategory === deviceCategory
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-x-hidden overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{isCreateMode ? "Tambah Equipment" : "Ubah Equipment"}</DialogTitle>
            <DialogDescription>
              {isCreateMode
                ? "Pilih tipe alat, lalu isi merek dan profil dayanya."
                : "Ubah data tipe, merek, dan profil daya equipment ini."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-6">
            <FieldSet>
              <FieldLegend>Tipe alat</FieldLegend>
              <FieldGroup className="gap-4">
                {isCreateMode && (
                  <>
                    <Field>
                      <FieldLabel htmlFor="eq-device-category-top">Kategori *</FieldLabel>
                      <Select
                        value={deviceCategory}
                        onValueChange={handleDeviceCategoryChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id="eq-device-category-top" className="w-full">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEVICE_CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="eq-type-select">Tipe equipment *</FieldLabel>
                      <Select
                        value={equipmentTypeId}
                        onValueChange={handleTypeChange}
                        disabled={isSubmitting || !deviceCategory}
                      >
                        <SelectTrigger id="eq-type-select" className="w-full">
                          <SelectValue
                            placeholder={deviceCategory ? "Pilih tipe" : "Pilih kategori dulu"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Buat tipe baru</SelectItem>
                          {filteredTypeOptions.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Pilih tipe yang ada untuk menambah merek, atau buat tipe baru kalau
                        karakteristik dan metodenya berbeda.
                      </FieldDescription>
                    </Field>
                  </>
                )}

                {isCreateMode && equipmentTypeId && !isNewTypeSelected && (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl bg-muted px-4 py-3 text-sm">
                    <dt className="text-foreground/90">Karakteristik</dt>
                    <dd className="font-medium">{OPERATION_TYPE_LABELS[operationType]}</dd>
                    <dt className="text-foreground/90">Metode</dt>
                    <dd className="font-medium">
                      {CALC_METHOD_LABELS[calcMethod]}
                      {calcMethod !== "STANDARD" &&
                        `, ${calcDuration || 0} ${calcMethod === "TRANSACTION" ? "detik per transaksi" : "menit per batch"}`}
                    </dd>
                    <dt className="text-foreground/90">Area</dt>
                    <dd className="font-medium">{AREA_CATEGORY_LABELS[category] ?? (category || "-")}</dd>
                    <dd className="col-span-2 pt-1 text-xs text-foreground/90">
                      Karakteristik dan metode ikut tipe {equipmentName}. Ubah lewat tombol Ubah di
                      tabel kalau perlu.
                    </dd>
                  </dl>
                )}

                {!isCreateMode && (
                  <Field>
                    <FieldLabel htmlFor="eq-device-category">Kategori *</FieldLabel>
                    <Select
                      value={deviceCategory}
                      onValueChange={setDeviceCategory}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="eq-device-category" className="w-full">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEVICE_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {(isNewTypeSelected || !isCreateMode) && (
                  <>
                    <Field>
                      <FieldLabel htmlFor="eq-name">Nama tipe equipment *</FieldLabel>
                      <Input
                        id="eq-name"
                        placeholder="Contoh: Air Conditioner"
                        value={equipmentName}
                        onChange={(e) => setEquipmentName(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="eq-category">Area penempatan *</FieldLabel>
                        <Select
                          value={category}
                          onValueChange={handleCategoryChange}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id="eq-category" className="w-full">
                            <SelectValue placeholder="Pilih area" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(AREA_CATEGORY_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldDescription>Daftar area tempat alat ini muncul di form toko.</FieldDescription>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="eq-store-type">Khusus tipe toko</FieldLabel>
                        <Select value={storeType} onValueChange={setStoreType} disabled={isSubmitting}>
                          <SelectTrigger id="eq-store-type" className="w-full">
                            <SelectValue placeholder="Semua tipe toko" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua tipe toko</SelectItem>
                            {storeTypes.map((st) => (
                              <SelectItem key={st} value={st}>
                                {st}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="eq-operation-type">Karakteristik *</FieldLabel>
                        <Select
                          value={operationType}
                          onValueChange={(value) => changeOperationType(value as OperationType)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id="eq-operation-type" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STATIS">Statis</SelectItem>
                            <SelectItem value="DINAMIS">Dinamis</SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          {operationType === "STATIS"
                            ? "Daya tetap, contoh lampu. Selalu metode Standar."
                            : "Ada daya running dan standby, contoh kompresor."}
                        </FieldDescription>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="eq-calc-method">Metode *</FieldLabel>
                        <Select
                          value={calcMethod}
                          onValueChange={(value) => setCalcMethod(value as CalcMethod)}
                          disabled={isSubmitting || operationType === "STATIS"}
                        >
                          <SelectTrigger id="eq-calc-method" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STANDARD">Standar</SelectItem>
                            <SelectItem value="TRANSACTION">Transaksi</SelectItem>
                            <SelectItem value="BATCH">Batch</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    {calcMethod !== "STANDARD" && (
                      <Field>
                        <FieldLabel htmlFor="eq-calc-duration">
                          {calcMethod === "TRANSACTION" ? "Waktu per transaksi (detik) *" : "Waktu per batch (menit) *"}
                        </FieldLabel>
                        <Input
                          id="eq-calc-duration"
                          type="number"
                          min="1"
                          placeholder={calcMethod === "TRANSACTION" ? "Contoh: 60" : "Contoh: 15"}
                          value={calcDuration}
                          onChange={(e) =>
                            setCalcDuration(e.target.value === "" ? "" : Number(e.target.value))
                          }
                          disabled={isSubmitting}
                          required
                        />
                        <FieldDescription>
                          Lama alat bekerja untuk satu {calcMethod === "TRANSACTION" ? "transaksi" : "batch"}.
                        </FieldDescription>
                      </Field>
                    )}
                  </>
                )}
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Merek dan profil daya</FieldLegend>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="eq-brand-name">Nama merek *</FieldLabel>
                  <Input
                    id="eq-brand-name"
                    placeholder="Contoh: Daikin Thailand 1 PK"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </Field>
                <EnergyProfileFields
                  idPrefix="eq-profile"
                  draft={profileDraft}
                  onChange={setProfileDraft}
                  operationType={operationType}
                  calcMethod={calcMethod}
                  cycleSeconds={cycleSeconds}
                  disabled={isSubmitting}
                />
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Foto referensi</FieldLegend>
              <FieldDescription>
                Foto produk dan nameplate membantu anak toko mengenali alat di lapangan.
              </FieldDescription>
              <div className="grid grid-cols-2 gap-4">
                <PhotoSlot
                  id="product-photo-upload"
                  label="Foto produk"
                  url={productPhotoUrl}
                  uploading={isUploading}
                  disabled={isSubmitting}
                  onFile={onProductFileChange}
                  onRemove={handleProductPhotoRemove}
                />
                <PhotoSlot
                  id="nameplate-photo-upload"
                  label="Foto nameplate"
                  url={nameplatePhotoUrl}
                  uploading={isUploadingNameplate}
                  disabled={isSubmitting}
                  onFile={onNameplateFileChange}
                  onRemove={handleNameplatePhotoRemove}
                />
              </div>
            </FieldSet>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <IconLoader2 data-icon="inline-start" className="animate-spin" />}
              {isCreateMode ? "Tambah Equipment" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const AREA_CATEGORY_LABELS: Record<string, string> = {
  SALES: "Area Belanja",
  PARKIRAN: "Parkiran",
  TERAS: "Teras",
  GUDANG: "Gudang, Toilet & Selasar",
  BEANSPOT: "Beanspot",
}

function PhotoSlot({
  id,
  label,
  url,
  uploading,
  disabled,
  onFile,
  onRemove,
}: {
  id: string
  label: string
  url: string
  uploading: boolean
  disabled: boolean
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: (e: React.MouseEvent) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor={url ? undefined : id}>{label}</FieldLabel>
      {url ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
          <img src={url} alt={label} className="size-full object-cover" />
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            className="absolute top-2 right-2"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Hapus ${label.toLowerCase()}`}
          >
            <IconX />
          </Button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={cn(
            "flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-center text-sm transition-colors focus-within:ring-[3px] focus-within:ring-ring/50",
            uploading || disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          {uploading ? (
            <>
              <IconLoader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
              <span>Mengunggah...</span>
            </>
          ) : (
            <>
              {id === "product-photo-upload" ? (
                <IconPhoto className="size-5 text-foreground/70" aria-hidden="true" />
              ) : (
                <IconUpload className="size-5 text-foreground/70" aria-hidden="true" />
              )}
              <span className="font-medium">Pilih foto</span>
              <span className="text-xs text-foreground/80">Maks. 4 MB</span>
            </>
          )}
          <input
            id={id}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onFile}
            disabled={uploading || disabled}
          />
        </label>
      )}
    </Field>
  )
}
