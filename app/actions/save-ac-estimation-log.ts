"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type SaveAcEstimationPayload = {
  storeCode?: string | null
  storeName?: string | null
  branch?: string | null
  storeMode?: "existing" | "new" | "EXISTING" | "NEW"
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
  | { success: true; message: string; updatedRange?: string; logId?: string }
  | { success: false; error: string }

function getEnvOptional(name: string): string | undefined {
  return process.env[name]?.trim()
}

async function fetchAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim()

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google OAuth credentials are not fully configured in environment.")
  }

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
    // 1. Ambil info user yang sedang login (jika ada)
    let userIdentifier = "Tamu / Belum Login"
    let loggedInUserId: string | null = null
    let loggedInUserEmail: string | null = null

    try {
      const session = await auth.api.getSession({ headers: await headers() })
      if (session?.user) {
        loggedInUserId = session.user.id
        loggedInUserEmail = session.user.email || null
        userIdentifier = session.user.email || session.user.name || session.user.id
      }
    } catch {
      // Fallback jika tanpa session
    }

    const normalizedStoreMode =
      payload.storeMode === "new" || payload.storeMode === "NEW"
        ? "NEW"
        : "EXISTING"

    // 2. Simpan ke Database (PostgreSQL via Prisma)
    let savedLogId: string | undefined
    try {
      const dbLog = await (prisma as any).acCalculatorLog.create({
        data: {
          userId: loggedInUserId,
          userEmail: loggedInUserEmail,
          storeMode: normalizedStoreMode,
          storeCode: payload.storeCode || null,
          storeName: payload.storeName || null,
          branch: payload.branch || null,
          salesArea: payload.salesArea,
          maxTemp: payload.maxTemp,
          clusterBtu: payload.clusterBtu,
          totalBtu: payload.totalBtu,
          recommendedUnits: payload.recommendedUnits,
          latitude: payload.latitude ?? null,
          longitude: payload.longitude ?? null,
          notes: payload.notes || "Validasi Kalkulator AC",
        },
      })
      savedLogId = dbLog.id
    } catch (dbErr) {
      console.warn("[saveAcEstimationLog] DB Save warning:", dbErr)
    }

    // 3. Simpan ke Google Sheets (Background / Silent) jika dikonfigurasi
    const spreadsheetId = getEnvOptional("GOOGLE_AC_LOG_SPREADSHEET_ID")
    let updatedRange: string | undefined

    if (spreadsheetId) {
      try {
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

        const coordinatesStr =
          payload.latitude !== undefined &&
          payload.latitude !== null &&
          payload.longitude !== undefined &&
          payload.longitude !== null
            ? `${payload.latitude}, ${payload.longitude}`
            : "-"

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

        if (sheetResponse.ok) {
          const resData = (await sheetResponse.json()) as {
            updates?: { updatedRange?: string }
          }
          updatedRange = resData.updates?.updatedRange
        } else {
          const errorJson = await sheetResponse.json().catch(() => null)
          console.warn("[saveAcEstimationLog] Sheets API Error:", errorJson)
        }
      } catch (sheetsErr) {
        console.warn("[saveAcEstimationLog] Sheets Append warning:", sheetsErr)
      }
    }

    return {
      success: true,
      message: "Hasil estimasi AC berhasil dicatat.",
      updatedRange,
      logId: savedLogId,
    }
  } catch (error) {
    console.error("[saveAcEstimationLog] Exception:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan internal saat menyimpan log.",
    }
  }
}
