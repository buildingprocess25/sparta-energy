"use server"

import { revalidatePath } from "next/cache"
import type { Prisma } from "@prisma/client"

import { getTemperature } from "@/app/actions/get-temperature"
import { getAuditValidator } from "@/lib/audit-validation-access"
import {
  createAcStandard,
  getHvacCompletionIssues,
  sanitizeHvacAuditData,
  summarizeHvacAudit,
  toAcSummaryStatus,
  type AcStandard,
} from "@/lib/hvac-audit"
import {
  getCompletionIssues,
  sanitizeLightingAuditData,
  summarizeLightingAudit,
} from "@/lib/lighting-audit"
import { prisma } from "@/lib/prisma"

type SaveResult = {
  success: boolean
  message: string
  issues?: string[]
}

const NOT_VALIDATED_MESSAGE =
  "Kalkulasi toko ini belum divalidasi, jadi belum bisa diperiksa."

// Energy audits only run on a completed kalkulasi that a validator already checked.
async function getAuditableSource(sourceAuditId: string) {
  const source = await prisma.audit.findUnique({
    where: { id: sourceAuditId },
    select: {
      status: true,
      validationStatus: true,
      storeId: true,
      store: { select: { name: true } },
    },
  })
  if (!source || source.status !== "COMPLETED" || source.validationStatus !== "VALIDATED") {
    return null
  }
  return source
}

function revalidateEnergyAudit(sourceAuditId: string) {
  revalidatePath("/dashboard")
  revalidatePath("/audit/kategori")
  revalidatePath(`/audit/kategori/${sourceAuditId}`)
}

export async function saveLightingAudit(
  sourceAuditId: string,
  rawData: unknown,
  complete: boolean
): Promise<SaveResult> {
  try {
    const validator = await getAuditValidator()
    if (!validator) {
      return { success: false, message: "Anda tidak punya akses untuk pemeriksaan ini." }
    }

    const source = await getAuditableSource(sourceAuditId)
    if (!source) return { success: false, message: NOT_VALIDATED_MESSAGE }

    const data = sanitizeLightingAuditData(rawData)
    if (complete) {
      const issues = getCompletionIssues(data)
      if (issues.length > 0) {
        return {
          success: false,
          message: "Pemeriksaan belum lengkap. Lengkapi data berikut dulu.",
          issues,
        }
      }
    }

    const summary = summarizeLightingAudit(data)
    const jsonData = data as unknown as Prisma.InputJsonValue

    await prisma.$transaction(async (tx) => {
      const existing = await tx.energyAudit.findUnique({
        where: {
          sourceAuditId_category: { sourceAuditId, category: "TATA_CAHAYA" },
        },
        select: { status: true },
      })
      const status = complete ? "COMPLETED" : (existing?.status ?? "DRAFT")

      await tx.energyAudit.upsert({
        where: {
          sourceAuditId_category: { sourceAuditId, category: "TATA_CAHAYA" },
        },
        create: {
          storeId: source.storeId,
          sourceAuditId,
          category: "TATA_CAHAYA",
          status,
          auditorId: validator.id,
          summaryStatus: summary.buildingStatus,
          data: jsonData,
          completedAt: complete ? new Date() : null,
        },
        update: {
          status,
          auditorId: validator.id,
          summaryStatus: summary.buildingStatus,
          data: jsonData,
          ...(complete ? { completedAt: new Date() } : {}),
        },
      })

      if (data.address) {
        await tx.store.update({
          where: { id: source.storeId },
          data: { address: data.address },
        })
      }
    })

    revalidateEnergyAudit(sourceAuditId)

    return {
      success: true,
      message: complete
        ? `Pemeriksaan tata cahaya ${source.store.name} selesai.`
        : "Draf pemeriksaan tersimpan.",
    }
  } catch (error) {
    console.error("[Energy Audit] Failed to save lighting audit:", error)
    return { success: false, message: "Gagal menyimpan pemeriksaan. Coba lagi." }
  }
}

type AcStandardResult =
  | { success: true; standard: AcStandard }
  | { success: false; message: string }

export async function calculateHvacAcStandard(
  sourceAuditId: string,
  salesAreaM2: number,
  latitude: number,
  longitude: number
): Promise<AcStandardResult> {
  const validator = await getAuditValidator()
  if (!validator) {
    return { success: false, message: "Anda tidak punya akses untuk pemeriksaan ini." }
  }
  if (!(await getAuditableSource(sourceAuditId))) {
    return { success: false, message: NOT_VALIDATED_MESSAGE }
  }
  if (!(salesAreaM2 > 0)) {
    return { success: false, message: "Isi luas area sales dulu." }
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { success: false, message: "Tentukan koordinat toko dulu." }
  }

  const temperature = await getTemperature(String(latitude), String(longitude))
  if ("error" in temperature && temperature.error) {
    return { success: false, message: temperature.error.message }
  }

  return {
    success: true,
    standard: createAcStandard({
      salesAreaM2,
      latitude,
      longitude,
      maxTemp: temperature.maxTemp as number,
    }),
  }
}

export async function saveHvacAudit(
  sourceAuditId: string,
  rawData: unknown,
  complete: boolean
): Promise<SaveResult> {
  try {
    const validator = await getAuditValidator()
    if (!validator) {
      return { success: false, message: "Anda tidak punya akses untuk pemeriksaan ini." }
    }
    const source = await getAuditableSource(sourceAuditId)
    if (!source) return { success: false, message: NOT_VALIDATED_MESSAGE }

    const data = sanitizeHvacAuditData(rawData)
    if (complete) {
      const issues = getHvacCompletionIssues(data)
      if (issues.length > 0) {
        return {
          success: false,
          message: "Pemeriksaan belum lengkap. Lengkapi data berikut dulu.",
          issues,
        }
      }
    }

    const { acCount } = summarizeHvacAudit(data)
    const summaryStatus = toAcSummaryStatus(acCount.status, acCount.difference)
    const jsonData = data as unknown as Prisma.InputJsonValue
    const key = {
      sourceAuditId_category: { sourceAuditId, category: "TATA_UDARA_VENTILASI" as const },
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.energyAudit.findUnique({ where: key, select: { status: true } })
      const status = complete ? "COMPLETED" : (existing?.status ?? "DRAFT")

      await tx.energyAudit.upsert({
        where: key,
        create: {
          storeId: source.storeId,
          sourceAuditId,
          category: "TATA_UDARA_VENTILASI",
          status,
          auditorId: validator.id,
          summaryStatus,
          data: jsonData,
          completedAt: complete ? new Date() : null,
        },
        update: {
          status,
          auditorId: validator.id,
          summaryStatus,
          data: jsonData,
          ...(complete ? { completedAt: new Date() } : {}),
        },
      })

      // The pin set here is the store's location from now on, also for the AC calculator.
      if (data.latitude !== null && data.longitude !== null) {
        await tx.store.update({
          where: { id: source.storeId },
          data: { latitude: data.latitude, longitude: data.longitude },
        })
      }
    })

    revalidateEnergyAudit(sourceAuditId)

    return {
      success: true,
      message: complete
        ? `Pemeriksaan tata udara ${source.store.name} selesai.`
        : "Draf pemeriksaan tersimpan.",
    }
  } catch (error) {
    console.error("[Energy Audit] Failed to save HVAC audit:", error)
    return { success: false, message: "Gagal menyimpan pemeriksaan. Coba lagi." }
  }
}
