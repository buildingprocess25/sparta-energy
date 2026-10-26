import type { EnergyAuditCategory, EnergyAuditStatus } from "@prisma/client"

import { AuditStatusBadge } from "@/components/energy-audit/audit-status-badge"
import { ENERGY_AUDIT_CATEGORIES } from "@/lib/energy-audit-categories"

type EnergyAuditCategoryStatusListProps = {
  items: Array<{ category: EnergyAuditCategory; status: EnergyAuditStatus }>
}

export function EnergyAuditCategoryStatusList({
  items,
}: EnergyAuditCategoryStatusListProps) {
  const statusByCategory = new Map(
    items.map((item) => [item.category, item.status])
  )

  return (
    <ul className="flex flex-col divide-y text-xs">
      {ENERGY_AUDIT_CATEGORIES.map((category) => (
        <li
          key={category.key}
          className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
        >
          <span className="min-w-0 truncate font-medium">{category.label}</span>
          {category.available ? (
            <AuditStatusBadge
              status={statusByCategory.get(category.key) ?? null}
            />
          ) : (
            <span className="shrink-0 text-muted-foreground">
              Belum tersedia
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
