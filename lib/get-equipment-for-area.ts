import { prisma } from "@/lib/prisma"

export type EquipmentBrandItem = {
  id: string
  name: string
  baseKw: number
}

export type EquipmentMasterItem = {
  id: string
  name: string
  category: string
  defaultKw: number
  brands: EquipmentBrandItem[]
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
    defaultKw: Number(row.defaultKw),
    brands: row.brands.map((b) => ({
      id: b.id,
      name: b.name,
      baseKw: Number(b.baseKw),
    })),
  }))
}
