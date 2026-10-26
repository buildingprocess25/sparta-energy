import type { Role } from "@prisma/client"

import { getEnergyMonitoringUrl } from "@/lib/iot-status"

// Single source for what each role may open (docs/akses-role-admin-auditor-gs-area.md).
// AREA mirrors ADMIN until its own criteria exist; change it here only.

export const ROLES = [
  "ADMIN",
  "AUDITOR",
  "GS",
  "AREA",
  "USER",
] as const satisfies readonly Role[]

export const DEV_ROLE_COOKIE = "dev_role"

type RoleAccess = {
  homePath: "/admin-entry" | "/admin/dashboard" | "/dashboard" | "monitoring"
  adminPanel: boolean
  adminEntry: boolean
  // User & Akses and Master Data; AUDITOR reviews data but does not manage accounts.
  manageUsers: boolean
  validateAudits: boolean
  allBranches: boolean
  deleteAudits: boolean
  // Admin-only extras inside Mode Auditor: AC mapping, store search without branch lists, MEP log cleanup.
  adminTools: boolean
  // Mode Auditor: kalkulator, history, validasi and the other field pages.
  fieldApp: boolean
}

const ADMIN_ACCESS: RoleAccess = {
  homePath: "/admin-entry",
  adminPanel: true,
  adminEntry: true,
  manageUsers: true,
  validateAudits: true,
  allBranches: true,
  deleteAudits: true,
  adminTools: true,
  fieldApp: true,
}

export const ROLE_ACCESS: Record<Role, RoleAccess> = {
  ADMIN: ADMIN_ACCESS,
  AREA: { ...ADMIN_ACCESS, homePath: "/admin/dashboard" },
  AUDITOR: {
    homePath: "/admin-entry",
    adminPanel: true,
    adminEntry: true,
    manageUsers: false,
    validateAudits: true,
    allBranches: true,
    deleteAudits: false,
    adminTools: false,
    fieldApp: true,
  },
  GS: {
    homePath: "monitoring",
    adminPanel: false,
    adminEntry: false,
    manageUsers: false,
    validateAudits: false,
    allBranches: false,
    deleteAudits: false,
    adminTools: false,
    fieldApp: false,
  },
  USER: {
    homePath: "/dashboard",
    adminPanel: false,
    adminEntry: false,
    manageUsers: false,
    validateAudits: false,
    allBranches: false,
    deleteAudits: false,
    adminTools: false,
    fieldApp: true,
  },
}

export function isRole(value: unknown): value is Role {
  return ROLES.includes(value as Role)
}

export function getRoleAccess(
  role: Role | null | undefined
): RoleAccess | null {
  return role && isRole(role) ? ROLE_ACCESS[role] : null
}

export function can(
  role: Role | null | undefined,
  permission: Exclude<keyof RoleAccess, "homePath">
) {
  return getRoleAccess(role)?.[permission] ?? false
}

// The dev_role cookie only counts in local development (bagian 11 of the concept).
export function resolveRole(
  dbRole: Role | null | undefined,
  devRoleCookie: string | null | undefined
): Role | null {
  if (process.env.NODE_ENV === "development" && isRole(devRoleCookie)) {
    return devRoleCookie
  }
  return dbRole ?? null
}

// Absolute URL for GS, relative path for everyone else.
export function getHomeUrl(role: Role | null | undefined) {
  const homePath = getRoleAccess(role)?.homePath ?? "/dashboard"
  return homePath === "monitoring" ? getEnergyMonitoringUrl() : homePath
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  AUDITOR: "Auditor",
  GS: "GS (General Service)",
  AREA: "Area",
  USER: "User",
}

// Shown under the branch field in User & Akses.
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: "Admin dapat mengakses dashboard admin dan kalkulasi semua cabang.",
  AUDITOR:
    "Auditor dapat memvalidasi kalkulasi dan membuka dashboard admin untuk semua cabang, tanpa mengelola user dan master data.",
  GS: "GS hanya membuka portal monitoring IoT, dan hanya alat yang di-assign ke akunnya.",
  AREA: "Untuk sementara aksesnya sama dengan Admin. Langsung masuk ke dashboard admin.",
  USER: "User hanya dapat mengakses cabang yang ditetapkan.",
}

// Only USER is limited by users.branch; the other roles ignore it for now.
export function usesBranch(role: Role) {
  return role === "USER"
}
