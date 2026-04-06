"use client"

import * as React from "react"
import { IconClock } from "@tabler/icons-react"

import { Card, CardContent } from "@/components/ui/card"

type TimeRangeCardsProps = {
  startLabel: string
  endLabel: string
  startValue: string
  endValue: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  className?: string
}

function TimeRangeCards({
  startLabel,
  endLabel,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  className,
}: TimeRangeCardsProps) {
  const startInputRef = React.useRef<HTMLInputElement | null>(null)
  const endInputRef = React.useRef<HTMLInputElement | null>(null)

  const openTimePicker = React.useCallback(
    (ref: React.RefObject<HTMLInputElement | null>) => {
      const input = ref.current

      if (!input) {
        return
      }

      if (typeof input.showPicker === "function") {
        input.showPicker()
        return
      }

      input.focus()
      input.click()
    },
    []
  )

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent>
            <button
              type="button"
              className="flex w-full flex-col gap-1 text-left"
              onClick={() => openTimePicker(startInputRef)}
            >
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {startLabel}
              </p>
              <p className="flex items-center gap-1 text-sm font-semibold text-primary">
                <IconClock className="size-4" />
                {startValue}
              </p>
            </button>
            <input
              ref={startInputRef}
              type="time"
              value={startValue}
              onChange={(event) => onStartChange(event.target.value)}
              className="absolute size-px opacity-0"
              tabIndex={-1}
              aria-hidden
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <button
              type="button"
              className="flex w-full flex-col gap-1 text-left"
              onClick={() => openTimePicker(endInputRef)}
            >
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {endLabel}
              </p>
              <p className="flex items-center gap-1 text-sm font-semibold text-primary">
                <IconClock className="size-4" />
                {endValue}
              </p>
            </button>
            <input
              ref={endInputRef}
              type="time"
              value={endValue}
              onChange={(event) => onEndChange(event.target.value)}
              className="absolute size-px opacity-0"
              tabIndex={-1}
              aria-hidden
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { TimeRangeCards }
