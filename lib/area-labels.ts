import type { AreaTarget } from "@prisma/client"

export const AREA_LABELS: Record<AreaTarget, string> = {
  SALES: "Area Belanja",
  PARKING: "Parkiran",
  TERRACE: "Teras",
  WAREHOUSE: "Gudang, Toilet & Selasar",
}

export const AREA_TARGET_OPTIONS = Object.keys(AREA_LABELS) as AreaTarget[]
