import type { Role } from "@prisma/client"

import { can } from "@/lib/role-access"

/**
 * Mengecek apakah user memiliki akses ke semua cabang.
 * User memiliki akses penuh jika perannya boleh melihat semua cabang (lib/role-access.ts) atau jika cabangnya bernilai "*" atau "all".
 */
export function hasFullBranchAccess(user: { email?: string; role: string; branch?: string | null }) {
  return (
    can(user.role as Role, "allBranches") ||
    user.branch === "*" ||
    user.branch?.toLowerCase() === "all"
  )
}

