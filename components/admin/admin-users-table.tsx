"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  IconLoader2,
  IconShieldCheck,
  IconSortAscending,
  IconSortDescending,
  IconUser,
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
import { AdminTableScroll } from "@/components/admin/admin-table-scroll"
import { AdminUserActions } from "@/components/admin/admin-user-actions"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type {
  AdminUserFilters,
  AdminUserRow,
  AdminUserSortKey,
  AdminUserSortOrder,
  UserRole,
} from "@/lib/admin-user-queries"
import { ROLE_LABELS, usesBranch } from "@/lib/role-access"

const numberFormat = new Intl.NumberFormat("id-ID")

function formatDate(date: Date | string | null) {
  if (!date) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

function getRoleBadge(role: UserRole) {
  if (role === "ADMIN") {
    return (
      <Badge variant="default" className="gap-1">
        <IconShieldCheck aria-hidden="true" className="size-3" />
        Admin
      </Badge>
    )
  }

  if (role === "USER") {
    return (
      <Badge variant="secondary" className="gap-1">
        <IconUser aria-hidden="true" className="size-3" />
        User
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-1">
      <IconShieldCheck aria-hidden="true" className="size-3" />
      {ROLE_LABELS[role]}
    </Badge>
  )
}

function getBranchParts(branch: string | null) {
  if (!branch) return []

  return branch
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function BranchCell({
  branch,
  role,
  deviceCount,
}: {
  branch: string | null
  role: UserRole
  deviceCount: number | null
}) {
  if (role === "GS") {
    if (deviceCount === null) {
      return <span className="text-muted-foreground">Alat yang di-assign</span>
    }
    return deviceCount === 0 ? (
      <span className="text-muted-foreground">Belum ada alat</span>
    ) : (
      <Badge variant="outline" className="font-normal">
        {deviceCount} alat
      </Badge>
    )
  }

  if (!usesBranch(role)) {
    return (
      <Badge variant="outline" className="font-normal">
        Semua cabang
      </Badge>
    )
  }

  const branches = getBranchParts(branch)
  if (!branches.length) return <span className="text-muted-foreground">-</span>

  if (branches.length === 1) {
    return <span className="text-muted-foreground">{branches[0]}</span>
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="cursor-default font-normal">
          {branches.length} cabang
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <span>{branches.join(", ")}</span>
      </TooltipContent>
    </Tooltip>
  )
}

type SortHeaderProps = {
  label: string
  sortKey: AdminUserSortKey
  currentSort: AdminUserSortKey
  currentOrder: AdminUserSortOrder
  onSort: (key: AdminUserSortKey) => void
}

function SortHeader({
  label,
  sortKey,
  currentSort,
  currentOrder,
  onSort,
}: SortHeaderProps) {
  const isActive = currentSort === sortKey
  const Icon =
    isActive && currentOrder === "asc" ? IconSortAscending : IconSortDescending

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(sortKey)}
      className="h-7 gap-1 px-2 text-xs font-medium hover:bg-muted/50"
    >
      {label}
      <Icon
        aria-hidden="true"
        className={`size-3.5 ${isActive ? "text-primary" : "text-muted-foreground/40"}`}
      />
    </Button>
  )
}

type AdminUsersTableProps = {
  initialRows: AdminUserRow[]
  initialHasMore: boolean
  totalRows: number
  filters: AdminUserFilters
  branches: string[]
  onRefresh?: () => void
}

export function AdminUsersTable({
  initialRows,
  initialHasMore,
  totalRows,
  filters,
  branches,
  onRefresh,
}: AdminUsersTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [rows, setRows] = useState(initialRows)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    setRows(initialRows)
    setHasMore(initialHasMore)
  }, [initialRows, initialHasMore])

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return

    loadingRef.current = true
    setIsLoading(true)

    try {
      const params = new URLSearchParams(searchParams.toString())
      params.set("offset", String(rows.length))
      params.set("limit", "20")

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await response.json()

      if (data.rows) {
        setRows((prev) => {
          const newRows = [...prev, ...data.rows]
          // Deduplicate by id to prevent duplicate keys
          const uniqueRows = Array.from(
            new Map(newRows.map((row) => [row.id, row])).values()
          )
          return uniqueRows
        })
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error("Failed to load more users:", error)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [hasMore, rows.length, searchParams])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingRef.current) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadMore])

  function handleSort(key: AdminUserSortKey) {
    const params = new URLSearchParams(searchParams.toString())
    const currentSort = params.get("sort")
    const currentOrder = params.get("order")

    if (currentSort === key) {
      params.set("order", currentOrder === "asc" ? "desc" : "asc")
    } else {
      params.set("sort", key)
      params.set("order", "desc")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminTableScroll className="min-h-80 flex-1">
        <Table className="text-xs [&_td]:px-3 [&_td]:py-2.5 [&_th]:h-9 [&_th]:px-3">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_var(--border)]">
            <TableRow>
              <TableHead>
                <SortHeader
                  label="Nama"
                  sortKey="fullName"
                  currentSort={filters.sort}
                  currentOrder={filters.order}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label="Email"
                  sortKey="email"
                  currentSort={filters.sort}
                  currentOrder={filters.order}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label="Role"
                  sortKey="role"
                  currentSort={filters.sort}
                  currentOrder={filters.order}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label="Cabang"
                  sortKey="branch"
                  currentSort={filters.sort}
                  currentOrder={filters.order}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="text-right">
                <SortHeader
                  label="Kalkulasi"
                  sortKey="auditCount"
                  currentSort={filters.sort}
                  currentOrder={filters.order}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label="Terakhir Aktif"
                  sortKey="lastActive"
                  currentSort={filters.sort}
                  currentOrder={filters.order}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.fullName || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <BranchCell
                      branch={user.branch}
                      role={user.role}
                      deviceCount={user.deviceCount}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {numberFormat.format(user.auditCount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.lastActive)}
                  </TableCell>
                  <TableCell className="text-right">
                    <AdminUserActions
                      user={user}
                      branches={branches}
                      onSuccess={onRefresh}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-28 text-center text-muted-foreground"
                >
                  Tidak ada user sesuai filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {hasMore && (
          <div
            ref={observerRef}
            className="flex items-center justify-center border-t py-4"
          >
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <IconLoader2 className="size-4 animate-spin" />
                Memuat lebih banyak...
              </div>
            )}
          </div>
        )}

        {!hasMore && rows.length > 0 && (
          <div className="border-t py-3 text-center text-xs text-muted-foreground">
            Menampilkan semua {numberFormat.format(totalRows)} user
          </div>
        )}
      </AdminTableScroll>
    </div>
  )
}
