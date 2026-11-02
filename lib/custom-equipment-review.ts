import type { AreaTarget } from "@prisma/client"

import { typeCategoryFor } from "@/lib/custom-equipment"
import { isDeviceCategory } from "@/lib/equipment-categories"
import { prisma } from "@/lib/prisma"

// Pending submissions from completed calculations that still use the equipment.
// Drafts and items a validator deleted are left out of the queue.
const reviewableWhere = {
  status: "PENDING",
  audit: { status: "COMPLETED" },
  auditItems: { some: {} },
} as const

export async function getPendingCustomEquipmentCount() {
  return prisma.customEquipmentSubmission.count({ where: reviewableWhere })
}

export async function getPendingCustomEquipment() {
  const rows = await prisma.customEquipmentSubmission.findMany({
    where: reviewableWhere,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      deviceCategory: true,
      areaTarget: true,
      baseKw: true,
      brandName: true,
      notes: true,
      productPhotoUrl: true,
      createdAt: true,
      store: { select: { code: true, name: true, branch: true } },
      submittedBy: { select: { fullName: true, email: true } },
      _count: { select: { auditItems: true } },
    },
  })

  const sameNameCount = new Map<string, number>()
  for (const row of rows) {
    const key = row.name.trim().toLowerCase()
    sameNameCount.set(key, (sameNameCount.get(key) ?? 0) + 1)
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    deviceCategory: row.deviceCategory,
    areaTarget: row.areaTarget,
    baseKw: Number(row.baseKw),
    brandName: row.brandName,
    notes: row.notes,
    productPhotoUrl: row.productPhotoUrl,
    createdAt: row.createdAt.toISOString(),
    storeLabel: `${row.store.code} ${row.store.name}`,
    branch: row.store.branch,
    submittedBy: row.submittedBy?.fullName || row.submittedBy?.email || "-",
    itemCount: row._count.auditItems,
    // Other pending submissions with the same name, e.g. one tool seen at several stores.
    sameNameCount: (sameNameCount.get(row.name.trim().toLowerCase()) ?? 1) - 1,
  }))
}

export type PendingCustomEquipment = Awaited<
  ReturnType<typeof getPendingCustomEquipment>
>[number]

export type ApproveCustomEquipmentInput = {
  id: string
  // "new" creates a new master type; otherwise the id of the type to add the brand to.
  equipmentTypeId: "new" | string
  name: string
  deviceCategory: string
  areaTarget: AreaTarget
  baseKw: number
  brandName: string
}

export class CustomEquipmentReviewError extends Error {}

export async function approveCustomEquipment(
  input: ApproveCustomEquipmentInput,
  reviewerId: string
) {
  const name = input.name.trim()
  const brandName = input.brandName.trim()
  if (!name) throw new CustomEquipmentReviewError("Nama equipment wajib diisi.")
  if (!brandName) throw new CustomEquipmentReviewError("Nama merek wajib diisi.")
  if (!isDeviceCategory(input.deviceCategory)) {
    throw new CustomEquipmentReviewError("Pilih kategori jenis yang tersedia.")
  }
  if (!(input.baseKw >= 0)) {
    throw new CustomEquipmentReviewError("Daya harus berupa angka 0 atau lebih.")
  }

  return prisma.$transaction(async (tx) => {
    const submission = await tx.customEquipmentSubmission.findUnique({
      where: { id: input.id },
      select: { status: true, productPhotoUrl: true },
    })
    if (!submission || submission.status !== "PENDING") {
      throw new CustomEquipmentReviewError("Usulan ini sudah ditinjau atau tidak ada lagi.")
    }

    if (input.equipmentTypeId === "new") {
      const sameName = await tx.equipmentType.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true },
      })
      if (sameName) {
        throw new CustomEquipmentReviewError(
          `Tipe "${name}" sudah ada di master. Pilih tipe itu supaya alat ini masuk sebagai merek.`
        )
      }
    }

    const equipmentTypeId =
      input.equipmentTypeId === "new"
        ? (
            await tx.equipmentType.create({
              data: {
                name,
                category: typeCategoryFor(input.deviceCategory, input.areaTarget),
                deviceCategory: input.deviceCategory,
                defaultKw: input.baseKw,
                calcMethod: "STANDARD",
                createdById: reviewerId,
              },
              select: { id: true },
            })
          ).id
        : input.equipmentTypeId

    const existingBrand = await tx.equipmentBrand.findFirst({
      where: {
        equipmentTypeId,
        name: { equals: brandName, mode: "insensitive" },
      },
      select: { id: true, productPhotoUrl: true },
    })
    const brand = existingBrand
      ? await tx.equipmentBrand.update({
          where: { id: existingBrand.id },
          // Keep an existing master photo; only fill it when missing.
          data: existingBrand.productPhotoUrl
            ? {}
            : { productPhotoUrl: submission.productPhotoUrl },
          select: { id: true },
        })
      : await tx.equipmentBrand.create({
          data: {
            equipmentTypeId,
            name: brandName,
            areaTarget: input.areaTarget,
            baseKw: input.baseKw,
            productPhotoUrl: submission.productPhotoUrl,
            createdById: reviewerId,
          },
          select: { id: true },
        })

    await tx.customEquipmentSubmission.update({
      where: { id: input.id },
      data: {
        status: "APPROVED",
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        equipmentTypeId,
        equipmentBrandId: brand.id,
      },
    })

    // Link the calculations to the master record; kWh and Hemat/Boros stay as stored.
    await tx.auditItem.updateMany({
      where: { customEquipmentId: input.id },
      data: { equipmentTypeId, equipmentBrandId: brand.id },
    })
  })
}

export async function rejectCustomEquipment(id: string, reviewerId: string) {
  const result = await prisma.customEquipmentSubmission.updateMany({
    where: { id, status: "PENDING" },
    data: { status: "REJECTED", reviewedById: reviewerId, reviewedAt: new Date() },
  })
  if (result.count === 0) {
    throw new CustomEquipmentReviewError("Usulan ini sudah ditinjau atau tidak ada lagi.")
  }
}
