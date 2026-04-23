import { Suspense } from "react"

import { AuditStartClient } from "@/app/audit/start/start-client"
import { demoStores } from "@/lib/data/demo-audit"
import { getEquipmentForAreas } from "@/lib/get-equipment-for-area"

const AREA_NAMES = ["Sales", "Teras", "Parkiran", "Gudang, Toilet & Selasar"]

export default async function DemoPage() {
  const equipmentByArea = await getEquipmentForAreas(AREA_NAMES)

  return (
    <Suspense fallback={null}>
      <AuditStartClient
        stores={demoStores}
        equipmentByArea={equipmentByArea}
        basePath="/demo"
        dashboardPath="/"
        mode="demo"
      />
    </Suspense>
  )
}
