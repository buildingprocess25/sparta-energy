import { requireAdmin } from "@/lib/admin-auth"
import {
  getAcCalculatorLogs,
  getLightCalculatorLogs,
  getDistinctCalculatorBranches,
  type CalculatorStoreModeFilter,
} from "@/lib/admin-calculator-queries"
import { CalculatorLogsClient } from "@/components/admin/calculator-logs-client"

type SearchParams = Promise<{
  tab?: string
  q?: string
  branch?: string
  storeMode?: string
  year?: string
  month?: string
  page?: string
}>

export const metadata = {
  title: "Log Aktivitas Kalkulator | Admin Sparta Energy",
  description: "Riwayat kalkulasi AC dan Lampu, filter data, dan unduh laporan.",
}

export default async function CalculatorLogsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  await requireAdmin()

  const params = await searchParams
  const activeTab = params.tab === "light" ? "light" : "ac"
  const q = params.q?.trim() || ""
  const branch = params.branch?.trim() || "all"
  const storeMode = (params.storeMode?.trim() || "all") as CalculatorStoreModeFilter
  const year = params.year?.trim() || "all"
  const month = params.month?.trim() || "all"
  const page = parseInt(params.page || "1", 10) || 1

  const [acLogs, lightLogs, branches] = await Promise.all([
    getAcCalculatorLogs({
      q,
      branch,
      storeMode,
      year,
      month,
      page,
      pageSize: 100,
    }),
    getLightCalculatorLogs({
      q,
      branch,
      storeMode,
      year,
      month,
      page,
      pageSize: 100,
    }),
    getDistinctCalculatorBranches(),
  ])

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <CalculatorLogsClient
        acLogs={acLogs}
        lightLogs={lightLogs}
        branches={branches}
        currentTab={activeTab}
        filters={{
          q,
          branch,
          storeMode,
          year,
          month,
          page,
        }}
      />
    </div>
  )
}
