import type { Prisma, RecommendationType } from "@prisma/client"

import { getAdminAuditDateWhere } from "@/lib/admin-audit-date-filter"
import { prisma } from "@/lib/prisma"

export type AdminAuditStatus = "hemat" | "boros"
export type AdminAuditRecommendation = RecommendationType

export type AdminAuditFilters = {
  q: string
  branch: string
  auditor: string
  year: string
  month: string
  status: AdminAuditStatus | "all"
  recommendation: AdminAuditRecommendation | "all"
}

export type AdminAuditRow = {
  id: string
  auditDate: string
  isBoros: boolean | null
  actualPln: number | null
  baseline: number | null
  store: {
    code: string
    name: string
    branch: string | null
    type: string
  }
  auditor: {
    id: string
    fullName: string | null
    email: string
  }
  recommendations: Array<{
    type: RecommendationType
    title: string
  }>
}

export type AdminAuditAuditorOption = {
  id: string
  label: string
}

type RawBranchOption = {
  branch: string | null
}

type RawAuditorOption = {
  id: string
  fullName: string | null
  email: string
}

type RawYearOption = {
  year: string
}

const excludedBranchNames = [
  "DEMO",
  "Demo",
  "demo",
  "HEAD OFFICE",
  "Head Office",
  "head office",
]

export const adminAuditsPageSize = 20

const activeStoreFilter: Prisma.StoreWhereInput = {
  OR: [{ branch: null }, { branch: { notIn: excludedBranchNames } }],
}

const activeStoreWhereSql =
  "s.branch IS NULL OR lower(s.branch) NOT IN ('demo', 'head office')"

function addAuditWhereAnd(
  where: Prisma.AuditWhereInput,
  condition: Prisma.AuditWhereInput
) {
  const current = where.AND
  const currentItems = Array.isArray(current)
    ? current
    : current
      ? [current]
      : []

  where.AND = [...currentItems, condition]
}

function getAdminAuditWhere(filters: AdminAuditFilters): Prisma.AuditWhereInput {
  const where: Prisma.AuditWhereInput = {
    status: "COMPLETED",
    store: activeStoreFilter,
  }

  if (filters.q) {
    where.store = {
      AND: [
        activeStoreFilter,
        {
          OR: [
            { code: { contains: filters.q, mode: "insensitive" } },
            { name: { contains: filters.q, mode: "insensitive" } },
          ],
        },
      ],
    }
  }

  if (filters.branch !== "all") {
    where.store = {
      AND: [where.store as Prisma.StoreWhereInput, { branch: filters.branch }],
    }
  }

  if (filters.auditor !== "all") {
    where.auditorId = filters.auditor
  }

  if (filters.status !== "all") {
    where.isBoros = filters.status === "boros"
  }

  if (filters.recommendation !== "all") {
    where.recommendations = {
      some: {
        type: filters.recommendation,
      },
    }
  }

  const dateWhere = getAdminAuditDateWhere(filters.year, filters.month)

  if (dateWhere?.auditDate) {
    where.auditDate = dateWhere.auditDate
  } else if (dateWhere) {
    addAuditWhereAnd(where, dateWhere)
  }

  return where
}

function serializeAudit(row: Awaited<ReturnType<typeof getAdminAuditRowsRaw>>[number]) {
  return {
    id: row.id,
    auditDate: row.auditDate.toISOString(),
    isBoros: row.isBoros,
    actualPln:
      row.avgActualPlnKwhPerMonth === null
        ? null
        : Number(row.avgActualPlnKwhPerMonth),
    baseline:
      row.totalEstimatedKwhPerMonth === null
        ? null
        : Number(row.totalEstimatedKwhPerMonth),
    store: row.store,
    auditor: row.auditor,
    recommendations: row.recommendations.map((item) => ({
      type: item.type,
      title: item.title,
    })),
  } satisfies AdminAuditRow
}

async function getAdminAuditRowsRaw({
  filters,
  offset,
  limit,
}: {
  filters: AdminAuditFilters
  offset: number
  limit: number
}) {
  return prisma.audit.findMany({
    where: getAdminAuditWhere(filters),
    orderBy: [{ auditDate: "desc" }, { createdAt: "desc" }],
    skip: offset,
    take: limit,
    select: {
      id: true,
      auditDate: true,
      isBoros: true,
      totalEstimatedKwhPerMonth: true,
      avgActualPlnKwhPerMonth: true,
      store: {
        select: {
          code: true,
          name: true,
          branch: true,
          type: true,
        },
      },
      auditor: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      recommendations: {
        select: {
          type: true,
          title: true,
        },
      },
    },
  })
}

export async function getAdminAuditRows({
  filters,
  offset,
  limit = adminAuditsPageSize,
}: {
  filters: AdminAuditFilters
  offset: number
  limit?: number
}) {
  const rows = await getAdminAuditRowsRaw({
    filters,
    offset,
    limit: limit + 1,
  })

  return {
    rows: rows.slice(0, limit).map(serializeAudit),
    hasMore: rows.length > limit,
  }
}

export async function getAdminAuditCount(filters: AdminAuditFilters) {
  return prisma.audit.count({
    where: getAdminAuditWhere(filters),
  })
}

export async function getAdminAuditBranches() {
  const rows = await prisma.$queryRawUnsafe<RawBranchOption[]>(`
    SELECT DISTINCT trim(s.branch) AS branch
    FROM stores s
    WHERE s.branch IS NOT NULL
      AND trim(s.branch) <> ''
      AND ${activeStoreWhereSql}
    ORDER BY trim(s.branch) ASC
  `)

  return rows
    .map((row) => row.branch?.trim())
    .filter((item): item is string => Boolean(item))
}

export async function getAdminAuditAuditors() {
  const rows = await prisma.$queryRawUnsafe<RawAuditorOption[]>(`
    SELECT
      u.id,
      u.full_name AS "fullName",
      u.email
    FROM users u
    INNER JOIN audits a ON a.auditor_id = u.id
    INNER JOIN stores s ON s.id = a.store_id
    WHERE a.status = 'COMPLETED'
      AND (${activeStoreWhereSql})
    GROUP BY u.id, u.full_name, u.email
    ORDER BY lower(coalesce(u.full_name, u.email)) ASC, u.email ASC
  `)

  return rows.map((row) => ({
    id: row.id,
    label: row.fullName ? `${row.fullName} (${row.email})` : row.email,
  }))
}

export async function getAdminAuditYears() {
  const rows = await prisma.$queryRawUnsafe<RawYearOption[]>(`
    SELECT DISTINCT extract(year from a.audit_date)::int::text AS year
    FROM audits a
    INNER JOIN stores s ON s.id = a.store_id
    WHERE a.status = 'COMPLETED'
      AND (${activeStoreWhereSql})
    ORDER BY year DESC
  `)

  return rows.map((row) => row.year)
}
