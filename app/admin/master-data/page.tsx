import {
  IconBolt,
  IconBuildingStore,
  IconDatabase,
  IconTag,
  IconTool,
} from "@tabler/icons-react"

import { AdminMasterDataNav } from "@/components/admin/admin-master-data-nav"
import { AdminMasterEquipmentFilters } from "@/components/admin/admin-master-equipment-filters"
import { AdminMasterEquipmentTable } from "@/components/admin/admin-master-equipment-table"
import { AdminMasterStoreFilters } from "@/components/admin/admin-master-store-filters"
import { AdminMasterStoresTable } from "@/components/admin/admin-master-stores-table"
import { AdminMetricCard } from "@/components/admin/admin-metric-card"
import {
  getMasterDataSummary,
  getMasterEquipmentCategories,
  getMasterEquipmentCount,
  getMasterEquipmentRows,
  getMasterEquipmentStoreTypes,
  getMasterStoreBranches,
  getMasterStoreCount,
  getMasterStoreRows,
  getMasterStoreTypes,
  masterEquipmentPageSize,
  masterStoresPageSize,
  parseMasterDataTab,
  parseMasterEquipmentHasBrands,
  parseMasterEquipmentSort,
  parseMasterStoreHours,
  parseMasterStoreSort,
  parseSortOrder,
  type MasterEquipmentFilters,
  type MasterStoreFilters,
} from "@/lib/admin-master-data-queries"

type SearchParams = Promise<{
  tab?: string
  q?: string
  branch?: string
  type?: string
  hours?: string
  category?: string
  storeType?: string
  hasBrands?: string
  sort?: string
  order?: string
}>

const numberFormat = new Intl.NumberFormat("id-ID")

function getFilter(value: string | undefined) {
  return value?.trim() || "all"
}

function formatNumber(value: number, suffix = "") {
  return `${numberFormat.format(Math.round(value * 10) / 10)}${suffix}`
}

export default async function AdminMasterDataPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const activeTab = parseMasterDataTab(params.tab)
  const summary = await getMasterDataSummary()

  const storeFilters: MasterStoreFilters = {
    q: params.q?.trim() ?? "",
    branch: getFilter(params.branch),
    type: getFilter(params.type),
    hours: parseMasterStoreHours(params.hours),
    sort: parseMasterStoreSort(params.sort),
    order: parseSortOrder(params.order),
  }
  const equipmentFilters: MasterEquipmentFilters = {
    q: params.q?.trim() ?? "",
    category: getFilter(params.category),
    storeType: getFilter(params.storeType),
    hasBrands: parseMasterEquipmentHasBrands(params.hasBrands),
    sort: parseMasterEquipmentSort(params.sort),
    order: parseSortOrder(params.order),
  }

  const [storeBranches, storeTypes, equipmentCategories, equipmentStoreTypes] =
    await Promise.all([
      getMasterStoreBranches(),
      getMasterStoreTypes(),
      getMasterEquipmentCategories(),
      getMasterEquipmentStoreTypes(),
    ])

  const storeData =
    activeTab === "stores"
      ? await Promise.all([
          getMasterStoreCount(storeFilters),
          getMasterStoreRows({
            filters: storeFilters,
            offset: 0,
            limit: masterStoresPageSize,
          }),
        ])
      : null
  const equipmentData =
    activeTab === "equipment"
      ? await Promise.all([
          getMasterEquipmentCount(equipmentFilters),
          getMasterEquipmentRows({
            filters: equipmentFilters,
            offset: 0,
            limit: masterEquipmentPageSize,
          }),
        ])
      : null

  return (
    <div className="-mt-4 flex min-h-[calc(100svh-var(--header-height)-1rem)] flex-col md:-mt-6 md:min-h-[calc(100svh-var(--header-height))]">
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="-mx-4 flex min-h-0 flex-1 flex-col border-y md:-mx-6">
          <div className="grid gap-3 px-4 py-4 md:grid-cols-2 md:px-6 xl:grid-cols-4">
            <AdminMetricCard
              label="Master Toko"
              value={formatNumber(summary.totalStores)}
              icon={IconBuildingStore}
              tone="info"
              valueClassName="text-xl"
              rows={[
                { label: "Cabang", value: formatNumber(summary.branches) },
                { label: "Tipe toko", value: formatNumber(summary.storeTypes) },
              ]}
            />
            <AdminMetricCard
              label="Total Daya PLN"
              value={formatNumber(summary.totalPlnPowerVa, " VA")}
              icon={IconBolt}
              tone="default"
              valueClassName="text-xl"
              rows={[
                {
                  label: "Rata-rata/toko",
                  value: formatNumber(
                    summary.totalStores
                      ? summary.totalPlnPowerVa / summary.totalStores
                      : 0,
                    " VA"
                  ),
                },
              ]}
            />
            <AdminMetricCard
              label="Master Equipment"
              value={formatNumber(summary.totalEquipmentTypes)}
              icon={IconTool}
              tone="success"
              valueClassName="text-xl"
              rows={[
                { label: "Kategori", value: formatNumber(summary.categories) },
                { label: "Brand", value: formatNumber(summary.totalBrands) },
              ]}
            />
            <AdminMetricCard
              label="Rata-rata Default kW"
              value={formatNumber(summary.avgDefaultKw)}
              icon={IconTag}
              tone="default"
              valueClassName="text-xl"
              rows={[
                {
                  label: "Brand/equipment",
                  value: formatNumber(
                    summary.totalEquipmentTypes
                      ? summary.totalBrands / summary.totalEquipmentTypes
                      : 0
                  ),
                },
              ]}
            />
          </div>

          <div className="flex flex-col gap-3 border-y bg-background/75 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <IconDatabase className="size-4 text-muted-foreground" />
                Master Data
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Data dasar toko dan equipment yang dipakai oleh flow audit.
              </p>
            </div>
            <AdminMasterDataNav activeTab={activeTab} />
          </div>

          {activeTab === "stores" && storeData ? (
            <>
              <div className="sticky top-(--header-height) z-20 border-b bg-background/90 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-6">
                <AdminMasterStoreFilters
                  branches={storeBranches}
                  storeTypes={storeTypes}
                />
              </div>
              <div className="flex min-h-0 flex-1 flex-col px-3 md:px-4">
                <div className="py-3 text-xs text-muted-foreground">
                  Menampilkan {formatNumber(storeData[0])} master toko sesuai
                  filter.
                </div>
                <div className="flex min-h-0 flex-1 flex-col border-t">
                  <AdminMasterStoresTable
                    initialRows={storeData[1].rows}
                    initialHasMore={storeData[1].hasMore}
                    totalRows={storeData[0]}
                    filters={storeFilters}
                  />
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "equipment" && equipmentData ? (
            <>
              <div className="sticky top-(--header-height) z-20 border-b bg-background/90 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-6">
                <AdminMasterEquipmentFilters
                  categories={equipmentCategories}
                  storeTypes={equipmentStoreTypes}
                />
              </div>
              <div className="flex min-h-0 flex-1 flex-col px-3 md:px-4">
                <div className="py-3 text-xs text-muted-foreground">
                  Menampilkan {formatNumber(equipmentData[0])} master equipment
                  sesuai filter.
                </div>
                <div className="flex min-h-0 flex-1 flex-col border-t">
                  <AdminMasterEquipmentTable
                    initialRows={equipmentData[1].rows}
                    initialHasMore={equipmentData[1].hasMore}
                    totalRows={equipmentData[0]}
                    filters={equipmentFilters}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}
