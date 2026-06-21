"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  IconLoader2,
  IconSortAscending,
  IconSortDescending,
  IconTool,
  IconPencil,
  IconTrash,
  IconAlertTriangle,
  IconPhoto,
  IconFileText,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { AdminMasterEquipmentDialog } from "@/components/admin/admin-master-equipment-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { MasterEquipmentTypeOption } from "@/lib/admin-master-data-queries"

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

import { cn } from "@/lib/utils"

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
  equipmentTypeOptions,
  categories,
  deviceCategories,
  storeTypes,
}: {
  initialRows: MasterEquipmentRow[]
  initialHasMore: boolean
  totalRows: number
  filters: MasterEquipmentFilters
  equipmentTypeOptions: MasterEquipmentTypeOption[]
  categories: string[]
  deviceCategories: string[]
  storeTypes: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rows, setRows] = useState(initialRows)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const filterKey = JSON.stringify(filters)

  const [editItem, setEditItem] = useState<MasterEquipmentRow | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<MasterEquipmentRow | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Lightbox Modal states
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState("")
  const [lightboxTitle, setLightboxTitle] = useState("")

  function handleViewPhoto(src: string, title: string) {
    setLightboxSrc(src)
    setLightboxTitle(title)
    setLightboxOpen(true)
  }

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

  function handleEdit(item: MasterEquipmentRow) {
    setEditItem(item)
    setEditDialogOpen(true)
  }

  function handleDeleteClick(item: MasterEquipmentRow) {
    setDeleteItem(item)
    setDeleteDialogOpen(true)
  }

  async function handleConfirmDelete() {
    if (!deleteItem) return
    setIsDeleting(true)
    try {
      const response = await fetch(
        `/admin/master-data/equipment/${deleteItem.id}`,
        {
          method: "DELETE",
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus equipment")
      }
      toast.success("Berhasil menghapus brand equipment")
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
        deviceCategory: filters.deviceCategory,
        category: filters.category,
        storeType: filters.storeType,
        area: filters.area,
        powerMode: filters.powerMode,
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
        <Table className="min-w-[1200px] text-xs [&_td]:px-2 [&_td]:py-2 [&_th]:h-9 [&_th]:px-2">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_var(--border)]">
            <TableRow>
              <TableHead>
                <SortableHeader column="equipment">Equipment</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="brand">Brand</SortableHeader>
              </TableHead>
              <TableHead>Kategori Jenis</TableHead>
              <TableHead>
                <SortableHeader column="category">Area Penempatan</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="storeType">Tipe Toko</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="area">Target Area Brand</SortableHeader>
              </TableHead>
              <TableHead className="text-right">
                <SortableHeader column="baseKw" align="right">
                  Default kW
                </SortableHeader>
              </TableHead>
              <TableHead className="text-right">
                <SortableHeader column="standbyKw" align="right">
                  Standby kW
                </SortableHeader>
              </TableHead>
              <TableHead className="text-right">
                <SortableHeader column="runningKw" align="right">
                  Running kW
                </SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="createdAt">Dibuat</SortableHeader>
              </TableHead>
              <TableHead className="w-24 text-center">Aksi</TableHead>
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
                    <p className="max-w-64 truncate font-medium">
                      {item.equipmentName}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.productPhotoUrl ? (
                      <div 
                        className="relative size-8 shrink-0 cursor-pointer overflow-hidden rounded-md border bg-muted/30 transition hover:opacity-80 group"
                        onClick={() => handleViewPhoto(item.productPhotoUrl!, `Foto Produk - ${item.brandName}`)}
                        title="Klik untuk memperbesar"
                      >
                        <img 
                          src={item.productPhotoUrl} 
                          alt={item.brandName} 
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-muted bg-muted/10 text-muted-foreground/30">
                        <IconPhoto className="size-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="max-w-48 truncate font-medium" title={item.brandName}>
                        {item.brandName}
                      </p>
                      {item.nameplatePhotoUrl && (
                        <button
                          type="button"
                          onClick={() => handleViewPhoto(item.nameplatePhotoUrl!, `Name Plate - ${item.brandName}`)}
                          className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                        >
                          <IconFileText className="size-3" />
                          <span>Name Plate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.deviceCategory}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.category}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.storeType ?? "Semua tipe"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.area}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatNumber(item.baseKw)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(item.standbyKw)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(item.runningKw)}
                </TableCell>
                 <TableCell className="text-muted-foreground">
                  {formatDate(item.createdAt)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => handleEdit(item)}
                      title="Ubah Equipment"
                    >
                      <IconPencil className="size-3.5 text-primary" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDeleteClick(item)}
                      title="Hapus Equipment"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <IconTrash className="size-3.5" />
                    </Button>
                  </div>
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

      {/* Edit Equipment Dialog */}
      <AdminMasterEquipmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        equipment={editItem}
        equipmentTypeOptions={equipmentTypeOptions}
        categories={categories}
        deviceCategories={deviceCategories}
        storeTypes={storeTypes}
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
            <DialogTitle className="text-center mt-3">Hapus Equipment</DialogTitle>
            <DialogDescription className="text-center">
              Apakah Anda yakin ingin menghapus brand equipment{" "}
              <strong className="text-foreground">{deleteItem?.brandName}</strong>? Tindakan ini tidak dapat dibatalkan.
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
      
      {/* Lightbox Preview Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-lg overflow-hidden">
          <DialogHeader>
            <DialogTitle className="truncate">{lightboxTitle}</DialogTitle>
            <DialogDescription className="sr-only">Pratinjau foto dokumentasi equipment</DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex items-center justify-center rounded-lg border bg-muted/20 p-2 min-h-[300px]">
            <img
              src={lightboxSrc}
              alt={lightboxTitle}
              className="max-h-[60vh] w-auto max-w-full rounded-md object-contain shadow-sm"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
