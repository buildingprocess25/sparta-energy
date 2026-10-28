"use client"

import { useMemo } from "react"
import { IconChevronRight, IconPencilPlus } from "@tabler/icons-react"

import { areaLabels, type AreaKey } from "@/components/audit-validation/format"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ValidationAuditItem } from "@/lib/audit-validation-queries"
import type { EquipmentMasterItem } from "@/lib/get-equipment-for-area"
import { usesBeanspotEquipment } from "@/lib/store-types"
import { cn } from "@/lib/utils"

// Same area mapping as the audit wizard (step2-detail).
const areaCategory: Record<AreaKey, string> = {
  SALES: "SALES",
  PARKING: "PARKIRAN",
  TERRACE: "TERAS",
  WAREHOUSE: "GUDANG",
}

type AddEquipmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  area: AreaKey
  storeType: string | null
  items: ValidationAuditItem[]
  equipmentMaster: EquipmentMasterItem[]
  onPick: (type: EquipmentMasterItem | null) => void
}

function recordedQty(type: EquipmentMasterItem, items: ValidationAuditItem[]) {
  return items
    .filter((item) =>
      item.equipmentTypeId
        ? item.equipmentTypeId === type.id
        : item.name.trim().toLowerCase() === type.name.trim().toLowerCase()
    )
    .reduce((sum, item) => sum + item.qty, 0)
}

export function AddEquipmentDialog({
  open,
  onOpenChange,
  area,
  storeType,
  items,
  equipmentMaster,
  onPick,
}: AddEquipmentDialogProps) {
  const groups = useMemo(() => {
    const areaItems = items.filter((item) => item.areaTarget === area)
    const regular = equipmentMaster
      .filter((type) => type.category === areaCategory[area])
      .map((type) => ({ type, qty: recordedQty(type, areaItems) }))
    // Beanspot equipment can sit in any area, so it is counted store-wide under Sales.
    const beanspot =
      area === "SALES" && usesBeanspotEquipment(storeType)
        ? equipmentMaster
            .filter((type) => type.category === "BEANSPOT")
            .map((type) => ({ type, qty: recordedQty(type, items) }))
        : []
    return [
      { label: null, rows: regular },
      { label: "Alat Beanspot", rows: beanspot },
    ].filter((group) => group.rows.length > 0)
  }, [area, equipmentMaster, items, storeType])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah peralatan di {areaLabels[area]}</DialogTitle>
          <DialogDescription>
            Pilih dari master alat. Alat yang belum ada di kalkulasi ditandai
            &quot;Belum dicatat&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {groups.length === 0 && (
            <p className="rounded-xl border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
              Belum ada jenis alat di master untuk area ini.
            </p>
          )}
          {groups.map((group) => (
            <section
              key={group.label ?? "master"}
              className="flex flex-col gap-2"
            >
              {group.label && (
                <h3 className="px-1 text-xs font-semibold text-muted-foreground">
                  {group.label}
                </h3>
              )}
              <ul className="flex flex-col gap-2">
                {group.rows.map(({ type, qty }) => (
                  <li key={type.id}>
                    <button
                      type="button"
                      onClick={() => onPick(type)}
                      className="flex min-h-11 w-full items-center gap-3 rounded-xl bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {type.name}
                        </span>
                        <span
                          className={cn(
                            "block text-xs tabular-nums",
                            qty > 0
                              ? "text-muted-foreground"
                              : "font-medium text-amber-700 dark:text-amber-400"
                          )}
                        >
                          {qty > 0
                            ? `${qty} unit sudah dicatat`
                            : "Belum dicatat"}
                        </span>
                      </span>
                      <IconChevronRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => onPick(null)}
          >
            <IconPencilPlus data-icon="inline-start" />
            Alat lain (isi manual)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
