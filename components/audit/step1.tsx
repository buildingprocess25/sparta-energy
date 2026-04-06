"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { IconArrowRight, IconInfoCircle } from "@tabler/icons-react"

import { Header } from "@/components/header"
import { AuditStepIndicator } from "@/components/audit/step-indicator"
import { TimeRangeCards } from "@/components/audit/time-range-cards"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const storeTypeOptions = ["Regular", "Advance", "Medium", "Basic"] as const

export function AuditStep1() {
  const router = useRouter()
  const [storeType, setStoreType] =
    React.useState<(typeof storeTypeOptions)[number]>("Regular")
  const [is24Hours, setIs24Hours] = React.useState(true)
  const [openTime, setOpenTime] = React.useState("07:00")
  const [closeTime, setCloseTime] = React.useState("22:00")

  const displayOpenTime = is24Hours ? "00:00" : openTime
  const displayCloseTime = is24Hours ? "24:00" : closeTime

  const handle24HoursChange = React.useCallback((checked: boolean) => {
    setIs24Hours(checked)

    if (!checked) {
      setOpenTime((prev) => prev || "07:00")
      setCloseTime((prev) => prev || "22:00")
    }
  }, [])

  const handleNext = React.useCallback(() => {
    router.push("/audit/start?step=2")
  }, [router])

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header
        variant="dashboard-back"
        title="Mulai Audit Baru"
        backHref="/dashboard"
        className="px-0"
      />

      <main className="flex flex-col gap-8">
        <section>
          <AuditStepIndicator currentStep={1} label="Step 1: Input Toko" />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-primary">Identitas Toko</h2>
          <Card>
            <CardContent>
              <FieldGroup className="gap-5">
                <Field>
                  <FieldLabel htmlFor="kode_toko">Kode Toko</FieldLabel>
                  <Input
                    id="kode_toko"
                    placeholder="ID-99281"
                    defaultValue="ID-99281"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="nama_toko">Nama Toko</FieldLabel>
                  <Input id="nama_toko" placeholder="Masukkan nama toko" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="cabang">Cabang</FieldLabel>
                  <Input id="cabang" placeholder="Masukkan cabang" />
                </Field>

                <Field>
                  <div className="flex items-center justify-between gap-2">
                    <FieldLabel htmlFor="id_pln">ID Pelanggan PLN</FieldLabel>
                    <IconInfoCircle className="size-4 text-muted-foreground" />
                  </div>
                  <Input id="id_pln" placeholder="Masukkan ID pelanggan PLN" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-primary">
            Tipe Toko (Beanspot)
          </h2>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={1}
            value={storeType}
            onValueChange={(value) => {
              if (value) {
                setStoreType(value as (typeof storeTypeOptions)[number])
              }
            }}
            className="flex w-full flex-wrap"
          >
            {storeTypeOptions.map((option) => (
              <ToggleGroupItem
                key={option}
                value={option}
                className="rounded-full px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"
              >
                {option}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-primary">Teknis Toko</h2>
          <div className="grid grid-cols-1 gap-3">
            <Card className="bg-muted/45">
              <CardHeader>
                <CardTitle className="text-sm">Daya PLN</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Input
                  type="number"
                  defaultValue={41.5}
                  className="h-10 text-lg font-semibold text-primary"
                />
                <span className="rounded-md bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                  kVA
                </span>
              </CardContent>
            </Card>

            <Card className="bg-muted/45">
              <CardHeader>
                <CardTitle className="text-sm">Luasan Toko</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Input
                  type="number"
                  defaultValue={120}
                  className="h-10 text-lg font-semibold text-primary"
                />
                <span className="rounded-md bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                  m²
                </span>
              </CardContent>
            </Card>
          </div>
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
                <p className="text-sm font-medium">Jam buka-tutup</p>
                <p className="text-sm font-semibold text-primary">
                  {displayOpenTime} - {displayCloseTime}
                </p>
              </CardContent>
            </Card>
          ) : (
            <TimeRangeCards
              startLabel="Jam Buka"
              endLabel="Jam Tutup"
              startValue={displayOpenTime}
              endValue={displayCloseTime}
              onStartChange={setOpenTime}
              onEndChange={setCloseTime}
            />
          )}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 backdrop-blur">
        <div className="w-full max-w-sm">
          <Button className="h-11 w-full" onClick={handleNext}>
            Lanjut ke Input Equipment
            <IconArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  )
}
