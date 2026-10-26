import { Point } from "./polygon-utils"

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
  type: "FULL" | "BORDER_X" | "BORDER_Y" | "CORNER"
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

  const initialHalfCut = remainderInitial / 2
  const minAllowedCut = panelDim * minRatio

  // Jika potongan tepi awal < 50% dan ada panel utuh yang bisa dikorbankan
  if (initialHalfCut < minAllowedCut && fullPanelsInitial > 0) {
    const revisedFull = fullPanelsInitial - 1
    const revisedMargin = remainderInitial + panelDim
    const borderCut = revisedMargin / 2

    return {
      axisDimensionM: roundedDim,
      panelDimM: panelDim,
      fullTiles: revisedFull,
      borderCutM: Number(borderCut.toFixed(4)),
      borderCutCm: Math.round(borderCut * 100),
      borderCutRatio: Number((borderCut / panelDim).toFixed(4)),
      isRevised: true,
      originalCutM: Number(initialHalfCut.toFixed(4)),
      minAllowedCutM: Number(minAllowedCut.toFixed(4)),
      isCompliant: borderCut >= minAllowedCut - 0.001,
    }
  }

  return {
    axisDimensionM: roundedDim,
    panelDimM: panelDim,
    fullTiles: fullPanelsInitial,
    borderCutM: Number(initialHalfCut.toFixed(4)),
    borderCutCm: Math.round(initialHalfCut * 100),
    borderCutRatio: Number((initialHalfCut / panelDim).toFixed(4)),
    isRevised: false,
    originalCutM: Number(initialHalfCut.toFixed(4)),
    minAllowedCutM: Number(minAllowedCut.toFixed(4)),
    isCompliant: initialHalfCut >= minAllowedCut - 0.001,
  }
}

/**
 * Menghitung keseluruhan grid plafon gypsum tile 2 dimensi (luas, potongan, panel utuh, list sel, garis grid, BoQ).
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
    orientation = "horizontal",
    tileLengthM = GYPSUM_LENGTH_M,
    tileWidthM = GYPSUM_WIDTH_M,
    safetyWaste = SAFETY_WASTE_FACTOR,
  } = params

  // Tentukan dimensi modul pada sumbu X dan sumbu Y berdasarkan orientasi
  const tileDimX = orientation === "horizontal" ? tileLengthM : tileWidthM
  const tileDimY = orientation === "horizontal" ? tileWidthM : tileLengthM

  const xAxis = calcTile1D(roomWidthM, tileDimX)
  const yAxis = calcTile1D(roomLengthM, tileDimY)

  const roomAreaM2 = Number((roomWidthM * roomLengthM).toFixed(2))
  const roomPerimeterM = Number((2 * (roomWidthM + roomLengthM)).toFixed(2))

  const totalFullTiles = xAxis.fullTiles * yAxis.fullTiles
  const hasBorderX = xAxis.borderCutM > 0
  const hasBorderY = yAxis.borderCutM > 0

  // Pembedahan panel potongan tepi
  const borderTilesTopBottom = hasBorderY ? 2 * xAxis.fullTiles : 0
  const borderTilesLeftRight = hasBorderX ? 2 * yAxis.fullTiles : 0
  const cornerTiles = (hasBorderX && hasBorderY) ? 4 : 0
  const totalBorderTiles = borderTilesTopBottom + borderTilesLeftRight + cornerTiles

  const totalTilesNeeded = totalFullTiles + totalBorderTiles
  const safetyWasteTiles = Math.ceil(totalTilesNeeded * safetyWaste)
  const totalTilesToOrder = totalTilesNeeded + safetyWasteTiles

  // Generate grid coordinates for canvas & tiles
  const cells: GypsumTileCell[] = []
  const gridLines: GypsumTileGridLine[] = []

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
  for (let r = 0; r < ySegments.length; r++) {
    for (let c = 0; c < xSegments.length; c++) {
      const segX = xSegments[c]
      const segY = ySegments[r]

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
        x: Number(segX.x.toFixed(4)),
        y: Number(segY.y.toFixed(4)),
        w: Number(segX.w.toFixed(4)),
        h: Number(segY.h.toFixed(4)),
      })
    }
  }

  // Generate Vertical Grid Lines
  let lineX = 0
  for (let c = 0; c < xSegments.length - 1; c++) {
    lineX += xSegments[c].w
    const isBorderLine = (c === 0 && hasBorderX) || (c === xSegments.length - 2 && hasBorderX)
    gridLines.push({
      type: isBorderLine ? "border" : "cross",
      orientation: "v",
      coord: Number(lineX.toFixed(4)),
      from: 0,
      to: roomLengthM,
    })
  }

  // Generate Horizontal Grid Lines
  let lineY = 0
  for (let r = 0; r < ySegments.length - 1; r++) {
    lineY += ySegments[r].h
    const isBorderLine = (r === 0 && hasBorderY) || (r === ySegments.length - 2 && hasBorderY)
    gridLines.push({
      type: isBorderLine ? "border" : "main",
      orientation: "h",
      coord: Number(lineY.toFixed(4)),
      from: 0,
      to: roomWidthM,
    })
  }

  // Estimasi BoQ Rangka Plafon T-Bar
  // 1. Wall Angle: keliling ruangan + waste 5%
  const wallAngleTotalM = Number((roomPerimeterM * 1.05).toFixed(2))
  const wallAnglePcs = Math.ceil(wallAngleTotalM / WALL_ANGLE_LENGTH_M)

  // 2. Main Tee 3.6m: jalur memanjang searah interval 1.2m
  const mainTeeTracks = Math.max(1, Math.ceil(roomLengthM / 1.2))
  const mainTeeTotalM = Number((mainTeeTracks * roomWidthM * 1.05).toFixed(2))
  const mainTeePcs = Math.ceil(mainTeeTotalM / MAIN_TEE_LENGTH_M)

  // 3. Cross Tee 1.2m: batang melintang di antara Main Tee setiap interval 0.6m
  const crossTeeColumns = Math.max(1, Math.ceil(roomWidthM / 1.2))
  const crossTeeRows = Math.max(1, Math.ceil(roomLengthM / 0.6))
  const crossTeeTotalPcs = Math.ceil(crossTeeColumns * crossTeeRows * 1.05)
  const crossTeeTotalM = Number((crossTeeTotalPcs * CROSS_TEE_LENGTH_M).toFixed(2))

  // 4. Rod Hanger / Penggantung: titik gantung tiap interval 1.2m pada Main Tee
  const hangerPerTrack = Math.max(2, Math.ceil(roomWidthM / 1.2) + 1)
  const rodHangerPcs = mainTeeTracks * hangerPerTrack

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
  }
}
