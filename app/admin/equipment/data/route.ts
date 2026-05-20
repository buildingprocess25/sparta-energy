import { headers } from "next/headers"
import { NextResponse } from "next/server"

import {
  adminEquipmentPageSize,
  getAdminEquipmentRows,
  parseAdminEquipmentOrder,
  parseAdminEquipmentSort,
  type EquipmentArea,
} from "@/lib/admin-equipment-queries"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const validAreas = new Set(["PARKING", "TERRACE", "SALES", "WAREHOUSE"])

function getFilter(searchParams: URLSearchParams, key: string) {
  return searchParams.get(key)?.trim() || "all"
}

function parseArea(value: string | null): EquipmentArea | "all" {
  const nextValue = value?.trim() || "all"
  return validAreas.has(nextValue) ? (nextValue as EquipmentArea) : "all"
}

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  return user?.role === "ADMIN"
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
    area: parseArea(url.searchParams.get("area")),
    equipment: getFilter(url.searchParams, "equipment"),
    brand: getFilter(url.searchParams, "brand"),
    sort: parseAdminEquipmentSort(url.searchParams.get("sort")),
    order: parseAdminEquipmentOrder(url.searchParams.get("order")),
  }

  const result = await getAdminEquipmentRows({
    filters,
    offset,
    limit: adminEquipmentPageSize,
  })

  return NextResponse.json(result)
}
