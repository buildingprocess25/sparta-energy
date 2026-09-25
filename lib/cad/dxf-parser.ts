/**
 * Pure TypeScript Dynamic DXF Parser for Sparta Energy CAD Integration
 * Zero external dependencies. Fast client-side parsing.
 * Supports arbitrary store geometries: rectangular, trapezoidal, slanted walls, and custom layouts.
 */

import type { Point } from "@/lib/polygon-utils"

export type CadWallType = "SOLID" | "GLASS_DOOR" | "DOOR_MAIN" | "DOOR_P1" | "CASHIER" | "CHILLER"

export interface DxfLineEntity {
  type: "LINE"
  layer: string
  start: Point
  end: Point
}

export interface DxfPolylineEntity {
  type: "LWPOLYLINE" | "POLYLINE"
  layer: string
  isClosed: boolean
  vertices: Point[]
}

export interface DxfInsertEntity {
  type: "INSERT"
  name: string
  layer: string
  position: Point
  rotation: number
  scale: { x: number; y: number; z: number }
}

export interface DxfHatchEntity {
  type: "HATCH"
  pattern: string
  layer: string
  boundaryLoops: Point[][]
}

export type DxfEntity = DxfLineEntity | DxfPolylineEntity | DxfInsertEntity | DxfHatchEntity

export interface CadStoreMetrics {
  grossArea: number
  chillerArea: number
  cashierArea: number
  columnArea?: number
  netSalesArea: number
  lengthM: number
  widthM: number
}

export interface CadWallSegment {
  index: number
  p1: Point
  p2: Point
  lengthM: number
  type: CadWallType
  label: string
}

export interface ParsedCadStoreData {
  success: boolean
  filename?: string
  dimensions: {
    lengthM: number
    widthM: number
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
  metrics: CadStoreMetrics
  polygon: Point[] // Ordered boundary polygon in meters
  wallSegments: CadWallSegment[]
  segmentOverrides: Record<number, CadWallType>
  doors: Array<{
    name: string
    type: "main_pv180" | "warehouse_p1" | "other"
    positionM: Point
  }>
  zones: {
    cashier?: {
      bounds: { x: number; y: number; width: number; height: number }
      polygon: Point[]
      areaM2: number
    }
    chiller?: {
      bounds: { x: number; y: number; width: number; height: number }
      polygon: Point[]
      areaM2: number
      unitCount: number
    }
    glass?: {
      bounds: { x: number; y: number; width: number; height: number }
      polygon: Point[]
      areaM2: number
    }
    columns?: Array<{
      bounds: { x: number; y: number; width: number; height: number }
      polygon: Point[]
      areaM2: number
      label?: string
    }>
  }
  rawSummary: {
    lineCount: number
    polylineCount: number
    insertCount: number
    hatchCount: number
  }
}

/**
 * Low-level token parser for standard DXF ASCII text
 */
interface DxfCodeValue {
  code: number
  value: string
}

function tokenizeDxf(dxfContent: string): DxfCodeValue[] {
  const lines = dxfContent.split(/\r?\n/)
  const tokens: DxfCodeValue[] = []
  
  let i = 0
  while (i < lines.length - 1) {
    const rawCode = lines[i].trim()
    const rawVal = lines[i + 1] !== undefined ? lines[i + 1].trim() : ""
    if (rawCode.length > 0) {
      const code = parseInt(rawCode, 10)
      if (!isNaN(code)) {
        tokens.push({ code, value: rawVal })
      }
    }
    i += 2
  }
  return tokens
}

/**
 * Parse DXF text content into raw entities
 */
export function parseDxfEntities(dxfContent: string): {
  entities: DxfEntity[]
  headerVars: Record<string, any>
} {
  const tokens = tokenizeDxf(dxfContent)
  const entities: DxfEntity[] = []
  const headerVars: Record<string, any> = {}

  let inSection = false
  let currentSection = ""

  let i = 0
  while (i < tokens.length) {
    const token = tokens[i]

    if (token.code === 0 && token.value === "SECTION") {
      inSection = true
      if (i + 1 < tokens.length && tokens[i + 1].code === 2) {
        currentSection = tokens[i + 1].value.toUpperCase()
        i += 2
        continue
      }
    } else if (token.code === 0 && token.value === "ENDSEC") {
      inSection = false
      currentSection = ""
      i++
      continue
    }

    if (inSection && currentSection === "HEADER") {
      if (token.code === 9) {
        const varName = token.value
        if (i + 1 < tokens.length) {
          headerVars[varName] = tokens[i + 1].value
        }
      }
      i++
      continue
    }

    if (inSection && currentSection === "ENTITIES") {
      if (token.code === 0) {
        const entityType = token.value.toUpperCase()

        if (entityType === "LINE") {
          let layer = "0"
          let x1 = 0, y1 = 0, x2 = 0, y2 = 0
          i++
          while (i < tokens.length && tokens[i].code !== 0) {
            const { code, value } = tokens[i]
            if (code === 8) layer = value
            else if (code === 10) x1 = parseFloat(value)
            else if (code === 20) y1 = parseFloat(value)
            else if (code === 11) x2 = parseFloat(value)
            else if (code === 21) y2 = parseFloat(value)
            i++
          }
          entities.push({
            type: "LINE",
            layer,
            start: { x: x1, y: y1 },
            end: { x: x2, y: y2 },
          })
          continue
        } else if (entityType === "LWPOLYLINE" || entityType === "POLYLINE") {
          let layer = "0"
          let isClosed = false
          const vertices: Point[] = []
          let curX: number | null = null

          i++
          while (i < tokens.length && tokens[i].code !== 0) {
            const { code, value } = tokens[i]
            if (code === 8) layer = value
            else if (code === 70) {
              const flag = parseInt(value, 10)
              if ((flag & 1) === 1) isClosed = true
            } else if (code === 10) {
              curX = parseFloat(value)
            } else if (code === 20 && curX !== null) {
              vertices.push({ x: curX, y: parseFloat(value) })
              curX = null
            }
            i++
          }
          entities.push({
            type: "LWPOLYLINE",
            layer,
            isClosed,
            vertices,
          })
          continue
        } else if (entityType === "INSERT") {
          let name = ""
          let layer = "0"
          let px = 0, py = 0
          let rot = 0
          let sx = 1, sy = 1, sz = 1

          i++
          while (i < tokens.length && tokens[i].code !== 0) {
            const { code, value } = tokens[i]
            if (code === 2) name = value
            else if (code === 8) layer = value
            else if (code === 10) px = parseFloat(value)
            else if (code === 20) py = parseFloat(value)
            else if (code === 50) rot = parseFloat(value)
            else if (code === 41) sx = parseFloat(value)
            else if (code === 42) sy = parseFloat(value)
            else if (code === 43) sz = parseFloat(value)
            i++
          }
          entities.push({
            type: "INSERT",
            name,
            layer,
            position: { x: px, y: py },
            rotation: rot,
            scale: { x: sx, y: sy, z: sz },
          })
          continue
        } else if (entityType === "HATCH") {
          let pattern = ""
          let layer = "0"
          const boundaryLoops: Point[][] = []
          let inBoundary = false
          let currentLoop: Point[] = []
          let curX: number | null = null

          i++
          while (i < tokens.length && tokens[i].code !== 0) {
            const { code, value } = tokens[i]
            if (code === 2) pattern = value
            else if (code === 8) layer = value
            else if (code === 92) {
              if (currentLoop.length >= 3) {
                boundaryLoops.push(currentLoop)
              }
              currentLoop = []
              inBoundary = true
            } else if (code === 97 || code === 98 || code === 75) {
              if (currentLoop.length >= 3) {
                boundaryLoops.push(currentLoop)
              }
              currentLoop = []
              inBoundary = false
            } else if (inBoundary && code === 10) {
              curX = parseFloat(value)
            } else if (inBoundary && code === 20 && curX !== null) {
              currentLoop.push({ x: curX, y: parseFloat(value) })
              curX = null
            }
            i++
          }
          if (currentLoop.length >= 3) {
            boundaryLoops.push(currentLoop)
          }

          entities.push({
            type: "HATCH",
            pattern: pattern || "SOLID",
            layer,
            boundaryLoops,
          })
          continue
        }
      }
    }

    i++
  }

  return { entities, headerVars }
}

/**
 * Calculates area of a polygon loop via Shoelace formula
 */
function getLoopArea(loop: Point[]): number {
  if (loop.length < 3) return 0
  let area = 0
  for (let i = 0; i < loop.length; i++) {
    const j = (i + 1) % loop.length
    area += loop[i].x * loop[j].y
    area -= loop[j].x * loop[i].y
  }
  return Math.abs(area) / 2
}

/**
 * Calculates bounding box of points
 */
function getLoopBounds(loop: Point[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  if (loop.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  }
  const xs = loop.map(p => p.x)
  const ys = loop.map(p => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}

/**
 * Distance between two 2D points
 */
function dist(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y)
}

/**
 * Chains line segments into a closed polygon loop
 */
function chainLinesIntoPolygon(lines: Array<{ p1: Point; p2: Point }>, thresholdM: number = 0.6): Point[] | null {
  if (lines.length < 3) return null
  const remaining = [...lines]
  const polygon: Point[] = []

  const first = remaining.shift()!
  polygon.push(first.p1)
  let cur = first.p2

  while (remaining.length > 0) {
    let bestIdx = -1
    let bestDist = Infinity
    let flip = false

    for (let k = 0; k < remaining.length; k++) {
      const seg = remaining[k]
      const d1 = dist(seg.p1, cur)
      const d2 = dist(seg.p2, cur)
      if (d1 < bestDist) {
        bestDist = d1
        bestIdx = k
        flip = false
      }
      if (d2 < bestDist) {
        bestDist = d2
        bestIdx = k
        flip = true
      }
    }

    if (bestDist > thresholdM || bestIdx === -1) {
      break
    }

    const nextSeg = remaining.splice(bestIdx, 1)[0]
    polygon.push(cur)
    cur = flip ? nextSeg.p1 : nextSeg.p2
  }

  // Check if closed
  if (polygon.length >= 3 && dist(cur, polygon[0]) <= thresholdM + 0.5) {
    return polygon
  }
  if (polygon.length >= 3) {
    return polygon
  }
  return null
}

/**
 * Point projection onto segment AB: returns scalar t (0 <= t <= 1) and perpendicular distance
 */
function projectPointToSegment(p: Point, a: Point, b: Point): { t: number; proj: Point; distance: number } {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) {
    return { t: 0, proj: a, distance: dist(p, a) }
  }
  const rawT = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq
  const t = Math.max(0, Math.min(1, rawT))
  const proj: Point = {
    x: Number((a.x + t * dx).toFixed(3)),
    y: Number((a.y + t * dy).toFixed(3)),
  }
  return { t, proj, distance: dist(p, proj) }
}

interface WallInterval {
  t1: number
  t2: number
  type: CadWallType
  label: string
}

/**
 * Main parser: transforms DXF string into rich store layout data ready for canvas & calculators.
 * Fully dynamic: handles arbitrary store shapes (rectangles, trapezoids, slanted walls, L-shapes).
 */
export function parseDxfStoreLayout(dxfContent: string, filename?: string): ParsedCadStoreData {
  const { entities } = parseDxfEntities(dxfContent)

  const lines = entities.filter(e => e.type === "LINE") as DxfLineEntity[]
  const polylines = entities.filter(e => e.type === "LWPOLYLINE" || e.type === "POLYLINE") as DxfPolylineEntity[]
  const inserts = entities.filter(e => e.type === "INSERT") as DxfInsertEntity[]
  const hatches = entities.filter(e => e.type === "HATCH") as DxfHatchEntity[]

  // 1. Determine overall bounding box across entities to establish origin & units
  const allPoints: Point[] = []
  lines.forEach(l => allPoints.push(l.start, l.end))
  polylines.forEach(p => allPoints.push(...p.vertices))
  inserts.forEach(ins => allPoints.push(ins.position))
  hatches.forEach(h => h.boundaryLoops.forEach(loop => allPoints.push(...loop)))

  if (allPoints.length === 0) {
    throw new Error("Berkas DXF tidak memiliki objek geometri yang dapat dikenali.")
  }

  const xs = allPoints.map(p => p.x)
  const ys = allPoints.map(p => p.y)
  const rawMinX = Math.min(...xs)
  const rawMaxX = Math.max(...xs)
  const rawMinY = Math.min(...ys)
  const rawMaxY = Math.max(...ys)

  const spanX = rawMaxX - rawMinX
  const spanY = rawMaxY - rawMinY

  // Detect unit scale (if CAD span > 50, coords are in millimeters -> convert to meters)
  const scaleToM = (spanX > 50 || spanY > 50) ? 0.001 : 1.0

  // Standard coordinate transformation: CAD -> Meters Top-Down (0,0 is Top-Left of bounding box)
  const toM = (pt: Point): Point => ({
    x: Number(((pt.x - rawMinX) * scaleToM).toFixed(3)),
    y: Number(((rawMaxY - pt.y) * scaleToM).toFixed(3)),
  })

  // 2. Identify Zones dynamically from Hatches / Polylines
  // Cashier (ANSI32)
  let cashierAreaM2 = 0
  let cashierBoundsM: { x: number; y: number; width: number; height: number } | undefined
  let cashierPolygonM: Point[] | undefined

  const cashierHatch = hatches.find(h => h.pattern.toUpperCase().includes("ANSI32") || h.layer.toLowerCase().includes("kasir") || h.layer.toLowerCase().includes("cashier"))
  if (cashierHatch && cashierHatch.boundaryLoops.length > 0) {
    const loop = cashierHatch.boundaryLoops[0]
    cashierPolygonM = loop.map(toM)
    const b = getLoopBounds(cashierPolygonM)
    cashierBoundsM = { x: b.minX, y: b.minY, width: b.width, height: b.height }
    cashierAreaM2 = Number(getLoopArea(cashierPolygonM).toFixed(2)) || Number((b.width * b.height).toFixed(2))
  } else {
    const polyKasir = polylines.find(p => {
      if (p.vertices.length < 4) return false
      const ptsM = p.vertices.map(toM)
      const b = getLoopBounds(ptsM)
      return (Math.abs(b.width - 2.3) < 0.8 && Math.abs(b.height - 3.9) < 0.8) || (Math.abs(b.width - 3.9) < 0.8 && Math.abs(b.height - 2.3) < 0.8)
    })
    if (polyKasir) {
      cashierPolygonM = polyKasir.vertices.map(toM)
      const b = getLoopBounds(cashierPolygonM)
      cashierBoundsM = { x: b.minX, y: b.minY, width: b.width, height: b.height }
      cashierAreaM2 = Number(getLoopArea(cashierPolygonM).toFixed(2)) || Number((b.width * b.height).toFixed(2))
    }
  }

  // Chiller (ANSI37)
  let chillerAreaM2 = 0
  let chillerBoundsM: { x: number; y: number; width: number; height: number } | undefined
  let chillerPolygonM: Point[] | undefined
  let chillerUnits = 6

  const chillerHatch = hatches.find(h => h.pattern.toUpperCase().includes("ANSI37") || h.layer.toLowerCase().includes("chiller"))
  if (chillerHatch && chillerHatch.boundaryLoops.length > 0) {
    const loop = chillerHatch.boundaryLoops[0]
    chillerPolygonM = loop.map(toM)
    const b = getLoopBounds(chillerPolygonM)
    cashierBoundsM = cashierBoundsM || undefined
    chillerBoundsM = { x: b.minX, y: b.minY, width: b.width, height: b.height }
    chillerAreaM2 = Number(getLoopArea(chillerPolygonM).toFixed(2)) || Number((b.width * b.height).toFixed(2))
    const majorDimension = Math.max(b.width, b.height, ...chillerPolygonM.map((p, idx) => dist(p, chillerPolygonM![(idx + 1) % chillerPolygonM!.length])))
    chillerUnits = Math.max(1, Math.round(majorDimension / 1.2))
  } else {
    const polyChiller = polylines.find(p => {
      if (p.vertices.length < 4) return false
      const ptsM = p.vertices.map(toM)
      const b = getLoopBounds(ptsM)
      return (Math.abs(b.width - 7.2) < 1.0 && Math.abs(b.height - 0.45) < 0.4) || (Math.abs(b.height - 7.2) < 1.0 && Math.abs(b.width - 0.45) < 0.4)
    })
    if (polyChiller) {
      chillerPolygonM = polyChiller.vertices.map(toM)
      const b = getLoopBounds(chillerPolygonM)
      chillerBoundsM = { x: b.minX, y: b.minY, width: b.width, height: b.height }
      chillerAreaM2 = Number(getLoopArea(chillerPolygonM).toFixed(2)) || Number((b.width * b.height).toFixed(2))
      const majorDimension = Math.max(b.width, b.height)
      chillerUnits = Math.max(1, Math.round(majorDimension / 1.2))
    }
  }

  // Glass Wall / Kusen (GOST_GLASS / GLASS / KACA / KUSEN)
  let glassAreaM2 = 0
  let glassBoundsM: { x: number; y: number; width: number; height: number } | undefined
  let glassPolygonM: Point[] | undefined

  const glassHatch = hatches.find(h =>
    h.pattern.toUpperCase().includes("GOST_GLASS") ||
    h.pattern.toUpperCase().includes("GLASS") ||
    h.layer.toLowerCase().includes("kaca") ||
    h.layer.toLowerCase().includes("glass") ||
    h.layer.toLowerCase().includes("kusen")
  )
  if (glassHatch && glassHatch.boundaryLoops.length > 0) {
    const loop = glassHatch.boundaryLoops[0]
    glassPolygonM = loop.map(toM)
    const b = getLoopBounds(glassPolygonM)
    glassBoundsM = { x: b.minX, y: b.minY, width: b.width, height: b.height }
    glassAreaM2 = Number(getLoopArea(glassPolygonM).toFixed(2)) || Number((b.width * b.height).toFixed(2))
  }

  // Columns / Pilar (AR-CONC / CONC / CONCRETE / KOLOM / Secondary Holes)
  const columnZones: Array<{ bounds: { x: number; y: number; width: number; height: number }; polygon: Point[]; areaM2: number; label?: string }> = []
  let totalColumnAreaM2 = 0

  const isDuplicateColumn = (b: { minX: number; minY: number; maxX: number; maxY: number }) => {
    return columnZones.some(c => {
      const cx = c.bounds.x + c.bounds.width / 2
      const cy = c.bounds.y + c.bounds.height / 2
      const bx = (b.minX + b.maxX) / 2
      const by = (b.minY + b.maxY) / 2
      return Math.hypot(cx - bx, cy - by) < 0.35
    })
  }

  // 1. Hatches with AR-CONC / CONC / KOLOM pattern
  const columnHatches = hatches.filter(h =>
    h.pattern.toUpperCase().includes("AR-CONC") ||
    h.pattern.toUpperCase().includes("CONC") ||
    h.layer.toLowerCase().includes("kolom") ||
    h.layer.toLowerCase().includes("column") ||
    h.layer.toLowerCase().includes("pilar")
  )
  columnHatches.forEach((colHatch) => {
    colHatch.boundaryLoops.forEach((loop) => {
      if (loop.length >= 3) {
        const polyM = loop.map(toM)
        const b = getLoopBounds(polyM)
        if (b.width >= 0.1 && b.width <= 1.5 && b.height >= 0.1 && b.height <= 1.5 && !isDuplicateColumn(b)) {
          const aM2 = Number(getLoopArea(polyM).toFixed(2)) || Number((b.width * b.height).toFixed(2))
          totalColumnAreaM2 += aM2
          columnZones.push({
            bounds: { x: b.minX, y: b.minY, width: b.width, height: b.height },
            polygon: polyM,
            areaM2: aM2,
            label: `Kolom ${columnZones.length + 1}`,
          })
        }
      }
    })
  })

  // 2. Closed polylines matching column dimensions (0.15m - 0.8m)
  polylines.forEach(p => {
    if (p.vertices.length >= 4) {
      const ptsM = p.vertices.map(toM)
      const b = getLoopBounds(ptsM)
      if (b.width >= 0.15 && b.width <= 0.8 && b.height >= 0.15 && b.height <= 0.8 && !isDuplicateColumn(b)) {
        const aM2 = Number(getLoopArea(ptsM).toFixed(2)) || Number((b.width * b.height).toFixed(2))
        totalColumnAreaM2 += aM2
        columnZones.push({
          bounds: { x: b.minX, y: b.minY, width: b.width, height: b.height },
          polygon: ptsM,
          areaM2: aM2,
          label: `Kolom ${columnZones.length + 1}`,
        })
      }
    }
  })

  // 3. Inserts with column / pilar block names
  inserts.forEach(ins => {
    const lName = ins.name.toLowerCase()
    if (lName.includes("kolom") || lName.includes("column") || lName.includes("pilar")) {
      const posM = toM(ins.position)
      const w = 0.4 * (ins.scale?.x || 1)
      const h = 0.4 * (ins.scale?.y || 1)
      const b = { minX: posM.x - w / 2, minY: posM.y - h / 2, maxX: posM.x + w / 2, maxY: posM.y + h / 2 }
      if (!isDuplicateColumn(b)) {
        const aM2 = Number((w * h).toFixed(2))
        totalColumnAreaM2 += aM2
        columnZones.push({
          bounds: { x: b.minX, y: b.minY, width: w, height: h },
          polygon: [
            { x: b.minX, y: b.minY },
            { x: b.maxX, y: b.minY },
            { x: b.maxX, y: b.maxY },
            { x: b.minX, y: b.maxY },
          ],
          areaM2: aM2,
          label: ins.name,
        })
      }
    }
  })

  // 4. Check floor hatch holes (e.g. AR-SAND interior loops)
  const floorHatches = hatches.filter(h => h.pattern.toUpperCase().includes("AR-SAND") || h.pattern.toUpperCase().includes("FLOOR"))
  floorHatches.forEach(fh => {
    if (fh.boundaryLoops.length > 1) {
      // Loop 0 is outer perimeter, subsequent loops are obstacles/holes
      for (let k = 1; k < fh.boundaryLoops.length; k++) {
        const loop = fh.boundaryLoops[k]
        if (loop.length >= 3) {
          const polyM = loop.map(toM)
          const b = getLoopBounds(polyM)
          if (b.width >= 0.15 && b.width <= 0.8 && b.height >= 0.15 && b.height <= 0.8 && !isDuplicateColumn(b)) {
            const aM2 = Number(getLoopArea(polyM).toFixed(2)) || Number((b.width * b.height).toFixed(2))
            totalColumnAreaM2 += aM2
            columnZones.push({
              bounds: { x: b.minX, y: b.minY, width: b.width, height: b.height },
              polygon: polyM,
              areaM2: aM2,
              label: `Kolom ${columnZones.length + 1}`,
            })
          }
        }
      }
    }
  })

  // Doors (double swing, pv180, P1, etc.)
  const doors: ParsedCadStoreData["doors"] = []
  inserts.forEach(ins => {
    const lowerName = ins.name.toLowerCase()
    let type: "main_pv180" | "warehouse_p1" | "other" = "other"
    if (
      lowerName.includes("double swing") ||
      lowerName.includes("double_swing") ||
      lowerName.includes("pv180") ||
      lowerName.includes("pintu") ||
      lowerName.includes("door_main") ||
      lowerName.includes("entrance") ||
      lowerName.includes("main")
    ) {
      type = "main_pv180"
    } else if (
      lowerName.includes("p1") ||
      lowerName.includes("gudang") ||
      lowerName.includes("warehouse")
    ) {
      type = "warehouse_p1"
    }
    doors.push({
      name: ins.name,
      type,
      positionM: toM(ins.position),
    })
  })

  // 3. Extract Store Outer Perimeter Polygon Dynamically
  // Option A: Chain perimeter lines (filter out small fixture lines)
  const candidateLines = lines
    .map(l => ({ p1: toM(l.start), p2: toM(l.end) }))
    .filter(l => dist(l.p1, l.p2) >= 1.5)

  let basePolygon: Point[] | null = chainLinesIntoPolygon(candidateLines, 0.6)

  // Option B: Check closed polyline with area >= 20m²
  if (!basePolygon) {
    const bigPoly = polylines.find(p => {
      const ptsM = p.vertices.map(toM)
      return ptsM.length >= 3 && getLoopArea(ptsM) >= 20
    })
    if (bigPoly) {
      basePolygon = bigPoly.vertices.map(toM)
    }
  }

  // Option C: Bounding box fallback
  if (!basePolygon || basePolygon.length < 3) {
    const allM = allPoints.map(toM)
    const b = getLoopBounds(allM)
    basePolygon = [
      { x: b.minX, y: b.minY },
      { x: b.maxX, y: b.minY },
      { x: b.maxX, y: b.maxY },
      { x: b.minX, y: b.maxY },
    ]
  }

  // 4. Normalize Base Polygon Orientation & Starting Point (Top-Left Clockwise)
  // Ensure Clockwise order (Area positive with Shoelace)
  let areaSigned = 0
  for (let k = 0; k < basePolygon.length; k++) {
    const nextK = (k + 1) % basePolygon.length
    areaSigned += (basePolygon[k].x * basePolygon[nextK].y - basePolygon[nextK].x * basePolygon[k].y)
  }
  if (areaSigned < 0) {
    basePolygon.reverse()
  }

  // Rotate starting point to the top-left-most vertex (min x + min y)
  let bestStartIdx = 0
  let minScore = Infinity
  for (let k = 0; k < basePolygon.length; k++) {
    const score = basePolygon[k].x * 1.0 + basePolygon[k].y * 1.5
    if (score < minScore) {
      minScore = score
      bestStartIdx = k
    }
  }
  if (bestStartIdx > 0) {
    basePolygon = [...basePolygon.slice(bestStartIdx), ...basePolygon.slice(0, bestStartIdx)]
  }

  const polyBounds = getLoopBounds(basePolygon)
  const lengthM = Number(polyBounds.width.toFixed(2))
  const widthM = Number(polyBounds.height.toFixed(2))
  const grossArea = Number(getLoopArea(basePolygon).toFixed(2))

  // 5. Dynamic Fixture Projection & Perimeter Subdivision
  const finalPolygon: Point[] = []
  const segmentOverrides: Record<number, CadWallType> = {}
  const segmentLabels: string[] = []

  // Helper to test if a wall is the front wall (max Y region where main door or glass facade is located)
  const mainDoor = doors.find(d => d.type === "main_pv180")
  const p1Door = doors.find(d => d.type === "warehouse_p1")

  for (let i = 0; i < basePolygon.length; i++) {
    const pA = basePolygon[i]
    const pB = basePolygon[(i + 1) % basePolygon.length]
    const wallLen = dist(pA, pB)

    if (wallLen < 0.1) continue

    const intervals: WallInterval[] = []

    // Check Chiller attachment
    if (chillerPolygonM && chillerPolygonM.length >= 3) {
      const projections = chillerPolygonM.map(pt => projectPointToSegment(pt, pA, pB))
      const closeProjections = projections.filter(p => p.distance <= 1.2)
      if (closeProjections.length >= 2) {
        const ts = closeProjections.map(p => p.t)
        const t1 = Math.max(0, Math.min(...ts))
        const t2 = Math.min(1, Math.max(...ts))
        if (t2 - t1 > 0.05) {
          intervals.push({
            t1,
            t2,
            type: "CHILLER",
            label: `Chiller (${Number(((t2 - t1) * wallLen).toFixed(2))}m)`,
          })
        }
      }
    }

    // Check Warehouse Door P1 attachment
    if (p1Door) {
      const proj = projectPointToSegment(p1Door.positionM, pA, pB)
      if (proj.distance <= 1.2) {
        const doorSpanT = Math.min(0.2, 1.0 / wallLen)
        const t1 = Math.max(0, proj.t - 0.02)
        const t2 = Math.min(1, t1 + doorSpanT)
        intervals.push({
          t1,
          t2,
          type: "DOOR_P1",
          label: `Pintu P1 (${Number(((t2 - t1) * wallLen).toFixed(2))}m)`,
        })
      }
    }

    // Check Cashier Zone attachment
    if (cashierPolygonM && cashierPolygonM.length >= 3) {
      const projections = cashierPolygonM.map(pt => projectPointToSegment(pt, pA, pB))
      const closeProjections = projections.filter(p => p.distance <= 0.6)
      if (closeProjections.length >= 2) {
        const ts = closeProjections.map(p => p.t)
        const t1 = Math.max(0, Math.min(...ts))
        const t2 = Math.min(1, Math.max(...ts))
        if (t2 - t1 > 0.05) {
          intervals.push({
            t1,
            t2,
            type: "CASHIER",
            label: `Kasir (${Number(((t2 - t1) * wallLen).toFixed(2))}m)`,
          })
        }
      }
    }

    // Check Main Door attachment
    if (mainDoor) {
      const proj = projectPointToSegment(mainDoor.positionM, pA, pB)
      if (proj.distance <= 1.2) {
        const doorSpanT = Math.min(0.3, 1.8 / wallLen)
        const t1 = Math.max(0, proj.t - doorSpanT / 2)
        const t2 = Math.min(1, t1 + doorSpanT)
        intervals.push({
          t1,
          t2,
          type: "DOOR_MAIN",
          label: `Pintu Utama (${Number(((t2 - t1) * wallLen).toFixed(2))}m)`,
        })
      }
    }

    // Check Glass Wall attachment (only the front horizontal facade where glass/main door is located)
    const isHorizontalFront = Math.min(pA.y, pB.y) >= polyBounds.maxY - 0.6 && Math.abs(pA.y - pB.y) <= 0.6
    const hasMainDoorOnThisWall = Boolean(mainDoor && dist(projectPointToSegment(mainDoor.positionM, pA, pB).proj, mainDoor.positionM) <= 0.8)
    const isFrontWall = isHorizontalFront || (hasMainDoorOnThisWall && Math.abs(pA.y - pB.y) <= 1.0)
    const defaultWallType: CadWallType = isFrontWall ? "GLASS_DOOR" : "SOLID"

    // Sort intervals by t1
    intervals.sort((a, b) => a.t1 - b.t1)

    // Build non-overlapping subsegments
    const subsegments: WallInterval[] = []
    let currentT = 0

    for (const inter of intervals) {
      if (inter.t1 - currentT > 0.03) {
        subsegments.push({
          t1: currentT,
          t2: inter.t1,
          type: defaultWallType,
          label: isFrontWall ? `Dinding Kaca (${Number(((inter.t1 - currentT) * wallLen).toFixed(2))}m)` : `Dinding (${Number(((inter.t1 - currentT) * wallLen).toFixed(2))}m)`,
        })
      }
      const actualT1 = Math.max(currentT, inter.t1)
      const actualT2 = Math.max(actualT1 + 0.02, inter.t2)
      subsegments.push({
        t1: actualT1,
        t2: actualT2,
        type: inter.type,
        label: inter.label,
      })
      currentT = actualT2
    }

    if (1.0 - currentT > 0.03) {
      subsegments.push({
        t1: currentT,
        t2: 1.0,
        type: defaultWallType,
        label: isFrontWall ? `Dinding Kaca (${Number(((1.0 - currentT) * wallLen).toFixed(2))}m)` : `Dinding (${Number(((1.0 - currentT) * wallLen).toFixed(2))}m)`,
      })
    }

    if (subsegments.length === 0) {
      subsegments.push({
        t1: 0,
        t2: 1.0,
        type: defaultWallType,
        label: `Dinding (${Number(wallLen.toFixed(2))}m)`,
      })
    }

    // Emit vertices for each subsegment
    for (let s = 0; s < subsegments.length; s++) {
      const sub = subsegments[s]
      const ptStart: Point = {
        x: Number((pA.x + sub.t1 * (pB.x - pA.x)).toFixed(2)),
        y: Number((pA.y + sub.t1 * (pB.y - pA.y)).toFixed(2)),
      }
      finalPolygon.push(ptStart)
      const segIndex = finalPolygon.length - 1
      segmentOverrides[segIndex] = sub.type
      segmentLabels.push(sub.label)
    }
  }

  // 6. Build Rich Wall Segments
  const wallSegments: CadWallSegment[] = []
  for (let i = 0; i < finalPolygon.length; i++) {
    const p1 = finalPolygon[i]
    const p2 = finalPolygon[(i + 1) % finalPolygon.length]
    const len = Number(dist(p1, p2).toFixed(2))
    wallSegments.push({
      index: i,
      p1,
      p2,
      lengthM: len,
      type: segmentOverrides[i] || "SOLID",
      label: segmentLabels[i] || `Segmen ${i + 1} (${len}m)`,
    })
  }

  // Net sales area calculation (Gross - Chiller - Cashier - Columns)
  const netSalesArea = Number(
    Math.max(
      1,
      grossArea - (chillerAreaM2 || 0) - (cashierAreaM2 || 0) - (totalColumnAreaM2 || 0)
    ).toFixed(2)
  )

  return {
    success: true,
    filename,
    dimensions: {
      lengthM,
      widthM,
      minX: 0,
      minY: 0,
      maxX: lengthM,
      maxY: widthM,
    },
    metrics: {
      grossArea,
      chillerArea: chillerAreaM2,
      cashierArea: cashierAreaM2,
      columnArea: Number(totalColumnAreaM2.toFixed(2)),
      netSalesArea,
      lengthM,
      widthM,
    },
    polygon: finalPolygon,
    wallSegments,
    segmentOverrides,
    doors,
    zones: {
      cashier: cashierBoundsM
        ? {
            bounds: cashierBoundsM,
            polygon: cashierPolygonM || [
              { x: cashierBoundsM.x, y: cashierBoundsM.y },
              { x: cashierBoundsM.x + cashierBoundsM.width, y: cashierBoundsM.y },
              { x: cashierBoundsM.x + cashierBoundsM.width, y: cashierBoundsM.y + cashierBoundsM.height },
              { x: cashierBoundsM.x, y: cashierBoundsM.y + cashierBoundsM.height },
            ],
            areaM2: cashierAreaM2,
          }
        : undefined,
      chiller: chillerBoundsM
        ? {
            bounds: chillerBoundsM,
            polygon: chillerPolygonM || [
              { x: chillerBoundsM.x, y: chillerBoundsM.y },
              { x: chillerBoundsM.x + chillerBoundsM.width, y: chillerBoundsM.y },
              { x: chillerBoundsM.x + chillerBoundsM.width, y: chillerBoundsM.y + chillerBoundsM.height },
              { x: chillerBoundsM.x, y: chillerBoundsM.y + chillerBoundsM.height },
            ],
            areaM2: chillerAreaM2,
            unitCount: chillerUnits,
          }
        : undefined,
      glass: glassBoundsM
        ? {
            bounds: glassBoundsM,
            polygon: glassPolygonM || [
              { x: glassBoundsM.x, y: glassBoundsM.y },
              { x: glassBoundsM.x + glassBoundsM.width, y: glassBoundsM.y },
              { x: glassBoundsM.x + glassBoundsM.width, y: glassBoundsM.y + glassBoundsM.height },
              { x: glassBoundsM.x, y: glassBoundsM.y + glassBoundsM.height },
            ],
            areaM2: glassAreaM2,
          }
        : undefined,
      columns: columnZones.length > 0 ? columnZones : undefined,
    },
    rawSummary: {
      lineCount: lines.length,
      polylineCount: polylines.length,
      insertCount: inserts.length,
      hatchCount: hatches.length,
    },
  }
}

