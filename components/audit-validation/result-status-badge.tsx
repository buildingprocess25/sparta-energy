import { IconFlame } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"

type ResultStatusBadgeProps = {
  isBoros: boolean
  isSangatBoros: boolean
}

// Admin-only label. "Sangat Boros" marks the 12 boros stores with the largest gap.
export function ResultStatusBadge({ isBoros, isSangatBoros }: ResultStatusBadgeProps) {
  if (isBoros && isSangatBoros) {
    return (
      <Badge className="border-transparent bg-[#b23f39] text-white">
        <IconFlame data-icon="inline-start" aria-hidden="true" />
        Sangat Boros
      </Badge>
    )
  }
  return (
    <Badge
      className={
        isBoros
          ? "border-transparent bg-[#c54b45] text-white"
          : "border-transparent bg-[#2c7a57] text-white"
      }
    >
      {isBoros ? "Boros" : "Hemat"}
    </Badge>
  )
}
