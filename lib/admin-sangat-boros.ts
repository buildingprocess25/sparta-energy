import { getAdminGapFilterEnabled } from "@/lib/admin-gap-filter"
import { getAuditGapFilterWhereSql } from "@/lib/audit-gap-filter"
import { prisma } from "@/lib/prisma"

const SANGAT_BOROS_LIMIT = 12

// Raw-SQL twin of sangatBorosIdsSql in audit-validation-queries.ts; the view is
// shared with smart-energy-monitoring and the auditor validation page.
const viewAuditIdsSql = "SELECT audit_id FROM v_toko_sangat_boros"

// Same ranking as the view, but only over kalkulasi inside the gap range. Admin-only,
// so DEMO stores are left out of the ranking instead of being counted then hidden.
function gapFilteredAuditIdsSql(gapClause: string) {
  return `
    SELECT ranked.id FROM (
      SELECT l.id
      FROM (
        SELECT DISTINCT ON (a.store_id) a.id, a.store_id, a.is_boros, a.gap_percent
        FROM audits a
        WHERE a.status = 'COMPLETED' AND ${gapClause}
        ORDER BY a.store_id, a.audit_date DESC, a.created_at DESC
      ) l
      JOIN stores s ON s.id = l.store_id
      WHERE l.is_boros = true
        AND l.gap_percent IS NOT NULL
        AND (s.branch IS NULL OR lower(s.branch) NOT IN ('demo', 'head office'))
      ORDER BY l.gap_percent DESC, l.id
      LIMIT ${SANGAT_BOROS_LIMIT}
    ) ranked
  `
}

// Follows the admin gap toggle: off reads the shared view, on ranks within ±20%.
export async function getSangatBorosAuditIdsSql() {
  const gapClause = getAuditGapFilterWhereSql(
    "a",
    await getAdminGapFilterEnabled()
  )
  return gapClause ? gapFilteredAuditIdsSql(gapClause) : viewAuditIdsSql
}

export async function isAdminSangatBoros(auditId: string) {
  const rows = await prisma.$queryRawUnsafe<{ flag: boolean }[]>(
    `SELECT ($1::uuid IN (${await getSangatBorosAuditIdsSql()})) AS flag`,
    auditId
  )
  return rows[0]?.flag === true
}

export type SangatBorosStore = {
  storeCode: string
  validated: boolean
}

// DEMO rows stay in the view for testing but never count in admin.
export async function getSangatBorosStores(): Promise<SangatBorosStore[]> {
  const rows = await prisma.$queryRawUnsafe<
    { store_code: string; validation_status: string }[]
  >(`
    SELECT s.code AS store_code, a.validation_status::text AS validation_status
    FROM audits a
    JOIN stores s ON s.id = a.store_id
    WHERE a.id IN (${await getSangatBorosAuditIdsSql()})
      AND (s.branch IS NULL OR lower(s.branch) NOT IN ('demo', 'head office'))
    ORDER BY a.gap_percent DESC, a.id
  `)

  return rows.map((row) => ({
    storeCode: row.store_code,
    validated: row.validation_status === "VALIDATED",
  }))
}
