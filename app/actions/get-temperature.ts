export async function getTemperature(lat: string, lng: string) {
  try {
    const sekarang = new Date()
    const duaTahunLalu = new Date()
    duaTahunLalu.setDate(sekarang.getDate() - 365 * 2) // Data 2 tahun ke belakang

    const formatTanggal = (tanggal: Date) => {
      const tahun = tanggal.getFullYear()
      const bulan = String(tanggal.getMonth() + 1).padStart(2, "0")
      const hari = String(tanggal.getDate()).padStart(2, "0")
      return `${tahun}-${bulan}-${hari}`
    }

    const url = new URL("https://archive-api.open-meteo.com/v1/archive")
    url.searchParams.append("latitude", lat)
    url.searchParams.append("longitude", lng)
    url.searchParams.append("start_date", formatTanggal(duaTahunLalu))
    url.searchParams.append("end_date", formatTanggal(sekarang))
    url.searchParams.append("hourly", "temperature_2m")
    url.searchParams.append("timezone", "Asia/Jakarta")

    // Menggunakan browser fetch biasa karena dijalankan di Client-Side
    const response = await fetch(url.toString(), { cache: "no-store" })

    if (!response.ok) {
      throw new Error(`Open-Meteo API Error: ${response.status}`)
    }

    const data = await response.json()

    const suhuPerJam: (number | null)[] = data.hourly?.temperature_2m || []
    const suhuTersaring = suhuPerJam.filter(
      (suhu): suhu is number => suhu !== null
    )

    if (suhuTersaring.length === 0) {
      throw new Error("Data suhu tidak ditemukan")
    }

    // Urutkan suhu dari tertinggi ke terendah
    const suhuTerurut = [...suhuTersaring].sort((a, b) => b - a)

    // =========================================================================
    // PERSENTASE SUHU DESAIN (ASHRAE Exceedance Rate):
    // 2% = Suhu terpanas 2% diabaikan (98% waktu suhu lingkungan di bawah angka ini)
    // Hitung indeks secara otomatis berdasarkan total jam data (misal ~17.520 jam untuk 2 tahun)
    // =========================================================================
    const EXCEEDANCE_PERCENT = 2

    const targetIndex = Math.floor(
      suhuTerurut.length * (EXCEEDANCE_PERCENT / 100)
    )
    const rankIndex = Math.max(0, targetIndex - 1)

    const maxTemp =
      suhuTerurut[rankIndex] !== undefined
        ? suhuTerurut[rankIndex]
        : suhuTerurut[0]

    return {
      maxTemp,
      totalHours: suhuTerurut.length,
      exceedancePercent: EXCEEDANCE_PERCENT,
    }
  } catch (error) {
    console.error("Gagal mendapatkan suhu:", error)
    return {
      error: {
        type: "network",
        message: `Gagal mengambil data suhu lokasi. (Detail: ${error instanceof Error ? error.message : String(error)})`,
      },
    }
  }
}
