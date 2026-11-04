import type { AreaTarget } from "@prisma/client"

import { normalizeBrandName, type MasterBrandRef } from "@/lib/brand-match"

export type FieldBrandRow = {
  equipmentTypeId: string
  typeName: string
  calcMethod: string
  brandName: string
  baseKw: number
  areaTarget: AreaTarget
  auditId: string
  storeId: string
  storeCode: string
  auditDate: Date
}

export type DismissedBrandRef = {
  equipmentTypeId: string
  brandName: string
}

export type UnregisteredBrand = {
  key: string
  equipmentTypeId: string
  typeName: string
  calcMethod: string
  brandName: string
  kwTypical: number
  kwMin: number
  kwMax: number
  areaTarget: AreaTarget
  storeCount: number
  auditCount: number
  firstSeen: string
  lastSeen: string
  sampleStores: string[]
}

export function brandKey(equipmentTypeId: string, brandName: string) {
  return `${equipmentTypeId}|${normalizeBrandName(brandName)}`
}

export function isUsageBasedMethod(calcMethod: string) {
  return calcMethod === "TRANSACTION" || calcMethod === "BATCH"
}

export class UnregisteredBrandError extends Error {}

export type BrandToMasterInput = {
  brandName: string
  baseKw: number
  runningKw?: number | null
  standbyKw?: number | null
  areaTarget: AreaTarget
}

const AREA_TARGETS: AreaTarget[] = ["SALES", "PARKING", "TERRACE", "WAREHOUSE"]

// Usage-based types need a real running kW: a 0 here is what made coffee
// machines and ovens count as 0 kWh. STANDARD types only use base kW.
export function toMasterBrandData(input: BrandToMasterInput, calcMethod: string) {
  const brandName = input.brandName.trim().replace(/\s+/g, " ")
  if (!brandName) throw new UnregisteredBrandError("Nama merek wajib diisi.")
  if (!(Number.isFinite(input.baseKw) && input.baseKw > 0)) {
    throw new UnregisteredBrandError("Daya dasar harus lebih dari 0 kW.")
  }
  if (!AREA_TARGETS.includes(input.areaTarget)) {
    throw new UnregisteredBrandError("Pilih area penempatan yang tersedia.")
  }

  if (!isUsageBasedMethod(calcMethod)) {
    return {
      name: brandName,
      baseKw: input.baseKw,
      runningKw: input.baseKw,
      standbyKw: input.baseKw * 0.05,
      areaTarget: input.areaTarget,
    }
  }

  const runningKw = input.runningKw ?? 0
  const standbyKw = input.standbyKw ?? 0
  if (!(Number.isFinite(runningKw) && runningKw > 0)) {
    throw new UnregisteredBrandError("Daya saat bekerja harus lebih dari 0 kW untuk alat ini.")
  }
  if (!(Number.isFinite(standbyKw) && standbyKw >= 0)) {
    throw new UnregisteredBrandError("Daya siaga harus berupa angka 0 atau lebih.")
  }
  return {
    name: brandName,
    baseKw: input.baseKw,
    runningKw,
    standbyKw,
    areaTarget: input.areaTarget,
  }
}

function mostFrequent<T>(values: T[]): T {
  const counts = new Map<T, number>()
  let best = values[0]
  let bestCount = 0
  for (const value of values) {
    const count = (counts.get(value) ?? 0) + 1
    counts.set(value, count)
    if (count > bestCount) {
      best = value
      bestCount = count
    }
  }
  return best
}

// Groups field rows by type and spelling, then drops names the master already
// has or an admin dismissed. Most stores first, then the most recent.
export function groupUnregisteredBrands(
  rows: FieldBrandRow[],
  masterBrands: MasterBrandRef[],
  dismissed: DismissedBrandRef[]
): UnregisteredBrand[] {
  const known = new Set([
    ...masterBrands.map((brand) => brandKey(brand.equipmentTypeId, brand.name)),
    ...dismissed.map((brand) => brandKey(brand.equipmentTypeId, brand.brandName)),
  ])
  const groups = new Map<string, FieldBrandRow[]>()

  for (const row of rows) {
    if (!normalizeBrandName(row.brandName)) continue
    const key = brandKey(row.equipmentTypeId, row.brandName)
    if (known.has(key)) continue
    const group = groups.get(key)
    if (group) group.push(row)
    else groups.set(key, [row])
  }

  return [...groups.entries()]
    .map(([key, group]) => {
      const kws = group.map((row) => row.baseKw)
      const dates = group.map((row) => row.auditDate.getTime())
      const stores = [...new Set(group.map((row) => row.storeCode))]
      return {
        key,
        equipmentTypeId: group[0].equipmentTypeId,
        typeName: group[0].typeName,
        calcMethod: group[0].calcMethod,
        brandName: mostFrequent(group.map((row) => row.brandName.trim().replace(/\s+/g, " "))),
        kwTypical: mostFrequent(kws),
        kwMin: Math.min(...kws),
        kwMax: Math.max(...kws),
        areaTarget: mostFrequent(group.map((row) => row.areaTarget)),
        storeCount: new Set(group.map((row) => row.storeId)).size,
        auditCount: new Set(group.map((row) => row.auditId)).size,
        firstSeen: new Date(Math.min(...dates)).toISOString(),
        lastSeen: new Date(Math.max(...dates)).toISOString(),
        sampleStores: stores.slice(0, 3),
      }
    })
    .sort((a, b) => b.storeCount - a.storeCount || b.lastSeen.localeCompare(a.lastSeen))
}
