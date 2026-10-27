import { IconCircleCheck, IconClock } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function ValidationStatusBadge({ validated }: { validated: boolean }) {
  return (
    <Badge
      className={cn(
        "border-transparent",
        validated
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
      )}
    >
      {validated ? (
        <IconCircleCheck data-icon="inline-start" aria-hidden="true" />
      ) : (
        <IconClock data-icon="inline-start" aria-hidden="true" />
      )}
      {validated ? "Sudah divalidasi" : "Menunggu validasi"}
    </Badge>
  )
}
