import type { EnergyAuditStatus } from "@prisma/client"

import {
  COP_TARGET,
  HVAC_STANDARD_NOTE,
  formatAcCountResult,
  getCopStatus,
  getDeltaTStatus,
  getRoomTempStatus,
  summarizeHvacAudit,
  type HvacAuditData,
} from "@/lib/hvac-audit"
import type { Cell, SheetData } from "@/lib/xlsx-sheet"

export type HvacExportAudit = {
  status: EnergyAuditStatus
  auditDate: Date
  completedAt: Date | null
  auditor: string
  store: {
    code: string
    name: string
    branch: string | null
    address: string | null
  }
  data: HvacAuditData
}

const STATUS_LABEL = { DRAFT: "Draf", COMPLETED: "Selesai" } as const

// The audit sheets write statuses in capitals, e.g. "SANGAT EFISIEN", "MEMENUHI".
function sheetStatus(key: string) {
  return key.replaceAll("_", " ")
}

function round(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined) return null
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function average(values: Array<number | null>) {
  const known = values.filter((value): value is number => value !== null)
  return known.length > 0
    ? known.reduce((sum, value) => sum + value, 0) / known.length
    : null
}

function sum(values: Array<number | null>) {
  return values.reduce<number>((total, value) => total + (value ?? 0), 0)
}

const AC_HEADER: Cell[] = [
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
]

const EXHAUST_HEADER: Cell[] = [
  "No",
  "Zona Ruang",
  "Nama Ruangan / Titik",
  "Luas Lantai (m2)",
  "Tinggi (m)",
  "Volume (m3)",
  "Target ACH",
  "Debit Target (m3/h)",
  "Tipe Exhaust Fan",
  "Debit per Unit (m3/h)",
  "Daya per Fan (W)",
  "Fan Teoritis (Unit)",
  "Fan Terpasang (Pcs)",
  "Total Debit Riil (m3/h)",
  "Total Daya (Watt)",
  "ACH Aktual Terhitung",
  "Status Ventilasi",
  "Kecepatan Grille (m/s)",
  "Jalur Make-up Air",
  "Kondisi Baling-baling",
  "Suara & Vibrasi",
  "Rekomendasi Tindak Lanjut (ECO)",
]

function storeHeader(audit: HvacExportAudit): Cell[][] {
  return [
    [
      "Nama/Kode Toko",
      `${audit.store.name} (${audit.store.code})`,
      "Pemeriksa",
      audit.auditor,
    ],
    [
      "Cabang",
      audit.store.branch ?? "-",
      "Status Pemeriksaan",
      STATUS_LABEL[audit.status],
    ],
    [
      "Alamat",
      audit.store.address ?? "-",
      "Alat Ukur",
      audit.data.measuringTools.join(", ") || "-",
    ],
    [
      "Tanggal Pemeriksaan",
      audit.auditDate,
      "Standar Acuan",
      HVAC_STANDARD_NOTE,
    ],
  ]
}

// Laid out like the "Checklist AC Sales (1-Fasa)" sheet, TOTAL & RATA-RATA row included.
export function acChecklistRows(audit: HvacExportAudit): Cell[][] {
  const summary = summarizeHvacAudit(audit.data)
  const units = summary.units
  const avgRoom = average(units.map((unit) => unit.unit.roomTemp))
  const avgDeltaT = average(units.map((unit) => unit.deltaT))

  const unitRows = units.map((unit, index): Cell[] => [
    index + 1,
    unit.unit.label,
    unit.unit.type || null,
    round(unit.unit.pk, 1),
    round(unit.nominalBtu, 0),
    round(unit.unit.volt, 1),
    round(unit.unit.ampere, 2),
    round(unit.unit.powerFactor, 2),
    round(unit.powerKw),
    round(unit.unit.roomTemp, 2),
    round(unit.unit.humidity, 1),
    sheetStatus(unit.roomTempStatus),
    round(unit.unit.returnTemp, 2),
    round(unit.unit.supplyTemp, 2),
    round(unit.deltaT, 2),
    sheetStatus(unit.deltaTStatus),
    round(unit.unit.airSpeed, 2),
    round(unit.unit.grilleAreaM2, 4),
    round(unit.airflow, 0),
    round(unit.unit.shr, 2),
    round(unit.capacityKw),
    round(unit.capacityBtu, 0),
    round(unit.cop),
    COP_TARGET,
    sheetStatus(unit.copStatus),
    unit.unit.filterCondition || null,
    unit.unit.drainCondition || null,
    unit.unit.recommendation || null,
  ])

  const totalRow: Cell[] = [
    "TOTAL & RATA-RATA AC",
    null,
    null,
    `${sum(units.map((unit) => unit.unit.pk)).toFixed(1)} PK`,
    round(sum(units.map((unit) => unit.nominalBtu)), 0),
    round(average(units.map((unit) => unit.unit.volt)), 1),
    round(average(units.map((unit) => unit.unit.ampere)), 1),
    round(average(units.map((unit) => unit.unit.powerFactor)), 1),
    `${round(summary.totalPowerKw)} kW`,
    round(avgRoom, 1),
    round(average(units.map((unit) => unit.unit.humidity)), 1),
    sheetStatus(getRoomTempStatus(avgRoom)),
    round(average(units.map((unit) => unit.unit.returnTemp)), 1),
    round(average(units.map((unit) => unit.unit.supplyTemp)), 1),
    round(avgDeltaT, 1),
    sheetStatus(getDeltaTStatus(avgDeltaT)),
    round(average(units.map((unit) => unit.unit.airSpeed)), 2),
    round(average(units.map((unit) => unit.unit.grilleAreaM2)), 2),
    round(sum(units.map((unit) => unit.airflow)), 0),
    round(average(units.map((unit) => unit.unit.shr)), 2),
    `${round(summary.totalCapacityKw)} kW`,
    round(summary.totalCapacityBtu, 0),
    round(summary.averageCop),
    COP_TARGET,
    sheetStatus(getCopStatus(summary.averageCop)),
    null,
    null,
    null,
  ]

  return [
    ["CHECKLIST AUDIT SISTEM PENDINGIN AC 1-FASA (AREA SALES)"],
    [
      "Evaluasi Kinerja Termal & COP Listrik 1-Fasa (220V) | Target Suhu: 24 - 26 C | Acuan Efisiensi: ASHRAE AEDG 50% (COP Target >= 3.50)",
    ],
    [],
    ...storeHeader(audit),
    [],
    AC_HEADER,
    ...unitRows,
    ...(units.length > 0 ? [totalRow] : []),
  ]
}

// Laid out like the "Checklist Ventilasi Exhaust" sheet; rooms the store lacks are left out.
export function exhaustChecklistRows(audit: HvacExportAudit): Cell[][] {
  const summary = summarizeHvacAudit(audit.data)
  const zones = summary.exhaust
  const totals = summary.exhaustTotals
  const metCount = zones.length - summary.exhaustShortCount

  const zoneRows = zones.map((zone, index): Cell[] => [
    index + 1,
    zone.definition.label,
    zone.zone.roomName,
    round(zone.zone.areaM2, 1),
    round(zone.zone.heightM, 1),
    round(zone.volume, 1),
    `${zone.definition.targetAch} x`,
    round(zone.targetFlow, 0),
    zone.zone.fanModel,
    round(zone.zone.fanFlow, 0),
    round(zone.zone.fanWatt, 0),
    round(zone.fanTheoretical, 1),
    zone.zone.fansInstalled,
    round(zone.totalFlow, 0),
    round(zone.totalWatt, 0),
    zone.actualAch === null ? null : `${round(zone.actualAch, 1)} x`,
    sheetStatus(zone.status),
    round(zone.zone.grilleSpeed, 1),
    zone.zone.makeUpAir || null,
    zone.zone.bladeCondition || null,
    zone.zone.noise || null,
    zone.zone.recommendation || null,
  ])

  const totalRow: Cell[] = [
    "TOTAL VENTILASI EXHAUST",
    null,
    null,
    round(sum(zones.map((zone) => zone.zone.areaM2)), 1),
    round(average(zones.map((zone) => zone.zone.heightM)), 1),
    round(totals.volume, 1),
    "-",
    round(sum(zones.map((zone) => zone.targetFlow)), 0),
    null,
    null,
    null,
    totals.fanTheoretical,
    totals.fansInstalled,
    round(sum(zones.map((zone) => zone.totalFlow)), 0),
    round(totals.totalWatt, 0),
    totals.actualAch === null ? null : `${totals.actualAch} x`,
    zones.length > 0
      ? `${Math.round((metCount / zones.length) * 100)}% MEMENUHI`
      : null,
    null,
    null,
    null,
    null,
    null,
  ]

  return [
    ["CHECKLIST AUDIT SISTEM VENTILASI MEKANIKAL (EXHAUST FAN)"],
    [
      "Target ACH: Ruang Mesin Chiller 20x, Gudang 6x, Toilet 10x | Volume = Luas x Tinggi | ACH Aktual = (Fan Terpasang x Debit per Unit) / Volume",
    ],
    [],
    ...storeHeader(audit),
    [],
    EXHAUST_HEADER,
    ...zoneRows,
    ...(zones.length > 0 ? [totalRow] : []),
  ]
}

export function acCountRows(audit: HvacExportAudit): Cell[][] {
  const { data } = audit
  const summary = summarizeHvacAudit(data)
  const standard = data.acStandard
  return [
    ["VERIFIKASI JUMLAH AC"],
    [],
    ...storeHeader(audit),
    [],
    [
      "Luas Area Sales (m2)",
      round(standard?.salesAreaM2 ?? data.salesAreaM2, 2),
    ],
    [
      "Titik Lokasi",
      data.latitude === null ? "-" : `${data.latitude}, ${data.longitude}`,
    ],
    ["Suhu Terpanas Lokasi (C)", round(standard?.maxTemp, 1)],
    ["Kebutuhan Pendinginan (BTU/m2)", standard?.clusterBtu ?? null],
    ["Rumus Kalkulator AC", standard?.version ?? null],
    ["Jumlah AC Ideal (unit)", standard?.units ?? null],
    ["Tercatat di Kalkulasi (unit)", data.recordedAcUnits],
    ["Terpasang di Lapangan (unit)", data.installedAcUnits],
    [
      "Hasil Verifikasi",
      formatAcCountResult(summary.acCount.status, summary.acCount.difference),
    ],
    ["Catatan Jumlah AC", data.acCountNote || null],
  ]
}

export function ecoAndPhotoRows(audit: HvacExportAudit): Cell[][] {
  const { data } = audit
  const photoRows: Cell[][] = [
    ...data.units.flatMap((unit) =>
      unit.photos.map((photo): Cell[] => [
        `AC ${unit.label}`,
        photo.name,
        photo.uploadedAt || null,
      ])
    ),
    ...data.exhaust
      .filter((zone) => zone.present)
      .flatMap((zone) =>
        zone.photos.map((photo): Cell[] => [
          `Exhaust fan ${zone.roomName}`,
          photo.name,
          photo.uploadedAt || null,
        ])
      ),
  ]
  return [
    ["PELUANG EFISIENSI ENERGI"],
    ...(data.eco.length > 0 ? data.eco.map((item): Cell[] => [item]) : [["-"]]),
    ...(data.ecoNote ? [[`Saran lain: ${data.ecoNote}`]] : []),
    [],
    ["CATATAN UMUM"],
    [data.notes || "-"],
    [],
    ["FOTO (Google Drive: folder toko / Audit Energi / Tata Udara / tanggal)"],
    ["Unit / Ruangan", "Nama File", "Diunggah"],
    ...(photoRows.length > 0 ? photoRows : [["Belum ada foto"]]),
  ]
}

// Sheets of the per-store workbook, in the order the form fills them.
export function hvacStoreSheets(audit: HvacExportAudit): SheetData[] {
  return [
    { name: "Verifikasi AC", rows: acCountRows(audit) },
    { name: "Checklist AC Sales", rows: acChecklistRows(audit) },
    { name: "Checklist Exhaust", rows: exhaustChecklistRows(audit) },
    { name: "Efisiensi & Foto", rows: ecoAndPhotoRows(audit) },
  ]
}

// Sheets the multi-store recap adds for Tata Udara: one row per store, per AC unit, per room.
export function hvacRecapSheets(audits: HvacExportAudit[]): SheetData[] {
  const summaries = audits.map((audit) => ({
    audit,
    summary: summarizeHvacAudit(audit.data),
  }))
  const storeCells = (audit: HvacExportAudit): Cell[] => [
    audit.store.code,
    audit.store.name,
    audit.store.branch,
    STATUS_LABEL[audit.status],
  ]

  return [
    {
      name: "Tata Udara - Rekap",
      rows: [
        [
          "Kode Toko",
          "Nama Toko",
          "Cabang",
          "Status Pemeriksaan",
          "Tanggal Pemeriksaan",
          "Tanggal Selesai",
          "Pemeriksa",
          "Jumlah AC Ideal",
          "AC Tercatat di Kalkulasi",
          "AC Terpasang",
          "Hasil Verifikasi AC",
          "COP Rata-rata",
          "Status Performa AC",
          "Total Daya AC (kW)",
          "Ruangan Exhaust Memenuhi",
        ],
        ...summaries.map(({ audit, summary }): Cell[] => [
          ...storeCells(audit),
          audit.auditDate,
          audit.completedAt,
          audit.auditor,
          audit.data.acStandard?.units ?? null,
          audit.data.recordedAcUnits,
          audit.data.installedAcUnits,
          formatAcCountResult(
            summary.acCount.status,
            summary.acCount.difference
          ),
          round(summary.averageCop),
          sheetStatus(summary.averageCopStatus),
          round(summary.totalPowerKw),
          summary.exhaust.length > 0
            ? `${summary.exhaust.length - summary.exhaustShortCount} dari ${summary.exhaust.length}`
            : null,
        ]),
      ],
    },
    {
      name: "Tata Udara - Unit AC",
      rows: [
        [
          "Kode Toko",
          "Nama Toko",
          "Cabang",
          "Status Pemeriksaan",
          "ID Unit",
          "Tipe Unit AC",
          "Kapasitas (PK)",
          "Daya Input (kW)",
          "Suhu Ruang (C)",
          "Delta T (C)",
          "Kapasitas Riil (Btu/h)",
          "COP Aktual",
          "Status Performa AC",
          "Rekomendasi",
        ],
        ...summaries.flatMap(({ audit, summary }) =>
          summary.units.map((unit): Cell[] => [
            ...storeCells(audit),
            unit.unit.label,
            unit.unit.type || null,
            round(unit.unit.pk, 1),
            round(unit.powerKw),
            round(unit.unit.roomTemp, 1),
            round(unit.deltaT, 1),
            round(unit.capacityBtu, 0),
            round(unit.cop),
            sheetStatus(unit.copStatus),
            unit.unit.recommendation || null,
          ])
        ),
      ],
    },
    {
      name: "Tata Udara - Exhaust",
      rows: [
        [
          "Kode Toko",
          "Nama Toko",
          "Cabang",
          "Status Pemeriksaan",
          "Ruangan",
          "Volume (m3)",
          "Fan Terpasang",
          "Fan Teoritis",
          "ACH Aktual",
          "Target ACH",
          "Status Ventilasi",
          "Rekomendasi",
        ],
        ...summaries.flatMap(({ audit, summary }) =>
          summary.exhaust.map((zone): Cell[] => [
            ...storeCells(audit),
            zone.zone.roomName,
            round(zone.volume, 1),
            zone.zone.fansInstalled,
            round(zone.fanTheoretical, 1),
            round(zone.actualAch, 1),
            zone.definition.targetAch,
            sheetStatus(zone.status),
            zone.zone.recommendation || null,
          ])
        ),
      ],
    },
  ]
}
