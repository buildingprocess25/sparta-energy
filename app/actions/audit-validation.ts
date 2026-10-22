"use server"

import { revalidatePath } from "next/cache"
import type { AreaTarget, Prisma } from "@prisma/client"

import { getAuditValidator } from "@/lib/audit-validation-access"
import {
  calculateItemDailyKwh,
  summarizeAuditItems,
} from "@/lib/audit-recalculate"
import { prisma } from "@/lib/prisma"

type ActionResult = {
  success: boolean
  message: string
}

type ItemFields = {
  qty: number
  operationalHours: number
  baseKw: number
  brandName: string
  usageCount?: number | null
}

export type AddAuditItemInput = ItemFields & {
  auditId: string
  areaTarget: AreaTarget
  equipmentTypeId: string | null
  customName: string
}

export type UpdateAuditItemInput = ItemFields & {
  itemId: string
}

const areaTargets: AreaTarget[] = ["PARKING", "TERRACE", "SALES", "WAREHOUSE"]

class ValidationError extends Error {}

function checkItemFields(fields: ItemFields) {
  if (!Number.isInteger(fields.qty) || fields.qty < 1 || fields.qty > 999) {
    throw new ValidationError("Jumlah harus angka bulat 1 sampai 999.")
  }
  if (!(fields.operationalHours > 0) || fields.operationalHours > 24) {
    throw new ValidationError("Jam operasional harus di antara 0 dan 24 jam.")
  }
  if (!(fields.baseKw > 0) || fields.baseKw > 100) {
    throw new ValidationError("Daya harus lebih dari 0 dan paling besar 100 kW.")
  }
  const usage = fields.usageCount
  if (usage != null && (!Number.isInteger(usage) || usage < 0)) {
    throw new ValidationError("Jumlah pemakaian harus angka bulat 0 atau lebih.")
  }
}

async function getEditableAudit(tx: Prisma.TransactionClient, auditId: string) {
  const audit = await tx.audit.findUnique({
    where: { id: auditId },
    select: {
      id: true,
      status: true,
      validationStatus: true,
      avgActualPlnKwhPerMonth: true,
    },
  })

  if (!audit || audit.status !== "COMPLETED") {
    throw new ValidationError("Audit tidak ditemukan.")
  }
  if (audit.validationStatus === "VALIDATED") {
    throw new ValidationError("Audit ini sudah divalidasi dan tidak bisa diubah.")
  }
  return audit
}

// isBoros stays as submitted; only the next audit can change a store's status.
async function recalculateAuditTotals(
  tx: Prisma.TransactionClient,
  auditId: string,
  avgActualPlnKwhPerMonth: number
) {
  const items = await tx.auditItem.findMany({
    where: { auditId },
    select: { estimatedDailyKwh: true },
  })
  const summary = summarizeAuditItems(
    items.map((item) => Number(item.estimatedDailyKwh)),
    avgActualPlnKwhPerMonth
  )

  await tx.audit.update({
    where: { id: auditId },
    data: {
      totalEstimatedKwhPerMonth: summary.totalEstimatedKwhPerMonth,
      gapPercent: summary.gapPercent,
    },
  })
}

async function findBrandStandbyKw(
  tx: Prisma.TransactionClient,
  equipmentTypeId: string | null,
  brandName: string
) {
  if (!equipmentTypeId || !brandName.trim()) return null
  return tx.equipmentBrand.findFirst({
    where: {
      equipmentTypeId,
      name: { equals: brandName.trim(), mode: "insensitive" },
    },
    select: { id: true, standbyKw: true },
  })
}

function refreshPaths(auditId: string) {
  revalidatePath("/dashboard")
  revalidatePath("/audit/validation")
  revalidatePath(`/audit/validation/${auditId}`)
}

async function runAction(
  failMessage: string,
  action: (validatorId: string) => Promise<{ auditId: string; message: string }>
): Promise<ActionResult> {
  try {
    const validator = await getAuditValidator()
    if (!validator) {
      return {
        success: false,
        message: "Anda tidak punya akses untuk memvalidasi audit.",
      }
    }

    const { auditId, message } = await action(validator.id)
    refreshPaths(auditId)
    return { success: true, message }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, message: error.message }
    }
    console.error(`[Audit Validation] ${failMessage}`, error)
    return { success: false, message: failMessage }
  }
}

export async function addAuditItem(input: AddAuditItemInput) {
  return runAction("Gagal menambah alat. Coba lagi.", async () => {
    checkItemFields(input)
    const customName = input.customName.trim()
    if (!customName) throw new ValidationError("Nama alat harus diisi.")
    if (!areaTargets.includes(input.areaTarget)) {
      throw new ValidationError("Area tidak dikenal.")
    }

    await prisma.$transaction(async (tx) => {
      const audit = await getEditableAudit(tx, input.auditId)
      const type = input.equipmentTypeId
        ? await tx.equipmentType.findUnique({
            where: { id: input.equipmentTypeId },
            select: { id: true, calcMethod: true, calcDuration: true },
          })
        : null
      const brand = await findBrandStandbyKw(
        tx,
        type?.id ?? null,
        input.brandName
      )
      const isUsageBased =
        type?.calcMethod === "TRANSACTION" || type?.calcMethod === "BATCH"

      await tx.auditItem.create({
        data: {
          auditId: audit.id,
          equipmentTypeId: type?.id ?? null,
          equipmentBrandId: brand?.id ?? null,
          areaTarget: input.areaTarget,
          customName,
          brandName: input.brandName.trim(),
          qty: input.qty,
          operationalHours: input.operationalHours,
          baseKw: input.baseKw,
          usageCount: isUsageBased ? (input.usageCount ?? 0) : null,
          estimatedDailyKwh: calculateItemDailyKwh({
            ...input,
            calcMethod: type?.calcMethod,
            calcDuration: type?.calcDuration,
            standbyKw: brand ? Number(brand.standbyKw) : null,
          }),
        },
      })

      await recalculateAuditTotals(
        tx,
        audit.id,
        Number(audit.avgActualPlnKwhPerMonth ?? 0)
      )
    })

    return { auditId: input.auditId, message: `${customName} ditambahkan.` }
  })
}

export async function updateAuditItem(input: UpdateAuditItemInput) {
  return runAction("Gagal menyimpan perubahan. Coba lagi.", async () => {
    checkItemFields(input)

    const item = await prisma.auditItem.findUnique({
      where: { id: input.itemId },
      select: {
        auditId: true,
        customName: true,
        equipmentTypeId: true,
        equipmentType: { select: { calcMethod: true, calcDuration: true } },
      },
    })
    if (!item) throw new ValidationError("Alat tidak ditemukan.")

    await prisma.$transaction(async (tx) => {
      const audit = await getEditableAudit(tx, item.auditId)
      const brand = await findBrandStandbyKw(
        tx,
        item.equipmentTypeId,
        input.brandName
      )
      const calcMethod = item.equipmentType?.calcMethod
      const isUsageBased =
        calcMethod === "TRANSACTION" || calcMethod === "BATCH"

      await tx.auditItem.update({
        where: { id: input.itemId },
        data: {
          equipmentBrandId: brand?.id ?? null,
          brandName: input.brandName.trim(),
          qty: input.qty,
          operationalHours: input.operationalHours,
          baseKw: input.baseKw,
          usageCount: isUsageBased ? (input.usageCount ?? 0) : null,
          estimatedDailyKwh: calculateItemDailyKwh({
            ...input,
            calcMethod,
            calcDuration: item.equipmentType?.calcDuration,
            standbyKw: brand ? Number(brand.standbyKw) : null,
          }),
        },
      })

      await recalculateAuditTotals(
        tx,
        audit.id,
        Number(audit.avgActualPlnKwhPerMonth ?? 0)
      )
    })

    return {
      auditId: item.auditId,
      message: `${item.customName ?? "Alat"} diperbarui.`,
    }
  })
}

export async function deleteAuditItem(itemId: string) {
  return runAction("Gagal menghapus alat. Coba lagi.", async () => {
    const item = await prisma.auditItem.findUnique({
      where: { id: itemId },
      select: { auditId: true, customName: true },
    })
    if (!item) throw new ValidationError("Alat tidak ditemukan.")

    await prisma.$transaction(async (tx) => {
      const audit = await getEditableAudit(tx, item.auditId)
      await tx.auditItem.delete({ where: { id: itemId } })
      await recalculateAuditTotals(
        tx,
        audit.id,
        Number(audit.avgActualPlnKwhPerMonth ?? 0)
      )
    })

    return {
      auditId: item.auditId,
      message: `${item.customName ?? "Alat"} dihapus dari audit.`,
    }
  })
}

export async function validateAudit(auditId: string) {
  return runAction("Gagal memvalidasi audit. Coba lagi.", async (validatorId) => {
    const storeName = await prisma.$transaction(async (tx) => {
      await getEditableAudit(tx, auditId)
      const updated = await tx.audit.update({
        where: { id: auditId },
        data: {
          validationStatus: "VALIDATED",
          validatedAt: new Date(),
          validatedById: validatorId,
        },
        select: { store: { select: { name: true } } },
      })
      return updated.store.name
    })

    return { auditId, message: `${storeName} sudah divalidasi.` }
  })
}
