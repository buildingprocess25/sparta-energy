"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  IconLoader2,
  IconSortAscending,
  IconSortDescending,
  IconTool,
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
  MasterEquipmentFilters,
  MasterEquipmentRow,
  MasterEquipmentSortKey,
  SortOrder,
} from "@/lib/admin-master-data-queries"

const numberFormat = new Intl.NumberFormat("id-ID")

function formatDate(date: Date | string | null) {
  if (!date) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

function formatNumber(value: number | null, suffix = "") {
  if (value === null) return "-"
  return `${numberFormat.format(Math.round(value * 1000) / 1000)}${suffix}`
}

function getNextSortOrder({
  currentSort,
  currentOrder,
  column,
}: {
  currentSort: MasterEquipmentSortKey
  currentOrder: SortOrder
  column: MasterEquipmentSortKey
}) {
  if (currentSort !== column) return column === "createdAt" ? "desc" : "asc"
  return currentOrder === "asc" ? "desc" : "asc"
}

export function AdminMasterEquipmentTable({
  initialRows,
  initialHasMore,
  totalRows,
  filters,
}: {
  initialRows: MasterEquipmentRow[]
  initialHasMore: boolean
  totalRows: number
  filters: MasterEquipmentFilters
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rows, setRows] = useState(initialRows)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const filterKey = JSON.stringify(filters)

  function updateSort(column: MasterEquipmentSortKey) {
    const params = new URLSearchParams(searchParams)
    const nextOrder = getNextSortOrder({
      currentSort: filters.sort,
      currentOrder: filters.order,
      column,
    })

    params.set("tab", "equipment")
    params.set("sort", column)
    params.set("order", nextOrder)

    router.push(`${pathname}?${params.toString()}`)
  }

  function SortableHeader({
    column,
    children,
    align = "left",
  }: {
    column: MasterEquipmentSortKey
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
        category: filters.category,
        storeType: filters.storeType,
        hasBrands: filters.hasBrands,
        sort: filters.sort,
        order: filters.order,
      })

      const response = await fetch(
        `/admin/master-data/equipment/data?${params.toString()}`
      )
      if (!response.ok) throw new Error("Failed to load master equipment")

      const payload = (await response.json()) as {
        rows: MasterEquipmentRow[]
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
        <Table className="min-w-[1080px] text-xs [&_td]:px-2 [&_td]:py-2 [&_th]:h-9 [&_th]:px-2">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_var(--border)]">
            <TableRow>
              <TableHead>
                <SortableHeader column="name">Equipment</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="category">Kategori</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="storeType">Tipe Toko</SortableHeader>
              </TableHead>
              <TableHead className="text-right">
                <SortableHeader column="defaultKw" align="right">
                  Default kW
                </SortableHeader>
              </TableHead>
              <TableHead className="text-right">
                <SortableHeader column="brandCount" align="right">
                  Brand
                </SortableHeader>
              </TableHead>
              <TableHead className="text-right">Min kW</TableHead>
              <TableHead className="text-right">Max kW</TableHead>
              <TableHead>Contoh Brand</TableHead>
              <TableHead>
                <SortableHeader column="createdAt">Dibuat</SortableHeader>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <IconTool className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="max-w-64 truncate font-medium">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.category}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.storeType ?? "Semua tipe"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatNumber(item.defaultKw)}
                </TableCell>
                <TableCell className="text-right">
                  {numberFormat.format(item.brandCount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(item.minBrandKw)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(item.maxBrandKw)}
                </TableCell>
                <TableCell>
                  {item.topBrands.length ? (
                    <div className="flex max-w-80 flex-wrap gap-1">
                      {item.topBrands.map((brand) => (
                        <Badge
                          key={`${item.id}-${brand}`}
                          variant="outline"
                          className="font-normal"
                        >
                          {brand}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(item.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div ref={sentinelRef} className="flex justify-center px-4 py-4">
          {loading ? (
            <Button variant="ghost" disabled>
              <IconLoader2 data-icon="inline-start" className="animate-spin" />
              Memuat master equipment...
            </Button>
          ) : hasMore ? (
            <Button type="button" variant="outline" onClick={loadMore}>
              Muat 25 equipment lagi
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              {numberFormat.format(rows.length)} dari{" "}
              {numberFormat.format(totalRows)} equipment ditampilkan.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
