"use client"

import * as React from "react"
import { SimpleTimePicker } from "@/components/simple-time-picker"
import { cn } from "@/lib/utils"

type TimeRangeCardsProps = {
  startLabel: string
  endLabel: string
  startValue: string   // "HH:mm"
  endValue: string     // "HH:mm"
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  className?: string
}

/** Parse "HH:mm" string → Date (hari ini, jam & menit sesuai). */
function timeStrToDate(timeStr: string): Date {
  const [h, m] = (timeStr || "00:00").split(":").map(Number)
  const d = new Date()
  d.setHours(h ?? 0, m ?? 0, 0, 0)
  return d
}

/** Format Date → "HH:mm" string. */
function dateToTimeStr(date: Date): string {
  return [
    date.getHours().toString().padStart(2, "0"),
    date.getMinutes().toString().padStart(2, "0"),
  ].join(":")
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
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {startLabel}
        </p>
        <SimpleTimePicker
          value={timeStrToDate(startValue)}
          onChange={(date) => onStartChange(dateToTimeStr(date))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {endLabel}
        </p>
        <SimpleTimePicker
          value={timeStrToDate(endValue)}
          onChange={(date) => onEndChange(dateToTimeStr(date))}
        />
      </div>
    </div>
  )
}

export { TimeRangeCards }
