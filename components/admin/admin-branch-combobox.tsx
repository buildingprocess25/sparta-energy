"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import {
  IconCheck,
  IconChevronDown,
  IconSearch,
  IconBuildingStore,
  IconX,
  IconPlus,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

type BranchComboboxProps = {
  branches: string[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function BranchCombobox({
  branches,
  value,
  onChange,
  disabled = false,
  placeholder = "Cari cabang...",
}: BranchComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Focus input when popover opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setQuery("")
    }
  }, [open])

  // Split selected value into arrays
  const selectedList = React.useMemo(() => {
    if (value === "none" || value === "all" || !value) return []
    return value.split(",").map((s) => s.trim()).filter(Boolean)
  }, [value])

  // Filter out branches that are already selected, and match search query
  const filteredBranches = React.useMemo(() => {
    const q = query.toLowerCase().trim()
    return branches.filter((b) => {
      const isAlreadySelected = selectedList.includes(b)
      const matchesQuery = b.toLowerCase().includes(q)
      return !isAlreadySelected && matchesQuery
    })
  }, [branches, query, selectedList])

  function handleSelect(branchName: string) {
    if (branchName === "none" || branchName === "all") {
      onChange(branchName)
      setOpen(false)
      return
    }

    // Single click selects and closes
    let newList: string[] = []
    if (selectedList.includes(branchName)) {
      newList = selectedList.filter((b) => b !== branchName)
    } else {
      newList = [...selectedList, branchName]
    }

    if (newList.length === 0) {
      onChange("none")
    } else {
      onChange(newList.join(", "))
    }
    setOpen(false) // Immediately close popover
  }

  function handleRemove(branchName: string) {
    const newList = selectedList.filter((b) => b !== branchName)
    if (newList.length === 0) {
      onChange("none")
    } else {
      onChange(newList.join(", "))
    }
  }

  // Popover list content
  const popoverContent = (
    <PopoverPrimitive.Content
      sideOffset={6}
      align="start"
      className={cn(
        "z-50 w-64 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
      )}
    >
      {/* Search input */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <IconSearch className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          role="searchbox"
          aria-label="Cari cabang"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* List */}
      <div
        role="listbox"
        onWheel={(e) => e.stopPropagation()} // Fix: stop propagation to prevent Radix Dialog from blocking mouse scroll
        className="max-h-60 overflow-y-auto py-1"
      >
        {/* Option: None */}
        {query.trim().length === 0 && (
          <>
            <button
              type="button"
              role="option"
              aria-selected={value === "none" || !value}
              onClick={() => handleSelect("none")}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-xs transition-colors",
                "hover:bg-foreground/10 hover:text-foreground",
                "focus-visible:bg-foreground/10 focus-visible:text-foreground focus-visible:outline-none",
                (value === "none" || !value) && "bg-foreground/10 font-medium"
              )}
            >
              <span className="truncate flex items-center gap-1.5">
                (Tidak ada cabang)
              </span>
              {(value === "none" || !value) && (
                <IconCheck className="ml-2 size-3.5 shrink-0 text-primary" />
              )}
            </button>

            {/* Option: All */}
            <button
              type="button"
              role="option"
              aria-selected={value === "all"}
              onClick={() => handleSelect("all")}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-xs transition-colors",
                "hover:bg-foreground/10 hover:text-foreground",
                "focus-visible:bg-foreground/10 focus-visible:text-foreground focus-visible:outline-none",
                value === "all" && "bg-foreground/10 font-medium"
              )}
            >
              <span className="truncate flex items-center gap-1.5">
                Semua Cabang (Super Auditor)
              </span>
              {value === "all" && (
                <IconCheck className="ml-2 size-3.5 shrink-0 text-primary" />
              )}
            </button>
            <div className="h-[1px] bg-border my-1" />
          </>
        )}

        {filteredBranches.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-muted-foreground">
            Tidak ada cabang yang cocok.
          </div>
        ) : (
          filteredBranches.map((b) => (
            <button
              key={b}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(b)}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-xs transition-colors",
                "hover:bg-foreground/10 hover:text-foreground",
                "focus-visible:bg-foreground/10 focus-visible:text-foreground focus-visible:outline-none"
              )}
            >
              <span className="truncate flex items-center gap-1.5">
                {b}
              </span>
            </button>
          ))
        )}
      </div>
    </PopoverPrimitive.Content>
  )

  // Render static box with removable tags if there are selections, otherwise normal dropdown
  if (value !== "none" && value !== "all" && selectedList.length > 0) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 min-h-9 w-full rounded-md border border-input bg-background/50 p-1.5">
        {selectedList.map((b) => (
          <span
            key={b}
            className="inline-flex items-center gap-1 rounded bg-muted pl-2 pr-1 py-0.5 text-xs font-medium text-muted-foreground border border-border"
          >
            {b}
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleRemove(b)}
              className="rounded-full p-0.5 hover:bg-foreground/10 hover:text-foreground outline-none cursor-pointer"
            >
              <IconX className="size-3" />
            </button>
          </span>
        ))}

        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
          <PopoverPrimitive.Trigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="inline-flex h-6 items-center gap-1 rounded-md border border-dashed border-input bg-background px-2 text-[10px] font-semibold text-foreground hover:bg-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconPlus className="size-2.5" />
              Tambah
            </button>
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>{popoverContent}</PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      </div>
    )
  }

  // Fallback to standard dropdown trigger for none/all/empty states
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-[color,box-shadow] outline-none text-left cursor-pointer",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            (value === "none" || !value) && "text-muted-foreground"
          )}
        >
          <span className="truncate flex items-center gap-1.5">
            <IconBuildingStore className="size-3.5 shrink-0 text-muted-foreground" />
            {value === "all" ? "Semua Cabang (Super Auditor)" : "(Tidak ada cabang)"}
          </span>
          <IconChevronDown
            className={cn(
              "ml-2 size-3.5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>{popoverContent}</PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
