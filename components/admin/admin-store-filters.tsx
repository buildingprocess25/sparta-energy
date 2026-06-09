"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  IconBuildingStore,
  IconFilter,
  IconFilterOff,
  IconLeaf,
  IconSearch,
  IconTag,
} from "@tabler/icons-react"

import {
  createFilter,
  Filters,
  type Filter,
  type FilterFieldConfig,
} from "@/components/reui/filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AdminStoreFiltersProps = {
  branches: string[]
  storeTypes: string[]
}

function getParam(searchParams: URLSearchParams, key: string) {
  return searchParams.get(key) ?? ""
}

const filterParamKeys = ["branch", "status", "type"] as const
const filterParamKeySet = new Set<string>(filterParamKeys)

export function AdminStoreFilters({
  branches,
  storeTypes,
}: AdminStoreFiltersProps) {
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

  const branchOptions = useMemo(
    () => branches.map((item) => item.trim()).filter(Boolean),
    [branches]
  )
  const storeTypeOptions = useMemo(
    () => storeTypes.map((item) => item.trim()).filter(Boolean),
    [storeTypes]
  )

  const fields = useMemo<FilterFieldConfig<string>[]>(
    () => [
      {
        key: "branch",
        label: "Cabang",
        type: "multiselect",
        icon: <IconBuildingStore />,
        options: branchOptions.map((item) => ({ value: item, label: item })),
      },
      {
        key: "status",
        label: "Status Audit",
        type: "select",
        icon: <IconLeaf />,
        options: [
          { value: "hemat", label: "Hemat" },
          { value: "boros", label: "Boros" },
          { value: "not-audited", label: "Belum Audit" },
        ],
      },
      {
        key: "type",
        label: "Tipe Toko",
        type: "multiselect",
        icon: <IconTag />,
        options: storeTypeOptions.map((item) => ({
          value: item,
          label: item,
        })),
      },
    ],
    [branchOptions, storeTypeOptions]
  )

  const activeFilters = useMemo<Filter<string>[]>(() => {
    const params = new URLSearchParams(searchParamKey)

    return filterParamKeys.flatMap((key) => {
      const value = getParam(params, key)
      if (!value || value === "all") return []
      const values = value.split(",").map((v) => v.trim()).filter(Boolean)
      return [createFilter(key, "is", values)]
    })
  }, [searchParamKey])

  const hasFilters = Boolean(queryFromParams || activeFilters.length)

  function pushParams(params: URLSearchParams) {
    params.delete("page")

    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function applyFilterChanges(nextFilters: Filter<string>[]) {
    const params = new URLSearchParams(searchParams.toString())

    for (const key of filterParamKeys) {
      params.delete(key)
    }

    for (const filter of nextFilters) {
      if (!filterParamKeySet.has(filter.field)) continue

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
          idPrefix="admin-store-filters"
          size="default"
          className="min-w-0 flex-1"
          trigger={
            <Button
              id="admin-store-filter-trigger"
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
