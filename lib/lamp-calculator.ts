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
  spasiLampu: number = 0
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
    const nY = Math.max(1, Math.floor((H - 2 * margin) / jarak) + 1)
    const dY = H / (nY + 1)

    for (let r = 0; r < nY; r++) {
      const y = minY + (r + 1) * dY
      let leftX: number | null = null,
        rightX: number | null = null
      for (let x = minX; x <= maxX; x += 0.1) {
        if (pointInPolygon({ x, y }, pts)) {
          if (leftX === null) leftX = x
          rightX = x
        }
      }
      if (leftX === null || rightX === null) continue

      const rowW = rightX - leftX
      const nPerRow = Math.max(
        1,
        Math.floor((rowW - 2 * margin + spasiLampu) / (lampLen + spasiLampu))
      )
      const usedW =
        nPerRow * lampLen + (nPerRow > 1 ? (nPerRow - 1) * spasiLampu : 0)
      if (usedW > rowW) continue

      const jarakSamping = (rowW - usedW) / 2
      const firstX = leftX + jarakSamping + half

      for (let c = 0; c < nPerRow; c++) {
        const x = firstX + c * (lampLen + spasiLampu)
        if (
          pointInPolygon({ x: x - half, y }, pts) &&
          pointInPolygon({ x: x + half, y }, pts)
        ) {
          lamps.push({ x, y, dir: "h" })
        }
      }
    }
  } else {
    const nX = Math.max(1, Math.floor((W - 2 * margin) / jarak) + 1)
    const dX = W / (nX + 1)

    for (let c = 0; c < nX; c++) {
      const x = minX + (c + 1) * dX
      let topY: number | null = null,
        bottomY: number | null = null
      for (let y = minY; y <= maxY; y += 0.1) {
        if (pointInPolygon({ x, y }, pts)) {
          if (topY === null) topY = y
          bottomY = y
        }
      }
      if (topY === null || bottomY === null) continue

      const colH = bottomY - topY
      const nPerCol = Math.max(
        1,
        Math.floor((colH - 2 * margin + spasiLampu) / (lampLen + spasiLampu))
      )
      const usedH =
        nPerCol * lampLen + (nPerCol > 1 ? (nPerCol - 1) * spasiLampu : 0)
      if (usedH > colH) continue

      const jarakAtas = (colH - usedH) / 2
      const firstY = topY + jarakAtas + half

      for (let r = 0; r < nPerCol; r++) {
        const y = firstY + r * (lampLen + spasiLampu)
        if (
          pointInPolygon({ x, y: y - half }, pts) &&
          pointInPolygon({ x, y: y + half }, pts)
        ) {
          lamps.push({ x, y, dir: "v" })
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

  // Opsi B1: Range berbasis Baseline Layout ± 2 Titik (Toleransi Fisik Lapangan)
  const minLamps = Math.max(1, total - 2)
  const maxLamps = total + 2

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
  // Opsi B1: Range berbasis Baseline Layout ± 2 Titik (Toleransi Fisik Lapangan)
  const minLamps = Math.max(1, sim.total - 2)
  const maxLamps = sim.total + 2

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
