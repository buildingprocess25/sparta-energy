import {
  computeBaseKw,
  fromKw,
  kwFromNameplatePct,
  toKw,
  validateProfile,
  type PowerUnit,
  type ProfileIssue,
} from "@/lib/energy-formula"

// What the admin types for one brand: power in W or kW, and running/standby
// either as % of the nameplate or as their own power.
export type PowerInputMode = "pct" | "power"

export type EnergyProfileDraft = {
  nameplate: string
  nameplateUnit: PowerUnit
  runningMode: PowerInputMode
  running: string
  runningUnit: PowerUnit
  standbyMode: PowerInputMode
  standby: string
  standbyUnit: PowerUnit
  runningTimePct: string
}

export type BrandProfileValues = {
  nameplateKw: number
  baseKw: number
  runningKw: number
  standbyKw: number
  runningPctOfNameplate: number | null
  standbyPctOfNameplate: number | null
  runningTimePct: number | null
  standbyTimePct: number | null
}

export function parseDecimal(value: string | number | null | undefined) {
  if (value === null || value === undefined) return Number.NaN
  if (typeof value === "number") return value
  const trimmed = value.trim().replace(",", ".")
  return trimmed === "" ? Number.NaN : Number(trimmed)
}

function trimNumber(value: number) {
  return String(Math.round(value * 10000) / 10000)
}

// Revision sheet example (95% / 10%) as the starting point; K stays empty on purpose.
export function emptyProfileDraft(): EnergyProfileDraft {
  return {
    nameplate: "",
    nameplateUnit: "W",
    runningMode: "pct",
    running: "95",
    runningUnit: "W",
    standbyMode: "pct",
    standby: "10",
    standbyUnit: "W",
    runningTimePct: "",
  }
}

export function profileDraftFromBrand(brand: {
  nameplateKw: number | null
  baseKw: number
  runningKw: number
  standbyKw: number
  runningPctOfNameplate: number | null
  standbyPctOfNameplate: number | null
  runningTimePct: number | null
}): EnergyProfileDraft {
  const nameplateKw = brand.nameplateKw ?? brand.baseKw
  const unit: PowerUnit = nameplateKw >= 1 ? "kW" : "W"
  const draft = emptyProfileDraft()
  draft.nameplate = nameplateKw > 0 ? trimNumber(fromKw(nameplateKw, unit)) : ""
  draft.nameplateUnit = unit

  if (brand.runningPctOfNameplate !== null) {
    draft.running = trimNumber(brand.runningPctOfNameplate)
  } else if (brand.runningKw > 0) {
    draft.runningMode = "power"
    draft.runningUnit = unit
    draft.running = trimNumber(fromKw(brand.runningKw, unit))
  }

  if (brand.standbyPctOfNameplate !== null) {
    draft.standby = trimNumber(brand.standbyPctOfNameplate)
  } else if (brand.standbyKw > 0 || brand.runningKw > 0) {
    draft.standbyMode = "power"
    draft.standbyUnit = unit
    draft.standby = trimNumber(fromKw(brand.standbyKw, unit))
  }

  draft.runningTimePct = brand.runningTimePct !== null ? trimNumber(brand.runningTimePct) : ""
  return draft
}

function resolvePower(mode: PowerInputMode, raw: string, unit: PowerUnit, nameplateKw: number) {
  const value = parseDecimal(raw)
  if (!Number.isFinite(value)) return { kw: Number.NaN, pct: null }
  return mode === "pct"
    ? { kw: kwFromNameplatePct(nameplateKw, value), pct: value }
    : { kw: toKw(value, unit), pct: null }
}

// Turns the draft into stored values; H is always computed here, never typed.
export function resolveProfileDraft(
  draft: EnergyProfileDraft,
  operationType: string,
  calcMethod: string,
  cycleSeconds: number | null
): { values: BrandProfileValues; issues: ProfileIssue[] } {
  const nameplateKw = toKw(parseDecimal(draft.nameplate), draft.nameplateUnit)

  if (operationType !== "DINAMIS") {
    const values: BrandProfileValues = {
      nameplateKw,
      baseKw: nameplateKw,
      runningKw: nameplateKw,
      standbyKw: 0,
      runningPctOfNameplate: null,
      standbyPctOfNameplate: null,
      runningTimePct: null,
      standbyTimePct: null,
    }
    return { values, issues: validateProfile({ operationType, calcMethod, nameplateKw, cycleSeconds }) }
  }

  const running = resolvePower(draft.runningMode, draft.running, draft.runningUnit, nameplateKw)
  const standby = resolvePower(draft.standbyMode, draft.standby, draft.standbyUnit, nameplateKw)
  const runningTimePct = parseDecimal(draft.runningTimePct)
  const standbyTimePct = Number.isFinite(runningTimePct) ? 100 - runningTimePct : Number.NaN
  const issues = validateProfile({
    operationType,
    calcMethod,
    nameplateKw,
    runningKw: running.kw,
    standbyKw: standby.kw,
    runningTimePct,
    standbyTimePct,
    cycleSeconds,
  })

  return {
    values: {
      nameplateKw,
      baseKw: computeBaseKw(running.kw, standby.kw, runningTimePct, standbyTimePct),
      runningKw: running.kw,
      standbyKw: standby.kw,
      runningPctOfNameplate: running.pct,
      standbyPctOfNameplate: standby.pct,
      runningTimePct,
      standbyTimePct,
    },
    issues,
  }
}

export type BrandProfileInput = {
  nameplateKw: number
  runningKw?: number | null
  standbyKw?: number | null
  runningPctOfNameplate?: number | null
  standbyPctOfNameplate?: number | null
  runningTimePct?: number | null
}

// Server side: re-validate what the form sent and recompute H, so a client can
// never store an H that does not follow from its own profile.
export function normalizeBrandProfile(
  input: BrandProfileInput,
  operationType: string,
  calcMethod: string,
  cycleSeconds: number | null
): { values: BrandProfileValues; issues: ProfileIssue[] } {
  const nameplateKw = Number(input.nameplateKw)
  if (operationType !== "DINAMIS") {
    return resolveProfileDraft(
      { ...emptyProfileDraft(), nameplate: String(nameplateKw), nameplateUnit: "kW" },
      operationType,
      calcMethod,
      cycleSeconds
    )
  }
  const asDraft: EnergyProfileDraft = {
    nameplate: String(nameplateKw),
    nameplateUnit: "kW",
    runningMode: input.runningPctOfNameplate != null ? "pct" : "power",
    running: String(input.runningPctOfNameplate ?? input.runningKw ?? ""),
    runningUnit: "kW",
    standbyMode: input.standbyPctOfNameplate != null ? "pct" : "power",
    standby: String(input.standbyPctOfNameplate ?? input.standbyKw ?? ""),
    standbyUnit: "kW",
    runningTimePct: input.runningTimePct == null ? "" : String(input.runningTimePct),
  }
  return resolveProfileDraft(asDraft, operationType, calcMethod, cycleSeconds)
}

export function profileIssueMessage(issues: ProfileIssue[]) {
  return issues.map((issue) => issue.message).join(" ")
}
