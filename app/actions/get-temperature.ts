"use server"

export async function getTemperature(lat: string, lng: string) {
  try {
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)

    if (isNaN(latNum) || isNaN(lngNum)) {
      throw new Error("Koordinat latitude atau longitude tidak valid")
    }

    // Bulatkan koordinat ke 3 desimal (~100m) untuk meningkatkan hit rate cache server
    const roundedLat = latNum.toFixed(3)
    const roundedLng = lngNum.toFixed(3)

    const sekarang = new Date()
    // Open-Meteo Archive memiliki lag data 2-5 hari, mundur 5 hari agar selalu valid di archive API
    const endDate = new Date(sekarang)
    endDate.setDate(sekarang.getDate() - 5)

    const startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - 365 * 2) // Data 2 tahun ke belakang

    const formatTanggal = (tanggal: Date) => {
      const tahun = tanggal.getFullYear()
      const bulan = String(tanggal.getMonth() + 1).padStart(2, "0")
      const hari = String(tanggal.getDate()).padStart(2, "0")
      return `${tahun}-${bulan}-${hari}`
    }

    const url = new URL("https://archive-api.open-meteo.com/v1/archive")
    url.searchParams.append("latitude", roundedLat)
    url.searchParams.append("longitude", roundedLng)
    url.searchParams.append("start_date", formatTanggal(startDate))
    url.searchParams.append("end_date", formatTanggal(endDate))
    url.searchParams.append("hourly", "temperature_2m")
    url.searchParams.append("timezone", "Asia/Jakarta")

    // Menggunakan server-side fetch dengan Next.js revalidation cache (7 hari) dan timeout 25 detik
    const response = await fetch(url.toString(), {
      next: { revalidate: 60 * 60 * 24 * 7 }, // Cache 7 hari di server
      signal: AbortSignal.timeout(25000), // Timeout 25 detik
    })

    if (!response.ok) {
      throw new Error(`Open-Meteo API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    const suhuPerJam: (number | null)[] = data.hourly?.temperature_2m || []
    const suhuTersaring = suhuPerJam.filter(
      (suhu): suhu is number => suhu !== null
    )

    if (suhuTersaring.length === 0) {
      throw new Error("Data suhu tidak ditemukan untuk lokasi ini")
    }

    // Urutkan suhu dari tertinggi ke terendah
    const suhuTerurut = [...suhuTersaring].sort((a, b) => b - a)

    // =========================================================================
    // PERSENTASE SUHU DESAIN (ASHRAE Exceedance Rate):
    // 2% = Suhu terpanas 2% diabaikan (98% waktu suhu lingkungan di bawah angka ini)
    // Hitung indeks secara otomatis berdasarkan total jam data
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

