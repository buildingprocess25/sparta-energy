import type { EnergyAuditCategory, EnergyAuditStatus } from "@prisma/client"

import { AcCountFlag } from "@/components/energy-audit/ac-count-flag"
import { AuditStatusBadge } from "@/components/energy-audit/audit-status-badge"
import { ENERGY_AUDIT_CATEGORIES } from "@/lib/energy-audit-categories"

type EnergyAuditCategoryStatusListProps = {
  items: Array<{
    category: EnergyAuditCategory
    status: EnergyAuditStatus
    summaryStatus?: string | null
  }>
}

export function EnergyAuditCategoryStatusList({
  items,
}: EnergyAuditCategoryStatusListProps) {
  const itemByCategory = new Map(items.map((item) => [item.category, item]))

  return (
    <ul className="flex flex-col divide-y text-xs">
      {ENERGY_AUDIT_CATEGORIES.map((category) => (
        <li
          key={category.key}
          className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
        >
          <span className="min-w-0 truncate font-medium">{category.label}</span>
          {category.available ? (
            <span className="flex shrink-0 flex-wrap justify-end gap-1.5">
              {category.key === "TATA_UDARA_VENTILASI" && (
                <AcCountFlag
                  summaryStatus={
                    itemByCategory.get(category.key)?.summaryStatus
                  }
                />
              )}
              <AuditStatusBadge
                status={itemByCategory.get(category.key)?.status ?? null}
              />
            </span>
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
