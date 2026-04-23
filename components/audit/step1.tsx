"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { IconArrowRight } from "@tabler/icons-react"

import { Header } from "@/components/header"
import { AuditStepIndicator } from "@/components/audit/step-indicator"
import { StoreCombobox } from "@/components/audit/store-combobox"
import { TimeRangeCards } from "@/components/audit/time-range-cards"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useAuditStore, type StoreType } from "@/store/use-audit-store"
import type { StoreData } from "@/app/audit/start/start-client"
import { cn } from "@/lib/utils"

const regularStoreType = "Regular" as const
const beanspotStoreTypeOptions = ["Basic", "Medium", "Advance"] as const
const otherStoreTypeOptions = ["Dark Store", "Drive Thru"] as const

type Props = {
  stores: StoreData[]
  selectedStore: StoreData | null
  basePath?: string
  backHref?: string
  onSelectStore: (store: StoreData) => void
}

export function AuditStep1({
  stores,
  selectedStore,
  basePath = "/audit/start",
  backHref = "/dashboard",
  onSelectStore,
}: Props) {
  const router = useRouter()
  const {
    storeType,
    is24Hours,
    openTime,
    closeTime,
    plnPowerVa,
    areas,
    setStoreIdentity,
    setStoreAreas,
  } = useAuditStore()

  const displayOpenTime = is24Hours ? "00:00" : openTime
  const displayCloseTime = is24Hours ? "24:00" : closeTime

  const handle24HoursChange = React.useCallback(
    (checked: boolean) => {
      setStoreIdentity({ is24Hours: checked })
      if (!checked) {
        setStoreIdentity({
          openTime: openTime || "07:00",
          closeTime: closeTime || "22:00",
        })
      }
    },
    [setStoreIdentity, openTime, closeTime]
  )

  const isStep1Valid = Boolean(
    selectedStore && storeType !== "" && plnPowerVa > 0 && areas.sales > 0
  )

  const [isPending, startTransition] = React.useTransition()

  const handleNext = React.useCallback(() => {
    if (!isStep1Valid) return
    startTransition(() => {
      router.push(`${basePath}?step=2`)
    })
  }, [router, isStep1Valid, basePath])

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header
        variant="dashboard-back"
        title="Mulai Audit Baru"
        backHref={backHref}
        className="px-0"
      />

      <main className="flex flex-col gap-8">
        {/* ── Store Picker ─────────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <AuditStepIndicator currentStep={1} label="Step 1: Input Toko" />

          <h2 className="text-lg font-semibold text-primary">Pilih Toko</h2>

          <StoreCombobox
            stores={stores}
            value={selectedStore}
            onSelect={onSelectStore}
          />
        </section>

        {/* ── Identitas & Teknis (hanya tampil setelah pilih toko) ──── */}
        {selectedStore && (
          <>
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-primary">
                Identitas Toko
              </h2>
              <Card className="border-primary/10 bg-muted/30">
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        Kode Toko
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {selectedStore.code}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        Nama Toko
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {selectedStore.name}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        Cabang
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {selectedStore.branch || "-"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        ID PLN
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        {selectedStore.plnCustomerId || "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-primary">Tipe Toko</h2>

              <div className="flex gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Regular
                  </p>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    spacing={1}
                    value={storeType}
                    onValueChange={(value) => {
                      if (value)
                        setStoreIdentity({ storeType: value as StoreType })
                    }}
                    className="flex w-full flex-wrap"
                  >
                    <ToggleGroupItem
                      value={regularStoreType}
                      className="rounded-full px-4 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"
                    >
                      {regularStoreType}
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Beanspot
                  </p>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    spacing={1}
                    value={storeType}
                    onValueChange={(value) => {
                      if (value)
                        setStoreIdentity({ storeType: value as StoreType })
                    }}
                    className="flex w-full flex-wrap"
                  >
                    {beanspotStoreTypeOptions.map((option) => (
                      <ToggleGroupItem
                        key={option}
                        value={option}
                        className="rounded-full px-4 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"
                      >
                        {option}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Lainnya
                </p>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  spacing={1}
                  value={storeType}
                  onValueChange={(value) => {
                    if (value)
                      setStoreIdentity({ storeType: value as StoreType })
                  }}
                  className="flex w-full flex-wrap"
                >
                  {otherStoreTypeOptions.map((option) => (
                    <ToggleGroupItem
                      key={option}
                      value={option}
                      className="rounded-full px-4 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"
                    >
                      {option}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-primary">
                Teknis Toko
              </h2>
              <Card>
                <CardContent>
                  <FieldGroup className="gap-5">
                    <Field>
                      <FieldLabel htmlFor="daya_pln">Daya PLN</FieldLabel>
                      <div className="relative">
                        <Input
                          id="daya_pln"
                          type="number"
                          placeholder="0"
                          value={plnPowerVa || ""}
                          onChange={(e) =>
                            setStoreIdentity({
                              plnPowerVa: Number(e.target.value) || 0,
                            })
                          }
                          className="pr-16 text-sm font-semibold"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                            Va
                          </span>
                        </div>
                      </div>
                    </Field>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        Rincian Luas Area
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {(
                          [
                            {
                              id: "luasan_sales",
                              label: "Sales Area",
                              key: "sales",
                            },
                            {
                              id: "luasan_parkir",
                              label: "Parkiran",
                              key: "parkir",
                            },
                            {
                              id: "luasan_teras",
                              label: "Teras",
                              key: "teras",
                            },
                            {
                              id: "luasan_gudang",
                              label: "Gudang, Toilet & Selasar",
                              key: "gudang",
                            },
                          ] as const
                        ).map(({ id, label, key }) => (
                          <Field key={key}>
                            <FieldLabel htmlFor={id} className="text-xs">
                              {label}
                            </FieldLabel>
                            <div className="relative">
                              <Input
                                id={id}
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={areas[key] || ""}
                                onChange={(e) => {
                                  const val = e.target.value
                                  if (val.includes(".")) {
                                    const [, dec] = val.split(".")
                                    if (dec && dec.length > 2) return
                                  }
                                  setStoreAreas({
                                    [key]: Number(val) || 0,
                                  })
                                }}
                                className="pr-12 text-sm font-semibold"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                  m²
                                </span>
                              </div>
                            </div>
                          </Field>
                        ))}
                      </div>
                    </div>
                  </FieldGroup>
                </CardContent>
              </Card>
            </section>

            <section className="flex flex-col gap-4">
              <Field orientation="horizontal" className="justify-between">
                <FieldLabel
                  htmlFor="operasi-24-jam"
                  className="text-lg font-semibold text-primary"
                >
                  Toko Beroperasi 24 Jam?
                </FieldLabel>
                <Switch
                  id="operasi-24-jam"
                  checked={is24Hours}
                  onCheckedChange={handle24HoursChange}
                />
              </Field>

              {is24Hours ? (
                <Card className="bg-muted/40">
                  <CardContent className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Jam buka tutup</p>
                    <p className="text-sm font-semibold text-primary">
                      {displayOpenTime} sampai {displayCloseTime}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <TimeRangeCards
                  startLabel="Jam Buka"
                  endLabel="Jam Tutup"
                  startValue={displayOpenTime}
                  endValue={displayCloseTime}
                  onStartChange={(val) => setStoreIdentity({ openTime: val })}
                  onEndChange={(val) => setStoreIdentity({ closeTime: val })}
                />
              )}
            </section>
          </>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 backdrop-blur">
        <div className="w-full max-w-sm">
          <Button
            className="h-11 w-full"
            disabled={!isStep1Valid || isPending}
            onClick={handleNext}
          >
            {isPending ? "Memproses..." : "Lanjut ke Input Equipment"}
            {!isPending && <IconArrowRight data-icon="inline-end" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
