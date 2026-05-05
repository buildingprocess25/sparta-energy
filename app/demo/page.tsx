import { Suspense } from "react"

import { AuditStartClient } from "@/app/audit/start/start-client"
import { demoStores } from "@/lib/data/demo-audit"
import { getAllEquipmentMaster } from "@/lib/get-equipment-for-area"

export default async function DemoPage() {
  const masterItems = await getAllEquipmentMaster()

  return (
    <Suspense fallback={null}>
      <AuditStartClient
        stores={demoStores}
        masterItems={masterItems}
        basePath="/demo"
        dashboardPath="/"
        mode="demo"
      />
    </Suspense>
  )
}
