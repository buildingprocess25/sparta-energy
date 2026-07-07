"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

const excludedBranchNames = [
  "DEMO",
  "Demo",
  "demo",
  "HEAD OFFICE",
  "Head Office",
  "head office",
]

export async function searchStoresAction(query: string = "") {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { branch: true, role: true },
    })

    if (!dbUser) {
      throw new Error("User not found")
    }

    const isAdmin = dbUser.role === "ADMIN"
    const branches =
      dbUser?.branch
        ?.split(",")
        .map((b) => b.trim())
        .filter(Boolean) ?? []

    const trimmedQuery = query.trim()

    const stores = await prisma.store.findMany({
      where: {
        AND: [
          isAdmin
            ? {
                branch: {
                  notIn: excludedBranchNames,
                },
              }
            : {
                branch: {
                  in: branches,
                },
              },
          trimmedQuery
            ? {
                OR: [
                  { code: { contains: trimmedQuery, mode: "insensitive" } },
                  { name: { contains: trimmedQuery, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      orderBy: { code: "asc" },
      take: 30,
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

    return stores.map((s) => ({
      ...s,
      openTime: s.openTime ?? null,
      closeTime: s.closeTime ?? null,
      parkingAreaM2: Number(s.parkingAreaM2),
      terraceAreaM2: Number(s.terraceAreaM2),
      salesAreaM2: Number(s.salesAreaM2),
      warehouseAreaM2: Number(s.warehouseAreaM2),
    }))
  } catch (error) {
    console.error("[searchStoresAction] Error:", error)
    return []
  }
}

export async function getStoreByCodeAction(code: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    const store = await prisma.store.findUnique({
      where: { code },
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

    if (!store) return null

    return {
      ...store,
      openTime: store.openTime ?? null,
      closeTime: store.closeTime ?? null,
      parkingAreaM2: Number(store.parkingAreaM2),
      terraceAreaM2: Number(store.terraceAreaM2),
      salesAreaM2: Number(store.salesAreaM2),
      warehouseAreaM2: Number(store.warehouseAreaM2),
    }
  } catch (error) {
    console.error("[getStoreByCodeAction] Error:", error)
    return null
  }
}
