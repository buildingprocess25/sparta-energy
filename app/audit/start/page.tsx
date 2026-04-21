import { Suspense } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getEquipmentForArea } from "@/lib/get-equipment-for-area"
import { AuditStartClient } from "./start-client"

const AREA_NAMES = [
  "Sales Area",
  "Teras",
  "Parkir",
  "Gudang, Toilet & Selasar",
  "Beanspot",
]

export default async function AuditStartPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")

  const access = await prisma.userStoreAccess.findFirst({
    where: { userId: session.user.id },
    include: { store: true },
  })
  
  if (!access?.store) {
    // Optionally redirect or show an error if no store is assigned
    return <div className="p-4 text-center">Toko tidak ditemukan atau Anda tidak memiliki akses.</div>
  }

  // Fetch all area equipment server-side in parallel
  const allEquipment = await Promise.all(
    AREA_NAMES.map((name) =>
      getEquipmentForArea(name).then((items) => [name, items] as const)
    )
  )

  const equipmentByArea = Object.fromEntries(allEquipment)

  return (
    <Suspense fallback={null}>
      <AuditStartClient 
        equipmentByArea={equipmentByArea} 
        initialStore={{
          code: access.store.code,
          name: access.store.name,
          branch: access.store.branch,
          plnCustomerId: access.store.plnCustomerId,
          type: access.store.type,
          is24Hours: access.store.is24Hours,
          openTime: access.store.openTime,
          closeTime: access.store.closeTime,
          plnPowerVa: access.store.plnPowerVa,
          parkingAreaM2: Number(access.store.parkingAreaM2),
          terraceAreaM2: Number(access.store.terraceAreaM2),
          salesAreaM2: Number(access.store.salesAreaM2),
          warehouseAreaM2: Number(access.store.warehouseAreaM2),
        }}
      />
    </Suspense>
  )
}
