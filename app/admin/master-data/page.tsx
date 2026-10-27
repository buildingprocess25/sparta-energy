import {
  IconBuildingStore,
  IconDatabase,
  IconTag,
  IconTool,
  IconClock,
  IconCategory,
  IconClipboardCheck,
} from "@tabler/icons-react"

import { AdminMasterDataNav } from "@/components/admin/admin-master-data-nav"
import { AdminMasterEquipmentFilters } from "@/components/admin/admin-master-equipment-filters"
import { AdminMasterEquipmentTable } from "@/components/admin/admin-master-equipment-table"
import { AdminMasterStoreFilters } from "@/components/admin/admin-master-store-filters"
import { AdminMasterStoresTable } from "@/components/admin/admin-master-stores-table"
import { AdminMetricCard } from "@/components/admin/admin-metric-card"
import { AdminMasterCategoriesList } from "@/components/admin/admin-master-categories-list"
import {
  getMasterDataSummary,
  getMasterEquipmentCategories,
  getMasterEquipmentDeviceCategories,
  getMasterEquipmentCount,
  getMasterEquipmentRows,
  getMasterEquipmentStoreTypes,
  getMasterEquipmentTypeOptions,
  getMasterStoreBranches,
  getMasterStoreCount,
  getMasterStoreRows,
  getMasterStoreTypes,
  masterEquipmentPageSize,
  masterStoresPageSize,
  parseMasterDataTab,
  parseMasterEquipmentArea,
  parseMasterEquipmentPowerMode,
  parseMasterEquipmentSort,
  parseMasterStoreHours,
  parseMasterStoreSort,
  parseSortOrder,
  type MasterEquipmentFilters,
  type MasterStoreFilters,
} from "@/lib/admin-master-data-queries"
import { requireUserManager } from "@/lib/admin-auth"

type SearchParams = Promise<{
  tab?: string
  q?: string
  branch?: string
  type?: string
  hours?: string
  deviceCategory?: string
  category?: string
  storeType?: string
  area?: string
  powerMode?: string
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
  await requireUserManager()
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
    deviceCategory: getFilter(params.deviceCategory),
    category: getFilter(params.category),
    storeType: getFilter(params.storeType),
    area: parseMasterEquipmentArea(params.area),
    powerMode: parseMasterEquipmentPowerMode(params.powerMode),
    hasBrands: (params.hasBrands === "with-brands" || params.hasBrands === "without-brands") ? params.hasBrands : "all",
    sort: parseMasterEquipmentSort(params.sort),
    order: parseSortOrder(params.order),
  }

  const [
    storeBranches,
    storeTypes,
    equipmentCategories,
    equipmentDeviceCategories,
    equipmentStoreTypes,
    equipmentTypeOptions,
  ] = await Promise.all([
      getMasterStoreBranches(),
      getMasterStoreTypes(),
      getMasterEquipmentCategories(),
      getMasterEquipmentDeviceCategories(),
      getMasterEquipmentStoreTypes(),
      getMasterEquipmentTypeOptions(),
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
        <div className="-mx-4 flex min-h-0 w-full min-w-0 flex-1 flex-col border-y md:-mx-6">
          <div className="grid gap-3 px-4 py-4 md:grid-cols-2 md:px-6 xl:grid-cols-4">
            <AdminMetricCard
              label="Master Toko"
              value={formatNumber(summary.totalStores)}
              description={`${formatNumber(summary.branches)} Cabang Terdaftar`}
              icon={IconBuildingStore}
              tone="info"
              valueClassName="text-xl"
              rows={[
                { label: "Toko Reguler", value: formatNumber(summary.regularStores) },
                { label: "Toko Beanspot", value: formatNumber(summary.beanspotStores) },
                { label: "Format Lainnya", value: formatNumber(summary.otherStores) },
              ]}
            />
            <AdminMetricCard
              label="Status Kalkulasi Toko"
              value={`${summary.auditPercent}%`}
              description="Toko aktif yang sudah dikalkulasi"
              icon={IconClipboardCheck}
              tone="default"
              valueClassName="text-xl"
              rows={[
                { label: "Kalkulasi Selesai", value: formatNumber(summary.auditedStores, " Toko") },
                { label: "Kalkulasi Draf", value: formatNumber(summary.draftAuditedStores, " Toko") },
                { label: "Belum Dikalkulasi", value: formatNumber(summary.notAuditedStores, " Toko") },
              ]}
            />
            <AdminMetricCard
              label="Master Equipment"
              value={formatNumber(summary.totalBrands, " Merek")}
              description="Merek terdaftar"
              icon={IconTool}
              tone="success"
              valueClassName="text-xl"
              rows={[
                { label: "Tipe Equipment", value: formatNumber(summary.totalEquipmentTypes) },
                { label: "Kategori Equipment", value: formatNumber(summary.categories) },
              ]}
            />
            <AdminMetricCard
              label="Kategori Equipment"
              value={formatNumber(summary.topCategories.length, " Kategori")}
              description="Kategori utama"
              icon={IconCategory}
              tone="default"
              valueClassName="text-xl"
            >
              <AdminMasterCategoriesList categories={summary.topCategories} />
            </AdminMetricCard>
          </div>

          <div className="flex flex-col gap-3 border-y bg-background/75 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <IconDatabase className="size-4 text-muted-foreground" />
                Master Data
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Data dasar toko dan equipment yang dipakai oleh flow kalkulasi.
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
              <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-3 md:px-4">
                <div className="py-3 text-xs text-muted-foreground">
                  Menampilkan {formatNumber(storeData[0])} master toko sesuai
                  filter.
                </div>
                <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col border-t">
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
                  deviceCategories={equipmentDeviceCategories}
                  storeTypes={equipmentStoreTypes}
                  equipmentTypeOptions={equipmentTypeOptions}
                />
              </div>
              <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-3 md:px-4">
                <div className="py-3 text-xs text-muted-foreground">
                  Menampilkan {formatNumber(equipmentData[0])} master equipment
                  sesuai filter.
                </div>
                <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col border-t">
                  <AdminMasterEquipmentTable
                    initialRows={equipmentData[1].rows}
                    initialHasMore={equipmentData[1].hasMore}
                    totalRows={equipmentData[0]}
                    filters={equipmentFilters}
                    equipmentTypeOptions={equipmentTypeOptions}
                    categories={equipmentCategories}
                    deviceCategories={equipmentDeviceCategories}
                    storeTypes={equipmentStoreTypes}
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
