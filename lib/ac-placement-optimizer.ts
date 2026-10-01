import { Point } from "./polygon-utils"
import type { WallSegment, ValidWallSpan, PlacedAcUnit } from "@/app/ac-mapping/ac-mapping-client"
import type { ParsedCadStoreData } from "@/lib/cad/dxf-parser"

// Syarat bentang minimum untuk unit indoor Daikin 2 PK (1.05m bodi + 2x0.25m jarak aman)
const MIN_SPAN_LENGTH_FOR_AC = 1.55

// Jarak aman baku dari tepi rintangan / fixture saat digeser
const FIXTURE_CLEARANCE_M = 0.60
const CASHIER_CLEARANCE_M = 0.62

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
}

/**
 * Universal Dynamic AC Placement Engine
 *
 * Klasifikasi Bentang Dinding Dinamis:
 * 1. Sempit (< 1.55m): Kapasitas 0 (dilewati karena tidak muat bodi AC 1.05m + clearance).
 * 2. Sedang (1.55m s/d 3.8m): Kapasitas 1 unit.
 *    - Jika berbatasan dengan Chiller / Kasir: digeser mendekati fixture (0.60m - 0.62m).
 *    - Jika dinding bebas / sudut normal: diletakkan tepat di tengah (50%).
 * 3. Panjang (3.8m s/d 7.5m): Kapasitas 1 - 2 unit.
 *    - Jika 1 unit: WAJIB tepat di tengah (50%) agar tidak meninggalkan ruang kosong besar 4-5 meter.
 *    - Jika 2 unit: dibagi rata menjadi 3 bagian sama (di titik 1/3 dan 2/3).
 * 4. Sangat Panjang (>= 7.5m): Kapasitas 2 - 4 unit, dibagi rata simetris penuh.
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

      macroSides.push({
        sideIndex: macroSides.length,
        p1,
        p2,
        totalLengthM: totalLen,
        wallIndices: [...currentSideWalls],
        validSpans: sideSpans,
        usableLengthM: usableLen,
      })

      currentSideWalls = []
      sideStartPt = customPts[nextNodeIdx]
    }
  }

  // Filter sisi makro yang memiliki bentang solid layak (usableLength >= 1.55m)
  let eligibleMacroSides = macroSides.filter((side) => side.usableLengthM >= MIN_SPAN_LENGTH_FOR_AC)

  // Fallback jika tidak ada bentang >= 1.55m sama sekali
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
        customName: `Daikin 2 PK #${idx + 1}`,
        wallLabel: `Dinding T${wall.startIndex + 1} - T${wall.endIndex + 1}`,
      }
    })
  }

  // 3. Alokasi Kuantitas Unit secara Proporsional & Berimbang
  const sideAllocations = new Map<number, number>()
  eligibleMacroSides.forEach((side) => sideAllocations.set(side.sideIndex, 0))

  let remainingUnits = targetCount

  // Sisi solid panjang yang bersih (panjang >= 6.0m dan tidak terpotong rintangan) dapat 2 unit untuk targetCount >= 5
  const longCleanSide = eligibleMacroSides.find(
    (s) => s.totalLengthM >= 6.0 && s.usableLengthM / s.totalLengthM > 0.85
  )

  if (targetCount >= 5 && longCleanSide) {
    sideAllocations.set(longCleanSide.sideIndex, 2)
    remainingUnits -= 2
  }

  // Berikan 1 unit ke setiap sisi makro lain yang masih kosong
  const sortedSides = [...eligibleMacroSides].sort((a, b) => b.usableLengthM - a.usableLengthM)

  for (const side of sortedSides) {
    if (remainingUnits > 0 && (sideAllocations.get(side.sideIndex) || 0) === 0) {
      sideAllocations.set(side.sideIndex, 1)
      remainingUnits--
    }
  }

  // Alokasikan sisa unit ke sisi makro yang memiliki sisa kapasitas bentang terpanjang
  while (remainingUnits > 0) {
    let bestSide = sortedSides[0]
    let minDensity = Infinity

    for (const side of sortedSides) {
      const count = sideAllocations.get(side.sideIndex) || 0
      const maxCap = Math.max(1, Math.floor(side.usableLengthM / 3.2))
      if (count < maxCap) {
        const density = (count + 1) / side.usableLengthM
        if (density < minDensity) {
          minDensity = density
          bestSide = side
        }
      }
    }

    sideAllocations.set(bestSide.sideIndex, (sideAllocations.get(bestSide.sideIndex) || 0) + 1)
    remainingUnits--
  }

  // 4. Tempatkan AC pada Setiap Sisi Makro
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

    // A. SISI MAKRO BERSIH TANPA RINTANGAN (Misal Dinding Kiri 7.28m)
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
    // Alokasikan unit kCount ke usableSpans berdasarkan panjang masing-masing bentang
    const spanUnitAlloc = new Map<number, number>()
    usableSpans.forEach((_, idx) => spanUnitAlloc.set(idx, 0))

    let unitsToDistribute = kCount

    // Urutkan bentang dari yang terpanjang
    const sortedSpanIndices = usableSpans
      .map((sp, idx) => ({ idx, len: sp.lengthM }))
      .sort((a, b) => b.len - a.len)

    // Setiap bentang solid layak dapat 1 unit jika cukup
    for (const item of sortedSpanIndices) {
      if (unitsToDistribute > 0 && (spanUnitAlloc.get(item.idx) || 0) === 0) {
        spanUnitAlloc.set(item.idx, 1)
        unitsToDistribute--
      }
    }

    // Jika masih ada sisa unit, berikan ke bentang yang panjangnya >= 4.5m
    while (unitsToDistribute > 0) {
      let longestIdx = sortedSpanIndices[0].idx
      for (const item of sortedSpanIndices) {
        const currentInSpan = spanUnitAlloc.get(item.idx) || 0
        const maxSpanCap = Math.max(1, Math.floor(item.len / 2.8))
        if (currentInSpan < maxSpanCap) {
          longestIdx = item.idx
          break
        }
      }
      spanUnitAlloc.set(longestIdx, (spanUnitAlloc.get(longestIdx) || 0) + 1)
      unitsToDistribute--
    }

    // Tempatkan AC pada masing-masing bentang
    usableSpans.forEach((bestSpan, spIdx) => {
      const countInSpan = spanUnitAlloc.get(spIdx) || 0
      if (countInSpan === 0) return

      const wall = bestSpan.wall
      const spanLenM = bestSpan.lengthM
      const spanRange = bestSpan.endT - bestSpan.startT

      // Jika bentang menampung 2 unit (misal bentang 5.86m dapat 2 AC)
      // Wajib dibagi rata menjadi 3 bagian sama: 1/3 dan 2/3
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
      let chosenLocalRatio = 0.5 // Default tengah

      // Aturan Khusus Bentang Panjang (>= 3.8m): Wajib tepat di tengah (50%)
      // agar tidak meninggalkan ruang kosong besar 4-5 meter
      if (spanLenM >= 3.8) {
        chosenLocalRatio = 0.5
      } else if (spanLenM >= 1.8 && spanLenM < 3.8) {
        // Bentang sedang (1.8m s/d 3.8m): Cek apakah perlu geser mendekati Chiller atau Kasir
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
      customName: `Daikin 2 PK #${idx + 1}`,
      wallLabel,
    }
  })
}
