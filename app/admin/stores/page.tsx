import { AdminStoreFilters } from "@/components/admin/admin-store-filters"
import { AdminStoresTable } from "@/components/admin/admin-stores-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  adminStoresPageSize,
  getAdminStoreBranches,
  getAdminStoreCount,
  getAdminStoreRows,
  getAdminStoreStats,
  getAdminStoreTypes,
  parseAdminStoreSort,
  parseSortOrder,
  type StoreStatus,
} from "@/lib/admin-store-queries"

type SearchParams = Promise<{
  q?: string
  branch?: string
  status?: string
  type?: string
  sort?: string
  order?: string
}>

const numberFormat = new Intl.NumberFormat("id-ID")

function getFilter(value: string | undefined) {
  return value?.trim() || "all"
}

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const filters = {
    q: params.q?.trim() ?? "",
    branch: getFilter(params.branch),
    status: getFilter(params.status) as StoreStatus | "all",
    type: getFilter(params.type),
    sort: parseAdminStoreSort(params.sort),
    order: parseSortOrder(params.order),
  }

  const [stats, branches, storeTypes, totalFilteredRows, initialResult] =
    await Promise.all([
      getAdminStoreStats(),
      getAdminStoreBranches(),
      getAdminStoreTypes(),
      getAdminStoreCount(filters),
      getAdminStoreRows({
        filters,
        offset: 0,
        limit: adminStoresPageSize,
      }),
    ])

  const totalStores = Number(stats.total_stores)
  const auditedStores = Number(stats.audited_stores)
  const hematStores = Number(stats.hemat_stores)
  const borosStores = Number(stats.boros_stores)
  const coverage =
    totalStores > 0 ? Math.round((auditedStores / totalStores) * 1000) / 10 : 0

  return (
    <div className="flex flex-col gap-6">
      <Card className="min-h-0">
        <div className="sticky top-0 z-20 border-y bg-card/95 px-6 py-4 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/80">
          <AdminStoreFilters branches={branches} storeTypes={storeTypes} />
        </div>
        <AdminStoresTable
          initialRows={initialResult.rows}
          initialHasMore={initialResult.hasMore}
          totalRows={totalFilteredRows}
          filters={filters}
        />
      </Card>
    </div>
  )
}
