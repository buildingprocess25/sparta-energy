"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IconAdjustmentsHorizontal, IconSearch } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { MasterStoreExportFilters } from "@/lib/admin-report-queries"

type AdminMasterStoreExportFilterProps = {
  branches: { branch: string; count: number }[]
  storeTypes: string[]
  value: MasterStoreExportFilters
}

const numberFormat = new Intl.NumberFormat("id-ID")
const toggleItemClass =
  "h-11 rounded-full px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"

export function AdminMasterStoreExportFilter({
  branches,
  storeTypes,
  value,
}: AdminMasterStoreExportFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const [search, setSearch] = useState("")

  const visibleBranches = useMemo(() => {
    const query = search.trim().toLowerCase()
    return query
      ? branches.filter((item) => item.branch.toLowerCase().includes(query))
      : branches
  }, [branches, search])

  const selected = new Set(draft.branches)
  const branchTotal = (
    draft.branches.length === 0
      ? branches
      : branches.filter((item) => selected.has(item.branch))
  ).reduce((total, item) => total + item.count, 0)
  const activeCount =
    (value.branches.length > 0 ? 1 : 0) +
    (value.types.length > 0 ? 1 : 0) +
    (value.completeness !== "all" ? 1 : 0) +
    (value.hours !== "all" ? 1 : 0)

  function toggleBranch(branch: string, checked: boolean) {
    setDraft((current) => ({
      ...current,
      branches: checked
        ? [...current.branches, branch]
        : current.branches.filter((item) => item !== branch),
    }))
  }

  function apply(next: MasterStoreExportFilters) {
    const params = new URLSearchParams(searchParams.toString())
    const entries = {
      mBranch: next.branches.join(","),
      mType: next.types.join(","),
      mComplete: next.completeness === "all" ? "" : next.completeness,
      mHours: next.hours === "all" ? "" : next.hours,
    }
    for (const [key, entry] of Object.entries(entries)) {
      if (entry) params.set(key, entry)
      else params.delete(key)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setDraft(value)
          setSearch("")
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <IconAdjustmentsHorizontal data-icon="inline-start" />
          Atur isi
          {activeCount > 0 && <Badge variant="secondary">{activeCount}</Badge>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Atur isi Export Master Toko</DialogTitle>
          <DialogDescription>
            Hasilnya satu sheet, dikelompokkan per cabang.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[calc(90svh-11rem)] flex-col gap-6 overflow-y-auto px-6 py-5">
          <section
            className="flex flex-col gap-3"
            aria-labelledby="export-branch"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 id="export-branch" className="text-sm font-semibold">
                Cabang
              </h3>
              <span className="text-xs text-muted-foreground">
                {draft.branches.length === 0
                  ? "Semua cabang"
                  : `${draft.branches.length} cabang dipilih`}
              </span>
            </div>
            <div className="relative">
              <IconSearch
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari cabang"
                aria-label="Cari cabang"
                className="h-11 pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                disabled={visibleBranches.length === 0}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    branches: Array.from(
                      new Set([
                        ...current.branches,
                        ...visibleBranches.map((item) => item.branch),
                      ])
                    ),
                  }))
                }
              >
                {search.trim() ? "Pilih hasil cari" : "Pilih semua"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                disabled={draft.branches.length === 0}
                onClick={() =>
                  setDraft((current) => ({ ...current, branches: [] }))
                }
              >
                Kosongkan
              </Button>
            </div>
            {visibleBranches.length === 0 ? (
              <p className="rounded-xl border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
                Tidak ada cabang dengan nama &ldquo;{search.trim()}&rdquo;.
              </p>
            ) : (
              <ul className="flex max-h-64 flex-col overflow-y-auto rounded-xl border">
                {visibleBranches.map((item) => {
                  const id = `export-branch-${item.branch}`
                  return (
                    <li key={item.branch} className="border-b last:border-0">
                      <label
                        htmlFor={id}
                        className="flex min-h-11 cursor-pointer items-center gap-3 px-3 text-sm hover:bg-muted/50"
                      >
                        <Checkbox
                          id={id}
                          checked={selected.has(item.branch)}
                          onCheckedChange={(checked) =>
                            toggleBranch(item.branch, checked === true)
                          }
                        />
                        <span className="flex-1">{item.branch}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {numberFormat.format(item.count)} toko
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section
            className="flex flex-col gap-3"
            aria-labelledby="export-type"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 id="export-type" className="text-sm font-semibold">
                Tipe toko
              </h3>
              <span className="text-xs text-muted-foreground">
                {draft.types.length === 0
                  ? "Semua tipe"
                  : `${draft.types.length} tipe dipilih`}
              </span>
            </div>
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={1}
              value={draft.types}
              onValueChange={(types) =>
                setDraft((current) => ({ ...current, types }))
              }
              className="flex w-full flex-wrap"
              aria-label="Tipe toko"
            >
              {storeTypes.map((type) => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  className={toggleItemClass}
                >
                  {type}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </section>

          <section
            className="flex flex-col gap-3"
            aria-labelledby="export-complete"
          >
            <h3 id="export-complete" className="text-sm font-semibold">
              Kelengkapan data
            </h3>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={1}
              value={draft.completeness}
              onValueChange={(completeness) => {
                if (completeness) {
                  setDraft((current) => ({
                    ...current,
                    completeness:
                      completeness as MasterStoreExportFilters["completeness"],
                  }))
                }
              }}
              className="flex w-full flex-wrap"
              aria-label="Kelengkapan data"
            >
              <ToggleGroupItem value="all" className={toggleItemClass}>
                Semua
              </ToggleGroupItem>
              <ToggleGroupItem value="complete" className={toggleItemClass}>
                Lengkap
              </ToggleGroupItem>
              <ToggleGroupItem value="incomplete" className={toggleItemClass}>
                Belum lengkap
              </ToggleGroupItem>
            </ToggleGroup>
          </section>

          <section
            className="flex flex-col gap-3"
            aria-labelledby="export-hours"
          >
            <h3 id="export-hours" className="text-sm font-semibold">
              Jam operasional
            </h3>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={1}
              value={draft.hours}
              onValueChange={(hours) => {
                if (hours) {
                  setDraft((current) => ({
                    ...current,
                    hours: hours as MasterStoreExportFilters["hours"],
                  }))
                }
              }}
              className="flex w-full flex-wrap"
              aria-label="Jam operasional"
            >
              <ToggleGroupItem value="all" className={toggleItemClass}>
                Semua
              </ToggleGroupItem>
              <ToggleGroupItem value="24h" className={toggleItemClass}>
                24 jam
              </ToggleGroupItem>
              <ToggleGroupItem value="non-24h" className={toggleItemClass}>
                Non-24 jam
              </ToggleGroupItem>
            </ToggleGroup>
          </section>
        </div>

        <DialogFooter className="flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {numberFormat.format(branchTotal)} toko di cabang terpilih. Filter
            tipe, kelengkapan, dan jam bisa mengurangi jumlahnya.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              type="button"
              variant="ghost"
              className="h-11"
              onClick={() =>
                setDraft({
                  branches: [],
                  types: [],
                  completeness: "all",
                  hours: "all",
                })
              }
            >
              Reset
            </Button>
            <Button type="button" className="h-11" onClick={() => apply(draft)}>
              Terapkan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
