import { ReactNode } from "react"
import { IconAlertTriangle, IconLeaf } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item"

type AuditStatus = "hemat" | "boros"

interface AuditCardProps {
  status: AuditStatus
  title: ReactNode
  standardAverage: number
  actualAverage: number
  efficiency: number
}

export function AuditCard({
  status,
  title,
  standardAverage,
  actualAverage,
  efficiency,
}: AuditCardProps) {
  return (
    <Item size="sm" variant="outline" asChild>
      <a href="#">
        <ItemContent>
          <ItemTitle className="truncate font-semibold">{title}</ItemTitle>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-muted/30 px-3 py-2">
              <p className="text-[8px] tracking-[0.14em] text-muted-foreground uppercase">
                Standar
              </p>
              <p className="mt-1 text-[10px] leading-none font-semibold text-foreground">
                {standardAverage.toFixed(1)} kWh/m²
              </p>
            </div>

            <div className="rounded-xl bg-muted/30 px-3 py-2">
              <p className="text-[8px] tracking-[0.14em] text-muted-foreground uppercase">
                Aktual
              </p>
              <p className="mt-1 text-[10px] leading-none font-semibold text-foreground">
                {actualAverage.toFixed(1)} kWh/m²
              </p>
            </div>
          </div>
        </ItemContent>

        <ItemActions className="flex-col items-end self-stretch">
          <Badge
            variant={status === "hemat" ? "default" : "destructive"}
            className="h-5 rounded-full px-2 text-[9px] capitalize"
          >
            {status === "hemat" ? (
              <IconLeaf data-icon="inline-start" />
            ) : (
              <IconAlertTriangle data-icon="inline-start" />
            )}
            {status}
          </Badge>

          <div className="text-right">
            <p className="text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
              Efisiensi
            </p>
            <p className="mt-1 text-sm leading-none font-black text-primary">
              {efficiency.toFixed(1)}%
            </p>
          </div>
        </ItemActions>
      </a>
    </Item>
  )
}

export type { AuditCardProps }
