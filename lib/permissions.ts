// Daftar email USER yang diizinkan mengakses semua cabang (Super Auditor)
export const SUPER_AUDITOR_EMAILS = [
  "yogi.prayitno@sat.co.id",
]

/**
 * Mengecek apakah user memiliki akses ke semua cabang.
 * User memiliki akses penuh jika dia ADMIN atau emailnya ada di daftar SUPER_AUDITOR_EMAILS.
 */
export function hasFullBranchAccess(user: { email: string; role: string }) {
  return user.role === "ADMIN" || SUPER_AUDITOR_EMAILS.includes(user.email.toLowerCase())
}
