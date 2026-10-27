import {
  IconBuildingBank,
  IconBuildingStore,
  IconClipboardList,
  IconDatabase,
  IconFileSpreadsheet,
  IconTool,
} from "@tabler/icons-react"

import { AdminMasterStoreExportFilter } from "@/components/admin/admin-master-store-export-filter"
import { AdminReportActions } from "@/components/admin/admin-report-actions"
import { AdminReportFilters } from "@/components/admin/admin-report-filters"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getAdminReportFilter,
  getAdminReportCounts,
  getAdminReportFilterOptions,
  parseAdminReportStatus,
  parseMasterStoreExportFilters,
  type AdminReportFilters as AdminReportFiltersValue,
  type AdminReportType,
  type MasterStoreExportFilters,
} from "@/lib/admin-report-queries"
import {
  getMasterStoreBranchCounts,
  getMasterStoreTypes,
} from "@/lib/admin-master-data-queries"

type SearchParams = Promise<{
  year?: string
  month?: string
  branch?: string
  storeType?: string
  status?: string
  mBranch?: string
  mType?: string
  mComplete?: string
  mHours?: string
}>

type ReportCard = {
  report: AdminReportType
  title: string
  description: string
  icon: typeof IconFileSpreadsheet
  // Master data ignores some page filters; say which ones apply
  scope?: string
}

const reportCards: ReportCard[] = [
  {
    report: "store-data",
    title: "Export Toko Bulanan",
    description: "PLN kWh, baseline, cabang, dan tipe toko per kalkulasi.",
    icon: IconFileSpreadsheet,
  },
  {
    report: "audit-history",
    title: "Export Riwayat Kalkulasi",
    description:
      "Kalkulasi selesai lintas toko dengan status, gap, dan rekomendasi.",
    icon: IconClipboardList,
  },
  {
    report: "equipment",
    title: "Export Equipment",
    description: "Daftar equipment kalkulasi lengkap dengan area dan estimasi kWh.",
    icon: IconTool,
  },
  {
    report: "branch-summary",
    title: "Export Ringkasan Cabang",
    description: "Coverage, toko hemat/boros, boros rate, dan rata-rata gap.",
    icon: IconBuildingBank,
  },
  {
    report: "master-stores",
    title: "Export Master Toko",
    description:
      "Data induk toko: cabang, tipe, ID PLN, daya, jam operasional, dan luas tiap area.",
    icon: IconBuildingStore,
  },
  {
    report: "master-equipment",
    title: "Export Master Equipment",
    description:
      "Semua equipment dan brand dengan kategori, area, metode kalkulasi, dan kW.",
    icon: IconDatabase,
    scope: "Selalu berisi semua equipment. Filter tidak berlaku.",
  },
]

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

function getReportParams(
  report: AdminReportType,
  filters: AdminReportFiltersValue,
  master: MasterStoreExportFilters
) {
  const params = new URLSearchParams({ report })

  if (report === "master-stores") {
    if (master.branches.length) params.set("mBranch", master.branches.join(","))
    if (master.types.length) params.set("mType", master.types.join(","))
    if (master.completeness !== "all") params.set("mComplete", master.completeness)
    if (master.hours !== "all") params.set("mHours", master.hours)
    return params
  }

  for (const [key, value] of Object.entries(filters)) {
    if (!value || value === "all") continue
    params.set(key, value)
  }

  return params
}

function getExportHref(
  report: AdminReportType,
  filters: AdminReportFiltersValue,
  master: MasterStoreExportFilters
) {
  return `/admin/reports/export?${getReportParams(report, filters, master)}`
}

function getPreviewHref(
  report: AdminReportType,
  filters: AdminReportFiltersValue,
  master: MasterStoreExportFilters
) {
  return `/admin/reports/preview?${getReportParams(report, filters, master)}`
}

function describeList(items: string[], all: string, unit: string) {
  if (items.length === 0) return all
  if (items.length <= 3) return items.join(", ")
  return `${items.length} ${unit}`
}

function describeMasterStoreScope(master: MasterStoreExportFilters) {
  const parts = [
    describeList(master.branches, "Semua cabang", "cabang"),
    describeList(master.types, "semua tipe", "tipe"),
  ]
  if (master.completeness === "complete") parts.push("data lengkap")
  if (master.completeness === "incomplete") parts.push("data belum lengkap")
  if (master.hours === "24h") parts.push("24 jam")
  if (master.hours === "non-24h") parts.push("non-24 jam")
  return `${parts.join(" · ")}. Dikelompokkan per cabang.`
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const filters: AdminReportFiltersValue = {
    year: getAdminReportFilter(params.year),
    month: getAdminReportFilter(params.month),
    branch: getAdminReportFilter(params.branch),
    storeType: getAdminReportFilter(params.storeType),
    status: parseAdminReportStatus(params.status),
  }

  const master = parseMasterStoreExportFilters((key) => params[key])

  const [options, counts, masterBranches, masterStoreTypes] = await Promise.all([
    getAdminReportFilterOptions(),
    getAdminReportCounts(filters, master),
    getMasterStoreBranchCounts(),
    getMasterStoreTypes(),
  ])

  return (
    <div className="-mt-4 flex min-h-[calc(100svh-var(--header-height)-1rem)] flex-col md:-mt-6 md:min-h-[calc(100svh-var(--header-height))]">
      <section className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="-mx-4 border-y bg-background/60 px-4 py-3 md:-mx-6 md:px-6">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 shrink-0">
              <div className="text-xs font-medium">Scope export</div>
              <div className="text-xs text-muted-foreground">
                Mengikuti filter aktif. Tanpa periode, default YTD{" "}
                {new Date().getFullYear()}.
              </div>
            </div>
            <div className="min-w-0 lg:ml-auto">
              <AdminReportFilters
                branches={options.branches}
                storeTypes={options.storeTypes}
                years={options.years}
              />
            </div>
          </div>
        </div>

        <div className="-mx-4 flex min-h-0 flex-1 flex-col px-4 md:-mx-6 md:px-6">
          <div className="grid gap-4 xl:grid-cols-2">
            {reportCards.map((item) => {
              const Icon = item.icon

              return (
                <Card key={item.report} size="sm" className="overflow-hidden">
                  <CardHeader>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                    <CardAction>
                      <Badge variant="outline">
                        {formatNumber(counts[item.report])} baris
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                    <span className="min-w-0 flex-1 basis-48 text-xs text-muted-foreground">
                      {item.report === "master-stores"
                        ? describeMasterStoreScope(master)
                        : (item.scope ?? "Preview tersedia sebelum download.")}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.report === "master-stores" && (
                        <AdminMasterStoreExportFilter
                          branches={masterBranches.flatMap((row) =>
                            row.branch ? [{ branch: row.branch, count: row.count }] : []
                          )}
                          storeTypes={masterStoreTypes}
                          value={master}
                        />
                      )}
                      <AdminReportActions
                        title={item.title}
                        downloadHref={getExportHref(item.report, filters, master)}
                        previewHref={getPreviewHref(item.report, filters, master)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
