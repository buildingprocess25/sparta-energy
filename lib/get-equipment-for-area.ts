import { prisma } from "@/lib/prisma"

const AREA_TO_CATEGORY: Record<string, string[]> = {
  "Sales Area":               ["SALES"],
  "Teras":                    ["TERAS"],
  "Parkir":                   ["PARKIRAN"],
  "Gudang, Toilet & Selasar": ["GUDANG"],
  "Beanspot":                 ["BEANSPOT"],
}

export type EquipmentMasterItem = {
  id: string
  name: string
  category: string
  defaultWatt: number
}

export async function getEquipmentForArea(
  areaName: string
): Promise<EquipmentMasterItem[]> {
  const categories = AREA_TO_CATEGORY[areaName] ?? []

  const rows = await prisma.equipmentMaster.findMany({
    where: {
      category: { in: categories },
    },
    orderBy: { name: "asc" },
  })

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    defaultWatt: Number(r.defaultWatt),
  }))
}
