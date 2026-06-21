"use client"

import { useEffect, useState } from "react"
import { IconLoader2, IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import { toast } from "sonner"
import { cn, slugify } from "@/lib/utils"
import { uploadFiles } from "@/lib/uploadthing"
import { compressImage } from "@/lib/image-compression"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
  deviceCategories: string[]
  storeTypes: string[]
  onSuccess?: () => void
}

export function AdminMasterEquipmentDialog({
  open,
  onOpenChange,
  equipment,
  equipmentTypeOptions,
  categories,
  deviceCategories,
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
  const [selectDeviceCategory, setSelectDeviceCategory] = useState("")
  const [customDeviceCategory, setCustomDeviceCategory] = useState("")
  const [storeType, setStoreType] = useState("all") // "all" maps to null in DB
  const [defaultKw, setDefaultKw] = useState<number | "">("")

  const [brandName, setBrandName] = useState("")
  const [area, setArea] = useState<"SALES" | "PARKING" | "TERRACE" | "WAREHOUSE">("SALES")
  const [baseKw, setBaseKw] = useState<number | "">("")
  const [standbyKw, setStandbyKw] = useState<number | "">(0)
  const [runningKw, setRunningKw] = useState<number | "">(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isCreateMode = !equipment
  const isNewTypeSelected = equipmentTypeId === "new"

  const dbCategories = Array.from(new Set(deviceCategories))
    .map((c) => c.trim())
    .filter((c) => Boolean(c) && c !== "Lainnya")
    .sort((a, b) => a.localeCompare(b))

  const uniqueDeviceCategories = [...dbCategories, "Lainnya"]

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

      const devCat = equipment.deviceCategory || ""
      setDeviceCategory(devCat)
      if (uniqueDeviceCategories.includes(devCat)) {
        setSelectDeviceCategory(devCat)
        setCustomDeviceCategory("")
      } else {
        setSelectDeviceCategory(devCat ? "custom_input" : "")
        setCustomDeviceCategory(devCat)
      }

      setStoreType(equipment.storeType || "all")
      setDefaultKw(equipment.defaultKw)

      setBrandName(equipment.brandName)
      setArea(equipment.area)
      setBaseKw(equipment.baseKw)
      setStandbyKw(equipment.standbyKw)
      setRunningKw(equipment.runningKw)
      setProductPhotoUrl(equipment.productPhotoUrl || "")
      setNameplatePhotoUrl(equipment.nameplatePhotoUrl || "")
    } else {
      // Create mode: Empty fields
      setEquipmentTypeId("")
      setEquipmentName("")
      setCategory("")
      setDeviceCategory("")
      setSelectDeviceCategory("")
      setCustomDeviceCategory("")
      setStoreType("all")
      setDefaultKw("")

      setBrandName("")
      setArea("SALES")
      setBaseKw("")
      setStandbyKw(0)
      setRunningKw(0)
      setProductPhotoUrl("")
      setNameplatePhotoUrl("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, equipment])

  // Watch for device category selection to filter/reset types
  const handleDeviceCategoryChange = (val: string) => {
    setSelectDeviceCategory(val)
    if (val === "custom_input") {
      setDeviceCategory(customDeviceCategory)
    } else {
      setDeviceCategory(val)
      setCustomDeviceCategory("")
    }
    // Reset type fields
    setEquipmentTypeId("")
    setEquipmentName("")
    setCategory("")
    setStoreType("all")
    setDefaultKw("")
    setBaseKw("")
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

        const devCat = selectedType.deviceCategory || ""
        setDeviceCategory(devCat)
        if (uniqueDeviceCategories.includes(devCat)) {
          setSelectDeviceCategory(devCat)
          setCustomDeviceCategory("")
        } else {
          setSelectDeviceCategory(devCat ? "custom_input" : "")
          setCustomDeviceCategory(devCat)
        }

        setStoreType(selectedType.storeType || "all")
        setDefaultKw(selectedType.defaultKw)
        // Auto-fill baseKw with defaultKw of type for convenience
        setBaseKw(selectedType.defaultKw)
        // Auto-select brand area target based on category
        setArea(getAreaFromCategory(selectedType.category))
      }
    } else {
      setEquipmentName("")
      setCategory("")
      setStoreType("all")
      setDefaultKw("")
      setBaseKw("")
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
      toast.error("Nama brand wajib diisi")
      return
    }

    if (isCreateMode && !equipmentTypeId) {
      toast.error("Silakan pilih Tipe Equipment")
      return
    }

    if (baseKw === "" || isNaN(Number(baseKw)) || Number(baseKw) < 0) {
      toast.error("Base kW harus berupa angka 0 atau lebih")
      return
    }
    if (standbyKw !== "" && (isNaN(Number(standbyKw)) || Number(standbyKw) < 0)) {
      toast.error("Standby kW harus berupa angka 0 atau lebih")
      return
    }
    if (runningKw !== "" && (isNaN(Number(runningKw)) || Number(runningKw) < 0)) {
      toast.error("Running kW harus berupa angka 0 atau lebih")
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
        baseKw: Number(baseKw),
        standbyKw: standbyKw === "" ? 0 : Number(standbyKw),
        runningKw: runningKw === "" ? 0 : Number(runningKw),
        productPhotoUrl: productPhotoUrl || null,
        nameplatePhotoUrl: nameplatePhotoUrl || null,
      }

      if (needsTypeValidation) {
        payload.equipmentName = cleanEquipmentName
        payload.category = cleanCategory
        payload.deviceCategory = cleanDeviceCategory
        payload.storeType = storeType === "all" ? null : storeType
        payload.defaultKw = Number(baseKw) // Opsi A: defaultKw disamakan dengan baseKw
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
          ? "Berhasil menambahkan brand equipment baru"
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
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? "Tambah Equipment" : "Ubah Equipment"}
            </DialogTitle>
            <DialogDescription>
              {isCreateMode
                ? "Masukkan detail tipe dan brand equipment baru."
                : "Ubah data brand dan kategori untuk equipment."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* ── SECTION 1: Equipment Type ── */}
            {isCreateMode ? (
              <div className="space-y-4">
                {/* Kategori Jenis Select */}
                <div className="space-y-2">
                  <Label htmlFor="eq-device-category-top">Kategori Jenis *</Label>
                  <Select
                    value={selectDeviceCategory}
                    onValueChange={handleDeviceCategoryChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="eq-device-category-top">
                      <SelectValue placeholder="Pilih kategori jenis..." />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueDeviceCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom_input" className="font-semibold text-primary">
                        + Tulis Kategori Baru...
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {selectDeviceCategory === "custom_input" && (
                    <Input
                      id="eq-custom-device-category-top"
                      placeholder="Contoh: Pompa Air, Komputer, dll."
                      value={customDeviceCategory}
                      onChange={(e) => {
                        setCustomDeviceCategory(e.target.value)
                        setDeviceCategory(e.target.value)
                      }}
                      disabled={isSubmitting}
                      className="mt-2"
                      required
                    />
                  )}
                </div>

                {/* Tipe Equipment Select */}
                <div className="space-y-2">
                  <Label htmlFor="eq-type-select">Pilih Tipe Equipment *</Label>
                  <Select
                    value={equipmentTypeId}
                    onValueChange={handleTypeChange}
                    disabled={isSubmitting || !deviceCategory}
                  >
                    <SelectTrigger id="eq-type-select">
                      <SelectValue placeholder={deviceCategory ? "Pilih tipe..." : "Pilih kategori jenis dahulu"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new" className="font-semibold text-primary">
                        + Buat Tipe Baru...
                      </SelectItem>
                      {filteredTypeOptions.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                <span className="font-medium text-muted-foreground">ID Tipe:</span>{" "}
                <code className="font-mono">{equipmentTypeId}</code>
              </div>
            )}

            {/* Fields for Equipment Type (Shown if editing OR if creating new type) */}
            {(isNewTypeSelected || !isCreateMode) && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
                <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
                  Detail Tipe Equipment
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-name">Nama Tipe Equipment *</Label>
                  <Input
                    id="eq-name"
                    placeholder="Contoh: Air Conditioner"
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {!isCreateMode && (
                  <div className="space-y-2">
                    <Label htmlFor="eq-device-category">Kategori Jenis *</Label>
                    <Select
                      value={selectDeviceCategory}
                      onValueChange={(val) => {
                        setSelectDeviceCategory(val)
                        if (val === "custom_input") {
                          setDeviceCategory(customDeviceCategory)
                        } else {
                          setDeviceCategory(val)
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="eq-device-category">
                        <SelectValue placeholder="Pilih kategori jenis..." />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueDeviceCategories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom_input" className="font-semibold text-primary">
                          + Tulis Kategori Baru...
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {selectDeviceCategory === "custom_input" && (
                      <Input
                        id="eq-custom-device-category"
                        placeholder="Contoh: Pompa Air, Komputer, dll."
                        value={customDeviceCategory}
                        onChange={(e) => {
                          setCustomDeviceCategory(e.target.value)
                          setDeviceCategory(e.target.value)
                        }}
                        disabled={isSubmitting}
                        className="mt-2"
                        required
                      />
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="eq-category">Area Penempatan *</Label>
                  <Select
                    value={category}
                    onValueChange={handleCategoryChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="eq-category">
                      <SelectValue placeholder="Pilih area penempatan..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SALES">Area Belanja</SelectItem>
                      <SelectItem value="PARKIRAN">Parkiran</SelectItem>
                      <SelectItem value="TERAS">Teras</SelectItem>
                      <SelectItem value="GUDANG">Gudang/Toilet</SelectItem>
                      <SelectItem value="BEANSPOT">Beanspot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-store-type">Khusus Tipe Toko</Label>
                  <Select
                    value={storeType}
                    onValueChange={setStoreType}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="eq-store-type">
                      <SelectValue placeholder="Semua tipe toko..." />
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
                </div>
              </div>
            )}

            {/* ── SECTION 2: Brand Details ── */}
            <div className="border-t pt-3 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Detail Brand Equipment
              </div>

              <div className="space-y-2">
                <Label htmlFor="eq-brand-name">Nama Brand *</Label>
                <Input
                  id="eq-brand-name"
                  placeholder="Contoh: Daikin Thailand 1 PK"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eq-area">Area Penempatan *</Label>
                <Select
                  value={area}
                  onValueChange={(val) =>
                    setArea(val as "SALES" | "PARKING" | "TERRACE" | "WAREHOUSE")
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="eq-area">
                    <SelectValue placeholder="Pilih area..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALES">Area Belanja</SelectItem>
                    <SelectItem value="PARKING">Parkiran</SelectItem>
                    <SelectItem value="TERRACE">Teras</SelectItem>
                    <SelectItem value="WAREHOUSE">Gudang/Toilet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eq-base-kw">Base kW *</Label>
                <Input
                  id="eq-base-kw"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Contoh: 1.05"
                  value={baseKw}
                  onChange={(e) =>
                    setBaseKw(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  disabled={isSubmitting}
                  required
                />
              </div>              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="eq-standby-kw">Standby kW</Label>
                  <Input
                    id="eq-standby-kw"
                    type="number"
                    min="0"
                    step="any"
                    value={standbyKw}
                    onChange={(e) =>
                      setStandbyKw(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-running-kw">Running kW</Label>
                  <Input
                    id="eq-running-kw"
                    type="number"
                    min="0"
                    step="any"
                    value={runningKw}
                    onChange={(e) =>
                      setRunningKw(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* ── SECTION 3: Dokumentasi (UploadThing) ── */}
            <div className="border-t pt-3 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dokumentasi & Referensi
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Unggah foto produk dan foto name plate untuk referensi saat melakukan audit di lapangan.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Foto Produk */}
                <div className="space-y-1.5">
                  <Label htmlFor="product-photo-upload" className="text-muted-foreground text-[11px] font-medium">Foto Produk</Label>
                  {productPhotoUrl ? (
                    <div className="relative group border rounded-lg overflow-hidden min-h-[5.5rem] flex items-center justify-center bg-muted/20">
                      <img src={productPhotoUrl} alt="Foto Produk" className="absolute inset-0 size-full object-cover" />
                      <button
                        type="button"
                        onClick={handleProductPhotoRemove}
                        className="absolute top-1 right-1 size-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90 shadow-sm"
                        title="Hapus foto"
                      >
                        <IconX className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <label className={cn(
                      "flex flex-col items-center justify-center border border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/5 min-h-[5.5rem] transition-colors",
                      isUploading ? "cursor-not-allowed" : "cursor-pointer hover:bg-muted/10 hover:border-primary/40"
                    )}>
                      {isUploading ? (
                        <>
                          <IconLoader2 className="size-5 text-primary animate-spin mb-1" />
                          <span className="text-[10px] font-semibold text-muted-foreground text-center">Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <IconPhoto className="size-5 text-muted-foreground/50 mb-1" />
                          <span className="text-[10px] font-semibold text-muted-foreground text-center">Pilih Foto Produk</span>
                          <span className="text-[9px] text-muted-foreground/60 mt-0.5">Maks. 4MB</span>
                          <input
                            id="product-photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onProductFileChange}
                            disabled={isUploading || isSubmitting}
                          />
                        </>
                      )}
                    </label>
                  )}
                </div>

                {/* Foto Name Plate */}
                <div className="space-y-1.5">
                  <Label htmlFor="nameplate-photo-upload" className="text-muted-foreground text-[11px] font-medium">Foto Name Plate</Label>
                  {nameplatePhotoUrl ? (
                    <div className="relative group border rounded-lg overflow-hidden min-h-[5.5rem] flex items-center justify-center bg-muted/20">
                      <img src={nameplatePhotoUrl} alt="Foto Name Plate" className="absolute inset-0 size-full object-cover" />
                      <button
                        type="button"
                        onClick={handleNameplatePhotoRemove}
                        className="absolute top-1 right-1 size-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90 shadow-sm"
                        title="Hapus foto"
                      >
                        <IconX className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <label className={cn(
                      "flex flex-col items-center justify-center border border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/5 min-h-[5.5rem] transition-colors",
                      isUploadingNameplate ? "cursor-not-allowed" : "cursor-pointer hover:bg-muted/10 hover:border-primary/40"
                    )}>
                      {isUploadingNameplate ? (
                        <>
                          <IconLoader2 className="size-5 text-primary animate-spin mb-1" />
                          <span className="text-[10px] font-semibold text-muted-foreground text-center">Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <IconUpload className="size-5 text-muted-foreground/50 mb-1" />
                          <span className="text-[10px] font-semibold text-muted-foreground text-center">Pilih Foto Plate</span>
                          <span className="text-[9px] text-muted-foreground/60 mt-0.5">Maks. 4MB</span>
                          <input
                            id="nameplate-photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onNameplateFileChange}
                            disabled={isUploadingNameplate || isSubmitting}
                          />
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              )}
              {isCreateMode ? "Tambah Equipment" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
