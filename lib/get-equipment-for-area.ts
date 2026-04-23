import { prisma } from "@/lib/prisma"

const AREA_TO_CATEGORY: Record<string, string[]> = {
  "Sales": ["SALES", "BEANSPOT"],
  "Teras": ["TERAS"],
  "Parkiran": ["PARKIRAN"],
  "Gudang, Toilet & Selasar": ["GUDANG"],
  "Beanspot": ["BEANSPOT"],
}

export type EquipmentMasterItem = {
  id: string
  name: string
  category: string
  defaultKw: number
}

function toEquipmentMasterItem(row: {
  id: string
  name: string
  category: string
  defaultKw: unknown
}): EquipmentMasterItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    defaultKw: Number(row.defaultKw),
  }
}

export async function getEquipmentForAreas(
  areaNames: string[]
): Promise<Record<string, EquipmentMasterItem[]>> {
  const uniqueCategories = Array.from(
    new Set(areaNames.flatMap((areaName) => AREA_TO_CATEGORY[areaName] ?? []))
  )

  if (uniqueCategories.length === 0) {
    return Object.fromEntries(
      areaNames.map((areaName) => [areaName, [] as EquipmentMasterItem[]])
    )
  }

  const rows = await prisma.equipmentMaster.findMany({
    where: {
      category: { in: uniqueCategories },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      defaultKw: true,
    },
  })

  const items = rows.map(toEquipmentMasterItem)

  return Object.fromEntries(
    areaNames.map((areaName) => {
      const categorySet = new Set(AREA_TO_CATEGORY[areaName] ?? [])
      return [
        areaName,
        items.filter((item) => categorySet.has(item.category)),
      ]
    })
  )
}

export async function getEquipmentForArea(
  areaName: string
): Promise<EquipmentMasterItem[]> {
  const equipmentByArea = await getEquipmentForAreas([areaName])
  return equipmentByArea[areaName] ?? []
}
