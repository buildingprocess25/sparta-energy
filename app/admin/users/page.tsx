import { AdminUserFilters } from "@/components/admin/admin-user-filters"
import { AdminUsersTable } from "@/components/admin/admin-users-table"
import {
  adminUsersPageSize,
  getAdminUserBranches,
  getAdminUserCount,
  getAdminUserRoles,
  getAdminUserRows,
  parseAdminUserOrder,
  parseAdminUserRole,
  parseAdminUserSort,
  type AdminUserFilters as AdminUserFiltersValue,
  type UserRole,
} from "@/lib/admin-user-queries"

type SearchParams = Promise<{
  q?: string
  role?: string
  branch?: string
  sort?: string
  order?: string
}>

function getFilter(value: string | undefined) {
  return value?.trim() || "all"
}

function formatNumber(value: number | bigint) {
  return new Intl.NumberFormat("id-ID").format(Number(value))
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const filters: AdminUserFiltersValue = {
    q: params.q?.trim() ?? "",
    role: parseAdminUserRole(params.role),
    branch: getFilter(params.branch),
    sort: parseAdminUserSort(params.sort),
    order: parseAdminUserOrder(params.order),
  }

  const [branches, roles, totalFilteredRows, initialResult] = await Promise.all(
    [
      getAdminUserBranches(),
      getAdminUserRoles(),
      getAdminUserCount(filters),
      getAdminUserRows({
        filters,
        offset: 0,
        limit: adminUsersPageSize,
      }),
    ]
  )

  return (
    <div className="-mt-4 flex min-h-[calc(100svh-var(--header-height)-1rem)] flex-col md:-mt-6 md:min-h-[calc(100svh-var(--header-height))]">
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="sticky top-(--header-height) z-20 -mx-4 border-y bg-background/90 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:-mx-6 md:px-6">
          <AdminUserFilters branches={branches} roles={roles} />
        </div>

        <div className="-mx-4 flex min-h-0 flex-1 flex-col border-y px-3 md:-mx-6 md:px-4">
          <div className="py-3 text-xs text-muted-foreground">
            Menampilkan {formatNumber(totalFilteredRows)} user sesuai filter.
          </div>
          <div className="flex min-h-0 flex-1 flex-col border-t">
            <AdminUsersTable
              initialRows={initialResult.rows}
              initialHasMore={initialResult.hasMore}
              totalRows={totalFilteredRows}
              filters={filters}
              branches={branches}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
