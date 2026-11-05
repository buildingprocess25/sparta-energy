import { prisma } from "@/lib/prisma"

export type EquipmentBrandItem = {
  id: string
  name: string
  baseKw: number
  productPhotoUrl?: string | null
  runningKw: number
  standbyKw: number
  runningTimePct: number | null
  standbyTimePct: number | null
}

export type EquipmentMasterItem = {
  id: string
  name: string
  category: string
  deviceCategory: string
  defaultKw: number
  brands: EquipmentBrandItem[]
  calcMethod: string
  calcDuration: number | null
  operationType: string
}

export async function getAllEquipmentMaster(): Promise<EquipmentMasterItem[]> {
  const rows = await prisma.equipmentType.findMany({
    include: {
      brands: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  })

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    deviceCategory: row.deviceCategory,
    defaultKw: Number(row.defaultKw),
    calcMethod: row.calcMethod,
    calcDuration: row.calcDuration,
    operationType: row.operationType,
    brands: row.brands.map((b) => ({
      id: b.id,
      name: b.name,
      baseKw: Number(b.baseKw),
      productPhotoUrl: b.productPhotoUrl,
      runningKw: Number(b.runningKw),
      standbyKw: Number(b.standbyKw),
      runningTimePct: b.runningTimePct === null ? null : Number(b.runningTimePct),
      standbyTimePct: b.standbyTimePct === null ? null : Number(b.standbyTimePct),
    })),
  }))
}
