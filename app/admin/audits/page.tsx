import { AdminAuditFilters } from "@/components/admin/admin-audit-filters"
import { AdminAuditsTable } from "@/components/admin/admin-audits-table"
import {
  adminAuditsPageSize,
  getAdminAuditAuditors,
  getAdminAuditBranches,
  getAdminAuditCount,
  getAdminAuditRows,
  getAdminAuditYears,
  parseAdminAuditOrder,
  parseAdminAuditSort,
  type AdminAuditRecommendation,
  type AdminAuditFilters as AdminAuditFiltersValue,
  type AdminAuditStatus,
} from "@/lib/admin-audit-queries"

type SearchParams = Promise<{
  q?: string
  branch?: string
  auditor?: string
  year?: string
  month?: string
  status?: string
  recommendation?: string
  sort?: string
  order?: string
}>

function getFilter(value: string | undefined) {
  return value?.trim() || "all"
}

function parseStatus(value: string | undefined): AdminAuditStatus | "all" {
  return value === "hemat" || value === "boros" ? value : "all"
}

function parseRecommendation(
  value: string | undefined
): AdminAuditRecommendation | "all" {
  if (value === "TRAINING" || value === "REPAIR" || value === "MAINTENANCE") {
    return value
  }

  return "all"
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

export default async function AdminAuditsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const filters: AdminAuditFiltersValue = {
    q: params.q?.trim() ?? "",
    branch: getFilter(params.branch),
    auditor: getFilter(params.auditor),
    year: getFilter(params.year),
    month: getFilter(params.month),
    status: parseStatus(params.status),
    recommendation: parseRecommendation(params.recommendation),
    sort: parseAdminAuditSort(params.sort),
    order: parseAdminAuditOrder(params.order),
  }

  const branches = await getAdminAuditBranches()
  const auditors = await getAdminAuditAuditors()
  const years = await getAdminAuditYears()
  const totalFilteredRows = await getAdminAuditCount(filters)
  const initialResult = await getAdminAuditRows({
    filters,
    offset: 0,
    limit: adminAuditsPageSize,
  })

  return (
    <div className="-mt-4 flex min-h-[calc(100svh-var(--header-height)-1rem)] flex-col md:-mt-6 md:min-h-[calc(100svh-var(--header-height))]">
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="sticky top-(--header-height) z-20 -mx-4 border-y bg-background/90 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:-mx-6 md:px-6">
          <AdminAuditFilters
            branches={branches}
            auditors={auditors}
            years={years}
          />
        </div>

        <div className="-mx-4 flex min-h-0 flex-1 flex-col border-y px-3 md:-mx-6 md:px-4">
          <div className="py-3 text-xs text-muted-foreground">
            Menampilkan {formatNumber(totalFilteredRows)} audit sesuai filter.
          </div>
          <div className="flex min-h-0 flex-1 flex-col border-t">
            <AdminAuditsTable
              initialRows={initialResult.rows}
              initialHasMore={initialResult.hasMore}
              totalRows={totalFilteredRows}
              filters={filters}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
