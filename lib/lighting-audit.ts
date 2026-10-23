// Lighting audit rules, taken from the "Formulir Audit Sistem Tata Cahaya" sheet.
export const LPD_MIN = 4
export const LPD_MAX = 5

export const MEASURING_TOOLS = [
  "Digital Lux Meter",
  "Power Clamp Meter",
  "Laser Distance",
] as const

export const LIGHTING_STANDARD_NOTE =
  "Target LPD 4,0 sampai 5,0 W/m² | SNI 6197:2020 / IESNA Retail"

export type LightingZoneKey =
  | "SALES"
  | "PARKIRAN"
  | "TERAS"
  | "GUDANG"
  | "SELASAR"
  | "TOILET"

export type LightingZoneDefinition = {
  key: LightingZoneKey
  label: string
  luxMin: number
  luxMax: number
  luxAccent?: number
  ecoSuggestions: string[]
}

export const LIGHTING_ZONES: LightingZoneDefinition[] = [
  {
    key: "SALES",
    label: "Area Penjualan (Sales Area)",
    luxMin: 300,
    luxMax: 500,
    luxAccent: 750,
    ecoSuggestions: [
      "Optimalkan relighting gondola",
      "Pasang zoning switch di area kasir",
      "Ganti lampu ke LED berdaya lebih rendah",
    ],
  },
  {
    key: "PARKIRAN",
    label: "Area Parkiran",
    luxMin: 50,
    luxMax: 100,
    ecoSuggestions: [
      "Pasang sensor radar gerak",
      "Pasang photocell untuk lampu luar",
      "Ganti lampu ke LED berdaya lebih rendah",
    ],
  },
  {
    key: "TERAS",
    label: "Teras & Area Pintu Masuk",
    luxMin: 150,
    luxMax: 200,
    ecoSuggestions: [
      "Pasang timer switch otomatis sesuai jam operasional toko",
      "Ganti lampu ke LED berdaya lebih rendah",
    ],
  },
  {
    key: "GUDANG",
    label: "Gudang",
    luxMin: 100,
    luxMax: 200,
    ecoSuggestions: [
      "Pasang sensor okupansi di lorong rak",
      "Bersihkan diffuser lampu yang kotor",
    ],
  },
  {
    key: "SELASAR",
    label: "Selasar",
    luxMin: 100,
    luxMax: 150,
    ecoSuggestions: [
      "Pasang sakelar dua tingkat",
      "Pasang sensor PIR",
    ],
  },
  {
    key: "TOILET",
    label: "Toilet",
    luxMin: 100,
    luxMax: 200,
    ecoSuggestions: ["Wajib sensor gerak PIR (mati otomatis saat kosong)"],
  },
]

export type LightingLamp = {
  id: string
  type: string
  qty: number
  watt: number
}

export type LightingZoneInput = {
  key: LightingZoneKey
  areaM2: number | null
  lamps: LightingLamp[]
  luxPoints: number[]
  eco: string[]
  ecoNote: string
}

export type LightingAuditData = {
  version: 1
  address: string
  measuringTools: string[]
  notes: string
  zones: LightingZoneInput[]
}

export type LpdStatus = "SESUAI" | "DI_ATAS" | "DI_BAWAH" | "BELUM_LENGKAP"
export type LuxStatus = "MEMENUHI" | "KURANG" | "TERLALU_TERANG" | "BELUM_DIUKUR"

export const LPD_STATUS_LABEL: Record<LpdStatus, string> = {
  SESUAI: "Sesuai standar",
  DI_ATAS: "Di luar standar (terlalu boros)",
  DI_BAWAH: "Di luar standar (di bawah ideal)",
  BELUM_LENGKAP: "Belum lengkap",
}

export const LUX_STATUS_LABEL: Record<LuxStatus, string> = {
  MEMENUHI: "Memenuhi",
  KURANG: "Kurang terang",
  TERLALU_TERANG: "Terlalu terang",
  BELUM_DIUKUR: "Belum diukur",
}

export function getZoneDefinition(key: LightingZoneKey) {
  return LIGHTING_ZONES.find((zone) => zone.key === key) ?? LIGHTING_ZONES[0]
}

export function zoneTotalWatt(zone: Pick<LightingZoneInput, "lamps">) {
  return zone.lamps.reduce(
    (sum, lamp) => sum + Math.max(0, lamp.qty) * Math.max(0, lamp.watt),
    0
  )
}

export function zoneLampCount(zone: Pick<LightingZoneInput, "lamps">) {
  return zone.lamps.reduce((sum, lamp) => sum + Math.max(0, lamp.qty), 0)
}

export function calculateLpd(totalWatt: number, areaM2: number | null) {
  if (areaM2 === null || !(areaM2 > 0)) return null
  return totalWatt / areaM2
}

export function getLpdStatus(lpd: number | null): LpdStatus {
  if (lpd === null) return "BELUM_LENGKAP"
  if (lpd > LPD_MAX) return "DI_ATAS"
  if (lpd < LPD_MIN) return "DI_BAWAH"
  return "SESUAI"
}

export function averageLux(points: number[]) {
  const valid = points.filter((value) => Number.isFinite(value) && value >= 0)
  if (valid.length === 0) return null
  return valid.reduce((sum, value) => sum + value, 0) / valid.length
}

export function getLuxStatus(
  avgLux: number | null,
  zone: LightingZoneDefinition
): LuxStatus {
  if (avgLux === null) return "BELUM_DIUKUR"
  if (avgLux < zone.luxMin) return "KURANG"
  if (avgLux > zone.luxMax) return "TERLALU_TERANG"
  return "MEMENUHI"
}

export function formatLuxStandard(zone: LightingZoneDefinition) {
  const base = `${zone.luxMin} sampai ${zone.luxMax} lux`
  return zone.luxAccent ? `${base} (aksen ${zone.luxAccent})` : base
}

export function summarizeZone(zone: LightingZoneInput) {
  const definition = getZoneDefinition(zone.key)
  const totalWatt = zoneTotalWatt(zone)
  const lpd = calculateLpd(totalWatt, zone.areaM2)
  const avgLux = averageLux(zone.luxPoints)
  return {
    ...zone,
    definition,
    lampCount: zoneLampCount(zone),
    totalWatt,
    lpd,
    lpdStatus: getLpdStatus(lpd),
    avgLux,
    luxStatus: getLuxStatus(avgLux, definition),
  }
}

export type LightingZoneSummary = ReturnType<typeof summarizeZone>

export function summarizeLightingAudit(data: Pick<LightingAuditData, "zones">) {
  const zones = data.zones.map(summarizeZone)
  const totalArea = zones.reduce((sum, zone) => sum + (zone.areaM2 ?? 0), 0)
  const totalWatt = zones.reduce((sum, zone) => sum + zone.totalWatt, 0)
  const buildingLpd = calculateLpd(totalWatt, totalArea)
  const luxZones = zones.filter((zone) => zone.avgLux !== null)
  const buildingAvgLux = averageLux(luxZones.map((zone) => zone.avgLux as number))
  const zonesOutsideLpd = zones.filter(
    (zone) => zone.lpdStatus === "DI_ATAS" || zone.lpdStatus === "DI_BAWAH"
  )
  const worstZone = zones
    .filter((zone) => zone.lpd !== null)
    .sort((a, b) => (b.lpd ?? 0) - (a.lpd ?? 0))[0]

  return {
    zones,
    totalArea,
    totalWatt,
    buildingLpd,
    buildingStatus: getLpdStatus(buildingLpd),
    buildingAvgLux,
    zonesOutsideLpdCount: zonesOutsideLpd.length,
    zonesLuxNotMetCount: zones.filter(
      (zone) => zone.luxStatus === "KURANG" || zone.luxStatus === "TERLALU_TERANG"
    ).length,
    worstZone: worstZone ?? null,
  }
}

export function createEmptyLightingAudit(): LightingAuditData {
  return {
    version: 1,
    address: "",
    measuringTools: [...MEASURING_TOOLS],
    notes: "",
    zones: LIGHTING_ZONES.map((zone) => ({
      key: zone.key,
      areaM2: null,
      lamps: [],
      luxPoints: [],
      eco: [],
      ecoNote: "",
    })),
  }
}

function toNumber(value: unknown, max: number) {
  const number = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(number) || number < 0) return null
  return Math.min(number, max)
}

function toText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

// Normalises form data from the client or the database into a known shape,
// dropping anything unexpected so stored JSON stays consistent.
export function sanitizeLightingAuditData(input: unknown): LightingAuditData {
  const source = (input ?? {}) as Partial<Record<keyof LightingAuditData, unknown>>
  const zonesInput = Array.isArray(source.zones) ? source.zones : []
  const empty = createEmptyLightingAudit()

  return {
    version: 1,
    address: toText(source.address, 300),
    measuringTools: Array.isArray(source.measuringTools)
      ? source.measuringTools
          .map((tool) => toText(tool, 80))
          .filter(Boolean)
          .slice(0, 10)
      : [],
    notes: toText(source.notes, 2000),
    zones: empty.zones.map((emptyZone) => {
      const raw = (zonesInput.find(
        (zone) => (zone as { key?: unknown })?.key === emptyZone.key
      ) ?? {}) as Partial<Record<keyof LightingZoneInput, unknown>>
      const lamps = Array.isArray(raw.lamps) ? raw.lamps : []
      const luxPoints = Array.isArray(raw.luxPoints) ? raw.luxPoints : []
      const eco = Array.isArray(raw.eco) ? raw.eco : []
      return {
        key: emptyZone.key,
        areaM2: toNumber(raw.areaM2, 100_000),
        lamps: lamps.slice(0, 100).flatMap((lamp, index) => {
          const item = (lamp ?? {}) as Partial<Record<keyof LightingLamp, unknown>>
          const type = toText(item.type, 120)
          const qty = toNumber(item.qty, 10_000)
          const watt = toNumber(item.watt, 100_000)
          if (!type || qty === null || watt === null) return []
          return [{
            id: toText(item.id, 64) || `${emptyZone.key}-${index}`,
            type,
            qty: Math.round(qty),
            watt,
          }]
        }),
        luxPoints: luxPoints
          .map((point) => toNumber(point, 100_000))
          .filter((point): point is number => point !== null)
          .slice(0, 50),
        eco: eco.map((item) => toText(item, 200)).filter(Boolean).slice(0, 20),
        ecoNote: toText(raw.ecoNote, 1000),
      }
    }),
  }
}

// Returns the reasons a draft cannot be marked complete yet; empty when ready.
export function getCompletionIssues(data: LightingAuditData) {
  const issues: string[] = []
  for (const zone of data.zones) {
    const label = getZoneDefinition(zone.key).label
    if (zone.areaM2 === null || !(zone.areaM2 > 0)) {
      issues.push(`Luas ${label} belum diisi.`)
    }
    if (averageLux(zone.luxPoints) === null) {
      issues.push(`Lux ${label} belum diukur.`)
    }
  }
  return issues
}
