import { prisma } from "@/lib/prisma"

export type CalculatorStoreModeFilter = "all" | "EXISTING" | "NEW"

export type AcLogFilters = {
  q?: string
  branch?: string
  storeMode?: CalculatorStoreModeFilter
  year?: string
  month?: string
  page?: number
  pageSize?: number
}

export type LightLogFilters = {
  q?: string
  branch?: string
  storeMode?: CalculatorStoreModeFilter
  shapeType?: string
  standardStatus?: string
  year?: string
  month?: string
  page?: number
  pageSize?: number
}

export type AcLogItem = {
  id: string
  userEmail: string | null
  userName?: string | null
  storeMode: "EXISTING" | "NEW"
  storeCode: string | null
  storeName: string | null
  branch: string | null
  salesArea: number
  maxTemp: number
  clusterBtu: number
  totalBtu: number
  recommendedUnits: number
  latitude: number | null
  longitude: number | null
  notes: string | null
  createdAt: string
}

export type LightLogItem = {
  id: string
  userEmail: string | null
  userName?: string | null
  storeMode: "EXISTING" | "NEW"
  storeCode: string | null
  storeName: string | null
  branch: string | null
  salesArea: number
  shapeType: string | null
  dimensions: string | null
  lampWatt: number
  minUnits: number
  maxUnits: number
  installedUnits: number
  targetLux: number | null
  powerRatio: number | null
  standardStatus: string | null
  notes: string | null
  createdAt: string
}

function getDateRange(year?: string, month?: string) {
  if (!year || year === "all") return undefined

  const y = parseInt(year, 10)
  if (isNaN(y)) return undefined

  if (month && month !== "all") {
    const m = parseInt(month, 10)
    if (!isNaN(m) && m >= 1 && m <= 12) {
      const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0))
      const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999))
      return { gte: start, lte: end }
    }
  }

  const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0))
  const end = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999))
  return { gte: start, lte: end }
}

export async function getAcCalculatorLogs(filters: AcLogFilters = {}) {
  const {
    q = "",
    branch = "all",
    storeMode = "all",
    year = "all",
    month = "all",
    page = 1,
    pageSize = 50,
  } = filters

  const where: any = {}

  if (storeMode !== "all") {
    where.storeMode = storeMode
  }

  if (branch !== "all" && branch.trim() !== "") {
    where.branch = { equals: branch, mode: "insensitive" }
  }

  const dateFilter = getDateRange(year, month)
  if (dateFilter) {
    where.createdAt = dateFilter
  }

  if (q && q.trim() !== "") {
    const query = q.trim()
    where.OR = [
      { storeCode: { contains: query, mode: "insensitive" } },
      { storeName: { contains: query, mode: "insensitive" } },
      { userEmail: { contains: query, mode: "insensitive" } },
      { notes: { contains: query, mode: "insensitive" } },
    ]
  }

  try {
    const acModel = (prisma as any).acCalculatorLog
    if (!acModel) {
      console.warn("[getAcCalculatorLogs] Model acCalculatorLog belum tersedia di Prisma Client. Jalankan 'npx prisma generate'.")
      return {
        data: [],
        totalCount: 0,
        page: 1,
        pageSize,
        totalPages: 0,
      }
    }

    const totalCount = await acModel.count({ where })
    const rows = await acModel.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    })

    const data: AcLogItem[] = rows.map((row: any) => ({
      id: row.id,
      userEmail: row.userEmail || row.user?.email || null,
      userName: row.user?.fullName || null,
      storeMode: row.storeMode,
      storeCode: row.storeCode,
      storeName: row.storeName,
      branch: row.branch,
      salesArea: Number(row.salesArea),
      maxTemp: Number(row.maxTemp),
      clusterBtu: row.clusterBtu,
      totalBtu: row.totalBtu,
      recommendedUnits: row.recommendedUnits,
      latitude: row.latitude,
      longitude: row.longitude,
      notes: row.notes,
      createdAt: row.createdAt.toISOString(),
    }))

    return {
      data,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    }
  } catch (error) {
    console.error("[getAcCalculatorLogs] Error:", error)
    return {
      data: [],
      totalCount: 0,
      page: 1,
      pageSize,
      totalPages: 0,
    }
  }
}

export async function getLightCalculatorLogs(filters: LightLogFilters = {}) {
  const {
    q = "",
    branch = "all",
    storeMode = "all",
    shapeType = "all",
    standardStatus = "all",
    year = "all",
    month = "all",
    page = 1,
    pageSize = 50,
  } = filters

  const where: any = {}

  if (storeMode !== "all") {
    where.storeMode = storeMode
  }

  if (branch !== "all" && branch.trim() !== "") {
    where.branch = { equals: branch, mode: "insensitive" }
  }

  if (shapeType !== "all" && shapeType.trim() !== "") {
    where.shapeType = shapeType
  }

  if (standardStatus !== "all" && standardStatus.trim() !== "") {
    where.standardStatus = standardStatus
  }

  const dateFilter = getDateRange(year, month)
  if (dateFilter) {
    where.createdAt = dateFilter
  }

  if (q && q.trim() !== "") {
    const query = q.trim()
    where.OR = [
      { storeCode: { contains: query, mode: "insensitive" } },
      { storeName: { contains: query, mode: "insensitive" } },
      { userEmail: { contains: query, mode: "insensitive" } },
      { notes: { contains: query, mode: "insensitive" } },
    ]
  }

  try {
    const lightModel = (prisma as any).lightCalculatorLog
    if (!lightModel) {
      console.warn("[getLightCalculatorLogs] Model lightCalculatorLog belum tersedia di Prisma Client. Jalankan 'npx prisma generate'.")
      return {
        data: [],
        totalCount: 0,
        page: 1,
        pageSize,
        totalPages: 0,
      }
    }

    const totalCount = await lightModel.count({ where })
    const rows = await lightModel.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    })

    const data: LightLogItem[] = rows.map((row: any) => ({
      id: row.id,
      userEmail: row.userEmail || row.user?.email || null,
      userName: row.user?.fullName || null,
      storeMode: row.storeMode,
      storeCode: row.storeCode,
      storeName: row.storeName,
      branch: row.branch,
      salesArea: Number(row.salesArea),
      shapeType: row.shapeType,
      dimensions: row.dimensions,
      lampWatt: Number(row.lampWatt),
      minUnits: row.minUnits,
      maxUnits: row.maxUnits,
      installedUnits: row.installedUnits,
      targetLux: row.targetLux,
      powerRatio: row.powerRatio ? Number(row.powerRatio) : null,
      standardStatus: row.standardStatus,
      notes: row.notes,
      createdAt: row.createdAt.toISOString(),
    }))

    return {
      data,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    }
  } catch (error) {
    console.error("[getLightCalculatorLogs] Error:", error)
    return {
      data: [],
      totalCount: 0,
      page: 1,
      pageSize,
      totalPages: 0,
    }
  }
}

export async function getDistinctCalculatorBranches(): Promise<string[]> {
  try {
    const [acBranches, lightBranches, storeBranches] = await Promise.all([
      (prisma as any).acCalculatorLog
        .findMany({
          select: { branch: true },
          distinct: ["branch"],
          where: { branch: { not: null } },
        })
        .catch(() => []),
      (prisma as any).lightCalculatorLog
        .findMany({
          select: { branch: true },
          distinct: ["branch"],
          where: { branch: { not: null } },
        })
        .catch(() => []),
      prisma.store
        .findMany({
          select: { branch: true },
          distinct: ["branch"],
          where: { branch: { not: null } },
        })
        .catch(() => []),
    ])

    const set = new Set<string>()
    acBranches.forEach((b: any) => b.branch && set.add(b.branch.trim()))
    lightBranches.forEach((b: any) => b.branch && set.add(b.branch.trim()))
    storeBranches.forEach((b: any) => b.branch && set.add(b.branch.trim()))

    return Array.from(set).sort()
  } catch {
    return []
  }
}
