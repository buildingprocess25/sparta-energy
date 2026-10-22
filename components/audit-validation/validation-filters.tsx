"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { IconSearch } from "@tabler/icons-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDebounce } from "@/hooks/use-debounce"
import type { ValidationListFilters } from "@/lib/audit-validation-queries"

type ValidationFiltersProps = {
  filters: ValidationListFilters
  topLimit: number
}

export function ValidationFilters({ filters, topLimit }: ValidationFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(filters.q)
  const debouncedQuery = useDebounce(query, 400)

  function applyFilters(next: Partial<ValidationListFilters>) {
    const merged = { ...filters, ...next, page: 1 }
    const params = new URLSearchParams()
    if (merged.view === "top") params.set("view", "top")
    if (merged.result !== "all") params.set("result", merged.result)
    if (merged.status !== "all") params.set("status", merged.status)
    if (merged.q) params.set("q", merged.q)
    const search = params.toString()
    startTransition(() => {
      router.replace(search ? `${pathname}?${search}` : pathname)
    })
  }

  useEffect(() => {
    if (debouncedQuery.trim() !== filters.q) {
      applyFilters({ q: debouncedQuery.trim() })
    }
    // Only react to the debounced text; applyFilters reads the latest filters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  return (
    <div className="flex flex-col gap-3" aria-busy={isPending}>
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={1}
        value={filters.view}
        onValueChange={(value) => {
          if (value) applyFilters({ view: value as ValidationListFilters["view"] })
        }}
        className="flex w-full"
        aria-label="Tampilan daftar"
      >
        <ToggleGroupItem
          value="all"
          className="h-11 flex-1 rounded-full px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"
        >
          Semua Toko
        </ToggleGroupItem>
        <ToggleGroupItem
          value="top"
          className="h-11 flex-1 rounded-full px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"
        >
          {topLimit} Paling Boros
        </ToggleGroupItem>
      </ToggleGroup>

      {filters.view === "all" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative col-span-2 sm:col-span-1">
            <IconSearch
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau kode toko"
              aria-label="Cari nama atau kode toko"
              className="h-11 pl-9"
            />
          </div>
          <Select
            value={filters.result}
            onValueChange={(value) =>
              applyFilters({ result: value as ValidationListFilters["result"] })
            }
          >
            <SelectTrigger className="w-full data-[size=default]:h-11 sm:w-36" aria-label="Filter hasil identifikasi">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua hasil</SelectItem>
              <SelectItem value="boros">Boros</SelectItem>
              <SelectItem value="hemat">Hemat</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              applyFilters({ status: value as ValidationListFilters["status"] })
            }
          >
            <SelectTrigger className="w-full data-[size=default]:h-11 sm:w-44" aria-label="Filter status validasi">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua status</SelectItem>
              <SelectItem value="pending">Menunggu validasi</SelectItem>
              <SelectItem value="validated">Sudah divalidasi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
