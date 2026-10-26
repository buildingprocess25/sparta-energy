import Link from "next/link"
import {
  IconChevronRight,
  IconClipboardCheck,
} from "@tabler/icons-react"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import type { ValidationListRow } from "@/lib/audit-validation-queries"
import { formatGap, formatKwh } from "@/components/audit-validation/format"
import { ResultStatusBadge } from "@/components/audit-validation/result-status-badge"
import { ValidationStatusBadge } from "@/components/audit-validation/validation-status-badge"
import { cn } from "@/lib/utils"

type ValidationStoreListProps = {
  rows: ValidationListRow[]
  startRank: number
  emptyMessage: string
}

export function ValidationStoreList({
  rows,
  startRank,
  emptyMessage,
}: ValidationStoreListProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <IconClipboardCheck aria-hidden="true" className="size-6" />
        </div>
        <p className="max-w-xs text-sm font-semibold">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <ol className="flex flex-col gap-2">
      {rows.map((row, index) => (
        <li key={row.auditId}>
          <Item variant="outline" asChild className="bg-card">
            <Link href={`/audit/validation/${row.auditId}`}>
              <span
                aria-hidden="true"
                className="w-6 shrink-0 text-center text-sm font-bold text-muted-foreground tabular-nums"
              >
                {startRank + index}
              </span>
              <ItemContent className="min-w-0">
                <ItemTitle className="w-full truncate">{row.storeName}</ItemTitle>
                <ItemDescription className="truncate">
                  {row.storeCode}
                  {row.branch ? ` · ${row.branch}` : ""}
                </ItemDescription>
                <p className="text-xs text-muted-foreground tabular-nums">
                  Aktual PLN {formatKwh(row.actualKwhPerMonth)} · Standar{" "}
                  konsumsi energi {formatKwh(row.baselineKwhPerMonth)}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <ResultStatusBadge
                    isBoros={row.isBoros}
                    isSangatBoros={row.isSangatBoros}
                  />
                  <ValidationStatusBadge validated={row.isValidated} />
                </div>
              </ItemContent>
              {row.gapPercent !== null && (
                <ItemActions className="flex-col items-end gap-0.5">
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      row.isBoros
                        ? "text-[#b23f39] dark:text-[#e07a74]"
                        : "text-primary"
                    )}
                  >
                    {formatGap(row.gapPercent)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    dari standar
                  </span>
                </ItemActions>
              )}
              <IconChevronRight
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
            </Link>
          </Item>
        </li>
      ))}
    </ol>
  )
}
