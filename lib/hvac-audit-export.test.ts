import assert from "node:assert/strict"
import * as XLSX from "xlsx"

import {
  createAcUnit,
  createEmptyHvacAudit,
  createExhaustZone,
  type HvacAcUnit,
} from "./hvac-audit"
import {
  hvacRecapSheets,
  hvacStoreSheets,
  type HvacExportAudit,
} from "./hvac-audit-export"
import { buildWorkbook } from "./xlsx-sheet"

// Rows AC-01 to AC-04 and the three exhaust rooms of the audit sheets.
const readings = [
  [221, 6.2, 0.9, 25.2, 54, 25.4, 15.2, 9.23],
  [219, 9.4, 0.91, 24.8, 56, 25.0, 14.6, 12.99],
  [220, 10.6, 0.88, 25.5, 58, 25.6, 16.5, 12.39],
  [218, 9.8, 0.87, 24.5, 55, 24.8, 17.2, 10.26],
]
const units: HvacAcUnit[] = readings.map(
  (
    [
      volt,
      ampere,
      powerFactor,
      roomTemp,
      humidity,
      returnTemp,
      supplyTemp,
      airSpeed,
    ],
    index
  ) => ({
    ...createAcUnit(`u${index}`, index),
    volt,
    ampere,
    powerFactor,
    roomTemp,
    humidity,
    returnTemp,
    supplyTemp,
    airSpeed,
    grilleAreaM2: 0.0325,
  })
)
const audit: HvacExportAudit = {
  status: "COMPLETED",
  auditDate: new Date("2026-10-28T00:00:00Z"),
  completedAt: new Date("2026-10-28T05:00:00Z"),
  auditor: "Auditor",
  store: {
    code: "DEM1",
    name: "Alfamart Demo 1",
    branch: "DEMO",
    address: null,
  },
  data: {
    ...createEmptyHvacAudit(),
    units,
    exhaust: [
      { ...createExhaustZone("CHILLER"), areaM2: 16.8, fansInstalled: 2 },
      { ...createExhaustZone("GUDANG"), areaM2: 55.8, fansInstalled: 2 },
      { ...createExhaustZone("TOILET"), areaM2: 1.5, fansInstalled: 1 },
    ],
  },
}

const sheets = hvacStoreSheets(audit)
assert.deepEqual(
  sheets.map((sheet) => sheet.name),
  [
    "Verifikasi AC",
    "Checklist AC Sales",
    "Checklist Exhaust",
    "Efisiensi & Foto",
  ]
)

// Header row is the sheet's own, column for column.
const ac = sheets[1].rows
const acHeaderIndex = ac.findIndex((row) => row[0] === "No")
assert.deepEqual(ac[acHeaderIndex], [
  "No",
  "ID Unit",
  "Tipe Unit AC",
  "Kapasitas (PK)",
  "Btu/h Nominal",
  "Tegangan V (Volt)",
  "Arus I (Ampere)",
  "Cos phi (PF)",
  "Daya Input (kW)",
  "Suhu Ruang (C)",
  "Kelembaban (% RH)",
  "Status Suhu Ruang",
  "Suhu Return (C)",
  "Suhu Supply (C)",
  "Delta T (C)",
  "Status Delta T",
  "Kecepatan Udara (m/s)",
  "Luas Penampang (m2)",
  "Debit Udara (m3/h)",
  "SHR Factor",
  "Kapasitas Riil (kW)",
  "Kapasitas Riil (Btu/h)",
  "COP Aktual",
  "Target COP AEDG",
  "Status Performa AC",
  "Kebersihan Filter & Koil",
  "Kondisi Drainase & Suara",
  "Rekomendasi Tindak Lanjut (ECO)",
])
const col = (name: string) => ac[acHeaderIndex].indexOf(name)
const unitRow = (n: number) => ac[acHeaderIndex + n]
// Values from the sheet rows.
assert.deepEqual(
  [1, 2, 3, 4].map((n) => [
    unitRow(n)[col("Daya Input (kW)")],
    unitRow(n)[col("Debit Udara (m3/h)")],
    unitRow(n)[col("Kapasitas Riil (kW)")],
    unitRow(n)[col("Kapasitas Riil (Btu/h)")],
    unitRow(n)[col("COP Aktual")],
    unitRow(n)[col("Status Performa AC")],
  ]),
  [
    [1.23, 1080, 5.1, 17402, 4.14, "SANGAT EFISIEN"],
    [1.87, 1520, 7.32, 24972, 3.91, "SANGAT EFISIEN"],
    [2.05, 1450, 6.11, 20844, 2.98, "DEGRADASI"],
    [1.86, 1200, 4.22, 14407, 2.27, "KRITIS"],
  ]
)
assert.equal(unitRow(4)[col("Status Delta T")], "KURANG")

// TOTAL & RATA-RATA AC row of the sheet.
const total = unitRow(5)
assert.equal(total[0], "TOTAL & RATA-RATA AC")
assert.equal(total[col("Kapasitas (PK)")], "8.0 PK")
assert.equal(total[col("Btu/h Nominal")], 72000)
assert.equal(total[col("Daya Input (kW)")], "7.02 kW")
assert.equal(total[col("Debit Udara (m3/h)")], 5250)
assert.equal(total[col("Kapasitas Riil (kW)")], "22.75 kW")
assert.equal(total[col("Kapasitas Riil (Btu/h)")], 77625)
assert.equal(total[col("COP Aktual")], 3.32)
assert.equal(total[col("Status Performa AC")], "NORMAL")
assert.equal(total[col("Delta T (C)")], 9.3)

// Exhaust sheet: rows and TOTAL VENTILASI EXHAUST as in the sheet.
const ex = sheets[2].rows
const exHeaderIndex = ex.findIndex((row) => row[0] === "No")
const exCol = (name: string) => ex[exHeaderIndex].indexOf(name)
const chiller = ex[exHeaderIndex + 1]
assert.deepEqual(
  [
    chiller[exCol("Volume (m3)")],
    chiller[exCol("Debit Target (m3/h)")],
    chiller[exCol("Fan Teoritis (Unit)")],
    chiller[exCol("ACH Aktual Terhitung")],
    chiller[exCol("Status Ventilasi")],
  ],
  [47, 941, 2, "19.9 x", "MEMENUHI"]
)
const exTotal = ex[exHeaderIndex + 4]
assert.equal(exTotal[0], "TOTAL VENTILASI EXHAUST")
assert.deepEqual(
  [
    exTotal[exCol("Luas Lantai (m2)")],
    exTotal[exCol("Volume (m3)")],
    exTotal[exCol("Debit Target (m3/h)")],
    exTotal[exCol("Fan Teoritis (Unit)")],
    exTotal[exCol("Fan Terpasang (Pcs)")],
    exTotal[exCol("Total Debit Riil (m3/h)")],
    exTotal[exCol("Total Daya (Watt)")],
    exTotal[exCol("ACH Aktual Terhitung")],
    exTotal[exCol("Status Ventilasi")],
  ],
  [74.1, 207.5, 1920, 4.1, 5, 2340, 90, "11.3 x", "100% MEMENUHI"]
)

// The recap adds one row per store, per AC unit and per room.
const recap = hvacRecapSheets([
  audit,
  { ...audit, store: { ...audit.store, code: "DEM2" } },
])
assert.deepEqual(
  recap.map((sheet) => sheet.rows.length),
  [3, 9, 7]
)

// The sheets build into a real .xlsx that opens with the same sheet names.
const reopened = XLSX.read(buildWorkbook([...sheets, ...recap]), {
  type: "buffer",
})
assert.deepEqual(
  reopened.SheetNames,
  [...sheets, ...recap].map((sheet) => sheet.name)
)

console.log("hvac-audit-export tests passed")
