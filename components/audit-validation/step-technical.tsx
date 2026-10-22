"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconChevronLeft, IconCircleCheck } from "@tabler/icons-react"
import { toast } from "sonner"

import {
  saveAuditTechnical,
  validateAudit,
  type AuditTechnicalInput,
} from "@/app/actions/audit-validation"
import { StepActionBar } from "@/components/audit-validation/step-action-bar"
import { TimeRangeCards } from "@/components/audit/time-range-cards"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { ValidationAudit } from "@/lib/audit-validation-queries"
import { STORE_TYPES } from "@/lib/store-types"

type StepTechnicalProps = {
  audit: ValidationAudit
  backHref: string
}

type AreaKey = keyof AuditTechnicalInput["areas"]

const areaFields: { key: AreaKey; label: string }[] = [
  { key: "sales", label: "Sales Area" },
  { key: "parkir", label: "Parkiran" },
  { key: "teras", label: "Teras" },
  { key: "gudang", label: "Gudang, Toilet & Selasar" },
]

function toInput(value: number | null | undefined) {
  return value ? String(value) : ""
}

export function StepTechnical({ audit, backHref }: StepTechnicalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmValidate, setConfirmValidate] = useState(false)
  const technical = audit.technical
  const isLocked = audit.isValidated
  const copyNote = audit.isLatest
    ? "Disalin ke data toko setelah divalidasi."
    : "Ini bukan audit terbaru toko ini, jadi tidak disalin ke data toko."

  const [storeType, setStoreType] = useState(technical.storeType ?? "")
  const [plnPowerVa, setPlnPowerVa] = useState(toInput(technical.plnPowerVa))
  const [areas, setAreas] = useState<Record<AreaKey, string>>({
    sales: toInput(technical.areas.sales),
    parkir: toInput(technical.areas.parkir),
    teras: toInput(technical.areas.teras),
    gudang: toInput(technical.areas.gudang),
  })
  const [is24Hours, setIs24Hours] = useState(technical.is24Hours)
  const [openTime, setOpenTime] = useState(technical.openTime ?? "07:00")
  const [closeTime, setCloseTime] = useState(technical.closeTime ?? "22:00")

  function collect(): AuditTechnicalInput {
    return {
      storeType,
      plnPowerVa: Number(plnPowerVa),
      areas: {
        sales: Number(areas.sales || 0),
        parkir: Number(areas.parkir || 0),
        teras: Number(areas.teras || 0),
        gudang: Number(areas.gudang || 0),
      },
      is24Hours,
      openTime: is24Hours ? null : openTime,
      closeTime: is24Hours ? null : closeTime,
    }
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveAuditTechnical(audit.id, collect())
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.refresh()
    })
  }

  function handleValidate() {
    startTransition(async () => {
      const result = await validateAudit(audit.id, collect())
      if (!result.success) {
        toast.error(result.message)
        setConfirmValidate(false)
        return
      }
      toast.success(result.message)
      setConfirmValidate(false)
      router.push("/audit/validation")
    })
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tipe Toko</CardTitle>
            <CardDescription>
              {storeType
                ? copyNote
                : "Tipe toko belum diisi. Pilih tipe yang sesuai."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={1}
              value={storeType}
              onValueChange={(value) => {
                if (value) setStoreType(value)
              }}
              disabled={isLocked}
              className="flex w-full flex-wrap"
              aria-label="Tipe toko"
            >
              {STORE_TYPES.map((option) => (
                <ToggleGroupItem
                  key={option}
                  value={option}
                  className="h-11 rounded-full px-4 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary/90"
                >
                  {option}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Teknis Toko</CardTitle>
            <CardDescription>
              Nilai yang diisi anak toko saat audit. {copyNote}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="tech-pln">Daya PLN</FieldLabel>
                <div className="relative">
                  <Input
                    id="tech-pln"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={plnPowerVa}
                    onChange={(e) => setPlnPowerVa(e.target.value)}
                    disabled={isLocked}
                    className="pr-14 text-sm font-semibold"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 my-auto h-fit rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    VA
                  </span>
                </div>
              </Field>

              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Rincian Luas Area</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {areaFields.map(({ key, label }) => (
                    <Field key={key}>
                      <FieldLabel htmlFor={`tech-${key}`} className="text-xs">
                        {label}
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id={`tech-${key}`}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step={0.01}
                          value={areas[key]}
                          onChange={(e) =>
                            setAreas((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          disabled={isLocked}
                          className="pr-12 text-sm font-semibold"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 my-auto h-fit rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          m²
                        </span>
                      </div>
                    </Field>
                  ))}
                </div>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Jam Operasional</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field orientation="horizontal" className="justify-between">
              <FieldLabel htmlFor="tech-24">Toko beroperasi 24 jam</FieldLabel>
              <Switch
                id="tech-24"
                checked={is24Hours}
                onCheckedChange={setIs24Hours}
                disabled={isLocked}
              />
            </Field>
            {is24Hours ? null : isLocked ? (
              <p className="text-sm font-semibold text-primary tabular-nums">
                {openTime} sampai {closeTime}
              </p>
            ) : (
              <TimeRangeCards
                startLabel="Jam Buka"
                endLabel="Jam Tutup"
                startValue={openTime}
                endValue={closeTime}
                onStartChange={setOpenTime}
                onEndChange={setCloseTime}
              />
            )}
            <FieldDescription>
              Mengubah jam operasional tidak menghitung ulang baseline.
            </FieldDescription>
          </CardContent>
        </Card>
      </div>

      <StepActionBar>
        <Button asChild variant="outline" className="h-11 rounded-full">
          <Link href={backHref} aria-label="Kembali ke Step 2">
            <IconChevronLeft />
          </Link>
        </Button>
        {isLocked ? (
          <Button asChild className="h-11 flex-1 rounded-full">
            <Link href="/audit/validation">Kembali ke Daftar Toko</Link>
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-full"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button
              type="button"
              className="h-11 flex-1 rounded-full"
              onClick={() => setConfirmValidate(true)}
              disabled={isPending}
            >
              <IconCircleCheck data-icon="inline-start" />
              Validasi
            </Button>
          </>
        )}
      </StepActionBar>

      <Dialog
        open={confirmValidate}
        onOpenChange={(open) => {
          if (!isPending) setConfirmValidate(open)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Validasi {audit.store.name}?</DialogTitle>
            <DialogDescription>
              Pastikan alat, jumlah, dan teknis toko sudah sesuai kondisi di
              toko. Setelah divalidasi, audit ini tidak bisa diubah lagi sampai
              ada audit berikutnya.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmValidate(false)}
              disabled={isPending}
            >
              Cek Lagi
            </Button>
            <Button type="button" onClick={handleValidate} disabled={isPending}>
              {isPending ? "Memvalidasi..." : "Validasi Data Toko"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
