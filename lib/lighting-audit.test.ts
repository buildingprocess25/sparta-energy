import assert from "node:assert/strict"

import {
  createEmptyLightingAudit,
  getCompletionIssues,
  getLpdStatus,
  getLuxStatus,
  getZoneDefinition,
  sanitizeLightingAuditData,
  summarizeLightingAudit,
  summarizeLux,
  type LightingAuditData,
  type LightingZoneKey,
} from "./lighting-audit"

const round2 = (value: number | null) =>
  value === null ? null : Math.round(value * 100) / 100

// Figures from the Tata Cahaya CSV sheet (total watt per zone + measured lux).
const csv: Record<LightingZoneKey, { area: number; watt: number; lux: number }> = {
  SALES: { area: 150, watt: 3024, lux: 491 },
  PARKIRAN: { area: 300, watt: 2236, lux: 70 },
  TERAS: { area: 22.5, watt: 536, lux: 168 },
  GUDANG: { area: 60, watt: 1200, lux: 160 },
  SELASAR: { area: 15, watt: 392, lux: 118 },
  TOILET: { area: 1.5, watt: 177, lux: 137 },
}

const data: LightingAuditData = {
  ...createEmptyLightingAudit(),
  zones: createEmptyLightingAudit().zones.map((zone) => ({
    ...zone,
    areaM2: csv[zone.key].area,
    lamps: [{ id: zone.key, type: "Lampu", qty: 1, watt: csv[zone.key].watt }],
    luxRows: [
      {
        id: zone.key,
        subZone: getZoneDefinition(zone.key).subZones ? "B2" : null,
        lux: csv[zone.key].lux,
        note: "",
      },
    ],
  })),
}

const summary = summarizeLightingAudit(data)
const zone = (key: LightingZoneKey) => summary.zones.find((z) => z.key === key)!

assert.equal(summary.totalArea, 549)
assert.equal(summary.totalWatt, 7565)
assert.equal(round2(summary.buildingLpd), 13.78)
assert.equal(summary.buildingStatus, "DI_ATAS")
assert.equal(round2(zone("SALES").lpd), 20.16)
assert.equal(round2(zone("PARKIRAN").lpd), 7.45)
assert.equal(round2(zone("TERAS").lpd), 23.82)
assert.equal(round2(zone("SELASAR").lpd), 26.13)
assert.equal(round2(zone("TOILET").lpd), 118)
assert.equal(summary.zonesOutsideLpdCount, 6)
assert.equal(summary.zonesLuxNotMetCount, 0)
assert.equal(summary.worstZone?.key, "TOILET")
assert.ok(summary.zones.every((z) => z.luxStatus === "MEMENUHI"))

assert.equal(getLpdStatus(4), "SESUAI")
assert.equal(getLpdStatus(5), "SESUAI")
assert.equal(getLpdStatus(5.01), "DI_ATAS")
assert.equal(getLpdStatus(3.99), "DI_BAWAH")
assert.equal(getLpdStatus(null), "BELUM_LENGKAP")

const sales = getZoneDefinition("SALES")
assert.equal(getLuxStatus(299, sales), "KURANG")
assert.equal(getLuxStatus(501, sales), "TERLALU_TERANG")
assert.equal(getLuxStatus(null, sales), "BELUM_DIUKUR")

assert.equal(getCompletionIssues(data).length, 0)
assert.equal(getCompletionIssues(createEmptyLightingAudit()).length, 12)

// Default template: A1 to C3 plus one spare row; toilet has no sub zona.
const empty = createEmptyLightingAudit()
const salesRows = empty.zones.find((z) => z.key === "SALES")!.luxRows
assert.equal(salesRows.length, 10)
assert.deepEqual(
  salesRows.map((row) => row.subZone),
  ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3", null]
)
assert.ok(empty.zones.find((z) => z.key === "TOILET")!.luxRows.every((r) => r.subZone === null))

// A bright front with many points must not hide a dark back.
const row = (subZone: "A1" | "A2" | "A3" | "B1" | "C1" | null, lux: number, note = "") => ({
  id: `${subZone}-${lux}`,
  subZone,
  lux,
  note,
})
const uneven = summarizeLux(
  [row("A1", 600), row("A2", 600), row("A3", 600), row("B1", 400), row("C1", 150)],
  sales
)
assert.equal(uneven.avgLux, (600 + 400 + 150) / 3)
assert.equal(uneven.luxStatus, "MEMENUHI")
assert.deepEqual(uneven.unevenAreas.map((a) => a.key), ["A", "C"])
assert.deepEqual(uneven.areasMissingNote.map((a) => a.key), ["A", "C"])

const explained = summarizeLux(
  [row("A1", 600, "Tidak ada rak"), row("B1", 400), row("C1", 150, "Lampu mati 2")],
  sales
)
assert.equal(explained.areasMissingNote.length, 0)

// Version 1 drafts: plain luxPoints become rows without a sub zona.
const legacy = sanitizeLightingAuditData({
  measuringTools: ["Power Clamp Meter"],
  zones: [
    {
      key: "SALES",
      luxPoints: [450, 380],
      eco: ["Optimalkan relighting gondola", "Pasang zoning switch di area kasir"],
    },
  ],
})
const legacySales = legacy.zones.find((z) => z.key === "SALES")!
assert.deepEqual(legacy.measuringTools, ["Power Clamp Meter / Energy Meter"])
assert.deepEqual(legacySales.luxRows.map((r) => [r.subZone, r.lux]), [[null, 450], [null, 380]])
assert.deepEqual(legacySales.eco, ["Optimalisasi layout lampu"])
assert.ok(
  getCompletionIssues(legacy).includes(
    "Pilih sub zona untuk setiap titik lux di Area Sales."
  )
)

console.log("lighting-audit tests passed")
