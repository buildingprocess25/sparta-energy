"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  IconAlertTriangle,
  IconBuildingStore,
  IconClipboardCheck,
  IconLeaf,
  IconLoader2,
  IconMinus,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  AdminStoreFilters,
  AdminStoreRow,
  AdminStoreSortKey,
  SortOrder,
  StoreStatus,
} from "@/lib/admin-store-queries"

const numberFormat = new Intl.NumberFormat("id-ID")
const tableLinkClass =
  "text-primary underline underline-offset-2 decoration-chart-2 transition-colors hover:decoration-primary"

function formatDate(date: Date | string | null) {
  if (!date) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

function formatKwh(value: string | number | null) {
  if (value === null) return "-"
  return `${numberFormat.format(Math.round(Number(value)))} kWh`
}

function formatStd(value: string | number | null) {
  if (value === null) return "-"
  return numberFormat.format(Math.round(Number(value)))
}

function calculateGapPercent(
  actual: string | number | null,
  baseline: string | number | null
) {
  const actualValue = Number(actual ?? 0)
  const baselineValue = Number(baseline ?? 0)
  if (baselineValue <= 0) return null
  return Math.round(((actualValue - baselineValue) / baselineValue) * 1000) / 10
}

function getStatus(row: AdminStoreRow): StoreStatus {
  if (!row.latest_audit_id) return "not-audited"
  return row.is_boros ? "boros" : "hemat"
}

function getStatusBadge(status: StoreStatus) {
  if (status === "boros") {
    return (
      <Badge variant="destructive">
        <IconAlertTriangle data-icon="inline-start" />
        Boros
      </Badge>
    )
  }

  if (status === "hemat") {
    return (
      <Badge>
        <IconLeaf data-icon="inline-start" />
        Hemat
      </Badge>
    )
  }

  return (
    <Badge variant="secondary">
      <IconMinus data-icon="inline-start" />
      Belum Audit
    </Badge>
  )
}

function getNextSortOrder({
  currentSort,
  currentOrder,
  column,
}: {
  currentSort: AdminStoreSortKey
  currentOrder: SortOrder
  column: AdminStoreSortKey
}) {
  if (currentSort !== column) return column === "auditDate" ? "desc" : "asc"
  return currentOrder === "asc" ? "desc" : "asc"
}

export function AdminStoresTable({
  initialRows,
  initialHasMore,
  totalRows,
  filters,
}: {
  initialRows: AdminStoreRow[]
  initialHasMore: boolean
  totalRows: number
  filters: AdminStoreFilters
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rows, setRows] = useState(initialRows)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const filterKey = JSON.stringify(filters)

  function updateSort(column: AdminStoreSortKey) {
    const params = new URLSearchParams(searchParams)
    const nextOrder = getNextSortOrder({
      currentSort: filters.sort,
      currentOrder: filters.order,
      column,
    })

    params.set("sort", column)
    params.set("order", nextOrder)

    router.push(`${pathname}?${params.toString()}`)
  }

  function SortableHeader({
    column,
    children,
    align = "left",
  }: {
    column: AdminStoreSortKey
    children: string
    align?: "left" | "right"
  }) {
    const active = filters.sort === column
    const Icon = active
      ? filters.order === "asc"
        ? IconSortAscending
        : IconSortDescending
      : null

    return (
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className={align === "right" ? "ml-auto" : "-ml-2"}
        aria-label={`Urutkan berdasarkan ${children}`}
        aria-pressed={active}
        onClick={() => updateSort(column)}
      >
        {children}
        {Icon && <Icon data-icon="inline-end" />}
      </Button>
    )
  }

  useEffect(() => {
    setRows(initialRows)
    setHasMore(initialHasMore)
  }, [initialRows, initialHasMore, filterKey])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasMore && !loading) {
        void loadMore()
      }
    })

    observer.observe(sentinel)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, rows.length, filterKey])

  async function loadMore() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        offset: String(rows.length),
        q: filters.q,
        branch: filters.branch,
        status: filters.status,
        type: filters.type,
        sort: filters.sort,
        order: filters.order,
      })

      const response = await fetch(`/admin/stores/data?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to load stores")

      const payload = (await response.json()) as {
        rows: AdminStoreRow[]
        hasMore: boolean
      }

      setRows((current) => [...current, ...payload.rows])
      setHasMore(payload.hasMore)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto bg-background">
        <Table className="min-w-[980px] text-xs [&_td]:px-2 [&_td]:py-2 [&_th]:h-9 [&_th]:px-2">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_var(--border)]">
            <TableRow>
              <TableHead>
                <SortableHeader column="store">Toko</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="branch">Cabang</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="type">Tipe</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="status">Status</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="auditDate">
                  Audit Terakhir
                </SortableHeader>
              </TableHead>
              <TableHead className="text-right">
                <SortableHeader column="std" align="right">
                  STD
                </SortableHeader>
              </TableHead>
              <TableHead className="text-right">
                <SortableHeader column="actualPln" align="right">
                  PLN
                </SortableHeader>
              </TableHead>
              <TableHead className="text-right">
                <SortableHeader column="baseline" align="right">
                  Baseline
                </SortableHeader>
              </TableHead>
              <TableHead className="text-right">
                <SortableHeader column="gap" align="right">
                  Gap
                </SortableHeader>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((store) => {
              const status = getStatus(store)
              const gapPercent = calculateGapPercent(
                store.actual_pln,
                store.baseline
              )

              return (
                <TableRow key={store.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <IconBuildingStore className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">
                          <Link
                            href={`/admin/stores/${store.id}`}
                            className={tableLinkClass}
                          >
                            {store.code}
                          </Link>
                        </p>
                        <p className="max-w-64 truncate text-xs text-muted-foreground">
                          {store.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {store.branch ?? "-"}
                  </TableCell>
                  <TableCell>{store.type}</TableCell>
                  <TableCell>{getStatusBadge(status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconClipboardCheck className="size-4" />
                      <span>{formatDate(store.latest_audit_date)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatStd(store.std)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatKwh(store.actual_pln)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatKwh(store.baseline)}
                  </TableCell>
                  <TableCell className="text-right">
                    {gapPercent === null ? (
                      "-"
                    ) : (
                      <Badge
                        variant={gapPercent > 0 ? "destructive" : "default"}
                      >
                        {gapPercent > 0 ? "+" : ""}
                        {gapPercent.toFixed(1)}%
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <div ref={sentinelRef} className="flex justify-center px-4 py-4">
          {loading ? (
            <Button variant="ghost" disabled>
              <IconLoader2 data-icon="inline-start" className="animate-spin" />
              Memuat toko...
            </Button>
          ) : hasMore ? (
            <Button type="button" variant="outline" onClick={loadMore}>
              Muat 20 toko lagi
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              {numberFormat.format(rows.length)} dari{" "}
              {numberFormat.format(totalRows)} toko ditampilkan.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
