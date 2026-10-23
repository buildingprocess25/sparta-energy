import assert from "node:assert/strict"

import {
  createEmptyLightingAudit,
  getCompletionIssues,
  getLpdStatus,
  getLuxStatus,
  getZoneDefinition,
  summarizeLightingAudit,
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
    luxPoints: [csv[zone.key].lux],
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

console.log("lighting-audit tests passed")
