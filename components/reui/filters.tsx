"use client"

import * as React from "react"
import {
  IconCheck,
  IconChevronDown,
  IconFilter,
  IconX,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type FilterOperator = {
  value: string
  label: string
}

export type FilterOption<T extends string = string> = {
  value: T
  label: string
  icon?: React.ReactNode
  className?: string
}

export type FilterFieldConfig<T extends string = string> = {
  key: string
  label: string
  type: "text" | "select" | "multiselect" | "custom" | "separator"
  icon?: React.ReactNode
  options?: FilterOption<T>[]
  operators?: FilterOperator[]
  defaultOperator?: string
  placeholder?: string
  searchable?: boolean
  maxSelections?: number
  prefix?: React.ReactNode | string
  suffix?: React.ReactNode | string
  pattern?: string
  validation?: (value: T[]) => boolean | object
  customRenderer?: (props: {
    filter: Filter<T>
    field: FilterFieldConfig<T>
    onChange: (filter: Filter<T>) => void
  }) => React.ReactNode
  customValueRenderer?: (
    values: T[],
    options?: FilterOption<T>[]
  ) => React.ReactNode
  fields?: FilterFieldConfig<T>[]
  group?: string
  className?: string
}

export type Filter<T extends string = string> = {
  id: string
  field: string
  operator: string
  values: T[]
}

export type FilterI18nConfig = {
  addFilter: string
  searchFields: string
  operators: Record<string, string>
  validation: Record<string, string>
  placeholders: Record<string, string>
}

export function createFilter<T extends string = string>(
  field: string,
  operator = "is",
  values: T[] = []
): Filter<T> {
  return {
    id: [field, operator, values.join("|") || "empty"].join(":"),
    field,
    operator,
    values,
  }
}

type FiltersProps<T extends string = string> = {
  filters: Filter<T>[]
  fields: FilterFieldConfig<T>[]
  onChange: (filters: Filter<T>[]) => void
  idPrefix?: string
  size?: "sm" | "default" | "lg"
  trigger?: React.ReactNode
  showSearchInput?: boolean
  allowMultiple?: boolean
  enableShortcut?: boolean
  shortcutKey?: string
  shortcutLabel?: string
  i18n?: Partial<FilterI18nConfig>
  className?: string
  menuPopupClassName?: string
}

const sizeToButtonSize = {
  sm: "sm",
  default: "default",
  lg: "lg",
} as const

function toDomId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-")
}

function getFieldMap<T extends string>(fields: FilterFieldConfig<T>[]) {
  return new Map(fields.map((field) => [field.key, field]))
}

function getValueLabel<T extends string>(
  field: FilterFieldConfig<T>,
  values: T[]
) {
  if (field.customValueRenderer) {
    return field.customValueRenderer(values, field.options)
  }

  if (!values.length) return field.placeholder ?? "Pilih nilai"

  const labels = values.map((value) => {
    const option = field.options?.find((item) => item.value === value)
    return option?.label ?? value
  })

  return labels.join(", ")
}

function replaceFilter<T extends string>(
  filters: Filter<T>[],
  nextFilter: Filter<T>,
  allowMultiple: boolean
) {
  if (allowMultiple) return [...filters, nextFilter]

  return [
    ...filters.filter((filter) => filter.field !== nextFilter.field),
    nextFilter,
  ]
}

function updateFilter<T extends string>(
  filters: Filter<T>[],
  currentId: string,
  nextFilter: Filter<T>
) {
  return filters.map((filter) =>
    filter.id === currentId ? nextFilter : filter
  )
}

function removeFilter<T extends string>(filters: Filter<T>[], id: string) {
  return filters.filter((filter) => filter.id !== id)
}

export function Filters<T extends string = string>({
  filters,
  fields,
  onChange,
  idPrefix = "filters",
  size = "default",
  trigger,
  allowMultiple = true,
  i18n,
  className,
  menuPopupClassName,
}: FiltersProps<T>) {
  const fieldMap = React.useMemo(() => getFieldMap(fields), [fields])
  const activeFieldKeys = React.useMemo(
    () => new Set(filters.map((filter) => filter.field)),
    [filters]
  )
  const availableFields = React.useMemo(
    () =>
      fields.filter(
        (field) =>
          field.type !== "separator" &&
          (allowMultiple || !activeFieldKeys.has(field.key))
      ),
    [activeFieldKeys, allowMultiple, fields]
  )
  const buttonSize = sizeToButtonSize[size]

  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-2",
        className
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger ?? (
            <Button
              id={`${idPrefix}-trigger`}
              type="button"
              variant="outline"
              size={buttonSize}
            >
              <IconFilter data-icon="inline-start" />
              {i18n?.addFilter ?? "Filter"}
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className={cn("w-64", menuPopupClassName)}
        >
          <DropdownMenuLabel>
            {i18n?.addFilter ?? "Tambah filter"}
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            {availableFields.length ? (
              availableFields.map((field) => (
                <DropdownMenuSub key={field.key}>
                  <DropdownMenuSubTrigger className={field.className}>
                    {field.icon}
                    <span className="truncate">{field.label}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="max-h-80 w-64 overflow-y-auto">
                    <DropdownMenuGroup>
                      {field.options?.length ? (
                        field.options.map((option) => {
                          if (field.type === "multiselect") {
                            const existingFilter = filters.find((f) => f.field === field.key)
                            const isChecked = existingFilter?.values.includes(option.value) ?? false
                            return (
                              <DropdownMenuCheckboxItem
                                key={option.value}
                                className={option.className}
                                checked={isChecked}
                                onSelect={(e) => e.preventDefault()}
                                onClick={() => {
                                  if (existingFilter) {
                                    const nextValues = existingFilter.values.includes(option.value)
                                      ? existingFilter.values.filter((v) => v !== option.value)
                                      : [...existingFilter.values, option.value]
                                    onChange(
                                      nextValues.length === 0
                                        ? removeFilter(filters, existingFilter.id)
                                        : updateFilter(
                                            filters,
                                            existingFilter.id,
                                            createFilter(
                                              field.key,
                                              existingFilter.operator,
                                              nextValues
                                            )
                                          )
                                    )
                                  } else {
                                    onChange([
                                      ...filters,
                                      createFilter(
                                        field.key,
                                        field.defaultOperator ?? "is",
                                        [option.value]
                                      ),
                                    ])
                                  }
                                }}
                              >
                                {option.icon}
                                <span className="truncate">{option.label}</span>
                              </DropdownMenuCheckboxItem>
                            )
                          }

                          return (
                            <DropdownMenuItem
                              key={option.value}
                              className={option.className}
                              onClick={() => {
                                onChange(
                                  replaceFilter(
                                    filters,
                                    createFilter(
                                      field.key,
                                      field.defaultOperator ?? "is",
                                      [option.value]
                                    ),
                                    allowMultiple
                                  )
                                )
                              }}
                            >
                              {option.icon}
                              <span className="truncate">{option.label}</span>
                            </DropdownMenuItem>
                          )
                        })
                      ) : (
                        <DropdownMenuItem disabled>
                          Belum ada opsi
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))
            ) : (
              <DropdownMenuItem disabled>Semua filter aktif</DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {filters.map((filter) => {
          const field = fieldMap.get(filter.field)
          if (!field) return null

          const selectedValue = filter.values[0]

          return (
            <DropdownMenu key={filter.id}>
              <DropdownMenuTrigger asChild>
                <Button
                  id={`${idPrefix}-${toDomId(filter.id)}-trigger`}
                  type="button"
                  variant="outline"
                  size={buttonSize}
                  className="max-w-full bg-background/70"
                >
                  {field.icon}
                  <span className="font-medium">{field.label}</span>
                  <span className="max-w-48 truncate text-muted-foreground">
                    {getValueLabel(field, filter.values)}
                  </span>
                  <IconChevronDown data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>{field.label}</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {field.options?.map((option) => {
                    if (field.type === "multiselect") {
                      const isChecked = filter.values.includes(option.value)
                      return (
                        <DropdownMenuCheckboxItem
                          key={option.value}
                          className={option.className}
                          checked={isChecked}
                          onSelect={(e) => e.preventDefault()}
                          onClick={() => {
                            const nextValues = filter.values.includes(option.value)
                              ? filter.values.filter((v) => v !== option.value)
                              : [...filter.values, option.value]
                            onChange(
                              nextValues.length === 0
                                ? removeFilter(filters, filter.id)
                                : updateFilter(
                                    filters,
                                    filter.id,
                                    createFilter(filter.field, filter.operator, nextValues)
                                  )
                            )
                          }}
                        >
                          {option.icon}
                          <span className="truncate">{option.label}</span>
                        </DropdownMenuCheckboxItem>
                      )
                    }

                    return (
                      <DropdownMenuItem
                        key={option.value}
                        className={option.className}
                        onClick={() => {
                          onChange(
                            updateFilter(
                              filters,
                              filter.id,
                              createFilter(filter.field, filter.operator, [
                                option.value,
                              ])
                            )
                          )
                        }}
                      >
                        {option.icon}
                        <span className="truncate">{option.label}</span>
                        {selectedValue === option.value && (
                          <IconCheck className="ml-auto" />
                        )}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onChange(removeFilter(filters, filter.id))}
                >
                  <IconX data-icon="inline-start" />
                  Hapus filter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}
      </div>
    </div>
  )
}
