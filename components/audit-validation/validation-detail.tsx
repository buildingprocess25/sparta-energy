"use client"

import Link from "next/link"
import { IconArrowRight, IconChevronLeft } from "@tabler/icons-react"

import { StepActionBar } from "@/components/audit-validation/step-action-bar"
import { StepEquipment } from "@/components/audit-validation/step-equipment"
import { StepInput } from "@/components/audit-validation/step-input"
import { StepTechnical } from "@/components/audit-validation/step-technical"
import { AuditStepIndicator } from "@/components/audit/step-indicator"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { getHoursBetween } from "@/lib/audit-kalkulator"
import type { ValidationAudit } from "@/lib/audit-validation-queries"
import type { EquipmentMasterItem } from "@/lib/get-equipment-for-area"

export type ValidationStep = 1 | 2 | 3

type ValidationDetailProps = {
  audit: ValidationAudit
  equipmentMaster: EquipmentMasterItem[]
  step: ValidationStep
}

const steps: Record<ValidationStep, { label: string; description: string; next?: string }> = {
  1: {
    label: "Step 1: Validasi Inputan Toko",
    description: "Cek hasil audit dan alat yang diinput anak toko.",
    next: "Lanjut ke Data Toko",
  },
  2: {
    label: "Step 2: Validasi Data Toko",
    description: "Centang alat yang ada di toko dan isi jumlahnya.",
    next: "Lanjut ke Teknis Toko",
  },
  3: {
    label: "Step 3: Teknis Toko",
    description: "Cek tipe toko, daya PLN, luas area, dan jam operasional.",
  },
}

export function ValidationDetail({
  audit,
  equipmentMaster,
  step,
}: ValidationDetailProps) {
  const basePath = `/audit/validation/${audit.id}`
  const stepHref = (target: ValidationStep) =>
    target === 1 ? basePath : `${basePath}?step=${target}`
  const current = steps[step]

  const { is24Hours, openTime, closeTime } = audit.technical
  const defaultHours =
    is24Hours || !openTime || !closeTime
      ? 24
      : getHoursBetween(openTime, closeTime)

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md md:max-w-5xl lg:max-w-7xl flex-col bg-background px-4 md:px-6 lg:px-8 pb-36">
      <Header
        variant="dashboard-back"
        title="Validasi Audit"
        subtitle={`${audit.store.name} · ${audit.store.code}`}
        backHref="/audit/validation"
        backLabel="Kembali ke daftar validasi"
      />

      <main className="flex flex-col gap-5">
        <section className="flex flex-col gap-1.5">
          <AuditStepIndicator currentStep={step} label={current.label} />
          <p className="text-sm text-muted-foreground">{current.description}</p>
        </section>

        {step === 1 && (
          <StepInput
            audit={audit}
            equipmentMaster={equipmentMaster}
            defaultHours={defaultHours}
          />
        )}
        {step === 2 && (
          <StepEquipment
            audit={audit}
            equipmentMaster={equipmentMaster}
            defaultHours={defaultHours}
          />
        )}
        {step === 3 && <StepTechnical audit={audit} backHref={stepHref(2)} />}
      </main>

      {step !== 3 && (
        <StepActionBar>
          {step === 2 && (
            <Button asChild variant="outline" className="h-11 rounded-full">
              <Link href={stepHref(1)} aria-label="Kembali ke Step 1">
                <IconChevronLeft />
              </Link>
            </Button>
          )}
          <Button asChild className="h-11 flex-1 rounded-full">
            <Link href={stepHref((step + 1) as ValidationStep)}>
              {current.next}
              <IconArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </StepActionBar>
      )}
    </div>
  )
}
