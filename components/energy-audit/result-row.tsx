import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"

type ResultRowProps = {
  label: string
  value: ReactNode
  hint?: ReactNode
  status?: { label: string; className: string }
}

// One computed figure in a result card: the value, then its standard and verdict when it has one.
export function ResultRow({ label, value, hint, status }: ResultRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="text-right font-bold tabular-nums">{value}</span>
      </div>
      {(hint || status) && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{hint}</span>
          {status && (
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
