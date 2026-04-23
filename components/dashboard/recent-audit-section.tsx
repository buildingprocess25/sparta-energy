import Link from "next/link"
import { IconArrowRight } from "@tabler/icons-react"

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

        <Button
          variant="link"
          size="sm"
          asChild
          className="h-auto px-0 text-xs"
        >
          <Link href={href}>
            Lihat History
            <IconArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>

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
    </section>
  )
}

export { RecentAuditSection }
export type { RecentAuditItem }
