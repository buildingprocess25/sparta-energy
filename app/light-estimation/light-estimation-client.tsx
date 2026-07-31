"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { IconBulb, IconArrowLeft, IconRefresh, IconGrid3x3, IconPolygon, IconSquare, IconChevronRight, IconDownload, IconInfoCircle, IconCheck, IconEdit, IconTrash, IconX, IconPointer, IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react"
import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StoreCombobox } from "@/components/audit/store-combobox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toPng } from "html-to-image"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { getRabData } from "@/app/actions/get-rab-data"
import { LightEstimationResultCard, type LightEstimationResultCardData } from "@/components/audit/light-estimation-result-card"
import {
  calcSimetris,
  calcLampRange,
  generateGridPositions,
  placeLamps,
  offsetPolygon,
  buildPolygon,
  getScaleInfo,
  calcIregular,
  generateRectPolygon,
  generateLShapePolygon,
  generateCutoutPolygon,
  LAMP_WATT,
  LAMP_LEN,
  LAMP_TUBE_W
} from "@/lib/lamp-calculator"
import { calcPolygonArea, Point } from "@/lib/polygon-utils"
import type { StoreData } from "@/app/audit/start/start-client"

interface LightEstimationClientProps {
  stores: StoreData[]
}

function getClosestPointOnSegment(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
) {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return { x: ax, y: ay, dist: Math.hypot(px - ax, py - ay), t: 0 }

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))

  const closestX = ax + t * dx
  const closestY = ay + t * dy
  const dist = Math.hypot(px - closestX, py - closestY)

  return { x: closestX, y: closestY, dist, t }
}

const CANVAS_H = 340
const FIXED_SCALE = 24 // px/m for custom drawing
const FIXED_OX = 30    // X offset for origin
const FIXED_OY = 30    // Y offset for origin

const SHAPES = [
  { id: "custom", label: "Custom Canvas (Preset / Gambar)" },
  { id: "rect", label: "Kotak Tidak Simetris" },
  { id: "trap", label: "Trapesium" },
  { id: "L", label: "Bentuk L" },
]

interface StandardCheckResult {
  overallStatus: "ideal" | "toleransi" | "diluar"
  isAllOk: boolean
  isToleransi: boolean
  rasioStatus: "ok" | "low" | "high"
  sampingStatus: "ok" | "near" | "far"
  barisStatus: "ok" | "wide"
  issues: string[]
  statusLabel: string
}

function checkStandards(rasio: number, jarakSamping: number, jarakBaris: number): StandardCheckResult {
  const issues: string[] = []

  let rasioStatus: "ok" | "low" | "high" = "ok"
  if (rasio < 4.0) {
    rasioStatus = "low"
    issues.push(`Kerapatan daya (${rasio.toFixed(2)} W/m²) di bawah target ideal (4.0 W/m²).`)
  } else if (rasio > 5.0) {
    rasioStatus = "high"
    issues.push(`Kerapatan daya (${rasio.toFixed(2)} W/m²) di atas target ideal (5.0 W/m²).`)
  }

  let sampingStatus: "ok" | "near" | "far" = "ok"
  if (jarakSamping < 0.3) {
    sampingStatus = "near"
    issues.push(`Jarak samping (${jarakSamping.toFixed(2)}m) < 0.3m — posisi mepet dinding.`)
  } else if (jarakSamping > 0.6) {
    sampingStatus = "far"
    issues.push(`Jarak samping (${jarakSamping.toFixed(2)}m) > 0.6m — rak samping berpotensi redup.`)
  }

  let barisStatus: "ok" | "wide" = "ok"
  if (jarakBaris > 1.9) {
    barisStatus = "wide"
    issues.push(`Jarak antar baris (${jarakBaris.toFixed(2)}m) > 1.9m — penyebaran kurang merata.`)
  }

  const isIdeal = rasioStatus === "ok" && sampingStatus === "ok" && barisStatus === "ok"

  // Batas toleransi wajar untuk penyesuaian denah toko
  const rasioInTolerance = rasio >= 3.5 && rasio <= 5.5
  const sampingInTolerance = jarakSamping >= 0.2 && jarakSamping <= 0.8
  const barisInTolerance = jarakBaris <= 2.2

  const isToleransi = !isIdeal && rasioInTolerance && sampingInTolerance && barisInTolerance

  let overallStatus: "ideal" | "toleransi" | "diluar" = "diluar"
  let statusLabel = "Di Luar Standar"

  if (isIdeal) {
    overallStatus = "ideal"
    statusLabel = "Standar Ideal"
  } else if (isToleransi) {
    overallStatus = "toleransi"
    statusLabel = "Standar Toleransi"
  }

  return {
    overallStatus,
    isAllOk: isIdeal,
    isToleransi,
    rasioStatus,
    sampingStatus,
    barisStatus,
    issues,
    statusLabel
  }
}

export function LightEstimationClient({ stores }: LightEstimationClientProps) {
  const { resolvedTheme } = useTheme()
  // Common states
  const [activeTab, setActiveTab] = useState<string>("tidak-simetris")
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null)
  const [storeMode, setStoreMode] = useState<"existing" | "new">("existing")
  const [newStoreCode, setNewStoreCode] = useState("")
  const [newStoreName, setNewStoreName] = useState("")
  const [newStoreBranch, setNewStoreBranch] = useState("")
  const [newStoreArea, setNewStoreArea] = useState("")
  const [ulokInput, setUlokInput] = useState("")
  const [isFetchingUlok, setIsFetchingUlok] = useState(false)
  const [fetchedRabData, setFetchedRabData] = useState(false)
  const [lampLen, setLampLen] = useState<number>(1.22)
  const [isSaving, setIsSaving] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const exportCardRef = useRef<HTMLDivElement | null>(null)

  // ── Preset Shape Dialog States & Handlers ──
  const [presetModalOpen, setPresetModalOpen] = useState(false)
  const [presetType, setPresetType] = useState<"rect" | "L" | "cutout">("rect")
  const [presetRectForm, setPresetRectForm] = useState({ lebar: "8", panjang: "10" })
  const [presetLForm, setPresetLForm] = useState({ p: "10", l: "8", w: "5", h: "4" })
  const [presetCutoutForm, setPresetCutoutForm] = useState({ p: "10", l: "8", cutoutW: "2", cutoutH: "3" })

  // ── Manual Overrides & Visibility States ──
  const [showDimensions, setShowDimensions] = useState(true)
  const [simOverrideBaris, setSimOverrideBaris] = useState<number | null>(null)
  const [simOverrideLpb, setSimOverrideLpb] = useState<number | null>(null)
  const [simDisabledLamps, setSimDisabledLamps] = useState<number[]>([])
  const [irregOverrideBaris, setIrregOverrideBaris] = useState<number | null>(null)
  const [irregOverrideLpb, setIrregOverrideLpb] = useState<number | null>(null)
  const [irregDisabledLamps, setIrregDisabledLamps] = useState<number[]>([])

  const isSvgDark = resolvedTheme === "dark" && !isSaving

  // ── Symmetrical Mode States ──
  const [simForm, setSimForm] = useState({ lebar: "", panjang: "", area: "" })
  const [autoArea, setAutoArea] = useState(true)
  const [simResult, setSimResult] = useState<any>(null)

  // ── Shared Store & Symmetrical Handlers ──
  const handleStoreSelectShared = (store: StoreData | null) => {
    setSelectedStore(store)
    if (store) {
      const areaVal = store.salesAreaM2.toString()
      setSimForm(prev => {
        const next = { ...prev, area: areaVal }
        const l = parseFloat(prev.lebar)
        const p = parseFloat(prev.panjang)
        if (!isNaN(l) && !isNaN(p) && autoArea) {
          next.area = (l * p).toFixed(2)
        }
        return next
      })
    } else {
      setSimForm(prev => ({ ...prev, area: "" }))
    }
  }

  const handleSearchRab = async () => {
    if (!ulokInput) return
    setIsFetchingUlok(true)
    try {
      const res = await getRabData(ulokInput)
      if (res.error) {
        toast.error(res.error)
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
          const areaVal = res.data.luas_area_sales.toString()
          setNewStoreArea(areaVal)
          setSimForm(prev => {
            const next = { ...prev, area: areaVal }
            const l = parseFloat(prev.lebar)
            const p = parseFloat(prev.panjang)
            if (!isNaN(l) && !isNaN(p) && autoArea) {
              next.area = (l * p).toFixed(2)
            }
            return next
          })
        } else {
          setNewStoreArea("")
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

  const handleSimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSimForm(prev => {
      const next = { ...prev, [name]: value }
      if (autoArea && (name === "lebar" || name === "panjang")) {
        const l = parseFloat(name === "lebar" ? value : prev.lebar)
        const p = parseFloat(name === "panjang" ? value : prev.panjang)
        if (!isNaN(l) && !isNaN(p)) {
          next.area = (l * p).toFixed(2)
        }
      }
      return next
    })
  }

  const handleSimCalc = () => {
    const lebar = parseFloat(simForm.lebar)
    const panjang = parseFloat(simForm.panjang)
    const area = parseFloat(simForm.area)
    if (!lebar || !panjang || !area) return
    const res = calcSimetris(lebar, panjang, area, LAMP_WATT, lampLen)
    const range = res ? { minLamps: res.minLamps, maxLamps: res.maxLamps } : calcLampRange(area)
    if (!res) {
      setSimResult({ error: true, range, lebar, panjang, area })
      return
    }
    setSimResult({ ...res, range, lebar, panjang, area })
    setSimOverrideBaris(null)
    setSimOverrideLpb(null)
    setSimDisabledLamps([])
  }

  const simCanCalc = simForm.lebar && simForm.panjang && simForm.area

  const activeSimBaris = simOverrideBaris !== null ? simOverrideBaris : (simResult && !simResult.error ? simResult.baris : 0)
  const activeSimLpb = simOverrideLpb !== null ? simOverrideLpb : (simResult && !simResult.error ? simResult.lampuPerbaris : 0)

  const activeSimJarakPerbaris = (simResult && !simResult.error) ? (simResult.panjang / (activeSimBaris + 1)) : 0
  const activeSimJarakSamping = (simResult && !simResult.error) ? ((simResult.lebar - activeSimLpb * lampLen) / 2) : 0

  const simPositions = simResult && !simResult.error
    ? generateGridPositions(simResult.lebar, simResult.panjang, activeSimBaris, activeSimLpb, lampLen).positions
    : []

  const activeSimTotalLamps = simPositions.length - simDisabledLamps.filter(idx => idx < simPositions.length).length
  const activeSimRasio = (simResult && !simResult.error && simResult.area > 0)
    ? (activeSimTotalLamps * LAMP_WATT) / simResult.area
    : 0

  const simCheck = useMemo(() => {
    return checkStandards(activeSimRasio, activeSimJarakSamping, activeSimJarakPerbaris)
  }, [activeSimRasio, activeSimJarakSamping, activeSimJarakPerbaris])

  const handleSimLampToggle = (idx: number) => {
    setSimDisabledLamps(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx)
      } else {
        return [...prev, idx]
      }
    })
  }

  const SVG_W = 340, SVG_H = 200, PAD = 24
  const scaleX = simResult ? (SVG_W - PAD * 2) / simResult.lebar : 1
  const scaleY = simResult ? (SVG_H - PAD * 2) / simResult.panjang : 1



  // ── Symmetrical StatBox Component ──
  const StatBox = ({
    label,
    subLabel,
    value,
    unit,
    variant = "default"
  }: {
    label: string,
    subLabel?: string,
    value: any,
    unit: string,
    variant?: "default" | "success" | "warning" | "info"
  }) => {
    let cardCls = "border-border/80 bg-muted/30"
    let textCls = "text-foreground"

    if (variant === "success") {
      cardCls = "border-emerald-500/25 bg-emerald-50/40 dark:bg-emerald-950/15"
      textCls = "text-emerald-700 dark:text-emerald-400"
    } else if (variant === "info") {
      cardCls = "border-sky-500/25 bg-sky-50/40 dark:bg-sky-950/15"
      textCls = "text-sky-700 dark:text-sky-400"
    } else if (variant === "warning") {
      cardCls = "border-amber-500/25 bg-amber-50/40 dark:bg-amber-950/15"
      textCls = "text-amber-700 dark:text-amber-400"
    }

    const valStr = String(value)
    let fontSizeCls = "text-xl sm:text-2xl"
    if (valStr.length > 8) {
      fontSizeCls = "text-sm tracking-tighter"
    } else if (valStr.length > 5) {
      fontSizeCls = "text-lg tracking-tight"
    }

    return (
      <div className={`rounded-xl border p-3 text-center flex flex-col items-center justify-between transition-colors duration-300 ${cardCls}`}>
        <div className="text-[10.5px] font-extrabold text-muted-foreground uppercase tracking-tight leading-tight flex flex-col justify-center items-center min-h-[28px] text-center">
          <span>{label}</span>
          {subLabel && <span className="text-[10px] font-bold text-muted-foreground/80">{subLabel}</span>}
        </div>
        <div className={`font-black mt-1.5 ${fontSizeCls} ${textCls} flex items-baseline justify-center gap-0.5`}>
          {value}<span className="text-xs font-bold text-muted-foreground/90 ml-0.5">{unit}</span>
        </div>
      </div>
    )
  }

  // ── SmartSuggestions Component ──
  const SmartSuggestions = ({ rasio, check }: { rasio: number; check: StandardCheckResult }) => {
    const [isOpen, setIsOpen] = useState(false)
    if (check.overallStatus === "ideal") return null

    if (check.overallStatus === "toleransi") {
      return (
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-2.5 text-[11px] leading-relaxed text-sky-900 dark:text-sky-300 space-y-1.5 mt-3 transition-all duration-200">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between font-bold text-xs text-sky-700 dark:text-sky-400 focus:outline-hidden"
          >
            <span className="flex items-center gap-1.5">
              🔵 Penyesuaian Layout Denah Toko
            </span>
            <span className="text-[10px] text-sky-600 dark:text-sky-300 underline font-normal">
              {isOpen ? "Sembunyikan" : "Tampilkan"}
            </span>
          </button>
          {isOpen && (
            <div className="border-t border-sky-500/10 pt-2 animate-in fade-in slide-in-from-top-1 duration-200 space-y-1.5">
              <p>
                Kerapatan daya saat ini adalah <span className="font-bold">{rasio.toFixed(2)} W/m²</span>. Konfigurasi ini merupakan <b>tata letak paling optimal (best effort)</b> yang disesuaikan dengan geometri denah toko.
              </p>
              <p className="text-[10.5px] text-muted-foreground">
                Meskipun nilainya sedikit bergeser dari acuan ideal (4.0 - 5.0 W/m²), mengubah jumlah baris justru berpotensi memperburuk kerataan pencahayaan atau membuat area gelap.
              </p>
            </div>
          )}
        </div>
      )
    }

    const isOver = rasio > 5.0
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300 space-y-1.5 mt-3 transition-all duration-200">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between font-bold text-xs text-amber-700 dark:text-amber-400 focus:outline-hidden"
        >
          <span className="flex items-center gap-1.5">
            💡 Rekomendasi Solusi Pintar
          </span>
          <span className="text-[10px] text-amber-600 dark:text-amber-300 underline font-normal">
            {isOpen ? "Sembunyikan" : "Tampilkan"}
          </span>
        </button>
        {isOpen && (
          <div className="border-t border-amber-500/10 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {isOver ? (
              <div className="space-y-1.5">
                <p>
                  Kerapatan daya saat ini adalah <span className="font-bold">{rasio.toFixed(2)} W/m²</span>, di luar batas toleransi wajar (Potensi pemborosan energi).
                </p>
                <ul className="list-disc pl-4 space-y-1 mt-1 text-muted-foreground">
                  <li>
                    <b>Ganti Watt Lampu:</b> Gunakan lampu TL LED dengan daya lebih rendah (misal: <b>10W s/d 12W</b>). Hal ini menjaga kerataan pencahayaan sekaligus menurunkan konsumsi listrik.
                  </li>
                  <li>
                    <b>Kurangi Baris Lampu:</b> Jika jarak baris saat ini masih sangat rapat, Anda dapat mencoba mengurangi jumlah baris lampu (pastikan jarak antar baris baru tidak melebihi 1.9 meter agar tidak ada area gelap).
                  </li>
                </ul>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p>
                  Kerapatan daya saat ini adalah <span className="font-bold">{rasio.toFixed(2)} W/m²</span>, di luar batas toleransi wajar (Kondisi pencahayaan berpotensi terlalu redup).
                </p>
                <ul className="list-disc pl-4 space-y-1 mt-1 text-muted-foreground">
                  <li>
                    <b>Ganti Watt Lampu:</b> Gunakan lampu TL LED dengan daya lebih tinggi (misal: <b>16W s/d 18W</b>) tanpa mengubah posisi titik instalasi atau kabel.
                  </li>
                  <li>
                    <b>Tambah Titik Cahaya:</b> Tambah jumlah baris lampu untuk meningkatkan fluks cahaya di area sales, dengan catatan jarak antar baris disesuaikan kembali.
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }



  // ── Irregular Mode States ──
  const [shape, setShape] = useState<string>("custom")
  const [watt, setWatt] = useState<number>(LAMP_WATT)
  const [wmin, setWmin] = useState<number>(4.0)
  const [wmax, setWmax] = useState<number>(5.0)
  const [p, setP] = useState({
    rP: "10",
    rL: "8",
    rTop: "10",
    rBot: "10",
    rLeft: "8",
    rRight: "8",
    tTop: "6",
    tBot: "10",
    tH: "8",
    tOff: "0",
    lP: "11",
    lL: "8",
    lW: "5",
    lH: "4"
  })

  const parsedP = useMemo(() => {
    return {
      rP: parseFloat(p.rP) || 0,
      rL: parseFloat(p.rL) || 0,
      rTop: parseFloat(p.rTop) || 0,
      rBot: parseFloat(p.rBot) || 0,
      rLeft: parseFloat(p.rLeft) || 0,
      rRight: parseFloat(p.rRight) || 0,
      tTop: parseFloat(p.tTop) || 0,
      tBot: parseFloat(p.tBot) || 0,
      tH: parseFloat(p.tH) || 0,
      tOff: parseFloat(p.tOff) || 0,
      lP: parseFloat(p.lP) || 0,
      lL: parseFloat(p.lL) || 0,
      lW: parseFloat(p.lW) || 0,
      lH: parseFloat(p.lH) || 0,
    }
  }, [p])
  interface CanvasSnapshot {
    pts: Point[]
    closed: boolean
  }

  const [customPts, setCustomPts] = useState<Point[]>([])
  const [customClosed, setCustomClosed] = useState<boolean>(false)
  const [historyPast, setHistoryPast] = useState<CanvasSnapshot[]>([])
  const [historyFuture, setHistoryFuture] = useState<CanvasSnapshot[]>([])
  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState<number | null>(null)

  const dragStartSnapshotRef = useRef<CanvasSnapshot | null>(null)

  const pushSnapshot = useCallback((snapshot: CanvasSnapshot) => {
    setHistoryPast(prev => [...prev.slice(-30), snapshot])
    setHistoryFuture([])
  }, [])

  const pushCurrentToHistory = useCallback(() => {
    pushSnapshot({ pts: customPts, closed: customClosed })
  }, [customPts, customClosed, pushSnapshot])

  const handleUndo = useCallback(() => {
    setHistoryPast(prevPast => {
      if (prevPast.length === 0) return prevPast
      const last = prevPast[prevPast.length - 1]
      const newPast = prevPast.slice(0, prevPast.length - 1)

      setHistoryFuture(prevFuture => [{ pts: customPts, closed: customClosed }, ...prevFuture])
      setCustomPts(last.pts)
      setCustomClosed(last.closed)
      return newPast
    })
    toast.info("Perubahan denah dibatalkan (Undo)")
  }, [customPts, customClosed])

  const handleRedo = useCallback(() => {
    setHistoryFuture(prevFuture => {
      if (prevFuture.length === 0) return prevFuture
      const next = prevFuture[0]
      const newFuture = prevFuture.slice(1)

      setHistoryPast(prevPast => [...prevPast.slice(-30), { pts: customPts, closed: customClosed }])
      setCustomPts(next.pts)
      setCustomClosed(next.closed)
      return newFuture
    })
    toast.info("Perubahan denah dipulihkan (Redo)")
  }, [customPts, customClosed])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shape !== "custom") return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return
      }

      if (e.key === "Escape") {
        setSelectedNodeIdx(null)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault()
          handleRedo()
        } else {
          e.preventDefault()
          handleUndo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shape, handleUndo, handleRedo])

  const [expandDir, setExpandDir] = useState<"end" | "start" | "center">("center")
  const [segmentLengths, setSegmentLengths] = useState<(number | string)[]>([])
  const [activeDragIdx, setActiveDragIdx] = useState<number | null>(null)
  const [selectedNodeIdx, setSelectedNodeIdx] = useState<number | null>(null)
  const [hoverEdge, setHoverEdge] = useState<{ cx: number; cy: number; segmentIdx: number } | null>(null)

  // Auto-deselect node when clicking anywhere outside the canvas container
  useEffect(() => {
    if (selectedNodeIdx === null) return
    const handleDocumentPointerDown = (e: MouseEvent | TouchEvent) => {
      const container = canvasRef.current?.parentElement?.parentElement
      if (container && !container.contains(e.target as Node)) {
        setSelectedNodeIdx(null)
      }
    }
    document.addEventListener("pointerdown", handleDocumentPointerDown)
    return () => document.removeEventListener("pointerdown", handleDocumentPointerDown)
  }, [selectedNodeIdx])

  const handleApplyPreset = () => {
    let pts: Point[] = []
    if (presetType === "rect") {
      const w = parseFloat(presetRectForm.lebar) || 8
      const h = parseFloat(presetRectForm.panjang) || 10
      pts = generateRectPolygon(w, h)
    } else if (presetType === "L") {
      const p = parseFloat(presetLForm.p) || 10
      const l = parseFloat(presetLForm.l) || 8
      const w = parseFloat(presetLForm.w) || 5
      const h = parseFloat(presetLForm.h) || 4
      pts = generateLShapePolygon(p, l, w, h)
    } else if (presetType === "cutout") {
      const p = parseFloat(presetCutoutForm.p) || 10
      const l = parseFloat(presetCutoutForm.l) || 8
      const cw = parseFloat(presetCutoutForm.cutoutW) || 2
      const ch = parseFloat(presetCutoutForm.cutoutH) || 3
      pts = generateCutoutPolygon(p, l, cw, ch)
    }

    pushCurrentToHistory()
    setCustomPts(pts)
    setCustomClosed(true)
    setShape("custom")
    setPresetModalOpen(false)
    toast.success("Denah preset berhasil diterapkan ke Canvas!")
  }
  const [canvasEditTarget, setCanvasEditTarget] = useState<{
    title: string
    paramKey?: string
    segmentIdx?: number
    value: string
  } | null>(null)

  const clickableDimensionsRef = useRef<Array<{
    label: string
    paramKey?: string
    segmentIdx?: number
    value: number
    cx: number
    cy: number
    radius: number
  }>>([])

  const handleDeleteCustomPoint = useCallback((idx: number) => {
    if (customPts.length <= 3) {
      toast.error("Denah poligon membutuhkan minimal 3 titik sudut.")
      setDeleteConfirmIdx(null)
      return
    }

    pushCurrentToHistory()
    setCustomPts(prev => {
      const next = prev.filter((_, i) => i !== idx)
      if (next.length < 3) setCustomClosed(false)
      return next
    })
    setSegmentLengths(prev => prev.filter((_, i) => i !== idx))
    setSelectedNodeIdx(null)
    setDeleteConfirmIdx(null)
    toast.info(`Titik T${idx + 1} berhasil dihapus.`, {
      action: {
        label: "Undo",
        onClick: () => handleUndo()
      }
    })
  }, [customPts, pushCurrentToHistory, handleUndo])

  const handleUpdateSegmentLength = useCallback((idx: number, newLenVal: number, dir: "end" | "start" | "center" = expandDir) => {
    if (isNaN(newLenVal) || newLenVal <= 0) return

    pushCurrentToHistory()
    setCustomPts(prev => {
      if (prev.length < 2) return prev
      const n = prev.length
      const p1Idx = idx
      const p1 = prev[p1Idx]
      const p2Idx = (idx + 1) % n
      const p2 = prev[p2Idx]
      if (!p1 || !p2) return prev

      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const currentLen = Math.hypot(dx, dy)
      if (currentLen === 0) return prev

      const scale = newLenVal / currentLen
      const deltaX = dx * (scale - 1)
      const deltaY = dy * (scale - 1)

      return prev.map((pt, i) => {
        if (dir === "end" && i === p2Idx) {
          return {
            x: Number((pt.x + deltaX).toFixed(1)),
            y: Number((pt.y + deltaY).toFixed(1))
          }
        }
        if (dir === "start" && i === p1Idx) {
          return {
            x: Number((pt.x - deltaX).toFixed(1)),
            y: Number((pt.y - deltaY).toFixed(1))
          }
        }
        if (dir === "center") {
          if (i === p1Idx) {
            return {
              x: Number((pt.x - deltaX / 2).toFixed(1)),
              y: Number((pt.y - deltaY / 2).toFixed(1))
            }
          }
          if (i === p2Idx) {
            return {
              x: Number((pt.x + deltaX / 2).toFixed(1)),
              y: Number((pt.y + deltaY / 2).toFixed(1))
            }
          }
        }
        return pt
      })
    })
  }, [expandDir, pushCurrentToHistory])

  const handleSaveCanvasEdit = useCallback(() => {
    if (!canvasEditTarget) return
    const val = parseFloat(canvasEditTarget.value)
    if (isNaN(val) || val <= 0) {
      toast.error("Masukkan angka ukuran meteran yang valid (> 0)")
      return
    }

    if (canvasEditTarget.paramKey) {
      setParam(canvasEditTarget.paramKey, val.toString())
      toast.success(`Ukuran ${canvasEditTarget.title} diubah menjadi ${val}m`)
    } else if (canvasEditTarget.segmentIdx !== undefined) {
      const idx = canvasEditTarget.segmentIdx
      handleUpdateSegmentLength(idx, val, expandDir)
      toast.success(`Panjang Sisi ${idx + 1} diubah menjadi ${val}m`)
    }
    setCanvasEditTarget(null)
  }, [canvasEditTarget, handleUpdateSegmentLength, expandDir])

  // Keep segmentLengths in sync with customPts and customClosed
  useEffect(() => {
    if (customPts.length < 2) {
      setSegmentLengths([])
      return
    }
    const count = customClosed ? customPts.length : customPts.length - 1
    setSegmentLengths(prev => {
      const next: (number | string)[] = []
      for (let i = 0; i < count; i++) {
        const p1 = customPts[i]
        const p2 = customPts[(i + 1) % customPts.length]
        if (p1 && p2) {
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
          next.push(Number(dist.toFixed(1)))
        }
      }
      return next
    })
  }, [customPts, customClosed])

  const adjustedPts = customPts
  const [stats, setStats] = useState({
    luas: 0,
    nmin: 0,
    nmax: 0,
    n: 0,
    nRow: 0,
    nPerRow: 0,
    rowSpacing: "0.00"
  })
  const [calcResult, setCalcResult] = useState<any>(null)
  const [showAutoWarningDetail, setShowAutoWarningDetail] = useState(false)
  const [showDimensionGuide, setShowDimensionGuide] = useState(false)
  const [isCalculated, setIsCalculated] = useState<boolean>(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Reset calculations when inputs change
  useEffect(() => {
    setIsCalculated(false)
  }, [shape, watt, wmin, wmax, parsedP, customPts, customClosed, lampLen])

  const [exportCardData, setExportCardData] = useState<LightEstimationResultCardData | null>(null)

  const handleSaveResult = (mode: "simetris" | "tidak-simetris") => {
    let cardData: LightEstimationResultCardData | null = null

    const getSvgDataUrlBase64 = () => {
      const svgEl = document.getElementById("sim-svg")
      if (!svgEl) return null
      try {
        const svgString = new XMLSerializer().serializeToString(svgEl)
        return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString)
      } catch (e) {
        console.error(e)
        return null
      }
    }

    const getCanvasDataUrl = () => {
      const canvas = resultCanvasRef.current || canvasRef.current
      if (!canvas) return null
      try {
        // Redraw in forceLight mode (white background) for the report card export
        drawCanvas(canvas, true, true)
        const url = canvas.toDataURL("image/png")
        // Restore standard theme drawing (either dark or light depending on system resolved theme)
        drawCanvas(canvas, true, false)
        return url
      } catch (e) {
        console.error(e)
        return null
      }
    }

    const activeStoreCode = storeMode === "existing" ? (selectedStore?.code ?? "") : newStoreCode
    const activeStoreName = storeMode === "existing" ? (selectedStore?.name ?? "") : newStoreName
    const activeStoreBranch = storeMode === "existing" ? (selectedStore?.branch ?? "") : newStoreBranch

    if (mode === "simetris") {
      if (!simResult) return
      cardData = {
        storeCode: activeStoreCode,
        storeName: activeStoreName,
        storeBranch: activeStoreBranch,
        mode: "simetris",
        shapeLabel: "Kotak",
        area: simResult.area,
        watt: LAMP_WATT,
        lampLen: lampLen,
        totalLamps: activeSimTotalLamps,
        minLamps: simResult.range.minLamps,
        maxLamps: simResult.range.maxLamps,
        rows: activeSimBaris,
        lampsPerRow: activeSimLpb,
        rowSpacing: activeSimJarakPerbaris,
        sideMargin: activeSimJarakSamping,
        rasio: activeSimRasio,
        layoutSnapshot: getSvgDataUrlBase64(),
      }
    } else {
      if (!stats.luas) return
      const shapeObj = SHAPES.find(s => s.id === shape)
      const pts = buildPolygon(shape, parsedP, adjustedPts, customClosed)
      const W2_val = pts ? (Math.max(...pts.map(p => p.x)) - Math.min(...pts.map(p => p.x))) : 1
      const activeMargin = calcResult ? ((W2_val - stats.nPerRow * lampLen) / 2) : 0.45

      cardData = {
        storeCode: activeStoreCode,
        storeName: activeStoreName,
        storeBranch: activeStoreBranch,
        mode: "tidak-simetris",
        shapeLabel: shapeObj?.label ?? shape,
        area: stats.luas,
        watt: watt,
        lampLen: lampLen,
        totalLamps: stats.n,
        minLamps: stats.nmin,
        maxLamps: stats.nmax,
        rows: stats.nRow,
        lampsPerRow: stats.nPerRow,
        rowSpacing: Number(stats.rowSpacing),
        sideMargin: activeMargin,
        rasio: Number(stats.luas > 0 ? (stats.n * watt) / stats.luas : 0),
        layoutSnapshot: getCanvasDataUrl(),
      }
    }

    setExportCardData(cardData)
    setIsSaving(true)

    setTimeout(async () => {
      try {
        if (exportCardRef.current) {
          const dataUrl = await toPng(exportCardRef.current, {
            pixelRatio: 2,
            cacheBust: true,
          })

          // Convert Base64 dataURL to Blob for iOS/Safari download compatibility
          const res = await fetch(dataUrl)
          const blob = await res.blob()
          const blobUrl = URL.createObjectURL(blob)

          const link = document.createElement("a")
          const storeLabel = storeMode === "existing" ? (selectedStore?.code || "toko") : (newStoreCode || "toko-baru")
          link.download = `estimasi-lampu-${storeLabel}.png`
          link.href = blobUrl
          link.click()

          toast.success("Gambar hasil estimasi berhasil diunduh!")

          setTimeout(() => {
            URL.revokeObjectURL(blobUrl)
          }, 100)
        }
      } catch (err) {
        console.error(err)
        toast.error("Gagal mengunduh gambar hasil estimasi.")
      } finally {
        setIsSaving(false)
      }
    }, 300)
  }

  const setParam = (key: string, val: string) => setP(prev => ({ ...prev, [key]: val }))

  // ── Irregular Canvas Drawing ──
  // ── Irregular Canvas Drawing ──
  const drawCanvas = useCallback((canvas: HTMLCanvasElement | null, showLamps: boolean, forceLight: boolean = false) => {
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const W = rect.width > 0 ? rect.width : (canvas.offsetWidth || 340)
    const H = CANVAS_H

    // High-DPI Super Sampling for crystal-clear HD rendering (min 2x DPR)
    const dpr = Math.max(window.devicePixelRatio || 1, 2)

    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    canvas.style.width = W + "px"
    canvas.style.height = H + "px"

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const isDark = !forceLight && resolvedTheme === "dark"

    // Theme-based style variables
    const bgFill = isDark ? "#0c0d12" : "#ffffff"
    const gridStroke = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"
    const meterGridStroke = isDark ? "rgba(245,158,11,0.05)" : "rgba(245,158,11,0.12)"
    const meterLabelFill = isDark ? "rgba(245,158,11,0.3)" : "rgba(180,83,9,0.6)"
    const textFill = isDark ? "#a1a1aa" : "#4b5563"
    const subTextFill = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.4)"
    const subTextFill2 = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.25)"
    const ptLabelFill = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)"

    const polyFill = isDark ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.04)"
    const polyStroke = isDark ? "rgba(245,158,11,0.6)" : "rgba(217,119,6,0.8)"
    const wallInsetStroke = isDark ? "rgba(16,185,129,0.35)" : "rgba(5,150,105,0.5)"

    const dimensionTextFill = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)"
    const legendStroke = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"
    const legendTextFill = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)"
    const nodeTextFill = isDark ? "#a1a1aa" : "#4b5563"

    // Background for Canvas Grid
    ctx.fillStyle = bgFill
    ctx.fillRect(0, 0, W, CANVAS_H)

    // Fine grid
    ctx.strokeStyle = gridStroke
    ctx.lineWidth = 0.5
    for (let x = 0; x < W; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke()
    }
    for (let y = 0; y < CANVAS_H; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    const pts = buildPolygon(shape, parsedP, adjustedPts, customClosed)

    if (!pts) {
      // Drawing Mode: Draw Grid Meters
      ctx.strokeStyle = meterGridStroke
      ctx.lineWidth = 0.5
      for (let m = 0; m <= 20; m++) {
        const sx = FIXED_OX + m * FIXED_SCALE
        const sy = FIXED_OY + m * FIXED_SCALE
        if (sx < W) { ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, CANVAS_H); ctx.stroke() }
        if (sy < CANVAS_H) { ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke() }
      }

      // Grid labels
      ctx.fillStyle = meterLabelFill
      ctx.font = "8px sans-serif"
      ctx.textAlign = "center"
      for (let m = 0; m <= 15; m += 2) {
        const sx = FIXED_OX + m * FIXED_SCALE
        if (sx < W - 10) ctx.fillText(m + "m", sx, FIXED_OY - 4)
      }
      ctx.textAlign = "right"
      for (let m = 0; m <= 12; m += 2) {
        const sy = FIXED_OY + m * FIXED_SCALE
        if (sy < CANVAS_H - 6) ctx.fillText(m + "m", FIXED_OX - 4, sy + 3)
      }

      if (adjustedPts.length === 0) {
        ctx.fillStyle = subTextFill
        ctx.font = "11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("Sentuh canvas untuk menambah sudut dinding", W / 2, CANVAS_H / 2 - 10)
        ctx.font = "9px sans-serif"
        ctx.fillStyle = subTextFill2
        ctx.fillText("Skala: 1 kotak = 1 meter · Minimal 3 sudut", W / 2, CANVAS_H / 2 + 8)
      }

      // Draw active custom pts
      const toF = (pt: Point) => ({ cx: FIXED_OX + pt.x * FIXED_SCALE, cy: FIXED_OY + pt.y * FIXED_SCALE })
      if (adjustedPts.length > 0) {
        const spts = adjustedPts.map(toF)
        ctx.beginPath()
        spts.forEach((sp, idx) => idx === 0 ? ctx.moveTo(sp.cx, sp.cy) : ctx.lineTo(sp.cx, sp.cy))
        ctx.strokeStyle = "rgba(245,158,11,0.6)"
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 2])
        ctx.stroke()
        ctx.setLineDash([])

        spts.forEach((sp, idx) => {
          ctx.beginPath(); ctx.arc(sp.cx, sp.cy, idx === 0 ? 6 : 4, 0, Math.PI * 2)
          ctx.fillStyle = idx === 0 ? "rgba(245,158,11,0.4)" : "rgba(124,58,237,0.4)"
          ctx.fill()
          ctx.strokeStyle = idx === 0 ? "#f59e0b" : "#7c3aed"
          ctx.lineWidth = 1.5
          ctx.stroke()
          ctx.fillStyle = ptLabelFill
          ctx.font = "8px sans-serif"
          ctx.textAlign = "left"
          ctx.fillText(`T${idx + 1} (${adjustedPts[idx].x.toFixed(1)},${adjustedPts[idx].y.toFixed(1)})`, sp.cx + 6, sp.cy - 3)
        })

        // Draw segment length labels parallel to dashed wall lines in drawing mode
        if (spts.length >= 2) {
          ctx.save()
          ctx.font = "bold 8.5px sans-serif"

          for (let i = 0; i < spts.length - 1; i++) {
            const p1 = spts[i]
            const p2 = spts[i + 1]
            const mx = (p1.cx + p2.cx) / 2
            const my = (p1.cy + p2.cy) / 2

            const dx = p2.cx - p1.cx
            const dy = p2.cy - p1.cy
            const len = Math.hypot(dx, dy)
            if (len === 0) continue

            const rawLen = segmentLengths[i]
            let lenVal = (rawLen !== undefined && rawLen !== "") ? (parseFloat(String(rawLen)) || (len / FIXED_SCALE)) : (len / FIXED_SCALE)

            let angle = Math.atan2(dy, dx)
            if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
              angle += Math.PI
            }

            const segText = `${lenVal.toFixed(1)}m`

            ctx.save()
            ctx.translate(mx, my - 8)
            ctx.rotate(angle)
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            // Subtle, aligned text outline
            ctx.strokeStyle = bgFill
            ctx.lineWidth = 1.5
            ctx.lineJoin = "round"
            ctx.strokeText(segText, 0, 0)

            // Crisp fill text
            ctx.fillStyle = isDark ? "#34d399" : "#047857"
            ctx.fillText(segText, 0, 0)

            ctx.restore()
          }
          ctx.restore()
        }

        if (adjustedPts.length >= 3) {
          // Glow ring around T1 to close polygon
          ctx.beginPath()
          ctx.arc(spts[0].cx, spts[0].cy, 12, 0, Math.PI * 2)
          ctx.strokeStyle = "rgba(16,185,129,0.4)"
          ctx.lineWidth = 1.2
          ctx.setLineDash([2, 2])
          ctx.stroke()
          ctx.setLineDash([])
        }
      }
      return
    }

    // Closed Polygon view scale
    const sc = getScaleInfo(pts, W, CANVAS_H)
    const toC = (pt: Point) => ({ cx: sc.offX + pt.x * sc.scale, cy: sc.offY + pt.y * sc.scale })
    const sPts = pts.map(toC)

    // Draw main polygon
    ctx.beginPath()
    sPts.forEach((sp, idx) => idx === 0 ? ctx.moveTo(sp.cx, sp.cy) : ctx.lineTo(sp.cx, sp.cy))
    ctx.closePath()
    ctx.fillStyle = polyFill
    ctx.fill()
    ctx.strokeStyle = polyStroke
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Calculate active parameters with overrides
    const activeBaris = irregOverrideBaris !== null ? irregOverrideBaris : (calcResult ? calcResult.baris : 0)
    const activeLpb = irregOverrideLpb !== null ? irregOverrideLpb : (calcResult ? calcResult.lampuPerbaris : 0)

    const W2 = Math.max(...pts.map(p => p.x)) - Math.min(...pts.map(p => p.x))
    const H2 = Math.max(...pts.map(p => p.y)) - Math.min(...pts.map(p => p.y))

    const usedMargin = calcResult ? ((W2 - activeLpb * lampLen) / 2) : 0.45
    const usedJarak = calcResult ? (H2 / (activeBaris + 1)) : 1.9
    const usedOrient = "h"
    const usedSpasi = 0

    // Draw wall margin inset line
    const inset = offsetPolygon(pts, usedMargin)
    if (inset && inset.length >= 3) {
      const sInset = inset.map(toC)
      ctx.beginPath()
      sInset.forEach((sp, idx) => idx === 0 ? ctx.moveTo(sp.cx, sp.cy) : ctx.lineTo(sp.cx, sp.cy))
      ctx.closePath()
      ctx.setLineDash([3, 3])
      ctx.strokeStyle = wallInsetStroke
      ctx.lineWidth = 0.8
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Arrow helper function for dimensions
    const drawArrow = (x1: number, y1: number, x2: number, y2: number, color: string, label: string) => {
      ctx.save()
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = 0.8

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      const angle = Math.atan2(y2 - y1, x2 - x1)
      const headLen = 4

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x1 + headLen * Math.cos(angle - Math.PI / 6), y1 + headLen * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(x1 + headLen * Math.cos(angle + Math.PI / 6), y1 + headLen * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fill()

      ctx.font = "bold 7px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const mx = (x1 + x2) / 2
      const my = (y1 + y2) / 2

      if (Math.abs(y2 - y1) > Math.abs(x2 - x1)) {
        ctx.textAlign = "left"
        ctx.fillText(label, mx + 4, my)
      } else {
        ctx.textBaseline = "bottom"
        ctx.fillText(label, mx, my - 2)
      }
      ctx.restore()
    }

    // Place and draw lamps if calculated
    if (showLamps) {
      const lamps = placeLamps(pts, usedJarak, usedMargin, usedOrient, lampLen, usedSpasi)
      const lampLen_px = lampLen * sc.scale
      const lampW_px = Math.max(3, LAMP_TUBE_W * sc.scale)

      // Legenda & Koordinat grouping
      const uniqueYs = Array.from(new Set(lamps.map(l => Number(l.y.toFixed(4))))).sort((a, b) => a - b)
      const uniqueXs = Array.from(new Set(lamps.map(l => Number(l.x.toFixed(4))))).sort((a, b) => a - b)

      const yToRowLetter: Record<number, string> = {}
      uniqueYs.forEach((y, idx) => {
        yToRowLetter[y] = String.fromCharCode(65 + idx)
      })

      const colNumbers: Record<number, number> = {}
      uniqueYs.forEach(y => {
        const rowLamps = lamps.map((lamp, idx) => ({ lamp, idx })).filter(item => Number(item.lamp.y.toFixed(4)) === y)
        rowLamps.sort((a, b) => a.lamp.x - b.lamp.x)
        rowLamps.forEach((rl, colIdx) => {
          colNumbers[rl.idx] = colIdx + 1
        })
      })

      // Draw Legend Rulers (Top column numbers & Left row letters)
      if (showDimensions) {
        ctx.save()
        ctx.fillStyle = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.6)"
        ctx.font = "bold 8px sans-serif"

        // Column headers (1, 2, 3...)
        ctx.textAlign = "center"
        ctx.textBaseline = "bottom"
        uniqueXs.forEach((x, idx) => {
          const cx = sc.offX + x * sc.scale
          const labelY = sc.offY + (sc.minY ?? 0) * sc.scale - 8
          ctx.fillText((idx + 1).toString(), cx, labelY)
        })

        // Row headers (A, B, C...)
        ctx.textAlign = "right"
        ctx.textBaseline = "middle"
        uniqueYs.forEach((y, idx) => {
          const cy = sc.offY + y * sc.scale
          const labelX = sc.offX + (sc.minX ?? 0) * sc.scale - 10
          ctx.fillText(String.fromCharCode(65 + idx), labelX, cy)
        })
        ctx.restore()
      }

      // Draw Lamps
      lamps.forEach((lamp, idx) => {
        const cx = sc.offX + lamp.x * sc.scale
        const cy = sc.offY + lamp.y * sc.scale
        const isDisabled = irregDisabledLamps.includes(idx)

        ctx.save()
        ctx.translate(cx, cy)
        if (lamp.dir === "v") ctx.rotate(Math.PI / 2)

        if (isDisabled) {
          ctx.globalAlpha = 0.25
        } else {
          ctx.globalAlpha = 1.0
        }

        // Outer light tube glow
        if (!isDisabled) {
          ctx.fillStyle = "rgba(16,185,129,0.8)"
          ctx.strokeStyle = "rgba(110,231,183,0.9)"
        } else {
          ctx.fillStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
          ctx.strokeStyle = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"
        }
        ctx.lineWidth = 0.6
        const rr = lampW_px / 2
        ctx.beginPath()
        ctx.roundRect(-lampLen_px / 2, -rr, lampLen_px, lampW_px, rr)
        ctx.fill(); ctx.stroke()

        // Inner glowing core
        if (!isDisabled) {
          ctx.fillStyle = "rgba(254,243,199,0.4)"
          ctx.beginPath()
          ctx.roundRect(-lampLen_px / 2 + 1.5, -rr + 1, lampLen_px - 3, lampW_px - 2, rr - 0.5)
          ctx.fill()
        }

        ctx.restore()
        ctx.globalAlpha = 1.0 // restore global alpha

        // Draw Lamp Label (e.g. A1, A2...) above lamp shape
        if (showDimensions) {
          ctx.save()
          ctx.fillStyle = isDisabled
            ? (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.3)")
            : (isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)")
          ctx.font = "bold 6.5px sans-serif"
          ctx.textAlign = "center"
          ctx.textBaseline = "bottom"

          const rowYKey = Number(lamp.y.toFixed(4))
          const rowLetter = yToRowLetter[rowYKey] || "A"
          const colNum = colNumbers[idx] || 1
          ctx.fillText(`${rowLetter}${colNum}`, cx, cy - lampW_px - 2)
          ctx.restore()
        }
      })

      // Draw JS and JB dimension lines
      if (showDimensions) {
        // Draw JS
        if (uniqueXs.length > 0) {
          const leftWallX = sc.offX + (sc.minX ?? 0) * sc.scale
          const firstColX = sc.offX + uniqueXs[0] * sc.scale
          const jsY = sc.offY + (sc.minY ?? 0) * sc.scale + 15
          drawArrow(leftWallX, jsY, firstColX, jsY, isDark ? "rgba(239,68,68,0.8)" : "rgba(220,38,38,0.9)", `JS ${usedMargin.toFixed(2)}m`)
        }
        // Draw JB
        if (uniqueYs.length > 0) {
          const jbX = sc.offX + (sc.minX ?? 0) * sc.scale + 20
          if (uniqueYs.length > 1) {
            const firstRowY = sc.offY + uniqueYs[0] * sc.scale
            const secondRowY = sc.offY + uniqueYs[1] * sc.scale
            drawArrow(jbX, firstRowY, jbX, secondRowY, isDark ? "rgba(16,185,129,0.8)" : "rgba(5,150,105,0.9)", `JB ${usedJarak.toFixed(2)}m`)
          } else {
            const topWallY = sc.offY + (sc.minY ?? 0) * sc.scale
            const firstRowY = sc.offY + uniqueYs[0] * sc.scale
            drawArrow(jbX, topWallY, jbX, firstRowY, isDark ? "rgba(16,185,129,0.8)" : "rgba(5,150,105,0.9)", `JB ${usedJarak.toFixed(2)}m`)
          }
        }
      }
    }

    // Bounding Box Width/Length Dimension Labels (LT & PT) - Clean Text with Halo Effect
    const drawHaloText = (text: string, x: number, y: number, color: string, isVertical = false) => {
      ctx.save()
      ctx.font = "bold 9px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      if (isVertical) {
        ctx.translate(x, y)
        ctx.rotate(-Math.PI / 2)
        // Halo outline
        ctx.strokeStyle = bgFill
        ctx.lineWidth = 1.5
        ctx.lineJoin = "round"
        ctx.strokeText(text, 0, 0)
        // Crisp fill text
        ctx.fillStyle = color
        ctx.fillText(text, 0, 0)
      } else {
        // Halo outline
        ctx.strokeStyle = bgFill
        ctx.lineWidth = 1.5
        ctx.lineJoin = "round"
        ctx.strokeText(text, x, y)
        // Crisp fill text
        ctx.fillStyle = color
        ctx.fillText(text, x, y)
      }
      ctx.restore()
    }

    // Clear previous click targets
    clickableDimensionsRef.current = []

    const registerTarget = (item: { label: string; paramKey?: string; segmentIdx?: number; value: number; cx: number; cy: number }) => {
      if (forceLight || isSaving) return
      clickableDimensionsRef.current.push({
        ...item,
        radius: 20
      })
    }

    // Render Bottom (LT) and Left (PT) Bounding Dimensions
    const ltX = sc.offX + (sc.rW * sc.scale) / 2
    const ltY = sc.offY + sc.rH * sc.scale + 14
    const ptX = sc.offX - 14
    const ptY = sc.offY + (sc.rH * sc.scale) / 2

    drawHaloText(`${sc.rW.toFixed(1)}m (LT)`, ltX, ltY, isDark ? "#38bdf8" : "#0284c7", false)
    drawHaloText(`${sc.rH.toFixed(1)}m (PT)`, ptX, ptY, isDark ? "#c4b5fd" : "#6d28d9", true)

    if (shape === "rect") {
      registerTarget({ label: "Lebar Atas (LA)", paramKey: "rTop", value: parsedP.rTop, cx: ltX, cy: ltY })
      registerTarget({ label: "Panjang Kiri (PKi)", paramKey: "rLeft", value: parsedP.rLeft, cx: ptX, cy: ptY })
    } else if (shape === "trap") {
      registerTarget({ label: "Lebar Bawah (LB)", paramKey: "tBot", value: parsedP.tBot, cx: ltX, cy: ltY })
      registerTarget({ label: "Panjang Total (PT)", paramKey: "tH", value: parsedP.tH, cx: ptX, cy: ptY })
    } else if (shape === "L") {
      registerTarget({ label: "Lebar Total (LT)", paramKey: "lL", value: parsedP.lL, cx: ltX, cy: ltY })
      registerTarget({ label: "Panjang Total (PT)", paramKey: "lP", value: parsedP.lP, cx: ptX, cy: ptY })
    }

    // Draw Shape Side Edge Labels on Canvas if showDimensions is enabled
    if (showDimensions && sPts.length >= 3) {
      ctx.save()
      ctx.font = "bold 8.5px sans-serif"

      let sideLabels: string[] = []
      if (shape === "rect") {
        sideLabels = [`LA ${p.rTop}m`, `PKa ${p.rRight}m`, `LB ${p.rBot}m`, `PKi ${p.rLeft}m`]
      } else if (shape === "trap") {
        sideLabels = [`LA ${p.tTop}m`, `Miring`, `LB ${p.tBot}m`, `PT ${p.tH}m`]
      } else if (shape === "L") {
        sideLabels = [`LT ${p.lL}m`, `PS ${p.lH}m`, `LS ${p.lW}m`, `Sisi L`, `Sisi Bawa`, `PT ${p.lP}m`]
      } else if (shape === "custom") {
        sideLabels = sPts.map((_, i) => {
          const rawLen = segmentLengths[i]
          let lenVal = 0
          if (rawLen !== undefined && rawLen !== "") {
            lenVal = parseFloat(String(rawLen)) || 0
          }
          if (!lenVal && adjustedPts.length > i) {
            const pt1 = adjustedPts[i]
            const pt2 = adjustedPts[(i + 1) % adjustedPts.length]
            lenVal = Number(Math.hypot(pt2.x - pt1.x, pt2.y - pt1.y).toFixed(1))
          }
          return `${lenVal.toFixed(1)}m`
        })
      }

      // Calculate centroid of scaled polygon for outward normal offset
      const cxPoly = sPts.reduce((acc, p) => acc + p.cx, 0) / sPts.length
      const cyPoly = sPts.reduce((acc, p) => acc + p.cy, 0) / sPts.length

      sPts.forEach((p1, idx) => {
        const p2 = sPts[(idx + 1) % sPts.length]
        const label = sideLabels[idx]
        if (label && label !== "Miring" && label !== "Sisi L" && label !== "Sisi Bawa") {
          // Midpoint of segment
          const mx = (p1.cx + p2.cx) / 2
          const my = (p1.cy + p2.cy) / 2

          // Segment vector & perpendicular normal
          const dx = p2.cx - p1.cx
          const dy = p2.cy - p1.cy
          const len = Math.hypot(dx, dy)
          if (len === 0) return

          let nx = -dy / len
          let ny = dx / len

          // Ensure normal points outward away from polygon centroid
          const dot = (mx + nx * 10 - cxPoly) * (mx - cxPoly) + (my + ny * 10 - cyPoly) * (my - cyPoly)
          if (dot < 0) {
            nx = -nx
            ny = -ny
          }

          const labelX = mx + nx * 9
          const labelY = my + ny * 9

          // Register click target for interactive canvas dimension editing
          let paramKey: string | undefined = undefined
          let segmentIdx: number | undefined = undefined
          let valNum = 0
          let displayTitle = label

          if (shape === "rect") {
            const keys = ["rTop", "rRight", "rBot", "rLeft"]
            const titles = ["Lebar Atas (LA)", "Panjang Kanan (PKa)", "Lebar Bawah (LB)", "Panjang Kiri (PKi)"]
            const vals = [parsedP.rTop, parsedP.rRight, parsedP.rBot, parsedP.rLeft]
            paramKey = keys[idx]
            displayTitle = titles[idx]
            valNum = vals[idx]
          } else if (shape === "trap") {
            const keys = ["tTop", undefined, "tBot", "tH"]
            const titles = ["Lebar Atas (LA)", "", "Lebar Bawah (LB)", "Panjang Total (PT)"]
            const vals = [parsedP.tTop, 0, parsedP.tBot, parsedP.tH]
            paramKey = keys[idx]
            displayTitle = titles[idx]
            valNum = vals[idx]
          } else if (shape === "L") {
            const keys = ["lL", "lH", "lW", undefined, undefined, "lP"]
            const titles = ["Lebar Total (LT)", "Panjang Sayap (PS)", "Lebar Sayap (LS)", "", "", "Panjang Total (PT)"]
            const vals = [parsedP.lL, parsedP.lH, parsedP.lW, 0, 0, parsedP.lP]
            paramKey = keys[idx]
            displayTitle = titles[idx]
            valNum = vals[idx]
          } else if (shape === "custom") {
            segmentIdx = idx
            displayTitle = `Panjang Dinding Sisi ${idx + 1}`
            valNum = parseFloat(label) || 0
          }

          if (shape !== "custom" && displayTitle && (paramKey || segmentIdx !== undefined)) {
            registerTarget({
              label: displayTitle,
              paramKey,
              segmentIdx,
              value: valNum,
              cx: labelX,
              cy: labelY
            })
          }

          // Calculate wall angle and prevent upside-down text
          let angle = Math.atan2(dy, dx)
          if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
            angle += Math.PI
          }

          ctx.save()
          ctx.translate(labelX, labelY)
          ctx.rotate(angle)
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          // Subtle, perfectly-aligned text outline
          ctx.strokeStyle = bgFill
          ctx.lineWidth = 1.5
          ctx.lineJoin = "round"
          ctx.strokeText(label, 0, 0)

          // Crisp filled text aligned parallel to wall
          ctx.fillStyle = isDark ? "#34d399" : "#047857"
          ctx.fillText(label, 0, 0)

          ctx.restore()
        }
      })
      ctx.restore()
    }

    // Subtle coordinate system legend (visual guide)
    ctx.strokeStyle = isDark ? "#38bdf8" : "#0284c7"
    ctx.lineWidth = 1
    ctx.fillStyle = legendTextFill
    ctx.font = "8px sans-serif"

    const ax = 20
    const ay = CANVAS_H - 25

    // Draw W arrow (LT)
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(ax + 25, ay)
    ctx.stroke()
    ctx.fillStyle = isDark ? "#38bdf8" : "#0284c7"
    ctx.beginPath()
    ctx.moveTo(ax + 25, ay)
    ctx.lineTo(ax + 21, ay - 2.5)
    ctx.lineTo(ax + 21, ay + 2.5)
    ctx.closePath()
    ctx.fill()
    ctx.fillText("LT (Lebar Total)", ax + 28, ay + 2.5)

    // Draw L arrow (PT)
    ctx.strokeStyle = isDark ? "#c4b5fd" : "#7c3aed"
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(ax, ay - 25)
    ctx.stroke()
    ctx.fillStyle = isDark ? "#c4b5fd" : "#7c3aed"
    ctx.beginPath()
    ctx.moveTo(ax, ay - 25)
    ctx.lineTo(ax - 2.5, ay - 21)
    ctx.lineTo(ax + 2.5, ay - 21)
    ctx.closePath()
    ctx.fill()

    ctx.save()
    ctx.translate(ax - 4, ay - 8)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("PT (Panjang Total)", 0, 0)
    ctx.restore()

    if (shape === "custom") {
      sPts.forEach((sp, idx) => {
        const isSelected = selectedNodeIdx === idx
        ctx.beginPath()
        ctx.arc(sp.cx, sp.cy, isSelected ? 8 : (idx === 0 ? 5 : 3.5), 0, Math.PI * 2)
        ctx.fillStyle = isSelected
          ? "rgba(239,68,68,0.3)"
          : (idx === 0 ? "rgba(245,158,11,0.5)" : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"))
        ctx.fill()
        ctx.strokeStyle = isSelected
          ? "#ef4444"
          : (idx === 0 ? "#f59e0b" : (isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.25)"))
        ctx.lineWidth = isSelected ? 2.5 : 1
        ctx.stroke()

        if (isSelected) {
          ctx.beginPath()
          ctx.arc(sp.cx, sp.cy, 14, 0, Math.PI * 2)
          ctx.strokeStyle = "rgba(239, 68, 68, 0.6)"
          ctx.lineWidth = 1.5
          ctx.setLineDash([3, 3])
          ctx.stroke()
          ctx.setLineDash([])
        }

        ctx.fillStyle = isSelected ? "#ef4444" : nodeTextFill
        ctx.font = isSelected ? "bold 10px sans-serif" : "bold 8px sans-serif"
        ctx.fillText(`T${idx + 1}`, sp.cx + (isSelected ? 9 : 6), sp.cy - (isSelected ? 9 : 6))

      })

      if (hoverEdge && activeDragIdx === null) {
        ctx.beginPath()
        ctx.arc(hoverEdge.cx, hoverEdge.cy, 6, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(16, 185, 129, 0.4)"
        ctx.fill()
        ctx.strokeStyle = "#10b981"
        ctx.lineWidth = 1.8
        ctx.stroke()

        ctx.fillStyle = "#10b981"
        ctx.font = "bold 9px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("+", hoverEdge.cx, hoverEdge.cy)
      }
    }
  }, [shape, parsedP, adjustedPts, customClosed, lampLen, calcResult, resolvedTheme, irregOverrideBaris, irregOverrideLpb, irregDisabledLamps, showDimensions, isSaving, selectedNodeIdx, hoverEdge, activeDragIdx])

  const updateStats = useCallback(() => {
    const pts = buildPolygon(shape, parsedP, adjustedPts, customClosed)
    if (!pts || pts.length === 0) {
      setStats({ luas: 0, nmin: 0, nmax: 0, n: 0, nRow: 0, nPerRow: 0, rowSpacing: "0.00" })
      setCalcResult(null)
      return
    }
    const luas = calcPolygonArea(pts)
    const { minLamps, maxLamps } = calcLampRange(luas, watt, wmin, wmax)

    let res: any = null
    if (isCalculated && luas > 0) {
      const W2 = Math.max(...pts.map(p => p.x)) - Math.min(...pts.map(p => p.x))
      const H2 = Math.max(...pts.map(p => p.y)) - Math.min(...pts.map(p => p.y))
      const lebar = W2
      const panjang = H2
      res = calcIregular(luas, lebar, panjang, watt, lampLen)
    }
    setCalcResult(res)

    let lamps: any[] = []
    let nRow = 0
    let nPerRow = 0
    let rowSpacing = 0

    if (isCalculated && res) {
      const activeBaris = irregOverrideBaris !== null ? irregOverrideBaris : res.baris
      const activeLpb = irregOverrideLpb !== null ? irregOverrideLpb : res.lampuPerbaris

      const W2 = Math.max(...pts.map(p => p.x)) - Math.min(...pts.map(p => p.x))
      const H2 = Math.max(...pts.map(p => p.y)) - Math.min(...pts.map(p => p.y))

      const activeJarakPerbaris = H2 / (activeBaris + 1)
      const activeJarakSamping = (W2 - activeLpb * lampLen) / 2

      lamps = placeLamps(pts, activeJarakPerbaris, activeJarakSamping, "h", lampLen, 0)
      if (lamps.length > 0) {
        nRow = activeBaris
        nPerRow = activeLpb
        rowSpacing = activeJarakPerbaris
      }
    }

    const activeTotalLamps = isCalculated
      ? lamps.length - irregDisabledLamps.filter(idx => idx < lamps.length).length
      : 0

    const calculatedMinLamps = res ? res.minLamps : minLamps
    const calculatedMaxLamps = res ? res.maxLamps : maxLamps

    setStats({
      luas: Number(luas.toFixed(1)),
      nmin: calculatedMinLamps,
      nmax: calculatedMaxLamps,
      n: activeTotalLamps,
      nRow,
      nPerRow,
      rowSpacing: isCalculated ? rowSpacing.toFixed(2) : "0.00"
    })
  }, [shape, parsedP, adjustedPts, customClosed, watt, wmin, wmax, lampLen, isCalculated, irregOverrideBaris, irregOverrideLpb, irregDisabledLamps])

  const activeMargin = useMemo(() => {
    if (!calcResult) return 0.45
    const pts = buildPolygon(shape, parsedP, adjustedPts, customClosed)
    if (!pts || pts.length === 0) return 0.45
    const xs = pts.map(pt => pt.x)
    const W2 = Math.max(...xs) - Math.min(...xs)
    const margin = (W2 - stats.nPerRow * lampLen) / 2
    return margin > 0 ? margin : 0.45
  }, [calcResult, shape, parsedP, adjustedPts, customClosed, stats.nPerRow, lampLen])

  const activeIrregRasio = useMemo(() => {
    return stats.luas > 0 ? (stats.n * watt) / stats.luas : 0
  }, [stats.luas, stats.n, watt])

  const irregCheck = useMemo(() => {
    return checkStandards(activeIrregRasio, activeMargin, Number(stats.rowSpacing) || 0)
  }, [activeIrregRasio, activeMargin, stats.rowSpacing])

  useEffect(() => {
    updateStats()
  }, [updateStats])

  useEffect(() => {
    if (activeTab === "tidak-simetris") {
      drawCanvas(canvasRef.current, false)
      const timer = setTimeout(() => {
        drawCanvas(canvasRef.current, false)
      }, 60)
      return () => clearTimeout(timer)
    }
  }, [drawCanvas, shape, parsedP, adjustedPts, customClosed, lampLen, activeTab])

  useEffect(() => {
    if (isCalculated && activeTab === "tidak-simetris") {
      drawCanvas(resultCanvasRef.current, true)
      const timer = setTimeout(() => {
        drawCanvas(resultCanvasRef.current, true)
      }, 60)
      return () => clearTimeout(timer)
    }
  }, [drawCanvas, isCalculated, shape, parsedP, adjustedPts, customClosed, lampLen, showDimensions, irregOverrideBaris, irregOverrideLpb, irregDisabledLamps, activeTab])

  // Canvas pointer down handler for canvas dimension click & custom node dragging
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    // 1. Check if user clicked on dimension text (ONLY IF shape !== "custom")
    const allowDimensionEdit = shape !== "custom"
    if (allowDimensionEdit) {
      const hitTarget = clickableDimensionsRef.current.find(t => Math.hypot(cx - t.cx, cy - t.cy) <= t.radius)
      if (hitTarget) {
        setCanvasEditTarget({
          title: hitTarget.label,
          paramKey: hitTarget.paramKey,
          segmentIdx: hitTarget.segmentIdx,
          value: hitTarget.value.toString()
        })
        return
      }
    }

    if (shape !== "custom") return

    // 2. Check scale & node positions for custom shape
    const pts = buildPolygon(shape, parsedP, customPts, customClosed)
    const W = canvas.offsetWidth || 340
    const sc = (customClosed && pts) ? getScaleInfo(pts, W, CANVAS_H) : null

    const scale = sc ? sc.scale : FIXED_SCALE
    const offX = sc ? sc.offX : FIXED_OX
    const offY = sc ? sc.offY : FIXED_OY

    if (customPts.length > 0) {
      const spts = customPts.map(pt => ({
        cx: offX + pt.x * scale,
        cy: offY + pt.y * scale
      }))

      for (let i = 0; i < spts.length; i++) {
        if (Math.hypot(cx - spts[i].cx, cy - spts[i].cy) <= 16) {
          // Select node on click
          setSelectedNodeIdx(i)

          // If touching point 0 and polygon has 3+ points and unclosed: close polygon!
          if (i === 0 && customPts.length >= 3 && !customClosed) {
            pushCurrentToHistory()
            setCustomClosed(true)
            toast.success("Poligon kustom ditutup!")
            return
          }

          // Start drag & capture initial snapshot for undo
          dragStartSnapshotRef.current = { pts: [...customPts], closed: customClosed }
          setActiveDragIdx(i)
          try {
            (e.target as HTMLElement).setPointerCapture(e.pointerId)
          } catch { }
          return
        }
      }

      // Check if user clicked on any line segment (Pen Tool - insert node on wall edge)
      if (customPts.length >= 2) {
        const segCount = customClosed ? spts.length : spts.length - 1
        let bestSegIdx = -1
        let bestDist = 14 // Threshold distance in pixels to line segment
        let bestClosest: { x: number; y: number } | null = null

        for (let i = 0; i < segCount; i++) {
          const p1 = spts[i]
          const p2 = spts[(i + 1) % spts.length]
          const proj = getClosestPointOnSegment(cx, cy, p1.cx, p1.cy, p2.cx, p2.cy)

          if (proj.dist < bestDist && proj.t > 0.05 && proj.t < 0.95) {
            bestDist = proj.dist
            bestSegIdx = i
            bestClosest = { x: proj.x, y: proj.y }
          }
        }

        if (bestSegIdx !== -1 && bestClosest) {
          const mX = Number(Math.max(0, (bestClosest.x - offX) / scale).toFixed(1))
          const mY = Number(Math.max(0, (bestClosest.y - offY) / scale).toFixed(1))
          const snapped = { x: mX, y: mY }
          const insertIdx = bestSegIdx + 1

          pushCurrentToHistory()

          // Store snapshot for drag undo
          dragStartSnapshotRef.current = { pts: [...customPts], closed: customClosed }

          setCustomPts(prev => {
            const next = [...prev]
            next.splice(insertIdx, 0, snapped)
            return next
          })

          setSelectedNodeIdx(insertIdx)
          setActiveDragIdx(insertIdx)

          try {
            (e.target as HTMLElement).setPointerCapture(e.pointerId)
          } catch { }

          toast.info(`Titik T${insertIdx + 1} ditambahkan pada dinding. Geser titik untuk membuat ceruk/lekukan!`)
          return
        }
      }
    }

    // Clicked empty space
    if (customClosed) {
      setSelectedNodeIdx(null)
      return
    }

    // 3. If unclosed custom polygon, add new point
    if (!customClosed) {
      const mx = (cx - FIXED_OX) / FIXED_SCALE
      const my = (cy - FIXED_OY) / FIXED_SCALE
      const snapped = { x: Number(Math.max(0, mx).toFixed(1)), y: Number(Math.max(0, my).toFixed(1)) }
      pushCurrentToHistory()
      setCustomPts(prev => [...prev, snapped])
      setSelectedNodeIdx(null)
    }
  }, [shape, customClosed, customPts, parsedP, pushCurrentToHistory])

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || shape !== "custom") return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    const pts = buildPolygon(shape, parsedP, customPts, customClosed)
    const W = canvas.offsetWidth || 340
    const sc = (customClosed && pts) ? getScaleInfo(pts, W, CANVAS_H) : null

    const scale = sc ? sc.scale : FIXED_SCALE
    const offX = sc ? sc.offX : FIXED_OX
    const offY = sc ? sc.offY : FIXED_OY

    if (activeDragIdx !== null) {
      const mx = (cx - offX) / scale
      const my = (cy - offY) / scale
      const newX = Number(Math.max(0, mx).toFixed(1))
      const newY = Number(Math.max(0, my).toFixed(1))

      setCustomPts(prev => {
        const next = [...prev]
        if (next[activeDragIdx]) {
          next[activeDragIdx] = { x: newX, y: newY }
        }
        return next
      })
      return
    }

    // Hover detection for Pen-Tool preview on edges
    if (customPts.length >= 2) {
      const spts = customPts.map(pt => ({
        cx: offX + pt.x * scale,
        cy: offY + pt.y * scale
      }))
      const segCount = customClosed ? spts.length : spts.length - 1
      let foundHover: { cx: number; cy: number; segmentIdx: number } | null = null
      let bestDist = 14

      for (let i = 0; i < segCount; i++) {
        const p1 = spts[i]
        const p2 = spts[(i + 1) % spts.length]
        const proj = getClosestPointOnSegment(cx, cy, p1.cx, p1.cy, p2.cx, p2.cy)

        if (proj.dist < bestDist && proj.t > 0.05 && proj.t < 0.95) {
          bestDist = proj.dist
          foundHover = { cx: proj.x, cy: proj.y, segmentIdx: i }
        }
      }

      setHoverEdge(prev => {
        if (!prev && !foundHover) return null
        if (prev && foundHover && Math.hypot(prev.cx - foundHover.cx, prev.cy - foundHover.cy) < 2 && prev.segmentIdx === foundHover.segmentIdx) {
          return prev
        }
        return foundHover
      })
    }
  }, [activeDragIdx, shape, parsedP, customPts, customClosed])

  const handleCanvasPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeDragIdx !== null) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch { }

      if (dragStartSnapshotRef.current) {
        const initialPt = dragStartSnapshotRef.current.pts[activeDragIdx]
        const currentPt = customPts[activeDragIdx]
        if (initialPt && currentPt) {
          const distMoved = Math.hypot(currentPt.x - initialPt.x, currentPt.y - initialPt.y)
          if (distMoved > 0.05) {
            pushSnapshot(dragStartSnapshotRef.current)
          }
        }
        dragStartSnapshotRef.current = null
      }

      setActiveDragIdx(null)
    }
  }, [activeDragIdx, customPts, pushSnapshot])

  // Canvas click handler to toggle specific lamps in calculated layout
  const handleResultCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCalculated || !resultCanvasRef.current || !calcResult) return
    const canvas = resultCanvasRef.current
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    // Get current scale information and lamps
    const W = canvas.offsetWidth || 340
    const pts = buildPolygon(shape, parsedP, adjustedPts, customClosed)
    if (!pts) return
    const sc = getScaleInfo(pts, W, CANVAS_H)

    // Calculate active layout spacing
    const activeBaris = irregOverrideBaris !== null ? irregOverrideBaris : calcResult.baris
    const activeLpb = irregOverrideLpb !== null ? irregOverrideLpb : calcResult.lampuPerbaris

    const W2 = Math.max(...pts.map(p => p.x)) - Math.min(...pts.map(p => p.x))
    const H2 = Math.max(...pts.map(p => p.y)) - Math.min(...pts.map(p => p.y))

    const usedMargin = (W2 - activeLpb * lampLen) / 2
    const usedJarak = H2 / (activeBaris + 1)

    const lamps = placeLamps(pts, usedJarak, usedMargin, "h", lampLen, 0)

    // Find closest lamp to (cx, cy)
    let closestIdx = -1
    let minDist = 15 // threshold in pixels

    lamps.forEach((lamp, idx) => {
      const lx = sc.offX + lamp.x * sc.scale
      const ly = sc.offY + lamp.y * sc.scale
      const dist = Math.hypot(cx - lx, cy - ly)
      if (dist < minDist) {
        minDist = dist
        closestIdx = idx
      }
    })

    if (closestIdx !== -1) {
      setIrregDisabledLamps(prev => {
        if (prev.includes(closestIdx)) {
          return prev.filter(i => i !== closestIdx)
        } else {
          return [...prev, closestIdx]
        }
      })
    }
  }, [isCalculated, calcResult, shape, parsedP, adjustedPts, customClosed, lampLen, irregOverrideBaris, irregOverrideLpb])

  const handleShapeChange = (s: string) => {
    setShape(s)
    if (s !== "custom") {
      setCustomPts([])
      setCustomClosed(false)
    }
  }

  const inRange = irregCheck.isAllOk

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md md:max-w-5xl lg:max-w-7xl flex-col bg-background px-4 md:px-6 lg:px-8 pb-32">
      <Header
        variant="dashboard-back"
        title="Kalkulator Lampu"
        subtitle="Simulasi penempatan lampu TL/LED"
        backHref="/dashboard"
      />

      {/* Responsive 2-Column Grid Layout (Mobile Stacked, Desktop Side-by-Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Store Selection & Room Canvas Form (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Shared Store Selection Prefill (Toko Terdaftar vs Toko Baru) */}
          <div className="flex flex-col gap-3 bg-muted/30 border border-border/50 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground/80">Identitas Toko</Label>
            </div>

            <div className="flex rounded-lg bg-muted/60 p-0.5">
              <button
                type="button"
                onClick={() => setStoreMode("existing")}
                className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-all ${storeMode === "existing"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Toko Terdaftar
              </button>
              <button
                type="button"
                onClick={() => setStoreMode("new")}
                className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-all ${storeMode === "new"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Toko Baru
              </button>
            </div>

            {storeMode === "existing" ? (
              <div className="flex flex-col gap-2.5">
                <StoreCombobox
                  stores={stores}
                  value={selectedStore}
                  onSelect={handleStoreSelectShared}
                  placeholder="Pilih toko audit..."
                />
                {selectedStore && (
                  <div className="grid grid-cols-3 gap-2 px-1 pt-1 text-[10px]">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Kode</span>
                      <span className="font-semibold text-foreground">{selectedStore.code}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Nama</span>
                      <span className="font-semibold text-foreground truncate max-w-[80px]">{selectedStore.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Cabang</span>
                      <span className="font-semibold text-foreground">{selectedStore.branch || "-"}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="new_store_name" className="text-[10px] font-semibold">Nama Toko</Label>
                    <Input
                      id="new_store_name"
                      placeholder="Contoh: Supratman 2"
                      value={newStoreName}
                      onChange={(e) => setNewStoreName(e.target.value)}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="new_store_branch" className="text-[10px] font-semibold">Cabang</Label>
                    <Input
                      id="new_store_branch"
                      placeholder="Contoh: Cikokol"
                      value={newStoreBranch}
                      onChange={(e) => setNewStoreBranch(e.target.value)}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="new_store_code" className="text-[10px] font-semibold">Kode Toko <span className="text-muted-foreground font-normal">(Opsional)</span></Label>
                  <Input
                    id="new_store_code"
                    placeholder="Contoh: T001 (Kosongkan jika belum ada)"
                    value={newStoreCode}
                    onChange={(e) => setNewStoreCode(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Parameter Poligon & Jarak Card */}
          <Card className="border-border/80">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold">Denah Toko (Custom Canvas)</CardTitle>
              <CardDescription className="text-[11px]">
                Klik/sentuh kanvas di bawah untuk langsung menentukan titik sudut denah toko.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-0 pb-4">
              {/* Pratinjau Bentuk Ruangan Canvas (STABLE TOP POSITION) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold text-foreground">Kanvas Denah Ruangan</Label>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {customPts.length} titik {customClosed ? "(Tertutup)" : "(Belum ditutup)"}
                  </span>
                </div>
                <div className="rounded-xl border border-border/80 overflow-hidden bg-background">
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handleCanvasPointerDown}
                    onPointerMove={handleCanvasPointerMove}
                    onPointerUp={handleCanvasPointerUp}
                    onPointerLeave={() => setHoverEdge(null)}
                    className="w-full block select-none touch-none"
                    style={{
                      height: `${CANVAS_H}px`,
                      cursor: !customClosed ? "crosshair" : "pointer"
                    }}
                  />

                  {/* Custom Canvas Controls: Directly below canvas */}
                  <div className="p-2.5 space-y-2 border-t border-border/50 bg-muted/20">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] font-medium"
                        disabled={historyPast.length === 0}
                        onClick={handleUndo}
                        title="Undo perubahan denah (Ctrl+Z)"
                      >
                        <IconArrowBackUp className="size-3.5 mr-1 text-sky-500" />
                        Undo
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] font-medium"
                        disabled={historyFuture.length === 0}
                        onClick={handleRedo}
                        title="Redo perubahan denah (Ctrl+Y)"
                      >
                        <IconArrowForwardUp className="size-3.5 mr-1 text-purple-500" />
                        Redo
                      </Button>

                      {/* Integrated Delete Point Button (Active when node selected) */}
                      <Button
                        type="button"
                        variant={selectedNodeIdx !== null ? "destructive" : "outline"}
                        size="sm"
                        className={`h-7 text-[11px] font-semibold transition-all ${
                          selectedNodeIdx !== null
                            ? "shadow-sm animate-in fade-in zoom-in-95"
                            : "opacity-50 cursor-not-allowed text-muted-foreground border-border/50"
                        }`}
                        disabled={selectedNodeIdx === null || customPts.length <= 3}
                        onClick={() => {
                          if (selectedNodeIdx !== null) {
                            setDeleteConfirmIdx(selectedNodeIdx)
                          }
                        }}
                        title={
                          selectedNodeIdx === null
                            ? "Klik salah satu titik di kanvas untuk menghapus"
                            : customPts.length <= 3
                            ? "Minimal 3 titik untuk poligon"
                            : `Hapus Titik T${selectedNodeIdx + 1}`
                        }
                      >
                        <IconTrash className="size-3.5 mr-1" />
                        {selectedNodeIdx !== null ? `Hapus T${selectedNodeIdx + 1}` : "Hapus Titik"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] font-medium"
                        onClick={() => {
                          pushCurrentToHistory()
                          setCustomPts([])
                          setCustomClosed(false)
                          setSelectedNodeIdx(null)
                        }}
                      >
                        <IconRefresh className="size-3.5 mr-1" />
                        Reset
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        className="h-7 flex-1 text-[11px] font-semibold"
                        disabled={customPts.length < 3 || customClosed}
                        onClick={() => {
                          pushCurrentToHistory()
                          setCustomClosed(true)
                        }}
                      >
                        {customClosed ? "Poligon Tertutup" : "Tutup Poligon"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10.5px] font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10"
                        onClick={() => setPresetModalOpen(true)}
                      >
                        <IconSquare className="size-3.5 mr-1 text-amber-500" />
                        Template
                      </Button>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1 border-t border-border/40">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <span className={`inline-block size-2 rounded-full ${customClosed ? "bg-emerald-500" : "bg-amber-500"}`} />
                          <span>Jumlah Titik: <b className="font-bold text-foreground">{customPts.length} Titik Sudut</b></span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${customClosed ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                          {customClosed ? "Denah Tertutup" : "Belum Tertutup"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/40 border border-border/40 rounded-lg px-2.5 py-1.5 leading-snug">
                        <span className="shrink-0">💡</span>
                        <span>Klik titik pada kanvas untuk aktifkan Hapus Titik · Drag titik untuk geser · Ctrl+Z untuk Undo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Parameter Inputs & Dynamic Segment Inputs (Below Canvas) */}
              <div className="space-y-3.5 border-t border-border/60 pt-3">
                {shape !== "custom" && (
                  /* Petunjuk Arah Dimensi (Tidak Simetris) */
                  <div className="bg-muted/20 border border-border/50 rounded-xl p-2.5 flex flex-col gap-1 text-[10px] text-muted-foreground leading-normal">
                    <div
                      className="font-bold text-foreground text-xs mb-0.5 flex items-center justify-between cursor-pointer"
                      onClick={() => setShowDimensionGuide(prev => !prev)}
                    >
                      <span className="flex items-center gap-1">💡 Petunjuk Arah Dimensi & Inisial Sisi</span>
                      <span className="text-[10px] text-muted-foreground underline font-normal">
                        {showDimensionGuide ? "Sembunyikan" : "Tampilkan"}
                      </span>
                    </div>
                    {showDimensionGuide && (
                      <div className="border-t border-border/40 pt-1.5 space-y-1 animate-in fade-in slide-in-from-top-1">
                        <div>• <b>LT / PT:</b> Lebar Total / Panjang Total (Kedalaman Utama Toko)</div>
                        <div>• <b>LA / LB:</b> Lebar Atas (Sisi Depan) / Lebar Bawah (Sisi Belakang)</div>
                        <div>• <b>PKi / PKa:</b> Panjang Dinding Kiri / Panjang Dinding Kanan</div>
                        <div>• <b>LS / PS:</b> Lebar Sayap / Panjang Sayap (Pada Bentuk L)</div>
                        <div>• <b>OM:</b> Offset Miring Dinding (Pada Trapesium)</div>
                      </div>
                    )}
                  </div>
                )}

                {shape === "rect" && (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <Label className="text-xs font-semibold">Lebar Atas (LA)</Label>
                    <Label className="text-xs font-semibold">Lebar Bawah (LB)</Label>

                    <Input
                      type="number"
                      value={p.rTop}
                      step={0.5}
                      onChange={e => setParam("rTop", e.target.value)}
                      onBlur={e => {
                        const val = parseFloat(e.target.value)
                        if (isNaN(val) || val <= 0) setParam("rTop", "1")
                      }}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      value={p.rBot}
                      step={0.5}
                      onChange={e => setParam("rBot", e.target.value)}
                      onBlur={e => {
                        const val = parseFloat(e.target.value)
                        if (isNaN(val) || val <= 0) setParam("rBot", "1")
                      }}
                      className="h-8 text-xs"
                    />

                    <Label className="text-xs font-semibold mt-1">Panjang Kiri (PKi)</Label>
                    <Label className="text-xs font-semibold mt-1">Panjang Kanan (PKa)</Label>

                    <Input
                      type="number"
                      value={p.rLeft}
                      step={0.5}
                      onChange={e => setParam("rLeft", e.target.value)}
                      onBlur={e => {
                        const val = parseFloat(e.target.value)
                        if (isNaN(val) || val <= 0) setParam("rLeft", "1")
                      }}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      value={p.rRight}
                      step={0.5}
                      onChange={e => setParam("rRight", e.target.value)}
                      onBlur={e => {
                        const val = parseFloat(e.target.value)
                        if (isNaN(val) || val <= 0) setParam("rRight", "1")
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                )}

                {shape === "trap" && (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <Label className="text-xs font-semibold">Lebar Atas (LA)</Label>
                    <Label className="text-xs font-semibold">Lebar Bawah (LB)</Label>

                    <Input
                      type="number"
                      value={p.tTop}
                      step={0.5}
                      onChange={e => setParam("tTop", e.target.value)}
                      onBlur={e => {
                        const val = parseFloat(e.target.value)
                        if (isNaN(val) || val <= 0) setParam("tTop", "1")
                      }}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      value={p.tBot}
                      step={0.5}
                      onChange={e => setParam("tBot", e.target.value)}
                      onBlur={e => {
                        const val = parseFloat(e.target.value)
                        if (isNaN(val) || val <= 0) setParam("tBot", "1")
                      }}
                      className="h-8 text-xs"
                    />

                    <Label className="text-xs font-semibold mt-1">Panjang Total (PT)</Label>
                    <Label className="text-xs font-semibold mt-1">Offset Miring (OM)</Label>

                    <Input
                      type="number"
                      value={p.tH}
                      step={0.5}
                      onChange={e => setParam("tH", e.target.value)}
                      onBlur={e => {
                        const val = parseFloat(e.target.value)
                        if (isNaN(val) || val <= 0) setParam("tH", "1")
                      }}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      value={p.tOff}
                      step={0.5}
                      onChange={e => setParam("tOff", e.target.value)}
                      onBlur={e => {
                        const val = parseFloat(e.target.value)
                        if (isNaN(val) || val < 0) setParam("tOff", "0")
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                )}

                {shape === "L" && (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <Label className="text-xs font-semibold">Lebar Total (LT)</Label>
                    <Label className="text-xs font-semibold">Panjang Total (PT)</Label>

                    <Input
                      type="number"
                      value={p.lL}
                      step={0.5}
                      onChange={e => setParam("lL", e.target.value)}
                      onBlur={e => {
                        const val = parseFloat(e.target.value)
                        if (isNaN(val) || val <= 0) setParam("lL", "1")
                      }}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      value={p.lP}
                      step={0.5}
                      onChange={e => setParam("lP", e.target.value)}
                      onBlur={e => {
                        const val = parseFloat(e.target.value)
                        if (isNaN(val) || val <= 0) setParam("lP", "1")
                      }}
                      className="h-8 text-xs"
                    />

                    <Label className="text-xs font-semibold mt-1">Lebar Sayap (LS)</Label>
                    <Label className="text-xs font-semibold mt-1">Panjang Sayap (PS)</Label>

                    <Input
                      type="number"
                      value={p.lW}
                      step={0.5}
                      onChange={e => setParam("lW", e.target.value)}
                      onBlur={e => {
                        const val = parseFloat(e.target.value)
                        if (isNaN(val) || val <= 0) setParam("lW", "1")
                      }}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      value={p.lH}
                      step={0.5}
                      onChange={e => setParam("lH", e.target.value)}
                      onBlur={e => {
                        const val = parseFloat(e.target.value)
                        if (isNaN(val) || val <= 0) setParam("lH", "1")
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                )}

                {/* Dynamic segment length inputs (Scrollable below canvas) */}
                {shape === "custom" && customPts.length >= 2 && (
                  <div className="bg-muted/30 border border-border/50 rounded-xl p-3 space-y-3">
                    <div className="space-y-1.5 border-b border-border/40 pb-2.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Sesuaikan Panjang Sisi Dinding (m)
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                        <span className="text-muted-foreground font-medium">Arah Pergeseran Dinding:</span>
                        <div className="flex rounded-md bg-muted/80 p-0.5 text-[9.5px]">
                          <button
                            type="button"
                            onClick={() => setExpandDir("start")}
                            className={`px-2 py-0.5 rounded transition-all ${expandDir === "start" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground font-medium"}`}
                            title="Hanya geser titik awal Ti"
                          >
                            Titik Awal (Ti)
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandDir("center")}
                            className={`px-2 py-0.5 rounded transition-all ${expandDir === "center" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground font-medium"}`}
                            title="Geser kedua titik secara simetris dari tengah"
                          >
                            ↔️ Simetris
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandDir("end")}
                            className={`px-2 py-0.5 rounded transition-all ${expandDir === "end" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground font-medium"}`}
                            title="Hanya geser titik akhir Ti+1"
                          >
                            Titik Akhir (Ti+1)
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-1">
                      {segmentLengths.map((len, idx) => {
                        const p1Name = `T${idx + 1}`
                        const p2Name = `T${((idx + 1) % customPts.length) + 1}`
                        const isClosing = idx === customPts.length - 1 && !customClosed

                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] font-semibold text-foreground/80">
                                Sisi {p1Name} ke {p2Name} {isClosing ? "(Belum Tutup)" : ""}
                              </Label>
                              {customPts.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmIdx(idx)}
                                  className="text-muted-foreground hover:text-destructive p-0.5 transition-colors"
                                  title={`Hapus Titik ${p1Name}`}
                                >
                                  <IconTrash className="size-3" />
                                </button>
                              )}
                            </div>
                            <Input
                              type="number"
                              step={0.5}
                              min={0.5}
                              value={len}
                              onChange={(e) => {
                                const val = e.target.value
                                setSegmentLengths(prev => {
                                  const next = [...prev]
                                  next[idx] = val as any
                                  return next
                                })
                                const numVal = parseFloat(val)
                                if (!isNaN(numVal) && numVal > 0) {
                                  handleUpdateSegmentLength(idx, numVal)
                                }
                              }}
                              onBlur={(e) => {
                                const numVal = parseFloat(e.target.value)
                                if (!isNaN(numVal) && numVal > 0) {
                                  handleUpdateSegmentLength(idx, numVal)
                                }
                              }}
                              className="h-7 text-[11px]"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Layout calculation tweaks (Fixed and Automatic) */}
              <div className="space-y-3.5 border-t border-border/60 pt-3">
                {/* Spesifikasi Lampu Read-Only (Standar Audit) */}
                <div className="bg-muted/30 rounded-xl p-2.5 border border-border/50 text-[10px] text-muted-foreground leading-normal flex items-center gap-2">
                  <IconBulb className="size-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground block">Spesifikasi Lampu Standar Audit</span>
                    TL LED 1.22 meter (13.5 Watt) per unit.
                  </div>
                </div>
              </div>

              {/* Hitung Penempatan Button for Non-Symmetrical */}
              <Button
                type="button"
                className="w-full h-9 mt-4 text-xs font-semibold"
                disabled={shape === "custom" && !customClosed}
                onClick={() => {
                  setIsCalculated(true)
                  setIrregOverrideBaris(null)
                  setIrregOverrideLpb(null)
                  setIrregDisabledLamps([])
                }}
              >
                Hitung Penempatan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Calculated Results & Plotted Canvas (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          {isCalculated ? (
            <div className="space-y-4">
              {/* Hasil Kalkulasi Card */}
              <Card className={`transition-all duration-300 ${irregCheck.overallStatus === "ideal"
                ? "border-emerald-500/25 bg-emerald-50/30 dark:bg-emerald-950/15"
                : irregCheck.overallStatus === "toleransi"
                  ? "border-sky-500/25 bg-sky-50/30 dark:bg-sky-950/15"
                  : "border-amber-500/25 bg-amber-50/30 dark:bg-amber-950/15"
                }`}>
                <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-semibold">Hasil Kalkulasi — Tidak Simetris</CardTitle>
                  <span
                    onClick={() => setInfoOpen(true)}
                    className={`text-[10px] px-3 py-1 rounded-full font-semibold cursor-pointer flex items-center gap-1.5 shrink-0 hover:opacity-80 active:opacity-60 ${irregCheck.overallStatus === "ideal"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : irregCheck.overallStatus === "toleransi"
                        ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}>
                    {irregCheck.statusLabel}
                    <IconInfoCircle className="size-3" />
                  </span>
                </CardHeader>
                <CardContent className="pt-0 pb-4 space-y-2.5">
                  {calcResult ? (
                    <>
                      {/* Range Result Prominent Banner */}
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center space-y-1.5 mb-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estimasi Kebutuhan Titik Lampu (Range)</div>
                        <div className="text-2xl font-extrabold text-primary">
                          {stats.nmin} – {stats.nmax} <span className="text-sm font-semibold text-muted-foreground">Titik Lampu</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium text-muted-foreground">
                          <div>
                            Daya Total: <span className="font-semibold text-foreground">{(stats.nmin * watt).toFixed(0)} W – {(stats.nmax * watt).toFixed(0)} W</span>
                          </div>
                          <div className="hidden sm:inline text-muted-foreground/40">•</div>
                          <div>
                            Kerapatan Daya: <span className="font-semibold text-foreground">{stats.luas > 0 ? `${((stats.nmin * watt) / stats.luas).toFixed(2)} – ${((stats.nmax * watt) / stats.luas).toFixed(2)}` : "0.00"} W/m²</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <StatBox label="Estimasi" subLabel="Jumlah Baris" value={stats.nRow} unit=" baris" />
                        <StatBox label="Estimasi Unit" subLabel="Per Baris" value={stats.nPerRow} unit=" unit" />
                        <StatBox label="Jarak" subLabel="Per Baris" value={Number(stats.rowSpacing)?.toFixed(2)} unit=" m" variant={Number(stats.rowSpacing) <= 1.9 ? "success" : Number(stats.rowSpacing) <= 2.2 ? "info" : "warning"} />
                        <StatBox label="Jarak" subLabel="Samping" value={activeMargin.toFixed(2)} unit=" m" variant={irregCheck.sampingStatus === "ok" ? "success" : activeMargin >= 0.2 && activeMargin <= 0.8 ? "info" : "warning"} />
                      </div>
                      <SmartSuggestions rasio={stats.luas > 0 ? (stats.n * watt) / stats.luas : 0} check={irregCheck} />

                      {/* Compliance Info / Warning Alerts */}
                      {irregCheck.overallStatus === "ideal" ? (
                        <div className="mt-2.5 p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/15 text-emerald-800 dark:text-emerald-300 text-[11px] space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
                            ✨ Tata Letak Memenuhi Standar Ideal:
                          </div>
                          <p className="pl-1 text-emerald-700 dark:text-emerald-400 font-medium leading-normal">
                            Seluruh parameter penempatan lampu berada dalam rentang ideal (kerapatan daya, jarak samping, dan jarak baris optimal).
                          </p>
                          <button
                            type="button"
                            onClick={() => setInfoOpen(true)}
                            className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold underline mt-1 block hover:opacity-80"
                          >
                            Lihat Detail Standar Acuan &rarr;
                          </button>
                        </div>
                      ) : irregCheck.overallStatus === "toleransi" ? (
                        <div className="mt-2.5 p-2.5 rounded-xl border border-sky-500/20 bg-sky-50/30 dark:bg-sky-950/15 text-sky-800 dark:text-sky-300 text-[11px] space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-sky-800 dark:text-sky-400">
                            🔵 Standar Toleransi (Penyesuaian Layout Toko):
                          </div>
                          <p className="pl-1 text-sky-700 dark:text-sky-400 font-medium leading-normal">
                            Tata letak ini disesuaikan dengan dimensi toko dan merupakan opsi paling seimbang (optimal). Parameter masih dalam batas toleransi teknis yang aman.
                          </p>
                          <button
                            type="button"
                            onClick={() => setInfoOpen(true)}
                            className="text-[10px] text-sky-600 dark:text-sky-400 font-bold underline mt-1 block hover:opacity-80"
                          >
                            Lihat Detail Standar Acuan &rarr;
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2.5 p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300 text-[11px] space-y-1.5">
                          <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                            ⚠️ Parameter Di Luar Standar:
                          </div>
                          <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                            {irregCheck.issues.map((issue, idx) => (
                              <li key={idx} className="text-amber-700 dark:text-amber-400 font-medium">{issue}</li>
                            ))}
                          </ul>
                          <button
                            type="button"
                            onClick={() => setInfoOpen(true)}
                            className="text-[10px] text-amber-600 dark:text-amber-400 font-bold underline mt-1.5 block hover:opacity-80"
                          >
                            Lihat Detail Standar Acuan &rarr;
                          </button>
                        </div>
                      )}

                      {irregDisabledLamps.length > 0 && (
                        <div className="border-t border-border/60 pt-2 mt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setIrregDisabledLamps([])}
                            className="text-[10px] text-primary hover:underline font-semibold"
                          >
                            Reset Lampu Nonaktif ({irregDisabledLamps.length})
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
                      Tidak ada konfigurasi otomatis yang memenuhi standar rasio 4.0 – 5.0 W/m² untuk dimensi ini. Coba sesuaikan koordinat atau bentuk bangunan.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Denah Penempatan Card (with lamps) */}
              <Card className="border-border/80 overflow-hidden">
                <CardHeader className="py-2.5 px-4 bg-muted/40 border-b border-border/80 flex flex-row justify-between items-center space-y-0">
                  <CardTitle className="text-xs font-bold">Referensi Denah Penempatan</CardTitle>
                  {stats.n > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold cursor-pointer flex items-center gap-1 ${inRange ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}
                      onClick={() => setInfoOpen(true)}
                    >
                      {inRange ? "Dalam Standar" : "Di Luar Standar"}
                      <IconInfoCircle className="size-3" />
                    </span>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <canvas
                    ref={resultCanvasRef}
                    onClick={handleResultCanvasClick}
                    className="w-full block cursor-pointer"
                    style={{
                      height: `${CANVAS_H}px`
                    }}
                  />
                  <div className="p-3 text-[10px] text-muted-foreground border-t border-border/50 leading-relaxed">
                    <div className="flex gap-4 mb-1.5 text-[10px] font-medium justify-center">
                      <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold">
                        <span className="inline-block size-1.5 bg-emerald-500 rounded-full" />
                        Layout Acuan Visual ({stats.n} Titik)
                      </span>
                      <span className="flex items-center gap-1">Grid: {stats.nRow} baris × {stats.nPerRow} kolom</span>
                    </div>
                    <div>
                      {stats.n} lampu terplot · {stats.nRow} baris × {stats.nPerRow}/baris · Jarak baris: {stats.rowSpacing}m · Margin: {activeMargin.toFixed(2)}m · Luas: {stats.luas}m²
                    </div>
                    <div className="text-amber-600 dark:text-amber-400 font-medium mt-1">
                      💡 Sentuh/klik lampu di denah untuk menonaktifkan atau mengaktifkan kembali lampu tertentu secara manual.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3 px-4">
                    <input
                      id="show-dimensions-irreg"
                      type="checkbox"
                      checked={showDimensions}
                      onChange={e => setShowDimensions(e.target.checked)}
                      className="size-3.5 rounded-sm border-gray-300 accent-primary"
                    />
                    <label htmlFor="show-dimensions-irreg" className="text-[11px] font-medium text-muted-foreground cursor-pointer select-none">
                      Tampilkan Dimensi & Legenda
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="button"
                onClick={() => handleSaveResult("tidak-simetris")}
                disabled={isSaving}
                className="w-full h-9 text-xs font-semibold"
              >
                <IconDownload className="mr-1.5 size-4" />
                {isSaving ? "Menyimpan..." : "Unduh Hasil Estimasi"}
              </Button>
            </div>
          ) : (
            <Card className="border-dashed border-border/80 bg-muted/20">
              <CardContent className="p-6 text-center space-y-3 flex flex-col items-center justify-center min-h-[320px]">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <IconBulb className="size-6" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h3 className="text-sm font-bold text-foreground">Hasil Kalkulasi & Visualisasi</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tentukan denah toko pada kanvas di sebelah kiri, lalu klik <strong>Hitung Penempatan</strong> untuk melihat estimasi titik lampu & analisis kerapatan daya.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BottomNavigation />

      {/* Hidden result card for image capture */}
      {exportCardData && (
        <LightEstimationResultCard
          cardRef={exportCardRef}
          data={exportCardData}
        />
      )}

      {/* Dialog Penjelasan Standar Tata Letak & Daya */}
      {(() => {
        const activeCheck = irregCheck
        const currentRasio = activeIrregRasio
        const currentSamping = activeMargin
        const currentBaris = Number(stats.rowSpacing) || 0

        return (
          <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
            <DialogContent className="max-w-xs sm:max-w-md rounded-2xl p-5 gap-4">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                  <IconInfoCircle className="size-4 text-amber-500" /> Acuan Standar Tata Letak & Daya
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
                <p>
                  Untuk mencapai kenyamanan visual (lux memadai dan merata) serta efisiensi energi di area penjualan (sales area), sistem mengacu pada 3 tingkatan status penilaian berikut:
                </p>

                {/* Status Levels Explanation */}
                <div className="border border-border/60 rounded-xl p-3 bg-muted/30 space-y-2">
                  <span className="font-bold text-foreground block text-[11px]">Kategori Status Penilaian:</span>
                  <div className="space-y-1.5 text-[10.5px]">
                    <div className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="inline-block size-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <div>
                        <b>🟢 Standar Ideal:</b> Semua parameter (4.0–5.0 W/m², samping 0.3–0.6m, baris ≤1.9m) masuk target baku.
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5 text-sky-600 dark:text-sky-400 font-semibold">
                      <span className="inline-block size-2 rounded-full bg-sky-500 mt-1 shrink-0" />
                      <div>
                        <b>🔵 Standar Toleransi:</b> Opsi paling optimal untuk geometri denah toko (W/m² 3.5–5.5, samping 0.2–0.8m, baris ≤2.2m).
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                      <span className="inline-block size-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                      <div>
                        <b>🟡 Di Luar Standar:</b> Nilai kerapatan atau jarak melebihi batas toleransi wajar.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* 1. Kerapatan Daya */}
                  <div className="border border-border/60 rounded-xl p-3 bg-muted/20 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">1. Kerapatan Daya (Target: 4.0 - 5.0 W/m²)</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeCheck.rasioStatus === "ok"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : currentRasio >= 3.5 && currentRasio <= 5.5
                          ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                        {activeCheck.rasioStatus === "ok" ? "Lolos Ideal" : currentRasio >= 3.5 && currentRasio <= 5.5 ? "Batas Toleransi" : activeCheck.rasioStatus === "low" ? "Terlalu Rendah" : "Terlalu Tinggi"}
                      </span>
                    </div>
                    <p className="text-[10.5px]">
                      Mengukur konsumsi listrik pencahayaan per meter persegi. Nilai aktif saat ini: <strong className="text-foreground">{currentRasio.toFixed(2)} W/m²</strong>.
                    </p>
                    {activeCheck.rasioStatus !== "ok" && (
                      <p className={`text-[10px] font-medium ${currentRasio >= 3.5 && currentRasio <= 5.5 ? "text-sky-600 dark:text-sky-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {currentRasio >= 3.5 && currentRasio <= 5.5
                          ? "ℹ️ Berada dalam batas toleransi wajar penyesuaian denah toko."
                          : activeCheck.rasioStatus === "low"
                            ? "⚠️ Kerapatan daya terlalu rendah, toko berpotensi redup."
                            : "⚠️ Kerapatan daya terlalu tinggi, terjadi pemborosan energi."}
                      </p>
                    )}
                  </div>

                  {/* 2. Jarak Samping */}
                  <div className="border border-border/60 rounded-xl p-3 bg-muted/20 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">2. Jarak Samping (Target: 0.3 - 0.6 m)</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeCheck.sampingStatus === "ok"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : currentSamping >= 0.2 && currentSamping <= 0.8
                          ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                        {activeCheck.sampingStatus === "ok" ? "Lolos Ideal" : currentSamping >= 0.2 && currentSamping <= 0.8 ? "Batas Toleransi" : activeCheck.sampingStatus === "near" ? "Terlalu Dekat" : "Terlalu Jauh"}
                      </span>
                    </div>
                    <p className="text-[10.5px]">
                      Jarak dari ujung lampu terluar ke dinding samping. Nilai aktif saat ini: <strong className="text-foreground">{currentSamping.toFixed(2)} m</strong>.
                    </p>
                    {activeCheck.sampingStatus !== "ok" && (
                      <p className={`text-[10px] font-medium ${currentSamping >= 0.2 && currentSamping <= 0.8 ? "text-sky-600 dark:text-sky-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {currentSamping >= 0.2 && currentSamping <= 0.8
                          ? "ℹ️ Berada dalam batas toleransi wajar penyesuaian denah toko."
                          : activeCheck.sampingStatus === "near"
                            ? "⚠️ Lampu terlalu mepet dinding, cahaya tidak efektif menerangi rak."
                            : "⚠️ Lampu terlalu jauh dari dinding, sudut ruangan/rak samping berpotensi gelap."}
                      </p>
                    )}
                  </div>

                  {/* 3. Jarak Baris */}
                  <div className="border border-border/60 rounded-xl p-3 bg-muted/20 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">3. Jarak Antar Baris (Target: ≤ 1.9 m)</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeCheck.barisStatus === "ok"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : currentBaris <= 2.2
                          ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                        {activeCheck.barisStatus === "ok" ? "Lolos Ideal" : currentBaris <= 2.2 ? "Batas Toleransi" : "Terlalu Lebar"}
                      </span>
                    </div>
                    <p className="text-[10.5px]">
                      Jarak antar baris lampu (atau jarak ke dinding depan/belakang). Nilai aktif saat ini: <strong className="text-foreground">{currentBaris.toFixed(2)} m</strong>.
                    </p>
                    {activeCheck.barisStatus !== "ok" && (
                      <p className={`text-[10px] font-medium ${currentBaris <= 2.2 ? "text-sky-600 dark:text-sky-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {currentBaris <= 2.2
                          ? "ℹ️ Berada dalam batas toleransi wajar penyesuaian denah toko."
                          : "⚠️ Jarak baris melebihi 2.2m, kerataan cahaya tidak optimal (timbul area bayangan)."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )
      })()}

      {/* Preset Shape Generator Dialog */}
      <Dialog open={presetModalOpen} onOpenChange={setPresetModalOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <IconSquare className="size-4 text-amber-500" /> Template Denah Toko
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              Gunakan template jika Anda ingin me-generate denah awal secara otomatis tanpa gambar manual.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {/* Shape Template Segmented Switcher */}
            <div className="flex rounded-lg bg-muted/60 p-0.5 mb-1">
              <button
                type="button"
                onClick={() => setPresetType("rect")}
                className={`flex-1 rounded-md py-1 text-[10px] transition-all ${presetType === "rect" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground font-medium"}`}
              >
                Persegi PxL
              </button>
              <button
                type="button"
                onClick={() => setPresetType("L")}
                className={`flex-1 rounded-md py-1 text-[10px] transition-all ${presetType === "L" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground font-medium"}`}
              >
                Bentuk L
              </button>
              <button
                type="button"
                onClick={() => setPresetType("cutout")}
                className={`flex-1 rounded-md py-1 text-[10px] transition-all ${presetType === "cutout" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground font-medium"}`}
              >
                Cutout AC
              </button>
            </div>
            {presetType === "rect" && (
              <div className="space-y-3">
                {/* Visual Guide Diagram */}
                <div className="bg-slate-50 dark:bg-[#0c0d12] border border-border/70 rounded-xl p-2 flex flex-col items-center justify-center">
                  <svg width="180" height="85" viewBox="0 0 180 85" className="block">
                    <rect x="35" y="22" width="110" height="45" fill="rgba(245,158,11,0.06)" stroke="#f59e0b" strokeWidth="1.5" rx="2" />
                    <text x="90" y="47" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f59e0b">Area Sales Toko</text>
                    {/* LT Arrow */}
                    <line x1="35" y1="13" x2="145" y2="13" stroke="#38bdf8" strokeWidth="1.2" />
                    <text x="90" y="9" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0284c7">Lebar Toko (LT)</text>
                    {/* PT Arrow */}
                    <line x1="23" y1="22" x2="23" y2="67" stroke="#c4b5fd" strokeWidth="1.2" />
                    <text x="18" y="45" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#7c3aed" transform="rotate(-90, 18, 45)">Panjang Toko (PT)</text>
                  </svg>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="rect_lebar" className="text-xs font-semibold text-sky-700 dark:text-sky-400">Lebar Toko (LT)</Label>
                    <div className="relative">
                      <Input
                        id="rect_lebar"
                        type="number"
                        value={presetRectForm.lebar}
                        onChange={e => setPresetRectForm(prev => ({ ...prev, lebar: e.target.value }))}
                        className="h-8 text-xs pr-6 font-semibold"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="rect_panjang" className="text-xs font-semibold text-purple-700 dark:text-purple-400">Panjang Toko (PT)</Label>
                    <div className="relative">
                      <Input
                        id="rect_panjang"
                        type="number"
                        value={presetRectForm.panjang}
                        onChange={e => setPresetRectForm(prev => ({ ...prev, panjang: e.target.value }))}
                        className="h-8 text-xs pr-6 font-semibold"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {presetType === "L" && (
              <div className="space-y-3">
                {/* Visual Guide Diagram */}
                <div className="bg-slate-50 dark:bg-[#0c0d12] border border-border/70 rounded-xl p-2 flex flex-col items-center justify-center">
                  <svg width="200" height="105" viewBox="0 0 200 105" className="block">
                    <path d="M 40 22 L 150 22 L 150 55 L 95 55 L 95 90 L 40 90 Z" fill="rgba(56,189,248,0.06)" stroke="#0284c7" strokeWidth="1.5" />
                    <text x="70" y="45" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0284c7">Denah L</text>
                    
                    {/* PT */}
                    <line x1="28" y1="22" x2="28" y2="90" stroke="#7c3aed" strokeWidth="1.2" />
                    <text x="22" y="56" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#7c3aed" transform="rotate(-90, 22, 56)">Panjang Total (PT)</text>

                    {/* LT */}
                    <line x1="40" y1="97" x2="95" y2="97" stroke="#0284c7" strokeWidth="1.2" />
                    <text x="67" y="95" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#0284c7">Lebar Total (LT)</text>

                    {/* LS */}
                    <line x1="40" y1="15" x2="150" y2="15" stroke="#f59e0b" strokeWidth="1.2" />
                    <text x="95" y="11" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#d97706">Lebar Sayap (LS)</text>

                    {/* PS */}
                    <line x1="158" y1="22" x2="158" y2="55" stroke="#10b981" strokeWidth="1.2" />
                    <text x="164" y="40" textAnchor="start" fontSize="7.5" fontWeight="bold" fill="#059669">Panjang Sayap (PS)</text>
                  </svg>
                  <div className="text-[9px] text-muted-foreground text-center mt-1">
                    💡 <b>LS & PS</b> adalah ukuran tonjolan sayap bagian kanan/atas denah L.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-purple-700 dark:text-purple-400">Panjang Total (PT)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={presetLForm.p}
                        onChange={e => setPresetLForm(prev => ({ ...prev, p: e.target.value }))}
                        className="h-8 text-xs pr-6 font-semibold"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-sky-700 dark:text-sky-400">Lebar Total (LT)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={presetLForm.l}
                        onChange={e => setPresetLForm(prev => ({ ...prev, l: e.target.value }))}
                        className="h-8 text-xs pr-6 font-semibold"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-amber-700 dark:text-amber-400">Lebar Sayap (LS)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={presetLForm.w}
                        onChange={e => setPresetLForm(prev => ({ ...prev, w: e.target.value }))}
                        className="h-8 text-xs pr-6 font-semibold"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Panjang Sayap (PS)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={presetLForm.h}
                        onChange={e => setPresetLForm(prev => ({ ...prev, h: e.target.value }))}
                        className="h-8 text-xs pr-6 font-semibold"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {presetType === "cutout" && (
              <div className="space-y-3">
                {/* Visual Guide Diagram */}
                <div className="bg-slate-50 dark:bg-[#0c0d12] border border-border/70 rounded-xl p-2 flex flex-col items-center justify-center">
                  <svg width="200" height="105" viewBox="0 0 200 105" className="block">
                    <path d="M 40 22 L 150 22 L 150 60 L 115 60 L 115 90 L 40 90 Z" fill="rgba(16,185,129,0.06)" stroke="#059669" strokeWidth="1.5" />
                    <rect x="115" y="60" width="35" height="30" fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
                    <text x="132" y="77" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#ef4444">Chiller/AC</text>

                    {/* LT */}
                    <line x1="40" y1="15" x2="150" y2="15" stroke="#0284c7" strokeWidth="1.2" />
                    <text x="95" y="11" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#0284c7">Lebar Total (LT)</text>

                    {/* PT */}
                    <line x1="28" y1="22" x2="28" y2="90" stroke="#7c3aed" strokeWidth="1.2" />
                    <text x="22" y="56" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#7c3aed" transform="rotate(-90, 22, 56)">Panjang Total (PT)</text>

                    {/* Lebar Cutout */}
                    <line x1="115" y1="53" x2="150" y2="53" stroke="#ef4444" strokeWidth="1.2" />
                    <text x="132" y="49" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#dc2626">Lebar Cutout</text>

                    {/* Panjang Cutout */}
                    <line x1="158" y1="60" x2="158" y2="90" stroke="#ef4444" strokeWidth="1.2" />
                    <text x="164" y="75" textAnchor="start" fontSize="7" fontWeight="bold" fill="#dc2626">Panjang Cutout</text>
                  </svg>
                  <div className="text-[9px] text-muted-foreground text-center mt-1">
                    💡 <b>Cutout</b> adalah ceruk/potongan tempat chiller/kulkas/AC berada.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-purple-700 dark:text-purple-400">Panjang Total (PT)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={presetCutoutForm.p}
                        onChange={e => setPresetCutoutForm(prev => ({ ...prev, p: e.target.value }))}
                        className="h-8 text-xs pr-6 font-semibold"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-sky-700 dark:text-sky-400">Lebar Total (LT)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={presetCutoutForm.l}
                        onChange={e => setPresetCutoutForm(prev => ({ ...prev, l: e.target.value }))}
                        className="h-8 text-xs pr-6 font-semibold"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-red-700 dark:text-red-400">Lebar Cutout</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={presetCutoutForm.cutoutW}
                        onChange={e => setPresetCutoutForm(prev => ({ ...prev, cutoutW: e.target.value }))}
                        className="h-8 text-xs pr-6 font-semibold"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-red-700 dark:text-red-400">Panjang Cutout</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={presetCutoutForm.cutoutH}
                        onChange={e => setPresetCutoutForm(prev => ({ ...prev, cutoutH: e.target.value }))}
                        className="h-8 text-xs pr-6 font-semibold"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPresetModalOpen(false)}
              className="h-8 text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApplyPreset}
              className="h-8 text-xs font-semibold"
            >
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Edit Canvas Dimension Dialog */}
      <Dialog open={!!canvasEditTarget} onOpenChange={open => !open && setCanvasEditTarget(null)}>
        <DialogContent className="max-w-xs p-4 rounded-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
              <IconEdit className="size-4 text-primary" />
              Ubah Ukuran Dinding
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {canvasEditTarget?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">Panjang Dinding Baru (meter)</Label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.5}
                  min={0.5}
                  autoFocus
                  value={canvasEditTarget?.value ?? ""}
                  onChange={e => setCanvasEditTarget(prev => prev ? { ...prev, value: e.target.value } : null)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleSaveCanvasEdit()
                  }}
                  className="h-9 pr-7 text-xs font-bold"
                />
                <span className="absolute right-2.5 top-2.5 text-xs text-muted-foreground font-semibold">m</span>
              </div>
            </div>

            {canvasEditTarget?.segmentIdx !== undefined && (
              <div className="space-y-1.5 border-t border-border/50 pt-2">
                <Label className="text-[11px] font-semibold text-muted-foreground">Arah Pergeseran Dinding</Label>
                <div className="flex rounded-lg bg-muted/60 p-0.5">
                  <button
                    type="button"
                    onClick={() => setExpandDir("start")}
                    className={`flex-1 rounded-md py-1 text-[10px] transition-all ${expandDir === "start" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground font-medium"}`}
                  >
                    Titik T{canvasEditTarget.segmentIdx + 1}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandDir("center")}
                    className={`flex-1 rounded-md py-1 text-[10px] transition-all ${expandDir === "center" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground font-medium"}`}
                  >
                    ↔️ Simetris
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandDir("end")}
                    className={`flex-1 rounded-md py-1 text-[10px] transition-all ${expandDir === "end" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground font-medium"}`}
                  >
                    Titik T{((canvasEditTarget.segmentIdx + 1) % (customPts.length || 1)) + 1}
                  </button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setCanvasEditTarget(null)} className="h-8 text-xs">
              Batal
            </Button>
            <Button type="button" size="sm" onClick={handleSaveCanvasEdit} className="h-8 text-xs font-semibold">
              Simpan Ukuran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Node Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmIdx !== null} onOpenChange={open => !open && setDeleteConfirmIdx(null)}>
        <DialogContent className="max-w-xs p-4 rounded-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
              <IconTrash className="size-4 text-destructive" />
              Hapus Titik Sudut T{deleteConfirmIdx !== null ? deleteConfirmIdx + 1 : ""}?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menghapus titik sudut T{deleteConfirmIdx !== null ? deleteConfirmIdx + 1 : ""} dari denah toko ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeleteConfirmIdx(null)} className="h-8 text-xs">
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (deleteConfirmIdx !== null) handleDeleteCustomPoint(deleteConfirmIdx)
              }}
              className="h-8 text-xs font-semibold"
            >
              Hapus Titik
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
