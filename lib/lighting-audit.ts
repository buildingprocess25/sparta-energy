// Lighting audit rules, taken from the "Formulir Audit Sistem Tata Cahaya" sheet.
export const LPD_MIN = 4
export const LPD_MAX = 5

export const MEASURING_TOOLS = [
  "Digital Lux Meter",
  "Power Clamp Meter / Energy Meter",
  "Laser Distance",
] as const

// Saved drafts keep the names they were stored with; these map to the current ones.
// A null target means the item was removed from the form.
const RENAMED_TOOLS: Record<string, string> = {
  "Power Clamp Meter": "Power Clamp Meter / Energy Meter",
}
const RENAMED_ECO: Record<string, string | null> = {
  "Optimalkan relighting gondola": "Optimalisasi layout lampu",
  "Pasang zoning switch di area kasir": null,
  "Pasang sensor radar gerak": "Pasang sensor gerak untuk lampu parkir",
  "Pasang photocell untuk lampu luar":
    "Pasang sensor cahaya otomatis (photocell) untuk lampu luar",
  "Pasang timer switch otomatis sesuai jam operasional toko":
    "Pasang pengatur waktu otomatis sesuai jam operasional toko",
  "Pasang sensor okupansi di lorong rak": "Pasang sensor gerak di lorong rak",
  "Bersihkan diffuser lampu yang kotor": "Bersihkan penutup lampu yang kotor",
  "Pasang sensor PIR": "Pasang sensor gerak",
  "Wajib sensor gerak PIR (mati otomatis saat kosong)":
    "Wajib sensor gerak (lampu mati otomatis saat kosong)",
}

export const LIGHTING_STANDARD_NOTE =
  "Kepadatan daya lampu (LPD) 4,0 sampai 5,0 W/m² · acuan SNI 6197:2020 dan IESNA"

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
  tabLabel: string
  luxMin: number
  luxMax: number
  luxAccent?: number
  // Toilets are too small to split into front, middle and back.
  subZones: boolean
  ecoSuggestions: string[]
}

export const LIGHTING_ZONES: LightingZoneDefinition[] = [
  {
    key: "SALES",
    label: "Area Sales",
    tabLabel: "Area Sales",
    luxMin: 300,
    luxMax: 500,
    luxAccent: 750,
    subZones: true,
    ecoSuggestions: [
      "Optimalisasi layout lampu",
      "Ganti lampu ke LED berdaya lebih rendah",
    ],
  },
  {
    key: "PARKIRAN",
    label: "Area Parkiran",
    tabLabel: "Parkiran",
    subZones: true,
    luxMin: 50,
    luxMax: 100,
    ecoSuggestions: [
      "Pasang sensor gerak untuk lampu parkir",
      "Pasang sensor cahaya otomatis (photocell) untuk lampu luar",
      "Ganti lampu ke LED berdaya lebih rendah",
    ],
  },
  {
    key: "TERAS",
    label: "Teras & Area Pintu Masuk",
    tabLabel: "Teras & Pintu Masuk",
    subZones: true,
    luxMin: 150,
    luxMax: 200,
    ecoSuggestions: [
      "Pasang pengatur waktu otomatis sesuai jam operasional toko",
      "Ganti lampu ke LED berdaya lebih rendah",
    ],
  },
  {
    key: "GUDANG",
    label: "Gudang",
    tabLabel: "Gudang",
    subZones: true,
    luxMin: 100,
    luxMax: 200,
    ecoSuggestions: [
      "Pasang sensor gerak di lorong rak",
      "Bersihkan penutup lampu yang kotor",
    ],
  },
  {
    key: "SELASAR",
    label: "Selasar",
    tabLabel: "Selasar",
    subZones: true,
    luxMin: 100,
    luxMax: 150,
    ecoSuggestions: ["Pasang sakelar dua tingkat", "Pasang sensor gerak"],
  },
  {
    key: "TOILET",
    label: "Toilet",
    tabLabel: "Toilet",
    subZones: false,
    luxMin: 100,
    luxMax: 200,
    ecoSuggestions: ["Wajib sensor gerak (lampu mati otomatis saat kosong)"],
  },
]

export type LightingLamp = {
  id: string
  type: string
  qty: number
  watt: number
}

// A = depan, B = tengah, C = belakang. The 1 to 3 suffix only marks a spot so the
// same point can be measured again; it carries no meaning in the calculation.
export const LUX_AREAS = [
  { key: "A", label: "Depan" },
  { key: "B", label: "Tengah" },
  { key: "C", label: "Belakang" },
] as const

export type LuxArea = (typeof LUX_AREAS)[number]["key"]

export const LUX_SUB_ZONES = [
  "A1",
  "A2",
  "A3",
  "B1",
  "B2",
  "B3",
  "C1",
  "C2",
  "C3",
] as const

export type LuxSubZone = (typeof LUX_SUB_ZONES)[number]

export const DEFAULT_LUX_ROWS = 10
const DEFAULT_TOILET_LUX_ROWS = 3

export const MAX_PHOTOS_PER_LUX_ROW = 3

// ref points into the storage; sig is the server's HMAC over storage + ref, so
// the photo route only serves files this app uploaded.
export type LightingLuxPhoto = {
  storage: "drive" | "local"
  ref: string
  sig: string
  name: string
  uploadedAt: string
}

export type LightingLuxRow = {
  id: string
  subZone: LuxSubZone | null
  lux: number | null
  note: string
  photos: LightingLuxPhoto[]
}

export type LightingZoneInput = {
  key: LightingZoneKey
  areaM2: number | null
  lamps: LightingLamp[]
  luxRows: LightingLuxRow[]
  eco: string[]
  ecoNote: string
}

export type LightingAuditData = {
  version: 2
  address: string
  measuringTools: string[]
  notes: string
  zones: LightingZoneInput[]
}

export type LpdStatus = "SESUAI" | "DI_ATAS" | "DI_BAWAH" | "BELUM_LENGKAP"
export type LuxStatus =
  | "MEMENUHI"
  | "KURANG"
  | "TERLALU_TERANG"
  | "BELUM_DIUKUR"

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

export function getLuxArea(subZone: LuxSubZone | null): LuxArea | null {
  return subZone ? (subZone[0] as LuxArea) : null
}

export function getLuxAreaLabel(area: LuxArea) {
  return LUX_AREAS.find((item) => item.key === area)?.label ?? area
}

// The zone average is the mean of the area averages, so a bright front with many
// points cannot hide a dark back. Rows without a sub zona count as one extra group.
export function summarizeLux(
  rows: LightingLuxRow[],
  definition: LightingZoneDefinition
) {
  const measured = rows.filter((row) => row.lux !== null)
  const areas = LUX_AREAS.map((area) => {
    const values = measured
      .filter((row) => getLuxArea(row.subZone) === area.key)
      .map((row) => row.lux as number)
    const avgLux = averageLux(values)
    return {
      key: area.key,
      label: area.label,
      count: values.length,
      avgLux,
      luxStatus: getLuxStatus(avgLux, definition),
    }
  })
  const unassignedAvg = averageLux(
    measured
      .filter((row) => row.subZone === null)
      .map((row) => row.lux as number)
  )
  const groupAverages = [
    ...areas.flatMap((area) => (area.avgLux === null ? [] : [area.avgLux])),
    ...(unassignedAvg === null ? [] : [unassignedAvg]),
  ]
  const avgLux = averageLux(groupAverages)
  const luxStatus = getLuxStatus(avgLux, definition)
  const unevenAreas =
    luxStatus === "BELUM_DIUKUR"
      ? []
      : areas.filter(
          (area) => area.avgLux !== null && area.luxStatus !== luxStatus
        )
  const areasMissingNote = unevenAreas.filter(
    (area) =>
      !rows.some(
        (row) => getLuxArea(row.subZone) === area.key && row.note.trim() !== ""
      )
  )

  return {
    measuredCount: measured.length,
    unassignedMeasuredCount: measured.filter((row) => row.subZone === null)
      .length,
    areas,
    avgLux,
    luxStatus,
    unevenAreas,
    areasMissingNote,
  }
}

export function summarizeZone(zone: LightingZoneInput) {
  const definition = getZoneDefinition(zone.key)
  const totalWatt = zoneTotalWatt(zone)
  const lpd = calculateLpd(totalWatt, zone.areaM2)
  const lux = summarizeLux(zone.luxRows, definition)
  return {
    ...zone,
    definition,
    lampCount: zoneLampCount(zone),
    totalWatt,
    lpd,
    lpdStatus: getLpdStatus(lpd),
    avgLux: lux.avgLux,
    luxStatus: lux.luxStatus,
    lux,
  }
}

export type LightingZoneSummary = ReturnType<typeof summarizeZone>

export function summarizeLightingAudit(data: Pick<LightingAuditData, "zones">) {
  const zones = data.zones.map(summarizeZone)
  const totalArea = zones.reduce((sum, zone) => sum + (zone.areaM2 ?? 0), 0)
  const totalWatt = zones.reduce((sum, zone) => sum + zone.totalWatt, 0)
  const buildingLpd = calculateLpd(totalWatt, totalArea)
  const luxZones = zones.filter((zone) => zone.avgLux !== null)
  const buildingAvgLux = averageLux(
    luxZones.map((zone) => zone.avgLux as number)
  )
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
      (zone) =>
        zone.luxStatus === "KURANG" || zone.luxStatus === "TERLALU_TERANG"
    ).length,
    worstZone: worstZone ?? null,
  }
}

// Sub-zone zones start with A1 to C3 filled in and one spare row.
export function createDefaultLuxRows(
  definition: LightingZoneDefinition
): LightingLuxRow[] {
  const subZones: Array<LuxSubZone | null> = definition.subZones
    ? [
        ...LUX_SUB_ZONES,
        ...Array<null>(DEFAULT_LUX_ROWS - LUX_SUB_ZONES.length).fill(null),
      ]
    : Array<null>(DEFAULT_TOILET_LUX_ROWS).fill(null)

  return subZones.map((subZone, index) => ({
    id: `${definition.key}-lux-${index}`,
    subZone,
    lux: null,
    note: "",
    photos: [],
  }))
}

export function createEmptyLightingAudit(): LightingAuditData {
  return {
    version: 2,
    address: "",
    measuringTools: [...MEASURING_TOOLS],
    notes: "",
    zones: LIGHTING_ZONES.map((zone) => ({
      key: zone.key,
      areaM2: null,
      lamps: [],
      luxRows: createDefaultLuxRows(zone),
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

// Also used by other categories that attach photos to a unit or room.
export function sanitizePhotos(value: unknown): LightingLuxPhoto[] {
  if (!Array.isArray(value)) return []
  return value
    .map((photo) => {
      const item = (photo ?? {}) as Partial<
        Record<keyof LightingLuxPhoto, unknown>
      >
      return {
        storage:
          item.storage === "local" ? ("local" as const) : ("drive" as const),
        ref: toText(item.ref, 300),
        sig: toText(item.sig, 128),
        name: toText(item.name, 200),
        uploadedAt: toText(item.uploadedAt, 40),
      }
    })
    .filter((photo) => photo.ref !== "" && photo.sig !== "")
    .slice(0, MAX_PHOTOS_PER_LUX_ROW)
}

function isLuxSubZone(value: unknown): value is LuxSubZone {
  return LUX_SUB_ZONES.includes(value as LuxSubZone)
}

// Version 1 drafts stored plain numbers in luxPoints; they become rows without a
// sub zona. A zone with neither field gets the default template.
function sanitizeLuxRows(
  raw: Partial<Record<keyof LightingZoneInput | "luxPoints", unknown>>,
  definition: LightingZoneDefinition
): LightingLuxRow[] {
  if (Array.isArray(raw.luxRows)) {
    return raw.luxRows.slice(0, 100).map((row, index) => {
      const item = (row ?? {}) as Partial<Record<keyof LightingLuxRow, unknown>>
      return {
        id: toText(item.id, 64) || `${definition.key}-lux-${index}`,
        subZone:
          definition.subZones && isLuxSubZone(item.subZone)
            ? item.subZone
            : null,
        lux: toNumber(item.lux, 100_000),
        note: toText(item.note, 300),
        photos: sanitizePhotos(item.photos),
      }
    })
  }

  if (Array.isArray(raw.luxPoints) && raw.luxPoints.length > 0) {
    return raw.luxPoints
      .map((point) => toNumber(point, 100_000))
      .filter((point): point is number => point !== null)
      .slice(0, 100)
      .map((lux, index) => ({
        id: `${definition.key}-lux-${index}`,
        subZone: null,
        lux,
        note: "",
        photos: [],
      }))
  }

  return createDefaultLuxRows(definition)
}

// Normalises form data from the client or the database into a known shape,
// dropping anything unexpected so stored JSON stays consistent.
export function sanitizeLightingAuditData(input: unknown): LightingAuditData {
  const source = (input ?? {}) as Partial<
    Record<keyof LightingAuditData, unknown>
  >
  const zonesInput = Array.isArray(source.zones) ? source.zones : []
  const empty = createEmptyLightingAudit()

  return {
    version: 2,
    address: toText(source.address, 300),
    measuringTools: Array.isArray(source.measuringTools)
      ? Array.from(
          new Set(
            source.measuringTools
              .map((tool) => toText(tool, 80))
              .map((tool) => RENAMED_TOOLS[tool] ?? tool)
              .filter(Boolean)
          )
        ).slice(0, 10)
      : [],
    notes: toText(source.notes, 2000),
    zones: empty.zones.map((emptyZone) => {
      const raw = (zonesInput.find(
        (zone) => (zone as { key?: unknown })?.key === emptyZone.key
      ) ?? {}) as Partial<
        Record<keyof LightingZoneInput | "luxPoints", unknown>
      >
      const lamps = Array.isArray(raw.lamps) ? raw.lamps : []
      const eco = Array.isArray(raw.eco) ? raw.eco : []
      return {
        key: emptyZone.key,
        areaM2: toNumber(raw.areaM2, 100_000),
        lamps: lamps.slice(0, 100).flatMap((lamp, index) => {
          const item = (lamp ?? {}) as Partial<
            Record<keyof LightingLamp, unknown>
          >
          const type = toText(item.type, 120)
          const qty = toNumber(item.qty, 10_000)
          const watt = toNumber(item.watt, 100_000)
          if (!type || qty === null || watt === null) return []
          return [
            {
              id: toText(item.id, 64) || `${emptyZone.key}-${index}`,
              type,
              qty: Math.round(qty),
              watt,
            },
          ]
        }),
        luxRows: sanitizeLuxRows(raw, getZoneDefinition(emptyZone.key)),
        eco: Array.from(
          new Set(
            eco.flatMap((item) => {
              const text = toText(item, 200)
              const renamed = text in RENAMED_ECO ? RENAMED_ECO[text] : text
              return renamed ? [renamed] : []
            })
          )
        ).slice(0, 20),
        ecoNote: toText(raw.ecoNote, 1000),
      }
    }),
  }
}

// Returns the reasons a draft cannot be marked complete yet; empty when ready.
export function getCompletionIssues(data: LightingAuditData) {
  const issues: string[] = []
  for (const zone of data.zones) {
    const definition = getZoneDefinition(zone.key)
    const label = definition.label
    const lux = summarizeLux(zone.luxRows, definition)
    if (zone.areaM2 === null || !(zone.areaM2 > 0)) {
      issues.push(`Luas ${label} belum diisi.`)
    }
    if (lux.avgLux === null) {
      issues.push(`Tingkat terang (lux) ${label} belum diukur.`)
    }
    if (definition.subZones && lux.unassignedMeasuredCount > 0) {
      issues.push(`Pilih sub zona untuk setiap titik ukur di ${label}.`)
    }
    const unphotographed = zone.luxRows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => row.lux !== null && row.photos.length === 0)
      .map(({ row, index }) => row.subZone ?? `titik ${index + 1}`)
    if (unphotographed.length > 0) {
      issues.push(`Tambah foto untuk ${unphotographed.join(", ")} di ${label}.`)
    }
    for (const area of lux.areasMissingNote) {
      issues.push(
        `Tingkat terang area ${area.label} di ${label} berbeda dari rata-rata zona. Isi catatan di salah satu titik area itu.`
      )
    }
  }
  return issues
}
