// Fixed list for equipment_types.device_category. The database enforces the
// same list with a CHECK constraint, so change both together.
export const DEVICE_CATEGORIES = [
  "Sistem Tata Cahaya",
  "Sistem Tata Udara dan Ventilasi",
  "Sistem Refrigerasi",
  "Sistem Beanspot",
  "Lainnya",
] as const

export type DeviceCategory = (typeof DEVICE_CATEGORIES)[number]

// Same mapping as the 20261030000000 migration, for data written with the old names.
export function mapLegacyDeviceCategory(type: {
  name: string
  category: string
  deviceCategory: string
}): DeviceCategory {
  if (type.category === "BEANSPOT") return "Sistem Beanspot"
  if (["Pencahayaan", "Sistem Tata Cahaya"].includes(type.deviceCategory)) {
    return "Sistem Tata Cahaya"
  }
  if (
    type.deviceCategory === "Sistem Tata Udara dan Ventilasi" ||
    type.deviceCategory === "Sistem HVAC" ||
    /^exhaust fan/i.test(type.name)
  ) {
    return "Sistem Tata Udara dan Ventilasi"
  }
  if (type.deviceCategory === "Sistem Pendingin Produk") return "Sistem Refrigerasi"
  return "Lainnya"
}

export function isDeviceCategory(value: unknown): value is DeviceCategory {
  return (
    typeof value === "string" &&
    (DEVICE_CATEGORIES as readonly string[]).includes(value)
  )
}
