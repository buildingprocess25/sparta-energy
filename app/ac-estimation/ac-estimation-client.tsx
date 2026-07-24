"use client"

import React, { useState, useTransition, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { toPng } from "html-to-image"
import { Header } from "@/components/header"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  IconAirConditioning,
  IconCalculator,
  IconMapPin,
  IconDownload,
  IconCheck,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { getTemperature } from "@/app/actions/get-temperature"
import { getRabData } from "@/app/actions/get-rab-data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { StoreCombobox } from "@/components/audit/store-combobox"
import type { StoreData } from "@/app/audit/start/start-client"
import { cn } from "@/lib/utils"
import type { MapPickerRef } from "@/components/ac-estimation/map-picker"
import {
  EstimationResultCard,
  type EstimationResultCardData,
} from "@/components/ac-estimation/estimation-result-card"
import { Thermometer } from "lucide-react"

const MapPicker = dynamic(
  () => import("@/components/ac-estimation/map-picker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border bg-muted/30">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <IconMapPin className="size-6 animate-pulse" />
          <span className="text-xs">Memuat Peta...</span>
        </div>
      </div>
    ),
  }
)

type AcEstimationClientProps = {
  stores: StoreData[]
}

export function AcEstimationClient({ stores }: AcEstimationClientProps) {
  // Refs
  const mapPickerRef = useRef<MapPickerRef>(null)
  const resultCardRef = useRef<HTMLDivElement>(null)

  // Store Selection States
  const [storeMode, setStoreMode] = useState<"existing" | "new">("existing")
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null)

  const [newStoreCode, setNewStoreCode] = useState("")
  const [newStoreName, setNewStoreName] = useState("")
  const [newStoreBranch, setNewStoreBranch] = useState("")

  const [ulokInput, setUlokInput] = useState("")
  const [isFetchingUlok, setIsFetchingUlok] = useState(false)
  const [fetchedRabData, setFetchedRabData] = useState(false)

  // Sales Area
  const [salesArea, setSalesArea] = useState<number | "">("")

  // Position States
  const [position, setPosition] = useState<[number, number]>([
    -6.22580230448837, 106.65713754808105,
  ]) // Default: Jakarta
  const [coordInput, setCoordInput] = useState(`${position[0]}, ${position[1]}`)

  // Sync position to input when Map is dragged
  useEffect(() => {
    setCoordInput(`${position[0]}, ${position[1]}`)
  }, [position])

  // Debounce coordinate input to map
  useEffect(() => {
    const parts = coordInput.split(",")
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim())
      const lng = parseFloat(parts[1].trim())
      if (!isNaN(lat) && !isNaN(lng)) {
        const handler = setTimeout(() => {
          setPosition([lat, lng])
        }, 500)
        return () => clearTimeout(handler)
      }
    }
  }, [coordInput])

  // UI / Logic States
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [result, setResult] = useState<{
    area: number
    maxTemp: number
    openMeteoTemp: number | null // dari Open-Meteo API
    clusterBtu: number
    totalBtu: number
    acUnits: number
  } | null>(null)

  const [mapSnapshot, setMapSnapshot] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [isResultOpen, setIsResultOpen] = useState(false)

  // Handle store selection and auto-fill sales area
  const handleStoreSelect = (store: StoreData | null) => {
    setSelectedStore(store)
    if (store && store.salesAreaM2) {
      setSalesArea(store.salesAreaM2)
    }
  }

  const handleSearchRab = async () => {
    if (!ulokInput) return
    setIsFetchingUlok(true)
    setErrorMsg(null)

    try {
      const res = await getRabData(ulokInput)
      if (res.error) {
        toast.error(res.error)
        setErrorMsg(res.error)
        return
      }

      if (res.data) {
        setNewStoreCode(res.data.nomor_ulok)
        setNewStoreName(res.data.nama_toko)
        setNewStoreBranch(res.data.cabang || "")
        if (
          res.data.luas_area_sales !== undefined &&
          !Number.isNaN(res.data.luas_area_sales)
        ) {
          setSalesArea(res.data.luas_area_sales)
        } else {
          setSalesArea("")
        }
        setFetchedRabData(true)
        toast.success("Data RAB berhasil dimuat.")
      }
    } catch (e) {
      toast.error("Terjadi kesalahan sistem saat mengambil data RAB.")
    } finally {
      setIsFetchingUlok(false)
    }
  }

  const handleCalculate = () => {
    // Validation
    if (storeMode === "existing" && !selectedStore) {
      setErrorMsg("Pilih toko terlebih dahulu.")
      return
    }

    if (storeMode === "new" && (!newStoreName || !newStoreBranch)) {
      setErrorMsg("Mohon lengkapi Nama Toko dan Cabang.")
      return
    }

    if (!salesArea || salesArea <= 0) {
      setErrorMsg("Luas area sales harus diisi dan lebih dari 0.")
      return
    }

    setErrorMsg(null)
    setResult(null)

    startTransition(async () => {
      const res = await getTemperature(
        position[0].toString(),
        position[1].toString()
      )

      if ("error" in res && res.error) {
        setErrorMsg(res.error.message)
        toast.warning(res.error.message)
        return
      }

      const openMeteoTemp = res.maxTemp as number
      const maxTemp = openMeteoTemp

      // Menentukan Cluster BTU
      let clusterBtu = 0
      if (maxTemp > 35) {
        clusterBtu = 751
      } else if (maxTemp >= 27 && maxTemp <= 35) {
        clusterBtu = 600
      } else {
        clusterBtu = 450
      }

      // Rumus User
      const area = Number(salesArea)
      const totalBtu = area * clusterBtu

      const rawQty = totalBtu / 18000
      const remainder = rawQty % 1

      // Jika desimal > 0.5 bulatkan ke atas, jika <= 0.5 bulatkan ke bawah
      let finalUnit = remainder > 0.5 ? Math.ceil(rawQty) : Math.floor(rawQty)

      // Minimal 1 unit jika area > 0
      if (finalUnit < 1) finalUnit = 1

      // Capture map snapshot right before showing result
      const snapshot = mapPickerRef.current?.captureSnapshot(position) ?? null
      setMapSnapshot(snapshot)

      setResult({
        area,
        maxTemp,
        openMeteoTemp,
        clusterBtu,
        totalBtu,
        acUnits: finalUnit,
      })
      setIsResultOpen(true)
    })
  }

  const handleSaveImage = async () => {
    if (!resultCardRef.current) return
    setIsSaving(true)
    try {
      const storeLabel =
        storeMode === "existing"
          ? (selectedStore?.code ?? "toko")
          : newStoreCode || "toko"
      const dataUrl = await toPng(resultCardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      })

      // Convert Base64 dataURL to Blob for iOS/Safari download compatibility
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.download = `estimasi-ac-${storeLabel}.png`
      link.href = blobUrl
      link.click()

      toast.success("Gambar hasil estimasi berhasil diunduh!")

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 100)
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengunduh gambar hasil estimasi.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header
        variant="dashboard-back"
        title="Hitung Kebutuhan AC"
        backHref="/dashboard"
        className="px-0"
      />

      <main className="mt-2 flex flex-col gap-6">
        {/* ── Store Picker ── */}
        <section className="flex flex-col gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-primary">
              Identitas Toko
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tentukan toko yang ingin dihitung kebutuhan AC-nya.
            </p>
          </div>

          <div className="flex rounded-lg bg-muted/50 p-1">
            <button
              onClick={() => setStoreMode("existing")}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-medium transition-all",
                storeMode === "existing"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Toko Terdaftar
            </button>
            <button
              onClick={() => setStoreMode("new")}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-medium transition-all",
                storeMode === "new"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Toko Baru
            </button>
          </div>

          {storeMode === "existing" ? (
            <div className="flex animate-in flex-col gap-3 fade-in slide-in-from-top-2">
              <StoreCombobox
                stores={stores}
                value={selectedStore}
                onSelect={handleStoreSelect}
              />
              {selectedStore && (
                <Card className="border-primary/10 bg-muted/30 shadow-none">
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                          Kode Toko
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {selectedStore.code}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                          Nama Toko
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {selectedStore.name}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                          Cabang
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {selectedStore.branch || "-"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex animate-in flex-col gap-3 fade-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="new_store_name">Nama Toko</FieldLabel>
                  <Input
                    id="new_store_name"
                    placeholder="Contoh: Supratman 2"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    className="bg-background text-xs"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="new_store_branch">Cabang</FieldLabel>
                  <Input
                    id="new_store_branch"
                    placeholder="Contoh: Cikokol"
                    value={newStoreBranch}
                    onChange={(e) => setNewStoreBranch(e.target.value)}
                    className="bg-background text-xs"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="new_store_code">Kode Toko <span className="text-muted-foreground font-normal">(Opsional)</span></FieldLabel>
                <Input
                  id="new_store_code"
                  placeholder="Contoh: T001 (Kosongkan jika belum ada)"
                  value={newStoreCode}
                  onChange={(e) => setNewStoreCode(e.target.value)}
                  className="bg-background text-xs"
                />
              </Field>
            </div>
          )}
        </section>

        <hr className="border-border/40" />

        <section className="flex flex-col gap-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-primary">
              Parameter Kalkulasi
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Inputkan luas area sales dan suhu luar toko.
            </p>
          </div>

          <div className="space-y-6">
            <Field>
              <FieldLabel htmlFor="sales_area">Luas Area Sales</FieldLabel>
              <div className="relative">
                <Input
                  id="sales_area"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={salesArea}
                  onChange={(e) =>
                    setSalesArea(e.target.value ? Number(e.target.value) : "")
                  }
                  className="bg-background/50 pr-12 focus:bg-background"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    m²
                  </span>
                </div>
              </div>
            </Field>



            <div className="space-y-3">
              <div className="space-y-1">
                <FieldLabel className="mb-0">
                  Suhu Otomatis Peta (Open-Meteo)
                </FieldLabel>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Suhu historis 1 tahun terakhir ditarik secara otomatis
                  berdasarkan koordinat toko pada peta.
                </p>
              </div>
              <Field>
                <FieldLabel
                  htmlFor="coord_input"
                  className="text-[10px] text-muted-foreground uppercase"
                >
                  Latitude, Longitude
                </FieldLabel>
                <Input
                  id="coord_input"
                  value={coordInput}
                  onChange={(e) => setCoordInput(e.target.value)}
                  placeholder="Contoh: -6.1702, 106.6403"
                  className="h-8 bg-background/50 text-xs"
                />
              </Field>
              <MapPicker
                ref={mapPickerRef}
                position={position}
                onChange={setPosition}
              />
            </div>
          </div>
        </section>

        <Drawer open={isResultOpen} onOpenChange={setIsResultOpen}>
          <DrawerContent className="px-4 pb-6">
            <DrawerHeader className="px-0 pt-6 text-left">
              <DrawerTitle className="text-lg font-semibold text-primary">
                Kebutuhan AC
              </DrawerTitle>
              <DrawerDescription>
                Kebutuhan pendinginan berdasarkan parameter toko.
              </DrawerDescription>
            </DrawerHeader>

            {result && (
              <div className="relative mt-2 mb-4 overflow-hidden rounded-2xl border bg-linear-to-br from-blue-50 to-indigo-50/30 p-5 shadow-sm dark:from-blue-950/20 dark:to-indigo-950/10">
                <div className="pointer-events-none absolute -top-4 -right-4 opacity-10">
                  <IconAirConditioning className="size-32" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        Suhu Tertinggi
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="size-4 text-orange-500" />
                        <span className="text-lg font-bold">
                          {result.maxTemp}°C
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        Beban Pendinginan
                      </p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {new Intl.NumberFormat("id-ID").format(result.totalBtu)}{" "}
                        <span className="text-xs font-normal">BTU</span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Rekomendasi Pemasangan
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black tracking-tight text-primary">
                        {result.acUnits}
                      </span>
                      <span className="mb-1.5 text-sm font-semibold text-primary/80">
                        Unit AC 2 PK
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                      Total beban pendinginan{" "}
                      {new Intl.NumberFormat("id-ID").format(result.totalBtu)}{" "}
                      BTU dibagi kapasitas 1 unit AC 2 PK (18.000 BTU)
                      menghasilkan rekomendasi {result.acUnits} unit.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DrawerFooter className="shrink-0 px-4 pt-4 pb-8">
              <Button
                onClick={handleSaveImage}
                disabled={isSaving || !result}
                variant="default"
                className="h-11 w-full"
              >
                <IconDownload className="mr-2 size-4" />
                {isSaving ? "Menyimpan..." : "Simpan Hasil"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="h-11 w-full">
                  Tutup
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 backdrop-blur">
        <div className="w-full max-w-sm">
          <Button
            onClick={handleCalculate}
            disabled={
              isPending ||
              !salesArea ||
              !coordInput ||
              (storeMode === "existing"
                ? !selectedStore
                : !newStoreCode || !newStoreName)
            }
            className="h-11 w-full shadow-lg"
          >
            <IconCalculator className="mr-2 size-5" />
            {isPending ? "Menghitung Estimasi..." : "Hitung Kebutuhan AC"}
          </Button>
        </div>
      </div>
      {/* Hidden result card for image capture */}
      {result && (
        <EstimationResultCard
          cardRef={resultCardRef}
          data={{
            storeCode:
              storeMode === "existing"
                ? (selectedStore?.code ?? "")
                : newStoreCode,
            storeName:
              storeMode === "existing"
                ? (selectedStore?.name ?? "")
                : newStoreName,
            storeBranch:
              storeMode === "existing"
                ? (selectedStore?.branch ?? "")
                : newStoreBranch,
            position,
            salesArea: result.area,
            maxTemp: result.maxTemp,
            openMeteoTemp: result.openMeteoTemp,
            clusterBtu: result.clusterBtu,
            totalBtu: result.totalBtu,
            acUnits: result.acUnits,
            mapSnapshot,
          }}
        />
      )}
    </div>
  )
}
