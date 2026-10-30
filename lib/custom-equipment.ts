import type { AreaTarget, Prisma } from "@prisma/client"

import { isDeviceCategory } from "@/lib/equipment-categories"
import type { EquipmentState } from "@/store/use-audit-store"

// Photos must come from our UploadThing app, not an arbitrary URL from the client.
export function isUploadThingUrl(value: unknown): value is string {
  if (typeof value !== "string") return false
  try {
    const url = new URL(value)
    return (
      url.protocol === "https:" &&
      (url.hostname === "utfs.io" || url.hostname.endsWith(".ufs.sh"))
    )
  } catch {
    return false
  }
}

const AREA_TYPE_CATEGORY: Record<AreaTarget, string> = {
  SALES: "SALES",
  PARKING: "PARKIRAN",
  TERRACE: "TERAS",
  WAREHOUSE: "GUDANG",
}

// equipment_types.category drives which step-2 area lists a type; Beanspot types
// are listed for Beanspot stores wherever they sit.
export function typeCategoryFor(deviceCategory: string, areaTarget: AreaTarget) {
  return deviceCategory === "Sistem Beanspot" ? "BEANSPOT" : AREA_TYPE_CATEGORY[areaTarget]
}

function normalizeName(name: string) {
  return name.trim().toLowerCase()
}

// Equipment from the Tambah Alat Kustom form that is not (yet) in the master.
export function selectCustomEquipment(
  equipments: EquipmentState[],
  masterNames: Set<string>
) {
  return equipments.filter(
    (eq) =>
      eq.selected &&
      eq.name.trim() !== "" &&
      !masterNames.has(normalizeName(eq.name)) &&
      isDeviceCategory(eq.customDeviceCategory) &&
      isUploadThingUrl(eq.customPhotoUrl)
  )
}

// Replaces this audit's pending submissions with the current custom equipment.
// Reviewed ones are kept and reused by name, so a resubmit never re-queues them.
// Returns submission ids keyed by EquipmentState.id for linking audit_items.
export async function syncCustomEquipmentSubmissions(
  tx: Prisma.TransactionClient,
  input: {
    auditId: string
    storeId: string
    userId: string
    equipments: EquipmentState[]
    masterNames: Set<string>
    toAreaTarget: (areaName: string) => AreaTarget
  }
) {
  const custom = selectCustomEquipment(input.equipments, input.masterNames)

  const reviewed = await tx.customEquipmentSubmission.findMany({
    where: { auditId: input.auditId, status: { not: "PENDING" } },
    select: { id: true, name: true },
  })
  const reviewedByName = new Map(reviewed.map((s) => [normalizeName(s.name), s.id]))

  await tx.customEquipmentSubmission.deleteMany({
    where: { auditId: input.auditId, status: "PENDING" },
  })

  const ids = new Map<string, string>()
  for (const eq of custom) {
    const reviewedId = reviewedByName.get(normalizeName(eq.name))
    if (reviewedId) {
      ids.set(eq.id, reviewedId)
      continue
    }
    const created = await tx.customEquipmentSubmission.create({
      data: {
        auditId: input.auditId,
        storeId: input.storeId,
        submittedById: input.userId,
        name: eq.name.trim(),
        deviceCategory: eq.customDeviceCategory!,
        areaTarget: input.toAreaTarget(eq.areaName),
        baseKw: eq.kws?.[0] ?? eq.kw ?? 0,
        brandName: eq.brandNames?.[0]?.trim() || eq.brandName?.trim() || "",
        notes: eq.notes?.trim() || null,
        productPhotoUrl: eq.customPhotoUrl!,
      },
      select: { id: true },
    })
    ids.set(eq.id, created.id)
  }
  return ids
}
