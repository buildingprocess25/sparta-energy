import { headers } from "next/headers"
import type { Role } from "@prisma/client"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Only ADMIN for now. Add the auditor role here once it exists in the Role enum.
export function canValidateAudit(role: Role | null | undefined) {
  return role === "ADMIN"
}

export async function getAuditValidator() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, fullName: true, email: true, role: true },
  })

  if (!user || !canValidateAudit(user.role)) return null
  return user
}
