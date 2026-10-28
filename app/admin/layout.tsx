import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdmin } from "@/lib/admin-auth"
import { can } from "@/lib/role-access"
import {
  getAdminGapFilterEnabled,
  getAdminGapHiddenCount,
} from "@/lib/admin-gap-filter"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await requireAdmin()
  const [enabled, hiddenCount] = await Promise.all([
    getAdminGapFilterEnabled(),
    getAdminGapHiddenCount(),
  ])

  return (
    <AdminShell
      user={user}
      gapFilter={{ enabled, hiddenCount }}
      canManageUsers={can(user.role, "manageUsers")}
    >
      {children}
    </AdminShell>
  )
}
