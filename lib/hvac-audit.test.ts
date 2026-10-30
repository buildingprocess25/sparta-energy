import assert from "node:assert/strict"

import {
  createAcStandard,
  createAcUnit,
  createEmptyHvacAudit,
  createExhaustZone,
  getAcCountResult,
  getHvacCompletionIssues,
  getSupplyTempRange,
  HVAC_ECO_SUGGESTIONS,
  HVAC_MEASURING_TOOLS,
  MAKE_UP_AIR_OPTIONS,
  suggestEco,
  suggestExhaustRecommendation,
  suggestUnitRecommendation,
  parseAcSummaryStatus,
  sanitizeHvacAuditData,
  summarizeAcUnit,
  summarizeExhaustZone,
  summarizeHvacAudit,
  toAcSummaryStatus,
  type HvacAcUnit,
} from "./hvac-audit"

const round2 = (value: number | null) => Math.round((value ?? 0) * 100) / 100

function unit(index: number, values: Partial<HvacAcUnit>): HvacAcUnit {
  return { ...createAcUnit(`u${index}`, index), ...values }
}

// Rows AC-01 to AC-04 of "Checklist AC Sales (1-Fasa)".
const sheetUnits = [
  unit(0, {
    volt: 221,
    ampere: 6.2,
    powerFactor: 0.9,
    roomTemp: 25.2,
    returnTemp: 25.4,
    supplyTemp: 15.2,
    airSpeed: 9.23,
    grilleAreaM2: 0.0325,
  }),
  unit(1, {
    volt: 219,
    ampere: 9.4,
    powerFactor: 0.91,
    roomTemp: 24.8,
    returnTemp: 25,
    supplyTemp: 14.6,
    airSpeed: 12.99,
    grilleAreaM2: 0.0325,
  }),
  unit(2, {
    volt: 220,
    ampere: 10.6,
    powerFactor: 0.88,
    roomTemp: 25.5,
    returnTemp: 25.6,
    supplyTemp: 16.5,
    airSpeed: 12.39,
    grilleAreaM2: 0.0325,
  }),
  unit(3, {
    volt: 218,
    ampere: 9.8,
    powerFactor: 0.87,
    roomTemp: 24.5,
    returnTemp: 24.8,
    supplyTemp: 17.2,
    airSpeed: 10.26,
    grilleAreaM2: 0.0325,
  }),
]
const [ac1, ac2, ac3, ac4] = sheetUnits.map(summarizeAcUnit)

assert.equal(round2(ac1.cop), 4.14)
assert.equal(ac1.copStatus, "SANGAT_EFISIEN")
assert.equal(Math.round(ac1.airflow ?? 0), 1080)
assert.equal(Math.round((ac1.capacityKw ?? 0) * 100) / 100, 5.1)
assert.equal(ac1.deltaTStatus, "NORMAL")
assert.equal(round2(ac2.cop), 3.91)
assert.equal(round2(ac3.cop), 2.98)
assert.equal(ac3.copStatus, "DEGRADASI")
assert.equal(round2(ac4.cop), 2.27)
assert.equal(ac4.copStatus, "KRITIS")
assert.equal(ac4.deltaTStatus, "KURANG")

// AC-02 reports ~24.970 BTU/h from a 2 PK unit, above nameplate by more than 10%.
assert.equal(ac2.overCapacity, true)
assert.equal(ac1.overCapacity, false)

const audit = { ...createEmptyHvacAudit(), units: sheetUnits }
const summary = summarizeHvacAudit(audit)
// Total row of the sheet: average of per-unit COP, 3,32 (NORMAL).
assert.equal(round2(summary.averageCop), 3.32)
assert.equal(summary.averageCopStatus, "NORMAL")
assert.equal(summary.hasNonStandardPk, false)
assert.equal(
  summarizeHvacAudit({ ...audit, units: [unit(0, { pk: 1.5 })] })
    .hasNonStandardPk,
  true
)

// Rows of "Checklist Ventilasi Exhaust": the sheet marks all three as MEMENUHI.
const chiller = summarizeExhaustZone({
  ...createExhaustZone("CHILLER"),
  areaM2: 16.8,
  fansInstalled: 2,
})
assert.equal(chiller.fanTheoretical, 2)
assert.equal(chiller.actualAch, 19.9)
assert.equal(chiller.status, "MEMENUHI")
const gudang = summarizeExhaustZone({
  ...createExhaustZone("GUDANG"),
  areaM2: 55.8,
  fansInstalled: 2,
})
assert.equal(gudang.actualAch, 6)
assert.equal(gudang.status, "MEMENUHI")
const toilet = summarizeExhaustZone({
  ...createExhaustZone("TOILET"),
  areaM2: 1.5,
  fansInstalled: 1,
})
assert.equal(toilet.actualAch, 111.4)
assert.equal(toilet.status, "MEMENUHI")
assert.equal(
  summarizeExhaustZone({
    ...createExhaustZone("CHILLER"),
    areaM2: 16.8,
    fansInstalled: 1,
  }).status,
  "KURANG"
)

// AC count verification against the calculator standard.
const standard = createAcStandard({
  salesAreaM2: 130,
  latitude: -6.2,
  longitude: 106.8,
  maxTemp: 30,
})
assert.equal(standard.units, 4)
const located = {
  ...createEmptyHvacAudit(),
  salesAreaM2: 130,
  latitude: -6.2,
  longitude: 106.8,
  acStandard: standard,
}
assert.deepEqual(getAcCountResult({ ...located, installedAcUnits: 3 }), {
  status: "KURANG",
  difference: 1,
  standardUnits: 4,
  installed: 3,
})
assert.equal(
  getAcCountResult({ ...located, installedAcUnits: 4 }).status,
  "SESUAI"
)
assert.equal(
  getAcCountResult({ ...located, installedAcUnits: 6 }).status,
  "LEBIH"
)
// Moving the pin after counting invalidates the standard until it is recalculated.
assert.equal(
  getAcCountResult({ ...located, latitude: -7, installedAcUnits: 4 }).status,
  "BELUM_DIHITUNG"
)

assert.equal(toAcSummaryStatus("SESUAI", 0), "AC_SESUAI")
assert.equal(toAcSummaryStatus("KURANG", 1), "AC_KURANG:1")
assert.equal(toAcSummaryStatus("BELUM_DIHITUNG", 0), null)
assert.deepEqual(parseAcSummaryStatus("AC_LEBIH:2"), {
  status: "LEBIH",
  difference: 2,
})
assert.deepEqual(parseAcSummaryStatus("AC_SESUAI"), {
  status: "SESUAI",
  difference: 0,
})
assert.equal(parseAcSummaryStatus("SESUAI"), null)

// A tampered unit count is replaced by the count computed from the frozen inputs.
const sanitized = sanitizeHvacAuditData({
  ...located,
  acStandard: { ...standard, units: 9 },
})
assert.equal(sanitized.acStandard?.units, 4)

assert.ok(
  getHvacCompletionIssues(createEmptyHvacAudit()).includes(
    "Hitung jumlah AC ideal di Step 1."
  )
)
assert.ok(
  getHvacCompletionIssues({ ...located, installedAcUnits: 2, units: [] }).some(
    (issue) => issue.startsWith("Ada 0 unit di Step 2")
  )
)

// Supply hint: room target before return is measured, then return minus 8 to 12°C.
assert.deepEqual(getSupplyTempRange(null), { min: 12, max: 18 })
assert.deepEqual(getSupplyTempRange(25.4), { min: 13.4, max: 17.4 })

// Auto suggestions follow the measurements.
assert.equal(
  suggestUnitRecommendation("KRITIS"),
  "Cuci unit outdoor AC, lalu periksa freon dan kompresor"
)
assert.equal(suggestUnitRecommendation("BELUM_LENGKAP"), null)
assert.deepEqual(
  suggestEco({
    ...createEmptyHvacAudit(),
    units: [unit(0, { roomTemp: 22, humidity: 70 }), ...sheetUnits],
    exhaust: [{ ...createExhaustZone("TOILET"), fansInstalled: 1 }],
  }),
  [...HVAC_ECO_SUGGESTIONS]
)
assert.equal(
  suggestExhaustRecommendation(
    summarizeExhaustZone({
      ...createExhaustZone("CHILLER"),
      areaM2: 16.8,
      fansInstalled: 1,
    })
  ),
  "Tambah exhaust fan sampai jumlah yang dibutuhkan"
)

// BTU/h and TOTAL rows match the sheet once airflow is rounded to whole m³/h, as Excel does.
assert.deepEqual(
  [ac1, ac2, ac3, ac4].map((ac) => Math.round(ac.capacityBtu ?? 0)),
  [17402, 24972, 20844, 14407]
)
assert.equal(Math.round(summary.totalCapacityBtu), 77625)
assert.equal(Math.round((summary.averageDeltaT ?? 0) * 10) / 10, 9.3)
const ventilation = summarizeHvacAudit({
  ...createEmptyHvacAudit(),
  exhaust: [
    { ...createExhaustZone("CHILLER"), areaM2: 16.8, fansInstalled: 2 },
    { ...createExhaustZone("GUDANG"), areaM2: 55.8, fansInstalled: 2 },
    { ...createExhaustZone("TOILET"), areaM2: 1.5, fansInstalled: 1 },
  ],
}).exhaustTotals
assert.equal(Math.round(ventilation.volume * 10) / 10, 207.5)
assert.equal(ventilation.fanTheoretical, 4.1)
assert.equal(ventilation.fansInstalled, 5)
assert.equal(ventilation.totalWatt, 90)
assert.equal(ventilation.actualAch, 11.3)

// Drafts saved with the earlier technical wording keep their ticks after the rename.
const oldDraft = sanitizeHvacAuditData({
  measuringTools: ["Clamp Meter", "Infrared Thermometer"],
  eco: [
    "Naikkan setpoint AC sales ke 24 sampai 25°C",
    "Jadwalkan cuci filter dan koil kondensor berkala",
  ],
  exhaust: [{ key: "GUDANG", makeUpAir: "Door louver" }],
})
assert.deepEqual(oldDraft.measuringTools, [
  HVAC_MEASURING_TOOLS[0],
  HVAC_MEASURING_TOOLS[2],
])
assert.deepEqual(oldDraft.eco, [
  HVAC_ECO_SUGGESTIONS[0],
  HVAC_ECO_SUGGESTIONS[3],
])
assert.equal(
  oldDraft.exhaust.find((zone) => zone.key === "GUDANG")?.makeUpAir,
  MAKE_UP_AIR_OPTIONS[0]
)

// Photos per AC unit and exhaust room: kept on save, broken entries dropped, three at most.
const photo = (ref: string) => ({
  storage: "drive",
  ref,
  sig: "sig",
  name: `${ref}.jpg`,
  uploadedAt: "2026-10-28T00:00:00.000Z",
})
const withPhotos = sanitizeHvacAuditData({
  units: [
    {
      id: "a",
      label: "AC-01",
      photos: [
        photo("1"),
        photo("2"),
        photo("3"),
        photo("4"),
        { ref: "", sig: "" },
      ],
    },
  ],
  exhaust: [{ key: "GUDANG", photos: [photo("g1")] }],
})
assert.equal(withPhotos.units[0].photos.length, 3)
assert.equal(
  withPhotos.exhaust.find((zone) => zone.key === "GUDANG")?.photos.length,
  1
)
assert.deepEqual(
  sanitizeHvacAuditData({ units: [{ id: "b" }] }).units[0].photos,
  []
)

const issues = getHvacCompletionIssues({
  ...createEmptyHvacAudit(),
  units: [unit(0, {})],
  exhaust: [{ ...createExhaustZone("TOILET"), areaM2: 1.5, fansInstalled: 1 }],
})
assert.ok(issues.includes("Tambah foto AC-01."))
assert.ok(issues.includes("Tambah foto exhaust fan di Toilet."))
assert.ok(
  !getHvacCompletionIssues({
    ...createEmptyHvacAudit(),
    units: [unit(0, { photos: withPhotos.units[0].photos })],
  }).includes("Tambah foto AC-01.")
)

console.log("hvac-audit tests passed")
