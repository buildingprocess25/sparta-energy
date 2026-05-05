"use server"

export async function getRabData(ulok: string) {
  try {
    const baseUrl = process.env.RAB_API_URL
    if (!baseUrl) {
      return { error: "Konfigurasi RAB_API_URL belum tersedia di server." }
    }

    // 1. Fetch list RAB based on ULOK and status "Disetujui"
    const listRes = await fetch(
      `${baseUrl}/api/rab?nomor_ulok=${encodeURIComponent(ulok)}&status=Disetujui`,
      { cache: "no-store" }
    )

    if (!listRes.ok) {
      return { error: "Gagal memuat data dari server RAB." }
    }

    const listData = await listRes.json()

    if (!listData.data || listData.data.length === 0) {
      return {
        error:
          "RAB dengan Nomor ULOK ini tidak ditemukan atau belum berstatus Disetujui.",
      }
    }

    // Ambil RAB yang pertama (jika ada lebih dari 1 yang aktif, ambil yang paling atas)
    const rabId = listData.data[0].id

    // 2. Fetch detail RAB to get luas_area_sales
    const detailRes = await fetch(`${baseUrl}/api/rab/${rabId}`, {
      cache: "no-store",
    })

    if (!detailRes.ok) {
      return { error: "Gagal memuat detail RAB." }
    }

    const detailData = await detailRes.json()

    const toko = detailData.data.toko
    const rab = detailData.data.rab

    // Parse string to number (handle cases like "120 m2" or "120,5")
    let parsedLuas: number | undefined = undefined
    if (rab.luas_area_sales) {
      const strVal = String(rab.luas_area_sales).replace(/,/g, ".")
      const match = strVal.match(/[\d.]+/)
      if (match) {
        parsedLuas = Number(match[0])
      }
    }

    return {
      success: true,
      data: {
        nomor_ulok: toko.nomor_ulok,
        nama_toko: toko.nama_toko,
        cabang: toko.cabang,
        luas_area_sales: parsedLuas,
        raw_luas_area_sales: rab.luas_area_sales, // for debugging
      },
    }
  } catch (error) {
    console.error("[getRabData] Error:", error)
    return { error: "Terjadi kesalahan pada sistem saat menghubungi server RAB." }
  }
}
