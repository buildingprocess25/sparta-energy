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
  IconMapPin,
  IconPlus,
} from "@tabler/icons-react"
import { AdminMasterEquipmentDialog } from "@/components/admin/admin-master-equipment-dialog"
import type { MasterEquipmentTypeOption } from "@/lib/admin-master-data-queries"

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
  deviceCategories: string[]
  storeTypes: string[]
  equipmentTypeOptions: MasterEquipmentTypeOption[]
}

const filterParamKeys = ["deviceCategory", "category", "storeType", "hasBrands"] as const
const filterParamKeySet = new Set<string>(filterParamKeys)

function getParam(searchParams: URLSearchParams, key: string) {
  return searchParams.get(key) ?? ""
}

export function AdminMasterEquipmentFilters({
  categories,
  deviceCategories,
  storeTypes,
  equipmentTypeOptions,
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
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setQuery(queryFromParams)
  }, [queryFromParams])

  const fields = useMemo<FilterFieldConfig<string>[]>(
    () => [
      {
        key: "deviceCategory",
        label: "Kategori Jenis",
        type: "multiselect",
        icon: <IconVersions />,
        options: deviceCategories.map((item) => ({ value: item, label: item })),
      },
      {
        key: "category",
        label: "Area Penempatan",
        type: "multiselect",
        icon: <IconMapPin />,
        options: categories.map((item) => ({ value: item, label: item })),
      },
      {
        key: "storeType",
        label: "Tipe Toko",
        type: "multiselect",
        icon: <IconTag />,
        options: storeTypes.map((item) => ({ value: item, label: item })),
      },
      {
        key: "hasBrands",
        label: "Data Brand",
        type: "select",
        icon: <IconTool />,
        options: [
          { value: "with-brands", label: "Ada brand" },
          { value: "without-brands", label: "Belum ada brand" },
        ],
      },
    ],
    [deviceCategories, categories, storeTypes]
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
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between w-full">
      <div className="flex min-w-0 flex-1 flex-col gap-2 xl:flex-row xl:items-center">
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

      <div className="shrink-0">
        <Button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="w-full lg:w-auto"
        >
          <IconPlus data-icon="inline-start" className="size-4" />
          Tambah Equipment
        </Button>
      </div>

      <AdminMasterEquipmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        equipmentTypeOptions={equipmentTypeOptions}
        categories={categories}
        deviceCategories={deviceCategories}
        storeTypes={storeTypes}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
