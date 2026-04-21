"use client"

import * as React from "react"
import {
  IconBolt,
  IconClock,
  IconCheck,
  IconChevronRight,
  IconCircle,
  IconEdit,
  IconInfoCircle,
  IconMinus,
  IconPlus,
  IconBoxMultiple,
  IconTrash,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"

import { Header } from "@/components/header"
import { TimeRangeCards } from "@/components/audit/time-range-cards"
import { Button } from "@/components/ui/button"
import { useAuditStore } from "@/store/use-audit-store"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
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
  startTimes?: string[]
  endTimes?: string[]
  isConfigured?: boolean
}

type Step2DetailProps = {
  areaName: string
  backHref?: string
  /** Equipment master records fetched from DB on the server */
  masterItems?: Array<{ id: string; name: string; defaultWatt: number }>
  allMasterItems?: Array<{ id: string; name: string; defaultWatt: number }>
}

const getSingleDuration = (start: string, end: string) => {
  const [sh, sm] = (start || "08:00").split(":").map(Number)
  const [eh, em] = (end || "22:00").split(":").map(Number)
  let diffMinutes = eh * 60 + em - (sh * 60 + sm)
  if (diffMinutes < 0) diffMinutes += 24 * 60
  return diffMinutes / 60
}

function getAverageDailyRuntime(item: EquipmentItem) {
  const isAC =
    (item.name || "").toLowerCase().includes("ac") ||
    (item.name || "").toLowerCase().includes("air conditioner")
  const qty = item.quantity || 1
  const starts = item.startTimes || Array(qty).fill("08:00")
  const ends = item.endTimes || Array(qty).fill("22:00")

  if (isAC) {
    let sumHrs = 0
    for (let i = 0; i < qty; i++) {
      sumHrs += getSingleDuration(starts[i], ends[i])
    }
    return sumHrs / qty
  } else {
    return getSingleDuration(starts[0], ends[0])
  }
}

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
              ? `${item.quantity ?? 1} unit · ${getAverageDailyRuntime(item).toFixed(1).replace(/\.0$/, "")} jam/hari`
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
  masterItems = [],
  allMasterItems = [],
}: Step2DetailProps) {
  const router = useRouter()
  const zustandEqs = useAuditStore((state) => state.equipments)
  const syncEqs = useAuditStore((state) => state.syncEquipmentsForArea)
  const markAreaSaved = useAuditStore((state) => state.markAreaSaved)

  // Build default list from DB master items
  const masterDefault: EquipmentItem[] = masterItems.map((m) => ({
    name: m.name,
    detail: `Daya: ${Math.round(m.defaultWatt * 1000)} W`,
    quantity: 1,
  }))

  const [items, setItems] = React.useState<EquipmentItem[]>(() => {
    const fromZustand = zustandEqs.filter((e) => e.areaName === areaName)
    if (fromZustand.length > 0) {
      return fromZustand.map((e) => ({
        name: e.name,
        detail: `Daya: ${e.watt} W`,
        selected: e.selected,
        quantity: e.quantity,
        startTimes: e.startTimes,
        endTimes: e.endTimes,
        isConfigured: true,
      }))
    }
    // Fall back to DB master items (no mock fallback)
    return masterDefault
  })

  React.useEffect(() => {
    syncEqs(
      areaName,
      items.map((i) => ({
        id: i.name,
        areaName,
        name: i.name,
        watt: parseInt(i.detail.replace(/\D/g, "")) || 0,
        quantity: i.quantity || 1,
        startTimes: i.startTimes || Array(i.quantity || 1).fill("08:00"),
        endTimes: i.endTimes || Array(i.quantity || 1).fill("22:00"),
        selected: !!i.selected,
      }))
    )
  }, [items, areaName, syncEqs])

  const defaultEquipment = items.find((item) => item.selected) ?? items[0]

  const [isConfigOpen, setIsConfigOpen] = React.useState(false)
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [activeEquipmentName, setActiveEquipmentName] = React.useState(
    defaultEquipment?.name ?? ""
  )
  const [quantity, setQuantity] = React.useState<number>(
    defaultEquipment?.quantity ?? 1
  )
  const [startTimes, setStartTimes] = React.useState<string[]>(
    Array(defaultEquipment?.quantity ?? 1).fill("08:00")
  )
  const [endTimes, setEndTimes] = React.useState<string[]>(
    Array(defaultEquipment?.quantity ?? 1).fill("22:00")
  )

  const activeEquipment = items.find(
    (item) => item.name === activeEquipmentName
  ) ??
    defaultEquipment ?? {
      name: "",
      quantity: 1,
      startTimes: ["08:00"],
      endTimes: ["22:00"],
    }

  const isAC =
    (activeEquipment.name || "").toLowerCase().includes("ac") ||
    (activeEquipment.name || "").toLowerCase().includes("air conditioner")
  const timesToRender = isAC ? quantity : 1

  const calcEqDailyKwh = (
    name: string,
    watt: number,
    qty: number,
    starts: string[],
    ends: string[]
  ) => {
    const isEqAC =
      (name || "").toLowerCase().includes("ac") ||
      (name || "").toLowerCase().includes("air conditioner")
    let sumHrs = 0
    if (isEqAC) {
      for (let i = 0; i < qty; i++)
        sumHrs += getSingleDuration(starts[i], ends[i])
    } else {
      sumHrs = getSingleDuration(starts[0], ends[0]) * qty
    }
    return (watt * sumHrs) / 1000
  }

  const activeWatt = parseInt(activeEquipment.detail?.replace(/\D/g, "") || "0")
  let activeHrsSum = 0
  if (isAC) {
    for (let i = 0; i < quantity; i++)
      activeHrsSum += getSingleDuration(startTimes[i], endTimes[i])
  } else {
    activeHrsSum = getSingleDuration(startTimes[0], endTimes[0]) * quantity
  }
  const activeKwh = (activeWatt * activeHrsSum) / 1000

  const totalAreaDailyKwh = items
    .filter((i) => i.selected)
    .reduce((acc, eq) => {
      const watt = parseInt(eq.detail?.replace(/\D/g, "") || "0")
      const qty = eq.quantity || 1
      return (
        acc +
        calcEqDailyKwh(
          eq.name,
          watt,
          qty,
          eq.startTimes || [],
          eq.endTimes || []
        )
      )
    }, 0)

  React.useEffect(() => {
    setQuantity(activeEquipment.quantity ?? 1)
  }, [activeEquipment])

  function handleConfigure(item: EquipmentItem) {
    setActiveEquipmentName(item.name)
    const eq = items.find((i) => i.name === item.name)
    const qty = eq?.quantity || 1
    setQuantity(qty)
    setStartTimes(eq?.startTimes || Array(qty).fill("08:00"))
    setEndTimes(eq?.endTimes || Array(qty).fill("22:00"))
    setIsConfigOpen(true)
  }

  function handleIncrement() {
    setQuantity((prev) => {
      const next = prev + 1
      setStartTimes((arr) => [...arr, "08:00"])
      setEndTimes((arr) => [...arr, "22:00"])
      return next
    })
  }

  function handleDecrement() {
    setQuantity((prev) => {
      const next = Math.max(1, prev - 1)
      setStartTimes((arr) => arr.slice(0, next))
      setEndTimes((arr) => arr.slice(0, next))
      return next
    })
  }

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
            Pilih atau tambahkan equipment yang ada di toko ini untuk diatur
            konfigurasinya.
          </p>
        </section>

        <section className="space-y-3">
          {items.map((item) => (
            <EquipmentRow
              key={item.name}
              item={item}
              onConfigure={() => handleConfigure(item)}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            className="mt-3 h-12 w-full rounded-2xl border-dashed border-primary/30 text-primary hover:bg-primary/5"
            onClick={() => setIsAddOpen(true)}
          >
            <IconPlus className="size-4" />
            Tambah Equipment Lain
          </Button>
        </section>
      </main>

      <Drawer open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DrawerContent className="flex max-h-[80dvh] flex-col">
          <DrawerHeader className="shrink-0 border-b border-border/40 px-4 pt-4 pb-4 text-left">
            <DrawerTitle className="font-extrabold tracking-tight text-primary">
              Tambah Equipment
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
            {allMasterItems
              .filter((m) => !items.some((i) => i.name === m.name))
              .map((availEq) => (
                <button
                  key={availEq.name}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-border/40 bg-background p-4 text-left transition-colors hover:border-primary/50 active:bg-muted/50"
                  onClick={() => {
                    const newItem = {
                      name: availEq.name,
                      detail: `Daya: ${Math.round(availEq.defaultWatt * 1000)} W`,
                      quantity: 1,
                      startTimes: ["08:00"],
                      endTimes: ["22:00"],
                      selected: true,
                      isConfigured: false,
                    }
                    setItems((prev) => [...prev, newItem])
                    setIsAddOpen(false)
                    setTimeout(() => handleConfigure(newItem), 150)
                  }}
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {availEq.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Daya: {Math.round(availEq.defaultWatt * 1000)} W
                    </div>
                  </div>
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconPlus className="size-4" />
                  </div>
                </button>
              ))}

            {allMasterItems.filter((m) => !items.some((i) => i.name === m.name))
              .length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Semua peralatan sudah ada di daftar.
              </div>
            )}
          </div>
          <DrawerFooter className="shrink-0 px-4 pt-4 pb-8">
            <DrawerClose asChild>
              <Button variant="outline" className="h-11 w-full">
                Batal
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DrawerContent className="flex max-h-[90dvh] flex-col">
          <DrawerHeader className="shrink-0 px-4 pt-4 pb-5 text-left">
            <DrawerTitle className="font-extrabold tracking-tight text-primary">
              {activeEquipment.name}
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-6">
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
                      onChange={(event) => {
                        const val = Number(event.target.value) || 1
                        setQuantity(val)
                        setStartTimes((prev) =>
                          val > prev.length
                            ? [
                                ...prev,
                                ...Array(val - prev.length).fill("08:00"),
                              ]
                            : prev.slice(0, val)
                        )
                        setEndTimes((prev) =>
                          val > prev.length
                            ? [
                                ...prev,
                                ...Array(val - prev.length).fill("22:00"),
                              ]
                            : prev.slice(0, val)
                        )
                      }}
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
                {Array.from({ length: timesToRender }).map((_, idx) => (
                  <div key={idx} className="space-y-4 pb-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <IconClock className="size-4 text-primary" />
                      {isAC && quantity > 1
                        ? `Waktu Operasional AC ${idx + 1}`
                        : "Waktu Operasional"}
                    </label>

                    <TimeRangeCards
                      startLabel="Mulai"
                      endLabel="Selesai"
                      startValue={startTimes[idx] || "08:00"}
                      endValue={endTimes[idx] || "22:00"}
                      onStartChange={(val) => {
                        const newArr = [...startTimes]
                        newArr[idx] = val
                        setStartTimes(newArr)
                      }}
                      onEndChange={(val) => {
                        const newArr = [...endTimes]
                        newArr[idx] = val
                        setEndTimes(newArr)
                      }}
                    />

                    <div className="flex items-center gap-2 px-1">
                      <IconInfoCircle className="size-4 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">
                        Total durasi penggunaan:{" "}
                        <span className="font-bold text-primary">
                          {getSingleDuration(startTimes[idx], endTimes[idx])
                            .toFixed(1)
                            .replace(/\.0$/, "")}{" "}
                          jam per hari
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
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
                      {isAC
                        ? `${activeWatt.toLocaleString("id-ID")} W × ${activeHrsSum.toFixed(1).replace(/\.0$/, "")} Jam Total`
                        : `${activeWatt.toLocaleString("id-ID")} W × ${quantity} Unit × ${getSingleDuration(startTimes[0], endTimes[0]).toFixed(1).replace(/\.0$/, "")} Jam`}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-black tracking-tight text-primary">
                    {activeKwh.toFixed(1).replace(/\.0$/, "")}
                  </span>
                  <span className="text-[10px] font-bold text-primary/70 uppercase">
                    kWh / hari
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter className="flex shrink-0 flex-row items-center gap-2 border-t border-border/40 bg-background px-4 pt-4 pb-8">
            <DrawerClose asChild>
              <Button
                variant="destructive"
                className="h-11 w-11 shrink-0 p-0"
                onClick={() => {
                  setItems((prev) =>
                    prev.filter((eq) => eq.name !== activeEquipmentName)
                  )
                }}
              >
                <IconTrash className="size-5" />
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button variant="outline" className="h-11 flex-1">
                Tutup
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button
                className="h-11 flex-[2]"
                onClick={() => {
                  setItems((prev) =>
                    prev.map((eq) =>
                      eq.name === activeEquipmentName
                        ? {
                            ...eq,
                            quantity,
                            startTimes,
                            endTimes,
                            isConfigured: true,
                            selected: true,
                          }
                        : eq
                    )
                  )
                }}
              >
                Simpan
              </Button>
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
                <span className="text-xl font-bold">
                  {totalAreaDailyKwh.toFixed(1).replace(/\.0$/, "")}
                </span>
                <span className="text-[10px] font-bold uppercase opacity-60">
                  kWh/hari
                </span>
              </div>
            </div>
          </div>
          <Button
            className="mt-3 h-11 w-full"
            disabled={items.some((item) => !item.isConfigured)}
            onClick={() => {
              markAreaSaved(areaName)
              router.push("/audit/start?step=2")
            }}
          >
            <IconCheck className="size-4" />
            {items.some((item) => !item.isConfigured)
              ? "Lengkapi / Hapus Item Tersisa"
              : `Simpan ${areaName}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
