"use client"

import * as React from "react"
import {
  IconBolt,
  IconClock,
  IconCheck,
  IconChevronRight,
  IconCircle,
  IconDotsVertical,
  IconEdit,
  IconInfoCircle,
  IconMinus,
  IconPlus,
  IconBoxMultiple,
} from "@tabler/icons-react"

import { Header } from "@/components/header"
import { TimeRangeCards } from "@/components/audit/time-range-cards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

type EquipmentItem = {
  name: string
  detail: string
  selected?: boolean
  energy?: string
  quantity?: number
  hours?: number
}

type Step2DetailProps = {
  areaName: string
  backHref?: string
}

const equipmentItems: EquipmentItem[] = [
  {
    name: "Air Conditioner GREE GWC-18M003",
    detail: "Daya: 1.500 W",
    selected: true,
    energy: "105 kWh",
    quantity: 5,
    hours: 14,
  },
  {
    name: "BACKWALL LIGHTED",
    detail: "Daya: 300 W",
    quantity: 2,
    hours: 12,
  },
  {
    name: 'MONITOR HIKVISION 22"',
    detail: "Daya: 24 W",
    quantity: 1,
    hours: 12,
  },
  {
    name: "UPS APC 800VA",
    detail: "Daya: 480 W",
    quantity: 1,
    hours: 12,
  },
  {
    name: "PRINTER EPSON LX 310",
    detail: "Daya: 50 W",
    quantity: 1,
    hours: 3,
  },
  {
    name: "KOMPUTER HP CORE i5",
    detail: "Daya: 150 W",
    quantity: 2,
    hours: 12,
  },
]

type EquipmentRowProps = {
  item: EquipmentItem
  onConfigure: () => void
}

function EquipmentRow({ item, onConfigure }: EquipmentRowProps) {
  const isSelected = Boolean(item.selected)

  return (
    <button
      type="button"
      onClick={onConfigure}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border bg-background p-4 text-left transition-colors active:translate-y-px",
        isSelected
          ? "border-primary shadow-sm"
          : "border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-border/40"
      )}
    >
      <div className="flex items-center justify-center">
        {isSelected ? (
          <IconCheck className="size-6 text-primary" />
        ) : (
          <IconCircle className="size-6 text-muted-foreground/50" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            "truncate text-sm font-semibold",
            isSelected ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {item.name}
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <p
            className={cn(
              isSelected ? "text-muted-foreground" : "text-muted-foreground/70"
            )}
          >
            {isSelected
              ? `${item.quantity ?? 1} unit · ${item.hours ?? 8} jam/hari`
              : item.detail}
          </p>
          {item.energy ? (
            <>
              <span className="size-1 rounded-full bg-border" />
              <p className="font-semibold text-primary">{item.energy}</p>
            </>
          ) : null}
        </div>
      </div>

      {isSelected ? (
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/5 text-primary">
          <IconEdit className="size-4" />
        </span>
      ) : (
        <IconChevronRight className="size-4 text-muted-foreground/50" />
      )}
    </button>
  )
}

export function AuditStep2Detail({
  areaName,
  backHref = "/audit/start?step=2",
}: Step2DetailProps) {
  const defaultEquipment =
    equipmentItems.find((item) => item.selected) ?? equipmentItems[0]

  const [isConfigOpen, setIsConfigOpen] = React.useState(true)
  const [activeEquipmentName, setActiveEquipmentName] = React.useState(
    defaultEquipment.name
  )
  const [quantity, setQuantity] = React.useState(defaultEquipment.quantity ?? 1)
  const [startTime, setStartTime] = React.useState("08:00")
  const [endTime, setEndTime] = React.useState("22:00")

  const activeEquipment =
    equipmentItems.find((item) => item.name === activeEquipmentName) ??
    defaultEquipment

  React.useEffect(() => {
    setQuantity(activeEquipment.quantity ?? 1)
  }, [activeEquipment])

  const handleConfigure = React.useCallback((item: EquipmentItem) => {
    setActiveEquipmentName(item.name)
    setIsConfigOpen(true)
  }, [])

  const handleIncrement = React.useCallback(() => {
    setQuantity((prev) => prev + 1)
  }, [])

  const handleDecrement = React.useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }, [])

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-36">
      <Header
        variant="dashboard-back"
        title={areaName}
        backHref={backHref}
        className="px-0"
      />

      <main className="flex flex-col gap-6">
        <section className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Pilih equipment yang ADA di toko ini untuk diatur detailnya.
          </p>
        </section>

        <section className="space-y-3">
          {equipmentItems.map((item) => (
            <EquipmentRow
              key={item.name}
              item={item}
              onConfigure={() => handleConfigure(item)}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            className="mt-3 h-12 w-full rounded-2xl border-dashed border-primary/30 text-primary"
          >
            <IconPlus className="size-4" />
            Tambah Peralatan Lain
          </Button>
        </section>
      </main>

      <Drawer open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DrawerContent>
          <DrawerHeader className="px-0 pb-5 text-left">
            <DrawerTitle className="font-extrabold tracking-tight text-primary">
              {activeEquipment.name}
            </DrawerTitle>
          </DrawerHeader>

          <div className="space-y-5 px-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <IconBoxMultiple className="size-4 text-primary" />
                  Jumlah Unit
                </label>
                <div className="flex items-center rounded-2xl border border-border/20 bg-muted/40 p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    className="rounded-xl text-primary"
                    onClick={handleDecrement}
                  >
                    <IconMinus className="size-4" />
                  </Button>
                  <input
                    className="w-16 border-0 bg-transparent text-center text-xl font-extrabold focus:ring-0"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Number(event.target.value) || 1)
                    }
                    type="number"
                    min={1}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    className="rounded-xl text-primary"
                    onClick={handleIncrement}
                  >
                    <IconPlus className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                <IconClock className="size-4 text-primary" />
                Waktu Operasional
              </label>

              <TimeRangeCards
                startLabel="Mulai"
                endLabel="Selesai"
                startValue={startTime}
                endValue={endTime}
                onStartChange={setStartTime}
                onEndChange={setEndTime}
              />

              <div className="flex items-center gap-2 px-1">
                <IconInfoCircle className="size-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">
                  Total durasi penggunaan:{" "}
                  <span className="font-bold text-primary">
                    14 jam per hari
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-border/40 py-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconBolt className="size-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      Estimasi Konsumsi
                    </span>
                  </div>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    1.500 W × {quantity} Unit × 14 Jam
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-black tracking-tight text-primary">
                  105
                </span>
                <span className="text-[10px] font-bold text-primary/70 uppercase">
                  kWh / hari
                </span>
              </div>
            </div>
          </div>

          <DrawerFooter className="flex flex-row gap-3 pt-8">
            <DrawerClose asChild>
              <Button variant="outline" className="h-11 flex-1">
                Tutup
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button className="h-11 flex-1">Simpan</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 backdrop-blur">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex w-full flex-row items-center justify-between gap-3">
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-60">
                Total Konsumsi
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">312.5</span>
                <span className="text-[10px] font-bold uppercase opacity-60">
                  kWh/hari
                </span>
              </div>
            </div>
          </div>
          <Button className="mt-3 h-11 w-full">
            <IconCheck className="size-4" />
            Simpan {areaName}
          </Button>
        </div>
      </div>
    </div>
  )
}
