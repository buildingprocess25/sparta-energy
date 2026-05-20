"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  IconBuildingStore,
  IconClipboardCheck,
  IconLoader2,
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
  AdminEquipmentFilters,
  AdminEquipmentRow,
  AdminEquipmentSortKey,
  AdminEquipmentSortOrder,
  EquipmentArea,
} from "@/lib/admin-equipment-queries"

const numberFormat = new Intl.NumberFormat("id-ID")
const tableLinkClass =
  "text-primary underline underline-offset-2 decoration-chart-2 transition-colors hover:decoration-primary"

const areaLabels: Record<EquipmentArea, string> = {
  SALES: "Sales",
  PARKING: "Parkir",
  TERRACE: "Teras",
  WAREHOUSE: "Gudang",
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function formatNumber(value: number, suffix = "") {
  return `${numberFormat.format(Math.round(value * 10) / 10)}${suffix}`
}

function getNextSortOrder({
  currentSort,
  currentOrder,
  column,
}: {
  currentSort: AdminEquipmentSortKey
  currentOrder: AdminEquipmentSortOrder
  column: AdminEquipmentSortKey
}) {
  if (currentSort !== column) return column === "dailyKwh" ? "desc" : "asc"
  return currentOrder === "asc" ? "desc" : "asc"
}

export function AdminEquipmentTable({
  initialRows,
  initialHasMore,
  totalRows,
  filters,
}: {
  initialRows: AdminEquipmentRow[]
  initialHasMore: boolean
  totalRows: number
  filters: AdminEquipmentFilters
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rows, setRows] = useState(initialRows)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const filterKey = JSON.stringify(filters)

  function updateSort(column: AdminEquipmentSortKey) {
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
    column: AdminEquipmentSortKey
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
        area: filters.area,
        equipment: filters.equipment,
        brand: filters.brand,
        sort: filters.sort,
        order: filters.order,
      })

      const response = await fetch(`/admin/equipment/data?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to load equipment")

      const payload = (await response.json()) as {
        rows: AdminEquipmentRow[]
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
        <Table className="min-w-[1180px] text-xs [&_td]:px-2 [&_td]:py-2 [&_th]:h-9 [&_th]:px-2">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_var(--border)]">
            <TableRow>
              <TableHead>
                <SortableHeader column="equipment">Equipment</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="brand">Brand</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="area">Area</SortableHeader>
              </TableHead>
              <TableHead className="text-right">
                <SortableHeader column="qty" align="right">
                  Qty
                </SortableHeader>
              </TableHead>
              <TableHead className="text-right">Jam</TableHead>
              <TableHead className="text-right">Base kW</TableHead>
              <TableHead className="text-right">
                <SortableHeader column="dailyKwh" align="right">
                  kWh/Hari
                </SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="store">Toko</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="branch">Cabang</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="auditDate">Audit</SortableHeader>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="min-w-0">
                    <p className="max-w-56 truncate font-medium">
                      {item.equipmentName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.store.type}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.brandName}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{areaLabels[item.area]}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {numberFormat.format(item.qty)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(item.operationalHours)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(item.baseKw)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatNumber(item.estimatedDailyKwh)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <IconBuildingStore className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">
                        <Link
                          href={`/admin/stores/${item.store.id}`}
                          className={tableLinkClass}
                        >
                          {item.store.code}
                        </Link>
                      </p>
                      <p className="max-w-56 truncate text-xs text-muted-foreground">
                        {item.store.name}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.store.branch ?? "-"}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/audit/${item.auditId}`}
                    className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <IconClipboardCheck className="size-4" />
                    <span className={tableLinkClass}>
                      {formatDate(item.auditDate)}
                    </span>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div ref={sentinelRef} className="flex justify-center px-4 py-4">
          {loading ? (
            <Button variant="ghost" disabled>
              <IconLoader2 data-icon="inline-start" className="animate-spin" />
              Memuat equipment...
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
