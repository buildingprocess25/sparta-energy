const numberFormat = new Intl.NumberFormat("id-ID")
const percentFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
})

export function formatKwh(value: number) {
  return `${numberFormat.format(Math.round(value))} kWh`
}

export function formatGap(value: number) {
  return `${value > 0 ? "+" : ""}${percentFormat.format(value)}%`
}

export function formatHours(value: number) {
  return value >= 23.98 ? "24" : percentFormat.format(value)
}

export const areaLabels = {
  SALES: "Sales Area",
  TERRACE: "Teras",
  PARKING: "Parkir",
  WAREHOUSE: "Gudang, Toilet & Selasar",
} as const

export type AreaKey = keyof typeof areaLabels

export const areaOrder: AreaKey[] = ["PARKING", "SALES", "TERRACE", "WAREHOUSE"]
