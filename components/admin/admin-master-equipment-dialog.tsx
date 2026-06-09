"use client"

import { useEffect, useState } from "react"
import { IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

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

  // Reset/populate fields on open/change
  useEffect(() => {
    if (!open) return

    const uniqueCats = Array.from(
      new Set([
        ...deviceCategories,
        "Pencahayaan",
        "Sistem HVAC",
        "Sistem Pendingin Produk",
        "Lainnya",
      ])
    ).map((c) => c.trim()).filter(Boolean)

    if (equipment) {
      // Edit mode: Populate everything from the existing row
      setEquipmentTypeId(equipment.equipmentTypeId)
      setEquipmentName(equipment.equipmentName)
      setCategory(equipment.category)
      
      const devCat = equipment.deviceCategory || ""
      setDeviceCategory(devCat)
      if (uniqueCats.includes(devCat)) {
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
    }
  }, [open, equipment, deviceCategories])

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
        const uniqueCats = Array.from(
          new Set([
            ...deviceCategories,
            "Pencahayaan",
            "Sistem HVAC",
            "Sistem Pendingin Produk",
            "Lainnya",
          ])
        ).map((c) => c.trim()).filter(Boolean)
        if (uniqueCats.includes(devCat)) {
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
      }
    } else {
      setEquipmentName("")
      setCategory("")
      setDeviceCategory("")
      setSelectDeviceCategory("")
      setCustomDeviceCategory("")
      setStoreType("all")
      setDefaultKw("")
      setBaseKw("")
    }
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
      if (defaultKw === "" || isNaN(Number(defaultKw)) || Number(defaultKw) < 0) {
        toast.error("Default kW harus berupa angka 0 atau lebih")
        return
      }
    }

    if (baseKw === "" || isNaN(Number(baseKw)) || Number(baseKw) < 0) {
      toast.error("Base kW harus berupa angka 0 atau lebih")
      return
    }
    if (standbyKw === "" || isNaN(Number(standbyKw)) || Number(standbyKw) < 0) {
      toast.error("Standby kW harus berupa angka 0 atau lebih")
      return
    }
    if (runningKw === "" || isNaN(Number(runningKw)) || Number(runningKw) < 0) {
      toast.error("Running kW harus berupa angka 0 atau lebih")
      return
    }

    setIsSubmitting(true)

    try {
      const payload: Record<string, unknown> = {
        equipmentTypeId,
        brandName: cleanBrandName,
        area,
        baseKw: Number(baseKw),
        standbyKw: Number(standbyKw),
        runningKw: Number(runningKw),
      }

      if (needsTypeValidation) {
        payload.equipmentName = cleanEquipmentName
        payload.category = cleanCategory
        payload.deviceCategory = cleanDeviceCategory
        payload.storeType = storeType === "all" ? null : storeType
        payload.defaultKw = Number(defaultKw)
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
              <div className="space-y-2">
                <Label htmlFor="eq-type-select">Pilih Tipe Equipment *</Label>
                <Select
                  value={equipmentTypeId}
                  onValueChange={handleTypeChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="eq-type-select">
                    <SelectValue placeholder="Pilih tipe..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new" className="font-semibold text-primary">
                      + Buat Tipe Baru...
                    </SelectItem>
                    {equipmentTypeOptions.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.deviceCategory} · {t.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <div className="text-xs font-semibold text-primary-foreground/90 uppercase tracking-wider">
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
                      {Array.from(
                        new Set([
                          ...deviceCategories,
                          "Pencahayaan",
                          "Sistem HVAC",
                          "Sistem Pendingin Produk",
                          "Lainnya",
                        ])
                      )
                        .map((c) => c.trim())
                        .filter(Boolean)
                        .map((c) => (
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

                <div className="space-y-2">
                  <Label htmlFor="eq-category">Area Penempatan *</Label>
                  <Select
                    value={category}
                    onValueChange={setCategory}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="eq-category">
                      <SelectValue placeholder="Pilih area penempatan..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SALES">SALES (Area Sales)</SelectItem>
                      <SelectItem value="PARKIRAN">PARKIRAN (Parkiran)</SelectItem>
                      <SelectItem value="TERAS">TERAS (Teras)</SelectItem>
                      <SelectItem value="GUDANG">GUDANG (Gudang, Toilet & Selasar)</SelectItem>
                      <SelectItem value="BEANSPOT">BEANSPOT (Beanspot)</SelectItem>
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

                <div className="space-y-2">
                  <Label htmlFor="eq-default-kw">Default kW *</Label>
                  <Input
                    id="eq-default-kw"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Contoh: 1.05"
                    value={defaultKw}
                    onChange={(e) =>
                      setDefaultKw(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    disabled={isSubmitting}
                    required
                  />
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
                    <SelectItem value="SALES">Sales (Area Belanja)</SelectItem>
                    <SelectItem value="PARKING">Parking (Parkiran)</SelectItem>
                    <SelectItem value="TERRACE">Terrace (Teras)</SelectItem>
                    <SelectItem value="WAREHOUSE">Warehouse (Gudang/Toilet)</SelectItem>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="eq-standby-kw">Standby kW *</Label>
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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-running-kw">Running kW *</Label>
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
                    required
                  />
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
