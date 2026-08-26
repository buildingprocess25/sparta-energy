"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export type SaveAcEstimationPayload = {
  storeCode: string
  storeName: string
  branch: string
  salesArea: number
  maxTemp: number
  clusterBtu: number
  totalBtu: number
  recommendedUnits: number
  latitude?: number | null
  longitude?: number | null
  notes?: string
}

export type SaveAcEstimationResult =
  | { success: true; message: string; updatedRange?: string }
  | { success: false; error: string }

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Environment variable ${name} belum diatur di server.`)
  return value
}

async function fetchAccessToken(): Promise<string> {
  const clientId = requiredEnv("GOOGLE_CLIENT_ID")
  const clientSecret = requiredEnv("GOOGLE_CLIENT_SECRET")
  const refreshToken = requiredEnv("GOOGLE_REFRESH_TOKEN")

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[fetchAccessToken] OAuth error:", errorText)
    throw new Error(`Gagal mengautentikasi ke Google OAuth (${response.status})`)
  }

  const payload = (await response.json()) as { access_token?: string }
  if (!payload.access_token) {
    throw new Error("Respon Google OAuth tidak mengembalikan access token yang valid.")
  }

  return payload.access_token
}

export async function saveAcEstimationLog(
  payload: SaveAcEstimationPayload
): Promise<SaveAcEstimationResult> {
  try {
    const spreadsheetId = process.env.GOOGLE_AC_LOG_SPREADSHEET_ID?.trim()
    if (!spreadsheetId) {
      return {
        success: false,
        error:
          "GOOGLE_AC_LOG_SPREADSHEET_ID belum dikonfigurasi di file .env server.",
      }
    }

    // 1. Ambil info user yang sedang login (jika ada)
    let userIdentifier = "Tamu / Belum Login"
    try {
      const session = await auth.api.getSession({ headers: await headers() })
      if (session?.user) {
        userIdentifier = session.user.email || session.user.name || session.user.id
      }
    } catch {
      // Fallback jika tanpa session
    }

    // 2. Format Waktu WIB (Asia/Jakarta)
    const now = new Date()
    const formatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    const formattedTimestamp = formatter.format(now).replace(/\./g, ":")

    // 3. Format Koordinat
    const coordinatesStr =
      payload.latitude !== undefined &&
      payload.latitude !== null &&
      payload.longitude !== undefined &&
      payload.longitude !== null
        ? `${payload.latitude}, ${payload.longitude}`
        : "-"

    // 4. Baris Data Sesuai Header Google Sheet
    // Kolom: Timestamp, Email/User, Kode Toko, Nama Toko, Cabang, Luas Sales, Suhu Max, Cluster BTU, Total BTU, Rekomendasi Unit, Koordinat, Catatan
    const rowValues = [
      formattedTimestamp,
      userIdentifier,
      payload.storeCode || "-",
      payload.storeName || "-",
      payload.branch || "-",
      payload.salesArea,
      payload.maxTemp,
      payload.clusterBtu,
      payload.totalBtu,
      payload.recommendedUnits,
      coordinatesStr,
      payload.notes || "Validasi Kalkulator AC",
    ]

    // 5. Dapatkan Token & Kirim ke Google Sheets Append API
    const accessToken = await fetchAccessToken()
    const targetRange = encodeURIComponent("RAW_LOGS!A:L")
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${targetRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

    const sheetResponse = await fetch(appendUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    })

    if (!sheetResponse.ok) {
      const errorJson = await sheetResponse.json().catch(() => null)
      console.error("[saveAcEstimationLog] Sheets API Error:", errorJson)
      return {
        success: false,
        error:
          errorJson?.error?.message ||
          `Google Sheets API merespons dengan status error (${sheetResponse.status}).`,
      }
    }

    const resData = (await sheetResponse.json()) as {
      updates?: { updatedRange?: string }
    }

    return {
      success: true,
      message: "Hasil estimasi AC berhasil divalidasi dan dicatat ke Google Sheets.",
      updatedRange: resData.updates?.updatedRange,
    }
  } catch (error) {
    console.error("[saveAcEstimationLog] Exception:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan internal saat menyimpan log ke Google Sheets.",
    }
  }
}
