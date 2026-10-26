"use client"

import React, { useState } from "react"
import {
  IconLayoutGrid,
  IconRuler,
  IconCheck,
  IconLayersLinked,
  IconBuildingStore,
  IconRotateRectangle,
  IconInfoCircle,
  IconChevronDown,
  IconChevronUp,
  IconDownload,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type {
  GypsumTileCalculationResult,
  GypsumOrientation,
} from "@/lib/gypsum-tile-calculator"

export interface GypsumTileResultCardProps {
  cardRef?: React.RefObject<HTMLDivElement | null>
  data: GypsumTileCalculationResult
  storeName?: string
  storeCode?: string
  isCalculated?: boolean
  onToggleOrientation?: (orient: GypsumOrientation) => void
  onDownload?: () => void
  isSaving?: boolean
}

export function GypsumTileResultCard({
  cardRef,
  data,
  storeName = "Denah Toko Standar",
  storeCode = "STORE-001",
  isCalculated = false,
  onToggleOrientation,
  onDownload,
  isSaving = false,
}: GypsumTileResultCardProps) {
  const [showBoqDetails, setShowBoqDetails] = useState(true)

  const {
    orientation,
    roomWidthM,
    roomLengthM,
    roomAreaM2,
    roomPerimeterM,
    xAxis,
    yAxis,
    totalFullTiles,
    borderTilesTopBottom,
    borderTilesLeftRight,
    cornerTiles,
    totalBorderTiles,
    totalTilesNeeded,
    safetyWasteTiles,
    totalTilesToOrder,
    boq,
  } = data

  const isHorizontal = orientation === "horizontal"

  return (
    <div
      ref={cardRef}
      className="space-y-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-xs text-foreground"
    >
      {/* Header Info: Rapi & Terstruktur */}
      <div className="pb-3 border-b border-border/60 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <IconLayoutGrid className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h3 className="text-sm font-bold tracking-tight truncate">
              Kalkulator Plafon Gypsum
            </h3>
          </div>
          <Badge
            className={`text-[10px] font-bold shrink-0 ${
              isCalculated
                ? "bg-emerald-600 text-white"
                : "bg-slate-500 text-white"
            }`}
          >
            {isCalculated ? "TERHITUNG OTOMATIS" : "SIAP DIHITUNG"}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground font-medium truncate">
          {storeCode} — {storeName}
        </p>

        {roomWidthM > 0 && roomLengthM > 0 && (
          <p className="text-[11px] font-mono text-muted-foreground/80">
            {roomWidthM}m x {roomLengthM}m ({roomAreaM2} m²)
          </p>
        )}
      </div>

      {!isCalculated ? (
        /* Ready State */
        <div className="space-y-3">
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 text-center space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Estimasi Kebutuhan Gypsum Tile (60x120 cm)
            </div>
            <div className="text-2xl font-black text-muted-foreground/60">
              — <span className="text-xs font-semibold text-muted-foreground">Lembar Panel</span>
            </div>
            <div className="text-[11px] font-medium text-muted-foreground">
              Sistem Rangka: <strong className="text-foreground font-semibold">Exposed T-Bar Grid</strong> (Potongan tepi &ge; 50%)
            </div>
          </div>

          <div className="p-3 rounded-xl border bg-muted/20 text-xs text-muted-foreground space-y-1.5">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <IconInfoCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
              Petunjuk Kalkulasi Plafon:
            </div>
            <p className="text-[11px] leading-relaxed">
              Pastikan denah toko sudah tertutup, lalu klik tombol <b>&quot;Hitung Layout Plafon Gypsum&quot;</b> di panel kiri untuk memetakan grid plafon dan menghitung kebutuhan material secara simetris.
            </p>
          </div>
        </div>
      ) : (
        /* Calculated Results: Rapi, Lega, Tidak Dempet */
        <div className="space-y-3.5">
          {/* Quick Metrics: Utuh vs Potongan */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5 text-center flex flex-col justify-between">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                Panel Utuh
              </span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 my-0.5">
                {totalFullTiles}
              </span>
              <span className="text-[9.5px] text-muted-foreground">
                {xAxis.fullTiles} kol x {yAxis.fullTiles} baris
              </span>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5 text-center flex flex-col justify-between">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                Panel Potongan
              </span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 my-0.5">
                {totalBorderTiles}
              </span>
              <span className="text-[9.5px] text-muted-foreground">
                {borderTilesTopBottom + borderTilesLeftRight} tepi + {cornerTiles} sudut
              </span>
            </div>
          </div>

          {/* Toggle Orientasi Bar */}
          {onToggleOrientation && (
            <div className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-muted/20 text-xs">
              <span className="text-muted-foreground font-medium text-[11px]">Arah Bentang Panel:</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onToggleOrientation(isHorizontal ? "vertical" : "horizontal")}
                className="h-6 text-[11px] font-semibold gap-1 px-2 cursor-pointer bg-background"
                title="Putar arah bentang panel 90 derajat"
              >
                <IconRotateRectangle className="size-3 text-emerald-600" />
                <span>{isHorizontal ? "Horizontal (1.2m X)" : "Vertikal (1.2m Y)"}</span>
              </Button>
            </div>
          )}

          {/* Bagian 1: Rincian Potongan Tepi (Layout Vertikal Bersih) */}
          <div className="rounded-xl border border-border/70 p-3 bg-muted/10 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-border/50">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <IconRuler className="size-3.5 text-sky-600 dark:text-sky-400" />
                Ukuran Potongan Tepi Dinding
              </span>
              <Badge
                variant="outline"
                className="text-[8.5px] font-bold border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 gap-0.5 px-1.5 py-0"
              >
                <IconCheck className="size-2.5" /> &ge; 50%
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              {/* Tepi Kiri & Kanan */}
              <div className="p-2 rounded-lg border border-border/50 bg-background/90 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-[11px] text-foreground">Tepi Kiri &amp; Kanan (Sumbu X)</span>
                  <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {xAxis.borderCutCm} cm
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Modul {xAxis.panelDimM} m</span>
                  <span className="font-medium text-foreground/80">
                    {Math.round(xAxis.borderCutRatio * 100)}% modul (&ge; {xAxis.minAllowedCutM * 100} cm)
                  </span>
                </div>
                {xAxis.isRevised && (
                  <p className="text-[9px] text-amber-600 dark:text-amber-400 italic pt-0.5 border-t border-border/30">
                    *1 panel utuh dikorbankan agar potongan tepi tidak kurang dari 50%.
                  </p>
                )}
              </div>

              {/* Tepi Depan & Belakang */}
              <div className="p-2 rounded-lg border border-border/50 bg-background/90 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-[11px] text-foreground">Tepi Depan &amp; Belakang (Sumbu Y)</span>
                  <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {yAxis.borderCutCm} cm
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Modul {yAxis.panelDimM} m</span>
                  <span className="font-medium text-foreground/80">
                    {Math.round(yAxis.borderCutRatio * 100)}% modul (&ge; {yAxis.minAllowedCutM * 100} cm)
                  </span>
                </div>
                {yAxis.isRevised && (
                  <p className="text-[9px] text-amber-600 dark:text-amber-400 italic pt-0.5 border-t border-border/30">
                    *1 panel utuh dikorbankan agar potongan tepi tidak kurang dari 50%.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bagian 2: Kebutuhan Material Panel Gyptile */}
          <div className="rounded-xl border border-border/70 p-3 bg-muted/10 space-y-2">
            <span className="text-xs font-bold flex items-center gap-1.5 pb-1 border-b border-border/50 text-foreground">
              <IconLayersLinked className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              Kebutuhan Panel Gyptile (60x120 cm)
            </span>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-0.5 text-muted-foreground">
                <span>Panel Utuh di Tengah</span>
                <span className="font-mono font-semibold text-foreground">{totalFullTiles} Lembar</span>
              </div>
              <div className="flex justify-between py-0.5 text-muted-foreground">
                <span>Potongan Tepi Depan &amp; Belakang</span>
                <span className="font-mono font-semibold text-foreground">{borderTilesTopBottom} Lembar</span>
              </div>
              <div className="flex justify-between py-0.5 text-muted-foreground">
                <span>Potongan Tepi Kiri &amp; Kanan</span>
                <span className="font-mono font-semibold text-foreground">{borderTilesLeftRight} Lembar</span>
              </div>
              {cornerTiles > 0 && (
                <div className="flex justify-between py-0.5 text-muted-foreground">
                  <span>Potongan 4 Sudut</span>
                  <span className="font-mono font-semibold text-foreground">{cornerTiles} Lembar</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-t border-border/40 text-muted-foreground font-medium">
                <span>Kebutuhan Bersih Terpasang</span>
                <span className="font-mono font-bold text-foreground">{totalTilesNeeded} Lembar</span>
              </div>
              <div className="flex justify-between py-0.5 text-muted-foreground text-[11px]">
                <span>Toleransi Potongan Tepi &amp; Waste</span>
                <span className="font-mono text-foreground font-semibold">
                  +{Math.max(0, totalTilesToOrder - totalTilesNeeded)} Lembar
                </span>
              </div>

              {/* Total Pengadaan Terstandar AHSP */}
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 mt-1">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Total Pengadaan Panel</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Standar AHSP 1.75 lembar/m²</span>
                </div>
                <span className="font-mono text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                  {totalTilesToOrder} Lembar
                </span>
              </div>
            </div>
          </div>

          {/* Bagian 3: Estimasi Rangka T-Bar & Aksesoris (AHSP) */}
          <div className="rounded-xl border border-border/70 p-3 bg-muted/10 space-y-2">
            <button
              type="button"
              onClick={() => setShowBoqDetails(!showBoqDetails)}
              className="w-full flex items-center justify-between text-xs font-bold text-foreground cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <IconBuildingStore className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                Rangka T-Bar &amp; Aksesoris (AHSP)
              </span>
              {showBoqDetails ? (
                <IconChevronUp className="size-3.5 text-muted-foreground" />
              ) : (
                <IconChevronDown className="size-3.5 text-muted-foreground" />
              )}
            </button>

            {showBoqDetails && (
              <div className="space-y-1.5 pt-1 border-t border-border/50 text-xs">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-2 rounded-lg border border-border/50 bg-background/90">
                    <div className="text-[10px] text-muted-foreground font-medium">Main Tee 3.6m</div>
                    <div className="font-mono font-bold text-foreground text-sm mt-0.5">
                      {boq.mainTeePcs} <span className="text-[10px] font-normal">Btg</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">~{boq.mainTeeTotalM} m</div>
                  </div>

                  <div className="p-2 rounded-lg border border-border/50 bg-background/90">
                    <div className="text-[10px] text-muted-foreground font-medium">Cross Tee 1.2m</div>
                    <div className="font-mono font-bold text-foreground text-sm mt-0.5">
                      {boq.crossTeePcs} <span className="text-[10px] font-normal">Btg</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">~{boq.crossTeeTotalM} m</div>
                  </div>

                  <div className="p-2 rounded-lg border border-border/50 bg-background/90">
                    <div className="text-[10px] text-muted-foreground font-medium">Wall Angle 3.0m</div>
                    <div className="font-mono font-bold text-foreground text-sm mt-0.5">
                      {boq.wallAnglePcs} <span className="text-[10px] font-normal">Btg</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">Keliling {roomPerimeterM}m</div>
                  </div>

                  <div className="p-2 rounded-lg border border-border/50 bg-background/90">
                    <div className="text-[10px] text-muted-foreground font-medium">Gantungan (Spring &amp; Bracket)</div>
                    <div className="font-mono font-bold text-foreground text-sm mt-0.5">
                      {boq.springAdjusterPcs || boq.rodHangerPcs} <span className="text-[10px] font-normal">Set</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">Koef. 0.7875 / m²</div>
                  </div>

                  <div className="p-2 rounded-lg border border-border/50 bg-background/90 col-span-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-muted-foreground font-medium">Kawat Penggantung Rod 3mm</div>
                        <div className="text-[9px] text-muted-foreground">Soft Galvanised (Koef. 0.3938 / m²)</div>
                      </div>
                      <div className="font-mono font-bold text-foreground text-sm">
                        {boq.galvanisedSuspRodPcs || Math.ceil(boq.rodHangerPcs * 0.5)} <span className="text-[10px] font-normal">Btg/Pcs</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-muted/40 border border-border/40 text-[10px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Catatan:</span> Kuantitas mengacu pada standar volume AHSP Jayaboard. Harga satuan bervariasi mengikuti pasar daerah.
                </div>
              </div>
            )}
          </div>

          {/* Tombol Unduh Hasil Plafon Gypsum */}
          <Button
            type="button"
            onClick={onDownload}
            disabled={!isCalculated || isSaving}
            className="w-full h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
          >
            <IconDownload className="mr-1.5 size-4" />
            {isSaving ? "Menyiapkan Gambar..." : "Unduh Hasil Plafon Gypsum (.png)"}
          </Button>
        </div>
      )}
    </div>
  )
}
