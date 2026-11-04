// One spelling rule for brand names, shared by submit matching and the
// "Merek dari lapangan" list, so " panasonic " and "Panasonic" are the same brand.
export function normalizeBrandName(name: string | null | undefined) {
  return (name ?? "").trim().replace(/\s+/g, " ").toLowerCase()
}

export type MasterBrandRef = {
  id: string
  equipmentTypeId: string
  name: string
}

export function matchMasterBrand(
  brands: MasterBrandRef[],
  equipmentTypeId: string,
  brandName: string | null | undefined
) {
  const key = normalizeBrandName(brandName)
  if (!key) return null
  return (
    brands.find(
      (brand) =>
        brand.equipmentTypeId === equipmentTypeId &&
        normalizeBrandName(brand.name) === key
    ) ?? null
  )
}
