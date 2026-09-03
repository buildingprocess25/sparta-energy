"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type SaveLightEstimationPayload = {
  storeCode?: string | null
  storeName?: string | null
  branch?: string | null
  storeMode?: "existing" | "new" | "EXISTING" | "NEW"
  salesArea: number
  shapeType?: string | null
  dimensions?: string | null
  lampWatt: number
  minUnits: number
  maxUnits: number
  installedUnits: number
  targetLux?: number | null
  powerRatio?: number | null
  standardStatus?: string | null
  notes?: string
}

export type SaveLightEstimationResult =
  | { success: true; message: string; logId?: string }
  | { success: false; error: string }

export async function saveLightEstimationLog(
  payload: SaveLightEstimationPayload
): Promise<SaveLightEstimationResult> {
  try {
    let loggedInUserId: string | null = null
    let loggedInUserEmail: string | null = null

    try {
      const session = await auth.api.getSession({ headers: await headers() })
      if (session?.user) {
        loggedInUserId = session.user.id
        loggedInUserEmail = session.user.email || null
      }
    } catch {
      // Fallback
    }

    const normalizedStoreMode =
      payload.storeMode === "new" || payload.storeMode === "NEW"
        ? "NEW"
        : "EXISTING"

    const dbLog = await (prisma as any).lightCalculatorLog.create({
      data: {
        userId: loggedInUserId,
        userEmail: loggedInUserEmail,
        storeMode: normalizedStoreMode,
        storeCode: payload.storeCode || null,
        storeName: payload.storeName || null,
        branch: payload.branch || null,
        salesArea: payload.salesArea,
        shapeType: payload.shapeType || null,
        dimensions: payload.dimensions || null,
        lampWatt: payload.lampWatt,
        minUnits: payload.minUnits,
        maxUnits: payload.maxUnits,
        installedUnits: payload.installedUnits,
        targetLux: payload.targetLux ?? null,
        powerRatio: payload.powerRatio ?? null,
        standardStatus: payload.standardStatus || null,
        notes: payload.notes || "Validasi Kalkulator Lampu",
      },
    })

    return {
      success: true,
      message: "Hasil estimasi lampu berhasil dicatat.",
      logId: dbLog.id,
    }
  } catch (error) {
    console.error("[saveLightEstimationLog] Error:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mencatat log kalkulator lampu.",
    }
  }
}
