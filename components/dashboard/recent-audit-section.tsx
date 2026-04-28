import Link from "next/link"
import { IconArrowRight, IconClipboardList } from "@tabler/icons-react"

import { AuditCard } from "@/components/dashboard/audit-card"
import { Button } from "@/components/ui/button"

type RecentAuditStatus = "hemat" | "boros"

type RecentAuditItem = {
  id: string
  storeName: string
  period: string
  status: RecentAuditStatus
  standardAverage: number
  actualAverage: number
  efficiency: number
}

type RecentAuditSectionProps = {
  items: RecentAuditItem[]
  href?: string
}

function RecentAuditSection({
  items,
  href = "/history",
}: RecentAuditSectionProps) {
  const visibleItems = items.slice(0, 3)

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Riwayat Audit</h2>
          <p className="text-[11px] text-muted-foreground">
            3 audit terakhir toko Anda
          </p>
        </div>

        {visibleItems.length > 0 && (
          <Button
            variant="link"
            size="sm"
            asChild
            className="h-auto px-0 text-xs"
          >
            <Link href={href}>
              Lihat Riwayat
              <IconArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        )}
      </div>

      {visibleItems.length > 0 ? (
        <div className="flex flex-col gap-4">
          {visibleItems.map((item) => (
            <AuditCard
              key={item.id}
              id={item.id}
              status={item.status}
              storeName={item.storeName}
              period={item.period}
              standardAverage={item.standardAverage}
              actualAverage={item.actualAverage}
              efficiency={item.efficiency}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <IconClipboardList className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Belum ada audit
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Mulai audit pertama Anda untuk melihat riwayat di sini
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

export { RecentAuditSection }
export type { RecentAuditItem }
