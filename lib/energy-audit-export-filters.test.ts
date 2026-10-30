import assert from "node:assert/strict"

import { AVAILABLE_ENERGY_AUDIT_CATEGORIES } from "./energy-audit-categories"
import {
  defaultExportFilters,
  exportDateRange,
  exportFileName,
  parseExportFilters,
  toExportSearchParams,
} from "./energy-audit-export-filters"

const allAvailable = AVAILABLE_ENERGY_AUDIT_CATEGORIES.map(
  (category) => category.key
)

// No query: every available category, every store, drafts included (same as before the popup).
assert.deepEqual(parseExportFilters(new URLSearchParams()), {
  categories: allAvailable,
  branches: [],
  storeCodes: [],
  status: "all",
  from: null,
  to: null,
})

const parsed = parseExportFilters(
  new URLSearchParams(
    "kategori=TATA_UDARA_VENTILASI&kategori=REFRIGERASI&kategori=NGAWUR&cabang=TEGAL,LOMBOK&toko=2p63&status=selesai&dari=2026-10-31&sampai=2026-10-01"
  )
)
// Categories without a form and unknown keys are dropped.
assert.deepEqual(parsed.categories, ["TATA_UDARA_VENTILASI"])
assert.deepEqual(parsed.branches, ["TEGAL", "LOMBOK"])
assert.deepEqual(parsed.storeCodes, ["2P63"])
assert.equal(parsed.status, "completed")
// A reversed range is swapped instead of returning nothing.
assert.deepEqual([parsed.from, parsed.to], ["2026-10-01", "2026-10-31"])
assert.equal(
  parseExportFilters(new URLSearchParams("dari=31-10-2026")).from,
  null
)

// Next.js searchParams objects work the same as URLSearchParams.
assert.deepEqual(
  parseExportFilters({ cabang: ["TEGAL", "TEGAL"], toko: "a1" }).branches,
  ["TEGAL"]
)

// Round trip through the URL keeps every filter.
assert.deepEqual(parseExportFilters(toExportSearchParams(parsed)), parsed)
assert.equal(toExportSearchParams(defaultExportFilters()).toString(), "")

// Date range covers the whole Jakarta day at both ends.
const range = exportDateRange({ from: "2026-10-01", to: "2026-10-31" })!
assert.equal(range.gte?.toISOString(), "2026-09-30T17:00:00.000Z")
assert.equal(range.lt?.toISOString(), "2026-10-31T17:00:00.000Z")
assert.equal(exportDateRange({ from: null, to: null }), null)

assert.equal(
  exportFileName(defaultExportFilters(), "2026-10-28"),
  "rekap-pemeriksaan-2026-10-28.xlsx"
)
assert.equal(
  exportFileName(
    {
      ...defaultExportFilters(),
      branches: ["TEGAL"],
      from: "2026-10-01",
      to: null,
    },
    "2026-10-28"
  ),
  "rekap-pemeriksaan-TEGAL-2026-10-01_akhir-2026-10-28.xlsx"
)

console.log("energy-audit-export-filters tests passed")
