"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  IconSearch,
  IconRefresh,
  IconFlask,
  IconClipboardList,
  IconArrowRight,
  IconFilterOff,
} from "@tabler/icons-react"
import Link from "next/link"

import { BottomNavigation } from "@/components/bottom-navigation"
import { Header } from "@/components/header"
import { AuditCard } from "@/components/dashboard/audit-card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  getAuditHistory,
  getAvailableYears,
  type HistoryItem,
} from "@/app/actions/get-history"
import { useDebounce } from "@/hooks/use-debounce"
import { useSession } from "@/lib/auth-client"
import { DEMO_EMAIL } from "@/lib/demo-config"

type AuditFilterStatus = "all" | "hemat" | "boros"

// ─── Module-level cache ────────────────────────────────────────────────────────
// Persists across navigation as long as the JS module stays loaded.
// Keyed by the active filter combination.
const cache: {
  items: HistoryItem[]
  availableYears: string[]
  hasMore: boolean
  page: number
  initialized: boolean
} = {
  items: [],
  availableYears: [],
  hasMore: false,
  page: 1,
  initialized: false,
}

// ─── Pull-to-refresh threshold (px) ──────────────────────────────────────────
const PULL_THRESHOLD = 72

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  if (hasFilter) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
        <IconFilterOff className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Tidak ditemukan</p>
        <p className="text-xs text-muted-foreground">
          Tidak ada audit yang sesuai dengan filter yang dipilih.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
        <IconClipboardList className="size-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Belum ada audit</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Mulai audit pertama Anda untuk melihat riwayat di sini
        </p>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const { data: sessionData } = useSession()
  const isDemoUser = sessionData?.user?.email === DEMO_EMAIL

  const [items, setItems] = useState<HistoryItem[]>(cache.items)
  const [availableYears, setAvailableYears] = useState<string[]>(
    cache.availableYears
  )

  // Filters & Search
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<AuditFilterStatus>("all")

  // Infinite Scroll State
  const [page, setPage] = useState(cache.page)
  const [hasMore, setHasMore] = useState(cache.hasMore)
  const [loading, setLoading] = useState(!cache.initialized)

  // Pull-to-refresh state
  const [pullY, setPullY] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const touchStartY = useRef(0)
  const mainRef = useRef<HTMLElement>(null)

  // ── Filter key so we only cache the "no filter" state ────────────────────
  const isDefaultFilter =
    debouncedSearch === "" && selectedYear === "all" && selectedStatus === "all"

  // ── Fetch data ────────────────────────────────────────────────────────────
  const fetchHistory = useCallback(
    async (forcePage?: number) => {
      const targetPage = forcePage ?? page
      setLoading(true)
      try {
        const response = await getAuditHistory(
          targetPage,
          debouncedSearch,
          selectedStatus,
          selectedYear
        )

        if (targetPage === 1) {
          setItems(response.items)
          if (isDefaultFilter) {
            cache.items = response.items
          }
        } else {
          setItems((prev) => {
            const merged = [...prev, ...response.items]
            if (isDefaultFilter) cache.items = merged
            return merged
          })
        }

        setHasMore(response.hasMore)
        if (isDefaultFilter) {
          cache.hasMore = response.hasMore
          cache.page = targetPage
          cache.initialized = true
        }
      } catch (error) {
        console.error("Failed to fetch history:", error)
      } finally {
        setLoading(false)
      }
    },
    [page, debouncedSearch, selectedStatus, selectedYear, isDefaultFilter]
  )

  // ── Initial fetch — skip if cache is warm ────────────────────────────────
  useEffect(() => {
    if (cache.initialized && isDefaultFilter) return // already cached
    fetchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Re-fetch when page increments (infinite scroll) ───────────────────────
  useEffect(() => {
    if (page === 1) return // initial handled above
    fetchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  // ── Re-fetch when filters change ──────────────────────────────────────────
  useEffect(() => {
    setPage(1)
    setItems([])
    fetchHistory(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedYear, selectedStatus])

  // ── Fetch years once ─────────────────────────────────────────────────────
  useEffect(() => {
    if (cache.availableYears.length > 0) return
    getAvailableYears().then((years) => {
      setAvailableYears(years)
      cache.availableYears = years
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Intersection Observer for infinite scroll ─────────────────────────────
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

  // ── Pull-to-refresh touch handlers ───────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = mainRef.current
    if (el && el.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
    } else {
      touchStartY.current = 0
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartY.current) return
    const delta = e.touches[0].clientY - touchStartY.current
    if (delta > 0) {
      // resist pull with a logarithmic decay
      setPullY(Math.min(delta * 0.45, PULL_THRESHOLD))
    }
  }, [])

  const handleTouchEnd = useCallback(async () => {
    if (pullY >= PULL_THRESHOLD - 4 && !isRefreshing) {
      setIsRefreshing(true)
      cache.initialized = false
      setPage(1)
      setItems([])
      await fetchHistory(1)
      setIsRefreshing(false)
    }
    setPullY(0)
    touchStartY.current = 0
  }, [pullY, isRefreshing, fetchHistory])

  const pullProgress = Math.min(pullY / PULL_THRESHOLD, 1)

  return (
    <main
      ref={mainRef}
      className="mx-auto flex min-h-svh w-full max-w-sm flex-col overflow-y-auto bg-background px-4 pb-32"
      onTouchStart={isDemoUser ? undefined : handleTouchStart}
      onTouchMove={isDemoUser ? undefined : handleTouchMove}
      onTouchEnd={isDemoUser ? undefined : handleTouchEnd}
    >
      {/* ── Pull indicator ── */}
      {!isDemoUser && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all duration-200 ease-out"
          style={{ height: `${pullY}px` }}
        >
          <IconRefresh
            className="size-5 text-primary transition-transform duration-200"
            style={{
              opacity: pullProgress,
              transform: `rotate(${pullProgress * 360}deg) scale(${0.5 + pullProgress * 0.5})`,
            }}
          />
        </div>
      )}

      <Header variant="title-only" title="Riwayat Audit" />

      {isDemoUser ? (
        <section className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <IconFlask className="size-8 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Mode Demo
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Riwayat audit tidak tersimpan dalam mode demo.
              <br />
              Login dengan akun resmi untuk melihat riwayat.
            </p>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <IconSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
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
                onValueChange={(val) =>
                  setSelectedStatus(val as AuditFilterStatus)
                }
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

          {/* Refreshing indicator */}
          {isRefreshing && (
            <div className="flex items-center justify-center gap-2 py-2">
              <IconRefresh className="size-3.5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">
                Memuat ulang...
              </span>
            </div>
          )}

          {/* List */}
          <div className="flex flex-col gap-3">
            {items.length > 0 ? (
              items.map((item, index) => {
                if (items.length === index + 1) {
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
              <EmptyState
                hasFilter={
                  debouncedSearch !== "" ||
                  selectedYear !== "all" ||
                  selectedStatus !== "all"
                }
              />
            ) : null}

            {loading && !isRefreshing && (
              <div className="flex justify-center py-4">
                <span className="animate-pulse text-xs text-muted-foreground">
                  Memuat data...
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      <BottomNavigation />
    </main>
  )
}
