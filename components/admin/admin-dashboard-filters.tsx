"use client"

import { useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  IconBuildingStore,
  IconCalendar,
  IconCalendarMonth,
  IconFilter,
  IconFilterOff,
  IconTag,
} from "@tabler/icons-react"

import {
  createFilter,
  Filters,
  type Filter,
  type FilterFieldConfig,
} from "@/components/reui/filters"
import { Button } from "@/components/ui/button"

type AdminDashboardFiltersProps = {
  branches: string[]
  storeTypes: string[]
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

const filterParamKeys = ["year", "month", "branch", "type"] as const
const filterParamKeySet = new Set<string>(filterParamKeys)

function getParam(searchParams: URLSearchParams, key: string) {
  return searchParams.get(key) ?? ""
}

export function AdminDashboardFilters({
  branches,
  storeTypes,
  years,
}: AdminDashboardFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamKey = searchParams.toString()
  const yearFromParams = useMemo(
    () => getParam(new URLSearchParams(searchParamKey), "year"),
    [searchParamKey]
  )
  const hasYearFilter = Boolean(yearFromParams && yearFromParams !== "all")

  const fields = useMemo<FilterFieldConfig<string>[]>(() => {
    const nextFields: FilterFieldConfig<string>[] = [
      {
        key: "year",
        label: "Tahun",
        type: "select",
        icon: <IconCalendar />,
        options: years.map((item) => ({ value: item, label: item })),
      },
    ]

    if (hasYearFilter) {
      nextFields.push({
        key: "month",
        label: "Bulan",
        type: "select",
        icon: <IconCalendarMonth />,
        options: monthOptions,
      })
    }

    nextFields.push(
      {
        key: "branch",
        label: "Cabang",
        type: "multiselect",
        icon: <IconBuildingStore />,
        options: branches.map((item) => ({ value: item, label: item })),
      },
      {
        key: "type",
        label: "Tipe Toko",
        type: "multiselect",
        icon: <IconTag />,
        options: storeTypes.map((item) => ({ value: item, label: item })),
      }
    )

    return nextFields
  }, [branches, hasYearFilter, storeTypes, years])

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

  const hasFilters = activeFilters.length > 0

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

    params.delete("period")
    params.delete("months")

    for (const filter of nextFilters) {
      if (!filterParamKeySet.has(filter.field)) continue
      if (filter.field === "month" && !nextYear) continue

      const value = filter.values.join(",")
      if (value) params.set(filter.field, value)
    }

    pushParams(params)
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString())

    for (const key of filterParamKeys) {
      params.delete(key)
    }
    params.delete("period")
    params.delete("months")

    pushParams(params)
  }

  return (
    <div className="hidden min-w-0 items-center gap-2 lg:flex">
      <Filters
        filters={activeFilters}
        fields={fields}
        onChange={applyFilterChanges}
        allowMultiple={false}
        idPrefix="admin-dashboard-filters"
        size="sm"
        className="min-w-0"
        trigger={
          <Button
            id="admin-dashboard-filter-trigger"
            type="button"
            variant="outline"
            size="sm"
            className="bg-background/60"
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
          size="sm"
          className="shrink-0"
          onClick={clearFilters}
        >
          <IconFilterOff data-icon="inline-start" />
          Reset
        </Button>
      )}
    </div>
  )
}
