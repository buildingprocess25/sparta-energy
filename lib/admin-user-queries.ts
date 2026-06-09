import { prisma } from "@/lib/prisma"

export type UserRole = "USER" | "ADMIN"
export type AdminUserSortKey =
  | "fullName"
  | "email"
  | "role"
  | "branch"
  | "auditCount"
  | "lastActive"
  | "createdAt"
export type AdminUserSortOrder = "asc" | "desc"

export type AdminUserFilters = {
  q: string
  role: UserRole | "all"
  branch: string
  sort: AdminUserSortKey
  order: AdminUserSortOrder
}

export type AdminUserRow = {
  id: string
  fullName: string | null
  email: string
  role: UserRole
  branch: string | null
  auditCount: number
  createdAt: string
  lastActive: string | null
  emailVerified: boolean | null
  image: string | null
}

type CountRow = {
  total_rows: number | bigint
}

type BranchRow = {
  branch: string
}

type RawAdminUserRow = {
  id: string
  full_name: string | null
  email: string
  role: UserRole
  branch: string | null
  audit_count: number | bigint
  created_at: Date | string
  last_active: Date | string | null
  email_verified: boolean | null
  image: string | null
}

const activeUserWhereSql =
  "u.branch IS NULL OR lower(u.branch) NOT IN ('demo', 'head office')"

export const adminUsersPageSize = 20

export const defaultAdminUserSort: AdminUserSortKey = "createdAt"
export const defaultAdminUserOrder: AdminUserSortOrder = "desc"

export function parseAdminUserSort(
  value: string | null | undefined
): AdminUserSortKey {
  if (
    value === "fullName" ||
    value === "email" ||
    value === "role" ||
    value === "branch" ||
    value === "auditCount" ||
    value === "lastActive" ||
    value === "createdAt"
  ) {
    return value
  }

  return defaultAdminUserSort
}

export function parseAdminUserOrder(
  value: string | null | undefined
): AdminUserSortOrder {
  return value === "asc" || value === "desc" ? value : defaultAdminUserOrder
}

function toAdminUserRow(raw: RawAdminUserRow): AdminUserRow {
  return {
    id: raw.id,
    fullName: raw.full_name,
    email: raw.email,
    role: raw.role,
    branch: raw.branch,
    auditCount: Number(raw.audit_count),
    createdAt: new Date(raw.created_at).toISOString(),
    lastActive: raw.last_active
      ? new Date(raw.last_active).toISOString()
      : null,
    emailVerified: raw.email_verified,
    image: raw.image,
  }
}

function buildWhereClause(filters: AdminUserFilters): string {
  const conditions: string[] = [activeUserWhereSql]

  if (filters.q) {
    const searchTerm = filters.q.toLowerCase().replace(/'/g, "''")
    conditions.push(
      `(lower(u.full_name) LIKE '%${searchTerm}%' OR lower(u.email) LIKE '%${searchTerm}%')`
    )
  }

  if (filters.role !== "all") {
    conditions.push(`u.role = '${filters.role}'`)
  }

  if (filters.branch && filters.branch !== "all") {
    const branches = filters.branch.split(",").map((b) => b.trim().replace(/'/g, "''")).filter(Boolean)
    if (branches.length > 0) {
      conditions.push(`u.branch IN (${branches.map((b) => `'${b}'`).join(", ")})`)
    }
  }

  return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
}

function buildOrderByClause(filters: AdminUserFilters): string {
  const sortMap: Record<AdminUserSortKey, string> = {
    fullName: "u.full_name",
    email: "u.email",
    role: "u.role",
    branch: "u.branch",
    auditCount: "audit_count",
    lastActive: "last_active",
    createdAt: "u.created_at",
  }

  const sortColumn = sortMap[filters.sort] || sortMap[defaultAdminUserSort]
  const direction = filters.order.toUpperCase()
  const nulls = filters.order === "asc" ? "NULLS FIRST" : "NULLS LAST"

  if (filters.sort === "lastActive" || filters.sort === "branch") {
    return `ORDER BY ${sortColumn} ${direction} ${nulls}`
  }

  return `ORDER BY ${sortColumn} ${direction}`
}

export async function getAdminUserCount(
  filters: AdminUserFilters
): Promise<number> {
  const whereClause = buildWhereClause(filters)

  const sql = `
    SELECT COUNT(*) as total_rows
    FROM users u
    ${whereClause}
  `

  const result = await prisma.$queryRawUnsafe<CountRow[]>(sql)
  return Number(result[0]?.total_rows ?? 0)
}

export async function getAdminUserRows(params: {
  filters: AdminUserFilters
  offset: number
  limit: number
}): Promise<{
  rows: AdminUserRow[]
  hasMore: boolean
}> {
  const { filters, offset, limit } = params
  const whereClause = buildWhereClause(filters)
  const orderByClause = buildOrderByClause(filters)

  const sql = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.branch,
      u.email_verified,
      u.image,
      u.created_at,
      last_session.last_active,
      COUNT(a.id) as audit_count
    FROM users u
    LEFT JOIN audits a ON a.auditor_id = u.id AND a.status = 'COMPLETED'
    LEFT JOIN LATERAL (
      SELECT MAX(s.updated_at) AS last_active
      FROM session s
      WHERE s.user_id = u.id
    ) last_session ON TRUE
    ${whereClause}
    GROUP BY u.id, u.full_name, u.email, u.role, u.branch, u.email_verified, u.image, u.created_at, last_session.last_active
    ${orderByClause}
    LIMIT ${limit + 1} OFFSET ${offset}
  `

  const rawRows = await prisma.$queryRawUnsafe<RawAdminUserRow[]>(sql)
  const hasMore = rawRows.length > limit
  const rows = rawRows.slice(0, limit).map(toAdminUserRow)

  return { rows, hasMore }
}

export async function getAdminUserBranches(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT u.branch
    FROM users u
    WHERE u.branch IS NOT NULL
      AND lower(u.branch) NOT IN ('demo', 'head office')
    ORDER BY u.branch ASC
  `

  const result = await prisma.$queryRawUnsafe<BranchRow[]>(sql)
  return result.map((row) => row.branch).filter(Boolean)
}

export async function getAdminUserRoles(): Promise<UserRole[]> {
  return ["USER", "ADMIN"]
}
