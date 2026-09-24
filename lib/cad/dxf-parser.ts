/**
 * Pure TypeScript DXF Parser for Sparta Energy CAD Integration
 * Zero external dependencies. Fast client-side parsing.
 */

import type { Point } from "@/lib/polygon-utils"

export type CadWallType = "SOLID" | "GLASS_DOOR" | "DOOR_P1" | "CASHIER" | "CHILLER"

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
        // Grab next value
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
 * Calculates bounding box and area of a polygon loop
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

function getLoopBounds(loop: Point[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  const xs = loop.map(p => p.x)
  const ys = loop.map(p => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}

/**
 * Main parser: transforms DXF string into rich store layout data ready for canvas & calculators
 */
export function parseDxfStoreLayout(dxfContent: string, filename?: string): ParsedCadStoreData {
  const { entities } = parseDxfEntities(dxfContent)

  const lines = entities.filter(e => e.type === "LINE") as DxfLineEntity[]
  const polylines = entities.filter(e => e.type === "LWPOLYLINE" || e.type === "POLYLINE") as DxfPolylineEntity[]
  const inserts = entities.filter(e => e.type === "INSERT") as DxfInsertEntity[]
  const hatches = entities.filter(e => e.type === "HATCH") as DxfHatchEntity[]

  // 1. Determine overall bounding box across entities to establish origin & units
  let allPoints: Point[] = []
  lines.forEach(l => allPoints.push(l.start, l.end))
  polylines.forEach(p => allPoints.push(...p.vertices))
  inserts.forEach(ins => allPoints.push(ins.position))
  hatches.forEach(h => h.boundaryLoops.forEach(loop => allPoints.push(...loop)))

  if (allPoints.length === 0) {
    throw new Error("Berkas DXF tidak memiliki objek geometri yang dapat dikenali.")
  }

  const xs = allPoints.map(p => p.x)
  const ys = allPoints.map(p => p.y)
  let rawMinX = Math.min(...xs)
  let rawMaxX = Math.max(...xs)
  let rawMinY = Math.min(...ys)
  let rawMaxY = Math.max(...ys)

  let spanX = rawMaxX - rawMinX
  let spanY = rawMaxY - rawMinY

  // 2. Detect unit scale (if span > 100, CAD is in millimeters -> convert to meters)
  const scaleToM = (spanX > 80 || spanY > 80) ? 0.001 : 1.0

  // 3. Find primary store boundary
  // Look for Hatch AR-SAND loop, or outer wall bounding box (e.g. 12m x 10m)
  const sandHatch = hatches.find(h => h.pattern.toUpperCase().includes("SAND"))
  let boundaryLoop: Point[] = []

  if (sandHatch && sandHatch.boundaryLoops.length > 0) {
    const largest = sandHatch.boundaryLoops.reduce((prev, curr) =>
      getLoopArea(curr) > getLoopArea(prev) ? curr : prev
    )
    boundaryLoop = largest
  }

  // If no AR-SAND hatch, find outer polygon from store walls (lines with layer 0 / walls)
  let minStoreX = rawMinX
  let minStoreY = rawMinY
  let maxStoreX = rawMaxX
  let maxStoreY = rawMaxY

  if (boundaryLoop.length >= 4) {
    const b = getLoopBounds(boundaryLoop)
    minStoreX = b.minX
    minStoreY = b.minY
    maxStoreX = b.maxX
    maxStoreY = b.maxY
  } else {
    // Use line bounds
    const linePts: Point[] = []
    lines.forEach(l => linePts.push(l.start, l.end))
    if (linePts.length > 0) {
      const b = getLoopBounds(linePts)
      minStoreX = b.minX
      minStoreY = b.minY
      maxStoreX = b.maxX
      maxStoreY = b.maxY
    }
  }

  const lengthM = Number(((maxStoreX - minStoreX) * scaleToM).toFixed(2))
  const widthM = Number(((maxStoreY - minStoreY) * scaleToM).toFixed(2))

  // Normalized helper function: CAD coords -> Store coords in meters (origin 0,0 at Top-Left matching screen coordinates & CAD plan view)
  const toM = (pt: Point): Point => ({
    x: Number(((pt.x - minStoreX) * scaleToM).toFixed(3)),
    y: Number(((maxStoreY - pt.y) * scaleToM).toFixed(3)),
  })

  // 4. Identify Zones (Cashier ANSI32, Chiller ANSI37)
  let cashierAreaM2 = 0
  let cashierBoundsM: { x: number; y: number; width: number; height: number } | undefined
  let cashierPolygonM: Point[] | undefined

  const cashierHatch = hatches.find(h => h.pattern.toUpperCase().includes("ANSI32"))
  if (cashierHatch && cashierHatch.boundaryLoops.length > 0) {
    const loop = cashierHatch.boundaryLoops[0]
    const b = getLoopBounds(loop)
    const wM = Number((b.width * scaleToM).toFixed(2))
    const hM = Number((b.height * scaleToM).toFixed(2))
    const xM = Number(((b.minX - minStoreX) * scaleToM).toFixed(2))
    const yM = Number(((maxStoreY - b.maxY) * scaleToM).toFixed(2))
    cashierBoundsM = { x: xM, y: yM, width: wM, height: hM }
    cashierAreaM2 = Number((wM * hM).toFixed(2))
    cashierPolygonM = loop.map(toM)
  } else {
    // Check polylines around cashier size (~2.3m x 3.9m)
    const polyKasir = polylines.find(p => {
      if (p.vertices.length < 4) return false
      const b = getLoopBounds(p.vertices)
      const wM = b.width * scaleToM
      const hM = b.height * scaleToM
      return (Math.abs(wM - 2.3) < 0.5 && Math.abs(hM - 3.9) < 0.5) || (Math.abs(wM - 3.9) < 0.5 && Math.abs(hM - 2.3) < 0.5)
    })
    if (polyKasir) {
      const b = getLoopBounds(polyKasir.vertices)
      const wM = Number((b.width * scaleToM).toFixed(2))
      const hM = Number((b.height * scaleToM).toFixed(2))
      const xM = Number(((b.minX - minStoreX) * scaleToM).toFixed(2))
      const yM = Number(((maxStoreY - b.maxY) * scaleToM).toFixed(2))
      cashierBoundsM = { x: xM, y: yM, width: wM, height: hM }
      cashierAreaM2 = Number((wM * hM).toFixed(2))
      cashierPolygonM = polyKasir.vertices.map(toM)
    }
  }

  // Fallback if not detected
  if (!cashierBoundsM) {
    cashierBoundsM = { x: Number((lengthM - 2.3).toFixed(2)), y: Number((widthM - 3.9).toFixed(2)), width: 2.3, height: 3.9 }
    cashierAreaM2 = 8.97
  }

  let chillerAreaM2 = 0
  let chillerBoundsM: { x: number; y: number; width: number; height: number } | undefined
  let chillerPolygonM: Point[] | undefined
  let chillerUnits = 6

  const chillerHatch = hatches.find(h => h.pattern.toUpperCase().includes("ANSI37"))
  if (chillerHatch && chillerHatch.boundaryLoops.length > 0) {
    const loop = chillerHatch.boundaryLoops[0]
    const b = getLoopBounds(loop)
    const wM = Number((b.width * scaleToM).toFixed(2))
    const hM = Number((b.height * scaleToM).toFixed(2))
    const xM = Number(((b.minX - minStoreX) * scaleToM).toFixed(2))
    const yM = Number(((maxStoreY - b.maxY) * scaleToM).toFixed(2))
    chillerBoundsM = { x: xM, y: yM, width: wM, height: hM }
    chillerAreaM2 = Number((wM * hM).toFixed(2))
    chillerPolygonM = loop.map(toM)
    chillerUnits = Math.max(1, Math.round(wM / 1.2))
  } else {
    // Check polylines around chiller size (~7.2m x 0.45m)
    const polyChiller = polylines.find(p => {
      if (p.vertices.length < 4) return false
      const b = getLoopBounds(p.vertices)
      const wM = b.width * scaleToM
      const hM = b.height * scaleToM
      return (Math.abs(wM - 7.2) < 0.8 && Math.abs(hM - 0.45) < 0.3) || (Math.abs(hM - 7.2) < 0.8 && Math.abs(wM - 0.45) < 0.3)
    })
    if (polyChiller) {
      const b = getLoopBounds(polyChiller.vertices)
      const wM = Number((b.width * scaleToM).toFixed(2))
      const hM = Number((b.height * scaleToM).toFixed(2))
      const xM = Number(((b.minX - minStoreX) * scaleToM).toFixed(2))
      const yM = Number(((maxStoreY - b.maxY) * scaleToM).toFixed(2))
      chillerBoundsM = { x: xM, y: yM, width: wM, height: hM }
      chillerAreaM2 = Number((wM * hM).toFixed(2))
      chillerPolygonM = polyChiller.vertices.map(toM)
      chillerUnits = Math.max(1, Math.round(wM / 1.2))
    }
  }

  // Fallback if not detected
  if (!chillerBoundsM) {
    chillerBoundsM = { x: 1.34, y: 0.0, width: 7.2, height: 0.45 }
    chillerAreaM2 = 3.24
    chillerUnits = 6
  }

  // 5. Identify Doors (pv180, P1)
  const doors: ParsedCadStoreData["doors"] = []
  inserts.forEach(ins => {
    const lowerName = ins.name.toLowerCase()
    let type: "main_pv180" | "warehouse_p1" | "other" = "other"
    if (lowerName.includes("pv180") || lowerName.includes("pintu") || lowerName.includes("door_main")) {
      type = "main_pv180"
    } else if (lowerName.includes("p1") || lowerName.includes("gudang")) {
      type = "warehouse_p1"
    }
    doors.push({
      name: ins.name,
      type,
      positionM: toM(ins.position),
    })
  })

  // Ensure standard doors exist if inserts were empty
  if (doors.length === 0) {
    doors.push(
      { name: "pv180", type: "main_pv180", positionM: { x: 5.06, y: widthM } },
      { name: "P1", type: "warehouse_p1", positionM: { x: 8.61, y: 0.0 } }
    )
  }

  // 6. Build Standard Outer Store Polygon (Ordered: Top-Left -> Top-Right -> Bottom-Right -> Bottom-Left)
  // Wall 0: (0,0) -> (lengthM, 0) => Dinding Belakang (Solid)
  // Wall 1: (lengthM, 0) -> (lengthM, widthM) => Dinding Kanan (Solid)
  // Wall 2: (lengthM, widthM) -> (0, widthM) => Dinding Depan (Kaca / Main Entrance pv180)
  // Wall 3: (0, widthM) -> (0, 0) => Dinding Kiri (Solid)
  const storePolygon: Point[] = [
    { x: 0, y: 0 },
    { x: lengthM, y: 0 },
    { x: lengthM, y: widthM },
    { x: 0, y: widthM },
  ]

  const grossArea = Number((lengthM * widthM).toFixed(2))
  const netSalesArea = Number(Math.max(1, grossArea - chillerAreaM2 - cashierAreaM2).toFixed(2))

  // 7. Wall Classification based on Retail SOP:
  // Only Front Wall is GLASS_DOOR. Back wall is SOLID (chiller is rendered as a distinct 2D furniture block).
  const segmentOverrides: Record<number, CadWallType> = {
    0: "SOLID",      // Dinding Belakang / Atas (Solid)
    1: "SOLID",      // Dinding Kanan (Solid)
    2: "GLASS_DOOR", // Dinding Depan / Bawah (Kaca & Pintu Utama)
    3: "SOLID",      // Dinding Kiri (Solid)
  }

  const wallSegments: CadWallSegment[] = [
    {
      index: 0,
      p1: storePolygon[0],
      p2: storePolygon[1],
      lengthM,
      type: segmentOverrides[0],
      label: `Dinding Belakang (${lengthM} m)`,
    },
    {
      index: 1,
      p1: storePolygon[1],
      p2: storePolygon[2],
      lengthM: widthM,
      type: segmentOverrides[1],
      label: `Dinding Kanan (${widthM} m)`,
    },
    {
      index: 2,
      p1: storePolygon[2],
      p2: storePolygon[3],
      lengthM,
      type: segmentOverrides[2],
      label: `Dinding Depan / Kaca (${lengthM} m)`,
    },
    {
      index: 3,
      p1: storePolygon[3],
      p2: storePolygon[0],
      lengthM: widthM,
      type: segmentOverrides[3],
      label: `Dinding Kiri (${widthM} m)`,
    },
  ]

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
      netSalesArea,
      lengthM,
      widthM,
    },
    polygon: storePolygon,
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
    },
    rawSummary: {
      lineCount: lines.length,
      polylineCount: polylines.length,
      insertCount: inserts.length,
      hatchCount: hatches.length,
    },
  }
}
