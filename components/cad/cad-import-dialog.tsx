"use client"

import React, { useState, useRef } from "react"
import {
  IconUpload,
  IconFileCode,
  IconCheck,
  IconAlertCircle,
  IconBuildingStore,
  IconSparkles,
  IconX,
  IconDoor,
  IconShoppingCart,
  IconFridge,
  IconRuler,
} from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { parseDxfStoreLayout, type ParsedCadStoreData } from "@/lib/cad/dxf-parser"

interface CadImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplyCadLayout: (cadData: ParsedCadStoreData) => void
}

export function CadImportDialog({
  open,
  onOpenChange,
  onApplyCadLayout,
}: CadImportDialogProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedCadStoreData | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileProcess = (file: File) => {
    setErrorMessage("")
    setFileName(file.name)

    if (!file.name.toLowerCase().endsWith(".dxf")) {
      setErrorMessage("Format berkas harus .DXF (AutoCAD Drawing Exchange Format). Silakan ekspor/simpan gambar AutoCAD Anda sebagai .dxf.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        if (!content) throw new Error("Berkas kosong atau tidak dapat dibaca.")

        const result = parseDxfStoreLayout(content, file.name)
        setParsedData(result)
        toast.success(`Berhasil memproses denah CAD: ${file.name}`)
      } catch (err: any) {
        console.error("CAD DXF parsing error:", err)
        setErrorMessage(err.message || "Gagal memproses berkas DXF. Pastikan berkas tidak rusak.")
      }
    }
    reader.onerror = () => {
      setErrorMessage("Gagal membaca file dari perangkat.")
    }
    reader.readAsText(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileProcess(file)
  }

  const handleApply = () => {
    if (!parsedData) return
    onApplyCadLayout(parsedData)
    onOpenChange(false)
    toast.success("Denah CAD dan zona toko berhasil diterapkan ke kanvas!")
  }

  const handleReset = () => {
    setParsedData(null)
    setFileName("")
    setErrorMessage("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
            <IconFileCode className="size-6" />
            <DialogTitle className="text-lg font-bold">
              Import Denah Toko AutoCAD (.DXF)
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Unggah gambar denah toko berformat <strong>.DXF</strong> untuk mendeteksi dinding, pintu (pv180, P1), kasir (ANSI32), dan chiller (ANSI37) secara otomatis dengan skala riil 1:1.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* File Upload Zone */}
          {!parsedData && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                isDragging
                  ? "border-sky-500 bg-sky-500/10 scale-[0.99]"
                  : "border-border/80 hover:border-sky-500/60 hover:bg-muted/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".dxf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileProcess(file)
                }}
              />
              <div className="size-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <IconUpload className="size-6 animate-bounce" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Klik atau Seret Berkas .DXF ke Sini
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mendukung AutoCAD R12, 2000, 2013, 2018, hingga versi terbaru
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/40 text-destructive text-xs flex items-start gap-2">
              <IconAlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Peringatan Berkas CAD:</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Parsed Inspection Results */}
          {parsedData && (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
              {/* File summary header */}
              <div className="p-3 rounded-xl bg-muted/40 border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconBuildingStore className="size-4 text-sky-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground truncate max-w-[340px]">
                      {fileName || "Berkas CAD"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {parsedData.rawSummary.lineCount} Garis Dinding • {parsedData.rawSummary.insertCount} Blok Pintu • {parsedData.rawSummary.hatchCount} Zona Terdeteksi
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleReset}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <IconX className="size-3.5 mr-1" /> Ganti Berkas
                </Button>
              </div>

              {/* Metric grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl border bg-card flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                    <IconRuler className="size-3 text-sky-500" /> Dimensi Riil
                  </span>
                  <span className="text-sm font-extrabold text-foreground mt-0.5 font-mono">
                    {parsedData.dimensions.lengthM}m × {parsedData.dimensions.widthM}m
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Luas: {parsedData.metrics.grossArea} m²
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border bg-card flex flex-col">
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium flex items-center gap-1">
                    <IconFridge className="size-3" /> Area Chiller
                  </span>
                  <span className="text-sm font-extrabold text-cyan-700 dark:text-cyan-300 mt-0.5 font-mono">
                    {parsedData.metrics.chillerArea > 0 ? `${parsedData.metrics.chillerArea} m²` : "0 m²"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {parsedData.zones.chiller ? `${parsedData.zones.chiller.bounds.width.toFixed(1)}m × ${parsedData.zones.chiller.bounds.height.toFixed(1)}m` : "Tidak ada"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border bg-card flex flex-col">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <IconShoppingCart className="size-3" /> Area Kasir
                  </span>
                  <span className="text-sm font-extrabold text-amber-700 dark:text-amber-300 mt-0.5 font-mono">
                    {parsedData.metrics.cashierArea > 0 ? `${parsedData.metrics.cashierArea} m²` : "0 m²"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {parsedData.zones.cashier ? `${parsedData.zones.cashier.bounds.width.toFixed(1)}m × ${parsedData.zones.cashier.bounds.height.toFixed(1)}m` : "Tidak ada"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex flex-col">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                    <IconSparkles className="size-3" /> Luas Efektif Sales
                  </span>
                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5 font-mono">
                    {parsedData.metrics.netSalesArea} m²
                  </span>
                  <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                    Gross - Mati
                  </span>
                </div>
              </div>

              {/* Zones and SOP Wall status preview */}
              <div className="p-3 rounded-xl border bg-muted/20 space-y-2">
                <span className="text-[11px] font-bold text-foreground block">
                  Klasifikasi Dinding & SOP Penempatan AC:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-700 dark:text-orange-300">
                    <IconDoor className="size-4 shrink-0 text-orange-500" />
                    <div className="truncate">
                      <span className="font-bold">Dinding Depan / Kaca:</span>
                      <p className="text-[10px] text-muted-foreground truncate">Dilarang pasang AC (Pintu pv180)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300">
                    <IconFridge className="size-4 shrink-0 text-cyan-500" />
                    <div className="truncate">
                      <span className="font-bold">Dinding Belakang (Chiller):</span>
                      <p className="text-[10px] text-muted-foreground truncate">Dilarang pasang AC di atas chiller</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300">
                    <IconCheck className="size-4 shrink-0 text-sky-500" />
                    <div className="truncate">
                      <span className="font-bold">Dinding Kiri & Kanan:</span>
                      <p className="text-[10px] text-muted-foreground truncate">Dinding solid aman untuk unit indoor</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                    <IconShoppingCart className="size-4 shrink-0 text-amber-500" />
                    <div className="truncate">
                      <span className="font-bold">Zona Kasir:</span>
                      <p className="text-[10px] text-muted-foreground truncate">Dilarang pasang AC di atas area kasir</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Tutup
          </Button>

          {parsedData && (
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs gap-1.5 shadow-sm"
            >
              <IconCheck className="size-3.5" />
              Terapkan ke Kanvas AC
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
