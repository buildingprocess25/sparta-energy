import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withEffectiveRole } from "@/lib/current-role"
import { hasFullBranchAccess } from "@/lib/permissions"
import { StoreMepSimulatorClient } from "./store-mep-simulator-client"
import { getMepSimulationDetail } from "@/app/actions/mep-simulation-actions"

const excludedBranchNames = [
  "DEMO",
  "Demo",
  "demo",
  "HEAD OFFICE",
  "Head Office",
  "head office",
]

type SearchParams = Promise<{
  loadMepLogId?: string
}>

export default async function StoreMepSimulatorPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const dbUser = await withEffectiveRole(
    session?.user
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true, branch: true, role: true },
        })
      : null
  )

  const resolvedParams = searchParams ? await searchParams : {}
  const initialLoadedLog = resolvedParams.loadMepLogId
    ? await getMepSimulationDetail(resolvedParams.loadMepLogId)
    : null

  const canAccessAll = dbUser ? hasFullBranchAccess(dbUser) : false
  const branches =
    dbUser?.branch
      ?.split(",")
      .map((b) => b.trim())
      .filter(Boolean) ?? []

  const stores = await prisma.store.findMany({
    where: dbUser
      ? canAccessAll
        ? {
            branch: {
              notIn: excludedBranchNames,
            },
          }
        : { branch: { in: branches } }
      : {
          branch: {
            equals: "DEMO",
            mode: "insensitive",
          },
        },
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
      toiletAreaM2: true,
      corridorAreaM2: true,
      latitude: true,
      longitude: true,
    },
  })

  return (
    <StoreMepSimulatorClient
      stores={stores.map((s) => ({
        ...s,
        parkingAreaM2: Number(s.parkingAreaM2 ?? 0),
        terraceAreaM2: Number(s.terraceAreaM2 ?? 0),
        salesAreaM2: Number(s.salesAreaM2 ?? 0),
        warehouseAreaM2: Number(s.warehouseAreaM2 ?? 0),
        toiletAreaM2: Number(s.toiletAreaM2 ?? 0),
        corridorAreaM2: Number(s.corridorAreaM2 ?? 0),
        latitude: s.latitude ? Number(s.latitude) : null,
        longitude: s.longitude ? Number(s.longitude) : null,
      }))}
      initialLoadedLog={initialLoadedLog}
      isAdmin={dbUser?.role === "ADMIN"}
    />
  )
}

