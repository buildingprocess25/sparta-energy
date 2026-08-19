import fs from "fs"
import path from "path"

const LAMP_WATT = 13.5
const LAMP_LEN = 1.22

interface SimetrisResult {
  baris: number
  lampuPerbaris: number
  total: number
  jarakPerbaris: number
  jarakSamping: number
  rasio: number
  minLamps: number
  maxLamps: number
}

function calcSimetris(
  lebar: number,
  panjang: number,
  areaSales: number,
  watt: number = LAMP_WATT,
  lampLen: number = LAMP_LEN
): SimetrisResult {
  const limitMaxLamps = Math.ceil((5.0 * areaSales) / watt)
  const limitMinLamps = Math.ceil((4.0 * areaSales) / watt)

  const lpbMax = Math.ceil(lebar / lampLen)
  const lpbMin = Math.floor(lebar / lampLen)
  const lpbM1 = Math.max(1, lpbMin - 1)

  const jsMax = (lebar - lpbMax * lampLen) / 2
  const jsMin = (lebar - lpbMin * lampLen) / 2
  const jsM1 = (lebar - lpbM1 * lampLen) / 2

  let lpb: number
  let jarakSamping: number
  const inRange = (v: number) => v >= 0.3 && v <= 0.6

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
    maxLamps: limitMaxLamps,
  }
}

function evaluateStatus(
  rasio: number,
  jarakSamping: number,
  jarakBaris: number,
  totalLampu: number,
  minLamps: number,
  maxLamps: number
) {
  const issues: string[] = []

  // Cek Rasio / Jumlah Lampu
  if (rasio > 5.0) {
    const lampOver = totalLampu - maxLamps
    const wattOver = (rasio - 5.0).toFixed(2)
    issues.push(`Over +${lampOver > 0 ? lampOver : 0} Lampu (+${wattOver} W/m²)`)
  } else if (rasio < 4.0) {
    const lampUnder = minLamps - totalLampu
    const wattUnder = (4.0 - rasio).toFixed(2)
    issues.push(`Kurang -${lampUnder > 0 ? lampUnder : 0} Lampu (-${wattUnder} W/m²)`)
  }

  // Cek Jarak Samping
  if (jarakSamping < 0.3) {
    issues.push(`Samping Mepet (${jarakSamping.toFixed(2)}m < 0.3m)`)
  } else if (jarakSamping > 0.6) {
    issues.push(`Samping Renggang (${jarakSamping.toFixed(2)}m > 0.6m)`)
  }

  // Cek Jarak Baris
  if (jarakBaris > 1.9) {
    issues.push(`Baris Renggang (${jarakBaris.toFixed(2)}m > 1.9m)`)
  }

  const isIdeal =
    rasio >= 4.0 &&
    rasio <= 5.0 &&
    jarakSamping >= 0.3 &&
    jarakSamping <= 0.6 &&
    jarakBaris <= 1.9

  const inTolerance =
    rasio >= 3.5 &&
    rasio <= 5.5 &&
    jarakSamping >= 0.2 &&
    jarakSamping <= 0.8 &&
    jarakBaris <= 2.2

  let status = "Di Luar Standar"
  if (isIdeal) {
    status = "Standar Ideal"
  } else if (inTolerance) {
    status = "Standar Toleransi"
  }

  const detailIssue = issues.length > 0 ? issues.join(" | ") : "Sesuai Standar Target"

  return { status, detailIssue }
}

async function run() {
  console.log("Generating Lamp Simulation CSV...")

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
    "Status Standar",
    "Keterangan Diagnosa",
  ]

  const rows: string[] = [headers.join(",")]

  const minDim = 5.0
  const maxDim = 25.0
  const step = 0.1

  let count = 0

  for (let l = minDim; l <= maxDim + 0.001; l = Math.round((l + step) * 10) / 10) {
    for (let p = minDim; p <= maxDim + 0.001; p = Math.round((p + step) * 10) / 10) {
      const area = Math.round(l * p * 100) / 100
      const sim = calcSimetris(l, p, area)

      const totalWatt = Math.round(sim.total * LAMP_WATT * 100) / 100
      const minWatt = Math.round(sim.minLamps * LAMP_WATT * 100) / 100
      const maxWatt = Math.round(sim.maxLamps * LAMP_WATT * 100) / 100

      const { status, detailIssue } = evaluateStatus(
        sim.rasio,
        sim.jarakSamping,
        sim.jarakPerbaris,
        sim.total,
        sim.minLamps,
        sim.maxLamps
      )

      // Format CSV line (quotes for detailIssue to avoid comma break)
      const row = [
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
        status,
        `"${detailIssue}"`,
      ]

      rows.push(row.join(","))
      count++
    }
  }

  const outputPath = path.join(process.cwd(), "Simulasi_Kalkulator_Lampu.csv")
  fs.writeFileSync(outputPath, rows.join("\n"), "utf-8")

  console.log(`Generated ${count} rows successfully at ${outputPath}`)
}

run().catch((err) => {
  console.error("Error generating simulation:", err)
})
