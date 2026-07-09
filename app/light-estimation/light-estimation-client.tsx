"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { IconBulb, IconArrowLeft, IconRefresh, IconGrid3x3, IconPolygon, IconSquare, IconChevronRight, IconDownload, IconInfoCircle } from "@tabler/icons-react"
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
  { id: "rect", label: "Kotak / Persegi Panjang" },
  { id: "trap", label: "Trapesium" },
  { id: "L", label: "Bentuk L" },
  { id: "custom", label: "Kustom (Gambar Titik)" },
]

export function LightEstimationClient({ stores }: LightEstimationClientProps) {
  const { resolvedTheme } = useTheme()
  // Common states
  const [activeTab, setActiveTab] = useState<string>("simetris")
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null)
  const [lampLen, setLampLen] = useState<number>(1.2)
  const [isSaving, setIsSaving] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const exportCardRef = useRef<HTMLDivElement | null>(null)

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
  }

  const simCanCalc = simForm.lebar && simForm.panjang && simForm.area

  const simPositions = simResult && !simResult.error
    ? generateGridPositions(simResult.lebar, simResult.panjang, simResult.baris, simResult.lampuPerbaris, lampLen).positions
    : []

  const SVG_W = 340, SVG_H = 200, PAD = 24
  const scaleX = simResult ? (SVG_W - PAD * 2) / simResult.lebar : 1
  const scaleY = simResult ? (SVG_H - PAD * 2) / simResult.panjang : 1

  // ── Symmetrical Ratio Bar Component ──
  const RatioBar = ({ rasio }: { rasio: number }) => {
    const pct = Math.min(100, Math.max(0, ((rasio - 3.5) / (5.5 - 3.5)) * 100))
    const minPct = ((4.0 - 3.5) / (5.5 - 3.5)) * 100
    const maxPct = ((5.0 - 3.5) / (5.5 - 3.5)) * 100
    const color = rasio >= 4.0 && rasio <= 5.0 ? "#10b981" : "#f59e0b"
    const ok = rasio >= 4.0 && rasio <= 5.0
    return (
      <div className="space-y-1.5 mt-2">
        <div className="flex justify-between text-[11px] font-medium">
          <span className="text-muted-foreground">3.5 W/m²</span>
          <span
            style={{ color }}
            className="font-semibold text-xs flex items-center gap-1 cursor-pointer select-none hover:opacity-80 active:opacity-60"
            onClick={() => setInfoOpen(true)}
          >
            {rasio.toFixed(2)} W/m² {ok ? " (Sesuai Standar)" : " (Di Luar Standar)"}
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
  const StatBox = ({ label, value, unit, cls = "" }: { label: string, value: any, unit: string, cls?: string }) => {
    return (
      <div className={`rounded-xl border border-border/80 bg-muted/30 p-2.5 text-center flex flex-col justify-center ${cls}`}>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="text-base font-bold text-foreground mt-0.5">
          {value}<span className="text-xs font-normal text-muted-foreground">{unit}</span>
        </div>
      </div>
    )
  }

  // ── SmartSuggestions Component ──
  const SmartSuggestions = ({ rasio }: { rasio: number }) => {
    const [isOpen, setIsOpen] = useState(false)
    if (rasio >= 4.0 && rasio <= 5.0) return null

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
                  Kerapatan daya saat ini adalah <span className="font-bold">{rasio.toFixed(2)} W/m²</span>, melebihi batas standar maksimal 5.0 W/m² (Potensi pemborosan energi).
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
                  Kerapatan daya saat ini adalah <span className="font-bold">{rasio.toFixed(2)} W/m²</span>, di bawah batas standar minimal 4.0 W/m² (Kondisi pencahayaan berpotensi terlalu redup).
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
    rP: 10,
    rL: 8,
    tTop: 6,
    tBot: 10,
    tH: 8,
    tOff: 0,
    lP: 11,
    lL: 8,
    lW: 5,
    lH: 4
  })
  const [customPts, setCustomPts] = useState<Point[]>([])
  const [customClosed, setCustomClosed] = useState<boolean>(false)
  const [segmentLengths, setSegmentLengths] = useState<number[]>([])

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
      const userLen = segmentLengths[i] ?? len
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
  }, [shape, watt, wmin, wmax, p, customPts, customClosed, lampLen])

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

    if (mode === "simetris") {
      if (!simResult) return
      cardData = {
        storeCode: selectedStore?.code ?? "",
        storeName: selectedStore?.name ?? "",
        storeBranch: selectedStore?.branch ?? "",
        mode: "simetris",
        shapeLabel: "Kotak",
        area: simResult.area,
        watt: LAMP_WATT,
        lampLen: lampLen,
        totalLamps: simResult.total,
        minLamps: simResult.range.minLamps,
        maxLamps: simResult.range.maxLamps,
        rows: simResult.baris,
        lampsPerRow: simResult.lampuPerbaris,
        rowSpacing: simResult.jarakPerbaris,
        sideMargin: simResult.jarakSamping,
        rasio: simResult.rasio,
        layoutSnapshot: getSvgDataUrlBase64(),
      }
    } else {
      if (!stats.luas) return
      const shapeObj = SHAPES.find(s => s.id === shape)
      cardData = {
        storeCode: selectedStore?.code ?? "",
        storeName: selectedStore?.name ?? "",
        storeBranch: selectedStore?.branch ?? "",
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
        rowSpacing: stats.rowSpacing,
        sideMargin: calcResult?.jarakSamping ?? 0.45,
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
          const link = document.createElement("a")
          const storeLabel = selectedStore?.code || "toko"
          link.download = `estimasi-lampu-${storeLabel}.png`
          link.href = dataUrl
          link.click()
          toast.success("Gambar hasil estimasi berhasil diunduh!")
        }
      } catch (err) {
        console.error(err)
        toast.error("Gagal mengunduh gambar hasil estimasi.")
      } finally {
        setIsSaving(false)
      }
    }, 300)
  }

  const setParam = (key: string, val: number) => setP(prev => ({ ...prev, [key]: val }))

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

    const pts = buildPolygon(shape, p, adjustedPts, customClosed)

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

    const usedMargin = calcResult ? calcResult.jarakSamping : 0.45
    const usedJarak = calcResult ? calcResult.jarakPerbaris : 1.9
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

    // Place and draw lamps if calculated
    if (showLamps) {
      const lamps = placeLamps(pts, usedJarak, usedMargin, usedOrient, lampLen, usedSpasi)
      const lampLen_px = lampLen * sc.scale
      const lampW_px = Math.max(3, LAMP_TUBE_W * sc.scale)

      lamps.forEach(lamp => {
        const cx = sc.offX + lamp.x * sc.scale
        const cy = sc.offY + lamp.y * sc.scale
        ctx.save()
        ctx.translate(cx, cy)
        if (lamp.dir === "v") ctx.rotate(Math.PI / 2)
        
        // Outer light tube
        ctx.fillStyle = "rgba(16,185,129,0.8)"
        ctx.strokeStyle = "rgba(110,231,183,0.9)"
        ctx.lineWidth = 0.6
        const rr = lampW_px / 2
        ctx.beginPath()
        ctx.roundRect(-lampLen_px / 2, -rr, lampLen_px, lampW_px, rr)
        ctx.fill(); ctx.stroke()
        
        // Inner glowing core
        ctx.fillStyle = "rgba(254,243,199,0.4)"
        ctx.beginPath()
        ctx.roundRect(-lampLen_px / 2 + 1.5, -rr + 1, lampLen_px - 3, lampW_px - 2, rr - 0.5)
        ctx.fill()
        ctx.restore()
      })
    }

    // Dimensions labels
    ctx.fillStyle = dimensionTextFill
    ctx.font = "9px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`${sc.rW.toFixed(1)} m (W)`, sc.offX + (sc.rW * sc.scale) / 2, sc.offY + sc.rH * sc.scale + 16)
    
    ctx.save()
    ctx.translate(sc.offX - 14, sc.offY + (sc.rH * sc.scale) / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(`${sc.rH.toFixed(1)} m (L)`, 0, 0)
    ctx.restore()

    // Subtle coordinate system legend (visual guide)
    ctx.strokeStyle = legendStroke
    ctx.lineWidth = 1
    ctx.fillStyle = legendTextFill
    ctx.font = "8px sans-serif"
    
    const ax = 20
    const ay = CANVAS_H - 25
    
    // Draw W arrow
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(ax + 25, ay)
    ctx.stroke()
    // W arrow head
    ctx.fillStyle = legendTextFill
    ctx.beginPath()
    ctx.moveTo(ax + 25, ay)
    ctx.lineTo(ax + 21, ay - 2.5)
    ctx.lineTo(ax + 21, ay + 2.5)
    ctx.closePath()
    ctx.fill()
    ctx.fillText("W (Lebar)", ax + 28, ay + 2.5)
    
    // Draw L arrow
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(ax, ay - 25)
    ctx.stroke()
    // L arrow head
    ctx.beginPath()
    ctx.moveTo(ax, ay - 25)
    ctx.lineTo(ax - 2.5, ay - 21)
    ctx.lineTo(ax + 2.5, ay - 21)
    ctx.closePath()
    ctx.fill()
    
    ctx.save()
    ctx.translate(ax - 4, ay - 8)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("L (Panjang)", 0, 0)
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
  }, [shape, p, adjustedPts, customClosed, lampLen, calcResult, resolvedTheme])

  const updateStats = useCallback(() => {
    const pts = buildPolygon(shape, p, adjustedPts, customClosed)
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
      lamps = placeLamps(pts, res.jarakPerbaris, res.jarakSamping, "h", lampLen, 0)
      if (lamps.length > 0) {
        nRow = res.baris
        nPerRow = res.lampuPerbaris
        rowSpacing = res.jarakPerbaris
      }
    }

    setStats({
      luas: Number(luas.toFixed(1)),
      nmin: minLamps,
      nmax: maxLamps,
      n: isCalculated ? lamps.length : 0,
      nRow,
      nPerRow,
      rowSpacing: isCalculated ? rowSpacing.toFixed(2) : "0.00"
    })
  }, [shape, p, adjustedPts, customClosed, watt, wmin, wmax, lampLen, isCalculated])

  useEffect(() => {
    updateStats()
  }, [updateStats])

  useEffect(() => {
    drawCanvas(canvasRef.current, false)
  }, [drawCanvas, shape, p, adjustedPts, customClosed, lampLen])

  useEffect(() => {
    if (isCalculated) {
      drawCanvas(resultCanvasRef.current, true)
    }
  }, [drawCanvas, isCalculated, shape, p, adjustedPts, customClosed, lampLen])

  // Canvas click handler
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

  const handleShapeChange = (s: string) => {
    setShape(s)
    if (s !== "custom") {
      setCustomPts([])
      setCustomClosed(false)
    }
  }

  const inRange = stats.n >= stats.nmin && stats.n <= stats.nmax
  const rasioResult = calcResult ? calcResult.rasio : null
  const rasioOk = rasioResult !== null && rasioResult >= 4.0 && rasioResult <= 5.0

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header
        variant="dashboard-back"
        title="Kalkulator Lampu"
        subtitle="Prototype Panel (Trial/Beta)"
        backHref="/dashboard"
      />

      {/* Shared Store Selection Prefill */}
      <div className="space-y-1 mb-4 bg-muted/30 border border-border/50 rounded-xl p-3">
        <Label htmlFor="store-select" className="text-xs font-bold text-foreground/80">Identitas Toko Audit</Label>
        <StoreCombobox
          stores={stores}
          value={selectedStore}
          onSelect={handleStoreSelectShared}
          placeholder="Pilih toko audit..."
        />
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
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">Lebar Toko (W)</span>
                      <span className="text-[8px] font-bold">&rarr;</span>
                    </div>

                    <div className="absolute -right-[75px] top-0 bottom-0 flex items-center">
                      <div className="h-full flex flex-col justify-between items-center text-muted-foreground py-0.5">
                        <span className="text-[8px] font-bold">&uarr;</span>
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 [writing-mode:vertical-lr] rotate-180">Panjang / Kedalaman (L)</span>
                        <span className="text-[8px] font-bold">&darr;</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                <Label htmlFor="lebar" className="text-xs">Lebar Toko (W)</Label>
                <Label htmlFor="panjang" className="text-xs">Panjang Toko (L)</Label>
                
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
                  TL LED 1.2 meter (13.5 Watt) per unit.
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
              <Card className="border-border/80 bg-linear-to-b from-card to-background">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-semibold">Hasil Kalkulasi — Simetris</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <StatBox label="Total Lampu" value={simResult.total} unit=" unit" cls="border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300" />
                    <StatBox label="Jumlah Baris" value={simResult.baris} unit=" baris" />
                    <StatBox label="Per Baris" value={simResult.lampuPerbaris} unit=" unit" />
                    <StatBox label="Jarak Baris" value={simResult.jarakPerbaris.toFixed(2)} unit=" m" />
                    <StatBox label="Jarak Samping" value={simResult.jarakSamping.toFixed(2)} unit=" m" cls="border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400" />
                    <StatBox label="Rasio W/m²" value={simResult.rasio.toFixed(2)} unit=" W/m²" cls="border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <RatioBar rasio={simResult.rasio} />
                  <SmartSuggestions rasio={simResult.rasio} />
                </CardContent>
              </Card>

              {/* Denah Penempatan Card (SVG layout) */}
              <Card className="border-border/80 overflow-hidden">
                <CardHeader className="py-2.5 px-4 bg-muted/40 border-b border-border/80 flex flex-row justify-between items-center space-y-0">
                  <CardTitle className="text-xs font-bold">Denah Penempatan — LED {lampLen}m</CardTitle>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold cursor-pointer flex items-center gap-1 ${
                      simResult.rasio >= 4.0 && simResult.rasio <= 5.0
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                    onClick={() => setInfoOpen(true)}
                  >
                    {simResult.rasio >= 4.0 && simResult.rasio <= 5.0 ? "Dalam Standar" : "Di Luar Standar"}
                    <IconInfoCircle className="size-3" />
                  </span>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-3 flex flex-col items-center justify-center m-3 rounded-xl border border-border/30 bg-slate-50 dark:bg-[#0c0d12]">
                    <svg id="sim-svg" width="100%" height="160" viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="block">
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
                      {/* Symmetrical Grid placement lights */}
                      {simPositions.map((pos, idx) => {
                        const cx = PAD + pos.x * scaleX
                        const cy = PAD + pos.y * scaleY
                        const lw = Math.max(4, lampLen * scaleX)
                        const lh = Math.max(3, LAMP_TUBE_W * scaleY * 4)
                        return (
                          <g key={idx}>
                            <ellipse cx={cx} cy={cy} rx={lw / 2 + 3} ry={lh + 2} fill={isSvgDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)"} />
                            <rect
                              x={cx - lw / 2}
                              y={cy - lh / 2}
                              width={lw}
                              height={lh}
                              rx={lh / 2}
                              fill="rgba(16,185,129,0.8)"
                              stroke="rgba(110,231,183,0.9)"
                              strokeWidth={0.6}
                            />
                          </g>
                        )
                      })}
                      {/* labels */}
                      <text x={PAD + (simResult.lebar * scaleX) / 2} y={SVG_H - 4} textAnchor="middle" fill={isSvgDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)"} fontSize={9}>
                        {simResult.lebar} m (W)
                      </text>
                      <text x={12} y={PAD + (simResult.panjang * scaleY) / 2} textAnchor="middle" fill={isSvgDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)"} fontSize={9} transform={`rotate(-90, 12, ${PAD + (simResult.panjang * scaleY) / 2})`}>
                        {simResult.panjang} m (L)
                      </text>
                    </svg>
                    <div className="flex gap-4 mt-2 text-[9px] text-muted-foreground justify-center pb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block w-4 h-1.5 bg-emerald-500 rounded-sm" />
                        LED Strip {lampLen}m ({simResult.total} unit)
                      </span>
                      <span>Grid: {simResult.baris} baris × {simResult.lampuPerbaris} kolom</span>
                    </div>
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
          {/* Canvas Wrapper (Moved to Top for mobile UX) */}
          <Card className="border-border/80 overflow-hidden">
            <CardHeader className="py-2.5 px-4 bg-muted/40 border-b border-border/80 flex flex-row justify-between items-center space-y-0">
              <CardTitle className="text-xs font-bold">Denah Penempatan — LED {lampLen}m</CardTitle>
              <div className="flex items-center gap-2">
                {isCalculated && stats.n > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold cursor-pointer flex items-center gap-1 ${inRange ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}
                    onClick={() => setInfoOpen(true)}
                  >
                    {inRange ? "Dalam Standar" : "Di Luar Standar"}
                    <IconInfoCircle className="size-3" />
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full block"
                style={{
                  height: `${CANVAS_H}px`,
                  cursor: shape === "custom" && !customClosed ? "crosshair" : "default"
                }}
              />
              <div className="p-3 text-[10px] text-muted-foreground border-t border-border/50 leading-relaxed">
                {isCalculated && stats.n > 0
                  ? `${stats.n} lampu terplot · ${stats.nRow} baris × ${stats.nPerRow}/baris · Jarak baris: ${stats.rowSpacing}m · Margin: ${(calcResult?.jarakSamping ?? 0.45).toFixed(2)}m · Luas: ${stats.luas}m²`
                  : "Atur parameter ruangan di bawah, lalu klik 'Hitung Penempatan' untuk melihat rancangan lampu."}
              </div>
            </CardContent>
          </Card>

          {/* Quick stats grid (Moved to Top) */}
          {isCalculated && (
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-xl border border-border/80 bg-muted/40 p-2 text-center">
                <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">Luas</div>
                <div className="text-xs font-bold mt-0.5">{stats.luas || "—"} m²</div>
              </div>
              <div className="rounded-xl border border-border/80 bg-muted/40 p-2 text-center">
                <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">Lampu Min</div>
                <div className="text-xs font-bold mt-0.5">{stats.nmin || "—"} u</div>
              </div>
              <div className="rounded-xl border border-border/80 bg-muted/40 p-2 text-center">
                <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">Lampu Max</div>
                <div className="text-xs font-bold mt-0.5">{stats.nmax || "—"} u</div>
              </div>
              <div className={`rounded-xl border p-2 text-center ${stats.n > 0 ? (inRange ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" : "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400") : "border-border/80 bg-muted/40"}`}>
                <div className="text-[8px] font-bold uppercase tracking-wide">Terplot</div>
                <div className="text-xs font-bold mt-0.5">{stats.n || "—"} u</div>
              </div>
            </div>
          )}

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
                      <span className="flex items-center gap-1">💡 Petunjuk Arah Dimensi</span>
                      <span className="text-[10px] text-muted-foreground underline font-normal">
                        {showDimensionGuide ? "Sembunyikan" : "Tampilkan"}
                      </span>
                    </div>
                    {showDimensionGuide && (
                      <div className="border-t border-border/40 pt-1.5 space-y-1 animate-in fade-in slide-in-from-top-1">
                        <div>• <b>Lebar (W) / Horizontal:</b> Arah kanan-kiri (Lebar Toko, Lebar Total, Lebar Sayap dsb)</div>
                        <div>• <b>Panjang (L) / Vertikal:</b> Arah atas-bawah (Panjang/Kedalaman, Panjang Total, Panjang Sayap dsb)</div>
                      </div>
                    )}
                  </div>
                )}

                {shape === "rect" && (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <Label className="text-xs">Lebar Toko (W)</Label>
                    <Label className="text-xs">Panjang / Kedalaman (L)</Label>
                    
                    <Input
                      type="number"
                      value={p.rP}
                      step={0.5}
                      onChange={e => setParam("rP", parseFloat(e.target.value) || 1)}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      value={p.rL}
                      step={0.5}
                      onChange={e => setParam("rL", parseFloat(e.target.value) || 1)}
                      className="h-8 text-xs"
                    />
                  </div>
                )}

                {shape === "trap" && (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <Label className="text-xs">Lebar Atas (W1)</Label>
                    <Label className="text-xs">Lebar Bawah (W2)</Label>
                    
                    <Input
                      type="number"
                      value={p.tTop}
                      step={0.5}
                      onChange={e => setParam("tTop", parseFloat(e.target.value) || 1)}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      value={p.tBot}
                      step={0.5}
                      onChange={e => setParam("tBot", parseFloat(e.target.value) || 1)}
                      className="h-8 text-xs"
                    />

                    <Label className="text-xs mt-1.5">Panjang / Kedalaman (L)</Label>
                    <Label className="text-xs mt-1.5">Offset Kiri Atas</Label>

                    <Input
                      type="number"
                      value={p.tH}
                      step={0.5}
                      onChange={e => setParam("tH", parseFloat(e.target.value) || 1)}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      value={p.tOff}
                      step={0.5}
                      onChange={e => setParam("tOff", parseFloat(e.target.value) || 0)}
                      className="h-8 text-xs"
                    />
                  </div>
                )}

                {shape === "L" && (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <Label className="text-[11px]">Lebar Total (W)</Label>
                    <Label className="text-[11px]">Panjang Total (L)</Label>
                    
                    <Input
                      type="number"
                      value={p.lP}
                      step={0.5}
                      onChange={e => setParam("lP", parseFloat(e.target.value) || 1)}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      value={p.lL}
                      step={0.5}
                      onChange={e => setParam("lL", parseFloat(e.target.value) || 1)}
                      className="h-8 text-xs"
                    />

                    <Label className="text-[11px] mt-1.5">Lebar Sayap (w)</Label>
                    <Label className="text-[11px] mt-1.5">Panjang Sayap (l)</Label>

                    <Input
                      type="number"
                      value={p.lW}
                      step={0.5}
                      onChange={e => setParam("lW", parseFloat(e.target.value) || 1)}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      value={p.lH}
                      step={0.5}
                      onChange={e => setParam("lH", parseFloat(e.target.value) || 1)}
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
                                  const val = parseFloat(e.target.value) || 0.5
                                  setSegmentLengths(prev => {
                                    const next = [...prev]
                                    next[idx] = val
                                    return next
                                  })
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

              {/* Layout calculation tweaks (Fixed and Automatic) */}
              <div className="space-y-3.5 border-t border-border/60 pt-3">

                {/* Spesifikasi Lampu Read-Only (Standar Audit) */}
                <div className="bg-muted/30 rounded-xl p-2.5 border border-border/50 text-[10px] text-muted-foreground leading-normal flex items-center gap-2">
                  <IconBulb className="size-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground block">Spesifikasi Lampu Standar Audit</span>
                    TL LED 1.2 meter (13.5 Watt) per unit.
                  </div>
                </div>
              </div>

              {/* Hitung Penempatan Button for Non-Symmetrical */}
              <Button
                type="button"
                className="w-full h-9 mt-4 text-xs font-semibold"
                disabled={shape === "custom" && !customClosed}
                onClick={() => setIsCalculated(true)}
              >
                Hitung Penempatan
              </Button>
            </CardContent>
          </Card>

          {/* Irregular Calculation Result Card & Plotted Canvas */}
          {isCalculated && (
            <div className="space-y-4">
              {/* Hasil Kalkulasi Card */}
              <Card className="border-border/80 bg-linear-to-b from-card to-background">
                <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-semibold">Hasil Kalkulasi — Tidak Simetris</CardTitle>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${calcResult ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                    {calcResult ? "Rekomendasi Sistem" : "Tidak Sesuai Standar"}
                  </span>
                </CardHeader>
                <CardContent className="pt-0 pb-4 space-y-2.5">
                  {calcResult ? (
                    // 1. Systems Automatic Recommendation stats
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <StatBox label="Total Lampu" value={calcResult.total} unit=" unit" cls="border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300" />
                        <StatBox label="Jumlah Baris" value={calcResult.baris} unit=" baris" />
                        <StatBox label="Per Baris" value={calcResult.lampuPerbaris} unit=" unit" />
                        <StatBox label="Jarak Baris" value={calcResult.jarakPerbaris?.toFixed(2)} unit=" m" />
                        <StatBox label="Jarak Samping" value={calcResult.jarakSamping?.toFixed(2)} unit=" m" cls="border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400" />
                        <StatBox label="Rasio W/m²" value={calcResult.rasio.toFixed(2)} unit=" W/m²" cls={calcResult.rasio >= 4.0 && calcResult.rasio <= 5.0 ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400" : "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400"} />
                      </div>
                      <RatioBar rasio={calcResult.rasio} />
                      <SmartSuggestions rasio={calcResult.rasio} />
                      <div className="text-[10px] text-muted-foreground p-2.5 rounded-lg border border-border/80 bg-muted/40 leading-normal">
                        Rekomendasi Excel: <b className="text-foreground">{calcResult.total} unit</b> (Range {calcResult.minLamps}–{calcResult.maxLamps} u) dengan jarak baris {calcResult.jarakPerbaris?.toFixed(2)}m dan jarak samping {calcResult.jarakSamping?.toFixed(2)}m.
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
                    className="w-full block"
                    style={{
                      height: `${CANVAS_H}px`
                    }}
                  />
                  <div className="p-3 text-[10px] text-muted-foreground border-t border-border/50 leading-relaxed">
                    {stats.n} lampu terplot · {stats.nRow} baris × {stats.nPerRow}/baris · Jarak baris: {stats.rowSpacing}m · Margin: {(calcResult?.jarakSamping ?? 0.45).toFixed(2)}m · Luas: {stats.luas}m²
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

      {/* Dialog Penjelasan Standar Kerapatan Daya */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-w-xs sm:max-w-md rounded-2xl p-5 gap-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <IconInfoCircle className="size-4" /> Standar Kerapatan Daya Pencahayaan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p>
              Berdasarkan standar audit energi toko, kerapatan daya pencahayaan (*lighting power density*) target untuk **area penjualan (sales area)** adalah:
            </p>
            <div className="bg-muted/50 p-2.5 rounded-lg border border-border/80 text-foreground font-semibold text-center text-xs">
              4.0 s/d 5.0 Watt / m²
            </div>
            <p>
              Perhitungan rasio daya dilakukan dengan rumus:
            </p>
            <code className="block bg-muted/60 p-2 rounded text-[10px] text-foreground text-center font-mono leading-normal">
              Rasio = (Total Lampu × 13.5 Watt) ÷ Luas Area Sales
            </code>
            <ul className="list-disc pl-4 space-y-1.5 mt-1 text-[11px]">
              <li>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Dalam Standar:</span> Rentang kerapatan daya yang optimal untuk pencahayaan sales area.
              </li>
              <li>
                <span className="font-semibold text-amber-600 dark:text-amber-400">Di Luar Standar:</span> Kurang dari 4.0 W/m² dianggap redup (kurang pencahayaan), sedangkan lebih dari 5.0 W/m² dianggap boros energi (over-lighting).
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
