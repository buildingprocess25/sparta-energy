import { headers } from "next/headers"
import { NextResponse } from "next/server"

import {
  adminStoresPageSize,
  getAdminStoreRows,
  parseAdminStoreSort,
  parseSortOrder,
  parseStoreIotFilter,
  parseStorePriority,
  parseStoreValidation,
  type StoreStatus,
} from "@/lib/admin-store-queries"
import { auth } from "@/lib/auth"
import { getEffectiveRole } from "@/lib/current-role"
import { prisma } from "@/lib/prisma"
import { can } from "@/lib/role-access"

function getFilter(searchParams: URLSearchParams, key: string) {
  return searchParams.get(key)?.trim() || "all"
}

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  return can(await getEffectiveRole(user?.role), "adminPanel")
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0) || 0)
  const filters = {
    q: url.searchParams.get("q")?.trim() ?? "",
    branch: getFilter(url.searchParams, "branch"),
    status: getFilter(url.searchParams, "status") as StoreStatus | "all",
    type: getFilter(url.searchParams, "type"),
    validation: parseStoreValidation(url.searchParams.get("validation")),
    priority: parseStorePriority(url.searchParams.get("priority")),
    iot: parseStoreIotFilter(url.searchParams.get("iot")),
    sort: parseAdminStoreSort(url.searchParams.get("sort")),
    order: parseSortOrder(url.searchParams.get("order")),
  }

  const result = await getAdminStoreRows({
    filters,
    offset,
    limit: adminStoresPageSize,
  })

  return NextResponse.json(result)
}
