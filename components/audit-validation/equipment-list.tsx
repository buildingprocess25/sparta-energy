"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { deleteAuditItem } from "@/app/actions/audit-validation"
import { AddEquipmentDialog } from "@/components/audit-validation/add-equipment-dialog"
import {
  areaLabels,
  areaOrder,
  formatHours,
  type AreaKey,
} from "@/components/audit-validation/format"
import { ItemFormDialog } from "@/components/audit-validation/item-form-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type {
  ValidationAudit,
  ValidationAuditItem,
} from "@/lib/audit-validation-queries"
import type { EquipmentMasterItem } from "@/lib/get-equipment-for-area"

type EquipmentListProps = {
  audit: ValidationAudit
  equipmentMaster: EquipmentMasterItem[]
  storeType: string | null
  defaultHours: number
}

type FormState = {
  area: AreaKey
  item: ValidationAuditItem | null
  preset: EquipmentMasterItem | null
} | null

export function EquipmentList({
  audit,
  equipmentMaster,
  storeType,
  defaultHours,
}: EquipmentListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeArea, setActiveArea] = useState<AreaKey>(
    areaOrder.find((area) => audit.items.some((i) => i.areaTarget === area)) ??
      "SALES"
  )
  const [picking, setPicking] = useState(false)
  const [form, setForm] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<ValidationAuditItem | null>(null)

  const isLocked = audit.isValidated
  const activeItems = audit.items.filter(
    (item) => item.areaTarget === activeArea
  )
  const countByArea = (area: AreaKey) =>
    audit.items.filter((item) => item.areaTarget === area).length

  function handleDelete() {
    if (!deleting) return
    startTransition(async () => {
      const result = await deleteAuditItem(deleting.id)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setDeleting(null)
      router.refresh()
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Daftar Peralatan</CardTitle>
          <CardDescription>
            Perubahan alat langsung tersimpan dan standar konsumsi energi
            dihitung ulang.
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">{audit.items.length} item</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={1}
            value={activeArea}
            onValueChange={(value) => {
              if (value) setActiveArea(value as AreaKey)
            }}
            className="flex w-full flex-wrap"
            aria-label="Pilih area"
          >
            {areaOrder.map((area) => (
              <ToggleGroupItem
                key={area}
                value={area}
                className="h-11 rounded-full px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"
              >
                {areaLabels[area]} ({countByArea(area)})
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {activeItems.length === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              Belum ada alat di area ini.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {activeItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 rounded-xl bg-muted/40 py-1.5 pr-1.5 pl-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground tabular-nums">
                      {item.qty} unit · {formatHours(item.operationalHours)} jam
                      · {item.baseKw} kW
                      {item.brandName ? ` · ${item.brandName}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold tabular-nums">
                    {item.estimatedDailyKwh.toFixed(1)}{" "}
                    <span className="font-normal text-muted-foreground">
                      kWh/hari
                    </span>
                  </p>
                  {!isLocked && (
                    <div className="flex shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11"
                        aria-label={`Ubah ${item.name}`}
                        onClick={() =>
                          setForm({ area: activeArea, item, preset: null })
                        }
                      >
                        <IconPencil />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11 text-destructive hover:text-destructive"
                        aria-label={`Hapus ${item.name}`}
                        onClick={() => setDeleting(item)}
                      >
                        <IconTrash />
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!isLocked && (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => setPicking(true)}
            >
              <IconPlus data-icon="inline-start" />
              Tambah Peralatan di {areaLabels[activeArea]}
            </Button>
          )}
        </CardContent>
      </Card>

      <AddEquipmentDialog
        open={picking}
        onOpenChange={setPicking}
        area={activeArea}
        storeType={storeType}
        items={audit.items}
        equipmentMaster={equipmentMaster}
        onPick={(preset) => {
          setPicking(false)
          setForm({ area: activeArea, item: null, preset })
        }}
      />

      {form && (
        <ItemFormDialog
          key={
            form.item?.id ?? `new-${form.area}-${form.preset?.id ?? "manual"}`
          }
          open
          onOpenChange={(open) => {
            if (!open) setForm(null)
          }}
          auditId={audit.id}
          area={form.area}
          item={form.item}
          equipmentMaster={equipmentMaster}
          presetType={form.preset}
          defaultHours={defaultHours}
        />
      )}

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setDeleting(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus {deleting?.name}?</DialogTitle>
            <DialogDescription>
              Alat ini dihapus dari kalkulasi, standar konsumsi energi dan
              status toko dihitung ulang, dan penghapusan dicatat di riwayat
              koreksi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Hapus Alat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
