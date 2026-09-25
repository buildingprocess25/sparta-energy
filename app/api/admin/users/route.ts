import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin-auth"
import {
  adminUsersPageSize,
  getAdminUserRows,
  parseAdminUserOrder,
  parseAdminUserRole,
  parseAdminUserSort,
  type AdminUserFilters,
  type UserRole,
} from "@/lib/admin-user-queries"

function getFilter(value: string | null) {
  return value?.trim() || "all"
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const filters: AdminUserFilters = {
      q: searchParams.get("q")?.trim() ?? "",
      role: parseAdminUserRole(searchParams.get("role")),
      branch: getFilter(searchParams.get("branch")),
      sort: parseAdminUserSort(searchParams.get("sort")),
      order: parseAdminUserOrder(searchParams.get("order")),
    }

    const offset = Number(searchParams.get("offset")) || 0
    const limit = Number(searchParams.get("limit")) || adminUsersPageSize

    const result = await getAdminUserRows({ filters, offset, limit })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
