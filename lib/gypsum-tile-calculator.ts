import {
  Point,
  calcPolygonArea,
  isPointInsidePolygon,
} from "./polygon-utils"

export const GYPSUM_LENGTH_M = 1.2 // Panjang fisik standar modul: 1.2 meter (120 cm)
export const GYPSUM_WIDTH_M = 0.6  // Lebar fisik standar modul: 0.6 meter (60 cm)
export const MIN_BORDER_CUT_RATIO = 0.5 // Aturan potongan tepi minimal 50%
export const SAFETY_WASTE_FACTOR = 0.05 // Safety waste margin 5%

export const MAIN_TEE_LENGTH_M = 3.6   // Batang Main Tee baku: 3.6 meter
export const CROSS_TEE_LENGTH_M = 1.2  // Batang Cross Tee baku: 1.2 meter
export const WALL_ANGLE_LENGTH_M = 3.0 // Batang Wall Angle baku: 3.0 meter

// Koefisien Resmi Jayaboard (Acuan: Koefisien Fix Gypsum Tile Jayaboard.xlsx - Sheet "Koefisien 1.75")
export const JAYABOARD_COEF = {
  GYPTILE_NATURA: 1.75,        // Sheet / m2 (Item Code: 821848) - Gyptile Natura 9mm x 600mm x 1200mm
  MAIN_TEE_400: 0.2625,        // Pcs / m2 (Item Code: 755606) - Main Tee - 400 (3.6m)
  LONG_CROSS_TEE_402: 1.4000,  // Pcs / m2 (Item Code: 755604) - Long Cross Tee - 402 (1.2m)
  WALL_ANGLE_408: 0.4375,      // Pcs / m2 (Item Code: 823754) - Wall Angle - 408 (3.0m)
  SPRING_ADJUSTER_410: 0.7875, // Pcs / m2 (Item Code: 821969) - Suspension Spring Adjuster - 410
  SUSPENSION_ROD_409: 0.39375, // Pcs / m2 (Item Code: 821973) - 3mm Soft Galvanised Susp. Rod - 409
  ANGLE_BRACKET_220: 0.7875,   // Pcs / m2 (Item Code: 825460) - Angle bracket - 220
}

export type GypsumOrientation = "horizontal" | "vertical"

export interface AxisTileResult {
  axisDimensionM: number
  panelDimM: number
  fullTiles: number
  borderCutM: number
  borderCutCm: number
  borderCutRatio: number
  isRevised: boolean
  originalCutM: number
  minAllowedCutM: number
  isCompliant: boolean
}

export interface GypsumTileCell {
  id: string
  col: number
  row: number
  type: "FULL" | "BORDER_X" | "BORDER_Y" | "CORNER" | "BORDER"
  x: number
  y: number
  w: number
  h: number
}

export interface GypsumTileGridLine {
  type: "main" | "cross" | "border"
  orientation: "h" | "v"
  coord: number
  from: number
  to: number
}

export interface GypsumTileBoq {
  wallAnglePcs: number
  wallAngleTotalM: number
  mainTeePcs: number
  mainTeeTotalM: number
  crossTeePcs: number
  crossTeeTotalM: number
  rodHangerPcs: number
  // Rincian Resmi Katalog Jayaboard (Koefisien Fix 1.75)
  springAdjusterPcs: number
  galvanisedSuspRodPcs: number
  angleBracketPcs: number
  jayaboardMainTeePcs: number
  jayaboardCrossTeePcs: number
  jayaboardWallAnglePcs: number
}

export interface GypsumTileCalculationResult {
  orientation: GypsumOrientation
  roomWidthM: number
  roomLengthM: number
  roomAreaM2: number
  roomPerimeterM: number
  tileDimX: number
  tileDimY: number
  xAxis: AxisTileResult
  yAxis: AxisTileResult
  totalFullTiles: number
  borderTilesTopBottom: number
  borderTilesLeftRight: number
  cornerTiles: number
  totalBorderTiles: number
  totalTilesNeeded: number
  safetyWasteTiles: number
  totalTilesToOrder: number
  layoutPhysicalTiles: number
  jayaboardOrderTiles: number
  cells: GypsumTileCell[]
  gridLines: GypsumTileGridLine[]
  boq: GypsumTileBoq
  isIrregular?: boolean
}

/**
 * Menghitung layout 1 dimensi modul panel simetris dengan aturan potongan minimal 50%.
 */
export function calcTile1D(
  dimensionM: number,
  panelDimM: number,
  minRatio: number = MIN_BORDER_CUT_RATIO
): AxisTileResult {
  const roundedDim = Number(dimensionM.toFixed(4))
  const panelDim = Number(panelDimM.toFixed(4))

  if (roundedDim <= 0 || panelDim <= 0) {
    return {
      axisDimensionM: 0,
      panelDimM: panelDim,
      fullTiles: 0,
      borderCutM: 0,
      borderCutCm: 0,
      borderCutRatio: 0,
      isRevised: false,
      originalCutM: 0,
      minAllowedCutM: panelDim * minRatio,
      isCompliant: true,
    }
  }

  const rawPanels = roundedDim / panelDim
  const fullPanelsInitial = Math.floor(rawPanels)
  const remainderInitial = roundedDim - (fullPanelsInitial * panelDim)

  // Kasus pas kelipatan penuh (sisa 0)
  if (remainderInitial < 0.001) {
    return {
      axisDimensionM: roundedDim,
      panelDimM: panelDim,
      fullTiles: fullPanelsInitial,
      borderCutM: 0,
      borderCutCm: 0,
      borderCutRatio: 0,
      isRevised: false,
      originalCutM: 0,
      minAllowedCutM: panelDim * minRatio,
      isCompliant: true,
    }
  }

  const cutInitial = remainderInitial / 2
  const minAllowedCut = panelDim * minRatio

  // Evaluasi aturan potongan minimal 50%
  if (cutInitial < minAllowedCut) {
    const fullPanelsRevised = Math.max(0, fullPanelsInitial - 1)
    const revisedMargin = remainderInitial + panelDim
    const cutRevised = revisedMargin / 2
    const roundedCut = Number(cutRevised.toFixed(4))

    return {
      axisDimensionM: roundedDim,
      panelDimM: panelDim,
      fullTiles: fullPanelsRevised,
      borderCutM: roundedCut,
      borderCutCm: Math.round(roundedCut * 100),
      borderCutRatio: Number((roundedCut / panelDim).toFixed(4)),
      isRevised: true,
      originalCutM: Number(cutInitial.toFixed(4)),
      minAllowedCutM: minAllowedCut,
      isCompliant: true,
    }
  }

  const roundedCut = Number(cutInitial.toFixed(4))
  return {
    axisDimensionM: roundedDim,
    panelDimM: panelDim,
    fullTiles: fullPanelsInitial,
    borderCutM: roundedCut,
    borderCutCm: Math.round(roundedCut * 100),
    borderCutRatio: Number((roundedCut / panelDim).toFixed(4)),
    isRevised: false,
    originalCutM: roundedCut,
    minAllowedCutM: minAllowedCut,
    isCompliant: true,
  }
}

function ccw(a: Point, b: Point, c: Point): number {
  return (c.y - a.y) * (b.x - a.x) - (b.y - a.y) * (c.x - a.x)
}

function segmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
  const ccw1 = ccw(a, b, c)
  const ccw2 = ccw(a, b, d)
  const ccw3 = ccw(c, d, a)
  const ccw4 = ccw(c, d, b)
  return (
    ((ccw1 > 0 && ccw2 < 0) || (ccw1 < 0 && ccw2 > 0)) &&
    ((ccw3 > 0 && ccw4 < 0) || (ccw3 < 0 && ccw4 > 0))
  )
}

function checkIsIrregular(pts: Point[] | undefined): boolean {
  if (!pts || pts.length < 3) return false
  if (pts.length !== 4) return true

  for (let i = 0; i < 4; i++) {
    const p1 = pts[i]
    const p2 = pts[(i + 1) % 4]
    const dx = Math.abs(p2.x - p1.x)
    const dy = Math.abs(p2.y - p1.y)
    if (dx > 0.02 && dy > 0.02) {
      return true
    }
  }
  return false
}

function classifyCellAgainstPoly(
  cell: { x: number; y: number; w: number; h: number },
  poly: Point[]
): "FULL" | "BORDER" | "OUTSIDE" {
  const n = poly.length
  const c1 = { x: cell.x, y: cell.y }
  const c2 = { x: cell.x + cell.w, y: cell.y }
  const c3 = { x: cell.x + cell.w, y: cell.y + cell.h }
  const c4 = { x: cell.x, y: cell.y + cell.h }

  const cellEdges: [Point, Point][] = [
    [c1, c2],
    [c2, c3],
    [c3, c4],
    [c4, c1],
  ]

  // 1. Cek apakah ada garis tepi dinding yang memotong kotak cell
  for (let i = 0; i < n; i++) {
    const p1 = poly[i]
    const p2 = poly[(i + 1) % n]
    for (const [e1, e2] of cellEdges) {
      if (segmentsIntersect(p1, p2, e1, e2)) {
        return "BORDER"
      }
    }
  }

  // 2. Evaluasi titik sampel (4 sudut sedikit ke dalam + titik tengah)
  const epsX = cell.w * 0.04
  const epsY = cell.h * 0.04
  const samplePts: Point[] = [
    { x: cell.x + epsX, y: cell.y + epsY },
    { x: cell.x + cell.w - epsX, y: cell.y + epsY },
    { x: cell.x + cell.w - epsX, y: cell.y + cell.h - epsY },
    { x: cell.x + epsX, y: cell.y + cell.h - epsY },
    { x: cell.x + cell.w / 2, y: cell.y + cell.h / 2 },
  ]

  let insideCount = 0
  for (const pt of samplePts) {
    if (isPointInsidePolygon(pt, poly)) {
      insideCount++
    }
  }

  if (insideCount === samplePts.length) {
    return "FULL"
  }
  if (insideCount === 0) {
    return "OUTSIDE"
  }
  return "BORDER"
}

function getHorizontalSegmentsInPoly(y: number, poly: Point[]): [number, number][] {
  const n = poly.length
  const xIntersects: number[] = []

  for (let i = 0; i < n; i++) {
    const p1 = poly[i]
    const p2 = poly[(i + 1) % n]
    if ((p1.y <= y && p2.y > y) || (p2.y <= y && p1.y > y)) {
      const x = p1.x + ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y)
      xIntersects.push(x)
    }
  }

  xIntersects.sort((a, b) => a - b)
  const segments: [number, number][] = []
  for (let i = 0; i < xIntersects.length; i += 2) {
    if (i + 1 < xIntersects.length) {
      segments.push([xIntersects[i], xIntersects[i + 1]])
    }
  }
  return segments
}

function getVerticalSegmentsInPoly(x: number, poly: Point[]): [number, number][] {
  const n = poly.length
  const yIntersects: number[] = []

  for (let i = 0; i < n; i++) {
    const p1 = poly[i]
    const p2 = poly[(i + 1) % n]
    if ((p1.x <= x && p2.x > x) || (p2.x <= x && p1.x > x)) {
      const y = p1.y + ((x - p1.x) * (p2.y - p1.y)) / (p2.x - p1.x)
      yIntersects.push(y)
    }
  }

  yIntersects.sort((a, b) => a - b)
  const segments: [number, number][] = []
  for (let i = 0; i < yIntersects.length; i += 2) {
    if (i + 1 < yIntersects.length) {
      segments.push([yIntersects[i], yIntersects[i + 1]])
    }
  }
  return segments
}

/**
 * Menghitung keseluruhan layout plafon gypsum tile (simetris persegi maupun asimetris poligon).
 */
export function calculateGypsumTileLayout(params: {
  roomWidthM: number
  roomLengthM: number
  pts?: Point[]
  orientation?: GypsumOrientation
  tileLengthM?: number
  tileWidthM?: number
  safetyWaste?: number
}): GypsumTileCalculationResult {
  const {
    roomWidthM,
    roomLengthM,
    pts,
    orientation = "horizontal",
    tileLengthM = GYPSUM_LENGTH_M,
    tileWidthM = GYPSUM_WIDTH_M,
    safetyWaste = SAFETY_WASTE_FACTOR,
  } = params

  // Tentukan dimensi modul pada sumbu X dan sumbu Y berdasarkan orientasi
  const tileDimX = orientation === "horizontal" ? tileLengthM : tileWidthM
  const tileDimY = orientation === "horizontal" ? tileWidthM : tileLengthM

  const isIrregular = checkIsIrregular(pts)

  let normPts: Point[] | null = null
  let roomAreaM2 = Number((roomWidthM * roomLengthM).toFixed(2))
  let roomPerimeterM = Number((2 * (roomWidthM + roomLengthM)).toFixed(2))

  if (pts && pts.length >= 3) {
    const xs = pts.map((p) => p.x)
    const ys = pts.map((p) => p.y)
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    normPts = pts.map((p) => ({ x: p.x - minX, y: p.y - minY }))

    roomAreaM2 = Number(calcPolygonArea(normPts).toFixed(2))

    let perim = 0
    for (let i = 0; i < normPts.length; i++) {
      const j = (i + 1) % normPts.length
      perim += Math.hypot(normPts[j].x - normPts[i].x, normPts[j].y - normPts[i].y)
    }
    roomPerimeterM = Number(perim.toFixed(2))
  }

  const xAxis = calcTile1D(roomWidthM, tileDimX)
  const yAxis = calcTile1D(roomLengthM, tileDimY)

  const hasBorderX = xAxis.borderCutM > 0
  const hasBorderY = yAxis.borderCutM > 0

  // X interval list
  const xSegments: { x: number; w: number; isBorder: boolean }[] = []
  let currX = 0
  if (hasBorderX) {
    xSegments.push({ x: currX, w: xAxis.borderCutM, isBorder: true })
    currX += xAxis.borderCutM
  }
  for (let i = 0; i < xAxis.fullTiles; i++) {
    xSegments.push({ x: currX, w: tileDimX, isBorder: false })
    currX += tileDimX
  }
  if (hasBorderX) {
    xSegments.push({ x: currX, w: xAxis.borderCutM, isBorder: true })
  }

  // Y interval list
  const ySegments: { y: number; h: number; isBorder: boolean }[] = []
  let currY = 0
  if (hasBorderY) {
    ySegments.push({ y: currY, h: yAxis.borderCutM, isBorder: true })
    currY += yAxis.borderCutM
  }
  for (let j = 0; j < yAxis.fullTiles; j++) {
    ySegments.push({ y: currY, h: tileDimY, isBorder: false })
    currY += tileDimY
  }
  if (hasBorderY) {
    ySegments.push({ y: currY, h: yAxis.borderCutM, isBorder: true })
  }

  // Generate Cells
  const cells: GypsumTileCell[] = []
  for (let r = 0; r < ySegments.length; r++) {
    for (let c = 0; c < xSegments.length; c++) {
      const segX = xSegments[c]
      const segY = ySegments[r]

      const cellRect = {
        x: Number(segX.x.toFixed(4)),
        y: Number(segY.y.toFixed(4)),
        w: Number(segX.w.toFixed(4)),
        h: Number(segY.h.toFixed(4)),
      }

      if (isIrregular && normPts) {
        const status = classifyCellAgainstPoly(cellRect, normPts)
        if (status === "OUTSIDE") {
          continue // Abaikan panel yang 100% di luar ruangan
        }

        cells.push({
          id: `tile_${c}_${r}`,
          col: c,
          row: r,
          type: status === "FULL" ? "FULL" : "BORDER",
          ...cellRect,
        })
      } else {
        let cellType: "FULL" | "BORDER_X" | "BORDER_Y" | "CORNER" = "FULL"
        if (segX.isBorder && segY.isBorder) {
          cellType = "CORNER"
        } else if (segX.isBorder) {
          cellType = "BORDER_X"
        } else if (segY.isBorder) {
          cellType = "BORDER_Y"
        }

        cells.push({
          id: `tile_${c}_${r}`,
          col: c,
          row: r,
          type: cellType,
          ...cellRect,
        })
      }
    }
  }

  // Hitung jumlah panel
  let totalFullTiles = 0
  let borderTilesTopBottom = 0
  let borderTilesLeftRight = 0
  let cornerTiles = 0
  let totalBorderTiles = 0

  if (isIrregular && normPts) {
    totalFullTiles = cells.filter((c) => c.type === "FULL").length
    totalBorderTiles = cells.filter((c) => c.type !== "FULL").length
  } else {
    totalFullTiles = xAxis.fullTiles * yAxis.fullTiles
    borderTilesTopBottom = hasBorderY ? 2 * xAxis.fullTiles : 0
    borderTilesLeftRight = hasBorderX ? 2 * yAxis.fullTiles : 0
    cornerTiles = (hasBorderX && hasBorderY) ? 4 : 0
    totalBorderTiles = borderTilesTopBottom + borderTilesLeftRight + cornerTiles
  }

  const totalTilesNeeded = totalFullTiles + totalBorderTiles
  const safetyWasteTiles = Math.ceil(totalTilesNeeded * safetyWaste)
  const totalTilesToOrder = totalTilesNeeded + safetyWasteTiles

  // Generate Grid Lines
  const gridLines: GypsumTileGridLine[] = []

  // Vertical Grid Lines
  let lineX = 0
  for (let c = 0; c < xSegments.length - 1; c++) {
    lineX += xSegments[c].w
    const isBorderLine = (c === 0 && hasBorderX) || (c === xSegments.length - 2 && hasBorderX)
    const coordX = Number(lineX.toFixed(4))

    if (isIrregular && normPts) {
      const segs = getVerticalSegmentsInPoly(coordX, normPts)
      for (const [yFrom, yTo] of segs) {
        if (yTo - yFrom > 0.05) {
          gridLines.push({
            type: isBorderLine ? "border" : "cross",
            orientation: "v",
            coord: coordX,
            from: Number(yFrom.toFixed(4)),
            to: Number(yTo.toFixed(4)),
          })
        }
      }
    } else {
      gridLines.push({
        type: isBorderLine ? "border" : "cross",
        orientation: "v",
        coord: coordX,
        from: 0,
        to: roomLengthM,
      })
    }
  }

  // Horizontal Grid Lines
  let lineY = 0
  for (let r = 0; r < ySegments.length - 1; r++) {
    lineY += ySegments[r].h
    const isBorderLine = (r === 0 && hasBorderY) || (r === ySegments.length - 2 && hasBorderY)
    const coordY = Number(lineY.toFixed(4))

    if (isIrregular && normPts) {
      const segs = getHorizontalSegmentsInPoly(coordY, normPts)
      for (const [xFrom, xTo] of segs) {
        if (xTo - xFrom > 0.05) {
          gridLines.push({
            type: isBorderLine ? "border" : "main",
            orientation: "h",
            coord: coordY,
            from: Number(xFrom.toFixed(4)),
            to: Number(xTo.toFixed(4)),
          })
        }
      }
    } else {
      gridLines.push({
        type: isBorderLine ? "border" : "main",
        orientation: "h",
        coord: coordY,
        from: 0,
        to: roomWidthM,
      })
    }
  }

  // Estimasi BoQ Rangka Plafon T-Bar (Sesuai volume bersih modul grid & AHSP, dibulatkan ke atas)
  // 1. Wall Angle: keliling ruangan
  const wallAngleTotalM = Number(roomPerimeterM.toFixed(2))
  const wallAnglePcs = Math.ceil(wallAngleTotalM / WALL_ANGLE_LENGTH_M)

  // 2. Main Tee 3.6m:
  let mainTeeTotalM = 0
  let mainTeePcs = 0
  if (isIrregular && normPts) {
    const mainLines = gridLines.filter((l) => l.type === "main")
    const totalLen = mainLines.reduce((acc, l) => acc + (l.to - l.from), 0)
    mainTeeTotalM = Number(totalLen.toFixed(2))
    mainTeePcs = Math.ceil(mainTeeTotalM / MAIN_TEE_LENGTH_M)
  } else {
    const mainTeeTracks = Math.max(1, Math.ceil(roomLengthM / 1.2))
    mainTeeTotalM = Number((mainTeeTracks * roomWidthM).toFixed(2))
    mainTeePcs = Math.ceil(mainTeeTotalM / MAIN_TEE_LENGTH_M)
  }

  // 3. Cross Tee 1.2m:
  let crossTeeTotalPcs = 0
  let crossTeeTotalM = 0
  if (isIrregular && normPts) {
    const crossLines = gridLines.filter((l) => l.type === "cross")
    const totalLen = crossLines.reduce((acc, l) => acc + (l.to - l.from), 0)
    crossTeeTotalM = Number(totalLen.toFixed(2))
    crossTeeTotalPcs = Math.ceil(crossTeeTotalM / CROSS_TEE_LENGTH_M)
  } else {
    const crossTeeColumns = Math.max(1, Math.ceil(roomWidthM / 1.2))
    const crossTeeRows = Math.max(1, Math.ceil(roomLengthM / 0.6))
    crossTeeTotalPcs = crossTeeColumns * crossTeeRows
    crossTeeTotalM = Number((crossTeeTotalPcs * CROSS_TEE_LENGTH_M).toFixed(2))
  }

  // 4. Rod Hanger / Penggantung: titik gantung tiap interval 1.2m pada Main Tee
  const hangerPerTrack = Math.max(2, Math.ceil(roomWidthM / 1.2) + 1)
  const mainTeeTracksCount = Math.max(1, Math.ceil(roomLengthM / 1.2))
  const rodHangerPcs = mainTeeTracksCount * hangerPerTrack

  // 5. Rincian Kuantitas Resmi Jayaboard (Sheet "Koefisien 1.75")
  const jayaboardOrderTiles = roomAreaM2 > 0 ? Math.ceil(roomAreaM2 * JAYABOARD_COEF.GYPTILE_NATURA) : totalTilesToOrder
  const jayaboardMainTeePcs = roomAreaM2 > 0 ? Math.ceil(roomAreaM2 * JAYABOARD_COEF.MAIN_TEE_400) : mainTeePcs
  const jayaboardCrossTeePcs = roomAreaM2 > 0 ? Math.ceil(roomAreaM2 * JAYABOARD_COEF.LONG_CROSS_TEE_402) : crossTeeTotalPcs
  const jayaboardWallAnglePcs = roomAreaM2 > 0 ? Math.ceil(roomAreaM2 * JAYABOARD_COEF.WALL_ANGLE_408) : wallAnglePcs
  const springAdjusterPcs = roomAreaM2 > 0 ? Math.ceil(roomAreaM2 * JAYABOARD_COEF.SPRING_ADJUSTER_410) : rodHangerPcs
  const galvanisedSuspRodPcs = roomAreaM2 > 0 ? Math.ceil(roomAreaM2 * JAYABOARD_COEF.SUSPENSION_ROD_409) : Math.ceil(rodHangerPcs * 0.5)
  const angleBracketPcs = roomAreaM2 > 0 ? Math.ceil(roomAreaM2 * JAYABOARD_COEF.ANGLE_BRACKET_220) : rodHangerPcs

  return {
    orientation,
    roomWidthM,
    roomLengthM,
    roomAreaM2,
    roomPerimeterM,
    tileDimX,
    tileDimY,
    xAxis,
    yAxis,
    totalFullTiles,
    borderTilesTopBottom,
    borderTilesLeftRight,
    cornerTiles,
    totalBorderTiles,
    totalTilesNeeded,
    safetyWasteTiles,
    totalTilesToOrder: jayaboardOrderTiles,
    layoutPhysicalTiles: totalTilesToOrder,
    jayaboardOrderTiles,
    cells,
    gridLines,
    boq: {
      wallAnglePcs,
      wallAngleTotalM,
      mainTeePcs,
      mainTeeTotalM,
      crossTeePcs: crossTeeTotalPcs,
      crossTeeTotalM,
      rodHangerPcs,
      springAdjusterPcs,
      galvanisedSuspRodPcs,
      angleBracketPcs,
      jayaboardMainTeePcs,
      jayaboardCrossTeePcs,
      jayaboardWallAnglePcs,
    },
    isIrregular,
  }
}
