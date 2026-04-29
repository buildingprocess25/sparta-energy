/**
 * Script: Ambil data suhu harian 1 tahun dari Open-Meteo (Historical Weather API)
 *
 *
 * Cara jalankan:
 *   npx tsx scripts/get-temperature.ts
 *   -- atau --
 *   node --experimental-strip-types scripts/get-temperature.ts   (Node 22+)
 */

const LAT = -6.156278283248071
const LON = 106.84103266427428

const START_DATE = `2024-04-28`
const END_DATE = `2025-04-28`

const url = new URL("https://archive-api.open-meteo.com/v1/archive")
url.searchParams.set("latitude", String(LAT))
url.searchParams.set("longitude", String(LON))
url.searchParams.set("start_date", START_DATE)
url.searchParams.set("end_date", END_DATE)
url.searchParams.set(
  "daily",
  [
    "temperature_2m_max",
    "temperature_2m_min",
    "temperature_2m_mean",
    "apparent_temperature_max",
    "apparent_temperature_min",
  ].join(",")
)
url.searchParams.set("timezone", "Asia/Jakarta")

console.log(`\nFetching data from:\n${url.toString()}\n`)

async function main() {
  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  }

  const data = (await res.json()) as {
    daily: {
      time: string[]
      temperature_2m_max: (number | null)[]
      temperature_2m_min: (number | null)[]
      temperature_2m_mean: (number | null)[]
      apparent_temperature_max: (number | null)[]
      apparent_temperature_min: (number | null)[]
    }
  }

  const { daily } = data
  const rows = daily.time.map((date, i) => ({
    date,
    tempMax: daily.temperature_2m_max[i],
    tempMin: daily.temperature_2m_min[i],
    tempMean: daily.temperature_2m_mean[i],
    feelsLikeMax: daily.apparent_temperature_max[i],
    feelsLikeMin: daily.apparent_temperature_min[i],
  }))

  // ── Print sebagai tabel di terminal ──────────────────────────────────────────
  console.log("Date       | Max°C | Min°C | Mean°C | FeelsMax | FeelsMin")
  console.log("-".repeat(63))
  rows.forEach((r) => {
    console.log(
      `${r.date} | ${fmt(r.tempMax).padStart(5)} | ${fmt(r.tempMin).padStart(5)} | ${fmt(r.tempMean).padStart(6)} | ${fmt(r.feelsLikeMax).padStart(8)} | ${fmt(r.feelsLikeMin)}`
    )
  })

  // ── Statistik ringkas ─────────────────────────────────────────────────────────
  const means = rows
    .map((r) => r.tempMean)
    .filter((v): v is number => v !== null)
  const avg = means.reduce((a, b) => a + b, 0) / means.length
  const max = Math.max(...rows.map((r) => r.tempMax ?? -Infinity))
  const min = Math.min(...rows.map((r) => r.tempMin ?? Infinity))

  console.log(
    "\n── Ringkasan ──────────────────────────────────────────────────"
  )
  console.log(`Koordinat  : ${LAT}, ${LON}`)
  console.log(`Periode    : ${START_DATE} s/d ${END_DATE}`)
  console.log(`Suhu Max   : ${max}°C`)
  console.log(`Suhu Min   : ${min}°C`)
  console.log(`Rata-rata  : ${avg.toFixed(2)}°C`)
  console.log(`Total hari : ${rows.length}`)

  // ── Export ke CSV ─────────────────────────────────────────────────────────────
  const fs = await import("fs/promises")
  const path = await import("path")

  const csvLines = [
    "date,temp_max,temp_min,temp_mean,feels_like_max,feels_like_min",
    ...rows.map(
      (r) =>
        `${r.date},${r.tempMax ?? ""},${r.tempMin ?? ""},${r.tempMean ?? ""},${r.feelsLikeMax ?? ""},${r.feelsLikeMin ?? ""}`
    ),
  ]

  const outPath = path.resolve("scripts", `temperature_${LAT}_${LON}.csv`)
  await fs.writeFile(outPath, csvLines.join("\n"), "utf-8")
  console.log(`\nCSV tersimpan di: ${outPath}`)
}

function fmt(v: number | null | undefined): string {
  return v !== null && v !== undefined ? v.toFixed(1) : "N/A"
}

main().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
