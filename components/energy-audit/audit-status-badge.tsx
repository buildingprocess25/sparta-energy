import { IconCircleCheck, IconCircleDashed, IconClock } from "@tabler/icons-react"
import type { EnergyAuditStatus } from "@prisma/client"

import { Badge } from "@/components/ui/badge"

export function AuditStatusBadge({ status }: { status: EnergyAuditStatus | null }) {
  if (status === "COMPLETED") {
    return (
      <Badge className="border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
        <IconCircleCheck data-icon="inline-start" aria-hidden="true" />
        Selesai
      </Badge>
    )
  }
  if (status === "DRAFT") {
    return (
      <Badge className="border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
        <IconClock data-icon="inline-start" aria-hidden="true" />
        Draf
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <IconCircleDashed data-icon="inline-start" aria-hidden="true" />
      Belum diperiksa
    </Badge>
  )
}
