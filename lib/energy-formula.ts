// Energy formula v2 (docs/energy_calculator_formula_v2.md). One place for every
// screen that turns equipment data into kWh: field form, draft, submit,
// validation and the comparison report.
//
//   STATIS  STANDAR    G = H × O × P                      (H = nameplate)
//   DINAMIS STANDAR    G = H × O × P                      (H = I×K + J×L)
//   DINAMIS TRANSAKSI  G = I×M×Q + J×(O×P − M×Q)
//   DINAMIS BATCH      G = I×N×R + J×(O×P − N×R)
//
// Q and R are store totals, so with P > 1 the standby hours use O×P; with
// P = 1 this is exactly the formula in the revision sheet.

// Stored on audit_items.formula_version; rows before v2 have null.
export const FORMULA_VERSION = 2

export const OPERATION_TYPES = ["STATIS", "DINAMIS"] as const
export type OperationType = (typeof OPERATION_TYPES)[number]

export const CALC_METHODS = ["STANDARD", "TRANSACTION", "BATCH"] as const
export type CalcMethod = (typeof CALC_METHODS)[number]

export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  STATIS: "Statis",
  DINAMIS: "Dinamis",
}

export const CALC_METHOD_LABELS: Record<CalcMethod, string> = {
  STANDARD: "Standar",
  TRANSACTION: "Transaksi",
  BATCH: "Batch",
}

// Field equipment has no measured profile yet; these follow the revision sheet
// example (running 95% and standby 10% of nameplate) until an admin reviews it.
export const DEFAULT_RUNNING_PCT_OF_NAMEPLATE = 95
export const DEFAULT_STANDBY_PCT_OF_NAMEPLATE = 10
// Standby fallback when a usage-based brand has no standby kW, as before v2.
export const FALLBACK_STANDBY_RATIO = 0.05

export function isOperationType(value: unknown): value is OperationType {
  return typeof value === "string" && (OPERATION_TYPES as readonly string[]).includes(value)
}

export function isCalcMethod(value: unknown): value is CalcMethod {
  return typeof value === "string" && (CALC_METHODS as readonly string[]).includes(value)
}

export function isUsageMethod(method: string | null | undefined) {
  return method === "TRANSACTION" || method === "BATCH"
}

// Old rows without an operation type: usage-based methods were always dynamic.
export function resolveOperationType(
  operationType: string | null | undefined,
  calcMethod: string | null | undefined
): OperationType {
  if (isOperationType(operationType)) return operationType
  return isUsageMethod(calcMethod) ? "DINAMIS" : "STATIS"
}

export type PowerUnit = "W" | "kW"

export function toKw(value: number, unit: PowerUnit) {
  return unit === "W" ? value / 1000 : value
}

export function fromKw(kw: number, unit: PowerUnit) {
  return unit === "W" ? kw * 1000 : kw
}

export function kwFromNameplatePct(nameplateKw: number, pct: number) {
  return (nameplateKw * pct) / 100
}

// K = share of the store's open hours the equipment runs; L is the rest.
// An equipment that runs longer than the store is open counts as 100% running.
export function computeTimeShare(runHours: number, storeHours: number) {
  const window = Math.max(storeHours, runHours)
  if (!(window > 0)) return { runningPct: 0, standbyPct: 100, windowHours: 0 }
  const runningPct = (Math.max(0, runHours) / window) * 100
  return { runningPct, standbyPct: 100 - runningPct, windowHours: window }
}

// H for a dynamic profile.
export function computeBaseKw(
  runningKw: number,
  standbyKw: number,
  runningPct: number,
  standbyPct: number
) {
  return (runningKw * runningPct) / 100 + (standbyKw * standbyPct) / 100
}

export type EnergyProfile = {
  operationType: OperationType
  calcMethod: CalcMethod
  // H for STATIS (the nameplate), and the fallback when a dynamic profile is incomplete.
  baseKw: number
  runningKw?: number | null
  standbyKw?: number | null
  // Master K/L per brand; without them K comes from the hours (see computeDailyKwh).
  runningTimePct?: number | null
  standbyTimePct?: number | null
  // M or N, per transaction or batch.
  cycleSeconds?: number | null
}

export type EnergyUsage = {
  qty: number
  // O as typed in the field form: hours the equipment is on (running for DINAMIS).
  hours: number
  // Hours the store is open; null on rows saved before v2.
  storeHours?: number | null
  // Q or R, store total per day.
  usageCount?: number | null
}

export type EnergyResult = {
  dailyKwh: number
  // H actually used (dynamic profiles: I×K + J×L).
  baseKw: number
  runningKw: number
  standbyKw: number
  runningPct: number | null
  standbyPct: number | null
  // Total hours worked by all units for TRANSAKSI/BATCH (M×Q or N×R).
  workHours: number | null
  // A dynamic profile was missing running kW, so base kW stood in.
  usedFallback: boolean
  // M×Q exceeded O×P; standby was clamped at 0 so the number never goes negative.
  overloaded: boolean
}

function positive(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null
}

function nonNegative(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null
}

export function computeDailyKwh(profile: EnergyProfile, usage: EnergyUsage): EnergyResult {
  const qty = Math.max(0, usage.qty)
  const hours = Math.max(0, usage.hours)
  const baseKw = Math.max(0, profile.baseKw)
  const statis = {
    dailyKwh: baseKw * hours * qty,
    baseKw,
    runningKw: baseKw,
    standbyKw: 0,
    runningPct: null,
    standbyPct: null,
    workHours: null,
    usedFallback: false,
    overloaded: false,
  }

  if (profile.operationType === "STATIS") return statis

  // A 0 here used to make coffee machines and ovens count as 0 kWh (bug 1).
  const declaredRunning = positive(profile.runningKw)
  const runningKw = declaredRunning ?? baseKw
  const standbyKw =
    positive(profile.standbyKw) ??
    (isUsageMethod(profile.calcMethod) ? runningKw * FALLBACK_STANDBY_RATIO : nonNegative(profile.standbyKw) ?? 0)
  const usedFallback = declaredRunning === null

  if (isUsageMethod(profile.calcMethod)) {
    const cycleHours = Math.max(0, profile.cycleSeconds ?? 0) / 3600
    const workHours = cycleHours * Math.max(0, usage.usageCount ?? 0)
    const onHours = hours * qty
    const standbyHours = onHours - workHours
    return {
      dailyKwh: runningKw * workHours + standbyKw * Math.max(0, standbyHours),
      baseKw: shareBaseKw(profile, runningKw, standbyKw),
      runningKw,
      standbyKw,
      runningPct: null,
      standbyPct: null,
      workHours,
      usedFallback,
      overloaded: standbyHours < 0,
    }
  }

  if (usedFallback) return { ...statis, usedFallback: true }

  // DINAMIS STANDAR: the master K/L per brand (revision sheet: Chiller 900 W at
  // 20% / 80% gives H = 243 W). Only an item without K, such as field equipment
  // not reviewed yet, derives K from its hours against the store's open hours.
  const runningPct = nonNegative(profile.runningTimePct)
  const standbyPct = nonNegative(profile.standbyTimePct)
  if (runningPct === null || standbyPct === null) {
    if (!positive(usage.storeHours)) return { ...statis, usedFallback: true }
    const share = computeTimeShare(hours, usage.storeHours!)
    const h = computeBaseKw(runningKw, standbyKw, share.runningPct, share.standbyPct)
    return {
      dailyKwh: h * share.windowHours * qty,
      baseKw: h,
      runningKw,
      standbyKw,
      runningPct: share.runningPct,
      standbyPct: share.standbyPct,
      workHours: null,
      usedFallback: false,
      overloaded: false,
    }
  }

  const h = computeBaseKw(runningKw, standbyKw, runningPct, standbyPct)
  return {
    dailyKwh: h * hours * qty,
    baseKw: h,
    runningKw,
    standbyKw,
    runningPct,
    standbyPct,
    workHours: null,
    usedFallback: false,
    overloaded: false,
  }
}

function shareBaseKw(profile: EnergyProfile, runningKw: number, standbyKw: number) {
  const runningPct = nonNegative(profile.runningTimePct)
  const standbyPct = nonNegative(profile.standbyTimePct)
  if (runningPct === null || standbyPct === null) return profile.baseKw
  return computeBaseKw(runningKw, standbyKw, runningPct, standbyPct)
}

export type ProfileIssue = { field: string; message: string }

// Master data rules from the revision sheet (V/X per combination).
export function validateProfile(input: {
  operationType: string
  calcMethod: string
  nameplateKw?: number | null
  runningKw?: number | null
  standbyKw?: number | null
  runningTimePct?: number | null
  standbyTimePct?: number | null
  cycleSeconds?: number | null
}): ProfileIssue[] {
  const issues: ProfileIssue[] = []
  if (!isOperationType(input.operationType)) {
    issues.push({ field: "operationType", message: "Pilih karakteristik Statis atau Dinamis." })
    return issues
  }
  if (!isCalcMethod(input.calcMethod)) {
    issues.push({ field: "calcMethod", message: "Pilih metode Standar, Transaksi, atau Batch." })
    return issues
  }
  if (input.operationType === "STATIS" && input.calcMethod !== "STANDARD") {
    issues.push({ field: "calcMethod", message: "Alat statis hanya bisa memakai metode Standar." })
  }
  if (!positive(input.nameplateKw)) {
    issues.push({ field: "nameplateKw", message: "Daya nameplate harus lebih dari 0." })
  }
  if (input.operationType === "DINAMIS") {
    if (!positive(input.runningKw)) {
      issues.push({ field: "runningKw", message: "Daya running harus lebih dari 0." })
    }
    if (nonNegative(input.standbyKw) === null) {
      issues.push({ field: "standbyKw", message: "Daya standby harus 0 atau lebih." })
    }
    const k = nonNegative(input.runningTimePct)
    const l = nonNegative(input.standbyTimePct)
    if (k === null || l === null || k > 100 || l > 100) {
      issues.push({ field: "runningTimePct", message: "Waktu running dan standby harus 0 sampai 100%." })
    } else if (Math.abs(k + l - 100) > 0.01) {
      issues.push({ field: "runningTimePct", message: "Waktu running dan standby harus berjumlah 100%." })
    }
  }
  if (isUsageMethod(input.calcMethod) && !positive(input.cycleSeconds)) {
    issues.push({
      field: "cycleSeconds",
      message: input.calcMethod === "TRANSACTION"
        ? "Isi waktu per transaksi."
        : "Isi waktu per batch.",
    })
  }
  return issues
}

// Field form rule: the work hours cannot exceed the hours all units are on.
export function usageOverloadMessage(profile: EnergyProfile, usage: EnergyUsage) {
  if (profile.operationType !== "DINAMIS" || !isUsageMethod(profile.calcMethod)) return null
  const result = computeDailyKwh(profile, usage)
  if (!result.overloaded || result.workHours === null) return null
  const onHours = Math.max(0, usage.hours) * Math.max(0, usage.qty)
  return `Waktu kerja ${formatHours(result.workHours)} melebihi jam nyala ${formatHours(onHours)}. Cek jumlah ${
    profile.calcMethod === "TRANSACTION" ? "transaksi" : "batch"
  } atau jam nyala.`
}

function formatHours(hours: number) {
  return `${(Math.round(hours * 10) / 10).toLocaleString("id-ID")} jam`
}
