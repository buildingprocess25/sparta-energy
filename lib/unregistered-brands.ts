import type { AreaTarget } from "@prisma/client"

import { normalizeBrandName, type MasterBrandRef } from "@/lib/brand-match"
import { resolveOperationType } from "@/lib/energy-formula"
import {
  normalizeBrandProfile,
  profileIssueMessage,
  type BrandProfileInput,
} from "@/lib/energy-profile-draft"

export type FieldBrandRow = {
  equipmentTypeId: string
  typeName: string
  calcMethod: string
  operationType: string
  cycleSeconds: number | null
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
  operationType: string
  cycleSeconds: number | null
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

const AREA_TARGETS: AreaTarget[] = ["SALES", "PARKING", "TERRACE", "WAREHOUSE"]

export type BrandToMasterInput = {
  brandName: string
  areaTarget: AreaTarget
  profile: BrandProfileInput
}

// Same profile rules as the master form (lib/energy-profile-draft.ts).
export function toMasterBrandData(
  input: BrandToMasterInput,
  type: { operationType: string; calcMethod: string; cycleSeconds: number | null }
) {
  const brandName = input.brandName.trim().replace(/\s+/g, " ")
  if (!brandName) throw new UnregisteredBrandError("Nama merek wajib diisi.")
  if (!AREA_TARGETS.includes(input.areaTarget)) {
    throw new UnregisteredBrandError("Pilih area penempatan yang tersedia.")
  }
  const { values, issues } = normalizeBrandProfile(
    input.profile,
    resolveOperationType(type.operationType, type.calcMethod),
    type.calcMethod,
    type.cycleSeconds
  )
  if (issues.length > 0) throw new UnregisteredBrandError(profileIssueMessage(issues))
  return { name: brandName, areaTarget: input.areaTarget, ...values }
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
        operationType: group[0].operationType,
        cycleSeconds: group[0].cycleSeconds,
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
