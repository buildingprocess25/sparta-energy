import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { getEffectiveRole } from "@/lib/current-role"
import { prisma } from "@/lib/prisma"
import { can, getHomeUrl } from "@/lib/role-access"

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login?reason=session-expired")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      branch: true,
      role: true,
      image: true,
    },
  })

  if (!user) redirect("/forbidden")
  const role = await getEffectiveRole(user.role)
  if (!can(role, "adminPanel")) redirect(getHomeUrl(role))

  return { ...user, role: role ?? user.role }
}

// User & Akses and Master Data: roles that may change accounts and master records.
export async function requireUserManager() {
  const user = await requireAdmin()
  if (!can(user.role, "manageUsers")) redirect("/admin/dashboard")
  return user
}
