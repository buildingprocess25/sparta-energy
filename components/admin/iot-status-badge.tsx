import {
  IconBroadcast,
  IconCloudOff,
  IconHistory,
  IconPlugConnectedX,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import type { StoreIotInfo } from "@/lib/iot-status"

export function IotStatusBadge({ iot }: { iot: StoreIotInfo | null }) {
  if (!iot) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <IconCloudOff data-icon="inline-start" aria-hidden="true" />
        Status IoT tidak tersedia
      </Badge>
    )
  }

  if (iot.status === "live") {
    return (
      <Badge className="border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
        <IconBroadcast data-icon="inline-start" aria-hidden="true" />
        {iot.isRecording ? "IoT merekam" : "IoT live"}
      </Badge>
    )
  }

  if (iot.status === "historical") {
    return (
      <Badge variant="secondary">
        <IconHistory data-icon="inline-start" aria-hidden="true" />
        IoT pernah dipasang
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="text-muted-foreground">
      <IconPlugConnectedX data-icon="inline-start" aria-hidden="true" />
      IoT belum dipasang
    </Badge>
  )
}
