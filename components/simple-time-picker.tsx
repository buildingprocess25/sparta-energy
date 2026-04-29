"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Clock, ChevronDownIcon, CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  format,
  parse,
  setHours,
  startOfHour,
  endOfHour,
  setMinutes,
  startOfMinute,
  endOfMinute,
  startOfDay,
  endOfDay,
  addHours,
  subHours,
  setSeconds,
  setMilliseconds,
} from "date-fns"

interface SimpleTimeOption {
  value: number
  label: string
  disabled?: boolean
}

const AM_VALUE = 0
const PM_VALUE = 1

export function SimpleTimePicker({
  value,
  onChange,
  use12HourFormat,
  min,
  max,
  disabled,
  modal,
}: {
  use12HourFormat?: boolean
  value: Date
  onChange: (date: Date) => void
  min?: Date
  max?: Date
  disabled?: boolean
  className?: string
  modal?: boolean
}) {
  const formatStr = useMemo(
    () =>
      use12HourFormat
        ? "yyyy-MM-dd hh:mm:ss.SSS a xxxx"
        : "yyyy-MM-dd HH:mm:ss.SSS xxxx",
    [use12HourFormat]
  )

  const [ampm, setAmpm] = useState(
    format(value, "a") === "AM" ? AM_VALUE : PM_VALUE
  )
  const [hour, setHour] = useState(
    use12HourFormat ? +format(value, "hh") : value.getHours()
  )
  const [minute, setMinute] = useState(value.getMinutes())

  useEffect(() => {
    onChange(
      buildTime({ use12HourFormat, value, formatStr, hour, minute, ampm })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour, minute, ampm, formatStr, use12HourFormat])

  const _hourIn24h = useMemo(() => {
    return use12HourFormat ? (hour % 12) + ampm * 12 : hour
  }, [hour, use12HourFormat, ampm])

  const hours: SimpleTimeOption[] = useMemo(
    () =>
      Array.from({ length: use12HourFormat ? 12 : 24 }, (_, i) => {
        let isDisabled = false
        const hourValue = use12HourFormat ? (i === 0 ? 12 : i) : i
        const hDate = setHours(value, use12HourFormat ? i + ampm * 12 : i)
        const hStart = startOfHour(hDate)
        const hEnd = endOfHour(hDate)
        if (min && hEnd < min) isDisabled = true
        if (max && hStart > max) isDisabled = true
        return {
          value: hourValue,
          label: hourValue.toString().padStart(2, "0"),
          disabled: isDisabled,
        }
      }),
    [value, min, max, use12HourFormat, ampm]
  )

  const minutes: SimpleTimeOption[] = useMemo(() => {
    const anchorDate = setHours(value, _hourIn24h)
    return Array.from({ length: 60 }, (_, i) => {
      let isDisabled = false
      const mDate = setMinutes(anchorDate, i)
      const mStart = startOfMinute(mDate)
      const mEnd = endOfMinute(mDate)
      if (min && mEnd < min) isDisabled = true
      if (max && mStart > max) isDisabled = true
      return {
        value: i,
        label: i.toString().padStart(2, "0"),
        disabled: isDisabled,
      }
    })
  }, [value, min, max, _hourIn24h])

  const ampmOptions = useMemo(() => {
    const startD = startOfDay(value)
    const endD = endOfDay(value)
    return [
      { value: AM_VALUE, label: "AM" },
      { value: PM_VALUE, label: "PM" },
    ].map((v) => {
      let isDisabled = false
      const start = addHours(startD, v.value * 12)
      const end = subHours(endD, (1 - v.value) * 12)
      if (min && end < min) isDisabled = true
      if (max && start > max) isDisabled = true
      return { ...v, disabled: isDisabled }
    })
  }, [value, min, max])

  const [open, setOpen] = useState(false)

  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (open) {
        hourRef.current?.scrollIntoView({ behavior: "auto" })
        minuteRef.current?.scrollIntoView({ behavior: "auto" })
      }
    }, 1)
    return () => clearTimeout(timeoutId)
  }, [open])

  const onHourChange = useCallback(
    (v: SimpleTimeOption) => {
      if (min) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour: v.value,
          minute,
          ampm,
        })
        if (newTime < min) {
          setMinute(min.getMinutes())
        }
      }
      if (max) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour: v.value,
          minute,
          ampm,
        })
        if (newTime > max) {
          setMinute(max.getMinutes())
        }
      }
      setHour(v.value)
    },
    [use12HourFormat, value, formatStr, minute, ampm, min, max]
  )

  const onMinuteChange = useCallback((v: SimpleTimeOption) => {
    setMinute(v.value)
  }, [])

  const onAmpmChange = useCallback(
    (v: SimpleTimeOption) => {
      if (min) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour,
          minute,
          ampm: v.value,
        })
        if (newTime < min) {
          const minH = min.getHours() % 12
          setHour(minH === 0 ? 12 : minH)
          setMinute(min.getMinutes())
        }
      }
      if (max) {
        const newTime = buildTime({
          use12HourFormat,
          value,
          formatStr,
          hour,
          minute,
          ampm: v.value,
        })
        if (newTime > max) {
          const maxH = max.getHours() % 12
          setHour(maxH === 0 ? 12 : maxH)
          setMinute(max.getMinutes())
        }
      }
      setAmpm(v.value)
    },
    [use12HourFormat, value, formatStr, hour, minute, min, max]
  )

  const display = useMemo(() => {
    return format(value, use12HourFormat ? "hh:mm a" : "HH:mm")
  }, [value, use12HourFormat])

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal ?? true}>
      <PopoverTrigger asChild>
        <div
          // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-9 cursor-pointer items-center justify-between rounded-full border border-input px-3 text-sm font-normal",
            disabled && "cursor-not-allowed opacity-50"
          )}
          tabIndex={0}
        >
          <Clock className="mr-2 size-4" />
          {display}
          <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        side="top"
        sideOffset={4}
        align="start"
      >
        <div className="flex-col gap-2 p-2">
          <div className="flex h-56">
            {/* Hours */}
            <div
              className="no-scrollbar h-full flex-1 overflow-y-auto"
              onPointerMove={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col pr-1 pb-48">
                {hours.map((v) => (
                  <div
                    ref={v.value === hour ? hourRef : undefined}
                    key={v.value}
                  >
                    <TimeItem
                      option={v}
                      selected={v.value === hour}
                      onSelect={onHourChange}
                      disabled={v.disabled}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div
              className="no-scrollbar h-full flex-1 overflow-y-auto"
              onPointerMove={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col pr-1 pb-48">
                {minutes.map((v) => (
                  <div
                    ref={v.value === minute ? minuteRef : undefined}
                    key={v.value}
                  >
                    <TimeItem
                      option={v}
                      selected={v.value === minute}
                      onSelect={onMinuteChange}
                      disabled={v.disabled}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* AM/PM */}
            {use12HourFormat && (
              <div
                className="no-scrollbar h-full flex-1 overflow-y-auto"
                onPointerMove={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col pr-1">
                  {ampmOptions.map((v) => (
                    <TimeItem
                      key={v.value}
                      option={v}
                      selected={v.value === ampm}
                      onSelect={onAmpmChange}
                      className="h-8"
                      disabled={v.disabled}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const TimeItem = ({
  option,
  selected,
  onSelect,
  className,
  disabled,
}: {
  option: SimpleTimeOption
  selected: boolean
  onSelect: (option: SimpleTimeOption) => void
  className?: string
  disabled?: boolean
}) => {
  return (
    <Button
      variant="ghost"
      className={cn("flex justify-center px-1 ps-1 pe-2", className)}
      onClick={() => onSelect(option)}
      disabled={disabled}
    >
      <div className="w-4">
        {selected && <CheckIcon className="my-auto size-4" />}
      </div>
      <span className="ms-2">{option.label}</span>
    </Button>
  )
}

interface BuildTimeOptions {
  use12HourFormat?: boolean
  value: Date
  formatStr: string
  hour: number
  minute: number
  ampm: number
}

function buildTime({
  use12HourFormat,
  value,
  formatStr,
  hour,
  minute,
  ampm,
}: BuildTimeOptions) {
  let date: Date
  if (use12HourFormat) {
    const dateStrRaw = format(value, formatStr)
    let dateStr =
      dateStrRaw.slice(0, 11) +
      hour.toString().padStart(2, "0") +
      dateStrRaw.slice(13)
    dateStr =
      dateStr.slice(0, 14) +
      minute.toString().padStart(2, "0") +
      dateStr.slice(16)
    dateStr =
      dateStr.slice(0, 24) +
      (ampm === AM_VALUE ? "AM" : "PM") +
      dateStr.slice(26)
    date = parse(dateStr, formatStr, value)
  } else {
    date = setHours(
      setMinutes(setSeconds(setMilliseconds(value, 0), 0), minute),
      hour
    )
  }
  return date
}
