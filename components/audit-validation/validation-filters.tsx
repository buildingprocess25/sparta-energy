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
import { useDebounce } from "@/hooks/use-debounce"
import { AUDIT_GAP_FILTER } from "@/lib/audit-gap-filter"
import type { ValidationListFilters } from "@/lib/audit-validation-filters"

const gapLabel = `±${Math.round(AUDIT_GAP_FILTER.maxGapThreshold * 100)}%`

type ValidationFiltersProps = {
  filters: ValidationListFilters
}

export function ValidationFilters({ filters }: ValidationFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(filters.q)
  const debouncedQuery = useDebounce(query, 400)

  function applyFilters(next: Partial<ValidationListFilters>) {
    const merged = { ...filters, ...next, page: 1 }
    const params = new URLSearchParams()
    if (merged.result !== "all") params.set("result", merged.result)
    if (merged.status !== "pending") params.set("status", merged.status)
    if (merged.gap !== "all") params.set("gap", merged.gap)
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
    <div
      className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_auto_auto_auto]"
      aria-busy={isPending}
    >
      <div className="relative col-span-2 md:col-span-1">
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
        value={filters.status}
        onValueChange={(value) =>
          applyFilters({ status: value as ValidationListFilters["status"] })
        }
      >
        <SelectTrigger
          className="col-span-2 w-full data-[size=default]:h-11 md:col-span-1 md:w-44"
          aria-label="Filter status validasi"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Menunggu validasi</SelectItem>
          <SelectItem value="validated">Sudah divalidasi</SelectItem>
          <SelectItem value="all">Semua status</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.result}
        onValueChange={(value) =>
          applyFilters({ result: value as ValidationListFilters["result"] })
        }
      >
        <SelectTrigger
          className="w-full data-[size=default]:h-11 md:w-36"
          aria-label="Filter hasil identifikasi"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua hasil</SelectItem>
          <SelectItem value="boros">Boros</SelectItem>
          <SelectItem value="hemat">Hemat</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.gap}
        onValueChange={(value) =>
          applyFilters({ gap: value as ValidationListFilters["gap"] })
        }
      >
        <SelectTrigger
          className="w-full data-[size=default]:h-11 md:w-36"
          aria-label="Filter selisih dari standar"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua selisih</SelectItem>
          <SelectItem value="inside">Dalam {gapLabel}</SelectItem>
          <SelectItem value="outside">Di luar {gapLabel}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
