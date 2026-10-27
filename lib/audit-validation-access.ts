import { headers } from "next/headers"
import type { Role } from "@prisma/client"

import { auth } from "@/lib/auth"
import { getEffectiveRole } from "@/lib/current-role"
import { prisma } from "@/lib/prisma"
import { can } from "@/lib/role-access"

export function canValidateAudit(role: Role | null | undefined) {
  return can(role, "validateAudits")
}

export async function getAuditValidator() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, fullName: true, email: true, role: true },
  })

  if (!user) return null
  const role = await getEffectiveRole(user.role)
  if (!canValidateAudit(role)) return null
  return { ...user, role: role ?? user.role }
}
