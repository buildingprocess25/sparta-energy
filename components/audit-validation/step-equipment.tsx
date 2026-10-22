"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { IconPencil, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"

import { deleteAuditItems } from "@/app/actions/audit-validation"
import {
  areaLabels,
  areaOrder,
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
import { Checkbox } from "@/components/ui/checkbox"
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
import { usesBeanspotEquipment } from "@/lib/store-types"
import { cn } from "@/lib/utils"

type StepEquipmentProps = {
  audit: ValidationAudit
  equipmentMaster: EquipmentMasterItem[]
  defaultHours: number
}

type ChecklistRow = {
  key: string
  name: string
  type: EquipmentMasterItem | null
  area: AreaKey
  items: ValidationAuditItem[]
  previousQty: number | null
}

type MatchableItem = { equipmentTypeId: string | null; name: string }
type PreviousItem = NonNullable<ValidationAudit["previousAudit"]>["items"][number]

const monthFormat = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "numeric",
})

// Same area mapping as the audit wizard (step2-detail).
const areaCategory: Record<AreaKey, string> = {
  SALES: "SALES",
  PARKING: "PARKIRAN",
  TERRACE: "TERAS",
  WAREHOUSE: "GUDANG",
}

function sameName(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

function matchesType(item: MatchableItem, type: EquipmentMasterItem) {
  if (item.equipmentTypeId) return item.equipmentTypeId === type.id
  return sameName(item.name, type.name)
}

function buildRows(
  area: AreaKey,
  audit: ValidationAudit,
  equipmentMaster: EquipmentMasterItem[]
) {
  const areaItems = audit.items.filter((item) => item.areaTarget === area)
  const previousItems = audit.previousAudit?.items ?? null
  const previousAreaItems =
    previousItems?.filter((item) => item.areaTarget === area) ?? null
  const matched = new Set<string>()

  const sumPrevious = (
    pool: PreviousItem[] | null,
    match: (item: PreviousItem) => boolean
  ) => (pool ? pool.filter(match).reduce((sum, item) => sum + item.qty, 0) : null)

  const toRow = (
    type: EquipmentMasterItem,
    pool: ValidationAuditItem[],
    previousPool: PreviousItem[] | null
  ): ChecklistRow => {
    const items = pool.filter((item) => matchesType(item, type))
    items.forEach((item) => matched.add(item.id))
    return {
      key: type.id,
      name: type.name,
      type,
      area,
      items,
      previousQty: sumPrevious(previousPool, (item) => matchesType(item, type)),
    }
  }

  const regular = equipmentMaster
    .filter((type) => type.category === areaCategory[area])
    .map((type) => toRow(type, areaItems, previousAreaItems))

  // Beanspot equipment can be recorded in any area, so it is matched store-wide
  // and listed under Sales only.
  const beanspotTypes = usesBeanspotEquipment(audit.technical.storeType)
    ? equipmentMaster.filter((type) => type.category === "BEANSPOT")
    : []
  const beanspot =
    area === "SALES"
      ? beanspotTypes.map((type) => toRow(type, audit.items, previousItems))
      : []

  const others: ChecklistRow[] = areaItems
    .filter(
      (item) =>
        !matched.has(item.id) &&
        !beanspotTypes.some((type) => matchesType(item, type))
    )
    .map((item) => ({
      key: item.id,
      name: item.name,
      type: null,
      area,
      items: [item],
      previousQty: sumPrevious(previousAreaItems, (prev) =>
        sameName(prev.name, item.name)
      ),
    }))

  return { regular, beanspot, others }
}

function totalQty(items: ValidationAuditItem[]) {
  return items.reduce((sum, item) => sum + item.qty, 0)
}

export function StepEquipment({
  audit,
  equipmentMaster,
  defaultHours,
}: StepEquipmentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeArea, setActiveArea] = useState<AreaKey>("PARKING")
  const [adding, setAdding] = useState<ChecklistRow | null>(null)
  const [editing, setEditing] = useState<ValidationAuditItem | null>(null)
  const [removing, setRemoving] = useState<ChecklistRow | null>(null)
  const [addingOther, setAddingOther] = useState<AreaKey | null>(null)

  const isLocked = audit.isValidated
  const previousLabel = audit.previousAudit
    ? `Kalkulasi ${monthFormat.format(new Date(audit.previousAudit.auditDate))}`
    : null
  const { regular, beanspot, others } = useMemo(
    () => buildRows(activeArea, audit, equipmentMaster),
    [activeArea, audit, equipmentMaster]
  )
  const visibleRows = [...regular, ...beanspot, ...others]
  const presentCount = visibleRows.filter((row) => row.items.length > 0).length

  function handleCheckedChange(row: ChecklistRow, checked: boolean) {
    if (isLocked) return
    if (checked) setAdding(row)
    else setRemoving(row)
  }

  function handleRemove() {
    if (!removing) return
    const target = removing
    startTransition(async () => {
      const result = await deleteAuditItems(
        audit.id,
        target.items.map((item) => item.id)
      )
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(`${target.name} dihapus dari kalkulasi.`)
      setRemoving(null)
      router.refresh()
    })
  }

  function renderRow(row: ChecklistRow) {
    const checkboxId = `check-${row.area}-${row.key}`
    const isPresent = row.items.length > 0
    const single = row.items.length === 1 ? row.items[0] : null

    return (
      <li
        key={row.key}
        className="flex items-center gap-2 rounded-xl bg-muted/40 pr-1.5"
      >
        <label
          htmlFor={checkboxId}
          className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 py-2 pl-3"
        >
          <Checkbox
            id={checkboxId}
            checked={isPresent}
            disabled={isLocked || isPending}
            onCheckedChange={(value) => handleCheckedChange(row, value === true)}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{row.name}</span>
            <span className="block text-xs text-muted-foreground tabular-nums">
              {isPresent
                ? `${totalQty(row.items)} unit${row.type ? "" : " · di luar master alat"}`
                : "Belum dicatat di kalkulasi ini"}
              {previousLabel && row.previousQty !== null && (
                <span
                  className={cn(
                    "block",
                    !isPresent &&
                      row.previousQty > 0 &&
                      "font-medium text-amber-700 dark:text-amber-400"
                  )}
                >
                  {previousLabel}:{" "}
                  {row.previousQty > 0 ? `${row.previousQty} unit` : "tidak dicatat"}
                </span>
              )}
            </span>
          </span>
        </label>
        {isPresent && !isLocked && single && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0"
            aria-label={`Ubah ${row.name}`}
            onClick={() => setEditing(single)}
          >
            <IconPencil />
          </Button>
        )}
        {isPresent && !isLocked && !single && (
          <span className="shrink-0 px-2 text-right text-[11px] text-muted-foreground">
            {row.items.length} baris, ubah di Step 1
          </span>
        )}
      </li>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Semua Alat di Toko</CardTitle>
          <CardDescription>
            Daftar dari master alat. Alat yang diinput anak toko sudah
            tercentang.
          </CardDescription>
          <CardAction>
            <Badge variant="secondary" className="tabular-nums">
              {presentCount} dari {visibleRows.length} ada
            </Badge>
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
                {areaLabels[area]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {regular.length === 0 && others.length === 0 && beanspot.length === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              Belum ada jenis alat di master untuk area ini.
            </p>
          ) : (
            <>
              <ul className="flex flex-col gap-2">{regular.map(renderRow)}</ul>

              {beanspot.length > 0 && (
                <section className="flex flex-col gap-2" aria-label="Alat Beanspot">
                  <h3 className="px-1 text-xs font-semibold text-muted-foreground">
                    Alat Beanspot
                  </h3>
                  <ul className="flex flex-col gap-2">{beanspot.map(renderRow)}</ul>
                </section>
              )}

              {others.length > 0 && (
                <section className="flex flex-col gap-2" aria-label="Alat lain">
                  <h3 className="px-1 text-xs font-semibold text-muted-foreground">
                    Alat di luar master alat
                  </h3>
                  <ul className="flex flex-col gap-2">{others.map(renderRow)}</ul>
                </section>
              )}
            </>
          )}

          {!isLocked && (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => setAddingOther(activeArea)}
            >
              <IconPlus data-icon="inline-start" />
              Tambah Alat yang Tidak Ada di Daftar
            </Button>
          )}
        </CardContent>
      </Card>

      {adding?.type && (
        <ItemFormDialog
          key={`add-${adding.key}`}
          open
          onOpenChange={(open) => {
            if (!open) setAdding(null)
          }}
          auditId={audit.id}
          area={adding.area}
          item={null}
          equipmentMaster={equipmentMaster}
          presetType={adding.type}
          defaultHours={defaultHours}
        />
      )}

      {addingOther && (
        <ItemFormDialog
          key={`add-other-${addingOther}`}
          open
          onOpenChange={(open) => {
            if (!open) setAddingOther(null)
          }}
          auditId={audit.id}
          area={addingOther}
          item={null}
          equipmentMaster={equipmentMaster}
          defaultHours={defaultHours}
        />
      )}

      {editing && (
        <ItemFormDialog
          key={`edit-${editing.id}`}
          open
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
          auditId={audit.id}
          area={editing.areaTarget}
          item={editing}
          equipmentMaster={equipmentMaster}
        />
      )}

      <Dialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setRemoving(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{removing?.name} tidak ada di toko?</DialogTitle>
            <DialogDescription>
              {removing && removing.items.length > 1
                ? `${removing.items.length} baris alat ini dihapus dari kalkulasi`
                : "Alat ini dihapus dari kalkulasi"}{" "}
              dan standar konsumsi energi toko dihitung ulang.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemoving(null)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemove}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Hapus dari Kalkulasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
