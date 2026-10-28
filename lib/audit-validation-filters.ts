export type ValidationResultFilter = "all" | "boros" | "hemat"
export type ValidationStatusFilter = "all" | "pending" | "validated"
export type ValidationGapFilter = "all" | "inside" | "outside"

export type ValidationListFilters = {
  result: ValidationResultFilter
  status: ValidationStatusFilter
  gap: ValidationGapFilter
  q: string
  page: number
}

type SearchParamValue = string | string[] | undefined

function firstValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value
}

export function parseValidationFilters(
  params: Record<string, SearchParamValue>
): ValidationListFilters {
  const result = firstValue(params.result)
  const status = firstValue(params.status)
  const gap = firstValue(params.gap)
  const page = Number(firstValue(params.page))

  return {
    result: result === "boros" || result === "hemat" ? result : "all",
    // Validated stores leave the default list, so the auditor always starts on the next one to check.
    status: status === "all" || status === "validated" ? status : "pending",
    gap: gap === "inside" || gap === "outside" ? gap : "all",
    q: (firstValue(params.q) ?? "").trim().slice(0, 100),
    page: Number.isInteger(page) && page > 1 ? page : 1,
  }
}
