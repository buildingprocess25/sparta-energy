"use client"

import { useOptimistic, useTransition } from "react"

import { setAdminGapFilter } from "@/app/actions/admin-gap-filter"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const numberFormat = new Intl.NumberFormat("id-ID")

export type AdminGapFilterState = {
  enabled: boolean
  hiddenCount: number
}

export function AdminGapFilterToggle({
  enabled,
  hiddenCount,
}: AdminGapFilterState) {
  const [isPending, startTransition] = useTransition()
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(enabled)

  const description = optimisticEnabled
    ? `${numberFormat.format(hiddenCount)} kalkulasi dengan gap di luar ±20% disembunyikan dari halaman admin.`
    : "Semua kalkulasi ditampilkan, termasuk yang gap-nya di luar ±20%."

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex h-8 items-center gap-2 rounded-md border bg-background/60 px-2.5">
          <Switch
            id="admin-gap-filter"
            size="sm"
            checked={optimisticEnabled}
            disabled={isPending}
            aria-describedby="admin-gap-filter-description"
            onCheckedChange={(checked) =>
              startTransition(async () => {
                setOptimisticEnabled(checked)
                await setAdminGapFilter(checked)
              })
            }
          />
          <Label
            htmlFor="admin-gap-filter"
            className="text-xs whitespace-nowrap"
          >
            Gap ±20%
          </Label>
          <span id="admin-gap-filter-description" className="sr-only">
            {description}
          </span>
          {optimisticEnabled && hiddenCount > 0 && (
            <span className="hidden text-xs text-muted-foreground tabular-nums lg:inline">
              {numberFormat.format(hiddenCount)} disembunyikan
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-64">
        {description}
      </TooltipContent>
    </Tooltip>
  )
}
