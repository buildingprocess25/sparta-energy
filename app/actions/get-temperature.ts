"use server"

export async function getTemperature(lat: string, lng: string) {
  try {
    const sekarang = new Date()
    const tahunLalu = new Date()
    tahunLalu.setDate(sekarang.getDate() - 365)

    const formatTanggal = (tanggal: Date) => {
      const tahun = tanggal.getFullYear()
      const bulan = String(tanggal.getMonth() + 1).padStart(2, "0")
      const hari = String(tanggal.getDate()).padStart(2, "0")
      return `${tahun}-${bulan}-${hari}`
    }

    const url = new URL("https://archive-api.open-meteo.com/v1/archive")
    url.searchParams.append("latitude", lat)
    url.searchParams.append("longitude", lng)
    url.searchParams.append("start_date", formatTanggal(tahunLalu))
    url.searchParams.append("end_date", formatTanggal(sekarang))
    url.searchParams.append("daily", "temperature_2m_max")
    url.searchParams.append("timezone", "Asia/Jakarta")

    const response = await fetch(url.toString(), { cache: "no-store" })

    if (!response.ok) {
      throw new Error(`Open-Meteo API Error: ${response.status}`)
    }

    const data = await response.json()

    const suhuMaksimalHarian: (number | null)[] =
      data.daily?.temperature_2m_max || []
    const suhuTersaring = suhuMaksimalHarian.filter(
      (suhu): suhu is number => suhu !== null
    )

    if (suhuTersaring.length === 0) {
      throw new Error("Data suhu tidak ditemukan")
    }

    // Urutkan suhu dari tertinggi ke terendah untuk menghindari anomali suhu puncak ekstrem tunggal
    const suhuTerurut = [...suhuTersaring].sort((a, b) => b - a)

    // Pilih peringkat suhu tertinggi ke-4 (indeks ke-3)
    // Jika data kurang dari 4, gunakan suhu tertinggi absolut (indeks ke-0)
    const RANK_INDEX = 3
    const maxTemp = suhuTerurut[RANK_INDEX] !== undefined ? suhuTerurut[RANK_INDEX] : suhuTerurut[0]

    return { maxTemp }
  } catch (error) {
    console.error("Gagal mendapatkan suhu:", error)
    return {
      error: {
        type: "network",
        message:
          "Gagal mengambil data suhu lokasi. Pastikan koordinat valid dan koneksi stabil.",
      },
    }
  }
}
