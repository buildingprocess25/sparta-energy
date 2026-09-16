"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { toPng } from "html-to-image"
import {
  IconArrowLeft,
  IconAirConditioning,
  IconMapPin,
  IconRefresh,
  IconDownload,
  IconCheck,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconSquare,
  IconSnowflake,
  IconBuildingStore,
  IconSparkles,
  IconPointer,
  IconTrash,
  IconDoor,
  IconShoppingCart,
  IconFridge,
  IconX,
} from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { StoreCombobox } from "@/components/audit/store-combobox"
import { toast } from "sonner"
import { getTemperature } from "@/app/actions/get-temperature"
import { getScaleInfo, Point } from "@/lib/lamp-calculator"
import { calcPolygonArea } from "@/lib/polygon-utils"
import type { StoreData } from "@/app/audit/start/start-client"

interface AcMappingClientProps {
  stores: StoreData[]
}

// Model & Spec Standar AC
const AC_CAPACITY_BTU = 18000 // Daikin 2 PK = 18.000 BTU/h
const SPREAD_ANGLE_DEG = 70   // Sudut hembusan kipas 70°
const THROW_Z1_M = 2.5        // Zona 1: Dingin Maksimal (0 - 2.5m)
const THROW_Z2_M = 5.5        // Zona 2: Sejuk Efektif (2.5 - 5.5m)
const THROW_Z3_M = 7.5        // Zona 3: Batas Lemparan (5.5 - 7.5m)

const CANVAS_H = 340
const FIXED_SCALE = 24 // Scale in drawing mode (px/m)
const FIXED_OX = 30    // Offset X
const FIXED_OY = 30    // Offset Y

type ActiveTool = "DRAW" | "DOOR" | "CASHIER" | "CHILLER"
type WallType = "SOLID" | "GLASS_DOOR" | "CASHIER" | "CHILLER"

interface SnapGuide {
  type: "h" | "v"
  pos: number
  fromCanvas: { x: number; y: number }
  toCanvas: { x: number; y: number }
  snapType: "orthogonal" | "alignment"
  refNodeIdx: number
}

interface WallSegment {
  index: number
  startIndex: number
  endIndex: number
  p1: Point
  p2: Point
  lengthM: number
  type: WallType
}

interface PlacedAcUnit {
  id: string
  wallIndex: number
  ratio: number // 0.0 - 1.0 along wall segment
  customName: string
  wallLabel: string
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

function formatDim(val: number, maxDecimals = 2): string {
  if (isNaN(val) || !isFinite(val)) return "0"
  const factor = Math.pow(10, maxDecimals)
  const rounded = Math.round((val + Number.EPSILON) * factor) / factor
  return String(rounded)
}

export function AcMappingClient({ stores }: AcMappingClientProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // ─── 1. State Input Toko ──────────────────────────────────────────────────
  const [storeMode, setStoreMode] = useState<"existing" | "new">("existing")
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null)
  const [newStoreCode, setNewStoreCode] = useState("")
  const [newStoreName, setNewStoreName] = useState("")
  const [newStoreBranch, setNewStoreBranch] = useState("")
  const [newStoreArea, setNewStoreArea] = useState("")
  const [coordInput, setCoordInput] = useState<string>("-6.200000, 106.816666")
  const [calculatedTemp, setCalculatedTemp] = useState<number | null>(null)
  const [calculatedBtuPerM2, setCalculatedBtuPerM2] = useState<number>(600)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)

  // ─── 2. State Canvas Poligon Denah ────────────────────────────────────────
  const [customPts, setCustomPts] = useState<Point[]>([])
  const [customClosed, setCustomClosed] = useState<boolean>(false)
  const [historyPast, setHistoryPast] = useState<{ pts: Point[]; closed: boolean; overrides: Record<number, WallType> }[]>([])
  const [historyFuture, setHistoryFuture] = useState<{ pts: Point[]; closed: boolean; overrides: Record<number, WallType> }[]>([])
  const [activeDragIdx, setActiveDragIdx] = useState<number | null>(null)
  const [selectedNodeIdx, setSelectedNodeIdx] = useState<number | null>(null)
  const [hoverEdge, setHoverEdge] = useState<{ cx: number; cy: number; segmentIdx: number; t: number; projX: number; projY: number } | null>(null)
  const [activeSnapGuides, setActiveSnapGuides] = useState<SnapGuide[]>([])

  // Cursor Tracker untuk Live Rubberband Pen-Tool
  const [cursorPos, setCursorPos] = useState<{ cx: number; cy: number; mx: number; my: number } | null>(null)

  // 2-Click Zone Marking State (Titik Awal sedang ditandai dengan Rubberband di dinding)
  const [pendingZoneStart, setPendingZoneStart] = useState<{
    tool: ActiveTool
    segIdx: number
    tA: number
    ptA: Point
    canvasA: { cx: number; cy: number }
  } | null>(null)

  // State Ukuran Sisi Dinding & Arah Pergeseran (Identik dengan Kalkulator Lampu)
  const [segmentLengths, setSegmentLengths] = useState<(number | string)[]>([])
  const [editingSegmentIdx, setEditingSegmentIdx] = useState<number | null>(null)
  const [expandDir, setExpandDir] = useState<"end" | "start" | "center">("center")

  // Tools Penanda Zona (Denah Utama, Pintu/Kaca, Kasir, Chiller)
  const [activeTool, setActiveTool] = useState<ActiveTool>("DRAW")

  // Overrides status segmen dinding
  const [segmentOverrides, setSegmentOverrides] = useState<Record<number, WallType>>({})

  // Template Preset Dialog
  const [presetModalOpen, setPresetModalOpen] = useState(false)
  const [presetType, setPresetType] = useState<"rect" | "L">("rect")
  const [presetRect, setPresetRect] = useState({ panjang: "12", lebar: "8" })
  const [presetL, setPresetL] = useState({ p: "14", l: "10", w: "6", h: "4" })

  // ─── 3. State AC Layout & Perhitungan ──────────────────────────────────────
  const [placedUnits, setPlacedUnits] = useState<PlacedAcUnit[]>([])
  const [isCalculated, setIsCalculated] = useState<boolean>(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const exportCardRef = useRef<HTMLDivElement | null>(null)
  const dragStartSnapshotRef = useRef<{ pts: Point[]; closed: boolean; overrides: Record<number, WallType> } | null>(null)

  // ─── 4. Hitung Luas Denah Poligon (Gauss Formula) ─────────────────────────
  const polygonAreaM2 = useMemo(() => {
    return calcPolygonArea(customPts)
  }, [customPts])

  // Target BTU/m² dari Suhu Open-Meteo
  const targetBtuPerM2 = useMemo(() => {
    return calculatedBtuPerM2
  }, [calculatedBtuPerM2])

  // Total Luas Efektif
  const effectiveArea = useMemo(() => {
    if (customPts.length >= 3 && customClosed) {
      return Number(polygonAreaM2.toFixed(1))
    }
    if (storeMode === "existing" && selectedStore?.salesAreaM2) {
      return selectedStore.salesAreaM2
    }
    if (storeMode === "new" && parseFloat(newStoreArea) > 0) {
      return parseFloat(newStoreArea)
    }
    return 0
  }, [customPts, customClosed, polygonAreaM2, storeMode, selectedStore, newStoreArea])

  const totalBtuRequired = useMemo(() => {
    return Math.round(effectiveArea * targetBtuPerM2)
  }, [effectiveArea, targetBtuPerM2])

  const recommendedUnitCount = useMemo(() => {
    if (effectiveArea === 0) return 0
    return Math.max(1, Math.round(totalBtuRequired / AC_CAPACITY_BTU))
  }, [effectiveArea, totalBtuRequired])

  // ─── 5. Segmen Dinding Poligon ────────────────────────────────────────────
  const wallSegments = useMemo<WallSegment[]>(() => {
    const pts = customPts
    if (pts.length < 2) return []
    const count = customClosed ? pts.length : pts.length - 1
    const segs: WallSegment[] = []

    for (let i = 0; i < count; i++) {
      const p1 = pts[i]
      const p2 = pts[(i + 1) % pts.length]
      const lengthM = Math.hypot(p2.x - p1.x, p2.y - p1.y)

      const type: WallType = segmentOverrides[i] !== undefined
        ? segmentOverrides[i]
        : "SOLID"

      segs.push({
        index: i,
        startIndex: i,
        endIndex: (i + 1) % pts.length,
        p1,
        p2,
        lengthM,
        type,
      })
    }
    return segs
  }, [customPts, customClosed, segmentOverrides])

  // ─── 6. Sync Input Panjang Sisi Dinding ──────────────────────────────────
  useEffect(() => {
    if (customPts.length < 2) {
      setSegmentLengths([])
      return
    }
    const count = customClosed ? customPts.length : customPts.length - 1
    setSegmentLengths(prev => {
      const next: (number | string)[] = []
      for (let i = 0; i < count; i++) {
        if (editingSegmentIdx === i && prev[i] !== undefined) {
          next.push(prev[i])
          continue
        }
        const p1 = customPts[i]
        const p2 = customPts[(i + 1) % customPts.length]
        if (p1 && p2) {
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
          next.push(Number(dist.toFixed(2)))
        }
      }
      return next
    })
  }, [customPts, customClosed, editingSegmentIdx])

  // ─── 7. History Push (Undo / Redo) ─────────────────────────────────────────
  const pushCurrentToHistory = useCallback(() => {
    setHistoryPast((prev) => [...(prev || []).filter(Boolean).slice(-30), { pts: [...customPts], closed: customClosed, overrides: { ...segmentOverrides } }])
    setHistoryFuture([])
  }, [customPts, customClosed, segmentOverrides])

  const handleUndo = useCallback(() => {
    setHistoryPast((prevPast) => {
      if (!prevPast || prevPast.length === 0) return prevPast
      const validPast = prevPast.filter(Boolean)
      if (validPast.length === 0) return []
      const last = validPast[validPast.length - 1]
      if (!last || !last.pts) return validPast.slice(0, -1)

      const newPast = validPast.slice(0, -1)
      setHistoryFuture((prevFuture) => [{ pts: [...customPts], closed: customClosed, overrides: { ...segmentOverrides } }, ...prevFuture])
      setCustomPts(last.pts)
      setCustomClosed(last.closed)
      setSegmentOverrides(last.overrides || {})
      return newPast
    })
    setPendingZoneStart(null)
    toast.info("Perubahan denah dibatalkan (Undo)")
  }, [customPts, customClosed, segmentOverrides])

  const handleRedo = useCallback(() => {
    setHistoryFuture((prevFuture) => {
      if (!prevFuture || prevFuture.length === 0) return prevFuture
      const validFuture = prevFuture.filter(Boolean)
      if (validFuture.length === 0) return []
      const next = validFuture[0]
      if (!next || !next.pts) return validFuture.slice(1)

      const newFuture = validFuture.slice(1)
      setHistoryPast((prevPast) => [...(prevPast || []).filter(Boolean).slice(-30), { pts: [...customPts], closed: customClosed, overrides: { ...segmentOverrides } }])
      setCustomPts(next.pts)
      setCustomClosed(next.closed)
      setSegmentOverrides(next.overrides || {})
      return newFuture
    })
    setPendingZoneStart(null)
    toast.info("Perubahan denah dipulihkan (Redo)")
  }, [customPts, customClosed, segmentOverrides])

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return
      }

      if (e.key === "Escape") {
        setSelectedNodeIdx(null)
        setPendingZoneStart(null)
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
  }, [handleUndo, handleRedo])

  // Auto-deselect node when clicking outside
  useEffect(() => {
    if (selectedNodeIdx === null && pendingZoneStart === null) return
    const handleDocumentPointerDown = (e: MouseEvent | TouchEvent) => {
      const container = canvasRef.current?.parentElement?.parentElement
      if (container && !container.contains(e.target as Node)) {
        setSelectedNodeIdx(null)
      }
    }
    document.addEventListener("pointerdown", handleDocumentPointerDown)
    return () => document.removeEventListener("pointerdown", handleDocumentPointerDown)
  }, [selectedNodeIdx, pendingZoneStart])

  const handleResetCanvas = () => {
    pushCurrentToHistory()
    setCustomPts([])
    setCustomClosed(false)
    setSelectedNodeIdx(null)
    setSegmentOverrides({})
    setPlacedUnits([])
    setIsCalculated(false)
    setPendingZoneStart(null)
    toast.info("Kanvas denah telah dikosongkan.")
  }

  // Hapus Titik Custom (Identik dengan Kalkulator Lampu)
  const handleDeleteCustomPoint = useCallback((idx: number) => {
    if (customPts.length <= 3) {
      toast.error("Denah poligon membutuhkan minimal 3 titik sudut.")
      return
    }

    pushCurrentToHistory()
    setCustomPts((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      if (next.length < 3) setCustomClosed(false)
      return next
    })
    setSegmentLengths((prev) => prev.filter((_, i) => i !== idx))
    setSegmentOverrides((prev) => {
      const newOverrides: Record<number, WallType> = {}
      Object.entries(prev).forEach(([kStr, val]) => {
        const k = parseInt(kStr, 10)
        if (k < idx) newOverrides[k] = val
        else if (k > idx) newOverrides[k - 1] = val
      })
      return newOverrides
    })
    setSelectedNodeIdx(null)
    setPendingZoneStart(null)
    toast.info(`Titik T${idx + 1} berhasil dihapus.`)
  }, [customPts, pushCurrentToHistory])

  // Update Panjang Sisi Dinding (Identik dengan Kalkulator Lampu)
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

      const updated = prev.map((pt, i) => {
        if (dir === "end" && i === p2Idx) {
          return {
            x: Number((pt.x + deltaX).toFixed(3)),
            y: Number((pt.y + deltaY).toFixed(3))
          }
        }
        if (dir === "start" && i === p1Idx) {
          return {
            x: Number((pt.x - deltaX).toFixed(3)),
            y: Number((pt.y - deltaY).toFixed(3))
          }
        }
        if (dir === "center") {
          if (i === p1Idx) {
            return {
              x: Number((pt.x - deltaX / 2).toFixed(3)),
              y: Number((pt.y - deltaY / 2).toFixed(3))
            }
          }
          if (i === p2Idx) {
            return {
              x: Number((pt.x + deltaX / 2).toFixed(3)),
              y: Number((pt.y + deltaY / 2).toFixed(3))
            }
          }
        }
        return pt
      })

      const minX = Math.min(...updated.map(p => p.x))
      const minY = Math.min(...updated.map(p => p.y))
      if (minX < 0 || minY < 0) {
        return updated.map(p => ({
          x: Number((p.x - minX).toFixed(3)),
          y: Number((p.y - minY).toFixed(3))
        }))
      }
      return updated
    })
  }, [expandDir, pushCurrentToHistory])

  // ─── 8. Preset Template Handler ───────────────────────────────────────────
  const handleApplyPreset = () => {
    pushCurrentToHistory()
    if (presetType === "rect") {
      const p = Math.max(4, parseFloat(presetRect.panjang) || 12)
      const l = Math.max(3, parseFloat(presetRect.lebar) || 8)
      setCustomPts([
        { x: 0, y: 0 },
        { x: p, y: 0 },
        { x: p, y: l },
        { x: 0, y: l },
      ])
    } else {
      const p = Math.max(6, parseFloat(presetL.p) || 14)
      const l = Math.max(5, parseFloat(presetL.l) || 10)
      const w = Math.max(2, parseFloat(presetL.w) || 6)
      const h = Math.max(2, parseFloat(presetL.h) || 4)
      setCustomPts([
        { x: 0, y: 0 },
        { x: p - w, y: 0 },
        { x: p - w, y: h },
        { x: p, y: h },
        { x: p, y: l },
        { x: 0, y: l },
      ])
    }
    setCustomClosed(true)
    setSegmentOverrides({})
    setPresetModalOpen(false)
    setPendingZoneStart(null)
    toast.success("Template denah berhasil dimuat dan dipusatkan di kanvas.")
  }

  // ─── 9. Handler Pilih Toko ────────────────────────────────────────────────
  const handleSelectStore = (store: StoreData) => {
    setSelectedStore(store)
    setIsCalculated(false)
    setCalculatedTemp(null)
    if (store) {
      if (store.salesAreaM2) {
        const side = Math.sqrt(store.salesAreaM2)
        const p = Math.round(side * 1.3)
        const l = Math.round(store.salesAreaM2 / p)
        setPresetRect({ panjang: p.toString(), lebar: l.toString() })
        setCustomPts([
          { x: 0, y: 0 },
          { x: p, y: 0 },
          { x: p, y: l },
          { x: 0, y: l },
        ])
        setCustomClosed(true)
        setSegmentOverrides({})
      }
      if (store.latitude && store.longitude) {
        setCoordInput(`${store.latitude}, ${store.longitude}`)
      }
    }
  }

  // ─── 10. Auto-Placement Algorithm: Menempatkan AC Otomatis 100% ────────────
  const calculateAndPlaceUnits = async () => {
    if (customPts.length < 3 || !customClosed) {
      toast.error("Tutup denah poligon toko terlebih dahulu sebelum menghitung.")
      return
    }

    // Ambil dinding yang berstatus SOLID (Dinding Bata Solid)
    const validWalls = wallSegments.filter((w) => w.type === "SOLID")
    if (validWalls.length === 0) {
      toast.error("Semua dinding ditandai sebagai area terlarang. Sisakan minimal 1 dinding solid.")
      return
    }

    // Parse koordinat
    let lat = "-6.200000"
    let lng = "106.816666"
    if (coordInput) {
      const parts = coordInput.split(",").map((p) => p.trim())
      if (parts.length >= 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
        lat = parts[0]
        lng = parts[1]
      }
    }

    setIsCalculating(true)
    let maxTemp = 31.4
    let clusterBtu = 600

    try {
      const res = await getTemperature(lat, lng)
      if (res.error) {
        toast.warning(`Open-Meteo: ${res.error.message}, menggunakan standar 600 BTU/m²`)
      } else if (res.maxTemp !== undefined) {
        maxTemp = Number(res.maxTemp.toFixed(1))
      }
    } catch {
      toast.warning("Gagal mengambil data cuaca Open-Meteo, menggunakan standar 600 BTU/m²")
    } finally {
      setIsCalculating(false)
    }

    // Tentukan Klaster BTU sesuai suhu (Formula Resmi v1.2.0)
    if (maxTemp > 35) {
      clusterBtu = 751
    } else if (maxTemp >= 27 && maxTemp <= 35) {
      clusterBtu = 600
    } else {
      clusterBtu = 450
    }

    setCalculatedTemp(maxTemp)
    setCalculatedBtuPerM2(clusterBtu)

    const totalBtu = Math.round(effectiveArea * clusterBtu)
    const n = effectiveArea > 0 ? Math.max(1, Math.round(totalBtu / AC_CAPACITY_BTU)) : 0
    const newUnits: PlacedAcUnit[] = []

    // Sort dinding valid berdasarkan panjang
    const sortedWalls = [...validWalls].sort((a, b) => b.lengthM - a.lengthM)

    for (let i = 0; i < n; i++) {
      const targetWall = sortedWalls[i % sortedWalls.length]
      const countOnThisWall = Math.floor(n / sortedWalls.length) + (i < n % sortedWalls.length ? 1 : 0)
      const slot = Math.floor(i / sortedWalls.length)

      const step = 1 / (countOnThisWall + 1)
      const ratio = Number(((slot + 1) * step).toFixed(2))

      newUnits.push({
        id: `ac-unit-${i + 1}`,
        wallIndex: targetWall.index,
        ratio: Math.min(0.85, Math.max(0.15, ratio)),
        customName: `Daikin 2 PK #${i + 1}`,
        wallLabel: `Dinding T${targetWall.startIndex + 1} - T${targetWall.endIndex + 1}`,
      })
    }

    setPlacedUnits(newUnits)
    setIsCalculated(true)
    toast.success(`Berhasil menghitung (${maxTemp}°C / ${clusterBtu} BTU/m²) & memetakan ${n} Unit AC Daikin 2 PK!`)
  }

  // ─── 11. Canvas Pointer Interactions (Drag, Snap & 2-Click Zone Marking) ───
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    const W = canvas.offsetWidth || 340
    const sc = customClosed && customPts.length >= 3 ? getScaleInfo(customPts, W, CANVAS_H) : null
    const scale = sc ? sc.scale : FIXED_SCALE
    const offX = sc ? sc.offX : FIXED_OX
    const offY = sc ? sc.offY : FIXED_OY

    // JIKA TOOL RESTRICTED ZONE AKTIF (PINTU/KACA, KASIR, CHILLER):
    if (activeTool !== "DRAW") {
      if (!customClosed || customPts.length < 3) {
        toast.info("Tutup denah poligon terlebih dahulu untuk menandai area terlarang.")
        return
      }

      const spts = customPts.map((pt) => ({
        cx: offX + pt.x * scale,
        cy: offY + pt.y * scale,
      }))
      const segCount = spts.length
      let bestSegIdx = -1
      let bestDist = 20
      let bestProj: { x: number; y: number; dist: number; t: number } | null = null

      for (let i = 0; i < segCount; i++) {
        const p1 = spts[i]
        const p2 = spts[(i + 1) % spts.length]
        const proj = getClosestPointOnSegment(cx, cy, p1.cx, p1.cy, p2.cx, p2.cy)

        if (proj.dist < bestDist) {
          bestDist = proj.dist
          bestSegIdx = i
          bestProj = proj
        }
      }

      if (bestSegIdx !== -1 && bestProj) {
        const mX = Number(((bestProj.x - offX) / scale).toFixed(2))
        const mY = Number(((bestProj.y - offY) / scale).toFixed(2))
        const clickPt = { x: mX, y: mY }
        const toolLabel = activeTool === "DOOR" ? "Pintu/Kaca 🚪" : activeTool === "CASHIER" ? "Kasir 🛒" : "Chiller 🧊"

        // LANGKAH 1: Klik Titik Awal
        if (!pendingZoneStart || pendingZoneStart.tool !== activeTool) {
          setPendingZoneStart({
            tool: activeTool,
            segIdx: bestSegIdx,
            tA: bestProj.t,
            ptA: clickPt,
            canvasA: { cx: bestProj.x, cy: bestProj.y },
          })
          toast.info(`Titik awal ${toolLabel} ditandai! Gerakkan kursor ke titik akhir pada dinding lalu klik.`)
          return
        }

        // LANGKAH 2: Klik Titik Akhir pada Segmen Dinding
        if (pendingZoneStart && pendingZoneStart.tool === activeTool) {
          const segIdx = pendingZoneStart.segIdx
          const tA = pendingZoneStart.tA
          const tB = bestProj.t
          const ptA = pendingZoneStart.ptA
          const ptB = clickPt

          const distZone = Math.hypot(ptB.x - ptA.x, ptB.y - ptA.y)
          if (distZone < 0.2) {
            toast.error("Panjang bentang area terlalu pendek (< 0.2m). Silakan tentukan jarak yang lebih besar.")
            return
          }

          pushCurrentToHistory()

          // Urutkan t1 < t2
          const isAscending = tA <= tB
          const t1 = isAscending ? tA : tB
          const t2 = isAscending ? tB : tA
          const p1 = isAscending ? ptA : ptB
          const p2 = isAscending ? ptB : ptA

          // Sisipkan kedua titik sudut baru ke dalam array customPts pada segIdx
          const newPts = [...customPts]
          let insertedCount = 0

          // Sisipkan p1 jika bukan di ujung sudut
          let insertP1 = t1 > 0.03 && t1 < 0.97
          let insertP2 = t2 > 0.03 && t2 < 0.97 && Math.hypot(p2.x - p1.x, p2.y - p1.y) > 0.1

          if (insertP1 && insertP2) {
            newPts.splice(segIdx + 1, 0, p1, p2)
            insertedCount = 2
          } else if (insertP1) {
            newPts.splice(segIdx + 1, 0, p1)
            insertedCount = 1
          } else if (insertP2) {
            newPts.splice(segIdx + 1, 0, p2)
            insertedCount = 1
          }

          setCustomPts(newPts)

          // Set override untuk segmen yang baru dipotong
          const targetType: WallType =
            activeTool === "DOOR" ? "GLASS_DOOR" : activeTool === "CASHIER" ? "CASHIER" : "CHILLER"

          let zoneSegIdx = segIdx
          if (insertP1) zoneSegIdx = segIdx + 1

          setSegmentOverrides((prev) => ({
            ...prev,
            [zoneSegIdx]: targetType,
          }))

          setPendingZoneStart(null)
          toast.success(`Area ${toolLabel} (${formatDim(distZone)}m) berhasil ditandai pada dinding!`)
          return
        }
      }
      return
    }

    // JIKA TOOL DRAW (DENAH UTAMA):
    if (customPts.length > 0) {
      const spts = customPts.map((pt) => ({
        cx: offX + pt.x * scale,
        cy: offY + pt.y * scale,
      }))

      // 1. Cek klik pada node sudut untuk drag atau tutup poligon
      for (let i = 0; i < spts.length; i++) {
        if (Math.hypot(cx - spts[i].cx, cy - spts[i].cy) <= 16) {
          setSelectedNodeIdx(i)

          // Jika klik T1 saat unclosed & titik >= 3 -> Tutup poligon
          if (i === 0 && customPts.length >= 3 && !customClosed) {
            pushCurrentToHistory()
            setCustomClosed(true)
            toast.success("Poligon denah berhasil ditutup dan dipusatkan!")
            return
          }

          dragStartSnapshotRef.current = { pts: [...customPts], closed: customClosed, overrides: { ...segmentOverrides } }
          setActiveDragIdx(i)
          try {
            ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
          } catch {}
          return
        }
      }

      // 2. Cek klik pada garis segmen (Pen Tool: Sisipkan Titik Baru)
      if (customPts.length >= 2) {
        const segCount = customClosed ? spts.length : spts.length - 1
        let bestSegIdx = -1
        let bestDist = 14
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
          const mX = Number(((bestClosest.x - offX) / scale).toFixed(2))
          const mY = Number(((bestClosest.y - offY) / scale).toFixed(2))
          const insertIdx = bestSegIdx + 1

          pushCurrentToHistory()
          dragStartSnapshotRef.current = { pts: [...customPts], closed: customClosed, overrides: { ...segmentOverrides } }

          setCustomPts((prev) => {
            const next = [...prev]
            next.splice(insertIdx, 0, { x: mX, y: mY })
            return next
          })

          setSelectedNodeIdx(insertIdx)
          setActiveDragIdx(insertIdx)
          try {
            ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
          } catch {}

          toast.info(`Titik T${insertIdx + 1} ditambahkan pada dinding. Geser titik untuk membentuk lekukan!`)
          return
        }
      }
    }

    // 3. Tambah titik baru jika belum ditutup
    if (!customClosed) {
      let mx = Number(((cx - FIXED_OX) / FIXED_SCALE).toFixed(2))
      let my = Number(((cy - FIXED_OY) / FIXED_SCALE).toFixed(2))

      // Apply 90° snap to last point if nearby
      if (customPts.length >= 1) {
        const last = customPts[customPts.length - 1]
        if (Math.abs(my - last.y) < 0.3) my = last.y
        if (Math.abs(mx - last.x) < 0.3) mx = last.x
      }

      pushCurrentToHistory()
      setCustomPts((prev) => [...prev, { x: Math.max(0, mx), y: Math.max(0, my) }])
      setSelectedNodeIdx(null)
    } else {
      setSelectedNodeIdx(null)
    }
  }

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    const W = canvas.offsetWidth || 340
    const sc = customClosed && customPts.length >= 3 ? getScaleInfo(customPts, W, CANVAS_H) : null
    const scale = sc ? sc.scale : FIXED_SCALE
    const offX = sc ? sc.offX : FIXED_OX
    const offY = sc ? sc.offY : FIXED_OY

    const mx = Number(((cx - offX) / scale).toFixed(2))
    const my = Number(((cy - offY) / scale).toFixed(2))
    setCursorPos({ cx, cy, mx, my })

    // DRAGGING POINT HANDLER
    if (activeDragIdx !== null) {
      const rawMx = (cx - offX) / scale
      const rawMy = (cy - offY) / scale
      let newX = Math.max(0, rawMx)
      let newY = Math.max(0, rawMy)

      const snapThresholdM = 10 / scale
      const guides: SnapGuide[] = []
      const n = customPts.length
      const prevIdx = (activeDragIdx - 1 + n) % n
      const nextIdx = (activeDragIdx + 1) % n

      let snappedX = false
      let snappedY = false

      // 1. Orthogonal 90° snapping dengan titik tetangga
      const neighbors = [
        { idx: prevIdx, pt: customPts[prevIdx] },
        { idx: nextIdx, pt: customPts[nextIdx] },
      ].filter((item) => item.pt && item.idx !== activeDragIdx)

      for (const { idx, pt } of neighbors) {
        if (!snappedY && Math.abs(rawMy - pt.y) <= snapThresholdM) {
          newY = pt.y
          snappedY = true
          guides.push({
            type: "h",
            pos: pt.y,
            fromCanvas: { x: 0, y: offY + pt.y * scale },
            toCanvas: { x: W, y: offY + pt.y * scale },
            snapType: "orthogonal",
            refNodeIdx: idx,
          })
        }
        if (!snappedX && Math.abs(rawMx - pt.x) <= snapThresholdM) {
          newX = pt.x
          snappedX = true
          guides.push({
            type: "v",
            pos: pt.x,
            fromCanvas: { x: offX + pt.x * scale, y: 0 },
            toCanvas: { x: offX + pt.x * scale, y: CANVAS_H },
            snapType: "orthogonal",
            refNodeIdx: idx,
          })
        }
      }

      // 2. Alignment Snapping dengan node lainnya
      for (let i = 0; i < n; i++) {
        if (i === activeDragIdx || i === prevIdx || i === nextIdx) continue
        const pt = customPts[i]
        if (!pt) continue

        if (!snappedY && Math.abs(rawMy - pt.y) <= snapThresholdM) {
          newY = pt.y
          snappedY = true
          guides.push({
            type: "h",
            pos: pt.y,
            fromCanvas: { x: 0, y: offY + pt.y * scale },
            toCanvas: { x: W, y: offY + pt.y * scale },
            snapType: "alignment",
            refNodeIdx: i,
          })
        }
        if (!snappedX && Math.abs(rawMx - pt.x) <= snapThresholdM) {
          newX = pt.x
          snappedX = true
          guides.push({
            type: "v",
            pos: pt.x,
            fromCanvas: { x: offX + pt.x * scale, y: 0 },
            toCanvas: { x: offX + pt.x * scale, y: CANVAS_H },
            snapType: "alignment",
            refNodeIdx: i,
          })
        }
      }

      setActiveSnapGuides(guides)

      setCustomPts((prev) => {
        const next = [...prev]
        next[activeDragIdx] = { x: Number(newX.toFixed(3)), y: Number(newY.toFixed(3)) }
        return next
      })
      return
    }

    // Hover detection untuk Pen Tool pada garis
    if (customPts.length >= 2) {
      const spts = customPts.map((pt) => ({
        cx: offX + pt.x * scale,
        cy: offY + pt.y * scale,
      }))
      const segCount = customClosed ? spts.length : spts.length - 1
      let foundHover: { cx: number; cy: number; segmentIdx: number; t: number; projX: number; projY: number } | null = null
      let bestDist = 18

      for (let i = 0; i < segCount; i++) {
        const p1 = spts[i]
        const p2 = spts[(i + 1) % spts.length]
        const proj = getClosestPointOnSegment(cx, cy, p1.cx, p1.cy, p2.cx, p2.cy)

        if (proj.dist < bestDist) {
          bestDist = proj.dist
          foundHover = {
            cx: proj.x,
            cy: proj.y,
            segmentIdx: i,
            t: proj.t,
            projX: Number(((proj.x - offX) / scale).toFixed(2)),
            projY: Number(((proj.y - offY) / scale).toFixed(2)),
          }
        }
      }

      setHoverEdge(foundHover)
    }
  }

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeDragIdx !== null) {
      try {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {}

      if (dragStartSnapshotRef.current) {
        const snap = dragStartSnapshotRef.current
        dragStartSnapshotRef.current = null
        if (snap && snap.pts) {
          const initialPt = snap.pts[activeDragIdx]
          const currentPt = customPts[activeDragIdx]
          if (initialPt && currentPt) {
            const distMoved = Math.hypot(currentPt.x - initialPt.x, currentPt.y - initialPt.y)
            if (distMoved > 0.05) {
              setHistoryPast((prev) => [...(prev || []).filter(Boolean).slice(-30), snap])
              setHistoryFuture([])
            }
          }
        }
      }

      setActiveSnapGuides([])
      setActiveDragIdx(null)
    }
  }

  const handleCanvasPointerLeave = () => {
    setCursorPos(null)
    setHoverEdge(null)
  }

  // ─── 12. Render Canvas Denah (Auto-Center, Rubberband Pen-Tool & 2-Click Zone Preview) ───
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.max(window.devicePixelRatio || 1, 2)
    const W = canvas.offsetWidth || 340
    const H = CANVAS_H

    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    canvas.style.width = W + "px"
    canvas.style.height = H + "px"

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const bgFill = isDark ? "#0c0d12" : "#ffffff"
    const gridStroke = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"
    const meterGridStroke = isDark ? "rgba(245,158,11,0.05)" : "rgba(245,158,11,0.12)"
    const meterLabelFill = isDark ? "rgba(245,158,11,0.3)" : "rgba(180,83,9,0.6)"
    const subTextFill = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.4)"
    const subTextFill2 = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.25)"
    const ptLabelFill = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)"
    const polyFill = isDark ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.04)"
    const nodeTextFill = isDark ? "#a1a1aa" : "#4b5563"

    // Background Canvas
    ctx.fillStyle = bgFill
    ctx.fillRect(0, 0, W, H)

    // Fine grid
    ctx.strokeStyle = gridStroke
    ctx.lineWidth = 0.5
    for (let x = 0; x < W; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    for (let y = 0; y < H; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    // A. MODE UNCLOSED: FIXED GRID (0m, 2m, 4m...) & LIVE RUBBERBAND PEN-TOOL
    if (!customClosed || customPts.length < 3) {
      ctx.strokeStyle = meterGridStroke
      ctx.lineWidth = 0.5
      for (let m = 0; m <= 25; m++) {
        const sx = FIXED_OX + m * FIXED_SCALE
        const sy = FIXED_OY + m * FIXED_SCALE
        if (sx < W) { ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, H); ctx.stroke() }
        if (sy < H) { ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke() }
      }

      ctx.fillStyle = meterLabelFill
      ctx.font = "8px sans-serif"
      ctx.textAlign = "center"
      for (let m = 0; m <= 20; m += 2) {
        const sx = FIXED_OX + m * FIXED_SCALE
        if (sx < W - 10) ctx.fillText(`${m}m`, sx, FIXED_OY - 4)
      }
      ctx.textAlign = "right"
      for (let m = 0; m <= 15; m += 2) {
        const sy = FIXED_OY + m * FIXED_SCALE
        if (sy < H - 6) ctx.fillText(`${m}m`, FIXED_OX - 4, sy + 3)
      }

      if (customPts.length === 0) {
        ctx.fillStyle = subTextFill
        ctx.font = "11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("Sentuh canvas untuk menambah sudut dinding denah toko", W / 2, H / 2 - 10)
        ctx.font = "9px sans-serif"
        ctx.fillStyle = subTextFill2
        ctx.fillText("Skala: 1 kotak = 1 meter · Minimal 3 sudut · Atau pilih Template Bentuk", W / 2, H / 2 + 8)
        return
      }

      // Render garis unclosed
      const toF = (pt: Point) => ({ cx: FIXED_OX + pt.x * FIXED_SCALE, cy: FIXED_OY + pt.y * FIXED_SCALE })
      const spts = customPts.map(toF)

      ctx.beginPath()
      spts.forEach((sp, idx) => idx === 0 ? ctx.moveTo(sp.cx, sp.cy) : ctx.lineTo(sp.cx, sp.cy))
      ctx.strokeStyle = "rgba(245,158,11,0.6)"
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 2])
      ctx.stroke()
      ctx.setLineDash([])

      // Render dimensi garis eksisting
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

          const segText = `${formatDim(lenVal)}m`

          ctx.save()
          ctx.translate(mx, my - 8)
          ctx.rotate(angle)
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          ctx.strokeStyle = bgFill
          ctx.lineWidth = 1.5
          ctx.strokeText(segText, 0, 0)
          ctx.fillStyle = isDark ? "#34d399" : "#047857"
          ctx.fillText(segText, 0, 0)
          ctx.restore()
        }
        ctx.restore()
      }

      // ── LIVE RUBBERBAND PEN-TOOL LINE (Menempel ke Kursor saat Menambah Titik) ──
      if (cursorPos && customPts.length >= 1) {
        const lastSp = spts[spts.length - 1]
        const lastPt = customPts[customPts.length - 1]

        let targetCx = cursorPos.cx
        let targetCy = cursorPos.cy
        let targetMx = cursorPos.mx
        let targetMy = cursorPos.my
        let isSnappedOrthogonal = false

        // 90° Orthogonal Snap to last point
        if (Math.abs(cursorPos.my - lastPt.y) < 0.35) {
          targetMy = lastPt.y
          targetCy = lastSp.cy
          isSnappedOrthogonal = true
        } else if (Math.abs(cursorPos.mx - lastPt.x) < 0.35) {
          targetMx = lastPt.x
          targetCx = lastSp.cx
          isSnappedOrthogonal = true
        }

        // Snap to T1 if close & points >= 3 (Close Polygon Preview)
        let isCloseSnap = false
        if (customPts.length >= 3) {
          const t1Sp = spts[0]
          if (Math.hypot(cursorPos.cx - t1Sp.cx, cursorPos.cy - t1Sp.cy) <= 18) {
            targetCx = t1Sp.cx
            targetCy = t1Sp.cy
            targetMx = customPts[0].x
            targetMy = customPts[0].y
            isCloseSnap = true
          }
        }

        // Draw live dashed rubberband
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(lastSp.cx, lastSp.cy)
        ctx.lineTo(targetCx, targetCy)
        ctx.strokeStyle = isCloseSnap ? "#10b981" : (isSnappedOrthogonal ? "#06b6d4" : "rgba(245, 158, 11, 0.8)")
        ctx.lineWidth = isCloseSnap ? 2 : 1.5
        ctx.setLineDash([4, 3])
        ctx.stroke()
        ctx.setLineDash([])

        // Live distance badge along rubberband
        const liveDist = Math.hypot(targetMx - lastPt.x, targetMy - lastPt.y)
        if (liveDist > 0.3) {
          const midX = (lastSp.cx + targetCx) / 2
          const midY = (lastSp.cy + targetCy) / 2

          ctx.font = "bold 9px sans-serif"
          ctx.fillStyle = isCloseSnap ? "#10b981" : (isSnappedOrthogonal ? "#06b6d4" : "#f59e0b")
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(`${formatDim(liveDist)}m ${isSnappedOrthogonal ? "(⦜ 90°)" : ""}`, midX, midY - 10)
        }

        // Live cursor circle tip
        ctx.beginPath()
        ctx.arc(targetCx, targetCy, isCloseSnap ? 8 : 4.5, 0, Math.PI * 2)
        ctx.fillStyle = isCloseSnap ? "rgba(16, 185, 129, 0.4)" : "rgba(6, 182, 212, 0.3)"
        ctx.fill()
        ctx.strokeStyle = isCloseSnap ? "#10b981" : "#06b6d4"
        ctx.lineWidth = 1.8
        ctx.stroke()

        if (isCloseSnap) {
          ctx.font = "bold 9.5px sans-serif"
          ctx.fillStyle = "#10b981"
          ctx.fillText("Klik untuk Tutup Poligon", targetCx + 12, targetCy - 8)
        }
        ctx.restore()
      }

      // Render node sudut
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
        ctx.fillText(`T${idx + 1} (${formatDim(customPts[idx].x)},${formatDim(customPts[idx].y)})`, sp.cx + 6, sp.cy - 3)
      })

      // Ring hijau di T1 untuk tutup poligon
      if (customPts.length >= 3) {
        ctx.beginPath()
        ctx.arc(spts[0].cx, spts[0].cy, 12, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(16,185,129,0.5)"
        ctx.lineWidth = 1.5
        ctx.setLineDash([3, 3])
        ctx.stroke()
        ctx.setLineDash([])
      }
      return
    }

    // B. MODE CLOSED: AUTO-CENTER DENGAN GETSCALEINFO (Sama Seperti Kalkulator Lampu)
    const sc = getScaleInfo(customPts, W, H)
    const toC = (pt: Point) => ({ cx: sc.offX + pt.x * sc.scale, cy: sc.offY + pt.y * sc.scale })
    const sPts = customPts.map(toC)

    // 1. Lantai Poligon Denah Toko & Clip
    ctx.save()
    ctx.beginPath()
    sPts.forEach((sp, idx) => idx === 0 ? ctx.moveTo(sp.cx, sp.cy) : ctx.lineTo(sp.cx, sp.cy))
    ctx.closePath()
    ctx.fillStyle = polyFill
    ctx.fill()
    ctx.clip() // Semburan AC terkunci rapi di dalam denah toko

    // 2. Render Thermal Potential Gradient (Hembusan AC 70°)
    if (isCalculated && placedUnits.length > 0) {
      placedUnits.forEach((unit) => {
        const wall = wallSegments.find((w) => w.index === unit.wallIndex)
        if (!wall) return

        const acX = wall.p1.x + (wall.p2.x - wall.p1.x) * unit.ratio
        const acY = wall.p1.y + (wall.p2.y - wall.p1.y) * unit.ratio
        const cAcX = sc.offX + acX * sc.scale
        const cAcY = sc.offY + acY * sc.scale

        const dx = wall.p2.x - wall.p1.x
        const dy = wall.p2.y - wall.p1.y
        const len = Math.hypot(dx, dy)
        if (len === 0) return

        let nx = -dy / len
        let ny = dx / len

        // Normal mengarah ke dalam poligon
        const cX = (sc.minX! + sc.maxX!) / 2
        const cY = (sc.minY! + sc.maxY!) / 2
        if (nx * (cX - acX) + ny * (cY - acY) < 0) {
          nx = -nx
          ny = -ny
        }

        const baseAngle = Math.atan2(ny, nx)
        const halfSpread = ((SPREAD_ANGLE_DEG / 2) * Math.PI) / 180

        const drawCone = (radiusM: number, color: string, alpha: number) => {
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(cAcX, cAcY)
          ctx.arc(cAcX, cAcY, radiusM * sc.scale, baseAngle - halfSpread, baseAngle + halfSpread)
          ctx.closePath()
          ctx.fillStyle = color
          ctx.globalAlpha = alpha
          ctx.fill()
          ctx.restore()
        }

        // 3 Zona Semburan Kipas
        drawCone(THROW_Z3_M, "rgba(56, 189, 248, 0.25)", 0.35) // Zona 3 (5.5 - 7.5m)
        drawCone(THROW_Z2_M, "rgba(14, 165, 233, 0.45)", 0.55) // Zona 2 (2.5 - 5.5m)
        drawCone(THROW_Z1_M, "rgba(2, 132, 199, 0.75)", 0.85)  // Zona 1 (0 - 2.5m)

        // Centerline hembusan
        ctx.save()
        ctx.beginPath()
        ctx.setLineDash([3, 3])
        ctx.strokeStyle = "rgba(3, 105, 161, 0.8)"
        ctx.lineWidth = 1.2
        ctx.moveTo(cAcX, cAcY)
        ctx.lineTo(cAcX + Math.cos(baseAngle) * THROW_Z2_M * sc.scale, cAcY + Math.sin(baseAngle) * THROW_Z2_M * sc.scale)
        ctx.stroke()
        ctx.restore()
      })
    }
    ctx.restore() // End Clip

    // 3. Render Garis Dinding Poligon & Status Terlarang
    wallSegments.forEach((wall) => {
      const p1 = toC(wall.p1)
      const p2 = toC(wall.p2)

      ctx.save()
      ctx.lineWidth = 3.5

      if (wall.type === "SOLID") {
        ctx.strokeStyle = isDark ? "#38bdf8" : "#0284c7" // Dinding Solid Aktif
        ctx.setLineDash([])
      } else if (wall.type === "GLASS_DOOR") {
        ctx.strokeStyle = "#f97316" // Kaca / Pintu
        ctx.setLineDash([6, 3])
      } else if (wall.type === "CASHIER") {
        ctx.strokeStyle = "#eab308" // Kasir
        ctx.setLineDash([5, 3])
      } else if (wall.type === "CHILLER") {
        ctx.strokeStyle = "#06b6d4" // Chiller
        ctx.setLineDash([4, 3])
      }

      ctx.beginPath()
      ctx.moveTo(p1.cx, p1.cy)
      ctx.lineTo(p2.cx, p2.cy)
      ctx.stroke()

      // Label Dimensi & Tag Zona di Sepanjang Sisi Dinding
      const midX = (p1.cx + p2.cx) / 2
      const midY = (p1.cy + p2.cy) / 2
      const dx = p2.cx - p1.cx
      const dy = p2.cy - p1.cy
      const len = Math.hypot(dx, dy)

      if (len > 0) {
        let angle = Math.atan2(dy, dx)
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
          angle += Math.PI
        }

        let tag = `${formatDim(wall.lengthM)}m`
        if (wall.type === "GLASS_DOOR") tag += " 🚪 Pintu"
        else if (wall.type === "CASHIER") tag += " 🛒 Kasir"
        else if (wall.type === "CHILLER") tag += " 🧊 Chiller"

        ctx.save()
        ctx.translate(midX, midY - 9)
        ctx.rotate(angle)
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = "bold 8.5px sans-serif"

        ctx.strokeStyle = bgFill
        ctx.lineWidth = 2
        ctx.strokeText(tag, 0, 0)
        ctx.fillStyle = isDark ? "#34d399" : "#047857"
        ctx.fillText(tag, 0, 0)
        ctx.restore()
      }
      ctx.restore()
    })

    // ── 4. RENDER LIVE RUBBERBAND UNTUK TOOLS AREA TERLARANG (PINTU, KASIR, CHILLER) ──
    if (pendingZoneStart && activeTool !== "DRAW" && cursorPos) {
      const seg = wallSegments.find(w => w.index === pendingZoneStart.segIdx)
      if (seg) {
        const p1 = toC(seg.p1)
        const p2 = toC(seg.p2)
        const proj = getClosestPointOnSegment(cursorPos.cx, cursorPos.cy, p1.cx, p1.cy, p2.cx, p2.cy)

        const startCanvas = pendingZoneStart.canvasA
        const endCanvas = { cx: proj.x, cy: proj.y }

        const toolColor = activeTool === "DOOR" ? "#f97316" : activeTool === "CASHIER" ? "#eab308" : "#06b6d4"
        const toolLabel = activeTool === "DOOR" ? "🚪 Pintu" : activeTool === "CASHIER" ? "🛒 Kasir" : "🧊 Chiller"

        const distM = Math.hypot(
          (endCanvas.cx - startCanvas.cx) / sc.scale,
          (endCanvas.cy - startCanvas.cy) / sc.scale
        )

        ctx.save()
        // Highlight preview segment on wall
        ctx.beginPath()
        ctx.moveTo(startCanvas.cx, startCanvas.cy)
        ctx.lineTo(endCanvas.cx, endCanvas.cy)
        ctx.strokeStyle = toolColor
        ctx.lineWidth = 6
        ctx.stroke()

        // Start node indicator
        ctx.beginPath()
        ctx.arc(startCanvas.cx, startCanvas.cy, 6, 0, Math.PI * 2)
        ctx.fillStyle = toolColor
        ctx.fill()
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()

        // End node indicator (following cursor)
        ctx.beginPath()
        ctx.arc(endCanvas.cx, endCanvas.cy, 6, 0, Math.PI * 2)
        ctx.fillStyle = toolColor
        ctx.fill()
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()

        // Floating info badge
        const badgeMidX = (startCanvas.cx + endCanvas.cx) / 2
        const badgeMidY = (startCanvas.cy + endCanvas.cy) / 2 - 14

        ctx.font = "bold 9.5px sans-serif"
        ctx.textAlign = "center"
        ctx.fillStyle = toolColor
        ctx.fillText(`${toolLabel}: ${formatDim(distM)}m (Klik titik akhir)`, badgeMidX, badgeMidY)
        ctx.restore()
      }
    }

    // 5. Render Dimensi Bounding Box (LT & PT)
    const minX = sc.minX ?? 0
    const minY = sc.minY ?? 0
    const leftEdge = sc.offX + minX * sc.scale
    const topEdge = sc.offY + minY * sc.scale
    const bottomEdge = topEdge + sc.rH * sc.scale

    const ltX = leftEdge + (sc.rW * sc.scale) / 2
    const ltY = bottomEdge + 14
    const ptX = leftEdge - 14
    const ptY = topEdge + (sc.rH * sc.scale) / 2

    // LT Label
    ctx.save()
    ctx.font = "bold 8.5px sans-serif"
    ctx.textAlign = "center"
    ctx.fillStyle = isDark ? "#38bdf8" : "#0284c7"
    ctx.fillText(`${formatDim(sc.rW)}m (LT)`, ltX, ltY)

    // PT Label
    ctx.translate(ptX, ptY)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = isDark ? "#c4b5fd" : "#6d28d9"
    ctx.fillText(`${formatDim(sc.rH)}m (PT)`, 0, 0)
    ctx.restore()

    // 6. Render Snap Guides saat Dragging
    activeSnapGuides.forEach((g) => {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(g.fromCanvas.x, g.fromCanvas.y)
      ctx.lineTo(g.toCanvas.x, g.toCanvas.y)
      ctx.strokeStyle = g.snapType === "orthogonal" ? "rgba(6, 182, 212, 0.9)" : "rgba(168, 85, 247, 0.9)"
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 3])
      ctx.stroke()

      // Indicator on active drag point
      const activePt = customPts[activeDragIdx ?? 0]
      if (activePt && activeDragIdx !== null) {
        const dragC = toC(activePt)
        ctx.font = "bold 8.5px sans-serif"
        ctx.fillStyle = g.snapType === "orthogonal" ? "#0891b2" : "#7e22ce"
        ctx.textAlign = "left"
        ctx.fillText(g.snapType === "orthogonal" ? "⦜ 90°" : "⫿ Sejajar", dragC.cx + 12, dragC.cy - 6)
      }
      ctx.restore()
    })

    // 7. Render Titik Sudut Poligon (Nodes)
    customPts.forEach((pt, i) => {
      const sp = toC(pt)
      const isSelected = selectedNodeIdx === i

      ctx.save()
      ctx.beginPath()
      ctx.arc(sp.cx, sp.cy, isSelected ? 8 : (i === 0 ? 5 : 3.5), 0, Math.PI * 2)
      ctx.fillStyle = isSelected
        ? "rgba(239,68,68,0.3)"
        : (i === 0 ? "rgba(245,158,11,0.5)" : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"))
      ctx.fill()
      ctx.strokeStyle = isSelected
        ? "#ef4444"
        : (i === 0 ? "#f59e0b" : (isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.25)"))
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
      ctx.fillText(`T${i + 1}`, sp.cx + (isSelected ? 9 : 6), sp.cy - (isSelected ? 9 : 6))
      ctx.restore()
    })

    // 8. Render Pen-Tool Edge Hover Indicator
    if (hoverEdge && activeDragIdx === null && !pendingZoneStart) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(hoverEdge.cx, hoverEdge.cy, 6, 0, Math.PI * 2)
      ctx.fillStyle = activeTool === "DRAW" ? "rgba(16, 185, 129, 0.4)" : "rgba(249, 115, 22, 0.4)"
      ctx.fill()
      ctx.strokeStyle = activeTool === "DRAW" ? "#10b981" : "#f97316"
      ctx.lineWidth = 1.8
      ctx.stroke()

      ctx.fillStyle = activeTool === "DRAW" ? "#10b981" : "#f97316"
      ctx.font = "bold 9px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(activeTool === "DRAW" ? "+" : "●", hoverEdge.cx, hoverEdge.cy)

      if (activeTool !== "DRAW") {
        ctx.font = "bold 8px sans-serif"
        ctx.fillText("Klik titik awal", hoverEdge.cx, hoverEdge.cy - 10)
      }
      ctx.restore()
    }

    // 9. Render Ikon Unit AC Terpasang di Dinding
    if (isCalculated && placedUnits.length > 0) {
      placedUnits.forEach((unit, idx) => {
        const wall = wallSegments.find((w) => w.index === unit.wallIndex)
        if (!wall) return

        const acX = wall.p1.x + (wall.p2.x - wall.p1.x) * unit.ratio
        const acY = wall.p1.y + (wall.p2.y - wall.p1.y) * unit.ratio
        const cAcX = sc.offX + acX * sc.scale
        const cAcY = sc.offY + acY * sc.scale

        ctx.save()
        ctx.fillStyle = "#0284c7"
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.roundRect(cAcX - 13, cAcY - 7, 26, 14, 3)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 8.5px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`AC${idx + 1}`, cAcX, cAcY)
        ctx.restore()
      })
    }
  }, [customClosed, customPts, isDark, wallSegments, segmentLengths, isCalculated, placedUnits, activeSnapGuides, activeDragIdx, selectedNodeIdx, hoverEdge, cursorPos, pendingZoneStart, activeTool])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // ─── 13. Export Denah Handler ─────────────────────────────────────────────
  const handleExportPng = async () => {
    if (!exportCardRef.current) return
    try {
      toast.info("Menyiapkan ekspor denah layout AC...")
      const dataUrl = await toPng(exportCardRef.current, { cacheBust: true, pixelRatio: 2 })
      const link = document.createElement("a")
      const name = (storeMode === "existing" ? selectedStore?.name : newStoreName) || "Denah_Toko"
      link.download = `Mapping_AC_${name.replace(/\s+/g, "_")}.png`
      link.href = dataUrl
      link.click()
      toast.success("Denah Layout AC berhasil diunduh!")
    } catch {
      toast.error("Gagal mengekspor denah gambar.")
    }
  }

  const currentStoreDisplayName = (storeMode === "existing" ? selectedStore?.name : newStoreName) || "Toko Retail Sparta"

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Top Bar Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="size-9 rounded-xl shadow-xs">
                <IconArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight">Mapping & Layout AC</h1>
                <Badge className="bg-emerald-500 text-white font-extrabold text-[10px] px-2 py-0.5">
                  DEV / PROTOTYPE
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Kalkulator Pemetaan Tata Letak AC Daikin 2 PK Berbasis Denah Poligon & Suhu Open-Meteo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPng}
              className="gap-1.5 text-xs font-semibold rounded-xl"
            >
              <IconDownload className="size-3.5" />
              Ekspor Hasil Denah
            </Button>
          </div>
        </div>

        {/* ─── CARD 1: IDENTITAS TOKO & DATA LOKASI (Identik dengan Kalkulator Lampu & AC) ─── */}
        <div className="flex flex-col gap-3 bg-muted/30 border border-border/50 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBuildingStore className="size-4 text-emerald-600 dark:text-emerald-400" />
              <Label className="text-xs font-bold text-foreground">Identitas Toko</Label>
            </div>
          </div>

          {/* Toggle Toko Terdaftar vs Toko Baru */}
          <div className="flex rounded-lg bg-muted/60 p-0.5 border border-border/40">
            <button
              type="button"
              onClick={() => setStoreMode("existing")}
              className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all cursor-pointer ${
                storeMode === "existing"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Toko Terdaftar
            </button>
            <button
              type="button"
              onClick={() => setStoreMode("new")}
              className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all cursor-pointer ${
                storeMode === "new"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Toko Baru
            </button>
          </div>

          {storeMode === "existing" ? (
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] font-semibold">Cari & Pilih Toko</Label>
                  <StoreCombobox
                    stores={stores}
                    value={selectedStore}
                    onSelect={handleSelectStore}
                    placeholder="Pilih toko audit..."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="coord_input" className="text-[10px] font-semibold">
                    Koordinat Toko <span className="text-muted-foreground font-normal">(Lat, Lng)</span>
                  </Label>
                  <Input
                    id="coord_input"
                    placeholder="Contoh: -6.200000, 106.816666"
                    value={coordInput}
                    onChange={(e) => setCoordInput(e.target.value)}
                    className="h-8 text-xs bg-background font-mono"
                  />
                </div>
              </div>

              {selectedStore && (
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl border border-border/60 bg-background text-[10.5px]">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Kode</span>
                    <span className="font-semibold text-foreground font-mono">{selectedStore.code}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Nama</span>
                    <span className="font-semibold text-foreground truncate">{selectedStore.name}</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                <div className="flex flex-col gap-1">
                  <Label htmlFor="new_store_code" className="text-[10px] font-semibold">Kode Toko <span className="text-muted-foreground font-normal">(Opsional)</span></Label>
                  <Input
                    id="new_store_code"
                    placeholder="Contoh: T001"
                    value={newStoreCode}
                    onChange={(e) => setNewStoreCode(e.target.value)}
                    className="h-8 text-xs bg-background font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="new_coord_input" className="text-[10px] font-semibold">
                  Koordinat Toko <span className="text-muted-foreground font-normal">(Latitude, Longitude)</span>
                </Label>
                <Input
                  id="new_coord_input"
                  placeholder="Contoh: -6.200000, 106.816666"
                  value={coordInput}
                  onChange={(e) => setCoordInput(e.target.value)}
                  className="h-8 text-xs bg-background font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* ─── CARD 2: CANVAS DENAH TOKO & INTERACTIVE CAD TOOLBAR ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" ref={exportCardRef}>
          {/* Kolom Kiri: Interactive Canvas & Tool Palette (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border-border/80 shadow-xs rounded-2xl overflow-hidden">
              <CardHeader className="py-3 px-4 bg-muted/20 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <IconAirConditioning className="size-4 text-sky-500" />
                    Kanvas Denah Ruangan (Custom CAD Canvas)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {activeTool === "DRAW"
                      ? "Klik canvas untuk menambah sudut, garis karet menempel ke kursor dengan jarak live, klik T1 untuk menutup."
                      : `Mode ${activeTool === "CASHIER" ? "Kasir 🛒" : activeTool === "CHILLER" ? "Chiller 🧊" : "Pintu/Kaca 🚪"}: Klik Titik Awal di dinding, lalu klik Titik Akhir untuk memotong bentang area!`}
                  </CardDescription>
                </div>
                <Badge className="bg-sky-600 text-white font-extrabold text-xs">
                  {effectiveArea} m² ({customPts.length} Titik Sudut)
                </Badge>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {/* TOOLBAR PALETTE (Tools Penanda Dinding & Preset) */}
                <div className="p-2 rounded-xl bg-muted/40 border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-muted-foreground mr-1">Alat:</span>

                    <Button
                      size="sm"
                      variant={activeTool === "DRAW" ? "default" : "outline"}
                      onClick={() => {
                        setActiveTool("DRAW")
                        setPendingZoneStart(null)
                      }}
                      className="h-7 text-xs font-bold gap-1"
                    >
                      <IconPointer className="size-3.5" /> Denah Utama
                    </Button>

                    <Button
                      size="sm"
                      variant={activeTool === "DOOR" ? "default" : "outline"}
                      onClick={() => {
                        setActiveTool("DOOR")
                        setPendingZoneStart(null)
                      }}
                      className={`h-7 text-xs font-bold gap-1 ${
                        activeTool === "DOOR"
                          ? "bg-orange-500 text-white"
                          : "border-orange-500/40 text-orange-600 dark:text-orange-400 bg-orange-500/10"
                      }`}
                    >
                      <IconDoor className="size-3.5" /> Pintu/Kaca 🚪
                    </Button>

                    <Button
                      size="sm"
                      variant={activeTool === "CASHIER" ? "default" : "outline"}
                      onClick={() => {
                        setActiveTool("CASHIER")
                        setPendingZoneStart(null)
                      }}
                      className={`h-7 text-xs font-bold gap-1 ${
                        activeTool === "CASHIER"
                          ? "bg-amber-500 text-white"
                          : "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                      }`}
                    >
                      <IconShoppingCart className="size-3.5" /> Area Kasir 🛒
                    </Button>

                    <Button
                      size="sm"
                      variant={activeTool === "CHILLER" ? "default" : "outline"}
                      onClick={() => {
                        setActiveTool("CHILLER")
                        setPendingZoneStart(null)
                      }}
                      className={`h-7 text-xs font-bold gap-1 ${
                        activeTool === "CHILLER"
                          ? "bg-cyan-500 text-white"
                          : "border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10"
                      }`}
                    >
                      <IconFridge className="size-3.5" /> Area Chiller 🧊
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPresetModalOpen(true)}
                    className="h-7 text-xs font-bold gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                  >
                    <IconSquare className="size-3.5 text-amber-500" /> Template Bentuk
                  </Button>
                </div>

                {/* Banner Status 2-Click Zone Marking jika sedang aktif */}
                {pendingZoneStart && (
                  <div className="p-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between animate-in fade-in">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                      Titik awal {pendingZoneStart.tool === "DOOR" ? "Pintu/Kaca" : pendingZoneStart.tool === "CASHIER" ? "Kasir" : "Chiller"} aktif. Arahkan ke dinding dan klik Titik Akhir untuk memotong bentang area!
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPendingZoneStart(null)}
                      className="h-6 text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 gap-1 px-1.5"
                    >
                      <IconX className="size-3" /> Batal
                    </Button>
                  </div>
                )}

                {/* Canvas Viewport (100% Bersih dari Overlay Mengganggu, Auto-Center) */}
                <div className="relative w-full h-[340px] rounded-2xl border border-border/80 bg-slate-900/5 dark:bg-slate-950/40 overflow-hidden flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handleCanvasPointerDown}
                    onPointerMove={handleCanvasPointerMove}
                    onPointerUp={handleCanvasPointerUp}
                    onPointerLeave={handleCanvasPointerLeave}
                    className="w-full h-full cursor-crosshair touch-none select-none block"
                    style={{ height: `${CANVAS_H}px` }}
                  />
                </div>

                {/* Canvas Action Controls (Undo, Redo, Hapus Titik, Reset, Tutup Poligon) */}
                <div className="p-2.5 rounded-xl border bg-muted/20 space-y-2">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] font-medium"
                      disabled={historyPast.length === 0}
                      onClick={handleUndo}
                    >
                      <IconArrowBackUp className="size-3.5 mr-1 text-sky-500" /> Undo
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] font-medium"
                      disabled={historyFuture.length === 0}
                      onClick={handleRedo}
                    >
                      <IconArrowForwardUp className="size-3.5 mr-1 text-purple-500" /> Redo
                    </Button>

                    {/* Tombol Hapus Titik yang Terpilih */}
                    <Button
                      size="sm"
                      variant={selectedNodeIdx !== null ? "destructive" : "outline"}
                      className={`h-7 text-[11px] font-semibold transition-all ${
                        selectedNodeIdx !== null
                          ? "shadow-sm animate-in fade-in"
                          : "opacity-50 cursor-not-allowed text-muted-foreground"
                      }`}
                      disabled={selectedNodeIdx === null || customPts.length <= 3}
                      onClick={() => {
                        if (selectedNodeIdx !== null) {
                          handleDeleteCustomPoint(selectedNodeIdx)
                        }
                      }}
                    >
                      <IconTrash className="size-3.5 mr-1" />
                      {selectedNodeIdx !== null ? `Hapus T${selectedNodeIdx + 1}` : "Hapus Titik"}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] font-medium"
                      onClick={handleResetCanvas}
                    >
                      <IconRefresh className="size-3.5 mr-1" /> Reset
                    </Button>

                    <Button
                      size="sm"
                      className="h-7 flex-1 text-[11px] font-semibold"
                      disabled={customPts.length < 3 || customClosed}
                      onClick={() => {
                        pushCurrentToHistory()
                        setCustomClosed(true)
                        toast.success("Denah poligon berhasil ditutup dan dipusatkan!")
                      }}
                    >
                      {customClosed ? "Poligon Tertutup" : "Tutup Poligon"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <span className={`inline-block size-2 rounded-full ${customClosed ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <span>Jumlah Titik: <b className="font-bold text-foreground">{customPts.length} Titik Sudut</b></span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${customClosed ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                      {customClosed ? "Denah Tertutup & Centered" : "Belum Tertutup"}
                    </span>
                  </div>
                </div>

                {/* ─── DAFTAR TITIK SUDUT & UKURAN SISI DINDING ─── */}
                {customPts.length >= 2 && (
                  <div className="bg-muted/30 border border-border/50 rounded-xl p-3 space-y-3">
                    <div className="space-y-1.5 border-b border-border/40 pb-2.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                        <span>Sesuaikan Panjang Sisi Dinding & Tipe Zona</span>
                        <span className="text-[9.5px] font-normal text-muted-foreground lowercase">Klik ikon tempat sampah untuk menghapus titik</span>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
                      {segmentLengths.map((len, idx) => {
                        const p1Name = `T${idx + 1}`
                        const p2Name = `T${((idx + 1) % customPts.length) + 1}`
                        const isClosing = idx === customPts.length - 1 && !customClosed
                        const currentType: WallType = segmentOverrides[idx] || "SOLID"

                        return (
                          <div key={idx} className="p-2 rounded-lg border bg-card/60 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] font-semibold text-foreground/80 flex items-center gap-1">
                                Sisi {p1Name} ke {p2Name} {isClosing ? "(Belum Tutup)" : ""}
                              </Label>
                              {customPts.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomPoint(idx)}
                                  className="text-muted-foreground hover:text-destructive p-0.5 transition-colors cursor-pointer"
                                  title={`Hapus Titik ${p1Name}`}
                                >
                                  <IconTrash className="size-3" />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex-1 space-y-0.5">
                                <Input
                                  type="number"
                                  step="any"
                                  min={0.1}
                                  value={len !== undefined ? len : ""}
                                  onFocus={() => setEditingSegmentIdx(idx)}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setSegmentLengths((prev) => {
                                      const next = [...prev]
                                      next[idx] = val
                                      return next
                                    })
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const numVal = parseFloat(String(segmentLengths[idx]))
                                      if (!isNaN(numVal) && numVal > 0) {
                                        handleUpdateSegmentLength(idx, numVal)
                                      }
                                      setEditingSegmentIdx(null)
                                      e.currentTarget.blur()
                                    }
                                  }}
                                  onBlur={(e) => {
                                    const numVal = parseFloat(e.target.value)
                                    if (!isNaN(numVal) && numVal > 0) {
                                      handleUpdateSegmentLength(idx, numVal)
                                    }
                                    setEditingSegmentIdx(null)
                                  }}
                                  className="h-7 text-[11px]"
                                />
                              </div>

                              {/* Toggle Tipe Dinding Segmen */}
                              <select
                                value={currentType}
                                onChange={(e) => {
                                  const val = e.target.value as WallType
                                  pushCurrentToHistory()
                                  setSegmentOverrides((prev) => ({
                                    ...prev,
                                    [idx]: val,
                                  }))
                                }}
                                className="h-7 text-[10px] font-semibold rounded-md border border-input bg-background px-2 py-0.5"
                              >
                                <option value="SOLID">🧱 Dinding Solid</option>
                                <option value="GLASS_DOOR">🚪 Pintu/Kaca</option>
                                <option value="CASHIER">🛒 Kasir</option>
                                <option value="CHILLER">🧊 Chiller</option>
                              </select>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Interactive Node Chips */}
                {customPts.length > 0 && (
                  <div className="p-2.5 rounded-xl border bg-card space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-foreground">Titik Sudut Denah (Klik untuk memilih / menghapus):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {customPts.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedNodeIdx(idx)}
                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-mono border transition-all cursor-pointer ${
                            selectedNodeIdx === idx
                              ? "bg-red-500 text-white font-bold border-red-500 shadow-xs"
                              : "bg-muted/40 hover:bg-muted text-foreground border-border/60"
                          }`}
                        >
                          T{idx + 1} ({formatDim(p.x)}, {formatDim(p.y)})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Hitung & Petakan AC */}
                <Button
                  size="lg"
                  onClick={calculateAndPlaceUnits}
                  disabled={customPts.length < 3 || !customClosed || isCalculating}
                  className="w-full h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm rounded-xl"
                >
                  {isCalculating ? (
                    <>
                      <IconRefresh className="size-4 animate-spin" /> Menarik Suhu & Menghitung Layout...
                    </>
                  ) : (
                    <>
                      <IconSparkles className="size-4" /> Hitung & Petakan AC Otomatis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Hasil Estimasi & Layout Card (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-border/80 shadow-xs rounded-2xl bg-card">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">Hasil Estimasi Layout AC</CardTitle>
                  <Badge className="bg-emerald-600 text-white text-[10px] font-black">
                    {isCalculated ? "TERHITUNG OTOMATIS" : "SIAP DIHITUNG"}
                  </Badge>
                </div>
                <CardDescription className="text-xs font-semibold text-foreground">
                  {currentStoreDisplayName}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* 2 Metric Stat Boxes (Identik dengan Kalkulator Lampu) */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl border bg-muted/30 text-center flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Target Beban</span>
                    <span className="text-lg font-black text-blue-600">
                      {totalBtuRequired.toLocaleString("id-ID")} <span className="text-[10px] font-bold">BTU</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">{targetBtuPerM2} BTU/m²</span>
                  </div>

                  <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-center flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Unit Terpasang</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {placedUnits.length} <span className="text-[10px] font-bold">Unit</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Daikin 2 PK</span>
                  </div>
                </div>

                {/* Box Info Suhu & Klaster Setelah Hitung */}
                {isCalculated && calculatedTemp !== null && (
                  <div className="p-2.5 rounded-xl border bg-sky-500/10 border-sky-500/20 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300 font-semibold">
                      <IconSnowflake className="size-3.5 text-sky-500" />
                      Suhu Open-Meteo:
                    </div>
                    <div className="font-bold text-sky-900 dark:text-sky-200">
                      {calculatedTemp}°C <span className="text-[11px] font-normal text-muted-foreground">({targetBtuPerM2} BTU/m²)</span>
                    </div>
                  </div>
                )}

                {/* Status Kepatuhan Aturan Retail */}
                <div className="p-3 rounded-xl border bg-muted/20 space-y-2 text-xs">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <IconCheck className="size-4 text-emerald-500" />
                    Kepatuhan Aturan Tata Letak:
                  </div>
                  <ul className="space-y-1 text-[11px] text-muted-foreground pl-1">
                    <li className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Tidak ada AC di atas Open Chiller (Bebas bocor air)
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Tidak ada AC di dinding Kaca / Pintu depan
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Tidak ada AC di atas dinding meja kasir
                    </li>
                  </ul>
                </div>

                {/* List Unit AC yang Terpasang */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-foreground">Titik Pemasangan di Dinding:</span>
                  {placedUnits.length === 0 ? (
                    <div className="p-3 rounded-lg border border-dashed text-center text-xs text-muted-foreground">
                      Tutup denah dan klik "Hitung & Petakan AC Otomatis" untuk melihat posisi AC.
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {placedUnits.map((u, i) => (
                        <div key={u.id} className="p-2 rounded-lg border bg-card text-xs flex items-center justify-between">
                          <span className="font-bold text-blue-600">Unit #{i + 1} (Daikin 2 PK)</span>
                          <span className="text-[11px] text-muted-foreground font-mono">{u.wallLabel} ({Math.round(u.ratio * 100)}%)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ─── MODAL TEMPLATE BENTUK DENAH ─── */}
        <Dialog open={presetModalOpen} onOpenChange={setPresetModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Pilih Template Bentuk Denah Toko</DialogTitle>
              <DialogDescription className="text-xs">
                Pilih bentuk baku denah retail untuk mengisi ukuran panjang dan lebar secara instan.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={presetType === "rect" ? "default" : "outline"}
                  onClick={() => setPresetType("rect")}
                  className="text-xs font-bold"
                >
                  Persegi Panjang
                </Button>
                <Button
                  type="button"
                  variant={presetType === "L" ? "default" : "outline"}
                  onClick={() => setPresetType("L")}
                  className="text-xs font-bold"
                >
                  Bentuk Huruf L
                </Button>
              </div>

              {presetType === "rect" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Panjang Ruangan (m)</Label>
                    <Input
                      type="number"
                      value={presetRect.panjang}
                      onChange={(e) => setPresetRect((p) => ({ ...p, panjang: e.target.value }))}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Lebar Ruangan (m)</Label>
                    <Input
                      type="number"
                      value={presetRect.lebar}
                      onChange={(e) => setPresetRect((p) => ({ ...p, lebar: e.target.value }))}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Panjang Utama (m)</Label>
                    <Input
                      type="number"
                      value={presetL.p}
                      onChange={(e) => setPresetL((p) => ({ ...p, p: e.target.value }))}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Lebar Utama (m)</Label>
                    <Input
                      type="number"
                      value={presetL.l}
                      onChange={(e) => setPresetL((p) => ({ ...p, l: e.target.value }))}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Lebar Sayap (m)</Label>
                    <Input
                      type="number"
                      value={presetL.w}
                      onChange={(e) => setPresetL((p) => ({ ...p, w: e.target.value }))}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Tinggi Sayap (m)</Label>
                    <Input
                      type="number"
                      value={presetL.h}
                      onChange={(e) => setPresetL((p) => ({ ...p, h: e.target.value }))}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setPresetModalOpen(false)}>
                Batal
              </Button>
              <Button size="sm" onClick={handleApplyPreset} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Terapkan Denah
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
