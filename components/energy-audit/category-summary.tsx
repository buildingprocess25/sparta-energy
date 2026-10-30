import type { EnergyAuditCategory, EnergyAuditStatus } from "@prisma/client"

import { AcCountFlag } from "@/components/energy-audit/ac-count-flag"
import { LPD_STATUS_LABEL, type LpdStatus } from "@/lib/lighting-audit"

type CategorySummaryProps = {
  category: EnergyAuditCategory
  status: EnergyAuditStatus | null
  summaryStatus: string | null
}

// The one result each category stores in summary_status; add a branch here when a category opens.
export function CategorySummary({
  category,
  status,
  summaryStatus,
}: CategorySummaryProps) {
  if (!summaryStatus) return null

  if (category === "TATA_CAHAYA") {
    // A lighting draft has no final LPD yet.
    if (status !== "COMPLETED") return null
    return (
      <span className="text-xs text-muted-foreground">
        {LPD_STATUS_LABEL[summaryStatus as LpdStatus] ?? summaryStatus}
      </span>
    )
  }

  if (category === "TATA_UDARA_VENTILASI") {
    return <AcCountFlag summaryStatus={summaryStatus} />
  }

  return null
}
