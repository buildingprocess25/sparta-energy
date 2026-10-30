import type { ReactNode } from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type NumberFieldProps = {
  id: string
  label: string
  value: number | null
  onChange: (value: number | null) => void
  step?: number
  integer?: boolean
  placeholder?: string
  description?: ReactNode
  className?: string
}

// Accepts a comma as decimal separator, as auditors type it on Indonesian keyboards.
function parseNumber(value: string) {
  if (value.trim() === "") return null
  const number = Number(value.replace(",", "."))
  return Number.isFinite(number) && number >= 0 ? number : null
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  step = 0.1,
  integer = false,
  placeholder,
  description,
  className,
}: NumberFieldProps) {
  return (
    <Field className={className}>
      <FieldLabel htmlFor={id} className="text-xs">
        {label}
      </FieldLabel>
      <Input
        id={id}
        type="number"
        inputMode={integer ? "numeric" : "decimal"}
        min={0}
        step={integer ? 1 : step}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => {
          const next = parseNumber(e.target.value)
          onChange(integer && next !== null ? Math.round(next) : next)
        }}
        className="h-11"
      />
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  )
}
