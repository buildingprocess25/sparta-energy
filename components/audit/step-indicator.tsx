import { Fragment } from "react"

import { cn } from "@/lib/utils"

type AuditStepIndicatorProps = {
  currentStep: number
  label: string
  totalSteps?: number
  className?: string
}

function AuditStepIndicator({
  currentStep,
  label,
  totalSteps = 3,
  className,
}: AuditStepIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1
          return (
            <Fragment key={step}>
              {step > 1 && (
                <span
                  className={cn(
                    "h-0.5 w-7 rounded-full",
                    currentStep >= step ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              <span
                className={cn(
                  "size-2 rounded-full",
                  currentStep >= step ? "bg-primary" : "border border-border"
                )}
              />
            </Fragment>
          )
        })}
      </div>

      <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
    </div>
  )
}

export { AuditStepIndicator }
