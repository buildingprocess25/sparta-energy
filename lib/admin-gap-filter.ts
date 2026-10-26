import { cookies } from "next/headers"
import { cache } from "react"

import {
  ADMIN_GAP_FILTER_COOKIE,
  AUDIT_GAP_FILTER,
  getAuditGapFilterWhereSql,
} from "@/lib/audit-gap-filter"
import { prisma } from "@/lib/prisma"

const activeStoreWhereSql =
  "s.branch IS NULL OR lower(s.branch) NOT IN ('demo', 'head office')"

export const getAdminGapFilterEnabled = cache(async () => {
  const value = (await cookies()).get(ADMIN_GAP_FILTER_COOKIE)?.value
  if (value === "on") return true
  if (value === "off") return false
  return AUDIT_GAP_FILTER.enabled
})

export async function getAdminGapFilterSql(auditAlias = "a") {
  return getAuditGapFilterWhereSql(auditAlias, await getAdminGapFilterEnabled())
}

// Completed kalkulasi that the filter hides from admin views right now.
export async function getAdminGapHiddenCount() {
  const gapClause = getAuditGapFilterWhereSql("a", true)
  const rows = await prisma.$queryRawUnsafe<{ count: number }[]>(`
    SELECT COUNT(*)::int AS count
    FROM audits a
    JOIN stores s ON s.id = a.store_id
    WHERE a.status = 'COMPLETED'
      AND (${activeStoreWhereSql})
      AND NOT COALESCE(${gapClause}, false)
  `)
  return rows[0]?.count ?? 0
}
