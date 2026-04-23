"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { IconSearch } from "@tabler/icons-react"

import { BottomNavigation } from "@/components/bottom-navigation"
import { Header } from "@/components/header"
import { AuditCard } from "@/components/dashboard/audit-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { getAuditHistory, getAvailableYears, type HistoryItem } from "@/app/actions/get-history"
import { useDebounce } from "@/hooks/use-debounce"

type AuditFilterStatus = "all" | "hemat" | "boros"

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [availableYears, setAvailableYears] = useState<string[]>([])
  
  // Filters & Search
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<AuditFilterStatus>("all")
  
  // Infinite Scroll State
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch initial years
  useEffect(() => {
    getAvailableYears().then(setAvailableYears)
  }, [])

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1)
    setItems([])
    // We intentionally don't call fetchHistory here directly.
    // Changing page to 1 will trigger the data fetch in the next useEffect.
  }, [debouncedSearch, selectedYear, selectedStatus])

  // Fetch data
  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getAuditHistory(
        page,
        debouncedSearch,
        selectedStatus,
        selectedYear
      )
      
      if (page === 1) {
        setItems(response.items)
      } else {
        setItems((prev) => [...prev, ...response.items])
      }
      setHasMore(response.hasMore)
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, selectedStatus, selectedYear])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Intersection Observer for Infinite Scroll
  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1)
        }
      })
      
      if (node) observer.current.observe(node)
    },
    [loading, hasMore]
  )

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header variant="title-only" title="History" />

      <section className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari kode atau nama toko..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full pl-9 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label
              htmlFor="history-year-filter"
              className="text-[11px] text-muted-foreground"
            >
              Tahun
            </label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger
                id="history-year-filter"
                className="h-9 w-full text-xs"
              >
                <SelectValue placeholder="Semua Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="history-status-filter"
              className="text-[11px] text-muted-foreground"
            >
              Status
            </label>
            <Select
              value={selectedStatus}
              onValueChange={(val) => setSelectedStatus(val as AuditFilterStatus)}
            >
              <SelectTrigger
                id="history-status-filter"
                className="h-9 w-full text-xs"
              >
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="hemat">Hemat</SelectItem>
                <SelectItem value="boros">Boros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
          {items.length > 0 ? (
            items.map((item, index) => {
              if (items.length === index + 1) {
                // Last item, attach the ref for infinite scroll
                return (
                  <div ref={lastElementRef} key={item.id}>
                    <AuditCard
                      id={item.id}
                      status={item.status}
                      storeName={item.storeName}
                      period={item.period}
                      standardAverage={item.standardAverage}
                      actualAverage={item.actualAverage}
                      efficiency={item.efficiency}
                    />
                  </div>
                )
              } else {
                return (
                  <AuditCard
                    key={item.id}
                    id={item.id}
                    status={item.status}
                    storeName={item.storeName}
                    period={item.period}
                    standardAverage={item.standardAverage}
                    actualAverage={item.actualAverage}
                    efficiency={item.efficiency}
                  />
                )
              }
            })
          ) : !loading ? (
            <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
              Data tidak ditemukan untuk filter yang dipilih.
            </div>
          ) : null}

          {loading && (
            <div className="flex justify-center py-4">
              <span className="text-xs text-muted-foreground animate-pulse">
                Memuat data...
              </span>
            </div>
          )}
        </div>
      </section>

      <BottomNavigation />
    </main>
  )
}
