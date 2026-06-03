"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  IconFilter,
  IconFilterOff,
  IconSearch,
  IconTag,
  IconTool,
  IconVersions,
} from "@tabler/icons-react"

import {
  createFilter,
  Filters,
  type Filter,
  type FilterFieldConfig,
} from "@/components/reui/filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AdminMasterEquipmentFiltersProps = {
  categories: string[]
  storeTypes: string[]
}

const filterParamKeys = ["category", "storeType", "hasBrands"] as const
const filterParamKeySet = new Set<string>(filterParamKeys)

function getParam(searchParams: URLSearchParams, key: string) {
  return searchParams.get(key) ?? ""
}

export function AdminMasterEquipmentFilters({
  categories,
  storeTypes,
}: AdminMasterEquipmentFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamKey = searchParams.toString()
  const queryFromParams = useMemo(
    () => getParam(new URLSearchParams(searchParamKey), "q"),
    [searchParamKey]
  )
  const [query, setQuery] = useState(queryFromParams)

  useEffect(() => {
    setQuery(queryFromParams)
  }, [queryFromParams])

  const fields = useMemo<FilterFieldConfig<string>[]>(
    () => [
      {
        key: "category",
        label: "Kategori",
        type: "select",
        icon: <IconTool />,
        options: categories.map((item) => ({ value: item, label: item })),
      },
      {
        key: "storeType",
        label: "Tipe Toko",
        type: "select",
        icon: <IconTag />,
        options: storeTypes.map((item) => ({ value: item, label: item })),
      },
      {
        key: "hasBrands",
        label: "Data Brand",
        type: "select",
        icon: <IconVersions />,
        options: [
          { value: "with-brands", label: "Ada brand" },
          { value: "without-brands", label: "Belum ada brand" },
        ],
      },
    ],
    [categories, storeTypes]
  )

  const activeFilters = useMemo<Filter<string>[]>(() => {
    const params = new URLSearchParams(searchParamKey)

    return filterParamKeys.flatMap((key) => {
      const value = getParam(params, key)
      if (!value || value === "all") return []
      return [createFilter(key, "is", [value])]
    })
  }, [searchParamKey])

  const hasFilters = Boolean(queryFromParams || activeFilters.length)

  function pushParams(params: URLSearchParams) {
    params.set("tab", "equipment")

    const qs = params.toString()
    router.push(`${pathname}?${qs}`)
  }

  function applyFilterChanges(nextFilters: Filter<string>[]) {
    const params = new URLSearchParams(searchParams.toString())

    for (const key of filterParamKeys) {
      params.delete(key)
    }

    for (const filter of nextFilters) {
      if (!filterParamKeySet.has(filter.field)) continue

      const value = filter.values[0]
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
        <div className="relative w-full sm:w-[22rem]">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari equipment, kategori, atau brand..."
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
          idPrefix="admin-master-equipment-filters"
          size="default"
          className="min-w-0 flex-1"
          trigger={
            <Button
              id="admin-master-equipment-filter-trigger"
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
