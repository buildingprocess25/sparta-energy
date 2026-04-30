import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AcEstimationClient } from "./ac-estimation-client"
import type { StoreData } from "@/app/audit/start/start-client"

export default async function AcEstimationPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login?reason=session-expired")

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { branch: true },
  })

  if (!dbUser) redirect("/forbidden")

  const branches =
    dbUser?.branch
      ?.split(",")
      .map((b) => b.trim())
      .filter(Boolean) ?? []
  const stores = await prisma.store.findMany({
    where: { branch: { in: branches } },
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

  const formattedStores: StoreData[] = stores.map((s) => ({
    ...s,
    openTime: s.openTime ?? null,
    closeTime: s.closeTime ?? null,
    parkingAreaM2: Number(s.parkingAreaM2),
    terraceAreaM2: Number(s.terraceAreaM2),
    salesAreaM2: Number(s.salesAreaM2),
    warehouseAreaM2: Number(s.warehouseAreaM2),
  }))

  return <AcEstimationClient stores={formattedStores} />
}
