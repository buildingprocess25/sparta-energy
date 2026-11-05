import { normalizeBrandName } from "@/lib/brand-match"
import { prisma } from "@/lib/prisma"
import {
  brandKey,
  groupUnregisteredBrands,
  toMasterBrandData,
  UnregisteredBrandError,
  type BrandToMasterInput,
} from "@/lib/unregistered-brands"

const EXCLUDED_BRANCHES = ["demo", "head office"]

// Field rows on a master type that never linked to a master brand. Custom
// equipment has its own review queue, and drafts are not counted yet.
export async function getUnregisteredBrands() {
  const [items, masterBrands, dismissed] = await Promise.all([
    prisma.auditItem.findMany({
      where: {
        equipmentTypeId: { not: null },
        equipmentBrandId: null,
        customEquipmentId: null,
        brandName: { not: "" },
        audit: { status: "COMPLETED" },
      },
      select: {
        brandName: true,
        baseKw: true,
        areaTarget: true,
        equipmentType: {
          select: { id: true, name: true, calcMethod: true, operationType: true, calcDuration: true },
        },
        audit: {
          select: {
            id: true,
            auditDate: true,
            store: { select: { id: true, code: true, branch: true } },
          },
        },
      },
    }),
    prisma.equipmentBrand.findMany({
      select: { id: true, equipmentTypeId: true, name: true },
    }),
    prisma.unregisteredBrandDismissal.findMany({
      select: { equipmentTypeId: true, brandName: true },
    }),
  ])

  const rows = items.flatMap((item) => {
    const type = item.equipmentType
    const store = item.audit.store
    if (!type || EXCLUDED_BRANCHES.includes((store.branch ?? "").trim().toLowerCase())) {
      return []
    }
    return [
      {
        equipmentTypeId: type.id,
        typeName: type.name,
        calcMethod: type.calcMethod,
        operationType: type.operationType,
        cycleSeconds: type.calcDuration,
        brandName: item.brandName,
        baseKw: Number(item.baseKw),
        areaTarget: item.areaTarget,
        auditId: item.audit.id,
        storeId: store.id,
        storeCode: store.code,
        auditDate: item.audit.auditDate,
      },
    ]
  })

  return groupUnregisteredBrands(rows, masterBrands, dismissed)
}

async function rememberDismissal(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  equipmentTypeId: string,
  fieldBrandName: string,
  reviewerId: string
) {
  const brandName = normalizeBrandName(fieldBrandName)
  await tx.unregisteredBrandDismissal.upsert({
    where: { equipmentTypeId_brandName: { equipmentTypeId, brandName } },
    create: { equipmentTypeId, brandName, dismissedById: reviewerId },
    update: {},
  })
}

export type AddFieldBrandInput = BrandToMasterInput & {
  equipmentTypeId: string
  fieldBrandName: string
}

// Audit rows are left as stored; the list hides the brand once the master has it.
export async function addFieldBrandToMaster(input: AddFieldBrandInput, reviewerId: string) {
  return prisma.$transaction(async (tx) => {
    const type = await tx.equipmentType.findUnique({
      where: { id: input.equipmentTypeId },
      select: { id: true, name: true, calcMethod: true, operationType: true, calcDuration: true },
    })
    if (!type) throw new UnregisteredBrandError("Tipe alat ini sudah tidak ada di master.")

    const data = toMasterBrandData(input, { ...type, cycleSeconds: type.calcDuration })
    const existing = await tx.equipmentBrand.findMany({
      where: { equipmentTypeId: type.id },
      select: { name: true },
    })
    if (existing.some((brand) => brandKey(type.id, brand.name) === brandKey(type.id, data.name))) {
      throw new UnregisteredBrandError(`Merek "${data.name}" sudah ada di tipe ${type.name}.`)
    }

    const brand = await tx.equipmentBrand.create({
      data: { ...data, equipmentTypeId: type.id, createdById: reviewerId },
      select: { name: true },
    })

    // A corrected spelling would leave the field spelling in the list forever.
    if (brandKey(type.id, input.fieldBrandName) !== brandKey(type.id, data.name)) {
      await rememberDismissal(tx, type.id, input.fieldBrandName, reviewerId)
    }

    return { brandName: brand.name, typeName: type.name }
  })
}

export async function dismissFieldBrand(
  input: { equipmentTypeId: string; fieldBrandName: string },
  reviewerId: string
) {
  if (!normalizeBrandName(input.fieldBrandName)) {
    throw new UnregisteredBrandError("Nama merek tidak valid.")
  }
  return prisma.$transaction(async (tx) => {
    const type = await tx.equipmentType.findUnique({
      where: { id: input.equipmentTypeId },
      select: { id: true },
    })
    if (!type) throw new UnregisteredBrandError("Tipe alat ini sudah tidak ada di master.")
    await rememberDismissal(tx, type.id, input.fieldBrandName, reviewerId)
  })
}
