import Link from "next/link"
import { IconBuildingStore, IconTool } from "@tabler/icons-react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MasterDataTab } from "@/lib/admin-master-data-queries"

export function AdminMasterDataNav({
  activeTab,
}: {
  activeTab: MasterDataTab
}) {
  return (
    <Tabs value={activeTab}>
      <TabsList>
        <TabsTrigger value="stores" asChild>
          <Link href="/admin/master-data?tab=stores">
            <IconBuildingStore data-icon="inline-start" />
            Master Toko
          </Link>
        </TabsTrigger>
        <TabsTrigger value="equipment" asChild>
          <Link href="/admin/master-data?tab=equipment">
            <IconTool data-icon="inline-start" />
            Master Equipment
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
