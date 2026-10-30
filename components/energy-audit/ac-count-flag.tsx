import { statusTone } from "@/components/energy-audit/status-tone"
import { Badge } from "@/components/ui/badge"
import {
  formatAcCountResult,
  parseAcSummaryStatus,
  type AcCountStatus,
} from "@/lib/hvac-audit"
import { cn } from "@/lib/utils"

// Extra AC costs energy every day, so it reads as the stronger warning; too few is amber.
const toneByStatus: Record<AcCountStatus, string> = {
  SESUAI: statusTone.good,
  KURANG: statusTone.warn,
  LEBIH: statusTone.bad,
  BELUM_DIHITUNG: statusTone.idle,
}

type AcCountFlagProps =
  | { summaryStatus: string | null | undefined; className?: string }
  | { status: AcCountStatus; difference: number; className?: string }

export function AcCountFlag(props: AcCountFlagProps) {
  const result =
    "summaryStatus" in props
      ? parseAcSummaryStatus(props.summaryStatus)
      : { status: props.status, difference: props.difference }
  if (!result) return null

  return (
    <Badge
      variant="outline"
      className={cn(toneByStatus[result.status], props.className)}
    >
      {formatAcCountResult(result.status, result.difference)}
    </Badge>
  )
}
