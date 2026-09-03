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

function applyDateFilter(where: any, year?: string, month?: string) {
  let monthList: number[] = []
  if (month && month !== "all" && month.trim() !== "") {
    monthList = month
      .split(",")
      .map((m) => parseInt(m.trim(), 10))
      .filter((m) => !isNaN(m) && m >= 1 && m <= 12)
  }

  const currentYear = new Date().getFullYear()
  const isYearSelected = Boolean(year && year !== "all" && !isNaN(parseInt(year!, 10)))
  const targetYear = isYearSelected ? parseInt(year!, 10) : currentYear

  // If no month selected and year is "all", show all
  if (monthList.length === 0 && (!year || year === "all")) {
    return
  }

  // If no month selected, but specific year is selected
  if (monthList.length === 0 && isYearSelected) {
    where.createdAt = {
      gte: new Date(Date.UTC(targetYear, 0, 1, 0, 0, 0)),
      lte: new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59, 999)),
    }
    return
  }

  // If month(s) are selected (whether year is selected or "all")
  const yearsToQuery = isYearSelected ? [targetYear] : [currentYear, currentYear - 1, currentYear - 2]
  const dateRanges: { createdAt: { gte: Date; lte: Date } }[] = []

  for (const y of yearsToQuery) {
    for (const m of monthList) {
      const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0))
      // Last day of month m
      const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999))
      dateRanges.push({ createdAt: { gte: start, lte: end } })
    }
  }

  if (dateRanges.length === 1) {
    where.createdAt = dateRanges[0].createdAt
  } else if (dateRanges.length > 1) {
    if (!where.AND) where.AND = []
    where.AND.push({ OR: dateRanges })
  }
}

function applyBranchFilter(where: any, branch?: string) {
  if (!branch || branch === "all" || branch.trim() === "") return

  const branchList = branch
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean)

  if (branchList.length === 1) {
    where.branch = { equals: branchList[0], mode: "insensitive" }
  } else if (branchList.length > 1) {
    where.branch = { in: branchList, mode: "insensitive" }
  }
}

function applySearchFilter(where: any, q?: string) {
  if (!q || q.trim() === "") return
  const query = q.trim()
  const searchConditions = [
    { storeCode: { contains: query, mode: "insensitive" } },
    { storeName: { contains: query, mode: "insensitive" } },
    { userEmail: { contains: query, mode: "insensitive" } },
    { notes: { contains: query, mode: "insensitive" } },
  ]
  if (!where.AND) where.AND = []
  where.AND.push({ OR: searchConditions })
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

  applyBranchFilter(where, branch)
  applyDateFilter(where, year, month)
  applySearchFilter(where, q)

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

  applyBranchFilter(where, branch)
  applyDateFilter(where, year, month)
  applySearchFilter(where, q)

  if (shapeType !== "all" && shapeType.trim() !== "") {
    where.shapeType = shapeType
  }

  if (standardStatus !== "all" && standardStatus.trim() !== "") {
    where.standardStatus = standardStatus
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
