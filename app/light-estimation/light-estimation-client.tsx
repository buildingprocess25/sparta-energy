"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { IconBulb, IconArrowLeft, IconRefresh, IconGrid3x3, IconPolygon, IconSquare, IconChevronRight, IconDownload, IconInfoCircle, IconCheck } from "@tabler/icons-react"
import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StoreCombobox } from "@/components/audit/store-combobox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  LAMP_WATT,
  LAMP_LEN,
  LAMP_TUBE_W
} from "@/lib/lamp-calculator"
import { calcPolygonArea, Point } from "@/lib/polygon-utils"
import type { StoreData } from "@/app/audit/start/start-client"

interface LightEstimationClientProps {
  stores: StoreData[]
}

const CANVAS_H = 340
const FIXED_SCALE = 24 // px/m for custom drawing
const FIXED_OX = 30    // X offset for origin
const FIXED_OY = 30    // Y offset for origin

const SHAPES = [
  { id: "rect", label: "Kotak Tidak Simetris" },
  { id: "trap", label: "Trapesium" },
  { id: "L", label: "Bentuk L" },
  { id: "custom", label: "Kustom (Gambar Titik)" },
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
  const [activeTab, setActiveTab] = useState<string>("simetris")
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
    const range = calcLampRange(area)
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

  // ── Symmetrical Ratio Bar Component ──
  const RatioBar = ({ rasio, check }: { rasio: number; check: StandardCheckResult }) => {
    const pct = Math.min(100, Math.max(0, ((rasio - 3.5) / (5.5 - 3.5)) * 100))
    const minPct = ((4.0 - 3.5) / (5.5 - 3.5)) * 100
    const maxPct = ((5.0 - 3.5) / (5.5 - 3.5)) * 100

    let color = "#10b981"
    if (check.overallStatus === "toleransi") {
      color = "#3b82f6"
    } else if (check.overallStatus === "diluar") {
      color = "#f59e0b"
    }

    return (
      <div className="space-y-1.5 mt-2">
        <div className="flex justify-between text-[11px] font-medium">
          <span className="text-muted-foreground">3.5 W/m²</span>
          <span
            style={{ color }}
            className="font-semibold text-xs flex items-center gap-1 cursor-pointer select-none hover:opacity-80 active:opacity-60"
            onClick={() => setInfoOpen(true)}
          >
            {rasio.toFixed(2)} W/m² ({check.statusLabel})
            <IconInfoCircle className="inline size-3.5 opacity-80" />
          </span>
          <span className="text-muted-foreground">5.5 W/m²</span>
        </div>
        <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
          <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500" style={{ left: `${minPct}%` }} />
          <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500" style={{ left: `${maxPct}%` }} />
        </div>
      </div>
    )
  }

  // ── Symmetrical StatBox Component ──
  const StatBox = ({ 
    label, 
    value, 
    unit, 
    variant = "default" 
  }: { 
    label: string, 
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

    return (
      <div className={`rounded-xl border p-2.5 text-center flex flex-col justify-center transition-colors duration-300 ${cardCls}`}>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={`text-base font-bold mt-0.5 ${textCls}`}>
          {value}<span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
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
  const [shape, setShape] = useState<string>("rect")
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
  const [customPts, setCustomPts] = useState<Point[]>([])
  const [customClosed, setCustomClosed] = useState<boolean>(false)
  const [segmentLengths, setSegmentLengths] = useState<(number | string)[]>([])

  // Keep segmentLengths in sync with customPts and customClosed
  useEffect(() => {
    if (customPts.length < 2) {
      setSegmentLengths([])
      return
    }
    const count = customClosed ? customPts.length : customPts.length - 1
    setSegmentLengths(prev => {
      const next = [...prev]
      for (let i = next.length; i < count; i++) {
        const p1 = customPts[i]
        const p2 = customPts[(i + 1) % customPts.length]
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
        next.push(Number(dist.toFixed(1)))
      }
      if (next.length > count) {
        next.length = count
      }
      return next
    })
  }, [customPts, customClosed])

  // Compute adjusted points based on segment lengths
  const adjustedPts = useMemo(() => {
    if (customPts.length === 0) return []
    if (customPts.length === 1) return customPts
    if (segmentLengths.length === 0) return customPts

    const result: Point[] = [{ ...customPts[0] }]

    for (let i = 0; i < customPts.length - 1; i++) {
      const p1 = customPts[i]
      const p2 = customPts[i + 1]
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const len = Math.hypot(dx, dy)
      if (len === 0) {
        result.push({ ...p2 })
        continue
      }
      const rawUserLen = segmentLengths[i]
      const userLen = (rawUserLen !== undefined && rawUserLen !== "") ? (parseFloat(String(rawUserLen)) || len) : len
      const scale = userLen / len
      const prevAdjusted = result[i]
      result.push({
        x: prevAdjusted.x + dx * scale,
        y: prevAdjusted.y + dy * scale
      })
    }
    return result
  }, [customPts, segmentLengths])
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
    const W = canvas.offsetWidth || 340
    canvas.width = W * (window.devicePixelRatio || 1)
    canvas.height = CANVAS_H * (window.devicePixelRatio || 1)
    canvas.style.width = W + "px"
    canvas.style.height = CANVAS_H + "px"
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, CANVAS_H)

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

            // Halo stroke
            ctx.strokeStyle = bgFill
            ctx.lineWidth = 3
            ctx.lineJoin = "round"
            ctx.strokeText(segText, 0, 0)

            // Crisp fill text
            ctx.fillStyle = isDark ? "#34d399" : "#047857"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
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
        ctx.lineWidth = 3.5
        ctx.lineJoin = "round"
        ctx.strokeText(text, 0, 0)
        // Crisp fill text
        ctx.fillStyle = color
        ctx.fillText(text, 0, 0)
      } else {
        // Halo outline
        ctx.strokeStyle = bgFill
        ctx.lineWidth = 3.5
        ctx.lineJoin = "round"
        ctx.strokeText(text, x, y)
        // Crisp fill text
        ctx.fillStyle = color
        ctx.fillText(text, x, y)
      }
      ctx.restore()
    }

    // Render Bottom (LT) and Left (PT) Bounding Dimensions
    drawHaloText(`${sc.rW.toFixed(1)}m (LT)`, sc.offX + (sc.rW * sc.scale) / 2, sc.offY + sc.rH * sc.scale + 14, isDark ? "#38bdf8" : "#0284c7", false)
    drawHaloText(`${sc.rH.toFixed(1)}m (PT)`, sc.offX - 14, sc.offY + (sc.rH * sc.scale) / 2, isDark ? "#c4b5fd" : "#6d28d9", true)

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

          // Calculate wall angle and prevent upside-down text
          let angle = Math.atan2(dy, dx)
          if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
            angle += Math.PI
          }

          ctx.save()
          ctx.translate(labelX, labelY)
          ctx.rotate(angle)

          // Halo stroke background for legibility without background boxes
          ctx.strokeStyle = bgFill
          ctx.lineWidth = 3
          ctx.lineJoin = "round"
          ctx.strokeText(label, 0, 0)

          // Crisp filled text aligned parallel to wall
          ctx.fillStyle = isDark ? "#34d399" : "#047857"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
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
        ctx.beginPath(); ctx.arc(sp.cx, sp.cy, idx === 0 ? 5 : 3.5, 0, Math.PI * 2)
        ctx.fillStyle = idx === 0 ? "rgba(245,158,11,0.5)" : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)")
        ctx.fill()
        ctx.strokeStyle = idx === 0 ? "#f59e0b" : (isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.25)")
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.fillStyle = nodeTextFill
        ctx.font = "8px sans-serif"
        ctx.fillText(`T${idx + 1}`, sp.cx + 5, sp.cy - 5)
      })
    }
  }, [shape, parsedP, adjustedPts, customClosed, lampLen, calcResult, resolvedTheme, irregOverrideBaris, irregOverrideLpb, irregDisabledLamps, showDimensions, isSaving])

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

    setStats({
      luas: Number(luas.toFixed(1)),
      nmin: minLamps,
      nmax: maxLamps,
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

  // Canvas click handler for drawing coords
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (shape !== "custom" || customClosed || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    if (customPts.length >= 3) {
      const firstSx = FIXED_OX + customPts[0].x * FIXED_SCALE
      const firstSy = FIXED_OY + customPts[0].y * FIXED_SCALE
      if (Math.hypot(cx - firstSx, cy - firstSy) < 14) {
        setCustomClosed(true)
        return
      }
    }

    const mx = (cx - FIXED_OX) / FIXED_SCALE
    const my = (cy - FIXED_OY) / FIXED_SCALE
    const snapped = { x: Math.round(mx * 2) / 2, y: Math.round(my * 2) / 2 }
    if (snapped.x < 0 || snapped.y < 0) return
    setCustomPts(prev => [...prev, snapped])
  }, [shape, customClosed, customPts])

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
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header
        variant="dashboard-back"
        title="Kalkulator Lampu"
        subtitle="Simulasi penempatan lampu TL/LED"
        backHref="/dashboard"
      />

      {/* Shared Store Selection Prefill (Toko Terdaftar vs Toko Baru) */}
      <div className="flex flex-col gap-3 mb-4 bg-muted/30 border border-border/50 rounded-xl p-3">
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
            {!fetchedRabData ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <Input
                    id="ulok_input"
                    placeholder="Nomor ULOK (Contoh: 7AZ1-0001)"
                    value={ulokInput}
                    onChange={(e) => setUlokInput(e.target.value.toUpperCase())}
                    className="h-8 text-xs bg-background uppercase"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearchRab()
                    }}
                  />
                  <Button
                    onClick={handleSearchRab}
                    disabled={!ulokInput || isFetchingUlok}
                    className="h-8 text-[10px] font-bold"
                    size="sm"
                  >
                    {isFetchingUlok ? "Mencari..." : "Cari"}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal px-1">
                  Hanya RAB dengan status &quot;Telah Disetujui&quot;.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 bg-primary/5 p-2.5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <IconCheck className="size-3.5" /> RAB Ditemukan
                  </span>
                  <button
                    type="button"
                    className="text-[9px] text-muted-foreground hover:text-foreground underline"
                    onClick={() => {
                      setFetchedRabData(false)
                      setNewStoreCode("")
                      setNewStoreName("")
                      setNewStoreBranch("")
                      setNewStoreArea("")
                      setUlokInput("")
                    }}
                  >
                    Ganti
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] pt-0.5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Nomor ULOK</span>
                    <span className="font-semibold text-foreground">{newStoreCode}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Nama Toko</span>
                    <span className="font-semibold text-foreground truncate max-w-[120px]">{newStoreName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Cabang</span>
                    <span className="font-semibold text-foreground">{newStoreBranch || "-"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Luas Area Sales</span>
                    <span className="font-semibold text-foreground">{newStoreArea ? `${newStoreArea} m²` : "-"}</span>
                  </div>
                </div>
                {newStoreArea && (
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    💡 Luas area sales dari RAB otomatis disalin ke parameter input.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/80">
          <TabsTrigger value="simetris" className="text-xs">Simetris</TabsTrigger>
          <TabsTrigger value="tidak-simetris" className="text-xs">Tidak Simetris</TabsTrigger>
        </TabsList>

        {/* ── TABS: SIMETRIS ── */}
        <TabsContent value="simetris" className="space-y-4">
          <Card className="border-border/80">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold">Ukuran Ruangan</CardTitle>
              <CardDescription className="text-[11px]">
                Masukkan lebar, panjang, dan luas area sales untuk menghitung penempatan lampu secara simetris.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-4">
              {/* Visualisasi Dimensi Toko (Simetris) */}
              <div className="bg-muted/20 border border-border/60 rounded-xl p-3 flex flex-col gap-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Petunjuk Dimensi Ruangan</div>
                <div className="relative w-full h-[110px] rounded-lg bg-slate-50 dark:bg-[#0c0d12] border border-border/80 flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: resolvedTheme === "dark"
                        ? "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)"
                        : "linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)",
                      backgroundSize: "12px 12px"
                    }}
                  />

                  <div className="relative w-[150px] h-[55px] border-2 border-dashed border-amber-500/30 bg-amber-500/5 rounded-sm flex items-center justify-center">
                    <span className="text-[9px] font-semibold text-amber-500/80">Area Toko</span>

                    <div className="absolute -top-5 left-0 right-0 flex items-center justify-between text-muted-foreground px-0.5">
                      <span className="text-[8px] font-bold">&larr;</span>
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">Lebar Toko (LT)</span>
                      <span className="text-[8px] font-bold">&rarr;</span>
                    </div>

                    <div className="absolute -right-[75px] top-0 bottom-0 flex items-center">
                      <div className="h-full flex flex-col justify-between items-center text-muted-foreground py-0.5">
                        <span className="text-[8px] font-bold">&uarr;</span>
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 [writing-mode:vertical-lr] rotate-180">Panjang Toko (PT)</span>
                        <span className="text-[8px] font-bold">&darr;</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                <Label htmlFor="lebar" className="text-xs font-semibold">Lebar Toko (LT)</Label>
                <Label htmlFor="panjang" className="text-xs font-semibold">Panjang Toko (PT)</Label>

                <div className="relative">
                  <Input
                    id="lebar"
                    name="lebar"
                    type="number"
                    placeholder="Contoh: 12"
                    value={simForm.lebar}
                    onChange={simChange => handleSimChange(simChange)}
                    className="h-9 pr-6 text-xs"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] text-muted-foreground font-semibold">m</span>
                </div>

                <div className="relative">
                  <Input
                    id="panjang"
                    name="panjang"
                    type="number"
                    placeholder="Contoh: 10"
                    value={simForm.panjang}
                    onChange={simChange => handleSimChange(simChange)}
                    className="h-9 pr-6 text-xs"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] text-muted-foreground font-semibold">m</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="area" className="text-xs">Luas Area Sales</Label>
                  <div className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      id="auto-area"
                      type="checkbox"
                      checked={autoArea}
                      onChange={e => {
                        setAutoArea(e.target.checked)
                        if (e.target.checked) {
                          const l = parseFloat(simForm.lebar)
                          const p = parseFloat(simForm.panjang)
                          if (!isNaN(l) && !isNaN(p)) {
                            setSimForm(prev => ({ ...prev, area: (l * p).toFixed(2) }))
                          }
                        }
                      }}
                      className="size-3 accent-primary"
                    />
                    <label htmlFor="auto-area" className="text-[10px] text-muted-foreground cursor-pointer">
                      Hitung otomatis
                    </label>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    id="area"
                    name="area"
                    type="number"
                    placeholder="Contoh: 120"
                    value={simForm.area}
                    onChange={simChange => handleSimChange(simChange)}
                    readOnly={autoArea}
                    className="h-9 pr-8 text-xs disabled:opacity-60"
                    style={{ opacity: autoArea ? 0.6 : 1 }}
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] text-muted-foreground font-semibold">m²</span>
                </div>
              </div>

              {/* Spesifikasi Lampu Read-Only (Standar Audit) */}
              <div className="bg-muted/30 rounded-xl p-2.5 border border-border/50 text-[10px] text-muted-foreground leading-normal flex items-center gap-2 mt-1">
                <IconBulb className="size-4 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-foreground block">Spesifikasi Lampu Standar Audit</span>
                  TL LED 1.22 meter (13.5 Watt) per unit.
                </div>
              </div>

              <Button
                type="button"
                className="w-full h-9 mt-3 text-xs font-semibold"
                disabled={!simCanCalc}
                onClick={handleSimCalc}
              >
                Hitung Penempatan
              </Button>
            </CardContent>
          </Card>

          {/* Symmetrical Results Card & SVG Preview */}
          {simResult && !simResult.error && (
            <div className="space-y-4">
              {/* Hasil Kalkulasi Card */}
              <Card className={`transition-all duration-300 ${
                simCheck.overallStatus === "ideal" 
                  ? "border-emerald-500/25 bg-emerald-50/30 dark:bg-emerald-950/15" 
                  : simCheck.overallStatus === "toleransi"
                  ? "border-sky-500/25 bg-sky-50/30 dark:bg-sky-950/15"
                  : "border-amber-500/25 bg-amber-50/30 dark:bg-amber-950/15"
              }`}>
                <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-semibold">Hasil Kalkulasi — Simetris</CardTitle>
                  <span
                    onClick={() => setInfoOpen(true)}
                    className={`text-[10px] px-3 py-1 rounded-full font-semibold cursor-pointer flex items-center gap-1.5 shrink-0 hover:opacity-80 active:opacity-60 ${
                      simCheck.overallStatus === "ideal"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : simCheck.overallStatus === "toleransi"
                        ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {simCheck.statusLabel}
                    <IconInfoCircle className="size-3" />
                  </span>
                </CardHeader>
                <CardContent className="pt-0 pb-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <StatBox label="Total Lampu" value={activeSimTotalLamps} unit=" unit" variant="default" />
                    <StatBox label="Jumlah Baris" value={activeSimBaris} unit=" baris" />
                    <StatBox label="Per Baris" value={activeSimLpb} unit=" unit" />
                    <StatBox label="Jarak Baris" value={activeSimJarakPerbaris.toFixed(2)} unit=" m" variant={activeSimJarakPerbaris <= 1.9 ? "success" : activeSimJarakPerbaris <= 2.2 ? "info" : "warning"} />
                    <StatBox label="Jarak Samping" value={activeSimJarakSamping.toFixed(2)} unit=" m" variant={simCheck.sampingStatus === "ok" ? "success" : activeSimJarakSamping >= 0.2 && activeSimJarakSamping <= 0.8 ? "info" : "warning"} />
                    <StatBox label="Rasio W/m²" value={activeSimRasio.toFixed(2)} unit=" W/m²" variant={simCheck.rasioStatus === "ok" ? "success" : activeSimRasio >= 3.5 && activeSimRasio <= 5.5 ? "info" : "warning"} />
                  </div>
                  <RatioBar rasio={activeSimRasio} check={simCheck} />
                  <SmartSuggestions rasio={activeSimRasio} check={simCheck} />

                  {/* Compliance Info / Warning Alerts */}
                  {simCheck.overallStatus === "ideal" ? (
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
                  ) : simCheck.overallStatus === "toleransi" ? (
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
                        {simCheck.issues.map((issue, idx) => (
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

                  {/* Symmetrical Grid Adjustment Steppers */}
                  <div className="border-t border-border/60 pt-3.5 mt-2 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Penyesuaian Manual</div>
                    <div className="flex gap-4 items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Baris:</span>
                        <div className="flex items-center bg-muted rounded-md p-0.5 border border-border/40">
                          <button
                            type="button"
                            onClick={() => setSimOverrideBaris(Math.max(1, activeSimBaris - 1))}
                            className="px-2 py-0.5 text-xs font-bold hover:bg-background rounded-xs"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold w-5 text-center">{activeSimBaris}</span>
                          <button
                            type="button"
                            onClick={() => setSimOverrideBaris(activeSimBaris + 1)}
                            className="px-2 py-0.5 text-xs font-bold hover:bg-background rounded-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Lampu/Baris:</span>
                        <div className="flex items-center bg-muted rounded-md p-0.5 border border-border/40">
                          <button
                            type="button"
                            onClick={() => setSimOverrideLpb(Math.max(1, activeSimLpb - 1))}
                            className="px-2 py-0.5 text-xs font-bold hover:bg-background rounded-xs"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold w-5 text-center">{activeSimLpb}</span>
                          <button
                            type="button"
                            onClick={() => setSimOverrideLpb(activeSimLpb + 1)}
                            className="px-2 py-0.5 text-xs font-bold hover:bg-background rounded-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {(simOverrideBaris !== null || simOverrideLpb !== null || simDisabledLamps.length > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSimOverrideBaris(null)
                            setSimOverrideLpb(null)
                            setSimDisabledLamps([])
                          }}
                          className="text-[10px] text-primary hover:underline font-semibold"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Denah Penempatan Card (SVG layout) */}
              <Card className="border-border/80 overflow-hidden">
                <CardHeader className="py-2.5 px-4 bg-muted/40 border-b border-border/80 flex flex-row justify-between items-center space-y-0">
                  <CardTitle className="text-xs font-bold">Denah Penempatan — LED {lampLen}m</CardTitle>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold cursor-pointer flex items-center gap-1 ${
                      simCheck.overallStatus === "ideal"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : simCheck.overallStatus === "toleransi"
                        ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                    onClick={() => setInfoOpen(true)}
                  >
                    {simCheck.statusLabel}
                    <IconInfoCircle className="size-3" />
                  </span>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-3 flex flex-col items-center justify-center m-3 rounded-xl border border-border/30 bg-slate-50 dark:bg-[#0c0d12]">
                    <svg id="sim-svg" width="100%" height="200" viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="block">
                      {/* arrow markers definitions */}
                      <defs>
                        <marker id="arrow-start" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                          <path d="M6,0 L0,3 L6,6" fill="rgba(239, 68, 68, 0.7)" stroke="none" />
                        </marker>
                        <marker id="arrow-end" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                          <path d="M0,0 L6,3 L0,6" fill="rgba(239, 68, 68, 0.7)" stroke="none" />
                        </marker>
                        <marker id="arrow-start-green" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                          <path d="M6,0 L0,3 L6,6" fill="rgba(16, 185, 129, 0.7)" stroke="none" />
                        </marker>
                        <marker id="arrow-end-green" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                          <path d="M0,0 L6,3 L0,6" fill="rgba(16, 185, 129, 0.7)" stroke="none" />
                        </marker>
                      </defs>

                      {/* room bounds */}
                      <rect
                        x={PAD}
                        y={PAD}
                        width={simResult.lebar * scaleX}
                        height={simResult.panjang * scaleY}
                        fill={isSvgDark ? "rgba(245,158,11,0.03)" : "rgba(245,158,11,0.04)"}
                        stroke={isSvgDark ? "rgba(245,158,11,0.4)" : "rgba(217,119,6,0.8)"}
                        strokeWidth={1.5}
                        rx={2}
                      />

                      {/* Row coordinate labels (A, B, C...) on left margin */}
                      {showDimensions && Array.from({ length: activeSimBaris }).map((_, r) => {
                        const rowY = (r + 1) * activeSimJarakPerbaris
                        const cy = PAD + rowY * scaleY
                        return (
                          <text
                            key={`row-label-${r}`}
                            x={PAD - 8}
                            y={cy}
                            dominantBaseline="middle"
                            textAnchor="end"
                            fontSize={8}
                            fontWeight="bold"
                            fill={isSvgDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)"}
                          >
                            {String.fromCharCode(65 + r)}
                          </text>
                        )
                      })}

                      {/* Column coordinate labels (1, 2, 3...) on top margin */}
                      {showDimensions && Array.from({ length: activeSimLpb }).map((_, c) => {
                        const firstX = activeSimJarakSamping + lampLen / 2
                        const colX = activeSimLpb === 1 ? simResult.lebar / 2 : firstX + c * lampLen
                        const cx = PAD + colX * scaleX
                        return (
                          <text
                            key={`col-label-${c}`}
                            x={cx}
                            y={PAD - 6}
                            textAnchor="middle"
                            fontSize={8}
                            fontWeight="bold"
                            fill={isSvgDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)"}
                          >
                            {(c + 1).toString()}
                          </text>
                        )
                      })}

                      {/* Dimension Lines: JS (Jarak Samping) */}
                      {showDimensions && activeSimLpb > 0 && (
                        <>
                          <line
                            x1={PAD}
                            y1={PAD + 15}
                            x2={PAD + activeSimJarakSamping * scaleX}
                            y2={PAD + 15}
                            stroke="rgba(239, 68, 68, 0.6)"
                            strokeWidth="0.8"
                            strokeDasharray="2,2"
                            markerStart="url(#arrow-start)"
                            markerEnd="url(#arrow-end)"
                          />
                          <text
                            x={PAD + (activeSimJarakSamping * scaleX) / 2}
                            y={PAD + 12}
                            textAnchor="middle"
                            fontSize={7}
                            fontWeight="bold"
                            fill="rgba(239, 68, 68, 0.9)"
                          >
                            JS {activeSimJarakSamping.toFixed(2)}m
                          </text>
                        </>
                      )}

                      {/* Dimension Lines: JB (Jarak Baris) */}
                      {showDimensions && activeSimBaris > 0 && (
                        <>
                          {activeSimBaris > 1 ? (
                            <line
                              x1={PAD + 20}
                              y1={PAD + activeSimJarakPerbaris * scaleY}
                              x2={PAD + 20}
                              y2={PAD + activeSimJarakPerbaris * 2 * scaleY}
                              stroke="rgba(16, 185, 129, 0.6)"
                              strokeWidth="0.8"
                              strokeDasharray="2,2"
                              markerStart="url(#arrow-start-green)"
                              markerEnd="url(#arrow-end-green)"
                            />
                          ) : (
                            <line
                              x1={PAD + 20}
                              y1={PAD}
                              x2={PAD + 20}
                              y2={PAD + activeSimJarakPerbaris * scaleY}
                              stroke="rgba(16, 185, 129, 0.6)"
                              strokeWidth="0.8"
                              strokeDasharray="2,2"
                              markerStart="url(#arrow-start-green)"
                              markerEnd="url(#arrow-end-green)"
                            />
                          )}
                          <text
                            x={PAD + 24}
                            y={PAD + (activeSimBaris > 1 ? activeSimJarakPerbaris * 1.5 : activeSimJarakPerbaris * 0.5) * scaleY}
                            dominantBaseline="middle"
                            textAnchor="start"
                            fontSize={7}
                            fontWeight="bold"
                            fill="rgba(16, 185, 129, 0.9)"
                          >
                            JB {activeSimJarakPerbaris.toFixed(2)}m
                          </text>
                        </>
                      )}

                      {/* Symmetrical Grid placement lights */}
                      {simPositions.map((pos, idx) => {
                        const cx = PAD + pos.x * scaleX
                        const cy = PAD + pos.y * scaleY
                        const lw = Math.max(4, lampLen * scaleX)
                        const lh = Math.max(3, LAMP_TUBE_W * scaleY * 4)

                        const rIdx = Math.floor(idx / activeSimLpb) + 1
                        const cIdx = (idx % activeSimLpb) + 1
                        const coordLabel = `${String.fromCharCode(64 + rIdx)}${cIdx}`
                        const isDisabled = simDisabledLamps.includes(idx)

                        return (
                          <g
                            key={idx}
                            className="cursor-pointer transition-all duration-150 hover:opacity-90"
                            onClick={() => handleSimLampToggle(idx)}
                            opacity={isDisabled ? 0.35 : 1}
                          >
                            {!isDisabled && (
                              <ellipse cx={cx} cy={cy} rx={lw / 2 + 3} ry={lh + 2} fill={isSvgDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)"} />
                            )}
                            <rect
                              x={cx - lw / 2}
                              y={cy - lh / 2}
                              width={lw}
                              height={lh}
                              rx={lh / 2}
                              fill={isDisabled ? (isSvgDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)") : "rgba(16,185,129,0.8)"}
                              stroke={isDisabled ? (isSvgDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)") : "rgba(110,231,183,0.9)"}
                              strokeWidth={0.6}
                              strokeDasharray={isDisabled ? "2,1" : undefined}
                            />
                            {!isDisabled && (
                              <rect
                                x={cx - lw / 2 + 1.5}
                                y={cy - lh / 2 + 0.5}
                                width={lw - 3}
                                height={lh - 1}
                                rx={(lh - 1) / 2}
                                fill="rgba(254,243,199,0.5)"
                              />
                            )}
                            {/* Inner lamp code coordinate label */}
                            {showDimensions && (
                              <text
                                x={cx}
                                y={cy - lh / 2 - 2.5}
                                textAnchor="middle"
                                fontSize={6.5}
                                fontWeight="bold"
                                fill={isDisabled ? (isSvgDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.3)") : (isSvgDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)")}
                              >
                                {coordLabel}
                              </text>
                            )}
                          </g>
                        )
                      })}

                      {/* labels */}
                      <text x={PAD + (simResult.lebar * scaleX) / 2} y={SVG_H - 4} textAnchor="middle" fill={isSvgDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)"} fontSize={9}>
                        {simResult.lebar} m (LT)
                      </text>
                      <text x={12} y={PAD + (simResult.panjang * scaleY) / 2} textAnchor="middle" fill={isSvgDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)"} fontSize={9} transform={`rotate(-90, 12, ${PAD + (simResult.panjang * scaleY) / 2})`}>
                        {simResult.panjang} m (PT)
                      </text>
                    </svg>
                    <div className="flex gap-4 mt-2 text-[9px] text-muted-foreground justify-center pb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block w-4 h-1.5 bg-emerald-500 rounded-sm" />
                        LED Strip {lampLen}m ({activeSimTotalLamps} unit)
                      </span>
                      <span>Grid: {activeSimBaris} baris × {activeSimLpb} kolom</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3 px-4">
                    <input
                      id="show-dimensions-sim"
                      type="checkbox"
                      checked={showDimensions}
                      onChange={e => setShowDimensions(e.target.checked)}
                      className="size-3.5 rounded-sm border-gray-300 accent-primary"
                    />
                    <label htmlFor="show-dimensions-sim" className="text-[11px] font-medium text-muted-foreground cursor-pointer select-none">
                      Tampilkan Dimensi & Legenda
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Big Download Button at Bottom */}
              <Button
                type="button"
                onClick={() => handleSaveResult("simetris")}
                disabled={isSaving}
                className="w-full h-9 text-xs font-semibold"
              >
                <IconDownload className="mr-1.5 size-4" />
                {isSaving ? "Menyimpan..." : "Unduh Hasil Estimasi"}
              </Button>
            </div>
          )}

          {simResult && simResult.error && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
              Tidak ada konfigurasi yang memenuhi standar rasio 4.0 – 5.0 W/m² untuk dimensi ini. Coba sesuaikan luas area sales atau dimensi lebar/panjang toko.
            </div>
          )}
        </TabsContent>

        {/* ── TABS: TIDAK SIMETRIS ── */}
        <TabsContent value="tidak-simetris" className="space-y-4">
          {/* Parameter Poligon & Jarak Card (Moved to Top for better UX) */}
          <Card className="border-border/80">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold">Parameter Poligon & Jarak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-0 pb-4">
              {/* Parameter sliders based on shape */}
              <div className="space-y-2">
                <Label className="text-xs">Bentuk Bangunan</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {SHAPES.map(s => (
                    <Button
                      key={s.id}
                      type="button"
                      variant={shape === s.id ? "default" : "outline"}
                      className="h-8 text-[10px] px-2"
                      onClick={() => handleShapeChange(s.id)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>
              {/* Preset parameter inputs */}
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
              </div>

              {shape === "custom" && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Sentuh canvas di atas untuk menambahkan koordinat bangunan. Klik tombol di bawah setelah selesai menggambar.
                  </p>
                  <div className="flex gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 flex-1 text-xs"
                      onClick={() => { setCustomPts([]); setCustomClosed(false) }}
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      className="h-8 flex-1 text-xs"
                      disabled={customPts.length < 3 || customClosed}
                      onClick={() => setCustomClosed(true)}
                    >
                      Tutup Poligon
                    </Button>
                  </div>
                  {customPts.length > 0 && (
                    <div className="text-[10px] font-semibold text-muted-foreground mt-1">
                      Terdaftar: {customPts.length} titik {customClosed ? "(Selesai)" : "(Belum ditutup)"}
                    </div>
                  )}

                  {/* Dynamic segment lengths inputs */}
                  {customPts.length >= 2 && (
                    <div className="bg-muted/30 border border-border/50 rounded-xl p-3 space-y-2 mt-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sesuaikan Panjang Sisi Dinding (m)</div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {segmentLengths.map((len, idx) => {
                          const p1Name = `T${idx + 1}`
                          const p2Name = `T${((idx + 1) % customPts.length) + 1}`
                          const isClosing = idx === customPts.length - 1 && !customClosed

                          return (
                            <div key={idx} className="space-y-1">
                              <Label className="text-[10px] font-semibold text-foreground/80">
                                Sisi {p1Name} ke {p2Name} {isClosing ? "(Belum Tutup)" : ""}
                              </Label>
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
                                }}
                                onBlur={(e) => {
                                  const val = parseFloat(e.target.value)
                                  if (isNaN(val) || val <= 0) {
                                    const p1 = customPts[idx]
                                    const p2 = customPts[(idx + 1) % customPts.length]
                                    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
                                    const defaultVal = Number(dist.toFixed(1))
                                    setSegmentLengths(prev => {
                                      const next = [...prev]
                                      next[idx] = defaultVal
                                      return next
                                    })
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
              )}

              {/* Pratinjau Bentuk Ruangan Canvas (Live Preview / Drawing Canvas) */}
              <div className="space-y-1.5 border-t border-border/60 pt-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold text-foreground">Pratinjau Bentuk Ruangan</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {shape === "custom" ? `Mode Kustom (${customPts.length} titik)` : "Preset Otomatis"}
                  </span>
                </div>
                <div className="rounded-xl border border-border/80 overflow-hidden bg-background">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="w-full block"
                    style={{
                      height: `${CANVAS_H}px`,
                      cursor: shape === "custom" && !customClosed ? "crosshair" : "default"
                    }}
                  />
                  <div className="p-2.5 text-[10px] text-muted-foreground border-t border-border/50 leading-relaxed bg-muted/20">
                    {shape === "custom" && !customClosed
                      ? `💡 Sentuh/klik kanvas di atas untuk menambah titik sudut (${customPts.length} titik terpasang).`
                      : "Pratinjau visual denah toko berdasarkan parameter dimensi di atas."}
                  </div>
                </div>
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
 
          {/* Irregular Calculation Result Card & Plotted Canvas */}
          {isCalculated && (
            <div className="space-y-4">
              {/* Hasil Kalkulasi Card */}
              <Card className={`transition-all duration-300 ${
                irregCheck.overallStatus === "ideal"
                  ? "border-emerald-500/25 bg-emerald-50/30 dark:bg-emerald-950/15"
                  : irregCheck.overallStatus === "toleransi"
                  ? "border-sky-500/25 bg-sky-50/30 dark:bg-sky-950/15"
                  : "border-amber-500/25 bg-amber-50/30 dark:bg-amber-950/15"
              }`}>
                <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-semibold">Hasil Kalkulasi — Tidak Simetris</CardTitle>
                  <span
                    onClick={() => setInfoOpen(true)}
                    className={`text-[10px] px-3 py-1 rounded-full font-semibold cursor-pointer flex items-center gap-1.5 shrink-0 hover:opacity-80 active:opacity-60 ${
                      irregCheck.overallStatus === "ideal"
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
                      <div className="grid grid-cols-3 gap-2">
                        <StatBox label="Total Lampu" value={stats.n} unit=" unit" variant="default" />
                        <StatBox label="Jumlah Baris" value={stats.nRow} unit=" baris" />
                        <StatBox label="Per Baris" value={stats.nPerRow} unit=" unit" />
                        <StatBox label="Jarak Baris" value={Number(stats.rowSpacing)?.toFixed(2)} unit=" m" variant={Number(stats.rowSpacing) <= 1.9 ? "success" : Number(stats.rowSpacing) <= 2.2 ? "info" : "warning"} />
                        <StatBox label="Jarak Samping" value={activeMargin.toFixed(2)} unit=" m" variant={irregCheck.sampingStatus === "ok" ? "success" : activeMargin >= 0.2 && activeMargin <= 0.8 ? "info" : "warning"} />
                        <StatBox label="Rasio W/m²" value={Number(stats.luas > 0 ? (stats.n * watt) / stats.luas : 0).toFixed(2)} unit=" W/m²" variant={irregCheck.rasioStatus === "ok" ? "success" : (stats.luas > 0 ? (stats.n * watt) / stats.luas : 0) >= 3.5 && (stats.luas > 0 ? (stats.n * watt) / stats.luas : 0) <= 5.5 ? "info" : "warning"} />
                      </div>
                      <RatioBar rasio={stats.luas > 0 ? (stats.n * watt) / stats.luas : 0} check={irregCheck} />
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

                      {/* Irregular Grid Adjustment Steppers */}
                      <div className="border-t border-border/60 pt-3.5 mt-2 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Penyesuaian Manual</div>
                        <div className="flex gap-4 items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">Baris:</span>
                            <div className="flex items-center bg-muted rounded-md p-0.5 border border-border/40">
                              <button
                                type="button"
                                onClick={() => setIrregOverrideBaris(Math.max(1, stats.nRow - 1))}
                                className="px-2 py-0.5 text-xs font-bold hover:bg-background rounded-xs"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-semibold w-5 text-center">{stats.nRow}</span>
                              <button
                                type="button"
                                onClick={() => setIrregOverrideBaris(stats.nRow + 1)}
                                className="px-2 py-0.5 text-xs font-bold hover:bg-background rounded-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">Lampu/Baris:</span>
                            <div className="flex items-center bg-muted rounded-md p-0.5 border border-border/40">
                              <button
                                type="button"
                                onClick={() => setIrregOverrideLpb(Math.max(1, stats.nPerRow - 1))}
                                className="px-2 py-0.5 text-xs font-bold hover:bg-background rounded-xs"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-semibold w-5 text-center">{stats.nPerRow}</span>
                              <button
                                type="button"
                                onClick={() => setIrregOverrideLpb(stats.nPerRow + 1)}
                                className="px-2 py-0.5 text-xs font-bold hover:bg-background rounded-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          {(irregOverrideBaris !== null || irregOverrideLpb !== null || irregDisabledLamps.length > 0) && (
                            <button
                              type="button"
                              onClick={() => {
                                setIrregOverrideBaris(null)
                                setIrregOverrideLpb(null)
                                setIrregDisabledLamps([])
                              }}
                              className="text-[10px] text-primary hover:underline font-semibold"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
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
                  <CardTitle className="text-xs font-bold">Denah Penempatan — LED {lampLen}m</CardTitle>
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
 
              {/* Big Download Button at Bottom */}
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
          )}
        </TabsContent>
      </Tabs>

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
        const activeCheck = activeTab === "simetris" ? simCheck : irregCheck
        const currentRasio = activeTab === "simetris" ? activeSimRasio : activeIrregRasio
        const currentSamping = activeTab === "simetris" ? activeSimJarakSamping : activeMargin
        const currentBaris = activeTab === "simetris" ? activeSimJarakPerbaris : (Number(stats.rowSpacing) || 0)

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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeCheck.rasioStatus === "ok" 
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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeCheck.sampingStatus === "ok" 
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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeCheck.barisStatus === "ok" 
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
    </main>
  )
}
