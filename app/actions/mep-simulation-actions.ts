"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type SaveMepSimulationPayload = {
  logId?: string | null
  storeMode?: "existing" | "new" | "EXISTING" | "NEW"
  storeCode?: string | null
  storeName?: string | null
  branch?: string | null
  salesArea: number

  // Metrik AC
  maxTemp: number
  clusterBtu: number
  totalBtu: number
  recommendedUnits: number
  installedUnits: number
  outdoorNotes?: string | null

  // Metrik Lampu
  lampWatt: number
  targetLux: number
  lampCount: number
  estimatedLux?: number | null

  // Data Denah
  layoutData: Record<string, unknown>
  notes?: string | null
  isDraft?: boolean
}

export type SaveMepSimulationResult =
  | { success: true; message: string; logId: string; isUpdated: boolean }
  | { success: false; error: string }

export async function saveMepSimulationLog(
  payload: SaveMepSimulationPayload
): Promise<SaveMepSimulationResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const userId = session?.user?.id ?? null
    const userEmail = session?.user?.email ?? "anonymous@sparta.local"

    const storeMode =
      payload.storeMode?.toUpperCase() === "NEW" ? "NEW" : "EXISTING"
    const storeCode = payload.storeCode?.trim() || null
    const storeName = payload.storeName?.trim() || "Toko Tanpa Nama"
    const branch = payload.branch?.trim() || null

    // Sanitasi JSON denah agar hanya data esensial yang tersimpan
    const cleanLayoutData = {
      customPts: payload.layoutData?.customPts || [],
      customClosed: Boolean(payload.layoutData?.customClosed),
      segmentOverrides: payload.layoutData?.segmentOverrides || {},
      cashierDepths: payload.layoutData?.cashierDepths || {},
      chillerAlignments: payload.layoutData?.chillerAlignments || {},
      placedUnits: payload.layoutData?.placedUnits || [],
      pillars: payload.layoutData?.pillars || [],
      lighting: {
        lampWatt: Number(payload.lampWatt) || 16,
        targetLux: Number(payload.targetLux) || 400,
        lampLen: Number(payload.layoutData?.lampLen) || 1.2,
        lampOrient: payload.layoutData?.lampOrient || "h",
        lampSpasi: Number(payload.layoutData?.lampSpasi) || 0,
        irregDisabledLamps: Array.from(
          (payload.layoutData?.irregDisabledLamps as Iterable<string>) || []
        ),
      },
    }

    const mepModel = (prisma as any).mepSimulationLog
    if (!mepModel) {
      throw new Error("Model mepSimulationLog belum siap di Prisma Client.")
    }

    // Strategi Anti-Redundan:
    // 1. Cek berdasarkan logId aktif jika ada
    let existingLog = null
    if (payload.logId) {
      existingLog = await mepModel.findUnique({
        where: { id: payload.logId },
      })
    }

    // 2. Jika tidak ada logId, cari simulasi toko yang sama dalam 30 menit terakhir
    if (!existingLog) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
      const whereClause: any = {
        ...(userId ? { userId } : { userEmail }),
        updatedAt: { gte: thirtyMinutesAgo },
      }

      if (storeCode) {
        whereClause.storeCode = storeCode
      } else if (storeName && storeName !== "Toko Tanpa Nama") {
        whereClause.storeName = storeName
        if (branch) whereClause.branch = branch
      }

      existingLog = await mepModel.findFirst({
        where: whereClause,
        orderBy: { updatedAt: "desc" },
      })
    }

    if (existingLog) {
      // Perbarui log yang sudah ada agar tidak membuat baris duplikat berlebih
      const updated = await mepModel.update({
        where: { id: existingLog.id },
        data: {
          storeName,
          branch,
          salesArea: payload.salesArea,
          maxTemp: payload.maxTemp,
          clusterBtu: payload.clusterBtu,
          totalBtu: payload.totalBtu,
          recommendedUnits: payload.recommendedUnits,
          installedUnits: payload.installedUnits,
          outdoorNotes: payload.outdoorNotes?.trim() || null,
          lampWatt: payload.lampWatt,
          targetLux: payload.targetLux,
          lampCount: payload.lampCount,
          estimatedLux: payload.estimatedLux ?? null,
          layoutData: cleanLayoutData,
          notes: payload.notes?.trim() || existingLog.notes,
          isDraft: payload.isDraft !== undefined ? payload.isDraft : existingLog.isDraft,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: "Simulasi berhasil diperbarui.",
        logId: updated.id,
        isUpdated: true,
      }
    }

    // Buat data log baru
    const created = await mepModel.create({
      data: {
        userId,
        userEmail,
        storeMode,
        storeCode,
        storeName,
        branch,
        salesArea: payload.salesArea,
        maxTemp: payload.maxTemp,
        clusterBtu: payload.clusterBtu,
        totalBtu: payload.totalBtu,
        recommendedUnits: payload.recommendedUnits,
        installedUnits: payload.installedUnits,
        outdoorNotes: payload.outdoorNotes?.trim() || null,
        lampWatt: payload.lampWatt,
        targetLux: payload.targetLux,
        lampCount: payload.lampCount,
        estimatedLux: payload.estimatedLux ?? null,
        layoutData: cleanLayoutData,
        notes: payload.notes?.trim() || null,
        isDraft: Boolean(payload.isDraft),
      },
    })

    return {
      success: true,
      message: "Simulasi berhasil disimpan ke riwayat.",
      logId: created.id,
      isUpdated: false,
    }
  } catch (error) {
    console.error("[saveMepSimulationLog] Error:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan pada server",
    }
  }
}

export type MepSimulationListFilter = {
  q?: string
  branch?: string
  storeCode?: string
  page?: number
  pageSize?: number
}

// Mengambil list riwayat simulasi dengan LAZY LOAD (layoutData dikecualikan untuk menghemat bandwidth & query DB)
// 100% Terisolasi per akun: hanya memuat draft/rancangan milik pengguna yang sedang login
export async function getMepSimulationList(filters: MepSimulationListFilter = {}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const userId = session?.user?.id ?? null
    const userEmail = session?.user?.email ?? null

    // Jika pengguna belum login sama sekali, kembalikan daftar kosong demi privasi data
    if (!userId && !userEmail) {
      return { logs: [], total: 0, totalPages: 0 }
    }

    const page = Math.max(1, filters.page || 1)
    const pageSize = Math.min(100, Math.max(1, filters.pageSize || 20))
    const skip = (page - 1) * pageSize

    const mepModel = (prisma as any).mepSimulationLog
    if (!mepModel) {
      return { logs: [], total: 0, totalPages: 0 }
    }

    // Filter isolasi kepemilikan akun aktif & hanya rancangan yang disimpan sengaja (isDraft: true)
    const userOwnershipCondition: any = []
    if (userId) userOwnershipCondition.push({ userId })
    if (userEmail) userOwnershipCondition.push({ userEmail })

    const where: any = {
      isDraft: true,
      OR: userOwnershipCondition,
    }

    if (filters.branch && filters.branch !== "all") {
      where.branch = { equals: filters.branch, mode: "insensitive" }
    }

    if (filters.storeCode) {
      where.storeCode = { equals: filters.storeCode, mode: "insensitive" }
    }

    if (filters.q) {
      const q = filters.q.trim()
      where.AND = [
        {
          OR: [
            { storeCode: { contains: q, mode: "insensitive" } },
            { storeName: { contains: q, mode: "insensitive" } },
            { branch: { contains: q, mode: "insensitive" } },
          ],
        },
      ]
    }

    const [logs, total] = await Promise.all([
      mepModel.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          userId: true,
          userEmail: true,
          storeMode: true,
          storeCode: true,
          storeName: true,
          branch: true,
          salesArea: true,
          maxTemp: true,
          clusterBtu: true,
          totalBtu: true,
          recommendedUnits: true,
          installedUnits: true,
          lampWatt: true,
          targetLux: true,
          lampCount: true,
          estimatedLux: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      mepModel.count({ where }),
    ])

    return {
      logs: logs.map((log: any) => ({
        ...log,
        salesArea: Number(log.salesArea),
        maxTemp: Number(log.maxTemp),
        lampWatt: Number(log.lampWatt),
      })),
      total,
      totalPages: Math.ceil(total / pageSize),
    }
  } catch (error) {
    console.error("[getMepSimulationList] Error:", error)
    return { logs: [], total: 0, totalPages: 0 }
  }
}

// Mengambil 1 data simulasi lengkap beserta JSON denahnya
export async function getMepSimulationDetail(id: string) {
  try {
    const mepModel = (prisma as any).mepSimulationLog
    if (!mepModel) return null

    const log = await mepModel.findUnique({
      where: { id },
    })

    if (!log) return null

    return {
      ...log,
      salesArea: Number(log.salesArea),
      maxTemp: Number(log.maxTemp),
      lampWatt: Number(log.lampWatt),
    }
  } catch (error) {
    console.error("[getMepSimulationDetail] Error:", error)
    return null
  }
}

// Mengecek apakah toko yang dipilih memiliki rancangan tersimpan terakhir
export async function getLatestStoreMepSimulation(storeCode: string) {
  try {
    if (!storeCode?.trim()) return null

    const mepModel = (prisma as any).mepSimulationLog
    if (!mepModel) return null

    const latest = await mepModel.findFirst({
      where: {
        storeCode: { equals: storeCode.trim(), mode: "insensitive" },
      },
      orderBy: { updatedAt: "desc" },
    })

    if (!latest) return null

    return {
      ...latest,
      salesArea: Number(latest.salesArea),
      maxTemp: Number(latest.maxTemp),
      lampWatt: Number(latest.lampWatt),
    }
  } catch (error) {
    console.error("[getLatestStoreMepSimulation] Error:", error)
    return null
  }
}

// Menghapus rancangan simulasi denah MEP berdasarkan ID (Terisolasi per akun atau Admin)
export async function deleteMepSimulationLog(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id?.trim()) {
      return { success: false, error: "ID rancangan tidak valid" }
    }

    const session = await auth.api.getSession({ headers: await headers() })
    const userId = session?.user?.id ?? null
    const userEmail = session?.user?.email ?? null

    const mepModel = (prisma as any).mepSimulationLog
    if (!mepModel) {
      return { success: false, error: "Model database belum tersedia" }
    }

    const existing = await mepModel.findUnique({
      where: { id },
      select: { id: true, userId: true, userEmail: true },
    })

    if (!existing) {
      return { success: false, error: "Rancangan tidak ditemukan" }
    }

    // Cek apakah user yang login adalah pemilik rancangan atau akun Admin
    const isOwner = (userId && existing.userId === userId) || (userEmail && existing.userEmail === userEmail)
    const isAdmin = (session?.user as any)?.role === "ADMIN"

    if (!isOwner && !isAdmin) {
      return { success: false, error: "Anda tidak memiliki izin untuk menghapus rancangan ini" }
    }

    await mepModel.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    console.error("[deleteMepSimulationLog] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus rancangan",
    }
  }
}
