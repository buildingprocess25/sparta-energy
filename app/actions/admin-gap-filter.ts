"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/admin-auth"
import { ADMIN_GAP_FILTER_COOKIE } from "@/lib/audit-gap-filter"

export async function setAdminGapFilter(enabled: boolean) {
  await requireAdmin()

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_GAP_FILTER_COOKIE, enabled ? "on" : "off", {
    path: "/admin",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  })
  revalidatePath("/admin", "layout")
}
