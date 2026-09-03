"use client"

import React, { useState, useTransition, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import * as XLSX from "xlsx"
import {
  IconAirConditioning,
  IconBulb,
  IconDownload,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconX,
  IconBuildingStore,
  IconCalendar,
  IconMapPin,
  IconFileSpreadsheet,
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import type { AcLogItem, LightLogItem } from "@/lib/admin-calculator-queries"

type CalculatorLogsClientProps = {
  acLogs: {
    data: AcLogItem[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
  }
  lightLogs: {
    data: LightLogItem[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
  }
  branches: string[]
  currentTab: "ac" | "light"
  filters: {
    q: string
    branch: string
    storeMode: string
    year: string
    month: string
    page: number
  }
}

const MONTH_OPTIONS = [
  { value: "all", label: "Semua Bulan" },
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
]

function formatDateIndo(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d)
  } catch {
    return dateStr
  }
}

export function CalculatorLogsClient({
  acLogs,
  lightLogs,
  branches,
  currentTab: initialTab,
  filters,
}: CalculatorLogsClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [activeTab, setActiveTab] = useState<"ac" | "light">(initialTab || "ac")
  const [searchQuery, setSearchQuery] = useState(filters.q || "")
  const [selectedBranch, setSelectedBranch] = useState(filters.branch || "all")
  const [selectedStoreMode, setSelectedStoreMode] = useState(filters.storeMode || "all")
  const [selectedYear, setSelectedYear] = useState(filters.year || "all")
  const [selectedMonth, setSelectedMonth] = useState(filters.month || "all")

  // Generate Year options (current year down to 2 years ago)
  const currentYearNum = new Date().getFullYear()
  const yearOptions = useMemo(() => {
    return [
      { value: "all", label: "Semua Tahun" },
      { value: String(currentYearNum), label: String(currentYearNum) },
      { value: String(currentYearNum - 1), label: String(currentYearNum - 1) },
      { value: String(currentYearNum - 2), label: String(currentYearNum - 2) },
    ]
  }, [currentYearNum])

  const applyFilters = (overrides?: Partial<typeof filters> & { tab?: string; page?: number }) => {
    const params = new URLSearchParams()
    const tab = overrides?.tab ?? activeTab
    const q = overrides?.q !== undefined ? overrides.q : searchQuery
    const branch = overrides?.branch !== undefined ? overrides.branch : selectedBranch
    const storeMode = overrides?.storeMode !== undefined ? overrides.storeMode : selectedStoreMode
    const year = overrides?.year !== undefined ? overrides.year : selectedYear
    const month = overrides?.month !== undefined ? overrides.month : selectedMonth
    const page = overrides?.page !== undefined ? overrides.page : 1

    params.set("tab", tab)
    if (q) params.set("q", q)
    if (branch && branch !== "all") params.set("branch", branch)
    if (storeMode && storeMode !== "all") params.set("storeMode", storeMode)
    if (year && year !== "all") params.set("year", year)
    if (month && month !== "all") params.set("month", month)
    if (page > 1) params.set("page", String(page))

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleTabChange = (val: string) => {
    const nextTab = val as "ac" | "light"
    setActiveTab(nextTab)
    applyFilters({ tab: nextTab, page: 1 })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters({ page: 1 })
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedBranch("all")
    setSelectedStoreMode("all")
    setSelectedYear("all")
    setSelectedMonth("all")
    startTransition(() => {
      router.push(`${pathname}?tab=${activeTab}`)
    })
  }

  // ── Export Excel Feature ──
  const handleExportExcel = () => {
    try {
      const isAc = activeTab === "ac"
      const nowStr = new Date().toISOString().slice(0, 10)
      const periodLabel =
        selectedMonth !== "all"
          ? `${MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label}_${selectedYear !== "all" ? selectedYear : currentYearNum}`
          : selectedYear !== "all"
            ? `Tahun_${selectedYear}`
            : "Semua_Periode"

      if (isAc) {
        if (acLogs.data.length === 0) {
          toast.error("Tidak ada data log AC untuk diekspor.")
          return
        }

        const headers = [
          "Waktu (WIB)",
          "User / Auditor",
          "Status Toko",
          "Kode Toko",
          "Nama Toko",
          "Cabang",
          "Luas Sales (m²)",
          "Suhu Max (°C)",
          "Cluster BTU/m²",
          "Total Kebutuhan BTU",
          "Rekomendasi AC (Unit)",
          "Koordinat",
          "Catatan",
        ]

        const rows = acLogs.data.map((item) => [
          formatDateIndo(item.createdAt),
          item.userName ? `${item.userName} (${item.userEmail || "-"})` : item.userEmail || "-",
          item.storeMode === "NEW" ? "Toko Baru" : "Toko Terdaftar",
          item.storeCode || "-",
          item.storeName || "-",
          item.branch || "-",
          item.salesArea,
          item.maxTemp,
          item.clusterBtu,
          item.totalBtu,
          item.recommendedUnits,
          item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : "-",
          item.notes || "-",
        ])

        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

        // Column widths
        ws["!cols"] = [
          { wch: 18 }, // Waktu
          { wch: 26 }, // User
          { wch: 15 }, // Status Toko
          { wch: 12 }, // Kode Toko
          { wch: 28 }, // Nama Toko
          { wch: 16 }, // Cabang
          { wch: 14 }, // Luas Sales
          { wch: 14 }, // Suhu Max
          { wch: 16 }, // Cluster BTU
          { wch: 18 }, // Total BTU
          { wch: 22 }, // Rekomendasi AC
          { wch: 24 }, // Koordinat
          { wch: 28 }, // Catatan
        ]

        XLSX.utils.book_append_sheet(wb, ws, "Log Kalkulator AC")
        XLSX.writeFile(wb, `Log_Kalkulator_AC_${periodLabel}_${nowStr}.xlsx`)
        toast.success("File Excel Log AC berhasil diunduh!")
      } else {
        if (lightLogs.data.length === 0) {
          toast.error("Tidak ada data log Lampu untuk diekspor.")
          return
        }

        const headers = [
          "Waktu (WIB)",
          "User / Auditor",
          "Status Toko",
          "Kode Toko",
          "Nama Toko",
          "Cabang",
          "Luas Sales (m²)",
          "Bentuk Area",
          "Dimensi (P x L)",
          "Daya Lampu (Watt)",
          "Rekomendasi Min (Unit)",
          "Rekomendasi Max (Unit)",
          "Unit Terpasang",
          "Target Lux",
          "Rasio Daya (W/m²)",
          "Status Standar",
          "Catatan",
        ]

        const rows = lightLogs.data.map((item) => [
          formatDateIndo(item.createdAt),
          item.userName ? `${item.userName} (${item.userEmail || "-"})` : item.userEmail || "-",
          item.storeMode === "NEW" ? "Toko Baru" : "Toko Terdaftar",
          item.storeCode || "-",
          item.storeName || "-",
          item.branch || "-",
          item.salesArea,
          item.shapeType || "Simetris",
          item.dimensions || "-",
          item.lampWatt,
          item.minUnits,
          item.maxUnits,
          item.installedUnits,
          item.targetLux || 350,
          item.powerRatio ? Number(item.powerRatio.toFixed(2)) : "-",
          item.standardStatus === "ideal" ? "Ideal" : item.standardStatus === "toleransi" ? "Toleransi" : item.standardStatus || "-",
          item.notes || "-",
        ])

        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

        // Column widths
        ws["!cols"] = [
          { wch: 18 }, // Waktu
          { wch: 26 }, // User
          { wch: 15 }, // Status Toko
          { wch: 12 }, // Kode Toko
          { wch: 28 }, // Nama Toko
          { wch: 16 }, // Cabang
          { wch: 14 }, // Luas Sales
          { wch: 16 }, // Bentuk Area
          { wch: 16 }, // Dimensi
          { wch: 16 }, // Watt
          { wch: 20 }, // Min
          { wch: 20 }, // Max
          { wch: 16 }, // Terpasang
          { wch: 12 }, // Lux
          { wch: 16 }, // Rasio
          { wch: 14 }, // Standar
          { wch: 28 }, // Catatan
        ]

        XLSX.utils.book_append_sheet(wb, ws, "Log Kalkulator Lampu")
        XLSX.writeFile(wb, `Log_Kalkulator_Lampu_${periodLabel}_${nowStr}.xlsx`)
        toast.success("File Excel Log Lampu berhasil diunduh!")
      }
    } catch (err) {
      console.error("[handleExportExcel] Error:", err)
      toast.error("Gagal mengekspor file Excel.")
    }
  }

  // Summary counts
  const currentLogs = activeTab === "ac" ? acLogs : lightLogs
  const newStoreCount = useMemo(() => {
    return currentLogs.data.filter((d) => d.storeMode === "NEW").length
  }, [currentLogs.data])

  const existingStoreCount = useMemo(() => {
    return currentLogs.data.filter((d) => d.storeMode === "EXISTING").length
  }, [currentLogs.data])

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Log Aktivitas Kalkulator
          </h1>
          <p className="text-sm text-muted-foreground">
            Riwayat lengkap perhitungan dan validasi dari Kalkulator AC & Kalkulator Lampu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            disabled={isPending}
            className="h-9 gap-1.5 text-xs"
          >
            <IconRefresh className="size-4" />
            Reset Filter
          </Button>

          <Button
            onClick={handleExportExcel}
            size="sm"
            className="h-9 gap-1.5 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <IconFileSpreadsheet className="size-4" />
            Unduh Excel ({activeTab === "ac" ? "Log AC" : "Log Lampu"})
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60 shadow-xs">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
              {activeTab === "ac" ? (
                <IconAirConditioning className="size-6" />
              ) : (
                <IconBulb className="size-6" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Riwayat ({activeTab === "ac" ? "Kalkulator AC" : "Kalkulator Lampu"})
              </p>
              <p className="text-2xl font-bold text-foreground">
                {currentLogs.totalCount.toLocaleString("id-ID")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
              <IconBuildingStore className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Toko Baru (Halaman Ini)
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {newStoreCount} <span className="text-xs font-normal text-muted-foreground">entri</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <IconBuildingStore className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Toko Terdaftar (Halaman Ini)
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {existingStoreCount} <span className="text-xs font-normal text-muted-foreground">entri</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="grid h-10 w-full grid-cols-2 bg-muted/60 p-1 sm:w-80">
            <TabsTrigger
              value="ac"
              className="gap-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              <IconAirConditioning className="size-4" />
              Kalkulator AC ❄️
            </TabsTrigger>
            <TabsTrigger
              value="light"
              className="gap-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              <IconBulb className="size-4" />
              Kalkulator Lampu 💡
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filter Bar */}
        <Card className="border-border/60 bg-muted/20 shadow-xs">
          <CardContent className="p-4">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
              {/* Search Bar */}
              <div className="relative md:col-span-2">
                <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari toko, kode, auditor, catatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-9 text-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("")
                      applyFilters({ q: "", page: 1 })
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <IconX className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Status Toko Filter */}
              <div>
                <Select
                  value={selectedStoreMode}
                  onValueChange={(val) => {
                    setSelectedStoreMode(val)
                    applyFilters({ storeMode: val, page: 1 })
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Status Toko" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status Toko</SelectItem>
                    <SelectItem value="EXISTING">Toko Terdaftar</SelectItem>
                    <SelectItem value="NEW">Toko Baru</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulan & Tahun Filter */}
              <div className="flex gap-1.5">
                <Select
                  value={selectedMonth}
                  onValueChange={(val) => {
                    setSelectedMonth(val)
                    applyFilters({ month: val, page: 1 })
                  }}
                >
                  <SelectTrigger className="h-9 flex-1 text-xs">
                    <SelectValue placeholder="Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedYear}
                  onValueChange={(val) => {
                    setSelectedYear(val)
                    applyFilters({ year: val, page: 1 })
                  }}
                >
                  <SelectTrigger className="h-9 w-28 text-xs">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y.value} value={y.value}>
                        {y.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cabang Filter */}
              <div>
                <Select
                  value={selectedBranch}
                  onValueChange={(val) => {
                    setSelectedBranch(val)
                    applyFilters({ branch: val, page: 1 })
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Semua Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Cabang</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ── TAB 1: AC CALCULATOR LOGS ── */}
        <TabsContent value="ac" className="space-y-4">
          <Card className="border-border/60 shadow-xs">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/40 font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Waktu</th>
                      <th className="px-4 py-3">User / Auditor</th>
                      <th className="px-4 py-3">Status Toko</th>
                      <th className="px-4 py-3">Kode & Nama Toko</th>
                      <th className="px-4 py-3">Cabang</th>
                      <th className="px-4 py-3 text-right">Luas Sales</th>
                      <th className="px-4 py-3 text-right">Suhu Max</th>
                      <th className="px-4 py-3 text-right">Cluster BTU</th>
                      <th className="px-4 py-3 text-right">Total BTU</th>
                      <th className="px-4 py-3 text-center">Rekomendasi AC</th>
                      <th className="px-4 py-3">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {acLogs.data.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">
                          <IconAirConditioning className="mx-auto mb-2 size-8 opacity-40" />
                          Belum ada log riwayat kalkulator AC yang sesuai dengan filter.
                        </td>
                      </tr>
                    ) : (
                      acLogs.data.map((row) => (
                        <tr key={row.id} className="hover:bg-muted/30">
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                            {formatDateIndo(row.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">
                              {row.userName || row.userEmail || "Tamu"}
                            </div>
                            {row.userName && row.userEmail && (
                              <div className="text-[11px] text-muted-foreground">{row.userEmail}</div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {row.storeMode === "NEW" ? (
                              <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400">
                                Toko Baru
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-900/50 dark:text-blue-300">
                                Terdaftar
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">
                              {row.storeName || "-"}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {row.storeCode || "-"}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                            {row.branch || "-"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-mono">
                            {row.salesArea.toLocaleString("id-ID")} m²
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-mono">
                            {row.maxTemp} °C
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-muted-foreground">
                            {row.clusterBtu.toLocaleString("id-ID")}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-semibold text-blue-600 dark:text-blue-400">
                            {row.totalBtu.toLocaleString("id-ID")} BTU/h
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center rounded-md bg-blue-500/10 px-2.5 py-1 font-bold text-blue-700 dark:text-blue-300">
                              {row.recommendedUnits} Unit
                            </span>
                          </td>
                          <td className="max-w-xs truncate px-4 py-3 text-muted-foreground" title={row.notes || ""}>
                            {row.notes || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: LIGHTING CALCULATOR LOGS ── */}
        <TabsContent value="light" className="space-y-4">
          <Card className="border-border/60 shadow-xs">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/40 font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Waktu</th>
                      <th className="px-4 py-3">User / Auditor</th>
                      <th className="px-4 py-3">Status Toko</th>
                      <th className="px-4 py-3">Kode & Nama Toko</th>
                      <th className="px-4 py-3">Cabang</th>
                      <th className="px-4 py-3 text-right">Luas Sales</th>
                      <th className="px-4 py-3">Bentuk & Dimensi</th>
                      <th className="px-4 py-3 text-center">Watt Lampu</th>
                      <th className="px-4 py-3 text-center">Rentang Rekomendasi</th>
                      <th className="px-4 py-3 text-center">Terpasang (Layout)</th>
                      <th className="px-4 py-3 text-right">Rasio W/m²</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {lightLogs.data.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground">
                          <IconBulb className="mx-auto mb-2 size-8 opacity-40" />
                          Belum ada log riwayat kalkulator Lampu yang sesuai dengan filter.
                        </td>
                      </tr>
                    ) : (
                      lightLogs.data.map((row) => (
                        <tr key={row.id} className="hover:bg-muted/30">
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                            {formatDateIndo(row.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">
                              {row.userName || row.userEmail || "Tamu"}
                            </div>
                            {row.userName && row.userEmail && (
                              <div className="text-[11px] text-muted-foreground">{row.userEmail}</div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {row.storeMode === "NEW" ? (
                              <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400">
                                Toko Baru
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-900/50 dark:text-blue-300">
                                Terdaftar
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">
                              {row.storeName || "-"}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {row.storeCode || "-"}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                            {row.branch || "-"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-mono">
                            {row.salesArea.toLocaleString("id-ID")} m²
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">
                              {row.shapeType || "Simetris"}
                            </div>
                            {row.dimensions && (
                              <div className="text-[11px] text-muted-foreground font-mono">
                                {row.dimensions}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-center font-mono">
                            {row.lampWatt} W
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-center font-mono">
                            {row.minUnits} - {row.maxUnits} Unit
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center rounded-md bg-amber-500/10 px-2.5 py-1 font-bold text-amber-700 dark:text-amber-300">
                              {row.installedUnits} Unit
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-mono">
                            {row.powerRatio ? `${row.powerRatio.toFixed(2)} W/m²` : "-"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            {row.standardStatus === "ideal" ? (
                              <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400">
                                Ideal
                              </Badge>
                            ) : row.standardStatus === "toleransi" ? (
                              <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400">
                                Toleransi
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
