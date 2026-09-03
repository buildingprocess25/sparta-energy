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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
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
  
  // Multi-select Branches state
  const initialBranches = useMemo(() => {
    if (!filters.branch || filters.branch === "all") return []
    return filters.branch.split(",").map(b => b.trim()).filter(Boolean)
  }, [filters.branch])
  const [selectedBranches, setSelectedBranches] = useState<string[]>(initialBranches)
  const [branchSearch, setBranchSearch] = useState("")

  // Multi-select Months state
  const initialMonths = useMemo(() => {
    if (!filters.month || filters.month === "all") return []
    return filters.month.split(",").map(m => m.trim()).filter(Boolean)
  }, [filters.month])
  const [selectedMonths, setSelectedMonths] = useState<string[]>(initialMonths)

  const [selectedStoreMode, setSelectedStoreMode] = useState(filters.storeMode || "all")
  const [selectedYear, setSelectedYear] = useState(filters.year || "all")

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

  const applyFilters = (overrides?: Partial<typeof filters> & { tab?: string; page?: number; branchList?: string[]; monthList?: string[] }) => {
    const params = new URLSearchParams()
    const tab = overrides?.tab ?? activeTab
    const q = overrides?.q !== undefined ? overrides.q : searchQuery
    
    const branchArr = overrides?.branchList !== undefined ? overrides.branchList : selectedBranches
    const branchVal = overrides?.branch !== undefined 
      ? overrides.branch 
      : (branchArr.length > 0 ? branchArr.join(",") : "all")

    const storeMode = overrides?.storeMode !== undefined ? overrides.storeMode : selectedStoreMode
    const year = overrides?.year !== undefined ? overrides.year : selectedYear

    const monthArr = overrides?.monthList !== undefined ? overrides.monthList : selectedMonths
    const monthVal = overrides?.month !== undefined 
      ? overrides.month 
      : (monthArr.length > 0 ? monthArr.join(",") : "all")

    const page = overrides?.page !== undefined ? overrides.page : 1

    params.set("tab", tab)
    if (q) params.set("q", q)
    if (branchVal && branchVal !== "all") params.set("branch", branchVal)
    if (storeMode && storeMode !== "all") params.set("storeMode", storeMode)
    if (year && year !== "all") params.set("year", year)
    if (monthVal && monthVal !== "all") params.set("month", monthVal)
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
    setSelectedBranches([])
    setSelectedMonths([])
    setSelectedStoreMode("all")
    setSelectedYear("all")
    startTransition(() => {
      router.push(`${pathname}?tab=${activeTab}`)
    })
  }

  // Branch multi-select handlers
  const handleToggleBranch = (bName: string) => {
    const next = selectedBranches.includes(bName)
      ? selectedBranches.filter((b) => b !== bName)
      : [...selectedBranches, bName]
    setSelectedBranches(next)
    applyFilters({ branchList: next, page: 1 })
  }

  const handleSelectAllBranches = () => {
    setSelectedBranches(branches)
    applyFilters({ branchList: branches, page: 1 })
  }

  const handleClearBranches = () => {
    setSelectedBranches([])
    applyFilters({ branchList: [], page: 1 })
  }

  const filteredBranches = useMemo(() => {
    if (!branchSearch.trim()) return branches
    return branches.filter((b) => b.toLowerCase().includes(branchSearch.toLowerCase()))
  }, [branches, branchSearch])

  const branchTriggerLabel = useMemo(() => {
    if (selectedBranches.length === 0 || selectedBranches.length === branches.length) {
      return "Semua Cabang"
    }
    if (selectedBranches.length === 1) {
      return selectedBranches[0]
    }
    return `${selectedBranches.length} Cabang Terpilih`
  }, [selectedBranches, branches])

  // Month multi-select handlers
  const handleToggleMonth = (mVal: string) => {
    const next = selectedMonths.includes(mVal)
      ? selectedMonths.filter((m) => m !== mVal)
      : [...selectedMonths, mVal].sort((a, b) => parseInt(a) - parseInt(b))
    setSelectedMonths(next)
    applyFilters({ monthList: next, page: 1 })
  }

  const handleSelectQuarter = (qMonths: string[]) => {
    setSelectedMonths(qMonths)
    applyFilters({ monthList: qMonths, page: 1 })
  }

  const handleSelectAllMonths = () => {
    const allM = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
    setSelectedMonths(allM)
    applyFilters({ monthList: allM, page: 1 })
  }

  const handleClearMonths = () => {
    setSelectedMonths([])
    applyFilters({ monthList: [], page: 1 })
  }

  const monthTriggerLabel = useMemo(() => {
    if (selectedMonths.length === 0 || selectedMonths.length === 12) {
      return "Semua Bulan"
    }
    if (selectedMonths.length === 1) {
      const found = MONTH_OPTIONS.find((m) => m.value === selectedMonths[0])
      return found ? found.label : "1 Bulan"
    }
    if (selectedMonths.length <= 2) {
      return selectedMonths
        .map((m) => MONTH_OPTIONS.find((opt) => opt.value === m)?.label.slice(0, 3))
        .join(", ")
    }
    return `${selectedMonths.length} Bulan Terpilih`
  }, [selectedMonths])

  // Check if any filter is currently applied
  const isFilterActive = useMemo(() => {
    return (
      Boolean(searchQuery.trim()) ||
      selectedStoreMode !== "all" ||
      selectedYear !== "all" ||
      selectedMonths.length > 0 ||
      selectedBranches.length > 0
    )
  }, [searchQuery, selectedStoreMode, selectedYear, selectedMonths, selectedBranches])

  // ── Export Excel Feature (supports filtered vs all) ──
  const handleExportExcel = (exportMode: "filtered" | "all" = "filtered") => {
    try {
      const isAc = activeTab === "ac"
      const nowStr = new Date().toISOString().slice(0, 10)
      const isFilteredExport = exportMode === "filtered" && isFilterActive

      const periodLabel = isFilteredExport
        ? (selectedMonths.length > 0
            ? `Bulan_${selectedMonths.join("-")}_${selectedYear !== "all" ? selectedYear : currentYearNum}_Terfilter`
            : selectedYear !== "all"
              ? `Tahun_${selectedYear}_Terfilter`
              : "Data_Terfilter")
        : (selectedYear !== "all" ? `Tahun_${selectedYear}_Semua` : "Semua_Riwayat")

      if (isAc) {
        const sourceData = acLogs.data
        if (sourceData.length === 0) {
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

        const rows = sourceData.map((item) => [
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
        toast.success(`File Excel Log AC berhasil diunduh (${rows.length} baris ${isFilteredExport ? "sesuai filter" : ""})!`)
      } else {
        const sourceData = lightLogs.data
        if (sourceData.length === 0) {
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

        const rows = sourceData.map((item) => [
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
        toast.success(`File Excel Log Lampu berhasil diunduh (${rows.length} baris ${isFilteredExport ? "sesuai filter" : ""})!`)
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

          {/* Export Dropdown with Transparent Filter Clarity */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="h-9 gap-2 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <IconFileSpreadsheet className="size-4" />
                <span>
                  Unduh Excel ({currentLogs.data.length} Data{isFilterActive ? " Terfilter" : ""})
                </span>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-white/20 text-white font-bold">
                  {isFilterActive ? "Filter Aktif" : "Semua"}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2">
              <DropdownMenuLabel className="text-xs font-bold text-muted-foreground px-2 py-1">
                Pilihan Ekspor Excel ({activeTab === "ac" ? "Log AC" : "Log Lampu"})
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleExportExcel("filtered")}
                className="flex flex-col items-start gap-0.5 p-2.5 cursor-pointer rounded-lg focus:bg-emerald-50 dark:focus:bg-emerald-950/40"
              >
                <div className="flex items-center justify-between w-full font-semibold text-xs text-foreground">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <IconFilter className="size-3.5" />
                    Unduh Sesuai Filter Saat Ini
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {currentLogs.data.length} Data
                  </Badge>
                </div>
                <p className="text-[10.5px] text-muted-foreground">
                  Hanya mengunduh data yang cocok dengan cabang, bulan, dan pencarian yang aktif.
                </p>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExportExcel("all")}
                className="flex flex-col items-start gap-0.5 p-2.5 cursor-pointer rounded-lg mt-1 focus:bg-muted"
              >
                <div className="flex items-center justify-between w-full font-semibold text-xs text-foreground">
                  <span className="flex items-center gap-1.5">
                    <IconDownload className="size-3.5" />
                    Unduh Semua Riwayat Halaman
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {currentLogs.totalCount} Total
                  </Badge>
                </div>
                <p className="text-[10.5px] text-muted-foreground">
                  Mengunduh seluruh log tanpa terikat batasan filter saat ini.
                </p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {/* Search Bar */}
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari toko, kode, auditor..."
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

              {/* Multi-Select Cabang Filter */}
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      type="button"
                      className="h-9 w-full justify-between px-3 text-xs font-normal border-input bg-background hover:bg-muted/50"
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <IconMapPin className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{branchTriggerLabel}</span>
                      </span>
                      {selectedBranches.length > 0 && selectedBranches.length < branches.length ? (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold shrink-0 bg-primary/10 text-primary">
                          {selectedBranches.length}
                        </Badge>
                      ) : null}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3 space-y-2.5" align="start">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold text-foreground">Filter Cabang</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={handleSelectAllBranches}
                          className="text-[10px] text-primary hover:underline font-medium"
                        >
                          Pilih Semua
                        </button>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <button
                          type="button"
                          onClick={handleClearBranches}
                          className="text-[10px] text-muted-foreground hover:underline"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <Input
                      placeholder="Cari cabang..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      className="h-8 text-xs"
                    />

                    <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {filteredBranches.length === 0 ? (
                        <p className="text-center py-4 text-xs text-muted-foreground">Cabang tidak ditemukan.</p>
                      ) : (
                        filteredBranches.map((b) => {
                          const isChecked = selectedBranches.includes(b)
                          return (
                            <label
                              key={b}
                              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/60 cursor-pointer text-xs select-none transition-colors"
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => handleToggleBranch(b)}
                              />
                              <span className={`truncate ${isChecked ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                {b}
                              </span>
                            </label>
                          )
                        })
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Multi-Select Bulan Filter */}
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      type="button"
                      className="h-9 w-full justify-between px-3 text-xs font-normal border-input bg-background hover:bg-muted/50"
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <IconCalendar className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{monthTriggerLabel}</span>
                      </span>
                      {selectedMonths.length > 0 && selectedMonths.length < 12 ? (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold shrink-0 bg-primary/10 text-primary">
                          {selectedMonths.length}
                        </Badge>
                      ) : null}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3 space-y-3" align="start">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold text-foreground">Filter Bulan</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={handleSelectAllMonths}
                          className="text-[10px] text-primary hover:underline font-medium"
                        >
                          Semua
                        </button>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <button
                          type="button"
                          onClick={handleClearMonths}
                          className="text-[10px] text-muted-foreground hover:underline"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Kuartal Shortcuts */}
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        type="button"
                        onClick={() => handleSelectQuarter(["1", "2", "3"])}
                        className="rounded-md border border-border/70 py-1 text-[10px] font-semibold hover:bg-muted text-center transition-colors"
                      >
                        Q1 (Jan-Mar)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectQuarter(["4", "5", "6"])}
                        className="rounded-md border border-border/70 py-1 text-[10px] font-semibold hover:bg-muted text-center transition-colors"
                      >
                        Q2 (Apr-Jun)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectQuarter(["7", "8", "9"])}
                        className="rounded-md border border-border/70 py-1 text-[10px] font-semibold hover:bg-muted text-center transition-colors"
                      >
                        Q3 (Jul-Sep)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectQuarter(["10", "11", "12"])}
                        className="rounded-md border border-border/70 py-1 text-[10px] font-semibold hover:bg-muted text-center transition-colors"
                      >
                        Q4 (Okt-Des)
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1 max-h-52 overflow-y-auto pr-1">
                      {MONTH_OPTIONS.filter((m) => m.value !== "all").map((m) => {
                        const isChecked = selectedMonths.includes(m.value)
                        return (
                          <label
                            key={m.value}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/60 cursor-pointer text-xs select-none transition-colors"
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => handleToggleMonth(m.value)}
                            />
                            <span className={isChecked ? "font-semibold text-foreground" : "text-muted-foreground"}>
                              {m.label}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Tahun Filter */}
              <div>
                <Select
                  value={selectedYear}
                  onValueChange={(val) => {
                    setSelectedYear(val)
                    applyFilters({ year: val, page: 1 })
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
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
            </form>
          </CardContent>
        </Card>

        {/* Active Filter Transparency Banner */}
        {isFilterActive && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <IconFilter className="size-3.5 text-primary" />
                Filter Aktif:
              </span>
              {searchQuery && (
                <Badge variant="secondary" className="text-[10px] gap-1 font-medium bg-background border border-border">
                  Cari: &ldquo;{searchQuery}&rdquo;
                </Badge>
              )}
              {selectedStoreMode !== "all" && (
                <Badge variant="secondary" className="text-[10px] font-medium bg-background border border-border">
                  Status: {selectedStoreMode === "NEW" ? "Toko Baru" : "Toko Terdaftar"}
                </Badge>
              )}
              {selectedBranches.length > 0 && (
                <Badge variant="secondary" className="text-[10px] font-medium bg-background border border-border">
                  Cabang: {selectedBranches.slice(0, 2).join(", ")}{selectedBranches.length > 2 ? ` +${selectedBranches.length - 2}` : ""}
                </Badge>
              )}
              {selectedMonths.length > 0 && (
                <Badge variant="secondary" className="text-[10px] font-medium bg-background border border-border">
                  Bulan: {selectedMonths.map(m => MONTH_OPTIONS.find(opt => opt.value === m)?.label.slice(0, 3)).join(", ")}
                </Badge>
              )}
              {selectedYear !== "all" && (
                <Badge variant="secondary" className="text-[10px] font-medium bg-background border border-border">
                  Tahun: {selectedYear}
                </Badge>
              )}
              <span className="text-muted-foreground ml-1">
                (Menampilkan <b>{currentLogs.data.length}</b> dari <b>{currentLogs.totalCount}</b> data)
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              Hapus Filter
            </Button>
          </div>
        )}

        {/* ── TAB 1: AC CALCULATOR LOGS ── */}
        <TabsContent value="ac" className="space-y-4">
          <Card className="border-border/60 shadow-xs overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[960px]">
                  <thead className="border-b bg-muted/50 font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3.5 w-44">Waktu & Auditor</th>
                      <th className="px-4 py-3.5 min-w-[220px]">Toko & Cabang</th>
                      <th className="px-4 py-3.5 text-left w-40">Luas & Suhu Max</th>
                      <th className="px-4 py-3.5 text-left w-48">Kebutuhan Beban BTU</th>
                      <th className="px-4 py-3.5 text-center w-36">Rekomendasi AC</th>
                      <th className="px-4 py-3.5 min-w-[160px]">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {acLogs.data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                          <IconAirConditioning className="mx-auto mb-2 size-8 opacity-40" />
                          Belum ada log riwayat kalkulator AC yang sesuai dengan filter.
                        </td>
                      </tr>
                    ) : (
                      acLogs.data.map((row) => (
                        <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                          {/* Waktu & Auditor */}
                          <td className="px-4 py-3 align-top">
                            <div className="font-semibold text-foreground whitespace-nowrap">
                              {formatDateIndo(row.createdAt)}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate max-w-[160px] mt-0.5" title={row.userEmail || ""}>
                              {row.userName || row.userEmail || "Tamu / Belum Login"}
                            </div>
                          </td>

                          {/* Toko & Cabang */}
                          <td className="px-4 py-3 align-top">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground text-sm">
                                {row.storeName || "Toko Tanpa Nama"}
                              </span>
                              {row.storeMode === "NEW" ? (
                                <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400 text-[10px] px-1.5 py-0 h-4">
                                  Toko Baru
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-900/50 dark:text-blue-300 text-[10px] px-1.5 py-0 h-4">
                                  Terdaftar
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              {row.storeCode && <span className="font-mono">{row.storeCode}</span>}
                              {row.storeCode && row.branch && <span>•</span>}
                              {row.branch && <span>{row.branch}</span>}
                            </div>
                          </td>

                          {/* Luas & Suhu */}
                          <td className="px-4 py-3 text-left align-top">
                            <div className="font-bold text-foreground font-mono text-sm">
                              {row.salesArea.toLocaleString("id-ID")} m²
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              Suhu: <span className="font-semibold text-foreground">{row.maxTemp}°C</span>
                            </div>
                          </td>

                          {/* Beban BTU */}
                          <td className="px-4 py-3 text-left align-top">
                            <div className="font-bold text-blue-600 dark:text-blue-400 font-mono text-sm">
                              {row.totalBtu.toLocaleString("id-ID")} <span className="text-[10px] font-normal text-muted-foreground">BTU/h</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              Cluster: {row.clusterBtu.toLocaleString("id-ID")} BTU/m²
                            </div>
                          </td>

                          {/* Rekomendasi AC */}
                          <td className="px-4 py-3 text-center align-top">
                            <span className="inline-flex items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/25 px-3 py-1.5 font-extrabold text-blue-700 dark:text-blue-300 text-sm shadow-2xs">
                              {row.recommendedUnits} Unit
                            </span>
                          </td>

                          {/* Catatan */}
                          <td className="px-4 py-3 align-top text-muted-foreground">
                            <div className="line-clamp-2 text-xs leading-relaxed" title={row.notes || ""}>
                              {row.notes || "-"}
                            </div>
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
          <Card className="border-border/60 shadow-xs overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[960px]">
                  <thead className="border-b bg-muted/50 font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3.5 w-44">Waktu & Auditor</th>
                      <th className="px-4 py-3.5 min-w-[220px]">Toko & Cabang</th>
                      <th className="px-4 py-3.5 text-left w-36">Luas Sales</th>
                      <th className="px-4 py-3.5 min-w-[160px]">Bentuk & Dimensi</th>
                      <th className="px-4 py-3.5 text-center w-44">Titik Lampu (Unit)</th>
                      <th className="px-4 py-3.5 text-center w-36">Rasio & Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {lightLogs.data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                          <IconBulb className="mx-auto mb-2 size-8 opacity-40" />
                          Belum ada log riwayat kalkulator Lampu yang sesuai dengan filter.
                        </td>
                      </tr>
                    ) : (
                      lightLogs.data.map((row) => (
                        <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                          {/* Waktu & Auditor */}
                          <td className="px-4 py-3 align-top">
                            <div className="font-semibold text-foreground whitespace-nowrap">
                              {formatDateIndo(row.createdAt)}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate max-w-[160px] mt-0.5" title={row.userEmail || ""}>
                              {row.userName || row.userEmail || "Tamu / Belum Login"}
                            </div>
                          </td>

                          {/* Toko & Cabang */}
                          <td className="px-4 py-3 align-top">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground text-sm">
                                {row.storeName || "Toko Tanpa Nama"}
                              </span>
                              {row.storeMode === "NEW" ? (
                                <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400 text-[10px] px-1.5 py-0 h-4">
                                  Toko Baru
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-900/50 dark:text-blue-300 text-[10px] px-1.5 py-0 h-4">
                                  Terdaftar
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              {row.storeCode && <span className="font-mono">{row.storeCode}</span>}
                              {row.storeCode && row.branch && <span>•</span>}
                              {row.branch && <span>{row.branch}</span>}
                            </div>
                          </td>

                          {/* Luas Sales */}
                          <td className="px-4 py-3 text-left align-top">
                            <div className="font-bold text-foreground font-mono text-sm">
                              {row.salesArea.toLocaleString("id-ID")} m²
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              {row.lampWatt}W LED
                            </div>
                          </td>

                          {/* Bentuk & Dimensi */}
                          <td className="px-4 py-3 align-top">
                            <div className="font-semibold text-foreground">
                              {row.shapeType || "Simetris"}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              {row.dimensions || "Kustom Canvas"}
                            </div>
                          </td>

                          {/* Titik Lampu */}
                          <td className="px-4 py-3 text-center align-top">
                            <span className="inline-flex items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/25 px-3 py-1 font-extrabold text-amber-700 dark:text-amber-300 text-sm shadow-2xs">
                              {row.installedUnits} Unit
                            </span>
                            <div className="text-[10.5px] text-muted-foreground font-mono mt-1">
                              Rentang: {row.minUnits} - {row.maxUnits} Unit
                            </div>
                          </td>

                          {/* Rasio & Status */}
                          <td className="px-4 py-3 text-center align-top">
                            <div className="font-bold text-foreground font-mono text-xs">
                              {row.powerRatio ? `${row.powerRatio.toFixed(2)} W/m²` : "-"}
                            </div>
                            <div className="mt-1">
                              {row.standardStatus === "ideal" ? (
                                <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400 text-[10px] px-2 py-0.5">
                                  Ideal
                                </Badge>
                              ) : row.standardStatus === "toleransi" ? (
                                <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400 text-[10px] px-2 py-0.5">
                                  Toleransi
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                                  {row.standardStatus || "-"}
                                </Badge>
                              )}
                            </div>
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
