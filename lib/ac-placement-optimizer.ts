import { Point } from "./polygon-utils"
import type { WallSegment, ValidWallSpan, PlacedAcUnit } from "@/app/ac-mapping/ac-mapping-client"
import type { ParsedCadStoreData } from "@/lib/cad/dxf-parser"

// Minimum bentang dinding aman untuk unit indoor AC Daikin 2 PK (1.05m unit + 2x0.25m clearance)
const MIN_SPAN_LENGTH_FOR_AC = 1.55

// Jarak aman baku dari tepi rintangan / fixture saat digeser (clearance minimum)
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
 * Intelligent Macro-Wall Baseline + Constraint Displacement Engine
 *
 * Alur Kerja:
 * 1. REKONSTRUKSI SISI MAKRO: Satukan segmen-segmen dinding yang sejajar / berada pada sisi struktural yang sama
 *    (misal Sisi Barat/Kiri 7.28m, Sisi Utara/Atas 18.7m, Sisi Timur/Kanan 7.28m).
 * 2. ALOKASI PROPORSI MAKRO: Alokasikan target N unit ke sisi-sisi dinding utama berdasarkan panjang makronya
 *    (Contoh N=5: Kiri dapat 2 unit, Atas dapat 2 unit, Kanan dapat 1 unit).
 * 3. TITIK IDEAL SIMETRIS (Ideal Baseline Grid):
 *    Tiap sisi makro menentukan titik ideal simetris murninya: t_ideal = j / (K + 1) * L.
 * 4. UJI TABRAKAN & PROYEKSI AMAN (Constraint Displacement):
 *    - Jika titik ideal berada di dinding solid bersih --> TETAP di titik ideal (100% simetris murni).
 *    - Jika titik ideal menabrak Chiller / Kasir / Pintu / Kaca --> GESER ke bentang aman terdekat dengan clearance 0.60m.
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

  // 2. Kelompokkan segmen-segmen dinding menjadi Sisi Dinding Makro (Macro Wall Sides)
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

      const sideSpans = validSpans.filter((sp) => currentSideWalls.includes(sp.wallIndex))
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
  const eligibleMacroSides = macroSides.filter((side) => side.usableLengthM >= MIN_SPAN_LENGTH_FOR_AC)

  if (eligibleMacroSides.length === 0) {
    // Fallback: gunakan validSpans biasa
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

  // 3. Alokasi Kuantitas Unit ke Sisi-Sisi Makro secara Proporsional & Berimbang
  const sideAllocations = new Map<number, number>()
  eligibleMacroSides.forEach((side) => sideAllocations.set(side.sideIndex, 0))

  let remainingUnits = targetCount

  // Aturan Alokasi Cerdas:
  // - Sisi panjang utama (>= 6.0m) yang bersih dialokasikan 2 unit jika targetCount >= 5
  // - Sisi lainnya mendapatkan 1 unit
  // - Sisa unit dialokasikan berdasarkan panjang makro
  const sortedSides = [...eligibleMacroSides].sort((a, b) => b.totalLengthM - a.totalLengthM)

  // Prioritaskan sisi solid panjang yang bersih (misal dinding kiri 7.28m)
  const longCleanSide = eligibleMacroSides.find((s) => s.totalLengthM >= 6.0 && s.usableLengthM / s.totalLengthM > 0.85)

  if (targetCount >= 5 && longCleanSide) {
    sideAllocations.set(longCleanSide.sideIndex, 2)
    remainingUnits -= 2
  }

  // Berikan 1 unit ke setiap sisi makro yang belum dapat
  for (const side of sortedSides) {
    if (remainingUnits > 0 && (sideAllocations.get(side.sideIndex) || 0) === 0) {
      sideAllocations.set(side.sideIndex, 1)
      remainingUnits--
    }
  }

  // Alokasikan sisa unit ke sisi makro terpanjang
  while (remainingUnits > 0) {
    let bestSide = sortedSides[0]
    let minDensity = Infinity

    for (const side of sortedSides) {
      const count = sideAllocations.get(side.sideIndex) || 0
      const maxCap = Math.max(1, Math.floor(side.totalLengthM / 3.8))
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

  // 4. Tempatkan AC pada Setiap Sisi Makro (Ideal Baseline -> Projection to Safe Span)
  const placedAcResults: {
    wallIndex: number
    ratio: number
    wallOrder: number
  }[] = []

  eligibleMacroSides.forEach((side) => {
    const kCount = sideAllocations.get(side.sideIndex) || 0
    if (kCount === 0 || side.validSpans.length === 0) return

    const sideLen = side.totalLengthM
    const usableSpans = side.validSpans.filter((s) => s.lengthM >= 1.05)

    // A. KASUS SISI MAKRO 100% BERSIH (Misal Dinding Kiri 7.28m utuh tanpa chiller/kasir)
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

    // B. KASUS SISI MAKRO DENGAN RINTANGAN (Chiller / Kasir / Pintu)
    // Hitung titik ideal makro: idealDist = j / (K + 1) * sideLen
    // Lalu proyeksikan ke bentang aman terdekat!
    const usedSpanSlots = new Map<number, number>()
    usableSpans.forEach((_, idx) => usedSpanSlots.set(idx, 0))

    // Urutkan usableSpans berdasarkan posisinya di sepanjang sisi makro
    const sortedSpans = [...usableSpans].sort((a, b) => a.wallIndex - b.wallIndex || a.startT - b.startT)

    for (let slot = 1; slot <= kCount; slot++) {
      const idealDistM = (slot / (kCount + 1)) * sideLen

      // Cari bentang terdekat dari titik ideal
      let bestSpan = sortedSpans[0]
      let bestDistDiff = Infinity
      let bestSpanIdx = 0

      sortedSpans.forEach((sp, spIdx) => {
        // Hitung jarak fisik pusat bentang ini dari titik awal sisi makro
        let cumDist = 0
        for (const wIdx of side.wallIndices) {
          const w = wallSegments.find((seg) => seg.index === wIdx)
          if (!w) continue
          if (wIdx < sp.wallIndex) {
            cumDist += w.lengthM
          } else if (wIdx === sp.wallIndex) {
            cumDist += ((sp.startT + sp.endT) / 2) * w.lengthM
            break
          }
        }

        const diff = Math.abs(cumDist - idealDistM)
        const slotsInSpan = usedSpanSlots.get(spIdx) || 0
        const spanCap = Math.max(1, Math.floor(sp.lengthM / 3.8))

        if (slotsInSpan < spanCap && diff < bestDistDiff) {
          bestDistDiff = diff
          bestSpan = sp
          bestSpanIdx = spIdx
        }
      })

      usedSpanSlots.set(bestSpanIdx, (usedSpanSlots.get(bestSpanIdx) || 0) + 1)
      const slotsInThisSpan = usedSpanSlots.get(bestSpanIdx) || 1

      // Tentukan posisi di dalam span terpilih
      const wall = bestSpan.wall
      const spanLenM = bestSpan.lengthM
      const spanRange = bestSpan.endT - bestSpan.startT

      let chosenLocalRatio = 0.5

      if (slotsInThisSpan >= 2) {
        // Jika span menampung >= 2 unit, bagi rata
        const slotInSpan = slotsInThisSpan
        chosenLocalRatio = slotInSpan / (slotsInThisSpan + 1)
      } else {
        // 1 unit di span ini: cek apakah perlu bias mendekati Kasir atau Chiller
        const prevSeg = wallSegments[(wall.index - 1 + N_PTS) % N_PTS]
        const nextSeg = wallSegments[(wall.index + 1) % N_PTS]

        const isStartChiller = prevSeg?.type === "CHILLER" || (wall.type === "CHILLER" && bestSpan.startT > 0.05)
        const isEndChiller = nextSeg?.type === "CHILLER" || (wall.type === "CHILLER" && bestSpan.endT < 0.95)
        const isStartKasir = prevSeg?.type === "CASHIER" || (wall.type === "CASHIER" && bestSpan.startT > 0.05)
        const isEndKasir = nextSeg?.type === "CASHIER" || (wall.type === "CASHIER" && bestSpan.endT < 0.95)

        if (spanLenM >= 2.0) {
          if (isStartChiller && !isEndChiller) {
            chosenLocalRatio = Math.max(0.15, Math.min(0.42, FIXTURE_CLEARANCE_M / spanLenM))
          } else if (isEndChiller && !isStartChiller) {
            chosenLocalRatio = Math.max(0.58, Math.min(0.85, (spanLenM - FIXTURE_CLEARANCE_M) / spanLenM))
          } else if (isEndKasir && !isStartKasir) {
            chosenLocalRatio = Math.max(0.58, Math.min(0.85, (spanLenM - CASHIER_CLEARANCE_M) / spanLenM))
          } else if (isStartKasir && !isEndKasir) {
            chosenLocalRatio = Math.max(0.15, Math.min(0.42, CASHIER_CLEARANCE_M / spanLenM))
          }
        }
      }

      const globalRatio = Number((bestSpan.startT + chosenLocalRatio * spanRange).toFixed(3))

      placedAcResults.push({
        wallIndex: bestSpan.wallIndex,
        ratio: globalRatio,
        wallOrder: bestSpan.wallIndex * 1000 + globalRatio * 100,
      })
    }
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
