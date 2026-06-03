import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin-auth"
import {
  getMasterStoreRows,
  masterStoresPageSize,
  parseMasterStoreHours,
  parseMasterStoreSort,
  parseSortOrder,
} from "@/lib/admin-master-data-queries"

function getFilter(searchParams: URLSearchParams, key: string) {
  return searchParams.get(key)?.trim() || "all"
}

export async function GET(request: Request) {
  await requireAdmin()

  const url = new URL(request.url)
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0) || 0)
  const filters = {
    q: url.searchParams.get("q")?.trim() ?? "",
    branch: getFilter(url.searchParams, "branch"),
    type: getFilter(url.searchParams, "type"),
    hours: parseMasterStoreHours(url.searchParams.get("hours")),
    sort: parseMasterStoreSort(url.searchParams.get("sort")),
    order: parseSortOrder(url.searchParams.get("order")),
  }

  const result = await getMasterStoreRows({
    filters,
    offset,
    limit: masterStoresPageSize,
  })

  return NextResponse.json(result)
}
