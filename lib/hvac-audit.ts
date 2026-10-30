import { AC_UNIT_BTU, calculateAcUnits } from "@/lib/ac-calculator"
import { AC_CALCULATOR_VERSION } from "@/lib/calculator-versions"
import { sanitizePhotos, type LightingLuxPhoto } from "@/lib/lighting-audit"

// Rules from the "Audit Tata Udara dan Ventilasi" sheets (ASHRAE AEDG 50%, SNI).
export const ROOM_TEMP_MIN = 24
export const ROOM_TEMP_MAX = 26
export const DELTA_T_MIN = 8
export const DELTA_T_MAX = 12
export const DEFAULT_SHR = 0.72
const AIR_DENSITY = 1.2
const KW_TO_BTU = 3412.14
const PK_BTU = 9000
export const COP_TARGET = 3.5
// Real capacity this far above nameplate usually means the airflow was measured wrong.
export const OVER_CAPACITY_RATIO = 1.1

export const DEFAULT_FAN_MODEL = "Panasonic FV-20TGU5"
export const DEFAULT_FAN_FLOW = 468
export const DEFAULT_FAN_WATT = 18
export const DEFAULT_ROOM_HEIGHT = 2.8

export const HVAC_STANDARD_NOTE =
  "Suhu ruang 24 sampai 26°C · selisih suhu udara masuk dan keluar AC 8 sampai 12°C · efisiensi AC minimal 3,50 (standar ASHRAE)"

export const HVAC_MEASURING_TOOLS = [
  "Clamp meter (ukur listrik AC)",
  "Thermo-hygrometer (ukur suhu dan kelembaban)",
  "Termometer tembak (infrared)",
] as const

export const HVAC_ECO_SUGGESTIONS = [
  "Atur suhu remote AC area sales ke 24 sampai 25°C",
  "Jaga kelembaban ruang di 50 sampai 60%",
  "Pasang sensor gerak untuk exhaust fan toilet",
  "Jadwalkan cuci filter dan unit outdoor AC secara berkala",
] as const

export const MAKE_UP_AIR_OPTIONS = [
  "Kisi-kisi pintu (louver)",
  "Celah bawah pintu",
  "Celah rolling door",
  "Tidak ada",
] as const

export const NO_MAKE_UP_AIR = "Tidak ada"

// Saved drafts keep the wording they were stored with; these map it to the current text.
const RENAMED_OPTIONS: Record<string, string> = {
  "Clamp Meter": HVAC_MEASURING_TOOLS[0],
  "Thermo-Hygrometer": HVAC_MEASURING_TOOLS[1],
  "Infrared Thermometer": HVAC_MEASURING_TOOLS[2],
  "Naikkan setpoint AC sales ke 24 sampai 25°C": HVAC_ECO_SUGGESTIONS[0],
  "Jaga kelembaban ruang di 50 sampai 60% RH": HVAC_ECO_SUGGESTIONS[1],
  "Pasang sensor PIR untuk exhaust fan toilet": HVAC_ECO_SUGGESTIONS[2],
  "Jadwalkan cuci filter dan koil kondensor berkala": HVAC_ECO_SUGGESTIONS[3],
  "Door louver": MAKE_UP_AIR_OPTIONS[0],
}

function currentOption(value: unknown) {
  return typeof value === "string" ? (RENAMED_OPTIONS[value] ?? value) : value
}

export type ExhaustZoneKey = "CHILLER" | "GUDANG" | "TOILET"

export const EXHAUST_ZONES: Array<{
  key: ExhaustZoneKey
  label: string
  targetAch: number
}> = [
  { key: "CHILLER", label: "Ruang Mesin Chiller", targetAch: 20 },
  { key: "GUDANG", label: "Gudang", targetAch: 6 },
  { key: "TOILET", label: "Toilet", targetAch: 10 },
]

export type AcStandard = {
  version: string
  salesAreaM2: number
  latitude: number
  longitude: number
  maxTemp: number
  clusterBtu: number
  totalBtu: number
  units: number
  calculatedAt: string
}

export type HvacAcUnit = {
  id: string
  label: string
  type: string
  pk: number | null
  // Nameplate power per unit from the equipment master or kalkulasi, shown beside the measured one.
  ratedKw: number | null
  volt: number | null
  ampere: number | null
  powerFactor: number | null
  roomTemp: number | null
  humidity: number | null
  returnTemp: number | null
  supplyTemp: number | null
  airSpeed: number | null
  grilleAreaM2: number | null
  shr: number
  filterCondition: string
  drainCondition: string
  recommendation: string
  photos: LightingLuxPhoto[]
}

export type HvacExhaustZone = {
  key: ExhaustZoneKey
  present: boolean
  roomName: string
  areaM2: number | null
  heightM: number
  fanModel: string
  fanFlow: number
  fanWatt: number
  fansInstalled: number | null
  grilleSpeed: number | null
  makeUpAir: string
  bladeCondition: string
  noise: string
  recommendation: string
  photos: LightingLuxPhoto[]
}

export type HvacAuditData = {
  version: 1
  latitude: number | null
  longitude: number | null
  salesAreaM2: number | null
  acStandard: AcStandard | null
  // AC qty in the validated kalkulasi, kept so history shows what it said back then.
  recordedAcUnits: number | null
  installedAcUnits: number | null
  acCountNote: string
  measuringTools: string[]
  units: HvacAcUnit[]
  exhaust: HvacExhaustZone[]
  eco: string[]
  ecoNote: string
  notes: string
}

export type AcCountStatus = "SESUAI" | "KURANG" | "LEBIH" | "BELUM_DIHITUNG"
export type RoomTempStatus =
  | "SESUAI"
  | "TERLALU_DINGIN"
  | "TERLALU_PANAS"
  | "BELUM_DIUKUR"
export type DeltaTStatus = "NORMAL" | "KURANG" | "TINGGI" | "BELUM_DIUKUR"
export type CopStatus =
  | "SANGAT_EFISIEN"
  | "NORMAL"
  | "DEGRADASI"
  | "KRITIS"
  | "BELUM_LENGKAP"
export type VentilationStatus = "MEMENUHI" | "KURANG" | "BELUM_LENGKAP"

export const ROOM_TEMP_STATUS_LABEL: Record<RoomTempStatus, string> = {
  SESUAI: "Sesuai",
  TERLALU_DINGIN: "Terlalu dingin",
  TERLALU_PANAS: "Terlalu panas",
  BELUM_DIUKUR: "Belum diukur",
}

export const DELTA_T_STATUS_LABEL: Record<DeltaTStatus, string> = {
  NORMAL: "Normal",
  KURANG: "Kurang",
  TINGGI: "Di atas normal",
  BELUM_DIUKUR: "Belum diukur",
}

export const COP_STATUS_LABEL: Record<CopStatus, string> = {
  SANGAT_EFISIEN: "Sangat efisien",
  NORMAL: "Normal",
  DEGRADASI: "Performa menurun",
  KRITIS: "Kritis",
  BELUM_LENGKAP: "Belum lengkap",
}

export const VENTILATION_STATUS_LABEL: Record<VentilationStatus, string> = {
  MEMENUHI: "Memenuhi",
  KURANG: "Kurang",
  BELUM_LENGKAP: "Belum lengkap",
}

function round(value: number, digits: number) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function getExhaustZoneDefinition(key: ExhaustZoneKey) {
  return EXHAUST_ZONES.find((zone) => zone.key === key)!
}

export function getRoomTempStatus(temp: number | null): RoomTempStatus {
  if (temp === null) return "BELUM_DIUKUR"
  if (temp < ROOM_TEMP_MIN) return "TERLALU_DINGIN"
  if (temp > ROOM_TEMP_MAX) return "TERLALU_PANAS"
  return "SESUAI"
}

export function getDeltaTStatus(deltaT: number | null): DeltaTStatus {
  if (deltaT === null) return "BELUM_DIUKUR"
  if (deltaT < DELTA_T_MIN) return "KURANG"
  if (deltaT > DELTA_T_MAX) return "TINGGI"
  return "NORMAL"
}

// Supply air that keeps ΔT normal: return minus 8 to 12°C, or the room target before return is measured.
export function getSupplyTempRange(returnTemp: number | null) {
  return returnTemp === null
    ? { min: ROOM_TEMP_MIN - DELTA_T_MAX, max: ROOM_TEMP_MAX - DELTA_T_MIN }
    : {
        min: round(returnTemp - DELTA_T_MAX, 1),
        max: round(returnTemp - DELTA_T_MIN, 1),
      }
}

export function getCopStatus(cop: number | null): CopStatus {
  if (cop === null) return "BELUM_LENGKAP"
  if (cop >= 3.5) return "SANGAT_EFISIEN"
  if (cop >= 3) return "NORMAL"
  if (cop >= 2.5) return "DEGRADASI"
  return "KRITIS"
}

export function summarizeAcUnit(unit: HvacAcUnit) {
  const powerKw =
    unit.volt !== null && unit.ampere !== null && unit.powerFactor !== null
      ? (unit.volt * unit.ampere * unit.powerFactor) / 1000
      : null
  const deltaT =
    unit.returnTemp !== null && unit.supplyTemp !== null
      ? round(unit.returnTemp - unit.supplyTemp, 2)
      : null
  // The sheet rounds airflow to whole m³/h before using it for capacity.
  const airflow =
    unit.airSpeed !== null && unit.grilleAreaM2 !== null
      ? Math.round(unit.airSpeed * unit.grilleAreaM2 * 3600)
      : null
  const capacityKw =
    airflow !== null && deltaT !== null && unit.shr > 0
      ? (AIR_DENSITY * airflow * deltaT) / 3600 / unit.shr
      : null
  const capacityBtu = capacityKw === null ? null : capacityKw * KW_TO_BTU
  const nominalBtu = unit.pk === null ? null : unit.pk * PK_BTU
  // Unrounded, as the sheet averages and grades it before formatting.
  const cop =
    capacityKw !== null && powerKw !== null && powerKw > 0
      ? capacityKw / powerKw
      : null

  return {
    unit,
    powerKw,
    deltaT,
    airflow,
    capacityKw,
    capacityBtu,
    nominalBtu,
    cop,
    copStatus: getCopStatus(cop),
    roomTempStatus: getRoomTempStatus(unit.roomTemp),
    deltaTStatus: getDeltaTStatus(deltaT),
    overCapacity:
      capacityBtu !== null &&
      nominalBtu !== null &&
      nominalBtu > 0 &&
      capacityBtu > nominalBtu * OVER_CAPACITY_RATIO,
  }
}

export type AcUnitSummary = ReturnType<typeof summarizeAcUnit>

export function summarizeExhaustZone(zone: HvacExhaustZone) {
  const definition = getExhaustZoneDefinition(zone.key)
  const volume =
    zone.areaM2 !== null && zone.areaM2 > 0 ? zone.areaM2 * zone.heightM : null
  const targetFlow = volume === null ? null : volume * definition.targetAch
  // The sheet compares installed fans with the theoretical count shown at one decimal.
  const fanTheoretical =
    targetFlow === null || zone.fanFlow <= 0
      ? null
      : round(targetFlow / zone.fanFlow, 1)
  const totalFlow =
    zone.fansInstalled === null ? null : zone.fansInstalled * zone.fanFlow
  const totalWatt =
    zone.fansInstalled === null ? null : zone.fansInstalled * zone.fanWatt
  const actualAch =
    totalFlow === null || volume === null ? null : round(totalFlow / volume, 1)

  let status: VentilationStatus = "BELUM_LENGKAP"
  if (fanTheoretical !== null && zone.fansInstalled !== null) {
    status = zone.fansInstalled >= fanTheoretical ? "MEMENUHI" : "KURANG"
  }

  return {
    zone,
    definition,
    volume,
    targetFlow,
    fanTheoretical,
    totalFlow,
    totalWatt,
    actualAch,
    status,
  }
}

export type ExhaustZoneSummary = ReturnType<typeof summarizeExhaustZone>

// The standard is frozen at calculation time; editing its inputs afterwards needs a recount.
export function isAcStandardStale(data: HvacAuditData) {
  const standard = data.acStandard
  if (!standard) return false
  return (
    standard.salesAreaM2 !== data.salesAreaM2 ||
    standard.latitude !== data.latitude ||
    standard.longitude !== data.longitude
  )
}

export function getAcCountResult(data: HvacAuditData) {
  const standardUnits = data.acStandard?.units ?? null
  const installed = data.installedAcUnits
  if (standardUnits === null || installed === null || isAcStandardStale(data)) {
    return {
      status: "BELUM_DIHITUNG" as AcCountStatus,
      difference: 0,
      standardUnits,
      installed,
    }
  }
  const difference = installed - standardUnits
  const status: AcCountStatus =
    difference === 0 ? "SESUAI" : difference < 0 ? "KURANG" : "LEBIH"
  return { status, difference: Math.abs(difference), standardUnits, installed }
}

export function formatAcCountResult(status: AcCountStatus, difference: number) {
  if (status === "SESUAI") return "AC sesuai standar"
  if (status === "KURANG") return `AC kurang ${difference} unit`
  if (status === "LEBIH") return `AC lebih ${difference} unit`
  return "Jumlah AC belum diverifikasi"
}

// Stored in energy_audits.summary_status, e.g. "AC_KURANG:1", so lists can show and filter it.
export function toAcSummaryStatus(status: AcCountStatus, difference: number) {
  if (status === "BELUM_DIHITUNG") return null
  return status === "SESUAI" ? "AC_SESUAI" : `AC_${status}:${difference}`
}

export function parseAcSummaryStatus(value: string | null | undefined) {
  const match = value?.match(/^AC_(SESUAI|KURANG|LEBIH)(?::(\d+))?$/)
  if (!match) return null
  return {
    status: match[1] as Exclude<AcCountStatus, "BELUM_DIHITUNG">,
    difference: Number(match[2] ?? 0),
  }
}

function sum(values: Array<number | null>) {
  return values.reduce<number>((total, value) => total + (value ?? 0), 0)
}

function average(values: Array<number | null>) {
  const known = values.filter((value): value is number => value !== null)
  return known.length > 0 ? sum(known) / known.length : null
}

export function summarizeHvacAudit(data: HvacAuditData) {
  const units = data.units.map(summarizeAcUnit)
  const unitsWithCop = units.filter((unit) => unit.cop !== null)
  // The sheet's total row averages the per-unit COP.
  const averageCop =
    unitsWithCop.length > 0
      ? unitsWithCop.reduce((sum, unit) => sum + (unit.cop as number), 0) /
        unitsWithCop.length
      : null
  const exhaust = data.exhaust
    .filter((zone) => zone.present)
    .map(summarizeExhaustZone)
  const exhaustVolume = sum(exhaust.map((zone) => zone.volume))
  const exhaustFlow = sum(exhaust.map((zone) => zone.totalFlow))

  return {
    acCount: getAcCountResult(data),
    standardStale: isAcStandardStale(data),
    // The calculator sizes every unit as 2 PK (18.000 BTU/h).
    hasNonStandardPk: data.units.some(
      (unit) => unit.pk !== null && unit.pk * PK_BTU !== AC_UNIT_BTU
    ),
    units,
    averageCop,
    averageCopStatus: getCopStatus(averageCop),
    totalPowerKw: sum(units.map((unit) => unit.powerKw)),
    totalCapacityKw: sum(units.map((unit) => unit.capacityKw)),
    // Same figures as the sheet's TOTAL & RATA-RATA AC row.
    totalCapacityBtu: sum(units.map((unit) => unit.capacityBtu)),
    averageRoomTemp: average(units.map((unit) => unit.unit.roomTemp)),
    averageDeltaT: average(units.map((unit) => unit.deltaT)),
    exhaust,
    // Same figures as the sheet's TOTAL VENTILASI EXHAUST row.
    exhaustTotals: {
      volume: exhaustVolume,
      fansInstalled: sum(exhaust.map((zone) => zone.zone.fansInstalled)),
      fanTheoretical: round(sum(exhaust.map((zone) => zone.fanTheoretical)), 1),
      totalWatt: sum(exhaust.map((zone) => zone.totalWatt)),
      actualAch:
        exhaustVolume > 0 ? round(exhaustFlow / exhaustVolume, 1) : null,
    },
    exhaustShortCount: exhaust.filter((zone) => zone.status === "KURANG")
      .length,
  }
}

export function createAcStandard(input: {
  salesAreaM2: number
  latitude: number
  longitude: number
  maxTemp: number
  calculatedAt?: string
}): AcStandard {
  const result = calculateAcUnits(input.salesAreaM2, input.maxTemp)
  return {
    version: AC_CALCULATOR_VERSION,
    salesAreaM2: input.salesAreaM2,
    latitude: input.latitude,
    longitude: input.longitude,
    maxTemp: input.maxTemp,
    clusterBtu: result.clusterBtu,
    totalBtu: Math.round(result.totalBtu),
    units: result.units,
    calculatedAt: input.calculatedAt ?? new Date().toISOString(),
  }
}

export function createAcUnit(id: string, index: number): HvacAcUnit {
  return {
    id,
    label: `AC-${String(index + 1).padStart(2, "0")}`,
    type: "",
    pk: 2,
    ratedKw: null,
    volt: null,
    ampere: null,
    powerFactor: null,
    roomTemp: null,
    humidity: null,
    returnTemp: null,
    supplyTemp: null,
    airSpeed: null,
    grilleAreaM2: null,
    shr: DEFAULT_SHR,
    filterCondition: "",
    drainCondition: "",
    recommendation: "",
    photos: [],
  }
}

export function createExhaustZone(key: ExhaustZoneKey): HvacExhaustZone {
  return {
    key,
    present: true,
    roomName: getExhaustZoneDefinition(key).label,
    areaM2: null,
    heightM: DEFAULT_ROOM_HEIGHT,
    fanModel: DEFAULT_FAN_MODEL,
    fanFlow: DEFAULT_FAN_FLOW,
    fanWatt: DEFAULT_FAN_WATT,
    fansInstalled: null,
    grilleSpeed: null,
    makeUpAir: "",
    bladeCondition: "",
    noise: "",
    recommendation: "",
    photos: [],
  }
}

export function createEmptyHvacAudit(): HvacAuditData {
  return {
    version: 1,
    latitude: null,
    longitude: null,
    salesAreaM2: null,
    acStandard: null,
    recordedAcUnits: null,
    installedAcUnits: null,
    acCountNote: "",
    measuringTools: [...HVAC_MEASURING_TOOLS],
    units: [],
    exhaust: EXHAUST_ZONES.map((zone) => createExhaustZone(zone.key)),
    eco: [],
    ecoNote: "",
    notes: "",
  }
}

function toNumber(value: unknown, max: number, min = 0) {
  if (value === null || value === undefined || value === "") return null
  const number = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(number) || number < min) return null
  return Math.min(number, max)
}

function toCount(value: unknown, max: number) {
  const number = toNumber(value, max)
  return number === null ? null : Math.round(number)
}

function toText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

function sanitizeStandard(value: unknown): AcStandard | null {
  if (!value || typeof value !== "object") return null
  const raw = value as Record<string, unknown>
  const salesAreaM2 = toNumber(raw.salesAreaM2, 100000)
  const latitude = toNumber(raw.latitude, 90, -90)
  const longitude = toNumber(raw.longitude, 180, -180)
  const maxTemp = toNumber(raw.maxTemp, 70, -30)
  if (
    salesAreaM2 === null ||
    salesAreaM2 <= 0 ||
    latitude === null ||
    longitude === null ||
    maxTemp === null
  ) {
    return null
  }
  // Units are recomputed from the frozen inputs so a client cannot store its own count.
  return createAcStandard({
    salesAreaM2,
    latitude,
    longitude,
    maxTemp,
    calculatedAt: toText(raw.calculatedAt, 40) || new Date().toISOString(),
  })
}

function sanitizeUnit(value: unknown, index: number): HvacAcUnit {
  const raw = (value ?? {}) as Record<string, unknown>
  const base = createAcUnit(toText(raw.id, 80) || `unit-${index}`, index)
  return {
    ...base,
    label: toText(raw.label, 40) || base.label,
    type: toText(raw.type, 120),
    pk: toNumber(raw.pk, 30),
    volt: toNumber(raw.volt, 1000),
    ampere: toNumber(raw.ampere, 500),
    powerFactor: toNumber(raw.powerFactor, 1),
    roomTemp: toNumber(raw.roomTemp, 60, -10),
    humidity: toNumber(raw.humidity, 100),
    returnTemp: toNumber(raw.returnTemp, 60, -10),
    supplyTemp: toNumber(raw.supplyTemp, 60, -10),
    airSpeed: toNumber(raw.airSpeed, 100),
    grilleAreaM2: toNumber(raw.grilleAreaM2, 10),
    ratedKw: toNumber(raw.ratedKw, 100),
    shr: toNumber(raw.shr, 1) || DEFAULT_SHR,
    filterCondition: toText(raw.filterCondition, 300),
    drainCondition: toText(raw.drainCondition, 300),
    recommendation: toText(raw.recommendation, 500),
    photos: sanitizePhotos(raw.photos),
  }
}

function sanitizeExhaustZone(
  key: ExhaustZoneKey,
  value: unknown
): HvacExhaustZone {
  const raw = (value ?? {}) as Record<string, unknown>
  const base = createExhaustZone(key)
  return {
    ...base,
    present: raw.present !== false,
    roomName: toText(raw.roomName, 120) || base.roomName,
    areaM2: toNumber(raw.areaM2, 100000),
    heightM: toNumber(raw.heightM, 50) || base.heightM,
    fanModel: toText(raw.fanModel, 120) || base.fanModel,
    fanFlow: toNumber(raw.fanFlow, 100000) || base.fanFlow,
    fanWatt: toNumber(raw.fanWatt, 10000) ?? base.fanWatt,
    fansInstalled: toCount(raw.fansInstalled, 1000),
    grilleSpeed: toNumber(raw.grilleSpeed, 100),
    makeUpAir: toText(currentOption(raw.makeUpAir), 120),
    bladeCondition: toText(raw.bladeCondition, 300),
    noise: toText(raw.noise, 300),
    recommendation: toText(raw.recommendation, 500),
    photos: sanitizePhotos(raw.photos),
  }
}

export function sanitizeHvacAuditData(input: unknown): HvacAuditData {
  const raw = (input ?? {}) as Record<string, unknown>
  const exhaustInput = Array.isArray(raw.exhaust) ? raw.exhaust : []
  const ecoOptions: readonly string[] = HVAC_ECO_SUGGESTIONS
  const toolOptions: readonly string[] = HVAC_MEASURING_TOOLS

  return {
    version: 1,
    latitude: toNumber(raw.latitude, 90, -90),
    longitude: toNumber(raw.longitude, 180, -180),
    salesAreaM2: toNumber(raw.salesAreaM2, 100000),
    acStandard: sanitizeStandard(raw.acStandard),
    recordedAcUnits: toCount(raw.recordedAcUnits, 1000),
    installedAcUnits: toCount(raw.installedAcUnits, 1000),
    acCountNote: toText(raw.acCountNote, 500),
    measuringTools: Array.isArray(raw.measuringTools)
      ? raw.measuringTools
          .map(currentOption)
          .filter((tool): tool is string =>
            toolOptions.includes(tool as string)
          )
      : [],
    units: Array.isArray(raw.units)
      ? raw.units.slice(0, 100).map(sanitizeUnit)
      : [],
    exhaust: EXHAUST_ZONES.map((zone) =>
      sanitizeExhaustZone(
        zone.key,
        exhaustInput.find(
          (item) => (item as { key?: unknown } | null)?.key === zone.key
        )
      )
    ),
    eco: Array.isArray(raw.eco)
      ? raw.eco
          .map(currentOption)
          .filter((item): item is string => ecoOptions.includes(item as string))
      : [],
    ecoNote: toText(raw.ecoNote, 500),
    notes: toText(raw.notes, 1000),
  }
}

export function getHvacCompletionIssues(data: HvacAuditData) {
  const issues: string[] = []
  const summary = summarizeHvacAudit(data)

  if (data.latitude === null || data.longitude === null) {
    issues.push("Tentukan titik lokasi toko di Step 1.")
  }
  if (!data.acStandard) {
    issues.push("Hitung jumlah AC ideal di Step 1.")
  } else if (summary.standardStale) {
    issues.push(
      "Titik lokasi atau luas sales berubah. Hitung ulang jumlah AC ideal di Step 1."
    )
  }
  if (data.installedAcUnits === null) {
    issues.push("Isi jumlah AC terpasang di Step 1.")
  } else if (data.units.length !== data.installedAcUnits) {
    issues.push(
      `Ada ${data.units.length} unit di Step 2, sedangkan AC terpasang ${data.installedAcUnits} unit. Samakan jumlahnya.`
    )
  }

  for (const unit of summary.units) {
    const missing =
      unit.powerKw === null ||
      unit.deltaT === null ||
      unit.airflow === null ||
      unit.unit.roomTemp === null
    if (missing) issues.push(`Lengkapi hasil ukur ${unit.unit.label}.`)
    if (unit.unit.photos.length === 0)
      issues.push(`Tambah foto ${unit.unit.label}.`)
  }

  for (const zone of summary.exhaust) {
    if (zone.volume === null) issues.push(`Isi luas ${zone.zone.roomName}.`)
    if (zone.zone.fansInstalled === null) {
      issues.push(`Isi jumlah exhaust fan di ${zone.zone.roomName}.`)
    }
    if (zone.zone.photos.length === 0) {
      issues.push(`Tambah foto exhaust fan di ${zone.zone.roomName}.`)
    }
  }

  return issues
}

// Follow-up text per COP grade, from the sheet's examples and the technical guide.
export function suggestUnitRecommendation(status: CopStatus) {
  if (status === "SANGAT_EFISIEN" || status === "NORMAL") {
    return "Pertahankan jadwal cuci berkala"
  }
  if (status === "DEGRADASI")
    return "Jadwalkan pembersihan filter dan sirip pendingin AC"
  if (status === "KRITIS")
    return "Cuci unit outdoor AC, lalu periksa freon dan kompresor"
  return null
}

export function suggestExhaustRecommendation(summary: ExhaustZoneSummary) {
  if (summary.status === "KURANG")
    return "Tambah exhaust fan sampai jumlah yang dibutuhkan"
  if (summary.zone.makeUpAir === NO_MAKE_UP_AIR)
    return "Buat celah bawah pintu 2 sampai 3 cm atau pasang kisi-kisi pintu"
  if (summary.zone.key === "TOILET") return "Pasang sensor gerak otomatis"
  return null
}

// Efficiency items that the measurements already point to (section 3 of the technical guide).
export function suggestEco(data: HvacAuditData) {
  const units = data.units.map(summarizeAcUnit)
  const suggestions: string[] = []
  if (units.some((unit) => unit.roomTempStatus === "TERLALU_DINGIN")) {
    suggestions.push(HVAC_ECO_SUGGESTIONS[0])
  }
  if (
    units.some(
      (unit) =>
        unit.unit.humidity !== null &&
        (unit.unit.humidity < 50 || unit.unit.humidity > 60)
    )
  ) {
    suggestions.push(HVAC_ECO_SUGGESTIONS[1])
  }
  if (
    data.exhaust.some(
      (zone) =>
        zone.key === "TOILET" && zone.present && (zone.fansInstalled ?? 0) > 0
    )
  ) {
    suggestions.push(HVAC_ECO_SUGGESTIONS[2])
  }
  if (
    units.some(
      (unit) => unit.copStatus === "DEGRADASI" || unit.copStatus === "KRITIS"
    )
  ) {
    suggestions.push(HVAC_ECO_SUGGESTIONS[3])
  }
  return suggestions
}
