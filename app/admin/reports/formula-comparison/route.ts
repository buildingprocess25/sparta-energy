import { headers } from "next/headers"
import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

import { getFormulaComparisons } from "@/lib/admin-formula-comparison-queries"
import { auth } from "@/lib/auth"
import { getEffectiveRole } from "@/lib/current-role"
import { CALC_METHOD_LABELS, OPERATION_TYPE_LABELS, type CalcMethod, type OperationType } from "@/lib/energy-formula"
import { summarizeComparisons } from "@/lib/formula-comparison"
import { prisma } from "@/lib/prisma"
import { can } from "@/lib/role-access"

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  return can(await getEffectiveRole(user?.role), "adminPanel")
}

const VALIDATION_LABELS: Record<string, string> = {
  PENDING: "Menunggu validasi",
  VALIDATED: "Sudah divalidasi",
}

const status = (boros: boolean) => (boros ? "Boros" : "Hemat")
const round = (value: number | null, digits = 2) =>
  value === null ? null : Math.round(value * 10 ** digits) / 10 ** digits
const percent = (value: number | null) => (value === null ? null : value / 100)

function formatColumns(sheet: XLSX.WorkSheet, formats: Record<number, string>, firstRow = 1) {
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1")
  for (let r = firstRow; r <= range.e.r; r++) {
    for (const [c, z] of Object.entries(formats)) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c: Number(c) })]
      if (cell && typeof cell.v === "number") cell.z = z
    }
  }
}

// Read-only: compares stored standards with energy formula v2. No audit is changed.
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const branch = url.searchParams.get("branch")
  const changedOnly = url.searchParams.get("changed") === "1"

  const all = await getFormulaComparisons({ branch: branch && branch !== "all" ? branch : null })
  const rows = changedOnly ? all.filter((row) => row.statusChanged) : all
  const summary = summarizeComparisons(all)

  const summarySheet = XLSX.utils.aoa_to_sheet([
    [
      "Kode Toko",
      "Nama Toko",
      "Cabang",
      "Tanggal Audit",
      "Status Validasi",
      "Aktual PLN (kWh/Bulan)",
      "Standar Lama (kWh/Bulan)",
      "Standar Rumus Baru (kWh/Bulan)",
      "Selisih (kWh)",
      "Selisih (%)",
      "Gap Lama (%)",
      "Gap Baru (%)",
      "Status Lama",
      "Status Baru",
      "Status Berubah",
      "Alat Dihitung Ulang",
      "Alat Tetap",
    ],
    ...rows.map((row) => [
      row.storeCode,
      row.storeName,
      row.branch ?? "-",
      row.auditDate,
      VALIDATION_LABELS[row.validationStatus] ?? row.validationStatus,
      round(row.actualPlnKwhPerMonth),
      round(row.oldStandard),
      round(row.newStandard),
      round(row.diffKwh),
      percent(row.diffPercent),
      percent(row.oldGapPercent),
      percent(row.newGapPercent),
      status(row.oldIsBoros),
      status(row.newIsBoros),
      row.statusChanged ? `Ya (${status(row.oldIsBoros)} ke ${status(row.newIsBoros)})` : "Tidak",
      row.recalculatedItems,
      row.keptItems,
    ]),
  ])
  formatColumns(summarySheet, {
    5: "#,##0.00",
    6: "#,##0.00",
    7: "#,##0.00",
    8: "+#,##0.00;-#,##0.00;0.00",
    9: "+0.0%;-0.0%;0.0%",
    10: "+0.0%;-0.0%;0.0%",
    11: "+0.0%;-0.0%;0.0%",
  })
  summarySheet["!cols"] = [10, 26, 16, 12, 18, 16, 16, 18, 12, 10, 10, 10, 10, 10, 22, 12, 10].map((wch) => ({ wch }))

  const itemRows = rows.flatMap((row) =>
    row.items.map((item) => [
      row.storeCode,
      row.storeName,
      item.name,
      OPERATION_TYPE_LABELS[item.operationType as OperationType] ?? item.operationType,
      CALC_METHOD_LABELS[item.calcMethod as CalcMethod] ?? item.calcMethod,
      round(item.oldDailyKwh, 3),
      round(item.newDailyKwh, 3),
      round(item.newDailyKwh - item.oldDailyKwh, 3),
      item.recalculated ? "Ya" : "Tidak",
      item.note ?? "",
    ])
  )
  const itemSheet = XLSX.utils.aoa_to_sheet([
    [
      "Kode Toko",
      "Nama Toko",
      "Alat",
      "Karakteristik",
      "Metode",
      "kWh/Hari Lama",
      "kWh/Hari Rumus Baru",
      "Selisih (kWh/Hari)",
      "Dihitung Ulang",
      "Keterangan",
    ],
    ...itemRows,
  ])
  formatColumns(itemSheet, { 5: "#,##0.000", 6: "#,##0.000", 7: "+#,##0.000;-#,##0.000;0.000" })
  itemSheet["!cols"] = [10, 26, 34, 12, 12, 14, 18, 16, 14, 56].map((wch) => ({ wch }))

  const notesSheet = XLSX.utils.aoa_to_sheet([
    ["Laporan Pembanding Rumus Kalkulator Energi v2"],
    ["Diunduh", new Date()],
    ["Cakupan", `${branch && branch !== "all" ? `Cabang ${branch}` : "Semua cabang"}, audit selesai terakhir per toko, tanpa DEMO dan Head Office`],
    ["Baris di sheet Ringkasan", changedOnly ? "Hanya toko yang status Hemat/Boros-nya berubah" : "Semua toko"],
    [],
    ["Jumlah toko", summary.stores],
    ["Status berubah", summary.changedStatus],
    ["Hemat ke Boros", summary.hematToBoros],
    ["Boros ke Hemat", summary.borosToHemat],
    ["Rata-rata selisih standar", percent(summary.averageDiffPercent)],
    [],
    ["Cara hitung"],
    ["Data audit tidak diubah. Laporan ini hanya membaca."],
    ["Standar lama = jumlah kWh baris alat yang tersimpan × 30. Untuk audit sebelum 30 Okt 2026, angka ini bisa beda beberapa kWh dari angka di halaman audit."],
    ["Standar rumus baru memakai profil master saat laporan diunduh: Statis = daya × jam × jumlah; Dinamis = daya base (running × waktu running + standby × waktu standby) × jam × jumlah; Transaksi/Batch = running × waktu kerja + standby × sisa jam."],
    ["Alat tanpa tipe master, merek tidak terdaftar, atau profil dinamis yang belum lengkap memakai kWh lama dan ditandai di sheet Rincian Alat."],
    ["Status Boros jika aktual PLN lebih dari standar × 1,05, sama dengan aturan aplikasi."],
  ])
  const avgCell = notesSheet[XLSX.utils.encode_cell({ r: 9, c: 1 })]
  if (avgCell && typeof avgCell.v === "number") avgCell.z = "+0.0%;-0.0%;0.0%"
  notesSheet["!cols"] = [{ wch: 26 }, { wch: 120 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan")
  XLSX.utils.book_append_sheet(workbook, itemSheet, "Rincian Alat")
  XLSX.utils.book_append_sheet(workbook, notesSheet, "Catatan")

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx", cellDates: true })
  const stamp = new Date().toISOString().slice(0, 10)
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pembanding-rumus-energi-${stamp}.xlsx"`,
    },
  })
}
