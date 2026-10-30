import type { EnergyAuditCategory } from "@prisma/client"

import { AVAILABLE_ENERGY_AUDIT_CATEGORIES } from "@/lib/energy-audit-categories"

export type EnergyAuditExportStatus = "all" | "completed"

export type EnergyAuditExportFilters = {
  categories: EnergyAuditCategory[]
  branches: string[]
  storeCodes: string[]
  status: EnergyAuditExportStatus
  // Inspection date range, YYYY-MM-DD, both inclusive.
  from: string | null
  to: string | null
}

type SearchParamValue = string | string[] | undefined
type SearchParamsInput = URLSearchParams | Record<string, SearchParamValue>

const DATE = /^\d{4}-\d{2}-\d{2}$/
const MAX_LIST = 200

function readAll(params: SearchParamsInput, key: string): string[] {
  if (params instanceof URLSearchParams) return params.getAll(key)
  const value = params[key]
  return Array.isArray(value) ? value : value ? [value] : []
}

// Accepts repeated keys (?cabang=A&cabang=B) and comma lists (?cabang=A,B).
function readList(params: SearchParamsInput, key: string) {
  const values = readAll(params, key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean)
  return Array.from(new Set(values)).slice(0, MAX_LIST)
}

function readDate(params: SearchParamsInput, key: string) {
  const value = readAll(params, key)[0]?.trim() ?? ""
  return DATE.test(value) && !Number.isNaN(Date.parse(value)) ? value : null
}

export function defaultExportFilters(): EnergyAuditExportFilters {
  return {
    categories: AVAILABLE_ENERGY_AUDIT_CATEGORIES.map(
      (category) => category.key
    ),
    branches: [],
    storeCodes: [],
    // Drafts stay in by default, as the recap always included them.
    status: "all",
    from: null,
    to: null,
  }
}

export function parseExportFilters(
  params: SearchParamsInput
): EnergyAuditExportFilters {
  const defaults = defaultExportFilters()
  const available = new Set<string>(defaults.categories)
  const requested = readList(params, "kategori").filter((key) =>
    available.has(key)
  )
  let from = readDate(params, "dari")
  let to = readDate(params, "sampai")
  if (from && to && from > to) [from, to] = [to, from]

  return {
    // No valid category in the URL means all of them, so an old link still exports everything.
    categories:
      requested.length > 0
        ? defaults.categories.filter((key) => requested.includes(key))
        : defaults.categories,
    branches: readList(params, "cabang"),
    storeCodes: readList(params, "toko").map((code) => code.toUpperCase()),
    status: readAll(params, "status")[0] === "selesai" ? "completed" : "all",
    from,
    to,
  }
}

export function toExportSearchParams(filters: EnergyAuditExportFilters) {
  const params = new URLSearchParams()
  const defaults = defaultExportFilters()
  if (filters.categories.length !== defaults.categories.length) {
    for (const key of filters.categories) params.append("kategori", key)
  }
  for (const branch of filters.branches) params.append("cabang", branch)
  for (const code of filters.storeCodes) params.append("toko", code)
  if (filters.status === "completed") params.set("status", "selesai")
  if (filters.from) params.set("dari", filters.from)
  if (filters.to) params.set("sampai", filters.to)
  return params
}

// Jakarta day bounds for the inspection date filter.
export function exportDateRange(
  filters: Pick<EnergyAuditExportFilters, "from" | "to">
) {
  const gte = filters.from
    ? new Date(`${filters.from}T00:00:00+07:00`)
    : undefined
  const lt = filters.to
    ? new Date(
        new Date(`${filters.to}T00:00:00+07:00`).getTime() + 24 * 60 * 60 * 1000
      )
    : undefined
  return gte || lt ? { gte, lt } : null
}

export function exportFileName(
  filters: EnergyAuditExportFilters,
  today: string
) {
  const parts = ["rekap-pemeriksaan"]
  if (filters.branches.length === 1) parts.push(filters.branches[0])
  if (filters.storeCodes.length === 1) parts.push(filters.storeCodes[0])
  if (filters.from || filters.to)
    parts.push(`${filters.from ?? "awal"}_${filters.to ?? "akhir"}`)
  parts.push(today)
  return `${parts.join("-").replace(/[^A-Za-z0-9._-]+/g, "_")}.xlsx`
}
