import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuildingStore,
  IconLeaf,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type AuditItem = {
  id: string
  site: string
  location: string
  intensity: string
  unit: string
  relativeTime: string
  status: "hemat" | "boros"
}

type AuditListSectionProps = {
  items: AuditItem[]
}

function AuditListSection({ items }: AuditListSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Kalkulasi Terkini</h2>
        <Button variant="link" size="sm" className="h-auto px-0 text-xs">
          Lihat Semua
          <IconArrowRight data-icon="inline-end" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Card
            key={item.id}
            size="sm"
            className="gap-3 transition-shadow hover:shadow-sm"
          >
            <CardContent className="flex items-start gap-3">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-secondary">
                <IconBuildingStore className="size-7" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-medium">{item.site}</h3>
                  <Badge
                    variant={
                      item.status === "hemat" ? "default" : "destructive"
                    }
                    className="capitalize"
                  >
                    {item.status === "hemat" ? (
                      <IconLeaf data-icon="inline-start" />
                    ) : (
                      <IconAlertTriangle data-icon="inline-start" />
                    )}
                    {item.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>ID: {item.id}</span>
                  <span className="size-1 rounded-full bg-muted-foreground/40" />
                  <span className="truncate">{item.location}</span>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <p className="flex items-end gap-1">
                    <span className="text-lg leading-none font-semibold text-primary">
                      {item.intensity}
                    </span>
                    <span className="text-[10px] leading-none text-muted-foreground">
                      {item.unit}
                    </span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.relativeTime}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

export { AuditListSection }
export type { AuditItem }
