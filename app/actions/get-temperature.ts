"use server"

import dns from "node:dns"
// Memaksa Node.js untuk menggunakan IPv4 terlebih dahulu saat melakukan fetch.
// Ini adalah solusi umum untuk mengatasi error "fetch failed" (IPv6 timeout) di Docker/VPS.
dns.setDefaultResultOrder("ipv4first")

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
    url.searchParams.append("hourly", "temperature_2m")
    url.searchParams.append("timezone", "Asia/Jakarta")

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
    // UBAH PERINGKAT SUHU TERBESAR YANG INGIN DIAMBIL DI SINI:
    // =========================================================================
    // Indeks array dimulai dari 0 (0-indexed).
    // - indeks 0  = data terbesar ke-1 (suhu tertinggi absolut)
    // - indeks 87 = data terbesar ke-88 (sesuai permintaan saat ini)
    // Silakan ubah angka di bawah ini untuk mengambil urutan terbesar lainnya:
    const RANK_INDEX = 174

    const maxTemp =
      suhuTerurut[RANK_INDEX] !== undefined
        ? suhuTerurut[RANK_INDEX]
        : suhuTerurut[0]

    return { maxTemp }
  } catch (error) {
    console.error("Gagal mendapatkan suhu:", error)
    return {
      error: {
        type: "network",
        message: `Gagal mengambil data suhu lokasi. Pastikan koordinat valid dan koneksi stabil.(Detail: ${error instanceof Error ? error.message : String(error)})`,
      },
    }
  }
}
