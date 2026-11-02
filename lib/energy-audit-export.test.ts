import assert from "node:assert/strict"

import { AVAILABLE_ENERGY_AUDIT_CATEGORIES } from "./energy-audit-categories"
import {
  CATEGORY_RECAP_SHEETS,
  isExportableCategory,
  statusSheet,
} from "./energy-audit-export"
import { toSheetPreview } from "./xlsx-sheet"

// Every category with a live form must also export; open one without its sheets and this fails.
for (const category of AVAILABLE_ENERGY_AUDIT_CATEGORIES) {
  assert.ok(
    isExportableCategory(category.key),
    `${category.label} belum punya sheet ekspor`
  )
}
assert.equal(isExportableCategory("BEANSPOT"), false)
assert.deepEqual(Object.keys(CATEGORY_RECAP_SHEETS).sort(), [
  "TATA_CAHAYA",
  "TATA_UDARA_VENTILASI",
])

// The overview sheet only lists the chosen categories.
const sheet = statusSheet(
  [
    {
      store: { code: "A1", name: "TOKO A", branch: "TEGAL" },
      statuses: { TATA_CAHAYA: "COMPLETED", TATA_UDARA_VENTILASI: "DRAFT" },
    },
    { store: { code: "A2", name: "TOKO B", branch: "TEGAL" }, statuses: {} },
  ],
  ["TATA_UDARA_VENTILASI"]
)
assert.deepEqual(sheet.rows, [
  [
    "Kode Toko",
    "Nama Toko",
    "Cabang",
    "Sistem Tata Udara & Ventilasi",
    "Kategori Selesai",
  ],
  ["A1", "TOKO A", "TEGAL", "Draf", "0 dari 1"],
  ["A2", "TOKO B", "TEGAL", "Belum diperiksa", "0 dari 1"],
])

// Preview: header split off, rows as text, cut to the limit with the full count kept.
const preview = toSheetPreview(
  {
    name: "Contoh",
    rows: [
      ["Kode", "Tanggal", "Nilai"],
      ["A1", new Date("2026-10-28T00:00:00Z"), 3.5],
      ["A2", null, 1],
      ["A3", null, 2],
    ],
  },
  2
)
assert.deepEqual(preview.header, ["Kode", "Tanggal", "Nilai"])
assert.equal(preview.rows.length, 2)
assert.equal(preview.totalRows, 3)
assert.deepEqual(preview.rows[1], ["A2", "", "1"])
assert.ok(preview.rows[0][1].includes("2026"))

console.log("energy-audit-export tests passed")
