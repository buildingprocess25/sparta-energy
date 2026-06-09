"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  IconBuildingStore,
  IconClockHour4,
  IconLoader2,
  IconSortAscending,
  IconSortDescending,
  IconPencil,
  IconTrash,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { AdminMasterStoreDialog } from "@/components/admin/admin-master-store-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  MasterStoreFilters,
  MasterStoreRow,
  MasterStoreSortKey,
  SortOrder,
} from "@/lib/admin-master-data-queries"

import { cn } from "@/lib/utils"

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

function formatNumber(value: number, suffix = "") {
  return `${numberFormat.format(Math.round(value * 10) / 10)}${suffix}`
}

function formatHours(row: MasterStoreRow) {
  if (row.is24Hours) return "24 jam"
  if (row.openTime && row.closeTime) return `${row.openTime} - ${row.closeTime}`
  return "-"
}

function getCompleteness(row: MasterStoreRow) {
  const checks = [
    Boolean(row.code),
    Boolean(row.name),
    Boolean(row.branch),
    Boolean(row.type),
    Boolean(row.plnCustomerId),
    row.plnPowerVa > 0,
    row.salesAreaM2 > 0,
    row.parkingAreaM2 >= 0,
    row.terraceAreaM2 >= 0,
    row.warehouseAreaM2 > 0,
    row.is24Hours || Boolean(row.openTime && row.closeTime),
  ]

  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function getNextSortOrder({
  currentSort,
  currentOrder,
  column,
}: {
  currentSort: MasterStoreSortKey
  currentOrder: SortOrder
  column: MasterStoreSortKey
}) {
  if (currentSort !== column) return column === "updatedAt" ? "desc" : "asc"
  return currentOrder === "asc" ? "desc" : "asc"
}

export function AdminMasterStoresTable({
  initialRows,
  initialHasMore,
  totalRows,
  filters,
}: {
  initialRows: MasterStoreRow[]
  initialHasMore: boolean
  totalRows: number
  filters: MasterStoreFilters
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rows, setRows] = useState(initialRows)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const filterKey = JSON.stringify(filters)

  const [editStore, setEditStore] = useState<MasterStoreRow | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteStore, setDeleteStore] = useState<MasterStoreRow | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Grab-to-Scroll refs and state
  const containerRef = useRef<HTMLDivElement | null>(null)
  const activeContainerRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    const root = containerRef.current
    if (!root) return
    const container = root.querySelector('[data-slot="table-container"]') as HTMLDivElement | null
    if (!container) return
    if (e.button !== 0) return // Left click only
    const target = e.target as HTMLElement
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("select")
    ) {
      return
    }
    setIsDragging(true)
    activeContainerRef.current = container
    startX.current = e.pageX - container.offsetLeft
    scrollLeft.current = container.scrollLeft
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const container = activeContainerRef.current
    if (!container) return
    const x = e.pageX - container.offsetLeft
    const walk = (x - startX.current) * 1.5
    container.scrollLeft = scrollLeft.current - walk
  }

  const handleMouseUpOrLeave = () => {
    setIsDragging(false)
    activeContainerRef.current = null
  }

  function handleEdit(store: MasterStoreRow) {
    setEditStore(store)
    setEditDialogOpen(true)
  }

  function handleDeleteClick(store: MasterStoreRow) {
    setDeleteStore(store)
    setDeleteDialogOpen(true)
  }

  async function handleConfirmDelete() {
    if (!deleteStore) return
    setIsDeleting(true)
    try {
      const response = await fetch(
        `/admin/master-data/stores/${deleteStore.id}`,
        {
          method: "DELETE",
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus toko")
      }
      toast.success("Berhasil menghapus toko")
      setDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan sistem"
      )
    } finally {
      setIsDeleting(false)
    }
  }

  function updateSort(column: MasterStoreSortKey) {
    const params = new URLSearchParams(searchParams)
    const nextOrder = getNextSortOrder({
      currentSort: filters.sort,
      currentOrder: filters.order,
      column,
    })

    params.set("tab", "stores")
    params.set("sort", column)
    params.set("order", nextOrder)

    router.push(`${pathname}?${params.toString()}`)
  }

  function SortableHeader({
    column,
    children,
    align = "left",
  }: {
    column: MasterStoreSortKey
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
        type: filters.type,
        hours: filters.hours,
        sort: filters.sort,
        order: filters.order,
      })

      const response = await fetch(
        `/admin/master-data/stores/data?${params.toString()}`
      )
      if (!response.ok) throw new Error("Failed to load master stores")

      const payload = (await response.json()) as {
        rows: MasterStoreRow[]
        hasMore: boolean
      }

      setRows((current) => [...current, ...payload.rows])
      setHasMore(payload.hasMore)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={cn(
          "min-h-0 w-full flex-1 overflow-auto bg-background max-h-[45vh] min-h-[300px] border rounded-md transition-all",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        )}
      >
        <Table className="min-w-[1280px] text-xs [&_td]:px-2 [&_td]:py-2 [&_th]:h-9 [&_th]:px-2">
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
              <TableHead>ID PLN</TableHead>
              <TableHead className="text-right">
                <SortableHeader column="plnPower" align="right">
                  Daya
                </SortableHeader>
              </TableHead>
              <TableHead>Jam</TableHead>
              <TableHead className="text-right">
                <SortableHeader column="totalArea" align="right">
                  Total Area
                </SortableHeader>
              </TableHead>
              <TableHead className="text-right">Sales</TableHead>
              <TableHead className="text-right">Parkir</TableHead>
              <TableHead className="text-right">Teras</TableHead>
              <TableHead className="text-right">Gudang</TableHead>
              <TableHead>Completeness</TableHead>
              <TableHead>
                <SortableHeader column="updatedAt">Update</SortableHeader>
              </TableHead>
              <TableHead className="w-24 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((store) => {
              const completeness = getCompleteness(store)

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
                  <TableCell className="text-muted-foreground">
                    {store.plnCustomerId ?? "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(store.plnPowerVa, " VA")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconClockHour4 className="size-4" />
                      <span>{formatHours(store)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(store.totalAreaM2, " m2")}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(store.salesAreaM2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(store.parkingAreaM2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(store.terraceAreaM2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(store.warehouseAreaM2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={completeness >= 90 ? "default" : "secondary"}
                    >
                      {completeness}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(store.updatedAt)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleEdit(store)}
                        title="Ubah Toko"
                      >
                        <IconPencil className="size-3.5 text-primary" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteClick(store)}
                        title="Hapus Toko"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <IconTrash className="size-3.5" />
                      </Button>
                    </div>
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
              Memuat master toko...
            </Button>
          ) : hasMore ? (
            <Button type="button" variant="outline" onClick={loadMore}>
              Muat 25 toko lagi
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              {numberFormat.format(rows.length)} dari{" "}
              {numberFormat.format(totalRows)} toko ditampilkan.
            </p>
          )}
        </div>
      </div>

      {/* Edit Store Dialog */}
      <AdminMasterStoreDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        store={editStore}
        onSuccess={() => {
          router.refresh()
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <IconAlertTriangle className="size-6" />
            </div>
            <DialogTitle className="text-center mt-3">Hapus Toko</DialogTitle>
            <DialogDescription className="text-center">
              Apakah Anda yakin ingin menghapus toko{" "}
              <strong className="text-foreground">{deleteStore?.code} - {deleteStore?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 grid grid-cols-2 gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting && (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
