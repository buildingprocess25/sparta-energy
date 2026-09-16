import { headers } from "next/headers"
import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAdminAuditDetail } from "@/lib/admin-audit-detail"

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  return user?.role === "ADMIN"
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const audit = await getAdminAuditDetail(id)

  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 })
  }

  const workbook = XLSX.utils.book_new()

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── SHEET 1: RINGKASAN AUDIT (EXECUTIVE SUMMARY) ──────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const summaryRows: (string | number | boolean | null | undefined)[][] = [
    ["LAPORAN HASIL AUDIT ENERGI - SPARTA ENERGY"],
    [`Toko: ${audit.store.code} - ${audit.store.name} | Tanggal Audit: ${audit.auditDate.split("T")[0]}`],
    [],
    ["1. IDENTITAS TOKO & INFORMASI AUDIT"],
    ["Kode Toko", audit.store.code, "", "Nama Toko", audit.store.name],
    ["Cabang", audit.store.branch || "-", "", "Tipe Toko", audit.store.type],
    [
      "ID Pelanggan PLN",
      audit.store.plnCustomerId || "-",
      "",
      "Daya Terpasang PLN (VA)",
      audit.store.plnPowerVa,
    ],
    [
      "Jam Operasional",
      audit.store.is24Hours
        ? "24 Jam Non-Stop"
        : `${audit.store.openTime || "-"} s/d ${audit.store.closeTime || "-"}`,
      "",
      "Tanggal Pelaksanaan Audit",
      audit.auditDate.split("T")[0],
    ],
    ["Auditor Bertugas", audit.auditor.name, "", "Email Auditor", audit.auditor.email],
    [
      "Luas Area Sales (m2)",
      audit.store.salesAreaM2,
      "",
      "Luas Area Gudang (m2)",
      audit.store.warehouseAreaM2,
    ],
    [
      "Luas Area Teras (m2)",
      audit.store.terraceAreaM2,
      "",
      "Luas Area Parkir (m2)",
      audit.store.parkingAreaM2,
    ],
    ["Total Luas Bangunan (m2)", audit.store.totalAreaM2, "", "Status Kelengkapan Data", `${audit.dataCompleteness.percent}% Lengkap`],
    [],
    ["2. INDIKATOR KINERJA ENERGI & STATUS EFISIENSI"],
    [
      "Status Efisiensi Toko",
      audit.isBoros ? "BOROS ENERGI" : "HEMAT ENERGI",
      "",
      "Total Populasi Peralatan",
      audit.totalQty,
    ],
    ["Pemakaian Aktual PLN (kWh/Bulan)", audit.actualPln, "", "Satuan", "kWh/Bulan"],
    ["Estimasi Baseline Standar (kWh/Bulan)", audit.baseline, "", "Satuan", "kWh/Bulan"],
    [
      "Selisih Beban Listrik / Gap (kWh)",
      audit.gapKwh,
      "",
      "Persentase Deviasi Gap (%)",
      audit.gapPercent !== null ? (audit.gapPercent / 100) : 0,
    ],
    ["Total Beban Harian Terdata (kWh/Hari)", audit.totalDailyKwh, "", "Satuan", "kWh/Hari"],
    ["Total Beban Bulanan Terdata (kWh/Bulan)", audit.totalMonthlyKwh, "", "Satuan", "kWh/Bulan"],
    [],
    ["3. DAFTAR REKOMENDASI AUDIT & TINDAK LANJUT"],
    ["No", "Kategori Tindakan", "Judul Rekomendasi", "Deskripsi Solusi & Langkah Perbaikan"],
  ]

  if (audit.recommendations.length === 0) {
    summaryRows.push(["-", "Tidak Ada Rekomendasi", "Sistem optimal", "Peralatan beroperasi sesuai standar efisiensi energi."])
  } else {
    audit.recommendations.forEach((rec, idx) => {
      summaryRows.push([idx + 1, rec.type, rec.title, rec.description])
    })
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows)
  summarySheet["!cols"] = [
    { wch: 34 },
    { wch: 30 },
    { wch: 6 },
    { wch: 28 },
    { wch: 55 },
  ]
  summarySheet["!rows"] = [
    { hpt: 24 }, // Title
    { hpt: 18 }, // Subtitle
    { hpt: 10 },
    { hpt: 20 }, // Header 1
  ]

  // Formats for Summary Sheet
  const numRows = summaryRows.length
  for (let r = 0; r < numRows; r++) {
    const c1 = summarySheet[XLSX.utils.encode_cell({ r, c: 1 })]
    const c4 = summarySheet[XLSX.utils.encode_cell({ r, c: 4 })]
    if (c1 && typeof c1.v === "number") {
      c1.z = "#,##0.00"
    }
    if (c4 && typeof c4.v === "number") {
      c4.z = r === 17 ? "+0.0%;-0.0%;0.0%" : "#,##0"
    }
  }

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan Audit")

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── SHEET 2: DAFTAR EQUIPMENT (INVENTARIS PERALATAN LENGKAP) ─────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const equipmentHeaders = [
    "No",
    "Area Penempatan",
    "Nama Peralatan (Equipment)",
    "Merek / Brand",
    "Jumlah (Qty)",
    "Jam Operasional (Jam/Hari)",
    "Daya Dasar (kW)",
    "Beban Harian (kWh/Hari)",
    "Beban Bulanan (kWh/Bulan)",
  ]

  const equipmentRows: (string | number)[][] = [
    [`DAFTAR INVENTARIS PERALATAN ENERGI - TOKO ${audit.store.code} (${audit.store.name})`],
    [`Total Unit: ${audit.totalQty} Peralatan | Total Beban: ${audit.totalMonthlyKwh.toLocaleString("id-ID")} kWh/Bulan`],
    [],
    equipmentHeaders,
  ]

  audit.items.forEach((item, idx) => {
    equipmentRows.push([
      idx + 1,
      item.area,
      item.name,
      item.brand,
      item.qty,
      item.operationalHours,
      item.baseKw,
      item.estimatedDailyKwh,
      Math.round(item.estimatedDailyKwh * 30 * 100) / 100,
    ])
  })

  // Baris Total
  equipmentRows.push([
    "TOTAL KESELURUHAN",
    "",
    "",
    "",
    audit.totalQty,
    "",
    "",
    Math.round(audit.totalDailyKwh * 100) / 100,
    Math.round(audit.totalMonthlyKwh * 100) / 100,
  ])

  const equipmentSheet = XLSX.utils.aoa_to_sheet(equipmentRows)
  equipmentSheet["!cols"] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 34 },
    { wch: 22 },
    { wch: 14 },
    { wch: 26 },
    { wch: 16 },
    { wch: 24 },
    { wch: 24 },
  ]
  equipmentSheet["!rows"] = [
    { hpt: 24 },
    { hpt: 18 },
    { hpt: 10 },
    { hpt: 20 },
  ]

  // Formats for Equipment Data
  for (let r = 4; r < equipmentRows.length; r++) {
    const qtyCell = equipmentSheet[XLSX.utils.encode_cell({ r, c: 4 })]
    const hoursCell = equipmentSheet[XLSX.utils.encode_cell({ r, c: 5 })]
    const kwCell = equipmentSheet[XLSX.utils.encode_cell({ r, c: 6 })]
    const dailyCell = equipmentSheet[XLSX.utils.encode_cell({ r, c: 7 })]
    const monthlyCell = equipmentSheet[XLSX.utils.encode_cell({ r, c: 8 })]

    if (qtyCell && typeof qtyCell.v === "number") qtyCell.z = "#,##0"
    if (hoursCell && typeof hoursCell.v === "number") hoursCell.z = "#,##0.0"
    if (kwCell && typeof kwCell.v === "number") kwCell.z = "#,##0.000"
    if (dailyCell && typeof dailyCell.v === "number") dailyCell.z = "#,##0.00"
    if (monthlyCell && typeof monthlyCell.v === "number") monthlyCell.z = "#,##0.00"
  }

  XLSX.utils.book_append_sheet(workbook, equipmentSheet, "Daftar Equipment")

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── SHEET 3: RIWAYAT PLN & KONSUMSI ──────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const plnHeaders = [
    "No",
    "Bulan Rekening Tagihan",
    "Pemakaian Aktual PLN (kWh)",
    "Baseline Standar (kWh)",
    "Selisih Deviasi Gap (kWh)",
    "Persentase Gap (%)",
    "Sales / Transaksi per Hari (STD)",
  ]

  const plnRows: (string | number)[][] = [
    [`HISTORI TAGIHAN LISTRIK PLN & TRANSAKSI STD - TOKO ${audit.store.code}`],
    [`Pemakaian Rata-rata: ${audit.actualPln.toLocaleString("id-ID")} kWh | Baseline: ${audit.baseline.toLocaleString("id-ID")} kWh`],
    [],
    plnHeaders,
  ]

  if (audit.plnHistory.length === 0) {
    plnRows.push(["-", "Tidak ada riwayat tagihan PLN terdata", 0, audit.baseline, 0, 0, 0])
  } else {
    audit.plnHistory.forEach((row, idx) => {
      const gap = Math.round((row.plnUsageKwh - audit.baseline) * 100) / 100
      const gapPct = audit.baseline > 0 ? (gap / audit.baseline) : 0
      plnRows.push([
        idx + 1,
        row.billingMonth,
        row.plnUsageKwh,
        audit.baseline,
        gap,
        gapPct,
        row.salesTransactionPerDay,
      ])
    })
  }

  const plnSheet = XLSX.utils.aoa_to_sheet(plnRows)
  plnSheet["!cols"] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 26 },
    { wch: 22 },
    { wch: 24 },
    { wch: 20 },
    { wch: 32 },
  ]
  plnSheet["!rows"] = [
    { hpt: 24 },
    { hpt: 18 },
    { hpt: 10 },
    { hpt: 20 },
  ]

  // Formats for PLN Sheet
  for (let r = 4; r < plnRows.length; r++) {
    const actCell = plnSheet[XLSX.utils.encode_cell({ r, c: 2 })]
    const baseCell = plnSheet[XLSX.utils.encode_cell({ r, c: 3 })]
    const gapCell = plnSheet[XLSX.utils.encode_cell({ r, c: 4 })]
    const pctCell = plnSheet[XLSX.utils.encode_cell({ r, c: 5 })]
    const stdCell = plnSheet[XLSX.utils.encode_cell({ r, c: 6 })]

    if (actCell && typeof actCell.v === "number") actCell.z = "#,##0.00"
    if (baseCell && typeof baseCell.v === "number") baseCell.z = "#,##0.00"
    if (gapCell && typeof gapCell.v === "number") gapCell.z = "+#,##0.00;-#,##0.00;0.00"
    if (pctCell && typeof pctCell.v === "number") pctCell.z = "+0.0%;-0.0%;0.0%"
    if (stdCell && typeof stdCell.v === "number") stdCell.z = "#,##0"
  }

  XLSX.utils.book_append_sheet(workbook, plnSheet, "Riwayat PLN")

  // ─── EXPORT WORKBOOK KE BUFFER ─────────────────────────────────────────────
  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    cellDates: true,
    type: "buffer",
  }) as Buffer

  const sanitizedStoreName = audit.store.name.replace(/[^a-zA-Z0-9_-]/g, "_")
  const dateStr = audit.auditDate.split("T")[0]
  const filename = `Audit_Energy_${audit.store.code}_${sanitizedStoreName}_${dateStr}.xlsx`

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
