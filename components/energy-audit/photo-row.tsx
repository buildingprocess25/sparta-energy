import type { ReactNode } from "react"

type PhotoRowProps = {
  title: string
  hint: string
  children: ReactNode
}

export function PhotoRow({ title, hint, children }: PhotoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 p-3">
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      {children}
    </div>
  )
}

// The upload route only accepts A-Z, 0-9 and "-" up to 12 characters in file names.
export function photoCode(label: string, fallback: string) {
  return (
    label
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "")
      .slice(0, 12) || fallback
  )
}
