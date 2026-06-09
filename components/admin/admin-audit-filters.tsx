"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  IconBuildingStore,
  IconCalendar,
  IconCalendarMonth,
  IconClipboardCheck,
  IconFilter,
  IconFilterOff,
  IconLeaf,
  IconSearch,
  IconUser,
} from "@tabler/icons-react"

import {
  createFilter,
  Filters,
  type Filter,
  type FilterFieldConfig,
} from "@/components/reui/filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AdminAuditAuditorOption } from "@/lib/admin-audit-queries"

type AdminAuditFiltersProps = {
  branches: string[]
  auditors: AdminAuditAuditorOption[]
  years: string[]
}

const monthOptions = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
]

function getParam(searchParams: URLSearchParams, key: string) {
  return searchParams.get(key) ?? ""
}

const filterParamKeys = [
  "branch",
  "auditor",
  "year",
  "month",
  "status",
  "recommendation",
] as const

const filterParamKeySet = new Set<string>(filterParamKeys)

export function AdminAuditFilters({
  branches,
  auditors,
  years,
}: AdminAuditFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamKey = searchParams.toString()
  const queryFromParams = useMemo(
    () => getParam(new URLSearchParams(searchParamKey), "q"),
    [searchParamKey]
  )
  const yearFromParams = useMemo(
    () => getParam(new URLSearchParams(searchParamKey), "year"),
    [searchParamKey]
  )
  const hasYearFilter = Boolean(yearFromParams && yearFromParams !== "all")

  const [query, setQuery] = useState(queryFromParams)

  useEffect(() => {
    setQuery(queryFromParams)
  }, [queryFromParams])

  const fields = useMemo<FilterFieldConfig<string>[]>(() => {
    const periodFields: FilterFieldConfig<string>[] = [
      {
        key: "branch",
        label: "Cabang",
        type: "multiselect",
        icon: <IconBuildingStore />,
        options: branches.map((item) => ({ value: item, label: item })),
      },
      {
        key: "auditor",
        label: "Auditor",
        type: "select",
        icon: <IconUser />,
        options: auditors.map((item) => ({
          value: item.id,
          label: item.label,
        })),
      },
      {
        key: "year",
        label: "Tahun",
        type: "select",
        icon: <IconCalendar />,
        options: years.map((item) => ({ value: item, label: item })),
      },
    ]

    if (hasYearFilter) {
      periodFields.push({
        key: "month",
        label: "Bulan",
        type: "select",
        icon: <IconCalendarMonth />,
        options: monthOptions,
      })
    }

    periodFields.push(
      {
        key: "status",
        label: "Status Audit",
        type: "select",
        icon: <IconLeaf />,
        options: [
          { value: "hemat", label: "Hemat" },
          { value: "boros", label: "Boros" },
        ],
      },
      {
        key: "recommendation",
        label: "Rekomendasi",
        type: "select",
        icon: <IconClipboardCheck />,
        options: [
          { value: "TRAINING", label: "Training" },
          { value: "REPAIR", label: "Repair" },
          { value: "MAINTENANCE", label: "Maintenance" },
        ],
      },
    )

    return periodFields
  }, [auditors, branches, hasYearFilter, years])

  const activeFilters = useMemo<Filter<string>[]>(() => {
    const params = new URLSearchParams(searchParamKey)

    return filterParamKeys.flatMap((key) => {
      if (key === "month" && !hasYearFilter) return []

      const value = getParam(params, key)
      if (!value || value === "all") return []
      const values = value.split(",").map((v) => v.trim()).filter(Boolean)
      return [createFilter(key, "is", values)]
    })
  }, [hasYearFilter, searchParamKey])

  const hasFilters = Boolean(queryFromParams || activeFilters.length)

  function pushParams(params: URLSearchParams) {
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function applyFilterChanges(nextFilters: Filter<string>[]) {
    const params = new URLSearchParams(searchParams.toString())
    const nextYear = nextFilters.find((filter) => filter.field === "year")
      ?.values[0]

    for (const key of filterParamKeys) {
      params.delete(key)
    }

    for (const filter of nextFilters) {
      if (!filterParamKeySet.has(filter.field)) continue
      if (filter.field === "month" && !nextYear) continue

      const value = filter.values.join(",")
      if (value) params.set(filter.field, value)
    }

    pushParams(params)
  }

  function applySearch() {
    const params = new URLSearchParams(searchParams.toString())
    const nextQuery = query.trim()

    if (nextQuery) params.set("q", nextQuery)
    else params.delete("q")

    pushParams(params)
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString())

    setQuery("")
    params.delete("q")
    for (const key of filterParamKeys) {
      params.delete(key)
    }

    pushParams(params)
  }

  return (
    <div className="flex min-w-0 flex-col gap-2 xl:flex-row xl:items-center">
      <form
        className="flex min-w-0 shrink-0 items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          applySearch()
        }}
      >
        <div className="relative w-full sm:w-[19rem]">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari kode atau nama toko..."
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Cari
        </Button>
      </form>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Filters
          filters={activeFilters}
          fields={fields}
          onChange={applyFilterChanges}
          allowMultiple={false}
          idPrefix="admin-audit-filters"
          size="default"
          className="min-w-0 flex-1"
          trigger={
            <Button
              id="admin-audit-filter-trigger"
              type="button"
              variant="outline"
            >
              <IconFilter data-icon="inline-start" />
              Filter
            </Button>
          }
          i18n={{
            addFilter: "Tambah filter",
          }}
        />

        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            className="shrink-0"
            onClick={clearFilters}
          >
            <IconFilterOff data-icon="inline-start" />
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
