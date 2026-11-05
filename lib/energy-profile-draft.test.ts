import assert from "node:assert/strict"

import {
  emptyProfileDraft,
  normalizeBrandProfile,
  parseDecimal,
  profileDraftFromBrand,
  resolveProfileDraft,
} from "./energy-profile-draft"

const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`)

assert.equal(parseDecimal("0,0154"), 0.0154)
assert.ok(Number.isNaN(parseDecimal(" ")))

// The revision sheet: 900 W, 95% / 10% of nameplate, 20% running.
const sheet = resolveProfileDraft(
  { ...emptyProfileDraft(), nameplate: "900", nameplateUnit: "W", runningTimePct: "20" },
  "DINAMIS",
  "STANDARD",
  null
)
assert.deepEqual(sheet.issues, [])
close(sheet.values.nameplateKw, 0.9)
close(sheet.values.runningKw, 0.855)
close(sheet.values.standbyKw, 0.09)
close(sheet.values.standbyTimePct!, 80)
close(sheet.values.baseKw, 0.243)
assert.equal(sheet.values.runningPctOfNameplate, 95)

// Running and standby typed as power, in kW.
const typed = resolveProfileDraft(
  {
    ...emptyProfileDraft(),
    nameplate: "8",
    nameplateUnit: "kW",
    runningMode: "power",
    running: "8",
    runningUnit: "kW",
    standbyMode: "power",
    standby: "1000",
    standbyUnit: "W",
    runningTimePct: "20",
  },
  "DINAMIS",
  "STANDARD",
  null
)
close(typed.values.baseKw, 2.4)
assert.equal(typed.values.runningPctOfNameplate, null)

// STATIS: H is the nameplate; percent fields are not stored.
const lamp = resolveProfileDraft({ ...emptyProfileDraft(), nameplate: "15,4", nameplateUnit: "W" }, "STATIS", "STANDARD", null)
assert.deepEqual(lamp.issues, [])
close(lamp.values.baseKw, 0.0154)
assert.equal(lamp.values.runningTimePct, null)

// Missing K, or a usage method without its cycle, is reported.
assert.deepEqual(
  resolveProfileDraft({ ...emptyProfileDraft(), nameplate: "900" }, "DINAMIS", "STANDARD", null).issues.map((i) => i.field),
  ["runningTimePct"]
)
assert.deepEqual(
  resolveProfileDraft({ ...emptyProfileDraft(), nameplate: "900", runningTimePct: "20" }, "DINAMIS", "BATCH", null).issues.map((i) => i.field),
  ["cycleSeconds"]
)

// Round trip: a stored brand loads back into the same draft values.
const reloaded = profileDraftFromBrand({
  nameplateKw: 0.9,
  baseKw: 0.243,
  runningKw: 0.855,
  standbyKw: 0.09,
  runningPctOfNameplate: 95,
  standbyPctOfNameplate: 10,
  runningTimePct: 20,
})
assert.equal(reloaded.nameplate, "900")
assert.equal(reloaded.nameplateUnit, "W")
assert.equal(reloaded.running, "95")
assert.equal(reloaded.runningTimePct, "20")

// Brands saved before v2 (no nameplate, running as power) still load.
const legacy = profileDraftFromBrand({
  nameplateKw: null,
  baseKw: 1.07125,
  runningKw: 1.55,
  standbyKw: 0.005,
  runningPctOfNameplate: null,
  standbyPctOfNameplate: null,
  runningTimePct: null,
})
assert.equal(legacy.nameplate, "1.0713")
assert.equal(legacy.nameplateUnit, "kW")
assert.equal(legacy.runningMode, "power")
assert.equal(legacy.running, "1.55")

// The server recomputes H instead of trusting the client.
const server = normalizeBrandProfile(
  { nameplateKw: 0.9, runningPctOfNameplate: 95, standbyPctOfNameplate: 10, runningTimePct: 20 },
  "DINAMIS",
  "STANDARD",
  null
)
close(server.values.baseKw, 0.243)

console.log("energy-profile-draft tests passed")
