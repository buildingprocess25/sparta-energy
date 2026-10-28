"use server"

import { revalidatePath } from "next/cache"
import { isRedirectError } from "next/dist/client/components/redirect-error"

import { requireUserManager } from "@/lib/admin-auth"
import {
  getMonitoringDevices,
  type MonitoringDevice,
} from "@/lib/monitoring-devices"
import { prisma } from "@/lib/prisma"

const MAX_DEVICES_PER_USER = 2000
const DEVICE_ID_PATTERN = /^[\w.:-]{1,64}$/

type LoadResult =
  | {
      success: true
      assignedIds: string[]
      devices: MonitoringDevice[] | null
      devicesMessage: string | null
    }
  | { success: false; message: string }

type SaveResult = { success: boolean; message: string }

// Prisma P2021: the user_device_access migration has not run on this database yet.
function isMissingTable(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2021"
  )
}

const missingTableMessage =
  "Tabel izin alat belum ada di database. Jalankan npx prisma migrate deploy dulu."

async function findGsUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, fullName: true, email: true },
  })
  if (!user) return { ok: false, message: "User tidak ditemukan." } as const
  if (user.role !== "GS") {
    return {
      ok: false,
      message: "Alat hanya bisa di-assign ke user dengan role GS.",
    } as const
  }
  return { ok: true, user } as const
}

export async function getUserDeviceAccess(userId: string): Promise<LoadResult> {
  try {
    await requireUserManager()
    const found = await findGsUser(userId)
    if (!found.ok) return { success: false, message: found.message }

    const [rows, deviceList] = await Promise.all([
      prisma.userDeviceAccess.findMany({
        where: { userId },
        select: { deviceId: true },
      }),
      getMonitoringDevices(),
    ])

    return {
      success: true,
      assignedIds: rows.map((row) => row.deviceId),
      devices: deviceList.available ? deviceList.devices : null,
      devicesMessage: deviceList.available ? null : deviceList.message,
    }
  } catch (error) {
    if (isRedirectError(error)) throw error
    if (isMissingTable(error))
      return { success: false, message: missingTableMessage }
    console.error("Failed to load device access:", error)
    return {
      success: false,
      message: "Akses alat tidak bisa dimuat. Coba lagi.",
    }
  }
}

export async function saveUserDeviceAccess(
  userId: string,
  deviceIds: string[]
): Promise<SaveResult> {
  try {
    const manager = await requireUserManager()
    const found = await findGsUser(userId)
    if (!found.ok) return { success: false, message: found.message }

    const ids = Array.from(new Set(deviceIds.map((id) => id.trim())))
    if (ids.length > MAX_DEVICES_PER_USER) {
      return {
        success: false,
        message: `Paling banyak ${MAX_DEVICES_PER_USER} alat per user.`,
      }
    }
    if (ids.some((id) => !DEVICE_ID_PATTERN.test(id))) {
      return { success: false, message: "Ada ID alat yang tidak valid." }
    }

    await prisma.$transaction([
      prisma.userDeviceAccess.deleteMany({
        where: { userId, deviceId: { notIn: ids } },
      }),
      prisma.userDeviceAccess.createMany({
        data: ids.map((deviceId) => ({
          userId,
          deviceId,
          createdBy: manager.id,
        })),
        skipDuplicates: true,
      }),
    ])

    revalidatePath("/admin/users")
    const name = found.user.fullName || found.user.email
    return {
      success: true,
      message:
        ids.length === 0
          ? `Semua akses alat ${name} dicabut.`
          : `Akses alat ${name} disimpan: ${ids.length} alat.`,
    }
  } catch (error) {
    if (isRedirectError(error)) throw error
    if (isMissingTable(error))
      return { success: false, message: missingTableMessage }
    console.error("Failed to save device access:", error)
    return { success: false, message: "Akses alat gagal disimpan. Coba lagi." }
  }
}
