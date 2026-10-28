"use server"

import { revalidatePath } from "next/cache"
import type { AreaTarget, AuditCorrectionType, Prisma } from "@prisma/client"

import { areaLabels, formatKwh } from "@/components/audit-validation/format"
import { generateRecommendationWithFallback } from "@/lib/ai-recommendation"
import { getAuditValidator } from "@/lib/audit-validation-access"
import {
  averagePlnKwh,
  calculateItemDailyKwh,
  summarizeAuditItems,
} from "@/lib/audit-recalculate"
import { parseBillingMonth } from "@/lib/billing-month"
import { prisma } from "@/lib/prisma"
import { STORE_TYPES } from "@/lib/store-types"

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

export type AuditTechnicalInput = {
  storeType: string
  plnPowerVa: number
  areas: {
    sales: number
    parkir: number
    teras: number
    gudang: number
    toilet: number
    selasar: number
  }
  is24Hours: boolean
  openTime: string | null
  closeTime: string | null
}

export type PlnHistoryInput = {
  id: string
  billingMonth: string
  plnUsageKwh: number
  salesTransactionPerDay: number
}

export type ValidationDraftInput = {
  technical: AuditTechnicalInput
  address: string
  plnHistory: PlnHistoryInput[]
}

type Correction = {
  type: AuditCorrectionType
  summary: string
  before?: Prisma.InputJsonValue
  after?: Prisma.InputJsonValue
}

const areaTargets: AreaTarget[] = ["PARKING", "TERRACE", "SALES", "WAREHOUSE"]
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/
const ADDRESS_MAX_LENGTH = 300
const numberFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 3,
})

class ValidationError extends Error {}

function checkTechnical(input: AuditTechnicalInput) {
  if (!(STORE_TYPES as readonly string[]).includes(input.storeType)) {
    throw new ValidationError("Pilih tipe toko terlebih dahulu.")
  }
  if (!Number.isInteger(input.plnPowerVa) || input.plnPowerVa < 1) {
    throw new ValidationError("Daya PLN harus angka bulat lebih dari 0 VA.")
  }
  const areas = Object.values(input.areas)
  if (areas.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new ValidationError("Luas area tidak boleh kosong atau negatif.")
  }
  if (!(input.areas.sales > 0)) {
    throw new ValidationError("Luas sales area harus lebih dari 0 m².")
  }
  if (
    !input.is24Hours &&
    (!timePattern.test(input.openTime ?? "") ||
      !timePattern.test(input.closeTime ?? ""))
  ) {
    throw new ValidationError("Isi jam buka dan jam tutup toko.")
  }
}

function checkPlnHistory(rows: PlnHistoryInput[]) {
  for (const row of rows) {
    if (!parseBillingMonth(row.billingMonth)) {
      throw new ValidationError("Bulan riwayat PLN tidak valid.")
    }
    if (!Number.isFinite(row.plnUsageKwh) || row.plnUsageKwh < 0) {
      throw new ValidationError(`kWh ${row.billingMonth} tidak boleh negatif.`)
    }
    if (
      !Number.isFinite(row.salesTransactionPerDay) ||
      row.salesTransactionPerDay < 0
    ) {
      throw new ValidationError(`STD ${row.billingMonth} tidak boleh negatif.`)
    }
  }
  if (!rows.some((row) => row.plnUsageKwh > 0)) {
    throw new ValidationError("Isi kWh PLN minimal satu bulan.")
  }
}

function toTechnicalData(input: AuditTechnicalInput) {
  return {
    storeType: input.storeType,
    plnPowerVa: input.plnPowerVa,
    salesAreaM2: input.areas.sales,
    parkingAreaM2: input.areas.parkir,
    terraceAreaM2: input.areas.teras,
    warehouseAreaM2: input.areas.gudang,
    toiletAreaM2: input.areas.toilet,
    corridorAreaM2: input.areas.selasar,
    is24Hours: input.is24Hours,
    openTime: input.is24Hours ? null : input.openTime,
    closeTime: input.is24Hours ? null : input.closeTime,
  }
}

function checkItemFields(fields: ItemFields) {
  if (!Number.isInteger(fields.qty) || fields.qty < 1 || fields.qty > 999) {
    throw new ValidationError("Jumlah harus angka bulat 1 sampai 999.")
  }
  if (!(fields.operationalHours > 0) || fields.operationalHours > 24) {
    throw new ValidationError("Jam operasional harus di antara 0 dan 24 jam.")
  }
  if (!(fields.baseKw > 0) || fields.baseKw > 100) {
    throw new ValidationError(
      "Daya harus lebih dari 0 dan paling besar 100 kW."
    )
  }
  const usage = fields.usageCount
  if (usage != null && (!Number.isInteger(usage) || usage < 0)) {
    throw new ValidationError(
      "Jumlah pemakaian harus angka bulat 0 atau lebih."
    )
  }
}

function describeItem(fields: {
  qty: number
  operationalHours: number
  baseKw: number
}) {
  return `${fields.qty} unit · ${numberFormat.format(fields.operationalHours)} jam · ${numberFormat.format(fields.baseKw)} kW`
}

async function getEditableAudit(tx: Prisma.TransactionClient, auditId: string) {
  const audit = await tx.audit.findUnique({
    where: { id: auditId },
    select: {
      id: true,
      storeId: true,
      status: true,
      validationStatus: true,
    },
  })

  if (!audit || audit.status !== "COMPLETED") {
    throw new ValidationError("Kalkulasi tidak ditemukan.")
  }
  if (audit.validationStatus === "VALIDATED") {
    throw new ValidationError(
      "Kalkulasi ini sudah divalidasi dan tidak bisa diubah."
    )
  }
  return audit
}

// Keeps the store's submitted result once, before the first change that can move it.
async function keepOriginalResult(
  tx: Prisma.TransactionClient,
  auditId: string
) {
  const audit = await tx.audit.findUniqueOrThrow({
    where: { id: auditId },
    select: {
      isBoros: true,
      totalEstimatedKwhPerMonth: true,
      avgActualPlnKwhPerMonth: true,
      originalTotalEstimatedKwhPerMonth: true,
    },
  })
  if (audit.originalTotalEstimatedKwhPerMonth !== null) return

  await tx.audit.update({
    where: { id: auditId },
    data: {
      originalIsBoros: audit.isBoros,
      originalTotalEstimatedKwhPerMonth: audit.totalEstimatedKwhPerMonth ?? 0,
      originalAvgActualPlnKwhPerMonth: audit.avgActualPlnKwhPerMonth ?? 0,
    },
  })
}

async function recordCorrections(
  tx: Prisma.TransactionClient,
  auditId: string,
  validatorId: string,
  corrections: Correction[]
) {
  if (corrections.length === 0) return
  await tx.auditCorrection.createMany({
    data: corrections.map((correction) => ({
      auditId,
      validatorId,
      ...correction,
    })),
  })
}

// Status follows the corrected data: Boros when actual PLN exceeds the standard by 5%.
async function recalculateAuditTotals(
  tx: Prisma.TransactionClient,
  auditId: string
) {
  const [items, plnHistory, audit] = await Promise.all([
    tx.auditItem.findMany({
      where: { auditId },
      select: { estimatedDailyKwh: true },
    }),
    tx.auditPlnStdHistory.findMany({
      where: { auditId },
      select: { plnUsageKwh: true },
    }),
    tx.audit.findUniqueOrThrow({
      where: { id: auditId },
      select: { avgActualPlnKwhPerMonth: true },
    }),
  ])
  const avgActualPlnKwhPerMonth =
    plnHistory.length > 0
      ? averagePlnKwh(plnHistory.map((row) => Number(row.plnUsageKwh)))
      : Number(audit.avgActualPlnKwhPerMonth ?? 0)
  const summary = summarizeAuditItems(
    items.map((item) => Number(item.estimatedDailyKwh)),
    avgActualPlnKwhPerMonth
  )

  await tx.audit.update({
    where: { id: auditId },
    data: {
      avgActualPlnKwhPerMonth,
      totalEstimatedKwhPerMonth: summary.totalEstimatedKwhPerMonth,
      gapPercent: summary.gapPercent,
      isBoros: summary.isBoros,
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
        message: "Anda tidak punya akses untuk memvalidasi kalkulasi.",
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
  return runAction("Gagal menambah alat. Coba lagi.", async (validatorId) => {
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

      await keepOriginalResult(tx, audit.id)
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
      await recordCorrections(tx, audit.id, validatorId, [
        {
          type: "ITEM_ADDED",
          summary: `${customName} ditambahkan di ${areaLabels[input.areaTarget]}: ${describeItem(input)}`,
          after: {
            name: customName,
            area: input.areaTarget,
            qty: input.qty,
            operationalHours: input.operationalHours,
            baseKw: input.baseKw,
          },
        },
      ])
      await recalculateAuditTotals(tx, audit.id)
    })

    return { auditId: input.auditId, message: `${customName} ditambahkan.` }
  })
}

export async function updateAuditItem(input: UpdateAuditItemInput) {
  return runAction(
    "Gagal menyimpan perubahan. Coba lagi.",
    async (validatorId) => {
      checkItemFields(input)

      const item = await prisma.auditItem.findUnique({
        where: { id: input.itemId },
        select: {
          auditId: true,
          customName: true,
          brandName: true,
          qty: true,
          operationalHours: true,
          baseKw: true,
          equipmentTypeId: true,
          equipmentType: { select: { calcMethod: true, calcDuration: true } },
        },
      })
      if (!item) throw new ValidationError("Alat tidak ditemukan.")
      const name = item.customName ?? "Alat"

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
        const before = {
          qty: item.qty,
          operationalHours: Number(item.operationalHours),
          baseKw: Number(item.baseKw),
          brandName: item.brandName,
        }
        const after = {
          qty: input.qty,
          operationalHours: input.operationalHours,
          baseKw: input.baseKw,
          brandName: input.brandName.trim(),
        }

        await keepOriginalResult(tx, audit.id)
        await tx.auditItem.update({
          where: { id: input.itemId },
          data: {
            equipmentBrandId: brand?.id ?? null,
            brandName: after.brandName,
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
        await recordCorrections(tx, audit.id, validatorId, [
          {
            type: "ITEM_UPDATED",
            summary: `${name} diubah: ${describeItem(before)} → ${describeItem(after)}`,
            before,
            after,
          },
        ])
        await recalculateAuditTotals(tx, audit.id)
      })

      return { auditId: item.auditId, message: `${name} diperbarui.` }
    }
  )
}

export async function deleteAuditItem(itemId: string) {
  return runAction("Gagal menghapus alat. Coba lagi.", async (validatorId) => {
    const item = await prisma.auditItem.findUnique({
      where: { id: itemId },
      select: {
        auditId: true,
        customName: true,
        areaTarget: true,
        qty: true,
        operationalHours: true,
        baseKw: true,
      },
    })
    if (!item) throw new ValidationError("Alat tidak ditemukan.")
    const name = item.customName ?? "Alat"
    const before = {
      name,
      area: item.areaTarget,
      qty: item.qty,
      operationalHours: Number(item.operationalHours),
      baseKw: Number(item.baseKw),
    }

    await prisma.$transaction(async (tx) => {
      const audit = await getEditableAudit(tx, item.auditId)
      await keepOriginalResult(tx, audit.id)
      await tx.auditItem.delete({ where: { id: itemId } })
      await recordCorrections(tx, audit.id, validatorId, [
        {
          type: "ITEM_DELETED",
          summary: `${name} dihapus dari ${areaLabels[item.areaTarget]}: ${describeItem(before)}`,
          before,
        },
      ])
      await recalculateAuditTotals(tx, audit.id)
    })

    return { auditId: item.auditId, message: `${name} dihapus dari kalkulasi.` }
  })
}

// Saves technical data, the store address and PLN history in one go, logging each change.
async function applyDraft(
  tx: Prisma.TransactionClient,
  auditId: string,
  validatorId: string,
  draft: ValidationDraftInput
) {
  checkTechnical(draft.technical)
  checkPlnHistory(draft.plnHistory)
  const address = draft.address.trim()
  if (address.length > ADDRESS_MAX_LENGTH) {
    throw new ValidationError(
      `Alamat paling panjang ${ADDRESS_MAX_LENGTH} karakter.`
    )
  }

  const { storeId } = await getEditableAudit(tx, auditId)
  const [current, store, plnRows] = await Promise.all([
    tx.audit.findUniqueOrThrow({
      where: { id: auditId },
      select: {
        storeType: true,
        plnPowerVa: true,
        salesAreaM2: true,
        parkingAreaM2: true,
        terraceAreaM2: true,
        warehouseAreaM2: true,
        toiletAreaM2: true,
        corridorAreaM2: true,
        is24Hours: true,
        openTime: true,
        closeTime: true,
      },
    }),
    tx.store.findUniqueOrThrow({
      where: { id: storeId },
      select: { address: true },
    }),
    tx.auditPlnStdHistory.findMany({
      where: { auditId },
      orderBy: { monthIdx: "asc" },
      select: {
        id: true,
        billingMonth: true,
        plnUsageKwh: true,
        salesTransactionPerDay: true,
      },
    }),
  ])

  const corrections: Correction[] = []

  const technical = toTechnicalData(draft.technical)
  const technicalLabels: Record<keyof typeof technical, string> = {
    storeType: "Tipe toko",
    plnPowerVa: "Daya PLN",
    salesAreaM2: "Luas sales area",
    parkingAreaM2: "Luas parkiran",
    terraceAreaM2: "Luas teras",
    warehouseAreaM2: "Luas gudang",
    toiletAreaM2: "Luas toilet",
    corridorAreaM2: "Luas selasar",
    is24Hours: "24 jam",
    openTime: "Jam buka",
    closeTime: "Jam tutup",
  }
  const changedTechnical = (
    Object.keys(technical) as Array<keyof typeof technical>
  )
    .map((key) => {
      const raw = current[key]
      const before =
        raw === null ? null : typeof raw === "object" ? Number(raw) : raw
      return { key, before, after: technical[key] }
    })
    .filter(({ before, after }) => before !== null && before !== after)
  if (changedTechnical.length > 0) {
    corrections.push({
      type: "TECHNICAL_UPDATED",
      summary: `Teknis toko diubah: ${changedTechnical
        .map(
          ({ key, before, after }) =>
            `${technicalLabels[key]} ${before ?? "-"} → ${after ?? "-"}`
        )
        .join(", ")}`,
      before: Object.fromEntries(
        changedTechnical.map(({ key, before }) => [key, before])
      ),
      after: Object.fromEntries(
        changedTechnical.map(({ key, after }) => [key, after])
      ),
    })
  }
  await tx.audit.update({ where: { id: auditId }, data: technical })

  if (address !== (store.address ?? "")) {
    await tx.store.update({
      where: { id: storeId },
      data: { address: address || null },
    })
    corrections.push({
      type: "ADDRESS_UPDATED",
      summary: store.address ? "Alamat toko diperbarui." : "Alamat toko diisi.",
      before: { address: store.address },
      after: { address: address || null },
    })
  }

  const draftById = new Map(draft.plnHistory.map((row) => [row.id, row]))
  if (
    draftById.size !== plnRows.length ||
    plnRows.some((row) => !draftById.has(row.id))
  ) {
    throw new ValidationError(
      "Riwayat PLN tidak cocok dengan kalkulasi ini. Muat ulang halaman."
    )
  }
  const changedPln = plnRows
    .map((row) => ({ row, next: draftById.get(row.id)! }))
    .filter(
      ({ row, next }) =>
        row.billingMonth !== next.billingMonth ||
        Number(row.plnUsageKwh) !== next.plnUsageKwh ||
        Number(row.salesTransactionPerDay) !== next.salesTransactionPerDay
    )
  if (changedPln.length > 0) {
    await keepOriginalResult(tx, auditId)
    for (const { row, next } of changedPln) {
      await tx.auditPlnStdHistory.update({
        where: { id: row.id },
        data: {
          billingMonth: next.billingMonth,
          plnUsageKwh: next.plnUsageKwh,
          salesTransactionPerDay: next.salesTransactionPerDay,
        },
      })
    }
    corrections.push({
      type: "PLN_UPDATED",
      summary: `Riwayat PLN diubah: ${changedPln
        .map(
          ({ row, next }) =>
            `${next.billingMonth} ${numberFormat.format(Number(row.plnUsageKwh))} → ${numberFormat.format(next.plnUsageKwh)} kWh`
        )
        .join(", ")}`,
      before: changedPln.map(({ row }) => ({
        billingMonth: row.billingMonth,
        plnUsageKwh: Number(row.plnUsageKwh),
        salesTransactionPerDay: Number(row.salesTransactionPerDay),
      })),
      after: changedPln.map(({ next }) => ({
        billingMonth: next.billingMonth,
        plnUsageKwh: next.plnUsageKwh,
        salesTransactionPerDay: next.salesTransactionPerDay,
      })),
    })
    await recalculateAuditTotals(tx, auditId)
  }

  await recordCorrections(tx, auditId, validatorId, corrections)
  return { storeId, technical, changes: corrections.length }
}

export async function saveValidationDraft(
  auditId: string,
  draft: ValidationDraftInput
) {
  return runAction(
    "Gagal menyimpan draf validasi. Coba lagi.",
    async (validatorId) => {
      const { changes } = await prisma.$transaction((tx) =>
        applyDraft(tx, auditId, validatorId, draft)
      )
      return {
        auditId,
        message:
          changes > 0
            ? "Draf validasi disimpan."
            : "Tidak ada perubahan untuk disimpan.",
      }
    }
  )
}

const AI_TIMEOUT_MS = 10_000

const validationRecommendationRules = `Data ini sudah dikoreksi admin saat validasi dan status toko berubah. Aturan tambahan:
- Kalimat pertama menyebut aktual PLN dan standar konsumsi energi setelah validasi dalam kWh.
- Kalimat kedua menyebut penyebab status lama berdasarkan daftar koreksi. Jangan menebak di luar daftar itu.
- Kalimat ketiga berisi satu tindakan konkret untuk staf toko.
- Judul berisi tindakan, bukan pujian.
- Jangan memakai pujian kosong seperti "luar biasa" atau "kinerja terbaik". Jangan menyebut alat, angka, atau kejadian yang tidak ada di data.`

const fallbackRecommendations = {
  MAINTENANCE: {
    title: "Catat semua alat saat input kalkulasi",
    description:
      "Setelah validasi, pemakaian PLN toko masih dalam batas standar konsumsi energi. Status boros sebelumnya berasal dari data alat atau riwayat PLN yang dikoreksi admin. Cek ulang daftar alat per area sebelum mengirim kalkulasi berikutnya.",
  },
  REPAIR: {
    title: "Periksa alat dengan pemakaian terbesar",
    description:
      "Setelah validasi, pemakaian PLN toko melebihi standar konsumsi energi. Data alat yang dikoreksi admin menunjukkan kebutuhan listrik lebih kecil dari tagihan PLN. Periksa AC dan pendingin untuk kebocoran freon, kompresor lemah, atau kebocoran arus.",
  },
} as const

function matchesStatus(type: string, isBoros: boolean) {
  return isBoros ? type !== "MAINTENANCE" : type === "MAINTENANCE"
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`AI timeout after ${ms}ms`)), ms)
    ),
  ])
}

// Replaces the recommendation when it no longer fits the validated status.
// Never fails the validation: AI errors fall back to a fixed text.
async function refreshRecommendation(auditId: string, validatorId: string) {
  try {
    const audit = await prisma.audit.findUniqueOrThrow({
      where: { id: auditId },
      select: {
        isBoros: true,
        originalIsBoros: true,
        totalEstimatedKwhPerMonth: true,
        avgActualPlnKwhPerMonth: true,
        is24Hours: true,
        openTime: true,
        closeTime: true,
        plnPowerVa: true,
        store: { select: { name: true } },
        items: {
          select: {
            qty: true,
            customName: true,
            operationalHours: true,
            estimatedDailyKwh: true,
            equipmentType: { select: { name: true } },
          },
        },
        recommendations: {
          select: { type: true, title: true, description: true },
        },
        corrections: {
          where: { type: { not: "RECOMMENDATION_UPDATED" } },
          orderBy: { createdAt: "asc" },
          select: { summary: true },
        },
      },
    })
    const isBoros = audit.isBoros ?? false
    const current = audit.recommendations[0]
    if (current && matchesStatus(current.type, isBoros)) return false

    const standard = Number(audit.totalEstimatedKwhPerMonth ?? 0)
    const actual = Number(audit.avgActualPlnKwhPerMonth ?? 0)
    const statusLabel = (boros: boolean) => (boros ? "BOROS" : "HEMAT")
    const summary = `
Toko: ${audit.store.name}
Jam Buka: ${audit.is24Hours ? "24 Jam" : `${audit.openTime ?? "-"} - ${audit.closeTime ?? "-"}`}
Daya PLN: ${audit.plnPowerVa ?? "-"} VA
Status saat input anak toko: ${statusLabel(audit.originalIsBoros ?? !isBoros)}
Status setelah validasi: ${statusLabel(isBoros)}
Standar konsumsi energi setelah validasi: ${formatKwh(standard)}/bulan
Aktual rata-rata PLN setelah validasi: ${formatKwh(actual)}/bulan
Koreksi admin saat validasi:
${audit.corrections.map((c) => `- ${c.summary}`).join("\n") || "- Tidak ada koreksi tercatat"}
Daftar Peralatan (Qty x Nama, jam/hari = kWh/hari):
${audit.items
  .map(
    (item) =>
      `- ${item.qty}x ${item.equipmentType?.name ?? item.customName ?? "Alat"}, ${Number(item.operationalHours)} jam = ${Number(item.estimatedDailyKwh).toFixed(1)} kWh/hari`
  )
  .join("\n")}
`

    let next: {
      type: "TRAINING" | "REPAIR" | "MAINTENANCE"
      title: string
      description: string
    }
    try {
      next = await withTimeout(
        generateRecommendationWithFallback(
          summary,
          validationRecommendationRules
        ),
        AI_TIMEOUT_MS
      )
      if (!matchesStatus(next.type, isBoros))
        throw new Error(`AI returned ${next.type}`)
    } catch (error) {
      console.warn("[Audit Validation] Recommendation fallback used:", error)
      const type = isBoros ? "REPAIR" : "MAINTENANCE"
      next = { type, ...fallbackRecommendations[type] }
    }

    await prisma.$transaction(async (tx) => {
      await tx.auditRecommendation.deleteMany({ where: { auditId } })
      await tx.auditRecommendation.create({ data: { auditId, ...next } })
      await recordCorrections(tx, auditId, validatorId, [
        {
          type: "RECOMMENDATION_UPDATED",
          summary: `Rekomendasi diperbarui karena status menjadi Toko ${isBoros ? "Boros" : "Hemat"}: ${next.title}.`,
          before: current ?? undefined,
          after: next,
        },
      ])
    })
    return true
  } catch (error) {
    console.error("[Audit Validation] Recommendation refresh failed", error)
    return false
  }
}

export async function validateAudit(
  auditId: string,
  draft: ValidationDraftInput
) {
  return runAction(
    "Gagal memvalidasi kalkulasi. Coba lagi.",
    async (validatorId) => {
      const storeName = await prisma.$transaction(async (tx) => {
        const { storeId, technical } = await applyDraft(
          tx,
          auditId,
          validatorId,
          draft
        )
        const updated = await tx.audit.update({
          where: { id: auditId },
          data: {
            validationStatus: "VALIDATED",
            validatedAt: new Date(),
            validatedById: validatorId,
          },
          select: { store: { select: { name: true } } },
        })

        // An older audit must not overwrite technical data from a newer one.
        const latest = await tx.audit.findFirst({
          where: { storeId, status: "COMPLETED" },
          orderBy: { auditDate: "desc" },
          select: { id: true },
        })
        if (latest?.id === auditId) {
          const { storeType, ...storeTechnical } = technical
          await tx.store.update({
            where: { id: storeId },
            data: { ...storeTechnical, type: storeType },
          })
        }

        return updated.store.name
      })

      if (await refreshRecommendation(auditId, validatorId)) {
        const status = await prisma.audit.findUniqueOrThrow({
          where: { id: auditId },
          select: { isBoros: true },
        })
        return {
          auditId,
          message: `${storeName} sudah divalidasi. Status sekarang Toko ${status.isBoros ? "Boros" : "Hemat"}, rekomendasi diperbarui.`,
        }
      }
      return { auditId, message: `${storeName} sudah divalidasi.` }
    }
  )
}
