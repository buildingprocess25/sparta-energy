"use client"

import { useEffect, useMemo, useState } from "react"
import {
  IconAlertTriangle,
  IconDownload,
  IconFileSpreadsheet,
} from "@tabler/icons-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ENERGY_AUDIT_CATEGORIES } from "@/lib/energy-audit-categories"
import {
  defaultExportFilters,
  toExportSearchParams,
  type EnergyAuditExportFilters,
  type EnergyAuditExportStatus,
} from "@/lib/energy-audit-export-filters"
import type { EnergyAuditExportOptions } from "@/lib/energy-audit-queries"
import type { SheetPreview } from "@/lib/xlsx-sheet"

const EXPORT_ROUTE = "/audit/kategori/export"
const PREVIEW_DELAY_MS = 400

type PreviewState =
  | { key: string; ok: true; storeCount: number; sheets: SheetPreview[] }
  | { key: string; ok: false }

type MultiSelectProps = {
  id: string
  items: string[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder: string
  emptyText: string
  labelOf?: (item: string) => string
}

// Chips combobox from shadcn; an empty selection means "all".
function MultiSelect({
  id,
  items,
  value,
  onChange,
  placeholder,
  emptyText,
  labelOf,
}: MultiSelectProps) {
  const anchor = useComboboxAnchor()
  const label = labelOf ?? ((item: string) => item)
  return (
    <Combobox
      multiple
      items={items}
      value={value}
      onValueChange={(next) => onChange(next as string[])}
      itemToStringLabel={label}
    >
      <ComboboxChips ref={anchor} className="min-h-11">
        <ComboboxValue>
          {(selected: string[]) => (
            <>
              {selected.map((item) => (
                <ComboboxChip key={item}>{label(item)}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                id={id}
                placeholder={selected.length === 0 ? placeholder : ""}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {label(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

type EnergyAuditExportDialogProps = {
  options: EnergyAuditExportOptions
}

export function EnergyAuditExportDialog({
  options,
}: EnergyAuditExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] =
    useState<EnergyAuditExportFilters>(defaultExportFilters)
  const [preview, setPreview] = useState<PreviewState | null>(null)

  const query = toExportSearchParams(filters).toString()
  const isLoading = open && preview?.key !== query

  const storeLabel = useMemo(() => {
    const names = new Map(
      options.stores.map((store) => [
        store.code,
        `${store.name} (${store.code})`,
      ])
    )
    return (code: string) => names.get(code) ?? code
  }, [options.stores])
  // Store choices follow the chosen branches so the list stays short.
  const storeCodes = useMemo(
    () =>
      options.stores
        .filter(
          (store) =>
            filters.branches.length === 0 ||
            filters.branches.includes(store.branch ?? "")
        )
        .map((store) => store.code),
    [options.stores, filters.branches]
  )

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`${EXPORT_ROUTE}/preview?${query}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(String(response.status))
        const data = (await response.json()) as {
          storeCount: number
          sheets: SheetPreview[]
        }
        setPreview({ key: query, ok: true, ...data })
      } catch {
        if (!controller.signal.aborted) setPreview({ key: query, ok: false })
      }
    }, PREVIEW_DELAY_MS)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [open, query])

  function update(next: Partial<EnergyAuditExportFilters>) {
    setFilters((current) => ({ ...current, ...next }))
  }

  const ready = !isLoading && preview?.ok ? preview : null
  const categorySheets =
    ready?.sheets.filter((sheet) => sheet.name !== "Status Kategori") ?? []
  const isEmpty =
    ready !== null && categorySheets.every((sheet) => sheet.totalRows === 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11">
          <IconDownload data-icon="inline-start" />
          Unduh Rekap Pemeriksaan
        </Button>
      </DialogTrigger>
      {/* A one-column grid track that cannot grow past the dialog: wide preview tables scroll
          inside their own box instead of pushing every field off screen. */}
      <DialogContent className="max-h-[90svh] grid-cols-[minmax(0,1fr)] overflow-x-hidden overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Unduh rekap pemeriksaan</DialogTitle>
          <DialogDescription>
            Pilih data yang mau diunduh. Preview di bawah sama dengan isi file
            Excel.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <FieldSet>
            <FieldLegend variant="label">Kategori</FieldLegend>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {ENERGY_AUDIT_CATEGORIES.map((category) => {
                const id = `export-category-${category.key}`
                const checked = filters.categories.includes(category.key)
                // Keep at least one category, otherwise the file has nothing in it.
                const isLastChecked = checked && filters.categories.length === 1
                return (
                  <label
                    key={category.key}
                    htmlFor={id}
                    className="flex min-h-11 items-center gap-3 text-sm"
                  >
                    <Checkbox
                      id={id}
                      checked={checked}
                      disabled={!category.available || isLastChecked}
                      onCheckedChange={(next) =>
                        update({
                          categories: ENERGY_AUDIT_CATEGORIES.filter((item) =>
                            item.key === category.key
                              ? next === true
                              : filters.categories.includes(item.key)
                          ).map((item) => item.key),
                        })
                      }
                    />
                    <span
                      className={
                        category.available ? undefined : "text-muted-foreground"
                      }
                    >
                      {category.label}
                      {!category.available && " (belum tersedia)"}
                    </span>
                  </label>
                )
              })}
            </div>
          </FieldSet>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="export-branch">Cabang</FieldLabel>
              <MultiSelect
                id="export-branch"
                items={options.branches}
                value={filters.branches}
                onChange={(branches) =>
                  update({
                    branches,
                    // Drop stores that no longer belong to the chosen branches.
                    storeCodes: filters.storeCodes.filter((code) => {
                      const store = options.stores.find(
                        (item) => item.code === code
                      )
                      return (
                        branches.length === 0 ||
                        branches.includes(store?.branch ?? "")
                      )
                    }),
                  })
                }
                placeholder="Semua cabang"
                emptyText="Cabang tidak ditemukan."
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="export-store">Toko</FieldLabel>
              <MultiSelect
                id="export-store"
                items={storeCodes}
                value={filters.storeCodes}
                onChange={(storeCodes) => update({ storeCodes })}
                placeholder="Semua toko"
                emptyText="Toko tidak ditemukan."
                labelOf={storeLabel}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Status pemeriksaan</FieldLabel>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={1}
              value={filters.status}
              onValueChange={(value) => {
                if (value) update({ status: value as EnergyAuditExportStatus })
              }}
              className="flex w-full flex-wrap"
              aria-label="Status pemeriksaan"
            >
              <ToggleGroupItem value="all" className="h-11 flex-1">
                Selesai dan draf
              </ToggleGroupItem>
              <ToggleGroupItem value="completed" className="h-11 flex-1">
                Selesai saja
              </ToggleGroupItem>
            </ToggleGroup>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="export-from">Dari tanggal</FieldLabel>
              <Input
                id="export-from"
                type="date"
                value={filters.from ?? ""}
                max={filters.to ?? undefined}
                onChange={(e) => update({ from: e.target.value || null })}
                className="h-11"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="export-to">Sampai tanggal</FieldLabel>
              <Input
                id="export-to"
                type="date"
                value={filters.to ?? ""}
                min={filters.from ?? undefined}
                onChange={(e) => update({ to: e.target.value || null })}
                className="h-11"
              />
            </Field>
          </div>
        </FieldGroup>

        <section
          aria-labelledby="export-preview-title"
          aria-busy={isLoading}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="export-preview-title" className="text-sm font-semibold">
              Preview
            </h3>
            {ready && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {ready.storeCount} toko · {ready.sheets.length} sheet
              </span>
            )}
          </div>

          {isLoading && (
            <div className="flex flex-col gap-2" aria-label="Memuat preview">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-40 w-full" />
            </div>
          )}

          {!isLoading && preview && !preview.ok && (
            <Alert variant="destructive">
              <IconAlertTriangle />
              <AlertTitle>Preview gagal dimuat</AlertTitle>
              <AlertDescription>
                Periksa koneksi, lalu ubah salah satu filter untuk mencoba lagi.
                File Excel tetap bisa diunduh.
              </AlertDescription>
            </Alert>
          )}

          {isEmpty && (
            <Alert>
              <IconFileSpreadsheet />
              <AlertTitle>Tidak ada pemeriksaan yang cocok</AlertTitle>
              <AlertDescription>
                {filters.status === "completed"
                  ? "Hanya pemeriksaan yang sudah selesai yang dihitung. "
                  : ""}
                Lepas filter cabang, toko, atau tanggal untuk melihat lebih
                banyak toko.
              </AlertDescription>
            </Alert>
          )}

          {ready && ready.sheets.some((sheet) => sheet.totalRows > 0) && (
            <Tabs defaultValue={ready.sheets[0].name} key={query}>
              <div className="overflow-x-auto">
                <TabsList>
                  {ready.sheets.map((sheet) => (
                    <TabsTrigger key={sheet.name} value={sheet.name}>
                      {sheet.name}
                      <Badge variant="secondary">{sheet.totalRows}</Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {ready.sheets.map((sheet) => (
                <TabsContent key={sheet.name} value={sheet.name}>
                  <div className="max-h-72 overflow-auto rounded-xl border">
                    <Table>
                      {sheet.totalRows > sheet.rows.length && (
                        <TableCaption>
                          Menampilkan {sheet.rows.length} dari {sheet.totalRows}{" "}
                          baris. Semua baris ada di file Excel.
                        </TableCaption>
                      )}
                      <TableHeader>
                        <TableRow>
                          {sheet.header.map((cell, index) => (
                            <TableHead
                              key={index}
                              className="whitespace-nowrap"
                            >
                              {cell}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sheet.rows.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={sheet.header.length}
                              className="text-muted-foreground"
                            >
                              Sheet ini kosong untuk filter sekarang.
                            </TableCell>
                          </TableRow>
                        ) : (
                          sheet.rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <TableCell
                                  key={cellIndex}
                                  className="whitespace-nowrap tabular-nums"
                                >
                                  {cell || "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </section>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => setOpen(false)}
          >
            Tutup
          </Button>
          {isEmpty ? (
            <Button type="button" className="h-11" disabled>
              <IconDownload data-icon="inline-start" />
              Unduh Excel
            </Button>
          ) : (
            <Button asChild className="h-11">
              <a
                href={query ? `${EXPORT_ROUTE}?${query}` : EXPORT_ROUTE}
                download
              >
                <IconDownload data-icon="inline-start" />
                Unduh Excel
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
