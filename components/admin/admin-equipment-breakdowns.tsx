"use client"

import type { AdminEquipmentBreakdownRow } from "@/lib/admin-equipment-queries"
import { cn } from "@/lib/utils"

const numberFormat = new Intl.NumberFormat("id-ID")

function formatKwh(value: number) {
  return `${numberFormat.format(Math.round(value))} kWh/hari`
}

function BreakdownList({
  title,
  data,
  accent = "bg-primary",
}: {
  title: string
  data: AdminEquipmentBreakdownRow[]
  accent?: string
}) {
  const maxValue = Math.max(...data.map((item) => item.dailyKwh), 0)

  return (
    <section className="min-w-0 border-t pt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">{title}</h2>
        <span className="text-xs text-muted-foreground">
          Top {numberFormat.format(data.length)}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {data.length > 0 ? (
          data.map((item, index) => {
            const percent = maxValue > 0 ? (item.dailyKwh / maxValue) * 100 : 0

            return (
              <div key={`${item.key}-${index}`} className="min-w-0">
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-medium">{item.label}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatKwh(item.dailyKwh)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", accent)}
                    style={{ width: `${Math.max(percent, 4)}%` }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Qty {numberFormat.format(item.qty)}
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-sm text-muted-foreground">
            Belum ada data sesuai filter.
          </p>
        )}
      </div>
    </section>
  )
}

export function AdminEquipmentBreakdowns({
  area,
  equipment,
  brand,
}: {
  area: AdminEquipmentBreakdownRow[]
  equipment: AdminEquipmentBreakdownRow[]
  brand: AdminEquipmentBreakdownRow[]
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <BreakdownList title="Konsumsi Per Area" data={area} />
      <BreakdownList
        title="Top Equipment"
        data={equipment}
        accent="bg-chart-2"
      />
      <BreakdownList title="Top Brand" data={brand} accent="bg-chart-4" />
    </div>
  )
}
