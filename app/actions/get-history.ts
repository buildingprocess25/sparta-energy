"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { headers } from "next/headers"

type AuditStatus = "hemat" | "boros"

export type HistoryItem = {
  id: string
  storeName: string
  period: string
  status: AuditStatus
  standardAverage: number
  actualAverage: number
  efficiency: number
}

export type HistoryResponse = {
  items: HistoryItem[]
  hasMore: boolean
}

export async function getAuditHistory(
  page: number,
  search: string,
  status: string, // "all", "hemat", "boros"
  year: string    // "all" or "YYYY"
): Promise<HistoryResponse> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return { items: [], hasMore: false }
  }

  const itemsPerPage = 10
  const skip = (page - 1) * itemsPerPage

  // Build Prisma where clause
  const where: Prisma.AuditWhereInput = {
    auditorId: session.user.id,
    status: "COMPLETED",
  }

  if (search) {
    where.store = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ],
    }
  }

  if (status !== "all") {
    where.isBoros = status === "boros"
  }

  if (year !== "all") {
    // AuditDate is DateTime. We filter by year.
    const startYear = new Date(`${year}-01-01T00:00:00.000Z`)
    const endYear = new Date(`${year}-12-31T23:59:59.999Z`)
    where.auditDate = {
      gte: startYear,
      lte: endYear,
    }
  }

  // Fetch audits plus one extra to determine if there's a next page
  const audits = await prisma.audit.findMany({
    where,
    orderBy: { auditDate: "desc" },
    skip,
    take: itemsPerPage + 1,
    select: {
      id: true,
      auditDate: true,
      isBoros: true,
      totalEstimatedKwhPerMonth: true,
      avgActualPlnKwhPerMonth: true,
      store: {
        select: {
          name: true,
          salesAreaM2: true,
          parkingAreaM2: true,
          terraceAreaM2: true,
          warehouseAreaM2: true,
        },
      },
    },
  })

  const hasMore = audits.length > itemsPerPage
  const itemsToReturn = audits.slice(0, itemsPerPage)

  const items: HistoryItem[] = itemsToReturn.map((a) => {
    const totalAreaM2 =
      Number(a.store.salesAreaM2) +
      Number(a.store.parkingAreaM2) +
      Number(a.store.terraceAreaM2) +
      Number(a.store.warehouseAreaM2) || 1

    const est = Number(a.totalEstimatedKwhPerMonth ?? 0) / totalAreaM2
    const actual = Number(a.avgActualPlnKwhPerMonth ?? 0) / totalAreaM2
    const efficiency = est > 0 ? Math.round((actual / est) * 100 * 10) / 10 : 0

    const month = new Date(a.auditDate).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    })

    return {
      id: a.id,
      storeName: a.store.name,
      period: month,
      status: a.isBoros ? "boros" : "hemat",
      standardAverage: Math.round(est * 10) / 10,
      actualAverage: Math.round(actual * 10) / 10,
      efficiency,
    }
  })

  return {
    items,
    hasMore,
  }
}

export async function getAvailableYears(): Promise<string[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return []

  const audits = await prisma.audit.findMany({
    where: {
      auditorId: session.user.id,
      status: "COMPLETED",
    },
    select: {
      auditDate: true,
    },
    orderBy: {
      auditDate: "desc",
    },
  })

  // Extract unique years
  const years = new Set(
    audits.map((a) => new Date(a.auditDate).getFullYear().toString())
  )

  return Array.from(years)
}
