import { Suspense } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAllEquipmentMaster } from "@/lib/get-equipment-for-area"
import { AuditStartClient } from "./start-client"

export default async function AuditStartPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")

  // Find user with branch info
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { branch: true },
  })

  // Find all stores in the same branch
  const stores = await prisma.store.findMany({
    where: { branch: dbUser?.branch ?? "" },
    orderBy: { code: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      branch: true,
      plnCustomerId: true,
      type: true,
      is24Hours: true,
      openTime: true,
      closeTime: true,
      plnPowerVa: true,
      parkingAreaM2: true,
      terraceAreaM2: true,
      salesAreaM2: true,
      warehouseAreaM2: true,
    },
  })

  if (stores.length === 0) {
    return (
      <div className="p-4 text-center">
        Tidak ada toko yang tersedia untuk cabang Anda.
      </div>
    )
  }

  const masterItems = await getAllEquipmentMaster()

  return (
    <Suspense fallback={null}>
      <AuditStartClient
        stores={stores.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          branch: s.branch,
          plnCustomerId: s.plnCustomerId,
          type: s.type,
          is24Hours: s.is24Hours,
          openTime: s.openTime,
          closeTime: s.closeTime,
          plnPowerVa: s.plnPowerVa,
          parkingAreaM2: Number(s.parkingAreaM2),
          terraceAreaM2: Number(s.terraceAreaM2),
          salesAreaM2: Number(s.salesAreaM2),
          warehouseAreaM2: Number(s.warehouseAreaM2),
        }))}
        masterItems={masterItems}
      />
    </Suspense>
  )
}
