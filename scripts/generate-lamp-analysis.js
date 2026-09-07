import fs from "fs"
import path from "path"
import XLSX from "xlsx"

const LAMP_WATT = 13.5
const LAMP_LEN = 1.22

function calcSimetris(lebar, panjang, areaSales, watt = LAMP_WATT, lampLen = LAMP_LEN) {
  const limitMaxLamps = Math.ceil((5.0 * areaSales) / watt)
  const limitMinLamps = Math.ceil((4.0 * areaSales) / watt)

  const lpbMax = Math.ceil(lebar / lampLen)
  const lpbMin = Math.floor(lebar / lampLen)
  const lpbM1 = Math.max(1, lpbMin - 1)

  const jsMax = (lebar - lpbMax * lampLen) / 2
  const jsMin = (lebar - lpbMin * lampLen) / 2
  const jsM1 = (lebar - lpbM1 * lampLen) / 2

  let lpb
  let jarakSamping
  const inRange = (v) => v >= 0.3 && v <= 0.6

  if (inRange(jsMin)) {
    lpb = lpbMin
    jarakSamping = jsMin
  } else if (inRange(jsMax)) {
    lpb = lpbMax
    jarakSamping = jsMax
  } else if (inRange(jsM1)) {
    lpb = lpbM1
    jarakSamping = jsM1
  } else {
    lpb = lpbM1
    jarakSamping = jsM1
  }

  const floorMax = Math.floor(limitMaxLamps / lpb) * lpb
  const ceilMin = Math.ceil(limitMinLamps / lpb) * lpb
  const jumlahLampuSampling = floorMax < limitMinLamps ? ceilMin : floorMax

  const C33 = Math.max(1, Math.round(jumlahLampuSampling / lpb))
  const C34 = panjang / (C33 + 1)
  const baris = C34 > 1.9 ? C33 + 1 : C33

  const total = baris * lpb
  const jarakPerbaris = panjang / (baris + 1)
  const rasio = Math.round(((total * watt) / areaSales) * 100) / 100

  return {
    baris,
    lampuPerbaris: lpb,
    total,
    jarakPerbaris,
    jarakSamping,
    rasio,
    minLamps: limitMinLamps,
    maxLamps: Math.max(limitMaxLamps, total),
  }
}

function evaluateDetailed(rasio, jarakSamping, jarakBaris, totalLampu, minLamps, maxLamps) {
  const issues = []

  // 1. Aspek Rasio Daya (Watt/m²)
  let statusRasio = "Ideal"
  if (rasio > 5.0) {
    statusRasio = "Toleransi (High / Terang)"
    const lampOver = totalLampu - maxLamps
    const wattOver = (rasio - 5.0).toFixed(2)
    issues.push(`Over +${lampOver > 0 ? lampOver : 0} Lampu (+${wattOver} W/m²)`)
  } else if (rasio < 4.0) {
    statusRasio = "Toleransi (Low / Hemat)"
    const lampUnder = minLamps - totalLampu
    const wattUnder = (4.0 - rasio).toFixed(2)
    issues.push(`Kurang -${lampUnder > 0 ? lampUnder : 0} Lampu (-${wattUnder} W/m²)`)
  }

  // 2. Aspek Jarak Samping (JS)
  let statusSamping = "Ideal"
  if (jarakSamping < 0.3) {
    statusSamping = "Toleransi (Mepet < 0.3m)"
    issues.push(`Samping Mepet (${jarakSamping.toFixed(2)}m < 0.3m)`)
  } else if (jarakSamping > 0.6) {
    statusSamping = "Toleransi (Renggang > 0.6m)"
    issues.push(`Samping Renggang (${jarakSamping.toFixed(2)}m > 0.6m)`)
  }

  // 3. Aspek Jarak Baris (JB)
  let statusBaris = "Ideal"
  if (jarakBaris > 1.9) {
    statusBaris = "Toleransi (Lebar > 1.9m)"
    issues.push(`Baris Renggang (${jarakBaris.toFixed(2)}m > 1.9m)`)
  }

  // 4. Status Standar Kumulatif
  const isIdeal = statusRasio === "Ideal" && statusSamping === "Ideal" && statusBaris === "Ideal"
  const statusKumulatif = isIdeal ? "Standar Ideal" : "Standar Toleransi"

  const keteranganDiagnosa = issues.length > 0 ? issues.join(" | ") : "Sesuai Standar Target"

  return {
    statusRasio,
    statusSamping,
    statusBaris,
    statusKumulatif,
    keteranganDiagnosa,
  }
}

async function run() {
  console.log("Generating Enhanced Lamp Simulation & Statistical Analysis...")

  const minDim = 5.0
  const maxDim = 25.0
  const step = 0.1

  const headers = [
    "Lebar (m)",
    "Panjang (m)",
    "Luas Area (m2)",
    "Batas Min Lampu",
    "Batas Max Lampu",
    "Batas Min Watt",
    "Batas Max Watt",
    "Lampu Per Baris",
    "Jumlah Baris",
    "Total Lampu Rekomendasi",
    "Total Watt Aktual",
    "Aktual (W/m2)",
    "Jarak Samping (m)",
    "Jarak Antar Baris (m)",
    "Status Rasio Watt",
    "Status Jarak Samping",
    "Status Jarak Baris",
    "Status Standar Komulatif",
    "Keterangan Diagnosa",
  ]

  const dataRows = []
  const csvLines = [headers.join(",")]

  // Stats Counters
  const stats = {
    totalRows: 0,
    rasio: {
      ideal: 0,
      toleransiLow: 0,
      toleransiHigh: 0,
    },
    samping: {
      ideal: 0,
      toleransiMepet: 0,
      toleransiRenggang: 0,
    },
    baris: {
      ideal: 0,
      toleransiLebar: 0,
    },
    kumulatif: {
      ideal: 0,
      toleransi: 0,
    },
  }

  for (let l = minDim; l <= maxDim + 0.001; l = Math.round((l + step) * 10) / 10) {
    for (let p = minDim; p <= maxDim + 0.001; p = Math.round((p + step) * 10) / 10) {
      const area = Math.round(l * p * 100) / 100
      const sim = calcSimetris(l, p, area)

      const totalWatt = Math.round(sim.total * LAMP_WATT * 100) / 100
      const minWatt = Math.round(sim.minLamps * LAMP_WATT * 100) / 100
      const maxWatt = Math.round(sim.maxLamps * LAMP_WATT * 100) / 100

      const evalRes = evaluateDetailed(
        sim.rasio,
        sim.jarakSamping,
        sim.jarakPerbaris,
        sim.total,
        sim.minLamps,
        sim.maxLamps
      )

      // Count stats
      stats.totalRows++
      if (evalRes.statusRasio === "Ideal") stats.rasio.ideal++
      else if (evalRes.statusRasio === "Toleransi (Low / Hemat)") stats.rasio.toleransiLow++
      else if (evalRes.statusRasio === "Toleransi (High / Terang)") stats.rasio.toleransiHigh++

      if (evalRes.statusSamping === "Ideal") stats.samping.ideal++
      else if (evalRes.statusSamping === "Toleransi (Mepet < 0.3m)") stats.samping.toleransiMepet++
      else if (evalRes.statusSamping === "Toleransi (Renggang > 0.6m)") stats.samping.toleransiRenggang++

      if (evalRes.statusBaris === "Ideal") stats.baris.ideal++
      else if (evalRes.statusBaris === "Toleransi (Lebar > 1.9m)") stats.baris.toleransiLebar++

      if (evalRes.statusKumulatif === "Standar Ideal") stats.kumulatif.ideal++
      else stats.kumulatif.toleransi++

      const rowObj = {
        "Lebar (m)": l,
        "Panjang (m)": p,
        "Luas Area (m2)": area,
        "Batas Min Lampu": sim.minLamps,
        "Batas Max Lampu": sim.maxLamps,
        "Batas Min Watt": minWatt,
        "Batas Max Watt": maxWatt,
        "Lampu Per Baris": sim.lampuPerbaris,
        "Jumlah Baris": sim.baris,
        "Total Lampu Rekomendasi": sim.total,
        "Total Watt Aktual": totalWatt,
        "Aktual (W/m2)": sim.rasio,
        "Jarak Samping (m)": Number(sim.jarakSamping.toFixed(2)),
        "Jarak Antar Baris (m)": Number(sim.jarakPerbaris.toFixed(2)),
        "Status Rasio Watt": evalRes.statusRasio,
        "Status Jarak Samping": evalRes.statusSamping,
        "Status Jarak Baris": evalRes.statusBaris,
        "Status Standar Komulatif": evalRes.statusKumulatif,
        "Keterangan Diagnosa": evalRes.keteranganDiagnosa,
      }
      dataRows.push(rowObj)

      const csvLine = [
        l.toFixed(1),
        p.toFixed(1),
        area.toFixed(2),
        sim.minLamps,
        sim.maxLamps,
        minWatt,
        maxWatt,
        sim.lampuPerbaris,
        sim.baris,
        sim.total,
        totalWatt,
        sim.rasio.toFixed(2),
        sim.jarakSamping.toFixed(2),
        sim.jarakPerbaris.toFixed(2),
        `"${evalRes.statusRasio}"`,
        `"${evalRes.statusSamping}"`,
        `"${evalRes.statusBaris}"`,
        `"${evalRes.statusKumulatif}"`,
        `"${evalRes.keteranganDiagnosa}"`,
      ]
      csvLines.push(csvLine.join(","))
    }
  }

  // 1. Write CSV
  const csvPath = path.join(process.cwd(), "Simulasi_Kalkulator_Lampu_v1.1.0.csv")
  fs.writeFileSync(csvPath, csvLines.join("\n"), "utf-8")
  console.log(`Saved CSV to ${csvPath} (${stats.totalRows} rows)`)

  // 2. Build Summary Sheet
  const summaryData = [
    { "Kategori Analisis": "Parameter Simulasi", "Metrik / Kriteria": "Rentang Dimensi Lebar & Panjang", "Nilai / Jumlah": "5.0m s/d 25.0m (Step 0.1m)", "Persentase (%)": "-" },
    { "Kategori Analisis": "Parameter Simulasi", "Metrik / Kriteria": "Rentang Luasan Area", "Nilai / Jumlah": "25.00 m² s/d 625.00 m²", "Persentase (%)": "-" },
    { "Kategori Analisis": "Parameter Simulasi", "Metrik / Kriteria": "Total Sampel Kombinasi Ruangan", "Nilai / Jumlah": stats.totalRows, "Persentase (%)": "100.00%" },
    { "Kategori Analisis": "Parameter Simulasi", "Metrik / Kriteria": "Spesifikasi Lampu", "Nilai / Jumlah": "LED 13.5 Watt / 1.22 m", "Persentase (%)": "-" },
    {},
    { "Kategori Analisis": "1. Aspek Rasio Daya (Watt/m²)", "Metrik / Kriteria": "Ideal (4.00 - 5.00 W/m²)", "Nilai / Jumlah": stats.rasio.ideal, "Persentase (%)": `${((stats.rasio.ideal / stats.totalRows) * 100).toFixed(2)}%` },
    { "Kategori Analisis": "1. Aspek Rasio Daya (Watt/m²)", "Metrik / Kriteria": "Toleransi Low (< 4.00 W/m²)", "Nilai / Jumlah": stats.rasio.toleransiLow, "Persentase (%)": `${((stats.rasio.toleransiLow / stats.totalRows) * 100).toFixed(2)}%` },
    { "Kategori Analisis": "1. Aspek Rasio Daya (Watt/m²)", "Metrik / Kriteria": "Toleransi High (> 5.00 W/m²)", "Nilai / Jumlah": stats.rasio.toleransiHigh, "Persentase (%)": `${((stats.rasio.toleransiHigh / stats.totalRows) * 100).toFixed(2)}%` },
    {},
    { "Kategori Analisis": "2. Aspek Jarak Samping (JS)", "Metrik / Kriteria": "Ideal (0.30m - 0.60m)", "Nilai / Jumlah": stats.samping.ideal, "Persentase (%)": `${((stats.samping.ideal / stats.totalRows) * 100).toFixed(2)}%` },
    { "Kategori Analisis": "2. Aspek Jarak Samping (JS)", "Metrik / Kriteria": "Toleransi Mepet (< 0.30m)", "Nilai / Jumlah": stats.samping.toleransiMepet, "Persentase (%)": `${((stats.samping.toleransiMepet / stats.totalRows) * 100).toFixed(2)}%` },
    { "Kategori Analisis": "2. Aspek Jarak Samping (JS)", "Metrik / Kriteria": "Toleransi Renggang (> 0.60m)", "Nilai / Jumlah": stats.samping.toleransiRenggang, "Persentase (%)": `${((stats.samping.toleransiRenggang / stats.totalRows) * 100).toFixed(2)}%` },
    {},
    { "Kategori Analisis": "3. Aspek Jarak Antar Baris (JB)", "Metrik / Kriteria": "Ideal (<= 1.90m)", "Nilai / Jumlah": stats.baris.ideal, "Persentase (%)": `${((stats.baris.ideal / stats.totalRows) * 100).toFixed(2)}%` },
    { "Kategori Analisis": "3. Aspek Jarak Antar Baris (JB)", "Metrik / Kriteria": "Toleransi Lebar (> 1.90m)", "Nilai / Jumlah": stats.baris.toleransiLebar, "Persentase (%)": `${((stats.baris.toleransiLebar / stats.totalRows) * 100).toFixed(2)}%` },
    {},
    { "Kategori Analisis": "4. Status Standar Komulatif", "Metrik / Kriteria": "Standar Ideal (Semua Aspek Ideal)", "Nilai / Jumlah": stats.kumulatif.ideal, "Persentase (%)": `${((stats.kumulatif.ideal / stats.totalRows) * 100).toFixed(2)}%` },
    { "Kategori Analisis": "4. Status Standar Komulatif", "Metrik / Kriteria": "Standar Toleransi (Ada Aspek di Luar Ideal)", "Nilai / Jumlah": stats.kumulatif.toleransi, "Persentase (%)": `${((stats.kumulatif.toleransi / stats.totalRows) * 100).toFixed(2)}%` },
  ]

  // 3. Write Excel Workbook (Multi-sheet)
  const wb = XLSX.utils.book_new()
  const wsSummary = XLSX.utils.json_to_sheet(summaryData)
  const wsData = XLSX.utils.json_to_sheet(dataRows)

  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Analisis")
  XLSX.utils.book_append_sheet(wb, wsData, "Data Simulasi Lengkap")

  const xlsxPath = path.join(process.cwd(), "Simulasi_Kalkulator_Lampu_v1.1.0.xlsx")
  XLSX.writeFile(wb, xlsxPath)
  console.log(`Saved Multi-Sheet Excel to ${xlsxPath}`)

  // Also print JSON summary for agent response
  console.log("=== HASIL STATISTIK ===")
  console.log(JSON.stringify(stats, null, 2))
}

run().catch((err) => {
  console.error("Error running script:", err)
})
