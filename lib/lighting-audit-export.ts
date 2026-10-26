import * as XLSX from "xlsx"

import type { getLightingAuditsForExport } from "@/lib/energy-audit-queries"
import {
  LIGHTING_STANDARD_NOTE,
  LPD_MAX,
  LPD_MIN,
  LPD_STATUS_LABEL,
  LUX_STATUS_LABEL,
  formatLuxStandard,
  getLuxArea,
  getLuxAreaLabel,
  summarizeLightingAudit,
} from "@/lib/lighting-audit"

type ExportAudit = Awaited<ReturnType<typeof getLightingAuditsForExport>>[number]
export type Cell = string | number | Date | null

const STATUS_LABEL = { DRAFT: "Draf", COMPLETED: "Selesai" } as const
const lpdStandard = `${LPD_MIN} - ${LPD_MAX} W/m2`

function round(value: number | null, digits = 2) {
  if (value === null) return null
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function fitColumns(rows: Cell[][]) {
  const widths: number[] = []
  for (const row of rows.slice(0, 300)) {
    row.forEach((cell, index) => {
      const length = cell instanceof Date ? 12 : cell === null ? 0 : String(cell).length
      widths[index] = Math.max(widths[index] ?? 10, Math.min(length + 2, 60))
    })
  }
  return widths.map((wch) => ({ wch }))
}

export function appendSheet(workbook: XLSX.WorkBook, name: string, rows: Cell[][]) {
  const sheet = XLSX.utils.aoa_to_sheet(rows, { cellDates: true })
  sheet["!cols"] = fitColumns(rows)
  rows.forEach((row, r) =>
    row.forEach((cell, c) => {
      const target = sheet[XLSX.utils.encode_cell({ r, c })]
      if (cell instanceof Date && target) target.z = "dd mmm yyyy"
    })
  )
  XLSX.utils.book_append_sheet(workbook, sheet, name)
}

export function toBuffer(workbook: XLSX.WorkBook) {
  return XLSX.write(workbook, { bookType: "xlsx", cellDates: true, type: "buffer" }) as Buffer
}

function lampTypes(lamps: { type: string }[]) {
  return Array.from(new Set(lamps.map((lamp) => lamp.type).filter(Boolean))).join(", ")
}

export function buildLightingAuditWorkbook(audit: ExportAudit) {
  const summary = summarizeLightingAudit(audit.data)
  const workbook = XLSX.utils.book_new()

  const zoneRows: Cell[][] = summary.zones.map((zone, index) => [
    index + 1,
    zone.definition.label,
    round(zone.areaM2),
    zone.lampCount,
    lampTypes(zone.lamps),
    round(zone.totalWatt),
    round(zone.lpd),
    lpdStandard,
    LPD_STATUS_LABEL[zone.lpdStatus],
    formatLuxStandard(zone.definition),
    round(zone.avgLux, 0),
    LUX_STATUS_LABEL[zone.luxStatus],
    [...zone.eco, ...(zone.ecoNote ? [zone.ecoNote] : [])].join("; "),
  ])

  // Laid out like the "Formulir Audit Sistem Tata Cahaya" sheet.
  appendSheet(workbook, "Ringkasan", [
    ["FORMULIR PEMERIKSAAN SISTEM TATA CAHAYA - FASILITAS RETAIL"],
    [`Evaluasi kinerja efisiensi energi berdasarkan standar LPD (${LPD_MIN} - ${LPD_MAX} W/m2) & tingkat iluminasi SNI 6197`],
    [],
    ["Nama/Kode Toko", `${audit.store.name} (${audit.store.code})`, "Pemeriksa", audit.auditor],
    ["Cabang", audit.store.branch ?? "-", "Status Pemeriksaan", STATUS_LABEL[audit.status]],
    ["Alamat", audit.data.address || audit.store.address || "-", "Alat Ukur", audit.data.measuringTools.join(", ") || "-"],
    ["Tanggal Pemeriksaan", audit.auditDate, "Standar Acuan", LIGHTING_STANDARD_NOTE],
    ["Catatan", audit.data.notes || "-"],
    [],
    ["TOTAL LUAS AREA DIPERIKSA (m2)", "TOTAL DAYA LAMPU (kW)", "LPD RATA-RATA GEDUNG (W/m2)", "STATUS KEPATUHAN LPD"],
    [
      round(summary.totalArea),
      round(summary.totalWatt / 1000),
      round(summary.buildingLpd),
      LPD_STATUS_LABEL[summary.buildingStatus],
    ],
    [],
    ["TABEL REKAPITULASI PEMERIKSAAN TATA CAHAYA PER ZONA"],
    [
      "No",
      "Zona",
      "Luas (m2)",
      "Jumlah Lampu",
      "Tipe Lampu",
      "Total Daya (Watt)",
      "LPD Aktual (W/m2)",
      "Standar LPD",
      "Evaluasi LPD",
      "Standar Lux SNI",
      "Rata-rata Lux Aktual",
      "Status Iluminasi",
      "Peluang Efisiensi Energi (ECO)",
    ],
    ...zoneRows,
    [
      "TOTAL / RATA-RATA GEDUNG",
      null,
      round(summary.totalArea),
      summary.zones.reduce((sum, zone) => sum + zone.lampCount, 0),
      null,
      round(summary.totalWatt),
      round(summary.buildingLpd),
      lpdStandard,
      LPD_STATUS_LABEL[summary.buildingStatus],
      "Standar SNI",
      round(summary.buildingAvgLux, 0),
      `${summary.zonesLuxNotMetCount} zona tidak memenuhi`,
      `${summary.zonesOutsideLpdCount} zona di luar standar LPD`,
    ],
  ])

  appendSheet(workbook, "Detail Lampu", [
    ["Zona", "Tipe Lampu", "Jumlah", "Watt per Lampu", "Total Watt"],
    ...summary.zones.flatMap((zone) =>
      zone.lamps.map((lamp): Cell[] => [
        zone.definition.label,
        lamp.type,
        lamp.qty,
        round(lamp.watt),
        round(lamp.qty * lamp.watt),
      ])
    ),
  ])

  appendSheet(workbook, "Titik Ukur Lux", [
    [
      "Zona",
      "Titik ke",
      "Sub Zona",
      "Area",
      "Lux",
      "Catatan",
      "Standar Lux",
      "Rata-rata Zona",
      "Status Zona",
    ],
    ...summary.zones.flatMap((zone) =>
      zone.luxRows
        .filter((row) => row.lux !== null)
        .map((row, index): Cell[] => {
          const area = getLuxArea(row.subZone)
          return [
            zone.definition.label,
            index + 1,
            row.subZone ?? "-",
            area ? getLuxAreaLabel(area) : "-",
            row.lux,
            row.note || null,
            formatLuxStandard(zone.definition),
            round(zone.avgLux, 0),
            LUX_STATUS_LABEL[zone.luxStatus],
          ]
        })
    ),
  ])

  appendSheet(workbook, "Lux per Area", [
    ["Zona", "Area", "Jumlah Titik", "Rata-rata Lux", "Status", "Berbeda dari Rata-rata Zona"],
    ...summary.zones
      .filter((zone) => zone.definition.subZones)
      .flatMap((zone) =>
        zone.lux.areas.map((area): Cell[] => [
          zone.definition.label,
          `${area.key} · ${area.label}`,
          area.count,
          round(area.avgLux, 0),
          LUX_STATUS_LABEL[area.luxStatus],
          zone.lux.unevenAreas.some((item) => item.key === area.key) ? "Ya" : "Tidak",
        ])
      ),
  ])

  return toBuffer(workbook)
}

// Adds the Tata Cahaya sheets to a shared recap workbook.
export function appendLightingRecapSheets(workbook: XLSX.WorkBook, audits: ExportAudit[]) {
  const summaries = audits.map((audit) => ({ audit, summary: summarizeLightingAudit(audit.data) }))

  appendSheet(workbook, "Tata Cahaya - Rekap", [
    [
      "Kode Toko",
      "Nama Toko",
      "Cabang",
      "Alamat",
      "Status Pemeriksaan",
      "Tanggal Pemeriksaan",
      "Tanggal Selesai",
      "Pemeriksa",
      "Total Luas (m2)",
      "Total Daya (W)",
      "LPD Gedung (W/m2)",
      "Status LPD Gedung",
      "Rata-rata Lux",
      "Zona di Luar Standar LPD",
      "Zona Lux Tidak Memenuhi",
      "Zona Paling Boros",
      "LPD Zona Paling Boros (W/m2)",
    ],
    ...summaries.map(({ audit, summary }): Cell[] => [
      audit.store.code,
      audit.store.name,
      audit.store.branch,
      audit.data.address || audit.store.address,
      STATUS_LABEL[audit.status],
      audit.auditDate,
      audit.completedAt,
      audit.auditor,
      round(summary.totalArea),
      round(summary.totalWatt),
      round(summary.buildingLpd),
      LPD_STATUS_LABEL[summary.buildingStatus],
      round(summary.buildingAvgLux, 0),
      summary.zonesOutsideLpdCount,
      summary.zonesLuxNotMetCount,
      summary.worstZone?.definition.label ?? null,
      round(summary.worstZone?.lpd ?? null),
    ]),
  ])

  appendSheet(workbook, "Tata Cahaya - Zona", [
    [
      "Kode Toko",
      "Nama Toko",
      "Cabang",
      "Status Pemeriksaan",
      "Zona",
      "Luas (m2)",
      "Jumlah Lampu",
      "Total Daya (W)",
      "LPD (W/m2)",
      "Status LPD",
      "Rata-rata Lux",
      "Status Lux",
      "Area Tidak Merata",
      "Peluang Efisiensi",
    ],
    ...summaries.flatMap(({ audit, summary }) =>
      summary.zones.map((zone): Cell[] => [
        audit.store.code,
        audit.store.name,
        audit.store.branch,
        STATUS_LABEL[audit.status],
        zone.definition.label,
        round(zone.areaM2),
        zone.lampCount,
        round(zone.totalWatt),
        round(zone.lpd),
        LPD_STATUS_LABEL[zone.lpdStatus],
        round(zone.avgLux, 0),
        LUX_STATUS_LABEL[zone.luxStatus],
        zone.lux.unevenAreas
          .map((area) => `${area.label} (${LUX_STATUS_LABEL[area.luxStatus]})`)
          .join("; ") || null,
        [...zone.eco, ...(zone.ecoNote ? [zone.ecoNote] : [])].join("; "),
      ])
    ),
  ])
}
