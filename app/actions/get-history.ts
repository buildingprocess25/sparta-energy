"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { getServerErrorMessage, type ActionError } from "@/lib/error-handling"

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
  error?: ActionError
}

export type AvailableYearsResponse = {
  years: string[]
  error?: ActionError
}

type AuditHistoryRow = {
  id: string
  auditDate: Date
  isBoros: boolean | null
  totalEstimatedKwhPerMonth: unknown
  avgActualPlnKwhPerMonth: unknown
  store: {
    name: string
    salesAreaM2: unknown
    parkingAreaM2: unknown
    terraceAreaM2: unknown
    warehouseAreaM2: unknown
  }
}

type AuditYearRow = {
  auditDate: Date
}

export async function getAuditHistory(
  page: number,
  search: string,
  status: string, // "all", "hemat", "boros"
  year: string // "all" or "YYYY"
): Promise<HistoryResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return {
        items: [],
        hasMore: false,
        error: {
          type: "auth",
          message: "Sesi Anda telah berakhir. Silakan login kembali.",
        },
      }
    }

    const itemsPerPage = 10
    const skip = (page - 1) * itemsPerPage

    const searchFilter = search
      ? {
          store: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { code: { contains: search, mode: "insensitive" as const } },
            ],
          },
        }
      : {}

    const statusFilter = status !== "all" ? { isBoros: status === "boros" } : {}

    const yearFilter =
      year !== "all"
        ? {
            auditDate: {
              gte: new Date(`${year}-01-01T00:00:00.000Z`),
              lte: new Date(`${year}-12-31T23:59:59.999Z`),
            },
          }
        : {}

    // Fetch audits plus one extra to determine if there's a next page
    const audits = (await prisma.audit.findMany({
      where: {
        auditorId: session.user.id,
        status: "COMPLETED",
        ...searchFilter,
        ...statusFilter,
        ...yearFilter,
      },
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
    })) as AuditHistoryRow[]

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
      const efficiency =
        est > 0 ? Math.round((actual / est) * 100 * 10) / 10 : 0

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
  } catch (error) {
    return {
      items: [],
      hasMore: false,
      error: {
        type: "server",
        message: getServerErrorMessage(error),
      },
    }
  }
}

export async function getAvailableYears(): Promise<AvailableYearsResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return {
        years: [],
        error: {
          type: "auth",
          message: "Sesi Anda telah berakhir. Silakan login kembali.",
        },
      }
    }

    const audits = (await prisma.audit.findMany({
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
    })) as AuditYearRow[]

    // Extract unique years
    const years = new Set(
      audits.map((a) => new Date(a.auditDate).getFullYear().toString())
    )

    return { years: Array.from(years) }
  } catch (error) {
    return {
      years: [],
      error: {
        type: "server",
        message: getServerErrorMessage(error),
      },
    }
  }
}
