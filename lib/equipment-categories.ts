// Fixed list for equipment_types.device_category, the 7 categories in column D
// of the revision sheet. The database enforces the same list with a CHECK
// constraint, so change both together.
export const DEVICE_CATEGORIES = [
  "Refrigeration",
  "Lighting",
  "VAC",
  "POS",
  "Signage & Display",
  "Kitchen & Food Processing (Beanspot)",
  "Other Equipment",
] as const

export type DeviceCategory = (typeof DEVICE_CATEGORIES)[number]

export const BEANSPOT_DEVICE_CATEGORY: DeviceCategory = "Kitchen & Food Processing (Beanspot)"

// Energy audit modules read lamps and AC by category. Signage stays in the
// lighting audit, where polesign and shop sign lamps are counted.
export const LIGHTING_DEVICE_CATEGORIES: DeviceCategory[] = ["Lighting", "Signage & Display"]
export const AC_DEVICE_CATEGORIES: DeviceCategory[] = ["VAC"]

const SIGNAGE_NAME = /^(polesign|shop sign|listplank)/i

// Same mapping as the 20261104010000 migration, for data written with the old
// names (seed data and anything saved before 4 Nov 2026).
export function mapLegacyDeviceCategory(type: {
  name: string
  category: string
  deviceCategory: string
}): DeviceCategory {
  if (isDeviceCategory(type.deviceCategory)) return type.deviceCategory
  if (type.category === "BEANSPOT" || type.deviceCategory === "Sistem Beanspot") {
    return BEANSPOT_DEVICE_CATEGORY
  }
  if (["Pencahayaan", "Sistem Tata Cahaya"].includes(type.deviceCategory)) {
    return SIGNAGE_NAME.test(type.name) ? "Signage & Display" : "Lighting"
  }
  if (
    type.deviceCategory === "Sistem Tata Udara dan Ventilasi" ||
    type.deviceCategory === "Sistem HVAC" ||
    /^exhaust fan/i.test(type.name)
  ) {
    return "VAC"
  }
  if (["Sistem Pendingin Produk", "Sistem Refrigerasi"].includes(type.deviceCategory)) {
    return "Refrigeration"
  }
  if (["Paket Kasir", "Mesin ATM"].includes(type.name)) return "POS"
  return "Other Equipment"
}

export function isDeviceCategory(value: unknown): value is DeviceCategory {
  return (
    typeof value === "string" &&
    (DEVICE_CATEGORIES as readonly string[]).includes(value)
  )
}
