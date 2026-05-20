"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  IconAlertTriangle,
  IconClipboardCheck,
  IconEye,
  IconLeaf,
  IconLoader2,
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
  AdminAuditFilters,
  AdminAuditRow,
} from "@/lib/admin-audit-queries"

const numberFormat = new Intl.NumberFormat("id-ID")
const tableLinkClass =
  "text-primary underline underline-offset-2 decoration-chart-2 transition-colors hover:decoration-primary"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function formatKwh(value: number | null) {
  if (value === null) return "-"
  return `${numberFormat.format(Math.round(value))} kWh`
}

function calculateGapPercent(actual: number | null, baseline: number | null) {
  const actualValue = Number(actual ?? 0)
  const baselineValue = Number(baseline ?? 0)
  if (baselineValue <= 0) return null
  return Math.round(((actualValue - baselineValue) / baselineValue) * 1000) / 10
}

function getStatusBadge(isBoros: boolean | null) {
  if (isBoros) {
    return (
      <Badge variant="destructive">
        <IconAlertTriangle data-icon="inline-start" />
        Boros
      </Badge>
    )
  }

  return (
    <Badge>
      <IconLeaf data-icon="inline-start" />
      Hemat
    </Badge>
  )
}

function getRecommendationLabel(type: string) {
  if (type === "TRAINING") return "Training"
  if (type === "REPAIR") return "Repair"
  if (type === "MAINTENANCE") return "Maintenance"
  return type
}

export function AdminAuditsTable({
  initialRows,
  initialHasMore,
  totalRows,
  filters,
}: {
  initialRows: AdminAuditRow[]
  initialHasMore: boolean
  totalRows: number
  filters: AdminAuditFilters
}) {
  const [rows, setRows] = useState(initialRows)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const filterKey = JSON.stringify(filters)

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
        auditor: filters.auditor,
        year: filters.year,
        month: filters.month,
        status: filters.status,
        recommendation: filters.recommendation,
      })

      const response = await fetch(`/admin/audits/data?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to load audits")

      const payload = (await response.json()) as {
        rows: AdminAuditRow[]
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
              <TableHead>Tanggal</TableHead>
              <TableHead>Toko</TableHead>
              <TableHead>Cabang</TableHead>
              <TableHead>Auditor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actual PLN</TableHead>
              <TableHead className="text-right">Baseline</TableHead>
              <TableHead className="text-right">Gap</TableHead>
              <TableHead>Rekomendasi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((audit) => {
              const gapPercent = calculateGapPercent(
                audit.actualPln,
                audit.baseline
              )
              const auditorName = audit.auditor.fullName ?? audit.auditor.email

              return (
                <TableRow key={audit.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconClipboardCheck className="size-4" />
                      <span>{formatDate(audit.auditDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium">
                        <Link
                          href={`/audit/${audit.id}`}
                          className={tableLinkClass}
                        >
                          {audit.store.code}
                        </Link>
                      </p>
                      <p className="max-w-72 truncate text-xs text-muted-foreground">
                        {audit.store.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {audit.store.branch ?? "-"}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="max-w-44 truncate">{auditorName}</p>
                      <p className="max-w-44 truncate text-xs text-muted-foreground">
                        {audit.auditor.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(audit.isBoros)}</TableCell>
                  <TableCell className="text-right">
                    {formatKwh(audit.actualPln)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatKwh(audit.baseline)}
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
                  <TableCell>
                    <div className="flex max-w-72 flex-wrap gap-1">
                      {audit.recommendations.length > 0 ? (
                        audit.recommendations.slice(0, 3).map((item, index) => (
                          <Badge
                            key={`${item.type}-${index}`}
                            variant="secondary"
                          >
                            {getRecommendationLabel(item.type)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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
              Memuat audit...
            </Button>
          ) : hasMore ? (
            <Button type="button" variant="outline" onClick={loadMore}>
              Muat 20 audit lagi
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              {numberFormat.format(rows.length)} dari{" "}
              {numberFormat.format(totalRows)} audit ditampilkan.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
