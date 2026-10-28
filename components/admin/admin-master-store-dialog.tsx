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
import { Checkbox } from "@/components/ui/checkbox"
import type { MasterStoreRow } from "@/lib/admin-master-data-queries"

type AdminMasterStoreDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  store?: MasterStoreRow | null // If null or undefined, we are in Create mode
  onSuccess?: () => void
}

export function AdminMasterStoreDialog({
  open,
  onOpenChange,
  store,
  onSuccess,
}: AdminMasterStoreDialogProps) {
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [branch, setBranch] = useState("")
  const [plnCustomerId, setPlnCustomerId] = useState("")
  const [type, setType] = useState("")
  const [is24Hours, setIs24Hours] = useState(false)
  const [openTime, setOpenTime] = useState("")
  const [closeTime, setCloseTime] = useState("")
  const [plnPowerVa, setPlnPowerVa] = useState<number | "">("")
  const [parkingAreaM2, setParkingAreaM2] = useState<number | "">("")
  const [terraceAreaM2, setTerraceAreaM2] = useState<number | "">("")
  const [salesAreaM2, setSalesAreaM2] = useState<number | "">("")
  const [warehouseAreaM2, setWarehouseAreaM2] = useState<number | "">("")
  const [toiletAreaM2, setToiletAreaM2] = useState<number | "">("")
  const [corridorAreaM2, setCorridorAreaM2] = useState<number | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset/populate fields when dialog opens/closes or store changes
  useEffect(() => {
    if (!open) return

    if (store) {
      setCode(store.code)
      setName(store.name)
      setBranch(store.branch || "")
      setPlnCustomerId(store.plnCustomerId || "")
      setType(store.type)
      setIs24Hours(store.is24Hours)
      setOpenTime(store.openTime || "")
      setCloseTime(store.closeTime || "")
      setPlnPowerVa(store.plnPowerVa)
      setParkingAreaM2(store.parkingAreaM2)
      setTerraceAreaM2(store.terraceAreaM2)
      setSalesAreaM2(store.salesAreaM2)
      setWarehouseAreaM2(store.warehouseAreaM2)
      setToiletAreaM2(store.toiletAreaM2)
      setCorridorAreaM2(store.corridorAreaM2)
    } else {
      setCode("")
      setName("")
      setBranch("")
      setPlnCustomerId("")
      setType("")
      setIs24Hours(false)
      setOpenTime("")
      setCloseTime("")
      setPlnPowerVa("")
      setParkingAreaM2("")
      setTerraceAreaM2("")
      setSalesAreaM2("")
      setWarehouseAreaM2("")
      setToiletAreaM2("")
      setCorridorAreaM2("")
    }
  }, [open, store])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const cleanCode = code.trim()
    const cleanName = name.trim()
    const cleanType = type.trim()

    if (!cleanCode) {
      toast.error("Kode toko wajib diisi")
      return
    }
    if (!cleanName) {
      toast.error("Nama toko wajib diisi")
      return
    }
    if (!cleanType) {
      toast.error("Tipe toko wajib diisi")
      return
    }

    if (!is24Hours && (!openTime || !closeTime)) {
      toast.error("Jam buka dan tutup wajib diisi untuk toko non-24 jam")
      return
    }

    const plnPower = Number(plnPowerVa)
    if (isNaN(plnPower) || plnPower < 0 || !Number.isInteger(plnPower)) {
      toast.error("Daya PLN harus berupa angka bulat 0 atau lebih")
      return
    }

    const parkArea = Number(parkingAreaM2)
    const terrArea = Number(terraceAreaM2)
    const slsArea = Number(salesAreaM2)
    const whArea = Number(warehouseAreaM2)
    const toiletArea = Number(toiletAreaM2)
    const corridorArea = Number(corridorAreaM2)

    if (
      [parkArea, terrArea, slsArea, whArea, toiletArea, corridorArea].some(
        (area) => isNaN(area) || area < 0
      )
    ) {
      toast.error("Semua luas area harus berupa angka 0 atau lebih")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        code: cleanCode,
        name: cleanName,
        branch: branch.trim() || null,
        plnCustomerId: plnCustomerId.trim() || null,
        type: cleanType,
        is24Hours,
        openTime: is24Hours ? null : openTime,
        closeTime: is24Hours ? null : closeTime,
        plnPowerVa: plnPower,
        parkingAreaM2: parkArea,
        terraceAreaM2: terrArea,
        salesAreaM2: slsArea,
        warehouseAreaM2: whArea,
        toiletAreaM2: toiletArea,
        corridorAreaM2: corridorArea,
      }

      const url = store
        ? `/admin/master-data/stores/${store.id}`
        : "/admin/master-data/stores"
      const method = store ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan data toko")
      }

      toast.success(
        store
          ? "Berhasil memperbarui data toko"
          : "Berhasil menambahkan toko baru"
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
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{store ? "Ubah Toko" : "Tambah Toko"}</DialogTitle>
            <DialogDescription>
              {store
                ? "Perbarui informasi detail untuk toko yang dipilih."
                : "Masukkan detail toko baru untuk ditambahkan ke master data."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="store-code">Kode Toko *</Label>
              <Input
                id="store-code"
                placeholder="Contoh: AKT1"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-name">Nama Toko *</Label>
              <Input
                id="store-name"
                placeholder="Contoh: Alfamart Kertajaya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-branch">Cabang</Label>
              <Input
                id="store-branch"
                placeholder="Contoh: HEAD OFFICE"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-pln-cust">ID Pelanggan PLN</Label>
              <Input
                id="store-pln-cust"
                placeholder="Contoh: 123456789012"
                value={plnCustomerId}
                onChange={(e) => setPlnCustomerId(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-type">Tipe Toko *</Label>
              <Input
                id="store-type"
                placeholder="Contoh: Beanspot atau Reguler"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-pln-power">Daya PLN (VA) *</Label>
              <Input
                id="store-pln-power"
                type="number"
                min="0"
                step="1"
                placeholder="Contoh: 33000"
                value={plnPowerVa}
                onChange={(e) =>
                  setPlnPowerVa(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="col-span-1 flex flex-col gap-2 rounded-lg border p-3 md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="store-24hours"
                  checked={is24Hours}
                  onCheckedChange={(checked) => setIs24Hours(checked === true)}
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="store-24hours"
                  className="font-medium cursor-pointer"
                >
                  Toko Operasional 24 Jam
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Jika diaktifkan, jam buka dan jam tutup akan diatur otomatis menjadi kosong.
              </p>
            </div>

            {!is24Hours && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="store-open">Jam Buka *</Label>
                  <Input
                    id="store-open"
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    disabled={isSubmitting}
                    required={!is24Hours}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-close">Jam Tutup *</Label>
                  <Input
                    id="store-close"
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    disabled={isSubmitting}
                    required={!is24Hours}
                  />
                </div>
              </>
            )}

            <div className="col-span-1 mt-2 border-t pt-2 md:col-span-2">
              <h3 className="text-sm font-semibold text-foreground">Luas Area (m²)</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Masukkan spesifikasi luas area dalam satuan meter persegi (m²).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-area-sales">Sales Area *</Label>
              <Input
                id="store-area-sales"
                type="number"
                min="0"
                step="any"
                placeholder="Contoh: 150"
                value={salesAreaM2}
                onChange={(e) =>
                  setSalesAreaM2(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-area-parking">Parkiran *</Label>
              <Input
                id="store-area-parking"
                type="number"
                min="0"
                step="any"
                placeholder="Contoh: 40"
                value={parkingAreaM2}
                onChange={(e) =>
                  setParkingAreaM2(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-area-terrace">Teras *</Label>
              <Input
                id="store-area-terrace"
                type="number"
                min="0"
                step="any"
                placeholder="Contoh: 20"
                value={terraceAreaM2}
                onChange={(e) =>
                  setTerraceAreaM2(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-area-warehouse">Gudang *</Label>
              <Input
                id="store-area-warehouse"
                type="number"
                min="0"
                step="any"
                placeholder="Contoh: 30"
                value={warehouseAreaM2}
                onChange={(e) =>
                  setWarehouseAreaM2(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-area-toilet">Toilet *</Label>
              <Input
                id="store-area-toilet"
                type="number"
                min="0"
                step="any"
                placeholder="Contoh: 4"
                value={toiletAreaM2}
                onChange={(e) =>
                  setToiletAreaM2(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-area-corridor">Selasar *</Label>
              <Input
                id="store-area-corridor"
                type="number"
                min="0"
                step="any"
                placeholder="Contoh: 12"
                value={corridorAreaM2}
                onChange={(e) =>
                  setCorridorAreaM2(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={isSubmitting}
                required
              />
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
              {store ? "Simpan Perubahan" : "Tambah Toko"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
