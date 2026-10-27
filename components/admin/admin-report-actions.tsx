"use client"

import { useMemo, useState } from "react"
import { IconDownload, IconEye, IconLoader2 } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { AdminReportColumn } from "@/lib/admin-report-queries"

type PreviewResponse = {
  columns: AdminReportColumn[]
  rows: Array<Array<string | number | null>>
  groupRows?: number[]
  previewRows: number
  totalRows: number
}

type AdminReportActionsProps = {
  title: string
  downloadHref: string
  previewHref: string
}

function formatCell(value: string | number | null, column: AdminReportColumn) {
  if (value === null || value === undefined || value === "") return "-"

  if (
    column.type === "number" ||
    column.type === "integer" ||
    column.type === "kw"
  ) {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits:
        column.type === "kw" ? 20 : column.type === "integer" ? 0 : 2,
    }).format(Number(value))
  }

  if (column.type === "date") {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value))
  }

  return String(value)
}

export function AdminReportActions({
  title,
  downloadHref,
  previewHref,
}: AdminReportActionsProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [loadedPreviewHref, setLoadedPreviewHref] = useState<string | null>(
    null
  )
  const activePreview =
    loadedPreviewHref === previewHref && preview ? preview : null
  const hasMoreRows = useMemo(() => {
    if (!activePreview) return false
    return activePreview.totalRows > activePreview.previewRows
  }, [activePreview])

  function loadPreview() {
    if (loadedPreviewHref === previewHref || isLoading) return
    setIsLoading(true)
    setError(null)

    fetch(previewHref)
      .then(async (response) => {
        if (!response.ok) throw new Error("Preview gagal dimuat")
        return (await response.json()) as PreviewResponse
      })
      .then((data) => {
        setPreview(data)
        setLoadedPreviewHref(previewHref)
      })
      .catch(() => {
        setError("Preview data belum bisa dimuat.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) loadPreview()
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            <IconEye data-icon="inline-start" />
            Preview
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[88svh] gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1180px)]">
          <DialogHeader className="border-b px-6 py-6">
            <DialogTitle>Preview {title}</DialogTitle>
            <DialogDescription>
              {activePreview
                ? `Menampilkan ${activePreview.previewRows} dari ${activePreview.totalRows} baris.`
                : "Memuat data yang akan diexport."}
              {hasMoreRows ? " Download .xlsx berisi seluruh data." : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-[18rem]">
            {isLoading && (
              <div className="flex h-[18rem] items-center justify-center gap-2 text-sm text-muted-foreground">
                <IconLoader2 className="size-4 animate-spin" />
                Memuat preview...
              </div>
            )}

            {error && !isLoading && (
              <div className="flex h-[18rem] items-center justify-center text-sm text-muted-foreground">
                {error}
              </div>
            )}

            {activePreview && !isLoading && !error && (
              <div className="h-[min(62svh,34rem)] overflow-auto">
                <table className="w-max min-w-[1200px] caption-bottom text-xs">
                  <thead className="sticky top-0 z-10 bg-background shadow-[0_1px_0_var(--border)] [&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      {activePreview.columns.map((column) => (
                        <th
                          key={column.label}
                          className={`h-9 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground ${
                            column.type !== "text" && column.type !== "date"
                              ? "text-right"
                              : ""
                          }`}
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {activePreview.rows.map((row, rowIndex) =>
                      activePreview.groupRows?.includes(rowIndex) ? (
                        <tr key={rowIndex} className="border-b bg-muted/60">
                          <th
                            scope="rowgroup"
                            colSpan={activePreview.columns.length}
                            className="px-2 py-2 text-left font-semibold"
                          >
                            {row[0]}
                          </th>
                        </tr>
                      ) : (
                        <tr
                          key={rowIndex}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          {activePreview.columns.map((column, columnIndex) => (
                            <td
                              key={`${rowIndex}-${column.label}`}
                              className={`px-2 py-2 align-middle whitespace-nowrap ${
                                column.type !== "text" && column.type !== "date"
                                  ? "text-right"
                                  : ""
                              }`}
                            >
                              {formatCell(row[columnIndex], column)}
                            </td>
                          ))}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Button asChild>
        <a href={downloadHref} download data-route-progress="false">
          <IconDownload data-icon="inline-start" />
          Download .xlsx
        </a>
      </Button>
    </div>
  )
}
