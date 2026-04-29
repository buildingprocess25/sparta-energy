"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import {
  IconCheck,
  IconChevronDown,
  IconSearch,
  IconX,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

type Brand = { id: string; name: string; baseKw: number }

type BrandComboboxProps = {
  brands: Brand[]
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export function BrandCombobox({
  brands,
  value,
  onChange,
  placeholder = "-",
}: BrandComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return brands
    return brands.filter((b) => b.name.toLowerCase().includes(q))
  }, [brands, query])

  // Focus search input when popover opens; clear query on close
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setQuery("")
    }
  }, [open])

  function handleSelect(brand: Brand) {
    onChange(brand.name)
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange("")
    setOpen(false)
  }

  const isSelected = (b: Brand) =>
    b.name.toLowerCase() === value.toLowerCase().trim()

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      {/* ── Trigger ──────────────────────────────────────────────── */}
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 text-xs shadow-xs transition-[color,box-shadow] outline-none",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50",
            !value && "text-muted-foreground"
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <span className="ml-2 flex shrink-0 items-center gap-1">
            {value && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Hapus merek"
                onClick={handleClear}
                className="flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
              >
                <IconX className="size-3" />
              </span>
            )}
            <IconChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
            />
          </span>
        </button>
      </PopoverPrimitive.Trigger>

      {/* ── Popover content ──────────────────────────────────────── */}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={6}
          align="start"
          className={cn(
            "z-50 w-(--radix-popover-trigger-width) overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          )}
        >
          {/* Search + free-text input */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <IconSearch className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              role="searchbox"
              aria-label="Cari atau ketik merek"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari merek atau ketik merek baru..."
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* List */}
          <div
            role="listbox"
            aria-label="Daftar merek"
            className="max-h-52 overflow-y-auto py-1"
          >
            {/* "Use as custom brand" option when query doesn't match any existing */}
            {query.trim() !== "" &&
              !filtered.some(
                (b) => b.name.toLowerCase() === query.toLowerCase().trim()
              ) && (
                <button
                  type="button"
                  role="option"
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-foreground/10"
                  onClick={() => {
                    onChange(query.trim())
                    setOpen(false)
                  }}
                >
                  <span className="text-muted-foreground">Tambah merek:</span>
                  <span className="font-semibold text-foreground">
                    &ldquo;{query.trim()}&rdquo;
                  </span>
                </button>
              )}

            {filtered.length === 0 && query.trim() === "" && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Belum ada data merek.
              </div>
            )}

            {filtered.map((brand) => {
              const sel = isSelected(brand)
              return (
                <button
                  key={brand.id}
                  role="option"
                  aria-selected={sel}
                  type="button"
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-sm transition-colors",
                    "hover:bg-foreground/10 hover:text-foreground",
                    "focus-visible:bg-foreground/10 focus-visible:outline-none",
                    sel && "bg-foreground/10 font-medium"
                  )}
                  onClick={() => handleSelect(brand)}
                >
                  <div>
                    <span className="font-semibold text-foreground">
                      {brand.name}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {brand.baseKw} kW
                    </span>
                  </div>
                  {sel && (
                    <IconCheck className="ml-2 size-4 shrink-0 text-primary" />
                  )}
                </button>
              )
            })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
