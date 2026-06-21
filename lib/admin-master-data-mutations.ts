import { Prisma } from "@prisma/client"
import { UTApi } from "uploadthing/server"

import { prisma } from "@/lib/prisma"

const utapi = new UTApi()

export async function deleteUploadThingFile(url: string | null | undefined) {
  if (!url) return
  try {
    const fileKey = url.substring(url.lastIndexOf("/") + 1)
    if (fileKey) {
      await utapi.deleteFiles(fileKey)
      console.log(`[UploadThing] Berhasil menghapus file key: ${fileKey}`)
    }
  } catch (error) {
    console.error(`[UploadThing] Gagal menghapus file dari URL ${url}:`, error)
  }
}

export type ApiMutationResult =
  | { ok: true }
  | { ok: false; status: number; message: string }

const areaTargets = new Set(["PARKING", "TERRACE", "SALES", "WAREHOUSE"])

function getString(data: Record<string, unknown>, key: string) {
  const value = data[key]
  return typeof value === "string" ? value.trim() : ""
}

function getOptionalString(data: Record<string, unknown>, key: string) {
  const value = getString(data, key)
  return value || null
}

function getBoolean(data: Record<string, unknown>, key: string) {
  return data[key] === true
}

function getNumber(data: Record<string, unknown>, key: string) {
  const value = Number(data[key])
  return Number.isFinite(value) ? value : NaN
}

function requireNonNegativeNumber(data: Record<string, unknown>, key: string) {
  const value = getNumber(data, key)
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${key} harus berupa angka 0 atau lebih`)
  }

  return value
}

function requirePositiveInteger(data: Record<string, unknown>, key: string) {
  const value = getNumber(data, key)
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${key} harus berupa angka bulat 0 atau lebih`)
  }

  return value
}

function getStorePayload(data: Record<string, unknown>) {
  const code = getString(data, "code")
  const name = getString(data, "name")
  const type = getString(data, "type")
  const is24Hours = getBoolean(data, "is24Hours")
  const openTime = getOptionalString(data, "openTime")
  const closeTime = getOptionalString(data, "closeTime")

  if (!code) throw new Error("Kode toko wajib diisi")
  if (!name) throw new Error("Nama toko wajib diisi")
  if (!type) throw new Error("Tipe toko wajib diisi")
  if (!is24Hours && (!openTime || !closeTime)) {
    throw new Error("Jam buka dan tutup wajib diisi untuk toko non-24 jam")
  }

  return {
    code,
    name,
    branch: getOptionalString(data, "branch"),
    plnCustomerId: getOptionalString(data, "plnCustomerId"),
    type,
    is24Hours,
    openTime: is24Hours ? null : openTime,
    closeTime: is24Hours ? null : closeTime,
    plnPowerVa: requirePositiveInteger(data, "plnPowerVa"),
    parkingAreaM2: requireNonNegativeNumber(data, "parkingAreaM2"),
    terraceAreaM2: requireNonNegativeNumber(data, "terraceAreaM2"),
    salesAreaM2: requireNonNegativeNumber(data, "salesAreaM2"),
    warehouseAreaM2: requireNonNegativeNumber(data, "warehouseAreaM2"),
  }
}

function getEquipmentTypePayload(data: Record<string, unknown>) {
  const name = getString(data, "equipmentName")
  const category = getString(data, "category")
  const deviceCategory = getString(data, "deviceCategory")

  if (!name) throw new Error("Nama equipment wajib diisi")
  if (!category) throw new Error("Kategori wajib diisi")
  if (!deviceCategory) throw new Error("Kategori jenis wajib diisi")

  return {
    name,
    category,
    deviceCategory,
    storeType: getOptionalString(data, "storeType"),
    defaultKw: requireNonNegativeNumber(data, "defaultKw"),
  }
}

function getEquipmentBrandPayload(data: Record<string, unknown>) {
  const name = getString(data, "brandName")
  const areaTarget = getString(data, "area")

  if (!name) throw new Error("Nama brand wajib diisi")
  if (!areaTargets.has(areaTarget)) throw new Error("Area tidak valid")

  return {
    name,
    areaTarget: areaTarget as "PARKING" | "TERRACE" | "SALES" | "WAREHOUSE",
    baseKw: requireNonNegativeNumber(data, "baseKw"),
    standbyKw: requireNonNegativeNumber(data, "standbyKw"),
    runningKw: requireNonNegativeNumber(data, "runningKw"),
    productPhotoUrl: getOptionalString(data, "productPhotoUrl"),
    nameplatePhotoUrl: getOptionalString(data, "nameplatePhotoUrl"),
  }
}

function getPrismaErrorMessage(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "Data dengan nilai unik yang sama sudah ada"
  }

  if (error instanceof Error) return error.message
  return "Terjadi kesalahan saat menyimpan master data"
}

export async function createMasterStore(
  data: Record<string, unknown>
): Promise<ApiMutationResult> {
  try {
    await prisma.store.create({ data: getStorePayload(data) })
    return { ok: true }
  } catch (error) {
    return { ok: false, status: 400, message: getPrismaErrorMessage(error) }
  }
}

export async function updateMasterStore(
  id: string,
  data: Record<string, unknown>
): Promise<ApiMutationResult> {
  try {
    await prisma.store.update({
      where: { id },
      data: getStorePayload(data),
    })
    return { ok: true }
  } catch (error) {
    return { ok: false, status: 400, message: getPrismaErrorMessage(error) }
  }
}

export async function deleteMasterStore(
  id: string
): Promise<ApiMutationResult> {
  const auditCount = await prisma.audit.count({ where: { storeId: id } })
  if (auditCount > 0) {
    return {
      ok: false,
      status: 409,
      message: "Toko sudah dipakai audit, jadi tidak bisa dihapus",
    }
  }

  try {
    await prisma.store.delete({ where: { id } })
    return { ok: true }
  } catch (error) {
    return { ok: false, status: 400, message: getPrismaErrorMessage(error) }
  }
}

export async function createMasterEquipment(
  data: Record<string, unknown>
): Promise<ApiMutationResult> {
  try {
    const equipmentTypeId = getString(data, "equipmentTypeId")
    const brand = getEquipmentBrandPayload(data)

    if (equipmentTypeId === "new") {
      const type = getEquipmentTypePayload(data)

      await prisma.$transaction(async (tx) => {
        const createdType = await tx.equipmentType.create({ data: type })
        await tx.equipmentBrand.create({
          data: {
            ...brand,
            equipmentTypeId: createdType.id,
          },
        })
      })
    } else {
      if (!equipmentTypeId) throw new Error("Tipe equipment wajib dipilih")
      await prisma.equipmentBrand.create({
        data: {
          ...brand,
          equipmentTypeId,
        },
      })
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, status: 400, message: getPrismaErrorMessage(error) }
  }
}

export async function updateMasterEquipment(
  id: string,
  data: Record<string, unknown>
): Promise<ApiMutationResult> {
  try {
    const type = getEquipmentTypePayload(data)
    const brand = getEquipmentBrandPayload(data)

    const existingBrand = await prisma.equipmentBrand.findUnique({
      where: { id },
      select: { 
        equipmentTypeId: true,
        productPhotoUrl: true,
        nameplatePhotoUrl: true,
      },
    })
    if (!existingBrand) {
      return { ok: false, status: 404, message: "Brand equipment tidak ada" }
    }

    await prisma.$transaction([
      prisma.equipmentType.update({
        where: { id: existingBrand.equipmentTypeId },
        data: type,
      }),
      prisma.equipmentBrand.update({
        where: { id },
        data: brand,
      }),
    ])

    // Bersihkan file foto lama di UploadThing jika diganti/dihapus
    if (existingBrand.productPhotoUrl && existingBrand.productPhotoUrl !== brand.productPhotoUrl) {
      await deleteUploadThingFile(existingBrand.productPhotoUrl)
    }
    if (existingBrand.nameplatePhotoUrl && existingBrand.nameplatePhotoUrl !== brand.nameplatePhotoUrl) {
      await deleteUploadThingFile(existingBrand.nameplatePhotoUrl)
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, status: 400, message: getPrismaErrorMessage(error) }
  }
}

export async function deleteMasterEquipment(
  id: string
): Promise<ApiMutationResult> {
  const auditItemCount = await prisma.auditItem.count({
    where: { equipmentBrandId: id },
  })
  if (auditItemCount > 0) {
    return {
      ok: false,
      status: 409,
      message: "Brand equipment sudah dipakai audit, jadi tidak bisa dihapus",
    }
  }

  // Ambil url foto lama sebelum brand dihapus dari DB
  const existingBrand = await prisma.equipmentBrand.findUnique({
    where: { id },
    select: { productPhotoUrl: true, nameplatePhotoUrl: true },
  })

  try {
    await prisma.equipmentBrand.delete({ where: { id } })

    // Bersihkan file foto di UploadThing setelah berhasil didelete dari DB
    if (existingBrand) {
      if (existingBrand.productPhotoUrl) {
        await deleteUploadThingFile(existingBrand.productPhotoUrl)
      }
      if (existingBrand.nameplatePhotoUrl) {
        await deleteUploadThingFile(existingBrand.nameplatePhotoUrl)
      }
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, status: 400, message: getPrismaErrorMessage(error) }
  }
}
