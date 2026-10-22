export const STORE_TYPES = [
  "Regular",
  "Basic",
  "Medium",
  "Advance",
  "Dark Store",
  "Drive Thru",
] as const

export type StoreTypeOption = (typeof STORE_TYPES)[number]

// Same rule as the audit wizard (step2-detail): anything but Regular, including
// an unset type, also lists Beanspot equipment.
export function usesBeanspotEquipment(storeType: string | null | undefined) {
  return storeType !== "Regular"
}
