import { Skeleton } from "@/components/ui/skeleton"

export type AuditStepSkeletonVariant =
  | "step-1"
  | "step-2"
  | "step-2-detail"
  | "step-3"

type AuditStepSkeletonProps = {
  variant: AuditStepSkeletonVariant
  areaName?: string
}

const skeletonLabels: Record<AuditStepSkeletonVariant, string> = {
  "step-1": "Memuat input toko",
  "step-2": "Memuat input equipment",
  "step-2-detail": "Memuat detail area",
  "step-3": "Memuat data operasional",
}

function StepIndicatorSkeleton({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="size-6 rounded-full" />
      <Skeleton className={step === 1 ? "h-4 w-32" : "h-4 w-40"} />
    </div>
  )
}

function Step1Skeleton() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <StepIndicatorSkeleton step={1} />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-11 w-full rounded-md" />
      </section>

      <section className="flex flex-col gap-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </section>

      <section className="flex flex-col gap-4">
        <Skeleton className="h-6 w-28" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </section>
    </div>
  )
}

function Step2Skeleton() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <StepIndicatorSkeleton step={2} />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </section>

      <section className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-30 w-full rounded-xl" />
        ))}
      </section>
    </div>
  )
}

function Step2DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </section>

      <section className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-2xl" />
        ))}
        <Skeleton className="h-12 w-full rounded-2xl" />
      </section>
    </div>
  )
}

function Step3Skeleton() {
  return (
    <div className="flex flex-col gap-6">
      <StepIndicatorSkeleton step={3} />
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="rounded-lg border bg-card p-3">
          <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            {Array.from({ length: 18 }).map((_, index) => (
              <Skeleton key={index} className="h-7 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuditStepSkeleton({
  variant,
  areaName,
}: AuditStepSkeletonProps) {
  const label =
    variant === "step-2-detail" && areaName
      ? `${skeletonLabels[variant]} ${areaName}`
      : skeletonLabels[variant]

  return (
    <div
      aria-busy="true"
      aria-label={label}
      role="status"
      className="flex flex-col"
    >
      {variant === "step-1" ? <Step1Skeleton /> : null}
      {variant === "step-2" ? <Step2Skeleton /> : null}
      {variant === "step-2-detail" ? <Step2DetailSkeleton /> : null}
      {variant === "step-3" ? <Step3Skeleton /> : null}
    </div>
  )
}
