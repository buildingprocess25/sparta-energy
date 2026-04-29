"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  IconBolt,
  IconBoxMultiple,
  IconCheck,
  IconCircle,
  IconClock,
  IconInfoCircle,
  IconMinus,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer"
import { BrandCombobox } from "@/components/audit/brand-combobox"
import { Switch } from "@/components/ui/switch"
import { useAuditStore } from "@/store/use-audit-store"
import { TimeRangeCards } from "@/components/audit/time-range-cards"
import { Header } from "@/components/header"
import { Label } from "@/components/ui/label"

type EquipmentItem = {
  uid?: string // unique identifier — allows same equipment type multiple times
  name: string
  brandId?: string
  brandName?: string
  brandIds?: (string | undefined)[]
  brandNames?: string[]
  kws?: number[]
  detail: string
  kw?: number
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
  areaId?: string // e.g. "SALES", "PARKING", "TERRACE", "WAREHOUSE"
  basePath?: string
  backHref?: string
  /** Equipment master records fetched from DB on the server */
  masterItems?: Array<{
    id: string
    name: string
    category: string
    defaultKw: number
    brands: Array<{ id: string; name: string; baseKw: number }>
  }>
}

const getSingleDuration = (start: string, end: string) => {
  const [sh, sm] = (start || "08:00").split(":").map(Number)
  const [eh, em] = (end || "22:00").split(":").map(Number)
  let diffMinutes = eh * 60 + em - (sh * 60 + sm)
  if (diffMinutes < 0) diffMinutes += 24 * 60
  return diffMinutes / 60
}

/** Format kW untuk tampilan UI: max 3 desimal, tanpa trailing zero */
const formatKw = (kw: number): string => {
  const s = kw.toFixed(3).replace(/\.?0+$/, "")
  // Gunakan format id-ID hanya untuk separator (koma), lalu tempel desimal manual
  const [intPart, decPart] = s.split(".")
  const intFormatted = Number(intPart).toLocaleString("id-ID")
  return decPart ? `${intFormatted},${decPart}` : intFormatted
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
  onDelete: () => void
}

function EquipmentRow({ item, onConfigure, onDelete }: EquipmentRowProps) {
  const isSelected = Boolean(item.selected)

  return (
    <div className="relative">
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
            {item.name} {item.brandName ? `(${item.brandName})` : ""}
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <p
              className={cn(
                isSelected
                  ? "text-muted-foreground"
                  : "text-muted-foreground/70"
              )}
            >
              {isSelected
                ? `${item.quantity ?? 1} unit · ${getAverageDailyRuntime(item).toFixed(1).replace(/\.0$/, "")} jam/hari`
                : item.kw != null
                  ? `Daya: ${formatKw(item.kw)} kW`
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

        {/* Spacer so text doesn't overlap delete button */}
        <span className="w-7 shrink-0" />
      </button>

      {/* Delete button — overlaid on the right edge */}
      <button
        type="button"
        aria-label={`Hapus ${item.name}`}
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <IconTrash className="size-4" />
      </button>
    </div>
  )
}

export function AuditStep2Detail({
  areaName,
  areaId,
  basePath = "/audit/start",
  backHref,
  masterItems = [],
}: Step2DetailProps) {
  const router = useRouter()
  const zustandEqs = useAuditStore((state) => state.equipments)
  const syncEqs = useAuditStore((state) => state.syncEquipmentsForArea)
  const markAreaSaved = useAuditStore((state) => state.markAreaSaved)
  const storeType = useAuditStore((state) => state.storeType)
  const storeIs24Hours = useAuditStore((state) => state.is24Hours)
  const storeOpenTime = useAuditStore((state) => state.openTime)
  const storeCloseTime = useAuditStore((state) => state.closeTime)
  const [isPending, startTransition] = React.useTransition()

  const isBeanspotStore = storeType !== "Regular"

  // Filter master items by store type: Regular hides BEANSPOT equipment
  // Sort so BEANSPOT items always appear after regular items (separator guaranteed once)
  const filteredMasterItems = React.useMemo(() => {
    const base = isBeanspotStore
      ? masterItems
      : masterItems.filter((m) => m.category !== "BEANSPOT")
    return [...base].sort((a, b) => {
      const aIsBean = a.category === "BEANSPOT" ? 1 : 0
      const bIsBean = b.category === "BEANSPOT" ? 1 : 0
      return aIsBean - bIsBean
    })
  }, [masterItems, isBeanspotStore])

  // Map area ID → equipment category in DB
  const AREA_TO_CATEGORIES: Record<string, string[]> = {
    SALES: ["SALES"],
    PARKING: ["PARKIRAN"],
    TERRACE: ["TERAS"],
    WAREHOUSE: ["GUDANG"],
  }

  // Items shown by default = category matching this area + store type filter
  const defaultCategoryFilter = areaId ? (AREA_TO_CATEGORIES[areaId] ?? []) : []

  const masterDefault: EquipmentItem[] = React.useMemo(() => {
    const source =
      defaultCategoryFilter.length > 0
        ? filteredMasterItems.filter((m) =>
            defaultCategoryFilter.includes(m.category)
          )
        : filteredMasterItems // fallback: show all if areaId unknown
    return source.map((m) => ({
      uid: m.name, // masterDefault items use name as uid (always unique here)
      name: m.name,
      detail: `Daya: ${formatKw(m.defaultKw)} kW`,
      kw: m.defaultKw,
      quantity: 1,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredMasterItems, areaId])

  // Set of beanspot item names (for separator rendering)
  const beanspotNames = React.useMemo(
    () =>
      new Set(
        masterItems.filter((m) => m.category === "BEANSPOT").map((m) => m.name)
      ),
    [masterItems]
  )

  const [items, setItems] = React.useState<EquipmentItem[]>(() => {
    const fromZustand = zustandEqs.filter((e) => e.areaName === areaName)
    if (fromZustand.length > 0) {
      return fromZustand.map((e) => ({
        uid: e.id, // restore unique id from Zustand
        name: e.name,
        brandId: e.brandId,
        brandName: e.brandName,
        brandIds: e.brandIds,
        brandNames: e.brandNames,
        kws: e.kws,
        detail: `Daya: ${formatKw(e.kw)} kW`,
        kw: e.kw,
        selected: e.selected,
        quantity: e.quantity,
        startTimes: e.startTimes,
        endTimes: e.endTimes,
        isConfigured: e.isConfigured ?? false,
      }))
    }
    // Fall back to DB master items (no mock fallback)
    return masterDefault
  })

  // Sort for display: BEANSPOT items always appear after regular items
  const sortedItems = React.useMemo(
    () =>
      [...items].sort((a, b) => {
        const aIsBean = beanspotNames.has(a.name) ? 1 : 0
        const bIsBean = beanspotNames.has(b.name) ? 1 : 0
        return aIsBean - bIsBean
      }),
    [items, beanspotNames]
  )

  React.useEffect(() => {
    syncEqs(
      areaName,
      items.map((i) => ({
        id: i.uid ?? i.name,
        areaName,
        name: i.name,
        brandId: i.brandId,
        brandName: i.brandName,
        brandIds: i.brandIds,
        brandNames: i.brandNames,
        kw: i.kw ?? (parseFloat(i.detail.replace(/[^\d.]/g, "")) || 0),
        kws: i.kws,
        quantity: i.quantity || 1,
        startTimes: i.startTimes || Array(i.quantity || 1).fill("08:00"),
        endTimes: i.endTimes || Array(i.quantity || 1).fill("22:00"),
        selected: !!i.selected,
        isConfigured: !!i.isConfigured,
      }))
    )
  }, [items, areaName, syncEqs])

  // --- BASELINE TRACKER ---
  React.useEffect(() => {
    let totalDailyKwh = 0
    zustandEqs.forEach((eq) => {
      if (!eq.selected) return
      const isAC =
        eq.name.toLowerCase().includes("ac") ||
        eq.name.toLowerCase().includes("air conditioner")
      for (let i = 0; i < eq.quantity; i++) {
        const start = isAC
          ? eq.startTimes[i] || "08:00"
          : eq.startTimes[0] || "08:00"
        const end = isAC ? eq.endTimes[i] || "22:00" : eq.endTimes[0] || "22:00"
        const hrs = getSingleDuration(start, end)
        totalDailyKwh += eq.kw * hrs
      }
    })
    console.log("==================================================")
    console.log(
      `[Baseline Tracker] Ada ${zustandEqs.length} equipment disimpan`
    )
    console.log(`[Baseline Tracker] Estimasi Harian : ${totalDailyKwh} kWh`)
    console.log(
      `[Baseline Tracker] BASELINE SEBULAN: ${totalDailyKwh * 30} kWh`
    )
    console.log("==================================================")
  }, [zustandEqs])

  const defaultEquipment = items.find((item) => item.selected) ?? items[0]

  const [isConfigOpen, setIsConfigOpen] = React.useState(false)
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [addSearch, setAddSearch] = React.useState("")

  // Reset search when drawer closes
  React.useEffect(() => {
    if (!isAddOpen) setAddSearch("")
  }, [isAddOpen])
  const [activeEquipmentUid, setActiveEquipmentUid] = React.useState(
    defaultEquipment?.uid ?? defaultEquipment?.name ?? ""
  )
  const [brandNames, setBrandNames] = React.useState<string[]>([])
  const [quantity, setQuantity] = React.useState<number>(
    defaultEquipment?.quantity ?? 1
  )
  const [startTimes, setStartTimes] = React.useState<string[]>(
    Array(defaultEquipment?.quantity ?? 1).fill(
      storeIs24Hours ? "00:00" : storeOpenTime
    )
  )
  const [endTimes, setEndTimes] = React.useState<string[]>(
    Array(defaultEquipment?.quantity ?? 1).fill(
      storeIs24Hours ? "23:59" : storeCloseTime
    )
  )
  const [isItemAllDay, setIsItemAllDay] = React.useState<boolean[]>([])

  const activeEquipment = React.useMemo(() => {
    return (
      items.find((item) => (item.uid ?? item.name) === activeEquipmentUid) ??
      defaultEquipment ?? {
        name: "",
        quantity: 1,
        startTimes: ["08:00"],
        endTimes: ["22:00"],
      }
    )
  }, [items, activeEquipmentUid, defaultEquipment])

  const activeMaster = React.useMemo(() => {
    return masterItems.find((m) => m.name === activeEquipment.name)
  }, [masterItems, activeEquipment.name])

  const isAC =
    (activeEquipment.name || "").toLowerCase().includes("ac") ||
    (activeEquipment.name || "").toLowerCase().includes("air conditioner")
  const timesToRender = isAC ? quantity : 1

  const calcEqDailyKwh = (
    name: string,
    kws: number[],
    qty: number,
    starts: string[],
    ends: string[]
  ) => {
    const isEqAC =
      (name || "").toLowerCase().includes("ac") ||
      (name || "").toLowerCase().includes("air conditioner")
    let sumKwh = 0
    if (isEqAC) {
      for (let i = 0; i < qty; i++) {
        const unitKw = kws[i] ?? kws[0] ?? 0
        sumKwh += unitKw * getSingleDuration(starts[i], ends[i])
      }
    } else {
      const unitKw = kws[0] ?? 0
      sumKwh += unitKw * getSingleDuration(starts[0], ends[0]) * qty
    }
    return sumKwh
  }

  // Calculate Active KWH for the drawer
  let activeKwh = 0
  let activeHrsSum = 0 // Just for display fallback if needed
  if (isAC) {
    for (let i = 0; i < quantity; i++) {
      const bName = brandNames[i]
      const matchedBrand = activeMaster?.brands?.find(
        (b) => b.name.toLowerCase() === bName?.toLowerCase()?.trim()
      )
      const unitKw = matchedBrand
        ? matchedBrand.baseKw
        : (activeEquipment.kw ??
          parseFloat(activeEquipment.detail?.replace(/[^\d.]/g, "") || "0"))
      const duration = getSingleDuration(startTimes[i], endTimes[i])
      activeKwh += unitKw * duration
      activeHrsSum += duration
    }
  } else {
    const bName = brandNames[0]
    const matchedBrand = activeMaster?.brands?.find(
      (b) => b.name.toLowerCase() === bName?.toLowerCase()?.trim()
    )
    const unitKw = matchedBrand
      ? matchedBrand.baseKw
      : (activeEquipment.kw ??
        parseFloat(activeEquipment.detail?.replace(/[^\d.]/g, "") || "0"))
    const duration = getSingleDuration(startTimes[0], endTimes[0])
    activeKwh += unitKw * duration * quantity
    activeHrsSum = duration * quantity
  }
  const activeKwDisplay =
    activeEquipment.kw ??
    parseFloat(activeEquipment.detail?.replace(/[^\d.]/g, "") || "0") // For simple display

  const totalAreaDailyKwh = items
    .filter((i) => i.selected)
    .reduce((acc, eq) => {
      const fallbackKw =
        eq.kw ?? parseFloat(eq.detail?.replace(/[^\d.]/g, "") || "0")
      const qty = eq.quantity || 1
      const kwsArray =
        eq.kws && eq.kws.length > 0 ? eq.kws : Array(qty).fill(fallbackKw)
      return (
        acc +
        calcEqDailyKwh(
          eq.name,
          kwsArray,
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
    setActiveEquipmentUid(item.uid ?? item.name)
    const eq = items.find((i) => (i.uid ?? i.name) === (item.uid ?? item.name))
    const qty = eq?.quantity || 1
    const defaultStart = storeIs24Hours ? "00:00" : storeOpenTime
    const defaultEnd = storeIs24Hours ? "23:59" : storeCloseTime
    const starts = eq?.startTimes || Array(qty).fill(defaultStart)
    const ends = eq?.endTimes || Array(qty).fill(defaultEnd)

    // Setup brand arrays — use saved per-unit brands, NOT a copy of brandName[0]
    const bNames: string[] =
      eq?.brandNames && eq.brandNames.length === qty
        ? eq.brandNames
        : Array.from({ length: qty }, (_, i) => eq?.brandNames?.[i] ?? "")

    setBrandNames(bNames)
    setQuantity(qty)
    setStartTimes(starts)
    setEndTimes(ends)
    // Detect allDay per unit
    setIsItemAllDay(
      Array.from(
        { length: qty },
        (_, i) => starts[i] === "00:00" && ends[i] === "23:59"
      )
    )
    setIsConfigOpen(true)
  }

  function handleIncrement() {
    const defaultStart = storeIs24Hours ? "00:00" : storeOpenTime
    const defaultEnd = storeIs24Hours ? "23:59" : storeCloseTime
    const newStart = defaultStart
    const newEnd = defaultEnd
    setQuantity((prev) => {
      const next = prev + 1
      setStartTimes((arr) => [...arr, newStart])
      setEndTimes((arr) => [...arr, newEnd])
      setBrandNames((arr) => [...arr, arr[0] || ""])
      setIsItemAllDay((arr) => [...arr, false])
      return next
    })
  }

  function handleDecrement() {
    setQuantity((prev) => {
      const next = Math.max(1, prev - 1)
      setStartTimes((arr) => arr.slice(0, next))
      setEndTimes((arr) => arr.slice(0, next))
      setBrandNames((arr) => arr.slice(0, next))
      setIsItemAllDay((arr) => arr.slice(0, next))
      return next
    })
  }

  const resolvedBackHref = backHref ?? `${basePath}?step=2`

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-36">
      <Header
        variant="dashboard-back"
        title={areaName}
        backHref={resolvedBackHref}
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
          {(() => {
            // Find index of first Beanspot item in SORTED list — separator appears exactly there
            const firstBeanspotIdx = isBeanspotStore
              ? sortedItems.findIndex((i) => beanspotNames.has(i.name))
              : -1

            return sortedItems.map((item, idx) => {
              const showSeparator = idx === firstBeanspotIdx

              return (
                <React.Fragment key={item.uid ?? item.name}>
                  {showSeparator && (
                    <div className="flex items-center gap-3 py-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                        Beanspot
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )}
                  <EquipmentRow
                    item={item}
                    onConfigure={() => handleConfigure(item)}
                    onDelete={() =>
                      setItems((prev) =>
                        prev.filter((eq) => (eq.uid ?? eq.name) !== (item.uid ?? item.name))
                      )
                    }
                  />
                </React.Fragment>
              )
            })
          })()}

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
          <DrawerHeader className="shrink-0 border-b border-border/40 px-4 pt-4 pb-0 text-left">
            <DrawerTitle className="font-extrabold tracking-tight text-primary">
              Tambah Equipment
            </DrawerTitle>
            <div className="flex items-center gap-2 py-3">
              <IconSearch className="size-4 shrink-0 text-muted-foreground" />
              <input
                autoComplete="off"
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                placeholder="Cari nama equipment..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </DrawerHeader>
          <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
            {filteredMasterItems
              .filter((m) =>
                addSearch.trim() === ""
                  ? true
                  : m.name
                      .toLowerCase()
                      .includes(addSearch.toLowerCase().trim())
              )
              .map((availEq) => (
                <button
                  key={availEq.name}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-border/40 bg-background p-4 text-left transition-colors hover:border-primary/50 active:bg-muted/50"
                  onClick={() => {
                    const kwVal = availEq.defaultKw
                    const uid = `${availEq.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
                    const newItem = {
                      uid,
                      name: availEq.name,
                      detail: `Daya: ${formatKw(kwVal)} kW`,
                      kw: kwVal,
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
                      Daya: {formatKw(availEq.defaultKw)} kW
                    </div>
                  </div>
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconPlus className="size-4" />
                  </div>
                </button>
              ))}

            {filteredMasterItems.filter((m) =>
              addSearch.trim() === ""
                ? true
                : m.name.toLowerCase().includes(addSearch.toLowerCase().trim())
            ).length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Tidak ada peralatan yang cocok.
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
                        setBrandNames((prev) =>
                          val > prev.length
                            ? [
                                ...prev,
                                ...Array(val - prev.length).fill(prev[0] || ""),
                              ]
                            : prev.slice(0, val)
                        )
                        setIsItemAllDay((prev) =>
                          val > prev.length
                            ? [...prev, ...Array(val - prev.length).fill(false)]
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
                        ? `Unit AC ${idx + 1}`
                        : "Waktu Operasional"}
                    </label>

                    {/* Merek / Brand input per unit */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        Merek / Brand (Opsional)
                      </Label>
                      <BrandCombobox
                        brands={activeMaster?.brands || []}
                        value={brandNames[idx] || ""}
                        onChange={(val) =>
                          setBrandNames((prev) => {
                            const next = [...prev]
                            next[idx] = val
                            return next
                          })
                        }
                      />
                    </div>

                    {/* Switch 24 jam — per unit */}
                    <div className="flex items-center justify-between rounded-xl border border-input bg-background px-3 py-2">
                      <span className="text-xs text-muted-foreground">
                        Operasional 24 Jam
                      </span>
                      <Switch
                        checked={isItemAllDay[idx] ?? false}
                        onCheckedChange={(checked) => {
                          setIsItemAllDay((prev) => {
                            const next = [...prev]
                            next[idx] = checked
                            return next
                          })
                          const newStart = checked
                            ? "00:00"
                            : storeIs24Hours
                              ? "00:00"
                              : storeOpenTime
                          const newEnd = checked
                            ? "23:59"
                            : storeIs24Hours
                              ? "23:59"
                              : storeCloseTime
                          setStartTimes((prev) => {
                            const next = [...prev]
                            next[idx] = newStart
                            return next
                          })
                          setEndTimes((prev) => {
                            const next = [...prev]
                            next[idx] = newEnd
                            return next
                          })
                        }}
                      />
                    </div>

                    <div
                      className={
                        isItemAllDay[idx]
                          ? "pointer-events-none opacity-40"
                          : ""
                      }
                    >
                      <TimeRangeCards
                        startLabel="Mulai"
                        endLabel="Selesai"
                        startValue={startTimes[idx] || storeOpenTime}
                        endValue={endTimes[idx] || storeCloseTime}
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
                    </div>

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

              <div className="flex items-center justify-between gap-4 py-3">
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
                        ? `${formatKw(activeKwDisplay)} kW (base) × ${activeHrsSum.toFixed(1).replace(/\.0$/, "")} Jam Total`
                        : `${formatKw(activeKwDisplay)} kW (base) × ${quantity} Unit × ${getSingleDuration(startTimes[0], endTimes[0]).toFixed(1).replace(/\.0$/, "")} Jam`}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-black tracking-tight text-primary">
                    {Number(activeKwh.toFixed(6))}
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
              <Button variant="outline" className="h-11 flex-1">
                Tutup
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button
                className="h-11 flex-2"
                onClick={() => {
                  setItems((prev) =>
                    prev.map((eq) => {
                      if ((eq.uid ?? eq.name) !== activeEquipmentUid) return eq

                      const finalBrandNames = [...brandNames]
                      const finalBrandIds = finalBrandNames.map((name) => {
                        const bName = name || ""
                        const matchedBrand = activeMaster?.brands?.find(
                          (b) =>
                            b.name.toLowerCase() === bName.toLowerCase().trim()
                        )
                        return matchedBrand ? matchedBrand.id : undefined
                      })
                      const finalKws = finalBrandNames.map((name) => {
                        const bName = name || ""
                        const matchedBrand = activeMaster?.brands?.find(
                          (b) =>
                            b.name.toLowerCase() === bName.toLowerCase().trim()
                        )
                        return matchedBrand
                          ? matchedBrand.baseKw
                          : (activeMaster?.defaultKw ?? eq.kw ?? 0)
                      })

                      return {
                        ...eq,
                        brandName: finalBrandNames[0] || "",
                        brandNames: finalBrandNames,
                        brandIds: finalBrandIds,
                        kw: finalKws[0] ?? eq.kw ?? 0,
                        kws: finalKws,
                        quantity,
                        startTimes,
                        endTimes,
                        isConfigured: true,
                        selected: true,
                      }
                    })
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
            disabled={
              !items.some((item) => item.selected && item.isConfigured) ||
              items.some((item) => item.selected && !item.isConfigured) ||
              isPending
            }
            onClick={() => {
              markAreaSaved(areaName)
              startTransition(() => {
                router.push(`${basePath}?step=2`)
              })
            }}
          >
            {isPending ? (
              "Menyimpan..."
            ) : (
              <>
                <IconCheck className="size-4" />
                {items.some((item) => item.selected && !item.isConfigured)
                  ? "Lengkapi / Hapus Item Tersisa"
                  : !items.some((item) => item.selected && item.isConfigured)
                    ? "Pilih minimal 1 equipment"
                    : `Simpan ${areaName}`}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
