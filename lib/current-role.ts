import { cookies } from "next/headers"
import type { Role } from "@prisma/client"

import { DEV_ROLE_COOKIE, resolveRole } from "@/lib/role-access"

// Role used for access checks: the stored role, or the dev_role simulation locally.
export async function getEffectiveRole(dbRole: Role | null | undefined) {
  const devRole = (await cookies()).get(DEV_ROLE_COOKIE)?.value
  return resolveRole(dbRole, devRole)
}

export async function withEffectiveRole<T extends { role: Role }>(
  user: T | null
): Promise<T | null> {
  if (!user) return null
  return { ...user, role: (await getEffectiveRole(user.role)) ?? user.role }
}
