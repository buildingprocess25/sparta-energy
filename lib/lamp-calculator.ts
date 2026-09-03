import { pointInPolygon, Point } from "./polygon-utils"

export const LAMP_WATT = 13.5
export const LAMP_LEN = 1.22
export const LAMP_TUBE_W = 0.12
export const MIN_RATIO = 4.0
export const MAX_RATIO = 5.0

export interface LampRange {
  minLamps: number
  maxLamps: number
}

export function calcLampRange(
  area: number,
  watt: number = LAMP_WATT,
  wmin: number = MIN_RATIO,
  wmax: number = MAX_RATIO
): LampRange {
  return {
    minLamps: Math.ceil((area * wmin) / watt),
    maxLamps: Math.ceil((area * wmax) / watt),
  }
}

export interface PlacedLamp {
  x: number
  y: number
  dir: "h" | "v"
}

export function placeLamps(
  pts: Point[],
  jarak: number,
  margin: number,
  orient: "h" | "v" = "h",
  lampLen: number = LAMP_LEN,
  spasiLampu: number = 0,
  targetBaris?: number,
  targetLpb?: number
): PlacedLamp[] {
  if (!pts || pts.length < 3) return []
  const xs = pts.map((p) => p.x),
    ys = pts.map((p) => p.y)
  const minX = Math.min(...xs),
    maxX = Math.max(...xs)
  const minY = Math.min(...ys),
    maxY = Math.max(...ys)
  const W = maxX - minX,
    H = maxY - minY
  const lamps: PlacedLamp[] = []
  const half = lampLen / 2

  if (orient === "h") {
    const nY = targetBaris && targetBaris > 0
      ? targetBaris
      : Math.max(1, jarak > 0 ? Math.round(H / jarak) - 1 : 1)
    const dY = H / (nY + 1)
    const nPts = pts.length

    for (let r = 0; r < nY; r++) {
      const y = minY + (r + 1) * dY

      // Exact analytic horizontal ray intersection with polygon edges
      const intersections: number[] = []
      for (let i = 0; i < nPts; i++) {
        const p1 = pts[i]
        const p2 = pts[(i + 1) % nPts]
        if ((p1.y <= y && p2.y > y) || (p2.y <= y && p1.y > y)) {
          if (Math.abs(p2.y - p1.y) > 0.00001) {
            const t = (y - p1.y) / (p2.y - p1.y)
            const ix = p1.x + t * (p2.x - p1.x)
            intersections.push(ix)
          }
        }
      }
      intersections.sort((a, b) => a - b)
      if (intersections.length < 2) continue

      // Process interior horizontal spans for this row
      for (let s = 0; s < intersections.length - 1; s += 2) {
        const leftX = intersections[s]
        const rightX = intersections[s + 1]
        const rowW = rightX - leftX
        if (rowW < lampLen * 0.8) continue

        // Independent per-row lamp fitting
        let calculatedN = Math.floor((rowW - 2 * margin + spasiLampu + 0.001) / (lampLen + spasiLampu))
        if (calculatedN < 1 && rowW >= lampLen) {
          calculatedN = Math.floor((rowW + 0.001) / (lampLen + spasiLampu))
        }
        calculatedN = Math.max(0, calculatedN)

        const nPerRow = targetLpb && targetLpb > 0
          ? Math.min(targetLpb, calculatedN)
          : calculatedN

        if (nPerRow <= 0) continue

        const usedW = nPerRow * lampLen + (nPerRow > 1 ? (nPerRow - 1) * spasiLampu : 0)
        if (usedW > rowW + 0.001) continue

        const jarakSamping = (rowW - usedW) / 2
        const firstX = leftX + jarakSamping + half

        for (let c = 0; c < nPerRow; c++) {
          const x = firstX + c * (lampLen + spasiLampu)
          if (
            pointInPolygon({ x: x - half + 0.001, y }, pts) &&
            pointInPolygon({ x: x + half - 0.001, y }, pts)
          ) {
            lamps.push({ x, y, dir: "h" })
          }
        }
      }
    }
  } else {
    const nX = targetBaris && targetBaris > 0
      ? targetBaris
      : Math.max(1, jarak > 0 ? Math.round(W / jarak) - 1 : 1)
    const dX = W / (nX + 1)
    const nPts = pts.length

    for (let c = 0; c < nX; c++) {
      const x = minX + (c + 1) * dX

      // Exact analytic vertical ray intersection with polygon edges
      const intersections: number[] = []
      for (let i = 0; i < nPts; i++) {
        const p1 = pts[i]
        const p2 = pts[(i + 1) % nPts]
        if ((p1.x <= x && p2.x > x) || (p2.x <= x && p1.x > x)) {
          if (Math.abs(p2.x - p1.x) > 0.00001) {
            const t = (x - p1.x) / (p2.x - p1.x)
            const iy = p1.y + t * (p2.y - p1.y)
            intersections.push(iy)
          }
        }
      }
      intersections.sort((a, b) => a - b)
      if (intersections.length < 2) continue

      // Process interior vertical spans for this column
      for (let s = 0; s < intersections.length - 1; s += 2) {
        const topY = intersections[s]
        const bottomY = intersections[s + 1]
        const colH = bottomY - topY
        if (colH < lampLen * 0.8) continue

        let calculatedN = Math.floor((colH - 2 * margin + spasiLampu + 0.001) / (lampLen + spasiLampu))
        if (calculatedN < 1 && colH >= lampLen) {
          calculatedN = Math.floor((colH + 0.001) / (lampLen + spasiLampu))
        }
        calculatedN = Math.max(0, calculatedN)

        const nPerCol = targetLpb && targetLpb > 0
          ? Math.min(targetLpb, calculatedN)
          : calculatedN

        if (nPerCol <= 0) continue

        const usedH = nPerCol * lampLen + (nPerCol > 1 ? (nPerCol - 1) * spasiLampu : 0)
        if (usedH > colH + 0.001) continue

        const jarakAtas = (colH - usedH) / 2
        const firstY = topY + jarakAtas + half

        for (let r = 0; r < nPerCol; r++) {
          const y = firstY + r * (lampLen + spasiLampu)
          if (
            pointInPolygon({ x, y: y - half + 0.001 }, pts) &&
            pointInPolygon({ x, y: y + half - 0.001 }, pts)
          ) {
            lamps.push({ x, y, dir: "v" })
          }
        }
      }
    }
  }

  return lamps
}

export function offsetPolygon(pts: Point[], d: number): Point[] | null {
  try {
    const n = pts.length
    return pts.map((curr, i) => {
      const prev = pts[(i - 1 + n) % n],
        next = pts[(i + 1) % n]
      const ax = curr.x - prev.x,
        ay = curr.y - prev.y
      const bx = next.x - curr.x,
        by = next.y - curr.y
      const la = Math.hypot(ax, ay) || 1,
        lb = Math.hypot(bx, by) || 1
      const na = { x: ay / la, y: -ax / la },
        nb = { x: by / lb, y: -bx / lb }
      const nx = na.x + nb.x,
        ny = na.y + nb.y
      const l = Math.hypot(nx, ny) || 1
      const dot = na.x * nb.x + na.y * nb.y
      const miter = d / Math.max(0.2, Math.sqrt((1 + dot) / 2))
      return { x: curr.x + (nx / l) * miter, y: curr.y + (ny / l) * miter }
    })
  } catch {
    return null
  }
}

export interface ShapeParams {
  rP: number
  rL: number
  rTop: number
  rBot: number
  rLeft: number
  rRight: number
  tTop: number
  tBot: number
  tH: number
  tOff: number
  lP: number
  lL: number
  lW: number
  lH: number
}

export function buildPolygon(
  shape: string,
  p: ShapeParams,
  customPts: Point[],
  customClosed: boolean
): Point[] | null {
  switch (shape) {
    case "rect":
      return [
        { x: 0, y: 0 },
        { x: p.rTop, y: 0 },
        { x: p.rBot, y: p.rRight },
        { x: 0, y: p.rLeft },
      ]
    case "trap":
      return [
        { x: p.tOff, y: 0 },
        { x: p.tOff + p.tTop, y: 0 },
        { x: p.tBot, y: p.tH },
        { x: 0, y: p.tH },
      ]
    case "L":
      return [
        { x: 0, y: 0 },
        { x: p.lL, y: 0 },
        { x: p.lL, y: p.lH },
        { x: p.lW, y: p.lH },
        { x: p.lW, y: p.lP },
        { x: 0, y: p.lP },
      ]
    case "custom":
      return customClosed && customPts.length >= 3 ? customPts : null
    default:
      return null
  }
}

export interface ScaleInfo {
  scale: number
  offX: number
  offY: number
  minX?: number
  minY?: number
  maxX?: number
  maxY?: number
  rW: number
  rH: number
}

export function getScaleInfo(
  pts: Point[],
  canvasW: number,
  canvasH: number
): ScaleInfo {
  if (!pts || !pts.length)
    return { scale: 20, offX: 40, offY: 40, rW: 10, rH: 10 }
  const xs = pts.map((p) => p.x),
    ys = pts.map((p) => p.y)
  const minX = Math.min(...xs),
    maxX = Math.max(...xs)
  const minY = Math.min(...ys),
    maxY = Math.max(...ys)
  const rW = maxX - minX || 1,
    rH = maxY - minY || 1
  const s = Math.min((canvasW - 80) / rW, (canvasH - 80) / rH)
  return {
    scale: s,
    offX: 40 + (canvasW - 80 - rW * s) / 2 - minX * s,
    offY: 40 + (canvasH - 80 - rH * s) / 2 - minY * s,
    minX,
    minY,
    maxX,
    maxY,
    rW,
    rH,
  }
}

export function generateGridPositions(
  lebar: number,
  panjang: number,
  baris: number,
  lampuPerbaris: number,
  lampLen: number = LAMP_LEN
): { positions: Point[]; jarakPerbaris: number; jarakSamping: number } {
  const jarakPerbaris = panjang / (baris + 1)
  const jarakSamping = (lebar - lampuPerbaris * lampLen) / 2
  const firstX = jarakSamping + lampLen / 2
  const positions: Point[] = []
  for (let r = 1; r <= baris; r++) {
    for (let c = 0; c < lampuPerbaris; c++) {
      positions.push({
        x: lampuPerbaris === 1 ? lebar / 2 : firstX + c * lampLen,
        y: r * jarakPerbaris,
      })
    }
  }
  return { positions, jarakPerbaris, jarakSamping }
}

export interface SimetrisResult {
  baris: number
  lampuPerbaris: number
  total: number
  jarakPerbaris: number
  jarakSamping: number
  rasio: number
  minLamps: number
  maxLamps: number
  sampling: {
    C33: number
    lpbMax: number
    lpbMin: number
    lpbM1: number
    jsMax: number
    jsMin: number
    jsM1: number
    C34: number
  }
}

export function calcSimetris(
  lebar: number,
  panjang: number,
  areaSales: number,
  watt: number = LAMP_WATT,
  lampLen: number = LAMP_LEN
): SimetrisResult {
  const limitMaxLamps = Math.ceil((5.0 * areaSales) / watt)
  const limitMinLamps = Math.ceil((4.0 * areaSales) / watt)

  // 1. Opsi jumlah lampu per baris berdasarkan Lebar Toko
  const lpbMax = Math.ceil(lebar / lampLen)
  const lpbMin = Math.floor(lebar / lampLen)
  const lpbM1 = Math.max(1, lpbMin - 1)

  // Jarak samping untuk masing-masing opsi
  const jsMax = (lebar - lpbMax * lampLen) / 2
  const jsMin = (lebar - lpbMin * lampLen) / 2
  const jsM1 = (lebar - lpbM1 * lampLen) / 2

  // 2. Memilih Lampu Per Baris (lpb) terpilih berdasarkan rentang ideal [0.3, 0.6]
  let lpb: number
  let jarakSamping: number
  const inRange = (v: number) => v >= 0.3 && v <= 0.6

  if (inRange(jsMin)) {
    lpb = lpbMin
    jarakSamping = jsMin
  } else if (inRange(jsMax)) {
    lpb = lpbMax
    jarakSamping = jsMax
  } else if (inRange(jsM1)) {
    lpb = lpbM1
    jarakSamping = jsM1
  } else {
    lpb = lpbM1
    jarakSamping = jsM1
  }

  // 3. Jumlah Lampu Sampling (Cell C32)
  // Formula Excel: =IF(FLOOR(TotalMax, LampuPerBaris) < TotalMin, CEILING(TotalMin, LampuPerBaris), FLOOR(TotalMax, LampuPerBaris))
  const floorMax = Math.floor(limitMaxLamps / lpb) * lpb
  const ceilMin = Math.ceil(limitMinLamps / lpb) * lpb
  const jumlahLampuSampling = floorMax < limitMinLamps ? ceilMin : floorMax

  // 4. Jumlah Baris Sampling (Cell C33)
  const C33 = Math.max(1, Math.round(jumlahLampuSampling / lpb))

  // 5. Jarak Per Baris Sampling (Cell C34)
  const C34 = panjang / (C33 + 1)

  // 6. Koreksi Jumlah Baris Aktual (Cell C15)
  // Formula Excel: =IF(JarakPerBarisSampling > 1.9, JumlahBarisSampling + 1, JumlahBarisSampling)
  const baris = C34 > 1.9 ? C33 + 1 : C33

  // 7. Nilai Final (Baseline Layout Grid)
  const total = baris * lpb
  const jarakPerbaris = panjang / (baris + 1)
  const rasio = Math.round(((total * watt) / areaSales) * 100) / 100

  // Acuan standar target 4.0 s/d 5.0 W/m² (Excel standard)
  const minLamps = limitMinLamps
  const maxLamps = Math.max(limitMaxLamps, total)

  return {
    baris,
    lampuPerbaris: lpb,
    total,
    jarakPerbaris,
    jarakSamping,
    rasio,
    minLamps,
    maxLamps,
    sampling: {
      C33,
      lpbMax,
      lpbMin,
      lpbM1,
      jsMax,
      jsMin,
      jsM1,
      C34,
    },
  }
}

export interface IregularResult {
  baris: number
  lampuPerbaris: number
  total: number
  jarakPerbaris: number
  jarakSamping: number
  rasio: number
  minLamps: number
  maxLamps: number
}

export function calcIregular(
  area: number,
  lebar: number,
  panjang: number,
  watt: number = LAMP_WATT,
  lampLen: number = LAMP_LEN
): IregularResult | null {
  const virtualArea = lebar * panjang
  const sim = calcSimetris(lebar, panjang, virtualArea, watt, lampLen)
  if (!sim) return null

  // Calculate ratio based on actual polygon area
  const rasio = Math.round(((sim.total * watt) / area) * 100) / 100
  // Acuan standar target 4.0 s/d 5.0 W/m² (Excel standard) berdasarkan luas aktual polygon
  const minLamps = Math.ceil((4.0 * area) / watt)
  const maxLamps = Math.max(Math.ceil((5.0 * area) / watt), sim.total)

  return {
    baris: sim.baris,
    lampuPerbaris: sim.lampuPerbaris,
    total: sim.total,
    jarakPerbaris: sim.jarakPerbaris,
    jarakSamping: sim.jarakSamping,
    rasio,
    minLamps,
    maxLamps,
  }
}

/**
 * Preset Polygon Generators for Quick Layout Setup
 */
export function generateRectPolygon(lebar: number, panjang: number): Point[] {
  const w = Math.max(1, lebar)
  const h = Math.max(1, panjang)
  return [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ]
}

export function generateLShapePolygon(p: number, l: number, w: number, h: number): Point[] {
  const L = Math.max(1, l)
  const P = Math.max(1, p)
  const W = Math.min(L - 0.5, Math.max(0.5, w))
  const H = Math.min(P - 0.5, Math.max(0.5, h))
  return [
    { x: 0, y: 0 },
    { x: L, y: 0 },
    { x: L, y: H },
    { x: W, y: H },
    { x: W, y: P },
    { x: 0, y: P },
  ]
}

export function generateCutoutPolygon(p: number, l: number, cutoutW: number, cutoutH: number): Point[] {
  const L = Math.max(1, l)
  const P = Math.max(1, p)
  const cW = Math.min(L - 0.5, Math.max(0.5, cutoutW))
  const cH = Math.min(P - 0.5, Math.max(0.5, cutoutH))
  return [
    { x: 0, y: 0 },
    { x: L, y: 0 },
    { x: L, y: P - cH },
    { x: L - cW, y: P - cH },
    { x: L - cW, y: P },
    { x: 0, y: P },
  ]
}

