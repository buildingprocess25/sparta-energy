import { Point } from "./polygon-utils"
import type { WallSegment, ValidWallSpan, PlacedAcUnit } from "@/app/ac-mapping/ac-mapping-client"
import type { ParsedCadStoreData } from "@/lib/cad/dxf-parser"

// Syarat bentang minimum untuk unit indoor Daikin 2 PK (1.05m bodi + 2x0.25m jarak aman)
const MIN_SPAN_LENGTH_FOR_AC = 1.55

// Jarak aman baku dari tepi rintangan / fixture saat digeser
const FIXTURE_CLEARANCE_M = 0.60
const CASHIER_CLEARANCE_M = 0.62

// Jarak aman fisik minimum antar titik pusat 2 unit AC bersebelahan (mencegah tabrakan bodi 1.05m)
const MIN_AC_SPACING_M = 2.0

export interface OptimizeAcPlacementOptions {
  customPts: Point[]
  wallSegments: WallSegment[]
  validSpans: ValidWallSpan[]
  targetCount: number
  cadData?: ParsedCadStoreData | null
  throwRadiusM?: number
  spreadAngleDeg?: number
}

interface MacroWallSide {
  sideIndex: number
  p1: Point
  p2: Point
  totalLengthM: number
  wallIndices: number[]
  validSpans: ValidWallSpan[]
  usableLengthM: number
  maxCapacity: number
}

/**
 * Menghitung kapasitas maksimum unit AC yang dapat dipasang pada suatu bentang dinding
 * tanpa ada benturan fisik antar unit AC (Bodi Daikin 2 PK = 1.05m).
 */
function getSpanMaxCapacity(spanLenM: number): number {
  if (spanLenM < MIN_SPAN_LENGTH_FOR_AC) return 0
  if (spanLenM < 3.6) return 1
  if (spanLenM < 5.8) return 2
  if (spanLenM < 8.2) return 3
  if (spanLenM < 11.0) return 4
  if (spanLenM < 14.5) return 5
  if (spanLenM < 18.5) return 6
  return Math.max(1, Math.floor(spanLenM / MIN_AC_SPACING_M))
}

/**
 * Universal Dynamic AC Placement Engine
 *
 * Menempatkan unit AC secara merata, simetris, dan estetis di sekeliling dinding toko:
 * - Menjamin TIDAK ADA tabrakan fisik antar bodi AC (Clearance >= 0.70m).
 * - Menghindari penumpukan unit AC pada satu sisi dinding tertentu.
 * - Membagi unit secara proporsional ke semua sisi dinding solid yang tersedia.
 */
export function optimizeAcPlacements({
  customPts,
  wallSegments,
  validSpans,
  targetCount,
}: OptimizeAcPlacementOptions): PlacedAcUnit[] {
  if (targetCount <= 0 || validSpans.length === 0 || customPts.length < 3) {
    return []
  }

  const N_PTS = customPts.length

  // 1. Deteksi sudut struktural asli denah (belokan sudut > 15°)
  const isStructuralCorner: boolean[] = customPts.map((pt, i) => {
    if (N_PTS <= 4) return true
    const prev = customPts[(i - 1 + N_PTS) % N_PTS]
    const next = customPts[(i + 1) % N_PTS]
    const v1x = pt.x - prev.x
    const v1y = pt.y - prev.y
    const v2x = next.x - pt.x
    const v2y = next.y - pt.y
    const len1 = Math.hypot(v1x, v1y) || 1
    const len2 = Math.hypot(v2x, v2y) || 1
    const dotVal = (v1x * v2x + v1y * v2y) / (len1 * len2)
    return dotVal < 0.97
  })

  // 2. Rekonstruksi Sisi Dinding Makro
  const macroSides: MacroWallSide[] = []
  let currentSideWalls: number[] = []
  let sideStartPt = customPts[0]

  for (let i = 0; i < N_PTS; i++) {
    currentSideWalls.push(i)
    const nextNodeIdx = (i + 1) % N_PTS
    if (isStructuralCorner[nextNodeIdx] || i === N_PTS - 1) {
      const p1 = sideStartPt
      const p2 = customPts[nextNodeIdx]
      const totalLen = currentSideWalls.reduce((sum, wIdx) => {
        const w = wallSegments.find((seg) => seg.index === wIdx)
        return sum + (w ? w.lengthM : 0)
      }, 0)

      // Hanya masukkan bentang yang memenuhi syarat minimum >= 1.55m
      const sideSpans = validSpans.filter(
        (sp) => currentSideWalls.includes(sp.wallIndex) && sp.lengthM >= MIN_SPAN_LENGTH_FOR_AC
      )
      const usableLen = sideSpans.reduce((sum, sp) => sum + sp.lengthM, 0)
      const maxCap = sideSpans.reduce((sum, sp) => sum + getSpanMaxCapacity(sp.lengthM), 0)

      macroSides.push({
        sideIndex: macroSides.length,
        p1,
        p2,
        totalLengthM: totalLen,
        wallIndices: [...currentSideWalls],
        validSpans: sideSpans,
        usableLengthM: usableLen,
        maxCapacity: maxCap,
      })

      currentSideWalls = []
      sideStartPt = customPts[nextNodeIdx]
    }
  }

  // Filter sisi makro yang memiliki bentang solid layak
  let eligibleMacroSides = macroSides.filter((side) => side.usableLengthM >= MIN_SPAN_LENGTH_FOR_AC && side.maxCapacity > 0)

  // Fallback jika tidak ada sisi yang lolos filter
  if (eligibleMacroSides.length === 0) {
    eligibleMacroSides = macroSides.filter((side) => side.validSpans.length > 0)
  }
  if (eligibleMacroSides.length === 0) {
    return validSpans.slice(0, targetCount).map((span, idx) => {
      const midT = (span.startT + span.endT) / 2
      const wall = span.wall
      return {
        id: `ac-unit-${idx + 1}`,
        wallIndex: span.wallIndex,
        ratio: Number(midT.toFixed(3)),
        customName: `AC 2 PK #${idx + 1}`,
        wallLabel: `Dinding T${wall.startIndex + 1} - T${wall.endIndex + 1}`,
      }
    })
  }

  // Total kapasitas toko yang aman tanpa tabrakan fisik
  const totalStoreMaxCapacity = eligibleMacroSides.reduce((sum, s) => sum + s.maxCapacity, 0)
  const effectiveTargetUnits = Math.min(targetCount, totalStoreMaxCapacity > 0 ? totalStoreMaxCapacity : targetCount)

  // 3. Alokasi Kuantitas Unit secara Proporsional, Merata & Anti-Tabrakan
  const sideAllocations = new Map<number, number>()
  eligibleMacroSides.forEach((side) => sideAllocations.set(side.sideIndex, 0))

  let remainingUnits = effectiveTargetUnits

  // Tahap 1: Berikan 1 unit ke setiap sisi makro yang layak (prioritas keliling toko)
  const sortedSides = [...eligibleMacroSides].sort((a, b) => b.usableLengthM - a.usableLengthM)

  for (const side of sortedSides) {
    if (remainingUnits > 0 && side.maxCapacity > 0) {
      sideAllocations.set(side.sideIndex, 1)
      remainingUnits--
    }
  }

  // Tahap 2: Distribusikan sisa unit ke sisi-sisi yang paling lapang (densitas terendah) tanpa melebihi maxCapacity
  while (remainingUnits > 0) {
    let bestSide: MacroWallSide | null = null
    let minDensity = Infinity

    for (const side of sortedSides) {
      const currentUnits = sideAllocations.get(side.sideIndex) || 0
      if (currentUnits < side.maxCapacity) {
        // Densitas: unit / panjang dinding usable
        const density = (currentUnits + 1) / side.usableLengthM
        if (density < minDensity) {
          minDensity = density
          bestSide = side
        }
      }
    }

    if (!bestSide) {
      // Semua sisi telah mencapai batas kapasitas aman fisik maksimal
      break
    }

    sideAllocations.set(bestSide.sideIndex, (sideAllocations.get(bestSide.sideIndex) || 0) + 1)
    remainingUnits--
  }

  // 4. Tempatkan Unit AC pada Setiap Sisi Makro & Bentang
  const placedAcResults: {
    wallIndex: number
    ratio: number
    wallOrder: number
  }[] = []

  eligibleMacroSides.forEach((side) => {
    const kCount = sideAllocations.get(side.sideIndex) || 0
    if (kCount === 0 || side.validSpans.length === 0) return

    const sideLen = side.totalLengthM
    const usableSpans = side.validSpans.filter((s) => s.lengthM >= MIN_SPAN_LENGTH_FOR_AC)

    if (usableSpans.length === 0) return

    // A. SISI MAKRO BERSIH 1 BENTANG (Misal Dinding Kiri 18.0m)
    if (usableSpans.length === 1 && side.usableLengthM / sideLen > 0.85) {
      const singleSpan = usableSpans[0]
      const spanRange = singleSpan.endT - singleSpan.startT

      for (let slot = 1; slot <= kCount; slot++) {
        const idealRatio = slot / (kCount + 1)
        const globalRatio = Number((singleSpan.startT + idealRatio * spanRange).toFixed(3))

        placedAcResults.push({
          wallIndex: singleSpan.wallIndex,
          ratio: globalRatio,
          wallOrder: singleSpan.wallIndex * 1000 + globalRatio * 100,
        })
      }
      return
    }

    // B. SISI MAKRO DENGAN BEBERAPA BENTANG (Terpotong Chiller / Kasir / Pintu)
    const spanUnitAlloc = new Map<number, number>()
    usableSpans.forEach((_, idx) => spanUnitAlloc.set(idx, 0))

    let unitsToDistribute = kCount

    // Urutkan bentang dari yang terpanjang
    const sortedSpanIndices = usableSpans
      .map((sp, idx) => ({ idx, len: sp.lengthM, maxCap: getSpanMaxCapacity(sp.lengthM) }))
      .sort((a, b) => b.len - a.len)

    // Setiap bentang solid layak dapat 1 unit jika cukup
    for (const item of sortedSpanIndices) {
      if (unitsToDistribute > 0 && item.maxCap > 0 && (spanUnitAlloc.get(item.idx) || 0) === 0) {
        spanUnitAlloc.set(item.idx, 1)
        unitsToDistribute--
      }
    }

    // Distribusikan sisa unit ke bentang yang masih di bawah maxCap masing-masing
    while (unitsToDistribute > 0) {
      let chosenIdx: number | null = null
      let lowestSpanDensity = Infinity

      for (const item of sortedSpanIndices) {
        const currentInSpan = spanUnitAlloc.get(item.idx) || 0
        if (currentInSpan < item.maxCap) {
          const spanDensity = (currentInSpan + 1) / item.len
          if (spanDensity < lowestSpanDensity) {
            lowestSpanDensity = spanDensity
            chosenIdx = item.idx
          }
        }
      }

      if (chosenIdx === null) {
        // Semua bentang pada sisi ini sudah penuh kapasitas fisik amannya
        break
      }

      spanUnitAlloc.set(chosenIdx, (spanUnitAlloc.get(chosenIdx) || 0) + 1)
      unitsToDistribute--
    }

    // Tempatkan AC pada masing-masing bentang secara simetris dan aman
    usableSpans.forEach((bestSpan, spIdx) => {
      const countInSpan = spanUnitAlloc.get(spIdx) || 0
      if (countInSpan === 0) return

      const wall = bestSpan.wall
      const spanLenM = bestSpan.lengthM
      const spanRange = bestSpan.endT - bestSpan.startT

      // Jika bentang menampung >= 2 unit: bagi rata simetris
      if (countInSpan >= 2) {
        for (let s = 1; s <= countInSpan; s++) {
          const localRatio = s / (countInSpan + 1)
          const globalRatio = Number((bestSpan.startT + localRatio * spanRange).toFixed(3))

          placedAcResults.push({
            wallIndex: bestSpan.wallIndex,
            ratio: globalRatio,
            wallOrder: bestSpan.wallIndex * 1000 + globalRatio * 100,
          })
        }
        return
      }

      // Jika bentang menampung 1 unit:
      let chosenLocalRatio = 0.5 // Default tepat di tengah

      // Jika bentang cukup panjang (>= 3.8m): wajib tepat di tengah (50%)
      if (spanLenM >= 3.8) {
        chosenLocalRatio = 0.5
      } else if (spanLenM >= 1.8 && spanLenM < 3.8) {
        // Bentang sedang (1.8m s/d 3.8m): cek perbatasan dengan Chiller atau Kasir
        const prevSeg = wallSegments[(wall.index - 1 + N_PTS) % N_PTS]
        const nextSeg = wallSegments[(wall.index + 1) % N_PTS]

        const isStartChiller = prevSeg?.type === "CHILLER" || (wall.type === "CHILLER" && bestSpan.startT > 0.05)
        const isEndChiller = nextSeg?.type === "CHILLER" || (wall.type === "CHILLER" && bestSpan.endT < 0.95)
        const isStartKasir = prevSeg?.type === "CASHIER" || (wall.type === "CASHIER" && bestSpan.startT > 0.05)
        const isEndKasir = nextSeg?.type === "CASHIER" || (wall.type === "CASHIER" && bestSpan.endT < 0.95)

        if (isStartChiller && !isEndChiller) {
          chosenLocalRatio = Math.max(0.18, Math.min(0.40, FIXTURE_CLEARANCE_M / spanLenM))
        } else if (isEndChiller && !isStartChiller) {
          chosenLocalRatio = Math.max(0.60, Math.min(0.82, (spanLenM - FIXTURE_CLEARANCE_M) / spanLenM))
        } else if (isEndKasir && !isStartKasir) {
          chosenLocalRatio = Math.max(0.60, Math.min(0.82, (spanLenM - CASHIER_CLEARANCE_M) / spanLenM))
        } else if (isStartKasir && !isEndKasir) {
          chosenLocalRatio = Math.max(0.18, Math.min(0.40, CASHIER_CLEARANCE_M / spanLenM))
        }
      }

      const globalRatio = Number((bestSpan.startT + chosenLocalRatio * spanRange).toFixed(3))

      placedAcResults.push({
        wallIndex: bestSpan.wallIndex,
        ratio: globalRatio,
        wallOrder: bestSpan.wallIndex * 1000 + globalRatio * 100,
      })
    })
  })

  // 5. Urutkan AC secara teratur mengelilingi denah toko (T1 -> T2 -> T3 -> T4)
  placedAcResults.sort((a, b) => a.wallOrder - b.wallOrder)

  return placedAcResults.map((u, idx) => {
    const wall = wallSegments.find((w) => w.index === u.wallIndex)
    const wallLabel = wall ? `Dinding T${wall.startIndex + 1} - T${wall.endIndex + 1}` : `Dinding #${u.wallIndex + 1}`
    return {
      id: `ac-unit-${idx + 1}`,
      wallIndex: u.wallIndex,
      ratio: u.ratio,
      customName: `AC 2 PK #${idx + 1}`,
      wallLabel,
    }
  })
}
