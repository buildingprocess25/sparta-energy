import Link from "next/link"
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconLeaf,
  IconTrash,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item"

type AuditStatus = "hemat" | "boros"

interface AuditCardProps {
  id: string
  status: AuditStatus
  storeName: string
  period: string
  standardAverage: number
  actualAverage: number
  efficiency: number
  isValidated?: boolean
  onDelete?: () => void
}

export function AuditCard({
  id,
  status,
  storeName,
  period,
  standardAverage,
  actualAverage,
  efficiency,
  isValidated = false,
  onDelete,
}: AuditCardProps) {
  const href = `/audit/${id}`

  const details = (
    <>
      <p className="flex flex-wrap items-center gap-x-1.5 text-[11px] font-medium text-muted-foreground">
        {period}
        {isValidated && (
          <span className="inline-flex items-center gap-0.5 font-semibold text-primary">
            <IconCircleCheck aria-hidden="true" className="size-3.5" />
            Divalidasi
          </span>
        )}
      </p>

      <div className="mt-1.5 grid grid-cols-2 gap-2">
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
    </>
  )

  const summary = (
    <>
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
    </>
  )

  if (!onDelete) {
    return (
      <Item size="sm" variant="outline" asChild>
        <Link href={href}>
          <ItemContent className="gap-0.5">
            <ItemTitle className="truncate font-semibold">{storeName}</ItemTitle>
            {details}
          </ItemContent>

          <ItemActions className="flex-col items-end self-stretch">
            {summary}
          </ItemActions>
        </Link>
      </Item>
    )
  }

  // A button cannot sit inside a link, so the title link is stretched over the
  // card and the delete button is layered above it.
  return (
    <Item
      size="sm"
      variant="outline"
      className="relative has-[a:hover]:bg-muted has-[a:focus-visible]:border-ring has-[a:focus-visible]:ring-[3px] has-[a:focus-visible]:ring-ring/50"
    >
      <ItemContent className="gap-0.5">
        <ItemTitle className="w-full truncate font-semibold">
          <Link
            href={href}
            className="truncate outline-none after:absolute after:inset-0 after:rounded-2xl"
          >
            {storeName}
          </Link>
        </ItemTitle>
        {details}
      </ItemContent>

      <ItemActions className="flex-col items-end self-stretch">
        {summary}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative z-10 size-11 text-destructive hover:text-destructive"
          aria-label={`Hapus kalkulasi ${storeName} ${period}`}
          onClick={onDelete}
        >
          <IconTrash />
        </Button>
      </ItemActions>
    </Item>
  )
}

export type { AuditCardProps }
