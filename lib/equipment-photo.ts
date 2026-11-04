type BrandPhoto = {
  name: string
  productPhotoUrl?: string | null
}

// Photos live on brands, not types: use the chosen brand's photo, otherwise
// any brand photo of the same type as an example.
export function pickBrandPhoto(
  brands: BrandPhoto[] | null | undefined,
  brandName?: string | null
): string | null {
  if (!brands?.length) return null
  const wanted = brandName?.trim().toLowerCase()
  const matched = wanted
    ? brands.find((brand) => brand.name.trim().toLowerCase() === wanted)
    : undefined
  return (
    matched?.productPhotoUrl ||
    brands.find((brand) => brand.productPhotoUrl)?.productPhotoUrl ||
    null
  )
}
