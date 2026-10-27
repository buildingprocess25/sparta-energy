import { IconBolt, IconMapPin, IconTag, IconTool } from "@tabler/icons-react"

import { AdminEquipmentBreakdowns } from "@/components/admin/admin-equipment-breakdowns"
import { AdminEquipmentFilters } from "@/components/admin/admin-equipment-filters"
import { AdminEquipmentTable } from "@/components/admin/admin-equipment-table"
import { AdminMetricCard } from "@/components/admin/admin-metric-card"
import {
  adminEquipmentPageSize,
  getAdminEquipmentAreaBreakdown,
  getAdminEquipmentBranches,
  getAdminEquipmentBrandBreakdown,
  getAdminEquipmentBrands,
  getAdminEquipmentCount,
  getAdminEquipmentRows,
  getAdminEquipmentSummary,
  getAdminEquipmentTypeBreakdown,
  getAdminEquipmentTypes,
  parseAdminEquipmentOrder,
  parseAdminEquipmentSort,
  type AdminEquipmentFilters as AdminEquipmentFiltersValue,
  type EquipmentArea,
} from "@/lib/admin-equipment-queries"

type SearchParams = Promise<{
  q?: string
  branch?: string
  area?: string
  equipment?: string
  brand?: string
  sort?: string
  order?: string
}>

const validAreas = new Set(["PARKING", "TERRACE", "SALES", "WAREHOUSE"])

function getFilter(value: string | undefined) {
  return value?.trim() || "all"
}

function parseArea(value: string | undefined): EquipmentArea | "all" {
  const nextValue = getFilter(value)
  return validAreas.has(nextValue) ? (nextValue as EquipmentArea) : "all"
}

function formatNumber(value: number, suffix = "") {
  return `${new Intl.NumberFormat("id-ID").format(Math.round(value))}${suffix}`
}

function averagePerStore(value: number, storeCount: number) {
  return storeCount > 0 ? value / storeCount : 0
}

export default async function AdminEquipmentPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const filters: AdminEquipmentFiltersValue = {
    q: params.q?.trim() ?? "",
    branch: getFilter(params.branch),
    area: parseArea(params.area),
    equipment: getFilter(params.equipment),
    brand: getFilter(params.brand),
    sort: parseAdminEquipmentSort(params.sort),
    order: parseAdminEquipmentOrder(params.order),
  }

  const branches = await getAdminEquipmentBranches()
  const equipmentTypes = await getAdminEquipmentTypes()
  const brands = await getAdminEquipmentBrands()
  const summary = await getAdminEquipmentSummary(filters)
  const areaBreakdown = await getAdminEquipmentAreaBreakdown(filters)
  const equipmentBreakdown = await getAdminEquipmentTypeBreakdown(filters)
  const brandBreakdown = await getAdminEquipmentBrandBreakdown(filters)
  const totalFilteredRows = await getAdminEquipmentCount(filters)
  const initialResult = await getAdminEquipmentRows({
    filters,
    offset: 0,
    limit: adminEquipmentPageSize,
  })

  const topArea = areaBreakdown[0]?.label ?? "-"
  const topEquipment = equipmentBreakdown[0]?.label ?? "-"
  const topBrand = brandBreakdown[0]?.label ?? "-"
  const avgDailyKwhPerStore = averagePerStore(
    summary.totalDailyKwh,
    summary.auditedStores
  )
  const avgTopAreaKwhPerStore = averagePerStore(
    areaBreakdown[0]?.dailyKwh ?? 0,
    summary.auditedStores
  )
  const avgTopBrandKwhPerStore = averagePerStore(
    brandBreakdown[0]?.dailyKwh ?? 0,
    summary.auditedStores
  )
  const avgTopBrandQtyPerStore = averagePerStore(
    brandBreakdown[0]?.qty ?? 0,
    summary.auditedStores
  )

  return (
    <div className="-mt-4 flex min-h-[calc(100svh-var(--header-height)-1rem)] flex-col md:-mt-6 md:h-[calc(100dvh-var(--header-height)-1.5rem)] md:min-h-0">
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="-mx-4 flex min-h-0 flex-1 flex-col border-y md:-mx-6">
          <div className="grid gap-3 px-4 py-4 md:grid-cols-2 md:px-6 xl:grid-cols-4">
            <AdminMetricCard
              label="Total Equipment Terdata"
              value={formatNumber(summary.totalItems)}
              icon={IconTool}
              tone="info"
              valueClassName="text-xl"
              rows={[
                {
                  label: "Total Qty",
                  value: formatNumber(summary.totalQty),
                },
              ]}
            />
            <AdminMetricCard
              label="Rata-rata Konsumsi"
              value={formatNumber(avgDailyKwhPerStore, " kWh/hari/toko")}
              icon={IconBolt}
              tone="success"
              valueClassName="text-xl"
              rows={[
                {
                  label: "Estimasi Bulanan/Toko",
                  value: formatNumber(avgDailyKwhPerStore * 30, " kWh"),
                },
              ]}
            />
            <AdminMetricCard
              label="Area & Equipment Dominan"
              value={topArea}
              icon={IconMapPin}
              tone="default"
              valueClassName="text-xl"
              rows={[
                { label: "Top Equipment", value: topEquipment },
                {
                  label: "Area kWh/Hari/Toko",
                  value: formatNumber(avgTopAreaKwhPerStore, " kWh"),
                },
              ]}
            />
            <AdminMetricCard
              label="Brand Dominan"
              value={topBrand}
              icon={IconTag}
              tone="default"
              valueClassName="text-xl"
              rows={[
                {
                  label: "Brand kWh/Hari/Toko",
                  value: formatNumber(avgTopBrandKwhPerStore, " kWh"),
                },
                {
                  label: "Qty Brand/Toko",
                  value: formatNumber(avgTopBrandQtyPerStore),
                },
              ]}
            />
          </div>

          <div className="sticky top-(--header-height) z-20 border-y bg-background/90 px-4 py-4 backdrop-blur supports-backdrop-filter:bg-background/75 md:px-6">
            <AdminEquipmentFilters
              branches={branches}
              equipmentTypes={equipmentTypes}
              brands={brands}
            />
          </div>

          <div className="px-4 pb-4 md:px-6">
            <AdminEquipmentBreakdowns
              area={areaBreakdown}
              equipment={equipmentBreakdown}
              brand={brandBreakdown}
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col border-t px-3 md:px-4">
            <div className="py-3 text-xs text-muted-foreground">
              Menampilkan {formatNumber(totalFilteredRows)} equipment sesuai
              filter.
            </div>
            <div className="flex min-h-0 flex-1 flex-col border-t">
              <AdminEquipmentTable
                initialRows={initialResult.rows}
                initialHasMore={initialResult.hasMore}
                totalRows={totalFilteredRows}
                filters={filters}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
