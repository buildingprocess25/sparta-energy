/**
 * Mengecek apakah user memiliki akses ke semua cabang.
 * User memiliki akses penuh jika dia ADMIN atau jika cabangnya bernilai "*" atau "all".
 */
export function hasFullBranchAccess(user: { email?: string; role: string; branch?: string | null }) {
  return (
    user.role === "ADMIN" ||
    user.branch === "*" ||
    user.branch?.toLowerCase() === "all"
  )
}

