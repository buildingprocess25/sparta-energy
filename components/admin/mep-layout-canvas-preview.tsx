"use client"

import React, { useEffect, useRef, useState } from "react"
import { Point, calcPolygonArea, isPointInsidePolygon, getWallInwardNormal } from "@/lib/polygon-utils"
import {
  placeLamps,
  calcIregular,
  calcLampRange,
  offsetPolygon,
  LAMP_LEN,
  LAMP_WATT,
  LAMP_TUBE_W,
  MIN_RATIO,
  MAX_RATIO,
} from "@/lib/lamp-calculator"

// Konstanta Arsitektural Sesuai Standar Retail & MEP Simulator
const AC_INDOOR_WIDTH_M = 1.05
const AC_INDOOR_DEPTH_M = 0.32
const CHILLER_DEPTH_M = 0.8
const CASHIER_DEPTH_DEFAULT_M = 2.0
const DOOR_MAIN_WIDTH_M = 1.8
const DOOR_P1_WIDTH_M = 1.0

type WallType = "SOLID" | "GLASS_DOOR" | "DOOR_MAIN" | "DOOR_P1" | "CASHIER" | "CHILLER"

interface WallSegment {
  index: number
  p1: Point
  p2: Point
  lengthM: number
  type: WallType
  chillerSide?: "OUTSIDE" | "INSIDE"
}

interface StorePillar {
  id: string
  x: number
  y: number
  widthM: number
  lengthM: number
  label?: string
}

interface PlacedAcUnit {
  id?: string
  wallIndex: number
  ratio: number
  customName?: string
}

interface ScaleInfo {
  scale: number
  offX: number
  offY: number
  minX: number
  minY: number
  maxX: number
  maxY: number
  rW: number
  rH: number
}

function formatDim(val: number): string {
  return (Math.round(val * 100) / 100).toFixed(2)
}

function getStoreScaleInfo(
  pts: Point[],
  canvasW: number,
  canvasH: number,
  wallSegments?: WallSegment[]
): ScaleInfo {
  if (!pts || !pts.length) {
    return { scale: 20, offX: 45, offY: 45, minX: 0, minY: 0, maxX: 10, maxY: 10, rW: 10, rH: 10 }
  }

  const allPts: Point[] = pts.map((p) => ({ ...p }))

  // Sertakan offset fixture chiller luar jika ada
  if (wallSegments && wallSegments.length > 0) {
    wallSegments.forEach((w) => {
      if (w.type === "CHILLER" && w.chillerSide === "OUTSIDE") {
        const inNorm = getWallInwardNormal(w.p1, w.p2, pts)
        allPts.push({ x: w.p1.x - inNorm.nx * CHILLER_DEPTH_M, y: w.p1.y - inNorm.ny * CHILLER_DEPTH_M })
        allPts.push({ x: w.p2.x - inNorm.nx * CHILLER_DEPTH_M, y: w.p2.y - inNorm.ny * CHILLER_DEPTH_M })
      }
    })
  }

  const xs = allPts.map((p) => p.x)
  const ys = allPts.map((p) => p.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const rW = maxX - minX || 1
  const rH = maxY - minY || 1

  // Margin lega agar dimensi dan label dinding tidak terpotong
  const padLeft = 45
  const padRight = 45
  const padTop = 45
  const padBottom = 45
  const availW = Math.max(60, canvasW - padLeft - padRight)
  const availH = Math.max(60, canvasH - padTop - padBottom)

  const s = Math.min(availW / rW, availH / rH)
  return {
    scale: s,
    offX: padLeft + (availW - rW * s) / 2 - minX * s,
    offY: padTop + (availH - rH * s) / 2 - minY * s,
    minX,
    minY,
    maxX,
    maxY,
    rW,
    rH,
  }
}

/**
 * Calculates the maximum safe depth into the room before hitting facing opposite walls
 */
function getMaxInwardDepth(p1: Point, p2: Point, inNorm: { nx: number; ny: number }, polygon: Point[]): number {
  const N = polygon.length
  if (N < 3) return 6.0

  let minHitDist = 25.0
  const rayOrigins: Point[] = [
    p1,
    p2,
    { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
  ]

  for (const origin of rayOrigins) {
    for (let i = 0; i < N; i++) {
      const w1 = polygon[i]
      const w2 = polygon[(i + 1) % N]
      const dx = w2.x - w1.x
      const dy = w2.y - w1.y
      const denom = inNorm.nx * dy - inNorm.ny * dx
      if (Math.abs(denom) > 1e-5) {
        const t = ((w1.x - origin.x) * dy - (w1.y - origin.y) * dx) / denom
        const u = ((w1.x - origin.x) * inNorm.ny - (w1.y - origin.y) * inNorm.nx) / denom
        if (t > 0.08 && u >= -0.01 && u <= 1.01) {
          if (t < minHitDist) {
            minHitDist = t
          }
        }
      }
    }
  }

  return Math.max(0.6, Number(minHitDist.toFixed(2)))
}

/**
 * Constructs a single unified polygon boundary for a continuous chain of cashier segments (1-wall, corner 2-wall, or 3-wall)
 */
function getCashierZonePolygon(rawChain: Point[], depthM: number, polygon: Point[]): Point[] {
  if (!rawChain || rawChain.length < 2) return []

  const chain: Point[] = []
  for (let i = 0; i < rawChain.length; i++) {
    const pt = rawChain[i]
    if (chain.length === 0 || Math.hypot(pt.x - chain[chain.length - 1].x, pt.y - chain[chain.length - 1].y) >= 0.05) {
      chain.push(pt)
    }
  }

  const cleanChain: Point[] = []
  for (let i = 0; i < chain.length; i++) {
    if (i > 0 && i < chain.length - 1) {
      const pPrev = chain[i - 1]
      const pCurr = chain[i]
      const pNext = chain[i + 1]
      const cross = (pCurr.x - pPrev.x) * (pNext.y - pPrev.y) - (pCurr.y - pPrev.y) * (pNext.x - pPrev.x)
      const lenPrev = Math.hypot(pCurr.x - pPrev.x, pCurr.y - pPrev.y)
      const lenNext = Math.hypot(pNext.x - pCurr.x, pNext.y - pCurr.y)
      if (lenPrev > 0.01 && lenNext > 0.01 && Math.abs(cross) / (lenPrev * lenNext) < 0.02) {
        continue
      }
    }
    cleanChain.push(chain[i])
  }

  if (cleanChain.length < 2) return []

  if (cleanChain.length === 2) {
    const p1 = cleanChain[0]
    const p2 = cleanChain[1]
    const n = getWallInwardNormal(p1, p2, polygon)
    const maxD = getMaxInwardDepth(p1, p2, n, polygon)
    const clampedDepth = Math.min(maxD, Math.max(0.6, depthM))
    const p3 = { x: Number((p2.x + clampedDepth * n.nx).toFixed(2)), y: Number((p2.y + clampedDepth * n.ny).toFixed(2)) }
    const p4 = { x: Number((p1.x + clampedDepth * n.nx).toFixed(2)), y: Number((p1.y + clampedDepth * n.ny).toFixed(2)) }
    return [p1, p2, p3, p4]
  }

  if (cleanChain.length === 3) {
    const ptA = cleanChain[0]
    const pc = cleanChain[1]
    const ptB = cleanChain[2]
    const pInner: Point = {
      x: Number((ptA.x + ptB.x - pc.x).toFixed(2)),
      y: Number((ptA.y + ptB.y - pc.y).toFixed(2)),
    }
    return [ptA, pc, ptB, pInner]
  }

  return [...cleanChain]
}

function checkLampObstacle(
  lamp: { x: number; y: number; dir: "h" | "v" },
  lampLenM: number,
  pillars: StorePillar[],
  wallSegments: WallSegment[],
  cashierDepths: Record<number, number>,
  polygon: Point[]
): boolean {
  const half = lampLenM / 2
  const ptStart = lamp.dir === "h" ? { x: lamp.x - half, y: lamp.y } : { x: lamp.x, y: lamp.y - half }
  const ptEnd = lamp.dir === "h" ? { x: lamp.x + half, y: lamp.y } : { x: lamp.x, y: lamp.y + half }
  const ptCenter = { x: lamp.x, y: lamp.y }

  // 1. Cek benturan pilar
  for (const pillar of pillars) {
    const halfW = pillar.widthM / 2 + 0.15
    const halfH = pillar.lengthM / 2 + 0.15
    const minX = pillar.x - halfW, maxX = pillar.x + halfW
    const minY = pillar.y - halfH, maxY = pillar.y + halfH

    const isInside = (p: Point) => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY
    if (isInside(ptCenter) || isInside(ptStart) || isInside(ptEnd)) {
      return true
    }
  }

  // 2. Cek benturan chiller dalam
  for (const wall of wallSegments) {
    if (wall.type === "CHILLER" && wall.chillerSide !== "OUTSIDE") {
      const inNorm = getWallInwardNormal(wall.p1, wall.p2, polygon)
      const chillerPoly = [
        wall.p1,
        wall.p2,
        { x: wall.p2.x + inNorm.nx * CHILLER_DEPTH_M, y: wall.p2.y + inNorm.ny * CHILLER_DEPTH_M },
        { x: wall.p1.x + inNorm.nx * CHILLER_DEPTH_M, y: wall.p1.y + inNorm.ny * CHILLER_DEPTH_M },
      ]
      if (
        isPointInsidePolygon(ptCenter, chillerPoly) ||
        isPointInsidePolygon(ptStart, chillerPoly) ||
        isPointInsidePolygon(ptEnd, chillerPoly)
      ) {
        return true
      }
    }
  }

  // 3. Cek benturan kasir
  for (const wall of wallSegments) {
    if (wall.type === "CASHIER") {
      const depth = cashierDepths[wall.index] || CASHIER_DEPTH_DEFAULT_M
      const inNorm = getWallInwardNormal(wall.p1, wall.p2, polygon)
      const cashierPoly = [
        wall.p1,
        wall.p2,
        { x: wall.p2.x + inNorm.nx * depth, y: wall.p2.y + inNorm.ny * depth },
        { x: wall.p1.x + inNorm.nx * depth, y: wall.p1.y + inNorm.ny * depth },
      ]
      if (
        isPointInsidePolygon(ptCenter, cashierPoly) ||
        isPointInsidePolygon(ptStart, cashierPoly) ||
        isPointInsidePolygon(ptEnd, cashierPoly)
      ) {
        return true
      }
    }
  }

  return false
}

export interface MepFloorPlanCanvasPreviewProps {
  log: any
  activeTab: "ac" | "lighting"
}

export function MepFloorPlanCanvasPreview({ log, activeTab }: MepFloorPlanCanvasPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 720, height: 420 })

  const layout = log.layoutData || {}
  const pts: Point[] = Array.isArray(layout.customPts) ? layout.customPts : []
  const placedUnits: PlacedAcUnit[] = Array.isArray(layout.placedUnits) ? layout.placedUnits : []
  const pillars: StorePillar[] = Array.isArray(layout.pillars) ? layout.pillars : []
  const overrides: Record<number, WallType> = layout.segmentOverrides || {}
  const cashierDepths: Record<number, number> = layout.cashierDepths || {}
  const chillerAlignments: Record<number, "OUTSIDE" | "INSIDE"> = layout.chillerAlignments || {}

  const lampWatt = Number(layout.lighting?.lampWatt || log.lampWatt || 16)
  const lampLen = Number(layout.lighting?.lampLen || LAMP_LEN)
  const lampOrient: "h" | "v" = layout.lighting?.lampOrient === "v" ? "v" : "h"
  const lampSpasi = Number(layout.lighting?.lampSpasi || 0)
  const irregDisabledLamps = new Set<string>(
    Array.isArray(layout.lighting?.irregDisabledLamps) ? layout.lighting.irregDisabledLamps : []
  )

  // Tangani Resize responsif
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width)
        const h = Math.floor(entry.contentRect.height)
        if (w > 0 && h > 0) {
          setDimensions({ width: w, height: h })
        } else if (w > 0) {
          const calculatedH = Math.min(640, Math.max(420, Math.floor(w * 0.6)))
          setDimensions({ width: w, height: calculatedH })
        }
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Canvas Drawing Routine (Identik dengan Engine Simulator)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || pts.length < 3) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
    const W = dimensions.width
    const H = dimensions.height

    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.resetTransform?.()
    ctx.scale(dpr, dpr)

    // 1. Blueprint Dark Background
    ctx.fillStyle = "#070d19"
    ctx.fillRect(0, 0, W, H)

    // Grid Blueprint Halus
    ctx.save()
    ctx.strokeStyle = "rgba(30, 41, 59, 0.45)"
    ctx.lineWidth = 0.6
    const gridSize = 24
    for (let x = 0; x <= W; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.stroke()
    }
    for (let y = 0; y <= H; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }
    ctx.restore()

    // 2. Susun Wall Segments
    const n = pts.length
    const wallSegments: WallSegment[] = pts.map((p1, i) => {
      const p2 = pts[(i + 1) % n]
      const lengthM = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      const type = overrides[i] || "SOLID"
      return {
        index: i,
        p1,
        p2,
        lengthM,
        type,
        chillerSide: type === "CHILLER" ? chillerAlignments[i] || "INSIDE" : undefined,
      }
    })

    // Skala & Offset Auto-Fit
    const sc = getStoreScaleInfo(pts, W, H, wallSegments)
    const toC = (pt: Point) => ({
      cx: sc.offX + pt.x * sc.scale,
      cy: sc.offY + pt.y * sc.scale,
    })

    const sPts = pts.map(toC)
    const centroidX = pts.reduce((acc, p) => acc + p.x, 0) / pts.length
    const centroidY = pts.reduce((acc, p) => acc + p.y, 0) / pts.length

    // 3. Lantai Toko Poligon (Slate Navy)
    ctx.save()
    ctx.beginPath()
    sPts.forEach((sp, idx) => (idx === 0 ? ctx.moveTo(sp.cx, sp.cy) : ctx.lineTo(sp.cx, sp.cy)))
    ctx.closePath()
    ctx.fillStyle = "#1e293b"
    ctx.fill()
    ctx.restore()

    // 4. Volumetrik Fixture Area Kasir (Rantai Kontigu Kasir Tunggal tanpa Duplikat)
    const cashierSegments = wallSegments.filter((w) => w.type === "CASHIER")
    if (cashierSegments.length > 0) {
      const cashierChains: WallSegment[][] = []
      let currentChain: WallSegment[] = []

      cashierSegments.forEach((w) => {
        if (currentChain.length === 0) {
          currentChain.push(w)
        } else {
          const prev = currentChain[currentChain.length - 1]
          if (w.index === (prev.index + 1) % n) {
            currentChain.push(w)
          } else {
            cashierChains.push(currentChain)
            currentChain = [w]
          }
        }
      })

      if (currentChain.length > 0) {
        if (
          cashierChains.length > 0 &&
          (currentChain[currentChain.length - 1].index + 1) % n === cashierChains[0][0].index
        ) {
          cashierChains[0] = [...currentChain, ...cashierChains[0]]
        } else {
          cashierChains.push(currentChain)
        }
      }

      cashierChains.forEach((chain) => {
        const chainPts: Point[] = [chain[0].p1]
        let totalLenM = 0
        chain.forEach((w) => {
          chainPts.push(w.p2)
          totalLenM += w.lengthM
        })

        const avgDepth =
          cashierDepths[chain[0].index] !== undefined
            ? cashierDepths[chain[0].index]
            : CASHIER_DEPTH_DEFAULT_M

        const zonePoly = getCashierZonePolygon(chainPts, avgDepth, pts)
        const canvasPoly = zonePoly.map(toC)

        if (canvasPoly.length >= 3) {
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(canvasPoly[0].cx, canvasPoly[0].cy)
          for (let k = 1; k < canvasPoly.length; k++) {
            ctx.lineTo(canvasPoly[k].cx, canvasPoly[k].cy)
          }
          ctx.closePath()
          ctx.fillStyle = "rgba(245, 158, 11, 0.22)"
          ctx.fill()

          // Arsir Diagonal ANSI32
          ctx.save()
          ctx.clip()
          ctx.strokeStyle = "rgba(245, 158, 11, 0.40)"
          ctx.lineWidth = 1
          const minCanvasX = Math.min(...canvasPoly.map((p) => p.cx)) - 40
          const maxCanvasX = Math.max(...canvasPoly.map((p) => p.cx)) + 40
          const minCanvasY = Math.min(...canvasPoly.map((p) => p.cy)) - 40
          const maxCanvasY = Math.max(...canvasPoly.map((p) => p.cy)) + 40
          const span = maxCanvasY - minCanvasY + maxCanvasX - minCanvasX
          for (let off = -span; off < span; off += 9) {
            ctx.beginPath()
            ctx.moveTo(minCanvasX + off, minCanvasY)
            ctx.lineTo(minCanvasX + off + (maxCanvasY - minCanvasY), maxCanvasY)
            ctx.stroke()
          }
          ctx.restore()

          // Border Kasir Putus-Putus
          ctx.beginPath()
          ctx.moveTo(canvasPoly[0].cx, canvasPoly[0].cy)
          for (let k = 1; k < canvasPoly.length; k++) {
            ctx.lineTo(canvasPoly[k].cx, canvasPoly[k].cy)
          }
          ctx.closePath()
          ctx.strokeStyle = "#f59e0b"
          ctx.lineWidth = 1.8
          ctx.setLineDash([5, 3])
          ctx.stroke()
          ctx.setLineDash([])

          // Label Kasir Tunggal di Tengah Zona
          const midX = canvasPoly.reduce((sum, p) => sum + p.cx, 0) / canvasPoly.length
          const midY = canvasPoly.reduce((sum, p) => sum + p.cy, 0) / canvasPoly.length
          const cashierDim =
            chainPts.length >= 3
              ? `${formatDim(Math.hypot(chainPts[0].x - chainPts[1].x, chainPts[0].y - chainPts[1].y))}m × ${formatDim(Math.hypot(chainPts[2].x - chainPts[1].x, chainPts[2].y - chainPts[1].y))}m`
              : `${formatDim(totalLenM)}m × ${formatDim(avgDepth)}m`

          ctx.font = "bold 8.5px sans-serif"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.strokeStyle = "rgba(15, 23, 42, 0.90)"
          ctx.lineWidth = 3
          ctx.strokeText("KASIR", midX, midY - 5)
          ctx.fillStyle = "#fbbf24"
          ctx.fillText("KASIR", midX, midY - 5)

          ctx.font = "bold 7px sans-serif"
          ctx.strokeText(cashierDim, midX, midY + 5)
          ctx.fillStyle = "rgba(251, 191, 36, 0.95)"
          ctx.fillText(cashierDim, midX, midY + 5)
          ctx.restore()
        }
      })
    }

    // 5. Volumetrik Fixture Chiller (Arsir ANSI37 + Sekat Modul 1.2m Cyan)
    wallSegments.forEach((wall) => {
      if (wall.type !== "CHILLER") return
      const inNorm = getWallInwardNormal(wall.p1, wall.p2, pts)
      const isOutside = wall.chillerSide === "OUTSIDE"
      const normDir = isOutside ? { nx: -inNorm.nx, ny: -inNorm.ny } : inNorm
      const depthM = CHILLER_DEPTH_M

      const p3 = { x: wall.p2.x + normDir.nx * depthM, y: wall.p2.y + normDir.ny * depthM }
      const p4 = { x: wall.p1.x + normDir.nx * depthM, y: wall.p1.y + normDir.ny * depthM }

      const cp1 = toC(wall.p1)
      const cp2 = toC(wall.p2)
      const cp3 = toC(p3)
      const cp4 = toC(p4)

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cp1.cx, cp1.cy)
      ctx.lineTo(cp2.cx, cp2.cy)
      ctx.lineTo(cp3.cx, cp3.cy)
      ctx.lineTo(cp4.cx, cp4.cy)
      ctx.closePath()
      ctx.fillStyle = "rgba(6, 182, 212, 0.25)"
      ctx.fill()

      // Cross Hatch ANSI37
      ctx.save()
      ctx.clip()
      ctx.strokeStyle = "rgba(6, 182, 212, 0.40)"
      ctx.lineWidth = 1
      const minCanvasX = Math.min(cp1.cx, cp2.cx, cp3.cx, cp4.cx) - 40
      const maxCanvasX = Math.max(cp1.cx, cp2.cx, cp3.cx, cp4.cx) + 40
      const minCanvasY = Math.min(cp1.cy, cp2.cy, cp3.cy, cp4.cy) - 40
      const maxCanvasY = Math.max(cp1.cy, cp2.cy, cp3.cy, cp4.cy) + 40
      const span = maxCanvasY - minCanvasY + maxCanvasX - minCanvasX
      for (let off = -span; off < span; off += 7) {
        ctx.beginPath()
        ctx.moveTo(minCanvasX + off, minCanvasY)
        ctx.lineTo(minCanvasX + off + (maxCanvasY - minCanvasY), maxCanvasY)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(minCanvasX + off, maxCanvasY)
        ctx.lineTo(minCanvasX + off + (maxCanvasY - minCanvasY), minCanvasY)
        ctx.stroke()
      }
      ctx.restore()

      // Sekat Modul per 1.2m
      const uCount = Math.max(1, Math.round(wall.lengthM / 1.2))
      const dx = wall.p2.x - wall.p1.x
      const dy = wall.p2.y - wall.p1.y
      const len = Math.hypot(dx, dy) || 1
      const ux = dx / len
      const uy = dy / len

      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
      ctx.lineWidth = 1.4
      for (let u = 1; u < uCount; u++) {
        const divDist = u * 1.2
        if (divDist < len) {
          const divP1 = { x: wall.p1.x + divDist * ux, y: wall.p1.y + divDist * uy }
          const divP2 = { x: divP1.x + depthM * normDir.nx, y: divP1.y + depthM * normDir.ny }
          const cDiv1 = toC(divP1)
          const cDiv2 = toC(divP2)
          ctx.beginPath()
          ctx.moveTo(cDiv1.cx, cDiv1.cy)
          ctx.lineTo(cDiv2.cx, cDiv2.cy)
          ctx.stroke()
        }
      }

      // Border Cyan
      ctx.beginPath()
      ctx.moveTo(cp1.cx, cp1.cy)
      ctx.lineTo(cp2.cx, cp2.cy)
      ctx.lineTo(cp3.cx, cp3.cy)
      ctx.lineTo(cp4.cx, cp4.cy)
      ctx.closePath()
      ctx.strokeStyle = "#06b6d4"
      ctx.lineWidth = 1.8
      ctx.stroke()

      // Label Chiller
      const frontMidX = (cp3.cx + cp4.cx) / 2 + normDir.nx * 10
      const frontMidY = (cp3.cy + cp4.cy) / 2 + normDir.ny * 10
      const chillerLabel = isOutside ? `R. CHILLER ${uCount}U` : `CHILLER ${uCount}U`
      ctx.font = "bold 8px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.strokeStyle = "rgba(15, 23, 42, 0.90)"
      ctx.lineWidth = 3
      ctx.strokeText(chillerLabel, frontMidX, frontMidY)
      ctx.fillStyle = "#38bdf8"
      ctx.fillText(chillerLabel, frontMidX, frontMidY)
      ctx.restore()
    })

    // 6. Volumetrik Pintu (Pintu Utama 1.8m & Pintu P1 Gudang 1.0m)
    wallSegments.forEach((wall) => {
      const inNorm = getWallInwardNormal(wall.p1, wall.p2, pts)
      const p1C = toC(wall.p1)
      const p2C = toC(wall.p2)

      if (wall.type === "DOOR_MAIN") {
        ctx.save()
        // Bukaan dinding
        ctx.strokeStyle = "#f97316"
        ctx.lineWidth = 3.5
        ctx.setLineDash([6, 3])
        ctx.beginPath()
        ctx.moveTo(p1C.cx, p1C.cy)
        ctx.lineTo(p2C.cx, p2C.cy)
        ctx.stroke()
        ctx.setLineDash([])

        // 2 Daun Pintu & 2 Swing Arc 90° ke dalam
        const midM = { x: (wall.p1.x + wall.p2.x) / 2, y: (wall.p1.y + wall.p2.y) / 2 }
        const leafR = Math.min(0.9, wall.lengthM / 2)
        const t1M = { x: wall.p1.x + leafR * inNorm.nx, y: wall.p1.y + leafR * inNorm.ny }
        const t2M = { x: wall.p2.x + leafR * inNorm.nx, y: wall.p2.y + leafR * inNorm.ny }

        const cMid = toC(midM)
        const cH1 = p1C
        const cH2 = p2C
        const cT1 = toC(t1M)
        const cT2 = toC(t2M)

        const rPx = Math.max(14, leafR * sc.scale)
        ctx.strokeStyle = "#f97316"
        ctx.lineWidth = 1.5
        ctx.setLineDash([3, 2])
        ctx.beginPath()
        ctx.moveTo(cMid.cx, cMid.cy)
        ctx.quadraticCurveTo(
          (cMid.cx + cT1.cx) / 2 + inNorm.nx * (rPx * 0.25),
          (cMid.cy + cT1.cy) / 2 + inNorm.ny * (rPx * 0.25),
          cT1.cx, cT1.cy
        )
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(cMid.cx, cMid.cy)
        ctx.quadraticCurveTo(
          (cMid.cx + cT2.cx) / 2 + inNorm.nx * (rPx * 0.25),
          (cMid.cy + cT2.cy) / 2 + inNorm.ny * (rPx * 0.25),
          cT2.cx, cT2.cy
        )
        ctx.stroke()
        ctx.setLineDash([])

        ctx.lineWidth = 2.4
        ctx.beginPath()
        ctx.moveTo(cH1.cx, cH1.cy)
        ctx.lineTo(cT1.cx, cT1.cy)
        ctx.moveTo(cH2.cx, cH2.cy)
        ctx.lineTo(cT2.cx, cT2.cy)
        ctx.stroke()

        const labelPt = toC({ x: midM.x + (leafR + 0.35) * inNorm.nx, y: midM.y + (leafR + 0.35) * inNorm.ny })
        ctx.font = "bold 8px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.strokeStyle = "rgba(15, 23, 42, 0.90)"
        ctx.lineWidth = 3
        ctx.strokeText("PINTU UTAMA", labelPt.cx, labelPt.cy)
        ctx.fillStyle = "#f97316"
        ctx.fillText("PINTU UTAMA", labelPt.cx, labelPt.cy)
        ctx.restore()
      } else if (wall.type === "DOOR_P1") {
        ctx.save()
        const outNorm = { nx: -inNorm.nx, ny: -inNorm.ny }
        const leafR = Math.min(1.0, wall.lengthM)
        const tM = { x: wall.p1.x + leafR * outNorm.nx, y: wall.p1.y + leafR * outNorm.ny }

        const cH = p1C
        const cT = toC(tM)
        const cArcStart = p2C

        ctx.strokeStyle = "#ea580c"
        ctx.lineWidth = 3.5
        ctx.setLineDash([6, 3])
        ctx.beginPath()
        ctx.moveTo(p1C.cx, p1C.cy)
        ctx.lineTo(p2C.cx, p2C.cy)
        ctx.stroke()
        ctx.setLineDash([])

        const rPx = Math.max(16, leafR * sc.scale)
        ctx.lineWidth = 1.5
        ctx.setLineDash([3, 2])
        ctx.beginPath()
        ctx.moveTo(cArcStart.cx, cArcStart.cy)
        ctx.quadraticCurveTo(
          (cArcStart.cx + cT.cx) / 2 + outNorm.nx * (rPx * 0.25),
          (cArcStart.cy + cT.cy) / 2 + outNorm.ny * (rPx * 0.25),
          cT.cx, cT.cy
        )
        ctx.stroke()
        ctx.setLineDash([])

        ctx.lineWidth = 2.4
        ctx.beginPath()
        ctx.moveTo(cH.cx, cH.cy)
        ctx.lineTo(cT.cx, cT.cy)
        ctx.stroke()

        const labelPt = toC({ x: wall.p1.x + (leafR + 0.35) * outNorm.nx, y: wall.p1.y + (leafR + 0.35) * outNorm.ny })
        ctx.font = "bold 8px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.strokeStyle = "rgba(15, 23, 42, 0.90)"
        ctx.lineWidth = 3
        ctx.strokeText("PINTU GUDANG", labelPt.cx, labelPt.cy)
        ctx.fillStyle = "#ea580c"
        ctx.fillText("PINTU GUDANG", labelPt.cx, labelPt.cy)
        ctx.restore()
      } else if (wall.type === "GLASS_DOOR") {
        ctx.save()
        ctx.strokeStyle = "#06b6d4"
        ctx.lineWidth = 3.5
        ctx.setLineDash([8, 4])
        ctx.beginPath()
        ctx.moveTo(p1C.cx, p1C.cy)
        ctx.lineTo(p2C.cx, p2C.cy)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
      }
    })

    // 7. Render Kolom / Pilar Beton (Arsir Silang Beton X)
    pillars.forEach((pillar, pIdx) => {
      const halfW = pillar.widthM / 2
      const halfH = pillar.lengthM / 2
      const pTopLeft = toC({ x: pillar.x - halfW, y: pillar.y - halfH })
      const pBottomRight = toC({ x: pillar.x + halfW, y: pillar.y + halfH })
      const pCenter = toC({ x: pillar.x, y: pillar.y })
      const colW = Math.max(8, Math.abs(pBottomRight.cx - pTopLeft.cx))
      const colH = Math.max(8, Math.abs(pBottomRight.cy - pTopLeft.cy))

      ctx.save()
      ctx.fillStyle = "rgba(51, 65, 85, 0.85)"
      ctx.fillRect(pTopLeft.cx, pTopLeft.cy, colW, colH)

      // Concrete Hatching
      ctx.save()
      ctx.beginPath()
      ctx.rect(pTopLeft.cx, pTopLeft.cy, colW, colH)
      ctx.clip()
      ctx.strokeStyle = "rgba(148, 163, 184, 0.35)"
      ctx.lineWidth = 0.8
      for (let off = -colH - colW; off < colH + colW; off += 5) {
        ctx.beginPath()
        ctx.moveTo(pTopLeft.cx + off, pTopLeft.cy)
        ctx.lineTo(pTopLeft.cx + off + colH, pTopLeft.cy + colH)
        ctx.stroke()
      }
      ctx.restore()

      // Stroke Border & Label
      ctx.strokeStyle = "#64748b"
      ctx.lineWidth = 1.2
      ctx.strokeRect(pTopLeft.cx, pTopLeft.cy, colW, colH)

      const pLabel = pillar.label || `P${pIdx + 1}`
      ctx.font = "bold 8px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#e2e8f0"
      ctx.fillText(pLabel, pCenter.cx, pCenter.cy)
      ctx.restore()
    })

    // 8. TAB AC: Render Sebaran Hembusan Udara Dingin AC (Radial Wavefronts & Streamlines)
    if (activeTab === "ac" && placedUnits.length > 0) {
      ctx.save()
      // Clip ke poligon lantai agar hembusan rapi di dalam toko
      ctx.beginPath()
      sPts.forEach((sp, idx) => (idx === 0 ? ctx.moveTo(sp.cx, sp.cy) : ctx.lineTo(sp.cx, sp.cy)))
      ctx.closePath()
      ctx.clip()

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
        const throwRadius = Math.max(sc.scale * 6.5, 90)
        const halfSpread = Math.PI / 6 // Sudut 60 derajat

        const uX = dx / len
        const uY = dy / len
        const louverHalfW = 12
        const frontOffset = 5

        const louverMidX = cAcX + nx * frontOffset
        const louverMidY = cAcY + ny * frontOffset
        const angleStart = flowAngle - halfSpread
        const angleEnd = flowAngle + halfSpread
        const pStartX = louverMidX + Math.cos(angleStart) * throwRadius
        const pStartY = louverMidY + Math.sin(angleStart) * throwRadius

        const c1 = { x: cAcX - uX * louverHalfW + nx * frontOffset, y: cAcY - uY * louverHalfW + ny * frontOffset }
        const c2 = { x: cAcX + uX * louverHalfW + nx * frontOffset, y: cAcY + uY * louverHalfW + ny * frontOffset }
        const d1 = Math.hypot(c1.x - pStartX, c1.y - pStartY)
        const d2 = Math.hypot(c2.x - pStartX, c2.y - pStartY)
        const lStart = d1 <= d2 ? c1 : c2
        const lEnd = d1 <= d2 ? c2 : c1

        // Sektor Hembusan Udara Dingin
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

        const coneGrad = ctx.createRadialGradient(louverMidX, louverMidY, 4, louverMidX, louverMidY, throwRadius)
        coneGrad.addColorStop(0, "rgba(56, 189, 248, 0.48)")
        coneGrad.addColorStop(0.35, "rgba(14, 165, 233, 0.26)")
        coneGrad.addColorStop(0.70, "rgba(6, 182, 212, 0.12)")
        coneGrad.addColorStop(1, "rgba(6, 182, 212, 0.0)")
        ctx.fillStyle = coneGrad
        ctx.fill()

        // Gelombang Aliran Udara & Garis Jangkauan (Wavefront Arcs)
        ctx.save()
        // Busur 3m
        ctx.beginPath()
        for (let s = 0; s <= arcSteps; s++) {
          const a = (flowAngle - halfSpread * 0.85) + (s / arcSteps) * (2 * halfSpread * 0.85)
          const px = louverMidX + Math.cos(a) * (throwRadius * 0.45)
          const py = louverMidY + Math.sin(a) * (throwRadius * 0.45)
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
        }
        ctx.strokeStyle = "rgba(56, 189, 248, 0.26)"
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.stroke()

        // Busur 5m
        ctx.beginPath()
        for (let s = 0; s <= arcSteps; s++) {
          const a = (flowAngle - halfSpread * 0.85) + (s / arcSteps) * (2 * halfSpread * 0.85)
          const px = louverMidX + Math.cos(a) * (throwRadius * 0.75)
          const py = louverMidY + Math.sin(a) * (throwRadius * 0.75)
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
        }
        ctx.strokeStyle = "rgba(56, 189, 248, 0.18)"
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.stroke()

        // Busur 6.5m
        ctx.beginPath()
        for (let s = 0; s <= arcSteps; s++) {
          const a = (flowAngle - halfSpread * 0.9) + (s / arcSteps) * (2 * halfSpread * 0.9)
          const px = louverMidX + Math.cos(a) * (throwRadius * 0.96)
          const py = louverMidY + Math.sin(a) * (throwRadius * 0.96)
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
        }
        ctx.strokeStyle = "rgba(56, 189, 248, 0.35)"
        ctx.lineWidth = 1.2
        ctx.setLineDash([5, 3])
        ctx.stroke()

        // Streamlines Radial
        ctx.strokeStyle = "rgba(56, 189, 248, 0.18)"
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
      ctx.restore() // End clip AC

      // Render Bodi Fisik Unit AC Indoor (Daikin 2 PK Proportional)
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

        const wallAngle = Math.atan2(dy, dx)
        let textAngle = wallAngle
        if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
          textAngle += Math.PI
        }

        ctx.save()
        ctx.translate(cAcX, cAcY)
        ctx.rotate(wallAngle)

        const unitL = Math.max(26, AC_INDOOR_WIDTH_M * sc.scale)
        const unitD = Math.max(10, AC_INDOOR_DEPTH_M * sc.scale)

        ctx.fillStyle = "#0f172a"
        ctx.strokeStyle = "#38bdf8"
        ctx.lineWidth = 1.8

        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(-unitL / 2, -unitD / 2, unitL, unitD, 3.5)
        } else {
          ctx.rect(-unitL / 2, -unitD / 2, unitL, unitD)
        }
        ctx.fill()
        ctx.stroke()

        // Louver line
        ctx.beginPath()
        ctx.moveTo(-unitL / 2 + 3, unitD / 2 - 3)
        ctx.lineTo(unitL / 2 - 3, unitD / 2 - 3)
        ctx.strokeStyle = "#38bdf8"
        ctx.lineWidth = 1.2
        ctx.stroke()

        // Green LED Indicator
        ctx.beginPath()
        ctx.arc(unitL / 2 - 4.5, -unitD / 2 + 4, 1.6, 0, Math.PI * 2)
        ctx.fillStyle = "#10b981"
        ctx.fill()
        ctx.restore()

        // Label AC1, AC2...
        ctx.save()
        ctx.translate(cAcX, cAcY)
        ctx.rotate(textAngle)
        ctx.font = "bold 8px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.strokeStyle = "rgba(15, 23, 42, 0.90)"
        ctx.lineWidth = 2.5
        ctx.strokeText(`AC${idx + 1}`, 0, 0)
        ctx.fillStyle = "#ffffff"
        ctx.fillText(`AC${idx + 1}`, 0, 0)
        ctx.restore()
      })
    }

    // 9. TAB LIGHTING: Render Fixture Tabung Lampu & Pendaran Cahaya Nyata
    if (activeTab === "lighting") {
      const areaM2 = log.salesArea || calcPolygonArea(pts)
      const xs = pts.map((p) => p.x)
      const ys = pts.map((p) => p.y)
      const W2 = Math.max(...xs) - Math.min(...xs) || 1
      const H2 = Math.max(...ys) - Math.min(...ys) || 1

      const simResult = calcIregular(areaM2, W2, H2, lampWatt, lampLen)
      const baseBaris = simResult ? simResult.baris : Math.max(1, Math.round(H2 / 1.9) - 1)
      const baseLpb = simResult ? simResult.lampuPerbaris : Math.max(1, Math.floor(W2 / lampLen))
      const usedJarak = H2 / (baseBaris + 1)
      const usedMargin = Math.max(0.2, (W2 - baseLpb * lampLen) / 2)

      const rawLamps = placeLamps(pts, usedJarak, usedMargin, lampOrient, lampLen, lampSpasi, baseBaris, baseLpb)

      // Filter lampu dari rintangan
      const validLamps: { x: number; y: number; dir: "h" | "v" }[] = []
      rawLamps.forEach((lamp) => {
        if (!checkLampObstacle(lamp, lampLen, pillars, wallSegments, cashierDepths, pts)) {
          validLamps.push(lamp)
        }
      })

      // Inset Perimeter Line
      const inset = offsetPolygon(pts, usedMargin)
      if (inset && inset.length >= 3) {
        const sInset = inset.map(toC)
        ctx.save()
        ctx.beginPath()
        sInset.forEach((sp, idx) => (idx === 0 ? ctx.moveTo(sp.cx, sp.cy) : ctx.lineTo(sp.cx, sp.cy)))
        ctx.closePath()
        ctx.setLineDash([3, 3])
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)"
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
      }

      // Illumination Radial Glow
      ctx.save()
      validLamps.forEach((lamp, idx) => {
        if (irregDisabledLamps.has(idx.toString())) return
        const cx = sc.offX + lamp.x * sc.scale
        const cy = sc.offY + lamp.y * sc.scale
        const glowRadius = Math.max(sc.scale * 1.5, 22)
        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, glowRadius)
        grad.addColorStop(0, "rgba(56, 189, 248, 0.40)")
        grad.addColorStop(0.5, "rgba(56, 189, 248, 0.12)")
        grad.addColorStop(1, "rgba(56, 189, 248, 0)")
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.restore()

      // Tabung LED T8 (Cyan / Neon White Reflector)
      const lampLen_px = lampLen * sc.scale
      const lampW_px = Math.max(3.5, LAMP_TUBE_W * sc.scale)

      validLamps.forEach((lamp, idx) => {
        const cx = sc.offX + lamp.x * sc.scale
        const cy = sc.offY + lamp.y * sc.scale
        const isH = lamp.dir === "h"
        const w = isH ? lampLen_px : lampW_px
        const h = isH ? lampW_px : lampLen_px
        const isDisabled = irregDisabledLamps.has(idx.toString())

        ctx.save()
        ctx.translate(cx, cy)

        ctx.fillStyle = isDisabled ? "rgba(100, 116, 139, 0.35)" : "#0284c7"
        ctx.strokeStyle = isDisabled ? "#475569" : "#38bdf8"
        ctx.lineWidth = 1.2

        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(-w / 2, -h / 2, w, h, 2.5)
        } else {
          ctx.rect(-w / 2, -h / 2, w, h)
        }
        ctx.fill()
        ctx.stroke()

        if (!isDisabled) {
          ctx.beginPath()
          if (isH) {
            ctx.moveTo(-w / 2 + 2.5, 0)
            ctx.lineTo(w / 2 - 2.5, 0)
          } else {
            ctx.moveTo(0, -h / 2 + 2.5)
            ctx.lineTo(0, h / 2 - 2.5)
          }
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 0.9
          ctx.stroke()
        } else {
          ctx.beginPath()
          ctx.moveTo(-w / 2 + 2, -h / 2 + 2)
          ctx.lineTo(w / 2 - 2, h / 2 - 2)
          ctx.moveTo(w / 2 - 2, -h / 2 + 2)
          ctx.lineTo(-w / 2 + 2, h / 2 - 2)
          ctx.strokeStyle = "#ef4444"
          ctx.lineWidth = 1.2
          ctx.stroke()
        }

        ctx.restore()

        // Label Koordinat Lampu
        ctx.save()
        ctx.fillStyle = isDisabled ? "rgba(255,255,255,0.25)" : "rgba(224,242,254,0.85)"
        ctx.font = "bold 7px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "bottom"
        ctx.fillText(`L${idx + 1}`, cx, cy - lampW_px / 2 - 2)
        ctx.restore()
      })
    }

    // 10. Render Garis Dinding Arsitektural (Thick Stroke & Wall Dimension Labels)
    wallSegments.forEach((wall) => {
      const p1 = toC(wall.p1)
      const p2 = toC(wall.p2)

      let strokeColor = "#38bdf8" // SOLID
      let strokeWidth = 3.5
      let dashArray: number[] = []

      if (wall.type === "GLASS_DOOR") {
        strokeColor = "#06b6d4"
        dashArray = [8, 4]
      } else if (wall.type === "DOOR_MAIN") {
        strokeColor = "#f97316"
        dashArray = [6, 3]
      } else if (wall.type === "DOOR_P1") {
        strokeColor = "#ea580c"
        dashArray = [6, 3]
      } else if (wall.type === "CASHIER") {
        strokeColor = "#f59e0b"
        dashArray = [5, 3]
      } else if (wall.type === "CHILLER") {
        strokeColor = "#06b6d4"
        dashArray = [4, 3]
      }

      ctx.save()
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.setLineDash(dashArray)
      ctx.beginPath()
      ctx.moveTo(p1.cx, p1.cy)
      ctx.lineTo(p2.cx, p2.cy)
      ctx.stroke()
      ctx.setLineDash([])

      // Dimensi Dinding Luar
      if (wall.type === "SOLID" && wall.lengthM >= 0.8) {
        const mx = (p1.cx + p2.cx) / 2
        const my = (p1.cy + p2.cy) / 2
        const dx = p2.cx - p1.cx
        const dy = p2.cy - p1.cy
        const len = Math.hypot(dx, dy)

        if (len > 20) {
          let nx = -dy / len
          let ny = dx / len
          // Outward vector
          const dot = nx * (mx - (sc.offX + centroidX * sc.scale)) + ny * (my - (sc.offY + centroidY * sc.scale))
          if (dot < 0) {
            nx = -nx
            ny = -ny
          }

          const labelX = mx + nx * 16
          const labelY = my + ny * 16

          let angle = Math.atan2(dy, dx)
          if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
            angle += Math.PI
          }

          ctx.save()
          ctx.translate(labelX, labelY)
          ctx.rotate(angle)
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.font = "bold 8px sans-serif"
          ctx.strokeStyle = "rgba(15, 23, 42, 0.90)"
          ctx.lineWidth = 3
          const tag = `${formatDim(wall.lengthM)}m`
          ctx.strokeText(tag, 0, 0)
          ctx.fillStyle = "#38bdf8"
          ctx.fillText(tag, 0, 0)
          ctx.restore()
        }
      }
      ctx.restore()
    })

    // 11. Render Titik Sudut Poligon (Nodes T1, T2...)
    pts.forEach((pt, i) => {
      const sp = toC(pt)
      ctx.save()
      ctx.beginPath()
      ctx.arc(sp.cx, sp.cy, 4.5, 0, Math.PI * 2)
      ctx.fillStyle = i === 0 ? "rgba(245, 158, 11, 0.4)" : "rgba(56, 189, 248, 0.3)"
      ctx.fill()
      ctx.strokeStyle = i === 0 ? "#f59e0b" : "#38bdf8"
      ctx.lineWidth = 1.4
      ctx.stroke()

      // Node label
      const outVx = sp.cx - (sc.offX + centroidX * sc.scale)
      const outVy = sp.cy - (sc.offY + centroidY * sc.scale)
      const outLen = Math.hypot(outVx, outVy) || 1
      const labelCx = sp.cx + (outVx / outLen) * 12
      const labelCy = sp.cy + (outVy / outLen) * 12

      ctx.font = "bold 8px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.strokeStyle = "rgba(15, 23, 42, 0.90)"
      ctx.lineWidth = 3
      ctx.strokeText(`T${i + 1}`, labelCx, labelCy)
      ctx.fillStyle = "#94a3b8"
      ctx.fillText(`T${i + 1}`, labelCx, labelCy)
      ctx.restore()
    })
  }, [pts, placedUnits, pillars, overrides, cashierDepths, chillerAlignments, activeTab, dimensions, lampWatt, lampLen, lampOrient, lampSpasi, irregDisabledLamps, log])

  if (pts.length < 3) {
    return (
      <div className="py-16 text-slate-400 text-xs text-center">
        Data titik poligon denah tidak tersedia untuk simulasi ini.
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[460px] flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height }}
        className="rounded-xl shadow-2xl select-none max-w-full max-h-full object-contain"
      />
    </div>
  )
}
