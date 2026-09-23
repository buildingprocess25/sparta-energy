"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { toPng } from "html-to-image"
import {
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
  IconRuler,
  IconLock,
  IconLockOpen,
  IconEdit,
} from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { Header } from "@/components/header"
import { AC_MAPPING_VERSION } from "@/lib/calculator-versions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { StoreCombobox } from "@/components/audit/store-combobox"
import { toast } from "sonner"
import { generateCalculationFilename } from "@/lib/utils"
import { getTemperature } from "@/app/actions/get-temperature"
import { getScaleInfo } from "@/lib/lamp-calculator"
import { calcPolygonArea, type Point } from "@/lib/polygon-utils"
import { AcMappingResultCard, type AcMappingResultCardData } from "@/components/audit/ac-mapping-result-card"
import type { StoreData } from "@/app/audit/start/start-client"

interface AcMappingClientProps {
  stores: StoreData[]
}

// Model & Spec Standar AC Daikin 2 PK
const AC_CAPACITY_BTU = 18000 // Daikin 2 PK = 18.000 BTU/h
const AC_INDOOR_WIDTH_M = 1.05 // Panjang fisik unit indoor: 1.050 mm (1.05 m)
const AC_MIN_CLEARANCE_M = 0.25 // Clearance minimal kiri-kanan: 250 mm dari sudut/rintangan
const MIN_WALL_LENGTH_FOR_AC = AC_INDOOR_WIDTH_M + AC_MIN_CLEARANCE_M * 2 // 1.55 meter minimum bentang dinding aman
const SPREAD_ANGLE_DEG = 70   // Sudut hembusan kipas 70°
const THROW_Z1_M = 2.5        // Zona 1: Dingin Maksimal (0 - 2.5m)
const THROW_Z2_M = 5.5        // Zona 2: Sejuk Efektif (2.5 - 5.5m)
const THROW_Z3_M = 7.5        // Zona 3: Batas Lemparan (5.5 - 7.5m)

// Standar Ukuran Baku Objek Toko Retail
const DOOR_P1_WIDTH_M = 1.0       // Pintu P1 Gudang: 1.0 meter (baku)
const CHILLER_UNIT_WIDTH_M = 1.2   // Open Chiller: 1.2 meter per unit (baku)

const CANVAS_H = 340
const FIXED_SCALE = 24 // Scale in drawing mode (px/m)
const FIXED_OX = 30    // Offset X
const FIXED_OY = 30    // Offset Y

type ActiveTool = "DRAW" | "DOOR" | "DOOR_P1" | "CASHIER" | "CHILLER"
type WallType = "SOLID" | "GLASS_DOOR" | "DOOR_P1" | "CASHIER" | "CHILLER"

interface HistorySnapshot {
  pts: Point[]
  closed: boolean
  overrides: Record<number, WallType>
  placedUnits: PlacedAcUnit[]
  isCalculated: boolean
}

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

function getParentWallLine(pts: Point[], segIdx: number): {
  pA: Point
  pB: Point
  len: number
  p1Idx: number
  p2Idx: number
} {
  const n = pts.length
  const p1Idx = segIdx
  const p2Idx = (segIdx + 1) % n
  const p1 = pts[p1Idx]
  const p2 = pts[p2Idx]
  if (!p1 || !p2) return { pA: { x: 0, y: 0 }, pB: { x: 0, y: 0 }, len: 0, p1Idx, p2Idx }

  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const len = Math.hypot(dx, dy)
  if (len === 0) return { pA: p1, pB: p2, len: 0, p1Idx, p2Idx }
  const ux = dx / len
  const uy = dy / len

  // Walk backward
  let startIdx = p1Idx
  let curr = p1Idx
  for (let step = 0; step < n; step++) {
    const prev = (curr - 1 + n) % n
    const pPrev = pts[prev]
    const pCurr = pts[curr]
    if (!pPrev || !pCurr) break
    const dX = pCurr.x - pPrev.x
    const dY = pCurr.y - pPrev.y
    const dL = Math.hypot(dX, dY)
    if (dL < 0.001) break
    const uX = dX / dL
    const uY = dY / dL
    const cross = Math.abs(ux * uY - uy * uX)
    const dot = ux * uX + uy * uY
    if (cross < 0.05 && dot > 0.95) {
      startIdx = prev
      curr = prev
    } else {
      break
    }
  }

  // Walk forward
  let endIdx = p2Idx
  curr = p2Idx
  for (let step = 0; step < n; step++) {
    const next = (curr + 1) % n
    const pCurr = pts[curr]
    const pNext = pts[next]
    if (!pCurr || !pNext) break
    const dX = pNext.x - pCurr.x
    const dY = pNext.y - pCurr.y
    const dL = Math.hypot(dX, dY)
    if (dL < 0.001) break
    const uX = dX / dL
    const uY = dY / dL
    const cross = Math.abs(ux * uY - uy * uX)
    const dot = ux * uX + uy * uY
    if (cross < 0.05 && dot > 0.95) {
      endIdx = next
      curr = next
    } else {
      break
    }
  }

  const pA = pts[startIdx]
  const pB = pts[endIdx]
  const parentLen = Math.hypot(pB.x - pA.x, pB.y - pA.y)

  return { pA, pB, len: parentLen, p1Idx, p2Idx }
}

function remapPlacedUnitsToNewGeometry(
  currentUnits: PlacedAcUnit[],
  oldPts: Point[],
  oldClosed: boolean,
  newPts: Point[],
  newClosed: boolean
): PlacedAcUnit[] {
  if (currentUnits.length === 0 || oldPts.length < 2 || newPts.length < 2) return currentUnits

  // 1. Hitung segmen lama
  const oldCount = oldClosed ? oldPts.length : oldPts.length - 1
  const oldSegs: { p1: Point; p2: Point }[] = []
  for (let i = 0; i < oldCount; i++) {
    oldSegs.push({
      p1: oldPts[i],
      p2: oldPts[(i + 1) % oldPts.length],
    })
  }

  // 2. Hitung segmen baru
  const newCount = newClosed ? newPts.length : newPts.length - 1
  const newSegs: { index: number; p1: Point; p2: Point; startIndex: number; endIndex: number }[] = []
  for (let i = 0; i < newCount; i++) {
    newSegs.push({
      index: i,
      startIndex: i,
      endIndex: (i + 1) % newPts.length,
      p1: newPts[i],
      p2: newPts[(i + 1) % newPts.length],
    })
  }

  if (newSegs.length === 0) return currentUnits

  // 3. Hitung koordinat fisik (acX, acY) pada segmen lama & proyeksikan ke segmen baru
  return currentUnits.map((unit) => {
    const oldSeg = oldSegs[unit.wallIndex]
    let acX: number
    let acY: number

    if (oldSeg) {
      acX = oldSeg.p1.x + (oldSeg.p2.x - oldSeg.p1.x) * unit.ratio
      acY = oldSeg.p1.y + (oldSeg.p2.y - oldSeg.p1.y) * unit.ratio
    } else {
      return unit
    }

    // Cari segmen baru terdekat dengan koordinat fisik AC
    let bestSeg = newSegs[0]
    let bestDist = Infinity
    let bestT = 0.5

    for (const seg of newSegs) {
      const proj = getClosestPointOnSegment(acX, acY, seg.p1.x, seg.p1.y, seg.p2.x, seg.p2.y)
      if (proj.dist < bestDist) {
        bestDist = proj.dist
        bestSeg = seg
        bestT = proj.t
      }
    }

    return {
      ...unit,
      wallIndex: bestSeg.index,
      ratio: Math.min(0.95, Math.max(0.05, Number(bestT.toFixed(3)))),
      wallLabel: `Dinding T${bestSeg.startIndex + 1} - T${bestSeg.endIndex + 1}`,
    }
  })
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
  const [coordInput, setCoordInput] = useState<string>("")
  const [calculatedTemp, setCalculatedTemp] = useState<number | null>(null)
  const [calculatedBtuPerM2, setCalculatedBtuPerM2] = useState<number>(600)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)

  // ─── 2. State Canvas Poligon Denah ────────────────────────────────────────
  const [customPts, setCustomPts] = useState<Point[]>([])
  const [customClosed, setCustomClosed] = useState<boolean>(false)
  const [historyPast, setHistoryPast] = useState<HistorySnapshot[]>([])
  const [historyFuture, setHistoryFuture] = useState<HistorySnapshot[]>([])
  const [activeDragIdx, setActiveDragIdx] = useState<number | null>(null)
  const [activeDragAcId, setActiveDragAcId] = useState<string | null>(null)
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
    isCorner?: boolean
    cornerNodeIdx?: number
  } | null>(null)

  // State Ukuran Sisi Dinding & Arah Pergeseran (Identik dengan Kalkulator Lampu)
  const [segmentLengths, setSegmentLengths] = useState<(number | string)[]>([])
  const [editingSegmentIdx, setEditingSegmentIdx] = useState<number | null>(null)
  const [expandDir, setExpandDir] = useState<"end" | "start" | "center">("center")

  // Tools Penanda Zona (Denah Utama, Pintu/Kaca, Pintu P1, Kasir, Chiller)
  const [activeTool, setActiveTool] = useState<ActiveTool>("DRAW")

  // Stepper Unit Chiller (1 - 8 Unit @ 1.2m)
  const [chillerUnits, setChillerUnits] = useState<number>(1)

  // Dragging Seluruh Blok Segmen Sekaligus (Pintu P1 dan Chiller)
  const [activeDragSegmentIdx, setActiveDragSegmentIdx] = useState<number | null>(null)
  const dragSegmentSnapshotRef = useRef<{
    pts: Point[]
    segIdx: number
    fixedLen: number
    p1Idx: number
    p2Idx: number
    origPt1: Point
    origPt2: Point
    parentP1: Point
    parentP2: Point
    parentLen: number
    startClickT: number
  } | null>(null)

  // Indikator Magnetic Snapping Hijau (Rapat Berdampingan)
  const [magneticSnapFeedback, setMagneticSnapFeedback] = useState<{
    segIdx: number
    label: string
    cx: number
    cy: number
  } | null>(null)

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
  const [exportCardData, setExportCardData] = useState<AcMappingResultCardData | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const exportCardRef = useRef<HTMLDivElement | null>(null)
  const dragStartSnapshotRef = useRef<HistorySnapshot | null>(null)

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
    const totalBtu = effectiveArea * targetBtuPerM2
    const downQty = Math.floor(totalBtu / AC_CAPACITY_BTU)
    const upQty = Math.ceil(totalBtu / AC_CAPACITY_BTU)

    const actualDownBtuPerM2 = (downQty * AC_CAPACITY_BTU) / (effectiveArea || 1)
    const actualUpBtuPerM2 = (upQty * AC_CAPACITY_BTU) / (effectiveArea || 1)

    const distDown = Math.abs(actualDownBtuPerM2 - targetBtuPerM2)
    const distUp = Math.abs(actualUpBtuPerM2 - targetBtuPerM2)
    let n = distDown <= distUp ? downQty : upQty
    return Math.max(1, n)
  }, [effectiveArea, targetBtuPerM2])

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
    setHistoryPast((prev) => [
      ...(prev || []).filter(Boolean).slice(-30),
      {
        pts: [...customPts],
        closed: customClosed,
        overrides: { ...segmentOverrides },
        placedUnits: [...placedUnits],
        isCalculated,
      },
    ])
    setHistoryFuture([])
  }, [customPts, customClosed, segmentOverrides, placedUnits, isCalculated])

  const handleUndo = useCallback(() => {
    setHistoryPast((prevPast) => {
      if (!prevPast || prevPast.length === 0) return prevPast
      const validPast = prevPast.filter(Boolean)
      if (validPast.length === 0) return []
      const last = validPast[validPast.length - 1]
      if (!last || !last.pts) return validPast.slice(0, -1)

      const newPast = validPast.slice(0, -1)
      setHistoryFuture((prevFuture) => [
        {
          pts: [...customPts],
          closed: customClosed,
          overrides: { ...segmentOverrides },
          placedUnits: [...placedUnits],
          isCalculated,
        },
        ...prevFuture,
      ])
      setCustomPts(last.pts)
      setCustomClosed(last.closed)
      setSegmentOverrides(last.overrides || {})
      if (last.placedUnits) setPlacedUnits(last.placedUnits)
      if (last.isCalculated !== undefined) setIsCalculated(last.isCalculated)
      return newPast
    })
    setPendingZoneStart(null)
    toast.info("Perubahan denah dibatalkan (Undo)")
  }, [customPts, customClosed, segmentOverrides, placedUnits, isCalculated])

  const handleRedo = useCallback(() => {
    setHistoryFuture((prevFuture) => {
      if (!prevFuture || prevFuture.length === 0) return prevFuture
      const validFuture = prevFuture.filter(Boolean)
      if (validFuture.length === 0) return []
      const next = validFuture[0]
      if (!next || !next.pts) return validFuture.slice(1)

      const newFuture = validFuture.slice(1)
      setHistoryPast((prevPast) => [
        ...(prevPast || []).filter(Boolean).slice(-30),
        {
          pts: [...customPts],
          closed: customClosed,
          overrides: { ...segmentOverrides },
          placedUnits: [...placedUnits],
          isCalculated,
        },
      ])
      setCustomPts(next.pts)
      setCustomClosed(next.closed)
      setSegmentOverrides(next.overrides || {})
      if (next.placedUnits) setPlacedUnits(next.placedUnits)
      if (next.isCalculated !== undefined) setIsCalculated(next.isCalculated)
      return newFuture
    })
    setPendingZoneStart(null)
    toast.info("Perubahan denah dipulihkan (Redo)")
  }, [customPts, customClosed, segmentOverrides, placedUnits, isCalculated])

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
    const newPts = customPts.filter((_, i) => i !== idx)
    const newClosed = newPts.length >= 3 ? customClosed : false

    // Auto-Invalidate Hasil AC saat bentuk denah diubah (Opsi 2)
    setIsCalculated(false)
    setPlacedUnits([])

    setCustomPts(newPts)
    if (!newClosed) setCustomClosed(false)

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
    toast.info(`Titik T${idx + 1} dihapus. Silakan hitung & petakan AC kembali setelah selesai mengedit.`)
  }, [customPts, customClosed, pushCurrentToHistory])

  // Update Panjang Sisi Dinding (Identik dengan Kalkulator Lampu)
  const handleUpdateSegmentLength = useCallback((idx: number, newLenVal: number, dir: "end" | "start" | "center" = expandDir) => {
    if (isNaN(newLenVal) || newLenVal <= 0) return

    pushCurrentToHistory()
    setIsCalculated(false)
    setPlacedUnits([])

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
      let finalPts = updated
      if (minX < 0 || minY < 0) {
        finalPts = updated.map(p => ({
          x: Number((p.x - minX).toFixed(3)),
          y: Number((p.y - minY).toFixed(3))
        }))
      }

      return finalPts
    })
  }, [expandDir, pushCurrentToHistory])

  // ─── 8. Preset Template Handler ───────────────────────────────────────────
  const handleApplyPreset = () => {
    pushCurrentToHistory()
    setIsCalculated(false)
    setPlacedUnits([])

    if (presetType === "rect") {
      const lt = Math.max(3, parseFloat(presetRect.lebar) || 12)
      const pt = Math.max(3, parseFloat(presetRect.panjang) || 8)
      setCustomPts([
        { x: 0, y: 0 },
        { x: lt, y: 0 },
        { x: lt, y: pt },
        { x: 0, y: pt },
      ])
    } else {
      const pt = Math.max(4, parseFloat(presetL.p) || 14)
      const lt = Math.max(4, parseFloat(presetL.l) || 10)
      const ls = Math.min(lt - 1, Math.max(2, parseFloat(presetL.w) || 6))
      const ps = Math.min(pt - 1, Math.max(2, parseFloat(presetL.h) || 4))
      setCustomPts([
        { x: 0, y: 0 },
        { x: lt, y: 0 },
        { x: lt, y: ps },
        { x: ls, y: ps },
        { x: ls, y: pt },
        { x: 0, y: pt },
      ])
    }
    setCustomClosed(true)
    setSegmentOverrides({})
    setPresetModalOpen(false)
    setPendingZoneStart(null)
    toast.success("Template denah berhasil dimuat. Silakan klik 'Hitung & Petakan AC' untuk memproses.")
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
      } else {
        setCoordInput("")
      }
    } else {
      setCoordInput("")
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

    // Rumus Kuantitas Unit AC (Deviasi Terdekat Standar Resmi v1.2.0)
    const totalBtu = effectiveArea * clusterBtu
    const downQty = Math.floor(totalBtu / AC_CAPACITY_BTU)
    const upQty = Math.ceil(totalBtu / AC_CAPACITY_BTU)

    const actualDownBtuPerM2 = (downQty * AC_CAPACITY_BTU) / (effectiveArea || 1)
    const actualUpBtuPerM2 = (upQty * AC_CAPACITY_BTU) / (effectiveArea || 1)

    const distDown = Math.abs(actualDownBtuPerM2 - clusterBtu)
    const distUp = Math.abs(actualUpBtuPerM2 - clusterBtu)
    let n = distDown <= distUp ? downQty : upQty
    if (n < 1 && effectiveArea > 0) n = 1

    // Filter Dinding: Hanya pilih dinding SOLID yang memiliki panjang cukup untuk unit Daikin 2 PK (panjang 1.05m + clearance)
    let eligibleWalls = validWalls.filter((w) => w.lengthM >= MIN_WALL_LENGTH_FOR_AC)
    if (eligibleWalls.length === 0) {
      // Fallback: minimal selebar fisik bodi AC (1.05m) jika ruangan berukuran kompak
      eligibleWalls = validWalls.filter((w) => w.lengthM >= AC_INDOOR_WIDTH_M)
    }

    if (eligibleWalls.length === 0) {
      toast.error(
        `Sisa bentang dinding solid terlalu sempit (< ${AC_INDOOR_WIDTH_M}m). Unit AC Daikin 2 PK (panjang 1.050 mm) tidak muat dipasang.`
      )
      return
    }

    const newUnits: PlacedAcUnit[] = []

    // 1. Alokasi kuantitas unit ke dinding-dinding yang memenuhi syarat berdasarkan proporsi panjang dinding
    const sortedWalls = [...eligibleWalls].sort((a, b) => b.lengthM - a.lengthM)
    const wallUnitCounts = new Map<number, number>()
    eligibleWalls.forEach((w) => wallUnitCounts.set(w.index, 0))

    // Bagikan n unit secara adil (prioritaskan dinding dengan kepadatan unit per meter terendah)
    for (let i = 0; i < n; i++) {
      let bestWall = sortedWalls[0]
      let minDensity = Infinity
      for (const w of sortedWalls) {
        const count = wallUnitCounts.get(w.index) || 0
        const density = (count + 1) / w.lengthM
        if (density < minDensity) {
          minDensity = density
          bestWall = w
        }
      }
      wallUnitCounts.set(bestWall.index, (wallUnitCounts.get(bestWall.index) || 0) + 1)
    }

    // 2. Tempatkan unit pada setiap dinding dengan jarak as tengah yang simetris & terbagi rata
    let unitIndex = 1
    wallSegments.forEach((wall) => {
      const count = wallUnitCounts.get(wall.index) || 0
      if (count === 0) return

      const minMarginRatio = Math.min(0.25, (AC_INDOOR_WIDTH_M / 2 + AC_MIN_CLEARANCE_M) / wall.lengthM)

      for (let slot = 0; slot < count; slot++) {
        // Pembagian rata: 1 unit -> 1/2; 2 unit -> 1/3 & 2/3; 3 unit -> 1/4, 2/4, 3/4
        const rawRatio = (slot + 1) / (count + 1)
        const ratio = Number(Math.min(1 - minMarginRatio, Math.max(minMarginRatio, rawRatio)).toFixed(3))

        newUnits.push({
          id: `ac-unit-${unitIndex}`,
          wallIndex: wall.index,
          ratio,
          customName: `Daikin 2 PK #${unitIndex}`,
          wallLabel: `Dinding T${wall.startIndex + 1} - T${wall.endIndex + 1}`,
        })
        unitIndex++
      }
    })

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

    // 1. PRIORITAS: Cek jika klik pada Unit AC Terpasang (Bisa digeser di tool DRAW)
    if (activeTool === "DRAW" && isCalculated && placedUnits.length > 0) {
      for (let i = 0; i < placedUnits.length; i++) {
        const u = placedUnits[i]
        const wall = wallSegments.find((w) => w.index === u.wallIndex)
        if (wall) {
          const acX = wall.p1.x + (wall.p2.x - wall.p1.x) * u.ratio
          const acY = wall.p1.y + (wall.p2.y - wall.p1.y) * u.ratio
          const cAcX = offX + acX * scale
          const cAcY = offY + acY * scale
          if (Math.hypot(cx - cAcX, cy - cAcY) <= 18) {
            pushCurrentToHistory()
            setActiveDragAcId(u.id)
            try {
              ; (e.target as HTMLElement).setPointerCapture(e.pointerId)
            } catch { }
            return
          }
        }
      }

      // JIKA HASIL AC AKTIF & KLIK DI LUAR UNIT AC -> DENAH TERKUNCI!
      const spts = customPts.map((pt) => ({
        cx: offX + pt.x * scale,
        cy: offY + pt.y * scale,
      }))
      for (let i = 0; i < spts.length; i++) {
        if (Math.hypot(cx - spts[i].cx, cy - spts[i].cy) <= 18) {
          toast.info("🔒 Denah terkunci dalam mode Hasil AC. Klik tombol 'Edit Denah' di toolbar jika ingin mengubah ukuran/sudut toko.")
          return
        }
      }
      return
    }

    // 2. JIKA TOOL BERUKURAN BAKU AKTIF: PINTU P1 (1.0m) ATAU CHILLER (N x 1.2m)
    // 1-Click Instan dengan Snapping & Pemotongan Dinding Presisi
    if (activeTool === "DOOR_P1" || activeTool === "CHILLER") {
      if (!customClosed || customPts.length < 3) {
        toast.info("Tutup denah poligon terlebih dahulu untuk menempatkan peralatan.")
        return
      }

      const spts = customPts.map((pt) => ({
        cx: offX + pt.x * scale,
        cy: offY + pt.y * scale,
      }))
      const segCount = spts.length
      let bestSegIdx = -1
      let bestDist = 24
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
        const segWall = wallSegments.find((w) => w.index === bestSegIdx)
        if (!segWall) return

        const targetLengthM = activeTool === "DOOR_P1" ? DOOR_P1_WIDTH_M : chillerUnits * CHILLER_UNIT_WIDTH_M
        const targetType: WallType = activeTool === "DOOR_P1" ? "DOOR_P1" : "CHILLER"
        const toolLabel = activeTool === "DOOR_P1" ? "Pintu P1 (1.0m)" : `Chiller (${chillerUnits} Unit - ${formatDim(targetLengthM)}m)`

        const wallLen = segWall.lengthM
        if (wallLen < targetLengthM - 0.05) {
          toast.error(`Panjang dinding (${formatDim(wallLen)}m) tidak cukup untuk ${toolLabel}.`)
          return
        }

        const deltaT = Math.min(1.0, targetLengthM / wallLen)
        let t1 = Math.max(0, Math.min(1 - deltaT, bestProj.t - deltaT / 2))
        let t2 = t1 + deltaT

        // Snap to start corner (< 15cm)
        if (t1 * wallLen < 0.15) {
          t1 = 0
          t2 = deltaT
        }
        // Snap to end corner (< 15cm)
        if ((1 - t2) * wallLen < 0.15) {
          t2 = 1.0
          t1 = Math.max(0, 1.0 - deltaT)
        }

        // Magnetic Snap to adjacent chiller on the same wall
        if (activeTool === "CHILLER") {
          const prevSegIdx = (bestSegIdx - 1 + segCount) % segCount
          const nextSegIdx = (bestSegIdx + 1) % segCount
          if (segmentOverrides[prevSegIdx] === "CHILLER" && t1 * wallLen < 0.3) {
            t1 = 0
            t2 = deltaT
          }
          if (segmentOverrides[nextSegIdx] === "CHILLER" && (1 - t2) * wallLen < 0.3) {
            t2 = 1.0
            t1 = Math.max(0, 1.0 - deltaT)
          }
        }

        const ptA: Point = {
          x: Number((segWall.p1.x + t1 * (segWall.p2.x - segWall.p1.x)).toFixed(3)),
          y: Number((segWall.p1.y + t1 * (segWall.p2.y - segWall.p1.y)).toFixed(3)),
        }
        const ptB: Point = {
          x: Number((segWall.p1.x + t2 * (segWall.p2.x - segWall.p1.x)).toFixed(3)),
          y: Number((segWall.p1.y + t2 * (segWall.p2.y - segWall.p1.y)).toFixed(3)),
        }

        pushCurrentToHistory()

        const insertP1 = t1 > 0.03 && t1 < 0.97
        const insertP2 = t2 > 0.03 && t2 < 0.97 && Math.hypot(ptB.x - ptA.x, ptB.y - ptA.y) > 0.1

        const oldSegmentOverride = segmentOverrides[bestSegIdx] || "SOLID"
        const newPts = [...customPts]
        let insertedCount = 0
        const newOverrides: Record<number, WallType> = {}

        Object.entries(segmentOverrides).forEach(([kStr, val]) => {
          const k = parseInt(kStr, 10)
          if (k < bestSegIdx) {
            newOverrides[k] = val
          }
        })

        if (insertP1 && insertP2) {
          newPts.splice(bestSegIdx + 1, 0, ptA, ptB)
          insertedCount = 2
          if (oldSegmentOverride !== "SOLID") newOverrides[bestSegIdx] = oldSegmentOverride
          newOverrides[bestSegIdx + 1] = targetType
          if (oldSegmentOverride !== "SOLID") newOverrides[bestSegIdx + 2] = oldSegmentOverride
        } else if (insertP1 && !insertP2) {
          newPts.splice(bestSegIdx + 1, 0, ptA)
          insertedCount = 1
          if (oldSegmentOverride !== "SOLID") newOverrides[bestSegIdx] = oldSegmentOverride
          newOverrides[bestSegIdx + 1] = targetType
        } else if (!insertP1 && insertP2) {
          newPts.splice(bestSegIdx + 1, 0, ptB)
          insertedCount = 1
          newOverrides[bestSegIdx] = targetType
          if (oldSegmentOverride !== "SOLID") newOverrides[bestSegIdx + 1] = oldSegmentOverride
        } else {
          newOverrides[bestSegIdx] = targetType
        }

        Object.entries(segmentOverrides).forEach(([kStr, val]) => {
          const k = parseInt(kStr, 10)
          if (k > bestSegIdx) {
            newOverrides[k + insertedCount] = val
          }
        })

        setIsCalculated(false)
        setPlacedUnits([])
        setCustomPts(newPts)
        setSegmentOverrides(newOverrides)
        toast.success(`Area ${toolLabel} berhasil dipasang pada dinding!`)
        return
      }
      return
    }

    // 3. JIKA TOOL RESTRICTED ZONE FLEKSIBEL AKTIF (PINTU/KACA, KASIR):
    // 2-Click Rentang Bebas dengan Snap
    if (activeTool === "DOOR" || activeTool === "CASHIER") {
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
      let bestDist = 24
      let bestProj: { x: number; y: number; dist: number; t: number } | null = null
      let snappedToCorner = false

      if (pendingZoneStart && pendingZoneStart.tool === activeTool) {
        let segIdx = pendingZoneStart.segIdx

        if (pendingZoneStart.isCorner && pendingZoneStart.cornerNodeIdx !== undefined) {
          const cIdx = pendingZoneStart.cornerNodeIdx
          const segPrevIdx = (cIdx - 1 + segCount) % segCount
          const segNextIdx = cIdx

          const pPrev1 = spts[segPrevIdx]
          const pPrev2 = spts[(segPrevIdx + 1) % segCount]
          const projPrev = getClosestPointOnSegment(cx, cy, pPrev1.cx, pPrev1.cy, pPrev2.cx, pPrev2.cy)

          const pNext1 = spts[segNextIdx]
          const pNext2 = spts[(segNextIdx + 1) % segCount]
          const projNext = getClosestPointOnSegment(cx, cy, pNext1.cx, pNext1.cy, pNext2.cx, pNext2.cy)

          if (projPrev.dist < projNext.dist) {
            segIdx = segPrevIdx
          } else {
            segIdx = segNextIdx
          }
        }

        const p1 = spts[segIdx]
        const p2 = spts[(segIdx + 1) % spts.length]
        const proj = getClosestPointOnSegment(cx, cy, p1.cx, p1.cy, p2.cx, p2.cy)
        bestSegIdx = segIdx
        bestProj = proj

        if (Math.hypot(cx - p1.cx, cy - p1.cy) <= 18) {
          bestProj.t = 0.0
          bestProj.x = p1.cx
          bestProj.y = p1.cy
          snappedToCorner = true
        } else if (Math.hypot(cx - p2.cx, cy - p2.cy) <= 18) {
          bestProj.t = 1.0
          bestProj.x = p2.cx
          bestProj.y = p2.cy
          snappedToCorner = true
        }
      } else {
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
          const p1 = spts[bestSegIdx]
          const p2 = spts[(bestSegIdx + 1) % spts.length]
          if (Math.hypot(cx - p1.cx, cy - p1.cy) <= 18 || bestProj.t <= 0.03) {
            bestProj.t = 0.0
            bestProj.x = p1.cx
            bestProj.y = p1.cy
            snappedToCorner = true
          } else if (Math.hypot(cx - p2.cx, cy - p2.cy) <= 18 || bestProj.t >= 0.97) {
            bestProj.t = 1.0
            bestProj.x = p2.cx
            bestProj.y = p2.cy
            snappedToCorner = true
          }
        }
      }

      if (bestSegIdx !== -1 && bestProj) {
        const segWall = wallSegments.find((w) => w.index === bestSegIdx)
        let clickPt: Point
        let isCorner = false
        let cornerNodeIdx = -1

        if (bestProj.t <= 0.02 && segWall) {
          clickPt = { x: segWall.p1.x, y: segWall.p1.y }
          isCorner = true
          cornerNodeIdx = bestSegIdx
        } else if (bestProj.t >= 0.98 && segWall) {
          clickPt = { x: segWall.p2.x, y: segWall.p2.y }
          isCorner = true
          cornerNodeIdx = (bestSegIdx + 1) % segCount
        } else {
          const mX = Number(((bestProj.x - offX) / scale).toFixed(2))
          const mY = Number(((bestProj.y - offY) / scale).toFixed(2))
          clickPt = { x: mX, y: mY }
        }

        const toolLabel = activeTool === "DOOR" ? "Pintu/Kaca 🚪" : "Kasir 🛒"

        // LANGKAH 1: Klik Titik Awal
        if (!pendingZoneStart || pendingZoneStart.tool !== activeTool) {
          setPendingZoneStart({
            tool: activeTool,
            segIdx: bestSegIdx,
            tA: bestProj.t,
            ptA: clickPt,
            canvasA: { cx: bestProj.x, cy: bestProj.y },
            isCorner,
            cornerNodeIdx: isCorner ? cornerNodeIdx : undefined,
          })
          toast.info(`Titik awal ${toolLabel} ${snappedToCorner ? "(Snap Sudut)" : ""} ditandai! Gerakkan kursor ke titik akhir pada dinding lalu klik.`)
          return
        }

        // LANGKAH 2: Klik Titik Akhir pada Segmen Dinding
        if (pendingZoneStart && pendingZoneStart.tool === activeTool) {
          const segIdx = bestSegIdx
          let tA = pendingZoneStart.tA
          let ptA = pendingZoneStart.ptA

          if (pendingZoneStart.isCorner && pendingZoneStart.cornerNodeIdx !== undefined) {
            const cIdx = pendingZoneStart.cornerNodeIdx
            ptA = customPts[cIdx]
            const segPrevIdx = (cIdx - 1 + segCount) % segCount
            if (segIdx === segPrevIdx) {
              tA = 1.0
            } else {
              tA = 0.0
            }
          }

          const tB = bestProj.t
          const ptB = clickPt

          const distZone = Math.hypot(ptB.x - ptA.x, ptB.y - ptA.y)
          if (distZone < 0.2) {
            toast.error("Panjang bentang area terlalu pendek (< 0.2m). Silakan tentukan jarak yang lebih besar.")
            return
          }

          pushCurrentToHistory()

          const isAscending = tA <= tB
          const t1 = isAscending ? tA : tB
          const t2 = isAscending ? tB : tA
          const p1 = isAscending ? ptA : ptB
          const p2 = isAscending ? ptB : ptA

          const insertP1 = t1 > 0.03 && t1 < 0.97
          const insertP2 = t2 > 0.03 && t2 < 0.97 && Math.hypot(p2.x - p1.x, p2.y - p1.y) > 0.1

          const oldSegmentOverride = segmentOverrides[segIdx] || "SOLID"
          const targetType: WallType = activeTool === "DOOR" ? "GLASS_DOOR" : "CASHIER"

          const newPts = [...customPts]
          let insertedCount = 0
          const newOverrides: Record<number, WallType> = {}

          Object.entries(segmentOverrides).forEach(([kStr, val]) => {
            const k = parseInt(kStr, 10)
            if (k < segIdx) {
              newOverrides[k] = val
            }
          })

          if (insertP1 && insertP2) {
            newPts.splice(segIdx + 1, 0, p1, p2)
            insertedCount = 2
            if (oldSegmentOverride !== "SOLID") newOverrides[segIdx] = oldSegmentOverride
            newOverrides[segIdx + 1] = targetType
            if (oldSegmentOverride !== "SOLID") newOverrides[segIdx + 2] = oldSegmentOverride
          } else if (insertP1 && !insertP2) {
            newPts.splice(segIdx + 1, 0, p1)
            insertedCount = 1
            if (oldSegmentOverride !== "SOLID") newOverrides[segIdx] = oldSegmentOverride
            newOverrides[segIdx + 1] = targetType
          } else if (!insertP1 && insertP2) {
            newPts.splice(segIdx + 1, 0, p2)
            insertedCount = 1
            newOverrides[segIdx] = targetType
            if (oldSegmentOverride !== "SOLID") newOverrides[segIdx + 1] = oldSegmentOverride
          } else {
            newOverrides[segIdx] = targetType
          }

          Object.entries(segmentOverrides).forEach(([kStr, val]) => {
            const k = parseInt(kStr, 10)
            if (k > segIdx) {
              newOverrides[k + insertedCount] = val
            }
          })

          setIsCalculated(false)
          setPlacedUnits([])
          setCustomPts(newPts)
          setSegmentOverrides(newOverrides)
          setPendingZoneStart(null)
          toast.success(`Area ${toolLabel} (${formatDim(distZone)}m) berhasil ditandai pada dinding!`)
          return
        }
      }
      return
    }

    // 4. JIKA TOOL DRAW: CEK KLIK PADA BADAN SEGMEN BAKU (PINTU P1 / CHILLER) -> GESER SELURUH BLOK UTUH
    if (activeTool === "DRAW" && customClosed && customPts.length >= 3) {
      const spts = customPts.map((pt) => ({
        cx: offX + pt.x * scale,
        cy: offY + pt.y * scale,
      }))
      const segCount = spts.length
      let clickedSegIdx = -1
      let minSegDist = 14

      for (let i = 0; i < segCount; i++) {
        const segType = segmentOverrides[i] || "SOLID"
        if (segType === "DOOR_P1" || segType === "CHILLER") {
          const p1 = spts[i]
          const p2 = spts[(i + 1) % spts.length]
          const proj = getClosestPointOnSegment(cx, cy, p1.cx, p1.cy, p2.cx, p2.cy)
          if (proj.dist < minSegDist && proj.t > 0.08 && proj.t < 0.92) {
            minSegDist = proj.dist
            clickedSegIdx = i
          }
        }
      }

      if (clickedSegIdx !== -1) {
        const segWall = wallSegments.find((w) => w.index === clickedSegIdx)
        if (segWall) {
          const parent = getParentWallLine(customPts, clickedSegIdx)
          pushCurrentToHistory()

          dragSegmentSnapshotRef.current = {
            pts: [...customPts],
            segIdx: clickedSegIdx,
            fixedLen: segWall.lengthM,
            p1Idx: parent.p1Idx,
            p2Idx: parent.p2Idx,
            origPt1: { ...customPts[parent.p1Idx] },
            origPt2: { ...customPts[parent.p2Idx] },
            parentP1: { ...parent.pA },
            parentP2: { ...parent.pB },
            parentLen: parent.len,
            startClickT: 0.5,
          }
          setActiveDragSegmentIdx(clickedSegIdx)
          try {
            ; (e.target as HTMLElement).setPointerCapture(e.pointerId)
          } catch { }
          toast.info(`Menggeser posisi ${segWall.type === "DOOR_P1" ? "Pintu P1 (1.0m)" : "Chiller"} sepanjang dinding...`)
          return
        }
      }
    }

    // 5. JIKA TOOL DRAW (DENAH UTAMA / EDIT):
    // Cek klik pada node sudut untuk drag atau pilih titik
    if (customPts.length > 0) {
      const spts = customPts.map((pt) => ({
        cx: offX + pt.x * scale,
        cy: offY + pt.y * scale,
      }))

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

          dragStartSnapshotRef.current = {
            pts: [...customPts],
            closed: customClosed,
            overrides: { ...segmentOverrides },
            placedUnits: [...placedUnits],
            isCalculated,
          }
          setActiveDragIdx(i)
          try {
            ; (e.target as HTMLElement).setPointerCapture(e.pointerId)
          } catch { }
          return
        }
      }
    }

    // 6. JIKA TOOL DRAW (DENAH UTAMA) & KLIK PADA GARIS DINDING (PEN TOOL: SISIPKAN TITIK BARU):
    if (customPts.length >= 2) {
      const spts = customPts.map((pt) => ({
        cx: offX + pt.x * scale,
        cy: offY + pt.y * scale,
      }))
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
        dragStartSnapshotRef.current = {
          pts: [...customPts],
          closed: customClosed,
          overrides: { ...segmentOverrides },
          placedUnits: [...placedUnits],
          isCalculated,
        }

        const newPts = [...customPts]
        newPts.splice(insertIdx, 0, { x: mX, y: mY })

        // Update segmentOverrides:
        const oldOverride = segmentOverrides[bestSegIdx]
        const newOverrides: Record<number, WallType> = {}
        Object.entries(segmentOverrides).forEach(([kStr, val]) => {
          const k = parseInt(kStr, 10)
          if (k < bestSegIdx) {
            newOverrides[k] = val
          } else if (k > bestSegIdx) {
            newOverrides[k + 1] = val
          }
        })
        if (oldOverride && oldOverride !== "SOLID") {
          newOverrides[bestSegIdx] = oldOverride
          newOverrides[bestSegIdx + 1] = oldOverride
        }

        setIsCalculated(false)
        setPlacedUnits([])

        setCustomPts(newPts)
        setSegmentOverrides(newOverrides)
        setSelectedNodeIdx(insertIdx)
        setActiveDragIdx(insertIdx)
        try {
          ; (e.target as HTMLElement).setPointerCapture(e.pointerId)
        } catch { }

        toast.info(`Titik T${insertIdx + 1} ditambahkan pada dinding. Geser titik untuk membentuk lekukan!`)
        return
      }
    }

    // 7. Tambah titik baru jika belum ditutup (Drawing Mode Awal)
    if (!customClosed) {
      let mx = Number(((cx - FIXED_OX) / FIXED_SCALE).toFixed(2))
      let my = Number(((cy - FIXED_OY) / FIXED_SCALE).toFixed(2))

      if (customPts.length >= 1) {
        const snapThresholdM = 12 / FIXED_SCALE
        const n = customPts.length
        const lastPt = customPts[n - 1]

        let snappedX = false
        let snappedY = false

        if (Math.abs(my - lastPt.y) <= snapThresholdM) {
          my = lastPt.y
          snappedY = true
        }
        if (Math.abs(mx - lastPt.x) <= snapThresholdM) {
          mx = lastPt.x
          snappedX = true
        }

        for (let i = 0; i < n - 1; i++) {
          const pt = customPts[i]
          if (!pt) continue
          if (!snappedY && Math.abs(my - pt.y) <= snapThresholdM) {
            my = pt.y
            snappedY = true
          }
          if (!snappedX && Math.abs(mx - pt.x) <= snapThresholdM) {
            mx = pt.x
            snappedX = true
          }
        }
      }

      pushCurrentToHistory()
      setCustomPts((prev) => [...prev, { x: Math.max(0, mx), y: Math.max(0, my) }])
      setSelectedNodeIdx(null)
      setActiveSnapGuides([])
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

    // 1. DRAGGING PLACED AC HANDLER (Menggeser AC di sepanjang dinding)
    if (activeDragAcId !== null) {
      setPlacedUnits((prev) =>
        prev.map((unit) => {
          if (unit.id !== activeDragAcId) return unit
          const wall = wallSegments.find((w) => w.index === unit.wallIndex)
          if (!wall) return unit

          const p1 = { cx: offX + wall.p1.x * scale, cy: offY + wall.p1.y * scale }
          const p2 = { cx: offX + wall.p2.x * scale, cy: offY + wall.p2.y * scale }
          const proj = getClosestPointOnSegment(cx, cy, p1.cx, p1.cy, p2.cx, p2.cy)

          return {
            ...unit,
            ratio: Math.min(0.95, Math.max(0.05, Number(proj.t.toFixed(3)))),
          }
        })
      )
      return
    }

    // 2. DRAGGING WHOLE FIXED SEGMENT (Pintu P1 atau Chiller - Geser Kedua Titik Bersamaan)
    if (activeDragSegmentIdx !== null && dragSegmentSnapshotRef.current) {
      const snap = dragSegmentSnapshotRef.current
      const pA = snap.parentP1
      const pB = snap.parentP2
      const parentLen = snap.parentLen
      if (parentLen <= 0) return

      const pA_canvas = { cx: offX + pA.x * scale, cy: offY + pA.y * scale }
      const pB_canvas = { cx: offX + pB.x * scale, cy: offY + pB.y * scale }
      const proj = getClosestPointOnSegment(cx, cy, pA_canvas.cx, pA_canvas.cy, pB_canvas.cx, pB_canvas.cy)

      const fixedLen = snap.fixedLen
      const deltaT = Math.min(1.0, fixedLen / parentLen)

      let t1 = Math.max(0, Math.min(1 - deltaT, proj.t - deltaT / 2))
      let t2 = t1 + deltaT

      // Magnetic snap to parent corners (< 15cm)
      if (t1 * parentLen < 0.15) {
        t1 = 0
        t2 = deltaT
      } else if ((1 - t2) * parentLen < 0.15) {
        t2 = 1.0
        t1 = Math.max(0, 1.0 - deltaT)
      }

      // Magnetic snap to adjacent chillers on same straight wall
      let isAdjacentSnap = false
      if (segmentOverrides[snap.segIdx] === "CHILLER") {
        wallSegments.forEach((w) => {
          if (w.index !== snap.segIdx && w.type === "CHILLER") {
            const wMid = { x: (w.p1.x + w.p2.x) / 2, y: (w.p1.y + w.p2.y) / 2 }
            const wProj = getClosestPointOnSegment(
              offX + wMid.x * scale,
              offY + wMid.y * scale,
              pA_canvas.cx, pA_canvas.cy, pB_canvas.cx, pB_canvas.cy
            )
            if (wProj.dist < 8) {
              const p1Proj = getClosestPointOnSegment(offX + w.p1.x * scale, offY + w.p1.y * scale, pA_canvas.cx, pA_canvas.cy, pB_canvas.cx, pB_canvas.cy)
              const p2Proj = getClosestPointOnSegment(offX + w.p2.x * scale, offY + w.p2.y * scale, pA_canvas.cx, pA_canvas.cy, pB_canvas.cx, pB_canvas.cy)
              const wMinT = Math.min(p1Proj.t, p2Proj.t)
              const wMaxT = Math.max(p1Proj.t, p2Proj.t)

              if (Math.abs(t1 - wMaxT) * parentLen < 0.25) {
                t1 = wMaxT
                t2 = t1 + deltaT
                isAdjacentSnap = true
              } else if (Math.abs(t2 - wMinT) * parentLen < 0.25) {
                t2 = wMinT
                t1 = Math.max(0, t2 - deltaT)
                isAdjacentSnap = true
              }
            }
          }
        })
      }

      if (isAdjacentSnap) {
        setMagneticSnapFeedback({
          segIdx: snap.segIdx,
          label: "✓ Chiller Rapat Berdampingan",
          cx: pA_canvas.cx + ((t1 + t2) / 2) * (pB_canvas.cx - pA_canvas.cx),
          cy: pA_canvas.cy + ((t1 + t2) / 2) * (pB_canvas.cy - pA_canvas.cy),
        })
      } else {
        setMagneticSnapFeedback(null)
      }

      const newPt1: Point = {
        x: Number((pA.x + t1 * (pB.x - pA.x)).toFixed(3)),
        y: Number((pA.y + t1 * (pB.y - pA.y)).toFixed(3)),
      }
      const newPt2: Point = {
        x: Number((pA.x + t2 * (pB.x - pA.x)).toFixed(3)),
        y: Number((pA.y + t2 * (pB.y - pA.y)).toFixed(3)),
      }

      setCustomPts((prev) => {
        const next = [...prev]
        next[snap.p1Idx] = newPt1
        next[snap.p2Idx] = newPt2
        return next
      })
      return
    }

    // 3. DRAGGING POINT HANDLER (Menggeser titik sudut / batas zona dinding)
    if (activeDragIdx !== null) {
      const rawMx = (cx - offX) / scale
      const rawMy = (cy - offY) / scale
      let newX = customClosed ? rawMx : Math.max(0, rawMx)
      let newY = customClosed ? rawMy : Math.max(0, rawMy)

      const snapThresholdM = 10 / scale
      const guides: SnapGuide[] = []
      const n = customPts.length
      const prevIdx = (activeDragIdx - 1 + n) % n
      const nextIdx = (activeDragIdx + 1) % n

      let snappedX = false
      let snappedY = false

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

    // 4. DRAWING MODE LIVE SNAP GUIDES (Saat menambah titik poligon baru)
    if (!customClosed && activeDragIdx === null && activeDragAcId === null && customPts.length >= 1) {
      const snapThresholdM = 12 / scale
      const guides: SnapGuide[] = []
      const n = customPts.length
      const lastIdx = n - 1
      const lastPt = customPts[lastIdx]

      let snappedX = false
      let snappedY = false

      if (Math.abs(my - lastPt.y) <= snapThresholdM) {
        snappedY = true
        guides.push({
          type: "h",
          pos: lastPt.y,
          fromCanvas: { x: 0, y: offY + lastPt.y * scale },
          toCanvas: { x: W, y: offY + lastPt.y * scale },
          snapType: "orthogonal",
          refNodeIdx: lastIdx,
        })
      }
      if (Math.abs(mx - lastPt.x) <= snapThresholdM) {
        snappedX = true
        guides.push({
          type: "v",
          pos: lastPt.x,
          fromCanvas: { x: offX + lastPt.x * scale, y: 0 },
          toCanvas: { x: offX + lastPt.x * scale, y: CANVAS_H },
          snapType: "orthogonal",
          refNodeIdx: lastIdx,
        })
      }

      for (let i = 0; i < n - 1; i++) {
        const pt = customPts[i]
        if (!pt) continue

        if (!snappedY && Math.abs(my - pt.y) <= snapThresholdM) {
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
        if (!snappedX && Math.abs(mx - pt.x) <= snapThresholdM) {
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
    } else if (activeDragIdx === null && activeDragSegmentIdx === null) {
      setActiveSnapGuides([])
    }

    // Hover detection untuk Pen Tool & Penanda Zona pada garis / sudut
    if (customPts.length >= 2) {
      const spts = customPts.map((pt) => ({
        cx: offX + pt.x * scale,
        cy: offY + pt.y * scale,
      }))
      const segCount = customClosed ? spts.length : spts.length - 1
      let foundHover: { cx: number; cy: number; segmentIdx: number; t: number; projX: number; projY: number } | null = null
      let bestDist = 20

      if (pendingZoneStart && pendingZoneStart.tool === activeTool) {
        let activeSegIdx = pendingZoneStart.segIdx
        let p1 = spts[activeSegIdx]
        let p2 = spts[(activeSegIdx + 1) % spts.length]

        if (pendingZoneStart.isCorner && pendingZoneStart.cornerNodeIdx !== undefined) {
          const cIdx = pendingZoneStart.cornerNodeIdx
          const segPrevIdx = (cIdx - 1 + spts.length) % spts.length
          const segNextIdx = cIdx

          const pPrev1 = spts[segPrevIdx]
          const pPrev2 = spts[(segPrevIdx + 1) % spts.length]
          const projPrev = getClosestPointOnSegment(cx, cy, pPrev1.cx, pPrev1.cy, pPrev2.cx, pPrev2.cy)

          const pNext1 = spts[segNextIdx]
          const pNext2 = spts[(segNextIdx + 1) % spts.length]
          const projNext = getClosestPointOnSegment(cx, cy, pNext1.cx, pNext1.cy, pNext2.cx, pNext2.cy)

          if (projPrev.dist < projNext.dist) {
            activeSegIdx = segPrevIdx
            p1 = pPrev1
            p2 = pPrev2
          } else {
            activeSegIdx = segNextIdx
            p1 = pNext1
            p2 = pNext2
          }
        }

        const proj = getClosestPointOnSegment(cx, cy, p1.cx, p1.cy, p2.cx, p2.cy)
        let hx = proj.x
        let hy = proj.y
        let ht = proj.t

        if (Math.hypot(cx - p1.cx, cy - p1.cy) <= 18) {
          hx = p1.cx; hy = p1.cy; ht = 0.0
        } else if (Math.hypot(cx - p2.cx, cy - p2.cy) <= 18) {
          hx = p2.cx; hy = p2.cy; ht = 1.0
        }

        foundHover = {
          cx: hx,
          cy: hy,
          segmentIdx: activeSegIdx,
          t: ht,
          projX: Number(((hx - offX) / scale).toFixed(2)),
          projY: Number(((hy - offY) / scale).toFixed(2)),
        }
      } else {
        for (let i = 0; i < segCount; i++) {
          const p1 = spts[i]
          const p2 = spts[(i + 1) % spts.length]
          const proj = getClosestPointOnSegment(cx, cy, p1.cx, p1.cy, p2.cx, p2.cy)

          if (proj.dist < bestDist) {
            bestDist = proj.dist
            let hx = proj.x
            let hy = proj.y
            let ht = proj.t

            if (activeTool !== "DRAW") {
              if (Math.hypot(cx - p1.cx, cy - p1.cy) <= 18) {
                hx = p1.cx; hy = p1.cy; ht = 0.0
              } else if (Math.hypot(cx - p2.cx, cy - p2.cy) <= 18) {
                hx = p2.cx; hy = p2.cy; ht = 1.0
              }
            }

            foundHover = {
              cx: hx,
              cy: hy,
              segmentIdx: i,
              t: ht,
              projX: Number(((hx - offX) / scale).toFixed(2)),
              projY: Number(((hy - offY) / scale).toFixed(2)),
            }
          }
        }
      }

      setHoverEdge(foundHover)
    }
  }

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Selesai drag AC unit
    if (activeDragAcId !== null) {
      try {
        ; (e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch { }
      setActiveDragAcId(null)
      toast.info("Posisi AC berhasil disesuaikan!")
    }

    // Selesai drag whole fixed segment (P1 / Chiller)
    if (activeDragSegmentIdx !== null) {
      try {
        ; (e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch { }
      setActiveDragSegmentIdx(null)
      dragSegmentSnapshotRef.current = null
      setMagneticSnapFeedback(null)
      toast.info("Posisi blok berhasil disesuaikan!")
    }

    // Selesai drag titik node poligon
    if (activeDragIdx !== null) {
      try {
        ; (e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch { }

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

              // Normalisasi koordinat jika titik digeser ke kiri (x < 0) atau ke atas (y < 0)
              let finalPts = customPts
              if (customClosed) {
                const minX = Math.min(...customPts.map((p) => p.x))
                const minY = Math.min(...customPts.map((p) => p.y))
                if (minX < 0 || minY < 0) {
                  const shiftX = minX < 0 ? -minX : 0
                  const shiftY = minY < 0 ? -minY : 0
                  finalPts = customPts.map((p) => ({
                    x: Number((p.x + shiftX).toFixed(3)),
                    y: Number((p.y + shiftY).toFixed(3)),
                  }))
                  setCustomPts(finalPts)
                }
              }

              // Auto-Invalidate Hasil AC saat titik sudut poligon digeser (Opsi 2)
              if (snap.isCalculated || placedUnits.length > 0) {
                setIsCalculated(false)
                setPlacedUnits([])
                toast.info("Bentuk denah diubah. Silakan klik 'Hitung & Petakan AC' untuk memperbarui posisi unit & beban termal.")
              }
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
    setActiveSnapGuides([])
  }

  // ─── 12. Render Canvas Denah (Auto-Center, Rubberband Pen-Tool & 2-Click Zone Preview) ───
  const drawCanvas = useCallback((targetCanvas?: HTMLCanvasElement | null, forceLight = false, customW?: number, customH?: number) => {
    const canvas = targetCanvas || canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.max(window.devicePixelRatio || 1, 2)
    const W = customW || canvas.offsetWidth || 340
    const H = customH || canvas.offsetHeight || CANVAS_H

    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    canvas.style.width = W + "px"
    canvas.style.height = H + "px"

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const effectiveIsDark = forceLight ? false : isDark

    const bgFill = effectiveIsDark ? "#0c0d12" : "#ffffff"
    const gridStroke = effectiveIsDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"
    const meterGridStroke = effectiveIsDark ? "rgba(245,158,11,0.05)" : "rgba(245,158,11,0.12)"
    const meterLabelFill = effectiveIsDark ? "rgba(245,158,11,0.3)" : "rgba(180,83,9,0.6)"
    const subTextFill = effectiveIsDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.4)"
    const subTextFill2 = effectiveIsDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.25)"
    const ptLabelFill = effectiveIsDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)"
    const polyFill = effectiveIsDark ? "rgba(15,23,42,0.65)" : "rgba(248,250,252,0.95)"
    const nodeTextFill = effectiveIsDark ? "#a1a1aa" : "#4b5563"

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

          let nx = -dy / len
          let ny = dx / len
          const labelX = mx + nx * 8
          const labelY = my + ny * 8

          let angle = Math.atan2(dy, dx)
          if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
            angle += Math.PI
          }

          const segText = `${formatDim(lenVal)}m`

          ctx.save()
          ctx.translate(labelX, labelY)
          ctx.rotate(angle)
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.font = "bold 8.5px sans-serif"

          // Subtle, perfectly-aligned text outline (persis kalkulator lampu)
          ctx.strokeStyle = bgFill
          ctx.lineWidth = 1.5
          ctx.lineJoin = "round"
          ctx.strokeText(segText, 0, 0)

          // Crisp filled text
          ctx.fillStyle = effectiveIsDark ? "#34d399" : "#047857"
          ctx.fillText(segText, 0, 0)
          ctx.restore()
        }
        ctx.restore()
      }

      // ── LIVE RUBBERBAND PEN-TOOL LINE & SNAP GUIDES (Menempel ke Kursor saat Menambah Titik) ──
      if (cursorPos && customPts.length >= 1) {
        const lastSp = spts[spts.length - 1]
        const lastPt = customPts[customPts.length - 1]

        let targetCx = cursorPos.cx
        let targetCy = cursorPos.cy
        let targetMx = cursorPos.mx
        let targetMy = cursorPos.my
        let isSnappedOrthogonal = false
        let isSnappedAlignment = false
        const alignedNodeLabels: string[] = []

        const snapThresholdM = 12 / FIXED_SCALE
        const n = customPts.length

        // 1. 90° Orthogonal Snap to last point
        if (Math.abs(cursorPos.my - lastPt.y) <= snapThresholdM) {
          targetMy = lastPt.y
          targetCy = lastSp.cy
          isSnappedOrthogonal = true
        }
        if (Math.abs(cursorPos.mx - lastPt.x) <= snapThresholdM) {
          targetMx = lastPt.x
          targetCx = lastSp.cx
          isSnappedOrthogonal = true
        }

        // 2. Alignment Snap to previous points (misal T1 saat membuat T4)
        for (let i = 0; i < n - 1; i++) {
          const pt = customPts[i]
          const sp = spts[i]
          if (!pt || !sp) continue

          if (Math.abs(targetMy - pt.y) > snapThresholdM && Math.abs(cursorPos.my - pt.y) <= snapThresholdM) {
            targetMy = pt.y
            targetCy = sp.cy
            isSnappedAlignment = true
            alignedNodeLabels.push(`T${i + 1}`)
          }
          if (Math.abs(targetMx - pt.x) > snapThresholdM && Math.abs(cursorPos.mx - pt.x) <= snapThresholdM) {
            targetMx = pt.x
            targetCx = sp.cx
            isSnappedAlignment = true
            alignedNodeLabels.push(`T${i + 1}`)
          }
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

        // Render Live Snap Guides di Drawing Mode
        activeSnapGuides.forEach((g) => {
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(g.fromCanvas.x, g.fromCanvas.y)
          ctx.lineTo(g.toCanvas.x, g.toCanvas.y)
          ctx.strokeStyle = g.snapType === "orthogonal" ? "rgba(6, 182, 212, 0.85)" : "rgba(168, 85, 247, 0.85)"
          ctx.lineWidth = 1.5
          ctx.setLineDash([4, 3])
          ctx.stroke()

          // Highlight node referensi
          if (g.refNodeIdx !== undefined && spts[g.refNodeIdx]) {
            const refSp = spts[g.refNodeIdx]
            ctx.beginPath()
            ctx.arc(refSp.cx, refSp.cy, 8, 0, Math.PI * 2)
            ctx.strokeStyle = g.snapType === "orthogonal" ? "#06b6d4" : "#a855f7"
            ctx.lineWidth = 2
            ctx.stroke()

            ctx.font = "bold 9px sans-serif"
            ctx.fillStyle = g.snapType === "orthogonal" ? "#0891b2" : "#7e22ce"
            ctx.textAlign = "left"
            ctx.fillText(
              g.snapType === "orthogonal" ? `⦜ 90° (T${g.refNodeIdx + 1})` : `⫿ Sejajar T${g.refNodeIdx + 1}`,
              refSp.cx + 10,
              refSp.cy - 6
            )
          }
          ctx.restore()
        })

        // Draw live dashed rubberband
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(lastSp.cx, lastSp.cy)
        ctx.lineTo(targetCx, targetCy)
        ctx.strokeStyle = isCloseSnap ? "#10b981" : (isSnappedOrthogonal || isSnappedAlignment ? "#06b6d4" : "rgba(245, 158, 11, 0.8)")
        ctx.lineWidth = isCloseSnap ? 2 : 1.5
        ctx.setLineDash([4, 3])
        ctx.stroke()
        ctx.setLineDash([])

        // Live distance badge along rubberband
        const liveDist = Math.hypot(targetMx - lastPt.x, targetMy - lastPt.y)
        if (liveDist > 0.3) {
          const midX = (lastSp.cx + targetCx) / 2
          const midY = (lastSp.cy + targetCy) / 2

          let snapLabel = ""
          if (isSnappedOrthogonal) snapLabel += " ⦜ 90°"
          if (alignedNodeLabels.length > 0) snapLabel += ` ⫿ Sejajar ${alignedNodeLabels.join(", ")}`

          ctx.font = "bold 9px sans-serif"
          ctx.fillStyle = isCloseSnap ? "#10b981" : (isSnappedOrthogonal || isSnappedAlignment ? "#06b6d4" : "#f59e0b")
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(`${formatDim(liveDist)}m${snapLabel ? ` (${snapLabel.trim()})` : ""}`, midX, midY - 10)
        }

        // Live cursor circle tip
        ctx.beginPath()
        ctx.arc(targetCx, targetCy, isCloseSnap ? 8 : 4.5, 0, Math.PI * 2)
        ctx.fillStyle = isCloseSnap ? "rgba(16, 185, 129, 0.4)" : (isSnappedAlignment ? "rgba(168, 85, 247, 0.3)" : "rgba(6, 182, 212, 0.3)")
        ctx.fill()
        ctx.strokeStyle = isCloseSnap ? "#10b981" : (isSnappedAlignment ? "#a855f7" : "#06b6d4")
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
    ctx.clip() // Semburan AC terkunci rapi di dalam batas lantai denah toko

    // 2. Render Sebaran Hembusan Udara Dingin AC (Gradasi Sejuk Cyan / Sky-Blue Halus)
    if (isCalculated && placedUnits.length > 0) {
      const centroidX = customPts.reduce((acc, p) => acc + p.x, 0) / (customPts.length || 1)
      const centroidY = customPts.reduce((acc, p) => acc + p.y, 0) / (customPts.length || 1)

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

        // Pastikan arah hembusan SELALU meniup ke dalam denah toko (menuju centroid)
        const toCentroidX = centroidX - acX
        const toCentroidY = centroidY - acY
        if (nx * toCentroidX + ny * toCentroidY < 0) {
          nx = -nx
          ny = -ny
        }

        const flowAngle = Math.atan2(ny, nx)
        const throwRadius = Math.max(sc.scale * 6.5, 90) // Panjang jangkauan hembusan ~6.5 meter
        const halfSpread = Math.PI / 6 // Sudut sebar hembusan lancip (total 60°)

        const uX = dx / len
        const uY = dy / len

        // Lebar mulut kisi-kisi hembusan AC (hampir selebar unit indoor Daikin 2 PK)
        const louverHalfW = 12 // pixel half-width on canvas
        const frontOffset = 5  // pixel offset to front face / discharge slot

        // Titik pusat asal hembusan di muka louver AC
        const louverMidX = cAcX + nx * frontOffset
        const louverMidY = cAcY + ny * frontOffset

        // Titik outer arc awal dan akhir
        const angleStart = flowAngle - halfSpread
        const angleEnd = flowAngle + halfSpread
        const pStartX = louverMidX + Math.cos(angleStart) * throwRadius
        const pStartY = louverMidY + Math.sin(angleStart) * throwRadius

        // 2 titik ujung mulut louver AC
        const c1 = { x: cAcX - uX * louverHalfW + nx * frontOffset, y: cAcY - uY * louverHalfW + ny * frontOffset }
        const c2 = { x: cAcX + uX * louverHalfW + nx * frontOffset, y: cAcY + uY * louverHalfW + ny * frontOffset }

        // Cocokkan sudut mulut AC yang sejajar dengan sisi awal dan akhir outer arc (mencegah garis bersilangan)
        const d1 = Math.hypot(c1.x - pStartX, c1.y - pStartY)
        const d2 = Math.hypot(c2.x - pStartX, c2.y - pStartY)
        const lStart = d1 <= d2 ? c1 : c2
        const lEnd = d1 <= d2 ? c2 : c1

        // Sektor Hembusan Udara Terbuka (Convex Fan Plume dari Mulut AC)
        ctx.beginPath()
        ctx.moveTo(lStart.x, lStart.y)
        const arcSteps = 16
        for (let s = 0; s <= arcSteps; s++) {
          const a = angleStart + (s / arcSteps) * (angleEnd - angleStart)
          const px = louverMidX + Math.cos(a) * throwRadius
          const py = louverMidY + Math.sin(a) * throwRadius
          ctx.lineTo(px, py)
        }
        ctx.lineTo(lEnd.x, lEnd.y)
        ctx.closePath()

        // Gradasi Sejuk Cyan / Sky-Blue Alami Memancar Lembut dari Mulut Louver AC
        const coneGrad = ctx.createRadialGradient(louverMidX, louverMidY, 4, louverMidX, louverMidY, throwRadius)
        if (effectiveIsDark) {
          coneGrad.addColorStop(0, "rgba(56, 189, 248, 0.48)")       // Inti sejuk dekat kisi AC
          coneGrad.addColorStop(0.35, "rgba(14, 165, 233, 0.26)")    // Hembusan tengah ~3m
          coneGrad.addColorStop(0.70, "rgba(6, 182, 212, 0.12)")     // Hembusan jauh ~5m
          coneGrad.addColorStop(1, "rgba(6, 182, 212, 0.0)")         // Disipasi lembut tanpa tepi tajam
        } else {
          coneGrad.addColorStop(0, "rgba(2, 132, 199, 0.44)")       // Inti sejuk dekat kisi AC (kontras tajam)
          coneGrad.addColorStop(0.35, "rgba(14, 165, 233, 0.28)")    // Hembusan tengah ~3m
          coneGrad.addColorStop(0.70, "rgba(56, 189, 248, 0.14)")    // Hembusan jauh ~5m
          coneGrad.addColorStop(1, "rgba(56, 189, 248, 0.0)")        // Disipasi lembut tanpa tepi tajam
        }

        ctx.fillStyle = coneGrad
        ctx.fill()

        // ── Visualisasi Gelombang Aliran Udara & Garis Jangkauan (Wavefront Arcs & Streamlines) ──
        ctx.save()
        const arcStroke1 = effectiveIsDark ? "rgba(56, 189, 248, 0.26)" : "rgba(2, 132, 199, 0.28)"
        const arcStroke2 = effectiveIsDark ? "rgba(56, 189, 248, 0.18)" : "rgba(14, 165, 233, 0.20)"
        const arcStroke3 = effectiveIsDark ? "rgba(56, 189, 248, 0.35)" : "rgba(2, 132, 199, 0.36)"

        // Busur Zona Sejuk Dekat (~3m)
        ctx.beginPath()
        for (let s = 0; s <= arcSteps; s++) {
          const a = (flowAngle - halfSpread * 0.85) + (s / arcSteps) * (2 * halfSpread * 0.85)
          const px = louverMidX + Math.cos(a) * (throwRadius * 0.45)
          const py = louverMidY + Math.sin(a) * (throwRadius * 0.45)
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
        }
        ctx.strokeStyle = arcStroke1
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.stroke()

        // Busur Zona Efektif (~5m)
        ctx.beginPath()
        for (let s = 0; s <= arcSteps; s++) {
          const a = (flowAngle - halfSpread * 0.85) + (s / arcSteps) * (2 * halfSpread * 0.85)
          const px = louverMidX + Math.cos(a) * (throwRadius * 0.75)
          const py = louverMidY + Math.sin(a) * (throwRadius * 0.75)
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
        }
        ctx.strokeStyle = arcStroke2
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.stroke()

        // Busur Batas Jangkauan Maksimal (~6.5m)
        ctx.beginPath()
        for (let s = 0; s <= arcSteps; s++) {
          const a = (flowAngle - halfSpread * 0.9) + (s / arcSteps) * (2 * halfSpread * 0.9)
          const px = louverMidX + Math.cos(a) * (throwRadius * 0.96)
          const py = louverMidY + Math.sin(a) * (throwRadius * 0.96)
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
        }
        ctx.strokeStyle = arcStroke3
        ctx.lineWidth = 1.2
        ctx.setLineDash([5, 3])
        ctx.stroke()

        // Garis Streamline Radial Aliran Udara dari 4 Titik di Sepanjang Mulut Louver AC
        ctx.strokeStyle = effectiveIsDark ? "rgba(56, 189, 248, 0.18)" : "rgba(2, 132, 199, 0.20)"
        ctx.lineWidth = 0.9
        ctx.setLineDash([3, 4])
          ;[0.12, 0.38, 0.62, 0.88].forEach((t) => {
            const startX = lStart.x + t * (lEnd.x - lStart.x)
            const startY = lStart.y + t * (lEnd.y - lStart.y)
            const rayAngle = angleStart + t * (angleEnd - angleStart)
            ctx.beginPath()
            ctx.moveTo(startX, startY)
            ctx.lineTo(startX + Math.cos(rayAngle) * (throwRadius * 0.85), startY + Math.sin(rayAngle) * (throwRadius * 0.85))
            ctx.stroke()
          })
        ctx.setLineDash([])
        ctx.restore()
      })
    }
    ctx.restore() // End Clip

    // Calculate centroid of scaled polygon for outward normal offset
    const sptsPoly = customPts.map((p) => toC(p))
    const cxPoly = sptsPoly.reduce((acc, p) => acc + p.cx, 0) / (sptsPoly.length || 1)
    const cyPoly = sptsPoly.reduce((acc, p) => acc + p.cy, 0) / (sptsPoly.length || 1)

    // 3. Render Garis Dinding Poligon & Status Terlarang
    wallSegments.forEach((wall) => {
      const p1 = toC(wall.p1)
      const p2 = toC(wall.p2)

      ctx.save()
      ctx.lineWidth = 3.5

      if (wall.type === "SOLID") {
        ctx.strokeStyle = effectiveIsDark ? "#38bdf8" : "#0284c7" // Dinding Solid Aktif
        ctx.setLineDash([])
      } else if (wall.type === "GLASS_DOOR") {
        ctx.strokeStyle = "#f97316" // Kaca / Pintu Depan
        ctx.setLineDash([6, 3])
      } else if (wall.type === "DOOR_P1") {
        ctx.strokeStyle = "#ea580c" // Pintu P1 Gudang
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

      // Render sekat modul internal chiller tiap 1.2m jika panjang > 1.3m
      if (wall.type === "CHILLER" && wall.lengthM >= 2.3) {
        const unitsInWall = Math.round(wall.lengthM / 1.2)
        ctx.save()
        ctx.strokeStyle = effectiveIsDark ? "#ffffff" : "#083344"
        ctx.lineWidth = 2.5
        ctx.setLineDash([])
        for (let u = 1; u < unitsInWall; u++) {
          const ratio = (u * 1.2) / wall.lengthM
          const midCx = p1.cx + ratio * (p2.cx - p1.cx)
          const midCy = p1.cy + ratio * (p2.cy - p1.cy)
          const dxW = p2.cx - p1.cx
          const dyW = p2.cy - p1.cy
          const lenW = Math.hypot(dxW, dyW) || 1
          const normX = -dyW / lenW
          const normY = dxW / lenW

          // Garis sekat pembatas modul tegak lurus
          ctx.beginPath()
          ctx.moveTo(midCx - normX * 5.5, midCy - normY * 5.5)
          ctx.lineTo(midCx + normX * 5.5, midCy + normY * 5.5)
          ctx.stroke()

          // Titik simpul modul penanda sekat
          ctx.beginPath()
          ctx.arc(midCx, midCy, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = effectiveIsDark ? "#06b6d4" : "#0891b2"
          ctx.fill()
          ctx.strokeStyle = effectiveIsDark ? "#ffffff" : "#083344"
          ctx.lineWidth = 1.2
          ctx.stroke()
        }
        ctx.restore()
      }

      // Label Dimensi & Tag Zona di Sepanjang Sisi Dinding (Outward Normal Offset persis Kalkulator Lampu)
      const mx = (p1.cx + p2.cx) / 2
      const my = (p1.cy + p2.cy) / 2
      const dx = p2.cx - p1.cx
      const dy = p2.cy - p1.cy
      const len = Math.hypot(dx, dy)

      if (len > 0) {
        let nx = -dy / len
        let ny = dx / len

        // Pastikan normal vector selalu mengarah keluar poligon
        const dot = (mx + nx * 10 - cxPoly) * (mx - cxPoly) + (my + ny * 10 - cyPoly) * (my - cyPoly)
        if (dot < 0) {
          nx = -nx
          ny = -ny
        }

        const labelOffset = 11
        const labelX = mx + nx * labelOffset
        const labelY = my + ny * labelOffset

        let angle = Math.atan2(dy, dx)
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
          angle += Math.PI
        }

        let tag = `${formatDim(wall.lengthM)}m`
        let tagColor = effectiveIsDark ? "#34d399" : "#047857"

        if (wall.type === "GLASS_DOOR") {
          tag = `${formatDim(wall.lengthM)}m Pintu/Kaca`
          tagColor = "#f97316"
        } else if (wall.type === "DOOR_P1") {
          tag = "1m P1"
          tagColor = "#ea580c"
        } else if (wall.type === "CASHIER") {
          tag = `${formatDim(wall.lengthM)}m Kasir`
          tagColor = "#eab308"
        } else if (wall.type === "CHILLER") {
          const uCount = Math.max(1, Math.round(wall.lengthM / 1.2))
          tag = uCount > 1 ? `${formatDim(wall.lengthM)}m Chiller (${uCount}U)` : `${formatDim(wall.lengthM)}m Chiller`
          tagColor = "#06b6d4"
        } else if (wall.type === "SOLID" && wall.lengthM < AC_INDOOR_WIDTH_M) {
          tagColor = effectiveIsDark ? "#f87171" : "#dc2626"
        } else if (wall.type === "SOLID" && wall.lengthM < MIN_WALL_LENGTH_FOR_AC) {
          tagColor = effectiveIsDark ? "#fbbf24" : "#d97706"
        }

        ctx.save()
        ctx.translate(labelX, labelY)
        ctx.rotate(angle)
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = "bold 8.5px sans-serif"

        // Background mask to prevent line and tag overlap
        ctx.strokeStyle = bgFill
        ctx.lineWidth = 3
        ctx.lineJoin = "round"
        ctx.strokeText(tag, 0, 0)

        // Crisp filled text aligned parallel to wall
        ctx.fillStyle = tagColor
        ctx.fillText(tag, 0, 0)

        ctx.restore()
      }
      ctx.restore()
    })

    // ── 4. RENDER LIVE RUBBERBAND & 1-CLICK PREVIEW UNTUK TOOLS AREA TERLARANG ──
    // A. 1-Click Live Preview untuk Objek Baku (DOOR_P1 dan CHILLER)
    if ((activeTool === "DOOR_P1" || activeTool === "CHILLER") && hoverEdge && !pendingZoneStart) {
      const seg = wallSegments.find((w) => w.index === hoverEdge.segmentIdx)
      if (seg) {
        const targetLen = activeTool === "DOOR_P1" ? DOOR_P1_WIDTH_M : chillerUnits * CHILLER_UNIT_WIDTH_M
        const toolColor = activeTool === "DOOR_P1" ? "#ea580c" : "#06b6d4"
        const toolLabel = activeTool === "DOOR_P1" ? "🚪 Pintu P1 (1.0m)" : `🧊 Chiller (${chillerUnits} Unit - ${formatDim(targetLen)}m)`

        const wallLen = seg.lengthM
        if (wallLen >= targetLen - 0.05) {
          const deltaT = Math.min(1.0, targetLen / wallLen)
          let t1 = Math.max(0, Math.min(1 - deltaT, hoverEdge.t - deltaT / 2))
          let t2 = t1 + deltaT

          if (t1 * wallLen < 0.15) { t1 = 0; t2 = deltaT }
          if ((1 - t2) * wallLen < 0.15) { t2 = 1.0; t1 = Math.max(0, 1.0 - deltaT) }

          const p1 = toC(seg.p1)
          const p2 = toC(seg.p2)
          const startCx = p1.cx + t1 * (p2.cx - p1.cx)
          const startCy = p1.cy + t1 * (p2.cy - p1.cy)
          const endCx = p1.cx + t2 * (p2.cx - p1.cx)
          const endCy = p1.cy + t2 * (p2.cy - p1.cy)

          ctx.save()
          ctx.beginPath()
          ctx.moveTo(startCx, startCy)
          ctx.lineTo(endCx, endCy)
          ctx.strokeStyle = toolColor
          ctx.lineWidth = 6
          ctx.stroke()

            // End nodes
            ;[{ cx: startCx, cy: startCy }, { cx: endCx, cy: endCy }].forEach((pt) => {
              ctx.beginPath()
              ctx.arc(pt.cx, pt.cy, 5, 0, Math.PI * 2)
              ctx.fillStyle = toolColor
              ctx.fill()
              ctx.strokeStyle = "#ffffff"
              ctx.lineWidth = 1.8
              ctx.stroke()
            })

          const badgeMidX = (startCx + endCx) / 2
          const badgeMidY = (startCy + endCy) / 2 - 14

          ctx.font = "bold 9.5px sans-serif"
          ctx.textAlign = "center"
          ctx.fillStyle = toolColor
          ctx.fillText(`${toolLabel} (Klik pasang)`, badgeMidX, badgeMidY)
          ctx.restore()
        }
      }
    }

    // B. Live Feedback Magnetic Snap Hijau
    if (magneticSnapFeedback) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(magneticSnapFeedback.cx, magneticSnapFeedback.cy, 9, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(16, 185, 129, 0.35)"
      ctx.fill()
      ctx.strokeStyle = "#10b981"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.font = "bold 9.5px sans-serif"
      ctx.textAlign = "center"
      ctx.fillStyle = "#10b981"
      ctx.fillText(magneticSnapFeedback.label, magneticSnapFeedback.cx, magneticSnapFeedback.cy - 16)
      ctx.restore()
    }

    // C. 2-Click Live Rubberband untuk DOOR (Kaca Depan) dan CASHIER
    if (pendingZoneStart && (activeTool === "DOOR" || activeTool === "CASHIER") && cursorPos) {
      let targetSegIdx = pendingZoneStart.segIdx

      if (pendingZoneStart.isCorner && pendingZoneStart.cornerNodeIdx !== undefined && wallSegments.length > 0) {
        const cIdx = pendingZoneStart.cornerNodeIdx
        const segPrevIdx = (cIdx - 1 + wallSegments.length) % wallSegments.length
        const segNextIdx = cIdx

        const segPrev = wallSegments.find((w) => w.index === segPrevIdx)
        const segNext = wallSegments.find((w) => w.index === segNextIdx)

        if (segPrev && segNext) {
          const pPrev1 = toC(segPrev.p1)
          const pPrev2 = toC(segPrev.p2)
          const projPrev = getClosestPointOnSegment(cursorPos.cx, cursorPos.cy, pPrev1.cx, pPrev1.cy, pPrev2.cx, pPrev2.cy)

          const pNext1 = toC(segNext.p1)
          const pNext2 = toC(segNext.p2)
          const projNext = getClosestPointOnSegment(cursorPos.cx, cursorPos.cy, pNext1.cx, pNext1.cy, pNext2.cx, pNext2.cy)

          if (projPrev.dist < projNext.dist) {
            targetSegIdx = segPrevIdx
          } else {
            targetSegIdx = segNextIdx
          }
        }
      }

      const seg = wallSegments.find((w) => w.index === targetSegIdx)
      if (seg) {
        const p1 = toC(seg.p1)
        const p2 = toC(seg.p2)
        const proj = getClosestPointOnSegment(cursorPos.cx, cursorPos.cy, p1.cx, p1.cy, p2.cx, p2.cy)

        const startCanvas = pendingZoneStart.canvasA
        const endCanvas = { cx: proj.x, cy: proj.y }

        const toolColor = activeTool === "DOOR" ? "#f97316" : "#eab308"
        const toolLabel = activeTool === "DOOR" ? "🚪 Pintu/Kaca" : "🛒 Kasir"

        const distM = Math.hypot(
          (endCanvas.cx - startCanvas.cx) / sc.scale,
          (endCanvas.cy - startCanvas.cy) / sc.scale
        )

        ctx.save()
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
    ctx.fillStyle = effectiveIsDark ? "#38bdf8" : "#0284c7"
    ctx.fillText(`${formatDim(sc.rW)}m (LT)`, ltX, ltY)

    // PT Label
    ctx.translate(ptX, ptY)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = effectiveIsDark ? "#c4b5fd" : "#6d28d9"
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

      // Highlight on reference node
      if (g.refNodeIdx !== undefined && customPts[g.refNodeIdx]) {
        const refC = toC(customPts[g.refNodeIdx])
        ctx.beginPath()
        ctx.arc(refC.cx, refC.cy, 7, 0, Math.PI * 2)
        ctx.strokeStyle = g.snapType === "orthogonal" ? "#06b6d4" : "#a855f7"
        ctx.lineWidth = 1.8
        ctx.stroke()
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
        : (i === 0 ? "rgba(245,158,11,0.5)" : (effectiveIsDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"))
      ctx.fill()
      ctx.strokeStyle = isSelected
        ? "#ef4444"
        : (i === 0 ? "#f59e0b" : (effectiveIsDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.25)"))
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

      // Outward vector from centroid for corner node label (T1, T2, etc.)
      let outVx = sp.cx - cxPoly
      let outVy = sp.cy - cyPoly
      const outLen = Math.hypot(outVx, outVy) || 1
      outVx /= outLen
      outVy /= outLen

      const nodeOffset = isSelected ? 14 : 10
      const labelCx = sp.cx + outVx * nodeOffset
      const labelCy = sp.cy + outVy * nodeOffset

      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = isSelected ? "bold 10px sans-serif" : "bold 8px sans-serif"

      // Halo behind node label so it never collides with wall lines or tags
      ctx.strokeStyle = bgFill
      ctx.lineWidth = 2.5
      ctx.lineJoin = "round"
      ctx.strokeText(`T${i + 1}`, labelCx, labelCy)

      ctx.fillStyle = isSelected ? "#ef4444" : nodeTextFill
      ctx.fillText(`T${i + 1}`, labelCx, labelCy)
      ctx.restore()
    })

    // 8. Render Pen-Tool / Zone-Marker Edge Hover Indicator
    if (hoverEdge && activeDragIdx === null && !pendingZoneStart) {
      const isCornerSnap = hoverEdge.t <= 0.03 || hoverEdge.t >= 0.97
      ctx.save()
      ctx.beginPath()
      ctx.arc(hoverEdge.cx, hoverEdge.cy, isCornerSnap && activeTool !== "DRAW" ? 8 : 6, 0, Math.PI * 2)
      ctx.fillStyle = activeTool === "DRAW" ? "rgba(16, 185, 129, 0.4)" : (isCornerSnap ? "rgba(16, 185, 129, 0.4)" : "rgba(249, 115, 22, 0.4)")
      ctx.fill()
      ctx.strokeStyle = activeTool === "DRAW" ? "#10b981" : (isCornerSnap ? "#10b981" : "#f97316")
      ctx.lineWidth = isCornerSnap ? 2.2 : 1.8
      ctx.stroke()

      ctx.fillStyle = activeTool === "DRAW" ? "#10b981" : (isCornerSnap ? "#10b981" : "#f97316")
      ctx.font = "bold 9px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(activeTool === "DRAW" ? "+" : "●", hoverEdge.cx, hoverEdge.cy)

      if (activeTool !== "DRAW") {
        let hoverLabel = "Klik titik awal"
        if (hoverEdge.t <= 0.03) hoverLabel = "Snap Pojok Awal (0m)"
        else if (hoverEdge.t >= 0.97) hoverLabel = "Snap Pojok Ujung Dinding"

        ctx.font = "bold 8.5px sans-serif"
        ctx.fillStyle = isCornerSnap ? "#10b981" : (effectiveIsDark ? "#f97316" : "#c2410c")
        ctx.fillText(hoverLabel, hoverEdge.cx, hoverEdge.cy - 12)
      }
      ctx.restore()
    }

    // 9. Render Ikon Unit AC Terpasang di Dinding (Menyesuaikan Orientasi Dinding)
    if (isCalculated && placedUnits.length > 0) {
      const centroidX = customPts.reduce((acc, p) => acc + p.x, 0) / (customPts.length || 1)
      const centroidY = customPts.reduce((acc, p) => acc + p.y, 0) / (customPts.length || 1)

      placedUnits.forEach((unit, idx) => {
        const wall = wallSegments.find((w) => w.index === unit.wallIndex)
        if (!wall) return

        const p1 = toC(wall.p1)
        const p2 = toC(wall.p2)
        const dx = p2.cx - p1.cx
        const dy = p2.cy - p1.cy
        const len = Math.hypot(dx, dy)
        if (len === 0) return

        const acX = wall.p1.x + (wall.p2.x - wall.p1.x) * unit.ratio
        const acY = wall.p1.y + (wall.p2.y - wall.p1.y) * unit.ratio
        const cAcX = sc.offX + acX * sc.scale
        const cAcY = sc.offY + acY * sc.scale

        const isDraggingThisAc = activeDragAcId === unit.id

        // Orientasi sudut dinding
        const wallAngle = Math.atan2(dy, dx)
        let textAngle = wallAngle
        if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
          textAngle += Math.PI
        }

        ctx.save()
        ctx.translate(cAcX, cAcY)
        ctx.rotate(wallAngle)

        const unitL = 30 // Panjang body AC sejajar dinding
        const unitD = 13 // Ketebalan body AC tegak lurus dinding

        if (isDraggingThisAc) {
          ctx.shadowColor = "#38bdf8"
          ctx.shadowBlur = 12
        }

        // Body Unit Indoor AC
        ctx.fillStyle = isDraggingThisAc ? "#0284c7" : (effectiveIsDark ? "#0f172a" : "#ffffff")
        ctx.strokeStyle = isDraggingThisAc ? "#38bdf8" : (effectiveIsDark ? "#38bdf8" : "#0284c7")
        ctx.lineWidth = isDraggingThisAc ? 2.5 : 1.8

        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(-unitL / 2, -unitD / 2, unitL, unitD, 3.5)
        } else {
          ctx.rect(-unitL / 2, -unitD / 2, unitL, unitD)
        }
        ctx.fill()
        ctx.stroke()

        // Garis Louver / Kisi Hembusan
        ctx.beginPath()
        ctx.moveTo(-unitL / 2 + 3, unitD / 2 - 3)
        ctx.lineTo(unitL / 2 - 3, unitD / 2 - 3)
        ctx.strokeStyle = effectiveIsDark ? "#38bdf8" : "#0284c7"
        ctx.lineWidth = 1.2
        ctx.stroke()

        // LED Indicator Hijau
        ctx.beginPath()
        ctx.arc(unitL / 2 - 4.5, -unitD / 2 + 4, 1.6, 0, Math.PI * 2)
        ctx.fillStyle = "#10b981"
        ctx.fill()

        ctx.restore()

        // Teks Label (AC1, AC2, AC3) berotasi sesuai orientasi dinding
        ctx.save()
        ctx.translate(cAcX, cAcY)
        ctx.rotate(textAngle)
        ctx.font = isDraggingThisAc ? "bold 9px sans-serif" : "bold 8px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        ctx.strokeStyle = bgFill
        ctx.lineWidth = 2
        ctx.lineJoin = "round"
        ctx.strokeText(`AC${idx + 1}`, 0, 0)

        ctx.fillStyle = isDraggingThisAc ? "#38bdf8" : (effectiveIsDark ? "#ffffff" : "#0f172a")
        ctx.fillText(`AC${idx + 1}`, 0, 0)
        ctx.restore()
      })

      // 10. Render CAD Dimension Lines Per Segmen Dinding (Rantai Dimensi Arsitektural Tanpa Tumpang Tindih)
      wallSegments.forEach((wall) => {
        const unitsOnWall = placedUnits
          .filter((u) => u.wallIndex === wall.index)
          .sort((a, b) => a.ratio - b.ratio)

        if (unitsOnWall.length === 0) return

        const p1 = toC(wall.p1)
        const p2 = toC(wall.p2)
        const dx = p2.cx - p1.cx
        const dy = p2.cy - p1.cy
        const len = Math.hypot(dx, dy)
        if (len === 0) return

        const uX = dx / len
        const uY = dy / len

        // Normal vector menghadap ke dalam ruangan toko
        let normX = -dy / len
        let normY = dx / len
        const midWallX = (wall.p1.x + wall.p2.x) / 2
        const midWallY = (wall.p1.y + wall.p2.y) / 2
        if (normX * (centroidX - midWallX) + normY * (centroidY - midWallY) < 0) {
          normX = -normX
          normY = -normY
        }

        const wallAngle = Math.atan2(dy, dx)
        let textAngle = wallAngle
        if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
          textAngle += Math.PI
        }

        const rawWallLen = segmentLengths[wall.index]
        const wallLengthM =
          rawWallLen !== undefined && rawWallLen !== ""
            ? parseFloat(String(rawWallLen)) || Math.hypot(wall.p2.x - wall.p1.x, wall.p2.y - wall.p1.y)
            : Math.hypot(wall.p2.x - wall.p1.x, wall.p2.y - wall.p1.y)

        const dimOffset = 22

        // Rantai titik dimensi [T_start, AC_1, AC_2, ..., T_end]
        const chainPoints: {
          origCanvas: { cx: number; cy: number }
          dimCanvas: { cx: number; cy: number }
          ratio: number
          isUnit: boolean
          unitId?: string
        }[] = []

        chainPoints.push({
          origCanvas: { cx: p1.cx, cy: p1.cy },
          dimCanvas: { cx: p1.cx + normX * dimOffset, cy: p1.cy + normY * dimOffset },
          ratio: 0,
          isUnit: false,
        })

        unitsOnWall.forEach((u) => {
          const acX = wall.p1.x + (wall.p2.x - wall.p1.x) * u.ratio
          const acY = wall.p1.y + (wall.p2.y - wall.p1.y) * u.ratio
          const cAcX = sc.offX + acX * sc.scale
          const cAcY = sc.offY + acY * sc.scale

          chainPoints.push({
            origCanvas: { cx: cAcX, cy: cAcY },
            dimCanvas: { cx: cAcX + normX * dimOffset, cy: cAcY + normY * dimOffset },
            ratio: u.ratio,
            isUnit: true,
            unitId: u.id,
          })
        })

        chainPoints.push({
          origCanvas: { cx: p2.cx, cy: p2.cy },
          dimCanvas: { cx: p2.cx + normX * dimOffset, cy: p2.cy + normY * dimOffset },
          ratio: 1,
          isUnit: false,
        })

        ctx.save()

        // 1. Extension Witness Lines (Garis bantu putus-putus dari tepi dinding/bodi ke garis ukur)
        ctx.strokeStyle = effectiveIsDark ? "rgba(56, 189, 248, 0.4)" : "rgba(2, 132, 199, 0.4)"
        ctx.lineWidth = 0.9
        ctx.setLineDash([2, 2])

        chainPoints.forEach((cp) => {
          // Jika titik as AC, mulai garis bantu dari sisi luar bodi AC agar tidak memotong bodi & teks label
          const startX = cp.isUnit ? cp.origCanvas.cx + normX * 7.5 : cp.origCanvas.cx
          const startY = cp.isUnit ? cp.origCanvas.cy + normY * 7.5 : cp.origCanvas.cy

          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(cp.dimCanvas.cx, cp.dimCanvas.cy)
          ctx.stroke()
        })
        ctx.setLineDash([])

        // 2. Garis Ukur Dimensi Rantai (Continuous CAD Dimension Line)
        ctx.strokeStyle = effectiveIsDark ? "#38bdf8" : "#0284c7"
        ctx.lineWidth = 1.3
        ctx.beginPath()
        ctx.moveTo(chainPoints[0].dimCanvas.cx, chainPoints[0].dimCanvas.cy)
        ctx.lineTo(chainPoints[chainPoints.length - 1].dimCanvas.cx, chainPoints[chainPoints.length - 1].dimCanvas.cy)
        ctx.stroke()

        // 3. CAD Intersection Tick Marks (Standard Architectural 45° Slash Ticks)
        const slashLen = 5
        const slashUx = (uX + normX) * 0.7071
        const slashUy = (uY + normY) * 0.7071

        chainPoints.forEach((cp) => {
          const x = cp.dimCanvas.cx
          const y = cp.dimCanvas.cy
          const isUnitCenter = cp.isUnit

          // 45° architectural oblique slash tick
          ctx.beginPath()
          ctx.moveTo(x - slashUx * slashLen, y - slashUy * slashLen)
          ctx.lineTo(x + slashUx * slashLen, y + slashUy * slashLen)
          ctx.strokeStyle = isUnitCenter ? "#10b981" : (effectiveIsDark ? "#38bdf8" : "#0284c7")
          ctx.lineWidth = isUnitCenter ? 2.2 : 1.5
          ctx.stroke()

          // Crisp center junction dot
          ctx.beginPath()
          ctx.arc(x, y, isUnitCenter ? 3 : 2, 0, Math.PI * 2)
          ctx.fillStyle = isUnitCenter ? "#10b981" : (effectiveIsDark ? "#38bdf8" : "#0284c7")
          ctx.fill()
          ctx.strokeStyle = bgFill
          ctx.lineWidth = 1
          ctx.stroke()
        })

        // 4. Teks Dimensi per segmen rantai (Arsitektural CAD Bersih Tanpa Tabrakan Panah)
        ctx.font = "bold 8.5px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        for (let j = 0; j < chainPoints.length - 1; j++) {
          const cpA = chainPoints[j]
          const cpB = chainPoints[j + 1]

          const segmentDistM = Number(((cpB.ratio - cpA.ratio) * wallLengthM).toFixed(2))
          if (segmentDistM > 0.2) {
            const midSegX = (cpA.dimCanvas.cx + cpB.dimCanvas.cx) / 2
            const midSegY = (cpA.dimCanvas.cy + cpB.dimCanvas.cy) / 2

            ctx.save()
            ctx.translate(midSegX, midSegY)
            ctx.rotate(textAngle)

            const dimText = `${formatDim(segmentDistM)}m`
            const textMetrics = ctx.measureText(dimText)
            const padX = 3
            const padY = 2

            // Pill background to clearly separate dimension text from dimension line
            ctx.fillStyle = bgFill
            ctx.fillRect(
              -textMetrics.width / 2 - padX,
              -5 - padY,
              textMetrics.width + padX * 2,
              10 + padY * 2
            )

            ctx.fillStyle = effectiveIsDark ? "#38bdf8" : "#0284c7"
            ctx.fillText(dimText, 0, 0)
            ctx.restore()
          }
        }

        ctx.restore()
      })
    }
  }, [customClosed, customPts, isDark, wallSegments, segmentLengths, isCalculated, placedUnits, activeSnapGuides, activeDragIdx, activeDragAcId, selectedNodeIdx, hoverEdge, cursorPos, pendingZoneStart, activeTool])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // ─── 13. Export Denah Handler ─────────────────────────────────────────────
  const handleExportPng = async () => {
    if (isSaving || !isCalculated || placedUnits.length === 0) return

    // Ambil snapshot bersih langsung dari canvas asli (menjamin bentuk & proporsi 100% identik dengan tampilan di web)
    const canvas = canvasRef.current
    let snapshotUrl: string | null = null
    if (canvas) {
      try {
        // 1. Render mode light (latar putih bersih) untuk hasil card download
        drawCanvas(canvas, true)
        snapshotUrl = canvas.toDataURL("image/png")
        // 2. Kembalikan ke tema pengguna saat ini
        drawCanvas(canvas, false)
      } catch (err) {
        console.error("Gagal capture snapshot canvas:", err)
        snapshotUrl = canvas.toDataURL("image/png")
      }
    }

    // Siapkan rincian legenda jarak per unit
    const unitDetails = placedUnits.map((unit, idx) => {
      const wall = wallSegments.find((w) => w.index === unit.wallIndex)
      const rawWallLen = wall ? segmentLengths[wall.index] : undefined
      const wallLengthM =
        wall && rawWallLen !== undefined && rawWallLen !== ""
          ? parseFloat(String(rawWallLen)) || Math.hypot(wall.p2.x - wall.p1.x, wall.p2.y - wall.p1.y)
          : wall
            ? Math.hypot(wall.p2.x - wall.p1.x, wall.p2.y - wall.p1.y)
            : 0

      const startNode = `T${(wall?.index ?? 0) + 1}`
      const endNode = `T${(((wall?.index ?? 0) + 1) % (customPts.length || 1)) + 1}`
      const distStart = Number((unit.ratio * wallLengthM).toFixed(2))
      const distEnd = Number(((1 - unit.ratio) * wallLengthM).toFixed(2))

      return {
        name: `AC ${idx + 1}`,
        wallLabel: `Dinding ${startNode}-${endNode}`,
        wallLengthM,
        startNode,
        endNode,
        fromStart: formatDim(distStart),
        toEnd: formatDim(distEnd),
      }
    })

    const cardData: AcMappingResultCardData = {
      storeCode: storeMode === "existing" ? selectedStore?.code || "TOKO" : newStoreCode || "TOKO-BARU",
      storeName: storeMode === "existing" ? selectedStore?.name || "Toko Retail" : newStoreName || "Toko Baru",
      storeBranch: storeMode === "existing" ? selectedStore?.branch || "—" : newStoreBranch || "—",
      area: effectiveArea,
      temp: calculatedTemp,
      btuPerM2: targetBtuPerM2,
      totalBtu: totalBtuRequired,
      acUnits: placedUnits.length,
      layoutSnapshot: snapshotUrl,
      placedUnits: unitDetails,
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
          link.download = generateCalculationFilename({
            prefix: "mapping-ac",
            store: {
              code: cardData?.storeCode,
              name: cardData?.storeName,
              branch: cardData?.storeBranch,
            },
          })
          link.href = blobUrl
          link.click()

          toast.success("Denah Layout AC berhasil diunduh!")

          setTimeout(() => {
            URL.revokeObjectURL(blobUrl)
          }, 100)
        }
      } catch (err) {
        console.error(err)
        toast.error("Gagal mengekspor denah gambar.")
      } finally {
        setIsSaving(false)
      }
    }, 150)
  }

  const currentStoreDisplayName = (storeMode === "existing" ? selectedStore?.name : newStoreName) || "Toko Retail Sparta"

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md md:max-w-5xl lg:max-w-7xl flex-col bg-background px-4 md:px-6 lg:px-8 pb-32">
      <Header
        variant="dashboard-back"
        title="Mapping & Layout AC"
        subtitle="Kalkulator Pemetaan Tata Letak AC Daikin 2 PK"
        badge={AC_MAPPING_VERSION}
        backHref="/dashboard"
        className="px-0"
      />

      <main className="mt-2 space-y-6">
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
              className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all cursor-pointer ${storeMode === "existing"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Toko Terdaftar
            </button>
            <button
              type="button"
              onClick={() => setStoreMode("new")}
              className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all cursor-pointer ${storeMode === "new"
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
                    placeholder="Pilih toko..."
                    className="h-8 text-xs rounded-md"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Interactive Canvas & Tool Palette (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border-border/80 shadow-xs rounded-2xl overflow-hidden">
              <CardHeader className="py-2.5 px-4 bg-muted/20 border-b flex flex-row items-center justify-between gap-3 min-h-[56px]">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 truncate">
                    <IconAirConditioning className="size-4 text-sky-500 shrink-0" />
                    <span className="truncate">Kanvas Denah Ruangan</span>
                  </CardTitle>
                  <CardDescription
                    className="text-xs truncate text-muted-foreground"
                    title={
                      isCalculated
                        ? "Denah terkunci dalam mode Hasil AC. Geser posisi unit AC di dinding untuk fine-tune."
                        : activeTool === "DOOR_P1"
                          ? "Mode Pintu P1 Gudang (1.0m Baku): Klik pada dinding untuk memasang pintu selebar 1 meter."
                          : activeTool === "CHILLER"
                            ? `Mode Chiller (${chillerUnits} Unit - ${formatDim(chillerUnits * 1.2)}m): Klik pada dinding untuk memasang modul chiller.`
                            : pendingZoneStart
                              ? `Titik awal ${pendingZoneStart.tool === "DOOR" ? "Pintu/Kaca" : "Kasir"} aktif! Klik Titik Akhir di dinding.`
                              : activeTool === "DRAW"
                                ? "Klik kanvas untuk menambah sudut, klik T1 untuk menutup."
                                : `Mode ${activeTool === "CASHIER" ? "Kasir 🛒" : "Pintu/Kaca 🚪"}: Klik Titik Awal & Akhir di dinding.`
                    }
                  >
                    {isCalculated
                      ? "🔒 Denah terkunci. Geser unit AC di dinding untuk fine-tune jarak."
                      : activeTool === "DOOR_P1"
                        ? "🚪 Mode Pintu P1 (1.0m Baku): Klik dinding untuk memasang."
                        : activeTool === "CHILLER"
                          ? `🧊 Mode Chiller (${chillerUnits} Unit - ${formatDim(chillerUnits * 1.2)}m): Klik dinding untuk memasang.`
                          : pendingZoneStart
                            ? `⚠️ Titik awal ${pendingZoneStart.tool === "DOOR" ? "Pintu/Kaca" : "Kasir"} aktif. Klik Titik Akhir di dinding.`
                            : activeTool === "DRAW"
                              ? "Klik kanvas untuk menambah sudut, klik T1 untuk menutup."
                              : `Mode ${activeTool === "CASHIER" ? "Kasir 🛒" : "Pintu/Kaca 🚪"}: Klik Titik Awal & Akhir di dinding.`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isCalculated && (
                    <Badge variant="outline" className="border-amber-500/60 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs gap-1 shrink-0">
                      <IconLock className="size-3 text-amber-500" /> Terkunci
                    </Badge>
                  )}
                  <Badge className="bg-sky-600 text-white font-extrabold text-xs whitespace-nowrap shrink-0">
                    {effectiveArea} m² ({customPts.length} Titik)
                  </Badge>
                </div>
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
                      <IconPointer className="size-3.5" /> Denah
                    </Button>

                    <Button
                      size="sm"
                      variant={activeTool === "DOOR" ? "default" : "outline"}
                      onClick={() => {
                        setActiveTool("DOOR")
                        setPendingZoneStart(null)
                      }}
                      className={`h-7 text-xs font-bold gap-1 ${activeTool === "DOOR"
                          ? "bg-orange-500 text-white"
                          : "border-orange-500/40 text-orange-600 dark:text-orange-400 bg-orange-500/10"
                        }`}
                      title="Pintu / Kaca (Ukuran Bebas)"
                    >
                      <IconDoor className="size-3.5" /> Pintu / Kaca
                    </Button>

                    <Button
                      size="sm"
                      variant={activeTool === "DOOR_P1" ? "default" : "outline"}
                      onClick={() => {
                        setActiveTool("DOOR_P1")
                        setPendingZoneStart(null)
                      }}
                      className={`h-7 text-xs font-bold gap-1 ${activeTool === "DOOR_P1"
                          ? "bg-rose-600 text-white"
                          : "border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10"
                        }`}
                      title="Pintu P1 Gudang (Ukuran Baku 1.0m)"
                    >
                      <IconDoor className="size-3.5" /> Pintu P1 (1m)
                    </Button>

                    <Button
                      size="sm"
                      variant={activeTool === "CASHIER" ? "default" : "outline"}
                      onClick={() => {
                        setActiveTool("CASHIER")
                        setPendingZoneStart(null)
                      }}
                      className={`h-7 text-xs font-bold gap-1 ${activeTool === "CASHIER"
                          ? "bg-amber-500 text-white"
                          : "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                        }`}
                    >
                      <IconShoppingCart className="size-3.5" /> Kasir
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant={activeTool === "CHILLER" ? "default" : "outline"}
                        onClick={() => {
                          setActiveTool("CHILLER")
                          setPendingZoneStart(null)
                        }}
                        className={`h-7 text-xs font-bold gap-1 ${activeTool === "CHILLER"
                            ? "bg-cyan-500 text-white"
                            : "border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10"
                          }`}
                      >
                        <IconFridge className="size-3.5" /> Chiller
                      </Button>

                      {activeTool === "CHILLER" && (
                        <div className="flex items-center bg-cyan-500/15 border border-cyan-500/40 rounded-lg p-0.5 animate-in fade-in zoom-in-95">
                          <button
                            type="button"
                            disabled={chillerUnits <= 1}
                            onClick={() => setChillerUnits((prev) => Math.max(1, prev - 1))}
                            className="size-6 rounded flex items-center justify-center text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-30 disabled:hover:bg-transparent font-bold text-xs cursor-pointer"
                            title="Kurangi unit chiller (-1.2m)"
                          >
                            -
                          </button>
                          <span className="text-[11px] font-bold text-cyan-900 dark:text-cyan-100 px-1.5 font-mono whitespace-nowrap">
                            {chillerUnits} Unit ({formatDim(chillerUnits * 1.2)}m)
                          </span>
                          <button
                            type="button"
                            disabled={chillerUnits >= 8}
                            onClick={() => setChillerUnits((prev) => Math.min(8, prev + 1))}
                            className="size-6 rounded flex items-center justify-center text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-30 disabled:hover:bg-transparent font-bold text-xs cursor-pointer"
                            title="Tambah unit chiller (+1.2m)"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>

                    {pendingZoneStart && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPendingZoneStart(null)}
                        className="h-7 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 gap-1 px-2 border border-red-500/30"
                        title="Batalkan penandaan (Esc)"
                      >
                        <IconX className="size-3.5" /> Batal (Esc)
                      </Button>
                    )}

                    {isCalculated && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsCalculated(false)
                          setPlacedUnits([])
                          toast.info("Mode Edit Denah aktif. Anda sekarang dapat mengubah sudut & ukuran toko.")
                        }}
                        className="h-7 text-xs font-bold gap-1 border-sky-500/50 text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20"
                        title="Edit bentuk denah dan titik sudut"
                      >
                        <IconEdit className="size-3.5 text-sky-500" /> Edit Denah
                      </Button>
                    )}
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

                {/* Canvas Viewport (100% Bersih Tanpa Overlay Apapun) */}
                <div className="relative w-full h-[340px] rounded-2xl border border-border/80 bg-slate-900/5 dark:bg-slate-950/40 overflow-hidden flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handleCanvasPointerDown}
                    onPointerMove={handleCanvasPointerMove}
                    onPointerUp={handleCanvasPointerUp}
                    onPointerLeave={handleCanvasPointerLeave}
                    className={`w-full h-full touch-none select-none block ${activeDragAcId !== null || activeDragIdx !== null
                        ? "cursor-grabbing"
                        : "cursor-crosshair"
                      }`}
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
                      className={`h-7 text-[11px] font-semibold transition-all ${selectedNodeIdx !== null
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
                                <option value="GLASS_DOOR">🚪 Pintu / Kaca</option>
                                <option value="DOOR_P1">🚪 Pintu P1 (1.0m)</option>
                                <option value="CASHIER">🛒 Kasir</option>
                                <option value="CHILLER">🧊 Chiller</option>
                              </select>
                            </div>

                            {currentType === "SOLID" && (typeof len === "number" || typeof len === "string") && (parseFloat(String(len)) || 0) > 0 && (parseFloat(String(len)) || 0) < AC_INDOOR_WIDTH_M && (
                              <div className="text-[9.5px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 pt-0.5">
                                <span>⚠️ Sempit (&lt; 1.05m, tidak muat AC Daikin 2 PK)</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
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

                {/* Legenda Detail Jarak Posisi AC (Patokan As Tengah AC) */}
                {isCalculated && placedUnits.length > 0 && (
                  <div className="p-3 rounded-xl border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-foreground">
                        <IconRuler className="size-3.5 text-sky-500" />
                        Legenda Jarak Posisi AC
                      </span>
                      <Badge variant="outline" className="text-[9px] font-mono">
                        As Tengah AC
                      </Badge>
                    </div>

                    <div className="space-y-2 divide-y divide-border/60">
                      {placedUnits.map((unit, idx) => {
                        const wall = wallSegments.find((w) => w.index === unit.wallIndex)
                        if (!wall) return null

                        const rawWallLen = segmentLengths[wall.index]
                        const wallLengthM =
                          rawWallLen !== undefined && rawWallLen !== ""
                            ? parseFloat(String(rawWallLen)) ||
                            Math.hypot(wall.p2.x - wall.p1.x, wall.p2.y - wall.p1.y)
                            : Math.hypot(wall.p2.x - wall.p1.x, wall.p2.y - wall.p1.y)

                        const startNode = `T${wall.index + 1}`
                        const endNode = `T${((wall.index + 1) % customPts.length) + 1}`
                        const distStart = Number((unit.ratio * wallLengthM).toFixed(2))
                        const distEnd = Number(((1 - unit.ratio) * wallLengthM).toFixed(2))

                        return (
                          <div key={unit.id || idx} className="pt-2 first:pt-0 space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sky-600 dark:text-sky-400">
                                AC {idx + 1} (Daikin 2 PK)
                              </span>
                              <span className="text-muted-foreground font-mono text-[10px]">
                                Dinding {startNode} - {endNode} ({formatDim(wallLengthM)}m)
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                              <div className="p-1.5 rounded-lg bg-card border border-border/60 flex flex-col">
                                <span className="text-[9px] text-muted-foreground">
                                  Dari Sudut {startNode}
                                </span>
                                <span className="font-mono font-bold text-foreground">
                                  {formatDim(distStart)} meter
                                </span>
                              </div>
                              <div className="p-1.5 rounded-lg bg-card border border-border/60 flex flex-col">
                                <span className="text-[9px] text-muted-foreground">
                                  Ke Sudut {endNode}
                                </span>
                                <span className="font-mono font-bold text-foreground">
                                  {formatDim(distEnd)} meter
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Tombol Unduh Hasil di Bagian Akhir (Sama Seperti Kalkulator Lampu & AC) */}
                <Button
                  type="button"
                  onClick={handleExportPng}
                  disabled={!isCalculated || placedUnits.length === 0 || isSaving}
                  className="w-full h-9 text-xs font-semibold"
                >
                  <IconDownload className="mr-1.5 size-4" />
                  {isSaving ? "Menyiapkan Gambar..." : "Unduh Hasil Denah (.png)"}
                </Button>
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
                <div className="space-y-3">
                  {/* Visual Guide Diagram */}
                  <div className="bg-slate-50 dark:bg-[#0c0d12] border border-border/70 rounded-xl p-2.5 flex flex-col items-center justify-center">
                    <svg width="200" height="90" viewBox="0 0 200 90" className="block">
                      <rect x="40" y="24" width="120" height="48" fill="rgba(56,189,248,0.06)" stroke="#0284c7" strokeWidth="1.5" rx="3" />
                      <text x="100" y="52" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0284c7">Area Toko Efektif</text>

                      {/* LT Arrow */}
                      <line x1="40" y1="14" x2="160" y2="14" stroke="#0284c7" strokeWidth="1.3" />
                      <polygon points="40,14 45,11 45,17" fill="#0284c7" />
                      <polygon points="160,14 155,11 155,17" fill="#0284c7" />
                      <text x="100" y="10" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0284c7">Lebar Toko (LT)</text>

                      {/* PT Arrow */}
                      <line x1="26" y1="24" x2="26" y2="72" stroke="#7c3aed" strokeWidth="1.3" />
                      <polygon points="26,24 23,29 29,29" fill="#7c3aed" />
                      <polygon points="26,72 23,67 29,67" fill="#7c3aed" />
                      <text x="20" y="48" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#7c3aed" transform="rotate(-90, 20, 48)">Panjang Toko (PT)</text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="rect_lebar" className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                        Lebar Toko (LT)
                      </Label>
                      <div className="relative">
                        <Input
                          id="rect_lebar"
                          type="number"
                          value={presetRect.lebar}
                          onChange={(e) => setPresetRect((p) => ({ ...p, lebar: e.target.value }))}
                          className="h-8 text-xs pr-6 font-semibold font-mono"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="rect_panjang" className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                        Panjang Toko (PT)
                      </Label>
                      <div className="relative">
                        <Input
                          id="rect_panjang"
                          type="number"
                          value={presetRect.panjang}
                          onChange={(e) => setPresetRect((p) => ({ ...p, panjang: e.target.value }))}
                          className="h-8 text-xs pr-6 font-semibold font-mono"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Visual Guide Diagram (Denah L) */}
                  <div className="bg-slate-50 dark:bg-[#0c0d12] border border-border/70 rounded-xl p-2.5 flex flex-col items-center justify-center">
                    <svg width="220" height="115" viewBox="0 0 220 115" className="block">
                      <path d="M 45 22 L 150 22 L 150 58 L 100 58 L 100 94 L 45 94 Z" fill="rgba(56,189,248,0.06)" stroke="#0284c7" strokeWidth="1.5" />
                      <text x="72" y="48" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#0284c7">Denah Toko L</text>

                      {/* PT (Panjang Total Sisi Kiri) */}
                      <line x1="32" y1="22" x2="32" y2="94" stroke="#7c3aed" strokeWidth="1.2" />
                      <polygon points="32,22 29,27 35,27" fill="#7c3aed" />
                      <polygon points="32,94 29,89 35,89" fill="#7c3aed" />
                      <text x="24" y="58" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#7c3aed" transform="rotate(-90, 24, 58)">Panjang Total (PT)</text>

                      {/* LT (Lebar Total Sisi Atas Penuh) */}
                      <line x1="45" y1="13" x2="150" y2="13" stroke="#0284c7" strokeWidth="1.2" />
                      <polygon points="45,13 50,10 50,16" fill="#0284c7" />
                      <polygon points="150,13 145,10 145,16" fill="#0284c7" />
                      <text x="97" y="9" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#0284c7">Lebar Total (LT)</text>

                      {/* LS (Lebar Badan Bawah / Koridor) */}
                      <line x1="45" y1="103" x2="100" y2="103" stroke="#d97706" strokeWidth="1.2" />
                      <polygon points="45,103 50,100 50,106" fill="#d97706" />
                      <polygon points="100,103 95,100 95,106" fill="#d97706" />
                      <text x="72" y="101" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#d97706">Lebar Sayap / Bawah (LS)</text>

                      {/* PS (Panjang / Tinggi Sayap Kanan-Atas) */}
                      <line x1="160" y1="22" x2="160" y2="58" stroke="#059669" strokeWidth="1.2" />
                      <polygon points="160,22 157,27 163,27" fill="#059669" />
                      <polygon points="160,58 157,53 163,53" fill="#059669" />
                      <text x="169" y="40" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#059669" transform="rotate(90, 169, 40)">Panjang Sayap (PS)</text>
                    </svg>
                    <div className="text-[9.5px] text-muted-foreground text-center mt-1">
                      💡 <b>LT & PT</b> adalah dimensi luar total. <b>LS & PS</b> adalah dimensi potongan badan sayap (LS &lt; LT, PS &lt; PT).
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                        Panjang Total (PT)
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={presetL.p}
                          onChange={(e) => setPresetL((p) => ({ ...p, p: e.target.value }))}
                          className="h-8 text-xs pr-6 font-semibold font-mono"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                        Lebar Total (LT)
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={presetL.l}
                          onChange={(e) => setPresetL((p) => ({ ...p, l: e.target.value }))}
                          className="h-8 text-xs pr-6 font-semibold font-mono"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                        Lebar Sayap / Bawah (LS)
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={presetL.w}
                          onChange={(e) => setPresetL((p) => ({ ...p, w: e.target.value }))}
                          className="h-8 text-xs pr-6 font-semibold font-mono"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Panjang Sayap (PS)
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={presetL.h}
                          onChange={(e) => setPresetL((p) => ({ ...p, h: e.target.value }))}
                          className="h-8 text-xs pr-6 font-semibold font-mono"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">m</span>
                      </div>
                    </div>
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

        {/* Hidden Standarized Result Card for Image Capture (Sama Persis Kalkulator Lampu & AC) */}
        {exportCardData && (
          <AcMappingResultCard cardRef={exportCardRef} data={exportCardData} />
        )}
      </main>
    </div>
  )
}
