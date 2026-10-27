"use server"

import { revalidatePath } from "next/cache"
import type { Prisma } from "@prisma/client"

import { getAuditValidator } from "@/lib/audit-validation-access"
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

    const source = await prisma.audit.findUnique({
      where: { id: sourceAuditId },
      select: {
        status: true,
        validationStatus: true,
        storeId: true,
        store: { select: { name: true } },
      },
    })
    if (
      !source ||
      source.status !== "COMPLETED" ||
      source.validationStatus !== "VALIDATED"
    ) {
      return {
        success: false,
        message: "Kalkulasi toko ini belum divalidasi, jadi belum bisa diperiksa.",
      }
    }

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

    revalidatePath("/dashboard")
    revalidatePath("/audit/kategori")
    revalidatePath(`/audit/kategori/${sourceAuditId}`)

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
