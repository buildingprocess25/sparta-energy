"use client"

import { formatKwh } from "@/components/audit-validation/format"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { averagePlnKwh } from "@/lib/audit-recalculate"
import {
  BILLING_MONTH_NAMES,
  formatBillingMonth,
  parseBillingMonth,
} from "@/lib/billing-month"
import { cn } from "@/lib/utils"

export type PlnDraftRow = {
  id: string
  billingMonth: string
  plnUsageKwh: string
  salesTransactionPerDay: string
}

type PlnHistoryEditorProps = {
  rows: PlnDraftRow[]
  onChange: (rows: PlnDraftRow[]) => void
  disabled?: boolean
}

// The last few years plus the next one, always including the stored year.
function yearOptions(current: number) {
  const thisYear = new Date().getFullYear()
  const years = new Set<number>([current])
  for (let year = thisYear - 3; year <= thisYear + 1; year++) years.add(year)
  return Array.from(years).sort((a, b) => a - b)
}

export function toNumberOrZero(value: string) {
  const number = Number(value.replace(",", "."))
  return Number.isFinite(number) ? number : 0
}

export function PlnHistoryEditor({
  rows,
  onChange,
  disabled,
}: PlnHistoryEditorProps) {
  const average = averagePlnKwh(
    rows.map((row) => toNumberOrZero(row.plnUsageKwh))
  )
  const columns = "sm:grid-cols-[minmax(0,1fr)_5.5rem_8rem_6.5rem]"

  function updateRow(id: string, patch: Partial<PlnDraftRow>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
        Kalkulasi ini tidak punya riwayat PLN.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "hidden gap-2 px-3 text-xs font-medium text-muted-foreground sm:grid",
          columns
        )}
        aria-hidden="true"
      >
        <span>Bulan</span>
        <span>Tahun</span>
        <span>kWh</span>
        <span>STD</span>
      </div>

      <ol className="flex flex-col gap-2">
        {rows.map((row) => {
          const parsed = parseBillingMonth(row.billingMonth) ?? {
            monthIndex: 0,
            year: new Date().getFullYear(),
          }
          return (
            <li
              key={row.id}
              className={cn(
                "grid grid-cols-2 items-center gap-2 rounded-xl bg-muted/40 p-3",
                columns
              )}
            >
              <Select
                value={String(parsed.monthIndex)}
                onValueChange={(value) =>
                  updateRow(row.id, {
                    billingMonth: formatBillingMonth(
                      Number(value),
                      parsed.year
                    ),
                  })
                }
                disabled={disabled}
              >
                <SelectTrigger
                  className="h-11 w-full"
                  aria-label={`Bulan ${row.billingMonth}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_MONTH_NAMES.map((name, index) => (
                    <SelectItem key={name} value={String(index)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(parsed.year)}
                onValueChange={(value) =>
                  updateRow(row.id, {
                    billingMonth: formatBillingMonth(
                      parsed.monthIndex,
                      Number(value)
                    ),
                  })
                }
                disabled={disabled}
              >
                <SelectTrigger
                  className="h-11 w-full tabular-nums"
                  aria-label={`Tahun ${row.billingMonth}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions(parsed.year).map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={row.plnUsageKwh}
                onChange={(e) =>
                  updateRow(row.id, { plnUsageKwh: e.target.value })
                }
                disabled={disabled}
                placeholder="kWh"
                aria-label={`kWh PLN ${row.billingMonth}`}
                className="h-11 tabular-nums"
              />
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={row.salesTransactionPerDay}
                onChange={(e) =>
                  updateRow(row.id, { salesTransactionPerDay: e.target.value })
                }
                disabled={disabled}
                placeholder="STD"
                aria-label={`STD ${row.billingMonth}`}
                className="h-11 tabular-nums"
              />
            </li>
          )
        })}
      </ol>

      <p className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5 text-sm tabular-nums">
        <span>Rata-rata aktual PLN</span>
        <span className="font-semibold">{formatKwh(average)} / bulan</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Bulan dengan 0 kWh tidak ikut dihitung. STD adalah rata-rata transaksi
        per hari.
      </p>
    </div>
  )
}
