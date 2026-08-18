import {
  IconBuildingBank,
  IconClipboardList,
  IconFileSpreadsheet,
  IconTool,
} from "@tabler/icons-react"

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
  type AdminReportFilters as AdminReportFiltersValue,
  type AdminReportType,
} from "@/lib/admin-report-queries"

type SearchParams = Promise<{
  year?: string
  month?: string
  branch?: string
  storeType?: string
  status?: string
}>

type ReportCard = {
  report: AdminReportType
  title: string
  description: string
  icon: typeof IconFileSpreadsheet
}

const reportCards: ReportCard[] = [
  {
    report: "store-data",
    title: "Export Toko Bulanan",
    description: "PLN kWh, baseline, cabang, dan tipe toko per audit.",
    icon: IconFileSpreadsheet,
  },
  {
    report: "audit-history",
    title: "Export Riwayat Audit",
    description:
      "Audit selesai lintas toko dengan status, gap, dan rekomendasi.",
    icon: IconClipboardList,
  },
  {
    report: "equipment",
    title: "Export Equipment",
    description: "Daftar equipment audit lengkap dengan area dan estimasi kWh.",
    icon: IconTool,
  },
  {
    report: "branch-summary",
    title: "Export Ringkasan Cabang",
    description: "Coverage, toko hemat/boros, boros rate, dan rata-rata gap.",
    icon: IconBuildingBank,
  },
]

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

function getExportHref(
  report: AdminReportType,
  filters: AdminReportFiltersValue
) {
  const params = new URLSearchParams({ report })

  for (const [key, value] of Object.entries(filters)) {
    if (!value || value === "all") continue
    params.set(key, value)
  }

  return `/admin/reports/export?${params.toString()}`
}

function getPreviewHref(
  report: AdminReportType,
  filters: AdminReportFiltersValue
) {
  const params = new URLSearchParams({ report })

  for (const [key, value] of Object.entries(filters)) {
    if (!value || value === "all") continue
    params.set(key, value)
  }

  return `/admin/reports/preview?${params.toString()}`
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

  const [options, counts] = await Promise.all([
    getAdminReportFilterOptions(),
    getAdminReportCounts(filters),
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
                  <CardContent className="flex items-center justify-between gap-4 border-t pt-4">
                    <span className="text-xs text-muted-foreground">
                      Preview tersedia sebelum download.
                    </span>
                    <AdminReportActions
                      title={item.title}
                      downloadHref={getExportHref(item.report, filters)}
                      previewHref={getPreviewHref(item.report, filters)}
                    />
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
