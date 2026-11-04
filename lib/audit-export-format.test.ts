import assert from "node:assert/strict"
import * as XLSX from "xlsx"

import {
  GAP_ROW_LABEL,
  gapPercentCell,
  KW_FORMAT,
  summaryValueFormat,
} from "./audit-export-format"

// TF67 KYAI MAJA 2: actual 8,803.83 vs standard 10,683.59 is a -17.6% gap.
const rows: (string | number)[][] = [
  ["Pemakaian Aktual PLN (kWh/Bulan)", 8803.83, "", "Satuan", "kWh/Bulan"],
  ["Estimasi Baseline Standar (kWh/Bulan)", 10683.59, "", "Satuan", "kWh/Bulan"],
  [GAP_ROW_LABEL, -1879.75, "", "Persentase Deviasi Gap (%)", gapPercentCell(-17.595)],
  ["Status Efisiensi Toko", "HEMAT ENERGI", "", "Total Populasi Peralatan", 112],
]
const sheet = XLSX.utils.aoa_to_sheet(rows)
rows.forEach((row, r) => {
  const cell = sheet[XLSX.utils.encode_cell({ r, c: 4 })]
  if (cell && typeof cell.v === "number") cell.z = summaryValueFormat(row[0])
})
const shown = (r: number, c: number) => XLSX.utils.format_cell(sheet[XLSX.utils.encode_cell({ r, c })])

// The percent format lands on the gap row wherever that row sits.
assert.equal(shown(2, 4), "-17.6%")
assert.equal(shown(3, 4), "112")

// No baseline means no gap to show, not a 0% gap.
assert.equal(gapPercentCell(null), "-")

// Lamp power keeps its fourth decimal.
const kwSheet = XLSX.utils.aoa_to_sheet([[0.0154], [0.35]])
kwSheet.A1.z = KW_FORMAT
kwSheet.A2.z = KW_FORMAT
assert.equal(XLSX.utils.format_cell(kwSheet.A1), "0.0154")
assert.equal(XLSX.utils.format_cell(kwSheet.A2), "0.3500")

console.log("audit-export-format tests passed")
